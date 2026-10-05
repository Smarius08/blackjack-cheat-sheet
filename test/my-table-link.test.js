// My-table link tests (story S-19). node:vm with stubbed document, location and history.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'prototype', 'index.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));
const DEFAULTS = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };

function makeDoc() {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', textContent: '', addEventListener() {},
    querySelectorAll() {
      return [...this.innerHTML.matchAll(/<input type="radio" name="([^"]+)" value="([^"]*)"/g)]
        .map((m) => ({ type: 'radio', name: m[1], value: m[2], checked: false }));
    } });
  return { els, getElementById: el };
}

function loadPage(url = '', opts = {}) {
  const u = new URL('file:///tmp/index.html' + url);
  const calls = { replace: [], push: [], errors: [] };
  const location = { get search() { return u.search; }, get hash() { return u.hash; }, get pathname() { return u.pathname; } };
  const history = {
    replaceState(s, t, rel) {
      calls.replace.push(rel);
      if (opts.throwOnReplace) throw new Error('SecurityError');
      const n = new URL(rel, u); u.search = n.search; u.hash = n.hash;
    },
    pushState() { calls.push.push(1); },
  };
  const doc = makeDoc();
  const ctx = vm.createContext({ document: doc, location, history, URLSearchParams, console: { error() { calls.errors.push(1); }, log() {}, warn() {} } });
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) vm.runInContext(m[2], ctx, { filename: m[1] });
  return { app: ctx.ChipyCheatSheet, doc, calls, u };
}

function chartMoves(doc) {
  const out = [];
  for (const m of doc.els.chart.innerHTML.matchAll(/data-move="(\w+)"/g)) out.push(m[1]);
  return out;
}
function snapMoves(snap) {
  return ['hard', 'soft', 'pairs'].flatMap((k) => snap.tables[k].flatMap((r) => r.cells.map((c) => c.move)));
}
const plain = (o) => ({ ...o });

test('all 36 combos round-trip: setRules -> URL -> fresh load -> same rules and snapshot chart', () => {
  assert.equal(snapshot.charts.length, 36);
  for (const snap of snapshot.charts) {
    const a = loadPage();
    a.app.setRules(snap.rules);
    const q = a.u.search;
    // Defaults are unchanged, so the URL stays empty; a bare load is the default chart.
    if (snap.id === 'decks=4-8|soft17=hits|das=yes|surrender=any') assert.equal(q, '');
    else assert.ok(q.startsWith('?'), snap.id);
    const b = loadPage(q);
    assert.deepEqual(plain(b.app.getRules()), snap.rules, snap.id);
    assert.deepEqual(chartMoves(b.doc), snapMoves(snap), snap.id);
    assert.equal(b.doc.els['rules-text'].textContent, snap.label);
  }
});

test('URL format uses D-023 values', () => {
  const a = loadPage();
  a.app.setRules({ decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'except_ace' });
  assert.equal(a.u.search, '?decks=4-8&soft17=hits&das=yes&surrender=except_ace');
});

test('bad links fall back per field, silently', () => {
  const cases = [
    ['', DEFAULTS],
    ['?decks=3', DEFAULTS],
    ['?soft17=', DEFAULTS],
    ['?surrender=except%20ace', DEFAULTS],
    ['?das=yes&das=no', DEFAULTS],
    ['?__proto__=x', DEFAULTS],
    ['?decks=1&soft17=', { ...DEFAULTS, decks: '1' }],
    ['?decks=2&das=no&das=no&surrender=none', { decks: '2', soft17: 'hits', das: 'yes', surrender: 'none' }],
    ['?decks=%E0%A4%A&soft17=stands', { ...DEFAULTS, soft17: 'stands' }],
    ['?constructor=1&toString=2&decks=constructor', DEFAULTS],
    ['?decks=1&decks=1', DEFAULTS],
    ['?DECKS=1', DEFAULTS],
  ];
  for (const [q, want] of cases) {
    const p = loadPage(q);
    assert.deepEqual(plain(p.app.getRules()), want, q);
    assert.equal(p.calls.errors.length, 0, q);
    assert.equal(p.calls.replace.length, 0, q);
    assert.equal(Object.prototype.polluted, undefined);
  }
  assert.equal(({}).x, undefined);
});

test('rulesFromQuery is pure and tolerant of odd input', () => {
  const { app } = loadPage();
  for (const v of [undefined, null, 5, '??&&==', '?decks']) assert.deepEqual(plain(app.rulesFromQuery(v)), DEFAULTS);
  assert.deepEqual(plain(app.rulesFromQuery('?decks=2&soft17=stands&das=no&surrender=none')),
    { decks: '2', soft17: 'stands', das: 'no', surrender: 'none' });
});

test('a change calls replaceState once; none when unchanged; never pushState', () => {
  const p = loadPage();
  p.app.setRules({ ...DEFAULTS, decks: '1' });
  assert.equal(p.calls.replace.length, 1);
  assert.equal(p.calls.replace[0], '?decks=1&soft17=hits&das=yes&surrender=any');
  p.app.setRules({ ...DEFAULTS, decks: '1' });
  assert.equal(p.calls.replace.length, 1);
  p.app.setRules({ ...DEFAULTS, decks: '2', das: 'no' });
  assert.equal(p.calls.replace.length, 2);
  assert.equal(p.calls.push.length, 0);
  assert.equal(p.calls.errors.length, 0);
});

test('URL already matching: no replaceState on change back to linked rules', () => {
  const p = loadPage('?decks=1&soft17=hits&das=yes&surrender=any');
  assert.equal(p.calls.replace.length, 0);
  p.app.setRules({ ...DEFAULTS, decks: '1' });
  assert.equal(p.calls.replace.length, 0);
});

test('throwing replaceState does not stop the chart', () => {
  const p = loadPage('', { throwOnReplace: true });
  const snap = snapshot.charts.find((c) => c.id === 'decks=1|soft17=stands|das=no|surrender=none');
  assert.doesNotThrow(() => p.app.setRules(snap.rules));
  assert.equal(p.calls.replace.length, 1);
  assert.deepEqual(chartMoves(p.doc), snapMoves(snap));
  assert.equal(p.calls.errors.length, 0);
});

test('extra params and hash survive; only the four rule keys are rewritten', () => {
  const p = loadPage('?utm=a&decks=1&x=%20y#sec');
  assert.equal(p.app.getRules().decks, '1');
  p.app.setRules({ ...DEFAULTS, decks: '2' });
  assert.equal(p.u.search, '?utm=a&x=%20y&decks=2&soft17=hits&das=yes&surrender=any');
  assert.equal(p.u.hash, '#sec');
  assert.equal(p.calls.replace[0].endsWith('#sec'), true);
  assert.equal(p.app.queryFromRules(DEFAULTS, '?a=1&a=2&decks=1&b').startsWith('?a=1&a=2&b&decks=4-8'), true);
});
