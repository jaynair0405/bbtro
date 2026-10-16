'use strict';
const assert = require('assert');
const pool = require('../../config/database');
const store = require('../../lib/cmsReports/store');
const ls = require('../../lib/cmsReports/lobbyStore');

(async () => {
  const D = '2031-01-02';   // a date no real sheet uses
  const report = { key: 'fsd', dateOffset: 1, tables: [], warnings: [] };
  // HQ count for CSMT on data date D-1
  const hq = await store.saveLoad({ report, facts: { counts: [{ lobby: 'CSMT', measure: 'n', value: 2 }], crew: [] },
    sheetDate: D, files: [{ name: 'hq.csv', buffer: Buffer.from('x') }], hand: null, user: 'test' });
  // Lobby list of 3 names for the same date
  const lb = await store.saveLoad({ report, facts: { counts: [], crew: [
    { lobby: 'CSMT', cmsId: 'CSMT0001', name: 'A', measure: 'n', eventTime: '2031-01-01 07:00:00', detail: { itemKey: '2031-01-01 07:00', cols: [] } },
    { lobby: 'CSMT', cmsId: 'CSMT0002', name: 'B', measure: 'n', eventTime: null, detail: { itemKey: 'k2', cols: [] } },
    { lobby: 'DR',   cmsId: 'CSMT0003', name: 'C', measure: 'n', eventTime: null, detail: { itemKey: 'k3', cols: [] } },
  ] }, sheetDate: D, files: [{ name: 'lb.csv', buffer: Buffer.from('y') }], hand: null, user: 'csmtmljrcc', lobby: 'CSMT' });
  assert.notStrictEqual(hq.id, lb.id);
  assert.strictEqual(lb.replaced, null);          // the lobby load does NOT retire HQ's
  const [[hqRow]] = await pool.query('SELECT is_current FROM cms_daily_loads WHERE id = ?', [hq.id]);
  assert.strictEqual(Number(hqRow.is_current), 1);

  const cnt = await ls.hqCount('fsd', 'CSMT', ['n'], '2031-01-01');
  assert.strictEqual(cnt.value, 2);
  assert.strictEqual(await ls.hqCount('fsd', 'KYN', ['n'], '2031-01-01'), null);   // no figure for KYN
  assert.strictEqual(await ls.hqCount('fsd', 'CSMT', ['n'], '2031-01-05'), null);  // HQ not loaded that day

  const cur = await ls.currentList('fsd', 'CSMT', '2031-01-01');
  assert.strictEqual(cur.loadId, lb.id);
  assert.strictEqual(cur.crew.length, 3);
  assert.strictEqual(cur.by, 'csmtmljrcc');
  const [[src]] = await pool.query('SELECT DISTINCT source FROM cms_daily_crew WHERE load_id = ?', [lb.id]);
  assert.strictEqual(src.source, 'lobby');
  // HQ's day view must not pick up the lobby load.
  const day = await store.loadDay(D, [{ key: 'fsd', label: 'FSD', order: 1, dateOffset: 1 }]);
  assert.strictEqual(day.length, 1); assert.strictEqual(day[0].saved.id, hq.id);

  // Remarks: write, edit, withdraw -> 3 rows, then none current.
  const r1 = await ls.saveRemark({ reportKey: 'fsd', lobby: 'CSMT', cmsId: 'CSMT0001', itemKey: '2031-01-01 07:00', remark: 'first', user: 'csmtmljrcc' });
  assert.ok(r1.id);
  await ls.saveRemark({ reportKey: 'fsd', lobby: 'CSMT', cmsId: 'CSMT0001', itemKey: '2031-01-01 07:00', remark: 'second', user: 'csmtmljrcc' });
  let m = await ls.remarksFor('fsd', ['CSMT', 'DR'], { cmsIds: ['CSMT0001'] });
  assert.strictEqual(m.get('CSMT0001|2031-01-01 07:00').remark, 'second');
  const w = await ls.saveRemark({ reportKey: 'fsd', lobby: 'CSMT', cmsId: 'CSMT0001', itemKey: '2031-01-01 07:00', remark: '', user: 'csmtmljrcc' });
  assert.strictEqual(w.withdrawn, true);
  m = await ls.remarksFor('fsd', ['CSMT'], { cmsIds: ['CSMT0001'] });
  assert.strictEqual(m.size, 0);
  const [[hist]] = await pool.query("SELECT COUNT(*) n, SUM(is_current) cur FROM cms_lobby_remarks WHERE cms_id='CSMT0001' AND report_key='fsd'");
  assert.strictEqual(Number(hist.n), 2); assert.strictEqual(Number(hist.cur), 0);

  // Clean up
  await pool.query('DELETE FROM cms_daily_loads WHERE id IN (?)', [[hq.id, lb.id]]);   // cascades counts + crew
  await pool.query("DELETE FROM cms_lobby_remarks WHERE cms_id = 'CSMT0001' AND report_key = 'fsd'");
  await pool.end();
  console.log('lobbyStore.test.js OK');
})().catch(async (e) => { console.error(e.message); await pool.end(); process.exit(1); });
