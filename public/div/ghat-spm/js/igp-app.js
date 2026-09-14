// ════════════════════════════════════════
// IGP SPM APP — UI Logic, File Upload, Glue
// ════════════════════════════════════════

var parsedData = null;
var tripData = null;
var isFullFile = false;

// ── Direction Toggle ──
function setDirection(d) {
    document.querySelectorAll('#dirToggle button').forEach(function(b) {
        b.classList.toggle('active', b.dataset.dir === d);
    });
    document.getElementById('fromStation').value = d === 'DN' ? 'KSRA' : 'IGP';
    document.getElementById('toStation').value = d === 'DN' ? 'IGP' : 'KSRA';
}

function getDirection() {
    var btn = document.querySelector('#dirToggle button.active');
    return btn ? btn.dataset.dir : 'DN';
}

// ── File Upload Handling ──
(function initUpload() {
    var dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.classList.add('drag-over') });
    dropZone.addEventListener('dragleave', function() { dropZone.classList.remove('drag-over') });
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault(); dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    document.getElementById('fileInput').addEventListener('change', function(e) {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
})();

async function handleFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    var dropZone = document.getElementById('dropZone');

    dropZone.classList.add('file-loaded');
    dropZone.innerHTML =
        '<span class="upload-icon">&#10004;</span>' +
        '<div class="upload-title" style="color:var(--green)">File Loaded</div>' +
        '<div class="upload-sub" style="color:var(--text)">' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)</div>' +
        '<input type="file" id="fileInput" accept=".txt,.xlsx,.csv,.xls">';

    // Re-attach listener to new input
    document.getElementById('fileInput').addEventListener('change', function(e) {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    try {
        if (ext === 'txt') parsedData = parseTXT(await file.text());
        else if (ext === 'xlsx' || ext === 'xls') parsedData = parseExcel(await file.arrayBuffer(), file.name);
        else if (ext === 'csv') parsedData = parseCSV(await file.text());

        // Determine if full file
        if (parsedData) {
            var m = parsedData.metadata;
            isFullFile = parsedData.rows.length > 5000 || (m.startEvents && m.startEvents.length > 3);
        }

        showFileInfo();
        renderTripTable(isFullFile && typeof detectTrips === 'function' ? detectTrips(parsedData) : []);
        document.getElementById('btnAnalyze').disabled = !parsedData || !parsedData.rows.length;
    } catch (err) {
        console.error(err);
        var el = document.getElementById('fileInfo');
        el.innerHTML = '<div style="color:var(--red)">Error: ' + err.message + '</div>';
        el.classList.add('visible');
    }
}

// ── File Info Display ──
function showFileInfo() {
    var el = document.getElementById('fileInfo');
    var m = parsedData.metadata;
    var r = parsedData.rows;

    var h = '<div><span class="fi-label">Format:</span> <span class="fi-accent">' + m.format + (m.spmMake ? ' (' + m.spmMake + ')' : '') + '</span></div>';
    h += '<div><span class="fi-label">Rows:</span> <span class="fi-value">' + m.totalRows.toLocaleString() + '</span></div>';
    if (m.loco) h += '<div><span class="fi-label">Loco:</span> <span class="fi-value">' + m.loco + '</span></div>';
    if (m.shed) h += '<div><span class="fi-label">Shed:</span> <span class="fi-value">' + m.shed + '</span></div>';
    if (m.dates && m.dates.length) h += '<div><span class="fi-label">Date(s):</span> <span class="fi-value">' + m.dates.join(', ') + '</span></div>';
    if (r.length > 0) h += '<div><span class="fi-label">Time:</span> <span class="fi-value">' + r[0].time + ' - ' + r[r.length - 1].time + '</span></div>';
    if (isFullFile && m.startEvents) h += '<div style="margin-top:6px"><span class="fi-accent">START events: ' + m.startEvents.length + '</span></div>';

    // Auto-fill loco number
    if (m.loco) document.getElementById('locoNo').value = m.loco;

    el.innerHTML = h;
    el.classList.add('visible');

    // Trip time section for full files
    var ts = document.getElementById('tripTimeSection');
    if (isFullFile) {
        ts.classList.add('visible');
        var wd = document.getElementById('workingDate').value;
        if (wd) {
            document.getElementById('tripDate').value = wd;
        } else if (m.dates && m.dates.length) {
            var d = m.dates[m.dates.length - 1].split('/');
            if (d.length === 3) {
                document.getElementById('tripDate').value = '20' + d[2] + '-' + d[1].padStart(2, '0') + '-' + d[0].padStart(2, '0');
            }
        }
    } else {
        ts.classList.remove('visible');
    }
}

// ── Run Analysis ──
var tsrForTrip = [];          // cautions applied to the current trip (converted to trip km)
var tsrRawForTrip = [];       // as returned by the server
var TSR_API = '/api/division/tsr';

function runAnalysis() {
    tripData = extractTrip(parsedData, isFullFile);
    if (!tripData || !tripData.length) return;
    showLoading('Analyzing...');
    var dir = getDirection();
    var at = (tripData[0].date.split('/').reverse().map(function(x, i) { return i === 0 ? '20' + x : x; }).join('-')) + 'T' + tripData[0].time;
    var section = (typeof currentSection !== 'undefined' && currentSection) ? currentSection : 'KSRA-IGP';
    fetch(TSR_API + '/active?section=' + encodeURIComponent(section) + '&dir=' + dir + '&at=' + encodeURIComponent(at), { credentials: 'same-origin' })
        .then(function(r) { return r.ok ? r.json() : { rows: [] }; })
        .catch(function() { return { rows: [] }; })
        .then(function(j) { tsrRawForTrip = j.rows || []; finishAnalysis(); });
}

function finishAnalysis() {
    try {
        var stats = computeStats(tripData);
        var halts = detectHalts(tripData);

        // Build PSR overlay data
        var fromStn = document.getElementById('fromStation').value;
        var toStn = document.getElementById('toStation').value;
        var psrSegments = null;
        if (typeof buildTripPSR === 'function' && psrRawData) {
            psrSegments = buildTripPSR(fromStn, toStn);
        }

        // Build station markers (from curtailment-adjusted km CSV)
        var stationMarkers = null;
        if (typeof buildStationMarkers === 'function' && stnRawData) {
            stationMarkers = buildStationMarkers(fromStn, toStn);
        }

        // Build signal markers
        var signalMarkers = null;
        if (typeof buildTripSignals === 'function' && sigRawData) {
            signalMarkers = buildTripSignals(fromStn, toStn);
        }

        // DN ghat markers (15/10 board, GR-0) — anchored to signals/stations, drawn on the OHE/Amps chart
        var ghatMarkers = null;
        if (typeof buildGhatMarkers === 'function' && ghatRawData) {
            ghatMarkers = buildGhatMarkers(fromStn, toStn, psrSegments, signalMarkers, stationMarkers);
        }

        // TSR: convert the cautions to trip km and lower the PSR band where a speed applies
        tsrForTrip = [];
        if (psrSegments && tsrRawForTrip.length) {
            tsrRawForTrip.forEach(function(c) { var t = cautionToTrip(c, psrSegments, tripData, getTrainType()); if (t) tsrForTrip.push(t); });
        }
        var effectivePSR = psrSegments ? applyTSR(psrSegments, tsrForTrip) : psrSegments;
        tsrForChart = tsrForTrip;

        showResults(stats, halts);
        renderStationTable(stationReadings(tripData, stationMarkers, ghatMarkers));
        renderSectionalTimes(sectionalTimes(tripData, stationMarkers, halts), getDirection());
        renderPSRCompliance(psrCompliance(tripData, effectivePSR, getTrainType()));
        renderTripTSR(tsrForTrip, tsrRawForTrip.length);
        var isDN = getDirection() === 'DN';
        renderHaltAnalysis(halts, haltApproachProfiles(tripData, halts, stationMarkers, signalMarkers, ghatMarkers,
            { lookAheadKm: isDN ? 0.75 : 0.4, bankerAtRear: isDN }), getDirection());
        renderCharts(tripData, halts, effectivePSR, stationMarkers, signalMarkers, ghatMarkers);
        hideLoading();
        document.getElementById('inputSection').classList.add('collapsed');
        document.getElementById('resultsSection').classList.add('visible');
    } catch (e) {
        hideLoading();
        alert('Error: ' + e.message);
        console.error(e);
    }
}

// ── TSR applied to this trip (card under the compliance table) ──
function renderTripTSR(list, rawCount) {
    var card = document.getElementById('tripTsrCard'); if (!card) return;
    if (!rawCount) { card.style.display = 'none'; return; }
    card.style.display = '';
    var skipped = rawCount - list.length;
    document.getElementById('tripTsrNote').textContent = list.length + ' caution' + (list.length === 1 ? '' : 's') + ' apply to this trip' +
        (skipped ? ' (' + skipped + ' more on file for the day fell outside the route or the daily time window)' : '') + '.';
    document.querySelector('#tripTsrTable tbody').innerHTML = list.map(function(t) {
        return '<tr><td>' + t.id + '</td><td>' + (t.line || '-') + (t.advisoryLine ? ' <span class="stn-note">middle line</span>' : '') + '</td><td>' + t.mast + '</td><td>' + t.from.toFixed(2) + ' – ' + t.to.toFixed(2) +
            '</td><td>' + (t.advisory ? '<span class="badge-muted">' + (t.type === 'OHS_WF' ? 'OHS / WF' : t.type.toLowerCase()) + '</span>' : '<span class="badge-warn">' + t.speed + ' kmph</span>') +
            '</td><td>' + (t.window || 'all day') + '</td><td>' + (t.reason || t.remarks || '') + '</td></tr>';
    }).join('');
}

// ── Display Results ──
function showResults(stats, halts) {
    var dir = getDirection();
    var tn = document.getElementById('trainNo').value || '-';
    var ln = document.getElementById('locoNo').value || '-';
    var cr = document.getElementById('crewName').value || document.getElementById('cmsId').value || '-';
    var ld = document.getElementById('load').value || '-';
    var fs = document.getElementById('fromStation').value;
    var ts2 = document.getElementById('toStation').value;

    var tt = getTrainType();

    var items = [['Dir', dir], ['Route', fs + ' to ' + ts2], ['Train', tn], ['Type', tt], ['Loco', ln], ['Load', ld], ['Crew', cr]];

    // Anchoring info: what the user entered vs what the recorder shows
    var a = (tripData && tripData.anchor) || { warnings: [] };
    if (a.reqStart) {
        items.push(['Dep entered', a.reqStart.slice(0, 5) + ' → recorder ' + a.actStart + ' (' + fmtShift(a.startShiftSec) + ')']);
        if (a.reqEnd) items.push(['Arr entered', a.reqEnd.slice(0, 5) + ' → recorder ' + a.actEnd + ' (' + fmtShift(a.endShiftSec) + ')']);
        else items.push(['Arr', 'auto-detected ' + a.actEnd]);
        if (a.arrivalGapSec !== null && a.arrivalGapSec !== undefined && isFinite(a.arrivalGapSec)) {
            items.push(['Stood after arr', fmtDur(a.arrivalGapSec)]);
        }
    }
    var html = items.map(function(x) {
        return '<div class="ti-item"><span class="ti-label">' + x[0] + ':</span><span class="ti-value">' + x[1] + '</span></div>';
    }).join('');
    if (a.warnings && a.warnings.length) {
        html += '<div class="ti-warn">' + a.warnings.map(function(w) { return '&#9888; ' + w; }).join('<br>') + '</div>';
    }
    document.getElementById('tripInfoBar').innerHTML = html;

    var sv = [
        [stats.maxSpeed, 'Max Speed (kmph)'], [stats.avgSpeed, 'Avg Speed'],
        [stats.totalDist, 'Distance (km)'], [fmtSec(stats.totalSeconds), 'Running Time'],
        [stats.depTime, 'Departure'], [stats.arrTime, 'Arrival'], [halts.length, 'Total Halts']
    ];
    document.getElementById('statsStrip').innerHTML = sv.map(function(x) {
        return '<div class="stat-card"><div class="stat-value">' + x[0] + '</div><div class="stat-label">' + x[1] + '</div></div>';
    }).join('');

    // Attaching halts (DN only — banker approaching the rear of the train at KSRA)
    var ac = document.getElementById('attachCard');
    var ah = (tripData && tripData.attachHalts) || null;
    if (ac) {
        if (dir === 'DN' && ah) {
            ac.style.display = '';
            var atb = document.querySelector('#attachTable tbody');
            var head = document.getElementById('attachSummary');
            var line = document.getElementById('attachLine');
            if (line) {
                if (ah.halts.length) {
                    var dists = ah.halts.map(function(h) { return h.rearM + ' m'; });
                    line.innerHTML = 'Banker stopped at <b>' + dists.join(', ') + '</b> in rear of the Train.';
                } else {
                    line.innerHTML = 'No banker stops found in the last ' + ah.lookbackM + ' m before departure.';
                }
            }
            if (head) head.textContent = 'Departure ' + stats.depTime + ' — attached and stood ' +
                fmtDur(ah.attachedStoodSec) + ' before moving off. Detail in order of approach:';
            if (!ah.halts.length) {
                atb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-dim)">No stops in the last ' + ah.lookbackM + ' m before departure</td></tr>';
            } else {
                // Chronological: farthest stop first, ending with the final creep onto the train
                var chron = ah.halts.slice().reverse();
                var lim = ANCHOR.ATTACH_FINAL_MAX_KMPH;
                atb.innerHTML = chron.map(function(h, i) {
                    var isFinal = (i === chron.length - 1);
                    var over = isFinal && h.creepMaxKmph > lim;
                    var spd = over
                        ? '<span class="badge-abrupt" title="Final creep onto the train above ' + lim + ' kmph">' + h.creepMaxKmph + ' &#9888;</span>'
                        : (isFinal ? '<span class="badge-smooth">' + h.creepMaxKmph + '</span>' : h.creepMaxKmph);
                    return '<tr><td>' + (i + 1) + '</td><td>' + h.time + '</td><td>' + h.rearM + ' m</td><td>' + fmtDur(h.stoodSec) +
                        '</td><td>' + h.creepM + ' m' + (isFinal ? ' (onto train)' : '') + '</td><td>' + spd + '</td></tr>';
                }).join('');
                var last = chron[chron.length - 1];
                if (line && last.creepMaxKmph > lim) {
                    line.innerHTML += ' <span class="badge-abrupt">Final approach ' + last.creepMaxKmph + ' kmph (limit ' + lim + ')</span>';
                } else if (line) {
                    line.innerHTML += ' <span class="badge-smooth">Final approach ' + last.creepMaxKmph + ' kmph</span>';
                }
            }
        } else {
            ac.style.display = 'none';
        }
    }

    // Departure notch-up profile (DN only)
    var dc = document.getElementById('departCard');
    if (dc) {
        if (dir === 'DN' && tripData && typeof departureProfile === 'function') {
            var dp = departureProfile(tripData);
            dc.style.display = '';
            var inBand = function(m) { return m >= 45 && m <= 70; };
            var th = '<tr><th>After departure</th>' + dp.rows.map(function(r) {
                return '<th' + (inBand(r.m) ? ' class="band"' : '') + '>' + (r.m === 0 ? 'Start' : r.m + ' m') + '</th>';
            }).join('') + '</tr>';
            var mk = function(label, key) {
                return '<tr><td>' + label + '</td>' + dp.rows.map(function(r) {
                    return '<td' + (inBand(r.m) ? ' class="band"' : '') + '>' + (r[key] === null ? '-' : r[key]) + '</td>';
                }).join('') + '</tr>';
            };
            document.querySelector('#departTable thead').innerHTML = th;
            document.querySelector('#departTable tbody').innerHTML = mk('Amps (A)', 'amps') + mk('Speed (kmph)', 'speed') + mk('Time (s)', 'secs');
            document.getElementById('departSummary').textContent = 'Departure ' + stats.depTime + ', idle current ' + dp.idleAmps +
                ' A. Shaded band = 2-3 coach lengths (45-70 m) where the ghat driver is expected to come on notches.';
        } else {
            dc.style.display = 'none';
        }
    }

}

// ── Station-wise readings table ──
function renderStationTable(readings) {
    var card = document.getElementById('stationCard');
    if (!card) return;
    if (!readings || !readings.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    document.querySelector('#stationTable tbody').innerHTML = readings.map(function(r) {
        var name = r.isGhat ? '<span class="ghat-name">' + r.name + '</span>' : r.name;
        var tag = r.note ? ' <span class="stn-note">' + r.note + '</span>' : '';
        return '<tr><td>' + name + tag + '</td><td>' + r.tripDist.toFixed(2) + '</td><td>' + r.time + '</td><td>' + r.speed +
            '</td><td>' + (r.oheKV != null ? r.oheKV.toFixed(1) : '-') + '</td><td>' + r.amps + '</td></tr>';
    }).join('');
}

// ── Halt Analysis: summary table + approach sub-table per halt (both directions) ──
function renderHaltAnalysis(halts, profiles, dir) {
    var card = document.getElementById('approachCard');
    if (!card) return;
    var note = document.getElementById('approachNote');
    if (note) note.textContent = dir === 'DN'
        ? 'DN: the leading driver notches down / drops a little air and the ghat driver at the rear must follow in tandem. A gradual taper of speed and current over the last 1000 m before each halt shows proper coordination.'
        : 'UP: the banker driver is in front and brakes himself. Speed and current over the last 1000 m before each halt.';

    var tb = document.querySelector('#haltTable tbody');
    if (!halts || !halts.length) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-dim)">No halts</td></tr>';
        document.getElementById('approachBody').innerHTML = '';
        return;
    }
    var byNum = {};
    (profiles || []).forEach(function(p) { byNum[p.num] = p; });

    tb.innerHTML = halts.map(function(h) {
        var p = byNum[h.num];
        var place = p ? p.label : ('km ' + h.dist.toFixed(2));
        var stood = fmtDur(h.duration);
        if (h.stops > 1) stood += ' <span class="creep-tag" title="' + h.stops + ' stops, crept ' + h.creepM + ' m at up to ' + h.creepMaxKmph + ' kmph">' + h.stops + ' stops, ' + h.creepM + ' m creep</span>';
        return '<tr><td>' + h.num + '</td><td>' + place + '</td><td>' + h.time + '</td><td>' + stood + '</td><td>' + h.dist.toFixed(3) +
            '</td><td><span class="badge-' + h.profile.toLowerCase() + '">' + h.profile + '</span></td></tr>';
    }).join('');

    var shade = function(v, max, rgb) {
        if (v === null || !max) return '';
        var a = 0.08 + 0.55 * (v / max);
        return ' style="background:rgba(' + rgb + ',' + a.toFixed(2) + ')"';
    };
    document.getElementById('approachBody').innerHTML = (profiles || []).map(function(p) {
        var maxS = Math.max.apply(null, p.cols.map(function(c) { return c.speed || 0 }));
        var maxA = Math.max.apply(null, p.cols.map(function(c) { return c.amps || 0 }));
        var head = '<tr><th>Before halt</th>' + p.cols.map(function(c) { return '<th>' + c.m + ' m</th>'; }).join('') + '<th>Halt</th></tr>';
        var rowS = '<tr><td>Speed (kmph)</td>' + p.cols.map(function(c) { return '<td' + shade(c.speed, maxS, '96,165,250') + '>' + (c.speed === null ? '-' : c.speed) + '</td>'; }).join('') + '<td>0</td></tr>';
        var rowA = '<tr><td>Amps (A)</td>' + p.cols.map(function(c) { return '<td' + shade(c.amps, maxA, '251,191,36') + '>' + (c.amps === null ? '-' : c.amps) + '</td>'; }).join('') + '<td>-</td></tr>';
        return '<div class="approach-block">' +
            '<div class="approach-title">Halt ' + p.num + ' — <b>' + p.label + '</b> — ' + p.time + ', stood ' + fmtDur(p.duration) + ', km ' + p.dist.toFixed(2) +
            ' <span class="badge-' + p.profile.toLowerCase() + '">' + p.profile + '</span></div>' +
            '<div style="overflow-x:auto"><table class="halt-table depart-table approach-table"><thead>' + head + '</thead><tbody>' + rowS + rowA + '</tbody></table></div></div>';
    }).join('');
}

// ── Trip table (trips detected in the loaded file) ──
var tripList = [];        // from detectTrips()
var currentTripIdx = -1;  // row currently shown in the results

function renderTripTable(trips) {
    tripList = trips || [];
    currentTripIdx = -1;
    var card = document.getElementById('tripTableCard');
    if (!card) return;
    if (!tripList.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    document.getElementById('tripTableCount').textContent = tripList.length + ' trip' + (tripList.length === 1 ? '' : 's');
    document.querySelector('#tripTable tbody').innerHTML = tripList.map(function(t, i) {
        return '<tr id="tripRow' + i + '"' + (t.check ? ' class="check" title="Distance outside the usual range — check the departure"' : '') + '>' +
            '<td><input type="checkbox" class="tt-sel" data-i="' + i + '" checked style="width:auto"></td>' +
            '<td>' + t.n + '</td><td id="tripDate' + i + '">' + t.date + '</td>' +
            '<td><input type="time" step="1" class="tt-time tt-depin" data-i="' + i + '" value="' + t.depTime + '" onchange="timeEdited(' + i + ', \'dep\', this)"' + candTitle(t) + '></td>' +
            '<td><input type="time" step="1" class="tt-time tt-arrin" data-i="' + i + '" value="' + t.arrTime + '" onchange="timeEdited(' + i + ', \'arr\', this)"></td>' +
            '<td><span id="tripKm' + i + '">' + t.km.toFixed(3) + '</span><span id="tripWarn' + i + '">' + (t.check ? ' &#9888;' : '') + '</span><div class="tt-msg" id="tripMsg' + i + '"></div></td>' +
            '<td><select class="tt-dir" data-i="' + i + '" onchange="dirChanged(' + i + ', this)"><option' + (t.dirGuess === 'DN' ? ' selected' : '') + '>DN</option><option' + (t.dirGuess === 'UP' ? ' selected' : '') + '>UP</option></select></td>' +
            '<td><input type="text" class="tt-train" data-i="' + i + '" placeholder="12137 / GOODS / LE"></td>' +
            '<td><input type="text" class="tt-driver wide" data-i="' + i + '" placeholder="CMS ID"></td>' +
            '<td><input type="text" class="tt-load" data-i="' + i + '" placeholder="24 coach / LE"></td>' +
            '<td class="tt-tsr" id="tripTsr' + i + '">…</td>' +
            '<td><button type="button" class="row-btn" onclick="analyseTripRow(' + i + ')">Analyse</button></td></tr>';
    }).join('');
    fillTripTableTSR();
    // carry-down: driver and load fill the empty rows below when changed
    ['tt-driver', 'tt-load'].forEach(function(cls) {
        document.querySelectorAll('#tripTable .' + cls).forEach(function(inp) {
            inp.addEventListener('change', function() {
                var i = parseInt(this.dataset.i, 10), v = this.value;
                document.querySelectorAll('#tripTable .' + cls).forEach(function(o) {
                    if (parseInt(o.dataset.i, 10) > i && !o.value) o.value = v;
                });
            });
        });
    });
}

/** Tooltip listing the other departure candidates, when the detector found more than one. */
function candTitle(t) {
    if (!t.cands || t.cands.length < 2) return '';
    var others = t.cands.filter(function(c) { return c.idx !== t.si; }).map(function(c) { return c.time + ' (' + c.km.toFixed(2) + ' km, stood ' + fmtDur(c.standSec) + ')'; });
    return ' title="Other possible departure: ' + others.join('; ') + ' — type the time from the driver\'s sheet and the app snaps to the recorder"';
}

/** Dep/Arr edited: snap to the recorder and refresh this row only. */
function timeEdited(i, which, inp) {
    var t = tripList[i]; if (!t) return;
    var msg = document.getElementById('tripMsg' + i);
    var old = which === 'dep' ? t.depTime : t.arrTime;
    if (msg) { msg.textContent = 'rechecking…'; msg.className = 'tt-msg'; }
    setTimeout(function() {
        var res = recheckTrip(t, which, inp.value, tripList[i - 1] || null, tripList[i + 1] || null);
        if (!res.ok) {
            inp.value = old;
            if (msg) { msg.textContent = res.message + ' — kept ' + old; msg.className = 'tt-msg bad'; }
            return;
        }
        inp.value = which === 'dep' ? t.depTime : t.arrTime;
        document.getElementById('tripKm' + i).textContent = t.km.toFixed(3);
        document.getElementById('tripWarn' + i).innerHTML = t.check ? ' &#9888;' : '';
        document.getElementById('tripDate' + i).textContent = t.date;
        var dir = document.querySelector('#tripTable .tt-dir[data-i="' + i + '"]'); if (dir) dir.value = t.dirGuess;
        var row = document.getElementById('tripRow' + i); if (row) row.classList.toggle('check', !!t.check);
        if (msg) { msg.textContent = res.message; msg.className = 'tt-msg ' + (res.warn ? 'bad' : 'good'); }
    }, 30);
}

/** Direction changed in the row: re-apply the default departure rule unless the CLI edited the time. */
function dirChanged(i, sel) {
    var t = tripList[i]; if (!t || t.depManual || !t.cands || t.cands.length < 2) return;
    var idx = pickDepartureFor(sel.value, t.cands);
    var c = t.cands.filter(function(x) { return x.idx === idx; })[0]; if (!c) return;
    var inp = document.querySelector('#tripTable .tt-depin[data-i="' + i + '"]');
    if (inp) { inp.value = c.time; timeEdited(i, 'dep', inp); t.depManual = false; }
}

function tripRowValues(i) {
    var q = function(cls) { var el = document.querySelector('#tripTable .' + cls + '[data-i="' + i + '"]'); return el ? el.value.trim() : ''; };
    return { dir: q('tt-dir') || 'DN', train: q('tt-train'), driver: q('tt-driver'), load: q('tt-load') };
}

/** Fill the form from trip row i and run the analysis. */
function analyseTripRow(i) {
    var t = tripList[i]; if (!t) return;
    var v = tripRowValues(i);
    setDirection(v.dir);
    document.getElementById('trainNo').value = v.train;
    document.getElementById('load').value = v.load;
    if (v.driver) document.getElementById('cmsId').value = v.driver;
    document.getElementById('tripDate').value = t.isoDate;
    document.getElementById('tripStart').value = t.depTime;
    document.getElementById('tripEnd').value = t.arrTime;
    currentTripIdx = i;
    var row = document.getElementById('tripRow' + i); if (row) row.classList.add('done');
    runAnalysis();
    updateTripNav();
}

function updateTripNav() {
    var nav = document.getElementById('tripNav'); if (!nav) return;
    if (currentTripIdx < 0 || !tripList.length) { nav.style.display = 'none'; return; }
    nav.style.display = '';
    var t = tripList[currentTripIdx], v = tripRowValues(currentTripIdx);
    document.getElementById('tripNavLabel').textContent = 'Trip ' + t.n + ' of ' + tripList.length + ' — ' + t.date + ' ' + t.depTime + ' → ' + t.arrTime + ' ' + v.dir + (v.train ? ' ' + v.train : '');
    nav.querySelectorAll('.nav-btn')[0].disabled = currentTripIdx <= 0;
    nav.querySelectorAll('.nav-btn')[1].disabled = currentTripIdx >= tripList.length - 1;
}

function navTrip(step) {
    var i = currentTripIdx + step;
    if (i < 0 || i >= tripList.length) return;
    analyseTripRow(i);
    window.scrollTo(0, 0);
}

// ── Train type from the train number ──
function getTrainType() {
    var tn = (document.getElementById('trainNo').value || '').trim();
    if (!tn) return 'Unknown';
    if (/^LE$/i.test(tn)) return 'Light Engine';
    if (/^\d+$/.test(tn)) return 'Coaching';
    return 'Goods';
}

// ── PSR / MPS compliance card ──
function renderPSRCompliance(zones) {
    var card = document.getElementById('psrCard');
    if (!card) return;
    if (!zones || !zones.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    var cls = { 'OK': 'badge-smooth', 'marginal': 'badge-warn', 'over': 'badge-abrupt', 'n/a': 'badge-muted', 'no data': 'badge-muted' };
    document.querySelector('#psrTable tbody').innerHTML = zones.map(function(z) {
        var isMPS = z.limit === 60;
        var tsrTag = z.tsr ? ' <span class="tsr-tag" title="' + (z.tsr.reason || '') + '">TSR ' + z.tsr.id + '</span>' : '';
        return '<tr' + (z.verdict === 'over' ? ' class="row-over"' : '') + (z.tsr ? ' class="row-tsr"' : '') + '><td>' + z.from.toFixed(2) + ' – ' + z.to.toFixed(2) + '</td><td>' + z.section +
            '</td><td>' + z.limitLabel + (isMPS ? ' <span class="stn-note">MPS</span>' : '') + tsrTag + '</td><td>' + (z.maxSpeed === null ? '-' : z.maxSpeed) +
            '</td><td>' + (z.excess ? '+' + z.excess : '-') + '</td><td>' + (z.overM ? z.overM + ' m / ' + z.overSec + ' s' : '-') +
            '</td><td><span class="' + (cls[z.verdict] || 'badge-muted') + '">' + z.verdict + '</span></td></tr>';
    }).join('');
    var n = zones.filter(function(z) { return z.verdict === 'over' }).length, m = zones.filter(function(z) { return z.verdict === 'marginal' }).length;
    document.getElementById('psrNote').textContent = 'Train type: ' + getTrainType() + '. ' + zones.length + ' zones; ' +
        (n ? n + ' over limit' : 'none over limit') + (m ? ', ' + m + ' marginal (≤ 2 kmph)' : '') + '. Excess = peak kmph above the limit; over = distance and seconds run above it.';
}

// ── Sectional running time (actual; WTT column for mail/express when known) ──
function renderSectionalTimes(st, dir) {
    var card = document.getElementById('sectionCard');
    if (!card) return;
    if (!st || !st.sections.length) { card.style.display = 'none'; return; }
    card.style.display = '';
    var tn = document.getElementById('trainNo').value.trim();
    var isCoaching = /^\d+$/.test(tn);
    var haveWTT = false;
    var mmss = function(sec) { var m = Math.floor(sec / 60), s2 = Math.round(sec % 60); return m + ':' + (s2 < 10 ? '0' : '') + s2; };
    var rows = st.sections.concat([st.total]);
    var html = rows.map(function(s2, i) {
        var isTotal = (i === rows.length - 1);
        var w = (isCoaching && typeof wttMinutes === 'function') ? wttMinutes(tn, dir, s2.from, s2.to) : null;
        var wCell = '-', dCell = '-';
        if (w !== null) {
            haveWTT = true;
            var diff = Math.round(s2.elapsedSec - w * 60);
            wCell = mmss(w * 60);
            dCell = '<span class="' + (diff > 0 ? 'late' : 'early') + '">' + (diff > 0 ? '+' : '') + mmss(Math.abs(diff)).replace(/^/, diff < 0 ? '-' : '') + '</span>';
        }
        return '<tr' + (isTotal ? ' class="total-row"' : '') + '><td>' + s2.from + ' → ' + s2.to + '</td><td>' + s2.fromTime + '</td><td>' + s2.toTime +
            '</td><td>' + mmss(s2.elapsedSec) + '</td><td>' + (s2.halts ? mmss(s2.haltSec) + ' (' + s2.halts + ')' : '-') + '</td><td>' + mmss(s2.movingSec) +
            '</td><td>' + wCell + '</td><td>' + dCell + '</td></tr>';
    }).join('');
    document.querySelector('#sectionTable tbody').innerHTML = html;
    var note = document.getElementById('sectionNote');
    var punct = '';
    var full = (isCoaching && typeof wttRow === 'function') ? wttRow(tn, dir, st.total.from, st.total.to) : null;
    if (full && full.dep && full.arr) {
        var signed = function(sec) { var a = Math.abs(sec); return (sec < 0 ? '-' : '+') + Math.floor(a / 60) + ':' + ((a % 60) < 10 ? '0' : '') + (a % 60); };
        var dDep = timeToSec(st.total.fromTime) - timeToSec(full.dep + ':00'); if (dDep > 43200) dDep -= 86400; if (dDep < -43200) dDep += 86400;
        var dArr = timeToSec(st.total.toTime) - timeToSec(full.arr + ':00'); if (dArr > 43200) dArr -= 86400; if (dArr < -43200) dArr += 86400;
        punct = ' WTT: dep ' + st.total.from + ' ' + full.dep + ', arr ' + st.total.to + ' ' + full.arr + ' (' + full.minutes + ' min). Actual dep ' +
            st.total.fromTime + ' <b class="' + (dDep > 60 ? 'late' : 'early') + '">' + signed(dDep) + '</b>, arr ' + st.total.toTime +
            ' <b class="' + (dArr > 60 ? 'late' : 'early') + '">' + signed(dArr) + '</b>' + (full.note ? ' — ' + full.note : '') + '.';
    }
    if (note) note.innerHTML = (isCoaching
        ? (haveWTT ? 'WTT from the working timetable for train ' + tn + '.' : 'No WTT timing on file for train ' + tn + '.')
        : 'Goods / light engine: actual times only (no notified schedule).') + punct;
}

// ── UI Navigation ──
function showInput() {
    document.getElementById('inputSection').classList.remove('collapsed');
    document.getElementById('resultsSection').classList.remove('visible');
}

function newAnalysis() {
    showInput();
    ['trainNo', 'locoNo', 'load', 'cmsId'].forEach(function(id) { document.getElementById(id).value = '' });
    document.getElementById('crewName').value = '';
    parsedData = null; tripData = null; isFullFile = false;
    renderTripTable([]);
    var nav = document.getElementById('tripNav'); if (nav) nav.style.display = 'none';
    document.getElementById('fileInfo').classList.remove('visible');
    document.getElementById('tripTimeSection').classList.remove('visible');
    document.getElementById('btnAnalyze').disabled = true;

    var dz = document.getElementById('dropZone');
    dz.classList.remove('file-loaded');
    dz.innerHTML =
        '<span class="upload-icon">&#128194;</span>' +
        '<div class="upload-title">Upload SPM Data</div>' +
        '<div class="upload-sub">TXT - XLSX - CSV</div>' +
        '<input type="file" id="fileInput" accept=".txt,.xlsx,.csv,.xls">';
    document.getElementById('fileInput').addEventListener('change', function(e) {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
}

// ── Loading Overlay ──
function showLoading(m) {
    document.getElementById('loadingMsg').textContent = m;
    document.getElementById('loadingOverlay').classList.add('visible');
}
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('visible');
}


// ── Section tabs (IGP / LNL) — enabled from the user's office via /me ──
var ghatMe = null;
function selectSection(a) {
    var section = a.dataset.section;
    if (a.classList.contains('disabled')) return false;
    document.querySelectorAll('#sectionTabs a[data-section]').forEach(function(x) { x.classList.toggle('active', x === a); });
    loadReferenceData(section).catch(function(e) { console.error(e); alert('Could not load reference data for ' + section); });
    if (document.getElementById('tsrOn')) loadTsrCard();
    // manual-entry line list follows the section: NE lines for KSRA-IGP, SE lines for KJT-LNL
    var lineSel = document.getElementById('tsrLine');
    if (lineSel) {
        var ne = section === 'KSRA-IGP';
        [].forEach.call(lineSel.options, function(o) { o.disabled = ne ? /SE$/.test(o.value) : /NE$|^MIDDLE$/.test(o.value); });
        if (lineSel.selectedOptions[0] && lineSel.selectedOptions[0].disabled) lineSel.value = ne ? 'DNNE' : 'DNSE';
    }
    // LNL has no reference data yet — the router will return empty lists; the form still works for IGP only.
    return false;
}
(function initSections() {
    fetch((window.GHAT_API || '/api/division/ghat-spm') + '/me', { credentials: 'same-origin' })
        .then(function(r) { if (!r.ok) throw new Error('me ' + r.status); return r.json(); })
        .then(function(me) {
            ghatMe = me;
            var first = null;
            document.querySelectorAll('#sectionTabs a[data-section]').forEach(function(a) {
                var ok = me.sections.indexOf(a.dataset.section) !== -1;
                a.classList.toggle('disabled', !ok);
                if (ok && !first) first = a;
            });
            if (first) selectSection(first);
            else alert('No ghat section is enabled for your office (' + (me.office || '-') + '). Contact the division admin.');
            var by = document.getElementById('analyzedBy');
            if (by && !by.value && me.full_name) by.value = me.full_name;
        })
        .catch(function(e) { console.error('ghat-spm /me failed', e); });
})();


// ── TSR count per trip row (cautions on file for that day, direction and line) ──
function fillTripTableTSR() {
    var section = (typeof currentSection !== 'undefined' && currentSection) ? currentSection : 'KSRA-IGP';
    var dates = {}; tripList.forEach(function(t) { dates[t.isoDate] = 1; });
    Object.keys(dates).forEach(function(d) {
        fetch(TSR_API + '/list?section=' + encodeURIComponent(section) + '&on=' + d, { credentials: 'same-origin' })
            .then(function(r) { return r.ok ? r.json() : { rows: [] }; }).catch(function() { return { rows: [] }; })
            .then(function(j) {
                tripList.forEach(function(t, i) {
                    if (t.isoDate !== d) return;
                    var dir = (document.querySelector('#tripTable .tt-dir[data-i="' + i + '"]') || {}).value || t.dirGuess;
                    var rows = (j.rows || []).filter(function(c) { return c.direction === dir || c.direction === 'BUP'; });
                    var cell = document.getElementById('tripTsr' + i); if (!cell) return;
                    var n = rows.length, sp = rows.filter(function(c) { return c.res_type === 'SPEED'; }).length;
                    cell.innerHTML = n ? '<span class="tsr-tag">' + n + ' TSR' + (sp ? ' (' + sp + ' speed)' : '') + '</span>' : '<span class="stn-note">none</span>';
                    cell.title = rows.map(function(c) { return c.caution_id + ' ' + (c.line_name || '') + ' ' + (c.from_mast || '') + '-' + (c.to_mast || '') + ' ' + (c.res_type === 'SPEED' ? c.speed_pass + '/' + c.speed_goods + ' kmph' : c.res_type) + (c.time_from ? ' ' + String(c.time_from).slice(0, 5) + '-' + String(c.time_to).slice(0, 5) : ''); }).join('\n');
                });
            });
    });
}

// ── TSR card in the input area: cautions on file today, ICMS import, manual entry ──
function loadTsrCard() {
    var section = (typeof currentSection !== 'undefined' && currentSection) ? currentSection : 'KSRA-IGP';
    var on = document.getElementById('tsrOn').value || new Date().toISOString().slice(0, 10);
    document.getElementById('tsrOn').value = on;
    fetch(TSR_API + '/list?section=' + encodeURIComponent(section) + '&on=' + on, { credentials: 'same-origin' })
        .then(function(r) { return r.json(); })
        .then(function(j) {
            var rows = j.rows || [];
            document.getElementById('tsrCardNote').textContent = rows.length + ' caution' + (rows.length === 1 ? '' : 's') + ' in force on ' + section + ' on ' + on + '.';
            document.querySelector('#tsrCardTable tbody').innerHTML = rows.length ? rows.map(function(c) {
                var lim = c.res_type === 'SPEED' ? (c.speed_pass || '-') + ' / ' + (c.speed_goods || '-') : (c.res_type === 'OHS_WF' ? 'OHS / WF' : 'cautious');
                return '<tr><td>' + c.caution_id + (c.source === 'MANUAL' ? ' <span class="stn-note">manual</span>' : '') + (c.mast_flag ? ' &#9888;' : '') + '</td><td>' + (c.line_name || '-') + ' ' + c.direction + '</td><td>' + (c.from_stn || '') + ' – ' + (c.to_stn || '') +
                    '</td><td>' + (c.from_mast || '') + ' – ' + (c.to_mast || '') + '</td><td>' + lim + '</td><td>' + (c.time_from ? String(c.time_from).slice(0, 5) + '–' + String(c.time_to).slice(0, 5) : 'all day') +
                    '</td><td>' + String(c.date_from).slice(0, 10) + ' → ' + (c.date_to ? String(c.date_to).slice(0, 10) : 'in force') + '</td><td>' + (c.reason || '') +
                    '</td><td><button type="button" class="row-btn" onclick="closeTsr(' + c.id + ')" title="Close today (keeps history)">Close</button></td></tr>';
            }).join('') : '<tr><td colspan="9" style="text-align:center;color:var(--text-dim)">No cautions on file for this day</td></tr>';
        }).catch(function(e) { console.error(e); });
}
function closeTsr(id) {
    if (!confirm('Close this caution as of now?')) return;
    fetch(TSR_API + '/' + id, { method: 'DELETE', credentials: 'same-origin' }).then(function() { loadTsrCard(); });
}
function importTsr() {
    var f = document.getElementById('tsrFile').files[0];
    if (!f) { alert('Choose the ICMS caution report (.xlsx) first'); return; }
    var fd = new FormData(); fd.append('file', f); fd.append('close_missing', document.getElementById('tsrCloseMissing').checked ? '1' : '0');
    var msg = document.getElementById('tsrImportMsg'); msg.textContent = 'Importing…';
    fetch(TSR_API + '/import', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function(r) { return r.json(); })
        .then(function(j) {
            if (!j.success) { msg.textContent = 'Import failed: ' + (j.error || ''); return; }
            msg.textContent = 'Imported: ' + j.rows_read + ' rows read, ' + j.added + ' added, ' + j.updated + ' updated, ' + j.closed + ' closed' + (j.flagged ? ', ' + j.flagged + ' mast cells to check (⚠)' : '') + '. Sections: ' + j.sections.join(', ');
            loadTsrCard(); if (tripList.length) fillTripTableTSR();
        }).catch(function(e) { msg.textContent = 'Import failed: ' + e.message; });
}
function addTsrManual() {
    var g = function(id) { return document.getElementById(id).value.trim(); };
    var speed = g('tsrSpeed'), timed = document.getElementById('tsrTimed').checked;
    var today = new Date(); var pad = function(n) { return (n < 10 ? '0' : '') + n; };
    var body = { section: (typeof currentSection !== 'undefined' && currentSection) ? currentSection : 'KSRA-IGP',
        line_name: g('tsrLine'), direction: g('tsrDir'), from_stn: g('tsrFromStn'), to_stn: g('tsrToStn'), from_mast: g('tsrFromMast'), to_mast: g('tsrToMast'),
        speed_pass: speed, speed_goods: speed, res_type: speed ? 'SPEED' : 'OHS_WF',
        date_from: today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate()) + ' 00:00:00', date_to: '',
        time_from: timed ? g('tsrTimeFrom') : '', time_to: timed ? g('tsrTimeTo') : '', reason: 'Manual entry' };
    if (!body.from_mast) { alert('From mast is required'); return; }
    if (timed && (!body.time_from || !body.time_to)) { alert('Enter both times of the daily window, or untick it'); return; }
    fetch(TSR_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' })
        .then(function(r) { return r.json(); })
        .then(function(j) {
            if (!j.success) { alert(j.error || 'Could not save'); return; }
            document.getElementById('tsrManualMsg').textContent = 'Saved as ' + j.caution_id + '.';
            ['tsrFromMast', 'tsrToMast', 'tsrSpeed'].forEach(function(id) { document.getElementById(id).value = ''; });
            loadTsrCard(); if (tripList.length) fillTripTableTSR();
        }).catch(function(e) { alert('Could not save: ' + e.message); });
}
