// Builder docs: night capture of pending images.
// Usage: node capture-night.mjs <img-dir> <image,...> [debug-dir] [sample.stl]
// For a remote browser set the PW_WS environment variable (see lib.mjs). sample.stl: 40 mm cube (model-* images).
// Image name filter: only the listed images are captured (name = file name without "builder-" and ".png").
import { connect, prepare3d, mark, clearMarks, capture, toScreen, listParts, partHoles } from './lib.mjs';
const IMG = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || IMG;
const wanted = (name) => REQUESTED.includes(name);
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const FULL = { x: 0, y: 0, width: 1440, height: 900 };
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
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
// Part type of an option in the Parça Ekle (Add Part) tab (read from the DOM)
async function partTypeOf(page, section, family, option) {
  await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click().catch(() => {});
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
// Pan the camera to the screen right/left (mm): + = the scene moves right
async function panCamera(page, mm) {
  await page.evaluate((mm) => { const c = window.__controls.current, cam = c.object; cam.updateMatrixWorld();
    const r = new cam.position.constructor().setFromMatrixColumn(cam.matrixWorld, 0).multiplyScalar(-mm);
    cam.position.add(r); c.target.add(r); c.update(); }, mm);
  await page.waitForTimeout(1500);
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

const browser = await connect();
try {
  // ======================= Omni chassis, result scenes built via the hook =======================
  if (['hazir-sonuc', 'ilk-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    const type3 = wanted('ilk-sonuc') ? await partTypeOf(page, 'Yapı', 'Structure', '3 delik') : null;
    log('type3', type3);
    await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click().catch(() => {});
    await loadOmni(page);
    await step('hazir-sonuc', page, async () => {
      await page.getByText('68 parça').first().waitFor();
      await page.evaluate(() => window.__robot.getState().deselectAll());
      await waitToastsGone(page); await page.waitForTimeout(2500);
      await capture(page, outFile('hazir-sonuc'), FULL);
    });
    await step('ilk-sonuc', page, async () => {
      const before = (await listParts(page));
      await page.evaluate((t) => window.__robot.getState().addPartOfType(t, { x: 0, z: 250 }), type3);
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, before.length);
      const ps = await listParts(page); const added = ps[ps.length - 1];
      const targets = before.filter(p => p.type.includes('str')).map(p => p.id);
      log('new', JSON.stringify(added), 'target count', targets.length);
      log('attach', JSON.stringify(await attachToHighest(page, added.id, targets)));
      await page.evaluate(() => { window.__robot.getState().setProjectName('ilk robot'); window.__robot.getState().deselectAll(); });
      await page.getByText('ilk robot').first().waitFor();
      await waitToastsGone(page); await page.waitForTimeout(3000);
      await capture(page, outFile('ilk-sonuc'), FULL);
    });
  }
  // ======================= Belt: empty scene, two pulleys =======================
  if (['kayis-kasnaklar', 'kayis-ekle', 'kayis-sonuc', 'kayis-bilgi', 'kayis-sil'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click();
    const search = page.locator('input[placeholder="Parça ara..."]');
    await search.fill('25T'); await page.waitForTimeout(800);
    const row = page.locator('[data-part-type]').filter({ hasText: 'Kasnak Modülü 25T' }).filter({ hasNotText: 'Göbekli' }).first();
    log('search rows', JSON.stringify(await page.locator('[data-part-type]').allInnerTexts()));
    const setPosition = async (x, z) => {
      const ins = page.getByText('Konum (mm)', { exact: true }).locator('..').locator('input');
      await ins.nth(0).fill(String(x)); await ins.nth(0).press('Enter'); await page.waitForTimeout(300);
      await ins.nth(2).fill(String(z)); await ins.nth(2).press('Enter'); await page.waitForTimeout(500);
    };
    await row.click(); await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(1200); await setPosition(0, 0);
    await row.click(); await page.waitForFunction(() => window.__robot.getState().parts.length === 2);
    await page.waitForTimeout(1200); await setPosition(90, 0);
    await blur(page);
    await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(2500);
    log('parts', JSON.stringify(await listParts(page)));
    const propsTabBox = async () => {
      const b = await page.locator('.dv-tab', { hasText: 'Özellikler' }).first().boundingBox();
      return b;
    };
    await step('kayis-kasnaklar', page, async () => {
      await mark(page, [{ n: 5, loc: page.getByText('Konum (mm)', { exact: true }).locator('..') }]);
      const kb = await page.getByText('Konum (mm)', { exact: true }).locator('..').boundingBox();
      await capture(page, outFile('kayis-kasnaklar'), crop({ x: 310, y: 108, width: 1130, height: 600 }));
      await clearMarks(page);
    });
    const ids = (await listParts(page)).map(p => p.id);
    await page.evaluate((ids) => window.__robot.getState().selectParts(ids), ids); await page.waitForTimeout(1500);
    log('multi-select text', (await page.locator('[data-testid="kayis-ekle-alani"]').innerText().catch(() => '-')).replace(/\n/g, ' | '));
    await step('kayis-ekle', page, async () => {
      const a = await page.locator('[data-testid="kayis-ekle"]').boundingBox();
      const b = await page.locator('[data-testid="kayis-onizleme"]').boundingBox();
      await mark(page, [{ n: 3, box: union(a, b) }]);
      await capture(page, outFile('kayis-ekle'), crop({ x: 1170, y: 108, width: 270, height: Math.max(300, b.y + b.height + 24 - 108) }));
      await clearMarks(page);
    });
    await blur(page); await page.mouse.move(740, 500);
    await page.keyboard.press('k');
    await page.waitForFunction(() => window.__robot.getState().parts.length === 3, null, { timeout: 30000 });
    await page.waitForTimeout(800);
    log('notification', JSON.stringify(await page.evaluate(() => (document.body.innerText.match(/Kayış eklendi[^\n]*/g) || []))));
    await step('kayis-sonuc', page, async () => {
      await page.waitForTimeout(1500);
      await page.mouse.move(1439, 899);
      await capture(page, outFile('kayis-sonuc'), FULL);
    });
    log('belt area', (await page.locator('[data-testid="kayis-alani"]').innerText().catch(() => '-')).replace(/\n/g, ' | '));
    await step('kayis-bilgi', page, async () => {
      await waitToastsGone(page);
      const area = await page.locator('[data-testid="kayis-alani"]').boundingBox();
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="kayis-bilgi"]') }, { n: 4, loc: page.locator('[data-testid="kayis-kasnaklari-sec"]') }]);
      await capture(page, outFile('kayis-bilgi'), crop({ x: 1170, y: 108, width: 270, height: area.y + area.height + 16 - 108 }));
      await clearMarks(page);
    });
    await step('kayis-sil', page, async () => {
      const area = await page.locator('[data-testid="kayis-alani"]').boundingBox();
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="kayis-alani"]').getByRole('button', { name: 'Sil', exact: true }) }]);
      await capture(page, outFile('kayis-sil'), crop({ x: 1170, y: 108, width: 270, height: area.y + area.height + 16 - 108 }));
      await clearMarks(page);
    });
  }
  // ======================= Basic shapes: empty scene =======================
  if (['temel-sekiller-listesi', 'temel-ozellikler', 'temel-birlestir', 'temel-sonuc', 'temel-ayir'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click();
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
    log('box', JSON.stringify(box));
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
    log('cylinder fields', JSON.stringify(await sizeInputs.evaluateAll(es => es.map(e => e.getAttribute('data-testid')))));
    await sizeInputs.nth(0).fill('10'); await sizeInputs.nth(0).press('Enter'); await page.waitForTimeout(300);
    await sizeInputs.nth(1).fill('40'); await sizeInputs.nth(1).press('Enter'); await page.waitForTimeout(300);
    await page.locator('[data-testid="ozel-delik"]').click(); await page.waitForTimeout(300);
    const ins = page.getByText('Konum (mm)', { exact: true }).locator('..').locator('input');
    await ins.nth(0).fill(String(Math.round(box.pos[0]))); await ins.nth(0).press('Enter'); await page.waitForTimeout(300);
    await ins.nth(2).fill(String(Math.round(box.pos[2]))); await ins.nth(2).press('Enter'); await page.waitForTimeout(500);
    await blur(page);
    const ids = (await listParts(page)).map(p => p.id);
    log('parts', JSON.stringify(await listParts(page)));
    await page.evaluate((ids) => window.__robot.getState().selectParts(ids), ids); await page.waitForTimeout(1200);
    await step('temel-birlestir', page, async () => {
      await page.getByText('Çoklu Seçim').first().waitFor();
      const b = await page.locator('[data-testid="ozel-birlestir"]').boundingBox();
      await mark(page, [{ n: 4, loc: page.locator('[data-testid="ozel-birlestir"]') }]);
      await capture(page, outFile('temel-birlestir'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 30 - 108 }));
      await clearMarks(page);
    });
    await page.locator('[data-testid="ozel-birlestir"]').click();
    await page.getByText('Birleşik şekil').first().waitFor();
    await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(2500);
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
  }
  // ======================= Sketch and Extrude: empty scene + box =======================
  if (['sketch-duzlem', 'sketch-cizim', 'sketch-kisit', 'sketch-extrude', 'sketch-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click();
    await page.locator('[data-section="temel"]').click();
    await page.locator('[data-part-type="ozel-kutu"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(1000);
    const box = (await listParts(page))[0];
    await page.evaluate(() => window.__robot.getState().deselectAll());
    await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(2000);
    await blur(page);
    await page.locator('button[title^="Sketch"]').first().click();
    await page.locator('[data-testid="sketch-paneli"]').waitFor();
    await page.getByText('Bir parçanın düz yüzüne tıkla').first().waitFor();
    const leftPanel = async () => {
      const b = await page.locator('[data-testid="sketch-paneli"], [data-testid="ekstrud-paneli"]').first().boundingBox();
      return b;
    };
    await step('sketch-duzlem', page, async () => {
      const sb = await leftPanel();
      await mark(page, [{ n: 2, loc: page.locator('[data-testid="sketch-duzlem-ust"]').locator('..') }]);
      await capture(page, outFile('sketch-duzlem'), crop({ x: 0, y: 108, width: 860, height: 520 }));
      await clearMarks(page);
      log('panel', JSON.stringify(sb));
    });
    // click the top face of the box
    const top = await toScreen(page, [box.pos[0], box.pos[1] + 10, box.pos[2]]);
    await page.mouse.click(top.x, top.y); await page.waitForTimeout(2500);
    log('sketch header', (await page.locator('[data-testid="sketch-paneli"]').innerText()).replace(/\n/g, ' | ').slice(0, 200));
    await page.locator('[data-testid="sketch-arac-dikdortgen"]').click(); await page.waitForTimeout(300);
    const y = box.pos[1] + 10;
    const k1 = await toScreen(page, [box.pos[0] - 15, y, box.pos[2] - 10]);
    const k2 = await toScreen(page, [box.pos[0] + 15, y, box.pos[2] + 10]);
    log('corners', JSON.stringify([k1, k2]));
    await page.mouse.move(k1.x, k1.y); await page.mouse.click(k1.x, k1.y); await page.waitForTimeout(500);
    await page.mouse.move(k2.x, k2.y); await page.mouse.click(k2.x, k2.y); await page.waitForTimeout(800);
    log('items', (await page.locator('[data-testid="sketch-ogeler"]').innerText().catch(() => '-')).replace(/\n/g, ' | '));
    log('status', await page.locator('[data-testid="sketch-durum"]').innerText().catch(() => '-'));
    await step('sketch-cizim', page, async () => {
      await page.locator('[data-testid="sketch-ogeler"]').waitFor();
      await mark(page, [{ n: 1, loc: page.locator('[data-testid="sketch-arac-dikdortgen"]') }]);
      await capture(page, outFile('sketch-cizim'), crop({ x: 0, y: 108, width: 1170, height: 640 }));
      await clearMarks(page);
    });
    // Select tool, click the middle of the top edge
    await page.locator('[data-testid="sketch-arac-sec"]').click(); await page.waitForTimeout(300);
    const edge = await toScreen(page, [box.pos[0], y, box.pos[2] - 10]);
    await page.mouse.click(edge.x, edge.y); await page.waitForTimeout(800);
    log('selected', (await page.locator('[data-testid="sketch-secili"]').innerText().catch(() => '-')).replace(/\n/g, ' | '));
    const valueInput = page.locator('[data-testid="sketch-olcu-deger"]');
    if (await valueInput.count()) { await valueInput.fill('40'); await valueInput.press('Enter'); await page.waitForTimeout(800); }
    await step('sketch-kisit', page, async () => {
      await page.locator('[data-testid="sketch-secili"]').waitFor();
      await mark(page, [{ n: 3, loc: valueInput }, { n: 4, loc: page.locator('[data-testid="sketch-kisit-ekle"]') }]);
      const sb = await leftPanel();
      await capture(page, outFile('sketch-kisit'), crop({ x: 0, y: 108, width: 312, height: 792 }));
      await clearMarks(page);
    });
    log('status2', await page.locator('[data-testid="sketch-durum"]').innerText().catch(() => '-'));
    await page.locator('[data-testid="sketch-bitir"]').click(); await page.waitForTimeout(1500);
    log('selection', JSON.stringify(await selectedIds(page)), 'parts', JSON.stringify(await listParts(page)));
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
    log('after extrude', JSON.stringify(await listParts(page)), JSON.stringify(await selectedIds(page)));
    await step('sketch-sonuc', page, async () => {
      await page.evaluate(() => { const c = window.__controls.current; c.object.position.set(c.target.x + 120, c.target.y + 110, c.target.z + 140); c.update(); });
      await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(2500);
      await waitToastsGone(page);
      await capture(page, outFile('sketch-sonuc'), FULL);
    });
  }
  // ======================= Panels: empty scene =======================
  if (['panel-sekme-tasi', 'panel-sifirla', 'panel-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const tab = (name) => page.locator('.dv-tab', { hasText: name }).first();
    const dragTab = async (name, x, y, fn) => {
      const b = await tab(name).boundingBox();
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
      await dragTab('Parçalar', 1160, 500, async () => {
        const targets = await page.evaluate(() => [...document.querySelectorAll('[class*="dv-drop-target"]')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, x: r.x, y: r.y, width: r.width, height: r.height }; }).filter(r => r.width > 0));
        log('drop', JSON.stringify(targets));
        await step('panel-sekme-tasi', page, async () => {
          const s = targets.filter(h => /selection|anchor/.test(h.c)).sort((a, b) => a.width * a.height - b.width * b.height)[0];
          if (!s) throw new Error('no drop target');
          await mark(page, [{ n: 2, box: s }]);
          await page.screenshot({ path: outFile('panel-sekme-tasi'), clip: crop({ x: 0, y: 40, width: 1440, height: 560 }) });
          await clearMarks(page);
        });
      });
      log('layout1', await layout());
      // Close the Robot Kataloğu (catalog) tab, then the Görünüm (View) menu
      await step('panel-sifirla', page, async () => {
        const catalogTab = tab('Robot Kataloğu');
        if (await catalogTab.count()) { await catalogTab.click(); await catalogTab.locator('.dv-default-tab-action, [aria-label*="Kapat"], svg').last().click().catch(() => {}); await page.waitForTimeout(500); }
        log('layout2', await layout());
        await menu(page, 'Görünüm').click(); await page.waitForTimeout(500);
        const it = page.getByRole('menuitem', { name: 'Yerleşimi sıfırla' });
        const m = await page.locator('[role=menu]').first().boundingBox();
        await mark(page, [{ n: 3, loc: it }]);
        await capture(page, outFile('panel-sifirla'), crop({ x: m.x - 8, y: 40, width: m.width + 16, height: m.y + m.height + 8 - 40 }));
        await clearMarks(page);
        await it.click(); await page.waitForTimeout(1200);
        log('layout3', await layout());
      });
    }
    await step('panel-sonuc', page, async () => {
      await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click();
      await page.locator('[data-section="temel"]').click();
      await page.locator('[data-part-type="ozel-kutu"]').click();
      await page.waitForFunction(() => window.__robot.getState().parts.length === 1); await page.waitForTimeout(1000);
      await dragTab('Özellikler', 4, 500);
      log('layout4', await layout());
      await page.mouse.move(1439, 899); await page.waitForTimeout(800);
      await capture(page, outFile('panel-sonuc'), FULL);
    });
  }
  // ======================= Empty scene: menus, shortcuts, project name, imported model =======================
  const BASIC_MENU_SHOTS = ['dosya-yukle', 'dosya-yeni', 'dosya-kaydet', 'model-dosya-menusu', 'dosya-proje-adi', 'kisayollar-yardim', 'model-ozellikler', 'model-eksik'];
  if (BASIC_MENU_SHOTS.some(wanted)) {
    const page = await emptyScene(browser);
    const CUBE = process.argv[5];
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const fileMenu = async (name, target, n) => {
      await menu(page, 'Dosya').click(); await page.getByText('Kaydet (JSON indir)').first().waitFor();
      const m = page.locator('[role=menu]').first(); const mb = await m.boundingBox();
      await mark(page, [{ n, loc: m.getByText(target, { exact: true }).first().locator('..') }]);
      await capture(page, outFile(name), crop({ x: 0, y: 40, width: mb.x + mb.width + 30, height: mb.y + mb.height + 14 - 40 }));
      await clearMarks(page); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    };
    await step('dosya-yukle', page, () => fileMenu('dosya-yukle', 'Yükle...', 2));
    await step('dosya-yeni', page, () => fileMenu('dosya-yeni', 'Yeni', 2));
    await step('dosya-kaydet', page, () => fileMenu('dosya-kaydet', 'Kaydet (JSON indir)', 2));
    await step('model-dosya-menusu', page, () => fileMenu('model-dosya-menusu', 'İçe aktar (STL, STEP, GLB, OBJ)...', 1));
    await step('dosya-proje-adi', page, async () => {
      await page.locator('button[title="Proje adını düzenle"]').click();
      const name = page.locator('input:focus'); await name.waitFor();
      await page.keyboard.press('Control+A'); await page.keyboard.type('Omni deneme'); await page.waitForTimeout(300);
      const ab = await name.boundingBox();
      await mark(page, [{ n: 2, loc: name }]);
      await capture(page, outFile('dosya-proje-adi'), crop({ x: 0, y: ab.y - 14, width: Math.max(560, ab.x + ab.width + 260), height: ab.height + 28 }));
      await clearMarks(page);
      await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    });
    await step('kisayollar-yardim', page, async () => {
      await blur(page);
      await page.locator('button[title^="Klavye kısayolları"]').first().click();
      await page.getByText('Klavye Kısayolları').first().waitFor();
      const row = page.getByText(/^Fare \(Onshape düzeni/).first();
      const dialogBox = await page.evaluate(() => { let e = [...document.querySelectorAll('*')].find(x => x.children.length === 0 && x.textContent.trim() === 'Klavye Kısayolları'); while (e && e.parentElement) { const r = e.getBoundingClientRect(); if (r.width > 300 && r.height > 300) return { x: r.x, y: r.y, width: r.width, height: r.height }; e = e.parentElement; } return null; });
      log('dialog', JSON.stringify(dialogBox));
      await mark(page, [{ n: 2, loc: row.locator('..') }]);
      await capture(page, outFile('kisayollar-yardim'), crop(dialogBox, 8));
      await clearMarks(page);
      await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    });
    if (['model-ozellikler', 'model-eksik'].some(wanted)) {
      await menu(page, 'Dosya').click();
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('İçe aktar (STL, STEP, GLB, OBJ)...').first().click()]);
      await fc.setFiles(CUBE);
      await page.waitForFunction(() => window.__robot.getState().parts.length === 1, null, { timeout: 60000 });
      await page.waitForTimeout(2000);
      log('notification', JSON.stringify(await page.evaluate(() => (document.body.innerText.match(/[^\n]*eklendi[^\n]*/g) || []))));
      const id = (await listParts(page))[0].id;
      await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), id);
      await page.locator('[data-testid="ozel-dosya"]').waitFor();
      await step('model-ozellikler', page, async () => {
        const unitRow = page.locator('[data-testid="ozel-birim-mm"]').locator('..');
        const upRow = page.locator('[data-testid="ozel-yukari-z"]').locator('..');
        const sizeInputs = page.locator('[data-testid="ozel-olcu-en"]').locator('xpath=ancestor::div[2]');
        await mark(page, [{ n: 2, loc: unitRow }, { n: 3, loc: upRow }, { n: 4, loc: sizeInputs }]);
        const b = await page.locator('[data-testid="ozel-dosya"]').boundingBox();
        await capture(page, outFile('model-ozellikler'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 16 - 108 }));
        await clearMarks(page);
      });
      await step('model-eksik', page, async () => {
        await menu(page, 'Dosya').click();
        const [dl] = await Promise.all([page.waitForEvent('download'), page.getByText('Kaydet (JSON indir)').first().click()]);
        const jsonPath = DBG + '/model-proje.json'; await dl.saveAs(jsonPath);
        const fs = await import('fs');
        const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); log('json keys', Object.keys(j).join(','));
        delete j.assets; const strippedPath = DBG + '/model-eksik.json'; fs.writeFileSync(strippedPath, JSON.stringify(j));
        // new tab: so there is no in-memory copy of the model
        const { page: p2 } = await prepare3d(browser); p2.setDefaultTimeout(60000);
        await p2.locator('[data-bos-sahne-bos]').click().catch(() => {}); await p2.waitForTimeout(500);
        await menu(p2, 'Dosya').click();
        const [fc2] = await Promise.all([p2.waitForEvent('filechooser'), p2.getByText('Yükle...').first().click()]);
        await fc2.setFiles(strippedPath); await p2.waitForTimeout(3000);
        const id2 = (await listParts(p2))[0].id;
        await R0(p2, (id) => window.__robot.getState().selectOnlyPart(id), id2);
        await p2.locator('[data-testid="ozel-model-eksik"]').waitFor();
        await p2.waitForTimeout(1500);
        log('missing model text', (await p2.locator('[data-testid="ozel-model-eksik"]').innerText()).replace(/\n/g, ' | '));
        const b = await p2.locator('[data-testid="ozel-model-eksik"]').boundingBox();
        await mark(p2, [{ n: 2, loc: p2.locator('[data-testid="ozel-model-sec"]') }]);
        await capture(p2, outFile('model-eksik'), crop({ x: 1170, y: 108, width: 270, height: Math.min(792, b.y + b.height + 60 - 108) }));
        await clearMarks(p2);
      });
    }
  }
  if (wanted('model-eklendi')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await menu(page, 'Dosya').click();
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('İçe aktar (STL, STEP, GLB, OBJ)...').first().click()]);
    await step('model-eklendi', page, async () => {
      await fc.setFiles(process.argv[5]);
      const t = await page.waitForFunction(() => { const e = [...document.querySelectorAll('body *')].find(x => x.children.length === 0 && /kup eklendi/.test(x.textContent)); if (!e) return null; const b = (e.closest('[data-sonner-toast],li') || e).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, null, { timeout: 60000, polling: 100 }).then(h => h.jsonValue());
      // the notification closes within a few seconds: capture as soon as it is found (scene + notification in the top right corner)
      await capture(page, outFile('model-eklendi'), { x: 560, y: 44, width: 880, height: 640 });
      log('toast', JSON.stringify(t));
    });
  }
  if (wanted('adim-sonuc')) {
    const page = await emptyScene(browser);
    await page.locator('.dv-tab', { hasText: 'Robot Ka' }).first().click(); await page.waitForTimeout(800);
    await page.locator('[data-adim-adim="starter-bot-rev"]').click();
    await page.getByText('Adım 1 / 14').waitFor({ timeout: 180000 });
    await page.waitForFunction(() => window.__robot.getState().parts.length > 150, null, { timeout: 180000 });
    log('assembly opened');
    await step('adim-sonuc', page, async () => {
      await page.getByRole('button', { name: 'Adım 5', exact: true }).click();
      await page.getByText('Adım 5 / 14').waitFor({ timeout: 120000 });
      await page.mouse.move(1439, 899); await page.waitForTimeout(5000);
      await capture(page, outFile('adim-sonuc'), FULL);
    });
    await page.close().catch(() => {});
  }
  // ======================= Recaptures =======================
  const fitView = async (page) => { try { await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(2500); } catch (e) { log('fit view error', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); } };
  const addPart = async (page, kind, at) => {
    const n = (await listParts(page)).length;
    await R0(page, ({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: kind, at });
    await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1200);
    const ps = await listParts(page); return ps[ps.length - 1];
  };
  if (wanted('hazir-degistir-onayi')) {
    const page = await emptyScene(browser);
    await step('hazir-degistir-onayi', page, async () => {
      await page.locator('[data-bos-sahne-robot="wattos-mekanum-sasi"]').click();
      await page.waitForFunction(() => window.__robot.getState().parts.length > 25); await page.waitForTimeout(3000);
      await page.locator('.dv-tab', { hasText: 'Robot Ka' }).first().click(); await page.waitForTimeout(800);
      await page.locator('[data-robot-yukle="omni-sasi"]').click(); await page.waitForTimeout(800);
      const confirmBox = page.locator('[data-robot-onay]'); log('confirm', (await confirmBox.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 4, loc: page.locator('[data-robot-onayla]') }]);
      const ob = await confirmBox.boundingBox(); const pc = await page.locator('[data-catalog-panel]').boundingBox();
      const kb = await page.locator('[data-robot-yukle="omni-sasi"]').boundingBox();
      const top = Math.max(pc.y + 30, kb.y - 10); // start above the card row so no half row is left
      await capture(page, outFile('hazir-degistir-onayi'), { x: pc.x, y: top, width: pc.width, height: ob.y + ob.height + 20 - top });
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  if (wanted('cogalt-dizi')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const t5 = await partTypeOf(page, 'Yapı', 'Structure', '5 delik');
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
  if (wanted('tak-motor-mili')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const tm = await partTypeOf(page, 'Motor ve Servo', 'WattOS Motor', '480 RPM');
    const td = await partTypeOf(page, 'Dişliler', 'Dişli', '5mm Altıgen 20 diş');
    log('types', tm, td);
    await step('tak-motor-mili', page, async () => {
      const motor = await addPart(page, tm, { x: 0, z: 0 });
      const gear = await addPart(page, td, { x: 60, z: 0 });
      log('motor', JSON.stringify(motor), 'gear', JSON.stringify(gear));
      await R0(page, () => window.__robot.getState().deselectAll());
      await fitView(page);
      await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
      const dd = (await partHoles(page, gear.id)).sort((a, b) => Math.hypot(a.p[0] - gear.pos[0], a.p[2] - gear.pos[2]) - Math.hypot(b.p[0] - gear.pos[0], b.p[2] - gear.pos[2]));
      log('gear holes', JSON.stringify(dd.slice(0, 4)));
      const c = dd[0] ? dd[0].p : gear.pos; const top = dd[0] ? Math.max(...dd.filter(h => Math.hypot(h.p[0] - c[0], h.p[2] - c[2]) < 0.5).map(h => h.p[1])) : gear.pos[1] * 2;
      // flat side face: 8 mm out from the center (not into the center bore)
      const y = await toScreen(page, [c[0], top, c[2] + 8]);
      await page.mouse.click(y.x, y.y); await page.waitForTimeout(800);
      log('source', JSON.stringify(await page.evaluate(() => { const s = window.__tak.getState(); return s.kaynak ? Object.fromEntries(Object.entries(s.kaynak).filter(([k, v]) => typeof v !== 'object' || v === null)) : null; })));
      await page.screenshot({ path: DBG + '/attach-face-selected.png' });
      const shaftPoint = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, motor.id);
      const m = await toScreen(page, shaftPoint);
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await page.mouse.click(m.x, m.y); await page.waitForTimeout(1500);
      const toast = page.getByText('Motor eklemi eklendi', { exact: false }).first();
      const shown = await toast.isVisible().catch(() => false);
      log('toast', shown, JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*(eklemi|Eşleşecek)[^\n]*/g))));
      log('gear after', JSON.stringify(await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); return { pos: p.position.toArray().map(v => +v.toFixed(1)), parent: p.ebeveyn, joint: p.eklem }; }, gear.id)));
      if (!shown) { await page.screenshot({ path: DBG + '/motor-no-toast.png' }); throw new Error('no notification'); }
      await page.mouse.move(1439, 899);
      await mark(page, [{ n: 6, loc: toast }]);
      const tb = await toast.boundingBox();
      await page.screenshot({ path: outFile('tak-motor-mili'), clip: crop(union(tb, { x: m.x - 190, y: m.y - 190, width: 380, height: 380 }), 10), animations: 'disabled' });
      await clearMarks(page);
    });
  }
  // ======================= Simple scene: mirror, measure panel, account dialogs =======================
  const BASIC_MEASURE_SHOTS = ['cogalt-aynala', 'olc-kapat', 'olc-shift', 'olc-liste', 'hesap-kaydet-penceresi', 'hesap-giris-istemi', 'hesap-paylas-formu'];
  if (BASIC_MEASURE_SHOTS.some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await step('cogalt-aynala', page, async () => {
      const tt = await partTypeOf(page, 'Tekerlekler', 'Mecanum Teker', 'Sol');
      const wheel = await addPart(page, tt, { x: 0, z: 0 });
      await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), wheel.id); await page.waitForTimeout(400);
      await blur(page); await page.keyboard.press('a'); await page.waitForTimeout(800);
      const w = page.locator('[data-testid="ayna-penceresi"]'); await w.waitFor();
      await page.locator('[data-testid="ayna-eksen-x"]').click(); await page.locator('[data-testid="ayna-merkez-yan"]').click(); await page.waitForTimeout(400);
      log('MIRROR', (await w.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: page.locator('[data-testid="ayna-eksen-x"]') }, { n: 4, loc: page.locator('[data-testid="ayna-merkez-yan"]') }, { n: 5, loc: page.locator('[data-testid="ayna-uygula"]') }]);
      await capture(page, outFile('cogalt-aynala'), crop(await w.boundingBox(), 14));
      await clearMarks(page); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      await R0(page, (id) => { const s = window.__robot.getState(); s.removeParts([id]); s.deselectAll(); }, wheel.id);
    });
    const t5 = await partTypeOf(page, 'Yapı', 'Structure', '5 delik');
    const st = await addPart(page, t5, { x: 0, z: 0 });
    await R0(page, () => window.__robot.getState().deselectAll());
    await fitView(page);
    if (['olc-kapat', 'olc-shift', 'olc-liste'].some(wanted)) {
      await page.locator('button[title^="Ölç"]').first().click();
      await page.getByText('Ölçmek için ilk noktaya tıkla').first().waitFor();
      const panel = page.getByText('Ölçüm', { exact: true }).first().locator('xpath=ancestor::div[2]');
      const hs = (await partHoles(page, st.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
      const top = hs.filter(h => Math.abs(h.p[1] - hs[0].p[1]) < 1).sort((a, b) => a.p[0] - b.p[0] || a.p[2] - b.p[2]);
      log('top holes', top.length, JSON.stringify(top.map(h => h.p.map(v => Math.round(v)))));
      const clickPoint = async (h, shift) => { const n = await toScreen(page, h); await page.mouse.move(n.x, n.y); await page.waitForTimeout(600); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(n.x, n.y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(800); return n; };
      await step('olc-kapat', page, async () => {
        await mark(page, [{ n: 3, loc: page.locator('[title="Ölçümü kapat (Esc)"]').first() }]);
        await capture(page, outFile('olc-kapat'), crop(await panel.boundingBox(), 12));
        await clearMarks(page);
      });
      await step('olc-shift', page, async () => {
        const h = top[0].p; await clickPoint([h[0] + 4.2, h[1], h[2]], true);
        await page.getByText('İkinci noktaya tıkla').first().waitFor();
        log('shift panel', (await panel.innerText()).replace(/\n/g, ' | '));
        const tb = await page.getByText(/İlk nokta yüzey/).first().boundingBox(); const pb0 = await panel.boundingBox();
        await mark(page, [{ n: 3, box: { x: tb.x - 12, y: tb.y, width: tb.width + 18, height: tb.height } }]);
        log('tb', JSON.stringify(tb), 'panel', JSON.stringify(pb0));
        await capture(page, outFile('olc-shift'), crop({ x: pb0.x - 21, y: pb0.y + 4, width: pb0.width + 27, height: pb0.height + 4 }));
        await clearMarks(page);
        await blur(page); await page.keyboard.press('Escape'); await page.waitForTimeout(600);
      });
      await step('olc-liste', page, async () => {
        const a = top[0], b = top[top.length - 1], c = top[Math.floor(top.length / 2)];
        await clickPoint(a.p); await clickPoint(b.p); await page.getByText('ΔX').first().waitFor();
        await clickPoint(a.p); await clickPoint([(a.p[0] + b.p[0]) / 2, a.p[1], (a.p[2] + b.p[2]) / 2], true); await page.waitForTimeout(1200);
        log('list panel', (await panel.innerText()).replace(/\n/g, ' | '));
        await page.mouse.move(1439, 899);
        await mark(page, [{ n: 2, loc: page.locator('[title="Bu ölçümü sil"]').first() }]);
        await capture(page, outFile('olc-liste'), crop(await panel.boundingBox(), 12));
        await clearMarks(page);
      });
      await blur(page); for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
    }
    if (['hesap-kaydet-penceresi', 'hesap-giris-istemi'].some(wanted)) {
      await R0(page, () => window.__robot.getState().setProjectName('Omni deneme')); await page.waitForTimeout(300);
      await menu(page, 'Dosya').click(); await page.getByText('Hesabıma kaydet...').first().click();
      const d = page.locator('[data-hesap-kaydet]'); await d.waitFor();
      log('account dialog', (await d.innerText()).replace(/\n/g, ' | '));
      await step('hesap-kaydet-penceresi', page, async () => {
        await mark(page, [{ n: 2, loc: page.locator('[data-hesap-ad]') }, { n: 3, loc: page.locator('[data-hesap-kaydet-gonder]') }]);
        await capture(page, outFile('hesap-kaydet-penceresi'), crop(await d.boundingBox(), 12));
        await clearMarks(page);
      });
      await step('hesap-giris-istemi', page, async () => {
        await page.locator('[data-hesap-kaydet-gonder]').click();
        const g = page.locator('[data-hesap-giris]'); await g.waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
        log('sign-in', (await g.innerText()).replace(/\n/g, ' | '));
        const link = g.getByText(/Yeni sekmede giriş yap/).first();
        await mark(page, [{ n: 3, loc: g }]);
        await capture(page, outFile('hesap-giris-istemi'), crop(await d.boundingBox(), 12));
        await clearMarks(page);
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    }
    await step('hesap-paylas-formu', page, async () => {
      await page.locator('.dv-tab', { hasText: 'Robot Ka' }).first().click(); await page.waitForTimeout(800);
      await page.getByText('Robotunu paylaş', { exact: false }).first().click();
      const f = page.locator('[data-share-form]'); await f.waitFor({ timeout: 20000 });
      await page.locator('input[name="robotName"]').fill('Omni deneme'); await blur(page); await page.waitForTimeout(400);
      log('share form', (await f.innerText()).replace(/\n/g, ' | '));
      await f.scrollIntoViewIfNeeded();
      await mark(page, [{ n: 3, loc: page.locator('input[name="robotName"]') }, { n: 4, loc: page.locator('[data-share-submit]') }]);
      const pc = await page.locator('[data-catalog-panel]').boundingBox(); const fb = await f.boundingBox();
      const top = Math.max(pc.y, fb.y - 60);
      await capture(page, outFile('hesap-paylas-formu'), { x: pc.x, y: top, width: pc.width, height: Math.min(900, fb.y + fb.height + 14) - top });
      await clearMarks(page);
    });
    await page.close().catch(() => {});
  }
  // ======================= Simple scene: hardware, group/link, attach joint =======================
  const BASIC_HARDWARE_SHOTS = ['donanim-ad', 'donanim-port', 'donanim-cakisma', 'grupla-sabitle', 'grupla-coz', 'grupla-bagla', 'grupla-bagi-coz', 'eklem-tak'];
  if (BASIC_HARDWARE_SHOTS.some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const selectOne = async (id) => { await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), id); await page.waitForTimeout(800); };
    const rightClick = async (id) => {
      const p = (await listParts(page)).find(q => q.id === id); const n = await toScreen(page, p.pos);
      await page.mouse.click(n.x, n.y, { button: 'right' }); await page.waitForTimeout(800);
    };
    const contextMenu = page.locator('div.fixed.z-50.shadow-toolbar').first();
    if (['donanim-ad', 'donanim-port', 'donanim-cakisma'].some(wanted)) {
      const tm = 'part-rev-41-1600'; // REV HD Hex Motor on the Omni chassis
      log('motor type', tm);
      const m1 = await addPart(page, tm, { x: -80, z: 0 }); const m2 = await addPart(page, tm, { x: 80, z: 0 });
      const hwArea = page.locator('[data-testid="donanim-alani"]');
      await selectOne(m1.id); await hwArea.waitFor();
      await step('donanim-ad', page, async () => {
        await page.locator('[data-testid="donanim-ad"]').fill('solMotor'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
        log('area', (await hwArea.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 4, loc: page.locator('[data-testid="donanim-ad"]') }]);
        await capture(page, outFile('donanim-ad'), crop(await hwArea.boundingBox(), 12));
        await clearMarks(page);
      });
      if (['donanim-port', 'donanim-cakisma'].some(wanted)) {
        if (!wanted('donanim-ad')) { await page.locator('[data-testid="donanim-ad"]').fill('solMotor'); await page.keyboard.press('Enter'); }
        const hub = page.locator('[data-testid="donanim-hub"]'), port = page.locator('[data-testid="donanim-port"]');
        log('hub options', JSON.stringify(await hub.locator('option').allInnerTexts().catch(() => [])), 'port', JSON.stringify(await port.locator('option').allInnerTexts().catch(() => [])));
        await hub.selectOption({ label: 'Control Hub' }).catch(e => log('hub', e.message.split('\n')[0]));
        await port.selectOption({ label: '0' }).catch(async () => { await port.selectOption({ index: 1 }); });
        await page.locator('[data-testid="donanim-ters"]').check().catch(async () => page.locator('[data-testid="donanim-ters"]').click());
        await page.waitForTimeout(600);
        await step('donanim-port', page, async () => {
          await blur(page);
          await mark(page, [{ n: 1, loc: hub }, { n: 2, loc: port }, { n: 3, loc: page.locator('[data-testid="donanim-ters"]').locator('xpath=ancestor::label[1]') }]);
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
      await page.locator('.dv-tab', { hasText: 'Parça Ekle' }).first().click().catch(() => {});
      for (let i = 0; i < 5; i++) { if (await page.locator('[data-section]').count()) break; await page.locator('[data-family-back], [data-section-back]').first().click().catch(() => {}); await page.waitForTimeout(500); }
      await page.locator('[data-section]', { hasText: 'Göbek' }).first().click(); await page.waitForTimeout(400);
      const families = await page.locator('[data-family]').allInnerTexts(); log('hub families', JSON.stringify(families.map(t => t.replace(/\n/g, ' '))));
      const family = families.map(t => t.split('\n')[0].trim()).find(t => /Göbek/i.test(t));
      const hubType = await partTypeOf(page, 'Göbek', family, '');
      log('hub', family, hubType);
      const motor = await addPart(page, 'part-wattos-mtr-480', { x: 0, z: 0 });
      // The Servo Hex hub did not seat on the motor shaft: a 5mm hex gear is used instead (same flow)
      const hubPart = await addPart(page, process.env.JOINT_GEAR ? 'shop-prb-gr-5hx-1m-5-020' : hubType, { x: 60, z: 0 });
      await R0(page, () => window.__robot.getState().deselectAll());
      await fitView(page);
      await blur(page); await page.keyboard.press('b'); await page.waitForTimeout(600);
      const hubHoles = (await partHoles(page, hubPart.id)).sort((a, b) => Math.hypot(a.p[0] - hubPart.pos[0], a.p[2] - hubPart.pos[2]) - Math.hypot(b.p[0] - hubPart.pos[0], b.p[2] - hubPart.pos[2]) || b.p[1] - a.p[1]);
      const motorHoles = (await partHoles(page, motor.id)).sort((a, b) => b.p[1] - a.p[1]);
      log('hub holes', JSON.stringify(hubHoles.slice(0, 3)), 'motor holes', JSON.stringify(motorHoles.slice(0, 3)));
      const k1 = await toScreen(page, (process.env.JOINT_GEAR ? [hubPart.pos[0], hubPart.pos[1] * 2, hubPart.pos[2] + 8] : [hubPart.pos[0] + 3, hubPart.pos[1] * 2, hubPart.pos[2] + 3])); // flat face of the gear
      log('k1', JSON.stringify(k1)); await page.mouse.click(k1.x, k1.y); await page.waitForTimeout(600);
      log('attach state', JSON.stringify(await page.evaluate(() => Object.keys(window.__tak.getState()))), await page.locator('[data-testid="tak-paneli"]').innerText().catch(() => '-'));
      await page.screenshot({ path: DBG + '/joint-attach-1.png' });
      const shaftPoint = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); const V = p.position.constructor; return new V(0, 45.2, 0).applyEuler(p.rotation).add(p.position).toArray(); }, motor.id);
      const k2 = await toScreen(page, shaftPoint);
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await page.mouse.click(k2.x, k2.y); await page.waitForTimeout(1500);
      const toast = page.getByText('Motor eklemi eklendi', { exact: false }).first();
      const shown = await toast.isVisible().catch(() => false);
      log('toast', shown, JSON.stringify(await page.evaluate(() => document.body.innerText.match(/[^\n]*(eklemi|Eşleşecek)[^\n]*/g))));
      if (!shown) { await page.screenshot({ path: DBG + '/joint-attach-no-toast.png' }); throw new Error('no notification'); }
      const gearCenter = await R0(page, (id) => { const p = window.__robot.getState().parts.find(q => q.id === id); return p.position.toArray(); }, hubPart.id);
      const k3 = await toScreen(page, gearCenter);
      await page.mouse.move(1439, 899);
      await mark(page, [{ n: 4, box: { x: k3.x - 30, y: k3.y - 30, width: 60, height: 60 } }]);
      const tb = await toast.boundingBox();
      await page.screenshot({ path: outFile('eklem-tak'), clip: crop(union(tb, { x: k3.x - 200, y: k3.y - 170, width: 400, height: 360 }), 10), animations: 'disabled' });
      await clearMarks(page);
    });
    if (['grupla-sabitle', 'grupla-coz', 'grupla-bagla', 'grupla-bagi-coz'].some(wanted)) {
      const t13 = await partTypeOf(page, 'Yapı', 'Structure', '13 delik');
      const t5 = await partTypeOf(page, 'Yapı', 'Structure', '5 delik');
      const a = await addPart(page, t13, { x: 0, z: 0 });
      const b = await addPart(page, t5, { x: 0, z: 0 });
      // place the short profile on top of the long one
      await R0(page, ({ a, b }) => { const s = window.__robot.getState(); const pa = s.parts.find(q => q.id === a); const pb = s.parts.find(q => q.id === b);
        s.updatePart(b, { position: pb.position.clone().set(pa.position.x, pa.position.y * 2 + pb.position.y, pa.position.z) }); s.deselectAll(); }, { a: a.id, b: b.id });
      await fitView(page);
      await step('grupla-sabitle', page, async () => {
        await R0(page, (ids) => window.__robot.getState().selectParts(ids), [a.id, b.id]); await page.waitForTimeout(600);
        await rightClick(b.id); await contextMenu.waitFor();
        log('menu', (await contextMenu.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 6, loc: contextMenu.locator('button, [role=menuitem]').filter({ hasText: /^\s*Sabitle/ }).first() }]);
        await capture(page, outFile('grupla-sabitle'), crop(await contextMenu.boundingBox(), 14));
        await clearMarks(page);
        await contextMenu.getByText('Sabitle', { exact: true }).first().click(); await page.waitForTimeout(1000);
      });
      await step('grupla-coz', page, async () => {
        await R0(page, (ids) => window.__robot.getState().selectParts(ids), [a.id, b.id]); await page.waitForTimeout(600);
        await rightClick(b.id); await contextMenu.waitFor();
        log('menu2', (await contextMenu.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 3, loc: contextMenu.locator('button, [role=menuitem]').filter({ hasText: /^\s*Grubu Çöz/ }).first() }]);
        await capture(page, outFile('grupla-coz'), crop(await contextMenu.boundingBox(), 14));
        await clearMarks(page);
        await contextMenu.getByText('Grubu Çöz', { exact: true }).first().click(); await page.waitForTimeout(1000);
      });
      if (['grupla-bagla', 'grupla-bagi-coz'].some(wanted)) {
        await page.keyboard.press('Escape').catch(() => {});
        await selectOne(b.id);
        const linkArea = page.locator('[data-testid="baglanti-alani"]'); await linkArea.waitFor();
        const sel = linkArea.locator('select').first();
        log('link options', JSON.stringify(await sel.locator('option').allInnerTexts()));
        await sel.selectOption({ index: 1 }); await page.locator('[data-testid="bagi-coz"]').waitFor(); await page.waitForTimeout(600);
        log('linked', (await linkArea.innerText()).replace(/\n/g, ' | '));
        await step('grupla-bagla', page, async () => {
          await mark(page, [{ n: 5, loc: linkArea }]);
          await capture(page, outFile('grupla-bagla'), crop(await linkArea.boundingBox(), 14));
          await clearMarks(page);
        });
        await step('grupla-bagi-coz', page, async () => {
          await mark(page, [{ n: 3, loc: page.locator('[data-testid="bagi-coz"]') }]);
          await capture(page, outFile('grupla-bagi-coz'), crop(await linkArea.boundingBox(), 14));
          await clearMarks(page);
        });
      }
    }
    await page.close().catch(() => {});
  }
  // ======================= Omni chassis result images (scene built via the hook) =======================
  const OMNI = ['gercege-dok-sonuc', 'gercege-dok-pencere', 'gercege-dok-eksik-ekle', 'gercege-dok-sepete-ekle', 'gercege-dok-goster', 'olc-sonuc', 'derle-panel-ac', 'derle-sonuc-ac', 'derle-sonuc', 'derle-bulgular', 'derle-fiyat-teklifi', 'parca-ekle-sonuc', 'sec-sonuc', 'tasi-sonuc', 'gezin-sonuc', 'grupla-sonuc', 'tak-sonuc', 'dosya-sonuc',
    'donanim-sonuc', 'cogalt-sonuc', 'eklem-sonuc', 'olc-genel', 'model-sonuc', 'sim-sonuc', 'sec-parcalar-sekmesi', 'tasi-coklu', 'eklem-poz', 'eklem-ozellikler', 'tak-yuz'];
  if (OMNI.some(wanted)) {
    const page = await emptyScene(browser);
    const type3 = ['parca-ekle-sonuc', 'tak-sonuc', 'tasi-sonuc', 'cogalt-sonuc'].some(wanted) ? await partTypeOf(page, 'Yapı', 'Structure', '3 delik') : null;
    await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click().catch(() => {});
    await loadOmni(page);
    const ps0 = await listParts(page);
    const typeCounts = {}; for (const p of ps0) typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    log('types', JSON.stringify(typeCounts));
    const R = (fn, arg) => page.evaluate(fn, arg);
    const clearSelection = async () => {
      await page.keyboard.press('Escape').catch(() => {});
      await R(() => { const s = window.__robot.getState(); const ids = s.parts.map(p => p.id); s.deselectAll(); });
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
      log('selected', JSON.stringify(await selectedIds(page)));
      await R((id) => window.__robot.getState().selectOnlyPart(id), added.id);
      await page.getByText('69 parça').first().waitFor();
      await captureFull('parca-ekle-sonuc');
      await R((id) => { const s = window.__robot.getState(); s.removeParts([id]); s.deselectAll(); }, added.id);
    });
    if (wanted('model-sonuc')) {
      const CUBE = process.argv[5];
      await R(() => window.__robot.getState().deselectAll());
      await menu(page, 'Dosya').click();
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('İçe aktar (STL, STEP, GLB, OBJ)...').first().click()]);
      await fc.setFiles(CUBE);
      await page.getByText(/kup eklendi/).first().waitFor({ timeout: 150000 }); log('added notification seen');
      await step('model-sonuc', page, async () => {
        const ps = await listParts(page); const k = ps[ps.length - 1];
        await R((id) => { const s = window.__robot.getState(); const p = s.parts.find(q => q.id === id);
          const mx = Math.max(...s.parts.filter(q => q.id !== id).map(q => q.position.x));
          s.updatePart(id, { position: p.position.clone().set(mx + 140, p.position.y, p.position.z) }); s.selectOnlyPart(id); }, k.id);
        await captureFull('model-sonuc');
        await clearSelection();
      });
    }
    await step('sim-sonuc', page, async () => {
      await menu(page, 'Dosya').click();
      const [simPage] = await Promise.all([page.context().waitForEvent('page', { timeout: 90000 }), page.getByRole('menuitem', { name: "Sim'de dene" }).click()]);
      simPage.setDefaultTimeout(90000);
      await simPage.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
      await simPage.waitForLoadState('load'); log('sim url', simPage.url());
      await simPage.locator('canvas').first().waitFor(); await simPage.waitForTimeout(6000);
      await simPage.getByRole('button', { name: /Anladım, devam et/ }).click({ timeout: 20000 }).catch(e => log('no devnote', e.message.split('\n')[0]));
      await simPage.waitForTimeout(4000);
      log('sim text', (await simPage.evaluate(() => document.body.innerText.slice(0, 600))).replace(/\n/g, ' | '));
      await simPage.mouse.move(1439, 899); await simPage.waitForTimeout(500);
      await capture(simPage, outFile('sim-sonuc'), FULL);
    });
    await step('sec-parcalar-sekmesi', page, async () => {
      await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click(); await page.waitForTimeout(500);
      const kit = page.locator('[data-kit-row]').first();
      log('kit row', (await kit.innerText()).replace(/\n/g, ' | '));
      await kit.locator('[aria-label="Parçalarını göster"], [title="Parçalarını göster"]').first().click({ timeout: 10000 }).catch(e => log('no arrow button', e.message.split('\n')[0]));
      const search = page.locator('input[placeholder="Parçalarda ara..."]');
      await search.fill('teker'); await page.waitForTimeout(1500);
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
      await page.locator('.dv-tab', { hasText: 'Parçalar' }).first().click(); await page.waitForTimeout(500);
      await page.locator('[data-kit-row]').first().click();
      await page.getByText('68 seçili').first().waitFor({ timeout: 60000 });
      await page.locator('button[title="Taşı (T / M)"]').click(); await page.waitForTimeout(2000);
      const center = await R(() => { const ps = window.__robot.getState().parts; const s = window.__robot.getState().selectedPartIds; const q = ps.filter(p => s.includes(p.id));
        const a = [0, 1, 2].map(i => q.reduce((t, p) => t + p.position.toArray()[i], 0) / q.length); return a; });
      const k = await toScreen(page, center); log('center', JSON.stringify(center), JSON.stringify(k));
      await waitToastsGone(page); await page.mouse.move(1439, 899); await page.waitForTimeout(2000);
      await page.screenshot({ path: DBG + '/move-multi-raw.png' });
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
      log('new', JSON.stringify(added));
      if (!added) throw new Error('could not add part (type?)');
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
      log('target', target.id, JSON.stringify(hp));
      await blur(page); await page.keyboard.press('b'); await page.locator('[data-testid="tak-paneli"]').waitFor();
      const kp = [added.pos[0] + 15, added.pos[1] * 2, added.pos[2]];
      const k1 = await toScreen(page, kp), k2 = await toScreen(page, hp);
      log('screen', JSON.stringify([k1, k2]));
      await page.keyboard.down('Shift'); await page.mouse.click(k1.x, k1.y); await page.keyboard.up('Shift'); await page.waitForTimeout(800);
      log('panel1', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '));
      await page.keyboard.down('Shift'); await page.mouse.click(k2.x, k2.y); await page.keyboard.up('Shift'); await page.waitForTimeout(1500);
      const finalPos = await R((id) => window.__robot.getState().parts.find(q => q.id === id).position.toArray(), added.id);
      log('final position', JSON.stringify(finalPos), 'panel2', (await page.locator('[data-testid="tak-paneli"]').innerText()).replace(/\n/g, ' | '));
      await waitToastsGone(page, 8000); await page.mouse.move(1439, 899); await page.waitForTimeout(1500);
      const structHoles = await partHoles(page, added.id); const structMid = [0, 1, 2].map(j => structHoles.reduce((t, h) => t + h.p[j], 0) / structHoles.length); log('structure middle', JSON.stringify(structMid));
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
      await page.getByText('2 seçili').first().waitFor();
      await captureFull('sec-sonuc');
      await clearSelection();
    });
    await step('tasi-sonuc', page, async () => {
      const str = ps0.filter(p => /str-c1/.test(p.type)).sort((a, b) => b.pos[2] - a.pos[2])[0];
      await R((id) => window.__robot.getState().selectOnlyPart(id), str.id);
      await page.locator('button[title="Taşı (T / M)"]').click();
      await captureFull('tasi-sonuc');
      await clearSelection();
    });
    await step('gezin-sonuc', page, async () => {
      // top face of the view cube
      await page.mouse.click(1100, 150); await page.waitForTimeout(3000);
      await captureFull('gezin-sonuc');
    });
    await step('grupla-sonuc', page, async () => {
      const pair = ps0.filter(p => /str-c1/.test(p.type)).slice(0, 2).map(p => p.id);
      await R((ids) => { const s = window.__robot.getState(); s.selectParts(ids); s.groupSelected(); s.selectParts(ids); }, pair);
      log('group', JSON.stringify(await R(() => window.__robot.getState().parts.filter(p => p.groupId).map(p => p.id + ':' + p.groupId).slice(0, 4))));
      await captureFull('grupla-sonuc');
      await clearSelection();
    });
    await step('tak-sonuc', page, async () => {
      const added = await addStructure();
      await page.locator('button[title^="Tak"]').first().click(); await page.waitForTimeout(500);
      const targets = ps0.filter(p => p.type.includes('str')).map(p => p.id);
      log('attach', JSON.stringify(await attachToHighest(page, added.id, targets)));
      await page.locator('[data-testid="tak-paneli"]').waitFor();
      await captureFull('tak-sonuc');
    });
    await step('dosya-sonuc', page, async () => {
      await R(() => { const s = window.__robot.getState(); s.setProjectName('ilk robot'); s.deselectAll(); });
      await menu(page, 'Dosya').click(); await page.getByText('Kaydet (JSON indir)').first().waitFor();
      await captureFull('dosya-sonuc');
      await page.keyboard.press('Escape');
    });
    await step('cogalt-sonuc', page, async () => {
      const added = await addStructure({ x: 330, z: 0 });
      await page.waitForTimeout(1500);
      await R((id) => window.__robot.getState().mirrorParts([id], 'x', 'orijin'), added.id);
      await page.waitForFunction((n) => window.__robot.getState().parts.length === n, ps0.length + 2);
      const ps = await listParts(page); log('mirror', JSON.stringify(ps.slice(-2)));
      await R((ids) => window.__robot.getState().selectParts(ids), ps.slice(-2).map(p => p.id));
      await menu(page, 'Görünüm').click(); await page.getByText('Sığdır', { exact: true }).first().click(); await page.waitForTimeout(3000);
      await captureFull('cogalt-sonuc');
      await R((ids) => { const s = window.__robot.getState(); s.removeParts(ids); s.deselectAll(); }, ps.slice(-2).map(p => p.id));
    });
    if (['eklem-poz', 'eklem-ozellikler'].some(wanted)) {
      if (!wanted('eklem-poz')) await panCamera(page, 4000); // only the panel is captured: move the robot out of frame so the scene renders lighter
      await page.locator('button[title^="Hareket"]').first().click();
      const hp = page.locator('[data-testid="hareket-paneli"]'); await hp.waitFor();
      log('motion', (await hp.innerText()).replace(/\n/g, ' | ').slice(0, 500));
      await step('eklem-poz', page, async () => {
        const sliders = hp.locator('[data-testid="hareket-kaydirici"]'); log('slider count', await sliders.count());
        const slider = sliders.nth(4); // first "Altıgen Mil 5mm 45 mm" (Motor · continuous) row
        await slider.fill('90'); await page.waitForTimeout(3000);
        log('value', await slider.inputValue());
        await blur(page);
        await mark(page, [{ n: 1, loc: slider }, { n: 3, loc: page.locator('[data-testid="hareket-kaydet"]') }]);
        const pb = await hp.boundingBox();
        await capture(page, outFile('eklem-poz'), crop(pb, 14));
        await clearMarks(page);
      });
      await step('eklem-ozellikler', page, async () => {
        const name = hp.getByText('Altıgen Mil 5mm 45 mm').first();
        await name.click(); const jointArea = page.locator('[data-testid="eklem-alani"]'); await jointArea.waitFor({ timeout: 60000 });
        log('joint area', (await jointArea.innerText()).replace(/\n/g, ' | '));
        const kind = page.locator('[data-testid="eklem-turu"]');
        log('type options', JSON.stringify(await kind.locator('option').allInnerTexts().catch(() => [])));
        await kind.selectOption({ label: 'Sınırlı dönüş' }); await page.waitForTimeout(500);
        const mn = page.locator('[data-testid="eklem-min"]'), mx = page.locator('[data-testid="eklem-max"]');
        await mn.fill('-90'); await mn.press('Enter'); await page.waitForTimeout(300);
        await mx.fill('90'); await mx.press('Enter'); await page.waitForTimeout(300);
        await blur(page);
        log('joint area2', (await jointArea.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 5, loc: kind }, { n: 6, box: union(await mn.boundingBox(), await mx.boundingBox()) }]);
        await capture(page, outFile('eklem-ozellikler'), crop(await jointArea.boundingBox(), 14));
        await clearMarks(page);
      });
    }
    await step('eklem-sonuc', page, async () => {
      await page.locator('button[title^="Hareket"]').first().click();
      await page.locator('[data-testid="hareket-paneli"]').waitFor();
      const jointed = await R(() => window.__robot.getState().parts.filter(p => p.eklem && p.ebeveyn).map(p => ({ id: p.id, type: p.type, joint: p.eklem })));
      log('jointed', JSON.stringify(jointed).slice(0, 800));
      await panCamera(page, 70);
      await page.locator('[data-testid="hareket-oynat"]').click(); await page.waitForTimeout(2500);
      log('panel', (await page.locator('[data-testid="hareket-paneli"]').innerText()).replace(/\n/g, ' | ').slice(0, 600));
      await captureFull('eklem-sonuc');
      if (wanted('eklem-oynat')) {
        const pb = await page.locator('[data-testid="hareket-paneli"]').boundingBox();
        await mark(page, [{ n: 3, loc: page.locator('[data-testid="hareket-hiz"]') }, { n: 4, loc: page.locator('[data-testid="hareket-oynat"]') }]);
        await capture(page, outFile('eklem-oynat'), crop({ x: pb.x - 10, y: pb.y - 10, width: pb.width + 140, height: pb.height + 20 }));
        await clearMarks(page);
        log('OK eklem-oynat');
      }
    });
    // --- Build (Derleme) panel ---
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
      await menu(page, 'Görünüm').click(); await page.getByText('PANELLER').first().waitFor();
      await step('derle-panel-ac', page, async () => {
        const it = page.getByRole('menuitemcheckbox', { name: 'Derleme' });
        const m = await page.locator('[role=menu]').first().boundingBox();
        await mark(page, [{ n: 1, loc: it }]);
        await capture(page, outFile('derle-panel-ac'), crop({ x: m.x - 8, y: 40, width: m.width + 16, height: m.y + m.height + 8 - 40 }));
        await clearMarks(page);
      });
      await page.getByRole('menuitemcheckbox', { name: 'Derleme' }).click(); await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Derle', exact: true }).first().click();
      await page.getByText('Yeniden derle').first().waitFor({ timeout: 120000 });
      await page.waitForTimeout(1500);
      phaseBoxes = await page.evaluate(() => { const r = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/\(Faz \d\)/.test(n.textContent)) { const rg = document.createRange(); rg.selectNodeContents(n); const b = rg.getBoundingClientRect(); r.push({ t: n.textContent, x: b.x, y: b.y, width: b.width, height: b.height }); } return r; });
      log('phase', JSON.stringify(phaseBoxes));
      const buildTabBox = await page.locator('.dv-tab', { hasText: 'Derleme' }).first().boundingBox();
      log('build tab', JSON.stringify(buildTabBox));
      log('build text', (await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.children.length < 50 && /Yeniden derle/.test(x.innerText || '') && x.innerText.length < 3000 && x.querySelector('button')); return e ? e.innerText : '-'; })).replace(/\n/g, ' | ').slice(0, 1200));
    }
    await step('derle-sonuc-ac', page, async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(2000);
      let clip = FULL;
      if (phaseBoxes && phaseBoxes.length) {
        const f = phaseBoxes[0];
        clip = f.x > 720 ? { x: 0, y: 0, width: Math.floor(f.x - 4), height: 900 } : FULL;
      }
      await capture(page, outFile('derle-sonuc-ac'), clip);
    });
    const buildPanelCrop = async () => {
      const t = await page.locator('.dv-tab', { hasText: 'Derleme' }).first().boundingBox();
      return crop({ x: t.x - 2, y: t.y - 2, width: 1440 - t.x + 2, height: 900 - t.y + 2 });
    };
    await step('derle-sonuc', page, async () => {
      const statusRow = page.getByText(/^Derleme (başarısız|başarılı)$|^Uyarılarla derlendi$/).first().locator('..');
      const countRow = page.getByText('çarpışma', { exact: true }).first().locator('../..');
      await mark(page, [{ n: 2, loc: statusRow }, { n: 3, loc: countRow }]);
      await capture(page, outFile('derle-sonuc'), await buildPanelCrop());
      await clearMarks(page);
    });
    await step('derle-fiyat-teklifi', page, async () => {
      await mark(page, [{ n: 1, loc: page.getByRole('button', { name: 'Fiyat teklifi al' }) }]);
      await capture(page, outFile('derle-fiyat-teklifi'), await buildPanelCrop());
      await clearMarks(page);
    });
    await step('derle-bulgular', page, async () => {
      // The ready-made Omni şasi builds without findings: one chassis profile is moved away ("Ayrık grup")
      // before the build (see moveAway above), the finding row is captured, then the profile goes back.
      if (!movedAway) {
        await moveAway(); await page.waitForTimeout(1500);
        await page.getByRole('button', { name: 'Yeniden derle' }).first().click();
      }
      await page.getByText(/Ayrık grup/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1500);
      const row = page.getByText(/seçmek için tıkla/).first().locator('..');
      await mark(page, [{ n: 1, loc: row }]);
      await capture(page, outFile('derle-bulgular'), await buildPanelCrop());
      await clearMarks(page);
      await moveBack(); await page.waitForTimeout(1000);
    });
    // --- Measure: top view, two holes ---
    if (['olc-genel', 'olc-sonuc'].some(wanted)) {
      await page.mouse.click(1100, 150); await page.waitForTimeout(2500);   // TOP face of the cube
      await page.locator('button[title^="Ölç"]').first().click();
      await page.getByText('Ölçmek için ilk noktaya tıkla').first().waitFor();
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
      log('holes', JSON.stringify(holePair));
      const n1 = await toScreen(page, holePair[0].p), n2 = await toScreen(page, holePair[1].p);
      log('screen', JSON.stringify([n1, n2]));
      await page.mouse.move(n1.x, n1.y); await page.waitForTimeout(800); await page.mouse.click(n1.x, n1.y);
      await page.getByText('İkinci noktaya tıkla').first().waitFor();
      await page.mouse.move(n2.x, n2.y); await page.waitForTimeout(800); await page.mouse.click(n2.x, n2.y);
      await page.getByText('ΔX').first().waitFor();
      await page.waitForTimeout(1500);
      const panel = page.getByText('Ölçüm', { exact: true }).first().locator('xpath=ancestor::div[2]');
      log('measure panel', (await panel.innerText()).replace(/\n/g, ' | '));
      await step('olc-genel', page, async () => { await captureFull('olc-genel'); });
      await step('olc-sonuc', page, async () => {
        const pb = await panel.boundingBox();
        await mark(page, [{ n: 3, box: { x: n2.x - 14, y: n2.y - 14, width: 28, height: 28 } }]);
        await capture(page, outFile('olc-sonuc'), crop(union(pb, { x: Math.min(n1.x, n2.x) - 120, y: Math.min(n1.y, n2.y) - 90, width: Math.abs(n1.x - n2.x) + 240, height: Math.abs(n1.y - n2.y) + 180 }), 10));
        await clearMarks(page);
      });
    }
    // --- Gerçeğe dök (Make it real) dialog ---
    if (['gercege-dok-sonuc', 'gercege-dok-pencere', 'gercege-dok-eksik-ekle', 'gercege-dok-sepete-ekle', 'gercege-dok-goster'].some(wanted)) {
      if (wanted('gercege-dok-goster')) {
        // move a chassis part away from the robot
        const str = ps0.filter(p => /str-c1-0113/.test(p.type))[0];
        await R(({ id, pos }) => { const s = window.__robot.getState(); const p = s.parts.find(q => q.id === id); s.updatePart(id, { position: p.position.clone().set(pos[0] + 500, pos[1], pos[2]) }); }, { id: str.id, pos: str.pos });
        await page.waitForTimeout(1500);
      }
      await page.getByRole('button', { name: /Gerçeğe dök/ }).or(page.getByRole('link', { name: /Gerçeğe dök/ })).first().click();
      await page.getByText('Robot kontrolü', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => {});
      await page.getByText(/Sepete ekle ve mağazaya git \(/).first().waitFor({ timeout: 120000 });
      await page.waitForFunction(() => !/Robot kontrol ediliyor/.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const dlg = page.locator('[role="dialog"]').first();
      const dialogCrop = async () => { const b = await page.evaluate(() => { let e = document.querySelector('[data-ftc-kontrol]'); while (e && e.parentElement) { const r = e.getBoundingClientRect(); if (r.width > 560 && r.height > 600) return { x: r.x, y: r.y, width: r.width, height: r.height }; e = e.parentElement; } return null; }); return crop(b, 6); };
      await step('gercege-dok-sonuc', page, async () => { await captureFull('gercege-dok-sonuc'); });
      await step('gercege-dok-pencere', page, async () => {
        await mark(page, [{ n: 3, loc: page.locator('[data-ftc-kontrol]') }]);
        await capture(page, outFile('gercege-dok-pencere'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-eksik-ekle', page, async () => {
        await mark(page, [{ n: 1, loc: page.getByText('Eksik parçaları ekle').first() }]);
        await capture(page, outFile('gercege-dok-eksik-ekle'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-sepete-ekle', page, async () => {
        await mark(page, [{ n: 1, loc: page.getByText(/Sepete ekle ve mağazaya git/).first() }]);
        await capture(page, outFile('gercege-dok-sepete-ekle'), await dialogCrop());
        await clearMarks(page);
      });
      await step('gercege-dok-goster', page, async () => {
        const g = page.locator('[data-ftc-sorun="floating"]').getByText('göster').first();
        await mark(page, [{ n: 2, loc: g }]);
        const kb = await page.locator('[data-ftc-kontrol]').boundingBox();
        await capture(page, outFile('gercege-dok-goster'), crop(kb, 10));
        await clearMarks(page);
      });
    }
    await step('donanim-sonuc', page, async () => {
      const mot = ps0.filter(p => /rev-41|motor|mtr/.test(p.type))[0];
      log('motor', JSON.stringify(mot));
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
  }
} finally { await browser.close(); }
