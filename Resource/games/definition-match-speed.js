/**
 * Definition Match Speed — term flashes, pick the right definition.
 *
 * Data:
 *   { pairs: [[term, def], ...], seconds: 60 }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function shuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
  function pick(a, n) { return shuffle(a).slice(0, n); }

  function mount(host, data, ctx) {
    const pairs = (data?.pairs || []).slice();
    if (pairs.length < 4) {
      host.innerHTML = '<p>Need at least 4 pairs.</p>';
      return ctx?.complete?.();
    }
    const total = data?.seconds || 60;
    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">⚡ Definition Sprint</div>
      <div class="pep-game__hud">
        <span class="pep-defmatch__hud">Score: <span data-score>0</span></span>
        <span class="pep-defmatch__hud">⏱️ <span class="pep-defmatch__time" data-time>${total}</span>s</span>
      </div>
      <div class="pep-defmatch__term" data-term>Ready?</div>
      <div class="pep-defmatch__opts" data-opts></div>
      <div class="pep-game__msg" data-msg></div>
    `;

    const termEl = host.querySelector('[data-term]');
    const optsEl = host.querySelector('[data-opts]');
    const scoreEl = host.querySelector('[data-score]');
    const timeEl = host.querySelector('[data-time]');
    const msg = host.querySelector('[data-msg]');

    let score = 0, t = total, timer = null, current = null, ended = false;

    function nextRound() {
      if (ended) return;
      const correct = pairs[Math.floor(Math.random() * pairs.length)];
      const distractors = pick(pairs.filter(p => p !== correct), 3).map(p => p[1]);
      const opts = shuffle([correct[1], ...distractors]);
      current = correct[1];
      termEl.textContent = correct[0];
      try { ctx?.speak?.(correct[0]); } catch(_){}
      optsEl.innerHTML = opts.map(o => `<button class="pep-lesson__btn pep-lesson__btn--opt">${escapeHTML(o)}</button>`).join('');
      optsEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          if (ended) return;
          if (btn.textContent === current) {
            btn.classList.add('is-correct');
            score++; scoreEl.textContent = score;
            try { ctx?.sound?.('correct'); } catch(_){}
            setTimeout(nextRound, 350);
          } else {
            btn.classList.add('is-wrong');
            try { ctx?.sound?.('wrong'); } catch(_){}
            // show the right one too
            optsEl.querySelectorAll('button').forEach(b => {
              if (b.textContent === current) b.classList.add('is-correct');
            });
            setTimeout(nextRound, 700);
          }
        });
      });
    }

    function tick() {
      t--;
      timeEl.textContent = t;
      if (t <= 5) try { ctx?.sound?.('tick'); } catch(_){}
      if (t <= 0) finish();
    }

    function finish() {
      ended = true;
      if (timer) clearInterval(timer);
      msg.className = 'pep-game__msg is-correct';
      msg.innerHTML = `🏁 Time! You scored <strong>${score}</strong>.`;
      const earnedXp = score * 3;
      try { ctx?.awardXP?.(earnedXp); ctx?.complete?.(); if (score >= 8) global.PEP?.confetti?.(); } catch(_){}
    }

    nextRound();
    timer = setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('definition-match-speed', { id:'definition-match-speed', label:'Speed Match', icon:'⚡', mount });
    }
  });
})(window);
