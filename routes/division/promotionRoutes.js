const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

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

// GET /api/division/promotions/report - All promotion records (report page)
// NOTE: must stay registered before '/:hrms_id' or that route swallows the path
router.get('/report', requireAuth, async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT ph.promotion_id, ph.staff_hrms_id, ph.change_type,
                   ph.posting_date, ph.promotion_order_no, ph.remarks,
                   s.name, s.current_cms_id, s.pf_number,
                   s.current_office_code, o.office_name,
                   d1.designation_name AS from_designation_name,
                   d2.designation_name AS to_designation_name
            FROM div_promotion_history ph
            LEFT JOIN div_staff_master s ON ph.staff_hrms_id = s.hrms_id
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d1 ON ph.from_designation_id = d1.id
            LEFT JOIN designations d2 ON ph.to_designation_id = d2.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        }

        query += ' ORDER BY ph.posting_date DESC, ph.created_at DESC';

        const [records] = await conn.query(query, params);
        conn.release();

        const report = records.map(r => {
            let posting_date = null;
            let formatted_posting_date = null;
            if (r.posting_date) {
                const pd = new Date(r.posting_date);
                // Serialize from local date parts (toISOString shifts back a day on IST)
                const yyyy = pd.getFullYear();
                const mm = String(pd.getMonth() + 1).padStart(2, '0');
                const dd = String(pd.getDate()).padStart(2, '0');
                posting_date = `${yyyy}-${mm}-${dd}`;
                formatted_posting_date = pd.toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
            }
            return { ...r, posting_date, formatted_posting_date };
        });

        res.json({ success: true, data: report, count: report.length });

    } catch (error) {
        console.error('Error fetching promotion report:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/promotions/:hrms_id - Get promotion history for a staff
router.get('/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                ph.promotion_id,
                ph.staff_hrms_id,
                ph.from_designation_id,
                ph.to_designation_id,
                ph.change_type,
                ph.posting_date,
                ph.promotion_order_no,
                ph.remarks,
                ph.created_by,
                ph.created_at,
                d1.designation_name as from_designation_name,
                d2.designation_name as to_designation_name
            FROM div_promotion_history ph
            LEFT JOIN designations d1 ON ph.from_designation_id = d1.id
            LEFT JOIN designations d2 ON ph.to_designation_id = d2.id
            WHERE ph.staff_hrms_id = ?
            ORDER BY ph.posting_date DESC, ph.created_at DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching promotion history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Posting date may be at most tomorrow (order letter can be effective from the next day)
function postingDateTooFar(dateStr) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return new Date(dateStr) > tomorrow;
}

// POST /api/division/promotions - Add new promotion record
router.post('/', requireAuth, async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            from_designation_id,
            to_designation_id,
            change_type,
            posting_date,
            promotion_order_no,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !to_designation_id || !posting_date) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, to_designation_id, posting_date'
            });
        }

        if (postingDateTooFar(posting_date)) {
            return res.status(400).json({
                error: 'Posting date cannot be in the future (latest allowed: tomorrow)'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        const [result] = await conn.query(
            `INSERT INTO div_promotion_history
             (staff_hrms_id, from_designation_id, to_designation_id, change_type,
              posting_date, promotion_order_no, remarks, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                staff_hrms_id,
                from_designation_id || null,
                to_designation_id,
                change_type || 'Promotion',
                posting_date,
                promotion_order_no || null,
                remarks || null,
                req.session.user.username
            ]
        );

        // Get the latest promotion's designation for this staff and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record added successfully',
            promotion_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/promotions/:promotion_id - Update promotion record
router.put('/:promotion_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { promotion_id } = req.params;
        const {
            from_designation_id,
            to_designation_id,
            change_type,
            posting_date,
            promotion_order_no,
            remarks
        } = req.body;

        // Validation
        if (!to_designation_id || !posting_date) {
            return res.status(400).json({
                error: 'Missing required fields: to_designation_id, posting_date'
            });
        }

        if (postingDateTooFar(posting_date)) {
            return res.status(400).json({
                error: 'Posting date cannot be in the future (latest allowed: tomorrow)'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        // Get staff_hrms_id before updating
        const [[promo]] = await conn.query(
            'SELECT staff_hrms_id FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        if (!promo) {
            conn.release();
            return res.status(404).json({ error: 'Promotion record not found' });
        }

        const [result] = await conn.query(
            `UPDATE div_promotion_history
             SET from_designation_id = ?, to_designation_id = ?, change_type = ?,
                 posting_date = ?, promotion_order_no = ?, remarks = ?
             WHERE promotion_id = ?`,
            [
                from_designation_id || null,
                to_designation_id,
                change_type || 'Promotion',
                posting_date,
                promotion_order_no || null,
                remarks || null,
                promotion_id
            ]
        );

        // Get the latest promotion's designation for this staff and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [promo.staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, promo.staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record updated successfully'
        });

    } catch (error) {
        console.error('Error updating promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/promotions/:promotion_id - Delete promotion record
router.delete('/:promotion_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { promotion_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        // Get staff_hrms_id before deleting
        const [[promo]] = await conn.query(
            'SELECT staff_hrms_id FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        if (!promo) {
            conn.release();
            return res.status(404).json({ error: 'Promotion record not found' });
        }

        const [result] = await conn.query(
            'DELETE FROM div_promotion_history WHERE promotion_id = ?',
            [promotion_id]
        );

        // Get the latest remaining promotion's designation and update
        const [[latest]] = await conn.query(
            `SELECT to_designation_id
             FROM div_promotion_history
             WHERE staff_hrms_id = ?
             ORDER BY posting_date DESC, created_at DESC
             LIMIT 1`,
            [promo.staff_hrms_id]
        );

        if (latest) {
            await conn.query(
                `UPDATE div_staff_master
                 SET designation_id = ?
                 WHERE hrms_id = ?`,
                [latest.to_designation_id, promo.staff_hrms_id]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Promotion record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting promotion record:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
