// Builder docs: images of the features that are still in the development version ("Yakında" boxes).
// The development site is password protected: the credentials are read from the DEV_AUTH environment
// variable ("user:password") and are never written into the script or the log.
// Remote browser: PW_WS (ws://...). Heavy browser work: hold the browser lock.
//
// Usage: DEV_URL=... DEV_AUTH=... PW_WS=... node capture-dev.mjs <out-dir> [name1,name2,...]
// Afterwards: python3 shrink.py <out-dir>/*.png
// Once the development version reaches production, recapture the same images from production (lib.mjs URL).
import { chromium } from 'playwright';
import { mark, clearMarks, capture } from './lib.mjs';

const URL = process.env.DEV_URL;   // Builder address of the development version
if (!URL) throw new Error('DEV_URL is required');
const OUT = process.argv[2];
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const wanted = (name) => !ONLY || ONLY.includes(name);
const file = (name) => `${OUT}/builder-${name}.png`;
const log = (...a) => console.log(...a);

const [username, ...rest] = (process.env.DEV_AUTH || '').split(':');
const browser = await chromium.connect(process.env.PW_WS);
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR',
    reducedMotion: 'reduce', httpCredentials: { username, password: rest.join(':') } });
  ctx.setDefaultTimeout(20000);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 150000 });
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 8000 }).catch(() => {});
  await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 8000 }).catch(() => {});
  await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    .probot-consent{display:none!important}` });
  await page.waitForTimeout(1500);

  // Hata bildir in the site header
  if (wanted('hata-bildir-baslik')) {
    const b = page.locator('probot-header .hatabtn');
    await mark(page, [{ n: 1, loc: b }]);
    await capture(page, file('hata-bildir-baslik'), { x: 0, y: 0, width: 720, height: 110 });
    await clearMarks(page);
  }

  // Help window (new rows)
  if (wanted('kisayollar-yardim-yeni')) {
    await page.locator('canvas').first().click({ position: { x: 600, y: 120 } }).catch(() => {});
    await page.keyboard.press('?');
    const d = page.getByText('Klavye Kısayolları', { exact: true }).first();
    await d.waitFor();
    await page.waitForTimeout(600);
    const box = await d.locator('xpath=ancestor::div[2]').boundingBox();
    // pencerenin üstünde pay yok: arkasında araç çubuğu turuncu bir şerit olarak görünüyor
    await capture(page, file('kisayollar-yardim-yeni'), { x: Math.floor(box.x) - 4, y: Math.ceil(box.y), width: Math.ceil(box.width) + 8, height: Math.floor(box.height) + 4 });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  }

  // Robot Kataloğu, TOPLULUK: the new design example
  if (wanted('katalog-omni4')) {
    await page.getByText('Robot Kataloğu', { exact: true }).first().click();
    const card = page.getByText('4 motorlu omni şasi', { exact: false }).first();
    await card.waitFor();
    await card.evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(1500);
    const k = card.locator('xpath=ancestor::button[1]');
    const target = (await k.count()) ? k : card.locator('xpath=../..');
    log('omni4 card', (await target.innerText()).replace(/\n/g, ' | '));
    await mark(page, [{ n: 3, loc: target, pad: 2 }]);
    await capture(page, file('katalog-omni4'), { x: 0, y: 108, width: 312, height: 792 });
    await clearMarks(page);
  }

  // Parça Ekle > Marka > Boardoza
  if (wanted('parca-ekle-boardoza')) {
    await page.getByText('Parça Ekle', { exact: true }).first().click();
    await page.getByText('Marka', { exact: true }).first().click(); await page.waitForTimeout(800);
    const bz = page.getByText('Boardoza', { exact: true }).first();
    await bz.click(); await page.waitForTimeout(2500);
    const head = page.getByText('Boardoza', { exact: true }).first().locator('..');
    log('boardoza', (await head.innerText()).replace(/\n/g, ' | '));
    await mark(page, [{ n: 3, loc: head, pad: 2 }]);
    await capture(page, file('parca-ekle-boardoza'), { x: 0, y: 108, width: 312, height: 500 });
    await clearMarks(page);
  }

  // Build check: the ready-made Omni şasi succeeds in the development version, shop part contact row
  if (wanted('derle-sonuc-yeni')) {
    await page.getByRole('button', { name: 'Görünüm' }).first().click(); await page.waitForTimeout(300);
    await page.getByRole('menuitemcheckbox', { name: 'Derleme' }).click(); await page.waitForTimeout(800);
    await page.locator('[data-bos-sahne-robot][title^="Omni şasi "]').first().click();
    await page.waitForTimeout(15000);
    await page.getByRole('button', { name: 'Derle', exact: true }).first().click({ timeout: 120000 });
    await page.getByText('Yeniden derle').first().waitFor({ timeout: 120000 });
    ctx.setDefaultTimeout(120000);   // screenshots are slow while the 3D scene is loaded
    await page.waitForTimeout(2000);
    log('build text', (await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.children.length < 50 && /Yeniden derle/.test(x.innerText || '') && x.innerText.length < 4000 && x.querySelector('button')); return e ? e.innerText : '-'; })).replace(/\n/g, ' | ').slice(0, 1500));
    const t = await page.locator('.dv-tab', { hasText: 'Derleme' }).first().boundingBox();
    const info = page.getByText(/Mağaza parçalarının \d+ teması/).first();
    // rozet çerçevenin üstünde, sağ ucunda: köşede yazının ilk ya da son kelimesini kapatıyor
    if (await info.count()) await mark(page, [{ n: 3, loc: info.locator('..'), pad: 2, at: 'above-r' }]);
    else log('no shop part contact row');
    await page.mouse.move(1439, 899);
    await capture(page, file('derle-sonuc-yeni'), { x: Math.floor(t.x) - 2, y: Math.floor(t.y) - 2, width: 1440 - Math.floor(t.x) + 2, height: 900 - Math.floor(t.y) + 2 });
    await clearMarks(page);
  }
  await ctx.close();
} finally {
  await browser.close();
}
