"""Builder documentation quality audit. Usage: python3 capture/audit.py [--images]
Counts: procedure step count (3-7), Sonuç/Kontrol et line, CAPTURE under each image, SAY in each ## section,
internal links and image paths, forbidden words/em dash, video-script.json validity."""
import re, sys, os, json, glob, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK_IMAGES = '--images' in sys.argv
# Reference pages: no procedure rules, no SAY rule
INFO_PAGES = {'index.md', 'arayuz.md', 'sorunlar.md'}
# Template section headings in the Turkish pages; they are exempt from the SAY rule
SAY_EXEMPT = re.compile(r'^(Başlamadan önce|Sorun mu var\?|Sonraki adım|İçindekiler|Sözlük|Builder\'da olmayanlar)')
# Forbidden Turkish filler words (they match page content) and the em dash
FORBIDDEN = re.compile(r'\b(kolayca|basitçe|sadece|hemen|tabii ki|açıkça)\b|\u2014', re.I)
try:
    from markdown.extensions.toc import slugify as _md_slug
except Exception:
    _md_slug = None
def slug(b):
    if _md_slug: return _md_slug(b.strip(), '-')
    b = b.strip().lower()
    b = re.sub(r'[^\w\- ]', '', b, flags=re.U)
    b = unicodedata.normalize('NFKD', b).encode('ascii', 'ignore').decode()
    return re.sub(r'\s+', '-', b)
errors, summary = [], {'page':0,'procedure':0,'image':0,'capture':0,'say':0}
headings = {}
for f in sorted(glob.glob(ROOT+'/*.md')):
    heads = re.findall(r'^#+ (.+)$', open(f).read(), re.M)
    # If {#anchor} is written, that is the anchor (attr_list); otherwise it is generated from the heading
    headings[os.path.basename(f)] = {m.group(1) if (m := re.search(r'\{#([\w-]+)\}\s*$', b)) else slug(b) for b in heads}
for f in sorted(glob.glob(ROOT+'/*.md')):
    name = os.path.basename(f); s = open(f).read(); L = s.split('\n'); summary['page'] += 1
    # sections
    sections = re.split(r'^## ', s, flags=re.M)[1:]
    for b in sections:
        head = b.split('\n',1)[0]
        if name not in INFO_PAGES and name != 'kisayollar.md' and not SAY_EXEMPT.match(head) and '<!-- SAY:' not in b:
            errors.append(f'{name}: section "## {head}" has no SAY')
        # procedures: consecutive numbered list blocks
        blocks = re.findall(r'(?:^\d+\. .*(?:\n(?!\d+\. |\n|#).*)*\n?)+', b, re.M)
        for bl in blocks:
            n = len(re.findall(r'^\d+\. ', bl, re.M))
            if n < 2: continue
            summary['procedure'] += 1
            if name in INFO_PAGES: continue
            if not 3 <= n <= 7: errors.append(f'{name}: procedure in "## {head}" has {n} steps')
            after = b[b.find(bl)+len(bl):]
            next_line = next((x for x in after.split('\n') if x.strip() and not x.strip().startswith('<!--') and not x.startswith('   ')), '')
            if not re.match(r'(Sonuç|Kontrol et):', next_line.strip()):
                errors.append(f'{name}: procedure in "## {head}" does not end with Sonuç ("{next_line.strip()[:40]}")')
        summary['say'] += b.count('<!-- SAY:')
    # images and CAPTURE
    for i, l in enumerate(L):
        for alt, path in re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', l):
            summary['image'] += 1
            if len(alt) > 150: errors.append(f'{name}:{i+1}: alt text is {len(alt)} characters')
            if not (i+1 < len(L) and '<!-- CAPTURE:' in L[i+1]): errors.append(f'{name}:{i+1}: no CAPTURE under image ({path})')
            p = os.path.join(ROOT, path)
            if CHECK_IMAGES:
                if not os.path.exists(p): errors.append(f'{name}:{i+1}: image missing {path}')
                elif os.path.getsize(p) > 250*1024: errors.append(f'{name}:{i+1}: image {os.path.getsize(p)//1024} KB > 250 KB')
        summary['capture'] += l.count('<!-- CAPTURE:')
        for _, target in re.findall(r'(?<!!)\[([^\]]*)\]\(([^)]+)\)', l):
            if target.startswith('http') or target.startswith('../index.md'): continue  # tools hub page lives outside this folder
            file, _, anchor = target.partition('#')
            file = file or name
            if not os.path.exists(os.path.join(ROOT, file)): errors.append(f'{name}:{i+1}: broken link {target}')
            elif anchor and file.endswith('.md') and anchor not in headings.get(file, set()):
                errors.append(f'{name}:{i+1}: missing anchor {target}')
        if FORBIDDEN.search(re.sub(r'\*\*[^*]+\*\*|"[^"]+"', '', re.sub(r'<!--.*?-->', '', l))) and not l.startswith('|'):
            errors.append(f'{name}:{i+1}: forbidden word/em dash: {FORBIDDEN.search(l).group(0)}')
    for sl in re.findall(r'<!-- SAY: (.*?) -->', s):
        if re.search(r'[\u2014:;]|C\+\+', sl): errors.append(f'{name}: SAY punctuation: {sl[:50]}')
js = os.path.join(ROOT, 'video-script.json')
if os.path.exists(js):
    try: v = json.load(open(js)); summary['video'] = len(v['videos'])
    except Exception as e: errors.append(f'video-script.json invalid: {e}')
else: errors.append('video-script.json missing')
print(json.dumps(summary, ensure_ascii=False))
print(f'{len(errors)} errors'); print('\n'.join(errors))
