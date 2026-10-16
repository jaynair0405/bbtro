'use strict';
const assert = require('assert');
const pool = require('../../config/database');
const store = require('../../lib/cmsReports/store');
const day = require('../../lib/cmsReports/lobbyDay');

(async () => {
  const D = '2031-01-03';   // a date no real sheet uses; subhours data date = D-2
  const report = { key: 'subhours', dateOffset: 2, tables: [], warnings: [] };
  // HQ's suburban report names only CSTS: a mainline lobby has no row in it.
  const hq = await store.saveLoad({ report, facts: { counts: [{ lobby: 'CSTS', measure: 'b8', value: 1 }], crew: [] },
    sheetDate: D, files: [{ name: 'hq.csv', buffer: Buffer.from('x') }], hand: null, user: 'test' });
  const card = day.CARDS.find((c) => c.key === 'subhours');
  try {
    const csts = await day.hqFigure(card, ['CSTS'], '2031-01-01');
    assert.strictEqual(csts.value, 1);
    // Loaded, but nothing for CSMT: a figure of 0, not "HQ has not loaded".
    const csmt = await day.hqFigure(card, ['CSMT', 'DR'], '2031-01-01');
    assert.ok(csmt, 'CSMT must get a figure when HQ loaded the report');
    assert.strictEqual(csmt.value, 0);
    assert.ok(csmt.loadedAt);
    // Truly not loaded: null.
    assert.strictEqual(await day.hqFigure(card, ['CSMT'], '2031-01-05'), null);
  } finally {
    await pool.query('DELETE FROM cms_daily_counts WHERE load_id = ?', [hq.id]);
    await pool.query('DELETE FROM cms_daily_loads WHERE id = ?', [hq.id]);
    await pool.end();
  }
  console.log('lobbyDay OK');
})().catch((e) => { console.error(e); process.exit(1); });
