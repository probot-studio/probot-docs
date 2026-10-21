// Builder decks, third video review round: deck-only images (new file names, saved into the deck img/ folders).
// Usage: PW_WS=ws://... node capture-video-fix-3.mjs <presentation-dir> <name,...> [debug-dir]
// Names: sec-gizli-tumunu-goster (04), tak-motor-mili-bildirim (05), eklem-panel-oynat, eklem-poz-hiz,
//        eklem-tak-bildirim (07), panel-ayirici-iki-yan (09)
// Each image is taken in its own browser context (DSF 1, default timeout 8 s). Afterwards: python3 shrink.py <png ...>
// (sec-gizli-tumunu-goster, tak-motor-mili-bildirim, eklem-tak-bildirim: 256 colors with a FASTOCTREE palette and
// Floyd-Steinberg dither instead, the median cut of shrink.py turns the green toast and hubs grey)
import { connect, URL, toScreen, listParts, partHoles } from './lib.mjs';
const DIR = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || '.';
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const VP = { x1: 310, y1: 108, x2: 1170, y2: 900 };
const DECK = {
  'sec-gizli-tumunu-goster': '04-parca-ekle-ve-sec', 'tak-motor-mili-bildirim': '05-tasi-dondur-tak',
  'eklem-panel-oynat': '07-robotu-hareket-ettir', 'eklem-poz-hiz': '07-robotu-hareket-ettir', 'eklem-tak-bildirim': '07-robotu-hareket-ettir',
  'panel-ayirici-iki-yan': '09-kaydet-ve-paylas',
};
const TOASTS = new Set(['tak-motor-mili-bildirim', 'eklem-tak-bildirim']); // these images show the toast
const outFile = (name) => `${DIR}/${DECK[name]}/img/builder-${name}.png`;
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
const R0 = (page, fn, arg) => page.evaluate(fn, arg);
const crop = (r, pad = 0) => {
  const x = Math.max(0, Math.round(r.x - pad)), y = Math.max(0, Math.round(r.y - pad));
  return { x, y, width: Math.min(Math.round(r.width + 2 * pad), 1440 - x), height: Math.min(Math.round(r.height + 2 * pad), 900 - y) };
};
const union = (...rs) => {
  const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
  const x2 = Math.max(...rs.map(r => r.x + r.width)), y2 = Math.max(...rs.map(r => r.y + r.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
const box2 = (x1, y1, x2, y2) => ({ x: Math.round(x1), y: Math.round(y1), width: Math.round(x2 - x1), height: Math.round(y2 - y1) });
const BASE_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
  probot-devnote,.probot-consent,.probot-consent-banner,[aria-label="Çerez rızası"],[class*="whatsapp"],a[href*="wa.me"]{display:none!important}`;
const TOAST_CSS = `[data-sonner-toaster],[data-sonner-toast]{display:none!important}`;
const contextMenu = (page) => page.locator('div.fixed.z-50.shadow-toolbar').first();

// Fresh context on the production Builder with the test hooks; notices hidden with CSS.
async function open(browser, { toasts = false } = {}) {
  const css = BASE_CSS + (toasts ? '' : TOAST_CSS);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce' });
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  await page.addInitScript((css) => {
    window.__PROBOT_TEST__ = true; try { localStorage.clear(); } catch {}
    document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
  }, css);
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !!window.__robot && !!window.__controls?.current, null, { timeout: 45000 });
  await page.addStyleTag({ content: css });
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
// Pan the camera to the screen right/left (mm): + = the scene moves right
async function panCamera(page, mm) {
  await page.evaluate((mm) => { const c = window.__controls.current, cam = c.object; cam.updateMatrixWorld();
    const r = new cam.position.constructor().setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(-mm);
    cam.position.add(r); c.target.add(r); c.update(); }, mm);
  await page.waitForTimeout(1200);
}
// Pan so that a world point lands on screen x (two passes, the pan is linear in screen space)
async function panTo(page, p, x) {
  for (let i = 0; i < 2; i++) {
    const a = await toScreen(page, p);
    await panCamera(page, 50); const b = await toScreen(page, p);
    const perMm = (b.x - a.x) / 50; if (Math.abs(perMm) < 1e-3) return;
    await panCamera(page, (x - b.x) / perMm);
  }
}
// Screen positions of all part centers in one call (each round trip is slow in the chassis scene)
const partPoints = (page) => page.evaluate(() => {
  const cam = window.__controls.current.object; cam.updateMatrixWorld();
  const c = document.querySelector('canvas').getBoundingClientRect();
  return window.__robot.getState().parts.map(p => { const v = p.position.clone().project(cam);
    return { id: p.id, type: p.type, lengthN: p.lengthN, visible: p.visible !== false, x: c.left + (v.x + 1) / 2 * c.width, y: c.top + (1 - v.y) / 2 * c.height }; });
});
// Screen bounding box of the meshes of the scene (all parts, or one part), from their world bounding boxes
const meshBox = (page, id) => page.evaluate((id) => {
  const cam = window.__controls.current.object; cam.updateMatrixWorld();
  const c = document.querySelector('canvas').getBoundingClientRect();
  const s = window.__robot.getState();
  const parts = s.parts.filter(p => (id ? p.id === id : p.visible !== false));
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
  for (const p of parts) {
    const V = p.position.constructor;
    // rough extent: part position +- 1/2 of its length in holes (16 mm pitch) on every axis, plus 20 mm
    const r = 20 + (p.lengthN ? p.lengthN * 8 : 20);
    for (const dx of [-r, r]) for (const dy of [-r, r]) for (const dz of [-r, r]) {
      const v = new V(p.position.x + dx, p.position.y + dy, p.position.z + dz).project(cam);
      const sx = c.left + (v.x + 1) / 2 * c.width, sy = c.top + (1 - v.y) / 2 * c.height;
      x1 = Math.min(x1, sx); y1 = Math.min(y1, sy); x2 = Math.max(x2, sx); y2 = Math.max(y2, sy);
    }
  }
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}, id);
// Bounding box of pixels that differ from the floor colour in a screenshot region (the robot silhouette)
async function inkBox(page, clip, test) {
  const buf = await page.screenshot({ clip, scale: 'css' });
  return page.evaluate(async ({ b64, clip, test }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const f = new Function('r', 'g', 'b', 'return ' + test);
    let x1 = 1e9, y1 = 1e9, x2 = -1, y2 = -1, n = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (f(d[i], d[i + 1], d[i + 2])) { n++; if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; }
    }
    if (n < 50) return null;
    return { x: clip.x + x1, y: clip.y + y1, width: x2 - x1, height: y2 - y1, n };
  }, { b64: buf.toString('base64'), clip, test });
}
// Markers: badge on the top-left corner (default), the top-right corner (at: 'tr') or left of the box (at: 'l'); n = null draws a box without badge
async function mark(page, targets) {
  const boxes = [];
  for (const t of targets) {
    let r = t.box;
    if (!r) { const bb = await t.loc.first().boundingBox(); if (!bb) throw new Error('no bounding box: ' + t.n); r = bb; }
    boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height, n: t.n ?? null, pad: t.pad ?? 4, at: t.at ?? 'tl' });
  }
  await page.evaluate((bs) => {
    for (const k of bs) {
      const d = document.createElement('div'); d.className = 'docs-marker';
      const W = k.width + 2 * k.pad;
      Object.assign(d.style, { position: 'fixed', left: (k.x - k.pad) + 'px', top: (k.y - k.pad) + 'px', width: W + 'px', height: (k.height + 2 * k.pad) + 'px',
        border: '3px solid #E6007E', borderRadius: '6px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' });
      if (k.n != null) {
        const r = document.createElement('div'); r.textContent = k.n;
        const H = k.height + 2 * k.pad;
        const left = k.at === 'l' ? -26 : k.at === 'tr' ? Math.min(W - 9, 1440 - 24 - (k.x - k.pad)) : Math.max(-13, 2 - (k.x - k.pad));
        const top = k.at === 'l' ? Math.round((H - 22) / 2) : Math.max(-13, 2 - (k.y - k.pad));
        Object.assign(r.style, { position: 'absolute', left: left + 'px', top: top + 'px', width: '22px', height: '22px', borderRadius: '50%', background: '#E6007E',
          color: '#fff', font: '700 13px/22px system-ui,sans-serif', textAlign: 'center' });
        d.appendChild(r);
      }
      document.body.appendChild(d);
    }
  }, boxes);
}
// Right-pointing arrow (same drawing as the guide image builder-panel-ayirici.png); x, y = start point of the shaft
const arrow = (page, x, y) => page.evaluate(({ x, y }) => {
  const d = document.createElement('div'); d.className = 'docs-marker';
  d.innerHTML = `<svg width="90" height="30" viewBox="0 0 90 30"><path d="M4 15 H72" stroke="#E6007E" stroke-width="4" stroke-linecap="round"/><path d="M66 5 L84 15 L66 25 Z" fill="#E6007E"/></svg>`;
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: (y - 15) + 'px', zIndex: 2147483646, pointerEvents: 'none' });
  document.body.appendChild(d);
}, { x, y });
const shot = async (page, name, clip) => { await page.screenshot({ path: outFile(name), clip, animations: 'disabled', timeout: 60000 }); log('saved', name, JSON.stringify(clip)); };
// Keep toasts on screen: their 3-8 s auto-dismiss timers never fire
const keepToasts = (page) => page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
const addPart = async (page, kind, at) => {
  const n = (await listParts(page)).length;
  await R0(page, ({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: kind, at });
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1000);
  const ps = await listParts(page); return ps[ps.length - 1];
};
const shaftTop = (page, id) => R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, id);
// Wheel the camera out at a point until the motor (world box around its position) spans less than maxPx on screen
async function zoomOutTo(page, center, maxPx, at) {
  for (let i = 0; i < 8; i++) {
    const a = await toScreen(page, [center[0] - 30, center[1], center[2]]), b = await toScreen(page, [center[0] + 30, center[1], center[2]]);
    const c1 = await toScreen(page, [center[0], center[1], center[2] - 30]), c2 = await toScreen(page, [center[0], center[1], center[2] + 30]);
    const span = Math.max(Math.hypot(b.x - a.x, b.y - a.y), Math.hypot(c2.x - c1.x, c2.y - c1.y)) * 70 / 60; // motor flange about 70 mm
    log('motor span px', Math.round(span));
    if (span <= maxPx) return span;
    await page.mouse.move(at.x, at.y); await page.mouse.wheel(0, 240); await page.waitForTimeout(600);
  }
}
// Hareket panel crop: panel box widened so the overflowing "Hız ... tur/dk" label is inside
async function motionCrop(page, hp, pad) {
  const pb = await hp.boundingBox();
  const label = await page.evaluate(() => {
    const out = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) { const t = walk.currentNode; if (/tur\/dk/.test(t.textContent)) { const r = document.createRange(); r.selectNodeContents(t); const b = r.getBoundingClientRect(); out.push({ text: t.textContent.trim(), x: b.x, y: b.y, width: b.width, height: b.height }); } }
    return out;
  });
  log('panel', JSON.stringify(pb), 'speed label', JSON.stringify(label));
  const lb = label.filter(l => l.width > 0)[0];
  const x2 = Math.max(pb.x + pb.width + pad, lb ? lb.x + lb.width + 14 : 0, pb.x + pb.width + 80);
  return crop(box2(pb.x - pad, pb.y - pad, x2, pb.y + pb.height + pad));
}
async function openMotion(page) {
  await page.locator('button[title^="Hareket"]').first().click({ force: true });
  const hp = page.locator('[data-testid="hareket-paneli"]'); await hp.waitFor({ timeout: 30000 });
  return hp;
}

const steps = {
  // Omni chassis with the front outer long rail hidden; empty-area context menu with Tümünü göster (1); status strip "1 gizli"
  'sec-gizli-tumunu-goster': async (page) => {
    page.setDefaultTimeout(40000);
    await loadOmni(page);
    log('part count', await page.evaluate(() => (document.body.innerText.match(/\d+\s*parça/) || ['?'])[0]), (await listParts(page)).length);
    await fitView(page);
    await R0(page, () => window.__robot.getState().deselectAll());
    // after Sığdır the chassis fits the scene (measured: x 371-1108, y 192-687), no extra zoom needed
    let rb;
    const pts = await partPoints(page);
    // Structure rails: type shop-prb-str-c1-01NN, NN = hole count
    const holes = (p) => p.lengthN || +((p.type.match(/str-c1-\d\d(\d\d)$/) || [])[1] || 0);
    const rails = pts.filter(p => /str-c1/.test(p.type));
    log('rail types', JSON.stringify([...new Set(rails.map(p => p.type + ':' + holes(p)))]));
    const maxN = Math.max(...rails.map(holes));
    const front = rails.filter(p => holes(p) === maxN).sort((a, b) => b.y - a.y);
    log('long rails', JSON.stringify(front.map(p => [p.type, holes(p), Math.round(p.x), Math.round(p.y)])));
    let hidden = null;
    for (const t of front.slice(0, 2)) {
      for (const d of [[0, 0, 0], [0, 6, 0], [0, -6, 0]]) {
        const s = await toScreen(page, (await listParts(page)).find(q => q.id === t.id).pos.map((v, i) => v + d[i]));
        await page.mouse.click(s.x, s.y, { button: 'right' }); await page.waitForTimeout(700);
        const sel = await R0(page, () => window.__robot.getState().selectedPartIds);
        const txt = await contextMenu(page).innerText().catch(() => '');
        log('right click', t.id, JSON.stringify(s), 'selected', JSON.stringify(sel), 'menu', txt.replace(/\n/g, ' | ').slice(0, 120));
        if (sel.length === 1 && sel[0] === t.id && /Gizle/.test(txt)) {
          await contextMenu(page).locator('button', { hasText: /^\s*Gizle/ }).first().click({ force: true }); await page.waitForTimeout(1200);
          hidden = await R0(page, () => window.__robot.getState().parts.filter(p => p.visible === false).map(p => p.type));
          break;
        }
        await page.keyboard.press('Escape'); await page.waitForTimeout(300);
        await R0(page, () => window.__robot.getState().deselectAll());
      }
      if (hidden) break;
    }
    log('hidden', JSON.stringify(hidden));
    if (!hidden || hidden.length !== 1) throw new Error('rail not hidden');
    await R0(page, () => window.__robot.getState().deselectAll()); await page.waitForTimeout(800);
    rb = await inkBox(page, box2(VP.x1, VP.y1 + 30, VP.x2, VP.y2 - 50), '(r<150&&g<150&&b<150)');
    log('robot ink box (rail hidden)', JSON.stringify(rb));
    // empty floor below the robot (the chassis fills the scene width), the menu stays above the status strip
    const mx = Math.min(VP.x2 - 250, rb.x + rb.width * 0.6), my = Math.min(VP.y2 - 170, rb.y + rb.height + 25);
    await page.mouse.click(mx, my, { button: 'right' });
    await page.getByText('Buraya yapıştır').first().waitFor();
    await page.waitForTimeout(500);
    const m = contextMenu(page);
    log('EMPTY MENU', (await m.innerText()).replace(/\n/g, ' | '));
    const show = page.getByText('Tümünü göster (1)', { exact: true }).first();
    const gizli = page.getByText(/^\d+ gizli$/).first();
    log('strip', await gizli.locator('..').innerText().catch(() => '?'));
    const mb = await m.boundingBox(), gb = await gizli.boundingBox(), sb = await gizli.locator('..').boundingBox();
    await page.mouse.move(mb.x + mb.width - 12, mb.y + 10); await page.waitForTimeout(300);
    await mark(page, [{ n: 3, loc: show, pad: 4 }, { n: 4, box: gb, pad: 5, at: 'tr' }]);
    // the whole scene width: the right status strip and the view cube are not sliced
    const x1 = VP.x1 + 1, x2 = VP.x2;
    const y1 = rb.y - 30 < 240 ? VP.y1 + 14 : rb.y - 30, y2 = Math.min(900, sb.y + sb.height + 10);
    await shot(page, 'sec-gizli-tumunu-goster', box2(x1, y1, x2, y2));
  },
  // Gear seated on the WattOS motor shaft, toast "Motor eklemi eklendi", full Özellikler panel
  'tak-motor-mili-bildirim': async (page) => jointShot(page, 'tak-motor-mili-bildirim', 'shop-prb-gr-5hx-1m-5-020'),
  // Hub seated on the motor shaft, toast, Özellikler with Bağlı WattOS Motor and the joint type select
  'eklem-tak-bildirim': async (page) => jointShot(page, 'eklem-tak-bildirim', null),
  // Hareket panel playing, robot panned out of the area right of the panel
  'eklem-panel-oynat': async (page) => {
    page.setDefaultTimeout(40000);
    await loadOmni(page);
    await panCamera(page, 4000);
    const hp = await openMotion(page);
    await page.locator('[data-testid="hareket-oynat"]').click({ force: true }); await page.waitForTimeout(2500);
    log('panel text', (await hp.innerText()).replace(/\n/g, ' | ').slice(0, 400));
    await page.mouse.move(1439, 899); await page.waitForTimeout(300);
    await shot(page, 'eklem-panel-oynat', await motionCrop(page, hp, 12));
  },
  // Hareket panel, first "Altıgen Mil 5mm 45 mm" row at 90°, robot panned out
  'eklem-poz-hiz': async (page) => {
    page.setDefaultTimeout(40000);
    await loadOmni(page);
    await panCamera(page, 4000);
    const hp = await openMotion(page);
    const sliders = hp.locator('[data-testid="hareket-kaydirici"]'); log('slider count', await sliders.count());
    const slider = sliders.nth(4);
    log('row', (await slider.locator('xpath=ancestor::*[.//text()[contains(., "Altıgen Mil 5mm")]][1]').innerText().catch(() => '?')).replace(/\n/g, ' | '));
    await slider.fill('90'); await page.waitForTimeout(3000);
    log('value', await slider.inputValue());
    await blur(page); await page.mouse.move(1439, 899); await page.waitForTimeout(300);
    await mark(page, [{ n: 1, loc: slider }, { n: 3, loc: page.locator('[data-testid="hareket-kaydet"]') }]);
    await shot(page, 'eklem-poz-hiz', await motionCrop(page, hp, 14));
  },
  // Sash between Sol panel and Sahne dragged 60 px right; both sides visible
  'panel-ayirici-iki-yan': async (page) => {
    page.setDefaultTimeout(40000);
    await loadOmni(page);
    await fitView(page);
    const sashes = () => page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
    const s = (await sashes()).filter(r => r.height > 300 && r.x < 500).sort((a, b) => a.x - b.x)[0];
    log('sash', JSON.stringify(s));
    const sx = s.x + s.width / 2, sy = s.y + s.height / 2;
    await page.mouse.move(sx, sy); await page.mouse.down();
    for (let i = 1; i <= 6; i++) await page.mouse.move(sx + i * 10, sy);
    await page.mouse.up(); await page.waitForTimeout(2500);
    const s2 = (await sashes()).filter(r => r.height > 300 && r.x < 600).sort((a, b) => a.x - b.x)[0];
    log('sash after', JSON.stringify(s2));
    const mid = s2.x + s2.width / 2;
    // robot just out of the cropped scene slice (floor grid stays visible)
    const ROBOT = '(r<170&&g<170&&b<170)||(r>170&&g<150&&b<90)';
    const rb = await inkBox(page, box2(mid + 6, 140, VP.x2, VP.y2 - 50), ROBOT);
    log('robot box', JSON.stringify(rb));
    const a0 = await toScreen(page, [0, 0, 0]); await panCamera(page, 50); const a1 = await toScreen(page, [0, 0, 0]);
    const perMm = (a1.x - a0.x) / 50;
    if (rb && Math.abs(perMm) > 1e-3) await panCamera(page, Math.max(0, mid + 300 - (rb.x + (a1.x - a0.x))) / perMm);
    await page.mouse.move(1439, 899); await page.waitForTimeout(800);
    const top = Math.ceil(Math.max(...(await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.getBoundingClientRect()).filter(r => r.height > 0 && r.y < 100 && r.y > 50).map(r => r.bottom))))) + 2;
    const rows = (await page.locator('[data-section]').evaluateAll(es => es.map(e => e.getBoundingClientRect().bottom))).filter(y => y < 520);
    const bottom = Math.ceil(Math.max(...rows)) + 1;
    log('crop top', top, 'bottom', bottom);
    const c = box2(0, top, mid + 260, bottom);
    const ink = await inkBox(page, box2(mid + 4, 110, mid + 260, 500), '(r<150&&g<150&&b<150)');
    log('dark pixels in the scene slice', JSON.stringify(ink));
    log('left panel', (await page.locator('[data-section]').allInnerTexts().catch(() => [])).join(' | ').replace(/\n/g, ' ').slice(0, 200));
    await mark(page, [{ n: 1, box: box2(mid - 4, c.y + 18, mid + 4, c.y + c.height - 8), pad: 2 }]);
    await arrow(page, mid + 10, c.y + c.height / 2);
    await shot(page, 'panel-ayirici-iki-yan', c);
  },
};

// Move a left crop edge to the left until it slices no button or menu trigger in the cropped rows
async function safeX(page, x, y1, y2) {
  const btns = await page.evaluate(() => [...document.querySelectorAll('button, select, [role="tab"]')].map(b => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(b => b.w > 0 && b.h > 0 && b.w < 300));
  let x0 = Math.round(x);
  for (let hit; x0 > 0 && (hit = btns.find(b => b.y + b.h > y1 && b.y < y2 && b.x < x0 && b.x + b.w > x0));) x0 = Math.floor(hit.x) - 4;
  return Math.max(0, x0);
}
// Shared flow of the two attach images: empty scene, WattOS Motor 480 RPM at x 0, gear/hub at x 60, Tak (B),
// flat face of the gear/hub, then the motor shaft; the toast stays (keepToasts)
async function jointShot(page, name, gearType) {
  await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
  let type = gearType;
  if (!type) {
    await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click().catch(() => {});
    await page.locator('[data-section]', { hasText: 'Göbek' }).first().click(); await page.waitForTimeout(400);
    const fam = (await page.locator('[data-family]').allInnerTexts()).map(t => t.split('\n')[0].trim()).find(t => /Göbek/i.test(t));
    await page.locator('[data-family]', { hasText: fam }).first().click(); await page.waitForTimeout(400);
    type = await page.locator('[data-family-folder] [data-part-type]').first().getAttribute('data-part-type');
    log('hub family', fam, type);
  }
  const motor = await addPart(page, 'part-wattos-mtr-480', { x: 0, z: 0 });
  const gear = await addPart(page, type, { x: 60, z: 0 });
  log('motor', JSON.stringify(motor), 'gear', JSON.stringify(gear));
  await R0(page, () => window.__robot.getState().deselectAll());
  await fitView(page);
  // Özellikler panel left edge (the panel opens when a part is selected; measured after attaching too)
  const shaft = await shaftTop(page, motor.id);
  const target = name === 'tak-motor-mili-bildirim' ? 740 : 960;
  let m = await toScreen(page, shaft);
  await zoomOutTo(page, motor.pos, name === 'tak-motor-mili-bildirim' ? 290 : 260, m);
  await panTo(page, motor.pos, target);
  await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
  const holes = (await partHoles(page, gear.id)).sort((a, b) => Math.hypot(a.p[0] - gear.pos[0], a.p[2] - gear.pos[2]) - Math.hypot(b.p[0] - gear.pos[0], b.p[2] - gear.pos[2]) || b.p[1] - a.p[1]);
  const c = holes[0] ? holes[0].p : gear.pos;
  const top = holes[0] ? Math.max(...holes.filter(h => Math.hypot(h.p[0] - c[0], h.p[2] - c[2]) < 0.5).map(h => h.p[1])) : gear.pos[1] * 2;
  // flat face: 8 mm out from the center (gear) / 3 mm diagonal (hub), not into the center bore
  const face = await toScreen(page, gearType ? [c[0], top, c[2] + 8] : [c[0] + 3, top, c[2] + 3]);
  await page.mouse.click(face.x, face.y); await page.waitForTimeout(800);
  log('source', JSON.stringify(await page.evaluate(() => { const s = window.__tak.getState(); return s.kaynak ? { partId: s.kaynak.partId, hole: s.kaynak.delik } : null; })));
  m = await toScreen(page, await shaftTop(page, motor.id));
  await keepToasts(page);
  await page.mouse.click(m.x, m.y); await page.waitForTimeout(1500);
  const toast = page.getByText('Motor eklemi eklendi', { exact: false }).first();
  const shown = await toast.isVisible().catch(() => false);
  log('toast', shown, JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*(eklemi|Eşleşecek)[^\n]*/g))));
  const after = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); return { pos: p.position.toArray().map(v => +v.toFixed(1)), parent: p.ebeveyn, joint: p.eklem }; }, gear.id);
  log('gear after', JSON.stringify(after));
  if (!shown) throw new Error('no notification');
  await page.mouse.move(1439, 899); await page.waitForTimeout(800);
  const center = await toScreen(page, after.pos);
  const tb = await toast.boundingBox();
  // toast text container: the li of the toast
  // the green toast card: first ancestor of the text with a background colour
  const tbox = (await toast.evaluate((e) => { for (let p = e; p && p !== document.body; p = p.parentElement) { const bg = getComputedStyle(p).backgroundColor; if (bg && bg !== 'transparent' && !/rgba\(.*, 0\)$/.test(bg)) { const r = p.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, tag: p.tagName }; } } return null; }).catch(() => null)) ?? tb;
  // top: the menu bar row (y 44), the site header stays out; the toast badge sits left of the toast
  const y0 = Math.max(44, Math.round(tbox.y - 14));
  const props = page.locator('.dv-tab', { hasText: 'Özellikler' }).first();
  const pt = await props.boundingBox();
  log('toast box', JSON.stringify(tbox), 'Özellikler tab', JSON.stringify(pt));
  const kind = page.locator('[data-testid="eklem-turu"]');
  const jointArea = page.locator('[data-testid="eklem-alani"]');
  log('joint area', await jointArea.innerText().then(t => t.replace(/\n/g, ' | ')).catch(() => '-'), 'kind', await kind.evaluate(e => e.options ? e.options[e.selectedIndex].text : e.innerText).catch(() => '-'));
  if (name === 'tak-motor-mili-bildirim') {
    await mark(page, [{ n: 3, box: { x: center.x - 30, y: center.y - 30, width: 60, height: 60 } }, { n: 4, box: tbox, pad: 3, at: 'l' }]);
    const snap = await page.locator('button[title^="Snap"]').first().boundingBox();
    // bottom: below the joint area of Bağlantı (or about y 560)
    const ab = await jointArea.boundingBox().catch(() => null);
    const y2 = Math.min(900, Math.max(560, ab ? ab.y + ab.height + 12 : 0));
    const x1 = Math.floor(snap.x) - 4; // between the Hareket and Snap buttons, the Tak panel stays out
    await shot(page, name, box2(x1, y0, 1440, y2));
  } else {
    const kb = await kind.boundingBox();
    const ab = (await jointArea.boundingBox().catch(() => null)) ?? kb;
    await mark(page, [{ n: 2, box: { x: center.x - 30, y: center.y - 30, width: 60, height: 60 } }, { n: 3, loc: kind }, { n: 4, box: tbox, pad: 3, at: 'l' }]);
    const y2 = Math.min(900, ab.y + ab.height + 12);
    await shot(page, name, box2(await safeX(page, Math.max(0, center.x - 180), y0, y2), y0, 1440, y2));
  }
}

const browser = await connect();
try {
  for (const name of REQUESTED) {
    if (!steps[name]) { log('unknown', name); continue; }
    const t = Date.now();
    let ctx, page;
    try {
      ({ ctx, page } = await open(browser, { toasts: TOASTS.has(name) }));
      await steps[name](page);
      log('OK', name, (Date.now() - t) + 'ms');
    } catch (e) {
      log('ERROR', name, e.message.slice(0, 700).replace(/\n/g, ' / '));
      try { await page.screenshot({ path: `${DBG}/error-${name}.png`, timeout: 20000 }); } catch (e2) { log('debug shot failed', e2.message.split('\n')[0]); }
    } finally { await ctx?.close().catch(() => {}); }
  }
} finally { await browser.close(); }
