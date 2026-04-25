/**
 * Game module template.
 *
 * Copy this file, rename it, change MODULE_NAME, and implement mount().
 * Self-registers with PEP.registerGame() at DOMContentLoaded.
 *
 * Required interface:
 *   { id, label, icon, mount(host, data, ctx), unmount?(host) }
 *
 * ctx provides:
 *   chapterId, awardXP(n, opts?), complete(), fail(), speak(text), sound(kind)
 */
(function (global) {
  const MODULE_NAME = 'template';

  function mount(host, data, ctx) {
    host.classList.add('pep-game');
    host.innerHTML = `
      <div class="pep-game__title">🎯 Sample Game</div>
      <div class="pep-game__board">
        <p>This is a placeholder game.</p>
        <button class="pep-lesson__btn pep-lesson__btn--primary">I get it!</button>
      </div>
    `;
    host.querySelector('button').addEventListener('click', () => {
      try { ctx.sound('correct'); } catch(_){}
      try { ctx.complete(); } catch(_){}
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame(MODULE_NAME, {
        id: MODULE_NAME, label: 'Sample', icon: '🎯', mount
      });
    }
  });
})(window);
