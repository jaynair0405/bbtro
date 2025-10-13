const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/family/:hrms_id - Get family members for a staff
router.get('/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT family_id, member_name, relation, date_of_birth, occupation, is_dependent
            FROM div_family_members
            WHERE staff_hrms_id = ?
            ORDER BY
                CASE relation
                    WHEN 'Spouse' THEN 1
                    WHEN 'Son' THEN 2
                    WHEN 'Daughter' THEN 3
                    WHEN 'Father' THEN 4
                    WHEN 'Mother' THEN 5
                    ELSE 6
                END,
                date_of_birth
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching family members:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/family - Add new family member
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            staff_hrms_id,
            member_name,
            relation,
            date_of_birth,
            occupation,
            is_dependent
        } = req.body;

        // Validation
        if (!staff_hrms_id || !member_name || !relation) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, member_name, relation'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_family_members
             (staff_hrms_id, member_name, relation, date_of_birth, occupation, is_dependent, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                member_name,
                relation,
                date_of_birth || null,
                occupation || null,
                is_dependent ? 1 : 0
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Family member added successfully',
            family_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding family member:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/family/:family_id - Update family member
router.put('/:family_id', requireAuth, async (req, res) => {
    try {
        const { family_id } = req.params;
        const {
            member_name,
            relation,
            date_of_birth,
            occupation,
            is_dependent
        } = req.body;

        // Validation
        if (!member_name || !relation) {
            return res.status(400).json({
                error: 'Missing required fields: member_name, relation'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `UPDATE div_family_members
             SET member_name = ?, relation = ?, date_of_birth = ?,
                 occupation = ?, is_dependent = ?
             WHERE family_id = ?`,
            [
                member_name,
                relation,
                date_of_birth || null,
                occupation || null,
                is_dependent ? 1 : 0,
                family_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        res.json({
            success: true,
            message: 'Family member updated successfully'
        });

    } catch (error) {
        console.error('Error updating family member:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/family/:family_id - Delete family member
router.delete('/:family_id', requireAuth, async (req, res) => {
    try {
        const { family_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_family_members WHERE family_id = ?',
            [family_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        res.json({
            success: true,
            message: 'Family member deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting family member:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
