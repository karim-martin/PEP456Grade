/**
 * PEP Matching — click a term on the left, then its definition on the right.
 * (Simpler than drag-drop — works flawlessly on touch & desktop.)
 */
(function (global) {

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function render(host, chapterId, data) {
    const allPairs = (data && data.match && data.match.pairs) ? data.match.pairs : [];
    if (allPairs.length < 3) return;

    // Take up to 6 pairs
    const pairs = shuffle(allPairs).slice(0, Math.min(6, allPairs.length));
    const lefts = pairs.map((p, i) => ({ id: i, text: p[0] }));
    const rights = shuffle(pairs.map((p, i) => ({ id: i, text: p[1] })));

    host.innerHTML = `
      <div class="pep-match">
        <div class="pep-match__title">🔗 Match It!</div>
        <p style="color:var(--pep-text-muted); margin-bottom:10px;">Click a term on the left, then its match on the right.</p>
        <div class="pep-match__grid">
          <div class="pep-match__col">
            ${lefts.map(x => `<div class="pep-match__item" data-side="L" data-id="${x.id}">${escapeHTML(x.text)}</div>`).join('')}
          </div>
          <div class="pep-match__col">
            ${rights.map(x => `<div class="pep-match__item" data-side="R" data-id="${x.id}">${escapeHTML(x.text)}</div>`).join('')}
          </div>
        </div>
        <div class="pep-match__status" style="text-align:center;font-weight:700;margin-top:8px;">Matches: <span class="pep-match__count">0</span> / ${pairs.length}</div>
      </div>`;

    let selected = null; // { el, side, id }
    let matched = 0;
    const items = host.querySelectorAll('.pep-match__item');
    const countEl = host.querySelector('.pep-match__count');

    items.forEach(el => {
      el.addEventListener('click', () => handleClick(el));
    });

    function handleClick(el) {
      if (el.classList.contains('is-matched')) return;
      const side = el.dataset.side;
      const id = +el.dataset.id;

      if (!selected) {
        clearSelected();
        el.classList.add('is-selected');
        selected = { el, side, id };
        return;
      }

      if (selected.el === el) {
        el.classList.remove('is-selected');
        selected = null;
        return;
      }

      // Must click opposite side
      if (selected.side === side) {
        clearSelected();
        el.classList.add('is-selected');
        selected = { el, side, id };
        return;
      }

      // Check match
      if (selected.id === id) {
        selected.el.classList.remove('is-selected');
        selected.el.classList.add('is-matched');
        el.classList.add('is-matched');
        matched++;
        countEl.textContent = matched;
        if (global.PEP) PEP.playSound('correct');
        if (matched === lefts.length) {
          if (global.PEP) {
            PEP.awardXP(30, { silent: false });
            if (typeof PEP.confetti === 'function') PEP.confetti();
          }
        }
      } else {
        selected.el.classList.add('is-shake');
        el.classList.add('is-shake');
        if (global.PEP) PEP.playSound('wrong');
        const sel = selected;
        setTimeout(() => {
          sel.el.classList.remove('is-shake', 'is-selected');
          el.classList.remove('is-shake');
        }, 450);
      }
      selected = null;
    }

    function clearSelected() {
      items.forEach(i => i.classList.remove('is-selected'));
    }
  }

  global.PEPMatching = { render };

  // Self-register as a lesson-player game module.
  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame('match', {
        id: 'match', label: 'Match It', icon: '🔗',
        mount(host, data, ctx) {
          // data carries pairs directly OR {match:{pairs}}
          const chapterData = data && data.match ? data : { match: { pairs: data?.pairs || [] } };
          render(host, ctx?.chapterId || '', chapterData);
        }
      });
    }
  });
})(window);
