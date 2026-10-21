// English Builder docs, group 1 images (adim, arayuz, cogalt, derle, donanim, dosya, eklem, gercege-dok).
// The same recipes as the Turkish scripts (capture-a, capture-b, capture-base, capture-night, capture-dev in
// builder/capture/), on the English interface: the selectors use the English labels or the same data-* attributes.
// Usage: node capture-1.mjs <img-dir> <image,...> [debug-dir]
// For a remote browser set the PW_WS environment variable (see lib-en.mjs).
// Image name filter: only the listed images are captured (name = file name without "builder-" and ".png").
// Afterwards: python3 ../../../builder/capture/shrink.py <img-dir>/builder-*.png
import { connect, prepare, prepare3d, mark, clearMarks, capture, toScreen, listParts, partHoles } from './lib-en.mjs';
const IMG = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || IMG;
const wanted = (name) => REQUESTED.includes(name);
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const FULL = { x: 0, y: 0, width: 1440, height: 900 };
const VIEWPORT_3D = { x: 310, y: 108, width: 860, height: 792 };
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
// Panel tab by the start of its label ("Parts" must not match "Add parts")
const tab = (page, name) => page.locator('.dv-tab', { hasText: new RegExp('^\\s*' + esc(name)) }).first();
const contextMenuOf = (page) => page.locator('div.fixed.z-50.shadow-toolbar').first();
const crop = (r, pad = 0) => {
  const x = Math.max(0, Math.round(r.x - pad)), y = Math.max(0, Math.round(r.y - pad));
  return { x, y, width: Math.min(Math.round(r.width + 2 * pad), 1440 - x), height: Math.min(Math.round(r.height + 2 * pad), 900 - y) };
};
const union = (...rs) => {
  const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
  const x2 = Math.max(...rs.map(r => r.x + r.width)), y2 = Math.max(...rs.map(r => r.y + r.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
};
const outFile = (name) => `${IMG}/builder-${name}.png`;
const selectedIds = (page) => page.evaluate(() => window.__robot.getState().selectedPartIds);
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
const R0 = (page, fn, arg) => page.evaluate(fn, arg);
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
// Part type of an option in the Add parts tab (read from the DOM)
async function partTypeOf(page, section, family, option) {
  await tab(page, 'Add parts').click().catch(() => {});
  for (let i = 0; i < 5; i++) {
    if (await page.locator('[data-section]').count()) break;
    const g = page.locator('[data-family-back], [data-section-back]').first();
    if (await g.count()) await g.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.locator('[data-section]', { hasText: section }).first().click(); await page.waitForTimeout(300);
  if (family) { await page.locator('[data-family]', { hasText: family }).first().click(); await page.waitForTimeout(300); }
  const row = page.locator(family ? '[data-family-folder] [data-part-type]' : '[data-section-open] [data-part-type]')
    .filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first();
  return row.getAttribute('data-part-type');
}
// Add a part by clicking its option row in the Add parts tab; returns the new part
async function addPartByRow(page, section, family, option) {
  await partTypeOf(page, section, family, option);
  const n = (await listParts(page)).length;
  await page.locator(family ? '[data-family-folder] [data-part-type]' : '[data-section-open] [data-part-type]')
    .filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first().click();
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
  await page.waitForTimeout(1500);
  const ps = await listParts(page); return ps[ps.length - 1];
}
// Add a part of a known type via the hook; returns the new part
async function addPart(page, kind, at) {
  const n = (await listParts(page)).length;
  await R0(page, ({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: kind, at });
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1200);
  const ps = await listParts(page); return ps[ps.length - 1];
}
// Box around a Properties heading (e.g. "Position (mm)") and the three input boxes that follow it
async function headingWithInputs(page, heading) {
  return page.evaluate((heading) => {
    const h = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.trim() === heading);
    if (!h) throw new Error('no heading ' + heading);
    const ins = [...document.querySelectorAll('input')].filter(i => h.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_FOLLOWING).slice(0, 3);
    const rs = [h, ...ins].map(e => e.getBoundingClientRect());
    const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
    const x2 = Math.max(...rs.map(r => r.right)), y2 = Math.max(...rs.map(r => r.bottom));
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }, heading);
}
async function fitView(page) {
  try { await menu(page, 'View').click(); await page.getByText('Fit view', { exact: true }).first().click(); await page.waitForTimeout(2500); }
  catch (e) { log('fit view error', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); }
}
// Pan the camera to the screen right/left (mm): + = the scene moves right
async function panCamera(page, mm) {
  await page.evaluate((mm) => { const c = window.__controls.current, cam = c.object; cam.updateMatrixWorld();
    const r = new cam.position.constructor().setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(-mm);
    cam.position.add(r); c.target.add(r); c.update(); }, mm);
  await page.waitForTimeout(1500);
}
// Real right click on a part: try candidate points, stop once the part is selected
async function rightClickPart(page, id) {
  const ps = await listParts(page); const p = ps.find(q => q.id === id);
  const candidates = [[0, 38, 0], [0, 0, 0]];
  for (const r of [30, 42, 20]) for (const d of [[0, r, 0], [0, 0, r], [r, 0, 0], [0, 0, -r], [-r, 0, 0], [0, -r, 0]]) candidates.push(d);
  for (const h of (await partHoles(page, id)).slice(0, 8)) candidates.push([h.p[0] - p.pos[0], h.p[1] - p.pos[1], h.p[2] - p.pos[2]]);
  for (const d of candidates) {
    const s = await toScreen(page, [p.pos[0] + d[0], p.pos[1] + d[1], p.pos[2] + d[2]]);
    if (s.x < 320 || s.x > 1160 || s.y < 120 || s.y > 860) continue;
    const before = await selectedIds(page);
    await page.mouse.click(s.x, s.y, { button: 'right' }); await page.waitForTimeout(500);
    const sel = await selectedIds(page);
    if (sel.includes(id)) return s;
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    if (before.length && JSON.stringify(before) !== JSON.stringify(sel)) await page.evaluate((ids) => window.__robot.getState().selectParts(ids), before);
  }
  throw new Error('could not click part: ' + id);
}

const browser = await connect();
try {
  // ======================= Empty scene: toolbar, Add parts panel, File menu (capture-base) =======================
  if (['arayuz-arac-cubugu', 'arayuz-parca-ekle', 'arayuz-dosya-menusu'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser);
    await step('arayuz-arac-cubugu', page, async () => {
      await mark(page, [
        { n: 1, loc: page.locator('button[title="Rename the project"]'), pad: 2 },
        { n: 2, loc: page.locator('button[title="Move (T / M)"]'), pad: 2 },
        { n: 3, loc: page.locator('button[title^="Snap"]'), pad: 2 }]);
      // from just under the menu bar text to just above the panel tabs: the whole badge circles show
      await capture(page, outFile('arayuz-arac-cubugu'), { x: 0, y: 63, width: 1440, height: 52 });
      await clearMarks(page);
    });
    await step('arayuz-parca-ekle', page, async () => {
      await mark(page, [
        { n: 1, loc: page.locator('input[placeholder="Search parts..."]') },
        { n: 2, loc: page.locator('[data-gorunum="tur"]').first().locator('..') }]);
      await capture(page, outFile('arayuz-parca-ekle'), { x: 0, y: 108, width: 320, height: 450 });
      await clearMarks(page);
    });
    await step('arayuz-dosya-menusu', page, async () => {
      await menu(page, 'File').click(); await page.waitForTimeout(400);
      await capture(page, outFile('arayuz-dosya-menusu'), { x: 0, y: 40, width: 300, height: 350 });
      await page.keyboard.press('Escape');
    });
    await ctx.close().catch(() => {});
  }
  // ======================= WattOS mecanum chassis: regions, properties, context menu (capture-base) =======================
  if (['arayuz-bolgeler', 'arayuz-ozellikler', 'arayuz-baglam-menusu'].some(wanted)) {
    const { page, ctx } = await prepare3d(browser);
    await page.locator('[data-bos-sahne-robot="wattos-mekanum-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 25);
    await page.waitForTimeout(3000);
    const ps = await listParts(page);
    const str = ps.find(p => p.type.includes('str')) ?? ps[0];
    await page.evaluate((id) => window.__robot.getState().selectOnlyPart(id), str.id);
    await page.waitForTimeout(1500);
    await step('arayuz-bolgeler', page, async () => {
      await mark(page, [
        { n: 1, box: { x: 4, y: 2, width: 1432, height: 38 } },
        { n: 2, box: { x: 4, y: 46, width: 220, height: 22 }, at: 'r' },
        { n: 3, box: { x: 4, y: 76, width: 1432, height: 28 } },
        { n: 4, box: { x: 6, y: 114, width: 298, height: 780 }, at: 'bl' },
        { n: 5, box: { x: 316, y: 114, width: 848, height: 780 } },
        { n: 6, box: { x: 1176, y: 114, width: 258, height: 780 }, at: 'tr' }]);
      await capture(page, outFile('arayuz-bolgeler'), FULL);
      await clearMarks(page);
    });
    await step('arayuz-ozellikler', page, async () => {
      await mark(page, [
        { n: 1, loc: page.locator('[data-testid="varyant"]'), at: 'lt' },
        { n: 2, box: await headingWithInputs(page, 'Position (mm)'), at: 'lt' },
        { n: 3, box: await headingWithInputs(page, 'Rotation (°)'), at: 'lt' }]);
      // 24 px of the scene on the left: room for the badges outside the frames
      await capture(page, outFile('arayuz-ozellikler'), { x: 1146, y: 108, width: 294, height: 500 });
      await clearMarks(page);
    });
    await step('arayuz-baglam-menusu', page, async () => {
      const p = await toScreen(page, str.pos);
      await page.mouse.click(p.x, p.y, { button: 'right' }); await page.waitForTimeout(800);
      const cx = Math.max(310, Math.min(p.x - 40, 1170 - 330));
      const cy = Math.max(108, Math.min(p.y - 60, 900 - 520));
      await capture(page, outFile('arayuz-baglam-menusu'), { x: cx, y: cy, width: 330, height: 520 });
      await page.keyboard.press('Escape');
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Build step by step: Starter Bot assembly (capture-a montaj, capture-night adim-sonuc) =======================
  if (['adim-serit', 'adim-ayir', 'adim-sonuc', 'adim-gezin', 'adim-duzenlemeye-gec'].some(wanted)) {
    const page = await emptyScene(browser);
    await tab(page, 'Robot catalog').click(); await page.waitForTimeout(800);
    const stepByStep = page.locator('[data-adim-adim="starter-bot-rev"]');
    await stepByStep.click();
    await page.getByText('Step 1 / 14').waitFor({ timeout: 180000 });
    await page.waitForFunction(() => window.__robot.getState().parts.length > 150, null, { timeout: 180000 });
    await page.waitForTimeout(5000); log('assembly opened', await page.evaluate(() => window.__robot.getState().parts.length));
    const strip = page.locator('[aria-label="Steps"]').locator('xpath=ancestor::div[contains(@class,"h-[124px]")][1]');
    log('strip text', (await strip.innerText().catch(e => e.message)).replace(/\n/g, ' | '));
    const next = page.getByRole('button', { name: 'Next', exact: true });
    const back = page.getByRole('button', { name: 'Back', exact: true });
    await step('adim-serit', page, async () => {
      await mark(page, [{ n: 2, loc: stepByStep }]);
      await capture(page, outFile('adim-serit'), FULL);
      await clearMarks(page);
    });
    await step('adim-ayir', page, async () => {
      await next.click(); await next.click();
      await page.getByText('Step 3 / 14').waitFor(); await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Pull apart' }).click();
      await page.waitForTimeout(4000);
      const merge = page.getByRole('button', { name: 'Put together' });
      log('merge button', await merge.count());
      await mark(page, [{ n: 2, loc: merge }]);
      const sb = await strip.boundingBox();
      await capture(page, outFile('adim-ayir'), { x: sb.x, y: 108, width: sb.width, height: sb.y + sb.height - 108 });
      await clearMarks(page);
      await merge.click(); await page.waitForTimeout(2500);
    });
    await step('adim-sonuc', page, async () => {
      await page.getByRole('button', { name: 'Step 5', exact: true }).click();
      await page.getByText('Step 5 / 14').waitFor({ timeout: 120000 });
      await page.mouse.move(1439, 899); await page.waitForTimeout(5000);
      await capture(page, outFile('adim-sonuc'), FULL);
    });
    await step('adim-gezin', page, async () => {
      const n = await page.evaluate(() => (document.body.innerText.match(/Step (\d+) \/ 14/) || [])[1]);
      for (let i = Number(n); i < 6; i++) { await next.click(); await page.waitForTimeout(300); }
      await page.getByText('Step 6 / 14').waitFor(); await page.waitForTimeout(4000);
      await mark(page, [{ n: 1, loc: back, pad: 2 }, { n: 2, loc: next, pad: 2, at: 'tr' }, { n: 3, loc: page.locator('[aria-label="Steps"]') }]);
      const sb = await strip.boundingBox();
      const top = sb.y - 330;
      await capture(page, outFile('adim-gezin'), { x: sb.x, y: top, width: sb.width, height: sb.y + sb.height - top });
      await clearMarks(page);
    });
    await step('adim-duzenlemeye-gec', page, async () => {
      await page.getByRole('button', { name: 'Step 14', exact: true }).click();
      await page.getByText('Step 14 / 14').waitFor(); await page.waitForTimeout(4000);
      const toEdit = page.locator('[data-duzenlemeye-gec]');
      log('switch-to-edit', await toEdit.count(), (await toEdit.innerText().catch(() => '-')));
      await mark(page, [{ n: 1, loc: toEdit }]);
      const sb = await strip.boundingBox();
      await capture(page, outFile('adim-duzenlemeye-gec'), { x: sb.x + sb.width / 2, y: sb.y - 10, width: sb.width / 2, height: sb.height + 10 });
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Empty scene: duplicate and paste here (capture-b bos2) =======================
  if (['cogalt-kopya', 'cogalt-buraya-yapistir'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click(); await page.waitForTimeout(500);
    const original = await addPartByRow(page, 'Structure', 'Structure', '5 holes');
    await blur(page);
    await page.keyboard.press('Control+d'); await page.waitForTimeout(1500);
    const copy = (await listParts(page)).slice(-1)[0];
    log('original', JSON.stringify(original.pos), 'copy', JSON.stringify(copy.pos), 'selected', JSON.stringify(await selectedIds(page)));
    await fitView(page); await page.mouse.move(1439, 899); await page.waitForTimeout(1000);
    await step('cogalt-kopya', page, async () => {
      const pts = []; for (const h of await partHoles(page, copy.id)) pts.push(await toScreen(page, h.p));
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      log('status strip', await page.getByText(/selected/).first().locator('..').innerText().catch(() => '?'));
      await mark(page, [{ n: 3, box: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }, pad: 16 }]);
      // from above the parts down to the status strip: the whole 3D view does not fit in 250 KB at full scale
      const top = Math.max(VIEWPORT_3D.y, Math.floor(Math.min(...ys)) - 120);
      await capture(page, outFile('cogalt-kopya'), { ...VIEWPORT_3D, y: top, height: VIEWPORT_3D.y + VIEWPORT_3D.height - top });
      await clearMarks(page);
    });
    await step('cogalt-buraya-yapistir', page, async () => {
      await rightClickPart(page, copy.id);
      const m = contextMenuOf(page);
      log('PART MENU', (await m.innerText()).replace(/\n/g, ' | '));
      await m.locator('button', { hasText: /^\s*Copy/ }).first().click(); await page.waitForTimeout(600);
      await page.mouse.click(1000, 780, { button: 'right' }); await page.waitForTimeout(600);
      log('EMPTY MENU', (await m.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 5, loc: page.getByText('Paste here').first() }]);
      await capture(page, outFile('cogalt-buraya-yapistir'), crop(await m.boundingBox(), 12));
      await clearMarks(page);
      await page.keyboard.press('Escape');
    });
    await page.close().catch(() => {});
  }
  // ======================= Empty scene: pattern and mirror windows (capture-night) =======================
  if (wanted('cogalt-dizi')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const t5 = await partTypeOf(page, 'Structure', 'Structure', '5 holes');
    await step('cogalt-dizi', page, async () => {
      const p5 = await addPart(page, t5, { x: 0, z: 0 });
      await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), p5.id); await page.waitForTimeout(400);
      await blur(page); await page.keyboard.press('d'); await page.waitForTimeout(800);
      const w = page.locator('[data-testid="dizi-penceresi"]'); await w.waitFor();
      await page.locator('[data-testid="dizi-eksen-z"]').click(); await page.waitForTimeout(300);
      await page.locator('[data-testid="dizi-adet"]').fill('4');
      await page.locator('[data-testid="dizi-aralik"]').fill('60'); await page.waitForTimeout(400);
      await blur(page);
      log('ARRAY', (await w.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="dizi-eksen-z"]') }, { n: 4, loc: page.locator('[data-testid="dizi-adet"]') }, { n: 6, loc: page.locator('[data-testid="dizi-uygula"]') }]);
      await capture(page, outFile('cogalt-dizi'), crop(await w.boundingBox(), 14));
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  if (wanted('cogalt-aynala')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await step('cogalt-aynala', page, async () => {
      const tt = await partTypeOf(page, 'Wheels', 'Mecanum Wheel', 'Left');
      const wheel = await addPart(page, tt, { x: 0, z: 0 });
      await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), wheel.id); await page.waitForTimeout(400);
      await blur(page); await page.keyboard.press('a'); await page.waitForTimeout(800);
      const w = page.locator('[data-testid="ayna-penceresi"]'); await w.waitFor();
      await page.locator('[data-testid="ayna-eksen-x"]').click(); await page.locator('[data-testid="ayna-merkez-yan"]').click(); await page.waitForTimeout(400);
      log('MIRROR', (await w.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="ayna-eksen-x"]') }, { n: 4, loc: page.locator('[data-testid="ayna-merkez-yan"]') }, { n: 5, loc: page.locator('[data-testid="ayna-uygula"]') }]);
      await capture(page, outFile('cogalt-aynala'), crop(await w.boundingBox(), 14));
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= File menu items: empty scene (Open...) and Omni chassis (New, Save) (capture-night) =======================
  // The menu is opened with a mouse click after a blur: after an Escape the File button would keep a focus ring.
  const fileMenu = async (page, name, target, n) => {
    await blur(page);
    await menu(page, 'File').click(); await page.getByText('Save (download JSON)').first().waitFor();
    const m = page.locator('[role=menu]').first(); const mb = await m.boundingBox();
    await mark(page, [{ n, loc: m.getByText(target, { exact: true }).first().locator('..') }]);
    await capture(page, outFile(name), crop({ x: 0, y: 40, width: mb.x + mb.width + 30, height: mb.y + mb.height + 14 - 40 }));
    await clearMarks(page); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  };
  if (['dosya-yeni', 'dosya-kaydet'].some(wanted)) {
    const page = await emptyScene(browser);
    await loadOmni(page);
    await R0(page, () => { const s = window.__robot.getState(); s.setProjectName('Omni test'); s.deselectAll(); });
    await page.getByText('Omni test').first().waitFor();
    await step('dosya-yeni', page, () => fileMenu(page, 'dosya-yeni', 'New', 2));
    await step('dosya-kaydet', page, async () => {
      await fileMenu(page, 'dosya-kaydet', 'Save (download JSON)', 2);
      log('Try in Sim', await page.locator('[role=menuitem]').filter({ hasText: 'Try in Sim' }).count());
    });
    await page.close().catch(() => {});
  }
  if (['dosya-yukle', 'dosya-proje-adi'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await step('dosya-yukle', page, () => fileMenu(page, 'dosya-yukle', 'Open...', 2));
    await step('dosya-proje-adi', page, async () => {
      await page.locator('button[title="Rename the project"]').click();
      const name = page.locator('input:focus'); await name.waitFor();
      await page.keyboard.press('Control+A'); await page.keyboard.type('Omni test'); await page.waitForTimeout(300);
      const ab = await name.boundingBox();
      await mark(page, [{ n: 2, loc: name }]);
      await capture(page, outFile('dosya-proje-adi'), crop({ x: 0, y: ab.y - 14, width: Math.max(560, ab.x + ab.width + 260), height: ab.height + 28 }));
      await clearMarks(page);
      await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    });
    await page.close().catch(() => {});
  }
  // ======================= Empty scene: hardware, motor joint (capture-night) =======================
  if (['donanim-ad', 'donanim-port', 'donanim-cakisma', 'eklem-tak'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const selectOne = async (id) => { await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), id); await page.waitForTimeout(800); };
    if (['donanim-ad', 'donanim-port', 'donanim-cakisma'].some(wanted)) {
      const tm = 'part-rev-41-1600'; // REV HD Hex Motor on the Omni chassis
      const m1 = await addPart(page, tm, { x: -80, z: 0 }); const m2 = await addPart(page, tm, { x: 80, z: 0 });
      const hwArea = page.locator('[data-testid="donanim-alani"]');
      await selectOne(m1.id); await hwArea.waitFor();
      await step('donanim-ad', page, async () => {
        await page.locator('[data-testid="donanim-ad"]').fill('solMotor'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
        log('area', (await hwArea.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 4, loc: page.locator('[data-testid="donanim-ad"]'), at: 'tr' }]);
        await capture(page, outFile('donanim-ad'), crop(await hwArea.boundingBox(), 12));
        await clearMarks(page);
      });
      if (['donanim-port', 'donanim-cakisma'].some(wanted)) {
        if (!wanted('donanim-ad')) { await page.locator('[data-testid="donanim-ad"]').fill('solMotor'); await page.keyboard.press('Enter'); }
        const hub = page.locator('[data-testid="donanim-hub"]'), port = page.locator('[data-testid="donanim-port"]');
        await hub.selectOption({ label: 'Control Hub' }).catch(e => log('hub', e.message.split('\n')[0]));
        await port.selectOption({ label: '0' }).catch(async () => { await port.selectOption({ index: 1 }); });
        await page.locator('[data-testid="donanim-ters"]').check().catch(async () => page.locator('[data-testid="donanim-ters"]').click());
        await page.waitForTimeout(600);
        await step('donanim-port', page, async () => {
          await blur(page);
          await mark(page, [{ n: 1, loc: hub, at: 'above-r', dy: 2 }, { n: 2, loc: port, at: 'above-r', dy: 2 }, { n: 3, loc: page.locator('[data-testid="donanim-ters"]').locator('xpath=ancestor::label[1]') }]);
          await capture(page, outFile('donanim-port'), crop(await hwArea.boundingBox(), 12));
          await clearMarks(page);
        });
        await step('donanim-cakisma', page, async () => {
          await selectOne(m2.id); await hwArea.waitFor();
          await page.locator('[data-testid="donanim-ad"]').fill('sagMotor'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
          await hub.selectOption({ label: 'Control Hub' }).catch(() => {});
          await port.selectOption({ label: '0' }).catch(async () => { await port.selectOption({ index: 1 }); });
          await page.locator('[data-testid="donanim-uyari-port"]').waitFor({ timeout: 10000 });
          await blur(page); await page.waitForTimeout(400);
          log('conflict', (await hwArea.innerText()).replace(/\n/g, ' | '));
          const ub = await page.locator('[data-testid="donanim-uyari-port"]').boundingBox(), pb = await port.boundingBox();
          await mark(page, [{ n: 4, box: pb }, { n: null, box: ub }]);
          await capture(page, outFile('donanim-cakisma'), crop(await hwArea.boundingBox(), 12));
          await clearMarks(page);
        });
      }
      await R0(page, ({ a, b }) => { const s = window.__robot.getState(); s.removeParts([a, b]); s.deselectAll(); }, { a: m1.id, b: m2.id });
      await page.waitForTimeout(800);
    }
    await step('eklem-tak', page, async () => {
      await tab(page, 'Add parts').click().catch(() => {});
      for (let i = 0; i < 5; i++) { if (await page.locator('[data-section]').count()) break; await page.locator('[data-family-back], [data-section-back]').first().click().catch(() => {}); await page.waitForTimeout(500); }
      await page.locator('[data-section]', { hasText: 'Hubs & Shafts' }).first().click(); await page.waitForTimeout(400);
      const families = (await page.locator('[data-family]').allInnerTexts()).map(t => t.split('\n')[0].trim());
      log('hub families', JSON.stringify(families));
      // the same family as the Turkish image (Servo Hex Göbek = Servo Hex Hub)
      const family = families.find(t => /^Servo Hex Hub/.test(t)) ?? families.find(t => /Hub/.test(t));
      const hubType = await partTypeOf(page, 'Hubs & Shafts', family, '');
      log('hub', family, hubType);
      const motor = await addPart(page, 'part-wattos-mtr-480', { x: 0, z: 0 });
      const hubPart = await addPart(page, hubType, { x: 60, z: 0 });
      await R0(page, () => window.__robot.getState().deselectAll());
      await fitView(page);
      await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
      const k1 = await toScreen(page, [hubPart.pos[0] + 3, hubPart.pos[1] * 2, hubPart.pos[2] + 3]); // flat face of the hub
      await page.mouse.click(k1.x, k1.y); await page.waitForTimeout(600);
      await page.screenshot({ path: DBG + '/joint-attach-1.png' });
      const shaftPoint = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, motor.id);
      const k2 = await toScreen(page, shaftPoint);
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await page.mouse.click(k2.x, k2.y); await page.waitForTimeout(1500);
      const toast = page.getByText('Motor joint added', { exact: false }).first();
      const shown = await toast.isVisible().catch(() => false);
      log('toast', shown, JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*joint added[^\n]*/g))));
      if (!shown) { await page.screenshot({ path: DBG + '/joint-attach-no-toast.png' }); throw new Error('no notification'); }
      const hubCenter = await R0(page, (id) => window.__robot.getState().parts.find(q => q.id === id).position.toArray(), hubPart.id);
      const k3 = await toScreen(page, hubCenter);
      await page.mouse.move(1439, 899);
      await mark(page, [{ n: 4, box: { x: k3.x - 30, y: k3.y - 30, width: 60, height: 60 } }]);
      const tb = await toast.boundingBox();
      // the Mate panel stays open at the top left of the scene: start the crop right of it, so no cut-off text shows
      const mp = await page.locator('[data-testid="tak-paneli"]').boundingBox().catch(() => null);
      const area = union(tb, { x: k3.x - 200, y: k3.y - 170, width: 400, height: 360 });
      if (mp && mp.x + mp.width + 8 > area.x - 10) { const x = mp.x + mp.width + 18; area.width -= x - area.x; area.x = x; }
      // the toolbar is in the crop: start on a button edge (no half label); end at the screen edge, so the Properties panel is whole
      if (area.y - 10 < 108) {
        const bx = await page.evaluate((l) => { const xs = [...document.querySelectorAll('button')].map(b => b.getBoundingClientRect()).filter(r => r.width > 0 && r.y > 70 && r.bottom < 112 && r.x >= l).map(r => r.x); return xs.length ? Math.min(...xs) : null; }, area.x - 10);
        // + 10: crop() takes 10 px of margin off again, so the image starts exactly on the button edge
        if (bx != null) { area.width -= bx + 10 - area.x; area.x = bx + 10; }
      }
      area.width = 1450 - area.x;
      log('mate panel', JSON.stringify(mp), 'area', JSON.stringify(area));
      await page.screenshot({ path: outFile('eklem-tak'), clip: crop(area, 10), animations: 'disabled' });
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Omni chassis: result images, Motion, Build, Make it real (capture-night) =======================
  const OMNI = ['dosya-sonuc', 'cogalt-sonuc', 'eklem-poz', 'eklem-ozellikler', 'eklem-sonuc', 'eklem-oynat', 'derle-panel-ac', 'derle-sonuc-ac', 'derle-sonuc', 'derle-fiyat-teklifi', 'derle-bulgular',
    'gercege-dok-sonuc', 'gercege-dok-pencere', 'gercege-dok-eksik-ekle', 'gercege-dok-sepete-ekle', 'gercege-dok-goster', 'donanim-sonuc'];
  if (OMNI.some(wanted)) {
    const page = await emptyScene(browser);
    const type3 = wanted('cogalt-sonuc') ? await partTypeOf(page, 'Structure', 'Structure', '3 holes') : null;
    await tab(page, 'Parts').click().catch(() => {});
    await loadOmni(page);
    const ps0 = await listParts(page);
    const R = (fn, arg) => page.evaluate(fn, arg);
    const clearSelection = async () => { await page.keyboard.press('Escape').catch(() => {}); await R(() => window.__robot.getState().deselectAll()); };
    const captureFull = async (name) => { await waitToastsGone(page); await page.mouse.move(1439, 899); await page.waitForTimeout(2500); await capture(page, outFile(name), FULL); };
    await step('dosya-sonuc', page, async () => {
      await R(() => { const s = window.__robot.getState(); s.setProjectName('first robot'); s.deselectAll(); });
      await menu(page, 'File').click(); await page.getByText('Save (download JSON)').first().waitFor();
      await captureFull('dosya-sonuc');
      await page.keyboard.press('Escape');
    });
    await step('cogalt-sonuc', page, async () => {
      const n = (await listParts(page)).length;
      await R(({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: type3, at: { x: 330, z: 0 } });
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n);
      const added = (await listParts(page)).slice(-1)[0];
      await page.waitForTimeout(1500);
      await R((id) => window.__robot.getState().mirrorParts([id], 'x', 'orijin'), added.id);
      await page.waitForFunction((n) => window.__robot.getState().parts.length === n, ps0.length + 2);
      const ps = await listParts(page);
      await R((ids) => window.__robot.getState().selectParts(ids), ps.slice(-2).map(p => p.id));
      await fitView(page); await page.waitForTimeout(500);
      await captureFull('cogalt-sonuc');
      await R((ids) => { const s = window.__robot.getState(); s.removeParts(ids); s.deselectAll(); }, ps.slice(-2).map(p => p.id));
    });
    if (['eklem-poz', 'eklem-ozellikler'].some(wanted)) {
      if (!wanted('eklem-poz')) await panCamera(page, 4000); // only the panel is captured: move the robot out of frame so the scene renders lighter
      await page.locator('button[title^="Motion"]').first().click();
      const hp = page.locator('[data-testid="hareket-paneli"]'); await hp.waitFor();
      log('motion', (await hp.innerText()).replace(/\n/g, ' | ').slice(0, 500));
      await step('eklem-poz', page, async () => {
        const slider = hp.locator('[data-testid="hareket-kaydirici"]').nth(4); // first "Hex Shaft 5mm 45 mm" (Motor, continuous) row
        await slider.fill('90'); await page.waitForTimeout(3000);
        await blur(page);
        await mark(page, [{ n: 1, loc: slider }, { n: 3, loc: page.locator('[data-testid="hareket-kaydet"]') }]);
        await capture(page, outFile('eklem-poz'), crop(await hp.boundingBox(), 14));
        await clearMarks(page);
      });
      await step('eklem-ozellikler', page, async () => {
        await hp.getByText('Hex Shaft 5mm 45 mm').first().click();
        const jointArea = page.locator('[data-testid="eklem-alani"]'); await jointArea.waitFor({ timeout: 60000 });
        const kind = page.locator('[data-testid="eklem-turu"]');
        log('type options', JSON.stringify(await kind.locator('option').allInnerTexts().catch(() => [])));
        await kind.selectOption({ label: 'Limited rotation' }); await page.waitForTimeout(500);
        const mn = page.locator('[data-testid="eklem-min"]'), mx = page.locator('[data-testid="eklem-max"]');
        await mn.fill('-90'); await mn.press('Enter'); await page.waitForTimeout(300);
        await mx.fill('90'); await mx.press('Enter'); await page.waitForTimeout(300);
        await blur(page);
        await mark(page, [{ n: 5, loc: kind }, { n: 6, box: union(await mn.boundingBox(), await mx.boundingBox()) }]);
        await capture(page, outFile('eklem-ozellikler'), crop(await jointArea.boundingBox(), 14));
        await clearMarks(page);
      });
    }
    if (['eklem-sonuc', 'eklem-oynat'].some(wanted)) {
      const t = Date.now();
      try {
        await page.locator('button[title^="Motion"]').first().click();
        const hp = page.locator('[data-testid="hareket-paneli"]'); await hp.waitFor();
        // eklem-oynat alone: move the robot further right, so the Speed value right of the panel is on a plain background
        await panCamera(page, wanted('eklem-sonuc') ? 70 : 600);
        await page.locator('[data-testid="hareket-oynat"]').click(); await page.waitForTimeout(2500);
        if (wanted('eklem-sonuc')) { await captureFull('eklem-sonuc'); log('OK eklem-sonuc'); }
        if (wanted('eklem-oynat')) {
          const pb = await hp.boundingBox();
          // badge 3 above the slider: on the corner it would cover the Speed label
          await mark(page, [{ n: 3, loc: page.locator('[data-testid="hareket-hiz"]'), at: 'above' }, { n: 4, loc: page.locator('[data-testid="hareket-oynat"]') }]);
          log('speed row', (await page.locator('[data-testid="hareket-hiz"]').locator('..').innerText().catch(() => '-')).replace(/\n/g, ' | '));
          await capture(page, outFile('eklem-oynat'), crop({ x: pb.x - 10, y: pb.y - 10, width: pb.width + 140, height: pb.height + 20 }));
          await clearMarks(page);
          log('OK eklem-oynat', (Date.now() - t) + 'ms');
        }
      } catch (e) { log('ERROR eklem-sonuc/eklem-oynat', e.message.split('\n')[0]); await page.screenshot({ path: `${DBG}/error-eklem-oynat.png` }).catch(() => {}); }
    }
    // --- Build panel ---
    const wantBuild = ['derle-panel-ac', 'derle-sonuc-ac', 'derle-sonuc', 'derle-bulgular', 'derle-fiyat-teklifi'].some(wanted);
    let phaseBoxes = null;
    // derle-bulgular needs a finding: move one chassis profile 500 mm away. When it is the only build image,
    // do it before the first build so the slow build runs once.
    const awayPart = ps0.filter(p => /str-c1-0113/.test(p.type))[0];
    const moveAwayTo = (pos) => R(({ id, pos }) => { const s = window.__robot.getState(); const p = s.parts.find(q => q.id === id); s.updatePart(id, { position: p.position.clone().set(pos[0], pos[1], pos[2]) }); s.deselectAll(); }, { id: awayPart.id, pos });
    const moveAway = () => moveAwayTo([awayPart.pos[0] + 500, awayPart.pos[1], awayPart.pos[2]]);
    const moveBack = () => moveAwayTo(awayPart.pos);
    let movedAway = false;
    if (wanted('derle-bulgular') && !['derle-panel-ac', 'derle-sonuc-ac', 'derle-sonuc', 'derle-fiyat-teklifi'].some(wanted)) { await moveAway(); movedAway = true; await page.waitForTimeout(1500); }
    if (wantBuild) {
      await menu(page, 'View').click(); await page.locator('[role=menu]').getByText('Panels').first().waitFor();
      await step('derle-panel-ac', page, async () => {
        const it = page.getByRole('menuitemcheckbox', { name: 'Build', exact: true });
        const m = await page.locator('[role=menu]').first().boundingBox();
        await mark(page, [{ n: 1, loc: it }]);
        await capture(page, outFile('derle-panel-ac'), crop({ x: m.x - 8, y: 40, width: m.width + 16, height: m.y + m.height + 8 - 40 }));
        await clearMarks(page);
      });
      await page.getByRole('menuitemcheckbox', { name: 'Build', exact: true }).click(); await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Build', exact: true }).first().click();
      await page.getByText('Build again').first().waitFor({ timeout: 120000 });
      await page.waitForTimeout(1500);
      phaseBoxes = await page.evaluate(() => { const r = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/\(Phase \d\)/.test(n.textContent)) { const rg = document.createRange(); rg.selectNodeContents(n); const b = rg.getBoundingClientRect(); r.push({ t: n.textContent, x: b.x, y: b.y, width: b.width, height: b.height }); } return r; });
      log('phase', JSON.stringify(phaseBoxes));
    }
    await step('derle-sonuc-ac', page, async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(2000);
      let clip = FULL;
      if (phaseBoxes && phaseBoxes.length) { const f = phaseBoxes[0]; clip = f.x > 720 ? { x: 0, y: 0, width: Math.floor(f.x - 4), height: 900 } : FULL; }
      await capture(page, outFile('derle-sonuc-ac'), clip);
    });
    const buildPanelCrop = async () => {
      const t = await tab(page, 'Build').boundingBox();
      return crop({ x: t.x - 2, y: t.y - 2, width: 1440 - t.x + 2, height: 900 - t.y + 2 });
    };
    await step('derle-sonuc', page, async () => {
      const statusRow = page.getByText(/^Build (failed|passed)$|^Built with warnings$/).first().locator('..');
      const countRow = page.getByText('collisions', { exact: true }).first().locator('../..');
      await mark(page, [{ n: 2, loc: statusRow }, { n: 3, loc: countRow }]);
      await capture(page, outFile('derle-sonuc'), await buildPanelCrop());
      await clearMarks(page);
    });
    await step('derle-fiyat-teklifi', page, async () => {
      await mark(page, [{ n: 1, loc: page.getByRole('button', { name: 'Get a price quote' }) }]);
      await capture(page, outFile('derle-fiyat-teklifi'), await buildPanelCrop());
      await clearMarks(page);
    });
    await step('derle-bulgular', page, async () => {
      // The ready-made Omni chassis builds without findings: one chassis profile is moved away ("Separate group")
      // before the build (see moveAway above), the finding row is captured, then the profile goes back.
      if (!movedAway) {
        await moveAway(); await page.waitForTimeout(1500);
        await page.getByRole('button', { name: 'Build again' }).first().click();
      }
      await page.getByText(/Separate group/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1500);
      // "part(s) - click to select": the bare words also match "Shift+click to select more" in the Parts panel
      const row = page.getByText(/part\(s\) - click to select/).filter({ visible: true }).first().locator('..');
      log('finding row', JSON.stringify(await row.boundingBox()));
      await mark(page, [{ n: 1, loc: row }]);
      await capture(page, outFile('derle-bulgular'), await buildPanelCrop());
      await clearMarks(page);
      await moveBack(); await page.waitForTimeout(1000);
    });
    // --- Make it real dialog ---
    if (['gercege-dok-sonuc', 'gercege-dok-pencere', 'gercege-dok-eksik-ekle', 'gercege-dok-sepete-ekle', 'gercege-dok-goster'].some(wanted)) {
      if (wanted('gercege-dok-goster')) {
        // move a chassis part away from the robot (run gercege-dok-goster on its own: the other images have no floating part)
        const str = ps0.filter(p => /str-c1-0113/.test(p.type))[0];
        await R(({ id, pos }) => { const s = window.__robot.getState(); const p = s.parts.find(q => q.id === id); s.updatePart(id, { position: p.position.clone().set(pos[0] + 500, pos[1], pos[2]) }); }, { id: str.id, pos: str.pos });
        await page.waitForTimeout(1500);
      }
      await page.getByRole('button', { name: /Make it real/ }).or(page.getByRole('link', { name: /Make it real/ })).first().click();
      await page.getByText('Robot check', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => {});
      await page.getByText(/Add to cart and go to the shop \(/).first().waitFor({ timeout: 120000 });
      await page.waitForFunction(() => !/Checking the robot/.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const dialogCrop = async () => { const b = await page.evaluate(() => { let e = document.querySelector('[data-ftc-kontrol]'); while (e && e.parentElement) { const r = e.getBoundingClientRect(); if (r.width > 560 && r.height > 600) return { x: r.x, y: r.y, width: r.width, height: r.height }; e = e.parentElement; } return null; }); return crop(b, 6); };
      await step('gercege-dok-sonuc', page, async () => { await captureFull('gercege-dok-sonuc'); });
      await step('gercege-dok-pencere', page, async () => {
        await mark(page, [{ n: 3, loc: page.locator('[data-ftc-kontrol]') }]);
        await capture(page, outFile('gercege-dok-pencere'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-eksik-ekle', page, async () => {
        await mark(page, [{ n: 1, loc: page.getByText('Add the missing parts').first() }]);
        await capture(page, outFile('gercege-dok-eksik-ekle'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-sepete-ekle', page, async () => {
        await mark(page, [{ n: 1, loc: page.getByText(/Add to cart and go to the shop/).first() }]);
        await capture(page, outFile('gercege-dok-sepete-ekle'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-goster', page, async () => {
        const g = page.locator('[data-ftc-sorun="floating"]').getByText('show').first();
        await mark(page, [{ n: 2, loc: g, pad: 6, at: 'l' }]);
        await capture(page, outFile('gercege-dok-goster'), crop(await page.locator('[data-ftc-kontrol]').boundingBox(), 10));
        await clearMarks(page);
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    }
    await step('donanim-sonuc', page, async () => {
      const mot = ps0.filter(p => /rev-41|motor|mtr/.test(p.type))[0];
      await R((id) => window.__robot.getState().selectOnlyPart(id), mot.id);
      await page.locator('[data-testid="donanim-alani"]').waitFor();
      await page.locator('[data-testid="donanim-ad"]').fill('solMotor'); await page.locator('[data-testid="donanim-ad"]').press('Enter');
      await page.waitForTimeout(500);
      const port = page.locator('[data-testid="donanim-port"]');
      if (await port.evaluate(e => e.tagName) === 'SELECT') await port.selectOption({ index: 1 }); else await port.click();
      await page.waitForTimeout(800); await blur(page);
      log('hardware', (await page.locator('[data-testid="donanim-alani"]').innerText()).replace(/\n/g, ' | '));
      await captureFull('donanim-sonuc');
      await clearSelection();
    });
    await page.close().catch(() => {});
  }
  // ======================= Build: shop part contact row (capture-dev, now in production) =======================
  if (wanted('derle-sonuc-yeni')) {
    const { page, ctx } = await prepare(browser);
    ctx.setDefaultTimeout(20000);
    await page.waitForTimeout(1500);
    await step('derle-sonuc-yeni', page, async () => {
      await menu(page, 'View').click(); await page.waitForTimeout(300);
      await page.getByRole('menuitemcheckbox', { name: 'Build', exact: true }).click(); await page.waitForTimeout(800);
      await page.locator('[data-bos-sahne-robot="omni-sasi"]').first().click();
      await page.waitForTimeout(15000);
      await page.getByRole('button', { name: 'Build', exact: true }).first().click({ timeout: 120000 });
      await page.getByText('Build again').first().waitFor({ timeout: 120000 });
      ctx.setDefaultTimeout(120000);   // screenshots are slow while the 3D scene is loaded
      await page.waitForTimeout(2000);
      const t = await tab(page, 'Build').boundingBox();
      const info = page.getByText(/\d+ contact\(s\) between shop parts/).first();
      // badge above the frame at its right end: on a corner it covers the first or last word of the text
      if (await info.count()) await mark(page, [{ n: 3, loc: info.locator('..'), pad: 2, at: 'above-r' }]);
      else log('no shop part contact row');
      await page.mouse.move(1439, 899);
      await capture(page, outFile('derle-sonuc-yeni'), { x: Math.floor(t.x) - 2, y: Math.floor(t.y) - 2, width: 1440 - Math.floor(t.x) + 2, height: 900 - Math.floor(t.y) + 2 });
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
} finally { await browser.close(); }
