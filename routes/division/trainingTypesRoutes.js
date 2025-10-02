const express = require('express');
const router = express.Router();

// Middleware to check Division Admin role
const requireDivisionAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.user.div_role !== 'division_admin') {
        return res.status(403).json({ error: 'Access denied: Division Admin role required' });
    }
    next();
};

// GET /api/division/training-types - Get all training types
router.get('/', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = `
            SELECT training_id as id, training_name,
                   ROUND(validity_months / 12, 1) as validity_years
            FROM div_training_types
            ORDER BY training_name
        `;
        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching training types:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/training-types - Add new training type (Admin only)
router.post('/', requireDivisionAdmin, async (req, res) => {
    try {
        const { training_name, validity_years } = req.body;

        // Validation
        if (!training_name || !training_name.trim()) {
            return res.status(400).json({ error: 'Training name is required' });
        }

        if (!validity_years || validity_years <= 0) {
            return res.status(400).json({ error: 'Valid validity period is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Check for duplicate
        const [existing] = await conn.query(
            'SELECT training_id FROM div_training_types WHERE training_name = ?',
            [training_name.trim()]
        );

        if (existing.length > 0) {
            conn.release();
            return res.status(409).json({ error: 'Training type already exists' });
        }

        // Convert years to months
        const validity_months = validity_years * 12;

        // Insert new training type
        const [result] = await conn.query(
            'INSERT INTO div_training_types (training_name, validity_months) VALUES (?, ?)',
            [training_name.trim(), validity_months]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Training type added successfully',
            data: {
                id: result.insertId,
                training_name: training_name.trim(),
                validity_years: validity_years
            }
        });

    } catch (error) {
        console.error('Error adding training type:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/training-types/:id - Update training type (Admin only)
router.put('/:id', requireDivisionAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { training_name, validity_years } = req.body;

        // Validation
        if (!training_name || !training_name.trim()) {
            return res.status(400).json({ error: 'Training name is required' });
        }

        if (!validity_years || validity_years <= 0) {
            return res.status(400).json({ error: 'Valid validity period is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Check if training type exists
        const [existing] = await conn.query(
            'SELECT training_id FROM div_training_types WHERE training_id = ?',
            [id]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Training type not found' });
        }

        // Check for duplicate name (excluding current record)
        const [duplicate] = await conn.query(
            'SELECT training_id FROM div_training_types WHERE training_name = ? AND training_id != ?',
            [training_name.trim(), id]
        );

        if (duplicate.length > 0) {
            conn.release();
            return res.status(409).json({ error: 'Training type with this name already exists' });
        }

        // Convert years to months
        const validity_months = validity_years * 12;

        // Update training type
        await conn.query(
            'UPDATE div_training_types SET training_name = ?, validity_months = ? WHERE training_id = ?',
            [training_name.trim(), validity_months, id]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Training type updated successfully',
            data: {
                id: id,
                training_name: training_name.trim(),
                validity_years: validity_years
            }
        });

    } catch (error) {
        console.error('Error updating training type:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/training-types/:id - Delete training type (Admin only)
router.delete('/:id', requireDivisionAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        // Check if training type exists
        const [existing] = await conn.query(
            'SELECT training_name FROM div_training_types WHERE training_id = ?',
            [id]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Training type not found' });
        }

        // Check if training type is being used in training records
        const [usageCheck] = await conn.query(
            'SELECT COUNT(*) as count FROM div_training_records WHERE training_id = ?',
            [id]
        );

        if (usageCheck[0].count > 0) {
            conn.release();
            return res.status(409).json({
                error: 'Cannot delete training type',
                details: `This training type is used in ${usageCheck[0].count} training record(s)`
            });
        }

        // Delete training type
        await conn.query('DELETE FROM div_training_types WHERE training_id = ?', [id]);
        conn.release();

        res.json({
            success: true,
            message: `Training type "${existing[0].training_name}" deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting training type:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
