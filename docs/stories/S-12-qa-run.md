# S-12 — QA run of the built prototype, report + screenshots in docs/qa/

State: done (G3 D-068) · Agent: qa-tester · Goal served: 2 (correct at the table, printable) · Gate: G3 (D-045, D-051, D-058)

## Why
Before Marius signs off the prototype (G3), a real browser must prove that every rule set shows the right chart, table mode, reason panel, link and print all work, and the layout holds on a phone. The tester reports only; it never edits app or engine code.

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9)
- docs/north-star.md
- prototype/index.html (the built single file, opened via file://)
- snapshot/charts-36.json
- .claude/agents/qa-tester.md

## Write (only these)
- docs/qa/2026-10-05-qa.md (pass/fail table, environment, screenshot paths, findings with severity: high / medium / low, each with reproduction)
- docs/qa/qa-run.mjs (the script; re-run with `node docs/qa/qa-run.mjs`; the PLAYWRIGHT_CORE path is documented at the top)
- docs/qa/screenshots/*.png

## Tooling (D-065)
`npm i playwright-core` in the session scratch folder (`.../scratchpad/qa`), never in the repo, no package.json change. Launch real Google Chrome with executablePath `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. If the install fails, use Chrome headless with raw CDP and say so in the report.

## Checks (one pass/fail row each, with evidence)
1. All 36 rule sets, set by real rule-panel clicks at 1280: every chart cell (move word + icon) equals the snapshot; the rules sentence equals the snapshot label.
2. Table mode (D-055, D-061, D-062): answer equals the chart cell, reached in two taps. Coverage: state it. Preferred: all 36 × 35 hands × 10 dealers by real clicks. If time-boxed: one full rule set by clicks, all 36 through the page's own UI functions.
3. Reason panel (D-063): tap a cell shows row label, reason, and a separate note; Close and Escape work; one Tab stop per table; arrow keys move between cells.
4. My-table link (D-054): all 36 combos load from `?query` with the right chart; a rules change rewrites the URL and history length stays the same; a bad query falls back to defaults with no console error.
5. Print (D-054, D-064): page.pdf (or Chrome --print-to-pdf) gives 1 page for the full page on A4 and Letter, and 1 page for the pocket card on A4 and Letter landscape.
6. Layout at 390×844 and 1280×900 on chart, table mode and open panel: no sideways page scroll (document scrollWidth ≤ innerWidth, D-050); list every tap target under 44px (known: Calculator link, about 40px).
7. Whole run: no console errors or warnings; no network request except the file itself.
8. Basic accessibility: every control reachable by keyboard, visible focus, icons never the only label.

Re-check and record, not necessarily fails: Calculator link under 44px; title #859c2e on #f9fafa about 2.96:1 (E53 colour, flag for Figma); print dialog URL/date headers ("manual, not automatable"); Escape after tap on iOS Safari (out of reach, note only).

## Out of scope
- Fixing anything: findings go to the Lead. No edits to prototype/, engine/, snapshot/, package.json or any file outside docs/qa/.
- Figma, Jira, push.

## Acceptance criteria
1. docs/qa/2026-10-05-qa.md exists with one pass/fail row per check 1–8, each with evidence, plus environment and the manual/note items above.
2. Checks 1, 4 and 5 pass, and check 2 passes with its coverage stated; any fail is listed with severity and reproduction steps.
3. Screenshots exist at 390×844 and 1280×900 for: default chart, table mode with a result, an open reason panel (six files), and the report links their paths.
4. `node docs/qa/qa-run.mjs` runs again from a clean checkout (given the documented PLAYWRIGHT_CORE path) and reproduces the table.
5. `git status` shows changes only inside docs/qa/ (no package.json, no node_modules in the repo).

## Gate G3 (after this story)
The Lead stops and shows Marius: the prototype path, the QA report, the screenshots at 390 and 1280, and the list of decisions made on the way. Marius signs off the prototype before any Figma work. Nothing is pushed before `/codex:review --base origin/main` and G6.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Report has 8 check rows with evidence, environment, manual/out-of-reach items marked |
| 2 | Pass | Checks 1, 4, 5 pass; check 2 coverage stated (12,600 by real clicks in the full run + 12,600 via UI functions); findings F1 medium, F2/F3 low with reproduction |
| 3 | Pass | 6 screenshots (390×844 / 1280×900 viewports): default chart, table-mode result, reason panel |
| 4 | Pass | Reviewer re-ran `node docs/qa/qa-run.mjs`: exit 0, 8/8 PASS in 76 s |
| 5 | Pass | Repo unchanged outside docs/qa/; `npm run check` 105/105 |

Overall: PASS (story-reviewer, 2026-10-05). Wording: check 1 = 10,800 cells verified after rule sets chosen by real clicks. F1 is not script output; under D-050 the open point is only the missing sideways-scroll cue at 390.

