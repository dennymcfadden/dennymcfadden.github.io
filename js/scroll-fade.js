// Hides the bottom fade once the end of the testimonials is on screen,
// so it never sits over the last cards.
(function () {
  var fade = document.querySelector('.scroll-fade');
  var cards = document.querySelector('.testimonials');
  if (!fade || !cards) return;

  var ticking = false;
  function update() {
    ticking = false;
    var atEnd = cards.getBoundingClientRect().bottom <= window.innerHeight + 24;
    fade.classList.toggle('is-hidden', atEnd);
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
