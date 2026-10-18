"""Reduces screenshots to 256 colors and at most 250 KB.

Usage: python3 compress.py <folder> [target-folder]
"""
import pathlib
import sys

from PIL import Image

LIMIT = 250 * 1024
source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else source

for png in sorted(source.glob("blocks-*.png")):
    im = Image.open(png).convert("RGB")
    out = target / png.name
    for colors in (256, 128, 64):
        im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)
        if out.stat().st_size <= LIMIT:
            break
    print(f"{png.name}: {out.stat().st_size // 1024} KB, {colors} colors")
