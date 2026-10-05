# S-10 — Tap a chart cell: a panel under the table says why that move is right

State: done (G1 D-045, batch D-058) · Agent: ui-dev · Goal served: 2 (usable at the table) · Gate: none

## Why
A player who sees "Surrender" or "Double" wants the reason in plain words, without leaving the chart (north-star "MVP scope"; D-003).
The reason text already exists (S-06 `reasonFor`, D-028). This story only shows it. No hover, so it works on a phone (D-045).

## Read (only these)
- AGENTS.md (sections 1, 4, 9, 10)
- prototype/src/index.template.html, prototype/build.js
- test/prototype.test.js, test/rule-panel.test.js, test/table-mode.test.js (`node:vm` pattern, `ChipyCheatSheet`)
- engine/why.js (API only: `ChipyEngine.why.reasonFor({ table, row, dealer, cell })`)
- snapshot/charts-36.json (test truth)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/cell-reason.test.js (new; `node:vm`)

## Out of scope
- Print (S-11), URL link (S-19), QA (S-12), final colours (S-13).
- Any edit to `engine/`, `snapshot/`, `package.json` or existing tests; rewording or shortening the reason; hover behaviour; EV numbers.
- Changing cell markup the existing tests use (`data-row`, `data-move`, `.mw`, `.mi-*`).

## Design (builder follows)
- Panel opens inline directly under the tapped table, one panel per table (Hard, Soft, Pairs), placed outside the table's sideways-scroll box (D-063, D-050).
- Panel shows: row label as displayed + dealer (e.g. "Hard 18–21 vs dealer 10", "A,7 vs dealer 3", "8,8 vs dealer A"); the move (CHIPY icon + word, D-053);
  the reason; the cell's note in its own element, only when not null (D-029, D-030, D-049).
- Soft rows are shown as A,2…A,9 but `reasonFor` gets the engine label (13…20) (D-020, D-049).
- Keyboard: one Tab stop per table, arrow keys move between cells (roving tabindex), Enter or Space opens (D-063).
- A rules change re-renders the open panel for the new rules (D-060).

## Acceptance criteria
1. **Open and close (D-063, D-045).** Tapping or clicking a cell opens the panel under that table; tapping another cell replaces its content; a close button and Escape close it. There is no hover behaviour. Each table has at most one panel.
2. **Keyboard (D-063).** Each table is one Tab stop; arrow keys move between its cells; Enter and Space open the panel for the focused cell. Checked by test (`tabindex` values, key events).
3. **Reason is the engine's (D-028, D-041, D-003).** For every cell of all 36 charts, the panel's reason text equals `reasonFor` called with the engine row label (13…20 for Soft), verified in `test/cell-reason.test.js`; the reason text is never edited.
4. **Labels and note (D-029, D-030, D-049).** The label shown is the display label ("A,7", "Hard 18–21", "8,8") plus the dealer card; the note sits in a separate element and appears only when the cell's note is not null (tested on all 36 charts against the snapshot).
5. **Rules change (D-060).** With a panel open, changing any rule (setRules or the rule panel) re-renders it at once with the new rules' move, reason and note, equal to the snapshot cell. Checked by test.
6. **Gate hygiene and screens (D-050, AGENTS §4, §9).** `npm run check` exits 0; S-07, S-08 and S-18 tests pass unchanged; only Write-list files changed. At 390 and 1280 the panel is readable and the page never scrolls sideways (Lead Playwright screenshots, not an automated test).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Tap/click opens the panel under that table (one per table, outside the scroll box); another cell replaces it; Close + Escape return focus; no hover-driven content |
| 2 | Pass | Roving tabindex: one Tab stop per table, arrows/Home/End stop at edges, Enter/Space open; every column reachable (focus scrolls the box) |
| 3 | Pass | Independent check: 10,800 cells, reason = reasonFor(engine row) unchanged, move/note = snapshot, 0 mismatches |
| 4 | Pass | Titles use display labels ("Hard 18–21", "A,7", "8,8"); note in its own element only when non-null (231 cells) |
| 5 | Pass | Open panel re-renders on rules change (all 36, setRules + panel events) |
| 6 | Pass | `npm run check` 91/91; existing tests unchanged. Lead Playwright: 390 width holds, 8,8 vs A → SURRENDER + reason, 9,9 vs 7 → STAND, cell + panel both in view after review fix; 1280: A,7 vs 2 → DOUBLE, panel in view |

Overall: PASS (story-reviewer, 2026-10-05). Review fix before commit: scroll-padding for the pinned column, sticky header above cells, tapped cell kept in view (SHA-256 c21a70c3…40bb2). Notes for S-12: Escape after tap on iOS Safari (no focus on click); focus loss if Close is focused during a re-render.

