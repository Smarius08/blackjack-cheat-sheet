# Status

Last updated: 2026-10-05 (home-mac-mini, Claude Code CLI)

## Done
- Sprint 1 (engine) S-01…S-06 + S-17 pushed (ddb2a58); details in docs/archive/sprint-1.md.
- External check: 7,680 cells vs BlackjackInfo = 0 differences. Engine Report + review.html sent to reporter.
- Sprint 2 (D1 prototype, batch D-058): S-07 f55200c · S-08 4458d05 · S-18 e6f6dfa · S-10 ba1e478 · S-19 c9d7d7d · S-11 43b8631 — all reviewed PASS.
- S-12 QA: 8/8 checks PASS (docs/qa/2026-10-05-qa.md); findings F1 medium (no sideways-scroll cue at 390), F2/F3 low.
- `npm run check`: 105/105 pass. Prototype: prototype/index.html (`open prototype/index.html`).

## Next
- G3: Marius signs off the prototype (S-12 stays "reviewed" until then).
- Then: Codex review + adversarial review --base origin/main, G6 push; Sprint 3 (Figma S-13).
- work-lenovo clone pending.

## Lead-only decisions (Marius may veto)
- Sprint 1: D-023–D-026, D-033, D-035, D-038, D-041.
- Sprint 2: D-056 icons, D-059 .gitignore, D-060 rules state, D-061 table-mode UI, D-062 phone flow, D-063 reason panel, D-065 QA tooling.

## Blockers
- Reporter approval of concept and engine (awaiting reply). Keyword split is in S-16 (D-016).

## Known limitations (D-037)
- Vendor SURRENDER_VALUES / DOUBLE_RESTRICTIONS mutable in memory (unused by chart.js).
- chart.js freezing STRATEGY_TABLE makes it read-only for code loaded after it (intended, D-036).

## Files to attach in Jira
- None yet (prototype, QA report and screenshots after G3).
