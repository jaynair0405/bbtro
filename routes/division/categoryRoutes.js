const express = require('express');
const router = express.Router();

// Middleware to check division admin access
function requireDivisionAdmin(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.user.realm !== 'division') {
        return res.status(403).json({ error: 'Division access required' });
    }
    next();
}

// Helper to get database connection
async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

// ============================================
// CATEGORY STATS
// ============================================

// GET /api/division/category/stats - Get designation-wise category counts
router.get('/stats', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type } = req.query;

        // Determine office filter based on staff type
        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        // Exclude ALP (1) and Sr.ALP (2)
        const [stats] = await conn.query(`
            SELECT
                d.designation_name,
                d.id as designation_id,
                SUM(CASE WHEN s.safety_category = 'A' THEN 1 ELSE 0 END) as cat_a,
                SUM(CASE WHEN s.safety_category = 'B' THEN 1 ELSE 0 END) as cat_b,
                SUM(CASE WHEN s.safety_category = 'C' THEN 1 ELSE 0 END) as cat_c,
                COUNT(*) as total
            FROM div_staff_master s
            JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              ${officeFilter}
            GROUP BY d.id, d.designation_name
            ORDER BY d.id
        `);

        res.json({ success: true, data: stats });

    } catch (error) {
        console.error('Error fetching category stats:', error);
        res.status(500).json({ error: 'Failed to fetch category stats' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/staff-by-category - Get staff list by designation and category
router.get('/staff-by-category', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { designation_id, category, staff_type } = req.query;

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        let query = `
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code,
                s.safety_category,
                d.designation_name,
                c.cli_name
            FROM div_staff_master s
            JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              ${officeFilter}
        `;
        const params = [];

        if (designation_id) {
            query += ` AND s.designation_id = ?`;
            params.push(designation_id);
        }

        if (category) {
            query += ` AND s.safety_category = ?`;
            params.push(category);
        }

        query += ` ORDER BY s.name`;

        const [staff] = await conn.query(query, params);

        res.json({ success: true, data: staff });

    } catch (error) {
        console.error('Error fetching staff by category:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================
// STAFF SEARCH (excluding ALP/Sr.ALP)
// ============================================

// GET /api/division/category/search-staff - Search staff for category change
router.get('/search-staff', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { q, staff_type } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        const [staff] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.pf_number,
                s.current_office_code,
                s.designation_id,
                d.designation_name,
                s.safety_category,
                c.cli_name,
                c.cli_id
            FROM div_staff_master s
            JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              AND (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ?)
              ${officeFilter}
            ORDER BY s.name
            LIMIT 20
        `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

        res.json({ success: true, data: staff });

    } catch (error) {
        console.error('Error searching staff:', error);
        res.status(500).json({ error: 'Failed to search staff' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================
// CATEGORY CHANGE LETTERS
// ============================================

// GET /api/division/category/letters - List all letters
router.get('/letters', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type } = req.query;

        let query = `
            SELECT l.*,
                   (SELECT COUNT(*) FROM div_category_change_history h WHERE h.letter_id = l.id) as change_count,
                   (SELECT s.name FROM div_category_change_history h
                    JOIN div_staff_master s ON h.staff_hrms_id = s.hrms_id
                    WHERE h.letter_id = l.id LIMIT 1) as first_staff_name
            FROM div_category_change_letters l
            WHERE 1=1
        `;
        const params = [];

        if (staff_type) {
            query += ` AND l.staff_type = ?`;
            params.push(staff_type);
        }

        query += ` ORDER BY l.letter_date DESC, l.id DESC`;

        const [letters] = await conn.query(query, params);

        res.json({ success: true, data: letters });

    } catch (error) {
        console.error('Error fetching letters:', error);
        res.status(500).json({ error: 'Failed to fetch letters' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/letters/:id - Get letter details with changes
router.get('/letters/:id', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { id } = req.params;

        // Get letter metadata
        const [[letter]] = await conn.query(
            `SELECT * FROM div_category_change_letters WHERE id = ?`,
            [id]
        );

        if (!letter) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Get all changes in this letter
        const [changes] = await conn.query(`
            SELECT
                h.id as history_id,
                h.staff_hrms_id,
                s.name as staff_name,
                s.current_cms_id,
                s.pf_number,
                s.current_office_code as depot,
                d.designation_name,
                h.old_category,
                h.new_category,
                c.cli_name,
                h.remarks
            FROM div_category_change_history h
            JOIN div_staff_master s ON h.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE h.letter_id = ?
            ORDER BY h.id
        `, [id]);

        res.json({ success: true, data: { letter, changes } });

    } catch (error) {
        console.error('Error fetching letter:', error);
        res.status(500).json({ error: 'Failed to fetch letter' });
    } finally {
        if (conn) conn.release();
    }
});

// POST /api/division/category/letters - Save letter with changes
router.post('/letters', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const {
            letter_id,  // Optional: if provided, update this specific letter
            letter_date,
            letter_no,
            staff_type,
            subject,
            subject_hindi,
            reference_text,
            content_text,
            content_text_hindi,
            footer_text,
            signing_designation,
            signing_designation_hindi,
            signing_place,
            signing_place_hindi,
            cc_text,
            changes // Array of { staff_hrms_id, old_category, new_category, remarks }
        } = req.body;

        if (!letter_date || !staff_type || !changes || changes.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await conn.beginTransaction();

        let letterId;

        // If letter_id provided, update that specific letter (allows date change)
        if (letter_id) {
            // Verify the letter exists
            const [[existingLetter]] = await conn.query(
                `SELECT id FROM div_category_change_letters WHERE id = ?`,
                [letter_id]
            );

            if (!existingLetter) {
                await conn.rollback();
                return res.status(404).json({ error: 'Letter not found' });
            }

            // Multiple letters may exist for the same date/staff_type, so no date-conflict
            // check here.
            letterId = letter_id;
            await conn.query(`
                UPDATE div_category_change_letters SET
                    letter_date = ?,
                    letter_no = ?,
                    staff_type = ?,
                    subject = ?,
                    subject_hindi = ?,
                    reference_text = ?,
                    content_text = ?,
                    content_text_hindi = ?,
                    footer_text = ?,
                    signing_designation = ?,
                    signing_designation_hindi = ?,
                    signing_place = ?,
                    signing_place_hindi = ?,
                    cc_text = ?,
                    total_changes = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [
                letter_date, letter_no, staff_type,
                subject, subject_hindi, reference_text,
                content_text, content_text_hindi, footer_text,
                signing_designation, signing_designation_hindi,
                signing_place, signing_place_hindi, cc_text,
                changes.length, letterId
            ]);

            // Delete old changes for this letter
            await conn.query(`DELETE FROM div_category_change_history WHERE letter_id = ?`, [letterId]);
        } else {
            // No letter_id: always insert a new letter. Multiple letters may be prepared
            // on the same day for the same staff_type, and each saves as its own row.
            const [result] = await conn.query(`
                INSERT INTO div_category_change_letters (
                    letter_date, letter_no, staff_type,
                    subject, subject_hindi, reference_text,
                    content_text, content_text_hindi, footer_text,
                    signing_designation, signing_designation_hindi,
                    signing_place, signing_place_hindi, cc_text,
                    total_changes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                letter_date, letter_no, staff_type,
                subject, subject_hindi, reference_text,
                content_text, content_text_hindi, footer_text,
                signing_designation, signing_designation_hindi,
                signing_place, signing_place_hindi, cc_text,
                changes.length, req.session.user?.username || 'system'
            ]);
            letterId = result.insertId;
        }

        // Insert changes and update staff_master
        for (const change of changes) {
            // Insert history record
            await conn.query(`
                INSERT INTO div_category_change_history
                (staff_hrms_id, old_category, new_category, letter_id, changed_date, remarks)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                change.staff_hrms_id,
                change.old_category,
                change.new_category,
                letterId,
                letter_date,
                change.remarks || null
            ]);

            // Update staff_master safety_category
            await conn.query(`
                UPDATE div_staff_master
                SET safety_category = ?, updated_at = NOW()
                WHERE hrms_id = ?
            `, [change.new_category, change.staff_hrms_id]);
        }

        await conn.commit();

        res.json({
            success: true,
            message: `Letter saved with ${changes.length} category changes`,
            letter_id: letterId
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error saving letter:', error);
        res.status(500).json({ error: 'Failed to save letter: ' + error.message });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/recent-changes - Get recent category changes
router.get('/recent-changes', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type, days = 30 } = req.query;

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        // Recent changes with staff details
        const [changes] = await conn.query(`
            SELECT
                h.id,
                h.staff_hrms_id,
                s.name as staff_name,
                s.current_cms_id,
                s.current_office_code as depot,
                d.designation_name,
                h.old_category,
                h.new_category,
                h.changed_date,
                h.remarks,
                l.letter_no,
                c.cli_name
            FROM div_category_change_history h
            JOIN div_staff_master s ON h.staff_hrms_id = s.hrms_id
            JOIN designations d ON s.designation_id = d.id
            JOIN div_category_change_letters l ON h.letter_id = l.id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE h.changed_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
              ${officeFilter}
            ORDER BY h.changed_date DESC, h.id DESC
            LIMIT 100
        `, [parseInt(days)]);

        // Monthly summary
        // Category order: A is best, C is worst. Upgrade = C→B, B→A, C→A (alphabetically smaller is better)
        const [monthlySummary] = await conn.query(`
            SELECT
                SUM(CASE WHEN h.new_category < h.old_category THEN 1 ELSE 0 END) as upgrades,
                SUM(CASE WHEN h.new_category > h.old_category THEN 1 ELSE 0 END) as downgrades,
                COUNT(*) as total
            FROM div_category_change_history h
            JOIN div_staff_master s ON h.staff_hrms_id = s.hrms_id
            WHERE h.changed_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              ${officeFilter}
        `);

        res.json({
            success: true,
            data: {
                changes,
                summary: monthlySummary[0] || { upgrades: 0, downgrades: 0, total: 0 }
            }
        });

    } catch (error) {
        console.error('Error fetching recent changes:', error);
        res.status(500).json({ error: 'Failed to fetch recent changes' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/all-staff - Get all staff for report with filters
router.get('/all-staff', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type, category, designation_id, depot, cli_id } = req.query;

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        let conditions = [];
        let params = [];

        if (category) {
            conditions.push('s.safety_category = ?');
            params.push(category);
        }
        if (designation_id) {
            conditions.push('s.designation_id = ?');
            params.push(designation_id);
        }
        if (depot) {
            conditions.push('s.current_office_code = ?');
            params.push(depot);
        }
        if (cli_id) {
            conditions.push('n.cli_id = ?');
            params.push(cli_id);
        }

        const whereClause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';

        const [staff] = await conn.query(`
            SELECT
                s.hrms_id,
                s.name,
                s.current_cms_id,
                s.current_office_code as depot,
                d.designation_name,
                d.id as designation_id,
                s.safety_category,
                c.cli_name,
                c.cli_id
            FROM div_staff_master s
            JOIN designations d ON s.designation_id = d.id
            LEFT JOIN div_cli_nominations n ON s.hrms_id = n.staff_hrms_id AND n.status = 'Active'
            LEFT JOIN div_cli_master c ON n.cli_id = c.cli_id
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              ${officeFilter}
              ${whereClause}
            ORDER BY d.id, s.safety_category, s.name
        `, params);

        res.json({ success: true, data: staff });

    } catch (error) {
        console.error('Error fetching all staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/filter-options - Get filter dropdown options
router.get('/filter-options', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type } = req.query;

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        // Get depots
        const [depots] = await conn.query(`
            SELECT DISTINCT s.current_office_code as depot
            FROM div_staff_master s
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              AND s.current_office_code IS NOT NULL
              ${officeFilter}
            ORDER BY s.current_office_code
        `);

        // Get designations (excluding ALP/Sr.ALP)
        const [designations] = await conn.query(`
            SELECT DISTINCT d.id, d.designation_name
            FROM div_staff_master s
            JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              ${officeFilter}
            ORDER BY d.id
        `);

        // Get CLIs
        const [clis] = await conn.query(`
            SELECT DISTINCT c.cli_id, c.cli_name
            FROM div_cli_nominations n
            JOIN div_cli_master c ON n.cli_id = c.cli_id
            JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id
            WHERE n.status = 'Active'
              AND s.status = 'Active'
              AND s.designation_id NOT IN (1, 2, 3, 4)
              ${officeFilter}
            ORDER BY c.cli_name
        `);

        res.json({
            success: true,
            data: {
                depots: depots.map(d => d.depot),
                designations,
                clis
            }
        });

    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/division/category/staff-history/:hrmsId - Get category change history for a staff
router.get('/staff-history/:hrmsId', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { hrmsId } = req.params;

        const [history] = await conn.query(`
            SELECT
                h.id,
                h.old_category,
                h.new_category,
                h.changed_date,
                h.remarks,
                l.letter_no,
                l.letter_date
            FROM div_category_change_history h
            JOIN div_category_change_letters l ON h.letter_id = l.id
            WHERE h.staff_hrms_id = ?
            ORDER BY h.changed_date DESC, h.id DESC
        `, [hrmsId]);

        res.json({ success: true, data: history });

    } catch (error) {
        console.error('Error fetching staff history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================
// CLI MONITORING SUMMARY REPORT
// ============================================

// GET /api/division/category/cli-monitoring - CLI-wise staff distribution
router.get('/cli-monitoring', requireDivisionAdmin, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { staff_type } = req.query;

        let officeFilter = '';
        if (staff_type === 'SUBURBAN') {
            officeFilter = `AND s.current_office_code LIKE '%-SUB'`;
        } else if (staff_type === 'MAINLINE') {
            officeFilter = `AND (s.current_office_code NOT LIKE '%-SUB' OR s.current_office_code IS NULL)`;
        }

        if (staff_type === 'SUBURBAN') {
            // Suburban: Motorman by category + manual LPS
            // Only active CLIs with at least one nominated staff
            const [data] = await conn.query(`
                SELECT
                    c.cli_id,
                    c.cli_name,
                    c.current_office_code as hq,
                    SUM(CASE WHEN s.designation_id = 8 AND s.safety_category = 'A' THEN 1 ELSE 0 END) as mm_a,
                    SUM(CASE WHEN s.designation_id = 8 AND s.safety_category = 'B' THEN 1 ELSE 0 END) as mm_b,
                    SUM(CASE WHEN s.designation_id = 8 AND s.safety_category = 'C' THEN 1 ELSE 0 END) as mm_c,
                    SUM(CASE WHEN s.designation_id = 8 THEN 1 ELSE 0 END) as mm_total,
                    COUNT(n.staff_hrms_id) as staff_count
                FROM div_cli_master c
                LEFT JOIN div_cli_nominations n ON c.cli_id = n.cli_id AND n.status = 'Active'
                LEFT JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id AND s.status = 'Active'
                WHERE c.is_active = 1
                  AND c.current_office_code LIKE '%-SUB'
                GROUP BY c.cli_id, c.cli_name, c.current_office_code
                HAVING staff_count > 0
                ORDER BY c.current_office_code, c.cli_name
            `);

            // Parse integers since MySQL returns strings for SUM
            const result = data.map(row => ({
                ...row,
                mm_a: parseInt(row.mm_a) || 0,
                mm_b: parseInt(row.mm_b) || 0,
                mm_c: parseInt(row.mm_c) || 0,
                mm_total: parseInt(row.mm_total) || 0
            }));

            res.json({ success: true, data: result });
        } else {
            // Main Line: LPG, LPP, LPM, LP GHAT by category + LPS + ALP
            const [data] = await conn.query(`
                SELECT
                    c.cli_id,
                    c.cli_name,
                    c.current_office_code as hq,
                    -- LPG by category (designation 5)
                    SUM(CASE WHEN s.designation_id = 5 AND s.safety_category = 'A' THEN 1 ELSE 0 END) as lpg_a,
                    SUM(CASE WHEN s.designation_id = 5 AND s.safety_category = 'B' THEN 1 ELSE 0 END) as lpg_b,
                    SUM(CASE WHEN s.designation_id = 5 AND s.safety_category = 'C' THEN 1 ELSE 0 END) as lpg_c,
                    SUM(CASE WHEN s.designation_id = 5 THEN 1 ELSE 0 END) as lpg_total,
                    -- LPP by category (designation 6)
                    SUM(CASE WHEN s.designation_id = 6 AND s.safety_category = 'A' THEN 1 ELSE 0 END) as lpp_a,
                    SUM(CASE WHEN s.designation_id = 6 AND s.safety_category = 'B' THEN 1 ELSE 0 END) as lpp_b,
                    SUM(CASE WHEN s.designation_id = 6 AND s.safety_category = 'C' THEN 1 ELSE 0 END) as lpp_c,
                    SUM(CASE WHEN s.designation_id = 6 THEN 1 ELSE 0 END) as lpp_total,
                    -- LPM by category (designation 7)
                    SUM(CASE WHEN s.designation_id = 7 AND s.safety_category = 'A' THEN 1 ELSE 0 END) as lpm_a,
                    SUM(CASE WHEN s.designation_id = 7 AND s.safety_category = 'B' THEN 1 ELSE 0 END) as lpm_b,
                    SUM(CASE WHEN s.designation_id = 7 AND s.safety_category = 'C' THEN 1 ELSE 0 END) as lpm_c,
                    SUM(CASE WHEN s.designation_id = 7 THEN 1 ELSE 0 END) as lpm_total,
                    -- LP GHAT by category (designation 9)
                    SUM(CASE WHEN s.designation_id = 9 AND s.safety_category = 'A' THEN 1 ELSE 0 END) as ghat_a,
                    SUM(CASE WHEN s.designation_id = 9 AND s.safety_category = 'B' THEN 1 ELSE 0 END) as ghat_b,
                    SUM(CASE WHEN s.designation_id = 9 AND s.safety_category = 'C' THEN 1 ELSE 0 END) as ghat_c,
                    SUM(CASE WHEN s.designation_id = 9 THEN 1 ELSE 0 END) as ghat_total,
                    -- Total LP (5,6,7,9)
                    SUM(CASE WHEN s.designation_id IN (5,6,7,9) THEN 1 ELSE 0 END) as total_lp,
                    -- STR = LPS (designation 3,4)
                    SUM(CASE WHEN s.designation_id IN (3,4) THEN 1 ELSE 0 END) as str,
                    -- ALP (designation 1,2)
                    SUM(CASE WHEN s.designation_id IN (1,2) THEN 1 ELSE 0 END) as alp,
                    COUNT(n.staff_hrms_id) as staff_count
                FROM div_cli_master c
                LEFT JOIN div_cli_nominations n ON c.cli_id = n.cli_id AND n.status = 'Active'
                LEFT JOIN div_staff_master s ON n.staff_hrms_id = s.hrms_id AND s.status = 'Active'
                WHERE c.is_active = 1
                  AND c.current_office_code NOT LIKE '%-SUB'
                GROUP BY c.cli_id, c.cli_name, c.current_office_code
                HAVING staff_count > 0
                ORDER BY c.current_office_code, c.cli_name
            `);

            // Calculate derived fields (parse as integers since MySQL returns strings)
            const result = data.map(row => {
                const totalLp = parseInt(row.total_lp) || 0;
                const str = parseInt(row.str) || 0;
                const alp = parseInt(row.alp) || 0;
                return {
                    ...row,
                    lpg_a: parseInt(row.lpg_a) || 0,
                    lpg_b: parseInt(row.lpg_b) || 0,
                    lpg_c: parseInt(row.lpg_c) || 0,
                    lpg_total: parseInt(row.lpg_total) || 0,
                    lpp_a: parseInt(row.lpp_a) || 0,
                    lpp_b: parseInt(row.lpp_b) || 0,
                    lpp_c: parseInt(row.lpp_c) || 0,
                    lpp_total: parseInt(row.lpp_total) || 0,
                    lpm_a: parseInt(row.lpm_a) || 0,
                    lpm_b: parseInt(row.lpm_b) || 0,
                    lpm_c: parseInt(row.lpm_c) || 0,
                    lpm_total: parseInt(row.lpm_total) || 0,
                    ghat_a: parseInt(row.ghat_a) || 0,
                    ghat_b: parseInt(row.ghat_b) || 0,
                    ghat_c: parseInt(row.ghat_c) || 0,
                    ghat_total: parseInt(row.ghat_total) || 0,
                    total_lp: totalLp,
                    str: str,
                    alp: alp,
                    grand_total: totalLp + str + alp,
                    net: totalLp + (alp + str) / 2
                };
            });

            res.json({ success: true, data: result });
        }

    } catch (error) {
        console.error('Error fetching CLI monitoring data:', error);
        res.status(500).json({ error: 'Failed to fetch CLI monitoring data' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
