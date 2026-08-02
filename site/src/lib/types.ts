export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  asset: {
    _id: string;
    url: string;
  };
  alt?: string;
}

export interface Seo {
  metaTitre?: string;
  metaDescription?: string;
}

export interface PortableTextBlock {
  _type: string;
  [key: string]: unknown;
}

export interface Article {
  _id: string;
  _updatedAt: string;
  titre: string;
  slug: SanitySlug;
  datePublication: string;
  auteur?: string;
  imageCouverture?: SanityImage;
  extrait?: string;
  contenu?: PortableTextBlock[];
  tags?: string[];
  statut: "brouillon" | "publie";
  seo?: Seo;
}

export interface EtudeDeCasClient {
  nom: string;
  logo?: SanityImage;
  secteur?: string;
}

export interface Temoignage {
  nom?: string;
  role?: string;
  citation?: string;
}

export interface EtudeDeCas {
  _id: string;
  _updatedAt: string;
  titre: string;
  slug: SanitySlug;
  client?: EtudeDeCasClient;
  problematique?: string;
  solution?: string;
  resultats?: string[];
  images?: SanityImage[];
  temoignage?: Temoignage;
  statut: "brouillon" | "publie";
  seo?: Seo;
}

export interface Realisation {
  _id: string;
  _updatedAt: string;
  titre: string;
  slug: SanitySlug;
  categorieService?: string;
  descriptionCourte?: string;
  images?: SanityImage[];
  lienExterne?: string;
  date: string;
  statut: "brouillon" | "publie";
  seo?: Seo;
}

export interface PageVille {
  _id: string;
  nom: string;
  slug: SanitySlug;
  statut: "brouillon" | "publie";
  zoneGeographique?: string;
  descriptionLocale?: string;
  contenuUnique?: string;
  seo?: Seo;
}
