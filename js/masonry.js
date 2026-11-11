// Lays testimonial cards out left to right, each into the shortest column,
// so the first cards in the HTML land across the top row.
// Without JS, the CSS column layout in site.css is the fallback.
(function () {
  var grid = document.querySelector('.testimonials');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.testimonial'));
  var current = 0;

  function columnCount() {
    // Based on the grid's own width, since the sidebar takes part of the window.
    return grid.clientWidth >= 560 ? 2 : 1;
  }

  function layout() {
    var count = columnCount();
    if (count === current) return;
    current = count;

    var columns = [];
    var heights = [];
    for (var i = 0; i < count; i++) {
      var col = document.createElement('div');
      col.className = 'masonry-col';
      columns.push(col);
      heights.push(0);
    }

    grid.innerHTML = '';
    columns.forEach(function (col) { grid.appendChild(col); });
    grid.classList.add('is-masonry');

    cards.forEach(function (card) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      columns[shortest].appendChild(card);
      heights[shortest] = columns[shortest].offsetHeight;
    });
  }

  layout();
  window.addEventListener('resize', layout);
  // Fonts change card heights; re-balance once they've loaded.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { current = 0; layout(); });
  }
})();
