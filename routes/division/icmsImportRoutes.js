/**
 * ICMS Report 501 import — fill the DN sheet from the LPC's own ICMS export.
 *
 * WHY
 *   LPCs key every DN loco into ICMS already. Keying it a second time into the
 *   daily sheet was duplicate work they skipped, so DN sheets sat empty — and
 *   because a loco's POSITION only moves when the sheet is written, the locos
 *   piled up at the terminals. This reads their ICMS export instead, so the
 *   sheet fills itself and positions move as a side effect.
 *
 * SHAPE
 *   POST /preview  — parse + classify, write NOTHING, return what would happen.
 *   POST /apply    — write the rows the LPC confirmed.
 *   GET  /pending  — the two derived follow-up lists (see below).
 *
 * WHY THERE IS NO STAGING TABLE
 *   Both follow-ups are already recorded by the sheet itself:
 *     · a train still needing a loco  = a DN log row with a blank actual_loco_no
 *     · a loco needing registration   = an actual_loco_no with no div_locos row
 *   A staging table would be a second copy needing sync on every hand edit —
 *   the same mistake waiting_details and motormen were converted away from.
 *   Derived lists also self-heal: fill the loco, or register it, and the entry
 *   leaves the list on its own.
 *
 * RULES THE LPC SET
 *   · An existing entry always wins. The import never overwrites a person.
 *   · MEMU and Vande Bharat are trainsets — no loco, ever. Excluded, not flagged.
 *   · A loco we do not know is still WRITTEN, then reported. Skipping it would
 *     record "no loco" for a train that ran, and would leave that loco's
 *     position stale — the exact pile-up this is meant to fix. Every join to
 *     div_locos in this app is a LEFT JOIN, so an unknown loco renders fine
 *     (28 such locos have been on the sheets since May without incident).
 */

'use strict';

const express = require('express');
const multer = require('multer');
const { parseReport501 } = require('../../lib/icms/parseReport501');

const router = express.Router();

// Held in memory: the file is ~260 KB, read once and discarded. Nothing to
// clean up on disk, and nothing left lying around with operational data in it.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/\.xlsx$/i.test(file.originalname)) return cb(null, true);
        cb(new Error('Upload the .xlsx ICMS export (the *_raw* one).'));
    },
});

const WRITER_ROLES = ['lpc', 'ctlc', 'division_admin'];
function requireWriter(req, res, next) {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'not logged in' });
    if (u.realm !== 'division' || !WRITER_ROLES.includes(u.div_role)) {
        return res.status(403).json({ error: 'requires lpc, ctlc or division_admin' });
    }
    next();
}

// LPCs type CANCELLED / CANCEL / CD into the loco field to mean the train did
// not run, because the sheet has no cancelled marker. Those are not locos and
// must never reach the "register this loco" list.
const LOCO_NUMBER = /^\d{4,6}$/;

/** Outcome buckets, in the order the preview screen shows them. */
const OUTCOME = {
    FILL:        'fill',          // blank on the sheet, ICMS has a loco -> write
    ALREADY:     'already',       // sheet already filled -> left alone (person wins)
    NO_LOCO:     'no_loco',       // matched a working, ICMS has no loco yet
    NO_WORKING:  'no_working',    // not a DN working we keep a sheet for
    NOT_TODAY:   'not_today',     // the working exists but run_days says not this day
    TRAINSET:    'trainset',      // MEMU / Vande Bharat — no loco, ever
};

/**
 * Match parsed ICMS rows to the DN workings for a date and decide each outcome.
 * Pure apart from the two queries, so /preview and /apply cannot disagree.
 */
async function classifyAll(pool, rows, direction = 'DN') {
    // A multi-day export holds one block of rows per day. Each row must be
    // matched against ITS OWN day's workings — the run_days set differs by
    // weekday, and the sheet is per date. Classifying a 3-day file against one
    // date would write three days of locos onto a single sheet.
    const byDate = new Map();
    for (const r of rows) {
        const d = r.working_date;
        if (!d) continue;
        if (!byDate.has(d)) byDate.set(d, []);
        byDate.get(d).push(r);
    }
    const out = [];
    for (const [d, subset] of [...byDate.entries()].sort()) {
        const classified = await classify(pool, subset, d, direction);
        for (const c of classified) out.push({ ...c, working_date: d, direction });
    }
    return out;
}

async function classify(pool, rows, workingDate, direction = 'DN') {
    const { runsToday, dayOfWeekIR } = require('./locoLinkRoutes');
    const dow = dayOfWeekIR(workingDate);

    // Active workings for that date, in the report's OWN direction: an
    // Originating report fills DN sheets, a Terminating one fills UP.
    //
    // The sheet filters on BOTH the effective window and run_days (see the
    // /today handler); this must apply the same two rules or it would write a
    // row for a working the sheet does not display — invisible and uneditable.
    //
    // A train ICMS says ran, whose working says it does not run that weekday, is
    // reported as NOT_TODAY rather than written. That is a real discrepancy: the
    // run_days reconciliation is a known open item, so the import surfaces it
    // instead of quietly papering over it.
    const [masters] = await pool.query(
        `SELECT m.id AS master_id, m.train_no, m.sheet_source, m.section,
                m.from_station, m.to_station, m.event_time, m.run_days,
                m.expected_loco_type, m.shed_code AS expected_shed, m.is_push_pull
           FROM div_loco_link_master m
          WHERE m.active = 1 AND m.direction = ? AND m.is_bypass = 0
            AND (m.effective_from IS NULL OR m.effective_from <= ?)
            AND (m.effective_until IS NULL OR m.effective_until >= ?)`,
        [direction, workingDate, workingDate]
    );
    const byTrain = new Map();
    for (const m of masters) {
        if (!byTrain.has(m.train_no)) byTrain.set(m.train_no, []);
        byTrain.get(m.train_no).push(m);
    }

    // What the sheet already holds for that date.
    const [logs] = await pool.query(
        `SELECT master_id, train_no, actual_loco_no, actual_loco_no_rear
           FROM div_loco_link_log
          WHERE working_date = ? AND direction = ?`,
        [workingDate, direction]
    );
    const logByMaster = new Map(logs.filter(l => l.master_id).map(l => [l.master_id, l]));

    // Resolve the class from OUR master where we know the loco; the file's class
    // is advisory (it says WAG9HC where div_locos says WAG9H).
    const numbers = [...new Set(rows.flatMap(r => r.locos.map(l => l.number)))];
    const known = new Map();
    if (numbers.length) {
        const [dl] = await pool.query(
            'SELECT loco_number, loco_type, home_shed, railway_zone, hotel_load_oem FROM div_locos WHERE loco_number IN (?)',
            [numbers]
        );
        for (const d of dl) known.set(String(d.loco_number), d);
    }

    const out = [];
    for (const r of rows) {
        const base = {
            train_no: r.train_no,
            train_type: r.train_type,
            src: r.src,
            dstn: r.dstn,
            std: r.std,
            atd: r.atd,
            departed: r.departed,
            departed_next_day: r.departed_next_day,
            actual_date: r.actual_date,
            row_number: r.row_number,
            // Carried on EVERY outcome, not just matched ones: a train with a
            // loco in ICMS and no working of ours is a special nobody
            // registered, and the UI needs the loco to say so.
            loco_changed_enroute: Boolean(r.loco_changed_enroute),
            locos_departed: (r.locos_departed || []).map((l) => l.number),
            locos_in_file: r.locos.length,
            loco_in_file: r.loco_front ? r.loco_front.number : null,
            loco_type_in_file: r.loco_front ? r.loco_front.type : null,
        };

        if (r.is_trainset) { out.push({ ...base, outcome: OUTCOME.TRAINSET }); continue; }

        const all = byTrain.get(r.train_no) || [];
        if (!all.length) { out.push({ ...base, outcome: OUTCOME.NO_WORKING }); continue; }

        const candidates = all.filter(m => runsToday(m.run_days, dow));
        if (!candidates.length) {
            out.push({ ...base, outcome: OUTCOME.NOT_TODAY,
                       sheet_source: all[0].sheet_source,
                       run_days: all[0].run_days,
                       note: `ICMS reports this ran, but its working is set to run ${all[0].run_days || '(none)'} — check the run days.` });
            continue;
        }

        // More than one DN working for a train would make the target ambiguous.
        // None exist today; report rather than guess if that ever changes.
        if (candidates.length > 1) {
            out.push({ ...base, outcome: OUTCOME.NO_WORKING,
                       note: `${candidates.length} DN workings match this train — cannot tell which; enter it by hand.` });
            continue;
        }
        const m = candidates[0];
        const decorate = (loco) => {
            if (!loco) return null;
            const k = known.get(loco.number);
            return {
                number: loco.number,
                // Our master wins; the file fills in only where we do not know it.
                type: k ? (k.loco_type || null) : (loco.type || null),
                type_source: k ? 'master' : (loco.type ? 'icms' : null),
                in_master: Boolean(k),
                home_shed: k ? k.home_shed : null,
            };
        };
        const front = decorate(r.loco_front);
        const rear = decorate(r.loco_rear);
        const existing = logByMaster.get(m.master_id);
        const working = {
            master_id: m.master_id, sheet_source: m.sheet_source, section: m.section,
            event_time: m.event_time, is_push_pull: !!m.is_push_pull,
        };

        if (!front) { out.push({ ...base, ...working, outcome: OUTCOME.NO_LOCO }); continue; }

        if (existing && existing.actual_loco_no) {
            out.push({ ...base, ...working, outcome: OUTCOME.ALREADY,
                       existing_loco: existing.actual_loco_no, front, rear,
                       // Shown so the LPC can see a disagreement; not acted on.
                       differs: String(existing.actual_loco_no) !== String(front.number) });
            continue;
        }
        out.push({ ...base, ...working, outcome: OUTCOME.FILL, front, rear });
    }
    return out;
}

function summarise(classified) {
    const c = (o) => classified.filter(r => r.outcome === o);
    const fill = c(OUTCOME.FILL);
    const unknown = new Map();
    for (const r of fill) {
        for (const l of [r.front, r.rear]) {
            if (l && !l.in_master && LOCO_NUMBER.test(l.number)) {
                unknown.set(l.number, { loco_number: l.number, type_from_icms: l.type,
                                        seen_on: r.train_no });
            }
        }
    }
    const dates = [...new Set(classified.map(r => r.working_date).filter(Boolean))].sort();
    const per_date = dates.map(d => {
        const rs = classified.filter(r => r.working_date === d);
        const n = (o) => rs.filter(r => r.outcome === o).length;
        return { date: d, total: rs.length, fill: n(OUTCOME.FILL), already: n(OUTCOME.ALREADY),
                 no_loco: n(OUTCOME.NO_LOCO), not_today: n(OUTCOME.NOT_TODAY),
                 no_working: n(OUTCOME.NO_WORKING), trainsets: n(OUTCOME.TRAINSET) };
    });
    return {
        dates,
        per_date,
        total: classified.length,
        fill: fill.length,
        already: c(OUTCOME.ALREADY).length,
        already_differing: c(OUTCOME.ALREADY).filter(r => r.differs).length,
        no_loco: c(OUTCOME.NO_LOCO).length,
        no_working: c(OUTCOME.NO_WORKING).length,
        not_today: c(OUTCOME.NOT_TODAY).length,
        changed_enroute: classified.filter(r => r.loco_changed_enroute
                                             && r.outcome === OUTCOME.FILL).length,
        trainsets: c(OUTCOME.TRAINSET).length,
        unknown_locos: [...unknown.values()],
    };
}

// ── POST /preview ───────────────────────────────────────────────────────────
// Parses and classifies. Writes nothing.
router.post('/preview', requireWriter, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    let parsed;
    try {
        parsed = parseReport501(req.file.buffer);
    } catch (e) {
        // Parser messages are written for the LPC (which file to download, or
        // that the layout changed) — pass them through verbatim.
        return res.status(400).json({ error: e.message });
    }

    // Every row carries its own date (from its scheduled departure), so a
    // one-day and a three-day export take the same path. An explicit
    // working_date narrows to one day of a multi-day file.
    const only = String(req.body.working_date || '').trim();
    let rowsIn = parsed.rows;
    if (/^\d{4}-\d{2}-\d{2}$/.test(only)) {
        rowsIn = rowsIn.filter(r => r.working_date === only);
        if (!rowsIn.length) {
            return res.status(400).json({ error: `This file has no rows for ${only}. It covers ${parsed.dates.join(', ')}.` });
        }
    }
    if (!parsed.dates.length) {
        return res.status(400).json({ error: 'Could not read any date from the file.' });
    }

    try {
        const pool = req.app.locals.pool;
        const rows = await classifyAll(pool, rowsIn, parsed.direction || 'DN');
        res.json({
            ok: true,
            scope: parsed.scope,
            direction: parsed.direction || 'DN',
            dates: [...new Set(rowsIn.map(r => r.working_date))].sort(),
            report_date: parsed.reportDate,
            report_date_to: parsed.reportDateTo,
            mode: parsed.mode,
            file_name: req.file.originalname,
            warnings: parsed.warnings,
            counts: parsed.counts,
            summary: summarise(rows),
            rows,
        });
    } catch (err) {
        console.error('[icms POST /preview]', err);
        res.status(500).json({ error: 'Failed to read the report against the sheet.' });
    }
});

/**
 * Run one sheet write through the sheet's OWN handler.
 *
 * The import must not reimplement POST /log: that handler also writes the
 * div_locos schedule, propagates the loco to the paired working, and — the
 * reason this feature exists at all — moves the loco's POSITION. A second
 * implementation would drift from it silently.
 *
 * So we call the real handler with a synthesised req/res. The require is done
 * here rather than at module load because locoLinkRoutes mounts this router,
 * so the two modules require each other; by request time both are resolved.
 */
function writeThroughSheet(req, body) {
    const { handleLogWrite } = require('./locoLinkRoutes');
    const innerReq = {
        body,
        session: req.session,
        app: req.app,
    };
    return new Promise((resolve) => {
        let code = 200;
        const innerRes = {
            status(c) { code = c; return this; },
            json(payload) { resolve({ status: code, body: payload }); },
        };
        Promise.resolve(handleLogWrite(innerReq, innerRes)).catch((err) => {
            resolve({ status: 500, body: { error: err && err.message ? err.message : 'write failed' } });
        });
    });
}

// ── POST /apply ─────────────────────────────────────────────────────────────
// Writes the rows the LPC confirmed. Re-parses the file rather than trusting a
// posted row list, so what is written is always what the file says — a client
// cannot hand us an edited payload, and a re-upload is naturally idempotent.
router.post('/apply', requireWriter, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    let parsed;
    try {
        parsed = parseReport501(req.file.buffer);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }

    // Optionally narrow to one day of a multi-day file.
    const onlyDate = String(req.body.working_date || '').trim();
    let rowsIn = parsed.rows;
    if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
        rowsIn = rowsIn.filter(r => r.working_date === onlyDate);
        if (!rowsIn.length) {
            return res.status(400).json({ error: `This file has no rows for ${onlyDate}. It covers ${parsed.dates.join(', ')}.` });
        }
    }

    // Optional: only these trains. Absent means "everything the preview offered".
    const only = Array.isArray(req.body.train_nos) ? new Set(req.body.train_nos.map(String))
               : (typeof req.body.train_nos === 'string' && req.body.train_nos.trim())
                 ? new Set(req.body.train_nos.split(',').map(s => s.trim())) : null;

    try {
        const pool = req.app.locals.pool;
        const classified = await classifyAll(pool, rowsIn, parsed.direction || 'DN');
        const toWrite = classified.filter(r => r.outcome === OUTCOME.FILL
                                            && (!only || only.has(r.train_no)));

        const written = [], failed = [];
        for (const r of toWrite) {
            // Second loco: 'rear' only where the working really is push-pull —
            // the API rejects 'rear' on an ordinary train. Anything else is an
            // assisting loco, which is what the board defaults to as well.
            const body = {
                working_date: r.working_date,
                direction: r.direction || 'DN',
                train_no: r.train_no,
                master_id: r.master_id,
                actual_loco_no: r.front.number,
                // The row stays on its SCHEDULED day (see the parser); the
                // remark is how the late running stays visible on that sheet.
                remark: r.departed_next_day
                    ? `ICMS import — departed ${r.atd} (next day)`.slice(0, 255)
                    : 'ICMS import',
            };
            if (r.rear) {
                body.actual_loco_no_rear = r.rear.number;
                body.secondary_role = r.is_push_pull ? 'rear' : 'assist';
            }
            const out = await writeThroughSheet(req, body);
            if (out.status >= 200 && out.status < 300) {
                written.push({ working_date: r.working_date, train_no: r.train_no,
                               loco: r.front.number, rear: r.rear ? r.rear.number : null });
            } else {
                // The sheet's own typo guard refuses an unknown loco on a
                // working that expects Electric traction — an unrecognised
                // electric number is almost always a mistyped one. Diesel
                // workings accept it (that is how the 40xxx WDP4Ds get through).
                // Not an import bug: the loco must be registered first.
                const msg = (out.body && out.body.error) || `HTTP ${out.status}`;
                failed.push({ train_no: r.train_no, loco: r.front.number,
                              needs_registering: /not in master/i.test(msg),
                              error: msg });
            }
        }

        // Recompute AFTER writing, so the follow-up lists reflect reality rather
        // than the pre-write preview.
        const after = await classifyAll(pool, rowsIn, parsed.direction || 'DN');

        // Locos that are now ON the sheet but still absent from the master.
        // summarise() only looks at rows still awaiting a write, so once a row
        // is written its loco drops out of that list — these would otherwise
        // vanish silently, which is exactly what must be reported.
        const needRegistering = new Map();
        for (const w of written) {
            for (const n of [w.loco, w.rear]) {
                if (!n || !LOCO_NUMBER.test(n)) continue;
                const row = after.find(r => r.train_no === w.train_no && r.working_date === w.working_date);
                const l = row && [row.front, row.rear].find(x => x && x.number === n);
                if (l && !l.in_master) needRegistering.set(n, { loco_number: n, type_from_icms: l.type });
            }
        }
        for (const f of failed) {
            if (f.needs_registering) needRegistering.set(f.loco, { loco_number: f.loco, type_from_icms: null, blocked_write: true });
        }
        res.json({
            ok: true,
            scope: parsed.scope,
            direction: parsed.direction || 'DN',
            dates: [...new Set(rowsIn.map(r => r.working_date))].sort(),
            written: written.length,
            failed: failed.length,
            details: { written, failed },
            summary: summarise(after),
            locos_to_register: [...needRegistering.values()],
            still_without_loco: after.filter(r => r.outcome === OUTCOME.NO_LOCO)
                                     .map(r => ({ working_date: r.working_date, train_no: r.train_no,
                                                  sheet_source: r.sheet_source,
                                                  event_time: r.event_time, departed: r.departed })),
        });
    } catch (err) {
        console.error('[icms POST /apply]', err);
        res.status(500).json({ error: 'Failed to apply the import.' });
    }
});

// ── GET /pending ────────────────────────────────────────────────────────────
// The two follow-up lists, DERIVED from the sheet — no staging table to sync.
//
//   trains_without_loco : a DN working that RUNS on the date and has either no
//       log row at all or a row with a blank loco. Querying only for blank rows
//       would miss the common case entirely — a working the LPC never touched
//       has no row, not an empty one (4 of 4 on the 15-Sep file).
//   unknown_locos       : a loco on a sheet with no div_locos row. Filtered to
//       things shaped like loco numbers: LPCs type CANCELLED / CANCEL / CD into
//       that field to mean the train did not run, and those are not locos.
//
// Dates are formatted with toDateISO before they reach JSON — mysql2 returns a
// DATE as a JS Date at local midnight, which serialises a day early in IST.
router.get('/pending', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { toDateISO, runsToday, dayOfWeekIR } = require('./locoLinkRoutes');
    const date = String(req.query.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });
    }
    try {
        const pool = req.app.locals.pool;

        // Workings that run that date, with whatever the sheet holds for them.
        const [rows] = await pool.query(
            `SELECT m.id AS master_id, m.train_no, m.sheet_source, m.section,
                    m.event_time, m.run_days,
                    l.id AS log_id, l.actual_loco_no
               FROM div_loco_link_master m
               LEFT JOIN div_loco_link_log l
                      ON l.master_id = m.id AND l.working_date = ?
              WHERE m.active = 1 AND m.direction = 'DN' AND m.is_bypass = 0
                AND (m.effective_from  IS NULL OR m.effective_from  <= ?)
                AND (m.effective_until IS NULL OR m.effective_until >= ?)
              ORDER BY m.event_time, m.train_no`,
            [date, date, date]
        );
        const dow = dayOfWeekIR(date);
        const blanks = rows
            .filter(r => runsToday(r.run_days, dow))
            .filter(r => !r.actual_loco_no)
            .map(r => ({
                train_no: r.train_no, sheet_source: r.sheet_source,
                section: r.section, event_time: r.event_time,
                has_row: Boolean(r.log_id),
            }));

        const [unknown] = await pool.query(
            `SELECT l.actual_loco_no AS loco_number,
                    MAX(l.loco_type)    AS loco_type_seen,
                    MIN(l.working_date) AS first_seen,
                    MAX(l.working_date) AS last_seen,
                    COUNT(*)            AS appearances
               FROM div_loco_link_log l
               LEFT JOIN div_locos dl ON dl.loco_number = l.actual_loco_no
              WHERE l.actual_loco_no IS NOT NULL AND l.actual_loco_no <> ''
                AND dl.loco_number IS NULL
                AND l.actual_loco_no REGEXP '^[0-9]{4,6}$'
              GROUP BY l.actual_loco_no
              ORDER BY appearances DESC`
        );
        const unknownOut = unknown.map(u => ({
            ...u,
            first_seen: toDateISO(u.first_seen),
            last_seen: toDateISO(u.last_seen),
        }));

        res.json({
            ok: true,
            date,
            trains_without_loco: blanks,
            unknown_locos: unknownOut,
            counts: {
                trains_without_loco: blanks.length,
                unknown_locos: unknownOut.length,
                seen_on_date: unknownOut.filter(u => u.last_seen === date).length,
            },
        });
    } catch (err) {
        console.error('[icms GET /pending]', err);
        res.status(500).json({ error: 'Failed to read the follow-up lists.' });
    }
});

// ── GET /gaps ───────────────────────────────────────────────────────────────
// Which recent days are short of locos. The per-sheet banner only warns someone
// who OPENS that sheet; a day nobody opens goes unnoticed, and the August data
// showed the gap is concentrated in a few collapse days (5 days held 54% of the
// month's blanks) rather than spread thinly. This is what catches those.
router.get('/gaps', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { toDateISO, runsToday, dayOfWeekIR } = require('./locoLinkRoutes');
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 60);
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT m.id AS master_id, m.run_days, l.working_date AS log_date,
                    d.dt, l.actual_loco_no
               FROM (SELECT CURDATE() - INTERVAL seq.n DAY AS dt
                       FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
                             UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
                             UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
                             UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
                             UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                             UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
                             UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27
                             UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31
                             UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
                             UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39
                             UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43
                             UNION SELECT 44 UNION SELECT 45 UNION SELECT 46 UNION SELECT 47
                             UNION SELECT 48 UNION SELECT 49 UNION SELECT 50 UNION SELECT 51
                             UNION SELECT 52 UNION SELECT 53 UNION SELECT 54 UNION SELECT 55
                             UNION SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59) seq
                      WHERE seq.n < ?) d
               JOIN div_loco_link_master m
                 ON m.active = 1 AND m.direction = 'DN' AND m.is_bypass = 0
                AND (m.effective_from  IS NULL OR m.effective_from  <= d.dt)
                AND (m.effective_until IS NULL OR m.effective_until >= d.dt)
               LEFT JOIN div_loco_link_log l
                 ON l.master_id = m.id AND l.working_date = d.dt`,
            [days]
        );
        const per = new Map();
        for (const r of rows) {
            const dt = toDateISO(r.dt);
            if (!runsToday(r.run_days, dayOfWeekIR(dt))) continue;   // same rule as the sheet
            if (!per.has(dt)) per.set(dt, { date: dt, due: 0, filled: 0 });
            const e = per.get(dt);
            e.due++;
            if (r.actual_loco_no) e.filled++;
        }
        const today = toDateISO(new Date());
        const out = [...per.values()]
            .map(e => ({ ...e, blank: e.due - e.filled,
                         pct: e.due ? Math.round(100 * e.filled / e.due) : 100 }))
            // Today is still in progress — reporting it as a gap is just noise.
            .filter(e => e.date !== today)
            .sort((a, b) => b.date.localeCompare(a.date));
        res.json({
            ok: true, days,
            gaps: out.filter(e => e.pct < 80),   // a normal day sits above 90%
            all: out,
        });
    } catch (err) {
        console.error('[icms GET /gaps]', err);
        res.status(500).json({ error: 'Failed to read recent fill rates.' });
    }
});

module.exports = { router, classify, classifyAll, summarise, OUTCOME, LOCO_NUMBER };
