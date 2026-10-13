// usage: node render.mjs ep01-frais-surprises.html out/ep01 [fps] [onlyTimes,comma,separated]
// Freezes the page at t = i / fps and saves every frame as a PNG.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [file, outDir, fps = '30', only] = process.argv.slice(2);
const FPS = Number(fps);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(resolve(file)).href + '?t=0', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true);
const DUR = await page.evaluate(() => window.DUR);

const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(DUR * FPS) }, (_, i) => i / FPS);
for (const [i, t] of times.entries()) {
  await page.evaluate((t) => window.renderAt(t), t);
  const name = only ? `t${t.toFixed(2)}` : String(i).padStart(4, '0');
  await page.screenshot({ path: `${outDir}/${name}.png` });
}
await browser.close();
console.log(`${times.length} frames -> ${outDir}`);
