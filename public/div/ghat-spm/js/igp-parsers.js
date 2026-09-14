// ════════════════════════════════════════
// IGP SPM PARSERS — TXT, Excel, CSV
// ════════════════════════════════════════

/**
 * Parse Medha SPM TXT file
 * Handles: repeating page headers, pipe-delimited rows, multi-date spans
 * Returns: {metadata, rows[]}
 */
function parseTXT(text) {
    var lines = text.split(/\r?\n/), meta = {}, rows = [];

    // Header metadata (first ~20 lines)
    for (var i = 0; i < Math.min(20, lines.length); i++) {
        var L = lines[i], m;
        if ((m = L.match(/Locono\s*:\s*(\d+)/i)) && !meta.loco) meta.loco = m[1];
        if ((m = L.match(/Shedname\s*:\s*(.+?)\s+Start\s+Dist/i)) || (m = L.match(/Shedname\s*:\s*(.+?)(?:\s{2,}|$)/i))) meta.shed = m[1].trim();
        if (/Medha/i.test(L)) meta.spmMake = 'Medha';
    }

    // Data rows — skip header repeats, page breaks, footers
    for (var i = 0; i < lines.length; i++) {
        var L = lines[i].trim();
        if (!L || L.startsWith('___') || L.startsWith('---')) continue;
        if (/Date\s+Time/i.test(L) || /Kmph\s+Mtrs/i.test(L)) continue;
        if (/Total Coasting|Duration\s+Distance|Driver ID|Filename|Userfile|Start Date|Shedname|PC Software|Medha|PT Input/i.test(L)) continue;

        var p = L.split('|').map(function(s) { return s.trim() });
        if (p.length < 8 || !/^\d{2}\/\d{2}\/\d{2}$/.test(p[0])) continue;

        rows.push({
            date: p[0],                        // DD/MM/YY
            time: p[1],                        // HH:MM:SS
            speed: parseFloat(p[2]) || 0,
            distMeters: parseInt(p[3]) || 0,   // Per-second distance in meters
            oheKV: parseFloat(p[7]) || 0,
            amps: parseInt(p[8]) || 0,
            event: p.length >= 14 ? p[13].trim() : ''
        });
    }

    meta.totalRows = rows.length;
    meta.format = 'Medha TXT';

    // Unique dates
    meta.dates = [];
    var ds = {};
    rows.forEach(function(r) { if (!ds[r.date]) { ds[r.date] = 1; meta.dates.push(r.date) } });

    // START events for trip detection
    var starts = [];
    rows.forEach(function(r, i) { if (r.event === 'START') starts.push({ i: i, date: r.date, time: r.time }) });
    meta.startEvents = starts;

    return { metadata: meta, rows: rows };
}

/**
 * Parse Excel file (XLSX/XLS)
 * Expects columns: DATE, TIME, SPEED, DIST, OHE, AMP, START/EVENT
 * Returns: {metadata, rows[]}
 */
function parseExcel(buf, fname) {
    var wb = XLSX.read(buf, { type: 'array', cellDates: false });
    var meta = { format: 'Excel', sheetNames: wb.SheetNames };

    // ── Raw Medha dump sheet (the TXT report pasted into Excel, one token per
    // cell with the '|' separators as their own cells)? Rebuild the text lines
    // and hand them to parseTXT, which already knows the report layout. This
    // removes the manual "SORT DATA" step.
    var serialToDate = function(v) {
        var d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
        return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + String(d.getUTCFullYear()).slice(2);
    };
    var fracToTime = function(v) {
        var tot = Math.round((v - Math.floor(v)) * 86400);
        return String(Math.floor(tot / 3600)).padStart(2, '0') + ':' + String(Math.floor(tot % 3600 / 60)).padStart(2, '0') + ':' + String(tot % 60).padStart(2, '0');
    };
    for (var si = 0; si < wb.SheetNames.length; si++) {
        var sh = wb.Sheets[wb.SheetNames[si]];
        var rowsRaw = XLSX.utils.sheet_to_json(sh, { header: 1, raw: true });
        var pipeRows = 0;
        for (var i = 0; i < Math.min(60, rowsRaw.length); i++) {
            if ((rowsRaw[i] || []).filter(function(c) { return c === '|' }).length >= 5) pipeRows++;
        }
        if (pipeRows < 3) continue;

        var lines = new Array(rowsRaw.length);
        for (var i = 0; i < rowsRaw.length; i++) {
            var r = rowsRaw[i] || [], toks = [], seenTime = false;
            for (var c = 0; c < r.length; c++) {
                var v = r[c];
                if (v === null || v === undefined || v === '') continue;
                if (typeof v === 'number') {
                    if (c === 0 && v > 40000) { toks.push(serialToDate(v)); continue; }          // date serial in col A
                    if (!seenTime && v > 0 && v < 1 && toks.length === 2) { toks.push(fracToTime(v)); seenTime = true; continue; } // time fraction after "date |"
                    toks.push(String(v));
                } else if (v instanceof Date) {
                    toks.push(c === 0 ? serialToDate((v.getTime() - Date.UTC(1899, 11, 30)) / 86400000) : v.toTimeString().split(' ')[0]);
                } else {
                    toks.push(String(v).trim());
                }
            }
            lines[i] = toks.join(' ');
        }
        var parsed = parseTXT(lines.join('\n'));
        parsed.metadata.format = 'Excel (Medha raw report)';
        parsed.metadata.sheet = wb.SheetNames[si];
        parsed.metadata.sheetNames = wb.SheetNames;
        return parsed;
    }
    // Pick the sheet whose first row is a proper column header (DATE + SPEED).
    // Medha exports often carry a raw text dump on sheet 1 ("FULL DATA") and
    // the clean columns on sheet 2 ("SORT DATA").
    var ws = null, json = null;
    for (var si = 0; si < wb.SheetNames.length; si++) {
        var cand = wb.Sheets[wb.SheetNames[si]];
        var j = XLSX.utils.sheet_to_json(cand, { header: 1, range: 0 });
        if (!j.length) continue;
        var h0 = (j[0] || []).map(function(h) { return (h || '').toString().toUpperCase().trim() });
        var hasDate = h0.some(function(h) { return h.includes('DATE') }), hasSpeed = h0.some(function(h) { return h.includes('SPEED') });
        if (hasDate && hasSpeed) { ws = cand; json = j; meta.sheet = wb.SheetNames[si]; break; }
    }
    if (!ws) { ws = wb.Sheets[wb.SheetNames[0]]; json = XLSX.utils.sheet_to_json(ws, { header: 1 }); meta.sheet = wb.SheetNames[0]; }

    if (json.length < 2) throw new Error('Empty Excel');

    // Map header columns
    var hdr = json[0].map(function(h) { return (h || '').toString().toUpperCase().trim() });
    var cm = {};
    hdr.forEach(function(h, i) {
        if (h.includes('DATE')) cm.date = i;
        else if (h === 'TIME' || h.includes('TIME')) cm.time = i;
        else if (h === 'SPEED' || h.includes('SPEED')) cm.speed = i;
        else if (h === 'DIST' || h.includes('DIST')) cm.dist = i;
        else if (h.includes('OHE') || h === 'KV') cm.ohe = i;
        else if (h.includes('AMP')) cm.amps = i;
        else if (h === 'START' || h.includes('EVENT')) cm.event = i;
    });

    var rows = [];
    for (var i = 1; i < json.length; i++) {
        var r = json[i];
        if (!r || r.length < 4) continue;

        // Date — raw serial number from Excel
        var ds = '', dv = r[cm.date];
        if (typeof dv === 'number' && dv > 40000) {
            // Excel serial to date: base = Dec 30, 1899
            var epoch = new Date(Date.UTC(1899, 11, 30));
            var d = new Date(epoch.getTime() + dv * 86400000);
            ds = String(d.getUTCDate()).padStart(2, '0') + '/' +
                 String(d.getUTCMonth() + 1).padStart(2, '0') + '/' +
                 String(d.getUTCFullYear()).slice(2);
        } else if (dv instanceof Date) {
            // Fallback if cellDates was somehow true
            var iso = dv.toISOString().split('T')[0].split('-');
            ds = iso[2] + '/' + iso[1] + '/' + iso[0].slice(2);
        } else if (typeof dv === 'string') {
            ds = dv;
        }

        // Time — raw serial fraction or string
        var ts = '', tv = r[cm.time];
        if (typeof tv === 'number') {
            var tot = Math.round(tv * 86400);
            ts = String(Math.floor(tot / 3600)).padStart(2, '0') + ':' +
                 String(Math.floor(tot % 3600 / 60)).padStart(2, '0') + ':' +
                 String(tot % 60).padStart(2, '0');
        } else if (tv instanceof Date) {
            ts = tv.toTimeString().split(' ')[0];
        } else if (typeof tv === 'string') {
            ts = tv;
        }

        var ev = cm.event !== undefined ? (r[cm.event] || '').toString().trim() : '';

        // Skip anything that is not a data row (Medha appends its text
        // footer/metadata below the data on the SORT sheet)
        if (!/^\d{2}\/\d{2}\/\d{2}$/.test(ds) || !/^\d{2}:\d{2}:\d{2}$/.test(ts)) continue;

        rows.push({
            date: ds, time: ts,
            speed: parseFloat(r[cm.speed]) || 0,
            distMeters: parseInt(r[cm.dist]) || 0,
            oheKV: cm.ohe !== undefined ? parseFloat(r[cm.ohe]) || 0 : 0,
            amps: cm.amps !== undefined ? parseInt(r[cm.amps]) || 0 : 0,
            event: ev
        });
    }

    meta.totalRows = rows.length;
    meta.dates = [];
    var dd = {};
    rows.forEach(function(r) { if (r.date && !dd[r.date]) { dd[r.date] = 1; meta.dates.push(r.date) } });

    // Loco / shed from the text header, wherever it sits (first sheet's top
    // rows, or the footer block on the data sheet)
    wb.SheetNames.forEach(function(name) {
        if (meta.loco && meta.shed) return;
        var j = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
        for (var i = 0; i < j.length; i++) {
            var cells = (j[i] || []).map(function(c) { return c === null || c === undefined ? '' : String(c).trim() });
            var line = cells.join(' ');
            var ml = /Locono\s*:?\s*(\d+)/i.exec(line);
            if (ml && !meta.loco) meta.loco = ml[1].padStart(6, '0');
            var msd = /Shedname\s*:?\s*([A-Z ]+?)(?:\s+Start|\s*$)/i.exec(line);
            if (msd && !meta.shed) meta.shed = msd[1].trim();
            if (meta.loco && meta.shed) break;
        }
    });

    return { metadata: meta, rows: rows };
}

/**
 * Parse CSV file
 * Supports: DATE,TIME,SPEED,DIST,OHE,AMP,EVENT format (like HIMBJNPT export)
 * Returns: {metadata, rows[]}
 */
function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() });
    if (lines.length < 2) throw new Error('Empty CSV');

    var hdr = lines[0].split(',').map(function(h) { return h.trim().toUpperCase() });
    var meta = { format: 'CSV' }, cm = {};

    hdr.forEach(function(h, i) {
        if (h.includes('DATE')) cm.date = i;
        else if (h === 'TIME' || h.includes('TIME')) cm.time = i;
        else if (h === 'SPEED' || h.includes('SPEED')) cm.speed = i;
        else if (h === 'DIST' || h.includes('DIST')) cm.dist = i;
        else if (h.includes('OHE') || h === 'KV') cm.ohe = i;
        else if (h.includes('AMP')) cm.amps = i;
        else if (h === 'START' || h.includes('EVENT')) cm.event = i;
    });

    var rows = [];
    for (var i = 1; i < lines.length; i++) {
        var p = lines[i].split(',').map(function(s) { return s.trim() });
        if (p.length < 4) continue;
        var ev = cm.event !== undefined ? (p[cm.event] || '') : '';
        rows.push({
            date: cm.date !== undefined ? p[cm.date] : '',
            time: p[cm.time],
            speed: parseFloat(p[cm.speed]) || 0,
            distMeters: parseInt(p[cm.dist]) || 0,
            oheKV: cm.ohe !== undefined ? parseFloat(p[cm.ohe]) || 0 : 0,
            amps: cm.amps !== undefined ? parseInt(p[cm.amps]) || 0 : 0,
            event: ev
        });
    }

    meta.totalRows = rows.length;
    meta.dates = [];
    var dd = {};
    rows.forEach(function(r) { if (r.date && !dd[r.date]) { dd[r.date] = 1; meta.dates.push(r.date) } });

    return { metadata: meta, rows: rows };
}

/**
 * Compute cumulative distance from per-second meter readings
 * CRITICAL: Uses DIST column (per-second meters), NOT the TXT cumulative km column
 */
function cumDist(rows) {
    var c = 0;
    for (var i = 0; i < rows.length; i++) {
        c += (rows[i].distMeters || 0);
        rows[i].cumDistKm = Math.round(c) / 1000;
    }
    return rows;
}