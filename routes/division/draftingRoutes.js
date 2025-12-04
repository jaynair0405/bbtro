const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/drafting/:hrms_id - Get drafting records for a staff member
router.get('/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                dr.record_id,
                dr.staff_hrms_id,
                dr.drafted_to_designation_id,
                dr.drafted_date,
                dr.order_number,
                dr.drafting_type,
                dr.expected_duration_years,
                dr.relieved_date,
                dr.relieving_order_number,
                dr.remarks,
                dr.status,
                dr.created_at,
                d.designation_name as drafted_to_designation_name,
                d.designation_code as drafted_to_designation_code
            FROM div_staff_drafting_records dr
            LEFT JOIN designations d ON dr.drafted_to_designation_id = d.id
            WHERE dr.staff_hrms_id = ?
            ORDER BY dr.drafted_date DESC, dr.created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });

    } catch (error) {
        console.error('Error fetching drafting records:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/drafting - Add new drafting record
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            staff_hrms_id,
            drafted_to_designation_id,
            drafted_date,
            order_number,
            drafting_type,
            expected_duration_years,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !drafted_to_designation_id || !drafted_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, drafted_to_designation_id, drafted_date'
            });
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
                error: 'Access denied: You can only add drafting records for staff from your office'
            });
        }

        // Check if staff already has an active drafting record
        const [activeCheck] = await conn.query(
            'SELECT record_id FROM div_staff_drafting_records WHERE staff_hrms_id = ? AND status = "Active"',
            [staff_hrms_id]
        );

        if (activeCheck.length > 0) {
            conn.release();
            return res.status(409).json({
                error: 'Staff already has an active drafting record. Please relieve from current post first.'
            });
        }

        // Insert drafting record
        const [result] = await conn.query(
            `INSERT INTO div_staff_drafting_records
             (staff_hrms_id, drafted_to_designation_id, drafted_date, order_number,
              drafting_type, expected_duration_years, remarks, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', NOW())`,
            [
                staff_hrms_id,
                drafted_to_designation_id,
                drafted_date,
                order_number || null,
                drafting_type || 'Temporary',
                expected_duration_years || null,
                remarks || null
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Drafting record added successfully',
            record_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding drafting record:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/drafting/:record_id/relieve - Relieve staff from drafted post
router.put('/:record_id/relieve', requireAuth, async (req, res) => {
    try {
        const { record_id } = req.params;
        const {
            relieved_date,
            relieving_order_number,
            remarks
        } = req.body;

        // Validation
        if (!relieved_date) {
            return res.status(400).json({
                error: 'Missing required field: relieved_date'
            });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Permission check
        const [recordCheck] = await conn.query(
            `SELECT dr.staff_hrms_id, s.current_office_code
             FROM div_staff_drafting_records dr
             JOIN div_staff_master s ON dr.staff_hrms_id = s.hrms_id
             WHERE dr.record_id = ?`,
            [record_id]
        );

        if (recordCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Drafting record not found' });
        }

        const staffOffice = recordCheck[0].current_office_code;
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        if (userRole !== 'division_admin' && staffOffice !== userOffice) {
            conn.release();
            return res.status(403).json({
                error: 'Access denied: You can only relieve staff from your office'
            });
        }

        // Update record to relieved
        const [result] = await conn.query(
            `UPDATE div_staff_drafting_records
             SET relieved_date = ?, relieving_order_number = ?,
                 remarks = CONCAT(IFNULL(remarks, ''), '\n', 'Relieved: ', IFNULL(?, '')),
                 status = 'Relieved', updated_at = NOW()
             WHERE record_id = ?`,
            [
                relieved_date,
                relieving_order_number || null,
                remarks || '',
                record_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Drafting record not found' });
        }

        res.json({
            success: true,
            message: 'Staff relieved from drafted post successfully'
        });

    } catch (error) {
        console.error('Error relieving staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/drafting/:record_id - Delete drafting record
router.delete('/:record_id', requireAuth, async (req, res) => {
    try {
        const { record_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM div_staff_drafting_records WHERE record_id = ?',
            [record_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Drafting record not found' });
        }

        res.json({
            success: true,
            message: 'Drafting record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting drafting record:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/drafted-staff - Get list of all currently drafted staff
router.get('/report/list', requireAuth, async (req, res) => {
    try {
        const { office_code, status } = req.query;
        const userRole = req.session.user.div_role;
        const userOffice = req.session.user.div_office_code;
        const conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_office_code,
                o.office_name,
                s.designation_id as original_designation_id,
                d1.designation_name as original_designation_name,
                dr.record_id,
                dr.drafted_to_designation_id,
                d2.designation_name as drafted_to_designation_name,
                d2.designation_code as drafted_to_designation_code,
                dr.drafted_date,
                dr.order_number,
                dr.drafting_type,
                dr.expected_duration_years,
                dr.relieved_date,
                dr.status,
                dr.remarks,
                DATEDIFF(CURDATE(), dr.drafted_date) as days_on_post,
                CASE
                    WHEN dr.expected_duration_years IS NOT NULL
                    THEN DATEDIFF(DATE_ADD(dr.drafted_date, INTERVAL dr.expected_duration_years YEAR), CURDATE())
                    ELSE NULL
                END as days_until_expected_relief
            FROM div_staff_drafting_records dr
            JOIN div_staff_master s ON dr.staff_hrms_id = s.hrms_id
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d1 ON s.designation_id = d1.id
            LEFT JOIN designations d2 ON dr.drafted_to_designation_id = d2.id
            WHERE 1=1
        `;

        const params = [];

        // Status filter
        if (status && status !== 'ALL') {
            query += ' AND dr.status = ?';
            params.push(status);
        }
        // If status is 'ALL', don't add any status filter to show both Active and Relieved

        // Office-based access control
        if (userRole !== 'division_admin') {
            query += ' AND s.current_office_code = ?';
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            query += ' AND s.current_office_code = ?';
            params.push(office_code);
        }

        query += ' ORDER BY dr.drafted_date DESC';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching drafted staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
