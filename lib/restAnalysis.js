'use strict';

/*
 * Rest analysis over parsed CMS sign-on/off files. Pure: no DB, no Express.
 *
 * Two reports come out of the same pass over each motorman's duties, ordered by
 * actual sign-on time:
 *
 *   Report 1 "double" — the two legs of a booked double detail (an evening leg and
 *     the next-morning leg, ~5-6 h booked between). Compares the rest the crew was
 *     BOOKED (from the details table clock times) with the rest they ACTUALLY got
 *     (kiosk sign-off to kiosk sign-on). A late sign-off on the first leg eats into
 *     the rest, which is the safety question this answers.
 *
 *   Report 2 "extra" — a second duty the same day with no booked pairing: the gap
 *     between sign-off of one duty and sign-on of the next is short (< EXTRA_DUTY_MAX_GAP).
 *
 * Everything else is an ordinary rest and is counted but not reported.
 *
 * Grouping is by CREW ID across ALL uploaded files, never per file: in the sample
 * data 17 motormen signed on at a lobby that is not their own, and per-file grouping
 * would have silently dropped every one of their pairs.
 */

const { parseDutyHours, minutesToTimeString, calculateCrossMidnightDutyHours } = require('../utils/helpers');

const MIN = 60 * 1000;

// Defaults, all overridable per run and stored with the run so an old run keeps its rule.
const DEFAULTS = {
  floorMinutes: 300,           // 5:00 — hard floor for double-detail rest
  extraDutyMaxGapMinutes: 240, // 4:00 — same boundary the detail classifier uses for a double
};

// CMS crew-id prefix -> suburban office. Crew id, not the file's lobby: crew sign on away from home.
const OFFICE_BY_PREFIX = { CSTS: 'CSMT', KYNS: 'KYN', PNVS: 'PNVL' };

function officeForCrew(crewId) {
  const m = String(crewId || '').match(/^([A-Z]{4})/);
  return (m && OFFICE_BY_PREFIX[m[1]]) || null;
}

const minutesBetween = (a, b) => Math.round((b - a) / MIN);

// Booked rest between two details: sign-off clock of the first to sign-on clock of the
// second. Both are TIME columns with no date, so this must wrap midnight.
function bookedRestMinutes(d1, d2) {
  if (!d1 || !d2 || !d1.sign_off_time || !d2.sign_on_time) return null;
  return calculateCrossMidnightDutyHours(d1.sign_off_time, d2.sign_on_time);
}

/*
 * analyse({ files, details, options })
 *   files   – array of parseSignOnFile() results
 *   details – Map (or plain object) keyed by detail_number ->
 *             { detail_id, detail_number, detail_type, cycle_anchor, sign_on_time,
 *               sign_off_time, total_duty_hours, line, ambiguous? }
 *   options – { floorMinutes, extraDutyMaxGapMinutes }
 *
 * Returns { doubles, extras, totals, coverage, unknownSets, warnings }
 */
function analyse({ files = [], details, options = {} } = {}) {
  const opt = { ...DEFAULTS, ...options };
  const get = (setNo) => {
    if (!details) return null;
    if (typeof details.get === 'function') return details.get(String(setNo)) || null;
    return details[String(setNo)] || null;
  };

  const warnings = [];
  files.forEach((f) => warnings.push(...(f.warnings || [])));

  // 1. Union all rows, dedupe — a duty can appear in two overlapping report windows.
  const seen = new Set();
  const duties = [];
  for (const f of files) {
    for (const r of f.rows || []) {
      const key = `${r.crewId}|${r.setNo}|${r.signOn.getTime()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      duties.push(r);
    }
  }
  const duplicatesDropped = seen.size < files.reduce((n, f) => n + (f.rows || []).length, 0)
    ? files.reduce((n, f) => n + (f.rows || []).length, 0) - seen.size
    : 0;

  // 2. Group by crew, sorted by actual sign-on.
  const byCrew = new Map();
  for (const d of duties) {
    if (!byCrew.has(d.crewId)) byCrew.set(d.crewId, []);
    byCrew.get(d.crewId).push(d);
  }
  for (const list of byCrew.values()) list.sort((a, b) => a.signOn - b.signOn);

  const doubles = [];
  const extras = [];
  const unknownSets = new Map(); // setNo -> count
  let ordinaryRests = 0;
  let unpairedCrew = 0;
  let negativeGaps = 0;

  for (const [crewId, list] of byCrew) {
    if (list.length < 2) { unpairedCrew++; continue; }

    for (let i = 0; i + 1 < list.length; i++) {
      const a = list[i];
      const b = list[i + 1];
      const actual = minutesBetween(a.signOff, b.signOn);

      const da = get(a.setNo);
      const db = get(b.setNo);
      if (!da) unknownSets.set(a.setNo, (unknownSets.get(a.setNo) || 0) + 1);
      if (!db) unknownSets.set(b.setNo, (unknownSets.get(b.setNo) || 0) + 1);

      // Overlapping duties: sign-on of the next before sign-off of the previous.
      // Real (a kiosk sign-off is sometimes recorded late) but not a rest — flag it.
      if (actual < 0) negativeGaps++;

      const base = {
        crewId,
        crewName: a.crewName || b.crewName,
        office: officeForCrew(crewId),
        det1: a.setNo,
        det1On: a.signOn,
        det1Off: a.signOff,
        det1Line: da ? da.line : null,
        det2: b.setNo,
        det2On: b.signOn,
        det2Off: b.signOff,
        det2Line: db ? db.line : null,
        actualRestMinutes: actual,
        actualRest: minutesToTimeString(actual),
        spanMinutes: minutesBetween(a.signOn, b.signOff),
      };

      // A booked pairing means detail B is the IMMEDIATE next leg of detail A in the
      // crew cycle. Sharing a cycle_anchor is not enough: a triple cycle anchors three
      // legs, so a crew who worked leg 1 and later leg 3 (77 -> 79, a day apart) would
      // otherwise be read as a double and its "rest" computed as 0:16 instead of 24:16.
      // next_detail_id is the cycle successor; fall back to the anchor only where the
      // chain is not filled in.
      const isBookedDouble =
        da && db &&
        da.detail_type === 'double' && db.detail_type === 'double' &&
        da.cycle_anchor && db.cycle_anchor && da.cycle_anchor === db.cycle_anchor &&
        (da.next_detail_id ? da.next_detail_id === db.detail_id : true);

      if (isBookedDouble) {
        const booked = bookedRestMinutes(da, db);
        const shortfall = booked == null ? null : booked - actual;
        doubles.push({
          ...base,
          report: 'double',
          bookedRestMinutes: booked,
          bookedRest: booked == null ? null : minutesToTimeString(booked),
          shortfallMinutes: shortfall,
          shortfall: shortfall == null ? null : minutesToTimeString(shortfall),
          det1DutyMinutes: da.total_duty_hours ? parseDutyHours(da.total_duty_hours) : null,
          det2DutyMinutes: db.total_duty_hours ? parseDutyHours(db.total_duty_hours) : null,
          severity:
            actual < opt.floorMinutes ? 'red'
            : (booked != null && actual < booked) ? 'amber'
            : 'ok',
        });
      } else if (actual < opt.extraDutyMaxGapMinutes) {
        // Not a booked pairing but back-to-back — a second ("extra") duty.
        // Triples whose chaining is incomplete (cycle_anchor NULL) land here too, so say which.
        // Only a triple whose OWN anchor is missing is unchained. A single legitimately
        // has a NULL anchor, so it must not trip this.
        const unchained = (d) => d && d.detail_type === 'triple' && !d.cycle_anchor;
        const chainingIncomplete = unchained(da) || unchained(db);
        extras.push({
          ...base,
          report: 'extra',
          span: minutesToTimeString(minutesBetween(a.signOn, b.signOff)),
          sameDay: a.signOn.toDateString() === b.signOn.toDateString(),
          det1Type: da ? da.detail_type : null,
          det2Type: db ? db.detail_type : null,
          chainingIncomplete,
          severity: actual < 0 ? 'red' : actual < opt.extraDutyMaxGapMinutes / 2 ? 'red' : 'amber',
        });
      } else {
        ordinaryRests++;
      }
    }
  }

  const sevRank = { red: 0, amber: 1, ok: 2 };
  doubles.sort((x, y) => sevRank[x.severity] - sevRank[y.severity] || x.actualRestMinutes - y.actualRestMinutes);
  extras.sort((x, y) => x.actualRestMinutes - y.actualRestMinutes);

  if (unknownSets.size) {
    const list = [...unknownSets.keys()].sort().slice(0, 15).join(', ');
    warnings.push(
      `${unknownSets.size} SET NO(s) have no matching detail in the detail book ` +
      `(${list}${unknownSets.size > 15 ? ', …' : ''}). Those pairs cannot be checked against booked rest.`
    );
  }
  if (negativeGaps) {
    warnings.push(`${negativeGaps} pair(s) overlap — the next duty signed on before the previous one signed off. Check the kiosk records.`);
  }

  return {
    doubles,
    extras,
    totals: {
      files: files.length,
      dutyRows: duties.length,
      duplicatesDropped,
      crew: byCrew.size,
      unpairedCrew,
      doublePairs: doubles.length,
      extraDutyPairs: extras.length,
      ordinaryRests,
      doublesBelowBooked: doubles.filter((d) => d.shortfallMinutes != null && d.shortfallMinutes > 0).length,
      doublesBelowFloor: doubles.filter((d) => d.actualRestMinutes < opt.floorMinutes).length,
    },
    coverage: buildCoverage(files),
    unknownSets: [...unknownSets.entries()].map(([setNo, count]) => ({ setNo, count })),
    options: opt,
    warnings,
  };
}

/*
 * Merge the file windows into covered spans and name the gaps between them.
 * Partial coverage is the norm — only the duties whose BOTH legs fall inside a covered
 * window can pair, so the reports are a floor on violations, never a complete count.
 */
function buildCoverage(files) {
  const spans = files
    .filter((f) => f.periodFrom && f.periodTo)
    .map((f) => ({ from: new Date(f.periodFrom), to: new Date(f.periodTo) }))
    .sort((a, b) => a.from - b.from);

  const merged = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.from <= last.to) { if (s.to > last.to) last.to = s.to; }
    else merged.push({ from: new Date(s.from), to: new Date(s.to) });
  }

  // A full-day export ends at 23:59, so consecutive daily files leave a one-minute
  // "gap" that is an artefact of the export, not missing data. Only report real ones.
  const MIN_REPORTABLE_GAP_MS = 15 * 60 * 1000;
  const gaps = [];
  for (let i = 0; i + 1 < merged.length; i++) {
    const from = merged[i].to;
    const to = merged[i + 1].from;
    if (to - from >= MIN_REPORTABLE_GAP_MS) gaps.push({ from: new Date(from), to: new Date(to) });
  }

  return {
    covered: merged,
    gaps,
    from: merged.length ? merged[0].from : null,
    to: merged.length ? merged[merged.length - 1].to : null,
    unknownWindows: files.filter((f) => !f.periodFrom || !f.periodTo).length,
  };
}

module.exports = { analyse, buildCoverage, officeForCrew, OFFICE_BY_PREFIX, DEFAULTS };
