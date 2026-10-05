# S-20 — G3 fixes: scroll cue, bigger Calculator link, "What your rules change"

State: done (G3 D-068) (G3 first pass D-066; D-067; batch D-058) · Agent: ui-dev, then qa-tester (separate step) · Goal served: 2 (usable at the table, chart correct for the player's rules) · Gate: G3

## Why
Marius's first G3 review found three things, and asked for them in one fix story (D-066, D-067): (1) at phone width players do not see that the chart
scrolls sideways (QA F1); (2) the Calculator link is too small to tap (QA F3); (3) when a player changes the rules, they cannot see which moves
changed (feature E, D-067).

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9)
- prototype/src/index.template.html, prototype/build.js (API: `setRules`, `getRules`, `onRulesChange` fires only on a real change D-060, `buildChart`, `tableAnswer`, `renderChartHTML`, `rulesFromQuery`; `init()` applies the URL query before the first render, S-19)
- test/rule-panel.test.js (pattern: `node:vm`), snapshot/charts-36.json (test truth), docs/qa/qa-run.mjs and docs/qa/2026-10-05-qa.md (qa-tester only)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/g3-fixes.test.js (new)
- qa-tester step, same story: docs/qa/qa-run.mjs, docs/qa/2026-10-05-qa.md (updated, or a new dated report), docs/qa/screenshots/*.png

## Design (builder follows)
- **Scroll cue (D-066, D-050).** At 600px and narrower, each chart table's scroll box shows a fade on its right edge and the hint "Swipe for dealer 6–A" while columns are hidden on the right. Both disappear once scrolled to the end. The page itself never scrolls sideways.
- **Link.** "See every move's value in the Hand Strategy Calculator" gets a tap target at least 44px tall (D-055).
- **Diff (D-067).** Pure function `diffCharts(oldRules, newRules)` returns `[{table,row,dealer,from,to}]`, one entry per cell whose `move` differs. On a change through the rule panel or `setRules`, mark each changed cell with an outline plus a small "changed" badge and screen-reader text (not colour only). Show one line with a Dismiss button: "5 moves changed for your new rules", "1 move changed for your new rules", or "No moves changed for your new rules" (Lead choice). The highlight stays until Dismiss or the next rule change, which replaces it with the diff against the previous rules.
- **Never highlighted:** first load, a page opened from a my-table link (`?query`, D-054), and print output (S-11).
- **Table mode (D-061, D-062).** If the answer on screen has a different move under the new rules, the result card shows "Changed for your new rules" (same marker idea, not colour only).

## Out of scope
- Trainer/Quiz links (D-057, covered by the carousel). Title contrast F2 (goes to the S-13 Figma brief). Any edit to `engine/`, `snapshot/`, `package.json`, or existing tests. No dependency added.

## Acceptance criteria
1. **Scroll cue (D-066, D-050).** At 390px the fade and "Swipe for dealer 6–A" show on each chart table while columns are hidden on the right, are gone after scrolling to the end, and never show at 1280px; `document.scrollWidth` equals `innerWidth` at both.
2. **Link size (D-066, D-055).** The Calculator link measures at least 44px tall at 390px and at 1280px (table mode with a result showing).
3. **Count and marks are exact (D-067).** For all 216 transitions (each of the 36 combos × each single-field change to another value), the number of marked cells and the number in the count line both equal the number of cells whose `move` differs, and singular/plural/zero wording is right. Checked by `diffCharts` in test/g3-fixes.test.js and by the browser in QA.
4. **When it shows, and when not (D-067, D-060, D-054).** No highlight on first load or on a `?query` load; Dismiss clears it; the next rule change replaces it; no change in rules shows nothing new; table mode marks the result card when its move changed and not when it did not; the print view never shows marks or the count line.
5. **Nothing else breaks (D-060).** Existing tests (prototype, rule-panel, table-mode, cell-reason, my-table-link, print) are unchanged and pass, and `npm run check` exits 0 with only Write-list files changed.
6. **QA re-run (D-066, D-058).** qa-tester adds checks for 1–4, re-runs the full QA in real Chrome, all checks pass, the report is updated, and screenshots are refreshed, including the highlight at 390 and at 1280. Then the Lead brings G3 back to Marius.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Hint "Swipe for dealer 6–A" + right fade only ≤600px when has-more; pointer-events none; pinned column clear; hidden at 1280 (Lead Chrome 390: visible) |
| 2 | Pass | .sa-link inline-flex, min-height 44px (CSS + test) |
| 3 | Pass | Independent: 216 transitions, diffCharts = marked cells = badges = expected (min 1, max 17), count text singular/plural, 0 mismatches |
| 4 | Pass | No markers on first load or ?query load (test fixed to really load a query); Dismiss clears; next change diffs vs previous rules; table-mode card marked exactly when its move changed (350 pairs); print markup clean |
| 5 | Pass | `npm run check` 118/118; existing tests unchanged; only Write-list files |
| 6 | Pass | QA re-run at 1a0410c: checks 1–11 PASS, exit 0 (qa-tester + reviewer's own re-run, 2:56); check 11 = 216 real-click transitions, expected counts from snapshot only, 0 mismatches; 8 screenshots incl. rules-changed-390/1280. QA_TABLE_CLICKS=all not re-run (table answers unchanged; covered by checks 1, 2, 11) |

Builder part: PASS (story-reviewer, 2026-10-05). Note for QA: 9px "Changed" badge legibility at 390.
AC 6: PASS (story-reviewer, 2026-10-05). F1, F3 closed; F4 low (9px badge overlaps icon top) + F2 low → S-13 Figma brief.
