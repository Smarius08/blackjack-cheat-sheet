# Archive — Sprint 1 (Engine), all done 2026-10-05

Story files stay in `docs/stories/` (S-01…S-06, each with its review table); the reviewer and jira-writer still read them.

- S-01 · package.json + test/smoke.test.js (`npm run check` = `node --test`) · done, PASS · D-018 · 684c2a2
- S-02 · engine/vendor/ strategy_table.js + explanation_writer.js + test/vendor-checksum.test.js · done, PASS · G2 D-032 · 4416f59
- S-03 · engine/chart.js + test/chart.test.js (36 combos, 10,800 cells) · done, PASS · G2 D-019, D-034; follow-ups D-035, D-036, D-037 · be54e74, 7aaec7b
- S-04 · snapshot/generate.js + charts-36.json + test/snapshot.test.js (QA truth) · done, PASS · G2 D-039 (D-023, D-024, D-038) · a2007cd
- S-05 · snapshot/build-review.js + review.html + test/review.test.js · done, PASS · G2 D-040 (D-025, D-026, D-027) · a3e83a4
- S-06 · engine/why.js (`reasonFor`) + test/why.test.js · done, PASS · D-028, D-029, D-030, D-041 · 493f5bc

Superseded decision wordings: D-024 label wordings "Dealer hits soft 17" and "Surrender: except vs ace" replaced by D-039 (row kept in decisions.md, partly superseded).
- S-03 follow-ups (Codex adversarial): D-035 frozen COLUMNS/RULE_VALUES exports (f4d5131); D-036 vendored STRATEGY_TABLE deep-frozen on load (7aaec7b); D-037 tamper-only findings = known limitations.
- S-17 (Sprint 1b) · re-vendored Trainer strategy_table.js 8b87989 (Single/H17 6,6 vs 7 H→Ph; Multi/H17 8,8 vs A Rp→Rpa) + regenerated snapshot/review page; exactly 12 cells changed · done, PASS · G1 D-046, G2 D-047 · ddb2a58 (pushed)
- External check after S-17 (Marius): 7,680 cells vs BlackjackInfo = 0 differences. Engine Report + review.html sent to reporter.
- Status lines retired 2026-10-05: per-story Done list S-01…S-06 (see lines above); `npm run check` 60/60 at ddb2a58.

