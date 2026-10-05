# S-18 — Table mode: two taps (your hand, dealer card) give one big move

State: done (G1 D-045/D-051, batch D-058) · Agent: ui-dev · Goal served: 2 (usable at the table, correct for the player's rules) · Gate: none

## Why
At the table the player does not want to read a 300-cell chart. Table mode answers "what do I do with this hand against that dealer card"
in two taps on the rules already chosen on the page (D-051, D-055). The answer is the chart's own cell, never new logic.

## Read (only these)
- AGENTS.md (sections 1, 4, 9, 10)
- prototype/src/index.template.html, prototype/build.js
- test/prototype.test.js, test/rule-panel.test.js (`node:vm` pattern, `ChipyCheatSheet`)
- snapshot/charts-36.json (test truth)
- Read-only style source: ../chipy-blackjack-trainer/reference/blackjack_hand_strategy_calculator_mockup_v30.html
  (CSS ~lines 140–180: `.sa-rec*`, `.icon-circle`, `--lime-recommended-circle`, `--lime-active-btn-bg`, `--brand-lime`; markup `saRecommendedBlock()` ~lines 963–990)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/table-mode.test.js (new; `node:vm`)

## Out of scope
- Tap-for-reason panel (S-10), print (S-11), URL link (S-19), QA (S-12), final colours (S-13).
- Card picking, EV values, any new strategy logic. Any edit to `engine/`, `snapshot/`, `package.json` or existing tests.

## Design (builder follows)
- A "Table mode | Full chart" switch at the top; Full chart on load at every width (D-061).
- Table mode, tap 1, hand: Hard single totals 5–21 (chart rows: 5, 6, 7 → "5-7"; 8…17 one-to-one; 18, 19, 20, 21 → "18-21"),
  Soft A,2 … A,9 (chart rows 13…20), Pairs 2,2 … 10,10 and A,A. Tap 2, dealer card: 2…10, A.
- Result card in the Calculator's "Recommended Play" style: hand (e.g. "Hard 16", "A,7", "8,8"), "Dealer shows 10",
  one large move word with its CHIPY move icon (D-053 icons, already inlined), the cell's rule note shown separately when not null (D-022, D-030).
  A neutral "Recommended Play" title is fine; no "Optimal" pill that implies EV.
- Link text exactly "See every move's value in the Hand Strategy Calculator", href relative `/tools/blackjack-hand-strategy-calculator` (D-061, placeholder).
- Move and note come only from `buildChart(getRules())` cell lookup (D-051). Subscribe to `onRulesChange` (D-060).

## Acceptance criteria
1. **Switch and two-tap flow (D-055, D-061).** Page loads in Full chart. The switch shows Table mode, which offers the hand options above, then the 10 dealer cards;
   after the second tap the result card shows. Full chart view still works and is unchanged.
2. **Answer equals the chart cell (D-051, D-022).** For every hand option × 10 dealer cards × all 36 rule sets, the shown move and note equal the matching
   cell in `snapshot/charts-36.json`, including the Hard total → row mapping (7 → "5-7", 19 → "18-21"). Automated in `test/table-mode.test.js`.
3. **Result card content (D-055, D-030, D-053).** Shows the hand, "Dealer shows X", the move word with its CHIPY icon, the note as a separate line only when not null,
   and the link with the exact text and relative href. No EV numbers, no card picking (checked by test on the card's text/markup).
4. **Rules change updates the result (D-060).** With a result shown, changing any rule (setRules or the rule panel) updates the move and note at once,
   without re-tapping, and still equals the snapshot cell for the new rules.
5. **Phone and desktop (D-050, north-star "Mobile").** At 390px hand and dealer buttons are at least 44px tall and wide, and the page never scrolls sideways;
   at 1280 it works too. Checked by the Lead with Playwright screenshots (not an automated test).
6. **Gate hygiene (AGENTS §4, §9).** `npm run check` exits 0, S-07 and S-08 tests still pass, the no-network test still passes (relative link), and only Write-list files changed.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | Loads in Full chart; Table mode: 35 hand buttons → 10 dealer cards → result card; switching back restores the chart; S-07/S-08 tests unchanged |
| 2 | Pass | Independent mapping: 35 hands × 10 dealers × 36 rule sets = 12,600 answers vs snapshot, 0 move/note mismatches |
| 3 | Pass | Card: hand label, "Dealer shows X", icon + word, separate note only when non-null (D-030), exact Calculator link text + relative href (D-061); no EV, no Optimal pill, no card picking (D-055) |
| 4 | Pass | onRulesChange re-renders a shown answer (all 36 via setRules + panel events) |
| 5 | Pass | Lead Playwright: 390×844 width holds, Hard totals at 357px after D-062 collapse, Hard 16 vs 10 → SURRENDER; 1280 width holds, A,7 vs 3 → DOUBLE; targets ≥44px (CSS min 44×48) |
| 6 | Pass | `npm run check` 84/84; only Write-list files; engine/ snapshot/ package.json untouched |

Overall: PASS (story-reviewer, 2026-10-05). Notes for S-12/S-13: Calculator link ≈40px tall (<44px); switch order "Full chart | Table mode" (D-061 text corrected).

