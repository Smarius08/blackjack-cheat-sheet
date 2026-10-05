# S-13b — Figma tool screens, 1280 and 390 (the tool in each state)

State: done (G4 D-074) (G1 D-069) · Agent: figma-designer · Goal served: 2 (usable, correct chart at the table) · Gate: G4 (after S-13c)

## Why
S-13a shows the whole page. Marius also needs every state of the tool itself (chart, reason panel, rules changed, Table mode) drawn once, so the prototype can be signed off against Figma before Jira (D-069).

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9), this story, .claude/agents/figma-designer.md
- prototype/index.html at commit 139bd2c (exact strings, states, reason texts, notes) and snapshot/charts-36.json (move and note of every cell shown)
- docs/decisions.md rows D-050, D-053, D-055, D-062, D-063, D-067, D-068, D-069, D-071, D-072
- Figma, same file: S-13a frames 14047:648859 and 14048:648735 (reuse); Calculator Recommended Play card 12337:1558 (read-only)

## Write (only these)
- Figma file mRGsMU76MmiKMnzQkwYKgG, page "-> Blackjack Cheat Sheet", node 14034:33811. Load figma-use before every write.
- docs/figma/cs-<screen>-<width>.png, one per frame

## Frames
Named "CS / <screen> / <width>", tool area only (not the full page). Each at 1280 and 390 unless noted:
1. Default chart
2. Reason panel: Hard 16 vs dealer 10 open under the Hard table (title, Close, move icon + word, reason text)
3. Reason panel – note: 1 deck, stand on soft 17, no double after split, no surrender; Hard 16 vs 10 shows HIT with the rule-blocked note shown separately
4. Rules changed: Decks 4–8 changed to 1 from defaults; "17 moves changed for your new rules" + Dismiss; changed cells have a dashed outline and a "CHANGED" badge (F4)
5. Table mode – empty (hand picker; at 390 rules collapsed to sentence + "Change rules", D-062)
6. Table mode – hand picked (dealer row shown)
7. Table mode – result (Recommended Play card style: hand, "Dealer shows X", move icon + word, link "See every move's value in the Hand Strategy Calculator")
8. Table mode – result changed ("Changed for your new rules" marker)
390 only: 9. Rules collapsed (sentence + "Change rules") · 10. Swipe cue ("Swipe for dealer 6–A", right-edge fade, "Your hand" pinned)

## Out of scope
Full page (S-13a), print (S-13c), dark mode, new copy or moves not in the prototype, any other page or node, editing the prototype or other docs.

## Acceptance criteria
1. All frames exist on node 14034:33811 with the exact names above (8 at 1280, 10 at 390).
2. Every string, move, note and reason text matches the prototype at 139bd2c and snapshot/charts-36.json for the cells shown; nothing is invented (D-055, D-063, D-067).
3. The "CHANGED" badge text is at least 11px and does not cover any move icon; changed cells are marked by outline and badge text, not colour alone (F4, D-068).
4. All tap targets are at least 44px; title/text contrast is at least 4.5:1 using the S-13a token (F2, D-072); at 390 nothing makes the page scroll sideways (D-050).
5. The S-13a shell, rule panel, legend and "CS / Move" component (14047:86, D-071 icons, D-072 palette) are reused, not redrawn; every cell has icon plus move word (D-053).
6. PNGs exist in docs/figma/ for every frame, the report gives node IDs and URLs, and nothing was written outside the page and docs/figma/ (AGENTS.md section 9).

## Verification
The Lead checks with Figma screenshots (story-reviewer cannot open Figma).

## Review (filled by Lead via screenshots)
| # | Pass/Fail | Evidence |
|---|---|---|
| # | Pass/Fail | Evidence (Lead, PNG crops + snapshot) |
|---|---|---|
| all | Pass | 18 frames (8 × 1280, 10 × 390) on 14034:33811, IDs in docs/status.md at G4; chart cells = snapshot in frames 1–4, 10 (designer check); 17 marked cells = Lead's own snapshot diff 4-8→1 (exact match); reason/note strings from prototype/engine; "CHANGED" badge 11px above the icon (F4); targets ≥44px; 390 frames exactly 390 wide; reuses S-13a shell + CS / Move (local icons, D-071); new local CS / Pick (14060:14892); 18 PNGs in docs/figma/ |

Overall: PASS (Lead, 2026-10-05), pending G4. Designer trade-offs (badge row height, table-mode rule collapse at 1280, library button caps, open-cell outline on Surrender cells) → G4 card.
D-074: changed rows back to 52px; marker = dashed inner outline + 12px corner triangle (white on Surrender), 9px text badge removed; CS / Move State=Changed variants.
