# S-13a — Figma full page, 1280 and 390 (Quiz page pattern)

State: done (G4 D-074) · Agent: figma-designer · Goal served: 2 (usable, correct chart; page ready for goal 1 ranking) · Gate: G4 (after S-13c)

## Why
Marius needs to see the whole Cheat Sheet page as a visitor would (D-069), in the same layout as the Quiz page, before tool states (S-13b) and print (S-13c) are designed.

## Read (only these)
- AGENTS.md (sections 1, 4, 5, 9), this story
- prototype/index.html at commit 139bd2c (source of strings and defaults: Full chart view; 4-8 decks, dealer hits on soft 17, double after split allowed, surrender any dealer card)
- ../blackjack-quiz/docs/design-brief.md and docs/decisions.md E53 (tool shell; read-only)
- Figma, same file, read-only: Quiz full page 13839:20221, Trainer 13146:897, Calculator 12249:16711 (Recommended Play card 12337:1558)

## Write (only these)
- Figma file mRGsMU76MmiKMnzQkwYKgG, page "-> Blackjack Cheat Sheet", node 14034:33811. Frames "CS / Full page / 1280" and "CS / Full page / 390". Load figma-use (and figma-generate-design) before every write; search the design system first and reuse CHIPY components and variables.
- docs/figma/cs-full-page-1280.png and docs/figma/cs-full-page-390.png

## Page sections, in order
Breadcrumbs · H1 "Blackjack Cheat Sheet: Basic Strategy Chart for Your Table Rules" (BFC-55463) · author/reviewer · upper content (placeholder) · in-page navigation · the tool (title "BLACKJACK CHEAT SHEET", rule panel, Full chart | Table mode switch, print buttons, legend, Hard/Soft/Pairs chart) · reserved "Learn this chart" slot directly below the tool, labelled exactly "Reserved for v2: Learn this chart. Not built at launch" (D-051, D-070) · How It Works + lower content (placeholders) · Q&As (existing component, sample state: 3 questions + Load More) · "Other Blackjack Tools" carousel: Calculator, Trainer, Quiz, Simulator (existing component, D-057) · page contributors.
All placeholder blocks are labelled "Copy from content brief BFC-55461".

## Out of scope
Dark mode, house edge, any new related-tools block, tool state frames (S-13b), print (S-13c), any page or node other than 14034:33811, editing prototype or docs other than the PNGs.

## Acceptance criteria
1. Both frames exist on node 14034:33811 with the exact names above, at 1280 and 390 wide.
2. The sections appear in the order listed, the H1 matches the text above exactly, and every non-H1 copy block is a labelled placeholder (no invented copy).
3. The tool shows the prototype's strings and the default rules; every chart cell has a CHIPY move icon plus the move word (D-053); colours come from CHIPY tokens (lime #c4db11, olive #859c2e, neutrals), not the prototype's placeholder tints (D-053).
4. Title/text contrast is at least 4.5:1 (F2, D-068; designer proposes the token and lists it), all tap targets are at least 44px, and at 390 the page never scrolls sideways: only the chart scrolls inside its box, with "Your hand" pinned and the "Swipe for dealer 6-A" cue (D-050).
5. The report lists which design-system components and variables were reused (shell, Q&As, carousel, breadcrumbs, etc.); nothing was drawn from scratch where a component exists.
6. PNG exports exist at the two paths above, nothing was written outside the page and docs/figma/, and the report gives both frame node IDs and URLs plus design-critique and accessibility-review findings, with open design trade-offs listed, not decided.

## Verification
The Lead checks with Figma screenshots (story-reviewer cannot open Figma).

## Review (filled by Lead via screenshots)
| # | Pass/Fail | Evidence |
|---|---|---|
| # | Pass/Fail | Evidence (Lead, Figma screenshots + PNG crops) |
|---|---|---|
| 1 | Pass | CS / Full page / 1280 = 14047:648859, CS / Full page / 390 = 14048:648735 on 14034:33811 |
| 2 | Pass | Sections in order; H1 exact; placeholders "Copy from content brief BFC-55461"; v2 slot "Reserved for v2: Learn this chart. Not built at launch" below the tool (D-070) |
| 3 | Pass | Tool strings + defaults = prototype; 300 cells = snapshot default chart; icon + word per cell; icons = Calculator/Trainer set after D-071 fix (Double bars, Split arrows); CHIPY token palette (D-072) |
| 4 | Pass | Title #404040 on #f9fafa 9.9:1 (D-072); chart/controls ≥44px; 390: inner scroll, pinned "Your hand", swipe cue + fade, nothing past 390px. Library targets (nav, breadcrumbs) and segmented label 4.41:1 → S-15 notes (D-072) |
| 5 | Pass | Reused: Top section, breadcrumbs, author, In page nav, Segmented buttons, Quiz / Filters, General buttons, local Icons set, Q&As Section, Other tools carousel, Authors section, Newsletter, Footer; new local CS / Move (14047:86) — no cell component existed |
| 6 | Pass | docs/figma/cs-full-page-1280.png (1280×7472), cs-full-page-390.png (390×9369); writes only on 14034:33811 + docs/figma/; critique + a11y findings listed in the designer report |

Overall: PASS (Lead, 2026-10-05), pending G4 with S-13b/c.
D-073 rework (Lead check via exports): top section = "Top section full width" 12625:94021 / mobile 12625:94028 (the main component behind Quiz 13996:5601), breadcrumb + exact H1, sample text; lower content rebuilt from the Quiz parts (13996:5606 / 13996:6184 are frames, not components — Callout box, Numbered list, FAQs Widget instances), headings "How to use the Blackjack Cheat Sheet" / "Blackjack Cheat Sheet FAQs"; in-page nav new instance, tabs at content column x=190 (1280), full width (390); order per D-073; frames 1280×9398 / 390×10757; tool, v2 slot, Q&As, carousel, contributors unchanged. Open: nav label "How It Works" vs heading "How to use…".
D-074: nav item "How to use" (component renders "How To Use"); new CS / Full page – Table mode 1280 14071:660225 / 390 14071:661008.
D-075: v2 slot removed from all frames (tool → How to use, 56px / 40px); heights 1280×9254, 390×10623; table-mode 1280×7871, 390×9257.
