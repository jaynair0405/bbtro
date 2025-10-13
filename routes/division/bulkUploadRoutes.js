const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

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

// Parse Indian date format DD/MM/YYYY to MySQL format YYYY-MM-DD
function parseIndianDate(value) {
    if (!value) return null;

    // Handle Excel date serial number
    if (typeof value === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Handle DD/MM/YYYY string
    if (typeof value === 'string') {
        const trimmed = value.trim();
        const parts = trimmed.split('/');

        if (parts.length === 3) {
            const dd = parts[0].padStart(2, '0');
            const mm = parts[1].padStart(2, '0');
            const yyyy = parts[2];

            // Validate date
            const date = new Date(`${yyyy}-${mm}-${dd}`);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date: ${value}`);
            }

            return `${yyyy}-${mm}-${dd}`;
        }
    }

    throw new Error(`Invalid date format: ${value}. Expected DD/MM/YYYY`);
}

// ENUM validation values
const ENUM_VALUES = {
    caste: ['GEN', 'OBC', 'SC', 'ST'],
    vision: ['Normal', 'NV', 'DV', 'Both'],
    gender: ['Male', 'Female', 'Other'],
    marital_status: ['Married', 'Unmarried'],
    safety_category: ['A', 'B', 'C'],
    assignment_status: ['permanent', 'officiating', 'transferred'],
    status: ['Active', 'Transferred', 'Retired', 'Suspended', 'Promoted to CLI', 'Medically Decategorised'],
    punishment_severity: ['Minor', 'Major', 'Severe'],
    training_status: ['Completed', 'Pending', 'Overdue'],
    personnel_store_status: ['Issued', 'Returned'],
    transfer_status: ['Pending', 'Approved', 'Rejected']
};

// Validate ENUM field
function validateEnum(field, value, enumName) {
    if (!value) return true; // NULL allowed for optional fields
    const allowedValues = ENUM_VALUES[enumName];
    if (!allowedValues || !allowedValues.includes(value)) {
        return false;
    }
    return true;
}

// POST /api/division/bulk-upload - Bulk upload staff biodata
router.post('/', requireDivisionAdmin, upload.single('file'), async (req, res) => {
    let filePath = null;
    let conn = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext !== '.xlsx' && ext !== '.xls') {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Only Excel files (.xlsx, .xls) are supported'
            });
        }

        console.log('📂 Processing bulk upload:', req.file.originalname);

        // Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;

        console.log('📋 Found sheets:', sheetNames.join(', '));

        // Get database connection
        conn = await req.app.locals.pool.getConnection();

        // Summary object
        const summary = {
            staff_master: { inserted: 0, updated: 0, errors: 0 },
            training_records: { inserted: 0, skipped: 0 },
            personnel_stores: { inserted: 0, skipped: 0 },
            awards: { inserted: 0, skipped: 0 },
            punishments: { inserted: 0, skipped: 0 },
            transfer_requests: { inserted: 0, skipped: 0 }
        };

        const validationErrors = [];
        const warnings = [];

        // Process STAFF_MASTER (mandatory)
        const staffMasterSheet = sheetNames.find(name =>
            name.toUpperCase() === 'STAFF_MASTER' || name.toUpperCase() === 'STAFF MASTER'
        );

        if (!staffMasterSheet) {
            fs.unlinkSync(filePath);
            conn.release();
            return res.status(400).json({
                success: false,
                message: 'STAFF_MASTER sheet is required but not found'
            });
        }

        console.log('📊 Processing STAFF_MASTER sheet...');
        const staffData = xlsx.utils.sheet_to_json(workbook.Sheets[staffMasterSheet]);
        console.log(`   Found ${staffData.length} staff records`);

        // Build HRMS ID lookup map for other sheets
        const hrmsIdMap = new Set();

        // Process each staff record
        for (let i = 0; i < staffData.length; i++) {
            const row = staffData[i];
            const rowNum = i + 2; // Excel row number (header is row 1)

            try {
                // Required fields
                const hrms_id = row.hrms_id || row.HRMS_ID || row['HRMS ID'];
                const name = row.name || row.Name || row.NAME;

                if (!hrms_id || !name) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        error: 'Missing required fields: hrms_id and name are mandatory'
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                // Validate ENUM fields
                const caste = row.caste;
                const vision = row.vision;
                const gender = row.gender;
                const marital_status = row.marital_status;
                const safety_category = row.safety_category;
                const assignment_status = row.assignment_status || 'permanent';
                const status = row.status || 'Active';

                if (caste && !validateEnum('caste', caste, 'caste')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'caste',
                        value: caste,
                        error: `Invalid caste. Must be one of: ${ENUM_VALUES.caste.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (vision && !validateEnum('vision', vision, 'vision')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'vision',
                        value: vision,
                        error: `Invalid vision. Must be one of: ${ENUM_VALUES.vision.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (gender && !validateEnum('gender', gender, 'gender')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'gender',
                        value: gender,
                        error: `Invalid gender. Must be one of: ${ENUM_VALUES.gender.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (marital_status && !validateEnum('marital_status', marital_status, 'marital_status')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'marital_status',
                        value: marital_status,
                        error: `Invalid marital_status. Must be one of: ${ENUM_VALUES.marital_status.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (safety_category && !validateEnum('safety_category', safety_category, 'safety_category')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'safety_category',
                        value: safety_category,
                        error: `Invalid safety_category. Must be one of: ${ENUM_VALUES.safety_category.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (!validateEnum('assignment_status', assignment_status, 'assignment_status')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'assignment_status',
                        value: assignment_status,
                        error: `Invalid assignment_status. Must be one of: ${ENUM_VALUES.assignment_status.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                if (!validateEnum('status', status, 'status')) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        field: 'status',
                        value: status,
                        error: `Invalid status. Must be one of: ${ENUM_VALUES.status.join(', ')}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                // Parse dates
                let date_of_birth = null;
                let date_of_appointment = null;
                let reporting_date = null;
                let current_assignment_start_date = null;

                try {
                    date_of_birth = parseIndianDate(row.date_of_birth);
                    date_of_appointment = parseIndianDate(row.date_of_appointment);
                    reporting_date = parseIndianDate(row.reporting_date);
                    current_assignment_start_date = parseIndianDate(row.current_assignment_start_date);
                } catch (dateError) {
                    validationErrors.push({
                        sheet: 'STAFF_MASTER',
                        row: rowNum,
                        error: `Date parsing error: ${dateError.message}`
                    });
                    summary.staff_master.errors++;
                    continue;
                }

                // Insert/Update staff record
                const [result] = await conn.execute(
                    `INSERT INTO div_staff_master (
                        hrms_id, original_cms_id, current_cms_id, current_office_code, home_office_code,
                        designation_id, current_cli_id, name, pf_number, date_of_birth,
                        date_of_appointment, reporting_date, hq_station, dept_rrb, present_address,
                        permanent_address, cug_number, phone_number, fathers_name, qualification,
                        caste, email, pan_card_no, vision, gender, aadhar_card_no,
                        marital_status, identification_mark_1, identification_mark_2, blood_group,
                        id_card_no, safety_category, assignment_status, current_assignment_start_date, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        original_cms_id = VALUES(original_cms_id),
                        current_cms_id = VALUES(current_cms_id),
                        current_office_code = VALUES(current_office_code),
                        home_office_code = VALUES(home_office_code),
                        designation_id = VALUES(designation_id),
                        current_cli_id = VALUES(current_cli_id),
                        name = VALUES(name),
                        pf_number = VALUES(pf_number),
                        date_of_birth = VALUES(date_of_birth),
                        date_of_appointment = VALUES(date_of_appointment),
                        reporting_date = VALUES(reporting_date),
                        hq_station = VALUES(hq_station),
                        dept_rrb = VALUES(dept_rrb),
                        present_address = VALUES(present_address),
                        permanent_address = VALUES(permanent_address),
                        cug_number = VALUES(cug_number),
                        phone_number = VALUES(phone_number),
                        fathers_name = VALUES(fathers_name),
                        qualification = VALUES(qualification),
                        caste = VALUES(caste),
                        email = VALUES(email),
                        pan_card_no = VALUES(pan_card_no),
                        vision = VALUES(vision),
                        gender = VALUES(gender),
                        aadhar_card_no = VALUES(aadhar_card_no),
                        marital_status = VALUES(marital_status),
                        identification_mark_1 = VALUES(identification_mark_1),
                        identification_mark_2 = VALUES(identification_mark_2),
                        blood_group = VALUES(blood_group),
                        id_card_no = VALUES(id_card_no),
                        safety_category = VALUES(safety_category),
                        assignment_status = VALUES(assignment_status),
                        current_assignment_start_date = VALUES(current_assignment_start_date),
                        status = VALUES(status),
                        updated_at = CURRENT_TIMESTAMP`,
                    [
                        hrms_id,
                        row.original_cms_id || null,
                        row.current_cms_id || null,
                        row.current_office_code || null,
                        row.home_office_code || row.current_office_code || null,
                        row.designation_id || null,
                        row.current_cli_id || null,
                        name,
                        row.pf_number || null,
                        date_of_birth,
                        date_of_appointment,
                        reporting_date,
                        row.hq_station || null,
                        row.dept_rrb || null,
                        row.present_address || null,
                        row.permanent_address || null,
                        row.cug_number || null,
                        row.phone_number || null,
                        row.fathers_name || null,
                        row.qualification || null,
                        caste || null,
                        row.email || null,
                        row.pan_card_no || null,
                        vision || null,
                        gender || null,
                        row.aadhar_card_no || null,
                        marital_status || null,
                        row.identification_mark_1 || null,
                        row.identification_mark_2 || null,
                        row.blood_group || null,
                        row.id_card_no || null,
                        safety_category || null,
                        assignment_status,
                        current_assignment_start_date,
                        status
                    ]
                );

                if (result.affectedRows === 1) {
                    summary.staff_master.inserted++;
                } else if (result.affectedRows === 2) {
                    summary.staff_master.updated++;
                }

                // Add to lookup map
                hrmsIdMap.add(hrms_id);

            } catch (error) {
                console.error(`Error processing row ${rowNum}:`, error.message);
                validationErrors.push({
                    sheet: 'STAFF_MASTER',
                    row: rowNum,
                    error: error.message
                });
                summary.staff_master.errors++;
            }
        }

        // Process TRAINING_RECORDS (optional)
        const trainingSheet = sheetNames.find(name =>
            name.toUpperCase() === 'TRAINING_RECORDS' || name.toUpperCase() === 'TRAINING RECORDS'
        );

        if (trainingSheet) {
            console.log('📊 Processing TRAINING_RECORDS sheet...');
            const trainingData = xlsx.utils.sheet_to_json(workbook.Sheets[trainingSheet]);
            console.log(`   Found ${trainingData.length} training records`);

            for (let i = 0; i < trainingData.length; i++) {
                const row = trainingData[i];
                const rowNum = i + 2;

                try {
                    const hrms_id = row.hrms_id;
                    const training_id = row.training_id;

                    if (!hrms_id || !training_id) {
                        summary.training_records.skipped++;
                        continue;
                    }

                    // Validate hrms_id exists
                    if (!hrmsIdMap.has(hrms_id)) {
                        warnings.push(`TRAINING_RECORDS row ${rowNum}: HRMS ID ${hrms_id} not found in STAFF_MASTER`);
                        summary.training_records.skipped++;
                        continue;
                    }

                    const due_date = parseIndianDate(row.due_date);
                    const completion_date = parseIndianDate(row.completion_date);
                    const status = row.status || 'Pending';

                    await conn.execute(
                        `INSERT INTO div_training_records (hrms_id, training_id, due_date, completion_date, status, remarks)
                         VALUES (?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE
                         due_date = VALUES(due_date),
                         completion_date = VALUES(completion_date),
                         status = VALUES(status),
                         remarks = VALUES(remarks)`,
                        [hrms_id, training_id, due_date, completion_date, status, row.remarks || null]
                    );

                    summary.training_records.inserted++;

                } catch (error) {
                    console.error(`Error in TRAINING_RECORDS row ${rowNum}:`, error.message);
                    summary.training_records.skipped++;
                }
            }
        }

        // Cleanup uploaded file
        fs.unlinkSync(filePath);
        conn.release();

        // Return comprehensive response
        const response = {
            success: true,
            message: 'Bulk upload completed',
            summary: summary,
            validationErrors: validationErrors,
            warnings: warnings
        };

        console.log('✅ Bulk upload completed:', JSON.stringify(summary, null, 2));

        return res.json(response);

    } catch (error) {
        console.error('❌ Bulk upload failed:', error);

        // Cleanup
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        if (conn) {
            conn.release();
        }

        return res.status(500).json({
            success: false,
            message: 'Bulk upload failed',
            error: error.message
        });
    }
});

module.exports = router;
