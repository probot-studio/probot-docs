// English Builder docs, group 3 images: opens prod in English (?dil=en, see lib-en.mjs), prepares the screen for each
// image, marks targets with a magenta frame and a numbered badge, and writes to the output folder.
// Same recipes and file names as the Turkish scripts in tools/builder/capture/ (capture-a.mjs, capture-b.mjs,
// capture-night.mjs, capture-dev.mjs); selectors use the English labels or the same data-* attributes.
//
// Usage: PW_WS=<playwright run-server ws address> node capture-3.mjs <img-dir> <image,...> [debug-dir]
// (the ws address carries a credential: it is read only from the environment, never written to the script or the log).
// Image name filter: only the listed images are captured (name = file name without "builder-" and ".png").
// Names: olc-shift, olc-sonuc, panel-ayirici, panel-paneller, panel-sekme-tasi, panel-sifirla, panel-sonuc,
//   parca-ekle-boardoza, parca-ekle-bolumden, parca-ekle-secenek, parca-ekle-sonuc, parca-ekle-surukle,
//   parca-ekle-uzunluk, sec-durum-seridi, sec-parcalar-sekmesi, sec-sil, sec-sonuc, sec-tumunu-goster,
//   sim-dosya-menusu, sim-katalog, sim-sonuc, sketch-cizim, sketch-duzlem, sketch-extrude, sketch-kisit,
//   sketch-sonuc, tak-delik, tak-motor-mili, tak-son-baglanti, tak-sonuc, tak-yuz, tasi-coklu, tasi-dondur,
//   tasi-sayiyla, tasi-sonuc, tasi-tutamac, temel-ayir, temel-birlestir, temel-ozellikler,
//   temel-sekiller-listesi, temel-sonuc
// Run from a folder where Playwright is installed. Heavy job: on a shared machine, hold the browser lock and keep
// each run short (a few images per run). Afterwards: python3 tools/builder/capture/shrink.py <img-dir>/*.png
import { connect, prepare, prepare3d, mark, clearMarks, capture as captureClip, toScreen, listParts, partHoles } from './lib-en.mjs';
// The cookie banner (.probot-consent-banner) can load after the notices were dismissed; remove it before every
// capture and store the "Only necessary" answer so it does not come back (a style tag alone can time out on a heavy scene)
async function capture(page, file, clip) {
  await page.evaluate(() => {
    try { if (!localStorage.getItem('probot-consent')) localStorage.setItem('probot-consent', 'denied'); } catch {}
    document.querySelectorAll('.probot-consent-banner').forEach(e => e.remove());
    document.documentElement.style.setProperty('--probot-consent-space', '0px');
  }).catch(() => {});
  await captureClip(page, file, clip);
}
const IMG = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || IMG;
const wanted = (name) => REQUESTED.includes(name);
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const FULL = { x: 0, y: 0, width: 1440, height: 900 };
const VIEWPORT_3D = { x: 310, y: 108, width: 860, height: 792 };
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Dock tab by its exact title ("Parts" must not match "Add parts")
const tab = (page, name) => page.locator('.dv-tab').filter({ hasText: new RegExp('^\\s*' + esc(name) + '\\s*$') }).first();
const crop = (r, pad = 0) => {
  const x = Math.max(0, Math.round(r.x - pad)), y = Math.max(0, Math.round(r.y - pad));
  return { x, y, width: Math.min(Math.round(r.width + 2 * pad), 1440 - x), height: Math.min(Math.round(r.height + 2 * pad), 900 - y) };
};
const union = (...rs) => {
  const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
  const x2 = Math.max(...rs.map(r => r.x + r.width)), y2 = Math.max(...rs.map(r => r.y + r.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
const pointBox = (p, s = 26) => ({ x: p.x - s / 2, y: p.y - s / 2, width: s, height: s });
const outFile = (name) => `${IMG}/builder-${name}.png`;
const selectedIds = (page) => page.evaluate(() => window.__robot.getState().selectedPartIds);
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
const R0 = (page, fn, arg) => page.evaluate(fn, arg);
const fitView = async (page) => { try { await menu(page, 'View').click(); await page.getByText('Fit view', { exact: true }).first().click(); await page.waitForTimeout(2500); } catch (e) { log('fit view error', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); } };
// The Measure panel title; the toolbar button has the same text, so skip anything inside a button
const measureTitle = (page) => page.getByText('Measure', { exact: true }).locator('xpath=self::*[not(ancestor-or-self::button)]').first();
const contextMenu = (page) => page.locator('div.fixed.z-50.shadow-toolbar').first();

async function step(name, page, fn) {
  if (!wanted(name)) return;
  const t = Date.now();
  try { await fn(); log('OK', name, (Date.now() - t) + 'ms'); }
  catch (e) {
    log('ERROR', name, e.message.split('\n')[0]);
    try { await page.screenshot({ path: `${DBG}/error-${name}.png` }); } catch {}
    try { await clearMarks(page); await page.keyboard.press('Escape'); } catch {}
  }
}
// Wait for notifications (toasts) to go away
async function waitToastsGone(page, ms = 15000) {
  await page.waitForFunction(() => !document.querySelector('[data-sonner-toast],[role="status"] li, .toast'), null, { timeout: ms }).catch(() => {});
}
async function emptyScene(browser) {
  const { page } = await prepare3d(browser); page.setDefaultTimeout(60000);
  await page.waitForTimeout(1500);
  return page;
}
async function loadOmni(page) {
  await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
  await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 120000 });
  await page.waitForTimeout(3000);
}
// Navigate the Add parts panel back to its top level (the section list)
async function toTopLevel(page) {
  for (let i = 0; i < 5; i++) {
    if (await page.locator('[data-section]').count()) break;
    const g = page.locator('[data-family-back], [data-section-back]').first();
    if (await g.count()) await domClick(g).catch(() => {});
    await page.waitForTimeout(500);
  }
}
// Open a section of the Add parts panel (data-section id) and, optionally, a part family inside it (data-family id)
// DOM clicks: with a heavy scene the page draws few frames, and Playwright's stability check on a normal click can time out.
const domClick = (loc) => loc.evaluate((el) => el.click());
async function openFolder(page, section, family) {
  await domClick(tab(page, 'Add parts')).catch(() => {}); await page.waitForTimeout(200);
  await toTopLevel(page);
  await domClick(page.locator(`[data-section="${section}"]`).first()); await page.waitForTimeout(400);
  if (family) { await domClick(page.locator(`[data-family="${family}"]`).first()); await page.waitForTimeout(400); }
}
const optionRow = (page, family, option) => page.locator(family ? '[data-family-folder] [data-part-type]' : '[data-section-open] [data-part-type]').filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first();
// Part type of an option in the Add parts tab (read from the DOM)
async function partTypeOf(page, section, family, option) {
  await openFolder(page, section, family);
  return optionRow(page, family, option).getAttribute('data-part-type');
}
// Add a part through the store hook; returns the new part
async function addPartOfType(page, kind, at) {
  const n = (await listParts(page)).length;
  await R0(page, ({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: kind, at });
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1200);
  const ps = await listParts(page); return ps[ps.length - 1];
}
// Add a part by clicking its option row; returns the new part
async function addPartByRow(page, section, family, option) {
  await openFolder(page, section, family);
  const n = (await listParts(page)).length;
  await optionRow(page, family, option).click();
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
  await page.waitForTimeout(1500);
  const ps = await listParts(page); return ps[ps.length - 1];
}
// Attaches a hole of the source part to the highest hole among the target parts (via the hook), keeps the best result
async function attachToHighest(page, sourceId, targetIds) {
  return page.evaluate(({ sourceId, targetIds }) => {
    const R = window.__robot, T = window.__tak;
    let best = null;
    const top = (id) => Math.max(...window.__magnet.worldSnapHoles(R.getState().parts.find(p => p.id === id)).map(h => h.point.y), -1e9);
    targetIds = targetIds.map(id => [id, top(id)]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(a => a[0]);
    for (const h of targetIds) {
      const hp = R.getState().parts.find(p => p.id === h);
      const n = window.__magnet.worldSnapHoles(hp).length;
      for (let d = 0; d < n; d++) for (const side of [1, -1]) {
        const ok = T.getState().bagla({ partId: sourceId, delik: 0 }, { partId: h, delik: d, taraf: side });
        if (!ok) continue;
        const k = R.getState().parts.find(p => p.id === sourceId);
        const y = k.position.y;
        R.getState().undo();
        if (!best || y > best.y) best = { h, d, side, y };
      }
    }
    if (best) T.getState().bagla({ partId: sourceId, delik: 0 }, { partId: best.h, delik: best.d, taraf: best.side });
    return best;
  }, { sourceId, targetIds });
}
// Screen box around the move-gizmo arrow for one axis (axis = world direction vector)
async function axisBox(page, pos, axis) {
  const c = await toScreen(page, pos); const u = await toScreen(page, pos.map((v, i) => v + axis[i]));
  let dx = u.x - c.x, dy = u.y - c.y; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  const a = { x: c.x + dx * 18, y: c.y + dy * 18 }, b = { x: c.x + dx * 105, y: c.y + dy * 105 };
  return { x: Math.min(a.x, b.x) - 10, y: Math.min(a.y, b.y) - 10, width: Math.abs(a.x - b.x) + 20, height: Math.abs(a.y - b.y) + 20 };
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
    let x1 = 1e9, y1 = 1e9, x2 = -1, y2 = -1, n = 0, bottomX = 0, bottomY = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (f(d[i], d[i + 1], d[i + 2])) { n++; if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; if (y > bottomY) { bottomY = y; bottomX = x; } }
    }
    if (n < 20) return null;
    const sx = clip.width / c.width, sy = clip.height / c.height;
    return { x: clip.x + x1 * sx, y: clip.y + y1 * sy, width: (x2 - x1) * sx, height: (y2 - y1) * sy, n, bottom: { x: clip.x + bottomX * sx, y: clip.y + bottomY * sy } };
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
// The English tab names are longer: the active tab of the Left panel (Sketch) can be cut at the panel edge.
// Scroll the tab row so the active tab shows whole; if it is still cut, widen the Left panel by dragging its divider.
async function showActiveTab(page) {
  const clipped = () => page.evaluate(() => {
    const t = [...document.querySelectorAll('.dv-tab.dv-active-tab')].filter(e => e.getBoundingClientRect().width > 0).sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)[0];
    if (!t) return null;
    const box = t.closest('.dv-tabs-container') || t.parentElement;
    const r = t.getBoundingClientRect(), c = box.getBoundingClientRect();
    return { tab: t.innerText.trim(), right: Math.round(r.right), edge: Math.round(c.right), cut: r.right > c.right + 0.5 };
  });
  let c = await clipped(); log('active tab', JSON.stringify(c));
  if (!c || !c.cut) return;
  await page.evaluate(() => { const t = [...document.querySelectorAll('.dv-tab.dv-active-tab')].filter(e => e.getBoundingClientRect().width > 0).sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)[0]; t?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
  await page.waitForTimeout(400);
  c = await clipped(); log('active tab after scroll', JSON.stringify(c));
  if (!c || !c.cut) return;
  const sashes = await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
  const sh = sashes.filter(r => r.height > 300 && r.x < 500).sort((a, b) => a.x - b.x)[0];
  if (!sh) return;
  const sx = sh.x + sh.width / 2, sy = sh.y + sh.height / 2, d = c.right - c.edge + 50;
  await page.mouse.move(sx, sy); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(sx + d * i / 8, sy);
  await page.mouse.up(); await page.mouse.move(1439, 899); await page.waitForTimeout(1500);
  log('active tab after widening', JSON.stringify(await clipped()));
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
  // ======================= Basic shapes: empty scene (capture-night.mjs) =======================
  if (['temel-sekiller-listesi', 'temel-ozellikler', 'temel-birlestir', 'temel-sonuc', 'temel-ayir'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await tab(page, 'Add parts').click();
    await page.locator('[data-section="temel"]').click();
    await page.locator('[data-part-type="ozel-tup"]').waitFor();
    log('basic shape rows', JSON.stringify(await page.locator('[data-section-open="temel"] [data-part-type]').allInnerTexts()));
    await step('temel-sekiller-listesi', page, async () => {
      const b = await page.locator('[data-section-open="temel"]').boundingBox();
      await mark(page, [{ n: 3, loc: page.locator('[data-part-type="ozel-kutu"]') }]);
      await capture(page, outFile('temel-sekiller-listesi'), crop({ x: 0, y: 108, width: 312, height: Math.min(792, b.y + b.height + 16 - 108) }));
      await clearMarks(page);
    });
    await page.locator('[data-part-type="ozel-kutu"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(1500);
    const box = (await listParts(page))[0];
    log('custom shape text', (await page.locator('[data-testid="ozel-sekil"]').innerText()).replace(/\n/g, ' | '));
    await step('temel-ozellikler', page, async () => {
      const sizeRow = page.locator('[data-testid="ozel-olcu-w"]').locator('xpath=ancestor::div[2]/..');
      const kind = page.locator('[data-testid="ozel-delik"]').locator('xpath=../..');
      const colorRow = page.locator('[data-testid="ozel-renkler"]').locator('xpath=..');
      await mark(page, [{ n: 2, loc: sizeRow }, { n: 4, loc: colorRow }, { n: 5, loc: kind }]);
      const b = await page.locator('[data-testid="ozel-sekil"]').boundingBox();
      await capture(page, outFile('temel-ozellikler'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 40 - 108 }));
      await clearMarks(page);
    });
    // Cylinder: Ø10 × 40, Hole, centered on the box
    await page.locator('[data-part-type="ozel-silindir"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length === 2);
    await page.waitForTimeout(1200);
    const sizeInputs = page.locator('[data-testid^="ozel-olcu-"]');
    await sizeInputs.nth(0).fill('10'); await sizeInputs.nth(0).press('Enter'); await page.waitForTimeout(300);
    await sizeInputs.nth(1).fill('40'); await sizeInputs.nth(1).press('Enter'); await page.waitForTimeout(300);
    await page.locator('[data-testid="ozel-delik"]').click(); await page.waitForTimeout(300);
    const ins = page.getByText('Position (mm)', { exact: true }).locator('..').locator('input');
    await ins.nth(0).fill(String(Math.round(box.pos[0]))); await ins.nth(0).press('Enter'); await page.waitForTimeout(300);
    await ins.nth(2).fill(String(Math.round(box.pos[2]))); await ins.nth(2).press('Enter'); await page.waitForTimeout(500);
    await blur(page);
    const ids = (await listParts(page)).map(p => p.id);
    await page.evaluate((ids) => window.__robot.getState().selectParts(ids), ids); await page.waitForTimeout(1200);
    await step('temel-birlestir', page, async () => {
      await page.getByText('Multiple selection').first().waitFor();
      const b = await page.locator('[data-testid="ozel-birlestir"]').boundingBox();
      await mark(page, [{ n: 4, loc: page.locator('[data-testid="ozel-birlestir"]') }]);
      await capture(page, outFile('temel-birlestir'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 30 - 108 }));
      await clearMarks(page);
    });
    await page.locator('[data-testid="ozel-birlestir"]').click();
    await page.getByText('Combined shape').first().waitFor();
    await fitView(page);
    log('combined shape text', (await page.locator('[data-testid="ozel-sekil"]').innerText()).replace(/\n/g, ' | '));
    await step('temel-sonuc', page, async () => {
      await waitToastsGone(page); await page.waitForTimeout(1000);
      await capture(page, outFile('temel-sonuc'), FULL);
    });
    await step('temel-ayir', page, async () => {
      const b = await page.locator('[data-testid="ozel-ayir"]').boundingBox();
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="ozel-ayir"]') }]);
      await capture(page, outFile('temel-ayir'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 30 - 108 }));
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Sketch and Extrude: empty scene + box (capture-night.mjs) =======================
  if (['sketch-duzlem', 'sketch-cizim', 'sketch-kisit', 'sketch-extrude', 'sketch-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await tab(page, 'Add parts').click();
    await page.locator('[data-section="temel"]').click();
    await page.locator('[data-part-type="ozel-kutu"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(1000);
    const box = (await listParts(page))[0];
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await fitView(page);
    await blur(page);
    await page.locator('button[title^="Sketch"]').first().click();
    await page.locator('[data-testid="sketch-paneli"]').waitFor();
    await page.getByText('Click a flat face of a part').first().waitFor();
    await showActiveTab(page);
    await step('sketch-duzlem', page, async () => {
      await mark(page, [{ n: 2, loc: page.locator('[data-testid="sketch-duzlem-ust"]').locator('..') }]);
      await capture(page, outFile('sketch-duzlem'), crop({ x: 0, y: 108, width: 860, height: 520 }));
      await clearMarks(page);
    });
    // click the top face of the box
    const top = await toScreen(page, [box.pos[0], box.pos[1] + 10, box.pos[2]]);
    await page.mouse.click(top.x, top.y); await page.waitForTimeout(2500);
    await page.locator('[data-testid="sketch-arac-dikdortgen"]').click(); await page.waitForTimeout(300);
    const y = box.pos[1] + 10;
    const k1 = await toScreen(page, [box.pos[0] - 15, y, box.pos[2] - 10]);
    const k2 = await toScreen(page, [box.pos[0] + 15, y, box.pos[2] + 10]);
    await page.mouse.move(k1.x, k1.y); await page.mouse.click(k1.x, k1.y); await page.waitForTimeout(500);
    await page.mouse.move(k2.x, k2.y); await page.mouse.click(k2.x, k2.y); await page.waitForTimeout(800);
    log('status', await page.locator('[data-testid="sketch-durum"]').innerText().catch(() => '-'));
    await step('sketch-cizim', page, async () => {
      await page.locator('[data-testid="sketch-ogeler"]').waitFor();
      await showActiveTab(page);
      await mark(page, [{ n: 1, loc: page.locator('[data-testid="sketch-arac-dikdortgen"]') }]);
      await capture(page, outFile('sketch-cizim'), crop({ x: 0, y: 108, width: 1170, height: 640 }));
      await clearMarks(page);
    });
    // Select tool, click the middle of the top edge
    await page.locator('[data-testid="sketch-arac-sec"]').click(); await page.waitForTimeout(300);
    const edge = await toScreen(page, [box.pos[0], y, box.pos[2] - 10]);
    await page.mouse.click(edge.x, edge.y); await page.waitForTimeout(800);
    const valueInput = page.locator('[data-testid="sketch-olcu-deger"]');
    if (await valueInput.count()) { await valueInput.fill('40'); await valueInput.press('Enter'); await page.waitForTimeout(800); }
    await step('sketch-kisit', page, async () => {
      await page.locator('[data-testid="sketch-secili"]').waitFor();
      await showActiveTab(page);
      // badge 3 above the box at its right end: on the corner it covers the end of the Length label
      await mark(page, [{ n: 3, loc: valueInput, at: 'above-r' }, { n: 4, loc: page.locator('[data-testid="sketch-kisit-ekle"]') }]);
      // the whole Left panel (showActiveTab may have widened it): up to its divider
      const lsash = (await page.locator('.dv-sash').evaluateAll(es => es.map(e => e.getBoundingClientRect()).filter(r => r.height > 300 && r.x < 600).map(r => r.x))).sort((a, b) => a - b)[0];
      await capture(page, outFile('sketch-kisit'), crop({ x: 0, y: 108, width: Math.round(lsash ?? 310) + 2, height: 792 }));
      await clearMarks(page);
    });
    await page.locator('[data-testid="sketch-bitir"]').click(); await page.waitForTimeout(1500);
    await page.locator('[data-testid="sketch-ekstrud"]').click();
    await page.locator('[data-testid="ekstrud-paneli"]').waitFor();
    const thickness = page.locator('[data-testid="ekstrud-panel-kalinlik"]');
    await thickness.fill('10'); await page.waitForTimeout(1500);
    await step('sketch-extrude', page, async () => {
      await mark(page, [{ n: 3, loc: thickness }, { n: 4, loc: page.locator('[data-testid="ekstrud-panel-delik"]').locator('..') }, { n: 5, loc: page.locator('[data-testid="ekstrud-panel-yon-normal"]').locator('..') }]);
      await capture(page, outFile('sketch-extrude'), crop({ x: 0, y: 108, width: 1170, height: 640 }));
      await clearMarks(page);
    });
    await page.locator('[data-testid="ekstrud-tamam"]').click(); await page.waitForTimeout(1500);
    await step('sketch-sonuc', page, async () => {
      await page.evaluate(() => { const c = window.__controls.current; c.object.position.set(c.target.x + 120, c.target.y + 110, c.target.z + 140); c.update(); });
      await fitView(page);
      await waitToastsGone(page);
      await capture(page, outFile('sketch-sonuc'), FULL);
    });
    await page.close().catch(() => {});
  }
  // ======================= Panels: empty scene (capture-night.mjs) =======================
  if (['panel-sekme-tasi', 'panel-sifirla', 'panel-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const dragTab = async (name, x, y, fn) => {
      const b = await tab(page, name).boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + b.width / 2 + (x - b.x - b.width / 2) * i / 12, b.y + b.height / 2 + (y - b.y - b.height / 2) * i / 12); await page.waitForTimeout(40); }
      await page.waitForTimeout(600);
      if (fn) await fn();
      await page.mouse.up(); await page.waitForTimeout(1200);
    };
    const layout = () => page.evaluate(() => [...document.querySelectorAll('.dv-tab')].map(t => { const r = t.getBoundingClientRect(); return t.innerText.trim() + '@' + Math.round(r.x) + ',' + Math.round(r.y); }).join(' | '));
    log('layout0', await layout());
    if (wanted('panel-sekme-tasi') || wanted('panel-sifirla')) {
      await dragTab('Parts', 1160, 500, async () => {
        const targets = await page.evaluate(() => [...document.querySelectorAll('[class*="dv-drop-target"]')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x: r.x, y: r.y, width: r.width, height: r.height }; }).filter(r => r.width > 0));
        await step('panel-sekme-tasi', page, async () => {
          const s = targets.filter(h => /selection|anchor/.test(h.c)).sort((a, b) => a.width * a.height - b.width * b.height)[0];
          if (!s) throw new Error('no drop target');
          await mark(page, [{ n: 2, box: s }]);
          await page.screenshot({ path: outFile('panel-sekme-tasi'), clip: crop({ x: 0, y: 40, width: 1440, height: 560 }) });
          await clearMarks(page);
        });
      });
      log('layout1', await layout());
      // Close the Robot catalog tab, then open the View menu
      await step('panel-sifirla', page, async () => {
        const catalogTab = tab(page, 'Robot catalog');
        if (await catalogTab.count()) { await catalogTab.click(); await catalogTab.locator('.dv-default-tab-action, [aria-label*="Close"], svg').last().click().catch(() => {}); await page.waitForTimeout(500); }
        log('layout2', await layout());
        await menu(page, 'View').click(); await page.waitForTimeout(500);
        const it = page.getByRole('menuitem', { name: 'Reset layout' });
        const m = await page.locator('[role=menu]').first().boundingBox();
        await mark(page, [{ n: 3, loc: it }]);
        await capture(page, outFile('panel-sifirla'), crop({ x: m.x - 8, y: 40, width: m.width + 16, height: m.y + m.height + 8 - 40 }));
        await clearMarks(page);
        await it.click(); await page.waitForTimeout(1200);
        log('layout3', await layout());
      });
    }
    await step('panel-sonuc', page, async () => {
      await tab(page, 'Add parts').click();
      await page.locator('[data-section="temel"]').click();
      await page.locator('[data-part-type="ozel-kutu"]').click();
      await page.waitForFunction(() => window.__robot.getState().parts.length === 1); await page.waitForTimeout(1000);
      await dragTab('Properties', 4, 500);
      log('layout4', await layout());
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      await capture(page, outFile('panel-sonuc'), FULL);
    });
    await page.close().catch(() => {});
  }
  // ======================= Motor shaft: empty scene, motor + gear (capture-night.mjs) =======================
  if (wanted('tak-motor-mili')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const tm = await partTypeOf(page, 'shop-motor', 'wattos-motor', '480 RPM');
    const td = await partTypeOf(page, 'shop-disliler', 'disli', '5mm Hex 20 teeth');
    log('types', tm, td);
    await step('tak-motor-mili', page, async () => {
      const motor = await addPartOfType(page, tm, { x: 0, z: 0 });
      const gear = await addPartOfType(page, td, { x: 60, z: 0 });
      await R0(page, () => window.__robot.getState().deselectAll());
      await fitView(page);
      await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
      const dd = (await partHoles(page, gear.id)).sort((a, b) => Math.hypot(a.p[0] - gear.pos[0], a.p[2] - gear.pos[2]) - Math.hypot(b.p[0] - gear.pos[0], b.p[2] - gear.pos[2]));
      const c = dd[0] ? dd[0].p : gear.pos; const top = dd[0] ? Math.max(...dd.filter(h => Math.hypot(h.p[0] - c[0], h.p[2] - c[2]) < 0.5).map(h => h.p[1])) : gear.pos[1] * 2;
      // flat side face: 8 mm out from the center (not into the center bore)
      const y = await toScreen(page, [c[0], top, c[2] + 8]);
      await page.mouse.click(y.x, y.y); await page.waitForTimeout(800);
      const shaftPoint = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, motor.id);
      const m = await toScreen(page, shaftPoint);
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await page.mouse.click(m.x, m.y); await page.waitForTimeout(1500);
      const toast = page.getByText('Motor joint added', { exact: false }).first();
      const shown = await toast.isVisible().catch(() => false);
      log('toast', shown);
      if (!shown) { await page.screenshot({ path: DBG + '/motor-no-toast.png' }); throw new Error('no notification'); }
      await page.mouse.move(1439, 899);
      // badge left of the notification (on the corner it covers the first letter); crop high enough for the whole circle
      await mark(page, [{ n: 6, loc: toast, at: 'l' }]);
      const tb = await toast.boundingBox();
      const area = union(tb, { x: tb.x - 34, y: tb.y - 8, width: 1, height: 1 }, { x: m.x - 190, y: m.y - 190, width: 380, height: 380 });
      // the Mate panel stays open at the top left of the scene: start the crop right of it, so no cut-off text shows
      const mp = await page.locator('[data-testid="tak-paneli"]').boundingBox().catch(() => null);
      if (mp && mp.x + mp.width + 8 > area.x - 10) { const x = mp.x + mp.width + 18; area.width -= x - area.x; area.x = x; }
      // the toolbar is in the crop: start on a button edge (no half label); end at the screen edge, so the Properties panel is whole
      if (area.y - 10 < 108) {
        const bx = await page.evaluate((l) => { const xs = [...document.querySelectorAll('button')].map(b => b.getBoundingClientRect()).filter(r => r.width > 0 && r.y > 70 && r.bottom < 112 && r.x >= l).map(r => r.x); return xs.length ? Math.min(...xs) : null; }, area.x - 10);
        // + 10: crop() takes 10 px of margin off again, so the image starts exactly on the button edge
        if (bx != null) { area.width -= bx + 10 - area.x; area.x = bx + 10; }
      }
      area.width = 1450 - area.x;
      log('mate panel', JSON.stringify(mp), 'area', JSON.stringify(area));
      await page.screenshot({ path: outFile('tak-motor-mili'), clip: crop(area, 10), animations: 'disabled' });
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Measure, Shift click: empty scene + 5-hole Structure (capture-night.mjs) =======================
  if (wanted('olc-shift')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const t5 = await partTypeOf(page, 'shop-yapi', 'structure', '5 holes');
    const st = await addPartOfType(page, t5, { x: 0, z: 0 });
    await R0(page, () => window.__robot.getState().deselectAll());
    await fitView(page);
    await page.locator('button[title^="Measure"]').first().click();
    await page.getByText('Click the first point to measure').first().waitFor();
    const panel = measureTitle(page).locator('xpath=ancestor::div[2]');
    const hs = (await partHoles(page, st.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
    const top = hs.filter(h => Math.abs(h.p[1] - hs[0].p[1]) < 1).sort((a, b) => a.p[0] - b.p[0] || a.p[2] - b.p[2]);
    const clickPoint = async (h, shift) => { const n = await toScreen(page, h); await page.mouse.move(n.x, n.y); await page.waitForTimeout(600); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(n.x, n.y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(800); return n; };
    await step('olc-shift', page, async () => {
      const h = top[0].p; await clickPoint([h[0] + 4.2, h[1], h[2]], true);
      await page.getByText('Click the second point').first().waitFor();
      log('shift panel', (await panel.innerText()).replace(/\n/g, ' | '));
      const tb = await page.getByText(/First point on the surface/).first().boundingBox(); const pb0 = await panel.boundingBox();
      await mark(page, [{ n: 3, box: { x: tb.x - 12, y: tb.y, width: tb.width + 18, height: tb.height } }]);
      await capture(page, outFile('olc-shift'), crop({ x: pb0.x - 21, y: pb0.y + 4, width: pb0.width + 27, height: pb0.height + 4 }));
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Empty scene: catalog panel, View menu (capture-a.mjs, scene bos) =======================
  if (wanted('panel-paneller')) {
    const { page, ctx } = await prepare3d(browser);
    await step('panel-paneller', page, async () => {
      const catTab = tab(page, 'Robot catalog');
      await catTab.hover(); await page.waitForTimeout(300);
      await catTab.locator('.dv-default-tab-action, [class*="action"]').first().click();
      await page.waitForTimeout(800);
      await menu(page, 'View').click(); await page.waitForTimeout(500);
      const target = page.getByRole('menuitemcheckbox', { name: 'Robot catalog' });
      await mark(page, [{ n: 3, loc: target, pad: 1 }]);
      const lab = await page.locator('[role=menu]').first().getByText('Panels', { exact: true }).boundingBox();
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, outFile('panel-paneller'), { x: mb.x - 16, y: lab.y - 14, width: mb.width + 32, height: mb.y + mb.height - lab.y + 30 });
      await clearMarks(page); await page.keyboard.press('Escape');
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Omni chassis: Try in Sim, divider (capture-a.mjs, scenes omni1 + panel) =======================
  if (['sim-dosya-menusu', 'sim-katalog', 'panel-ayirici'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser);
    await loadOmni(page);
    await step('sim-dosya-menusu', page, async () => {
      await menu(page, 'File').click(); await page.waitForTimeout(500);
      const sim = page.getByRole('menuitem', { name: 'Try in Sim' });
      await mark(page, [{ n: 2, loc: sim, pad: 1 }]);
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, outFile('sim-dosya-menusu'), { x: Math.max(0, mb.x - 20), y: mb.y - 34, width: mb.width + 40, height: mb.height + 50 });
      await clearMarks(page); await page.keyboard.press('Escape');
    });
    await step('sim-katalog', page, async () => {
      await tab(page, 'Robot catalog').click(); await page.waitForTimeout(800);
      const b = page.locator('[data-simde-dene]');
      log('sim title', await b.getAttribute('title'));
      await mark(page, [{ n: 2, loc: b }]);
      const p = await page.locator('[data-catalog-panel]').boundingBox();
      await capture(page, outFile('sim-katalog'), { x: p.x, y: p.y - 34, width: p.width, height: 300 });
      await clearMarks(page);
    });
    await step('panel-ayirici', page, async () => {
      if (['sim-dosya-menusu', 'sim-katalog'].some(wanted)) { await menu(page, 'View').click(); await page.waitForTimeout(400); await page.getByRole('menuitem', { name: 'Fit view' }).click(); await page.waitForTimeout(2500); }
      const sashes = () => page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
      const s = (await sashes()).filter(r => r.height > 300 && r.x < 500).sort((a, b) => a.x - b.x)[0];
      const sx = s.x + s.width / 2, sy = s.y + s.height / 2;
      await page.mouse.move(sx, sy); await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(sx + i * 10, sy);
      await page.mouse.up(); await page.waitForTimeout(2500);
      const s2 = (await sashes()).filter(r => r.height > 300 && r.x < 600).sort((a, b) => a.x - b.x)[0];
      await mark(page, [{ n: 2, box: { x: s2.x + s2.width / 2 - 4, y: s2.y + 6, width: 8, height: s2.height - 12 }, pad: 2 }]);
      // arrow: pointing right
      await page.evaluate(({ x, y }) => {
        const d = document.createElement('div'); d.className = 'docs-marker';
        d.innerHTML = `<svg width="90" height="30" viewBox="0 0 90 30"><path d="M4 15 H72" stroke="#E6007E" stroke-width="4" stroke-linecap="round"/><path d="M66 5 L84 15 L66 25 Z" fill="#E6007E"/></svg>`;
        Object.assign(d.style, { position: 'fixed', left: (x + 10) + 'px', top: (y - 15) + 'px', zIndex: 2147483646, pointerEvents: 'none' });
        document.body.appendChild(d);
      }, { x: s2.x + s2.width / 2, y: 420 });
      await capture(page, outFile('panel-ayirici'), { x: Math.max(0, s2.x - 300), y: 100, width: 600, height: 800 });
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Empty scene: add part, move / rotate (capture-b.mjs, scene bos1) =======================
  if (['parca-ekle-bolumden', 'parca-ekle-secenek', 'tasi-tutamac', 'tasi-dondur', 'tasi-sayiyla'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser); page.setDefaultTimeout(25000);
    await page.waitForTimeout(2500);
    await page.locator('[data-bos-sahne-bos]').click(); await page.waitForTimeout(500);
    await step('parca-ekle-bolumden', page, async () => {
      await openFolder(page, 'shop-yapi', 'structure');
      const panel = page.locator('[data-family-folder]').first();
      const fb = await panel.boundingBox();
      await mark(page, [{ n: 4, loc: optionRow(page, 'structure', '5 holes') }]);
      await capture(page, outFile('parca-ekle-bolumden'), crop({ x: 0, y: 108, width: 312, height: Math.min(792, fb.y + fb.height + 12 - 108) }));
      await clearMarks(page);
    });
    // 5-hole Structure, Length set to 11 holes for the selector image, then back to 5 holes
    const n = (await listParts(page)).length;
    await openFolder(page, 'shop-yapi', 'structure');
    await optionRow(page, 'structure', '5 holes').click();
    await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1500);
    let str = (await listParts(page)).slice(-1)[0];
    await step('parca-ekle-secenek', page, async () => {
      const sel = page.locator('[data-testid="varyant-secim"]');
      log('variants', JSON.stringify(await sel.locator('option').allInnerTexts()));
      const v11 = await sel.locator('option', { hasText: /^11 holes/ }).first().getAttribute('value');
      await sel.selectOption(v11); await page.waitForTimeout(1500);
      const kb = await page.getByText('Position (mm)', { exact: true }).locator('..').boundingBox();
      await mark(page, [{ n: 3, loc: sel, at: 'above-r' }, { n: 4, loc: page.locator('[data-testid="varyant"] button[title="Next"]'), at: 'tr' }]);
      await capture(page, outFile('parca-ekle-secenek'), crop({ x: 1168, y: 108, width: 272, height: kb.y + kb.height + 14 - 108 }));
      await clearMarks(page);
      const v5 = await sel.locator('option', { hasText: /^5 holes/ }).first().getAttribute('value');
      await sel.selectOption(v5); await page.waitForTimeout(1500);
      str = (await listParts(page)).slice(-1)[0];
    });
    await step('tasi-tutamac', page, async () => {
      await blur(page);
      await page.locator('button[title="Move (T / M)"]').click(); await page.waitForTimeout(300);
      await fitView(page); await page.mouse.move(1439, 899); await page.waitForTimeout(1200);
      const c = await toScreen(page, str.pos);
      // frame from the red arrow's own pixels (the gizmo is drawn at a fixed screen size, the projected axis is only a guess)
      const guess = await axisBox(page, str.pos, [60, 0, 0]);
      const red = await colorBox(page, crop(guess, 16), 'r>235&&g<40&&b<50');
      const box = red ? { x: red.x, y: red.y, width: red.width, height: red.height } : guess;
      log('red axis', JSON.stringify(guess), 'pixels', JSON.stringify(red), 'center', JSON.stringify(c));
      await mark(page, [{ n: 2, box, pad: 6 }]);
      // tighter than the capture-b.mjs crop (660 x 460): the Turkish image is 428 x 222 around the gizmo
      await capture(page, outFile('tasi-tutamac'), crop({ x: c.x - 214, y: c.y - 111, width: 428, height: 222 }));
      await clearMarks(page);
    });
    await step('tasi-dondur', page, async () => {
      await blur(page);
      await page.keyboard.press('r'); await page.waitForTimeout(800);
      const stepSelect = page.locator('[data-testid="donus-adimi"]');
      if ((await stepSelect.evaluate(e => e.tagName)) === 'SELECT') await stepSelect.selectOption({ label: '90°' });
      else { await stepSelect.click(); await page.waitForTimeout(300); await page.getByRole('menuitemradio', { name: '90°' }).or(page.getByText('90°', { exact: true })).first().click(); }
      await page.waitForTimeout(800); await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      const c = await toScreen(page, str.pos);
      const sb = crop({ x: c.x - 230, y: c.y - 230, width: 460, height: 460 });
      const green = await colorBox(page, sb, 'g>170&&r<90&&b<90');
      log('green', JSON.stringify(green));
      const ab = await stepSelect.boundingBox();
      const targets = [{ n: 2, loc: stepSelect }];
      if (green) targets.push({ n: 3, box: pointBox(green.bottom, 30) });
      await mark(page, targets);
      // 12 px more above the step list, so badge 2 is not cut by the image edge
      const area = union(ab, { x: ab.x, y: ab.y - 12, width: 1, height: 1 }, { x: c.x - 260, y: c.y - 230, width: 520, height: 460 });
      // left edge on a toolbar button edge, so no half label shows
      { const bx = await page.evaluate((l) => { const xs = [...document.querySelectorAll('button, select')].map(b => b.getBoundingClientRect()).filter(r => r.width > 0 && r.y > 70 && r.bottom < 112 && r.x >= l).map(r => r.x); return xs.length ? Math.min(...xs) : null; }, area.x - 8);
        if (bx != null && bx - 6 < ab.x) { area.width -= bx + 2 - area.x; area.x = bx + 2; } }
      await capture(page, outFile('tasi-dondur'), crop(area, 8));
      await clearMarks(page);
      await page.keyboard.press('t'); await page.waitForTimeout(300);
    });
    await step('tasi-sayiyla', page, async () => {
      const x = page.getByText('Position (mm)', { exact: true }).locator('..').locator('input').first();
      await x.click(); await x.fill('40'); await x.press('Enter'); await page.waitForTimeout(1000);
      await blur(page);
      const kb = await page.getByText('Position (mm)', { exact: true }).locator('..').boundingBox();
      const db = await page.getByText('Rotation (°)', { exact: true }).locator('xpath=../..').boundingBox();
      await mark(page, [{ n: 1, loc: x }, { n: 4, loc: page.locator('button[title="+90° around Y"]') }]);
      await capture(page, outFile('tasi-sayiyla'), crop({ x: 1168, y: kb.y - 14, width: 272, height: db.y + db.height - kb.y + 28 }));
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Empty scene: shaft length (capture-b.mjs, scene bos2) =======================
  if (wanted('parca-ekle-uzunluk')) {
    const { page, ctx } = await prepare3d(browser); page.setDefaultTimeout(25000);
    await page.waitForTimeout(2500);
    await page.locator('[data-bos-sahne-bos]').click(); await page.waitForTimeout(500);
    await step('parca-ekle-uzunluk', page, async () => {
      const shaft = await addPartByRow(page, 'shop-hub-mil', null, 'Hex Shaft 7mm Kit');
      log('shaft', JSON.stringify(shaft));
      const u = page.locator('[data-testid="uzunluk"]');
      const mm = page.locator('[data-testid="uzunluk-mm"]');
      await mm.click(); await mm.fill('150'); await mm.press('Enter'); await page.waitForTimeout(1200);
      await blur(page);
      log('LENGTH after', (await u.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: mm, at: 'above-r' }, { n: 4, loc: u.locator('button[title^="Lengthen"]'), at: 'tr' }]);
      // the "Length · 150 mm" heading sits just above the field: start the crop above it
      const ub = await u.boundingBox();
      await capture(page, outFile('parca-ekle-uzunluk'), crop(union(ub, { x: ub.x, y: ub.y - 22, width: 1, height: 1 }), 14));
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Omni chassis: drag a part in, select, context menus (capture-b.mjs, scene omni1) =======================
  if (['parca-ekle-surukle', 'sec-durum-seridi', 'sec-sil', 'sec-tumunu-goster'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser); page.setDefaultTimeout(45000);
    await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 90000 });
    await page.waitForTimeout(3000);
    const ps0 = await listParts(page);
    const structures = ps0.filter(p => /str-c1/.test(p.type));
    const wheels = ps0.filter(p => /whl-rbr|omni-teker/.test(p.type));
    log('wheels', wheels.length, 'structures', structures.length);
    await step('parca-ekle-surukle', page, async () => {
      let top = null;
      for (const p of structures) for (const h of await partHoles(page, p.id)) if (Math.abs(h.a[1]) > 0.9 && (!top || h.p[1] > top.p[1])) top = { ...h, id: p.id };
      await openFolder(page, 'shop-yapi', 'structure');
      const row = optionRow(page, 'structure', '5 holes');
      const sb = await row.boundingBox();
      const h = await toScreen(page, [top.p[0] + 5, top.p[1], top.p[2]]);
      await row.evaluate((el) => { window.__dt = new DataTransfer(); el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: window.__dt })); });
      for (let i = 1; i <= 6; i++) {
        const x = sb.x + sb.width + (h.x - sb.x - sb.width) * i / 6, y = sb.y + (h.y - sb.y) * i / 6;
        await page.evaluate(({ x, y }) => document.querySelector('canvas').dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: window.__dt })), { x, y });
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(2500);
      // mark() clears every earlier overlay, so the arrow is drawn after it
      await mark(page, [{ n: 4, box: pointBox(h, 30) }]);
      await arrow(page, { x: sb.x + sb.width - 30, y: sb.y + sb.height / 2 }, { x: h.x - 18, y: h.y - 4 });
      await capture(page, outFile('parca-ekle-surukle'), crop({ x: 0, y: 108, width: Math.max(760, h.x + 260), height: Math.max(420, h.y + 200 - 108) }));
      await clearMarks(page);
      await page.evaluate(() => { document.querySelector('canvas').dispatchEvent(new DragEvent('dragleave', { bubbles: true })); window.__dt = null; });
      await row.evaluate((el) => el.dispatchEvent(new DragEvent('dragend', { bubbles: true })));
      await page.waitForTimeout(500);
      log('parts after drag', (await listParts(page)).length);
      await toTopLevel(page);
    });
    await step('sec-durum-seridi', page, async () => {
      await page.locator('button[title="Move (T / M)"]').click();
      await clickPart(page, wheels[0].id);
      await clickPart(page, wheels[1].id, { shift: true });
      await page.mouse.move(1439, 899); await page.waitForTimeout(1200);
      const strip = page.getByText(/^\d+ selected$/).first().locator('..');
      log('STRIP', await strip.innerText());
      const s0 = await toScreen(page, wheels[0].pos), s1 = await toScreen(page, wheels[1].pos);
      const sb = await strip.boundingBox();
      await mark(page, [{ n: 3, loc: strip }]);
      // the strip sits at the left edge of the crop; put the badge on the frame's corner so it stays inside the image
      await page.evaluate(() => { const r = document.querySelector('.docs-marker')?.firstElementChild; if (r) r.style.left = '0px'; });
      const area = union(sb, pointBox(s0, 260), pointBox(s1, 260));
      await capture(page, outFile('sec-durum-seridi'), crop({ x: Math.max(310, area.x), y: Math.max(108, area.y), width: Math.min(area.x + area.width, 1170) - Math.max(310, area.x), height: 900 - Math.max(108, area.y) }));
      await clearMarks(page);
    });
    await step('sec-sil', page, async () => {
      await page.evaluate((ids) => window.__robot.getState().selectParts(ids), [wheels[0].id, wheels[1].id]);
      await clickPart(page, wheels[0].id, { right: true });
      const m = contextMenu(page);
      log('DELETE MENU', (await m.innerText()).replace(/\n/g, ' | '), 'selected', (await selectedIds(page)).length);
      await mark(page, [{ n: 3, loc: contextMenu(page).locator('button', { hasText: /^\s*Delete/ }).first() }]);
      await capture(page, outFile('sec-sil'), crop(await m.boundingBox(), 12));
      await clearMarks(page);
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    });
    await step('sec-tumunu-goster', page, async () => {
      await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll());
      const target = structures.slice().sort((a, b) => b.pos[1] - a.pos[1])[0];
      await page.evaluate((id) => window.__robot.getState().toggleVisibility([id]), target.id); await page.waitForTimeout(800);
      const m = contextMenu(page);
      await page.mouse.click(1040, 760, { button: 'right' }); await page.waitForTimeout(600);
      log('EMPTY MENU', (await m.innerText()).replace(/\n/g, ' | '));
      const strip = page.getByText(/^\d+ hidden$/).first().locator('..');
      const mb = await m.boundingBox(); const sb = await strip.boundingBox().catch(() => null);
      await mark(page, [{ n: 4, loc: page.getByText(/^Show all/).first() }]);
      await capture(page, outFile('sec-tumunu-goster'), crop(sb ? union(mb, sb) : mb, 12));
      await clearMarks(page);
      await domClick(page.getByText(/^Show all/).first()); await page.waitForTimeout(800);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Omni chassis + Mate: hole to hole (capture-b.mjs, scene tak) =======================
  if (['tak-delik', 'tak-son-baglanti'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser); page.setDefaultTimeout(45000);
    await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 90000 });
    await page.waitForTimeout(3000);
    const ps0 = await listParts(page);
    const structures = ps0.filter(p => /str-c1/.test(p.type));
    const n0 = ps0.length;
    const spot = await page.evaluate(() => { const c = window.__controls.current; const p = c.object.position, t = c.target; let dx = p.x - t.x, dz = p.z - t.z; const L = Math.hypot(dx, dz) || 1; const at = { x: Math.round(t.x + dx / L * 360), z: Math.round(t.z + dz / L * 360) }; window.__robot.getState().addPartOfType('shop-prb-str-c1-0105', at); return at; });
    await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n0); await page.waitForTimeout(1500);
    const added = (await listParts(page)).slice(-1)[0];
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
    const sh = (await partHoles(page, added.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
    const topSrc = sh.filter(h => h.p[1] > sh[0].p[1] - 1).sort((a, b) => a.p[0] - b.p[0] || a.p[2] - b.p[2]);
    const srcHole = topSrc[Math.floor(topSrc.length / 2)] ?? (await partHoles(page, added.id))[0];
    const targetCandidates = [];
    for (const p of structures) for (const h of await partHoles(page, p.id)) if (Math.abs(h.a[1]) > 0.9) targetCandidates.push({ ...h, id: p.id });
    const ymax = Math.max(...targetCandidates.map(h => h.p[1])); targetCandidates.splice(0, targetCandidates.length, ...targetCandidates.filter(h => h.p[1] > ymax - 1)); targetCandidates.sort((a, b) => Math.hypot(a.p[0] - spot.x, a.p[2] - spot.z) - Math.hypot(b.p[0] - spot.x, b.p[2] - spot.z));
    const targetHole = targetCandidates[0];
    // source hole click, hover over the target hole, then the target click (needed by tak-son-baglanti too)
    const k = await toScreen(page, srcHole.p); await page.mouse.click(k.x, k.y); await page.waitForTimeout(600);
    const h = await toScreen(page, targetHole.p); await page.mouse.move(h.x, h.y, { steps: 4 }); await page.waitForTimeout(800);
    await step('tak-delik', page, async () => {
      log('panel', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 2, box: pointBox(k, 28) }, { n: 3, box: pointBox(h, 28) }]);
      const pb = await page.locator('[data-testid="tak-paneli"]').boundingBox();
      await page.screenshot({ path: outFile('tak-delik'), clip: crop(union(pb, pointBox(k, 300), pointBox(h, 300)), 10), animations: 'disabled' });
      await clearMarks(page);
    });
    await page.mouse.click(h.x, h.y); await page.waitForTimeout(1500);
    log('parent', await page.evaluate((id) => window.__robot.getState().parts.find(p => p.id === id).ebeveyn, added.id), 'target id', targetHole.id);
    await step('tak-son-baglanti', page, async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      const panel = page.locator('[data-testid="tak-paneli"]');
      log('panel', (await panel.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 2, loc: page.locator('[data-testid="tak-dondur"]') }, { n: 3, loc: page.locator('[data-testid="tak-cevir"]') }]);
      const pb = await panel.boundingBox();
      const y = await toScreen(page, targetHole.p);
      await capture(page, outFile('tak-son-baglanti'), crop(union(pb, pointBox(y, 260)), 10));
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Omni chassis result images (scene built via the hook; capture-night.mjs) =======================
  const OMNI = ['parca-ekle-sonuc', 'sim-sonuc', 'sec-parcalar-sekmesi', 'tasi-coklu', 'tak-yuz', 'sec-sonuc', 'tasi-sonuc', 'tak-sonuc', 'olc-sonuc'];
  if (OMNI.some(wanted)) {
    const page = await emptyScene(browser);
    const type3 = ['parca-ekle-sonuc', 'tak-sonuc'].some(wanted) ? await partTypeOf(page, 'shop-yapi', 'structure', '3 holes') : null;
    await tab(page, 'Parts').click().catch(() => {});
    await loadOmni(page);
    const ps0 = await listParts(page);
    const R = (fn, arg) => page.evaluate(fn, arg);
    const clearSelection = async () => {
      await page.keyboard.press('Escape').catch(() => {});
      await R(() => window.__robot.getState().deselectAll());
    };
    const addStructure = async (at = { x: 0, z: 260 }) => {
      const n = (await listParts(page)).length;
      await R(({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: type3, at });
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
      const ps = await listParts(page); return ps[ps.length - 1];
    };
    const captureFull = async (name) => { await waitToastsGone(page); await page.mouse.move(1439, 899); await page.waitForTimeout(2500); await capture(page, outFile(name), FULL); };
    await step('parca-ekle-sonuc', page, async () => {
      const added = await addStructure();
      await R((id) => window.__robot.getState().selectOnlyPart(id), added.id);
      await page.getByText('69 parts').first().waitFor();
      await captureFull('parca-ekle-sonuc');
      await R((id) => { const s = window.__robot.getState(); s.removeParts([id]); s.deselectAll(); }, added.id);
    });
    await step('sim-sonuc', page, async () => {
      await menu(page, 'File').click();
      const [simPage] = await Promise.all([page.context().waitForEvent('page', { timeout: 90000 }), page.getByRole('menuitem', { name: 'Try in Sim' }).click()]);
      simPage.setDefaultTimeout(90000);
      await simPage.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
      await simPage.waitForLoadState('load'); log('sim url', simPage.url());
      await simPage.locator('canvas').first().waitFor(); await simPage.waitForTimeout(6000);
      // The Sim tab opens without the language parameter; reopen it in English (the robot comes from the open Builder tab)
      if (!/[?&]dil=en\b/.test(simPage.url())) {
        const u = new globalThis.URL(simPage.url()); u.searchParams.set('dil', 'en');
        await simPage.goto(u.toString(), { waitUntil: 'load' }); log('sim url (en)', simPage.url());
        await simPage.locator('canvas').first().waitFor(); await simPage.waitForTimeout(6000);
      }
      await simPage.getByRole('button', { name: /Got it, continue/ }).click({ timeout: 20000 }).catch(e => log('no devnote', e.message.split('\n')[0]));
      await simPage.getByRole('button', { name: /^(Only necessary|Sadece zorunlu)$/ }).click({ timeout: 5000 }).catch(() => {});
      await simPage.addStyleTag({ content: '.probot-consent,probot-devnote{display:none!important}' }).catch(() => {});
      await simPage.waitForTimeout(4000);
      log('sim text', (await simPage.evaluate(() => document.body.innerText.slice(0, 600))).replace(/\n/g, ' | '));
      await simPage.mouse.move(1439, 899); await simPage.waitForTimeout(500);
      await capture(simPage, outFile('sim-sonuc'), FULL);
      await simPage.close().catch(() => {});
    });
    await step('sec-parcalar-sekmesi', page, async () => {
      await tab(page, 'Parts').click(); await page.waitForTimeout(500);
      const kit = page.locator('[data-kit-row]').first();
      log('kit row', (await kit.innerText()).replace(/\n/g, ' | '));
      await kit.locator('[aria-label="Show its parts"], [title="Show its parts"]').first().click({ timeout: 10000 }).catch(e => log('no arrow button', e.message.split('\n')[0]));
      const search = page.locator('input[placeholder="Search in parts..."]');
      await search.fill('wheel'); await page.waitForTimeout(1500);
      const rows = page.locator('[data-part-id]');
      log('wheel rows', JSON.stringify((await rows.allInnerTexts()).slice(0, 6).map(t => t.replace(/\n/g, ' '))));
      const row = rows.first(); await row.click(); await page.waitForTimeout(3000);
      await blur(page);
      await mark(page, [{ n: 3, loc: search }, { n: 4, loc: row }]);
      const pc = await page.locator('[data-part-id]').last().boundingBox();
      await capture(page, outFile('sec-parcalar-sekmesi'), { x: 0, y: 108, width: 312, height: Math.min(792, pc.y + pc.height + 40 - 108) });
      await clearMarks(page);
      await search.fill(''); await clearSelection();
    });
    await step('tasi-coklu', page, async () => {
      await tab(page, 'Parts').click(); await page.waitForTimeout(500);
      await page.locator('[data-kit-row]').first().click();
      await page.getByText('68 selected').first().waitFor({ timeout: 60000 });
      await page.locator('button[title="Move (T / M)"]').click(); await page.waitForTimeout(2000);
      const center = await R(() => { const ps = window.__robot.getState().parts; const s = window.__robot.getState().selectedPartIds; const q = ps.filter(p => s.includes(p.id));
        return [0, 1, 2].map(i => q.reduce((t, p) => t + p.position.toArray()[i], 0) / q.length); });
      const k = await toScreen(page, center);
      await waitToastsGone(page); await page.mouse.move(1439, 899); await page.waitForTimeout(2000);
      await mark(page, [{ n: 4, box: { x: k.x - 45, y: k.y - 45, width: 90, height: 90 } }]);
      await capture(page, outFile('tasi-coklu'), FULL);
      await clearMarks(page);
      await clearSelection();
    });
    await step('tak-yuz', page, async () => {
      const t5 = 'shop-prb-str-c1-0105'; // Structure 5 holes
      const n0 = (await listParts(page)).length;
      await R(({ t }) => window.__robot.getState().addPartOfType(t, { x: 0, z: 330 }), { t: t5 });
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n0, { timeout: 90000 });
      const added = await R(() => { const ps = window.__robot.getState().parts; const p = ps[ps.length - 1]; return { id: p.id, pos: p.position.toArray(), type: p.type }; });
      await R(() => window.__robot.getState().deselectAll());
      // target: the frontmost and topmost chassis profile, midway between two neighboring top holes
      let target = null;
      for (const p of ps0.filter(q => /str-c1-011/.test(q.type))) {
        const hs = (await partHoles(page, p.id)).filter(h => h.a[1] > 0.9 || h.a[1] < -0.9).sort((a, b) => b.p[1] - a.p[1]);
        if (!hs.length) continue;
        const top = hs.filter(h => Math.abs(h.p[1] - hs[0].p[1]) < 1).sort((a, b) => a.p[0] - b.p[0]);
        const zMean = top.reduce((t, h) => t + h.p[2], 0) / top.length;
        if (!target || top[0].p[1] > target.y + 1 || (Math.abs(top[0].p[1] - target.y) < 1 && zMean > target.z)) target = { id: p.id, y: top[0].p[1], z: zMean, top };
      }
      const u = target.top; const i = Math.floor(u.length / 2);
      const hp = [(u[i].p[0] + u[i + 1].p[0]) / 2, u[i].p[1], (u[i].p[2] + u[i + 1].p[2]) / 2];
      await blur(page); await page.keyboard.press('b'); await page.locator('[data-testid="tak-paneli"]').waitFor();
      const kp = [added.pos[0] + 15, added.pos[1] * 2, added.pos[2]];
      const k1 = await toScreen(page, kp), k2 = await toScreen(page, hp);
      await page.keyboard.down('Shift'); await page.mouse.click(k1.x, k1.y); await page.keyboard.up('Shift'); await page.waitForTimeout(800);
      await page.keyboard.down('Shift'); await page.mouse.click(k2.x, k2.y); await page.keyboard.up('Shift'); await page.waitForTimeout(1500);
      const finalPos = await R((id) => window.__robot.getState().parts.find(q => q.id === id).position.toArray(), added.id);
      log('final position', JSON.stringify(finalPos), 'panel', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '));
      await waitToastsGone(page, 8000); await page.mouse.move(1439, 899); await page.waitForTimeout(1500);
      const structHoles = await partHoles(page, added.id); const structMid = [0, 1, 2].map(j => structHoles.reduce((t, h) => t + h.p[j], 0) / structHoles.length);
      const ks = await toScreen(page, structHoles.length ? structMid : finalPos);
      const kh = await toScreen(page, [hp[0] + (hp[0] > 0 ? -150 : 150), hp[1], hp[2]]);
      await mark(page, [{ n: 2, box: { x: ks.x - 40, y: ks.y - 22, width: 80, height: 44 } }, { n: 3, box: { x: kh.x - 30, y: kh.y - 20, width: 60, height: 40 } }]);
      const pb = await page.locator('[data-testid="tak-paneli"]').boundingBox();
      const clampLeft = (r) => { const x = Math.max(310, r.x); return { ...r, x, width: r.width - (x - r.x) }; }; // keep the left panel out of the frame
      await capture(page, outFile('tak-yuz'), clampLeft(crop(union(pb, { x: Math.min(ks.x, kh.x) - 220, y: Math.min(ks.y, kh.y) - 160, width: Math.abs(ks.x - kh.x) + 440, height: Math.abs(ks.y - kh.y) + 320 }), 10)));
      await clearMarks(page);
    });
    await step('sec-sonuc', page, async () => {
      const wheels = ps0.filter(p => /whl|teker/.test(p.type)).slice(0, 2).map(p => p.id);
      await R((ids) => window.__robot.getState().selectParts(ids), wheels);
      await page.getByText('2 selected').first().waitFor();
      await captureFull('sec-sonuc');
      await clearSelection();
    });
    await step('tasi-sonuc', page, async () => {
      const str = ps0.filter(p => /str-c1/.test(p.type)).sort((a, b) => b.pos[2] - a.pos[2])[0];
      await R((id) => window.__robot.getState().selectOnlyPart(id), str.id);
      await page.locator('button[title="Move (T / M)"]').click();
      await captureFull('tasi-sonuc');
      await clearSelection();
    });
    await step('tak-sonuc', page, async () => {
      const added = await addStructure();
      await page.locator('button[title^="Mate"]').first().click(); await page.waitForTimeout(500);
      const targets = ps0.filter(p => p.type.includes('str')).map(p => p.id);
      log('attach', JSON.stringify(await attachToHighest(page, added.id, targets)));
      await page.locator('[data-testid="tak-paneli"]').waitFor();
      await captureFull('tak-sonuc');
    });
    // --- Measure: top view, two holes ---
    if (wanted('olc-sonuc')) {
      await page.keyboard.press('Escape').catch(() => {});
      await page.mouse.click(1100, 150); await page.waitForTimeout(2500);   // TOP face of the cube
      await page.locator('button[title^="Measure"]').first().click();
      await page.getByText('Click the first point to measure').first().waitFor();
      // two topmost upward-facing holes: on the same part, about 64 mm apart
      let holePair = null;
      for (const p of ps0.filter(q => /str-c1-011/.test(q.type))) {
        const hs = (await partHoles(page, p.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
        if (!hs.length) continue;
        const top = hs.filter(h => Math.abs(h.p[1] - hs[0].p[1]) < 1);
        if (!holePair || top[0].p[1] > holePair[0].p[1]) {
          const a = top[0]; const b = top.find(h => Math.hypot(h.p[0] - a.p[0], h.p[2] - a.p[2]) > 60 && Math.hypot(h.p[0] - a.p[0], h.p[2] - a.p[2]) < 140);
          if (b) holePair = [a, b];
        }
      }
      const n1 = await toScreen(page, holePair[0].p), n2 = await toScreen(page, holePair[1].p);
      await page.mouse.move(n1.x, n1.y); await page.waitForTimeout(800); await page.mouse.click(n1.x, n1.y);
      await page.getByText('Click the second point').first().waitFor();
      await page.mouse.move(n2.x, n2.y); await page.waitForTimeout(800); await page.mouse.click(n2.x, n2.y);
      await page.getByText('ΔX').first().waitFor();
      await page.waitForTimeout(1500);
      const panel = measureTitle(page).locator('xpath=ancestor::div[2]');
      log('measure panel', (await panel.innerText()).replace(/\n/g, ' | '));
      await step('olc-sonuc', page, async () => {
        const pb = await panel.boundingBox();
        await mark(page, [{ n: 3, box: { x: n2.x - 14, y: n2.y - 14, width: 28, height: 28 } }]);
        await capture(page, outFile('olc-sonuc'), crop(union(pb, { x: Math.min(n1.x, n2.x) - 120, y: Math.min(n1.y, n2.y) - 90, width: Math.abs(n1.x - n2.x) + 240, height: Math.abs(n1.y - n2.y) + 180 }), 10));
        await clearMarks(page);
      });
    }
    await page.close().catch(() => {});
  }
  // ======================= Add parts, Brand view: Boardoza (capture-dev.mjs, now in production) =======================
  if (wanted('parca-ekle-boardoza')) {
    const { page, ctx } = await prepare(browser);
    ctx.setDefaultTimeout(20000);
    await page.waitForTimeout(1500);
    await step('parca-ekle-boardoza', page, async () => {
      await page.getByText('Add parts', { exact: true }).first().click();
      await page.getByText('Brand', { exact: true }).first().click(); await page.waitForTimeout(800);
      const bz = page.getByText('Boardoza', { exact: true }).first();
      await bz.click(); await page.waitForTimeout(2500);
      const head = page.getByText('Boardoza', { exact: true }).first().locator('..');
      log('boardoza', (await head.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: head, pad: 2 }]);
      await capture(page, outFile('parca-ekle-boardoza'), { x: 0, y: 108, width: 312, height: 500 });
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
} finally { await browser.close(); }
