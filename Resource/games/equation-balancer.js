/**
 * Equation Balancer — solve simple equations using inverse operations.
 *
 * Data:
 *   { left: "x + 5", right: "12", solveFor: "x" }
 *   Supports: x+a, x-a, ax, x/a, ax+b
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  // Parse simple linear left = right into {a, b} where a*x + b = right
  function parseLinear(left, right) {
    const r = parseFloat(right);
    let a = 1, b = 0;
    // Strip spaces
    const L = String(left).replace(/\s+/g, '');
    // Match patterns: ax+b, ax-b, x+b, x-b, x, ax, x/a, x/a+b
    let m;
    if ((m = L.match(/^(\d*)x([+-]\d+)?$/))) {
      a = m[1] ? parseFloat(m[1]) : 1;
      b = m[2] ? parseFloat(m[2]) : 0;
    } else if ((m = L.match(/^x\/(\d+)([+-]\d+)?$/))) {
      a = 1 / parseFloat(m[1]);
      b = m[2] ? parseFloat(m[2]) : 0;
    }
    return { a, b, r };
  }

  function mount(host, data, ctx) {
    const left = data?.left || 'x + 5';
    const right = data?.right ?? 12;
    const { a, b, r } = parseLinear(left, right);
    const solution = (r - b) / a;

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">⚖️ Balance the Equation</div>
      <div class="pep-balance">
        <div class="pep-balance__display" data-display></div>
        <div class="pep-balance__svg" data-svg></div>
        <div class="pep-balance__ops" data-ops></div>
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const display = host.querySelector('[data-display]');
    const opsEl = host.querySelector('[data-ops]');
    const svgEl = host.querySelector('[data-svg]');
    const msg = host.querySelector('[data-msg]');

    let curA = a, curB = b, curR = r;

    function refresh() {
      let leftStr = '';
      if (curA !== 1) leftStr += (curA === 1 ? '' : curA) + 'x';
      else leftStr += 'x';
      if (curB > 0) leftStr += ' + ' + curB;
      else if (curB < 0) leftStr += ' − ' + (-curB);
      display.innerHTML = `${leftStr} = ${curR}`;
      svgEl.innerHTML = scaleSvg(Math.abs(curA), curR / Math.max(Math.abs(curA), 1));
      // Suggest ops
      const ops = [];
      if (curB > 0) ops.push({ label:`− ${curB}`, fn: () => { curR -= curB; curB = 0; } });
      if (curB < 0) ops.push({ label:`+ ${-curB}`, fn: () => { curR += -curB; curB = 0; } });
      if (curA !== 1 && curB === 0) ops.push({ label:`÷ ${curA}`, fn: () => { curR = curR / curA; curA = 1; } });
      ops.push({ label:'I solved it!', fn: check });
      opsEl.innerHTML = '';
      ops.forEach(op => {
        const btn = document.createElement('button');
        btn.className = 'pep-chip';
        btn.textContent = op.label;
        btn.addEventListener('click', () => { try { ctx?.sound?.('click'); } catch(_){} op.fn(); refresh(); });
        opsEl.appendChild(btn);
      });
    }

    function check() {
      if (curA === 1 && curB === 0) {
        if (Math.abs(curR - solution) < 1e-9) {
          msg.className = 'pep-game__msg is-correct';
          msg.innerHTML = `🎉 x = <strong>${solution}</strong>`;
          try { ctx?.sound?.('correct'); ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        }
      } else {
        msg.className = 'pep-game__msg';
        msg.textContent = 'Keep going — get x by itself first.';
      }
    }

    function scaleSvg(left, right) {
      // small balanced scale visual
      const tilt = Math.max(-0.4, Math.min(0.4, (right - left) * 0.06));
      const beamY1 = 50 - tilt * 40;
      const beamY2 = 50 + tilt * 40;
      return `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
        <line x1="160" y1="20" x2="160" y2="100" stroke="currentColor" stroke-width="3"/>
        <polygon points="150,100 170,100 160,140" fill="currentColor"/>
        <line x1="40" y1="${beamY1}" x2="280" y2="${beamY2}" stroke="currentColor" stroke-width="4"/>
        <circle cx="40" cy="${beamY1}" r="6" fill="#667eea"/>
        <circle cx="280" cy="${beamY2}" r="6" fill="#48bb78"/>
        <text x="40" y="${beamY1 - 14}" text-anchor="middle" font-weight="800" fill="#667eea">x</text>
        <text x="280" y="${beamY2 - 14}" text-anchor="middle" font-weight="800" fill="#48bb78">${curR}</text>
      </svg>`;
    }

    refresh();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('equation-balancer', { id:'equation-balancer', label:'Balance', icon:'⚖️', mount });
    }
  });
})(window);
