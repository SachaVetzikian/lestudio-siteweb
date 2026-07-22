# LeStudio · Site + CMS

Stack : Eleventy (build statique) + Decap CMS (admin sur /admin) + Netlify (hébergement + login).

## Mise en ligne (une fois, ~30 min)

1. **GitHub** : créer un repo privé `lestudio-site`, pousser ce dossier dessus (branche `main`).
2. **Netlify** : "Add new site" → "Import from Git" → choisir le repo. Build command et publish dir sont déjà dans `netlify.toml`, ne rien changer.
3. **Activer le login** : dans Netlify → Site configuration → Identity → "Enable Identity". Puis Identity → Services → "Enable Git Gateway".
4. **Créer ton compte** : Identity → "Invite users" → ton email. Tu reçois un mail, tu définis ton mot de passe.
5. **Verrouiller** : Identity → Registration → passer en "Invite only". Sinon n'importe qui peut créer un compte admin.
6. **Domaine** : Domain management → ajouter lestudiodesign.fr.

Accès admin ensuite : **lestudiodesign.fr/admin** → login → tu édites tout.

## Ce que tu peux éditer dans l'admin

- **Réglages** : email, téléphone, WhatsApp, lien RDV, réseaux, chiffres de preuve (un seul endroit, plus jamais d'incohérence)
- **Services** : les 3 packs (prix, inclus, outils)
- **Témoignages** : texte ou vidéo, avec un interrupteur "Publié". Julien Roman, Florian Piat et Disney sont déjà créés en brouillon (non publiés)
- **Réalisations** : les 9 cas (8 e-commerce + Triumvirat vitrine), reliables à un secteur
- **Pages secteurs** : chaque fiche génère automatiquement une page /secteur/{slug}/ avec SEO + cas clients du secteur injectés. Cosmétiques et Compléments alimentaires sont prêts en brouillon
- **FAQ** : les 6 questions
- **Blog** : prêt, vide

## Développement local

```
npm install
npm start        # serveur local sur http://localhost:8080
```

## À faire (par ordre)

1. Vérifier le numéro de téléphone : 06 65 **70** 42 20 (Framer) ou 06 65 **07** 42 20 (wa.me actuel) ? Corriger dans Réglages.
2. Uploader les vidéos témoignages (Julien Roman, Florian Piat) récupérées du Framer dans l'admin, puis publier.
3. Brancher la homepage sur les données du CMS (phase 2) : aujourd'hui index.html est encore autonome, les témoignages/packs y sont en dur.
4. Valider et publier les 2 pages secteurs, puis en créer d'autres (parfumerie, mode, BTP...).
5. Décider de la page Paris.
