const express = require('express');
const router = express.Router();
console.log('*** trainingRoutes.js loaded ***');

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Special office access rules - for sister lobbies etc.
const OFFICE_ACCESS_RULES = {
    'VVH': {
        accessOffice: 'CSMT-ML',
        allowedDesignations: [3, 4]
    },
    'VVH-ML': {
        accessOffice: 'CSMT-ML',
        allowedDesignations: [3, 4]
    }
};

// Offices that identify their staff by CMS ID prefix
const CMS_PREFIX_OFFICES = {
    'VVH': 'VVH',
    'VVH-ML': 'VVH'
};

// Helper to build office filter condition for queries
function buildOfficeFilter(officeCode, tableAlias = 's') {
    const cmsPrefix = CMS_PREFIX_OFFICES[officeCode];
    if (cmsPrefix) {
        return {
            condition: `${tableAlias}.current_cms_id LIKE ?`,
            params: [`${cmsPrefix}%`]
        };
    }
    return {
        condition: `${tableAlias}.current_office_code = ?`,
        params: [officeCode]
    };
}

// Check if user can access staff based on office rules
function canAccessStaff(userOffice, userRole, staffOffice, staffDesignationId) {
    if (userRole === 'division_admin') return true;
    if (userOffice === staffOffice) return true;
    const accessRule = OFFICE_ACCESS_RULES[userOffice];
    if (accessRule && staffOffice === accessRule.accessOffice) {
        if (accessRule.allowedDesignations.includes(parseInt(staffDesignationId))) {
            return true;
        }
    }
    return false;
}

// ============================================
// SPECIFIC ROUTES (must come before parameterized routes)
// ============================================

// GET /api/division/training/due-report - Get training due/overdue report with filters
router.get('/due-report', requireAuth, async (req, res) => {
    let conn;
    try {
        const {
            training_id,
            office_code,
            from_date,
            to_date
        } = req.query;

        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        conn = await req.app.locals.pool.getConnection();

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

        // Office-based access control using CMS prefix for VVH offices
        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            commonFilters += ' AND ' + filter.condition;
            commonParams.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            commonFilters += ' AND ' + filter.condition;
            commonParams.push(...filter.params);
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
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/training/matrix - Get training compliance matrix for special trainings
router.get('/matrix', requireAuth, async (req, res) => {
    try {
        const { search, designation_id, designation_ids, cli_id, office, trainings } = req.query;
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        // Check for special office access rules (for designation restrictions)
        const accessRule = OFFICE_ACCESS_RULES[userOffice];
        let restrictedDesignations = null;
        if (accessRule) {
            restrictedDesignations = accessRule.allowedDesignations;
        }

        const trainingKeys = trainings ? trainings.split(',') : [];

        // Map training keys to IDs
        // Keep this map in sync with the training columns shown on the matrix page
        const trainingKeyToId = {
            'KAVACH': 4,
            'WAG12': 10,
            'NEGHAT_UP': 22,
            'NEGHAT_DN': 23,
            'SEGHAT_UP': 24,
            'SEGHAT_DN': 25,
            'SPIC': 11,
            'VANDE_T18': 16,
            'PUSHPULL': 18,
            'MEMU': 17,
            'AC_DC': 9,
            'WDS6': 21,
            'HS_SPART': 12,
            'HSTAT': 19,
            'DSLAC_SIM': 14,
            'WDG4G_6G': 15,
            'PSYCHO': 20
        };

        const conn = await req.app.locals.pool.getConnection();

        try {
            let staffQuery = `
                SELECT s.hrms_id, s.name, d.designation_name as designation,
                       c.cli_name, o.office_name as office, s.designation_id
                FROM div_staff_master s
                LEFT JOIN designations d ON s.designation_id = d.id
                LEFT JOIN div_cli_master c ON s.current_cli_id = c.cli_id
                LEFT JOIN offices o ON s.current_office_code = o.office_code
                WHERE s.status = 'Active'
            `;
            const params = [];

            // Apply office filter using CMS prefix for VVH offices
            if (userRole !== 'division_admin' && userOffice) {
                const filter = buildOfficeFilter(userOffice, 's');
                staffQuery += ' AND ' + filter.condition;
                params.push(...filter.params);
            }
            if (search) {
                staffQuery += ' AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            // Handle single or multiple designation IDs
            let desIds = designation_ids ? designation_ids.split(',').filter(id => id && id !== 'undefined') :
                          (designation_id ? [designation_id] : []);

            // Apply restricted designations from access rules (if any)
            if (restrictedDesignations && restrictedDesignations.length > 0) {
                if (desIds.length > 0) {
                    // Intersect user selection with allowed designations
                    desIds = desIds.filter(id => restrictedDesignations.includes(parseInt(id)));
                }
                // If no selection OR intersection resulted in empty, use restricted list
                if (desIds.length === 0) {
                    desIds = restrictedDesignations.map(String);
                }
            }

            if (desIds.length > 0) {
                const placeholders = desIds.map(() => '?').join(',');
                staffQuery += ` AND s.designation_id IN (${placeholders})`;
                params.push(...desIds);
            }
            if (cli_id) {
                staffQuery += ' AND s.current_cli_id = ?';
                params.push(cli_id);
            }
            if (office) {
                const officeFilter = buildOfficeFilter(office, 's');
                staffQuery += ' AND ' + officeFilter.condition;
                params.push(...officeFilter.params);
            }

            staffQuery += ' ORDER BY s.name LIMIT 500';
            const [staffRows] = await conn.query(staffQuery, params);

            let matrix = {};
            const hrmsIds = staffRows.map(s => s.hrms_id);

            if (hrmsIds.length > 0 && trainingKeys.length > 0) {
                const trainingIds = trainingKeys.map(k => trainingKeyToId[k]).filter(id => id);

                if (trainingIds.length > 0) {
                    const hPlaceholders = hrmsIds.map(() => '?').join(',');
                    const tPlaceholders = trainingIds.map(() => '?').join(',');

                    const trainingQuery = `
                        SELECT tr.staff_hrms_id, tr.training_id, tr.done_date
                        FROM div_training_records tr
                        WHERE tr.staff_hrms_id IN (${hPlaceholders})
                        AND tr.training_id IN (${tPlaceholders})
                        AND tr.record_id IN (
                            SELECT MAX(record_id) FROM div_training_records
                            WHERE staff_hrms_id IN (${hPlaceholders})
                            AND training_id IN (${tPlaceholders})
                            GROUP BY staff_hrms_id, training_id
                        )
                    `;
                    const [trainingRows] = await conn.query(trainingQuery,
                        [...hrmsIds, ...trainingIds, ...hrmsIds, ...trainingIds]);

                    // Initialize matrix - all selected trainings applicable for now
                    staffRows.forEach(staff => {
                        matrix[staff.hrms_id] = {};
                        trainingKeys.forEach(key => {
                            matrix[staff.hrms_id][key] = null; // Not trained
                        });
                    });

                    // Fill in training records
                    trainingRows.forEach(tr => {
                        const key = Object.keys(trainingKeyToId).find(k => trainingKeyToId[k] === tr.training_id);
                        if (key && matrix[tr.staff_hrms_id]) {
                            matrix[tr.staff_hrms_id][key] = tr.done_date;
                        }
                    });
                }
            }

            res.json({ success: true, staff: staffRows, matrix });

        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('Error fetching training matrix:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/training/history/:hrms_id - Get training history for a staff member
router.get('/history/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        const { training_id } = req.query;

        conn = await req.app.locals.pool.getConnection();

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
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// ============================================
// PARAMETERIZED ROUTES (must come after specific routes)
// ============================================

// GET /api/division/training/:hrms_id - Get latest training records for a staff (one per training type)
router.get('/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

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
                SELECT ld.training_id, ld.max_done_date, MAX(dr.record_id) AS max_record_id
                FROM (
                    SELECT training_id, MAX(done_date) AS max_done_date
                    FROM div_training_records
                    WHERE staff_hrms_id = ?
                    GROUP BY training_id
                ) ld
                JOIN div_training_records dr
                    ON dr.training_id = ld.training_id
                    AND dr.done_date = ld.max_done_date
                    AND dr.staff_hrms_id = ?
                GROUP BY ld.training_id, ld.max_done_date
            ) latest ON tr.training_id = latest.training_id
                    AND tr.done_date = latest.max_done_date
                    AND tr.record_id = latest.max_record_id
            LEFT JOIN div_training_types tt ON tr.training_id = tt.training_id
            LEFT JOIN div_training_centers tc ON tr.training_center_id = tc.center_id
            WHERE tr.staff_hrms_id = ?
            ORDER BY tr.due_date DESC, tr.done_date DESC
        `;

        const [results] = await conn.query(query, [hrms_id, hrms_id, hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching training records:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/training - Add new training record
router.post('/', requireAuth, async (req, res) => {
    console.log('POST /training called with body:', JSON.stringify(req.body));
    let conn;
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

        // Lifetime trainings - no due date required
        // KAVACH(4), AC_DC(9), WAG12(10), SPIC(11), HS_SPART(12), VANDE(16), PUSHPULL(18), HSTAT(19), WDS6(21), GHAT_UP(22), GHAT_DN(23), SEGHAT_UP(24), SEGHAT_DN(25)
        const LIFETIME_TRAININGS = [4, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25];
        const isLifetimeTraining = LIFETIME_TRAININGS.includes(parseInt(training_id));
        console.log('DEBUG training_id:', training_id, 'parsed:', parseInt(training_id), 'isLifetime:', isLifetimeTraining);

        // Validate based on medical fitness
        const isMedicallyUnfit = medical_fit === 0;
        if (isMedicallyUnfit) {
            // If unfit, require decategorized date and reason
            if (!decategorized_date || !decategorized_reason) {
                return res.status(400).json({
                    error: 'Decategorized date and reason are required for medically unfit staff'
                });
            }
        } else if (!isLifetimeTraining) {
            // If fit and NOT a lifetime training, require due date
            if (!due_date) {
                return res.status(400).json({
                    error: 'Due date is required'
                });
            }
        }

        conn = await req.app.locals.pool.getConnection();

        // Permission check: Get staff's office and verify access
        const [staffCheck] = await conn.query(
            'SELECT current_office_code, designation_id FROM div_staff_master WHERE hrms_id = ?',
            [staff_hrms_id]
        );

        if (staffCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Staff not found' });
        }

        const staffOffice = staffCheck[0].current_office_code;
        const staffDesignationId = staffCheck[0].designation_id;
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        // Check permissions using special access rules
        if (!canAccessStaff(userOffice, userRole, staffOffice, staffDesignationId)) {
            conn.release();
            return res.status(403).json({
                error: 'Access denied: You can only add training records for staff from your office'
            });
        }

        // Prevent duplicate entries for the same training on the same date
        const [existing] = await conn.query(
            `SELECT record_id FROM div_training_records
             WHERE staff_hrms_id = ? AND training_id = ? AND done_date = ?
             LIMIT 1`,
            [staff_hrms_id, training_id, done_date]
        );
        if (existing.length > 0) {
            conn.release();
            return res.status(409).json({
                error: 'Training already recorded for this date'
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
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/training/:record_id - Update training record
router.put('/:record_id', requireAuth, async (req, res) => {
    let conn;
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

        conn = await req.app.locals.pool.getConnection();

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
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/training/:record_id - Delete training record
router.delete('/:record_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { record_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

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
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
