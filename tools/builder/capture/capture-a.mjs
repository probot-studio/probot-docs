// Builder docs, group A images. Usage: node capture-a.mjs <img-dir> <scene,...> [step1,step2]
// scenes: bos | wattos | omni1 | omni2 | panel | montaj
import { connect, prepare3d, mark, clearMarks, capture, toScreen, listParts } from './lib.mjs';
const IMG = process.argv[2];
const SCENES = new Set(process.argv[3].split(','));
let lastCtx = null;
let omniPage = null;
async function fresh() { if (lastCtx) await lastCtx.close().catch(()=>{}); const r = await prepare3d(browser); lastCtx = r.ctx; return r; }
const only = process.argv[4] ? process.argv[4].split(',') : null;
const wanted = (name) => !only || only.includes(name);
const FULL = { x:0, y:0, width:1440, height:900 };
const browser = await connect();
const menu = (page, m) => page.locator('button[aria-haspopup="menu"]', { hasText: m }).first();
const tab = (page, name) => page.locator('.dv-tab', { hasText: name }).first();
const t0 = Date.now();
const log = (...a) => console.log(((Date.now()-t0)/1000).toFixed(0)+'s', ...a);
const union = (bs) => { const x = Math.min(...bs.map(b=>b.x)), y = Math.min(...bs.map(b=>b.y));
  return { x, y, width: Math.max(...bs.map(b=>b.x+b.width))-x, height: Math.max(...bs.map(b=>b.y+b.height))-y }; };
// Sol paneldeki sekmeler sığmıyorsa (Türkçede "Parça Ekle" sekmesi soldan kesik kalıyor) paneli sash'ten sürükleyerek genişlet.
async function fitLeftTabs(page) {
  const over = () => page.evaluate(() => {
    const c = [...document.querySelectorAll('.dv-tabs-container')].find(e => e.getBoundingClientRect().x < 50);
    if (!c) return null; c.scrollLeft = 0; return c.scrollWidth - c.clientWidth;
  });
  const o = await over(); log('left tabs overflow', o);
  if (!o || o <= 0) return;
  const sashes = await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
  const sh = sashes.filter(r => r.height > 300 && r.x < 500).sort((a, b) => a.x - b.x)[0];
  if (!sh) return;
  const sx = sh.x + sh.width / 2, sy = sh.y + sh.height / 2, d = o + 16;
  await page.mouse.move(sx, sy); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(sx + d * i / 8, sy);
  await page.mouse.up(); await page.mouse.move(1439, 899); await page.waitForTimeout(1500);
  log('left tabs overflow after widening', await over());
}
async function loadOmni(page) {
  await page.locator('[data-bos-sahne-robot="omni-sasi"]').click();
  await page.waitForFunction(() => window.__robot.getState().parts.length > 60);
  await page.waitForTimeout(3000);
}
// Box around one group (heading + its options) in the View menu
async function groupBox(page, heading, n) {
  const m = page.locator('[role=menu]').first();
  const lab = m.getByText(heading, { exact:true }).first();
  const lb = await lab.boundingBox();
  const items = await m.locator('[role=menuitemradio],[role=menuitemcheckbox]').evaluateAll((es, y) =>
    es.map(e => e.getBoundingClientRect()).filter(r => r.top > y).map(r => ({ x:r.x, y:r.y, width:r.width, height:r.height })), lb.y);
  const picked = [items[0]]; for (let i = 1; i < n; i++) picked.push(items[i]);
  const mb = await m.boundingBox();
  const u = union([lb, ...picked]);
  return { x: mb.x + 3, y: u.y - 1, width: mb.width - 6, height: u.height + 2 };
}
try {
  if (SCENES.has('bos')) try {
    const { page } = await fresh();
    if (wanted('bos-sahne-karti')) {
      await mark(page, [{ n:2, loc: page.locator('[data-bos-sahne-robot="omni-sasi"]') }]);
      const k = await page.locator('[data-bos-sahne-karti]').boundingBox();
      await capture(page, IMG+'/builder-hazir-bos-sahne-karti.png', { x:k.x-24, y:k.y-24, width:k.width+48, height:k.height+48 });
      await clearMarks(page); log('bos-sahne-karti');
    }
    if (wanted('katalog')) {
      await tab(page, 'Robot Kataloğu').click(); await page.waitForTimeout(800);
      await fitLeftTabs(page);
      const search = page.locator('input[placeholder="Robot ara..."]');
      await search.click(); await search.fill('wattos'); await page.waitForTimeout(800);
      await page.locator('input[placeholder="Robot ara..."]').blur();
      const card = page.locator('[data-robot-yukle="wattos-mekanum-sasi"]');
      await mark(page, [{ n:2, loc: search }, { n:3, loc: card, at:'r' }]);
      const p = await page.locator('[data-catalog-panel]').boundingBox();
      const kb = await card.boundingBox();
      // start at the top of the panel tab row (108): higher up, the bottom of the toolbar buttons shows as an orange strip
      const top = Math.max(108, p.y-34);
      await capture(page, IMG+'/builder-hazir-katalog.png', { x:p.x, y:top, width:p.width, height: Math.min(kb.y+kb.height+40, p.y+p.height) - top });
      await clearMarks(page); await search.fill(''); log('katalog');
    }
    if (wanted('panel-paneller')) {
      const catTab = tab(page, 'Robot Kataloğu');
      await catTab.hover(); await page.waitForTimeout(300);
      await catTab.locator('.dv-default-tab-action, [class*="action"]').first().click();
      await page.waitForTimeout(800);
      log('robot catalog tab count', await page.locator('.dv-tab', { hasText:'Robot Kataloğu' }).count());
      await menu(page, 'Görünüm').click(); await page.waitForTimeout(500);
      const target = page.getByRole('menuitemcheckbox', { name:'Robot Kataloğu' });
      await mark(page, [{ n:3, loc: target, pad:1 }]);
      const lab = await page.locator('[role=menu]').first().getByText('Paneller', { exact:true }).boundingBox();
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, IMG+'/builder-panel-paneller.png', { x:mb.x-16, y:lab.y-14, width:mb.width+32, height: mb.y+mb.height - lab.y + 30 });
      await clearMarks(page); await page.keyboard.press('Escape'); log('panel-paneller');
    }
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
  if (SCENES.has('wattos')) try {
    const { page } = await fresh();
    await page.locator('[data-bos-sahne-robot="wattos-mekanum-sasi"]').click();
    await page.waitForFunction(() => window.__robot.getState().parts.length > 25);
    await page.waitForTimeout(3000);
    log('wattos parts', await page.evaluate(() => window.__robot.getState().parts.length));
    await tab(page, 'Robot Kataloğu').click(); await page.waitForTimeout(800);
    await page.locator('[data-robot-yukle="omni-sasi"]').click(); await page.waitForTimeout(800);
    const confirm = page.locator('[data-robot-onay]');
    log('confirm', await confirm.innerText());
    await mark(page, [{ n:3, loc: page.locator('[data-robot-onayla]') }]);
    const ob = await confirm.boundingBox();
    const p = await page.locator('[data-catalog-panel]').boundingBox();
    const top = Math.max(p.y + 30, ob.y - 330);
    await capture(page, IMG+'/builder-hazir-degistir-onayi.png', { x:p.x, y:top, width:p.width, height: ob.y+ob.height+20 - top });
    await clearMarks(page); log('degistir-onayi');
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
  if (SCENES.has('omni1')) try {
    const { page } = await fresh();
    await loadOmni(page); log('omni loaded'); omniPage = page;
    if (wanted('gorunum-kupu')) {
      await mark(page, [{ n:2, box:{ x:1078, y:132, width:46, height:34 }, pad:2 }]);
      await capture(page, IMG+'/builder-gezin-gorunum-kupu.png', { x:990, y:110, width:180, height:140 });
      await clearMarks(page); log('gorunum-kupu');
    }
    if (wanted('gorunum-menusu')) {
      await menu(page, 'Görünüm').click(); await page.waitForTimeout(500);
      await mark(page, [
        // rozetler sağ köşelerde: grup başlıkları sol köşede başlıyor
        { n:2, box: await groupBox(page, 'Fare düzeni', 3), pad:0, at:'tr' },
        { n:3, box: await groupBox(page, 'Kamera', 2), pad:0, at:'tr' },
        { n:4, box: await groupBox(page, 'Kontur', 3), pad:0, at:'tr' }]);
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, IMG+'/builder-gezin-gorunum-menusu.png', { x:mb.x-20, y:mb.y-34, width:mb.width+40, height:mb.height+50 });
      await clearMarks(page); await page.keyboard.press('Escape'); log('gorunum-menusu');
    }
    if (wanted('sim-dosya')) {
      await menu(page, 'Dosya').click(); await page.waitForTimeout(500);
      const sim = page.getByRole('menuitem', { name:"Sim'de dene" });
      log('sim menuitem', await sim.count(), await sim.isEnabled().catch(()=>null));
      await mark(page, [{ n:2, loc: sim, pad:1 }]);
      const mb = await page.locator('[role=menu]').first().boundingBox();
      await capture(page, IMG+'/builder-sim-dosya-menusu.png', { x:Math.max(0,mb.x-20), y:mb.y-34, width:mb.width+40, height:mb.height+50 });
      await clearMarks(page); await page.keyboard.press('Escape'); log('sim-dosya');
    }
    if (wanted('sim-katalog')) {
      await tab(page, 'Robot Kataloğu').click(); await page.waitForTimeout(800);
      const b = page.locator('[data-simde-dene]');
      log('sim title', await b.getAttribute('title'));
      await mark(page, [{ n:2, loc: b }]);
      const p = await page.locator('[data-catalog-panel]').boundingBox();
      await capture(page, IMG+'/builder-sim-katalog.png', { x:p.x, y:p.y-34, width:p.width, height:300 });
      await clearMarks(page); log('sim-katalog');
    }
    if (wanted('parcalar-satiri')) {
      await tab(page, 'Parçalar').click(); await page.waitForTimeout(800);
      const row = page.locator('[data-kit-row]').first();
      log('kit row', await row.innerText());
      await row.click(); await page.waitForTimeout(800);
      const expand = page.locator('[data-kit-ac]').first();
      log('expand before', await expand.getAttribute('title'), await expand.getAttribute('aria-label'));
      await expand.click(); await page.waitForTimeout(1500);
      log('expand after', await expand.getAttribute('title'), await expand.getAttribute('aria-label'));
      log('selected', await page.evaluate(() => (window.__robot.getState().selectedIds ?? window.__robot.getState().selectedPartIds ?? []).length));
      const rb = await row.boundingBox(); const ab = await expand.boundingBox();
      await mark(page, [{ n:3, loc: expand, pad:1 }, { n:2, box:{ x:ab.x+ab.width+10, y:rb.y, width:rb.x+rb.width-(ab.x+ab.width+10), height:rb.height }, pad:2 }]);
      await capture(page, IMG+'/builder-hazir-parcalar-satiri.png', { x:0, y:rb.y-104, width:rb.x+rb.width+12, height:340 });
      await clearMarks(page); log('parcalar-satiri');
    }
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
  if (SCENES.has('omni2')) try {
    const page = omniPage ?? (await fresh()).page;
    if (!omniPage) { await loadOmni(page); log('omni loaded'); omniPage = page; }
    const ps = await listParts(page);
    if (wanted('ortala')) {
      const wheels = ps.filter(p => /whl|teker/i.test(p.type));
      log('wheel types', [...new Set(wheels.map(t=>t.type))].join(','));
      await page.evaluate(() => window.__robot.getState().deselectAll()); await page.keyboard.press('Escape'); await page.waitForTimeout(800);
      const scale = Math.max(...ps.map(p => Math.abs(p.pos[0]))) > 5 ? 1 : 0.001; // mm or m
      const candidates = [];
      for (const t of wheels) for (const d of [[0,40,0],[0,-30,0],[40,0,0],[-40,0,0],[0,0,40],[0,0,-40]]) {
        const e = await toScreen(page, t.pos.map((v,i) => v + d[i]*scale));
        if (e.x > 340 && e.x < 1140 && e.y > 140 && e.y < 860) candidates.push({ t, e });
      }
      candidates.sort((a, b) => b.e.y - a.e.y);
      let hit = null;
      for (const a of candidates.slice(0, 6)) {
        await page.mouse.click(a.e.x, a.e.y, { button:'right' }); await page.waitForTimeout(1200);
        const header = await page.getByText('Ortala', { exact:true }).first().evaluate(el => { let m = el; for (let i = 0; i < 6 && m; i++) { if (m.innerText && /\n/.test(m.innerText) && m.innerText.includes('Sil')) break; m = m.parentElement; } return m ? m.innerText.split('\n')[0] : ''; }).catch(() => '');
        log('right click', a.t.type, header);
        if (/teker/i.test(header)) { hit = a; break; }
        await page.keyboard.press('Escape'); await page.evaluate(() => window.__robot.getState().deselectAll()); await page.waitForTimeout(600);
      }
      if (!hit) throw new Error('right click on a wheel did not register');
      const o = page.getByText('Ortala', { exact:true }).first();
      const mn = await o.locator('xpath=ancestor::*[contains(@class,"rounded")][1]').boundingBox().catch(() => null);
      log('context menu', JSON.stringify(mn), 'selection keys', await page.evaluate(() => JSON.stringify(Object.keys(window.__robot.getState()).filter(k=>/sel/i.test(k)))));
      await mark(page, [{ n:2, loc: o, pad:3 }]);
      const ob = await o.boundingBox();
      const cx = Math.max(310, Math.min(hit.e.x - 140, ob.x - 60)), cy = Math.max(108, Math.min(hit.e.y - 120, ob.y - 220));
      const clip = { x:cx, y:cy, width: Math.min(560, 1440-cx), height: Math.min(520, 900-cy) };
      await capture(page, IMG+'/builder-gezin-ortala.png', clip);
      await clearMarks(page); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await page.waitForTimeout(500); log('ortala');
    }
    if (wanted('fare')) {
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      // orbit with the right button, zoom with the wheel (real mouse input)
      const c = await page.locator('canvas').first().boundingBox();
      const cx = c.x + c.width/2, cy = c.y + c.height/2;
      await page.mouse.move(cx, cy); await page.mouse.down({ button:'right' });
      for (let i = 1; i <= 20; i++) await page.mouse.move(cx - i*4, cy + i*0.5);
      await page.mouse.up({ button:'right' }); await page.waitForTimeout(1500);
      await page.mouse.move(cx, cy);
      for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(200); }
      await page.waitForTimeout(3000);
      await capture(page, IMG+'/builder-gezin-fare.png', { x:c.x, y:c.y, width:c.width, height:c.height });
      log('fare');
    }
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
  if (SCENES.has('panel')) try {
    const page = omniPage ?? (await fresh()).page;
    if (!omniPage) { await loadOmni(page); log('omni loaded'); }
    else { await menu(page, 'Görünüm').click(); await page.waitForTimeout(400); await page.getByRole('menuitem', { name:'Sığdır' }).click(); await page.waitForTimeout(2500); }
    if (wanted('ayirici')) {
      const left = await page.locator('[data-catalog-panel], .dv-groupview').first().boundingBox();
      const sash = await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; }));
      log('sashes', JSON.stringify(sash));
      const s = sash.filter(r => r.height > 300 && r.x < 500).sort((a,b) => a.x-b.x)[0];
      const sx = s.x + s.width/2, sy = s.y + s.height/2;
      await page.mouse.move(sx, sy); await page.mouse.down();
      for (let i = 1; i <= 12; i++) await page.mouse.move(sx + i*10, sy);
      await page.mouse.up(); await page.waitForTimeout(2500);
      const s2 = (await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; }))).filter(r => r.height > 300 && r.x < 600).sort((a,b) => a.x-b.x)[0];
      log('sash after', JSON.stringify(s2));
      await mark(page, [{ n:2, box:{ x:s2.x + s2.width/2 - 4, y:s2.y + 6, width:8, height:s2.height - 12 }, pad:2 }]);
      // arrow: pointing right
      await page.evaluate(({ x, y }) => {
        const d = document.createElement('div'); d.className = 'docs-marker';
        d.innerHTML = `<svg width="90" height="30" viewBox="0 0 90 30"><path d="M4 15 H72" stroke="#E6007E" stroke-width="4" stroke-linecap="round"/><path d="M66 5 L84 15 L66 25 Z" fill="#E6007E"/></svg>`;
        Object.assign(d.style, { position:'fixed', left:(x+10)+'px', top:(y-15)+'px', zIndex:2147483646, pointerEvents:'none' });
        document.body.appendChild(d);
      }, { x: s2.x + s2.width/2, y: 420 });
      await capture(page, IMG+'/builder-panel-ayirici.png', { x: Math.max(0, s2.x - 300), y:100, width:600, height:800 });
      await clearMarks(page);
      await page.mouse.dblclick(s2.x + s2.width/2, s2.y + s2.height/2); await page.waitForTimeout(1500);
      const s3 = (await page.locator('.dv-sash').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; }))).filter(r => r.height > 300 && r.x < 600).sort((a,b) => a.x-b.x)[0];
      log('sash after double click', JSON.stringify(s3));
      log('ayirici');
    }
    if (wanted('sekme-tasi') || wanted('sifirla')) {
      await menu(page, 'Görünüm').click({ timeout:15000 }); await page.waitForTimeout(400);
      await page.getByRole('menuitem', { name:'Yerleşimi sıfırla' }).click({ timeout:15000 }); await page.waitForTimeout(1500);
      log('layout reset');
      const partsTab = tab(page, 'Parçalar');
      const tb = await partsTab.boundingBox();
      const c = await page.locator('canvas').first().boundingBox();
      const hx = c.x + c.width - 30, hy = c.y + c.height/2;
      // Drive the HTML5 drag with synthetic DragEvents (a real drag makes the screenshot hang)
      await page.evaluate(({ sx, sy, hx, hy }) => {
        const tab = document.elementFromPoint(sx, sy).closest('.dv-tab');
        const dt = new DataTransfer(); window.__dt = dt; window.__dtTab = tab;
        tab.dispatchEvent(new DragEvent('dragstart', { bubbles:true, cancelable:true, dataTransfer:dt, clientX:sx, clientY:sy }));
        const path = [[sx, sy + 200], [hx - 200, hy], [hx - 60, hy], [hx, hy]];
        let tgt = null;
        for (const [x, y] of path) { tgt = document.elementFromPoint(x, y);
          for (const ev of ['dragenter', 'dragover']) tgt.dispatchEvent(new DragEvent(ev, { bubbles:true, cancelable:true, dataTransfer:dt, clientX:x, clientY:y })); }
        window.__dtTgt = tgt;
      }, { sx: tb.x + tb.width/2, sy: tb.y + tb.height/2, hx, hy });
      await page.waitForTimeout(800);
      const drop = await page.locator('.dv-drop-target-selection, [class*="drop-target-selection"]').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; }));
      log('drop', JSON.stringify(drop));
      if (wanted('sekme-tasi')) {
        const d = drop.find(r => r.width > 20) ?? { x:hx-120, y:c.y, width:140, height:c.height };
        await mark(page, [{ n:2, box:d, pad:2 }]);
        // arrow: from the tab to the drop area
        await page.evaluate(({ a, b }) => {
          const ns = 'http://www.w3.org/2000/svg';
          const s = document.createElementNS(ns, 'svg'); s.setAttribute('class', 'docs-marker');
          Object.assign(s.style, { position:'fixed', left:0, top:0, width:'1440px', height:'900px', zIndex:2147483646, pointerEvents:'none' });
          const ang = Math.atan2(b.y-a.y, b.x-a.x), L = 18;
          const ex = b.x - Math.cos(ang)*L, ey = b.y - Math.sin(ang)*L;
          s.innerHTML = `<path d="M${a.x} ${a.y} L${ex} ${ey}" stroke="#E6007E" stroke-width="4" stroke-linecap="round"/>
            <path d="M${b.x} ${b.y} L${ex - Math.sin(ang)*9} ${ey + Math.cos(ang)*9} L${ex + Math.sin(ang)*9} ${ey - Math.cos(ang)*9} Z" fill="#E6007E"/>`;
          document.body.appendChild(s);
        }, { a:{ x: tb.x + tb.width/2, y: tb.y + tb.height + 8 }, b:{ x: d.x + d.width/2, y: d.y + d.height/2 } });
        await page.screenshot({ path: IMG+'/builder-panel-sekme-tasi.png', clip:{ x:0, y:40, width:1440, height:860 }, animations:'disabled' });
        await clearMarks(page); log('sekme-tasi');
      }
      await page.evaluate(({ hx, hy }) => { const dt = window.__dt;
        window.__dtTgt.dispatchEvent(new DragEvent('drop', { bubbles:true, cancelable:true, dataTransfer:dt, clientX:hx, clientY:hy }));
        window.__dtTab.dispatchEvent(new DragEvent('dragend', { bubbles:true, cancelable:true, dataTransfer:dt })); }, { hx, hy });
      await page.waitForTimeout(1500);
      log('tabs after', JSON.stringify(await page.locator('.dv-tab').evaluateAll(es => es.map(e => e.innerText.trim()+'@'+Math.round(e.getBoundingClientRect().x)))));
      if (wanted('sifirla')) {
        const tab2 = tab(page, 'Robot Kataloğu');
        await tab2.hover(); await page.waitForTimeout(300);
        await tab2.locator('.dv-default-tab-action, [class*="action"]').first().click({ timeout:15000 }); await page.waitForTimeout(800);
        await menu(page, 'Görünüm').click(); await page.waitForTimeout(500);
        await mark(page, [{ n:3, loc: page.getByRole('menuitem', { name:'Yerleşimi sıfırla' }), pad:1 }]);
        const mb = await page.locator('[role=menu]').first().boundingBox();
        await capture(page, IMG+'/builder-panel-sifirla.png', { x:0, y:30, width:Math.min(1440, mb.x+mb.width+400), height: Math.min(870, mb.y+mb.height+40) });
        await clearMarks(page);
        await page.getByRole('menuitem', { name:'Yerleşimi sıfırla' }).click(); await page.waitForTimeout(1500);
        log('after reset', JSON.stringify(await page.locator('.dv-tab').evaluateAll(es => es.map(e => e.innerText.trim()+'@'+Math.round(e.getBoundingClientRect().x)))));
        log('sifirla');
      }
    }
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
  if (SCENES.has('montaj')) try {
    const { page } = await fresh();
    await tab(page, 'Robot Kataloğu').click(); await page.waitForTimeout(800);
    const stepByStep = page.locator('[data-adim-adim="starter-bot-rev"]');
    await stepByStep.click();
    await page.getByText('Adım 1 / 14').waitFor({ timeout:180000 });
    await page.waitForFunction(() => window.__robot.getState().parts.length > 150, null, { timeout:180000 });
    await page.waitForTimeout(5000); log('assembly opened', await page.evaluate(() => window.__robot.getState().parts.length));
    const strip = page.locator('[aria-label="Adımlar"]').locator('xpath=ancestor::div[contains(@class,"h-[124px]")][1]');
    log('strip text', await strip.innerText().catch(e=>e.message));
    if (wanted('serit')) {
      await mark(page, [{ n:2, loc: stepByStep }]);
      await capture(page, IMG+'/builder-adim-serit.png', FULL);
      await clearMarks(page); log('serit');
    }
    const next = page.getByRole('button', { name:'İleri', exact:true });
    const back = page.getByRole('button', { name:'Geri', exact:true });
    if (wanted('ayir')) {
      await next.click(); await next.click();
      await page.getByText('Adım 3 / 14').waitFor(); await page.waitForTimeout(3000);
      await page.getByRole('button', { name:'Parçaları ayır' }).click();
      await page.waitForTimeout(4000);
      const merge = page.getByRole('button', { name:'Birleştir' });
      log('merge button', await merge.count());
      await mark(page, [{ n:2, loc: merge }]);
      const sb = await strip.boundingBox();
      await capture(page, IMG+'/builder-adim-ayir.png', { x:sb.x, y:108, width:sb.width, height: sb.y + sb.height - 108 });
      await clearMarks(page);
      await merge.click(); await page.waitForTimeout(2500); log('ayir');
    }
    if (wanted('gezin')) {
      const n = await page.evaluate(() => (document.body.innerText.match(/Adım (\d+) \/ 14/) || [])[1]);
      const targetStep = 6;
      for (let i = Number(n); i < targetStep; i++) { await next.click(); await page.waitForTimeout(300); }
      await page.getByText('Adım 6 / 14').waitFor(); await page.waitForTimeout(4000);
      log('step 6', await strip.innerText());
      await mark(page, [{ n:1, loc: back, pad:2 }, { n:2, loc: next, pad:2, at:'tr' }, { n:3, loc: page.locator('[aria-label="Adımlar"]') }]);
      const sb = await strip.boundingBox();
      const top = sb.y - 330;
      await capture(page, IMG+'/builder-adim-gezin.png', { x:sb.x, y:top, width:sb.width, height: sb.y + sb.height - top });
      await clearMarks(page); log('gezin');
    }
    if (wanted('duzenlemeye-gec')) {
      await page.getByRole('button', { name:'Adım 14', exact:true }).click();
      await page.getByText('Adım 14 / 14').waitFor(); await page.waitForTimeout(4000);
      const toEdit = page.locator('[data-duzenlemeye-gec]');
      log('switch-to-edit', await toEdit.count(), 'next disabled', await next.isDisabled());
      await mark(page, [{ n:1, loc: toEdit }]);
      const sb = await strip.boundingBox();
      await capture(page, IMG+'/builder-adim-duzenlemeye-gec.png', { x: sb.x + sb.width/2, y: sb.y - 10, width: sb.width/2, height: sb.height + 10 });
      await clearMarks(page);
      await toEdit.click(); await page.waitForTimeout(2500);
      log('strip after edit mode', await page.locator('[aria-label="Adımlar"]').count(), 'title', await page.locator('button[title="Proje adını düzenle"]').innerText().catch(()=>'-'));
      log('toast', await page.evaluate(() => [...document.querySelectorAll('[data-sonner-toast],[role=status]')].map(e=>e.innerText).join(' || ')));
      log('duzenlemeye-gec');
    }
  } catch (e) { log('ERROR', e.message.split('\n')[0]); }
} finally { await browser.close(); }
