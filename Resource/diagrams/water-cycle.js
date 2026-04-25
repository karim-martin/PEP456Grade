/**
 * Water Cycle diagram — sun, ocean, evaporation, clouds, rain, river.
 */
(function (global) {
  if (!global.PEPDiagrams) return;

  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 240');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';

    svg.innerHTML = `
      <rect x="0" y="0" width="400" height="240" fill="#cdeefd"/>
      <!-- Sun -->
      <g data-part="sun"><circle cx="60" cy="50" r="25" fill="#f9c100"/></g>
      <!-- Cloud -->
      <g data-part="cloud">
        <ellipse cx="220" cy="60" rx="50" ry="20" fill="#fff"/>
        <ellipse cx="240" cy="50" rx="32" ry="14" fill="#fff"/>
        <ellipse cx="190" cy="50" rx="28" ry="12" fill="#fff"/>
      </g>
      <!-- Mountain -->
      <polygon points="280,200 340,80 380,200" fill="#8b9c75"/>
      <polygon points="320,200 340,140 360,200" fill="#fff"/>
      <!-- Ocean -->
      <rect x="0" y="180" width="400" height="60" fill="#3aa1d5"/>
      <!-- River -->
      <path d="M340 120 Q310 160 240 200 L240 240 L260 240 Q330 200 360 130 Z" fill="#3aa1d5"/>
      <!-- Evaporation arrows (data-part='evaporation') -->
      <g data-part="evaporation" stroke="#1a4d8c" stroke-width="2" fill="none">
        <path d="M120 200 Q120 130 180 80" marker-end="url(#arr)"/>
        <path d="M150 200 Q150 130 200 80" marker-end="url(#arr)"/>
      </g>
      <!-- Precipitation arrows -->
      <g data-part="precipitation" stroke="#1a4d8c" stroke-width="2" fill="none">
        <path d="M210 80 L210 130" marker-end="url(#arr)"/>
        <path d="M230 80 L230 130" marker-end="url(#arr)"/>
        <path d="M250 80 L250 130" marker-end="url(#arr)"/>
      </g>
      <!-- Collection arrows -->
      <g data-part="collection" stroke="#1a4d8c" stroke-width="2" fill="none">
        <path d="M340 130 Q330 170 280 200" marker-end="url(#arr)"/>
      </g>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#1a4d8c"/>
        </marker>
      </defs>
      <!-- Labels -->
      <text x="60" y="100" text-anchor="middle" font-weight="700" font-size="11" class="pep-diagram__label" fill="#7a5b00">Sun ☀️</text>
      <text x="220" y="40" text-anchor="middle" font-weight="700" font-size="11" class="pep-diagram__label" fill="#1a4d8c">Cloud</text>
      <text x="200" y="225" text-anchor="middle" font-weight="700" font-size="11" class="pep-diagram__label" fill="#fff">Ocean</text>
      <text x="335" y="100" text-anchor="middle" font-weight="700" font-size="11" class="pep-diagram__label" fill="#3a4d2c">Mountain</text>
      <text x="120" y="150" text-anchor="middle" font-weight="700" font-size="10" class="pep-diagram__label" fill="#1a4d8c">Evaporation</text>
      <text x="230" y="125" text-anchor="middle" font-weight="700" font-size="10" class="pep-diagram__label" fill="#1a4d8c">Rain</text>
      <text x="320" y="155" text-anchor="middle" font-weight="700" font-size="10" class="pep-diagram__label" fill="#1a4d8c">River</text>
    `;

    if (props.highlight) {
      const node = svg.querySelector(`[data-part="${props.highlight}"]`);
      if (node) node.classList.add('is-highlighted');
    }

    return global.PEPDiagrams._wrap(svg, { label: props.label || 'The Water Cycle' });
  }

  global.PEPDiagrams.register('water-cycle', factory);
})(window);
