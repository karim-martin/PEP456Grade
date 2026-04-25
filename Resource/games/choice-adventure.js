/**
 * Choice Adventure — branching narrative scenes.
 *
 * Data:
 *   { scenes: { start: { text, choices: [{ label, goto, xp, feedback? }] }, ... } }
 *   Special goto: "end:good" or "end:learn" terminates the adventure.
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function mount(host, data, ctx) {
    const scenes = data?.scenes || {
      start: { text: 'Adventure coming soon!', choices: [{ label:'OK', goto:'end:good', xp:5 }] }
    };
    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">📖 Choose Your Path</div>
      <div class="pep-adv__scene" data-scene></div>
      <div class="pep-adv__choices" data-choices></div>
      <div class="pep-game__msg" data-msg></div>
    `;
    const sceneEl = host.querySelector('[data-scene]');
    const choicesEl = host.querySelector('[data-choices]');
    const msg = host.querySelector('[data-msg]');

    function showScene(key) {
      if (key.startsWith('end:')) return finish(key);
      const scene = scenes[key] || scenes.start;
      sceneEl.textContent = scene.text;
      try { ctx?.speak?.(scene.text); } catch(_){}
      choicesEl.innerHTML = '';
      (scene.choices || []).forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'pep-lesson__btn pep-lesson__btn--opt';
        btn.textContent = ch.label;
        btn.addEventListener('click', () => {
          if (ch.feedback) {
            msg.className = 'pep-game__msg' + (ch.good ? ' is-correct' : '');
            msg.textContent = ch.feedback;
          } else { msg.textContent = ''; msg.className = 'pep-game__msg'; }
          if (ch.xp) { try { ctx?.awardXP?.(ch.xp); } catch(_){} }
          try { ctx?.sound?.('click'); } catch(_){}
          setTimeout(() => showScene(ch.goto || 'end:good'), 700);
        });
        choicesEl.appendChild(btn);
      });
    }

    function finish(key) {
      const good = key === 'end:good';
      sceneEl.textContent = good ? '🎉 Great choice! What an adventure.' : '💡 Good thinking — you learned something important.';
      choicesEl.innerHTML = `<button class="pep-lesson__btn pep-lesson__btn--primary">Continue ▶</button>`;
      try { ctx?.sound?.('correct'); ctx?.awardXP?.(good ? 15 : 8); global.PEP?.confetti?.(); } catch(_){}
      choicesEl.querySelector('button').addEventListener('click', () => { try { ctx?.complete?.(); } catch(_){} });
    }

    showScene('start');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('choice-adventure', { id:'choice-adventure', label:'Adventure', icon:'📖', mount });
    }
  });
})(window);
