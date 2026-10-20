"""Blocks documentation quality gate: procedure, image, SAY, link and JSON checks.

Usage: python3 audit.py [blocks-folder]
Rules:
- Every procedure (numbered list) has 3-7 steps and ends with a "Sonuç:" or "Kontrol et:" line.
- Every image is immediately followed by a CAPTURE line.
- Every ## section has a SAY line (template sections excepted).
- Relative links, anchors and image paths resolve; video-script.json is valid.
"""
import json
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent)
# Template section headings in the Turkish pages; they are exempt from the SAY rule
EXEMPT = {"Başlamadan önce", "Sorun mu var?", "Sonraki adım"}
STEP = re.compile(r"^(\d+)\. ")
IMAGE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
LINK = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)\)")
HEADING = re.compile(r"^(#{1,6}) (.+?)(?: \{#([\w-]+)\})?\s*$")

errors, counts = [], {"page": 0, "procedure": 0, "step": 0, "image": 0, "capture": 0, "section": 0, "say": 0, "exempt_section": 0, "link": 0}


def slug(text):
    # Same rule as the site (apps/site/lib/docs.mjs slugify): dotless ı and İ become i first
    text = text.replace("ı", "i").replace("İ", "i")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def anchors(path):
    out = set()
    for line in path.read_text().split("\n"):
        m = HEADING.match(line)
        if m:
            out.add(m.group(3) or slug(m.group(2)))
    return out


pages = sorted(ROOT.glob("*.md"))
for path in pages:
    counts["page"] += 1
    name = path.name
    lines = path.read_text().split("\n")

    # Sections and SAY
    section, has_say = None, False
    def close_section():
        if section is None:
            return
        if section in EXEMPT:
            counts["exempt_section"] += 1
            return
        counts["section"] += 1
        if has_say:
            counts["say"] += 1
        else:
            errors.append(f"{name}: section '## {section}' has no SAY")
    for line in lines:
        m = HEADING.match(line)
        if m and len(m.group(1)) == 2:
            close_section()
            section, has_say = m.group(2), False
        elif "<!-- SAY:" in line:
            has_say = True
    close_section()

    # Images and CAPTURE
    for i, line in enumerate(lines):
        for g in IMAGE.findall(line):
            counts["image"] += 1
            next_line = lines[i + 1] if i + 1 < len(lines) else ""
            if "<!-- CAPTURE:" in next_line:
                counts["capture"] += 1
            else:
                errors.append(f"{name}:{i + 1}: no CAPTURE under {g}")
            if not (ROOT / g).is_file():
                errors.append(f"{name}:{i + 1}: image missing: {g}")

    # Procedures: consecutive numbered steps (indented lines in between belong to the step)
    i = 0
    while i < len(lines):
        if STEP.match(lines[i]) and STEP.match(lines[i]).group(1) == "1":
            start, n = i, 0
            while i < len(lines):
                s = lines[i]
                if STEP.match(s):
                    n += 1
                elif s.startswith("   ") or s.strip() == "":
                    pass
                else:
                    break
                i += 1
            counts["procedure"] += 1
            counts["step"] += n
            if not 3 <= n <= 7:
                errors.append(f"{name}:{start + 1}: procedure has {n} steps (must be 3-7)")
            if i >= len(lines) or not lines[i].startswith(("Sonuç:", "Kontrol et:")):
                errors.append(f"{name}:{start + 1}: procedure does not end with a 'Sonuç:' or 'Kontrol et:' line")
            continue
        i += 1

    # Links
    for i, line in enumerate(lines):
        for target in LINK.findall(line):
            if re.match(r"^(https?:|mailto:)", target):
                continue
            counts["link"] += 1
            file, _, anchor = target.partition("#")
            target_path = (ROOT / file) if file else path
            if not target_path.is_file():
                errors.append(f"{name}:{i + 1}: link does not resolve: {target}")
            elif anchor and anchor not in anchors(target_path):
                errors.append(f"{name}:{i + 1}: anchor missing: {target}")

# video-script.json
try:
    v = json.loads((ROOT / "video-script.json").read_text())
    counts["video"] = len(v["videos"])
    counts["scene"] = sum(len(x["scenes"]) for x in v["videos"])
    for x in v["videos"]:
        if not (ROOT / x["page"].split("#")[0]).is_file():
            errors.append(f"video-script.json: {x['id']} page missing: {x['page']}")
        ids = {s["id"] for s in x["scenes"]}
        if x["result_scene"] not in ids:
            errors.append(f"video-script.json: {x['id']} result_scene not in scenes")
except Exception as e:  # noqa: BLE001
    errors.append(f"video-script.json invalid: {e}")

img = sorted((ROOT / "img").glob("*.png"))
counts["img_file"] = len(img)
for p in img:
    if p.stat().st_size > 250 * 1024:
        errors.append(f"img/{p.name}: {p.stat().st_size // 1024} KB (over 250 KB)")

print(json.dumps(counts, ensure_ascii=False))
print(f"Exempt sections ({', '.join(sorted(EXEMPT))}) are not counted for SAY.")
for e in errors:
    print("ERROR", e)
print("RESULT:", "PASSED" if not errors else f"{len(errors)} errors")
sys.exit(1 if errors else 0)
