/**
 * Computer System diagram — CPU, RAM, Storage, Input, Output.
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  const PARTS = [
    { id:'CPU',     x:160, y:80,  w:80, h:50, fill:'#f6ad55', emoji:'🧠' },
    { id:'RAM',     x:60,  y:80,  w:80, h:50, fill:'#bfe9ff', emoji:'🧮' },
    { id:'Storage', x:260, y:80,  w:80, h:50, fill:'#e8c2f0', emoji:'💾' },
    { id:'Input',   x:60,  y:170, w:120, h:40, fill:'#9ed8a3', emoji:'⌨️' },
    { id:'Output',  x:200, y:170, w:140, h:40, fill:'#fff7c2', emoji:'🖥️' }
  ];
  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 240');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';
    let inner = '';
    PARTS.forEach(p => {
      inner += `<g data-part="${p.id}" data-region="${p.id}">
        <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="${p.fill}" stroke="#2d3748" stroke-width="2"/>
        <text x="${p.x + p.w/2}" y="${p.y + p.h/2 + 4}" text-anchor="middle" font-weight="800" font-size="13" class="pep-diagram__label">${p.emoji} ${p.id}</text>
      </g>`;
    });
    // Arrows
    inner += `<g stroke="#2d3748" stroke-width="2" fill="none">
      <line x1="140" y1="105" x2="160" y2="105" marker-end="url(#cs-arr)"/>
      <line x1="240" y1="105" x2="260" y2="105" marker-end="url(#cs-arr)"/>
      <line x1="120" y1="170" x2="180" y2="130" marker-end="url(#cs-arr)"/>
      <line x1="220" y1="130" x2="270" y2="170" marker-end="url(#cs-arr)"/>
    </g>
    <defs><marker id="cs-arr" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2d3748"/>
    </marker></defs>`;
    svg.innerHTML = inner;
    if (props.highlight) {
      const n = svg.querySelector(`[data-part="${props.highlight}"]`);
      if (n) n.classList.add('is-highlighted');
    }
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'Computer System' });
  }
  global.PEPDiagrams.register('computer-system', factory);
})(window);
