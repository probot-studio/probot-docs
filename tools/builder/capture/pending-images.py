"""Turns an image line whose file is missing into an IMAGE-PENDING comment, and a comment whose file has arrived back into an image line.
Usage: python3 capture/pending-images.py [--apply]   (without the flag it only counts)"""
import re, sys, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE = re.compile(r'^(\s*)!\[([^\]]*)\]\((img/[^)\s]+)\)\s*$')
COMMENT = re.compile(r'^(\s*)<!-- IMAGE-PENDING: (img/\S+) \| alt=(.*?) -->\s*$')
apply = '--apply' in sys.argv
pending, arrived = [], []
for f in sorted(glob.glob(ROOT + '/*.md')):
    lines = open(f).read().split('\n')
    for i, s in enumerate(lines):
        if (m := IMAGE.match(s)) and not os.path.exists(os.path.join(ROOT, m.group(3))):
            pending.append(f'{os.path.basename(f)}:{i+1} {m.group(3)}')
            lines[i] = f'{m.group(1)}<!-- IMAGE-PENDING: {m.group(3)} | alt={m.group(2)} -->'
        elif (m := COMMENT.match(s)) and os.path.exists(os.path.join(ROOT, m.group(2))):
            arrived.append(f'{os.path.basename(f)}:{i+1} {m.group(2)}')
            lines[i] = f'{m.group(1)}![{m.group(3)}]({m.group(2)})'
    if apply: open(f, 'w').write('\n'.join(lines))
print(f'to comment out: {len(pending)}, to restore as image: {len(arrived)}' + (' (applied)' if apply else ''))
for b in pending: print('  PENDING', b)
for g in arrived: print('  ARRIVED', g)
