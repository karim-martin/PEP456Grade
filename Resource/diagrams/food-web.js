/**
 * Food Web — producers → primary → secondary → tertiary consumers.
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 260');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';
    svg.innerHTML = `
      <defs>
        <marker id="fw-arr" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="#7a4400"/>
        </marker>
      </defs>
      <!-- Sun -->
      <circle cx="60" cy="50" r="22" fill="#f9c100" data-part="sun"/>
      <text x="60" y="56" text-anchor="middle" font-weight="700" font-size="14">☀️</text>
      <!-- Grass (producer) -->
      <g data-part="grass" data-region="grass" data-tier="producer">
        <rect x="20" y="200" width="80" height="40" rx="8" fill="#9ed8a3" stroke="#1f7a3f"/>
        <text x="60" y="225" text-anchor="middle" font-weight="700" font-size="11">🌱 Grass</text>
      </g>
      <!-- Insect (primary) -->
      <g data-part="insect" data-region="insect" data-tier="primary">
        <rect x="160" y="200" width="80" height="40" rx="8" fill="#fff7c2" stroke="#7a5b00"/>
        <text x="200" y="225" text-anchor="middle" font-weight="700" font-size="11">🦗 Insect</text>
      </g>
      <!-- Frog (secondary) -->
      <g data-part="frog" data-region="frog" data-tier="secondary">
        <rect x="160" y="120" width="80" height="40" rx="8" fill="#bfe9ff" stroke="#1a4d8c"/>
        <text x="200" y="145" text-anchor="middle" font-weight="700" font-size="11">🐸 Frog</text>
      </g>
      <!-- Snake (secondary) -->
      <g data-part="snake" data-region="snake" data-tier="secondary">
        <rect x="290" y="120" width="80" height="40" rx="8" fill="#e8c2f0" stroke="#5a3a8a"/>
        <text x="330" y="145" text-anchor="middle" font-weight="700" font-size="11">🐍 Snake</text>
      </g>
      <!-- Hawk (tertiary) -->
      <g data-part="hawk" data-region="hawk" data-tier="tertiary">
        <rect x="220" y="40" width="80" height="40" rx="8" fill="#f6ad55" stroke="#7a4400"/>
        <text x="260" y="65" text-anchor="middle" font-weight="700" font-size="11">🦅 Hawk</text>
      </g>
      <!-- Energy flow arrows (drawn as eaten-by => arrow goes from prey to predator) -->
      <g stroke="#7a4400" stroke-width="2" fill="none">
        <line x1="60"  y1="200" x2="60"  y2="80"  marker-end="url(#fw-arr)"/>
        <line x1="100" y1="220" x2="160" y2="220" marker-end="url(#fw-arr)"/>
        <line x1="200" y1="200" x2="200" y2="160" marker-end="url(#fw-arr)"/>
        <line x1="240" y1="220" x2="290" y2="155" marker-end="url(#fw-arr)"/>
        <line x1="240" y1="140" x2="280" y2="80"  marker-end="url(#fw-arr)"/>
        <line x1="330" y1="120" x2="290" y2="80"  marker-end="url(#fw-arr)"/>
      </g>
    `;
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'A simple food web' });
  }
  global.PEPDiagrams.register('food-web', factory);
})(window);
