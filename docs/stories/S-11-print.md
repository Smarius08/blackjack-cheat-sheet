# S-11 — Print, both sizes: one full-page chart and one pocket card, each with the chosen rules printed

State: done (G1 D-045, D-054; batch D-058) · Agent: ui-dev · Goal served: 2 (usable at the table, printable) · Gate: none

## Why
Print/save is a named differentiator (D-003). A player prints the chart for their own table rules, either as a full page
or as a small card to carry (D-054, D-064). The printed sheet must say which rules it is for, or it is useless later.

## Read (only these)
- AGENTS.md (sections 1, 4, 9, 10)
- prototype/src/index.template.html, prototype/build.js, test/prototype.test.js (pattern: `node:vm`, `ChipyCheatSheet`)
- engine/chart.js (API, D-033), snapshot/charts-36.json (test truth: rules, label, tables)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/print.test.js (new; `node:vm`)

## Out of scope
- Final colours (S-13), QA run (S-12), Figma, Jira. Table mode, reason panels, URL link: unchanged.
- Any edit to `engine/`, `snapshot/`, `package.json`, or the existing tests (prototype, rule-panel, table-mode, cell-reason, my-table-link).

## How it works (builder follows)
- Two buttons, "Print chart" and "Print pocket card". Each sets a print-mode flag on `<html>` (`data-print="full"` or `"pocket"`)
  and calls `window.print()`; the flag is cleared afterwards. `@media print` shows only the chosen layout. Ctrl/Cmd+P without a button = full page.
- Print markup is built from `buildChart(getRules())` at print time, never kept stale.
- Pocket letters: HIT→H, STAND→S, DOUBLE→D, SPLIT→P, SURRENDER→R.

## Acceptance criteria
1. **Full page shows the right content (D-053, D-039, D-054).** For all 36 rule sets, the full-page print markup has the title, a rules sentence equal to the
   snapshot `label`, and the Hard, Soft (rows shown A,2–A,9, D-049) and Pairs tables; every cell's move word equals the snapshot move and carries its move icon. A legend is present.
2. **Full page is print-clean and fits one page (D-054).** In print the rule panel, mode switch, table mode, reason panels, buttons and URL are hidden.
   Headless Chrome `--print-to-pdf` gives exactly 1 page, portrait, on both A4 and US Letter (checked by Lead/reviewer, not an automated test).
3. **Pocket card content is right (D-064).** For all 36 rule sets, panel 1 holds Hard and panel 2 holds Soft + Pairs; every cell shows one letter whose value equals the
   snapshot move through the mapping above; the legend reads "H Hit · S Stand · D Double · P Split · R Surrender"; the rules sentence equals the snapshot `label`.
4. **Pocket card layout (D-064).** One landscape A4/Letter sheet with two A6 panels (105×148 mm each) side by side and a dashed fold/cut line between them.
   `--print-to-pdf` gives exactly 1 sheet on A4 and on Letter, with both panels fully inside the page (checked by Lead/reviewer).
5. **Readable in black and white (D-064).** In a grayscale render of the pocket card, every letter is dark, bold, large enough to read at A6 size, and distinguishable from its neighbours
   without the tint; the tint is never the only signal. Checked by Lead/reviewer.
6. **Never stale, nothing else broken (D-060, AGENTS §4, §9).** After `setRules` to another combo, the next print markup shows the new rules and moves. `npm run check` exits 0,
   the stale-build test still passes, the five existing test files are unchanged, and only Write-list files changed.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Full page for all 36: title, rules sentence = snapshot label, legend, Hard/Soft (A,2–A,9)/Pairs, word + icon per cell = snapshot (independent vm check) |
| 2 | Pass | Print hides shell/panels/buttons; print-color-adjust exact; headless Chrome: A4 /Count 1 (595×842), Letter /Count 1 (612×792), also with the longest label |
| 3 | Pass | Pocket for all 36: Hard panel + Soft/Pairs panel, one letter H/S/D/P/R per cell = snapshot, rules + legend on both panels |
| 4 | Pass | Named page landscape; 2 × 105×148mm panels, dashed fold, corner marks; A4 /Count 1 (842×595), Letter /Count 1 (792×612) |
| 5 | Pass | Greyscale render (reviewer + Lead): letters black 9–11pt weight 900, readable without tint |
| 6 | Pass | Print markup rebuilt on every rules change + beforeprint + printSheet; `npm run check` 105/105; existing tests unchanged |

Overall: PASS (story-reviewer, 2026-10-05). Notes for S-12/S-13: browser print dialog headers/footers (URL, date) need a manual check; "Surrender" tight in 19mm full-page cells; pocket card not vertically centred.

