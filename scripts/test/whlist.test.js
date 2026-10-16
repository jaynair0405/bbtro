'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mod = require('../../lib/cmsReports/lobby/whlist');
const lists = require('../../lib/cmsReports/lobbyLists');
const dir = path.join(__dirname, '../../data/cms-report/lobby-upload');
const read = (f) => fs.readFileSync(path.join(dir, f));

const kyn = lists.processLobbyFile(read('WH_ML+SUB_KYN.csv.csv'));   // >14 h, 2 duties over 5 rows
assert.strictEqual(kyn.key, 'whlist');
let it = mod.items(kyn.parsed);
assert.strictEqual(it.length, 2);
assert.strictEqual(it[0].cmsId, 'KYN3892');
assert.strictEqual(it[0].lobby, 'KYN');
assert.strictEqual(it[0].measure, 'b8');
assert.strictEqual(it[0].itemKey, '2026-10-14 18:30');
assert.strictEqual(it[0].cols[3], '15:45');                 // TOTAL DUTY
assert.strictEqual(it[1].cmsId, 'KYN5667');
assert.strictEqual(it[1].cols[5], '14-10 23:30');           // sign-off from the LAST leg
assert.deepStrictEqual(kyn.parsed.warnings, []);            // the suburban-filter warning does not apply here

const csts = lists.processLobbyFile(read('WH_ML+SUB_CSTS.csv'));
it = mod.items(csts.parsed);
assert.strictEqual(it[0].lobby, 'CSTS');
assert.strictEqual(it[0].cols[3], '31:26');

// A 12-14 h list is refused: this drill is >14 only.
const band = lists.processLobbyFile(read('WH_ML+SUB_KYN_12-14.csv'));
assert.throws(() => mod.items(band.parsed), /over 14 hours/);

assert.deepStrictEqual(mod.checkDate(kyn.parsed, { dataDate: '2026-10-14' }), null);
assert.ok(mod.checkDate(kyn.parsed, { dataDate: '2026-10-15' }).error);
console.log('whlist.test.js OK');
