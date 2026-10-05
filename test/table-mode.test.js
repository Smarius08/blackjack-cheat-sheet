// Table mode tests (story S-18). node:vm with a tiny stub document, no DOM library.
// Every hand option x 10 dealer cards x 36 rule sets must equal the snapshot cell.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'prototype', 'index.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));
const DEALERS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const WORDS = { HIT: 'Hit', STAND: 'Stand', DOUBLE: 'Double', SPLIT: 'Split', SURRENDER: 'Surrender' };

function makeDoc() {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', hidden: false, attrs: {}, handlers: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(t, fn) { this.handlers[t] = fn; },
    querySelectorAll() { return []; } });
  return { els, getElementById: el };
}

function loadPage() {
  const doc = makeDoc();
  const ctx = vm.createContext({ document: doc });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) vm.runInContext(m[2], ctx, { filename: m[1] });
  return { app: ctx.ChipyCheatSheet, doc };
}

// Expected hand -> [snapshot table, row label]
function expectedRow(opt) {
  if (opt.table === 'hard') {
    const n = Number(opt.text);
    return ['hard', n <= 7 ? '5-7' : n >= 18 ? '18-21' : String(n)];
  }
  if (opt.table === 'soft') return ['soft', String(Number(opt.text.slice(2)) + 11)];
  return ['pairs', opt.text];
}

const button = (key, val) => ({ getAttribute: (n) => (n === 'data-act' ? key : val) });

test('hand options: Hard 5-21, soft A,2-A,9, pairs 2,2-A,A; labels as picked', () => {
  const { app } = loadPage();
  const o = app.HAND_OPTIONS;
  assert.equal(o.length, 17 + 8 + 10);
  assert.deepEqual([...o.filter((x) => x.table === 'hard').map((x) => x.label)], Array.from({ length: 17 }, (_, i) => 'Hard ' + (i + 5)));
  assert.deepEqual([...o.filter((x) => x.table === 'soft').map((x) => x.label)], ['A,2', 'A,3', 'A,4', 'A,5', 'A,6', 'A,7', 'A,8', 'A,9']);
  assert.deepEqual([...o.filter((x) => x.table === 'pairs').map((x) => x.label)],
    ['2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '9,9', '10,10', 'A,A']);
  assert.deepEqual([...app.DEALER_CARDS], DEALERS);
});

test('tableAnswer equals the snapshot cell: all hands x 10 dealers x 36 rule sets', () => {
  const { app } = loadPage();
  assert.equal(snapshot.charts.length, 36);
  let n = 0;
  for (const snap of snapshot.charts) {
    for (const opt of app.HAND_OPTIONS) {
      const [tbl, rowLabel] = expectedRow(opt);
      const row = snap.tables[tbl].find((r) => r.label === rowLabel);
      assert.ok(row, snap.id + ' row ' + rowLabel);
      DEALERS.forEach((d, j) => {
        const a = app.tableAnswer(snap.rules, opt.key, d);
        const want = row.cells[j];
        assert.equal(a.move, want.move, snap.id + ' ' + opt.label + ' vs ' + d);
        assert.equal(a.note, want.note, snap.id + ' ' + opt.label + ' vs ' + d + ' note');
        assert.equal(a.rowLabel, rowLabel);
        assert.equal(a.table, tbl);
        n++;
      });
    }
  }
  assert.equal(n, 36 * 35 * 10);
});

test('tableAnswer: Hard 7 -> row 5-7, Hard 19 -> row 18-21; bad input -> null', () => {
  const { app } = loadPage();
  const r = app.DEFAULT_RULES;
  assert.equal(app.tableAnswer(r, 'hard:7', '10').rowLabel, '5-7');
  assert.equal(app.tableAnswer(r, 'hard:19', '10').rowLabel, '18-21');
  assert.equal(app.tableAnswer(r, 'soft:A,7', 'A').rowLabel, '18');
  assert.equal(app.tableAnswer(r, 'hard:4', '10'), null);
  assert.equal(app.tableAnswer(r, 'hard:7', '1'), null);
  assert.equal(app.tableAnswer({ decks: '3' }, 'hard:7', '10'), null);
  assert.equal(app.tableAnswer(r, null, '10'), null);
});

test('loads in Full chart; chart markup untouched; table mode hidden', () => {
  const { app, doc } = loadPage();
  assert.deepEqual({ ...app.getSelection() }, { mode: 'full', hand: null, dealer: null, rulesOpen: false });
  assert.equal(doc.els['full-view'].hidden, false);
  assert.equal(doc.els['table-mode'].hidden, true);
  assert.equal(doc.els.chart.innerHTML, app.renderChartHTML(app.buildChart(app.DEFAULT_RULES)));
  assert.match(doc.els['mode-switch'].innerHTML, /data-val="full" aria-pressed="true">Full chart/);
  assert.match(doc.els['mode-switch'].innerHTML, /data-val="table" aria-pressed="false">Table mode/);
});

test('two taps: switch, hand, dealer -> result card with all parts', () => {
  const { app, doc } = loadPage();
  const click = (key, val) => doc.els['mode-switch'].handlers.click({ target: button(key, val) });
  const pickClick = (key, val) => doc.els['table-pick'].handlers.click({ target: button(key, val) });
  click('mode', 'table');
  assert.equal(doc.els['table-mode'].hidden, false);
  assert.equal(doc.els['full-view'].hidden, true);
  const pick = doc.els['table-pick'].innerHTML;
  assert.equal([...pick.matchAll(/data-act="hand"/g)].length, 35);
  assert.ok(!pick.includes('data-act="dealer"'), 'dealer step after hand');
  assert.match(doc.els['table-result'].innerHTML, /Pick your hand/);
  pickClick('hand', 'hard:16');
  assert.equal([...doc.els['table-pick'].innerHTML.matchAll(/data-act="dealer"/g)].length, 10);
  assert.match(doc.els['table-pick'].innerHTML, /data-val="hard:16" aria-label="Hard 16" aria-pressed="true"/);
  assert.ok(!doc.els['table-result'].innerHTML.includes('data-result'));
  pickClick('dealer', '10');
  const card = doc.els['table-result'].innerHTML;
  const want = snapshot.charts.find((c) => c.id === 'decks=4-8|soft17=hits|das=yes|surrender=any')
    .tables.hard.find((r) => r.label === '16').cells[8];
  assert.match(card, />Hard 16</);
  assert.match(card, />Dealer shows 10</);
  assert.match(card, new RegExp('data-move="' + want.move + '"'));
  assert.match(card, new RegExp('mi mi-' + WORDS[want.move].toLowerCase() + '"'));
  assert.match(card, new RegExp('<span class="sa-rec-word">' + WORDS[want.move] + '</span>'));
  assert.equal(card.includes('data-note'), want.note !== null);
  if (want.note !== null) assert.ok(card.includes(want.note.replace(/&/g, '&amp;')));
  assert.match(card, /<a class="sa-link" href="https:\/\/chipy\.com\/tools\/blackjack-calculator">See every move's value in the Hand Strategy Calculator<\/a>/);
  const text = card.replace(/<[^>]*>/g, ' ');
  assert.ok(!/\bEV\b|expected value|optimal|%|\d\.\d/i.test(text), 'no EV / optimal wording');
  assert.ok(!/card-slot|<img/.test(card), 'no card picking');
  assert.equal(app.getSelection().dealer, '10');
});

test('note is its own element only when the cell has one', () => {
  const { app } = loadPage();
  let withNote = 0, without = 0;
  for (const snap of snapshot.charts) {
    for (const opt of app.HAND_OPTIONS) {
      for (const d of DEALERS) {
        const a = app.tableAnswer(snap.rules, opt.key, d);
        const card = app.renderResultHTML(a);
        if (a.note === null) { without++; assert.ok(!card.includes('sa-rec-note')); }
        else { withNote++; assert.equal([...card.matchAll(/data-note/g)].length, 1); }
      }
    }
  }
  assert.ok(withNote > 0 && without > 0);
});

test('rules change re-renders the shown answer: setRules and control events, all 36', () => {
  const { app, doc } = loadPage();
  app.selectHand('soft:A,7');
  app.selectDealer('9');
  const change = doc.els['rule-panel'].handlers.change;
  assert.equal(typeof change, 'function');
  for (const snap of snapshot.charts) {
    app.setRules(snap.rules);
    const want = snap.tables.soft.find((r) => r.label === '18').cells[7];
    const card = doc.els['table-result'].innerHTML;
    assert.match(card, new RegExp('data-move="' + want.move + '"'), snap.id);
    assert.equal(card.includes('data-note'), want.note !== null, snap.id);
  }
  const first = snapshot.charts[0];
  for (const f of ['decks', 'soft17', 'das', 'surrender']) change({ target: { type: 'radio', name: 'rule-' + f, value: first.rules[f] } });
  const want = first.tables.soft.find((r) => r.label === '18').cells[7];
  assert.match(doc.els['table-result'].innerHTML, new RegExp('data-move="' + want.move + '"'));
});

test('invalid taps change nothing; switching back to Full chart shows the chart', () => {
  const { app, doc } = loadPage();
  assert.equal(app.selectDealer('5'), false);
  assert.equal(app.selectHand('hard:3'), false);
  assert.equal(app.setMode('x'), false);
  app.setMode('table');
  app.setMode('full');
  assert.equal(doc.els['full-view'].hidden, false);
  assert.equal(doc.els['table-mode'].hidden, true);
  assert.equal(doc.els.chart.innerHTML, app.renderChartHTML(app.buildChart(app.getRules())));
});

test('Table mode collapses the rule panel; Change rules toggles it, rules unchanged', () => {
  const { app, doc } = loadPage();
  const panel = doc.els['rule-panel'], toggle = doc.els['rules-toggle'];
  assert.equal(panel.hidden, false);
  assert.equal(toggle.hidden, true);
  const radiosBefore = panel.innerHTML;
  app.setRules({ decks: '2', soft17: 'stands', das: 'no', surrender: 'none' });
  const rules = { ...app.getRules() };
  app.setMode('table');
  assert.equal(panel.hidden, true);
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  assert.equal(toggle.textContent, 'Change rules');
  assert.ok(panel.innerHTML.includes('type="radio"'), 'controls stay in the DOM');
  assert.ok(doc.els['rules-text'].textContent.length > 0);
  toggle.handlers.click({});
  assert.equal(panel.hidden, false);
  assert.equal(toggle.attrs['aria-expanded'], 'true');
  toggle.handlers.click({});
  assert.equal(panel.hidden, true);
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  assert.deepEqual({ ...app.getRules() }, rules);
  app.setMode('full');
  assert.equal(panel.hidden, false);
  assert.equal(toggle.hidden, true);
  assert.ok(radiosBefore.length > 0);
});

test('scrollIntoView: dealer step after a hand tap, result after a dealer tap', () => {
  const { app, doc } = loadPage();
  const calls = [];
  for (const id of ['tm-dealer', 'table-result']) doc.els[id] = { id, scrollIntoView: (o) => calls.push([id, o]) };
  app.setMode('table');
  app.selectHand('hard:16');
  assert.deepEqual(calls.map((c) => c[0]), ['tm-dealer']);
  assert.equal(calls[0][1].block, 'start');
  assert.equal(calls[0][1].behavior, 'smooth');
  app.selectDealer('10');
  assert.deepEqual(calls.map((c) => c[0]), ['tm-dealer', 'table-result']);
  // no scrollIntoView on the element: no throw
  const { app: a2 } = loadPage();
  a2.setMode('table');
  assert.equal(a2.selectHand('hard:16'), true);
});
