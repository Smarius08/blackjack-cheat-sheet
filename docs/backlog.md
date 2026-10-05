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

## Sprint 2 — Prototype (D1) · APPROVED at G1 (D-045)
Defaults on load: 4–8 decks · dealer hits soft 17 · DAS allowed · surrender any. prototype/build.js inlines engine files unchanged.
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-07 | Trainer shell (Quiz E53) + chart at default rules: Hard / Soft / Pairs, move word + colour, Soft rows A,2–A,9 (D-049); prototype/build.js + byte-match test (merges old S-09) | ui-dev | 2 | — | approved |
| S-08 | Rule panel (4 controls, defaults) wired to chart.js; chart redraws on change | ui-dev | 2 | — | approved |
| S-10 | Tap/click/keyboard a cell → panel: row label, reason (why.js), note shown separately (D-029, D-030, D-049); no hover | ui-dev | 2 | — | approved |
| S-11 | Print view: chart fits one page, chosen rules printed | ui-dev | 2 | — | approved |
| S-12 | QA run: Playwright 390 / 1280, all 36 combos vs snapshot → docs/qa/ | qa-tester | 2 | G3 | approved |

## Sprint 3 — Figma (D2) + Jira (D3)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-13 | Figma page from approved prototype (desktop + mobile + print) | figma-designer | 2 | G4 | proposed |
| S-14 | Jira draft: Calculation Logic & Lookup Tables (engine + snapshot; must state the 2-cell deviation from v30: Single/H17 6,6 vs 7 Ph, Multi/H17 8,8 vs A Rpa — D-046, D-049) | jira-writer | 3 | G5 | proposed |
| S-15 | Jira drafts: Tool Layout, Tool Functionality | jira-writer | 3 | G5 | proposed |
| S-16 | Jira drafts: SEO Content (incl. keyword split decision with Ahrefs, D-016), Common Sections, related tools, sitemaps/index/search | jira-writer | 1 | G5 | proposed |

## Later (parked)
- Link a cell to the Hand Strategy Calculator pre-filled. · Double-restriction setting.
