/**
 * Long Division Walker — interactive long division solver.
 *
 * Data:  { dividend: 84, divisor: 7 }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function mount(host, data, ctx) {
    const dividend = data?.dividend ?? 84;
    const divisor  = data?.divisor  ?? 7;
    const ans = Math.floor(dividend / divisor);
    const rem = dividend % divisor;

    const digits = String(dividend).split('');
    let i = 0;        // current position in dividend
    let carry = 0;    // current working number
    let answer = '';  // accumulated answer
    let history = []; // log of steps as HTML lines

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">📏 Long Division Walker</div>
      <div class="pep-game__hud">
        <span>Solve <strong>${dividend} ÷ ${divisor}</strong> step by step.</span>
      </div>
      <div class="pep-longdiv">
        <div class="pep-longdiv__work" data-work></div>
      </div>
      <div style="text-align:center;margin-top:10px">
        <button class="pep-chip" data-act="step">Next step ▶</button>
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const work = host.querySelector('[data-work]');
    const msg = host.querySelector('[data-msg]');

    function refresh() {
      const ansLine = answer ? `<div style="text-align:right">${answer}<span style="opacity:0.3">${'_'.repeat(Math.max(0, digits.length - answer.length))}</span></div>` : '';
      const dividendLine = `<div class="pep-longdiv__bracket">${divisor}<span style="opacity:0.5"> ⟍ </span>${dividend}</div>`;
      work.innerHTML = ansLine + dividendLine + history.join('');
    }

    function step() {
      if (i >= digits.length) {
        msg.className = 'pep-game__msg is-correct';
        msg.innerHTML = rem === 0
          ? `🎉 ${dividend} ÷ ${divisor} = <strong>${ans}</strong>`
          : `🎉 ${dividend} ÷ ${divisor} = <strong>${ans}</strong> remainder <strong>${rem}</strong>`;
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        host.querySelector('[data-act="step"]').disabled = true;
        return;
      }
      // Bring down next digit
      carry = carry * 10 + parseInt(digits[i], 10);
      const q = Math.floor(carry / divisor);
      const sub = q * divisor;
      const newCarry = carry - sub;
      // Append to answer (skip leading zero unless this is the only digit)
      if (q !== 0 || answer.length > 0) {
        answer += String(q);
      } else if (i === digits.length - 1) {
        answer += '0';
      }
      history.push(`<div style="margin-top:6px">How many <strong>${divisor}</strong>s in <strong>${carry}</strong>? <strong>${q}</strong></div>`);
      history.push(`<div>${q} × ${divisor} = ${sub}</div>`);
      history.push(`<div>${carry} − ${sub} = <strong>${newCarry}</strong></div>`);
      carry = newCarry;
      i++;
      try { ctx?.sound?.('pop'); } catch(_){}
      refresh();
    }

    refresh();
    host.querySelector('[data-act="step"]').addEventListener('click', step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('long-division-walker', { id:'long-division-walker', label:'Long Division', icon:'📏', mount });
    }
  });
})(window);
