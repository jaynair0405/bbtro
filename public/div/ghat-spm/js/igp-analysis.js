// ════════════════════════════════════════
// IGP SPM ANALYSIS — Trip extraction, Stats, Halts
// ════════════════════════════════════════
//
// KEY FACT ABOUT MEDHA DATA (validated on 11 trips, Sep 2026):
//   The recorder writes NO rows while the loco is stationary. A halt appears
//   as a STOP row, then a time gap, then a START row. So halt duration and
//   trip boundaries must be derived from TIME GAPS between rows, never from
//   counting zero-speed rows. STOP/START rows may also carry a 1 m reading.
//
// The driver's manual times are approximate (watch vs recorder drift, and the
// loco often crawls on after the platform), so the requested times are only
// used to FIND the nearest recorder START / STOP; the recorder rows are the
// anchor. See TEST_FINDINGS.md.

// ── Tunables ──
var ANCHOR = {
    LONG_STOP_SEC: 30,       // a gap >= this after a speed-0 row is a "long stop"
    START_SEARCH_SEC: 300,   // look ±5 min around the driver's departure time
    END_SEARCH_SEC: 600,     // look ±10 min around the driver's arrival time
    MIN_RUN_M: 300,          // a departure must be followed by >= this much travel
    CREEP_M: 100,            // movement after arrival below this is a positioning creep
    MIN_ARRIVAL_KM: 13.0,    // KSRA<->IGP is ~13.5-14.4 km; arrivals below this are suspect
    MAX_TRIP_KM: 17.0,       // above this the window almost certainly spans two trips
    HALT_MIN_SEC: 2,         // ignore stop/start jitter shorter than this
    MERGE_M: 100,            // two halts closer than this ...
    MERGE_MAX_KMPH: 15,      // ... with the crawl between them never faster than this, are ONE halt
    ATTACH_LOOKBACK_M: 100,  // DN: look this far back from departure for the banker's attaching halts
    ATTACH_FINAL_MAX_KMPH: 5 // DN: final creep onto the train faster than this is flagged
};

/**
 * Absolute seconds for every row (handles midnight crossing).
 * Day offset increments each time the date string changes.
 */
function rowAbsSecs(rows) {
    var abs = new Array(rows.length), day = 0, lastDate = rows.length ? rows[0].date : null;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].date !== lastDate) { day++; lastDate = rows[i].date; }
        abs[i] = day * 86400 + timeToSec(rows[i].time);
    }
    return abs;
}

/**
 * Build the movement structure of the whole file:
 *  - longStops[]: index of each speed-0 row followed by a gap >= LONG_STOP_SEC
 *    (or the last row of the file)
 *  - departures[]: index of the first row after each long stop (a START), plus row 0
 * Each entry carries the distance travelled until the next long stop.
 */
function buildMovementIndex(rows, abs) {
    var longStops = [], departures = [];
    var runStart = 0, runDist = 0;
    for (var i = 0; i < rows.length; i++) {
        runDist += (rows[i].distMeters || 0);
        var gap = (i + 1 < rows.length) ? abs[i + 1] - abs[i] : Infinity;
        var isLast = (i === rows.length - 1);
        if ((rows[i].speed === 0 && gap >= ANCHOR.LONG_STOP_SEC) || isLast) {
            longStops.push({ idx: i, gap: gap, runDist: runDist });
            departures.push({ idx: runStart, runDist: runDist });
            runStart = i + 1; runDist = 0;
        }
    }
    return { longStops: longStops, departures: departures };
}

/**
 * Detect the full-section trips in a file (for the trip table).
 *
 * An ARRIVAL is a long stop (>= LONG_STOP_SEC) after which the loco moves
 * less than 1 km before its next long stop (or it is the last stop). Its
 * DEPARTURE is the latest departure candidate (START after a long stop,
 * followed by >= MIN_RUN_M) that lies >= TRIP_MIN_KM back along the track —
 * the latest one, so yard moves before the real departure are excluded.
 * Runs longer than TRIP_MAX_KM are ignored (two trips with no long stand
 * between them would need the manual form).
 *
 * Direction is only a GUESS from the traction current: a DN push draws far
 * more than an UP descent (LE ~30 A, goods ~10 A; DN pushes 80-180 A).
 * @returns {Array} [{n, date, depTime, arrTime, km, maxAmps, dirGuess, si, ei}]
 */
var TRIP_MIN_KM = 12.8, TRIP_MAX_KM = 16.0, ARRIVAL_NEXT_RUN_M = 1000, DN_AMPS_GUESS = 75;
var TRIP_TYP_MIN_KM = 13.35, TRIP_TYP_MAX_KM = 14.6;   // observed full-run range (UP 13.46-14.2, DN 14.0-14.4)
/** Default departure among candidates, by direction (see detectTrips). Returns row index. */
function pickDepartureFor(dir, cands) {
    if (!cands || !cands.length) return -1;
    var c = cands.slice();
    if (dir === 'DN') c.sort(function(a, b) { return b.idx - a.idx; });           // latest
    else c.sort(function(a, b) { return b.standSec - a.standSec; });               // longest stand
    return c[0].idx;
}

var lastTripIndex = null;   // {rows, abs, mv, cum} of the last detectTrips() call, for row rechecks
function detectTrips(parsedData) {
    if (!parsedData || !parsedData.rows.length) return [];
    var rows = parsedData.rows, abs = rowAbsSecs(rows), mv = buildMovementIndex(rows, abs);
    var stops = mv.longStops, deps = mv.departures;
    // distance from file start to each row (metres), for quick differences
    var cum = new Float64Array(rows.length), c = 0;
    for (var i = 0; i < rows.length; i++) { c += (rows[i].distMeters || 0); cum[i] = c; }
    lastTripIndex = { rows: rows, abs: abs, mv: mv, cum: cum };

    var trips = [], lastEi = -1;
    for (var k = 0; k < stops.length; k++) {
        var L = stops[k];
        if (L.idx <= lastEi) continue;
        // arrival test: next run (to the next long stop) shorter than 1 km, or last stop
        var nextRunM = (k + 1 < stops.length) ? (cum[stops[k + 1].idx] - cum[L.idx]) : 0;
        if (nextRunM >= ARRIVAL_NEXT_RUN_M) continue;

        // Departure: latest candidate whose run to L is a typical full-section
        // distance (excludes both yard moves before departure — too long — and
        // a restart after an early signal halt — too short). Fallback: latest
        // candidate in the wide range, flagged for checking.
        // Among candidates in the typical range, prefer the one preceded by the
        // LONGEST stand: a real departure follows the attached stand / the wait
        // at the terminal, a restart after an early signal halt follows a short
        // halt. Other in-range candidates are offered as alternatives.
        var inRange = [], fallback = -1, check = false;
        for (var d = deps.length - 1; d >= 0; d--) {
            var D = deps[d];
            if (D.idx >= L.idx || D.idx <= lastEi) continue;
            if (D.runDist < ANCHOR.MIN_RUN_M) continue;
            var km = (cum[L.idx] - cum[D.idx]) / 1000;
            if (km > TRIP_MAX_KM) break;
            var standSec = D.idx > 0 ? abs[D.idx] - abs[D.idx - 1] : 1e9;   // gap before the START row
            if (km >= TRIP_TYP_MIN_KM && km <= TRIP_TYP_MAX_KM) inRange.push({ idx: D.idx, km: km, standSec: standSec });
            else if (km >= TRIP_MIN_KM && fallback < 0) fallback = D.idx;
        }
        // Direction guess first (needed to choose between candidates):
        //  DN (KSRA): yard moves come BEFORE the real departure → take the LATEST in-range candidate.
        //  UP (IGP): an early signal halt comes AFTER the real departure → take the candidate
        //            preceded by the LONGEST stand (the wait at the terminal).
        var probeStart = inRange.length ? Math.min.apply(null, inRange.map(function(x) { return x.idx })) : (fallback >= 0 ? fallback : L.idx);
        var maxA = 0;
        for (var j = probeStart; j <= L.idx; j++) if ((rows[j].amps || 0) > maxA) maxA = rows[j].amps || 0;
        var dirGuess = maxA >= DN_AMPS_GUESS ? 'DN' : 'UP';

        var best = -1, cands = [];
        if (inRange.length) {
            cands = inRange.map(function(x) { return { idx: x.idx, time: rows[x.idx].time, km: Math.round(x.km * 1000) / 1000, standSec: x.standSec }; });
            best = pickDepartureFor(dirGuess, cands);
            if (cands.length > 1) check = true;
        } else { if (fallback < 0) continue; best = fallback; check = true; }

        var si = best;
        var candsOut = cands;
        // skip an initial creep-and-pause (same rule as extractTrip)
        for (var q = si, cm = 0; q + 1 < rows.length && cm < 50 && (abs[q] - abs[si]) <= 120; q++) {
            cm += (rows[q].distMeters || 0);
            if (rows[q].speed === 0 && (abs[q + 1] - abs[q]) >= 5 && q > si) best = q;
        }
        si = best;
        trips.push({ n: trips.length + 1, date: rows[si].date, depTime: rows[si].time, arrTime: rows[L.idx].time,
                     detectedDep: rows[si].time, detectedArr: rows[L.idx].time, detectedSi: si, detectedEi: L.idx,
                     km: Math.round((cum[L.idx] - cum[si])) / 1000, maxAmps: maxA,
                     dirGuess: dirGuess, si: si, ei: L.idx, check: check, cands: candsOut,
                     standSec: si > 0 ? abs[si] - abs[si - 1] : 0,
                     isoDate: (function(dt) { var p = dt.split('/'); return '20' + p[2] + '-' + p[1] + '-' + p[0]; })(rows[si].date) });
        lastEi = L.idx;
    }
    return trips;
}

/**
 * Re-anchor one detected trip after the user edits its departure or arrival.
 * The typed time is a HINT: departure snaps to the nearest recorder departure
 * (START after a long stop, >= 300 m run) within ±START_SEARCH_SEC; arrival
 * snaps to the nearest long stop within ±END_SEARCH_SEC. Returns
 * {ok, trip, message}; the trip object is updated in place when ok.
 */
function recheckTrip(trip, which, hhmmss, prevTrip, nextTrip) {
    var ix = lastTripIndex;
    if (!ix || !trip) return { ok: false, message: 'No file index' };
    var saved = { si: trip.si, ei: trip.ei, depTime: trip.depTime, arrTime: trip.arrTime, km: trip.km, date: trip.date, isoDate: trip.isoDate };
    var rows = ix.rows, abs = ix.abs, cum = ix.cum;
    var dayOff = Math.floor(abs[trip.si] / 86400);
    var target = dayOff * 86400 + timeToSec(hhmmss.length === 5 ? hhmmss + ':00' : hhmmss);
    // allow a time just after midnight relative to the trip's day
    if (target < abs[trip.si] - 43200) target += 86400;

    if (which === 'dep') {
        var best = -1, bestD = Infinity;
        ix.mv.departures.forEach(function(D) {
            if (D.runDist < ANCHOR.MIN_RUN_M || D.idx >= trip.ei) return;
            var d = Math.abs(abs[D.idx] - target);
            if (d <= ANCHOR.START_SEARCH_SEC && d < bestD) { bestD = d; best = D.idx; }
        });
        if (best < 0) return { ok: false, message: 'No recorder departure within 5 min of ' + hhmmss };
        var si = best;
        for (var q = best, cm = 0; q + 1 < rows.length && cm < 50 && (abs[q] - abs[best]) <= 120; q++) {
            cm += (rows[q].distMeters || 0);
            if (rows[q].speed === 0 && (abs[q + 1] - abs[q]) >= 5 && q > best) si = q;
        }
        trip.si = si; trip.depTime = rows[si].time; trip.date = rows[si].date;
        trip.isoDate = (function(dt) { var p = dt.split('/'); return '20' + p[2] + '-' + p[1] + '-' + p[0]; })(rows[si].date);
        trip.standSec = si > 0 ? abs[si] - abs[si - 1] : 0;
    } else {
        var bestE = -1, bestDE = Infinity;
        ix.mv.longStops.forEach(function(S) {
            if (S.idx <= trip.si) return;
            var d = Math.abs(abs[S.idx] - target);
            if (d <= ANCHOR.END_SEARCH_SEC && d < bestDE) { bestDE = d; bestE = S.idx; }
        });
        if (bestE < 0) return { ok: false, message: 'No recorder stop within 10 min of ' + hhmmss };
        trip.ei = bestE; trip.arrTime = rows[bestE].time;
    }
    trip.km = Math.round(cum[trip.ei] - cum[trip.si]) / 1000;

    // Guards: must stay a plausible single run and must not overlap the neighbouring trips
    var restore = function() { for (var k in saved) trip[k] = saved[k]; };
    if (trip.km < TRIP_MIN_KM || trip.km > TRIP_MAX_KM) { restore(); return { ok: false, message: 'That would make the run ' + trip.km.toFixed(1) + ' km — not a single KSRA-IGP trip' }; }
    if (prevTrip && trip.si <= prevTrip.ei) { restore(); return { ok: false, message: 'Overlaps the previous trip (arrived ' + prevTrip.arrTime + ')' }; }
    if (nextTrip && trip.ei >= nextTrip.si) { restore(); return { ok: false, message: 'Overlaps the next trip (departs ' + nextTrip.depTime + ')' }; }

    var maxA = 0;
    for (var j = trip.si; j <= trip.ei; j++) if ((rows[j].amps || 0) > maxA) maxA = rows[j].amps || 0;
    trip.maxAmps = maxA; trip.dirGuess = maxA >= DN_AMPS_GUESS ? 'DN' : 'UP';
    trip.depManual = true;
    var note = '';
    var detIdx = which === 'dep' ? trip.detectedSi : trip.detectedEi, newIdx = which === 'dep' ? trip.si : trip.ei;
    var deltaMin = detIdx !== undefined ? Math.round((abs[newIdx] - abs[detIdx]) / 60) : 0;
    if (Math.abs(deltaMin) >= 15) note = ' — ' + Math.abs(deltaMin) + ' min ' + (deltaMin > 0 ? 'after' : 'before') + ' the detected ' + (which === 'dep' ? 'departure ' + trip.detectedDep : 'arrival ' + trip.detectedArr) + ', please confirm';
    trip.check = trip.km < TRIP_TYP_MIN_KM || trip.km > TRIP_TYP_MAX_KM || Math.abs(deltaMin) >= 15;
    return { ok: true, trip: trip, message: 'Snapped to recorder ' + (which === 'dep' ? trip.depTime : trip.arrTime) + ', ' + trip.km.toFixed(3) + ' km' + note, warn: Math.abs(deltaMin) >= 15 };
}

/**
 * Extract a single trip from parsed data
 * - Single-trip files: use all rows, compute cumDist
 * - Full TXT files: anchor the requested date/time to the recorder's own
 *   START/STOP rows (see ANCHOR), compute cumDist from scratch
 *
 * The returned array carries `.anchor` = {reqStart, reqEnd, actStart, actEnd,
 * startShiftSec, endShiftSec, warnings[]} for display.
 */
function extractTrip(parsedData, isFullFile) {
    if (!parsedData) return null;
    var rows = parsedData.rows;

    // Single trip file — use all rows
    if (!isFullFile) {
        var copy = rows.map(function(r) { return Object.assign({}, r) });
        var out = cumDist(copy);
        out.anchor = { warnings: [] };
        return out;
    }

    // Multi-trip: filter by DATE + TIME
    var td = document.getElementById('tripDate').value;
    var st = document.getElementById('tripStart').value;
    var et = document.getElementById('tripEnd').value;

    if (!td || !st) {
        alert('Enter trip date and departure time.');
        return null;
    }

    // Convert YYYY-MM-DD to DD/MM/YY for matching TXT date format
    var dp = td.split('-');
    var filterDate = dp[2] + '/' + dp[1] + '/' + dp[0].slice(2);

    // Pad time to HH:MM:SS
    var fst = st.length === 5 ? st + ':00' : st;
    var fet = et ? (et.length === 5 ? et + ':00' : et) : null;

    var abs = rowAbsSecs(rows);

    // Day offset of the requested date
    var dayOff = -1;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].date === filterDate) { dayOff = Math.floor(abs[i] / 86400); break; }
    }
    if (dayOff < 0) {
        alert('No data for ' + filterDate);
        return null;
    }
    var reqStartAbs = dayOff * 86400 + timeToSec(fst);
    var reqEndAbs = fet ? dayOff * 86400 + timeToSec(fet) : null;
    if (reqEndAbs !== null && reqEndAbs < reqStartAbs) reqEndAbs += 86400; // overnight

    var mv = buildMovementIndex(rows, abs);
    var warnings = [];

    // ── Start anchoring: nearest real departure within ±START_SEARCH_SEC ──
    var si = -1, bestD = Infinity;
    for (var d = 0; d < mv.departures.length; d++) {
        var dep = mv.departures[d];
        if (dep.runDist < ANCHOR.MIN_RUN_M) continue;           // shunting move, not a departure
        var diff = Math.abs(abs[dep.idx] - reqStartAbs);
        if (diff <= ANCHOR.START_SEARCH_SEC && diff < bestD) { bestD = diff; si = dep.idx; }
    }
    if (si < 0) {
        // Fallback: old behaviour (first row at/after requested time)
        for (var i = 0; i < rows.length; i++) {
            if (abs[i] >= reqStartAbs) { si = i; break; }
        }
        if (si < 0) { alert('No data for ' + filterDate + ' at ' + fst); return null; }
        warnings.push('No recorder START found within 5 min of ' + fst + '; using first row at ' + rows[si].time + '.');
    }

    // Departure refinement: if the loco creeps a few metres, pauses, then
    // departs, start at the final restart within the first 50 m.
    var si0 = si;
    for (var k = si0, cm = 0; k + 1 < rows.length && cm < 50 && (abs[k] - abs[si0]) <= 120; k++) {
        cm += (rows[k].distMeters || 0);
        if (rows[k].speed === 0 && (abs[k + 1] - abs[k]) >= 5 && k > si0) si = k;
    }

    // ── End anchoring ──
    var ei = -1;
    var cands = mv.longStops.filter(function(s) { return s.idx > si; });

    // distance from si to each candidate (needed for MIN_ARRIVAL/MAX_TRIP checks)
    var cum = 0, cumAt = {};
    for (var i = si, c = 0; i < rows.length && c < cands.length; i++) {
        cum += (rows[i].distMeters || 0);
        if (i === cands[c].idx) { cumAt[i] = cum; c++; }
    }

    if (reqEndAbs !== null) {
        // Nearest long stop to the driver's time, preferring one that is a
        // plausible full-section arrival (>= MIN_ARRIVAL_KM) if any is in range
        var inRange = cands.filter(function(s) { return Math.abs(abs[s.idx] - reqEndAbs) <= ANCHOR.END_SEARCH_SEC; });
        var full = inRange.filter(function(s) { return cumAt[s.idx] / 1000 >= ANCHOR.MIN_ARRIVAL_KM; });
        var pool = full.length ? full : inRange;
        var bestE = Infinity;
        pool.forEach(function(s) {
            var diff = Math.abs(abs[s.idx] - reqEndAbs);
            if (diff < bestE) { bestE = diff; ei = s.idx; }
        });
        if (ei < 0) {
            // Fallback: old behaviour (last row at/before requested end)
            for (var i = si; i < rows.length; i++) {
                if (abs[i] > reqEndAbs) { ei = i - 1; break; }
            }
            if (ei < si) ei = rows.length - 1;
            warnings.push('No recorder STOP found within 10 min of ' + fet + '; trip cut at ' + rows[ei].time +
                (rows[ei].speed > 0 ? ' while still moving at ' + rows[ei].speed + ' kmph' : '') + '.');
        }
    } else {
        // No end time: first long stop after MIN_ARRIVAL_KM
        for (var c = 0; c < cands.length; c++) {
            if (cumAt[cands[c].idx] / 1000 >= ANCHOR.MIN_ARRIVAL_KM) { ei = cands[c].idx; break; }
        }
        if (ei < 0) {
            ei = cands.length ? cands[cands.length - 1].idx : rows.length - 1;
            warnings.push('No arrival found after ' + ANCHOR.MIN_ARRIVAL_KM + ' km; trip ends at last long stop ' + rows[ei].time + '.');
        }
    }

    // ── Creep absorption: walk back over post-arrival positioning moves ──
    // If the movement between the previous long stop and the chosen one is
    // < CREEP_M, the earlier stop is the real arrival.
    for (;;) {
        var pos = -1;
        for (var c = 0; c < cands.length; c++) if (cands[c].idx === ei) { pos = c; break; }
        if (pos <= 0) break;
        var prev = cands[pos - 1];
        if (prev.idx <= si) break;
        if ((cumAt[ei] - cumAt[prev.idx]) < ANCHOR.CREEP_M) ei = prev.idx; else break;
    }

    if (ei < si) ei = si;

    // Extract slice and compute fresh cumulative distance
    var slice = rows.slice(si, ei + 1).map(function(r) { return Object.assign({}, r) });
    var trip = cumDist(slice);
    trip.attachHalts = detectAttachHalts(rows, abs, si);

    var tripKm = trip[trip.length - 1].cumDistKm;
    if (tripKm < 1) {
        warnings.unshift('No run found between ' + fst + ' and ' + (fet || 'end') + ' on ' + filterDate + ' — only shunting moves. Check the date and times.');
    } else if (tripKm > ANCHOR.MAX_TRIP_KM) {
        warnings.push('Trip distance ' + tripKm.toFixed(1) + ' km exceeds the section length — the window probably spans more than one trip.');
    } else if (tripKm < ANCHOR.MIN_ARRIVAL_KM) {
        warnings.push('Trip distance ' + tripKm.toFixed(1) + ' km is short of a full KSRA-IGP run (' + ANCHOR.MIN_ARRIVAL_KM + '+ km). Check the times.');
    }
    trip.anchor = {
        reqStart: fst, reqEnd: fet,
        actStart: rows[si].time, actEnd: rows[ei].time,
        startShiftSec: abs[si] - reqStartAbs,
        endShiftSec: reqEndAbs !== null ? abs[ei] - reqEndAbs : null,
        arrivalGapSec: (function() { var g = (ei + 1 < rows.length) ? abs[ei + 1] - abs[ei] : null; return g; })(),
        warnings: warnings
    };
    return trip;
}

/**
 * Attaching halts before a DN departure (GAS: haltsPriorToEngineOnLoad /
 * reportOfBankerHaltsInRearOfTrain). The ghat driver must approach the rear
 * of the standing train in steps; the GAS report listed the 2-3 stops made in
 * the last ~100 m before the banker was attached.
 *
 * From the departure row (si) walk BACKWARDS through the raw file over the
 * last ATTACH_LOOKBACK_M metres of movement. Every stop in that window (a run
 * of speed-0 rows) is reported with: how far in rear of the departure point
 * it was, how long the loco stood, and the distance and max speed of the
 * creep that took it from there towards the train. The stand at the
 * departure point itself is returned as `attachedStoodSec`.
 *
 * Direction-agnostic here; the app shows it for DN (KSRA departure) only.
 * @returns {{halts: Array, attachedStoodSec: number, lookbackM: number}}
 */
function detectAttachHalts(rows, abs, si) {
    var out = { halts: [], attachedStoodSec: 0, lookbackM: ANCHOR.ATTACH_LOOKBACK_M };
    if (si <= 0) return out;

    // Stand at the departure point: from the first speed-0 row of the final
    // stationary run up to the departure row.
    var k = si;
    while (k - 1 >= 0 && rows[k - 1].speed === 0) k--;
    out.attachedStoodSec = abs[si] - abs[k];

    var rearM = 0;           // metres travelled between the current row and the departure point
    var i = k - 1;           // first row before the final stand (a moving row)
    var creepM = 0, creepMax = 0;

    while (i >= 0 && rearM <= ANCHOR.ATTACH_LOOKBACK_M) {
        if (rows[i].speed > 0) {
            rearM += (rows[i].distMeters || 0);
            creepM += (rows[i].distMeters || 0);
            if (rows[i].speed > creepMax) creepMax = rows[i].speed;
            i--;
            continue;
        }
        // A stop: run of speed-0 rows ending at i
        var e = i;                       // last zero row (just before movement resumed)
        while (i - 1 >= 0 && rows[i - 1].speed === 0) i--;
        var st = i;                      // first zero row
        var stoodSec = abs[e + 1] - abs[st];   // until the first moving row after the stop
        if (stoodSec >= ANCHOR.HALT_MIN_SEC) {
            out.halts.push({
                time: rows[st].time,
                stoodSec: stoodSec,
                rearM: Math.round(rearM),
                creepM: Math.round(creepM),     // the move FROM this stop towards the train
                creepMaxKmph: creepMax
            });
        }
        creepM = 0; creepMax = 0;
        i = st - 1;
    }
    return out;
}

/**
 * Departure notch-up profile (DN): amps / speed / seconds at fixed distances
 * after the departure point. No threshold is applied — the analysing CLI
 * reads the row and decides when the ghat driver came on notches. The rule
 * at IGP is "after 2-3 coach lengths" (45-70 m); the app only highlights it.
 * @returns {{dists:number[], rows:[{m, amps, speed, secs}], idleAmps:number}}
 */
var DEPART_PROFILE_M = [0, 10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 200];
function departureProfile(trip) {
    var out = { dists: DEPART_PROFILE_M, rows: [], idleAmps: trip.length ? (trip[0].amps || 0) : 0 };
    if (!trip.length) return out;
    var t0 = timeToSec(trip[0].time);
    DEPART_PROFILE_M.forEach(function(m) {
        var p = null;
        for (var i = 0; i < trip.length; i++) { if (trip[i].cumDistKm * 1000 >= m) { p = trip[i]; break; } }
        if (!p) { out.rows.push({ m: m, amps: null, speed: null, secs: null }); return; }
        var secs = timeToSec(p.time) - t0; if (secs < 0) secs += 86400;
        out.rows.push({ m: m, amps: p.amps || 0, speed: p.speed, secs: secs });
    });
    return out;
}

/**
 * Station-wise readings (GAS "Reports" table: Place / Speed / OHE / Amps).
 * For each marker (stations + DN ghat markers, in trip order) take the first
 * trip row at or beyond its trip distance. The departure point is the first
 * row; a marker beyond the trip end (e.g. IGP marker at 14.39 when the loco
 * stopped at 14.07) uses the last row and is flagged as the arrival.
 * @returns {Array} [{name, tripDist, time, speed, oheKV, amps, note}]
 */
function stationReadings(trip, stationMarkers, ghatMarkers) {
    if (!trip || !trip.length) return [];
    var list = (stationMarkers || []).concat(ghatMarkers || []).slice();
    list.sort(function(a, b) { return a.tripDist - b.tripDist });
    var endKm = trip[trip.length - 1].cumDistKm;
    return list.map(function(m, idx) {
        var row = null, note = '';
        if (idx === 0) { row = trip[0]; note = 'departure'; }
        else if (m.tripDist >= endKm) { row = trip[trip.length - 1]; note = 'arrival'; }
        else { for (var i = 0; i < trip.length; i++) { if (trip[i].cumDistKm >= m.tripDist) { row = trip[i]; break; } } }
        if (!row) row = trip[trip.length - 1];
        return { name: m.name, tripDist: m.tripDist, time: row.time, speed: row.speed, oheKV: row.oheKV, amps: row.amps || 0, note: note, isGhat: m.type === 'ghat' };
    });
}

/**
 * Approach profile for each halt (DN): speed and amps at fixed distances
 * before the stop. In DN working the leading driver notches down / drops a
 * little air and the ghat driver must follow in tandem, so a gradual taper
 * over the last 1000 m is what the CLI looks for. No verdict is applied.
 *
 * The halt is labelled with the nearest signal/station it stopped at
 * (a halt sits 0–300 m BEFORE the marker it was held at), else its km.
 * @returns {Array} [{num, time, dist, duration, profile, label, cols:[{m, speed, amps}]}]
 */
var HALT_APPROACH_M = [1000, 800, 500, 400, 300, 200, 100, 50, 20];
function haltApproachProfiles(trip, halts, stationMarkers, signalMarkers, ghatMarkers, opts) {
    opts = opts || {};
    // How far AHEAD of the stop a signal may be and still be "the" signal:
    //  - UP (banker / LE in front): the loco stops 0-400 m short of the signal
    //    (KSRA H halts seen 130-380 m short).
    //  - DN (banker at the REAR of the train): the leading loco stops at the
    //    signal, so the banker is a train length behind it — up to ~750 m.
    var ahead = opts.lookAheadKm || 0.3;
    var rearWord = opts.bankerAtRear ? ' m in rear' : ' m short';
    return (halts || []).map(function(h) {
        var best = null, bestD = Infinity;
        var pick = function(list) {
            list.forEach(function(m) {
                var d = m.tripDist - h.dist;            // + = marker ahead of the stop
                if (d >= -0.05 && d <= ahead && Math.abs(d) < bestD) { bestD = Math.abs(d); best = m; }
            });
        };
        pick(signalMarkers || []);
        if (!best) pick([].concat(stationMarkers || [], ghatMarkers || []));
        var label = best ? best.name + (bestD >= 0.03 ? ' (' + Math.round(bestD * 1000) + rearWord + ')' : '') : 'km ' + h.dist.toFixed(2);

        var start = h.firstIndex !== undefined ? h.firstIndex : h.dataIndex;
        var haltKm = trip[start].cumDistKm;
        var cols = HALT_APPROACH_M.map(function(m) {
            var target = haltKm - m / 1000;
            if (target < 0) return { m: m, speed: null, amps: null };
            var row = null;
            for (var j = start - 1; j >= 0; j--) { if (trip[j].cumDistKm <= target) { row = trip[j]; break; } }
            if (!row) row = trip[0];
            return { m: m, speed: row.speed, amps: row.amps || 0 };
        });
        return { num: h.num, time: h.time, dist: h.dist, duration: h.duration, profile: h.profile, label: label, cols: cols };
    });
}

/**
 * Sectional running time between consecutive station markers.
 * For each section: pass time at the from/to marker (departure row for the
 * first, arrival row for the last), elapsed time, time stood in halts that
 * START inside the section, and moving time (= elapsed − stood).
 * @returns {{sections:[{from,to,fromTime,toTime,elapsedSec,haltSec,movingSec,halts}], total:{...}}}
 */
function sectionalTimes(trip, stationMarkers, halts) {
    var out = { sections: [], total: null };
    if (!trip || !trip.length || !stationMarkers || stationMarkers.length < 2) return out;
    var endKm = trip[trip.length - 1].cumDistKm;
    var t0 = timeToSec(trip[0].time);
    var rel = function(t) { var d = timeToSec(t) - t0; return d < 0 ? d + 86400 : d; };
    var rowAt = function(km, idx) {
        if (idx === 0) return trip[0];
        if (km >= endKm) return trip[trip.length - 1];
        for (var i = 0; i < trip.length; i++) if (trip[i].cumDistKm >= km) return trip[i];
        return trip[trip.length - 1];
    };
    var stns = stationMarkers.slice().sort(function(a, b) { return a.tripDist - b.tripDist });
    for (var i = 0; i + 1 < stns.length; i++) {
        var a = stns[i], b = stns[i + 1];
        var ra = rowAt(a.tripDist, i), rb = rowAt(b.tripDist, i + 1);
        var elapsed = rel(rb.time) - rel(ra.time);
        var haltSec = 0, n = 0;
        (halts || []).forEach(function(h) {
            var hk = h.dist;
            var inSec = (i === 0 ? hk >= 0 : hk >= a.tripDist) && (i + 2 === stns.length ? hk < Math.max(b.tripDist, endKm) + 0.001 : hk < b.tripDist);
            if (inSec) { haltSec += h.duration; n++; }
        });
        out.sections.push({ from: a.name, to: b.name, fromKm: a.tripDist, toKm: b.tripDist, fromTime: ra.time, toTime: rb.time,
            elapsedSec: elapsed, haltSec: haltSec, movingSec: Math.max(0, elapsed - haltSec), halts: n });
    }
    var tot = out.sections.reduce(function(acc, s) { acc.elapsedSec += s.elapsedSec; acc.haltSec += s.haltSec; acc.halts += s.halts; return acc; },
        { elapsedSec: 0, haltSec: 0, halts: 0 });
    tot.movingSec = tot.elapsedSec - tot.haltSec;
    tot.from = stns[0].name; tot.to = stns[stns.length - 1].name;
    tot.fromTime = trip[0].time; tot.toTime = trip[trip.length - 1].time;
    out.total = tot;
    return out;
}

/**
 * PSR / MPS compliance per zone.
 * For every PSR segment of the trip: max speed recorded inside it, metres and
 * seconds run above the limit, and the peak excess. The IGP approach zone
 * (CSV limit 15) depends on the train: coaching 15, goods 10, light engine
 * none — when the type is unknown both 15 and 10 are evaluated.
 * @returns {Array} [{from,to,section,limit,limitLabel,maxSpeed,overM,overSec,excess,rows,verdict}]
 */
function psrCompliance(trip, psrSegments, trainType) {
    if (!trip || !trip.length || !psrSegments || !psrSegments.length) return [];
    var tt = (trainType || 'Unknown');
    return psrSegments.map(function(seg) {
        var limits = [seg.speed], label = String(seg.speed), isIGP = (seg.speed === 15 && !seg.tsr);
        if (isIGP) {
            if (tt === 'Goods') { limits = [10]; label = '10 (goods)'; }
            else if (tt === 'Coaching') { limits = [15]; label = '15 (coaching)'; }
            else if (tt === 'Light Engine') { limits = []; label = 'none (LE)'; }
            else { limits = [15, 10]; label = '15 coaching / 10 goods'; }
        }
        var maxS = 0, rows = 0, res = limits.map(function(L) { return { limit: L, overM: 0, overSec: 0, excess: 0 }; });
        for (var i = 0; i < trip.length; i++) {
            var r = trip[i];
            if (r.cumDistKm < seg.from || r.cumDistKm >= seg.to) continue;
            rows++;
            if (r.speed > maxS) maxS = r.speed;
            res.forEach(function(x) {
                if (r.speed > x.limit) { x.overM += (r.distMeters || 0); x.overSec += 1; if (r.speed - x.limit > x.excess) x.excess = r.speed - x.limit; }
            });
        }
        var worst = res.length ? res.reduce(function(a, b) { return b.excess > a.excess ? b : a; }, res[0]) : null;
        var verdict = !rows ? 'no data' : (!worst ? 'n/a' : (worst.excess === 0 ? 'OK' : (worst.excess <= 2 ? 'marginal' : 'over')));
        if (seg.tsr) label = String(seg.speed) + ' TSR';
        return { from: seg.from, to: seg.to, section: seg.section, limit: limits.length ? limits[0] : null, limitLabel: label, tsr: seg.tsr || null,
                 maxSpeed: rows ? maxS : null, overM: worst ? Math.round(worst.overM) : 0, overSec: worst ? worst.overSec : 0,
                 excess: worst ? worst.excess : 0, rows: rows, verdict: verdict, perLimit: res };
    });
}

/**
 * TSR (caution orders) for a trip.
 * cautionToTrip(): raw caution km (km.mast, WTT datum) → curtailed datum
 * (−1.910 beyond km 126.9, as GAS) → trip km through the PSR spans. Applies the
 * daily time window against the trip's passing time. Returns null if the
 * caution lies outside the route or its window.
 * applyTSR(): splits the PSR segments at the caution boundaries and lowers the
 * limit where a speed caution applies (lower wins); pieces carry tsr info.
 */
var CURTAIL_KM = 126.9, CURTAIL_M = 1.910;
function rawToPsrKm(km) { return km > CURTAIL_KM ? km - CURTAIL_M : km; }

function cautionToTrip(c, psrSegments, trip, trainType) {
    if (c.from_km === null || c.to_km === null) return null;
    var a = kmToTripDist(rawToPsrKm(Number(c.from_km)), psrSegments);
    var b = kmToTripDist(rawToPsrKm(Number(c.to_km)), psrSegments);
    if (a === null && b === null) return null;
    if (a === null) a = b; if (b === null) b = a;
    var from = Math.min(a, b), to = Math.max(a, b);
    if (to - from < 0.02) to = from + 0.02;                       // a point caution gets a 20 m footprint
    // time window: trip's passing time at the caution start
    if (c.time_from && c.time_to && trip && trip.length) {
        var row = null;
        for (var i = 0; i < trip.length; i++) { if (trip[i].cumDistKm >= from) { row = trip[i]; break; } }
        if (!row) row = trip[trip.length - 1];
        var t = timeToSec(row.time), w0 = timeToSec(c.time_from), w1 = timeToSec(c.time_to);
        var inWin = w0 <= w1 ? (t >= w0 && t <= w1) : (t >= w0 || t <= w1);
        if (!inWin) return null;
    }
    var goods = trainType === 'Goods';
    var speed = (c.res_type === 'SPEED') ? (goods ? (c.speed_goods !== null ? Number(c.speed_goods) : Number(c.speed_pass)) : (c.speed_pass !== null ? Number(c.speed_pass) : Number(c.speed_goods))) : null;
    return { id: c.caution_id, from: Math.round(from * 1000) / 1000, to: Math.round(to * 1000) / 1000, speed: isNaN(speed) ? null : speed,
             advisory: c.res_type !== 'SPEED' || speed === null || !!c.advisory_line, advisoryLine: !!c.advisory_line,
             line: c.line_name, type: c.res_type, reason: c.reason || '', remarks: c.remarks || '', mast: (c.from_mast || '') + ' – ' + (c.to_mast || ''),
             window: c.time_from ? (String(c.time_from).slice(0, 5) + '–' + String(c.time_to).slice(0, 5)) : '' };
}

function applyTSR(psrSegments, tsrs) {
    if (!psrSegments || !psrSegments.length) return psrSegments;
    var speedTsrs = (tsrs || []).filter(function(t) { return !t.advisory && t.speed !== null; });
    if (!speedTsrs.length) return psrSegments;
    var cuts = {};
    psrSegments.forEach(function(s) { cuts[s.from] = 1; cuts[s.to] = 1; });
    speedTsrs.forEach(function(t) { cuts[t.from] = 1; cuts[t.to] = 1; });
    var pts = Object.keys(cuts).map(Number).sort(function(a, b) { return a - b; });
    var out = [];
    for (var i = 0; i + 1 < pts.length; i++) {
        var a = pts[i], b = pts[i + 1], mid = (a + b) / 2;
        var base = null;
        for (var k = 0; k < psrSegments.length; k++) { if (mid >= psrSegments[k].from && mid < psrSegments[k].to) { base = psrSegments[k]; break; } }
        if (!base) continue;
        var seg = { from: a, to: b, speed: base.speed, section: base.section, psrFrom: base.psrFrom, psrTo: base.psrTo, baseSpeed: base.speed, tsr: null };
        speedTsrs.forEach(function(t) {
            if (mid >= t.from && mid < t.to && t.speed < seg.speed) { seg.speed = t.speed; seg.tsr = t; }
        });
        out.push(seg);
    }
    return out;
}

/**
 * Compute trip statistics
 * @param {Array} d - trip data rows with cumDistKm
 * @returns {Object} stats
 */
function computeStats(d) {
    var mx = 0, ts = 0;
    for (var i = 0; i < d.length; i++) {
        if (d[i].speed > mx) mx = d[i].speed;
        ts += d[i].speed;
    }
    var avg = d.length ? ts / d.length : 0;
    var dist = d[d.length - 1].cumDistKm;
    var secs = timeToSec(d[d.length - 1].time) - timeToSec(d[0].time);
    if (secs < 0) secs += 86400; // Handle overnight

    return {
        maxSpeed: mx,
        avgSpeed: Math.round(avg * 10) / 10,
        totalDist: Math.round(dist * 1000) / 1000,
        totalSeconds: secs,
        depTime: d[0].time,
        arrTime: d[d.length - 1].time
    };
}

/**
 * Detect halts in trip data (TIME-GAP based).
 *
 * A halt is a run of speed-0 rows (a 1 m reading on a STOP/START row is
 * ignored). Its duration is the elapsed time from the first speed-0 row to
 * the first moving row after it — NOT the row count, because Medha writes
 * no rows while stationary.
 *
 * Skipped:
 *  - the departure itself (halt starting before 50 m of travel)
 *  - jitter shorter than HALT_MIN_SEC
 *  - the arrival stop (a halt after which < CREEP_M of travel remains)
 *
 * For each halt, computes:
 * - Speed at 1000m before halt
 * - Speed at 500m before halt
 * - Speed at the row just before halt
 * - Profile: Smooth or Abrupt
 *
 * @param {Array} data - trip rows with cumDistKm
 * @returns {Array} halts
 */
function detectHalts(data) {
    var halts = [], i = 0;
    var totalKm = data.length ? data[data.length - 1].cumDistKm : 0;

    while (i < data.length) {
        if (data[i].speed !== 0) { i++; continue; }

        var hs = i;
        // Extend over all consecutive speed-0 rows (tolerate 1 m readings)
        while (i < data.length && data[i].speed === 0) i++;
        var he = i; // first moving row after the halt (or data.length)

        var endSec = (he < data.length) ? timeToSec(data[he].time) : timeToSec(data[he - 1].time);
        var dur = endSec - timeToSec(data[hs].time);
        if (dur < 0) dur += 86400;

        var hd = data[hs].cumDistKm;

        if (hd < 0.05) continue;                                   // departure
        if (dur < ANCHOR.HALT_MIN_SEC) continue;                   // jitter
        if ((totalKm - hd) * 1000 < ANCHOR.CREEP_M) continue;      // arrival stop

        var t1k = hd - 1.0;  // 1000m before halt
        var t5 = hd - 0.5;   // 500m before halt
        var s1k = 0, s5h = 0, sah = 0;

        // Walk backwards to find speed at distance thresholds
        for (var j = hs - 1; j >= 0; j--) {
            if (data[j].cumDistKm <= t1k) { s1k = data[j].speed; break; }
        }
        for (var j = hs - 1; j >= 0; j--) {
            if (data[j].cumDistKm <= t5) { s5h = data[j].speed; break; }
        }
        // Speed at the row immediately before halt
        if (hs > 0) sah = data[hs - 1].speed;

        // Profile classification
        var profile = (s5h > 30 || sah > 10) ? 'Abrupt' : 'Smooth';

        halts.push({
            num: halts.length + 1,
            time: data[hs].time,
            endTime: he < data.length ? data[he].time : data[he - 1].time,
            endIndex: he,
            duration: dur,
            dist: Math.round(hd * 1000) / 1000,
            speed1000: s1k,
            speed500: s5h,
            speedAtHalt: sah,
            profile: profile,
            dataIndex: hs,
            stops: 1,
            creepM: 0
        });
    }
    return mergeCreepHalts(halts, data);
}

/**
 * Merge "stop, creep to the stop board, stop again" into one halt.
 * Two consecutive halts are merged when they are < MERGE_M apart AND the
 * loco never exceeded MERGE_MAX_KMPH between them (validated on 27218 T9/T11:
 * 15 m / 4 kmph and 60 m / 10 kmph; no genuine separate halts within 300 m).
 *
 * The merged halt keeps the TIME/POSITION of the longer stop, the approach
 * speeds and profile of the FIRST stop (the second's lookback would reach
 * past the first), duration = stationary time of all stops, and records
 * how many stops and how far the creep was.
 */
function mergeCreepHalts(halts, data) {
    if (halts.length < 2) return halts;
    var out = [halts[0]];
    for (var i = 1; i < halts.length; i++) {
        var a = out[out.length - 1], b = halts[i];
        var sepM = Math.round((b.dist - a.dist) * 1000);
        var crawlMax = 0;
        for (var j = a.endIndex; j <= b.dataIndex && j < data.length; j++) {
            if (data[j].speed > crawlMax) crawlMax = data[j].speed;
        }
        if (sepM <= ANCHOR.MERGE_M && crawlMax <= ANCHOR.MERGE_MAX_KMPH) {
            var longer = b.duration > a.duration ? b : a;
            var merged = {
                num: a.num,
                time: longer.time,
                endTime: b.endTime,
                endIndex: b.endIndex,
                duration: a.duration + b.duration,
                dist: longer.dist,
                speed1000: a.speed1000,
                speed500: a.speed500,
                speedAtHalt: a.speedAtHalt,
                profile: a.profile,
                dataIndex: longer.dataIndex,
                firstIndex: a.firstIndex !== undefined ? a.firstIndex : a.dataIndex,
                stops: a.stops + 1,
                creepM: a.creepM + sepM,
                creepMaxKmph: Math.max(a.creepMaxKmph || 0, crawlMax)
            };
            out[out.length - 1] = merged;
        } else {
            out.push(b);
        }
    }
    out.forEach(function(h, k) { h.num = k + 1; });
    return out;
}

// ── Time Utilities ──

function timeToSec(t) {
    if (!t) return 0;
    var p = t.split(':').map(Number);
    return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
}

function fmtSec(s) {
    if (s < 0) s += 86400;
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sc = s % 60;
    return h > 0 ? h + 'h ' + m + 'm' : m + 'm ' + sc + 's';
}

/** Short duration for the halt table: "58s", "2m 51s", "1h 02m" */
function fmtDur(s) {
    if (s < 60) return s + 's';
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sc = s % 60;
    if (h > 0) return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
    return m + 'm ' + (sc < 10 ? '0' : '') + sc + 's';
}

/** Signed shift for the trip bar: "+1m 04s" / "-13s" / "exact" */
function fmtShift(s) {
    if (s === null || s === undefined) return '';
    if (s === 0) return 'exact';
    var sign = s < 0 ? '-' : '+';
    return sign + fmtDur(Math.abs(s));
}
