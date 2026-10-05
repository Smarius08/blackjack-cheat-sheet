# S-02 — Vendor the Trainer strategy engine unchanged, with a checksum test that locks it

State: approved · Agent: engine-dev · Goal served: 2 (correct chart for the player's rules) · Gate: G2

## Why
The chart must come from the same validated strategy code as the Trainer (north-star "Engine", D-004). Copying it
unchanged, and making any later edit fail `npm run check`, keeps the chart trustworthy. No chart logic is built here.

**Gate G2 (plain words):** Marius must approve this copy before it is committed. The builder stops after the
tests pass and the Lead asks for G2. Nothing is committed until Marius says yes.

## Read (only these)
- AGENTS.md
- ../chipy-blackjack-trainer/engine/strategy_table.js (READ-ONLY, 21,414 bytes)
- ../chipy-blackjack-trainer/engine/explanation_writer.js (READ-ONLY, 9,860 bytes)
- package.json (created by S-01; `npm run check` = `node --test`)

## Write (only these)
- engine/vendor/strategy_table.js (byte-for-byte copy)
- engine/vendor/explanation_writer.js (byte-for-byte copy)
- test/vendor-checksum.test.js (SHA-256 of both files via Node built-in `crypto`, a load smoke check, and a
  header comment with the provenance: source paths + source commit 34f3fd5, 2026-09-21)

## Out of scope
- Editing either vendor file (any change, even whitespace). Any other Trainer engine file.
- Chart resolution, rule settings, the 36-chart snapshot, explanation behaviour tests (S-03, S-04, S-06).
- Any dependency or change to package.json. Writing anything in `../chipy-blackjack-trainer`.

## Acceptance criteria
1. Both files exist in `engine/vendor/` and are byte-identical to the Trainer originals (same size, same SHA-256) (AGENTS.md §9).
2. `test/vendor-checksum.test.js` holds the expected SHA-256 for each file and fails if either file changes by one byte (AGENTS.md §9); the test header names the source path and commit.
3. Both modules load in Node; strategy_table exports `STRATEGY_TABLE` and `resolveCode`, explanation_writer exports `getStrategyExplanation`. No behaviour is tested here (north-star "Engine"; AGENTS.md §9).
4. `npm run check` exits 0 with the new test included, using only Node built-ins (AGENTS.md §7, D-018, §10).
5. No other file was added or changed besides the three listed in Write (AGENTS.md §4, §9).
6. The story is not marked done, and nothing is committed, until Marius has approved the copy at G2 (AGENTS.md §5).

## Notes (Lead)
- Checked 2026-10-05: both sources are LF. If size or SHA-256 differs after copy, the builder reports it and does not normalise.
- Checked 2026-10-05: the Trainer's reference v30 equals the original Jira v30 (BFC-53564) except for a 2-line scope comment added in Trainer commit 18e1879. Strategy table and resolver are identical.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
