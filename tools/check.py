#!/usr/bin/env python3
"""Checks the guides against the rules in STYLE-GUIDE.md (and en/STYLE-GUIDE.md for English pages).

Usage: python3 tools/check.py [tools/<guide> | tools/en/<guide> | tools/en ...]
       (no arguments: all Turkish guides, then all English guides under tools/en/)
Exit code: 1 if there is any ERROR, otherwise 0. WARN does not change the exit code.

Tool guides (blocks, builder, sim) need the fixed page set, a CAPTURE line per image and SAY
lines. Library guides (LIBRARY_GUIDES, e.g. core) skip those three; for them an em dash in prose,
more than one box per section, an unused image or an image not named <guide>-*.png is an ERROR.

English guides (tools/en/<guide>/) get the same rules as their Turkish guide, with the English
fixed words (EN) in place of the Turkish ones (TR). On top of that: every English page has a
Turkish page with the same file name, links to #anchors resolve (heading ids as the site makes
them), a link into a Turkish guide ends its text with "(in Turkish)", and images come from
../../<guide>/img/ (shared Turkish screenshots) or img/ (English screenshots in
tools/en/<guide>/img/). A Turkish guide's image counts as used when an English page uses it.
There is no video-script.json in English. The landing pages (tools/index.md, tools/en/index.md)
are not checked.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EN_ROOT = ROOT / "en"
# Fixed words of each page language. TR: STYLE-GUIDE.md; EN: en/STYLE-GUIDE.md section 3.
TR = dict(
    # Forbidden Turkish words; they match Turkish page text, so they stay Turkish.
    forbidden=["kolayca", "basitçe", "sadece", "hemen", "tabii ki", "açıkça"],
    # Turkish observation verbs that must not start a numbered step.
    observation={"bak", "bul", "gör", "bekle", "izle"},
    # sections that need no SAY line
    no_say=("Başlamadan önce", "Sorun mu var?", "Sonraki adım"),
    # labels that close a procedure; the first one is named in the report
    result=("Sonuç", "Kontrol et"),
    # cause / fix labels required on sorunlar.md
    cause=("Sebep:", "Çözüm:"),
    # title of the temporary box for dev-only features (not counted toward the box limit)
    soon="Yakında",
)
EN = dict(
    forbidden=["easily", "simply", "just", "immediately", "of course", "obviously"],
    observation={"look", "find", "see", "wait", "watch"},
    no_say=("Before you start", "Having trouble?", "Next step"),
    result=("Result", "Check"),
    cause=("Cause:", "Fix:"),
    soon="Coming soon",
)
SPECIAL_PAGES = {"index.md", "arayuz.md", "kisayollar.md", "sorunlar.md"}
# Library guides (code libraries and kits, not apps): no required page set, no CAPTURE/SAY lines.
LIBRARY_GUIDES = {"core", "starter-bot"}
IMAGE_KB_LIMIT = 250
LINK = r"\]\(([^)\s]+)"

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


def check_page(md, counts, library=False, used_images=None, lang=TR):
    lines = strip_code(md.read_text(encoding="utf-8"))
    name = md.name
    is_task = name not in SPECIAL_PAGES and not name.endswith("-listesi.md")

    # links and images
    for i, s in enumerate(lines, 1):
        for target in re.findall(LINK, s):
            if re.match(r"(https?:|mailto:|#)", target):
                continue
            path = (md.parent / target.split("#")[0]).resolve()
            if not path.exists():
                report("ERROR", md, i, f"broken link/image: {target}")
            elif used_images is not None:
                used_images.add(path)
        for word in lang["forbidden"]:
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
        if is_task and m and m.group(1).lower() in lang["observation"]:
            report("WARN", md, i, f"step starts with an observation verb: {m.group(1)}")

    cause, fix = lang["cause"]
    if name == "sorunlar.md" and cause not in "\n".join(lines):
        report("WARN", md, 0, f"sorunlar.md: no '{cause}' / '{fix}' format")

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

    result = "|".join(re.escape(r) for r in lang["result"])
    for line_no, heading, body in sections:
        counts["sections"] += 1
        text = "\n".join(body)
        if "<!-- SAY:" in text:
            counts["say"] += 1
        elif is_task and not library and heading not in lang["no_say"]:
            report("WARN", md, line_no, f"section '{heading}' has no SAY line")
        steps = [s for s in body if re.match(r"\d+\. ", s)]
        if steps:
            counts["procedures"] += 1
            counts["steps"] += len(steps)
            if not 3 <= len(steps) <= 7 and is_task:
                report("WARN", md, line_no, f"'{heading}': {len(steps)} steps (should be 3-7)")
            if is_task and not re.search(rf"^\**({result}):", text, re.M):
                report("ERROR", md, line_no, f"'{heading}': procedure does not end with a {lang['result'][0]}: line")

    # boxes: at most one per ## or ### section (an error in a library guide); the temporary
    # box for dev-only features (lang["soon"]) is not counted
    block, boxes = (0, "(top)"), 0
    for i, s in enumerate(lines + ["## (end)"], 1):
        if re.match(r"#{2,3} ", s):
            if boxes > 1:
                report("ERROR" if library else "WARN", md, block[0], f"'{block[1]}': {boxes} boxes (at most 1 per section)")
            block, boxes = (i, s.lstrip("#").strip()), 0
        elif re.match(r"!!! \w+", s) and not re.match(rf'!!! info "{lang["soon"]}"', s):
            boxes += 1

    if is_task and not lines[0].startswith("# "):
        report("ERROR", md, 1, "page does not start with a # heading")


def linked_files(md):
    """Resolved local link and image targets of a page (no reports)."""
    out = set()
    for s in strip_code(md.read_text(encoding="utf-8")):
        for target in re.findall(LINK, s):
            if not re.match(r"(https?:|mailto:|#)", target):
                out.add((md.parent / target.split("#")[0]).resolve())
    return out


def slugify(text, legacy=False):
    """Heading id as the site makes it (apps/site/lib/docs.mjs slugify / legacySlugify)."""
    if not legacy:
        text = re.sub("[ıİ]", "i", text)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


_ids = {}


def page_ids(md):
    """Every id a link can land on in a page: headings ({#id} or slug, current and legacy rule,
    numbered _1, _2 for duplicates) and empty <a id="x"></a> lines."""
    if md not in _ids:
        ids, current, legacy = set(), set(), set()

        def unique(base, taken):
            out, n = base, 0
            while out in taken:
                n += 1
                out = f"{base}_{n}"
            taken.add(out)
            return out

        for s in strip_code(md.read_text(encoding="utf-8")):
            a = re.match(r'<a id="([\w-]+)"></a>\s*$', s)
            if a:
                ids.add(a.group(1))
                current.add(a.group(1))
                legacy.add(a.group(1))
            h = re.match(r"#{1,6} (.+?)\s*$", s)
            if not h:
                continue
            text = h.group(1)
            explicit = re.search(r"\s*\{#([\w-]+)\}$", text)
            if explicit:
                ids.add(unique(explicit.group(1), current))
                ids.add(unique(explicit.group(1), legacy))
                continue
            text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)  # links -> their text
            text = re.sub(r"<[^>]+>", "", text)  # <kbd> and other tags
            text = text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
            ids.add(unique(slugify(text), current))
            ids.add(unique(slugify(text, legacy=True), legacy))
        _ids[md] = ids
    return _ids[md]


def check_english_page(md, guide):
    """Rules only English pages have (see the docstring); `guide` is the Turkish guide folder."""
    lines = strip_code(md.read_text(encoding="utf-8"))
    if not (guide / md.name).exists():
        report("ERROR", md, 0, f"no Turkish page {md.name} in {guide.relative_to(ROOT.parent)}/")
    for i, s in enumerate(lines, 1):
        if s.lstrip().startswith("<!--"):
            continue
        for image, text, target in re.findall(r"(!?)\[((?:[^\]\[]|\[[^\]]*\])*)\]\(([^)\s]+)", s):
            if re.match(r"(https?:|mailto:)", target):
                continue
            file, _, anchor = target.partition("#")
            path = (md.parent / file).resolve() if file else md
            if not path.exists():
                continue  # reported as a broken link by check_page
            if image:
                if path.parent not in (guide / "img", md.parent / "img"):
                    report("ERROR", md, i, f"image is not in ../../{guide.name}/img/ or img/: {target}")
                elif path.parent == guide / "img" and (md.parent / "img" / path.name).exists():
                    report("WARN", md, i, f"English screenshot exists, use img/{path.name}: {target}")
                continue
            if anchor and path.suffix == ".md" and anchor not in page_ids(path):
                report("ERROR", md, i, f"broken anchor: {target}")
            if path.suffix == ".md" and EN_ROOT not in path.parents and not text.strip(" *").endswith("(in Turkish)"):
                report("ERROR", md, i, f"link into a Turkish page does not end with '(in Turkish)': {target}")


def check_tool(folder):
    english = folder.parent == EN_ROOT
    guide = ROOT / folder.name  # the Turkish guide (the folder itself for a Turkish guide)
    lang = EN if english else TR
    library = folder.name in LIBRARY_GUIDES
    counts = dict(pages=0, sections=0, procedures=0, steps=0, images=0, pending_images=0, say=0)
    used_images = set()
    for md in sorted(folder.glob("*.md")):
        counts["pages"] += 1
        check_page(md, counts, library, used_images, lang)
        if english:
            check_english_page(md, guide)
    required_pages = ["index.md"] if library else ["index.md", "ilk-10-dakika.md", "arayuz.md", "kisayollar.md", "sorunlar.md"]
    for required in required_pages:
        if not (folder / required).exists():
            report("ERROR", folder, 0, f"{required} missing")
    if english:
        for md in sorted(guide.glob("*.md")):
            if not (folder / md.name).exists():
                report("WARN", folder, 0, f"{md.name} not translated yet")
    script = folder / "video-script.json"
    if library or english:
        pass  # no videos for a library guide; video scripts are not translated
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
    if not english:
        # the shared screenshots are used by the English pages too
        for md in sorted((EN_ROOT / folder.name).glob("*.md")):
            used_images |= linked_files(md)
    for img in sorted((folder / "img").glob("*")) if (folder / "img").exists() else []:
        kb = img.stat().st_size / 1024
        if kb > IMAGE_KB_LIMIT:
            report("ERROR" if library else "WARN", img, 0, f"{kb:.0f} KB (>{IMAGE_KB_LIMIT})")
        if img.resolve() not in used_images:
            report("ERROR" if library else "WARN", img, 0, "image not used by any page")
        if library and not re.fullmatch(rf"{re.escape(folder.name)}-[a-z0-9-]+\.png", img.name):
            report("ERROR", img, 0, f"image name is not {folder.name}-<name>.png")
    label = f"en/{folder.name}" if english else folder.name
    print(f"SUMMARY {label}: " + ", ".join(f"{k}={v}" for k, v in counts.items()))


def guides(parent):
    return sorted(p for p in parent.iterdir() if p.is_dir() and p != EN_ROOT and (p / "index.md").exists())


targets = []
for a in sys.argv[1:]:
    p = Path(a).resolve()
    targets += guides(EN_ROOT) if p == EN_ROOT else [p]
if not sys.argv[1:]:
    targets = guides(ROOT) + (guides(EN_ROOT) if EN_ROOT.exists() else [])
for t in targets:
    check_tool(t)
sys.exit(1 if errors else 0)
