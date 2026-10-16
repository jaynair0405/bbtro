'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fsdn = require('../../lib/cmsReports/lobby/fsdn');
const lists = require('../../lib/cmsReports/lobbyLists');

const buf = fs.readFileSync(path.join(__dirname, '../../data/cms-report/lobby-upload/FSDN_IGP.csv'));
const got = lists.processLobbyFile(buf);
assert.strictEqual(got.key, 'fsdn');
assert.strictEqual(got.drills, 'fsd');
assert.strictEqual(got.dateOffset, 1);
const items = fsdn.items(got.parsed);
assert.strictEqual(items.length, 24);
assert.deepStrictEqual(new Set(items.map((i) => i.lobby)), new Set(['IGP']));
assert.strictEqual(items[0].cmsId, 'IGP2559');
assert.strictEqual(items[0].name, 'SHIV KUMAR DAHMA');
assert.strictEqual(items[0].measure, 'n');
assert.strictEqual(items[0].itemKey, '2026-10-15 23:49');
assert.strictEqual(items[0].eventTime, '2026-10-15 23:49:00');
assert.deepStrictEqual(fsdn.checkDate(got.parsed, { dataDate: '2026-10-15' }), null);
assert.ok(fsdn.checkDate(got.parsed, { dataDate: '2026-10-14' }).error);
// HQ's count file must not be taken as a lobby list.
assert.throws(() => lists.processLobbyFile(Buffer.from('"S.NO","ZONE","DIVISION","SIGN ON STATION","CREW DESIGNATION","FSD Y","FSD N","FSD ALL"\n')), /not a lobby list/i);
console.log('fsdn.test.js OK');
