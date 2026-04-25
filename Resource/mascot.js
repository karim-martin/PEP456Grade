/**
 * PEP Mascot — "Pip" the parrot.
 *
 * A friendly fixed-position SVG character with a speech bubble.
 * States: idle (gentle bob), cheer (jump+flap), think (head tilt),
 *         encourage (wave), sad (brief slump, never defeatist).
 *
 * Public API:
 *   PEPMascot.mount(container?)        - attach (defaults to <body>)
 *   PEPMascot.unmount()
 *   PEPMascot.say(text, ms=4000)
 *   PEPMascot.cheer(text?)
 *   PEPMascot.think(text?)
 *   PEPMascot.encourage(text?)
 *   PEPMascot.hide() / show()
 */
(function (global) {
  let _root = null;
  let _bubble = null;
  let _hideTimer = null;
  let _stateTimer = null;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function buildMascot() {
    const wrap = document.createElement('div');
    wrap.className = 'pep-mascot';
    wrap.setAttribute('role', 'complementary');
    wrap.setAttribute('aria-label', 'Pip the parrot, your study buddy');

    // SVG parrot — green body, yellow beak, red wing accent.
    wrap.innerHTML = `
      <div class="pep-mascot__bubble" hidden></div>
      <button class="pep-mascot__btn" type="button" title="Click Pip!">
        <svg class="pep-mascot__svg" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- tail -->
          <path d="M30 100 Q15 110 18 130 Q35 120 42 105 Z" fill="#1f7a3f"/>
          <!-- body -->
          <ellipse cx="60" cy="85" rx="34" ry="40" fill="#2bb673"/>
          <!-- belly -->
          <ellipse cx="60" cy="95" rx="20" ry="26" fill="#fff7c2"/>
          <!-- wing -->
          <path class="pep-mascot__wing" d="M40 75 Q30 95 50 110 Q60 92 55 75 Z" fill="#1f7a3f"/>
          <!-- head -->
          <circle cx="60" cy="45" r="28" fill="#2bb673"/>
          <!-- crest -->
          <path d="M60 18 Q66 6 78 12 Q72 22 60 26 Z" fill="#ed3833"/>
          <path d="M60 18 Q54 6 42 12 Q48 22 60 26 Z" fill="#f8a531"/>
          <!-- eye -->
          <circle class="pep-mascot__eye" cx="68" cy="42" r="6" fill="#fff"/>
          <circle class="pep-mascot__pupil" cx="70" cy="43" r="3" fill="#1a1a1a"/>
          <!-- beak -->
          <path d="M82 50 Q98 56 90 66 Q78 60 78 54 Z" fill="#f9c100"/>
          <path d="M82 56 Q92 60 88 66 Q80 62 80 58 Z" fill="#e89e00"/>
          <!-- feet -->
          <path d="M52 122 L52 132 M48 132 L56 132" stroke="#f9c100" stroke-width="3" stroke-linecap="round"/>
          <path d="M68 122 L68 132 M64 132 L72 132" stroke="#f9c100" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    const btn = wrap.querySelector('.pep-mascot__btn');
    btn.addEventListener('click', () => {
      const tips = [
        'You can do this! 🌟',
        'Try a small game today! 🎮',
        'Reading helps your brain grow! 📚',
        'Math is just puzzles for your brain! 🧩',
        'Every Caribbean kid is brilliant! 🇯🇲',
        'One more chapter — go! 🚀',
        'Mistakes mean you\'re learning! 💚'
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      cheer(tip);
      try { global.PEPAudio?.sfx('pop'); } catch(_) {}
    });

    return wrap;
  }

  function setState(state) {
    if (!_root) return;
    _root.classList.remove('is-idle','is-cheer','is-think','is-encourage','is-sad');
    _root.classList.add('is-' + state);
    if (_stateTimer) clearTimeout(_stateTimer);
    if (state !== 'idle') {
      _stateTimer = setTimeout(() => {
        _root.classList.remove('is-' + state);
        _root.classList.add('is-idle');
      }, 2200);
    }
  }

  function showBubble(text, ms) {
    if (!_bubble) return;
    _bubble.textContent = String(text || '');
    _bubble.hidden = false;
    if (_hideTimer) clearTimeout(_hideTimer);
    _hideTimer = setTimeout(() => { _bubble.hidden = true; }, ms || 4000);
    try { global.PEPAudio?.speak(text); } catch(_) {}
  }

  function mount(container) {
    if (_root) return _root;
    const host = container || document.body;
    _root = buildMascot();
    host.appendChild(_root);
    _bubble = _root.querySelector('.pep-mascot__bubble');
    setState('idle');
    return _root;
  }

  function unmount() {
    if (_root) _root.remove();
    _root = null; _bubble = null;
    if (_hideTimer) clearTimeout(_hideTimer);
    if (_stateTimer) clearTimeout(_stateTimer);
  }

  function say(text, ms) { showBubble(text, ms); }
  function cheer(text) { setState('cheer'); if (text) showBubble(text, 3500); }
  function think(text) { setState('think'); if (text) showBubble(text, 4500); }
  function encourage(text) { setState('encourage'); if (text) showBubble(text || 'Almost! Try again 💚', 3500); }
  function sad(text) { setState('sad'); if (text) showBubble(text, 2500); }
  function hide() { if (_root) _root.style.display = 'none'; }
  function show() { if (_root) _root.style.display = ''; }

  global.PEPMascot = { mount, unmount, say, cheer, think, encourage, sad, hide, show };

  // Auto-mount on hub-style pages (not inside lesson activities — host pages opt in).
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.pepMascot !== 'off') {
      mount();
    }
  });
})(window);
