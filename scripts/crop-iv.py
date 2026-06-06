"""One-shot crop: strip Firefox browser chrome (~65px) off the top of the IV
screenshots so the cards match the rhythm of the other 4 portfolio shots.
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "public" / "work"
CROP_TOP = 65  # Firefox tabs + URL bar height in 1920x1032 capture

for name in ("iv-home", "iv-shop"):
    src = ROOT / f"{name}.png"
    im = Image.open(src)
    w, h = im.size
    cropped = im.crop((0, CROP_TOP, w, h))
    cropped.save(src)
    print(f"{name}: {w}x{h} -> {cropped.size[0]}x{cropped.size[1]}")
