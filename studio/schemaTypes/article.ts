import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article de blog",
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
      name: "datePublication",
      title: "Date de publication",
      type: "datetime",
      group: "contenu",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "auteur",
      title: "Auteur",
      type: "string",
      group: "contenu",
    }),
    defineField({
      name: "imageCouverture",
      title: "Image de couverture",
      type: "image",
      group: "contenu",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Texte alternatif", type: "string" })],
    }),
    defineField({
      name: "extrait",
      title: "Extrait",
      type: "text",
      rows: 3,
      group: "contenu",
      description: "Court résumé utilisé dans les listes d'articles.",
    }),
    defineField({
      name: "contenu",
      title: "Contenu",
      type: "array",
      group: "contenu",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Texte alternatif", type: "string" })],
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "contenu",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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
    select: { title: "titre", subtitle: "statut", media: "imageCouverture" },
  },
});
