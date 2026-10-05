# S-07 — `prototype/index.html`: CHIPY shell + the default chart (Hard / Soft / Pairs)

State: approved · Agent: ui-dev · Goal served: 2 (usable chart, correct for the rules) · Gate: none (G3 comes at S-12)

## Why
First screen of the D1 prototype (D-004). A player opens one HTML file and sees a plain-word chart for the default table rules,
inside the CHIPY Trainer shell (D-045). Moves come from the real engine at runtime, never typed into the page. Merges old S-09.

Defaults on load (D-045): 4–8 decks · dealer hits soft 17 · double after split allowed · surrender any dealer card
= `buildChart({ decks:"4-8", soft17:"hits", das:"yes", surrender:"any" })`.

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9, 10)
- engine/chart.js (API, D-033), engine/why.js (loaded only, not used yet), engine/vendor/*.js (inlined, never edited)
- snapshot/charts-36.json (test truth for the default chart)
- Read-only reference: ../blackjack-quiz/docs/decisions.md row E53; ../blackjack-quiz/app/public/css/styles.css (`--shadow-shell`)
- test/review.test.js and snapshot/build-review.js (build-script and stale-check pattern, D-025)

## Write (only these; builder may rename the template, then must list it here)
- prototype/build.js (Node only, no dependency; D-018, AGENTS §10)
- prototype/src/index.template.html (hand-written source)
- prototype/index.html (build output)
- test/prototype.test.js

## Out of scope
- Rule controls (S-08), tap/reason panel (S-10), print (S-11), QA run (S-12).
- Any edit to `engine/`, `snapshot/`, `package.json`. No dependency added.

## Acceptance criteria
1. **Single file, real engine (D-045, D-004, D-025).** `node prototype/build.js` writes `prototype/index.html`, inlining unchanged and in this order `engine/vendor/strategy_table.js`, `engine/vendor/explanation_writer.js`, `engine/chart.js`, `engine/why.js`. `test/prototype.test.js` fails if any inlined block is not byte-identical to its engine file (de-escaped if any `</script` is escaped), if `index.html` differs from the build output now (stale check), or if the page has any `http(s)://` `src`/`href`, or `fetch`.
2. **Right chart on load (D-045, D-033).** With no clicks, the page shows the default chart, and every cell's move word equals the matching cell of snapshot chart `decks=4-8|soft17=hits|das=yes|surrender=any` (test runs the built page script, e.g. in `node:vm`). No move text is hard-coded in the template.
3. **Rows and cells (north-star "Chart"; D-020, D-049, D-022).** Three tables, Hard, Soft, Pairs; columns dealer 2…10, A; rows from `chart.js`. Soft rows are displayed as A,2 … A,9 (display only: 13→A,2 … 20→A,9). Each cell shows only the plain move word (Hit, Stand, Double, Split, Surrender) and a colour per move; no engine codes (e.g. "Dh") anywhere on the page; colour is never the only signal. A small legend names the five moves with their colours.
4. **Shell exactly as Quiz E53 (D-045).** Card 852px wide on desktop (804px content + 24px padding), full width minus the page margin on mobile, 16px radius, shadow `0 -1px 20px 2px rgba(0,0,0,0.1)`, no border. Header band `#f9fafa`, padding 24/20/20, title "BLACKJACK CHEAT SHEET" centred, uppercase, bold, `#859c2e`, 20px desktop / 18px mobile, no icon.
5. **Readable at 390px and 1280px (north-star "Mobile"; AGENTS goal 2).** At both widths the page has no sideways page scroll, nothing overlaps or is clipped, and all 10 dealer columns plus row labels are readable. Checked by the Lead with Playwright screenshots at 390 and 1280 (not an automated test).
6. **Gate hygiene (AGENTS §4, §7, §9).** `npm run check` exits 0, and only the four Write files were added or changed.

## Open question for Lead
1. **390px layout (design call).** Ten columns plus a label at 390px is about 35px per column. Options: A) fit all columns with small type, no scrolling; B) the table scrolls sideways inside its own box with a sticky row-label column. Criterion 5 currently demands no page-level sideways scroll only. Please choose.
2. **Move colours.** D-026 says prototype colours are decided in S-09, which is now merged here, and no decision names them. Proposal: builder picks five distinct colours, reuses the S-05 palette unless you say otherwise. Please confirm.
3. **Title text.** "BLACKJACK CHEAT SHEET" traces to the north-star tool name plus E53 uppercase styling. No decision fixes the exact wording. Confirm or change.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
