// Sim images of parts 00, 02 (intro), 03 and 04. Usage: node sim.mjs <output> home-auto|run-auto|home-teleop|run-teleop
// The localStorage dumped by the Builder and Blocks runs (seed-*.json) is written into the new context, so that
// Sim sees the robot built in Builder and the program open in Blocks in the same browser.
import { SITE, log, connect, newContext, dismissNotices, mark, clearMarks, capture } from './lib.mjs';
import fs from 'fs';
const [OUT, PART] = process.argv.slice(2);
const out = (name) => `${OUT}/${name}.png`;
const AUTO = PART.endsWith('-auto');
const read = (name) => JSON.parse(fs.readFileSync(`${OUT}/${name}`, 'utf8'));
const seed = { ...read('seed-builder.json'), ...read(`seed-blocks-${AUTO ? 'auto' : 'teleop'}.json`) };
delete seed.__series_seed;
const browser = await connect();
let page;
const text = async (sel) => (await page.locator(sel).innerText()).replace(/\n+/g, ' | ');
const toolbar = (name) => page.locator('.arac-seridi').getByRole('button', { name, exact: true });
const programRow = () => page.locator('#ana-kod').getByRole('button').filter({ hasText: "Blocks'ta açık FTC projesi" }).first();

async function homeReady() {
  await page.goto(SITE + '/sim/', { waitUntil: 'networkidle', timeout: 90000 });
  await dismissNotices(page);
  await page.locator('#ana-robot').waitFor();
  await page.waitForTimeout(1500);
  log('robot', (await text('#ana-robot')).slice(0, 300));
  const row = programRow();
  log('program row', await row.count(), (await row.innerText()).replace(/\n+/g, ' | '));
  await row.click(); await page.waitForTimeout(2000);
  log('code', (await text('#ana-kod')).slice(0, 400));
}
async function start() {
  await page.locator('.ana__baslat').click();
  await page.locator('.sahne').waitFor({ timeout: 30000 });
  // The left panel shows the site's robot catalog; for the scene images the panel is switched to the Saha tab
  await page.waitForTimeout(1500);
}
async function leftPanelField() {
  const t = page.locator('.dv-tab', { hasText: 'Saha' }).first();
  await t.evaluate((el) => { for (const x of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) { const E = x.startsWith('pointer') ? PointerEvent : MouseEvent; el.dispatchEvent(new E(x, { bubbles: true, cancelable: true, button: 0, isPrimary: true })); } });
  await page.waitForTimeout(800);
}

try {
  const ctx = await newContext(browser, { seed });
  page = await ctx.newPage();
  await homeReady();
  if (PART === 'home-auto') {
    await capture(page, out('sim-ana-ust'), { x: 0, y: 44, width: 1440, height: 480 });
    // Part 02 intro: from Sim to Blocks, Dosya > Blocks'u aç
    const file = page.getByRole('menuitem', { name: 'Dosya', exact: true }).or(page.getByRole('button', { name: 'Dosya', exact: true })).first();
    await file.click(); await page.waitForTimeout(600);
    const openBlocks = page.getByRole('menuitem', { name: /Blocks'u aç/ }).first();
    log('file menu', JSON.stringify(await page.getByRole('menuitem').allInnerTexts()));
    const mb = await page.getByRole('menu').first().boundingBox();
    await mark(page, [{ n: 1, loc: file }, { n: 2, loc: openBlocks, pad: 1 }]);
    await capture(page, out('sim-blocks-ac'), { x: 0, y: 0, width: Math.max(560, mb.x + mb.width + 30), height: mb.y + mb.height + 30 });
    await clearMarks(page);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    await mark(page, [{ n: 1, loc: page.locator('#ana-robot').getByRole('button').filter({ hasText: 'İlk robot' }).first() }]);
    await capture(page, out('sim-ana-robot'), { x: 70, y: 190, width: 434, height: 340 });
    await clearMarks(page);
    await mark(page, [{ n: 1, loc: programRow() }]);
    await capture(page, out('sim-ana-kod'), { x: 503, y: 190, width: 434, height: 340 });
    await clearMarks(page);
    const config = page.locator('#ana-kod select');
    log('configuration', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#ana-kod select')].map((s) => s.closest('div')?.innerText.replace(/\n+/g, ' ') + ' => ' + s.options[s.selectedIndex]?.text))));
    await config.first().scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    const b0 = await config.first().boundingBox();
    await mark(page, [{ n: 1, loc: config.nth(0) }, { n: 2, loc: config.nth(1) }]);
    await capture(page, out('sim-yapilandirma'), { x: 503, y: b0.y - 150, width: 434, height: 260 });
    await clearMarks(page);
    await mark(page, [{ n: 1, loc: page.locator('.ana__baslat') }]);
    await capture(page, out('sim-baslat'), { x: 0, y: 560, width: 1440, height: 340 });
    await clearMarks(page);
    log('bottom row', (await page.locator('body').innerText()).match(/Robot:.*|Kod:.*|Saha:.*|Otonom \d+ saniye.*/g));
  } else if (PART === 'run-auto') {
    await start();
    await toolbar('Yeniden çalıştır').waitFor({ timeout: 120000 });
    await leftPanelField();
    const time = page.getByRole('slider', { name: 'Zaman' });
    for (const [t, name] of [[0, 'sim-otonom-0'], [1.5, 'sim-otonom-ileri'], [2.3, 'sim-otonom-don'], [5, 'sim-otonom-son']]) {
      await time.fill(String(t)); await page.waitForTimeout(900);
      await capture(page, out(name));
    }
    const info = page.getByText(/Çarpışma/).first();
    log('info', await info.locator('xpath=..').innerText());
    await mark(page, [{ n: 1, loc: page.getByRole('button', { name: 'Oynat' }) }, { n: 2, loc: time }, { n: 3, loc: info.locator('xpath=..'), badge: 'right' }]);
    await capture(page, out('sim-zaman-cizgisi'), { x: 300, y: 560, width: 820, height: 340 });
    await clearMarks(page);
    await mark(page, [{ n: 1, loc: toolbar('Yeniden çalıştır') }, { n: 2, loc: toolbar('Sıfırla') }]);
    await capture(page, out('sim-arac-seridi'), { x: 0, y: 44, width: 1440, height: 420 });
    await clearMarks(page);
    await toolbar('Sıfırla').click(); await page.waitForTimeout(1500);
    log('after reset', JSON.stringify(await page.locator('.arac-seridi').getByRole('button').allInnerTexts()));
    await mark(page, [{ n: 1, loc: toolbar('Çalıştır') }]);
    await capture(page, out('sim-otonom-sifirla'), { x: 0, y: 44, width: 1440, height: 420 });
    await clearMarks(page);
    log('ds', (await page.locator('body').innerText()).match(/Driver Station[\s\S]{0,120}/g));
  } else if (PART === 'home-teleop') {
    await mark(page, [{ n: 1, loc: programRow() }]);
    await capture(page, out('sim-ana-surus'), { x: 503, y: 190, width: 434, height: 340 });
    await clearMarks(page);
  } else {
    await start();
    await page.getByText('Canlı · klavye').first().waitFor({ timeout: 60000 });
    await leftPanelField();
    await page.locator('.sahne').click({ position: { x: 20, y: 20 } }).catch(() => {});
    for (const [k, ms] of [['w', 1500], ['d', 380], ['w', 300]]) { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); }
    await page.waitForTimeout(500);
    await capture(page, out('sim-surus-kapak'));
    const gamepad = page.getByText('KLAVYE → GAMEPAD1', { exact: false }).first().locator('xpath=..');
    await mark(page, [{ n: 1, loc: page.getByText('Canlı · klavye').first() }, { n: 2, box: await gamepad.boundingBox() }]);
    await capture(page, out('sim-surus-canli'));
    await clearMarks(page);
    await mark(page, [{ n: 1, loc: toolbar('Durdur') }]);
    await capture(page, out('sim-surus-durdur'), { x: 0, y: 44, width: 1440, height: 420 });
    await clearMarks(page);
    await toolbar('Durdur').click(); await page.waitForTimeout(1500);
    log('stopped', (await page.locator('.arac-seridi').innerText()).replace(/\n+/g, ' | '), (await page.locator('body').innerText()).match(/TeleOp · [^\n]*/g));
    const buttons = await page.locator('.arac-seridi').getByRole('button').allInnerTexts();
    log('buttons', JSON.stringify(buttons));
    const targets = [];
    if (await toolbar('Sıfırla').count()) targets.push({ n: 1, loc: toolbar('Sıfırla') });
    const run = page.locator('.arac-seridi').getByRole('button', { name: /Başlat|Çalıştır/ }).first();
    if (await run.count()) targets.push({ n: 2, loc: run });
    await mark(page, targets);
    await capture(page, out('sim-surus-sifirla'), { x: 0, y: 44, width: 1440, height: 420 });
    await clearMarks(page);
  }
} finally { await browser.close(); }
