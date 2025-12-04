const express = require('express');
const router = express.Router();

const STAFF_STATUS_OPTIONS = new Set([
    'Active',
    'Transferred',
    'Retired',
    'Suspended',
    'Promoted to CLI',
    'Medically Decategorised',
    'Drafted/Ex-Cadre'
]);

// GET /api/division/offices - Get all offices
router.get('/offices', async (req, res) => {
    try {
        const { include_other } = req.query;
        const conn = await req.app.locals.pool.getConnection();

        // By default, exclude 'OTHER' office from the list
        // Only include it if include_other=true is passed
        let query = 'SELECT * FROM offices WHERE is_active = 1';
        if (include_other !== 'true') {
            query += " AND office_code != 'OTHER'";
        }
        query += ' ORDER BY office_name';

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
            SELECT s.*, o.office_name, d.designation_name, c.cli_name, n.nomination_id, n.nominated_from_date
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_master c ON s.current_cli_id = c.cli_id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
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
            designation_id,
            date_of_birth,
            gender,
            father_name,
            caste,
            marital_status,
            vision,
            blood_group,
            identification_mark_1,
            identification_mark_2,
            qualification,
            phone_number,
            cug_number,
            email,
            present_address,
            permanent_address,
            dept_rrb,
            reporting_date,
            id_card_no,
            status,
            pf_number,
            aadhar_card_no,
            pan_card_no,
            date_of_appointment,
            safety_category
        } = req.body;
        const staffStatus = (status && status.trim()) || 'Active';
        if (!STAFF_STATUS_OPTIONS.has(staffStatus)) {
            conn.release();
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Helper function: convert empty strings to NULL for ENUM fields
        const toNullIfEmpty = (val) => (val === '' || val === undefined) ? null : val;

        const [result] = await conn.query(
            `UPDATE div_staff_master
             SET name = ?, designation_id = ?, date_of_birth = ?, gender = ?, fathers_name = ?, caste = ?,
                 marital_status = ?, vision = ?, blood_group = ?,
                 identification_mark_1 = ?, identification_mark_2 = ?,
                 qualification = ?,
                 phone_number = ?, cug_number = ?, email = ?,
                 present_address = ?, permanent_address = ?, dept_rrb = ?,
                 id_card_no = ?, pf_number = ?, aadhar_card_no = ?, pan_card_no = ?,
                 reporting_date = ?, date_of_appointment = ?, safety_category = ?, status = ?,
                 updated_at = NOW()
             WHERE hrms_id = ?`,
            [
                name,
                designation_id,
                toNullIfEmpty(date_of_birth),
                toNullIfEmpty(gender),  // ENUM
                toNullIfEmpty(father_name),
                toNullIfEmpty(caste),  // ENUM
                toNullIfEmpty(marital_status),  // ENUM
                toNullIfEmpty(vision),  // ENUM
                toNullIfEmpty(blood_group),
                toNullIfEmpty(identification_mark_1),
                toNullIfEmpty(identification_mark_2),
                toNullIfEmpty(qualification),
                toNullIfEmpty(phone_number),
                toNullIfEmpty(cug_number),
                toNullIfEmpty(email),
                toNullIfEmpty(present_address),
                toNullIfEmpty(permanent_address),
                toNullIfEmpty(dept_rrb),
                toNullIfEmpty(id_card_no),
                toNullIfEmpty(pf_number),
                toNullIfEmpty(aadhar_card_no),
                toNullIfEmpty(pan_card_no),
                toNullIfEmpty(reporting_date),
                toNullIfEmpty(date_of_appointment),
                toNullIfEmpty(safety_category),  // ENUM
                staffStatus,
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

// POST /api/division/staff - Create new staff
router.post('/staff', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        const {
            hrms_id,
            name,
            current_cms_id,
            original_cms_id,
            date_of_birth,
            gender,
            father_name,
            caste,
            marital_status,
            vision,
            blood_group,
            identification_mark_1,
            identification_mark_2,
            qualification,
            phone_number,
            cug_number,
            email,
            present_address,
            permanent_address,
            dept_rrb,
            reporting_date,
            id_card_no,
            status,
            pf_number,
            aadhar_card_no,
            pan_card_no,
            date_of_appointment,
            designation_id,
            safety_category,
            current_office_code
        } = req.body;
        const staffStatus = (status && status.trim()) || 'Active';
        if (!STAFF_STATUS_OPTIONS.has(staffStatus)) {
            conn.release();
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Validation
        if (!hrms_id || !name || !current_cms_id) {
            conn.release();
            return res.status(400).json({
                error: 'Missing required fields: hrms_id, name, current_cms_id'
            });
        }

        // Check if HRMS ID already exists
        const [existingStaff] = await conn.query(
            'SELECT hrms_id FROM div_staff_master WHERE hrms_id = ?',
            [hrms_id.toUpperCase()]
        );

        if (existingStaff.length > 0) {
            conn.release();
            return res.status(409).json({
                error: 'Staff with this HRMS ID already exists'
            });
        }

        // Check if CMS ID already exists
        const [existingCmsId] = await conn.query(
            'SELECT hrms_id, name FROM div_staff_master WHERE current_cms_id = ? OR original_cms_id = ?',
            [current_cms_id.toUpperCase(), current_cms_id.toUpperCase()]
        );

        if (existingCmsId.length > 0) {
            conn.release();
            return res.status(409).json({
                error: `CMS ID ${current_cms_id.toUpperCase()} is already assigned to ${existingCmsId[0].name} (${existingCmsId[0].hrms_id})`
            });
        }

        // Determine office code
        // Office users can only add to their office, admins can specify
        let officeCode = current_office_code;
        if (userRole !== 'division_admin') {
            officeCode = userOffice;
        } else if (!officeCode) {
            officeCode = userOffice;
        }
        const hqStation = officeCode; // default HQ to current office for new staff

        // Convert empty strings to NULL for MySQL columns
        const cleanDate = (dateStr) => (dateStr && dateStr.trim() !== '') ? dateStr : null;
        const cleanField = (fieldStr) => (fieldStr && fieldStr.trim() !== '') ? fieldStr : null;

        // Insert new staff
        const [result] = await conn.query(
            `INSERT INTO div_staff_master
             (hrms_id, name, current_cms_id, original_cms_id, current_office_code, home_office_code,
              date_of_birth, gender, fathers_name, caste, marital_status, vision, blood_group,
              identification_mark_1, identification_mark_2,
              qualification,
              phone_number, cug_number, email, present_address, permanent_address, dept_rrb,
              reporting_date, hq_station,
              id_card_no, pf_number, aadhar_card_no, pan_card_no, date_of_appointment,
              designation_id, safety_category, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                hrms_id.toUpperCase(), name, current_cms_id.toUpperCase(), (original_cms_id || current_cms_id).toUpperCase(),
                officeCode, officeCode, // Set both current and home office
                cleanDate(date_of_birth), gender, father_name, caste, marital_status, vision, blood_group,
                identification_mark_1, identification_mark_2,
                qualification,
                phone_number, cug_number, email, present_address, permanent_address, dept_rrb,
                cleanDate(reporting_date), hqStation,
                id_card_no,
                cleanField(pf_number), aadhar_card_no, pan_card_no, cleanDate(date_of_appointment),
                designation_id, cleanField(safety_category), staffStatus
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'New staff created successfully',
            hrms_id: hrms_id
        });

    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/staff/check/:hrms_id - Check if HRMS ID exists
router.get('/staff/check/:hrms_id', async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            'SELECT hrms_id, name FROM div_staff_master WHERE hrms_id = ?',
            [hrms_id.toUpperCase()]
        );

        conn.release();

        res.json({
            success: true,
            exists: result.length > 0,
            staff: result.length > 0 ? result[0] : null
        });

    } catch (error) {
        console.error('Error checking HRMS ID:', error);
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
            AND s.status = 'Active'
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

// GET /api/division/pme-completed - Get PME completed this month
router.get('/pme-completed', async (req, res) => {
    try {
        const office_code = req.query.office_code;
        const userRole = req.session.user.div_role;
        const userOffice = req.session.user.div_office_code;
        const conn = await req.app.locals.pool.getConnection();

        // Get PMEs completed this month (month-to-date)
        // PME training_id = 1
        let query = `
            SELECT COUNT(DISTINCT tr.staff_hrms_id) as completed_pme
            FROM div_training_records tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            WHERE tr.training_id = 1
            AND tr.done_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND tr.done_date <= CURDATE()
            AND tr.done_date IS NOT NULL
            AND s.status = 'Active'
        `;

        const params = [];

        // Apply office filter
        if (userRole !== 'division_admin') {
            query += ' AND s.current_office_code = ?';
            params.push(userOffice);
        } else if (office_code) {
            query += ' AND s.current_office_code = ?';
            params.push(office_code);
        }

        const [result] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            count: result[0].completed_pme,
            isAdmin: userRole === 'division_admin'
        });

    } catch (error) {
        console.error('Error fetching PME completed:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/decategorized-crew - Get list of medically decategorized staff
router.get('/decategorized-crew', async (req, res) => {
    try {
        const { office_code } = req.query;
        const userRole = req.session.user.div_role;
        const userOffice = req.session.user.div_office_code;
        const conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_office_code,
                o.office_name,
                s.designation_id,
                d.designation_name,
                s.date_of_birth,
                s.phone_number,
                tr.decategorized_date,
                tr.decategorized_reason,
                tr.medical_remarks,
                tr.done_date as examination_date
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN (
                SELECT
                    staff_hrms_id,
                    decategorized_date,
                    decategorized_reason,
                    medical_remarks,
                    done_date,
                    ROW_NUMBER() OVER (PARTITION BY staff_hrms_id ORDER BY decategorized_date DESC, record_id DESC) as rn
                FROM div_training_records
                WHERE medical_fit = 0
                AND decategorized_date IS NOT NULL
            ) tr ON s.hrms_id = tr.staff_hrms_id AND tr.rn = 1
            WHERE s.status = 'Medically Decategorised'
        `;

        const params = [];

        // Office-based access control
        if (userRole !== 'division_admin') {
            query += ' AND s.current_office_code = ?';
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            query += ' AND s.current_office_code = ?';
            params.push(office_code);
        }

        query += ' ORDER BY s.name ASC';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching decategorized crew:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/staff/:hrms_id/pstore - Update personnel stores compliance date
router.put('/staff/:hrms_id/pstore', async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const { last_updated, remarks } = req.body;

        if (!last_updated) {
            return res.status(400).json({ error: 'Last updated date is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        // Get staff's current office for permission check
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

        // Check permissions: only same office or division_admin can update
        if (userRole !== 'division_admin' && staffOffice !== userOffice) {
            conn.release();
            return res.status(403).json({
                error: 'Access denied: You can only update staff from your office'
            });
        }

        // Calculate next due date (90 days from last updated)
        const lastUpdatedDate = new Date(last_updated);
        const nextDueDate = new Date(lastUpdatedDate);
        nextDueDate.setDate(nextDueDate.getDate() + 90);

        // Format dates for MySQL (YYYY-MM-DD)
        const nextDueDateStr = nextDueDate.toISOString().split('T')[0];

        // Update the personnel stores dates
        const [result] = await conn.query(
            `UPDATE div_staff_master
             SET pstore_last_updated = ?, pstore_next_due = ?, updated_at = NOW()
             WHERE hrms_id = ?`,
            [last_updated, nextDueDateStr, hrms_id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        res.json({
            success: true,
            message: 'Personnel stores compliance date updated successfully',
            next_due: nextDueDateStr
        });

    } catch (error) {
        console.error('Error updating P/Store date:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/pstore-updates-today - Get staff who updated P/Store today
router.get('/pstore-updates-today', async (req, res) => {
    try {
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;
        const conn = await req.app.locals.pool.getConnection();

        // Get staff who updated P/Store today
        let query = `
            SELECT hrms_id, name, pstore_last_updated, current_office_code
            FROM div_staff_master
            WHERE DATE(pstore_last_updated) = CURDATE()
        `;

        const params = [];

        // Filter by office for non-admin users
        if (userRole !== 'division_admin') {
            query += ' AND current_office_code = ?';
            params.push(userOffice);
        }

        query += ' ORDER BY name';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error('Error fetching P/Store updates:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
