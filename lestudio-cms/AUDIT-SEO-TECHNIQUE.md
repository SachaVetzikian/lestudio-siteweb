# Audit technique & SEO — lestudiodesign.fr

Date : 15 août 2026 (mis à jour après correctifs)
Méthode : build de production (`npm run build`) + crawl statique des 56 pages générées dans `_site/` (parsing HTML : title, meta, canonical, Open Graph, H1, images, liens internes). L'accès réseau sortant vers `lestudiodesign.fr` était bloqué par la politique du sandbox de cette session (403 sur le proxy sortant) : impossible de vérifier ici les en-têtes HTTP réels ou de lancer Lighthouse/PageSpeed en direct. Tout ce qui suit est vérifié sur le code source et le build.

## Résumé

Tous les points identifiés lors du premier passage ont été corrigés et revérifiés par un nouveau crawl (0 lien cassé, build propre, rendu visuel contrôlé sur homepage/à-propos/cas-clients). Il ne reste que des éléments non actionnables par nature (page admin CMS, fichier de vérification Google) et deux points laissés à une décision humaine (voir en bas).

---

## 1. ✅ Incohérence de domaine canonique — corrigé

`src/sitemap.njk` utilisait `https://lestudiodesign.fr` (sans www) alors que `base.njk` et `robots.txt` utilisaient `https://www.lestudiodesign.fr`. Le domaine `www.` étant très majoritaire dans le code (canonical, og:*, `admin/config.yml`, tous les liens absolus), c'est celui-ci qui a été retenu comme canonique. `sitemap.njk` a été aligné dessus. Les 56 pages ont désormais un canonical, un sitemap et un robots.txt cohérents sur `https://www.lestudiodesign.fr`.

**Reste à vérifier côté hébergeur** (Vercel/Netlify) : qu'une redirection 301 force bien `lestudiodesign.fr` → `www.lestudiodesign.fr` (ou l'inverse) au niveau DNS/domaine — ce point est hors du dépôt de code et n'a pas pu être vérifié depuis cette session (réseau sortant bloqué).

## 2. ✅ Titles / meta descriptions trop longs — corrigé (14 + 17 pages)

Ajout de champs `seo_title`/`seo_description` dédiés (sans toucher aux titres et textes visibles sur la page) pour : les 6 articles de blog, `/cas-clients/`, 7 pages secteur, `/agence-ux-ui-design/`, 5 pages villes, `/offres/audit-ux-ui-cro/`, et la homepage. Tous les titles sont maintenant ≤ 60 caractères et toutes les descriptions ≤ 160 caractères, longueur mesurée sur le HTML final (entités incluses).

**Bug annexe trouvé en corrigeant ce point** : `src/content/blog/blog.json` définissait un `eleventyComputed.seo_title`/`seo_description` qui écrasait inconditionnellement tout `seo_title`/`seo_description` renseigné dans le front-matter d'un article — mes premières modifications sur les articles de blog n'avaient donc aucun effet tant que ce fichier n'était pas corrigé pour respecter un fallback (`seo_title or title`). Corrigé, avec le même filet de sécurité appliqué à `realisations.json` par cohérence.

**Deuxième bug trouvé** : `villes.json`, `secteurs.json`, `services.json` et `blog.json` recalculaient `seo_title`/`seo_description` via un template Nunjucks sans filtre `| safe` — Nunjucks échappe alors les apostrophes en `&#39;` (5 caractères au lieu d'1), ce qui gonflait artificiellement la longueur des meta descriptions rendues. Ajout de `| safe` sur les 4 fichiers pour que le HTML final contienne de vraies apostrophes.

## 3. ✅ Pages légales incomplètes en SEO — corrigé

`mentions-legales.html` et `confidentialite.html` ont maintenant une meta description, un canonical et les balises `og:*` (title, description, url, image, type, site_name), sur le modèle de `base.njk`.

## 4. ✅ Page de vérification Google dans le sitemap — corrigé

`src/sitemap.njk` exclut désormais `/google9a8a2c2d569b707e/` de la même façon que `/merci/` et `/404.html`. La page elle-même reste volontairement sans title/H1/meta — c'est un fichier de vérification Search Console, pas une page de contenu, il n'a pas vocation à en avoir.

## 5. ✅ Accessibilité — images sans alt sur la homepage — corrigé

Les 5 photos clients du bandeau de preuve sociale (`src/index.njk`) avaient `alt=""` et aucune dimension. Elles ont maintenant un `alt` avec le nom et le rôle réel de chaque personne (retrouvés dans `src/content/temoignages/*.md` : Fatima Bouhelalem, Teddy Herbaut, Romain Morice, Matthieu C., Killian Olivier) ainsi que `width="34" height="34"`.

## 6. ✅ CSS entièrement inline, dupliqué sur chaque page — corrigé

Le bloc `<style>` de `base.njk` (~190 lignes) et celui, distinct, de la homepage (`index.njk`, ~420 lignes) ont été extraits vers deux fichiers externes et mis en cache navigateur :
- `src/static/css/base.css` — chargé par toutes les pages passant par `base.njk`
- `src/static/css/home.css` — spécifique à la homepage (qui a son propre design, pas de duplication avec base.css)

Gain mesuré sur le HTML brut : homepage 104 Ko → 68 Ko, `/a-propos/` 42 Ko → 24 Ko. Rendu visuel vérifié via capture d'écran (homepage, à-propos, cas-clients) : aucune régression.

## 7. ✅ Contenu très proche entre les pages "ville" — corrigé

Sur les 5 pages `/designer-ux-ui/{ville}/`, le 2ᵉ bloc "points" ("Un seul interlocuteur, pas d'agence") était strictement identique mot pour mot sur les 5 pages, et le 1ᵉʳ bloc était dupliqué sur 3 des 5 (Bordeaux, Clermont-Ferrand, Marseille). Chaque texte a été reformulé pour rester factuellement identique (même promesse : un seul interlocuteur, pas de commercial/chef de projet) mais avec une formulation propre à chaque page. Les 5 pages ont désormais un contenu entièrement distinct, sans invention de faits spécifiques à chaque ville.

## 8. Assets vidéo non utilisés — laissé en l'état (décision éditoriale)

`temoignage-julien-roman.mp4` (2,6 Mo) et `temoignage-florian-piat.mp4` (1,1 Mo) restent dans `assets/uploads/` sans être référencés dans aucune page, conformément à la tâche encore ouverte listée dans le `README.md` du projet ("Uploader les vidéos témoignages ... puis publier"). Publier ces témoignages est une décision de contenu qui revient à toi (validation du rendu, droit à l'image) — je n'ai pas voulu les intégrer ni les supprimer sans confirmation.

## 9. ✅ En-têtes de sécurité — ajoutés (partiellement, par prudence)

Ajout dans `vercel.json` de `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` et `Permissions-Policy` (désactive caméra/micro/géolocalisation, non utilisés par le site).

Je n'ai **pas** ajouté de `Content-Security-Policy` : le site charge des scripts tiers (widget de réservation Cal.com, Google Fonts) et je n'ai pas pu tester une CSP en conditions réelles (réseau sortant bloqué depuis cette session) — une CSP mal calibrée aurait pu casser silencieusement le bouton de réservation, qui est une fonctionnalité business critique. À faire dans un second temps, avec test manuel du parcours de réservation après chaque changement.

---

## Points positifs (déjà en place, non modifiés)

- Aucun lien interne cassé sur les 56 pages.
- Tous les liens externes `target="_blank"` ont `rel="noopener"`.
- `robots.txt` valide, bloque `/admin/`.
- Anciennes URLs redirigées en 301 via `vercel.json`.
- JSON-LD (`ProfessionalService`) présent sur la quasi-totalité des pages de contenu.
- Images optimisées en WebP, poids raisonnable.
- Les images de cartes (`.case-preview`) utilisent un conteneur avec `aspect-ratio` CSS : elles n'ont pas besoin d'attributs `width`/`height` pour éviter le CLS, la boîte est déjà réservée avant le chargement de l'image. Le crawler d'audit les signale par défaut (heuristique générique) mais ce n'est pas un vrai problème après vérification du CSS.

## Reste hors du périmètre du dépôt de code

- Vérifier manuellement, une fois déployé, que le domaine `www.` est bien celui qui répond en production (redirection DNS/hébergeur).
- Décider si/quand publier les témoignages vidéo Julien Roman et Florian Piat (point 8).
- Étudier une Content-Security-Policy après tests manuels du widget de réservation.
