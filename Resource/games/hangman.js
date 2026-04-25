/**
 * Hangman — guess the word letter-by-letter.
 *
 * Data:
 *   { word: "Caribbean", hint: "A sea around Jamaica", maxWrong: 6 }
 */
(function (global) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  function gallowsSVG(wrongs) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 220');
    function line(x1,y1,x2,y2,vis) { const ln = document.createElementNS(ns,'line'); ln.setAttribute('x1',x1); ln.setAttribute('y1',y1); ln.setAttribute('x2',x2); ln.setAttribute('y2',y2); ln.setAttribute('stroke', vis?'currentColor':'transparent'); ln.setAttribute('stroke-width', '4'); ln.setAttribute('stroke-linecap','round'); return ln; }
    function circle(cx,cy,r,vis) { const c = document.createElementNS(ns,'circle'); c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',r); c.setAttribute('fill','none'); c.setAttribute('stroke', vis?'currentColor':'transparent'); c.setAttribute('stroke-width','4'); return c; }
    // Gallows
    svg.appendChild(line(20,200,120,200,true));
    svg.appendChild(line(60,200,60,30,true));
    svg.appendChild(line(60,30,140,30,true));
    svg.appendChild(line(140,30,140,55,true));
    // Body parts shown as wrongs increase
    svg.appendChild(circle(140,75,20, wrongs >= 1)); // head
    svg.appendChild(line(140,95,140,150, wrongs >= 2)); // body
    svg.appendChild(line(140,110,115,135, wrongs >= 3)); // L arm
    svg.appendChild(line(140,110,165,135, wrongs >= 4)); // R arm
    svg.appendChild(line(140,150,118,180, wrongs >= 5)); // L leg
    svg.appendChild(line(140,150,162,180, wrongs >= 6)); // R leg
    return svg;
  }

  function mount(host, data, ctx) {
    const word = String(data?.word || 'Caribbean').toUpperCase();
    const hint = data?.hint || '';
    const maxWrong = data?.maxWrong ?? 6;
    let wrongs = 0;
    const guessed = new Set();

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🪢 Hangman</div>
      <div class="pep-game__hud"><span>Hint: ${hint || 'No hint!'}</span><span>Wrong: <span data-wrong>0</span> / ${maxWrong}</span></div>
      <div class="pep-hangman">
        <div class="pep-hangman__svg" data-svg></div>
        <div class="pep-hangman__word" data-word></div>
        <div class="pep-hangman__keyboard" data-kb></div>
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const svgHost = host.querySelector('[data-svg]');
    const wordEl = host.querySelector('[data-word]');
    const kbEl = host.querySelector('[data-kb]');
    const wrongEl = host.querySelector('[data-wrong]');
    const msg = host.querySelector('[data-msg]');

    function refreshSvg() { svgHost.innerHTML=''; svgHost.appendChild(gallowsSVG(wrongs)); }
    function refreshWord() {
      wordEl.textContent = word.split('').map(ch => /[A-Z]/.test(ch) ? (guessed.has(ch) ? ch : '_') : ch).join(' ');
    }
    function buildKeyboard() {
      kbEl.innerHTML = ALPHABET.map(L => `<button class="pep-hangman__key" data-l="${L}">${L}</button>`).join('');
      kbEl.querySelectorAll('.pep-hangman__key').forEach(btn => {
        btn.addEventListener('click', () => guess(btn.dataset.l, btn));
      });
    }
    function guess(L, btn) {
      if (guessed.has(L)) return;
      guessed.add(L);
      btn.disabled = true;
      if (word.includes(L)) {
        btn.classList.add('is-correct');
        try { ctx?.sound?.('correct'); } catch(_){}
        refreshWord();
        if (word.split('').every(ch => !/[A-Z]/.test(ch) || guessed.has(ch))) {
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = `🎉 You spelled it: ${word}!`;
          try { ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        }
      } else {
        btn.classList.add('is-wrong');
        wrongs++; wrongEl.textContent = wrongs;
        try { ctx?.sound?.('wrong'); } catch(_){}
        refreshSvg();
        if (wrongs >= maxWrong) {
          msg.className = 'pep-game__msg is-wrong';
          msg.textContent = `Almost! The word was ${word}. Don't worry — try again next time. 💚`;
          // Reveal full word, mark complete (no defeatist game-over).
          word.split('').forEach(ch => guessed.add(ch));
          refreshWord();
          try { ctx?.awardXP?.(5); ctx?.complete?.(); } catch(_){}
        }
      }
    }
    refreshSvg(); refreshWord(); buildKeyboard();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('hangman', { id:'hangman', label:'Hangman', icon:'🪢', mount });
    }
  });
})(window);
