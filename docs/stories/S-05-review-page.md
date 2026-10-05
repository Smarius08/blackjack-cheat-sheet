# S-05 — `snapshot/review.html`: one page where Marius and the reporter check all 36 charts by eye

State: done · Agent: engine-dev · Goal served: 2 (correct chart for the player's rules) · Gate: G2

## Why
Marius is not a Blackjack expert and the reporter (outside the team) approves concept and engine (north-star). They need to
look at all 36 charts in one place before the snapshot becomes the QA truth. This is an internal review aid, NOT the D1 prototype:
no CHIPY shell, no rule controls, no design polish (those are S-07 to S-11).

**Gate G2 (plain words):** Marius and the reporter use this page to decide whether the 36 saved charts (S-04) are right. The
builder stops after the tests pass. The page is committed only after Marius approves at G2.

## Read (only these)
- AGENTS.md
- snapshot/charts-36.json (from S-04; the data the page shows)

## Write (only these; layout per D-025)
- snapshot/build-review.js (Node script: reads the JSON, writes the HTML with the data inlined)
- snapshot/review.html
- test/review.test.js

Why inlined: a page opened by double-click (file://) cannot load a local JSON file in Chrome (D-025).

## Out of scope
- `snapshot/generate.js`, `snapshot/charts-36.json`, `package.json`, `engine/` (incl. vendor), reasons text (S-06), the prototype.
- Rule controls, CHIPY styling, print layout, mobile layout.

## Acceptance criteria
1. `node snapshot/build-review.js` (Node only, no dependency; D-018, D-025, AGENTS.md §10) writes `snapshot/review.html` from `snapshot/charts-36.json`, with the data inlined. Running it twice gives identical bytes (LF endings). Opened from file:// the page shows all charts with no network request: no `fetch`, no `http(s)://` in any `src`/`href`/`link`/`script`.
2. The page starts with a short index of all 36 chart labels, grouped by deck count (1 deck / 2 decks / 4–8 decks), each linking to its chart by in-page anchor (Marius, S-05 approval 2026-10-05). Below it are exactly 36 charts, each headed by its `label` (D-024), in snapshot order: decks 1, 2, 4-8, then soft17 stands, hits, then das yes, no, then surrender none, any, except_ace (D-023).
3. Each chart has three tables, Hard, Soft and Pairs, with the fixed rows in D-020 order and dealer columns 2 to A (north-star "Chart"; D-020).
4. Each cell shows the plain move in words (Hit, Stand, Double, Split or Surrender) as its main text, with the engine code (e.g. "Dh") in small text underneath (D-027), and is coloured per move (D-026; review page only). Every cell whose `note` is not null is visibly marked and its note text is readable on the page (small text or tooltip); cells with `note` null carry no mark (D-022).
5. Colour is never the only signal: the move word is always present (D-026), and the same move always gets the same colour across all 36 charts.
6. `test/review.test.js` fails if `snapshot/review.html` differs from what `build-review.js` would write now (D-025), and checks criteria 2 and 4 on the HTML: 36 index links and 36 headings in order, every cell's main text is a plain move word, and the code appears only as the secondary small text. `npm run check` exits 0, only the three Write files were added, and nothing is committed until Marius approves at G2 (AGENTS.md §5, §7, §9).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Node built-ins only; static HTML (no script/JSON blob, D-025); two builds SHA-256 e1796bdb…8c91; LF; no http(s)/fetch/script/link/src; all 72 hrefs are "#" |
| 2 | Pass | Index 12/12/12 under 1 deck / 2 decks / 4–8 decks, link texts = labels in order, all resolve; 36 h2 = labels in D-023 order (D-039 wording) |
| 3 | Pass | Each chart: Hard/Soft/Pairs, columns 2…A, D-020 rows; 0 mismatches |
| 4 | Pass | Independent parse: 10,800 cells, move word/code/note 0 mismatches; code in small text (D-027); colour class per move (D-026); 224 note cells marked + listed, null-note cells unmarked |
| 5 | Pass | Move word in every cell; one colour per move, five distinct |
| 6 | Pass | `npm run check` 36/36, exit 0; one-cell mutation in scratch copy fails 2 tests; only the 3 Write files added; nothing committed |

Overall: PASS (story-reviewer, 2026-10-05). Observations: ~950 KB; engine codes not explained on the page; one vendor note says "Hit instead." vs "Use X instead." (engine text, not S-05).
G2 (D-040): approved plus engine-code key in the intro (test checks every snapshot code is named); re-verified 10,800 cells, 37/37 tests; SHA-256 447a3afd…140716. Note: key's Pd line omits the "hit if double not allowed" branch, unreachable while double is fixed to any two cards (D-002).
