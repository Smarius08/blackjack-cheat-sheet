# Backlog

States: proposed → approved (G1) → in progress → built → reviewed → done. Each line becomes one story file.
Goal = 1 search · 2 table · 3 ship.

## Sprint 1 — Engine (D3 truth) · APPROVED at G1 (D-014)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-01 | Repo scaffold: package.json `npm run check`, test runner, .gitattributes | engine-dev | 3 | — | approved |
| S-02 | Vendor strategy_table.js + explanation_writer.js unchanged + checksum test | engine-dev | 2 | G2 | approved |
| S-03 | `engine/chart.js`: rules → 3 tables of plain moves (resolveCode, firstDecision=true) | engine-dev | 2 | G2 (D-019) | approved |
| S-04 | `snapshot/charts-36.json` generated + test that chart.js reproduces it | engine-dev | 2 | G2 | approved |
| S-05 | `snapshot/review.html`: human-readable view of all 36 charts for Marius/reporter | engine-dev | 2 | G2 | approved |
| S-06 | `engine/why.js`: short reason per cell from explanation_writer (D-028) | engine-dev | 2 | — | approved |

## Sprint 2 — Prototype (D1)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-07 | Prototype shell: Trainer tool shell + empty chart area | ui-dev | 2 | — | proposed |
| S-08 | Rule panel (4 controls, defaults) wired to chart.js | ui-dev | 2 | — | proposed |
| S-09 | Chart render: Hard / Soft / Pairs, plain moves, colour + text label | ui-dev | 2 | — | proposed |
| S-10 | Tap/hover a cell → reason | ui-dev | 2 | — | proposed |
| S-11 | Print view with chosen rules printed | ui-dev | 2 | — | proposed |
| S-12 | QA run: Playwright 390 / 1280, all 36 combos vs snapshot | qa-tester | 2 | G3 | proposed |

## Sprint 3 — Figma (D2) + Jira (D3)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-13 | Figma page from approved prototype (desktop + mobile + print) | figma-designer | 2 | G4 | proposed |
| S-14 | Jira draft: Calculation Logic & Lookup Tables (engine + snapshot) | jira-writer | 3 | G5 | proposed |
| S-15 | Jira drafts: Tool Layout, Tool Functionality | jira-writer | 3 | G5 | proposed |
| S-16 | Jira drafts: SEO Content (incl. keyword split decision with Ahrefs, D-016), Common Sections, related tools, sitemaps/index/search | jira-writer | 1 | G5 | proposed |

## Later (parked)
- Link a cell to the Hand Strategy Calculator pre-filled. · Double-restriction setting.
