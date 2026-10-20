// Video fix: wider crops of the two TeleOp power slides in part 04, so the RightStickX block at the end of each row
// is visible. Same program states as blocks.mjs part 'teleop' (stages blocks-surus-sol and blocks-surus-sag),
// only the crop changes. Each image is taken in its own browser context.
// Usage: node capture-video-fix.mjs <output> <example-folder> [name1,name2]
import { SITE, log, connect, newContext, mark, capture } from './lib.mjs';
import fs from 'fs';
const [OUT, EXAMPLE, ONLY] = process.argv.slice(2);
const XML = fs.readFileSync(`${EXAMPLE}/IlkSurus.blk`, 'utf8').match(/<xml[\s\S]*?<\/xml>/)[0];
// Workspace only: from the runOpMode block to past the right end of the power rows; left menu and right panel excluded
const CROP = { x: 140, y: 103, width: 790, height: 260 };
// Full program: 0 direction, 1 waitForStart, 2 loop { 0 left power, 1 right power, 2 telemetry }
const SHOTS = [
  { name: 'blocks-surus-sol-tam', remove: [[2, 1]], marked: [[2, 0]] },
  { name: 'blocks-surus-sag-tam', remove: [], marked: [[2, 1]] },
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
    await opmode.fill('Ilk Surus'); await opmode.press('Enter');
    await fr.locator('select').first().selectOption('TELEOP');
    await page.waitForTimeout(800);
    // Load the finished program and remove the blocks of this stage
    await f.evaluate(({ xml, remove }) => {
      const ws = Blockly.getMainWorkspace();
      ws.clear();
      Blockly.Xml.domToWorkspace((Blockly.utils?.xml?.textToDom || Blockly.Xml.textToDom)(xml), ws);
      const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
      const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
      const top = chain(root.getInputTargetBlock('STACK'));
      const find = (p) => Array.isArray(p) ? chain(top[p[0]].getInputTargetBlock('DO'))[p[1]] : top[p];
      for (const b of remove.map(find)) { b.unplug(true); b.dispose(false); }
    }, { xml: XML, remove });
    // Measured only after Blockly has rendered the changed program
    await page.waitForTimeout(700);
    const r = await f.evaluate((marked) => {
      const ws = Blockly.getMainWorkspace();
      const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
      const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
      const top = chain(root.getInputTargetBlock('STACK'));
      const find = (p) => Array.isArray(p) ? chain(top[p[0]].getInputTargetBlock('DO'))[p[1]] : top[p];
      const svg = (b) => b.pathObject?.svgPath || b.svgPath_ || b.getSvgRoot().querySelector('path');
      const box = (el) => { const k = el.getBoundingClientRect(); return { x: k.x, y: k.y, width: k.width, height: k.height }; };
      return { marked: marked.map((p) => box(svg(find(p)))), program: box(root.getSvgRoot()) };
    }, marked);
    const shift = (k) => ({ ...k, x: k.x + frameBox.x, y: k.y + frameBox.y });
    const prog = shift(r.program);
    log(name, 'program box', JSON.stringify(prog), 'right end', Math.round(prog.x + prog.width), 'bottom', Math.round(prog.y + prog.height));
    if (prog.x < CROP.x || prog.x + prog.width > CROP.x + CROP.width - 6 || prog.y + prog.height > CROP.y + CROP.height - 6) log('WARNING program not inside crop');
    // The badge sits in the empty loop column left of the frame, near its bottom: in the top-left corner (blocks.mjs
    // stage()) it covers the word repeat, which the slide names. A zero-size target carries the badge only.
    const PAD = 4;
    await mark(page, r.marked.flatMap((b, i) => {
      const k = shift(b);
      return [{ box: k, pad: PAD }, { box: { x: k.x - PAD - 16, y: k.y + k.height + PAD - 14, width: 0, height: 0 }, pad: 0, n: i + 1 }];
    }));
    await capture(page, `${OUT}/${name}.png`, CROP);
  } finally { await ctx.close(); }
}

const browser = await connect();
try {
  for (const s of SHOTS) await shot(browser, s);
} finally { await browser.close(); }
