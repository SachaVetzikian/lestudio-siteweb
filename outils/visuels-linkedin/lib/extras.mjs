// Modèles spéciaux : brand kit (généré dans la page du site, avec ses vraies polices) et animation du hero.
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { APPAREILS } from './capture.mjs';

// ---------- Brand kit ----------
// On ouvre le site, on lit ses couleurs, polices, logo et boutons, puis on remplace la page par la planche :
// les polices du site sont déjà chargées, le rendu est donc fidèle.
export async function brandkit(nav, site, v, sortie) {
  const ctx = await nav.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  for (let essai = 1; ; essai++) { // relance si la page n'a pas chargé (erreur réseau)
    await p.goto(new URL(v.page || '/', site.url).href, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    if (await p.evaluate(() => !!document.querySelector('h1')).catch(() => false)) break;
    if (essai === 3) throw new Error('brand kit : impossible de charger la page');
    console.warn(`brand kit : chargement raté, essai ${essai}/3`); await p.waitForTimeout(2000);
  }
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(1200);
  await p.evaluate(({ titre, roles }) => {
    const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgb = c => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return d[3] < 250 ? null : [d[0], d[1], d[2]]; };
    const hex = c => '#' + c.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    const proche = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 28;
    const visibles = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
    // couleurs de fond pondérées par la surface
    const aires = [];
    for (const e of visibles) { const c = rgb(getComputedStyle(e).backgroundColor); if (!c) continue;
      const a = e.offsetWidth * e.offsetHeight, x = aires.find(z => proche(z.c, c)); x ? x.a += a : aires.push({ c, a }); }
    aires.sort((a, b) => b.a - a.a);
    const h1 = document.querySelector('h1'), corps = document.querySelector('main p, p');
    const bouton = visibles.filter(e => /^(A|BUTTON)$/.test(e.tagName) && rgb(getComputedStyle(e).backgroundColor) && e.offsetWidth < 320 && e.offsetHeight < 80)
      .sort((a, b) => { const s = e => { const c = rgb(getComputedStyle(e).backgroundColor); return Math.max(...c) - Math.min(...c); }; return s(b) - s(a); })[0];
    const palette = [];
    const ajoute = (c, role) => { if (c && !palette.some(z => proche(z.c, c))) palette.push({ c, role }); };
    ajoute(rgb(getComputedStyle(h1).color), 'Texte');
    for (const z of aires.slice(0, 6)) ajoute(z.c, 'Fond');
    if (bouton) ajoute(rgb(getComputedStyle(bouton).backgroundColor), 'Action');
    visibles.forEach(e => { const c = rgb(getComputedStyle(e).color); if (c && Math.max(...c) - Math.min(...c) > 90) ajoute(c, 'Accent'); });
    const couleurs = palette.slice(0, 6);
    const clair = aires.map(z => z.c).find(c => c[0] + c[1] + c[2] > 640) || [255, 255, 255];
    const lum = c => (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000;
    const sombre = [...aires.slice(0, 8).map(z => z.c), rgb(getComputedStyle(h1).color)].filter(Boolean).sort((a, b) => lum(a) - lum(b))[0];
    const actionC = bouton ? rgb(getComputedStyle(bouton).backgroundColor) : null;
    couleurs.forEach(z => { z.role = proche(z.c, sombre) ? 'Primaire' : proche(z.c, clair) || lum(z.c) > 235 ? 'Fond' : actionC && proche(z.c, actionC) ? 'Action' : 'Accent'; });
    couleurs.sort((a, b) => ['Primaire', 'Fond', 'Action', 'Accent'].indexOf(a.role) - ['Primaire', 'Fond', 'Action', 'Accent'].indexOf(b.role));
    const nomPolice = f => f.split(',')[0].replace(/["']/g, '').replace(/variable ?font|wght|_|-?\b(regular|var)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    const fTitre = getComputedStyle(h1).fontFamily.replace(/"/g, "'"), fCorps = getComputedStyle(corps || document.body).fontFamily.replace(/"/g, "'");
    const sTitre = getComputedStyle(h1);
    const accueil = [...document.querySelectorAll('a')].filter(a => { try { const u = new URL(a.href); return u.origin === location.origin && (u.pathname === '/' || u.pathname === ''); } catch { return false; } })
      .find(a => a.querySelector('img, svg') && a.getBoundingClientRect().top < 200);
    const logo = accueil ? accueil.querySelector('img, svg') : document.querySelector('header a img, header a svg, nav a img, nav a svg');
    const logoHTML = logo ? logo.outerHTML : '';
    const boutons = visibles.filter(e => /^(A|BUTTON)$/.test(e.tagName) && e.offsetWidth > 80 && e.offsetWidth < 320 && e.offsetHeight > 30 && e.offsetHeight < 80 && e.innerText.trim().length > 2 && (rgb(getComputedStyle(e).backgroundColor) || parseFloat(getComputedStyle(e).borderTopWidth) > 0))
      .filter((e, i, t) => t.findIndex(o => o.className === e.className) === i).slice(0, 3).map(e => e.outerHTML);
    const phrase = (titre || h1.innerText).replace(/\s+/g, ' ').trim().slice(0, 48);
    const L = c => (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 > 150;
    const D = hex(sombre), C = hex(clair);
    const lbl = t => `<div style="font:600 14px/1 ${fCorps};letter-spacing:.14em;text-transform:uppercase;color:${D};opacity:.55;margin-bottom:22px">${t}</div>`;
    document.documentElement.style.cssText = 'background:' + C; document.body.removeAttribute('class');
    document.body.style.cssText = `margin:0;width:1080px;height:1350px;overflow:hidden;background:${C};color:${D};position:relative`;
    document.body.innerHTML = `<div style="position:absolute;inset:0;padding:76px 80px 84px;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box">
      <div style="display:flex;justify-content:space-between;align-items:center;height:56px">
        <div id="logo" style="height:48px;display:flex;align-items:center">${logoHTML}</div>
        <div style="font:600 15px ${fCorps};letter-spacing:.16em;text-transform:uppercase;opacity:.6">Brand kit</div></div>
      <div>${lbl('Typographies')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
          <div style="background:${D};color:${C};border-radius:28px;padding:36px 38px;height:330px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between">
            <div style="font-family:${fTitre};font-weight:${sTitre.fontWeight};font-size:150px;line-height:.9">Aa</div>
            <div><div style="font:600 26px ${fCorps}">${nomPolice(fTitre)}</div><div style="font:400 17px ${fCorps};opacity:.7;margin-top:6px">Titres · graisse ${sTitre.fontWeight}</div></div></div>
          <div style="background:#fff;border-radius:28px;padding:36px 38px;height:330px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 1px 0 rgba(0,0,0,.06)">
            <div style="font-family:${fCorps};font-weight:400;font-size:150px;line-height:.9">Aa</div>
            <div><div style="font:600 26px ${fCorps}">${nomPolice(fCorps)}</div><div style="font:400 17px ${fCorps};opacity:.7;margin-top:6px">Textes courants</div></div></div>
        </div>
        <div style="margin-top:28px;font-family:${fTitre};font-weight:${sTitre.fontWeight};text-transform:${sTitre.textTransform};letter-spacing:${sTitre.letterSpacing};font-size:46px;line-height:1.05">${phrase}</div></div>
      <div>${lbl('Couleurs')}
        <div style="display:grid;grid-template-columns:repeat(${couleurs.length},1fr);gap:16px">${couleurs.map(z => `
          <div style="height:210px;border-radius:24px;background:${hex(z.c)};box-shadow:0 0 0 1px rgba(0,0,0,.08) inset;padding:20px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;color:${L(z.c) ? D : '#fff'}">
            <div style="font:600 19px ${fCorps}">${hex(z.c)}</div><div style="font:400 14px ${fCorps};opacity:.7;margin-top:4px">${roles?.[hex(z.c)] || z.role}</div></div>`).join('')}</div></div>
      <div>${lbl('Composants')}<div id="btns" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${boutons.join('')}</div></div>
    </div>`;
    const lg = document.querySelector('#logo img, #logo svg'); if (lg) { lg.style.height = '48px'; lg.style.width = 'auto'; lg.style.maxWidth = 'none'; }
    document.querySelectorAll('#btns > *').forEach(b => { b.style.position = 'static'; b.style.transform = 'none'; b.style.margin = '0'; b.style.transformOrigin = 'left center'; });
  }, { titre: v.phrase, roles: v.roles });
  await p.setViewportSize({ width: 1080, height: 1350 }); await p.waitForTimeout(800);
  await p.screenshot({ path: sortie });
  await ctx.close();
}

// ---------- Animation du hero ----------
// Enregistre le chargement de la page (CDP screencast), puis incruste chaque image dans la fenêtre
// du gabarit vitrine. Sorties : MP4 (pour LinkedIn) et GIF léger.
export async function animation(nav, site, v, dossier, sortieBase, rendreVitrine) {
  const tmp = path.join(dossier, '_anim'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
  const H = v.hauteur || 1900, duree = v.duree || 5, fps = 25;
  // enregistrement, relancé si la page n'a pas chargé correctement (erreur réseau, page vide)
  let images = [];
  for (let essai = 1; essai <= 3; essai++) {
    const ctx = await nav.newContext(APPAREILS.desktop(H)); const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p); images = [];
    cdp.on('Page.screencastFrame', async f => { images.push({ t: f.metadata.timestamp, data: f.data }); await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    await p.mouse.move(5, H - 5);
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 2880, maxHeight: H * 2, everyNthFrame: 1 });
    let statut = 0;
    p.goto(new URL(v.page || '/', site.url).href, { timeout: 60000 }).then(r => { statut = r ? r.status() : 0; }).catch(() => {});
    await p.waitForTimeout((duree + 1.5) * 1000);
    await cdp.send('Page.stopScreencast');
    const texte = await p.evaluate(() => document.body ? document.body.innerText.length : 0).catch(() => 0);
    await ctx.close();
    if (statut >= 200 && statut < 400 && texte > 500 && images.length > 10) break;
    console.warn(`animation : chargement raté (statut ${statut}, ${texte} caractères), essai ${essai}/3`);
    if (essai === 3) throw new Error('animation : impossible de charger la page');
  }
  // on démarre à la première image où le site est réellement peint (pas la page blanche)
  const peint = images.findIndex((f, i) => i > 0 && f.data.length > images[0].data.length * 1.6);
  const debut = images[Math.max(0, peint)].t, fin = debut + duree;
  let k = 0;
  for (let t = debut; t < fin; t += 1 / fps) {
    let f = images[0]; for (const g of images) if (g.t <= t) f = g;
    fs.writeFileSync(path.join(tmp, `f${String(k++).padStart(4, '0')}.jpg`), Buffer.from(f.data, 'base64'));
  }
  // fond + fenêtre rendus une fois, avec la dernière image ; on récupère la position de l'écran
  fs.copyFileSync(path.join(tmp, `f${String(k - 1).padStart(4, '0')}.jpg`), path.join(tmp, 'derniere.jpg'));
  const rect = await rendreVitrine(path.join(tmp, 'derniere.jpg'), path.join(tmp, 'base.png'));
  execFileSync(process.env.PYTHON || 'python3', ['-c', `
import sys, glob
from PIL import Image
base = Image.open(sys.argv[1]).convert('RGB'); x, y, w = [round(float(a)) for a in sys.argv[2:5]]
for f in sorted(glob.glob(sys.argv[5] + '/f*.jpg')):
    im = Image.open(f).convert('RGB'); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    out = base.copy(); out.paste(im.crop((0, 0, w, min(im.height, base.height - y))), (x, y))
    out.resize((1080, 1350), Image.LANCZOS).save(f.replace('/f', '/c'), quality=92)
`, path.join(tmp, 'base.png'), String(rect.x * 2), String(rect.y * 2), String(rect.w * 2), tmp]);
  // tient la dernière image 1,5 s pour que la boucle respire
  // GIF seul (demandé pour LinkedIn) : la vidéo n'est qu'une étape. On vise moins de 5 Mo.
  const video = path.join(tmp, 'anim.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(tmp, 'c%04d.jpg'),
    '-vf', 'tpad=stop_mode=clone:stop_duration=1.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', video]);
  for (const l of [1080, 900, 720]) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vf',
      `fps=15,scale=${l}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`, '-loop', '0', `${sortieBase}.gif`]);
    if (fs.statSync(`${sortieBase}.gif`).size < 5e6) break;
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
