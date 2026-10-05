# Status

Last updated: 2026-10-06 (home-mac-mini, Claude Code CLI)

## Done
- Team setup; Sprint 1 story files S-01…S-06 approved (D-018…D-031).
- S-01 repo scaffold: `npm run check` = `node --test` (reviewed PASS) — 684c2a2.
- S-02 vendored strategy_table.js + explanation_writer.js, checksum-pinned (PASS, G2 D-032) — 4416f59.
- S-03 engine/chart.js: 36 rule combos → Hard/Soft/Pairs plain moves; 10,800 cells cross-checked, 0 mismatches (PASS, G2 D-034) — be54e74.
- D-035 fix: chart.js exports frozen copies of COLUMNS/RULE_VALUES (Codex adversarial finding); 36 charts unchanged.
- D-036 fix: chart.js deep-freezes the vendored STRATEGY_TABLE in memory on load (vendor file untouched); 36 charts unchanged.
- S-04 snapshot/charts-36.json = QA truth, labels per D-039 (G2 D-039) — a2007cd.
- S-05 snapshot/review.html: all 36 charts + index + code key; open with `open snapshot/review.html` (G2 D-040).
- S-06 engine/why.js `reasonFor`: vendor reason text per cell, unchanged (PASS) — 493f5bc.
- Sprint 1 housekeeping done; archive in docs/archive/sprint-1.md.
- `npm run check`: 58/58 pass.

## Next
- Marius: `/codex:review --base origin/main` + `/codex:adversarial-review --base origin/main`, then G6 push.
- Send snapshot/review.html to the reporter for engine approval.
- Sprint 2 (G1 needed first): S-07…S-12 are still "proposed".
- work-lenovo clone pending (only when at the office).

## Lead-only decisions (Marius may veto)
- D-023 snapshot chart shape, id format, chart order. D-024 label wording (confirmed at S-04 G2).
- D-025 review page built by a script with inlined data. D-026 review page colours moves.
- D-033 chart.js API: buildChart(rules), labels, ChipyEngine.chart; extra exports RULE_VALUES, COLUMNS.
- D-035 frozen exports (logged as Lead at Marius's request).
- D-038 charts-36.json = { charts: [36] }, tables = buildChart output. D-041 why.js API: reasonFor({ table, row, dealer, cell }).

## Blockers
- Reporter approval of concept and engine (spec doc ready to send). Keyword split is in S-16 (D-016), not a blocker.
- Open: `npm install` would create package-lock.json (not tracked yet) — decide before S-07.

## Known limitations (D-037)
- Vendor SURRENDER_VALUES / DOUBLE_RESTRICTIONS stay mutable in memory (not used by chart.js). chart.js freezing STRATEGY_TABLE also makes it read-only for any code loaded after it (intended, D-036).

## Files to attach in Jira
- None yet.
