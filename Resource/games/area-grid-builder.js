/**
 * Area Grid Builder — fill cells to match target area or perimeter.
 *
 * Data:
 *   { target: "area",      goal: 12 }     -- click cells to make a rectangle of that area
 *   { target: "perimeter", goal: 14 }     -- pick width × height where 2(w+h) = goal
 *   { target: "product",   w:6, h:7 }     -- visualize multiplication
 */
(function (global) {
  function mount(host, data, ctx) {
    data = data || {};
    const target = data.target || 'product';
    host.classList.add('pep-game');

    if (target === 'product') return mountProduct(host, data, ctx);
    return mountAreaPerimeter(host, data, ctx);
  }

  function mountProduct(host, data, ctx) {
    const w = data.w || 6, h = data.h || 7;
    host.innerHTML = `
      <div class="pep-game__title">📐 Multiplication as Area</div>
      <div class="pep-game__hud">
        <span>Visualize <strong>${w} × ${h}</strong></span>
        <button class="pep-chip" data-act="reveal">Show me</button>
      </div>
      <div class="pep-area__grid" data-grid style="grid-template-columns: repeat(${w}, 26px); grid-template-rows: repeat(${h}, 26px);"></div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const grid = host.querySelector('[data-grid]');
    const msg = host.querySelector('[data-msg]');
    const cells = [];
    for (let i = 0; i < w*h; i++) {
      const c = document.createElement('div');
      c.className = 'pep-area__cell';
      grid.appendChild(c);
      cells.push(c);
    }
    let count = 0;
    function fillNext() {
      if (count >= cells.length) {
        msg.className = 'pep-game__msg is-correct';
        msg.innerHTML = `🎉 ${w} × ${h} = <strong>${w*h}</strong>`;
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(10); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        return;
      }
      cells[count].classList.add('is-on');
      msg.className = 'pep-game__msg';
      msg.textContent = `${count+1}`;
      count++;
      setTimeout(fillNext, 60);
    }
    host.querySelector('[data-act="reveal"]').addEventListener('click', fillNext);
  }

  function mountAreaPerimeter(host, data, ctx) {
    const target = data.target;
    const goal = data.goal || (target === 'area' ? 12 : 14);
    const maxSide = 8;
    let curW = 0, curH = 0;

    host.innerHTML = `
      <div class="pep-game__title">📐 ${target === 'area' ? 'Build an area of' : 'Find perimeter of'} ${goal}</div>
      <div class="pep-game__hud">
        <span>Width: <span data-w>0</span> · Height: <span data-h>0</span></span>
        <span>${target === 'area' ? 'Area' : 'Perimeter'}: <span data-val>0</span></span>
      </div>
      <div class="pep-area__grid" data-grid style="grid-template-columns: repeat(${maxSide}, 26px); grid-template-rows: repeat(${maxSide}, 26px);"></div>
      <div style="text-align:center;margin-top:10px">
        <button class="pep-chip" data-act="reset">Reset</button>
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const grid = host.querySelector('[data-grid]');
    const msg = host.querySelector('[data-msg]');
    const wEl = host.querySelector('[data-w]');
    const hEl = host.querySelector('[data-h]');
    const valEl = host.querySelector('[data-val]');
    const cells = [];
    for (let r = 0; r < maxSide; r++) {
      for (let c = 0; c < maxSide; c++) {
        const cell = document.createElement('div');
        cell.className = 'pep-area__cell';
        cell.dataset.r = r; cell.dataset.c = c;
        cell.addEventListener('click', () => setSize(c+1, r+1));
        grid.appendChild(cell);
        cells.push(cell);
      }
    }

    function setSize(w, h) {
      curW = w; curH = h;
      cells.forEach(cell => {
        const inside = (+cell.dataset.r < h) && (+cell.dataset.c < w);
        cell.classList.toggle('is-on', inside);
      });
      wEl.textContent = w; hEl.textContent = h;
      const val = target === 'area' ? w*h : 2*(w+h);
      valEl.textContent = val;
      if (val === goal) {
        msg.className = 'pep-game__msg is-correct';
        msg.textContent = '🎉 Got it!';
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(12); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
      } else {
        msg.className = 'pep-game__msg';
        msg.textContent = '';
      }
    }
    host.querySelector('[data-act="reset"]').addEventListener('click', () => setSize(0, 0));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('area-grid-builder', { id:'area-grid-builder', label:'Area Builder', icon:'📐', mount });
    }
  });
})(window);
