/**
 * Caribbean Map — simplified Caribbean basin with major islands.
 */
(function (global) {
  if (!global.PEPDiagrams) return;

  const ISLANDS = [
    { id:'Cuba',            cx:90,  cy:90,  rx:55, ry:14 },
    { id:'Hispaniola',      cx:200, cy:110, rx:30, ry:12 },
    { id:'Jamaica',         cx:160, cy:130, rx:18, ry:6 },
    { id:'Puerto Rico',     cx:255, cy:108, rx:14, ry:6 },
    { id:'Trinidad',        cx:340, cy:185, rx:10, ry:8 },
    { id:'Bahamas',         cx:160, cy:55,  rx:20, ry:10 },
    { id:'Barbados',        cx:330, cy:155, rx:6,  ry:6 },
    { id:'Saint Lucia',     cx:325, cy:140, rx:4,  ry:5 },
    { id:'Dominica',        cx:315, cy:128, rx:4,  ry:5 },
    { id:'Belize',          cx:30,  cy:140, rx:8,  ry:14 }
  ];

  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 220');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';

    // Sea
    const sea = document.createElementNS(ns, 'rect');
    sea.setAttribute('x', 0); sea.setAttribute('y', 0);
    sea.setAttribute('width', 400); sea.setAttribute('height', 220);
    sea.setAttribute('fill', '#cdeefd');
    svg.appendChild(sea);

    // Title
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', 200); t.setAttribute('y', 20);
    t.setAttribute('text-anchor','middle'); t.setAttribute('font-weight','800');
    t.setAttribute('fill', '#1a4d8c');
    t.textContent = 'The Caribbean';
    svg.appendChild(t);

    ISLANDS.forEach(i => {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('data-region', i.id);
      const e = document.createElementNS(ns, 'ellipse');
      e.setAttribute('cx', i.cx); e.setAttribute('cy', i.cy);
      e.setAttribute('rx', i.rx); e.setAttribute('ry', i.ry);
      e.setAttribute('fill', '#9ed8a3');
      e.setAttribute('stroke', '#1f7a3f');
      e.setAttribute('stroke-width', 1.5);
      const lab = document.createElementNS(ns, 'text');
      lab.setAttribute('x', i.cx); lab.setAttribute('y', i.cy + i.ry + 12);
      lab.setAttribute('text-anchor','middle');
      lab.setAttribute('font-size', '10');
      lab.setAttribute('font-weight', '700');
      lab.setAttribute('fill', '#1a4d2c');
      lab.setAttribute('class','pep-diagram__label');
      lab.textContent = i.id;
      g.appendChild(e); g.appendChild(lab);
      svg.appendChild(g);
      if (props.highlight && (i.id === props.highlight || (Array.isArray(props.highlight) && props.highlight.includes(i.id)))) {
        g.classList.add('is-highlighted');
      }
    });

    return global.PEPDiagrams._wrap(svg, { label: props.label || null });
  }

  global.PEPDiagrams.register('caribbean-map', factory);
})(window);
