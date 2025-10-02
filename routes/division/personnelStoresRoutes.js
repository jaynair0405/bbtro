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

// GET /api/division/personnel-stores - Get all personnel store items
router.get('/', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = `
            SELECT item_id as id, item_code, item_name, standard_quantity,
                   category, is_active, description
            FROM div_personnel_store_items
            WHERE is_active = 1
            ORDER BY category, item_name
        `;
        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching personnel store items:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/personnel-stores - Add new personnel store item (Admin only)
router.post('/', requireDivisionAdmin, async (req, res) => {
    try {
        const { item_code, item_name, standard_quantity, category, description } = req.body;

        // Validation
        if (!item_name || !item_name.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        if (!standard_quantity || standard_quantity <= 0) {
            return res.status(400).json({ error: 'Valid standard quantity is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Check for duplicate item code or name
        const [existing] = await conn.query(
            'SELECT item_id FROM div_personnel_store_items WHERE item_code = ? OR item_name = ?',
            [item_code?.trim() || null, item_name.trim()]
        );

        if (existing.length > 0) {
            conn.release();
            return res.status(409).json({ error: 'Item with this code or name already exists' });
        }

        // Insert new item
        const [result] = await conn.query(
            `INSERT INTO div_personnel_store_items
             (item_code, item_name, standard_quantity, category, description)
             VALUES (?, ?, ?, ?, ?)`,
            [
                item_code?.trim() || null,
                item_name.trim(),
                standard_quantity,
                category || 'Other',
                description?.trim() || null
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Personnel store item added successfully',
            data: {
                id: result.insertId,
                item_code: item_code?.trim() || null,
                item_name: item_name.trim(),
                standard_quantity: standard_quantity,
                category: category || 'Other',
                description: description?.trim() || null
            }
        });

    } catch (error) {
        console.error('Error adding personnel store item:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/personnel-stores/:id - Update personnel store item (Admin only)
router.put('/:id', requireDivisionAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { item_code, item_name, standard_quantity, category, description } = req.body;

        // Validation
        if (!item_name || !item_name.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        if (!standard_quantity || standard_quantity <= 0) {
            return res.status(400).json({ error: 'Valid standard quantity is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Check if item exists
        const [existing] = await conn.query(
            'SELECT item_id FROM div_personnel_store_items WHERE item_id = ?',
            [id]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Personnel store item not found' });
        }

        // Check for duplicate code or name (excluding current record)
        const [duplicate] = await conn.query(
            `SELECT item_id FROM div_personnel_store_items
             WHERE (item_code = ? OR item_name = ?) AND item_id != ?`,
            [item_code?.trim() || null, item_name.trim(), id]
        );

        if (duplicate.length > 0) {
            conn.release();
            return res.status(409).json({ error: 'Item with this code or name already exists' });
        }

        // Update item
        await conn.query(
            `UPDATE div_personnel_store_items
             SET item_code = ?, item_name = ?, standard_quantity = ?,
                 category = ?, description = ?
             WHERE item_id = ?`,
            [
                item_code?.trim() || null,
                item_name.trim(),
                standard_quantity,
                category || 'Other',
                description?.trim() || null,
                id
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Personnel store item updated successfully',
            data: {
                id: id,
                item_code: item_code?.trim() || null,
                item_name: item_name.trim(),
                standard_quantity: standard_quantity,
                category: category || 'Other',
                description: description?.trim() || null
            }
        });

    } catch (error) {
        console.error('Error updating personnel store item:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/personnel-stores/:id - Delete personnel store item (Admin only)
router.delete('/:id', requireDivisionAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        // Check if item exists
        const [existing] = await conn.query(
            'SELECT item_name FROM div_personnel_store_items WHERE item_id = ?',
            [id]
        );

        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Personnel store item not found' });
        }

        // Check if item is being used in staff personnel stores
        const [usageCheck] = await conn.query(
            'SELECT COUNT(*) as count FROM div_staff_personnel_stores WHERE item_id = ?',
            [id]
        );

        if (usageCheck[0].count > 0) {
            conn.release();
            return res.status(409).json({
                error: 'Cannot delete item',
                details: `This item is issued to ${usageCheck[0].count} staff member(s)`
            });
        }

        // Soft delete (set is_active = 0)
        await conn.query(
            'UPDATE div_personnel_store_items SET is_active = 0 WHERE item_id = ?',
            [id]
        );
        conn.release();

        res.json({
            success: true,
            message: `Personnel store item "${existing[0].item_name}" deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting personnel store item:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
