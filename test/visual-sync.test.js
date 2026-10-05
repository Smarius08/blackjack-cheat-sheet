'use strict';
// S-21 (D-076, D-077, D-078): CSS token checks for the Figma visual sync. Style only; no behaviour.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'prototype', 'index.html'), 'utf8');
const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));

test('font, title and move palette follow the signed-off Figma', () => {
  assert.match(css, /font-family: Roboto, system-ui/);
  assert.match(css, /--heading: #404040/);
  assert.match(css, /\.shell-header h1 \{[^}]*color: var\(--heading\)/);
  assert.match(css, /--hit: #ffffff; --stand: #bfbfbf; --double: #c4db11; --split: #859c2e; --surrender: #404040/);
  assert.match(css, /\.m-split \{[^}]*color: #1a1d22/);
  assert.match(css, /\.m-surrender \{[^}]*color: #fff/);
});

test('changed marker is a dashed inner outline plus a 12px corner triangle, light on Surrender; no text badge', () => {
  assert.match(css, /\.cell-hit\[data-changed\]::after \{[^}]*width: 12px; height: 12px/);
  assert.match(css, /\.m-surrender \.cell-hit\[data-changed\]::after \{ background: #fff; \}/);
  assert.match(css, /\.m-surrender \.cell-hit\[data-changed\] \{ outline-color: #fff; \}/);
  assert.ok(!/\.chg\b/.test(css));
  assert.match(css, /\.chart td \{ height: 52px;/);
  assert.ok(!/\.chart td \{ height: 54px/.test(css));
});

test('unselected toggle text is #5e6166 (D-078); print title #404040, grid 0.75pt #5e6166', () => {
  assert.match(css, /\.toggle-opt span, \.mode-btn \{[^}]*color: var\(--body\)/);
  assert.match(css, /--body: #5e6166/);
  const print = css.slice(css.indexOf('@media print'));
  assert.match(print, /\.pf-title \{[^}]*color: #404040/);
  assert.match(print, /table\.pf \{[^}]*border-spacing: 0\.75pt; background: #5e6166/);
  assert.match(print, /\.pc-t th, \.pc-t td \{[^}]*border: 0\.75pt solid #5e6166/);
  assert.match(print, /\.pc-title \{[^}]*text-align: left;[^}]*color: #404040/);
});
