/**
 * PEP Stepper — animated step-by-step worked-example player.
 *
 * Data shape:
 * {
 *   title: "Place value of 25,473,864",
 *   stage: [
 *     { kind: "digits"|"label"|"equation"|"shape"|"number-line"|"image"|"svg", id, ... }
 *   ],
 *   steps: [
 *     { say: "...", highlight: ["id","id[i]"], motion: "pulse|slide-up|fade-in|shake|flip|draw",
 *       reveal: { kind:"equation", text:"...", id:"..." },
 *       countUp: { id, from, to, duration },
 *       move: { id, to: "#anchor" },
 *       wait: 1500
 *     }
 *   ],
 *   celebrate: { xp: 8, confetti: true }
 * }
 *
 * Auto mode (procedural generation): supply { auto: { kind, ...params } } instead.
 */
(function (global) {

  // ============================================================
  // Auto-generators — keep stepper data lightweight.
  // ============================================================

  const AUTO = {
    'long-division': autoLongDivision,
    'place-value':   autoPlaceValue,
    'multiplication-area': autoMultArea,
    'fraction-add':  autoFractionAdd,
    'equivalent-fractions': autoEquivFractions,
    'factor-tree':   autoFactorTree,
    'equation-balance': autoEquationBalance,
    'perimeter-walk': autoPerimeter,
    'rounding-line': autoRoundingLine,
    'percent-bar':   autoPercentBar,
    'decimal-place': autoDecimalPlace
  };

  function autoLongDivision(p) {
    const dividend = p.dividend ?? 84;
    const divisor  = p.divisor  ?? 7;
    const ans = Math.floor(dividend / divisor);
    return {
      title: `Divide ${dividend} ÷ ${divisor}`,
      stage: [
        { kind:'digits', id:'div', value: String(dividend), label:'Dividend' },
        { kind:'digits', id:'dvr', value: String(divisor),  label:'Divisor' }
      ],
      steps: [
        { say: `We want to divide ${dividend} by ${divisor}.`, highlight:['div','dvr'], motion:'pulse', wait:1300 },
        { say: `How many times does ${divisor} go into ${String(dividend)[0]}?`, highlight:['div[0]'], motion:'pulse', wait:1500 },
        { reveal:{ kind:'equation', id:'q1', text:`${divisor} × ? = ${String(dividend)[0]}` }, motion:'fade-in', wait:1300 },
        { say: `So the first digit of our answer is ${String(ans)[0]}.`, reveal:{ kind:'equation', id:'a1', text:`Answer so far: ${String(ans)[0]}` }, motion:'slide-up', wait:1500 },
        { say: `Bring down the next digit and keep going.`, highlight:['div[1]'], motion:'pulse', wait:1500 },
        { reveal:{ kind:'equation', id:'final', text:`${dividend} ÷ ${divisor} = ${ans}` }, motion:'pulse', wait:1500 }
      ],
      celebrate: { xp: 10, confetti: true }
    };
  }

  function autoPlaceValue(p) {
    const number = p.number ?? 374562;
    const s = String(number);
    const labels = ['Ones','Tens','Hundreds','Thousands','Ten Thousands','Hundred Thousands','Millions','Ten Millions','Hundred Millions'];
    const stage = [{ kind:'digits', id:'n', value: s.toLocaleString ? Number(s).toLocaleString('en-US') : s }];
    const steps = [
      { say: `Let's read the number ${Number(number).toLocaleString('en-US')}.`, highlight:['n'], motion:'pulse', wait:1500 }
    ];
    for (let i = 0; i < s.length; i++) {
      const place = labels[s.length - 1 - i] || '?';
      const digit = s[i];
      const value = digit + '0'.repeat(s.length - 1 - i);
      steps.push({
        say: `The ${digit} sits in the ${place} place.`,
        highlight:['n[' + i + ']'],
        motion: 'pulse',
        reveal: { kind:'equation', id:'v'+i, text: digit + ' × ' + (Number(value)/Number(digit)).toLocaleString('en-US') + ' = ' + Number(value).toLocaleString('en-US') },
        wait: 1400
      });
    }
    steps.push({ reveal:{ kind:'equation', id:'done', text:'You read the number! ✨' }, motion:'fade-in', wait:1200 });
    return { title:`Place value of ${Number(number).toLocaleString('en-US')}`, stage, steps, celebrate:{ xp:10, confetti:true } };
  }

  function autoMultArea(p) {
    const w = p.w ?? 6, h = p.h ?? 7;
    return {
      title: `${w} × ${h} as area`,
      stage: [
        { kind:'shape', id:'grid', shape:'grid', cols:w, rows:h, fill:0 }
      ],
      steps: [
        { say: `We can think of ${w} × ${h} as a rectangle that is ${w} wide and ${h} tall.`, highlight:['grid'], motion:'fade-in', wait:1500 },
        { say: `Let's fill it row by row and count.`, motion:'pulse', wait:1200 },
        { gridFill:{ id:'grid' }, wait: Math.min(3000, w*h*60) },
        { reveal:{ kind:'equation', id:'eq', text:`${w} × ${h} = ${w*h}` }, motion:'pulse', wait:1500 }
      ],
      celebrate:{ xp:10, confetti:true }
    };
  }

  function autoFractionAdd(p) {
    const a = p.a || [1,3], b = p.b || [1,4];
    const lcd = lcm(a[1], b[1]);
    const an = a[0] * (lcd / a[1]);
    const bn = b[0] * (lcd / b[1]);
    const sumN = an + bn;
    const [sn, sd] = simplify(sumN, lcd);
    return {
      title: `Add fractions with different denominators`,
      stage: [
        { kind:'equation', id:'eq', text: `${a[0]}/${a[1]} + ${b[0]}/${b[1]}` }
      ],
      steps: [
        { say: `Their bottom numbers are different. Find a common denominator: ${lcd}.`, motion:'pulse', wait:1700 },
        { reveal:{ kind:'equation', id:'eq2', text:`${an}/${lcd} + ${bn}/${lcd}` }, motion:'slide-up', wait:1500 },
        { say: `Now add the top numbers.`, motion:'pulse', wait:1300 },
        { reveal:{ kind:'equation', id:'eq3', text:`${an+bn}/${lcd}` }, motion:'fade-in', wait:1300 },
        ...(sn !== sumN ? [{ say:`Simplify to ${sn}/${sd}.`, reveal:{ kind:'equation', id:'eqf', text:`${sn}/${sd}` }, motion:'pulse', wait:1500 }] : [])
      ],
      celebrate:{ xp:10, confetti:true }
    };
  }

  function autoEquivFractions(p) {
    const a = p.a || [1,2], k = p.k || 2;
    return {
      title: `Equivalent fractions: ${a[0]}/${a[1]} = ${a[0]*k}/${a[1]*k}`,
      stage: [
        { kind:'equation', id:'eq', text: `${a[0]}/${a[1]}` }
      ],
      steps: [
        { say:`Multiply the top and bottom by the same number — let's use ×${k}.`, motion:'pulse', wait:1500 },
        { reveal:{ kind:'equation', id:'eq2', text:`${a[0]}×${k}/${a[1]}×${k}` }, motion:'slide-up', wait:1500 },
        { reveal:{ kind:'equation', id:'eq3', text:`= ${a[0]*k}/${a[1]*k}` }, motion:'fade-in', wait:1500 }
      ],
      celebrate:{ xp:8, confetti:true }
    };
  }

  function autoFactorTree(p) {
    const number = p.number ?? 36;
    const factors = primeFactor(number);
    return {
      title: `Prime factor tree of ${number}`,
      stage: [
        { kind:'equation', id:'root', text: String(number) }
      ],
      steps: factors.map((f, i) => ({
        say: i === 0 ? `Start by splitting ${number} into prime factors.` : `Keep splitting until every leaf is prime.`,
        reveal: { kind:'equation', id:'f'+i, text: '→ ' + f },
        motion: 'slide-up',
        wait: 1100
      })).concat([
        { reveal:{ kind:'equation', id:'final', text: `${number} = ${formatPrimes(factors)}` }, motion:'pulse', wait:1700 }
      ]),
      celebrate:{ xp:10, confetti:true }
    };
  }

  function autoEquationBalance(p) {
    const a = p.a ?? 5, b = p.b ?? 12;
    const x = b - a;
    return {
      title: `Solve x + ${a} = ${b}`,
      stage: [
        { kind:'equation', id:'eq', text: `x + ${a} = ${b}` }
      ],
      steps: [
        { say:`The equation must stay balanced — like a seesaw.`, motion:'pulse', wait:1500 },
        { say:`Take ${a} away from BOTH sides.`, motion:'shake', wait:1500 },
        { reveal:{ kind:'equation', id:'eq2', text: `x = ${b} − ${a}` }, motion:'slide-up', wait:1500 },
        { reveal:{ kind:'equation', id:'eq3', text: `x = ${x}` }, motion:'pulse', wait:1500 }
      ],
      celebrate:{ xp:10, confetti:true }
    };
  }

  function autoPerimeter(p) {
    const w = p.w ?? 4, h = p.h ?? 3;
    return {
      title: `Perimeter of a ${w}×${h} rectangle`,
      stage: [
        { kind:'shape', id:'rect', shape:'rect-outline', w, h }
      ],
      steps: [
        { say:`Walk around the rectangle and count each step.`, motion:'pulse', wait:1500 },
        { say:`Top: ${w} steps. Right side: ${h} steps. Bottom: ${w} steps. Left side: ${h} steps.`, motion:'fade-in', wait:2400 },
        { reveal:{ kind:'equation', id:'eq', text: `Perimeter = 2(${w} + ${h}) = ${2*(w+h)}` }, motion:'pulse', wait:1500 }
      ],
      celebrate:{ xp:8, confetti:true }
    };
  }

  function autoRoundingLine(p) {
    const n = p.n ?? 67, place = p.place ?? 'tens';
    const step = place === 'hundreds' ? 100 : place === 'thousands' ? 1000 : 10;
    const lo = Math.floor(n/step)*step;
    const hi = lo + step;
    const target = (n - lo) >= step/2 ? hi : lo;
    return {
      title: `Round ${n} to the nearest ${place}`,
      stage: [
        { kind:'number-line', id:'nl', from:lo, to:hi, marks:[{value:lo, label:String(lo)},{value:hi, label:String(hi)},{value:n, label:String(n), highlight:true}] }
      ],
      steps: [
        { say:`Look at the number line between ${lo} and ${hi}.`, highlight:['nl'], motion:'fade-in', wait:1500 },
        { say:`Is ${n} closer to ${lo} or ${hi}?`, motion:'pulse', wait:1500 },
        { reveal:{ kind:'equation', id:'eq', text: `${n} ≈ ${target}` }, motion:'slide-up', wait:1500 }
      ],
      celebrate:{ xp:8, confetti:true }
    };
  }

  function autoPercentBar(p) {
    const pct = p.pct ?? 25;
    const [sn, sd] = simplify(pct, 100);
    return {
      title: `${pct}% as a fraction`,
      stage: [
        { kind:'equation', id:'eq', text: `${pct}%` }
      ],
      steps: [
        { say:`Percent means "out of 100".`, motion:'pulse', wait:1300 },
        { reveal:{ kind:'equation', id:'eq2', text: `${pct}/100` }, motion:'slide-up', wait:1500 },
        { reveal:{ kind:'equation', id:'eq3', text: `= ${sn}/${sd}` }, motion:'pulse', wait:1500 }
      ],
      celebrate:{ xp:8, confetti:true }
    };
  }

  function autoDecimalPlace(p) {
    const n = p.n ?? 3.45;
    return {
      title: `Decimal place value of ${n}`,
      stage: [
        { kind:'equation', id:'eq', text: String(n) }
      ],
      steps: [
        { say:`The decimal point separates whole numbers from parts of a whole.`, motion:'pulse', wait:1700 },
        { say:`Digits to the left of the dot are ones, tens, hundreds...`, motion:'fade-in', wait:1700 },
        { say:`Digits to the right are tenths, hundredths, thousandths...`, motion:'fade-in', wait:1700 }
      ],
      celebrate:{ xp:8, confetti:true }
    };
  }

  // ============================================================
  // Helpers used by auto-generators
  // ============================================================

  function gcd(a,b){ a=Math.abs(a|0); b=Math.abs(b|0); while(b){[a,b]=[b,a%b];} return a||1; }
  function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }
  function simplify(n,d){ const g=gcd(n,d); return [n/g, d/g]; }
  function primeFactor(n) {
    const out = [];
    let x = n;
    for (let p = 2; p <= x; p++) {
      while (x % p === 0) { out.push(p); x = x / p; }
    }
    return out;
  }
  function formatPrimes(arr) {
    const counts = {};
    arr.forEach(p => counts[p] = (counts[p]||0)+1);
    return Object.keys(counts).sort((a,b)=>a-b).map(p => counts[p]>1 ? `${p}^${counts[p]}` : `${p}`).join(' × ');
  }

  // ============================================================
  // Renderer
  // ============================================================

  function renderStage(host, stage) {
    const stageEl = document.createElement('div');
    stageEl.className = 'pep-step__stage';

    (stage || []).forEach(item => {
      let el;
      if (item.kind === 'digits') {
        el = document.createElement('div');
        el.className = 'pep-step__chip pep-step__chip--digits';
        el.dataset.id = item.id;
        const s = String(item.value || '');
        // wrap each character in a span so highlight ids like "n[0]" can target it
        let inner = '';
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          inner += `<span class="pep-step__digit" data-id="${item.id}[${i}]">${escapeHTML(ch)}</span>`;
        }
        el.innerHTML = inner;
        if (item.label) {
          const lab = document.createElement('div');
          lab.className = 'pep-step__chip-label';
          lab.textContent = item.label;
          el.appendChild(lab);
        }
      } else if (item.kind === 'equation') {
        el = document.createElement('div');
        el.className = 'pep-step__chip pep-step__chip--equation';
        el.dataset.id = item.id;
        el.innerHTML = formatEquation(item.text || '');
      } else if (item.kind === 'label') {
        el = document.createElement('div');
        el.className = 'pep-step__chip pep-step__chip--label';
        el.dataset.id = item.id;
        el.textContent = item.text || '';
      } else if (item.kind === 'shape') {
        el = renderShape(item);
      } else if (item.kind === 'number-line') {
        el = renderNumberLine(item);
      } else if (item.kind === 'svg') {
        el = document.createElement('div');
        el.className = 'pep-step__chip pep-step__chip--svg';
        el.dataset.id = item.id;
        el.innerHTML = item.svg || '';
      }
      if (el) stageEl.appendChild(el);
    });
    host.appendChild(stageEl);
    return stageEl;
  }

  function renderShape(item) {
    const wrap = document.createElement('div');
    wrap.className = 'pep-step__chip pep-step__chip--shape';
    wrap.dataset.id = item.id;
    if (item.shape === 'grid') {
      const rows = item.rows || 3, cols = item.cols || 3;
      wrap.style.setProperty('--cols', cols);
      wrap.style.setProperty('--rows', rows);
      wrap.classList.add('pep-step__grid');
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement('span');
          cell.className = 'pep-step__cell';
          wrap.appendChild(cell);
        }
      }
    } else if (item.shape === 'rect-outline') {
      const w = item.w || 4, h = item.h || 3;
      wrap.style.setProperty('--w', w);
      wrap.style.setProperty('--h', h);
      wrap.classList.add('pep-step__rect-outline');
      wrap.innerHTML = `<span class="pep-step__rect-w">${w}</span><span class="pep-step__rect-h">${h}</span>`;
    }
    return wrap;
  }

  function renderNumberLine(item) {
    const wrap = document.createElement('div');
    wrap.className = 'pep-step__chip pep-step__chip--numline';
    wrap.dataset.id = item.id;
    const from = item.from ?? 0, to = item.to ?? 10;
    const span = to - from || 1;
    const marks = item.marks || [];
    const ticksHtml = marks.map(m => {
      const left = ((m.value - from) / span) * 100;
      return `<span class="pep-step__tick ${m.highlight ? 'is-highlighted' : ''}" style="left:${left}%"><span class="pep-step__tick-label">${escapeHTML(m.label || m.value)}</span></span>`;
    }).join('');
    wrap.innerHTML = `<div class="pep-step__numline-track"></div>${ticksHtml}`;
    return wrap;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function formatEquation(text) {
    // Light formatting: turn a/b into PEPMath.frac, x^y into PEPMath.pow, leave the rest as text.
    if (!global.PEPMath) return escapeHTML(text);
    return text
      .replace(/(\d+)\/(\d+)/g, (m, n, d) => global.PEPMath.frac(n, d))
      .replace(/(\d+)\^(\d+)/g, (m, b, e) => global.PEPMath.pow(b, e))
      .replace(/\bx\b/g, '<span class="pep-var">x</span>');
  }

  function applyHighlights(stageEl, ids) {
    // Clear previous
    stageEl.querySelectorAll('.is-active').forEach(n => n.classList.remove('is-active'));
    if (!ids || !ids.length) return;
    ids.forEach(id => {
      const node = stageEl.querySelector(`[data-id="${cssEscape(id)}"]`);
      if (node) node.classList.add('is-active');
    });
  }

  function cssEscape(s) {
    return String(s).replace(/(["\\\[\]])/g, '\\$1');
  }

  function applyMotion(stageEl, ids, motion) {
    if (!motion) return;
    const cls = 'pep-motion-' + motion;
    const targets = (ids && ids.length)
      ? ids.map(id => stageEl.querySelector(`[data-id="${cssEscape(id)}"]`)).filter(Boolean)
      : [stageEl];
    targets.forEach(t => {
      t.classList.remove(cls);
      void t.offsetWidth;
      t.classList.add(cls);
    });
  }

  function reveal(stageEl, opts) {
    if (!opts) return;
    let el;
    if (opts.kind === 'equation') {
      el = document.createElement('div');
      el.className = 'pep-step__chip pep-step__chip--equation pep-step__chip--revealed';
      el.dataset.id = opts.id || ('rev-' + Math.random().toString(36).slice(2,8));
      el.innerHTML = formatEquation(opts.text || '');
    } else if (opts.kind === 'label') {
      el = document.createElement('div');
      el.className = 'pep-step__chip pep-step__chip--label pep-step__chip--revealed';
      el.dataset.id = opts.id || ('rev-' + Math.random().toString(36).slice(2,8));
      el.textContent = opts.text || '';
    } else {
      return;
    }
    stageEl.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-shown'));
  }

  function gridFill(stageEl, opts) {
    if (!opts || !opts.id) return;
    const grid = stageEl.querySelector(`[data-id="${cssEscape(opts.id)}"]`);
    if (!grid) return;
    const cells = grid.querySelectorAll('.pep-step__cell');
    cells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add('is-filled'), i * 50);
    });
  }

  function countUp(stageEl, opts) {
    if (!opts || !opts.id) return;
    const el = stageEl.querySelector(`[data-id="${cssEscape(opts.id)}"]`);
    if (!el) return;
    const from = opts.from ?? 0, to = opts.to ?? 10, dur = opts.duration ?? 1000;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const v = Math.round(from + (to - from) * t);
      el.textContent = v.toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ============================================================
  // Public render
  // ============================================================

  function resolveData(data) {
    if (data && data.auto && data.auto.kind && AUTO[data.auto.kind]) {
      return AUTO[data.auto.kind](data.auto);
    }
    return data;
  }

  function render(host, data, opts) {
    const o = opts || {};
    const D = resolveData(data) || { stage:[], steps:[] };

    host.innerHTML = '';
    host.classList.add('pep-step');

    const head = document.createElement('div');
    head.className = 'pep-step__header';
    head.innerHTML = `<h3 class="pep-step__title">${escapeHTML(D.title || 'Worked Example')}</h3>`;
    host.appendChild(head);

    const stageEl = renderStage(host, D.stage || []);

    const captionEl = document.createElement('div');
    captionEl.className = 'pep-step__caption';
    captionEl.setAttribute('aria-live','polite');
    host.appendChild(captionEl);

    const progressEl = document.createElement('div');
    progressEl.className = 'pep-step__progress';
    progressEl.innerHTML = (D.steps || []).map(() => '<span class="pep-step__dot"></span>').join('');
    host.appendChild(progressEl);

    const ctrls = document.createElement('div');
    ctrls.className = 'pep-step__controls';
    ctrls.innerHTML = `
      <button class="pep-step__btn" data-act="prev">◀ Back</button>
      <button class="pep-step__btn" data-act="play">▶ Play</button>
      <button class="pep-step__btn pep-step__btn--primary" data-act="next">Next ▶</button>
    `;
    host.appendChild(ctrls);

    const state = { i: -1, playing: false, timer: null };

    function applyStep(step) {
      if (!step) return;
      if (step.say != null) {
        captionEl.textContent = step.say;
        try { global.PEPAudio?.speak(step.say); } catch(_){}
      } else {
        captionEl.textContent = '';
      }
      if (step.highlight) applyHighlights(stageEl, step.highlight);
      if (step.motion) applyMotion(stageEl, step.highlight, step.motion);
      if (step.reveal) reveal(stageEl, step.reveal);
      if (step.gridFill) gridFill(stageEl, step.gridFill);
      if (step.countUp) countUp(stageEl, step.countUp);
    }

    function rewindTo(idx) {
      // Re-render stage from scratch and re-apply steps [0..idx]
      const newStage = renderStage(document.createElement('div'), D.stage || []);
      stageEl.replaceWith(newStage);
      // update reference for closures
      // (we mutate state.stageEl indirectly through DOM)
      const fresh = host.querySelector('.pep-step__stage');
      // immediate re-apply (no animation/audio) for steps before idx
      for (let i = 0; i <= idx; i++) {
        const s = D.steps[i];
        if (!s) break;
        if (s.highlight) applyHighlights(fresh, s.highlight);
        if (s.reveal) reveal(fresh, s.reveal);
        if (s.gridFill) gridFill(fresh, s.gridFill);
      }
    }

    function next() {
      if (state.i + 1 >= (D.steps || []).length) {
        finish();
        return;
      }
      state.i++;
      const liveStage = host.querySelector('.pep-step__stage');
      applyStep(D.steps[state.i]);
      const dots = progressEl.querySelectorAll('.pep-step__dot');
      dots.forEach((d, i) => d.classList.toggle('is-on', i <= state.i));
    }

    function prev() {
      if (state.i <= 0) { state.i = -1; rewindTo(-1); captionEl.textContent = ''; progressEl.querySelectorAll('.pep-step__dot').forEach(d=>d.classList.remove('is-on')); return; }
      state.i--;
      rewindTo(state.i);
      captionEl.textContent = D.steps[state.i].say || '';
      progressEl.querySelectorAll('.pep-step__dot').forEach((d, i) => d.classList.toggle('is-on', i <= state.i));
    }

    function play() {
      state.playing = !state.playing;
      ctrls.querySelector('[data-act="play"]').textContent = state.playing ? '⏸ Pause' : '▶ Play';
      if (state.playing) tick();
    }

    function tick() {
      if (!state.playing) return;
      const wasLast = state.i + 1 >= D.steps.length;
      next();
      if (wasLast) { state.playing = false; ctrls.querySelector('[data-act="play"]').textContent = '▶ Play'; return; }
      const cur = D.steps[state.i];
      const w = (cur && cur.wait) ? cur.wait : 1800;
      state.timer = setTimeout(tick, w);
    }

    function finish() {
      ctrls.querySelector('[data-act="next"]').textContent = 'Done ✓';
      ctrls.querySelector('[data-act="next"]').classList.add('pep-step__btn--done');
      try {
        if (D.celebrate && D.celebrate.confetti && global.PEP?.confetti) global.PEP.confetti();
        if (D.celebrate && D.celebrate.xp && global.PEP?.awardXP) {
          global.PEP.awardXP(D.celebrate.xp, { silent: true });
        }
        global.PEPAudio?.sfx('correct');
      } catch(_){}
      if (typeof o.onComplete === 'function') o.onComplete();
    }

    ctrls.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      try { global.PEPAudio?.sfx('click'); } catch(_){}
      if (b.dataset.act === 'next') {
        if (ctrls.querySelector('[data-act="next"]').classList.contains('pep-step__btn--done')) {
          if (typeof o.onComplete === 'function') o.onComplete();
          return;
        }
        next();
      }
      if (b.dataset.act === 'prev') prev();
      if (b.dataset.act === 'play') play();
    });

    return { next, prev, play, finish };
  }

  // Auto-inject any <div class="pep-step" data-step-id="..."> with data fetched from a chapter bank.
  function autoInject() {
    const els = document.querySelectorAll('.pep-step[data-step-id]');
    if (!els.length) return;
    if (!global.PEPQuiz || !global.PEPQuiz.loadBank) return;
    global.PEPQuiz.loadBank().then(bank => {
      els.forEach(el => {
        const id = el.dataset.stepId;
        // id format: chapterId-stepKey, e.g. g5-mat-1-ex1
        const parts = id.split('-');
        const stepKey = parts.pop();
        const chapterId = parts.join('-');
        const chapter = bank[chapterId];
        if (!chapter || !chapter.steppers || !chapter.steppers[stepKey]) return;
        render(el, chapter.steppers[stepKey]);
      });
    });
  }

  global.PEPStepper = { render, autoInject, _AUTO: AUTO };

  // Self-register so lesson-player can mount steppers as activities.
  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame('stepper', {
        id: 'stepper',
        label: 'Worked Example',
        icon: '📝',
        mount(host, data, ctx) {
          render(host, data, {
            onComplete() {
              try { ctx?.complete?.(); } catch(_){}
            }
          });
        }
      });
    }
    autoInject();
  });
})(window);
