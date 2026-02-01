const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/detonators/:hrms_id - Get detonator stock for a staff
router.get('/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                detonator_stock_id,
                staff_hrms_id,
                lot_number,
                mfg_date,
                expiry_date,
                quantity,
                issue_date,
                issued_by,
                status,
                remarks,
                created_by,
                created_at
            FROM div_staff_detonator_stock
            WHERE staff_hrms_id = ?
            ORDER BY issue_date DESC, created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching detonator stock:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/detonators - Add new detonator stock
router.post('/', requireAuth, async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            lot_number,
            mfg_date,
            expiry_date,
            quantity,
            issue_date,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !lot_number || !mfg_date || !expiry_date || !issue_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, lot_number, mfg_date, expiry_date, issue_date'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_staff_detonator_stock
             (staff_hrms_id, lot_number, mfg_date, expiry_date, quantity, issue_date,
              issued_by, status, remarks, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, NOW())`,
            [
                staff_hrms_id,
                lot_number,
                mfg_date,
                expiry_date,
                quantity || 10,
                issue_date,
                req.session.user.username,
                remarks || null,
                req.session.user.username
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Detonator stock added successfully',
            detonator_stock_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding detonator stock:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/detonators/:detonator_stock_id - Update detonator stock
router.put('/:detonator_stock_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { detonator_stock_id } = req.params;
        const {
            lot_number,
            mfg_date,
            expiry_date,
            quantity,
            issue_date,
            status,
            remarks
        } = req.body;

        // Validation
        if (!lot_number || !mfg_date || !expiry_date || !issue_date) {
            return res.status(400).json({
                error: 'Missing required fields: lot_number, mfg_date, expiry_date, issue_date'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `UPDATE div_staff_detonator_stock
             SET lot_number = ?, mfg_date = ?, expiry_date = ?, quantity = ?,
                 issue_date = ?, status = ?, remarks = ?,
                 updated_by = ?, updated_at = NOW()
             WHERE detonator_stock_id = ?`,
            [
                lot_number,
                mfg_date,
                expiry_date,
                quantity || 10,
                issue_date,
                status || 'Active',
                remarks || null,
                req.session.user.username,
                detonator_stock_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Detonator stock record not found' });
        }

        res.json({
            success: true,
            message: 'Detonator stock updated successfully'
        });

    } catch (error) {
        console.error('Error updating detonator stock:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/detonators/:detonator_stock_id - Delete detonator stock
router.delete('/:detonator_stock_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { detonator_stock_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_staff_detonator_stock WHERE detonator_stock_id = ?',
            [detonator_stock_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Detonator stock record not found' });
        }

        res.json({
            success: true,
            message: 'Detonator stock deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting detonator stock:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
