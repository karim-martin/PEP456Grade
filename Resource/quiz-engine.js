/**
 * PEP Quiz Engine
 *
 * Two ways to use:
 *  1. Auto-injection: the engine scans every .chapter-content it can find
 *     (by convention: id="science-chapter-1"), infers a chapter id, and
 *     looks up questions from the JSON bank for the current page.
 *  2. Explicit: add <div class="pep-quiz" data-chapter-id="g4-sci-plants"></div>
 *
 * The page must expose a `window.PEP_PAGE` with { grade: 'g4'|'g5'|'g6'|'tech', bank: 'grade4.json', ... }.
 * If absent, the engine infers from the filename.
 *
 * Question JSON shape per chapter:
 * {
 *   "g4-sci-1": {
 *     "title": "Exploring Science",
 *     "mcq":  [ { "q":"...","choices":["a","b","c","d"],"correct":0,"explain":"..."} ],
 *     "flashcards": [ {"front":"...","back":"..."} ],
 *     "match": { "pairs": [["term","definition"], ...] }
 *   }
 * }
 */
(function (global) {
  const SUBJECT_MAP = { science: 'sci', social: 'soc', math: 'mat', language: 'lan', tech: 'tech', technology: 'tech' };

  function inferPageMeta() {
    const path = location.pathname.toLowerCase();
    let grade = null, bank = null;
    if (/grade4/.test(path)) { grade = 'g4'; bank = 'Resource/questions/grade4.json'; }
    else if (/grade5/.test(path)) { grade = 'g5'; bank = 'Resource/questions/grade5.json'; }
    else if (/grade6/.test(path)) { grade = 'g6'; bank = 'Resource/questions/grade6.json'; }
    else if (/technology/.test(path)) { grade = 'tech'; bank = 'Resource/questions/technology.json'; }
    return { grade, bank };
  }

  function getPageMeta() {
    if (global.PEP_PAGE && global.PEP_PAGE.grade) return global.PEP_PAGE;
    return inferPageMeta();
  }

  let _bankCache = null;
  async function loadBank() {
    if (_bankCache) return _bankCache;
    const meta = getPageMeta();
    if (!meta.bank) return {};
    try {
      const res = await fetch(meta.bank, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch ' + meta.bank);
      _bankCache = await res.json();
      return _bankCache;
    } catch (e) {
      console.warn('quiz-engine: could not load bank', e);
      _bankCache = {};
      return _bankCache;
    }
  }

  function chapterIdFromDom(el) {
    // DOM id is like "science-chapter-3" -> produce "g4-sci-3"
    const meta = getPageMeta();
    if (!meta.grade) return null;
    const id = el.id || '';
    const m = id.match(/^(\w+)-chapter-(\d+)$/);
    if (!m) return null;
    const subj = SUBJECT_MAP[m[1]];
    if (!subj) return null;
    return `${meta.grade}-${subj}-${m[2]}`;
  }

  // ============================================================
  // QUIZ RENDERING
  // ============================================================

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderQuiz(host, chapterId, data) {
    const questions = (data && data.mcq) ? shuffle(data.mcq).slice(0, Math.min(20, data.mcq.length)) : [];
    if (questions.length === 0) {
      host.innerHTML = `<div class="pep-quiz">
        <div class="pep-quiz__title">🎯 Quick Quiz</div>
        <p class="pep-quiz__subtitle">Quiz questions for this chapter are coming soon!</p>
      </div>`;
      return;
    }

    host.innerHTML = `
      <div class="pep-quiz">
        <div class="pep-quiz__title">🎯 Quick Quiz: ${escapeHTML(data.title || '')}</div>
        <div class="pep-quiz__subtitle">Answer ${questions.length} questions to earn XP. Click an answer to reveal the explanation.</div>
        <div class="pep-quiz__progress"><div class="pep-quiz__progress-fill" style="width:0%"></div></div>
        <div class="pep-quiz__body"></div>
        <div class="pep-quiz__controls">
          <span class="pep-quiz__score">Score: <span class="pep-quiz__score-val">0</span> / ${questions.length}</span>
          <button class="pep-btn-ghost pep-quiz__next" type="button" disabled>Next ▶</button>
        </div>
      </div>`;

    const body = host.querySelector('.pep-quiz__body');
    const progFill = host.querySelector('.pep-quiz__progress-fill');
    const scoreEl = host.querySelector('.pep-quiz__score-val');
    const nextBtn = host.querySelector('.pep-quiz__next');

    let idx = 0, score = 0, answered = false;
    const startTime = Date.now();

    function showQ() {
      answered = false;
      nextBtn.disabled = true;
      const q = questions[idx];
      const choices = q.choices.map((c, i) => ({ text: c, origIdx: i }));
      const shuffledChoices = shuffle(choices);
      body.innerHTML = `
        <div class="pep-quiz__q">Q${idx + 1}. ${escapeHTML(q.q)}</div>
        <div class="pep-quiz__options">
          ${shuffledChoices.map((c, i) => `
            <button class="pep-quiz__opt" data-orig="${c.origIdx}" type="button">${escapeHTML(c.text)}</button>
          `).join('')}
        </div>
        <div class="pep-quiz__feedback"></div>
      `;
      body.querySelectorAll('.pep-quiz__opt').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(btn, q));
      });
      progFill.style.width = `${(idx / questions.length) * 100}%`;
    }

    function handleAnswer(btn, q) {
      if (answered) return;
      answered = true;
      const pickedOrig = +btn.dataset.orig;
      const correct = pickedOrig === q.correct;
      body.querySelectorAll('.pep-quiz__opt').forEach(b => {
        b.disabled = true;
        const o = +b.dataset.orig;
        if (o === q.correct) b.classList.add('is-correct');
        else if (b === btn) b.classList.add('is-wrong');
      });
      const fb = body.querySelector('.pep-quiz__feedback');
      if (correct) {
        score++;
        scoreEl.textContent = String(score);
        fb.className = 'pep-quiz__feedback is-correct';
        fb.innerHTML = `✅ <strong>Correct!</strong> ${escapeHTML(q.explain || '')}`;
        if (global.PEP) PEP.playSound('correct');
      } else {
        fb.className = 'pep-quiz__feedback is-wrong';
        fb.innerHTML = `❌ <strong>Not quite.</strong> ${escapeHTML(q.explain || 'The highlighted answer is correct.')}`;
        if (global.PEP) PEP.playSound('wrong');
      }
      nextBtn.disabled = false;
      nextBtn.textContent = (idx + 1 >= questions.length) ? 'Finish 🏁' : 'Next ▶';
    }

    function finish() {
      const pct = Math.round((score / questions.length) * 100);
      const seconds = Math.round((Date.now() - startTime) / 1000);
      const perfect = score === questions.length;
      const xp = score * 10 + (perfect ? 50 : 0) + (score === questions.length ? 50 : 0);
      progFill.style.width = '100%';
      body.innerHTML = `
        <div class="pep-quiz__result">
          <div class="pep-quiz__result-score">${pct}%</div>
          <div class="pep-quiz__result-label">${score} of ${questions.length} correct · ${seconds}s</div>
          <div class="pep-quiz__result-msg">${encouragement(pct, perfect)}</div>
          <div>
            <button class="pep-btn-primary pep-quiz__retry" type="button">🔁 Try Again</button>
          </div>
        </div>`;
      host.querySelector('.pep-quiz__score').textContent = `+${xp} XP earned`;
      nextBtn.style.display = 'none';
      body.querySelector('.pep-quiz__retry').addEventListener('click', () => {
        nextBtn.style.display = '';
        idx = 0; score = 0; scoreEl.textContent = '0';
        showQ();
      });
      if (global.PEP) {
        PEP.awardXP(xp, { chapterId, score: pct, perfect });
      }
    }

    nextBtn.addEventListener('click', () => {
      idx++;
      if (idx >= questions.length) finish();
      else showQ();
    });

    showQ();
  }

  function encouragement(pct, perfect) {
    if (perfect) return 'Perfect score! You are a superstar. 🌟';
    if (pct >= 80) return 'Excellent work! You really know this topic. 👏';
    if (pct >= 60) return 'Good job! Review the tricky ones and try again. 💪';
    if (pct >= 40) return 'You are learning! Read the chapter again and give it another go. 📖';
    return 'Don\'t give up! Re-read the chapter and keep practicing. 🔄';
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ============================================================
  // AUTO-INJECTION
  // ============================================================

  async function autoInject() {
    const meta = getPageMeta();
    if (!meta.grade) return;
    const bank = await loadBank();
    document.querySelectorAll('.chapter-content').forEach(ch => {
      const chapterId = chapterIdFromDom(ch);
      if (!chapterId) return;
      if (ch.querySelector('.pep-quiz-host')) return;
      // Skip auto-injection if a lesson player owns this chapter — it manages its own quiz/flashcards/matching.
      if (ch.querySelector('.pep-lesson')) return;
      const data = bank[chapterId];
      const hostDiv = document.createElement('div');
      hostDiv.className = 'pep-quiz-host';
      hostDiv.dataset.chapterId = chapterId;
      ch.appendChild(hostDiv);
      renderQuiz(hostDiv, chapterId, data);

      // Also render flashcards if data available and engine loaded
      if (global.PEPFlashcards && data && data.flashcards && data.flashcards.length) {
        const fhost = document.createElement('div');
        fhost.className = 'pep-flash-host';
        fhost.dataset.chapterId = chapterId;
        ch.appendChild(fhost);
        global.PEPFlashcards.render(fhost, chapterId, data);
      }

      // Also render matching game if data available and engine loaded
      if (global.PEPMatching && data && data.match && data.match.pairs && data.match.pairs.length >= 3) {
        const mhost = document.createElement('div');
        mhost.className = 'pep-match-host';
        mhost.dataset.chapterId = chapterId;
        ch.appendChild(mhost);
        global.PEPMatching.render(mhost, chapterId, data);
      }
    });

    // Explicit containers (data-chapter-id)
    document.querySelectorAll('.pep-quiz[data-chapter-id]').forEach(host => {
      const chapterId = host.dataset.chapterId;
      renderQuiz(host, chapterId, bank[chapterId]);
    });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  global.PEPQuiz = {
    loadBank,
    renderQuiz,
    autoInject,
    getPageMeta,
    chapterIdFromDom
  };

  // Auto-run after a brief delay so other engines register
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoInject, 120);
  });
})(window);
