'use strict';
// duelist.buildFacts: counts per lobby + DIVISION, overdue crew rows, due30 boundaries.
// Pure (no DB). Overdue is computed against the data date passed in, not today.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseCmsReport } = require('../../lib/cmsReport');
const dl = require('../../lib/cmsReports/duelist');

assert.strictEqual(dl.KEY, 'duelist');
assert.strictEqual(dl.lobbyOfCrewId('CSMT2989'), 'CSMT');
assert.strictEqual(dl.lobbyOfCrewId('KYNS0123'), 'KYNS');
assert.strictEqual(dl.lobbyOfCrewId('csts1abc'), 'CSTS');
assert.strictEqual(dl.lobbyOfCrewId(''), 'UNKNOWN');

const file = path.join(__dirname, '../../data/cms-report/FP_GR_COUN.csv');
const { rows } = parseCmsReport(fs.readFileSync(file));
const f = dl.buildFacts(rows, '2026-10-16');
const div = (m) => f.counts.find((c) => c.lobby === 'DIVISION' && c.measure === m).value;
assert.strictEqual(div('footplate.overdue'), 97);
assert.strictEqual(div('counselling.overdue'), 180);
assert.strictEqual(div('grading.overdue'), 44);
assert.strictEqual(div('footplate.total'), 1828);
assert.strictEqual(div('crew.total'), 3559);
assert.strictEqual(['A', 'B', 'C', 'D', 'none'].reduce((s, g) => s + div(`grade.${g}`), 0), 3559);
// Per-lobby figures add up to the division's
const lobbies = [...new Set(f.counts.map((c) => c.lobby))].filter((l) => l !== 'DIVISION');
assert.ok(lobbies.includes('CSMT') && lobbies.includes('KYNS'), lobbies.join());
const sumLobby = (m) => f.counts.filter((c) => c.lobby !== 'DIVISION' && c.measure === m).reduce((s, c) => s + c.value, 0);
assert.strictEqual(sumLobby('footplate.overdue'), 97);
assert.strictEqual(sumLobby('crew.total'), 3559);
// Every lobby carries every measure (zeros included — trend queries see 0, not a gap)
const measures = new Set(f.counts.filter((c) => c.lobby === 'DIVISION').map((c) => c.measure));
lobbies.forEach((l) => assert.strictEqual(f.counts.filter((c) => c.lobby === l).length, measures.size, l));
// Crew rows: only the overdue, one per (param, crew)
assert.strictEqual(f.crew.length, 97 + 180 + 44);
f.crew.forEach((c) => {
  assert.ok(/\.overdue$/.test(c.measure));
  assert.ok(/^\d{4}-\d{2}-\d{2} 00:00:00$/.test(c.eventTime), c.eventTime);
  assert.ok(c.detail.cli && c.detail.due && c.cmsId && c.lobby);
});

// due30 boundary on a hand-built fixture (data date 2026-10-16)
const mk = (crewId, due) => ({ crewId, cliId: 'X', cliName: 'X', name: 'N', desig: 'LPM', grade: '',
  params: { footplate: { done: '', due, dueISO: due ? due.split('-').reverse().join('-') : null },
    grading: { done: '', due: '', dueISO: null }, counselling: { done: '', due: '', dueISO: null } } });
const g = dl.buildFacts([mk('CSMT0001', '16-10-2026'), mk('CSMT0002', '17-10-2026'), mk('CSMT0003', '15-11-2026'),
  mk('CSMT0004', '16-11-2026'), mk('CSMT0005', '')], '2026-10-16');
const gd = (m) => g.counts.find((c) => c.lobby === 'DIVISION' && c.measure === m).value;
assert.strictEqual(gd('footplate.overdue'), 1);   // due = data date -> overdue
assert.strictEqual(gd('footplate.due30'), 2);     // +1 and +30 days
assert.strictEqual(gd('footplate.total'), 4);     // the blank due is not counted
assert.strictEqual(gd('grade.none'), 5);
assert.strictEqual(g.crew.length, 1);

// buildReport: one totals table for tables_json
const rep = dl.buildReport(f, ['w1']);
assert.strictEqual(rep.key, 'duelist'); assert.strictEqual(rep.dateOffset, 0);
assert.strictEqual(rep.tables.length, 1); assert.strictEqual(rep.tables[0].rows.length, 3);
assert.deepStrictEqual(rep.warnings, ['w1']);

console.log('duelistFacts.test.js OK');
