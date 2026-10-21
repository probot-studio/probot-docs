// English Builder docs: screenshots, group 2 of 3 (builder-gezin-fare ... builder-olc-liste, alphabetical).
// Opens prod in English (?dil=en, locale en-US) and repeats the recipes of the Turkish scripts in
// tools/builder/capture (capture-base, capture-a, capture-night, capture-dev) with the same file names.
//
// Usage: PW_WS=<playwright run-server ws address> node capture-2.mjs <img-dir> <image,...> [debug-dir] [sample.stl]
// (the ws address carries a credential: it is read only from the environment, never written to the script or the log).
// Image name filter: only the listed images are captured (name = file name without "builder-" and ".png").
// sample.stl: 40 mm cube named kup.stl, Z up (model-* images). Run from a folder where Playwright is installed.
// Heavy job: on a shared machine, hold the browser lock; keep each run short (split by image name).
// Afterwards: python3 tools/builder/capture/shrink.py <img-dir>/*.png, then copy into tools/en/builder/img.
import { chromium } from 'playwright';
import fs from 'fs';
import { mark, clearMarks, capture, toScreen, listParts, partHoles } from '../../../builder/capture/lib.mjs';
const URL = 'https://probotstudio.com/builder/?dil=en';
const IMG = process.argv[2];
const REQUESTED = (process.argv[3] || '').split(',').filter(Boolean);
const DBG = process.argv[4] || IMG;
const CUBE = process.argv[5];
const wanted = (name) => REQUESTED.includes(name);
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
const FULL = { x: 0, y: 0, width: 1440, height: 900 };
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
// Dock tab by its title; anchored at the start so "Parts" does not match "Add parts"
const tab = (page, name) => page.locator('.dv-tab').filter({ hasText: new RegExp('^\\s*' + esc(name)) }).first();
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
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
const R0 = (page, fn, arg) => page.evaluate(fn, arg);

// --- Page setup in English (lib.mjs prepares the Turkish interface) ---
// Dismiss the intro / cookie notices and disable animations and floating widgets.
async function dismissNotices(page) {
  const intro = page.getByRole('button', { name: 'Got it, continue' });
  if (await intro.count()) { try { await intro.first().click({ timeout: 3000 }); } catch {} }
  // The site cookie banner shows up a moment after load; it is still Turkish in the English interface
  await page.getByRole('button', { name: /^(Only necessary|Sadece zorunlu)$/ }).first().click({ timeout: 6000 }).catch(() => {});
  await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    probot-devnote,.probot-consent,[class*="whatsapp"],a[href*="wa.me"]{display:none!important}` });
  await page.waitForTimeout(300);
}
// Fresh context + page with the store hooks of the production bundle (__PROBOT_TEST__); clean = clear localStorage first.
async function prepare3d(browser, { clean = true, dsf = 1 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf, locale: 'en-US', reducedMotion: 'reduce', acceptDownloads: true });
  ctx.setDefaultTimeout(120000);
  const page = await ctx.newPage();
  await page.addInitScript(({ clean }) => { window.__PROBOT_TEST__ = true; if (clean) { try { localStorage.clear(); } catch {} } }, { clean });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => !!window.__robot && !!window.__controls?.current, null, { timeout: 60000 });
  await dismissNotices(page);
  return { ctx, page };
}
// Plain page without the store hooks (the recipes of capture-dev.mjs)
async function prepare(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'en-US', reducedMotion: 'reduce' });
  ctx.setDefaultTimeout(20000);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 150000 });
  await dismissNotices(page);
  await page.waitForTimeout(1500);
  return { ctx, page };
}

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
// Part type of an option in the Add parts tab (read from the DOM); section = data-section value
async function partTypeOf(page, section, family, option) {
  await tab(page, 'Add parts').click().catch(() => {});
  for (let i = 0; i < 5; i++) {
    if (await page.locator('[data-section]').count()) break;
    const g = page.locator('[data-family-back], [data-section-back]').first();
    if (await g.count()) await g.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.locator(`[data-section="${section}"]`).first().click(); await page.waitForTimeout(300);
  if (family) { await page.locator('[data-family]', { hasText: family }).first().click(); await page.waitForTimeout(300); }
  const row = page.locator(family ? '[data-family-folder] [data-part-type]' : '[data-section-open] [data-part-type]')
    .filter({ hasText: new RegExp('^\\s*' + esc(option)) }).first();
  return row.getAttribute('data-part-type');
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
// Box around one group (heading + its options) in the View menu
async function groupBox(page, heading, n) {
  const m = page.locator('[role=menu]').first();
  const lab = m.getByText(heading, { exact: true }).first();
  const lb = await lab.boundingBox();
  const items = await m.locator('[role=menuitemradio],[role=menuitemcheckbox]').evaluateAll((es, y) =>
    es.map(e => e.getBoundingClientRect()).filter(r => r.top > y).map(r => ({ x: r.x, y: r.y, width: r.width, height: r.height })), lb.y);
  const picked = items.slice(0, n);
  const mb = await m.boundingBox();
  const u = union(lb, ...picked);
  return { x: mb.x + 3, y: u.y - 1, width: mb.width - 6, height: u.height + 2 };
}
// The Measure panel. In English the toolbar button and the panel title both read "Measure":
// take the title nearest to the panel's close button, then its ancestor::div[2] as the Turkish script does.
const measurePanel = (page) => page.locator('xpath=(//*[@title="Close measure (Esc)"]/ancestor::div[.//*[normalize-space(text())="Measure"]][1]//*[normalize-space(text())="Measure"])[1]/ancestor::div[2]').first();
const fitView = async (page) => { try { await menu(page, 'View').click(); await page.getByText('Fit view', { exact: true }).first().click(); await page.waitForTimeout(2500); } catch (e) { log('fit view error', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); } };
const addPart = async (page, kind, at) => {
  const n = (await listParts(page)).length;
  await R0(page, ({ t, at }) => window.__robot.getState().addPartOfType(t, at), { t: kind, at });
  await page.waitForFunction((n) => window.__robot.getState().parts.length > n, n); await page.waitForTimeout(1200);
  const ps = await listParts(page); return ps[ps.length - 1];
};

// A failed connect error can quote the ws address; print a fixed message instead
const browser = await chromium.connect(process.env.PW_WS).catch(() => {
  console.error('cannot connect to the Playwright server in PW_WS');
  process.exit(1);
});
try {
  // ======================= Empty scene: start screen, card, catalog (capture-base, capture-a "bos") =======================
  if (['ilk-acilis', 'ilk-omni-sasi-karti', 'hazir-bos-sahne-karti', 'hazir-katalog'].some(wanted)) {
    const page = await emptyScene(browser);
    await step('ilk-acilis', page, async () => { await capture(page, outFile('ilk-acilis'), FULL); });
    await step('ilk-omni-sasi-karti', page, async () => {
      await mark(page, [{ n: 1, loc: page.locator('[data-bos-sahne-robot="omni-sasi"]') }]);
      await capture(page, outFile('ilk-omni-sasi-karti'), { x: 420, y: 320, width: 640, height: 370 });
      await clearMarks(page);
    });
    await step('hazir-bos-sahne-karti', page, async () => {
      await mark(page, [{ n: 2, loc: page.locator('[data-bos-sahne-robot="omni-sasi"]') }]);
      const k = await page.locator('[data-bos-sahne-karti]').boundingBox();
      await capture(page, outFile('hazir-bos-sahne-karti'), { x: k.x - 24, y: k.y - 24, width: k.width + 48, height: k.height + 48 });
      await clearMarks(page);
    });
    await step('hazir-katalog', page, async () => {
      await tab(page, 'Robot catalog').click(); await page.waitForTimeout(800);
      const search = page.locator('input[placeholder="Search robots..."]');
      await search.click(); await search.fill('wattos'); await page.waitForTimeout(800);
      await search.blur();
      const card = page.locator('[data-robot-yukle="wattos-mekanum-sasi"]');
      await mark(page, [{ n: 2, loc: search }, { n: 3, loc: card, at: 'r' }]);
      const p = await page.locator('[data-catalog-panel]').boundingBox();
      const kb = await card.boundingBox();
      // start at the top of the panel tab row (108): higher up, the bottom of the toolbar buttons shows as an orange strip
      const top = Math.max(108, p.y - 34);
      await capture(page, outFile('hazir-katalog'), { x: p.x, y: top, width: p.width, height: Math.min(kb.y + kb.height + 40, p.y + p.height) - top });
      await clearMarks(page); await search.fill('');
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Omni chassis: view cube at scale 2 (the Turkish image is 2x as well) =======================
  if (wanted('ilk-gorunum-kupu')) {
    const { page, ctx } = await prepare3d(browser, { dsf: 2 }); page.setDefaultTimeout(60000);
    await page.waitForTimeout(1500);
    await loadOmni(page);
    await step('ilk-gorunum-kupu', page, async () => {
      await page.mouse.move(1439, 899); await page.waitForTimeout(500);
      await mark(page, [{ n: 4, box: { x: 1078, y: 132, width: 46, height: 34 }, pad: 2 }]);
      // around the cube only: at scale 1 the TOP label is hard to read, at scale 2 it is clear
      await capture(page, outFile('ilk-gorunum-kupu'), { x: 980, y: 108, width: 190, height: 140 });
      await clearMarks(page);
    });
    await ctx.close().catch(() => {});
  }
  // ======================= Omni chassis: add and mate a Structure, save (capture-base) =======================
  if (['ilk-structure-ekle', 'ilk-tak-sonuc', 'ilk-kaydet'].some(wanted)) {
    const page = await emptyScene(browser);
    await loadOmni(page);
    {
      // Add a Structure
      await page.getByText('Add parts', { exact: true }).first().click();
      await page.locator('[data-section="shop-yapi"]').click();
      await page.locator('[data-family][title="Open Structure options"]').first().click();
      await page.waitForTimeout(600);
      const rows = page.locator('[data-family-folder] [data-part-type]');
      const before = (await listParts(page)).length;
      const target = rows.nth(2);
      await step('ilk-structure-ekle', page, async () => {
        await mark(page, [{ n: 3, loc: target }]);
        await capture(page, outFile('ilk-structure-ekle'), { x: 0, y: 108, width: 320, height: 420 });
        await clearMarks(page);
      });
      await target.click();
      await page.waitForFunction((n) => window.__robot.getState().parts.length > n, before);
      await page.waitForTimeout(2500);
      await step('ilk-tak-sonuc', page, async () => {
        const ps = await listParts(page);
        const added = ps[ps.length - 1];
        await page.keyboard.press('b'); await page.waitForTimeout(500);
        // source: a hole of the new part; target: the highest hole on the chassis
        const srcHoles = await partHoles(page, added.id);
        const k = await toScreen(page, srcHoles[0].p);
        await page.mouse.click(k.x, k.y); await page.waitForTimeout(800);
        let best = null;
        for (const p of ps.slice(0, -1).filter(q => q.type.includes('str'))) {
          for (const h of await partHoles(page, p.id)) if (!best || h.p[1] > best.p[1]) best = h;
        }
        const h = await toScreen(page, best.p);
        await page.mouse.click(h.x, h.y); await page.waitForTimeout(3000);
        await capture(page, outFile('ilk-tak-sonuc'), { x: 310, y: 108, width: 860, height: 600 });
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      });
      await step('ilk-kaydet', page, async () => {
        await page.locator('button[title="Rename the project"]').click();
        await page.keyboard.press('Control+A'); await page.keyboard.type('first robot'); await page.keyboard.press('Enter');
        await menu(page, 'File').click(); await page.waitForTimeout(400);
        await mark(page, [{ n: 3, loc: page.getByText('Save (download JSON)') }]);
        await capture(page, outFile('ilk-kaydet'), { x: 0, y: 40, width: 420, height: 200 });
        await clearMarks(page); await page.keyboard.press('Escape');
      });
    }
    await page.context().close().catch(() => {});
  }
  // ======================= Omni chassis: navigation and Parts row (capture-a "omni1,omni2") =======================
  if (['gezin-gorunum-kupu', 'gezin-gorunum-menusu', 'hazir-parcalar-satiri', 'gezin-ortala', 'gezin-fare'].some(wanted)) {
    const { page } = await prepare3d(browser);
    await loadOmni(page); log('omni loaded');
    await step('gezin-gorunum-kupu', page, async () => {
      await mark(page, [{ n: 2, box: { x: 1078, y: 132, width: 46, height: 34 }, pad: 2 }]);
      await capture(page, outFile('gezin-gorunum-kupu'), { x: 990, y: 110, width: 180, height: 140 });
      await clearMarks(page);
    });
    await step('gezin-gorunum-menusu', page, async () => {
      await menu(page, 'View').click(); await page.waitForTimeout(500);
      await mark(page, [
        // badges on the right corners: the group headings start at the left corner
        { n: 2, box: await groupBox(page, 'Mouse controls', 3), pad: 0, at: 'tr' },
        { n: 3, box: await groupBox(page, 'Camera', 2), pad: 0, at: 'tr' },
        { n: 4, box: await groupBox(page, 'Outline', 3), pad: 0, at: 'tr' }]);
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, outFile('gezin-gorunum-menusu'), { x: mb.x - 20, y: mb.y - 34, width: mb.width + 40, height: mb.height + 50 });
      await clearMarks(page); await page.keyboard.press('Escape');
    });
    await step('hazir-parcalar-satiri', page, async () => {
      await tab(page, 'Parts').click(); await page.waitForTimeout(800);
      const row = page.locator('[data-kit-row]').first();
      log('kit row', (await row.innerText()).replace(/\n/g, ' | '));
      await row.click(); await page.waitForTimeout(800);
      const expand = page.locator('[data-kit-ac]').first();
      await expand.click(); await page.waitForTimeout(1500);
      log('expand after', await expand.getAttribute('title'), await expand.getAttribute('aria-label'));
      const rb = await row.boundingBox(); const ab = await expand.boundingBox();
      await mark(page, [{ n: 3, loc: expand, pad: 1 }, { n: 2, box: { x: ab.x + ab.width + 10, y: rb.y, width: rb.x + rb.width - (ab.x + ab.width + 10), height: rb.height }, pad: 2 }]);
      await capture(page, outFile('hazir-parcalar-satiri'), { x: 0, y: rb.y - 104, width: rb.x + rb.width + 12, height: 340 });
      await clearMarks(page);
    });
    await step('gezin-ortala', page, async () => {
      const ps = await listParts(page);
      const wheels = ps.filter(p => /whl|teker/i.test(p.type));
      await page.evaluate(() => window.__robot.getState().deselectAll()); await page.keyboard.press('Escape'); await page.waitForTimeout(800);
      const scale = Math.max(...ps.map(p => Math.abs(p.pos[0]))) > 5 ? 1 : 0.001; // mm or m
      const offsets = [[0, 40, 0], [0, -30, 0], [40, 0, 0], [-40, 0, 0], [0, 0, 40], [0, 0, -40]];
      const points = wheels.flatMap(t => offsets.map(d => ({ t, p: t.pos.map((v, i) => v + d[i] * scale) })));
      // project every candidate in one round trip: the 3D scene makes each page call slow
      const screen = await page.evaluate((ps) => {
        const cam = window.__controls.current.object; cam.updateMatrixWorld();
        const V = cam.position.constructor; const c = document.querySelector('canvas').getBoundingClientRect();
        return ps.map(p => { const v = new V(p[0], p[1], p[2]).project(cam); return { x: c.left + (v.x + 1) / 2 * c.width, y: c.top + (1 - v.y) / 2 * c.height }; });
      }, points.map(q => q.p));
      const candidates = points.map((q, i) => ({ t: q.t, e: screen[i] }))
        .filter(({ e }) => e.x > 340 && e.x < 1140 && e.y > 140 && e.y < 860);
      candidates.sort((a, b) => b.e.y - a.e.y);
      let hit = null;
      for (const a of candidates.slice(0, 6)) {
        await page.mouse.click(a.e.x, a.e.y, { button: 'right' }); await page.waitForTimeout(1200);
        const header = await page.getByText('Focus', { exact: true }).first().evaluate(el => { let m = el; for (let i = 0; i < 6 && m; i++) { if (m.innerText && /\n/.test(m.innerText) && m.innerText.includes('Delete')) break; m = m.parentElement; } return m ? m.innerText.split('\n')[0] : ''; }).catch(() => '');
        log('right click', a.t.type, header);
        if (/wheel/i.test(header)) { hit = a; break; }
        await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll()); await page.waitForTimeout(600);
      }
      if (!hit) throw new Error('right click on a wheel did not register');
      const o = page.getByText('Focus', { exact: true }).first();
      await mark(page, [{ n: 2, loc: o, pad: 3 }]);
      const ob = await o.boundingBox();
      const cx = Math.max(310, Math.min(hit.e.x - 140, ob.x - 60)), cy = Math.max(108, Math.min(hit.e.y - 120, ob.y - 220));
      const clip = { x: cx, y: cy, width: Math.min(560, 1440 - cx), height: Math.min(520, 900 - cy) };
      await capture(page, outFile('gezin-ortala'), clip);
      await clearMarks(page); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    });
    await step('gezin-fare', page, async () => {
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      // orbit with the right button, zoom with the wheel (real mouse input)
      const c = await page.locator('canvas').first().boundingBox();
      const cx = c.x + c.width / 2, cy = c.y + c.height / 2;
      await page.mouse.move(cx, cy); await page.mouse.down({ button: 'right' });
      for (let i = 1; i <= 20; i++) await page.mouse.move(cx - i * 4, cy + i * 0.5);
      await page.mouse.up({ button: 'right' }); await page.waitForTimeout(1500);
      await page.mouse.move(cx, cy);
      for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(200); }
      await page.waitForTimeout(3000);
      await capture(page, outFile('gezin-fare'), { x: c.x, y: c.y, width: c.width, height: c.height });
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Omni chassis, result scenes built via the hook (capture-night) =======================
  if (['hazir-sonuc', 'ilk-sonuc'].some(wanted)) {
    const page = await emptyScene(browser);
    const type3 = wanted('ilk-sonuc') ? await partTypeOf(page, 'shop-yapi', 'Structure', '3 holes') : null;
    log('type3', type3);
    await tab(page, 'Parts').click().catch(() => {});
    await loadOmni(page);
    await step('hazir-sonuc', page, async () => {
      await page.getByText('68 parts').first().waitFor();
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
      log('attach', JSON.stringify(await attachToHighest(page, added.id, targets)));
      await page.evaluate(() => { window.__robot.getState().setProjectName('first robot'); window.__robot.getState().deselectAll(); });
      await page.getByText('first robot').first().waitFor();
      await waitToastsGone(page); await page.waitForTimeout(3000);
      await capture(page, outFile('ilk-sonuc'), FULL);
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Belt: empty scene, two pulleys (capture-night) =======================
  if (['kayis-kasnaklar', 'kayis-ekle', 'kayis-sonuc', 'kayis-bilgi', 'kayis-sil'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await tab(page, 'Add parts').click();
    const search = page.locator('input[placeholder="Search parts..."]');
    await search.fill('25T'); await page.waitForTimeout(800);
    const row = page.locator('[data-part-type]').filter({ hasText: 'Pulley Module 25T' }).filter({ hasNotText: 'Hub' }).first();
    log('search rows', JSON.stringify(await page.locator('[data-part-type]').allInnerTexts()));
    const position = () => page.getByText('Position (mm)', { exact: true }).locator('..');
    const setPosition = async (x, z) => {
      const ins = position().locator('input');
      await ins.nth(0).fill(String(x)); await ins.nth(0).press('Enter'); await page.waitForTimeout(300);
      await ins.nth(2).fill(String(z)); await ins.nth(2).press('Enter'); await page.waitForTimeout(500);
    };
    await row.click(); await page.waitForFunction(() => window.__robot.getState().parts.length === 1);
    await page.waitForTimeout(1200); await setPosition(0, 0);
    await row.click(); await page.waitForFunction(() => window.__robot.getState().parts.length === 2);
    await page.waitForTimeout(1200); await setPosition(90, 0);
    await blur(page);
    await fitView(page);
    log('parts', JSON.stringify(await listParts(page)));
    await step('kayis-kasnaklar', page, async () => {
      await mark(page, [{ n: 5, loc: position(), at: 'l' }]);
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
    if (['kayis-sonuc', 'kayis-bilgi', 'kayis-sil'].some(wanted)) {
      await blur(page); await page.mouse.move(740, 500);
      await page.keyboard.press('k');
      await page.waitForFunction(() => window.__robot.getState().parts.length === 3, null, { timeout: 30000 });
      await page.waitForTimeout(800);
      log('notification', JSON.stringify(await page.evaluate(() => (document.body.innerText.match(/Belt added[^\n]*/g) || []))));
      await step('kayis-sonuc', page, async () => {
        await page.waitForTimeout(1500);
        await page.mouse.move(1439, 899);
        await capture(page, outFile('kayis-sonuc'), FULL);
      });
      log('belt area', (await page.locator('[data-testid="kayis-alani"]').innerText().catch(() => '-')).replace(/\n/g, ' | '));
      await step('kayis-bilgi', page, async () => {
        await waitToastsGone(page);
        const area = await page.locator('[data-testid="kayis-alani"]').boundingBox();
        // badge 3 above the frame at its right end: on a corner it covers the first label or the "305 mm" value
        await mark(page, [{ n: 3, loc: page.locator('[data-testid="kayis-bilgi"]'), at: 'above-r' },{ n: 4, loc: page.locator('[data-testid="kayis-kasnaklari-sec"]') }]);
        await capture(page, outFile('kayis-bilgi'), crop({ x: 1170, y: 108, width: 270, height: area.y + area.height + 16 - 108 }));
        await clearMarks(page);
      });
      await step('kayis-sil', page, async () => {
        const area = await page.locator('[data-testid="kayis-alani"]').boundingBox();
        await mark(page, [{ n: 3, loc: page.locator('[data-testid="kayis-alani"]').getByRole('button', { name: 'Delete', exact: true }) }]);
        await capture(page, outFile('kayis-sil'), crop({ x: 1170, y: 108, width: 270, height: area.y + area.height + 16 - 108 }));
        await clearMarks(page);
      });
    }
    await page.context().close().catch(() => {});
  }
  // ======================= Empty scene: File menu, imported model (capture-night) =======================
  if (['model-dosya-menusu', 'model-ozellikler', 'model-eksik'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const fileMenu = async (name, target, n) => {
      await menu(page, 'File').click(); await page.getByText('Save (download JSON)').first().waitFor();
      const m = page.locator('[role=menu]').first(); const mb = await m.boundingBox();
      await mark(page, [{ n, loc: m.getByText(target, { exact: true }).first().locator('..') }]);
      await capture(page, outFile(name), crop({ x: 0, y: 40, width: mb.x + mb.width + 30, height: mb.y + mb.height + 14 - 40 }));
      await clearMarks(page); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    };
    await step('model-dosya-menusu', page, () => fileMenu('model-dosya-menusu', 'Import (STL, STEP, GLB, OBJ)...', 1));
    if (['model-ozellikler', 'model-eksik'].some(wanted)) {
      await menu(page, 'File').click();
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Import (STL, STEP, GLB, OBJ)...').first().click()]);
      await fc.setFiles(CUBE);
      await page.waitForFunction(() => window.__robot.getState().parts.length === 1, null, { timeout: 60000 });
      await page.waitForTimeout(2000);
      log('notification', JSON.stringify(await page.evaluate(() => (document.body.innerText.match(/[^\n]*added[^\n]*/g) || []))));
      const id = (await listParts(page))[0].id;
      await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), id);
      await page.locator('[data-testid="ozel-dosya"]').waitFor();
      await step('model-ozellikler', page, async () => {
        const unitRow = page.locator('[data-testid="ozel-birim-mm"]').locator('..');
        const upRow = page.locator('[data-testid="ozel-yukari-z"]').locator('..');
        const sizeInputs = page.locator('[data-testid="ozel-olcu-en"]').locator('xpath=ancestor::div[2]');
        // badges on the right corners: the labels sit above the left end of each frame
        await mark(page, [{ n: 2, loc: unitRow, at: 'tr' }, { n: 3, loc: upRow, at: 'tr' }, { n: 4, loc: sizeInputs, at: 'tr' }]);
        const b = await page.locator('[data-testid="ozel-dosya"]').boundingBox();
        // end just under the file line, above the Color label
        await capture(page, outFile('model-ozellikler'), crop({ x: 1170, y: 108, width: 270, height: b.y + b.height + 6 - 108 }));
        await clearMarks(page);
      });
      await step('model-eksik', page, async () => {
        await menu(page, 'File').click();
        const [dl] = await Promise.all([page.waitForEvent('download'), page.getByText('Save (download JSON)').first().click()]);
        const jsonPath = DBG + '/model-proje.json'; await dl.saveAs(jsonPath);
        const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); log('json keys', Object.keys(j).join(','));
        delete j.assets; const strippedPath = DBG + '/model-eksik.json'; fs.writeFileSync(strippedPath, JSON.stringify(j));
        // new tab: so there is no in-memory copy of the model
        const { page: p2 } = await prepare3d(browser); p2.setDefaultTimeout(60000);
        await p2.locator('[data-bos-sahne-bos]').click().catch(() => {}); await p2.waitForTimeout(500);
        await menu(p2, 'File').click();
        const [fc2] = await Promise.all([p2.waitForEvent('filechooser'), p2.getByText('Open...', { exact: true }).first().click()]);
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
        await p2.context().close().catch(() => {});
      });
    }
    await page.context().close().catch(() => {});
  }
  if (wanted('model-eklendi')) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    await menu(page, 'File').click();
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Import (STL, STEP, GLB, OBJ)...').first().click()]);
    await step('model-eklendi', page, async () => {
      // a 3D screenshot takes several seconds here: keep the notifications from closing (same trick as tak-motor-mili)
      await page.evaluate(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...r) => (ms >= 3000 && ms <= 8000 ? 0 : st(f, ms, ...r)); });
      await fc.setFiles(CUBE);
      const t = await page.waitForFunction(() => { const e = [...document.querySelectorAll('body *')].find(x => x.children.length === 0 && /kup added/.test(x.textContent)); if (!e) return null; const b = (e.closest('[data-sonner-toast],li') || e).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, null, { timeout: 60000, polling: 100 }).then(h => h.jsonValue());
      // the notification closes within a few seconds: capture as soon as it is found (scene + notification in the top right corner)
      await capture(page, outFile('model-eklendi'), { x: 560, y: 44, width: 880, height: 640 });
      log('toast', JSON.stringify(t));
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Replace confirmation (capture-night recapture) =======================
  if (wanted('hazir-degistir-onayi')) {
    const page = await emptyScene(browser);
    await step('hazir-degistir-onayi', page, async () => {
      await page.locator('[data-bos-sahne-robot="wattos-mekanum-sasi"]').click();
      await page.waitForFunction(() => window.__robot.getState().parts.length > 25); await page.waitForTimeout(3000);
      await tab(page, 'Robot catalog').click(); await page.waitForTimeout(800);
      await page.locator('[data-robot-yukle="omni-sasi"]').click(); await page.waitForTimeout(800);
      const confirmBox = page.locator('[data-robot-onay]'); log('confirm', (await confirmBox.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 4, loc: page.locator('[data-robot-onayla]') }]);
      const ob = await confirmBox.boundingBox(); const pc = await page.locator('[data-catalog-panel]').boundingBox();
      const kb = await page.locator('[data-robot-yukle="omni-sasi"]').boundingBox();
      const top = Math.max(pc.y + 30, kb.y - 10); // start above the card row so no half row is left
      await capture(page, outFile('hazir-degistir-onayi'), { x: pc.x, y: top, width: pc.width, height: ob.y + ob.height + 20 - top });
      await clearMarks(page);
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Simple scene: measure panel, account dialogs (capture-night) =======================
  if (['olc-kapat', 'olc-liste', 'hesap-kaydet-penceresi', 'hesap-giris-istemi', 'hesap-paylas-formu'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const t5 = await partTypeOf(page, 'shop-yapi', 'Structure', '5 holes');
    const st = await addPart(page, t5, { x: 0, z: 0 });
    await R0(page, () => window.__robot.getState().deselectAll());
    await fitView(page);
    if (['olc-kapat', 'olc-liste'].some(wanted)) {
      await page.locator('button[title^="Measure"]').first().click();
      await page.getByText('Click the first point to measure').first().waitFor();
      const panel = measurePanel(page);
      const hs = (await partHoles(page, st.id)).filter(h => Math.abs(h.a[1]) > 0.9).sort((a, b) => b.p[1] - a.p[1]);
      const top = hs.filter(h => Math.abs(h.p[1] - hs[0].p[1]) < 1).sort((a, b) => a.p[0] - b.p[0] || a.p[2] - b.p[2]);
      log('top holes', top.length, JSON.stringify(top.map(h => h.p.map(v => Math.round(v)))));
      const clickPoint = async (h, shift) => { const n = await toScreen(page, h); await page.mouse.move(n.x, n.y); await page.waitForTimeout(600); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(n.x, n.y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(800); return n; };
      await step('olc-kapat', page, async () => {
        await mark(page, [{ n: 3, loc: page.locator('[title="Close measure (Esc)"]').first() }]);
        await capture(page, outFile('olc-kapat'), crop(await panel.boundingBox(), 12));
        await clearMarks(page);
      });
      await step('olc-liste', page, async () => {
        const a = top[0], b = top[top.length - 1];
        await clickPoint(a.p); await clickPoint(b.p); await page.getByText('ΔX').first().waitFor();
        await clickPoint(a.p); await clickPoint([(a.p[0] + b.p[0]) / 2, a.p[1], (a.p[2] + b.p[2]) / 2], true); await page.waitForTimeout(1200);
        log('list panel', (await panel.innerText()).replace(/\n/g, ' | '));
        await page.mouse.move(1439, 899);
        await mark(page, [{ n: 2, loc: page.locator('[title="Delete this measurement"]').first() }]);
        await capture(page, outFile('olc-liste'), crop(await panel.boundingBox(), 12));
        await clearMarks(page);
      });
      await blur(page); for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
    }
    if (['hesap-kaydet-penceresi', 'hesap-giris-istemi'].some(wanted)) {
      await R0(page, () => window.__robot.getState().setProjectName('Omni test')); await page.waitForTimeout(300);
      await menu(page, 'File').click(); await page.getByText('Save to my account...').first().click();
      const d = page.locator('[data-hesap-kaydet]'); await d.waitFor();
      log('account dialog', (await d.innerText()).replace(/\n/g, ' | '));
      await step('hesap-kaydet-penceresi', page, async () => {
        await mark(page, [{ n: 2, loc: page.locator('[data-hesap-ad]'), at: 'tr' }, { n: 3, loc: page.locator('[data-hesap-kaydet-gonder]') }]);
        await capture(page, outFile('hesap-kaydet-penceresi'), crop(await d.boundingBox(), 12));
        await clearMarks(page);
      });
      await step('hesap-giris-istemi', page, async () => {
        await page.locator('[data-hesap-kaydet-gonder]').click();
        const g = page.locator('[data-hesap-giris]'); await g.waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
        log('sign-in', (await g.innerText()).replace(/\n/g, ' | '));
        await mark(page, [{ n: 3, loc: g }]);
        await capture(page, outFile('hesap-giris-istemi'), crop(await d.boundingBox(), 12));
        await clearMarks(page);
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    }
    await step('hesap-paylas-formu', page, async () => {
      // a second Structure: the form counts the top-level parts, and "1 parts will be shared" has no singular form in English
      await addPart(page, t5, { x: 0, z: 120 }); await R0(page, () => window.__robot.getState().deselectAll());
      await tab(page, 'Robot catalog').click(); await page.waitForTimeout(800);
      await page.getByText('Share your robot', { exact: false }).first().click();
      const f = page.locator('[data-share-form]'); await f.waitFor({ timeout: 20000 });
      await page.locator('input[name="robotName"]').fill('Omni test'); await blur(page); await page.waitForTimeout(400);
      log('share form', (await f.innerText()).replace(/\n/g, ' | '));
      await f.scrollIntoViewIfNeeded();
      await mark(page, [{ n: 3, loc: page.locator('input[name="robotName"]'), at: 'tr' }, { n: 4, loc: page.locator('[data-share-submit]') }]);
      const pc = await page.locator('[data-catalog-panel]').boundingBox(); const fb = await f.boundingBox();
      const top = Math.max(pc.y, fb.y - 60);
      await capture(page, outFile('hesap-paylas-formu'), { x: pc.x, y: top, width: pc.width, height: Math.min(900, fb.y + fb.height + 14) - top });
      await clearMarks(page);
    });
    await page.context().close().catch(() => {});
  }
  // ======================= Simple scene: group and link (capture-night) =======================
  if (['grupla-sabitle', 'grupla-coz', 'grupla-bagla', 'grupla-bagi-coz'].some(wanted)) {
    const page = await emptyScene(browser);
    await page.locator('[data-bos-sahne-bos]').click().catch(() => {}); await page.waitForTimeout(500);
    const selectOne = async (id) => { await R0(page, (id) => window.__robot.getState().selectOnlyPart(id), id); await page.waitForTimeout(800); };
    const rightClick = async (id) => {
      const p = (await listParts(page)).find(q => q.id === id); const n = await toScreen(page, p.pos);
      await page.mouse.click(n.x, n.y, { button: 'right' }); await page.waitForTimeout(800);
    };
    const contextMenu = page.locator('div.fixed.z-50.shadow-toolbar').first();
    const t13 = await partTypeOf(page, 'shop-yapi', 'Structure', '13 holes');
    const t5 = await partTypeOf(page, 'shop-yapi', 'Structure', '5 holes');
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
      await mark(page, [{ n: 6, loc: contextMenu.locator('button, [role=menuitem]').filter({ hasText: /^\s*Group/ }).first() }]);
      await capture(page, outFile('grupla-sabitle'), crop(await contextMenu.boundingBox(), 14));
      await clearMarks(page);
      await contextMenu.getByText('Group', { exact: true }).first().click(); await page.waitForTimeout(1000);
    });
    await step('grupla-coz', page, async () => {
      await R0(page, (ids) => window.__robot.getState().selectParts(ids), [a.id, b.id]); await page.waitForTimeout(600);
      await rightClick(b.id); await contextMenu.waitFor();
      log('menu2', (await contextMenu.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: contextMenu.locator('button, [role=menuitem]').filter({ hasText: /^\s*Ungroup/ }).first() }]);
      await capture(page, outFile('grupla-coz'), crop(await contextMenu.boundingBox(), 14));
      await clearMarks(page);
      await contextMenu.getByText('Ungroup', { exact: true }).first().click(); await page.waitForTimeout(1000);
    });
    if (['grupla-bagla', 'grupla-bagi-coz'].some(wanted)) {
      await page.keyboard.press('Escape').catch(() => {});
      // drag the divider between the Scene and Properties 80 px to the left: the English "Attached to" line is longer
      try {
        const sashes = await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
        const sh = sashes.filter(r => r.height > 300 && r.x > 1000).sort((p, q) => q.x - p.x)[0];
        const sx = sh.x + sh.width / 2, sy = sh.y + sh.height / 2;
        await page.mouse.move(sx, sy); await page.mouse.down();
        for (let i = 1; i <= 8; i++) await page.mouse.move(sx - i * 10, sy);
        await page.mouse.up(); await page.waitForTimeout(1500);
      } catch (e) { log('divider drag', e.message.split('\n')[0]); }
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
    await page.context().close().catch(() => {});
  }
  // ======================= Omni chassis result images (capture-night; one image per run keeps the scenes apart) =======================
  if (['model-sonuc', 'gezin-sonuc', 'grupla-sonuc', 'olc-genel'].some(wanted)) {
    const page = await emptyScene(browser);
    await tab(page, 'Parts').click().catch(() => {});
    await loadOmni(page);
    const ps0 = await listParts(page);
    const R = (fn, arg) => page.evaluate(fn, arg);
    const clearSelection = async () => {
      await page.keyboard.press('Escape').catch(() => {});
      await R(() => window.__robot.getState().deselectAll());
    };
    const captureFull = async (name) => { await waitToastsGone(page); await page.mouse.move(1439, 899); await page.waitForTimeout(2500); await capture(page, outFile(name), FULL); };
    if (wanted('model-sonuc')) {
      await R(() => window.__robot.getState().deselectAll());
      await menu(page, 'File').click();
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Import (STL, STEP, GLB, OBJ)...').first().click()]);
      await fc.setFiles(CUBE);
      await page.getByText(/kup added/).first().waitFor({ timeout: 150000 }); log('added notification seen');
      await step('model-sonuc', page, async () => {
        const ps = await listParts(page); const k = ps[ps.length - 1];
        await R((id) => { const s = window.__robot.getState(); const p = s.parts.find(q => q.id === id);
          const mx = Math.max(...s.parts.filter(q => q.id !== id).map(q => q.position.x));
          s.updatePart(id, { position: p.position.clone().set(mx + 140, p.position.y, p.position.z) }); s.selectOnlyPart(id); }, k.id);
        await captureFull('model-sonuc');
        await clearSelection();
      });
    }
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
    // --- Measure: top view, two holes ---
    if (wanted('olc-genel')) {
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
      log('holes', JSON.stringify(holePair));
      const n1 = await toScreen(page, holePair[0].p), n2 = await toScreen(page, holePair[1].p);
      await page.mouse.move(n1.x, n1.y); await page.waitForTimeout(800); await page.mouse.click(n1.x, n1.y);
      await page.getByText('Click the second point').first().waitFor();
      await page.mouse.move(n2.x, n2.y); await page.waitForTimeout(800); await page.mouse.click(n2.x, n2.y);
      await page.getByText('ΔX').first().waitFor();
      await page.waitForTimeout(1500);
      log('measure panel', (await measurePanel(page).innerText()).replace(/\n/g, ' | '));
      await step('olc-genel', page, async () => { await captureFull('olc-genel'); });
    }
    await page.context().close().catch(() => {});
  }
  // ======================= Site header, help window, community catalog (capture-dev recipes, now in production) =======================
  if (['hata-bildir-baslik', 'kisayollar-yardim-yeni', 'katalog-omni4'].some(wanted)) {
    const { page } = await prepare(browser);
    // Report a bug in the site header
    await step('hata-bildir-baslik', page, async () => {
      const b = page.locator('probot-header .hatabtn');
      await mark(page, [{ n: 1, loc: b }]);
      await capture(page, outFile('hata-bildir-baslik'), { x: 0, y: 0, width: 720, height: 110 });
      await clearMarks(page);
    });
    // Help window (new rows)
    await step('kisayollar-yardim-yeni', page, async () => {
      await page.locator('canvas').first().click({ position: { x: 600, y: 120 } }).catch(() => {});
      await page.keyboard.press('?');
      const d = page.getByText('Keyboard shortcuts', { exact: true }).first();
      await d.waitFor();
      await page.waitForTimeout(600);
      const box = await d.locator('xpath=ancestor::div[2]').boundingBox();
      // no margin above the window (rounded up): behind it the toolbar shows as an orange strip
      await capture(page, outFile('kisayollar-yardim-yeni'), { x: Math.floor(box.x) - 4, y: Math.ceil(box.y), width: Math.ceil(box.width) + 8, height: Math.floor(box.height) + 4 });
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    });
    // Robot catalog, COMMUNITY: the design example
    await step('katalog-omni4', page, async () => {
      await page.getByText('Robot catalog', { exact: true }).first().click();
      const card = page.getByText('4-motor omni chassis', { exact: false }).first();
      await card.waitFor();
      await card.evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(1500);
      const k = card.locator('xpath=ancestor::button[1]');
      const target = (await k.count()) ? k : card.locator('xpath=../..');
      log('omni4 card', (await target.innerText()).replace(/\n/g, ' | '));
      await mark(page, [{ n: 3, loc: target, pad: 2 }]);
      await capture(page, outFile('katalog-omni4'), { x: 0, y: 108, width: 312, height: 792 });
      await clearMarks(page);
    });
    await page.context().close().catch(() => {});
  }
} finally { await browser.close(); }
