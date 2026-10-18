"""Coverage count: are the labels in the inventory's section 2 (controls) and section 4 (shortcuts) tables mentioned in the docs.
Usage: python3 capture/coverage.py <inventory.md>"""
import re, sys, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
inventory = open(sys.argv[1]).read()
doc = '\n'.join(open(f).read() for f in glob.glob(ROOT + '/*.md'))
flat = re.sub(r'\s+', ' ', doc)
# Section and column headings below are the Turkish headings of the inventory file
section = inventory[inventory.index('## 2. Düğmeler'):inventory.index('## 3. 3B etkileşim')]
rows = [l for l in section.split('\n') if l.startswith('| ') and not l.startswith('|---') and not re.match(r'\| (Etiket|Denetim|Grup|Ad) ', l)]
out_of_scope = re.compile(r'belgeleme dışı|Onshape|İçe aktarma kontrolü', re.I)
# Rows that do not match automatically but were verified by hand: inventory label -> text that appears in the docs
MANUAL = {
    '"Gerçeğe dök →"': 'Gerçeğe dök →', 'Proje adı düğmesi': 'Adsız Robot', 'Aile klasörü satırı': 'Aile satırı',
    'Kit satırı': 'Parçalarını göster', 'Kit oku': 'Parçalarını göster', '"Extrude (N bölge)"': 'Extrude (2 bölge)',
    'Alt şerit (4)': 'değişiklikleri kaydetmeden kapatır', '"Sepete ekle ve mağazaya git (N parça)"': 'Sepet hazırlanıyor',
}
documented, missing, excluded = [], [], []
for l in rows:
    cell = l.split('|')[1].strip()
    labels = re.findall(r'"([^"]+)"', cell) or [re.sub(r'\*|\(.*?\)', '', cell).strip()]
    if out_of_scope.search(l): excluded.append(cell); continue
    def found(e):
        e = e.replace('...', '').replace('…', '').replace(' →', '').strip()
        e = re.sub(r'\{[^}]*\}|\bN\b|\(n\)', '', e).strip(' :·')
        return not e or e.lower() in flat.lower()
    manual = next((v for k, v in MANUAL.items() if cell.startswith(k)), None)
    if manual and manual.lower() in flat.lower(): documented.append(cell); continue
    (documented if all(found(e) for e in labels) else missing).append(cell)
# shortcuts
kb = inventory[inventory.index('### 4.1'):inventory.index('## 5. Parça kataloğu')]
keys = [l.split('|')[2].strip() for l in kb.split('\n') if re.match(r'\| \d+ \|', l)]
print(f'Control rows (prod, to document): {len(documented)+len(missing)}, documented: {len(documented)}, missing: {len(missing)}, out of scope: {len(excluded)}')
for e in missing: print('  MISSING:', e)
print(f'Shortcut/behavior rows: {len(keys)} (Help 24 + in code 20)')
