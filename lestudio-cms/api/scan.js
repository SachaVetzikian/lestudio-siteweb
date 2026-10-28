// Scanner de site gratuit (page /scanner/) : analyse la homepage d'un site,
// sa visibilité dans les IA, son blog, sa vitesse et ses pages clés, puis
// renvoie un score sur 100 et des recommandations. Aucune dépendance.
// Variable d'environnement optionnelle : PSI_API_KEY (Google PageSpeed
// Insights). Sans elle, la vitesse est estimée à partir du temps de réponse.

const dns = require("dns").promises;
const net = require("net");

const FETCH_TIMEOUT_MS = 8000;
const PSI_TIMEOUT_MS = 45000;
const MAX_BYTES = 1500000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const UA = "Mozilla/5.0 (compatible; LeStudioScanner/1.0; +https://www.lestudiodesign.fr/scanner/)";

const AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "PerplexityBot", "Google-Extended", "CCBot"];

// Best-effort, en mémoire (même logique que api/ask.js).
const hits = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168.");
}

// Refuse tout ce qui pointe vers le réseau interne (protection SSRF).
async function assertPublicHost(hostname) {
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(hostname)) throw new Error("blocked_host");
  const addresses = net.isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) throw new Error("blocked_host");
}

function normalizeUrl(input) {
  let raw = (input || "").trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    if (!u.hostname.includes(".")) return null;
    return u;
  } catch (e) {
    return null;
  }
}

async function fetchText(url, { maxBytes = MAX_BYTES, timeout = FETCH_TIMEOUT_MS } = {}) {
  const u = new URL(url);
  await assertPublicHost(u.hostname);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const started = Date.now();
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xml,text/plain,*/*" }, redirect: "follow", signal: controller.signal });
    const ttfb = Date.now() - started;
    const reader = res.body?.getReader();
    let received = 0;
    const chunks = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > maxBytes) {
          controller.abort();
          break;
        }
        chunks.push(value);
      }
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
    return { ok: res.ok, status: res.status, url: res.url, text, bytes: received, ttfb, total: Date.now() - started };
  } catch (e) {
    return { ok: false, status: 0, url, text: "", bytes: 0, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

const stripTags = (s) => (s || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const firstMatch = (re, s) => {
  const m = re.exec(s);
  return m ? m[1].trim() : "";
};

function detectStack(html, headers = "") {
  const h = html.toLowerCase();
  if (h.includes("data-wf-site") || h.includes("webflow.js") || h.includes("assets.website-files.com") || h.includes("cdn.prod.website-files.com")) return "Webflow";
  if (h.includes("framerusercontent.com") || h.includes("framer.com/m/") || h.includes('name="generator" content="framer')) return "Framer";
  if (h.includes("/wp-content/") || h.includes("/wp-includes/") || h.includes('content="wordpress')) return "WordPress";
  if (h.includes("cdn.shopify.com") || h.includes("shopify.theme")) return "Shopify";
  if (h.includes("static.wixstatic.com") || h.includes("wix.com")) return "Wix";
  if (h.includes("squarespace.com")) return "Squarespace";
  if (h.includes("hs-scripts.com") && h.includes("hubspot") && h.includes("hs-sites")) return "HubSpot CMS";
  if (h.includes("/_next/") || h.includes("__next_data__")) return "Next.js (sur-mesure)";
  if (h.includes("/_astro/")) return "Astro (sur-mesure)";
  if (h.includes("/_nuxt/")) return "Nuxt (sur-mesure)";
  return "Non identifiée";
}

function countWpPlugins(html) {
  const set = new Set();
  const re = /\/wp-content\/plugins\/([a-z0-9_-]+)\//gi;
  let m;
  while ((m = re.exec(html))) set.add(m[1].toLowerCase());
  return set.size;
}

function extractLinks(html, base) {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], base);
      links.push({ href: u.href, path: u.pathname.toLowerCase(), host: u.hostname, text: stripTags(m[2]).toLowerCase().slice(0, 120), index: m.index });
    } catch (e) {}
  }
  return links;
}

function parseSitemap(xml) {
  const entries = [];
  const re = /<url>([\s\S]*?)<\/url>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const loc = firstMatch(/<loc>\s*([^<]+?)\s*<\/loc>/i, m[1]);
    const lastmod = firstMatch(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i, m[1]);
    if (loc) entries.push({ loc, lastmod });
  }
  const children = [];
  const re2 = /<sitemap>([\s\S]*?)<\/sitemap>/gi;
  while ((m = re2.exec(xml))) {
    const loc = firstMatch(/<loc>\s*([^<]+?)\s*<\/loc>/i, m[1]);
    if (loc) children.push(loc);
  }
  return { entries, children };
}

async function collectSitemap(origin, robotsTxt) {
  const candidates = new Set();
  (robotsTxt.match(/^\s*sitemap:\s*(\S+)/gim) || []).forEach((l) => candidates.add(l.replace(/^\s*sitemap:\s*/i, "").trim()));
  candidates.add(origin + "/sitemap.xml");
  candidates.add(origin + "/sitemap_index.xml");
  const entries = [];
  const seen = new Set();
  for (const url of candidates) {
    if (seen.has(url)) continue;
    seen.add(url);
    const r = await fetchText(url, { maxBytes: 3000000 });
    if (!r.ok || !r.text.includes("<")) continue;
    const parsed = parseSitemap(r.text);
    entries.push(...parsed.entries);
    // Index de sitemaps : on lit en priorité les sous-sitemaps d'articles.
    const children = parsed.children.sort((a, b) => Number(/post|blog|article|ressource|resource|news/i.test(b)) - Number(/post|blog|article|ressource|resource|news/i.test(a))).slice(0, 5);
    for (const child of children) {
      if (seen.has(child)) continue;
      seen.add(child);
      const c = await fetchText(child, { maxBytes: 3000000 });
      if (c.ok) entries.push(...parseSitemap(c.text).entries);
    }
    if (entries.length) break;
  }
  return entries;
}

const BLOG_RE = /\/(blog|articles?|ressources|resources|actualites|actus|news|insights|guides?|magazine|journal)(\/|$)/i;

// Dates de publication lues sur la page blog (balises <time>, JSON-LD, dates écrites).
const MONTHS = { janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11, january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11, jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
function extractDates(html) {
  const dates = [];
  const push = (d) => {
    if (!isNaN(d) && d < Date.now() + 86400000 && d > Date.parse("2010-01-01")) dates.push(d);
  };
  let m;
  const r1 = /(?:datetime|"datePublished"|"dateCreated")\s*[=:]\s*["'](\d{4}-\d{2}-\d{2}[^"']*)["']/gi;
  while ((m = r1.exec(html))) push(Date.parse(m[1]));
  const text = stripTags(html).toLowerCase();
  const r2 = /\b(\d{1,2})(?:er)?\s+([a-zéû]{3,9})\.?\s+(20\d{2})\b/g;
  while ((m = r2.exec(text))) if (MONTHS[m[2]] !== undefined) push(Date.UTC(+m[3], MONTHS[m[2]], +m[1]));
  const r3 = /\b([a-z]{3,9})\.?\s+(\d{1,2}),\s+(20\d{2})\b/g;
  while ((m = r3.exec(text))) if (MONTHS[m[1]] !== undefined) push(Date.UTC(+m[3], MONTHS[m[1]], +m[2]));
  return dates;
}

function analyzeBlog(entries, links, blogHtml) {
  const blogEntries = entries.filter((e) => {
    try {
      const p = new URL(e.loc).pathname;
      const m = p.match(BLOG_RE);
      return m && p.replace(/\/$/, "").length > m.index + m[0].replace(/\/$/, "").length;
    } catch (e2) {
      return false;
    }
  });
  const hasBlogLink = links.some((l) => BLOG_RE.test(l.path));
  let dates = blogEntries.map((e) => Date.parse(e.lastmod)).filter((d) => !isNaN(d));
  // Beaucoup de sitemaps régénèrent toutes les dates à chaque build : dans ce
  // cas elles ne disent rien de la publication, on préfère la page blog.
  const sameDay = dates.length ? Math.max(...Object.values(dates.reduce((acc, d) => ((acc[new Date(d).toISOString().slice(0, 10)] = (acc[new Date(d).toISOString().slice(0, 10)] || 0) + 1), acc), {}))) : 0;
  const pageDates = blogHtml ? extractDates(blogHtml) : [];
  let source = "sitemap";
  if (pageDates.length >= 2 || (dates.length >= 5 && sameDay / dates.length > 0.5)) {
    dates = pageDates;
    source = pageDates.length ? "page blog" : "inconnue";
  }
  dates.sort((a, b) => b - a);
  const now = Date.now();
  const last = dates[0] || null;
  const in90 = dates.filter((d) => now - d < 90 * 86400000).length;
  return {
    exists: hasBlogLink || blogEntries.length > 0,
    posts: blogEntries.length,
    lastUpdate: last ? new Date(last).toISOString().slice(0, 10) : null,
    daysSinceLast: last ? Math.round((now - last) / 86400000) : null,
    updatedLast90: in90,
    dateSource: source,
  };
}

const KEY_PAGES = [
  { key: "tarifs", label: "Page tarifs", reco: "Créer une page tarifs, même avec des fourchettes : c'est la page la plus visitée par un acheteur B2B.", re: /(pricing|tarif|prix|plans?)(\/|$|-)/i, text: /tarif|prix|pricing|plans/, weight: 4 },
  { key: "demo", label: "Page démo ou contact", reco: "Créer une page dédiée à la demande de démo, avec un formulaire court ou un agenda.", re: /(demo|démo|contact|rendez-vous|book|essai|trial|signup|inscription)/i, text: /démo|demo|contact|essai|essayer|rendez-vous/, weight: 4 },
  { key: "clients", label: "Cas clients ou témoignages", reco: "Créer des pages cas clients avec des résultats chiffrés.", re: /(clients?|customers?|cas-clients?|case-stud|temoignages?|references?|success)/i, text: /clients|témoignages|cas client|références|customers/, weight: 4 },
  { key: "integrations", label: "Page intégrations", reco: "Créer une page intégrations, très recherchée par les acheteurs SaaS.", re: /(integrations?|integracoes|connecteurs?|marketplace|apps)(\/|$)/i, text: /intégration|integration|connecteur/, weight: 2 },
  { key: "securite", label: "Page sécurité / RGPD", reco: "Créer une page sécurité et RGPD pour lever les freins des grands comptes.", re: /(securite|security|rgpd|gdpr|trust|conformite)/i, text: /sécurité|security|rgpd|gdpr/, weight: 2 },
  { key: "comparatifs", label: "Pages comparatifs (vs / alternative)", reco: "Créer des pages « Alternative à X » et « X vs Y » : elles captent des acheteurs prêts à choisir.", re: /(-vs-|\/vs\/|alternative|comparatif|compare)/i, text: /alternative|comparatif| vs /, weight: 2 },
  { key: "usecases", label: "Pages cas d'usage / solutions", reco: "Créer une page par cas d'usage ou par secteur, chacune avec ses mots et ses exemples.", re: /(solutions?|use-cases?|cas-d-usage|metiers|secteurs?|industries?)(\/|$)/i, text: /solutions|cas d'usage|use case|secteurs/, weight: 2 },
];

function analyzeKeyPages(entries, links, origin) {
  const internal = links.filter((l) => {
    try {
      return new URL(l.href).hostname.replace(/^www\./, "") === new URL(origin).hostname.replace(/^www\./, "");
    } catch (e) {
      return false;
    }
  });
  const paths = entries.map((e) => {
    try {
      return new URL(e.loc).pathname.toLowerCase();
    } catch (e2) {
      return "";
    }
  });
  return KEY_PAGES.map((p) => {
    const found = paths.some((x) => p.re.test(x)) || internal.some((l) => p.re.test(l.path) || p.text.test(l.text));
    return { key: p.key, label: p.label, found, weight: p.weight, reco: p.reco };
  });
}

function analyzeHomepage(html, links) {
  const head = firstMatch(/<head[^>]*>([\s\S]*?)<\/head>/i, html) || html.slice(0, 20000);
  const title = stripTags(firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, head));
  const description = firstMatch(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, head) || firstMatch(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, head);
  const h1s = [];
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let m;
  while ((m = re.exec(html))) h1s.push(stripTags(m[1]));
  const body = html.slice(html.search(/<body/i) > -1 ? html.search(/<body/i) : 0);
  const bodyStart = html.length - body.length;
  // "Au-dessus de la ligne de flottaison" approximé par le premier quart du HTML du body.
  const foldLimit = bodyStart + Math.max(body.length * 0.25, 15000);
  const ctaRe = /(démo|demo|essai gratuit|essayer|free trial|start free|book a|réserver|prendre rendez-vous|parler à un expert|commencer gratuitement|get started|demander)/i;
  const ctaAbove = links.some((l) => l.index < foldLimit && ctaRe.test(l.text)) || /<button[^>]*>[^<]*(démo|demo|essai|essayer|réserver)/i.test(html.slice(0, foldLimit));
  const text = stripTags(body).toLowerCase();
  const socialProof = /(ils nous font confiance|nos clients|ils nous ont choisi|trusted by|loved by|used by|join(ed)? (by )?[\d,.]+|our customers|témoignage|avis clients|ils parlent de nous|\+ ?\d[\d\s.,k]* (clients|entreprises|utilisateurs|companies|teams|users)|★|g2|capterra|trustpilot)/i.test(text) || (html.match(/<img[^>]+(class|alt|src)=["'][^"']*(logo|client|customer)[^"']*["']/gi) || []).length >= 4;
  const pricingLink = links.some((l) => /pricing|tarif|prix/.test(l.path) || /tarif|prix|pricing/.test(l.text));
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return { title, description, h1: h1s[0] || "", h1Count: h1s.length, ctaAbove, socialProof, pricingLink, wordCount };
}

function analyzeAi(html, robotsTxt, llmsOk) {
  const blocked = [];
  const groups = robotsTxt.split(/(?=^\s*user-agent:)/gim);
  for (const g of groups) {
    const agents = (g.match(/^\s*user-agent:\s*(.+)$/gim) || []).map((l) => l.replace(/^\s*user-agent:\s*/i, "").trim().toLowerCase());
    const disallowAll = /^\s*disallow:\s*\/\s*$/im.test(g);
    if (!disallowAll) continue;
    AI_BOTS.forEach((b) => {
      if (agents.includes(b.toLowerCase())) blocked.push(b);
    });
  }
  const jsonLd = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const types = m[1].match(/"@type"\s*:\s*"([^"]+)"/g) || [];
    types.forEach((t) => jsonLd.push(t.replace(/"@type"\s*:\s*"/, "").replace(/"$/, "")));
  }
  const hasOrgSchema = jsonLd.some((t) => /Organization|SoftwareApplication|Product|LocalBusiness|WebSite/i.test(t));
  const hasFaq = jsonLd.some((t) => /FAQPage/i.test(t)) || /(questions fréquentes|faq|foire aux questions)/i.test(stripTags(html).slice(0, 200000));
  return { llmsTxt: llmsOk, blockedBots: [...new Set(blocked)], schemaTypes: [...new Set(jsonLd)].slice(0, 8), hasOrgSchema, hasFaq };
}

async function runPsi(url) {
  const key = process.env.PSI_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS);
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
    const res = await fetch(api, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const lh = data.lighthouseResult;
    const score = lh?.categories?.performance?.score;
    if (typeof score !== "number") return null;
    const a = lh.audits || {};
    return {
      score: Math.round(score * 100),
      lcp: a["largest-contentful-paint"]?.displayValue || null,
      cls: a["cumulative-layout-shift"]?.displayValue || null,
      tbt: a["total-blocking-time"]?.displayValue || null,
    };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function scoreAll({ home, ai, blog, speed, pages, stack, plugins }) {
  const checks = [];
  const add = (section, label, ok, points, max, reco) => checks.push({ section, label, ok, points: ok ? max : points, max, reco: ok ? null : reco });

  add("homepage", "Balise title présente", !!home.title, 0, 3, "Ajouter une balise title qui dit ce que fait le produit et pour qui.");
  add("homepage", "Meta description présente", !!home.description, 0, 3, "Écrire une meta description de 140 à 160 caractères, c'est le texte repris par Google et souvent par les IA.");
  add("homepage", "Un seul H1 clair", home.h1Count === 1, home.h1Count > 1 ? 1 : 0, 4, home.h1Count === 0 ? "Ajouter un H1 qui énonce la promesse principale." : "Garder un seul H1 sur la homepage, les autres titres en H2.");
  add("homepage", "Appel à l'action (démo / essai) visible tout de suite", home.ctaAbove, 0, 8, "Mettre un bouton « Réserver une démo » ou « Essai gratuit » dans le premier écran, c'est le levier de conversion n°1 d'un site SaaS.");
  add("homepage", "Preuve sociale (logos, avis, chiffres)", home.socialProof, 0, 4, "Afficher des logos clients ou des avis dès le haut de la homepage.");
  add("homepage", "Lien vers les tarifs depuis la homepage", home.pricingLink, 0, 3, "Rendre les tarifs accessibles depuis la homepage, même avec un « à partir de ».");

  add("ia", "Fichier llms.txt", ai.llmsTxt, 0, 5, "Publier un fichier /llms.txt qui résume l'offre pour ChatGPT, Claude et Perplexity.");
  add("ia", "Robots IA autorisés", ai.blockedBots.length === 0, 0, 5, `Débloquer les robots IA dans le robots.txt (${ai.blockedBots.join(", ")}), sinon le site est invisible dans leurs réponses.`);
  add("ia", "Données structurées (schema.org)", ai.hasOrgSchema, 0, 5, "Ajouter des données structurées schema.org (Organization, SoftwareApplication) pour que les IA comprennent qui vous êtes.");
  add("ia", "FAQ présente", ai.hasFaq, 0, 5, "Ajouter une FAQ qui répond aux vraies questions des acheteurs, c'est le format le plus repris par les IA.");

  add("blog", "Blog présent", blog.exists, 0, 5, "Lancer un blog : chaque article est une porte d'entrée de plus sur Google et dans les IA.");
  if (blog.exists && blog.daysSinceLast === null) {
    // Dates illisibles : on ne conclut pas que le blog est à l'arrêt.
    checks.push({ section: "blog", label: "Fréquence de publication non mesurable automatiquement", ok: null, points: 5, max: 10, reco: null });
  } else {
    const fresh = blog.daysSinceLast !== null && blog.daysSinceLast <= 30;
    const semi = blog.daysSinceLast !== null && blog.daysSinceLast <= 90;
    add("blog", "Contenu publié ce mois-ci", fresh, semi ? 3 : 0, 5, blog.exists ? `Le blog semble à l'arrêt (dernier contenu il y a ${blog.daysSinceLast} jours) : viser au moins 2 articles par mois.` : null);
    add("blog", "Rythme régulier (4+ contenus sur 90 jours)", blog.updatedLast90 >= 4, blog.updatedLast90 >= 1 ? 2 : 0, 5, blog.exists ? "Publier à un rythme régulier, 4 contenus par trimestre au minimum." : null);
  }

  if (speed.psi) {
    const pts = Math.round((speed.psi.score / 100) * 20);
    add("vitesse", `Performance mobile Google : ${speed.psi.score}/100`, speed.psi.score >= 90, pts, 20, `Améliorer la vitesse mobile (score Google ${speed.psi.score}/100${speed.psi.lcp ? `, affichage principal en ${speed.psi.lcp}` : ""}).`);
  } else {
    const ttfbOk = speed.ttfb !== null && speed.ttfb < 800;
    const ttfbMid = speed.ttfb !== null && speed.ttfb < 1600;
    add("vitesse", `Temps de réponse du serveur${speed.ttfb !== null ? ` : ${speed.ttfb} ms` : ""}`, ttfbOk, ttfbMid ? 6 : 0, 12, "Réduire le temps de réponse du serveur (hébergement, cache, CDN).");
    const weightOk = speed.htmlKb !== null && speed.htmlKb < 250;
    add("vitesse", `Poids du HTML${speed.htmlKb !== null ? ` : ${speed.htmlKb} Ko` : ""}`, weightOk, speed.htmlKb !== null && speed.htmlKb < 600 ? 4 : 0, 8, "Alléger la page (scripts, builders, plugins inutiles).");
  }

  pages.forEach((p) => add("pages", p.label, p.found, 0, p.weight, p.reco));

  if (stack === "WordPress") {
    checks.push({ section: "homepage", label: `Site sous WordPress${plugins ? ` (${plugins} plugins détectés en façade)` : ""}`, ok: null, points: 0, max: 0, reco: "Sur WordPress, chaque modification passe souvent par un dev ou un plugin. Webflow ou Framer rendent l'équipe marketing autonome sur ses pages." });
  }

  const sections = { homepage: "Homepage", ia: "Visibilité IA", blog: "Blog", vitesse: "Vitesse", pages: "Pages clés" };
  const summary = Object.entries(sections).map(([key, label]) => {
    const list = checks.filter((c) => c.section === key && c.max > 0);
    const got = list.reduce((s, c) => s + c.points, 0);
    const max = list.reduce((s, c) => s + c.max, 0);
    return { key, label, score: got, max };
  });
  const total = summary.reduce((s, x) => s + x.score, 0);
  const max = summary.reduce((s, x) => s + x.max, 0);
  const recos = checks
    .filter((c) => c.reco && c.ok !== true)
    .sort((a, b) => b.max - b.points - (a.max - a.points))
    .map((c) => c.reco);
  return { score: Math.round((total / max) * 100), sections: summary, checks, recos: [...new Set(recos)].slice(0, 6) };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "rate_limited", message: "Trop d'analyses lancées, réessayez dans quelques minutes." });
    return;
  }
  const target = normalizeUrl(typeof req.body?.url === "string" ? req.body.url : "");
  if (!target) {
    res.status(400).json({ error: "invalid_url", message: "Cette adresse ne ressemble pas à un site web." });
    return;
  }

  try {
    await assertPublicHost(target.hostname);
  } catch (e) {
    res.status(400).json({ error: "invalid_url", message: "Site introuvable : vérifiez l'adresse." });
    return;
  }

  try {
    const homeUrl = target.origin + (target.pathname || "/");
    const psiPromise = runPsi(homeUrl);
    const homeRes = await fetchText(homeUrl);
    if (!homeRes.ok || !homeRes.text) {
      res.status(422).json({ error: "unreachable", message: "Le site ne répond pas ou bloque les analyses automatiques." });
      return;
    }
    const origin = new URL(homeRes.url).origin;
    const [robotsRes, llmsRes] = await Promise.all([fetchText(origin + "/robots.txt", { maxBytes: 200000 }), fetchText(origin + "/llms.txt", { maxBytes: 200000 })]);
    const robotsTxt = robotsRes.ok ? robotsRes.text : "";
    const llmsOk = llmsRes.ok && llmsRes.text.length > 20 && !/<html/i.test(llmsRes.text.slice(0, 500));

    const html = homeRes.text;
    const links = extractLinks(html, homeRes.url);
    const entries = await collectSitemap(origin, robotsTxt);
    const stack = detectStack(html);
    const plugins = stack === "WordPress" ? countWpPlugins(html) : 0;
    const home = analyzeHomepage(html, links);
    const ai = analyzeAi(html, robotsTxt, llmsOk);
    const blogLink = links.find((l) => BLOG_RE.test(l.path) && new URL(l.href).origin === origin && l.path.replace(/\/$/, "").split("/").length <= 3);
    const blogPage = blogLink ? await fetchText(blogLink.href) : null;
    const blog = analyzeBlog(entries, links, blogPage?.ok ? blogPage.text : "");
    const pages = analyzeKeyPages(entries, links, origin);
    const psi = await psiPromise;
    const speed = { psi, ttfb: homeRes.ttfb ?? null, htmlKb: Math.round(homeRes.bytes / 1024) };
    const result = scoreAll({ home, ai, blog, speed, pages, stack, plugins });

    res.status(200).json({
      url: homeRes.url,
      scannedAt: new Date().toISOString(),
      stack,
      plugins,
      ...result,
      details: { home, ai, blog, speed, pages, sitemapUrls: entries.length },
    });
  } catch (err) {
    console.error("scan.js handler error", err);
    res.status(500).json({ error: "server_error", message: "L'analyse a échoué, réessayez dans un instant." });
  }
};

module.exports.scoreAll = scoreAll;
