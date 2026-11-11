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

  var placement = null; // column index for each card, from the last layout

  function build(count) {
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

    placement = cards.map(function (card) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      columns[shortest].appendChild(card);
      heights[shortest] = columns[shortest].offsetHeight;
      return shortest;
    });
  }

  function layout() {
    var count = columnCount();
    if (count === current) return;
    current = count;
    build(count);
  }

  // Works out where each card would go from the cards' current heights, without
  // moving anything (cards in the masonry columns all have the same width).
  function plan() {
    var gap = parseFloat(getComputedStyle(cards[0]).marginBottom) || 0;
    var heights = [];
    var counts = [];
    for (var i = 0; i < current; i++) { heights.push(0); counts.push(0); }
    return cards.map(function (card) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      heights[shortest] += (counts[shortest]++ ? gap : 0) + card.offsetHeight;
      return shortest;
    });
  }

  layout();
  window.addEventListener('resize', layout);
  // Fonts change card heights, so re-balance once they've loaded, but only if a card
  // would actually change column. Moving a card cancels its fade-in mid-load, and on
  // a phone (one column) nothing ever needs to move.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (plan().join() !== placement.join()) build(current);
    });
  }
})();
