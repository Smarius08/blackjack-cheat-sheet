# S-02 — Vendor the Trainer strategy engine unchanged, with a checksum test that locks it

State: done · Agent: engine-dev · Goal served: 2 (correct chart for the player's rules) · Gate: G2

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
| 1 | Pass | Size, SHA-256 and `cmp` match the Trainer sources (21,414 B b4e5823d…9c9a25; 9,860 B 70db6675…1b67f84); also match `git show 34f3fd5:…` |
| 2 | Pass | test/vendor-checksum.test.js pins size + SHA-256; header names source paths + 34f3fd5. Scratch-copy mutation (bit flip, appended byte) → exit 1 each |
| 3 | Pass | Load test asserts STRATEGY_TABLE object, resolveCode and getStrategyExplanation functions; no behaviour tested |
| 4 | Pass | `npm run check`: 5 tests, 5 pass, 0 fail, exit 0; Node built-ins only; package.json unchanged |
| 5 | Pass | Only the three Write files added; backlog diff is the Lead's State edit; Trainer engine/ unchanged |
| 6 | Pass | Nothing committed (HEAD 684c2a2 = S-01); State not done |

Overall: PASS (story-reviewer, 2026-10-05). Observation: the in-test "one-byte change" case only hashes a modified buffer; the real proof was the reviewer's scratch-copy mutation run.

