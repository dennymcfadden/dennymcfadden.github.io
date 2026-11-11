// Sun/moon toggle in the footer. The page follows the system light/dark setting
// until the visitor clicks this; their choice is then remembered. Picking the same
// theme as the system again clears the choice, so the page goes back to following it.
// The initial theme is set by a small script in index.html's <head> to avoid a flash.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var STORAGE_KEY = 'theme';
  var LIGHT_BAR = '#fafafa';
  var DARK_BAR = '#1c2741';

  function saved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function systemTheme() {
    return system.matches ? 'dark' : 'light';
  }

  // The parts the browser draws itself (scrollbar, overscroll area, Safari's tab bar)
  // can't fade, so they switch on their own, halfway through the color fade.
  function renderBrowserParts(theme) {
    root.setAttribute('data-scheme', theme);
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute('content', theme === 'dark' ? DARK_BAR : LIGHT_BAR);
    });
  }

  function render(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.title = theme === 'dark' ? 'Dark mode' : 'Light mode';
    }
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Cross-fade colors instead of snapping. Everything themed is a flat color (the glow
  // and scroll fade are colors shaped by masks, since gradients can't transition), so
  // it all fades together, and the live page keeps its hover states throughout.
  // The browser-drawn parts switch at the midpoint, when the page is mid-tone, so they
  // don't jump ahead of the fade.
  function switchTo(theme) {
    clearTimeout(switchTo.timer);
    clearTimeout(switchTo.halfway);
    if (reducedMotion.matches) {
      render(theme);
      renderBrowserParts(theme);
      return;
    }
    root.classList.add('theme-transition');
    render(theme);
    switchTo.halfway = setTimeout(function () { renderBrowserParts(theme); }, 200);
    switchTo.timer = setTimeout(function () { root.classList.remove('theme-transition'); }, 450);
  }

  var initial = root.getAttribute('data-theme') || systemTheme();
  render(initial);
  renderBrowserParts(initial);

  // Follow system changes live, unless the visitor has picked a theme.
  var onSystemChange = function () {
    var choice = saved();
    if (choice !== 'light' && choice !== 'dark') switchTo(systemTheme());
  };
  if (system.addEventListener) {
    system.addEventListener('change', onSystemChange);
  } else if (system.addListener) {
    system.addListener(onSystemChange); // older Safari
  }

  if (!toggle) return;
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      if (next === systemTheme()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch (e) {}
    switchTo(next);
    if (window.uiSound) window.uiSound.play(next === 'dark' ? 'toggle_off' : 'toggle_on');
  });
})();
