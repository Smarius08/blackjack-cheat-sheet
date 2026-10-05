# S-04 — `snapshot/charts-36.json`: all 36 charts saved, plus a test that the engine still matches

State: done · Agent: engine-dev · Goal served: 2 (correct chart for the player's rules) · Gate: G2

## Why
There are 36 possible rule combinations (3 decks × 2 soft-17 × 2 double-after-split × 3 surrender). A saved copy of all 36 charts
becomes the "right answer" that QA checks the prototype against (AGENTS.md §5; north-star "Engine").

**Gate G2 (plain words):** Marius must approve the 36 saved charts, including the plain-words label wording (D-024), because from
then on they are the truth QA compares against. The builder stops after the tests pass and the Lead asks for G2.
`snapshot/charts-36.json` is not committed until Marius says yes.

## Read (only these)
- AGENTS.md
- docs/north-star.md ("Engine")
- engine/chart.js (from S-03; the one exported function and its cell shape)
- test/chart.test.js (only to copy the test style)

## Write (only these)
- snapshot/generate.js
- snapshot/charts-36.json
- test/snapshot.test.js

## Out of scope
- Changing `engine/chart.js` or anything in `engine/vendor/` (AGENTS.md §9).
- The review page (S-05), reasons text (S-06), any UI, and `package.json` (run the generator with `node snapshot/generate.js`).

## Acceptance criteria
1. `node snapshot/generate.js` calls `engine/chart.js` for all 36 combinations (3 × 2 × 2 × 3) and writes `snapshot/charts-36.json`. It has no dependency and uses Node only (north-star "Engine"; D-018; AGENTS.md §10).
2. Running the generator twice gives byte-identical files: fixed key order, LF line endings, one trailing newline (AGENTS.md §10).
3. Each chart is `{ id, rules, label, tables }` (D-023). `rules` = `{ decks: "1"|"2"|"4-8", soft17: "stands"|"hits", das: "yes"|"no", surrender: "none"|"any"|"except_ace" }`. `id` looks like `decks=4-8|soft17=hits|das=yes|surrender=any`. `label` is plain words such as "4–8 decks · Dealer hits on soft 17 · Double after split allowed · Surrender: any dealer card" (D-024, D-039). `tables` holds Hard, Soft and Pairs in the fixed rows, dealer 2 through A (D-020). Charts appear in this order: decks 1, 2, 4-8, then soft17 stands, hits, then das yes, no, then surrender none, any, except_ace (D-023).
4. Every cell in the JSON keeps `{ move, code, note }` exactly as `chart.js` returns it (D-022).
5. `test/snapshot.test.js` re-runs `chart.js` for all 36 combinations and fails, naming the chart id and cell, on any difference from the committed JSON. It also fails if the JSON does not hold exactly 36 distinct ids (north-star "Engine": 36 charts = QA truth).
6. `npm run check` exits 0, no file other than the three listed in Write was added or changed, and nothing is committed until Marius approves at G2 (AGENTS.md §4, §5, §7, §9).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | generate.js loops 3×2×2×3, calls buildChart, writes snapshot/charts-36.json; requires only node:fs, node:path, engine/chart.js |
| 2 | Pass | Two runs → same SHA-256 41d5ae60…4668ede (1,472,411 B); LF only, one trailing newline (D-038) |
| 3 | Pass | { charts: [36] }; keys id/rules/label/tables in order; ids + D-023 order checked (0 mismatches); labels per D-024 (U+2013, U+00B7 verified); D-020 rows |
| 4 | Pass | Independent rebuild: 10,800 cells, move/code/note 0 mismatches (D-022) |
| 5 | Pass | Temp-copy mutation (hard 13 vs 6) → exit 1 naming chart id + row + dealer; duplicate id → fails |
| 6 | Pass | `npm run check` 30/30, exit 0; only the 3 Write files added; engine/ and package.json unchanged; nothing committed |

Overall: PASS (story-reviewer, 2026-10-06). Observations: 1.47 MB file; label wording also written in the test (independent check); generator prints one line.
G2 (D-039): approved with wording "Dealer hits on soft 17" and "Surrender: any dealer card except ace"; regenerated — 10,800 cells identical, 24 labels changed; SHA-256 fb91953d…6cf970.
