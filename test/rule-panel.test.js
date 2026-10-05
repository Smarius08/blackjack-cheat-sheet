// Rule panel tests (story S-08). node:vm with a tiny stub document, no DOM library.
// All 36 combos: setRules AND simulated control change events must render the
// snapshot chart (move + icon class per cell) and the snapshot label as sentence.

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
const CLS = { HIT: 'hit', STAND: 'stand', DOUBLE: 'double', SPLIT: 'split', SURRENDER: 'surrender' };

function scripts() {
  return [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1], body: m[2] }));
}

function makeDoc() {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', handlers: {}, all: [],
    addEventListener(t, fn) { this.handlers[t] = (e) => this.all.forEach((f) => f(e)); this.all.push(fn); },
    querySelectorAll() {
      if (this._radios && this._src === this.innerHTML) return this._radios;
      this._src = this.innerHTML;
      this._radios = [...this.innerHTML.matchAll(/<input type="radio" name="([^"]+)" value="([^"]*)"/g)]
        .map((m) => ({ type: 'radio', name: m[1], value: m[2], checked: false }));
      return this._radios;
    } });
  return { els, getElementById: el };
}

function loadPage() {
  const doc = makeDoc();
  const ctx = vm.createContext({ document: doc });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const s of scripts()) vm.runInContext(s.body, ctx, { filename: s.attrs });
  return { app: ctx.ChipyCheatSheet, doc };
}

// Parse cells of the rendered chart: [{ table, row, move, cls, icon }]
function cellsOf(chartHTML) {
  const out = {};
  for (const key of ['hard', 'soft', 'pairs']) {
    const tbl = chartHTML.match(new RegExp('<table class="chart" data-table="' + key + '">([\\s\\S]*?)</table>'))[1];
    out[key] = [...tbl.matchAll(/<tr data-row="([^"]*)">([\s\S]*?)<\/tr>/g)].map((r) => ({
      label: r[1],
      cells: [...r[2].matchAll(/<td class="m-(\w+)" data-move="(\w+)"><span class="cell"><span class="mi mi-(\w+)"/g)]
        .map((c) => ({ cls: c[1], move: c[2], icon: c[3] })),
    }));
  }
  return out;
}

function assertMatchesSnapshot(doc, snap) {
  const got = cellsOf(doc.els.chart.innerHTML);
  for (const key of ['hard', 'soft', 'pairs']) {
    assert.equal(got[key].length, snap.tables[key].length);
    got[key].forEach((row, i) => {
      assert.equal(row.label, snap.tables[key][i].label);
      assert.equal(row.cells.length, 10);
      row.cells.forEach((c, j) => {
        const move = snap.tables[key][i].cells[j].move;
        assert.equal(c.move, move, snap.id + ' ' + key + ' ' + row.label + ' col ' + j);
        assert.equal(c.cls, CLS[move]);
        assert.equal(c.icon, CLS[move]);
      });
    });
  }
  assert.equal(doc.els['rules-text'].textContent, snap.label);
}

function checkedValues(doc) {
  const out = {};
  for (const r of doc.els['rule-panel'].querySelectorAll()) if (r.checked) out[r.name.replace('rule-', '')] = r.value;
  return out;
}

test('controls: four groups, right options and order, defaults on load, no double-down control', () => {
  const { app, doc } = loadPage();
  const panel = doc.els['rule-panel'].innerHTML;
  const groups = [...panel.matchAll(/<legend>([^<]*)<\/legend>([\s\S]*?)<\/fieldset>/g)];
  assert.deepEqual(groups.map((g) => g[1]), ['Decks', 'Dealer on soft 17', 'Double after split', 'Surrender']);
  const texts = groups.map((g) => [...g[2].matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]));
  assert.deepEqual(texts, [['1', '2', '4–8'], ['Stands', 'Hits'], ['Yes', 'No'], ['Not allowed', 'Any dealer card', 'Except ace']]);
  assert.equal([...panel.matchAll(/type="radio"/g)].length, 10);
  assert.ok(!/double down/i.test(panel));
  assert.deepEqual({ ...app.getRules() }, { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' });
  assert.deepEqual(checkedValues(doc), { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' });
  assertMatchesSnapshot(doc, snapshot.charts.find((c) => c.id === 'decks=4-8|soft17=hits|das=yes|surrender=any'));
});

test('all 36 combos via setRules: chart, sentence, controls, hook once', () => {
  const { app, doc } = loadPage();
  let fired = [];
  app.onRulesChange((r) => fired.push(r));
  assert.equal(snapshot.charts.length, 36);
  for (const snap of snapshot.charts) {
    fired = [];
    assert.equal(app.setRules(snap.rules), true);
    assertMatchesSnapshot(doc, snap);
    assert.deepEqual({ ...app.getRules() }, snap.rules);
    assert.deepEqual(checkedValues(doc), snap.rules);
    assert.equal(fired.length, 1);
    assert.deepEqual({ ...fired[0] }, snap.rules);
    assert.equal(app.rulesSentence(snap.rules), snap.label);
    assert.deepEqual({ ...app.rulesFromControls(snap.rules) }, snap.rules);
  }
});

test('all 36 combos via simulated control change events', () => {
  const { app, doc } = loadPage();
  let count = 0;
  app.onRulesChange(() => count++);
  const change = doc.els['rule-panel'].handlers.change;
  assert.equal(typeof change, 'function');
  for (const snap of snapshot.charts) {
    for (const f of FIELDS) change({ target: { type: 'radio', name: 'rule-' + f, value: snap.rules[f] } });
    assertMatchesSnapshot(doc, snap);
    assert.deepEqual({ ...app.getRules() }, snap.rules);
    assert.deepEqual(checkedValues(doc), snap.rules);
  }
  assert.ok(count >= 36);
  // an unknown control value leaves everything as it was and fires nothing
  const before = count, last = snapshot.charts[35];
  change({ target: { type: 'radio', name: 'rule-decks', value: '9' } });
  change({ target: { type: 'radio', name: 'rule-bogus', value: '1' } });
  assert.equal(count, before);
  assert.deepEqual({ ...app.getRules() }, last.rules);
  assert.deepEqual(checkedValues(doc), last.rules);
});

test('invalid rules are rejected: nothing changes, hook silent', () => {
  const { app, doc } = loadPage();
  const start = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };
  let fired = 0;
  app.onRulesChange(() => fired++);
  const chartBefore = doc.els.chart.innerHTML;
  const textBefore = doc.els['rules-text'].textContent;
  const bad = [
    { ...start, decks: '3' }, { ...start, soft17: 'maybe' }, { ...start, das: true }, { ...start, surrender: 'late' },
    { decks: '1', soft17: 'hits', das: 'yes' }, {}, null, undefined, 'x', 42, [], ['1', 'hits', 'yes', 'any'],
    { ...start, decks: 1 }, { ...start, decks: '__proto__' }, { ...start, surrender: 'toString' },
  ];
  for (const b of bad) {
    assert.equal(app.setRules(b), false);
    assert.deepEqual({ ...app.getRules() }, start);
    assert.equal(doc.els.chart.innerHTML, chartBefore);
    assert.equal(doc.els['rules-text'].textContent, textBefore);
    assert.deepEqual(checkedValues(doc), start);
  }
  assert.equal(fired, 0);
  assert.equal(app.rulesFromControls({ decks: '1' }), null);
  assert.equal(app.rulesFromControls(null), null);
  // getRules returns a copy
  app.getRules().decks = '1';
  assert.equal(app.getRules().decks, '4-8');
});

test('inherited keys are rejected (own properties required); extra keys ignored', () => {
  const { app } = loadPage();
  const inherited = Object.assign(Object.create({ decks: '1' }), { soft17: 'hits', das: 'yes', surrender: 'any' });
  let fired = 0;
  app.onRulesChange(() => fired++);
  assert.equal(app.setRules(inherited), false);
  assert.equal(app.rulesFromControls(inherited), null);
  assert.equal(app.getRules().decks, '4-8');
  assert.equal(fired, 0);
  assert.equal(app.setRules({ decks: '1', soft17: 'hits', das: 'yes', surrender: 'any', extra: 1 }), true);
  assert.deepEqual(Object.keys(app.getRules()), ['decks', 'soft17', 'das', 'surrender']);
});

test('init() twice adds no second listener: one hook call per control change', () => {
  const { app, doc } = loadPage();
  app.init();
  let fired = 0;
  app.onRulesChange(() => fired++);
  doc.els['rule-panel'].handlers.change({ target: { type: 'radio', name: 'rule-decks', value: '2' } });
  assert.equal(fired, 1);
  assert.equal(app.getRules().decks, '2');
});

test('setRules with identical rules returns true and fires nothing', () => {
  const { app } = loadPage();
  let fired = 0;
  app.onRulesChange(() => fired++);
  assert.equal(app.setRules({ ...app.getRules() }), true);
  assert.equal(fired, 0);
  assert.equal(app.setRules({ decks: '1', soft17: 'hits', das: 'yes', surrender: 'any' }), true);
  assert.equal(fired, 1);
});
