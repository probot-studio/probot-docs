// Builder images of parts 00 and 01. Usage: node builder.mjs <output> a1|a2|a2b|a3|b1|b2 [example-folder]
// The scene draws slowly, so every part rebuilds the robot and fits in 300 seconds on its own.
//  a1: empty scene, Omni şasi, find the motors   a2: name and port for the left motor   a2b: right motor   a3: project name
//  b1: builds the same robot, Dosya > Kaydet (JSON indir)   b2: Dosya > Sim'de dene
import { SITE, log, connect, newContext, dismissNotices, mark, clearMarks, capture, dumpLocalStorage } from './lib.mjs';
import fs from 'fs';
const [OUT, PART, EXAMPLE] = process.argv.slice(2);
const out = (name) => `${OUT}/${name}.png`;
const browser = await connect();
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();

async function open(ctx) {
  const page = await ctx.newPage();
  await page.goto(SITE + '/builder/', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => !!window.__robot, null, { timeout: 60000 });
  await dismissNotices(page);
  return page;
}
async function omni(page) {
  await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
  await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
}
const selected = (page) => page.evaluate(() => { const s = window.__robot.getState(); return s.parts.filter((p) => s.selectedPartIds.includes(p.id)).map((p) => ({ type: p.type, x: p.position.x })); });

// A Dockview tab gets stuck on a real mouse click; the events are dispatched through the DOM
async function tab(page, name) {
  await page.locator('.dv-tab', { hasText: name }).first().evaluate((el) => {
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
      const E = t.startsWith('pointer') ? PointerEvent : MouseEvent;
      el.dispatchEvent(new E(t, { bubbles: true, cancelable: true, button: 0, isPrimary: true }));
    }
  });
  await page.waitForTimeout(800);
}
async function press(loc) {
  try { await loc.click({ timeout: 8000 }); }
  catch { await loc.evaluate((el) => { for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) { const E = t.startsWith('pointer') ? PointerEvent : MouseEvent; el.dispatchEvent(new E(t, { bubbles: true, cancelable: true, button: 0, isPrimary: true })); } }); }
}
async function motorRows(page) {
  await tab(page, 'Parçalar');
  const search = page.locator('input[placeholder="Parçalarda ara..."]');
  await search.fill('Motor'); await page.waitForTimeout(800);
  const rows = page.locator('[data-part-id]');
  log('motor rows', await rows.count(), JSON.stringify(await rows.allInnerTexts()));
  return { search, rows };
}
async function nameMotor(page, row, name, port) {
  await press(row); await page.waitForTimeout(800);
  log('selected', JSON.stringify(await selected(page)));
  await page.locator('[data-testid="donanim-alani"]').waitFor();
  const box = page.locator('[data-testid="donanim-ad"]');
  await box.fill(name); await box.press('Enter');
  await page.locator('[data-testid="donanim-port"]').selectOption(String(port));
  await page.waitForTimeout(600);
}
// The menu button can also get stuck on a click while the scene draws; the events are dispatched through the DOM
async function openMenu(page, name) {
  const m = menu(page, name);
  await m.evaluate((el) => { for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) { const E = t.startsWith('pointer') ? PointerEvent : MouseEvent; el.dispatchEvent(new E(t, { bubbles: true, cancelable: true, button: 0, isPrimary: true })); } });
  await page.locator('[role=menu]').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(800);
}
// Menu crop: includes the site header so the Dosya badge (13 px above the box) stays in frame
async function menuCrop(page, mb) {
  return { x: 0, y: 0, width: Math.max(560, mb.x + mb.width + 30), height: mb.y + mb.height + 30 };
}
async function projectName(page) {
  await page.locator('button[title="Proje adını düzenle"]').click();
  await page.keyboard.press('Control+A'); await page.keyboard.type('İlk robot'); await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
}

try {
  const saved = `${OUT}/seed-builder-project.json`;
  const seeded = PART.startsWith('b') && fs.existsSync(saved);
  const ctx = await newContext(browser, { seed: seeded ? JSON.parse(fs.readFileSync(saved, 'utf8')) : null });
  const page = await open(ctx);
  if (PART === 'a1') {
    await mark(page, [{ n: 1, loc: page.locator('[data-bos-sahne-robot="omni-sasi"]') }]);
    await capture(page, out('builder-bos-sahne'));
    await clearMarks(page);
    await omni(page);
    await capture(page, out('builder-omni-sasi'));
    const { search, rows } = await motorRows(page);
    await press(rows.first()); await page.waitForTimeout(1200);
    log('first row', JSON.stringify(await selected(page)));
    await mark(page, [{ n: 1, loc: page.locator('.dv-tab', { hasText: 'Parçalar' }).first() }, { n: 2, loc: search }, { n: 3, loc: rows.first() }]);
    await capture(page, out('builder-motor-bul'), { x: 0, y: 40, width: 1170, height: 860 });
  } else if (PART === 'a2') {
    await omni(page);
    const { rows } = await motorRows(page);
    await nameMotor(page, rows.first(), 'solMotor', 0);
    const hb = await page.locator('[data-testid="donanim-alani"]').boundingBox();
    await mark(page, [{ n: 1, loc: page.locator('[data-testid="donanim-ad"]') }, { n: 2, loc: page.locator('[data-testid="donanim-hub"]') }, { n: 3, loc: page.locator('[data-testid="donanim-port"]') }]);
    await capture(page, out('builder-sol-motor'), { x: 700, y: Math.max(108, hb.y - 230), width: 740, height: hb.height + 250 });
  } else if (PART === 'a2b') {
    await omni(page);
    const { rows } = await motorRows(page);
    await nameMotor(page, rows.first(), 'solMotor', 0);
    await nameMotor(page, rows.nth(2), 'sagMotor', 1);
    log('hardware', JSON.stringify(await page.evaluate(() => window.__robot.getState().parts.filter((p) => p.donanim).map((p) => [p.position.x, p.donanim]))));
    await mark(page, [{ n: 1, loc: rows.nth(2) }, { n: 2, loc: page.locator('[data-testid="donanim-ad"]') }, { n: 3, loc: page.locator('[data-testid="donanim-port"]') }]);
    await capture(page, out('builder-sag-motor'));
    await clearMarks(page);
    const hb = await page.locator('[data-testid="donanim-alani"]').boundingBox();
    await mark(page, [{ n: 1, loc: page.locator('[data-testid="donanim-ters"]').locator('xpath=..') }]);
    await capture(page, out('builder-ters-yon'), { x: 700, y: Math.max(108, hb.y - 230), width: 740, height: hb.height + 250 });
  } else if (PART === 'a3') {
    await omni(page);
    const { rows } = await motorRows(page);
    await nameMotor(page, rows.first(), 'solMotor', 0);
    await nameMotor(page, rows.nth(2), 'sagMotor', 1);
    await projectName(page);
    await mark(page, [{ n: 1, loc: page.locator('button[title="Proje adını düzenle"]'), badge: 'right' }]);
    await capture(page, out('builder-proje-adi'), { x: 0, y: 40, width: 900, height: 300 });
    // Builder's browser storage is dumped so that b1 and b2 do not rebuild the robot
    await clearMarks(page);
    await page.waitForTimeout(3000);
    await dumpLocalStorage(page, saved);
  } else {
    // b1: Dosya > Kaydet (JSON indir)   b2: Dosya > Sim'de dene
    // If a3 left its saved state, Builder opens with the İlk robot project; otherwise the robot is rebuilt
    if (seeded) {
      await page.waitForFunction(() => window.__robot.getState().parts.length > 60, null, { timeout: 60000 });
      await page.waitForTimeout(2000);
    } else {
      await omni(page);
      const { rows } = await motorRows(page);
      await nameMotor(page, rows.first(), 'solMotor', 0);
      await nameMotor(page, rows.nth(2), 'sagMotor', 1);
      await projectName(page);
    }
    log('project', JSON.stringify(await page.evaluate(() => { const s = window.__robot.getState(); return [s.projectName, s.parts.filter((p) => p.donanim).map((p) => p.donanim)]; })));
    await page.evaluate(() => { const s = window.__robot.getState(); (s.deselectAll || s.clearSelection || (() => {}))(); });
    await page.waitForTimeout(800);
  }
  if (PART === 'b1') {
    await openMenu(page, 'Dosya');
    const save = page.getByRole('menuitem', { name: /Kaydet \(JSON indir\)/ });
    await mark(page, [{ n: 1, loc: menu(page, 'Dosya') }, { n: 2, loc: save, pad: 1 }]);
    const mb = await page.locator('[role=menu]').first().boundingBox();
    await capture(page, out('builder-dosya-kaydet'), await menuCrop(page, mb));
    await clearMarks(page);
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), press(save)]);
    log('downloaded', dl.suggestedFilename());
    // The site names the file after the project (İlk robot.json); the example keeps it as ilk-robot.json
    if (EXAMPLE) await dl.saveAs(`${EXAMPLE}/ilk-robot.json`);
  } else if (PART === 'b2') {
    await openMenu(page, 'Dosya');
    const trySim = page.getByRole('menuitem', { name: "Sim'de dene" });
    await mark(page, [{ n: 1, loc: menu(page, 'Dosya') }, { n: 2, loc: trySim, pad: 1 }]);
    const mb = await page.locator('[role=menu]').first().boundingBox();
    await capture(page, out('builder-dosya-sim'), await menuCrop(page, mb));
    await clearMarks(page);
    const [sim] = await Promise.all([ctx.waitForEvent('page', { timeout: 90000 }), trySim.click()]);
    await sim.waitForLoadState('load');
    await sim.locator('canvas').first().waitFor({ timeout: 90000 }); await sim.waitForTimeout(3000);
    await dismissNotices(sim);
    await sim.waitForTimeout(1500);
    log('sim url', sim.url(), (await sim.locator('#ana-robot').innerText()).split('\n').slice(0, 3).join(' | '));
    await capture(sim, out('sim-builder-robotu'));
    await dumpLocalStorage(sim, `${OUT}/seed-builder.json`);
  }
} finally { await browser.close(); }
