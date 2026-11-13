// Streams the intro description, then the company list, in word by word like
// it's being written, and tells reveal.js when the cards may start.
(function () {
  var desc = document.querySelector('[data-stream]');
  if (!desc) return;

  var START = 280;      // ms after load, once the headline is on its way in
  var STEP = 25.6;      // ms between words (32 / 1.25)
  var GAP = 128;        // pause between the description and the company list
  var ITEM_PAUSE = 72;  // extra beat before each company name
  var ARROW_LAG = 96;   // arrow fades in just after its company's last word

  var t = START;

  // Replaces each text node in `parent` with word spans, each timed STEP after the last.
  function streamWords(parent) {
    Array.prototype.slice.call(parent.childNodes).forEach(function (node) {
      if (node.nodeType !== Node.TEXT_NODE) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        word.style.setProperty('--delay', t + 'ms');
        t += STEP;
        frag.appendChild(word);
      });
      parent.replaceChild(frag, node);
    });
  }

  streamWords(desc);
  t += GAP;

  var links = Array.prototype.slice.call(desc.querySelectorAll('.org-list .inline-link'));
  links.forEach(function (link) {
    t += ITEM_PAUSE;
    // The link is a flex container, which would drop the spaces between word
    // spans, so the words go in an inline wrapper instead.
    var label = document.createElement('span');
    label.className = 'link-label';
    while (link.firstChild) label.appendChild(link.firstChild);
    link.appendChild(label);
    streamWords(label);
    link.style.setProperty('--arrow-delay', (t - STEP + ARROW_LAG) + 'ms');
  });

  var done = t + ARROW_LAG;
  // reveal.js reads this to hold the first cards until the list has written in.
  document.documentElement.dataset.cardDelay = String(done + 150);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { desc.classList.add('is-streaming'); });
  });

  // Clear the arrow delays once streaming is over so hover responds immediately.
  setTimeout(function () {
    links.forEach(function (link) { link.style.setProperty('--arrow-delay', '0ms'); });
  }, done + 700);
})();
