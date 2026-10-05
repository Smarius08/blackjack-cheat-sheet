// Cell reason panel tests (story S-10). node:vm with a tiny stub document, no DOM library.
// Every cell of all 36 charts: panel reason === reasonFor(engine row label), note from the snapshot.

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
const TABLES = ['hard', 'soft', 'pairs'];
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function makeDoc() {
  const els = {};
  const doc = { els, activeElement: null };
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', hidden: false, attrs: {}, handlers: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(t, fn) { this.handlers[t] = fn; },
    querySelectorAll(sel) {
      if (id !== 'chart' || sel !== 'button[data-cell]') return [];
      if (this._src !== this.innerHTML) {
        this._src = this.innerHTML;
        this._btns = [...this.innerHTML.matchAll(/<button type="button" class="cell-hit"([^>]*)><\/button>/g)].map((m) => {
          const attrs = {};
          for (const a of m[1].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[a[1]] = unesc(a[2]);
          if (/ data-cell /.test(m[1])) attrs['data-cell'] = '';
          const classes = new Set(['cell-hit']);
          const b = { attrs, classes,
            getAttribute: (n) => (n in attrs ? attrs[n] : null),
            setAttribute: (n, v) => { attrs[n] = String(v); },
            classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)) },
            focus: () => { doc.activeElement = b; },
            closest: (s) => (s === 'button[data-cell]' ? b : null) };
          return b;
        });
      }
      return this._btns;
    } });
  doc.getElementById = el;
  return doc;
}

function loadPage() {
  const doc = makeDoc();
  const ctx = vm.createContext({ document: doc });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) vm.runInContext(m[2], ctx, { filename: m[1] });
  return { app: ctx.ChipyCheatSheet, why: ctx.ChipyEngine.why, doc };
}

const buttons = (doc) => doc.els.chart.querySelectorAll('button[data-cell]');
const btn = (doc, table, ri, ci) => buttons(doc).find((b) => b.attrs['data-table'] === table && b.attrs['data-ri'] === String(ri) && b.attrs['data-ci'] === String(ci));
const panel = (doc, table) => doc.els['reason-' + table];
const click = (doc, b) => doc.els.chart.handlers.click({ target: b });
const key = (doc, b, k) => { const e = { key: k, target: b, prevented: false, preventDefault() { this.prevented = true; } }; doc.els.chart.handlers.keydown(e); return e; };
function closeButton(table) {
  const b = { getAttribute: (n) => (n === 'data-table' ? table : null), closest: (s) => (s === 'button[data-close]' ? b : null) };
  return b;
}
const txt = (h, attr) => { const m = h.match(new RegExp('<p class="[^"]*" ' + attr + '>([\\s\\S]*?)</p>')); return m ? unesc(m[1]) : null; };

const displayTitle = (t, label, d) =>
  (t === 'hard' ? 'Hard ' + label.replace('-', '–') : t === 'soft' ? 'A,' + (Number(label) - 11) : label) + ' vs dealer ' + d;

test('cellDetail equals reasonFor + snapshot for every cell of all 36 charts (10,800)', () => {
  const { app, why } = loadPage();
  assert.equal(snapshot.charts.length, 36);
  let n = 0, withNote = 0, without = 0;
  for (const snap of snapshot.charts) {
    const chart = app.buildChart(snap.rules);
    for (const t of TABLES) {
      for (const row of snap.tables[t]) {
        row.cells.forEach((want, j) => {
          const d = app.cellDetail(snap.rules, t, row.label, DEALERS[j]);
          const cell = chart[t].find((r) => r.label === row.label).cells[j];
          assert.equal(d.move, want.move, snap.id + ' ' + t + ' ' + row.label + ' vs ' + DEALERS[j]);
          assert.equal(d.reason, why.reasonFor({ table: t, row: row.label, dealer: DEALERS[j], cell }));
          assert.equal(d.note, want.note);
          assert.equal(d.title, displayTitle(t, row.label, DEALERS[j]));
          if (want.note === null) without++; else withNote++;
          n++;
        });
      }
    }
  }
  assert.equal(n, 36 * 300);
  assert.ok(withNote > 0 && without > 0);
});

test('cellDetail titles from the story; bad input -> null', () => {
  const { app } = loadPage();
  const r = app.DEFAULT_RULES;
  assert.equal(app.cellDetail(r, 'hard', '18-21', '10').title, 'Hard 18–21 vs dealer 10');
  assert.equal(app.cellDetail(r, 'soft', '18', '3').title, 'A,7 vs dealer 3');
  assert.equal(app.cellDetail(r, 'pairs', '8,8', 'A').title, '8,8 vs dealer A');
  assert.equal(app.cellDetail(r, 'hard', '4', '10'), null);
  assert.equal(app.cellDetail(r, 'hard', '8', '1'), null);
  assert.equal(app.cellDetail(r, 'nope', '8', '5'), null);
  assert.equal(app.cellDetail({ decks: '3' }, 'hard', '8', '5'), null);
});

test('panel markup for every cell of all 36 charts: reason text, label, note element only when not null', () => {
  const { app, why, doc } = loadPage();
  for (const snap of snapshot.charts) {
    app.setRules(snap.rules);
    for (const t of TABLES) {
      snap.tables[t].forEach((row, ri) => {
        row.cells.forEach((want, ci) => {
          assert.equal(app.openReason(t, ri, ci), true);
          const h = panel(doc, t).innerHTML;
          assert.equal(panel(doc, t).hidden, false);
          assert.equal(txt(h, 'data-reason'), why.reasonFor({ table: t, row: row.label, dealer: DEALERS[ci], cell: want }), snap.id);
          assert.equal(txt(h, 'data-title'), displayTitle(t, row.label, DEALERS[ci]));
          assert.ok(h.includes('data-move="' + want.move + '"'));
          assert.ok(h.includes('<span class="rp-word">' + WORDS[want.move] + '</span>'));
          assert.ok(h.includes('mi mi-' + WORDS[want.move].toLowerCase() + '"'));
          assert.equal([...h.matchAll(/data-note/g)].length, want.note === null ? 0 : 1);
          if (want.note !== null) assert.equal(txt(h, 'data-note'), want.note);
        });
      });
      app.closeReason(t, false);
    }
  }
});

test('click opens under that table, another cell replaces it, one panel per table, close button and Escape close', () => {
  const { app, doc } = loadPage();
  for (const t of TABLES) assert.equal(panel(doc, t).hidden, true);
  click(doc, btn(doc, 'hard', 11, 8));
  assert.equal(panel(doc, 'hard').hidden, false);
  assert.equal(panel(doc, 'soft').hidden, true);
  assert.match(panel(doc, 'hard').innerHTML, />Hard 18–21 vs dealer 10</);
  click(doc, btn(doc, 'hard', 4, 0));
  assert.equal([...panel(doc, 'hard').innerHTML.matchAll(/data-reason-card/g)].length, 1);
  assert.match(panel(doc, 'hard').innerHTML, />Hard 11 vs dealer 2</);
  click(doc, btn(doc, 'soft', 5, 1));
  assert.match(panel(doc, 'soft').innerHTML, />A,7 vs dealer 3</);
  assert.equal(panel(doc, 'hard').hidden, false, 'tables are independent');
  assert.match(panel(doc, 'hard').innerHTML, /Hard 11/);
  // close button
  click(doc, closeButton('hard'));
  assert.equal(panel(doc, 'hard').hidden, true);
  assert.equal(panel(doc, 'hard').innerHTML, '');
  assert.equal(doc.activeElement, btn(doc, 'hard', 4, 0), 'focus returns to the cell');
  // Escape
  const c = btn(doc, 'soft', 5, 1);
  const e = key(doc, c, 'Escape');
  assert.equal(e.prevented, true);
  assert.equal(panel(doc, 'soft').hidden, true);
  assert.equal(doc.activeElement, btn(doc, 'soft', 5, 1));
  assert.deepEqual(JSON.parse(JSON.stringify(app.getOpenReason())), { hard: null, soft: null, pairs: null });
  // no hover behaviour
  assert.ok(!/mouseover|mouseenter|:hover/.test(html.replace(/<script data-engine[\s\S]*?<\/script>/g, '')));
});

test('keyboard: one Tab stop per table, roving tabindex, arrows stop at edges, Enter and Space open', () => {
  const { doc } = loadPage();
  const stops = () => TABLES.map((t) => buttons(doc).filter((b) => b.attrs['data-table'] === t && b.attrs.tabindex === '0').length);
  assert.deepEqual(stops(), [1, 1, 1]);
  assert.equal(buttons(doc).length, 300);
  assert.equal(btn(doc, 'hard', 0, 0).attrs.tabindex, '0');
  assert.ok(!/class="scroll" tabindex/.test(doc.els.chart.innerHTML), 'scroll box is not a second Tab stop');
  let b = btn(doc, 'hard', 0, 0);
  key(doc, b, 'ArrowLeft'); key(doc, b, 'ArrowUp');
  assert.ok(doc.activeElement === null || doc.activeElement === b, 'edges: stays on the first cell');
  let e = key(doc, b, 'ArrowRight');
  assert.equal(e.prevented, true);
  assert.equal(doc.activeElement, btn(doc, 'hard', 0, 1));
  key(doc, doc.activeElement, 'ArrowDown');
  assert.equal(doc.activeElement, btn(doc, 'hard', 1, 1));
  assert.deepEqual(stops(), [1, 1, 1]);
  assert.equal(btn(doc, 'hard', 1, 1).attrs.tabindex, '0');
  assert.equal(btn(doc, 'hard', 0, 0).attrs.tabindex, '-1');
  key(doc, doc.activeElement, 'End');
  assert.equal(doc.activeElement, btn(doc, 'hard', 1, 9));
  key(doc, doc.activeElement, 'ArrowRight');
  assert.equal(doc.activeElement, btn(doc, 'hard', 1, 9));
  key(doc, doc.activeElement, 'Home');
  assert.equal(doc.activeElement, btn(doc, 'hard', 1, 0));
  for (let i = 0; i < 20; i++) key(doc, doc.activeElement, 'ArrowDown');
  assert.equal(doc.activeElement, btn(doc, 'hard', 11, 0));
  // Enter and Space open the focused cell
  e = key(doc, doc.activeElement, 'Enter');
  assert.equal(e.prevented, true);
  assert.match(panel(doc, 'hard').innerHTML, />Hard 18–21 vs dealer 2</);
  key(doc, btn(doc, 'hard', 11, 0), 'Escape');
  assert.equal(panel(doc, 'hard').hidden, true);
  key(doc, btn(doc, 'soft', 0, 3), ' ');
  assert.match(panel(doc, 'soft').innerHTML, />A,2 vs dealer 5</);
  // other tables keep their own single stop
  assert.deepEqual(stops(), [1, 1, 1]);
  assert.equal(btn(doc, 'soft', 0, 3).attrs.tabindex, '0');
});

test('rules change re-renders an open panel for the new rules: setRules and control events, all 36', () => {
  const { app, why, doc } = loadPage();
  app.openReason('soft', 5, 7);
  app.openReason('pairs', 6, 9);
  const change = doc.els['rule-panel'].handlers.change;
  for (const snap of snapshot.charts) {
    app.setRules(snap.rules);
    const want = snap.tables.soft.find((r) => r.label === '18').cells[7];
    const h = panel(doc, 'soft').innerHTML;
    assert.match(h, /data-move="/);
    assert.ok(h.includes('data-move="' + want.move + '"'), snap.id);
    assert.equal(txt(h, 'data-reason'), why.reasonFor({ table: 'soft', row: '18', dealer: '9', cell: want }));
    assert.equal(h.includes('data-note'), want.note !== null, snap.id);
    if (want.note !== null) assert.equal(txt(h, 'data-note'), want.note);
    const wp = snap.tables.pairs.find((r) => r.label === '8,8').cells[9];
    assert.ok(panel(doc, 'pairs').innerHTML.includes('data-move="' + wp.move + '"'), snap.id + ' pairs');
    assert.equal(panel(doc, 'pairs').innerHTML.includes('data-note'), wp.note !== null);
    assert.equal(panel(doc, 'hard').hidden, true);
  }
  const first = snapshot.charts[0];
  for (const f of ['decks', 'soft17', 'das', 'surrender']) change({ target: { type: 'radio', name: 'rule-' + f, value: first.rules[f] } });
  const want = first.tables.soft.find((r) => r.label === '18').cells[7];
  assert.ok(panel(doc, 'soft').innerHTML.includes('data-move="' + want.move + '"'));
  // roving position survives a re-render
  app.setRules(snapshot.charts[5].rules);
  key(doc, btn(doc, 'hard', 0, 0), 'ArrowRight');
  app.setRules(snapshot.charts[9].rules);
  assert.equal(btn(doc, 'hard', 0, 1).attrs.tabindex, '0');
  assert.equal(btn(doc, 'hard', 0, 0).attrs.tabindex, '-1');
});

test('chart cell markup is unchanged for S-07 and every cell has a text label', () => {
  const { app, doc } = loadPage();
  const h = doc.els.chart.innerHTML;
  assert.equal(h, app.renderChartHTML(app.buildChart(app.DEFAULT_RULES)));
  assert.equal([...h.matchAll(/<td class="m-(\w+)" data-move="(\w+)"><span class="cell"><span class="mi mi-(\w+)" aria-hidden="true"><\/span><span class="mw">(\w+)<\/span>/g)].length, 300);
  for (const b of buttons(doc)) assert.match(b.attrs['aria-label'], /vs dealer .+: (Hit|Stand|Double|Split|Surrender)\./);
  for (const t of TABLES) assert.ok(h.includes('id="reason-' + t + '"'));
});
