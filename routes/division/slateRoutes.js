const express = require('express');
const router = express.Router();

// ============================================================================
// DIGITAL SLATE & DETAIL BOOK API
// ============================================================================

// Helper to format date as YYYY-MM-DD in local timezone (avoids UTC shift)
function formatLocalDate(date) {
    if (typeof date === 'string') date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

        // Get crews who are ONLINE and have been on duty for 5+ hours
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
              AND (ds.lp_status = 'ONLINE' OR ds.alp_status = 'ONLINE')
              AND TIMESTAMPDIFF(HOUR, CONCAT(ds.slot_date, ' ', ds.slot_time), NOW()) >= 5
            ORDER BY CONCAT(ds.slot_date, ' ', ds.slot_time) ASC
        `, [userOffice]);

        // Check for leave warnings
        for (const crew of crews) {
            // Check LP leave
            const [lpLeave] = await conn.query(`
                SELECT status, leave_type, from_date, to_date
                FROM div_leave_tracking
                WHERE staff_hrms_id = ?
                  AND status IN ('Approved', 'Pending', 'Forwarded')
                  AND from_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
                  AND to_date >= CURDATE()
                LIMIT 1
            `, [crew.lp_hrms_id]);
            crew.lp_leave_warning = lpLeave.length > 0 ? lpLeave[0] : null;

            // Check ALP leave if exists
            if (crew.alp_hrms_id) {
                const [alpLeave] = await conn.query(`
                    SELECT status, leave_type, from_date, to_date
                    FROM div_leave_tracking
                    WHERE staff_hrms_id = ?
                      AND status IN ('Approved', 'Pending', 'Forwarded')
                      AND from_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
                      AND to_date >= CURDATE()
                    LIMIT 1
                `, [crew.alp_hrms_id]);
                crew.alp_leave_warning = alpLeave.length > 0 ? alpLeave[0] : null;
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

        // Calculate date range
        const startDate = date || formatLocalDate(new Date());
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
                ds.lp_signed_on_at,
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
                ds.alp_signed_on_at,
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
                ds.last_modified,
                CASE
                    WHEN ds.last_modified > DATE_SUB(NOW(), INTERVAL 3 MINUTE) THEN 1
                    ELSE 0
                END AS is_recently_modified
            FROM div_daily_slate ds
            LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
            LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
            LEFT JOIN div_detail_book_log lp_log ON ds.lp_detail_book_id = lp_log.id
            LEFT JOIN div_detail_book_log alp_log ON ds.alp_detail_book_id = alp_log.id
            WHERE ds.office_code = ?
              AND ds.slot_date >= ?
              AND ds.slot_date < DATE_ADD(?, INTERVAL ? DAY)
            ORDER BY ds.slot_date, ds.slot_time, ds.is_adhoc
        `, [userOffice, startDate, startDate, numDays]);

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
            lp_next_slot_date,
            lp_next_slot_time,
            // ALP data (optional)
            alp_hrms_id,
            alp_rest_type,
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
            source_slate_id
        } = req.body;

        const userOffice = req.session.user?.div_office_code || office_code;

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
            // Manual entry - use current date/time
            const now = new Date();
            shiftDate = formatLocalDate(now);
            const currentHour = now.getHours();
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

        // 2. Assign LP to slot (if LP provided and not multi-day leave)
        let lpSlotId = null;
        let lpIsAdhoc = false;
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
                    // Get next adhoc number for this slot
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
                } else {
                    // Find next available slot (search across dates for edge cases like 23:45)
                    // First ensure next day slots exist
                    const nextDay = new Date(lp_next_slot_date + 'T00:00:00');
                    nextDay.setDate(nextDay.getDate() + 1);
                    await conn.query('CALL sp_generate_daily_slots(?, ?)', [userOffice, formatLocalDate(nextDay)]);

                    const [nextSlot] = await conn.query(`
                        SELECT id, slot_date, slot_time FROM div_daily_slate
                        WHERE office_code = ?
                          AND lp_hrms_id IS NULL
                          AND is_adhoc = 0
                          AND CONCAT(slot_date, ' ', slot_time) > CONCAT(?, ' ', ?)
                        ORDER BY slot_date ASC, slot_time ASC
                        LIMIT 1
                    `, [userOffice, lp_next_slot_date, lp_next_slot_time]);

                    if (nextSlot.length > 0) {
                        await conn.query(`
                            UPDATE div_daily_slate
                            SET lp_hrms_id = ?, lp_status = 'AVAILABLE', lp_detail_book_id = ?, last_modified = NOW()
                            WHERE id = ?
                        `, [lp_hrms_id, logId, nextSlot[0].id]);
                        lpSlotId = nextSlot[0].id;
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
                    // Get next adhoc number for this slot
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
        // Setting status to AVAILABLE removes them from the returning crew query
        if (source_slate_id) {
            await conn.query(`
                UPDATE div_daily_slate
                SET lp_status = 'AVAILABLE', alp_status = 'AVAILABLE'
                WHERE id = ?
            `, [source_slate_id]);
        }

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            message: 'Arrival processed successfully',
            log_id: logId,
            lp_slot_id: lpSlotId,
            lp_is_adhoc: lpIsAdhoc,
            alp_slot_id: alpSlotId,
            alp_is_adhoc: alpIsAdhoc
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

        // LP late arrival fields
        if (req.body.lp_signed_on_at !== undefined) {
            if (req.body.lp_signed_on_at) {
                // Convert time string to full timestamp (today's date + time)
                updates.push('lp_signed_on_at = CONCAT(CURDATE(), " ", ?)');
                params.push(req.body.lp_signed_on_at);
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

        // ALP late arrival fields
        if (req.body.alp_signed_on_at !== undefined) {
            if (req.body.alp_signed_on_at) {
                updates.push('alp_signed_on_at = CONCAT(CURDATE(), " ", ?)');
                params.push(req.body.alp_signed_on_at);
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
// GET /api/division/slate/staff/search
// Search staff for manual entry (LP or ALP dropdown)
// ----------------------------------------------------------------------------
router.get('/staff/search', async (req, res) => {
    let conn;
    try {
        const { office_code, q, type } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice || !q || q.length < 2) {
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

        const searchTerm = `%${q}%`;

        const [staff] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                d.designation_name,
                ft.current_night_streak
            FROM div_staff_master s
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_staff_fatigue_tracker ft ON s.hrms_id = ft.hrms_id
            WHERE s.current_office_code = ?
              AND s.status = 'Active'
              ${designationFilter}
              AND (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ?)
            ORDER BY s.name
            LIMIT 20
        `, [userOffice, searchTerm, searchTerm, searchTerm]);

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

        // 1. CHECK SANCTIONED LEAVE (Hard Block)
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
                level: 'error',
                message: `Approved ${leave.leave_type} from ${formatLocalDate(leave.from_date)} to ${formatLocalDate(leave.to_date)}`,
                data: leave
            });
            canAssign = false;
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
        // Count duty days in last 7 days from detail_book_log or daily_slate
        const [dutyDays] = await conn.query(`
            SELECT COUNT(DISTINCT DATE(sign_off_time)) AS consecutive_days
            FROM div_detail_book_log
            WHERE (lp_hrms_id = ? OR alp_hrms_id = ?)
              AND sign_off_time >= DATE_SUB(?, INTERVAL 7 DAY)
              AND sign_off_time < ?
        `, [hrms_id, hrms_id, next_slot_date, next_slot_date]);

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

        // 4. CHECK NIGHT STREAK (Fatigue)
        const [fatigue] = await conn.query(`
            SELECT current_night_streak, last_night_duty_date
            FROM div_staff_fatigue_tracker
            WHERE hrms_id = ?
        `, [hrms_id]);

        if (fatigue.length > 0 && fatigue[0].current_night_streak >= 3) {
            const streak = fatigue[0].current_night_streak;
            const level = streak >= 4 ? 'error' : 'warning';
            warnings.push({
                type: 'NIGHT_STREAK',
                level: level,
                message: `${streak} consecutive night duties${streak >= 4 ? ' - Rest mandatory' : ' - Consider day duty'}`,
                data: fatigue[0]
            });
            if (streak >= 4) {
                canAssign = false;
            }
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
// GET /api/division/slate/vacancy
// Get vacancy summary for dashboard
// ----------------------------------------------------------------------------
router.get('/vacancy', async (req, res) => {
    let conn;
    try {
        const { office_code, date } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;
        const targetDate = date || formatLocalDate(new Date());

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

module.exports = router;
