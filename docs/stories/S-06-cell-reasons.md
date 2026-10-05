# S-06 — `engine/why.js`: a plain-words reason for every chart cell

State: done · Agent: engine-dev · Goal served: 2 (usable at the table) · Gate: none

## Why
When a player taps a cell they should see why that move is right, in plain words (north-star "MVP scope"; D-003).
This story builds the function that produces that short reason from the Trainer's existing explanation text. It does not build the tap UI (S-10).

## Read (only these)
- AGENTS.md
- docs/north-star.md ("MVP scope")
- engine/vendor/explanation_writer.js (from S-02; exports `getStrategyExplanation`, `rankValue`)
- engine/chart.js (from S-03; shape of a cell `{ move, code, note }` and the row labels)
- test/chart.test.js (only to copy the test style)

## Write (only these)
- engine/why.js
- test/why.test.js

## Out of scope
- Editing anything in `engine/vendor/` (AGENTS.md §9), changing `chart.js`, the snapshot or `charts-36.json`.
- Any UI or tap behaviour (S-10); showing the cell's note; adding reasons to the snapshot.

## Acceptance criteria
1. `engine/why.js` exports one pure function. Given one `chart.js` cell, its table (Hard / Soft / Pairs), its row label and the dealer card (2 to A), it returns the string from the vendored `getStrategyExplanation`, as is (usually 1–2 sentences), never rewritten or shortened (D-028; AGENTS.md §9). It returns the reason only; the cell's `note` is not added to it (D-030).
2. The writer inputs come from the cell and row only: `move` is the cell's move; `soft` is true only in the Soft table (and for A,A); `pair` is the card rank for Pairs rows, else null; A,A is soft 12 with pair 'A'; `total` follows D-021 (row number, lowest of a range, Pairs = 2 × card value), so the 18-21 row quotes 18 (D-020; D-021; D-029).
3. A test runs every cell of all 36 charts and finds a non-empty reason string for each (north-star "Engine": 36 charts; D-020).
4. A test checks at least five hand-picked cells against the exact vendor string, covering all five moves (HIT, STAND, DOUBLE, SPLIT, SURRENDER), at least one Soft cell and one Pairs cell, including A,A.
5. The module has no DOM use and no dependency, and loads in both Node and the browser the way the vendor files do (D-004; D-018).
6. `npm run check` exits 0, no file other than the two in Write was added or changed, and `engine/vendor/` is unchanged (AGENTS.md §4, §9).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | `reasonFor` (D-041) returns the vendored getStrategyExplanation text untouched; note never read (D-028, D-030) |
| 2 | Pass | Independent input mapping vs direct vendor call: 36 charts, 10,800 cells, 0 mismatches; 18-21 quotes "18" (D-029) |
| 3 | Pass | Test covers every cell of all 36 charts (10,800) → non-empty string |
| 4 | Pass | 12 hand-picked exact-string tests (all five moves, Soft, Pairs, A,A, 18-21); mutations caught (18-21→21, note appended, pair null) |
| 5 | Pass | No DOM; only require is the vendor writer; ChipyEngine.why; vm browser test matches Node |
| 6 | Pass | `npm run check` 57/57, exit 0; only the two Write files added; engine/vendor, chart.js, snapshot unchanged |

Overall: PASS (story-reviewer, 2026-10-05). Gap closed before commit: A,A soft mapping had no catching test (A,A is SPLIT everywhere) → added synthetic STAND/HIT/DOUBLE test; mutation now fails it; 58/58.
Notes for S-10 (reviewer): 18-21 row says "Your 18…"; 5-7 reason says "without busting"; 33 distinct reasons across 10,800 cells, mostly not naming the dealer card or rule; pair reasons start "You can split this pair, but…" even on HIT/STAND/DOUBLE; "Soft" is not explained.

