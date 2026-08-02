import { defineField, defineType } from "sanity";

export const etudeDeCas = defineType({
  name: "etudeDeCas",
  title: "Cas d'étude",
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
      name: "client",
      title: "Client",
      type: "object",
      group: "contenu",
      fields: [
        defineField({ name: "nom", title: "Nom", type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "logo",
          title: "Logo",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Texte alternatif", type: "string" })],
        }),
        defineField({ name: "secteur", title: "Secteur", type: "string" }),
      ],
    }),
    defineField({
      name: "problematique",
      title: "Problématique",
      type: "text",
      rows: 4,
      group: "contenu",
    }),
    defineField({
      name: "solution",
      title: "Solution apportée",
      type: "text",
      rows: 4,
      group: "contenu",
    }),
    defineField({
      name: "resultats",
      title: "Résultats chiffrés",
      type: "array",
      group: "contenu",
      of: [{ type: "string" }],
      description: 'Ex. "+150% de trafic organique en 6 mois".',
    }),
    defineField({
      name: "images",
      title: "Images / captures",
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
      name: "temoignage",
      title: "Témoignage client",
      type: "object",
      group: "contenu",
      fields: [
        defineField({ name: "nom", title: "Nom", type: "string" }),
        defineField({ name: "role", title: "Rôle", type: "string" }),
        defineField({ name: "citation", title: "Citation", type: "text", rows: 3 }),
      ],
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
    select: { title: "titre", subtitle: "client.nom", media: "client.logo" },
  },
});
