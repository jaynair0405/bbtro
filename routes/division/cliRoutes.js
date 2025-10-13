const express = require('express');
const router = express.Router();

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

module.exports = router;
