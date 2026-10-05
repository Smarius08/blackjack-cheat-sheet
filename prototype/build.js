// Prototype builder (story S-07).
//
// Reads prototype/src/index.template.html, inlines the engine files unchanged
// (in order: strategy_table, explanation_writer, chart, why) as <script> blocks
// and the five Trainer move icons as CSS data URIs, then writes
// prototype/index.html. Node only, deterministic (same input -> same bytes).
//
// Usage: node prototype/build.js

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(__dirname, 'src', 'index.template.html');
const OUT_FILE = path.join(__dirname, 'index.html');

const ENGINE_FILES = [
  'engine/vendor/strategy_table.js',
  'engine/vendor/explanation_writer.js',
  'engine/chart.js',
  'engine/why.js',
];
const ICONS = ['hit', 'stand', 'double', 'split', 'surrender'];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function build() {
  let tpl = read('prototype/src/index.template.html');
  const blocks = ENGINE_FILES.map((f) => {
    const src = read(f);
    // No engine file contains "</script" today; refuse to build if one ever does.
    if (/<\/script/i.test(src)) throw new Error(f + ' contains "</script"; cannot inline raw');
    return '<script data-engine="' + f + '">\n' + src + (src.endsWith('\n') ? '' : '\n') + '</script>';
  });
  const iconCss = ICONS.map((n) => {
    const b64 = fs.readFileSync(path.join(ROOT, 'prototype/src/icons/action-' + n + '.svg')).toString('base64');
    // CSS mask + background-color so each icon takes its move's exact text colour (D-079)
    const u = 'url("data:image/svg+xml;base64,' + b64 + '")';
    return '.mi-' + n + ' { -webkit-mask-image: ' + u + '; mask-image: ' + u + '; }';
  }).join('\n');
  tpl = tpl.replace('/*@@ICON_CSS@@*/', () => iconCss);
  tpl = tpl.replace('<!--@@ENGINE_SCRIPTS@@-->', () => blocks.join('\n'));
  return tpl.replace(/\r/g, '').replace(/\n*$/, '\n');
}

if (require.main === module) {
  fs.writeFileSync(OUT_FILE, build());
  console.log('wrote ' + path.relative(ROOT, OUT_FILE));
}

module.exports = { build, ENGINE_FILES, ICONS, OUT_FILE };
