'use strict';
function parseDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Use a valid YYYY-MM-DD date');
    const d = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw new Error('Use a valid calendar date');
    return d;
}
const iso = d => d.toISOString().slice(0, 10);
function nextDue(completion, months) {
    const d = parseDate(completion);
    if (!Number.isInteger(months) || months < 1) throw new Error('Validity must be positive calendar months');
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + months);
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last));
    d.setUTCDate(d.getUTCDate() - 1);
    return iso(d);
}
function expectedEnd(joining, days, holidays = []) {
    const d = parseDate(joining), excluded = new Set(holidays);
    if (!Number.isInteger(days) || days < 1 || days > 366) throw new Error('Invalid course duration');
    let counted = 0;
    for (let i = 0; i < 2000; i++) {
        if (d.getUTCDay() !== 0 && !excluded.has(iso(d))) counted++;
        if (counted === days) return iso(d);
        d.setUTCDate(d.getUTCDate() + 1);
    }
    throw new Error('Too many excluded dates');
}
module.exports = { parseDate, nextDue, expectedEnd };
