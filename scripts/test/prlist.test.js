'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mod = require('../../lib/cmsReports/lobby/prlist');
const lists = require('../../lib/cmsReports/lobbyLists');
const dir = path.join(__dirname, '../../data/cms-report/lobby-upload');

const csmt = lists.processLobbyFile(fs.readFileSync(path.join(dir, 'PRDUE_CSMT.csv')));
assert.strictEqual(csmt.key, 'prlist');
const it = mod.items(csmt.parsed);
assert.strictEqual(it.length, 48);
assert.strictEqual(it[0].cmsId, 'CSMT6162');          // '@' padding stripped
assert.strictEqual(it[0].lobby, 'CSMT');              // LOBBY CODE column
assert.strictEqual(it[0].name, 'NANDKISHOR JADHAV');
assert.strictEqual(it[0].desig, 'LPG');
assert.strictEqual(it[0].measure, 'd7');
assert.strictEqual(it[0].itemKey, '2026-10-07 16:04');
assert.deepStrictEqual(it[0].cols, ['CSMT6162', 'NANDKISHOR JADHAV', 'LPG', '7 d', '07-10 16:04', 'REST']);
const pnvl = lists.processLobbyFile(fs.readFileSync(path.join(dir, 'PRDUE_PNVL.csv')));
assert.strictEqual(mod.items(pnvl.parsed).length, 12);
assert.deepStrictEqual(mod.checkDate(csmt.parsed, { dataDate: '2026-10-15' }), { unchecked: 'the PR due list carries no run date' });
console.log('prlist.test.js OK');

// 17-10: the 7-day list and the 3-month list share a header. Rows tell them apart — '@' + 'Y/ n'
// = no PR in 7 days (d7), '#' + '-' = no PR in 3 months (m3) — and the two files merge into one list.
{
  const k7 = lists.processLobbyFile(fs.readFileSync(path.join(dir, 'kyn_pr_17-10.csv')));
  const k3 = lists.processLobbyFile(fs.readFileSync(path.join(dir, 'kyn_3months_17-10.csv')));
  assert.strictEqual(k7.key, 'prlist'); assert.strictEqual(k3.key, 'prlist');
  const i7 = mod.items(k7.parsed), i3 = mod.items(k3.parsed);
  assert.strictEqual(i7.length, 71); assert.ok(i7.every((i) => i.measure === 'd7'));
  assert.strictEqual(i3.length, 3); assert.ok(i3.every((i) => i.measure === 'm3'));
  assert.strictEqual(i3[0].cmsId, 'KYN6053');                          // '#' padding stripped
  assert.strictEqual(i3[0].itemKey, 'KYN6053|none');                   // no last PR
  assert.deepStrictEqual(i3[0].cols, ['KYN6053', 'SIDDHESH S GAWADE', 'ALP', '3 months', '—', 'SGNOFF']);
  assert.deepStrictEqual(i7[0].cols.slice(3, 5), ['7 d', '08-10 16:15']);
  const merged = mod.items(mod.merge(k7.parsed, k3.parsed));
  assert.strictEqual(merged.length, 74);
  assert.strictEqual(merged.filter((i) => i.measure === 'm3').length, 3);
  assert.strictEqual(mod.items(mod.merge(k7.parsed, k7.parsed)).length, 71);   // same file twice = once
  assert.strictEqual(mod.headers[3], 'No PR for');
}
console.log('prlist.test.js merge OK');
