# Agrandit une photo de mockup par super-résolution (EDSR), par tuiles pour limiter la mémoire.
# Usage : python lib/upscale.py photo.jpg sortie.jpg modele.pb x2|x4
import sys, cv2, numpy as np
src, dst, modele, f = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4].lstrip('x'))
sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(modele); sr.setModel('edsr', f)
im = cv2.imread(src); H, W = im.shape[:2]; T, O = 240, 12
out = np.zeros((H * f, W * f, 3), np.float32); poids = np.zeros((H * f, W * f, 1), np.float32)
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0, y1, x1 = max(0, y - O), max(0, x - O), min(H, y + T + O), min(W, x + T + O)
        up = sr.upsample(im[y0:y1, x0:x1]).astype(np.float32)
        out[y0 * f:y1 * f, x0 * f:x1 * f] += up; poids[y0 * f:y1 * f, x0 * f:x1 * f] += 1
    print(f'{min(100, int((y + T) / H * 100))} %', flush=True)
cv2.imwrite(dst, np.clip(out / poids, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
