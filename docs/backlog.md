# Backlog

States: proposed → approved (G1) → in progress → built → reviewed → done. Each line becomes one story file.
Goal = 1 search · 2 table · 3 ship.

## Sprint 1 — Engine (D3 truth) · APPROVED at G1 (D-014)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-01 | Repo scaffold: package.json `npm run check`, test runner, .gitattributes | engine-dev | 3 | — | done |
| S-02 | Vendor strategy_table.js + explanation_writer.js unchanged + checksum test | engine-dev | 2 | G2 | done |
| S-03 | `engine/chart.js`: rules → 3 tables of plain moves (resolveCode, firstDecision=true) | engine-dev | 2 | G2 (D-019) | done |
| S-04 | `snapshot/charts-36.json` generated + test that chart.js reproduces it | engine-dev | 2 | G2 | done |
| S-05 | `snapshot/review.html`: human-readable view of all 36 charts for Marius/reporter | engine-dev | 2 | G2 | done |
| S-06 | `engine/why.js`: short reason per cell from explanation_writer (D-028) | engine-dev | 2 | — | done |

## Sprint 1b — Engine correction · APPROVED at G1 (D-046)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-17 | Re-vendor corrected Trainer strategy_table.js (8b87989), regenerate snapshot + review page; exactly 12 cells change (D-046) | engine-dev | 2 | G2 | done |

## Sprint 2 — Prototype (D1) · DONE, G3 signed off (D-068)
Defaults on load: 4–8 decks · dealer hits soft 17 · DAS allowed · surrender any. prototype/build.js inlines engine files unchanged.
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-07 | Trainer shell (Quiz E53) + chart at default rules: Hard / Soft / Pairs, move icon + word + placeholder tint (D-053), Soft rows A,2–A,9 (D-049); prototype/build.js + byte-match test (merges old S-09) | ui-dev | 2 | — | done |
| S-08 | Rule panel (4 controls, defaults) wired to chart.js; chart redraws on change | ui-dev | 2 | — | done |
| S-18 | Table mode: phone-first quick view — tap player hand (hard / soft / pair), tap dealer card → one large move word + rule note; chart.js output only; answer = chart cell for every hand × dealer × 36 rule sets; two taps; 390px; "Recommended Play" card style + move icon, no card picking, no EV, link to Hand Strategy Calculator (D-051, D-055) | ui-dev | 2 | — | done |
| S-10 | Tap/click/keyboard a cell → panel: row label, reason (why.js), note shown separately (D-029, D-030, D-049); no hover | ui-dev | 2 | — | done |
| S-11 | Print, both sizes: full page + pocket card, chosen rules printed on each (D-054) | ui-dev | 2 | — | done |
| S-19 | My-table link: active rules kept in the page URL; every combo round-trips; invalid values fall back to defaults with no error (D-051, D-054) | ui-dev | 2 | — | done |
| S-20 | G3 fix (D-066, D-067): scroll cue at 390 (fade + "Swipe for dealer 6–A"), Calculator link ≥44px, "What your rules change" highlight + count (chart and table mode); new QA checks; full QA re-run | ui-dev + qa-tester | 2 | G3 | done (G3 D-068) |
| S-12 | QA run: Playwright 390 / 1280, all 36 combos vs snapshot, incl. S-18 and S-19 → docs/qa/ | qa-tester | 2 | G3 | done (G3 D-068) |

## Sprint 3 — Figma (D2) · APPROVED at G1 (D-069); Jira (D3) after G4
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-13a | Figma full page 1280 + 390 (Quiz pattern), real H1 (BFC-55463), placeholder copy (BFC-55461), Q&As component sample state, carousel, "Learn this chart" v2 slot (D-051, D-069) | figma-designer | 1 | G4 | done (G4 D-074) |
| S-13b | Figma tool screens 1280 + 390: default chart, reason panel (+ note), rules changed, table mode states, 390 rules collapsed + swipe cue; CHIPY tokens, F2 contrast, F4 badge (D-053, D-068, D-069) | figma-designer | 2 | G4 | done (G4 D-074) |
| S-13c | Figma print: full-page chart + A6 pocket card, rules printed (D-064, D-069) | figma-designer | 2 | G4 | done (G4 D-074) |
| S-14 | Jira draft: Calculation Logic & Lookup Tables (engine + snapshot; must state the 2-cell deviation from v30: Single/H17 6,6 vs 7 Ph, Multi/H17 8,8 vs A Rpa — D-046, D-049) | jira-writer | 3 | G5 | done in Jira by Cowork (BFC-55467, D-074) |
| S-15 | Jira content for existing BFC-55465 Tool Layout (note: v2 "Learn this chart" goes directly below the tool, D-070/D-075 — no visible slot; notes for the design-system owner: in-page nav item height, breadcrumb tap targets, inactive segmented label contrast 4.41:1 — D-072), Tool Functionality | jira-writer | 3 | G5 | drafted (G5 pending) |
| S-16 | Jira drafts: SEO Content (incl. keyword split decision with Ahrefs, D-016), Common Sections, related tools, sitemaps/index/search | jira-writer | 1 | G5 | done in Jira by Cowork (BFC-55463/64/68–74, D-074) |

## Follow-ups
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-21 | Prototype full visual sync with the signed-off Figma (D-076): tokens, palette, typography/spacing, buttons, 52px changed marker, light outline on dark cells, print styling; tool only; no logic change; QA re-run + visual check vs Figma → G3 visual | ui-dev + qa-tester | 2 | G3 | done (G3 D-080) |

## v2 (next version, not now)
- "Learn this chart": memory rules for the player's chart (D-051).

## Later (parked)
- Link a cell to the Hand Strategy Calculator pre-filled. · Double-restriction setting.
