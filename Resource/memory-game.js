/**
 * PEP Memory Game — concentration-style matching pairs.
 * Reuses the `match.pairs` data format from question banks when given a chapter,
 * or falls back to an emoji deck for the games hub.
 */
(function (global) {

  const EMOJI_PAIRS = [
    '🇯🇲','🌴','🏝️','🌊','☀️','🥭','🥥','🦎','🐠','🎵','📚','🧪',
    '🗺️','🧮','🎨','🏛️','⚽','🏀','🎓','🪁','🍌','🌶️','🐢','🚀'
  ];

  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function render(host, opts) {
    opts = opts || {};
    const pairsCount = Math.min(opts.pairs || 8, 12);
    let items;

    if (opts.chapterData && opts.chapterData.match && opts.chapterData.match.pairs && opts.chapterData.match.pairs.length >= 4) {
      const p = shuffle(opts.chapterData.match.pairs).slice(0, pairsCount);
      items = [];
      p.forEach((pair, i) => {
        items.push({ key: i, text: pair[0] });
        items.push({ key: i, text: pair[1] });
      });
    } else {
      const emojis = shuffle(EMOJI_PAIRS).slice(0, pairsCount);
      items = [];
      emojis.forEach((e, i) => {
        items.push({ key: i, text: e });
        items.push({ key: i, text: e });
      });
    }

    items = shuffle(items);
    const gridCols = pairsCount <= 6 ? 4 : (pairsCount <= 10 ? 4 : 6);

    host.innerHTML = `
      <div class="pep-memory">
        <div class="pep-memory__hud">
          <span class="pep-memory__title">🧠 Memory Match</span>
          <span>Moves: <span class="pep-memory__moves">0</span></span>
          <span>Matches: <span class="pep-memory__matches">0</span> / ${pairsCount}</span>
          <button class="pep-btn-ghost pep-memory__restart" type="button">🔁 Restart</button>
        </div>
        <div class="pep-memory__grid" style="grid-template-columns: repeat(${gridCols}, 1fr);">
          ${items.map((it, i) => `<div class="pep-memory__card" data-i="${i}" data-key="${it.key}">?</div>`).join('')}
        </div>
      </div>`;

    const cards = host.querySelectorAll('.pep-memory__card');
    const movesEl = host.querySelector('.pep-memory__moves');
    const matchesEl = host.querySelector('.pep-memory__matches');
    const restart = host.querySelector('.pep-memory__restart');

    let open = []; let moves = 0; let matches = 0; let lock = false;

    cards.forEach(c => c.addEventListener('click', () => onFlip(c)));
    restart.addEventListener('click', () => render(host, opts));

    function onFlip(card) {
      if (lock) return;
      if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
      const i = +card.dataset.i;
      card.textContent = items[i].text;
      card.classList.add('is-flipped');
      open.push(card);
      if (open.length === 2) {
        moves++; movesEl.textContent = moves;
        const [a, b] = open;
        if (a.dataset.key === b.dataset.key) {
          a.classList.add('is-matched'); b.classList.add('is-matched');
          open = [];
          matches++; matchesEl.textContent = matches;
          if (global.PEP) PEP.playSound('correct');
          if (matches === pairsCount) {
            if (global.PEP) {
              PEP.awardXP(60);
              if (typeof PEP.confetti === 'function') PEP.confetti();
              PEP.toast(`<span class="pep-toast__icon">🧠</span><span><strong>You won!</strong><br>${moves} moves</span>`, 'levelup');
            }
          }
        } else {
          lock = true;
          if (global.PEP) PEP.playSound('flip');
          setTimeout(() => {
            a.classList.remove('is-flipped'); a.textContent = '?';
            b.classList.remove('is-flipped'); b.textContent = '?';
            open = []; lock = false;
          }, 700);
        }
      }
    }
  }

  global.PEPMemory = { render };

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame('memory', {
        id: 'memory', label: 'Memory Match', icon: '🧠',
        mount(host, data, ctx) { render(host, { chapterData: data, pairs: data?.pairs }); }
      });
    }
  });
})(window);
