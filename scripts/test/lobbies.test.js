'use strict';
const assert = require('assert');
const { lobbyOf, canWriteLobby, lobbiesOf } = require('../../lib/cmsReports/lobbies');

assert.deepStrictEqual(lobbyOf('CSMT-ML'), { lobby: 'CSMT', covers: ['DR'] });
assert.deepStrictEqual(lobbyOf('PNVL-ML'), { lobby: 'PNVL', covers: ['JNPN', 'ROHA'] });
assert.deepStrictEqual(lobbyOf('LNL'), { lobby: 'LNLX', covers: ['LNL'] });
assert.deepStrictEqual(lobbyOf('CSMT-SUB'), { lobby: 'CSTS', covers: [] });
assert.strictEqual(lobbyOf('CLA'), null);
assert.strictEqual(lobbyOf(undefined), null);
assert.deepStrictEqual(lobbiesOf('CSMT-ML'), ['CSMT', 'DR']);

const jrcc = { div_role: 'jrcc', div_office_code: 'CSMT-ML', realm: 'division' };
const srcc = { div_role: 'office_hr', div_office_code: 'CSMT-ML', realm: 'division' };
const hq = { div_role: 'clicms', div_office_code: 'CSMT-HQ', realm: 'division' };
assert.strictEqual(canWriteLobby(jrcc, 'CSMT'), true);
assert.strictEqual(canWriteLobby(jrcc, 'DR'), true);
assert.strictEqual(canWriteLobby(srcc, 'CSMT'), true);
assert.strictEqual(canWriteLobby(jrcc, 'KYN'), false);
assert.strictEqual(canWriteLobby(hq, 'CSMT'), false);
assert.strictEqual(canWriteLobby(null, 'CSMT'), false);
console.log('lobbies.test.js OK');
