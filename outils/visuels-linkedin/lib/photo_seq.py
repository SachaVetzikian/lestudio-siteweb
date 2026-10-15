# Incruste une séquence d'images (scroll enregistré) dans l'écran d'une photo de mockup.
# La détection de l'écran et la déformation sont calculées une seule fois pour toute la séquence.
import sys, json, glob, os, cv2, numpy as np
sys.argv = [sys.argv[0], sys.argv[1]]
cfg = json.loads(sys.argv[1])
src = open(os.path.join(os.path.dirname(__file__), 'photo.py')).read()
ns = {}
exec(src.split("cfg = json.loads(sys.argv[1])")[0], ns)  # fonctions screen_quad / preparer_capture
im = cv2.imread(cfg['photo']); H0, W0 = im.shape[:2]
quad = np.array(cfg['quad'], np.float32) if 'quad' in cfg else ns['screen_quad'](im, cfg['seed'], cfg.get('thr', 70))
if cfg.get('grow'):
    c0 = quad.mean(0); quad = (c0 + (quad - c0) * (1 + cfg['grow'] / np.linalg.norm(quad - c0, axis=1).mean())).astype(np.float32)
cw = 1440; ch = int(cw / cfg['ratio'])
mask = np.zeros((ch, cw), np.uint8); rad = int(cfg.get('radius', 0) * cw)
cv2.rectangle(mask, (rad, 0), (cw - rad, ch), 255, -1); cv2.rectangle(mask, (0, rad), (cw, ch - rad), 255, -1)
for x, y in [(rad, rad), (cw - rad, rad), (rad, ch - rad), (cw - rad, ch - rad)]: cv2.circle(mask, (x, y), rad, 255, -1, cv2.LINE_AA)
if 'notch' in cfg:
    nw, nh = int(cfg['notch'][0] * cw), int(cfg['notch'][1] * ch); x0 = (cw - nw) // 2; nr = nh // 2
    cv2.rectangle(mask, (x0 + nr, 0), (x0 + nw - nr, nh), 0, -1); cv2.rectangle(mask, (x0, 0), (x0 + nw, nh - nr), 0, -1)
    cv2.circle(mask, (x0 + nr, nh - nr), nr, 0, -1, cv2.LINE_AA); cv2.circle(mask, (x0 + nw - nr, nh - nr), nr, 0, -1, cv2.LINE_AA)
gy, gx = np.mgrid[0:ch, 0:cw]; gloss = np.clip(1 - (gx / cw + gy / ch) * .9, 0, 1)[..., None] * cfg.get('gloss', .06) * 255
x, y, w, h = cfg.get('crop', [0, 0, W0, H0])
S = 2
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), quad * S)
# on ne travaille que sur la zone recadrée, en suréchantillonnage x2
T = np.array([[1, 0, -x * S], [0, 1, -y * S], [0, 0, 1]], np.float64) @ M
fond = cv2.resize(im, (W0 * S, H0 * S), interpolation=cv2.INTER_CUBIC)[y * S:(y + h) * S, x * S:(x + w) * S].astype(np.float32)
wm = cv2.warpPerspective(mask, T, (w * S, h * S), flags=cv2.INTER_LINEAR).astype(np.float32)[..., None] / 255
taille = tuple(cfg.get('size', [w, h]))
for f in sorted(glob.glob(os.path.join(cfg['frames'], 'f*.jpg'))):
    cap = ns['preparer_capture'](cv2.imread(f), cfg)
    cap = cv2.resize(cap, (cw, ch), interpolation=cv2.INTER_AREA)
    cap = np.clip(cap.astype(np.float32) + gloss, 0, 255)
    wc = cv2.warpPerspective(cap, T, (w * S, h * S), flags=cv2.INTER_LINEAR)
    out = (fond * (1 - wm) + wc * wm).astype(np.uint8)
    cv2.imwrite(f.replace('/f', '/c'), cv2.resize(out, taille, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 92])
