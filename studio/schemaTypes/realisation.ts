import { defineField, defineType } from "sanity";

export const realisation = defineType({
  name: "realisation",
  title: "Réalisation",
  type: "document",
  groups: [
    { name: "contenu", title: "Contenu", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "titre",
      title: "Titre",
      type: "string",
      group: "contenu",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "contenu",
      options: { source: "titre", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categorieService",
      title: "Catégorie de service concernée",
      type: "string",
      group: "contenu",
      options: {
        list: [
          { title: "Audit UX/UI & CRO", value: "audit-ux-ui-cro" },
          { title: "Création / refonte de site", value: "creation-refonte-site" },
          { title: "Design en abonnement", value: "design-abonnement" },
        ],
      },
    }),
    defineField({
      name: "descriptionCourte",
      title: "Description courte",
      type: "text",
      rows: 3,
      group: "contenu",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      group: "contenu",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Texte alternatif", type: "string" })],
        },
      ],
    }),
    defineField({
      name: "lienExterne",
      title: "Lien externe",
      type: "url",
      group: "contenu",
      description: "Optionnel : lien vers le site ou projet livré.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      group: "contenu",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "statut",
      title: "Statut",
      type: "string",
      group: "contenu",
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
    select: { title: "titre", subtitle: "categorieService", media: "images.0" },
  },
});
