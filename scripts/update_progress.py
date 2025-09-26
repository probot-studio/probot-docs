#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update progress bars across docs/yazilim markdown files.

Behavior:
- Computes percentage per page strictly by navigation order under "Yazılım" in mkdocs.yml.
- Updates in each file (all occurrences):
  - .progress__bar width to computed %
  - .progress__bar background color as a continuous mix from yellow→green based on %
  - .progress__label percentage text replaced/inserted

Usage:
  python3 scripts/update_progress.py
  python3 scripts/update_progress.py --base docs/yazilim --mkdocs mkdocs.yml --dry-run

Exit code 0 on success; non-zero on unexpected exceptions or when nav order is missing.
"""

import argparse
import os
import re
import sys
from typing import Dict, List, Tuple

RE_BAR_STYLE = re.compile(r'(\<div\s+class="progress__bar"\s+style=")(.*?)("\s*\>)', re.IGNORECASE | re.DOTALL)
RE_BAR_NO_STYLE = re.compile(r'(\<div\s+class="progress__bar")(?![^>]*\sstyle=)([^>]*\>)', re.IGNORECASE)
RE_LABEL_BLOCK = re.compile(r'(\<div\s+class="progress__label"\s*\>)(.*?)(\<\/div\>)', re.IGNORECASE | re.DOTALL)
RE_PERCENT_ANY = re.compile(r'(?:%\s*\d{1,3}|\d{1,3}\s*%)')

# Continuous color endpoints
YELLOW = (0xFF, 0xD4, 0x00)  # #ffd400
GREEN  = (0x16, 0xA3, 0x4A)  # #16a34a


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Auto-update progress bars in yazilim docs (nav-only).')
    p.add_argument('--base', default='docs/yazilim', help='Base directory to scan for .md files (default: docs/yazilim)')
    p.add_argument('--mkdocs', default='mkdocs.yml', help='Path to mkdocs.yml')
    p.add_argument('--dry-run', action='store_true', help='Only show what would change, do not write files')
    return p.parse_args()


essential_slash = os.sep


def norm(p: str) -> str:
    return os.path.abspath(os.path.normpath(p))


def list_md_files(base_dir: str) -> List[str]:
    files: List[str] = []
    for root, _, filenames in os.walk(base_dir):
        for fn in filenames:
            if fn.lower().endswith('.md'):
                files.append(os.path.join(root, fn))
    files.sort(key=lambda s: s.lower())
    return files


def parse_nav_yazilim_paths(mkdocs_path: str) -> List[str]:
    """Return nav-ordered list of yazilim/*.md (relative paths) from mkdocs.yml.
    This is a light, heuristic parser to avoid external YAML deps.
    """
    if not os.path.exists(mkdocs_path):
        return []
    try:
        with open(mkdocs_path, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
    except Exception:
        return []

    in_nav = False
    in_yaz = False
    yaz_indent = None
    results: List[str] = []

    for line in lines:
        raw = line.rstrip('\n')
        striped = raw.strip()
        # skip full-line comments
        if striped.startswith('#'):
            continue
        if not in_nav:
            if re.match(r'^\s*nav\s*:\s*$', raw):
                in_nav = True
            continue
        # Find the "- Yazılım:" entry
        m_yaz = re.match(r'^(\s*)-\s*Yazılım\s*:\s*$', raw)
        if m_yaz and not in_yaz:
            in_yaz = True
            yaz_indent = len(m_yaz.group(1))
            continue
        if in_yaz:
            # If we hit a sibling or parent group, stop
            m_group = re.match(r'^(\s*)-\s*[^:]+:\s*.*$', raw)
            if m_group and len(m_group.group(1)) <= (yaz_indent or 0) and not re.match(r'^(\s*)-\s*Yazılım\s*:\s*$', raw):
                in_yaz = False
                continue
            # Capture path on lines like: "- Title: yazilim/xxx.md"
            m_path = re.match(r'^\s*-\s*[^:]+:\s*([^\s#]+)\s*$', raw)
            if m_path:
                rel = m_path.group(1).strip().strip('\"\'')
                if rel.startswith('yazilim/') and rel.endswith('.md'):
                    results.append(rel)
    return results


def mix_channel(a: int, b: int, t: float) -> int:
    return max(0, min(255, int(round(a + (b - a) * t))))


def mix_color_hex(percent: int) -> str:
    t = max(0.0, min(1.0, percent / 100.0))
    r = mix_channel(YELLOW[0], GREEN[0], t)
    g = mix_channel(YELLOW[1], GREEN[1], t)
    b = mix_channel(YELLOW[2], GREEN[2], t)
    return f"#{r:02x}{g:02x}{b:02x}"


def parse_style(style: str) -> Dict[str, str]:
    d: Dict[str, str] = {}
    parts = [p.strip() for p in style.split(';')]
    for part in parts:
        if not part:
            continue
        if ':' in part:
            k, v = part.split(':', 1)
            d[k.strip().lower()] = v.strip()
    return d


def build_style(style_map: Dict[str, str], keep_trailing_semicolon: bool) -> str:
    # Put width & background first for readability
    ordered_keys = ['width', 'background'] + [k for k in style_map.keys() if k not in ('width', 'background')]
    seen = set()
    chunks = []
    for k in ordered_keys:
        if k in style_map and k not in seen:
            chunks.append(f"{k}: {style_map[k]}")
            seen.add(k)
    built = '; '.join(chunks)
    if keep_trailing_semicolon and not built.endswith(';'):
        built += ';'
    return built


def update_bar_styles(content: str, percent: int) -> str:
    color = mix_color_hex(percent)
    gradient = f'linear-gradient(90deg, {color}, {color})'  # solid color with smooth percent-based mix

    def _with_style(m):
        prefix, style, suffix = m.group(1), m.group(2), m.group(3)
        style_map = parse_style(style)
        style_map['width'] = f'{percent}%'
        style_map['background'] = gradient
        keep_sc = style.strip().endswith(';')
        new_style = build_style(style_map, keep_sc)
        return f"{prefix}{new_style}{suffix}"

    new_content = RE_BAR_STYLE.sub(_with_style, content)

    # If no style attr existed, add one
    def _no_style(m):
        prefix, suffix = m.group(1), m.group(2)
        style = f'style="width: {percent}%; background: {gradient}"'
        # insert a space before style if not present
        return f"{prefix} {style}{suffix}"

    new_content2 = RE_BAR_NO_STYLE.sub(_no_style, new_content)
    return new_content2


def update_label_percent(content: str, percent: int) -> str:
    def _label_repl(m):
        start, inner, end = m.group(1), m.group(2), m.group(3)
        if RE_PERCENT_ANY.search(inner):
            inner_new = RE_PERCENT_ANY.sub(f"%{percent}", inner)
        else:
            inner_new = inner.rstrip() + f" %{percent}"
        return f"{start}{inner_new}{end}"

    return RE_LABEL_BLOCK.sub(_label_repl, content)


def compute_order(base_dir: str, mkdocs_path: str) -> List[str]:
    base_abs = norm(base_dir)
    all_files = list_md_files(base_abs)

    rels = parse_nav_yazilim_paths(mkdocs_path)
    if not rels:
        # No nav entries found for Yazılım
        return []

    docs_root = norm(os.path.join(base_abs, '..'))  # docs/
    nav_abs = [norm(os.path.join(docs_root, rel)) for rel in rels]
    # keep only existing files under base
    nav_abs = [p for p in nav_abs if p.startswith(base_abs + essential_slash) and os.path.exists(p)]

    if not nav_abs:
        # Nav was present but mapped to no existing files under base
        return []

    # Strict nav-only: do not include non-nav files
    return nav_abs


def main() -> int:
    args = parse_args()
    base_abs = norm(args.base)
    mkdocs_abs = norm(args.mkdocs)

    if not os.path.isdir(base_abs):
        print(f"[ERROR] Base directory not found: {base_abs}", file=sys.stderr)
        return 2

    ordered = compute_order(base_abs, mkdocs_abs)
    if len(ordered) == 0:
        print(f"[ERROR] No Yazılım nav entries found in {mkdocs_abs} or none map to files under {base_abs}. Aborting to avoid alphabetical fallback.", file=sys.stderr)
        return 3

    total = len(ordered)
    if total == 0:
        print(f"[WARN] No markdown files found under {base_abs}")
        return 0

    changed_files: List[str] = []

    for idx, fpath in enumerate(ordered):
        percent = round(((idx + 1) / total) * 100)
        percent = max(0, min(100, percent))

        try:
            with open(fpath, 'r', encoding='utf-8') as rf:
                content = rf.read()
        except Exception as e:
            print(f"[WARN] Could not read {fpath}: {e}")
            continue

        newc = content
        newc = update_bar_styles(newc, percent)
        newc = update_label_percent(newc, percent)

        if newc != content:
            if args.dry_run:
                print(f"[DRY] {fpath}: -> {percent}% color={mix_color_hex(percent)}")
            else:
                try:
                    with open(fpath, 'w', encoding='utf-8') as wf:
                        wf.write(newc)
                    changed_files.append(fpath)
                    print(f"[OK]  {fpath}: -> {percent}% color={mix_color_hex(percent)}")
                except Exception as e:
                    print(f"[ERR] Could not write {fpath}: {e}")
        else:
            print(f"[==] {fpath}: no changes")

    print(f"\nDone. Total files: {total}, updated: {len(changed_files)}")
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("Interrupted.")
        sys.exit(130) 