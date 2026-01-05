const express = require('express');
const router = express.Router();

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

// Middleware to check if user is division admin
function requireDivisionAdmin(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(403).json({ error: 'Access denied' });
    }
    if (req.session.user.div_role !== 'division_admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Helper to get database connection
async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

// GET /api/division/cli - List all CLIs with basic stats
router.get('/', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { search, office } = req.query;

        let query = `
            SELECT
                c.cli_id,
                c.cmsid,
                c.cli_name,
                c.current_office_code,
                c.cli_mobile,
                c.cli_dob,
                c.cli_doa,
                c.date_promoted_to_cli,
                o.office_name,
                TIMESTAMPDIFF(YEAR, c.date_promoted_to_cli, CURDATE()) as years_as_cli,
                TIMESTAMPDIFF(MONTH, c.date_promoted_to_cli, CURDATE()) % 12 as months_as_cli,
                (SELECT COUNT(*)
                 FROM div_cli_nominations n
                 WHERE n.cli_id = c.cli_id AND n.status = 'Active') as active_staff_count
            FROM div_cli_master c
            LEFT JOIN offices o ON c.current_office_code = o.office_code
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ` AND (c.cli_name LIKE ? OR c.cmsid LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (office) {
            query += ` AND c.current_office_code = ?`;
            params.push(office);
        }

        query += ` ORDER BY c.cli_name`;

        const [clis] = await conn.query(query, params);
        res.json(clis);

    } catch (error) {
        console.error('Error fetching CLIs:', error);
        res.status(500).json({ error: 'Failed to fetch CLIs' });
    } finally {
        conn.release();
    }
});

// ========== CLI NOMINATION MANAGEMENT ==========

// GET /api/division/cli/available-staff - Get staff available for nomination
router.get('/available-staff', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { exclude_cli_id } = req.query;

        // Get all active staff with their current CLI info
        let query = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_office_code,
                s.current_cli_id,
                s.designation_id,
                s.safety_category,
                o.office_name,
                d.designation_name,
                c.cli_name as current_cli_name
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_master c ON s.current_cli_id = c.cli_id
            WHERE s.status = 'Active'
        `;

        const params = [];

        // Optionally exclude staff already under a specific CLI
        if (exclude_cli_id) {
            query += ' AND (s.current_cli_id IS NULL OR s.current_cli_id != ?)';
            params.push(exclude_cli_id);
        }

        query += ' ORDER BY s.current_cli_id IS NULL DESC, s.name';

        const [staff] = await conn.query(query, params);

        // Separate staff without CLI and staff with CLI
        const withoutCLI = staff.filter(s => !s.current_cli_id);
        const withCLI = staff.filter(s => s.current_cli_id);

        res.json({
            success: true,
            data: {
                withoutCLI: withoutCLI,
                withCLI: withCLI,
                total: staff.length
            }
        });

    } catch (error) {
        console.error('Error fetching available staff:', error);
        res.status(500).json({ error: 'Failed to fetch available staff' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/list-all - Get simple list of all CLIs (no admin required)
router.get('/list-all', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const [clis] = await conn.query(`
            SELECT cli_id, cli_name, cmsid, current_office_code
            FROM div_cli_master
            WHERE 1=1
            ORDER BY cli_name
        `);

        res.json({ success: true, data: clis });

    } catch (error) {
        console.error('Error fetching CLI list:', error);
        res.status(500).json({ error: 'Failed to fetch CLI list' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/nomination-history/:hrms_id - Get complete nomination history for a staff member
router.get('/nomination-history/:hrms_id', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { hrms_id } = req.params;

        const [nominations] = await conn.query(
            `SELECT
                n.nomination_id,
                n.staff_hrms_id,
                n.cli_id,
                n.nominated_from_date,
                n.nominated_to_date,
                n.status,
                n.remarks,
                n.created_at,
                c.cli_name,
                c.cmsid
            FROM div_cli_nominations n
            JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE n.staff_hrms_id = ?
            ORDER BY n.nominated_from_date DESC`,
            [hrms_id]
        );

        res.json({ success: true, data: nominations });

    } catch (error) {
        console.error('Error fetching nomination history:', error);
        res.status(500).json({ error: 'Failed to fetch nomination history' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/recent-changes - Get count of recent CLI changes (last 7 days)
router.get('/recent-changes', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        let query = `
            SELECT COUNT(*) as count
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            WHERE n.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND n.status IN ('Active', 'Expired')
        `;

        const params = [];

        // If not admin, filter by office
        if (userRole !== 'division_admin') {
            query += ' AND s.current_office_code = ?';
            params.push(userOffice);
        }

        const [result] = await conn.query(query, params);

        res.json({ success: true, count: result[0].count });

    } catch (error) {
        console.error('Error fetching recent CLI changes:', error);
        res.status(500).json({ error: 'Failed to fetch recent changes' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/:id - Get single CLI details
router.get('/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const [cli] = await conn.query(`
            SELECT
                c.*,
                o.office_name
            FROM div_cli_master c
            LEFT JOIN offices o ON c.current_office_code = o.office_code
            WHERE c.cli_id = ?
        `, [req.params.id]);

        if (cli.length === 0) {
            return res.status(404).json({ error: 'CLI not found' });
        }

        res.json(cli[0]);

    } catch (error) {
        console.error('Error fetching CLI:', error);
        res.status(500).json({ error: 'Failed to fetch CLI details' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/:id/stats - Get CLI nomination statistics
router.get('/:id/stats', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        // Get CLI basic info
        const [cli] = await conn.query(`
            SELECT
                c.*,
                o.office_name,
                TIMESTAMPDIFF(YEAR, c.date_promoted_to_cli, CURDATE()) as years_as_cli
            FROM div_cli_master c
            LEFT JOIN offices o ON c.current_office_code = o.office_code
            WHERE c.cli_id = ?
        `, [req.params.id]);

        if (cli.length === 0) {
            return res.status(404).json({ error: 'CLI not found' });
        }

        // Get nomination counts by status
        const [statusCounts] = await conn.query(`
            SELECT
                status,
                COUNT(*) as count
            FROM div_cli_nominations
            WHERE cli_id = ?
            GROUP BY status
        `, [req.params.id]);

        // Get active nominations by safety category with avg days
        const [categoryStats] = await conn.query(`
            SELECT
                s.safety_category,
                COUNT(*) as count,
                AVG(DATEDIFF(CURDATE(), n.nominated_from_date)) as avg_days
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            WHERE n.cli_id = ? AND n.status = 'Active'
            GROUP BY s.safety_category
        `, [req.params.id]);

        // Get active nominations by designation with avg days
        const [designationStats] = await conn.query(`
            SELECT
                d.designation_name,
                COUNT(*) as count,
                AVG(DATEDIFF(CURDATE(), n.nominated_from_date)) as avg_days
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            WHERE n.cli_id = ? AND n.status = 'Active'
            GROUP BY d.designation_name
        `, [req.params.id]);

        // Get designation + category breakdown
        const [crossTabulation] = await conn.query(`
            SELECT
                d.designation_name,
                s.safety_category,
                COUNT(*) as count
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            WHERE n.cli_id = ? AND n.status = 'Active'
            GROUP BY d.designation_name, s.safety_category
            ORDER BY d.designation_name, s.safety_category
        `, [req.params.id]);

        // Get duration ranges for active nominations
        const [durationRanges] = await conn.query(`
            SELECT
                CASE
                    WHEN DATEDIFF(CURDATE(), n.nominated_from_date) < 365 THEN '< 1 year'
                    WHEN DATEDIFF(CURDATE(), n.nominated_from_date) < 1095 THEN '1-3 years'
                    WHEN DATEDIFF(CURDATE(), n.nominated_from_date) < 1825 THEN '3-5 years'
                    ELSE '> 5 years'
                END as duration_range,
                COUNT(*) as count
            FROM div_cli_nominations n
            WHERE n.cli_id = ? AND n.status = 'Active'
            GROUP BY duration_range
            ORDER BY
                CASE duration_range
                    WHEN '< 1 year' THEN 1
                    WHEN '1-3 years' THEN 2
                    WHEN '3-5 years' THEN 3
                    WHEN '> 5 years' THEN 4
                END
        `, [req.params.id]);

        // Get historical stats
        const [historicalStats] = await conn.query(`
            SELECT
                COUNT(*) as total_historical,
                AVG(DATEDIFF(nominated_to_date, nominated_from_date)) as avg_duration_days
            FROM div_cli_nominations
            WHERE cli_id = ? AND status != 'Active' AND nominated_to_date IS NOT NULL
        `, [req.params.id]);

        // Get longest nomination
        const [longestNomination] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                d.designation_name,
                n.nominated_from_date,
                DATEDIFF(CURDATE(), n.nominated_from_date) as days
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            WHERE n.cli_id = ? AND n.status = 'Active'
            ORDER BY days DESC
            LIMIT 1
        `, [req.params.id]);

        // Calculate total active count
        const totalActive = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
        const totalStatusCounts = statusCounts.reduce((acc, s) => {
            acc[s.status.toLowerCase()] = s.count;
            return acc;
        }, {});

        res.json({
            cli: cli[0],
            nominations: {
                total: statusCounts.reduce((sum, s) => sum + s.count, 0),
                active: totalStatusCounts.active || 0,
                expired: totalStatusCounts.expired || 0,
                transferred: totalStatusCounts.transferred || 0,
                byCategory: categoryStats,
                byDesignation: designationStats,
                crossTabulation: crossTabulation,
                durationRanges: durationRanges,
                historical: historicalStats[0] || { total_historical: 0, avg_duration_days: 0 },
                longestNomination: longestNomination[0] || null
            }
        });

    } catch (error) {
        console.error('Error fetching CLI stats:', error);
        res.status(500).json({ error: 'Failed to fetch CLI statistics' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/:id/staff - Get staff list under CLI with nomination details
router.get('/:id/staff', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { status } = req.query;

        let query = `
            SELECT
                n.nomination_id,
                s.hrms_id,
                s.name,
                d.designation_name,
                s.safety_category,
                n.nominated_from_date,
                n.nominated_to_date,
                n.nomination_order_no,
                n.status as nomination_status,
                s.status as staff_status,
                CASE
                    WHEN n.nominated_to_date IS NULL
                    THEN DATEDIFF(CURDATE(), n.nominated_from_date)
                    ELSE DATEDIFF(n.nominated_to_date, n.nominated_from_date)
                END as nomination_days
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            WHERE n.cli_id = ?
        `;

        const params = [req.params.id];

        if (status) {
            query += ` AND n.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY nomination_days DESC`;

        const [staff] = await conn.query(query, params);

        // Calculate statistics
        const stats = {
            total: staff.length,
            avgDays: staff.length > 0
                ? Math.round(staff.reduce((sum, s) => sum + s.nomination_days, 0) / staff.length)
                : 0
        };

        // Group by status
        const byStatus = staff.reduce((acc, s) => {
            if (!acc[s.nomination_status]) {
                acc[s.nomination_status] = [];
            }
            acc[s.nomination_status].push(s);
            return acc;
        }, {});

        // Calculate average for each status
        const statusStats = {};
        for (const [status, staffList] of Object.entries(byStatus)) {
            statusStats[status] = {
                count: staffList.length,
                avgDays: Math.round(staffList.reduce((sum, s) => sum + s.nomination_days, 0) / staffList.length)
            };
        }

        res.json({
            staff: staff,
            statistics: stats,
            statusStats: statusStats
        });

    } catch (error) {
        console.error('Error fetching CLI staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff list' });
    } finally {
        conn.release();
    }
});

// POST /api/division/cli - Add new CLI
router.post('/', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile } = req.body;

        // Validate required fields
        if (!cmsid || !cli_name) {
            return res.status(400).json({ error: 'CMSID and CLI name are required' });
        }

        // Check if CMSID already exists
        const [existing] = await conn.query('SELECT cli_id FROM div_cli_master WHERE cmsid = ?', [cmsid]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'CMSID already exists' });
        }

        const [result] = await conn.query(`
            INSERT INTO div_cli_master
            (cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile]);

        res.json({
            success: true,
            cli_id: result.insertId,
            message: 'CLI added successfully'
        });

    } catch (error) {
        console.error('Error adding CLI:', error);
        res.status(500).json({ error: 'Failed to add CLI' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/:id - Update CLI
router.put('/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile } = req.body;

        // Validate required fields
        if (!cmsid || !cli_name) {
            return res.status(400).json({ error: 'CMSID and CLI name are required' });
        }

        // Check if CMSID already exists for another CLI
        const [existing] = await conn.query(
            'SELECT cli_id FROM div_cli_master WHERE cmsid = ? AND cli_id != ?',
            [cmsid, req.params.id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'CMSID already exists for another CLI' });
        }

        await conn.query(`
            UPDATE div_cli_master
            SET cmsid = ?,
                cli_name = ?,
                current_office_code = ?,
                cli_dob = ?,
                cli_doa = ?,
                date_promoted_to_cli = ?,
                cli_mobile = ?
            WHERE cli_id = ?
        `, [cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile, req.params.id]);

        res.json({
            success: true,
            message: 'CLI updated successfully'
        });

    } catch (error) {
        console.error('Error updating CLI:', error);
        res.status(500).json({ error: 'Failed to update CLI' });
    } finally {
        conn.release();
    }
});

// DELETE /api/division/cli/:id - Delete CLI (only if no active nominations)
router.delete('/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        // Check if CLI has any active nominations
        const [activeNominations] = await conn.query(
            'SELECT COUNT(*) as count FROM div_cli_nominations WHERE cli_id = ? AND status = "Active"',
            [req.params.id]
        );

        if (activeNominations[0].count > 0) {
            return res.status(400).json({
                error: 'Cannot delete CLI with active nominations. Please transfer staff first.'
            });
        }

        await conn.query('DELETE FROM div_cli_master WHERE cli_id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'CLI deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting CLI:', error);
        res.status(500).json({ error: 'Failed to delete CLI' });
    } finally {
        conn.release();
    }
});

// POST /api/division/cli/:cli_id/nominate-bulk - Bulk nominate staff to CLI
router.post('/:cli_id/nominate-bulk', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { cli_id } = req.params;
        const { staff_hrms_ids, nominated_from_date, remarks } = req.body;

        // Validation
        if (!staff_hrms_ids || !Array.isArray(staff_hrms_ids) || staff_hrms_ids.length === 0) {
            return res.status(400).json({ error: 'At least one staff member must be selected' });
        }

        if (!nominated_from_date) {
            return res.status(400).json({ error: 'Nomination start date is required' });
        }

        // Check if CLI exists and is active
        const [cliCheck] = await conn.query(
            'SELECT cli_id, cli_name, is_active FROM div_cli_master WHERE cli_id = ?',
            [cli_id]
        );

        if (cliCheck.length === 0) {
            return res.status(404).json({ error: 'CLI not found' });
        }

        if (!cliCheck[0].is_active) {
            return res.status(400).json({ error: 'Cannot nominate to inactive CLI' });
        }

        const username = req.session.user.username;
        const results = [];
        const errors = [];

        // Process each staff member
        for (const hrms_id of staff_hrms_ids) {
            try {
                // Check if staff exists and is active
                const [staffCheck] = await conn.query(
                    'SELECT hrms_id, name, status, current_cli_id FROM div_staff_master WHERE hrms_id = ?',
                    [hrms_id]
                );

                if (staffCheck.length === 0) {
                    errors.push({ hrms_id, error: 'Staff not found' });
                    continue;
                }

                const staff = staffCheck[0];

                if (staff.status !== 'Active') {
                    errors.push({ hrms_id, name: staff.name, error: `Staff status is ${staff.status}` });
                    continue;
                }

                // If staff already has a CLI, end the previous nomination
                if (staff.current_cli_id) {
                    // Calculate end date as one day before new start date
                    const endDate = new Date(nominated_from_date);
                    endDate.setDate(endDate.getDate() - 1);
                    const formattedEndDate = endDate.toISOString().split('T')[0];

                    // End previous active nomination
                    await conn.query(
                        `UPDATE div_cli_nominations
                         SET status = 'Expired',
                             nominated_to_date = ?,
                             updated_by = ?,
                             updated_at = NOW()
                         WHERE staff_hrms_id = ? AND status = 'Active'`,
                        [formattedEndDate, username, hrms_id]
                    );
                }

                // Create new nomination
                const [nominationResult] = await conn.query(
                    `INSERT INTO div_cli_nominations
                     (staff_hrms_id, cli_id, nominated_from_date, nominated_to_date, status, remarks, created_by, created_at)
                     VALUES (?, ?, ?, NULL, 'Active', ?, ?, NOW())`,
                    [hrms_id, cli_id, nominated_from_date, remarks || null, username]
                );

                // Update staff master with new CLI
                await conn.query(
                    'UPDATE div_staff_master SET current_cli_id = ? WHERE hrms_id = ?',
                    [cli_id, hrms_id]
                );

                results.push({
                    hrms_id,
                    name: staff.name,
                    nomination_id: nominationResult.insertId,
                    previous_cli_id: staff.current_cli_id,
                    success: true
                });

            } catch (error) {
                console.error(`Error nominating staff ${hrms_id}:`, error);
                errors.push({ hrms_id, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Successfully nominated ${results.length} staff member(s)`,
            results: results,
            errors: errors.length > 0 ? errors : undefined,
            cli_name: cliCheck[0].cli_name
        });

    } catch (error) {
        console.error('Error in bulk nomination:', error);
        res.status(500).json({ error: 'Failed to process bulk nomination' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/nomination/:nomination_id/change - Change staff to different CLI
router.put('/nomination/:nomination_id/change', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { nomination_id } = req.params;
        const { new_cli_id, nominated_from_date, remarks } = req.body;

        // Validation
        if (!new_cli_id) {
            return res.status(400).json({ error: 'New CLI ID is required' });
        }

        if (!nominated_from_date) {
            return res.status(400).json({ error: 'New nomination start date is required' });
        }

        // Get current nomination details
        const [currentNomination] = await conn.query(
            `SELECT n.*, s.name as staff_name, s.current_office_code as staff_office_code,
                    s.designation_id, c.cli_name as current_cli_name
             FROM div_cli_nominations n
             JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
             JOIN div_cli_master c ON n.cli_id = c.cli_id
             WHERE n.nomination_id = ? AND n.status = 'Active'`,
            [nomination_id]
        );

        if (currentNomination.length === 0) {
            return res.status(404).json({ error: 'Active nomination not found' });
        }

        const nomination = currentNomination[0];

        // Check office permissions using special access rules
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;

        if (!canAccessStaff(userOffice, userRole, nomination.staff_office_code, nomination.designation_id)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You can only change CLI nominations for staff in your office'
            });
        }

        // Check if new CLI is same as current
        if (nomination.cli_id == new_cli_id) {
            return res.status(400).json({ error: 'Staff is already under this CLI' });
        }

        // Check if new CLI exists and is active
        const [newCliCheck] = await conn.query(
            'SELECT cli_id, cli_name, is_active FROM div_cli_master WHERE cli_id = ?',
            [new_cli_id]
        );

        if (newCliCheck.length === 0) {
            return res.status(404).json({ error: 'New CLI not found' });
        }

        if (!newCliCheck[0].is_active) {
            return res.status(400).json({ error: 'Cannot nominate to inactive CLI' });
        }

        const username = req.session.user.username;

        // Calculate end date as one day before new start date
        const endDate = new Date(nominated_from_date);
        endDate.setDate(endDate.getDate() - 1);
        const formattedEndDate = endDate.toISOString().split('T')[0];

        // End current nomination
        await conn.query(
            `UPDATE div_cli_nominations
             SET status = 'Expired',
                 nominated_to_date = ?,
                 updated_by = ?,
                 updated_at = NOW()
             WHERE nomination_id = ?`,
            [formattedEndDate, username, nomination_id]
        );

        // Create new nomination
        const [newNomination] = await conn.query(
            `INSERT INTO div_cli_nominations
             (staff_hrms_id, cli_id, nominated_from_date, nominated_to_date, status, remarks, created_by, created_at)
             VALUES (?, ?, ?, NULL, 'Active', ?, ?, NOW())`,
            [nomination.staff_hrms_id, new_cli_id, nominated_from_date, remarks || null, username]
        );

        // Update staff master with new CLI
        await conn.query(
            'UPDATE div_staff_master SET current_cli_id = ? WHERE hrms_id = ?',
            [new_cli_id, nomination.staff_hrms_id]
        );

        res.json({
            success: true,
            message: `Successfully changed CLI for ${nomination.staff_name}`,
            data: {
                staff_hrms_id: nomination.staff_hrms_id,
                staff_name: nomination.staff_name,
                previous_cli: nomination.current_cli_name,
                new_cli: newCliCheck[0].cli_name,
                new_nomination_id: newNomination.insertId,
                effective_date: nominated_from_date
            }
        });

    } catch (error) {
        console.error('Error changing CLI nomination:', error);
        res.status(500).json({ error: 'Failed to change CLI nomination' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/nomination/:nomination_id/end - End nomination
router.put('/nomination/:nomination_id/end', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { nomination_id } = req.params;
        const { end_date, reason } = req.body;

        // Validation
        if (!end_date) {
            return res.status(400).json({ error: 'End date is required' });
        }

        // Get current nomination details
        const [currentNomination] = await conn.query(
            `SELECT n.*, s.name as staff_name, c.cli_name
             FROM div_cli_nominations n
             JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
             JOIN div_cli_master c ON n.cli_id = c.cli_id
             WHERE n.nomination_id = ? AND n.status = 'Active'`,
            [nomination_id]
        );

        if (currentNomination.length === 0) {
            return res.status(404).json({ error: 'Active nomination not found' });
        }

        const nomination = currentNomination[0];
        const username = req.session.user.username;

        // End nomination
        await conn.query(
            `UPDATE div_cli_nominations
             SET status = 'Transferred',
                 nominated_to_date = ?,
                 remarks = ?,
                 updated_by = ?,
                 updated_at = NOW()
             WHERE nomination_id = ?`,
            [end_date, reason || nomination.remarks, username, nomination_id]
        );

        // Clear CLI from staff master
        await conn.query(
            'UPDATE div_staff_master SET current_cli_id = NULL WHERE hrms_id = ?',
            [nomination.staff_hrms_id]
        );

        res.json({
            success: true,
            message: `Successfully ended nomination for ${nomination.staff_name}`,
            data: {
                staff_hrms_id: nomination.staff_hrms_id,
                staff_name: nomination.staff_name,
                cli_name: nomination.cli_name,
                end_date: end_date
            }
        });

    } catch (error) {
        console.error('Error ending nomination:', error);
        res.status(500).json({ error: 'Failed to end nomination' });
    } finally {
        conn.release();
    }
});

module.exports = router;
