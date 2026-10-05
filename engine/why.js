/**
 * Cell reasons (story S-06)
 * =========================
 * A plain-words reason for one chart cell, taken from the vendored Trainer
 * explanation writer (engine/vendor/explanation_writer.js). The text is
 * returned exactly as the vendor writes it (D-028); the cell's note is never
 * added (D-030). This file holds no strategy wording of its own; it only maps
 * a chart.js cell + table + row label + dealer column to the writer inputs.
 *
 * API (D-041): reasonFor({ table, row, dealer, cell }) -> string
 *   table  "hard" | "soft" | "pairs"
 *   row    chart.js row label (D-033): Hard "5-7","8"..."17","18-21";
 *          Soft "13"..."20"; Pairs "2,2"..."10,10","A,A"
 *   dealer chart.js column label "2"..."10","A"
 *   cell   a chart.js cell { move, code, note }
 *
 * Writer inputs:
 *   move  = cell.move
 *   total = row number, or lowest of a range (5-7 -> 5, 18-21 -> 18);
 *           Pairs = 2 x card value, A,A -> 12 (D-021; D-029)
 *   soft  = true for the Soft table and for A,A
 *   pair  = card rank for Pairs rows ("2"..."10","A"), else null
 *
 * Module format: same dual-mode wrapper as chart.js. Under Node it is a
 * CommonJS module that requires ./vendor/explanation_writer.js. In a browser
 * (plain <script> after explanation_writer.js) it reads
 * window.ChipyEngine.explanationWriter and attaches its exports to
 * window.ChipyEngine.why. No DOM use.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./vendor/explanation_writer.js'));
  } else {
    var ns = (root.ChipyEngine = root.ChipyEngine || {});
    if (!ns.explanationWriter) {
      throw new Error('why.js: load engine/vendor/explanation_writer.js before why.js');
    }
    ns.why = factory(ns.explanationWriter);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (explanationWriter) {
  'use strict';

  const getStrategyExplanation = explanationWriter.getStrategyExplanation;

  const COLUMNS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
  const MOVES = ['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER'];

  // Row label -> writer inputs, per table (D-020, D-021, D-033).
  const ROWS = { hard: {}, soft: {}, pairs: {} };

  ['5-7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18-21'].forEach(function (label) {
    ROWS.hard[label] = { total: parseInt(label, 10), soft: false, pair: null };
  });
  ['13', '14', '15', '16', '17', '18', '19', '20'].forEach(function (label) {
    ROWS.soft[label] = { total: Number(label), soft: true, pair: null };
  });
  ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'].forEach(function (c) {
    ROWS.pairs[c + ',' + c] = c === 'A'
      ? { total: 12, soft: true, pair: 'A' }
      : { total: 2 * Number(c), soft: false, pair: c };
  });

  function reasonFor(args) {
    if (args === null || typeof args !== 'object') {
      throw new TypeError('reasonFor: expected { table, row, dealer, cell }');
    }
    const table = args.table;
    const row = args.row;
    const dealer = args.dealer;
    const cell = args.cell;

    if (!Object.prototype.hasOwnProperty.call(ROWS, table)) {
      throw new RangeError('reasonFor: unknown table ' + JSON.stringify(table) + ' (allowed: hard, soft, pairs)');
    }
    if (typeof row !== 'string' || !Object.prototype.hasOwnProperty.call(ROWS[table], row)) {
      throw new RangeError('reasonFor: unknown ' + table + ' row ' + JSON.stringify(row));
    }
    if (COLUMNS.indexOf(dealer) === -1) {
      throw new RangeError('reasonFor: unknown dealer ' + JSON.stringify(dealer) + ' (allowed: ' + COLUMNS.join(', ') + ')');
    }
    if (cell === null || typeof cell !== 'object') {
      throw new TypeError('reasonFor: cell must be a chart.js cell { move, code, note }');
    }
    if (MOVES.indexOf(cell.move) === -1) {
      throw new RangeError('reasonFor: unknown move ' + JSON.stringify(cell.move) + ' (allowed: ' + MOVES.join(', ') + ')');
    }

    const r = ROWS[table][row];
    const text = getStrategyExplanation({
      move: cell.move,
      total: r.total,
      soft: r.soft,
      pair: r.pair,
      dealerRank: dealer,
    });
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('reasonFor: vendor returned no reason for ' + table + ' ' + row + ' vs ' + dealer + ' ' + cell.move);
    }
    return text;
  }

  return { reasonFor: reasonFor };
});
