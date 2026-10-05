// Review page builder (story S-05).
//
// Reads snapshot/charts-36.json and writes snapshot/review.html: one static
// page with all 36 charts rendered at build time (D-025). No runtime JS, no
// external requests, so it opens by double-click (file://).
//
// Usage: node snapshot/build-review.js

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SNAPSHOT_FILE = path.join(__dirname, 'charts-36.json');
const OUT_FILE = path.join(__dirname, 'review.html');

// Plain move words (D-022, D-027) and one colour per move (D-026).
const MOVES = {
  HIT: { word: 'Hit', cls: 'm-hit', bg: '#f4c7c3', fg: '#1a1a1a' },
  STAND: { word: 'Stand', cls: 'm-stand', bg: '#fff2a8', fg: '#1a1a1a' },
  DOUBLE: { word: 'Double', cls: 'm-double', bg: '#b7e1cd', fg: '#1a1a1a' },
  SPLIT: { word: 'Split', cls: 'm-split', bg: '#c9daf8', fg: '#1a1a1a' },
  SURRENDER: { word: 'Surrender', cls: 'm-surrender', bg: '#d9c3e9', fg: '#1a1a1a' },
};

// Key for the engine codes shown in small text (D-040). Wording follows the
// vendored resolveCode() (engine/vendor/strategy_table.js). Each entry is
// [codes, meaning]; codes are wrapped in <code> so the test can find them.
const CODE_KEY = [
  [['H'], 'hit'],
  [['S'], 'stand'],
  [['P'], 'split'],
  [['Dh'], 'double, if not allowed hit'],
  [['Ds'], 'double, if not allowed stand'],
  [['Rh', 'Rs'], 'surrender, if not allowed hit / stand'],
  [['Rp'], 'surrender if surrender is allowed and double after split is not; otherwise split'],
  [['Ph'], 'split if double after split is allowed, otherwise hit'],
  [['Pd'], 'split if double after split is allowed, otherwise double'],
  [['Ps'], 'same, otherwise stand'],
];

function renderCodeKey() {
  const items = CODE_KEY.map(([codes, meaning]) =>
    codes.map((c) => '<code>' + esc(c) + '</code>').join(' / ') + ' = ' + esc(meaning));
  return '<p class="code-key">Small codes (engine codes from the Trainer strategy table): ' +
    items.join(' · ') + '</p>';
}

const DECK_GROUPS = [
  { decks: '1', heading: '1 deck' },
  { decks: '2', heading: '2 decks' },
  { decks: '4-8', heading: '4–8 decks' },
];

const TABLES = [
  { key: 'hard', heading: 'Hard' },
  { key: 'soft', heading: 'Soft' },
  { key: 'pairs', heading: 'Pairs' },
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function anchorFor(id) {
  return 'chart-' + String(id).replace(/[^A-Za-z0-9]/g, '-');
}

function moveInfo(move) {
  const m = MOVES[move];
  if (!m) throw new Error('Unknown move in snapshot: ' + JSON.stringify(move));
  return m;
}

function css() {
  const lines = [
    'body{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;margin:24px;color:#1a1a1a;background:#fff}',
    'h1{font-size:22px;margin:0 0 8px}',
    'h2{font-size:18px;margin:32px 0 8px;padding-top:8px;border-top:2px solid #333}',
    'h3{font-size:15px;margin:16px 0 4px}',
    '.intro{margin:0 0 12px}',
    '.legend{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px;padding:0;list-style:none}',
    '.legend li{padding:4px 10px;border:1px solid #999;border-radius:4px}',
    '.code-key{font-size:13px;margin:0 0 16px}',
    '.index h3.grp{margin-top:12px}',
    '.index ul{margin:4px 0 12px;padding-left:20px}',
    'table{border-collapse:collapse;margin:0 0 8px}',
    'th,td{border:1px solid #888;padding:2px 4px;text-align:center;min-width:56px}',
    'thead th{background:#eee}',
    'tbody th{background:#f6f6f6;text-align:left;white-space:nowrap}',
    'td .mv{display:block;font-weight:600;font-size:13px}',
    'td .cd{display:block;font-size:10px;color:#333}',
    'td sup.nt{font-size:10px;font-weight:700}',
    '.notes{font-size:13px;margin:4px 0 0}',
    '.top{font-size:13px}',
  ];
  for (const key of Object.keys(MOVES)) {
    const m = MOVES[key];
    lines.push('.' + m.cls + '{background:' + m.bg + ';color:' + m.fg + '}');
  }
  return lines.join('\n');
}

function renderIndex(charts) {
  const out = [];
  out.push('<nav class="index" aria-label="Chart index">');
  for (const g of DECK_GROUPS) {
    out.push('<h3 class="grp">' + esc(g.heading) + '</h3>');
    out.push('<ul data-decks="' + esc(g.decks) + '">');
    for (const c of charts) {
      if (c.rules.decks !== g.decks) continue;
      out.push('<li><a href="#' + anchorFor(c.id) + '">' + esc(c.label) + '</a></li>');
    }
    out.push('</ul>');
  }
  out.push('</nav>');
  return out.join('\n');
}

function renderChart(chart) {
  const out = [];
  const anchor = anchorFor(chart.id);
  const columns = chart.tables.columns;
  // Notes are numbered per chart; identical notes share one number.
  const noteNums = new Map();
  const noteList = [];

  out.push('<section class="chart" data-id="' + esc(chart.id) + '">');
  out.push('<h2 id="' + anchor + '">' + esc(chart.label) + '</h2>');
  for (const t of TABLES) {
    out.push('<h3>' + t.heading + '</h3>');
    out.push('<table class="tbl" data-table="' + t.key + '">');
    out.push('<thead><tr><th scope="col">Your hand</th>' +
      columns.map((c) => '<th scope="col">' + esc(c) + '</th>').join('') + '</tr></thead>');
    out.push('<tbody>');
    for (const row of chart.tables[t.key]) {
      let line = '<tr><th scope="row">' + esc(row.label) + '</th>';
      for (const cell of row.cells) {
        const m = moveInfo(cell.move);
        let title = '';
        let mark = '';
        if (cell.note !== null && cell.note !== undefined) {
          let n = noteNums.get(cell.note);
          if (n === undefined) {
            n = noteList.length + 1;
            noteNums.set(cell.note, n);
            noteList.push(cell.note);
          }
          title = ' title="' + esc(cell.note) + '"';
          mark = '<sup class="nt">' + n + '</sup>';
        }
        line += '<td class="' + m.cls + '"' + title + '>' +
          '<span class="mv">' + m.word + mark + '</span>' +
          '<span class="cd">' + esc(cell.code) + '</span></td>';
      }
      line += '</tr>';
      out.push(line);
    }
    out.push('</tbody>');
    out.push('</table>');
  }
  if (noteList.length > 0) {
    out.push('<ol class="notes">');
    for (const note of noteList) out.push('<li>' + esc(note) + '</li>');
    out.push('</ol>');
  }
  out.push('<p class="top"><a href="#top">Back to index</a></p>');
  out.push('</section>');
  return out.join('\n');
}

function buildReview(snapshot) {
  const charts = snapshot.charts;
  const legend = Object.keys(MOVES)
    .map((k) => '<li class="' + MOVES[k].cls + '">' + MOVES[k].word + '</li>')
    .join('');
  const parts = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Cheat Sheet — 36-chart review</title>',
    '<style>',
    css(),
    '</style>',
    '</head>',
    '<body>',
    '<h1 id="top">Cheat Sheet — 36-chart review</h1>',
    '<p class="intro">Internal review page: all ' + charts.length +
      ' charts from snapshot/charts-36.json. Each cell shows the move in words, with the engine code in small text underneath. ' +
      'A small number after a move marks a note; the notes are listed under that chart’s tables (hover a cell to see its note).</p>',
    '<ul class="legend" aria-label="Move colours">' + legend + '</ul>',
    renderCodeKey(),
    renderIndex(charts),
    ...charts.map(renderChart),
    '</body>',
    '</html>',
  ];
  return parts.join('\n') + '\n';
}

function buildFromFile(file = SNAPSHOT_FILE) {
  return buildReview(JSON.parse(fs.readFileSync(file, 'utf8')));
}

module.exports = { buildReview, buildFromFile, anchorFor, MOVES, CODE_KEY, OUT_FILE, SNAPSHOT_FILE };

if (require.main === module) {
  const html = buildFromFile();
  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log('Wrote ' + path.relative(process.cwd(), OUT_FILE));
}
