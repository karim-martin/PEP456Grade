/**
 * Timeline Builder — pop event chips onto a timeline track in chronological order.
 * Accepts data and converts internally to drag-to-order timeline mode.
 *
 * Data:  { events: [{ date, label }] }
 */
(function (global) {
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function shuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

  function mount(host, data, ctx) {
    const events = (data?.events || []).slice();
    if (events.length < 2) { host.innerHTML='<p>No events yet.</p>'; return ctx?.complete?.(); }
    events.forEach(e => { e.value = e.value || (typeof e.date === 'number' ? e.date : Date.parse(e.date) || 0); });

    // Delegate to drag-to-order timeline mode if available, else inline simple version.
    const items = events.map(e => ({ label: `${e.date} — ${e.label}`, value: e.value }));
    const game = global.PEP?.getGame?.('drag-to-order');
    if (game) {
      game.mount(host, { items, direction: 'asc' }, ctx);
      // Add an event-flavored title afterwards
      const t = host.querySelector('.pep-game__title');
      if (t) t.innerHTML = '🕰️ Timeline Builder';
    } else {
      host.classList.add('pep-game');
      host.innerHTML = `<div class="pep-game__title">🕰️ Timeline Builder</div>
        <p>Drag-to-order module missing.</p>`;
      ctx?.complete?.();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP?.registerGame) {
      global.PEP.registerGame('timeline-builder', { id:'timeline-builder', label:'Timeline', icon:'🕰️', mount });
    }
  });
})(window);
