# S-07 — `prototype/index.html`: CHIPY shell + the default chart (Hard / Soft / Pairs)

State: done · Agent: ui-dev · Goal served: 2 (usable chart, correct for the rules) · Gate: none (G3 comes at S-12)

## Why
First screen of the D1 prototype (D-004). A player opens one HTML file and sees a chart for the default table rules, inside the
CHIPY Trainer shell (D-045). Moves come from the real engine at runtime, never typed into the page. Merges old S-09.

Defaults on load (D-045): 4–8 decks · dealer hits soft 17 · double after split allowed · surrender any dealer card
= `buildChart({ decks:"4-8", soft17:"hits", das:"yes", surrender:"any" })`.

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9, 10)
- engine/chart.js (API, D-033), engine/why.js (loaded only, not used yet), engine/vendor/*.js (inlined, never edited)
- snapshot/charts-36.json (test truth for the default chart)
- snapshot/build-review.js, test/review.test.js (build-script and stale-check pattern, D-025)
- Read-only: ../chipy-blackjack-trainer/mockups/assets/ (the five `action-*.svg`); ../blackjack-quiz/docs/decisions.md row E53 and ../blackjack-quiz/app/public/css/styles.css (`--shadow-shell`)

## Write (only these; builder may rename the template, then must list it here)
- prototype/build.js (Node only, no dependency; D-018, AGENTS §10)
- prototype/src/index.template.html (hand-written source)
- prototype/src/icons/action-hit.svg, action-stand.svg, action-double.svg, action-split.svg, action-surrender.svg (copied unchanged with Node `fs` read/write; shell `cp` from the Trainer path is blocked)
- prototype/index.html (build output)
- test/prototype.test.js

## Out of scope
- Rule controls (S-08), table mode (S-18), tap/reason panel (S-10), print (S-11), QA run (S-12), final colours (Figma S-13).
- Any edit to `engine/`, `snapshot/`, `package.json`. No dependency added.

## Acceptance criteria
1. **Single file, real engine, pinned icons (D-045, D-004, D-025, D-056).** `node prototype/build.js` writes `prototype/index.html`, inlining unchanged and in this order `engine/vendor/strategy_table.js`, `engine/vendor/explanation_writer.js`, `engine/chart.js`, `engine/why.js`, plus the five SVG icons. `test/prototype.test.js` fails if any inlined engine block is not byte-identical to its file (de-escaped if any `</script` is escaped); if `index.html` differs from the build output now (stale check); if any icon's SHA-256 differs from the pinned value, recorded with provenance (the Trainer commit that last touched the five icon files (b799170), noted by the builder); or if the page has any `http(s)://` `src`/`href` or `fetch` (the SVG `xmlns` attribute is allowed).
2. **Right chart on load (D-045, D-033).** With no clicks, every cell's move word equals the matching cell of snapshot chart `decks=4-8|soft17=hits|das=yes|surrender=any` (test runs the built page script, e.g. in `node:vm`). No move is hard-coded in the template.
3. **Rows and cells (north-star "Chart"; D-020, D-049, D-053).** Three tables, Hard, Soft, Pairs; columns dealer 2…10, A; rows from `chart.js`. Soft rows are displayed as A,2 … A,9 (display only: 13→A,2 … 20→A,9). Each cell shows the CHIPY move icon plus the move word (Hit pointer, Stand hand, Double bars, Split arrows, Surrender flag) on a tint: placeholder S-05 tints Hit #f4c7c3, Stand #fff2a8, Double #b7e1cd, Split #c9daf8, Surrender #d9c3e9, dark text (final colours come in Figma S-13). No engine codes (e.g. "Dh") anywhere; colour is never the only signal. A legend shows each of the five moves as icon + word.
4. **Shell exactly as Quiz E53 (D-045, D-052).** Card 852px wide on desktop (804px content + 24px padding), full width minus the page margin on mobile, 16px radius, shadow `0 -1px 20px 2px rgba(0,0,0,0.1)`, no border. Header band `#f9fafa`, padding 24/20/20, title "BLACKJACK CHEAT SHEET" (D-052) centred, uppercase, bold, `#859c2e`, 20px desktop / 18px mobile, no icon.
5. **Readable at 390px and 1280px (north-star "Mobile"; D-050).** At 1280px the whole chart is visible. At 390px full move words are shown (no abbreviations); each chart table scrolls sideways inside its own box with the "Your hand" column pinned (sticky); the page itself never scrolls sideways (document width = 390). Checked by the Lead with Playwright screenshots at 390 and 1280 (not an automated test).
6. **Gate hygiene (AGENTS §4, §7, §9).** `npm run check` exits 0, and only the Write-list files were added or changed.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | 4 engine blocks byte-identical, in order; no `</script` (build refuses); 5 icons = Trainer b799170 bytes, data URIs decode to them; stale check; no network (xmlns only inside base64) |
| 2 | Pass | Page scripts run in node:vm with real init(): 300 cells = snapshot default chart, 0 mismatches; move words only in a display map keyed by engine move |
| 3 | Pass | Hard/Soft/Pairs, columns 2…A, Soft A,2–A,9; icon + word + tint per cell; no engine codes; legend icon + word |
| 4 | Pass | Shell = E53: 852/804/24, radius 16, shadow var(--shell), no border; header #f9fafa 24/20/20; title centred uppercase 700 #859c2e 20/18px "BLACKJACK CHEAT SHEET" (computed in headless Chrome) |
| 5 | Pass | No page sideways scroll at 500 (Chrome min) and 1280; inner table scroll + sticky "Your hand"; Lead Playwright screenshots at 390 and 1280 confirm |
| 6 | Pass | `npm run check` 67/67; only Write-list files; engine/, snapshot/, package.json unchanged |

Overall: PASS (story-reviewer, 2026-10-05). Notes: title #859c2e on #f9fafa ≈ 2.96:1 (E53 colour; flag for Figma S-13); rules line is static text — S-08 must build it from the rules.

