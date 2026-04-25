/**
 * Place Value Slot — drag digits into labeled place-value columns.
 *
 * Data:
 *   { digits: "25473864" }                       -- build mode (default)
 *   { mode: "round", number: 67389, to: "tens" } -- rounding mode
 */
(function (global) {
  const PLACES = ['Ones','Tens','Hundreds','Thousands','Ten Thousands','Hundred Thousands','Millions','Ten Millions','Hundred Millions'];

  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function shuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

  function mount(host, data, ctx) {
    data = data || {};
    if (data.mode === 'round') return mountRound(host, data, ctx);
    return mountBuild(host, data, ctx);
  }

  function mountBuild(host, data, ctx) {
    const digits = String(data.digits || '374562');
    const len = digits.length;
    const places = PLACES.slice(0, len).reverse(); // index 0 = leftmost (highest place)
    host.classList.add('pep-game');
    const correctMap = digits.split(''); // expected digit per column

    host.innerHTML = `
      <div class="pep-game__title">🎰 Place Value Slot</div>
      <div class="pep-game__hud">
        <span>Goal: build <strong>${escapeHTML(Number(digits).toLocaleString('en-US'))}</strong></span>
        <span>Filled: <span data-role="filled">0</span> / ${len}</span>
      </div>
      <div class="pep-place-slot">
        ${places.map((label, i) => `
          <div class="pep-place-slot__col" data-col="${i}" data-expect="${correctMap[i]}">
            <div class="pep-place-slot__slot" aria-label="${escapeHTML(label)}">_</div>
            <div class="pep-place-slot__label">${escapeHTML(label)}</div>
          </div>
        `).join('')}
      </div>
      <div class="pep-place-slot__pool">
        ${shuffle(digits.split('')).map(d => `<button class="pep-place-slot__digit" data-d="${escapeHTML(d)}">${escapeHTML(d)}</button>`).join('')}
      </div>
      <div class="pep-game__msg" data-role="msg"></div>
    `;

    let selected = null;
    const filledEl = host.querySelector('[data-role="filled"]');
    const msg = host.querySelector('[data-role="msg"]');
    let filled = 0;

    host.querySelectorAll('.pep-place-slot__digit').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-locked')) return;
        host.querySelectorAll('.pep-place-slot__digit.is-selected').forEach(x => x.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selected = btn;
        try { ctx?.sound?.('click'); } catch(_){}
      });
    });

    host.querySelectorAll('.pep-place-slot__col').forEach(col => {
      col.addEventListener('click', () => {
        if (!selected) return;
        if (col.classList.contains('is-filled')) return;
        const expect = col.dataset.expect;
        const got = selected.dataset.d;
        const slot = col.querySelector('.pep-place-slot__slot');
        if (got === expect) {
          slot.textContent = got;
          col.classList.add('is-filled');
          selected.classList.add('is-locked');
          selected.classList.remove('is-selected');
          filled++;
          filledEl.textContent = filled;
          try { ctx?.sound?.('correct'); } catch(_){}
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = `✓ ${expect} goes in ${PLACES[len - 1 - (+col.dataset.col)]} place!`;
          if (filled === len) {
            msg.textContent = '🎉 You built the number!';
            try { ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
          }
          selected = null;
        } else {
          col.classList.add('is-wrong');
          try { ctx?.sound?.('wrong'); } catch(_){}
          msg.className = 'pep-game__msg is-wrong';
          msg.textContent = `That digit goes somewhere else!`;
          setTimeout(() => col.classList.remove('is-wrong'), 500);
        }
      });
    });
  }

  function mountRound(host, data, ctx) {
    const n = data.number || 67;
    const place = data.to || 'tens';
    const step = place === 'thousands' ? 1000 : place === 'hundreds' ? 100 : 10;
    const lo = Math.floor(n / step) * step;
    const hi = lo + step;
    const correct = (n - lo) >= step / 2 ? hi : lo;

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🎯 Round it!</div>
      <div class="pep-game__hud">
        <span>Round <strong>${n.toLocaleString('en-US')}</strong> to the nearest ${escapeHTML(place)}</span>
      </div>
      <div style="display:flex; gap:18px; justify-content:center; padding: 22px;">
        <button class="pep-chip" data-v="${lo}">${lo.toLocaleString('en-US')}</button>
        <button class="pep-chip" data-v="${hi}">${hi.toLocaleString('en-US')}</button>
      </div>
      <div class="pep-game__msg" data-role="msg"></div>
    `;
    const msg = host.querySelector('[data-role="msg"]');
    host.querySelectorAll('.pep-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = +btn.dataset.v;
        if (v === correct) {
          btn.classList.add('is-correct');
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = `🎉 ${n} rounds to ${correct}!`;
          try { ctx?.sound?.('correct'); ctx?.awardXP?.(10); ctx?.complete?.(); } catch(_){}
        } else {
          btn.classList.add('is-wrong');
          msg.className = 'pep-game__msg is-wrong';
          msg.textContent = `Almost! Look closer at the digit.`;
          try { ctx?.sound?.('wrong'); } catch(_){}
          setTimeout(() => btn.classList.remove('is-wrong'), 500);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('place-value-slot', { id: 'place-value-slot', label: 'Place Value', icon: '🎰', mount });
    }
  });
})(window);
