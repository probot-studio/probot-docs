#!/usr/bin/env python3
from PIL import Image
import sys
from pathlib import Path

# Usage:
#   python scripts/recolor_logo.py input.png output.png [mode] [src_hex] [dst_hex] [tolerance]
# Modes:
#   mask (default): recolor ALL non-transparent pixels to dst color, preserve alpha
#   color: recolor pixels within tolerance of src_hex to dst_hex, preserve alpha
# Examples:
#   python scripts/recolor_logo.py docs/assets/nfr-logo.png docs/assets/nfr-logo-white.png
#   python scripts/recolor_logo.py in.png out.png color #00204d #e5e4e2 24

def hex_to_rgb(hex_str: str):
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def within_tol(rgb, target, tol):
    return sum((rgb[i] - target[i])**2 for i in range(3)) <= tol*tol


def recolor(input_path, output_path, mode='mask', src_hex='#00204d', dst_hex='#e5e4e2', tol=24):
    img = Image.open(input_path).convert('RGBA')
    px = img.load()
    w, h = img.size

    src_rgb = hex_to_rgb(src_hex)
    dst_rgb = hex_to_rgb(dst_hex)

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if mode == 'mask':
                px[x, y] = (*dst_rgb, a)
            else:
                if within_tol((r, g, b), src_rgb, tol):
                    px[x, y] = (*dst_rgb, a)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python scripts/recolor_logo.py input.png output.png [mode] [src_hex] [dst_hex] [tolerance]')
        sys.exit(1)
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else 'mask'
    src_hex = sys.argv[4] if len(sys.argv) > 4 else '#00204d'
    dst_hex = sys.argv[5] if len(sys.argv) > 5 else '#e5e4e2'
    tol = int(sys.argv[6]) if len(sys.argv) > 6 else 24
    recolor(input_path, output_path, mode, src_hex, dst_hex, tol)
    print(f'Recolored logo saved to {output_path}') 