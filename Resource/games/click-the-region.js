/**
 * Click-the-Region — pick the labeled region inside a diagram SVG.
 *
 * Data:
 *   { diagram: "jamaica-parishes", target: "Saint Catherine" }
 * The diagram must expose [data-region="..."] elements.
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function mount(host, data, ctx) {
    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🎯 Find the spot</div>
      <div class="pep-region__hud">
        <div class="pep-region__prompt" data-prompt>Look for: ${escapeHTML(data?.target || '')}</div>
      </div>
      <div class="pep-region__diagram" data-host></div>
      <div class="pep-game__msg" data-msg></div>
    `;

    const diagHost = host.querySelector('[data-host]');
    const msg = host.querySelector('[data-msg]');
    if (!global.PEPDiagrams || !global.PEPDiagrams.has(data?.diagram)) {
      diagHost.innerHTML = `<p>Diagram <code>${escapeHTML(data?.diagram || '')}</code> not loaded.</p>`;
      return ctx?.complete?.();
    }
    const el = global.PEPDiagrams.render(data.diagram, diagHost, data.props || {});
    if (!el) return ctx?.complete?.();

    const target = String(data?.target || '').trim();
    let correct = false;
    el.querySelectorAll('[data-region]').forEach(node => {
      node.addEventListener('click', () => {
        if (correct) return;
        const got = node.dataset.region;
        if (got === target || got.toLowerCase() === target.toLowerCase()) {
          node.classList.add('is-correct');
          correct = true;
          msg.className = 'pep-game__msg is-correct';
          msg.textContent = `🎉 Yes! That's ${target}.`;
          try { ctx?.sound?.('correct'); ctx?.awardXP?.(12); ctx?.complete?.(); global.PEP?.confetti?.(); } catch(_){}
        } else {
          node.classList.add('is-wrong');
          msg.className = 'pep-game__msg is-wrong';
          msg.textContent = `Not that one — keep looking!`;
          try { ctx?.sound?.('wrong'); } catch(_){}
          setTimeout(() => node.classList.remove('is-wrong'), 600);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('click-the-region', { id:'click-the-region', label:'Find Region', icon:'🎯', mount });
    }
  });
})(window);
