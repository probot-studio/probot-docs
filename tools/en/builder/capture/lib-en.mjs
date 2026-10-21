// Shared helpers for the English Builder screenshots: the same as builder/capture/lib.mjs, but the page opens
// the English interface (?dil=en, locale en-US) and the notices are dismissed by their English labels.
// The markers, crops and 3D scene helpers do not depend on the language: they are re-exported from lib.mjs.
// Every capture-*.mjs script in this folder imports these helpers.
import { chromium } from 'playwright';
export { mark, clearMarks, capture, toScreen, listParts, partHoles, waitForRender } from '../../../builder/capture/lib.mjs';
export const URL = 'https://probotstudio.com/builder/?dil=en';
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
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:dsf, locale:'en-US', reducedMotion:'reduce' });
  const page = await ctx.newPage();
  if (clean) await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto(URL, { waitUntil:'networkidle', timeout:90000 });
  await dismissNotices(page);
  return { ctx, page };
}
// Dismiss the consent / notice dialogs and disable animations and floating widgets.
// The cookie banner is still Turkish in production ("Sadece zorunlu"); the English label is tried as well.
export async function dismissNotices(page) {
  for (const label of ['Got it, continue','Only necessary','Sadece zorunlu']) {
    const b = page.getByRole('button', { name:label });
    if (await b.count()) { try { await b.first().click({ timeout:3000 }); } catch {} }
  }
  await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    probot-devnote,.probot-consent,[class*="whatsapp"],a[href*="wa.me"]{display:none!important}` });
  await page.waitForTimeout(300);
}
// Load a ready-made robot from the empty-scene card by its id (data-bos-sahne-robot, the same in every language).
export async function loadRobot(page, id = 'omni-sasi') {
  await page.locator(`[data-bos-sahne-robot="${id}"]`).first().click();
  await page.waitForTimeout(5000);
}

// --- 3D scene helpers (store hooks exposed by the production bundle when __PROBOT_TEST__ is set) ---
export async function prepare3d(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:opts.dsf ?? 1, locale:'en-US', reducedMotion:'reduce', acceptDownloads:true });
  ctx.setDefaultTimeout(120000);
  const page = await ctx.newPage();
  await page.addInitScript(({ clean }) => { window.__PROBOT_TEST__ = true; if (clean) { try { localStorage.clear(); } catch {} } }, { clean: opts.clean ?? true });
  await page.goto(URL, { waitUntil:'networkidle', timeout:120000 });
  await page.waitForFunction(() => !!window.__robot && !!window.__controls?.current, null, { timeout:60000 });
  await dismissNotices(page);
  return { ctx, page };
}
