# North Star — Blackjack Cheat Sheet

Jira product: BFC-54783 (epic BFC-51971 Blackjack Tools). Research: "CHIPY - Blackjack Tools Research - Source Verified Update" (Google Sheet).
Concept status: NOT yet reporter-approved (reporter approves concept AND engine).

## User problem
Fixed cheat sheets are right for only one rule set and use codes ("Dh", "Rs") a beginner must decode.
The player wants one chart that is right for *their* table and readable at a glance.

## MVP scope
- Rule controls (4): Decks (1 / 2 / 4–8) · Dealer on soft 17 (Stands / Hits) · Double after split (Yes / No) ·
  Surrender (Not allowed / Any dealer card / Except ace). Double down fixed to "any two cards".
- Chart: Hard / Soft / Pairs × dealer upcard 2–A. One plain move per cell (Hit / Stand / Double / Split / Surrender).
- Tap a cell → short reason, 1–2 sentences (reuse Trainer explanation_writer.js as is; D-028).
- Print / save: print-friendly chart that states the chosen rules.
- Mobile: designer solves readability at 390px; no prescribed layout.

## Out of scope (MVP)
Double-restriction setting, hit-split-aces, counting/deviations, EV numbers, drill/quiz mode, accounts,
PDF service, link-to-Calculator pre-fill.

## Engine (proposed — needs G2 + reporter)
Rule-Based Basic Strategy Lookup + Chart Renderer.
- Source: chipy-blackjack-trainer/engine/strategy_table.js (from Hand Strategy Calculator v30; validated by a 395,460-combination sweep).
- Keys: deck group (Single=1, Double=2, Multi=4–8) × H17/S17 × Hard/Soft/Pairs × dealer 2–A.
- Cell = resolveCode(code, dealer, total, firstDecision=true, postSplit=false, settings).
- Codes: H S P Dh Ds Ph Rh Rs Rp Rpa Pd Ps (Rpa added by the Trainer fix 8b87989, D-046). Rule combinations: 3×2×2×3 = 36 charts → JSON snapshot = QA truth.

## Competitor gap
Static charts (ProfitDuel, ChasingTheFrog, Blackjack Apprenticeship) are fixed; BlackjackInfo is rule-based but shows codes + legend.
CHIPY: rule-aware + plain move per cell + tap-for-why + printable "your rules" chart.

## Open questions
1. Final URL (proposed /tools/blackjack-cheat-sheet).
2. Reporter approval of concept and engine.

## Not a tool-development question
Keyword split vs chipy.com/academy/blackjack/blackjack-strategy-charts and the 2025 Cheat Sheet guide (BFC-36795) is decided in the SEO Content task (S-16), with Ahrefs data. It does not block engine, prototype, Figma or the other Jira tasks (D-016).
