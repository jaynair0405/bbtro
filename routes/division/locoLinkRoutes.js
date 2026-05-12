/**
 * locoLinkRoutes.js — Control Office loco-link endpoints
 * Mounted at /api/division/loco-link
 *
 * Slice 1: Loco lookup widget
 *   - GET  /me
 *   - GET  /loco/:loco_number/details
 *
 * Slice 2: Daily-entry sheet view (terminal trains)
 *   - GET  /loco/:loco_number/autofill      → lightweight type/shed/sick lookup
 *   - GET  /today                           → master rows for date+filter, joined with log
 *   - POST /log                             → upsert daily log row (with sick check + mislink)
 *
 * Future slices:
 *   - POST /sick                            → mark loco sick
 *   - PATCH /sick/:id/fit                   → mark loco fit
 *   - GET  /sick                            → currently-sick list
 *   - GET  /reports/mislinks                → mis-link reports
 */

const express = require('express');
const router = express.Router();

const EDITABLE_DAYS_PAST = 3;       // today + past 3 days editable
const EDITABLE_DAYS_FUTURE = 1;     // today + tomorrow editable

function isTableNotExistError(err) {
    return err && (err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146);
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function diffDays(dateStr) {
    // dateStr "YYYY-MM-DD" → +N for future, -N for past, relative to today (UTC date)
    const a = new Date(dateStr + 'T00:00:00Z').getTime();
    const b = new Date(todayISO() + 'T00:00:00Z').getTime();
    return Math.round((a - b) / 86400000);
}

function isEditable(dateStr) {
    const d = diffDays(dateStr);
    return d >= -EDITABLE_DAYS_PAST && d <= EDITABLE_DAYS_FUTURE;
}

function dayOfWeekIR(dateStr) {
    // 1 = MON, ..., 7 = SUN  (matches the xlsx run_days convention)
    const js = new Date(dateStr + 'T00:00:00Z').getUTCDay();
    return js === 0 ? 7 : js;
}

function runsToday(runDays, dowIR) {
    if (!runDays) return false;
    const s = String(runDays).trim().toUpperCase();
    if (s === 'DAILY') return true;
    return s.replace(/\s+/g, '').split(',').includes(String(dowIR));
}

// ── GET /loco/:loco_number/details ───────────────────────────────────────
// Returns full loco master row + currently-sick status + last 5 log entries.
// Used by the always-visible Loco Lookup widget on Control Office pages.
router.get('/loco/:loco_number/details', async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) {
        return res.status(400).json({ error: 'loco_number required' });
    }
    try {
        const pool = req.app.locals.pool;

        // 1. Master record
        const [locoRows] = await pool.query(
            `SELECT loco_number, loco_type, traction_type, railway_zone,
                    home_shed, status, commission_date,
                    traction_converter, arno_siv, rtis_oem, hrpt_count,
                    microprocessor_type, hotel_load_oem,
                    data_source, entered_by, remarks
             FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (locoRows.length === 0) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const loco = locoRows[0];

        // 2. Currently-sick status (latest open record)
        let sick = null;
        try {
            const [sickRows] = await pool.query(
                `SELECT id, sick_from, sick_at_shed, sick_reason, sicked_by, remarks
                 FROM div_loco_sick_records
                 WHERE loco_number = ? AND fit_from IS NULL
                 ORDER BY sick_from DESC LIMIT 1`,
                [locoNo]
            );
            if (sickRows.length) sick = sickRows[0];
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
            // table missing → leave sick as null
        }

        // 3. Last 5 log entries (front + rear position, merged)
        let recentTrains = [];
        try {
            const [logRows] = await pool.query(
                `(SELECT working_date, train_no, direction, base_shed,
                         is_mislink, expected_shed, 'front' AS position, hog
                  FROM div_loco_link_log
                  WHERE actual_loco_no = ?)
                 UNION ALL
                 (SELECT working_date, train_no, direction, base_shed_rear,
                         is_mislink_rear, expected_shed, 'rear' AS position, hog
                  FROM div_loco_link_log
                  WHERE actual_loco_no_rear = ?)
                 ORDER BY working_date DESC, train_no
                 LIMIT 5`,
                [locoNo, locoNo]
            );
            recentTrains = logRows;
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
        }

        res.json({ loco, sick, recent_trains: recentTrains });
    } catch (err) {
        console.error('[loco-link /loco/:n/details]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// ── GET /me ──────────────────────────────────────────────────────────────
// Returns current LPC session info (used by header + audit trails)
router.get('/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    res.json({
        username: u.username,
        full_name: u.full_name,
        div_role: u.div_role,
        office: u.office,
    });
});

// ── GET /dashboard-stats ─────────────────────────────────────────────────
// Aggregated counters for the Control Office landing page:
//   { date, entries_today, mislinks_today, sick_count, total_locos,
//     segments: [{ sheet_source, total, filled }, ...] }
router.get('/dashboard-stats', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const date = String(req.query.date || todayISO()).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        const dow = dayOfWeekIR(date);

        // Total electric/diesel locos in master
        const [[{ tl }]] = await pool.query('SELECT COUNT(*) AS tl FROM div_locos');

        // Currently sick count (open records)
        let sickCount = 0;
        try {
            const [[r]] = await pool.query(
                'SELECT COUNT(*) AS sc FROM div_loco_sick_records WHERE fit_from IS NULL'
            );
            sickCount = r.sc;
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
        }

        // Today's log totals
        const [[totals]] = await pool.query(
            `SELECT COUNT(*) AS entries,
                    SUM(IF(is_mislink=1 OR is_mislink_rear=1, 1, 0)) AS mislinks
             FROM div_loco_link_log
             WHERE working_date = ? AND actual_loco_no IS NOT NULL`,
            [date]
        );

        // Segment-wise: master rows running today + filled rows today
        const [masters] = await pool.query(
            'SELECT id, sheet_source, run_days FROM div_loco_link_master WHERE active = 1'
        );
        const segmentTotals = {};
        for (const m of masters) {
            if (!m.sheet_source) continue;
            if (runsToday(m.run_days, dow)) {
                segmentTotals[m.sheet_source] = (segmentTotals[m.sheet_source] || 0) + 1;
            }
        }

        const [filledRows] = await pool.query(
            `SELECT m.sheet_source, COUNT(l.id) AS filled
             FROM div_loco_link_log l
             JOIN div_loco_link_master m ON m.id = l.master_id
             WHERE l.working_date = ? AND l.actual_loco_no IS NOT NULL
             GROUP BY m.sheet_source`,
            [date]
        );
        const segmentFilled = {};
        for (const r of filledRows) segmentFilled[r.sheet_source] = r.filled;

        const segments = Object.keys(segmentTotals)
            .sort()
            .map(ss => ({
                sheet_source: ss,
                total: segmentTotals[ss],
                filled: segmentFilled[ss] || 0,
            }));

        res.json({
            date,
            entries_today: totals.entries || 0,
            mislinks_today: totals.mislinks || 0,
            sick_count: sickCount,
            total_locos: tl,
            segments,
        });
    } catch (err) {
        console.error('[loco-link /dashboard-stats]', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// ── GET /loco/:loco_number/autofill ──────────────────────────────────────
// Lightweight version of /details — used while LPC is typing a loco number
// in the daily-entry sheet view. Returns just enough to:
//   - autofill the BASE column (home_shed)
//   - show the loco type as a tooltip
//   - decide HOG warning (hotel_load_oem present or not)
//   - reject the assignment if the loco is currently sick
router.get('/loco/:loco_number/autofill', async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT loco_number, loco_type, traction_type,
                    home_shed, hotel_load_oem, status
             FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const loco = rows[0];

        let sick = null;
        try {
            const [s] = await pool.query(
                `SELECT id, sick_from, sick_at_shed, sick_reason
                 FROM div_loco_sick_records
                 WHERE loco_number = ? AND fit_from IS NULL
                 ORDER BY sick_from DESC LIMIT 1`,
                [locoNo]
            );
            if (s.length) sick = s[0];
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
        }

        res.json({ loco, sick });
    } catch (err) {
        console.error('[loco-link /loco/:n/autofill]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// ── GET /today ───────────────────────────────────────────────────────────
// Returns master rows for the given date + segment, LEFT JOIN-ed with any
// existing log entries for that date. UI renders the sheet view from this.
//
// Query params (preferred):
//   date          YYYY-MM-DD  (default = today)
//   sheet_source  CSMT-DN / CSMT-UP / VVH-DN / VVH-UP / KR-DN / KR-UP
//
// Or legacy / specialized:
//   direction     UP | DN | BYPASS
//   from_station  CSMT / VVH / IGP / ROHA / ...   (required for UP/DN, ignored for BYPASS)
//   route_label   LNL-BSR / BSR-LNL / ...          (optional, narrows BYPASS to one route)
// Old → new sheet name aliases (for backwards-compatible links)
const SHEET_ALIASES = {
    'VVH-DN': 'LTT-DN',
    'VVH-UP': 'LTT-UP',
};
function canonicalSheet(s) {
    return SHEET_ALIASES[s] || s;
}

router.get('/today', async (req, res) => {
    const date = String(req.query.date || todayISO()).trim();
    const sheetSource = canonicalSheet(String(req.query.sheet_source || '').trim());
    const direction = String(req.query.direction || '').trim().toUpperCase();
    const fromStation = String(req.query.from_station || '').trim();
    const routeLabel = String(req.query.route_label || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }
    const isBypass = direction === 'BYPASS' || (sheetSource && sheetSource.startsWith('BYPASS'));
    if (!sheetSource && !isBypass && !(direction && fromStation)) {
        return res.status(400).json({ error: 'sheet_source, direction=BYPASS, or direction + from_station required' });
    }
    if (direction && !['UP', 'DN', 'BYPASS'].includes(direction)) {
        return res.status(400).json({ error: 'direction must be UP, DN or BYPASS' });
    }

    try {
        const pool = req.app.locals.pool;
        const dow = dayOfWeekIR(date);

        // Build WHERE clause — sheet_source preferred; otherwise direction+(from_station|BYPASS)
        let where = 'active = 1';
        const params = [];
        let derivedDirection = direction;
        if (sheetSource) {
            where += ' AND sheet_source = ?';
            params.push(sheetSource);
            // Derive direction from the sheet name if not explicitly given
            if (!derivedDirection) {
                if (sheetSource.endsWith('-DN')) derivedDirection = 'DN';
                else if (sheetSource.endsWith('-UP')) derivedDirection = 'UP';
                else if (sheetSource.startsWith('BYPASS')) derivedDirection = 'BYPASS';
                else derivedDirection = 'DN';
            }
        } else if (direction === 'BYPASS') {
            where += ' AND direction = ?';
            params.push('BYPASS');
            if (routeLabel) {
                where += ' AND route_label = ?';
                params.push(routeLabel);
            }
            derivedDirection = 'BYPASS';
        } else {
            where += ' AND direction = ? AND from_station = ?';
            params.push(direction, fromStation);
        }

        const [masterRows] = await pool.query(
            // ORDER BY id preserves the xlsx row order exactly:
            // NE block first (time-asc within), then SE block, then PNVL/etc trailing block.
            // Pure event_time sort would mix the blocks (e.g. PNVL train 11032 at 0:30
            // would appear before NE/IGP train 12810 at 01:45 — wrong for the LPC's view).
            `SELECT id, sheet_source, sr_no, section, direction, is_bypass,
                    from_station, to_station, route_label,
                    shed_code, link_attr, expected_hog, is_push_pull, traction_type,
                    rake_type, train_no, train_name, event_time, via_stations,
                    run_days, remark
             FROM div_loco_link_master
             WHERE ${where}
             ORDER BY id`,
            params
        );

        const todaysMasters = masterRows.filter(m => runsToday(m.run_days, dow));

        // Existing log rows for this date keyed on master_id (not train_no, since
        // some trains appear in multiple sheets and we want sheet-specific entries)
        const masterIds = todaysMasters.map(m => m.id);
        let logByMasterId = new Map();
        if (masterIds.length) {
            const [logRows] = await pool.query(
                `SELECT id, master_id, working_date, direction, train_no,
                        actual_loco_no, main_loco_dead, failed_in_division,
                        actual_loco_no_rear, secondary_role,
                        base_shed, base_shed_rear,
                        loco_type, loco_type_rear, traction_type,
                        hog, incoming_train, outgoing_train, outgoing_train_rear,
                        expected_shed, is_mislink, is_mislink_rear,
                        remark, remarks_rear, entered_by, updated_at
                 FROM div_loco_link_log
                 WHERE working_date = ? AND master_id IN (?)`,
                [date, masterIds]
            );
            for (const row of logRows) logByMasterId.set(row.master_id, row);
        }

        const merged = todaysMasters.map(m => ({
            ...m,
            log: logByMasterId.get(m.id) || null,
        }));

        const filledCount = merged.filter(r => r.log && r.log.actual_loco_no).length;

        // Special trains — log rows for this sheet+date with no master_id
        let specials = [];
        if (sheetSource) {
            const [rows] = await pool.query(
                `SELECT id, master_id, sheet_source, section, working_date, direction, train_no,
                        actual_loco_no, base_shed, loco_type, traction_type,
                        hog, incoming_train, outgoing_train,
                        expected_shed, is_mislink,
                        remark, entered_by, updated_at
                 FROM div_loco_link_log
                 WHERE working_date = ? AND master_id IS NULL AND sheet_source = ?
                 ORDER BY id`,
                [date, sheetSource]
            );
            specials = rows;
        }

        res.json({
            date,
            sheet_source: sheetSource || null,
            direction: derivedDirection,
            from_station: fromStation || null,
            day_of_week_ir: dow,
            editable: isEditable(date),
            edit_window: { past_days: EDITABLE_DAYS_PAST, future_days: EDITABLE_DAYS_FUTURE },
            total: merged.length,
            filled: filledCount,
            rows: merged,
            specials,
        });
    } catch (err) {
        console.error('[loco-link /today]', err);
        res.status(500).json({ error: 'Failed to load today\'s sheet' });
    }
});

// ── POST /log ────────────────────────────────────────────────────────────
// Upsert a daily log row. Computes is_mislink, snapshots loco fields,
// rejects sick locos.
//
// Body: {
//   working_date, direction, train_no, master_id,
//   actual_loco_no, actual_loco_no_rear?, hog?,
//   incoming_train?, outgoing_train?, remark?
// }
router.post('/log', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const b = req.body || {};

    const working_date = String(b.working_date || '').trim();
    const direction = String(b.direction || '').trim().toUpperCase();
    const train_no = String(b.train_no || '').trim();
    const master_id = b.master_id ? parseInt(b.master_id, 10) : null;
    const actual_loco_no = b.actual_loco_no ? String(b.actual_loco_no).trim() : null;
    const actual_loco_no_rear = b.actual_loco_no_rear ? String(b.actual_loco_no_rear).trim() : null;
    // Flag: main (front) loco was dead during this trip (cannot self-propel)
    const main_loco_dead = b.main_loco_dead ? 1 : 0;
    // failed_in_division: 1 = failed within our div, 0 = failed outside our div
    //                     (UP: before BB, DN: after BB, BYPASS: outside/not attributable),
    //                     NULL when main_loco_dead=0 (not failed). Only meaningful with main_loco_dead=1.
    let failed_in_division = null;
    if (main_loco_dead) {
        if (b.failed_in_division === 1 || b.failed_in_division === '1' || b.failed_in_division === true) failed_in_division = 1;
        else if (b.failed_in_division === 0 || b.failed_in_division === '0' || b.failed_in_division === false) failed_in_division = 0;
        else failed_in_division = null; // unknown — let LPC decide later
    }
    // Role of the rear (second) loco. 'rear' = push-pull (both ends checked for mis-link),
    // others (coupler/assist/dead_in_tow) skip rear-side mis-link.
    const VALID_ROLES = ['rear', 'coupler', 'assist', 'dead_in_tow'];
    let secondary_role = b.secondary_role ? String(b.secondary_role).trim() : null;
    if (secondary_role && !VALID_ROLES.includes(secondary_role)) {
        return res.status(400).json({ error: `invalid secondary_role; expected one of ${VALID_ROLES.join(', ')}` });
    }
    const hog = b.hog === undefined || b.hog === null ? null : (b.hog ? 1 : 0);
    const incoming_train = b.incoming_train ? String(b.incoming_train).trim() : null;
    const outgoing_train = b.outgoing_train ? String(b.outgoing_train).trim() : null;
    // Where the rear/assist/coupler loco goes after this trip (for reassignment to a DN train, etc.)
    const outgoing_train_rear = b.outgoing_train_rear ? String(b.outgoing_train_rear).trim() : null;
    const remark = b.remark ? String(b.remark).trim().slice(0, 255) : null;
    const remarks_rear = b.remarks_rear ? String(b.remarks_rear).trim().slice(0, 500) : null;
    // Special-train fields — only used when master_id is null
    const reqSheetSource = b.sheet_source ? String(b.sheet_source).trim() : null;
    const reqSection = b.section ? String(b.section).trim() : null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(working_date)) {
        return res.status(400).json({ error: 'working_date must be YYYY-MM-DD' });
    }
    if (!['UP', 'DN', 'BYPASS'].includes(direction)) {
        return res.status(400).json({ error: 'invalid direction' });
    }
    if (!train_no) return res.status(400).json({ error: 'train_no required' });
    if (!master_id && !reqSheetSource) {
        return res.status(400).json({ error: 'sheet_source required for special trains (no master_id)' });
    }
    if (!isEditable(working_date)) {
        return res.status(403).json({
            error: 'Date outside editable window',
            editable_window: `today − ${EDITABLE_DAYS_PAST} days to today + ${EDITABLE_DAYS_FUTURE} day`
        });
    }

    try {
        const pool = req.app.locals.pool;

        // Master row — for expected_shed snapshot + push-pull validation
        let master = null;
        if (master_id) {
            const [mRows] = await pool.query(
                `SELECT id, shed_code, expected_hog, is_push_pull, traction_type,
                        sheet_source AS m_sheet_source, section AS m_section
                 FROM div_loco_link_master WHERE id = ? LIMIT 1`,
                [master_id]
            );
            master = mRows[0] || null;
        }
        const expected_shed = master ? master.shed_code : null;
        // Snapshot sheet_source + section from master if linked, else from request
        const sheet_source = master ? master.m_sheet_source : reqSheetSource;
        const section      = master ? master.m_section      : reqSection;

        // Default secondary_role logic:
        //   - if rear loco provided AND master is push-pull AND no role given → 'rear'
        //   - if rear loco provided AND master is NOT push-pull AND no role given → 'assist'
        //   - if rear loco provided AND role given → use given role (any of the 4)
        //   - if no rear loco → role must be null
        if (actual_loco_no_rear && !secondary_role) {
            secondary_role = master && master.is_push_pull ? 'rear' : 'assist';
        }
        if (!actual_loco_no_rear) {
            secondary_role = null;
        }
        // A 'rear' role (push-pull) requires the master to actually be push-pull
        if (secondary_role === 'rear' && master && !master.is_push_pull) {
            return res.status(400).json({ error: "secondary_role='rear' requires push-pull train; use 'assist'/'coupler'/'dead_in_tow' for ad-hoc cases" });
        }

        // Resolve front loco (if provided)
        async function resolve(locoNo) {
            if (!locoNo) return { snapshot: null, sick: null };
            const [rows] = await pool.query(
                'SELECT loco_number, loco_type, traction_type, home_shed FROM div_locos WHERE loco_number = ? LIMIT 1',
                [locoNo]
            );
            const snapshot = rows[0] || null;

            let sick = null;
            try {
                const [s] = await pool.query(
                    `SELECT id, sick_from, sick_reason FROM div_loco_sick_records
                     WHERE loco_number = ? AND fit_from IS NULL ORDER BY sick_from DESC LIMIT 1`,
                    [locoNo]
                );
                sick = s[0] || null;
            } catch (e) {
                if (!isTableNotExistError(e)) throw e;
            }
            return { snapshot, sick };
        }

        const front = await resolve(actual_loco_no);
        // Rear may be a coupler-as-assist verbatim like "24569+24570" — look up FIRST part only.
        // The verbatim string is still stored in actual_loco_no_rear; the snapshot reflects the first loco.
        const rearLookup = (actual_loco_no_rear && actual_loco_no_rear.includes('+'))
            ? actual_loco_no_rear.split('+')[0].trim()
            : actual_loco_no_rear;
        const rear = await resolve(rearLookup);

        if (front.sick) {
            return res.status(409).json({
                error: `Loco ${actual_loco_no} is currently SICK`,
                sick_since: front.sick.sick_from,
                reason: front.sick.sick_reason,
                position: 'front',
            });
        }
        if (rear.sick) {
            return res.status(409).json({
                error: `Loco ${rearLookup} (rear) is currently SICK`,
                sick_since: rear.sick.sick_from,
                reason: rear.sick.sick_reason,
                position: 'rear',
            });
        }

        // Master expects Electric and loco unknown → reject (typo guard)
        if (master && master.traction_type === 'Electric') {
            if (actual_loco_no && !front.snapshot) {
                return res.status(404).json({
                    error: `Loco ${actual_loco_no} not in master — check the number`,
                    position: 'front',
                });
            }
            if (actual_loco_no_rear && !rear.snapshot) {
                return res.status(404).json({
                    error: `Loco ${rearLookup} (rear) not in master — check the number`,
                    position: 'rear',
                });
            }
        }
        // (For Diesel/Other/Unknown: store with NULL snapshots — diesel-add modal in slice 5)

        // ── Conflict check ────────────────────────────────────────────────
        // Same loco can't be on two trains in the SAME direction on the same day.
        // (UP→DN reassignment is fine: a loco can arrive UP and then haul a DN.)
        // We look at the current row's existing id (if any) to exclude it from the check.
        const [existingThis] = await pool.query(
            'SELECT id FROM div_loco_link_log WHERE working_date = ? AND train_no = ? AND direction = ? LIMIT 1',
            [working_date, train_no, direction]
        );
        const excludeId = existingThis.length ? existingThis[0].id : 0;

        async function findConflict(locoNo) {
            if (!locoNo) return null;
            // Match the loco as front, rear (exact), or as either part of an "X+Y" rear value
            const [rows] = await pool.query(
                `SELECT id, train_no, sheet_source, actual_loco_no, actual_loco_no_rear
                 FROM div_loco_link_log
                 WHERE working_date = ? AND direction = ?
                   AND id <> ?
                   AND (
                     actual_loco_no = ?
                     OR actual_loco_no_rear = ?
                     OR actual_loco_no_rear LIKE CONCAT(?, '+%')
                     OR actual_loco_no_rear LIKE CONCAT('%+', ?)
                   )
                 LIMIT 1`,
                [working_date, direction, excludeId, locoNo, locoNo, locoNo, locoNo]
            );
            return rows.length ? rows[0] : null;
        }

        if (actual_loco_no) {
            const c = await findConflict(actual_loco_no);
            if (c) {
                return res.status(409).json({
                    error: `Loco ${actual_loco_no} is already assigned to train ${c.train_no} (${c.sheet_source}) ${direction} on ${working_date}`,
                    position: 'front',
                    conflict: c,
                });
            }
        }
        // Rear may be "X+Y" — check each part
        if (actual_loco_no_rear) {
            const parts = actual_loco_no_rear.split('+').map(s => s.trim()).filter(Boolean);
            for (const part of parts) {
                const c = await findConflict(part);
                if (c) {
                    return res.status(409).json({
                        error: `Loco ${part} (rear) is already assigned to train ${c.train_no} (${c.sheet_source}) ${direction} on ${working_date}`,
                        position: 'rear',
                        conflict: c,
                    });
                }
            }
        }

        const base_shed       = front.snapshot ? front.snapshot.home_shed : null;
        const loco_type       = front.snapshot ? front.snapshot.loco_type : null;
        const traction_type   = front.snapshot ? front.snapshot.traction_type : null;
        const base_shed_rear  = rear.snapshot  ? rear.snapshot.home_shed  : null;
        const loco_type_rear  = rear.snapshot  ? rear.snapshot.loco_type  : null;

        // NULL expected/base shed means "incomplete for analytics", not a mis-link.
        const is_mislink = expected_shed && base_shed && expected_shed !== base_shed ? 1 : 0;
        // Rear-side mis-link only counts for push-pull (role='rear').
        // For coupler / assist / dead_in_tow, rear is informational; never a mis-link.
        const is_mislink_rear = (secondary_role === 'rear')
            && expected_shed && base_shed_rear
            && expected_shed !== base_shed_rear
            ? 1 : 0;

        // UPSERT
        const [result] = await pool.query(
            `INSERT INTO div_loco_link_log
                (working_date, direction, train_no, master_id, sheet_source, section,
                 actual_loco_no, main_loco_dead, failed_in_division,
                 actual_loco_no_rear, secondary_role,
                 base_shed, base_shed_rear,
                 loco_type, loco_type_rear, traction_type,
                 hog, incoming_train, outgoing_train, outgoing_train_rear,
                 expected_shed, is_mislink, is_mislink_rear,
                 remark, remarks_rear, entered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                master_id            = VALUES(master_id),
                sheet_source         = VALUES(sheet_source),
                section              = VALUES(section),
                actual_loco_no       = VALUES(actual_loco_no),
                main_loco_dead       = VALUES(main_loco_dead),
                failed_in_division   = VALUES(failed_in_division),
                actual_loco_no_rear  = VALUES(actual_loco_no_rear),
                secondary_role       = VALUES(secondary_role),
                base_shed            = VALUES(base_shed),
                base_shed_rear       = VALUES(base_shed_rear),
                loco_type            = VALUES(loco_type),
                loco_type_rear       = VALUES(loco_type_rear),
                traction_type        = VALUES(traction_type),
                hog                  = VALUES(hog),
                incoming_train       = VALUES(incoming_train),
                outgoing_train       = VALUES(outgoing_train),
                outgoing_train_rear  = VALUES(outgoing_train_rear),
                expected_shed        = VALUES(expected_shed),
                is_mislink           = VALUES(is_mislink),
                is_mislink_rear      = VALUES(is_mislink_rear),
                remark               = VALUES(remark),
                remarks_rear         = VALUES(remarks_rear),
                entered_by           = VALUES(entered_by)`,
            [working_date, direction, train_no, master_id, sheet_source, section,
             actual_loco_no, main_loco_dead, failed_in_division,
             actual_loco_no_rear, secondary_role,
             base_shed, base_shed_rear,
             loco_type, loco_type_rear, traction_type,
             hog, incoming_train, outgoing_train, outgoing_train_rear,
             expected_shed, is_mislink, is_mislink_rear,
             remark, remarks_rear, u.username]
        );

        // ── Cross-direction propagation ──────────────────────────────────
        // If LPC filled outgoing_train (DN-bound from this loco) → auto-fill
        // the corresponding DN train's log with this same loco.
        // Same for incoming_train → fills the UP train's log.
        // Only propagates when target log has no actual_loco_no yet
        // (won't overwrite an existing assignment).
        const propagated = [];
        async function propagateLoco(targetTrainNo, targetDirection, locoNo, sourceTrainNo) {
            if (!locoNo || !targetTrainNo) return;
            const tn = String(targetTrainNo).trim();
            if (!tn) return;
            // Skip self-references
            if (tn === train_no && targetDirection === direction) return;

            // Find target master row (must be active + run today)
            const [masters] = await pool.query(
                `SELECT id, sheet_source, section, shed_code, expected_hog, run_days
                 FROM div_loco_link_master
                 WHERE train_no = ? AND direction = ? AND active = 1`,
                [tn, targetDirection]
            );
            const dow2 = dayOfWeekIR(working_date);
            const tgtMaster = masters.find(m => runsToday(m.run_days, dow2));
            if (!tgtMaster) {
                propagated.push({ train_no: tn, direction: targetDirection, status: 'no_master_today' });
                return;
            }

            // Check existing log
            const [existing] = await pool.query(
                `SELECT id, actual_loco_no, incoming_train, outgoing_train FROM div_loco_link_log
                 WHERE working_date = ? AND train_no = ? AND direction = ?
                 LIMIT 1`,
                [working_date, tn, targetDirection]
            );
            if (existing.length && existing[0].actual_loco_no && existing[0].actual_loco_no !== locoNo) {
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'conflict_skipped',
                    existing_loco: existing[0].actual_loco_no,
                });
                return;
            }

            // Snapshot from div_locos
            const [locoRows] = await pool.query(
                `SELECT loco_number, loco_type, traction_type, home_shed
                 FROM div_locos WHERE loco_number = ? LIMIT 1`, [locoNo]
            );
            const snap = locoRows[0] || null;
            const tgtBase = snap ? snap.home_shed : null;
            const tgtType = snap ? snap.loco_type : null;
            const tgtTraction = snap ? snap.traction_type : null;
            const tgtExpected = tgtMaster.shed_code;
            const tgtMislink = tgtExpected && tgtBase && tgtExpected !== tgtBase ? 1 : 0;

            // The reverse pointer: target is DN → set its incoming_train to the source UP train;
            //                      target is UP → set its outgoing_train to the source DN train.
            // Only set if currently empty on the target (don't overwrite existing).
            const reverseField = targetDirection === 'DN' ? 'incoming_train' : 'outgoing_train';
            const existingReverse = existing.length ? existing[0][reverseField] : null;
            const newReverse = (sourceTrainNo && !existingReverse) ? sourceTrainNo : existingReverse;

            if (existing.length) {
                // Fill the empty actual_loco_no + reverse pointer
                await pool.query(
                    `UPDATE div_loco_link_log
                     SET actual_loco_no = ?, base_shed = ?, loco_type = ?, traction_type = ?,
                         expected_shed = ?, is_mislink = ?,
                         ${reverseField} = ?
                     WHERE id = ?`,
                    [locoNo, tgtBase, tgtType, tgtTraction, tgtExpected, tgtMislink,
                     newReverse, existing[0].id]
                );
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'updated', id: existing[0].id, loco_no: locoNo,
                    reverse_field: reverseField, reverse_train: newReverse,
                });
            } else {
                // Insert new log row with propagated snapshot + reverse pointer
                const [ins] = await pool.query(
                    `INSERT INTO div_loco_link_log
                        (working_date, direction, train_no, master_id, sheet_source, section,
                         actual_loco_no, base_shed, loco_type, traction_type,
                         expected_shed, is_mislink, ${reverseField}, entered_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [working_date, targetDirection, tn, tgtMaster.id,
                     tgtMaster.sheet_source, tgtMaster.section,
                     locoNo, tgtBase, tgtType, tgtTraction,
                     tgtExpected, tgtMislink, newReverse, u.username]
                );
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'inserted', id: ins.insertId, loco_no: locoNo,
                    reverse_field: reverseField, reverse_train: newReverse,
                });
            }
        }

        // UP/Bypass log with outgoing_train set → propagate to DN train log
        if (outgoing_train && actual_loco_no) {
            await propagateLoco(outgoing_train, 'DN', actual_loco_no, train_no);
        }
        // DN log with incoming_train set → propagate to UP train log
        if (incoming_train && actual_loco_no) {
            await propagateLoco(incoming_train, 'UP', actual_loco_no, train_no);
        }
        // Rear loco can also have an outgoing → DN target
        if (outgoing_train_rear && actual_loco_no_rear) {
            // For coupler-as-assist ("X+Y"), propagate the first part
            const rearLocoForProp = actual_loco_no_rear.includes('+')
                ? actual_loco_no_rear.split('+')[0].trim()
                : actual_loco_no_rear;
            await propagateLoco(outgoing_train_rear, 'DN', rearLocoForProp, train_no);
        }

        // Read back the canonical row for the client
        const [final] = await pool.query(
            `SELECT * FROM div_loco_link_log
             WHERE working_date = ? AND direction = ? AND train_no = ?`,
            [working_date, direction, train_no]
        );

        res.json({
            ok: true,
            inserted: result.affectedRows === 1,
            updated: result.affectedRows === 2,
            log: final[0] || null,
            propagated,
            warnings: {
                hog_mismatch: master && master.expected_hog === 1
                    && front.snapshot && !front.snapshot.hotel_load_oem ? true : false,
            },
        });
    } catch (err) {
        console.error('[loco-link POST /log]', err);
        res.status(500).json({ error: 'Save failed' });
    }
});

// GET /shed-zone-map — { "AQE": "CR", "ANGE": "ECOR", ... }
// Cached by clients; used to render shed codes as "CR/AQE" etc.
router.get('/shed-zone-map', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT home_shed AS shed, MIN(railway_zone) AS zone
             FROM div_locos
             WHERE home_shed IS NOT NULL AND railway_zone IS NOT NULL
             GROUP BY home_shed`
        );
        const map = {};
        for (const r of rows) map[r.shed] = r.zone;
        res.json(map);
    } catch (err) {
        console.error('[loco-link /shed-zone-map]', err);
        res.status(500).json({ error: 'lookup failed' });
    }
});

// ─── REPORTS ─────────────────────────────────────────────────────────────

// GET /reports/mislinks — flat list with optional filters
//   from=YYYY-MM-DD  to=YYYY-MM-DD  sheet=CSMT-DN  shed=AQE  loco=30263  train=22177
router.get('/reports/mislinks', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const today = todayISO();
    const from = String(req.query.from || isoDaysAgo(30)).trim();
    const to = String(req.query.to || today).trim();
    const sheet = String(req.query.sheet || '').trim();
    const shed = String(req.query.shed || '').trim();   // base_shed
    const loco = String(req.query.loco || '').trim();
    const train = String(req.query.train || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return res.status(400).json({ error: 'from/to must be YYYY-MM-DD' });
    }

    try {
        const pool = req.app.locals.pool;
        // Build a UNION query covering both front + rear mis-links.
        // Each branch applies the same filters; we add them dynamically.
        function build(positionLabel, lcol, shedCol, mlCol, typeCol) {
            const conds = [`l.${mlCol} = 1`, 'l.working_date BETWEEN ? AND ?'];
            const params = [from, to];
            if (sheet) { conds.push('l.sheet_source = ?'); params.push(sheet); }
            if (shed)  { conds.push(`l.${shedCol} = ?`); params.push(shed); }
            if (loco)  { conds.push(`l.${lcol} = ?`); params.push(loco); }
            if (train) { conds.push('l.train_no = ?'); params.push(train); }
            return {
                sql: `SELECT l.working_date, l.train_no, l.direction, l.sheet_source, l.section,
                             l.expected_shed, l.${lcol} AS actual_loco_no,
                             l.${shedCol} AS base_shed,
                             l.${typeCol} AS loco_type,
                             '${positionLabel}' AS position,
                             m.expected_loco_type, m.accepted_loco_types,
                             l.entered_by, l.updated_at
                      FROM div_loco_link_log l
                      LEFT JOIN div_loco_link_master m ON m.id = l.master_id
                      WHERE ${conds.join(' AND ')}`,
                params,
            };
        }

        const front = build('front', 'actual_loco_no',      'base_shed',      'is_mislink',      'loco_type');
        const rear  = build('rear',  'actual_loco_no_rear', 'base_shed_rear', 'is_mislink_rear', 'loco_type_rear');
        const sql = `${front.sql} UNION ALL ${rear.sql}
                     ORDER BY working_date DESC, train_no, position
                     LIMIT 500`;
        const [rows] = await pool.query(sql, [...front.params, ...rear.params]);

        res.json({
            from, to, total: rows.length,
            filters: { sheet: sheet || null, shed: shed || null, loco: loco || null, train: train || null },
            rows,
        });
    } catch (err) {
        console.error('[loco-link /reports/mislinks]', err);
        res.status(500).json({ error: 'Report failed' });
    }
});

// GET /reports/by-shed — aggregate mis-links per base_shed (the actual loco's home shed)
//   Useful for "which shed is sending wrong-link locos most often?"
router.get('/reports/by-shed', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const today = todayISO();
    const from = String(req.query.from || isoDaysAgo(30)).trim();
    const to = String(req.query.to || today).trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return res.status(400).json({ error: 'from/to must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        // Combine front + rear positions
        const [rows] = await pool.query(
            `SELECT shed,
                    SUM(total_runs)  AS total_runs,
                    SUM(mislinks)    AS mislinks,
                    ROUND(SUM(mislinks) * 100.0 / NULLIF(SUM(total_runs), 0), 1) AS mislink_pct
             FROM (
                 SELECT base_shed AS shed,
                        COUNT(*) AS total_runs,
                        SUM(is_mislink) AS mislinks
                 FROM div_loco_link_log
                 WHERE working_date BETWEEN ? AND ?
                   AND actual_loco_no IS NOT NULL
                   AND base_shed IS NOT NULL
                   AND expected_shed IS NOT NULL
                 GROUP BY base_shed
               UNION ALL
                 SELECT base_shed_rear AS shed,
                        COUNT(*) AS total_runs,
                        SUM(is_mislink_rear) AS mislinks
                 FROM div_loco_link_log
                 WHERE working_date BETWEEN ? AND ?
                   AND actual_loco_no_rear IS NOT NULL
                   AND base_shed_rear IS NOT NULL
                   AND expected_shed IS NOT NULL
                 GROUP BY base_shed_rear
             ) t
             GROUP BY shed
             ORDER BY mislinks DESC, total_runs DESC`,
            [from, to, from, to]
        );

        const totalMislinks = rows.reduce((s, r) => s + Number(r.mislinks || 0), 0);
        const totalRuns = rows.reduce((s, r) => s + Number(r.total_runs || 0), 0);

        res.json({
            from, to,
            total_runs: totalRuns,
            total_mislinks: totalMislinks,
            sheds: rows,
        });
    } catch (err) {
        console.error('[loco-link /reports/by-shed]', err);
        res.status(500).json({ error: 'Report failed' });
    }
});

// GET /reports/by-expected-shed — aggregate per expected_shed (the link's planned shed)
//   "Which shed's link slots are getting filled by other sheds' locos most?"
router.get('/reports/by-expected-shed', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const today = todayISO();
    const from = String(req.query.from || isoDaysAgo(30)).trim();
    const to = String(req.query.to || today).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return res.status(400).json({ error: 'from/to must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT expected_shed AS shed,
                    COUNT(*) AS total_slots,
                    SUM(IF(is_mislink=1 OR is_mislink_rear=1, 1, 0)) AS mislinks,
                    ROUND(
                      SUM(IF(is_mislink=1 OR is_mislink_rear=1, 1, 0)) * 100.0 /
                      NULLIF(COUNT(*), 0), 1
                    ) AS mislink_pct
             FROM div_loco_link_log
             WHERE working_date BETWEEN ? AND ?
               AND expected_shed IS NOT NULL
               AND actual_loco_no IS NOT NULL
             GROUP BY expected_shed
             ORDER BY mislinks DESC, total_slots DESC`,
            [from, to]
        );
        res.json({ from, to, sheds: rows });
    } catch (err) {
        console.error('[loco-link /reports/by-expected-shed]', err);
        res.status(500).json({ error: 'Report failed' });
    }
});

// GET /reports/train/:train_no/history — recent entries for a train
router.get('/reports/train/:train_no/history', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const trainNo = String(req.params.train_no || '').trim();
    if (!trainNo) return res.status(400).json({ error: 'train_no required' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT working_date, direction, sheet_source, section,
                    actual_loco_no, base_shed, loco_type,
                    actual_loco_no_rear, base_shed_rear,
                    expected_shed, is_mislink, is_mislink_rear,
                    hog, incoming_train, outgoing_train, remark, entered_by
             FROM div_loco_link_log
             WHERE train_no = ?
             ORDER BY working_date DESC, direction
             LIMIT ?`,
            [trainNo, limit]
        );
        res.json({ train_no: trainNo, total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link /reports/train/:n/history]', err);
        res.status(500).json({ error: 'Report failed' });
    }
});

// GET /reports/loco/:loco_no/history — recent entries for a loco (front + rear merged)
router.get('/reports/loco/:loco_no/history', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const locoNo = String(req.params.loco_no || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_no required' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `(SELECT working_date, train_no, direction, sheet_source, section,
                     base_shed, loco_type, expected_shed, is_mislink AS mislink,
                     hog, incoming_train, outgoing_train, 'front' AS position,
                     entered_by, remark
              FROM div_loco_link_log WHERE actual_loco_no = ?)
             UNION ALL
             (SELECT working_date, train_no, direction, sheet_source, section,
                     base_shed_rear AS base_shed, loco_type_rear AS loco_type,
                     expected_shed, is_mislink_rear AS mislink,
                     hog, incoming_train, outgoing_train, 'rear' AS position,
                     entered_by, remark
              FROM div_loco_link_log WHERE actual_loco_no_rear = ?)
             ORDER BY working_date DESC, train_no
             LIMIT ?`,
            [locoNo, locoNo, limit]
        );
        res.json({ loco_no: locoNo, total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link /reports/loco/:n/history]', err);
        res.status(500).json({ error: 'Report failed' });
    }
});

// Helper used by reports
function isoDaysAgo(n) {
    const d = new Date(todayISO() + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
}

// ─── SICK LOCO WORKFLOW ──────────────────────────────────────────────────

// Helper — derives loco category for grouping in UI:
//   COG  = passenger electric (WAP*)
//   GOODS = freight electric (WAG*, WCAG*, WCM*, WCAM* freight, EF*K freight)
//   COG-DSL = passenger diesel (WDP*)
//   GOODS-DSL = freight diesel (WDG*, WDM*)
//   Other / null otherwise
// Categorize a sick loco by WHAT IT WAS DOING, not just by its class.
//   - LPC's manual override wins (params.override)
//   - Else, if the sick_train_no matches a row in div_loco_link_master,
//     it's a passenger/express train → COG (even if loco is a goods-class WAG)
//   - Else fall back to loco class: WAP/WCAM/WDP → COG; WAG/WCAG/WDG/etc → GOODS
//   - Else NULL (ambiguous — LPC should pick manually)
function deriveCategory({ locoType, tractionType, trainIsPassenger, override } = {}) {
    if (override) return override;

    const t = String(locoType || '').toUpperCase();
    const dsl = (tractionType || '').toUpperCase() === 'DIESEL' || /^WD/.test(t);

    // If the loco was working a passenger train (anything in our master is a passenger
    // service — goods trains aren't loaded into div_loco_link_master), it's COG
    // regardless of loco class.
    if (trainIsPassenger) return dsl ? 'COG-DSL' : 'COG';

    // Otherwise classify by the loco's class
    const passenger = /^WAP/.test(t) || /^WDP/.test(t) || /^WCAM/.test(t);
    if (passenger) return dsl ? 'COG-DSL' : 'COG';

    const freight = /^WAG/.test(t) || /^WCAG/.test(t) || /^WCM/.test(t) || /^WDG/.test(t) || /^WDM/.test(t) || /^EF/.test(t);
    if (freight)   return dsl ? 'GOODS-DSL' : 'GOODS';

    return null;  // truly ambiguous — LPC should set override
}

const SICK_TIME_RX = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
function cleanTime(v) {
    if (!v) return null;
    const s = String(v).trim();
    return SICK_TIME_RX.test(s) ? (s.length === 5 ? s + ':00' : s) : null;
}
function cleanDate(v) {
    if (!v) return null;
    const s = String(v).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
function cleanStrSick(v, max) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    return max ? s.slice(0, max) : s;
}

// POST /sick — mark a loco sick (full xlsx-equivalent fields)
//   body: {
//     loco_number*, sick_from?, ineffective_time?, sick_at_shed?, sick_train_no?,
//     current_location?, status?, sick_reason?, sch_done?, paired_with_id?,
//     remarks?
//   }
router.post('/sick', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const b = req.body || {};

    const loco_number = cleanStrSick(b.loco_number);
    const sick_from = cleanDate(b.sick_from) || todayISO();
    const ineffective_time = cleanTime(b.ineffective_time);
    const sick_at_shed = cleanStrSick(b.sick_at_shed, 10);
    const sick_train_no = cleanStrSick(b.sick_train_no, 20);
    const current_location = cleanStrSick(b.current_location, 30);
    const statusRaw = cleanStrSick(b.status);
    const status = ['U/R', 'RDY', 'WKG', 'DEAD', 'H/O'].includes(statusRaw) ? statusRaw : 'U/R';
    const sick_reason = cleanStrSick(b.sick_reason, 255);
    const sch_done = cleanStrSick(b.sch_done, 50);
    const paired_with_id = b.paired_with_id ? parseInt(b.paired_with_id, 10) || null : null;
    const remarks = cleanStrSick(b.remarks, 500);
    // Category override — NULL means "use auto-detect"
    const VALID_CATS = ['COG', 'GOODS', 'COG-DSL', 'GOODS-DSL', 'OTHER'];
    const categoryRaw = cleanStrSick(b.category);
    const category = categoryRaw && VALID_CATS.includes(categoryRaw) ? categoryRaw : null;

    if (!loco_number) return res.status(400).json({ error: 'loco_number required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sick_from)) return res.status(400).json({ error: 'sick_from must be YYYY-MM-DD' });

    try {
        const pool = req.app.locals.pool;
        const [locos] = await pool.query(
            'SELECT loco_number, home_shed FROM div_locos WHERE loco_number = ? LIMIT 1',
            [loco_number]
        );
        if (!locos.length) return res.status(404).json({ error: `Loco ${loco_number} not in master` });

        const [open] = await pool.query(
            `SELECT id, sick_from, sick_reason
             FROM div_loco_sick_records
             WHERE loco_number = ? AND fit_from IS NULL LIMIT 1`,
            [loco_number]
        );
        if (open.length) {
            return res.status(409).json({
                error: `Loco ${loco_number} is already marked sick`,
                sick_since: open[0].sick_from,
                reason: open[0].sick_reason,
                existing_id: open[0].id,
            });
        }

        const finalPlace = sick_at_shed || locos[0].home_shed;
        const [result] = await pool.query(
            `INSERT INTO div_loco_sick_records
                (loco_number, sick_from, ineffective_time, sick_at_shed, sick_train_no,
                 current_location, status, category, sick_reason, sicked_by, sch_done,
                 paired_with_id, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [loco_number, sick_from, ineffective_time, finalPlace, sick_train_no,
             current_location, status, category, sick_reason, u.username, sch_done,
             paired_with_id, remarks]
        );

        const [rows] = await pool.query(
            'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1',
            [result.insertId]
        );
        res.json({ ok: true, sick: rows[0] });
    } catch (err) {
        console.error('[loco-link POST /sick]', err);
        res.status(500).json({ error: 'Mark sick failed' });
    }
});

// PATCH /sick/:id — update an open sick record's mid-flight fields
//   body: any subset of {
//     ineffective_time, sick_at_shed, sick_train_no, current_location, status,
//     shed_arr_date, shed_arr_time, sick_reason, sch_done, hoc_train_no,
//     hoc_date, paired_with_id, remarks
//   }
//   Does NOT close the record (use PATCH /sick/:id/fit for that).
router.patch('/sick/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const b = req.body || {};

    const updates = {};
    if ('ineffective_time'   in b) updates.ineffective_time = cleanTime(b.ineffective_time);
    if ('sick_at_shed'       in b) updates.sick_at_shed     = cleanStrSick(b.sick_at_shed, 10);
    if ('sick_train_no'      in b) updates.sick_train_no    = cleanStrSick(b.sick_train_no, 20);
    if ('current_location'   in b) updates.current_location = cleanStrSick(b.current_location, 30);
    if ('status' in b) {
        const s = cleanStrSick(b.status);
        if (s && !['U/R', 'RDY', 'WKG', 'DEAD', 'H/O'].includes(s)) {
            return res.status(400).json({ error: 'invalid status' });
        }
        updates.status = s;
    }
    if ('category' in b) {
        const c = cleanStrSick(b.category);
        const VALID_CATS = ['COG', 'GOODS', 'COG-DSL', 'GOODS-DSL', 'OTHER'];
        if (c && !VALID_CATS.includes(c)) {
            return res.status(400).json({ error: 'invalid category' });
        }
        updates.category = c;  // NULL/empty = clear override (use auto-detect)
    }
    if ('shed_arr_date' in b) updates.shed_arr_date = cleanDate(b.shed_arr_date);
    if ('shed_arr_time' in b) updates.shed_arr_time = cleanTime(b.shed_arr_time);
    if ('sick_reason'   in b) updates.sick_reason   = cleanStrSick(b.sick_reason, 255);
    if ('sch_done'      in b) updates.sch_done      = cleanStrSick(b.sch_done, 50);
    if ('hoc_train_no'  in b) updates.hoc_train_no  = cleanStrSick(b.hoc_train_no, 20);
    if ('hoc_date'      in b) updates.hoc_date      = cleanDate(b.hoc_date);
    if ('paired_with_id' in b) updates.paired_with_id = b.paired_with_id ? parseInt(b.paired_with_id, 10) || null : null;
    if ('remarks'       in b) updates.remarks       = cleanStrSick(b.remarks, 500);

    if (!Object.keys(updates).length) return res.status(400).json({ error: 'no fields to update' });

    try {
        const pool = req.app.locals.pool;
        const [exists] = await pool.query(
            'SELECT id, fit_from FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        if (!exists.length) return res.status(404).json({ error: 'record not found' });
        if (exists[0].fit_from) return res.status(400).json({ error: 'cannot update a closed (fit) record' });

        const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const params = [...Object.values(updates), id];
        await pool.query(`UPDATE div_loco_sick_records SET ${sets} WHERE id = ?`, params);

        const [updated] = await pool.query(
            'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        res.json({ ok: true, record: updated[0] });
    } catch (err) {
        console.error('[loco-link PATCH /sick/:id]', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// PATCH /sick/:id/fit — close an open sick record (mark loco fit/RDY)
//   body: { fit_from?, ready_time?, fit_remarks? }
router.patch('/sick/:id/fit', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });

    const b = req.body || {};
    const fit_from = cleanDate(b.fit_from) || todayISO();
    const ready_time = cleanTime(b.ready_time);
    const fit_remarks = cleanStrSick(b.fit_remarks, 255);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fit_from)) return res.status(400).json({ error: 'fit_from must be YYYY-MM-DD' });

    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            'SELECT id, fit_from, sick_from FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        if (!rows.length) return res.status(404).json({ error: 'sick record not found' });
        const rec = rows[0];
        if (rec.fit_from) {
            return res.status(400).json({ error: 'Loco already marked fit', fit_from: rec.fit_from });
        }
        const sickFromStr = rec.sick_from instanceof Date
            ? rec.sick_from.toISOString().slice(0, 10)
            : String(rec.sick_from).slice(0, 10);
        if (fit_from < sickFromStr) {
            return res.status(400).json({ error: `fit_from cannot be before sick_from (${sickFromStr})` });
        }

        await pool.query(
            `UPDATE div_loco_sick_records
             SET fit_from = ?, ready_time = ?, fitted_by = ?, fit_remarks = ?, status = 'RDY'
             WHERE id = ?`,
            [fit_from, ready_time, u.username, fit_remarks, id]
        );

        const [updated] = await pool.query(
            'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        res.json({ ok: true, record: updated[0] });
    } catch (err) {
        console.error('[loco-link PATCH /sick/:id/fit]', err);
        res.status(500).json({ error: 'Mark fit failed' });
    }
});

// GET /sick — list currently sick locos with full xlsx fields, grouped category
router.get('/sick', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        // train_is_passenger: if sick_train_no exists in div_loco_link_master, it's a
        // scheduled passenger/express train → loco was on a passenger run regardless of
        // loco class (so WAG hauling 12138 lands under COG).
        const [rows] = await pool.query(
            `SELECT s.*,
                    l.loco_type, l.traction_type, l.home_shed, l.railway_zone,
                    l.traction_converter,
                    EXISTS(SELECT 1 FROM div_loco_link_master m
                           WHERE m.train_no = s.sick_train_no AND m.active = 1) AS train_is_passenger,
                    DATEDIFF(CURDATE(), s.sick_from) AS days_sick
             FROM div_loco_sick_records s
             LEFT JOIN div_locos l ON l.loco_number = s.loco_number
             WHERE s.fit_from IS NULL
             ORDER BY s.sick_from ASC, s.id ASC`
        );
        // Annotate without overwriting the LPC override:
        //   r.category         = the stored override (NULL = auto-detect)
        //   r.derived_category = what auto-detect computed (always populated when possible)
        //   r.category_final   = effective bucket the row belongs to (override || derived)
        for (const r of rows) {
            r.derived_category = deriveCategory({
                locoType: r.loco_type,
                tractionType: r.traction_type,
                trainIsPassenger: !!r.train_is_passenger,
            });
            r.category_final = r.category || r.derived_category;
        }
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /sick]', err);
        res.status(500).json({ error: 'list failed' });
    }
});

// GET /sick/history — all sick episodes (filterable by loco)
router.get('/sick/history', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const loco = String(req.query.loco || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    try {
        const pool = req.app.locals.pool;
        let sql = `SELECT s.*, l.loco_type, l.home_shed, l.railway_zone,
                          IFNULL(DATEDIFF(s.fit_from, s.sick_from),
                                 DATEDIFF(CURDATE(), s.sick_from)) AS days_duration
                   FROM div_loco_sick_records s
                   LEFT JOIN div_locos l ON l.loco_number = s.loco_number`;
        const params = [];
        if (loco) {
            sql += ' WHERE s.loco_number = ?';
            params.push(loco);
        }
        sql += ' ORDER BY s.sick_from DESC, s.id DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /sick/history]', err);
        res.status(500).json({ error: 'history failed' });
    }
});

// ── DELETE /log/:id ──────────────────────────────────────────────────────
// Removes a SPECIAL log row (master_id IS NULL). Master-linked rows can never
// be deleted via this endpoint — use UPSERT to clear fields instead.
router.delete('/log/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            'SELECT id, master_id, working_date, sheet_source, train_no FROM div_loco_link_log WHERE id = ? LIMIT 1',
            [id]
        );
        if (!rows.length) return res.status(404).json({ error: 'not found' });
        const row = rows[0];
        if (row.master_id !== null) {
            return res.status(403).json({ error: 'cannot delete master-linked log row (clear fields instead)' });
        }
        if (!isEditable(row.working_date.toISOString().slice(0, 10))) {
            return res.status(403).json({ error: 'date outside editable window' });
        }
        await pool.query('DELETE FROM div_loco_link_log WHERE id = ? LIMIT 1', [id]);
        res.json({ ok: true, deleted: id });
    } catch (err) {
        console.error('[loco-link DELETE /log/:id]', err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
