module.exports = function (eleventyConfig) {
  // Fichiers copiés tels quels (site actuel + admin + assets)
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/static");

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

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
