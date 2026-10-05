// Snapshot generator (story S-04).
//
// Calls engine/chart.js for all 36 rule combinations (3 decks x 2 soft17 x
// 2 das x 3 surrender) and writes snapshot/charts-36.json, the QA truth.
//
//   node snapshot/generate.js
//
// File shape (D-038): { "charts": [ 36 x { id, rules, label, tables } ] } (D-023).
// tables = buildChart(rules) output as is (D-022 cells { move, code, note }).
// Output is deterministic: fixed key order, JSON.stringify(..., null, 2), LF, one
// trailing newline, UTF-8. Node only, no dependencies.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildChart } = require(path.join(__dirname, '..', 'engine', 'chart.js'));

const OUT_FILE = path.join(__dirname, 'charts-36.json');

// Rule values in snapshot order (D-023), outermost first.
const ORDER = {
  decks: ['1', '2', '4-8'],
  soft17: ['stands', 'hits'],
  das: ['yes', 'no'],
  surrender: ['none', 'any', 'except_ace'],
};

// Plain-words label wording (D-024). Change wording here only (G2).
const LABELS = {
  decks: { '1': '1 deck', '2': '2 decks', '4-8': '4–8 decks' },
  soft17: { stands: 'Dealer stands on soft 17', hits: 'Dealer hits on soft 17' },
  das: { yes: 'Double after split allowed', no: 'No double after split' },
  surrender: { none: 'No surrender', any: 'Surrender: any dealer card', except_ace: 'Surrender: any dealer card except ace' },
};
const LABEL_SEPARATOR = ' · ';

const RULE_NAMES = ['decks', 'soft17', 'das', 'surrender'];

function chartId(rules) {
  return RULE_NAMES.map((name) => name + '=' + rules[name]).join('|');
}

function chartLabel(rules) {
  return RULE_NAMES.map((name) => LABELS[name][rules[name]]).join(LABEL_SEPARATOR);
}

function allRules() {
  const out = [];
  for (const decks of ORDER.decks)
    for (const soft17 of ORDER.soft17)
      for (const das of ORDER.das)
        for (const surrender of ORDER.surrender)
          out.push({ decks, soft17, das, surrender });
  return out;
}

function buildSnapshot() {
  return {
    charts: allRules().map((rules) => ({
      id: chartId(rules),
      rules: rules,
      label: chartLabel(rules),
      tables: buildChart(rules),
    })),
  };
}

function serialize(data) {
  return JSON.stringify(data, null, 2) + '\n';
}

if (require.main === module) {
  const text = serialize(buildSnapshot());
  fs.writeFileSync(OUT_FILE, text, 'utf8');
  process.stdout.write('wrote ' + path.relative(process.cwd(), OUT_FILE) + ' (' + Buffer.byteLength(text, 'utf8') + ' bytes)\n');
}

module.exports = { buildSnapshot, serialize, chartId, chartLabel, allRules, OUT_FILE };
