# Audit technique & SEO — lestudiodesign.fr

Date : 15 août 2026
Méthode : build de production (`npm run build`) + crawl statique des 56 pages générées dans `_site/` (parsing HTML : title, meta, canonical, Open Graph, H1, images, liens internes). L'accès réseau sortant vers `lestudiodesign.fr` était bloqué par la politique du sandbox de cette session (403 sur le proxy sortant) : impossible de vérifier ici les en-têtes HTTP réels, les redirections DNS www/non-www, ou de lancer Lighthouse/PageSpeed en direct. Tout ce qui suit est vérifié sur le code source et le build ; les points qui dépendent du serveur en production sont signalés comme tels.

## Résumé

56 pages générées, aucun lien interne cassé, structured data (JSON-LD) présent sur 51/56 pages, images en WebP déjà bien compressées. Le problème le plus sérieux est une **incohérence de domaine canonique** (www vs non-www) répétée sur presque toutes les pages, qui peut diluer le SEO. Viennent ensuite des balises title/meta description trop longues sur une quinzaine de pages, et un CSS/JS entièrement inline dupliqué sur chaque page (pas de mise en cache navigateur entre les pages).

---

## 1. Incohérence de domaine canonique (priorité haute)

Trois fichiers sources ne s'accordent pas sur le domaine canonique :

- `src/_includes/layouts/base.njk:11,17,18,22` → canonical, `og:url`, `og:image`, `twitter:image` pointent vers `https://www.lestudiodesign.fr...` (**avec www**)
- `src/sitemap.njk:6` → toutes les URLs du sitemap sont en `https://lestudiodesign.fr...` (**sans www**)
- `src/robots.txt:4` → `Sitemap: https://www.lestudiodesign.fr/sitemap.xml` (**avec www**, alors que le fichier sitemap contient des URLs sans www)

Conséquence concrète : 51 pages sur 56 ont un `<link rel="canonical">` en `www.` alors que le sitemap déclare la version non-www comme URL officielle. Si le domaine en production ne redirige pas proprement l'un vers l'autre (301 permanent, un seul sens), Google peut indexer les deux versions séparément et diluer l'autorité de la page.

**Action** : choisir une seule version canonique (www ou non-www), l'appliquer partout (base.njk, sitemap.njk, robots.txt), et vérifier côté hébergeur (Vercel/Netlify) qu'une redirection 301 permanente force l'autre version vers celle-ci.

## 2. Balises title / meta description trop longues (priorité moyenne)

Google tronque l'affichage au-delà d'environ 60 caractères pour le title et 155-160 pour la description — au-delà, le texte est coupé dans les résultats de recherche.

- **14 pages** avec un title > 60 caractères : tout le blog (6 articles, jusqu'à 86 car.), `/cas-clients/`, et 7 pages `/secteur/*`.
- **17 pages** avec une meta description > 160 caractères : homepage (161 car.), `/agence-ux-ui-design/`, les 4 pages villes restantes (bordeaux, clermont-ferrand, lyon, marseille — 177-191 car.), plusieurs pages secteur et articles de blog (jusqu'à 194 car.).

**Action** : raccourcir les `seo_title`/`seo_description` (ou `title`/`description`) dans les fichiers de contenu concernés (`src/content/blog/*.md`, `src/content/secteurs/*.md`, `src/content/villes/*.md`).

## 3. Pages légales incomplètes en SEO (priorité basse)

`/mentions-legales/` et `/confidentialite/` (fichiers `src/mentions-legales.html`, `src/confidentialite.html`) n'ont ni meta description, ni canonical, ni `og:title`/`og:image` — ces deux pages ne passent pas par `base.njk` et n'ont pas de front-matter `description`. Impact SEO faible (pages non stratégiques) mais facile à corriger pour la cohérence du site.

## 4. Page de vérification Google dans le sitemap (priorité basse)

`/google9a8a2c2d569b707e/` (fichier de vérification Search Console) est une page vide (pas de title, pas de H1, pas de charset/viewport) et elle est actuellement listée dans `sitemap.xml`. Ce n'est pas cassé, mais ce type de fichier ne devrait pas être soumis dans le sitemap ni indexable — il n'apporte aucun contenu et peut être compté comme page de faible qualité par Google. `src/sitemap.njk` exclut déjà `/merci/` et `/404.html` explicitement : ajouter ce chemin à la même liste d'exclusion.

## 5. Accessibilité — images sans `alt` (priorité moyenne)

Sur la page d'accueil (`src/index.njk`, bandeau de preuve sociale ~ligne 545), 5 photos clients empilées ("stacked avatars") ont `alt=""` et aucun `width`/`height` :

```html
<img src="/assets/uploads/photo-fatima-bouhelalem.webp" alt="" loading="lazy" style="width:34px;height:34px;...">
```

Ce sont des photos de personnes réelles utilisées comme preuve sociale, pas des éléments purement décoratifs : elles devraient avoir un `alt` (nom de la personne, ex. `alt="Fatima Bouhelalem"`) plutôt qu'un alt vide. L'absence de `width`/`height` cause aussi un micro risque de CLS (décalage de mise en page) au chargement, contrairement aux autres `<img>` du site qui les définissent systématiquement.

## 6. CSS/JS entièrement inline, dupliqué sur chaque page (priorité moyenne, perf)

`src/_includes/layouts/base.njk` inline directement dans le `<head>` de **chaque page** un bloc `<style>` d'environ 200 lignes (~8-9 Ko) plus plusieurs `<script>` de comportement (menu mobile, dropdown, footer reveal, widget Cal.com). Résultat : le CSS de base n'est jamais mis en cache par le navigateur entre deux pages du site — chaque navigation retélécharge et reparse le même CSS caché dans le HTML (homepage : 104 Ko de HTML brut, dont l'essentiel est CSS/JS répété). Le module React (`assets/react/react-islands.css/.js`) est lui bien externalisé et donc mis en cache correctement — le même traitement serait bénéfique pour le CSS de base.

**Action (optionnelle, gain de perf)** : extraire le `<style>` de `base.njk` vers un fichier `.css` externe versionné/hashé, chargé une fois et mis en cache pour toute la navigation.

## 7. Contenu très proche entre les pages "ville" (priorité moyenne, risque long terme)

Les 5 pages `/designer-ux-ui/{ville}/` (Paris, Lyon, Marseille, Bordeaux, Clermont-Ferrand) suivent un template avec 3 blocs "points" ; 2 des 3 textes sont strictement identiques mot pour mot d'une ville à l'autre (seul le 3ᵉ point et l'intro changent, ~170 mots uniques par page). C'est une pratique de SEO local programmatique courante, mais avec un niveau de différenciation aussi faible, Google peut les traiter comme du contenu proche/dupliqué ("doorway pages") si le volume de pages de ce type augmente. À surveiller si d'autres villes sont ajoutées (le README mentionne une décision à prendre sur "la page Paris").

## 8. Assets vidéo non utilisés mais présents dans le build (priorité basse)

`assets/uploads/temoignage-julien-roman.mp4` (2,6 Mo) et `temoignage-florian-piat.mp4` (1,1 Mo) sont dans le dossier uploads et donc copiés dans chaque déploiement, mais ne sont référencés dans aucune page actuellement générée — cohérent avec la tâche encore ouverte du README ("Uploader les vidéos témoignages ... puis publier"). Pas un bug, juste 3,7 Mo de poids de déploiement à publier ou nettoyer.

## 9. Pas d'en-têtes de sécurité configurés (priorité basse-moyenne)

`vercel.json` et `netlify.toml` ne définissent aucun en-tête HTTP (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Rien d'alarmant pour un site vitrine sans données sensibles, mais c'est une bonne pratique peu coûteuse à ajouter (bloc `headers` dans `vercel.json`).

---

## Points positifs constatés

- Aucun lien interne cassé sur les 56 pages crawlées.
- Tous les liens externes en `target="_blank"` ont `rel="noopener"` — pas de faille `window.opener`.
- `robots.txt` valide, autorise le crawl, bloque `/admin/`.
- `sitemap.xml` couvre bien les 52 pages indexables (homepage incluse), exclut correctement `/merci/`, `/404.html`, `/admin/*`.
- Anciennes URLs (`/audit-cro`, `/e-commerce`, etc.) proprement redirigées en 301 vers les nouvelles pages via `vercel.json`.
- JSON-LD (`ProfessionalService`) présent sur 51/56 pages.
- Images optimisées en WebP, poids raisonnable (quasi toutes < 100 Ko).
- `loading="lazy"` utilisé sur la majorité des images hors-écran.
- Menu mobile en bottom-sheet avec `aria-expanded`/`aria-hidden` correctement posés, `prefers-reduced-motion` respecté.

---

## Priorisation suggérée

1. **Cohérence canonique www/non-www** (base.njk, sitemap.njk, robots.txt + vérification de la redirection au niveau de l'hébergeur) — impact SEO le plus large, corrige 51 pages d'un coup.
2. **Titles/meta descriptions trop longs** — 14 + 17 pages, gain rapide sur le taux de clic dans les résultats de recherche.
3. **Alt text des photos clients sur la homepage** — accessibilité + CLS, correction ciblée sur ~5 lignes.
4. Pages légales (meta description/canonical), exclusion de la page de vérification Google du sitemap.
5. CSS externalisé, en-têtes de sécurité, nettoyage des vidéos non utilisées — améliorations à planifier, non bloquantes.
