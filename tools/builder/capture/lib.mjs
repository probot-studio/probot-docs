// Shared helpers: prepare the Builder production page, draw markers, take cropped captures.
// Every capture-*.mjs script imports these helpers.
import { chromium } from 'playwright';
import fs from 'fs';
export const URL = 'https://probotstudio.com/builder/';
// Remote browser: if the PW_WS environment variable (ws://...) is set, connect to it; otherwise launch a local Chromium.
// A failed connect error can quote the ws address; print a fixed message instead.
export async function connect() {
  if (process.env.PW_WS) {
    return chromium.connect(process.env.PW_WS).catch(() => {
      console.error('cannot connect to the Playwright server in PW_WS');
      process.exit(1);
    });
  }
  return chromium.launch();
}
// Open a fresh context + page on the Builder. clean = clear localStorage before the app loads.
export async function prepare(browser, { dsf = 1, clean = true } = {}) {
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:dsf, locale:'tr-TR', reducedMotion:'reduce' });
  const page = await ctx.newPage();
  if (clean) await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto(URL, { waitUntil:'networkidle', timeout:90000 });
  await dismissNotices(page);
  return { ctx, page };
}
// Dismiss the consent / notice dialogs and disable animations and floating widgets.
export async function dismissNotices(page) {
  for (const label of ['Anladım, devam et','Sadece zorunlu']) {
    const b = page.getByRole('button', { name:label });
    if (await b.count()) { try { await b.first().click({ timeout:3000 }); } catch {} }
  }
  await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    probot-devnote,.probot-consent,[class*="whatsapp"],a[href*="wa.me"]{display:none!important}` });
  await page.waitForTimeout(300);
}
// Markers: each target is either an element (loc: locator) or a box (box: {x,y,width,height});
// n = badge number, pad = padding around the box.
// at = where the badge sits, so it does not cover the label it marks (default 'tl'):
//   'tl' / 'tr' / 'bl' / 'br' = on that corner of the frame; 'l' / 'r' = outside the left / right edge, at mid height;
//   'lt' = outside the left edge, at the top; 'above' / 'above-r' = above the frame, at its left / right end.
// dx, dy = extra badge offset in px. The badge is kept inside the 1440 x 900 viewport.
export async function mark(page, targets) {
  const boxes = [];
  for (const t of targets) {
    let r = t.box;
    if (!r) { const bb = await t.loc.first().boundingBox(); if (!bb) throw new Error('no bounding box: '+t.n); r = bb; }
    boxes.push({ ...r, n: t.n, pad: t.pad ?? 4, at: t.at ?? 'tl', dx: t.dx ?? 0, dy: t.dy ?? 0 });
  }
  await page.evaluate((bs) => {
    document.querySelectorAll('.docs-marker').forEach(e => e.remove());
    for (const k of bs) {
      const d = document.createElement('div'); d.className = 'docs-marker';
      const L = k.x-k.pad, T = k.y-k.pad, W = k.width+2*k.pad, H = k.height+2*k.pad;
      Object.assign(d.style, { position:'fixed', left:L+'px', top:T+'px', width:W+'px', height:H+'px',
        border:'3px solid #E6007E', borderRadius:'6px', zIndex:2147483646, pointerEvents:'none', boxSizing:'border-box' });
      if (k.n != null) {
        // badge position (22 px circle), relative to the inside of the 3 px frame border
        const pos = { tl:[-13,-13], tr:[W-16,-13], bl:[-13,H-16], br:[W-16,H-16], l:[-28,H/2-14], r:[W,H/2-14], lt:[-28,-3], above:[-3,-28], 'above-r':[W-25,-28] }[k.at] || [-13,-13];
        const ax = Math.min(1440-25, Math.max(5, L+3+pos[0]+k.dx)), ay = Math.min(900-25, Math.max(5, T+3+pos[1]+k.dy));
        const r = document.createElement('div'); r.textContent = k.n;
        Object.assign(r.style, { position:'absolute', left:(ax-L-3)+'px', top:(ay-T-3)+'px', width:'22px', height:'22px', borderRadius:'50%', background:'#E6007E',
          color:'#fff', font:'700 13px/22px system-ui,sans-serif', textAlign:'center' });
        d.appendChild(r);
      }
      document.body.appendChild(d);
    }
  }, boxes.map(k => ({ x:k.x, y:k.y, width:k.width, height:k.height, n:k.n, pad:k.pad, at:k.at, dx:k.dx, dy:k.dy })));
}
// Remove every marker overlay (anything with the docs-marker class).
export async function clearMarks(page) { await page.evaluate(() => document.querySelectorAll('.docs-marker').forEach(e => e.remove())); }
// Cropped capture; clip = {x,y,width,height} in CSS px. The mouse is parked in the corner first.
export async function capture(page, file, clip) {
  await page.mouse.move(1439, 899);
  await page.screenshot({ path: file, clip, type: file.endsWith('.jpg') ? 'jpeg' : 'png', animations:'disabled' });
}
// Load a ready-made robot from the empty-scene card by its display name.
export async function loadRobot(page, name = 'Starter Bot') {
  await page.locator(`[data-bos-sahne-robot][title^="${name} "]`).first().click();
  await page.waitForTimeout(5000);
}

// --- 3D scene helpers (store hooks exposed by the production bundle when __PROBOT_TEST__ is set) ---
export async function prepare3d(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:opts.dsf ?? 1, locale:'tr-TR', reducedMotion:'reduce', acceptDownloads:true });
  ctx.setDefaultTimeout(120000);
  const page = await ctx.newPage();
  await page.addInitScript(({ clean }) => { window.__PROBOT_TEST__ = true; if (clean) { try { localStorage.clear(); } catch {} } }, { clean: opts.clean ?? true });
  await page.goto(URL, { waitUntil:'networkidle', timeout:120000 });
  await page.waitForFunction(() => !!window.__robot && !!window.__controls?.current, null, { timeout:60000 });
  await dismissNotices(page);
  return { ctx, page };
}
// World point -> page coordinate (CSS px)
export async function toScreen(page, p) {
  return page.evaluate((p) => {
    const cam = window.__controls.current.object; cam.updateMatrixWorld();
    const V = cam.position.constructor; const v = new V(p[0], p[1], p[2]).project(cam);
    const c = document.querySelector('canvas').getBoundingClientRect();
    return { x: c.left + (v.x + 1) / 2 * c.width, y: c.top + (1 - v.y) / 2 * c.height };
  }, p);
}
// All parts in the scene: id, type, world position, length in holes.
export async function listParts(page) {
  return page.evaluate(() => window.__robot.getState().parts.map(p => ({ id:p.id, type:p.type, pos:p.position.toArray(), lengthN:p.lengthN })));
}
// Snap holes of one part in world space: p = point, a = axis.
export async function partHoles(page, id) {
  return page.evaluate((id) => {
    const p = window.__robot.getState().parts.find(q => q.id === id);
    return window.__magnet.worldSnapHoles(p).map(h => ({ p:h.point.toArray(), a:h.axis.toArray() }));
  }, id);
}
// Give the 3D renderer time to settle.
export async function waitForRender(page, ms = 2500) { await page.waitForTimeout(ms); }

