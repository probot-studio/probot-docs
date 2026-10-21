// Builder docs: images for index / arayuz / ilk-10-dakika.
// Usage: node capture-base.mjs <img-dir> [step1,step2]   (no step list = all steps)
import { connect, prepare3d, mark, clearMarks, capture, toScreen, listParts, partHoles } from './lib.mjs';
const IMG = process.argv[2];
const only = process.argv[3] ? process.argv[3].split(',') : null;
const wanted = (name) => !only || only.includes(name);
const FULL = { x:0, y:0, width:1440, height:900 };
const browser = await connect();
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
// Box around a Properties heading (e.g. "Konum (mm)") and the three input boxes that follow it
async function headingWithInputs(page, heading) {
  return page.evaluate((heading) => {
    const h = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.trim() === heading);
    if (!h) throw new Error('no heading ' + heading);
    const ins = [...document.querySelectorAll('input')].filter(i => h.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_FOLLOWING).slice(0, 3);
    const rs = [h, ...ins].map(e => e.getBoundingClientRect());
    const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
    const x2 = Math.max(...rs.map(r => r.right)), y2 = Math.max(...rs.map(r => r.bottom));
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }, heading);
}
try {
  // --- Empty scene captures ---
  if (['ilk-acilis','ilk-omni','arac-cubugu','parca-ekle','dosya-menusu'].some(wanted)) {
    const { page } = await prepare3d(browser);
    if (wanted('ilk-acilis')) await capture(page, IMG+'/builder-ilk-acilis.png', FULL);
    if (wanted('ilk-omni')) {
      await mark(page, [{ n:1, loc: page.locator('[data-bos-sahne-robot="omni-sasi"]') }]);
      await capture(page, IMG+'/builder-ilk-omni-sasi-karti.png', { x:420, y:320, width:640, height:370 });
      await clearMarks(page);
    }
    if (wanted('arac-cubugu')) {
      await mark(page, [
        { n:1, loc: page.locator('button[title="Proje adını düzenle"]'), pad:2 },
        { n:2, loc: page.locator('button[title="Taşı (T / M)"]'), pad:2 },
        { n:3, loc: page.locator('button[title^="Snap"]'), pad:2 }]);
      // from just under the menu bar text to just above the panel tabs: the whole badge circles show
      await capture(page, IMG+'/builder-arayuz-arac-cubugu.png', { x:0, y:63, width:1440, height:52 });
      await clearMarks(page);
    }
    if (wanted('parca-ekle')) {
      await mark(page, [
        { n:1, loc: page.locator('input[placeholder="Parça ara..."]') },
        { n:2, loc: page.locator('[data-gorunum="tur"]').first().locator('..') }]);
      await capture(page, IMG+'/builder-arayuz-parca-ekle.png', { x:0, y:108, width:320, height:450 });
      await clearMarks(page);
    }
    if (wanted('dosya-menusu')) {
      await menu(page, 'Dosya').click(); await page.waitForTimeout(400);
      await capture(page, IMG+'/builder-arayuz-dosya-menusu.png', { x:0, y:40, width:300, height:350 });
      await page.keyboard.press('Escape');
    }
  }
  // --- Omni chassis captures ---
  if (['ilk-kup','ilk-structure','ilk-tak','ilk-kaydet'].some(wanted)) {
    const { page } = await prepare3d(browser);
    await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 60);
    await page.waitForTimeout(3000);
    if (wanted('ilk-kup')) {
      // Mark the view cube before switching to the top view
      await mark(page, [{ n:4, box:{ x:1078, y:132, width:46, height:34 }, pad:2 }]);
      await capture(page, IMG+'/builder-ilk-gorunum-kupu.png', { x:860, y:108, width:310, height:220 });
      await clearMarks(page);
    }
    // Add a Structure
    await page.getByText('Parça Ekle', { exact:true }).first().click();
    await page.locator('[data-section="shop-yapi"]').click();
    await page.locator('[data-family][title="Structure seçeneklerini aç"]').first().click();
    await page.waitForTimeout(600);
    const rows = page.locator('[data-family-folder] [data-part-type]');
    const before = (await listParts(page)).length;
    const target = rows.nth(2);
    if (wanted('ilk-structure')) {
      await mark(page, [{ n:3, loc: target }]);
      await capture(page, IMG+'/builder-ilk-structure-ekle.png', { x:0, y:108, width:320, height:420 });
      await clearMarks(page);
    }
    await target.click();
    await page.waitForFunction((n) => window.__robot.getState().parts.length > n, before);
    await page.waitForTimeout(2500);
    if (wanted('ilk-tak')) {
      const ps = await listParts(page);
      const added = ps[ps.length - 1];
      await page.keyboard.press('b'); await page.waitForTimeout(500);
      // source: a hole of the new part; target: the highest hole on the chassis
      const srcHoles = await partHoles(page, added.id);
      const k = await toScreen(page, srcHoles[0].p);
      await page.mouse.click(k.x, k.y); await page.waitForTimeout(800);
      let best = null;
      for (const p of ps.slice(0, -1).filter(q => q.type.includes('str'))) {
        for (const h of await partHoles(page, p.id)) if (!best || h.p[1] > best.p[1]) best = h;
      }
      const h = await toScreen(page, best.p);
      await page.mouse.click(h.x, h.y); await page.waitForTimeout(3000);
      await capture(page, IMG+'/builder-ilk-tak-sonuc.png', { x:310, y:108, width:860, height:600 });
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    }
    if (wanted('ilk-kaydet')) {
      await page.locator('button[title="Proje adını düzenle"]').click();
      await page.keyboard.press('Control+A'); await page.keyboard.type('ilk robot'); await page.keyboard.press('Enter');
      await menu(page, 'Dosya').click(); await page.waitForTimeout(400);
      await mark(page, [{ n:3, loc: page.getByText('Kaydet (JSON indir)') }]);
      await capture(page, IMG+'/builder-ilk-kaydet.png', { x:0, y:40, width:420, height:200 });
      await clearMarks(page); await page.keyboard.press('Escape');
    }
  }
  // --- WattOS mecanum chassis: interface regions, properties, context menu ---
  if (['bolgeler','ozellikler','baglam'].some(wanted)) {
    const { page } = await prepare3d(browser);
    await page.locator('[data-bos-sahne-robot="wattos-mekanum-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 25);
    await page.waitForTimeout(3000);
    const ps = await listParts(page);
    const str = ps.find(p => p.type.includes('str')) ?? ps[0];
    await page.evaluate((id) => window.__robot.getState().selectOnlyPart(id), str.id);
    await page.waitForTimeout(1500);
    if (wanted('bolgeler')) {
      await mark(page, [
        { n:1, box:{ x:4, y:2, width:1432, height:38 } },
        { n:2, box:{ x:4, y:46, width:220, height:22 }, at:'r' },
        { n:3, box:{ x:4, y:76, width:1432, height:28 } },
        { n:4, box:{ x:6, y:114, width:298, height:780 }, at:'bl' },
        { n:5, box:{ x:316, y:114, width:848, height:780 } },
        { n:6, box:{ x:1176, y:114, width:258, height:780 }, at:'tr' }]);
      await capture(page, IMG+'/builder-arayuz-bolgeler.png', FULL);
      await clearMarks(page);
    }
    if (wanted('ozellikler')) {
      await mark(page, [
        { n:1, loc: page.locator('[data-testid="varyant"]'), at:'lt' },
        { n:2, box: await headingWithInputs(page, 'Konum (mm)'), at:'lt' },
        { n:3, box: await headingWithInputs(page, 'Dönüş (°)'), at:'lt' }]);
      // 24 px of the scene on the left: room for the badges outside the frames
      await capture(page, IMG+'/builder-arayuz-ozellikler.png', { x:1146, y:108, width:294, height:500 });
      await clearMarks(page);
    }
    if (wanted('baglam')) {
      const p = await toScreen(page, str.pos);
      await page.mouse.click(p.x, p.y, { button:'right' }); await page.waitForTimeout(800);
      const m = await page.getByText('Sabitle', { exact:true }).or(page.getByText('Sil', { exact:false })).first().boundingBox().catch(() => null);
      const cx = Math.max(310, Math.min(p.x - 40, 1170 - 330));
      const cy = Math.max(108, Math.min(p.y - 60, 900 - 520));
      await capture(page, IMG+'/builder-arayuz-baglam-menusu.png', { x:cx, y:cy, width:330, height:520 });
      await page.keyboard.press('Escape');
    }
  }
} finally { await browser.close(); }
