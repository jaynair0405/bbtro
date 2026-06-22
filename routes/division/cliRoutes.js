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
// Query params: search, office, include_inactive (default: false)
router.get('/', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { search, office, include_inactive } = req.query;
        const showInactive = include_inactive === 'true' || include_inactive === '1';

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
                c.is_active,
                c.inactive_reason,
                c.inactive_date,
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

        // Filter by active status (default: only active)
        if (!showInactive) {
            query += ` AND c.is_active = 1`;
        }

        if (search) {
            query += ` AND (c.cli_name LIKE ? OR c.cmsid LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (office) {
            query += ` AND c.current_office_code = ?`;
            params.push(office);
        }

        query += ` ORDER BY c.is_active DESC, c.cli_name`;

        const [clis] = await conn.query(query, params);

        // Get counts for header
        const [counts] = await conn.query(`
            SELECT
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_count
            FROM div_cli_master
        `);

        res.json({
            clis,
            counts: counts[0]
        });

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

// ============================================
// CLI NOMINATION LETTERS FEATURE
// ============================================

// Helper: Get suburban/non-suburban filter condition
function getStaffTypeCondition(staffType, tableAlias = 's') {
    if (staffType === 'SUBURBAN') {
        return `${tableAlias}.current_cms_id REGEXP '^(PNVS|KYNS|CSTS)'`;
    } else if (staffType === 'NON_SUBURBAN') {
        return `(${tableAlias}.current_cms_id NOT REGEXP '^(PNVS|KYNS|CSTS)' OR ${tableAlias}.current_cms_id IS NULL)`;
    }
    return '1=1';
}

// GET /api/division/cli/letters - List all nomination letters
router.get('/letters', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { staff_type, from_date, to_date } = req.query;

        let query = `
            SELECT l.*,
                   (SELECT COUNT(*) FROM div_cli_nominations n WHERE n.letter_id = l.id) as change_count,
                   (SELECT s.name FROM div_cli_nominations n
                    JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
                    WHERE n.letter_id = l.id LIMIT 1) as first_staff_name
            FROM div_cli_nomination_letters l
            WHERE 1=1
        `;
        const params = [];

        if (staff_type) {
            query += ` AND l.staff_type = ?`;
            params.push(staff_type);
        }

        if (from_date) {
            query += ` AND l.letter_date >= ?`;
            params.push(from_date);
        }

        if (to_date) {
            query += ` AND l.letter_date <= ?`;
            params.push(to_date);
        }

        query += ` ORDER BY l.letter_date DESC, l.id DESC`;

        const [letters] = await conn.query(query, params);

        res.json({ success: true, data: letters });

    } catch (error) {
        console.error('Error fetching letters:', error);
        res.status(500).json({ error: 'Failed to fetch letters' });
    } finally {
        conn.release();
    }
});

// POST /api/division/cli/letters - Create new nomination letter
router.post('/letters', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const {
            letter_date,
            letter_no,
            staff_type,
            subject,
            subject_hindi,
            content_text,
            content_text_hindi,
            footer_text,
            signing_designation,
            signing_designation_hindi,
            signing_place,
            signing_place_hindi
        } = req.body;

        if (!letter_date || !staff_type) {
            return res.status(400).json({ error: 'letter_date and staff_type are required' });
        }

        const created_by = req.session.user?.name || req.session.user?.username || 'System';

        // Default content based on staff type
        const defaultContent = staff_type === 'SUBURBAN'
            ? 'Due to posting & rotation of Motorman changes are made in Loco Inspectors nomination list with immediate effect.'
            : 'Due to posting & rotation of Loco Pilot changes are made in Loco Inspectors nomination list with immediate effect.';

        // Always create a new letter. Multiple letters may be prepared on the same
        // day for the same staff_type, and each must save as its own row.
        const [result] = await conn.query(
            `INSERT INTO div_cli_nomination_letters
             (letter_date, letter_no, staff_type, subject, subject_hindi, content_text, content_text_hindi,
              footer_text, signing_designation, signing_designation_hindi,
              signing_place, signing_place_hindi, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                letter_date,
                letter_no || null,
                staff_type,
                subject || 'Sub: Changes in nomination.',
                subject_hindi || null,
                content_text || defaultContent,
                content_text_hindi || null,
                footer_text || 'C/ CLPC & CLI CO: for information',
                signing_designation || null,
                signing_designation_hindi || null,
                signing_place || null,
                signing_place_hindi || null,
                created_by
            ]
        );

        res.json({ success: true, message: 'Letter created', id: result.insertId });

    } catch (error) {
        console.error('Error creating letter:', error);
        res.status(500).json({ error: 'Failed to create letter', details: error.message });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/letters/:id - Get letter with all changes
router.get('/letters/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { id } = req.params;

        // Get letter metadata
        const [[letter]] = await conn.query(
            `SELECT * FROM div_cli_nomination_letters WHERE id = ?`,
            [id]
        );

        if (!letter) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Get all changes in this letter
        const [changes] = await conn.query(
            `SELECT
                n.nomination_id,
                n.staff_hrms_id,
                s.name as staff_name,
                COALESCE(NULLIF(s.cug_number, ''), s.phone_number) as mobile,
                s.current_cms_id as pf_no,
                s.pf_number,
                s.designation_id,
                d.designation_name,
                s.current_office_code as depot,
                s.safety_category as category,
                old_cli.cli_name as old_cli_name,
                old_cli.cli_id as old_cli_id,
                new_cli.cli_name as new_cli_name,
                new_cli.cli_id as new_cli_id,
                n.remarks,
                n.nominated_from_date,
                n.proposed_lobby,
                plo.office_name as proposed_lobby_name
             FROM div_cli_nominations n
             JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
             JOIN div_cli_master new_cli ON n.cli_id = new_cli.cli_id
             LEFT JOIN offices plo ON n.proposed_lobby = plo.office_code
             LEFT JOIN designations d ON s.designation_id = d.id
             LEFT JOIN (
                 SELECT n2.staff_hrms_id, n2.cli_id, n2.nominated_to_date
                 FROM div_cli_nominations n2
                 WHERE n2.status = 'Expired'
             ) prev ON prev.staff_hrms_id = n.staff_hrms_id
                   AND prev.nominated_to_date = DATE_SUB(n.nominated_from_date, INTERVAL 1 DAY)
             LEFT JOIN div_cli_master old_cli ON prev.cli_id = old_cli.cli_id
             WHERE n.letter_id = ?
             ORDER BY n.nomination_id`,
            [id]
        );

        res.json({ success: true, data: { letter, changes } });

    } catch (error) {
        console.error('Error fetching letter:', error);
        res.status(500).json({ error: 'Failed to fetch letter' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/letters/:id - Update letter metadata
router.put('/letters/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { id } = req.params;
        const {
            letter_no, subject, subject_hindi, content_text, content_text_hindi,
            footer_text, signing_designation, signing_designation_hindi,
            signing_place, signing_place_hindi
        } = req.body;

        await conn.query(
            `UPDATE div_cli_nomination_letters SET
               letter_no = COALESCE(?, letter_no),
               subject = COALESCE(?, subject),
               subject_hindi = COALESCE(?, subject_hindi),
               content_text = COALESCE(?, content_text),
               content_text_hindi = COALESCE(?, content_text_hindi),
               footer_text = COALESCE(?, footer_text),
               signing_designation = COALESCE(?, signing_designation),
               signing_designation_hindi = COALESCE(?, signing_designation_hindi),
               signing_place = COALESCE(?, signing_place),
               signing_place_hindi = COALESCE(?, signing_place_hindi)
             WHERE id = ?`,
            [
                letter_no, subject, subject_hindi, content_text, content_text_hindi,
                footer_text, signing_designation, signing_designation_hindi,
                signing_place, signing_place_hindi, id
            ]
        );

        res.json({ success: true, message: 'Letter updated' });

    } catch (error) {
        console.error('Error updating letter:', error);
        res.status(500).json({ error: 'Failed to update letter' });
    } finally {
        conn.release();
    }
});

// DELETE /api/division/cli/letters/:id - Delete letter (only if no changes)
router.delete('/letters/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { id } = req.params;

        // Check if letter has any changes
        const [[countResult]] = await conn.query(
            `SELECT COUNT(*) as cnt FROM div_cli_nominations WHERE letter_id = ?`,
            [id]
        );

        if (countResult.cnt > 0) {
            return res.status(400).json({
                error: 'Cannot delete letter with changes. Remove all changes first.'
            });
        }

        await conn.query(`DELETE FROM div_cli_nomination_letters WHERE id = ?`, [id]);

        res.json({ success: true, message: 'Letter deleted' });

    } catch (error) {
        console.error('Error deleting letter:', error);
        res.status(500).json({ error: 'Failed to delete letter' });
    } finally {
        conn.release();
    }
});

// POST /api/division/cli/letters/:id/add-change - Add a nomination change to letter
router.post('/letters/:id/add-change', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { id: letterId } = req.params;
        const { staff_hrms_id, new_cli_id, new_category, remarks, proposed_lobby } = req.body;

        if (!staff_hrms_id || !new_cli_id) {
            return res.status(400).json({ error: 'staff_hrms_id and new_cli_id are required' });
        }

        // Verify letter exists
        const [[letter]] = await conn.query(
            `SELECT * FROM div_cli_nomination_letters WHERE id = ?`,
            [letterId]
        );

        if (!letter) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Get staff details and current nomination
        const [[staff]] = await conn.query(
            `SELECT s.*, n.cli_id as current_cli_id, n.nomination_id as current_nomination_id,
                    c.cli_name as current_cli_name
             FROM div_staff_master s
             LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
             LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
             WHERE s.hrms_id = ?`,
            [staff_hrms_id]
        );

        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        const effectiveDate = letter.letter_date;

        await conn.beginTransaction();

        // 1. Expire current nomination if exists
        if (staff.current_nomination_id) {
            await conn.query(
                `UPDATE div_cli_nominations
                 SET status = 'Expired', nominated_to_date = DATE_SUB(?, INTERVAL 1 DAY)
                 WHERE nomination_id = ?`,
                [effectiveDate, staff.current_nomination_id]
            );
        }

        // 2. Create new nomination with letter_id (or update if already exists)
        const [result] = await conn.query(
            `INSERT INTO div_cli_nominations
             (staff_hrms_id, cli_id, nominated_from_date, status, remarks, letter_id, proposed_lobby)
             VALUES (?, ?, ?, 'Active', ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               nomination_id = LAST_INSERT_ID(nomination_id),
               status = 'Active',
               remarks = COALESCE(VALUES(remarks), remarks),
               letter_id = VALUES(letter_id),
               proposed_lobby = VALUES(proposed_lobby)`,
            [staff_hrms_id, new_cli_id, effectiveDate, remarks || null, letterId, proposed_lobby || null]
        );

        // 3. Update staff_master current_cli_id
        await conn.query(
            `UPDATE div_staff_master SET current_cli_id = ? WHERE hrms_id = ?`,
            [new_cli_id, staff_hrms_id]
        );

        // 4. Update category if changed
        if (new_category && new_category !== staff.safety_category) {
            await conn.query(
                `UPDATE div_staff_master SET safety_category = ? WHERE hrms_id = ?`,
                [new_category, staff_hrms_id]
            );
        }

        // 5. Update letter change count
        await conn.query(
            `UPDATE div_cli_nomination_letters
             SET total_changes = (SELECT COUNT(*) FROM div_cli_nominations WHERE letter_id = ?)
             WHERE id = ?`,
            [letterId, letterId]
        );

        await conn.commit();

        res.json({
            success: true,
            message: `Nomination changed: ${staff.name} moved from ${staff.current_cli_name || 'None'} to new CLI`,
            nomination_id: result.insertId
        });

    } catch (error) {
        await conn.rollback();
        console.error('Error adding change:', error);
        res.status(500).json({ error: 'Failed to add change', details: error.message });
    } finally {
        conn.release();
    }
});

// DELETE /api/division/cli/letters/:letterId/remove-change/:nominationId - Remove a change from letter
router.delete('/letters/:letterId/remove-change/:nominationId', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { letterId, nominationId } = req.params;

        // Get the nomination details
        const [[nomination]] = await conn.query(
            `SELECT n.*, s.name as staff_name
             FROM div_cli_nominations n
             JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
             WHERE n.nomination_id = ? AND n.letter_id = ?`,
            [nominationId, letterId]
        );

        if (!nomination) {
            return res.status(404).json({ error: 'Nomination not found in this letter' });
        }

        await conn.beginTransaction();

        // 1. Find the previous (expired) nomination and reactivate it
        const [[prevNomination]] = await conn.query(
            `SELECT * FROM div_cli_nominations
             WHERE staff_hrms_id = ? AND status = 'Expired'
             ORDER BY nominated_to_date DESC LIMIT 1`,
            [nomination.staff_hrms_id]
        );

        if (prevNomination) {
            // Reactivate previous nomination
            await conn.query(
                `UPDATE div_cli_nominations
                 SET status = 'Active', nominated_to_date = NULL
                 WHERE nomination_id = ?`,
                [prevNomination.nomination_id]
            );

            // Update staff_master to previous CLI
            await conn.query(
                `UPDATE div_staff_master SET current_cli_id = ? WHERE hrms_id = ?`,
                [prevNomination.cli_id, nomination.staff_hrms_id]
            );
        } else {
            // No previous nomination, set current_cli_id to NULL
            await conn.query(
                `UPDATE div_staff_master SET current_cli_id = NULL WHERE hrms_id = ?`,
                [nomination.staff_hrms_id]
            );
        }

        // 2. Delete the nomination
        await conn.query(
            `DELETE FROM div_cli_nominations WHERE nomination_id = ?`,
            [nominationId]
        );

        // 3. Update letter change count
        await conn.query(
            `UPDATE div_cli_nomination_letters
             SET total_changes = (SELECT COUNT(*) FROM div_cli_nominations WHERE letter_id = ?)
             WHERE id = ?`,
            [letterId, letterId]
        );

        await conn.commit();

        res.json({
            success: true,
            message: `Change removed for ${nomination.staff_name}`
        });

    } catch (error) {
        await conn.rollback();
        console.error('Error removing change:', error);
        res.status(500).json({ error: 'Failed to remove change' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/load-view - Get all CLIs with staff counts for load balancing
router.get('/load-view', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { staff_type } = req.query;

        let query = `
            SELECT
                c.cli_id,
                c.cli_name,
                c.cmsid,
                c.current_office_code,
                o.office_name,
                COUNT(CASE WHEN n.status = 'Active' THEN 1 END) as staff_count
            FROM div_cli_master c
            LEFT JOIN div_cli_nominations n ON c.cli_id = n.cli_id
            LEFT JOIN offices o ON c.current_office_code = o.office_code
            WHERE c.cli_hrms_id IS NOT NULL AND c.is_active = 1
        `;

        const params = [];

        // Filter by staff type if needed
        if (staff_type) {
            query += ` AND EXISTS (
                SELECT 1 FROM div_cli_nominations n2
                JOIN div_staff_master s ON n2.staff_hrms_id = s.hrms_id
                WHERE n2.cli_id = c.cli_id AND n2.status = 'Active'
                AND ${getStaffTypeCondition(staff_type, 's')}
            )`;
        }

        query += ` GROUP BY c.cli_id ORDER BY staff_count DESC, c.cli_name`;

        const [clis] = await conn.query(query, params);

        // Get total and average
        const total = clis.reduce((sum, c) => sum + c.staff_count, 0);
        const average = clis.length > 0 ? Math.round(total / clis.length) : 0;

        res.json({
            success: true,
            data: {
                clis,
                summary: {
                    total_clis: clis.length,
                    total_staff: total,
                    average_per_cli: average
                }
            }
        });

    } catch (error) {
        console.error('Error fetching CLI load view:', error);
        res.status(500).json({ error: 'Failed to fetch CLI load view' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/na-staff - Get unassigned (NA CLI) staff
router.get('/na-staff', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const [staff] = await conn.query(
            `SELECT
                n.nomination_id,
                n.staff_hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code,
                d.designation_name,
                s.safety_category,
                n.remarks,
                n.nominated_from_date,
                l.letter_date,
                l.letter_no
             FROM div_cli_nominations n
             JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
             JOIN div_cli_master c ON n.cli_id = c.cli_id
             LEFT JOIN designations d ON s.designation_id = d.id
             LEFT JOIN div_cli_nomination_letters l ON n.letter_id = l.id
             WHERE c.cli_hrms_id IS NULL AND n.status = 'Active'
             ORDER BY n.nominated_from_date DESC`
        );

        res.json({ success: true, data: staff });

    } catch (error) {
        console.error('Error fetching NA staff:', error);
        res.status(500).json({ error: 'Failed to fetch unassigned staff' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/staff-history/:hrmsId - Get CLI history for a staff member
router.get('/staff-history/:hrmsId', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { hrmsId } = req.params;

        const [history] = await conn.query(
            `SELECT
                n.nomination_id,
                n.cli_id,
                c.cli_name,
                n.nominated_from_date,
                n.nominated_to_date,
                n.status,
                n.remarks
             FROM div_cli_nominations n
             JOIN div_cli_master c ON n.cli_id = c.cli_id
             WHERE n.staff_hrms_id = ?
             ORDER BY n.nominated_from_date DESC
             LIMIT 10`,
            [hrmsId]
        );

        res.json({ success: true, data: history });

    } catch (error) {
        console.error('Error fetching staff CLI history:', error);
        res.status(500).json({ error: 'Failed to fetch CLI history' });
    } finally {
        conn.release();
    }
});

// GET /api/division/cli/staff-for-letter - Get staff list for adding to letter
router.get('/staff-for-letter', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { staff_type, search, office } = req.query;

        let query = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.pf_number,
                s.current_office_code,
                COALESCE(NULLIF(s.cug_number, ''), s.phone_number) as mobile,
                o.office_name,
                d.designation_name,
                s.designation_id,
                s.safety_category,
                n.cli_id as current_cli_id,
                c.cli_name as current_cli_name
            FROM div_staff_master s
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Active'
        `;

        const params = [];

        // Filter by staff type
        if (staff_type) {
            query += ` AND ${getStaffTypeCondition(staff_type, 's')}`;
        }

        // Search by name or HRMS ID or CMS ID or PF number
        if (search) {
            query += ` AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.current_cms_id LIKE ? OR s.pf_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Filter by office
        if (office) {
            query += ` AND s.current_office_code = ?`;
            params.push(office);
        }

        query += ` ORDER BY s.name LIMIT 50`;

        const [staff] = await conn.query(query, params);

        res.json({ success: true, data: staff });

    } catch (error) {
        console.error('Error fetching staff for letter:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    } finally {
        conn.release();
    }
});

// ============================================
// CLI LOAD OVERVIEW APIs
// ============================================

// Designation grouping (same as leave-management)
const DESIGNATION_GROUPS = {
    '1': { ids: [1, 2], label: 'ALP', order: 1 },      // ALP + Sr.ALP
    '3': { ids: [3, 4], label: 'LPS', order: 2 },      // LPS + Sr.LPS
    '5': { ids: [5], label: 'LPG', order: 3 },
    '6': { ids: [6], label: 'LPP', order: 4 },
    '7': { ids: [7], label: 'LPM', order: 5 },
    '9': { ids: [9], label: 'LP Ghat', order: 6 },
    '8': { ids: [8], label: 'Motorman', order: 7 }
};

// Map designation_id to group key
function mapDesignationToGroup(desigId) {
    for (const [key, group] of Object.entries(DESIGNATION_GROUPS)) {
        if (group.ids.includes(parseInt(desigId))) {
            return key;
        }
    }
    return null;
}

// GET /api/division/cli/load-overview - CLI load overview with designation breakdown
router.get('/load-overview', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);

        // Get all active CLIs
        const [clis] = await conn.query(`
            SELECT
                c.cli_id, c.cli_name, c.cmsid, c.current_office_code,
                c.cli_mobile, c.cli_doa, c.date_promoted_to_cli,
                o.office_name,
                TIMESTAMPDIFF(YEAR, c.date_promoted_to_cli, CURDATE()) as years_as_cli,
                TIMESTAMPDIFF(MONTH, c.date_promoted_to_cli, CURDATE()) % 12 as months_as_cli,
                CASE
                    WHEN c.current_office_code LIKE '%-SUB' THEN 'SUBURBAN'
                    ELSE 'MAINLINE'
                END as cli_type
            FROM div_cli_master c
            LEFT JOIN offices o ON c.current_office_code = o.office_code
            WHERE c.is_active = 1 AND c.cli_hrms_id IS NOT NULL
            ORDER BY cli_type, c.cli_name
        `);

        // Get all active nominations with staff details
        const [nominations] = await conn.query(`
            SELECT
                n.cli_id,
                n.staff_hrms_id,
                s.name as staff_name,
                s.current_cms_id as cms_id,
                s.current_office_code as depot,
                s.designation_id,
                d.designation_name,
                s.safety_category,
                n.nominated_from_date,
                DATEDIFF(CURDATE(), n.nominated_from_date) as days_under_cli
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            LEFT JOIN designations d ON s.designation_id = d.id
            JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE n.status = 'Active' AND c.cli_hrms_id IS NOT NULL AND c.is_active = 1
        `);

        // Get unassigned staff count (NA CLI)
        const [unassignedResult] = await conn.query(`
            SELECT COUNT(*) as count
            FROM div_cli_nominations n
            JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE n.status = 'Active' AND c.cli_hrms_id IS NULL
        `);
        const unassignedCount = unassignedResult[0]?.count || 0;

        // Build CLI load data
        const mainlineCLIs = [];
        const suburbanCLIs = [];

        for (const cli of clis) {
            const cliNominations = nominations.filter(n => n.cli_id === cli.cli_id);

            // Group by depot and designation
            const depotData = {};
            const totals = { ALP: 0, LPS: 0, LPG: 0, LPP: 0, LPM: 0, 'LP Ghat': 0, Motorman: 0, total: 0 };

            for (const nom of cliNominations) {
                const depot = nom.depot || 'Unknown';
                const groupKey = mapDesignationToGroup(nom.designation_id);
                const groupLabel = groupKey ? DESIGNATION_GROUPS[groupKey].label : 'Other';

                if (!depotData[depot]) {
                    depotData[depot] = { ALP: 0, LPS: 0, LPG: 0, LPP: 0, LPM: 0, 'LP Ghat': 0, Motorman: 0, total: 0 };
                }

                if (depotData[depot][groupLabel] !== undefined) {
                    depotData[depot][groupLabel]++;
                }
                depotData[depot].total++;

                if (totals[groupLabel] !== undefined) {
                    totals[groupLabel]++;
                }
                totals.total++;
            }

            const cliData = {
                cli_id: cli.cli_id,
                cli_name: cli.cli_name,
                cmsid: cli.cmsid,
                office_code: cli.current_office_code,
                current_office_code: cli.current_office_code,
                office_name: cli.office_name,
                cli_mobile: cli.cli_mobile,
                cli_doa: cli.cli_doa,
                date_promoted_to_cli: cli.date_promoted_to_cli,
                years_as_cli: cli.years_as_cli,
                months_as_cli: cli.months_as_cli,
                cli_type: cli.cli_type,
                depots: depotData,
                totals: totals,
                staff: cliNominations
            };

            // Only include CLIs with at least one staff
            if (totals.total > 0) {
                if (cli.cli_type === 'SUBURBAN') {
                    suburbanCLIs.push(cliData);
                } else {
                    mainlineCLIs.push(cliData);
                }
            }
        }

        // Calculate summary stats (only count CLIs with staff)
        const totalStaff = nominations.length;
        const activeCLIs = mainlineCLIs.length + suburbanCLIs.length;
        const avgPerCLI = activeCLIs > 0 ? (totalStaff / activeCLIs).toFixed(1) : 0;

        res.json({
            success: true,
            summary: {
                totalStaff,
                activeCLIs,
                avgPerCLI: parseFloat(avgPerCLI),
                unassignedCount
            },
            mainline: mainlineCLIs,
            suburban: suburbanCLIs,
            designationLabels: ['ALP', 'LPS', 'LPG', 'LPP', 'LPM', 'LP Ghat', 'Motorman']
        });

    } catch (error) {
        console.error('Error fetching CLI load overview:', error);
        res.status(500).json({ error: 'Failed to fetch CLI load overview' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/cli/load-staff/:cliId - Get staff list for a CLI with optional filters
router.get('/load-staff/:cliId', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { cliId } = req.params;
        const { depot, designation } = req.query;

        let query = `
            SELECT
                n.nomination_id,
                n.staff_hrms_id,
                s.name as staff_name,
                s.current_cms_id as cms_id,
                s.current_office_code as depot,
                s.designation_id,
                d.designation_name,
                n.nominated_from_date,
                DATEDIFF(CURDATE(), n.nominated_from_date) as days_under_cli
            FROM div_cli_nominations n
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE n.cli_id = ? AND n.status = 'Active'
        `;
        const params = [cliId];

        // Filter by depot
        if (depot && depot !== 'ALL') {
            query += ' AND s.current_office_code = ?';
            params.push(depot);
        }

        // Filter by designation group
        if (designation) {
            const group = DESIGNATION_GROUPS[designation];
            if (group) {
                query += ' AND s.designation_id IN (?)';
                params.push(group.ids);
            }
        }

        query += ' ORDER BY s.name';

        const [staff] = await conn.query(query, params);

        // Get CLI info
        const [cliInfo] = await conn.query(
            'SELECT cli_name, current_office_code FROM div_cli_master WHERE cli_id = ?',
            [cliId]
        );

        res.json({
            success: true,
            cli: cliInfo[0] || {},
            staff: staff.map(s => ({
                ...s,
                designation_group: mapDesignationToGroup(s.designation_id),
                designation_label: s.designation_id ?
                    (DESIGNATION_GROUPS[mapDesignationToGroup(s.designation_id)]?.label || s.designation_name) :
                    'Unknown'
            }))
        });

    } catch (error) {
        console.error('Error fetching CLI staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff list' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================
// CLI CRUD OPERATIONS (/:id routes must come after specific routes)
// ============================================

// GET /api/division/cli/:id - Get single CLI details
router.get('/:id', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const [cli] = await conn.query(`
            SELECT
                c.*,
                o.office_name,
                TIMESTAMPDIFF(YEAR, c.date_promoted_to_cli, CURDATE()) as years_as_cli,
                TIMESTAMPDIFF(MONTH, c.date_promoted_to_cli, CURDATE()) % 12 as months_as_cli
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

        const [result] = await conn.query(`
            INSERT INTO div_cli_master
            (cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              cli_id = LAST_INSERT_ID(cli_id),
              cli_name = VALUES(cli_name),
              current_office_code = VALUES(current_office_code),
              cli_dob = VALUES(cli_dob),
              cli_doa = VALUES(cli_doa),
              date_promoted_to_cli = VALUES(date_promoted_to_cli),
              cli_mobile = VALUES(cli_mobile)
        `, [cmsid, cli_name, current_office_code, cli_dob, cli_doa, date_promoted_to_cli, cli_mobile]);

        res.json({
            success: true,
            cli_id: result.insertId,
            message: result.affectedRows === 1
                ? 'CLI added successfully'
                : 'CLI already existed; details refreshed'
        });

    } catch (error) {
        console.error('Error adding CLI:', error);
        if (error?.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'CLI with same CMSID/HRMS already exists' });
        }
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

// PUT /api/division/cli/:id/deactivate - Deactivate CLI with reason
router.put('/:id/deactivate', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { inactive_reason, inactive_date, remarks } = req.body;
        const cliId = req.params.id;

        if (!inactive_reason) {
            return res.status(400).json({ error: 'Inactive reason is required' });
        }

        // Check if CLI exists
        const [cli] = await conn.query('SELECT cli_id, cli_name, is_active FROM div_cli_master WHERE cli_id = ?', [cliId]);
        if (cli.length === 0) {
            return res.status(404).json({ error: 'CLI not found' });
        }

        if (!cli[0].is_active) {
            return res.status(400).json({ error: 'CLI is already inactive' });
        }

        // Check for active nominations
        const [activeNominations] = await conn.query(
            'SELECT COUNT(*) as count FROM div_cli_nominations WHERE cli_id = ? AND status = "Active"',
            [cliId]
        );

        if (activeNominations[0].count > 0) {
            return res.status(400).json({
                error: `Cannot deactivate CLI with ${activeNominations[0].count} active nominations. Transfer staff first.`
            });
        }

        // Deactivate CLI
        await conn.query(
            `UPDATE div_cli_master
             SET is_active = 0, inactive_reason = ?, inactive_date = ?, updated_at = NOW()
             WHERE cli_id = ?`,
            [inactive_reason, inactive_date || new Date().toISOString().split('T')[0], cliId]
        );

        // End current office posting if exists
        await conn.query(
            `UPDATE div_cli_office_history
             SET to_date = ?, is_current = 0
             WHERE cli_id = ? AND is_current = 1`,
            [inactive_date || new Date().toISOString().split('T')[0], cliId]
        );

        res.json({
            success: true,
            message: `CLI ${cli[0].cli_name} deactivated successfully`,
            reason: inactive_reason
        });

    } catch (error) {
        console.error('Error deactivating CLI:', error);
        res.status(500).json({ error: 'Failed to deactivate CLI' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/:id/reactivate - Reactivate CLI
router.put('/:id/reactivate', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const cliId = req.params.id;

        const [cli] = await conn.query('SELECT cli_id, cli_name, is_active FROM div_cli_master WHERE cli_id = ?', [cliId]);
        if (cli.length === 0) {
            return res.status(404).json({ error: 'CLI not found' });
        }

        if (cli[0].is_active) {
            return res.status(400).json({ error: 'CLI is already active' });
        }

        await conn.query(
            `UPDATE div_cli_master
             SET is_active = 1, inactive_reason = NULL, inactive_date = NULL, updated_at = NOW()
             WHERE cli_id = ?`,
            [cliId]
        );

        res.json({
            success: true,
            message: `CLI ${cli[0].cli_name} reactivated successfully`
        });

    } catch (error) {
        console.error('Error reactivating CLI:', error);
        res.status(500).json({ error: 'Failed to reactivate CLI' });
    } finally {
        conn.release();
    }
});

// ========== CLI OFFICE HISTORY ==========

// GET /api/division/cli/:id/office-history - Get CLI office history
router.get('/:id/office-history', async (req, res) => {
    const conn = await getConnection(req);
    try {
        const [history] = await conn.query(
            `SELECT h.*, o.office_name
             FROM div_cli_office_history h
             LEFT JOIN offices o ON h.office_code = o.office_code
             WHERE h.cli_id = ?
             ORDER BY h.from_date DESC`,
            [req.params.id]
        );

        res.json({ success: true, history });

    } catch (error) {
        console.error('Error fetching CLI office history:', error);
        res.status(500).json({ error: 'Failed to fetch office history' });
    } finally {
        conn.release();
    }
});

// POST /api/division/cli/:id/office-history - Add office posting
router.post('/:id/office-history', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const cliId = req.params.id;
        const { office_code, from_date, to_date, is_current, remarks } = req.body;
        const username = req.session.user.username;

        if (!office_code) {
            return res.status(400).json({ error: 'Office code is required' });
        }

        // If this is current posting, end previous current posting
        if (is_current) {
            if (from_date) {
                await conn.query(
                    `UPDATE div_cli_office_history
                     SET is_current = 0, to_date = DATE_SUB(?, INTERVAL 1 DAY)
                     WHERE cli_id = ? AND is_current = 1`,
                    [from_date, cliId]
                );
            } else {
                await conn.query(
                    `UPDATE div_cli_office_history
                     SET is_current = 0
                     WHERE cli_id = ? AND is_current = 1`,
                    [cliId]
                );
            }

            // Also update current_office_code in cli_master
            await conn.query(
                'UPDATE div_cli_master SET current_office_code = ? WHERE cli_id = ?',
                [office_code, cliId]
            );
        }

        const [result] = await conn.query(
            `INSERT INTO div_cli_office_history
             (cli_id, office_code, from_date, to_date, is_current, remarks, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cliId, office_code, from_date || null, to_date || null, is_current ? 1 : 0, remarks || null, username]
        );

        res.json({
            success: true,
            id: result.insertId,
            message: 'Office posting added successfully'
        });

    } catch (error) {
        console.error('Error adding office posting:', error);
        res.status(500).json({ error: 'Failed to add office posting' });
    } finally {
        conn.release();
    }
});

// PUT /api/division/cli/office-history/:historyId - Update office posting
router.put('/office-history/:historyId', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        const { office_code, from_date, to_date, is_current, remarks } = req.body;
        const historyId = req.params.historyId;

        // Get current record to find cli_id
        const [current] = await conn.query(
            'SELECT cli_id, is_current as was_current FROM div_cli_office_history WHERE id = ?',
            [historyId]
        );

        if (current.length === 0) {
            return res.status(404).json({ error: 'Office history record not found' });
        }

        const cliId = current[0].cli_id;

        // If making this current, end other current postings
        if (is_current && !current[0].was_current) {
            await conn.query(
                `UPDATE div_cli_office_history
                 SET is_current = 0, to_date = DATE_SUB(?, INTERVAL 1 DAY)
                 WHERE cli_id = ? AND is_current = 1 AND id != ?`,
                [from_date, cliId, historyId]
            );

            // Update current_office_code in cli_master
            await conn.query(
                'UPDATE div_cli_master SET current_office_code = ? WHERE cli_id = ?',
                [office_code, cliId]
            );
        }

        await conn.query(
            `UPDATE div_cli_office_history
             SET office_code = ?, from_date = ?, to_date = ?, is_current = ?, remarks = ?
             WHERE id = ?`,
            [office_code, from_date, to_date || null, is_current ? 1 : 0, remarks || null, historyId]
        );

        res.json({
            success: true,
            message: 'Office posting updated successfully'
        });

    } catch (error) {
        console.error('Error updating office posting:', error);
        res.status(500).json({ error: 'Failed to update office posting' });
    } finally {
        conn.release();
    }
});

// DELETE /api/division/cli/office-history/:historyId - Delete office posting
router.delete('/office-history/:historyId', requireDivisionAdmin, async (req, res) => {
    const conn = await getConnection(req);
    try {
        await conn.query('DELETE FROM div_cli_office_history WHERE id = ?', [req.params.historyId]);

        res.json({
            success: true,
            message: 'Office posting deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting office posting:', error);
        res.status(500).json({ error: 'Failed to delete office posting' });
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
                     VALUES (?, ?, ?, NULL, 'Active', ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE
                       nomination_id = LAST_INSERT_ID(nomination_id),
                       status = VALUES(status),
                       remarks = VALUES(remarks),
                       nominated_to_date = VALUES(nominated_to_date),
                       updated_by = VALUES(created_by),
                       updated_at = NOW()`,
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
             VALUES (?, ?, ?, NULL, 'Active', ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
               nomination_id = LAST_INSERT_ID(nomination_id),
               status = VALUES(status),
               remarks = VALUES(remarks),
               nominated_to_date = VALUES(nominated_to_date),
               updated_by = VALUES(created_by),
               updated_at = NOW()`,
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
