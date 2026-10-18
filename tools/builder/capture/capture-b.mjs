// Builder docs, group B images (parca-ekle, sec-gizle-sil, tasi-dondur, tak, cogalt).
// Usage: node capture-b.mjs <img-dir> <scene,...> [step,...|-] [debug-dir]
// Scenes: bos1 (add part + move/rotate), bos2 (length + duplicate), omni1 (drag + select), tak (omni + Attach), motor,
//         magazayok (store API blocked; debug output only)
import { connect, prepare3d, mark, clearMarks, capture, toScreen, listParts, partHoles } from './lib.mjs';
const IMG = process.argv[2];
const scenes = (process.argv[3] || 'bos1,bos2,omni1,tak,motor').split(',');
const only = process.argv[4] && process.argv[4] !== '-' ? process.argv[4].split(',') : null;
const DBG = process.argv[5] || '/tmp';
const wanted = (name) => !only || only.includes(name);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const VIEWPORT_3D = { x:310, y:108, width:860, height:792 };
const FULL = { x:0, y:0, width:1440, height:900 };
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
// Round a rect, grow it by pad and clamp it to the 1440x900 viewport
const crop = (r, pad = 0) => {
  let x = Math.max(0, Math.round(r.x - pad)), y = Math.max(0, Math.round(r.y - pad));
  let w = Math.round(r.width + 2 * pad), h = Math.round(r.height + 2 * pad);
  w = Math.min(w, 1440 - x); h = Math.min(h, 900 - y);
  return { x, y, width: w, height: h };
};
const union = (...rs) => {
  const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
  const x2 = Math.max(...rs.map(r => r.x + r.width)), y2 = Math.max(...rs.map(r => r.y + r.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
// Screen box around the move-gizmo arrow for one axis (axis = world direction vector)
async function axisBox(page, pos, axis) {
  const c = await toScreen(page, pos); const u = await toScreen(page, pos.map((v, i) => v + axis[i]));
  let dx = u.x - c.x, dy = u.y - c.y; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  const a = { x: c.x + dx * 18, y: c.y + dy * 18 }, b = { x: c.x + dx * 105, y: c.y + dy * 105 };
  return { x: Math.min(a.x, b.x) - 10, y: Math.min(a.y, b.y) - 10, width: Math.abs(a.x - b.x) + 20, height: Math.abs(a.y - b.y) + 20 };
}
const pointBox = (p, s = 26) => ({ x: p.x - s / 2, y: p.y - s / 2, width: s, height: s });
// Run one named step if it was requested; on failure save a debug screenshot and keep going
async function step(name, fn, page) {
  if (!wanted(name)) return;
  const t = Date.now();
  try { await fn(); log('OK', name, (Date.now() - t) + 'ms'); }
  catch (e) {
    log('ERROR', name, e.message.split('\n')[0]);
    try { await page.screenshot({ path: `${DBG}/error-${name}.png` }); } catch {}
    try { await clearMarks(page); await page.keyboard.press('Escape'); } catch {}
  }
}
// Bounding box of pixels matching a color test in a screenshot: test = 'r>200&&g<70&&b<70'
async function colorBox(page, clip, test) {
  const buf = await page.screenshot({ clip, scale: 'css' });
  return page.evaluate(async ({ b64, clip, test }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const f = new Function('r', 'g', 'b', 'return ' + test);
    let x1 = 1e9, y1 = 1e9, x2 = -1, y2 = -1, n = 0, rightX = -1, rightY = 0, bottomX = 0, bottomY = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (f(d[i], d[i + 1], d[i + 2])) { n++; if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; if (x > rightX) { rightX = x; rightY = y; } if (y > bottomY) { bottomY = y; bottomX = x; } }
    }
    if (n < 20) return null;
    const sx = clip.width / c.width, sy = clip.height / c.height;
    return { x: clip.x + x1 * sx, y: clip.y + y1 * sy, width: (x2 - x1) * sx, height: (y2 - y1) * sy, n, right: { x: clip.x + rightX * sx, y: clip.y + rightY * sy }, bottom: { x: clip.x + bottomX * sx, y: clip.y + bottomY * sy } };
  }, { b64: buf.toString('base64'), clip, test });
}
// Draw an arrow overlay from a to b (removed by clearMarks)
async function arrow(page, a, b) {
  await page.evaluate(({ a, b }) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'docs-marker');
    Object.assign(s.style, { position: 'fixed', left: 0, top: 0, width: '1440px', height: '900px', zIndex: 2147483646, pointerEvents: 'none' });
    const ang = Math.atan2(b.y - a.y, b.x - a.x), L = 16;
    const bx = b.x - Math.cos(ang) * 6, by = b.y - Math.sin(ang) * 6;
    const p1 = [bx - L * Math.cos(ang - 0.45), by - L * Math.sin(ang - 0.45)], p2 = [bx - L * Math.cos(ang + 0.45), by - L * Math.sin(ang + 0.45)];
    s.innerHTML = `<line x1="${a.x}" y1="${a.y}" x2="${bx - Math.cos(ang) * 8}" y2="${by - Math.sin(ang) * 8}" stroke="#E6007E" stroke-width="3" stroke-linecap="round"/>` +
      `<polygon points="${bx},${by} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}" fill="#E6007E"/>`;
    document.body.appendChild(s);
  }, { a, b });
}
const openAddPartTab = async (page) => { await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click().catch(() => page.getByText('Parça Ekle', { exact: true }).first().click()); await page.waitForTimeout(200); };
// Navigate the Add Part panel back to its top level (the section list)
async function toTopLevel(page) {
  for (let i = 0; i < 5; i++) {
    if (await page.locator('[data-section]').count()) break;
    const g = page.locator('[data-family-back], [data-section-back]').first();
    if (await g.count()) await g.click().catch(() => {});
    await page.waitForTimeout(500);
  }
}
// Open a section of the Add Part panel and, optionally, a part family inside it
async function openFolder(page, section, family) {
  await openAddPartTab(page); await toTopLevel(page);
  await page.locator('[data-section]', { hasText: section }).first().click(); await page.waitForTimeout(400);
  if (family) { await page.locator('[data-family]', { hasText: family }).first().click(); await page.waitForTimeout(400); }
}
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const optionRow = (page, family, option) => page.locator(family ? '[data-family-folder] [data-part-type]' : '[data-section-open] [data-part-type]').filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first();
const contextMenu = (page) => page.locator('div.fixed.z-50.shadow-toolbar').first();
// Add a part by clicking its option row; returns the new part
async function addPart(page, section, family, option) {
  await openFolder(page, section, family);
  const n = (await listParts(page)).length;
  await optionRow(page, family, option).click();
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
  await page.waitForTimeout(1500);
  const ps = await listParts(page); return ps[ps.length - 1];
}
const fitView = async (page) => { try { await menu(page, 'Görünüm').click({ noWaitAfter: true, timeout: 30000 }); await page.getByText('Sığdır', { exact: true }).first().click({ noWaitAfter: true, timeout: 30000 }); await page.waitForTimeout(2500); } catch (e) { log('fitView error', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); } };
const selectedIds = (page) => page.evaluate(() => window.__robot.getState().selectedPartIds);
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
async function emptyScene(browser) {
  const { page } = await prepare3d(browser); page.setDefaultTimeout(25000);
  await page.waitForTimeout(2500);
  log('TOASTS', JSON.stringify(await page.evaluate(() => (document.body.innerText.match(/Mağaza[^\n]*/g) || []))));
  await page.locator('[data-bos-sahne-bos]').click(); await page.waitForTimeout(500);
  return page;
}
async function omniScene(browser) {
  const { page } = await prepare3d(browser); page.setDefaultTimeout(45000);
  await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
  await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 90000 });
  await page.waitForTimeout(3000);
  return page;
}
// Real click on a part: try candidate points, stop once the selection sticks
async function clickPart(page, id, { shift = false, right = false } = {}) {
  const ps = await listParts(page); const p = ps.find(q => q.id === id);
  const candidates = right ? [[0, 38, 0], [0, 0, 0]] : [[0, 0, 0]];
  for (const r of [30, 42, 20]) for (const d of [[0, r, 0], [0, 0, r], [r, 0, 0], [0, 0, -r], [-r, 0, 0], [0, -r, 0]]) candidates.push(d);
  for (const h of (await partHoles(page, id)).slice(0, 8)) candidates.push([h.p[0] - p.pos[0], h.p[1] - p.pos[1], h.p[2] - p.pos[2]]);
  for (const d of candidates) {
    const s = await toScreen(page, [p.pos[0] + d[0], p.pos[1] + d[1], p.pos[2] + d[2]]);
    if (s.x < 320 || s.x > 1160 || s.y < 120 || s.y > 860) continue;
    const before = await selectedIds(page);
    if (right) {
      await page.mouse.click(s.x, s.y, { button: 'right' }); await page.waitForTimeout(500);
      const header = await contextMenu(page).innerText().catch(() => '');
      const sel = await selectedIds(page);
      if (sel.includes(id)) return s;
      await page.keyboard.press('Escape'); await page.waitForTimeout(200);
      if (before.length && JSON.stringify(before) !== JSON.stringify(sel)) await page.evaluate((ids) => window.__robot.getState().selectParts(ids), before);
      continue;
    }
    if (shift) await page.keyboard.down('Shift');
    await page.mouse.click(s.x, s.y); await page.waitForTimeout(400);
    if (shift) await page.keyboard.up('Shift');
    const sel = await selectedIds(page);
    if (sel.includes(id) && (!shift || sel.length > before.length)) return s;
    // wrong selection: restore the previous one
    await page.evaluate((ids) => ids.length ? window.__robot.getState().selectParts(ids) : window.__robot.getState().deselectAll(), before);
  }
  throw new Error('could not click part: ' + id);
}

const browser = await connect();
try {
  // ======================= bos1 =======================
  if (scenes.includes('bos1')) {
    const page = await emptyScene(browser);
    await step('bolumden', async () => {
      await openFolder(page, 'Yapı', 'Structure');
      const panel = page.locator('[data-family-folder]').first();
      log('STR rows', JSON.stringify(await panel.locator('[data-part-type]').allInnerTexts()));
      log('back row', await page.locator('[data-family-back]').first().innerText().catch(() => '?'));
      const fb = await panel.boundingBox();
      await mark(page, [{ n: 4, loc: optionRow(page, 'Structure', '5 delik') }]);
      await capture(page, IMG + '/builder-parca-ekle-bolumden.png', crop({ x: 0, y: 108, width: 312, height: Math.min(792, fb.y + fb.height + 12 - 108) }));
      await clearMarks(page);
      log('row text', await optionRow(page, 'Structure', '5 delik').innerText(), '| title', await optionRow(page, 'Structure', '5 delik').getAttribute('title'));
      log('hint text', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/(Bir bölüm seç ya da ara|Tıkla veya sahneye sürükle)[^\n]*/g))));
    }, page);
    let str = null;
    await step('secenek', async () => {
      const n = (await listParts(page)).length;
      await openFolder(page, 'Yapı', 'Structure');
      await optionRow(page, 'Structure', '5 delik').click();
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1500);
      const ps = await listParts(page); str = ps[ps.length - 1];
      log('added', JSON.stringify(str), 'selected', JSON.stringify(await selectedIds(page)));
      log('PROPERTIES', (await page.locator('[data-testid="varyant"]').locator('xpath=ancestor::*[3]').innerText()).replace(/\n/g, ' | ').slice(0, 400));
      const sel = page.locator('[data-testid="varyant-secim"]');
      const opts = await sel.locator('option').allInnerTexts(); log('variants', JSON.stringify(opts));
      const v11 = await sel.locator('option', { hasText: '11 delik' }).first().getAttribute('value');
      await sel.selectOption(v11); await page.waitForTimeout(1500);
      log('after 11', JSON.stringify((await listParts(page)).slice(-1)));
      const vb = await page.locator('[data-testid="varyant"]').boundingBox();
      const kb = await page.getByText('Konum (mm)', { exact: true }).locator('..').boundingBox();
      await mark(page, [{ n: 3, loc: sel }, { n: 4, loc: page.locator('[data-testid="varyant"] button[title="Sonraki"]') }]);
      await capture(page, IMG + '/builder-parca-ekle-secenek.png', crop({ x: 1168, y: 108, width: 272, height: kb.y + kb.height + 14 - 108 }));
      await clearMarks(page);
      const v5 = await sel.locator('option', { hasText: '5 delik' }).first().getAttribute('value');
      await sel.selectOption(v5); await page.waitForTimeout(1500);
      str = (await listParts(page)).slice(-1)[0];
    }, page);
    if (!str) { const ps = await listParts(page); str = ps[ps.length - 1]; }
    await step('tasi-tutamac', async () => {
      await blur(page);
      await page.locator('button[title="Taşı (T / M)"]').click(); await page.waitForTimeout(300);
      await fitView(page); await page.mouse.move(1439, 899); await page.waitForTimeout(1200);
      const c = await toScreen(page, str.pos);
      const box = await axisBox(page, str.pos, [60, 0, 0]);
      log('red axis', JSON.stringify(box));
      await mark(page, [{ n: 2, box, pad: 6 }]);
      await capture(page, IMG + '/builder-tasi-tutamac.png', crop({ x: c.x - 330, y: c.y - 230, width: 660, height: 460 }));
      await clearMarks(page);
    }, page);
    await step('tasi-dondur', async () => {
      await blur(page);
      await page.keyboard.press('r'); await page.waitForTimeout(800);
      const stepSelect = page.locator('[data-testid="donus-adimi"]');
      log('rotation-step tag', await stepSelect.evaluate(e => e.tagName + ' ' + e.outerHTML.slice(0, 300)));
      if ((await stepSelect.evaluate(e => e.tagName)) === 'SELECT') await stepSelect.selectOption({ label: '90°' });
      else { await stepSelect.click(); await page.waitForTimeout(300); await page.getByRole('menuitemradio', { name: '90°' }).or(page.getByText('90°', { exact: true })).first().click(); }
      await page.waitForTimeout(800); await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      log('status', await page.locator('[data-testid="durum-snap"]').innerText().catch(() => '?'), '| step', await page.locator('[data-testid="durum-donus-adimi"]').innerText().catch(() => '?'));
      const c = await toScreen(page, str.pos);
      const sb = crop({ x: c.x - 230, y: c.y - 230, width: 460, height: 460 });
      const green = await colorBox(page, sb, 'g>170&&r<90&&b<90');
      log('green', JSON.stringify(green));
      const ab = await stepSelect.boundingBox();
      const targets = [{ n: 2, loc: stepSelect }];
      if (green) targets.push({ n: 3, box: pointBox(green.bottom, 30) });
      await mark(page, targets);
      const area = union(ab, { x: c.x - 260, y: c.y - 230, width: 520, height: 460 });
      await capture(page, IMG + '/builder-tasi-dondur.png', crop(area, 8));
      await clearMarks(page);
      await page.keyboard.press('t'); await page.waitForTimeout(300);
    }, page);
    await step('tasi-sayiyla', async () => {
      const x = page.getByText('Konum (mm)', { exact: true }).locator('..').locator('input').first();
      await x.click(); await x.fill('40'); await x.press('Enter'); await page.waitForTimeout(1000);
      log('after X', JSON.stringify((await listParts(page)).slice(-1)));
      await blur(page);
      const kb = await page.getByText('Konum (mm)', { exact: true }).locator('..').boundingBox();
      const db = await page.getByText('Dönüş (°)', { exact: true }).locator('xpath=../..').boundingBox();
      await mark(page, [{ n: 1, loc: x }, { n: 4, loc: page.locator('button[title="Y ekseninde +90°"]') }]);
      await capture(page, IMG + '/builder-tasi-sayiyla.png', crop({ x: 1168, y: kb.y - 14, width: 272, height: db.y + db.height - kb.y + 28 }));
      await clearMarks(page);
    }, page);
  }

  // ======================= bos2 =======================
  if (scenes.includes('bos2')) {
    const page = await emptyScene(browser);
    await step('uzunluk', async () => {
      const shaft = await addPart(page, 'Göbek & Mil', null, 'Altıgen Mil 7mm Kit');
      log('shaft', JSON.stringify(shaft));
      const u = page.locator('[data-testid="uzunluk"]');
      log('LENGTH before', (await u.innerText()).replace(/\n/g, ' | '));
      const mm = page.locator('[data-testid="uzunluk-mm"]');
      await mm.click(); await mm.fill('150'); await mm.press('Enter'); await page.waitForTimeout(1200);
      await blur(page);
      log('LENGTH after', (await u.innerText()).replace(/\n/g, ' | '), JSON.stringify((await listParts(page)).slice(-1)));
      await mark(page, [{ n: 3, loc: mm }, { n: 4, loc: u.locator('button[title*="uzat"]') }]);
      await capture(page, IMG + '/builder-parca-ekle-uzunluk.png', crop(await u.boundingBox(), 14));
      await clearMarks(page);
    }, page);
    // clear the scene
    await blur(page); await page.keyboard.press('Control+a'); await page.keyboard.press('Delete'); await page.waitForTimeout(800);
    log('parts after clearing', (await listParts(page)).length);
    let original = null, copy = null;
    await step('cogalt-kopya', async () => {
      original = await addPart(page, 'Yapı', 'Structure', '5 delik');
      await blur(page);
      await page.keyboard.press('Control+d'); await page.waitForTimeout(1500);
      const ps = await listParts(page); copy = ps[ps.length - 1];
      log('original', JSON.stringify(original.pos), 'copy', JSON.stringify(copy.pos), 'selected', JSON.stringify(await selectedIds(page)), 'n', ps.length);
      await fitView(page); await page.mouse.move(1439, 899); await page.waitForTimeout(1000);
      const pts = []; for (const h of await partHoles(page, copy.id)) pts.push(await toScreen(page, h.p));
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      log('status strip', await page.getByText(/seçili/).first().locator('..').innerText().catch(() => '?'));
      await mark(page, [{ n: 3, box: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }, pad: 16 }]);
      await capture(page, IMG + '/builder-cogalt-kopya.png', VIEWPORT_3D);
      await clearMarks(page);
    }, page);
    await step('cogalt-buraya-yapistir', async () => {
      const id = copy?.id ?? (await listParts(page)).slice(-1)[0].id;
      await clickPart(page, id, { right: true });
      const m = contextMenu(page);
      log('PART MENU', (await m.innerText()).replace(/\n/g, ' | '));
      await contextMenu(page).locator('button', { hasText: /^\s*Kopyala/ }).first().click(); await page.waitForTimeout(600);
      log('toast', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/\d+ parça kopyalandı/g))));
      await page.mouse.click(1000, 780, { button: 'right' }); await page.waitForTimeout(600);
      log('EMPTY MENU', (await m.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 5, loc: page.getByText('Buraya yapıştır').first() }]);
      await capture(page, IMG + '/builder-cogalt-buraya-yapistir.png', crop(await m.boundingBox(), 12));
      await clearMarks(page);
      await page.getByText('Buraya yapıştır').first().click(); await page.waitForTimeout(1200);
      log('after paste', JSON.stringify((await listParts(page)).map(p => p.pos)), JSON.stringify(await selectedIds(page)));
    }, page);
    await step('cogalt-dizi', async () => {
      const id = (await listParts(page))[0].id;
      await page.evaluate((id) => window.__robot.getState().selectOnlyPart(id), id); await page.waitForTimeout(400);
      await blur(page); await page.keyboard.press('d'); await page.waitForTimeout(800);
      const w = page.locator('[data-testid="dizi-penceresi"]');
      log('ARRAY before', (await w.innerText()).replace(/\n/g, ' | '));
      await page.locator('[data-testid="dizi-eksen-z"]').click(); await page.waitForTimeout(300);
      log('spacing after z', await page.locator('[data-testid="dizi-aralik"]').inputValue());
      await page.locator('[data-testid="dizi-adet"]').fill('4');
      await page.locator('[data-testid="dizi-aralik"]').fill('30'); await page.waitForTimeout(400);
      await blur(page);
      log('ARRAY after', (await w.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="dizi-eksen-z"]') }, { n: 4, loc: page.locator('[data-testid="dizi-adet"]') }, { n: 6, loc: page.locator('[data-testid="dizi-uygula"]') }]);
      await capture(page, IMG + '/builder-cogalt-dizi.png', crop(await w.boundingBox(), 14));
      await clearMarks(page);
      const n = (await listParts(page)).length;
      await page.locator('[data-testid="dizi-uygula"]').click(); await page.waitForTimeout(1500);
      log('parts after array', n, '->', (await listParts(page)).length, 'selected', (await selectedIds(page)).length);
    }, page);
    await step('cogalt-aynala', async () => {
      const t = await addPart(page, 'Tekerlekler', 'Mecanum Teker', 'Sol');
      log('wheel', JSON.stringify(t), 'selected', JSON.stringify(await selectedIds(page)));
      await blur(page); await page.keyboard.press('a'); await page.waitForTimeout(800);
      const w = page.locator('[data-testid="ayna-penceresi"]');
      log('MIRROR before', (await w.innerText()).replace(/\n/g, ' | '));
      await page.locator('[data-testid="ayna-eksen-x"]').click();
      await page.locator('[data-testid="ayna-merkez-yan"]').click(); await page.waitForTimeout(300);
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="ayna-eksen-x"]') }, { n: 4, loc: page.locator('[data-testid="ayna-merkez-yan"]') }, { n: 5, loc: page.locator('[data-testid="ayna-uygula"]') }]);
      await capture(page, IMG + '/builder-cogalt-aynala.png', crop(await w.boundingBox(), 14));
      await clearMarks(page);
      await page.locator('[data-testid="ayna-uygula"]').click(); await page.waitForTimeout(3000);
      const ps = await listParts(page);
      log('after mirror', JSON.stringify(ps.slice(-2)), 'toast', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*(ayna|Ayna)[^\n]*/g))));
    }, page);
  }

  // ======================= omni1 =======================
  if (scenes.includes('omni1')) {
    const page = await omniScene(browser);
    const ps0 = await listParts(page);
    const structures = ps0.filter(p => /str-c1/.test(p.type));
    const wheels = ps0.filter(p => /whl-rbr|omni-teker/.test(p.type));
    log('wheels', JSON.stringify(wheels), 'structures', structures.length);
    // highest hole (facing up)

    await step('surukle', async () => {
      let top = null;
      for (const p of structures) for (const h of await partHoles(page, p.id)) if (Math.abs(h.a[1]) > 0.9 && (!top || h.p[1] > top.p[1])) top = { ...h, id: p.id };
      log('top hole', JSON.stringify(top));
      await openFolder(page, 'Yapı', 'Structure');
      const row = optionRow(page, 'Structure', '5 delik');
      const sb = await row.boundingBox();
      const h = await toScreen(page, [top.p[0] + 5, top.p[1], top.p[2]]);
      await row.evaluate((el) => { window.__dt = new DataTransfer(); el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: window.__dt })); });
      for (let i = 1; i <= 6; i++) {
        const x = sb.x + sb.width + (h.x - sb.x - sb.width) * i / 6, y = sb.y + (h.y - sb.y) * i / 6;
        await page.evaluate(({ x, y }) => document.querySelector('canvas').dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: window.__dt })), { x, y });
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(2500);
      await arrow(page, { x: sb.x + sb.width - 30, y: sb.y + sb.height / 2 }, { x: h.x - 18, y: h.y - 4 });
      await mark(page, [{ n: 4, box: pointBox(h, 30) }]);
      await capture(page, IMG + '/builder-parca-ekle-surukle.png', crop({ x: 0, y: 108, width: Math.max(760, h.x + 260), height: Math.max(420, h.y + 200 - 108) }));
      await clearMarks(page);
      await page.evaluate(() => { document.querySelector('canvas').dispatchEvent(new DragEvent('dragleave', { bubbles: true })); window.__dt = null; });
      await row.evaluate((el) => el.dispatchEvent(new DragEvent('dragend', { bubbles: true })));
      await page.waitForTimeout(500);
      log('parts after drag', (await listParts(page)).length);
      await toTopLevel(page);
    }, page);
    await step('sec-durum-seridi', async () => {
      await page.locator('button[title="Taşı (T / M)"]').click();
      await clickPart(page, wheels[0].id);
      await clickPart(page, wheels[1].id, { shift: true });
      log('selected', JSON.stringify(await selectedIds(page)));
      await page.mouse.move(1439, 899); await page.waitForTimeout(1200);
      const strip = page.getByText(/^\d+ seçili$/).first().locator('..');
      log('STRIP', await strip.innerText());
      const s0 = await toScreen(page, wheels[0].pos), s1 = await toScreen(page, wheels[1].pos);
      const sb = await strip.boundingBox();
      await mark(page, [{ n: 3, loc: strip }]);
      const area = union(sb, pointBox(s0, 260), pointBox(s1, 260));
      await capture(page, IMG + '/builder-sec-durum-seridi.png', crop({ x: Math.max(310, area.x), y: Math.max(108, area.y), width: Math.min(area.x + area.width, 1170) - Math.max(310, area.x), height: 900 - Math.max(108, area.y) }));
      await clearMarks(page);
    }, page);
    await step('sec-sonuc', async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(500);
      log('sec-sonuc selected', (await selectedIds(page)).length);
      await capture(page, IMG + '/builder-sec-sonuc.png', FULL);
    }, page);
    await step('sec-sil', async () => {
      const sel = await selectedIds(page);
      if (sel.length !== 2 || true) { await page.evaluate((ids) => window.__robot.getState().selectParts(ids), [wheels[0].id, wheels[1].id]); }
      await clickPart(page, wheels[0].id, { right: true });
      const m = contextMenu(page);
      log('DELETE MENU', (await m.innerText()).replace(/\n/g, ' | '), 'selected', (await selectedIds(page)).length);
      await mark(page, [{ n: 3, loc: contextMenu(page).locator('button', { hasText: /^\s*Sil/ }).first() }]);
      await capture(page, IMG + '/builder-sec-sil.png', crop(await m.boundingBox(), 12));
      await clearMarks(page);
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    }, page);
    await step('tasi-sonuc', async () => {
      await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll());
      const target = structures.slice().sort((a, b) => b.pos[1] - a.pos[1])[0];
      await clickPart(page, target.id);
      await blur(page); await page.keyboard.press('t'); await page.waitForTimeout(1200);
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      log('tasi-sonuc selected', JSON.stringify(await selectedIds(page)));
      await capture(page, IMG + '/builder-tasi-sonuc.png', FULL);
      await page.keyboard.press('Escape');
    }, page);
    await step('sec-tumunu-goster', async () => {
      await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll());
      const target = structures.slice().sort((a, b) => b.pos[1] - a.pos[1])[0];
      await page.evaluate((id) => window.__robot.getState().toggleVisibility([id]), target.id); await page.waitForTimeout(800);
      const m = contextMenu(page);
      log('hidden', JSON.stringify(await page.evaluate(() => window.__robot.getState().parts.filter(p => p.visible === false).map(p => p.id))));
      await page.mouse.click(1040, 760, { button: 'right' }); await page.waitForTimeout(600);
      log('EMPTY MENU', (await m.innerText()).replace(/\n/g, ' | '));
      const strip = page.getByText(/^\d+ gizli$/).first().locator('..');
      const mb = await m.boundingBox(); const sb = await strip.boundingBox().catch(() => null);
      await mark(page, [{ n: 4, loc: page.getByText(/^Tümünü göster/).first() }]);
      await capture(page, IMG + '/builder-sec-tumunu-goster.png', crop(sb ? union(mb, sb) : mb, 12));
      await clearMarks(page);
      await page.getByText(/^Tümünü göster/).first().click(); await page.waitForTimeout(800);
      log('show toast', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/\d+ parça gösterildi/g))));
    }, page);
    await step('sec-parcalar-sekmesi', async () => {
      await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click(); await page.waitForTimeout(600);
      log('kit row', (await page.locator('[data-kit-row]').first().innerText()).replace(/\n/g, ' | '));
      await page.locator('[data-kit-ac]').first().click(); await page.waitForTimeout(500);
      const search = page.locator('input[placeholder="Parçalarda ara..."]');
      await search.fill('teker'); await page.waitForTimeout(600);
      const rows = page.locator('[data-part-id]');
      log('wheel rows', await rows.count(), JSON.stringify((await rows.allInnerTexts()).slice(0, 6)));
      const first = rows.first(); await first.click(); await page.waitForTimeout(600);
      log('selected', JSON.stringify(await selectedIds(page)), 'footer', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/\d+ \/ \d+ parça[^\n]*/g))));
      await page.mouse.move(1439, 899);
      await mark(page, [{ n: 3, loc: search }, { n: 4, loc: first }]);
      await capture(page, IMG + '/builder-sec-parcalar-sekmesi.png', { x: 0, y: 108, width: 312, height: 792 });
      await clearMarks(page);
    }, page);
    await step('tasi-coklu', async () => {
      await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click();
      await page.locator('[data-kit-row]').first().click(); await page.waitForTimeout(600);
      log('selected count', (await selectedIds(page)).length, 'kit row', (await page.locator('[data-kit-row]').first().innerText()).replace(/\n/g, ' | '));
      await blur(page);
      await page.locator('button[title="Taşı (T / M)"]').click(); await page.waitForTimeout(1500);
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      const center = await page.evaluate(() => { const ps = window.__robot.getState().parts; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const p of ps) ['x', 'y', 'z'].forEach((k, i) => { lo[i] = Math.min(lo[i], p.position[k]); hi[i] = Math.max(hi[i], p.position[k]); }); return lo.map((v, i) => (v + hi[i]) / 2); });
      const blue = await axisBox(page, center, [0, 0, 60]);
      log('blue axis', JSON.stringify(blue), 'strip', await page.getByText(/^\d+ seçili$/).first().locator('..').innerText().catch(() => '?'));
      await mark(page, [{ n: 4, box: blue, pad: 6 }]);
      await capture(page, IMG + '/builder-tasi-coklu.png', VIEWPORT_3D);
      await clearMarks(page);
    }, page);

    await step('parca-ekle-sonuc', async () => {
      await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll());
      const added = await addPart(page, 'Yapı', 'Structure', '3 delik');
      await page.mouse.move(1439, 899); await page.waitForTimeout(1000);
      log('parca-ekle-sonuc', JSON.stringify(added), 'selected', JSON.stringify(await selectedIds(page)), 'n', (await listParts(page)).length);
      await capture(page, IMG + '/builder-parca-ekle-sonuc.png', FULL);
    }, page);
    await step('cogalt-sonuc', async () => {
      await blur(page); await page.keyboard.press('a'); await page.waitForTimeout(800);
      await page.locator('[data-testid="ayna-eksen-x"]').click();
      await page.locator('[data-testid="ayna-merkez-orijin"]').click(); await page.waitForTimeout(300);
      await page.locator('[data-testid="ayna-uygula"]').click(); await page.waitForTimeout(3000);
      const ps = await listParts(page);
      log('cogalt-sonuc', JSON.stringify(ps.slice(-2)), 'n', ps.length);
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      await capture(page, IMG + '/builder-cogalt-sonuc.png', FULL);
    }, page);
  }

  // ======================= motor =======================
  if (scenes.includes('motor')) {
    const page = await emptyScene(browser);
    await step('magaza', async () => {
      await openFolder(page, 'Yapı', 'Structure');
      log('STR row texts', JSON.stringify(await page.locator('[data-family-folder] [data-part-type]').allInnerTexts()));
      log('has price', await page.evaluate(() => /₺|TL\b|\d+,\d\d/.test(document.querySelector('[data-family-folder]').innerText)));
      log('STORE', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/Mağaza[^\n]*/g))));
      await page.screenshot({ path: DBG + '/store-panel.png', clip: { x: 0, y: 108, width: 320, height: 500 } });
    }, page);
    await step('tak-motor-mili', async () => {
      const motor = await addPart(page, 'Motor ve Servo', 'WattOS Motor', '480 RPM');
      const gear = await addPart(page, 'Dişliler', 'Dişli', '5mm Altıgen 20 diş');
      log('motor', JSON.stringify(motor), 'gear', JSON.stringify(gear));
      await page.evaluate((id) => { const st = window.__robot.getState(); const p = st.parts.find(q => q.id === id); st.updatePart(id, { position: p.position.clone().set(70, p.position.y, 70) }); }, gear.id);
      await page.waitForTimeout(1000); gear.pos = [70, gear.pos[1], 70];
      await page.evaluate(() => window.__robot.getState().deselectAll());
      await fitView(page);
      await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
      const gh = (await partHoles(page, gear.id)).sort((a, b) => Math.hypot(a.p[0] - gear.pos[0], a.p[2] - gear.pos[2]) - Math.hypot(b.p[0] - gear.pos[0], b.p[2] - gear.pos[2]));
      log('gear holes', JSON.stringify(gh.slice(0, 3)));
      const center = gh[0] ? gh[0].p : [gear.pos[0], gear.pos[1] * 2, gear.pos[2]];
      const k = await toScreen(page, [center[0], Math.max(...(gh.length ? gh.filter(h => Math.hypot(h.p[0] - center[0], h.p[2] - center[2]) < 0.5).map(h => h.p[1]) : [gear.pos[1]])), center[2]]);
      await page.mouse.click(k.x, k.y); await page.waitForTimeout(600);
      log('source', JSON.stringify(await page.evaluate(() => { const s = window.__tak.getState(); return s.kaynak && { partId: s.kaynak.partId, hole: s.kaynak.delik }; })));
      const shaftP = await page.evaluate((id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, motor.id);
      const m = await toScreen(page, shaftP);
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await page.mouse.click(m.x, m.y); await page.waitForTimeout(1500);
      const toast = page.getByText('Motor eklemi eklendi', { exact: false }).first();
      const visible = await toast.isVisible().catch(() => false);
      log('toast visible', visible, 'all', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*eklemi[^\n]*/g))));
      log('gear after', JSON.stringify(await page.evaluate((id) => { const p = window.__robot.getState().parts.find(q => q.id === id); return { pos: p.position.toArray(), parent: p.ebeveyn, joint: p.eklem }; }, gear.id)));
      if (visible) {
        await page.mouse.move(1439, 899);
        await mark(page, [{ n: 6, loc: toast }]);
        const tb = await toast.boundingBox();
        await page.screenshot({ path: IMG + '/builder-tak-motor-mili.png', clip: crop(union(tb, pointBox(m, 380)), 10), animations: 'disabled' });
        await clearMarks(page);
      } else {
        await page.screenshot({ path: DBG + '/motor-no-toast.png' });
      }
    }, page);
  }
  // ======================= tak =======================
  if (scenes.includes('tak')) {
    const page = await omniScene(browser);
    const ps0 = await listParts(page);
    const structures = ps0.filter(p => /str-c1/.test(p.type));
    const n0 = ps0.length;
    const spot = await page.evaluate(() => { const c = window.__controls.current; const p = c.object.position, t = c.target; let dx = p.x - t.x, dz = p.z - t.z; const L = Math.hypot(dx, dz) || 1; const at = { x: Math.round(t.x + dx / L * 360), z: Math.round(t.z + dz / L * 360) }; window.__robot.getState().addPartOfType('shop-prb-str-c1-0105', at); return at; });
    log('spot', JSON.stringify(spot));
    await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n0); await page.waitForTimeout(1500);
    const added = (await listParts(page)).slice(-1)[0];
    log('new structure', JSON.stringify(added));
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
    const attachState = () => page.evaluate(() => { const s = window.__tak.getState(); return { active: s.aktif, source: s.kaynak ? { partId: s.kaynak.partId, hole: s.kaynak.delik, face: !!s.kaynak.yuzey } : null, session: !!s.oturum }; });
    log('attach', JSON.stringify(await attachState()), 'panel', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '));
    const sh = (await partHoles(page, added.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
    const topSrc = sh.filter(h => h.p[1] > sh[0].p[1] - 1).sort((a, b) => a.p[0] - b.p[0] || a.p[2] - b.p[2]);
    const srcHole = topSrc[Math.floor(topSrc.length / 2)] ?? (await partHoles(page, added.id))[0];
    const targetCandidates = [];
    for (const p of structures) for (const h of await partHoles(page, p.id)) if (Math.abs(h.a[1]) > 0.9) targetCandidates.push({ ...h, id: p.id });
    const ymax = Math.max(...targetCandidates.map(h => h.p[1])); targetCandidates.splice(0, targetCandidates.length, ...targetCandidates.filter(h => h.p[1] > ymax - 1)); targetCandidates.sort((a, b) => Math.hypot(a.p[0] - spot.x, a.p[2] - spot.z) - Math.hypot(b.p[0] - spot.x, b.p[2] - spot.z));
    const targetHole = targetCandidates[0];
    log('source', JSON.stringify(srcHole), 'target', JSON.stringify(targetHole));
    await step('tak-delik', async () => {
      const k = await toScreen(page, srcHole.p); await page.mouse.click(k.x, k.y); await page.waitForTimeout(600);
      const h = await toScreen(page, targetHole.p); await page.mouse.move(h.x, h.y, { steps: 4 }); await page.waitForTimeout(800);
      log('attach', JSON.stringify(await attachState()), 'panel', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '), 'status', await page.locator('[data-testid="durum-tak"]').innerText().catch(() => '?'));
      await mark(page, [{ n: 2, box: pointBox(k, 28) }, { n: 3, box: pointBox(h, 28) }]);
      const pb = await page.locator('[data-testid="tak-paneli"]').boundingBox();
      await page.screenshot({ path: IMG + '/builder-tak-delik.png', clip: crop(union(pb, pointBox(k, 300), pointBox(h, 300)), 10), animations: 'disabled' });
      await clearMarks(page);
      await page.mouse.click(h.x, h.y); await page.waitForTimeout(1500);
      log('parent', await page.evaluate((id) => window.__robot.getState().parts.find(p => p.id === id).ebeveyn, added.id), 'target id', targetHole.id);
      log('attached', JSON.stringify(await attachState()), JSON.stringify((await listParts(page)).find(p => p.id === added.id)), 'selected', JSON.stringify(await selectedIds(page)));
    }, page);
    await step('tak-sonuc', async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      await capture(page, IMG + '/builder-tak-sonuc.png', FULL);
    }, page);
    await step('tak-son-baglanti', async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      const panel = page.locator('[data-testid="tak-paneli"]');
      log('panel', (await panel.innerText()).replace(/\n/g, ' | '), 'title', await page.locator('[data-testid="tak-dondur"]').getAttribute('title'));
      await mark(page, [{ n: 2, loc: page.locator('[data-testid="tak-dondur"]') }, { n: 3, loc: page.locator('[data-testid="tak-cevir"]') }]);
      const pb = await panel.boundingBox();
      const y = await toScreen(page, targetHole.p);
      await capture(page, IMG + '/builder-tak-son-baglanti.png', crop(union(pb, pointBox(y, 260)), 10));
      await clearMarks(page);
      await page.locator('[data-testid="tak-dondur"]').click(); await page.waitForTimeout(1000);
      log('rotation after rotate', JSON.stringify(await page.evaluate((id) => window.__robot.getState().parts.find(p => p.id === id).rotation.toArray(), added.id)));
    }, page);
    await step('tak-yuz', async () => {
      await page.keyboard.press('Control+z'); await page.waitForTimeout(1500);
      log('undone', JSON.stringify(await attachState()), JSON.stringify((await listParts(page)).find(p => p.id === added.id).pos));
      // source face: between two holes on the Structure's top face; target face: between two holes on the chassis top face
      const between = (hs, ref) => { const y = hs.filter(h => Math.abs(h.p[1] - ref.p[1]) < 0.5 && h !== ref).sort((a, b) => Math.hypot(a.p[0] - ref.p[0], a.p[2] - ref.p[2]) - Math.hypot(b.p[0] - ref.p[0], b.p[2] - ref.p[2]))[0]; return y ? ref.p.map((v, i) => (v + y.p[i]) / 2) : ref.p; };
      const sh2 = (await partHoles(page, added.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
      const sRef = sh2[Math.floor(Math.min(sh2.length, 5) / 2)];
      const sp = between(sh2, sRef);
      const th = (await partHoles(page, targetHole.id)).filter(h => Math.abs(h.a[1]) > 0.9);
      const tRef = th.find(h => Math.hypot(h.p[0] - targetHole.p[0], h.p[1] - targetHole.p[1], h.p[2] - targetHole.p[2]) < 0.5) ?? th[0];
      const tp = between(th, tRef);
      const k = await toScreen(page, sp), h = await toScreen(page, tp);
      await page.keyboard.down('Shift');
      await page.mouse.click(k.x, k.y); await page.waitForTimeout(600);
      await page.mouse.move(h.x, h.y, { steps: 4 }); await page.waitForTimeout(800);
      log('face source', JSON.stringify(await attachState()));
      await mark(page, [{ n: 2, box: pointBox(k, 28) }, { n: 3, box: pointBox(h, 28) }]);
      const pb = await page.locator('[data-testid="tak-paneli"]').boundingBox();
      await page.screenshot({ path: IMG + '/builder-tak-yuz.png', clip: crop(union(pb, pointBox(k, 300), pointBox(h, 300)), 10), animations: 'disabled' });
      await clearMarks(page);
      await page.mouse.click(h.x, h.y); await page.waitForTimeout(1500);
      await page.keyboard.up('Shift');
      log('face attached', JSON.stringify(await attachState()), JSON.stringify((await listParts(page)).find(p => p.id === added.id)));
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      await page.screenshot({ path: DBG + '/face-result.png', clip: VIEWPORT_3D });
      await page.locator('[data-testid="tak-cevir"]').click().catch(() => {}); await page.waitForTimeout(800);
      log('flip toast', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*arkası[^\n]*/g))));
    }, page);
  }

  // ======================= magazayok =======================
  if (scenes.includes('magazayok')) {
    // store API blocked: row text in the static catalog (is a price shown?)
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
    try {
      await ctx.route('**/store/**', r => r.abort());
      const page = await ctx.newPage(); page.setDefaultTimeout(15000);
      await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
      await page.goto('https://probotstudio.com/builder/', { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.getByText('Mağaza stoğuna', { exact: false }).first().waitFor({ timeout: 60000 }).catch(() => log('no static-catalog toast'));
      log('NO-STORE toast', JSON.stringify(await page.evaluate(() => document.body.innerText.match(/Mağaza[^\n]*/g))));
      for (const label of ['Anladım, devam et']) { const b = page.getByRole('button', { name: label }); if (await b.count()) await b.first().click().catch(() => {}); }
      await page.locator('[data-bos-sahne-bos]').click().catch(() => {});
      await openFolder(page, 'Yapı', 'Structure');
      log('NO-STORE rows', JSON.stringify(await page.locator('[data-family-folder] [data-part-type]').allInnerTexts()));
      await page.screenshot({ path: DBG + '/no-store.png', clip: { x: 0, y: 108, width: 320, height: 500 } });
    } catch (e) { log('ERROR magazayok', e.message.split('\n')[0]); } finally { await ctx.close(); }
  }
} finally { await browser.close(); }
