// Blocks images of parts 02 and 04. Usage: node blocks.mjs <output> auto|teleop <example-folder>
//  auto: first autonomous program (Ilk Otonom)   teleop: driving with the gamepad (Ilk Surus)
// Each program stage is built by deleting blocks from the finished .blk file in example/; at the end of the
// run, .blk indir downloads the same file again as the site produces it.
import { SITE, log, connect, newContext, dismissNotices, mark, clearMarks, capture, union, dumpLocalStorage } from './lib.mjs';
import fs from 'fs';
const [OUT, PART, EXAMPLE] = process.argv.slice(2);
const out = (name) => `${OUT}/${name}.png`;
const AUTO = PART === 'auto';
const BLK = `${EXAMPLE}/${AUTO ? 'IlkOtonom' : 'IlkSurus'}.blk`;
const XML = fs.readFileSync(BLK, 'utf8').match(/<xml[\s\S]*?<\/xml>/)[0];
const browser = await connect();

let page, fr, f, frameBox;
// Path: index in the main chain (3) or [loop index, inner index] inside the loop ([2, 0])
async function load(remove = []) {
  await f.evaluate(({ xml, remove }) => {
    const ws = Blockly.getMainWorkspace();
    ws.clear();
    Blockly.Xml.domToWorkspace((Blockly.utils?.xml?.textToDom || Blockly.Xml.textToDom)(xml), ws);
    const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
    const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
    const top = chain(root.getInputTargetBlock('STACK'));
    const find = (p) => Array.isArray(p) ? chain(top[p[0]].getInputTargetBlock('DO'))[p[1]] : top[p];
    const targets = remove.map(find);
    for (const b of targets) { b.unplug(true); b.dispose(false); }
  }, { xml: XML, remove });
  await page.waitForTimeout(700);
}
async function blockBoxes(paths) {
  const r = await f.evaluate((paths) => {
    const ws = Blockly.getMainWorkspace();
    const root = ws.getTopBlocks(true).find((b) => b.type === 'procedures_defnoreturn');
    const chain = (b) => { const r = []; while (b) { r.push(b); b = b.getNextBlock(); } return r; };
    const top = chain(root.getInputTargetBlock('STACK'));
    const find = (p) => Array.isArray(p) ? chain(top[p[0]].getInputTargetBlock('DO'))[p[1]] : top[p];
    const svg = (b) => b.pathObject?.svgPath || b.svgPath_ || b.getSvgRoot().querySelector('path');
    return paths.map((p) => { const k = svg(find(p)).getBoundingClientRect(); return { x: k.x, y: k.y, width: k.width, height: k.height }; });
  }, paths);
  return r.map((k) => ({ ...k, x: k.x + frameBox.x, y: k.y + frameBox.y }));
}
async function flyout(types) {
  const r = await f.evaluate((types) => {
    const fl = Blockly.getMainWorkspace().getFlyout();
    const tb = fl.getWorkspace().getTopBlocks(true);
    const svg = (b) => b.pathObject?.svgPath || b.svgPath_ || b.getSvgRoot().querySelector('path');
    const list = tb.map((b) => b.type + ' ' + b.inputList.map((i) => i.fieldRow.map((x) => x.getText()).join(' ')).join(' / '));
    return { list, boxes: types.map(([type, text]) => { const b = tb.find((b) => b.type === type && (!text || b.inputList.some((i) => i.fieldRow.some((x) => x.getText() === text)))); if (!b) return null; const k = svg(b).getBoundingClientRect(); return { x: k.x, y: k.y, width: k.width, height: k.height }; }) };
  }, types);
  log('flyout', JSON.stringify(r.list).slice(0, 1500));
  if (r.boxes.some((k) => !k)) throw new Error('flyout block missing: ' + JSON.stringify(types));
  return r.boxes.map((k) => ({ ...k, x: k.x + frameBox.x, y: k.y + frameBox.y }));
}
// Left menu row (top categories such as DcMotor only expand; the blocks are under the device name row below)
const row = (name) => fr.locator('.blocklyTreeLabel').getByText(name, { exact: true }).first();
const category = async (name) => { await row(name).click(); await page.waitForTimeout(900); };
const closeFlyout = async () => { await f.evaluate(() => { const tb = Blockly.getMainWorkspace().getToolbox(); try { tb.clearSelection ? tb.clearSelection() : tb.tree_.setSelectedItem(null); } catch {} Blockly.hideChaff(); }); await page.waitForTimeout(400); };
// Program area crop: left menu included, right panel excluded
const AREA = { x: 0, y: 103, width: 760, height: 520 };
async function stage(file, remove, marked, area = AREA) {
  await load(remove);
  const k = await blockBoxes(marked);
  // In the main chain the badge goes left of the block (so it does not cover the program name or the previous block), inside the loop to the top corner
  await mark(page, k.map((box, i) => ({ box, n: i + 1, badge: Array.isArray(marked[i]) ? undefined : 'left' })));
  await capture(page, out(file), area);
  await clearMarks(page);
}
const opmode = () => page.locator('input[placeholder="Probot OpMode"]');
const kind = () => fr.locator('select').first();
async function nameAndKind(name, value) {
  await opmode().fill(name); await opmode().press('Enter');
  await kind().selectOption(value);
  await page.waitForTimeout(800);
  log('kind options', JSON.stringify(await kind().locator('option').allInnerTexts()));
}

try {
  const ctx = await newContext(browser);
  page = await ctx.newPage();
  page.on('dialog', (x) => x.accept());
  await page.goto(SITE + '/blocks/', { waitUntil: 'networkidle', timeout: 90000 });
  await dismissNotices(page);
  const ftc = page.getByRole('tab', { name: 'FTC Blocks' });
  await ftc.click();
  fr = page.frameLocator('iframe.ftc-cerceve');
  await fr.getByText('runOpMode').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1200);
  f = page.frames().find((x) => x.url().includes('ftc/editor.html'));
  frameBox = await page.locator('iframe.ftc-cerceve').boundingBox();
  await f.addStyleTag({ content: '*{caret-color:transparent!important}' }).catch(() => {});

  if (AUTO) {
    await mark(page, [{ n: 1, loc: ftc }]);
    await capture(page, out('blocks-ftc-sekme'));
    await clearMarks(page);
    const values = await fr.locator('input').evaluateAll((els) => els.map((e) => e.value));
    log('inputs', JSON.stringify(values));
    const configRow = async (name) => {
      const inp = fr.locator('input').nth(values.indexOf(name));
      return union([await inp.boundingBox(), await inp.locator('xpath=preceding::select[1]').boundingBox()], 0);
    };
    await mark(page, [{ n: 1, box: await configRow('solMotor') }, { n: 2, box: await configRow('sagMotor') }]);
    await capture(page, out('blocks-yapilandirma'), { x: 1080, y: 103, width: 360, height: 400 });
    await clearMarks(page);
    await nameAndKind('Ilk Otonom', 'AUTONOMOUS');
    await mark(page, [{ n: 1, loc: opmode() }, { n: 2, loc: kind(), badge: 'left' }]);
    await capture(page, out('blocks-opmode-otonom'));
    await clearMarks(page);
    const k = await blockBoxes([0, 1]);
    await mark(page, k.map((box, i) => ({ box, n: i + 1, badge: 'left' })));
    await capture(page, out('blocks-iskelet'), AREA);
    await clearMarks(page);
    await category('Actuators'); await category('DcMotor'); await category('solMotor');
    const mk = await flyout([['dcMotor_setProperty_Direction'], ['dcMotor_setProperty_Number', 'Power']]);
    await mark(page, [{ n: 1, loc: row('solMotor'), badge: 'left' }, { n: 2, box: mk[0], badge: 'left' }, { n: 3, box: mk[1], badge: 'left' }]);
    await capture(page, out('blocks-palet-motor'), { x: 0, y: 103, width: 900, height: 600 });
    await clearMarks(page);
    await closeFlyout();
    // Main chain of the full program: 0 direction, 1 waitForStart, 2-3 forward, 4 sleep 1500, 5-6 turn, 7 sleep 800, 8-9 stop, 10 loop
    await stage('blocks-yon', [9, 8, 7, 6, 5, 4, 3, 2], [0]);
    await stage('blocks-ileri', [9, 8, 7, 6, 5, 4], [2, 3]);
    await category('LinearOpMode');
    const sk = await flyout([['linearOpMode_sleep_Number']]);
    await mark(page, [{ n: 1, box: sk[0] }]);
    await capture(page, out('blocks-palet-sleep'), AREA);
    await clearMarks(page);
    await closeFlyout();
    await stage('blocks-bekle', [9, 8, 7, 6, 5], [4]);
    await stage('blocks-don', [9, 8], [5, 6, 7]);
    await stage('blocks-dur', [], [8, 9], { x: 0, y: 103, width: 760, height: 560 });
  } else {
    await load([]);
    // The autonomous name is typed first so that the autonomous program appears to be open
    await nameAndKind('Ilk Otonom', 'AUTONOMOUS');
    const newProgram = page.getByRole('button', { name: 'Yeni program' });
    await mark(page, [{ n: 1, loc: page.getByRole('button', { name: '.blk indir' }) }, { n: 2, loc: newProgram }]);
    await capture(page, out('blocks-yeni-program'), { x: 0, y: 0, width: 1440, height: 300 });
    await clearMarks(page);
    await newProgram.click(); await page.waitForTimeout(1500);
    await nameAndKind('Ilk Surus', 'TELEOP');
    await mark(page, [{ n: 1, loc: opmode() }, { n: 2, loc: kind(), badge: 'left' }]);
    await capture(page, out('blocks-opmode-surus'));
    await clearMarks(page);
    // Full program: 0 direction, 1 waitForStart, 2 loop { 0 left power, 1 right power, 2 telemetry }
    await stage('blocks-surus-yon', [[2, 1], [2, 0]], [0]);
    await category('Gamepad');
    const gk = await flyout([['gamepad_getProperty_Number', 'LeftStickY'], ['gamepad_getProperty_Number', 'RightStickX']]);
    await mark(page, [{ n: 1, box: gk[0] }, { n: 2, box: gk[1] }]);
    await capture(page, out('blocks-palet-gamepad'), AREA);
    await clearMarks(page);
    await closeFlyout();
    await category('Math');
    const ak = await flyout([['math_single'], ['math_arithmetic']]);
    await mark(page, [{ n: 1, box: ak[0] }, { n: 2, box: ak[1] }]);
    await capture(page, out('blocks-palet-math'), AREA);
    await clearMarks(page);
    await closeFlyout();
    await stage('blocks-surus-sol', [[2, 1]], [[2, 0]]);
    await stage('blocks-surus-sag', [], [[2, 1]]);
  }
  // .blk indir: the file the site produces is written to the example project
  await dismissNotices(page, { notifications: true });
  await page.addStyleTag({ content: '.notifications{display:block!important}' });
  const download = page.getByRole('button', { name: '.blk indir' });
  const [dl] = await Promise.all([page.waitForEvent('download'), download.click()]);
  log('downloaded', dl.suggestedFilename());
  await dl.saveAs(BLK);
  await page.waitForTimeout(700);
  await mark(page, [{ n: 1, loc: download }]);
  await capture(page, out(AUTO ? 'blocks-indir-otonom' : 'blocks-indir-surus'));
  await clearMarks(page);
  await dumpLocalStorage(page, `${OUT}/seed-blocks-${PART}.json`);
} finally { await browser.close(); }
