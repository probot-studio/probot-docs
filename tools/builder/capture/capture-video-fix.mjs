// Builder decks: images requested by the video review (deck-only images, new file names).
// Usage: PW_WS=ws://... node capture-video-fix.mjs <img-dir> <name,...> [debug-dir]
// Names: sec-geri-al-menusu, sec-kutu-ciz, tasi-dondur-90, sketch-extrude-panel
// Each image is taken in its own browser context (DSF 1, default timeout 8 s). Afterwards: python3 shrink.py <png ...>
// (builder-tasi-dondur-90.png: 256 colors with FASTOCTREE instead, the median cut of shrink.py turns the green ring grey).
import { connect, URL, toScreen, listParts } from './lib.mjs';
const IMG = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || IMG;
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const VP = { x1: 310, y1: 108, x2: 1170, y2: 900 };
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
const outFile = (name) => `${IMG}/builder-${name}.png`;
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
const HIDE = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
  probot-devnote,.probot-consent,[class*="whatsapp"],a[href*="wa.me"],[data-sonner-toaster],[data-sonner-toast]{display:none!important}`;

// Fresh context on the production Builder with the test hooks; notices hidden with CSS.
async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce' });
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  await page.addInitScript((css) => {
    window.__PROBOT_TEST__ = true; try { localStorage.clear(); } catch {}
    document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
  }, HIDE);
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !!window.__robot && !!window.__controls?.current, null, { timeout: 45000 });
  await page.addStyleTag({ content: HIDE });
  for (const label of ['Anladım, devam et', 'Sadece zorunlu']) {
    const b = page.getByRole('button', { name: label }).first();
    if (await b.isVisible().catch(() => false)) await b.click({ timeout: 1500 }).catch(() => {});
  }
  await page.waitForTimeout(1200);
  return { ctx, page };
}
async function loadOmni(page) {
  await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
  await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 60000 });
  await page.waitForTimeout(2500);
}
// force: the heavy 3D scene renders few frames per second, so the stability check of a normal click times out
const fitView = async (page) => { await menu(page, 'Görünüm').click({ force: true }); await page.waitForTimeout(500); await page.getByText('Sığdır', { exact: true }).first().click({ force: true }); await page.waitForTimeout(2000); };
const openAddPartTab = async (page) => { await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click().catch(() => page.getByText('Parça Ekle', { exact: true }).first().click()); await page.waitForTimeout(200); };
async function toTopLevel(page) {
  for (let i = 0; i < 5; i++) {
    if (await page.locator('[data-section]').count()) break;
    const g = page.locator('[data-family-back], [data-section-back]').first();
    if (await g.count()) await g.click().catch(() => {});
    await page.waitForTimeout(400);
  }
}
async function openFolder(page, section, family) {
  await openAddPartTab(page); await toTopLevel(page);
  await page.locator('[data-section]', { hasText: section }).first().click(); await page.waitForTimeout(400);
  if (family) { await page.locator('[data-family]', { hasText: family }).first().click(); await page.waitForTimeout(400); }
}
const optionRow = (page, option) => page.locator('[data-family-folder] [data-part-type]').filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first();
async function addRow(page, row) {
  const n = (await listParts(page)).length;
  await row.click({ force: true });
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
  await page.waitForTimeout(1200);
  const ps = await listParts(page); return ps[ps.length - 1];
}
// Bounding box of pixels matching a color test in a screenshot (see capture-b.mjs)
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
    return { x: clip.x + x1, y: clip.y + y1, width: x2 - x1, height: y2 - y1, n, bottom: { x: clip.x + bottomX, y: clip.y + bottomY } };
  }, { b64: buf.toString('base64'), clip, test });
}
// Markers like lib.mjs mark(); at = 'tl' (badge on the top-left corner, default) or 'tr' (top-right corner).
async function mark(page, targets) {
  const boxes = [];
  for (const t of targets) {
    let r = t.box;
    if (!r) { const bb = await t.loc.first().boundingBox(); if (!bb) throw new Error('no bounding box: ' + t.n); r = bb; }
    boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height, n: t.n, pad: t.pad ?? 4, at: t.at ?? 'tl' });
  }
  await page.evaluate((bs) => {
    document.querySelectorAll('.docs-marker').forEach(e => e.remove());
    for (const k of bs) {
      const d = document.createElement('div'); d.className = 'docs-marker';
      const W = k.width + 2 * k.pad;
      Object.assign(d.style, { position: 'fixed', left: (k.x - k.pad) + 'px', top: (k.y - k.pad) + 'px', width: W + 'px', height: (k.height + 2 * k.pad) + 'px',
        border: '3px solid #E6007E', borderRadius: '6px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' });
      const r = document.createElement('div'); r.textContent = k.n;
      const left = k.at === 'tr' ? Math.min(W - 9, 1440 - 24 - (k.x - k.pad)) : Math.max(-13, 2 - (k.x - k.pad));
      Object.assign(r.style, { position: 'absolute', left: left + 'px', top: Math.max(-13, 2 - (k.y - k.pad)) + 'px', width: '22px', height: '22px', borderRadius: '50%', background: '#E6007E',
        color: '#fff', font: '700 13px/22px system-ui,sans-serif', textAlign: 'center' });
      d.appendChild(r);
      document.body.appendChild(d);
    }
  }, boxes);
  return boxes.map(k => ({ x: k.at === 'tr' ? k.x + k.width + k.pad - 13 : k.x - k.pad - 13, y: k.y - k.pad - 13, width: 22, height: 22 }));
}
async function noBanner(page) {
  const b = page.getByRole('button', { name: 'Sadece zorunlu' }).first();
  if (await b.isVisible().catch(() => false)) {
    log('consent banner', await b.evaluate(e => { let p = e; for (let i = 0; i < 4 && p.parentElement; i++) p = p.parentElement; return p.tagName + ' ' + p.className + ' id=' + p.id; }).catch(() => '?'));
    await b.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(300);
  }
}
const shot = async (page, file, clip) => { await noBanner(page); await page.screenshot({ path: file, clip, animations: 'disabled' }); log('saved', file.split('/').pop(), JSON.stringify(clip)); };
// Toolbar undo and redo buttons: the two icon buttons right of the step select
async function undoRedo(page) {
  const all = await page.evaluate(() => [...document.querySelectorAll('button')].map((b, i) => { const r = b.getBoundingClientRect(); return { i, x: r.x, y: r.y, w: r.width, h: r.height, title: b.title || '', aria: b.getAttribute('aria-label') || '', text: (b.innerText || '').trim().slice(0, 20), dis: b.disabled }; })
    .filter(b => b.y > 60 && b.y < 110 && b.h > 0));
  const sel = await page.locator('[data-testid="donus-adimi"], [data-testid="tasi-adimi"]').first().boundingBox({ timeout: 1000 }).catch(() => null)
    ?? await page.locator('button[title^="Snap"]').boundingBox();
  const right = all.filter(b => b.x > sel.x + sel.width && !b.text).sort((a, b) => a.x - b.x).slice(0, 2);
  log('toolbar buttons', JSON.stringify(all.map(b => [Math.round(b.x), b.title || b.aria || b.text, b.dis])));
  return right.map(b => ({ x: b.x, y: b.y, width: b.w, height: b.h, title: b.title || b.aria, disabled: b.dis }));
}

const steps = {
  // Düzen menu with Geri al / Yinele enabled, toolbar undo/redo dark
  // Empty scene instead of the Omni chassis: the crop shows only the menus and the toolbar, and the heavy
  // chassis scene makes every click time out on the shared browser.
  'sec-geri-al-menusu': async (page) => {
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await openFolder(page, 'Yapı', 'Structure');
    const row = page.locator('[data-family-folder] [data-part-type]').nth(2);
    await addRow(page, row); await addRow(page, row);
    const n = (await listParts(page)).length;
    await blur(page);
    await page.mouse.move(1439, 899);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(900);
    log('parts', n, '->', (await listParts(page)).length);
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await blur(page); await page.waitForTimeout(500);
    const undoBtn = page.locator('button[title^="Geri al"]').first(), redoBtn = page.locator('button[title^="İleri al"]').first();
    log('undo/redo disabled', await undoBtn.isDisabled(), await redoBtn.isDisabled());
    if (await undoBtn.isDisabled() || await redoBtn.isDisabled()) throw new Error('undo/redo not both enabled');
    const ur = [await undoBtn.boundingBox(), await redoBtn.boundingBox()];
    await menu(page, 'Düzen').click({ force: true }); await page.waitForTimeout(600);
    const undoItem = page.getByRole('menuitem', { name: /^Geri al/ }).first();
    const redoItem = page.getByRole('menuitem', { name: /^Yinele/ }).first();
    log('menu', (await page.getByRole('menu').first().innerText()).replace(/\n/g, ' | '));
    const mb = await page.getByRole('menu').first().boundingBox();
    await page.mouse.move(1439, 899); await page.waitForTimeout(300);
    const both = union(ur[0], ur[1]);
    await mark(page, [{ n: 1, loc: undoItem, pad: 2 }, { n: 2, loc: redoItem, pad: 2 }, { n: 3, box: both, pad: 4 }]);
    const x2 = both.x + both.width + 30;
    await shot(page, outFile('sec-geri-al-menusu'), crop({ x: 0, y: 40, width: x2, height: mb.y + mb.height + 12 - 40 }));
  },
  // Selection box while the left button is still held
  // The chassis is already fitted to the view after loading; Taşı is the default tool.
  // The chassis scene renders slowly on the shared browser: longer timeouts inside this step only.
  'sec-kutu-ciz': async (page) => {
    page.setDefaultTimeout(40000);
    await loadOmni(page);
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await blur(page); await page.waitForTimeout(1500);
    log('tool', await page.locator('button[title="Taşı (T / M)"]').evaluate(e => e.className.includes('bg-brand') ? 'Taşı active' : e.className.slice(0, 80)));
    // all part centers on screen in one call (each round trip is slow in this scene)
    const pts = await page.evaluate(() => {
      const cam = window.__controls.current.object; cam.updateMatrixWorld();
      const c = document.querySelector('canvas').getBoundingClientRect();
      return window.__robot.getState().parts.map(p => { const v = p.position.clone().project(cam); return { x: c.left + (v.x + 1) / 2 * c.width, y: c.top + (1 - v.y) / 2 * c.height, type: p.type }; });
    });
    log('points', pts.length);
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const bb = { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    log('robot screen bbox', JSON.stringify(bb));
    const wheels = pts.filter(p => /whl|teker|omni/i.test(p.type));
    log('wheel types', JSON.stringify([...new Set(wheels.map(w => w.type))]));
    const w = (wheels.length ? wheels : pts).reduce((a, b) => (b.x - b.y < a.x - a.y ? b : a));
    log('lower-left wheel', JSON.stringify(w));
    const start = { x: Math.max(VP.x1 + 60, Math.min(bb.x1, w.x) - 40), y: Math.min(VP.y2 - 60, Math.max(bb.y2, w.y) + 50) };
    const end = { x: w.x + 110, y: w.y - 90 };
    log('drag', JSON.stringify(start), '->', JSON.stringify(end));
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(start.x + (end.x - start.x) * i / 10, start.y + (end.y - start.y) * i / 10);
    log('dragged');
    await page.waitForTimeout(400);
    const rectEls = await page.evaluate(({ w, h }) => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return Math.abs(r.width - w) < 8 && Math.abs(r.height - h) < 8; }).map(e => e.tagName + '.' + e.className).slice(0, 5), { w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) });
    log('rect elements', JSON.stringify(rectEls));
    // about 700x500 around the drag rectangle, kept inside the 3D view
    const cx = (start.x + end.x) / 2, cy = (start.y + end.y) / 2;
    const cw = Math.max(700, Math.abs(end.x - start.x) + 240), ch = Math.max(500, Math.abs(end.y - start.y) + 240);
    const x1 = Math.min(Math.max(VP.x1, cx - cw / 2), VP.x2 - cw), y1 = Math.min(Math.max(VP.y1, cy - ch / 2), VP.y2 - ch);
    const clip = { x: Math.round(x1), y: Math.round(y1), width: Math.round(cw), height: Math.round(ch) };
    await page.screenshot({ path: outFile('sec-kutu-ciz'), clip, animations: 'disabled', timeout: 60000 });
    log('saved sec-kutu-ciz', JSON.stringify(clip));
    await page.mouse.up(); await page.waitForTimeout(500);
    log('selected after release', (await page.evaluate(() => window.__robot.getState().selectedPartIds)).length);
  },
  // Rotate tool, step 90°, camera closer to the part
  'tasi-dondur-90': async (page) => {
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await openFolder(page, 'Yapı', 'Structure');
    const str = await addRow(page, optionRow(page, '5 delik'));
    log('added', JSON.stringify(str));
    await blur(page);
    await page.locator('button[title="Taşı (T / M)"]').click(); await page.waitForTimeout(300);
    await fitView(page); await blur(page);
    await page.keyboard.press('r'); await page.waitForTimeout(800);
    const stepSelect = page.locator('[data-testid="donus-adimi"]');
    if ((await stepSelect.evaluate(e => e.tagName)) === 'SELECT') await stepSelect.selectOption({ label: '90°' });
    else { await stepSelect.click(); await page.waitForTimeout(300); await page.getByText('90°', { exact: true }).first().click(); }
    await page.waitForTimeout(500); await blur(page);
    let c = await toScreen(page, str.pos);
    const green0 = await colorBox(page, crop({ x: c.x - 300, y: c.y - 300, width: 600, height: 600 }), 'g>170&&r<90&&b<90');
    log('green before zoom', JSON.stringify(green0));
    // Wheel toward the part. The rotate gizmo keeps its screen size, so the rings do not grow with the zoom.
    await page.mouse.move(c.x, c.y); for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -240); await page.waitForTimeout(500); }
    await page.mouse.move(1150, 130, { steps: 5 }); await page.waitForTimeout(400);
    await page.mouse.move(1439, 899); await page.waitForTimeout(1200);
    c = await toScreen(page, str.pos);
    const sb = crop({ x: c.x - 330, y: c.y - 330, width: 660, height: 660 });
    const green = await colorBox(page, sb, 'g>170&&r<90&&b<90');
    log('center', JSON.stringify(c), 'green after zoom', JSON.stringify(green));
    let R = 120;
    if (green) R = Math.max(Math.abs(green.x - c.x), Math.abs(green.x + green.width - c.x), Math.abs(green.y - c.y), Math.abs(green.y + green.height - c.y));
    const rot = page.locator('button[title^="Döndür"]').first();
    const ur = await undoRedo(page);
    const targets = [{ n: 1, loc: rot }, { n: 2, loc: stepSelect }];
    if (green) targets.push({ n: 3, box: pointBox(green.bottom, 30) });
    const badges = await mark(page, targets);
    // left edge: before the Döndür badge, at a point that slices no toolbar/menu button
    const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(b => b.y < 112 && b.h > 0));
    // the Döndür badge reaches into the menu bar row, above it is Düzen: keep the menu bar text whole (y 44, x 0)
    let y0 = Math.min(56, ...badges.slice(0, 2).map(b => b.y - 3));
    let x0 = Math.min(185, badges[0].x - 3);
    if (btns.some(b => b.y + b.h > y0 && b.y < y0 + 4)) y0 = 44;
    while (x0 > 0 && btns.some(b => b.y + b.h > y0 && b.x < x0 && b.x + b.w > x0)) x0--;
    const ringBottom = c.y + R + 30;
    const x2 = Math.max((ur[1] ? ur[1].x + ur[1].width : 800) + 20, c.x + R + 30);
    log('R', R, 'x0', x0, 'y0', y0, 'x2', x2);
    await shot(page, outFile('tasi-dondur-90'), crop({ x: x0, y: y0, width: Math.min(1170, x2) - x0, height: Math.min(900, ringBottom) - y0 }));
  },
  // Extrude panel, badges on the top-right corner of each row so the labels stay readable
  'sketch-extrude-panel': async (page) => {
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await openAddPartTab(page);
    await page.locator('[data-section="temel"]').click();
    await page.locator('[data-part-type="ozel-kutu"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(800);
    const box = (await listParts(page))[0];
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await fitView(page); await blur(page);
    await page.locator('button[title^="Sketch"]').first().click();
    await page.locator('[data-testid="sketch-paneli"]').waitFor();
    const top = await toScreen(page, [box.pos[0], box.pos[1] + 10, box.pos[2]]);
    await page.mouse.click(top.x, top.y); await page.waitForTimeout(2000);
    await page.locator('[data-testid="sketch-arac-dikdortgen"]').click(); await page.waitForTimeout(300);
    const y = box.pos[1] + 10;
    const k1 = await toScreen(page, [box.pos[0] - 15, y, box.pos[2] - 10]);
    const k2 = await toScreen(page, [box.pos[0] + 15, y, box.pos[2] + 10]);
    await page.mouse.move(k1.x, k1.y); await page.mouse.click(k1.x, k1.y); await page.waitForTimeout(400);
    await page.mouse.move(k2.x, k2.y); await page.mouse.click(k2.x, k2.y); await page.waitForTimeout(700);
    await page.locator('[data-testid="sketch-arac-sec"]').click(); await page.waitForTimeout(300);
    const edge = await toScreen(page, [box.pos[0], y, box.pos[2] - 10]);
    await page.mouse.click(edge.x, edge.y); await page.waitForTimeout(700);
    const valueInput = page.locator('[data-testid="sketch-olcu-deger"]');
    if (await valueInput.count()) { await valueInput.fill('40'); await valueInput.press('Enter'); await page.waitForTimeout(700); }
    await page.locator('[data-testid="sketch-bitir"]').click(); await page.waitForTimeout(1200);
    await page.locator('[data-testid="sketch-ekstrud"]').click();
    await page.locator('[data-testid="ekstrud-paneli"]').waitFor();
    const thickness = page.locator('[data-testid="ekstrud-panel-kalinlik"]');
    await thickness.fill('10'); await page.waitForTimeout(1500);
    await blur(page);
    log('panel', (await page.locator('[data-testid="ekstrud-paneli"]').innerText()).replace(/\n/g, ' | ').slice(0, 200));
    const rowOf = (loc, label) => loc.locator(`xpath=ancestor::*[.//text()[normalize-space()=${JSON.stringify(label)}]][1]`);
    const rows = [rowOf(thickness, 'Kalınlık (mm)'), rowOf(page.locator('[data-testid="ekstrud-panel-delik"]'), 'Tür'), rowOf(page.locator('[data-testid="ekstrud-panel-yon-normal"]'), 'Yön')];
    for (const r of rows) log('row', JSON.stringify(await r.boundingBox()), (await r.innerText()).replace(/\n/g, ' | ').slice(0, 60));
    await page.mouse.move(1439, 899);
    await mark(page, rows.map((loc, i) => ({ n: i + 1, loc, pad: 5, at: 'tr' })));
    const tab = await page.locator('.dv-tab', { hasText: 'Extrude' }).first().boundingBox().catch(() => null);
    const y0 = tab ? Math.round(tab.y + tab.height + 1) : 136;
    log('tab', JSON.stringify(tab));
    await shot(page, outFile('sketch-extrude-panel'), crop({ x: 0, y: y0, width: 870, height: 640 - y0 }));
  },
};

const browser = await connect();
try {
  for (const name of REQUESTED) {
    if (!steps[name]) { log('unknown', name); continue; }
    const t = Date.now();
    let ctx, page;
    try {
      ({ ctx, page } = await open(browser));
      await steps[name](page);
      log('OK', name, (Date.now() - t) + 'ms');
    } catch (e) {
      log('ERROR', name, e.message.slice(0, 700).replace(/\n/g, ' / '));
      try { await page.screenshot({ path: `${DBG}/error-${name}.png`, timeout: 20000 }); } catch (e2) { log('debug shot failed', e2.message.split('\n')[0]); }
    } finally { await ctx?.close().catch(() => {}); }
  }
} finally { await browser.close(); }
