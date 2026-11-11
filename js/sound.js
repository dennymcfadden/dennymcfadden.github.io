// A soft tap when hovering links and buttons, with a speaker toggle in the footer
// to turn sounds off.
// Sounds are from SND (https://snd.dev), Sine kit, free to use. sounds/ui-sounds.wav
// holds just tap_01, celebration and the two toggle sounds, cut from SND's sprite.
// Other scripts can play a sound with window.uiSound.play('success').
(function () {
  // [start, length, volume relative to VOLUME] in seconds within the file
  var SPRITE = {
    tap: [0, 0.04, 1],
    toggle_on: [0.1, 0.13, 1],
    toggle_off: [0.3, 0.13, 1],
    success: [0.5, 0.56, 1]   // SND's "celebration"
  };
  var VOLUME = 0.25;     // kept low: these should be felt more than heard
  var MIN_GAP = 45;      // ms; stops a fast sweep across links from chattering
  var STORAGE_KEY = 'sound';
  var HOVER_TARGETS = '.pill, .inline-link, .icon-toggle';

  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var toggle = document.querySelector('.sound-toggle');
  window.uiSound = { play: function () {} };
  if (!AudioCtx) {
    if (toggle) toggle.hidden = true;
    return;
  }

  var enabled = true;
  try { enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch (e) {}

  var ctx = null;
  var gain = null;
  var buffer = null;
  var decoded = null;    // resolves once the sounds are ready to play
  var lastPlayed = 0;
  var lastPointer = 'mouse';
  // Fetch the file now; decode once the browser lets us create audio (after a click or key).
  var file = fetch('sounds/ui-sounds.wav?v=6').then(function (r) { return r.arrayBuffer(); });

  // Browsers block audio until the visitor interacts with the page.
  function unlock() {
    if (ctx) return;
    ctx = new AudioCtx();
    gain = ctx.createGain();
    gain.gain.value = VOLUME;
    gain.connect(ctx.destination);
    decoded = file.then(function (data) {
      // Safari's older decodeAudioData only takes callbacks.
      return new Promise(function (resolve, reject) {
        ctx.decodeAudioData(data, resolve, reject);
      });
    }).then(function (b) { buffer = b; });
  }
  window.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; unlock(); }, true);
  window.addEventListener('keydown', function () { lastPointer = 'keyboard'; unlock(); }, true);

  function start(segment) {
    if (ctx.state === 'suspended') ctx.resume();
    var source = ctx.createBufferSource();
    var level = ctx.createGain();
    source.buffer = buffer;
    level.gain.value = segment[2];
    source.connect(level);
    level.connect(gain);
    source.start(0, segment[0], segment[1]);
  }

  // Sounds answering a click wait for the file to decode, so even the visitor's
  // first click on the page gets its sound.
  function playSoon(segment) {
    unlock();
    decoded.then(function () { start(segment); });
  }

  window.uiSound.play = function (name) {
    // No sound for touch: phones have no speaker toggle to turn it off.
    if (!enabled || lastPointer === 'touch' || !SPRITE[name]) return;
    playSoon(SPRITE[name]);
  };

  // Mouse only: touch has no hover, and a sound on every scroll would be noise.
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || !enabled) return;
    var target = e.target.closest(HOVER_TARGETS);
    if (!target) return;
    // pointerover bubbles from children too, so only count entering the element itself.
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    var now = performance.now();
    if (now - lastPlayed < MIN_GAP) return;
    lastPlayed = now;
    // Hover sounds are dropped until audio is ready; a late one would feel random.
    if (buffer && ctx.state === 'running') {
      start(SPRITE.tap);
    }
  });

  if (!toggle) return;

  function render() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Turn sound off' : 'Turn sound on');
    toggle.title = enabled ? 'Sound on' : 'Sound off';
  }
  render();

  toggle.addEventListener('click', function () {
    enabled = !enabled;
    try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
    render();
    // Confirm the change audibly; the "off" sound is the last one played.
    playSoon(enabled ? SPRITE.toggle_on : SPRITE.toggle_off);
  });
})();
