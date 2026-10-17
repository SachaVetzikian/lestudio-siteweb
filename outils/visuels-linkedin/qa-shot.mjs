import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
await p.goto(process.argv[3], { waitUntil: 'networkidle', timeout: 30000 });
await p.waitForTimeout(500);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 300) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(60); }
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(600);
await p.screenshot({ path: process.argv[2], fullPage: true, timeout: 20000, animations: 'disabled' });
await b.close();
