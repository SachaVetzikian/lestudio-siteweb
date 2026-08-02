import { defineField, defineType } from "sanity";

export const pageVille = defineType({
  name: "pageVille",
  title: "Page ville",
  type: "document",
  groups: [
    { name: "contenu", title: "Contenu", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "nom",
      title: "Nom de la ville",
      type: "string",
      group: "contenu",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "contenu",
      options: { source: "nom", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "zoneGeographique",
      title: "Zone géographique",
      type: "string",
      group: "contenu",
      description: 'Ex. "Île-de-France", "Auvergne-Rhône-Alpes".',
    }),
    defineField({
      name: "descriptionLocale",
      title: "Description locale",
      type: "text",
      rows: 4,
      group: "contenu",
      description:
        "Laisser vide pour l'instant : à remplir plus tard avec du contenu propre à cette ville.",
    }),
    defineField({
      name: "contenuUnique",
      title: "Contenu unique (vérifié)",
      type: "text",
      rows: 8,
      group: "contenu",
      description:
        "OBLIGATOIRE avant toute publication. Doit être un contenu rédigé et vérifié, réellement spécifique à cette ville — jamais un gabarit dupliqué d'une autre page ville. Sans ce champ rempli, le statut ne peut pas passer à \"Publié\" (voir la validation sur le champ Statut).",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { statut?: string } | undefined;
          if (doc?.statut === "publie" && (!value || String(value).trim().length < 200)) {
            return "Cette page ville ne peut pas être publiée sans un contenu unique et vérifié d'au moins 200 caractères, propre à cette ville (pas de contenu dupliqué).";
          }
          return true;
        }),
    }),
    defineField({
      name: "statut",
      title: "Statut",
      type: "string",
      group: "contenu",
      description:
        "Une page ville ne doit JAMAIS être publiée sans contenu local unique et vérifié dans le champ \"Contenu unique\", au risque de contenu dupliqué (duplicate content) pénalisant le SEO du site entier.",
      options: {
        list: [
          { title: "Brouillon", value: "brouillon" },
          { title: "Publié", value: "publie" },
        ],
        layout: "radio",
      },
      initialValue: "brouillon",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "nom", subtitle: "statut" },
  },
});
