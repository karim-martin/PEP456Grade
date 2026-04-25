/**
 * HTML Tag Tree — visualizes a small DOM as nested boxes.
 *
 * Props: { html: "<html><body><h1>Hi</h1></body></html>" }
 */
(function (global) {
  if (!global.PEPDiagrams) return;
  function tagBox(tag, indent) {
    return { tag, indent, children: [] };
  }
  function parse(html) {
    // Very simple parser: walk DOM
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    function walk(node, indent) {
      if (node.nodeType !== 1) return null;
      const t = tagBox(node.tagName.toLowerCase(), indent);
      Array.from(node.children).forEach(c => {
        const x = walk(c, indent + 1);
        if (x) t.children.push(x);
      });
      return t;
    }
    return Array.from(tmp.children).map(c => walk(c, 0));
  }
  function factory(props) {
    const html = props.html || '<html><head><title>Hi</title></head><body><h1>Hello</h1><p>World</p></body></html>';
    const trees = parse(html);
    const ns = global.PEPDiagrams._NS;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 280');
    svg.setAttribute('xmlns', ns);
    svg.style.width = '100%'; svg.style.maxWidth = '440px';
    let y = 28;
    function draw(node, x) {
      const w = 120;
      svg.innerHTML += `<rect x="${x}" y="${y - 16}" width="${w}" height="22" rx="6" fill="#bfe9ff" stroke="#1a4d8c"/><text x="${x + w/2}" y="${y - 1}" text-anchor="middle" font-weight="700" font-size="12" class="pep-diagram__label">&lt;${node.tag}&gt;</text>`;
      const myY = y;
      y += 30;
      node.children.forEach(c => {
        const cx = x + 30;
        svg.innerHTML += `<line x1="${x + 20}" y1="${myY + 6}" x2="${cx}" y2="${y - 16 + 11}" stroke="#1a4d8c" stroke-width="2"/>`;
        draw(c, cx);
      });
    }
    trees.forEach(t => { draw(t, 20); y += 10; });
    return global.PEPDiagrams._wrap(svg, { label: props.label || 'HTML Tag Tree' });
  }
  global.PEPDiagrams.register('html-tag-tree', factory);
})(window);
