/**
 * Jamaica Parishes diagram — schematic 14-parish map.
 * Each parish path has data-region="<Parish Name>". Click handlers wire up via game modules.
 */
(function (global) {
  if (!global.PEPDiagrams) return;

  const PARISHES = [
    // x, y, w, h, label  (rough layout — schematic, not geographic)
    { id:'Hanover',           x:20,  y:60, w:60, h:50 },
    { id:'Westmoreland',      x:25,  y:115, w:55, h:55 },
    { id:'Saint James',       x:80,  y:55, w:55, h:55 },
    { id:'Trelawny',          x:140, y:50, w:50, h:50 },
    { id:'Saint Elizabeth',   x:90,  y:130, w:65, h:55 },
    { id:'Manchester',        x:155, y:135, w:55, h:50 },
    { id:'Saint Ann',         x:195, y:48, w:55, h:55 },
    { id:'Clarendon',         x:215, y:130, w:55, h:55 },
    { id:'Saint Mary',        x:250, y:50, w:50, h:55 },
    { id:'Saint Catherine',   x:275, y:120, w:55, h:55 },
    { id:'Portland',          x:305, y:55, w:55, h:55 },
    { id:'Kingston',          x:330, y:155, w:30, h:25 },
    { id:'Saint Andrew',      x:295, y:145, w:50, h:35 },
    { id:'Saint Thomas',      x:355, y:120, w:55, h:55 }
  ];

  function factory(props) {
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 430 200');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%';
    svg.style.maxWidth = '440px';

    // Sea backdrop
    const sea = document.createElementNS(ns, 'rect');
    sea.setAttribute('x', 0); sea.setAttribute('y', 0);
    sea.setAttribute('width', 430); sea.setAttribute('height', 200);
    sea.setAttribute('fill', '#cdeefd');
    svg.appendChild(sea);

    // Title
    const title = document.createElementNS(ns, 'text');
    title.setAttribute('x', 215); title.setAttribute('y', 20);
    title.setAttribute('text-anchor','middle');
    title.setAttribute('font-weight','800');
    title.setAttribute('fill', '#1a4d8c');
    title.textContent = '🇯🇲 Jamaica — 14 Parishes';
    svg.appendChild(title);

    // Parishes as rounded boxes with labels
    PARISHES.forEach(p => {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('data-region', p.id);
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', p.x); r.setAttribute('y', p.y);
      r.setAttribute('width', p.w); r.setAttribute('height', p.h);
      r.setAttribute('rx', 6);
      r.setAttribute('fill', '#9ed8a3');
      r.setAttribute('stroke', '#1f7a3f');
      r.setAttribute('stroke-width', 1.5);
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', p.x + p.w/2);
      t.setAttribute('y', p.y + p.h/2 + 4);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '9');
      t.setAttribute('font-weight', '700');
      t.setAttribute('fill', '#1a4d2c');
      t.setAttribute('class', 'pep-diagram__label');
      t.textContent = p.id.replace('Saint ', 'St. ');
      g.appendChild(r); g.appendChild(t);
      svg.appendChild(g);
      if (props.highlight && (props.highlight === p.id || (Array.isArray(props.highlight) && props.highlight.includes(p.id)))) {
        g.classList.add('is-highlighted');
      }
    });

    return global.PEPDiagrams._wrap(svg, { label: props.label || null });
  }

  global.PEPDiagrams.register('jamaica-parishes', factory);
})(window);
