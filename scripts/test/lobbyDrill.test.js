'use strict';
const assert = require('assert');
const pool = require('../../config/database');
const store = require('../../lib/cmsReports/store');
const ls = require('../../lib/cmsReports/lobbyStore');
const drill = require('../../lib/cmsReports/lobbyDrill');

(async () => {
  const D = '2031-01-02';
  const report = { key: 'fsd', dateOffset: 1, tables: [], warnings: [] };
  const lb = await store.saveLoad({ report, facts: { counts: [], crew: [
    { lobby: 'CSMT', cmsId: 'CSMT0001', name: 'A', measure: 'n', eventTime: '2031-01-01 07:00:00', detail: { itemKey: '2031-01-01 07:00', cols: ['CSMT0001', 'A', '01-01 07:00', 'CSMT', '—'] } },
  ] }, sheetDate: D, files: [{ name: 'lb.csv', buffer: Buffer.from('y') }], hand: null, user: 'csmtmljrcc', lobby: 'CSMT' });
  await ls.saveRemark({ reportKey: 'fsd', lobby: 'CSMT', cmsId: 'CSMT0001', itemKey: '2031-01-01 07:00', remark: 'issued late', user: 'csmtmljrcc' });

  // The FSD sheet table as the HQ page holds it (headers per fsd.tables()[0]).
  const reports = [{ key: 'fsd', label: 'Lobbywise FSD Details', dateOffset: 1, tables: [{ title: 'FSD', headers: ['Sr No.', 'Lobby', 'FSD (Y)', 'FSD (N)', 'Total'], rows: [[1, 'CSMT', 10, 1, 11], [2, 'KYN', 5, 0, 5]], total: null }] }];
  await drill.attach(reports, D);
  const t = reports[0].tables[0];
  const d = t.drill.find((x) => x.r === 0);
  assert.ok(d, 'CSMT N count gets a drill');
  assert.strictEqual(d.c, drill.COLS.fsd.count);
  assert.deepStrictEqual(d.headers.slice(-2), ['Lobby remark', 'By']);
  assert.strictEqual(d.rows.length, 1);
  assert.strictEqual(d.rows[0][d.headers.length - 2], 'issued late');
  assert.match(d.lobbyNote, /csmtmljrcc/);
  const k = t.drill.find((x) => x.r === 1);
  assert.strictEqual(k.rows.length, 0);
  assert.match(k.lobbyNote, /not uploaded/);

  // Names-from-HQ report: an existing drill gains the remark columns, matched by crew id.
  await ls.saveRemark({ reportKey: 'safetydue', lobby: 'CSMT', cmsId: 'CSMT0002', itemKey: 'ASIG|15-01-2031', remark: 'slot booked', user: 'csmtmljrcc' });
  const sd = [{ key: 'safetydue', label: 'PME/REFT/ASIG', dateOffset: 0, tables: [{ title: 'x', headers: ['Month', 'Lobby', 'ASIG', 'Total'], rows: [['Jan', 'CSMT', 1, 1]],
    drill: [{ r: 0, c: 2, title: 'CSMT ASIG', headers: ['Crew ID', 'Crew Name', 'Due Date'], rows: [['CSMT0002', 'B', '15-01-2031'], ['CSMT0003', 'C', '15-01-2031']], crewCol: 0 }] }] }];
  await drill.attach(sd, D);
  const e = sd[0].tables[0].drill[0];
  assert.deepStrictEqual(e.headers.slice(-2), ['Lobby remark', 'By']);
  assert.strictEqual(e.rows[0][3], 'slot booked');
  assert.strictEqual(e.rows[1][3], '');

  await pool.query('DELETE FROM cms_daily_loads WHERE id = ?', [lb.id]);
  await pool.query("DELETE FROM cms_lobby_remarks WHERE cms_id IN ('CSMT0001','CSMT0002') AND report_key IN ('fsd','safetydue')");
  await pool.end();
  console.log('lobbyDrill.test.js OK');
})().catch(async (e) => { console.error(e.message); await pool.end(); process.exit(1); });
