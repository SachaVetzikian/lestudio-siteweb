// Toutes les requêtes filtrent sur statut == "publie" : le contenu en
// brouillon n'est jamais buildé en page publique ni listé, et n'entre donc
// jamais dans le sitemap généré à partir des routes statiques.

const imageFragment = /* groq */ `{ asset->{ _id, url }, alt }`;

const seoFragment = /* groq */ `{ metaTitre, metaDescription }`;

export const articlesQuery = /* groq */ `
*[_type == "article" && statut == "publie"] | order(datePublication desc) {
  _id, _updatedAt, titre, slug, datePublication, auteur, extrait, tags,
  "imageCouverture": imageCouverture${imageFragment}
}`;

export const articleBySlugQuery = /* groq */ `
*[_type == "article" && statut == "publie" && slug.current == $slug][0] {
  _id, _updatedAt, titre, slug, datePublication, auteur, extrait, contenu, tags, statut,
  "imageCouverture": imageCouverture${imageFragment},
  seo${seoFragment}
}`;

export const articleSlugsQuery = /* groq */ `
*[_type == "article" && statut == "publie"].slug.current`;

export const etudesDeCasQuery = /* groq */ `
*[_type == "etudeDeCas" && statut == "publie"] | order(_updatedAt desc) {
  _id, _updatedAt, titre, slug, problematique,
  "client": client{ nom, secteur, "logo": logo${imageFragment} }
}`;

export const etudeDeCasBySlugQuery = /* groq */ `
*[_type == "etudeDeCas" && statut == "publie" && slug.current == $slug][0] {
  _id, _updatedAt, titre, slug, problematique, solution, resultats, statut,
  "client": client{ nom, secteur, "logo": logo${imageFragment} },
  "images": images[]${imageFragment},
  temoignage,
  seo${seoFragment}
}`;

export const etudeDeCasSlugsQuery = /* groq */ `
*[_type == "etudeDeCas" && statut == "publie"].slug.current`;

export const realisationsQuery = /* groq */ `
*[_type == "realisation" && statut == "publie"] | order(date desc) {
  _id, _updatedAt, titre, slug, categorieService, descriptionCourte, date,
  "images": images[]${imageFragment}
}`;

export const realisationBySlugQuery = /* groq */ `
*[_type == "realisation" && statut == "publie" && slug.current == $slug][0] {
  _id, _updatedAt, titre, slug, categorieService, descriptionCourte, lienExterne, date, statut,
  "images": images[]${imageFragment},
  seo${seoFragment}
}`;

export const realisationSlugsQuery = /* groq */ `
*[_type == "realisation" && statut == "publie"].slug.current`;
