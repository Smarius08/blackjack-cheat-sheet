// S-20 tests: scroll cue logic, Calculator link size, "What your rules change" (D-066, D-067).
// node:vm with a tiny stub document. Expected counts come from snapshot/charts-36.json, not from the app.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'prototype', 'index.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));
const FIELDS = ['decks', 'soft17', 'das', 'surrender'];
const VALUES = { decks: ['1', '2', '4-8'], soft17: ['stands', 'hits'], das: ['yes', 'no'], surrender: ['none', 'any', 'except_ace'] };
const TABLES = ['hard', 'soft', 'pairs'];

function makeDoc(pre) {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', hidden: false, handlers: {}, querySelectorAll() { return []; },
    addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); } });
  if (pre) pre(el);
  return { els, getElementById: el };
}

function loadPage(search, pre) {
  const doc = makeDoc(pre);
  const ctx = vm.createContext({ document: doc, location: { search: search || '', hash: '' }, URLSearchParams });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) vm.runInContext(m[2], ctx, { filename: m[1] });
  return { app: ctx.ChipyCheatSheet, doc };
}

function snapOf(rules) {
  return snapshot.charts.find((c) => FIELDS.every((f) => c.rules[f] === rules[f]));
}

// Independent count: cells whose move differs between two snapshot charts.
function differing(a, b) {
  let n = 0;
  for (const t of TABLES) a.tables[t].forEach((row, i) => row.cells.forEach((c, j) => { if (c.move !== b.tables[t][i].cells[j].move) n++; }));
  return n;
}

function textFor(n) {
  return n === 0 ? 'No moves changed for your new rules' : n === 1 ? '1 move changed for your new rules' : n + ' moves changed for your new rules';
}

const marked = (doc) => (doc.els.chart.innerHTML.match(/data-changed="1"/g) || []).length;
const noteText = (doc) => (doc.els['diff-note'].innerHTML.match(/<span data-diff-text>([^<]*)<\/span>/) || [])[1];

const start = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };

test('216 transitions: marked cells, diffCharts length and count text equal the snapshot difference', () => {
  assert.equal(snapshot.charts.length, 36);
  let transitions = 0, min = Infinity, max = -Infinity;
  const { app, doc } = loadPage();
  for (const from of snapshot.charts) {
    for (const f of FIELDS) {
      for (const v of VALUES[f]) {
        if (v === from.rules[f]) continue;
        const to = snapOf({ ...from.rules, [f]: v });
        const expected = differing(from, to);
        assert.deepEqual(app.diffCharts(from.rules, to.rules).length, expected);
        app.setRules(from.rules);
        app.dismissDiff();
        assert.equal(app.setRules(to.rules), true);
        assert.equal(marked(doc), expected, from.id + ' -> ' + to.id);
        assert.equal(noteText(doc), textFor(expected));
        assert.equal(doc.els['diff-note'].hidden, false);
        assert.equal(app.getDiff().length, expected);
        transitions++; min = Math.min(min, expected); max = Math.max(max, expected);
      }
    }
  }
  assert.equal(transitions, 216);
  console.log('changed-cell count over 216 transitions: min ' + min + ', max ' + max);
});

test('diffCharts entries name the cell and both moves; pure; same rules -> empty', () => {
  const { app } = loadPage();
  const from = snapOf(start), to = snapOf({ ...start, soft17: 'stands' });
  const d = app.diffCharts(start, to.rules);
  assert.ok(d.length > 0);
  for (const e of d) {
    assert.deepEqual(Object.keys(e).sort(), ['dealer', 'from', 'row', 'table', 'to']);
    const i = from.tables[e.table].findIndex((r) => r.label === e.row);
    const j = from.tables[e.table][i].cells.length === 10 ? ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'].indexOf(e.dealer) : -1;
    assert.equal(from.tables[e.table][i].cells[j].move, e.from);
    assert.equal(to.tables[e.table][i].cells[j].move, e.to);
    assert.notEqual(e.from, e.to);
  }
  assert.equal(app.diffCharts(start, start).length, 0);
  assert.equal(app.getRules().decks, '4-8');
});

test('wording: zero, one, many', () => {
  const { app } = loadPage();
  assert.equal(app.diffText(0), 'No moves changed for your new rules');
  assert.equal(app.diffText(1), '1 move changed for your new rules');
  assert.equal(app.diffText(5), '5 moves changed for your new rules');
  // which wording classes the real single-field transitions reach
  const seen = new Set();
  for (const a of snapshot.charts) for (const f of FIELDS) for (const v of VALUES[f]) {
    if (v !== a.rules[f]) { const n = differing(a, snapOf({ ...a.rules, [f]: v })); seen.add(n === 0 ? 'zero' : n === 1 ? 'one' : 'many'); }
  }
  assert.ok(seen.has('many'));
  console.log('wording classes reached by the 216 transitions: ' + [...seen].join(', '));
});

test('first load and ?query load: query applied, no markers, no count line', () => {
  const cases = [
    ['', start],
    ['?decks=1&soft17=stands&das=no&surrender=none', { decks: '1', soft17: 'stands', das: 'no', surrender: 'none' }],
    ['?decks=2', { ...start, decks: '2' }],
  ];
  for (const [q, want] of cases) {
    const { app, doc } = loadPage(q);
    assert.deepEqual({ ...app.getRules() }, want, q);
    assert.equal(marked(doc), 0, q);
    assert.equal(app.getDiff(), null);
    assert.equal(doc.els['diff-note'].hidden, true);
    assert.equal(doc.els['diff-note'].innerHTML, '');
    assert.ok(!/class="chg"/.test(doc.els.chart.innerHTML));
  }
});

test('a real change that moves no cell shows the zero line (multi-field jump)', () => {
  const { app, doc } = loadPage();
  let pair = null;
  for (const a of snapshot.charts) for (const b of snapshot.charts) if (!pair && a !== b && differing(a, b) === 0) pair = [a, b];
  if (!pair) return; // none in this snapshot: wording is covered by diffText
  app.setRules(pair[0].rules);
  app.dismissDiff();
  app.setRules(pair[1].rules);
  assert.equal(marked(doc), 0);
  assert.equal(noteText(doc), 'No moves changed for your new rules');
  assert.equal(doc.els['diff-note'].hidden, false);
});

test('same rules again changes nothing; dismiss clears; next change replaces', () => {
  const { app, doc } = loadPage();
  app.setRules(start);
  assert.equal(marked(doc), 0);
  assert.equal(doc.els['diff-note'].hidden, true);

  const b = { ...start, decks: '1' }, c = { ...b, surrender: 'none' };
  app.setRules(b);
  const nB = differing(snapOf(start), snapOf(b));
  assert.equal(marked(doc), nB);
  app.setRules(b); // no real change: highlight stays as it was
  assert.equal(marked(doc), nB);
  assert.equal(noteText(doc), textFor(nB));

  app.setRules(c); // replaces: diff against b, not against the first rules
  const nC = differing(snapOf(b), snapOf(c));
  assert.equal(marked(doc), nC);
  assert.equal(noteText(doc), textFor(nC));

  // Dismiss through the real click handler
  const click = doc.els['diff-note'].handlers.click[0];
  click({ target: { closest: (sel) => (sel === 'button[data-diff-dismiss]' ? {} : null) } });
  assert.equal(marked(doc), 0);
  assert.equal(app.getDiff(), null);
  assert.equal(doc.els['diff-note'].hidden, true);
  assert.equal(app.dismissDiff(), false);
});

test('rule panel change event also marks', () => {
  const { app, doc } = loadPage();
  doc.els['rule-panel'].handlers.change[0]({ target: { type: 'radio', name: 'rule-soft17', value: 'stands' } });
  const n = differing(snapOf(start), snapOf({ ...start, soft17: 'stands' }));
  assert.equal(marked(doc), n);
  assert.equal(noteText(doc), textFor(n));
  assert.ok(app.getDiff().length === n);
});

test('markers are not colour only: aria-label, attribute (no text badge); is-open ring is a different class', () => {
  const { app, doc } = loadPage();
  app.setRules({ ...start, soft17: 'stands' });
  const h = doc.els.chart.innerHTML;
  const n = marked(doc);
  assert.ok(n > 0);
  assert.equal((h.match(/class="chg"|>Changed</g) || []).length, 0); // D-074: marker is CSS-only (dashed outline + corner triangle)
  assert.equal((h.match(/, changed for your new rules\. Show why/g) || []).length, n);
  assert.match(html, /\.cell-hit\[data-changed\] \{ outline: 2px dashed/);
  assert.match(html, /\.cell-hit\.is-open \{ box-shadow: inset 0 0 0 3px/);
});

test('table mode: result card marked only when the shown cell changed', () => {
  const { app, doc } = loadPage();
  app.setMode('table');
  const from = start, to = { ...start, soft17: 'stands' };
  const diff = app.diffCharts(from, to);
  assert.ok(diff.length > 0);
  const ch = diff.find((e) => e.table === 'hard' && /^\d+$/.test(e.row)) || diff.find((e) => e.table === 'hard');
  const hand = app.HAND_OPTIONS.find((o) => o.table === ch.table && o.row === ch.row);
  assert.ok(hand, 'a hand option maps to the changed chart row');
  app.selectHand(hand.key);
  app.selectDealer(ch.dealer);
  assert.ok(!/Changed for your new rules/.test(doc.els['table-result'].innerHTML));
  app.setRules(to);
  assert.match(doc.els['table-result'].innerHTML, /<p class="sa-changed" data-changed>Changed for your new rules<\/p>/);
  // pick a cell that did not change
  const same = app.DEALER_CARDS.map((d) => ({ d, h: hand })).find((x) => !diff.some((e) => e.table === 'hard' && e.row === hand.row && e.dealer === x.d));
  if (same) {
    app.selectDealer(same.d);
    assert.ok(!/Changed for your new rules/.test(doc.els['table-result'].innerHTML));
  }
  // dismiss clears the result marker
  app.selectDealer(ch.dealer);
  assert.match(doc.els['table-result'].innerHTML, /Changed for your new rules/);
  app.dismissDiff();
  assert.ok(!/Changed for your new rules/.test(doc.els['table-result'].innerHTML));
  // renderResultHTML for a plain answer has no marker
  assert.ok(!/Changed for your new rules/.test(app.renderResultHTML(app.tableAnswer(start, hand.key, ch.dealer))));
});

test('print markup never carries markers or the count line', () => {
  const { app, doc } = loadPage();
  app.setRules({ ...start, decks: '1', surrender: 'none' });
  assert.ok(marked(doc) > 0);
  for (const id of ['print-full', 'print-pocket']) assert.ok(!/changed|chg/i.test(doc.els[id].innerHTML), id);
  assert.ok(!/changed|chg/i.test(app.renderPrintFullHTML(app.getRules())));
  assert.ok(!/changed|chg/i.test(app.renderPocketHTML(app.getRules())));
  // the count line and the cue live inside .shell, which print hides
  assert.match(html, /<main class="shell">[\s\S]*id="diff-note"[\s\S]*<\/main>/);
});

test('scrollCue: true only while columns are hidden on the right', () => {
  const { app } = loadPage();
  assert.equal(app.scrollCue(0, 342, 720), true);
  assert.equal(app.scrollCue(100, 342, 720), true);
  assert.equal(app.scrollCue(376, 342, 720), true);
  assert.equal(app.scrollCue(378, 342, 720), false);   // at the end
  assert.equal(app.scrollCue(377.5, 342, 720), false); // sub-pixel rounding tolerated
  assert.equal(app.scrollCue(0, 804, 804), false);     // 1280: no overflow
});

test('updateScrollCues toggles has-more on each section from stubbed sizes', () => {
  const secs = [], boxes = [];
  const sizes = [[0, 342, 720], [378, 342, 720], [0, 804, 804]];
  sizes.forEach((s) => {
    const sec = { on: null, classList: { toggle(c, v) { assert.equal(c, 'has-more'); sec.on = v; } } };
    secs.push(sec);
    boxes.push({ scrollLeft: s[0], clientWidth: s[1], scrollWidth: s[2], closest: (sel) => (sel === '.chart-section' ? sec : null) });
  });
  const { app } = loadPage('', (el) => { el('chart').querySelectorAll = (sel) => (sel === '.scroll' ? boxes : []); });
  secs.forEach((s) => { s.on = null; });
  app.updateScrollCues();
  assert.deepEqual(secs.map((s) => s.on), [true, false, false]);
  boxes[1].scrollLeft = 0;
  app.updateScrollCues();
  assert.equal(secs[1].on, true);
});

test('markup and CSS: hint text, fade is click-through and small-screen only, link >= 44px', () => {
  const { app } = loadPage();
  const chart = app.renderChartHTML(app.buildChart(start));
  assert.equal((chart.match(/data-swipe-hint>Swipe for dealer 6–A<\/p>/g) || []).length, 3);
  assert.equal((chart.match(/<div class="scroll-wrap">/g) || []).length, 3);
  const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  const small = css.slice(css.indexOf('@media (max-width: 600px)'));
  assert.match(small, /\.chart-section\.has-more \.swipe-hint \{ display: block; \}/);
  const fade = small.match(/\.has-more \.scroll-wrap::after \{([^}]*)\}/)[1];
  assert.match(fade, /pointer-events: none/);
  assert.match(fade, /right: 1px/);
  assert.match(css, /\.swipe-hint \{ display: none;/); // hidden by default (1280)
  assert.match(css, /\.sa-link \{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*min-height: 44px;/);
  // fade sits over the scroll box on the right; the pinned column is on the left
  assert.match(css, /\.chart tbody th \{\s*position: sticky; left: 0;/);
  assert.ok(!/@media print[\s\S]{0,200}has-more/.test(css));
  assert.match(html, /dom\.chart\.addEventListener\('scroll', updateScrollCues, true\)/);
});
