const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// ============================================
// SPECIFIC ROUTES (must come before parameterized routes)
// ============================================

// GET /api/division/training/due-report - Get training due/overdue report with filters
router.get('/due-report', requireAuth, async (req, res) => {
    try {
        const {
            training_id,
            office_code,
            from_date,
            to_date
        } = req.query;

        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        const conn = await req.app.locals.pool.getConnection();

        // Base query for selecting latest records with common filters
        const baseQuery = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_office_code,
                o.office_name,
                s.designation_id,
                d.designation_name,
                tt.training_id,
                tt.training_name,
                tr.record_id,
                tr.done_date,
                tr.due_date,
                tr.status,
                tc.center_name,
                DATEDIFF(tr.due_date, CURDATE()) as days_remaining
            FROM div_training_records tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN div_training_centers tc ON tr.training_center_id = tc.center_id
            WHERE s.status = 'Active'
            AND tr.record_id IN (
                SELECT MAX(record_id)
                FROM div_training_records
                GROUP BY staff_hrms_id, training_id
            )
        `;

        // Build common filter conditions
        let commonFilters = '';
        const commonParams = [];

        // Office-based access control
        if (userRole !== 'division_admin') {
            commonFilters += ' AND s.current_office_code = ?';
            commonParams.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            commonFilters += ' AND s.current_office_code = ?';
            commonParams.push(office_code);
        }

        // Training type filter
        if (training_id && training_id !== 'all') {
            commonFilters += ' AND tr.training_id = ?';
            commonParams.push(training_id);
        }

        // Query 1: Get OVERDUE records (due_date < TODAY)
        const overdueQuery = baseQuery + commonFilters + ' AND tr.due_date < CURDATE() ORDER BY tr.due_date ASC';
        const [overdueRecords] = await conn.query(overdueQuery, commonParams);

        // Query 2: Get IN-RANGE records (due_date within selected range, excluding overdue)
        let inRangeQuery = baseQuery + commonFilters;
        const inRangeParams = [...commonParams];

        if (from_date) {
            inRangeQuery += ' AND tr.due_date >= ?';
            inRangeParams.push(from_date);
        }
        if (to_date) {
            inRangeQuery += ' AND tr.due_date <= ?';
            inRangeParams.push(to_date);
        }

        inRangeQuery += ' ORDER BY tr.due_date ASC';

        const [inRangeRecords] = await conn.query(inRangeQuery, inRangeParams);

        conn.release();

        res.json({
            success: true,
            overdue: overdueRecords,
            inRange: inRangeRecords,
            overdueCount: overdueRecords.length,
            inRangeCount: inRangeRecords.length
        });

    } catch (error) {
        console.error('Error fetching training due report:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/training/history/:hrms_id - Get training history for a staff member
router.get('/history/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const { training_id } = req.query;

        const conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT
                tr.record_id,
                tr.staff_hrms_id,
                tr.training_id,
                tr.done_date,
                tr.due_date,
                tr.status,
                tr.training_center_id,
                tr.general_remarks as remarks,
                tr.created_at,
                tt.training_name,
                tt.training_code,
                tc.center_name
            FROM div_training_records tr
            JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN div_training_centers tc ON tr.training_center_id = tc.center_id
            WHERE tr.staff_hrms_id = ?
        `;

        const params = [hrms_id];

        // Optional training type filter
        if (training_id && training_id !== 'all') {
            query += ' AND tr.training_id = ?';
            params.push(training_id);
        }

        query += ' ORDER BY tr.done_date DESC, tr.created_at DESC';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({ success: true, data: results });

    } catch (error) {
        console.error('Error fetching training history:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ============================================
// PARAMETERIZED ROUTES (must come after specific routes)
// ============================================

// GET /api/division/training/:hrms_id - Get latest training records for a staff (one per training type)
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
            INNER JOIN (
                SELECT training_id, MAX(done_date) as max_done_date
                FROM div_training_records
                WHERE staff_hrms_id = ?
                GROUP BY training_id
            ) latest ON tr.training_id = latest.training_id
                    AND tr.done_date = latest.max_done_date
                    AND tr.staff_hrms_id = ?
            LEFT JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN div_training_centers tc ON tr.training_center_id = tc.center_id
            ORDER BY tr.due_date DESC, tr.done_date DESC
        `;

        const [results] = await conn.query(query, [hrms_id, hrms_id]);
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
            remarks,
            medical_fit,
            decategorized_date,
            decategorized_reason,
            medical_remarks
        } = req.body;

        // Basic validation
        if (!staff_hrms_id || !training_id || !done_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, training_id, done_date'
            });
        }

        // Validate based on medical fitness
        const isMedicallyUnfit = medical_fit === 0;
        if (isMedicallyUnfit) {
            // If unfit, require decategorized date and reason
            if (!decategorized_date || !decategorized_reason) {
                return res.status(400).json({
                    error: 'Decategorized date and reason are required for medically unfit staff'
                });
            }
        } else {
            // If fit, require due date
            if (!due_date) {
                return res.status(400).json({
                    error: 'Due date is required'
                });
            }
        }

        const conn = await req.app.locals.pool.getConnection();

        // Permission check: Get staff's office and verify access
        const [staffCheck] = await conn.query(
            'SELECT current_office_code FROM div_staff_master WHERE hrms_id = ?',
            [staff_hrms_id]
        );

        if (staffCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Staff not found' });
        }

        const staffOffice = staffCheck[0].current_office_code;
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        // Check permissions: only same office or division_admin can add
        if (userRole !== 'division_admin' && staffOffice !== userOffice) {
            conn.release();
            return res.status(403).json({
                error: 'Access denied: You can only add training records for staff from your office'
            });
        }

        // Insert training record with all fields
        const [result] = await conn.query(
            `INSERT INTO div_training_records
             (staff_hrms_id, training_id, done_date, due_date, training_center_id, general_remarks,
              medical_fit, decategorized_date, decategorized_reason, medical_remarks, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                training_id,
                done_date,
                due_date || null,
                training_center_id || null,
                remarks || null,
                medical_fit !== undefined ? medical_fit : 1,
                decategorized_date || null,
                decategorized_reason || null,
                medical_remarks || null
            ]
        );

        // If medically unfit, update staff status to "Medically Decategorised"
        if (isMedicallyUnfit) {
            await conn.query(
                `UPDATE div_staff_master
                 SET status = 'Medically Decategorised', updated_at = NOW()
                 WHERE hrms_id = ?`,
                [staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: isMedicallyUnfit
                ? 'Training record added and staff marked as Medically Decategorised'
                : 'Training record added successfully',
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
