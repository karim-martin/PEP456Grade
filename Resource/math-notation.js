/**
 * PEP Math Notation — tiny HTML-based math renderer.
 * No external deps; outputs styled spans (see style.css §15).
 *
 *   PEPMath.frac(n, d)        -> "<span class='pep-frac'>...</span>"
 *   PEPMath.mixed(w, n, d)    -> mixed number
 *   PEPMath.pow(base, exp)    -> "<span class='pep-pow'>2<sup>3</sup></span>"
 *   PEPMath.expr(s)           -> parses "3/4 + 1/8" or "2^3" into HTML
 *   PEPMath.num(n)            -> formatted number with thousands separators
 *   PEPMath.gcd(a,b)          -> greatest common divisor
 *   PEPMath.simplify(n,d)     -> [n', d'] reduced fraction
 *   PEPMath.toEquivalent(n,d,k) -> [n*k, d*k]
 */
(function (global) {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function frac(n, d) {
    return `<span class="pep-frac"><span class="pep-frac__n">${esc(n)}</span><span class="pep-frac__bar"></span><span class="pep-frac__d">${esc(d)}</span></span>`;
  }

  function mixed(w, n, d) {
    return `<span class="pep-mixed"><span class="pep-mixed__w">${esc(w)}</span>${frac(n, d)}</span>`;
  }

  function pow(base, exp) {
    return `<span class="pep-pow">${esc(base)}<sup>${esc(exp)}</sup></span>`;
  }

  function num(n) {
    if (typeof n !== 'number') n = Number(n);
    if (!isFinite(n)) return String(n);
    return n.toLocaleString('en-US');
  }

  function gcd(a, b) {
    a = Math.abs(a|0); b = Math.abs(b|0);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  function simplify(n, d) {
    const g = gcd(n, d);
    return [n / g, d / g];
  }

  function toEquivalent(n, d, k) {
    return [n * k, d * k];
  }

  /**
   * Very small expression parser for grade-school math:
   *   - "a/b"        -> fraction
   *   - "a^b"        -> power
   *   - "w a/b"      -> mixed number (whitespace separated)
   *   - operators +, -, *, /, =, ×, ÷ kept as text with spacing
   */
  function expr(s) {
    s = String(s).trim();
    // Tokenize on whitespace and explicit operator chars.
    const out = [];
    const tokens = s.split(/(\s+|[=+−\-×÷]|\*|(?<!\^)\^)/).filter(t => t && !/^\s+$/.test(t));
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (/^[=+\-−×÷*]$/.test(t)) { out.push(`<span class="pep-op">${esc(t)}</span>`); continue; }
      if (t === '^') continue; // handled with neighbours below

      // mixed number: digits then digits/digits as next token
      if (/^\d+$/.test(t) && i + 2 < tokens.length && /^\d+\/\d+$/.test(tokens[i+2])) {
        const w = t;
        const [n, d] = tokens[i+2].split('/');
        out.push(mixed(w, n, d));
        i += 2; continue;
      }
      // power: X^Y
      if (/^\d+$/.test(t) && tokens[i+1] === '^' && /^\d+$/.test(tokens[i+2])) {
        out.push(pow(t, tokens[i+2]));
        i += 2; continue;
      }
      // fraction
      if (/^\d+\/\d+$/.test(t)) {
        const [n, d] = t.split('/');
        out.push(frac(n, d));
        continue;
      }
      // plain number / word
      out.push(`<span class="pep-num">${esc(t)}</span>`);
    }
    return `<span class="pep-expr">${out.join(' ')}</span>`;
  }

  global.PEPMath = { frac, mixed, pow, num, expr, gcd, simplify, toEquivalent };
})(window);
