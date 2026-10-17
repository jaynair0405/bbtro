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
assert.deepStrictEqual(main.headers, ['Crew / Lobby', 'CSMT', 'IGP', 'KYN', 'LNLX', 'PNVL', 'VVH']);
assert.strictEqual(main.rows.length, 2);
assert.deepStrictEqual(main.rows[0], ['No PR in last 7 days', 39, 1, 71, 0, 9, 0]);
assert.deepStrictEqual(main.rows[1], ['No PR in last 3 months', 3, 0, 3, 0, 0, 0]);
assert.strictEqual(detail.rows.length, 10);
const f = mod.facts(parsed).counts;
assert.strictEqual(f.find((c) => c.lobby === 'KYN' && c.measure === 'm3').value, 3);
assert.strictEqual(f.find((c) => c.lobby === 'DIVISION' && c.measure === 'm3').value, 8);

// Hand entry: 7-day only -> 3-month row blank, no m3 facts
const keys = mod.manual.fields.map((x) => x.key);
assert.ok(keys.includes('KYN') && keys.includes('KYN_m3'), keys.join());
const h1 = mod.manual.build({ CSMT: '5', IGP: '0', KYN: '7', LNLX: '0', PNVL: '1', VVH: '0' });
assert.deepStrictEqual(mod.tables(h1)[0].rows[1], ['No PR in last 3 months', '', '', '', '', '', '']);
assert.ok(mod.facts(h1).counts.every((c) => c.measure === 'd7'));
// Hand entry with some 3-month counts: those lobbies stored, others blank, no DIVISION m3 (incomplete)
const h2 = mod.manual.build({ CSMT: '5', IGP: '0', KYN: '7', LNLX: '0', PNVL: '1', VVH: '0', KYN_m3: '2', CSMT_m3: '' });
assert.deepStrictEqual(mod.tables(h2)[0].rows[1], ['No PR in last 3 months', '', '', 2, '', '', '']);
const f2 = mod.facts(h2).counts;
assert.strictEqual(f2.find((c) => c.lobby === 'KYN' && c.measure === 'm3').value, 2);
assert.ok(!f2.find((c) => c.lobby === 'CSMT' && c.measure === 'm3'));
assert.ok(!f2.find((c) => c.lobby === 'DIVISION' && c.measure === 'm3'));
assert.throws(() => mod.manual.build({ CSMT: '5', IGP: '0', KYN: '7', LNLX: '0', PNVL: '1', VVH: '0', KYN_m3: 'x' }), /KYN.*3 months/);
console.log('prdue.test.js OK');
