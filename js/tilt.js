// Gives each testimonial card a fresh random tilt every time it's hovered.
(function () {
  var cards = document.querySelectorAll('.testimonial');
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var direction = Math.random() < 0.5 ? -1 : 1;
      var amount = 0.4 + Math.random() * 0.6; // 0.4°–1.0°
      card.style.setProperty('--tilt', (direction * amount).toFixed(2) + 'deg');
    });
  });
})();
