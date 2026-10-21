// Video fix, round 3: the power and sleep slides of part 02 (blocks-ileri, blocks-bekle, blocks-don stages of
// blocks.mjs part 'auto'). Each frame now covers the block and the value block plugged into it (0.5, 1500, -0.5,
// 800), so the values the bullets name sit inside the frame. Each image is taken in its own browser context.
// Usage: node capture-video-fix-3.mjs <output> <example-folder> [name1,name2]
import { SITE, log, connect, newContext, mark, capture } from './lib.mjs';
import fs from 'fs';
const [OUT, EXAMPLE, ONLY] = process.argv.slice(2);
const XML = fs.readFileSync(`${EXAMPLE}/IlkOtonom.blk`, 'utf8').match(/<xml[\s\S]*?<\/xml>/)[0];
// Program area crop of blocks.mjs: left menu included, right panel excluded
const AREA = { x: 0, y: 103, width: 760, height: 520 };
// Main chain of the full program: 0 direction, 1 waitForStart, 2-3 forward, 4 sleep 1500, 5-6 turn, 7 sleep 800, 8-9 stop, 10 loop
const SHOTS = [
  { name: 'blocks-ileri-guc', remove: [9, 8, 7, 6, 5, 4], marked: [2, 3] },
  { name: 'blocks-bekle-1500', remove: [9, 8, 7, 6, 5], marked: [4] },
  { name: 'blocks-don-guc', remove: [9, 8], marked: [5, 6, 7] },
].filter((s) => !ONLY || ONLY.split(',').includes(s.name));

const HIDE = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
  probot-devnote,.probot-consent,.probot-consent-banner,.notifications,[class*="whatsapp"],a[href*="wa.me"]{display:none!important}`;

async function shot(browser, { name, remove, marked }) {
  const ctx = await newContext(browser);
  ctx.setDefaultTimeout(8000);
  try {
    const page = await ctx.newPage();
    page.on('dialog', (x) => x.accept());
    await page.goto(SITE + '/blocks/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.addStyleTag({ content: HIDE });
    // Notice dialogs: closed only when already on the page, never waited for
    for (const label of ['Anladım, devam et', 'Sadece zorunlu']) {
      const b = page.getByRole('button', { name: label });
      if (await b.count()) { try { await b.first().click({ timeout: 2000 }); } catch {} }
    }
    await page.getByRole('tab', { name: 'FTC Blocks' }).click();
    const fr = page.frameLocator('iframe.ftc-cerceve');
    await fr.getByText('runOpMode').first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(1200);
    const f = page.frames().find((x) => x.url().includes('ftc/editor.html'));
    const frameBox = await page.locator('iframe.ftc-cerceve').boundingBox();
    await f.addStyleTag({ content: '*{caret-color:transparent!important}' }).catch(() => {});
    // Program name and kind, as in blocks.mjs
    const opmode = page.locator('input[placeholder="Probot OpMode"]');
    await opmode.fill('Ilk Otonom'); await opmode.press('Enter');
    await fr.locator('select').first().selectOption('AUTONOMOUS');
    await page.waitForTimeout(800);
    // Left menu as in blocks.mjs at these stages: Actuators > DcMotor > solMotor open, flyout closed
    const row = (n) => fr.locator('.blocklyTreeLabel').getByText(n, { exact: true }).first();
    for (const n of ['Actuators', 'DcMotor', 'solMotor']) { await row(n).click(); await page.waitForTimeout(900); }
    await f.evaluate(() => { const tb = Blockly.getMainWorkspace().getToolbox(); try { tb.clearSelection ? tb.clearSelection() : tb.tree_.setSelectedItem(null); } catch {} Blockly.hideChaff(); });
    await page.waitForTimeout(400);
    // Load the finished program and remove the blocks of this stage
    await f.evaluate(({ xml, remove }) => {
      const ws = Blockly.getMainWorkspace();
      ws.clear();
      Blockly.Xml.domToWorkspace((Blockly.utils?.xml?.textToDom || Blockly.Xml.textToDom)(xml), ws);
      const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
      const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
      const top = chain(root.getInputTargetBlock('STACK'));
      for (const b of remove.map((p) => top[p])) { b.unplug(true); b.dispose(false); }
    }, { xml: XML, remove });
    // Measured only after Blockly has rendered the changed program
    await page.waitForTimeout(700);
    const r = await f.evaluate((marked) => {
      const ws = Blockly.getMainWorkspace();
      const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
      const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
      const top = chain(root.getInputTargetBlock('STACK'));
      const svg = (b) => b.pathObject?.svgPath || b.svgPath_ || b.getSvgRoot().querySelector('path');
      const VALUE = Blockly.INPUT_VALUE ?? Blockly.inputTypes?.VALUE ?? 1;
      // The block and every block plugged into its value inputs (the number blocks 0.5, 1500, ...)
      const parts = (b) => [b, ...b.inputList.filter((i) => i.type === VALUE && i.connection?.targetBlock()).flatMap((i) => parts(i.connection.targetBlock()))];
      const rect = (b) => svg(b).getBoundingClientRect();
      return marked.map((p) => {
        const ks = parts(top[p]).map(rect);
        const x = Math.min(...ks.map((k) => k.x)), y = Math.min(...ks.map((k) => k.y));
        return { x, y, width: Math.max(...ks.map((k) => k.right)) - x, height: Math.max(...ks.map((k) => k.bottom)) - y, n: ks.length };
      });
    }, marked);
    const PAD = 3;
    const boxes = r.map((k) => ({ x1: k.x + frameBox.x - PAD, y1: k.y + frameBox.y - PAD, x2: k.x + k.width + frameBox.x + PAD, y2: k.y + k.height + frameBox.y + PAD }));
    // Rows are 24 px apart and a block path includes the tab below it: neighbouring frames meet halfway, 2 px apart
    for (let i = 0; i + 1 < boxes.length; i++) {
      const a = boxes[i], b = boxes[i + 1];
      if (a.y2 > b.y1 - 2) { const mid = (a.y2 - PAD + b.y1 + PAD) / 2; a.y2 = mid - 1; b.y1 = mid + 1; }
    }
    log(name, 'parts', r.map((k) => k.n).join(','), 'frames', JSON.stringify(boxes.map((k) => [k.x1, k.y1, k.x2, k.y2].map(Math.round))));
    for (const k of boxes) if (k.x2 > AREA.x + AREA.width - 4 || k.y2 > AREA.y + AREA.height - 4) log('WARNING frame not inside crop');
    await mark(page, boxes.map((k, i) => ({ box: { x: k.x1, y: k.y1, width: k.x2 - k.x1, height: k.y2 - k.y1 }, pad: 0, n: i + 1, badge: 'left' })));
    await capture(page, `${OUT}/${name}.png`, AREA);
  } finally { await ctx.close(); }
}

const browser = await connect();
try {
  for (const s of SHOTS) await shot(browser, s);
} finally { await browser.close(); }
