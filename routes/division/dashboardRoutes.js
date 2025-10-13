const express = require('express');
const router = express.Router();

// GET /api/division/offices - Get all offices
router.get('/offices', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = 'SELECT * FROM offices WHERE is_active = 1 ORDER BY office_name';
        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/designations - Get all designations
router.get('/designations', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = 'SELECT * FROM designations ORDER BY grade_level, designation_name';
        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching designations:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/training-centers - Get all training centers
router.get('/training-centers', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = 'SELECT * FROM div_training_centers ORDER BY center_name';
        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching training centers:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/staff/:search - Search staff by HRMS ID or name
router.get('/staff-search/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT s.*, o.office_name, d.designation_name
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE s.hrms_id = ? OR s.name LIKE ?
            LIMIT 10
        `;

        const [results] = await conn.query(query, [search, `%${search}%`]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/staff - Get staff by office
router.get('/staff', async (req, res) => {
    try {
        const { office_code } = req.query;
        const conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT s.hrms_id, s.name, s.current_cms_id, o.office_name, d.designation_name,
                   s.safety_category, s.assignment_status
            FROM div_staff_master s
            JOIN offices o ON s.current_office_code = o.office_code
            JOIN designations d ON s.designation_id = d.id
        `;

        const params = [];
        if (office_code) {
            query += ' WHERE s.current_office_code = ?';
            params.push(office_code);
        }

        query += ' ORDER BY o.office_name, s.name';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-requests - Get pending transfers
router.get('/transfer-requests', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = `
            SELECT tr.request_id, tr.staff_hrms_id, s.name,
                   tr.from_office_code, tr.to_office_code, tr.request_date, tr.status
            FROM div_transfer_requests tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            WHERE tr.status = 'Pending'
            ORDER BY tr.request_date DESC
        `;

        const [results] = await conn.query(query);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching transfer requests:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/staff/:hrms_id - Update staff biodata
router.put('/staff/:hrms_id', async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        // First, get the staff's current office
        const [staffCheck] = await conn.query(
            'SELECT current_office_code FROM div_staff_master WHERE hrms_id = ?',
            [hrms_id]
        );

        if (staffCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Staff not found' });
        }

        const staffOffice = staffCheck[0].current_office_code;
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        // Check permissions: only same office or division_admin can edit
        if (userRole !== 'division_admin' && staffOffice !== userOffice) {
            conn.release();
            return res.status(403).json({
                error: 'Access denied: You can only edit staff from your office'
            });
        }

        const {
            name,
            date_of_birth,
            gender,
            father_name,
            caste,
            marital_status,
            vision,
            blood_group,
            phone_number,
            cug_number,
            email,
            present_address,
            permanent_address,
            pf_number,
            aadhar_card_no,
            pan_card_no,
            date_of_appointment,
            safety_category
        } = req.body;

        const [result] = await conn.query(
            `UPDATE div_staff_master
             SET name = ?, date_of_birth = ?, gender = ?, fathers_name = ?, caste = ?,
                 marital_status = ?, vision = ?, blood_group = ?,
                 phone_number = ?, cug_number = ?, email = ?,
                 present_address = ?, permanent_address = ?,
                 pf_number = ?, aadhar_card_no = ?, pan_card_no = ?,
                 date_of_appointment = ?, safety_category = ?,
                 updated_at = NOW()
             WHERE hrms_id = ?`,
            [
                name, date_of_birth, gender, father_name, caste,
                marital_status, vision, blood_group,
                phone_number, cug_number, email,
                present_address, permanent_address,
                pf_number, aadhar_card_no, pan_card_no,
                date_of_appointment, safety_category,
                hrms_id
            ]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        res.json({
            success: true,
            message: 'Staff biodata updated successfully'
        });

    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/dashboard-stats - Get dashboard statistics by office
router.get('/dashboard-stats', async (req, res) => {
    try {
        const { office_code } = req.query;
        const conn = await req.app.locals.pool.getConnection();

        // Total staff count for the office
        let staffQuery = 'SELECT COUNT(*) as total_staff FROM div_staff_master';
        const staffParams = [];

        if (office_code) {
            staffQuery += ' WHERE current_office_code = ?';
            staffParams.push(office_code);
        }

        const [staffResult] = await conn.query(staffQuery, staffParams);

        // PME pending - Get staff with PME due in current month (October 2025)
        // PME training_id = 1
        // Shows PME due from start of current month to end of current month
        let pmeQuery = `
            SELECT COUNT(DISTINCT tr.staff_hrms_id) as pending_pme
            FROM div_training_records tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            WHERE tr.training_id = 1
            AND tr.due_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND tr.due_date <= LAST_DAY(CURDATE())
        `;
        const pmeParams = [];

        if (office_code) {
            pmeQuery += ' AND s.current_office_code = ?';
            pmeParams.push(office_code);
        }

        const [pmeResult] = await conn.query(pmeQuery, pmeParams);
        const pendingPME = pmeResult[0].pending_pme;

        // Leave applications - placeholder (table doesn't exist yet)
        // TODO: Create div_leave_applications table
        const leaveApplications = 0;

        // Attendance rate - placeholder (calculation logic to be added)
        // TODO: Implement attendance tracking
        const attendanceRate = 97.5;

        conn.release();

        res.json({
            success: true,
            data: {
                totalStaff: staffResult[0].total_staff,
                pendingPME: pendingPME,
                leaveApplications: leaveApplications,
                attendanceRate: attendanceRate
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
