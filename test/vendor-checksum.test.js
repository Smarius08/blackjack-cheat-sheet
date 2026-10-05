// Vendor checksum lock (story S-02, AGENTS.md section 9).
//
// Provenance: byte-for-byte copies, never edited.
//   ../chipy-blackjack-trainer/engine/strategy_table.js    -> engine/vendor/strategy_table.js
//   ../chipy-blackjack-trainer/engine/explanation_writer.js -> engine/vendor/explanation_writer.js
//   Source commit: 34f3fd5 (2026-09-21), chipy-blackjack-trainer.
//
// Any change to either vendor file, even one byte or whitespace, fails this test.
// No strategy behaviour is tested here.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const VENDOR_DIR = path.join(__dirname, '..', 'engine', 'vendor');

const EXPECTED = {
  'strategy_table.js': {
    size: 21414,
    sha256: 'b4e5823d83fe0074df3e2aa90170e529eced7288420d3bee45550700709c9a25',
  },
  'explanation_writer.js': {
    size: 9860,
    sha256: '70db6675e531ae169d10b2c149672483344d936bd3ca59ca25bae82bb1b67f84',
  },
};

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

for (const [name, want] of Object.entries(EXPECTED)) {
  test(`vendor ${name} is byte-identical to the Trainer original`, () => {
    const buf = fs.readFileSync(path.join(VENDOR_DIR, name));
    assert.equal(buf.length, want.size, `${name} size changed`);
    assert.equal(sha256(buf), want.sha256, `${name} SHA-256 changed`);
  });
}

test('checksum lock detects a one-byte change', () => {
  const buf = fs.readFileSync(path.join(VENDOR_DIR, 'strategy_table.js'));
  const changed = Buffer.from(buf);
  changed[0] = changed[0] ^ 0x01;
  assert.notEqual(sha256(changed), EXPECTED['strategy_table.js'].sha256);
  assert.notEqual(sha256(Buffer.concat([buf, Buffer.from(' ')])), EXPECTED['strategy_table.js'].sha256);
});

test('vendor modules load and expose the expected exports', () => {
  const st = require(path.join(VENDOR_DIR, 'strategy_table.js'));
  const ew = require(path.join(VENDOR_DIR, 'explanation_writer.js'));
  assert.equal(typeof st.STRATEGY_TABLE, 'object');
  assert.ok(st.STRATEGY_TABLE !== null);
  assert.equal(typeof st.resolveCode, 'function');
  assert.equal(typeof ew.getStrategyExplanation, 'function');
});
