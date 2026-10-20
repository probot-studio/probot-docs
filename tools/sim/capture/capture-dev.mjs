// Sim docs: screenshots of features that are in the development build but not yet on prod.
// Same marking and cropping rules as capture.mjs; the address and the login come from environment variables.
//
// Usage:
//   PW_WS=<playwright run-server ws address> SIM_URL=<dev Sim address> DEV_AUTH=<user:password> \
//   JAVA_SAMPLE=<path to StarterBotTeleop.java> node capture-dev.mjs <output-dir> [name1,name2,...]
// The login is never written to the script or the log. Run from a folder where Playwright is installed; hold the browser lock.
// Afterwards: python3 compress.py <output-dir> <img-dir>
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = process.env.SIM_URL;
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const MAGENTA = '#E6007E';
const WIDE = { width: 1440, height: 900 };
const AUTH = process.env.DEV_AUTH ?? '';
const SEP = AUTH.indexOf(':');
const httpCredentials = SEP > 0 ? { username: AUTH.slice(0, SEP), password: AUTH.slice(SEP + 1) } : undefined;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefix = (s) => new RegExp('^' + escapeRe(s));

// --- Opening and selection

async function openSim(ctx) {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
  await page.locator('#ana-robot').waitFor({ timeout: 60000 });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 10000 }).catch(() => {});
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  await page.addStyleTag({ content: '.probot-consent-banner{display:none!important}' });
  await page.waitForTimeout(800);
  return page;
}

const robot = (p, name) => p.locator('#ana-robot').getByRole('button', { name: prefix(name) }).first();
const program = (p, name) => p.locator('#ana-kod').getByRole('button', { name: prefix(name) }).first();

/** bot = robot name, prog = program name */
async function select(p, { bot, prog } = {}) {
  if (bot) { await robot(p, bot).click(); await p.waitForTimeout(700); }
  if (prog) { await program(p, prog).click(); await p.waitForTimeout(700); }
  await p.getByText(/^Kod: /).first().waitFor({ timeout: 30000 });
}

// --- Marking and cropping

/** marks: [{ loc | box:{x,y,width,height}, n, pad, badge, center }] -> draws them, returns the boxes */
async function drawMarks(page, marks) {
  const boxes = [];
  for (const m of marks) {
    if (m.center) { await m.loc.evaluate((el) => el.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
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

/** Crop area: union of the marks and the given elements + margin, at least 560x300 */
async function cropArea(page, boxes, crop, vp) {
  if (crop === 'full') return { x: 0, y: 0, width: vp.width, height: vp.height };
  const parts = boxes.map((k) => ({ x: k.x - 20, y: k.y - 20, w: k.w + 40, h: k.h + 40 }));
  for (const l of crop ?? []) {
    const b = l.x != null ? l : await l.boundingBox();
    if (b) parts.push({ x: b.x, y: b.y, w: b.width, h: b.height });
  }
  if (!parts.length) return { x: 0, y: 0, width: vp.width, height: vp.height };
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

// --- Images

const START = { bot: 'Starter Bot', prog: 'Starter Bot otonom (CRServo)' };

const SHOTS = {
  // arayuz.md: home page heading and step strip
  'sim-arayuz-adim-seridi': async (p) => {
    await select(p, START);
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(400);
    const steps = p.getByRole('list', { name: 'Adımlar' });
    return {
      marks: [
        { loc: steps.locator('li').filter({ hasText: 'Robot' }).first(), n: 1 },
        { loc: steps.getByRole('button', { name: /Başlat/ }), n: 2 },
      ], crop: [p.locator('h1').first(), steps],
    };
  },
  // arayuz.md: Başlat block at the end of the page
  'sim-arayuz-son-baslat': async (p) => {
    await select(p, START);
    const end = p.getByRole('region', { name: 'Başlat' }).or(p.locator('section.ana-son')).first();
    return {
      marks: [{ loc: end.getByRole('button', { name: /Başlat/ }), n: 1, center: true }],
      crop: [end],
    };
  },
  // programi-sec.md: Java buttons
  'sim-program-java-ac': async (p) => {
    await select(p, START);
    const code = p.locator('#ana-kod');
    return {
      marks: [
        { loc: code.getByRole('button', { name: 'Android Studio klasörü aç' }), n: 1, center: true },
      ], crop: [code.getByRole('button', { name: 'Dosya aç (.blk, .java)' }), code.getByText('OpMode', { exact: true }).first()],
    };
  },
  // programi-sec.md: OpMode list after a .java file is opened
  'sim-program-java-sonuc': async (p) => {
    await select(p, START);
    const code = p.locator('#ana-kod');
    await code.locator('input[type=file][accept=".blk,.java"]').setInputFiles(process.env.JAVA_SAMPLE);
    const row = code.getByRole('button', { name: /^StarterBotTeleop/ }).first();
    await row.waitFor({ timeout: 30000 });
    await p.getByText(/^Kod: StarterBotTeleop/).first().waitFor({ timeout: 60000 });
    return {
      marks: [{ loc: row, n: 4, center: true }],
      crop: [code.getByText(/Android Studio: /).first()],
    };
  },
  // programi-sec.md: the Android Studio line in the Kod section while a Java project is open
  'sim-program-java-yeniden': async (p) => {
    await select(p, START);
    const code = p.locator('#ana-kod');
    await code.locator('input[type=file][accept=".blk,.java"]').setInputFiles(process.env.JAVA_SAMPLE);
    const line = code.getByText(/^Android Studio: /).first();
    await line.waitFor({ timeout: 30000 });
    await p.getByText(/^Kod: StarterBotTeleop/).first().waitFor({ timeout: 60000 });
    return {
      marks: [{ loc: line, n: 2, center: true }],
      crop: [code.getByRole('button', { name: 'Java projesini kaldır' })],
    };
  },
  // sorunlar.md: Hata bildir in the site header
  'sim-hata-bildir-baslik': async (p) => {
    const btn = p.locator('probot-header').locator('.hatabtn');
    await btn.waitFor({ timeout: 10000 });
    return {
      marks: [{ loc: btn, n: 1 }],
      crop: [p.locator('probot-header')],
    };
  },
};

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, prepare] of Object.entries(SHOTS)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const ctx = await browser.newContext({ viewport: WIDE, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce', httpCredentials });
    await ctx.route(/posthog|i\.probotstudio|googletagmanager|google-analytics/, (r) => r.abort());
    try {
      const page = await openSim(ctx);
      const { marks, crop } = await prepare(page, ctx);
      const vp = page.viewportSize();
      await page.mouse.move(vp.width - 2, vp.height - 2);
      if (marks.length > 3) throw new Error('at most 3 marks');
      await page.evaluate(() => document.activeElement?.blur?.());
      const boxes = await drawMarks(page, marks);
      await page.waitForTimeout(300);
      const clip = await cropArea(page, boxes, crop, vp);
      // Keep the fixed bottom strip out of the crop when it holds no mark
      const bottom = await page.locator('.ana__alt').boundingBox().catch(() => null);
      if (bottom && bottom.y < clip.y + clip.height && bottom.y > clip.y + 200 && boxes.every((k) => k.y + k.h <= bottom.y)) {
        clip.height = Math.round(bottom.y - clip.y);
      }
      await page.screenshot({ path: path.join(OUT, name + '.png'), clip });
      results[name] = `ok ${clip.width}x${clip.height}`;
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
fs.writeFileSync(path.join(OUT, 'capture-dev-results.json'), JSON.stringify(results, null, 2));
