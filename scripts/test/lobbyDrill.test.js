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
  assert.deepStrictEqual(d.headers.slice(2, 4), ['Lobby remark', 'By']);
  assert.strictEqual(d.rows.length, 1);
  assert.strictEqual(d.rows[0][2], 'issued late');
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

  // --- Review fixes ---
  // (a) A covered lobby (DR under CSMT): its list is stored under CSMT; the DR row's drill must find it.
  const lb2 = await store.saveLoad({ report, facts: { counts: [], crew: [
    { lobby: 'CSMT', cmsId: 'CSMT0001', name: 'A', measure: 'n', eventTime: '2031-01-01 07:00:00', detail: { itemKey: '2031-01-01 07:00', cols: ['CSMT0001', 'A', '01-01 07:00', 'CSMT', '—'] } },
    { lobby: 'DR',   cmsId: 'CSMT0009', name: 'D', measure: 'n', eventTime: '2031-01-01 08:00:00', detail: { itemKey: '2031-01-01 08:00', cols: ['CSMT0009', 'D', '01-01 08:00', 'DR', '—'] } },
  ] }, sheetDate: D, files: [{ name: 'lb2.csv', buffer: Buffer.from('z') }], hand: null, user: 'csmtmljrcc', lobby: 'CSMT' });
  await ls.saveRemark({ reportKey: 'fsd', lobby: 'CSMT', cmsId: 'CSMT0009', itemKey: '2031-01-01 08:00', remark: 'DR remark', user: 'csmtmljrcc' });
  const r2 = [{ key: 'fsd', label: 'FSD', dateOffset: 1, tables: [{ title: 'FSD', headers: ['Sr No.', 'Lobby', 'FSD (Y)', 'FSD (N)', 'Total'], rows: [[1, 'CSMT', 10, 1, 11], [2, 'DR', 2, 1, 3]], total: null }] }];
  await drill.attach(r2, D);
  const dCsmt = r2[0].tables[0].drill.find((x) => x.r === 0);
  const dDr = r2[0].tables[0].drill.find((x) => x.r === 1);
  assert.strictEqual(dCsmt.rows.length, 1, 'CSMT row shows only CSMT crew');
  assert.strictEqual(dDr.rows.length, 1, 'DR row finds the list stored under CSMT');
  assert.strictEqual(dDr.rows[0][2], 'DR remark', 'DR remark stored under CSMT is found');
  assert.match(dDr.lobbyNote, /csmtmljrcc/);

  // (b) Working Hours Sub: HQ's own duty-list drill is kept (remark columns added), not replaced.
  const sub = [{ key: 'subhours', label: 'Working Hours Suburban', dateOffset: 2, tables: [{ title: 'x', headers: ['Sr No.', 'Lobby', '>09<=12 Hours', '>12<=14 Hours', '>14 Hours'], rows: [[1, 'CSTS', 0, 0, 1]],
    drill: [{ r: 0, c: 4, title: 'CSTS over 14', headers: ['Crew ID', 'Name', 'Sign On', 'At', 'Sign Off', 'At', 'Duty Hrs', 'Duty Type', 'Train'], rows: [['CSTS2232', 'AMARNATH', '14-10 11:42', 'CSTS', '15-10 19:08', 'CSTS', '31:26', 'WR', 'P/GN37']], crewCol: 0 }] }] }];
  await drill.attach(sub, D);
  const ds = sub[0].tables[0].drill.find((x) => x.r === 0 && x.c === 4);
  assert.strictEqual(ds.title, 'CSTS over 14', "HQ's drill survives");
  assert.strictEqual(ds.headers.length, 11, 'nine HQ columns + Lobby remark + By');
  assert.ok(!ds.lobbyNote || !/Lobby list from/.test(ds.lobbyNote), "HQ's file is not attributed to the lobby");

  await pool.query('DELETE FROM cms_daily_loads WHERE id IN (?)', [[lb.id, lb2.id]]);
  await pool.query("DELETE FROM cms_lobby_remarks WHERE cms_id = 'CSMT0009' AND report_key = 'fsd'");
  await pool.query("DELETE FROM cms_lobby_remarks WHERE cms_id IN ('CSMT0001','CSMT0002') AND report_key IN ('fsd','safetydue')");
  await pool.end();
  console.log('lobbyDrill.test.js OK');
})().catch(async (e) => { console.error(e.message); await pool.end(); process.exit(1); });
