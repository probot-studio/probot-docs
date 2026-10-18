"""Reduces screenshots to 256 colors and at most 250 KB; scales them down if that is not enough.

Usage: python3 compress.py <dir> [target-dir]
"""
import pathlib
import sys

from PIL import Image

LIMIT = 250 * 1024
source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else source

for png in sorted(source.glob("sim-*.png")):
    im = Image.open(png).convert("RGB")
    out = target / png.name
    scale = 1.0
    while True:
        sized = im if scale == 1.0 else im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        for colors in (256, 128, 64):
            sized.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)
            if out.stat().st_size <= LIMIT:
                break
        if out.stat().st_size <= LIMIT or scale < 0.5:
            break
        scale -= 0.1
    print(f"{png.name}: {out.stat().st_size // 1024} KB, {colors} colors, scale {scale:.1f}, {sized.width}x{sized.height}")
