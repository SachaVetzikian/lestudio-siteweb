// Moteur commun de la série. Chaque valeur est une fonction pure du temps t.
// Courbes et durées tirées du design system LeStudio (section Mouvement).
(function () {
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const P = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;

  // cubic-bezier(x1, y1, x2, y2) résolu par Newton puis dichotomie
  function bezier(x1, y1, x2, y2) {
    const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
    const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
    const sx = s => ((ax * s + bx) * s + cx) * s, sy = s => ((ay * s + by) * s + cy) * s;
    const dx = s => (3 * ax * s + 2 * bx) * s + cx;
    return x => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let s = x;
      for (let i = 0; i < 8; i++) { const e = sx(s) - x, d = dx(s); if (Math.abs(e) < 1e-6) return sy(s); if (Math.abs(d) < 1e-6) break; s -= e / d; }
      let lo = 0, hi = 1; s = x;
      for (let i = 0; i < 30; i++) { const v = sx(s); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = s; else hi = s; s = (lo + hi) / 2; }
      return sy(s);
    };
  }

  const E = {
    house: bezier(.23, 1, .32, 1),          // courbe maison du DS, tout ce qui glisse
    inOut: bezier(.76, 0, .24, 1),          // déplacements d'écran
    in: bezier(.7, 0, .84, 0),              // sorties
  };

  function spring(t, z = .7, f = 2) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }

  const $ = id => document.getElementById(id);
  const show = (id, on) => { $(id).style.display = on ? 'block' : 'none'; };

  // Titres révélés ligne par ligne (masque + montée), comme SplitText sur le site
  function lines(root, t, t0, step = .08, dur = .6) {
    root.querySelectorAll('.ln > span').forEach((s, i) => {
      const k = E.house(P(t, t0 + i * step, t0 + i * step + dur));
      s.style.transform = `translateY(${(1 - k) * 105}%)`;
    });
  }
  function linesOut(root, t, t0, step = .05, dur = .4) {
    root.querySelectorAll('.ln > span').forEach((s, i) => {
      const k = E.in(P(t, t0 + i * step, t0 + i * step + dur));
      s.style.transform = `translateY(${-k * 105}%)`;
    });
  }
  // Apparition simple : opacité + montée
  function rise(el, t, t0, dist = 40, dur = .6) {
    const k = E.house(P(t, t0, t0 + dur));
    el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dist}px)`;
    return k;
  }
  // Filet qui se trace de gauche à droite
  function stroke(el, t, t0, dur = .45) { el.style.transform = `scaleX(${E.house(P(t, t0, t0 + dur))})`; }

  // Chemin à images clés [t, x, y]
  function path(t, keys) {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, x0, y0] = keys[i], [b, x1, y1] = keys[i + 1];
      if (t <= b) { const k = E.inOut(P(t, a, b)); return [lerp(x0, x1, k), lerp(y0, y1, k)]; }
    }
    return keys[keys.length - 1].slice(1);
  }
  // Doigt : apparition, déplacement, tapes avec onde
  function finger(f, rip, t, keys, tIn, tOut, taps = []) {
    const [x, y] = path(t, keys);
    const vis = P(t, tIn, tIn + .2) * (1 - P(t, tOut - .2, tOut));
    let s = 1;
    taps.forEach(tp => { const u = t - tp; if (u > 0 && u < .3) s = Math.min(s, 1 - .22 * Math.sin(Math.PI * u / .3)); });
    f.style.left = x + 'px'; f.style.top = y + 'px'; f.style.opacity = vis; f.style.transform = `scale(${s})`;
    let rk = -1; taps.forEach(tp => { if (t >= tp + .1 && t < tp + .6) rk = P(t, tp + .1, tp + .6); });
    rip.style.left = x + 'px'; rip.style.top = y + 'px';
    rip.style.opacity = rk < 0 ? 0 : .5 * (1 - rk); rip.style.transform = `scale(${1 + rk * 1.6})`;
  }
  // Compte à rebours en odomètre : position continue de 0 (affiche from) à from
  function odometer(col, t, t0, from = 5, stopAt = Infinity) {
    const tt = Math.min(t, stopAt) - t0;
    let pos = 0;
    if (tt > 0) { const n = Math.floor(tt); pos = Math.min(from, n + E.house(P(tt - n, 0, .35))); }
    col.style.transform = `translateY(${-pos}em)`;
    return pos;
  }

  window.M = { cl, P, lerp, E, spring, $, show, lines, linesOut, rise, stroke, path, finger, odometer, bezier };
})();
