// Capture simplifiée : une page d'accueil -> un hero mockup MacBook.
// Usage: node hero-shot.mjs <slug> <url> [outdir]
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const [slug, url, outdir] = process.argv.slice(2);
const OUT = outdir || `${process.cwd()}/sortie/heroes`;
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 935 }, deviceScaleFactor: 2 });
await p.goto(url, { waitUntil: 'load', timeout: 45000 });
await p.mouse.move(5, 930);
await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; }));
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < Math.min(H, 4000); y += 400) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(70); }
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(1200);
const capPath = `${OUT}/${slug}-capture.png`;
await p.screenshot({ path: capPath });
await b.close();

const RACINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '.');
const conf = {
  fichier: 'macbook-grille.jpg', capture: 'desktop', seed: [1100,500], thr: 60, grow: 5, ratio: 1.54,
  radius: 0.012, notch: [0.112,0.036], crop: [230,-485,1500,1875], size: [1080,1350], bande_haut: 110,
  photo: `${RACINE}/photos/macbook-grille.jpg`,
  photo_hd: `${RACINE}/photos/hd/macbook-grille.jpg`,
  capture_img: capPath,
  out: `${OUT}/${slug}-hero.jpg`,
};
conf.capture = conf.capture_img; delete conf.capture_img;
execFileSync(process.env.PYTHON || 'python3', [`${RACINE}/lib/photo.py`, JSON.stringify(conf)], { stdio: 'inherit' });
console.log('OK', `${OUT}/${slug}-hero.jpg`);
