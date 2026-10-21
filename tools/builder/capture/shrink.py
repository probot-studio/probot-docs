"""Brings PNG images under 250 KB: first reduces them to 256 colors, then scales them down if needed.

The marker color #E6007E keeps its own palette entry, so frames and badges stay exact magenta after
the color reduction (a plain 256-color reduction shifts them towards crimson). Fewer colors are tried
before scaling down, and the result aims for a margin under the limit (MARGIN).

Usage: python3 shrink.py <image.png> ...
       python3 shrink.py --keep-colors <image.png> ...   (thin gizmo rings and arrows: the median cut drops their
       few saturated pixels, the octree reduction keeps them)
       python3 shrink.py --fix-magenta <image.png> ...   (already reduced images: the palette entry the
       markers were mapped to is set back to #E6007E; nothing else changes)
"""
import sys, os
import numpy as np
from PIL import Image
LIMIT = 250 * 1024
MARGIN = 240 * 1024
MAGENTA = (230, 0, 126)


def marker_mask(im):
    return np.abs(np.asarray(im).astype(int) - MAGENTA).sum(axis=2) <= 6


def reduce(im, colors, mask=None, method=Image.Quantize.MEDIANCUT):
    """256-color image with MAGENTA in its own palette entry (the last one)."""
    if mask is None: mask = marker_mask(im)
    q = im.quantize(colors=colors - 1, method=method, dither=Image.Dither.NONE)
    pal = q.getpalette()[:3 * (colors - 1)]
    pal += [0, 0, 0] * (colors - 1 - len(pal) // 3)
    idx = np.asarray(q).copy()
    idx[mask] = colors - 1
    out = Image.fromarray(idx.astype(np.uint8), 'P')
    out.putpalette(pal + list(MAGENTA))
    return out


def shrink(path, method=Image.Quantize.MEDIANCUT):
    im = Image.open(path).convert('RGB')
    full = Image.fromarray((marker_mask(im) * 255).astype(np.uint8), 'L')
    scale = 1.0
    while True:
        size = (int(im.width * scale), int(im.height * scale))
        k = im if scale == 1.0 else im.resize(size, Image.LANCZOS)
        # Scaling blends the 2 px frames into the background; the mask is scaled along so they stay magenta
        mask = np.asarray(full if scale == 1.0 else full.resize(size, Image.BILINEAR)) >= 128
        for colors in (256, 192, 128):
            reduce(k, colors, mask, method).save(path, optimize=True)
            if os.path.getsize(path) <= MARGIN: break
        if os.path.getsize(path) <= LIMIT or scale < 0.5: break
        scale -= 0.1
    print(f"{os.path.basename(path)}: {os.path.getsize(path)//1024} KB, {k.width}x{k.height}")


def fix_magenta(path):
    """Palette image: the most used entry close to MAGENTA (the markers) becomes exact MAGENTA."""
    im = Image.open(path)
    if im.mode != 'P':
        print(f"{os.path.basename(path)}: not a palette image, skipped"); return
    pal = im.getpalette()
    counts = np.bincount(np.asarray(im).ravel(), minlength=len(pal) // 3)
    best = None
    for i in range(len(pal) // 3):
        r, g, b = pal[3 * i:3 * i + 3]
        if counts[i] and abs(r - 230) < 40 and g < 60 and abs(b - 126) < 45 and (best is None or counts[i] > counts[best]):
            best = i
    if best is None or tuple(pal[3 * best:3 * best + 3]) == MAGENTA:
        print(f"{os.path.basename(path)}: nothing to fix"); return
    old = tuple(pal[3 * best:3 * best + 3])
    pal[3 * best:3 * best + 3] = MAGENTA
    im.putpalette(pal)
    im.save(path, optimize=True)
    print(f"{os.path.basename(path)}: entry {best} {old} -> {MAGENTA} ({counts[best]} px), {os.path.getsize(path)//1024} KB")


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--fix-magenta':
        for p in args[1:]: fix_magenta(p)
    elif args and args[0] == '--keep-colors':
        for p in args[1:]: shrink(p, Image.Quantize.FASTOCTREE)
    else:
        for p in args: shrink(p)
