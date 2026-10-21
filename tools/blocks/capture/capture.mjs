// Blocks documentation screenshots: opens prod, prepares the screen for each image,
// marks targets with a magenta frame and a numbered badge, and writes to the output folder.
//
// Usage: PW_WS=<playwright run-server ws address> node capture.mjs <output-folder> [name1,name2,...]
// Development build ("Yakında" images): BLOCKS_URL=<dev address> BLOCKS_AUTH=<user:password>
// (the credential is read only from the environment, never written to the script or the log).
// Run from a folder where Playwright is installed. Heavy job: on a shared machine, hold the browser lock.
// Afterwards: python3 compress.py <output-folder> (256 colors, at most 250 KB).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = process.env.BLOCKS_URL || 'https://probotstudio.com/blocks/';
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const MAGENTA = '#E6007E';

// Blockly uses NBSP instead of spaces in field text
const bt = (s, exact = false) => new RegExp((exact ? '^' : '') + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s\\u00a0]') + (exact ? '$' : ''));
const ftc = (page) => page.frameLocator('iframe.ftc-cerceve');
const ftcFrame = (page) => page.frames().find((f) => f.url().includes('ftc/editor.html'));

async function openPage(ctx, { mode = 'probot', keepIntroCard = false } = {}) {
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  // Notifications (e.g. "<name> örneği yüklendi.") stay on screen for 5 s; keep them out of the image
  await page.addStyleTag({ content: '.notifications{display:none!important}' });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  if (!keepIntroCard) {
    await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 3000 }).catch(() => {});
  }
  if (mode === 'probot') {
    await page.getByRole('tab', { name: 'Probot Blocks' }).click();
    await page.waitForTimeout(800);
  } else if (mode === 'ftc') {
    await page.getByRole('tab', { name: 'FTC Blocks' }).click();
    await ftc(page).getByText('runOpMode').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(800);
  }
  return page;
}

async function loadExample(page, name) {
  await page.getByRole('button', { name: 'Örnek seç' }).click();
  await page.locator('.example-picker__item-name', { hasText: new RegExp('^' + name + '$') }).first().click();
  await page.waitForTimeout(1500);
}

async function openExamplePicker(page) {
  await page.getByRole('button', { name: 'Örnek seç' }).click();
  await page.locator('.example-picker').waitFor();
  await page.waitForTimeout(500);
}

const blockText = (page, s, n = 0) => page.locator('.blocklyBlockCanvas .blocklyText', { hasText: bt(s, true) }).nth(n);
const category = (page, name) => page.getByRole('treeitem', { name, exact: true })
  .or(page.locator('.blocklyToolboxCategoryLabel, .blocklyTreeLabel, .blocklyToolboxCategory', { hasText: new RegExp('^' + name + '$') })).first();
const canvasText = (root, re) => root.locator('.blocklyBlockCanvas text', { hasText: re });

// When the same text appears several times, the topmost on screen (then the leftmost)
async function topmost(loc) {
  let best = null;
  for (const l of await loc.all()) {
    const b = await l.boundingBox();
    if (b && (!best || b.y < best.y - 2 || (Math.abs(b.y - best.y) <= 2 && b.x < best.x))) best = b;
  }
  if (!best) throw new Error('not found: ' + loc);
  return best;
}

async function rightClick(page, loc) {
  const b = await loc.boundingBox();
  await page.mouse.click(b.x + 4, b.y + b.height / 2, { button: 'right' });
  await page.waitForTimeout(500);
}

async function rightClickEmptyArea(page) {
  const b = await page.locator('.blocklySvg').first().boundingBox();
  await page.mouse.click(b.x + b.width - 120, b.y + b.height - 260, { button: 'right' });
  await page.waitForTimeout(500);
}

// Puts a "set solMotor.Power to gamepad1.LeftStickY" block into the loop of a new FTC program
async function addFtcMotorBlock(page) {
  await ftcFrame(page).evaluate(() => {
    const ws = Blockly.getMainWorkspace();
    const update = ws.getAllBlocks(false).find((b) => b.type === 'telemetry_update');
    const xml = Blockly.Xml.textToDom(
      '<block type="dcMotor_setProperty_Number"><field name="IDENTIFIER">solMotorAsDcMotor</field>' +
      '<field name="PROP">Power</field><data>{"IDENTIFIER":"solMotor"}</data><value name="VALUE">' +
      '<block type="gamepad_getProperty_Number"><field name="IDENTIFIER">gamepad1</field>' +
      '<field name="PROP">LeftStickY</field><data>{"IDENTIFIER":"gamepad1"}</data></block></value></block>');
    const block = Blockly.Xml.domToBlock(xml, ws);
    const above = update.previousConnection.targetConnection;
    above.connect(block.previousConnection);
  });
  await page.waitForTimeout(800);
}

// Copies the tank drive block from the Probot "Tank Sürüş" example and pastes it into a new FTC program
async function pasteIntoFtc(p) {
  await loadExample(p, 'Tank Sürüş');
  await blockText(p, 'tank sürüş - sol motor').click();
  await p.keyboard.press('Control+c');
  await p.waitForTimeout(500);
  await p.getByRole('tab', { name: 'FTC Blocks' }).click();
  await ftc(p).getByText('runOpMode').first().waitFor({ timeout: 20000 });
  await p.getByRole('button', { name: 'Yeni program' }).click();
  await p.waitForTimeout(1500);
  const area = ftc(p).locator('.blocklySvg').first();
  const b = await area.boundingBox();
  await p.mouse.click(b.x + b.width * 0.55, b.y + b.height * 0.55);
  await p.keyboard.press('Control+v');
  await p.waitForTimeout(1200);
}

// Marks: [{loc, n}]; n is the badge number, n=null draws the frame only
async function drawMarks(page, marks) {
  const boxes = [];
  for (const { loc, box, n, pad = 6, pos = 'left' } of marks) {
    if (loc) await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    const b = box || await loc.boundingBox({ timeout: 8000 });
    if (!b) throw new Error('target not visible: ' + loc);
    boxes.push({ x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad, n, pos });
  }
  await page.evaluate(({ boxes, color }) => {
    const layer = document.createElement('div');
    layer.id = 'capture-overlay';
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    for (const k of boxes) {
      const c = document.createElement('div');
      c.style.cssText = `position:absolute;left:${k.x}px;top:${k.y}px;width:${k.w}px;height:${k.h}px;border:3px solid ${color};border-radius:8px;box-shadow:0 0 0 2px #fff`;
      layer.appendChild(c);
      if (k.n != null) {
        const r = document.createElement('div');
        // The badge goes left of the frame by default; in tight spots pos=below|above|right keeps it off the text
        let bx = k.x - 40, by = k.y + k.h / 2 - 16;
        if (k.pos === 'below') { bx = k.x + k.w / 2 - 16; by = k.y + k.h + 6; }
        if (k.pos === 'above') { bx = k.x + k.w / 2 - 16; by = k.y - 40; }
        if (k.pos === 'right') { bx = k.x + k.w + 6; }
        if (k.pos === 'inside') { bx = k.x + 10; by = k.y + 10; }
        if (k.pos === 'below-right') { bx = k.x + k.w - 4; by = k.y + k.h + 4; }
        // Large regions: a bottom corner inside the frame, where the screen is empty
        if (k.pos === 'inside-bl') { bx = k.x + 10; by = k.y + k.h - 42; }
        if (k.pos === 'inside-br') { bx = k.x + k.w - 42; by = k.y + k.h - 42; }
        if (bx < 4) { bx = k.x; by = k.y - 40; }
        if (by < 4) { by = k.y + k.h + 6; }
        bx = Math.max(4, Math.min(innerWidth - 36, bx));
        by = Math.max(4, Math.min(innerHeight - 36, by));
        r.textContent = k.n;
        r.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:32px;height:32px;border-radius:50%;background:${color};color:#fff;font:700 18px/32px system-ui,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
        layer.appendChild(r);
      }
    }
    document.body.appendChild(layer);
  }, { boxes, color: MAGENTA });
}

// Each image: [open options, setup(page) -> returns marks]
const IMAGES = {
  'blocks-arayuz-ortak': [{}, async (p) => [
    { loc: p.locator('probot-header'), n: 1, pad: 0 },
    { loc: p.locator('header.toolbar'), n: 2, pad: 0 },
    // Hata bildir sits in the site header next to the tool badge (no corner pill since the 2026-10-20 release)
    { loc: p.locator('probot-header .hatabtn'), n: 3 },
  ]],
  'blocks-arayuz-probot': [{}, async (p) => {
    // The Blockly SVG also extends under the block list; workspace = between the list and the side panel
    const list = await p.locator('.blocklyToolbox, .blocklyToolboxDiv').first().boundingBox();
    const panel = await p.locator('.side-panel').boundingBox();
    const area = { x: list.x + list.width, y: list.y, width: panel.x - list.x - list.width, height: list.height };
    return [
      { box: list, n: 1, pad: -3, pos: 'inside-bl' },
      { box: area, n: 2, pad: -3, pos: 'inside-bl' },
      { box: panel, n: 3, pad: -3, pos: 'inside-br' },
    ];
  }],
  'blocks-arayuz-probot-arac-cubugu': [{}, async (p) => [
    { loc: p.locator('header.toolbar input').first(), n: 1, pos: 'below' },
    { loc: p.getByRole('button', { name: 'Örnek seç' }), n: 2, pos: 'below' },
    { loc: p.getByRole('button', { name: 'Kodu kopyala' }), n: 3, pos: 'below' },
  ]],
  'blocks-arayuz-ftc': [{ mode: 'ftc' }, async (p) => [
    { loc: ftc(p).locator('.blocklyToolboxDiv'), n: 1, pad: 0 },
    { loc: ftc(p).getByText('Robot yapılandırması', { exact: true }).first(), n: 2 },
    { loc: ftc(p).getByText('OnBot Java', { exact: true }).first(), n: 3 },
  ]],
  'blocks-ftc-ornek-pencere': [{ mode: 'ftc' }, async (p) => {
    await openExamplePicker(p);
    return [{ loc: p.locator('.example-picker__item-name', { hasText: 'Tank Şasi TeleOp' }).first().locator('..'), n: 3 }];
  }],
  'blocks-ftc-yeni-program': [{ mode: 'ftc' }, async (p) => {
    await p.getByRole('button', { name: 'Yeni program' }).click();
    await p.waitForTimeout(1500);
    return [
      { loc: p.getByRole('button', { name: 'Yeni program' }), n: 2, pos: 'below' },
      { loc: ftc(p).getByText('runOpMode').first(), n: 3 },
    ];
  }],
  'blocks-ftc-motor-sur': [{ mode: 'ftc' }, async (p) => {
    await p.getByRole('button', { name: 'Yeni program' }).click();
    await p.waitForTimeout(1500);
    await addFtcMotorBlock(p);
    return [
      // Rows in the loop sit close together; below-right keeps the badges off solMotor and gamepad1
      { loc: canvasText(ftc(p), /^Power/).first(), n: 2, pad: 3, pos: 'below-right' },
      { loc: canvasText(ftc(p), /^LeftStickY/).first(), n: 4, pad: 3, pos: 'below-right' },
    ];
  }],
  'blocks-ftc-program-sonuc': [{ mode: 'ftc' }, async (p) => {
    await p.getByRole('button', { name: 'Yeni program' }).click();
    await p.waitForTimeout(1500);
    await addFtcMotorBlock(p);
    return [];
  }],
  'blocks-ftc-blk-indir': [{ mode: 'ftc' }, async (p) => {
    await loadExample(p, 'Tank Şasi TeleOp');
    return [{ loc: p.getByRole('button', { name: '.blk indir' }), n: 2, pos: 'below' }];
  }],
  'blocks-ftc-cihaz-ekle': [{ mode: 'ftc' }, async (p) => {
    const f = ftc(p);
    await f.getByText('+ Cihaz ekle').click();
    await p.waitForTimeout(600);
    return [
      { loc: f.getByText('+ Cihaz ekle'), n: 1 },
      { loc: f.locator('select:visible').last(), n: 2, pad: 3 },
      { loc: f.locator('select:visible').last().locator('xpath=following::input[1]'), n: 3, pad: 3, pos: 'below' },
    ];
  }],
  'blocks-ftc-yapilandirma-sonuc': [{ mode: 'ftc' }, async (p) => {
    const f = ftc(p);
    await f.getByText('+ Cihaz ekle').click();
    await p.waitForTimeout(600);
    const nameInput = f.locator('select:visible').last().locator('xpath=following::input[1]');
    await nameInput.fill('armMotor');
    await nameInput.press('Enter');
    await nameInput.evaluate((e) => e.blur());
    await p.waitForTimeout(600);
    await nameInput.scrollIntoViewIfNeeded().catch(() => {});
    return [];
  }],
  'blocks-hata-bildir': [{}, async (p) => [
    { loc: p.locator('probot-header .hatabtn'), n: 1 },
  ]],
  'blocks-ilk-sonuc': [{}, async (p) => { await loadExample(p, 'Tank Sürüş'); return []; }],
  'blocks-ilk-giris-karti': [{ mode: null, keepIntroCard: true }, async (p) => [
    { loc: p.getByRole('button', { name: 'Anladım, devam et' }), n: 2 },
  ]],
  'blocks-ilk-probot-sekmesi': [{ mode: 'ftc' }, async (p) => [
    { loc: p.getByRole('tab', { name: 'Probot Blocks' }), n: 1 },
  ]],
  'blocks-ilk-tank-karti': [{}, async (p) => {
    await openExamplePicker(p);
    return [{ loc: p.locator('.example-picker__item-name', { hasText: /^Tank Sürüş$/ }).first().locator('..'), n: 3 }];
  }],
  'blocks-ilk-kod-onizleme': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    const line = p.locator('.code-preview').getByText('void teleopLoop()').first();
    await line.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    return [{ box: await line.boundingBox(), n: 3 }];
  }],
  'blocks-ilk-wifi-sifre': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    const s = p.locator('.wifi-settings__password input').first();
    await s.fill('TAKIM-2026');
    await p.locator('.blocklySvg').first().click({ position: { x: 900, y: 600 } });
    return [{ loc: s, n: 2, pos: 'below' }];
  }],
  'blocks-ilk-indir': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    return [
      { loc: p.getByRole('button', { name: 'Blokları indir' }), n: 1, pos: 'below' },
      { loc: p.getByRole('button', { name: '.ino indir' }), n: 2, pos: 'below' },
    ];
  }],
  'blocks-blok-ekle': [{}, async (p) => {
    await category(p, 'Telemetri').click();
    await p.waitForTimeout(600);
    return [
      { loc: category(p, 'Telemetri'), n: 1 },
      { loc: p.locator('.blocklyFlyout .blocklyText', { hasText: bt('telemetriye yaz') }).first(), n: 2 },
    ];
  }],
  'blocks-cop-kutusu': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    await blockText(p, 'kumandayı oku').click();
    await p.keyboard.press('Delete');
    await p.waitForTimeout(500);
    await p.locator('.blocklyTrash').first().click({ force: true });
    await p.waitForTimeout(800);
    // The opened panel covers the top of the trash can; the mark goes on the deleted block in the panel
    return [{ loc: p.locator('.blocklyFlyout .blocklyText', { hasText: bt('kumandayı oku') }).last(), n: 1, pad: 4 }];
  }],
  'blocks-blok-menusu': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    await rightClick(p, blockText(p, 'motor tanımla'));
    // The menu item "Yinele" was renamed "Çoğalt" in the 2026-10-20 release; the guides use blocks-blok-menusu-cogalt
    return [{ loc: p.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: /^Çoğalt$/ }).first(), n: 2, pad: 2 }];
  }],
  // Shipped to prod in the 2026-10-20 release (first captured from dev); now captured from prod like the rest
  'blocks-blok-menusu-cogalt': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    await rightClick(p, blockText(p, 'motor tanımla'));
    return [{ loc: p.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: /^Çoğalt$/ }).first(), n: 2, pad: 2 }];
  }],
  'blocks-mod-anahtari': [{ mode: 'ftc' }, async (p) => [
    { loc: p.getByRole('tab', { name: 'Probot Blocks' }), n: 1, pos: 'below-right' },
  ]],
  'blocks-hata-bildir-baslik': [{}, async (p) => [
    { loc: p.locator('probot-header .hatabtn'), n: 1, pos: 'right' },
  ]],
  'blocks-yakinlastirma': [{}, async (p) => {
    // The buttons are clipped parts of a single sprite image; the box is computed from the clip rectangle
    const boxes = await p.evaluate(() => ['blocklyZoomReset', 'blocklyZoomIn', 'blocklyZoomOut'].map((c) => {
      const g = document.querySelector('g.' + c);
      const id = (g.getAttribute('clip-path') || g.querySelector('[clip-path]')?.getAttribute('clip-path') || '').match(/#([^)"']+)/)?.[1];
      const rect = id ? document.getElementById(id).querySelector('rect') : null;
      const el = rect ? (g.getAttribute('clip-path') ? g : g.querySelector('[clip-path]')) : g;
      const m = el.getScreenCTM();
      const rx = rect ? +rect.getAttribute('x') || 0 : 0, ry = rect ? +rect.getAttribute('y') || 0 : 0;
      const w = rect ? +rect.getAttribute('width') : 32, h = rect ? +rect.getAttribute('height') : 32;
      return { x: m.e + rx * m.a, y: m.f + ry * m.d, width: w * m.a, height: h * m.d };
    }));
    return boxes.map((box) => ({ box, n: null, pad: 3 }));
  }],
  'blocks-degisken-olustur': [{}, async (p) => {
    await category(p, 'Değişkenler').click();
    await p.waitForTimeout(600);
    return [{ loc: p.locator('.blocklyFlyoutButton').first(), n: 2 }];
  }],
  'blocks-degisken-menusu': [{}, async (p) => {
    await loadExample(p, 'Otonom: İleri Git ve Dur');
    await p.locator('.blocklyBlockCanvas .blocklyDropdownText', { hasText: bt('baslangic') }).first().click({ force: true });
    await p.waitForTimeout(500);
    return [{ loc: p.locator('.blocklyDropDownDiv .blocklyMenuItem', { hasText: 'Değişkeni yeniden adlandır' }).first(), n: 2, pad: 1 }];
  }],
  'blocks-ftcye-yapistir': [{}, async (p) => {
    await pasteIntoFtc(p);
    // Frame the whole pasted stack: the top-level block group that holds gamepad1 (next blocks are nested in it)
    return [{ loc: ftc(p).locator('.blocklyBlockCanvas > g', { hasText: /gamepad1/ }).first(), n: 3, pad: 4 }];
  }],
  'blocks-ftcye-sonuc': [{}, async (p) => { await pasteIntoFtc(p); return []; }],
  'blocks-kod-ino-indir': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    return [{ loc: p.getByRole('button', { name: '.ino indir' }), n: 2, pos: 'below' }];
  }],
  'blocks-ornek-pencere': [{}, async (p) => {
    await openExamplePicker(p);
    return [{ loc: p.locator('.example-picker__item-name', { hasText: /^Arcade Sürüş$/ }).first().locator('..'), n: 3, pos: 'right' }];
  }],
  'blocks-kaydet-arac-cubugu': [{}, async (p) => {
    await loadExample(p, 'Arcade Sürüş');
    return [
      { loc: p.getByRole('button', { name: 'Blokları indir' }), n: 1, pos: 'below' },
      { loc: p.getByRole('button', { name: 'Blokları yükle' }), n: 2, pos: 'below' },
    ];
  }],
  'blocks-yeniden-basla': [{}, async (p) => {
    await loadExample(p, 'Arcade Sürüş');
    await rightClickEmptyArea(p);
    return [{ loc: p.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: /Bloğunu Sil/ }).first(), n: 3, pad: 2 }];
  }],
  'blocks-surus-motor-tanimla': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    // Second "motor tanımla" in robotInit: the topmost sagMotor, 18 and ✓ on screen
    return [
      { box: await topmost(canvasText(p, /sagMotor/)), n: 4, pad: 3, pos: 'below' },
      { box: await topmost(canvasText(p, /^18$/)), n: 5, pad: 3, pos: 'below' },
      { box: await topmost(canvasText(p, /✓/)), n: 6, pad: 3, pos: 'below' },
    ];
  }],
  'blocks-surus-teleop': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    return [
      { loc: blockText(p, 'sol güç'), n: 3, pad: 3, pos: 'right' },
      { loc: blockText(p, 'sağ güç'), n: 5, pad: 3, pos: 'right' },
    ];
  }],
  'blocks-wifi-bolumu': [{}, async (p) => {
    const g = p.locator('.wifi-settings input');
    await g.nth(0).fill('Probot-Takim7');
    await p.locator('.wifi-settings__password input').first().fill('TAKIM-2026');
    await p.locator('.blocklySvg').first().click({ position: { x: 900, y: 600 } });
    return [
      { loc: g.nth(0), n: 1 },
      { loc: p.locator('.wifi-settings__password input').first(), n: 2, pos: 'below' },
    ];
  }],
  'blocks-wifi-sonuc': [{}, async (p) => {
    await p.locator('.wifi-settings input').nth(0).fill('Probot-Takim7');
    await p.locator('.wifi-settings__password input').first().fill('TAKIM-2026');
    const channel = p.locator('.wifi-settings select').first();
    const value = await channel.evaluate((s) => [...s.options].find((o) => /^\s*5\b/.test(o.textContent)).value);
    await channel.selectOption(value);
    await p.locator('.blocklySvg').first().click({ position: { x: 900, y: 600 } });
    await p.waitForTimeout(500);
    await p.getByText('PROBOT_WIFI_AP_SSID').first().evaluate((e) => e.scrollIntoView({ block: 'nearest' }));
    return [];
  }],
};

function credentials() {
  if (!process.env.BLOCKS_AUTH) return {};
  const [username, ...rest] = process.env.BLOCKS_AUTH.split(':');
  return { httpCredentials: { username, password: rest.join(':') } };
}

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, [options, setup]] of Object.entries(IMAGES)) {
    if (ONLY && !ONLY.includes(name)) continue;
    // Probot -> FTC copying goes through the system clipboard
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR',
      permissions: ['clipboard-read', 'clipboard-write'], ...credentials() });
    ctx.setDefaultTimeout(8000);
    try {
      const page = await openPage(ctx, options);
      const marks = await setup(page);
      await drawMarks(page, marks);
      await page.mouse.move(1, 899);
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, name + '.png') });
      results[name] = 'ok';
    } catch (e) {
      results[name] = 'ERROR: ' + String(e.message || e).split('\n')[0];
      // Screen at the moment of failure, for debugging
      for (const pg of ctx.pages()) await pg.screenshot({ path: path.join(OUT, 'ERROR-' + name + '.png') }).catch(() => {});
    } finally {
      await ctx.close();
    }
    console.log(name, results[name]);
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(OUT, 'capture-results.json'), JSON.stringify(results, null, 2));
