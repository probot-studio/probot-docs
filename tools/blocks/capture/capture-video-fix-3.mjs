// Video fix, third round: slide-only Blocks screenshots for the deck pages the frame review flagged
// (a selected block with its copy notification, the FTC example picker, the new program steps and the
// .java download notification). Same helpers and marking style as capture-video-fix.mjs; every image is
// taken in its own browser context.
//
// Usage: PW_WS=<playwright run-server ws address> node capture-video-fix-3.mjs <output-folder> [name1,name2,...]
// Run from a folder where Playwright is installed. Heavy job: on a shared machine, hold the browser lock.
// Afterwards: python3 compress.py <output-folder> (256 colors, at most 250 KB), then copy each file into
// the img/ folder of the deck that uses it (these images are slide-only, never into tools/blocks/img/).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://probotstudio.com/blocks/';
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const MAGENTA = '#E6007E';
const HIDE_NOTIFICATIONS = '.notifications{display:none!important}';

const ftc = (page) => page.frameLocator('iframe.ftc-cerceve');
const ftcFrame = (page) => page.frames().find((f) => f.url().includes('ftc/editor.html'));

async function openPage(ctx, { mode = 'probot' } = {}) {
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  // Notifications (e.g. "<name> örneği yüklendi.") stay on screen for 5 s; keep them out of the image
  await page.addStyleTag({ content: HIDE_NOTIFICATIONS });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 3000 }).catch(() => {});
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

// Shows notifications again (they are hidden while the page loads)
const showNotifications = (page) => page.evaluate((css) => {
  for (const s of document.querySelectorAll('style')) if (s.textContent === css) s.remove();
}, HIDE_NOTIFICATIONS);

// Box of the notification box that holds text
async function noteBox(page, text) {
  const note = page.locator('.notifications').getByText(text).first();
  await note.waitFor({ timeout: 4000 });
  return note.evaluate((e) => {
    const n = e.closest('.notification') || e.closest('[class*="notification"]:not(.notifications)') || e;
    const r = n.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
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
// Returns the boxes of SVG texts equal to s in the main workspace, with the box of the block that holds them.
async function svgTexts(page, s) {
  return page.evaluate((s) => {
    const norm = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return [...document.querySelectorAll('.blocklyBlockCanvas text')]
      .filter((e) => !e.closest('.blocklyFlyout') && !e.closest('.blocklyBubbleCanvas'))
      .filter((e) => norm(e.textContent) === s || norm(e.textContent).replace(/\s*▾$/, '') === s)
      .map((e) => {
        const g = e.closest('.blocklyDraggable') || e.closest('g[data-id]');
        // block: the block with everything attached to it; shape: the block's own outline only
        const shape = g && [...g.children].find((c) => c.classList.contains('blocklyPath'));
        return { text: box(e), block: g ? box(g) : null, shape: shape ? box(shape) : null };
      }).filter((t) => t.text.width > 0);
  }, s);
}

async function svgText(page, ...names) {
  for (const s of names) {
    const list = await svgTexts(page, s);
    if (list[0]) return list[0];
  }
  throw new Error('not found: ' + names.join(' | '));
}

// Mouse drag in small steps so Blockly sees a real drag
async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x - 6, from.y + 4, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 18 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(500);
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

// Marks: [{loc | box, n}]; n is the badge number, n=null draws the frame only; at: {x, y} places the badge exactly
async function drawMarks(page, marks) {
  const boxes = [];
  for (const { loc, box, n, pad = 6, pos = 'left', at = null } of marks) {
    if (loc) await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    const b = box || await loc.boundingBox({ timeout: 8000 });
    if (!b) throw new Error('target not visible: ' + loc);
    boxes.push({ x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad, n, pos, at });
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
        if (bx < 4) { bx = k.x; by = k.y - 40; }
        if (by < 4) { by = k.y + k.h + 6; }
        if (k.at) { bx = k.at.x; by = k.at.y; }
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

// Each image: [options, setup(page) -> { marks, clip, maxWidth }]; clip is the content box (null = whole window).
// The marks are drawn after setup; screenshots wait for nothing else, so notifications (5 s) are still on screen.
const IMAGES = {
  'blocks-tank-surus-kopyalandi': [{}, async (p) => {
    await loadExample(p, 'Tank Sürüş');
    // The "Tank Sürüş örneği yüklendi." notification is gone after 5 s; then notifications are shown again
    await p.waitForTimeout(4000);
    await showNotifications(p);
    // The tank sürüş row runs under the side panel: move the workspace left until the teleopLoop block is clear of it
    const panel = await p.locator('.side-panel').first().boundingBox();
    for (let i = 0; i < 3; i++) {
      const loop = await svgText(p, 'teleopLoop');
      const over = loop.block.x + loop.block.width - (panel.x - 24);
      if (over <= 0) break;
      const before = loop.block.x;
      await drag(p, { x: 900, y: 640 }, { x: 900 - over - 20, y: 640 });
      const after = (await svgText(p, 'teleopLoop')).block.x;
      if (Math.abs(after - before) < 5) {
        const ws = await p.locator('.blocklySvg').first().boundingBox();
        await p.mouse.move(ws.x + ws.width * 0.5, ws.y + ws.height * 0.7);
        await p.mouse.wheel(over + 20, 0);
        await p.waitForTimeout(600);
      }
    }
    const loop = await svgText(p, 'teleopLoop');
    if (loop.block.x + loop.block.width > panel.x - 4) throw new Error('teleopLoop still under the side panel');
    const tank = await svgText(p, 'tank sürüş - sol motor', 'tank sürüş');
    await p.mouse.click(tank.text.x + 4, tank.text.y + tank.text.height / 2);
    await p.waitForTimeout(400);
    await p.keyboard.press('Control+c');
    const note = await noteBox(p, 'Blok kopyalandı.');
    await p.mouse.move(1, 899);
    const sel = await svgText(p, 'tank sürüş - sol motor', 'tank sürüş');
    const block = (await svgText(p, 'teleopLoop')).block;
    return {
      marks: [
        { box: sel.shape, n: 1, pad: 3, pos: 'left' },
        { box: note, n: 2, pad: 4 },
      ],
      clip: union(block, note),
      maxWidth: 1100,
    };
  }],
  'blocks-ftc-ornek-sec-tank': [{ mode: 'ftc' }, async (p) => {
    const button = p.getByRole('button', { name: 'Örnek seç' });
    await button.click();
    await p.locator('.example-picker').first().waitFor();
    await p.waitForTimeout(500);
    const card = p.locator('.example-picker__item-name', { hasText: 'Tank Şasi TeleOp' }).first().locator('..');
    await card.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await p.mouse.move(1, 899);
    return {
      marks: [
        { loc: button, n: 1, pos: 'below' },
        { loc: card, n: 2, pos: 'right' },
      ],
      clip: null,
    };
  }],
  'blocks-ftc-yeni-program-adimlar': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    await p.mouse.move(1, 899);
    // Top row of the to runOpMode block: from the block's left edge to the end of the name field
    const row = await ftcBox(p, `const b = ws.getTopBlocks(false).find((x) => x.type === 'procedures_defnoreturn');
      const r = b.getSvgRoot().getBoundingClientRect();
      const f = b.getField('NAME'); const n = (f.getSvgRoot ? f.getSvgRoot() : f.fieldGroup_).getBoundingClientRect();
      return { getBoundingClientRect: () => ({ x: r.x, y: r.y, width: n.right - r.x, height: n.bottom - r.y + 2 }) };`);
    return {
      marks: [
        { loc: p.getByRole('button', { name: '.blk indir' }), n: 1, pos: 'below' },
        { loc: p.getByRole('button', { name: 'Yeni program' }), n: 2, pos: 'below' },
        { box: row, n: 3, pad: 3, pos: 'right' },
      ],
      clip: null,
    };
  }],
  'blocks-ftc-java-indir-bildirim': [{ mode: 'ftc' }, async (p) => {
    await newFtcProgram(p);
    const name = p.locator('header.toolbar .toolbar__project input');
    const value = await name.inputValue();
    if (value !== 'Probot OpMode') throw new Error('OpMode box reads ' + JSON.stringify(value));
    await showNotifications(p);
    const button = p.getByRole('button', { name: '.java indir' });
    const [download] = await Promise.all([p.waitForEvent('download'), button.click()]);
    const note = await noteBox(p, 'ProbotOpMode.java indirildi.');
    await p.mouse.move(1, 899);
    await ftc(p).locator('#java-dosya', { hasText: 'ProbotOpMode.java' }).waitFor({ timeout: 3000 });
    await ftc(p).locator('.ftc-java pre', { hasText: 'public class ProbotOpMode' }).waitFor({ timeout: 3000 });
    const file = download.suggestedFilename();
    if (file !== 'ProbotOpMode.java') throw new Error('download is ' + file);
    // Badge 2 goes just under the button, above the OpMode card's ".blk dosyasına yazılır" hint
    const b = await button.boundingBox();
    const hint = await ftc(p).getByText('.blk dosyasına yazılır').first().boundingBox().catch(() => null);
    const at = { x: Math.round(b.x + b.width / 2 - 16), y: Math.round(b.y + b.height + 6) };
    if (hint && at.y + 34 > hint.y) at.y = Math.round(Math.max(b.y + b.height - 4, hint.y - 35));
    return {
      marks: [
        { loc: name, n: 1, pos: 'below' },
        { loc: button, n: 2, pad: 3, at },
        { box: note, n: 3, pad: 4 },
      ],
      clip: null,
    };
  }],
};

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, [options, setup]] of Object.entries(IMAGES)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const viewport = { width: 1440, height: 900 };
    // Copy and paste need the clipboard permissions, as in capture.mjs
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'tr-TR', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
    ctx.setDefaultTimeout(8000);
    try {
      const page = await openPage(ctx, options);
      const { marks, clip, maxWidth } = await setup(page);
      const drawn = await drawMarks(page, marks);
      await page.waitForTimeout(200);
      const shot = { path: path.join(OUT, name + '.png') };
      if (clip) {
        const c = clipFor(clip, drawn, viewport);
        if (!maxWidth || c.width <= maxWidth) shot.clip = c;
      }
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
