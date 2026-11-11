// Fades elements with .reveal in as they enter the viewport.
// Testimonial cards in view together get a short stagger.
(function () {
  var items = document.querySelectorAll('.reveal');
  var show = function (el) {
    el.classList.add('is-visible');
    // Drop the stagger once revealed so hover transitions respond immediately.
    el.addEventListener('transitionend', function () {
      el.style.setProperty('--delay', '0ms');
    }, { once: true });
  };

  if (!('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }

  // On first load: title + footer, then the description streams in, then the company list.
  // stream.js sets how long the first cards wait; they then stagger.
  var INITIAL_CARD_DELAY = parseInt(document.documentElement.dataset.cardDelay, 10) || 780;
  var firstCards = true;

  var observer = new IntersectionObserver(function (entries) {
    var batch = 0;
    var offset = firstCards ? INITIAL_CARD_DELAY : 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.classList.contains('testimonial')) {
        el.style.setProperty('--delay', (offset + batch++ * 90) + 'ms');
        firstCards = false;
      }
      show(el);
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  items.forEach(function (el) {
    // The pinned sidebar never scrolls, so reveal it on load rather than on scroll.
    if (el.closest('.sidebar')) {
      requestAnimationFrame(function () { show(el); });
    } else {
      observer.observe(el);
    }
  });
})();
