/**
 * PEP Diagrams — registry of inline SVG factories.
 *
 * Each diagram file calls PEPDiagrams.register(name, factory).
 * factory(props) returns an SVG element (or wrapper) with optional play(action) method.
 *
 * Public API:
 *   PEPDiagrams.register(name, factory)
 *   PEPDiagrams.has(name)
 *   PEPDiagrams.render(name, host, props)   -> mounts and returns the element
 *   PEPDiagrams.list()
 */
(function (global) {
  const _registry = Object.create(null);
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function register(name, factory) {
    if (!name || typeof factory !== 'function') return;
    _registry[name] = factory;
  }

  function has(name) { return !!_registry[name]; }
  function list() { return Object.keys(_registry); }

  function render(name, host, props) {
    if (!_registry[name]) {
      console.warn('PEPDiagrams: unknown diagram', name);
      return null;
    }
    const el = _registry[name](props || {});
    if (host) {
      // host can be a selector or element
      const target = (typeof host === 'string') ? document.querySelector(host) : host;
      if (target) {
        target.innerHTML = '';
        target.appendChild(el);
      }
    }
    return el;
  }

  // Helper: create an SVG element with attributes set.
  function svgEl(tag, attrs, children) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] !== undefined && attrs[k] !== null) {
          el.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children) {
      children.forEach(c => el.appendChild(c));
    }
    return el;
  }

  function wrap(svg, opts) {
    const w = document.createElement('div');
    w.className = 'pep-diagram' + (opts && opts.extraClass ? ' ' + opts.extraClass : '');
    if (opts && opts.label) {
      const cap = document.createElement('div');
      cap.className = 'pep-diagram__caption';
      cap.textContent = opts.label;
      w.appendChild(cap);
    }
    w.appendChild(svg);
    return w;
  }

  global.PEPDiagrams = { register, has, list, render, _svgEl: svgEl, _wrap: wrap, _NS: SVG_NS };
})(window);
