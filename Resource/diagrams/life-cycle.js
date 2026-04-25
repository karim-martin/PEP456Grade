/**
 * Life Cycle — generic 4-stage circular cycle (egg → larva → pupa → adult by default).
 *
 * Props: { stages: [{ icon, label }], highlight: stageIndex }
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const stages = props.stages || [
      { icon:'🥚', label:'Egg' },
      { icon:'🐛', label:'Larva' },
      { icon:'🛡️', label:'Pupa' },
      { icon:'🦋', label:'Adult' }
    ];
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 320 280');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '380px';

    const cx = 160, cy = 140, R = 100;
    let html = '';
    stages.forEach((s, i) => {
      const angle = (i / stages.length) * 2 * Math.PI - Math.PI / 2;
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      const cls = (i === props.highlight) ? ' class="is-highlighted"' : '';
      html += `<g data-part="stage-${i}" data-region="${s.label}"${cls}>
        <circle cx="${x}" cy="${y}" r="34" fill="#fff" stroke="#667eea" stroke-width="2.5"/>
        <text x="${x}" y="${y - 2}" text-anchor="middle" font-size="22">${s.icon}</text>
        <text x="${x}" y="${y + 22}" text-anchor="middle" font-size="11" font-weight="700" class="pep-diagram__label">${s.label}</text>
      </g>`;
    });
    // Curved arrows between consecutive stages
    for (let i = 0; i < stages.length; i++) {
      const j = (i + 1) % stages.length;
      const a = (i / stages.length) * 2 * Math.PI - Math.PI / 2;
      const b = (j / stages.length) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + (R - 30) * Math.cos(a);
      const y1 = cy + (R - 30) * Math.sin(a);
      const x2 = cx + (R - 30) * Math.cos(b);
      const y2 = cy + (R - 30) * Math.sin(b);
      html += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx} ${cy} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#764ba2" stroke-width="2" fill="none" marker-end="url(#lc-arr)"/>`;
    }
    svg.innerHTML = `<defs>
      <marker id="lc-arr" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 z" fill="#764ba2"/>
      </marker>
    </defs>` + html;

    return global.PEPDiagrams._wrap(svg, { label: props.label || 'Life Cycle' });
  }
  global.PEPDiagrams.register('life-cycle', factory);
})(window);
