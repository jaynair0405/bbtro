const express = require('express');
const router = express.Router();

// Middleware to get database connection
async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

// Middleware to check division access
const requireDivisionAccess = (req, res, next) => {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Helper to get user's office config
const getUserOffice = (req) => {
    const officeCode = req.session.user?.div_office_code;
    // Map office codes to training letter office codes
    if (officeCode === 'CSMT-SUB' || officeCode === 'CSMT-HQ') return 'CSMT-SUB';
    if (officeCode === 'PNVL-SUB') return 'PNVL-SUB';
    if (officeCode === 'KYN-SUB') return 'KYN-SUB';
    // For admins with no office code, default to CSMT-SUB
    if (!officeCode && req.session.user?.div_role === 'division_admin') return 'CSMT-SUB';
    return officeCode || 'CSMT-SUB';
};

// Check if user is admin (can switch offices)
const isAdmin = (req) => {
    return req.session.user?.div_role === 'division_admin';
};

// Course type configurations
const COURSE_CONFIG = {
    'ONE_DAY_INTENSIVE': {
        label: 'One Day Intensive',
        subject: 'ONE DAY INTENSIVE COURSE AT MTC CLA',
        bodyTemplate: (office, date) =>
            `The following Motorman working at ${office} Suburban Lobby are hereby directed to attend One Day Intensive Course at Motormen Training Centre, CLA on ${date} at 09:30 Hrs.`,
        requirements: 'Trainees Please carry Competency Book and G&SR with correction slips.',
        datePrefix: 'on',
        trainingId: 5  // AUTOMATIC
    },
    'REFRESHER': {
        label: 'Refresher Course',
        subject: 'REFRESHER COURSE AT MTC CLA',
        bodyTemplate: (office, date) =>
            `The following Motorman working at ${office} Suburban Lobby are hereby directed to attend Refresher Course at Motormen Training Centre, CLA from ${date} at 09:30 Hrs.`,
        requirements: 'Trainees Please carry Competency Book.',
        datePrefix: 'from',
        trainingId: 26  // MMPRC
    },
    'MEMU_INITIAL': {
        label: 'MEMU Initial',
        subject: 'MEMU INITIAL TRAINING AT MTC CLA',
        bodyTemplate: (office, date) =>
            `The following Motorman working at ${office} Suburban Lobby are hereby directed to attend MEMU Initial Training at Motormen Training Centre, CLA from ${date} at 09:30 Hrs.`,
        requirements: 'Trainees Please carry Competency Book.',
        datePrefix: 'from',
        trainingId: 17  // MEMU
    },
    'MEMU_REFRESHER': {
        label: 'MEMU Refresher',
        subject: 'MEMU REFRESHER TRAINING AT MTC CLA',
        bodyTemplate: (office, date) =>
            `The following Motorman working at ${office} Suburban Lobby are hereby directed to attend MEMU Refresher Training at Motormen Training Centre, CLA from ${date} at 09:30 Hrs.`,
        requirements: 'Trainees Please carry Competency Book.',
        datePrefix: 'from',
        trainingId: 17  // MEMU (same as initial)
    },
    'OTHERS': {
        label: 'Others',
        subject: '',  // User fills custom subject
        bodyTemplate: (office, date, customSubject) =>
            `The following Motorman working at ${office} Suburban Lobby are hereby directed to attend ${customSubject || 'Training'} at Motormen Training Centre, CLA from ${date} at 09:30 Hrs.`,
        requirements: 'Trainees Please carry Competency Book.',
        datePrefix: 'from',
        trainingId: null  // No training record tracking - letter history only
    }
};

// Office configurations
const OFFICE_CONFIG = {
    'CSMT-SUB': {
        label: 'CSMT Suburban',
        letterNoPrefix: 'SR CC/SUB/CSMT',
        signingDesignation: 'Sr. Crew Controller (Sub)',
        signingDesignationHindi: 'वरिष्ठ कर्मीदल नियंत्रक (उपनगरीय)',
        signingPlace: 'Suburban CSMT',
        ccText: 'Copy: ADEE (Sub) TRS/O, CSMT',
        officeHeader: 'SR. CREW CONTROLLER OFFICE\nSUBURBAN CSMT'
    },
    'PNVL-SUB': {
        label: 'Panvel Suburban',
        letterNoPrefix: 'Sr CC/SUB/PNVL',
        signingDesignation: 'Sr. Crew Controller (Sub)',
        signingDesignationHindi: 'वरिष्ठ कर्मीदल नियंत्रक (उपनगरीय)',
        signingPlace: 'Suburban PNVL',
        ccText: 'Copy: ADEE (Sub) TRS/O, PNVL',
        officeHeader: 'SR. CREW CONTROLLER OFFICE\nSUBURBAN PANVEL'
    },
    'KYN-SUB': {
        label: 'Kalyan Suburban',
        letterNoPrefix: 'Sr CC/SUB/KYN',
        signingDesignation: 'Sr. Crew Controller (Sub)',
        signingDesignationHindi: 'वरिष्ठ कर्मीदल नियंत्रक (उपनगरीय)',
        signingPlace: 'Suburban KYN',
        ccText: 'Copy: ADEE (Sub) TRS/O, KYN',
        officeHeader: 'SR. CREW CONTROLLER OFFICE\nSUBURBAN KALYAN'
    }
};

// GET /api/division/training-letters/config - Get user session + course/office configurations
router.get('/config', requireDivisionAccess, (req, res) => {
    const userOffice = getUserOffice(req);
    const userIsAdmin = isAdmin(req);

    res.json({
        user: {
            username: req.session.user.username,
            fullName: req.session.user.full_name,
            officeCode: userOffice,
            isAdmin: userIsAdmin,
            canSwitchOffice: userIsAdmin
        },
        courses: Object.entries(COURSE_CONFIG).map(([code, config]) => ({
            code,
            label: config.label,
            subject: config.subject,
            requirements: config.requirements,
            datePrefix: config.datePrefix
        })),
        offices: Object.entries(OFFICE_CONFIG).map(([code, config]) => ({
            code,
            label: config.label,
            letterNoPrefix: config.letterNoPrefix,
            signingDesignation: config.signingDesignation,
            signingPlace: config.signingPlace,
            officeHeader: config.officeHeader,
            signingDesignationHindi: config.signingDesignationHindi,
            ccText: config.ccText
        }))
    });
});

// GET /api/division/training-letters/next-number - Get next letter number for office
router.get('/next-number', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const officeCode = req.query.office_code || getUserOffice(req);
        const year = new Date().getFullYear();

        // Get last letter number for this office and year
        const [[lastLetter]] = await conn.query(`
            SELECT letter_no FROM div_training_letters
            WHERE office_code = ? AND YEAR(letter_date) = ?
            ORDER BY id DESC LIMIT 1
        `, [officeCode, year]);

        let nextNum = 1;
        if (lastLetter && lastLetter.letter_no) {
            // Extract number from letter_no like "SR CC/SUB/PNVL/2026/15"
            const match = lastLetter.letter_no.match(/\/(\d+)$/);
            if (match) {
                nextNum = parseInt(match[1]) + 1;
            }
        }

        const officeConfig = OFFICE_CONFIG[officeCode];
        const letterNo = `${officeConfig?.letterNoPrefix || 'SR CC/SUB'}/${year}/${String(nextNum).padStart(2, '0')}`;

        res.json({ letterNo, nextNum });
    } catch (error) {
        console.error('Error getting next letter number:', error);
        res.status(500).json({ error: 'Failed to get letter number' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters/training-due - Get motormen due for training
router.get('/training-due', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const officeCode = req.query.office_code || getUserOffice(req);
        const courseType = req.query.course_type || 'REFRESHER';

        // Get training_id for this course type
        const courseConfig = COURSE_CONFIG[courseType];
        if (!courseConfig) {
            return res.json({ data: [] });
        }
        const trainingId = courseConfig.trainingId;

        // Map office to depot codes (staff current_office_code values)
        const depotMap = {
            'CSMT-SUB': ['CSMT-SUB'],
            'PNVL-SUB': ['PNVL-SUB'],
            'KYN-SUB': ['KYN-SUB']
        };
        const depots = depotMap[officeCode] || [officeCode];

        if (depots.length === 0) {
            return res.json({ data: [] });
        }

        // Get motormen due for training (last training > 1 year ago or never trained)
        // Uses div_training_records table with proper training_id
        const [staff] = await conn.query(`
            SELECT
                sm.hrms_id,
                sm.name,
                sm.current_cms_id,
                sm.pf_number,
                d.designation_name,
                sm.current_office_code,
                tr.last_training_date,
                DATEDIFF(CURDATE(), tr.last_training_date) AS days_since_training
            FROM div_staff_master sm
            LEFT JOIN designations d ON d.id = sm.designation_id
            LEFT JOIN (
                SELECT staff_hrms_id, MAX(done_date) AS last_training_date
                FROM div_training_records
                WHERE training_id = ?
                GROUP BY staff_hrms_id
            ) tr ON tr.staff_hrms_id = sm.hrms_id
            WHERE sm.status = 'Active'
              AND sm.designation_id = 8
              AND sm.current_office_code IN (${depots.map(() => '?').join(',')})
              AND (tr.last_training_date IS NULL OR tr.last_training_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR))
            ORDER BY tr.last_training_date ASC, sm.name
            LIMIT 50
        `, [trainingId, ...depots]);

        res.json({ data: staff });
    } catch (error) {
        console.error('Error getting training due list:', error);
        res.status(500).json({ error: 'Failed to get training due list' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters/check-duplicate - Check if staff was recently sent
router.get('/check-duplicate', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { hrms_id, course_type } = req.query;

        if (!hrms_id) {
            return res.json({ isDuplicate: false });
        }

        // Check if sent in last 30 days
        const [[recent]] = await conn.query(`
            SELECT tl.letter_date, tl.course_type
            FROM div_training_letter_staff tls
            JOIN div_training_letters tl ON tl.id = tls.letter_id
            WHERE tls.staff_hrms_id = ?
              AND tl.course_type = ?
              AND tl.letter_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY tl.letter_date DESC
            LIMIT 1
        `, [hrms_id, course_type || 'REFRESHER']);

        if (recent) {
            const daysAgo = Math.floor((Date.now() - new Date(recent.letter_date).getTime()) / (1000 * 60 * 60 * 24));
            res.json({
                isDuplicate: true,
                lastSent: recent.letter_date,
                daysAgo,
                message: `Sent ${daysAgo} days ago for ${COURSE_CONFIG[recent.course_type]?.label || recent.course_type}`
            });
        } else {
            res.json({ isDuplicate: false });
        }
    } catch (error) {
        console.error('Error checking duplicate:', error);
        res.status(500).json({ error: 'Failed to check duplicate' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters/recent-staff - Get recently added staff for quick re-add
router.get('/recent-staff', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const officeCode = req.query.office_code || getUserOffice(req);

        // Get staff from recent letters (last 7 days)
        const [staff] = await conn.query(`
            SELECT DISTINCT
                sm.hrms_id,
                sm.name,
                sm.current_cms_id,
                sm.pf_number,
                d.designation_name,
                sm.current_office_code,
                MAX(tl.letter_date) AS last_letter_date
            FROM div_training_letter_staff tls
            JOIN div_training_letters tl ON tl.id = tls.letter_id
            JOIN div_staff_master sm ON sm.hrms_id = tls.staff_hrms_id
            LEFT JOIN designations d ON d.id = sm.designation_id
            WHERE tl.office_code = ?
              AND tl.letter_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY sm.hrms_id, sm.name, sm.current_cms_id, sm.pf_number, d.designation_name, sm.current_office_code
            ORDER BY last_letter_date DESC
            LIMIT 20
        `, [officeCode]);

        res.json({ data: staff });
    } catch (error) {
        console.error('Error getting recent staff:', error);
        res.status(500).json({ error: 'Failed to get recent staff' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters - List all training letters
router.get('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { office_code, course_type, limit = 50 } = req.query;

        let query = `
            SELECT
                tl.*,
                (SELECT GROUP_CONCAT(sm.name ORDER BY tls.sr_no SEPARATOR ', ')
                 FROM div_training_letter_staff tls
                 JOIN div_staff_master sm ON sm.hrms_id = tls.staff_hrms_id
                 WHERE tls.letter_id = tl.id
                 LIMIT 3) AS first_staff_names
            FROM div_training_letters tl
            WHERE 1=1
        `;
        const params = [];

        if (office_code) {
            query += ` AND tl.office_code = ?`;
            params.push(office_code);
        }
        if (course_type) {
            query += ` AND tl.course_type = ?`;
            params.push(course_type);
        }

        query += ` ORDER BY tl.letter_date DESC, tl.id DESC LIMIT ?`;
        params.push(parseInt(limit));

        const [letters] = await conn.query(query, params);

        res.json({ data: letters });
    } catch (error) {
        console.error('Error fetching training letters:', error);
        res.status(500).json({ error: 'Failed to fetch training letters' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters/:id - Get single letter with staff
router.get('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { id } = req.params;

        // Get letter details
        const [[letter]] = await conn.query(
            `SELECT * FROM div_training_letters WHERE id = ?`,
            [id]
        );

        if (!letter) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Get staff list
        const [staff] = await conn.query(`
            SELECT
                tls.id,
                tls.sr_no,
                tls.staff_hrms_id,
                tls.remarks,
                sm.name AS staff_name,
                sm.current_cms_id,
                sm.hrms_id,
                sm.pf_number,
                d.designation_name,
                sm.current_office_code AS depot
            FROM div_training_letter_staff tls
            JOIN div_staff_master sm ON sm.hrms_id = tls.staff_hrms_id
            LEFT JOIN designations d ON d.id = sm.designation_id
            WHERE tls.letter_id = ?
            ORDER BY tls.sr_no
        `, [id]);

        res.json({
            data: {
                letter,
                staff
            }
        });
    } catch (error) {
        console.error('Error fetching training letter:', error);
        res.status(500).json({ error: 'Failed to fetch training letter' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/training-letters/search-staff - Search motormen for adding
router.get('/search-staff/:query', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { query } = req.params;
        const { office_code } = req.query;

        if (!query || query.length < 2) {
            return res.json({ data: [] });
        }

        // Map office_code to depot codes
        const depotMap = {
            'CSMT-SUB': ['CSMT-SUB'],
            'PNVL-SUB': ['PNVL-SUB'],
            'KYN-SUB': ['KYN-SUB']
        };

        let depotFilter = '';
        const params = [];
        const searchTerm = `%${query}%`;

        // Add search terms
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);

        if (office_code && depotMap[office_code]) {
            const depots = depotMap[office_code];
            depotFilter = ` AND sm.current_office_code IN (${depots.map(() => '?').join(',')})`;
            params.push(...depots);
        }

        // Only search motormen (designation_id = 8)
        const [staff] = await conn.query(`
            SELECT
                sm.hrms_id,
                sm.name,
                sm.current_cms_id,
                sm.pf_number,
                d.designation_name,
                sm.current_office_code
            FROM div_staff_master sm
            LEFT JOIN designations d ON d.id = sm.designation_id
            WHERE sm.status = 'Active'
              AND sm.designation_id = 8
              AND (
                  sm.name LIKE ?
                  OR sm.current_cms_id LIKE ?
                  OR sm.hrms_id LIKE ?
                  OR sm.pf_number LIKE ?
              )
              ${depotFilter}
            ORDER BY sm.name
            LIMIT 20
        `, params);

        res.json({ data: staff });
    } catch (error) {
        console.error('Error searching staff:', error);
        res.status(500).json({ error: 'Failed to search staff' });
    } finally {
        if (conn) conn.release();
    }
});

// POST /api/division/training-letters - Create/Update training letter
router.post('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const {
            letter_id,
            letter_no,
            letter_date,
            office_code,
            course_type,
            custom_subject,  // For OTHERS type
            training_date,
            report_time,
            addressee_name,
            addressee_office,
            subject_text,
            body_text,
            requirements_text,
            footer_text,
            signing_designation,
            signing_designation_hindi,
            signing_place,
            cc_text,
            staff // Array of { staff_hrms_id, remarks }
        } = req.body;

        if (!letter_date || !office_code || !course_type || !training_date || !staff || staff.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await conn.beginTransaction();

        let letterId;

        if (letter_id) {
            // Update existing letter
            const [[existingLetter]] = await conn.query(
                `SELECT id FROM div_training_letters WHERE id = ?`,
                [letter_id]
            );

            if (!existingLetter) {
                await conn.rollback();
                return res.status(404).json({ error: 'Letter not found' });
            }

            letterId = letter_id;
            await conn.query(`
                UPDATE div_training_letters SET
                    letter_no = ?,
                    letter_date = ?,
                    office_code = ?,
                    course_type = ?,
                    custom_subject = ?,
                    training_date = ?,
                    report_time = ?,
                    addressee_name = ?,
                    addressee_office = ?,
                    subject_text = ?,
                    body_text = ?,
                    requirements_text = ?,
                    footer_text = ?,
                    signing_designation = ?,
                    signing_designation_hindi = ?,
                    signing_place = ?,
                    cc_text = ?,
                    total_staff = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [
                letter_no, letter_date, office_code, course_type, custom_subject,
                training_date, report_time || '09:30:00', addressee_name, addressee_office,
                subject_text, body_text, requirements_text, footer_text,
                signing_designation, signing_designation_hindi, signing_place,
                cc_text, staff.length, letterId
            ]);

            // Delete old staff entries
            await conn.query(`DELETE FROM div_training_letter_staff WHERE letter_id = ?`, [letterId]);
        } else {
            // Check for existing letter with same date, office, course
            const [[existing]] = await conn.query(`
                SELECT id FROM div_training_letters
                WHERE letter_date = ? AND office_code = ? AND course_type = ?
            `, [letter_date, office_code, course_type]);

            if (existing) {
                // Update existing
                letterId = existing.id;
                await conn.query(`
                    UPDATE div_training_letters SET
                        letter_no = ?,
                        custom_subject = ?,
                        training_date = ?,
                        report_time = ?,
                        addressee_name = ?,
                        addressee_office = ?,
                        subject_text = ?,
                        body_text = ?,
                        requirements_text = ?,
                        footer_text = ?,
                        signing_designation = ?,
                        signing_designation_hindi = ?,
                        signing_place = ?,
                        cc_text = ?,
                        total_staff = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `, [
                    letter_no, custom_subject, training_date, report_time || '09:30:00',
                    addressee_name, addressee_office, subject_text, body_text,
                    requirements_text, footer_text, signing_designation,
                    signing_designation_hindi, signing_place, cc_text,
                    staff.length, letterId
                ]);

                // Delete old staff entries
                await conn.query(`DELETE FROM div_training_letter_staff WHERE letter_id = ?`, [letterId]);
            } else {
                // Insert new letter
                const [result] = await conn.query(`
                    INSERT INTO div_training_letters (
                        letter_no, letter_date, office_code, course_type, custom_subject,
                        training_date, report_time, addressee_name, addressee_office,
                        subject_text, body_text, requirements_text, footer_text,
                        signing_designation, signing_designation_hindi, signing_place,
                        cc_text, total_staff, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    letter_no, letter_date, office_code, course_type, custom_subject,
                    training_date, report_time || '09:30:00', addressee_name, addressee_office,
                    subject_text, body_text, requirements_text, footer_text,
                    signing_designation, signing_designation_hindi, signing_place,
                    cc_text, staff.length, req.session?.user?.username || 'system'
                ]);
                letterId = result.insertId;
            }
        }

        // Insert staff entries
        for (let i = 0; i < staff.length; i++) {
            await conn.query(`
                INSERT INTO div_training_letter_staff (letter_id, staff_hrms_id, sr_no, remarks)
                VALUES (?, ?, ?, ?)
            `, [letterId, staff[i].staff_hrms_id, i + 1, staff[i].remarks || null]);
        }

        await conn.commit();

        res.json({
            success: true,
            message: `Training letter saved with ${staff.length} staff`,
            letter_id: letterId
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error saving training letter:', error);
        res.status(500).json({ error: 'Failed to save training letter: ' + error.message });
    } finally {
        if (conn) conn.release();
    }
});

// DELETE /api/division/training-letters/:id - Delete a training letter
router.delete('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { id } = req.params;

        const [result] = await conn.query(
            `DELETE FROM div_training_letters WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        res.json({ success: true, message: 'Letter deleted' });
    } catch (error) {
        console.error('Error deleting training letter:', error);
        res.status(500).json({ error: 'Failed to delete training letter' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
