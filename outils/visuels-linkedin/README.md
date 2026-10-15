# Visuels LinkedIn

Génère une série de 6 visuels LinkedIn (1080x1350 ou 1080x1080, rendu 2x) à partir d'un site en ligne :
captures au bon format, mise en scène, mockups photo, et contrôles automatiques (pas de déformation, pas de doublon).

Les règles éditoriales sont dans [REGLES.md](REGLES.md). À relire avant chaque nouvelle série.

## Installation (une fois)

```bash
cd outils/visuels-linkedin
npm install
npx playwright install chromium
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

## Générer une série

```bash
PYTHON=.venv/bin/python node lib/run.mjs projets/doxa.json
```

- Les visuels sortent dans `sortie/<projet>/visuels/` (dossier ignoré par git).
- `sortie/<projet>/planche.png` montre toute la série d'un coup d'œil, pour la relecture.
- `--sans-capture` : recompose sans refaire les captures (rapide, pour ajuster une mise en page).
- `--seulement desk,duo` : ne régénère que certains visuels.

La série est **refusée** avant tout rendu si une règle est violée : même capture utilisée deux fois,
même contenu visible deux fois (champ `montre`), même photo de fond, plus de 2 mockups photo, ou mockup photo réutilisé.

## Maquettes pleine page (1440 px et 2K)

```bash
node lib/maquettes.mjs projets/triumvirat.json            # toutes les pages desktop de la série
node lib/maquettes.mjs projets/triumvirat.json /leviers/seo  # pages au choix
```

Chaque page sort en entier dans `sortie/<projet>/maquettes/` : `-1440.png` (1440 px de large) et `-2k.png` (1440 px rendus en 2x, soit 2880 px).
Les visuels de la série sont déjà capturés en 2x (desktop) et 3x (mobile).

## Nouveau projet

Copier `projets/doxa.json` et l'adapter.

**`captures`** : ce qu'on photographie sur le site.

| Champ | Rôle |
|---|---|
| `page` | Chemin de la page (`/`, `/a-propos`...) |
| `appareil` | `desktop` (1440 px), `tablet` (834 px) ou `mobile` (393 px) |
| `hauteur` | Hauteur de fenêtre, si différente de l'appareil |
| `element` + `n` | Capture une seule section (sélecteur CSS, n-ième occurrence) |
| `defiler` + `aligner` + `decalage` | Fait défiler jusqu'à une section (`aligner: "bas"` = la section finit en bas de l'écran) |
| `survol` | Texte d'un lien de menu à survoler (menu déroulant ouvert) |
| `finirApres` + `marge` | Coupe la capture pile sous un élément |
| `masquerSous` | Masque ce qui suit un bloc dans sa colonne (zoom sur une zone) |
| `rogner` | `[haut, bas]` en px à retirer |
| `masquer` | Éléments à cacher (pop-up, chat, navbar collante) |
| `montre` | Étiquettes du contenu visible, pour le contrôle anti-doublon. **À remplir honnêtement**, y compris ce qui déborde. |

**`fonds`** : photos du client utilisées en fond flouté (URL de l'image sur le site).

**`visuels`** : la série. Gabarits disponibles :

| Gabarit | Usage | Champs |
|---|---|---|
| `vitrine` | Visuel 1 : navigateur coupé en haut, page qui déborde en bas (capture desktop haute, ~1900 px) | `ecran`, `fond`, `adresse` |
| `laptop3d` | Visuel 2 : laptop en perspective | `ecran`, `fond`, `rotation`, `inclinaison` |
| `brandkit` | Couleurs, polices, logo et boutons extraits du site, rendus avec ses vraies polices | `page`, `phrase` |
| `animation` | Chargement du hero en MP4 + GIF, dans la vitrine | `fond`, `adresse`, `hauteur`, `duree` |
| `macbook` | (interdit dans une série) MacBook de face | `ecran`, `fond` |
| `desk` | Fenêtre de navigateur, toujours entière (capturer avec `finirApres`) | `ecran`, `fond`, `adresse`, `carre` |
| `pile` | Deux sections de même largeur, empilées ou côte à côte | `ecrans` (2), `fond`, `sens` (`vertical`/`horizontal`), `ecart` |
| `section` | Une section seule, toujours entière (capturée en tablette de préférence) | `ecran`, `fond`, `largeur` |
| `duo` | Deux mobiles côte à côte | `ecrans` (2), `fond` |
| `photo` | Incrustation dans une photo de mockup | `mockup`, `ecran` |

`fond` : `studio` (sombre, couleurs du client), `clair`, ou le nom d'une photo déclarée dans `fonds`.

## Ajouter une photo de mockup

1. Déposer la photo dans `photos/` (3000 px minimum, écran entièrement visible, appareil incliné de 10° maximum).
2. L'ajouter dans `photos/catalogue.json` : appareil de capture, ratio de l'écran, rayon des coins, encoche,
   et soit `seed` (un point au milieu de l'écran, l'écran est détecté tout seul) soit `quad` (les 4 coins à la main).
3. Tester sur un projet et vérifier les coins de près.

Alterner les mockups d'un projet à l'autre : voir `REGLES.md`.
