/**
 * PEP Flashcards — tap to flip, swipe or button to advance.
 */
(function (global) {

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function render(host, chapterId, data) {
    const cards = (data && data.flashcards) ? data.flashcards : [];
    if (cards.length === 0) return;

    let idx = 0;

    host.innerHTML = `
      <div class="pep-flash">
        <div class="pep-flash__title">🗂️ Flashcards</div>
        <p class="pep-flash__subtitle" style="color:var(--pep-text-muted); margin-bottom: 10px;">Tap the card to flip it. Use ◀ ▶ to move through the deck.</p>
        <div class="pep-flash__card">
          <div class="pep-flash__inner">
            <div class="pep-flash__face pep-flash__face--front"></div>
            <div class="pep-flash__face pep-flash__face--back"></div>
          </div>
        </div>
        <div class="pep-flash__controls">
          <button class="pep-btn-ghost pep-flash__prev" type="button">◀ Prev</button>
          <span class="pep-flash__counter">1 / ${cards.length}</span>
          <button class="pep-btn-ghost pep-flash__next" type="button">Next ▶</button>
        </div>
      </div>`;

    const card = host.querySelector('.pep-flash__card');
    const front = host.querySelector('.pep-flash__face--front');
    const back  = host.querySelector('.pep-flash__face--back');
    const counter = host.querySelector('.pep-flash__counter');
    const prev = host.querySelector('.pep-flash__prev');
    const next = host.querySelector('.pep-flash__next');

    let awarded = false;

    function show(i) {
      idx = (i + cards.length) % cards.length;
      card.classList.remove('is-flipped');
      front.textContent = cards[idx].front;
      back.textContent  = cards[idx].back;
      counter.textContent = `${idx + 1} / ${cards.length}`;
      if (!awarded && idx === cards.length - 1) {
        awarded = true;
        if (global.PEP) {
          PEP.awardXP(25, { silent: true });
        }
      }
    }

    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
      if (global.PEP) PEP.playSound('flip');
    });
    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));

    // Swipe support (touch)
    let sx = 0;
    card.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        if (dx < 0) show(idx + 1); else show(idx - 1);
      }
    });

    show(0);
  }

  global.PEPFlashcards = { render };

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame('flashcards', {
        id: 'flashcards', label: 'Flashcards', icon: '🗂️',
        mount(host, data, ctx) {
          // data may be a chapter object or { flashcards: [...] }
          const chapterData = (data && data.flashcards) ? data : { flashcards: data?.cards || [] };
          render(host, ctx?.chapterId || '', chapterData);
        }
      });
    }
  });
})(window);
