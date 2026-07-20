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

// View-only div_roles may read (GET/HEAD) any loco-link resource but may never
// mutate one. A single guard here backstops every write endpoint below, including
// the ones that only check "logged in" — so a view-only account is read-only no
// matter which route it hits.
const VIEW_ONLY_DIV_ROLES = ['ctlc_view'];
router.use((req, res, next) => {
    const u = req.session && req.session.user;
    if (u && VIEW_ONLY_DIV_ROLES.includes(u.div_role) &&
        !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return res.status(403).json({ error: 'view-only access; modifications are not permitted' });
    }
    next();
});

const EDITABLE_DAYS_PAST = 3;       // today + past 3 days editable
const EDITABLE_DAYS_FUTURE = 1;     // today + tomorrow editable

// Mumbai Division terminals where locos can be stabled
const MUMBAI_TERMINALS = ['CSMT', 'LTT', 'DR', 'PNVL', 'VVH', 'KYN', 'TNA'];

// Valid location values for div_loco_positions
const VALID_LOCATIONS = [...MUMBAI_TERMINALS, 'IN_TRANSIT', 'OUT_OF_DIV'];

// Where a loco actually stands after working into a terminal. Dadar terminates
// nine train pairs (11004/11022/17317/22148/12132…) but has no stabling shed —
// those locos stand at Vasai and work out from there. Applied to arrivals and,
// for the same reason, to DR-originating DN workings on the assignment board,
// so they draw from the shed that really holds their locos.
const STABLING_TERMINAL = { DR: 'VVH' };
const stablingTerminal = (t) => STABLING_TERMINAL[t] || t;

// Loco maintenance-schedule types (LPC-entered on the daily sheet).
// IA/IB/IC = inspection schedules; IOH/TOH/POH = overhaul schedules.
// Must match the ENUM on div_locos.schedule_type.
const SCHEDULE_TYPES = ['IA', 'IB', 'IC', 'IOH', 'TOH', 'POH'];

// A loco standing at a terminal is "booked out" if it already appears on a DN
// link row dated on/after the day it reached that terminal.
//
// Two things this deliberately does NOT do:
//   - It does not pin to CURDATE(). Links are entered ahead of the departure —
//     often on the arrival day, sometimes for tomorrow's train — so a
//     working_date = today filter misses most live bookings. There is no lower
//     bound either: the arrival date is the anchor, and a loco that genuinely
//     left and came back gets a fresh arrived_at, which ages out its old
//     bookings on its own.
//   - It does not consult div_loco_positions.current_location. That column is
//     written by an unordered event stream (see updateLocoPosition) and can say
//     a loco is stabled when it has long since worked out; booking state is the
//     reliable signal.
// Matches front and rear locos, including "X+Y" couplers, which are stored
// whole in actual_loco_no_rear but tracked by their first part elsewhere.
// Expects the outer query to expose div_loco_positions as `lp`.
const BOOKED_OUT_EXISTS = `
    SELECT 1 FROM div_loco_link_log ll
    WHERE ll.direction = 'DN'
      AND ll.working_date >= COALESCE(DATE(lp.arrived_at), CURDATE())
      AND (ll.actual_loco_no = lp.loco_number
           OR FIND_IN_SET(lp.loco_number,
                          REPLACE(REPLACE(ll.actual_loco_no_rear, ' ', ''), '+', ',')) > 0)`;

/**
 * Normalize a location string to a standard terminal code.
 * Examples: "VVH TS" → "VVH", "csmt" → "CSMT", "LTT ELS" → "LTT"
 * Returns null if not recognized as a Mumbai terminal.
 */
function normalizeTerminal(locationStr) {
    if (!locationStr) return null;
    const upper = String(locationStr).toUpperCase().trim();

    // Direct match
    if (MUMBAI_TERMINALS.includes(upper)) return upper;

    // Check if it starts with a known terminal
    for (const t of MUMBAI_TERMINALS) {
        if (upper.startsWith(t + ' ') || upper.startsWith(t + '-')) {
            return t;
        }
    }

    // Common aliases
    const aliases = {
        'DADAR': 'DR',
        'PANVEL': 'PNVL',
        'KALYAN': 'KYN',
        'THANE': 'TNA',
        'VASHI': 'VVH',
    };
    for (const [alias, terminal] of Object.entries(aliases)) {
        if (upper.startsWith(alias)) return terminal;
    }

    return null;
}

function isTableNotExistError(err) {
    return err && (err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146);
}

// Roles permitted to manage Settings (scheduled specials, trains, sheds, etc.)
const SETTINGS_ROLES = ['division_admin', 'ctlc'];

/**
 * Middleware: only allow division-realm users with division_admin or ctlc div_role
 * to perform Settings mutations. Sends 401/403 directly.
 */
function requireSettingsRole(req, res, next) {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'not logged in' });
    if (u.realm !== 'division' || !SETTINGS_ROLES.includes(u.div_role)) {
        return res.status(403).json({
            error: 'insufficient privileges; requires division_admin or ctlc',
        });
    }
    next();
}

/**
 * Get current datetime in IST (UTC+5:30).
 * Railway operations use IST, not UTC.
 */
function nowIST() {
    const now = new Date();
    // IST offset is +5:30 = 330 minutes
    const istOffset = 330;
    return new Date(now.getTime() + (istOffset + now.getTimezoneOffset()) * 60000);
}

/**
 * Get current date in IST as "YYYY-MM-DD".
 */
function todayISO() {
    const istTime = nowIST();
    const y = istTime.getFullYear();
    const m = String(istTime.getMonth() + 1).padStart(2, '0');
    const d = String(istTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Get current time in IST as minutes since midnight.
 */
function currentISTMinutes() {
    const istTime = nowIST();
    return istTime.getHours() * 60 + istTime.getMinutes();
}

function diffDays(dateStr) {
    // dateStr "YYYY-MM-DD" → +N for future, -N for past, relative to today (IST date)
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

/**
 * SQL fragment + params to filter div_loco_link_master rows that are active
 * on the given date. A row is active if:
 *   - effective_from is NULL or <= date
 *   - effective_until is NULL or >= date
 *   - date is not present in skip_dates JSON array
 * (NULLs in date columns mean "always active" — backward-compatible.)
 */
function effectiveOnDateClause(dateStr) {
    return {
        sql: '(effective_from IS NULL OR effective_from <= ?) '
           + 'AND (effective_until IS NULL OR effective_until >= ?) '
           + 'AND (skip_dates IS NULL OR NOT JSON_CONTAINS(skip_dates, JSON_QUOTE(?)))',
        params: [dateStr, dateStr, dateStr],
    };
}

/**
 * Normalize a DB date value (JS Date or string) to "YYYY-MM-DD".
 * mysql2 returns DATE columns as JS Date objects unless dateStrings is set;
 * local accessors are safe for date-only values regardless of server timezone.
 */
function toDateISO(d) {
    if (!d) return null;
    if (typeof d === 'string') return d.slice(0, 10);
    if (d instanceof Date) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    return String(d).slice(0, 10);
}

/**
 * JS-side equivalent of effectiveOnDateClause — given a master row object
 * (with effective_from / effective_until / skip_dates columns) and a date,
 * returns true if the schedule is active on that date.
 */
function effectiveOnDate(master, dateStr) {
    if (!master) return false;
    const from = toDateISO(master.effective_from);
    const until = toDateISO(master.effective_until);
    if (from && dateStr < from) return false;
    if (until && dateStr > until) return false;
    if (master.skip_dates) {
        const skips = Array.isArray(master.skip_dates)
            ? master.skip_dates
            : JSON.parse(master.skip_dates);
        if (skips && skips.includes(dateStr)) return false;
    }
    return true;
}

/**
 * Resolve any train_no (current or historical) to a train_id via div_train_aliases.
 *
 * The aliases table holds one row per (train_id, train_no) ever used. Currently
 * valid aliases have valid_until = NULL; historical ones have a date there.
 *
 * If `asOfDate` (YYYY-MM-DD) is supplied, returns the alias that was active on
 * that date — useful for historical reports that should display the train_no
 * LPC actually saw on that day.
 *
 * Otherwise prefers the currently-valid alias (most useful for lookups by an
 * old number → resolves to the current train).
 *
 * @param {Object} pool - MySQL connection pool
 * @param {string} trainNo - The number LPC typed (could be old or new)
 * @param {string} [asOfDate] - Optional YYYY-MM-DD for time-bound resolution
 * @returns {Promise<{train_id, current_train_no, train_name, ran_as, was_aliased} | null>}
 */
async function resolveTrainByNo(pool, trainNo, asOfDate) {
    const tn = String(trainNo || '').trim();
    if (!tn) return null;
    let sql, params;
    if (asOfDate && /^\d{4}-\d{2}-\d{2}$/.test(asOfDate)) {
        // Find the alias that was valid on that specific date
        sql = `SELECT a.train_id,
                      a.train_no AS ran_as,
                      a.valid_from, a.valid_until,
                      t.train_no AS current_train_no, t.train_name,
                      (a.train_no <> t.train_no) AS was_aliased
               FROM div_train_aliases a
               JOIN div_trains t ON t.train_id = a.train_id
               WHERE a.train_no = ?
                 AND (a.valid_from IS NULL OR a.valid_from <= ?)
                 AND (a.valid_until IS NULL OR a.valid_until >= ?)
               LIMIT 1`;
        params = [tn, asOfDate, asOfDate];
    } else {
        // Prefer currently-valid (valid_until IS NULL); otherwise most recent
        sql = `SELECT a.train_id,
                      a.train_no AS ran_as,
                      a.valid_from, a.valid_until,
                      t.train_no AS current_train_no, t.train_name,
                      (a.train_no <> t.train_no) AS was_aliased
               FROM div_train_aliases a
               JOIN div_trains t ON t.train_id = a.train_id
               WHERE a.train_no = ?
               ORDER BY (a.valid_until IS NULL) DESC, a.valid_until DESC
               LIMIT 1`;
        params = [tn];
    }
    const [rows] = await pool.query(sql, params);
    return rows.length ? rows[0] : null;
}

/**
 * Parse event_time string (e.g., "22:05", "0:30", "02:25 03:00") to minutes since midnight.
 * For compound times like "02:25 03:00", uses the first time.
 * Returns null if unparseable.
 */
function parseEventTime(timeStr) {
    if (!timeStr) return null;
    // Take first time if compound (e.g., "02:25 03:00" → "02:25")
    const firstTime = String(timeStr).trim().split(/\s+/)[0];
    const match = firstTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
}

/**
 * Add N days to a date string "YYYY-MM-DD" and return the new date string.
 */
function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

/**
 * Compute target working_date for cross-direction propagation.
 *
 * Priority rules:
 * 1. If sourceDate == today AND target_dep < current_IST_time → next day
 *    (train has already departed today, so assignment must be for tomorrow)
 * 2. If target_event_time < source_event_time → next day
 *    (standard time comparison for back-filling or when rule 1 doesn't apply)
 * 3. Otherwise → same day
 *
 * @param {string} sourceDate - Source working_date "YYYY-MM-DD"
 * @param {string} sourceEventTime - Source train's event_time (e.g., "22:05")
 * @param {string} targetEventTime - Target train's event_time (e.g., "00:15")
 * @returns {{ targetDate: string, isNextDay: boolean, reason: string }}
 */
function computeTargetDate(sourceDate, sourceEventTime, targetEventTime) {
    const tgtMin = parseEventTime(targetEventTime);

    // If target time is unparseable, default to same day
    if (tgtMin === null) {
        return { targetDate: sourceDate, isNextDay: false, reason: 'unparseable_target_time' };
    }

    // Rule 1: If filling for today and target train has already departed
    const today = todayISO();
    if (sourceDate === today) {
        const nowMin = currentISTMinutes();
        if (tgtMin < nowMin) {
            // Target train has already departed today → must be for tomorrow
            return { targetDate: addDays(sourceDate, 1), isNextDay: true, reason: 'already_departed_today' };
        }
    }

    // Rule 2: Standard time comparison (for back-filling or real-time when train hasn't departed)
    const srcMin = parseEventTime(sourceEventTime);
    if (srcMin === null) {
        // Source time unparseable, can't compare → default to same day
        return { targetDate: sourceDate, isNextDay: false, reason: 'unparseable_source_time' };
    }

    // If target time < source time → next day
    if (tgtMin < srcMin) {
        return { targetDate: addDays(sourceDate, 1), isNextDay: true, reason: 'time_comparison' };
    }
    return { targetDate: sourceDate, isNextDay: false, reason: 'same_day' };
}

/**
 * Get the terminal for a train from div_trains or div_train_stops.
 * For UP trains: returns to_station (last stop / terminal)
 * For DN trains: returns from_station (first stop / departure terminal)
 *
 * @param {Object} pool - MySQL connection pool
 * @param {string} trainNo - Train number
 * @param {string} direction - UP or DN
 * @returns {Promise<{terminal: string|null, locoChangeStation: string|null}>}
 *          terminal: where loco arrives/departs based on direction
 *          locoChangeStation: intermediate loco change point (e.g., PNVL for bypass trains)
 */
async function getTrainTerminal(pool, trainNo, direction) {
    // First try div_trains (faster, pre-computed)
    const [trainRows] = await pool.query(
        `SELECT from_station, to_station, loco_change_station FROM div_trains WHERE train_no = ? LIMIT 1`,
        [trainNo]
    );
    if (trainRows.length) {
        const row = trainRows[0];
        // UP: loco arrives at to_station (terminal)
        // DN: loco departs from from_station (terminal)
        const terminal = direction === 'UP' ? row.to_station : row.from_station;
        return { terminal, locoChangeStation: row.loco_change_station || null };
    }

    // Fallback to div_train_stops
    try {
        if (direction === 'UP') {
            // Get last stop for UP train
            const [stops] = await pool.query(
                `SELECT station_code FROM div_train_stops
                 WHERE train_no = ?
                 ORDER BY seq_order DESC LIMIT 1`,
                [trainNo]
            );
            return { terminal: stops.length ? stops[0].station_code : null, locoChangeStation: null };
        } else {
            // Get first stop for DN train
            const [stops] = await pool.query(
                `SELECT station_code FROM div_train_stops
                 WHERE train_no = ?
                 ORDER BY seq_order ASC LIMIT 1`,
                [trainNo]
            );
            return { terminal: stops.length ? stops[0].station_code : null, locoChangeStation: null };
        }
    } catch (e) {
        if (!isTableNotExistError(e)) throw e;
        return { terminal: null, locoChangeStation: null };
    }
}

/**
 * Update loco position after a train movement is logged.
 *
 * @param {Object} pool - MySQL connection pool
 * @param {Object} params
 * @param {string} params.locoNo - Loco number
 * @param {string} params.location - New location (CSMT, LTT, OUT_OF_DIV, etc.)
 * @param {string} params.movementType - ARRIVAL, DEPARTURE, TRANSFER, or MANUAL
 * @param {string} [params.trainNo] - Associated train number
 * @param {string} [params.workingDate] - Working date for the movement
 * @param {string} [params.remarks] - Optional remarks
 * @param {string} [params.userId] - User who triggered the update
 * @returns {Promise<Object>} { success, from_location, to_location }
 */
async function updateLocoPosition(pool, { locoNo, location, movementType, trainNo, workingDate, remarks, userId }) {
    if (!locoNo || !location) {
        return { success: false, error: 'loco_number and location required' };
    }

    // Validate location
    if (!VALID_LOCATIONS.includes(location)) {
        return { success: false, error: `invalid location: ${location}` };
    }

    const now = nowIST();
    const movedAt = now.toISOString().slice(0, 19).replace('T', ' ');

    // Get current position (if any) for history tracking
    let fromLocation = null;
    try {
        const [current] = await pool.query(
            `SELECT current_location FROM div_loco_positions WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (current.length) {
            fromLocation = current[0].current_location;
        }
    } catch (e) {
        if (!isTableNotExistError(e)) throw e;
    }

    // Skip update if location hasn't changed (except for manual moves)
    if (fromLocation === location && movementType !== 'MANUAL') {
        return { success: true, skipped: true, from_location: fromLocation, to_location: location };
    }

    try {
        // UPSERT div_loco_positions
        if (movementType === 'ARRIVAL') {
            await pool.query(
                `INSERT INTO div_loco_positions
                    (loco_number, current_location, arrived_via_train, arrived_at, remarks, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    current_location = VALUES(current_location),
                    arrived_via_train = VALUES(arrived_via_train),
                    arrived_at = VALUES(arrived_at),
                    departed_via_train = NULL,
                    departed_at = NULL,
                    remarks = VALUES(remarks),
                    updated_by = VALUES(updated_by)`,
                [locoNo, location, trainNo, movedAt, remarks, userId]
            );
        } else if (movementType === 'DEPARTURE') {
            await pool.query(
                `INSERT INTO div_loco_positions
                    (loco_number, current_location, departed_via_train, departed_at, remarks, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    current_location = VALUES(current_location),
                    departed_via_train = VALUES(departed_via_train),
                    departed_at = VALUES(departed_at),
                    remarks = VALUES(remarks),
                    updated_by = VALUES(updated_by)`,
                [locoNo, location, trainNo, movedAt, remarks, userId]
            );
        } else {
            // TRANSFER or MANUAL
            await pool.query(
                `INSERT INTO div_loco_positions
                    (loco_number, current_location, arrived_at, remarks, updated_by)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    current_location = VALUES(current_location),
                    arrived_via_train = NULL,
                    arrived_at = VALUES(arrived_at),
                    departed_via_train = NULL,
                    departed_at = NULL,
                    remarks = VALUES(remarks),
                    updated_by = VALUES(updated_by)`,
                [locoNo, location, movedAt, remarks, userId]
            );
        }

        // Insert history record
        await pool.query(
            `INSERT INTO div_loco_position_history
                (loco_number, from_location, to_location, movement_type, train_no, working_date, moved_at, remarks, moved_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [locoNo, fromLocation, location, movementType, trainNo, workingDate, movedAt, remarks, userId]
        );

        return { success: true, from_location: fromLocation, to_location: location, moved_at: movedAt };
    } catch (e) {
        if (isTableNotExistError(e)) {
            // Tables don't exist yet — skip silently
            return { success: false, error: 'position tables not yet created' };
        }
        throw e;
    }
}

/**
 * Put a loco back where it was standing after it is dropped from a train.
 *
 * When a DN link is saved, the loco is marked OUT_OF_DIV — it has left the
 * division. If the LPC then changes the loco (fault before departure, better
 * loco found, link altered), the replaced loco is physically still at the
 * terminal, but nothing used to undo its departure. It stayed OUT_OF_DIV,
 * vanished from the availability page and the picker, and had to be moved back
 * by hand — the same manual chore the booking fix removed.
 *
 * Only call this for a loco genuinely dropped from the row. A loco that merely
 * moves front → rear (a failed loco left attached and towed dead) is still on
 * the train and must stay OUT_OF_DIV.
 *
 * Restores from the DEPARTURE we ourselves wrote, and only if nothing has
 * happened to the loco since — if its position no longer matches that
 * departure, a later event owns it and we leave it alone.
 */
async function restoreDroppedLocoPosition(pool, { locoNo, trainNo, workingDate, userId }) {
    if (!locoNo) return { success: false, error: 'loco_number required' };

    try {
        // The departure this train/date wrote for the loco — its from_location
        // is where the loco was standing.
        const [hist] = await pool.query(
            `SELECT from_location FROM div_loco_position_history
             WHERE loco_number = ? AND train_no = ? AND working_date = ?
               AND movement_type = 'DEPARTURE' AND to_location = 'OUT_OF_DIV'
             ORDER BY moved_at DESC LIMIT 1`,
            [locoNo, trainNo, workingDate]
        );
        if (!hist.length || !hist[0].from_location) {
            return { success: false, skipped: 'no departure to undo' };
        }
        const back = hist[0].from_location;
        if (!VALID_LOCATIONS.includes(back) || back === 'OUT_OF_DIV') {
            return { success: false, skipped: `not a restorable location: ${back}` };
        }

        // Only undo if the loco is still sitting on that departure.
        const [cur] = await pool.query(
            `SELECT current_location, departed_via_train FROM div_loco_positions
             WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (!cur.length) return { success: false, skipped: 'no position row' };
        if (cur[0].current_location !== 'OUT_OF_DIV' || cur[0].departed_via_train !== trainNo) {
            return { success: false, skipped: 'superseded by a later movement' };
        }

        const movedAt = nowISTDateTime();
        // arrived_via_train / arrived_at survive a DEPARTURE untouched, so the
        // loco keeps its original "via 12620" once it is back at the terminal.
        await pool.query(
            `UPDATE div_loco_positions
             SET current_location = ?, departed_via_train = NULL, departed_at = NULL,
                 remarks = ?, updated_by = ?
             WHERE loco_number = ?`,
            [back, `returned to pool — dropped from ${trainNo}`, userId, locoNo]
        );
        await pool.query(
            `INSERT INTO div_loco_position_history
                (loco_number, from_location, to_location, movement_type, train_no, working_date, moved_at, remarks, moved_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [locoNo, 'OUT_OF_DIV', back, 'TRANSFER', trainNo, workingDate, movedAt,
             `dropped from ${trainNo} — position restored`, userId]
        );

        return { success: true, restored_to: back };
    } catch (e) {
        if (isTableNotExistError(e)) return { success: false, error: 'position tables not yet created' };
        throw e;
    }
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
        // Filter by date-validity (effective_from/until + skip_dates) so scheduled
        // specials only count on dates within their schedule.
        const effClause = effectiveOnDateClause(date);
        const [masters] = await pool.query(
            `SELECT id, sheet_source, run_days FROM div_loco_link_master
             WHERE active = 1 AND ${effClause.sql}`,
            effClause.params
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
                    home_shed, hotel_load_oem, status,
                    schedule_type, schedule_due_date
             FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const loco = rows[0];
        // schedule_due_date comes back as a Date; normalize to YYYY-MM-DD for the sheet.
        loco.schedule_due_date = toDateISO(loco.schedule_due_date);

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

// ── GET /train/:train_no/target-date ──────────────────────────────────────
// Preview endpoint: given a source train, compute the target working_date
// for a cross-direction propagation. Used by the frontend to show the
// "→ Assigns to May 18 (Sun)" indicator before saving.
//
// Query params:
//   source_date       YYYY-MM-DD — working_date of the source train entry
//   source_time       HH:MM — event_time of the source train (takeover for UP)
//   target_direction  DN | UP — direction of the target train
//
// Returns:
//   { train_no, target_direction, target_date, is_next_day, runs_on_target, event_time }
// GET /train/:train_no/resolve — does this number map to a catalogued train?
// Alias-aware. The daily-entry inline-special row calls this on train_no blur
// to decide whether to prompt the LPC for a new train name.
router.get('/train/:train_no/resolve', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const resolved = await resolveTrainByNo(pool, req.params.train_no);
        if (!resolved) return res.json({ found: false });
        res.json({
            found: true,
            train_id: resolved.train_id,
            current_train_no: resolved.current_train_no,
            train_name: resolved.train_name,
            ran_as: resolved.ran_as,
            was_aliased: !!resolved.was_aliased,
        });
    } catch (err) {
        console.error('[loco-link GET /train/:no/resolve]', err);
        res.status(500).json({ error: 'resolve failed' });
    }
});

// ════════════════════════════════════════════════════════════════════════
// WTT (working timetable) — read endpoints for the WTT lookup page.
// View: any logged-in user. Edits live in separate admin/ctlc endpoints.
// ════════════════════════════════════════════════════════════════════════

// GET /wtt/train/:train_no — full halt list for a train (alias-aware).
router.get('/wtt/train/:train_no', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const resolved = await resolveTrainByNo(pool, req.params.train_no);
        if (!resolved) return res.json({ found: false });
        const trainId = resolved.train_id;
        const [stops] = await pool.query(
            `SELECT id, seq_order, station_code, arrival_time, departure_time,
                    event_type, day_offset, direction
             FROM div_train_stops WHERE train_id = ? ORDER BY seq_order`, [trainId]);
        // run-days: prefer the loco-link plan (master), fall back to div_trains
        const [mrun] = await pool.query(
            `SELECT GROUP_CONCAT(DISTINCT run_days ORDER BY run_days SEPARATOR ' / ') AS run_days
             FROM div_loco_link_master WHERE train_id = ? AND active = 1 AND run_days IS NOT NULL`,
            [trainId]);
        const [tinfo] = await pool.query(
            `SELECT train_name, run_days, train_type FROM div_trains WHERE train_id = ? LIMIT 1`,
            [trainId]);
        const info = tinfo[0] || {};
        res.json({
            found: true,
            train_id: trainId,
            current_train_no: resolved.current_train_no,
            train_name: resolved.train_name || info.train_name || null,
            train_type: info.train_type || null,
            ran_as: resolved.ran_as,
            was_aliased: !!resolved.was_aliased,
            run_days: (mrun[0] && mrun[0].run_days) || info.run_days || null,
            stops,
        });
    } catch (err) {
        console.error('[wtt/train]', err);
        res.status(500).json({ error: 'WTT lookup failed' });
    }
});

// GET /wtt/station/:station_code — station board.
//   ?dir=UP|DN|BYPASS  ?mode=departing|arriving|halting|passing  ?from=HH:MM ?to=HH:MM
router.get('/wtt/station/:station_code', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const code = String(req.params.station_code || '').trim();
        if (!code) return res.status(400).json({ error: 'station_code required' });
        const dir = String(req.query.dir || '').trim().toUpperCase();
        const mode = String(req.query.mode || 'passing').trim().toLowerCase();
        const from = String(req.query.from || '').trim();   // HH:MM
        const to   = String(req.query.to || '').trim();

        // which time column the mode + window applies to
        const timeCol = mode === 'departing' ? 's.departure_time'
            : mode === 'arriving' ? 's.arrival_time'
            : 'COALESCE(s.arrival_time, s.departure_time)';

        let sql = `SELECT s.id, s.train_id, s.seq_order, s.station_code, s.direction,
                          s.arrival_time, s.departure_time, s.event_type, s.day_offset,
                          t.train_no, t.train_name
                   FROM div_train_stops s
                   JOIN div_trains t ON t.train_id = s.train_id
                   WHERE s.station_code = ?`;
        const params = [code];
        if (mode === 'departing')      sql += ' AND s.departure_time IS NOT NULL';
        else if (mode === 'arriving')  sql += ' AND s.arrival_time IS NOT NULL';
        else if (mode === 'halting')   sql += " AND s.event_type = 'halt'";
        if (['UP', 'DN', 'BYPASS'].includes(dir)) { sql += ' AND s.direction = ?'; params.push(dir); }
        const hhmm = /^\d{1,2}:\d{2}$/;
        if (hhmm.test(from)) { sql += ` AND ${timeCol} >= ?`; params.push(from + ':00'); }
        if (hhmm.test(to))   { sql += ` AND ${timeCol} <= ?`; params.push(to + ':00'); }
        sql += ` ORDER BY COALESCE(${timeCol}, s.arrival_time, s.departure_time), t.train_no`;

        const [rows] = await pool.query(sql, params);
        res.json({ station_code: code, dir: dir || null, mode, from: from || null, to: to || null, total: rows.length, rows });
    } catch (err) {
        console.error('[wtt/station]', err);
        res.status(500).json({ error: 'WTT station board failed' });
    }
});

// GET /wtt/station/:station_code/full — compare view: the trains that match the
// station filter, each with its FULL halt list. Same filters as the board.
router.get('/wtt/station/:station_code/full', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const code = String(req.params.station_code || '').trim();
        if (!code) return res.status(400).json({ error: 'station_code required' });
        const dir = String(req.query.dir || '').trim().toUpperCase();
        const mode = String(req.query.mode || 'passing').trim().toLowerCase();
        const from = String(req.query.from || '').trim();
        const to   = String(req.query.to || '').trim();
        const CAP = 60;

        const timeCol = mode === 'departing' ? 's.departure_time'
            : mode === 'arriving' ? 's.arrival_time'
            : 'COALESCE(s.arrival_time, s.departure_time)';

        // 1) matching trains at this station, in time order
        let sql = `SELECT s.train_id, s.direction
                   FROM div_train_stops s WHERE s.station_code = ?`;
        const params = [code];
        if (mode === 'departing')      sql += ' AND s.departure_time IS NOT NULL';
        else if (mode === 'arriving')  sql += ' AND s.arrival_time IS NOT NULL';
        else if (mode === 'halting')   sql += " AND s.event_type = 'halt'";
        if (['UP', 'DN', 'BYPASS'].includes(dir)) { sql += ' AND s.direction = ?'; params.push(dir); }
        const hhmm = /^\d{1,2}:\d{2}$/;
        if (hhmm.test(from)) { sql += ` AND ${timeCol} >= ?`; params.push(from + ':00'); }
        if (hhmm.test(to))   { sql += ` AND ${timeCol} <= ?`; params.push(to + ':00'); }
        sql += ` ORDER BY COALESCE(${timeCol}, s.arrival_time, s.departure_time), s.train_id`;
        const [matched] = await pool.query(sql, params);

        const orderedIds = [];
        const dirAt = new Map();
        for (const m of matched) {
            if (!dirAt.has(m.train_id)) { orderedIds.push(m.train_id); dirAt.set(m.train_id, m.direction); }
        }
        const total = orderedIds.length;
        const ids = orderedIds.slice(0, CAP);
        if (!ids.length) return res.json({ station_code: code, total: 0, capped: false, trains: [] });

        // 2) full stops for those trains, + headers
        const [stopRows] = await pool.query(
            `SELECT train_id, seq_order, station_code, arrival_time, departure_time,
                    event_type, day_offset, direction
             FROM div_train_stops WHERE train_id IN (?) ORDER BY train_id, seq_order`, [ids]);
        const [hdrs] = await pool.query(
            `SELECT train_id, train_no, train_name FROM div_trains WHERE train_id IN (?)`, [ids]);
        const stopsBy = new Map(); for (const s of stopRows) {
            if (!stopsBy.has(s.train_id)) stopsBy.set(s.train_id, []);
            stopsBy.get(s.train_id).push(s);
        }
        const hdrBy = new Map(hdrs.map(h => [h.train_id, h]));

        const trains = ids.map(id => {
            const h = hdrBy.get(id) || {};
            return {
                train_id: id,
                train_no: h.train_no || String(id),
                train_name: h.train_name || null,
                station_code: code,
                station_dir: dirAt.get(id) || null,
                stops: stopsBy.get(id) || [],
            };
        });
        res.json({ station_code: code, dir: dir || null, mode, total, capped: total > CAP, shown: ids.length, trains });
    } catch (err) {
        console.error('[wtt/station/full]', err);
        res.status(500).json({ error: 'WTT compare view failed' });
    }
});

// GET /wtt/all — every WTT train as a single full-journey entry, for the Full
// WTT export. Built purely from div_train_stops (+ div_trains name/direction,
// + div_loco_link_master.section). Frontend groups by direction → section and
// sorts within a section by departure time.
router.get('/wtt/all', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const [idRows] = await pool.query('SELECT DISTINCT train_id FROM div_train_stops');
        const ids = idRows.map(r => r.train_id);
        if (!ids.length) return res.json({ total: 0, trains: [] });

        const [stopRows] = await pool.query(
            `SELECT train_id, seq_order, station_code, arrival_time, departure_time, event_type, day_offset
             FROM div_train_stops WHERE train_id IN (?) ORDER BY train_id, seq_order`, [ids]);
        const [hdrs] = await pool.query(
            `SELECT train_id, train_no, train_name, direction, train_type, run_days FROM div_trains WHERE train_id IN (?)`, [ids]);
        const [secs] = await pool.query(
            `SELECT train_id, section FROM div_loco_link_master
             WHERE train_id IN (?) AND active=1 AND section IS NOT NULL AND section <> ''`, [ids]);

        const stopsBy = new Map();
        for (const s of stopRows) {
            if (!stopsBy.has(s.train_id)) stopsBy.set(s.train_id, []);
            stopsBy.get(s.train_id).push(s);
        }
        const hdrBy = new Map(hdrs.map(h => [h.train_id, h]));
        const secBy = new Map();
        for (const s of secs) { if (!secBy.has(s.train_id)) secBy.set(s.train_id, String(s.section).toUpperCase()); }

        const BOUNDARY = { IGP: 'NE', LNL: 'SE', ROHA: 'KR' };   // boundary stop → section
        const MUM = new Set(['CSMT', 'LTT', 'PNVL', 'DR', 'BSR']);
        const toMin = (t) => {
            if (!t) return null;
            const m = String(t).match(/^(\d{1,2}):(\d{2})/);
            return m ? (parseInt(m[1], 10) % 24) * 60 + parseInt(m[2], 10) : null;
        };

        const trains = ids.map(id => {
            const stops = stopsBy.get(id) || [];
            const h = hdrBy.get(id) || {};
            // section: master, else infer from a boundary stop, else BYPASS
            let section = secBy.get(id) || '';
            if (!section) {
                for (const s of stops) { if (BOUNDARY[s.station_code]) { section = BOUNDARY[s.station_code]; break; } }
                if (!section) section = 'BYPASS';
            }
            // direction: div_trains, else infer from a Mumbai terminal end
            let direction = (h.direction || '').toUpperCase();
            const first = stops[0] || {};
            const last = stops[stops.length - 1] || {};
            if (!direction) {
                if (MUM.has(first.station_code)) direction = 'DN';
                else if (MUM.has(last.station_code)) direction = 'UP';
                else direction = 'DN';
            }
            return {
                train_id: id,
                train_no: h.train_no || String(id),
                train_name: h.train_name || null,
                train_type: h.train_type || null,
                run_days: h.run_days || null,
                direction,
                section,
                dep_min: toMin(first.departure_time) ?? toMin(first.arrival_time),
                origin: first.station_code || null,
                destination: last.station_code || null,
                stops,
            };
        });
        res.json({ total: trains.length, trains });
    } catch (err) {
        console.error('[wtt/all]', err);
        res.status(500).json({ error: 'Full WTT failed' });
    }
});

router.get('/train/:train_no/target-date', async (req, res) => {
    const trainNo = String(req.params.train_no || '').trim();
    const sourceDate = String(req.query.source_date || '').trim();
    const sourceTime = String(req.query.source_time || '').trim();
    const targetDirection = String(req.query.target_direction || 'DN').trim().toUpperCase();

    if (!trainNo) return res.status(400).json({ error: 'train_no required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sourceDate)) {
        return res.status(400).json({ error: 'source_date must be YYYY-MM-DD' });
    }
    if (!['UP', 'DN'].includes(targetDirection)) {
        return res.status(400).json({ error: 'target_direction must be UP or DN' });
    }

    try {
        const pool = req.app.locals.pool;

        // Find target train in master — restricted to schedules active on sourceDate
        // (so a renumbered or season-bound special doesn't get matched out-of-window).
        const effClause = effectiveOnDateClause(sourceDate);
        const [masters] = await pool.query(
            `SELECT id, event_time, run_days, train_name
             FROM div_loco_link_master
             WHERE train_no = ? AND direction = ? AND active = 1
               AND ${effClause.sql}
             LIMIT 1`,
            [trainNo, targetDirection, ...effClause.params]
        );
        if (!masters.length) {
            return res.status(404).json({
                error: 'Train not found in master',
                train_no: trainNo,
                direction: targetDirection,
            });
        }
        const target = masters[0];

        // Compute target date using time comparison + current IST time check
        const { targetDate, isNextDay, reason } = computeTargetDate(sourceDate, sourceTime, target.event_time);

        // Check if target train runs on the computed date
        const dow = dayOfWeekIR(targetDate);
        const runsOnTarget = runsToday(target.run_days, dow);

        // Format date for display (e.g., "18-May (Sun)")
        const d = new Date(targetDate + 'T00:00:00Z');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const displayDate = `${d.getUTCDate()}-${monthNames[d.getUTCMonth()]} (${dayNames[d.getUTCDay()]})`;

        res.json({
            train_no: trainNo,
            train_name: target.train_name,
            target_direction: targetDirection,
            target_date: targetDate,
            display_date: displayDate,
            is_next_day: isNextDay,
            reason,  // 'already_departed_today' | 'time_comparison' | 'same_day' | ...
            runs_on_target: runsOnTarget,
            event_time: target.event_time,
            run_days: target.run_days,   // exposed so the frontend can validate custom-picked dates
            day_of_week: dow,
        });
    } catch (err) {
        console.error('[loco-link /train/:n/target-date]', err);
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
            // A row appears on its own sheet OR on a sheet it mirrors to
            // (Phase 2: KR loco-change legs of 22149/22150 shown on PNVL-UP/DN).
            // Same master_id/log, so it stays a single record.
            where += ' AND (sheet_source = ? OR mirror_sheet = ?)';
            params.push(sheetSource, sheetSource);
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

        // Date-validity filter: hides scheduled specials outside their window
        // and skip-dates. Always-active rows (NULL columns) pass through.
        const effClause = effectiveOnDateClause(date);
        where += ' AND ' + effClause.sql;
        params.push(...effClause.params);

        const [masterRows] = await pool.query(
            // ORDER BY event_time so the daily-entry sheet renders trains in
            // chronological order (LPC works the sheet top-to-bottom as the day
            // progresses). Falls back to id to keep ties deterministic.
            // train_name comes from div_trains (100% populated) when available,
            // else falls back to div_loco_link_master.train_name.
            `SELECT m.id, m.sheet_source, m.sr_no, m.section, m.direction, m.is_bypass,
                    m.from_station, m.to_station, m.route_label,
                    m.shed_code, m.link_attr, m.expected_hog, m.is_push_pull, m.traction_type,
                    m.rake_type, m.train_no, t.train_id,
                    COALESCE(t.train_name, m.train_name) AS train_name,
                    prev.train_no AS renamed_from,
                    m.event_time, m.via_stations, m.run_days, m.remark
             FROM div_loco_link_master m
             LEFT JOIN div_trains t ON t.train_no = m.train_no
             LEFT JOIN (
                 SELECT a1.train_id, a1.train_no
                 FROM div_train_aliases a1
                 JOIN (
                     SELECT train_id, MAX(valid_until) AS mx
                     FROM div_train_aliases
                     WHERE valid_until IS NOT NULL
                     GROUP BY train_id
                 ) latest ON latest.train_id = a1.train_id AND latest.mx = a1.valid_until
             ) prev ON prev.train_id = t.train_id
             WHERE ${where.replace(/\b(active|sheet_source|mirror_sheet|direction|from_station|route_label|effective_from|effective_until|skip_dates)\b/g, 'm.$1')}
             ORDER BY m.event_time, m.id`,
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

        // Special trains — log rows for this sheet+date with no master_id.
        // Returns event_time so the frontend can merge specials into the
        // master rows' time-ordered list. JOIN div_trains for train_name when
        // the inline special's train_no happens to be in the trains master.
        let specials = [];
        // Specials scope: a specific sheet by sheet_source, OR — on the all-bypass
        // view (direction=BYPASS, no sheet_source) — every bypass special for the
        // date (the frontend groups them by section = route_label). Without this,
        // bypass specials (incl. the Pune↔Roha seasonal ones) wouldn't reload.
        let specWhere = null, specParams = null;
        if (sheetSource) { specWhere = 'l.sheet_source = ?'; specParams = [date, sheetSource]; }
        else if (direction === 'BYPASS') { specWhere = "l.direction = 'BYPASS'"; specParams = [date]; }
        if (specWhere) {
            const [rows] = await pool.query(
                `SELECT l.id, l.master_id, l.sheet_source, l.section, l.working_date, l.direction, l.train_no,
                        l.event_time, l.from_station, l.to_station,
                        t.train_name, t.train_id,
                        prev.train_no AS renamed_from,
                        l.actual_loco_no, l.base_shed, l.loco_type, l.traction_type,
                        l.main_loco_dead, l.failed_in_division,
                        l.actual_loco_no_rear, l.secondary_role,
                        l.base_shed_rear, l.loco_type_rear,
                        l.outgoing_train_rear, l.remarks_rear, l.is_mislink_rear,
                        l.hog, l.incoming_train, l.outgoing_train,
                        l.expected_shed, l.is_mislink,
                        l.remark, l.entered_by, l.updated_at
                 FROM div_loco_link_log l
                 LEFT JOIN div_trains t ON t.train_no = l.train_no
                 LEFT JOIN (
                     SELECT a1.train_id, a1.train_no
                     FROM div_train_aliases a1
                     JOIN (
                         SELECT train_id, MAX(valid_until) AS mx
                         FROM div_train_aliases
                         WHERE valid_until IS NOT NULL
                         GROUP BY train_id
                     ) latest ON latest.train_id = a1.train_id AND latest.mx = a1.valid_until
                 ) prev ON prev.train_id = t.train_id
                 WHERE l.working_date = ? AND l.master_id IS NULL AND ${specWhere}
                 ORDER BY l.event_time, l.id`,
                specParams
            );
            specials = rows;
        }

        // ── Terminal-arrival enrichment (from WTT div_train_stops) ─────────
        // UP trains: arrival at the destination Mumbai terminal (final stop).
        // DN trains: arrival at the loco-handover boundary by section
        //   (NE→IGP, SE→LNL, KR→ROHA) — when the loco leaves the division.
        // Adds r.terminal_arr = { time:'HH:MM', station } for the frontend's
        // green line under the train name. Silent no-op for trains without WTT.
        {
            const allRows = [...merged, ...specials];
            const tidSet = [...new Set(allRows.map(r => r.train_id).filter(Boolean))];
            if (tidSet.length) {
                const [stopRows] = await pool.query(
                    `SELECT train_id, station_code, seq_order, arrival_time, departure_time
                     FROM div_train_stops WHERE train_id IN (?)`, [tidSet]);
                const byTrain = new Map();
                for (const s of stopRows) {
                    if (!byTrain.has(s.train_id)) byTrain.set(s.train_id, []);
                    byTrain.get(s.train_id).push(s);
                }
                const BOUNDARY = { NE: 'IGP', SE: 'LNL', KR: 'ROHA' };
                // Fixed terminal for *-UP sheets: show arrival at THE SHEET's
                // terminal (so a mirrored through-train like 22150 on PNVL-UP
                // reads "arr PNVL", not its ultimate destination RN). KR-UP has
                // no fixed terminal → fall back to the final stop.
                const SHEET_TERMINAL = { 'CSMT-UP': 'CSMT', 'LTT-UP': 'LTT', 'PNVL-UP': 'PNVL', 'DR-UP': 'DR' };
                const sheetTerminal = SHEET_TERMINAL[sheetSource] || null;
                const hhmm = (t) => (t ? String(t).slice(0, 5) : null);
                for (const r of allRows) {
                    const stops = byTrain.get(r.train_id);
                    if (!stops || !stops.length) continue;
                    const dir = String(r.direction || derivedDirection || '').toUpperCase();
                    let pick = null;
                    // Use arrival when the train halts; fall back to the pass
                    // time (departure) when it passes the point without stopping.
                    if (dir === 'DN') {
                        const bcode = BOUNDARY[String(r.section || '').toUpperCase()];
                        if (bcode) {
                            const s = stops.find(x => x.station_code === bcode && (x.arrival_time || x.departure_time));
                            if (s) pick = { time: hhmm(s.arrival_time || s.departure_time), station: bcode };
                        }
                    } else {
                        // UP: arrival at the sheet's fixed terminal if known, else
                        // the final stop (destination terminal).
                        let s = null;
                        if (sheetTerminal) {
                            s = stops.find(x => x.station_code === sheetTerminal && (x.arrival_time || x.departure_time));
                        }
                        if (!s) {
                            s = stops.filter(x => x.arrival_time || x.departure_time)
                                .sort((a, b) => b.seq_order - a.seq_order)[0];
                        }
                        if (s) pick = { time: hhmm(s.arrival_time || s.departure_time), station: s.station_code };
                    }
                    if (pick) r.terminal_arr = pick;
                }
            }
        }

        // ── Loco maintenance-schedule enrichment ──────────────────────────
        // Attach each loco's current schedule_type/schedule_due_date (from the
        // loco master) so the sheet shows stored values on load, without a
        // per-input lookup. Merged master rows carry the entry under r.log;
        // special rows are log rows themselves. Rear coupler strings like
        // "A+B" resolve to the first loco (A).
        {
            const firstPart = (s) => {
                const v = (s || '').trim();
                return v.includes('+') ? v.split('+')[0].trim() : v;
            };
            const carriers = [...merged, ...specials].map(r => r.log || r).filter(Boolean);
            const locoSet = new Set();
            for (const c of carriers) {
                const f = (c.actual_loco_no || '').trim();
                if (f) locoSet.add(f);
                const rl = firstPart(c.actual_loco_no_rear);
                if (rl) locoSet.add(rl);
            }
            if (locoSet.size) {
                const [schedRows] = await pool.query(
                    `SELECT loco_number, schedule_type, schedule_due_date
                     FROM div_locos WHERE loco_number IN (?)`,
                    [[...locoSet]]
                );
                const schedMap = new Map();
                for (const s of schedRows) {
                    schedMap.set(s.loco_number, {
                        type: s.schedule_type || null,
                        due: toDateISO(s.schedule_due_date),
                    });
                }
                for (const c of carriers) {
                    const f = (c.actual_loco_no || '').trim();
                    const fs = f ? schedMap.get(f) : null;
                    if (fs) { c.schedule_type = fs.type; c.schedule_due_date = fs.due; }
                    const rl = firstPart(c.actual_loco_no_rear);
                    const rs = rl ? schedMap.get(rl) : null;
                    if (rs) { c.schedule_type_rear = rs.type; c.schedule_due_date_rear = rs.due; }
                }
            }
        }

        res.json({
            date,
            sheet_source: sheetSource || null,
            direction: derivedDirection,
            from_station: fromStation || null,
            day_of_week_ir: dow,
            // Sheet is editable only within the date window AND for writer roles.
            // View-only roles (e.g. ctlc_view) always get a read-only sheet.
            editable: isEditable(date) && ['lpc', 'ctlc', 'division_admin'].includes(req.session.user?.div_role),
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

// ── GET /hog-position ──────────────────────────────────────────────────────
// Daily HOG Position report: outbound (DN) mail/express departures from the
// Mumbai terminals with each train's actual loco(s), loco type, base shed,
// HOG make (div_locos.hotel_load_oem) and HOG / non-HOG status. Optional
// from/to time window (shift). Non-HOG links (DSL / AC-DC / WAP-4) are flagged.
router.get('/hog-position', async (req, res) => {
    const date = String(req.query.date || todayISO()).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }
    const fromTime = /^\d{2}:\d{2}$/.test(req.query.from || '') ? req.query.from : null;
    const toTime   = /^\d{2}:\d{2}$/.test(req.query.to   || '') ? req.query.to   : null;

    try {
        const pool = req.app.locals.pool;
        const dow = dayOfWeekIR(date);
        const eff = effectiveOnDateClause(date);
        const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
        const firstPart = (s) => {
            const v = (s || '').trim();
            return v.includes('+') ? v.split('+')[0].trim() : v;
        };

        // 1. Outbound (DN) master trains active on the date
        const [masters] = await pool.query(
            `SELECT m.id, m.sheet_source, m.section, m.from_station, m.to_station,
                    m.shed_code, m.link_attr, m.expected_hog, m.is_push_pull,
                    m.train_no, m.event_time, m.run_days,
                    t.train_id, COALESCE(t.train_name, m.train_name) AS train_name
             FROM div_loco_link_master m
             LEFT JOIN div_trains t ON t.train_no = m.train_no
             WHERE m.active = 1 AND m.direction = 'DN' AND m.is_bypass = 0
               AND ${eff.sql}
             ORDER BY m.event_time, m.id`,
            eff.params
        );

        let rows = masters.filter(m => runsToday(m.run_days, dow));
        if (fromTime) rows = rows.filter(m => hhmm(m.event_time) >= fromTime);
        if (toTime)   rows = rows.filter(m => hhmm(m.event_time) <  toTime);

        // 2. Log entries for the date (front + rear loco, remark)
        const ids = rows.map(m => m.id);
        const logByMaster = new Map();
        if (ids.length) {
            const [logs] = await pool.query(
                `SELECT master_id, actual_loco_no, actual_loco_no_rear, remark
                 FROM div_loco_link_log
                 WHERE working_date = ? AND master_id IN (?)`,
                [date, ids]
            );
            for (const l of logs) logByMaster.set(l.master_id, l);
        }

        // 3. Loco details for every actual loco (front + rear first-part)
        const locoSet = new Set();
        for (const m of rows) {
            const l = logByMaster.get(m.id); if (!l) continue;
            if (l.actual_loco_no) locoSet.add(l.actual_loco_no.trim());
            const rl = firstPart(l.actual_loco_no_rear); if (rl) locoSet.add(rl);
        }
        const locoInfo = new Map();
        if (locoSet.size) {
            const [locos] = await pool.query(
                `SELECT loco_number, loco_type, home_shed, hotel_load_oem, traction_type
                 FROM div_locos WHERE loco_number IN (?)`, [[...locoSet]]);
            for (const lc of locos) locoInfo.set(lc.loco_number, lc);
        }

        // 4. Destination (TO): WTT final stop (max seq_order), else parse train_name
        const trainIds = [...new Set(rows.map(m => m.train_id).filter(Boolean))];
        const destByTrain = new Map();
        if (trainIds.length) {
            const [stops] = await pool.query(
                `SELECT train_id, station_code, seq_order
                 FROM div_train_stops WHERE train_id IN (?)`, [trainIds]);
            const lastByTrain = new Map();
            for (const s of stops) {
                const cur = lastByTrain.get(s.train_id);
                if (!cur || s.seq_order > cur.seq_order) lastByTrain.set(s.train_id, s);
            }
            for (const [tid, s] of lastByTrain) destByTrain.set(tid, s.station_code);
        }
        const destFromName = (name) => {
            const m = String(name || '').match(/^[A-Z]+-([A-Z]+)/);
            return m ? m[1] : '';
        };

        // Assemble
        const NONHOG_ATTR = /DSL|AC\/?DC|P\/4|WAP[\/-]?4/i;
        // Only these two standard notes are auto-filled; everything else (ICF
        // RAKE detail, interchange notes, …) is left for the LPC to type.
        const defaultRemarkFor = (attr) => {
            const a = (attr || '').toUpperCase();
            if (/DSL/.test(a)) return 'DSL LINK';
            if (NONHOG_ATTR.test(a)) return 'NON HOG LINK';
            return '';
        };
        const buildLoco = (no) => {
            if (!no) return null;
            const info = locoInfo.get(firstPart(no)) || {};
            const isDsl = /DSL|DIESEL/i.test(info.traction_type || '') || /^WD/i.test(info.loco_type || '');
            let hogMake;
            if (info.hotel_load_oem) hogMake = info.hotel_load_oem;
            else if (isDsl) hogMake = '===';
            else hogMake = 'N/HOG';
            return {
                loco_no: no,
                loco_type: info.loco_type || '',
                base: info.home_shed || '',
                hog_make: hogMake,
                is_hog: !!info.hotel_load_oem,
            };
        };

        let sr = 0;
        const out = rows.map(m => {
            const l = logByMaster.get(m.id) || {};
            const front = buildLoco(l.actual_loco_no);
            const rear = buildLoco(l.actual_loco_no_rear);
            const shed = m.shed_code || '';
            const typeLabel = (/HOG/i.test(m.link_attr || '') || m.expected_hog)
                ? 'HOG'
                : (m.link_attr || '').replace(/PUSH[\s-]?PULL/ig, '').trim();
            const link = [shed, typeLabel].filter(Boolean).join('-');
            const to = destByTrain.get(m.train_id) || destFromName(m.train_name);
            return {
                sr: ++sr,
                master_id: m.id,
                direction: 'DN',
                sheet_source: m.sheet_source || null,
                section: m.section || null,
                link,
                train_no: m.train_no,
                train_name: m.train_name || '',
                from_station: m.from_station || '',
                to_station: to,
                dep: hhmm(m.event_time),
                days: m.run_days || '',
                locos: [front, rear].filter(Boolean),
                is_push_pull: !!m.is_push_pull,
                non_hog_link: NONHOG_ATTR.test(m.link_attr || ''),
                remark: l.remark || '',
                default_remark: defaultRemarkFor(m.link_attr),
            };
        });

        res.json({ date, day_of_week_ir: dow, from: fromTime, to: toTime, total: out.length, rows: out });
    } catch (err) {
        console.error('[loco-link /hog-position]', err);
        res.status(500).json({ error: 'Failed to build HOG position' });
    }
});

// ── GET /schedule-due ──────────────────────────────────────────────────────
// Loco maintenance-schedule report. Lists locos whose schedule_due_date is set,
// filtered to overdue (default), due-soon (next N days) or all. Each loco shows
// its type/base/HOG-make, schedule type + due date, days overdue, and the last
// train it worked (so the controller can see which service carries it).
router.get('/schedule-due', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const filter = ['overdue', 'soon', 'all'].includes(req.query.filter) ? req.query.filter : 'overdue';
    const within = Math.min(365, Math.max(1, parseInt(req.query.within, 10) || 30));
    try {
        const pool = req.app.locals.pool;
        let cond = 'schedule_due_date IS NOT NULL';
        const params = [];
        if (filter === 'overdue') {
            cond += ' AND schedule_due_date < CURDATE()';
        } else if (filter === 'soon') {
            cond += ' AND schedule_due_date >= CURDATE() AND schedule_due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)';
            params.push(within);
        }
        const [locos] = await pool.query(
            `SELECT loco_number, loco_type, home_shed, hotel_load_oem,
                    schedule_type, schedule_due_date,
                    last_sched_type, last_sched_date,
                    DATEDIFF(CURDATE(), schedule_due_date) AS days_overdue,
                    schedule_updated_by, schedule_updated_at
             FROM div_locos WHERE ${cond}
             ORDER BY home_shed, schedule_due_date ASC, loco_number`,
            params
        );

        // Latest train each loco worked (front-loco assignments only).
        const nums = locos.map(l => l.loco_number);
        const lastTrain = new Map();
        if (nums.length) {
            const [rows] = await pool.query(
                `SELECT t.loco_number, t.working_date, t.train_no, t.direction, t.sheet_source
                 FROM (
                    SELECT actual_loco_no AS loco_number, working_date, train_no, direction, sheet_source,
                           ROW_NUMBER() OVER (PARTITION BY actual_loco_no ORDER BY working_date DESC, id DESC) rn
                    FROM div_loco_link_log
                    WHERE actual_loco_no IN (?)
                 ) t WHERE t.rn = 1`,
                [nums]
            );
            for (const r of rows) lastTrain.set(r.loco_number, r);
        }

        // Current position → Status (ON RUN / AT xxx / OUT OF DIV) + Planning
        // (WKG/ARRD train + date), from div_loco_positions.
        const posByLoco = new Map();
        if (nums.length) {
            const [pos] = await pool.query(
                `SELECT loco_number, current_location, remarks,
                        arrived_via_train, arrived_at, departed_via_train, departed_at
                 FROM div_loco_positions WHERE loco_number IN (?)`,
                [nums]
            );
            for (const p of pos) posByLoco.set(p.loco_number, p);
        }
        const statusFor = (loc) => {
            if (!loc) return '';
            if (loc === 'IN_TRANSIT') return 'ON RUN';
            if (loc === 'OUT_OF_DIV') return 'OUT OF DIV';
            return 'AT ' + loc;
        };
        const dmy = (d) => { const iso = toDateISO(d); if (!iso) return ''; const [y, m, day] = iso.split('-'); return `${day}-${m}-${y}`; };
        const planningFor = (p, lt) => {
            if (p) {
                if (p.current_location === 'IN_TRANSIT' && p.departed_via_train) {
                    return `WKG ${p.departed_via_train}${p.departed_at ? ' ON ' + dmy(p.departed_at) : ''}`;
                }
                if (p.arrived_via_train) {
                    return `ARRD ${p.arrived_via_train}${p.arrived_at ? ' ON ' + dmy(p.arrived_at) : ''}`;
                }
            }
            // Fallback: last loco-link assignment
            if (lt) return `${lt.train_no} (${lt.direction || ''}) ${dmy(lt.working_date)}`;
            return '';
        };

        const out = locos.map(l => {
            const lt = lastTrain.get(l.loco_number) || null;
            const p = posByLoco.get(l.loco_number) || null;
            return {
                loco_number: l.loco_number,
                loco_type: l.loco_type || '',
                base: l.home_shed || '',
                hog_make: l.hotel_load_oem || '',
                schedule_type: l.schedule_type || '',
                schedule_due_date: toDateISO(l.schedule_due_date),
                last_sched_type: l.last_sched_type || '',
                last_sched_date: toDateISO(l.last_sched_date),
                days_overdue: l.days_overdue,   // >0 overdue, <=0 upcoming
                status: statusFor(p ? p.current_location : null),
                // planning = LPC override (div_loco_positions.remarks) if set;
                // default_planning = derived ARRD/WKG note. has_position tells the
                // UI whether an edit can persist (needs an existing position row).
                planning: (p && p.remarks) ? p.remarks : '',
                default_planning: planningFor(p, lt),
                has_position: !!p,
                updated_by: l.schedule_updated_by || '',
                updated_at: l.schedule_updated_at ? toDateISO(l.schedule_updated_at) : '',
                last_train: lt ? {
                    train_no: lt.train_no,
                    date: toDateISO(lt.working_date),
                    direction: lt.direction,
                    sheet_source: lt.sheet_source,
                } : null,
            };
        });
        res.json({ filter, within, today: todayISO(), total: out.length, rows: out });
    } catch (err) {
        console.error('[loco-link /schedule-due]', err);
        res.status(500).json({ error: 'Failed to build schedule-due report' });
    }
});

// ── PATCH /loco-last-schedule ───────────────────────────────────────────────
// LPC records a loco's LAST-DONE schedule (type + date) from the Schedule-Due
// report. Optional/informational — updates only div_locos.last_sched_* ; the
// overdue calc still uses schedule_due_date.
router.patch('/loco-last-schedule', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    if (u.realm !== 'division' || !['lpc', 'ctlc', 'division_admin'].includes(u.div_role)) {
        return res.status(403).json({ error: 'not permitted' });
    }
    const b = req.body || {};
    const loco = String(b.loco_number || '').trim();
    if (!loco) return res.status(400).json({ error: 'loco_number required' });
    const type = b.last_sched_type ? String(b.last_sched_type).trim().toUpperCase() : null;
    const date = b.last_sched_date ? String(b.last_sched_date).trim() : null;
    if (type && !SCHEDULE_TYPES.includes(type)) {
        return res.status(400).json({ error: `invalid last_sched_type; expected one of ${SCHEDULE_TYPES.join(', ')}` });
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'last_sched_date must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        const [r] = await pool.query(
            'UPDATE div_locos SET last_sched_type = ?, last_sched_date = ? WHERE loco_number = ?',
            [type, date, loco]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'loco not in master' });
        res.json({ ok: true, last_sched_type: type, last_sched_date: date });
    } catch (err) {
        console.error('[loco-link PATCH /loco-last-schedule]', err);
        res.status(500).json({ error: 'Failed to save last schedule' });
    }
});

// ── PATCH /loco-planning ────────────────────────────────────────────────────
// LPC edits the Planning note on the Schedule-Due report. Stored in the existing
// div_loco_positions.remarks (no new column). Updates only an existing position
// row; a loco with no position record can't persist a note here (saved:false).
router.patch('/loco-planning', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    if (u.realm !== 'division' || !['lpc', 'ctlc', 'division_admin'].includes(u.div_role)) {
        return res.status(403).json({ error: 'not permitted' });
    }
    const b = req.body || {};
    const loco = String(b.loco_number || '').trim();
    if (!loco) return res.status(400).json({ error: 'loco_number required' });
    const planning = b.planning != null ? String(b.planning).trim().slice(0, 255) : '';
    try {
        const pool = req.app.locals.pool;
        const [r] = await pool.query(
            'UPDATE div_loco_positions SET remarks = ? WHERE loco_number = ?',
            [planning || null, loco]
        );
        res.json({ ok: true, saved: r.affectedRows > 0, planning: planning || null });
    } catch (err) {
        console.error('[loco-link PATCH /loco-planning]', err);
        res.status(500).json({ error: 'Failed to save planning' });
    }
});

// ── PATCH /log-remark ──────────────────────────────────────────────────────
// Lightweight remark upsert used by read-only views (HOG Position report) so an
// LPC can annotate a row without a full loco entry. Touches ONLY the remark on
// the (working_date, train_no, direction) log row — never the loco fields — and
// creates a minimal row if none exists yet.
router.patch('/log-remark', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    if (u.realm !== 'division' || !['lpc', 'ctlc', 'division_admin'].includes(u.div_role)) {
        return res.status(403).json({ error: 'not permitted' });
    }
    const b = req.body || {};
    const working_date = String(b.working_date || '').trim();
    const train_no = String(b.train_no || '').trim();
    const direction = String(b.direction || '').trim().toUpperCase();
    const master_id = b.master_id ? parseInt(b.master_id, 10) : null;
    const sheet_source = b.sheet_source ? String(b.sheet_source).trim() : null;
    const section = b.section ? String(b.section).trim() : null;
    const remark = b.remark != null ? String(b.remark).trim().slice(0, 255) : '';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(working_date)) return res.status(400).json({ error: 'working_date must be YYYY-MM-DD' });
    if (!train_no) return res.status(400).json({ error: 'train_no required' });
    if (!['UP', 'DN', 'BYPASS'].includes(direction)) return res.status(400).json({ error: 'invalid direction' });

    try {
        const pool = req.app.locals.pool;
        // ON DUPLICATE updates only remark — entered_by/loco fields on an existing
        // row are left intact (don't overwrite who entered the loco).
        await pool.query(
            `INSERT INTO div_loco_link_log
                (working_date, direction, train_no, master_id, sheet_source, section, remark, entered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE remark = VALUES(remark)`,
            [working_date, direction, train_no, master_id, sheet_source, section, remark || null, u.username]
        );
        res.json({ ok: true, remark: remark || null });
    } catch (err) {
        console.error('[loco-link PATCH /log-remark]', err);
        res.status(500).json({ error: 'Failed to save remark' });
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
    // Date override for outgoing trains — LPC can force same-day or next-day assignment
    // Format: "YYYY-MM-DD" or null (auto-detect using time comparison)
    const outgoing_date_override = b.outgoing_date_override ? String(b.outgoing_date_override).trim() : null;
    const outgoing_date_override_rear = b.outgoing_date_override_rear ? String(b.outgoing_date_override_rear).trim() : null;
    const remark = b.remark ? String(b.remark).trim().slice(0, 255) : null;
    const remarks_rear = b.remarks_rear ? String(b.remarks_rear).trim().slice(0, 500) : null;
    // Loco maintenance schedule (LPC-entered; written back to div_locos master
    // so it auto-fills next time). type ∈ enum or null; due YYYY-MM-DD or null.
    // Front + rear loco each carry their own type/due.
    const parseSchedType = (v) => {
        const s = v ? String(v).trim().toUpperCase() : '';
        return s && SCHEDULE_TYPES.includes(s) ? s : null;
    };
    const parseSchedDue = (v) => {
        const s = v ? String(v).trim() : '';
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
    };
    const schedule_type = parseSchedType(b.schedule_type);
    const schedule_due_date = parseSchedDue(b.schedule_due_date);
    const schedule_type_rear = parseSchedType(b.schedule_type_rear);
    const schedule_due_date_rear = parseSchedDue(b.schedule_due_date_rear);
    // Reject only when the client sent a non-empty value we couldn't parse
    // (typo / tampered payload) — silently nulling would hide the mistake.
    if (b.schedule_type && !schedule_type) {
        return res.status(400).json({ error: `invalid schedule_type; expected one of ${SCHEDULE_TYPES.join(', ')}` });
    }
    if (b.schedule_type_rear && !schedule_type_rear) {
        return res.status(400).json({ error: `invalid schedule_type_rear; expected one of ${SCHEDULE_TYPES.join(', ')}` });
    }
    if (b.schedule_due_date && !schedule_due_date) {
        return res.status(400).json({ error: 'invalid schedule_due_date; expected YYYY-MM-DD' });
    }
    if (b.schedule_due_date_rear && !schedule_due_date_rear) {
        return res.status(400).json({ error: 'invalid schedule_due_date_rear; expected YYYY-MM-DD' });
    }
    // Special-train fields — only used when master_id is null
    const reqSheetSource = b.sheet_source ? String(b.sheet_source).trim() : null;
    const reqSection = b.section ? String(b.section).trim() : null;
    // event_time on the log row — only meaningful for inline specials (no master_id).
    // Master-linked rows inherit event_time from div_loco_link_master, so we store NULL.
    const reqEventTime = b.event_time ? String(b.event_time).trim() : null;
    // from_station + to_station for inline specials so they regroup under
    // the right origin (KR-DN) / destination (KR-UP) on reload.
    const reqFromStation = b.from_station ? String(b.from_station).trim().toUpperCase() : null;
    const reqToStation   = b.to_station   ? String(b.to_station).trim().toUpperCase()   : null;
    // Inline-special new-train registration: { new_train: { train_name } }.
    // Used to catalogue an uncatalogued number typed on a master-less row.
    const newTrainName = (b.new_train && typeof b.new_train.train_name === 'string')
        ? b.new_train.train_name.trim().slice(0, 120) : null;

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
    // Inline specials need an event_time so rows can sort into the time-ordered list.
    if (!master_id) {
        if (!reqEventTime) {
            return res.status(400).json({ error: 'event_time (HH:MM) required for inline special trains' });
        }
        if (!/^\d{1,2}:\d{2}$/.test(reqEventTime)) {
            return res.status(400).json({ error: 'event_time must be HH:MM' });
        }
    }
    if (!isEditable(working_date)) {
        return res.status(403).json({
            error: 'Date outside editable window',
            editable_window: `today − ${EDITABLE_DAYS_PAST} days to today + ${EDITABLE_DAYS_FUTURE} day`
        });
    }

    try {
        const pool = req.app.locals.pool;

        // Master row — for expected_shed snapshot + push-pull validation + event_time for day-change logic
        let master = null;
        if (master_id) {
            const [mRows] = await pool.query(
                `SELECT id, shed_code, expected_hog, is_push_pull, traction_type,
                        sheet_source AS m_sheet_source, section AS m_section, event_time
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

        // event_time + from/to_station only stored for inline specials;
        // master-linked rows leave them NULL (master is source of truth)
        const log_event_time   = master_id ? null : reqEventTime;
        const log_from_station = master_id ? null : reqFromStation;
        const log_to_station   = master_id ? null : reqToStation;

        // Resolve the stable train identity (architecture rebuild). working_date
        // is the as-of date so a historical number resolves to the train that
        // ran that day.
        const resolvedTrain = await resolveTrainByNo(pool, train_no, working_date);
        let train_id = resolvedTrain ? resolvedTrain.train_id : null;
        const train_no_snapshot = train_no;

        // Inline-special train registration: an uncatalogued number on a
        // master-less row must be named & registered — no more naked train_no.
        // If the frontend supplied new_train.train_name, create the identity now
        // (div_trains + alias, atomic); otherwise tell it to prompt for a name.
        if (!master_id && !train_id) {
            if (!newTrainName) {
                return res.status(400).json({
                    error: 'unregistered_train',
                    message: `Train ${train_no} isn't registered — enter a name to add it.`,
                    train_no,
                });
            }
            // div_trains.direction is enum('UP','DN') — BYPASS has no slot there,
            // so store NULL for bypass-sheet specials (it's informational only).
            const dirForTrain = (direction === 'UP' || direction === 'DN') ? direction : null;
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.beginTransaction();
                const [ins] = await conn.query(
                    `INSERT INTO div_trains (train_no, train_name, direction, is_regular, is_active)
                     VALUES (?, ?, ?, 0, 1)`,
                    [train_no, newTrainName, dirForTrain]
                );
                train_id = ins.insertId;
                await conn.query(
                    `INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
                     VALUES (?, ?, ?, NULL)`,
                    [train_id, train_no, working_date]
                );
                await conn.commit();
            } catch (e) {
                if (conn) { try { await conn.rollback(); } catch {} }
                // Race: another save may have just created it → re-resolve.
                const r2 = await resolveTrainByNo(pool, train_no, working_date);
                if (r2) {
                    train_id = r2.train_id;
                } else {
                    console.error('[loco-link POST /log] train register failed:', e);
                    return res.status(500).json({ error: 'Failed to register new train' });
                }
            } finally {
                if (conn) conn.release();
            }
        }

        // Which locos were on this row before we overwrite it? Needed to spot a
        // loco change (fault before departure, better loco found) so the dropped
        // loco can be put back in the pool — see restoreDroppedLocoPosition.
        let locosBefore = [];
        try {
            const [prior] = await pool.query(
                `SELECT actual_loco_no, actual_loco_no_rear FROM div_loco_link_log
                 WHERE working_date = ? AND direction = ? AND train_no = ? LIMIT 1`,
                [working_date, direction, train_no]
            );
            if (prior.length) {
                locosBefore = [prior[0].actual_loco_no, prior[0].actual_loco_no_rear]
                    .filter(Boolean)
                    .map(v => String(v).includes('+') ? String(v).split('+')[0].trim() : String(v).trim());
            }
        } catch (e) {
            console.warn('[loco-link POST /log] prior-loco read failed:', e.message);
        }

        // UPSERT
        const [result] = await pool.query(
            `INSERT INTO div_loco_link_log
                (working_date, direction, train_no, train_id, train_no_snapshot, master_id, sheet_source, section, event_time, from_station, to_station,
                 actual_loco_no, main_loco_dead, failed_in_division,
                 actual_loco_no_rear, secondary_role,
                 base_shed, base_shed_rear,
                 loco_type, loco_type_rear, traction_type,
                 hog, incoming_train, outgoing_train, outgoing_train_rear,
                 expected_shed, is_mislink, is_mislink_rear,
                 remark, remarks_rear, entered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                train_id             = VALUES(train_id),
                train_no_snapshot    = VALUES(train_no_snapshot),
                master_id            = VALUES(master_id),
                sheet_source         = VALUES(sheet_source),
                section              = VALUES(section),
                event_time           = VALUES(event_time),
                from_station         = VALUES(from_station),
                to_station           = VALUES(to_station),
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
            [working_date, direction, train_no, train_id, train_no_snapshot, master_id, sheet_source, section, log_event_time, log_from_station, log_to_station,
             actual_loco_no, main_loco_dead, failed_in_division,
             actual_loco_no_rear, secondary_role,
             base_shed, base_shed_rear,
             loco_type, loco_type_rear, traction_type,
             hog, incoming_train, outgoing_train, outgoing_train_rear,
             expected_shed, is_mislink, is_mislink_rear,
             remark, remarks_rear, u.username]
        );

        // ── Write loco maintenance schedule back to the master ────────────
        // Latest entry wins, keyed on loco_number, so it auto-fills next time
        // this loco is entered on any sheet/date. Only writes when a value was
        // provided (blank inputs won't wipe an existing schedule). Best-effort:
        // a failure here must not fail the already-saved log entry. Rear uses
        // the first loco of a coupler "A+B" (rearLookup, computed above).
        async function saveSchedule(locoNo, sType, sDue) {
            if (!locoNo) return;
            if (sType === null && sDue === null) return;
            try {
                await pool.query(
                    `UPDATE div_locos
                        SET schedule_type = ?, schedule_due_date = ?,
                            schedule_updated_by = ?, schedule_updated_at = NOW()
                      WHERE loco_number = ?`,
                    [sType, sDue, u.username, locoNo]
                );
            } catch (e) {
                console.error('[loco-link POST /log] schedule write-back failed for', locoNo, e.message);
            }
        }
        await saveSchedule(actual_loco_no, schedule_type, schedule_due_date);
        await saveSchedule(rearLookup, schedule_type_rear, schedule_due_date_rear);

        // ── Cross-direction propagation with day-change logic ────────────
        // If LPC filled outgoing_train (DN-bound from this loco) → auto-fill
        // the corresponding DN train's log with this same loco.
        // Same for incoming_train → fills the UP train's log.
        // Only propagates when target log has no actual_loco_no yet
        // (won't overwrite an existing assignment).
        //
        // Day-change rule: if target train's event_time < source train's event_time,
        // the target belongs to the next calendar day.
        // LPC can override this via outgoing_date_override / outgoing_date_override_rear.
        const propagated = [];
        const sourceEventTime = master ? master.event_time : null;

        async function propagateLoco(targetTrainNo, targetDirection, locoNo, sourceTrainNo, dateOverride) {
            if (!locoNo || !targetTrainNo) return;
            const tn = String(targetTrainNo).trim();
            if (!tn) return;
            // Skip self-references
            if (tn === train_no && targetDirection === direction) return;

            // Find target master row (must be active) — includes event_time for day-change calc
            // and effective-date columns for JS-side schedule filtering below.
            const [masters] = await pool.query(
                `SELECT id, sheet_source, section, shed_code, expected_hog, run_days, event_time,
                        effective_from, effective_until, skip_dates
                 FROM div_loco_link_master
                 WHERE train_no = ? AND direction = ? AND active = 1`,
                [tn, targetDirection]
            );
            if (!masters.length) {
                propagated.push({ train_no: tn, direction: targetDirection, status: 'no_master' });
                return;
            }

            // Calculate target date using time comparison (or use override if provided)
            const targetEventTime = masters[0].event_time;
            let targetDate, isNextDay;
            if (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
                targetDate = dateOverride;
                isNextDay = targetDate !== working_date;
            } else {
                const result = computeTargetDate(working_date, sourceEventTime, targetEventTime);
                targetDate = result.targetDate;
                isNextDay = result.isNextDay;
            }

            // Check if target train runs on the computed target date AND
            // the schedule is active on that date (effective range + skip_dates)
            const dow2 = dayOfWeekIR(targetDate);
            const tgtMaster = masters.find(m =>
                runsToday(m.run_days, dow2) && effectiveOnDate(m, targetDate)
            );
            if (!tgtMaster) {
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'no_run_on_target_date',
                    target_date: targetDate,
                    is_next_day: isNextDay,
                    day_of_week: dow2,
                });
                return;
            }

            // Check existing log for the target date
            const [existing] = await pool.query(
                `SELECT id, actual_loco_no, incoming_train, outgoing_train FROM div_loco_link_log
                 WHERE working_date = ? AND train_no = ? AND direction = ?
                 LIMIT 1`,
                [targetDate, tn, targetDirection]
            );
            if (existing.length && existing[0].actual_loco_no && existing[0].actual_loco_no !== locoNo) {
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'conflict_skipped',
                    existing_loco: existing[0].actual_loco_no,
                    target_date: targetDate,
                    is_next_day: isNextDay,
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

            // Resolve the propagated train's stable identity (as of its own date)
            const tgtResolved = await resolveTrainByNo(pool, tn, targetDate);
            const tgtTrainId = tgtResolved ? tgtResolved.train_id : null;

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
                         train_id = COALESCE(train_id, ?),
                         train_no_snapshot = COALESCE(train_no_snapshot, ?),
                         ${reverseField} = ?
                     WHERE id = ?`,
                    [locoNo, tgtBase, tgtType, tgtTraction, tgtExpected, tgtMislink,
                     tgtTrainId, tn,
                     newReverse, existing[0].id]
                );
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'updated', id: existing[0].id, loco_no: locoNo,
                    reverse_field: reverseField, reverse_train: newReverse,
                    target_date: targetDate, is_next_day: isNextDay,
                });
            } else {
                // Insert new log row with propagated snapshot + reverse pointer
                const [ins] = await pool.query(
                    `INSERT INTO div_loco_link_log
                        (working_date, direction, train_no, train_id, train_no_snapshot, master_id, sheet_source, section,
                         actual_loco_no, base_shed, loco_type, traction_type,
                         expected_shed, is_mislink, ${reverseField}, entered_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [targetDate, targetDirection, tn, tgtTrainId, tn, tgtMaster.id,
                     tgtMaster.sheet_source, tgtMaster.section,
                     locoNo, tgtBase, tgtType, tgtTraction,
                     tgtExpected, tgtMislink, newReverse, u.username]
                );
                propagated.push({
                    train_no: tn, direction: targetDirection,
                    status: 'inserted', id: ins.insertId, loco_no: locoNo,
                    reverse_field: reverseField, reverse_train: newReverse,
                    target_date: targetDate, is_next_day: isNextDay,
                });
            }
        }

        // UP/Bypass log with outgoing_train set → propagate to DN train log
        if (outgoing_train && actual_loco_no) {
            await propagateLoco(outgoing_train, 'DN', actual_loco_no, train_no, outgoing_date_override);
        }
        // DN log with incoming_train set → propagate to UP train log
        if (incoming_train && actual_loco_no) {
            await propagateLoco(incoming_train, 'UP', actual_loco_no, train_no, null);
        }
        // Rear loco can also have an outgoing → DN target
        if (outgoing_train_rear && actual_loco_no_rear) {
            // For coupler-as-assist ("X+Y"), propagate the first part
            const rearLocoForProp = actual_loco_no_rear.includes('+')
                ? actual_loco_no_rear.split('+')[0].trim()
                : actual_loco_no_rear;
            await propagateLoco(outgoing_train_rear, 'DN', rearLocoForProp, train_no, outgoing_date_override_rear);
        }

        // ── Loco Position Update ──────────────────────────────────────────
        // Track loco positions at Mumbai terminals based on train direction:
        // - UP trains: loco arrives at terminal (CSMT/LTT/DR/PNVL) → set position
        // - DN trains: loco departs division → mark as OUT_OF_DIV
        // - BYPASS: no position change (locos pass through)
        // - Loco-change trains (e.g., 22149/22150): Both directions → loco available at locoChangeStation
        const positionUpdates = [];
        if (actual_loco_no && direction !== 'BYPASS') {
            try {
                const { terminal, locoChangeStation } = await getTrainTerminal(pool, train_no, direction);

                // If train has loco_change_station, incoming loco becomes available there (both UP and DN)
                if (locoChangeStation && MUMBAI_TERMINALS.includes(locoChangeStation)) {
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: actual_loco_no,
                        location: stablingTerminal(locoChangeStation),
                        movementType: 'ARRIVAL',
                        trainNo: train_no,
                        workingDate: working_date,
                        remarks: `loco change at ${locoChangeStation}`,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: actual_loco_no, ...posResult });
                } else if (direction === 'UP') {
                    // UP train arriving — set position to terminal (or OUT_OF_DIV for handover points)
                    const location = MUMBAI_TERMINALS.includes(terminal) ? stablingTerminal(terminal) : 'OUT_OF_DIV';
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: actual_loco_no,
                        location,
                        movementType: 'ARRIVAL',
                        trainNo: train_no,
                        workingDate: working_date,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: actual_loco_no, ...posResult });
                } else if (direction === 'DN') {
                    // DN train departing — loco leaving the division
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: actual_loco_no,
                        location: 'OUT_OF_DIV',
                        movementType: 'DEPARTURE',
                        trainNo: train_no,
                        workingDate: working_date,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: actual_loco_no, ...posResult });
                }
            } catch (posErr) {
                // Position tracking errors should not fail the main log save
                console.warn('[loco-link POST /log] position update error:', posErr.message);
            }
        }

        // Handle rear loco position (for push-pull or coupler)
        if (actual_loco_no_rear && direction !== 'BYPASS') {
            try {
                // For coupler-as-assist ("X+Y"), track first part only
                const rearLocoForPos = actual_loco_no_rear.includes('+')
                    ? actual_loco_no_rear.split('+')[0].trim()
                    : actual_loco_no_rear;
                const { terminal, locoChangeStation } = await getTrainTerminal(pool, train_no, direction);

                // If train has loco_change_station, incoming loco becomes available there (both UP and DN)
                if (locoChangeStation && MUMBAI_TERMINALS.includes(locoChangeStation)) {
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: rearLocoForPos,
                        location: stablingTerminal(locoChangeStation),
                        movementType: 'ARRIVAL',
                        trainNo: train_no,
                        workingDate: working_date,
                        remarks: `rear loco, loco change at ${locoChangeStation}`,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: rearLocoForPos, ...posResult });
                } else if (direction === 'UP') {
                    const location = MUMBAI_TERMINALS.includes(terminal) ? stablingTerminal(terminal) : 'OUT_OF_DIV';
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: rearLocoForPos,
                        location,
                        movementType: 'ARRIVAL',
                        trainNo: train_no,
                        workingDate: working_date,
                        remarks: `rear loco (${secondary_role || 'rear'})`,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: rearLocoForPos, ...posResult });
                } else if (direction === 'DN') {
                    const posResult = await updateLocoPosition(pool, {
                        locoNo: rearLocoForPos,
                        location: 'OUT_OF_DIV',
                        movementType: 'DEPARTURE',
                        trainNo: train_no,
                        workingDate: working_date,
                        remarks: `rear loco (${secondary_role || 'rear'})`,
                        userId: u.username,
                    });
                    if (posResult.success) positionUpdates.push({ loco: rearLocoForPos, ...posResult });
                }
            } catch (posErr) {
                console.warn('[loco-link POST /log] rear position update error:', posErr.message);
            }
        }

        // ── Dropped-loco position restore ─────────────────────────────────
        // Any loco that was on this row and no longer is has been taken off the
        // train. It is still standing at the terminal, so undo the departure we
        // wrote for it earlier. A loco that only moved front → rear (failed and
        // towed dead) is still present here, so it is not treated as dropped.
        const restored = [];
        if (locosBefore.length && direction === 'DN') {
            const rearNow = actual_loco_no_rear && actual_loco_no_rear.includes('+')
                ? actual_loco_no_rear.split('+')[0].trim()
                : actual_loco_no_rear;
            const locosNow = [actual_loco_no, rearNow].filter(Boolean).map(v => String(v).trim());
            for (const gone of locosBefore) {
                if (locosNow.includes(gone)) continue;
                try {
                    const r = await restoreDroppedLocoPosition(pool, {
                        locoNo: gone, trainNo: train_no,
                        workingDate: working_date, userId: u.username,
                    });
                    if (r.success) restored.push({ loco: gone, ...r });
                } catch (e) {
                    console.warn('[loco-link POST /log] position restore failed for', gone, e.message);
                }
            }
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
            position_updates: positionUpdates,
            position_restored: restored,
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

// ─── LOCO POSITION TRACKING ──────────────────────────────────────────────

// GET /positions — list locos by location (grouped) or at a specific location
//   Query params: location=CSMT (optional), all=true to get all
router.get('/positions', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const location = String(req.query.location || '').trim().toUpperCase();
    const all = req.query.all === 'true' || req.query.all === '1';

    try {
        const pool = req.app.locals.pool;
        let sql, params;

        if (location && VALID_LOCATIONS.includes(location)) {
            sql = `SELECT lp.*, dl.loco_type, dl.home_shed, dl.railway_zone
                   FROM div_loco_positions lp
                   LEFT JOIN div_locos dl ON lp.loco_number = dl.loco_number
                   WHERE lp.current_location = ?
                   ORDER BY lp.arrived_at DESC`;
            params = [location];
        } else if (all) {
            sql = `SELECT lp.*, dl.loco_type, dl.home_shed, dl.railway_zone
                   FROM div_loco_positions lp
                   LEFT JOIN div_locos dl ON lp.loco_number = dl.loco_number
                   ORDER BY lp.current_location, lp.arrived_at DESC`;
            params = [];
        } else {
            // Return grouped by location (summary for dashboard)
            const [rows] = await pool.query(
                `SELECT lp.current_location, COUNT(*) AS count,
                        GROUP_CONCAT(lp.loco_number ORDER BY lp.arrived_at DESC SEPARATOR ',') AS locos
                 FROM div_loco_positions lp
                 WHERE lp.current_location IN (?)
                 GROUP BY lp.current_location`,
                [MUMBAI_TERMINALS]
            );
            const grouped = {};
            for (const loc of MUMBAI_TERMINALS) {
                grouped[loc] = { count: 0, locos: [] };
            }
            for (const r of rows) {
                grouped[r.current_location] = {
                    count: r.count,
                    locos: r.locos ? r.locos.split(',') : [],
                };
            }
            return res.json({ grouped, terminals: MUMBAI_TERMINALS });
        }

        const [rows] = await pool.query(sql, params);
        res.json({ location: location || 'all', total: rows.length, rows });
    } catch (err) {
        if (isTableNotExistError(err)) {
            return res.json({ location: location || 'all', total: 0, rows: [], error: 'tables_not_created' });
        }
        console.error('[loco-link GET /positions]', err);
        res.status(500).json({ error: 'Failed to load positions' });
    }
});

// POST /position — manually move a loco between terminals
//   Body: { loco_number, to_location, remarks? }
router.post('/position', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const b = req.body || {};

    const locoNo = String(b.loco_number || '').trim();
    const toLocation = String(b.to_location || '').trim().toUpperCase();
    const remarks = b.remarks ? String(b.remarks).trim().slice(0, 255) : null;

    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    if (!toLocation || !VALID_LOCATIONS.includes(toLocation)) {
        return res.status(400).json({ error: `invalid to_location; must be one of: ${VALID_LOCATIONS.join(', ')}` });
    }

    try {
        const pool = req.app.locals.pool;
        const result = await updateLocoPosition(pool, {
            locoNo,
            location: toLocation,
            movementType: 'MANUAL',
            remarks,
            userId: u.username,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error || 'Move failed' });
        }

        res.json({
            ok: true,
            loco_number: locoNo,
            from_location: result.from_location,
            to_location: result.to_location,
            moved_at: result.moved_at,
        });
    } catch (err) {
        console.error('[loco-link POST /position]', err);
        res.status(500).json({ error: 'Move failed' });
    }
});

// GET /position/:loco_number — current position of a specific loco
router.get('/position/:loco_number', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });

    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT lp.*, dl.loco_type, dl.home_shed, dl.railway_zone
             FROM div_loco_positions lp
             LEFT JOIN div_locos dl ON lp.loco_number = dl.loco_number
             WHERE lp.loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (!rows.length) {
            return res.json({ loco_number: locoNo, position: null, message: 'No position recorded' });
        }
        res.json({ loco_number: locoNo, position: rows[0] });
    } catch (err) {
        if (isTableNotExistError(err)) {
            return res.json({ loco_number: locoNo, position: null, error: 'tables_not_created' });
        }
        console.error('[loco-link GET /position/:n]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// GET /position/:loco_number/history — movement history for a loco
router.get('/position/:loco_number/history', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT * FROM div_loco_position_history
             WHERE loco_number = ?
             ORDER BY moved_at DESC
             LIMIT ?`,
            [locoNo, limit]
        );
        res.json({ loco_number: locoNo, total: rows.length, rows });
    } catch (err) {
        if (isTableNotExistError(err)) {
            return res.json({ loco_number: locoNo, total: 0, rows: [], error: 'tables_not_created' });
        }
        console.error('[loco-link GET /position/:n/history]', err);
        res.status(500).json({ error: 'History lookup failed' });
    }
});

// GET /available — locos available for DN train assignment at a terminal
//   Query params: terminal=CSMT (required)
router.get('/available', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const terminal = String(req.query.terminal || '').trim().toUpperCase();

    if (!terminal || !MUMBAI_TERMINALS.includes(terminal)) {
        return res.status(400).json({ error: `terminal required; must be one of: ${MUMBAI_TERMINALS.join(', ')}` });
    }

    try {
        const pool = req.app.locals.pool;
        const today = todayISO();

        // Locos at the terminal that are:
        // 1. Not sick
        // 2. Not already booked out on a DN train (see BOOKED_OUT_EXISTS)
        const [rows] = await pool.query(
            `SELECT lp.loco_number, lp.arrived_via_train, lp.arrived_at, lp.remarks,
                    dl.loco_type, dl.home_shed, dl.railway_zone, dl.hotel_load_oem
             FROM div_loco_positions lp
             LEFT JOIN div_locos dl ON lp.loco_number = dl.loco_number
             LEFT JOIN div_loco_sick_records sr
                ON lp.loco_number = sr.loco_number AND sr.fit_from IS NULL
             WHERE lp.current_location = ?
               AND sr.id IS NULL
               AND NOT EXISTS (${BOOKED_OUT_EXISTS})
             ORDER BY lp.arrived_at ASC`,
            [terminal]
        );

        res.json({
            terminal,
            date: today,
            total: rows.length,
            locos: rows,
        });
    } catch (err) {
        if (isTableNotExistError(err)) {
            return res.json({ terminal, date: todayISO(), total: 0, locos: [], error: 'tables_not_created' });
        }
        console.error('[loco-link GET /available]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// GET /assign-board — the loco-first view of a terminal's DN workings.
//
// The daily sheet is train-first: you walk the trains and fill in a loco. This
// is the inverse — you see the locos standing at a terminal and give each one a
// train. It answers the question the sheet cannot: how many locos do I have,
// how many workings still need one, and how many will be left over.
//
// Writes go through POST /log exactly as the sheet does, so the DN sheet fills
// itself and propagation, position tracking and the duplicate-loco guard all
// apply unchanged. This endpoint is read-only.
//
//   Query: terminal=CSMT (required), date=YYYY-MM-DD (defaults to today)
router.get('/assign-board', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });

    const terminal = String(req.query.terminal || '').trim().toUpperCase();
    const date = String(req.query.date || todayISO()).trim();

    if (!terminal || !MUMBAI_TERMINALS.includes(terminal)) {
        return res.status(400).json({ error: `terminal required; one of: ${MUMBAI_TERMINALS.join(', ')}` });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }

    try {
        const pool = req.app.locals.pool;

        // ── Locos standing here and free to work ──────────────────────────
        // Deliberately NOT filtered by arrival date: a loco that came in three
        // days ago is just as assignable as one that arrived this morning. The
        // date on this page picks which DN sheet is being filled, nothing else.
        // VVH and DR are one stabling group: locos off DR-terminating trains run
        // light to VVH for maintenance and light back to DR to attach. Locos are
        // occasionally held at DR itself and worked out from there, so the VVH
        // board must list them too — otherwise, with DR workings shown here, a
        // DR-standing loco could not be assigned from any board.
        const sourceLocations = terminal === 'VVH' ? ['VVH', 'DR'] : [terminal];

        const [locoRows] = await pool.query(
            `SELECT lp.loco_number, lp.current_location, lp.arrived_via_train, lp.arrived_at, lp.remarks AS pos_remarks,
                    dl.loco_type, dl.home_shed, dl.railway_zone, dl.hotel_load_oem,
                    dl.schedule_type, dl.schedule_due_date,
                    DATEDIFF(CURDATE(), DATE(lp.arrived_at))    AS days_standing,
                    DATEDIFF(dl.schedule_due_date, CURDATE())   AS sched_days_left
             FROM div_loco_positions lp
             LEFT JOIN div_locos dl ON dl.loco_number = lp.loco_number
             LEFT JOIN div_loco_sick_records sr
                    ON sr.loco_number = lp.loco_number AND sr.fit_from IS NULL
             WHERE lp.current_location IN (?)
               AND sr.id IS NULL
               AND NOT EXISTS (${BOOKED_OUT_EXISTS})
             ORDER BY lp.arrived_at ASC`,
            [sourceLocations]
        );

        // Where a loco was moved in by hand there is no arrival train, so show
        // where it came from instead ("moved from VVH") rather than a blank.
        const movedIn = locoRows.filter(l => !l.arrived_via_train).map(l => l.loco_number);
        const movedFrom = new Map();
        if (movedIn.length) {
            const [mv] = await pool.query(
                `SELECT h.loco_number, h.from_location
                 FROM div_loco_position_history h
                 JOIN (SELECT loco_number, MAX(moved_at) AS mx
                       FROM div_loco_position_history
                       WHERE loco_number IN (?) AND to_location IN (?)
                       GROUP BY loco_number) last
                   ON last.loco_number = h.loco_number AND last.mx = h.moved_at
                 WHERE h.to_location IN (?)`,
                [movedIn, sourceLocations, sourceLocations]
            );
            for (const r of mv) movedFrom.set(r.loco_number, r.from_location);
        }

        const locos = locoRows.map(l => ({
            loco_number: l.loco_number,
            // Surfaced so a loco held at DR rather than VVH is visibly different
            // on the board, not silently listed as if it were at the shed.
            standing_at: l.current_location,
            off_terminal: l.current_location !== terminal,
            loco_type: l.loco_type,
            home_shed: l.home_shed,
            railway_zone: l.railway_zone,
            hotel_load_oem: l.hotel_load_oem,
            is_hog: !!l.hotel_load_oem,
            schedule_type: l.schedule_type,
            schedule_due_date: toDateISO(l.schedule_due_date),
            sched_days_left: l.sched_days_left,
            arrived_via_train: l.arrived_via_train,
            arrived_at: l.arrived_at,
            days_standing: l.days_standing,
            moved_from: l.arrived_via_train ? null : (movedFrom.get(l.loco_number) || null),
        }));

        // ── DN workings departing this terminal on the chosen date ────────
        const dow = dayOfWeekIR(date);
        const eff = effectiveOnDateClause(date);
        const [masterRows] = await pool.query(
            `SELECT m.id, m.train_no, COALESCE(t.train_name, m.train_name) AS train_name,
                    m.event_time, m.section, m.sheet_source, m.from_station, m.to_station,
                    m.shed_code AS expected_shed, m.expected_hog, m.link_attr,
                    m.expected_loco_type, m.rake_type, m.is_push_pull, m.run_days
             FROM div_loco_link_master m
             LEFT JOIN div_trains t ON t.train_no = m.train_no
             WHERE m.active = 1 AND m.direction = 'DN' AND m.is_bypass = 0
               AND ${eff.sql.replace(/\b(effective_from|effective_until|skip_dates)\b/g, 'm.$1')}
             ORDER BY m.event_time, m.id`,
            eff.params
        );

        // from_station is free text and inconsistent ("LTT / LTT", "BIRD/ BIRD"),
        // so normalise it and fall back to the sheet name when it is unusable.
        // Mapped through stablingTerminal so a DR-originating working appears on
        // the VVH board — that is where its locos actually stand. Without this
        // the DR board would list workings it can never have a loco for.
        const originOf = (m) => {
            const norm = normalizeTerminal(m.from_station);
            if (norm) return stablingTerminal(norm);
            const prefix = String(m.sheet_source || '').split('-')[0];
            return MUMBAI_TERMINALS.includes(prefix) ? stablingTerminal(prefix) : null;
        };
        const mine = masterRows.filter(m => runsToday(m.run_days, dow) && originOf(m) === terminal);

        // ── What is already entered on that date ──────────────────────────
        const ids = mine.map(m => m.id);
        const logByMaster = new Map();
        if (ids.length) {
            const [logs] = await pool.query(
                // Every column the board may need to echo back on save. POST /log
                // overwrites the whole row, so anything the sheet already entered
                // (incoming train, remarks) must travel back with the assignment
                // or it is silently wiped.
                `SELECT master_id, train_no, actual_loco_no, actual_loco_no_rear,
                        secondary_role, main_loco_dead, failed_in_division,
                        incoming_train, outgoing_train, outgoing_train_rear,
                        remark, remarks_rear, entered_by
                 FROM div_loco_link_log
                 WHERE working_date = ? AND direction = 'DN' AND master_id IN (?)`,
                [date, ids]
            );
            for (const r of logs) logByMaster.set(r.master_id, r);
        }

        const trains = mine.map(m => {
            const log = logByMaster.get(m.id) || null;
            // A push-pull working needs a loco at each end. With only the front
            // filled it is NOT complete — it still needs a second, and the board
            // must say so rather than showing it green and done.
            const hasFront = !!(log && log.actual_loco_no);
            const hasRear = !!(log && log.actual_loco_no_rear);
            const needsSecond = m.is_push_pull === 1 && hasFront && !hasRear;
            return {
                master_id: m.id,
                train_no: m.train_no,
                train_name: m.train_name,
                event_time: m.event_time,
                section: m.section,
                sheet_source: m.sheet_source,
                to_station: m.to_station,
                expected_shed: m.expected_shed,
                expected_hog: m.expected_hog === 1,
                expected_loco_type: m.expected_loco_type,
                link_attr: m.link_attr,
                rake_type: m.rake_type,
                is_push_pull: m.is_push_pull === 1,
                actual_loco_no: log ? log.actual_loco_no : null,
                actual_loco_no_rear: log ? log.actual_loco_no_rear : null,
                secondary_role: log ? log.secondary_role : null,
                main_loco_dead: log ? !!log.main_loco_dead : false,
                failed_in_division: log ? !!log.failed_in_division : false,
                incoming_train: log ? log.incoming_train : null,
                outgoing_train: log ? log.outgoing_train : null,
                outgoing_train_rear: log ? log.outgoing_train_rear : null,
                remark: log ? log.remark : null,
                remarks_rear: log ? log.remarks_rear : null,
                entered_by: log ? log.entered_by : null,
                assigned: hasFront,
                needs_second: needsSecond,
            };
        });

        // Open slots, not open trains: a push-pull working with one loco still
        // consumes another. Counting trains would understate the requirement.
        const needFirst = trains.filter(t => !t.assigned).length;
        const needSecond = trains.filter(t => t.needs_second).length;
        const openSlots = needFirst + needSecond;

        res.json({
            terminal, date,
            locos, trains,
            counts: {
                available: locos.length,
                trains_total: trains.length,
                trains_assigned: trains.length - needFirst,
                trains_unassigned: needFirst,
                need_second: needSecond,
                open_slots: openSlots,
                spare: locos.length - openSlots,
            },
        });
    } catch (err) {
        if (isTableNotExistError(err)) {
            return res.json({ terminal, date, locos: [], trains: [], counts: null, error: 'tables_not_created' });
        }
        console.error('[loco-link GET /assign-board]', err);
        res.status(500).json({ error: 'Failed to load assignment board' });
    }
});

// GET /assigned-today — locos standing at a terminal that are already booked
// out on a DN train (for the availability page).
//
// "today" in the name is historical: this used to filter working_date = today,
// which hid every booking made on the arrival day or for tomorrow's departure —
// the bulk of them. It now reports each loco's earliest live DN booking along
// with the train and date, so the page can say WHICH train has it.
router.get('/assigned-today', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });

    try {
        const pool = req.app.locals.pool;

        const [rows] = await pool.query(
            `SELECT lp.loco_number, ll.train_no, ll.working_date,
                    CASE WHEN ll.actual_loco_no = lp.loco_number
                         THEN 'front' ELSE 'rear' END AS role
             FROM div_loco_positions lp
             JOIN div_loco_link_log ll
               ON ll.direction = 'DN'
              AND ll.working_date >= COALESCE(DATE(lp.arrived_at), CURDATE())
              AND (ll.actual_loco_no = lp.loco_number
                   OR FIND_IN_SET(lp.loco_number,
                                  REPLACE(REPLACE(ll.actual_loco_no_rear, ' ', ''), '+', ',')) > 0)
             ORDER BY lp.loco_number, ll.working_date ASC, ll.train_no ASC`
        );

        // A loco can carry several bookings (e.g. today's and tomorrow's link).
        // Keep the earliest — that is the one that takes it out of the pool.
        const assignments = {};
        for (const r of rows) {
            if (assignments[r.loco_number]) continue;
            assignments[r.loco_number] = {
                train_no: r.train_no,
                working_date: toDateISO(r.working_date),
                role: r.role,
            };
        }

        const locos = Object.keys(assignments);
        res.json({ date: todayISO(), total: locos.length, locos, assignments });
    } catch (err) {
        console.error('[loco-link GET /assigned-today]', err);
        res.status(500).json({ error: 'Lookup failed' });
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
        // Loco-type mismatch (front only): the link expects e.g. WAP7 but a
        // different, non-accepted type ran. expected_loco_type may be "WAP 7"
        // while div_locos.loco_type is "WAP7", so normalise (strip spaces, upper).
        // FIND_IN_SET against the normalised accepted_loco_types treats listed
        // alternatives as OK.
        const typeMismatchSql = (typeCol) => `(
            m.expected_loco_type IS NOT NULL AND m.expected_loco_type <> ''
            AND l.${typeCol} IS NOT NULL AND l.${typeCol} <> ''
            AND REPLACE(UPPER(l.${typeCol}),' ','') <> REPLACE(UPPER(m.expected_loco_type),' ','')
            AND (m.accepted_loco_types IS NULL OR m.accepted_loco_types = ''
                 OR FIND_IN_SET(REPLACE(UPPER(l.${typeCol}),' ',''), REPLACE(UPPER(m.accepted_loco_types),' ','')) = 0)
        )`;

        function build(positionLabel, lcol, shedCol, mlCol, typeCol, checkType) {
            const flag = checkType ? `(l.${mlCol} = 1 OR ${typeMismatchSql(typeCol)})` : `l.${mlCol} = 1`;
            const conds = [flag, 'l.working_date BETWEEN ? AND ?'];
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
                             l.${mlCol} AS is_shed_mislink,
                             '${positionLabel}' AS position,
                             m.expected_loco_type, m.accepted_loco_types,
                             l.entered_by, l.updated_at
                      FROM div_loco_link_log l
                      LEFT JOIN div_loco_link_master m ON m.id = l.master_id
                      WHERE ${conds.join(' AND ')}`,
                params,
            };
        }

        const front = build('front', 'actual_loco_no',      'base_shed',      'is_mislink',      'loco_type',      true);
        const rear  = build('rear',  'actual_loco_no_rear', 'base_shed_rear', 'is_mislink_rear', 'loco_type_rear', false);
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
        // Alias-aware: resolve the typed number → train_id so the report shows
        // the train's full history across every number it ever ran under
        // (log rows carry train_id, backfilled in the architecture rebuild).
        // Falls back to literal train_no for uncatalogued specials (train_id NULL).
        const resolved = await resolveTrainByNo(pool, trainNo);
        const trainId = resolved ? resolved.train_id : null;
        const [rows] = await pool.query(
            `SELECT working_date, train_no, train_no_snapshot, direction, sheet_source, section,
                    actual_loco_no, base_shed, loco_type,
                    actual_loco_no_rear, base_shed_rear,
                    expected_shed, is_mislink, is_mislink_rear,
                    hog, incoming_train, outgoing_train, remark, entered_by
             FROM div_loco_link_log
             WHERE ${trainId ? '(train_id = ? OR train_no = ?)' : 'train_no = ?'}
             ORDER BY working_date DESC, direction
             LIMIT ?`,
            trainId ? [trainId, trainNo, limit] : [trainNo, limit]
        );
        res.json({
            train_no: trainNo,
            train_id: trainId,
            current_train_no: resolved ? resolved.current_train_no : trainNo,
            total: rows.length,
            rows,
        });
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
            'SELECT id, loco_number, fit_from, status FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        if (!exists.length) return res.status(404).json({ error: 'record not found' });
        if (exists[0].fit_from) return res.status(400).json({ error: 'cannot update a closed (fit) record' });

        // If LPC is finalizing a H/O (handed over to another division):
        // when both status='H/O' AND hoc_date are present, close the record
        // by setting fit_from = hoc_date. This removes it from the "still sick"
        // list (GET /sick filters by fit_from IS NULL).
        // We check whether hoc_date will be set after this PATCH — either it's
        // in the current update payload, or it's already on the record.
        const willHaveHocDate =
            ('hoc_date' in updates && updates.hoc_date) ||
            (!('hoc_date' in updates) && exists[0].hoc_date);
        const willBeHO =
            (updates.status === 'H/O') ||
            (!('status' in updates) && exists[0].status === 'H/O');

        if (willBeHO && willHaveHocDate && !exists[0].fit_from) {
            updates.fit_from = ('hoc_date' in updates ? updates.hoc_date : exists[0].hoc_date);
        }

        const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const params = [...Object.values(updates), id];
        await pool.query(`UPDATE div_loco_sick_records SET ${sets} WHERE id = ?`, params);

        // If status changed to H/O (handed over), update loco position to OUT_OF_DIV
        let positionUpdate = null;
        if (updates.status === 'H/O' && exists[0].status !== 'H/O') {
            const u = req.session.user;
            positionUpdate = await updateLocoPosition(pool, {
                locoNo: exists[0].loco_number,
                location: 'OUT_OF_DIV',
                movementType: 'MANUAL',
                remarks: 'Handed over (sick loco)',
                userId: u.username,
            });
        }

        const [updated] = await pool.query(
            'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        res.json({ ok: true, record: updated[0], position_update: positionUpdate });
    } catch (err) {
        console.error('[loco-link PATCH /sick/:id]', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// PATCH /sick/:id/fit — close an open sick record (mark loco fit/RDY)
//   body: { fit_from?, ready_time?, fit_remarks?, handed_over?, ready_at_shed? }
//   If handed_over=true, marks status as H/O and loco as OUT_OF_DIV
//   ready_at_shed: Terminal where loco is now available (if sick location was custom/unknown)
router.patch('/sick/:id/fit', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });

    const b = req.body || {};
    const fit_from = cleanDate(b.fit_from) || todayISO();
    const ready_time = cleanTime(b.ready_time);
    const fit_remarks = cleanStrSick(b.fit_remarks, 255);
    const handed_over = b.handed_over === true || b.handed_over === 'true' || b.handed_over === 1;
    const ready_at_shed = b.ready_at_shed ? String(b.ready_at_shed).toUpperCase().trim() : null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fit_from)) return res.status(400).json({ error: 'fit_from must be YYYY-MM-DD' });

    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT id, loco_number, fit_from, sick_from, sick_at_shed, current_location
             FROM div_loco_sick_records WHERE id = ? LIMIT 1`, [id]
        );
        if (!rows.length) return res.status(404).json({ error: 'sick record not found' });
        const rec = rows[0];
        const alreadyFit = !!rec.fit_from;

        // If already fit but ready_at_shed provided, just update position (allow correction)
        if (alreadyFit && ready_at_shed && MUMBAI_TERMINALS.includes(ready_at_shed)) {
            const positionUpdate = await updateLocoPosition(pool, {
                locoNo: rec.loco_number,
                location: ready_at_shed,
                movementType: 'MANUAL',
                remarks: 'Ready location corrected after sick repair',
                userId: u.username,
            });
            const [updated] = await pool.query(
                'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
            );
            return res.json({
                ok: true,
                record: updated[0],
                position_update: positionUpdate,
                available_at: ready_at_shed,
            });
        }

        if (alreadyFit) {
            return res.status(400).json({ error: 'Loco already marked fit', fit_from: rec.fit_from });
        }
        const sickFromStr = rec.sick_from instanceof Date
            ? rec.sick_from.toISOString().slice(0, 10)
            : String(rec.sick_from).slice(0, 10);
        if (fit_from < sickFromStr) {
            return res.status(400).json({ error: `fit_from cannot be before sick_from (${sickFromStr})` });
        }

        const newStatus = handed_over ? 'H/O' : 'RDY';
        await pool.query(
            `UPDATE div_loco_sick_records
             SET fit_from = ?, ready_time = ?, fitted_by = ?, fit_remarks = ?, status = ?
             WHERE id = ?`,
            [fit_from, ready_time, u.username, fit_remarks, newStatus, id]
        );

        // Update loco position based on status
        const locoNo = rec.loco_number;
        const sickLocationRaw = rec.current_location || rec.sick_at_shed || '';
        // Normalize location: "VVH TS" → "VVH", "csmt" → "CSMT", "LTT ELS" → "LTT"
        const normalizedLocation = normalizeTerminal(sickLocationRaw);
        // Use ready_at_shed if provided, otherwise use normalized sick location
        const availableAt = (ready_at_shed && MUMBAI_TERMINALS.includes(ready_at_shed))
            ? ready_at_shed
            : normalizedLocation;
        let positionUpdate = null;
        let needsShedInput = false;

        if (handed_over) {
            // Handed over — mark as OUT_OF_DIV
            positionUpdate = await updateLocoPosition(pool, {
                locoNo,
                location: 'OUT_OF_DIV',
                movementType: 'MANUAL',
                remarks: 'Handed over after sick repair',
                userId: u.username,
            });
        } else if (availableAt && MUMBAI_TERMINALS.includes(availableAt)) {
            // Ready at a Mumbai terminal — make available
            positionUpdate = await updateLocoPosition(pool, {
                locoNo,
                location: availableAt,
                movementType: 'MANUAL',
                remarks: 'Ready after sick repair',
                userId: u.username,
            });
        } else {
            // Location not recognized — flag that shed input is needed
            needsShedInput = true;
        }

        const [updated] = await pool.query(
            'SELECT * FROM div_loco_sick_records WHERE id = ? LIMIT 1', [id]
        );
        res.json({
            ok: true,
            record: updated[0],
            position_update: positionUpdate,
            needs_shed_input: needsShedInput,
            available_at: availableAt,
        });
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
    const fromDate = String(req.query.from_date || '').trim();
    const toDate = String(req.query.to_date || '').trim();
    const shed = String(req.query.shed || '').trim();
    const status = String(req.query.status || '').trim();   // 'open' / 'closed' / ''
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 2000);

    try {
        const pool = req.app.locals.pool;
        let sql = `SELECT s.*,
                          l.loco_type, l.traction_type, l.home_shed, l.railway_zone,
                          paired.loco_number AS paired_loco_number,
                          EXISTS(SELECT 1 FROM div_loco_link_master m
                                 WHERE m.train_no = s.sick_train_no AND m.active = 1) AS train_is_passenger,
                          IFNULL(DATEDIFF(s.fit_from, s.sick_from),
                                 DATEDIFF(CURDATE(), s.sick_from)) AS days_duration
                   FROM div_loco_sick_records s
                   LEFT JOIN div_locos l ON l.loco_number = s.loco_number
                   LEFT JOIN div_loco_sick_records paired ON paired.id = s.paired_with_id
                   WHERE 1=1`;
        const params = [];
        if (loco) { sql += ' AND s.loco_number = ?'; params.push(loco); }
        // Overlap semantics: include any episode that intersects the [from,to] window.
        // An episode runs from sick_from until fit_from (or "now" if still open).
        if (fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
            sql += ' AND (s.fit_from IS NULL OR s.fit_from >= ?)';
            params.push(fromDate);
        }
        if (toDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            sql += ' AND s.sick_from <= ?';
            params.push(toDate);
        }
        if (shed) { sql += ' AND (s.sick_at_shed = ? OR l.home_shed = ?)'; params.push(shed, shed); }
        if (status === 'open')   sql += ' AND s.fit_from IS NULL';
        if (status === 'closed') sql += ' AND s.fit_from IS NOT NULL';
        sql += ' ORDER BY s.sick_from DESC, s.id DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.query(sql, params);
        // Derive category (COG/GOODS) for the report
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

// ══════════════════════════════════════════════════════════════════════════
// LOCO DEFECTS — Track defects reported by LPC on incoming locos
// ══════════════════════════════════════════════════════════════════════════

const DEFECT_CATEGORIES = [
    'BRAKE', 'TRACTION', 'PANTOGRAPH', 'HOTEL_LOAD',
    'AC', 'SPEEDOMETER', 'HORN', 'VIGILANCE',
    'AUX_CONVERTOR', 'BATTERY', 'SI_UNIT', 'OTHER'
];

// POST /defects — report a new defect
router.post('/defects', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const b = req.body || {};

    const loco_number = String(b.loco_number || '').trim().toUpperCase();
    const train_no = String(b.train_no || '').trim();
    const working_date = cleanDate(b.working_date) || todayISO();
    const defect_category = DEFECT_CATEGORIES.includes(b.defect_category) ? b.defect_category : 'OTHER';
    const description = String(b.description || '').trim().slice(0, 500);
    const severity = ['MINOR', 'MAJOR', 'CRITICAL'].includes(b.severity) ? b.severity : 'MINOR';
    const reported_at_terminal = String(b.reported_at_terminal || '').trim().toUpperCase() || null;

    if (!loco_number) return res.status(400).json({ error: 'loco_number required' });
    if (!description) return res.status(400).json({ error: 'description required' });

    try {
        const pool = req.app.locals.pool;

        // Get loco details for home_shed and loco_type
        let home_shed = null, loco_type = null;
        const [locoRows] = await pool.query(
            'SELECT home_shed, loco_type FROM div_locos WHERE loco_number = ? LIMIT 1',
            [loco_number]
        );
        if (locoRows.length) {
            home_shed = locoRows[0].home_shed;
            loco_type = locoRows[0].loco_type;
        }

        // Resolve stable train identity so the defect stays attached to the
        // train across future renumbers. No as-of date: LPC may type an old
        // number they still know the train by, and we want it found regardless
        // (resolveTrainByNo prefers the current alias, else most recent).
        // NULL when no train_no given or it isn't catalogued.
        const resolved = train_no ? await resolveTrainByNo(pool, train_no) : null;
        const train_id = resolved ? resolved.train_id : null;

        const [result] = await pool.query(
            `INSERT INTO div_loco_defects
             (loco_number, train_no, train_id, working_date, defect_category, description, severity,
              home_shed, loco_type, reported_by, reported_at, reported_at_terminal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [loco_number, train_no || null, train_id, working_date, defect_category, description, severity,
             home_shed, loco_type, u.username, reported_at_terminal]
        );

        const [newRow] = await pool.query('SELECT * FROM div_loco_defects WHERE id = ?', [result.insertId]);
        res.json({ ok: true, defect: newRow[0] });
    } catch (err) {
        console.error('[loco-link POST /defects]', err);
        res.status(500).json({ error: 'Failed to save defect' });
    }
});

// GET /defects — list defects with optional filters
// Query params: loco, shed, terminal, category, status, from_date, to_date, limit
router.get('/defects', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { loco, shed, terminal, category, status, from_date, to_date } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    try {
        const pool = req.app.locals.pool;
        let sql = 'SELECT * FROM div_loco_defects WHERE 1=1';
        const params = [];

        if (loco) {
            sql += ' AND loco_number = ?';
            params.push(loco.toUpperCase());
        }
        if (shed) {
            sql += ' AND home_shed = ?';
            params.push(shed.toUpperCase());
        }
        if (terminal) {
            sql += ' AND reported_at_terminal = ?';
            params.push(terminal.toUpperCase());
        }
        if (category && DEFECT_CATEGORIES.includes(category)) {
            sql += ' AND defect_category = ?';
            params.push(category);
        }
        if (status && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (from_date) {
            sql += ' AND working_date >= ?';
            params.push(from_date);
        }
        if (to_date) {
            sql += ' AND working_date <= ?';
            params.push(to_date);
        }

        sql += ' ORDER BY working_date DESC, reported_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, defects: rows });
    } catch (err) {
        console.error('[loco-link GET /defects]', err);
        res.status(500).json({ error: 'Failed to fetch defects' });
    }
});

// GET /defects/by-shed — defects grouped by home shed (for reports)
// Query params: from_date, to_date, status
router.get('/defects/by-shed', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { from_date, to_date, status } = req.query;

    try {
        const pool = req.app.locals.pool;
        let sql = `
            SELECT home_shed, defect_category, severity, COUNT(*) as count
            FROM div_loco_defects
            WHERE home_shed IS NOT NULL
        `;
        const params = [];

        if (from_date) {
            sql += ' AND working_date >= ?';
            params.push(from_date);
        }
        if (to_date) {
            sql += ' AND working_date <= ?';
            params.push(to_date);
        }
        if (status && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' GROUP BY home_shed, defect_category, severity ORDER BY home_shed, count DESC';

        const [rows] = await pool.query(sql, params);

        // Also get detailed list
        let detailSql = 'SELECT * FROM div_loco_defects WHERE home_shed IS NOT NULL';
        const detailParams = [];
        if (from_date) {
            detailSql += ' AND working_date >= ?';
            detailParams.push(from_date);
        }
        if (to_date) {
            detailSql += ' AND working_date <= ?';
            detailParams.push(to_date);
        }
        if (status) {
            detailSql += ' AND status = ?';
            detailParams.push(status);
        }
        detailSql += ' ORDER BY home_shed, working_date DESC LIMIT 500';
        const [details] = await pool.query(detailSql, detailParams);

        // Group by shed
        const byShed = {};
        for (const d of details) {
            const shed = d.home_shed || 'UNKNOWN';
            if (!byShed[shed]) byShed[shed] = [];
            byShed[shed].push(d);
        }

        res.json({ summary: rows, byShed, total: details.length });
    } catch (err) {
        console.error('[loco-link GET /defects/by-shed]', err);
        res.status(500).json({ error: 'Failed to fetch defects by shed' });
    }
});

// GET /defects/by-terminal — defects grouped by terminal (CSMT, LTT, VVH, PNVL)
// Query params: from_date, to_date, status
router.get('/defects/by-terminal', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { from_date, to_date, status } = req.query;

    try {
        const pool = req.app.locals.pool;
        let sql = `
            SELECT reported_at_terminal, defect_category, severity, COUNT(*) as count
            FROM div_loco_defects
            WHERE reported_at_terminal IS NOT NULL
        `;
        const params = [];

        if (from_date) {
            sql += ' AND working_date >= ?';
            params.push(from_date);
        }
        if (to_date) {
            sql += ' AND working_date <= ?';
            params.push(to_date);
        }
        if (status && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' GROUP BY reported_at_terminal, defect_category, severity ORDER BY reported_at_terminal, count DESC';

        const [rows] = await pool.query(sql, params);

        // Also get detailed list
        let detailSql = 'SELECT * FROM div_loco_defects WHERE reported_at_terminal IS NOT NULL';
        const detailParams = [];
        if (from_date) {
            detailSql += ' AND working_date >= ?';
            detailParams.push(from_date);
        }
        if (to_date) {
            detailSql += ' AND working_date <= ?';
            detailParams.push(to_date);
        }
        if (status) {
            detailSql += ' AND status = ?';
            detailParams.push(status);
        }
        detailSql += ' ORDER BY reported_at_terminal, working_date DESC LIMIT 500';
        const [details] = await pool.query(detailSql, detailParams);

        // Group by terminal
        const byTerminal = {};
        for (const d of details) {
            const terminal = d.reported_at_terminal || 'UNKNOWN';
            if (!byTerminal[terminal]) byTerminal[terminal] = [];
            byTerminal[terminal].push(d);
        }

        res.json({ summary: rows, byTerminal, total: details.length });
    } catch (err) {
        console.error('[loco-link GET /defects/by-terminal]', err);
        res.status(500).json({ error: 'Failed to fetch defects by terminal' });
    }
});

// GET /defects/for-log — get defects for a specific log entry (loco + date)
router.get('/defects/for-log', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const { loco, date } = req.query;
    if (!loco || !date) return res.status(400).json({ error: 'loco and date required' });

    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT * FROM div_loco_defects
             WHERE loco_number = ? AND working_date = ?
             ORDER BY reported_at DESC`,
            [loco.toUpperCase(), date]
        );
        res.json({ defects: rows });
    } catch (err) {
        console.error('[loco-link GET /defects/for-log]', err);
        res.status(500).json({ error: 'Failed to fetch defects' });
    }
});

// PATCH /defects/:id — update defect status or add resolution
router.patch('/defects/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });

    const b = req.body || {};
    const updates = {};

    if (b.status && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(b.status)) {
        updates.status = b.status;
        if (b.status === 'RESOLVED') {
            updates.resolved_by = u.username;
            updates.resolved_at = new Date();
        }
    }
    if ('resolution_remarks' in b) {
        updates.resolution_remarks = String(b.resolution_remarks || '').slice(0, 500);
    }

    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'no valid fields to update' });
    }

    try {
        const pool = req.app.locals.pool;
        const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        await pool.query(
            `UPDATE div_loco_defects SET ${sets} WHERE id = ?`,
            [...Object.values(updates), id]
        );
        const [updated] = await pool.query('SELECT * FROM div_loco_defects WHERE id = ?', [id]);
        if (!updated.length) return res.status(404).json({ error: 'defect not found' });
        res.json({ ok: true, defect: updated[0] });
    } catch (err) {
        console.error('[loco-link PATCH /defects/:id]', err);
        res.status(500).json({ error: 'Failed to update defect' });
    }
});

// ── GET /sheds — distinct sheds from div_locos (dropdown source + Settings) ──
router.get('/sheds', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT home_shed AS shed_code, railway_zone, COUNT(*) AS loco_count
             FROM div_locos
             WHERE home_shed IS NOT NULL AND home_shed <> ''
             GROUP BY home_shed, railway_zone
             ORDER BY home_shed`
        );
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /sheds]', err);
        res.status(500).json({ error: 'Failed to load sheds' });
    }
});

// ── PUT /sheds/:shed_code — bulk-update railway_zone across all locos of a
//    shed. Use sparingly; intended for fixing data quality issues, not for
//    routine ops. Returns the number of loco rows affected.
router.put('/sheds/:shed_code', requireSettingsRole, async (req, res) => {
    const shed = String(req.params.shed_code || '').trim();
    const zone = String((req.body || {}).railway_zone || '').trim().toUpperCase();
    if (!shed) return res.status(400).json({ error: 'shed_code required' });
    if (!zone) return res.status(400).json({ error: 'railway_zone required' });
    if (!/^[A-Z]{1,10}$/.test(zone)) {
        return res.status(400).json({ error: 'railway_zone must be 1-10 uppercase letters (e.g. CR, NCR, WCR)' });
    }
    try {
        const pool = req.app.locals.pool;
        const [r] = await pool.query(
            'UPDATE div_locos SET railway_zone = ? WHERE home_shed = ?',
            [zone, shed]
        );
        if (!r.affectedRows) return res.status(404).json({ error: `no locos found for shed ${shed}` });
        res.json({ ok: true, shed_code: shed, railway_zone: zone, locos_updated: r.affectedRows });
    } catch (err) {
        console.error('[loco-link PUT /sheds/:code]', err);
        res.status(500).json({ error: 'Failed to update shed' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// Loco Links (Settings → edit per-train link details: shed, link_attr, etc.)
// Backed by div_loco_link_master. Scheduled-specials editing lives in its own
// dedicated endpoints below; this section is for the regular timetable rows.
// ═══════════════════════════════════════════════════════════════════════════

// Fields admin/ctlc may edit on a master link entry.
// sheet_source + direction are editable so a train can be moved between sheets
// (e.g. PNVL-UP ↔ PNVL-DN) from the Trains modal — these drive which daily
// sheet the train appears on. They must stay mutually consistent (the frontend
// derives direction from the chosen sheet).
const MASTER_EDITABLE_FIELDS = [
    'sheet_source', 'direction',
    'from_station', 'to_station',
    'shed_code', 'link_attr', 'expected_loco_type',
    'accepted_loco_types', 'rake_type', 'expected_hog',
    'is_push_pull', 'traction_type', 'remark',
];

// ── GET /master — list link master rows with filters ───────────────────────
//   ?sheet=CSMT-UP        filter by sheet
//   ?shed=KYNE            filter by shed_code
//   ?search=12810         matches train_no OR train_name
//   ?active=1|0|all       default active=1
router.get('/master', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const sheet = String(req.query.sheet || '').trim();
    const shed = String(req.query.shed || '').trim();
    const search = String(req.query.search || '').trim();
    const activeArg = String(req.query.active || '1').trim();

    try {
        const pool = req.app.locals.pool;
        let sql = `SELECT m.id, m.sheet_source, m.sr_no, m.section, m.direction,
                          m.shed_code, m.link_attr, m.expected_loco_type, m.accepted_loco_types,
                          m.rake_type, m.expected_hog, m.is_push_pull, m.traction_type,
                          m.train_no, m.train_name, m.event_time, m.run_days, m.remark,
                          m.bypass_halts, m.is_scheduled_special, m.active,
                          m.effective_from, m.effective_until,
                          dl.railway_zone
                   FROM div_loco_link_master m
                   LEFT JOIN (
                       SELECT home_shed, MAX(railway_zone) AS railway_zone
                       FROM div_locos
                       WHERE home_shed IS NOT NULL
                       GROUP BY home_shed
                   ) dl ON dl.home_shed = m.shed_code
                   WHERE 1=1`;
        const params = [];
        if (sheet)  { sql += ' AND m.sheet_source = ?'; params.push(sheet); }
        if (shed)   { sql += ' AND m.shed_code    = ?'; params.push(shed); }
        if (search) { sql += ' AND (m.train_no LIKE ? OR m.train_name LIKE ?)'; const p = `%${search}%`; params.push(p, p); }
        if (activeArg === '1')      sql += ' AND m.active = 1';
        else if (activeArg === '0') sql += ' AND m.active = 0';
        sql += ' ORDER BY m.sheet_source, m.event_time, m.id';
        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /master]', err);
        res.status(500).json({ error: 'Failed to list link master rows' });
    }
});

// ── POST /master — create a regular (non-scheduled-special) link master row
//   Body whitelisted from MASTER_CREATE_FIELDS. is_scheduled_special is forced
//   to 0; for scheduled specials use POST /scheduled-specials instead.
const MASTER_CREATE_FIELDS = [
    'sheet_source', 'sr_no', 'section', 'direction', 'is_bypass',
    'from_station', 'to_station', 'route_label',
    'shed_code', 'link_attr', 'expected_hog', 'is_push_pull',
    'traction_type', 'expected_loco_type', 'accepted_loco_types',
    'rake_type', 'train_no', 'train_name', 'event_time', 'via_stations',
    'run_days', 'remark', 'bypass_halts',
];
router.post('/master', requireSettingsRole, async (req, res) => {
    const b = req.body || {};
    const fields = {};
    for (const f of MASTER_CREATE_FIELDS) if (b[f] !== undefined) fields[f] = b[f];

    if (!fields.train_no) return res.status(400).json({ error: 'train_no required' });
    if (!fields.sheet_source) return res.status(400).json({ error: 'sheet_source required' });
    if (!fields.direction || !['UP', 'DN', 'BYPASS'].includes(fields.direction)) {
        return res.status(400).json({ error: 'direction must be UP, DN, or BYPASS' });
    }
    if (!fields.event_time || !/^\d{1,2}:\d{2}$/.test(String(fields.event_time).trim())) {
        return res.status(400).json({ error: 'event_time required (HH:MM)' });
    }
    if ('expected_hog' in fields) fields.expected_hog = fields.expected_hog ? 1 : 0;
    if ('is_push_pull' in fields) fields.is_push_pull = fields.is_push_pull ? 1 : 0;
    fields.is_scheduled_special = 0;
    fields.active = 1;

    try {
        const pool = req.app.locals.pool;
        const cols = Object.keys(fields);
        const placeholders = cols.map(() => '?').join(', ');
        const [r] = await pool.query(
            `INSERT INTO div_loco_link_master (${cols.join(', ')}) VALUES (${placeholders})`,
            Object.values(fields)
        );
        const [created] = await pool.query('SELECT * FROM div_loco_link_master WHERE id = ?', [r.insertId]);
        res.status(201).json({ ok: true, master: created[0] });
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: `A link already exists for ${fields.train_no} (${fields.direction}, from ${fields.from_station || '?'})`,
                hint: 'Edit the existing one in the Loco Links tab',
            });
        }
        console.error('[loco-link POST /master]', err);
        res.status(500).json({ error: 'Failed to create link master row' });
    }
});

// ── PUT /master/:id — edit a link master row (shed, link_attr etc.) ────────
router.put('/master/:id', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const b = req.body || {};
    const fields = {};
    for (const f of MASTER_EDITABLE_FIELDS) if (b[f] !== undefined) fields[f] = b[f];
    if (!Object.keys(fields).length) {
        return res.status(400).json({ error: 'no editable fields supplied' });
    }
    // Normalize booleans for tinyint cols
    if ('expected_hog' in fields) fields.expected_hog = fields.expected_hog ? 1 : 0;
    if ('is_push_pull' in fields) fields.is_push_pull = fields.is_push_pull ? 1 : 0;
    // Validate sheet/direction when moving a train between sheets
    if ('direction' in fields) {
        fields.direction = String(fields.direction || '').trim().toUpperCase();
        if (!['UP', 'DN', 'BYPASS'].includes(fields.direction)) {
            return res.status(400).json({ error: 'direction must be UP, DN or BYPASS' });
        }
    }
    if ('sheet_source' in fields) {
        fields.sheet_source = String(fields.sheet_source || '').trim();
        if (!fields.sheet_source) {
            return res.status(400).json({ error: 'sheet_source cannot be blank' });
        }
    }

    try {
        const pool = req.app.locals.pool;
        const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const [r] = await pool.query(
            `UPDATE div_loco_link_master SET ${sets} WHERE id = ?`,
            [...Object.values(fields), id]
        );
        if (!r.affectedRows) {
            // affectedRows is 0 either when the id doesn't exist or the values
            // were identical; distinguish so a no-op edit doesn't 404.
            const [exists] = await pool.query('SELECT id FROM div_loco_link_master WHERE id = ?', [id]);
            if (!exists.length) return res.status(404).json({ error: 'link master row not found' });
        }
        const [updated] = await pool.query('SELECT * FROM div_loco_link_master WHERE id = ?', [id]);
        res.json({ ok: true, master: updated[0] });
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Another link already exists for this train in that direction and origin',
                hint: 'A train can have only one link per (direction, origin station). Check the other sheet.',
            });
        }
        console.error('[loco-link PUT /master/:id]', err);
        res.status(500).json({ error: 'Failed to update link master row' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// Scheduled Specials (Settings → manage train schedules with date ranges)
// All mutations require division_admin or ctlc role; reads require login only.
// ═══════════════════════════════════════════════════════════════════════════

// Whitelist of columns the Settings UI may set on create/update
const SCHED_FIELDS = [
    'sheet_source', 'sr_no', 'section', 'direction', 'is_bypass',
    'from_station', 'to_station', 'route_label',
    'shed_code', 'link_attr', 'expected_hog', 'is_push_pull',
    'traction_type', 'expected_loco_type', 'accepted_loco_types',
    'rake_type', 'train_no', 'train_name', 'event_time', 'via_stations',
    'run_days', 'remark',
    'effective_from', 'effective_until', 'skip_dates',
];

function pickFields(body, fields) {
    const out = {};
    for (const f of fields) {
        if (body[f] !== undefined) out[f] = body[f];
    }
    return out;
}

// Check whether a new/updated schedule overlaps any active row for the same
// (train_no, direction). NULL effective_from = -∞, NULL effective_until = +∞.
// Returns the conflicting row(s), or [] if no overlap.
async function findOverlappingSchedules(pool, { train_no, direction, effective_from, effective_until, excludeId }) {
    if (!train_no || !direction) return [];
    const params = [train_no, direction];
    let sql = `SELECT id, sheet_source, sr_no, effective_from, effective_until
               FROM div_loco_link_master
               WHERE train_no = ? AND direction = ? AND active = 1`;
    if (excludeId) {
        sql += ' AND id <> ?';
        params.push(excludeId);
    }
    const [rows] = await pool.query(sql, params);
    const nf = effective_from || null;
    const nu = effective_until || null;
    return rows.filter(r => {
        const rf = r.effective_from ? toDateISO(r.effective_from) : null;
        const ru = r.effective_until ? toDateISO(r.effective_until) : null;
        // Two ranges overlap unless one ends before the other begins
        if (rf && nu && nu < rf) return false;
        if (nf && ru && ru < nf) return false;
        return true;
    });
}

// ── GET /scheduled-specials — list (filterable) ─────────────────────────────
//   ?active_on=YYYY-MM-DD  filter to schedules active on a date
//   ?status=active|expired|upcoming
//   ?sheet=CSMT-UP         filter by sheet
router.get('/scheduled-specials', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const activeOn = String(req.query.active_on || '').trim();
    const status = String(req.query.status || '').trim().toLowerCase();
    const sheet = String(req.query.sheet || '').trim();

    try {
        const pool = req.app.locals.pool;
        let sql = `SELECT id, sheet_source, sr_no, section, direction, train_no, train_name,
                          shed_code, link_attr, expected_loco_type, event_time, run_days,
                          effective_from, effective_until, skip_dates, is_scheduled_special,
                          active, remark, created_at, updated_at
                   FROM div_loco_link_master
                   WHERE is_scheduled_special = 1`;
        const params = [];
        if (sheet) { sql += ' AND sheet_source = ?'; params.push(sheet); }
        if (activeOn && /^\d{4}-\d{2}-\d{2}$/.test(activeOn)) {
            const eff = effectiveOnDateClause(activeOn);
            sql += ' AND ' + eff.sql;
            params.push(...eff.params);
        }
        if (status === 'active') {
            sql += ' AND active = 1';
        } else if (status === 'expired') {
            sql += ' AND (active = 0 OR (effective_until IS NOT NULL AND effective_until < CURDATE()))';
        } else if (status === 'upcoming') {
            sql += ' AND active = 1 AND effective_from IS NOT NULL AND effective_from > CURDATE()';
        }
        sql += ' ORDER BY effective_from DESC, sheet_source, sr_no';
        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /scheduled-specials]', err);
        res.status(500).json({ error: 'Failed to list scheduled specials' });
    }
});

// ── POST /scheduled-specials — create new schedule ──────────────────────────
router.post('/scheduled-specials', requireSettingsRole, async (req, res) => {
    const b = req.body || {};
    const fields = pickFields(b, SCHED_FIELDS);

    if (!fields.train_no) return res.status(400).json({ error: 'train_no required' });
    if (!fields.sheet_source) return res.status(400).json({ error: 'sheet_source required' });
    if (!fields.direction || !['UP', 'DN', 'BYPASS'].includes(fields.direction)) {
        return res.status(400).json({ error: 'direction must be UP, DN, or BYPASS' });
    }
    if (!fields.run_days) return res.status(400).json({ error: 'run_days required' });
    if (!fields.effective_from || !/^\d{4}-\d{2}-\d{2}$/.test(fields.effective_from)) {
        return res.status(400).json({ error: 'effective_from required (YYYY-MM-DD)' });
    }
    if (fields.effective_until && !/^\d{4}-\d{2}-\d{2}$/.test(fields.effective_until)) {
        return res.status(400).json({ error: 'effective_until must be YYYY-MM-DD' });
    }
    if (fields.effective_until && fields.effective_until < fields.effective_from) {
        return res.status(400).json({ error: 'effective_until cannot be before effective_from' });
    }

    // skip_dates may arrive as array; store as JSON
    if (fields.skip_dates && Array.isArray(fields.skip_dates)) {
        fields.skip_dates = JSON.stringify(fields.skip_dates);
    }

    try {
        const pool = req.app.locals.pool;

        // Overlap check
        const overlaps = await findOverlappingSchedules(pool, {
            train_no: fields.train_no,
            direction: fields.direction,
            effective_from: fields.effective_from,
            effective_until: fields.effective_until || null,
        });
        if (overlaps.length) {
            return res.status(409).json({
                error: 'Date range overlaps existing active schedule(s) for this train+direction',
                conflicts: overlaps,
                hint: 'Close (set effective_until) on the existing schedule first, then add the new one',
            });
        }

        fields.is_scheduled_special = 1;
        fields.active = 1;

        const cols = Object.keys(fields);
        const placeholders = cols.map(() => '?').join(', ');
        const [r] = await pool.query(
            `INSERT INTO div_loco_link_master (${cols.join(', ')}) VALUES (${placeholders})`,
            Object.values(fields)
        );
        const [created] = await pool.query(
            'SELECT * FROM div_loco_link_master WHERE id = ?', [r.insertId]
        );
        res.status(201).json({ ok: true, schedule: created[0] });
    } catch (err) {
        console.error('[loco-link POST /scheduled-specials]', err);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// ── PUT /scheduled-specials/:id — edit ──────────────────────────────────────
router.put('/scheduled-specials/:id', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const b = req.body || {};
    const fields = pickFields(b, SCHED_FIELDS);
    if (!Object.keys(fields).length) {
        return res.status(400).json({ error: 'no editable fields supplied' });
    }
    if (fields.skip_dates && Array.isArray(fields.skip_dates)) {
        fields.skip_dates = JSON.stringify(fields.skip_dates);
    }
    if (fields.effective_from && !/^\d{4}-\d{2}-\d{2}$/.test(fields.effective_from)) {
        return res.status(400).json({ error: 'effective_from must be YYYY-MM-DD' });
    }
    if (fields.effective_until && !/^\d{4}-\d{2}-\d{2}$/.test(fields.effective_until)) {
        return res.status(400).json({ error: 'effective_until must be YYYY-MM-DD' });
    }

    try {
        const pool = req.app.locals.pool;
        // Load current row to get train_no/direction for overlap check
        const [cur] = await pool.query(
            'SELECT * FROM div_loco_link_master WHERE id = ? AND is_scheduled_special = 1',
            [id]
        );
        if (!cur.length) return res.status(404).json({ error: 'schedule not found' });
        const existing = cur[0];

        const newFrom = fields.effective_from || toDateISO(existing.effective_from);
        const newUntil = ('effective_until' in fields)
            ? fields.effective_until
            : (existing.effective_until ? toDateISO(existing.effective_until) : null);
        if (newUntil && newFrom && newUntil < newFrom) {
            return res.status(400).json({ error: 'effective_until cannot be before effective_from' });
        }

        const overlaps = await findOverlappingSchedules(pool, {
            train_no: fields.train_no || existing.train_no,
            direction: fields.direction || existing.direction,
            effective_from: newFrom,
            effective_until: newUntil,
            excludeId: id,
        });
        if (overlaps.length) {
            return res.status(409).json({
                error: 'Date range overlaps another active schedule for this train+direction',
                conflicts: overlaps,
            });
        }

        const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        await pool.query(
            `UPDATE div_loco_link_master SET ${sets} WHERE id = ?`,
            [...Object.values(fields), id]
        );
        const [updated] = await pool.query('SELECT * FROM div_loco_link_master WHERE id = ?', [id]);
        res.json({ ok: true, schedule: updated[0] });
    } catch (err) {
        console.error('[loco-link PUT /scheduled-specials/:id]', err);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// ── POST /scheduled-specials/:id/extend — extend effective_until ────────────
router.post('/scheduled-specials/:id/extend', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const newEnd = String((req.body || {}).new_end_date || '').trim();
    if (!id) return res.status(400).json({ error: 'invalid id' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newEnd)) {
        return res.status(400).json({ error: 'new_end_date must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        const [cur] = await pool.query(
            'SELECT train_no, direction, effective_from, effective_until FROM div_loco_link_master WHERE id = ? AND is_scheduled_special = 1',
            [id]
        );
        if (!cur.length) return res.status(404).json({ error: 'schedule not found' });
        const existing = cur[0];
        const curUntil = existing.effective_until ? toDateISO(existing.effective_until) : null;
        if (curUntil && newEnd < curUntil) {
            return res.status(400).json({ error: 'extend requires a later date than current effective_until' });
        }

        const overlaps = await findOverlappingSchedules(pool, {
            train_no: existing.train_no,
            direction: existing.direction,
            effective_from: toDateISO(existing.effective_from),
            effective_until: newEnd,
            excludeId: id,
        });
        if (overlaps.length) {
            return res.status(409).json({
                error: 'Extending would overlap another active schedule for this train+direction',
                conflicts: overlaps,
            });
        }

        await pool.query(
            'UPDATE div_loco_link_master SET effective_until = ? WHERE id = ?',
            [newEnd, id]
        );
        res.json({ ok: true, id, effective_until: newEnd });
    } catch (err) {
        console.error('[loco-link POST /scheduled-specials/:id/extend]', err);
        res.status(500).json({ error: 'Failed to extend schedule' });
    }
});

// ── POST /scheduled-specials/:id/skip — add a date to skip_dates JSON ───────
router.post('/scheduled-specials/:id/skip', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const skipDate = String((req.body || {}).skip_date || '').trim();
    if (!id) return res.status(400).json({ error: 'invalid id' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(skipDate)) {
        return res.status(400).json({ error: 'skip_date must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        // JSON_ARRAY_APPEND won't init from NULL; use COALESCE + JSON_ARRAY for first insert
        // and prevent duplicates with JSON_CONTAINS.
        const [cur] = await pool.query(
            'SELECT skip_dates FROM div_loco_link_master WHERE id = ? AND is_scheduled_special = 1',
            [id]
        );
        if (!cur.length) return res.status(404).json({ error: 'schedule not found' });
        const existing = cur[0].skip_dates;
        const skips = existing
            ? (Array.isArray(existing) ? existing : JSON.parse(existing))
            : [];
        if (skips.includes(skipDate)) {
            return res.status(200).json({ ok: true, id, skip_dates: skips, note: 'already in skip list' });
        }
        skips.push(skipDate);
        await pool.query(
            'UPDATE div_loco_link_master SET skip_dates = ? WHERE id = ?',
            [JSON.stringify(skips), id]
        );
        res.json({ ok: true, id, skip_dates: skips });
    } catch (err) {
        console.error('[loco-link POST /scheduled-specials/:id/skip]', err);
        res.status(500).json({ error: 'Failed to add skip date' });
    }
});

// ── POST /scheduled-specials/:id/close — set effective_until ────────────────
router.post('/scheduled-specials/:id/close', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const closeDate = String((req.body || {}).close_date || '').trim();
    if (!id) return res.status(400).json({ error: 'invalid id' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(closeDate)) {
        return res.status(400).json({ error: 'close_date must be YYYY-MM-DD' });
    }
    try {
        const pool = req.app.locals.pool;
        const [cur] = await pool.query(
            'SELECT effective_from FROM div_loco_link_master WHERE id = ? AND is_scheduled_special = 1',
            [id]
        );
        if (!cur.length) return res.status(404).json({ error: 'schedule not found' });
        const fromISO = cur[0].effective_from ? toDateISO(cur[0].effective_from) : null;
        if (fromISO && closeDate < fromISO) {
            return res.status(400).json({ error: 'close_date cannot be before effective_from' });
        }
        await pool.query(
            'UPDATE div_loco_link_master SET effective_until = ? WHERE id = ?',
            [closeDate, id]
        );
        res.json({ ok: true, id, effective_until: closeDate });
    } catch (err) {
        console.error('[loco-link POST /scheduled-specials/:id/close]', err);
        res.status(500).json({ error: 'Failed to close schedule' });
    }
});

// ── DELETE /scheduled-specials/:id — soft delete (active = 0) ───────────────
router.delete('/scheduled-specials/:id', requireSettingsRole, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    try {
        const pool = req.app.locals.pool;
        const [r] = await pool.query(
            'UPDATE div_loco_link_master SET active = 0 WHERE id = ? AND is_scheduled_special = 1',
            [id]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'schedule not found' });
        res.json({ ok: true, id, deactivated: true });
    } catch (err) {
        console.error('[loco-link DELETE /scheduled-specials/:id]', err);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// Trains management (Settings → manage div_trains + div_train_aliases)
// Reads require login; mutations require division_admin or ctlc.
// ═══════════════════════════════════════════════════════════════════════════

// Whitelist of columns the Settings UI may set on create/update
const TRAIN_FIELDS = [
    'train_no', 'train_name', 'train_type', 'direction',
    'from_station', 'to_station', 'loco_change_station',
    'run_days', 'traction_type', 'is_regular', 'is_active',
];
// Same minus train_no for the PUT path (train_no is the immutable key here;
// changing it goes through the renumber endpoint)
const TRAIN_EDITABLE_FIELDS = TRAIN_FIELDS.filter(f => f !== 'train_no');

// ── GET /trains — list with filters ──────────────────────────────────────
//   ?status=active|inactive|all   (default: active)
//   ?search=...                   (matches train_no OR train_name)
//   ?include_aliases=1            (joins alias info so old↔new is visible)
router.get('/trains', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const status = String(req.query.status || 'active').trim().toLowerCase();
    const search = String(req.query.search || '').trim();

    try {
        const pool = req.app.locals.pool;
        // New alias model: div_trains row always holds the CURRENT number;
        // historical numbers live in div_train_aliases (valid_until NOT NULL).
        // `renamed_from` = the train's most recent prior number, so the UI can
        // show "was 09057". There is no `renamed_to` anymore — the row itself
        // carries the current number (the frontend handles its absence).
        let sql = `SELECT t.train_no, t.train_name, t.train_type, t.direction,
                          t.from_station, t.to_station, t.loco_change_station,
                          t.run_days, t.traction_type, t.is_regular, t.is_active,
                          prev.train_no    AS renamed_from,
                          prev.valid_until AS renamed_from_date
                   FROM div_trains t
                   LEFT JOIN (
                       SELECT a1.train_id, a1.train_no, a1.valid_until
                       FROM div_train_aliases a1
                       JOIN (
                           SELECT train_id, MAX(valid_until) AS mx
                           FROM div_train_aliases
                           WHERE valid_until IS NOT NULL
                           GROUP BY train_id
                       ) latest ON latest.train_id = a1.train_id
                                AND latest.mx = a1.valid_until
                   ) prev ON prev.train_id = t.train_id
                   WHERE 1=1`;
        const params = [];
        if (status === 'active')        sql += ' AND t.is_active = 1';
        else if (status === 'inactive') sql += ' AND t.is_active = 0';
        // 'all' = no filter
        if (search) {
            // Alias-aware: typing an old number (e.g. 09057) finds the train
            // now running as 19057, via any alias on the same train_id.
            sql += ` AND (t.train_no LIKE ? OR t.train_name LIKE ?
                          OR t.train_id IN (
                              SELECT train_id FROM div_train_aliases WHERE train_no LIKE ?
                          ))`;
            const pat = `%${search}%`;
            params.push(pat, pat, pat);
        }
        sql += ' ORDER BY t.train_no';
        const [rows] = await pool.query(sql, params);
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /trains]', err);
        res.status(500).json({ error: 'Failed to list trains' });
    }
});

// ── POST /trains — create new train, optionally with a loco link entry ────
// Body: { ...train fields, loco_link?: { sheet_source, event_time, section,
//         shed_code, link_attr, expected_loco_type, rake_type, expected_hog,
//         is_push_pull, traction_type } }
// If loco_link.sheet_source AND loco_link.event_time are both supplied, a
// div_loco_link_master row is inserted alongside the train. Otherwise only
// the train is created.
router.post('/trains', requireSettingsRole, async (req, res) => {
    const b = req.body || {};
    const fields = {};
    for (const f of TRAIN_FIELDS) if (b[f] !== undefined) fields[f] = b[f];

    const trainNo = String(fields.train_no || '').trim();
    if (!trainNo) return res.status(400).json({ error: 'train_no required' });
    if (!/^[0-9A-Za-z]{1,10}$/.test(trainNo)) {
        return res.status(400).json({ error: 'train_no must be 1-10 alphanumeric chars' });
    }
    if (fields.direction && !['UP', 'DN'].includes(fields.direction)) {
        return res.status(400).json({ error: 'direction must be UP or DN' });
    }
    // Normalize booleans
    if ('is_regular' in fields) fields.is_regular = fields.is_regular ? 1 : 0;
    if ('is_active'  in fields) fields.is_active  = fields.is_active  ? 1 : 0;

    // Optional loco_link block — only created if sheet+event_time both supplied
    const link = b.loco_link && typeof b.loco_link === 'object' ? b.loco_link : null;
    let linkRow = null;
    if (link && link.sheet_source && link.event_time) {
        // Validate the link bits
        if (!/^\d{1,2}:\d{2}$/.test(String(link.event_time).trim())) {
            return res.status(400).json({ error: 'loco_link.event_time must be HH:MM' });
        }
        linkRow = {
            sheet_source: String(link.sheet_source).trim(),
            section: link.section ? String(link.section).trim() : null,
            direction: fields.direction,           // inherit from train
            train_no: trainNo,
            train_name: fields.train_name || null,
            event_time: String(link.event_time).trim(),
            // For from/to_station: link's value wins if explicitly provided
            // (e.g. takeover LNL on the link even though train segment starts at PUNE)
            from_station: (link.from_station ? String(link.from_station).trim() : null) || fields.from_station || null,
            to_station:   (link.to_station   ? String(link.to_station).trim()   : null) || fields.to_station   || null,
            shed_code: link.shed_code ? String(link.shed_code).trim() : null,
            link_attr: link.link_attr ? String(link.link_attr).trim() : null,
            expected_loco_type: link.expected_loco_type ? String(link.expected_loco_type).trim() : null,
            rake_type: link.rake_type ? String(link.rake_type).trim() : null,
            expected_hog: link.expected_hog ? 1 : 0,
            is_push_pull: link.is_push_pull ? 1 : 0,
            traction_type: link.traction_type || fields.traction_type || 'Electric',
            run_days: fields.run_days || null,
            active: 1,
        };
    }

    try {
        const pool = req.app.locals.pool;
        // Check duplicate train
        const [existing] = await pool.query(
            'SELECT train_no FROM div_trains WHERE train_no = ? LIMIT 1',
            [trainNo]
        );
        if (existing.length) {
            return res.status(409).json({
                error: `train_no ${trainNo} already exists`,
                hint: 'Use the Edit action to modify it, or Renumber if you meant to rename a different train',
            });
        }
        // Insert train
        const cols = Object.keys(fields);
        const placeholders = cols.map(() => '?').join(', ');
        await pool.query(
            `INSERT INTO div_trains (${cols.join(', ')}) VALUES (${placeholders})`,
            Object.values(fields)
        );
        // Insert link master row if provided
        let createdLink = null;
        if (linkRow) {
            const lcols = Object.keys(linkRow);
            const lph = lcols.map(() => '?').join(', ');
            const [lr] = await pool.query(
                `INSERT INTO div_loco_link_master (${lcols.join(', ')}) VALUES (${lph})`,
                Object.values(linkRow)
            );
            const [lrows] = await pool.query('SELECT * FROM div_loco_link_master WHERE id = ?', [lr.insertId]);
            createdLink = lrows[0];
        }
        const [created] = await pool.query('SELECT * FROM div_trains WHERE train_no = ?', [trainNo]);
        res.status(201).json({ ok: true, train: created[0], loco_link: createdLink });
    } catch (err) {
        console.error('[loco-link POST /trains]', err);
        res.status(500).json({ error: 'Failed to create train' });
    }
});

// ── PUT /trains/:train_no — update (any field except train_no) ──────────
router.put('/trains/:train_no', requireSettingsRole, async (req, res) => {
    const trainNo = String(req.params.train_no || '').trim();
    if (!trainNo) return res.status(400).json({ error: 'train_no required' });
    const b = req.body || {};
    const fields = {};
    for (const f of TRAIN_EDITABLE_FIELDS) if (b[f] !== undefined) fields[f] = b[f];
    if (!Object.keys(fields).length) {
        return res.status(400).json({ error: 'no editable fields supplied' });
    }
    if (fields.direction && !['UP', 'DN'].includes(fields.direction)) {
        return res.status(400).json({ error: 'direction must be UP or DN' });
    }
    if ('is_regular' in fields) fields.is_regular = fields.is_regular ? 1 : 0;
    if ('is_active'  in fields) fields.is_active  = fields.is_active  ? 1 : 0;

    try {
        const pool = req.app.locals.pool;
        const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const [r] = await pool.query(
            `UPDATE div_trains SET ${sets} WHERE train_no = ?`,
            [...Object.values(fields), trainNo]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'train not found' });
        const [updated] = await pool.query('SELECT * FROM div_trains WHERE train_no = ?', [trainNo]);
        res.json({ ok: true, train: updated[0] });
    } catch (err) {
        console.error('[loco-link PUT /trains/:no]', err);
        res.status(500).json({ error: 'Failed to update train' });
    }
});

// ── DELETE /trains/:train_no — soft delete (is_active = 0) ──────────────
router.delete('/trains/:train_no', requireSettingsRole, async (req, res) => {
    const trainNo = String(req.params.train_no || '').trim();
    if (!trainNo) return res.status(400).json({ error: 'train_no required' });
    try {
        const pool = req.app.locals.pool;
        const [r] = await pool.query(
            'UPDATE div_trains SET is_active = 0 WHERE train_no = ?',
            [trainNo]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'train not found' });
        res.json({ ok: true, train_no: trainNo, deactivated: true });
    } catch (err) {
        console.error('[loco-link DELETE /trains/:no]', err);
        res.status(500).json({ error: 'Failed to delete train' });
    }
});

// ── POST /trains/:old/renumber — rename a train; record alias mapping ────
//   Body: { new_train_no, renamed_date }
//
// New alias model (post architecture rebuild):
//   - Resolve old number → train_id via div_train_aliases (any alias works:
//     current or historical)
//   - Verify new number is not already in use by any active alias
//   - Transaction:
//       1. close old alias: UPDATE valid_until = renamed_date
//       2. open new alias:  INSERT (train_id, new_no, renamed_date, NULL)
//       3. update display:  UPDATE div_trains.train_no = new_no for that
//          train_id
//   - No cascade to downstream tables (master/log/sick/defects/positions all
//     reference train_id, which doesn't change). History stays intact.
router.post('/trains/:train_no/renumber', requireSettingsRole, async (req, res) => {
    const oldNo = String(req.params.train_no || '').trim();
    const b = req.body || {};
    const newNo = String(b.new_train_no || '').trim();
    const renamedDate = String(b.renamed_date || '').trim() || todayISO();

    if (!oldNo) return res.status(400).json({ error: 'old train_no required' });
    if (!newNo) return res.status(400).json({ error: 'new_train_no required' });
    if (oldNo === newNo) return res.status(400).json({ error: 'new_train_no must differ from old' });
    if (!/^[0-9A-Za-z]{1,10}$/.test(newNo)) {
        return res.status(400).json({ error: 'new_train_no must be 1-10 alphanumeric chars' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(renamedDate)) {
        return res.status(400).json({ error: 'renamed_date must be YYYY-MM-DD' });
    }

    const pool = req.app.locals.pool;
    let conn;
    try {
        // Resolve old number → train_id (alias-aware: accepts old or current number)
        const resolved = await resolveTrainByNo(pool, oldNo);
        if (!resolved) {
            return res.status(404).json({ error: `train ${oldNo} not found in trains or aliases` });
        }
        const trainId = resolved.train_id;

        // Reject if new number is already an active alias for ANY train (incl. this one)
        const [collision] = await pool.query(
            `SELECT train_id FROM div_train_aliases
             WHERE train_no = ? AND valid_until IS NULL
             LIMIT 1`,
            [newNo]
        );
        if (collision.length) {
            return res.status(409).json({
                error: `train number ${newNo} is already in active use`,
                hint: collision[0].train_id === trainId
                    ? 'This train is already running under that number.'
                    : 'Merge or deactivate the conflicting train before renumbering.',
            });
        }

        // Transactional apply
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. Close the currently-valid alias for the old number on this train_id
        const [closeRes] = await conn.query(
            `UPDATE div_train_aliases
             SET valid_until = ?
             WHERE train_id = ? AND train_no = ? AND valid_until IS NULL`,
            [renamedDate, trainId, resolved.ran_as]
        );
        if (!closeRes.affectedRows) {
            // No currently-valid alias to close — happens if the old number
            // was already historical. We still record the new number.
        }

        // 2. Open the new alias as currently-valid
        await conn.query(
            `INSERT INTO div_train_aliases (train_id, train_no, valid_from, valid_until)
             VALUES (?, ?, ?, NULL)`,
            [trainId, newNo, renamedDate]
        );

        // 3. Update div_trains.train_no (display layer) to the new number
        await conn.query(
            `UPDATE div_trains SET train_no = ? WHERE train_id = ?`,
            [newNo, trainId]
        );

        await conn.commit();
        conn.release();

        const [updated] = await pool.query(
            `SELECT * FROM div_trains WHERE train_id = ?`, [trainId]
        );
        const [aliases] = await pool.query(
            `SELECT train_no, valid_from, valid_until FROM div_train_aliases
             WHERE train_id = ? ORDER BY valid_until DESC`,
            [trainId]
        );
        res.json({
            ok: true,
            train_id: trainId,
            old_train_no: resolved.ran_as,
            new_train_no: newNo,
            renamed_date: renamedDate,
            train: updated[0],
            aliases,
        });
    } catch (err) {
        if (conn) { try { await conn.rollback(); } catch {} conn.release(); }
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Duplicate alias',
                hint: 'A row for this (train_id, train_no) already exists.',
            });
        }
        console.error('[loco-link POST /trains/:no/renumber]', err);
        res.status(500).json({ error: 'Failed to renumber train' });
    }
});

// ── GET /train-aliases — list past renamings ─────────────────────────────
// New shape: groups by train_id and shows the old → new history with the
// renamed_date (= old alias's valid_until = new alias's valid_from).
// ?train_no=X to filter — accepts either the current or any historical
// number; via resolveTrainByNo() it finds the train_id and lists all its
// aliases.
router.get('/train-aliases', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const trainNo = String(req.query.train_no || '').trim();
        let where = '';
        let params = [];
        if (trainNo) {
            const resolved = await resolveTrainByNo(pool, trainNo);
            if (!resolved) return res.json({ total: 0, rows: [] });
            where = 'WHERE a.train_id = ?';
            params = [resolved.train_id];
        }
        const [rows] = await pool.query(
            `SELECT a.train_id,
                    a.train_no,
                    a.valid_from,
                    a.valid_until,
                    t.train_no AS current_train_no,
                    t.train_name,
                    (a.valid_until IS NOT NULL) AS is_historical
             FROM div_train_aliases a
             JOIN div_trains t ON t.train_id = a.train_id
             ${where}
             ORDER BY a.train_id, a.valid_until DESC`,
            params
        );
        res.json({ total: rows.length, rows });
    } catch (err) {
        console.error('[loco-link GET /train-aliases]', err);
        res.status(500).json({ error: 'Failed to load aliases' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  LOCO MANAGEMENT (master roster admin) — Phase 4 of LOCO_MASTER_MIGRATION.md
//
//  Search-by-number driven admin over div_locos. Three mutations:
//    • Add a loco (mostly LPC-entered diesels)
//    • Transfer a loco to another home shed/zone (loco stays Active)
//    • Condemn a loco (withdraw/scrap → status Condemned, drops from active use)
//
//  Transfers and condemns are logged to div_loco_transfers (history). Plain
//  field edits are not logged. Mutations gated to division_admin/ctlc; reads
//  require a logged-in division user. Distinct from the /master endpoints above
//  (those manage train link-master rows, not the loco roster).
// ═══════════════════════════════════════════════════════════════════════════

// Current IST datetime as "YYYY-MM-DD HH:MM:SS" for audit stamps.
function nowISTDateTime() {
    const t = nowIST();
    const pad = (n) => String(n).padStart(2, '0');
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ` +
           `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

// ── GET /locos/lookups — dropdown sources (distinct zones, sheds, types) ─────
// Sheds carry their zone so the Add/Transfer forms can auto-fill zone on pick.
router.get('/locos/lookups', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    try {
        const pool = req.app.locals.pool;
        const [zones] = await pool.query(
            `SELECT DISTINCT railway_zone FROM div_locos
             WHERE railway_zone IS NOT NULL AND railway_zone <> ''
             ORDER BY railway_zone`
        );
        const [sheds] = await pool.query(
            `SELECT home_shed AS shed, MAX(railway_zone) AS zone
             FROM div_locos
             WHERE home_shed IS NOT NULL AND home_shed <> ''
             GROUP BY home_shed ORDER BY home_shed`
        );
        const [types] = await pool.query(
            `SELECT DISTINCT loco_type FROM div_locos
             WHERE loco_type IS NOT NULL AND loco_type <> ''
             ORDER BY loco_type`
        );
        const [props] = await pool.query(
            `SELECT DISTINCT traction_converter FROM div_locos
             WHERE traction_converter IS NOT NULL AND traction_converter <> ''
             ORDER BY traction_converter`
        );
        res.json({
            zones: zones.map((r) => r.railway_zone),
            sheds: sheds.map((r) => ({ shed: r.shed, zone: r.zone })),
            types: types.map((r) => r.loco_type),
            propulsions: props.map((r) => r.traction_converter),
        });
    } catch (err) {
        console.error('[loco-link GET /locos/lookups]', err);
        res.status(500).json({ error: 'Failed to load lookups' });
    }
});

// ── GET /locos/:loco_number — master row + transfer/condemn history ──────────
// The search-by-number result for the Loco Management page. 404 if unknown.
router.get('/locos/:loco_number', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT id, loco_number, loco_type, traction_type, railway_zone,
                    home_shed, status,
                    DATE_FORMAT(commission_date, '%Y-%m-%d') AS commission_date,
                    traction_converter, hotel_load_oem,
                    data_source, entered_by, remarks, created_at, updated_at
             FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const [history] = await pool.query(
            `SELECT id, action, from_shed, to_shed, from_zone, to_zone,
                    reason, changed_by, changed_at
             FROM div_loco_transfers
             WHERE loco_number = ?
             ORDER BY changed_at DESC, id DESC`,
            [locoNo]
        );
        res.json({ loco: rows[0], history });
    } catch (err) {
        console.error('[loco-link GET /locos/:n]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// ── POST /locos — add a loco (mostly LPC-entered diesels) ────────────────────
router.post('/locos', requireSettingsRole, async (req, res) => {
    const b = req.body || {};
    const loco_number = String(b.loco_number || '').trim();
    const loco_type = String(b.loco_type || '').trim();
    const railway_zone = String(b.railway_zone || '').trim().toUpperCase();
    const home_shed = String(b.home_shed || '').trim();
    const traction_type = String(b.traction_type || 'Electric').trim();
    const commission_date = String(b.commission_date || '').trim() || null;
    const traction_converter = String(b.traction_converter || '').trim() || null;
    const hotel_load_oem = String(b.hotel_load_oem || '').trim() || null;
    const remarks = String(b.remarks || '').trim() || null;

    if (!loco_number) return res.status(400).json({ error: 'loco_number required' });
    if (!loco_type) return res.status(400).json({ error: 'loco_type required' });
    if (!railway_zone) return res.status(400).json({ error: 'railway_zone required' });
    if (!home_shed) return res.status(400).json({ error: 'home_shed required' });
    if (!['Electric', 'Diesel', 'Dual'].includes(traction_type)) {
        return res.status(400).json({ error: 'traction_type must be Electric, Diesel or Dual' });
    }
    if (commission_date && !/^\d{4}-\d{2}-\d{2}$/.test(commission_date)) {
        return res.status(400).json({ error: 'commission_date must be YYYY-MM-DD' });
    }

    try {
        const pool = req.app.locals.pool;
        const [dup] = await pool.query(
            'SELECT id FROM div_locos WHERE loco_number = ? LIMIT 1', [loco_number]
        );
        if (dup.length) {
            return res.status(409).json({ error: `Loco ${loco_number} already exists in the master` });
        }
        const [r] = await pool.query(
            `INSERT INTO div_locos
               (loco_number, loco_type, traction_type, railway_zone, home_shed,
                status, commission_date, traction_converter, hotel_load_oem,
                data_source, entered_by, remarks)
             VALUES (?,?,?,?,?, 'Active', ?,?,?, 'LPC_ENTRY', ?, ?)`,
            [loco_number, loco_type, traction_type, railway_zone, home_shed,
             commission_date, traction_converter, hotel_load_oem,
             req.session.user.username, remarks]
        );
        const [created] = await pool.query('SELECT * FROM div_locos WHERE id = ?', [r.insertId]);
        res.status(201).json({ ok: true, loco: created[0] });
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: `Loco ${loco_number} already exists in the master` });
        }
        console.error('[loco-link POST /locos]', err);
        res.status(500).json({ error: 'Failed to add loco' });
    }
});

// ── PUT /locos/:loco_number — edit descriptive fields (no audit row) ─────────
// Shed/zone are changed via /transfer (logged); status via /condemn. This only
// edits descriptive master fields, so it is intentionally NOT logged to history.
const LOCO_EDITABLE_FIELDS = [
    'loco_type', 'traction_type', 'traction_converter', 'hotel_load_oem',
    'commission_date', 'remarks',
];
router.put('/locos/:loco_number', requireSettingsRole, async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    const b = req.body || {};

    const fields = {};
    for (const f of LOCO_EDITABLE_FIELDS) {
        if (b[f] === undefined) continue;
        const v = (b[f] === null || String(b[f]).trim() === '') ? null : String(b[f]).trim();
        fields[f] = v;
    }
    if (!Object.keys(fields).length) {
        return res.status(400).json({ error: 'no editable fields supplied' });
    }
    if ('traction_type' in fields && !['Electric', 'Diesel', 'Dual'].includes(fields.traction_type)) {
        return res.status(400).json({ error: 'traction_type must be Electric, Diesel or Dual' });
    }
    if (fields.commission_date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.commission_date)) {
        return res.status(400).json({ error: 'commission_date must be YYYY-MM-DD' });
    }
    if ('loco_type' in fields && !fields.loco_type) {
        return res.status(400).json({ error: 'loco_type cannot be blank' });
    }

    try {
        const pool = req.app.locals.pool;
        const cols = Object.keys(fields);
        const setSql = cols.map((c) => `${c} = ?`).join(', ');
        const [r] = await pool.query(
            `UPDATE div_locos SET ${setSql} WHERE loco_number = ?`,
            [...cols.map((c) => fields[c]), locoNo]
        );
        if (!r.affectedRows) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        res.json({ ok: true, loco_number: locoNo, updated: cols });
    } catch (err) {
        console.error('[loco-link PUT /locos/:n]', err);
        res.status(500).json({ error: 'Failed to edit loco' });
    }
});

// ── POST /locos/:loco_number/transfer — move to a new home shed/zone ─────────
// Rewrites home_shed/railway_zone on div_locos and appends a TRANSFER history
// row. Loco stays Active. A cross-zone move just changes railway_zone (so the
// future div_cr_locos view naturally includes/excludes it — no status needed).
router.post('/locos/:loco_number/transfer', requireSettingsRole, async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    const to_shed = String((req.body || {}).to_shed || '').trim();
    let to_zone = String((req.body || {}).to_zone || '').trim().toUpperCase();
    const reason = String((req.body || {}).reason || '').trim() || null;
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });
    if (!to_shed) return res.status(400).json({ error: 'to_shed required' });

    let conn;
    try {
        const pool = req.app.locals.pool;
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [rows] = await conn.query(
            'SELECT home_shed, railway_zone, status FROM div_locos WHERE loco_number = ? FOR UPDATE',
            [locoNo]
        );
        if (!rows.length) {
            await conn.rollback();
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const cur = rows[0];
        if (cur.status === 'Condemned') {
            await conn.rollback();
            return res.status(409).json({ error: 'Loco is Condemned and cannot be transferred' });
        }
        // If caller didn't supply a zone, inherit the destination shed's known zone.
        if (!to_zone) {
            const [z] = await conn.query(
                `SELECT MAX(railway_zone) AS zone FROM div_locos WHERE home_shed = ?`, [to_shed]
            );
            to_zone = (z[0] && z[0].zone) ? String(z[0].zone).toUpperCase() : cur.railway_zone;
        }
        if (to_shed === cur.home_shed && to_zone === cur.railway_zone) {
            await conn.rollback();
            return res.status(400).json({ error: 'Destination shed/zone is the same as current' });
        }

        await conn.query(
            'UPDATE div_locos SET home_shed = ?, railway_zone = ? WHERE loco_number = ?',
            [to_shed, to_zone, locoNo]
        );
        await conn.query(
            `INSERT INTO div_loco_transfers
               (loco_number, action, from_shed, to_shed, from_zone, to_zone, reason, changed_by, changed_at)
             VALUES (?, 'TRANSFER', ?, ?, ?, ?, ?, ?, ?)`,
            [locoNo, cur.home_shed, to_shed, cur.railway_zone, to_zone, reason,
             req.session.user.username, nowISTDateTime()]
        );
        await conn.commit();
        res.json({ ok: true, loco_number: locoNo, from_shed: cur.home_shed, to_shed, from_zone: cur.railway_zone, to_zone });
    } catch (err) {
        if (conn) { try { await conn.rollback(); } catch (_) {} }
        console.error('[loco-link POST /locos/:n/transfer]', err);
        res.status(500).json({ error: 'Failed to transfer loco' });
    } finally {
        if (conn) conn.release();
    }
});

// ── POST /locos/:loco_number/condemn — withdraw/scrap (status → Condemned) ───
router.post('/locos/:loco_number/condemn', requireSettingsRole, async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    const reason = String((req.body || {}).reason || '').trim() || null;
    if (!locoNo) return res.status(400).json({ error: 'loco_number required' });

    let conn;
    try {
        const pool = req.app.locals.pool;
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [rows] = await conn.query(
            'SELECT home_shed, railway_zone, status FROM div_locos WHERE loco_number = ? FOR UPDATE',
            [locoNo]
        );
        if (!rows.length) {
            await conn.rollback();
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const cur = rows[0];
        if (cur.status === 'Condemned') {
            await conn.rollback();
            return res.status(409).json({ error: 'Loco is already Condemned' });
        }

        await conn.query(
            `UPDATE div_locos SET status = 'Condemned' WHERE loco_number = ?`, [locoNo]
        );
        await conn.query(
            `INSERT INTO div_loco_transfers
               (loco_number, action, from_shed, from_zone, reason, changed_by, changed_at)
             VALUES (?, 'CONDEMN', ?, ?, ?, ?, ?)`,
            [locoNo, cur.home_shed, cur.railway_zone, reason,
             req.session.user.username, nowISTDateTime()]
        );
        await conn.commit();
        res.json({ ok: true, loco_number: locoNo, status: 'Condemned' });
    } catch (err) {
        if (conn) { try { await conn.rollback(); } catch (_) {} }
        console.error('[loco-link POST /locos/:n/condemn]', err);
        res.status(500).json({ error: 'Failed to condemn loco' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
