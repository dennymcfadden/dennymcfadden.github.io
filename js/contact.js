// "Contact" in the footer copies the email address instead of opening a mail app.
// Hovering shows "copy hi@denny.nyc" beside it; clicking copies, swaps that to
// "copied!" and plays a small success sound. Without JS it's a plain mailto link.
(function () {
  var wrap = document.querySelector('.contact');
  if (!wrap) return;
  var button = wrap.querySelector('.contact__button');
  var status = wrap.querySelector('[role="status"]');
  var email = button.getAttribute('data-email');
  var COPIED_FOR = 1800; // ms "copied!" stays up
  var HINT_FADE = 350;   // ms, matches the hint's fade in site.css
  var timer = null;

  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', 'Copy email address ' + email);

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return copyWithSelection(text); });
    }
    return copyWithSelection(text);
  }

  // Older browsers, a page opened straight from disk, or a blocked clipboard API.
  function copyWithSelection(text) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(field);
      if (ok) { resolve(); } else { reject(); }
    });
  }

  button.addEventListener('click', function (e) {
    e.preventDefault();
    copy(email).then(function () {
      wrap.classList.remove('is-resting');
      wrap.classList.add('is-copied');
      status.textContent = 'Email address copied';
      if (window.uiSound) window.uiSound.play('success');
      clearTimeout(timer);
      timer = setTimeout(function () {
        status.textContent = '';
        if (wrap.matches(':hover')) {
          // Still hovering: fade "copied!" out rather than swapping back to
          // "copy hi@denny.nyc". The hint comes back on the next hover.
          wrap.classList.add('is-resting');
          timer = setTimeout(function () { wrap.classList.remove('is-copied'); }, HINT_FADE);
        } else {
          wrap.classList.remove('is-copied');
        }
      }, COPIED_FOR);
    }, function () {
      // Copying isn't allowed here, so fall back to opening the mail app.
      window.location.href = 'mailto:' + email;
    });
  });

  wrap.addEventListener('mouseleave', function () {
    if (!wrap.classList.contains('is-resting')) return;
    clearTimeout(timer);
    wrap.classList.remove('is-resting', 'is-copied');
  });
})();
