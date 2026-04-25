/**
 * Fraction Builder — tap pizza slices to match a target fraction.
 *
 * Data:
 *   { target: "3/4", maxDen: 8 }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function gcd(a,b){a=Math.abs(a|0);b=Math.abs(b|0);while(b){[a,b]=[b,a%b];}return a||1;}

  function pieSVG(slices, shaded) {
    const cx = 100, cy = 100, r = 88;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('xmlns', ns);

    if (slices === 1) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
      c.setAttribute('class', 'slice');
      c.setAttribute('data-i', 0);
      c.setAttribute('fill', shaded.has(0) ? '#48bb78' : '#fff7c2');
      c.setAttribute('stroke', '#1f7a3f');
      c.setAttribute('stroke-width', '2');
      svg.appendChild(c);
      return svg;
    }

    for (let i = 0; i < slices; i++) {
      const a0 = (i / slices) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / slices) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`);
      path.setAttribute('class', 'slice');
      path.setAttribute('data-i', i);
      path.setAttribute('fill', shaded.has(i) ? '#48bb78' : '#fff7c2');
      path.setAttribute('stroke', '#1f7a3f');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
    }
    return svg;
  }

  function mount(host, data, ctx) {
    const target = String(data?.target || '3/4');
    const [tn, td] = target.split('/').map(Number);
    const maxDen = Math.max(td, data?.maxDen || td);

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🍕 Fraction Builder</div>
      <div class="pep-game__hud">
        <span>Make the fraction <strong>${tn}/${td}</strong></span>
      </div>
      <div class="pep-fraction-builder">
        <div class="pep-fraction-builder__pie" data-pie></div>
        <div class="pep-fraction-builder__display" data-display>0/${maxDen}</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
          <button class="pep-chip" data-act="dec">− slice</button>
          <button class="pep-chip" data-act="inc">+ slice</button>
          <button class="pep-chip" data-act="den-dec">fewer parts</button>
          <button class="pep-chip" data-act="den-inc">more parts</button>
        </div>
        <div class="pep-game__msg" data-msg></div>
      </div>
    `;

    let den = maxDen;
    let shaded = new Set();
    const pieHost = host.querySelector('[data-pie]');
    const display = host.querySelector('[data-display]');
    const msg = host.querySelector('[data-msg]');

    function targetEqual(num, denom) {
      // n/d == tn/td when n*td === tn*d
      return num * td === tn * denom;
    }

    function rebuild() {
      pieHost.innerHTML = '';
      // Drop any shaded slices that are now beyond the new denominator
      const next = new Set(); shaded.forEach(i => { if (i < den) next.add(i); });
      shaded = next;
      const svg = pieSVG(den, shaded);
      pieHost.appendChild(svg);
      svg.querySelectorAll('.slice').forEach(s => s.addEventListener('click', () => {
        const i = +s.dataset.i;
        if (shaded.has(i)) shaded.delete(i); else shaded.add(i);
        try { ctx?.sound?.('click'); } catch(_){}
        rebuild();
      }));
      display.textContent = `${shaded.size}/${den}`;
      if (targetEqual(shaded.size, den)) {
        msg.className = 'pep-game__msg is-correct';
        msg.textContent = `🎉 ${shaded.size}/${den} = ${tn}/${td}!`;
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
      } else {
        msg.className = 'pep-game__msg';
        msg.textContent = '';
      }
    }

    host.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      try { ctx?.sound?.('click'); } catch(_){}
      if (b.dataset.act === 'inc' && shaded.size < den) shaded.add([...Array(den).keys()].find(i => !shaded.has(i)));
      if (b.dataset.act === 'dec' && shaded.size > 0)   shaded.delete([...shaded].pop());
      if (b.dataset.act === 'den-inc' && den < 12) { den++; }
      if (b.dataset.act === 'den-dec' && den > 1)  { den--; if (shaded.size > den) { shaded = new Set([...shaded].slice(0, den)); } }
      rebuild();
    });

    rebuild();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('fraction-builder', { id:'fraction-builder', label:'Fractions', icon:'🍕', mount });
    }
  });
})(window);
