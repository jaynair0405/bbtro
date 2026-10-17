'use strict';
// duelist.upsertMonitoring versioning, currentState and monitoringFor — local DB, cleans up.
// Fixture crew ids ZZT0001..3 (no real lobby has that prefix) on throwaway dates in 2031.
const assert = require('assert');
const pool = require('../../config/database');
const store = require('../../lib/cmsReports/store');
const dl = require('../../lib/cmsReports/duelist');

const mkRow = (crewId, o = {}) => ({
  crewId, cliId: o.cli || 'ZZCL01', cliName: 'TEST CLI', name: o.name || `NAME ${crewId}`, desig: 'LPM',
  status: o.status || 'REST', grade: o.grade || 'A', cliAlloted: '01-01-2031', prevGrade: 'B', prevGradeDate: '31-02-2029', // invalid -> NULL
  params: {
    footplate:   { done: '01-01-2031', due: o.fpDue || '01-03-2031', dueISO: null, overdue: false, remark: 'fp' },
    grading:     { done: '01-01-2031', due: '01-01-2033', dueISO: null, overdue: false },
    counselling: { done: '02-01-2031', due: '02-03-2031', dueISO: null, overdue: false, subject: 'subj' },
  },
});
const report = { key: dl.KEY, dateOffset: 0, tables: [], warnings: [] };
const mkLoad = (date) => store.saveLoad({ report, facts: { counts: [], crew: [] }, sheetDate: date,
  files: [{ name: 't.csv.gz', buffer: Buffer.from('x') }], hand: null, user: 'test', lobby: null });

(async () => {
  const loads = [];
  try {
    // Make sure no stale fixture rows exist (and no real 'duelist' loads on these dates)
    await pool.query("DELETE FROM cms_crew_monitoring WHERE cms_id LIKE 'ZZT%'");
    // Real crew already stored locally (a browser test, prod data) count as absent from every fixture file.
    const [[{ others }]] = await pool.query("SELECT COUNT(*) others FROM cms_crew_monitoring WHERE is_current = 1 AND cms_id NOT LIKE 'ZZT%'");
    const abs = (n) => n + Number(others);

    const l1 = await mkLoad('2031-02-01'); loads.push(l1.id);
    let r = await dl.upsertMonitoring([mkRow('ZZT0001'), mkRow('ZZT0002'), mkRow('ZZT0003'), mkRow('ZZT0003')], l1.id, '2031-02-01');
    assert.deepStrictEqual(r, { added: 3, changed: 0, unchanged: 0, absent: abs(0), dupes: 1, cut: 0 });
    const [[a]] = await pool.query("SELECT DATE_FORMAT(prev_grade_date,'%Y-%m-%d') pgd, DATE_FORMAT(fp_due,'%Y-%m-%d') fp_due, status, lobby FROM cms_crew_monitoring WHERE cms_id='ZZT0001' AND is_current=1");
    assert.strictEqual(a.pgd, null);              // 31-02-2029 is not a date
    assert.strictEqual(a.fp_due, '2031-03-01'); assert.strictEqual(a.status, 'REST'); assert.strictEqual(a.lobby, 'ZZT');

    // Same tracked fields, different status -> no new version, last_seen moves
    const l2 = await mkLoad('2031-02-02'); loads.push(l2.id);
    r = await dl.upsertMonitoring([mkRow('ZZT0001', { status: 'SIGNON' }), mkRow('ZZT0002'), mkRow('ZZT0003')], l2.id, '2031-02-02');
    assert.deepStrictEqual(r, { added: 0, changed: 0, unchanged: 3, absent: abs(0), dupes: 0, cut: 0 });
    const [[b]] = await pool.query("SELECT COUNT(*) n, MAX(status) status, DATE_FORMAT(MAX(last_seen),'%Y-%m-%d') ls, MAX(last_load_id) ll FROM cms_crew_monitoring WHERE cms_id='ZZT0001'");
    assert.strictEqual(Number(b.n), 1); assert.strictEqual(b.status, 'SIGNON'); assert.strictEqual(b.ls, '2031-02-02'); assert.strictEqual(Number(b.ll), l2.id);

    // One crew's due date changes, one crew is absent from the file
    const l3 = await mkLoad('2031-02-03'); loads.push(l3.id);
    r = await dl.upsertMonitoring([mkRow('ZZT0001', { fpDue: '15-03-2031' }), mkRow('ZZT0002')], l3.id, '2031-02-03');
    assert.deepStrictEqual(r, { added: 0, changed: 1, unchanged: 1, absent: abs(1), dupes: 0, cut: 0 });
    const [hist] = await pool.query("SELECT id, is_current, DATE_FORMAT(fp_due,'%Y-%m-%d') fp_due, DATE_FORMAT(first_seen,'%Y-%m-%d') fs FROM cms_crew_monitoring WHERE cms_id='ZZT0001' ORDER BY id");
    assert.strictEqual(hist.length, 2);
    assert.deepStrictEqual(hist.map((h) => [Number(h.is_current), h.fp_due, h.fs]), [[0, '2031-03-01', '2031-02-01'], [1, '2031-03-15', '2031-02-03']]);
    const [[c3]] = await pool.query("SELECT is_current, DATE_FORMAT(last_seen,'%Y-%m-%d') ls FROM cms_crew_monitoring WHERE cms_id='ZZT0003'");
    assert.strictEqual(Number(c3.is_current), 1); assert.strictEqual(c3.ls, '2031-02-02');   // absent crew kept as it stood
    const [[one]] = await pool.query("SELECT COUNT(*) n FROM cms_crew_monitoring WHERE cms_id LIKE 'ZZT%' AND is_current=1");
    assert.strictEqual(Number(one.n), 3);

    // currentState: the latest load + rows in page shape
    const st = await dl.currentState();
    assert.strictEqual(st.stored.id, l3.id); assert.strictEqual(st.stored.dataDate, '2031-02-03'); assert.strictEqual(st.stored.by, 'test');
    assert.strictEqual(st.generatedAtIST, '2031-02-03');
    const z1 = st.rows.find((x) => x.crewId === 'ZZT0001');
    assert.strictEqual(z1.params.footplate.due, '15-03-2031'); assert.strictEqual(z1.params.footplate.dueISO, '2031-03-15');
    assert.strictEqual(z1.params.footplate.overdue, false); assert.strictEqual(z1.params.footplate.remark, 'fp');
    assert.strictEqual(z1.params.counselling.subject, 'subj'); assert.strictEqual(z1.cliId, 'ZZCL01'); assert.strictEqual(z1.status, 'REST');   // the new version carries the third file's status
    assert.strictEqual(z1.prevGradeDate, '');
    // Absent from the latest file -> not in the stored report (a fresh upload would not list it either),
    // but its current row stays for the bio-profile.
    assert.ok(!st.rows.find((x) => x.crewId === 'ZZT0003'), 'absent crew must not be in the stored report');
    assert.ok(st.rows.find((x) => x.crewId === 'ZZT0002'));
    assert.strictEqual((await dl.monitoringFor('ZZT0003')).asOf, '2031-02-02');
    // Same-day re-upload of the latest load: `earlier` counts the retired one
    const l3b = await mkLoad('2031-02-03'); loads.push(l3b.id);
    assert.strictEqual((await dl.currentState()).stored.earlier, 1);

    // monitoringFor: the crew's current row with the date of the load that last confirmed it
    const m = await dl.monitoringFor('zzt0001');
    assert.strictEqual(m.fpDone, '2031-01-01'); assert.strictEqual(m.fpDue, '2031-03-15'); assert.strictEqual(m.asOf, '2031-02-03');
    assert.strictEqual(m.grade, 'A'); assert.strictEqual(m.cliName, 'TEST CLI');
    assert.strictEqual(await dl.monitoringFor('ZZT9999'), null);
    // Dates must be strings, never JS Dates
    assert.strictEqual(typeof m.fpDone, 'string');

    // A crew id longer than the VARCHAR(15) column is cut, counted, and does not fail the upload.
    const l4 = await mkLoad('2031-02-03'); loads.push(l4.id);
    r = await dl.upsertMonitoring([mkRow('ZZT0001', { fpDue: '15-03-2031' }), mkRow('ZZT0002'), mkRow('ZZT00099999999999999')], l4.id, '2031-02-03');
    assert.strictEqual(r.cut, 1);
    assert.strictEqual(r.added, 1);
    assert.ok(await dl.monitoringFor('ZZT000999999999'), 'stored under the first 15 characters');

    // A change of letter case alone (MySQL compares case-insensitively) is not a new version.
    const l5 = await mkLoad('2031-02-03'); loads.push(l5.id);
    const lower = mkRow('ZZT0002'); lower.cliName = 'Test Cli'; lower.name = lower.name.toLowerCase();
    r = await dl.upsertMonitoring([lower], l5.id, '2031-02-03');
    assert.strictEqual(r.changed, 0, 'case-only change must not version'); assert.strictEqual(r.unchanged, 1);
    const [[n2]] = await pool.query("SELECT COUNT(*) n FROM cms_crew_monitoring WHERE cms_id = 'ZZT0002'");
    assert.strictEqual(Number(n2.n), 1);

    // Two uploads at once (saveUpload serialises them): afterwards every current fixture row
    // must point at the load that is current, never at the one it retired.
    // Forced bad interleaving: the first saveLoad returns late, so without serialisation the
    // second upload stores AND updates the crew before the first one's crew update runs.
    const file = { name: 't.csv', buffer: Buffer.from('x') };
    const realSave = store.saveLoad; let delayed = false;
    store.saveLoad = async (a) => { const out = await realSave(a); if (!delayed) { delayed = true; await new Promise((r) => setTimeout(r, 400)); } return out; };
    const [s1, s2] = await Promise.all([
      dl.saveUpload({ rows: [mkRow('ZZT0001', { fpDue: '20-03-2031' }), mkRow('ZZT0002')], warnings: [], file, user: 'test', dataDate: '2031-02-04' }),
      dl.saveUpload({ rows: [mkRow('ZZT0001', { fpDue: '21-03-2031' }), mkRow('ZZT0002')], warnings: [], file, user: 'test', dataDate: '2031-02-04' }),
    ]);
    store.saveLoad = realSave;
    loads.push(s1.id, s2.id);
    const [[cur]] = await pool.query("SELECT id FROM cms_daily_loads WHERE report_key = ? AND data_date = '2031-02-04' AND lobby IS NULL AND is_current = 1", [dl.KEY]);
    const [bad] = await pool.query("SELECT cms_id, last_load_id FROM cms_crew_monitoring WHERE cms_id IN ('ZZT0001','ZZT0002') AND is_current = 1 AND last_load_id <> ?", [cur.id]);
    assert.deepStrictEqual(bad, [], 'current crew rows must point at the current load');
    const [[n1]] = await pool.query("SELECT COUNT(*) n FROM cms_crew_monitoring WHERE cms_id = 'ZZT0001' AND is_current = 1");
    assert.strictEqual(Number(n1.n), 1);
  } finally {
    await pool.query("DELETE FROM cms_crew_monitoring WHERE cms_id LIKE 'ZZT%'");
    if (loads.length) await pool.query('DELETE FROM cms_daily_loads WHERE id IN (?)', [loads]);
    await pool.end();
  }
  console.log('duelistMonitoring.test.js OK');
})().catch(async (e) => { console.error(e); process.exit(1); });
