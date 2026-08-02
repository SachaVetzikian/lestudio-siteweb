# LeStudio — site vitrine (Astro + Sanity)

Nouvelle stack du site : [Astro](https://astro.build) pour le frontend (rendu 100% statique / SSG) et [Sanity](https://www.sanity.io) comme CMS headless.

> Le dossier [`lestudio-cms/`](./lestudio-cms) contient l'ancienne stack (Eleventy + Decap CMS), conservée telle quelle. La nouvelle stack Astro + Sanity vit dans `site/` (frontend) et `studio/` (interface d'édition Sanity), en parallèle.

## Structure du repo

```
site/     → application Astro (frontend public, build statique)
studio/   → Sanity Studio (interface d'édition du contenu)
```

Les deux dossiers sont deux projets Node indépendants (chacun son `package.json`), reliés uniquement par le même projet Sanity (project ID + dataset).

## Prérequis

- Node.js 20+
- Un compte [sanity.io](https://www.sanity.io) et un projet Sanity créé (project ID + dataset). Si tu n'en as pas encore, crée-en un depuis [manage.sanity.io](https://manage.sanity.io) ou via `npx sanity init` dans `studio/`.

## 1. Lancer le Sanity Studio en local

```bash
cd studio
npm install
cp .env.example .env   # puis renseigne SANITY_STUDIO_PROJECT_ID et SANITY_STUDIO_DATASET
npm run dev
```

Le Studio est accessible sur `http://localhost:3333`. C'est ici que tu crées/édites les articles de blog, cas d'étude, réalisations et pages villes.

Autres commandes utiles :

- `npm run build` — build de production du Studio (pour un déploiement séparé, ex. hébergement Sanity)
- `npm run deploy` — déploie le Studio sur `*.sanity.studio`

## 2. Lancer le site Astro en local

```bash
cd site
npm install
cp .env.example .env   # puis renseigne les variables Sanity (voir ci-dessous)
npm run dev
```

Le site est accessible sur `http://localhost:4321`.

Autres commandes utiles :

- `npm run build` — build statique de production (`astro check` puis `astro build`), génère `site/dist/` et le `sitemap-index.xml`
- `npm run preview` — sert le build de production en local

## Variables d'environnement

Aucune valeur réelle n'est committée dans le code : chaque projet a un `.env.example` à copier en `.env` (fichier ignoré par git).

### `site/.env`

| Variable | Description |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | Project ID Sanity (visible dans manage.sanity.io) |
| `PUBLIC_SANITY_DATASET` | Nom du dataset (ex. `production`) |
| `PUBLIC_SANITY_API_VERSION` | Version de l'API Sanity utilisée (format `YYYY-MM-DD`) |
| `SANITY_API_READ_TOKEN` | Token API en lecture seule — requis uniquement si le dataset n'est pas public. À créer dans manage.sanity.io > API > Tokens |
| `PUBLIC_SITE_URL` | URL canonique du site en production, utilisée pour le sitemap et les balises SEO |

### `studio/.env`

| Variable | Description |
| --- | --- |
| `SANITY_STUDIO_PROJECT_ID` | Project ID Sanity (le même que côté site) |
| `SANITY_STUDIO_DATASET` | Nom du dataset (le même que côté site) |

## Modèles de contenu (Sanity Studio)

Définis dans `studio/schemaTypes/` :

- **`article`** — article de blog (titre, slug, date, auteur, image de couverture, extrait, contenu riche, tags, statut, SEO)
- **`etudeDeCas`** — cas d'étude client (titre, slug, client, problématique, solution, résultats chiffrés, images, témoignage, statut, SEO)
- **`realisation`** — réalisation (titre, slug, catégorie de service, description courte, images, lien externe, date, statut, SEO)
- **`pageVille`** — page ville (nom, slug, statut brouillon par défaut, zone géographique, description locale, contenu unique). **Ne doit jamais être publiée sans un contenu local unique et vérifié** — voir la description du champ dans le Studio. Le frontend Astro ne génère volontairement aucune route publique pour ce type tant que cette étape n'est pas faite.

Seul le contenu avec `statut = "publie"` est buildé côté Astro (routes, listes, sitemap). Le contenu en brouillon n'apparaît jamais en public.

## Déploiement

Non configuré pour le moment (à faire séparément, Cloudflare Pages ou Vercel). Build command pour le site : `npm run build` dans `site/`, dossier de sortie `site/dist/`.
