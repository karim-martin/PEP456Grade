/**
 * Number Line — configurable range with marks.
 *
 * Props: { from, to, marks:[{value,label,highlight?}] }
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const from = props.from ?? 0;
    const to = props.to ?? 10;
    const span = to - from || 1;
    const marks = props.marks || [];
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 360 100');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';
    let inner = `<line x1="20" y1="55" x2="340" y2="55" stroke="#2d3748" stroke-width="3"/>`;
    inner += `<polygon points="340,55 332,50 332,60" fill="#2d3748"/>`;
    inner += `<polygon points="20,55 28,50 28,60" fill="#2d3748"/>`;
    marks.forEach(m => {
      const x = 20 + ((m.value - from) / span) * 320;
      const cls = m.highlight ? ' is-highlighted' : '';
      inner += `<g data-region="${m.label}" class="${cls}">
        <line x1="${x}" y1="48" x2="${x}" y2="62" stroke="#1a4d8c" stroke-width="3"/>
        <circle cx="${x}" cy="55" r="${m.highlight ? 7 : 4}" fill="${m.highlight ? '#f6ad55' : '#1a4d8c'}"/>
        <text x="${x}" y="80" text-anchor="middle" font-size="11" font-weight="700" fill="#2d3748" class="pep-diagram__label">${m.label || m.value}</text>
      </g>`;
    });
    svg.innerHTML = inner;
    return global.PEPDiagrams._wrap(svg, { label: props.label || null });
  }
  global.PEPDiagrams.register('number-line', factory);
})(window);
