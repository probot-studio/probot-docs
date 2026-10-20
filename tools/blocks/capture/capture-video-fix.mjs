// Video fix: new Blocks screenshots for the presentation slides whose old image showed the wrong thing.
// Same helpers and marking style as capture.mjs; every image is taken in its own browser context and
// cropped to the part the slide talks about.
//
// Usage: PW_WS=<playwright run-server ws address> node capture-video-fix.mjs <output-folder> [name1,name2,...]
// Run from a folder where Playwright is installed. Heavy job: on a shared machine, hold the browser lock.
// Afterwards: python3 compress.py <output-folder> (256 colors, at most 250 KB).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://probotstudio.com/blocks/';
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const MAGENTA = '#E6007E';
const HIDE_NOTIFICATIONS = '.notifications{display:none!important}';

// Blockly uses NBSP instead of spaces in field text
const bt = (s, exact = false) => new RegExp((exact ? '^' : '') + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s\\u00a0]') + (exact ? '$' : ''));
const ftc = (page) => page.frameLocator('iframe.ftc-cerceve');
const ftcFrame = (page) => page.frames().find((f) => f.url().includes('ftc/editor.html'));
const category = (page, name) => page.getByRole('treeitem', { name, exact: true })
  .or(page.locator('.blocklyToolboxCategoryLabel, .blocklyTreeLabel, .blocklyToolboxCategory', { hasText: new RegExp('^' + name + '$') })).first();
const canvasText = (root, re) => root.locator('.blocklyBlockCanvas text', { hasText: re });

async function openPage(ctx, { mode = 'probot', viewport } = {}) {
  const narrow = viewport && viewport.width < 860;
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  // Notifications (e.g. "<name> örneği yüklendi.") stay on screen for 5 s; keep them out of the image
  await page.addStyleTag({ content: HIDE_NOTIFICATIONS });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 3000 }).catch(() => {});
  // Narrow windows get the phone card; its button turns on after 3 s
  if (narrow) await page.getByRole('button', { name: 'Yine de devam et' }).click({ timeout: 6000 }).catch(() => {});
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

async function newFtcProgram(page) {
  await page.getByRole('button', { name: 'Yeni program' }).click();
  await page.waitForTimeout(1500);
}

// Probot Blocks keeps Blockly inside its bundle (no global), so blocks are found through the SVG.
// Returns the boxes of SVG texts equal to s: zone main | flyout | bubble | bubbleflyout (mutator), with the box of the block that holds them.
async function svgTexts(page, s, zone) {
  return page.evaluate(({ s, zone }) => {
    const norm = (t) => t.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const all = [];
    const walk = (root) => {
      for (const e of root.querySelectorAll('*')) {
        if (e.tagName.toLowerCase() === 'text') all.push(e);
        if (e.shadowRoot) walk(e.shadowRoot);
      }
    };
    walk(document);
    const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    // A dropdown field ends with its arrow (e.g. "baslangic ▾"); it matches with or without the arrow
    return all.filter((e) => norm(e.textContent) === s || norm(e.textContent).replace(/\s*▾$/, '') === s).map((e) => {
      const inFlyout = !!e.closest('.blocklyFlyout');
      const z = e.closest('.blocklyBubbleCanvas') ? (inFlyout ? 'bubbleflyout' : 'bubble') : inFlyout ? 'flyout' : e.closest('.blocklyBlockCanvas') ? 'main' : 'other';
      const g = e.closest('.blocklyDraggable') || e.closest('g[data-id]');
      // block: the block with everything attached to it; shape: the block's own outline only
      const shape = g && [...g.children].find((c) => c.classList.contains('blocklyPath'));
      return { zone: z, text: box(e), block: g ? box(g) : null, shape: shape ? box(shape) : null };
    }).filter((t) => t.text.width > 0 && (!zone || t.zone === zone)).sort((a, b) => a.text.y - b.text.y || a.text.x - b.text.x);
  }, { s, zone });
}

async function svgText(page, s, zone, n = 0) {
  const list = await svgTexts(page, s, zone);
  if (!list[n]) throw new Error(`not found: "${s}" in ${zone}`);
  return list[n];
}

// Mouse drag in small steps so Blockly sees a real drag
async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 12, from.y + 6, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 18 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(500);
}

// Drags the block that holds text t so that the block's top left corner lands on target {x, y}
async function dragBlockTo(page, t, target) {
  const grab = { x: t.text.x + 3, y: t.text.y + t.text.height / 2 };
  await drag(page, grab, { x: target.x + (grab.x - t.block.x), y: target.y + (grab.y - t.block.y) });
}

// Mouth of a statement block (e.g. teleopLoop): where the first block inside goes
const mouth = (block) => ({ x: block.x + 18, y: block.y + 26 });

// Scrolls the Probot workspace so the lower lifecycle blocks have room
async function scrollWorkspace(page, dy) {
  const b = await page.locator('.blocklySvg').first().boundingBox();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
  await page.mouse.wheel(0, dy);
  await page.waitForTimeout(600);
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

// Inserts the block given as XML into the FTC loop, directly above "call Telemetry.update"
async function insertAboveUpdate(page, xmlText) {
  await ftcFrame(page).evaluate((xmlText) => {
    const ws = Blockly.getMainWorkspace();
    const update = ws.getAllBlocks(false).find((b) => b.type === 'telemetry_update');
    const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(xmlText), ws);
    update.previousConnection.targetConnection.connect(block.previousConnection);
  }, xmlText);
  await page.waitForTimeout(800);
}

// Box of an element inside the FTC frame, in page coordinates. fn(Blockly, ws) returns an SVG/DOM element.
async function ftcBox(page, fnSource) {
  const off = await page.locator('iframe.ftc-cerceve').boundingBox();
  const r = await ftcFrame(page).evaluate((src) => {
    const el = new Function('Blockly', 'ws', src)(Blockly, Blockly.getMainWorkspace());
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  }, fnSource);
  if (!r) throw new Error('ftc element not found: ' + fnSource);
  return { x: r.x + off.x, y: r.y + off.y, width: r.width, height: r.height };
}

const union = (...bs) => {
  const x = Math.min(...bs.map((b) => b.x)), y = Math.min(...bs.map((b) => b.y));
  return { x, y, width: Math.max(...bs.map((b) => b.x + b.width)) - x, height: Math.max(...bs.map((b) => b.y + b.height)) - y };
};

// Marks: [{loc | box, n}]; n is the badge number, n=null draws the frame only
async function drawMarks(page, marks) {
  const boxes = [];
  for (const { loc, box, n, pad = 6, pos = 'left' } of marks) {
    if (loc) await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    const b = box || await loc.boundingBox({ timeout: 8000 });
    if (!b) throw new Error('target not visible: ' + loc);
    boxes.push({ x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad, n, pos });
  }
  return page.evaluate(({ boxes, color }) => {
    const layer = document.createElement('div');
    layer.id = 'capture-overlay';
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    const drawn = [];
    for (const k of boxes) {
      const c = document.createElement('div');
      c.style.cssText = `position:absolute;left:${k.x}px;top:${k.y}px;width:${k.w}px;height:${k.h}px;border:3px solid ${color};border-radius:8px;box-shadow:0 0 0 2px #fff`;
      layer.appendChild(c);
      drawn.push({ x: k.x - 2, y: k.y - 2, width: k.w + 4, height: k.h + 4 });
      if (k.n != null) {
        const r = document.createElement('div');
        // The badge goes left of the frame by default; in tight spots pos=below|above|right keeps it off the text
        let bx = k.x - 40, by = k.y + k.h / 2 - 16;
        if (k.pos === 'below') { bx = k.x + k.w / 2 - 16; by = k.y + k.h + 6; }
        if (k.pos === 'above') { bx = k.x + k.w / 2 - 16; by = k.y - 40; }
        if (k.pos === 'right') { bx = k.x + k.w + 6; }
        if (k.pos === 'inside') { bx = k.x + 10; by = k.y + 10; }
        if (k.pos === 'below-right') { bx = k.x + k.w - 4; by = k.y + k.h + 4; }
        if (k.pos === 'above-left') { bx = k.x + 10; by = k.y - 40; }
        if (bx < 4) { bx = k.x; by = k.y - 40; }
        if (by < 4) { by = k.y + k.h + 6; }
        bx = Math.max(4, Math.min(innerWidth - 36, bx));
        by = Math.max(4, Math.min(innerHeight - 36, by));
        r.textContent = k.n;
        r.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:32px;height:32px;border-radius:50%;background:${color};color:#fff;font:700 18px/32px system-ui,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
        layer.appendChild(r);
        drawn.push({ x: bx - 2, y: by - 2, width: 38, height: 38 });
      }
    }
    document.body.appendChild(layer);
    return drawn;
  }, { boxes, color: MAGENTA });
}

// The crop: the content box grown to hold every frame and badge, plus a margin, kept inside the window
function clipFor(content, drawn, viewport, margin = 10) {
  const b = union({ x: content.x - margin, y: content.y - margin, width: content.width + 2 * margin, height: content.height + 2 * margin }, ...drawn.map((d) => ({ x: d.x - margin, y: d.y - margin, width: d.width + 2 * margin, height: d.height + 2 * margin })));
  const x = Math.max(0, Math.floor(b.x)), y = Math.max(0, Math.floor(b.y));
  return { x, y, width: Math.min(viewport.width, Math.ceil(b.x + b.width)) - x, height: Math.min(viewport.height, Math.ceil(b.y + b.height)) - y };
}

// Each image: [options, setup(page) -> { marks, clip }]; clip is the content box (null = whole window),
// fixed: true keeps the clip exactly as given
const IMAGES = {
  'blocks-ornek-ara-servo': [{}, async (p) => {
    await p.getByRole('button', { name: 'Örnek seç' }).click();
    await p.locator('.example-picker').waitFor();
    await p.waitForTimeout(500);
    const input = p.locator('.example-picker input').first();
    await input.fill('servo');
    await p.waitForTimeout(400);
    const card = p.locator('.example-picker__item-name', { hasText: /^Servo Testi$/ }).first().locator('..');
    const dialog = await p.locator('.example-picker').first().evaluate((e) => {
      const d = e.closest('[role="dialog"]') || e;
      const r = d.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const cb = await card.boundingBox();
    return {
      marks: [{ loc: input, n: 1 }, { loc: card, n: 2 }],
      clip: { x: dialog.x, y: dialog.y, width: dialog.width, height: Math.min(dialog.height, cb.y + cb.height + 24 - dialog.y) },
    };
  }],
  'blocks-yuva-sol-cubuk': [{}, async (p) => {
    await scrollWorkspace(p, 320);
    let loop = await svgText(p, 'teleopLoop', 'main');
    await category(p, 'Motor & Sürüş').click();
    await p.waitForTimeout(700);
    await dragBlockTo(p, await svgText(p, 'motoru sür', 'flyout'), mouth(loop.block));
    // Power slot: the 0.5 number block; the stick block goes on top of it and pushes it out
    const num = await svgText(p, '0.5', 'main');
    await category(p, 'Kumanda').click();
    await p.waitForTimeout(700);
    await dragBlockTo(p, await svgText(p, 'sol çubuk ↕ (ileri +)', 'flyout'), { x: num.block.x, y: num.block.y });
    // The number block that fell out goes to the trash can
    const loose = await svgText(p, '0.5', 'main');
    const trash = await p.locator('.blocklyTrash').first().boundingBox();
    await drag(p, { x: loose.text.x + loose.text.width / 2, y: loose.text.y + loose.text.height / 2 }, { x: trash.x + trash.width / 2, y: trash.y + trash.height / 2 });
    await p.locator('.code-preview').getByText('getLeftY').first().waitFor({ timeout: 5000 });
    await p.mouse.move(1, 899);
    loop = await svgText(p, 'teleopLoop', 'main');
    const motor = await svgText(p, 'motoru sür', 'main');
    const stick = await svgText(p, 'sol çubuk ↕ (ileri +)', 'main');
    return {
      marks: [
        { box: motor.text, n: 1, pad: 3, pos: 'left' },
        { box: stick.block, n: 2, pad: 3, pos: 'below' },
      ],
      clip: (() => { const u = union(loop.block, motor.block); return { ...u, width: Math.max(u.width, 600) }; })(),
    };
  }],
  'blocks-eger-degilse': [{}, async (p) => {
    await scrollWorkspace(p, 320);
    const loop = await svgText(p, 'teleopLoop', 'main');
    await category(p, 'Kontrol').click();
    await p.waitForTimeout(700);
    await dragBlockTo(p, await svgText(p, 'eğer', 'flyout'), mouth(loop.block));
    // The gear (mutator) icon of the eğer block
    const gear = await p.evaluate(() => {
      const norm = (t) => t.replace(/\u00a0/g, ' ').trim();
      const t = [...document.querySelectorAll('.blocklyBlockCanvas text')].find((e) => norm(e.textContent) === 'eğer' && !e.closest('.blocklyBubbleCanvas') && !e.closest('.blocklyFlyout'));
      const g = t.closest('.blocklyDraggable');
      const icon = [...g.children].find((c) => c.classList.contains('blocklyIconGroup') || c.classList.contains('blocklyMutatorIcon'));
      const r = icon.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    await p.mouse.click(gear.x + gear.width / 2, gear.y + gear.height / 2);
    await p.waitForTimeout(800);
    const container = await svgText(p, 'eğer', 'bubble');
    await dragBlockTo(p, await svgText(p, 'değilse', 'bubbleflyout'), mouth(container.block));
    await p.waitForTimeout(500);
    await p.mouse.move(1, 899);
    const inBubble = (await svgTexts(p, 'değilse', 'bubble'))[0];
    if (!inBubble) throw new Error('değilse is not under eğer in the bubble');
    const arm = await svgText(p, 'değilse', 'main');
    const bubble = await p.locator('.blocklyBubbleCanvas').first().boundingBox();
    const block = await svgText(p, 'teleopLoop', 'main');
    return {
      marks: [
        { box: gear, n: 1, pad: 3, pos: 'left' },
        { box: inBubble.block, n: 2, pad: 3, pos: 'right' },
        { box: arm.text, n: 3, pad: 3, pos: 'left' },
      ],
      // At least 600 px wide: the empty workspace right of the blocks fills the rest
      clip: (() => { const u = union(block.block, bubble); return { ...u, width: Math.max(u.width, 600) }; })(),
    };
  }],
  'blocks-blok-menusu-devre-disi': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    const b = await p.locator('.blocklyBlockCanvas .blocklyText', { hasText: bt('motor tanımla', true) }).first().boundingBox();
    await p.mouse.click(b.x + 4, b.y + b.height / 2, { button: 'right' });
    await p.waitForTimeout(500);
    return {
      marks: [{ loc: p.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: /^Bloğu Devre Dışı Bırak$/ }).first(), n: 1, pad: 2 }],
      // Same region as blocks-blok-menusu-cogalt-yakin
      clip: { x: 150, y: 112, width: 510, height: 178 }, fixed: true,
    };
  }],
  'blocks-degisken-ayarla': [{}, async (p) => {
    await loadExample(p, 'Otonom: İleri Git ve Dur');
    const init = await svgText(p, 'autonomousInit', 'main');
    const inInit = (t) => t.text.y > init.text.y && t.text.y < init.block.y + init.block.height && t.text.x > init.block.x;
    const name = (await svgTexts(p, 'baslangic ▾', 'main')).concat(await svgTexts(p, 'baslangic', 'main')).filter(inInit).sort((a, b) => a.text.y - b.text.y)[0];
    const time = (await svgTexts(p, 'geçen süre (ms)', 'main')).filter(inInit)[0];
    if (!name || !time) throw new Error('ayarla row not found');
    return {
      marks: [
        { box: name.text, n: 1, pad: 3, pos: 'left' },
        { box: time.block, n: 2, pad: 3, pos: 'above' },
      ],
      clip: init.block,
    };
  }],
  'blocks-degisken-kullan': [{}, async (p) => {
    await loadExample(p, 'Otonom: İleri Git ve Dur');
    const loop = await svgText(p, 'autonomousLoop', 'main');
    const inLoop = (t) => t.text.y > loop.text.y && t.text.y < loop.block.y + loop.block.height;
    const name = (await svgTexts(p, 'baslangic', 'main')).concat(await svgTexts(p, 'baslangic ▾', 'main')).filter(inLoop)[0];
    const limit = (await svgTexts(p, '2000', 'main')).filter(inLoop)[0];
    if (!name || !limit) throw new Error('eğer condition not found');
    return {
      marks: [
        { box: name.block, n: 1, pad: 3, pos: 'above' },
        { box: limit.text, n: 2, pad: 3, pos: 'right' },
      ],
      clip: loop.block,
    };
  }],
  'blocks-ftc-cihaz-kaldir': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await addFtcMotorBlock(p);
    const label = await ftcBox(p, `const b = ws.getAllBlocks(false).find((x) => x.type === 'dcMotor_setProperty_Number');
      const g = b.getSvgRoot(); const r = g.getBoundingClientRect();
      const v = b.getInput('VALUE').connection.targetBlock().getSvgRoot().getBoundingClientRect();
      return { getBoundingClientRect: () => ({ x: r.x, y: r.y, width: v.x - r.x - 2, height: v.bottom - r.y }) };`);
    const remove = ftc(p).locator('.ftc-sil[aria-label="solMotor cihazını kaldır"]');
    const panel = await ftc(p).locator('.ftc-donanim').boundingBox();
    return {
      marks: [
        { loc: remove, n: 1, pad: 3, pos: 'left' },
        { box: label, n: 2, pad: 3, pos: 'left' },
      ],
      clip: { x: 128, y: 100, width: 1312, height: panel.y + panel.height + 8 - 100 }, fixed: true,
    };
  }],
  'blocks-ftc-uyari-simgesi': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await addFtcMotorBlock(p);
    await ftc(p).locator('.ftc-sil[aria-label="solMotor cihazını kaldır"]').click();
    await p.waitForTimeout(800);
    const iconSrc = `const b = ws.getAllBlocks(false).find((x) => x.type === 'dcMotor_setProperty_Number');
      const g = b.getSvgRoot(); return [...g.children].find((c) => c.classList.contains('blocklyIconGroup'));`;
    const bubbleSrc = `const c = document.querySelector('.blocklyBubbleCanvas'); return c && c.querySelector('g');`;
    let bubble = await ftcBox(p, bubbleSrc).catch(() => null);
    if (!bubble || bubble.width < 20) {
      const icon = await ftcBox(p, iconSrc);
      await p.mouse.click(icon.x + icon.width / 2, icon.y + icon.height / 2);
      await p.waitForTimeout(800);
      bubble = await ftcBox(p, bubbleSrc);
    }
    // The balloon can be dragged like on screen; higher up its tail no longer lies over the block text
    // The frame goes on the balloon body only, without its tail
    const body = await ftcBox(p, `const c = document.querySelector('.blocklyBubbleCanvas'); return c && c.querySelector('rect');`);
    await p.mouse.move(1, 899);
    const icon = await ftcBox(p, iconSrc);
    const panel = await ftc(p).locator('.ftc-donanim').boundingBox();
    return {
      marks: [
        { box: icon, n: 1, pad: 3, pos: 'left' },
        { box: body, n: 2, pad: 3, pos: 'right' },
        { loc: ftc(p).getByText('+ Cihaz ekle'), n: 3 },
      ],
      clip: { x: 128, y: 100, width: 1312, height: Math.max(bubble.y + bubble.height, panel.y + panel.height) + 8 - 100 }, fixed: true,
    };
  }],
  'blocks-ftc-opmode-ayarlari': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    const name = p.locator('header.toolbar .toolbar__project input');
    await name.fill('Ilk Surus');
    const area = await ftc(p).locator('.blocklySvg').first().boundingBox();
    await p.mouse.click(area.x + area.width * 0.6, area.y + area.height * 0.7);
    await ftc(p).locator('#java-dosya', { hasText: 'IlkSurus.java' }).waitFor({ timeout: 5000 });
    await p.mouse.move(1, 899);
    const pre = await ftc(p).locator('.ftc-java pre').boundingBox();
    return {
      marks: [
        { loc: name, n: 1, pos: 'below' },
        { loc: ftc(p).locator('#project_flavor'), n: 2, pad: 3 },
        // The Grup box is empty: the badge sits inside it, off the panel texts
        { loc: ftc(p).locator('#project_group'), n: 3, pad: 3, pos: 'inside' },
        { loc: ftc(p).locator('#java-dosya'), n: 4, pad: 3, pos: 'left' },
      ],
      clip: { x: 0, y: 0, width: 1440, height: Math.round(pre.y + 6) }, fixed: true,
    };
  }],
  'blocks-ftc-telemetri-yaz': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await addFtcMotorBlock(p);
    await insertAboveUpdate(p, '<block type="telemetry_addNumericData_Number">' +
      '<value name="KEY"><shadow type="text"><field name="TEXT">Guc</field></shadow></value>' +
      '<value name="NUMBER"><shadow type="math_number"><field name="NUM">123</field></shadow>' +
      '<block type="dcMotor_getProperty_Number"><field name="IDENTIFIER">solMotorAsDcMotor</field>' +
      '<field name="PROP">Power</field><data>{"IDENTIFIER":"solMotor"}</data></block></value></block>');
    const find = `const b = ws.getAllBlocks(false).find((x) => x.type === 'telemetry_addNumericData_Number');`;
    const label = await ftcBox(p, find + `const r = b.getSvgRoot().getBoundingClientRect();
      const k = b.getInput('KEY').connection.targetBlock().getSvgRoot().getBoundingClientRect();
      return { getBoundingClientRect: () => ({ x: r.x, y: r.y, width: k.x - r.x - 2, height: k.height }) };`);
    const key = await ftcBox(p, find + `return b.getInput('KEY').connection.targetBlock().getSvgRoot();`);
    const num = await ftcBox(p, find + `return b.getInput('NUMBER').connection.targetBlock().getSvgRoot();`);
    const prog = await ftcBox(p, `return ws.getTopBlocks(false).find((x) => x.type === 'procedures_defnoreturn').getSvgRoot();`);
    return {
      marks: [
        { box: label, n: 1, pad: 3, pos: 'left' },
        { box: key, n: 2, pad: 3, pos: 'right' },
        { box: num, n: 3, pad: 3, pos: 'right' },
      ],
      clip: prog,
    };
  }],
  'blocks-ftc-blok-menusu': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await addFtcMotorBlock(p);
    const set = await canvasText(ftc(p), /^set$/).first().boundingBox();
    await p.mouse.click(set.x + 4, set.y + set.height / 2, { button: 'right' });
    await p.waitForTimeout(500);
    const item = (re) => ftc(p).locator('.blocklyWidgetDiv').getByText(re).first().locator('xpath=ancestor-or-self::*[@role="menuitem"][1]');
    const menu = await ftc(p).locator('.blocklyWidgetDiv [role="menu"]').first().boundingBox();
    const prog = await ftcBox(p, `return ws.getTopBlocks(false).find((x) => x.type === 'procedures_defnoreturn').getSvgRoot();`);
    return {
      marks: [
        { loc: item(/^Duplicate$/), n: 3, pad: 2 },
        { loc: item(/^Disable Block$/), n: null, pad: 2 },
        { loc: item(/^Delete \d+ Blocks$/), n: null, pad: 2 },
      ],
      clip: union(prog, menu),
    };
  }],
  'blocks-ftc-degisken-hiz': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await ftcFrame(p).evaluate(() => Blockly.getMainWorkspace().createVariable('hiz'));
    await ftc(p).locator('.blocklyTreeLabel, .blocklyToolboxCategoryLabel', { hasText: /^Variables$/ }).first().click();
    await p.waitForTimeout(600);
    const flyoutBlock = (re) => `const tb = ws.getToolbox ? ws.getToolbox() : ws.toolbox_;
      const fl = (ws.getFlyout && ws.getFlyout()) || (tb && (tb.getFlyout ? tb.getFlyout() : tb.flyout_));
      const ws2 = fl.getWorkspace ? fl.getWorkspace() : fl.workspace_;
      const b = ws2.getTopBlocks(true).find((x) => ${re}.test(x.toString())); return b && b.getSvgRoot();`;
    const setBox = await ftcBox(p, flyoutBlock('/^set hiz to/'));
    const getBox = await ftcBox(p, flyoutBlock('/^hiz$/'));
    return {
      marks: [
        { loc: ftc(p).locator('.blocklyFlyoutButton').first(), n: 1, pad: 3, pos: 'right' },
        { box: setBox, n: 3, pad: 3, pos: 'right' },
        { box: getBox, n: null, pad: 3 },
      ],
      // Block list with the selected Variables category, and the flyout next to it
      clip: { x: 0, y: 100, width: 450, height: 316 }, fixed: true,
    };
  }],
  'blocks-ftc-fonksiyon-ilerigit': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await ftcFrame(p).evaluate(() => {
      const ws = Blockly.getMainWorkspace();
      const def = Blockly.Xml.domToBlock(Blockly.Xml.textToDom('<block type="procedures_defnoreturn"><field name="NAME">ileriGit</field></block>'), ws);
      const prog = ws.getTopBlocks(false).find((x) => x !== def && x.type === 'procedures_defnoreturn');
      const at = prog.getRelativeToSurfaceXY();
      def.moveBy(at.x + 380 - def.getRelativeToSurfaceXY().x, at.y + 10 - def.getRelativeToSurfaceXY().y);
    });
    await insertAboveUpdate(p, '<block type="procedures_callnoreturn"><mutation name="ileriGit"></mutation></block>');
    const defSrc = `const b = ws.getTopBlocks(false).find((x) => x.type === 'procedures_defnoreturn' && x.getFieldValue('NAME') === 'ileriGit');`;
    const name = await ftcBox(p, defSrc + `const f = b.getField('NAME'); return f.getSvgRoot ? f.getSvgRoot() : f.fieldGroup_;`);
    const def = await ftcBox(p, defSrc + `return b.getSvgRoot();`);
    // The call block's own outline (its root also holds the blocks under it)
    const call = await ftcBox(p, `const b = ws.getAllBlocks(false).find((x) => x.type === 'procedures_callnoreturn');
      return [...b.getSvgRoot().children].find((c) => c.classList.contains('blocklyPath')) || b.svgPath_;`);
    const prog = await ftcBox(p, `return ws.getTopBlocks(false).find((x) => x.type === 'procedures_defnoreturn' && x.getFieldValue('NAME') !== 'ileriGit').getSvgRoot();`);
    return {
      marks: [
        { box: name, n: 1, pad: 3, pos: 'right' },
        { box: call, n: 3, pad: 3, pos: 'right' },
      ],
      clip: union(prog, def),
    };
  }],
  'blocks-durum-gostergeleri': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    const b = await p.locator('.blocklyBlockCanvas .blocklyText', { hasText: bt('kumandayı oku', true) }).first().boundingBox();
    await p.mouse.click(b.x + 4, b.y + b.height / 2, { button: 'right' });
    await p.waitForTimeout(500);
    await p.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: /^Bloğu Devre Dışı Bırak$/ }).first().click();
    await p.waitForTimeout(500);
    const empty = p.locator('.code-preview').getByText('void autonomousInit()').first();
    await empty.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    // The "örneği yüklendi" notification is gone after 5 s; then notifications are shown again
    await p.waitForTimeout(4500);
    await p.evaluate((css) => { for (const s of document.querySelectorAll('style')) if (s.textContent === css) s.remove(); }, HIDE_NOTIFICATIONS);
    await p.getByRole('button', { name: 'Blokları indir' }).click();
    const note = p.locator('.notifications').getByText('Blok projesi indirildi.').first();
    await note.waitFor({ timeout: 3000 });
    const noteBox = await note.evaluate((e) => {
      const n = e.closest('.notification') || e.closest('[class*="notification"]:not(.notifications)') || e;
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const faded = await svgText(p, 'kumandayı oku', 'main');
    // A visible "// Henüz blok eklenmedi" line (the one under void autonomousInit())
    const line = await p.locator('.code-preview').getByText('Henüz blok eklenmedi').evaluateAll((els) => {
      const r = els.map((e) => e.getBoundingClientRect()).find((b) => b.height > 0 && b.y > 100 && b.bottom < innerHeight - 10);
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    });
    if (!line) throw new Error('no visible "Henüz blok eklenmedi" line');
    await p.mouse.move(1, 899);
    return {
      marks: [
        { box: noteBox, n: 1, pad: 4 },
        { box: faded.shape, n: 3, pad: 3, pos: 'right' },
        { box: line, n: 4, pad: 2 },
      ],
      clip: null,
    };
  }],
  'blocks-dar-ekran': [{ viewport: { width: 800, height: 1100 } }, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    const panel = p.locator('.side-panel');
    // The window starts at the top of the workspace, so no block row is cut at the top edge
    await p.locator('.blocklySvg').first().evaluate((e) => window.scrollTo(0, Math.round(e.getBoundingClientRect().top + scrollY - 4)));
    await p.waitForTimeout(600);
    await p.mouse.move(1, 1099);
    const box = await panel.boundingBox();
    // The frame shows the part of the panel inside the window (the code box scrolls on its own)
    const vis = { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1100 - box.y - 8) };
    return { marks: [{ box: vis, n: 2, pad: -3, pos: 'above-left' }], clip: null };
  }],
};

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, [options, setup]] of Object.entries(IMAGES)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const viewport = options.viewport || { width: 1440, height: 900 };
    // Copy and paste need the clipboard permissions, as in capture.mjs
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'tr-TR', permissions: ['clipboard-read', 'clipboard-write'] });
    ctx.setDefaultTimeout(8000);
    try {
      const page = await openPage(ctx, options);
      const { marks, clip, fixed } = await setup(page);
      const drawn = await drawMarks(page, marks);
      await page.waitForTimeout(300);
      const shot = { path: path.join(OUT, name + '.png') };
      if (clip) shot.clip = fixed ? clip : clipFor(clip, drawn, viewport);
      await page.screenshot(shot);
      results[name] = 'ok' + (shot.clip ? ' ' + JSON.stringify(shot.clip) : '');
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
