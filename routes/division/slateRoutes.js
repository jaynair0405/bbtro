const express = require('express');
const router = express.Router();

// ============================================================================
// DIGITAL SLATE & DETAIL BOOK API
// ============================================================================

// IST Timezone offset (UTC+5:30 = 330 minutes)
const IST_OFFSET_MINUTES = 330;

// SQL expressions for IST time (server is in UTC)
const SQL_NOW_IST = `DATE_ADD(NOW(), INTERVAL ${IST_OFFSET_MINUTES} MINUTE)`;
const SQL_CURDATE_IST = `DATE(DATE_ADD(NOW(), INTERVAL ${IST_OFFSET_MINUTES} MINUTE))`;

// Helper to format date as YYYY-MM-DD in local timezone (avoids UTC shift)
function formatLocalDate(date) {
    if (typeof date === 'string') date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get current IST date as YYYY-MM-DD string
function getISTDate() {
    const now = new Date();
    // Add IST offset to UTC time
    const istTime = new Date(now.getTime() + (IST_OFFSET_MINUTES * 60 * 1000));
    return formatLocalDate(istTime);
}

// Get current IST datetime
function getISTDateTime() {
    const now = new Date();
    const istTime = new Date(now.getTime() + (IST_OFFSET_MINUTES * 60 * 1000));
    return istTime;
}

// ----------------------------------------------------------------------------
// GET /api/division/slate/active-crews
// Fetches crews with status ONLINE for Click-to-Arrive cards (duty > 5 hours)
// ----------------------------------------------------------------------------
router.get('/active-crews', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get crews who are ONLINE and have been on duty for 5+ hours (using IST time)
        const [crews] = await conn.query(`
            SELECT
                ds.id AS slate_id,
                ds.slot_date,
                ds.slot_time,
                ds.train_no,
                ds.loco_no,
                ds.lp_hrms_id,
                lp.name AS lp_name,
                lp.current_cms_id AS lp_cms_id,
                ds.alp_hrms_id,
                alp.name AS alp_name,
                alp.current_cms_id AS alp_cms_id,
                CONCAT(ds.slot_date, ' ', ds.slot_time) AS sign_on_datetime,
                TIMESTAMPDIFF(HOUR, CONCAT(ds.slot_date, ' ', ds.slot_time), NOW()) AS duty_hours
            FROM div_daily_slate ds
            LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
            WHERE ds.office_code = ?
              AND (ds.lp_status IN ('ONLINE', 'BOOKED') OR ds.alp_status IN ('ONLINE', 'BOOKED'))
              AND TIMESTAMPDIFF(HOUR, CONCAT(ds.slot_date, ' ', ds.slot_time), NOW()) >= 5
            ORDER BY CONCAT(ds.slot_date, ' ', ds.slot_time) ASC
        `, [userOffice]);

        // Check for leave warnings and future assignments
        for (const crew of crews) {
            // Check LP leave (using IST date)
            const [lpLeave] = await conn.query(`
                SELECT status, leave_type, from_date, to_date
                FROM div_leave_tracking
                WHERE staff_hrms_id = ?
                  AND status IN ('Approved', 'Pending', 'Forwarded')
                  AND from_date <= DATE_ADD(${SQL_CURDATE_IST}, INTERVAL 2 DAY)
                  AND to_date >= ${SQL_CURDATE_IST}
                LIMIT 1
            `, [crew.lp_hrms_id]);
            crew.lp_leave_warning = lpLeave.length > 0 ? lpLeave[0] : null;

            // Check ALP leave if exists (using IST date)
            if (crew.alp_hrms_id) {
                const [alpLeave] = await conn.query(`
                    SELECT status, leave_type, from_date, to_date
                    FROM div_leave_tracking
                    WHERE staff_hrms_id = ?
                      AND status IN ('Approved', 'Pending', 'Forwarded')
                      AND from_date <= DATE_ADD(${SQL_CURDATE_IST}, INTERVAL 2 DAY)
                      AND to_date >= ${SQL_CURDATE_IST}
                    LIMIT 1
                `, [crew.alp_hrms_id]);
                crew.alp_leave_warning = alpLeave.length > 0 ? alpLeave[0] : null;
            }

            // Check if LP is already assigned to a future slot (different from current ONLINE slot)
            if (crew.lp_hrms_id) {
                const [lpFuture] = await conn.query(`
                    SELECT slot_date, slot_time
                    FROM div_daily_slate
                    WHERE office_code = ?
                      AND lp_hrms_id = ?
                      AND id != ?
                      AND lp_status IN ('AVAILABLE', 'FORECAST')
                      AND CONCAT(slot_date, ' ', slot_time) >= ${SQL_NOW_IST}
                    ORDER BY slot_date, slot_time
                    LIMIT 1
                `, [userOffice, crew.lp_hrms_id, crew.slate_id]);
                crew.lp_already_assigned = lpFuture.length > 0 ? {
                    date: formatLocalDate(lpFuture[0].slot_date),
                    time: lpFuture[0].slot_time.substring(0, 5)
                } : null;
            }

            // Check if ALP is already assigned to a future slot
            if (crew.alp_hrms_id) {
                const [alpFuture] = await conn.query(`
                    SELECT slot_date, slot_time
                    FROM div_daily_slate
                    WHERE office_code = ?
                      AND alp_hrms_id = ?
                      AND id != ?
                      AND alp_status IN ('AVAILABLE', 'FORECAST')
                      AND CONCAT(slot_date, ' ', slot_time) >= ${SQL_NOW_IST}
                    ORDER BY slot_date, slot_time
                    LIMIT 1
                `, [userOffice, crew.alp_hrms_id, crew.slate_id]);
                crew.alp_already_assigned = alpFuture.length > 0 ? {
                    date: formatLocalDate(alpFuture[0].slot_date),
                    time: alpFuture[0].slot_time.substring(0, 5)
                } : null;
            }

            // Check LP night streak (fatigue tracker)
            if (crew.lp_hrms_id) {
                const [lpFatigue] = await conn.query(`
                    SELECT current_night_streak
                    FROM div_staff_fatigue_tracker
                    WHERE hrms_id = ? AND current_night_streak >= 3
                `, [crew.lp_hrms_id]);
                crew.lp_night_streak = lpFatigue.length > 0 ? lpFatigue[0].current_night_streak : null;

                // Check LP PR (consecutive duty days) - count days AFTER last PR or MULTI_DAY_LEAVE
                // Short leave (1-3 days) counts toward streak, PR and MULTI_DAY_LEAVE reset it
                const [lpPR] = await conn.query(`
                    SELECT COUNT(*) AS consecutive_days
                    FROM (
                        SELECT DISTINCT shift_date
                        FROM div_detail_book_log
                        WHERE lp_hrms_id = ?
                          AND lp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE')
                          AND shift_date >= DATE_SUB(${SQL_CURDATE_IST}, INTERVAL 10 DAY)
                          AND shift_date <= ${SQL_CURDATE_IST}
                          AND shift_date > COALESCE(
                              (SELECT MAX(shift_date) FROM div_detail_book_log
                               WHERE lp_hrms_id = ? AND lp_rest_type IN ('PR', 'MULTI_DAY_LEAVE')),
                              '1970-01-01'
                          )
                    ) AS recent_duties
                `, [crew.lp_hrms_id, crew.lp_hrms_id]);
                const lpDays = lpPR.length > 0 ? lpPR[0].consecutive_days : 0;
                crew.lp_pr_days = lpDays >= 5 ? lpDays : null;
            }

            // Check ALP night streak and PR
            if (crew.alp_hrms_id) {
                const [alpFatigue] = await conn.query(`
                    SELECT current_night_streak
                    FROM div_staff_fatigue_tracker
                    WHERE hrms_id = ? AND current_night_streak >= 3
                `, [crew.alp_hrms_id]);
                crew.alp_night_streak = alpFatigue.length > 0 ? alpFatigue[0].current_night_streak : null;

                // Check ALP PR (consecutive duty days) - count days AFTER last PR or MULTI_DAY_LEAVE
                // Short leave (1-3 days) counts toward streak, PR and MULTI_DAY_LEAVE reset it
                const [alpPR] = await conn.query(`
                    SELECT COUNT(*) AS consecutive_days
                    FROM (
                        SELECT DISTINCT shift_date
                        FROM div_detail_book_log
                        WHERE alp_hrms_id = ?
                          AND alp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE')
                          AND shift_date >= DATE_SUB(${SQL_CURDATE_IST}, INTERVAL 10 DAY)
                          AND shift_date <= ${SQL_CURDATE_IST}
                          AND shift_date > COALESCE(
                              (SELECT MAX(shift_date) FROM div_detail_book_log
                               WHERE alp_hrms_id = ? AND alp_rest_type IN ('PR', 'MULTI_DAY_LEAVE')),
                              '1970-01-01'
                          )
                    ) AS recent_duties
                `, [crew.alp_hrms_id, crew.alp_hrms_id]);
                const alpDays = alpPR.length > 0 ? alpPR[0].consecutive_days : 0;
                crew.alp_pr_days = alpDays >= 5 ? alpDays : null;
            }
        }

        conn.release();

        res.json({
            success: true,
            office_code: userOffice,
            count: crews.length,
            data: crews
        });

    } catch (error) {
        console.error('Error fetching active crews:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/slots
// Get slot template for an office (for generating empty slate)
// ----------------------------------------------------------------------------
router.get('/slots', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        const [slots] = await conn.query(`
            SELECT shift_code, slot_time, slot_order
            FROM div_office_slot_template
            WHERE office_code = ? AND is_active = 1
            ORDER BY slot_order, slot_time
        `, [userOffice]);

        conn.release();

        // Group by shift
        const grouped = {
            '00_08': [],
            '08_16': [],
            '16_24': []
        };

        slots.forEach(slot => {
            if (grouped[slot.shift_code]) {
                grouped[slot.shift_code].push(slot.slot_time);
            }
        });

        res.json({
            success: true,
            office_code: userOffice,
            total_slots: slots.length,
            slots: grouped
        });

    } catch (error) {
        console.error('Error fetching slot template:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/board
// Fetch slate data for display (today + tomorrow, or specific date)
// ----------------------------------------------------------------------------
router.get('/board', async (req, res) => {
    let conn;
    try {
        const { office_code, date, days = 2 } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Calculate date range (use IST date as default)
        const startDate = date || getISTDate();
        const numDays = Math.min(parseInt(days) || 2, 7); // Max 7 days

        // First, ensure slots exist for the date range (call stored procedure)
        for (let i = 0; i < numDays; i++) {
            const d = new Date(startDate + 'T00:00:00');
            d.setDate(d.getDate() + i);
            const dateStr = formatLocalDate(d);
            await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, dateStr]);
        }

        // Fetch all slots with staff data and incoming details from detail book log
        const [slots] = await conn.query(`
            SELECT
                ds.id,
                ds.slot_date,
                ds.slot_time,
                ds.shift_code,
                ds.is_adhoc,
                ds.lp_hrms_id,
                lp.name AS lp_name,
                lp.current_cms_id AS lp_cms_id,
                ds.lp_status,
                ds.lp_exception,
                ds.lp_exception_remark,
                DATE_FORMAT(ds.lp_signed_on_at, '%Y-%m-%d %H:%i:%s') AS lp_signed_on_at,
                ds.lp_late_reason,
                ds.lp_detention,
                ds.lp_detention_remark,
                lp_log.incoming_detail AS lp_incoming,
                lp_log.loco_no AS lp_incoming_loco,
                lp_log.is_pilot AS lp_is_pilot,
                ds.alp_hrms_id,
                alp.name AS alp_name,
                alp.current_cms_id AS alp_cms_id,
                ds.alp_status,
                ds.alp_exception,
                ds.alp_exception_remark,
                DATE_FORMAT(ds.alp_signed_on_at, '%Y-%m-%d %H:%i:%s') AS alp_signed_on_at,
                ds.alp_late_reason,
                ds.alp_detention,
                ds.alp_detention_remark,
                ds.alp_cross_slot_time,
                COALESCE(alp_log.alp_incoming_detail, alp_log.incoming_detail) AS alp_incoming,
                alp_log.loco_no AS alp_incoming_loco,
                COALESCE(alp_log.alp_is_pilot, alp_log.is_pilot) AS alp_is_pilot,
                lp_log.sign_off_time AS lp_sign_off_time,
                COALESCE(alp_log.alp_sign_off_time, alp_log.sign_off_time) AS alp_sign_off_time,
                ds.train_no,
                ds.loco_no,
                ds.is_pilot,
                ds.booking_remarks,
                ds.booked_at,
                ds.lp_safe_sign_off_time,
                ds.alp_safe_sign_off_time,
                ds.alp_source,
                ds.alp_source_name,
                ds.alp_source_depot,
                ds.extra_alp_hrms_id,
                extra_alp.name AS extra_alp_name,
                extra_alp.current_cms_id AS extra_alp_cms_id,
                ds.extra_alp_source,
                ds.extra_alp_source_name,
                ds.extra_alp_source_depot,
                ds.last_modified,
                CASE
                    WHEN ds.last_modified > DATE_SUB(${SQL_NOW_IST}, INTERVAL 3 MINUTE) THEN 1
                    ELSE 0
                END AS is_recently_modified
            FROM div_daily_slate ds
            LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
            LEFT JOIN div_detail_book_log lp_log ON ds.lp_detail_book_id = lp_log.id
            LEFT JOIN div_detail_book_log alp_log ON ds.alp_detail_book_id = alp_log.id
            LEFT JOIN div_staff_master extra_alp ON ds.extra_alp_hrms_id = extra_alp.hrms_id
            WHERE ds.office_code = ?
              AND ds.slot_date >= ?
              AND ds.slot_date < DATE_ADD(?, INTERVAL ? DAY)
            ORDER BY ds.slot_date, ds.slot_time, ds.is_adhoc
        `, [userOffice, startDate, startDate, numDays]);

        // Collect unique hrms_ids to fetch fatigue and PR data efficiently
        const hrmsIds = new Set();
        slots.forEach(slot => {
            if (slot.lp_hrms_id) hrmsIds.add(slot.lp_hrms_id);
            if (slot.alp_hrms_id) hrmsIds.add(slot.alp_hrms_id);
        });

        // Fetch fatigue data (night streaks) for all staff
        const fatigueMap = {};
        if (hrmsIds.size > 0) {
            const [fatigueRows] = await conn.query(`
                SELECT hrms_id, current_night_streak
                FROM div_staff_fatigue_tracker
                WHERE hrms_id IN (?) AND current_night_streak >= 3
            `, [Array.from(hrmsIds)]);
            fatigueRows.forEach(row => {
                fatigueMap[row.hrms_id] = row.current_night_streak;
            });
        }

        // Fetch PR data (consecutive duty days) for all staff - count days AFTER last PR or MULTI_DAY_LEAVE
        // Short leave (1-3 days) counts toward streak, PR and MULTI_DAY_LEAVE reset it
        const prMap = {};
        if (hrmsIds.size > 0) {
            const hrmsArray = Array.from(hrmsIds);
            const [prRows] = await conn.query(`
                SELECT hrms_id, COUNT(DISTINCT shift_date) AS duty_days
                FROM (
                    SELECT d1.lp_hrms_id AS hrms_id, d1.shift_date FROM div_detail_book_log d1
                    WHERE d1.lp_hrms_id IN (?)
                      AND d1.lp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE')
                      AND d1.shift_date >= DATE_SUB(${SQL_CURDATE_IST}, INTERVAL 10 DAY)
                      AND d1.shift_date <= ${SQL_CURDATE_IST}
                      AND d1.shift_date > COALESCE(
                          (SELECT MAX(d2.shift_date) FROM div_detail_book_log d2
                           WHERE d2.lp_hrms_id = d1.lp_hrms_id AND d2.lp_rest_type IN ('PR', 'MULTI_DAY_LEAVE')),
                          '1970-01-01'
                      )
                    UNION ALL
                    SELECT d1.alp_hrms_id AS hrms_id, d1.shift_date FROM div_detail_book_log d1
                    WHERE d1.alp_hrms_id IN (?)
                      AND d1.alp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE')
                      AND d1.shift_date >= DATE_SUB(${SQL_CURDATE_IST}, INTERVAL 10 DAY)
                      AND d1.shift_date <= ${SQL_CURDATE_IST}
                      AND d1.shift_date > COALESCE(
                          (SELECT MAX(d2.shift_date) FROM div_detail_book_log d2
                           WHERE d2.alp_hrms_id = d1.alp_hrms_id AND d2.alp_rest_type IN ('PR', 'MULTI_DAY_LEAVE')),
                          '1970-01-01'
                      )
                ) AS combined
                GROUP BY hrms_id
                HAVING duty_days >= 5
            `, [hrmsArray, hrmsArray]);
            prRows.forEach(row => {
                prMap[row.hrms_id] = row.duty_days;
            });
        }

        // Add fatigue and PR indicators to each slot
        slots.forEach(slot => {
            slot.lp_night_streak = fatigueMap[slot.lp_hrms_id] || null;
            slot.lp_pr_days = prMap[slot.lp_hrms_id] || null;
            slot.alp_night_streak = fatigueMap[slot.alp_hrms_id] || null;
            slot.alp_pr_days = prMap[slot.alp_hrms_id] || null;
        });

        conn.release();

        // Group by date and shift
        const board = {};
        slots.forEach(slot => {
            const dateKey = formatLocalDate(new Date(slot.slot_date));
            if (!board[dateKey]) {
                board[dateKey] = {
                    '00_08': [],
                    '08_16': [],
                    '16_24': []
                };
            }
            if (board[dateKey][slot.shift_code]) {
                board[dateKey][slot.shift_code].push(slot);
            }
        });

        // Calculate vacancy counts
        const vacancy = {};
        Object.keys(board).forEach(dateKey => {
            vacancy[dateKey] = {
                lp: { '00_08': 0, '08_16': 0, '16_24': 0 },
                alp: { '00_08': 0, '08_16': 0, '16_24': 0 }
            };
            Object.keys(board[dateKey]).forEach(shift => {
                board[dateKey][shift].forEach(slot => {
                    if (!slot.lp_hrms_id) vacancy[dateKey].lp[shift]++;
                    if (!slot.alp_hrms_id) vacancy[dateKey].alp[shift]++;
                });
            });
        });

        res.json({
            success: true,
            office_code: userOffice,
            start_date: startDate,
            days: numDays,
            board: board,
            vacancy: vacancy
        });

    } catch (error) {
        console.error('Error fetching board:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/arrival
// Process arrival: log in detail_book_log and assign to daily_slate
// ----------------------------------------------------------------------------
router.post('/arrival', async (req, res) => {
    let conn;
    try {
        const {
            office_code,
            incoming_detail,
            loco_no,
            sign_on_time,
            sign_off_time,
            is_pilot,
            // LP data
            lp_hrms_id,
            lp_rest_type,
            lp_leave,  // Leave selection: '0', '1B', '2B', '3B', '1A', '2A', '3A', 'MULTI'
            lp_next_slot_date,
            lp_next_slot_time,
            // ALP data (optional)
            alp_hrms_id,
            alp_rest_type,
            alp_leave,  // Leave selection for ALP
            alp_next_slot_date,
            alp_next_slot_time,
            // ALP overrides (null = same as LP)
            alp_incoming_detail,
            alp_sign_off_time,
            alp_is_pilot,
            // Collision handling flags
            force_adhoc_lp,  // If true, create adhoc slot instead of bumping
            force_adhoc_alp,
            // Source slate to mark as signed-off (for returning crew)
            source_slate_id,
            // Manual mode flag - clear existing cards when set
            is_manual_mode
        } = req.body;

        const userOffice = req.session.user?.div_office_code || office_code;

        console.log(`[ARRIVAL] Request received - LP: ${lp_hrms_id} -> ${lp_next_slot_date} ${lp_next_slot_time}, ALP: ${alp_hrms_id} -> ${alp_next_slot_date} ${alp_next_slot_time}`);

        // Validation - at least one of LP or ALP must be provided
        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }
        if (!lp_hrms_id && !alp_hrms_id) {
            return res.status(400).json({ error: 'At least one staff (LP or ALP) required' });
        }

        // Validate dates are not 'pick' (from unselected date picker)
        if (lp_next_slot_date === 'pick') {
            return res.status(400).json({ error: 'Please select a valid date for LP slot' });
        }
        if (alp_next_slot_date === 'pick') {
            return res.status(400).json({ error: 'Please select a valid date for ALP slot' });
        }

        conn = await req.app.locals.pool.getConnection();
        await conn.beginTransaction();

        // Prevent duplicate PR entries for same staff on same date
        if (lp_rest_type === 'PR' && lp_hrms_id) {
            const [existingPR] = await conn.query(`
                SELECT id FROM div_detail_book_log
                WHERE lp_hrms_id = ? AND lp_rest_type = 'PR' AND shift_date = ${SQL_CURDATE_IST}
                LIMIT 1
            `, [lp_hrms_id]);
            if (existingPR.length > 0) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ error: 'PR already marked for this staff today' });
            }
        }

        // Clear existing returning cards for staff if manual mode
        // This prevents duplicate cards when user does manual entry instead of using card
        if (is_manual_mode) {
            if (lp_hrms_id) {
                await conn.query(`
                    UPDATE div_daily_slate
                    SET lp_status = 'AVAILABLE', lp_hrms_id = NULL
                    WHERE office_code = ?
                      AND lp_hrms_id = ?
                      AND lp_status IN ('BOOKED', 'ONLINE')
                      AND TIMESTAMPDIFF(HOUR, CONCAT(slot_date, ' ', slot_time), NOW()) >= 5
                `, [userOffice, lp_hrms_id]);
                console.log(`[ARRIVAL] Cleared existing LP cards for ${lp_hrms_id}`);
            }
            if (alp_hrms_id) {
                await conn.query(`
                    UPDATE div_daily_slate
                    SET alp_status = 'AVAILABLE', alp_hrms_id = NULL
                    WHERE office_code = ?
                      AND alp_hrms_id = ?
                      AND alp_status IN ('BOOKED', 'ONLINE')
                      AND TIMESTAMPDIFF(HOUR, CONCAT(slot_date, ' ', slot_time), NOW()) >= 5
                `, [userOffice, alp_hrms_id]);
                console.log(`[ARRIVAL] Cleared existing ALP cards for ${alp_hrms_id}`);
            }
        }

        // Calculate shift_date and shift_code
        let shiftDate, shiftCode;
        if (sign_off_time) {
            const signOffDate = new Date(sign_off_time);
            shiftDate = sign_off_time.split(' ')[0]; // Extract YYYY-MM-DD
            const signOffHour = signOffDate.getHours();
            shiftCode = '00_08';
            if (signOffHour >= 8 && signOffHour < 16) shiftCode = '08_16';
            else if (signOffHour >= 16) shiftCode = '16_24';
        } else {
            // Manual entry - use current IST date/time
            const istNow = getISTDateTime();
            shiftDate = formatLocalDate(istNow);
            const currentHour = istNow.getHours();
            shiftCode = '00_08';
            if (currentHour >= 8 && currentHour < 16) shiftCode = '08_16';
            else if (currentHour >= 16) shiftCode = '16_24';
        }

        // 1. Insert into detail_book_log
        const [logResult] = await conn.query(`
            INSERT INTO div_detail_book_log (
                office_code, incoming_detail, loco_no, sign_on_time, sign_off_time, is_pilot,
                lp_hrms_id, lp_rest_type, lp_next_slot_date, lp_next_slot_time,
                alp_hrms_id, alp_rest_type, alp_next_slot_date, alp_next_slot_time,
                alp_incoming_detail, alp_sign_off_time, alp_is_pilot,
                shift_date, shift_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userOffice, incoming_detail, loco_no, sign_on_time, sign_off_time, is_pilot || false,
            lp_hrms_id, lp_rest_type, lp_next_slot_date, lp_next_slot_time,
            alp_hrms_id || null, alp_rest_type || null, alp_next_slot_date || null, alp_next_slot_time || null,
            alp_incoming_detail || null, alp_sign_off_time || null, alp_is_pilot,
            shiftDate, shiftCode
        ]);

        const logId = logResult.insertId;

        // 1b. Create leave day entries based on leave selection
        // Parse leave selection: '1B' = 1 day before, '2A' = 2 days after, etc.
        const parseLeave = (leave) => {
            if (!leave || leave === '0' || leave === 'MULTI') return { days: 0, position: null };
            const days = parseInt(leave.charAt(0));
            const position = leave.charAt(1) === 'B' ? 'before' : 'after';
            return { days, position };
        };

        const createLeaveEntries = async (hrmsId, leave, restType, baseDate, role) => {
            const { days, position } = parseLeave(leave);
            if (days === 0) return;

            const baseDateObj = new Date(baseDate);

            if (position === 'before') {
                // Leave days come before rest
                // Day 1 after sign-off is first leave day, then more leave days, then rest
                for (let i = 1; i <= days; i++) {
                    const leaveDate = new Date(baseDateObj);
                    leaveDate.setDate(leaveDate.getDate() + i);
                    const leaveDateStr = leaveDate.toISOString().split('T')[0];

                    await conn.query(`
                        INSERT INTO div_detail_book_log (
                            office_code, incoming_detail, shift_date, shift_code,
                            ${role}_hrms_id, ${role}_rest_type
                        ) VALUES (?, 'off/leave', ?, '08_16', ?, 'SHORT_LEAVE')
                    `, [userOffice, leaveDateStr, hrmsId]);
                }

                // If PR is selected, create PR entry after leave days
                if (restType === 'PR') {
                    const prDate = new Date(baseDateObj);
                    prDate.setDate(prDate.getDate() + days + 1);
                    const prDateStr = prDate.toISOString().split('T')[0];

                    await conn.query(`
                        INSERT INTO div_detail_book_log (
                            office_code, incoming_detail, shift_date, shift_code,
                            ${role}_hrms_id, ${role}_rest_type
                        ) VALUES (?, 'off/rest', ?, '08_16', ?, 'PR')
                    `, [userOffice, prDateStr, hrmsId]);
                }
            } else if (position === 'after') {
                // Leave days come after rest
                // If PR, rest day is day 1-2, then leave days start
                const restDays = (restType === 'PR') ? 2 : 1;

                for (let i = 1; i <= days; i++) {
                    const leaveDate = new Date(baseDateObj);
                    leaveDate.setDate(leaveDate.getDate() + restDays + i);
                    const leaveDateStr = leaveDate.toISOString().split('T')[0];

                    await conn.query(`
                        INSERT INTO div_detail_book_log (
                            office_code, incoming_detail, shift_date, shift_code,
                            ${role}_hrms_id, ${role}_rest_type
                        ) VALUES (?, 'off/leave', ?, '08_16', ?, 'SHORT_LEAVE')
                    `, [userOffice, leaveDateStr, hrmsId]);
                }
            }
        };

        // Create leave entries for LP
        if (lp_hrms_id && lp_leave && lp_leave !== '0' && lp_leave !== 'MULTI') {
            await createLeaveEntries(lp_hrms_id, lp_leave, lp_rest_type, shiftDate, 'lp');
        }

        // Create leave entries for ALP
        if (alp_hrms_id && alp_leave && alp_leave !== '0' && alp_leave !== 'MULTI') {
            await createLeaveEntries(alp_hrms_id, alp_leave, alp_rest_type, shiftDate, 'alp');
        }

        // 2. Assign LP to slot (if LP provided and not multi-day leave)
        let lpSlotId = null;
        let lpIsAdhoc = false;
        let lpActualSlotDate = lp_next_slot_date;
        let lpActualSlotTime = lp_next_slot_time;
        if (lp_hrms_id && lp_rest_type !== 'MULTI_DAY_LEAVE' && lp_next_slot_date && lp_next_slot_time) {
            // Ensure slot exists
            await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, lp_next_slot_date]);

            // Determine shift_code for the slot time
            const lpSlotHour = parseInt(lp_next_slot_time.split(':')[0]);
            let lpShiftCode = '00_08';
            if (lpSlotHour >= 8 && lpSlotHour < 16) lpShiftCode = '08_16';
            else if (lpSlotHour >= 16) lpShiftCode = '16_24';

            // Find or create slot
            const [existingSlot] = await conn.query(`
                SELECT id, lp_hrms_id FROM div_daily_slate
                WHERE office_code = ? AND slot_date = ? AND slot_time = ? AND is_adhoc = 0
            `, [userOffice, lp_next_slot_date, lp_next_slot_time]);

            if (existingSlot.length > 0 && !existingSlot[0].lp_hrms_id) {
                // Update existing empty slot - link to detail_book_log for incoming details
                await conn.query(`
                    UPDATE div_daily_slate
                    SET lp_hrms_id = ?, lp_status = 'AVAILABLE', lp_detail_book_id = ?, last_modified = NOW()
                    WHERE id = ?
                `, [lp_hrms_id, logId, existingSlot[0].id]);
                lpSlotId = existingSlot[0].id;
            } else if (existingSlot.length > 0 && existingSlot[0].lp_hrms_id) {
                // Slot occupied - check if user wants adhoc or next available
                if (force_adhoc_lp) {
                    // First check if there's an existing adhoc row with vacant LP
                    const [existingAdhocWithVacancy] = await conn.query(`
                        SELECT id FROM div_daily_slate
                        WHERE office_code = ? AND slot_date = ? AND slot_time = ?
                          AND is_adhoc > 0 AND lp_hrms_id IS NULL
                        ORDER BY is_adhoc ASC LIMIT 1
                    `, [userOffice, lp_next_slot_date, lp_next_slot_time]);

                    if (existingAdhocWithVacancy.length > 0) {
                        // Fill the vacant LP spot in existing adhoc row
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET lp_hrms_id = ?, lp_status = 'AVAILABLE', lp_detail_book_id = ?, last_modified = NOW()
                            WHERE id = ?
                        `, [lp_hrms_id, logId, existingAdhocWithVacancy[0].id]);
                        lpSlotId = existingAdhocWithVacancy[0].id;
                        lpIsAdhoc = true;
                    } else {
                        // No vacancy - create new adhoc row
                        const [maxAdhoc] = await conn.query(`
                            SELECT COALESCE(MAX(is_adhoc), 0) + 1 AS next_adhoc
                            FROM div_daily_slate
                            WHERE office_code = ? AND slot_date = ? AND slot_time = ?
                        `, [userOffice, lp_next_slot_date, lp_next_slot_time]);
                        const nextAdhocNum = maxAdhoc[0].next_adhoc;

                        // Create adhoc entry at the same slot time - link to detail_book_log
                        const [adhocResult] = await conn.query(`
                            INSERT INTO div_daily_slate
                            (office_code, slot_date, slot_time, shift_code, is_adhoc, lp_hrms_id, lp_status, lp_detail_book_id, last_modified)
                            VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, NOW())
                        `, [userOffice, lp_next_slot_date, lp_next_slot_time, lpShiftCode, nextAdhocNum, lp_hrms_id, logId]);
                        lpSlotId = adhocResult.insertId;
                        lpIsAdhoc = true;
                    }
                } else {
                    // Find next available slot (search across dates for edge cases like 23:45)
                    // First ensure next day slots exist
                    const nextDay = new Date(lp_next_slot_date + 'T00:00:00');
                    nextDay.setDate(nextDay.getDate() + 1);
                    await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, formatLocalDate(nextDay)]);

                    console.log(`[LP COLLISION] Finding next slot after ${lp_next_slot_date} ${lp_next_slot_time} for office ${userOffice}`);

                    const [nextSlot] = await conn.query(`
                        SELECT id, slot_date, slot_time FROM div_daily_slate
                        WHERE office_code = ?
                          AND lp_hrms_id IS NULL
                          AND is_adhoc = 0
                          AND CONCAT(slot_date, ' ', slot_time) > CONCAT(?, ' ', ?)
                          AND CONCAT(slot_date, ' ', slot_time) >= ${SQL_NOW_IST}
                        ORDER BY slot_date ASC, slot_time ASC
                        LIMIT 1
                    `, [userOffice, lp_next_slot_date, lp_next_slot_time]);

                    console.log(`[LP COLLISION] Found slot:`, nextSlot.length > 0 ? `${nextSlot[0].slot_date} ${nextSlot[0].slot_time}` : 'NONE');

                    if (nextSlot.length > 0) {
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET lp_hrms_id = ?, lp_status = 'AVAILABLE', lp_detail_book_id = ?, last_modified = NOW()
                            WHERE id = ?
                        `, [lp_hrms_id, logId, nextSlot[0].id]);
                        lpSlotId = nextSlot[0].id;
                        // Track actual slot used (different from requested due to collision)
                        lpActualSlotDate = formatLocalDate(nextSlot[0].slot_date);
                        lpActualSlotTime = nextSlot[0].slot_time;
                    }
                }
            }

            // Update fatigue tracker (only for duty arrivals with LP, not manual entries)
            if (lp_hrms_id && sign_on_time && sign_off_time) {
                await conn.query('CALL sp_update_night_streak(?, ?, ?, ?)', [
                    userOffice, lp_hrms_id, sign_on_time, sign_off_time
                ]);
            }
        }

        // 3. Assign ALP to slot (if exists and not multi-day leave)
        let alpSlotId = null;
        let alpIsAdhoc = false;
        let alpActualSlotDate = alp_next_slot_date;
        let alpActualSlotTime = alp_next_slot_time;
        if (alp_hrms_id && alp_rest_type !== 'MULTI_DAY_LEAVE' && alp_next_slot_date && alp_next_slot_time) {
            await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, alp_next_slot_date]);

            // Determine shift_code for the slot time
            const alpSlotHour = parseInt(alp_next_slot_time.split(':')[0]);
            let alpShiftCode = '00_08';
            if (alpSlotHour >= 8 && alpSlotHour < 16) alpShiftCode = '08_16';
            else if (alpSlotHour >= 16) alpShiftCode = '16_24';

            const [existingSlot] = await conn.query(`
                SELECT id, alp_hrms_id FROM div_daily_slate
                WHERE office_code = ? AND slot_date = ? AND slot_time = ? AND is_adhoc = 0
            `, [userOffice, alp_next_slot_date, alp_next_slot_time]);

            if (existingSlot.length > 0 && !existingSlot[0].alp_hrms_id) {
                await conn.query(`
                    UPDATE div_daily_slate
                    SET alp_hrms_id = ?, alp_status = 'AVAILABLE', alp_detail_book_id = ?, last_modified = NOW()
                    WHERE id = ?
                `, [alp_hrms_id, logId, existingSlot[0].id]);
                alpSlotId = existingSlot[0].id;
            } else if (existingSlot.length > 0 && existingSlot[0].alp_hrms_id) {
                // Slot occupied - check if user wants adhoc or next available
                if (force_adhoc_alp) {
                    // Check if LP just created an adhoc row for the same slot (same date/time)
                    // If so, add ALP to that row instead of creating a new one
                    if (lpIsAdhoc && lpSlotId && lp_next_slot_date === alp_next_slot_date && lp_next_slot_time === alp_next_slot_time) {
                        // Update the LP's adhoc row to also include this ALP
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET alp_hrms_id = ?, alp_status = 'AVAILABLE', alp_detail_book_id = ?, last_modified = NOW()
                            WHERE id = ?
                        `, [alp_hrms_id, logId, lpSlotId]);
                        alpSlotId = lpSlotId;
                        alpIsAdhoc = true;
                    } else {
                        // Check if there's an existing adhoc row with vacant ALP
                        const [existingAdhocWithVacancy] = await conn.query(`
                            SELECT id FROM div_daily_slate
                            WHERE office_code = ? AND slot_date = ? AND slot_time = ?
                              AND is_adhoc > 0 AND alp_hrms_id IS NULL
                            ORDER BY is_adhoc ASC LIMIT 1
                        `, [userOffice, alp_next_slot_date, alp_next_slot_time]);

                        if (existingAdhocWithVacancy.length > 0) {
                            // Fill the vacant ALP spot in existing adhoc row
                            await conn.query(`
                                UPDATE div_daily_slate
                                SET alp_hrms_id = ?, alp_status = 'AVAILABLE', alp_detail_book_id = ?, last_modified = NOW()
                                WHERE id = ?
                            `, [alp_hrms_id, logId, existingAdhocWithVacancy[0].id]);
                            alpSlotId = existingAdhocWithVacancy[0].id;
                            alpIsAdhoc = true;
                        } else {
                            // No vacancy - create new adhoc row
                            const [maxAdhoc] = await conn.query(`
                                SELECT COALESCE(MAX(is_adhoc), 0) + 1 AS next_adhoc
                                FROM div_daily_slate
                                WHERE office_code = ? AND slot_date = ? AND slot_time = ?
                            `, [userOffice, alp_next_slot_date, alp_next_slot_time]);
                            const nextAdhocNum = maxAdhoc[0].next_adhoc;

                            // Create adhoc entry at the same slot time - link to detail_book_log
                            const [adhocResult] = await conn.query(`
                                INSERT INTO div_daily_slate
                                (office_code, slot_date, slot_time, shift_code, is_adhoc, alp_hrms_id, alp_status, alp_detail_book_id, last_modified)
                                VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, NOW())
                            `, [userOffice, alp_next_slot_date, alp_next_slot_time, alpShiftCode, nextAdhocNum, alp_hrms_id, logId]);
                            alpSlotId = adhocResult.insertId;
                            alpIsAdhoc = true;
                        }
                    }
                } else {
                    // Collision - find next available ALP slot (search across dates)
                    // First ensure next day slots exist
                    const nextDay = new Date(alp_next_slot_date + 'T00:00:00');
                    nextDay.setDate(nextDay.getDate() + 1);
                    await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, formatLocalDate(nextDay)]);

                    const [nextSlot] = await conn.query(`
                        SELECT id, slot_date, slot_time FROM div_daily_slate
                        WHERE office_code = ?
                          AND alp_hrms_id IS NULL
                          AND is_adhoc = 0
                          AND CONCAT(slot_date, ' ', slot_time) > CONCAT(?, ' ', ?)
                          AND CONCAT(slot_date, ' ', slot_time) >= ${SQL_NOW_IST}
                        ORDER BY slot_date ASC, slot_time ASC
                        LIMIT 1
                    `, [userOffice, alp_next_slot_date, alp_next_slot_time]);

                    if (nextSlot.length > 0) {
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET alp_hrms_id = ?, alp_status = 'AVAILABLE', alp_detail_book_id = ?, last_modified = NOW()
                            WHERE id = ?
                        `, [alp_hrms_id, logId, nextSlot[0].id]);
                        alpSlotId = nextSlot[0].id;
                        // Track actual slot used (different from requested due to collision)
                        alpActualSlotDate = formatLocalDate(nextSlot[0].slot_date);
                        alpActualSlotTime = nextSlot[0].slot_time;
                    }
                }
            }

            // Update ALP fatigue tracker (only for duty arrivals)
            if (sign_on_time && sign_off_time) {
                const alpSignOff = alp_sign_off_time || sign_off_time;
                await conn.query('CALL sp_update_night_streak(?, ?, ?, ?)', [
                    userOffice, alp_hrms_id, sign_on_time, alpSignOff
                ]);
            }
        }

        // 4. Mark source slot as completed (for returning crew)
        // Handle partial sign-off: only clear the staff that signed off
        if (source_slate_id) {
            if (lp_hrms_id && alp_hrms_id) {
                // Both signing off - clear entire slot
                await conn.query(`
                    UPDATE div_daily_slate
                    SET lp_status = 'AVAILABLE', lp_hrms_id = NULL,
                        alp_status = 'AVAILABLE', alp_hrms_id = NULL
                    WHERE id = ?
                `, [source_slate_id]);
                console.log(`[ARRIVAL] Cleared entire slot ${source_slate_id}`);
            } else if (lp_hrms_id && !alp_hrms_id) {
                // Only LP signing off - keep ALP on card
                await conn.query(`
                    UPDATE div_daily_slate
                    SET lp_status = 'AVAILABLE', lp_hrms_id = NULL
                    WHERE id = ?
                `, [source_slate_id]);
                console.log(`[ARRIVAL] Cleared LP from slot ${source_slate_id}, ALP remains`);
            } else if (!lp_hrms_id && alp_hrms_id) {
                // Only ALP signing off - keep LP on card
                await conn.query(`
                    UPDATE div_daily_slate
                    SET alp_status = 'AVAILABLE', alp_hrms_id = NULL
                    WHERE id = ?
                `, [source_slate_id]);
                console.log(`[ARRIVAL] Cleared ALP from slot ${source_slate_id}, LP remains`);
            }
        }

        // 5. Flag leave conflicts (if staff has approved leave but signed off for duty)
        const signOffDate = sign_off_time ? sign_off_time.split('T')[0] || sign_off_time.split(' ')[0] : getISTDate();

        // Check LP leave conflict
        if (lp_hrms_id && lp_next_slot_date) {
            await conn.query(`
                UPDATE div_leave_tracking
                SET remarks = CONCAT(IFNULL(remarks, ''), ' [CONFLICT: Assigned duty on ', ?, ' - Log#', ?, ']')
                WHERE staff_hrms_id = ?
                  AND status = 'Approved'
                  AND from_date <= ? AND to_date >= ?
            `, [lp_next_slot_date, logId, lp_hrms_id, lp_next_slot_date, lp_next_slot_date]);
        }

        // Check ALP leave conflict
        if (alp_hrms_id && alp_next_slot_date) {
            await conn.query(`
                UPDATE div_leave_tracking
                SET remarks = CONCAT(IFNULL(remarks, ''), ' [CONFLICT: Assigned duty on ', ?, ' - Log#', ?, ']')
                WHERE staff_hrms_id = ?
                  AND status = 'Approved'
                  AND from_date <= ? AND to_date >= ?
            `, [alp_next_slot_date, logId, alp_hrms_id, alp_next_slot_date, alp_next_slot_date]);
        }

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            message: 'Arrival processed successfully',
            log_id: logId,
            lp_slot_id: lpSlotId,
            lp_is_adhoc: lpIsAdhoc,
            lp_slot_date: lpActualSlotDate,
            lp_slot_time: lpActualSlotTime,
            alp_slot_id: alpSlotId,
            alp_is_adhoc: alpIsAdhoc,
            alp_slot_date: alpActualSlotDate,
            alp_slot_time: alpActualSlotTime
        });

    } catch (error) {
        console.error('Error processing arrival:', error);
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/update
// Update slot (assign train, change status, exceptions)
// Used by Supervisor for train assignment
// ----------------------------------------------------------------------------
router.post('/update', async (req, res) => {
    let conn;
    try {
        const {
            slot_id,
            train_no,
            loco_no,
            lp_status,
            alp_status,
            lp_exception,
            alp_exception,
            alp_cross_slot_time
        } = req.body;

        if (!slot_id) {
            return res.status(400).json({ error: 'Slot ID required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Build update
        let updates = [];
        let params = [];

        if (train_no !== undefined) {
            updates.push('train_no = ?');
            params.push(train_no || null);
        }
        if (loco_no !== undefined) {
            updates.push('loco_no = ?');
            params.push(loco_no || null);
        }
        if (lp_status !== undefined) {
            updates.push('lp_status = ?');
            params.push(lp_status);
        }
        if (alp_status !== undefined) {
            updates.push('alp_status = ?');
            params.push(alp_status);
        }
        if (lp_exception !== undefined) {
            updates.push('lp_exception = ?');
            params.push(lp_exception || null);
        }
        if (req.body.lp_exception_remark !== undefined) {
            updates.push('lp_exception_remark = ?');
            params.push(req.body.lp_exception_remark || null);
        }
        if (alp_exception !== undefined) {
            updates.push('alp_exception = ?');
            params.push(alp_exception || null);
        }
        if (req.body.alp_exception_remark !== undefined) {
            updates.push('alp_exception_remark = ?');
            params.push(req.body.alp_exception_remark || null);
        }
        if (alp_cross_slot_time !== undefined) {
            updates.push('alp_cross_slot_time = ?');
            params.push(alp_cross_slot_time || null);
        }

        // LP late arrival fields - setting sign-on time means staff is ONLINE (departed)
        if (req.body.lp_signed_on_at !== undefined) {
            if (req.body.lp_signed_on_at) {
                // Convert time string to full timestamp (IST date + time)
                updates.push(`lp_signed_on_at = CONCAT(${SQL_CURDATE_IST}, " ", ?)`);
                params.push(req.body.lp_signed_on_at);
                // Staff has departed - set status to BOOKED
                updates.push('lp_status = "BOOKED"');
            } else {
                updates.push('lp_signed_on_at = NULL');
            }
        }
        if (req.body.lp_late_reason !== undefined) {
            updates.push('lp_late_reason = ?');
            params.push(req.body.lp_late_reason || null);
        }
        if (req.body.lp_detention !== undefined) {
            updates.push('lp_detention = ?');
            params.push(req.body.lp_detention || null);
        }
        if (req.body.lp_detention_remark !== undefined) {
            updates.push('lp_detention_remark = ?');
            params.push(req.body.lp_detention_remark || null);
        }

        // ALP late arrival fields - setting sign-on time means staff is ONLINE (departed)
        if (req.body.alp_signed_on_at !== undefined) {
            if (req.body.alp_signed_on_at) {
                // Convert time string to full timestamp (IST date + time)
                updates.push(`alp_signed_on_at = CONCAT(${SQL_CURDATE_IST}, " ", ?)`);
                params.push(req.body.alp_signed_on_at);
                // Staff has departed - set status to BOOKED
                updates.push('alp_status = "BOOKED"');
            } else {
                updates.push('alp_signed_on_at = NULL');
            }
        }
        if (req.body.alp_late_reason !== undefined) {
            updates.push('alp_late_reason = ?');
            params.push(req.body.alp_late_reason || null);
        }
        if (req.body.alp_detention !== undefined) {
            updates.push('alp_detention = ?');
            params.push(req.body.alp_detention || null);
        }
        if (req.body.alp_detention_remark !== undefined) {
            updates.push('alp_detention_remark = ?');
            params.push(req.body.alp_detention_remark || null);
        }

        updates.push('last_modified = NOW()');
        params.push(slot_id);

        const [result] = await conn.query(`
            UPDATE div_daily_slate SET ${updates.join(', ')} WHERE id = ?
        `, params);

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        res.json({
            success: true,
            message: 'Slot updated successfully'
        });

    } catch (error) {
        console.error('Error updating slot:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// DELETE /api/division/slate/:id
// Remove staff from a slot (only for FORECAST/AVAILABLE, before sign-on)
// ----------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    let conn;
    try {
        const slotId = req.params.id;
        const { role, office_code } = req.query; // 'lp' or 'alp' - which staff to remove
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // First check if slot exists and get current status
        const [slot] = await conn.query(`
            SELECT id, slot_date, slot_time, is_adhoc,
                   lp_hrms_id, lp_status,
                   alp_hrms_id, alp_status
            FROM div_daily_slate
            WHERE id = ? AND office_code = ?
        `, [slotId, userOffice]);

        if (slot.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Slot not found' });
        }

        const entry = slot[0];
        const targetRole = role || 'lp';

        // Check status - only allow delete for FORECAST or AVAILABLE
        const status = targetRole === 'lp' ? entry.lp_status : entry.alp_status;
        if (status === 'BOOKED' || status === 'ONLINE' || status === 'SAFE') {
            conn.release();
            return res.status(400).json({
                error: 'Cannot remove staff who is already signed on or marked safe',
                status: status
            });
        }

        // If it's an adhoc row (is_adhoc > 0), delete the entire row
        // If it's a regular slot, just clear the LP/ALP fields
        if (entry.is_adhoc > 0) {
            // For adhoc: if removing LP and no ALP, or removing the only person, delete row
            if (targetRole === 'lp' && !entry.alp_hrms_id) {
                await conn.query('DELETE FROM div_daily_slate WHERE id = ?', [slotId]);
            } else if (targetRole === 'alp' && !entry.lp_hrms_id) {
                await conn.query('DELETE FROM div_daily_slate WHERE id = ?', [slotId]);
            } else if (targetRole === 'lp') {
                // Clear LP fields only
                await conn.query(`
                    UPDATE div_daily_slate SET
                        lp_hrms_id = NULL,
                        lp_status = 'AVAILABLE', lp_detail_book_id = NULL,
                        lp_exception = NULL, lp_exception_remark = NULL,
                        last_modified = NOW()
                    WHERE id = ?
                `, [slotId]);
            } else {
                // Clear ALP fields only
                await conn.query(`
                    UPDATE div_daily_slate SET
                        alp_hrms_id = NULL,
                        alp_status = 'AVAILABLE', alp_detail_book_id = NULL,
                        alp_exception = NULL, alp_exception_remark = NULL,
                        last_modified = NOW()
                    WHERE id = ?
                `, [slotId]);
            }
        } else {
            // Regular slot: just clear the staff fields
            if (targetRole === 'lp') {
                await conn.query(`
                    UPDATE div_daily_slate SET
                        lp_hrms_id = NULL,
                        lp_status = 'AVAILABLE', lp_detail_book_id = NULL,
                        lp_exception = NULL, lp_exception_remark = NULL,
                        last_modified = NOW()
                    WHERE id = ?
                `, [slotId]);
            } else {
                await conn.query(`
                    UPDATE div_daily_slate SET
                        alp_hrms_id = NULL,
                        alp_status = 'AVAILABLE', alp_detail_book_id = NULL,
                        alp_exception = NULL, alp_exception_remark = NULL,
                        last_modified = NOW()
                    WHERE id = ?
                `, [slotId]);
            }
        }

        conn.release();

        res.json({
            success: true,
            message: `${targetRole.toUpperCase()} removed from slot successfully`,
            deleted_adhoc_row: entry.is_adhoc > 0 &&
                ((targetRole === 'lp' && !entry.alp_hrms_id) || (targetRole === 'alp' && !entry.lp_hrms_id))
        });

    } catch (error) {
        console.error('Error deleting slot entry:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/staff/search
// Search staff for manual entry (LP or ALP dropdown)
// ----------------------------------------------------------------------------
router.get('/staff/search', async (req, res) => {
    let conn;
    try {
        const { office_code, q, type } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;
        const searchAllDepots = office_code === 'all';

        if ((!userOffice && !searchAllDepots) || !q || q.length < 2) {
            return res.status(400).json({ error: 'Office code and search query (min 2 chars) required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Determine designation filter
        let designationFilter = '';
        if (type === 'lp') {
            designationFilter = 'AND s.designation_id IN (3, 5)'; // LP designations
        } else if (type === 'alp') {
            designationFilter = 'AND s.designation_id IN (1, 2)'; // ALP designations
        }

        // Office filter - skip if searching all depots
        const officeFilter = searchAllDepots ? '' : 'AND s.current_office_code = ?';
        const queryParams = searchAllDepots ? [] : [userOffice];

        const searchTerm = `%${q}%`;

        const [staff] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code,
                d.designation_name,
                ft.current_night_streak
            FROM div_staff_master s
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_staff_fatigue_tracker ft ON s.hrms_id = ft.hrms_id
            WHERE s.status = 'Active'
              ${officeFilter}
              ${designationFilter}
              AND (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ?)
            ORDER BY s.name
            LIMIT 20
        `, [...queryParams, searchTerm, searchTerm, searchTerm]);

        conn.release();

        res.json({
            success: true,
            count: staff.length,
            data: staff
        });

    } catch (error) {
        console.error('Error searching staff:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/fatigue/:hrmsId
// Get fatigue warning for a specific staff
// ----------------------------------------------------------------------------
router.get('/fatigue/:hrmsId', async (req, res) => {
    let conn;
    try {
        const { hrmsId } = req.params;

        conn = await req.app.locals.pool.getConnection();

        const [tracker] = await conn.query(`
            SELECT current_night_streak, last_night_duty_date, total_night_duties
            FROM div_staff_fatigue_tracker
            WHERE hrms_id = ?
        `, [hrmsId]);

        conn.release();

        if (tracker.length === 0) {
            return res.json({
                success: true,
                data: { current_night_streak: 0, warning_level: null }
            });
        }

        const streak = tracker[0].current_night_streak;
        let warningLevel = null;
        if (streak >= 4) warningLevel = 'red';
        else if (streak >= 3) warningLevel = 'amber';

        res.json({
            success: true,
            data: {
                ...tracker[0],
                warning_level: warningLevel
            }
        });

    } catch (error) {
        console.error('Error fetching fatigue data:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/staff-warnings
// Comprehensive check for all warnings before slot assignment
// Checks: Leave (sanctioned/pending), Periodic Rest, Night Streak
// ----------------------------------------------------------------------------
router.post('/staff-warnings', async (req, res) => {
    let conn;
    try {
        const { hrms_id, next_slot_date, office_code } = req.body;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!hrms_id || !next_slot_date) {
            return res.status(400).json({ error: 'hrms_id and next_slot_date required' });
        }

        conn = await req.app.locals.pool.getConnection();

        const warnings = [];
        let canAssign = true;  // Hard block if false
        let needsPR = false;   // Suggests PR rest

        // 1. CHECK SANCTIONED LEAVE (Warning only - allow sign-off, conflict handled separately)
        const [sanctionedLeave] = await conn.query(`
            SELECT leave_type, from_date, to_date, status
            FROM div_leave_tracking
            WHERE staff_hrms_id = ?
              AND status = 'Approved'
              AND from_date <= ?
              AND to_date >= ?
            ORDER BY from_date ASC
            LIMIT 1
        `, [hrms_id, next_slot_date, next_slot_date]);

        if (sanctionedLeave.length > 0) {
            const leave = sanctionedLeave[0];
            warnings.push({
                type: 'SANCTIONED_LEAVE',
                level: 'warning',  // Changed from 'error' to 'warning' - allow sign-off
                message: `Approved ${leave.leave_type} from ${formatLocalDate(leave.from_date)} to ${formatLocalDate(leave.to_date)} - Leave/Detail conflict to resolve`,
                data: leave
            });
            // canAssign = false;  // Removed - allow sign-off, conflict handled separately
        }

        // 2. CHECK PENDING/APPLIED LEAVE (Warning only)
        const [pendingLeave] = await conn.query(`
            SELECT leave_type, from_date, to_date, status
            FROM div_leave_tracking
            WHERE staff_hrms_id = ?
              AND status IN ('Applied', 'Pending', 'Forwarded')
              AND from_date <= ?
              AND to_date >= ?
            ORDER BY from_date ASC
            LIMIT 1
        `, [hrms_id, next_slot_date, next_slot_date]);

        if (pendingLeave.length > 0) {
            const leave = pendingLeave[0];
            warnings.push({
                type: 'PENDING_LEAVE',
                level: 'warning',
                message: `${leave.status} ${leave.leave_type} from ${formatLocalDate(leave.from_date)} to ${formatLocalDate(leave.to_date)}`,
                data: leave
            });
        }

        // 3. CHECK PERIODIC REST (6 consecutive duty days = PR due)
        // Count duty days AFTER last PR or MULTI_DAY_LEAVE (short leave 1-3 days counts toward streak)
        const [dutyDays] = await conn.query(`
            SELECT COUNT(DISTINCT shift_date) AS consecutive_days
            FROM div_detail_book_log
            WHERE (
                (lp_hrms_id = ? AND lp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE'))
                OR (alp_hrms_id = ? AND alp_rest_type NOT IN ('PR', 'MULTI_DAY_LEAVE'))
            )
              AND shift_date >= DATE_SUB(?, INTERVAL 10 DAY)
              AND shift_date <= ?
              AND shift_date > COALESCE(
                  (SELECT MAX(shift_date) FROM div_detail_book_log
                   WHERE (lp_hrms_id = ? AND lp_rest_type IN ('PR', 'MULTI_DAY_LEAVE'))
                      OR (alp_hrms_id = ? AND alp_rest_type IN ('PR', 'MULTI_DAY_LEAVE'))),
                  '1970-01-01'
              )
        `, [hrms_id, hrms_id, next_slot_date, next_slot_date, hrms_id, hrms_id]);

        const consecutiveDays = dutyDays[0]?.consecutive_days || 0;
        if (consecutiveDays >= 6) {
            warnings.push({
                type: 'PERIODIC_REST_DUE',
                level: 'warning',
                message: `${consecutiveDays} consecutive duty days - PR (30hr rest) recommended`,
                data: { consecutive_days: consecutiveDays }
            });
            needsPR = true;
        }

        // 4. CHECK NIGHT STREAK (Fatigue) - Warning only, never blocks
        const [fatigue] = await conn.query(`
            SELECT current_night_streak, last_night_duty_date
            FROM div_staff_fatigue_tracker
            WHERE hrms_id = ?
        `, [hrms_id]);

        if (fatigue.length > 0 && fatigue[0].current_night_streak >= 3) {
            const streak = fatigue[0].current_night_streak;
            warnings.push({
                type: 'NIGHT_STREAK',
                level: 'warning',  // Always warning, never blocks
                message: `🌙${streak} consecutive night duties${streak >= 4 ? ' - Consider rest' : ''}`,
                data: fatigue[0]
            });
            // Never block for night streak - just warn
        }

        // 5. CHECK IF ALREADY ASSIGNED ON SAME DATE (Double booking)
        const [existingSlot] = await conn.query(`
            SELECT slot_time, shift_code,
                   CASE WHEN lp_hrms_id = ? THEN 'LP' ELSE 'ALP' END AS role
            FROM div_daily_slate
            WHERE office_code = ?
              AND slot_date = ?
              AND (lp_hrms_id = ? OR alp_hrms_id = ?)
            LIMIT 1
        `, [hrms_id, userOffice, next_slot_date, hrms_id, hrms_id]);

        if (existingSlot.length > 0) {
            const slot = existingSlot[0];
            warnings.push({
                type: 'ALREADY_ASSIGNED',
                level: 'error',
                message: `Already assigned as ${slot.role} at ${slot.slot_time.substring(0,5)} on this date`,
                data: slot
            });
            canAssign = false;
        }

        // 6. CHECK IF ASSIGNED TO PENDING SLOT ON ANOTHER DATE (not yet signed off)
        const [pendingSlot] = await conn.query(`
            SELECT slot_date, slot_time,
                   CASE WHEN lp_hrms_id = ? THEN 'LP' ELSE 'ALP' END AS role,
                   CASE WHEN lp_hrms_id = ? THEN lp_status ELSE alp_status END AS status
            FROM div_daily_slate
            WHERE office_code = ?
              AND slot_date != ?
              AND slot_date >= CURDATE() - INTERVAL 1 DAY
              AND (
                  (lp_hrms_id = ? AND lp_status NOT IN ('SAFE'))
                  OR (alp_hrms_id = ? AND alp_status NOT IN ('SAFE'))
              )
            ORDER BY slot_date ASC, slot_time ASC
            LIMIT 1
        `, [hrms_id, hrms_id, userOffice, next_slot_date, hrms_id, hrms_id]);

        if (pendingSlot.length > 0) {
            const slot = pendingSlot[0];
            const slotDateStr = new Date(slot.slot_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            warnings.push({
                type: 'PENDING_ASSIGNMENT',
                level: 'warning',
                message: `Already assigned as ${slot.role} at ${slot.slot_time.substring(0,5)} on ${slotDateStr} (${slot.status || 'pending'})`,
                data: slot
            });
            // Warning only - allow assignment but show caution
        }

        conn.release();

        res.json({
            success: true,
            hrms_id,
            next_slot_date,
            can_assign: canAssign,
            needs_pr: needsPR,
            warning_count: warnings.length,
            warnings
        });

    } catch (error) {
        console.error('Error checking staff warnings:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/check-leave
// Check if staff has any active leave application (for multi-day leave validation)
// ----------------------------------------------------------------------------
router.post('/check-leave', async (req, res) => {
    let conn;
    try {
        const { hrms_id, office_code } = req.body;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!hrms_id) {
            return res.status(400).json({ error: 'hrms_id required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Check for any leave (approved or pending) from today onwards (using IST date)
        const [leave] = await conn.query(`
            SELECT id, leave_type, from_date, to_date, status
            FROM div_leave_tracking
            WHERE staff_hrms_id = ?
              AND status IN ('Approved', 'Pending', 'Forwarded', 'Applied')
              AND to_date >= ${SQL_CURDATE_IST}
            ORDER BY from_date ASC
            LIMIT 1
        `, [hrms_id]);

        conn.release();

        res.json({
            success: true,
            hrms_id,
            has_leave: leave.length > 0,
            leave: leave.length > 0 ? {
                type: leave[0].leave_type,
                from: formatLocalDate(leave[0].from_date),
                to: formatLocalDate(leave[0].to_date),
                status: leave[0].status
            } : null
        });

    } catch (error) {
        console.error('Error checking leave:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/vacancy
// Get vacancy summary for dashboard
// ----------------------------------------------------------------------------
router.get('/vacancy', async (req, res) => {
    let conn;
    try {
        const { office_code, date } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;
        const targetDate = date || getISTDate();

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Ensure slots exist
        await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, targetDate]);

        const [vacancy] = await conn.query(`
            SELECT
                shift_code,
                SUM(CASE WHEN lp_hrms_id IS NULL THEN 1 ELSE 0 END) AS lp_vacant,
                SUM(CASE WHEN alp_hrms_id IS NULL THEN 1 ELSE 0 END) AS alp_vacant,
                COUNT(*) AS total_slots
            FROM div_daily_slate
            WHERE office_code = ? AND slot_date = ?
            GROUP BY shift_code
            ORDER BY FIELD(shift_code, '00_08', '08_16', '16_24')
        `, [userOffice, targetDate]);

        conn.release();

        res.json({
            success: true,
            office_code: userOffice,
            date: targetDate,
            data: vacancy
        });

    } catch (error) {
        console.error('Error fetching vacancy:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/check-availability
// Check if slots are available before submission (for collision detection)
// ----------------------------------------------------------------------------
router.post('/check-availability', async (req, res) => {
    let conn;
    try {
        const {
            office_code,
            lp_slot_date,
            lp_slot_time,
            alp_slot_date,
            alp_slot_time
        } = req.body;

        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        const result = {
            success: true,
            lp_collision: null,
            alp_collision: null
        };

        // Check LP slot
        if (lp_slot_date && lp_slot_time) {
            const [lpSlot] = await conn.query(`
                SELECT ds.id, ds.lp_hrms_id, s.name AS lp_name, ds.slot_time
                FROM div_daily_slate ds
                LEFT JOIN div_staff_master s ON ds.lp_hrms_id = s.hrms_id
                WHERE ds.office_code = ? AND ds.slot_date = ? AND ds.slot_time = ? AND ds.is_adhoc = 0
            `, [userOffice, lp_slot_date, lp_slot_time]);

            if (lpSlot.length > 0 && lpSlot[0].lp_hrms_id) {
                // Find next available slot (searching across dates for late slots like 23:45)
                const [nextLpSlot] = await conn.query(`
                    SELECT slot_date, slot_time FROM div_daily_slate
                    WHERE office_code = ? AND lp_hrms_id IS NULL AND is_adhoc = 0
                      AND CONCAT(slot_date, ' ', slot_time) > CONCAT(?, ' ', ?)
                    ORDER BY slot_date ASC, slot_time ASC
                    LIMIT 1
                `, [userOffice, lp_slot_date, lp_slot_time]);

                result.lp_collision = {
                    occupied_by: lpSlot[0].lp_name,
                    requested_time: lp_slot_time,
                    next_available: nextLpSlot.length > 0 ? nextLpSlot[0].slot_time : null,
                    next_available_date: nextLpSlot.length > 0 ? nextLpSlot[0].slot_date : null
                };
            }
        }

        // Check ALP slot
        if (alp_slot_date && alp_slot_time) {
            const [alpSlot] = await conn.query(`
                SELECT ds.id, ds.alp_hrms_id, s.name AS alp_name, ds.slot_time
                FROM div_daily_slate ds
                LEFT JOIN div_staff_master s ON ds.alp_hrms_id = s.hrms_id
                WHERE ds.office_code = ? AND ds.slot_date = ? AND ds.slot_time = ? AND ds.is_adhoc = 0
            `, [userOffice, alp_slot_date, alp_slot_time]);

            if (alpSlot.length > 0 && alpSlot[0].alp_hrms_id) {
                // Find next available slot (searching across dates for late slots like 23:45)
                const [nextAlpSlot] = await conn.query(`
                    SELECT slot_date, slot_time FROM div_daily_slate
                    WHERE office_code = ? AND alp_hrms_id IS NULL AND is_adhoc = 0
                      AND CONCAT(slot_date, ' ', slot_time) > CONCAT(?, ' ', ?)
                    ORDER BY slot_date ASC, slot_time ASC
                    LIMIT 1
                `, [userOffice, alp_slot_date, alp_slot_time]);

                result.alp_collision = {
                    occupied_by: alpSlot[0].alp_name,
                    requested_time: alp_slot_time,
                    next_available: nextAlpSlot.length > 0 ? nextAlpSlot[0].slot_time : null,
                    next_available_date: nextAlpSlot.length > 0 ? nextAlpSlot[0].slot_date : null
                };
            }
        }

        conn.release();
        res.json(result);

    } catch (error) {
        console.error('Error checking availability:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/booking
// Give booking (train assignment) to staff on slate
// ----------------------------------------------------------------------------
router.post('/booking', async (req, res) => {
    let conn;
    try {
        const {
            slot_id,
            train_no,
            loco_no,
            is_pilot,
            booking_remarks,
            // Which staff to book (checkboxes)
            book_lp,
            book_alp,
            // ALP selection (can be from different slot or external)
            alp_hrms_id,           // Selected ALP hrms_id (if different from slot's ALP)
            alp_source,            // 'SLATE', 'OUT_OF_SLATE', 'OTHER_DEPOT'
            alp_source_name,       // Manual name for OTHER_DEPOT
            alp_source_depot,      // Depot name for OTHER_DEPOT
            alp_original_slot_id,  // If ALP from different slot, their original slot ID
            // SAFE marking
            mark_safe,
            safe_sign_off_time,
            // Clear booking
            clear_booking,
            // Extra ALP (for double ALP requirement)
            extra_alp_hrms_id,
            extra_alp_source,
            extra_alp_source_name,
            extra_alp_source_depot,
            extra_alp_original_slot_id
        } = req.body;

        if (!slot_id) {
            return res.status(400).json({ error: 'Slot ID required' });
        }

        conn = await req.app.locals.pool.getConnection();
        await conn.beginTransaction();

        // Get current slot data
        const [currentSlot] = await conn.query(`
            SELECT * FROM div_daily_slate WHERE id = ?
        `, [slot_id]);

        if (currentSlot.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ error: 'Slot not found' });
        }

        const slot = currentSlot[0];

        // Handle CLEAR BOOKING
        if (clear_booking) {
            await conn.query(`
                UPDATE div_daily_slate
                SET train_no = NULL, loco_no = NULL, is_pilot = FALSE,
                    booking_remarks = NULL, booked_at = NULL, booked_by = NULL,
                    lp_status = CASE WHEN lp_hrms_id IS NOT NULL THEN 'AVAILABLE' ELSE lp_status END,
                    alp_status = CASE WHEN alp_hrms_id IS NOT NULL THEN 'AVAILABLE' ELSE alp_status END,
                    alp_source = 'SLATE', alp_source_name = NULL, alp_source_depot = NULL,
                    extra_alp_hrms_id = NULL, extra_alp_source = NULL, extra_alp_source_name = NULL,
                    extra_alp_source_depot = NULL, extra_alp_original_slot_id = NULL,
                    last_modified = NOW()
                WHERE id = ?
            `, [slot_id]);

            await conn.commit();
            conn.release();
            return res.json({ success: true, message: 'Booking cleared' });
        }

        // Handle SAFE marking
        if (mark_safe) {
            if (!safe_sign_off_time) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ error: 'Sign-off time required for SAFE marking' });
            }

            const updates = [];
            const params = [];

            if (book_lp && slot.lp_hrms_id) {
                updates.push('lp_status = ?', 'lp_safe_sign_off_time = ?');
                params.push('SAFE', safe_sign_off_time);
            }
            if (book_alp && slot.alp_hrms_id) {
                updates.push('alp_status = ?', 'alp_safe_sign_off_time = ?');
                params.push('SAFE', safe_sign_off_time);
            }

            if (updates.length > 0) {
                updates.push('last_modified = NOW()');
                params.push(slot_id);
                await conn.query(`UPDATE div_daily_slate SET ${updates.join(', ')} WHERE id = ?`, params);
            }

            // Create pending SAFE record for Detail Book to process
            // Format slot_date properly (it's a Date object from MySQL)
            const slotDateStr = formatLocalDate(slot.slot_date);
            const slotTimeStr = slot.slot_time.substring(0, 5); // HH:MM

            // Calculate full sign-off datetime
            const signOffDateTime = `${slotDateStr} ${safe_sign_off_time}:00`;
            const signOnDateTime = `${slotDateStr} ${slotTimeStr}:00`;

            // Determine shift_code based on sign-off time
            const signOffHour = parseInt(safe_sign_off_time.split(':')[0]);
            let shiftCode = '00_08';
            if (signOffHour >= 8 && signOffHour < 16) shiftCode = '08_16';
            else if (signOffHour >= 16) shiftCode = '16_24';

            // Check if pending SAFE entry already exists for same slot
            const lpHrmsForCheck = book_lp ? slot.lp_hrms_id : null;
            const alpHrmsForCheck = book_alp ? slot.alp_hrms_id : null;

            const [existingPending] = await conn.query(`
                SELECT id FROM div_detail_book_log
                WHERE office_code = ?
                  AND shift_date = ?
                  AND sign_on_time = ?
                  AND is_safe_pending = TRUE
                  AND (
                      (lp_hrms_id = ? AND ? IS NOT NULL)
                      OR (alp_hrms_id = ? AND ? IS NOT NULL)
                  )
                LIMIT 1
            `, [slot.office_code, slotDateStr, signOnDateTime, lpHrmsForCheck, lpHrmsForCheck, alpHrmsForCheck, alpHrmsForCheck]);

            if (existingPending.length > 0) {
                await conn.commit();
                conn.release();
                return res.json({ success: true, message: 'Already marked SAFE - pending in Detail Book' });
            }

            // Insert pending SAFE record into detail_book_log
            await conn.query(`
                INSERT INTO div_detail_book_log (
                    office_code, incoming_detail, loco_no, sign_on_time, sign_off_time, is_pilot,
                    lp_hrms_id, lp_rest_type,
                    alp_hrms_id, alp_rest_type,
                    shift_date, shift_code, remarks, is_safe_pending
                ) VALUES (?, 'SAFE', NULL, ?, ?, FALSE, ?, 'NORMAL', ?, 'NORMAL', ?, ?, 'Pending from Slate SAFE', TRUE)
            `, [
                slot.office_code,
                signOnDateTime,
                signOffDateTime,
                book_lp ? slot.lp_hrms_id : null,
                book_alp ? slot.alp_hrms_id : null,
                slotDateStr,
                shiftCode
            ]);

            await conn.commit();
            conn.release();
            return res.json({ success: true, message: 'Marked as SAFE - sent to Detail Book' });
        }

        // Handle BOOKING
        if (!train_no) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ error: 'Train number required for booking' });
        }

        // Update LP status if booking LP (but preserve BOOKED status - staff still on duty)
        let lpUpdate = '';
        if (book_lp && slot.lp_hrms_id && slot.lp_status !== 'BOOKED') {
            lpUpdate = ', lp_status = "BOOKED"';
        }

        // Handle ALP selection and status
        let alpUpdate = '';
        let alpParams = [];

        if (book_alp) {
            // Check if ALP is being changed
            if (alp_source === 'OUT_OF_SLATE' && alp_hrms_id && alp_hrms_id !== slot.alp_hrms_id) {
                // ALP from out of slate - verify they exist in staff master
                const [staffCheck] = await conn.query(
                    'SELECT hrms_id FROM div_staff_master WHERE hrms_id = ? OR current_cms_id = ?',
                    [alp_hrms_id, alp_hrms_id]
                );

                if (staffCheck.length > 0) {
                    // Staff found - use their HRMS ID
                    alpUpdate = ', alp_hrms_id = ?, alp_status = "BOOKED", alp_source = "OUT_OF_SLATE", alp_source_name = ?';
                    alpParams.push(staffCheck[0].hrms_id, alp_source_name || null);
                } else {
                    // Staff not found in our system - store as name only (like OTHER_DEPOT)
                    alpUpdate = ', alp_hrms_id = NULL, alp_status = "BOOKED", alp_source = "OUT_OF_SLATE", alp_source_name = ?';
                    alpParams.push(alp_source_name || `Unknown (${alp_hrms_id})`);
                }

                // Create adhoc slot for displaced original ALP
                if (slot.alp_hrms_id) {
                    await conn.query(`
                        INSERT INTO div_daily_slate
                        (office_code, slot_date, slot_time, shift_code, alp_hrms_id, alp_status, is_adhoc, booking_remarks)
                        VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 1, 'Displaced by OUT_OF_SLATE booking')
                    `, [slot.office_code, slot.slot_date, slot.slot_time, slot.shift_code, slot.alp_hrms_id]);
                    console.log(`[BOOKING] Created adhoc slot for displaced ALP ${slot.alp_hrms_id}`);
                }
            } else if (alp_source === 'OTHER_DEPOT') {
                // ALP from another depot (not in our system) - don't set alp_hrms_id (foreign key constraint)
                // Store info in alp_source_name and alp_source_depot only
                alpUpdate = ', alp_hrms_id = NULL, alp_status = "BOOKED", alp_source = "OTHER_DEPOT", alp_source_name = ?, alp_source_depot = ?';
                alpParams.push(alp_source_name || null, alp_source_depot || null);

                // Create adhoc slot for displaced original ALP
                if (slot.alp_hrms_id) {
                    await conn.query(`
                        INSERT INTO div_daily_slate
                        (office_code, slot_date, slot_time, shift_code, alp_hrms_id, alp_status, is_adhoc, booking_remarks)
                        VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 1, 'Displaced by OTHER_DEPOT booking')
                    `, [slot.office_code, slot.slot_date, slot.slot_time, slot.shift_code, slot.alp_hrms_id]);
                    console.log(`[BOOKING] Created adhoc slot for displaced ALP ${slot.alp_hrms_id}`);
                }
            } else if (alp_hrms_id && alp_hrms_id !== slot.alp_hrms_id) {
                // ALP from different slot on same slate - perform ALP swap
                alpUpdate = ', alp_hrms_id = ?, alp_status = "BOOKED", alp_source = "SLATE", alp_cross_slot_time = ?';

                // Get original slot info of the borrowed ALP
                const [alpOriginalSlot] = await conn.query(`
                    SELECT id, slot_time FROM div_daily_slate
                    WHERE id = ? OR (alp_hrms_id = ? AND slot_date = ? AND id != ?)
                    LIMIT 1
                `, [alp_original_slot_id || 0, alp_hrms_id, slot.slot_date, slot_id]);

                const originalTime = alpOriginalSlot.length > 0 ? alpOriginalSlot[0].slot_time : null;
                const sourceSlotId = alpOriginalSlot.length > 0 ? alpOriginalSlot[0].id : alp_original_slot_id;
                alpParams.push(alp_hrms_id, originalTime);

                // Swap ALPs: Move displaced ALP (from this slot) to the source slot
                if (sourceSlotId) {
                    if (slot.alp_hrms_id) {
                        // This slot had an ALP - move them to the source slot (swap)
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET alp_hrms_id = ?, alp_status = 'FORECAST',
                                alp_source = NULL, alp_cross_slot_time = ?,
                                last_modified = NOW()
                            WHERE id = ?
                        `, [slot.alp_hrms_id, slot.slot_time, sourceSlotId]);
                    } else {
                        // This slot had no ALP - clear the source slot's ALP
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET alp_hrms_id = NULL, alp_status = 'AVAILABLE',
                                alp_source = NULL, alp_cross_slot_time = NULL,
                                last_modified = NOW()
                            WHERE id = ?
                        `, [sourceSlotId]);
                    }
                }
            } else if (slot.alp_hrms_id) {
                // Same ALP, mark as booked (but preserve BOOKED status - staff still on duty)
                if (slot.alp_status !== 'BOOKED') {
                    alpUpdate = ', alp_status = "BOOKED"';
                }
            }
        }

        // Handle Extra ALP
        let extraAlpUpdate = '';
        let extraAlpParams = [];

        if (extra_alp_hrms_id || extra_alp_source_name) {
            extraAlpUpdate = ', extra_alp_hrms_id = ?, extra_alp_source = ?, extra_alp_source_name = ?, extra_alp_source_depot = ?, extra_alp_original_slot_id = ?';
            extraAlpParams = [
                extra_alp_hrms_id || null,
                extra_alp_source || 'SLATE',
                extra_alp_source_name || null,
                extra_alp_source_depot || null,
                extra_alp_original_slot_id || null
            ];

            // If extra ALP is from slate, remove them from their original slot
            if (extra_alp_source === 'SLATE' && extra_alp_original_slot_id) {
                await conn.query(`
                    UPDATE div_daily_slate
                    SET alp_hrms_id = NULL, alp_status = 'AVAILABLE',
                        alp_source = NULL, alp_cross_slot_time = NULL,
                        last_modified = NOW()
                    WHERE id = ?
                `, [extra_alp_original_slot_id]);
            }
        }

        // Build main update query
        const mainParams = [
            train_no,
            loco_no || null,
            is_pilot || false,
            booking_remarks || null,
            ...alpParams,
            ...extraAlpParams,
            slot_id
        ];

        await conn.query(`
            UPDATE div_daily_slate
            SET train_no = ?, loco_no = ?, is_pilot = ?, booking_remarks = ?,
                booked_at = NOW(), booked_by = 'Jr CC'
                ${lpUpdate}
                ${alpUpdate}
                ${extraAlpUpdate}
                , last_modified = NOW()
            WHERE id = ?
        `, mainParams);

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            message: 'Booking saved successfully'
        });

    } catch (error) {
        console.error('Error processing booking:', error);
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/available-alp
// Get available ALPs for booking (from current slate, excludes booked > 1hr)
// ----------------------------------------------------------------------------
router.get('/available-alp', async (req, res) => {
    let conn;
    try {
        const { office_code, date, exclude_slot_id } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;
        const targetDate = date || getISTDate();

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get ALPs from today's slate who are AVAILABLE or recently booked (< 1 hour) - using IST time
        const [alps] = await conn.query(`
            SELECT
                ds.id AS slot_id,
                ds.slot_time,
                ds.alp_hrms_id,
                s.name AS alp_name,
                s.current_cms_id AS alp_cms_id,
                ds.alp_status,
                ds.train_no,
                ds.booked_at,
                TIMESTAMPDIFF(MINUTE, ds.booked_at, NOW()) AS minutes_since_booked
            FROM div_daily_slate ds
            JOIN div_staff_master s ON ds.alp_hrms_id = s.hrms_id
            WHERE ds.office_code = ?
              AND ds.slot_date = ?
              AND ds.alp_hrms_id IS NOT NULL
              AND ds.id != ?
              AND (
                  ds.alp_status = 'AVAILABLE'
                  OR ds.alp_status = 'FORECAST'
                  OR (ds.alp_status IN ('ONLINE', 'BOOKED') AND TIMESTAMPDIFF(MINUTE, ds.booked_at, NOW()) < 60)
              )
            ORDER BY ds.slot_time ASC
        `, [userOffice, targetDate, exclude_slot_id || 0]);

        conn.release();

        res.json({
            success: true,
            date: targetDate,
            count: alps.length,
            data: alps
        });

    } catch (error) {
        console.error('Error fetching available ALPs:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/pending-safe
// Get pending SAFE entries for Detail Book to process
// ----------------------------------------------------------------------------
router.get('/pending-safe', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        const [pending] = await conn.query(`
            SELECT
                d.id,
                d.sign_on_time,
                d.sign_off_time,
                d.lp_hrms_id,
                lp.name AS lp_name,
                lp.current_cms_id AS lp_cms_id,
                d.alp_hrms_id,
                alp.name AS alp_name,
                alp.current_cms_id AS alp_cms_id,
                d.shift_date,
                d.created_at
            FROM div_detail_book_log d
            LEFT JOIN div_staff_master lp ON d.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON d.alp_hrms_id = alp.hrms_id
            WHERE d.office_code = ?
              AND d.is_safe_pending = TRUE
            ORDER BY d.created_at DESC
        `, [userOffice]);

        conn.release();

        res.json({
            success: true,
            count: pending.length,
            data: pending
        });

    } catch (error) {
        console.error('Error fetching pending SAFE:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/slate/clear-safe-pending
// Clear the pending flag after Detail Book processes it
// ----------------------------------------------------------------------------
router.post('/clear-safe-pending', async (req, res) => {
    let conn;
    try {
        const { log_id } = req.body;

        if (!log_id) {
            return res.status(400).json({ error: 'Log ID required' });
        }

        conn = await req.app.locals.pool.getConnection();

        await conn.query(`
            UPDATE div_detail_book_log
            SET is_safe_pending = FALSE
            WHERE id = ?
        `, [log_id]);

        conn.release();

        res.json({ success: true, message: 'SAFE pending cleared' });

    } catch (error) {
        console.error('Error clearing SAFE pending:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/arrivals
// Get recent arrival log entries
// ----------------------------------------------------------------------------
router.get('/arrivals', async (req, res) => {
    let conn;
    try {
        const { office_code, date, limit = 50 } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        let dateFilter = '';
        const params = [userOffice];

        if (date) {
            dateFilter = 'AND DATE(d.sign_off_time) = ?';
            params.push(date);
        }

        params.push(parseInt(limit));

        const [arrivals] = await conn.query(`
            SELECT
                d.id,
                d.incoming_detail,
                d.loco_no,
                d.sign_on_time,
                d.sign_off_time,
                d.is_pilot,
                d.lp_hrms_id,
                lp.name AS lp_name,
                d.lp_rest_type,
                d.lp_next_slot_date,
                d.lp_next_slot_time,
                d.alp_hrms_id,
                alp.name AS alp_name,
                d.alp_rest_type,
                d.alp_next_slot_date,
                d.alp_next_slot_time,
                d.created_at
            FROM div_detail_book_log d
            JOIN div_staff_master lp ON d.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON d.alp_hrms_id = alp.hrms_id
            WHERE d.office_code = ?
            ${dateFilter}
            ORDER BY d.created_at DESC
            LIMIT ?
        `, params);

        conn.release();

        res.json({
            success: true,
            count: arrivals.length,
            data: arrivals
        });

    } catch (error) {
        console.error('Error fetching arrivals:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/stations
// Get unique stations for pilot station dropdown
// ----------------------------------------------------------------------------
router.get('/stations', async (req, res) => {
    let conn;
    try {
        conn = await req.app.locals.pool.getConnection();

        const [stations] = await conn.query(`
            SELECT DISTINCT station_code
            FROM div_lrd_section_stations
            ORDER BY station_code
        `);

        conn.release();

        res.json({
            success: true,
            count: stations.length,
            data: stations.map(s => s.station_code)
        });

    } catch (error) {
        console.error('Error fetching stations:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/staff-analysis
// Analyze slate staff for LRD and Training compliance
// Returns staff with LRD status, training status, and incompatible pair suggestions
// ----------------------------------------------------------------------------
router.get('/staff-analysis', async (req, res) => {
    let conn;
    try {
        const {
            office_code,
            date,
            shift,  // 0=Night, 1=Day, 2=Evening
            sections = '',  // Comma-separated beat_ids: "PNVL_KJT,KJT_BVT"
            trainings = ''  // Comma-separated training_ids: "15,13"
        } = req.query;

        const userOffice = req.session.user?.div_office_code || office_code;
        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        const targetDate = date || getISTDate();
        const shiftIndex = parseInt(shift) || 1;

        // Shift time ranges with boundary overlap
        // Allow ±45 mins at shift boundaries for pairing suggestions
        const shiftRanges = {
            0: { start: '00:00', end: '08:00', prevBoundary: '23:15', nextBoundary: '08:45' }, // Night
            1: { start: '08:00', end: '16:00', prevBoundary: '07:15', nextBoundary: '16:45' }, // Day
            2: { start: '16:00', end: '23:59', prevBoundary: '15:15', nextBoundary: '00:45' }  // Evening
        };
        const range = shiftRanges[shiftIndex];

        // Get previous date for boundary slots
        const prevDate = new Date(targetDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = formatLocalDate(prevDate);

        // Get next date for boundary slots
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = formatLocalDate(nextDate);

        // Build date/time conditions for main shift + boundary slots
        let dateConditions = `(ds.slot_date = ? AND ds.slot_time >= ? AND ds.slot_time < ?)`;
        let dateParams = [targetDate, range.start, range.end];

        // Add boundary slots from adjacent shifts
        if (shiftIndex === 0) {
            // Night shift: include previous day evening boundary (23:15-23:59)
            dateConditions += ` OR (ds.slot_date = ? AND ds.slot_time >= ?)`;
            dateParams.push(prevDateStr, '23:15');
        } else if (shiftIndex === 1) {
            // Day shift: include night boundary (07:15-07:59) and evening boundary (16:00-16:45)
            dateConditions += ` OR (ds.slot_date = ? AND ds.slot_time >= ? AND ds.slot_time < ?)`;
            dateParams.push(targetDate, '07:15', '08:00');
            dateConditions += ` OR (ds.slot_date = ? AND ds.slot_time >= ? AND ds.slot_time < ?)`;
            dateParams.push(targetDate, '16:00', '16:45');
        } else if (shiftIndex === 2) {
            // Evening shift: include day boundary (15:15-15:59) and next day night (00:00-00:45)
            dateConditions += ` OR (ds.slot_date = ? AND ds.slot_time >= ? AND ds.slot_time < ?)`;
            dateParams.push(targetDate, '15:15', '16:00');
            dateConditions += ` OR (ds.slot_date = ? AND ds.slot_time < ?)`;
            dateParams.push(nextDateStr, '00:45');
        }

        // Fetch all slots with staff data
        const [slots] = await conn.query(`
            SELECT
                ds.id AS slot_id,
                ds.slot_date,
                ds.slot_time,
                ds.shift_code,
                ds.lp_hrms_id,
                lp.name AS lp_name,
                lp.current_cms_id AS lp_cms_id,
                ds.lp_status,
                ds.alp_hrms_id,
                alp.name AS alp_name,
                alp.current_cms_id AS alp_cms_id,
                ds.alp_status
            FROM div_daily_slate ds
            LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
            WHERE ds.office_code = ?
              AND (${dateConditions})
              AND (ds.lp_hrms_id IS NOT NULL OR ds.alp_hrms_id IS NOT NULL)
            ORDER BY ds.slot_date, ds.slot_time
        `, [userOffice, ...dateParams]);

        // Collect unique staff HRMS IDs
        const staffSet = new Set();
        slots.forEach(s => {
            if (s.lp_hrms_id) staffSet.add(s.lp_hrms_id);
            if (s.alp_hrms_id) staffSet.add(s.alp_hrms_id);
        });
        const hrmsIds = Array.from(staffSet);

        if (hrmsIds.length === 0) {
            conn.release();
            return res.json({
                success: true,
                slots: [],
                staff: [],
                incompatible_pairs: [],
                suggestions: []
            });
        }

        // Parse requested sections and trainings
        const sectionList = sections ? sections.split(',').map(s => s.trim().toUpperCase()) : [];
        const trainingList = trainings ? trainings.split(',').map(t => parseInt(t)).filter(t => !isNaN(t)) : [];

        // LP-only trainings (e.g. TW TRG = 13) - ALPs should not be marked non-compliant for these
        const lpOnlyTrainings = [13];
        const alpTrainingList = trainingList.filter(t => !lpOnlyTrainings.includes(t));

        // Load beats data
        const beatsData = require('../../data/lrd_beats.json');
        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;

        // Get selected beats
        const selectedBeats = sectionList.length > 0
            ? beatsData.beats.filter(b => sectionList.includes(b.beat_id.toUpperCase()))
            : [];

        // Function to extract adjacent segment pairs
        function extractAdjacentPairs(stations) {
            const pairs = [];
            for (let i = 0; i < stations.length - 1; i++) {
                pairs.push([stations[i], stations[i + 1]]);
            }
            return pairs;
        }

        // Get LRD data for all staff
        const [lrdLegs] = await conn.query(`
            SELECT d.staff_hrms_id, l.from_station, l.to_station, MAX(d.duty_date) as last_worked_date
            FROM div_ctr_legs l
            JOIN div_ctr_duties d ON l.duty_id = d.id
            WHERE d.staff_hrms_id IN (?)
              AND l.duty_type IN ('WR', 'PL')
              AND l.from_station IS NOT NULL
              AND l.to_station IS NOT NULL
            GROUP BY d.staff_hrms_id, l.from_station, l.to_station
        `, [hrmsIds]);

        // Build LRD map per staff
        const staffLrdMap = new Map();
        lrdLegs.forEach(leg => {
            if (!staffLrdMap.has(leg.staff_hrms_id)) {
                staffLrdMap.set(leg.staff_hrms_id, new Map());
            }
            staffLrdMap.get(leg.staff_hrms_id).set(`${leg.from_station}-${leg.to_station}`, leg.last_worked_date);
        });

        // Get Training data for all staff
        let staffTrainingMap = new Map();
        if (trainingList.length > 0) {
            const [trainingRecords] = await conn.query(`
                SELECT tr.staff_hrms_id, tr.training_id, tr.done_date, tt.training_name, tt.training_code
                FROM div_training_records tr
                JOIN div_training_types tt ON tr.training_id = tt.training_id
                WHERE tr.staff_hrms_id IN (?)
                  AND tr.training_id IN (?)
                  AND tr.record_id IN (
                      SELECT MAX(record_id) FROM div_training_records
                      WHERE staff_hrms_id IN (?)
                        AND training_id IN (?)
                      GROUP BY staff_hrms_id, training_id
                  )
            `, [hrmsIds, trainingList, hrmsIds, trainingList]);

            trainingRecords.forEach(tr => {
                if (!staffTrainingMap.has(tr.staff_hrms_id)) {
                    staffTrainingMap.set(tr.staff_hrms_id, new Map());
                }
                staffTrainingMap.get(tr.staff_hrms_id).set(tr.training_id, {
                    done_date: tr.done_date,
                    training_name: tr.training_name,
                    training_code: tr.training_code
                });
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Analyze LRD status for each staff
        function analyzeLrdForStaff(hrmsId) {
            const staffSegs = staffLrdMap.get(hrmsId) || new Map();
            const sectionResults = {};

            selectedBeats.forEach(beat => {
                const segments = extractAdjacentPairs(beat.stations);
                let worstStatus = 'VALID';
                let worstDays = Infinity;
                let worstDate = null;
                let validCount = 0, expiredCount = 0, expiringCount = 0, neverCount = 0;

                segments.forEach(([from, to]) => {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    if (!lastWorked) {
                        neverCount++;
                        return;
                    }

                    const lastWorkedDate = new Date(lastWorked);
                    const expiresOn = new Date(lastWorkedDate);
                    expiresOn.setDate(expiresOn.getDate() + validityDays);
                    const daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                    if (daysRemaining < 0) {
                        expiredCount++;
                        if (worstStatus !== 'EXPIRED' || daysRemaining < worstDays) {
                            worstStatus = 'EXPIRED';
                            worstDays = daysRemaining;
                            worstDate = lastWorked;
                        }
                    } else if (daysRemaining <= expiringThreshold) {
                        expiringCount++;
                        if (worstStatus !== 'EXPIRED') {
                            if (worstStatus !== 'EXPIRING' || daysRemaining < worstDays) {
                                worstStatus = 'EXPIRING';
                                worstDays = daysRemaining;
                                worstDate = lastWorked;
                            }
                        }
                    } else {
                        validCount++;
                        if (worstStatus === 'VALID' && (!worstDate || new Date(lastWorked) > new Date(worstDate))) {
                            worstDate = lastWorked;
                            worstDays = daysRemaining;
                        }
                    }
                });

                // Determine overall status
                let status = 'VALID';
                if (expiredCount > 0) {
                    status = validCount > 0 || expiringCount > 0 ? 'PARTIAL_EXPIRED' : 'EXPIRED';
                } else if (expiringCount > 0) {
                    status = validCount > 0 ? 'PARTIAL_EXPIRING' : 'EXPIRING';
                } else if (neverCount === segments.length) {
                    status = 'NEVER_WORKED';
                } else if (neverCount > 0) {
                    status = 'PARTIAL_NEVER';
                }

                sectionResults[beat.beat_id] = {
                    status,
                    days: worstDays === Infinity ? null : worstDays,
                    date: worstDate,
                    valid: status === 'VALID' || status === 'PARTIAL_EXPIRING'
                };
            });

            return sectionResults;
        }

        // Analyze Training status for each staff
        function analyzeTrainingForStaff(hrmsId) {
            const staffTrainings = staffTrainingMap.get(hrmsId) || new Map();
            const trainingResults = {};

            trainingList.forEach(tId => {
                const record = staffTrainings.get(tId);
                trainingResults[tId] = {
                    trained: !!record,
                    done_date: record?.done_date || null,
                    training_name: record?.training_name || null
                };
            });

            return trainingResults;
        }

        // Build staff analysis data
        const staffAnalysis = {};
        hrmsIds.forEach(hrmsId => {
            staffAnalysis[hrmsId] = {
                lrd: analyzeLrdForStaff(hrmsId),
                training: analyzeTrainingForStaff(hrmsId)
            };
        });

        // Analyze slots for incompatible pairs and suggestions
        const incompatiblePairs = [];
        const allLPs = [];
        const allALPs = [];

        // First, collect all LP and ALP info with their compliance status
        slots.forEach(slot => {
            const slotInfo = {
                slot_id: slot.slot_id,
                slot_date: slot.slot_date,
                slot_time: slot.slot_time,
                shift_code: slot.shift_code
            };

            if (slot.lp_hrms_id) {
                const analysis = staffAnalysis[slot.lp_hrms_id] || { lrd: {}, training: {} };
                const lrdValid = sectionList.length === 0 ||
                    sectionList.every(sec => analysis.lrd[sec]?.valid);
                const trainingValid = trainingList.length === 0 ||
                    trainingList.every(tId => analysis.training[tId]?.trained);

                allLPs.push({
                    ...slotInfo,
                    hrms_id: slot.lp_hrms_id,
                    name: slot.lp_name,
                    cms_id: slot.lp_cms_id,
                    status: slot.lp_status,
                    lrd: analysis.lrd,
                    training: analysis.training,
                    lrd_valid: lrdValid,
                    training_valid: trainingValid,
                    fully_compliant: lrdValid && trainingValid
                });
            }

            if (slot.alp_hrms_id) {
                const analysis = staffAnalysis[slot.alp_hrms_id] || { lrd: {}, training: {} };
                const lrdValid = sectionList.length === 0 ||
                    sectionList.every(sec => analysis.lrd[sec]?.valid);
                // For ALP, exclude LP-only trainings from compliance check
                const trainingValid = alpTrainingList.length === 0 ||
                    alpTrainingList.every(tId => analysis.training[tId]?.trained);

                allALPs.push({
                    ...slotInfo,
                    hrms_id: slot.alp_hrms_id,
                    name: slot.alp_name,
                    cms_id: slot.alp_cms_id,
                    status: slot.alp_status,
                    lrd: analysis.lrd,
                    training: analysis.training,
                    lrd_valid: lrdValid,
                    training_valid: trainingValid,
                    fully_compliant: lrdValid && trainingValid
                });
            }
        });

        // Find incompatible pairs and generate suggestions
        slots.forEach(slot => {
            if (!slot.lp_hrms_id || !slot.alp_hrms_id) return;

            const lpAnalysis = staffAnalysis[slot.lp_hrms_id] || { lrd: {}, training: {} };
            const alpAnalysis = staffAnalysis[slot.alp_hrms_id] || { lrd: {}, training: {} };

            const lpLrdValid = sectionList.length === 0 || sectionList.every(sec => lpAnalysis.lrd[sec]?.valid);
            const alpLrdValid = sectionList.length === 0 || sectionList.every(sec => alpAnalysis.lrd[sec]?.valid);
            const lpTrainingValid = trainingList.length === 0 || trainingList.every(tId => lpAnalysis.training[tId]?.trained);
            // For ALP, exclude LP-only trainings from compliance check
            const alpTrainingValid = alpTrainingList.length === 0 || alpTrainingList.every(tId => alpAnalysis.training[tId]?.trained);

            const issues = [];
            if (!lpLrdValid && alpLrdValid) issues.push({ type: 'LRD', who: 'LP', message: 'LP missing LRD' });
            if (lpLrdValid && !alpLrdValid) issues.push({ type: 'LRD', who: 'ALP', message: 'ALP missing LRD' });
            if (!lpLrdValid && !alpLrdValid) issues.push({ type: 'LRD', who: 'BOTH', message: 'Both missing LRD' });
            if (!lpTrainingValid && alpTrainingValid) issues.push({ type: 'TRAINING', who: 'LP', message: 'LP missing training' });
            if (lpTrainingValid && !alpTrainingValid) issues.push({ type: 'TRAINING', who: 'ALP', message: 'ALP missing training' });
            if (!lpTrainingValid && !alpTrainingValid) issues.push({ type: 'TRAINING', who: 'BOTH', message: 'Both missing training' });

            if (issues.length > 0) {
                // Find alternative suggestions
                const suggestions = [];

                issues.forEach(issue => {
                    if (issue.who === 'ALP' || issue.who === 'BOTH') {
                        // Find compliant ALPs from other slots
                        const compliantALPs = allALPs.filter(alp =>
                            alp.hrms_id !== slot.alp_hrms_id &&
                            alp.slot_id !== slot.slot_id &&
                            (issue.type === 'LRD' ? alp.lrd_valid : alp.training_valid) &&
                            alp.status !== 'signed_off'
                        ).slice(0, 3);

                        compliantALPs.forEach(alp => {
                            suggestions.push({
                                type: 'SWAP_ALP',
                                issue_type: issue.type,
                                current: { hrms_id: slot.alp_hrms_id, name: slot.alp_name },
                                suggested: {
                                    hrms_id: alp.hrms_id,
                                    name: alp.name,
                                    slot_time: alp.slot_time,
                                    slot_date: alp.slot_date
                                }
                            });
                        });
                    }

                    if (issue.who === 'LP' || issue.who === 'BOTH') {
                        // Find compliant LPs from other slots
                        const compliantLPs = allLPs.filter(lp =>
                            lp.hrms_id !== slot.lp_hrms_id &&
                            lp.slot_id !== slot.slot_id &&
                            (issue.type === 'LRD' ? lp.lrd_valid : lp.training_valid) &&
                            lp.status !== 'signed_off'
                        ).slice(0, 3);

                        compliantLPs.forEach(lp => {
                            suggestions.push({
                                type: 'SWAP_LP',
                                issue_type: issue.type,
                                current: { hrms_id: slot.lp_hrms_id, name: slot.lp_name },
                                suggested: {
                                    hrms_id: lp.hrms_id,
                                    name: lp.name,
                                    slot_time: lp.slot_time,
                                    slot_date: lp.slot_date
                                }
                            });
                        });
                    }
                });

                incompatiblePairs.push({
                    slot_id: slot.slot_id,
                    slot_date: slot.slot_date,
                    slot_time: slot.slot_time,
                    lp: {
                        hrms_id: slot.lp_hrms_id,
                        name: slot.lp_name,
                        cms_id: slot.lp_cms_id,
                        lrd_valid: lpLrdValid,
                        training_valid: lpTrainingValid,
                        lrd: lpAnalysis.lrd,
                        training: lpAnalysis.training
                    },
                    alp: {
                        hrms_id: slot.alp_hrms_id,
                        name: slot.alp_name,
                        cms_id: slot.alp_cms_id,
                        lrd_valid: alpLrdValid,
                        training_valid: alpTrainingValid,
                        lrd: alpAnalysis.lrd,
                        training: alpAnalysis.training
                    },
                    issues,
                    suggestions
                });
            }
        });

        // Build section and training info for frontend
        const sectionInfo = selectedBeats.map(b => ({
            id: b.beat_id,
            name: `${b.stations[0]}-${b.stations[b.stations.length - 1]}`
        }));

        // Get training names
        let trainingInfo = [];
        if (trainingList.length > 0) {
            const [trainingTypes] = await conn.query(
                `SELECT training_id, training_code, training_name FROM div_training_types WHERE training_id IN (?)`,
                [trainingList]
            );
            trainingInfo = trainingTypes.map(t => ({
                id: t.training_id,
                code: t.training_code,
                name: t.training_name,
                lp_only: lpOnlyTrainings.includes(t.training_id)
            }));
        }

        conn.release();

        res.json({
            success: true,
            date: targetDate,
            shift: shiftIndex,
            sections: sectionInfo,
            trainings: trainingInfo,
            summary: {
                total_slots: slots.length,
                total_staff: hrmsIds.length,
                lps: allLPs.length,
                alps: allALPs.length,
                lrd_compliant_lps: allLPs.filter(l => l.lrd_valid).length,
                lrd_compliant_alps: allALPs.filter(a => a.lrd_valid).length,
                training_compliant_lps: allLPs.filter(l => l.training_valid).length,
                training_compliant_alps: allALPs.filter(a => a.training_valid).length,
                incompatible_pairs: incompatiblePairs.length
            },
            slots: slots.map(s => ({
                slot_id: s.slot_id,
                slot_date: s.slot_date,
                slot_time: s.slot_time,
                lp_hrms_id: s.lp_hrms_id,
                lp_name: s.lp_name,
                alp_hrms_id: s.alp_hrms_id,
                alp_name: s.alp_name
            })),
            lps: allLPs,
            alps: allALPs,
            incompatible_pairs: incompatiblePairs
        });

    } catch (error) {
        console.error('Error in staff analysis:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/available-sections
// Get list of LRD sections/beats for the office
// ----------------------------------------------------------------------------
router.get('/available-sections', async (req, res) => {
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        const baseOffice = (userOffice || 'PNVL').split('-')[0].toUpperCase();
        const beatsData = require('../../data/lrd_beats.json');

        // Sections to exclude from analysis modal
        const excludedSections = ['JNPT_PNVL', 'PNVL_JNPT', 'PNVL_BSR', 'BSR_PNVL'];

        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            const isApplicable = beatOffice === baseOffice || beatOffice === 'SHARED';
            return isApplicable && !excludedSections.includes(b.beat_id);
        });

        const sections = applicableBeats.map(b => ({
            id: b.beat_id,
            name: `${b.stations[0]}-${b.stations[b.stations.length - 1]}`,
            full_name: b.name,
            office: b.office
        }));

        res.json({ success: true, sections });
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ error: 'Failed to load sections' });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/slate/available-trainings
// Get list of training types for selection
// ----------------------------------------------------------------------------
router.get('/available-trainings', async (req, res) => {
    let conn;
    try {
        conn = await req.app.locals.pool.getConnection();

        const [trainings] = await conn.query(`
            SELECT training_id, training_code, training_name
            FROM div_training_types
            WHERE training_id IN (10, 11, 13, 15)
            ORDER BY training_name
        `);

        conn.release();
        res.json({
            success: true,
            trainings: trainings.map(t => ({
                id: t.training_id,
                code: t.training_code,
                name: t.training_name,
                lp_only: t.training_id === 13  // TW TRG is LP only
            }))
        });
    } catch (error) {
        console.error('Error fetching trainings:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Failed to load trainings' });
    }
});

module.exports = router;
