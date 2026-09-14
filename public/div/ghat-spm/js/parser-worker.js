// parser-worker.js — parses the SPM file off the main thread so the page
// never freezes on large files (a 1M-row Medha TXT is ~180 MB of text).
// Uses the same parsers as the page (igp-parsers.js) and SheetJS for Excel.
importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'igp-parsers.js');

self.onmessage = function(e) {
    var msg = e.data;
    try {
        var t0 = Date.now(), parsed;
        self.postMessage({ type: 'progress', stage: 'parsing', bytes: msg.size });
        if (msg.ext === 'txt') parsed = parseTXT(msg.text);
        else if (msg.ext === 'xlsx' || msg.ext === 'xls') parsed = parseExcel(msg.buffer, msg.name);
        else if (msg.ext === 'csv') parsed = parseCSV(msg.text);
        else throw new Error('Unsupported file type: ' + msg.ext);
        parsed.metadata.fileName = msg.name;
        parsed.metadata.parseMs = Date.now() - t0;
        self.postMessage({ type: 'progress', stage: 'transferring', rows: parsed.rows.length });
        // Pack the rows into typed columns: transferring a million small objects
        // by structured clone costs seconds; typed arrays move without a copy.
        var rows = parsed.rows, n = rows.length;
        var dates = [], dateIdx = {}, events = [''], eventIdx = { '': 0 };
        var dIdx = new Uint16Array(n), tSec = new Uint32Array(n), speed = new Float32Array(n), dist = new Uint16Array(n), kv = new Float32Array(n), amps = new Uint16Array(n), ev = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            var r = rows[i];
            if (dateIdx[r.date] === undefined) { dateIdx[r.date] = dates.length; dates.push(r.date); }
            dIdx[i] = dateIdx[r.date];
            var p = r.time.split(':'); tSec[i] = (+p[0]) * 3600 + (+p[1]) * 60 + (+p[2] || 0);
            speed[i] = r.speed; dist[i] = r.distMeters; kv[i] = r.oheKV; amps[i] = r.amps;
            if (eventIdx[r.event] === undefined) { eventIdx[r.event] = events.length; events.push(r.event); }
            ev[i] = eventIdx[r.event];
        }
        parsed.rows = null;
        var cols = { n: n, dates: dates, events: events, dIdx: dIdx, tSec: tSec, speed: speed, dist: dist, kv: kv, amps: amps, ev: ev };
        self.postMessage({ type: 'done', metadata: parsed.metadata, cols: cols }, [dIdx.buffer, tSec.buffer, speed.buffer, dist.buffer, kv.buffer, amps.buffer, ev.buffer]);
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};
