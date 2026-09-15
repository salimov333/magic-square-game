# Magic Square Game

A responsive, multilingual math puzzle built with React. Fill every free cell so that each row, column and both main diagonals equal the same magic constant.

## Features

- Dynamic boards from **3×3 through 12×12**
- Correct generators for odd, doubly-even and singly-even orders
- Drag and drop plus tap-first mobile input
- Per-player onboarding with an interactive 3×3 demonstration
- Local player sign-in, completion history, high scores, combined score and total play time
- Smart reveal and algorithm hints with explicit score penalties
- Live row and column totals, timer, mistake tracking and celebration animation
- German default UI, English and complete Arabic RTL support
- Responsive layout for desktop, tablet and mobile

## Tech stack

- React 19 and Vite 7
- Tailwind CSS 4
- Framer Motion
- Zustand with persisted local state
- Vitest

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. A production bundle can be created and previewed with:

```bash
npm run build
npm run preview
```

Run the generator test suite with:

```bash
npm test
```

## Project structure

```text
src/
├── components/       Screens and reusable interface elements
├── game/             Pure generators, puzzle creation and tests
├── hooks/            Timer lifecycle
├── i18n/             German, English and Arabic JSON dictionaries
├── store/            Zustand game/profile state and persistence
├── utils/            Formatting helpers
├── App.jsx            Screen orchestration and document direction
└── styles.css         Tailwind import and responsive visual system
```

## Magic-square algorithms

The magic constant for a square of order `n` is:

```text
M = n(n² + 1) / 2
```

### Odd orders — Siamese / De la Loubère method

Used for 3, 5, 7, 9 and 11. Place `1` in the top-middle cell, then move diagonally up and right with wraparound. If the destination is occupied, move down one cell instead. Simon de la Loubère described this Indian continuous method in 1691 after returning from Siam.

### Doubly-even orders — diagonal inversion

Used for 4, 8 and 12. Fill the square sequentially, preserve values that belong to the repeating 4×4 diagonal pattern, and complement every other value with `n² + 1 - value`. Its underlying superposition principle is historically associated with Narayana Pandit's 1356 work.

### Singly-even orders — Strachey construction

Used for 6 and 10. Generate an odd square of half the size, copy it into four quadrants with fixed offsets, then exchange the prescribed left and right columns and two central exception cells. The construction is attributed to Ralph Strachey.

Tests verify that every generated square contains each integer from `1` through `n²` exactly once and that all rows, columns and main diagonals equal `M` for every supported size.

## Scoring

```text
score = max(0, n × 1000 − seconds − hints × 300 − mistakes × 100)
```

The score is stored per player and grid size in browser `localStorage`. No registration or remote database is required.

## Deployment

The output in `dist/` is a static site and can be deployed to GitHub Pages, Netlify, Vercel or any static file host. The Vite base path is relative, so the build also works from a repository subpath.

## Accessibility and privacy

Interactive controls have keyboard focus styles and semantic buttons. Language selection updates the document `lang` and `dir` attributes. All profile and game statistics remain on the player's device.

## License

MIT
