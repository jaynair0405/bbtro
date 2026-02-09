const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/promotions/:hrms_id - Get promotion history for a staff
router.get('/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                ph.promotion_id,
                ph.staff_hrms_id,
                ph.from_designation_id,
                ph.to_designation_id,
                ph.change_type,
                ph.posting_date,
                ph.promotion_order_no,
                ph.remarks,
                ph.created_by,
                ph.created_at,
                d1.designation_name as from_designation_name,
                d2.designation_name as to_designation_name
            FROM div_promotion_history ph
            LEFT JOIN designations d1 ON ph.from_designation_id = d1.id
            LEFT JOIN designations d2 ON ph.to_designation_id = d2.id
            WHERE ph.staff_hrms_id = ?
            ORDER BY ph.posting_date DESC, ph.created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching promotion history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/promotions - Add new promotion record
router.post('/', requireAuth, async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            from_designation_id,
            to_designation_id,
            change_type,
            posting_date,
            promotion_order_no,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !to_designation_id || !posting_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, to_designation_id, posting_date'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_promotion_history
             (staff_hrms_id, from_designation_id, to_designation_id, change_type,
              posting_date, promotion_order_no, remarks, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                from_designation_id || null,
                to_designation_id,
                change_type || 'Promotion',
                posting_date,
                promotion_order_no || null,
                remarks || null,
                req.session.user.username
            ]
        );

        // Get the latest promotion's designation for this staff and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record added successfully',
            promotion_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/promotions/:promotion_id - Update promotion record
router.put('/:promotion_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { promotion_id } = req.params;
        const {
            from_designation_id,
            to_designation_id,
            change_type,
            posting_date,
            promotion_order_no,
            remarks
        } = req.body;

        // Validation
        if (!to_designation_id || !posting_date) {
            return res.status(400).json({
                error: 'Missing required fields: to_designation_id, posting_date'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get staff_hrms_id before updating
        const [[promo]] = await conn.query(
            'SELECT staff_hrms_id FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        if (!promo) {
            conn.release();
            return res.status(404).json({ error: 'Promotion record not found' });
        }

        const [result] = await conn.query(
            `UPDATE div_promotion_history
             SET from_designation_id = ?, to_designation_id = ?, change_type = ?,
                 posting_date = ?, promotion_order_no = ?, remarks = ?
             WHERE promotion_id = ?`,
            [
                from_designation_id || null,
                to_designation_id,
                change_type || 'Promotion',
                posting_date,
                promotion_order_no || null,
                remarks || null,
                promotion_id
            ]
        );

        // Get the latest promotion's designation for this staff and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [promo.staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, promo.staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record updated successfully'
        });

    } catch (error) {
        console.error('Error updating promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/promotions/:promotion_id - Delete promotion record
router.delete('/:promotion_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { promotion_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        // Get staff_hrms_id before deleting
        const [[promo]] = await conn.query(
            'SELECT staff_hrms_id FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        if (!promo) {
            conn.release();
            return res.status(404).json({ error: 'Promotion record not found' });
        }

        const [result] = await conn.query(
            'DELETE FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        // Get the latest remaining promotion's designation and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [promo.staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, promo.staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
