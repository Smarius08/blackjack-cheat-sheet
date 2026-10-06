# Cheat Sheet visual spec (from Figma, for ui-dev) — D-077

Source: Figma file mRGsMU76MmiKMnzQkwYKgG, page "-> Blackjack Cheat Sheet" (14034:33811), frames signed off at G4 (D-074/075/076): CS / Default chart, Reason panel (+ note), Rules changed, Table mode (empty / hand picked / result / result changed), Print full / pocket, components CS / Move (14047:86) and CS / Pick (14060:14892). Screen values are CSS px; print values are pt (Figma A4 frame = 595 × 842).
Font: `font-family: Roboto, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`. Weights used: 400, 500, 600, 700, 800, 900. All line-heights are `normal` unless given.

## 1. Tokens and move palette
| Token | Hex | Used for |
|---|---|---|
| surface/white | #ffffff | shell, cells (Hit), card bodies |
| surface/lightest | #f9fafa | header band, table header + row labels, unselected segment |
| border/light | #e6e6e6 | grid lines, control outlines, card borders |
| text/heading | #404040 | labels, cell text, Surrender fill, print titles |
| text/body | #5e6166 | sub-lines, rules sentence values, corner "Your hand", button text |
| segmented inactive text (library) | #757575 | unselected Segmented option (2-option rows, mode switch) |
| brand/lime | #c4db11 | selected segment/pick, button border, Double fill |
| brand/lime-text (olive) | #859c2e | shell title (D-083), Split fill |
| color/gray-400 | #bfbfbf | Stand fill |
| card/black | #1a1d22 | Split text/icon, changed outline/flag |
| ink (prototype --ink) | #1a1a1a | reason body, count line, step headings, diff/changed boxes |
| link green | #5f7220 | Recommended Play link |
| lime tints | #b4ca09 @15% (panel/card header), #c4db11 @20% (move chip), #c4db11 @60% (circle) | |
| chip grey | #eef0f2 | "Dealer shows 10" chip |

| Move | Fill | Text + icon | Changed outline + corner flag |
|---|---|---|---|
| Hit | #ffffff | #404040 | #1a1d22 |
| Stand | #bfbfbf | #404040 | #1a1d22 |
| Double | #c4db11 | #404040 | #1a1d22 |
| Split | #859c2e | #1a1d22 | #1a1d22 |
| Surrender | #404040 | #ffffff | #ffffff |

Changed cell (State=Changed): `outline: 2px dashed <colour>; outline-offset: -2px` (dash 5/3), plus a 12×12px solid right-angle triangle in the top-right corner (`clip-path: polygon(0 0,100% 0,100% 100%)`), same colour. No text badge; cell size unchanged (52px). Meaning carried by the count line + aria text. Focus/open-cell outline: `3px solid #404040` inside on light cells; `3px solid #ffffff` inside on Surrender cells (as drawn in the Reason panel frames).

## 2. Typography (Roboto)
| Element | Weight / size | Colour | Other |
|---|---|---|---|
| Shell title "BLACKJACK CHEAT SHEET" | 700 / 20 (390: 18) | #859c2e (brand/lime-text) | uppercase, letter-spacing 0.02em, centred; contrast on #f9fafa 2.96:1, accepted brand choice (D-083, F2). Print title stays #404040 |
| Rule labels (Decks…) | 500 / 16 | #404040 | |
| Segmented 2-option (mode switch, soft 17, DAS) | 400 / 14 | selected #404040, unselected #757575 | |
| 3-option rows (Decks, Surrender) | selected 700 / 14 #404040; unselected 400 / 14 #5e6166 | | |
| Rules sentence | 400 / 14 #5e6166; "Table rules:" 700 #404040 | | |
| Buttons (Print chart, Print pocket card, Change rules, Close, Dismiss) | 700 / 14 | #5e6166 | uppercase |
| Legend pill word | 600 / 13 | per move | |
| Chart H2 (Hard hands…) | 700 / 18 | #404040 | |
| Chart sub-line | 400 / 13 | #5e6166 | |
| Corner "Your hand" | 500 / 12 | #5e6166 | |
| Dealer header (2…A) | 700 / 13 | #404040 | centred |
| Row labels (5–7, A,2, 8,8) | 700 / 14 | #404040 | left, padding-left 10 |
| Cell word | 600 / 12 (390: 11, letter-spacing -0.2px) | per move | |
| Swipe cue (390) | 600 / 13 | #5e6166 | |
| Reason panel title "Hard 16 vs dealer 10" | 700 / 16 | #404040 | |
| Reason move chip word | 800 / 20 | #404040 | uppercase |
| Reason body | 400 / 16, line-height 1.45 | #1a1a1a | |
| Reason note | 400 / 14, line-height 1.4 | #5e6166 | |
| Count line "17 moves changed…" | 600 / 14 | #1a1a1a | |
| Table-mode step heading "1. Your hand" | 700 / 16 | #1a1a1a | |
| Group label "Hard totals" | 700 / 13 | #5e6166 | |
| Pick button | 600 / 16 (selected 700 / 16) | #404040 | |
| Empty prompt "Pick your hand…" | 400 / 14 | #5e6166 | |
| Recommended Play header | 500 / 16, letter-spacing 1% | #404040 | |
| Card hand "Hard 16" | 900 / 40 (390: 34), line-height 1.05 | #404040 | |
| "Dealer shows 10" chip | 700 / 13 | #5e6166 | |
| Move word "SURRENDER" | 800 / 28 | #404040 | uppercase |
| Card link | 600 / 14 | #5f7220 | |
| "Changed for your new rules" marker | 700 / 14 | #1a1a1a | |

## 3. Sizes and spacing (1280)
- **Shell**: tool-only frames and prototype: width 852 (content 804); on the page 900 (content 852) is the truth, see §7 (D-085). background #fff, radius 16, `box-shadow: 0 -1px 20px 2px rgba(0,0,0,.10)`, no border. Header band #f9fafa, padding 24 20 20 20. Body padding 24, gap 20 between blocks.
- **Rule panel**: 2 columns, column gap 20, row gap 16; label → control gap 8.
- **Segmented controls**: height 48, radius 6, `1px solid #e6e6e6` (inside), segments equal width, no gaps; selected fill #c4db11, unselected #f9fafa; option padding 12 16 (3-option rows: padding 0 8).
- **Buttons** (secondary): height 48, padding 16 24, `2px solid #c4db11`, radius 6, transparent fill, gap 10 between print buttons.
- **Legend**: wrap, gap 10 (row gap 8). Pill: height 32, padding 5 10 5 6, gap 6, radius 999, fill per move; Hit pill `1px solid #e6e6e6`.
- **Chart box**: `border: 1px solid #e6e6e6`, radius 12, overflow hidden; grid lines 1px #e6e6e6 (cells separated by 1px). Pinned column 84px. Header row 36px. Body rows **52px always**. Dealer columns at 1280: 71px in the 852 shell (84 + 1 + 10×71 + 9 = 804); in the 900 shell they share the width after the 84px column equally (≈75.8px). 390 keeps fixed columns + scroll. Header/row-label cells #f9fafa. Cell: icon 20 above word, gap 2, side padding 2. Section gap between charts 28; H2 → sub 4, sub → box 14 (390: sub → swipe cue 4, cue → box 10).
- **Reason panel**: `1px solid #e6e6e6`, radius 12. Head: fill #b4ca09 @15%, padding 8 8 8 16, gap 12 (title + Close button). Body: padding 14 16 16 16, gap 12. Move chip: radius 999, fill #c4db11 @20%, `1px solid #c4db11`, padding 6 14 6 8, gap 10; icon circle holds a 22px icon.
- **Count line box (diff note)**: #fff, `1px solid #1a1a1a`, radius 8, padding 6 8 6 14, gap 12 (text + Dismiss button).
- **Table mode**: pick area gap 18 between steps; step heading → groups gap 8; group label → grid gap 6; pick grid wrap, gap 8. Pick button 60×48 (390: 62×48), radius 8, `1px solid rgba(0,0,0,.18)`, #fff; selected #c4db11. "Change rules" = secondary button.
- **Recommended Play card** (Calculator 12337:1558 style): `1px solid #e6e6e6`, radius 12. Header fill #b4ca09 @15%, padding 12 16. Body padding 16 20 20 20. Dealer chip #eef0f2, radius 999, padding 2 10. Move row: radius 10, fill #c4db11 @20%, `1px solid #c4db11`, padding 8 12, gap 10; circle 40×40 #c4db11 @60% with 26px icon. Link row min-height 44 (padding 10 0). Changed marker: #fff, `2px dashed #1a1a1a` (6/3), radius 8, padding 6 10.

## 4. 390 differences
Page side margin 8 → shell 374 wide; body padding 24 16 16 16; title 18. Rule panel one column. Print buttons stacked, full width. Chart box 342: pinned "Your hand" 84 + scroll area 257 (`overflow-x:auto`), dealer columns 62px (2–5 visible, 6 peeks), swipe cue above each box, right-edge fade 20px `linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,.95))`. Page never wider than 390. Chart cell word 11px, letter-spacing -0.2px (≤600px; 1280 stays 12px). At scroll end (e.g. a tapped cell in columns 8–A scrolled into view) the swipe cue and fade are hidden for that table only. Pick buttons 62×48. Card hand 34px.

## 5. Print (pt)
- **Full (A4 portrait)**: page padding 28, content centred. Title 700 / 17, #404040, centred. Rules line 600 / 9.5. Legend pills 24 high, icon 16, word 600 / 10.4. Table H2 700 / 9.5. Grid lines **0.75pt #5e6166** (table background #5e6166 with 0.75 gaps + 0.75 padding). Header/row-label cells #f9fafa; corner 500 / 6.5 #5e6166; dealer 700 / 8. Rows 19 high (header 14), pinned column 60, cells 47 wide: icon 9 + word 600 / 6.8, move fills as screen.
- **Pocket (A4 landscape, 2 × A6)**: sheet 596 × 420 centred on the page; fold/cut line 0.85pt dashed (4/3) #5e6166. Panel padding 14 14 11 14; title 800 / 10.5 #404040; rules line 600 / 6.8; table heading 800 / 7.5; "Dealer:" 700 / 5.5; dealer numbers 800 / 7; key line 800 / 7 centred; footer note 400 / 5.5 #5e6166. Cells 22 × 20 with a single letter (H S D P R), **900 / 11** on panel 1 (Hard), **900 / 9** on panel 2 (Soft + Pairs), colours as screen. Grid 0.75pt #5e6166. (Title/centring sync is S-21, D-074.)

## 6. Icons
Same glyphs as Trainer/Calculator (Figma local "Icons" set; `prototype/src/icons`): Hit = action-hit (pointer click), Stand = action-stand (open hand), Double = action-double (two vertical bars), Split = action-split (↔ arrows), Surrender = action-surrender (flag). Colour = the move's text colour.
Sizes: chart cell 20, legend pill 20, reason chip 22, Recommended Play circle 26, print legend 16, print cell 9; pocket card uses letters, no icons.

## 7. Page template (full-page frames, D-084)
Full page 1280 14047:648859 / 390 14048:648735 and Table mode 14071:660225 / 14071:661008 follow the Strategy Calculator page template (Figma 12386:8654). Page only, not the tool.
- Page background #f9fafa behind all sections.
- Top section + in-page nav share one soft shadow (no shadow on the nav itself). Nav labels: "Blackjack Cheat Sheet", "How it works", "Q&As", "Other tools".
- "Read more" in olive #859c2e.
- 120 px between the page content and the footer (desktop).
- Mobile: Authors section padding 8 px.
- Desktop: the tool shell uses the full 900 px content column (852 content + 24 px padding each side); the 10 dealer columns share the width after the 84 px "Your hand" column equally (≈76 px). This is the source of truth. The tool-only frames and the prototype still show 852 (§3), accepted difference until S-22 (D-085).
- Carousel order: Cheat Sheet, Quiz, Trainer, Calculator, Simulator.
- No Embed button: legacy feature, hidden in the Calculator/Quiz templates, not part of this page (D-072, D-084).

## Not extracted / notes
- Hover/focus states are not drawn in Figma; keep the prototype's 3px #404040 focus ring (white on Surrender).
- Print values are frame units (pt); browser print scaling may differ slightly.
