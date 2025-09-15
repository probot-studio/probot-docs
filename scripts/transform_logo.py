#!/usr/bin/env python3
from PIL import Image, ImageOps
from collections import deque
import sys
from pathlib import Path

# Usage:
#   python scripts/transform_logo.py input.png output.png [--rotate]
# Steps:
# - Ensure RGBA
# - Fill enclosed transparent regions (holes) with white
# - Optionally rotate 45 degrees CCW when --rotate is provided
# - Trim transparent edges
# - Save

# Replace hole filling with robust border flood fill

def fill_holes_white(img: Image.Image, alpha_threshold: int = 8) -> Image.Image:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    w, h = img.size
    alpha = img.split()[3]
    apx = alpha.load()

    def is_transparent(x: int, y: int) -> bool:
        return apx[x, y] <= alpha_threshold

    # Mark transparent pixels connected to the border (background)
    background = [[False] * w for _ in range(h)]
    q = deque()

    # Seed from all edges
    for x in range(w):
        if is_transparent(x, 0):
            background[0][x] = True
            q.append((x, 0))
        if is_transparent(x, h - 1):
            background[h - 1][x] = True
            q.append((x, h - 1))
    for y in range(h):
        if is_transparent(0, y):
            background[y][0] = True
            q.append((0, y))
        if is_transparent(w - 1, y):
            background[y][w - 1] = True
            q.append((w - 1, y))

    # 4-connected flood fill
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not background[ny][nx] and is_transparent(nx, ny):
                background[ny][nx] = True
                q.append((nx, ny))

    # Any transparent pixel NOT connected to border is a hole → fill with white (opaque)
    pix = img.load()
    for y in range(h):
        for x in range(w):
            if is_transparent(x, y) and not background[y][x]:
                pix[x, y] = (255, 255, 255, 255)

    return img


def rotate_ccw_45(img: Image.Image) -> Image.Image:
    return img.rotate(45, expand=True, resample=Image.BICUBIC)


def trim_alpha(img: Image.Image) -> Image.Image:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    bbox = img.split()[3].getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def main():
    if len(sys.argv) < 3:
        print('Usage: python scripts/transform_logo.py input.png output.png [--rotate]')
        sys.exit(1)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    flags = sys.argv[3:]
    do_rotate = '--rotate' in flags

    img = Image.open(src).convert('RGBA')
    img = fill_holes_white(img)
    if do_rotate:
        img = rotate_ccw_45(img)
    img = trim_alpha(img)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst)
    print(f'Wrote {dst}')


if __name__ == '__main__':
    main() 