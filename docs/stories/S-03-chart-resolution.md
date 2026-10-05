# S-03 — `engine/chart.js`: the player's 4 rules in, 3 tables of plain moves out

State: done · Agent: engine-dev · Goal served: 2 (correct chart for the player's rules) · Gate: G2 (D-019)

## Why
The player wants one chart that is right for their table, with plain words instead of codes like "Rh" (north-star "User problem").
This story turns the 4 rule choices into the Hard, Soft and Pairs tables, one plain move per cell, using the vendored engine.

**Gate G2 (plain words):** Marius must approve the cell-resolution rules before anything is committed. The builder stops
after the tests pass and the Lead asks for G2. Nothing is committed until Marius says yes.

## Read (only these)
- AGENTS.md
- docs/north-star.md ("MVP scope", "Engine")
- engine/vendor/strategy_table.js (from S-02; exports `STRATEGY_TABLE`, `resolveCode`)
- test/vendor-checksum.test.js (only to copy the test style)

## Write (only these)
- engine/chart.js
- test/chart.test.js

## Out of scope
- Editing or re-implementing anything in `engine/vendor/` (AGENTS.md §9).
- The 36-chart snapshot (S-04), the review page (S-05), reasons text (S-06), any UI.
- The double-restriction setting (fixed to "any two cards", D-002).

## Acceptance criteria
1. `engine/chart.js` exports one pure function taking the 4 rules (decks 1 / 2 / 4–8, dealer soft 17 stands / hits, double after split yes / no, surrender not allowed / any / except ace) and returning Hard, Soft and Pairs tables, dealer 2 through A. The rows are, top to bottom: Hard 5-7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18-21; Soft 13 to 20; Pairs 2,2 up to 10,10, then A,A. Double and Multi read the engine's "5-8" row for both Hard 5-7 and Hard 8; Single reads its own "5-7" and "8". Each cell is `{ move, code, note }`: move is one of HIT, STAND, DOUBLE, SPLIT, SURRENDER; code is the engine's source code; note is resolveCode's note or null (D-020, D-022; D-002).
2. Every cell is resolved by calling the vendored `resolveCode` with firstDecision = true, postSplit = false and doubleRestriction = 0. `total` is the row number, or the lowest number of a range (5-7 gives 5, 18-21 gives 18); for Pairs it is 2 times the card value (A,A gives 12). `chart.js` contains no copy of strategy rules and `engine/vendor/` is unchanged (north-star "Engine"; D-021; AGENTS.md §9).
3. Tests check hand-picked cells whose answer changes with one rule, each flipped on and off: Pair 8 vs A (surrender), Hard 16 vs 10 (surrender), and a cell coded "Ph" with double-after-split yes then no (note filled when blocked). Decks and soft-17 choices pick a different underlying table (north-star "Engine" keys).
4. A test runs all 36 rule combinations (3 × 2 × 2 × 3) and finds, in every one, no UNAVAILABLE move, no missing cell, and the same row labels in the same order (north-star "Engine": 36 charts; D-020).
5. The module has no DOM use, no dependency, and loads in both Node and the browser the way the vendor files do (D-004; D-018; AGENTS.md §10).
6. `npm run check` exits 0, no file other than the two listed in Write was added or changed, and nothing is committed until Marius approves at G2 (AGENTS.md §4, §5, §7, §9; D-019).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | `buildChart(rules)` (D-023 rules, validated); rows/labels per D-020/D-033; Double/Multi 5-7 & 8 → engine "5-8", Single own rows; cell = { move, code, note }; only the 5 moves found |
| 2 | Pass | resolveCode(code, d, total, true, label, false, {…, doubleRestriction: 0}); D-021 totals; no rule tables in chart.js. Independent script: 36 combos, 10,800 cells, 0 mismatches vs STRATEGY_TABLE + direct resolveCode |
| 3 | Pass | Pair 8,8 vs A (Rp), Hard 16 vs 10 (Rh), Pair 2,2 vs 2 (Ph) each flipped, note checked; decks (Hard 8 vs 5) and soft-17 (Hard 17 vs A) pick different tables |
| 4 | Pass | 36-combo test: same labels/order, 10 cells per row, no UNAVAILABLE (HIT 4249, STAND 2809, DOUBLE 1860, SPLIT 1798, SURRENDER 84) |
| 5 | Pass | Vendor-style UMD wrapper; only require is ./vendor/strategy_table.js; browser global ChipyEngine.chart; vm-context test matches Node; no DOM |
| 6 | Pass | `npm run check`: 21/21 pass, exit 0; only the two Write files added; engine/vendor unchanged; nothing committed |

Overall: PASS (story-reviewer, 2026-10-05). Observations: also exports constants RULE_VALUES and COLUMNS; settings carries unused dealerHitsSoft17/deckCount.

