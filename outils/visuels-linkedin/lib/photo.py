# Incruste une capture dans l'écran d'une photo de mockup, en perspective.
# Usage : python3 lib/photo.py '<json>'  (appelé par run.mjs)
# 1. trouve l'écran : zone claire connectée au point "seed" (ou coins "quad" donnés à la main)
# 2. ajuste 4 droites sur les bords pour des coins nets malgré les arrondis
# 3. déforme la capture (homographie), ajoute arrondis et encoche, compose
import sys, json, cv2, numpy as np


def screen_quad(im, seed, thr):
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    _, lab = cv2.connectedComponents((g > thr).astype(np.uint8))
    m = (lab == lab[seed[1], seed[0]]).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    hull = cv2.convexHull(c)
    for eps in np.linspace(0.01, 0.15, 80):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4:
            break
    q = ap.reshape(-1, 2).astype(float)
    s, d = q.sum(1), np.diff(q, axis=1).ravel()
    q = np.array([q[s.argmin()], q[d.argmin()], q[s.argmax()], q[d.argmax()]])  # HG HD BD BG
    pts = c.reshape(-1, 2).astype(float)
    lines = []
    for i in range(4):
        a, b = q[i], q[(i + 1) % 4]
        L = np.linalg.norm(b - a); u = (b - a) / L
        t = (pts - a) @ u
        dist = np.abs((pts - a) @ np.array([-u[1], u[0]]))
        sel = pts[(t > .2 * L) & (t < .8 * L) & (dist < 12)]
        vx, vy, x0, y0 = cv2.fitLine(sel.astype(np.float32), cv2.DIST_HUBER, 0, .01, .01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))
    out = []
    for i in range(4):
        (p1, d1), (p2, d2) = lines[i - 1], lines[i]
        t = np.linalg.solve(np.array([d1, -d2]).T, p2 - p1)
        out.append(p1 + t[0] * d1)
    return np.array(out, np.float32)


cfg = json.loads(sys.argv[1])
im = cv2.imread(cfg['photo'])
H0, W0 = im.shape[:2]
quad = np.array(cfg['quad'], np.float32) if 'quad' in cfg else screen_quad(im, cfg['seed'], cfg.get('thr', 70))
if cfg.get('grow'):  # agrandit légèrement l'écran pour couvrir les liserés
    c0 = quad.mean(0)
    quad = (c0 + (quad - c0) * (1 + cfg['grow'] / np.linalg.norm(quad - c0, axis=1).mean())).astype(np.float32)

cap = cv2.imread(cfg['capture'])
if cfg.get('pad_top'):  # place pour la barre de statut / l'encoche : on prolonge la couleur du haut du site
    ph = int(round(cfg['pad_top'] * cap.shape[0]))
    cap = np.vstack([np.tile(cap[:1], (ph, 1, 1)), cap])
ar = cap.shape[1] / cap.shape[0]
if abs(ar - cfg['ratio']) / cfg['ratio'] > .03:  # règle : jamais de recadrage ni de déformation
    sys.exit(f"REFUS {cfg['capture']} : ratio {ar:.3f} != écran {cfg['ratio']:.3f}. Recapture au bon viewport.")

cw = 1600; ch = int(cw / cfg['ratio'])
cap = cv2.resize(cap, (cw, ch), interpolation=cv2.INTER_AREA)
mask = np.zeros((ch, cw), np.uint8)
rad = int(cfg.get('radius', 0) * cw)
cv2.rectangle(mask, (rad, 0), (cw - rad, ch), 255, -1)
cv2.rectangle(mask, (0, rad), (cw, ch - rad), 255, -1)
for x, y in [(rad, rad), (cw - rad, rad), (rad, ch - rad), (cw - rad, ch - rad)]:
    cv2.circle(mask, (x, y), rad, 255, -1, cv2.LINE_AA)
if 'notch' in cfg:  # [largeur, hauteur] en fraction de l'écran
    nw, nh = int(cfg['notch'][0] * cw), int(cfg['notch'][1] * ch)
    x0 = (cw - nw) // 2; nr = nh // 2
    cv2.rectangle(mask, (x0 + nr, 0), (x0 + nw - nr, nh), 0, -1)
    cv2.rectangle(mask, (x0, 0), (x0 + nw, nh - nr), 0, -1)
    cv2.circle(mask, (x0 + nr, nh - nr), nr, 0, -1, cv2.LINE_AA)
    cv2.circle(mask, (x0 + nw - nr, nh - nr), nr, 0, -1, cv2.LINE_AA)
gy, gx = np.mgrid[0:ch, 0:cw]  # léger reflet diagonal
gloss = np.clip(1 - (gx / cw + gy / ch) * .9, 0, 1)[..., None] * cfg.get('gloss', .06) * 255
cap = np.clip(cap.astype(float) + gloss, 0, 255).astype(np.uint8)

S = 3  # suréchantillonnage pour des bords nets
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), quad * S)
big = cv2.resize(im, (W0 * S, H0 * S), interpolation=cv2.INTER_CUBIC)
wc = cv2.warpPerspective(cap, M, (W0 * S, H0 * S), flags=cv2.INTER_AREA)
wm = cv2.warpPerspective(mask, M, (W0 * S, H0 * S), flags=cv2.INTER_LINEAR).astype(float)[..., None] / 255
out = (big * (1 - wm) + wc * wm).astype(np.uint8)
out = cv2.resize(out, (W0, H0), interpolation=cv2.INTER_AREA)
x, y, w, h = cfg.get('crop', [0, 0, W0, H0])
out = out[y:y + h, x:x + w]
if 'size' in cfg:
    up = out.shape[1] < cfg['size'][0]
    out = cv2.resize(out, tuple(cfg['size']), interpolation=cv2.INTER_CUBIC if up else cv2.INTER_AREA)
cv2.imwrite(cfg['out'], out, [cv2.IMWRITE_JPEG_QUALITY, 95])
