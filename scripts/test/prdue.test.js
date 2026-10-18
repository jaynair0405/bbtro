'use strict';
// HQ PR due: the sheet block prints BOTH columns — a 7-day row and a 3-month row — and hand
// entry may give the 3-month counts (blank = not entered, row cell empty, nothing stored).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mod = require('../../lib/cmsReports/prdue');

const parsed = mod.parse(fs.readFileSync(path.join(__dirname, '../../data/cms-report/lobby-upload/pr_due_hq_17-10.csv')));
assert.strictEqual(parsed.lobbies.length, 10);
const [main, detail] = mod.tables(parsed);
assert.deepStrictEqual(main.headers, ['Crew / Lobby', 'CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL', 'VVH', 'CSTS', 'KYNS', 'PNVS']);
assert.strictEqual(main.rows.length, 2);
assert.deepStrictEqual(main.rows[0], ['No PR in last 7 days', 39, 1, 71, 0, 9, 0, 1, 2, 4]);
assert.deepStrictEqual(main.rows[1], ['No PR in last 3 months', 3, 0, 3, 0, 0, 0, 2, 0, 0]);
assert.strictEqual(detail.rows.length, 10);
const f = mod.facts(parsed).counts;
assert.strictEqual(f.find((c) => c.lobby === 'KYN' && c.measure === 'm3').value, 3);
assert.strictEqual(f.find((c) => c.lobby === 'DIVISION' && c.measure === 'm3').value, 8);

// Hand entry: 7-day only -> 3-month row blank, no m3 facts
const keys = mod.manual.fields.map((x) => x.key);
assert.ok(keys.includes('KYN') && keys.includes('KYN_m3'), keys.join());
const SIX = { CSMT: '5', CSTS: '0', IGP: '0', KYN: '7', KYNS: '0', LNLX: '0', PNVL: '1', PNVS: '0', VVH: '0' };
const h1 = mod.manual.build(SIX);
assert.deepStrictEqual(mod.tables(h1)[0].rows[1], ['No PR in last 3 months', '', '', '', '', '', '', '', '', '']);
assert.ok(mod.facts(h1).counts.every((c) => c.measure === 'd7'));
// Hand entry with some 3-month counts: those lobbies stored, others blank, no DIVISION m3 (incomplete)
const h2 = mod.manual.build({ ...SIX, KYN_m3: '2', CSMT_m3: '' });
assert.deepStrictEqual(mod.tables(h2)[0].rows[1], ['No PR in last 3 months', '', '', 2, '', '', '', '', '', '']);
const f2 = mod.facts(h2).counts;
assert.strictEqual(f2.find((c) => c.lobby === 'KYN' && c.measure === 'm3').value, 2);
assert.ok(!f2.find((c) => c.lobby === 'CSMT' && c.measure === 'm3'));
assert.ok(!f2.find((c) => c.lobby === 'DIVISION' && c.measure === 'm3'));
assert.throws(() => mod.manual.build({ ...SIX, KYN_m3: 'x' }), /KYN.*3 months/);
// 18-10: suburban lobbies (CSTS / KYNS / PNVS) on the sheet too, after the mainline ones; LNL stays in the detail only.
{
  const p = mod.parse(fs.readFileSync(path.join(__dirname, '../../data/cms-report/pr_due_18-10-26.csv')));
  const [m] = mod.tables(p);
  assert.deepStrictEqual(m.headers, ['Crew / Lobby', 'CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL', 'VVH', 'CSTS', 'KYNS', 'PNVS']);
  assert.deepStrictEqual(m.rows[0], ['No PR in last 7 days', 62, 2, 89, 2, 10, 0, 4, 0, 1]);
  assert.deepStrictEqual(m.rows[1], ['No PR in last 3 months', 7, 0, 6, 1, 0, 0, 1, 0, 0]);
  assert.ok(mod.manual.fields.some((f) => f.key === 'CSTS') && mod.manual.fields.some((f) => f.key === 'PNVS_m3'));
}
console.log('prdue.test.js OK');
