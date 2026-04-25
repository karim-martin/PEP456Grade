/**
 * PEP Timed Drill — arcade-style 60-second speed round.
 * Modes: 'math-add', 'math-mul', 'math-mixed', 'spelling', 'capitals'.
 * Renders into a host element; auto-awards XP based on final score.
 */
(function (global) {

  const DRILL_DURATION = 60;

  const SPELLING_PAIRS = [
    ['independence',  ['independance','independance','indipendence','independdence']],
    ['Jamaica',       ['Jemaica','Jamaca','Jamaika','Jamaiica']],
    ['beautiful',     ['beutiful','beautifull','beatuful','biutiful']],
    ['environment',   ['enviroment','enviornment','environement','enviornmet']],
    ['necessary',     ['neccessary','necesary','necessarry','necessery']],
    ['friend',        ['freind','frend','friennd','frind']],
    ['receive',       ['recieve','receeve','recive','reseive']],
    ['because',       ['becuase','becouse','becase','becuz']],
    ['different',     ['diffrent','diferent','differant','difrent']],
    ['government',    ['goverment','govenment','governement','govermant']],
    ['February',      ['Febuary','Feburary','Febrary','Februery']],
    ['Caribbean',     ['Carribean','Carbbean','Caribean','Carribian']],
    ['Wednesday',     ['Wenesday','Wednessday','Wedneday','Wedensday']],
    ['separate',      ['seperate','saparate','seperete','separete']],
    ['believe',       ['beleive','belive','belevie','bileve']],
    ['neighbour',     ['nieghbour','neighbor','neghbour','neihbour']],
    ['beginning',     ['begining','beggining','begining','beginnning']],
    ['tomorrow',      ['tomorow','tommorrow','tomarrow','tommorow']],
    ['success',       ['sucess','succes','succcess','sucsess']],
    ['favourite',     ['favorite','favourit','faveorite','faverite']]
  ];

  // Capital cities of Caribbean / world countries relevant to PEP
  const CAPITALS = [
    ['Jamaica','Kingston'], ['Trinidad and Tobago','Port of Spain'], ['Barbados','Bridgetown'],
    ['Guyana','Georgetown'], ['Haiti','Port-au-Prince'], ['Cuba','Havana'],
    ['Dominican Republic','Santo Domingo'], ['Bahamas','Nassau'], ['Belize','Belmopan'],
    ['Saint Lucia','Castries'], ['Grenada','St. George\u2019s'], ['Dominica','Roseau'],
    ['Antigua and Barbuda','St. John\u2019s'], ['Suriname','Paramaribo'], ['Saint Vincent','Kingstown'],
    ['United States','Washington, D.C.'], ['Canada','Ottawa'], ['United Kingdom','London'],
    ['France','Paris'], ['Spain','Madrid'], ['Japan','Tokyo'], ['China','Beijing'],
    ['India','New Delhi'], ['Brazil','Brasília'], ['Mexico','Mexico City'],
    ['Australia','Canberra'], ['Egypt','Cairo'], ['South Africa','Pretoria'],
    ['Ghana','Accra'], ['Nigeria','Abuja']
  ];

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function makeQuestion(mode) {
    if (mode === 'math-add') {
      const a = rand(2, 49), b = rand(2, 49);
      const ans = a + b;
      return qWithAns(`${a} + ${b}`, ans, [ans, ans + rand(1,5), ans - rand(1,5), ans + rand(6,10)]);
    }
    if (mode === 'math-mul') {
      const a = rand(2, 12), b = rand(2, 12);
      const ans = a * b;
      return qWithAns(`${a} × ${b}`, ans, [ans, ans + a, ans - b, ans + rand(3, 7)]);
    }
    if (mode === 'math-mixed') {
      const op = ['+','−','×'][rand(0,2)];
      if (op === '+') return makeQuestion('math-add');
      if (op === '×') return makeQuestion('math-mul');
      const a = rand(5, 99), b = rand(1, Math.min(a, 50));
      const ans = a - b;
      return qWithAns(`${a} − ${b}`, ans, [ans, ans+rand(1,4), ans-rand(1,4), ans+rand(5,9)]);
    }
    if (mode === 'spelling') {
      const entry = SPELLING_PAIRS[rand(0, SPELLING_PAIRS.length - 1)];
      const correct = entry[0];
      const distractors = entry[1];
      const all = shuffle([correct, ...distractors.slice(0,3)]);
      return { q: 'Which one is spelled correctly?', choices: all, correctIdx: all.indexOf(correct) };
    }
    if (mode === 'capitals') {
      const entry = CAPITALS[rand(0, CAPITALS.length - 1)];
      const correct = entry[1];
      const others = shuffle(CAPITALS.filter(c => c[1] !== correct)).slice(0,3).map(c => c[1]);
      const all = shuffle([correct, ...others]);
      return { q: `What is the capital of ${entry[0]}?`, choices: all, correctIdx: all.indexOf(correct) };
    }
    return makeQuestion('math-mixed');
  }

  function qWithAns(text, ans, choices) {
    const shuffled = shuffle(Array.from(new Set(choices)));
    if (shuffled.length < 4) {
      while (shuffled.length < 4) {
        const extra = ans + rand(-15, 15);
        if (!shuffled.includes(extra) && extra > 0) shuffled.push(extra);
      }
    }
    const correctIdx = shuffled.indexOf(ans);
    return { q: text, choices: shuffled, correctIdx };
  }

  function render(host, mode) {
    mode = mode || 'math-mixed';
    const titleMap = {
      'math-add':   '➕ Addition Attack',
      'math-mul':   '✖️ Multiplication Mayhem',
      'math-mixed': '🧮 Math Mixer',
      'spelling':   '✏️ Spelling Showdown',
      'capitals':   '🌍 Capital Cities'
    };

    host.innerHTML = `
      <div class="pep-drill">
        <div class="pep-drill__hud">
          <span class="pep-drill__title">${titleMap[mode] || 'Timed Drill'}</span>
          <span>⏱️ <span class="pep-drill__time">${DRILL_DURATION}</span>s</span>
          <span>🏆 <span class="pep-drill__score">0</span></span>
          <span class="pep-drill__combo">🔥 <span class="pep-drill__streak">0</span>x</span>
        </div>
        <div class="pep-drill__q">Ready?</div>
        <div class="pep-drill__answers"></div>
        <div style="text-align:center;margin-top:12px;">
          <button class="pep-btn-primary pep-drill__start" type="button">▶ Start</button>
        </div>
      </div>`;

    const qEl = host.querySelector('.pep-drill__q');
    const ansEl = host.querySelector('.pep-drill__answers');
    const timeEl = host.querySelector('.pep-drill__time');
    const scoreEl = host.querySelector('.pep-drill__score');
    const streakEl = host.querySelector('.pep-drill__streak');
    const startBtn = host.querySelector('.pep-drill__start');

    let score = 0, streak = 0, best = 0, time = DRILL_DURATION, timer = null, active = false, current = null;

    function next() {
      current = makeQuestion(mode);
      qEl.textContent = current.q;
      ansEl.innerHTML = current.choices.map((c, i) => `<button class="pep-drill__a" data-i="${i}" type="button">${escapeHTML(String(c))}</button>`).join('');
      ansEl.querySelectorAll('.pep-drill__a').forEach(b => b.addEventListener('click', () => pick(+b.dataset.i)));
    }

    function pick(i) {
      if (!active) return;
      if (i === current.correctIdx) {
        score += 10 + streak;
        streak++;
        best = Math.max(best, streak);
        if (global.PEP) PEP.playSound('correct');
      } else {
        streak = 0;
        if (global.PEP) PEP.playSound('wrong');
      }
      scoreEl.textContent = score;
      streakEl.textContent = streak;
      next();
    }

    function start() {
      score = 0; streak = 0; best = 0; time = DRILL_DURATION; active = true;
      scoreEl.textContent = 0; streakEl.textContent = 0; timeEl.textContent = time;
      startBtn.style.display = 'none';
      next();
      timer = setInterval(() => {
        time--;
        timeEl.textContent = time;
        if (time <= 0) finish();
      }, 1000);
    }

    function finish() {
      active = false;
      clearInterval(timer);
      qEl.innerHTML = `🏁 Time's up!<br><span style="font-size:0.6em">Final score: ${score}</span>`;
      ansEl.innerHTML = `<div style="grid-column:1/-1;text-align:center">Best combo streak: <strong>${best}</strong></div>`;
      startBtn.textContent = '🔁 Play Again';
      startBtn.style.display = '';
      const xp = Math.round(score / 2);
      if (global.PEP) {
        PEP.awardXP(xp);
        if (score >= 150 && typeof PEP.confetti === 'function') PEP.confetti();
      }
    }

    startBtn.addEventListener('click', start);
  }

  global.PEPDrill = { render };

  document.addEventListener('DOMContentLoaded', () => {
    if (global.PEP && typeof global.PEP.registerGame === 'function') {
      global.PEP.registerGame('drill', {
        id: 'drill', label: 'Speed Drill', icon: '⚡',
        mount(host, data) { render(host, (data && data.mode) || 'math-mixed'); }
      });
    }
  });
})(window);
