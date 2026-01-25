const express = require('express');
const router = express.Router();

// Helper function to check if error is "table doesn't exist"
function isTableNotExistError(error) {
    return error.code === 'ER_NO_SUCH_TABLE' || error.errno === 1146;
}

// Format date to YYYY-MM-DD string to avoid timezone issues
function formatDateForDB(dateStr) {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// GET /api/division/midnight-position/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const [categories] = await pool.query(
            `SELECT category_code, category_name, display_order
             FROM div_midnight_position_categories
             WHERE is_active = 1
             ORDER BY display_order`
        );
        res.json(categories);
    } catch (error) {
        // If table doesn't exist, return empty array (frontend will use fallback)
        if (isTableNotExistError(error)) {
            console.warn('Midnight position categories table does not exist yet - returning empty array');
            return res.json([]);
        }
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/division/midnight-position - Get position for date/lobby
router.get('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { date, lobby } = req.query;

        if (!date || !lobby) {
            return res.status(400).json({ error: 'Date and lobby are required' });
        }

        const formattedDate = formatDateForDB(date);

        // Get position summary
        const [positions] = await pool.query(
            `SELECT * FROM div_midnight_position
             WHERE position_date = ? AND lobby_code = ?`,
            [formattedDate, lobby]
        );

        if (positions.length === 0) {
            // No position exists for this date - check if we can carry forward
            const [prevPositions] = await pool.query(
                `SELECT * FROM div_midnight_position
                 WHERE lobby_code = ? AND position_date < ?
                 ORDER BY position_date DESC LIMIT 1`,
                [lobby, formattedDate]
            );

            return res.json({
                exists: false,
                previousDate: prevPositions.length > 0 ? prevPositions[0].position_date : null,
                canCarryForward: prevPositions.length > 0
            });
        }

        // Get staff entries for this position
        const [staffEntries] = await pool.query(
            `SELECT * FROM div_midnight_position_staff
             WHERE position_id = ?
             ORDER BY category, designation, staff_name`,
            [positions[0].id]
        );

        // Group staff by category
        const staffByCategory = {};
        staffEntries.forEach(entry => {
            if (!staffByCategory[entry.category]) {
                staffByCategory[entry.category] = [];
            }
            staffByCategory[entry.category].push(entry);
        });

        res.json({
            exists: true,
            position: positions[0],
            staffByCategory,
            totalStaffEntries: staffEntries.length
        });

    } catch (error) {
        // If table doesn't exist, return graceful response
        if (isTableNotExistError(error)) {
            console.warn('Midnight position table does not exist yet - returning empty state');
            return res.json({
                exists: false,
                tablesNotConfigured: true,
                previousDate: null,
                canCarryForward: false
            });
        }
        console.error('Error fetching position:', error);
        res.status(500).json({ error: 'Failed to fetch position data' });
    }
});

// POST /api/division/midnight-position - Create or update position
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const { date, lobby, summary, staffEntries } = req.body;

        if (!date || !lobby) {
            return res.status(400).json({ error: 'Date and lobby are required' });
        }

        const formattedDate = formatDateForDB(date);

        // Check if position already exists
        const [existing] = await conn.query(
            `SELECT id, finalized FROM div_midnight_position
             WHERE position_date = ? AND lobby_code = ?`,
            [formattedDate, lobby]
        );

        let positionId;

        if (existing.length > 0) {
            // Check if finalized
            if (existing[0].finalized) {
                await conn.rollback();
                return res.status(400).json({ error: 'Position is already finalized and cannot be modified' });
            }

            positionId = existing[0].id;

            // Update existing position
            const updateFields = [];
            const updateValues = [];

            // Build dynamic update for summary fields
            const summaryFields = [
                // Standard designations (KYN, PNVL, CLA)
                'lpg_sanction', 'lpg_on_roll', 'lps_sanction', 'lps_on_roll', 'alp_sanction', 'alp_on_roll',
                // CSMT specific designations
                'lpm_sanction', 'lpm_on_roll', 'lpp_sanction', 'lpp_on_roll',
                // Ghat specific designations (IGP, LNL)
                'lpghat_sanction', 'lpghat_on_roll',
                // Net available for all
                'lpg_net_available', 'lps_net_available', 'alp_net_available',
                'lpm_net_available', 'lpp_net_available', 'lpghat_net_available',
                // LPG working details
                'lpg_slate_yards', 'lpg_btn', 'lpg_tw', 'lpg_le_coaching', 'lpg_protection',
                'lpg_leave_nh', 'lpg_30hrs_rest', 'lpg_sick_iod', 'lpg_absent', 'lpg_pme',
                'lpg_office_enquiry', 'lpg_special_leave', 'lpg_long_training', 'lpg_mid_training',
                'lpg_short_training', 'lpg_lrd', 'lpg_utilization', 'lpg_off_detail', 'lpg_sign_on',
                'lpg_carry_forward', 'lpg_on_detail',
                // LPS working details
                'lps_slate_yards', 'lps_btn', 'lps_tw', 'lps_le_coaching', 'lps_protection',
                'lps_leave_nh', 'lps_30hrs_rest', 'lps_sick_iod', 'lps_absent', 'lps_pme',
                'lps_office_enquiry', 'lps_special_leave', 'lps_long_training', 'lps_mid_training',
                'lps_short_training', 'lps_lrd', 'lps_utilization', 'lps_off_detail', 'lps_sign_on',
                'lps_carry_forward', 'lps_on_detail',
                // ALP working details
                'alp_slate_yards', 'alp_btn', 'alp_tw', 'alp_le_coaching', 'alp_protection',
                'alp_leave_nh', 'alp_30hrs_rest', 'alp_sick_iod', 'alp_absent', 'alp_pme',
                'alp_office_enquiry', 'alp_special_leave', 'alp_long_training', 'alp_mid_training',
                'alp_short_training', 'alp_lrd', 'alp_utilization', 'alp_off_detail', 'alp_sign_on',
                'alp_carry_forward', 'alp_on_detail'
            ];

            if (summary) {
                summaryFields.forEach(field => {
                    if (summary[field] !== undefined) {
                        updateFields.push(`${field} = ?`);
                        updateValues.push(summary[field]);
                    }
                });
            }

            if (updateFields.length > 0) {
                updateValues.push(positionId);
                await conn.query(
                    `UPDATE div_midnight_position SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateValues
                );
            }

        } else {
            // Create new position
            const insertData = {
                position_date: formattedDate,
                lobby_code: lobby,
                ...(summary || {})
            };

            const [result] = await conn.query(
                `INSERT INTO div_midnight_position SET ?`,
                [insertData]
            );
            positionId = result.insertId;
        }

        // Handle staff entries if provided
        if (staffEntries && Array.isArray(staffEntries)) {
            // Delete existing staff entries for this position
            await conn.query(
                `DELETE FROM div_midnight_position_staff WHERE position_id = ?`,
                [positionId]
            );

            // Insert new staff entries
            for (const entry of staffEntries) {
                await conn.query(
                    `INSERT INTO div_midnight_position_staff
                     (position_id, category, staff_hrms_id, staff_name, designation, working_from_as, reason, since_date, remarks)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        positionId,
                        entry.category,
                        entry.staff_hrms_id || null,
                        entry.staff_name,
                        entry.designation,
                        entry.working_from_as || null,
                        entry.reason || null,
                        entry.since_date ? formatDateForDB(entry.since_date) : null,
                        entry.remarks || null
                    ]
                );
            }
        }

        await conn.commit();
        res.json({ success: true, positionId });

    } catch (error) {
        await conn.rollback();
        // If table doesn't exist, return clear error message
        if (isTableNotExistError(error)) {
            console.warn('Midnight position table does not exist yet - cannot save');
            return res.status(400).json({
                error: 'Database tables not configured. Please run the SQL setup script first.',
                tablesNotConfigured: true
            });
        }
        console.error('Error saving position:', error);
        res.status(500).json({ error: 'Failed to save position data' });
    } finally {
        conn.release();
    }
});

// POST /api/division/midnight-position/carry-forward - Carry forward from previous day
router.post('/carry-forward', async (req, res) => {
    const pool = req.app.locals.pool;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const { date, lobby, fromDate } = req.body;

        if (!date || !lobby) {
            return res.status(400).json({ error: 'Date and lobby are required' });
        }

        const formattedDate = formatDateForDB(date);
        const formattedFromDate = fromDate ? formatDateForDB(fromDate) : null;

        // Check if position already exists for target date
        const [existing] = await conn.query(
            `SELECT id FROM div_midnight_position
             WHERE position_date = ? AND lobby_code = ?`,
            [formattedDate, lobby]
        );

        if (existing.length > 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Position already exists for this date' });
        }

        // Get previous position
        let prevQuery = `SELECT * FROM div_midnight_position WHERE lobby_code = ?`;
        let prevParams = [lobby];

        if (formattedFromDate) {
            prevQuery += ` AND position_date = ?`;
            prevParams.push(formattedFromDate);
        } else {
            prevQuery += ` AND position_date < ? ORDER BY position_date DESC LIMIT 1`;
            prevParams.push(formattedDate);
        }

        const [prevPositions] = await conn.query(prevQuery, prevParams);

        if (prevPositions.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'No previous position found to carry forward' });
        }

        const prev = prevPositions[0];

        // Create new position with carried forward data
        const [result] = await conn.query(
            `INSERT INTO div_midnight_position (
                position_date, lobby_code,
                lpg_sanction, lpg_on_roll, lps_sanction, lps_on_roll, alp_sanction, alp_on_roll,
                lpg_net_available, lps_net_available, alp_net_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                formattedDate, lobby,
                prev.lpg_sanction, prev.lpg_on_roll, prev.lps_sanction, prev.lps_on_roll,
                prev.alp_sanction, prev.alp_on_roll,
                prev.lpg_net_available, prev.lps_net_available, prev.alp_net_available
            ]
        );

        const newPositionId = result.insertId;

        // Carry forward staff entries
        const [prevStaff] = await conn.query(
            `SELECT * FROM div_midnight_position_staff WHERE position_id = ?`,
            [prev.id]
        );

        for (const staff of prevStaff) {
            await conn.query(
                `INSERT INTO div_midnight_position_staff
                 (position_id, category, staff_hrms_id, staff_name, designation, working_from_as, reason, since_date, remarks)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newPositionId,
                    staff.category,
                    staff.staff_hrms_id,
                    staff.staff_name,
                    staff.designation,
                    staff.working_from_as,
                    staff.reason,
                    staff.since_date,
                    staff.remarks
                ]
            );
        }

        await conn.commit();
        res.json({
            success: true,
            positionId: newPositionId,
            carriedFromDate: prev.position_date,
            staffEntriesCarried: prevStaff.length
        });

    } catch (error) {
        await conn.rollback();
        console.error('Error carrying forward:', error);
        res.status(500).json({ error: 'Failed to carry forward position' });
    } finally {
        conn.release();
    }
});

// POST /api/division/midnight-position/staff - Add single staff entry
router.post('/staff', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { positionId, category, staff_hrms_id, staff_cms_id, staff_name, designation, working_from_as, reason, since_date, remarks } = req.body;

        if (!positionId || !category || !staff_name || !designation) {
            return res.status(400).json({ error: 'Position ID, category, staff name, and designation are required' });
        }

        // Check if position is finalized
        const [position] = await pool.query(
            `SELECT finalized FROM div_midnight_position WHERE id = ?`,
            [positionId]
        );

        if (position.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }

        if (position[0].finalized) {
            return res.status(400).json({ error: 'Position is finalized and cannot be modified' });
        }

        const [result] = await pool.query(
            `INSERT INTO div_midnight_position_staff
             (position_id, category, staff_hrms_id, staff_cms_id, staff_name, designation, working_from_as, reason, since_date, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                positionId,
                category,
                staff_hrms_id || null,
                staff_cms_id || null,
                staff_name,
                designation,
                working_from_as || null,
                reason || null,
                since_date ? formatDateForDB(since_date) : null,
                remarks || null
            ]
        );

        res.json({ success: true, id: result.insertId });

    } catch (error) {
        console.error('Error adding staff entry:', error);
        res.status(500).json({ error: 'Failed to add staff entry' });
    }
});

// PUT /api/division/midnight-position/staff/:id - Update staff entry
router.put('/staff/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;
        const { category, staff_hrms_id, staff_cms_id, staff_name, designation, working_from_as, reason, since_date, remarks } = req.body;

        // Check if position is finalized
        const [entry] = await pool.query(
            `SELECT s.position_id, p.finalized
             FROM div_midnight_position_staff s
             JOIN div_midnight_position p ON s.position_id = p.id
             WHERE s.id = ?`,
            [id]
        );

        if (entry.length === 0) {
            return res.status(404).json({ error: 'Staff entry not found' });
        }

        if (entry[0].finalized) {
            return res.status(400).json({ error: 'Position is finalized and cannot be modified' });
        }

        const updateFields = [];
        const updateValues = [];

        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
        if (staff_hrms_id !== undefined) { updateFields.push('staff_hrms_id = ?'); updateValues.push(staff_hrms_id || null); }
        if (staff_cms_id !== undefined) { updateFields.push('staff_cms_id = ?'); updateValues.push(staff_cms_id || null); }
        if (staff_name !== undefined) { updateFields.push('staff_name = ?'); updateValues.push(staff_name); }
        if (designation !== undefined) { updateFields.push('designation = ?'); updateValues.push(designation); }
        if (working_from_as !== undefined) { updateFields.push('working_from_as = ?'); updateValues.push(working_from_as || null); }
        if (reason !== undefined) { updateFields.push('reason = ?'); updateValues.push(reason || null); }
        if (since_date !== undefined) { updateFields.push('since_date = ?'); updateValues.push(since_date ? formatDateForDB(since_date) : null); }
        if (remarks !== undefined) { updateFields.push('remarks = ?'); updateValues.push(remarks || null); }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(id);
        await pool.query(
            `UPDATE div_midnight_position_staff SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Error updating staff entry:', error);
        res.status(500).json({ error: 'Failed to update staff entry' });
    }
});

// DELETE /api/division/midnight-position/staff/:id - Delete staff entry
router.delete('/staff/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        // Check if position is finalized
        const [entry] = await pool.query(
            `SELECT s.position_id, p.finalized
             FROM div_midnight_position_staff s
             JOIN div_midnight_position p ON s.position_id = p.id
             WHERE s.id = ?`,
            [id]
        );

        if (entry.length === 0) {
            return res.status(404).json({ error: 'Staff entry not found' });
        }

        if (entry[0].finalized) {
            return res.status(400).json({ error: 'Position is finalized and cannot be modified' });
        }

        await pool.query(`DELETE FROM div_midnight_position_staff WHERE id = ?`, [id]);
        res.json({ success: true });

    } catch (error) {
        console.error('Error deleting staff entry:', error);
        res.status(500).json({ error: 'Failed to delete staff entry' });
    }
});

// POST /api/division/midnight-position/finalize - Finalize position
router.post('/finalize', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { positionId } = req.body;

        if (!positionId) {
            return res.status(400).json({ error: 'Position ID is required' });
        }

        const user = req.session.user?.name || req.session.user?.username || 'System';

        const [result] = await pool.query(
            `UPDATE div_midnight_position
             SET finalized = 1, finalized_by = ?, finalized_at = NOW()
             WHERE id = ? AND finalized = 0`,
            [user, positionId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Position not found or already finalized' });
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Error finalizing position:', error);
        res.status(500).json({ error: 'Failed to finalize position' });
    }
});

// GET /api/division/midnight-position/summary - Get division-wide summary
router.get('/summary', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const formattedDate = formatDateForDB(date);

        const [positions] = await pool.query(
            `SELECT p.*,
                (SELECT COUNT(*) FROM div_midnight_position_staff WHERE position_id = p.id) as staff_entries
             FROM div_midnight_position p
             WHERE position_date = ?
             ORDER BY lobby_code`,
            [formattedDate]
        );

        // Calculate totals
        const totals = {
            lpg_sanction: 0, lpg_on_roll: 0, lpg_net_available: 0,
            lps_sanction: 0, lps_on_roll: 0, lps_net_available: 0,
            alp_sanction: 0, alp_on_roll: 0, alp_net_available: 0
        };

        positions.forEach(pos => {
            totals.lpg_sanction += pos.lpg_sanction || 0;
            totals.lpg_on_roll += pos.lpg_on_roll || 0;
            totals.lpg_net_available += pos.lpg_net_available || 0;
            totals.lps_sanction += pos.lps_sanction || 0;
            totals.lps_on_roll += pos.lps_on_roll || 0;
            totals.lps_net_available += pos.lps_net_available || 0;
            totals.alp_sanction += pos.alp_sanction || 0;
            totals.alp_on_roll += pos.alp_on_roll || 0;
            totals.alp_net_available += pos.alp_net_available || 0;
        });

        res.json({
            date: formattedDate,
            positions,
            totals,
            lobbiesReported: positions.length,
            lobbiesFinalized: positions.filter(p => p.finalized).length
        });

    } catch (error) {
        // If table doesn't exist, return graceful empty response
        if (isTableNotExistError(error)) {
            console.warn('Midnight position table does not exist yet - returning empty summary');
            return res.json({
                date: req.query.date || null,
                positions: [],
                totals: {
                    lpg_sanction: 0, lpg_on_roll: 0, lpg_net_available: 0,
                    lps_sanction: 0, lps_on_roll: 0, lps_net_available: 0,
                    alp_sanction: 0, alp_on_roll: 0, alp_net_available: 0
                },
                lobbiesReported: 0,
                lobbiesFinalized: 0,
                tablesNotConfigured: true
            });
        }
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// ============================================
// Sanction Strength Master Routes
// ============================================

// GET /api/division/midnight-position/sanction - Get all sanction entries
router.get('/sanction', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { office_code } = req.query;

        let query = `SELECT s.*, o.office_name
                     FROM div_sanction_strength_master s
                     LEFT JOIN offices o ON s.office_code = o.office_code
                     ORDER BY s.office_code, s.designation_code`;
        let params = [];

        if (office_code) {
            query = `SELECT s.*, o.office_name
                     FROM div_sanction_strength_master s
                     LEFT JOIN offices o ON s.office_code = o.office_code
                     WHERE s.office_code = ?
                     ORDER BY s.designation_code`;
            params = [office_code];
        }

        const [sanctions] = await pool.query(query, params);
        res.json(sanctions);
    } catch (error) {
        if (isTableNotExistError(error)) {
            return res.json([]);
        }
        console.error('Error fetching sanction data:', error);
        res.status(500).json({ error: 'Failed to fetch sanction data' });
    }
});

// GET /api/division/midnight-position/sanction/offices - Get offices for dropdown
router.get('/sanction/offices', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const [offices] = await pool.query(
            `SELECT office_code, office_name FROM offices WHERE is_active = 1 ORDER BY office_name`
        );
        res.json(offices);
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ error: 'Failed to fetch offices' });
    }
});

// POST /api/division/midnight-position/sanction - Add or update sanction entry
router.post('/sanction', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { office_code, designation_code, sanction_strength } = req.body;

        if (!office_code || !designation_code) {
            return res.status(400).json({ error: 'Office code and designation code are required' });
        }

        const user = req.session.user?.name || req.session.user?.username || 'System';

        // Upsert - insert or update if exists
        const [result] = await pool.query(
            `INSERT INTO div_sanction_strength_master (office_code, designation_code, sanction_strength, updated_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE sanction_strength = VALUES(sanction_strength), updated_by = VALUES(updated_by)`,
            [office_code, designation_code.toUpperCase(), sanction_strength || 0, user]
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        if (isTableNotExistError(error)) {
            return res.status(400).json({
                error: 'Database tables not configured. Please run the SQL setup script first.',
                tablesNotConfigured: true
            });
        }
        console.error('Error saving sanction:', error);
        res.status(500).json({ error: 'Failed to save sanction data' });
    }
});

// PUT /api/division/midnight-position/sanction/:id - Update sanction entry
router.put('/sanction/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;
        const { sanction_strength } = req.body;

        const user = req.session.user?.name || req.session.user?.username || 'System';

        const [result] = await pool.query(
            `UPDATE div_sanction_strength_master SET sanction_strength = ?, updated_by = ? WHERE id = ?`,
            [sanction_strength || 0, user, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sanction entry not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating sanction:', error);
        res.status(500).json({ error: 'Failed to update sanction data' });
    }
});

// DELETE /api/division/midnight-position/sanction/:id - Delete sanction entry
router.delete('/sanction/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM div_sanction_strength_master WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sanction entry not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting sanction:', error);
        res.status(500).json({ error: 'Failed to delete sanction data' });
    }
});

// ============================================
// Row Master Routes (dynamic summary rows)
// ============================================

// GET /api/division/midnight-position/rows - Get all row definitions
router.get('/rows', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { office_code } = req.query;

        // include_inactive=1 to show all rows (for admin settings page)
        const includeInactive = req.query.include_inactive === '1';

        const [rows] = await pool.query(
            `SELECT * FROM div_position_row_master
             ${includeInactive ? '' : 'WHERE is_active = 1'}
             ORDER BY display_order`
        );

        // Filter by applicable_offices if office_code provided
        let filteredRows = rows;
        if (office_code) {
            filteredRows = rows.filter(row => {
                if (!row.applicable_offices) return true; // NULL = all offices
                const offices = row.applicable_offices.split(',').map(o => o.trim());
                return offices.includes(office_code);
            });
        }

        res.json(filteredRows);
    } catch (error) {
        if (isTableNotExistError(error)) {
            return res.json([]);
        }
        console.error('Error fetching rows:', error);
        res.status(500).json({ error: 'Failed to fetch row definitions' });
    }
});

// POST /api/division/midnight-position/rows - Add new custom row
router.post('/rows', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { row_code, row_name, section, is_staff_linked, is_editable, applicable_offices, display_order } = req.body;

        if (!row_code || !row_name) {
            return res.status(400).json({ error: 'Row code and name are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO div_position_row_master
             (row_code, row_name, section, is_staff_linked, is_editable, applicable_offices, display_order, is_system)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [row_code.toUpperCase(), row_name, section || 'CUSTOM', is_staff_linked || 0, is_editable !== false ? 1 : 0, applicable_offices || null, display_order || 50]
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Row code already exists' });
        }
        console.error('Error adding row:', error);
        res.status(500).json({ error: 'Failed to add row' });
    }
});

// PUT /api/division/midnight-position/rows/:id - Update row
router.put('/rows/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;
        const { row_name, section, is_staff_linked, is_editable, applicable_offices, display_order, is_active } = req.body;

        const updates = [];
        const values = [];

        if (row_name !== undefined) { updates.push('row_name = ?'); values.push(row_name); }
        if (section !== undefined) { updates.push('section = ?'); values.push(section); }
        if (is_staff_linked !== undefined) { updates.push('is_staff_linked = ?'); values.push(is_staff_linked); }
        if (is_editable !== undefined) { updates.push('is_editable = ?'); values.push(is_editable); }
        if (applicable_offices !== undefined) { updates.push('applicable_offices = ?'); values.push(applicable_offices || null); }
        if (display_order !== undefined) { updates.push('display_order = ?'); values.push(display_order); }
        if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        await pool.query(`UPDATE div_position_row_master SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating row:', error);
        res.status(500).json({ error: 'Failed to update row' });
    }
});

// DELETE /api/division/midnight-position/rows/:id - Delete custom row (not system rows)
router.delete('/rows/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        // Check if it's a system row
        const [rows] = await pool.query('SELECT is_system FROM div_position_row_master WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Row not found' });
        }
        if (rows[0].is_system) {
            return res.status(400).json({ error: 'Cannot delete system rows' });
        }

        await pool.query('DELETE FROM div_position_row_master WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({ error: 'Failed to delete row' });
    }
});

// ============================================
// Position Values Routes (key-value storage)
// ============================================

// GET /api/division/midnight-position/values/:positionId - Get all values for a position
router.get('/values/:positionId', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { positionId } = req.params;

        const [values] = await pool.query(
            `SELECT row_code, designation_code, value FROM div_position_values WHERE position_id = ?`,
            [positionId]
        );

        // Convert to nested object: { ROW_CODE: { LPG: value, LPS: value, ... } }
        const result = {};
        values.forEach(v => {
            if (!result[v.row_code]) result[v.row_code] = {};
            result[v.row_code][v.designation_code] = v.value;
        });

        res.json(result);
    } catch (error) {
        if (isTableNotExistError(error)) {
            return res.json({});
        }
        console.error('Error fetching values:', error);
        res.status(500).json({ error: 'Failed to fetch position values' });
    }
});

// POST /api/division/midnight-position/values - Save/update values (bulk upsert)
router.post('/values', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { positionId, values } = req.body;

        if (!positionId || !values) {
            return res.status(400).json({ error: 'Position ID and values are required' });
        }

        // values format: { ROW_CODE: { LPG: value, LPS: value, ... }, ... }
        const inserts = [];
        Object.entries(values).forEach(([rowCode, designations]) => {
            Object.entries(designations).forEach(([desigCode, value]) => {
                inserts.push([positionId, rowCode, desigCode, value || 0]);
            });
        });

        if (inserts.length > 0) {
            await pool.query(
                `INSERT INTO div_position_values (position_id, row_code, designation_code, value)
                 VALUES ?
                 ON DUPLICATE KEY UPDATE value = VALUES(value)`,
                [inserts]
            );
        }

        res.json({ success: true, count: inserts.length });
    } catch (error) {
        console.error('Error saving values:', error);
        res.status(500).json({ error: 'Failed to save position values' });
    }
});

// ============================================
// Staff Search Route (for autocomplete from div_staff_master)
// ============================================

// GET /api/division/midnight-position/staff-search - Search staff by name or CMS ID
router.get('/staff-search', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { q, office_code, limit } = req.query;

        if (!q || q.length < 2) {
            return res.json([]);
        }

        // Search all staff across lobbies (Option B - show all + warning)
        let query = `
            SELECT s.hrms_id, s.current_cms_id as cms_id, s.name, s.current_office_code, d.designation_name
            FROM div_staff_master s
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ?)
        `;
        const params = [`%${q}%`, `%${q}%`, `%${q}%`];

        // No office_code filter - search all lobbies
        // Frontend will show warning if staff is from different lobby

        query += ` ORDER BY s.name LIMIT ?`;
        params.push(parseInt(limit) || 20);

        const [staff] = await pool.query(query, params);
        res.json(staff);
    } catch (error) {
        console.error('Error searching staff:', error);
        res.status(500).json({ error: 'Failed to search staff' });
    }
});

module.exports = router;
