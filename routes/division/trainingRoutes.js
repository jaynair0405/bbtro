const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/training/:hrms_id - Get training records for a staff
router.get('/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                tr.record_id,
                tr.staff_hrms_id,
                tr.training_id,
                tr.done_date,
                tr.due_date,
                tr.training_center_id,
                tr.general_remarks as remarks,
                tr.created_at,
                tt.training_name,
                tc.center_name
            FROM div_training_records tr
            LEFT JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN div_training_centers tc ON tr.training_center_id = tc.center_id
            WHERE tr.staff_hrms_id = ?
            ORDER BY tr.due_date DESC, tr.done_date DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching training records:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/training - Add new training record
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            staff_hrms_id,
            training_id,
            done_date,
            due_date,
            training_center_id,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !training_id || !done_date || !due_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, training_id, done_date, due_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_training_records
             (staff_hrms_id, training_id, done_date, due_date, training_center_id, general_remarks, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                training_id,
                done_date,
                due_date,
                training_center_id || null,
                remarks || null
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Training record added successfully',
            record_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding training record:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/training/:record_id - Update training record
router.put('/:record_id', requireAuth, async (req, res) => {
    try {
        const { record_id } = req.params;
        const {
            training_id,
            done_date,
            due_date,
            training_center_id,
            remarks
        } = req.body;

        // Validation
        if (!training_id || !done_date || !due_date) {
            return res.status(400).json({
                error: 'Missing required fields: training_id, done_date, due_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `UPDATE div_training_records
             SET training_id = ?, done_date = ?, due_date = ?,
                 training_center_id = ?, general_remarks = ?
             WHERE record_id = ?`,
            [
                training_id,
                done_date,
                due_date,
                training_center_id || null,
                remarks || null,
                record_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Training record not found' });
        }

        res.json({
            success: true,
            message: 'Training record updated successfully'
        });

    } catch (error) {
        console.error('Error updating training record:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/training/:record_id - Delete training record
router.delete('/:record_id', requireAuth, async (req, res) => {
    try {
        const { record_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_training_records WHERE record_id = ?',
            [record_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Training record not found' });
        }

        res.json({
            success: true,
            message: 'Training record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting training record:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
