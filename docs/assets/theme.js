/* Probot Docs — tema davranışları (custom tema: theme/main.html + probot.css) */
(function () {
  'use strict';

  /* ---- deco blob parallax (header'ın scroll→turuncu işi <probot-header> bileşeninde) ---- */
  var shapes = Array.prototype.slice.call(document.querySelectorAll('.deco .sh[data-p]'));
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      /* parallax: translate AYRI özellik — keyframe'lerdeki rotate ile çakışmaz */
      for (var i = 0; i < shapes.length; i++) {
        shapes[i].style.translate = '0 -' + (y * parseFloat(shapes[i].dataset.p)).toFixed(1) + 'px';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobil menü ---- */
  var menuBtn = document.getElementById('menuBtn');
  var backdrop = document.getElementById('backdrop');
  function closeHeaderMenu() {
    var ph = document.querySelector('probot-header');
    if (ph) ph.removeAttribute('data-open');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    closeHeaderMenu();
    document.body.classList.toggle('nav-open');
  });
  if (backdrop) backdrop.addEventListener('click', function () { document.body.classList.remove('nav-open'); });

  /* ---- içerikteki dış linkler yeni sekmede (header/footer site linkleri aynı sekmede kalır) ---- */
  var origin = location.origin;
  document.querySelectorAll('.content a[href^="http"]').forEach(function (a) {
    if (!a.href.startsWith(origin)) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  /* ---- kod bloklarına kopyala butonu ---- */
  document.querySelectorAll('.content .highlight').forEach(function (block) {
    var pre = block.querySelector('pre');
    if (!pre) return;
    var btn = document.createElement('button');
    btn.className = 'copyBtn';
    btn.type = 'button';
    btn.textContent = 'KOPYALA';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')).then(function () {
        btn.textContent = '✓ KOPYALANDI';
        btn.classList.add('ok');
        setTimeout(function () {
          btn.textContent = 'KOPYALA';
          btn.classList.remove('ok');
        }, 1600);
      });
    });
    block.appendChild(btn);
  });

  /* ---- sağ TOC scrollspy ---- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[decodeURIComponent(a.hash.slice(1))] = a; });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && byId[e.target.id]) {
          if (current) current.classList.remove('act');
          current = byId[e.target.id];
          current.classList.add('act');
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    document.querySelectorAll('.content h2[id], .content h3[id]').forEach(function (h) { io.observe(h); });
  }

  /* ---- arama: search_index.json üzerinde bağımlılıksız basit skorlama ---- */
  var modal = document.getElementById('smodal');
  var input = document.getElementById('sinput');
  var list = document.getElementById('sres');
  var searchBtn = document.getElementById('searchBtn');
  var base = document.body.dataset.base || '.';
  var index = null;
  var sel = 0;

  function trLower(s) { return s.toLocaleLowerCase('tr'); }

  function openSearch() {
    closeHeaderMenu();
    modal.hidden = false;
    input.value = '';
    list.innerHTML = '';
    input.focus();
    if (!index) {
      fetch(base + '/search/search_index.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          index = data.docs.filter(function (d) { return d.title; }).map(function (d) {
            return { loc: d.location, title: d.title, text: d.text || '', lt: trLower(d.title), lx: trLower(d.text || '') };
          });
        });
    }
  }
  function closeSearch() { modal.hidden = true; }

  function snippet(text, pos) {
    var start = Math.max(0, pos - 40);
    var s = (start > 0 ? '…' : '') + text.slice(start, pos + 90);
    return s.length < text.length - start ? s + '…' : s;
  }

  function render(results, q) {
    list.innerHTML = '';
    sel = 0;
    if (!results.length) {
      var li = document.createElement('li');
      li.className = 'none';
      li.textContent = '"' + q + '" için sonuç yok.';
      list.appendChild(li);
      return;
    }
    results.forEach(function (r, i) {
      var li = document.createElement('li');
      if (i === 0) li.className = 'on';
      var a = document.createElement('a');
      a.href = base + '/' + r.loc;
      var b = document.createElement('b');
      var parts = r.title;
      b.textContent = parts;
      if (r.page && r.page !== r.title) {
        var sec = document.createElement('span');
        sec.className = 'sec';
        sec.textContent = ' · ' + r.page;
        b.appendChild(sec);
      }
      var span = document.createElement('span');
      span.textContent = r.snip;
      a.appendChild(b);
      a.appendChild(span);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function search(q) {
    if (!index || !q.trim()) { list.innerHTML = ''; return; }
    var terms = trLower(q).split(/\s+/).filter(Boolean);
    var pages = {};
    index.forEach(function (d) { if (d.loc.indexOf('#') === -1) pages[d.loc] = d.title; });
    var scored = [];
    index.forEach(function (d) {
      var score = 0, firstPos = -1;
      terms.forEach(function (t) {
        if (d.lt.indexOf(t) !== -1) score += 6;
        var p = d.lx.indexOf(t);
        if (p !== -1) { score += 1; if (firstPos === -1) firstPos = p; }
      });
      if (score > 0) {
        scored.push({
          loc: d.loc,
          title: d.title,
          page: pages[d.loc.split('#')[0]] || '',
          snip: firstPos !== -1 ? snippet(d.text, firstPos) : d.text.slice(0, 110),
          score: score
        });
      }
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    render(scored.slice(0, 8), q);
  }

  function move(dir) {
    var items = list.querySelectorAll('li:not(.none)');
    if (!items.length) return;
    items[sel] && items[sel].classList.remove('on');
    sel = (sel + dir + items.length) % items.length;
    items[sel].classList.add('on');
    items[sel].scrollIntoView({ block: 'nearest' });
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
    input.addEventListener('input', function () { search(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var on = list.querySelector('li.on a');
        if (on) location.href = on.href;
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); modal.hidden ? openSearch() : closeSearch(); }
    else if (e.key === 'Escape' && !modal.hidden) closeSearch();
    else if (e.key === '/' && modal.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
})();
