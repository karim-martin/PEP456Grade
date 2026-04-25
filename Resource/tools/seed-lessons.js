#!/usr/bin/env node
/**
 * seed-lessons.js — one-time content seeder.
 *
 * Reads every grade*.json under Resource/questions, and for each chapter that
 * doesn't already have a `lessons` key, appends a sensible default lesson
 * using existing mcq/flashcards/match data.
 *
 * Run: node Resource/tools/seed-lessons.js
 *
 * Idempotent: skips chapters where `lessons` already exists.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'questions');
const FILES = ['grade4.json', 'grade5.json', 'grade6.json', 'technology.json'];

const ICONS = { mat:'🔢', sci:'🔬', soc:'🗺️', lan:'📚', tech:'💻' };
const SUBJ_NAMES = { mat:'Mathematics', sci:'Science', soc:'Social Studies', lan:'Language Arts', tech:'Technology' };

function pickHook(subject, title) {
  const T = title || '';
  switch (subject) {
    case 'mat': return `Time to play with numbers! ${T}`;
    case 'sci': return `Let's explore: ${T}`;
    case 'soc': return `A story from our world: ${T}`;
    case 'lan': return `Words are powerful! ${T}`;
    case 'tech': return `Build something cool: ${T}`;
    default: return T;
  }
}

function pickMathStepper(title) {
  const t = (title || '').toLowerCase();
  if (/place value/.test(t))                        return { auto:{ kind:'place-value', number: 374562 } };
  if (/round/.test(t))                              return { auto:{ kind:'rounding-line', n: 67, place:'tens' } };
  if (/(divid|division)/.test(t))                   return { auto:{ kind:'long-division', dividend: 84, divisor: 7 } };
  if (/(multipl|times)/.test(t))                    return { auto:{ kind:'multiplication-area', w: 6, h: 7 } };
  if (/equivalent/.test(t) && /fraction/.test(t))   return { auto:{ kind:'equivalent-fractions', a:[1,2], k:2 } };
  if (/fraction/.test(t))                           return { auto:{ kind:'fraction-add', a:[1,3], b:[1,4] } };
  if (/decimal/.test(t))                            return { auto:{ kind:'decimal-place', n: 3.45 } };
  if (/percent/.test(t))                            return { auto:{ kind:'percent-bar', pct: 25 } };
  if (/(prime|factor)/.test(t))                     return { auto:{ kind:'factor-tree', number: 36 } };
  if (/(equation|algebra|variable)/.test(t))        return { auto:{ kind:'equation-balance', a:5, b:12 } };
  if (/(perimeter|area)/.test(t))                   return { auto:{ kind:'perimeter-walk', w:4, h:3 } };
  // Fallback so EVERY math chapter has an animated example.
  if (/(number|explorer|count|sets|classification)/.test(t)) return { auto:{ kind:'place-value', number: 374562 } };
  if (/(money|dollar|cent)/.test(t))                return { auto:{ kind:'place-value', number: 1250 } };
  if (/(roman|numeral)/.test(t))                    return { auto:{ kind:'place-value', number: 87 } };
  if (/(ratio|proportion)/.test(t))                 return { auto:{ kind:'multiplication-area', w: 2, h: 3 } };
  if (/(exponent|power)/.test(t))                   return { auto:{ kind:'factor-tree', number: 8 } };
  if (/(pattern|sequence)/.test(t))                 return { auto:{ kind:'multiplication-area', w: 4, h: 3 } };
  if (/(geometry|shape|angle|polygon|triangle)/.test(t)) return { auto:{ kind:'perimeter-walk', w:4, h:3 } };
  if (/(transform|translation|rotation|reflection)/.test(t)) return { auto:{ kind:'perimeter-walk', w:4, h:3 } };
  if (/(volume|capacity)/.test(t))                  return { auto:{ kind:'multiplication-area', w: 3, h: 4 } };
  // Universal fallback for any other math chapter
  return { auto:{ kind:'place-value', number: 374562 } };
}

function pickMathGame(title) {
  const t = (title || '').toLowerCase();
  if (/place value/.test(t)) return { module:'place-value-slot', data:{ digits:'374562' } };
  if (/round/.test(t))       return { module:'place-value-slot', data:{ mode:'round', number:67, to:'tens' } };
  if (/(divid|division)/.test(t)) return { module:'long-division-walker', data:{ dividend:84, divisor:7 } };
  if (/(multipl|times)/.test(t))  return { module:'area-grid-builder', data:{ target:'product', w:6, h:7 } };
  if (/(prime|factor)/.test(t))   return { module:'factor-tree', data:{ number:36 } };
  if (/fraction/.test(t))    return { module:'fraction-builder', data:{ target:'3/4', maxDen:8 } };
  if (/percent/.test(t))     return { module:'fraction-builder', data:{ target:'1/4', maxDen:8 } };
  if (/decimal/.test(t))     return { module:'place-value-slot', data:{ digits:'3450' } };
  if (/(equation|algebra)/.test(t)) return { module:'equation-balancer', data:{ left:'x + 5', right:12 } };
  if (/(perimeter)/.test(t)) return { module:'area-grid-builder', data:{ target:'perimeter', goal:14 } };
  if (/(area)/.test(t))      return { module:'area-grid-builder', data:{ target:'area', goal:12 } };
  // Math fallbacks — every math chapter gets a game.
  if (/(number|explorer|count|sets|classification)/.test(t)) return { module:'place-value-slot', data:{ digits:'374562' } };
  if (/(money|dollar|cent)/.test(t)) return { module:'place-value-slot', data:{ digits:'1250' } };
  if (/(roman|numeral)/.test(t))     return { module:'definition-match-speed', data:{ pairs:[['I','1'],['V','5'],['X','10'],['L','50'],['C','100'],['D','500'],['M','1000']], seconds:60 } };
  if (/(ratio|proportion)/.test(t))  return { module:'fraction-builder', data:{ target:'2/3', maxDen:6 } };
  if (/(exponent|power)/.test(t))    return { module:'factor-tree', data:{ number:64 } };
  if (/(pattern|sequence)/.test(t))  return { module:'drag-to-order', data:{ items:[{label:'2',value:2},{label:'4',value:4},{label:'6',value:6},{label:'8',value:8},{label:'10',value:10}], direction:'asc' } };
  if (/(geometry|shape|angle|polygon|triangle)/.test(t)) return { module:'click-the-region', data:{ diagram:'fraction-pie', target:'1/4' } };
  if (/(volume|capacity)/.test(t))   return { module:'area-grid-builder', data:{ target:'product', w:3, h:4 } };
  // Universal math fallback
  return { module:'place-value-slot', data:{ digits:'374562' } };
}

function pickDiagram(subject, title) {
  const t = (title || '').toLowerCase();
  if (subject === 'soc' && /(parish|jamaica|map)/.test(t)) return { name:'jamaica-parishes', props:{} };
  if (subject === 'soc' && /(caribbean|geograph)/.test(t)) return { name:'caribbean-map', props:{} };
  if (subject === 'sci' && /(water|cycle|weather)/.test(t)) return { name:'water-cycle', props:{} };
  if (subject === 'sci' && /(plant|cell)/.test(t))         return { name:'plant-cell', props:{} };
  if (subject === 'sci' && /(food|chain|web)/.test(t))     return { name:'food-web', props:{} };
  if (subject === 'sci' && /(life cycle|cycle)/.test(t))   return { name:'life-cycle', props:{} };
  if (subject === 'sci' && /(body|system|organ|human)/.test(t)) return { name:'body-system', props:{} };
  if (subject === 'tech' && /(circuit|electric)/.test(t))  return { name:'circuit', props:{} };
  if (subject === 'tech' && /(computer|hardware|cpu)/.test(t)) return { name:'computer-system', props:{} };
  if (subject === 'tech' && /(html|web|markup)/.test(t))   return { name:'html-tag-tree', props:{} };
  return null;
}

function defaultLessons(chapterId, data) {
  const subject = chapterId.split('-')[1];
  const title = data?.title || '';
  const lessons = [];

  lessons.push({ type:'intro', text: pickHook(subject, title), xp: 5 });

  const stepper = subject === 'mat' ? pickMathStepper(title) : null;
  if (stepper) lessons.push({ type:'stepper', data: stepper, xp: 10 });

  const diag = pickDiagram(subject, title);
  if (diag) lessons.push({ type:'diagram', name: diag.name, props: diag.props, xp: 5 });

  // Subject-specific game
  const mathGame = subject === 'mat' ? pickMathGame(title) : null;
  if (mathGame) {
    lessons.push({ type:'game', module: mathGame.module, data: mathGame.data, xp: 15 });
  } else if (subject === 'soc' && /(parish|jamaica)/.test(title.toLowerCase())) {
    lessons.push({ type:'game', module:'click-the-region', data:{ diagram:'jamaica-parishes', target:'Saint Catherine' }, xp: 12 });
  } else if (subject === 'soc' && /(history|hero|emancipation|independence)/.test(title.toLowerCase())) {
    // History timeline (placeholder data — authors can swap in real events)
    lessons.push({ type:'game', module:'timeline-builder', data:{
      events:[
        { date:'1494', label:'Columbus arrives in Jamaica' },
        { date:'1655', label:'British capture Jamaica' },
        { date:'1834', label:'Slavery abolished' },
        { date:'1838', label:'Full emancipation' },
        { date:'1962', label:'Jamaica independence' }
      ]
    }, xp: 12 });
  } else if (subject === 'lan' && /(spell|vocabul|word)/.test(title.toLowerCase()) && data?.flashcards?.length) {
    const card = data.flashcards[0];
    lessons.push({ type:'game', module:'hangman', data:{ word: String(card?.front || 'Caribbean').replace(/[^a-zA-Z]/g,'') || 'Caribbean', hint: card?.back || 'Vocabulary word' }, xp: 12 });
  } else if (subject === 'lan' && /(grammar|verb|noun|sentence|parts of speech)/.test(title.toLowerCase())) {
    lessons.push({ type:'game', module:'syntax-builder', data:{ template:'[NOUN] [VERB] [NOUN]', words:{ NOUN:['cat','dog','child'], VERB:['runs','jumps','sees'] } }, xp: 12 });
  } else if (subject === 'tech' && /(html)/.test(title.toLowerCase())) {
    lessons.push({ type:'game', module:'syntax-builder', data:{ tags:['<html>','<body>','<h1>','</h1>','</body>','</html>'], solution:['<html>','<body>','<h1>','</h1>','</body>','</html>'] }, xp: 15 });
  } else if (data?.match?.pairs?.length >= 4) {
    // Default: speed match using existing pairs
    lessons.push({ type:'game', module:'definition-match-speed', data:{ pairs: data.match.pairs.slice(0, 8), seconds: 60 }, xp: 12 });
  } else if (data?.flashcards?.length >= 3) {
    lessons.push({ type:'game', module:'flashcards', data: data, xp: 8 });
  }

  // Quick check: 3 MCQs from existing bank
  if (data?.mcq?.length >= 3) {
    lessons.push({ type:'check', count: 3, xp: 10 });
  }

  // Boss quiz
  lessons.push({ type:'boss' });
  return lessons;
}

function meta(chapterId, data) {
  const subject = chapterId.split('-')[1];
  return {
    icon:  ICONS[subject] || '🎮',
    mascot:'🦜',
    hook:  pickHook(subject, data?.title || '')
  };
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  let added = 0, kept = 0;
  for (const chapterId of Object.keys(json)) {
    const ch = json[chapterId];
    if (!ch || typeof ch !== 'object') continue;
    if (!ch.meta) ch.meta = meta(chapterId, ch);
    if (ch.lessons && Array.isArray(ch.lessons) && ch.lessons.length) { kept++; continue; }
    ch.lessons = defaultLessons(chapterId, ch);
    added++;
  }
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`✓ ${path.basename(filePath)} — added: ${added}, already had lessons: ${kept}`);
}

if (require.main === module) {
  for (const f of FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) { console.warn('skip (not found):', p); continue; }
    processFile(p);
  }
  console.log('Done.');
}

module.exports = { defaultLessons, meta };
