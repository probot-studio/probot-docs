// "Probot ile bir robot yapalım" series: shared capture helpers.
// Remote browser: PW_WS=<playwright run-server ws address>. Run from a folder where Playwright is installed.
// Heavy job: on a shared machine, hold the browser lock; each part runs on its own (timeout 300).
import { chromium } from 'playwright';
import fs from 'fs';

export const SITE = 'https://probotstudio.com';
export const MAGENTA = '#E6007E';
export const FULL = { x: 0, y: 0, width: 1440, height: 900 };
export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

export async function connect() {
  if (!process.env.PW_WS) throw new Error('PW_WS is not set');
  return chromium.connect(process.env.PW_WS);
}

/** New context. seed: { key: value } written to localStorage once (Builder and Blocks saved state). */
export async function newContext(browser, { seed = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce', acceptDownloads: true });
  ctx.setDefaultTimeout(30000);
  await ctx.addInitScript((s) => {
    window.__PROBOT_TEST__ = true;
    if (s && location.hostname === 'probotstudio.com') {
      try { if (!localStorage.getItem('__series_seed')) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); localStorage.setItem('__series_seed', '1'); } } catch {}
    }
  }, seed);
  return ctx;
}

/** Dismisses the consent / notice dialogs, disables animations and hides floating widgets (and notifications unless notifications is true). */
export async function dismissNotices(page, { notifications = false } = {}) {
  for (const label of ['Anladım, devam et', 'Sadece zorunlu']) {
    const b = page.getByRole('button', { name: label });
    if (await b.count()) { try { await b.first().click({ timeout: 3000 }); } catch {} }
  }
  await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    probot-devnote,.probot-consent,.probot-consent-banner,[class*="whatsapp"],a[href*="wa.me"]{display:none!important}
    ${notifications ? '' : '.notifications{display:none!important}'}` });
  await page.waitForTimeout(300);
}

/** targets: [{ loc | box:{x,y,width,height}, n, pad, badge: 'right' | 'left' }] (badge defaults to the top-left corner; 'left' centers it left of the box) */
export async function mark(page, targets) {
  const boxes = [];
  for (const t of targets) {
    const b = t.box ?? await t.loc.first().boundingBox();
    if (!b) throw new Error('target not visible: ' + (t.n ?? '') + ' ' + (t.loc ?? ''));
    const pad = t.pad ?? 4;
    boxes.push({ x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad, n: t.n, right: t.badge === 'right', left: t.badge === 'left' });
  }
  await page.evaluate(({ boxes, color }) => {
    document.getElementById('series-marker')?.remove();
    const layer = document.createElement('div');
    layer.id = 'series-marker';
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    for (const k of boxes) {
      const c = document.createElement('div');
      c.style.cssText = `position:absolute;left:${k.x}px;top:${k.y}px;width:${k.w}px;height:${k.h}px;border:3px solid ${color};border-radius:6px;box-sizing:border-box`;
      layer.appendChild(c);
      if (k.n != null) {
        const r = document.createElement('div');
        const bx = Math.max(2, Math.min(innerWidth - 28, k.left ? k.x - 30 : (k.right ? k.x + k.w : k.x) - 13));
        const by = Math.max(2, Math.min(innerHeight - 28, k.left ? k.y + k.h / 2 - 13 : k.y - 13));
        r.textContent = k.n;
        r.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:26px;height:26px;border-radius:50%;background:${color};color:#fff;font:700 15px/26px system-ui,sans-serif;text-align:center`;
        layer.appendChild(r);
      }
    }
    document.body.appendChild(layer);
  }, { boxes, color: MAGENTA });
}
export const clearMarks = (page) => page.evaluate(() => document.getElementById('series-marker')?.remove());

/** Cropped capture; clip = {x,y,width,height} in CSS px, clamped to the 1440x900 viewport. The mouse is parked in the corner first. */
export async function capture(page, file, clip = FULL) {
  await page.mouse.move(1439, 899).catch(() => {});
  await page.waitForTimeout(200);
  const c = { x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)) };
  c.width = Math.min(1440 - c.x, Math.round(clip.width)); c.height = Math.min(900 - c.y, Math.round(clip.height));
  await page.screenshot({ path: file, clip: c, animations: 'disabled', timeout: 60000 });
  log('captured', file);
}

/** Union of the boxes, expanded by margin */
export function union(boxes, margin = 12) {
  const xs = boxes.map((k) => k.x), ys = boxes.map((k) => k.y);
  const x2 = boxes.map((k) => k.x + k.width), y2 = boxes.map((k) => k.y + k.height);
  const x = Math.min(...xs) - margin, y = Math.min(...ys) - margin;
  return { x, y, width: Math.max(...x2) + margin - x, height: Math.max(...y2) + margin - y };
}

/** Writes the page's localStorage (keys accepted by filter) to a JSON file; used as the seed of a later part. */
export async function dumpLocalStorage(page, file, filter = () => true) {
  const d = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
  const s = Object.fromEntries(Object.entries(d).filter(([k]) => filter(k)));
  fs.writeFileSync(file, JSON.stringify(s));
  log('localStorage', file, Object.keys(s).map((k) => `${k}:${s[k].length}`).join(' '));
}
