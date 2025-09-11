(function loadPartials(){
  const sections = document.querySelectorAll('.section-container[data-src]');
  sections.forEach(async (section) => {
    const src = section.getAttribute('data-src');
    if (!src) return;
    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (!res.ok) return;
      const html = await res.text();
      // Replace only the inner content, not the container itself
      const navMatch = section.innerHTML.match(/<div class=\"section-navigation\"[\s\S]*$/);
      section.innerHTML = html + (navMatch ? navMatch[0] : '');
    } catch(_) { /* ignore, fallback to inline */ }
  });
})(); 