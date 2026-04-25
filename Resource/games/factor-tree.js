/**
 * Factor Tree — split a number into prime factors by clicking.
 *
 * Data:  { number: 36 }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function isPrime(n) { if (n < 2) return false; for (let i = 2; i*i <= n; i++) if (n%i===0) return false; return true; }
  function smallestFactor(n) { for (let i = 2; i <= n; i++) if (n % i === 0) return i; return n; }

  function mount(host, data, ctx) {
    const N = data?.number || 36;
    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🌳 Factor Tree</div>
      <div class="pep-game__hud"><span>Break <strong>${N}</strong> into prime factors. Tap a number to split it.</span></div>
      <div class="pep-factor-tree" data-tree></div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const treeEl = host.querySelector('[data-tree]');
    const msg = host.querySelector('[data-msg]');

    // Tree as a list of rows; each row = array of {value, parentIdx, primeFlag}
    let rows = [[ { value: N, prime: isPrime(N) } ]];

    function render() {
      treeEl.innerHTML = '';
      rows.forEach((row, ri) => {
        const r = document.createElement('div');
        r.className = 'pep-factor-tree__row';
        row.forEach((node, ni) => {
          const btn = document.createElement('button');
          btn.className = 'pep-factor-tree__node' + (node.prime ? ' is-prime' : '');
          btn.textContent = node.value;
          if (!node.prime) {
            btn.addEventListener('click', () => splitNode(ri, ni));
          }
          r.appendChild(btn);
        });
        treeEl.appendChild(r);
      });
    }

    function splitNode(ri, ni) {
      const node = rows[ri][ni];
      const f = smallestFactor(node.value);
      const other = node.value / f;
      // Append next row (build linearly: at each split, add a row containing all leaves so far)
      const newRow = [];
      // We replicate everything but replace this node with its children
      rows[ri].forEach((n, idx) => {
        if (idx === ni) {
          newRow.push({ value: f, prime: isPrime(f) });
          newRow.push({ value: other, prime: isPrime(other) });
        } else if (n.prime) {
          newRow.push({ value: n.value, prime: true });
        } else {
          // Not yet split — keep as-is so the user can split later
          newRow.push({ value: n.value, prime: false });
        }
      });
      rows.push(newRow);
      try { ctx?.sound?.('pop'); } catch(_){}
      render();
      checkDone();
    }

    function checkDone() {
      const last = rows[rows.length - 1];
      if (last.every(n => n.prime)) {
        const product = last.reduce((a, n) => a * n.value, 1);
        if (product === N) {
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = `🎉 ${N} = ${last.map(n=>n.value).sort((a,b)=>a-b).join(' × ')}`;
          try { ctx?.sound?.('correct'); ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        }
      }
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('factor-tree', { id:'factor-tree', label:'Factor Tree', icon:'🌳', mount });
    }
  });
})(window);
