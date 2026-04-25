/**
 * PEP Lesson Player — gamified chapter shell.
 *
 * Threads activities together: intro → stepper example → mini-game → check → boss quiz.
 * Driven by data in chapter.lessons[] from the question bank.
 *
 * Activity types:
 *   { type: "intro",   text, image?, xp }
 *   { type: "stepper", data, xp }                                  -- delegates to PEPStepper
 *   { type: "game",    module: "fraction-builder", data, xp }      -- looks up via PEP.getGame()
 *   { type: "diagram", name: "water-cycle", props, xp }            -- mounts a diagram
 *   { type: "check",   count: 3, xp }                               -- 3 quick MCQs from chapter.mcq
 *   { type: "boss" }                                                -- delegates to PEPQuiz.renderQuiz
 */
(function (global) {

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function chapterTitle(chapterId, data) {
    if (data && data.title) return data.title;
    return chapterId;
  }

  // ----------------------------------------------------------------
  // Wrap legacy prose into a "Deep Dive" expander
  // ----------------------------------------------------------------
  function wrapDeepDive(chapterEl, lessonEl) {
    if (chapterEl.querySelector('.pep-deep-dive')) return;
    // Move every sibling that comes AFTER lessonEl into a <details>.
    const tail = [];
    let n = lessonEl.nextSibling;
    while (n) {
      const next = n.nextSibling;
      // Skip the auto-injected helpers if any
      if (n.nodeType === 1 && (n.classList.contains('pep-quiz-host') ||
                                n.classList.contains('pep-flash-host') ||
                                n.classList.contains('pep-match-host'))) {
        n = next; continue;
      }
      tail.push(n);
      n = next;
    }
    if (!tail.length) return;
    const det = document.createElement('details');
    det.className = 'pep-deep-dive';
    const sum = document.createElement('summary');
    sum.innerHTML = '📖 Deep Dive Reading <span class="pep-deep-dive__hint">(optional, but full of great info!)</span>';
    det.appendChild(sum);
    const inner = document.createElement('div');
    inner.className = 'pep-deep-dive__inner';
    tail.forEach(node => inner.appendChild(node));
    det.appendChild(inner);
    chapterEl.appendChild(det);
  }

  // ----------------------------------------------------------------
  // Default lesson generator (when chapter.lessons is missing)
  // ----------------------------------------------------------------
  function defaultLessons(chapterId, data) {
    if (!data) return [{ type: 'intro', text: 'New activities coming soon!', xp: 5 }];
    const lessons = [];
    const subject = chapterId.split('-')[1];
    const topic = (data.title || '').toLowerCase();
    const hook = data.meta?.hook || pickHook(subject, topic, data.title);

    lessons.push({ type:'intro', text: hook, xp: 5 });

    // Subject-default activity heuristic
    if (subject === 'mat') {
      const stepper = pickMathStepper(topic);
      if (stepper) lessons.push({ type:'stepper', data: stepper, xp: 10 });
    } else if (subject === 'sci' || subject === 'soc') {
      // Diagram-friendly lessons
      const diag = pickDiagram(topic);
      if (diag) lessons.push({ type:'diagram', name: diag.name, props: diag.props, xp: 5 });
    }

    // Always have a mini-game pulled from existing data
    if (data.match && data.match.pairs && data.match.pairs.length >= 4) {
      lessons.push({
        type:'game',
        module: 'definition-match-speed',
        data: { pairs: data.match.pairs.slice(0, 6), seconds: 60 },
        xp: 10
      });
    } else if (data.flashcards && data.flashcards.length >= 3) {
      lessons.push({
        type:'game',
        module: 'flashcards',
        data,
        xp: 8
      });
    }

    // Quick check: 3 MCQs
    if (data.mcq && data.mcq.length >= 3) {
      lessons.push({ type:'check', count: 3, xp: 10 });
    }

    // Boss quiz at the end
    lessons.push({ type:'boss' });
    return lessons;
  }

  function pickHook(subject, topic, title) {
    if (subject === 'mat') return `Time to play with numbers! ${title}`;
    if (subject === 'sci') return `Let's explore: ${title}`;
    if (subject === 'soc') return `A story from our world: ${title}`;
    if (subject === 'lan') return `Words are powerful! ${title}`;
    if (subject === 'tech') return `Build something cool: ${title}`;
    return title;
  }

  function pickMathStepper(topic) {
    if (/place value/.test(topic)) return { auto: { kind:'place-value', number: 374562 } };
    if (/round/.test(topic)) return { auto: { kind:'rounding-line', n: 67, place:'tens' } };
    if (/(divid|division)/.test(topic)) return { auto: { kind:'long-division', dividend: 84, divisor: 7 } };
    if (/(multipl|times)/.test(topic)) return { auto: { kind:'multiplication-area', w: 6, h: 7 } };
    if (/equivalent/.test(topic) && /fraction/.test(topic)) return { auto: { kind:'equivalent-fractions', a:[1,2], k:2 } };
    if (/fraction/.test(topic)) return { auto: { kind:'fraction-add', a:[1,3], b:[1,4] } };
    if (/decimal/.test(topic)) return { auto: { kind:'decimal-place', n: 3.45 } };
    if (/percent/.test(topic)) return { auto: { kind:'percent-bar', pct: 25 } };
    if (/(prime|factor)/.test(topic)) return { auto: { kind:'factor-tree', number: 36 } };
    if (/equation|algebra|variable/.test(topic)) return { auto: { kind:'equation-balance', a:5, b:12 } };
    if (/perimeter|area/.test(topic)) return { auto: { kind:'perimeter-walk', w:4, h:3 } };
    return null;
  }

  function pickDiagram(topic) {
    if (/parish|jamaica|map/.test(topic)) return { name:'jamaica-parishes', props:{} };
    if (/water|cycle|weather/.test(topic)) return { name:'water-cycle', props:{} };
    if (/plant/.test(topic)) return { name:'plant-cell', props:{} };
    if (/cell/.test(topic)) return { name:'plant-cell', props:{} };
    if (/circuit|electric/.test(topic)) return { name:'circuit', props:{} };
    if (/computer|cpu|hardware/.test(topic)) return { name:'computer-system', props:{} };
    if (/html|web/.test(topic)) return { name:'html-tag-tree', props:{} };
    if (/(food|chain|web)/.test(topic)) return { name:'food-web', props:{} };
    if (/life cycle/.test(topic)) return { name:'life-cycle', props:{} };
    if (/body|system|organ/.test(topic)) return { name:'body-system', props:{} };
    if (/caribbean|geograph/.test(topic)) return { name:'caribbean-map', props:{} };
    return null;
  }

  // ----------------------------------------------------------------
  // Player UI
  // ----------------------------------------------------------------
  function buildShell(host, lessons, ctx) {
    host.innerHTML = '';
    host.classList.add('pep-lesson');

    const header = document.createElement('div');
    header.className = 'pep-lesson__header';
    header.innerHTML = `
      <div class="pep-lesson__title">
        <span class="pep-lesson__icon">${ctx.icon || '🎮'}</span>
        <span class="pep-lesson__title-text">${escapeHTML(ctx.title || 'Adventure Time!')}</span>
      </div>
      <div class="pep-lesson__rail">
        ${lessons.map((_, i) => `<span class="pep-lesson__dot" data-step="${i}"></span>`).join('')}
      </div>
    `;
    host.appendChild(header);

    const stage = document.createElement('div');
    stage.className = 'pep-lesson__stage';
    host.appendChild(stage);

    const nav = document.createElement('div');
    nav.className = 'pep-lesson__nav';
    nav.innerHTML = `
      <button class="pep-lesson__btn pep-lesson__btn--ghost" data-act="back">◀ Back</button>
      <span class="pep-lesson__step-label">Activity 1 / ${lessons.length}</span>
      <button class="pep-lesson__btn pep-lesson__btn--primary" data-act="next">Continue ▶</button>
    `;
    host.appendChild(nav);

    return { stage, nav, header };
  }

  function renderLesson(host, chapterId, data) {
    const lessons = (data && data.lessons && data.lessons.length)
      ? data.lessons
      : defaultLessons(chapterId, data);

    const ctx = {
      title: chapterTitle(chapterId, data),
      icon:  data?.meta?.icon || '🎮',
      mascot: data?.meta?.mascot || '🦜'
    };
    const ui = buildShell(host, lessons, ctx);

    let i = 0;
    let activityComplete = false;

    function update() {
      const dots = ui.header.querySelectorAll('.pep-lesson__dot');
      dots.forEach((d, idx) => d.classList.toggle('is-on', idx <= i));
      ui.nav.querySelector('.pep-lesson__step-label').textContent = `Activity ${i+1} / ${lessons.length}`;
      ui.nav.querySelector('[data-act="back"]').disabled = i === 0;
    }

    function mountActivity(act) {
      ui.stage.innerHTML = '';
      activityComplete = false;
      const card = document.createElement('div');
      card.className = 'pep-lesson__activity';
      ui.stage.appendChild(card);
      requestAnimationFrame(() => card.classList.add('is-shown'));

      const subCtx = {
        chapterId,
        awardXP(n, opts) { try { global.PEP?.awardXP(n, { silent: true, ...(opts||{}) }); } catch(_){} },
        complete() { activityComplete = true; ui.nav.querySelector('[data-act="next"]').classList.add('is-ready'); },
        fail()     { /* never block forward — encourage retry inside the game */ },
        speak: (t) => global.PEPAudio?.speak(t),
        sound: (k) => global.PEPAudio?.sfx(k)
      };

      switch (act.type) {
        case 'intro':
          renderIntro(card, act, subCtx);
          break;
        case 'stepper': {
          const data = act.data;
          if (global.PEPStepper) {
            global.PEPStepper.render(card, data, { onComplete: subCtx.complete });
          } else {
            card.innerHTML = '<p>Stepper not loaded.</p>';
            subCtx.complete();
          }
          break;
        }
        case 'game': {
          const mod = global.PEP?.getGame?.(act.module);
          if (mod && typeof mod.mount === 'function') {
            try { mod.mount(card, act.data || {}, subCtx); }
            catch (e) {
              console.warn('Game mount failed:', act.module, e);
              card.innerHTML = `<div class="pep-lesson__fallback"><p>This game (<code>${escapeHTML(act.module)}</code>) failed to start.</p><button class="pep-lesson__btn">Skip</button></div>`;
              card.querySelector('button').addEventListener('click', subCtx.complete);
            }
          } else {
            card.innerHTML = `<div class="pep-lesson__fallback">
              <h3>🎮 ${escapeHTML(act.module || 'Game')}</h3>
              <p>This mini-game is coming soon. Tap continue to skip.</p>
            </div>`;
            subCtx.complete();
          }
          break;
        }
        case 'diagram': {
          if (global.PEPDiagrams && global.PEPDiagrams.has(act.name)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'pep-lesson__diagram';
            card.appendChild(wrapper);
            global.PEPDiagrams.render(act.name, wrapper, act.props || {});
            const note = document.createElement('p');
            note.className = 'pep-lesson__diagram-note';
            note.textContent = act.caption || 'Take a good look! Click Continue when ready.';
            card.appendChild(note);
            subCtx.complete();
          } else {
            card.innerHTML = `<div class="pep-lesson__fallback"><p>Diagram <code>${escapeHTML(act.name)}</code> coming soon.</p></div>`;
            subCtx.complete();
          }
          break;
        }
        case 'check': {
          renderCheck(card, data, act, subCtx);
          break;
        }
        case 'boss': {
          renderBoss(card, chapterId, data, subCtx);
          break;
        }
        default:
          card.innerHTML = `<p>Unknown activity type: ${escapeHTML(String(act.type))}</p>`;
          subCtx.complete();
      }

      // XP reward when activity completes
      if (typeof act.xp === 'number' && act.xp > 0) {
        // Hook into completion via subCtx wrapper — XP awarded once per activity advance.
        const origComplete = subCtx.complete;
        subCtx.complete = function() {
          if (!activityComplete) {
            try { global.PEP?.awardXP(act.xp, { silent: true }); } catch(_){}
          }
          origComplete();
        };
      }
    }

    function renderIntro(card, act, subCtx) {
      card.innerHTML = `
        <div class="pep-lesson__intro">
          <div class="pep-lesson__intro-icon">${act.icon || ctx.mascot || '🦜'}</div>
          <p class="pep-lesson__intro-text">${escapeHTML(act.text || '')}</p>
          <button class="pep-lesson__btn pep-lesson__btn--primary pep-lesson__intro-btn">Let's go! 🚀</button>
        </div>
      `;
      try { global.PEPAudio?.speak(act.text); } catch(_){}
      card.querySelector('.pep-lesson__intro-btn').addEventListener('click', () => {
        subCtx.complete();
        next();
      });
    }

    function renderCheck(card, data, act, subCtx) {
      if (!data || !data.mcq || !data.mcq.length) {
        card.innerHTML = '<p>No quick-check questions yet.</p>';
        return subCtx.complete();
      }
      const count = Math.min(act.count || 3, data.mcq.length);
      const qs = shuffle(data.mcq).slice(0, count);
      let qi = 0, correct = 0;
      const wrap = document.createElement('div');
      wrap.className = 'pep-lesson__check';
      card.appendChild(wrap);

      function showQ() {
        const q = qs[qi];
        const choices = shuffle(q.choices.map((c, i) => ({ text: c, orig: i })));
        wrap.innerHTML = `
          <div class="pep-lesson__check-head">⚡ Quick Check ${qi+1} / ${qs.length}</div>
          <div class="pep-lesson__check-q">${escapeHTML(q.q)}</div>
          <div class="pep-lesson__check-opts">
            ${choices.map(c => `<button class="pep-lesson__btn pep-lesson__btn--opt" data-orig="${c.orig}">${escapeHTML(c.text)}</button>`).join('')}
          </div>
          <div class="pep-lesson__check-fb"></div>
        `;
        wrap.querySelectorAll('.pep-lesson__btn--opt').forEach(b => {
          b.addEventListener('click', () => {
            wrap.querySelectorAll('.pep-lesson__btn--opt').forEach(x => {
              x.disabled = true;
              if (+x.dataset.orig === q.correct) x.classList.add('is-correct');
              else if (x === b) x.classList.add('is-wrong');
            });
            const ok = +b.dataset.orig === q.correct;
            if (ok) correct++;
            wrap.querySelector('.pep-lesson__check-fb').innerHTML = ok
              ? `✅ <strong>Yes!</strong> ${escapeHTML(q.explain || '')}`
              : `💡 ${escapeHTML(q.explain || 'The right answer is highlighted.')}`;
            try { global.PEPAudio?.sfx(ok ? 'correct' : 'wrong'); } catch(_){}
            setTimeout(() => {
              qi++;
              if (qi < qs.length) showQ();
              else {
                wrap.innerHTML = `<div class="pep-lesson__check-done">You got <strong>${correct} / ${qs.length}</strong>! ${correct === qs.length ? '🎉' : '💪'}</div>`;
                subCtx.complete();
              }
            }, 1100);
          });
        });
      }
      showQ();
    }

    function renderBoss(card, chapterId, data, subCtx) {
      if (!global.PEPQuiz) {
        card.innerHTML = '<p>Boss quiz unavailable.</p>';
        return subCtx.complete();
      }
      const banner = document.createElement('div');
      banner.className = 'pep-lesson__boss-banner';
      banner.innerHTML = `<span class="pep-lesson__boss-icon">🏆</span> <strong>Boss Quiz!</strong> Show what you've learned!`;
      card.appendChild(banner);
      const inner = document.createElement('div');
      card.appendChild(inner);
      global.PEPQuiz.renderQuiz(inner, chapterId, data);
      subCtx.complete();
    }

    function next() {
      if (i >= lessons.length - 1) {
        return; // already at end
      }
      i++;
      mountActivity(lessons[i]);
      update();
      try { global.PEPAudio?.sfx('swoosh'); } catch(_){}
    }

    function back() {
      if (i <= 0) return;
      i--;
      mountActivity(lessons[i]);
      update();
    }

    ui.nav.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      try { global.PEPAudio?.sfx('click'); } catch(_){}
      if (b.dataset.act === 'next') next();
      if (b.dataset.act === 'back') back();
    });

    mountActivity(lessons[0]);
    update();
  }

  async function autoInject() {
    if (!global.PEPQuiz || !global.PEPQuiz.loadBank) return;
    const els = document.querySelectorAll('.pep-lesson[data-chapter]');
    if (!els.length) return;
    const bank = await global.PEPQuiz.loadBank();
    els.forEach(el => {
      const chapterId = el.dataset.chapter;
      const data = bank[chapterId];
      const chapterEl = el.closest('.chapter-content');
      if (chapterEl) wrapDeepDive(chapterEl, el);
      renderLesson(el, chapterId, data);
    });
  }

  global.PEPLesson = { render: renderLesson, autoInject, defaultLessons };

  // Run BEFORE quiz-engine's auto-inject (which runs at DOMContentLoaded + 120ms).
  // The quiz-engine now skips chapters containing .pep-lesson, so the order avoids duplication.
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoInject, 60);
  });
})(window);
