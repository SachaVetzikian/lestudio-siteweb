// Gabarits de composition. Règle d'or : chaque capture est un <img> en width:100% / height:auto,
// donc jamais déformée. Les positions verticales sont calculées dans la page une fois les images chargées.

const GRAIN = `<div style="position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;background:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;)"></div>`;

const CSS = `*{margin:0;box-sizing:border-box}body{overflow:hidden;position:relative;background:#fff}
.f{position:absolute;padding:10px;border-radius:26px;background:rgba(255,255,255,.3);box-shadow:0 40px 80px -20px rgba(0,0,0,.5)}
.f img{display:block;width:100%;height:auto;border-radius:17px}
.win{position:absolute;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 50px 100px -20px rgba(0,0,0,.6)}
.win>img{display:block;width:100%;height:auto}
.bar{height:44px;display:flex;align-items:center;gap:8px;padding:0 18px;background:#fff;border-bottom:1px solid #eee}
.bar i{width:11px;height:11px;border-radius:50%;background:#e2e0dc}
.bar span{margin:0 auto;padding:6px 40px;border-radius:8px;background:#f2f1ee;font:500 14px system-ui;color:#666;white-space:nowrap;overflow:hidden;max-width:70%;text-overflow:ellipsis}
.ph{position:absolute;width:420px;padding:12px;border-radius:62px;background:#0b0b0f;box-shadow:0 0 0 2px #2c2c33,0 50px 100px -20px rgba(0,0,0,.7)}
.ph>img{display:block;width:100%;height:auto;border-radius:0 0 50px 50px}
.sb{height:58px;border-radius:50px 50px 0 0;display:flex;justify-content:space-between;align-items:center;padding:6px 34px 0;font:600 17px system-ui}
.sb span{font-size:11px;letter-spacing:1px}
.di{position:absolute;top:24px;left:50%;transform:translateX(-50%);width:120px;height:34px;border-radius:20px;background:#0b0b0f}`;

// Fond : 'studio' (sombre, couleurs du client), 'clair' (studio clair), ou nom d'une photo du client (floutée + voile)
function fond(v, site, C) {
  const [a, b, c] = site.couleurs.studio;
  if (v.fond === 'studio') return `<div style="position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 42%, ${a} 0%, ${b} 50%, ${c} 100%)"></div>${GRAIN}`;
  if (v.fond === 'clair') return `<div style="position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%, #fff 0%, #EFEFF2 60%, #DEDFE6 100%)"></div>${GRAIN}`;
  return `<div style="position:absolute;inset:-80px;background:url(${C}${v.fond}.png) ${v.fondPosition || 'center'}/cover;filter:blur(30px)"></div>
    <div style="position:absolute;inset:0;background:${site.couleurs.voile || 'rgba(10,10,30,.45)'}"></div>`;
}

const telephone = (img, cls, sb) => `<div class="ph ${cls}"><div class="sb" style="background:${sb.fond};color:${sb.texte}"><b>9:41</b><span>▂▄▆ ▮</span></div><img src="${img}"><i class="di"></i></div>`;

// Chaque gabarit renvoie [largeur, hauteur, html, script de placement]
export const GABARITS = {
  // MacBook de face dessiné en CSS (1:1)
  macbook: (v, site, C) => [1080, 1080, `${fond(v, site, C)}
    <div id="m" style="position:absolute;left:50%;transform:translateX(-50%);width:940px">
      <div style="position:relative;padding:16px 16px 22px;background:#0d0d10;border-radius:30px 30px 6px 6px;box-shadow:0 0 0 2px #3a3a40 inset,0 60px 120px -30px rgba(0,0,0,.8)">
        <div style="border-radius:10px 10px 2px 2px;overflow:hidden;background:#fff">
          <div style="height:30px;background:#ecebe8;display:flex;align-items:center;gap:6px;padding:0 12px"><i style="width:8px;height:8px;border-radius:50%;background:#cfcdc8"></i><i style="width:8px;height:8px;border-radius:50%;background:#cfcdc8"></i><i style="width:8px;height:8px;border-radius:50%;background:#cfcdc8"></i></div>
          <img src="${C}${v.ecran}.png" style="display:block;width:100%;height:auto"></div>
        <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);width:120px;height:22px;background:#0d0d10;border-radius:0 0 12px 12px"></div></div>
      <div style="position:relative;left:-55px;width:1050px;height:26px;border-radius:2px 2px 26px 26px;background:linear-gradient(#d9d9de,#9a9aa2 60%,#5c5c64)">
        <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:160px;height:10px;border-radius:0 0 10px 10px;background:linear-gradient(#8d8d95,#b9b9c0)"></div></div>
      <div style="position:relative;left:-20px;width:980px;height:30px;margin-top:4px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(14px)"></div></div>`,
    `centrer(['m'])`],

  // Fenêtre de navigateur. Si la page est plus haute que le visuel, elle sort par le bas (jamais par les côtés).
  desk: (v, site, C) => [1080, v.carre ? 1080 : 1350, `${fond(v, site, C)}
    <div class="win" id="w" style="left:70px;width:940px"><div class="bar"><i></i><i></i><i></i><span>${v.adresse || ''}</span></div>
      <img src="${C}${v.ecran}.png"></div>`,
    `const w=document.getElementById('w'); if (w.offsetHeight > innerHeight - 220) { w.style.top='110px'; w.style.borderRadius='18px 18px 0 0' } else centrer(['w'])`],

  // Deux sections en quinconce, centrées verticalement
  quinconce: (v, site, C) => [1080, 1350, `${fond(v, site, C)}
    <div class="f" id="a" style="left:40px;width:900px"><img src="${C}${v.ecrans[0]}.png"></div>
    <div class="f" id="b" style="left:140px;width:900px"><img src="${C}${v.ecrans[1]}.png"></div>`,
    `quinconce(${v.chevauchement ?? 12})`],

  // Une section seule (idéalement capturée en largeur tablette). Sort par le bas si trop haute.
  section: (v, site, C) => [1080, 1350, `${fond(v, site, C)}
    <div class="f" id="s" style="left:${(1080 - (v.largeur || 940)) / 2}px;width:${v.largeur || 940}px;background:#fff"><img src="${C}${v.ecran}.png"></div>`,
    `const s=document.getElementById('s'); if (s.offsetHeight > innerHeight - 160) { s.style.top='120px'; s.style.borderRadius='26px 26px 0 0' } else centrer(['s'])`],

  // Deux mobiles côte à côte, décalés en hauteur
  duo: (v, site, C) => {
    const sb = site.couleurs.barreStatut || { fond: '#fff', texte: '#111' };
    return [1080, 1350, `${fond(v, site, C)}
      <div style="position:absolute;left:95px;top:0" id="p1">${telephone(`${C}${v.ecrans[0]}.png`, '', sb)}</div>
      <div style="position:absolute;left:565px;top:0" id="p2">${telephone(`${C}${v.ecrans[1]}.png`, '', sb)}</div>`,
      `duo()`];
  },
};

// Fonctions de placement exécutées dans la page de rendu
export const SCRIPT = `
function centrer(ids){ const els=ids.map(i=>document.getElementById(i)); const h=els[0].offsetHeight; els[0].style.top=Math.max(60,(innerHeight-h)/2)+'px' }
function quinconce(ch){ const a=document.getElementById('a'), b=document.getElementById('b');
  const tot=a.offsetHeight+b.offsetHeight-ch, top=Math.max(50,(innerHeight-tot)/2); a.style.top=top+'px'; b.style.top=(top+a.offsetHeight-ch)+'px' }
function duo(){ const p=document.querySelector('#p1 .ph'), h=p.offsetHeight, top=Math.max(60,(innerHeight-h-80)/2);
  document.getElementById('p1').style.top=top+'px'; document.getElementById('p2').style.top=(top+80)+'px' }`;

export const page = (w, h, html, placement) => `<!doctype html><html><head><meta charset=utf-8><style>${CSS}body{width:${w}px;height:${h}px}</style></head>
<body>${html}<script>${SCRIPT}
Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))).then(()=>{ ${placement}; document.body.dataset.pret=1 })</script></body></html>`;
