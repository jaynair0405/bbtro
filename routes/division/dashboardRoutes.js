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
