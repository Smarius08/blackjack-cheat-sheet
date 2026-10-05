# S-13c — Figma print: one full-page chart and one pocket card (A4)

State: done (G4 D-074) (G1 D-069) · Agent: figma-designer · Goal served: 2 (usable at the table, printable) · Gate: G4

## Why
The prototype prints two sheets (S-11): a full page and a small pocket card to carry. Marius needs both drawn in Figma, at the default rules, so G4 can sign off the whole page, screens and print before Jira (D-064, D-069).

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9), this story, .claude/agents/figma-designer.md
- prototype/index.html at commit 139bd2c: print layouts `#print-full` and `#print-pocket` (functions `renderPrintFullHTML`, `renderPocketHTML` in prototype/src/index.template.html) for exact strings
- snapshot/charts-36.json, entry `decks=4-8|soft17=hits|das=yes|surrender=any` (move of every cell)
- docs/decisions.md rows D-053, D-064, D-069, D-071, D-072
- Figma, same file: `CS / Move` 14047:86 (reuse); S-13a/S-13b frames (read-only, for palette and icons)

## Write (only these)
- Figma file mRGsMU76MmiKMnzQkwYKgG, page "-> Blackjack Cheat Sheet", node 14034:33811. Load figma-use before every write.
- docs/figma/cs-print-full-a4.png, docs/figma/cs-print-pocket-a4.png (plus one greyscale PNG of the pocket card, docs/figma/cs-print-pocket-a4-grey.png)

## Frames
1. **"CS / Print full / A4"**: portrait, 595×842 pt (210×297 mm). Title, rules sentence, legend with icons, then Hard, Soft (rows A,2 to A,9, D-049) and Pairs tables; every cell has move icon + word. Fits one page. No rule panel, buttons, switch, reason panels or URL.
2. **"CS / Print pocket / A4"**: landscape, 842×595 pt. Two 105×148 mm panels (A6) side by side, a dashed fold/cut line between them, corner marks. Panel 1 = Hard; panel 2 = Soft + Pairs. Each cell is ONE letter (H, S, D, P, R) on a CHIPY token tint. Both panels carry the title and rules sentence, and the legend "H Hit · S Stand · D Double · P Split · R Surrender".
3. Content is the default rules only. Letter-size variants are optional and not required.

## Out of scope
Other rule combos, Letter variants, tool screens (S-13b), full page (S-13a), dark mode, new copy or moves not in the prototype, any other page or node, editing the prototype or other docs.

## Acceptance criteria
1. Both frames exist on node 14034:33811 with the exact names above and sizes 595×842 (portrait) and 842×595 (landscape).
2. Full page: one page, every cell has icon + word, title, rules sentence and legend with icons are present, Soft rows are A,2 to A,9, and none of the excluded items (rule panel, buttons, switch, reason panels, URL) appear (D-053, D-054).
3. Pocket card: every letter equals the snapshot move for the default rules via HIT→H, STAND→S, DOUBLE→D, SPLIT→P, SURRENDER→R; two 105×148 mm panels with a dashed fold line; title, rules sentence and legend on both panels (D-064).
4. Pocket card is legible in black and white: in the greyscale PNG every letter is dark, bold and distinguishable from its neighbours without the tint; the report states the letter size and contrast ratio (at least 4.5:1) (D-064).
5. CHIPY tokens and the D-072 palette are used; `CS / Move` (14047:86) with the local icons (D-071) is reused, not redrawn.
6. The PNGs exist in docs/figma/, the report gives node IDs and URLs, and nothing was written outside the page and docs/figma/ (AGENTS.md section 9).

## Verification
The Lead checks with Figma screenshots (story-reviewer cannot open Figma).

## Review (filled by Lead via screenshots)
| # | Pass/Fail | Evidence |
|---|---|---|
| # | Pass/Fail | Evidence (Lead, PNGs + designer cell check) |
|---|---|---|
| all | Pass | CS / Print full / A4 14063:15139 (595×842, fits one page, icon + word, rules + legend, Soft A,x); CS / Print pocket / A4 14065:16035 (842×595, two 298×420pt panels, dashed fold, corner marks, legend + rules both panels); 300/300 cells = snapshot in each; greyscale letters ≥5.49:1 (Lead viewed grey PNG: legible); 3 PNGs in docs/figma/; new CS / Move variants Kind=Print, Kind=Letter → G4 card |

Overall: PASS (Lead, 2026-10-05), pending G4. Note: design-critique / accessibility-review skills not run for S-13c (designer's own review only).

