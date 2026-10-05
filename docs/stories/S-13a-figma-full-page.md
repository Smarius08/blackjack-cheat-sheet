# S-13a — Figma full page, 1280 and 390 (Quiz page pattern)

State: approved · Agent: figma-designer · Goal served: 2 (usable, correct chart; page ready for goal 1 ranking) · Gate: G4 (after S-13c)

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
