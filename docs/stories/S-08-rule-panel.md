# S-08 — Rule panel: 4 table-rule controls that redraw the chart and the rules sentence

State: done (G1 D-045, batch D-058) · Agent: ui-dev · Goal served: 2 (chart correct for the player's rules) · Gate: none

## Why
The player picks the rules printed on their table (decks, dealer on soft 17, double after split, surrender) and the chart
changes to match (north-star MVP; D-002). The "Table rules: …" sentence must come from the active rules, not static text.
This story also creates the single place rules live, so table mode (S-18) and the my-table link (S-19) can plug in later.

## Read (only these)
- AGENTS.md (sections 1, 4, 9, 10)
- prototype/src/index.template.html, prototype/build.js, test/prototype.test.js (S-07 pattern: `node:vm`, `ChipyCheatSheet`)
- engine/chart.js (API, D-033), snapshot/charts-36.json (test truth: rules, label, tables)
- Read-only style source: ../chipy-blackjack-trainer/reference/blackjack_hand_strategy_calculator_mockup_v30.html (`.toggle-opt` CSS)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/rule-panel.test.js (new; `node:vm`, same pattern as test/prototype.test.js)
- prototype/build.js only if needed

## Out of scope
- Table mode (S-18), tap/reason panel (S-10), print (S-11), URL link (S-19), QA (S-12), final colours (S-13).
- Any edit to `engine/`, `snapshot/`, `package.json`. No dependency added.

## Design and architecture (builder follows)
- Four segmented toggles in the CHIPY "Table rules" toggle style, each backed by native radio inputs (keyboard and screen readers work).
  Controls wrap on narrow screens; the page never scrolls sideways (D-050).
- One `state.rules` (D-023 shape). `setRules(rules)` validates, redraws chart + rules sentence + control selection, then calls one
  change hook that later features can subscribe to. `ChipyCheatSheet` also exposes `getRules()` and `setRules()`. DOM only in `init()`.

## Acceptance criteria
1. **Four controls, right options and defaults (D-002, D-045).** Decks: 1 / 2 / 4–8. Dealer on soft 17: Stands / Hits. Double after split: Yes / No.
   Surrender: Not allowed / Any dealer card / Except ace. On load: 4–8, Hits, Yes, Any dealer card. Double down is not a control (D-002).
2. **Right chart for all 36 combinations (D-023, D-033).** For every combo, `setRules(combo)` AND selecting that combo through the controls
   (simulated change events) renders a chart whose every cell's move equals the matching cell of the snapshot chart with that id. No move is hard-coded.
3. **Rules sentence from the active rules (D-024, D-039).** The "Table rules: …" text equals the snapshot `label` for the active rules in all 36 combos
   (e.g. "4–8 decks · Dealer hits on soft 17 · Double after split allowed · Surrender: any dealer card except ace" wording as in the snapshot) and updates on every change.
4. **Invalid rules are rejected (D-023).** `setRules` with an unknown value, a missing key or a non-object leaves the chart, sentence, controls and `getRules()` unchanged
   and does not fire the change hook. Valid changes fire the hook exactly once.
5. **Usable by keyboard, at 390 and 1280 (north-star "Mobile"; D-050).** Every option can be reached and chosen with Tab and arrow keys, with a visible focus ring.
   At 390 the controls wrap and the document width stays 390; at 1280 all four controls are visible. Checked by the Lead with Playwright screenshots (not an automated test).
6. **Gate hygiene (AGENTS §4, §9).** `npm run check` exits 0, the stale-build test still passes, and only Write-list files changed.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | 4 groups, options/order, D-023 values, 10 radios, defaults 4-8/hits/yes/any, no double-down control |
| 2 | Pass | Independent vm check: setRules and simulated control changes, 36 combos × 300 cells each path, 0 mismatches (move, class, icon, word); rulesFromControls ok |
| 3 | Pass | Rules sentence = snapshot label in all 36 (D-039 wording), updates on every render, aria-live |
| 4 | Pass | ~30 invalid inputs rejected, no hook; valid change fires once. Finding (inherited key accepted) fixed before commit with D-060: own keys only, idempotent init, hook only on real change; 3 new tests |
| 5 | Pass | Radios focusable (opacity 0, not display:none), :focus-visible ring, 1 column ≤600px; Lead Playwright: 390 width holds, real click on Decks "1" → Hard 8 vs 5 Hit→Double |
| 6 | Pass | `npm run check` 74/74 after D-060; S-07 tests unchanged; only Write-list files |

Overall: PASS (story-reviewer, 2026-10-05; D-060 fix verified by Lead: build stable a1ab9275…, 74/74).

