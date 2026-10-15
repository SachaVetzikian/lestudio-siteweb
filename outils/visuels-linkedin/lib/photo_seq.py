# Incruste une séquence d'images (scroll enregistré) dans un mockup photo, avec le même rendu HD que photo.py.
import sys, os, json, glob, cv2
sys.path.insert(0, os.path.dirname(__file__))
from photo import Scene
cfg = json.loads(sys.argv[1]); scene = Scene(cfg)
taille = tuple(cfg.get('taille_gif', [1080, 1350]))
for f in sorted(glob.glob(os.path.join(cfg['frames'], 'f*.jpg'))):
    out = scene.composer(cv2.imread(f))
    cv2.imwrite(f.replace('/f', '/c'), cv2.resize(out, taille, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 92])
