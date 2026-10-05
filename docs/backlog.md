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

## Sprint 3 — Figma (D2) + Jira (D3)
| ID | Story (one output) | Agent | Goal | Gate | State |
|---|---|---|---|---|---|
| S-13 | Figma page from approved prototype (desktop + mobile + print); reserve space for v2 "Learn this chart" (D-051); final chart colours from CHIPY tokens (lime #c4db11 / #859c2e, neutrals), cells keep move icon + word (D-053); title #859c2e on #f9fafa ≈ 2.96:1 contrast — review with E53 owner; "Changed" badge 9px overlaps icon top (QA F4) | figma-designer | 2 | G4 | proposed |
| S-14 | Jira draft: Calculation Logic & Lookup Tables (engine + snapshot; must state the 2-cell deviation from v30: Single/H17 6,6 vs 7 Ph, Multi/H17 8,8 vs A Rpa — D-046, D-049) | jira-writer | 3 | G5 | proposed |
| S-15 | Jira drafts: Tool Layout (reserve space for v2 "Learn this chart", D-051), Tool Functionality | jira-writer | 3 | G5 | proposed |
| S-16 | Jira drafts: SEO Content (incl. keyword split decision with Ahrefs, D-016), Common Sections, related tools, sitemaps/index/search | jira-writer | 1 | G5 | proposed |

## v2 (next version, not now)
- "Learn this chart": memory rules for the player's chart (D-051).

## Later (parked)
- Link a cell to the Hand Strategy Calculator pre-filled. · Double-restriction setting.
