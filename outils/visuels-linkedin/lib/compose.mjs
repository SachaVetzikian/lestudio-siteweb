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

  // 1er visuel : fenêtre de navigateur coupée net en haut, la page continue au-delà du bas de l'image.
  vitrine: (v, site, C) => [1080, 1350, `${fond(v, site, C)}
    <div class="win" id="w" style="left:70px;top:${v.haut ?? 150}px;width:940px;border-radius:18px 18px 0 0"><div class="bar"><i></i><i></i><i></i><span>${v.adresse || ''}</span></div>
      <img src="${C}${v.ecran}.png"></div>`,
    `const w=document.getElementById('w'); if (w.offsetTop+w.offsetHeight < innerHeight+40) console.warn('vitrine : la page ne déborde pas, capture trop courte')`],

  // Laptop en 3D (CSS), vue de trois quarts, sur fond
  laptop3d: (v, site, C) => [1080, 1350, `${fond(v, site, C)}
    <div style="position:absolute;inset:0;perspective:4200px;perspective-origin:50% 20%">
      <div style="position:absolute;z-index:1;left:53%;top:45%;width:740px;transform-style:preserve-3d;transform:translate(-50%,-50%) rotateX(${v.inclinaison ?? -18}deg) rotateY(${v.rotation ?? -17}deg)">
        <div style="position:relative;transform-style:preserve-3d;transform-origin:50% 100%;transform:rotateX(8deg)">
          <div style="padding:14px 14px 20px;background:#0c0c0f;border-radius:26px 26px 4px 4px;box-shadow:0 0 0 2px #45454c inset">
            <div style="position:relative;border-radius:8px 8px 2px 2px;overflow:hidden;background:#fff">
              <img src="${C}${v.ecran}.png" style="display:block;width:100%;height:auto">
              <div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 40%)"></div></div>
            <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:110px;height:18px;background:#0c0c0f;border-radius:0 0 10px 10px"></div></div>
          <div style="position:absolute;left:-36px;right:-36px;top:100%;height:540px;transform-origin:50% 0;transform:rotateX(90deg);border-radius:4px 4px 30px 30px;
            background:linear-gradient(160deg,#d6d7dc,#aeafb6 70%,#9c9da4);box-shadow:0 0 0 2px #9a9ba2 inset,0 -6px 0 #7d7e85 inset">
            <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:150px;height:10px;border-radius:0 0 10px 10px;background:#8e8f96"></div>
            <div style="position:absolute;left:64px;right:64px;top:36px;height:265px;border-radius:8px;background-color:#2a2a30;
              background-image:repeating-linear-gradient(90deg,#16161a 0 5px,transparent 5px 50px),repeating-linear-gradient(0deg,#16161a 0 5px,transparent 5px 50px)"></div>
            <div style="position:absolute;left:50%;top:325px;transform:translateX(-50%);width:360px;height:180px;border-radius:14px;background:#babbc2;box-shadow:0 0 0 1px #a4a5ac inset"></div>
          </div>
        </div>
      </div>
      <div style="position:absolute;left:12%;right:12%;bottom:13%;height:120px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(40px)"></div>
    </div>`, ``],

  // Fenêtre de navigateur. La capture doit finir sur une fin de section (finirApres) : jamais de page tronquée.
  // Si elle est trop haute, la fenêtre rétrécit au lieu de sortir du cadre.
  desk: (v, site, C) => [1080, v.carre ? 1080 : 1350, `${fond(v, site, C)}
    <div class="win" id="w" style="width:940px"><div class="bar"><i></i><i></i><i></i><span>${v.adresse || ''}</span></div>
      <img src="${C}${v.ecran}.png"></div>`,
    `ajuster('w', 940)`],

  // Deux sections de même largeur, l'une au-dessus de l'autre (sens 'vertical') ou côte à côte ('horizontal')
  pile: (v, site, C) => [1080, v.carre ? 1080 : 1350, `${fond(v, site, C)}
    <div class="f" id="a"><img src="${C}${v.ecrans[0]}.png"></div>
    <div class="f" id="b"><img src="${C}${v.ecrans[1]}.png"></div>`,
    `pile('${v.sens || 'vertical'}', ${v.ecart ?? 32})`],

  // Une section seule (idéalement capturée en largeur tablette), toujours entière : rétrécit si elle est trop haute.
  section: (v, site, C) => [1080, 1350, `${fond(v, site, C)}
    <div class="f" id="s" style="background:#fff"><img src="${C}${v.ecran}.png"></div>`,
    `ajuster('s', ${v.largeur || 940})`],

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
function ajuster(id, w){ const e=document.getElementById(id); e.style.width=w+'px';
  if (e.offsetHeight > innerHeight-120) { w=Math.floor(w*(innerHeight-120)/e.offsetHeight); e.style.width=w+'px' }
  e.style.left=(innerWidth-w)/2+'px'; e.style.top=(innerHeight-e.offsetHeight)/2+'px' }
function pile(sens, ecart){ const a=document.getElementById('a'), b=document.getElementById('b');
  if (sens==='vertical') { let w=940; a.style.width=b.style.width=w+'px';
    const tot=a.offsetHeight+b.offsetHeight+ecart; if (tot>innerHeight-120) { w=Math.floor(w*(innerHeight-120-ecart)/(tot-ecart)); a.style.width=b.style.width=w+'px' }
    const top=(innerHeight-(a.offsetHeight+b.offsetHeight+ecart))/2; a.style.left=b.style.left=(innerWidth-w)/2+'px';
    a.style.top=top+'px'; b.style.top=(top+a.offsetHeight+ecart)+'px' }
  else { let w=(innerWidth-120-ecart)/2; a.style.width=b.style.width=w+'px';
    const h=Math.max(a.offsetHeight,b.offsetHeight); if (h>innerHeight-120) { w=Math.floor(w*(innerHeight-120)/h); a.style.width=b.style.width=w+'px' }
    const left=(innerWidth-2*w-ecart)/2, top=(innerHeight-Math.max(a.offsetHeight,b.offsetHeight))/2;
    a.style.left=left+'px'; b.style.left=(left+w+ecart)+'px'; a.style.top=b.style.top=top+'px' } }
function duo(){ const p=document.querySelector('#p1 .ph'), h=p.offsetHeight, top=Math.max(60,(innerHeight-h-80)/2);
  document.getElementById('p1').style.top=top+'px'; document.getElementById('p2').style.top=(top+80)+'px' }`;

export const page = (w, h, html, placement) => `<!doctype html><html><head><meta charset=utf-8><style>${CSS}body{width:${w}px;height:${h}px}</style></head>
<body>${html}<script>${SCRIPT}
Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))).then(()=>{ ${placement}; document.body.dataset.pret=1 })</script></body></html>`;
