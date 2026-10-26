# Cold Read

A daily true-crime investigation in the browser. Each day opens a real, solved case. You read the files police gathered, choose which leads to follow, and make one arrest when you're sure. The arrest plays out all the way to sentencing. Only then do you find out whether you got the right person.

## How it plays

- **Evidence board.** Police reports, letters, interviews, lab results, news clippings, phone logs, security video and more, pinned to a cork board. Reading files is free.
- **Leads.** Each lead you follow costs one step and moves the case clock forward by days or weeks. Some leads break the case open. Some go nowhere, and the game won't tell you which.
- **Let time pass.** History keeps moving on real dates: new crimes, new letters, new evidence.
- **Suspects.** Anyone on your suspect list can be arrested at any time. One arrest per case. No take-backs.
- **Scoring.** Fewer steps and fewer days worked earn a higher score (out of 1000) and rank, from Records Clerk to Chief of Detectives. Arresting the wrong person scores 0.
- **Share** a spoiler-free result. Streak, solved count and best score are kept in your browser.

## Run it

Plain HTML, CSS and JavaScript, no build step. Open `index.html`, or publish with GitHub Pages:
Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / root.

## Adding cases

Cases live in [`cases.js`](cases.js) and rotate one per day from `LAUNCH_DATE` in `game.js`. A case has chapters, files, dated events, leads (actions), suspects and outcomes. See the BTK case for the shape.

Ground rules:

- Solved cases only, with a confirmed outcome.
- Every file must be checkable against the sources listed with the case. Files are reconstructed from public reporting, not reproduced.
- Keep details non-graphic. List the victims by name in the memorial.
- People who were investigated and cleared get changed names. Tip-line suspects are composites. Say so in the case's disclosure.
- The key evidence for the right answer must be findable in the files.

## Cases

| # | Case | Years open |
|---|------|-----------|
| 1 | The BTK Investigation — Wichita, Kansas | 31 |
