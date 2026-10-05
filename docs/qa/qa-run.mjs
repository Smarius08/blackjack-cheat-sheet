// S-12 + S-20 + S-21 QA run for prototype/index.html (file://). Reports only; edits nothing but docs/qa/screenshots/*.png and docs/qa/visual/*.png.
//
// Re-run:  node docs/qa/qa-run.mjs
//   PLAYWRIGHT_CORE_DIR  folder that contains node_modules/playwright-core (D-065: install it OUTSIDE the repo)
//                        default: the session scratch folder below
//   CHROME_PATH          default: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
//   QA_TABLE_CLICKS      "one" (default: one full rule set, 350 answers, by real clicks)
//                        or "all" (all 36 sets x 350 answers by real clicks; slow)
// Prints a pass/fail table + findings to stdout. Exit code 1 if any row fails.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import zlib from 'node:zlib';

const PW_DIR = process.env.PLAYWRIGHT_CORE_DIR ||
  '/private/tmp/claude-501/-Users-mariussolis-blackjack-cheat-sheet/03210098-060c-4517-a3e6-fddb3554c962/scratchpad/qa';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TABLE_CLICKS = process.env.QA_TABLE_CLICKS || 'one';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const PAGE = path.join(repo, 'prototype', 'index.html');
const URL0 = pathToFileURL(PAGE).href;
const SHOTS = path.join(here, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const VIS = path.join(here, 'visual');
fs.mkdirSync(VIS, { recursive: true });
const FIG = path.join(repo, 'docs', 'figma');
const snap = JSON.parse(fs.readFileSync(path.join(repo, 'snapshot', 'charts-36.json'), 'utf8')).charts;
const { chromium } = createRequire(path.join(PW_DIR, 'package.json'))('playwright-core');

const TABLES = ['hard', 'soft', 'pairs'];
const WORD = { HIT: 'Hit', STAND: 'Stand', DOUBLE: 'Double', SPLIT: 'Split', SURRENDER: 'Surrender' };
const LETTER = { HIT: 'H', STAND: 'S', DOUBLE: 'D', SPLIT: 'P', SURRENDER: 'R' };
const D = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const rows = [];       // check results
const findings = [];   // {sev, text}
const row = (n, name, pass, ev) => { rows.push({ n, name, pass, ev }); console.log(`[${pass ? 'PASS' : 'FAIL'}] ${n} ${name} - ${ev}`); };
const find = (sev, text) => findings.push({ sev, text });

// ---------- hands (independent mapping, not taken from the app) ----------
const HANDS = [];
for (let t = 5; t <= 21; t++) HANDS.push({ table: 'hard', text: String(t), key: 'hard:' + t, row: t <= 7 ? '5-7' : t >= 18 ? '18-21' : String(t) });
for (let n = 2; n <= 9; n++) HANDS.push({ table: 'soft', text: 'A,' + n, key: 'soft:A,' + n, row: String(11 + n) });
for (const p of ['2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '9,9', '10,10', 'A,A']) HANDS.push({ table: 'pairs', text: p, key: 'pairs:' + p, row: p });

// ---------- minimal PDF text extractor (Chrome/Skia Type3 fonts + ToUnicode); no dependency ----------
// Minimal text extractor for Chrome/Skia PDFs: inflates streams, reads ToUnicode CMaps, decodes hex strings in Tj/TJ.
function pdfText(buf) {
  const s = buf.toString('latin1');
  const objs = {};
  const re = /(\d+) 0 obj([\s\S]*?)endobj/g; let m;
  while ((m = re.exec(s))) {
    const body = m[2]; const si = body.indexOf('stream');
    let data = null;
    if (si >= 0) {
      const dict = body.slice(0, si);
      let st = si + 6; if (body[st] === '\r') st++; if (body[st] === '\n') st++;
      const en = body.lastIndexOf('endstream');
      let raw = Buffer.from(body.slice(st, en), 'latin1');
      if (/FlateDecode/.test(dict)) { try { raw = zlib.inflateSync(raw); } catch { raw = Buffer.alloc(0); } }
      data = raw.toString('latin1');
      objs[m[1]] = { dict, data };
    } else objs[m[1]] = { dict: body, data: null };
  }
  // font resource name -> ToUnicode map
  const cmaps = {}; // objnum of font -> Map
  for (const [n, o] of Object.entries(objs)) {
    const t = /\/ToUnicode (\d+) 0 R/.exec(o.dict || '');
    if (t && objs[t[1]]?.data) {
      const map = new Map(); const d = objs[t[1]].data;
      for (const b of d.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) for (const x of b[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) map.set(parseInt(x[1], 16), String.fromCharCode(...x[2].match(/.{4}/g).map(h => parseInt(h, 16))));
      for (const b of d.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) for (const x of b[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) { const a = parseInt(x[1], 16), z = parseInt(x[2], 16), u = parseInt(x[3], 16); for (let i = a; i <= z; i++) map.set(i, String.fromCharCode(u + i - a)); }
      cmaps[n] = map;
    }
  }
  let out = '';
  for (const o of Object.values(objs)) {
    if (!o.data || !/BT/.test(o.data) || o.data.length < 20) continue;
    // resource name -> font obj via page resources (approximate: any /Fxx n 0 R in all dicts)
    const fontOf = {};
    for (const x of s.matchAll(/\/(F\d+)\s+(\d+) 0 R/g)) fontOf[x[1]] = x[2];
    let cur = null;
    for (const tok of o.data.matchAll(/\/(F\d+)\s+[\d.]+\s+Tf|\[((?:<[0-9a-fA-F]*>|[-\d.\s])*)\]\s*TJ|<([0-9a-fA-F]*)>\s*Tj|(T\*|Tm|ET)/g)) {
      if (tok[1]) cur = cmaps[fontOf[tok[1]]] || null;
      else if (tok[2] !== undefined || tok[3] !== undefined) {
        const hexes = tok[2] !== undefined ? [...tok[2].matchAll(/<([0-9a-fA-F]*)>/g)].map(x => x[1]) : [tok[3]];
        for (const h of hexes) for (const c of h.match(/../g) || []) out += cur?.get(parseInt(c, 16)) ?? '?';
      } else if (tok[4]) out += ' ';
    }
    out += '\n';
  }
  return out;
}

// ---------- browser + collectors ----------
const consoleMsgs = [], requests = [], pageErrors = [];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
async function newPage(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('console', m => consoleMsgs.push({ type: m.type(), text: m.text() }));
  p.on('pageerror', e => pageErrors.push(String(e)));
  p.on('request', r => requests.push(r.url()));
  return p;
}
const rl = (p, name, val) => p.locator('#rule-panel label', { has: p.locator(`input[name="${name}"][value="${val}"]`) });
async function clickRules(p, r) {
  await rl(p, 'rule-decks', r.decks).click();
  await rl(p, 'rule-soft17', r.soft17).click();
  await rl(p, 'rule-das', r.das).click();
  await rl(p, 'rule-surrender', r.surrender).click();
}
// Read full-chart DOM -> compare with snapshot chart. Returns list of mismatch strings.
async function chartDiff(p, c) {
  const dom = await p.evaluate(() => {
    const o = {};
    for (const t of ['hard', 'soft', 'pairs']) {
      o[t] = [...document.querySelectorAll(`#chart-${t} tbody tr`)].map(tr => ({
        row: tr.dataset.row,
        cells: [...tr.querySelectorAll('td')].map(td => ({
          move: td.dataset.move,
          word: td.querySelector('.mw')?.textContent.trim(),
          icon: [...(td.querySelector('.mi')?.classList || [])].find(x => x.startsWith('mi-') && x !== 'mi'),
          dealer: td.querySelector('.cell-hit')?.dataset.dealer,
          erow: td.querySelector('.cell-hit')?.dataset.erow,
        })),
      }));
    }
    o.sentence = document.querySelector('#rules-text')?.textContent.trim();
    o.rules = window.ChipyCheatSheet.getRules();
    return o;
  });
  const bad = [];
  if (dom.sentence !== c.label) bad.push(`sentence "${dom.sentence}" != "${c.label}"`);
  for (const k of Object.keys(c.rules)) if (dom.rules[k] !== c.rules[k]) bad.push(`getRules.${k}=${dom.rules[k]} != ${c.rules[k]}`);
  for (const t of TABLES) {
    const exp = c.tables[t];
    if (dom[t].length !== exp.length) { bad.push(`${t}: ${dom[t].length} rows != ${exp.length}`); continue; }
    exp.forEach((er, i) => {
      const dr = dom[t][i];
      if (dr.row !== er.label) bad.push(`${t} row ${i} "${dr.row}" != "${er.label}"`);
      er.cells.forEach((ec, j) => {
        const d = dr.cells[j];
        if (!d) { bad.push(`${t} ${er.label} col ${j} missing`); return; }
        if (d.move !== ec.move || d.word !== WORD[ec.move] || d.icon !== 'mi-' + ec.move.toLowerCase() || d.dealer !== D[j] || d.erow !== er.label)
          bad.push(`${t} ${er.label} vs ${D[j]}: got ${d.move}/${d.word}/${d.icon}, want ${ec.move}`);
      });
    });
  }
  return bad;
}

// =====================================================================
// CHECK 1: 36 sets by real rule-panel clicks at 1280
// =====================================================================
const p1 = await newPage(1280, 900);
await p1.goto(URL0);
let c1bad = [], c1cells = 0;
for (const c of snap) {
  await clickRules(p1, c.rules);
  const bad = await chartDiff(p1, c);
  c1cells += 30 * 10 - 0; // 30 rows x 10 cols
  c1bad.push(...bad.map(b => c.id + ': ' + b));
}
row(1, '36 rule sets, real rule-panel clicks @1280: every cell (move word + icon + data-move) and rules sentence == snapshot',
  c1bad.length === 0, `${snap.length} sets x 30 rows x 10 dealers = ${snap.length * 300} cells compared, ${c1bad.length} mismatches` + (c1bad.length ? ' e.g. ' + c1bad.slice(0, 3).join(' ; ') : ''));
if (c1bad.length) find('high', 'Check 1 mismatches: ' + c1bad.slice(0, 5).join(' ; '));

// =====================================================================
// CHECK 2: table mode
// =====================================================================
async function resultOf(p) {
  return p.evaluate(() => {
    const r = document.querySelector('#table-result [data-result]');
    if (!r) return null;
    return { move: r.querySelector('.sa-rec-move')?.dataset.move, word: r.querySelector('.sa-rec-word')?.textContent.trim(),
      hand: r.querySelector('[data-hand]')?.textContent.trim(), dealer: r.querySelector('[data-dealer-shown]')?.textContent.trim(),
      noteText: r.querySelector('.sa-note, [data-note]')?.textContent.trim() || null };
  });
}
const p2 = await newPage(1280, 900);
await p2.goto(URL0);
await p2.locator('#mode-switch').getByText('Table mode').click();
const clickSets = TABLE_CLICKS === 'all' ? snap : [snap.find(c => c.rules.decks === '4-8' && c.rules.soft17 === 'hits' && c.rules.das === 'yes' && c.rules.surrender === 'any')];
let c2bad = [], c2n = 0, c2oneTap = 0;
const t2 = Date.now();
for (const c of clickSets) {
  if (TABLE_CLICKS === 'all') { // change rules in full chart, come back
    await p2.locator('#mode-switch').getByText('Full chart').click();
    await clickRules(p2, c.rules);
    await p2.locator('#mode-switch').getByText('Table mode').click();
  } else { // set the one rule set by real clicks too
    await p2.locator('#mode-switch').getByText('Full chart').click();
    await clickRules(p2, c.rules);
    await p2.locator('#mode-switch').getByText('Table mode').click();
  }
  for (const h of HANDS) {
    const er = c.tables[h.table].find(r => r.label === h.row);
    for (let j = 0; j < 10; j++) {
      await p2.locator(`#table-pick button[data-act="hand"][data-val="${h.key}"]`).click();
      await p2.locator(`#table-pick button[data-act="dealer"][data-val="${D[j]}"]`).click();
      const r = await resultOf(p2);
      c2n++;
      const exp = er.cells[j];
      if (!r || r.move !== exp.move || r.word !== WORD[exp.move] || !r.dealer?.endsWith(D[j]) || !r.hand?.endsWith(h.text))
        c2bad.push(`${c.id} ${h.text} vs ${D[j]}: got ${JSON.stringify(r)} want ${exp.move}`);
    }
  }
}
const c2ms = Date.now() - t2;
// the same through the page's own UI functions for all 36 sets (selectHand/selectDealer, then read the rendered card)
let c2fn = 0, c2fnBad = [];
const p2b = await newPage(1280, 900);
await p2b.goto(URL0);
for (const c of snap) {
  const out = await p2b.evaluate(({ rules, hands, D }) => {
    const A = window.ChipyCheatSheet; const res = [];
    A.setRules(rules); A.setMode('table');
    for (const h of hands) for (const d of D) {
      A.selectHand(h.key); A.selectDealer(d);
      const r = document.querySelector('#table-result .sa-rec-move');
      res.push({ h: h.key, d, dom: r?.dataset.move, fn: (A.tableAnswer(rules, h.key, d) || {}).move });
    }
    return res;
  }, { rules: c.rules, hands: HANDS, D });
  for (const o of out) {
    c2fn++;
    const h = HANDS.find(x => x.key === o.h);
    const want = c.tables[h.table].find(r => r.label === h.row).cells[D.indexOf(o.d)].move;
    if (o.dom !== want || o.fn !== want) c2fnBad.push(`${c.id} ${o.h} vs ${o.d}: dom=${o.dom} fn=${o.fn} want=${want}`);
  }
}
row(2, 'Table mode answer == chart cell, two taps (hand, dealer)',
  c2bad.length === 0 && c2fnBad.length === 0 && c2n === clickSets.length * 350 && c2fn === 36 * 350,
  `Coverage: ${clickSets.length} rule set(s) x 35 hands x 10 dealers = ${c2n} answers by real clicks (2 clicks each, ${(c2ms / 1000).toFixed(0)} s; QA_TABLE_CLICKS=${TABLE_CLICKS}); all 36 sets x 350 = ${c2fn} via page UI functions (selectHand/selectDealer + tableAnswer + rendered card); mismatches ${c2bad.length + c2fnBad.length}` +
  (c2bad.length + c2fnBad.length ? ' e.g. ' + [...c2bad, ...c2fnBad].slice(0, 3).join(' ; ') : ''));
if (c2bad.length + c2fnBad.length) find('high', 'Check 2 mismatches: ' + [...c2bad, ...c2fnBad].slice(0, 5).join(' ; '));

// =====================================================================
// CHECK 3: reason panel
// =====================================================================
const p3 = await newPage(1280, 900);
await p3.goto(URL0);
const c3 = [];
const ok3 = (name, v, extra = '') => c3.push({ name, v, extra });
// note cell: 1 deck, S17, DAS yes, no surrender -> hard 16 vs 10 (HIT with note)
await clickRules(p3, { decks: '1', soft17: 'stands', das: 'yes', surrender: 'none' });
const noteCell = snap[0].tables.hard.find(r => r.label === '16').cells[8];
await p3.locator('#chart-hard button.cell-hit[data-erow="16"][data-dealer="10"]').click();
let card = await p3.evaluate(() => { const c = document.querySelector('#reason-hard [data-reason-card]'); return c && { title: c.querySelector('[data-title]')?.textContent, reason: c.querySelector('[data-reason]')?.textContent.trim(), note: c.querySelector('[data-note]')?.textContent.trim() || null, word: c.querySelector('.rp-word')?.textContent }; });
ok3('tap shows row label "Hard 16 vs dealer 10"', card?.title === 'Hard 16 vs dealer 10', card?.title);
ok3('reason text present (>20 chars)', (card?.reason || '').length > 20);
ok3('note shown separately and equals snapshot note', card?.note === noteCell.note && !card.reason.includes('Basic strategy says'), card?.note);
// panel for a cell without a note
await p3.locator('#chart-hard button.cell-hit[data-erow="18-21"][data-dealer="10"]').click();
card = await p3.evaluate(() => { const c = document.querySelector('#reason-hard [data-reason-card]'); return { title: c.querySelector('[data-title]').textContent, note: !!c.querySelector('[data-note]'), n: document.querySelectorAll('#reason-hard [data-reason-card]').length }; });
ok3('title uses the displayed label "Hard 18–21 vs dealer 10"; no note element when no note; one panel per table', card.title === 'Hard 18–21 vs dealer 10' && !card.note && card.n === 1, JSON.stringify(card));
// panel sits directly under its own table
const under = await p3.evaluate(() => { const r = document.querySelector('#reason-hard').getBoundingClientRect(), t = document.querySelector('#chart-hard table').getBoundingClientRect(); return r.top >= t.bottom - 1; });
ok3('panel opens inline under the tapped table', under);
// Close button
await p3.locator('#reason-hard .rp-close').click();
ok3('Close button closes', await p3.locator('#reason-hard [data-reason-card]').count() === 0);
// Escape
await p3.locator('#chart-soft button.cell-hit[data-erow="18"][data-dealer="3"]').click();
const opened = await p3.locator('#reason-soft [data-reason-card]').count() === 1;
await p3.keyboard.press('Escape');
ok3('Escape closes (focus after a tap)', opened && await p3.locator('#reason-soft [data-reason-card]').count() === 0);
// all three tables open a panel
let all3 = true;
for (const [t, r] of [['hard', '12'], ['soft', '17'], ['pairs', '8,8']]) {
  await p3.locator(`#chart-${t} button.cell-hit[data-erow="${r}"][data-dealer="6"]`).click();
  all3 = all3 && await p3.locator(`#reason-${t} [data-reason-card]`).count() === 1;
}
ok3('hard, soft, pairs each open their own panel', all3);
// keyboard: roving tabindex = one Tab stop per table
const stops = await p3.evaluate(() => ['hard', 'soft', 'pairs'].map(t => document.querySelectorAll(`#chart-${t} button.cell-hit[tabindex="0"]`).length));
ok3('one Tab stop per table (tabindex=0 count)', stops.every(n => n === 1), JSON.stringify(stops));
await p3.reload();
await p3.focus('#chart-hard button.cell-hit[data-ri="0"][data-ci="0"]');
const pos = async () => p3.evaluate(() => { const a = document.activeElement; return a?.dataset?.table ? `${a.dataset.table}:${a.dataset.ri},${a.dataset.ci}` : String(a?.tagName); });
const seq = [];
for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) { await p3.keyboard.press(k); seq.push(await pos()); }
ok3('arrow keys move between cells (R,D,L,U)', JSON.stringify(seq) === JSON.stringify(['hard:0,1', 'hard:1,1', 'hard:1,0', 'hard:0,0']), seq.join(' '));
await p3.keyboard.press('Enter');
ok3('Enter opens panel', await p3.locator('#reason-hard [data-reason-card]').count() === 1);
await p3.keyboard.press('Escape');
await p3.keyboard.press('Space');
ok3('Space opens panel', await p3.locator('#reason-hard [data-reason-card]').count() === 1);
await p3.keyboard.press('Escape');
await p3.focus('#chart-hard button.cell-hit[data-ri="0"][data-ci="0"]');
await p3.keyboard.press('Tab');
ok3('Tab leaves the table (does not step through its cells)', !(await pos()).startsWith('hard:'), await pos());
// reasons for every cell of every table in two rule sets resolve (cellDetail non-null with reason)
const detail = await p3.evaluate(({ snap, D }) => {
  const A = window.ChipyCheatSheet; let n = 0, miss = 0;
  for (const c of snap) for (const t of ['hard', 'soft', 'pairs']) for (const r of c.tables[t]) D.forEach((d, j) => {
    n++; const x = A.cellDetail(c.rules, t, r.label, d);
    if (!x || !x.reason || (r.cells[j].note ? x.note !== r.cells[j].note : x.note)) miss++;
  });
  return { n, miss };
}, { snap, D });
ok3(`cellDetail gives a reason (and the snapshot note, when there is one) for all ${detail.n} cells`, detail.miss === 0, `missing ${detail.miss}`);
row(3, 'Reason panel (D-063)', c3.every(x => x.v), c3.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.name + (x.extra && !x.v ? ' [' + x.extra + ']' : '')).join(' | '));
for (const x of c3.filter(x => !x.v)) find('medium', 'Check 3: ' + x.name + ' ' + x.extra);

// =====================================================================
// CHECK 4: link / query
// =====================================================================
const c4 = [];
const p4 = await newPage(1280, 900);
let c4bad = [];
for (const c of snap) {
  const q = `?decks=${c.rules.decks}&soft17=${c.rules.soft17}&das=${c.rules.das}&surrender=${c.rules.surrender}`;
  await p4.goto(URL0 + q);
  const bad = await chartDiff(p4, c);
  const radios = await p4.evaluate(() => ['rule-decks', 'rule-soft17', 'rule-das', 'rule-surrender'].map(n => document.querySelector(`input[name="${n}"]:checked`)?.value));
  if (JSON.stringify(radios) !== JSON.stringify([c.rules.decks, c.rules.soft17, c.rules.das, c.rules.surrender])) bad.push('radios ' + radios);
  c4bad.push(...bad.map(b => c.id + ': ' + b));
}
c4.push({ n: 'all 36 ?query loads show the right chart (cells, sentence, radios)', v: c4bad.length === 0, x: c4bad.slice(0, 3).join(' ; ') });
// rules change rewrites URL, history length unchanged
await p4.goto(URL0 + '?decks=1&soft17=stands&das=yes&surrender=none');
const h0 = await p4.evaluate(() => history.length);
await rl(p4, 'rule-decks', '2').click(); await rl(p4, 'rule-soft17', 'hits').click(); await rl(p4, 'rule-surrender', 'except_ace').click(); await rl(p4, 'rule-das', 'no').click();
const after = await p4.evaluate(() => ({ len: history.length, search: location.search, q: window.ChipyCheatSheet.queryFromRules(window.ChipyCheatSheet.getRules()) }));
const sp = new URLSearchParams(after.search);
c4.push({ n: 'rules change rewrites the URL query; history length unchanged', v: after.len === h0 && sp.get('decks') === '2' && sp.get('soft17') === 'hits' && sp.get('das') === 'no' && sp.get('surrender') === 'except_ace', x: `history ${h0}->${after.len}, search=${after.search}` });
// bad / partial queries
const dflt = { decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' };
const msgsBefore = consoleMsgs.length + pageErrors.length;
const bads = [['?decks=9&soft17=zzz&das=maybe&surrender=nope', dflt], ['?garbage', dflt], ['?decks=2&das=junk&soft17=stands', { ...dflt, decks: '2', soft17: 'stands' }], ['?decks=1&decks=2', null], ['?decks[]=1&__proto__=x&constructor=y', dflt], ['?decks=%E0%A4%A', dflt]];
const badRes = [];
for (const [q, exp] of bads) {
  await p4.goto(URL0 + q);
  const r = await p4.evaluate(() => window.ChipyCheatSheet.getRules());
  const chartRows = await p4.locator('#chart-hard tbody tr').count();
  const good = chartRows === 12 && (!exp || JSON.stringify(r) === JSON.stringify(exp));
  badRes.push(`${q} -> ${JSON.stringify(r)}${good ? '' : ' (UNEXPECTED)'}`);
  if (!good) c4bad.push('bad query ' + q);
}
const errAfter = consoleMsgs.length + pageErrors.length - msgsBefore;
c4.push({ n: 'bad/partial queries fall back per field to defaults with a rendered chart and no console output', v: !badRes.some(x => x.includes('UNEXPECTED')) && errAfter === 0, x: badRes.join(' ; ') + `; console msgs ${errAfter}` });
row(4, 'My-table link (D-054)', c4.every(x => x.v), c4.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c4.filter(x => !x.v)) find('high', 'Check 4: ' + x.n + ' ' + x.x);

// =====================================================================
// CHECK 5: print
// =====================================================================
function pageCount(buf) {
  const s = buf.toString('latin1');
  const typePage = (s.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  const counts = [...s.matchAll(/\/Count\s+(\d+)/g)].map(m => +m[1]);
  return Math.max(typePage, counts.length ? Math.max(...counts) : 0) === typePage || !counts.length ? typePage : Math.max(...counts);
}
const p5 = await newPage(1280, 900);
await p5.goto(URL0);
const c5 = [];
let pagesFail = [], textFail = [], layoutFail = [], pdfN = 0, pdfIntendedN = 0;
const POCKET_LEGEND = 'H Hit \u00b7 S Stand';
const PD = path.join(PW_DIR, 'pdf'); fs.mkdirSync(PD, { recursive: true });
for (const c of snap) {
  await p5.evaluate(r => { window.ChipyCheatSheet.setRules(r); }, c.rules);
  for (const mode of ['full', 'pocket']) {
    await p5.evaluate(m => { window.ChipyCheatSheet.printSheet; // render both blocks the way the app does, then set the flag
      document.documentElement.dataset.print = m; }, mode);
    await p5.emulateMedia({ media: 'print' });
    // visible block states the rules + has the right cells
    const vis = await p5.evaluate(({ mode }) => {
      const id = mode === 'full' ? '#print-full' : '#print-pocket';
      const el = document.querySelector(id), other = document.querySelector(mode === 'full' ? '#print-pocket' : '#print-full');
      const rules = [...el.querySelectorAll('[data-rules]')].map(x => x.textContent.trim());
      const cells = {};
      for (const t of ['hard', 'soft', 'pairs']) cells[t] = [...el.querySelectorAll(`section[data-table="${t}"] tbody tr`)].map(tr => ({ row: tr.dataset.row, m: [...tr.querySelectorAll('td')].map(td => ({ move: td.dataset.move, text: td.textContent.trim() })) }));
      return { shown: getComputedStyle(el).display !== 'none', otherHidden: getComputedStyle(other).display === 'none', chartHidden: getComputedStyle(document.querySelector('main.shell')).display === 'none' && document.body.innerText.trim() === el.innerText.trim(), rules, cells };
    }, { mode });
    let ok = vis.shown && vis.otherHidden && vis.chartHidden && vis.rules.length >= 1 && vis.rules.every(x => x === c.label);
    for (const t of TABLES) c.tables[t].forEach((er, i) => er.cells.forEach((ec, j) => {
      const d = vis.cells[t][i]?.m[j];
      const want = mode === 'full' ? WORD[ec.move] : LETTER[ec.move];
      if (!d || d.move !== ec.move || !d.text.includes(want)) ok = false;
    }));
    if (!ok) textFail.push(`${c.id} ${mode}`);
    for (const fmt of ['A4', 'Letter']) {
      // page.pdf() fires afterprint, which clears html[data-print]: set the flag right before EACH pdf() call (S-21 QA bug fix)
      await p5.evaluate(m => { document.documentElement.dataset.print = m; }, mode);
      const buf = await p5.pdf({ format: fmt, landscape: mode === 'pocket', printBackground: true, preferCSSPageSize: false });
      const n = pageCount(buf); pdfN++;
      if (n !== 1) pagesFail.push(`${c.id} ${mode} ${fmt}: ${n} pages`);
      const tx = pdfText(buf).replace(/\s+/g, ' ');
      const hasPocket = tx.includes(POCKET_LEGEND), hasFold = tx.includes('Fold or cut'), hasFullKey = tx.includes('Hit Stand Double Split Surrender');
      const intended = tx.includes(c.label) && (mode === 'pocket' ? hasPocket && hasFold && !hasFullKey : hasFullKey && !hasPocket && !hasFold && tx.includes('Your hand'));
      pdfIntendedN++;
      if (!intended) layoutFail.push(`${c.id} ${mode} ${fmt}`);
      if (c === snap[0] || c === snap[35]) fs.writeFileSync(path.join(PD, `${mode}-${fmt}-${snap.indexOf(c)}.pdf`), buf);
    }
  }
}
// also with preferCSSPageSize (pocket may set @page) for default
await p5.evaluate(() => { window.ChipyCheatSheet.setRules({ decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' }); });
const cssPages = {};
for (const mode of ['full', 'pocket']) {
  for (const fmt of ['A4', 'Letter']) {
    await p5.evaluate(m => { document.documentElement.dataset.print = m; }, mode); // flag before EACH pdf()
    const b = await p5.pdf({ format: fmt, landscape: mode === 'pocket', preferCSSPageSize: true, printBackground: true });
    cssPages[`${mode}/${fmt}/css`] = pageCount(b);
    const tx = pdfText(b); if ((mode === 'pocket') !== tx.includes('Fold or cut')) layoutFail.push(`css ${mode} ${fmt}`);
  }
}
// print buttons set the flag and call print (window.print stubbed so the dialog never opens)
await p5.emulateMedia({ media: 'screen' });
await p5.evaluate(() => { delete document.documentElement.dataset.print; window.__printed = 0; window.print = () => { window.__printed++; window.__flag = document.documentElement.dataset.print; }; });
await p5.locator('#print-full-btn').click();
const f1 = await p5.evaluate(() => ({ n: window.__printed, flag: window.__flag }));
await p5.locator('#print-pocket-btn').click();
const f2 = await p5.evaluate(() => ({ n: window.__printed, flag: window.__flag }));
const btns = f1.flag === 'full' && f2.flag === 'pocket' && f2.n === 2;
// screen shows nothing of the print blocks
const screenHidden = await p5.evaluate(() => ['#print-full', '#print-pocket'].every(s => getComputedStyle(document.querySelector(s)).display === 'none'));
const flagCleared = await p5.evaluate(() => new Promise(r => { window.dispatchEvent(new Event('afterprint')); setTimeout(() => r(document.documentElement.dataset.print ?? null), 50); }));
c5.push({ n: `${pdfN} PDFs (36 sets x full/pocket x A4/Letter(landscape for pocket)) = exactly 1 page`, v: pagesFail.length === 0, x: pagesFail.slice(0, 4).join(' ; ') || 'all 1 page' });
c5.push({ n: `${pdfIntendedN} PDFs contain the intended layout (flag set before each pdf(); text read from the PDF itself: rules sentence == snapshot label; pocket has "${POCKET_LEGEND}" + fold-line text and no full word key; full has "Your hand" + word key and no pocket legend; also checked in the 4 preferCSSPageSize PDFs)`, v: layoutFail.length === 0 && pdfIntendedN === 144, x: layoutFail.slice(0, 4).join(' ; ') || 'all intended' });
c5.push({ n: 'with preferCSSPageSize also 1 page', v: Object.values(cssPages).every(n => n === 1), x: JSON.stringify(cssPages) });
c5.push({ n: 'print view states the chosen rules (== snapshot label) and every cell (full: words; pocket: letters) for all 36 x 2', v: textFail.length === 0, x: textFail.slice(0, 4).join(' ; ') || 'ok' });
c5.push({ n: 'Print buttons set html[data-print]=full/pocket and call window.print (stubbed)', v: btns, x: JSON.stringify({ f1, f2 }) });
c5.push({ n: 'print blocks hidden on screen; data-print cleared after afterprint', v: screenHidden && flagCleared === null, x: `screenHidden=${screenHidden} flagAfterAfterprint=${flagCleared}` });
row(5, 'Print (D-054, D-064)', c5.every(x => x.v), c5.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c5.filter(x => !x.v)) find('high', 'Check 5: ' + x.n + ' ' + x.x);

// =====================================================================
// CHECK 6: layout + screenshots
// =====================================================================
const c6 = [];
const smallTargets = {};
async function layout(p, label) {
  return p.evaluate(label => {
    const doc = document.documentElement;
    const small = [];
    for (const el of document.querySelectorAll('button, a[href], input, label, [role=button], [tabindex]')) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      if (el.tagName === 'INPUT' && el.type === 'radio') continue; // its label is the target
      if (el.closest('#print-full, #print-pocket')) continue;
      if (r.width < 44 || r.height < 44) small.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return { sw: doc.scrollWidth, iw: window.innerWidth, bodySw: document.body.scrollWidth, small };
  }, label);
}
const states = {};
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const p = await newPage(w, h);
  await p.goto(URL0);
  await p.waitForTimeout(200);
  const res = {};
  res.chart = await layout(p, 'chart');
  await p.screenshot({ path: path.join(SHOTS, `default-chart-${w}.png`), fullPage: true });
  await p.locator('#chart-hard button.cell-hit[data-erow="16"][data-dealer="10"]').click();
  await p.waitForTimeout(150);
  res.panel = await layout(p, 'panel');
  await p.screenshot({ path: path.join(SHOTS, `reason-panel-${w}.png`), fullPage: true });
  await p.keyboard.press('Escape');
  await p.locator('#mode-switch').getByText('Table mode').click();
  await p.locator('#table-pick button[data-act="hand"][data-val="hard:16"]').click();
  await p.locator('#table-pick button[data-act="dealer"][data-val="10"]').click();
  await p.waitForTimeout(500);
  res.table = await layout(p, 'table');
  await p.screenshot({ path: path.join(SHOTS, `table-mode-result-${w}.png`), fullPage: true });
  states[w] = res;
  // 390: also the Change rules panel open
  if (w === 390) {
    await p.locator('#rules-toggle').click(); await p.waitForTimeout(200);
    res.tableRulesOpen = await layout(p, 'rules-open');
  }
}
const noScroll = [], smalls = [];
for (const w of [390, 1280]) for (const [s, r] of Object.entries(states[w])) {
  if (r.sw > r.iw || r.bodySw > r.iw) noScroll.push(`${w} ${s}: scrollWidth ${r.sw} > ${r.iw}`);
  smalls.push(`${w}/${s}: ${[...new Set(r.small)].join('; ') || 'none'}`);
}
c6.push({ n: 'no sideways page scroll (scrollWidth <= innerWidth) at 390 and 1280, chart / table mode+result / open panel', v: noScroll.length === 0, x: noScroll.join(' ; ') || Object.entries(states).map(([w, s]) => w + ': ' + Object.entries(s).map(([k, r]) => `${k} ${r.sw}/${r.iw}`).join(', ')).join(' | ') });
// D-080: at 390 every chart cell word fits its cell (rendered word width <= cell width - 6px); default chart + all 36 rule sets (adjacent Surrender cells occur in several)
const pw = await newPage(390, 844);
await pw.goto(URL0); await pw.waitForTimeout(200);
const measureWords = () => pw.evaluate(() => { let max = 0, maxCell = 0, worst = null, n = 0, over = 0, fs = new Set(), ls = new Set();
  for (const td of document.querySelectorAll('#chart td[data-move]')) { const w = td.querySelector('.mw'); if (!w) continue;
    const rg = document.createRange(); rg.selectNodeContents(w); const rw = rg.getBoundingClientRect().width, cw = td.getBoundingClientRect().width; n++;
    const cs = getComputedStyle(w); fs.add(cs.fontSize); ls.add(cs.letterSpacing);
    if (rw > max) { max = rw; maxCell = cw; worst = w.textContent + ' in ' + Math.round(cw) + 'px cell'; } if (rw > cw - 6) over++; }
  return { max: +max.toFixed(1), cell: +maxCell.toFixed(1), worst, n, over, fs: [...fs], ls: [...ls] }; });
const wDefault = await measureWords();
let wAll = { max: 0, over: 0, n: 0, worst: '' };
for (const c of snap) { await pw.evaluate(r => window.ChipyCheatSheet.setRules(r), c.rules); const m = await measureWords(); wAll.n += m.n; wAll.over += m.over; if (m.max > wAll.max) wAll = { ...wAll, max: m.max, worst: m.worst + ' (' + c.id + ')' }; }
c6.push({ n: 'D-080: at 390 every chart cell word width <= cell width - 6px', v: wDefault.over === 0 && wAll.over === 0 && wDefault.n === 300, x: `default chart: max word ${wDefault.max}px (${wDefault.worst}), cell ${wDefault.cell}px, font ${wDefault.fs} spacing ${wDefault.ls}, ${wDefault.over} over; all 36 rule sets (${wAll.n} cells): max word ${wAll.max}px (${wAll.worst}), ${wAll.over} over` });
console.log('wordwidth', JSON.stringify({ wDefault, wAll }));
row(6, 'Layout 390x844 and 1280x900: no sideways scroll', c6.every(x => x.v), c6.map(x => x.x).join(' | '));
const tapReport = smalls.join('\n    ');
const lowTargets = [...new Set(Object.values(states[390]).flatMap(r => r.small))];

// colour contrast of the title (flag)
const pc = await newPage(1280, 900); await pc.goto(URL0);
const contrast = await pc.evaluate(() => {
  const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const h1 = document.querySelector('h1'); let bg = h1, bgc;
  while (bg) { bgc = getComputedStyle(bg).backgroundColor; if (bgc && !/rgba\(0, 0, 0, 0\)|transparent/.test(bgc)) break; bg = bg.parentElement; }
  const a = lum(getComputedStyle(h1).color), b = lum(bgc);
  return { fg: getComputedStyle(h1).color, bg: bgc, ratio: ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2) };
});

// =====================================================================
// CHECK 8: keyboard + a11y
// =====================================================================
const c8 = [];
const p8 = await newPage(1280, 900);
await p8.goto(URL0);
const interactive = await p8.evaluate(() => [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.closest('#print-full,#print-pocket,#table-mode[hidden]') && el.offsetParent !== null || (el.type === 'radio'); }).filter(el => !el.disabled).map(el => (el.tagName + (el.id ? '#' + el.id : '') + (el.id || el.name || el.dataset?.table ? '' : '"' + (el.textContent || '').trim().slice(0, 20) + '"') + (el.name ? '[' + el.name + '=' + el.value + ']' : '') + (el.dataset?.table ? '.' + el.dataset.table + ':' + el.dataset.ri + ',' + el.dataset.ci : ''))));
const reached = [], noFocus = [];
await p8.evaluate(() => document.activeElement.blur());
for (let i = 0; i < 120; i++) {
  await p8.keyboard.press('Tab');
  const f = await p8.evaluate(() => {
    const el = document.activeElement; if (!el || el === document.body) return null;
    const vis = e => { const cs = getComputedStyle(e); return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none'); };
    let ring = vis(el) && el.matches(':focus-visible');
    if (!ring && el.type === 'radio') { const l = el.labels[0]; ring = !!l && (vis(l) || [...l.querySelectorAll('*')].some(vis) || (el.nextElementSibling && vis(el.nextElementSibling))) ; }
    if (!ring && el.type === 'radio') { // :has(:focus-visible) styling on the label/parent
      const cs = getComputedStyle(el.labels[0]); ring = cs.outlineStyle !== 'none' || cs.boxShadow !== 'none' || cs.borderColor !== getComputedStyle(el.labels[0].parentElement).borderColor;
    }
    return { id: el.tagName + (el.id ? '#' + el.id : '') + (el.id || el.name || el.dataset?.table ? '' : '"' + (el.textContent || '').trim().slice(0, 20) + '"') + (el.name ? '[' + el.name + '=' + el.value + ']' : '') + (el.dataset?.table ? '.' + el.dataset.table + ':' + el.dataset.ri + ',' + el.dataset.ci : ''), ring };
  });
  if (!f) break;
  if (reached.includes(f.id)) break;
  reached.push(f.id);
  if (!f.ring) noFocus.push(f.id);
}
const unreached = interactive.filter(x => !reached.includes(x) && !/^BUTTON\.(hard|soft|pairs):/.test(x) && !/^INPUT\[/.test(x) || (/^INPUT\[/.test(x) && !reached.some(r => r.split('=')[0] === x.split('=')[0])));
c8.push({ n: 'every control reachable by Tab (radios by group, one stop per table for cells)', v: unreached.length === 0, x: `tab stops ${reached.length}: ${reached.join(' > ')}${unreached.length ? '; UNREACHED ' + unreached.join(',') : ''}` });
c8.push({ n: 'visible focus indicator on every tab stop', v: noFocus.length === 0, x: noFocus.join(',') || 'all stops show outline/box-shadow' });
// radio keyboard: arrows change a radio
await p8.focus('input[name="rule-decks"]:checked');
await p8.keyboard.press('ArrowLeft');
const rv = await p8.evaluate(() => window.ChipyCheatSheet.getRules().decks);
c8.push({ n: 'radio group changes by arrow keys', v: rv !== '4-8', x: 'decks after ArrowLeft: ' + rv });
// table mode keyboard: hand and dealer buttons activate by Enter/Space
await p8.locator('#mode-switch').getByText('Table mode').focus();
await p8.keyboard.press('Enter');
await p8.focus('#table-pick button[data-val="hard:16"]'); await p8.keyboard.press('Enter');
await p8.focus('#table-pick button[data-act="dealer"][data-val="10"]'); await p8.keyboard.press('Space');
const kres = await resultOf(p8);
c8.push({ n: 'table mode usable from the keyboard (mode switch, hand, dealer -> result)', v: !!kres && !!kres.hand?.endsWith('16') && kres.move === 'SURRENDER', x: JSON.stringify(kres) });
// icons never the only label
const labels = await p8.evaluate(() => {
  const A = window.ChipyCheatSheet; A.setMode('full');
  const noWord = [...document.querySelectorAll('#chart td[data-move]')].filter(td => !(td.querySelector('.mw')?.textContent.trim())).length;
  const iconsHidden = [...document.querySelectorAll('.mi')].every(i => i.getAttribute('aria-hidden') === 'true');
  const noAria = [...document.querySelectorAll('button')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label'))).length;
  const cellAria = [...document.querySelectorAll('button.cell-hit')].every(b => /: (Hit|Stand|Double|Split|Surrender)(, changed for your new rules)?\. Show why$/.test(b.getAttribute('aria-label') || ''));
  return { noWord, iconsHidden, noAria, cellAria };
});
c8.push({ n: 'icons never the only label (word in every cell, icons aria-hidden, every button named, cell buttons announce hand+dealer+move)', v: labels.noWord === 0 && labels.iconsHidden && labels.noAria === 0 && labels.cellAria, x: JSON.stringify(labels) });
const lang = await p8.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, viewport: document.querySelector('meta[name=viewport]')?.content }));
c8.push({ n: 'html lang, title, viewport meta present', v: !!lang.lang && !!lang.title && !!lang.viewport, x: JSON.stringify(lang) });
row(8, 'Keyboard + basic accessibility', c8.every(x => x.v), c8.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c8.filter(x => !x.v)) find('medium', 'Check 8: ' + x.n + ' ' + x.x);

// =====================================================================
// CHECK 9: scroll cue (S-20 F1)
// =====================================================================
const c9 = [];
const p9 = await newPage(390, 844);
await p9.goto(URL0);
await p9.waitForTimeout(250);
const cueStateFn = `(() => { const T = ['hard','soft','pairs']; return T.map(t => {
  const sec = document.getElementById('chart-' + t), hint = sec.querySelector('[data-swipe-hint]'), wrap = sec.querySelector('.scroll-wrap'), box = sec.querySelector('.scroll');
  const after = getComputedStyle(wrap, '::after');
  return { t, hint: !!hint && getComputedStyle(hint).display !== 'none' && hint.getBoundingClientRect().height > 0, hintText: hint && hint.textContent.trim(), fade: after.content !== 'none' && after.display !== 'none', fadeW: after.width, pe: after.pointerEvents, sl: box.scrollLeft, cw: box.clientWidth, sw: box.scrollWidth };
}); })()`;
const s0 = await p9.evaluate(cueStateFn);
c9.push({ n: '390 on load: each of 3 tables shows hint "Swipe for dealer 6–A" + right fade', v: s0.every(x => x.hint && x.hintText === 'Swipe for dealer 6–A' && x.fade && x.sw > x.cw), x: s0.map(x => `${x.t}: hint=${x.hint} fade=${x.fade} (${x.fadeW}) box ${x.cw}/${x.sw}`).join('; ') });
c9.push({ n: 'fade has pointer-events none', v: s0.every(x => x.pe === 'none'), x: s0.map(x => x.pe).join(',') });
// geometry: fade vs pinned first column
const geo = await p9.evaluate(() => {
  const wrap = document.querySelector('#chart-hard .scroll-wrap'), w = wrap.getBoundingClientRect(), a = getComputedStyle(wrap, '::after');
  const th = document.querySelector('#chart-hard tbody tr th, #chart-hard tbody tr td:first-child').getBoundingClientRect();
  const fadeLeft = w.right - parseFloat(a.width) - parseFloat(a.right || 0);
  return { fadeLeft: Math.round(fadeLeft), pinnedRight: Math.round(th.right), wrapRight: Math.round(w.right) };
});
c9.push({ n: 'fade does not cover the pinned first column', v: geo.fadeLeft >= geo.pinnedRight, x: JSON.stringify(geo) });
// tap under the fade opens the cell's reason
await p9.evaluate(() => document.querySelector('#chart-hard tbody tr:nth-child(4)').scrollIntoView({ block: 'center' }));
const pt = await p9.evaluate(() => { const w = document.querySelector('#chart-hard .scroll-wrap').getBoundingClientRect(); const r = document.querySelector('#chart-hard tbody tr:nth-child(4) td:last-child') ; const rr = document.querySelector('#chart-hard tbody tr:nth-child(4)').getBoundingClientRect(); const x = w.right - 12, y = rr.top + rr.height / 2; const el = document.elementFromPoint(x, y); const hit = el && el.closest('button.cell-hit'); return { x, y, hit: !!hit, dealer: hit?.dataset.dealer, erow: hit?.dataset.erow, tag: el?.tagName + '.' + el?.className }; });
await p9.mouse.click(pt.x, pt.y);
await p9.waitForTimeout(100);
const panelT = await p9.evaluate(() => document.querySelector('#reason-hard [data-title]')?.textContent || null);
c9.push({ n: 'tap inside the fade area hits the cell and opens its reason panel', v: pt.hit && panelT === `Hard ${pt.erow} vs dealer ${pt.dealer}`, x: `elementFromPoint ${pt.tag}; panel "${panelT}"` });
await p9.keyboard.press('Escape');
// scroll each table to the end
for (const t of TABLES) await p9.evaluate(t => { const b = document.querySelector(`#chart-${t} .scroll`); b.scrollLeft = b.scrollWidth; }, t);
await p9.waitForTimeout(300);
const s1 = await p9.evaluate(cueStateFn);
c9.push({ n: 'after scrolling each table to its end, hint and fade are gone', v: s1.every(x => !x.hint && !x.fade), x: s1.map(x => `${x.t}: sl=${Math.round(x.sl)} hint=${x.hint} fade=${x.fade}`).join('; ') });
// scroll back: returns
await p9.evaluate(() => { document.querySelector('#chart-hard .scroll').scrollLeft = 0; });
await p9.waitForTimeout(300);
const s2 = await p9.evaluate(cueStateFn);
c9.push({ n: 'scrolling back to the start brings the cue back', v: s2[0].hint && s2[0].fade, x: `hard hint=${s2[0].hint} fade=${s2[0].fade}` });
const sw390 = await p9.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
// 1280
const p9b = await newPage(1280, 900);
await p9b.goto(URL0);
await p9b.waitForTimeout(250);
const w0 = await p9b.evaluate(cueStateFn);
const sw1280 = await p9b.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
c9.push({ n: '1280: no hint and no fade on any table', v: w0.every(x => !x.hint && !x.fade), x: w0.map(x => `${x.t}: hint=${x.hint} fade=${x.fade} box ${x.cw}/${x.sw}`).join('; ') });
c9.push({ n: 'page scrollWidth == innerWidth at 390 and 1280', v: sw390[0] === sw390[1] && sw1280[0] === sw1280[1], x: `390: ${sw390}; 1280: ${sw1280}` });
row(9, 'Scroll cue (S-20 F1, D-066, D-050)', c9.every(x => x.v), c9.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c9.filter(x => !x.v)) find('medium', 'Check 9: ' + x.n + ' ' + x.x);

// =====================================================================
// CHECK 10: Calculator link >= 44px
// =====================================================================
const c10 = [];
const CALC_URL = 'https://chipy.com/tools/blackjack-calculator'; // D-082
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const p = await newPage(w, h);
  await p.goto(URL0);
  await p.locator('#mode-switch').getByText('Table mode').click();
  await p.locator('#table-pick button[data-act="hand"][data-val="hard:16"]').click();
  await p.locator('#table-pick button[data-act="dealer"][data-val="10"]').click();
  const bb = await p.locator('#table-result a.sa-link').boundingBox();
  const anchors = await p.evaluate(() => [...document.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), cls: a.className })));
  const calcLinks = anchors.filter(a => a.cls.includes('sa-link'));
  const hrefOk = calcLinks.length === 1 && calcLinks[0].href === CALC_URL && anchors.length === 1;
  c10.push({ n: `link at ${w}: href exactly ${CALC_URL}, the only <a> on the page, box >= 44px`, v: !!bb && bb.height >= 44 && hrefOk, x: (bb ? `${Math.round(bb.width)}x${bb.height}` : 'link missing') + `; anchors on page ${JSON.stringify(anchors)}` });
}
row(10, 'Calculator link: exact href (D-082) + tap target >= 44px (S-20 F3, D-055)', c10.every(x => x.v), c10.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c10.filter(x => !x.v)) find('low', 'Check 10: ' + x.n + ' ' + x.x);

// =====================================================================
// CHECK 11: What your rules change (D-067)
// =====================================================================
const c11 = [];
const RF = [['decks', 'rule-decks', ['1', '2', '4-8']], ['soft17', 'rule-soft17', ['stands', 'hits']], ['das', 'rule-das', ['yes', 'no']], ['surrender', 'rule-surrender', ['none', 'any', 'except_ace']]];
const key = r => `${r.decks}|${r.soft17}|${r.das}|${r.surrender}`;
const byRules = new Map(snap.map(c => [key(c.rules), c]));
const diffExpected = (a, b) => { let n = 0; const set = new Set(); for (const t of TABLES) a.tables[t].forEach((r, i) => r.cells.forEach((c, j) => { if (c.move !== b.tables[t][i].cells[j].move) { n++; set.add(`${t}|${r.label}|${D[j]}`); } })); return { n, set }; };
const readDiff = p => p.evaluate(() => {
  const note = document.getElementById('diff-note');
  const marked = [...document.querySelectorAll('#chart [data-changed="1"]')];
  return { hidden: note.hidden, text: note.querySelector('[data-diff-text]')?.textContent.trim() || '', marked: marked.length,
    keys: marked.map(b => `${b.dataset.table}|${b.dataset.erow}|${b.dataset.dealer}`), badges: document.querySelectorAll('#chart .chg').length + [...document.querySelectorAll('#chart td')].filter(td => /changed/i.test(td.textContent)).length,
    marker: marked.map(b => { const cs = getComputedStyle(b), a = getComputedStyle(b, '::after'), sur = !!b.closest('.m-surrender'), want = sur ? 'rgb(255, 255, 255)' : 'rgb(26, 29, 34)';
      return cs.outlineStyle === 'dashed' && parseFloat(cs.outlineWidth) === 2 && cs.outlineColor === want && a.content !== 'none' && a.width === '12px' && a.height === '12px' && a.backgroundColor === want && /polygon/.test(a.clipPath); }).filter(Boolean).length,
    rowH: [...new Set([...document.querySelectorAll('#chart tbody tr')].map(tr => Math.round(tr.getBoundingClientRect().height)))],
    srLabels: [...document.querySelectorAll('#chart button.cell-hit')].filter(b => /changed for your new rules/.test(b.getAttribute('aria-label'))).length };
});
const p11 = await newPage(1280, 900);
await p11.goto(URL0);
const first = await readDiff(p11);
c11.push({ n: 'first load: no markers, no count line, rows 52px', v: first.marked === 0 && first.badges === 0 && first.hidden && first.rowH.length === 1 && first.rowH[0] === 52, x: JSON.stringify({ marked: first.marked, hidden: first.hidden, rowH: first.rowH }) });
await p11.goto(URL0 + '?decks=1&soft17=stands&das=no&surrender=none');
const q1 = await readDiff(p11);
c11.push({ n: '?query load: no markers, no count line', v: q1.marked === 0 && q1.badges === 0 && q1.hidden, x: JSON.stringify({ marked: q1.marked, hidden: q1.hidden }) });
// 216 transitions by real clicks
let nTr = 0, trBad = [], minN = 1e9, maxN = 0, zero = 0, one = 0;
const t11 = Date.now();
for (const c of snap) for (const [f, nm, vals] of RF) for (const v of vals) {
  if (v === c.rules[f]) continue;
  await p11.evaluate(r => window.ChipyCheatSheet.setRules(r), c.rules);
  await rl(p11, nm, v).click();
  const nr = { ...c.rules, [f]: v };
  const exp = diffExpected(c, byRules.get(key(nr)));
  const got = await readDiff(p11);
  nTr++;
  const num = got.text.startsWith('No ') ? 0 : parseInt(got.text, 10);
  const wording = exp.n === 0 ? 'No moves changed for your new rules' : exp.n === 1 ? '1 move changed for your new rules' : `${exp.n} moves changed for your new rules`;
  const sameKeys = got.keys.length === exp.set.size && got.keys.every(k => exp.set.has(k));
  minN = Math.min(minN, exp.n); maxN = Math.max(maxN, exp.n); if (!exp.n) zero++; if (exp.n === 1) one++;
  if (got.marked !== exp.n || num !== exp.n || got.text !== wording || !sameKeys || got.badges !== 0 || got.marker !== exp.n || !(got.rowH.length === 1 && got.rowH[0] === 52) || got.srLabels !== exp.n || got.hidden)
    trBad.push(`${c.id} ${f}->${v}: expected ${exp.n}, marked ${got.marked}, styled ${got.marker}, rowH ${got.rowH}, text "${got.text}", textBadges ${got.badges}, sr ${got.srLabels}, sameCells ${sameKeys}`);
}
c11.push({ n: `${nTr} neighbouring transitions by real rule-panel clicks: marked cells (data-changed=1), each with dashed 2px inner outline + 12px corner triangle (::after; white on Surrender, #1a1d22 otherwise), no 'Changed' text in cells, all 30 rows 52px, screen-reader labels and the number in the count line == cells whose move differs in snapshot; exact cells; exact wording`, v: nTr === 216 && trBad.length === 0, x: `${nTr} transitions (${((Date.now() - t11) / 1000).toFixed(0)} s), expected counts min ${minN} max ${maxN}, ${zero} with 0, ${one} with 1; mismatches ${trBad.length}${trBad.length ? ' e.g. ' + trBad.slice(0, 3).join(' ; ') : ''}` });
// replace / dismiss / no-change
await p11.goto(URL0);
await rl(p11, 'rule-decks', '1').click();
const a1 = await readDiff(p11);
await rl(p11, 'rule-decks', '1').click(); // same value: nothing new
const a1b = await readDiff(p11);
await rl(p11, 'rule-soft17', 'stands').click();
const a2 = await readDiff(p11);
const e1 = diffExpected(byRules.get('4-8|hits|yes|any'), byRules.get('1|hits|yes|any')).n, e2 = diffExpected(byRules.get('1|hits|yes|any'), byRules.get('1|stands|yes|any')).n;
c11.push({ n: 'next rule change replaces the diff with the one against the previous rules; clicking the already-chosen value changes nothing', v: a1.marked === e1 && a1.marker === e1 && a1b.marked === e1 && a1b.text === a1.text && a2.marked === e2 && a2.text.startsWith(String(e2)), x: `4-8->1: ${a1.marked}/${e1}; same click ${a1b.marked}; then S17: ${a2.marked}/${e2} "${a2.text}"` });
await p11.locator('[data-diff-dismiss]').click();
const dm = await readDiff(p11);
c11.push({ n: 'Dismiss clears marks and the count line', v: dm.marked === 0 && dm.badges === 0 && dm.hidden, x: JSON.stringify({ marked: dm.marked, badges: dm.badges, hidden: dm.hidden }) });
// table mode: result marked exactly when move changed
async function tableTransition(from, field, nm, val) {
  const to = { ...from, [field]: val };
  const a = byRules.get(key(from)), b = byRules.get(key(to));
  const p = await newPage(1280, 900);
  await p.goto(URL0);
  await p.evaluate(r => window.ChipyCheatSheet.setRules(r), from);
  await p.locator('#mode-switch').getByText('Table mode').click();
  await p.locator('#rules-toggle').click();
  let bad = [], marked = 0, tot = 0;
  for (const h of HANDS) for (let j = 0; j < 10; j++) {
    await p.evaluate(({ r, h, d }) => { const A = window.ChipyCheatSheet; A.setRules(r); A.selectHand(h); A.selectDealer(d); }, { r: from, h: h.key, d: D[j] });
    if (await p.locator('[data-diff-dismiss]').count()) await p.locator('[data-diff-dismiss]').click(); // real Dismiss; setRules(from) just made a to->from diff
    const before = await p.evaluate(() => !!document.querySelector('#table-result .sa-changed'));
    await rl(p, nm, val).click();
    const info = await p.evaluate(() => ({ chg: !!document.querySelector('#table-result .sa-changed'), txt: document.querySelector('#table-result .sa-changed')?.textContent.trim(), move: document.querySelector('#table-result .sa-rec-move')?.dataset.move }));
    const em = a.tables[h.table].find(r => r.label === h.row).cells[j].move, nmv = b.tables[h.table].find(r => r.label === h.row).cells[j].move;
    tot++; if (em !== nmv) marked++;
    if (before || info.chg !== (em !== nmv) || info.move !== nmv || (info.chg && info.txt !== 'Changed for your new rules')) bad.push(`${h.text} vs ${D[j]}: ${em}->${nmv} marker=${info.chg} shown=${info.move}`);
  }
  await p.context().close();
  return { n: tot, changed: marked, bad };
}
const tmA = await tableTransition({ decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' }, 'decks', 'rule-decks', '1');
const tmB = await tableTransition({ decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' }, 'surrender', 'rule-surrender', 'none');
const tmC = await tableTransition({ decks: '2', soft17: 'stands', das: 'no', surrender: 'none' }, 'soft17', 'rule-soft17', 'hits');
c11.push({ n: 'table mode: result card says "Changed for your new rules" exactly when its move changed (not before the change; real rule click)', v: [tmA, tmB, tmC].every(t => t.bad.length === 0 && t.changed > 0), x: [tmA, tmB, tmC].map((t, i) => `T${i + 1}: ${t.n} hand x dealer pairs, ${t.changed} changed, ${t.bad.length} mismatches${t.bad.length ? ' e.g. ' + t.bad[0] : ''}`).join('; ') });
// print: no marks, no count line while a diff is showing
await p11.goto(URL0);
await rl(p11, 'rule-decks', '1').click();
const preChg = (await readDiff(p11)).marked;
const printTexts = {};
await p11.emulateMedia({ media: 'print' });
for (const m of ['full', 'pocket']) {
  await p11.evaluate(m => { document.documentElement.dataset.print = m; }, m);
  printTexts[m] = await p11.evaluate(() => ({ body: document.body.innerText, vis: [...document.querySelectorAll('.chg, .diff-note, .sa-changed, [data-changed]')].filter(e => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }).length }));
  await p11.evaluate(m => { document.documentElement.dataset.print = m; }, m); // flag right before pdf()
  const buf = await p11.pdf({ format: 'A4', landscape: m === 'pocket', printBackground: true });
  printTexts[m].pages = pageCount(buf);
  printTexts[m].pdf = pdfText(buf).replace(/\s+/g, ' ');
}
await p11.emulateMedia({ media: 'screen' });
await p11.evaluate(() => { delete document.documentElement.dataset.print; });
c11.push({ n: 'print output (full and pocket, with a diff showing on screen) has no "Changed"/"moves changed" text and no visible badge/outline element', v: preChg > 0 && ['full', 'pocket'].every(m => !/changed/i.test(printTexts[m].body) && !/changed/i.test(printTexts[m].pdf) && printTexts[m].pdf.length > 500 && printTexts[m].vis === 0 && printTexts[m].pages === 1), x: `diff showing ${preChg} cells; ` + ['full', 'pocket'].map(m => `${m}: print-media text has "changed"=${/changed/i.test(printTexts[m].body)}, PDF text has "changed"=${/changed/i.test(printTexts[m].pdf)} (${printTexts[m].pdf.length} chars), visible marker elements ${printTexts[m].vis}, ${printTexts[m].pages} page`).join('; ') + ' (method: print-media rendered text + text read from the PDF + Chrome PDF page count)' });
// screenshots + marker legibility
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const p = await newPage(w, h);
  await p.goto(URL0);
  await rl(p, 'rule-decks', '1').click();
  await p.waitForTimeout(200);
  const d = await readDiff(p);
  const vis = await p.evaluate(() => { const n = document.getElementById('diff-note').getBoundingClientRect(); return { top: Math.round(n.top), h: Math.round(n.height) }; });
  await p.screenshot({ path: path.join(SHOTS, `rules-changed-${w}.png`), fullPage: true });
  c11.push({ n: `screenshot rules-changed-${w}.png (4-8 -> 1 deck): count line + marks`, v: d.marked > 0 && !d.hidden && vis.h > 0 && d.marker === d.marked && d.rowH.length === 1 && d.rowH[0] === 52 && d.badges === 0, x: `"${d.text}", ${d.marked} marked cells, ${d.marker} with dashed outline + 12px triangle, row heights ${d.rowH}, no Changed text in cells` });
  if (w === 390) {
    const el = await p.locator('#chart [data-changed="1"]').first();
    await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox();
    await p.screenshot({ path: path.join(PW_DIR, 'marker-crop-390.png'), clip: { x: Math.max(0, bb.x - 10), y: Math.max(0, bb.y - 10), width: 200, height: bb.height + 20 } });
  }
}
row(11, 'What your rules change (S-20, D-067)', c11.every(x => x.v), c11.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c11.filter(x => !x.v)) find('high', 'Check 11: ' + x.n + ' ' + x.x);


// =====================================================================
// CHECK 12: visual vs Figma (S-21, D-076): side-by-side images, prototype LEFT, Figma RIGHT
// =====================================================================
const c12 = [];
const SCREENS = [
  ['default-chart', 'cs-default-chart', async p => {}],
  ['reason-panel', 'cs-reason-panel', async p => { await p.locator('#chart-hard button.cell-hit[data-erow="16"][data-dealer="10"]').click(); await p.waitForTimeout(200); }],
  ['rules-changed', 'cs-rules-changed', async p => { await rl(p, 'rule-decks', '1').click(); await p.waitForTimeout(250); }],
  ['table-mode-result', 'cs-table-mode-result', async p => {
    await p.locator('#mode-switch').getByText('Table mode').click();
    await p.locator('#table-pick button[data-act="hand"][data-val="hard:16"]').click();
    await p.locator('#table-pick button[data-act="dealer"][data-val="10"]').click(); await p.waitForTimeout(400); }],
];
const compCtx = await browser.newContext({ viewport: { width: 800, height: 600 } });
const tokens = {};
for (const [w, h] of [[1280, 900], [390, 844]]) {
  for (const [name, figBase, setup] of SCREENS) {
    const p = await newPage(w, h);
    await p.goto(URL0); await p.waitForTimeout(200);
    await setup(p);
    const box = await p.evaluate(() => { const r = document.querySelector('main.shell').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    const mg = w === 1280 ? 40 : 8;
    const y0 = Math.max(0, Math.floor(box.top - mg)), y1 = Math.ceil(box.bottom + mg);
    const protoBuf = await p.screenshot({ fullPage: true, clip: { x: 0, y: y0, width: w, height: y1 - y0 } });
    tokens[`${name}-${w}`] = await p.evaluate(() => { const g = (s, pr = 'color') => { const e = document.querySelector(s); return e ? getComputedStyle(e)[pr] : null; };
      return { title: g('h1'), cardH: Math.round(document.querySelector('main.shell').getBoundingClientRect().height), unselected: g('#rule-panel label:not(:has(input:checked)) span, #rule-panel label:not(:has(input:checked))') }; });
    const figBuf = fs.readFileSync(path.join(FIG, `${figBase}-${w}.png`));
    const fh = figBuf.readUInt32BE(20);
    const uri = b => 'data:image/png;base64,' + b.toString('base64');
    const html = `<html><body style="margin:0;background:#888;font:600 14px Arial"><div style="display:flex;gap:12px;align-items:flex-start;width:${2 * w + 12}px">` +
      `<div style="width:${w}px"><div style="background:#222;color:#fff;padding:6px 10px">Prototype</div><img style="display:block;width:${w}px" src="${uri(protoBuf)}"></div>` +
      `<div style="width:${w}px"><div style="background:#222;color:#fff;padding:6px 10px">Figma</div><img style="display:block;width:${w}px" src="${uri(figBuf)}"></div></div></body></html>`;
    const cp = await compCtx.newPage();
    await cp.setViewportSize({ width: 2 * w + 12, height: 600 });
    await cp.setContent(html); await cp.waitForLoadState('load');
    const out = path.join(VIS, `${name}-${w}-side-by-side.png`);
    await cp.screenshot({ path: out, fullPage: true });
    await cp.close();
    const ok = fs.existsSync(out) && fs.statSync(out).size > 5000;
    c12.push({ n: `${name} @${w}`, v: ok, x: `prototype crop ${w}x${y1 - y0}, figma ${w}x${fh}` });
    await p.context().close();
  }
}
await compCtx.close();
row(12, 'Visual vs Figma side-by-sides (automated part: images built; verdict per screen in the report)', c12.every(x => x.v) && c12.length === 8, c12.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
console.log('tokens', JSON.stringify(tokens));


await browser.close();

// =====================================================================
// CHECK 7: whole run
// =====================================================================
const bad7 = consoleMsgs.filter(m => ['error', 'warning'].includes(m.type));
const nonFile = requests.filter(u => !u.startsWith(URL0));
row(7, 'Whole run: no console errors/warnings/page errors; no network except the file',
  bad7.length === 0 && pageErrors.length === 0 && nonFile.length === 0 && !requests.some(u => /chipy\.com/.test(u)),
  `requests to chipy.com ${requests.filter(u => /chipy\.com/.test(u)).length} (link is navigational only, never clicked); console messages total ${consoleMsgs.length} (errors/warnings ${bad7.length}${bad7.length ? ': ' + bad7.slice(0, 3).map(m => m.text).join(' ; ') : ''}), page errors ${pageErrors.length}, requests ${requests.length} (${new Set(requests.map(u => u.split('?')[0])).size} unique URL: ${[...new Set(requests.map(u => u.split('?')[0]))].join(', ')}), non-file requests ${nonFile.length}`);
rows.sort((a, b) => a.n - b.n);

console.log('\n| # | Check | Result | Evidence |\n|---|---|---|---|');
for (const r of rows) console.log(`| ${r.n} | ${r.name} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.ev.replace(/\|/g, '/')} |`);
console.log('\nRe-check items');
console.log(`- Tap targets under 44px (390 wide, per state):\n    ${tapReport}`);
console.log(`- Title contrast: ${JSON.stringify(contrast)}`);
console.log(`- Print dialog URL/date headers: manual, not automatable. Escape after tap on iOS Safari: out of reach (note only).`);
console.log('\nFindings');
for (const f of findings) console.log(`- [${f.sev}] ${f.text}`);
if (!findings.length) console.log('- none from automated checks');
process.exit(rows.some(r => !r.pass) ? 1 : 0);
