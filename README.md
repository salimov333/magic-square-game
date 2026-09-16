# Magic Square Game

A responsive, multilingual logic game for building normal magic squares. Players arrange every number from `1` to `n²` so that each row, each column and both main diagonals equal the same magic constant.

## Live application

Play the current production version on [GitHub Pages](https://salimov333.github.io/magic-square-game/).

## Current features

### Player profiles and onboarding

- The first visit requires creating a username or choosing a previously saved local profile; there is no automatic default player.
- Every new player receives an introduction and an interactive `3×3` tutorial.
- The introduction explains what a magic square is and is optimized for Arabic, German and English on mobile screens.
- Clicking a saved username selects that player and opens the main menu.
- Deleting a profile requires an explicit confirmation that includes the player's name.
- Progress, best scores, combined score and total play time are stored separately for each player.

### Gameplay

- Ten board sizes are available, from `3×3` through `12×12`.
- Every puzzle starts from a valid generated magic square with approximately 32% of its cells revealed.
- Players may clear individual prefilled cells or clear all prefilled cells to start with an entirely empty board.
- Numbers can be placed by tapping or by drag and drop.
- Filling the last cell does not submit the solution automatically. The board is evaluated only when the player presses **Check square**.
- Any valid magic-square arrangement is accepted; the board does not need to match the generator's original orientation.
- An incomplete board receives a completion prompt without being scored as incorrect.
- An invalid complete board reports incorrect rows, columns and main diagonals separately. The mistake count is the sum of those invalid lines.
- Row and column sums remain neutral during play and receive success/error feedback after validation.
- A player can restart the current size or return to the main menu at any time.

### Hints and learning support

- **Reveal cell** places a correct value in a suitable non-fixed cell and avoids duplicating that value elsewhere on the board.
- **Algorithm rule** explains the construction used for the current board type.
- Both hint types cost `300` points.
- The algorithm explanations include their common names, detailed steps and historical attribution.

### Results and interface

- The main menu shows completion progress across all ten grid sizes.
- The combined score is the sum of the player's best score for each grid size.
- A completed square displays its score and a celebration animation.
- The interface is available in German, English and Arabic with full RTL support.
- Layouts are responsive across desktop, tablet and mobile, including safe-area-aware tutorial controls.

## Magic-square rules

For a square of order `n`, the required magic constant is:

```text
M = n(n² + 1) / 2
```

A submitted board is valid only when:

- every cell contains an integer;
- every number from `1` through `n²` occurs exactly once;
- every row sums to `M`;
- every column sums to `M`;
- both main diagonals sum to `M`.

## Generation algorithms

### Odd orders — Siamese or De la Loubère method

Used for orders `3`, `5`, `7`, `9` and `11`. Place `1` in the top-middle cell, then move diagonally up and right with wraparound. If the destination is occupied, move one cell down from the previous position instead. Simon de la Loubère described this Indian continuous method in 1691 after returning from Siam.

### Doubly-even orders — diagonal inversion or complement method

Used for orders `4`, `8` and `12`. Fill the square sequentially, preserve values in the repeating `4×4` diagonal pattern and replace every other value `x` with its complement `n² + 1 − x`. The explanation in the application relates the underlying superposition principle to Narayana Pandit's 1356 work.

### Singly-even orders — Strachey method

Used for orders `6` and `10`. Generate an odd square of half the order, copy it into four quadrants with fixed offsets, then exchange the prescribed columns and central exception cells. This construction is attributed to Ralph Strachey.

## Scoring

The score is calculated only after a valid square is submitted:

```text
score = max(0, n × 1000 − elapsed seconds − hints × 300 − mistakes × 100)
```

Scoring details:

- each elapsed second deducts `1` point;
- each hint deducts `300` points;
- each invalid row, column or main diagonal found during the last unsuccessful check counts as one mistake and deducts `100` points;
- only the best score for each grid size is retained;
- the main-menu total is the sum of those per-size best scores.

## Technology

- React 19
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Zustand with persisted local state
- Lucide React icons
- Vitest and Testing Library
- ESLint

## Local development

Node.js `20.19` or newer is required. The deployment workflow uses Node.js `22`.

```bash
git clone git@github.com:salimov333/magic-square-game.git
cd magic-square-game
npm install
npm run dev
```

Open the local URL printed by Vite.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run the complete Vitest suite once |
| `npm run lint` | Run ESLint across the project |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |

Before publishing a change, run:

```bash
npm test
npm run lint
npm audit --omit=dev
npm run build
```

## Project structure

```text
.
├── .github/workflows/deploy-pages.yml  CI checks and GitHub Pages deployment
├── src/
│   ├── components/                     Screens and reusable UI components
│   │   ├── Intro.jsx                   Welcome screen and game description
│   │   ├── Tutorial.jsx                Interactive 3×3 tutorial
│   │   ├── MainMenu.jsx                Grid selection, progress and total score
│   │   ├── GameBoard.jsx               Board interaction, validation and results
│   │   ├── ProfileModal.jsx            Player selection, creation and deletion
│   │   ├── LanguageSwitcher.jsx        Language selection
│   │   └── Logo.jsx                    Reusable 3×3 logo
│   ├── game/
│   │   ├── generators.js               Magic-square generators and puzzle creation
│   │   └── rules.js                    Submission validation and elapsed-time logic
│   ├── hooks/useTimer.js               Active-game timer lifecycle
│   ├── i18n/                           German, English and Arabic dictionaries
│   ├── store/useGameStore.js           Zustand actions, scoring and persistence
│   ├── utils/format.js                 Time formatting
│   ├── App.jsx                         Screen flow and document language/direction
│   ├── main.jsx                        React entry point
│   └── styles.css                      Responsive and RTL visual system
├── index.html
├── vite.config.js
└── package.json
```

Test files are colocated with the relevant application modules.

## State and privacy

The application has no account service, backend or remote database. Language, player profiles and statistics are stored in browser `localStorage` under the key `magic-square-state`. Active in-progress boards are intentionally not persisted.

Persisted state currently uses schema version `2`. Its migration removes an unused legacy default profile and preserves existing players as tutorial-complete profiles.

All player data remains on the current browser and device. Clearing browser site data removes local profiles and progress.

## Tests and quality checks

The current suite contains `30` automated tests across `7` test files. Coverage includes:

- generated magic squares for every supported size;
- uniqueness and magic-constant validation;
- accepting alternative valid magic-square arrangements;
- counting invalid rows, columns and diagonals only after submission;
- clearing individual or all prefilled cells;
- hint behavior and elapsed-time accounting;
- one-point-per-second scoring;
- first-run player creation and per-player onboarding;
- combined score display;
- profile deletion confirmation;
- tutorial interaction and board rendering.

The deployment workflow also runs ESLint, audits production dependencies and builds the production bundle before publishing.

## Deployment

Every push to `main` triggers `.github/workflows/deploy-pages.yml`. The workflow:

1. installs dependencies with `npm ci`;
2. runs tests;
3. runs ESLint;
4. audits production dependencies;
5. builds the Vite application;
6. deploys `dist/` to GitHub Pages.

The Vite base path is relative, so the static bundle works from the repository subpath and can also be hosted by another static-site provider.

## README maintenance policy

`README.md` is part of the product and must be updated in the same change whenever development alters any of the following:

- user-visible features or interaction flows;
- game rules, validation, hints or scoring;
- supported languages, accessibility or responsive behavior;
- state shape, persistence or privacy behavior;
- project structure, dependencies or development commands;
- automated tests, CI checks or deployment behavior.

The documented test count and feature list must describe the current repository state, not a planned or previous version.

## License

This project is licensed under the [MIT License](LICENSE).
