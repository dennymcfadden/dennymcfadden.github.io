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
  // No card may start before cardsStartAt (set from stream.js's timing), however it comes
  // into view — on load, after a quick scroll, or when a phone reopens the page part way down.
  var INITIAL_CARD_DELAY = parseInt(document.documentElement.dataset.cardDelay, 10) || 780;
  var CARD_STAGGER = 60; // ms between cards that come into view together
  var cardsStartAt = performance.now() + INITIAL_CARD_DELAY;

  var observer = new IntersectionObserver(function (entries) {
    var batch = 0;
    var wait = Math.max(0, Math.round(cardsStartAt - performance.now()));
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      observer.unobserve(el);
      if (el.classList.contains('testimonial')) {
        // Wait with a timer rather than a CSS transition-delay: masonry.js may move
        // cards between columns when the web fonts arrive (often late on phones), and
        // moving an element cancels its pending transition, so it would pop in early.
        setTimeout(function () { show(el); }, wait + batch++ * CARD_STAGGER);
        return;
      }
      show(el);
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
