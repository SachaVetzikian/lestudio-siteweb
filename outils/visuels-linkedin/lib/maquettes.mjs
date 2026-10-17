// Exporte les pages du site en maquettes pleine hauteur : 1440 px (1x) et 2K (1440 px rendus en 2x = 2880 px).
// Usage : node lib/maquettes.mjs projets/doxa.json [/page1 /page2 ...]
// Sans liste, prend toutes les pages utilisées par la série du projet.
import fs from 'fs'; import path from 'path';
import { chromium } from './capture.mjs';

const RACINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const site = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const pages = process.argv.slice(3).length ? process.argv.slice(3)
  : [...new Set(['/', ...Object.values(site.captures).filter(c => (c.appareil || 'desktop') === 'desktop').map(c => c.page || '/')])];
const dossier = path.join(RACINE, 'sortie', site.nom, 'maquettes'); fs.mkdirSync(dossier, { recursive: true });
const nav = await chromium.launch();
for (const pg of pages) {
  for (const [suffixe, dsf] of [['1440', 1], ['2k', 2]]) {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf });
    const p = await ctx.newPage();
    for (let essai = 1; ; essai++) {
      await p.goto(new URL(pg, site.url).href, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      if (await p.evaluate(() => document.body && document.body.innerText.length > 300).catch(() => false)) break;
      if (essai === 3) throw new Error(`maquettes : impossible de charger ${pg}`);
    }
    await p.mouse.move(5, 895);
    if (site.masquer?.length) await p.addStyleTag({ content: site.masquer.map(s => `${s}{display:none!important}`).join('') });
    await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; }));
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 400) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(70); }
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 6000); }))));
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1200);
    const nom = (pg === '/' ? 'accueil' : pg.replace(/^\/|\/$/g, '').replace(/\//g, '-')) + `-${suffixe}.png`;
    await p.screenshot({ path: path.join(dossier, nom), fullPage: true });
    console.log('maquette', nom); await ctx.close();
  }
}
await nav.close();
console.log(`\nMaquettes : ${dossier}`);
