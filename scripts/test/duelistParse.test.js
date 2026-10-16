'use strict';
// Due List parser: the five added fields + the 26-column positional fallback.
// Overdue counts are asserted BY DATE (as of 2026-10-16), never by the parser's
// today-dependent `overdue` flag.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseCmsReport, buildColumnMap } = require('../../lib/cmsReport');

const file = path.join(__dirname, '../../data/cms-report/FP_GR_COUN.csv');
const r = parseCmsReport(fs.readFileSync(file));
assert.strictEqual(r.rows.length, 3559);
assert.deepStrictEqual(r.warnings, []);

const a = r.rows[0];
assert.strictEqual(a.crewId, 'CSMT2989');
assert.strictEqual(a.cliId, 'CSTM0001');
assert.strictEqual(a.cliAlloted, '07-02-2026');
assert.strictEqual(a.prevGrade, 'A');
assert.strictEqual(a.prevGradeDate, '01-02-2023');
assert.strictEqual(a.params.grading.done, '12-05-2026');
assert.strictEqual(a.params.counselling.done, '21-09-2026');          // "/CSTM0001" stripped
assert.ok(a.params.counselling.subject.startsWith('PREVENTION of SPAD'), 'counselling subject');
assert.strictEqual(a.params.footplate.remark, 'Footplate Monitoring &  counselling');
// Existing fields untouched
assert.strictEqual(a.grade, 'A'); assert.strictEqual(a.status, 'ABSEN'); assert.strictEqual(a.desig, 'LPM');
assert.strictEqual(a.params.footplate.dueISO, '2026-12-20');
assert.strictEqual(a.remark, undefined);                               // exports own `remark`

const withDue = (k) => r.rows.filter((x) => x.params[k].dueISO).length;
assert.strictEqual(withDue('footplate'), 1828);
assert.strictEqual(withDue('grading'), 1830);
assert.strictEqual(withDue('counselling'), 1828);
const overdueOn = (k, d) => r.rows.filter((x) => x.params[k].dueISO && x.params[k].dueISO <= d).length;
assert.strictEqual(overdueOn('footplate', '2026-10-16'), 97);
assert.strictEqual(overdueOn('grading', '2026-10-16'), 44);
assert.strictEqual(overdueOn('counselling', '2026-10-16'), 180);

// Positional fallback: one key header misspelt -> width decides the layout.
const hdr26 = fs.readFileSync(file, 'utf8').split('\n')[0].split('","').map((s) => s.replace(/"/g, ''));
assert.strictEqual(hdr26.length, 26);
const broken26 = hdr26.map((h) => (h === 'CREW ID' ? 'CREWX' : h));
const m26 = buildColumnMap(broken26);
assert.strictEqual(m26.mode, 'positional');
assert.strictEqual(m26.map.cliAlloted, 5);
assert.strictEqual(m26.map.desig, 6);
assert.strictEqual(m26.map.status, 7);
assert.strictEqual(m26.map.currentGrade, 11);
assert.deepStrictEqual(m26.map.footplate, { done: 20, due: 21 });
assert.strictEqual(m26.map.fpRemark, 22);
assert.ok(m26.warnings[0].includes('26-column'));
const m24 = buildColumnMap(new Array(24).fill('X'));
assert.strictEqual(m24.map.desig, 5);
assert.strictEqual(m24.map.status, null);
assert.strictEqual(m24.map.cliAlloted, null);
assert.strictEqual(m24.map.fpRemark, 20);
assert.deepStrictEqual(m24.map.footplate, { done: 18, due: 19 });
const m25 = buildColumnMap(new Array(25).fill('X'));
assert.strictEqual(m25.map.status, 6);
assert.strictEqual(m25.map.fpRemark, 21);

console.log('duelistParse.test.js OK');
