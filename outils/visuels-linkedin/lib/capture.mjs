// Captures d'écran du site, au viewport exact de chaque appareil (règle : jamais de déformation).
import { chromium, devices } from 'playwright';

// Hauteurs par défaut : MacBook 1440x935 (ratio 1.54), iPad 834x1194, iPhone 393x798 (+ barre de statut = 852).
export const APPAREILS = {
  desktop: (h = 935) => ({ viewport: { width: 1440, height: h }, deviceScaleFactor: 2 }),
  tablet: (h = 1194) => ({ viewport: { width: 834, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }),
  mobile: (h = 798) => ({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: h }, deviceScaleFactor: 3 }),
};

async function preparer(p, url, masquer) {
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const vh = p.viewportSize().height;
  await p.mouse.move(5, vh - 5); // la souris ne doit pas survoler le menu
  if (masquer.length) await p.addStyleTag({ content: masquer.map(s => `${s}{display:none!important}`).join('') });
  // fait défiler toute la page pour déclencher le lazy-loading et les animations d'apparition
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 400) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1500);
}

// c = { page, appareil, hauteur, survol, element, n, defiler, aligner, decalage, rogner: [haut, bas], masquer: [] }
export async function capturer(navigateur, site, c, sortie) {
  const ctx = await navigateur.newContext(APPAREILS[c.appareil || 'desktop'](c.hauteur));
  const p = await ctx.newPage();
  await preparer(p, new URL(c.page || '/', site.url).href, [...(site.masquer || []), ...(c.masquer || [])]);
  const [haut, bas] = c.rogner || [0, 0];
  if (c.element) {
    const el = p.locator(c.element).nth(c.n || 0);
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
    const box = await el.boundingBox(), sy = await p.evaluate(() => scrollY);
    await p.screenshot({ path: sortie, fullPage: true, clip: { x: box.x, y: box.y + sy + haut, width: box.width, height: box.height - haut - bas } });
  } else {
    if (c.defiler) {
      await p.evaluate(([s, n, aligner, dec]) => {
        const r = document.querySelectorAll(s)[n].getBoundingClientRect(), top = r.top + scrollY;
        scrollTo(0, aligner === 'bas' ? top + r.height - innerHeight + dec : top - dec); // 'bas' : la section finit en bas de l'écran
      }, [c.defiler, c.n || 0, c.aligner, c.decalage || 0]);
      await p.waitForTimeout(1200);
    }
    if (c.masquerSous) { // zoom sur une zone : on masque ce qui suit un bloc dans sa propre colonne
      await p.evaluate(s => {
        const r = document.querySelector(s).getBoundingClientRect();
        document.querySelectorAll('body *').forEach(e => { const q = e.getBoundingClientRect();
          if (q.top >= r.bottom && q.left >= r.left - 2 && q.right <= r.right + 2 && q.height > 0) e.style.visibility = 'hidden'; });
      }, c.masquerSous);
    }
    if (c.survol) { await p.getByText(c.survol, { exact: false }).first().hover(); await p.waitForTimeout(1200); }
    const vp = p.viewportSize();
    let hauteur = vp.height - haut - bas;
    if (c.finirApres) { // coupe pile sous un élément (+ marge), pour ne jamais trancher le bloc suivant
      const fin = await p.evaluate(([s, m]) => document.querySelector(s).getBoundingClientRect().bottom + m, [c.finirApres, c.marge ?? 32]);
      hauteur = Math.min(hauteur, Math.round(fin) - haut);
    }
    await p.screenshot({ path: sortie, clip: { x: 0, y: haut, width: vp.width, height: hauteur } });
  }
  await ctx.close();
}

// Télécharge une image du site à sa taille native (gère avif/webp via le navigateur).
export async function telecharger(navigateur, url, sortie) {
  const p = await navigateur.newPage();
  await p.setContent(`<body style="margin:0"><img id=i src="${url}"></body>`);
  await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
  const [w, h] = await p.evaluate(() => [i.naturalWidth, i.naturalHeight]);
  await p.setViewportSize({ width: w, height: h });
  await p.locator('#i').screenshot({ path: sortie });
  await p.close();
}

export { chromium };
