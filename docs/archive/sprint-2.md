# Archive — Sprint 2 (D1 prototype), all done 2026-10-05, G3 signed off (D-068)

Story files stay in `docs/stories/` (each with its review table). Batch mode D-058. Build order D-054: S-07, S-08, S-18, S-10, S-11, S-19, S-12, S-20.

- S-07 · prototype/build.js + src/index.template.html + src/icons/ + index.html + test/prototype.test.js: CHIPY shell + default chart, move icon + word (merges old S-09) · done, PASS · D-045, D-049, D-052, D-053, D-056 · f55200c
- S-08 · rule panel (4 controls) + rules sentence + test/rule-panel.test.js · done, PASS · D-002, D-050, D-060 · 4458d05
- S-18 · table mode: two taps to one big move + Calculator link + test/table-mode.test.js · done, PASS · D-051, D-055, D-061, D-062 · e6f6dfa
- S-10 · tap/keyboard cell → reason panel + test/cell-reason.test.js · done, PASS · D-029, D-030, D-063 · ba1e478
- S-11 · print: full page (words + icons) and A6 pocket card (letters) + test/print.test.js · done, PASS · D-054, D-064 · 43b8631
- S-19 · my-table link: rules in URL, round-trip, bad values → defaults + test/my-table-link.test.js · done, PASS · D-051, D-054 · c9d7d7d
- S-12 · QA run: docs/qa/ report, qa-run.mjs, screenshots; 8/8 PASS in real Chrome · done, PASS · G3 D-068, D-065 · bae2657
- S-20 · G3 fixes: scroll cue at 390, Calculator link 44px, "what your rules change" + QA checks 9–11; QA re-run 11/11 PASS · done, PASS · D-066, D-067, G3 D-068 · 1a0410c (build), 501b096 (QA)
- G3 sign-off + Sprint 2 close recorded in d1431a5. Carried to S-13 Figma brief: F2 (title contrast ≈2.96:1), F4 (9px "Changed" badge overlaps icon top) · D-068.
- `npm run check` at close: 118/118.
