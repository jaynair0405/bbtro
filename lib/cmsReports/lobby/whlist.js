'use strict';

/*
 * CMS duty list (sign-on to sign-off) filtered by a lobby to its ">14 Hours" band — the
 * list behind the Working Hours count. Same 25-column layout as the suburban duty list,
 * so the parsing is subhours.js's. One DUTY spans several rows (one per leg) under one
 * S.No.; the first leg has the SIGNON DATE, the last the SIGNOFF DATE. Lobby = crew id
 * letters (KYN, CSTS …), so one list serves Mainline and Suburban.
 */
const subhours = require('../subhours');

// subhours warns when no suburban crew is in the file — right for HQ's page, noise here.
function parseWh(buffer) {
  const p = subhours.parse(buffer);
  return { rows: p.rows, warnings: p.warnings.filter((w) => !/CSTS, KYNS or PNVS/.test(w)) };
}

// "14-10-2026 18:30" -> parts
function dt(raw) {
  const m = String(raw == null ? '' : raw).trim().match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (!m) return null;
  return { sql: `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`, min: `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}`, date: `${m[3]}-${m[2]}-${m[1]}`, show: `${m[1]}-${m[2]} ${m[4]}:${m[5]}` };
}
const totalMins = (t) => { const m = String(t || '').match(/^(\d{1,3}):(\d{1,2})$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };

// Legs -> duties: a leg with a sign-on starts a duty; a leg without one continues the
// same crew's current duty.
function duties(parsed) {
  const out = [];
  let cur = null;
  parsed.rows.forEach((r) => {
    const on = dt(r.onDate);
    if (on || !cur || cur.crewId !== r.crewId) {
      cur = { crewId: r.crewId, lobby: r.lobby, name: r.name, desig: r.desig, total: r.total, on, legs: [] };
      out.push(cur);
    }
    cur.legs.push(r);
  });
  return out;
}

const headers = ['Crew ID', 'Name', 'Desig.', 'Total duty', 'Sign on', 'Sign off', 'Trains'];

function items(parsed) {
  const ds = duties(parsed);
  const short = ds.filter((d) => (totalMins(d.total) || 0) <= 14 * 60);
  if (short.length) {
    throw new Error(`${short.length} of ${ds.length} duties are not over 14 hours — download the ">14 Hours" list only.`);
  }
  return ds.map((d) => {
    const off = dt(d.legs[d.legs.length - 1].offDate);
    return {
      lobby: d.lobby, cmsId: d.crewId, name: d.name, desig: d.desig, measure: 'b8',
      itemKey: d.on ? d.on.min : `${d.crewId}|${d.total}`, eventTime: d.on ? d.on.sql : null,
      cols: [d.crewId, d.name, d.desig, d.total, d.on ? d.on.show : '—', off ? off.show : '—',
        d.legs.map((l) => l.train).filter(Boolean).join(', ')],
    };
  });
}

function checkDate(parsed, { dataDate }) {
  const dates = [...new Set(duties(parsed).map((d) => d.on && d.on.date).filter(Boolean))];
  if (dates.length === 1 && dates[0] === dataDate) return null;
  if (dates.length === 0) return { unchecked: 'no sign-on dates in the file' };
  const show = (d) => d.split('-').reverse().join('-');
  return { error: `sign-ons are dated ${dates.map(show).join(', ')} — this sheet needs ${show(dataDate)}.` };
}

module.exports = { key: 'whlist', label: 'Working Hours over 14 h', drills: 'dutyhours', alsoDrills: ['subhours'], dateOffset: 2,
  measure: 'b8', headers, matchesHeader: subhours.matchesHeader, parse: parseWh, items, checkDate };
