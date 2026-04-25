/**
 * Body System — friendly stylized human body with major systems labeled.
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 220 320');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '280px';
    svg.innerHTML = `
      <!-- Body outline -->
      <ellipse cx="110" cy="50" rx="32" ry="36" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="head" data-region="Head"/>
      <rect x="78" y="86" width="64" height="120" rx="10" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="torso" data-region="Torso"/>
      <rect x="55" y="88" width="22" height="90" rx="8" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="armL" data-region="Arm"/>
      <rect x="143" y="88" width="22" height="90" rx="8" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="armR" data-region="Arm"/>
      <rect x="78" y="206" width="28" height="100" rx="8" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="legL" data-region="Leg"/>
      <rect x="114" y="206" width="28" height="100" rx="8" fill="#fde6c8" stroke="#7a5b00" stroke-width="2" data-part="legR" data-region="Leg"/>
      <!-- Heart -->
      <g data-part="heart" data-region="Heart">
        <path d="M105 130 C95 115 75 120 80 140 C85 160 110 170 110 170 C110 170 135 160 140 140 C145 120 125 115 115 130 Z" fill="#f56565" stroke="#742a2a" stroke-width="1.5"/>
      </g>
      <!-- Lungs -->
      <g data-part="lungs" data-region="Lungs">
        <ellipse cx="92" cy="140" rx="14" ry="22" fill="#fbb6ce" stroke="#742a2a" stroke-width="1.5"/>
        <ellipse cx="128" cy="140" rx="14" ry="22" fill="#fbb6ce" stroke="#742a2a" stroke-width="1.5"/>
      </g>
      <!-- Stomach -->
      <g data-part="stomach" data-region="Stomach">
        <path d="M95 175 C95 195 130 200 130 175 C130 165 95 165 95 175 Z" fill="#f6ad55" stroke="#7a4400" stroke-width="1.5"/>
      </g>
      <!-- Brain (head accent) -->
      <g data-part="brain" data-region="Brain">
        <ellipse cx="110" cy="42" rx="20" ry="14" fill="#e8c2f0" stroke="#5a3a8a" stroke-width="1.5"/>
      </g>
      <!-- Labels -->
      <text x="155" y="44" font-size="10" font-weight="700" class="pep-diagram__label">Brain</text>
      <text x="155" y="135" font-size="10" font-weight="700" class="pep-diagram__label">Heart & Lungs</text>
      <text x="155" y="180" font-size="10" font-weight="700" class="pep-diagram__label">Stomach</text>
      <text x="155" y="250" font-size="10" font-weight="700" class="pep-diagram__label">Muscles & Bones</text>
    `;
    if (props.highlight) {
      const n = svg.querySelector(`[data-part="${props.highlight}"]`);
      if (n) n.classList.add('is-highlighted');
    }
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'Body Systems' });
  }
  global.PEPDiagrams.register('body-system', factory);
})(window);
