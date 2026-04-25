/**
 * Place Value Chart — labelled column visual for a number.
 *
 * Props: { digits: "374562", highlight: "tt"|"th"|"h"|"t"|"o" }
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  const NAMES = ['Hundred Millions','Ten Millions','Millions','Hundred Thousands','Ten Thousands','Thousands','Hundreds','Tens','Ones'];
  const SHORT = ['hm','tm','m','hth','tth','th','h','t','o'];
  function factory(props) {
    const digits = String(props.digits || '374562');
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    const cols = digits.length;
    const cw = 56;
    svg.setAttribute('viewBox', `0 0 ${cols*cw + 10} 130`);
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = `${cols*cw + 10}px`;
    let inner = '';
    const offset = NAMES.length - cols;
    for (let i = 0; i < cols; i++) {
      const x = 5 + i*cw;
      const label = NAMES[offset + i] || '';
      const short = SHORT[offset + i] || '';
      const isHi = props.highlight === short;
      inner += `<g data-part="${short}" data-region="${label}"${isHi ? ' class="is-highlighted"' : ''}>
        <rect x="${x}" y="20" width="${cw - 4}" height="60" fill="${isHi ? '#fde68a' : '#fff'}" stroke="#1a4d8c" stroke-width="2"/>
        <text x="${x + (cw-4)/2}" y="60" text-anchor="middle" font-size="28" font-weight="800" fill="#2d3748">${digits[i] || ''}</text>
        <text x="${x + (cw-4)/2}" y="100" text-anchor="middle" font-size="9" font-weight="700" fill="#718096" class="pep-diagram__label">${label}</text>
      </g>`;
    }
    svg.innerHTML = inner;
    return global.PEPDiagrams._wrap(svg, { label: props.label || null });
  }
  global.PEPDiagrams.register('place-value-chart', factory);
})(window);
