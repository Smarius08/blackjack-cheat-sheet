/**
 * Chart resolution (story S-03)
 * =============================
 * The player's 4 table rules in, 3 tables of plain moves out.
 *
 * Every cell comes from the vendored engine (engine/vendor/strategy_table.js):
 * the source code is read from STRATEGY_TABLE and turned into a plain move by
 * resolveCode(). This file holds no strategy rules of its own; it only picks
 * the table, fixes the row order and passes the arguments below.
 *
 *   resolveCode(code, dealer, total, firstDecision = true, whyLabel,
 *               postSplit = false, settings)
 *   settings = { surrender, dasAllowed, doubleRestriction: 0, ... }
 *     doubleRestriction 0 = double on any two cards (D-002).
 *   total = row number, or lowest of a range (5-7 -> 5, 18-21 -> 18);
 *           Pairs = 2 x card value, A,A -> 12 (D-021).
 *
 * Rows (D-020), top to bottom:
 *   Hard  5-7, 8, 9 ... 17, 18-21   (Double/Multi read "5-8" for both 5-7 and 8)
 *   Soft  13 ... 20
 *   Pairs 2,2 ... 10,10, A,A
 * Cell = { move, code, note } (D-022).
 *
 * API (D-033): buildChart(rules)
 *   rules = { decks: "1"|"2"|"4-8", soft17: "stands"|"hits",
 *             das: "yes"|"no", surrender: "none"|"any"|"except_ace" } (D-023)
 *   returns { columns, hard, soft, pairs }; each table = [{ label, cells[10] }].
 *
 * Module format: same dual-mode wrapper as the vendor files. Under Node it is a
 * CommonJS module that requires ./vendor/strategy_table.js. In a browser (plain
 * <script> after strategy_table.js) it reads window.ChipyEngine.strategyTable
 * and attaches its exports to window.ChipyEngine.chart. No DOM use.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./vendor/strategy_table.js'));
  } else {
    var ns = (root.ChipyEngine = root.ChipyEngine || {});
    if (!ns.strategyTable) {
      throw new Error('chart.js: load engine/vendor/strategy_table.js before chart.js');
    }
    ns.chart = factory(ns.strategyTable);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (strategyTable) {
  'use strict';

  const STRATEGY_TABLE = strategyTable.STRATEGY_TABLE;
  const resolveCode = strategyTable.resolveCode;

  // Dealer columns, index 0..9 = engine index 0..9. Ace is passed to resolveCode as 11.
  const COLUMNS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
  const DEALER_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Allowed rule values (D-023), in the snapshot order.
  const RULE_VALUES = {
    decks: ['1', '2', '4-8'],
    soft17: ['stands', 'hits'],
    das: ['yes', 'no'],
    surrender: ['none', 'any', 'except_ace'],
  };

  const DECK_GROUP = { '1': 'Single', '2': 'Double', '4-8': 'Multi' };
  const DEALER_RULE = { stands: 'S17', hits: 'H17' };

  // Fixed display rows (D-020). Object key order in STRATEGY_TABLE is not display order.
  // key: engine row key (Hard 5-7 / 8 depend on deck group, see hardKey()).
  // total: value passed to resolveCode (D-021).
  const HARD_ROWS = [
    { label: '5-7', total: 5 },
    { label: '8', total: 8 },
    { label: '9', total: 9 },
    { label: '10', total: 10 },
    { label: '11', total: 11 },
    { label: '12', total: 12 },
    { label: '13', total: 13 },
    { label: '14', total: 14 },
    { label: '15', total: 15 },
    { label: '16', total: 16 },
    { label: '17', total: 17 },
    { label: '18-21', total: 18 },
  ];

  const SOFT_ROWS = ['13', '14', '15', '16', '17', '18', '19', '20'].map(function (n) {
    return { label: n, key: n, total: Number(n) };
  });

  const PAIR_ROWS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'].map(function (c) {
    return { label: c + ',' + c, key: c, total: c === 'A' ? 12 : 2 * Number(c) };
  });

  function hardKey(deckGroup, label) {
    // Single has its own "5-7" and "8" rows; Double and Multi share one "5-8" row.
    if ((label === '5-7' || label === '8') && deckGroup !== 'Single') return '5-8';
    return label;
  }

  function validateRules(rules) {
    if (rules === null || typeof rules !== 'object') {
      throw new TypeError('buildChart: rules must be an object { decks, soft17, das, surrender }');
    }
    Object.keys(RULE_VALUES).forEach(function (name) {
      const allowed = RULE_VALUES[name];
      if (allowed.indexOf(rules[name]) === -1) {
        throw new RangeError(
          'buildChart: unknown ' + name + ' value ' + JSON.stringify(rules[name]) +
          ' (allowed: ' + allowed.join(', ') + ')'
        );
      }
    });
  }

  function buildTable(engineRows, handName, rows, keyFor, settings) {
    return rows.map(function (row) {
      const key = keyFor(row);
      const codes = engineRows[key];
      if (!Array.isArray(codes) || codes.length !== COLUMNS.length) {
        throw new Error('buildChart: engine has no 10-cell ' + handName + ' row "' + key + '"');
      }
      const cells = codes.map(function (code, i) {
        const whyLabel = handName + ' ' + row.label + ' vs ' + COLUMNS[i];
        const r = resolveCode(code, DEALER_VALUES[i], row.total, true, whyLabel, false, settings);
        return { move: r.move, code: code, note: r.note === undefined ? null : r.note };
      });
      return { label: row.label, cells: cells };
    });
  }

  function buildChart(rules) {
    validateRules(rules);
    const deckGroup = DECK_GROUP[rules.decks];
    const dealerRule = DEALER_RULE[rules.soft17];
    const t = STRATEGY_TABLE[deckGroup][dealerRule];
    const settings = {
      surrender: rules.surrender,
      dasAllowed: rules.das === 'yes',
      doubleRestriction: 0,
      dealerHitsSoft17: rules.soft17 === 'hits',
      deckCount: rules.decks,
    };
    return {
      columns: COLUMNS.slice(),
      hard: buildTable(t.Hard, 'Hard', HARD_ROWS, function (row) { return hardKey(deckGroup, row.label); }, settings),
      soft: buildTable(t.Soft, 'Soft', SOFT_ROWS, function (row) { return row.key; }, settings),
      pairs: buildTable(t.Pair, 'Pair', PAIR_ROWS, function (row) { return row.key; }, settings),
    };
  }

  return { buildChart: buildChart, RULE_VALUES: RULE_VALUES, COLUMNS: COLUMNS };
});
