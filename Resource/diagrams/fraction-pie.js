/**
 * Fraction Pie — circular fraction representation.
 *
 * Props: { den: 8, shaded: 3 }   shaded = number of slices filled
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function factory(props) {
    const den = Math.max(1, props.den || 4);
    const shaded = Math.max(0, Math.min(den, props.shaded || 0));
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '240px';
    const cx = 100, cy = 100, r = 88;
    if (den === 1) {
      svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shaded ? '#48bb78' : '#fff7c2'}" stroke="#1f7a3f" stroke-width="2"/>`;
    } else {
      let inner = '';
      for (let i = 0; i < den; i++) {
        const a0 = (i / den) * 2 * Math.PI - Math.PI / 2;
        const a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const fill = i < shaded ? '#48bb78' : '#fff7c2';
        inner += `<path d="M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${fill}" stroke="#1f7a3f" stroke-width="2"/>`;
      }
      svg.innerHTML = inner;
    }
    return global.PEPDiagrams._wrap(svg, { label: props.label || `${shaded}/${den}` });
  }
  global.PEPDiagrams.register('fraction-pie', factory);
})(window);
