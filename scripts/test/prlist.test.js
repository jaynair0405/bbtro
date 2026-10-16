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
assert.deepStrictEqual(it[0].cols, ['CSMT6162', 'NANDKISHOR JADHAV', 'LPG', '7', '07-10 16:04', 'REST']);
const pnvl = lists.processLobbyFile(fs.readFileSync(path.join(dir, 'PRDUE_PNVL.csv')));
assert.strictEqual(mod.items(pnvl.parsed).length, 12);
assert.deepStrictEqual(mod.checkDate(csmt.parsed, { dataDate: '2026-10-15' }), { unchecked: 'the PR due list carries no run date' });
console.log('prlist.test.js OK');
