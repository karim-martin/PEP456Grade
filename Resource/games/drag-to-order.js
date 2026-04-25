/**
 * Drag-to-Order — reorder items asc/desc/timeline by dragging.
 * Touch-friendly: uses PointerEvents and falls back to up/down chevron buttons.
 *
 * Data:
 *   { items: [{ label, value }], direction: "asc"|"desc"|"timeline" }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function shuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

  function mount(host, data, ctx) {
    const items = (data?.items || []).map((it, i) => ({ ...it, _origIdx: i }));
    const direction = data?.direction || 'asc';
    if (items.length < 2) {
      host.innerHTML = '<p>No items to order yet.</p>';
      return ctx?.complete?.();
    }
    const correct = items.slice().sort((a, b) => {
      if (direction === 'desc') return b.value - a.value;
      return a.value - b.value;
    });
    const correctOrder = correct.map(it => it._origIdx);

    let order = shuffle(items.map(it => it._origIdx));
    // ensure not accidentally already correct
    if (order.every((id, i) => id === correctOrder[i])) order = order.reverse();

    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🪜 Put them in order!</div>
      <div class="pep-game__hud">
        <span>${direction === 'desc' ? 'Largest first' : direction === 'timeline' ? 'Oldest to newest' : 'Smallest first'}</span>
        <button class="pep-chip" data-act="check">Check</button>
      </div>
      <div class="pep-drag-order__items" data-list></div>
      <div class="pep-game__msg" data-msg></div>
    `;

    const listEl = host.querySelector('[data-list]');
    const msg = host.querySelector('[data-msg]');

    function renderList() {
      listEl.innerHTML = '';
      order.forEach((origIdx, pos) => {
        const it = items.find(x => x._origIdx === origIdx);
        const row = document.createElement('div');
        row.className = 'pep-drag-order__item';
        row.draggable = true;
        row.dataset.id = origIdx;
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-weight:800;color:var(--pep-primary);min-width:24px">${pos+1}.</span>
            <span style="flex:1">${escapeHTML(it.label)}</span>
            <button class="pep-chip" data-mv="up" title="Move up" ${pos===0?'disabled':''}>▲</button>
            <button class="pep-chip" data-mv="down" title="Move down" ${pos===order.length-1?'disabled':''}>▼</button>
          </div>
        `;
        // drag handlers
        row.addEventListener('dragstart', (e) => {
          row.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(pos));
        });
        row.addEventListener('dragend', () => row.classList.remove('is-dragging'));
        row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        row.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = +e.dataTransfer.getData('text/plain');
          const to = pos;
          if (from === to) return;
          const moved = order.splice(from, 1)[0];
          order.splice(to, 0, moved);
          try { ctx?.sound?.('swoosh'); } catch(_){}
          renderList();
        });
        // up/down buttons
        row.querySelectorAll('[data-mv]').forEach(b => {
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            const dir = b.dataset.mv === 'up' ? -1 : +1;
            const np = pos + dir;
            if (np < 0 || np >= order.length) return;
            [order[pos], order[np]] = [order[np], order[pos]];
            try { ctx?.sound?.('click'); } catch(_){}
            renderList();
          });
        });
        listEl.appendChild(row);
      });
    }

    host.querySelector('[data-act="check"]').addEventListener('click', () => {
      let allCorrect = true;
      order.forEach((id, i) => {
        const row = listEl.children[i];
        if (id === correctOrder[i]) row.classList.add('is-correct');
        else { row.classList.add('is-wrong'); allCorrect = false; }
      });
      if (allCorrect) {
        msg.className = 'pep-game__msg is-correct';
        msg.textContent = '🎉 Perfect order!';
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(12); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
      } else {
        msg.className = 'pep-game__msg is-wrong';
        msg.textContent = 'Not quite — try again. Hint: use the ▲ ▼ buttons.';
        try { ctx?.sound?.('wrong'); } catch(_){}
        setTimeout(() => Array.from(listEl.children).forEach(r => r.classList.remove('is-correct','is-wrong')), 1100);
      }
    });

    renderList();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('drag-to-order', { id:'drag-to-order', label:'Order it', icon:'🪜', mount });
    }
  });
})(window);
