const markdownIt = require("markdown-it");

const slugify = (text) =>
  (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

module.exports = function (eleventyConfig) {
  // Le contenu markdown du CMS s'affiche toujours dans une mise en page qui a
  // déjà son propre <h1> : on décale les titres Markdown d'un niveau (# -> h2)
  // pour qu'une page ne se retrouve jamais avec deux <h1>.
  const md = markdownIt({ html: true, linkify: true });
  md.core.ruler.push("bump-heading-levels", (state) => {
    for (const token of state.tokens) {
      if (token.type === "heading_open" || token.type === "heading_close") {
        const level = Math.min(parseInt(token.tag.slice(1), 10) + 1, 6);
        token.tag = "h" + level;
      }
    }
  });
  // Ajoute un id stable aux h2/h3 pour le sommaire (table des matières) des articles.
  md.core.ruler.push("heading-ids", (state) => {
    const seen = {};
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === "heading_open" && (token.tag === "h2" || token.tag === "h3")) {
        const inline = state.tokens[i + 1];
        const text = inline && inline.type === "inline" ? inline.content : "";
        let slug = slugify(text) || "section";
        if (seen[slug]) {
          seen[slug] += 1;
          slug = `${slug}-${seen[slug]}`;
        } else {
          seen[slug] = 1;
        }
        token.attrSet("id", slug);
      }
    }
  });
  eleventyConfig.setLibrary("md", md);

  // Fichiers copiés tels quels (site actuel + admin + assets)
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sacha-avatar.webp");

  // Collections
  eleventyConfig.addCollection("services", (c) =>
    c.getFilteredByGlob("src/content/services/*.md").sort((a, b) => a.data.order - b.data.order)
  );
  eleventyConfig.addCollection("temoignages", (c) =>
    c.getFilteredByGlob("src/content/temoignages/*.md")
      .filter((t) => t.data.published)
      .sort((a, b) => a.data.order - b.data.order)
  );
  eleventyConfig.addCollection("realisations", (c) =>
    c.getFilteredByGlob("src/content/realisations/*.md")
      .filter((r) => r.data.published)
      .sort((a, b) => b.data.year - a.data.year)
  );
  eleventyConfig.addCollection("secteurs", (c) =>
    c.getFilteredByGlob("src/content/secteurs/*.md").filter((s) => s.data.published)
  );
  eleventyConfig.addCollection("villes", (c) =>
    c.getFilteredByGlob("src/content/villes/*.md").filter((v) => v.data.published)
  );
  eleventyConfig.addCollection("faq", (c) =>
    c.getFilteredByGlob("src/content/faq/*.md").sort((a, b) => a.data.order - b.data.order)
  );
  eleventyConfig.addCollection("blog", (c) =>
    c.getFilteredByGlob("src/content/blog/*.md")
      .filter((p) => p.data.published)
      .sort((a, b) => b.date - a.date)
  );


  // Cas mis en avant sur la home
  eleventyConfig.addCollection("homeCases", (c) =>
    c.getFilteredByGlob("src/content/realisations/*.md")
      .filter((r) => r.data.published && r.data.featured)
      .sort((a, b) => (a.data.home_order || 99) - (b.data.home_order || 99))
  );

  // Conversion **mot** -> surlignage orange
  const hl = (q) => (q || "").replace(/\*\*(.+?)\*\*/g, '<span style="color:var(--orange);">$1</span>');

  eleventyConfig.addFilter("casesJson", (items) =>
    JSON.stringify(items.map((r) => ({
      name: r.data.client,
      slug: r.fileSlug,
      tag1: (r.data.tags || [])[0] || "",
      tag2: (r.data.tags || [])[1] || "",
      desc: r.data.description,
      video: r.data.video || "",
      type: r.data.type,
    })))
  );

  eleventyConfig.addFilter("temoignagesJson", (items) =>
    JSON.stringify(items.map((t) => ({
      client: t.data.tab_label || t.data.name,
      type: t.data.type === "video" ? "video" : "quote",
      initials: (t.data.name || "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      name: t.data.name,
      role: t.data.role,
      quote: hl(t.data.quote),
      video: t.data.video || "",
    })))
  );

  eleventyConfig.addFilter("faqJson", (items) =>
    JSON.stringify(items.map((f) => ({ q: f.data.question, a: f.data.reponse })))
  );

  // Filtre : réalisations d'un secteur donné
  eleventyConfig.addFilter("inSecteur", (realisations, slug) =>
    (realisations || []).filter((r) => r.data.secteur === slug)
  );

  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  eleventyConfig.addFilter("readableDate", (d) => {
    const date = new Date(d);
    return `${date.getUTCDate()} ${MOIS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  // Sommaire : extrait les h2/h3 (avec id) du HTML déjà rendu d'un article.
  eleventyConfig.addFilter("toc", (html) => {
    const matches = [...(html || "").matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)];
    return matches.map((m) => ({
      level: Number(m[1]),
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, ""),
    }));
  });

  // Temps de lecture estimé (~200 mots/minute) à partir du HTML rendu.
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = (html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
