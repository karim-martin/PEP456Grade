# PEP Question Bank Schema

Each `grade*.json` / `technology.json` file is keyed by `chapterId` (e.g. `g5-mat-3`).

## Existing keys (unchanged)
- `title` — string, chapter name
- `mcq` — array of `{ q, choices[], correct, explain }`
- `flashcards` — array of `{ front, back }`
- `match` — `{ pairs: [[term, def], ...] }`

## New optional keys (added by lesson player)

### `meta`
```
{ icon: '🔢', mascot: '🦜', hook: 'Numbers as big as the night sky!' }
```

### `lessons[]` — ordered activities

Each entry is one of:

```jsonc
// Hook card with text (TTS read aloud automatically)
{ "type":"intro", "text":"Place value is how we name big numbers.", "xp":5 }

// Animated worked example (PEPStepper)
{ "type":"stepper", "data": { "auto": { "kind":"long-division", "dividend":84, "divisor":7 } }, "xp":10 }

// Inline diagram (PEPDiagrams)
{ "type":"diagram", "name":"water-cycle", "props":{}, "xp":5 }

// Mini-game (any registered PEP.registerGame module)
{ "type":"game", "module":"fraction-builder", "data":{ "target":"3/4" }, "xp":15 }

// Quick check: 3 random MCQs from this chapter
{ "type":"check", "count":3, "xp":10 }

// Boss quiz: full PEPQuiz on the chapter (awards chapter completion)
{ "type":"boss" }
```

## Stepper auto-kinds
- `long-division`        — `{ dividend, divisor }`
- `place-value`          — `{ number }`
- `multiplication-area`  — `{ w, h }`
- `fraction-add`         — `{ a:[n,d], b:[n,d] }`
- `equivalent-fractions` — `{ a:[n,d], k }`
- `factor-tree`          — `{ number }`
- `equation-balance`     — `{ a, b }` (for `x + a = b`)
- `perimeter-walk`       — `{ w, h }`
- `rounding-line`        — `{ n, place }`
- `percent-bar`          — `{ pct }`
- `decimal-place`        — `{ n }`

## Game modules
- `place-value-slot`, `fraction-builder`, `factor-tree`, `area-grid-builder`,
  `equation-balancer`, `long-division-walker`, `drag-to-order`, `click-the-region`,
  `syntax-builder`, `choice-adventure`, `definition-match-speed`, `hangman`,
  `timeline-builder`
- Adapter shims: `match`, `memory`, `flashcards`, `drill`, `stepper`

## Diagrams
- `jamaica-parishes`, `caribbean-map`, `water-cycle`, `plant-cell`, `food-web`,
  `life-cycle`, `circuit`, `computer-system`, `html-tag-tree`,
  `place-value-chart`, `number-line`, `fraction-pie`, `body-system`
