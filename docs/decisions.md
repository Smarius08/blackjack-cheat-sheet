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
| D-024 | 2026-10-05 | Snapshot label wording, e.g. "4–8 decks · Dealer hits soft 17 · Double after split allowed · Surrender: any dealer card" ("Dealer stands on soft 17", "No double after split", "No surrender", "Surrender: except vs ace"); final wording confirmed at S-04 G2 (2 wordings superseded by D-039) | Lead |
| D-025 | 2026-10-05 | Review page layout: snapshot/build-review.js inlines charts-36.json into snapshot/review.html (file:// can't fetch JSON); test fails if the HTML is stale | Lead |
| D-026 | 2026-10-05 | Review page (S-05 only) colours each move as well as naming it; prototype colours are decided in S-09 | Lead |
| D-027 | 2026-10-05 | Review page shows the engine code small under the plain move in each cell (reviewers only; prototype stays words only) | Marius |
| D-028 | 2026-10-05 | Cell reason = vendor explanation text as is (usually 1–2 sentences); north-star wording changed from "one-line reason" to "short reason (1–2 sentences)" | Marius |
| D-029 | 2026-10-05 | Range rows: reason quotes the lowest total (D-021) — accepted; S-10 may show the row label above the reason | Marius |
| D-030 | 2026-10-05 | why.js returns the reason only; the cell's note (D-022) is shown separately by the UI | Marius |
| D-031 | 2026-10-05 | Docs-only commits (no code, test or package changes) skip `/codex:review` before push; every other push still requires it | Marius |
| D-032 | 2026-10-05 | G2: vendored engine copy (S-02) approved for commit; Codex review + adversarial review before next push | Marius |
| D-033 | 2026-10-05 | chart.js API: `buildChart(rules)`, rules = D-023 shape; returns { columns: ["2"…"10","A"], hard, soft, pairs }, each an array of { label, cells[10] }; labels Hard "5-7","8"…"17","18-21", Soft "13"…"20", Pairs "2,2"…"10,10","A,A"; browser global `window.ChipyEngine.chart`; also exports constants RULE_VALUES, COLUMNS | Lead |
| D-034 | 2026-10-05 | G2: chart.js cell-resolution (S-03) approved for commit | Marius |
| D-035 | 2026-10-05 | Codex adversarial finding accepted: chart.js exports frozen copies of COLUMNS and RULE_VALUES; buildChart uses private values; regression test; 36 charts unchanged (S-03 follow-up) | Lead |
| D-036 | 2026-10-05 | G2: chart.js deep-freezes the vendored STRATEGY_TABLE in memory on load (vendor file untouched) + regression test; 36 charts unchanged | Marius |
| D-037 | 2026-10-05 | Codex adversarial findings that only describe our own code tampering with engine data in memory → recorded as known limitations, not fixed. Findings that could give a wrong chart in normal use are still fixed. S-04 snapshot test is the main guard | Marius |
| D-038 | 2026-10-05 | charts-36.json top level = { "charts": [36] }; each chart's `tables` = buildChart(rules) output as is (columns, hard, soft, pairs); written as JSON.stringify(…, null, 2) + LF | Lead |
| D-039 | 2026-10-05 | G2: 36-chart snapshot approved with label wording "Dealer hits on soft 17" and "Surrender: any dealer card except ace" (supersedes those two D-024 wordings); cells unchanged | Marius |
| D-040 | 2026-10-05 | G2: review page (S-05) approved, plus a one-line key for the engine codes in the intro (checked by the test) | Marius |
| D-041 | 2026-10-05 | why.js API: `reasonFor({ table: "hard"\|"soft"\|"pairs", row: <D-033 row label>, dealer: <column label>, cell })` → string; browser global `window.ChipyEngine.why` | Lead |
| D-042 | 2026-10-05 | North-star Engine heading: "G2 approved: D-032, D-034, D-039, D-040, D-047 · pending reporter approval" | Marius |
| D-043 | 2026-10-05 | Working URL /tools/blackjack-cheat-sheet; final URL decided in S-16 with the keyword split (D-016) | Marius |
| D-044 | 2026-10-05 | AGENTS.md §3: story-reviewer reports only; the Lead writes its table into the story | Marius |
| D-045 | 2026-10-05 | G1 Sprint 2 approved: S-07 (shell + chart at defaults; merges old S-09) → S-08 rule panel → S-10 tap/click/keyboard reason panel (no hover) → S-11 print → S-12 QA (G3). Defaults = Trainer/Quiz defaults: 4–8 decks · dealer hits soft 17 · DAS allowed · surrender any. prototype/build.js inlines engine files unchanged into prototype/index.html + byte-match test. S-07 uses the Trainer tool shell exactly as Quiz E53 | Marius |
| D-046 | 2026-10-05 | G1: add S-17 — re-vendor corrected Trainer strategy_table.js (8b87989: Single/H17 6,6 vs 7 H→Ph; Multi/H17 8,8 vs A Rp→Rpa), regenerate snapshot + review page; exactly 12 cells change; D-042–D-045 reserved for pending housekeeping cards | Marius |
| D-047 | 2026-10-05 | G2: re-vendored strategy_table.js (Trainer 8b87989, SHA-256 d0a272f8…) + regenerated snapshot and review page (S-17) approved; exactly 12 cells changed | Marius |
| D-048 | 2026-10-05 | Commit package-lock.json so both machines install identically | Marius |
| D-049 | 2026-10-05 | Backlog notes: S-14 states the 2-cell deviation from v30 (D-046); S-09 shows Soft rows as A,2–A,9 (display only; engine labels stay 13–20, D-020); S-10 tap panel shows the row label and keeps the note separate | Marius |
| D-051 | 2026-10-05 | MVP scope = "from cheat sheet to memory": player needs (1) right chart for their table, (2) fast use at the table on a phone, (3) to learn it; we differentiate on (2)+(3). Add S-18 Table mode and S-19 Pocket card + my-table link (ui-dev, after S-08, before S-12); S-12 covers both. v2 "Learn this chart" (memory rules) not now; S-13 and S-15 reserve space for it | Marius |
| D-053 | 2026-10-05 | Chart cells show CHIPY move icon + word (as Calculator/Trainer: Hit pointer, Stand hand, Double bars, Split arrows, Surrender flag; source ../chipy-blackjack-trainer/mockups/assets/action-*.svg). Prototype may use review-page tints as placeholder colours; final colours from CHIPY tokens (brand-tools lime #c4db11 / #859c2e, neutrals) in Figma S-13 | Marius |
| D-055 | 2026-10-05 | S-18 Table mode: two taps (hand type/total, then dealer card) on the page's active rules; result in the style of the Calculator's "Recommended Play" card (Figma 12337:1558) with move icon; no card picking, no EV values; link "See every move's value in the Hand Strategy Calculator". Figma refs (file mRGsMU76MmiKMnzQkwYKgG): Calculator 12249:16711, Trainer 13146:897, Quiz 13839:20221 | Marius |
| D-056 | 2026-10-05 | Move icons: copy the 5 active Trainer SVGs (mockups/assets/action-{hit,stand,double,split,surrender}.svg) unchanged into prototype/src/icons/, checksum-pinned with provenance like engine/vendor; build.js inlines them; the SVG xmlns attribute is not a network request | Lead |
| D-050 | 2026-10-05 | 390px: full move words; chart scrolls sideways inside its own box with the "Your hand" column pinned; the page never scrolls sideways | Marius |
| D-052 | 2026-10-05 | Shell title "BLACKJACK CHEAT SHEET" | Marius |
| D-054 | 2026-10-05 | S-11 = Print, both sizes (full page + pocket card, rules printed); S-19 = My-table link only (rules in URL, round-trip, invalid → defaults). Build order S-07 → S-08 → S-18 → S-10 → S-11 → S-19 → S-12 | Marius |
| D-057 | 2026-10-05 | Positioning: the Cheat Sheet is part of the CHIPY blackjack tools suite; links to the other tools go via the existing carousel | Marius |
| D-058 | 2026-10-05 | Sprint 2 in batch mode: per story spec-writer → builder → story-reviewer → commit, no per-story approval; stop only if a review fails twice, a test can't pass, or a product decision is needed; stop at G3 after S-12 | Marius |
| D-059 | 2026-10-05 | .gitignore adds .playwright-mcp/ (Lead's local screenshot output, never committed) | Lead |
| D-060 | 2026-10-05 | Prototype rules state: setRules accepts only own-property D-023 keys (extras ignored); init() idempotent; onRulesChange fires only when the rules actually change (S-08 review; protects S-19 URL input) | Lead |
| D-061 | 2026-10-05 | S-18 UI: hand picker = Hard single totals 5–21 (mapped to chart rows 5-7 … 18-21), Soft A,2–A,9, Pairs 2,2–A,A; a "Full chart \| Table mode" switch at the top (default option first), Full chart on load at every width; Calculator link = relative /tools/blackjack-hand-strategy-calculator (placeholder until Jira confirms the URL) | Lead |
| D-062 | 2026-10-05 | Table mode on phones: the rule panel collapses to the rules sentence + a "Change rules" button; after the hand tap the dealer row scrolls into view, after the dealer tap the result card does (S-18 Lead screenshot at 390: dealer row was ~1,250px down) | Lead |
| D-063 | 2026-10-05 | S-10 reason panel: opens inline directly under the tapped table (one panel per table), close button + Escape; keyboard = one Tab stop per table, arrow keys move between cells (roving tabindex), Enter/Space opens; panel shows the row label as displayed (e.g. "Hard 18–21 vs dealer 10", "A,7 vs dealer 3"), the reason, and the note separately | Lead |
| D-064 | 2026-10-05 | Pocket card: one letter per cell (H/S/D/P/R) + colour; A6 (105×148mm), two panels (Hard \| Soft + Pairs) side by side on one A4/Letter sheet with fold/cut line; legend + table rules printed; letters readable in black-and-white (never colour alone). Full-page print keeps words + icons | Marius |
| D-065 | 2026-10-05 | S-12 QA tooling: playwright-core installed in the session scratch folder (never in the repo, no package.json change), driving the system Google Chrome; QA script + report + screenshots in docs/qa/ | Lead |
| D-066 | 2026-10-05 | G3 (first pass): approve B with change — one fix story S-20 before re-QA: F1 scroll cue at 390 (right-edge fade + "Swipe for dealer 6–A"), F3 Calculator link ≥44px, plus feature E; add QA checks for all three, re-run full QA, G3 again. F2 (title contrast) → S-13 Figma brief | Marius |
| D-067 | 2026-10-05 | D-051 scope correction: feature E "What your rules change" (Jira BFC-55467 §5 + AC) was approved but missing from the backlog — on a rule change, compare old vs new chart by `move`, highlight changed cells + short count ("5 moves changed for your new rules"); stays until the next rule change or dismiss; none on first load or my-table link; table mode marks a changed answer the same way. Feature D (Trainer/Quiz links) is covered by the existing carousel (D-057), not built in the tool | Marius |
| D-068 | 2026-10-05 | G3: D1 prototype signed off after S-20 (QA 11/11). F2 (title contrast) and F4 (9px "Changed" badge overlaps icon top) go into the S-13 Figma brief | Marius |
