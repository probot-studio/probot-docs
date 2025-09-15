#!/usr/bin/env python3
from PIL import Image
import sys
from pathlib import Path

# Usage:
#   python scripts/make_favicon.py input.png out_base (without extension)
# Example:
#   python scripts/make_favicon.py docs/assets/nfr-logo-white.png docs/assets/favicon
# Produces: docs/assets/favicon.ico (16/32/48), docs/assets/favicon-32.png

def trim_alpha(img: Image.Image) -> Image.Image:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def make_square(img: Image.Image, padding_ratio: float = 0.12) -> Image.Image:
    img = trim_alpha(img)
    w, h = img.size
    side = int(max(w, h) * (1 + padding_ratio))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    x = (side - w) // 2
    y = (side - h) // 2
    canvas.paste(img, (x, y), img)
    return canvas


def main():
    if len(sys.argv) < 3:
        print('Usage: python scripts/make_favicon.py input.png out_base')
        sys.exit(1)
    src = Path(sys.argv[1])
    out_base = Path(sys.argv[2])
    out_base.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(src).convert('RGBA')
    square = make_square(img)

    # Save multi-size ICO
    ico_path = out_base.with_suffix('.ico')
    sizes = [(16, 16), (32, 32), (48, 48)]
    square.save(ico_path, sizes=sizes)

    # Save PNG 32x32
    png32_path = out_base.parent / (out_base.name + '-32.png')
    square.resize((32, 32), Image.LANCZOS).save(png32_path)

    print(f'Wrote {ico_path} and {png32_path}')


if __name__ == '__main__':
    main() 