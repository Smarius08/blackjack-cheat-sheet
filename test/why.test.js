// Cell reason tests (story S-06).
//
// engine/why.js maps one chart.js cell (+ table, row label, dealer column) to
// the vendored getStrategyExplanation() inputs and returns its text unchanged
// (D-028), without the cell's note (D-030). These tests pin the input mapping
// (D-021, D-029), run every cell of all 36 charts, and check the module format.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ENGINE_DIR = path.join(__dirname, '..', 'engine');
const { buildChart, RULE_VALUES } = require(path.join(ENGINE_DIR, 'chart.js'));
const { reasonFor } = require(path.join(ENGINE_DIR, 'why.js'));
const { getStrategyExplanation } = require(path.join(ENGINE_DIR, 'vendor', 'explanation_writer.js'));

const BASE = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };
const rules = (over) => Object.assign({}, BASE, over);

function getCell(chart, table, label, dealer) {
  const row = chart[table].find((r) => r.label === label);
  assert.ok(row, `row ${table} ${label} exists`);
  return row.cells[chart.columns.indexOf(dealer)];
}

function allCombos() {
  const out = [];
  for (const decks of RULE_VALUES.decks)
    for (const soft17 of RULE_VALUES.soft17)
      for (const das of RULE_VALUES.das)
        for (const surrender of RULE_VALUES.surrender)
          out.push({ decks, soft17, das, surrender });
  return out;
}

// ---- AC 3: every cell of all 36 charts --------------------------------------

test('every cell of all 36 charts has a non-empty reason string', () => {
  const combos = allCombos();
  assert.equal(combos.length, 36);
  let count = 0;
  for (const r of combos) {
    const chart = buildChart(r);
    for (const table of ['hard', 'soft', 'pairs']) {
      for (const row of chart[table]) {
        row.cells.forEach((cell, i) => {
          const dealer = chart.columns[i];
          const text = reasonFor({ table, row: row.label, dealer, cell });
          assert.equal(typeof text, 'string', `${JSON.stringify(r)} ${table} ${row.label} vs ${dealer}`);
          assert.ok(text.length > 0, `${JSON.stringify(r)} ${table} ${row.label} vs ${dealer}`);
          count++;
        });
      }
    }
  }
  assert.equal(count, 36 * (12 + 8 + 10) * 10);
});

// ---- AC 1, 2, 4: hand-picked cells vs exact vendor string --------------------

// Each case: rules, table, row, dealer, expected move, expected writer inputs,
// and the expected opening words (hard-coded to catch input-mapping bugs).
const CASES = [
  {
    name: 'Hard 16 vs 10, surrender any -> SURRENDER',
    rules: {}, table: 'hard', row: '16', dealer: '10', move: 'SURRENDER',
    inputs: { total: 16, soft: false, pair: null },
    starts: 'This is a difficult hand against a strong dealer card. Surrendering limits',
  },
  {
    name: 'Hard 16 vs 10, surrender none -> HIT (quotes 16)',
    rules: { surrender: 'none' }, table: 'hard', row: '16', dealer: '10', move: 'HIT',
    inputs: { total: 16, soft: false, pair: null },
    starts: 'The dealer is showing a strong card, so standing on 16 is unlikely',
  },
  {
    name: 'Hard 12 vs 4 -> STAND (quotes 12)',
    rules: {}, table: 'hard', row: '12', dealer: '4', move: 'STAND',
    inputs: { total: 12, soft: false, pair: null },
    starts: 'The dealer is showing a weaker card and must keep drawing to at least 17. Standing avoids adding unnecessary bust risk to your 12.',
  },
  {
    name: 'Hard 18-21 vs 10 -> STAND, quotes the lowest total 18 (D-029)',
    rules: {}, table: 'hard', row: '18-21', dealer: '10', move: 'STAND',
    inputs: { total: 18, soft: false, pair: null },
    starts: 'Your 18 is already a strong made hand.',
  },
  {
    name: 'Hard 5-7 vs 5 -> HIT, total 5 (low-total wording)',
    rules: {}, table: 'hard', row: '5-7', dealer: '5', move: 'HIT',
    inputs: { total: 5, soft: false, pair: null },
    starts: 'Your total is too low to stand.',
  },
  {
    name: 'Hard 11 vs 6 -> DOUBLE',
    rules: {}, table: 'hard', row: '11', dealer: '6', move: 'DOUBLE',
    inputs: { total: 11, soft: false, pair: null },
    starts: 'This is a strong doubling opportunity.',
  },
  {
    name: 'Soft 18 vs 6 -> DOUBLE (soft wording)',
    rules: {}, table: 'soft', row: '18', dealer: '6', move: 'DOUBLE',
    inputs: { total: 18, soft: true, pair: null },
    starts: 'Your Ace gives this hand extra flexibility, making this a favorable spot to double',
  },
  {
    name: 'Soft 17 vs 7 -> HIT (soft wording)',
    rules: {}, table: 'soft', row: '17', dealer: '7', move: 'HIT',
    inputs: { total: 17, soft: true, pair: null },
    starts: 'Your Ace gives this hand extra flexibility because it can count as 1 or 11.',
  },
  {
    name: 'Soft 20 vs 10 -> STAND (quotes Soft 20)',
    rules: {}, table: 'soft', row: '20', dealer: '10', move: 'STAND',
    inputs: { total: 20, soft: true, pair: null },
    starts: 'Your Soft 20 is strong enough to stand',
  },
  {
    name: 'Pair A,A vs A -> SPLIT (soft 12, pair A)',
    rules: {}, table: 'pairs', row: 'A,A', dealer: 'A', move: 'SPLIT',
    inputs: { total: 12, soft: true, pair: 'A' },
    starts: 'Playing two Aces together gives you Soft 12.',
  },
  {
    name: 'Pair 8,8 vs 10 -> SPLIT (pair "8")',
    rules: {}, table: 'pairs', row: '8,8', dealer: '10', move: 'SPLIT',
    inputs: { total: 16, soft: false, pair: '8' },
    starts: 'A pair of 8s makes a difficult Hard 16.',
  },
  {
    name: 'Pair 10,10 vs 6 -> STAND (pair "10")',
    rules: {}, table: 'pairs', row: '10,10', dealer: '6', move: 'STAND',
    inputs: { total: 20, soft: false, pair: '10' },
    starts: 'You can split this pair, but 20 is already one of the strongest hands',
  },
];

for (const c of CASES) {
  test(`hand-picked: ${c.name}`, () => {
    const chart = buildChart(rules(c.rules));
    const cell = getCell(chart, c.table, c.row, c.dealer);
    assert.equal(cell.move, c.move, 'chart move');
    const want = getStrategyExplanation(Object.assign({ move: c.move, dealerRank: c.dealer }, c.inputs));
    const got = reasonFor({ table: c.table, row: c.row, dealer: c.dealer, cell });
    assert.equal(got, want);
    assert.ok(got.startsWith(c.starts), `starts with "${c.starts}": got "${got}"`);
  });
}

test('hand-picked cases cover all five moves, a Soft cell, a Pairs cell and A,A', () => {
  assert.deepEqual([...new Set(CASES.map((c) => c.move))].sort(), ['DOUBLE', 'HIT', 'SPLIT', 'STAND', 'SURRENDER']);
  assert.ok(CASES.some((c) => c.table === 'soft'));
  assert.ok(CASES.some((c) => c.table === 'pairs'));
  assert.ok(CASES.some((c) => c.row === 'A,A'));
  assert.ok(CASES.some((c) => c.row === '18-21'));
});

// A,A is SPLIT in all 36 charts and the vendor ignores `soft` for SPLIT, so the
// chart cells alone cannot prove A,A is passed as soft. Feed synthetic moves
// where the vendor wording depends on `soft`.
test('A,A is passed as soft 12 with pair A (synthetic STAND / HIT / DOUBLE cells)', () => {
  for (const move of ['STAND', 'HIT', 'DOUBLE']) {
    const got = reasonFor({ table: 'pairs', row: 'A,A', dealer: '6', cell: { move, code: 'S', note: null } });
    const asSoft = getStrategyExplanation({ move, total: 12, soft: true, pair: 'A', dealerRank: '6' });
    const asHard = getStrategyExplanation({ move, total: 12, soft: false, pair: 'A', dealerRank: '6' });
    assert.notEqual(asSoft, asHard, `${move}: vendor wording must depend on soft for this test to bite`);
    assert.equal(got, asSoft, move);
    assert.notEqual(got, asHard, move);
  }
});

// ---- AC 1: note is never added (D-030) ---------------------------------------

test('noted cell (Pair 2,2 vs 2, das no -> HIT): reason is vendor text only, no note', () => {
  const cell = getCell(buildChart(rules({ das: 'no' })), 'pairs', '2,2', '2');
  assert.equal(cell.move, 'HIT');
  assert.equal(typeof cell.note, 'string');
  assert.ok(cell.note.length > 0);
  const got = reasonFor({ table: 'pairs', row: '2,2', dealer: '2', cell });
  const want = getStrategyExplanation({ move: 'HIT', total: 4, soft: false, pair: '2', dealerRank: '2' });
  assert.equal(got, want);
  assert.ok(got.startsWith('You can split this pair, but this is one hand you can still build on'));
  assert.ok(!got.includes(cell.note));
});

test('reason depends only on the move: changing code or note does not change it', () => {
  const a = reasonFor({ table: 'hard', row: '16', dealer: '10', cell: { move: 'HIT', code: 'Rh', note: 'x' } });
  const b = reasonFor({ table: 'hard', row: '16', dealer: '10', cell: { move: 'HIT', code: 'H', note: null } });
  assert.equal(a, b);
});

// ---- validation ---------------------------------------------------------------

test('unknown table, row, dealer or move throws', () => {
  const cell = { move: 'HIT', code: 'H', note: null };
  assert.throws(() => reasonFor(), TypeError);
  assert.throws(() => reasonFor(null), TypeError);
  assert.throws(() => reasonFor({ table: 'pair', row: '8,8', dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '21', dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '5-8', dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'soft', row: '12', dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'pairs', row: '8', dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: 16, dealer: '2', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: '11', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: 'K', cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: 10, cell }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: '10' }), TypeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: '10', cell: { move: 'UNAVAILABLE' } }), RangeError);
  assert.throws(() => reasonFor({ table: 'hard', row: '16', dealer: '10', cell: { move: 'hit' } }), RangeError);
});

// ---- AC 5: module format ------------------------------------------------------

function browserContext(files) {
  const window = {};
  window.window = window;
  const ctx = vm.createContext(window);
  for (const file of files) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx;
}

test('loads in a browser-like context after explanation_writer.js and attaches ChipyEngine.why', () => {
  const ctx = browserContext([
    path.join(ENGINE_DIR, 'vendor', 'strategy_table.js'),
    path.join(ENGINE_DIR, 'chart.js'),
    path.join(ENGINE_DIR, 'vendor', 'explanation_writer.js'),
    path.join(ENGINE_DIR, 'why.js'),
  ]);
  const ns = vm.runInContext('ChipyEngine', ctx);
  assert.equal(typeof ns.why.reasonFor, 'function');
  const chart = ns.chart.buildChart(BASE);
  for (const table of ['hard', 'soft', 'pairs']) {
    for (const row of chart[table]) {
      row.cells.forEach((cell, i) => {
        const args = { table, row: row.label, dealer: chart.columns[i], cell };
        assert.equal(ns.why.reasonFor(args), reasonFor(args));
      });
    }
  }
});

test('in a browser, why.js throws clearly if explanation_writer.js is not loaded first', () => {
  assert.throws(
    () => browserContext([path.join(ENGINE_DIR, 'why.js')]),
    /load engine\/vendor\/explanation_writer\.js before why\.js/
  );
});

test('why.js has no DOM use and no require other than the vendored explanation writer', () => {
  const src = fs.readFileSync(path.join(ENGINE_DIR, 'why.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /\bdocument\b|\bwindow\b|\bnavigator\b/);
  const requires = code.match(/require\(([^)]*)\)/g) || [];
  assert.deepEqual(requires, ["require('./vendor/explanation_writer.js')"]);
});
