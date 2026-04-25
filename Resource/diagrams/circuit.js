/**
 * Simple Circuit — battery, switch, bulb, wires.
 *
 * Props: { closed: true|false }
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const closed = props.closed !== false;
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 360 220');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '420px';
    svg.innerHTML = `
      <!-- Wire box -->
      <rect x="40" y="50" width="280" height="120" fill="none" stroke="#1a4d8c" stroke-width="3"/>
      <!-- Battery -->
      <g data-part="battery" data-region="battery">
        <rect x="20" y="100" width="40" height="20" fill="#fff" stroke="#1a4d8c" stroke-width="2"/>
        <line x1="20" y1="105" x2="20" y2="115" stroke="#1a4d8c" stroke-width="3"/>
        <line x1="60" y1="95"  x2="60" y2="125" stroke="#1a4d8c" stroke-width="4"/>
        <text x="40" y="142" text-anchor="middle" font-size="11" font-weight="700" class="pep-diagram__label">Battery</text>
      </g>
      <!-- Bulb -->
      <g data-part="bulb" data-region="bulb">
        <circle cx="180" cy="50" r="20" fill="${closed ? '#fff7c2' : '#e2e8f0'}" stroke="#7a5b00" stroke-width="2"/>
        <line x1="180" y1="70" x2="180" y2="80" stroke="#7a5b00" stroke-width="3"/>
        <text x="180" y="22" text-anchor="middle" font-size="11" font-weight="700" class="pep-diagram__label">Bulb ${closed ? '💡' : ''}</text>
      </g>
      <!-- Switch -->
      <g data-part="switch" data-region="switch">
        <line x1="280" y1="50" x2="${closed ? 320 : 310}" y2="${closed ? 50 : 30}" stroke="#1a4d8c" stroke-width="4"/>
        <circle cx="280" cy="50" r="4" fill="#1a4d8c"/>
        <circle cx="320" cy="50" r="4" fill="#1a4d8c"/>
        <text x="300" y="22" text-anchor="middle" font-size="11" font-weight="700" class="pep-diagram__label">Switch (${closed ? 'closed' : 'open'})</text>
      </g>
    `;
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'Simple Circuit' });
  }
  global.PEPDiagrams.register('circuit', factory);
})(window);
