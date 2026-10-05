// S-12 QA run for prototype/index.html (file://). Reports only; edits nothing but docs/qa/screenshots/*.png.
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
let pagesFail = [], textFail = [], pdfN = 0;
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
      const buf = await p5.pdf({ format: fmt, landscape: mode === 'pocket', printBackground: true, preferCSSPageSize: false });
      const n = pageCount(buf); pdfN++;
      if (n !== 1) pagesFail.push(`${c.id} ${mode} ${fmt}: ${n} pages`);
      if (c === snap[0] || c === snap[35]) fs.writeFileSync(path.join(PD, `${mode}-${fmt}-${snap.indexOf(c)}.pdf`), buf);
    }
  }
}
// also with preferCSSPageSize (pocket may set @page) for default
await p5.evaluate(() => { window.ChipyCheatSheet.setRules({ decks: '4-8', soft17: 'hits', das: 'yes', surrender: 'any' }); });
const cssPages = {};
for (const mode of ['full', 'pocket']) {
  await p5.evaluate(m => { document.documentElement.dataset.print = m; }, mode);
  for (const fmt of ['A4', 'Letter']) { const b = await p5.pdf({ format: fmt, landscape: mode === 'pocket', preferCSSPageSize: true, printBackground: true }); cssPages[`${mode}/${fmt}/css`] = pageCount(b); }
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
  const cellAria = [...document.querySelectorAll('button.cell-hit')].every(b => /: (Hit|Stand|Double|Split|Surrender)\./.test(b.getAttribute('aria-label') || ''));
  return { noWord, iconsHidden, noAria, cellAria };
});
c8.push({ n: 'icons never the only label (word in every cell, icons aria-hidden, every button named, cell buttons announce hand+dealer+move)', v: labels.noWord === 0 && labels.iconsHidden && labels.noAria === 0 && labels.cellAria, x: JSON.stringify(labels) });
const lang = await p8.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, viewport: document.querySelector('meta[name=viewport]')?.content }));
c8.push({ n: 'html lang, title, viewport meta present', v: !!lang.lang && !!lang.title && !!lang.viewport, x: JSON.stringify(lang) });
row(8, 'Keyboard + basic accessibility', c8.every(x => x.v), c8.map(x => (x.v ? 'ok' : 'FAIL') + ': ' + x.n + ' [' + x.x + ']').join(' | '));
for (const x of c8.filter(x => !x.v)) find('medium', 'Check 8: ' + x.n + ' ' + x.x);

await browser.close();

// =====================================================================
// CHECK 7: whole run
// =====================================================================
const bad7 = consoleMsgs.filter(m => ['error', 'warning'].includes(m.type));
const nonFile = requests.filter(u => !u.startsWith(URL0));
row(7, 'Whole run: no console errors/warnings/page errors; no network except the file',
  bad7.length === 0 && pageErrors.length === 0 && nonFile.length === 0,
  `console messages total ${consoleMsgs.length} (errors/warnings ${bad7.length}${bad7.length ? ': ' + bad7.slice(0, 3).map(m => m.text).join(' ; ') : ''}), page errors ${pageErrors.length}, requests ${requests.length} (${new Set(requests.map(u => u.split('?')[0])).size} unique URL: ${[...new Set(requests.map(u => u.split('?')[0]))].join(', ')}), non-file requests ${nonFile.length}`);
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
