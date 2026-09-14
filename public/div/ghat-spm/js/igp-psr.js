// ════════════════════════════════════════
// IGP PSR DATA — Load, Filter, Transform
// ════════════════════════════════════════

var psrRawData = null;  // All rows from CSV
var psrTripData = null; // Filtered + transformed for current trip

/**
 * Load PSR CSV file
 * Format: SECTION, PSR FROM, PSR TO, SPAN, SPEED
 * @param {string} text - CSV file content
 */
function loadPSRData(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    if (lines.length < 2) { console.error('Empty PSR CSV'); return; }

    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',').map(function(s) { return s.trim() });
        if (p.length < 5) continue;
        rows.push({
            section: p[0],
            psrFrom: parseFloat(p[1]),
            psrTo: parseFloat(p[2]),
            span: parseFloat(p[3]),
            speed: parseFloat(p[4])
        });
    }
    psrRawData = rows;
    console.log('PSR loaded: ' + rows.length + ' rows');
}

/**
 * Build section list for a trip based on station list
 * e.g. [IGP, TGR1, TGR2, TGR3, KSRA] → ["IGP-TGR1", "TGR1-TGR2", "TGR2-TGR3", "TGR3-KSRA"]
 *
 * Main route: KSRA - TGR3 - TGR2 - TGR1 - IGP
 * YD variants only affect the first/last section name
 *
 * @param {string} fromStation
 * @param {string} toStation
 * @returns {Array} section names in trip order
 */
function getTripSections(fromStation, toStation) {
    // Main route (no YD — YD only changes section naming at endpoints)
    var mainRoute = ['KSRA', 'TGR3', 'TGR2', 'TGR1', 'IGP'];

    // Map YD stations to their base for route lookup
    var fromBase = fromStation.replace(' YD', '');
    var toBase = toStation.replace(' YD', '');

    var fi = -1, ti = -1;
    for (var i = 0; i < mainRoute.length; i++) {
        if (mainRoute[i] === fromBase) fi = i;
        if (mainRoute[i] === toBase) ti = i;
    }
    if (fi < 0 || ti < 0) {
        console.error('Station not found in route: ' + fromStation + ' / ' + toStation);
        return [];
    }

    // Build station sequence along main route
    var stations = [];
    if (fi < ti) {
        for (var i = fi; i <= ti; i++) stations.push(mainRoute[i]);
    } else {
        for (var i = fi; i >= ti; i--) stations.push(mainRoute[i]);
    }

    // Build section pairs using actual station names (with YD for first/last)
    var sections = [];
    for (var i = 0; i < stations.length - 1; i++) {
        var sFrom = (i === 0) ? fromStation : stations[i];
        var sTo = (i === stations.length - 2) ? toStation : stations[i + 1];
        sections.push(sFrom + '-' + sTo);
    }
    return sections;
}

/**
 * Filter PSR data for current trip and rebuild cumulative distances from SPAN
 * Mimics GAS filterAndTransformDataForSpeed() logic
 *
 * @param {string} fromStation
 * @param {string} toStation
 * @returns {Array} PSR segments with {from, to, speed} in trip cumulative km
 */
function buildTripPSR(fromStation, toStation) {
    if (!psrRawData) return [];

    var sections = getTripSections(fromStation, toStation);
    if (!sections.length) return [];

    // Filter rows matching trip sections, maintain section order
    var filtered = [];
    for (var s = 0; s < sections.length; s++) {
        var secName = sections[s];
        for (var r = 0; r < psrRawData.length; r++) {
            if (psrRawData[r].section === secName) {
                filtered.push({
                    section: psrRawData[r].section,
                    span: psrRawData[r].span,
                    speed: psrRawData[r].speed,
                    psrFrom: psrRawData[r].psrFrom,
                    psrTo: psrRawData[r].psrTo
                });
            }
        }
    }

    if (!filtered.length) {
        console.warn('No PSR data found for sections: ' + sections.join(', '));
        return [];
    }

    // Rebuild cumulative distances from SPAN (same as GAS logic)
    // Row 0: from=0, to=span
    // Row N: from=prev.to, to=from+span
    var result = [];
    var cumDist = 0;
    for (var i = 0; i < filtered.length; i++) {
        var fromDist = cumDist;
        var toDist = cumDist + filtered[i].span;
        result.push({
            from: Math.round(fromDist * 1000) / 1000,
            to: Math.round(toDist * 1000) / 1000,
            speed: filtered[i].speed,
            section: filtered[i].section,
            psrFrom: filtered[i].psrFrom,
            psrTo: filtered[i].psrTo
        });
        cumDist = toDist;
    }

    psrTripData = result;
    console.log('Trip PSR: ' + result.length + ' segments, total distance: ' + cumDist.toFixed(3) + ' km');
    return result;
}

/**
 * Generate PSR speed values aligned to the trip's distance labels
 * For each distance point in the chart, find the PSR speed limit
 *
 * @param {Array} distanceLabels - chart X-axis labels (cumulative km as strings)
 * @param {Array} psrSegments - from buildTripPSR()
 * @returns {Array} speed limit at each distance point (for Chart.js dataset)
 */
function getPSRForChart(distanceLabels, psrSegments) {
    if (!psrSegments || !psrSegments.length) return null;

    return distanceLabels.map(function(dStr) {
        var d = parseFloat(dStr);
        // Find which PSR segment this distance falls in
        for (var i = 0; i < psrSegments.length; i++) {
            if (d >= psrSegments[i].from && d <= psrSegments[i].to) {
                return psrSegments[i].speed;
            }
        }
        // Beyond last segment — use last speed or null
        if (d > psrSegments[psrSegments.length - 1].to) {
            return psrSegments[psrSegments.length - 1].speed;
        }
        return null;
    });
}

/**
 * Auto-load PSR CSV from same directory
 * Called on page load
 */
function autoLoadPSR() {
    fetch('igp_psr.csv')
        .then(function(r) {
            if (!r.ok) throw new Error('PSR file not found');
            return r.text();
        })
        .then(function(text) {
            loadPSRData(text);
            console.log('PSR auto-loaded from igp_psr.csv');
        })
        .catch(function(err) {
            console.warn('PSR auto-load failed: ' + err.message + ' — PSR overlay will be disabled');
        });
}

// Auto-load on script load

// ════════════════════════════════════════
// SIGNAL MARKERS
// ════════════════════════════════════════

var sigRawData = null;  // All rows from CSV
var sigTripData = null; // Filtered + cumulative for current trip

/**
 * Load signal CSV
 * Format: SECTION, ISD, SIGNAL
 */
function loadSignalData(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    if (lines.length < 2) { console.error('Empty signal CSV'); return; }
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',').map(function(s) { return s.trim() });
        if (p.length < 3) continue;
        rows.push({
            section: p[0],
            isd: parseFloat(p[1]),
            signal: p[2]
        });
    }
    sigRawData = rows;
    console.log('Signal data loaded: ' + rows.length + ' rows');
}

/**
 * Build signal positions for a trip
 * Filters by section, accumulates ISD from trip start
 *
 * @param {string} fromStation
 * @param {string} toStation
 * @returns {Array} [{name, tripDist}]
 */
function buildTripSignals(fromStation, toStation) {
    if (!sigRawData) return [];

    var sections = getTripSections(fromStation, toStation);
    if (!sections.length) return [];

    // Filter signal rows matching trip sections, maintain section order
    var filtered = [];
    for (var s = 0; s < sections.length; s++) {
        for (var r = 0; r < sigRawData.length; r++) {
            if (sigRawData[r].section === sections[s]) {
                filtered.push(sigRawData[r]);
            }
        }
    }

    if (!filtered.length) {
        console.warn('No signal data for sections: ' + sections.join(', '));
        return [];
    }

    // Build cumulative distances from ISD
    var result = [];
    var cumDist = 0;
    for (var i = 0; i < filtered.length; i++) {
        cumDist += filtered[i].isd;
        result.push({
            name: filtered[i].signal,
            tripDist: Math.round(cumDist * 1000) / 1000
        });
    }

    sigTripData = result;
    console.log('Trip signals: ' + result.length + ' signals, last at ' + cumDist.toFixed(3) + ' km');
    return result;
}

/**
 * Auto-load signal CSV
 */
function autoLoadSignals() {
    fetch('igp_signal.csv')
        .then(function(r) {
            if (!r.ok) throw new Error('Signal file not found');
            return r.text();
        })
        .then(function(text) {
            loadSignalData(text);
            console.log('Signals auto-loaded from igp_signal.csv');
        })
        .catch(function(err) {
            console.warn('Signal auto-load failed: ' + err.message);
        });
}


// ════════════════════════════════════════
// STATION MARKERS
// ════════════════════════════════════════

var stnRawData = null;  // All stations from CSV
var stnTripData = null; // Filtered + converted for current trip

/**
 * Load station km CSV
 * Format: STATION,UP,DN (pre-calculated trip distances from PSR boundaries)
 */
function loadStationData(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    if (lines.length < 2) { console.error('Empty station CSV'); return; }
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',').map(function(s) { return s.trim() });
        if (p.length < 3) continue;
        rows.push({
            name: p[0],
            up: parseFloat(p[1]),
            dn: parseFloat(p[2])
        });
    }
    stnRawData = rows;
    console.log('Station km loaded: ' + rows.length + ' stations');
}

/**
 * Build station markers for a trip
 * Uses pre-calculated trip distances from CSV (derived from PSR section boundaries)
 * Perfectly aligned with PSR overlay
 *
 * @param {string} fromStation
 * @param {string} toStation
 * @returns {Array} [{name, tripDist}] sorted by tripDist
 */
function buildStationMarkers(fromStation, toStation) {
    if (!stnRawData) return [];

    var mainRoute = ['KSRA', 'TGR3', 'TGR2', 'TGR1', 'IGP'];
    var fromBase = fromStation.replace(' YD', '');
    var toBase = toStation.replace(' YD', '');

    // Determine direction
    var fi = mainRoute.indexOf(fromBase);
    var ti = mainRoute.indexOf(toBase);
    var isDN = fi < ti; // KSRA(0)→IGP(4) = DN
    var dirCol = isDN ? 'dn' : 'up';

    // Get stations in trip order
    var stations = [];
    if (fi < ti) {
        for (var i = fi; i <= ti; i++) stations.push(mainRoute[i]);
    } else {
        for (var i = fi; i >= ti; i--) stations.push(mainRoute[i]);
    }

    var markers = [];
    for (var i = 0; i < stations.length; i++) {
        // Find in raw data
        for (var j = 0; j < stnRawData.length; j++) {
            if (stnRawData[j].name === stations[i]) {
                markers.push({
                    name: stations[i],
                    tripDist: stnRawData[j][dirCol]
                });
                break;
            }
        }
    }

    stnTripData = markers;
    console.log('Station markers: ' + markers.map(function(m) { return m.name + '=' + m.tripDist }).join(', '));
    return markers;
}

/**
 * Auto-load station km CSV from same directory
 */
function autoLoadStations() {
    fetch('igp_stn_km.csv')
        .then(function(r) {
            if (!r.ok) throw new Error('Station file not found');
            return r.text();
        })
        .then(function(text) {
            loadStationData(text);
            console.log('Stations auto-loaded from igp_stn_km.csv');
        })
        .catch(function(err) {
            console.warn('Station auto-load failed: ' + err.message);
        });
}



// ════════════════════════════════════════
// GHAT MARKERS (DN only: 15/10 Kmph board, GR-0)
// ════════════════════════════════════════
// Source: GAS bankerTripReport() hard-codes '15/10 Kmph' @ WTT km 132.5 and
// 'GR0' @ WTT km 133.9, DN only, then applies the 1.910 km curtailment
// (northEastDistanceNegotiator). Both are physically BEFORE the TGR1 cabin
// (confirmed by user, 13 Sep 2026): the 15 kmph zone is for the train's
// leading driver; the banker at the rear must be ready well before it.
// The CSV carries WTT_KM (reference) and PSR_KM (= WTT_KM - 1.910, the PSR
// CSV datum). PSR_KM is mapped to trip distance THROUGH THE PSR ROWS of the
// selected route so the markers stay aligned with the PSR band and stations.

var ghatRawData = null;   // [{name, km, dir, note}]
var ghatTripData = null;  // markers for current trip

function loadGhatMarkerData(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    if (lines.length < 2) { console.error('Empty ghat marker CSV'); return; }
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',');
        if (p.length < 5) continue;
        rows.push({
            name: p[0].trim(),
            dir: p[1].trim().toUpperCase(),
            anchor: p[2].trim(),                                  // signal (or station) name to anchor to, '' = use km
            offsetM: p[3].trim() === '' ? 0 : parseFloat(p[3]),   // metres along the trip direction (+ ahead, - behind)
            km: p[4].trim() === '' ? null : parseFloat(p[4]),     // PSR-datum km, used only when ANCHOR is empty
            note: p.slice(5).join(',').trim()
        });
    }
    ghatRawData = rows;
    console.log('Ghat markers loaded: ' + rows.length);
}

/**
 * Map a PSR-datum km to trip distance using the trip's PSR segments.
 * Finds the segment whose [psrFrom, psrTo] contains km (either direction)
 * and interpolates within it. Returns null if km is outside the route.
 */
function kmToTripDist(km, psrSegments) {
    if (!psrSegments) return null;
    for (var i = 0; i < psrSegments.length; i++) {
        var seg = psrSegments[i];
        if (seg.psrFrom === undefined || seg.psrTo === undefined) continue;
        var lo = Math.min(seg.psrFrom, seg.psrTo), hi = Math.max(seg.psrFrom, seg.psrTo);
        if (km >= lo - 1e-6 && km <= hi + 1e-6) {
            return Math.round((seg.from + Math.abs(km - seg.psrFrom)) * 1000) / 1000;
        }
    }
    return null;
}

/**
 * Build ghat markers for a trip (only those whose DIR matches).
 * A marker is placed either relative to a signal/station of this trip
 * (ANCHOR + OFFSET_M) or at an absolute PSR-datum km (PSR_KM).
 * @returns {Array} [{name, tripDist, anchor, offsetM, note, type:'ghat'}]
 */
function buildGhatMarkers(fromStation, toStation, psrSegments, signalMarkers, stationMarkers) {
    if (!ghatRawData) return [];
    var mainRoute = ['KSRA', 'TGR3', 'TGR2', 'TGR1', 'IGP'];
    var fi = mainRoute.indexOf(fromStation.replace(' YD', ''));
    var ti = mainRoute.indexOf(toStation.replace(' YD', ''));
    var dir = fi < ti ? 'DN' : 'UP';

    function findAnchor(name) {
        var n = name.toUpperCase();
        var lists = [signalMarkers || [], stationMarkers || []];
        for (var L = 0; L < lists.length; L++) {
            for (var i = 0; i < lists[L].length; i++) {
                if (lists[L][i].name.toUpperCase() === n) return lists[L][i];
            }
        }
        for (var L = 0; L < lists.length; L++) {
            for (var i = 0; i < lists[L].length; i++) {
                if (lists[L][i].name.toUpperCase().indexOf(n) !== -1) return lists[L][i];
            }
        }
        return null;
    }

    var markers = [];
    ghatRawData.forEach(function(g) {
        if (g.dir !== dir) return;
        var td = null, how = '';
        if (g.anchor) {
            var a = findAnchor(g.anchor);
            if (!a) { console.warn('Ghat marker ' + g.name + ': anchor "' + g.anchor + '" not found on this route'); return; }
            td = Math.round((a.tripDist + g.offsetM / 1000) * 1000) / 1000;
            how = g.anchor + ' ' + (g.offsetM >= 0 ? '+' : '') + g.offsetM + ' m';
        } else if (g.km !== null && psrSegments) {
            td = kmToTripDist(g.km, psrSegments);
            if (td === null) { console.warn('Ghat marker ' + g.name + ' @' + g.km + ' is outside the PSR route'); return; }
            how = 'PSR km ' + g.km;
        } else {
            return;
        }
        markers.push({ name: g.name, tripDist: td, anchor: g.anchor, offsetM: g.offsetM, how: how, note: g.note, type: 'ghat' });
    });
    markers.sort(function(a, b) { return a.tripDist - b.tripDist });
    ghatTripData = markers;
    if (markers.length) console.log('Ghat markers: ' + markers.map(function(m) { return m.name + '=' + m.tripDist + ' (' + m.how + ')' }).join(', '));
    return markers;
}

function autoLoadGhatMarkers() {
    fetch('igp_ghat_markers.csv')
        .then(function(r) { if (!r.ok) throw new Error('Ghat marker file not found'); return r.text(); })
        .then(function(text) { loadGhatMarkerData(text); console.log('Ghat markers auto-loaded from igp_ghat_markers.csv'); })
        .catch(function(err) { console.warn('Ghat marker auto-load failed: ' + err.message); });
}



// ════════════════════════════════════════
// WTT NOTIFIED TIMINGS (mail/express only; goods & LE have no schedule)
// ════════════════════════════════════════
// igp_wtt.csv: TRAIN,DIR,FROM,TO,DEP,ARR,MINUTES,NOTE — generated from the
// bbtro WTT stop timings (div_train_stops / data/wtt_db_data.csv): notified
// departure/arrival clock times and run minutes for KSRA<->IGP per train.
// In the DB phase this comes straight from div_train_stops.
var wttRawData = null;

function loadWTTData(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',');
        if (p.length < 7) continue;
        rows.push({ train: p[0].trim().toUpperCase(), dir: p[1].trim().toUpperCase(), from: p[2].trim().toUpperCase(),
                    to: p[3].trim().toUpperCase(), dep: p[4].trim(), arr: p[5].trim(), minutes: parseFloat(p[6]), note: p.slice(7).join(',').trim() });
    }
    wttRawData = rows;
    console.log('WTT timings loaded: ' + rows.length + ' rows');
}

/** WTT row for train/dir/from/to, or null. */
function wttRow(train, dir, from, to) {
    if (!wttRawData || !train) return null;
    var t = String(train).trim().toUpperCase(), f = from.toUpperCase(), o = to.toUpperCase(), d = dir.toUpperCase();
    for (var i = 0; i < wttRawData.length; i++) {
        var r = wttRawData[i];
        if (r.train === t && r.dir === d && r.from === f && r.to === o) return r;
    }
    return null;
}
/** Minutes for train/dir/from/to, or null. */
function wttMinutes(train, dir, from, to) { var r = wttRow(train, dir, from, to); return r ? r.minutes : null; }

function autoLoadWTT() {
    fetch('igp_wtt.csv')
        .then(function(r) { if (!r.ok) throw new Error('WTT file not found'); return r.text(); })
        .then(function(text) { loadWTTData(text); })
        .catch(function(err) { console.warn('WTT auto-load failed: ' + err.message); });
}


// ════════════════════════════════════════
// REFERENCE DATA FROM THE SERVER (replaces the CSV auto-loads)
// ════════════════════════════════════════
// The bbtro router serves the div_ghat_spm_* tables and the WTT stops in the
// same shapes the CSV loaders produced, so everything below the loaders is
// unchanged. Called by the page once the section is chosen.
var GHAT_API = window.GHAT_API || '/api/division/ghat-spm';
var currentSection = null;

function loadReferenceData(section) {
    currentSection = section;
    psrRawData = null; sigRawData = null; stnRawData = null; ghatRawData = null; wttRawData = null;
    var ref = fetch(GHAT_API + '/ref?section=' + encodeURIComponent(section), { credentials: 'same-origin' })
        .then(function(r) { if (!r.ok) throw new Error('ref ' + r.status); return r.json(); })
        .then(function(j) {
            psrRawData = j.psr;          // [{section, psrFrom, psrTo, span, speed}]
            sigRawData = j.signals;      // [{section, isd, signal}]
            stnRawData = j.stations;     // [{name, up, dn}]
            ghatRawData = j.markers.map(function(m) { return { name: m.name, dir: m.dir, anchor: m.anchor, offsetM: m.offsetM, km: m.km, note: m.note }; });
            console.log('Ghat SPM reference loaded for ' + section + ': PSR ' + psrRawData.length + ', signals ' + sigRawData.length + ', stations ' + stnRawData.length + ', markers ' + ghatRawData.length);
        });
    var wtt = fetch(GHAT_API + '/wtt?section=' + encodeURIComponent(section), { credentials: 'same-origin' })
        .then(function(r) { if (!r.ok) throw new Error('wtt ' + r.status); return r.json(); })
        .then(function(j) { wttRawData = j.rows; console.log('WTT timings loaded: ' + wttRawData.length + ' rows'); });
    return Promise.all([ref, wtt]);
}
