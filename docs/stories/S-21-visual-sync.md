# S-21 — Prototype looks like the signed-off Figma (tool only, no logic change)

State: reviewed (G3 pending) · Agent: ui-dev, then qa-tester (separate step) · Goal served: 2 (usable at the table: readable, printable chart) · Gate: G3 (visual sign-off)

## Why
Figma was signed off at G4 (D-074/075), but the prototype still has the older look (olive title, 9px "Changed" badge, grey toggle text). D-076 asks the prototype to match Figma exactly in look, with no change in behaviour, so Marius can approve the visuals (G3) before Codex review, push and the S-15 handoff.

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9)
- docs/figma/visual-spec.md (values) and the PNGs in docs/figma/: cs-default-chart-*, cs-reason-panel-*, cs-reason-panel-note-*, cs-rules-changed-*, cs-table-mode-*, cs-rules-collapsed-390, cs-swipe-cue-390, cs-print-*
- prototype/src/index.template.html, prototype/build.js
- test/prototype.test.js, test/g3-fixes.test.js (and any other test that fails after the restyle)
- qa-tester only: docs/qa/qa-run.mjs, docs/qa/2026-10-05-qa.md

## Write (only these)
- prototype/src/index.template.html, prototype/index.html (rebuilt with `node prototype/build.js`)
- Only the test files that need a style-assertion update (named in the report); optional new test/visual-sync.test.js (CSS token checks)
- qa-tester step, same story: docs/qa/qa-run.mjs, docs/qa/2026-10-05-qa.md (new section), docs/qa/visual/*.png

## Design (builder follows; D-076, D-077, D-078)
- **Tool only.** No page chrome. CSS and markup only. Strings, behaviour, engine, data flow unchanged.
- **Font:** Roboto, then system-ui fallback. No web font download (single offline file).
- **Changed cells (D-074):** rows stay 52px and never grow. Dashed inner outline plus a 12px corner triangle (white on Surrender). No "CHANGED" text badge; screen-reader text stays. Open/changed outline is light on dark Surrender cells.
- **Print:** title #404040, grid 0.75pt #5e6166, pocket sheet centred, pocket title left-aligned (D-078).
- **Rule toggles (D-078):** unselected text #5e6166. Focus ring 3px #404040 (white on Surrender).

## Out of scope
- Page chrome, new features, copy changes, `engine/`, `snapshot/`, `package.json`, Figma, Jira. Behaviour assertions in tests. No dependency added.

## Acceptance criteria
1. **Look matches (D-076, D-077).** At 1280 and 390, default chart, reason panel (with and without note), rules changed, table mode (empty, hand picked, result, result changed), collapsed rules and swipe cue match the listed Figma PNGs and visual-spec values (colours, Roboto sizes, spacing, buttons), with D-078 toggle text #5e6166.
2. **Changed marker (D-074).** Changed cells show the dashed inner outline and 12px corner triangle, no "CHANGED" text; every chart row measures 52px with and without changes; Surrender cells use the light outline and white triangle.
3. **Print (D-076, D-078).** Full-page and pocket print views use title #404040 and grid 0.75pt #5e6166; the pocket sheet is centred with a left-aligned title; no changed marks or count line appear in print.
4. **Nothing else changes (D-076, D-077).** No string, behaviour, engine or data-flow change; `npm run check` exits 0; the only edited test assertions are style-only ones, each listed in the builder's report as old → new (e.g. E53 olive title, 9px badge/'chg' markup, print title colour); no behaviour assertion edited.
5. **QA (D-076).** `docs/qa/qa-run.mjs` check 11 counts the new marker instead of the badge, and all 11 checks pass in real Chrome.
6. **Visual check (D-076, G3).** New check 12 saves docs/qa/visual/<screen>-<width>-side-by-side.png (prototype left, Figma right) at 1280×900 and 390×844 for default chart, reason panel (Hard 16 vs 10, defaults), rules changed (4–8 → 1) and table mode result (Hard 16 vs 10), with a short per-screen note of visible differences in docs/qa/2026-10-05-qa.md.

## Gate
G3 visual: Lead shows Marius the side-by-sides. Then Codex review, G6, handoff zip, S-15.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
Write list additions (D-079): prototype/build.js (icon mask inlining), test/print.test.js (pocket rule style assertion).
| 1 | Pass | Look matches spec at 1280/390 (reviewer measured palette, title #404040, uppercase lime-outline buttons, toggles #5e6166, 390 no sideways scroll, "Any dealer card" one line, pinned column + swipe cue); mode switch fixed to 14px after review. Accepted D-079 differences: font fallback, hyphen labels, dash pattern |
| 2 | Pass | 17 changed cells: dashed inner outline + 12px corner triangle (#1a1d22; white on Surrender); all rows 52px before/after; no "Changed" text; aria text kept |
| 3 | Pass | Print: title #404040, grid 0.75pt #5e6166, 1 page each on A4/Letter; pocket centred vertically on both (A4 31.0/31.0mm, Letter 33.9/33.9mm) after review fix; no change marks in print |
| 4 | Pass | Only CSS/markup (+ chg span removed, build.js icon mask); HEAD vs new build through node:vm: 34,582 outputs, 0 differences; `npm run check` 121/121; style-only assertion edits listed (prototype.test.js ×2, g3-fixes.test.js, print.test.js) |

Builder part: PASS (story-reviewer + Lead, 2026-10-05); ACs 5–6 pending QA. QA note: set html[data-print] before EACH page.pdf() (afterprint clears it).
| 5 | Pass | QA re-run at f381819: 12/12 PASS, exit 0 (qa-tester + reviewer re-run); check 5 fixed (flag set before each pdf, layout read from PDF text) — earlier pocket-Letter results had printed the full sheet, now proven for all 144; check 11 new marker + 52px rows, 216 transitions 0 mismatches |
| 6 | Pass | 8 side-by-sides in docs/qa/visual/ (prototype left, Figma right) with per-screen notes; Lead viewed rules-changed-1280, table-mode-result-390, reason-panel-390 |

Overall: PASS (story-reviewer + Lead, 2026-10-05), G3 visual pending. Open for G3: 390 reason panel — prototype scrolls the table to the tapped column (8–A, by design since S-10) while Figma shows 2–5; "Surrender" is cramped in 62px cells at 390 with the fallback font.

