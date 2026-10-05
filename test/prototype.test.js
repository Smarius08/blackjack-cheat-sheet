// Prototype tests (story S-07).
//
// prototype/index.html must be exactly what prototype/build.js writes now,
// inline the engine files unchanged, pin the five Trainer icons by SHA-256,
// make no network requests, and show the snapshot chart for the default rules
// (D-045). The page script runs in node:vm without a DOM.
//
// Icon provenance (D-056): copied unchanged from
// ../chipy-blackjack-trainer/mockups/assets/action-*.svg; provenance: b799170
// (2026-09-17), last commit touching these five files.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const { build, ENGINE_FILES, ICONS } = require(path.join(ROOT, 'prototype', 'build.js'));
const html = fs.readFileSync(path.join(ROOT, 'prototype', 'index.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'snapshot', 'charts-36.json'), 'utf8'));

const ICON_SHA256 = {
  hit: '844f837eff55d002e39f01f090995b8c05fc6e77905cda958f43911bfe4d6c02',
  stand: 'b3c610e0b9ba45265c3da63a15f9a22932c3421b35d13782989bd3f8b3cabb44',
  double: '40e42dbd81aa8d2700a73612088c6683cbb13f403594943afd41a9f5c349f0cf',
  split: '4d872f8c5abab779da48d034719c5c7b9add5c7d82c12a405461951d838b1854',
  surrender: '7a0ddce61624084242e28959255f0de6e1c3db740590b4c28290541d0362a25a',
};
const WORDS = { HIT: 'Hit', STAND: 'Stand', DOUBLE: 'Double', SPLIT: 'Split', SURRENDER: 'Surrender' };
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function scripts() {
  const out = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push({ attrs: m[1], body: m[2] });
  return out;
}

test('index.html is up to date with build.js (byte for byte), LF, one trailing newline', () => {
  assert.ok(build() === html, 'prototype/index.html is stale: run `node prototype/build.js`');
  assert.ok(html.endsWith('</html>\n') && !html.endsWith('\n\n'));
  assert.ok(!html.includes('\r'));
  assert.match(html, /<meta charset="utf-8">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test('engine files are inlined unchanged and in order', () => {
  const s = scripts();
  assert.equal(s.length, ENGINE_FILES.length + 1);
  ENGINE_FILES.forEach((f, i) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/<\/script/i.test(src), f + ' must not contain </script');
    assert.ok(s[i].attrs.includes(f));
    const body = s[i].body.replace(/^\n/, '');
    assert.ok(body === src || body === src + '\n', f + ' not byte-identical');
  });
});

test('icons are pinned by SHA-256 and embedded as the same bytes', () => {
  for (const n of ICONS) {
    const buf = fs.readFileSync(path.join(ROOT, 'prototype', 'src', 'icons', 'action-' + n + '.svg'));
    assert.equal(sha(buf), ICON_SHA256[n], 'icon ' + n);
    assert.ok(html.includes('.mi-' + n + ' { -webkit-mask-image: url("data:image/svg+xml;base64,' + buf.toString('base64') + '"); mask-image: url("data:image/svg+xml;base64,' + buf.toString('base64') + '"); }'));
  }
});

test('no network: no http(s) src/href/url(), no fetch, no external link/script (one allowed anchor, D-082)', () => {
  const ALLOWED = '<a class="sa-link" href="https://chipy.com/tools/blackjack-calculator">';
  const ALLOWED_URL = 'https://chipy.com/tools/blackjack-calculator';
  // markup form is built in the page script as href="' + CALC_HREF + '"; the URL itself appears once as a constant
  const stripped = html
    .split(ALLOWED).join('')
    .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');
  assert.ok(!/\b(src|href)\s*=\s*["']?\s*(https?:)?\/\//i.test(stripped));
  assert.ok(!/url\(\s*["']?\s*(https?:)?\/\//i.test(stripped));
  assert.ok(!/@import/i.test(stripped));
  assert.ok(!/fetch\s*\(/.test(stripped));
  assert.ok(!/XMLHttpRequest/.test(stripped));
  assert.ok(!/<link\b/i.test(stripped));
  assert.ok(!/<script[^>]*\bsrc=/i.test(stripped));
  // no http(s) URL anywhere except the one allowed Calculator URL and the SVG xmlns
  const urls = (html.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '').match(/https?:\/\/[^\s"'<>)]+/g) || []);
  assert.ok(urls.length > 0 && urls.every((u) => u === ALLOWED_URL), 'unexpected URL: ' + urls.filter((u) => u !== ALLOWED_URL));
});

function loadPage() {
  const ctx = vm.createContext({});
  ctx.window = ctx;
  ctx.globalThis = ctx;
  for (const s of scripts()) vm.runInContext(s.body, ctx, { filename: s.attrs });
  return ctx.ChipyCheatSheet;
}

test('default chart on load equals snapshot decks=4-8|soft17=hits|das=yes|surrender=any', () => {
  const app = loadPage();
  assert.deepEqual({ ...app.DEFAULT_RULES }, { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' });
  const snap = snapshot.charts.find((c) => c.id === 'decks=4-8|soft17=hits|das=yes|surrender=any');
  assert.ok(snap);
  const chart = app.buildChart(app.DEFAULT_RULES);
  const page = app.renderChartHTML(chart);

  for (const key of ['hard', 'soft', 'pairs']) {
    const tbl = page.match(new RegExp('<table class="chart" data-table="' + key + '">([\\s\\S]*?)</table>'));
    assert.ok(tbl, key + ' table');
    const rows = [...tbl[1].matchAll(/<tr data-row="([^"]*)"><th scope="row">([^<]*)<\/th>([\s\S]*?)<\/tr>/g)];
    assert.equal(rows.length, snap.tables[key].length);
    rows.forEach((r, i) => {
      const want = snap.tables[key][i];
      assert.equal(r[1], want.label);
      assert.equal(r[2], app.displayRowLabel(key, want.label));
      const cells = [...r[3].matchAll(/<td class="m-(\w+)" data-move="(\w+)"><span class="cell"><span class="mi mi-(\w+)" aria-hidden="true"><\/span><span class="mw">(\w+)<\/span>/g)];
      assert.equal(cells.length, 10);
      cells.forEach((c, j) => {
        const move = want.cells[j].move;
        assert.equal(c[2], move);
        assert.equal(c[4], WORDS[move], key + ' ' + want.label + ' col ' + j);
        assert.equal(c[1], WORDS[move].toLowerCase());
        assert.equal(c[3], WORDS[move].toLowerCase());
      });
    });
  }
  assert.equal([...page.matchAll(/<td /g)].length, (12 + 8 + 10) * 10);
});

test('soft rows are shown as A,2 .. A,9; no engine codes on the page', () => {
  const app = loadPage();
  const labels = ['13', '14', '15', '16', '17', '18', '19', '20'].map((l) => app.displayRowLabel('soft', l));
  assert.deepEqual(labels, ['A,2', 'A,3', 'A,4', 'A,5', 'A,6', 'A,7', 'A,8', 'A,9']);
  assert.equal(app.displayRowLabel('hard', '18-21'), '18-21');
  assert.equal(app.displayRowLabel('pairs', 'A,A'), 'A,A');
  const page = app.renderChartHTML(app.buildChart(app.DEFAULT_RULES)) + app.renderLegendHTML();
  assert.ok(!/>(Dh|Ds|Rh|Rs|Rp|Rpa|Ph|Pd|Ps)</.test(page));
  for (const w of Object.values(WORDS)) assert.ok(app.renderLegendHTML().includes('>' + w + '</li>'));
});

test('shell matches Quiz E53 values', () => {
  assert.match(html, /max-width: 852px/);
  assert.match(html, /border-radius: 16px/);
  assert.match(html, /--shadow-shell: 0 -1px 20px 2px rgba\(0, 0, 0, 0\.1\)/);
  assert.match(html, /\.shell-header \{ background: var\(--band\); padding: 24px 20px 20px; \}/);
  assert.match(html, /--band: #f9fafa/);
  assert.match(html, /\.shell-header h1 \{[^}]*color: var\(--lime-dark\)/);
  assert.match(html, /--heading: #404040/);
  assert.match(html, /--lime-dark: #859c2e/);
  assert.match(html, /<h1>Blackjack Cheat Sheet<\/h1>/);
  assert.match(html, /position: sticky; left: 0/);
});
