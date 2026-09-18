'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseDate,nextDue,expectedEnd}=require('../lib/trainingCentreDates');
test('Agreed renewal examples',()=>{
    assert.equal(nextDue('2026-09-15',6),'2027-03-14');
    assert.equal(nextDue('2026-09-15',36),'2029-09-14');
});
test('Calendar months clamp month-end and leap-day before subtracting a day',()=>{
    assert.equal(nextDue('2024-02-29',36),'2027-02-27');
    assert.equal(nextDue('2026-08-31',6),'2027-02-27');
    assert.equal(nextDue('2023-08-31',6),'2024-02-28');
});
test('Working duration includes joining day but excludes Sundays and centre holidays',()=>{
    assert.equal(expectedEnd('2026-09-19',1,[]),'2026-09-19');
    assert.equal(expectedEnd('2026-09-19',2,[]),'2026-09-21');
    assert.equal(expectedEnd('2026-09-19',2,['2026-09-21']),'2026-09-22');
});
test('Reject invalid dates and durations',()=>{
    for(const value of ['2026-02-29','2026-13-01','15-09-2026',''])assert.throws(()=>parseDate(value));
    assert.throws(()=>expectedEnd('2026-09-15',0));
    assert.throws(()=>nextDue('2026-09-15',0));
});
