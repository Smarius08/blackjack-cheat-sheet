// Chart resolution tests (story S-03).
//
// engine/chart.js turns the 4 player rules into Hard / Soft / Pairs tables by
// calling the vendored resolveCode(). These tests pin the row layout (D-020),
// the cell shape (D-022), single-rule flips, and all 36 rule combinations.
// They do not restate strategy: expected codes are read from the vendored
// STRATEGY_TABLE wherever a whole table is compared.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ENGINE_DIR = path.join(__dirname, '..', 'engine');
const { buildChart } = require(path.join(ENGINE_DIR, 'chart.js'));
const { STRATEGY_TABLE } = require(path.join(ENGINE_DIR, 'vendor', 'strategy_table.js'));

const COLUMNS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const HARD_LABELS = ['5-7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18-21'];
const SOFT_LABELS = ['13', '14', '15', '16', '17', '18', '19', '20'];
const PAIR_LABELS = ['2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '9,9', '10,10', 'A,A'];
const MOVES = ['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER'];

const BASE = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };
const rules = (over) => Object.assign({}, BASE, over);

function cell(chart, table, label, dealer) {
  const row = chart[table].find((r) => r.label === label);
  assert.ok(row, `row ${table} ${label} exists`);
  return row.cells[COLUMNS.indexOf(dealer)];
}

function allCombos() {
  const out = [];
  for (const decks of ['1', '2', '4-8'])
    for (const soft17 of ['stands', 'hits'])
      for (const das of ['yes', 'no'])
        for (const surrender of ['none', 'any', 'except_ace'])
          out.push({ decks, soft17, das, surrender });
  return out;
}

// ---- AC 1: shape -----------------------------------------------------------

test('buildChart returns columns 2..A and the fixed row labels in D-020 order', () => {
  const chart = buildChart(BASE);
  assert.deepEqual(chart.columns, COLUMNS);
  assert.deepEqual(chart.hard.map((r) => r.label), HARD_LABELS);
  assert.deepEqual(chart.soft.map((r) => r.label), SOFT_LABELS);
  assert.deepEqual(chart.pairs.map((r) => r.label), PAIR_LABELS);
});

test('each cell is exactly { move, code, note }', () => {
  const chart = buildChart(BASE);
  for (const table of ['hard', 'soft', 'pairs']) {
    for (const row of chart[table]) {
      assert.equal(row.cells.length, 10);
      for (const c of row.cells) {
        assert.deepEqual(Object.keys(c).sort(), ['code', 'move', 'note']);
        assert.ok(MOVES.includes(c.move), `${table} ${row.label}: ${c.move}`);
        assert.equal(typeof c.code, 'string');
        assert.ok(c.note === null || typeof c.note === 'string');
      }
    }
  }
});

test('Double/Multi read engine "5-8" for Hard 5-7 and 8; Single reads its own "5-7" and "8"', () => {
  for (const [decks, group] of [['2', 'Double'], ['4-8', 'Multi']]) {
    const chart = buildChart(rules({ decks, soft17: 'stands' }));
    const want = STRATEGY_TABLE[group].S17.Hard['5-8'];
    assert.deepEqual(chart.hard[0].cells.map((c) => c.code), want);
    assert.deepEqual(chart.hard[1].cells.map((c) => c.code), want);
  }
  const single = buildChart(rules({ decks: '1', soft17: 'stands' }));
  assert.deepEqual(single.hard[0].cells.map((c) => c.code), STRATEGY_TABLE.Single.S17.Hard['5-7']);
  assert.deepEqual(single.hard[1].cells.map((c) => c.code), STRATEGY_TABLE.Single.S17.Hard['8']);
});

test('unknown or missing rule values throw', () => {
  assert.throws(() => buildChart(), TypeError);
  assert.throws(() => buildChart(null), TypeError);
  assert.throws(() => buildChart(rules({ decks: '6' })), RangeError);
  assert.throws(() => buildChart(rules({ soft17: 'H17' })), RangeError);
  assert.throws(() => buildChart(rules({ das: true })), RangeError);
  assert.throws(() => buildChart(rules({ surrender: 'late' })), RangeError);
  assert.throws(() => buildChart({ decks: '1', soft17: 'hits', das: 'yes' }), RangeError);
});

// ---- AC 2: total passed to resolveCode -------------------------------------

test('Single Pair 4,4 vs 5 ("Pd") resolves to DOUBLE without DAS: total 8 reaches resolveCode', () => {
  // "Pd" + das no -> DOUBLE when doubleRestriction 0 allows the total.
  const c = cell(buildChart(rules({ decks: '1', das: 'no' })), 'pairs', '4,4', '5');
  assert.equal(c.code, 'Pd');
  assert.equal(c.move, 'DOUBLE');
  assert.equal(typeof c.note, 'string');
  assert.equal(cell(buildChart(rules({ decks: '1', das: 'yes' })), 'pairs', '4,4', '5').move, 'SPLIT');
});

// ---- AC 3: one-rule flips ---------------------------------------------------

test('Hard 16 vs 10 ("Rh", Multi): SURRENDER with surrender any, HIT with none', () => {
  const on = cell(buildChart(rules({ surrender: 'any' })), 'hard', '16', '10');
  const off = cell(buildChart(rules({ surrender: 'none' })), 'hard', '16', '10');
  assert.equal(on.code, 'Rh');
  assert.equal(on.move, 'SURRENDER');
  assert.equal(on.note, null);
  assert.equal(off.code, 'Rh');
  assert.equal(off.move, 'HIT');
  assert.equal(typeof off.note, 'string');
});

test('Hard 16 vs A ("Rh", Multi): except_ace blocks surrender against the ace only', () => {
  const chart = buildChart(rules({ surrender: 'except_ace' }));
  assert.equal(cell(chart, 'hard', '16', 'A').move, 'HIT');
  assert.equal(cell(chart, 'hard', '16', '10').move, 'SURRENDER');
});

test('Pair 8,8 vs A ("Rp", Multi H17): SURRENDER only when surrender allowed and DAS off', () => {
  const sur = cell(buildChart(rules({ surrender: 'any', das: 'no' })), 'pairs', '8,8', 'A');
  assert.equal(sur.code, 'Rp');
  assert.equal(sur.move, 'SURRENDER');
  assert.equal(cell(buildChart(rules({ surrender: 'any', das: 'yes' })), 'pairs', '8,8', 'A').move, 'SPLIT');
  assert.equal(cell(buildChart(rules({ surrender: 'none', das: 'no' })), 'pairs', '8,8', 'A').move, 'SPLIT');
  const s17 = cell(buildChart(rules({ soft17: 'stands', surrender: 'any', das: 'no' })), 'pairs', '8,8', 'A');
  assert.equal(s17.code, 'P');
  assert.equal(s17.move, 'SPLIT');
});

test('Pair 2,2 vs 2 ("Ph", Multi): SPLIT with DAS yes, HIT + note with DAS no', () => {
  const yes = cell(buildChart(rules({ das: 'yes' })), 'pairs', '2,2', '2');
  const no = cell(buildChart(rules({ das: 'no' })), 'pairs', '2,2', '2');
  assert.equal(yes.code, 'Ph');
  assert.equal(yes.move, 'SPLIT');
  assert.equal(yes.note, null);
  assert.equal(no.code, 'Ph');
  assert.equal(no.move, 'HIT');
  assert.equal(typeof no.note, 'string');
  assert.ok(no.note.length > 0);
});

test('decks pick a different table: Hard 8 vs 5 is DOUBLE in Single, HIT in Multi', () => {
  const single = cell(buildChart(rules({ decks: '1' })), 'hard', '8', '5');
  const multi = cell(buildChart(rules({ decks: '4-8' })), 'hard', '8', '5');
  assert.equal(single.code, 'Dh');
  assert.equal(single.move, 'DOUBLE');
  assert.equal(multi.code, 'H');
  assert.equal(multi.move, 'HIT');
});

test('soft 17 picks a different table: Multi Hard 17 vs A is "Rs" with hits, "S" with stands', () => {
  const h17 = cell(buildChart(rules({ soft17: 'hits' })), 'hard', '17', 'A');
  const s17 = cell(buildChart(rules({ soft17: 'stands' })), 'hard', '17', 'A');
  assert.equal(h17.code, 'Rs');
  assert.equal(h17.move, 'SURRENDER');
  assert.equal(s17.code, 'S');
  assert.equal(s17.move, 'STAND');
});

test('every table equals the vendored STRATEGY_TABLE codes for its deck group and soft-17 rule', () => {
  const group = { '1': 'Single', '2': 'Double', '4-8': 'Multi' };
  const dealer = { stands: 'S17', hits: 'H17' };
  for (const r of allCombos()) {
    const chart = buildChart(r);
    const t = STRATEGY_TABLE[group[r.decks]][dealer[r.soft17]];
    for (const row of chart.soft) assert.deepEqual(row.cells.map((c) => c.code), t.Soft[row.label]);
    for (const row of chart.pairs) {
      assert.deepEqual(row.cells.map((c) => c.code), t.Pair[row.label.split(',')[0]]);
    }
    for (const row of chart.hard.slice(2)) assert.deepEqual(row.cells.map((c) => c.code), t.Hard[row.label]);
  }
});

// ---- AC 4: all 36 combinations ---------------------------------------------

test('all 36 rule combinations: no UNAVAILABLE, no missing cell, same rows in same order', () => {
  const combos = allCombos();
  assert.equal(combos.length, 36);
  for (const r of combos) {
    const id = JSON.stringify(r);
    const chart = buildChart(r);
    assert.deepEqual(chart.columns, COLUMNS, id);
    assert.deepEqual(chart.hard.map((x) => x.label), HARD_LABELS, id);
    assert.deepEqual(chart.soft.map((x) => x.label), SOFT_LABELS, id);
    assert.deepEqual(chart.pairs.map((x) => x.label), PAIR_LABELS, id);
    for (const table of ['hard', 'soft', 'pairs']) {
      for (const row of chart[table]) {
        assert.equal(row.cells.length, 10, `${id} ${table} ${row.label}`);
        row.cells.forEach((c, i) => {
          assert.ok(c, `${id} ${table} ${row.label} vs ${COLUMNS[i]} missing`);
          assert.notEqual(c.move, 'UNAVAILABLE', `${id} ${table} ${row.label} vs ${COLUMNS[i]}`);
          assert.ok(MOVES.includes(c.move), `${id} ${table} ${row.label} vs ${COLUMNS[i]}: ${c.move}`);
        });
      }
    }
  }
});

test('buildChart is pure: same rules give equal output, input is not changed', () => {
  const r = rules({});
  const frozen = JSON.stringify(r);
  assert.deepEqual(buildChart(r), buildChart(r));
  assert.equal(JSON.stringify(r), frozen);
});

// ---- D-035: exported constants cannot corrupt the engine ----------------------

const chartModule = require(path.join(ENGINE_DIR, 'chart.js'));

// Run a mutation; in strict mode a frozen target throws TypeError. Either a
// throw or a silent no-op is fine; what matters is later buildChart() output.
function attempt(fn) {
  try { fn(); } catch (e) { assert.ok(e instanceof TypeError, String(e)); }
}

function allCharts() {
  return allCombos().map((r) => buildChart(r));
}

test('exported COLUMNS and RULE_VALUES (and its inner arrays) are frozen', () => {
  const { COLUMNS: C, RULE_VALUES: RV } = chartModule;
  assert.ok(Object.isFrozen(C));
  assert.deepEqual(C, COLUMNS);
  assert.ok(Object.isFrozen(RV));
  assert.deepEqual(Object.keys(RV), ['decks', 'soft17', 'das', 'surrender']);
  for (const name of Object.keys(RV)) assert.ok(Object.isFrozen(RV[name]), name);
});

test('mutating exported COLUMNS / RULE_VALUES does not change later buildChart() output', () => {
  const before = allCharts();
  const { COLUMNS: C, RULE_VALUES: RV } = chartModule;
  attempt(() => C.sort().reverse());
  attempt(() => { C[0] = 'X'; });
  attempt(() => C.push('11'));
  attempt(() => { C.length = 0; });
  attempt(() => RV.decks.push('6'));
  attempt(() => { RV.decks[0] = '8'; });
  attempt(() => RV.surrender.sort());
  attempt(() => { RV.soft17.length = 0; });
  attempt(() => { RV.das = ['maybe']; });
  attempt(() => { delete RV.surrender; });
  attempt(() => { RV.extra = ['x']; });
  assert.deepEqual(C, COLUMNS);
  assert.deepEqual(RV.decks, ['1', '2', '4-8']);
  assert.deepStrictEqual(allCharts(), before);
  assert.throws(() => buildChart(rules({ decks: '6' })), RangeError);
});

test('mutating a returned chart.columns does not affect the next buildChart()', () => {
  const before = buildChart(BASE);
  const first = buildChart(BASE);
  first.columns.reverse();
  first.columns[0] = 'X';
  first.columns.push('11');
  assert.deepStrictEqual(buildChart(BASE), before);
});

// ---- AC 5: module format ---------------------------------------------------

test('loads in a browser-like context after strategy_table.js and attaches ChipyEngine.chart', () => {
  const window = {};
  window.window = window;
  const ctx = vm.createContext(window);
  for (const file of [path.join(ENGINE_DIR, 'vendor', 'strategy_table.js'), path.join(ENGINE_DIR, 'chart.js')]) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  const ns = vm.runInContext('ChipyEngine', ctx);
  assert.equal(typeof ns.chart.buildChart, 'function');
  const browserChart = JSON.parse(JSON.stringify(ns.chart.buildChart(BASE)));
  assert.deepEqual(browserChart, JSON.parse(JSON.stringify(buildChart(BASE))));
});

test('chart.js has no DOM use and no require other than the vendored strategy table', () => {
  const src = fs.readFileSync(path.join(ENGINE_DIR, 'chart.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /\bdocument\b|\bwindow\b|\bnavigator\b/);
  const requires = code.match(/require\(([^)]*)\)/g) || [];
  assert.deepEqual(requires, ["require('./vendor/strategy_table.js')"]);
});
