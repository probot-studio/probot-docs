// Extra Sim screenshots for the presentation decks, with the same marking and cropping as capture.mjs:
// sim-ilk-teleop-kod (workspace Kod panel with the TeleOp program selected), sim-motor-ayrinti (home page
// robot detail: hide button, Sürüş .. Link / eklem rows, wheels, first motor) and sim-motor-ayrinti-satirlar
// (the same view without the mark on the motor value boxes).
//
// Usage: PW_WS=<playwright run-server ws address> node capture-video-fix.mjs <output-dir> [name1,name2,...]
// Run from a folder where Playwright is installed. Heavy job: on a shared machine, hold the browser lock.
// Afterwards: python3 compress.py <output-dir> <img-dir> (256 colors, at most 250 KB).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://probotstudio.com/sim/';
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const MAGENTA = '#E6007E';
const WIDE = { width: 1440, height: 900 };

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefix = (s) => new RegExp('^' + escapeRe(s));

// Notification and cookie boxes are hidden with CSS instead of waiting for them
const HIDE = '.probot-consent-banner,[class*="toast"],[class*="bildirim"]{display:none!important}'
  + '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';

async function openSim(ctx) {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.addStyleTag({ content: HIDE });
  await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(300);
  return page;
}

const robot = (p, name) => p.locator('#ana-robot').getByRole('button', { name: prefix(name) }).first();
const program = (p, name) => p.locator('#ana-kod').getByRole('button', { name: prefix(name) }).first();
const game = (p) => p.locator('#ana-oyun');

async function select(p, { bot, prog, mode } = {}) {
  if (bot) { await robot(p, bot).click(); await p.waitForTimeout(700); }
  if (prog) { await program(p, prog).click(); await p.waitForTimeout(700); }
  if (mode) { await game(p).getByRole('radio', { name: mode }).click(); await p.waitForTimeout(300); }
  await p.getByText(/^Kod: /).first().waitFor({ timeout: 20000 });
}

async function run(p) {
  await p.locator('.ana__baslat').click();
  await p.locator('.sahne').waitFor({ timeout: 20000 });
  await p.waitForTimeout(800);
}

const group = (p, tab) => p.locator('.dv-tab', { hasText: tab }).first()
  .locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " dv-groupview ")][1]');

async function openMotors(p) {
  await p.locator('#ana-robot').getByRole('button', { name: 'Motorlar ve tekerler' }).click();
  await p.locator('.robot-paneli').waitFor();
  await p.waitForTimeout(400);
}

async function scrollToTop(p, loc, top = 148) {
  await loc.evaluate((el, top) => {
    let s = el.parentElement;
    while (s && !(s.scrollHeight > s.clientHeight && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
    const sc = s ?? document.scrollingElement;
    sc.scrollTop += el.getBoundingClientRect().top - top;
  }, top);
  await p.waitForTimeout(400);
}

const union = (bs) => {
  const x0 = Math.min(...bs.map((b) => b.x)), y0 = Math.min(...bs.map((b) => b.y));
  const x1 = Math.max(...bs.map((b) => b.x + b.width)), y1 = Math.max(...bs.map((b) => b.y + b.height));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
};

// --- Marking and cropping (same as capture.mjs)

async function drawMarks(page, marks) {
  const boxes = [];
  for (const m of marks) {
    const b = m.box ?? await m.loc.boundingBox();
    if (!b) throw new Error('target not visible: ' + (m.loc ?? 'box'));
    const pad = m.pad ?? 4;
    boxes.push({ x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad, n: m.n, badge: m.badge });
  }
  await page.evaluate(({ boxes, color }) => {
    document.getElementById('capture-overlay')?.remove();
    const layer = document.createElement('div');
    layer.id = 'capture-overlay';
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    for (const k of boxes) {
      const c = document.createElement('div');
      c.style.cssText = `position:absolute;left:${k.x}px;top:${k.y}px;width:${k.w}px;height:${k.h}px;border:3px solid ${color};border-radius:8px;box-shadow:0 0 0 2px #fff`;
      layer.appendChild(c);
      if (k.n != null) {
        const r = document.createElement('div');
        const pos = {
          right: [k.x + k.w - 16, k.y - 16],
          left: [k.x - 36, k.y + k.h / 2 - 16],
          below: [k.x + k.w / 2 - 16, k.y + k.h - 6],
        }[k.badge] ?? [k.x - 16, k.y - 16];
        const bx = Math.max(4, Math.min(innerWidth - 36, pos[0]));
        const by = Math.max(4, Math.min(innerHeight - 36, pos[1]));
        r.textContent = k.n;
        r.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:32px;height:32px;border-radius:50%;background:${color};color:#fff;font:700 18px/32px system-ui,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
        layer.appendChild(r);
      }
    }
    document.body.appendChild(layer);
  }, { boxes, color: MAGENTA });
  return boxes;
}

async function cropArea(page, boxes, crop, vp) {
  const parts = boxes.map((k) => ({ x: k.x - 20, y: k.y - 20, w: k.w + 40, h: k.h + 40 }));
  for (const l of crop ?? []) {
    const b = l.x != null ? l : await l.boundingBox();
    if (b) parts.push({ x: b.x, y: b.y, w: b.width, h: b.height });
  }
  let x0 = Math.min(...parts.map((p) => p.x)) - 16, y0 = Math.min(...parts.map((p) => p.y)) - 16;
  let x1 = Math.max(...parts.map((p) => p.x + p.w)) + 16, y1 = Math.max(...parts.map((p) => p.y + p.h)) + 16;
  const widen = (a, b, size, limit) => {
    if (b - a >= size) return [a, b];
    const o = (a + b) / 2;
    return [Math.max(0, Math.min(limit - size, o - size / 2)), Math.min(limit, Math.max(size, o + size / 2))];
  };
  [x0, x1] = widen(Math.max(0, x0), Math.min(vp.width, x1), 560, vp.width);
  [y0, y1] = widen(Math.max(0, y0), Math.min(vp.height, y1), 300, vp.height);
  return { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) };
}

// Move each crop edge to the nearest line that cuts no visible text, form field or mark.
// pref: per edge, the search order of offsets (outward is negative for top/left, positive for right/bottom).
async function cleanEdges(page, clip, pref = {}) {
  return page.evaluate(({ clip, pref }) => {
    const solid = [];
    const visible = (el, r) => {
      const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const hit = document.elementFromPoint(x, y);
      // Text that ignores the pointer (scene hints) cannot be hit-tested: count it as visible
      if (getComputedStyle(el).pointerEvents === 'none') return true;
      return hit && (hit === el || el.contains(hit) || hit.contains(el));
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || n.parentElement.closest('#capture-overlay')) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width && r.height && visible(n.parentElement, r)) solid.push(r);
    }
    for (const el of document.querySelectorAll('input,select,textarea')) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && visible(el, r)) solid.push(r);
    }
    // Marks and the scene hint box count as a whole
    for (const el of document.querySelectorAll('#capture-overlay > div, [class*="ipucu"]')) solid.push(el.getBoundingClientRect());
    const cutsX = (x, y0, y1) => solid.some((r) => r.left < x - 1 && r.right > x + 1 && r.bottom > y0 && r.top < y1);
    const cutsY = (y, x0, x1) => solid.some((r) => r.top < y - 1 && r.bottom > y + 1 && r.right > x0 && r.left < x1);
    const range = (a, b) => { const o = []; for (let i = a; a < b ? i <= b : i >= b; i += a < b ? 2 : -2) o.push(i); return o; };
    const order = (k, def) => (pref[k] ?? def).flatMap(([a, b]) => range(a, b));
    let x0 = clip.x, y0 = clip.y, x1 = clip.x + clip.width, y1 = clip.y + clip.height;
    const log = {};
    const pick = (k, base, test, def) => {
      for (const d of order(k, def)) if (test(base + d)) { log[k] = d; return base + d; }
      log[k] = 'none'; return base;
    };
    y0 = pick('top', y0, (y) => y >= 0 && !cutsY(y, x0, x1), [[0, -40], [2, 16]]);
    y1 = pick('bottom', y1, (y) => y <= innerHeight && !cutsY(y, x0, x1), [[0, -40], [2, 20]]);
    x0 = pick('left', x0, (x) => x >= 0 && !cutsX(x, y0, y1), [[0, -40], [2, 40]]);
    x1 = pick('right', x1, (x) => x <= innerWidth && !cutsX(x, y0, y1), [[0, -100], [2, 40]]);
    return { clip: { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) }, log };
  }, { clip, pref });
}

// --- Images

const STARTER = { bot: 'Starter Bot', prog: 'Starter Bot otonom (CRServo)' };
const TELEOP = 'Starter Bot TeleOp (CRServo)';

// Per-image window size; the robot detail needs a taller window so that the first motor's value
// boxes clear the fixed bottom strip (the width, and so the layout, stays the same)
const VIEWPORT = { 'sim-motor-ayrinti': { width: 1440, height: 960 }, 'sim-motor-ayrinti-satirlar': { width: 1440, height: 960 } };

const SHOTS = {
  // Workspace, left group: Kod tab active, the TeleOp program selected, run not started
  'sim-ilk-teleop-kod': async (p) => {
    await select(p, { ...STARTER, mode: 'Hızlı · 2B' });
    await run(p);
    const tab = p.locator('.dv-tab', { hasText: 'Kod' }).first();
    await tab.click();
    const g = group(p, 'Kod');
    const row = g.getByRole('button', { name: prefix(TELEOP) }).first();
    await row.click();
    await p.getByText("TeleOp hazır: Başlat'a bas").waitFor({ timeout: 20000 });
    await p.waitForTimeout(400);
    // The whole OpMode list: every program row in the panel
    const rows = g.getByRole('button', { name: /(TeleOp|otonom)/ });
    const n = await rows.count();
    const rowBoxes = [];
    for (let i = 0; i < n; i++) { const b = await rows.nth(i).boundingBox(); if (b) rowBoxes.push(b); }
    const tb = await tab.boundingBox();
    const list = union(rowBoxes);
    console.log('  rows:', n, 'tab:', JSON.stringify(tb), 'list:', JSON.stringify(list));
    // From the tab row (badge 1 sits under the tab, so the tool strip stays out) to just below the
    // last OpMode row; left edge of the window, 560 wide
    const y0 = tb.y - 3;
    const clip = { x: 0, y: y0, width: 560, height: list.y + list.height + 4 - y0 };
    return { marks: [{ loc: tab, n: 1, badge: 'below', pad: 1 }, { loc: row, n: 2, badge: 'right' }], clip, pref: { top: [[0, 4]] } };
  },

  // Home page, robot detail open with default values
  'sim-motor-ayrinti': (p) => motorDetail(p, true),
  // Same view without the mark on the motor value boxes, for a page whose third point is the wheels
  'sim-motor-ayrinti-satirlar': (p) => motorDetail(p, false),
};

async function motorDetail(p, markFields) {
    await select(p, STARTER);
    await openMotors(p);
    const r = p.locator('#ana-robot');
    const hide = r.getByRole('button', { name: /gizle/i }).first();
    console.log('  hide button label:', JSON.stringify(await hide.innerText()));
    // Lowest y covered by the fixed strip above the content, at the hide button's column
    await scrollToTop(p, hide, 40);
    const hb0 = await hide.boundingBox();
    const stripBottom = await hide.evaluate((el, x) => {
      for (let y = 40; y < 260; y++) {
        const hit = document.elementFromPoint(x, y);
        if (hit && document.querySelector('#ana-robot').contains(hit)) return y;
      }
      return 140;
    }, hb0.x + 4);
    await scrollToTop(p, hide, stripBottom + 12);
    const dl = p.locator('.robot-paneli dl').first();
    const motor = p.locator('.motor-ayar').first();
    const fields = motor.locator('.motor-ayar__alanlar');
    const bottom = await p.locator('.ana__alt').boundingBox().catch(() => null);
    const fb = await fields.boundingBox();
    const hb = await hide.boundingBox();
    const sec = await r.boundingBox();
    const db = await dl.boundingBox();
    console.log('  stripBottom:', stripBottom, 'hide:', JSON.stringify(hb), 'section:', JSON.stringify(sec), 'dl:', JSON.stringify(db), 'fields:', JSON.stringify(fb), 'bottom:', JSON.stringify(bottom));
    const limit = bottom ? bottom.y : 900;
    const marks = [{ loc: hide, n: 1, badge: 'below' }, { loc: dl, n: 2, badge: 'left' }];
    let y1;
    if (fb && fb.y + fb.height + 8 <= limit) {
      if (markFields) marks.push({ loc: fields, n: 3, badge: 'left' });
      y1 = Math.min(limit, fb.y + fb.height + 14);
    } else {
      console.log('  first motor value boxes do not fit above the bottom strip: mark 3 dropped');
      y1 = fb.y - 2;
    }
    // One column: from the badge left of the rows to the right edge of the Robot section
    const x0 = Math.max(0, db.x - 52), x1 = sec.x + sec.width + 8;
    const clip = { x: x0, y: hb.y - 10, width: x1 - x0, height: y1 - (hb.y - 10) };
    return { marks, clip, pref: { top: [[0, 8]], bottom: [[0, -20]] } };
}

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, prepare] of Object.entries(SHOTS)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const ctx = await browser.newContext({ viewport: VIEWPORT[name] ?? WIDE, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce' });
    ctx.setDefaultTimeout(8000);
    await ctx.route(/posthog|i\.probotstudio|googletagmanager|google-analytics/, (r) => r.abort());
    try {
      const page = await openSim(ctx);
      const { marks, crop, clip: fixed, pref } = await prepare(page);
      const vp = page.viewportSize();
      await page.mouse.move(vp.width - 2, vp.height - 2);
      await page.evaluate(() => document.activeElement?.blur?.());
      const boxes = await drawMarks(page, marks);
      await page.waitForTimeout(300);
      const rough = fixed ?? await cropArea(page, boxes, crop, vp);
      const bottom = await page.locator('.ana__alt').boundingBox().catch(() => null);
      if (bottom && bottom.y < rough.y + rough.height && bottom.y > rough.y + 200 && boxes.every((k) => k.y + k.h <= bottom.y)) {
        rough.height = Math.round(bottom.y - rough.y);
      }
      // No text, field or badge sliced at the edges
      const { clip, log } = await cleanEdges(page, rough, pref);
      console.log('  crop', JSON.stringify(rough), '->', JSON.stringify(clip), 'moves', JSON.stringify(log));
      await page.screenshot({ path: path.join(OUT, 'debug-' + name + '.png') });
      await page.screenshot({ path: path.join(OUT, name + '.png'), clip });
      results[name] = `ok ${clip.width}x${clip.height} at ${clip.x},${clip.y}`;
    } catch (e) {
      results[name] = 'ERROR: ' + String(e.message || e).split('\n')[0];
      const page = ctx.pages().at(-1);
      await page?.screenshot({ path: path.join(OUT, 'error-' + name + '.png') }).catch(() => {});
    } finally {
      await ctx.close();
    }
    console.log(name, results[name]);
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(OUT, 'capture-results.json'), JSON.stringify(results, null, 2));
