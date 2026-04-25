/**
 * PEP Study Guide — Gamification Engine
 *
 * Persists learner progress in localStorage under a single key.
 * Schema:
 * {
 *   name: "Kai",
 *   xp: 420,
 *   level: 3,
 *   streak: { count: 4, lastDate: "2026-04-19" },
 *   completed: { "g4-sci-1": { best: 80, attempts: 2 }, ... },
 *   badges: ["first-quiz", "math-whiz-g4", ...],
 *   perfectScores: 3,
 *   settings: { dark: false, muted: false },
 *   activity: [ { date: "2026-04-19", xp: 50 }, ... ]   // rolling 30 days
 * }
 */
(function (global) {
  const STORAGE_KEY = 'pep_progress_v1';
  const MAX_ACTIVITY_DAYS = 30;

  const DEFAULT_STATE = {
    name: '',
    xp: 0,
    level: 1,
    streak: { count: 0, lastDate: null },
    completed: {},
    badges: [],
    perfectScores: 0,
    settings: { dark: false, muted: false },
    activity: []
  };

  const BADGES = {
    'first-quiz':       { label: 'First Quiz!',       icon: '🎯', desc: 'Completed your first quiz' },
    'perfectionist':    { label: 'Perfectionist',     icon: '💯', desc: 'Got 10 perfect scores' },
    'on-fire-3':        { label: 'On Fire',           icon: '🔥', desc: '3-day learning streak' },
    'on-fire-7':        { label: 'Unstoppable',       icon: '🚀', desc: '7-day learning streak' },
    'on-fire-14':       { label: 'Study Legend',      icon: '👑', desc: '14-day learning streak' },
    'xp-100':           { label: 'Rising Star',       icon: '⭐', desc: 'Earned 100 XP' },
    'xp-500':           { label: 'Super Learner',     icon: '🌟', desc: 'Earned 500 XP' },
    'xp-1000':          { label: 'Knowledge Champion',icon: '🏆', desc: 'Earned 1000 XP' },
    'math-whiz-g4':     { label: 'Math Whiz (G4)',    icon: '📐', desc: 'All Grade 4 math chapters' },
    'scientist-g4':     { label: 'Scientist (G4)',    icon: '🔬', desc: 'All Grade 4 science chapters' },
    'bookworm-g4':      { label: 'Bookworm (G4)',     icon: '📚', desc: 'All Grade 4 language chapters' },
    'historian-g4':     { label: 'Historian (G4)',    icon: '🏛️', desc: 'All Grade 4 social studies' },
    'math-whiz-g5':     { label: 'Math Whiz (G5)',    icon: '📐', desc: 'All Grade 5 math chapters' },
    'scientist-g5':     { label: 'Scientist (G5)',    icon: '🔬', desc: 'All Grade 5 science chapters' },
    'bookworm-g5':      { label: 'Bookworm (G5)',     icon: '📚', desc: 'All Grade 5 language chapters' },
    'historian-g5':     { label: 'Historian (G5)',    icon: '🏛️', desc: 'All Grade 5 social studies' },
    'math-whiz-g6':     { label: 'Math Whiz (G6)',    icon: '📐', desc: 'All Grade 6 math chapters' },
    'scientist-g6':     { label: 'Scientist (G6)',    icon: '🔬', desc: 'All Grade 6 science chapters' },
    'bookworm-g6':      { label: 'Bookworm (G6)',     icon: '📚', desc: 'All Grade 6 language chapters' },
    'historian-g6':     { label: 'Historian (G6)',    icon: '🏛️', desc: 'All Grade 6 social studies' },
    'tech-wizard':      { label: 'Tech Wizard',       icon: '💻', desc: 'All technology chapters' },
    'graduate-g4':      { label: 'Grade 4 Graduate',  icon: '🎓', desc: 'All Grade 4 chapters complete' },
    'graduate-g5':      { label: 'Grade 5 Graduate',  icon: '🎓', desc: 'All Grade 5 chapters complete' },
    'graduate-g6':      { label: 'Grade 6 Graduate',  icon: '🎓', desc: 'All Grade 6 chapters complete' },
    'speed-demon':      { label: 'Speed Demon',       icon: '⚡', desc: 'Top score in a timed drill' },
    'memory-master':    { label: 'Memory Master',     icon: '🧠', desc: 'Won the memory game' },
    'match-maker':      { label: 'Match Maker',       icon: '🔗', desc: 'Won a matching round' },
    'flashcard-fan':    { label: 'Flashcard Fan',     icon: '🗂️', desc: 'Viewed 10 flashcard decks' }
  };

  // Totals for "graduate" badges — keep in sync with HTML chapter counts.
  const CHAPTER_COUNTS = {
    g4: { sci: 12, soc: 10, mat: 11, lan: 12 },
    g5: { sci: 8,  soc: 12, mat: 13, lan: 10 },
    g6: { sci: 8,  soc: 4,  mat: 10, lan: 8  },
    tech: { tech: 12 }
  };

  const SUBJECT_BADGE_MAP = {
    'g4-mat': 'math-whiz-g4', 'g4-sci': 'scientist-g4', 'g4-lan': 'bookworm-g4', 'g4-soc': 'historian-g4',
    'g5-mat': 'math-whiz-g5', 'g5-sci': 'scientist-g5', 'g5-lan': 'bookworm-g5', 'g5-soc': 'historian-g5',
    'g6-mat': 'math-whiz-g6', 'g6-sci': 'scientist-g6', 'g6-lan': 'bookworm-g6', 'g6-soc': 'historian-g6',
    'tech-tech': 'tech-wizard'
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed,
        streak:   { ...DEFAULT_STATE.streak,   ...(parsed.streak   || {}) },
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        completed: parsed.completed || {},
        badges:    parsed.badges    || [],
        activity:  parsed.activity  || []
      };
    } catch (e) {
      console.warn('gamification: failed to load state', e);
      return { ...DEFAULT_STATE };
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('gamification: failed to save state', e);
    }
  }

  function xpForLevel(level) {
    // Level 1 -> 0 XP, each subsequent level costs 100 more than previous.
    // L2=100, L3=250, L4=450, L5=700, L6=1000...
    return Math.round(50 * level * (level - 1));
  }

  function levelFromXP(xp) {
    let lvl = 1;
    while (xpForLevel(lvl + 1) <= xp) lvl++;
    return lvl;
  }

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function daysBetween(a, b) {
    const msPerDay = 86400000;
    return Math.round((new Date(b) - new Date(a)) / msPerDay);
  }

  function updateStreak(state) {
    const today = todayISO();
    if (!state.streak.lastDate) {
      state.streak = { count: 1, lastDate: today };
    } else if (state.streak.lastDate === today) {
      // same day — no change
    } else {
      const gap = daysBetween(state.streak.lastDate, today);
      state.streak.count = gap === 1 ? state.streak.count + 1 : 1;
      state.streak.lastDate = today;
    }
  }

  function logActivity(state, xp) {
    const today = todayISO();
    let entry = state.activity.find(a => a.date === today);
    if (!entry) {
      entry = { date: today, xp: 0 };
      state.activity.push(entry);
    }
    entry.xp += xp;
    // trim to 30 days
    if (state.activity.length > MAX_ACTIVITY_DAYS) {
      state.activity = state.activity.slice(-MAX_ACTIVITY_DAYS);
    }
  }

  function awardBadge(state, id) {
    if (!state.badges.includes(id) && BADGES[id]) {
      state.badges.push(id);
      return true;
    }
    return false;
  }

  function checkMilestoneBadges(state, newlyEarned) {
    if (state.xp >= 100 && awardBadge(state, 'xp-100')) newlyEarned.push('xp-100');
    if (state.xp >= 500 && awardBadge(state, 'xp-500')) newlyEarned.push('xp-500');
    if (state.xp >= 1000 && awardBadge(state, 'xp-1000')) newlyEarned.push('xp-1000');
    if (state.streak.count >= 3  && awardBadge(state, 'on-fire-3'))  newlyEarned.push('on-fire-3');
    if (state.streak.count >= 7  && awardBadge(state, 'on-fire-7'))  newlyEarned.push('on-fire-7');
    if (state.streak.count >= 14 && awardBadge(state, 'on-fire-14')) newlyEarned.push('on-fire-14');
    if (state.perfectScores >= 10 && awardBadge(state, 'perfectionist')) newlyEarned.push('perfectionist');
  }

  function checkSubjectBadges(state, chapterId, newlyEarned) {
    // chapterId format: "g4-sci-1", "g5-mat-3", "tech-tech-2"
    const parts = chapterId.split('-');
    if (parts.length < 3) return;
    const grade = parts[0];
    const subj  = parts[1];
    const prefix = `${grade}-${subj}`;
    const total = (CHAPTER_COUNTS[grade] || {})[subj];
    if (!total) return;
    const completed = Object.keys(state.completed).filter(k => k.startsWith(prefix + '-')).length;
    if (completed >= total) {
      const badgeId = SUBJECT_BADGE_MAP[prefix];
      if (badgeId && awardBadge(state, badgeId)) newlyEarned.push(badgeId);
    }
    // grade-wide graduate badge
    if (['g4','g5','g6'].includes(grade)) {
      const gradeTotal = Object.values(CHAPTER_COUNTS[grade] || {}).reduce((a,b)=>a+b,0);
      const gradeDone = Object.keys(state.completed).filter(k => k.startsWith(grade + '-')).length;
      if (gradeTotal > 0 && gradeDone >= gradeTotal) {
        const badgeId = `graduate-${grade}`;
        if (awardBadge(state, badgeId)) newlyEarned.push(badgeId);
      }
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  const G = {
    STORAGE_KEY,
    BADGES,
    CHAPTER_COUNTS,

    getState() { return load(); },

    resetAll() {
      localStorage.removeItem(STORAGE_KEY);
      document.dispatchEvent(new CustomEvent('pep:state-changed'));
    },

    setName(name) {
      const s = load();
      s.name = (name || '').trim().slice(0, 30);
      save(s);
      document.dispatchEvent(new CustomEvent('pep:state-changed'));
      return s;
    },

    toggleDark() {
      const s = load();
      s.settings.dark = !s.settings.dark;
      save(s);
      applyDarkMode(s.settings.dark);
      document.dispatchEvent(new CustomEvent('pep:state-changed'));
      return s.settings.dark;
    },

    toggleMute() {
      const s = load();
      s.settings.muted = !s.settings.muted;
      save(s);
      document.dispatchEvent(new CustomEvent('pep:state-changed'));
      return s.settings.muted;
    },

    /**
     * Award XP for an activity. Optional chapterId to track completion.
     * @param {number} xp
     * @param {object} opts { chapterId, score (0-100), perfect, silent }
     * @returns {object} { xp, level, leveledUp, newBadges }
     */
    awardXP(xp, opts = {}) {
      const s = load();
      const prevLevel = levelFromXP(s.xp);
      s.xp += Math.max(0, xp | 0);
      const newLevel = levelFromXP(s.xp);
      s.level = newLevel;
      const leveledUp = newLevel > prevLevel;

      updateStreak(s);
      logActivity(s, xp);

      const newBadges = [];

      if (opts.chapterId) {
        const prev = s.completed[opts.chapterId] || { best: 0, attempts: 0 };
        prev.attempts += 1;
        if (typeof opts.score === 'number') {
          prev.best = Math.max(prev.best, opts.score);
        }
        s.completed[opts.chapterId] = prev;

        if (s.badges.length === 0 || !s.badges.includes('first-quiz')) {
          if (awardBadge(s, 'first-quiz')) newBadges.push('first-quiz');
        }

        if (opts.perfect) {
          s.perfectScores = (s.perfectScores || 0) + 1;
        }

        checkSubjectBadges(s, opts.chapterId, newBadges);
      }

      checkMilestoneBadges(s, newBadges);

      save(s);
      document.dispatchEvent(new CustomEvent('pep:state-changed', {
        detail: { xp: s.xp, leveledUp, newBadges }
      }));

      if (!opts.silent) {
        if (leveledUp) toastLevelUp(newLevel);
        newBadges.forEach(b => toastBadge(b));
      }
      return { xp: s.xp, level: s.level, leveledUp, newBadges };
    },

    getProgress(chapterId) {
      const s = load();
      return s.completed[chapterId] || null;
    },

    getBadgeInfo(id) { return BADGES[id] || null; },

    getSubjectProgress(grade, subject) {
      const s = load();
      const total = (CHAPTER_COUNTS[grade] || {})[subject] || 0;
      if (!total) return { done: 0, total: 0, pct: 0 };
      const done = Object.keys(s.completed).filter(k => k.startsWith(`${grade}-${subject}-`)).length;
      return { done, total, pct: Math.round((done / total) * 100) };
    },

    xpForNextLevel(xp) {
      const lvl = levelFromXP(xp);
      const curFloor = xpForLevel(lvl);
      const nextFloor = xpForLevel(lvl + 1);
      return { level: lvl, curFloor, nextFloor, progress: xp - curFloor, span: nextFloor - curFloor };
    },

    playSound(kind) {
      const s = load();
      if (s.settings.muted) return;
      // Delegate to PEPAudio if available (richer SFX), fall back to oscillator beep.
      if (global.PEPAudio && typeof global.PEPAudio.sfx === 'function') {
        global.PEPAudio.sfx(kind);
      } else {
        playBeep(kind);
      }
    },

    // ============================================================
    // Game module registry — game modules self-register via PEP.registerGame()
    // and the lesson-player mounts them by name.
    // ============================================================
    registerGame(name, mod) {
      if (!name || !mod || typeof mod.mount !== 'function') {
        console.warn('PEP.registerGame: invalid registration', name);
        return;
      }
      _games[name] = mod;
    },

    getGame(name) { return _games[name] || null; },

    listGames() { return Object.keys(_games); },

    /**
     * Pick the next chapter the learner should tackle.
     * Walks the standard subject order across grades and returns the first
     * not-yet-completed chapterId, e.g. "g4-mat-3".
     */
    suggestNext() {
      const s = load();
      const order = [
        ['g4', ['mat','sci','lan','soc']],
        ['g5', ['mat','sci','lan','soc']],
        ['g6', ['mat','sci','lan','soc']],
        ['tech', ['tech']]
      ];
      for (const [grade, subjects] of order) {
        for (const subj of subjects) {
          const total = (CHAPTER_COUNTS[grade] || {})[subj] || 0;
          for (let i = 1; i <= total; i++) {
            const id = `${grade}-${subj}-${i}`;
            if (!s.completed[id]) return id;
          }
        }
      }
      return null;
    }
  };

  const _games = Object.create(null);

  // ============================================================
  // UI helpers
  // ============================================================

  function applyDarkMode(on) {
    document.documentElement.classList.toggle('pep-dark', !!on);
  }

  function playBeep(kind) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      let freq = 440, dur = 0.12;
      if (kind === 'correct')  { freq = 660; dur = 0.15; }
      if (kind === 'wrong')    { freq = 180; dur = 0.2;  }
      if (kind === 'levelup')  { freq = 880; dur = 0.3;  }
      if (kind === 'badge')    { freq = 990; dur = 0.35; }
      if (kind === 'flip')     { freq = 520; dur = 0.08; }
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch(_) {}
  }

  function ensureToastHost() {
    let host = document.getElementById('pep-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'pep-toast-host';
      host.className = 'pep-toast-host';
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(html, type) {
    const host = ensureToastHost();
    const el = document.createElement('div');
    el.className = `pep-toast pep-toast--${type || 'info'}`;
    el.innerHTML = html;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-shown'));
    setTimeout(() => {
      el.classList.remove('is-shown');
      setTimeout(() => el.remove(), 400);
    }, 4000);
  }

  function toastLevelUp(level) {
    G.playSound('levelup');
    confetti();
    toast(`<span class="pep-toast__icon">🎉</span><span><strong>Level Up!</strong><br>You are now level ${level}</span>`, 'levelup');
  }

  function toastBadge(badgeId) {
    const b = BADGES[badgeId];
    if (!b) return;
    G.playSound('badge');
    confetti();
    toast(`<span class="pep-toast__icon">${b.icon}</span><span><strong>Badge Unlocked!</strong><br>${b.label}</span>`, 'badge');
  }

  function confetti() {
    const host = ensureToastHost();
    const colors = ['#667eea','#764ba2','#f6ad55','#48bb78','#ed64a6','#38b2ac','#f56565'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('span');
      p.className = 'pep-confetti';
      p.style.left = (50 + (Math.random() - 0.5) * 120) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      p.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
      host.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  }

  G.toast = toast;
  G.confetti = confetti;

  // ============================================================
  // Header widget (auto-mount)
  // ============================================================

  function mountHeaderWidget() {
    if (document.getElementById('pep-widget')) return;
    const s = load();
    const info = G.xpForNextLevel(s.xp);
    const widget = document.createElement('div');
    widget.id = 'pep-widget';
    widget.className = 'pep-widget';
    widget.innerHTML = `
      <div class="pep-widget__left">
        <span class="pep-widget__name" title="Learner">👋 ${escapeHTML(s.name || 'Learner')}</span>
        <span class="pep-widget__streak" title="Daily streak">🔥 ${s.streak.count}</span>
      </div>
      <div class="pep-widget__bar" title="Level ${info.level} — ${info.progress}/${info.span} XP to next level">
        <div class="pep-widget__bar-fill" style="width:${info.span ? Math.min(100, (info.progress/info.span)*100) : 0}%"></div>
        <span class="pep-widget__bar-text">Lv ${info.level} · ${s.xp} XP</span>
      </div>
      <div class="pep-widget__right">
        <a href="games.html" class="pep-widget__link" title="Games">🎮</a>
        <a href="progress.html" class="pep-widget__link" title="My Progress">📊</a>
        <button class="pep-widget__btn" data-action="dark" title="Toggle dark mode">${s.settings.dark ? '☀️' : '🌙'}</button>
        <button class="pep-widget__btn" data-action="mute" title="Toggle sound">${s.settings.muted ? '🔇' : '🔊'}</button>
      </div>
    `;
    widget.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'dark') { G.toggleDark(); refreshWidget(); }
      if (btn.dataset.action === 'mute') { G.toggleMute(); refreshWidget(); }
    });
    document.body.prepend(widget);
  }

  function refreshWidget() {
    const w = document.getElementById('pep-widget');
    if (!w) return;
    w.remove();
    mountHeaderWidget();
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ============================================================
  // First-visit name modal
  // ============================================================

  function maybePromptName() {
    const s = load();
    if (s.name) return;
    const modal = document.createElement('div');
    modal.className = 'pep-modal';
    modal.innerHTML = `
      <div class="pep-modal__box">
        <div class="pep-modal__icon">🇯🇲</div>
        <h2>Welcome, learner!</h2>
        <p>What should we call you?</p>
        <input type="text" id="pep-name-input" maxlength="30" placeholder="Your first name" autocomplete="off">
        <button id="pep-name-save" class="pep-btn-primary">Let's Go! 🚀</button>
      </div>
    `;
    document.body.appendChild(modal);
    const input = modal.querySelector('#pep-name-input');
    const save  = modal.querySelector('#pep-name-save');
    input.focus();
    const submit = () => {
      const name = input.value.trim() || 'Learner';
      G.setName(name);
      modal.remove();
      refreshWidget();
      G.toast(`<span class="pep-toast__icon">🎉</span><span>Welcome, <strong>${escapeHTML(name)}</strong>!</span>`, 'levelup');
    };
    save.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }

  // ============================================================
  // Init
  // ============================================================

  document.addEventListener('DOMContentLoaded', () => {
    const s = load();
    applyDarkMode(s.settings.dark);
    mountHeaderWidget();
    // Delay modal so page renders first
    setTimeout(maybePromptName, 400);
  });

  document.addEventListener('pep:state-changed', refreshWidget);

  global.PEP = G;
})(window);
