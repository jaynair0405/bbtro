const express = require('express');
const router = express.Router();

// ============================================================================
// TOWER WAGON (TW) DETAIL API
// ============================================================================

// Helper to format date as YYYY-MM-DD in local timezone
function formatLocalDate(date) {
    if (typeof date === 'string') date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get shift code from time
function getShiftCode(time) {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 0 && hour < 8) return '00_08';
    if (hour >= 8 && hour < 16) return '08_16';
    return '16_24';
}

// ----------------------------------------------------------------------------
// GET /api/division/tw/yards
// Get list of yards from database
// ----------------------------------------------------------------------------
router.get('/yards', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code || 'PNVL-ML';

        conn = await req.app.locals.pool.getConnection();

        const [yards] = await conn.query(`
            SELECT yard_code, yard_name
            FROM div_tw_yards
            WHERE office_code = ? AND is_active = 1
            ORDER BY display_order, yard_code
        `, [userOffice]);

        conn.release();

        res.json({ success: true, yards });

    } catch (error) {
        console.error('TW Yards Error:', error);
        if (conn) conn.release();
        // Fallback to hardcoded if table doesn't exist
        res.json({ success: true, yards: [
            { yard_code: 'PEN', yard_name: 'Pen' },
            { yard_code: 'NEU', yard_name: 'Nerul' },
            { yard_code: 'PNVL', yard_name: 'Panvel' }
        ]});
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/tw/slots
// Get slots for a specific yard
// ----------------------------------------------------------------------------
router.get('/slots', async (req, res) => {
    let conn;
    try {
        const { office_code, yard_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code || 'PNVL-ML';

        if (!yard_code) {
            return res.json({ success: true, slots: [] });
        }

        conn = await req.app.locals.pool.getConnection();

        const [slots] = await conn.query(`
            SELECT id, slot_time, detail_timing, shift_code
            FROM div_tw_slots
            WHERE office_code = ? AND yard_code = ? AND is_active = 1
            ORDER BY slot_order, slot_time
        `, [userOffice, yard_code]);

        conn.release();

        // Format slot_time for display
        const formattedSlots = slots.map(s => ({
            ...s,
            slot_time: s.slot_time.substring(0, 5) // HH:MM format
        }));

        res.json({ success: true, slots: formattedSlots });

    } catch (error) {
        console.error('TW Slots Error:', error);
        if (conn) conn.release();
        res.json({ success: true, slots: [] });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/tw/board
// Get TW schedule for date range
// ----------------------------------------------------------------------------
router.get('/board', async (req, res) => {
    let conn;
    try {
        const { office_code, days = 2 } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice) {
            return res.status(400).json({ error: 'Office code required' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get TW details for the date range
        const [rows] = await conn.query(`
            SELECT
                tw.*,
                s.name as staff_name,
                s.current_cms_id
            FROM div_tw_detail tw
            LEFT JOIN div_staff_master s ON tw.lp_hrms_id = s.hrms_id
            WHERE tw.office_code = ?
              AND tw.detail_date >= CURDATE()
              AND tw.detail_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY tw.detail_date, tw.slot_time, tw.yard_code
        `, [userOffice, days]);

        conn.release();

        // Organize by date
        const board = {};
        rows.forEach(row => {
            const dateKey = formatLocalDate(row.detail_date);
            if (!board[dateKey]) board[dateKey] = [];
            board[dateKey].push({
                ...row,
                lp_name: row.lp_name || row.staff_name
            });
        });

        res.json({ success: true, board });

    } catch (error) {
        console.error('TW Board Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/tw/active-crews
// Get TW-trained staff who are available (signed off, rested)
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

        // Get TW-trained staff who are not currently on active TW or main slate duty
        const [crews] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code,
                d.designation_name
            FROM div_staff_master s
            JOIN div_training_records tr ON s.hrms_id = tr.staff_hrms_id
            JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE tt.training_code = 'TW_TRG'
              AND tr.status = 'Completed'
              AND s.current_office_code LIKE ?
              AND s.hrms_id NOT IN (
                  -- Exclude staff currently on active main slate duty (as LP)
                  SELECT lp_hrms_id FROM div_daily_slate
                  WHERE lp_status IN ('FORECAST', 'ONLINE', 'BOOKED')
                    AND slot_date >= CURDATE()
                    AND lp_hrms_id IS NOT NULL
              )
              AND s.hrms_id NOT IN (
                  -- Exclude staff currently on active main slate duty (as ALP)
                  SELECT alp_hrms_id FROM div_daily_slate
                  WHERE alp_status IN ('FORECAST', 'ONLINE', 'BOOKED')
                    AND slot_date >= CURDATE()
                    AND alp_hrms_id IS NOT NULL
              )
              AND s.hrms_id NOT IN (
                  -- Exclude staff already on active TW duty
                  SELECT lp_hrms_id FROM div_tw_detail
                  WHERE lp_status IN ('FORECAST', 'ONLINE')
                    AND detail_date >= CURDATE()
                    AND lp_hrms_id IS NOT NULL
              )
            ORDER BY s.name
        `, [userOffice.split('-')[0] + '%']);

        conn.release();

        res.json({ success: true, crews });

    } catch (error) {
        console.error('TW Active Crews Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/division/tw/staff/search
// Search TW-trained staff by name or CMS ID
// ----------------------------------------------------------------------------
router.get('/staff/search', async (req, res) => {
    let conn;
    try {
        const { q, office_code } = req.query;
        const userOffice = req.session.user?.div_office_code || office_code;

        if (!q || q.length < 2) {
            return res.json({ success: true, staff: [] });
        }

        conn = await req.app.locals.pool.getConnection();

        const [staff] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code,
                d.designation_name
            FROM div_staff_master s
            JOIN div_training_records tr ON s.hrms_id = tr.staff_hrms_id
            JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE tt.training_code = 'TW_TRG'
              AND tr.status = 'Completed'
              AND (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ?)
            ORDER BY s.name
            LIMIT 20
        `, [`%${q}%`, `%${q}%`, `%${q}%`]);

        conn.release();

        res.json({ success: true, staff });

    } catch (error) {
        console.error('TW Staff Search Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/tw/assign
// Assign LP to TW slot
// ----------------------------------------------------------------------------
router.post('/assign', async (req, res) => {
    let conn;
    try {
        const {
            office_code,
            detail_date,
            slot_time,
            yard_code,
            detail_timing,
            lp_hrms_id,
            lp_cms_id,
            lp_name
        } = req.body;

        const userOffice = req.session.user?.div_office_code || office_code;

        if (!userOffice || !detail_date || !slot_time || !yard_code || !lp_hrms_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        conn = await req.app.locals.pool.getConnection();
        await conn.beginTransaction();

        // Check if LP is already assigned to active TW on same date
        const [existing] = await conn.query(`
            SELECT id FROM div_tw_detail
            WHERE lp_hrms_id = ?
              AND detail_date = ?
              AND lp_status IN ('FORECAST', 'ONLINE')
        `, [lp_hrms_id, detail_date]);

        if (existing.length > 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ error: 'LP already assigned to TW on this date' });
        }

        // Check if LP is on main slate duty
        const [mainSlate] = await conn.query(`
            SELECT id FROM div_daily_slate
            WHERE lp_hrms_id = ?
              AND slot_date = ?
              AND lp_status IN ('FORECAST', 'ONLINE', 'BOOKED')
        `, [lp_hrms_id, detail_date]);

        if (mainSlate.length > 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ error: 'LP already assigned to main slate on this date' });
        }

        const shift_code = getShiftCode(slot_time);

        // Insert TW assignment
        const [result] = await conn.query(`
            INSERT INTO div_tw_detail (
                office_code, detail_date, slot_time, shift_code, yard_code, detail_timing,
                lp_hrms_id, lp_cms_id, lp_name, lp_status,
                modified_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FORECAST', ?)
        `, [
            userOffice, detail_date, slot_time, shift_code, yard_code, detail_timing,
            lp_hrms_id, lp_cms_id, lp_name,
            req.session.user?.username || 'system'
        ]);

        await conn.commit();
        conn.release();

        res.json({ success: true, id: result.insertId, message: 'TW assigned successfully' });

    } catch (error) {
        console.error('TW Assign Error:', error);
        if (conn) {
            await conn.rollback();
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/tw/signon
// Mark LP as signed on (ONLINE)
// ----------------------------------------------------------------------------
router.post('/signon', async (req, res) => {
    let conn;
    try {
        const { id, signed_on_at, late_reason } = req.body;

        if (!id || !signed_on_at) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        conn = await req.app.locals.pool.getConnection();

        await conn.query(`
            UPDATE div_tw_detail
            SET lp_status = 'ONLINE',
                lp_signed_on_at = ?,
                lp_late_reason = ?,
                modified_by = ?,
                modified_at = NOW()
            WHERE id = ?
        `, [signed_on_at, late_reason || null, req.session.user?.username || 'system', id]);

        conn.release();

        res.json({ success: true, message: 'Sign-on recorded' });

    } catch (error) {
        console.error('TW Sign-on Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/tw/signoff
// Mark sign-off (TR.No, Loco, time) and set status to SAFE
// ----------------------------------------------------------------------------
router.post('/signoff', async (req, res) => {
    let conn;
    try {
        const { id, tr_no, loco_no, signed_off_at } = req.body;

        if (!id || !signed_off_at) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get the TW record to create detail book entry
        const [twRecord] = await conn.query(`
            SELECT * FROM div_tw_detail WHERE id = ?
        `, [id]);

        if (twRecord.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'TW record not found' });
        }

        const tw = twRecord[0];

        await conn.beginTransaction();

        // Update TW record
        await conn.query(`
            UPDATE div_tw_detail
            SET lp_status = 'SAFE',
                tr_no = ?,
                loco_no = ?,
                lp_signed_off_at = ?,
                modified_by = ?,
                modified_at = NOW()
            WHERE id = ?
        `, [tr_no, loco_no, signed_off_at, req.session.user?.username || 'system', id]);

        // Create entry in detail book log for next slot calculation
        // This makes the LP available in main detail-book forecast
        const signOffDateTime = `${formatLocalDate(tw.detail_date)} ${signed_off_at}:00`;
        const shift_code = getShiftCode(signed_off_at);

        await conn.query(`
            INSERT INTO div_detail_book_log (
                office_code, log_type, source_slate_id,
                lp_hrms_id, lp_rest_type,
                train_no, loco_no,
                shift_date, shift_code,
                remarks
            ) VALUES (?, 'TW_SIGNOFF', ?, ?, 'NORMAL', ?, ?, ?, ?, 'Sign-off from TW Detail')
        `, [
            tw.office_code, id, tw.lp_hrms_id,
            tr_no || `TW-${tw.yard_code}`, loco_no,
            tw.detail_date, shift_code
        ]);

        await conn.commit();
        conn.release();

        res.json({ success: true, message: 'Sign-off recorded, LP available in detail-book' });

    } catch (error) {
        console.error('TW Sign-off Error:', error);
        if (conn) {
            await conn.rollback();
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// POST /api/division/tw/exception
// Mark AUC/NF exception
// ----------------------------------------------------------------------------
router.post('/exception', async (req, res) => {
    let conn;
    try {
        const { id, exception, remark } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'TW ID required' });
        }

        conn = await req.app.locals.pool.getConnection();

        await conn.query(`
            UPDATE div_tw_detail
            SET lp_exception = ?,
                lp_exception_remark = ?,
                modified_by = ?,
                modified_at = NOW()
            WHERE id = ?
        `, [exception || null, remark || null, req.session.user?.username || 'system', id]);

        conn.release();

        res.json({ success: true, message: exception ? `Marked as ${exception}` : 'Exception cleared' });

    } catch (error) {
        console.error('TW Exception Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ----------------------------------------------------------------------------
// DELETE /api/division/tw/:id
// Remove TW assignment (only if not signed on)
// ----------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;

        conn = await req.app.locals.pool.getConnection();

        // Check status before deleting
        const [record] = await conn.query(`
            SELECT lp_status FROM div_tw_detail WHERE id = ?
        `, [id]);

        if (record.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'TW record not found' });
        }

        if (record[0].lp_status === 'ONLINE' || record[0].lp_status === 'SAFE') {
            conn.release();
            return res.status(400).json({ error: 'Cannot delete - LP has already signed on' });
        }

        await conn.query(`DELETE FROM div_tw_detail WHERE id = ?`, [id]);

        conn.release();

        res.json({ success: true, message: 'TW assignment removed' });

    } catch (error) {
        console.error('TW Delete Error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
