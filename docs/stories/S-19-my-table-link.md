# S-19 — My-table link: the chosen rules live in the page URL

State: done (G1 D-045, D-051, D-054; batch D-058) · Agent: ui-dev · Goal served: 2 (chart correct for the player's rules) · Gate: none

## Why
A player sets the rules printed on their table once, then wants to bookmark or send the page and get the same chart back
(north-star "My-table link: rules kept in the URL"; D-051, D-054). A bad or half-edited link must never break the page.

## Read (only these)
- AGENTS.md (sections 1, 4, 9, 10)
- prototype/src/index.template.html, prototype/build.js (rules state from S-08: `setRules`, `getRules`, `onRulesChange`, D-060)
- test/rule-panel.test.js (pattern: `node:vm`, `ChipyCheatSheet`), snapshot/charts-36.json (test truth)

## Write (only these)
- prototype/src/index.template.html
- prototype/index.html (rebuilt with `node prototype/build.js`)
- test/my-table-link.test.js (new; `node:vm` with stubbed `location` and `history`)

## Out of scope
- "Copy link" button (not in D-054; the address bar already holds the link). Print (S-11), QA (S-12).
- Any edit to `engine/`, `snapshot/`, `package.json`, existing tests. No dependency added.

## Design (builder follows)
- URL format uses the D-023 values: `?decks=4-8&soft17=hits&das=yes&surrender=any`.
- On load, read the query before the first render. Each of the four values is checked on its own; a missing, empty, unknown or
  duplicated value uses the default for that field (D-045). All of this is silent: no error shown, no `console.error`.
- On every real rules change (`onRulesChange`, D-060) update the URL with `history.replaceState`, inside try/catch so a
  failure (e.g. `file://` restrictions) never breaks the page. Other query params and the `#hash` are kept as they are.

## Acceptance criteria
1. **All 36 combos round-trip (D-023, D-054).** For every combo: `setRules(combo)` → URL query → a fresh page load with that query →
   `getRules()` equals the combo and every chart cell equals the snapshot chart with that id (test in `node:vm`, stubbed `location`/`history`).
2. **Bad links fall back, silently (D-045, D-054).** Queries such as `decks=3`, `soft17=`, `surrender=except%20ace`, `das=yes&das=no`,
   `__proto__=x`, and no query at all load without a thrown error and without `console.error`; each bad or missing field equals its default
   (4-8, hits, yes, any) while valid fields in the same query are kept (e.g. `decks=1&soft17=` → 1, hits, yes, any).
3. **A change updates the URL in place (D-054).** Choosing a rule calls `history.replaceState` once with the new query; `pushState` and reload
   are never called; no call when the rules did not change; a throwing `replaceState` does not stop the chart from updating.
4. **Extra params survive (D-054).** With `?utm=a&decks=1`, a rule change keeps `utm=a` and any `#hash` and rewrites only the four rule keys.
5. **Nothing else changes (D-060).** Rule panel, table mode and reason panel behave as before: existing tests are unchanged and pass.
6. **Gate hygiene (AGENTS §4, §9).** `npm run check` exits 0, the stale-build test passes, and only Write-list files changed.

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | 36 combos round-trip twice (from defaults and from a linked page): fresh load → same rules, chart = snapshot, label = snapshot; first paint already the linked chart (72/72) |
| 2 | Pass | ~20 bad links (bad values, duplicates, __proto__/constructor, malformed %, 200 KB value) → no throw, no console.error, per-field fallback, no prototype pollution |
| 3 | Pass | replaceState only, once per real change, none when unchanged/already matching, try/catch; never pushState/reload |
| 4 | Pass | Extra params (incl. valueless) and #hash preserved |
| 5 | Pass | Existing tests unchanged and passing; template diff additive only |
| 6 | Pass | `npm run check` 99/99; stale build ok; only Write-list files. Lead Playwright (real Chrome): linked chart loads, "Hits" click rewrites URL, history length unchanged |

Overall: PASS (story-reviewer, 2026-10-05). Notes: bad links aren't cleaned in the address bar until the next change; a repeated key (even same value) falls back to default.

