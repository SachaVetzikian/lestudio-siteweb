// Génère la série de visuels LinkedIn d'un projet.
// Usage : node lib/run.mjs projets/doxa.json [--sans-capture] [--seulement nom1,nom2]
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { chromium, capturer, telecharger } from './capture.mjs';
import { GABARITS, page } from './compose.mjs';
import { brandkit, animation, scrollPhoto } from './extras.mjs';

const RACINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const site = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const sansCapture = args.includes('--sans-capture');
const seulement = args.includes('--seulement') ? args[args.indexOf('--seulement') + 1].split(',') : null;
const catalogue = JSON.parse(fs.readFileSync(`${RACINE}/photos/catalogue.json`, 'utf8'));
const dossier = path.join(RACINE, 'sortie', site.nom), CAP = `${dossier}/captures`, VIS = `${dossier}/visuels`;
fs.mkdirSync(CAP, { recursive: true }); fs.mkdirSync(VIS, { recursive: true });

// ---------- 1. Contrôles avant rendu (REGLES.md) ----------
const erreurs = [];
const ecransDe = v => v.ecrans || (v.ecran ? [v.ecran] : []);
const vus = {}, fondsVus = {}, montres = {};
// les variantes (propositions alternatives) sont contrôlées contre la série, pas entre elles
const principaux = site.visuels.filter(v => !v.variante), variantes = site.visuels.filter(v => v.variante);
for (const v of [...principaux, ...variantes]) {
  const prov = v.variante ? { ...vus } : null, provM = v.variante ? { ...montres } : null, provF = v.variante ? { ...fondsVus } : null;
  for (const e of ecransDe(v)) {
    if (!site.captures[e]) erreurs.push(`${v.nom} : capture "${e}" non définie`);
    if (vus[e]) erreurs.push(`Doublon : la capture "${e}" sert dans ${vus[e]} et ${v.nom}`);
    vus[e] = v.nom;
    for (const m of site.captures[e]?.montre || []) {
      if (montres[m]) erreurs.push(`Doublon : "${m}" est visible dans ${montres[m]} et ${v.nom}`);
      montres[m] = v.nom;
    }
  }
  if (v.fond && !v.variante && !['animation', 'scroll'].includes(v.gabarit) && !['studio', 'clair'].includes(v.fond)) {
    if (fondsVus[v.fond]) erreurs.push(`Doublon : la photo de fond "${v.fond}" sert dans ${fondsVus[v.fond]} et ${v.nom}`);
    fondsVus[v.fond] = v.nom;
  }
  if (v.variante) { Object.keys(vus).forEach(k => { if (!(k in prov)) delete vus[k]; }); Object.keys(montres).forEach(k => { if (!(k in provM)) delete montres[k]; }); Object.keys(fondsVus).forEach(k => { if (!(k in provF)) delete fondsVus[k]; }); }
  if (v.gabarit === 'photo') {
    const m = catalogue[v.mockup];
    if (!m) erreurs.push(`${v.nom} : mockup "${v.mockup}" absent de photos/catalogue.json`);
    else if ((site.captures[v.ecran]?.appareil || 'desktop') !== m.capture) erreurs.push(`${v.nom} : le mockup ${v.mockup} attend une capture "${m.capture}"`);
  }
}
const photos = principaux.filter(v => v.gabarit === 'photo');
for (const v of principaux.filter(v => v.gabarit === 'scroll')) if (!catalogue[v.mockup]) erreurs.push(`${v.nom} : mockup "${v.mockup}" absent de photos/catalogue.json`);
if (photos.length > 2) erreurs.push(`${photos.length} mises en situation photo : 2 maximum`);
if (new Set(photos.map(v => v.mockup)).size < photos.length) erreurs.push('Le même mockup photo est utilisé deux fois');
// Structure de série imposée (REGLES.md) : 5 visuels + animation facultative
const serie = principaux.filter(v => !['animation', 'scroll'].includes(v.gabarit)), ordre = serie.map(v => v.gabarit);
const attendu = ['vitrine', 'photo', 'pile', 'photo'];
if (serie[1] && catalogue[serie[1].mockup]?.capture !== 'desktop') erreurs.push('Visuel 2 : mockup photo d\'ordinateur attendu');
if (serie[3] && catalogue[serie[3].mockup]?.capture === 'desktop') erreurs.push('Visuel 4 : mockup iPhone en main ou iPad attendu');
if (ordre.length !== 5) erreurs.push(`${ordre.length} visuels : il en faut 5 (+ animation facultative)`);
attendu.forEach((g, i) => { if (ordre[i] !== g) erreurs.push(`Visuel ${i + 1} : gabarit "${g}" attendu, "${ordre[i]}" trouvé`); });
if (ordre.includes('macbook') || ordre.includes('laptop3d')) erreurs.push('Gabarits "macbook" et "laptop3d" écartés : le visuel 2 est le MacBook photo');
if (erreurs.length) { console.error('Série refusée :\n- ' + erreurs.join('\n- ')); process.exit(1); }

// ---------- 2. Captures ----------
const nav = await chromium.launch();
const utiles = new Set(site.visuels.filter(v => !seulement || seulement.includes(v.nom)).flatMap(ecransDe));
if (!sansCapture) {
  for (const [nom, c] of Object.entries(site.captures)) if (utiles.has(nom)) {
    await capturer(nav, site, c, `${CAP}/${nom}.png`); console.log('capture', nom);
  }
  for (const [nom, url] of Object.entries(site.fonds || {})) { await telecharger(nav, url, `${CAP}/${nom}.png`); console.log('fond', nom); }
}

// ---------- 3. Composition ----------
const rendus = [];
for (const v of site.visuels) {
  if (seulement && !seulement.includes(v.nom)) continue;
  const sortie = `${VIS}/${site.nom}-${v.nom}`;
  if (v.gabarit === 'brandkit') {
    await brandkit(nav, site, v, `${sortie}.png`); rendus.push(`${sortie}.png`); console.log('visuel', v.nom, '(brand kit)'); continue;
  }
  if (v.gabarit === 'scroll') {
    await scrollPhoto(nav, site, v, catalogue[v.mockup], RACINE, dossier, sortie);
    console.log('visuel', v.nom, `(scroll gif, ${(fs.statSync(sortie + '.gif').size / 1e6).toFixed(1)} Mo)`); continue;
  }
  if (v.gabarit === 'animation') {
    await animation(nav, site, v, dossier, sortie, async (img, base) => {
      fs.copyFileSync(img, `${CAP}/_anim.png`);
      const [w, h, html, placement] = GABARITS.vitrine({ ...v, ecran: '_anim' }, site, `file://${CAP}/`);
      const p = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      const tmp = `${dossier}/_anim.html`; fs.writeFileSync(tmp, page(w, h, html, placement));
      await p.goto('file://' + tmp); await p.waitForSelector('body[data-pret]'); await p.waitForTimeout(300);
      await p.screenshot({ path: base });
      const r = await p.evaluate(() => { const b = document.querySelector('#w img').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }; });
      fs.unlinkSync(tmp); fs.unlinkSync(`${CAP}/_anim.png`); await p.close(); return r;
    });
    console.log('visuel', v.nom, '(animation gif)'); continue;
  }
  if (v.gabarit === 'photo') {
    const m = catalogue[v.mockup];
    const conf = { ...m, photo: `${RACINE}/photos/${m.fichier}`, capture: `${CAP}/${v.ecran}.png`, out: `${sortie}.jpg` };
    execFileSync(process.env.PYTHON || 'python3', [`${RACINE}/lib/photo.py`, JSON.stringify(conf)], { stdio: 'inherit' });
    rendus.push(`${sortie}.jpg`); console.log('visuel', v.nom, '(photo', v.mockup + ')');
    continue;
  }
  const [w, h, html, placement] = GABARITS[v.gabarit](v, site, `file://${CAP}/`);
  const p = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const tmp = `${dossier}/_${v.nom}.html`; fs.writeFileSync(tmp, page(w, h, html, placement));
  await p.goto('file://' + tmp); await p.waitForSelector('body[data-pret]'); await p.waitForTimeout(300);
  // contrôle : chaque capture garde son ratio natif (tolérance 1 %)
  const deformes = await p.evaluate(() => [...document.images].filter(i => getComputedStyle(i).objectFit !== 'cover')
    .filter(i => Math.abs(i.width / i.height - i.naturalWidth / i.naturalHeight) > .01 * i.naturalWidth / i.naturalHeight).map(i => i.src.split('/').pop()));
  if (deformes.length) { console.error(`${v.nom} : capture déformée ${deformes}`); process.exit(1); }
  await p.screenshot({ path: `${sortie}.png` }); fs.unlinkSync(tmp); await p.close();
  rendus.push(`${sortie}.png`); console.log('visuel', v.nom, '(ratio OK)');
}

// ---------- 4. Planche contact pour relecture ----------
const p = await nav.newPage({ viewport: { width: 1500, height: 1300 } });
const planche = `${dossier}/_planche.html`;
fs.writeFileSync(planche, `<body style="margin:0;padding:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;background:#eee">${rendus.map(f => `<img src="file://${f}" style="width:100%;height:600px;object-fit:contain;background:#fff">`).join('')}</body>`);
await p.goto('file://' + planche); await p.waitForTimeout(800);
await p.screenshot({ path: `${dossier}/planche.png`, fullPage: true }); fs.unlinkSync(planche);
await nav.close();
console.log(`\nSérie prête : ${VIS}\nPlanche de relecture : ${dossier}/planche.png`);
