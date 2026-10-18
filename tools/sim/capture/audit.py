"""Quality audit for the Sim docs: measures, counts, exits with 1 if there are errors.

- Every procedure (numbered list) has 3-7 steps and is followed directly by a "Sonuç:" line.
- Every procedure has at least one image; every image has a CAPTURE comment next to it.
- Every ## section has at least one SAY comment.
- Internal links and anchors resolve, image files exist and are at most 250 KB.
- video-script.json is valid JSON.

Usage: python3 capture/audit.py   (from tools/sim or from anywhere)

Optional: SIBLING_TOOL_DIR, a path pattern containing {tool} (for example
../other-checkout/tools/{tool}). When a ../<tool>/ link target is missing here, it is
looked up there instead, for pages of other tools that live on their own branches.
"""
import json
import os
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent  # tools/sim
LIMIT = 250 * 1024
SIBLING_TOOL_DIR = os.environ.get("SIBLING_TOOL_DIR")

errors = []
counts = {"pages": 0, "procedures": 0, "steps": 0, "images": 0, "capture": 0, "say": 0, "sections": 0, "links": 0}


def slug(heading):
    """Python-Markdown toc default (when there is no explicit {#id})."""
    m = re.search(r"\{#([\w-]+)\}\s*$", heading)
    if m:
        return m.group(1)
    v = unicodedata.normalize("NFKD", heading).encode("ascii", "ignore").decode()
    v = re.sub(r"[^\w\s-]", "", v).strip().lower()
    return re.sub(r"[-\s]+", "-", v)


def anchors(path):
    if not path.exists():
        return set()
    return {slug(m.group(1)) for m in re.finditer(r"^#{1,6}\s+(.+)$", path.read_text(), re.M)}


def audit(md):
    name = md.name
    lines = md.read_text().split("\n")
    counts["pages"] += 1

    # Sections and SAY
    section, say = None, 0
    for s in lines + ["## <end>"]:
        if s.startswith("## "):
            if section is not None:
                counts["sections"] += 1
                if say == 0:
                    errors.append(f"{name}: no SAY in section '{section}'")
            section, say = s[3:], 0
        if "<!-- SAY:" in s:
            say += 1
            counts["say"] += 1
            text = s.split("SAY:", 1)[1].rsplit("-->", 1)[0].strip()
            if re.search(r"[:;\u2014]", text):
                errors.append(f"{name}: colon, semicolon or em dash in SAY: {text}")

    # Procedures
    i = 0
    while i < len(lines):
        if re.match(r"^1\. ", lines[i]):
            steps, images, j = 0, 0, i
            while j < len(lines):
                s = lines[j]
                if re.match(r"^\d+\. ", s):
                    steps += 1
                elif s.startswith("   ") or s == "":
                    pass
                else:
                    break
                if "![" in s:
                    images += 1
                j += 1
            # Comments, images and blank lines right after the list belong to the procedure
            while j < len(lines) and (lines[j] == "" or lines[j].startswith(("<!--", "!["))):
                if "![" in lines[j]:
                    images += 1
                j += 1
            counts["procedures"] += 1
            counts["steps"] += steps
            if not 3 <= steps <= 7:
                errors.append(f"{name}:{i + 1}: procedure has {steps} steps (must be 3-7)")
            # Per the style guide, sections of the first 10 minutes page end with "Kontrol et:"
            ending = ("Kontrol et:",) if name == "ilk-10-dakika.md" else ("Sonuç:",)
            if j >= len(lines) or not lines[j].startswith(ending):
                errors.append(f"{name}:{i + 1}: procedure does not end with a '{ending[0]}' line")
            if images == 0:
                errors.append(f"{name}:{i + 1}: procedure has no image")
            i = j
        else:
            i += 1

    # Images and CAPTURE
    for n, s in enumerate(lines):
        counts["capture"] += s.count("<!-- CAPTURE:")
        for m in re.finditer(r"!\[([^\]]*)\]\(([^)]+)\)", s):
            counts["images"] += 1
            alt, path = m.groups()
            nearby = lines[max(0, n - 2): n + 2]
            if not any("<!-- CAPTURE:" in x for x in nearby):
                errors.append(f"{name}:{n + 1}: no CAPTURE next to image ({path})")
            if len(alt) > 150:
                errors.append(f"{name}:{n + 1}: alt text is {len(alt)} characters (at most 150)")
            file = md.parent / path
            if not file.exists():
                errors.append(f"{name}:{n + 1}: image missing: {path}")
            elif file.stat().st_size > LIMIT:
                errors.append(f"{name}:{n + 1}: image {file.stat().st_size // 1024} KB > 250 KB: {path}")

    # Links
    for n, s in enumerate(lines):
        for m in re.finditer(r"(?<!!)\[[^\]]*\]\(([^)\s]+)\)", s):
            target = m.group(1)
            if re.match(r"^(https?:|mailto:)", target):
                continue
            counts["links"] += 1
            file, _, anchor = target.partition("#")
            path = (md.parent / file).resolve() if file else md
            # Pages of the other tools may be on their own branches: look in SIBLING_TOOL_DIR if set
            sibling = re.match(r"^\.\./(\w+)/(.+)$", file)
            if sibling and SIBLING_TOOL_DIR and not path.exists():
                path = pathlib.Path(SIBLING_TOOL_DIR.format(tool=sibling[1])) / sibling[2]
            if not path.exists():
                errors.append(f"{name}:{n + 1}: link target missing: {target}")
            elif anchor and anchor not in anchors(path):
                errors.append(f"{name}:{n + 1}: anchor missing: {target}")


for md in sorted(ROOT.glob("*.md")):
    audit(md)

script = ROOT / "video-script.json"
if script.exists():
    try:
        v = json.loads(script.read_text())
        for vid in v.get("videos", []):
            if not (ROOT / vid.get("page", "").split("#")[0]).exists():
                errors.append(f"video-script.json: page missing: {vid.get('page')}")
    except json.JSONDecodeError as e:
        errors.append(f"video-script.json invalid: {e}")
else:
    errors.append("video-script.json missing")

used = set()
for md in ROOT.glob("*.md"):
    used |= set(re.findall(r"\(img/([^)]+)\)", md.read_text()))
for png in (ROOT / "img").glob("*") if (ROOT / "img").exists() else []:
    if png.name not in used:
        errors.append(f"img/{png.name} is not used on any page")

print(" · ".join(f"{k} {v}" for k, v in counts.items()))
for e in errors:
    print("ERROR", e)
print(f"{len(errors)} errors")
sys.exit(1 if errors else 0)
