// Review page tests (story S-05).
//
// snapshot/review.html must equal what snapshot/build-review.js writes now
// (D-025), and must show the snapshot faithfully: index + 36 headings in order
// (D-023, D-024), plain move words with the code as small text (D-022, D-027),
// a note marker exactly on cells with a note (D-022), no external requests.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const { buildFromFile, anchorFor } = require(path.join(ROOT, 'snapshot', 'build-review.js'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));
const html = fs.readFileSync(path.join(ROOT, 'snapshot', 'review.html'), 'utf8');

const WORDS = { HIT: 'Hit', STAND: 'Stand', DOUBLE: 'Double', SPLIT: 'Split', SURRENDER: 'Surrender' };
const WORD_SET = new Set(Object.values(WORDS));

function unesc(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

// Split the page into chart sections, in page order.
function sections() {
  const re = /<section class="chart"[^>]*>([\s\S]*?)<\/section>/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

test('review.html is up to date with build-review.js (byte for byte)', () => {
  const fresh = buildFromFile();
  assert.ok(fresh === html, 'snapshot/review.html is stale: run `node snapshot/build-review.js`');
  assert.ok(html.endsWith('</html>\n') && !html.endsWith('\n\n'), 'one trailing LF');
  assert.ok(!html.includes('\r'), 'LF line endings only');
  assert.match(html, /<meta charset="utf-8">/);
});

test('index: 36 links grouped 12/12/12 under the deck headings, in snapshot order', () => {
  const nav = html.match(/<nav class="index"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'index nav present');
  const groups = [...nav[1].matchAll(/<h3 class="grp">([^<]*)<\/h3>\s*<ul[^>]*>([\s\S]*?)<\/ul>/g)];
  assert.deepEqual(groups.map((g) => unesc(g[1])), ['1 deck', '2 decks', '4–8 decks']);
  const deckOf = { '1 deck': '1', '2 decks': '2', '4–8 decks': '4-8' };
  const allLinks = [];
  for (const g of groups) {
    const links = [...g[2].matchAll(/<a href="#([^"]+)">([^<]*)<\/a>/g)];
    assert.equal(links.length, 12, g[1] + ' has 12 links');
    const expected = snapshot.charts.filter((c) => c.rules.decks === deckOf[unesc(g[1])]);
    assert.deepEqual(links.map((l) => unesc(l[2])), expected.map((c) => c.label));
    assert.deepEqual(links.map((l) => l[1]), expected.map((c) => anchorFor(c.id)));
    allLinks.push(...links);
  }
  assert.equal(allLinks.length, 36);
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  for (const l of allLinks) assert.ok(ids.has(l[1]), 'href #' + l[1] + ' has a target');
  for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(m[1]), 'href #' + m[1] + ' has a target');
});

test('36 chart headings (h2) in snapshot order, ids unique', () => {
  const h2 = [...html.matchAll(/<h2 id="([^"]+)">([^<]*)<\/h2>/g)];
  assert.equal([...html.matchAll(/<h2[\s>]/g)].length, 36, 'exactly 36 h2 on the page');
  assert.equal(h2.length, 36);
  assert.deepEqual(h2.map((m) => unesc(m[2])), snapshot.charts.map((c) => c.label));
  assert.deepEqual(h2.map((m) => m[1]), snapshot.charts.map((c) => anchorFor(c.id)));
  assert.equal(new Set(h2.map((m) => m[1])).size, 36);
});

test('every cell: main text = plain move word = snapshot move; code only as small text', () => {
  const secs = sections();
  assert.equal(secs.length, 36);
  const colourOf = new Map();
  snapshot.charts.forEach((chart, ci) => {
    const sec = secs[ci];
    const tables = [...sec.matchAll(/<h3>([^<]*)<\/h3>\s*<table class="tbl" data-table="([a-z]+)">([\s\S]*?)<\/table>/g)];
    assert.deepEqual(tables.map((t) => t[1]), ['Hard', 'Soft', 'Pairs'], chart.id);
    for (const t of tables) {
      const key = t[2];
      const header = [...t[3].match(/<thead>([\s\S]*?)<\/thead>/)[1].matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]);
      assert.deepEqual(header, ['Your hand', ...chart.tables.columns], chart.id + ' ' + key + ' header');
      const rows = [...t[3].matchAll(/<tr><th scope="row">([^<]*)<\/th>([\s\S]*?)<\/tr>/g)];
      const want = chart.tables[key];
      assert.equal(rows.length, want.length, chart.id + ' ' + key + ' row count');
      rows.forEach((r, ri) => {
        assert.equal(unesc(r[1]), want[ri].label, chart.id + ' ' + key + ' row label');
        const cells = [...r[2].matchAll(/<td class="([^"]+)"(?: title="([^"]*)")?>([\s\S]*?)<\/td>/g)];
        assert.equal(cells.length, want[ri].cells.length);
        cells.forEach((c, k) => {
          const exp = want[ri].cells[k];
          const where = chart.id + ' ' + key + ' ' + want[ri].label + ' vs ' + chart.tables.columns[k];
          const inner = c[3];
          const parts = inner.match(/^<span class="mv">([A-Za-z]+)(?:<sup class="nt">\d+<\/sup>)?<\/span><span class="cd">([^<]*)<\/span>$/);
          assert.ok(parts, where + ': cell structure');
          assert.ok(WORD_SET.has(parts[1]), where + ': main text is a move word');
          assert.equal(parts[1], WORDS[exp.move], where + ': move');
          assert.equal(unesc(parts[2]), exp.code, where + ': code');
          // Same move -> same colour class everywhere.
          if (colourOf.has(exp.move)) assert.equal(c[1], colourOf.get(exp.move), where + ': colour');
          else colourOf.set(exp.move, c[1]);
        });
      });
    }
  });
  assert.equal(new Set(colourOf.values()).size, colourOf.size, 'each move has its own colour');
});

test('note markers exactly on cells with a non-null note; note text on the page', () => {
  const secs = sections();
  snapshot.charts.forEach((chart, ci) => {
    const sec = secs[ci];
    const notes = [];
    for (const key of ['hard', 'soft', 'pairs'])
      for (const row of chart.tables[key])
        for (const cell of row.cells) if (cell.note !== null) notes.push(cell.note);
    const marks = (sec.match(/<sup class="nt">/g) || []).length;
    const titled = [...sec.matchAll(/<td class="[^"]+" title="([^"]*)">/g)].map((m) => unesc(m[1]));
    assert.equal(marks, notes.length, chart.id + ': marker count');
    assert.deepEqual(titled, notes, chart.id + ': title per noted cell');
    const listed = sec.match(/<ol class="notes">([\s\S]*?)<\/ol>/);
    const items = listed ? [...listed[1].matchAll(/<li>([^<]*)<\/li>/g)].map((m) => unesc(m[1])) : [];
    assert.deepEqual(items, [...new Set(notes)], chart.id + ': notes listed');
    for (const m of sec.matchAll(/<sup class="nt">(\d+)<\/sup>/g)) {
      const n = Number(m[1]);
      assert.ok(n >= 1 && n <= items.length, chart.id + ': marker number refers to a listed note');
    }
  });
});

test('code key: one element in the intro naming every code in the snapshot (D-040)', () => {
  const keys = [...html.matchAll(/<p class="code-key">([\s\S]*?)<\/p>/g)];
  assert.equal(keys.length, 1, 'exactly one code-key element');
  assert.equal((html.match(/class="code-key"/g) || []).length, 1, 'code-key class used once');
  assert.ok(html.indexOf('class="code-key"') < html.indexOf('<nav class="index"'), 'key sits in the intro, before the index');
  const named = new Set([...keys[0][1].matchAll(/<code>([^<]*)<\/code>/g)].map((m) => unesc(m[1])));
  const used = new Set();
  for (const chart of snapshot.charts)
    for (const key of ['hard', 'soft', 'pairs'])
      for (const row of chart.tables[key])
        for (const cell of row.cells) used.add(cell.code);
  assert.ok(used.size > 0);
  for (const code of used) assert.ok(named.has(code), 'code key names ' + code);
});

test('no external requests', () => {
  assert.ok(!/https?:\/\//i.test(html), 'no http(s) URL');
  assert.ok(!html.includes('fetch('), 'no fetch');
  assert.ok(!/<script/i.test(html), 'no script');
  assert.ok(!/<link/i.test(html), 'no link');
  for (const m of html.matchAll(/(?:src|href)="([^"]*)"/g)) assert.ok(m[1].startsWith('#'), 'in-page refs only: ' + m[1]);
});
