# Status

Last updated: 2026-10-05 (home-mac-mini, Claude Code CLI)

## Done
- Sprint 1 (engine) S-01…S-06 + S-17 pushed (ddb2a58); details in docs/archive/sprint-1.md.
- External check: 7,680 cells vs BlackjackInfo = 0 differences. Engine Report + review.html sent to reporter.
- Sprint 2 (D1 prototype, batch D-058): S-07 f55200c · S-08 4458d05 · S-18 e6f6dfa · S-10 ba1e478 · S-19 c9d7d7d · S-11 43b8631 — all reviewed PASS.
- S-12 QA 8/8 PASS; G3 first pass → S-20 fixes (scroll cue, 44px link, "what your rules change") 1a0410c; QA re-run 11/11 PASS.
- `npm run check`: 118/118 pass. Prototype: prototype/index.html (`open prototype/index.html`).

## Figma frames (file mRGsMU76MmiKMnzQkwYKgG, page 14034:33811; PNGs in docs/figma/)
- Full page 1280 14047:648859 · 390 14048:648735 (D-073 rework). Components: CS / Move 14047:86, CS / Pick 14060:14892.
- Default chart 14056:6031 / 14056:6546 · Reason panel 14058:7935 / 14058:8815 · Reason note 14058:654495 / 14058:656063
- Rules changed 14060:11755 / 14060:13320 · TM empty 14060:14893 / 14060:15510 · TM hand 14061:13759 / 14061:14223
- TM result 14061:13883 / 14061:14345 · TM result changed 14061:14048 / 14061:14508 (1280 / 390)
- 390 only: Rules collapsed 14061:658319 · Swipe cue 14061:658393. Print: full A4 14063:15139 · pocket A4 14065:16035
- Full page – Table mode 1280 14071:660225 · 390 14071:661008 (D-074). CS / Move State=Changed 14071:16537–16557.

## Next
- S-21 visual sync done (G3 D-080), pushed 4025487. Handoff zip handoff/blackjack-cheat-sheet-handoff-2026-10-05.zip (git-ignored).
- G5: S-15 drafts docs/jira/BFC-55465-tool-layout.html, BFC-55466-tool-functionality.html. S-14/S-16 done in Jira by Cowork.
- Card next session: refresh .claude/agents/ui-dev.md for D-050/D-053/D-056 (housekeeper).
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
- On BFC-55462: handoff/blackjack-cheat-sheet-handoff-2026-10-05.zip (prototype, engine, snapshot, docs incl. figma + qa).
