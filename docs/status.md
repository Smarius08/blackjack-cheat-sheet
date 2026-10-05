# Status

Last updated: 2026-10-05 (home-mac-mini, Claude Code CLI)

## Done
- Sprint 1 (engine) S-01…S-06 + S-17 done and pushed (ddb2a58); details in docs/archive/sprint-1.md.
- External check: 7,680 cells vs BlackjackInfo = 0 differences (Marius).
- Engine Report + snapshot/review.html sent to the reporter.
- `npm run check`: 60/60 pass.

## Next
- Sprint 2 approved (D-045): spec-writer writes S-07, S-08, S-10, S-11, S-12 one at a time for approval; then ui-dev builds S-07.
- work-lenovo clone pending (only when at the office).

## Lead-only decisions (Marius may veto)
- D-023/D-024 snapshot shape + labels; D-025/D-026 review page build + colours.
- D-033 chart.js API; D-035 frozen exports; D-038 snapshot file shape; D-041 why.js API.

## Blockers
- Reporter approval of concept and engine (Engine Report + review.html sent; awaiting reply).
- Keyword split is in S-16 (D-016), not a blocker.

## Known limitations (D-037)
- Vendor SURRENDER_VALUES / DOUBLE_RESTRICTIONS stay mutable in memory (unused by chart.js).
- chart.js freezing STRATEGY_TABLE makes it read-only for code loaded after it (intended, D-036).

## Files to attach in Jira
- None yet.
