#!/usr/bin/env python3
"""Checks the guides against the rules in STYLE-GUIDE.md.

Usage: python3 tools/check.py [tools/<guide> ...]   (no arguments: all guides)
Exit code: 1 if there is any ERROR, otherwise 0. WARN does not change the exit code.

Tool guides (blocks, builder, sim) need the fixed page set, a CAPTURE line per image and SAY
lines. Library guides (LIBRARY_GUIDES, e.g. core) skip those three; for them an em dash in prose,
more than one box per section, an unused image or an image not named <guide>-*.png is an ERROR.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Forbidden Turkish words; they match Turkish page text, so they stay Turkish.
FORBIDDEN_WORDS = ["kolayca", "basitçe", "sadece", "hemen", "tabii ki", "açıkça"]
SPECIAL_PAGES = {"index.md", "arayuz.md", "kisayollar.md", "sorunlar.md"}
# Library guides (code libraries, not apps): no required page set, no CAPTURE/SAY lines.
LIBRARY_GUIDES = {"core"}
IMAGE_KB_LIMIT = 250
# Turkish observation verbs that must not start a numbered step.
OBSERVATION_VERBS = {"bak", "bul", "gör", "bekle", "izle"}

errors = 0


def report(level, path, line, message):
    global errors
    if level == "ERROR":
        errors += 1
    try:
        name = path.relative_to(ROOT.parent)
    except ValueError:
        name = path
    where = f"{name}:{line}" if line else str(name)
    print(f"{level:5} {where}: {message}")


def strip_code(text):
    """Replaces ``` blocks with empty lines (line numbers are preserved)."""
    out, inside = [], False
    for s in text.split("\n"):
        if s.lstrip().startswith("```"):
            inside = not inside
            out.append("")
            continue
        out.append("" if inside else s)
    return out


def check_page(md, counts, library=False, used_images=None):
    lines = strip_code(md.read_text(encoding="utf-8"))
    name = md.name
    is_task = name not in SPECIAL_PAGES and not name.endswith("-listesi.md")

    # links and images
    for i, s in enumerate(lines, 1):
        for target in re.findall(r"\]\(([^)\s]+)", s):
            if re.match(r"(https?:|mailto:|#)", target):
                continue
            path = (md.parent / target.split("#")[0]).resolve()
            if not path.exists():
                report("ERROR", md, i, f"broken link/image: {target}")
            elif used_images is not None:
                used_images.add(path)
        for word in FORBIDDEN_WORDS:
            if re.search(rf"(?<![\wçğıöşü]){word}(?![\wçğıöşü])", s, re.I) and not s.lstrip().startswith("<!--"):
                report("WARN", md, i, f"forbidden word: {word}")
        if "\u2014" in s:
            report("ERROR" if library else "WARN", md, i, "em dash")

    # image -> CAPTURE
    for i, s in enumerate(lines, 1):
        if re.search(r"!\[[^\]]*\]\(", s):
            counts["images"] += 1
            following = " ".join(lines[i:i + 3])
            preceding = " ".join(lines[max(0, i - 4):i - 1])
            if not library and "<!-- CAPTURE:" not in following and "<!-- CAPTURE:" not in preceding:
                report("ERROR", md, i, "image has no CAPTURE line next to it")
            alt = re.search(r"!\[([^\]]*)\]", s).group(1)
            if not alt:
                report("ERROR", md, i, "image has no alt text")
            elif len(alt) > 150:
                report("WARN", md, i, f"alt text is {len(alt)} characters (>150)")

    # placeholders for images not yet captured, and steps that start with an observation verb
    for i, s in enumerate(lines, 1):
        if "<!-- IMAGE-PENDING:" in s:
            counts["pending_images"] += 1
            report("WARN", md, i, "image not captured yet (IMAGE-PENDING)")
        m = re.match(r"\s*\d+\. (\w+)", s)
        if is_task and m and m.group(1).lower() in OBSERVATION_VERBS:
            report("WARN", md, i, f"step starts with an observation verb: {m.group(1)}")

    # "Sebep:" / "Çözüm:" are the Turkish cause/fix labels required on sorunlar.md
    if name == "sorunlar.md" and "Sebep:" not in "\n".join(lines):
        report("WARN", md, 0, "sorunlar.md: no 'Sebep:' / 'Çözüm:' format")

    # ## sections: SAY, procedure length, result line
    sections, current = [], None
    for i, s in enumerate(lines, 1):
        if s.startswith("## "):
            if current:
                sections.append(current)
            current = (i, s[3:].strip(), [])
        elif current:
            current[2].append(s)
    if current:
        sections.append(current)

    for line_no, heading, body in sections:
        counts["sections"] += 1
        text = "\n".join(body)
        if "<!-- SAY:" in text:
            counts["say"] += 1
        elif is_task and not library and heading not in ("Başlamadan önce", "Sorun mu var?", "Sonraki adım"):
            report("WARN", md, line_no, f"section '{heading}' has no SAY line")
        steps = [s for s in body if re.match(r"\d+\. ", s)]
        if steps:
            counts["procedures"] += 1
            counts["steps"] += len(steps)
            if not 3 <= len(steps) <= 7 and is_task:
                report("WARN", md, line_no, f"'{heading}': {len(steps)} steps (should be 3-7)")
            if is_task and not re.search(r"^\**(Sonuç|Kontrol et):", text, re.M):
                report("ERROR", md, line_no, f"'{heading}': procedure does not end with a Sonuç: line")

    # boxes: at most one per ## or ### section (an error in a library guide); the temporary
    # "Yakında" box for dev-only features is not counted
    block, boxes = (0, "(top)"), 0
    for i, s in enumerate(lines + ["## (end)"], 1):
        if re.match(r"#{2,3} ", s):
            if boxes > 1:
                report("ERROR" if library else "WARN", md, block[0], f"'{block[1]}': {boxes} boxes (at most 1 per section)")
            block, boxes = (i, s.lstrip("#").strip()), 0
        elif re.match(r"!!! \w+", s) and not re.match(r'!!! info "Yakında"', s):
            boxes += 1

    if is_task and not lines[0].startswith("# "):
        report("ERROR", md, 1, "page does not start with a # heading")


def check_tool(folder):
    library = folder.name in LIBRARY_GUIDES
    counts = dict(pages=0, sections=0, procedures=0, steps=0, images=0, pending_images=0, say=0)
    used_images = set()
    for md in sorted(folder.glob("*.md")):
        counts["pages"] += 1
        check_page(md, counts, library, used_images)
    required_pages = ["index.md"] if library else ["index.md", "ilk-10-dakika.md", "arayuz.md", "kisayollar.md", "sorunlar.md"]
    for required in required_pages:
        if not (folder / required).exists():
            report("ERROR", folder, 0, f"{required} missing")
    script = folder / "video-script.json"
    if library:
        pass  # no videos for a library guide
    elif script.exists():
        try:
            data = json.loads(script.read_text(encoding="utf-8"))
            scenes = sum(len(v.get("scenes", [])) for v in data.get("videos", []))
            counts["videos"] = len(data.get("videos", []))
            counts["scenes"] = scenes
            for v in data.get("videos", []):
                for sc in v.get("scenes", []):
                    if not str(sc.get("url", "")).startswith("https://probotstudio.com/"):
                        report("ERROR", script, 0, f"{v.get('id')}/{sc.get('id')}: url is not prod")
        except json.JSONDecodeError as e:
            report("ERROR", script, e.lineno, f"invalid JSON: {e.msg}")
    else:
        report("WARN", folder, 0, "video-script.json missing")
    for img in sorted((folder / "img").glob("*")) if (folder / "img").exists() else []:
        kb = img.stat().st_size / 1024
        if kb > IMAGE_KB_LIMIT:
            report("ERROR" if library else "WARN", img, 0, f"{kb:.0f} KB (>{IMAGE_KB_LIMIT})")
        if img.resolve() not in used_images:
            report("ERROR" if library else "WARN", img, 0, "image not used by any page")
        if library and not re.fullmatch(rf"{re.escape(folder.name)}-[a-z0-9-]+\.png", img.name):
            report("ERROR", img, 0, f"image name is not {folder.name}-<name>.png")
    print(f"SUMMARY {folder.name}: " + ", ".join(f"{k}={v}" for k, v in counts.items()))


targets = [Path(a).resolve() for a in sys.argv[1:]] or sorted(
    p for p in ROOT.iterdir() if p.is_dir() and (p / "index.md").exists())
for t in targets:
    check_tool(t)
sys.exit(1 if errors else 0)
