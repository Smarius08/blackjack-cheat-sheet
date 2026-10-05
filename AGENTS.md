# AGENTS.md — Blackjack Cheat Sheet (CHIPY) agent team

Rules for the Lead (main session) and every subagent. Keep under 150 lines.
Product truth: `docs/north-star.md`. Decisions: `docs/decisions.md`. Work queue: `docs/backlog.md`.
If any two of these disagree, STOP and raise a decision card.

## 1. Goal (every story names which one it serves)
1. Rank for search ("blackjack cheat sheet", "blackjack strategy card") on a /tools/ page.
2. Usable at the table: a chart that is correct for the player's rules, printable.
3. Fast to ship: lean MVP. Not serving 1 or 2 → goes to "Later" in the backlog.

## 2. Deliverables (the only three)
- **D1** Working HTML prototype (single file, real engine, CHIPY Trainer shell).
- **D2** Figma page "Blackjack Cheat Sheet" in Tools---Calculators (mRGsMU76MmiKMnzQkwYKgG).
- **D3** Jira task drafts (HTML) incl. Calculation Logic & Lookup Tables with the engine + 36-chart snapshot.

## 3. The team (subagents in `.claude/agents/`; one at a time, never in parallel)
| Agent | One job | Writes to |
|---|---|---|
| Lead (main session) | Plans sprint, raises decision cards, dispatches one story at a time, updates status | docs/backlog.md, docs/status.md, docs/decisions.md |
| spec-writer | Turns an approved backlog item into one story file | docs/stories/ |
| engine-dev | Engine copy, chart resolution, snapshot, engine tests | engine/, snapshot/, test files |
| ui-dev | HTML prototype | prototype/ |
| story-reviewer | Checks one finished story against its acceptance criteria. Reports only | docs/stories/<id> review section |
| qa-tester | Playwright + snapshot checks of the prototype. Reports only | docs/qa/ |
| figma-designer | Figma page from the approved prototype | Figma "Blackjack Cheat Sheet" page only |
| jira-writer | Jira description drafts in HTML. Never creates issues | docs/jira/ |
| housekeeper | Keeps docs lean, finds contradictions. Docs only | docs/ |

## 4. Story rules (small and compartmentalised)
- One story = **one output** (one file, screen state or behaviour), ≤ 1 page, 3–6 acceptance criteria.
- Template: `docs/stories/_template.md`. Every story lists: goal served, inputs (files to read),
  output (files to write), out of scope, acceptance criteria, gate.
- An agent reads ONLY the files its story lists + AGENTS.md. It writes ONLY its story's output files.
- If a story needs something not listed, the agent stops and reports. It never widens scope.
- Story states: proposed → approved → in progress → built → reviewed → done.

## 5. Gates — explicit owner approval (Marius) required
| Gate | When |
|---|---|
| G1 Scope | Sprint plan; any story added, removed or changed |
| G2 Engine | Copying strategy_table.js; cell-resolution rules; the 36-chart snapshot (becomes QA truth) |
| G3 Prototype | Prototype sign-off before any Figma work |
| G4 Figma | Figma sign-off before Jira drafts |
| G5 Jira | Every Jira description before Marius creates it |
| G6 Push | Every `git push` |
Reporter (outside the team) approves concept and engine: Marius records it as a decision.

## 6. Decision card (the Lead uses this exact format, then STOPS)
```
DECISION CARD  D-0XX  · Gate: G?
Decision needed: <one sentence>
Options: A) …  B) …  (C) …)
Recommendation: <option> because <reason>
Affects: <stories / files / deliverables>
Reply: approve A / approve B / change: …
```
- Nothing that depends on the card starts until Marius replies.
- On reply, the Lead writes the row to `docs/decisions.md` (ID, date, decision, by) BEFORE continuing.
- Decisions the Lead may take alone (naming, file layout inside its own area): log them as "Lead" in
  decisions.md and list them in the next status update so Marius can veto.

## 7. Per-story loop
1. Lead picks the next **approved** story from backlog.md and says which goal it serves.
2. Builder agent builds it (only its output files).
3. Tests: `npm run check` must pass.
4. story-reviewer (fresh) checks it against the acceptance criteria → pass/fail list.
5. Fail → back to the builder with the reviewer's list. Pass → Lead commits by path.
6. Lead updates backlog.md + status.md. Next story.
Engine stories also get `/codex:adversarial-review` (Marius runs it). Every push: `/codex:review --base origin/main`, then G6. Docs-only pushes (no code, test or package changes) skip Codex (D-031).

## 8. Root cause before fixing
Before any fix, the Lead writes one line: symptom → root cause → goal served. Fix the cause.
If the cause is in a spec or decision, raise a card; don't patch around it.

## 9. Write limits
- Write only inside this repo. `../chipy-blackjack-trainer` and `../blackjack-quiz` are READ-ONLY.
- Engine source: copy `chipy-blackjack-trainer/engine/strategy_table.js` and `explanation_writer.js`
  unchanged into `engine/vendor/`; a checksum test pins them. Never edit vendor files.
- Figma: write only on the "Blackjack Cheat Sheet" page. Load `figma-use` before every write.
- Jira: drafts only in docs/jira/. Marius creates issues and attaches files.
- Codex reviews, never builds. Marius runs every Codex command. `/codex:rescue` and `/codex:transfer` are banned.
- Commit by path, never `git add -A`. One branch: `main`. No worktrees.

## 10. Two machines (Lenovo = Windows office, Mac mini = home)
- Never have a session open on both at once. Start: `git pull`. End: commit, then ask G6 before push.
- Keep scripts cross-platform (Node only, no bash-only commands). `.gitattributes` forces LF.
- Plugins must match `SETUP.md` on both machines.

## 11. Session start / end
Start: `git pull` → read docs/status.md → read docs/backlog.md → state today's ONE goal and which
story it covers → wait for "go".
End: tests pass → commit by path → update docs/status.md (Done / Next / Blockers / files to attach)
→ list any Lead-only decisions → ask G6 for push.
Housekeeper runs at the end of every sprint.

## 12. Keep docs lean
AGENTS.md ≤ 150 lines; each story ≤ 1 page; status.md ≤ 40 lines.
Resolved items move to docs/archive/ as one-line summaries.
