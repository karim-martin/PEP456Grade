#!/usr/bin/env node
/**
 * inject-lesson-divs.js — one-time HTML mutator.
 *
 * 1. Replaces the per-grade <script> block in <head> with the full
 *    new module loader (audio, mascot, math-notation, diagrams, stepper,
 *    games, lesson-player, ...).
 *
 * 2. Inserts a <div class="pep-lesson" data-chapter="..."></div> as the
 *    first child of every <div id="science-chapter-N" class="chapter-content...">
 *    based on the page's grade.
 *
 * Idempotent: if a lesson div is already present, leaves it alone.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const PAGES = [
  { file: 'grade4.html', grade: 'g4' },
  { file: 'grade5.html', grade: 'g5' },
  { file: 'grade6.html', grade: 'g6' },
  { file: 'technology.html', grade: 'tech' }
];

const SUBJECT_MAP = { science:'sci', social:'soc', math:'mat', language:'lan', tech:'tech', technology:'tech' };

// New script block — lookup-only at runtime (deferred), order matters for self-registration.
const NEW_SCRIPT_BLOCK = `    <script src="Resource/script.js" defer></script>
    <script src="Resource/gamification.js" defer></script>
    <script src="Resource/audio.js" defer></script>
    <script src="Resource/mascot.js" defer></script>
    <script src="Resource/math-notation.js" defer></script>
    <script src="Resource/diagrams.js" defer></script>
    <script src="Resource/diagrams/jamaica-parishes.js" defer></script>
    <script src="Resource/diagrams/caribbean-map.js" defer></script>
    <script src="Resource/diagrams/water-cycle.js" defer></script>
    <script src="Resource/diagrams/plant-cell.js" defer></script>
    <script src="Resource/diagrams/food-web.js" defer></script>
    <script src="Resource/diagrams/life-cycle.js" defer></script>
    <script src="Resource/diagrams/circuit.js" defer></script>
    <script src="Resource/diagrams/computer-system.js" defer></script>
    <script src="Resource/diagrams/html-tag-tree.js" defer></script>
    <script src="Resource/diagrams/place-value-chart.js" defer></script>
    <script src="Resource/diagrams/number-line.js" defer></script>
    <script src="Resource/diagrams/fraction-pie.js" defer></script>
    <script src="Resource/diagrams/body-system.js" defer></script>
    <script src="Resource/stepper.js" defer></script>
    <script src="Resource/flashcards.js" defer></script>
    <script src="Resource/matching.js" defer></script>
    <script src="Resource/memory-game.js" defer></script>
    <script src="Resource/drill.js" defer></script>
    <script src="Resource/games/place-value-slot.js" defer></script>
    <script src="Resource/games/fraction-builder.js" defer></script>
    <script src="Resource/games/factor-tree.js" defer></script>
    <script src="Resource/games/drag-to-order.js" defer></script>
    <script src="Resource/games/click-the-region.js" defer></script>
    <script src="Resource/games/syntax-builder.js" defer></script>
    <script src="Resource/games/choice-adventure.js" defer></script>
    <script src="Resource/games/definition-match-speed.js" defer></script>
    <script src="Resource/games/hangman.js" defer></script>
    <script src="Resource/games/timeline-builder.js" defer></script>
    <script src="Resource/games/area-grid-builder.js" defer></script>
    <script src="Resource/games/equation-balancer.js" defer></script>
    <script src="Resource/games/long-division-walker.js" defer></script>
    <script src="Resource/lesson-player.js" defer></script>
    <script src="Resource/quiz-engine.js" defer></script>`;

function replaceScriptBlock(html) {
  // Match a contiguous run of <script src="Resource/..."> tags inside <head>.
  // Use a single broad replace anchored to the first one we know exists.
  const startRe = /(\s*<script src="Resource\/[^"]+"\s*defer><\/script>)+/;
  if (!startRe.test(html)) return html;
  return html.replace(startRe, '\n' + NEW_SCRIPT_BLOCK);
}

function injectLessonDivs(html, grade) {
  // Find <div id="<subject>-chapter-<N>" class="chapter-content..."> and insert the lesson div after the opening tag.
  // We must ALSO ensure we don't inject twice.
  const re = /(<div\s+id="(\w+)-chapter-(\d+)"\s+class="chapter-content[^"]*"[^>]*>)/g;
  let count = 0;
  const out = html.replace(re, (m, openTag, subjWord, num) => {
    const subj = SUBJECT_MAP[subjWord];
    if (!subj) return m;
    const chapterId = `${grade}-${subj}-${num}`;
    // Check the tail of the html (the actual location after this tag) — use simple lookahead trick:
    // Since regex is one-shot we can't peek. Trust idempotency by checking after replace.
    count++;
    return `${openTag}\n            <div class="pep-lesson" data-chapter="${chapterId}"></div>`;
  });
  // Now strip duplicates: if we accidentally produced two pep-lesson divs in a row, collapse.
  return { html: out.replace(/<div class="pep-lesson"[^>]*><\/div>\s*<div class="pep-lesson"[^>]*><\/div>/g, m => m.split('</div>')[0] + '</div>'), count };
}

for (const p of PAGES) {
  const filePath = path.join(ROOT, p.file);
  if (!fs.existsSync(filePath)) { console.warn('skip:', filePath); continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html.length;
  html = replaceScriptBlock(html);
  const { html: html2, count } = injectLessonDivs(html, p.grade);
  html = html2;
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✓ ${p.file} — script block updated, lesson divs injected: ${count}, size: ${before} → ${html.length}`);
}
