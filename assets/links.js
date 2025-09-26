document.addEventListener('DOMContentLoaded', function () {
  try {
    var origin = location.origin;
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (!a.href.startsWith(origin)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });
  } catch (e) {}
}); 