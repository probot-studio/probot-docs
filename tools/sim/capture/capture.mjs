// Screenshots for the Sim docs: opens prod, prepares the screen for each image, marks the targets
// with a magenta frame and a numbered badge, crops to the needed area and writes <output>/<name>.png.
//
// Usage: PW_WS=<playwright run-server ws address> node capture.mjs <output-dir> [name1,name2,...]
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

// --- Opening and selection

async function openSim(ctx, { card = false } = {}) {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  if (!card) await page.getByRole('button', { name: 'Anladım, devam et' }).click({ timeout: 10000 }).catch(() => {});
  await page.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  // If the cookie banner cannot be clicked while the card is open, hide it from the image
  await page.addStyleTag({ content: '.probot-consent-banner{display:none!important}' });
  await page.waitForTimeout(500);
  return page;
}

const robot = (p, name) => p.locator('#ana-robot').getByRole('button', { name: prefix(name) }).first();
const program = (p, name) => p.locator('#ana-kod').getByRole('button', { name: prefix(name) }).first();
const game = (p) => p.locator('#ana-oyun');

/** bot = robot name, prog = program name, field = field preset, start = start position, mode = view mode */
async function select(p, { bot, prog, field, start, mode } = {}) {
  if (bot) { await robot(p, bot).click(); await p.waitForTimeout(700); }
  if (prog) { await program(p, prog).click(); await p.waitForTimeout(700); }
  if (mode) { await game(p).getByRole('radio', { name: mode }).click(); await p.waitForTimeout(300); }
  if (field) { await game(p).getByRole('button', { name: prefix(field) }).first().click(); await p.waitForTimeout(300); }
  if (start) { await game(p).getByRole('button', { name: start }).click(); await p.waitForTimeout(300); }
  await p.getByText(/^Kod: /).first().waitFor({ timeout: 20000 });
}

const strip = (p) => p.locator('.arac-seridi');
const toolButton = (p, name) => strip(p).getByRole('button', { name, exact: true });

async function run(p) {
  await p.locator('.ana__baslat').click();
  await p.locator('.sahne').waitFor({ timeout: 20000 });
  await p.waitForTimeout(800);
}

/** Wait until the autonomous computation finishes, then set the clock to t seconds (playback stops) */
async function waitAutonomousDone(p, t = 10, limit = 90000) {
  await toolButton(p, 'Yeniden çalıştır').waitFor({ timeout: limit });
  await p.waitForTimeout(500);
  await p.getByRole('slider', { name: 'Zaman' }).fill(String(t));
  await p.waitForTimeout(800);
}

async function openMenu(p, name) {
  await p.getByRole('menubar').getByRole('menuitem', { name }).click();
  await p.getByRole('menu', { name }).waitFor();
  await p.waitForTimeout(300);
}

const group = (p, tab) => p.locator('.dv-tab', { hasText: tab }).first()
  .locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " dv-groupview ")][1]');

async function openMotors(p) {
  await p.locator('#ana-robot').getByRole('button', { name: 'Motorlar ve tekerler' }).click();
  await p.locator('.robot-paneli').waitFor();
  await p.waitForTimeout(400);
}

// --- Marking and cropping

/** marks: [{ loc | box:{x,y,width,height}, n, pad }] -> draws them, returns the boxes */
async function drawMarks(page, marks) {
  const boxes = [];
  for (const m of marks) {
    // The bottom strip and the Hata bildir pill are fixed: bring the target to the middle of the screen
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
        // badge: top-left corner by default; so that it does not cover a label, 'right' = top-right corner,
        // 'left' = left of the frame, vertically centered, 'below' = below the frame, horizontally centered
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

// --- Images: name -> [options, prepare(page, ctx) -> { marks: [...], crop }]

const STARTER = { bot: 'Starter Bot', prog: 'Starter Bot otonom (CRServo)' };
const TELEOP = { bot: 'Starter Bot', prog: 'Starter Bot TeleOp (CRServo)' };

async function autonomousRun(p, t = 10, extra = {}) {
  await select(p, { ...STARTER, field: 'BIOBUZZ 2026-27 (maç başı)', start: 'Kırmızı, seyirci duvarı', mode: 'Hızlı · 2B', ...extra });
  await run(p);
  await waitAutonomousDone(p, t);
}

// Başlat on the home page starts TeleOp live right away: enter with the autonomous program, then switch the program in the Kod panel
async function teleopRun(p) {
  await select(p, { ...STARTER, mode: 'Hızlı · 2B' });
  await run(p);
  await p.locator('.dv-tab', { hasText: 'Kod' }).first().click();
  await p.getByRole('button', { name: prefix(TELEOP.prog) }).first().click();
  await p.getByText("TeleOp hazır: Başlat'a bas").waitFor({ timeout: 20000 });
}

// The part of the game section from the view selector down to the heading box (the section is taller than the screen)
const gameLower = (p) => [game(p).getByRole('radio', { name: 'Hızlı · 2B' }), game(p).getByRole('button', { name: prefix('BIOBUZZ 2026-27 (maç başı)') }).first(), game(p).locator('input[type=number]').nth(2)];

const SHOTS = {
  // arayuz.md
  'sim-arayuz-ortak': [{}, async (p) => ({
    marks: [
      { loc: p.getByRole('menubar'), n: 1 },
      { loc: strip(p), n: 2, pad: 0 },
      { loc: p.getByRole('button', { name: /Hata bildir/ }).last(), n: 3 },
    ], crop: 'full',
  })],
  'sim-arayuz-menu-simulasyon': [{}, async (p) => {
    await teleopRun(p);
    await openMenu(p, 'Simülasyon');
    const m = p.getByRole('menu', { name: 'Simülasyon' });
    return {
      marks: [
        { loc: m.getByRole('menuitem', { name: 'Canlı başlat' }), n: 1, pad: 2 },
        { loc: m.getByRole('menuitem', { name: 'Sıfırla' }), n: 2, pad: 2 },
        { loc: m.getByText('Oyun türü'), n: 3, pad: 2 },
      ], crop: [m, p.getByRole('menubar')],
    };
  }],
  'sim-arayuz-arac-cubugu': [{}, async (p) => {
    await teleopRun(p);
    return {
      marks: [
        { loc: toolButton(p, 'Başlat'), n: 1 },
        { loc: toolButton(p, 'Sıfırla'), n: 2 },
        { loc: strip(p).getByRole('radiogroup', { name: 'Görünüm' }), n: 3 },
      ], crop: [strip(p)],
    };
  }],
  'sim-arayuz-ana': [{}, async (p) => ({
    marks: [
      { loc: p.locator('#ana-robot'), n: 1, pad: 2 },
      { loc: p.locator('#ana-kod'), n: 2, pad: 2 },
      { loc: p.locator('#ana-oyun'), n: 3, pad: 2 },
    ], crop: 'full',
  })],
  'sim-arayuz-alt-serit': [{}, async (p) => {
    await select(p, { bot: 'Omni şasi', prog: 'Starter Bot otonom (CRServo)' });
    await p.getByText('Robotta karşılığı bulunmayan cihaz').first().waitFor();
    return {
      marks: [
        { loc: p.locator('.ana__baslat'), n: 1 },
        { loc: p.getByRole('list', { name: 'Hazırlık' }), n: 2 },
      ], crop: [p.locator('.ana__alt')],
    };
  }],
  'sim-arayuz-calisma': [{}, async (p) => {
    await autonomousRun(p, 10);
    return {
      marks: [
        { loc: group(p, 'Robot'), n: 1, pad: -3 },
        { loc: p.locator('.sahne'), n: 2, pad: -3 },
        { loc: group(p, 'Driver Station'), n: 3, pad: -3 },
      ], crop: 'full',
    };
  }],
  'sim-arayuz-zaman': [{}, async (p) => {
    await autonomousRun(p, 10);
    return {
      marks: [
        { loc: p.getByRole('button', { name: 'Oynat' }), n: 1 },
        { loc: p.getByRole('slider', { name: 'Zaman' }), n: 2 },
        { loc: p.getByRole('combobox', { name: 'Oynatma hızı' }), n: 3 },
      ], crop: [p.locator('.zaman')],
    };
  }],
  'sim-arayuz-sag-paneller': [{}, async (p) => {
    await teleopRun(p);
    return {
      marks: [
        { loc: p.locator('.ds'), n: 1 },
        { loc: p.locator('.kumanda-durum'), n: 2 },
        { loc: p.locator('.tus-tablosu'), n: 3 },
      ], crop: [group(p, 'Driver Station'), group(p, 'Kumanda')],
    };
  }],

  // cihazlari-porta-bagla.md
  'sim-yapilandirma-eksik': [{}, async (p) => {
    await select(p, { bot: 'Omni şasi', prog: 'Starter Bot otonom (CRServo)' });
    const row = p.locator('.ks-tablo__satir--eksik').first();
    await row.scrollIntoViewIfNeeded();
    return { marks: [{ loc: row, n: 2 }], crop: [p.locator('.ks-tablo').first()] };
  }],
  'sim-yapilandirma-duzelt': [{}, async (p) => {
    await select(p, STARTER);
    const s = p.locator('.ks-tablo__satir').first().locator('select');
    await p.locator('.ks-tablo').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    return { marks: [{ loc: s, n: 2 }], crop: [p.locator('.ks-tablo').first()] };
  }],

  // The Omni chassis has two motors and no servo: for the state where every row is connected, use the program's own robot
  'sim-cihazlari-sonuc': [{}, async (p) => {
    await select(p, STARTER);
    const t = p.locator('.ks-tablo').first();
    await t.waitFor({ timeout: 20000 });
    await p.waitForTimeout(500);
    const missing = await t.locator('.ks-tablo__satir--eksik').count();
    if (missing) throw new Error(missing + ' rows not connected');
    await t.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    return { marks: [], crop: [t] };
  }],

  // gorunumu-degistir.md
  'sim-gorunum-sec': [{}, async (p) => {
    await autonomousRun(p, 10);
    return {
      marks: [{ loc: strip(p).getByRole('radio', { name: 'Detaylı · 3B' }), n: 2 }],
      crop: [strip(p)],
    };
  }],
  'sim-gorunum-2b-imlec': [{ keepMouse: true }, async (p) => {
    await autonomousRun(p, 10);
    const b = await p.locator('.sahne__alan canvas').first().boundingBox();
    await p.mouse.move(b.x + b.width * 0.62, b.y + b.height * 0.35);
    await p.locator('.saha2d__imlec').waitFor();
    return { marks: [{ loc: p.locator('.saha2d__imlec'), n: 3 }], crop: [p.locator('.sahne')] };
  }],
  'sim-gorunum-kamera': [{}, async (p) => {
    await autonomousRun(p, 10, { mode: 'Detaylı · 3B' });
    return { marks: [{ loc: p.getByRole('group', { name: 'Kamera' }), n: 1 }], crop: [p.locator('.sahne')] };
  }],
  'sim-gorunum-sonuc': [{}, async (p) => {
    await autonomousRun(p, 10, { mode: 'Detaylı · 3B' });
    await p.getByRole('button', { name: 'Sürücü gözü' }).waitFor();
    return { marks: [], crop: 'full' };
  }],

  // ilk-10-dakika.md
  'sim-ilk-giris-karti': [{ card: true }, async (p) => ({
    marks: [{ loc: p.getByRole('button', { name: 'Anladım, devam et' }), n: 2 }], crop: 'full',
  })],
  'sim-ilk-kod-sec': [{}, async (p) => {
    await select(p, STARTER);
    return { marks: [{ loc: program(p, STARTER.prog), n: 2 }], crop: [p.locator('#ana-kod')] };
  }],
  'sim-ilk-saha': [{}, async (p) => {
    await select(p, { ...STARTER, mode: 'Hızlı · 2B', field: 'BIOBUZZ 2026-27 (maç başı)', start: 'Kırmızı, seyirci duvarı' });
    return {
      marks: [
        { loc: game(p).getByRole('radio', { name: 'Hızlı · 2B' }), n: 2 },
        { loc: game(p).getByRole('button', { name: prefix('BIOBUZZ 2026-27 (maç başı)') }).first(), n: 3 },
        { loc: game(p).getByRole('button', { name: 'Kırmızı, seyirci duvarı' }), n: 4 },
      ], crop: gameLower(p),
    };
  }],
  'sim-ilk-otonom': [{}, async (p) => {
    await autonomousRun(p, 12);
    return { marks: [], crop: 'full' };
  }],
  'sim-ilk-teleop-baslat': [{}, async (p) => {
    await teleopRun(p);
    return { marks: [{ loc: toolButton(p, 'Başlat'), n: 2 }], crop: [strip(p), p.locator('.sahne__ipucu')] };
  }],

  // motorlari-ayarla.md
  'sim-motor-ayar': [{}, async (p) => {
    await select(p, STARTER);
    await openMotors(p);
    const m = p.locator('.motor-ayar').first();
    await m.scrollIntoViewIfNeeded();
    return { marks: [{ loc: m.locator('.motor-ayar__alanlar'), n: 1, badge: 'left' }], crop: [m] };
  }],
  'sim-motor-varsayilan': [{}, async (p) => {
    await select(p, STARTER);
    await openMotors(p);
    const m = p.locator('.motor-ayar').first();
    const input = m.locator('input').first();
    await input.fill('300');
    await input.press('Enter');
    await m.getByText('senin değerin').waitFor();
    await m.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    return { marks: [{ loc: m.getByRole('button', { name: 'Varsayılana dön' }), n: 2 }], crop: [m] };
  }],
  'sim-motor-sonuc': [{}, async (p) => {
    await select(p, STARTER);
    await openMotors(p);
    const m = p.locator('.motor-ayar').first();
    const input = m.locator('input').first();
    await input.fill('300');
    await input.press('Enter');
    await m.getByText('senin değerin').waitFor();
    await m.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    return { marks: [], crop: [m] };
  }],
  'sim-motor-kutle': [{}, async (p) => {
    const names = ['Starter Bot', 'Omni şasi', 'WattOS mecanum şasi'];
    await openMotors(p);
    for (const name of names) {
      await robot(p, name).click();
      await p.waitForTimeout(1200);
      const k = p.getByRole('textbox', { name: 'Robotun tartılmış toplam kütlesi, kg' });
      if (await k.count()) {
        console.log('  mass field:', name);
        await k.scrollIntoViewIfNeeded();
        return { marks: [{ loc: k, n: 2, badge: 'left' }], crop: [p.locator('.robot-paneli dl')] };
      }
    }
    throw new Error('none of the preset robots has a mass field');
  }],

  // otonomu-calistir.md
  'sim-otonom-baslat': [{}, async (p) => {
    await select(p, { ...STARTER, field: 'BIOBUZZ 2026-27 (maç başı)' });
    return { marks: [{ loc: p.locator('.ana__baslat'), n: 1 }], crop: [p.locator('.ana__alt')] };
  }],
  'sim-otonom-baslat-3': [{}, async (p) => {
    await select(p, { ...STARTER, field: 'BIOBUZZ 2026-27 (maç başı)' });
    return { marks: [{ loc: p.locator('.ana__baslat'), n: 3 }], crop: [p.locator('.ana__alt')] };
  }],
  'sim-otonom-zaman': [{}, async (p) => {
    await autonomousRun(p, 10);
    return {
      marks: [
        { loc: p.getByRole('button', { name: 'Oynat' }), n: 1 },
        { loc: p.getByRole('slider', { name: 'Zaman' }), n: 2 },
        { loc: p.getByRole('combobox', { name: 'Oynatma hızı' }), n: 3 },
      ], crop: [p.locator('.zaman')],
    };
  }],
  'sim-otonom-sifirla': [{}, async (p) => {
    // State after Sıfırla: the button of step 3 becomes "Çalıştır"
    await autonomousRun(p, 10);
    await toolButton(p, 'Sıfırla').click();
    await toolButton(p, 'Çalıştır').waitFor({ timeout: 10000 });
    await p.waitForTimeout(500);
    return {
      marks: [
        { loc: toolButton(p, 'Sıfırla'), n: 2 },
        { loc: toolButton(p, 'Çalıştır'), n: 3 },
      ], crop: [strip(p)],
    };
  }],

  // panelleri-duzenle.md
  'sim-panel-tasi': [{}, async (p) => {
    await autonomousRun(p, 10);
    return { marks: [{ loc: p.locator('.dv-tab', { hasText: 'Kod' }).first(), n: 1 }], crop: [group(p, 'Robot')] };
  }],
  'sim-panel-menu': [{}, async (p) => {
    await autonomousRun(p, 10);
    await openMenu(p, 'Görünüm');
    await p.getByRole('menuitemcheckbox', { name: 'Kumanda' }).click();
    await p.waitForTimeout(400);
    await openMenu(p, 'Görünüm');
    const m = p.getByRole('menu', { name: 'Görünüm' });
    return {
      marks: [{ loc: m.getByRole('menuitemcheckbox', { name: 'Kumanda' }), n: 3, pad: 2 }],
      crop: [m, p.getByRole('menubar')],
    };
  }],
  'sim-panel-sifirla': [{}, async (p) => {
    await autonomousRun(p, 10);
    await openMenu(p, 'Görünüm');
    const m = p.getByRole('menu', { name: 'Görünüm' });
    return {
      marks: [{ loc: m.getByRole('menuitem', { name: 'Pencere düzenini sıfırla' }), n: 3, pad: 2 }],
      crop: [m, p.getByRole('menubar')],
    };
  }],
  // In the narrow layout the home page buttons end up under the bottom strip: prepare wide, then narrow
  'sim-panel-dar': [{}, async (p) => {
    await autonomousRun(p, 10);
    await p.setViewportSize({ width: 820, height: 900 });
    await p.locator('.dar-duzen__sekmeler').waitFor({ timeout: 10000 });
    await p.waitForTimeout(800);
    return { marks: [{ loc: p.locator('.dar-duzen__sekmeler'), n: 2, badge: 'right' }], crop: 'full' };
  }],

  // programi-sec.md
  'sim-program-ornek': [{}, async (p) => {
    await select(p, STARTER);
    return { marks: [{ loc: program(p, STARTER.prog), n: 3 }], crop: [p.locator('#ana-kod')] };
  }],
  'sim-program-sonuc': [{}, async (p) => {
    await select(p, STARTER);
    await p.locator('#ana-kod').getByText(/Starter Bot otonom \(CRServo\)/).first().waitFor();
    return { marks: [], crop: [p.locator('#ana-kod')] };
  }],
  'sim-program-blocks': [{}, async (p) => ({
    marks: [{ loc: p.locator('#ana-kod').getByRole('link', { name: "Blocks'ta yaz" }), n: 1 }],
    crop: [p.locator('#ana-kod')],
  })],
  'sim-program-blk-ac': [{}, async (p) => ({
    marks: [{ loc: p.locator('#ana-kod').getByText('Dosya aç (.blk, .java)', { exact: true }), n: 1 }],
    crop: [p.locator('#ana-kod')],
  })],

  // robotu-sec.md
  'sim-robot-hazir': [{}, async (p) => {
    await robot(p, 'WattOS mecanum şasi').click();
    await p.waitForTimeout(1500);
    console.log('  summary:', (await p.locator('#ana-robot header').innerText()).replace(/\n/g, ' | '));
    return { marks: [{ loc: robot(p, 'WattOS mecanum şasi'), n: 2 }], crop: [p.locator('#ana-robot')] };
  }],
  'sim-robot-builder': [{ builder: true }, async (p) => {
    const row = p.locator('#ana-robot').getByRole('button', { name: /Builder'da açık proje/ }).first();
    await row.waitFor({ timeout: 20000 });
    await row.click();
    await p.waitForTimeout(1200);
    console.log('  row:', (await row.innerText()).replace(/\n/g, ' | '));
    return { marks: [{ loc: row, n: 4 }], crop: [p.locator('#ana-robot')] };
  }],
  'sim-robot-dosya-ac': [{}, async (p) => ({
    marks: [{ loc: p.locator('#ana-robot').getByText('Proje dosyası aç', { exact: true }), n: 1 }],
    crop: [p.locator('#ana-robot')],
  })],
  'sim-robot-surus-onu': [{}, async (p) => {
    await select(p, STARTER);
    const g = p.locator('#ana-robot').getByRole('radiogroup', { name: 'Sürüş önü' });
    await g.scrollIntoViewIfNeeded();
    return { marks: [{ loc: g, n: 2 }], crop: [p.locator('#ana-robot')] };
  }],

  // sahayi-ayarla.md
  'sim-saha-sonuc': [{}, async (p) => {
    await select(p, { ...STARTER, mode: 'Hızlı · 2B', field: 'BIOBUZZ 2026-27 (maç başı)', start: 'Kırmızı, seyirci duvarı' });
    return { marks: [], crop: gameLower(p) };
  }],
  'sim-saha-sec': [{}, async (p) => {
    await select(p, { ...STARTER, field: 'Deneme sahası' });
    return { marks: [{ loc: game(p).getByRole('button', { name: /^Deneme sahası/ }).first(), n: 2 }], crop: gameLower(p) };
  }],
  'sim-saha-baslangic': [{}, async (p) => {
    await select(p, { ...STARTER, field: 'BIOBUZZ 2026-27 (maç başı)', start: 'Mavi, ittifak duvarı' });
    return { marks: [{ loc: game(p).getByRole('button', { name: 'Mavi, ittifak duvarı' }), n: 2 }], crop: gameLower(p) };
  }],
  'sim-saha-elle': [{}, async (p) => {
    await select(p, STARTER);
    const g = game(p).locator('input[type=number]');
    await g.nth(0).fill('0');
    await g.nth(1).fill('-48');
    await g.nth(2).fill('90');
    await p.locator('body').click({ position: { x: 5, y: 300 } });
    await p.getByRole('button', { name: /Hata bildir/ }).last().evaluate((el) => { el.style.visibility = 'hidden'; });
    await p.waitForTimeout(500);
    return {
      marks: [{ loc: g.nth(0), n: 1, center: true, badge: 'below', pad: 1 }, { loc: g.nth(1), n: 2, badge: 'below', pad: 1 }, { loc: g.nth(2), n: 3, badge: 'below', pad: 1 }],
      crop: [game(p).getByRole('button', { name: 'Kırmızı, seyirci duvarı' }), g.nth(2)],
    };
  }],
  'sim-saha-panel': [{}, async (p) => {
    await autonomousRun(p, 10);
    const tab = p.locator('.dv-tab', { hasText: 'Saha' }).first();
    await tab.click();
    await p.getByRole('button', { name: 'Kırmızı, seyirci duvarı' }).first().waitFor();
    await p.waitForTimeout(400);
    return { marks: [{ loc: tab, n: 1 }], crop: [group(p, 'Saha')] };
  }],
  'sim-saha-notu': [{}, async (p) => {
    await autonomousRun(p, 10);
    const summary = p.locator('summary', { hasText: 'Saha notu' });
    await summary.click();
    await p.waitForTimeout(400);
    return { marks: [{ loc: summary.locator('xpath=..'), n: 2 }], crop: [p.locator('.sahne')] };
  }],

  // sorunlar.md
  'sim-hata-bildir': [{}, async (p) => {
    await p.getByRole('button', { name: /Hata bildir/ }).last().click();
    const titleInput = p.getByPlaceholder('Kısaca ne oldu?');
    await titleInput.waitFor();
    return {
      marks: [
        { loc: titleInput, n: 2, badge: 'right' },
        { loc: p.getByRole('button', { name: 'Gönder', exact: true }), n: 4 },
      ], crop: 'full',
    };
  }],

  // teleopu-sur.md
  'sim-teleop-baslat': [{}, async (p) => {
    await teleopRun(p);
    return { marks: [{ loc: toolButton(p, 'Başlat'), n: 1 }], crop: [strip(p), p.locator('.sahne__ipucu')] };
  }],
  'sim-teleop-sonuc': [{}, async (p) => {
    await teleopRun(p);
    await toolButton(p, 'Başlat').click();
    await p.getByText('Canlı · klavye').waitFor({ timeout: 20000 });
    await p.keyboard.down('KeyW');
    await p.waitForTimeout(1200);
    await p.keyboard.up('KeyW');
    await p.waitForTimeout(500);
    return { marks: [], crop: 'full' };
  }],
  'sim-teleop-kumanda': [{ gamepad: true }, async (p) => {
    await teleopRun(p);
    await toolButton(p, 'Başlat').click();
    await p.getByText('Kumanda bağlı, sürüyorsun').waitFor({ timeout: 20000 });
    await p.waitForTimeout(1500);
    return { marks: [{ loc: p.locator('.kumanda-durum'), n: 4 }], crop: [group(p, 'Kumanda'), p.locator('.durum-rozeti')] };
  }],
  'sim-teleop-yeniden': [{}, async (p) => {
    await teleopRun(p);
    await toolButton(p, 'Başlat').click();
    await p.getByText('Canlı · klavye').waitFor({ timeout: 20000 });
    await p.keyboard.down('KeyW');
    await p.waitForTimeout(1500);
    await p.keyboard.up('KeyW');
    await toolButton(p, 'Durdur').click();
    await p.locator('.durum-rozeti', { hasText: 'Bitti' }).waitFor({ timeout: 20000 });
    return {
      marks: [{ loc: toolButton(p, 'Sıfırla'), n: 2 }, { loc: toolButton(p, 'Başlat'), n: 3 }],
      crop: [strip(p)],
    };
  }],
};

// Virtual gamepad: exposes a "standard" gamepad through the browser's Gamepad API.
// The id stays Turkish because the Turkish UI may show it in the screenshot.
function virtualGamepad() {
  const gp = {
    id: 'Sanal kumanda (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
  };
  navigator.getGamepads = () => [gp, null, null, null];
}

// Loads the preset Omni chassis in Builder; Builder saves the project to the same browser on its own
async function prepareBuilder(ctx) {
  const b = await ctx.newPage();
  await b.goto('https://probotstudio.com/builder/', { waitUntil: 'networkidle', timeout: 60000 });
  await b.getByRole('button', { name: 'Sadece zorunlu' }).click({ timeout: 3000 }).catch(() => {});
  await b.getByRole('button', { name: /Anladım|Başla|Kapat/ }).first().click({ timeout: 3000 }).catch(() => {});
  await b.keyboard.press('Escape').catch(() => {});
  await b.locator('[data-bos-sahne-robot="omni-sasi"]').click({ timeout: 20000 });
  await b.waitForTimeout(6000);
  return b;
}

const browser = await chromium.connect(process.env.PW_WS);
const results = {};
try {
  for (const [name, [opts, prepare]] of Object.entries(SHOTS)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const vp = opts.vp ?? WIDE;
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'tr-TR', reducedMotion: 'reduce' });
    await ctx.route(/posthog|i\.probotstudio|googletagmanager|google-analytics/, (r) => r.abort());
    try {
      if (opts.gamepad) await ctx.addInitScript(virtualGamepad);
      if (opts.builder) await prepareBuilder(ctx);
      const page = await openSim(ctx, opts);
      const { marks, crop } = await prepare(page, ctx);
      const vp = page.viewportSize(); // preparation may have narrowed the window
      if (!opts.keepMouse) await page.mouse.move(vp.width - 2, vp.height - 2);
      if (marks.length > 3) throw new Error('at most 3 marks');
      // Hide the focus ring (do not touch it while a menu is open, since losing focus may close the menu)
      if (!(await page.getByRole('menu').count())) await page.evaluate(() => document.activeElement?.blur?.());
      const boxes = await drawMarks(page, marks);
      await page.waitForTimeout(300);
      const clip = await cropArea(page, boxes, crop, vp);
      // Keep the fixed bottom strip (Başlat, readiness list, Hata bildir) out of the crop when it holds no mark
      const bottom = crop === 'full' ? null : await page.locator('.ana__alt').boundingBox().catch(() => null);
      if (bottom && bottom.y < clip.y + clip.height && bottom.y > clip.y + 200 && boxes.every((k) => k.y + k.h <= bottom.y)) {
        clip.height = Math.round(bottom.y - clip.y);
      }
      await page.screenshot({ path: path.join(OUT, name + '.png'), clip });
      results[name] = `ok ${clip.width}x${clip.height}`;
    } catch (e) {
      results[name] = 'ERROR: ' + String(e.message || e).split('\n')[0];
      const page = ctx.pages().at(-1);
      const badge = await page.locator('.durum-rozeti').first().textContent({ timeout: 2000 }).catch(() => '?');
      console.log(name, 'status badge:', badge);
      await page.screenshot({ path: path.join(OUT, 'error-' + name + '.png') }).catch(() => {});
    } finally {
      await ctx.close();
    }
    console.log(name, results[name]);
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(OUT, 'capture-results.json'), JSON.stringify(results, null, 2));
