'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mod = require('../../lib/cmsReports/lobby/wrworlist');
const lists = require('../../lib/cmsReports/lobbyLists');
const dir = path.join(__dirname, '../../data/cms-report/lobby-upload');
const read = (f) => fs.readFileSync(path.join(dir, f));

const wor = lists.processLobbyFile(read('WRWOR_KYN.csv'));          // 23-col WOR list
const w2w = lists.processLobbyFile(read('WRWOR_KYN2.csv'));         // 22-col WR→WOR list
assert.strictEqual(wor.key, 'wrworlist'); assert.strictEqual(w2w.key, 'wrworlist');

let it = mod.items(wor.parsed, { lobby: 'KYN' });
assert.strictEqual(it.length, 1);
assert.strictEqual(it[0].cmsId, 'KYN3906');
assert.strictEqual(it[0].measure, 'freight.wor.hq');     // DEPT counts as freight; HQ KYN booked at KYN
assert.strictEqual(it[0].itemKey, 'KYN/F/151026/10.153.201.210/83');
assert.deepStrictEqual(it[0].blocks, ['lobby', 'hq']);
assert.strictEqual(it[0].cols[3], 'WOR');
assert.strictEqual(it[0].cols[6], 'PRDUE / PR DUE');

it = mod.items(w2w.parsed, { lobby: 'KYN' });
assert.strictEqual(it[0].measure, 'freight.wrToWor.hq');
assert.strictEqual(it[0].cols[6], 'DUE-LR-M2-1179');

// Joining the lobbywise and HQ-wise downloads of the same booking gives ONE item.
const merged = mod.merge(w2w.parsed, lists.processLobbyFile(read('kyn-wrwor.csv')).parsed);
assert.strictEqual(mod.items(merged, { lobby: 'KYN' }).length, 1);

// A CSMT crew booked at RN counts HQ-wise for CSMT only.
const csmtHq = lists.processLobbyFile(read('csmt_wr-wor-.csv'));
it = mod.items(csmtHq.parsed, { lobby: 'CSMT' });
assert.strictEqual(it.length, 1);
assert.deepStrictEqual(it[0].blocks, ['hq']);
assert.strictEqual(it[0].measure, 'coachTa.wrToWor.os');   // CCHM = coaching, booked away from HQ = OS
assert.deepStrictEqual(mod.items(csmtHq.parsed, { lobby: 'RN' })[0].blocks, ['lobby']);  // booked AT RN: RN's lobbywise block (the route limits who may upload)

assert.deepStrictEqual(mod.checkDate(wor.parsed, { dataDate: '2026-10-15' }), null);
assert.ok(mod.checkDate(wor.parsed, { dataDate: '2026-10-14' }).error);
console.log('wrworlist.test.js OK');

// --- Review fix: items() works for the office's lobby SET and never hides other lobbies' rows.
{
  const hdr = fs.readFileSync(path.join(dir, 'WRWOR_KYN.csv'), 'utf8').split(/\r?\n/)[0];
  const row = (crew, hq, call) => `"1","${crew}","X","ALP","${hq}","TA-${crew}","15-10-2026 10:00","1","1","FGHT","${call}","WOR","WOR","PRDUE","PR DUE","15-10-2026 09:00","U","SU","U","U","SU","U","NA"`;
  const buf = Buffer.from([hdr, row('PNVL0001', 'PNVL', 'JNPN'), row('KYN0002', 'KYN', 'KYN')].join('\n'));
  const p = lists.processLobbyFile(buf).parsed;
  const it = mod.items(p, { lobbies: ['PNVL', 'JNPN', 'ROHA'] });
  assert.strictEqual(it.length, 2, 'every booking row is an item; the route decides what is foreign');
  const jn = it.find((i) => i.cmsId === 'PNVL0001');
  assert.strictEqual(jn.lobby, 'JNPN');                       // counted at the covered call lobby
  assert.deepStrictEqual(jn.blocks, ['lobby', 'hq']);         // JNPN lobbywise AND PNVL HQ-wise
  const ky = it.find((i) => i.cmsId === 'KYN0002');
  assert.strictEqual(ky.lobby, 'KYN');                        // not ours -> the route refuses the file
  // single-lobby form still works
  assert.strictEqual(mod.items(p, { lobby: 'KYN' }).find((i) => i.cmsId === 'KYN0002').lobby, 'KYN');
}
console.log('wrworlist.test.js (lobby set) OK');
