# Cold Read

A daily true-crime browser game. Every day a new real, solved case opens. You work through seven exhibits in the order investigators found them, type your answer to each, and finish with a detective rank.

## How it plays

- **7 exhibits per case.** Each is a real piece of the investigation, in chronological order.
- **Typed answers.** Matching ignores case, punctuation and small typos.
- **Scoring:** 100 / 60 / 30 points for solving on your 1st, 2nd or 3rd try. A hint unlocks after each miss. Three misses closes the exhibit at 0 and shows the real answer.
- **Rank** (out of 700): Records Clerk → Patrol Officer → Detective → Detective Sergeant → Homicide Lieutenant → Chief of Detectives.
- **Share** a spoiler-free emoji grid of your result. Streak and best score are kept in your browser.

## Run it

It's plain HTML, CSS and JavaScript — no build step. Open `index.html` in a browser, or publish with GitHub Pages:

Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / root.

## Adding cases

Cases live in [`cases.js`](cases.js). Append an object with the same shape as the existing case; cases rotate one per day starting from `LAUNCH_DATE` in `game.js`.

Ground rules for new cases:

- Solved cases only, with a confirmed outcome (conviction, plea or definitive identification).
- Every briefing and answer must be checkable against the sources listed with the case.
- Keep details non-graphic. Include the victims' names in the memorial list.
- Briefings must not give away the answer to their own question.

## Current cases

| # | Case | Years open |
|---|------|-----------|
| 1 | The BTK Investigation — Wichita, Kansas | 31 |
