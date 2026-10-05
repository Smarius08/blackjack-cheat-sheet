# S-01 — Repo scaffold: one command, `npm run check`, that every later story must pass

State: done · Agent: engine-dev · Goal served: 3 (fast to ship) · Gate: none

## Why
Every story ends with "`npm run check` must pass" (AGENTS.md §7). That command does not exist yet.
This story creates it, so later stories have one yes/no test of "is it still working", on both machines.

## Current repo state (checked with Glob)
- `.gitattributes` already exists (`* text=auto eol=lf`, png/xlsx binary). Verify only; do not rewrite.
- `package.json` does NOT exist. This story creates it.
- `.gitignore` and `SETUP.md` exist. SETUP.md already says: Node 20+, then `npm install` then `npm run check`.
- `engine/`, `prototype/`, `snapshot/` exist but hold no code.

## Read (only these)
- AGENTS.md
- SETUP.md
- .gitattributes

## Write (only these)
- package.json
- test/smoke.test.js (one trivial passing test, so the runner has something to run)

## Out of scope
- Any engine, vendor, snapshot or prototype file (S-02 onward).
- Any dependency, lint tool, bundler or test framework package.
- Editing `.gitattributes`, `.gitignore`, `SETUP.md`, or any docs.

## Acceptance criteria
1. `package.json` exists, is private, and has a `scripts.check` entry (AGENTS.md §7).
2. `npm run check` exits 0 on a clean checkout and runs at least one test with Node's built-in `node --test` (D-018).
3. `package.json` has no `dependencies` or `devDependencies`, so `npm install` adds nothing (AGENTS.md §10, Node only).
4. The check script uses no shell-specific commands (`rm`, `cp`, `export`) and no glob arguments; plain `node --test` finds the tests on Windows and Mac (AGENTS.md §10).
5. `.gitattributes` still forces LF (`eol=lf`) and no other tracked file was changed (AGENTS.md §9, §10).

## Review (filled by story-reviewer)
| # | Pass/Fail | Evidence |
|---|---|---|
| 1 | Pass | package.json: `"private": true`, `"scripts": { "check": "node --test" }` |
| 2 | Pass | `npm run check` → tests 1 / pass 1 / fail 0, exit 0 (Node v26.10.0, home-mac-mini); built-ins only (D-018) |
| 3 | Pass | No `dependencies` / `devDependencies` key; no lockfile created |
| 4 | Pass | Script is exactly `node --test`: no rm/cp/export, no glob; default discovery finds test/smoke.test.js |
| 5 | Pass | .gitattributes unchanged (`* text=auto eol=lf`); diff of .gitattributes/.gitignore/SETUP.md empty; new files LF |

Overall: PASS (story-reviewer, 2026-10-05). Observation: package.json also has name/version/description/engines (node >=20, matches SETUP.md).
