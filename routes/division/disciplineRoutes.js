const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// ========== AWARDS ROUTES ==========

// GET /api/division/discipline/awards/:hrms_id - Get awards for a staff
router.get('/awards/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                award_id,
                staff_hrms_id,
                award_name,
                award_date,
                issued_by,
                description,
                remarks,
                created_by,
                created_at
            FROM div_staff_awards
            WHERE staff_hrms_id = ?
            ORDER BY award_date DESC, created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching awards:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/discipline/awards - Add new award
router.post('/awards', requireAuth, async (req, res) => {
    try {
        const {
            staff_hrms_id,
            award_name,
            award_date,
            issued_by,
            description,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !award_name || !award_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, award_name, award_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_staff_awards
             (staff_hrms_id, award_name, award_date, issued_by, description, remarks,
              created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                award_name,
                award_date,
                issued_by || null,
                description || null,
                remarks || null,
                req.session.user.username
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Award added successfully',
            award_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding award:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/discipline/awards/:award_id - Update award
router.put('/awards/:award_id', requireAuth, async (req, res) => {
    try {
        const { award_id } = req.params;
        const {
            award_name,
            award_date,
            issued_by,
            description,
            remarks
        } = req.body;

        // Validation
        if (!award_name || !award_date) {
            return res.status(400).json({
                error: 'Missing required fields: award_name, award_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `UPDATE div_staff_awards
             SET award_name = ?, award_date = ?, issued_by = ?,
                 description = ?, remarks = ?,
                 updated_by = ?, updated_at = NOW()
             WHERE award_id = ?`,
            [
                award_name,
                award_date,
                issued_by || null,
                description || null,
                remarks || null,
                req.session.user.username,
                award_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json({
            success: true,
            message: 'Award updated successfully'
        });

    } catch (error) {
        console.error('Error updating award:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/discipline/awards/:award_id - Delete award
router.delete('/awards/:award_id', requireAuth, async (req, res) => {
    try {
        const { award_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_staff_awards WHERE award_id = ?',
            [award_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json({
            success: true,
            message: 'Award deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting award:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ========== PUNISHMENTS ROUTES ==========

// Middleware to check division_admin role
function requireDivisionAdmin(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.user.div_role !== 'division_admin') {
        return res.status(403).json({ error: 'Access denied: Division admin only' });
    }
    next();
}

// GET /api/division/discipline/punishments/:hrms_id - Get punishments for a staff (admin only)
router.get('/punishments/:hrms_id', requireDivisionAdmin, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                p.punishment_id,
                p.staff_hrms_id,
                p.punishment_type,
                p.punishment_date,
                p.order_no,
                p.severity,
                p.demoted_to_designation_id,
                p.promotion_history_id,
                p.description,
                p.issued_by,
                p.remarks,
                p.created_by,
                p.created_at,
                d.designation_name as demoted_designation_name
            FROM div_staff_punishments p
            LEFT JOIN designations d ON p.demoted_to_designation_id = d.id
            WHERE p.staff_hrms_id = ?
            ORDER BY p.punishment_date DESC, p.created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching punishments:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/discipline/punishments - Add new punishment (admin only)
router.post('/punishments', requireDivisionAdmin, async (req, res) => {
    try {
        const {
            staff_hrms_id,
            punishment_type,
            punishment_date,
            order_no,
            severity,
            demoted_to_designation_id,
            promotion_history_id,
            description,
            issued_by,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !punishment_type || !punishment_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, punishment_type, punishment_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_staff_punishments
             (staff_hrms_id, punishment_type, punishment_date, order_no, severity,
              demoted_to_designation_id, promotion_history_id, description, issued_by, remarks,
              created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                punishment_type,
                punishment_date,
                order_no || null,
                severity || null,
                demoted_to_designation_id || null,
                promotion_history_id || null,
                description || null,
                issued_by || null,
                remarks || null,
                req.session.user.username
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Punishment added successfully',
            punishment_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding punishment:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/discipline/punishments/:punishment_id - Update punishment (admin only)
router.put('/punishments/:punishment_id', requireDivisionAdmin, async (req, res) => {
    try {
        const { punishment_id } = req.params;
        const {
            punishment_type,
            punishment_date,
            order_no,
            severity,
            demoted_to_designation_id,
            promotion_history_id,
            description,
            issued_by,
            remarks
        } = req.body;

        // Validation
        if (!punishment_type || !punishment_date) {
            return res.status(400).json({
                error: 'Missing required fields: punishment_type, punishment_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `UPDATE div_staff_punishments
             SET punishment_type = ?, punishment_date = ?, order_no = ?, severity = ?,
                 demoted_to_designation_id = ?, promotion_history_id = ?, description = ?,
                 issued_by = ?, remarks = ?,
                 updated_by = ?, updated_at = NOW()
             WHERE punishment_id = ?`,
            [
                punishment_type,
                punishment_date,
                order_no || null,
                severity || null,
                demoted_to_designation_id || null,
                promotion_history_id || null,
                description || null,
                issued_by || null,
                remarks || null,
                req.session.user.username,
                punishment_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Punishment not found' });
        }

        res.json({
            success: true,
            message: 'Punishment updated successfully'
        });

    } catch (error) {
        console.error('Error updating punishment:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/discipline/punishments/:punishment_id - Delete punishment (admin only)
router.delete('/punishments/:punishment_id', requireDivisionAdmin, async (req, res) => {
    try {
        const { punishment_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_staff_punishments WHERE punishment_id = ?',
            [punishment_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Punishment not found' });
        }

        res.json({
            success: true,
            message: 'Punishment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting punishment:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
