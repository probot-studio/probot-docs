"""Brings PNG images under 250 KB: first reduces them to 256 colors, then scales them down if needed."""
import sys, os
from PIL import Image
LIMIT = 250 * 1024
for path in sys.argv[1:]:
    im = Image.open(path).convert('RGB')
    scale = 1.0
    while True:
        k = im if scale == 1.0 else im.resize((int(im.width*scale), int(im.height*scale)), Image.LANCZOS)
        k.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(path, optimize=True)
        if os.path.getsize(path) <= LIMIT or scale < 0.5: break
        scale -= 0.1
    print(f"{os.path.basename(path)}: {os.path.getsize(path)//1024} KB, {k.width}x{k.height}")
