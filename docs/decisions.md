# Decisions log

Format: ID · date · decision · by. Newest at the bottom. Superseded rows move to docs/archive/.

| ID | Date | Decision | By |
|---|---|---|---|
| D-001 | 2026-10-05 | New /tools/ page, not embedded in the academy guide; keyword-overlap risk accepted pending Ahrefs check | Marius |
| D-002 | 2026-10-05 | 4 rule controls (decks, soft 17, DAS, surrender); double down fixed to any two cards | Marius |
| D-003 | 2026-10-05 | MVP differentiators: plain move per cell, print/save, tap-for-why | Marius |
| D-004 | 2026-10-05 | D1 prototype is a working prototype on the real strategy_table.js | Marius |
| D-005 | 2026-10-05 | Both machines build; GitHub is the sync point | Marius |
| D-006 | 2026-10-05 | Team = subagents, one at a time; main session is Lead | Marius |
| D-007 | 2026-10-05 | Roles: spec-writer, engine-dev, ui-dev, qa-tester, figma-designer, jira-writer, housekeeper (+ story-reviewer) | Marius |
| D-008 | 2026-10-05 | Verification = decision cards + this log; gates G1–G6 | Marius |
| D-009 | 2026-10-05 | Story = 1 output, ≤ 1 page, 3–6 acceptance criteria | Marius |
| D-010 | 2026-10-05 | Agents write only to this repo; Figma Cheat Sheet page only; Jira drafts only; push on approval | Marius |
| D-011 | 2026-10-05 | Review = fresh story-reviewer per story + Codex before push; adversarial review on engine | Marius |
| D-012 | 2026-10-05 | Models — engine-dev + story-reviewer on Opus, others Sonnet | Marius |
| D-013 | 2026-10-05 | Repo docs/ are the source of truth for Claude Code; Project docs only point here + mirror status | Marius |
| D-014 | 2026-10-05 | G1: Sprint 1 (S-01…S-06) approved | Marius |
| D-015 | 2026-10-05 | Rename folder/repo to blackjack-cheat-sheet before first commit | Marius |
| D-016 | 2026-10-05 | Keyword split is part of the SEO Content task (S-16), not tool development; it blocks nothing else | Marius |
| D-017 | 2026-10-05 | Claude Code CLI (terminal) on both machines, not the Desktop Code tab; Cowork stays the planning chat | Marius |
| D-018 | 2026-10-05 | Test runner for `npm run check` = Node built-in `node --test`, no dependencies | Marius |
| D-019 | 2026-10-05 | S-03 carries G2 (cell-resolution rules, AGENTS.md §5); backlog row corrected | Marius |
| D-020 | 2026-10-05 | One fixed row set for all 36 charts, low→high: Hard 5-7, 8, 9…17, 18-21 (Double/Multi 5-7 and 8 both use "5-8"); Soft 13–20 (no soft 12, no soft 21); Pairs 2,2…10,10, A,A | Marius |
| D-021 | 2026-10-05 | Total passed to resolveCode: row number, or lowest of a range (5-7→5, 18-21→18); Pairs = 2× card value (A,A→12) | Marius |
| D-022 | 2026-10-05 | Each chart cell = { move, code, note }; UI shows only the plain move | Marius |
| D-023 | 2026-10-05 | Snapshot chart = { id, rules, label, tables }; rules = { decks: "1"\|"2"\|"4-8", soft17: "stands"\|"hits", das: "yes"\|"no", surrender: "none"\|"any"\|"except_ace" }; id = `decks=4-8\|soft17=hits\|das=yes\|surrender=any`; charts ordered decks → soft17 → das → surrender in the order listed | Lead |
| D-024 | 2026-10-05 | Snapshot label wording, e.g. "4–8 decks · Dealer hits soft 17 · Double after split allowed · Surrender: any dealer card" ("Dealer stands on soft 17", "No double after split", "No surrender", "Surrender: except vs ace"); final wording confirmed at S-04 G2 | Lead |
| D-025 | 2026-10-05 | Review page layout: snapshot/build-review.js inlines charts-36.json into snapshot/review.html (file:// can't fetch JSON); test fails if the HTML is stale | Lead |
| D-026 | 2026-10-05 | Review page (S-05 only) colours each move as well as naming it; prototype colours are decided in S-09 | Lead |
| D-027 | 2026-10-05 | Review page shows the engine code small under the plain move in each cell (reviewers only; prototype stays words only) | Marius |
| D-028 | 2026-10-05 | Cell reason = vendor explanation text as is (usually 1–2 sentences); north-star wording changed from "one-line reason" to "short reason (1–2 sentences)" | Marius |
| D-029 | 2026-10-05 | Range rows: reason quotes the lowest total (D-021) — accepted; S-10 may show the row label above the reason | Marius |
| D-030 | 2026-10-05 | why.js returns the reason only; the cell's note (D-022) is shown separately by the UI | Marius |
| D-031 | 2026-10-05 | Docs-only commits (no code, test or package changes) skip `/codex:review` before push; every other push still requires it | Marius |
| D-032 | 2026-10-05 | G2: vendored engine copy (S-02) approved for commit; Codex review + adversarial review before next push | Marius |
