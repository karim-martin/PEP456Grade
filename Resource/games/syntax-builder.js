/**
 * Syntax Builder — drag/click words into a sentence template.
 *
 * Data (sentence mode):
 *   { template: "[NOUN] [VERB] [NOUN]", words: { NOUN:[...], VERB:[...] } }
 *
 * Data (HTML mode):
 *   { html: "<h1>{T}</h1><p>{P}</p>", slots: { T:["Hello"], P:["World"] } }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function shuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

  function mount(host, data, ctx) {
    host.classList.add('pep-game');
    if (data?.html) {
      mountHtmlMode(host, data, ctx);
    } else {
      mountSentenceMode(host, data, ctx);
    }
  }

  function mountSentenceMode(host, data, ctx) {
    const template = data?.template || '[NOUN] [VERB] [NOUN]';
    const words = data?.words || { NOUN:['cat','dog'], VERB:['runs','jumps'] };
    // Build slots from template
    const slots = []; // {tag, idx}
    let templateHtml = '';
    let i = 0;
    template.replace(/\[([A-Z]+)\]|([^\[\]]+)/g, (m, tag, txt) => {
      if (tag) { slots.push({ tag, i }); templateHtml += `<span class="pep-syntax__slot" data-slot="${i}" data-tag="${tag}">[${tag}]</span>`; i++; }
      else templateHtml += escapeHTML(txt);
      return m;
    });

    // Pool: shuffled options of all tags used
    const pool = [];
    Object.keys(words).forEach(tag => {
      words[tag].forEach(w => pool.push({ tag, word: w }));
    });

    host.innerHTML = `
      <div class="pep-game__title">🧩 Build the Sentence</div>
      <div class="pep-syntax__template">${templateHtml}</div>
      <div class="pep-syntax__pool" data-pool>
        ${shuffle(pool).map(p => `<button class="pep-chip" data-tag="${p.tag}">${escapeHTML(p.word)}</button>`).join('')}
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;

    const msg = host.querySelector('[data-msg]');
    let selected = null;
    host.querySelectorAll('[data-pool] .pep-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-locked')) return;
        host.querySelectorAll('[data-pool] .pep-chip.is-selected').forEach(x => x.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selected = btn;
      });
    });
    host.querySelectorAll('.pep-syntax__slot').forEach(slot => {
      slot.addEventListener('click', () => {
        if (!selected) return;
        if (selected.dataset.tag !== slot.dataset.tag) {
          slot.classList.add('is-wrong');
          msg.className = 'pep-game__msg is-wrong'; msg.textContent = `That word is a ${selected.dataset.tag.toLowerCase()}, not a ${slot.dataset.tag.toLowerCase()}.`;
          try { ctx?.sound?.('wrong'); } catch(_){}
          setTimeout(() => slot.classList.remove('is-wrong'), 500);
          return;
        }
        slot.textContent = selected.textContent;
        slot.classList.add('is-filled');
        selected.classList.add('is-locked');
        selected.classList.remove('is-selected');
        selected = null;
        try { ctx?.sound?.('correct'); } catch(_){}
        // win check
        if ([...host.querySelectorAll('.pep-syntax__slot')].every(s => s.classList.contains('is-filled'))) {
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = '🎉 Sentence complete!';
          try { ctx?.awardXP?.(12); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        }
      });
    });
  }

  function mountHtmlMode(host, data, ctx) {
    const tags = data?.tags || ['<h1>','</h1>','<p>','</p>','<ul>','</ul>','<li>','</li>'];
    const correct = data?.solution || tags.slice();
    let arrangement = [];

    host.innerHTML = `
      <div class="pep-game__title">💻 HTML Builder</div>
      <div class="pep-game__hud"><span>Drag tags into the right order to build a valid page.</span></div>
      <div data-target style="background:#1a202c;color:#a0e0a0;font-family:monospace;padding:14px;border-radius:8px;min-height:60px;line-height:1.6"></div>
      <div class="pep-syntax__pool" data-pool>
        ${shuffle(tags).map((t,i) => `<button class="pep-chip" data-tag="${escapeHTML(t)}">${escapeHTML(t)}</button>`).join('')}
      </div>
      <div style="text-align:center;margin-top:8px">
        <button class="pep-chip" data-act="check">Check</button>
        <button class="pep-chip" data-act="undo">Undo last</button>
      </div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const target = host.querySelector('[data-target]');
    const msg = host.querySelector('[data-msg]');

    function refresh() { target.textContent = arrangement.join(''); }

    host.querySelectorAll('[data-pool] .pep-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-locked')) return;
        arrangement.push(btn.dataset.tag);
        btn.classList.add('is-locked');
        try { ctx?.sound?.('click'); } catch(_){}
        refresh();
      });
    });
    host.querySelector('[data-act="check"]').addEventListener('click', () => {
      const ok = arrangement.length === correct.length && arrangement.every((t,i) => t === correct[i]);
      if (ok) {
        msg.className = 'pep-game__msg is-correct';
        msg.textContent = '🎉 Valid HTML!';
        try { ctx?.sound?.('correct'); ctx?.awardXP?.(15); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
      } else {
        msg.className = 'pep-game__msg is-wrong';
        msg.textContent = 'Not quite — opening tags must match closing tags in order.';
        try { ctx?.sound?.('wrong'); } catch(_){}
      }
    });
    host.querySelector('[data-act="undo"]').addEventListener('click', () => {
      const last = arrangement.pop();
      if (last) {
        const btn = [...host.querySelectorAll('[data-pool] .pep-chip.is-locked')].reverse().find(b => b.dataset.tag === last);
        if (btn) btn.classList.remove('is-locked');
      }
      refresh();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('syntax-builder', { id:'syntax-builder', label:'Syntax Builder', icon:'🧩', mount });
    }
  });
})(window);
