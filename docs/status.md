# Status

Last updated: 2026-10-05 (home-mac-mini, Claude Code CLI)

## Done
- Team setup; Sprint 1 story files S-01…S-06 approved (D-018…D-031).
- S-01 repo scaffold: `npm run check` = `node --test` (reviewed PASS) — 684c2a2.
- S-02 vendored strategy_table.js + explanation_writer.js, checksum-pinned (PASS, G2 D-032) — 4416f59.
- S-03 engine/chart.js: 36 rule combos → Hard/Soft/Pairs plain moves; 10,800 cells cross-checked, 0 mismatches (PASS, G2 D-034) — be54e74.
- D-035 fix: chart.js exports frozen copies of COLUMNS/RULE_VALUES (Codex adversarial finding); 36 charts unchanged.
- D-036 fix: chart.js deep-freezes the vendored STRATEGY_TABLE in memory on load (vendor file untouched); 36 charts unchanged.
- `npm run check`: 26/26 pass.

## Next
- G6 push after the final adversarial review (D-037 applies to tamper-only findings).
- engine-dev builds S-04 (36-chart snapshot; G2 incl. label wording), then S-05 (review page, G2), S-06 (reasons).
- work-lenovo clone pending (only when at the office).

## Lead-only decisions (Marius may veto)
- D-023 snapshot chart shape, id format, chart order. D-024 label wording (confirmed at S-04 G2).
- D-025 review page built by a script with inlined data. D-026 review page colours moves.
- D-033 chart.js API: buildChart(rules), labels, ChipyEngine.chart; extra exports RULE_VALUES, COLUMNS.
- D-035 frozen exports (logged as Lead at Marius's request).

## Blockers
- Reporter approval of concept and engine (spec doc ready to send). Keyword split is in S-16 (D-016), not a blocker.
- Open: `npm install` would create package-lock.json (not tracked yet) — decide at S-04 or later.

## Known limitations (D-037)
- Vendor SURRENDER_VALUES / DOUBLE_RESTRICTIONS stay mutable in memory (not used by chart.js). chart.js freezing STRATEGY_TABLE also makes it read-only for any code loaded after it (intended, D-036).

## Files to attach in Jira
- None yet.
