/**
 * Plant Cell diagram — labeled organelles.
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 360 260');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';
    svg.innerHTML = `
      <!-- Cell wall -->
      <rect x="20" y="20" width="320" height="220" rx="22" fill="#a8d5a1" stroke="#1f7a3f" stroke-width="3" data-part="cell-wall"/>
      <!-- Cell membrane -->
      <rect x="32" y="32" width="296" height="196" rx="18" fill="#d4f1c5" stroke="#48bb78" stroke-width="2" stroke-dasharray="3 3" data-part="membrane"/>
      <!-- Vacuole -->
      <ellipse cx="180" cy="130" rx="80" ry="45" fill="#bfe9ff" stroke="#3aa1d5" stroke-width="2" data-part="vacuole"/>
      <!-- Nucleus -->
      <circle cx="100" cy="90" r="22" fill="#f6ad55" stroke="#7a4400" stroke-width="2" data-part="nucleus"/>
      <circle cx="100" cy="90" r="10" fill="#7a4400"/>
      <!-- Chloroplasts -->
      <g data-part="chloroplast">
        <ellipse cx="270" cy="80" rx="14" ry="8" fill="#2bb673" stroke="#1f7a3f"/>
        <ellipse cx="290" cy="115" rx="14" ry="8" fill="#2bb673" stroke="#1f7a3f"/>
        <ellipse cx="245" cy="200" rx="14" ry="8" fill="#2bb673" stroke="#1f7a3f"/>
      </g>
      <!-- Mitochondrion -->
      <g data-part="mitochondrion">
        <ellipse cx="80" cy="200" rx="22" ry="10" fill="#ed64a6" stroke="#7a3a55"/>
        <ellipse cx="80" cy="200" rx="14" ry="6" fill="none" stroke="#7a3a55" stroke-dasharray="2 2"/>
      </g>
      <!-- Labels -->
      <text x="35"  y="16" font-size="11" font-weight="700" fill="#1f7a3f" class="pep-diagram__label">Cell wall</text>
      <text x="100" y="125" text-anchor="middle" font-size="10" font-weight="700" class="pep-diagram__label">Nucleus</text>
      <text x="180" y="135" text-anchor="middle" font-size="10" font-weight="700" class="pep-diagram__label">Vacuole</text>
      <text x="270" y="65" text-anchor="middle" font-size="10" font-weight="700" fill="#1f7a3f" class="pep-diagram__label">Chloroplast</text>
      <text x="80"  y="220" text-anchor="middle" font-size="10" font-weight="700" fill="#7a3a55" class="pep-diagram__label">Mitochondrion</text>
    `;
    if (props.highlight) {
      const n = svg.querySelector(`[data-part="${props.highlight}"]`);
      if (n) n.classList.add('is-highlighted');
    }
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'Plant Cell' });
  }
  global.PEPDiagrams.register('plant-cell', factory);
})(window);
