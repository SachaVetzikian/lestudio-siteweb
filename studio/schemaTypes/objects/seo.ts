import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitre",
      title: "Meta-titre",
      type: "string",
      description: "Balise <title>. Idéalement 50-60 caractères.",
      validation: (Rule) => Rule.max(70).warning("Un meta-titre trop long peut être tronqué dans les résultats de recherche."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta-description",
      type: "text",
      rows: 3,
      description: "Balise meta description. Idéalement 140-160 caractères.",
      validation: (Rule) => Rule.max(180).warning("Une meta-description trop longue peut être tronquée dans les résultats de recherche."),
    }),
  ],
  options: { collapsible: true, collapsed: true },
});
