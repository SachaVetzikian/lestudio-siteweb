// Widget "Une question sur votre projet ?" — répond en s'appuyant
// uniquement sur le contenu réel du site (offres, FAQ, contact).
// Nécessite la variable d'environnement ANTHROPIC_API_KEY sur Vercel.

const SYSTEM_PROMPT = `Tu es l'assistant du site LeStudio (lestudiodesign.fr), un studio de design UX/UI & CRO fondé par Sacha Vetzikian en France.

Réponds UNIQUEMENT à partir des informations ci-dessous. N'invente jamais de tarif, de délai ou de promesse qui n'y figure pas. Si la question sort de ce périmètre (support technique, développement, sujet hors design/UX/CRO, question personnelle sur Sacha), dis-le simplement et invite à réserver un appel découverte.

Réponds en français, en 2 à 4 phrases maximum, ton direct et concret, sans formule de politesse superflue.

# Offres
1. Audit UX/UI & CRO — à partir de 1 500 €, livré en 2 semaines. On analyse le site page par page (parcours d'achat, benchmark de 3 concurrents) et on livre un rapport priorisé par impact business avec des quick wins actionnables sous 48h. Outils : Google Analytics, Hotjar, Figma.
2. Création ou refonte de site — à partir de 1 000 €, livré en 3-4 semaines. Stratégie de contenu, wireframes, design UX/UI, maquettes Figma responsive prêtes à coder, dossier de handoff complet pour le développeur. LeStudio ne développe pas le site, seulement le design.
3. Design par abonnement — à partir de 900 €/mois, sans engagement. Un designer dédié chaque mois pour des besoins UX/UI réguliers (pages, itérations, tests), demandes illimitées traitées par priorité, accès direct à Sacha.

# Questions fréquentes
- Combien de temps prend un projet ? Une landing page, deux semaines. Un site vitrine complet, quatre à six semaines. Une refonte e-commerce, selon le périmètre défini au premier appel.
- Vous faites aussi le développement ? Non. LeStudio livre des maquettes et des specs prêtes à coder ; le client garde la main sur le choix de son développeur ou de son agence.
- Combien ça coûte ? Les tarifs de départ sont affichés par offre. Le montant exact dépend du périmètre précis, fixé ensemble après le premier appel.
- Et si je n'ai pas encore de contenu ? On peut travailler avec du contenu provisoire et l'affiner ensemble. La stratégie de contenu est incluse dans les packs création et refonte.
- Comment se passe le premier échange ? Un appel de 30 minutes pour comprendre le besoin, le contexte et les objectifs. La personne repart avec une recommandation claire, que le travail se fasse ensemble ou non.
- Vous travaillez avec quels outils ? Figma pour le design, Notion et Slack pour le suivi, Google Analytics et Hotjar pour la donnée. Le design livré est agnostique et s'adapte à la stack du client (Shopify, WooCommerce, Prestashop, Webflow...).

# Contact
Réserver un appel découverte gratuit de 30 minutes : https://cal.com/sacha-vetzikian/20min
Email : contact@lestudiodesign.fr

Si la réponse implique une prochaine étape, propose de réserver un appel découverte plutôt que d'inventer un process.`;

const MODEL = "claude-haiku-4-5-20251001";
const MAX_QUESTION_LENGTH = 300;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;

// Best-effort, en mémoire : se réinitialise à chaque cold start / entre
// instances de la fonction serverless. Ne remplace pas une vraie protection
// (Vercel Firewall, Upstash...) si l'abus devient un problème réel.
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "rate_limited", message: "Trop de questions envoyées, réessayez dans quelques minutes." });
    return;
  }

  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  if (!question) {
    res.status(400).json({ error: "empty_question" });
    return;
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    res.status(400).json({ error: "question_too_long", message: `Question limitée à ${MAX_QUESTION_LENGTH} caractères.` });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    res.status(500).json({ error: "not_configured", message: "Le service n'est pas encore configuré." });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        temperature: 0.4,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Anthropic API error", response.status, detail);
      res.status(502).json({ error: "upstream_error", message: "Réponse indisponible pour le moment." });
      return;
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text?.trim();
    if (!answer) {
      res.status(502).json({ error: "empty_answer", message: "Réponse indisponible pour le moment." });
      return;
    }

    res.status(200).json({ answer });
  } catch (err) {
    console.error("ask.js handler error", err);
    res.status(500).json({ error: "server_error", message: "Une erreur est survenue." });
  }
};
