// Print tests (story S-11). node:vm with a stubbed document and window.print.
// Print markup comes from buildChart(rules); every cell is compared with the 36-chart snapshot.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'prototype', 'index.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));
const WORDS = { HIT: 'Hit', STAND: 'Stand', DOUBLE: 'Double', SPLIT: 'Split', SURRENDER: 'Surrender' };
const LETTERS = { HIT: 'H', STAND: 'S', DOUBLE: 'D', SPLIT: 'P', SURRENDER: 'R' };
const ICON = { HIT: 'hit', STAND: 'stand', DOUBLE: 'double', SPLIT: 'split', SURRENDER: 'surrender' };
const POCKET_LEGEND = 'H Hit · S Stand · D Double · P Split · R Surrender';
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function loadPage() {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', addEventListener() {}, querySelectorAll() { return []; } });
  const flagLog = [];
  const dataset = {};
  const document = { getElementById: el, documentElement: { dataset } };
  const listeners = {};
  const ctx = vm.createContext({ document });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.printCalls = [];
  ctx.print = () => ctx.printCalls.push(dataset.print === undefined ? null : dataset.print);
  ctx.addEventListener = (n, fn) => { (listeners[n] = listeners[n] || []).push(fn); };
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) vm.runInContext(m[2], ctx, { filename: m[1] });
  return { app: ctx.ChipyCheatSheet, els, dataset, ctx, listeners, flagLog };
}

// Rows of one section: { label, cells: [{ move, text }] }
function section(markup, key) {
  const m = markup.match(new RegExp('<section class="(?:pf|pc)-sec" data-table="' + key + '">[\\s\\S]*?</section>'));
  assert.ok(m, 'section ' + key);
  return [...m[0].matchAll(/<tr data-row="([^"]*)"><th scope="row">([^<]*)<\/th>([\s\S]*?)<\/tr>/g)].map((r) => ({
    label: unesc(r[1]),
    cells: [...r[3].matchAll(/<td class="m-(\w+)" data-move="(\w+)">([\s\S]*?)<\/td>/g)].map((c) => ({ cls: c[1], move: c[2], inner: c[3] })),
  }));
}
const textOf = (s) => unesc(s.replace(/<[^>]*>/g, ''));

test('full page: title, rules sentence = snapshot label, legend, three tables, word + icon per cell (36 rule sets)', () => {
  const { app } = loadPage();
  assert.equal(snapshot.charts.length, 36);
  for (const snap of snapshot.charts) {
    const out = app.renderPrintFullHTML(snap.rules);
    assert.match(out, /<h1 class="pf-title" data-title>Blackjack Cheat Sheet<\/h1>/);
    assert.equal(textOf(out.match(/<p class="pf-rules" data-rules>([\s\S]*?)<\/p>/)[1]), snap.label);
    const legend = out.match(/<ul class="pf-legend" data-legend>([\s\S]*?)<\/ul>/)[1];
    for (const w of Object.values(WORDS)) assert.ok(legend.includes(w), 'legend ' + w);
    for (const key of ['hard', 'soft', 'pairs']) {
      const rows = section(out, key);
      const want = snap.tables[key];
      assert.equal(rows.length, want.length, snap.id + ' ' + key + ' rows');
      rows.forEach((r, i) => {
        assert.equal(r.label, want[i].label);
        assert.equal(r.cells.length, 10);
        r.cells.forEach((c, j) => {
          const mv = want[i].cells[j].move;
          assert.equal(c.move, mv, snap.id + ' ' + key + ' ' + r.label + ' col ' + j);
          assert.equal(c.cls, ICON[mv]);
          assert.ok(c.inner.includes('<span class="mw">' + WORDS[mv] + '</span>'));
          assert.ok(c.inner.includes('mi mi-' + ICON[mv]), 'icon');
        });
      });
    }
    // Soft rows are shown as A,2 .. A,9 (D-049)
    const soft = [...out.match(/data-table="soft">[\s\S]*?<\/section>/)[0].matchAll(/<th scope="row">([^<]*)<\/th>/g)].map((m) => m[1]);
    assert.deepEqual(soft, ['A,2', 'A,3', 'A,4', 'A,5', 'A,6', 'A,7', 'A,8', 'A,9']);
  }
});

test('pocket card: Hard in panel 1, Soft + Pairs in panel 2, one letter per cell, legend, rules sentence (36 rule sets)', () => {
  const { app } = loadPage();
  assert.deepEqual({ ...app.POCKET_LETTER }, LETTERS);
  for (const snap of snapshot.charts) {
    const out = app.renderPocketHTML(snap.rules);
    const panels = out.split('<div class="pc-panel ').slice(1);
    assert.equal(panels.length, 2);
    const [p1, p2] = panels;
    assert.ok(p1.includes('data-table="hard"') && !p1.includes('data-table="soft"') && !p1.includes('data-table="pairs"'));
    assert.ok(p2.includes('data-table="soft"') && p2.includes('data-table="pairs"') && !p2.includes('data-table="hard"'));
    for (const p of panels) {
      assert.equal(textOf(p.match(/<p class="pc-rules" data-rules>([\s\S]*?)<\/p>/)[1]), snap.label);
      assert.equal(textOf(p.match(/<p class="pc-legend" data-legend>([\s\S]*?)<\/p>/)[1]), POCKET_LEGEND);
    }
    for (const [key, p] of [['hard', p1], ['soft', p2], ['pairs', p2]]) {
      const rows = section(p, key);
      const want = snap.tables[key];
      assert.equal(rows.length, want.length);
      rows.forEach((r, i) => {
        assert.equal(r.label, want[i].label);
        assert.equal(r.cells.length, 10);
        r.cells.forEach((c, j) => {
          const mv = want[i].cells[j].move;
          assert.equal(c.move, mv);
          assert.equal(c.inner, LETTERS[mv], 'exactly one letter, no markup');
        });
      });
    }
  }
});

test('markup is rebuilt on every rules change: never stale', () => {
  const { app, els } = loadPage();
  app.init();
  const a = snapshot.charts[0], b = snapshot.charts[35];
  assert.notEqual(a.label, b.label);
  app.setRules(a.rules);
  assert.equal(els['print-full'].innerHTML, app.renderPrintFullHTML(a.rules));
  assert.equal(els['print-pocket'].innerHTML, app.renderPocketHTML(a.rules));
  assert.ok(els['print-full'].innerHTML.includes(a.label));
  app.setRules(b.rules);
  assert.equal(els['print-full'].innerHTML, app.renderPrintFullHTML(b.rules));
  assert.equal(els['print-pocket'].innerHTML, app.renderPocketHTML(b.rules));
  assert.ok(els['print-pocket'].innerHTML.includes(b.label) && !els['print-pocket'].innerHTML.includes(a.label));
});

test('printSheet sets the flag, refreshes markup, calls window.print; afterprint clears the flag', () => {
  const { app, dataset, ctx, listeners, els } = loadPage();
  app.init();
  app.setRules(snapshot.charts[7].rules);
  els['print-full'].innerHTML = 'stale';
  assert.equal(app.printSheet('pocket'), true);
  assert.deepEqual(ctx.printCalls, ['pocket']);
  assert.equal(els['print-full'].innerHTML, app.renderPrintFullHTML(snapshot.charts[7].rules));
  assert.equal(dataset.print, 'pocket');
  (listeners.afterprint || []).forEach((fn) => fn());
  assert.equal(dataset.print, undefined);
  assert.equal(app.printSheet('full'), true);
  assert.deepEqual(ctx.printCalls, ['pocket', 'full']);
  (listeners.afterprint || []).forEach((fn) => fn());
  assert.equal(dataset.print, undefined);
  assert.equal(app.printSheet('other'), false);
  assert.ok((listeners.beforeprint || []).length >= 1, 'beforeprint rebuilds markup for Ctrl/Cmd+P');
});

test('printSheet without window.print does not leave the flag set', () => {
  const { app, dataset, ctx } = loadPage();
  app.init();
  ctx.print = undefined;
  assert.equal(app.printSheet('full'), false);
  assert.equal(dataset.print, undefined);
});

test('page has both buttons and the print CSS: sheets hidden on screen, chrome hidden in print, tints kept, named pocket page', () => {
  assert.match(html, /id="print-full-btn">Print chart<\/button>/);
  assert.match(html, /id="print-pocket-btn">Print pocket card<\/button>/);
  assert.match(html, /\.print-sheet \{ display: none; \}/);
  assert.match(html, /@page \{ size: portrait; margin: 10mm; \}/);
  assert.match(html, /@page pocket \{ size: landscape; margin: 8mm; \}/);
  const print = html.slice(html.indexOf('@media print'));
  assert.match(print, /\.shell, #rule-panel, #mode-switch, #table-mode, \.reason-slot, button \{ display: none !important; \}/);
  assert.match(print, /print-color-adjust: exact/);
  assert.match(print, /html\[data-print="pocket"\] \.print-pocket \{ display: flex; flex-direction: column; justify-content: center; height: 100vh; page: pocket; \}/);
  assert.match(print, /html\[data-print="pocket"\] \.print-full \{ display: none; \}/);
  assert.match(print, /\.pc-sheet \{[^}]*width: 210mm; height: 148mm/);
  assert.match(print, /\.pc-panel \{[^}]*width: 105mm; height: 148mm/);
  assert.match(print, /border-left: 0\.3mm dashed/);
  assert.match(print, /\.pc-t td \{ font-size: 9pt; font-weight: 900; color: #000;/);
});
