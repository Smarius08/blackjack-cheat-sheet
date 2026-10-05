// Snapshot tests (story S-04).
//
// snapshot/charts-36.json is the QA truth (36 charts). These tests check its
// shape and order (D-023, D-038), its labels (D-024), and that engine/chart.js
// still produces exactly the committed charts, naming the first difference.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const { buildChart } = require(path.join(ROOT, 'engine', 'chart.js'));
const { buildSnapshot, serialize } = require(path.join(ROOT, 'snapshot', 'generate.js'));
const SNAPSHOT_FILE = path.join(ROOT, 'snapshot', 'charts-36.json');

const fileText = fs.readFileSync(SNAPSHOT_FILE, 'utf8');
const snapshot = JSON.parse(fileText);

// Expected order (D-023), written out independently of generate.js.
function expectedRules() {
  const out = [];
  for (const decks of ['1', '2', '4-8'])
    for (const soft17 of ['stands', 'hits'])
      for (const das of ['yes', 'no'])
        for (const surrender of ['none', 'any', 'except_ace'])
          out.push({ decks, soft17, das, surrender });
  return out;
}
const idOf = (r) => `decks=${r.decks}|soft17=${r.soft17}|das=${r.das}|surrender=${r.surrender}`;

// Returns a path string to the first difference between a and b, or null.
function firstDiff(a, b, where) {
  if (a === b) return null;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return `${where}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return `${where}: array vs object`;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.join(',') !== kb.join(',')) return `${where}: keys [${ka}] vs expected [${kb}]`;
  for (const k of ka) {
    const d = firstDiff(a[k], b[k], `${where}.${k}`);
    if (d) return d;
  }
  return null;
}

// Names table / row label / dealer column of the first differing cell.
function describeTableDiff(actual, expected) {
  const columns = expected.columns;
  for (const table of ['hard', 'soft', 'pairs']) {
    const ra = actual[table] || [];
    const re = expected[table] || [];
    for (let i = 0; i < Math.max(ra.length, re.length); i++) {
      const rowA = ra[i];
      const rowE = re[i];
      if (!rowA || !rowE) return `${table} row #${i}: missing row`;
      if (rowA.label !== rowE.label) return `${table} row #${i}: label ${JSON.stringify(rowA.label)} vs expected ${JSON.stringify(rowE.label)}`;
      for (let c = 0; c < Math.max(rowA.cells.length, rowE.cells.length); c++) {
        const d = firstDiff(rowA.cells[c], rowE.cells[c], 'cell');
        if (d) return `${table} row ${rowE.label} vs dealer ${columns[c]}: ${d}`;
      }
      const rest = firstDiff(
        Object.assign({}, rowA, { cells: null }),
        Object.assign({}, rowE, { cells: null }),
        `${table} row ${rowE.label}`
      );
      if (rest) return rest;
    }
  }
  return firstDiff(actual, expected, 'tables');
}

test('snapshot has exactly 36 distinct ids, in D-023 order, each { id, rules, label, tables }', () => {
  assert.deepEqual(Object.keys(snapshot), ['charts']);
  assert.ok(Array.isArray(snapshot.charts));
  assert.equal(snapshot.charts.length, 36);
  const ids = snapshot.charts.map((c) => c.id);
  assert.equal(new Set(ids).size, 36, 'ids are distinct');
  assert.deepEqual(ids, expectedRules().map(idOf));
  snapshot.charts.forEach((chart, i) => {
    assert.deepEqual(Object.keys(chart), ['id', 'rules', 'label', 'tables'], `chart ${chart.id} keys`);
    assert.deepEqual(chart.rules, expectedRules()[i], `chart ${chart.id} rules`);
    assert.deepEqual(Object.keys(chart.rules), ['decks', 'soft17', 'das', 'surrender'], `chart ${chart.id} rule keys`);
    assert.equal(chart.id, idOf(chart.rules));
  });
});

test('engine/chart.js still produces every committed chart (first difference is named)', () => {
  const problems = [];
  for (const chart of snapshot.charts) {
    const fresh = buildChart(Object.assign({}, chart.rules));
    const d = describeTableDiff(fresh, chart.tables);
    if (d) problems.push(`${chart.id}: ${d}`);
  }
  assert.equal(problems.length, 0, 'snapshot differs from engine:\n' + problems.join('\n'));
});

test('generator output equals the committed file byte for byte (no stale snapshot)', () => {
  const fresh = serialize(buildSnapshot());
  assert.ok(!fileText.includes('\r'), 'file uses LF only');
  assert.ok(fileText.endsWith('}\n') && !fileText.endsWith('\n\n'), 'one trailing newline');
  if (fresh !== fileText) {
    let i = 0;
    while (i < fresh.length && fresh[i] === fileText[i]) i++;
    const line = fileText.slice(0, i).split('\n').length;
    assert.fail(`charts-36.json is stale: first byte difference at line ${line}; run node snapshot/generate.js`);
  }
  assert.equal(serialize(buildSnapshot()), fresh, 'generator is deterministic');
});

test('labels match D-024 wording for all 36 charts', () => {
  const words = {
    decks: { '1': '1 deck', '2': '2 decks', '4-8': '4–8 decks' },
    soft17: { stands: 'Dealer stands on soft 17', hits: 'Dealer hits on soft 17' },
    das: { yes: 'Double after split allowed', no: 'No double after split' },
    surrender: { none: 'No surrender', any: 'Surrender: any dealer card', except_ace: 'Surrender: any dealer card except ace' },
  };
  for (const chart of snapshot.charts) {
    const r = chart.rules;
    const expected = [words.decks[r.decks], words.soft17[r.soft17], words.das[r.das], words.surrender[r.surrender]].join(' · ');
    assert.equal(chart.label, expected, `label of ${chart.id}`);
  }
  const example = snapshot.charts.find((c) => c.id === 'decks=4-8|soft17=hits|das=yes|surrender=any');
  assert.equal(example.label, '4–8 decks · Dealer hits on soft 17 · Double after split allowed · Surrender: any dealer card');
});
