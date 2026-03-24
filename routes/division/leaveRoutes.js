const express = require('express');
const router = express.Router();

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

// Normalize date range (swap if inverted)
function normalizeDateRange(from, to) {
    if (from && to && to < from) {
        return { from: to, to: from };
    }
    return { from, to };
}

// Format date to YYYY-MM-DD string to avoid timezone issues
// This ensures dates are stored without time component shift
function formatDateForDB(dateStr) {
    if (!dateStr) return null;
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    // Parse and extract local date components to avoid UTC shift
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// POST /api/division/leave - Create leave entry
router.post('/', async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            leave_type,
            from_date,
            to_date,
            days,
            office_code,
            designation_id,
            reason,
            remarks,
            status,
            force_submit  // If true, skip overlap check (user confirmed)
        } = req.body;

        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        const allowedStatuses = new Set(['Pending', 'Forwarded', 'Approved', 'Rejected', 'Cancelled', 'Absent']);

        // Basic validation
        if (!staff_hrms_id || !from_date || !to_date || !days) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Office authorization check - non-admin can only create for their office
        if (userRole !== 'division_admin' && office_code !== userOffice) {
            return res.status(403).json({ error: 'Not authorized to create leave for this office' });
        }

        if (new Date(to_date) < new Date(from_date)) {
            return res.status(400).json({ error: 'Invalid date range (to_date before from_date)' });
        }

        if (!Number.isFinite(days) || days <= 0) {
            return res.status(400).json({ error: 'Invalid days value' });
        }

        if (status && !allowedStatuses.has(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Format dates to avoid timezone shift
        const formattedFromDate = formatDateForDB(from_date);
        const formattedToDate = formatDateForDB(to_date);

        conn = await req.app.locals.pool.getConnection();

        // Check for overlapping leaves (unless force_submit is true)
        if (!force_submit) {
            const [overlaps] = await conn.query(
                `SELECT id, leave_type, DATE_FORMAT(from_date, '%Y-%m-%d') as from_date,
                        DATE_FORMAT(to_date, '%Y-%m-%d') as to_date, days, status
                 FROM div_leave_tracking
                 WHERE staff_hrms_id = ?
                   AND status NOT IN ('Rejected', 'Cancelled')
                   AND DATE(from_date) <= DATE(?)
                   AND DATE(to_date) >= DATE(?)`,
                [staff_hrms_id, formattedToDate, formattedFromDate]
            );

            if (overlaps.length > 0) {
                conn.release();
                return res.json({
                    success: false,
                    overlap: true,
                    message: 'Overlapping leave entries found',
                    overlapping_entries: overlaps
                });
            }
        }

        const initialStatus = status || 'Pending';

        await conn.beginTransaction();

        // Insert leave entry
        const [result] = await conn.query(
            `INSERT INTO div_leave_tracking
             (staff_hrms_id, leave_type, from_date, to_date, days, office_code, designation_id, reason, remarks, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [staff_hrms_id, leave_type, formattedFromDate, formattedToDate, days, office_code, designation_id, reason, remarks || null, initialStatus]
        );

        const leaveId = result.insertId;

        // Log initial status in history
        const changedBy = req.session.user?.name || req.session.user?.username || 'System';
        await conn.query(
            `INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
             VALUES (?, NULL, ?, ?)`,
            [leaveId, initialStatus, changedBy]
        );

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            message: 'Leave entry created successfully',
            id: leaveId
        });

    } catch (error) {
        console.error('Error creating leave entry:', error);
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/history/:hrmsId - Get staff leave history
router.get('/history/:hrmsId', async (req, res) => {
    let conn;
    try {
        const { hrmsId } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const [results] = await conn.query(
            `SELECT id, leave_type, from_date, to_date, days, status, is_regularized, reason, remarks, created_at
             FROM div_leave_tracking
             WHERE staff_hrms_id = ?
             ORDER BY from_date DESC
             LIMIT 50`,
            [hrmsId]
        );

        conn.release();

        res.json({ success: true, data: results });

    } catch (error) {
        console.error('Error fetching leave history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/dashboard - Get dashboard stats + chart data
router.get('/dashboard', async (req, res) => {
    let conn;
    try {
        const { office_code, designation_id, designation_ids } = req.query;
        const { from: normFrom, to: normTo } = normalizeDateRange(req.query.from_date, req.query.to_date);
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Build filter conditions (use overlap logic for date range)
        let conditions = [];
        let params = [];

        // Office filter - admin can see all, others see their office only
        if (userRole !== 'division_admin') {
            conditions.push('l.office_code = ?');
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            conditions.push('l.office_code = ?');
            params.push(office_code);
        }

        // Designation filter - support both single ID and comma-separated IDs (for grouping)
        if (designation_ids && designation_ids !== 'ALL') {
            const ids = designation_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) {
                conditions.push(`l.designation_id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
        } else if (designation_id && designation_id !== 'ALL') {
            conditions.push('l.designation_id = ?');
            params.push(designation_id);
        }

        // Date overlap filter: leave touches the window
        if (normFrom && normTo) {
            conditions.push('(DATE(l.from_date) <= DATE(?) AND DATE(l.to_date) >= DATE(?))');
            params.push(normTo, normFrom);
        } else if (normFrom) {
            // Any leave that ends on/after from_date
            conditions.push('DATE(l.to_date) >= DATE(?)');
            params.push(normFrom);
        } else if (normTo) {
            // Any leave that starts on/before to_date
            conditions.push('DATE(l.from_date) <= DATE(?)');
            params.push(normTo);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // Get counts by status
        const [statusCounts] = await conn.query(`
            SELECT
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Forwarded' THEN 1 ELSE 0 END) as forwarded,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Absent' AND is_regularized = 0 THEN 1 ELSE 0 END) as absent_unregularized
            FROM div_leave_tracking l
            ${whereClause}
        `, params);

        // Get count of staff on leave today (approved leaves where today is between from_date and to_date)
        // Use DATE() to handle timezone issues with stored dates
        const todayParams = [...params];
        const todayWhereClause = conditions.length > 0
            ? whereClause + ' AND l.status = "Approved" AND CURDATE() BETWEEN DATE(l.from_date) AND DATE(l.to_date)'
            : 'WHERE l.status = "Approved" AND CURDATE() BETWEEN DATE(l.from_date) AND DATE(l.to_date)';

        const [onLeaveToday] = await conn.query(`
            SELECT COUNT(*) as count
            FROM div_leave_tracking l
            ${todayWhereClause}
        `, todayParams);

        // Get count of staff returning tomorrow (leave ends today, so they return tomorrow)
        const returningParams = [...params];
        const returningWhereClause = conditions.length > 0
            ? whereClause + ' AND l.status = "Approved" AND DATE(l.to_date) = CURDATE()'
            : 'WHERE l.status = "Approved" AND DATE(l.to_date) = CURDATE()';

        const [returningTomorrow] = await conn.query(`
            SELECT COUNT(*) as count
            FROM div_leave_tracking l
            ${returningWhereClause}
        `, returningParams);

        // Chart data - count all days covered by each leave entry
        const chartFromDate = normFrom || new Date().toISOString().slice(0, 8) + '01';
        const chartToDate = normTo || new Date().toISOString().slice(0, 10);

        // Get all leave entries that overlap with the chart date range
        // Exclude Rejected and Cancelled from chart (they shouldn't count as applied)
        // Use DATE() to extract date strings and avoid timezone issues
        const chartWhereClause = whereClause
            ? whereClause + " AND l.status NOT IN ('Rejected', 'Cancelled') AND DATE(l.from_date) <= ? AND DATE(l.to_date) >= ?"
            : "WHERE l.status NOT IN ('Rejected', 'Cancelled') AND DATE(l.from_date) <= ? AND DATE(l.to_date) >= ?";
        const chartParams = [...params, chartToDate, chartFromDate];

        const [allEntries] = await conn.query(`
            SELECT DATE(l.from_date) AS from_date_str, DATE(l.to_date) AS to_date_str, l.status
            FROM div_leave_tracking l
            ${chartWhereClause}
        `, chartParams);

        conn.release();

        // Build chart data - count each day covered by leave entries
        const appliedByDay = {};
        const approvedByDay = {};
        // Parse chart date range strings to avoid timezone issues
        const [cStartY, cStartM, cStartD] = chartFromDate.split('-').map(Number);
        const [cEndY, cEndM, cEndD] = chartToDate.split('-').map(Number);
        const chartStartDate = new Date(cStartY, cStartM - 1, cStartD);
        const chartEndDate = new Date(cEndY, cEndM - 1, cEndD);

        allEntries.forEach(entry => {
            // MySQL DATE() returns Date objects - use them directly
            const leaveStart = new Date(entry.from_date_str);
            const leaveEnd = new Date(entry.to_date_str);

            // Find overlap between leave period and chart date range
            const overlapStart = leaveStart > chartStartDate ? leaveStart : chartStartDate;
            const overlapEnd = leaveEnd < chartEndDate ? leaveEnd : chartEndDate;

            // Count each day in the overlap
            for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
                const day = d.getDate().toString();
                appliedByDay[day] = (appliedByDay[day] || 0) + 1;
                if (entry.status === 'Approved') {
                    approvedByDay[day] = (approvedByDay[day] || 0) + 1;
                }
            }
        });

        // Generate labels for all days in the range
        const labels = [];
        const appliedData = [];
        const approvedData = [];

        for (let d = new Date(chartStartDate); d <= chartEndDate; d.setDate(d.getDate() + 1)) {
            const day = d.getDate().toString();
            labels.push(day);
            appliedData.push(appliedByDay[day] || 0);
            approvedData.push(approvedByDay[day] || 0);
        }

        const chartData = { labels, applied: appliedData, approved: approvedData };

        const stats = statusCounts[0] || {};

        res.json({
            success: true,
            stats: {
                pending: parseInt(stats.pending) || 0,
                forwarded: parseInt(stats.forwarded) || 0,
                approved: parseInt(stats.approved) || 0,
                on_leave_today: onLeaveToday[0]?.count || 0,
                absent_unregularized: parseInt(stats.absent_unregularized) || 0,
                returning_tomorrow: returningTomorrow[0]?.count || 0
            },
            chartData: chartData
        });

    } catch (error) {
        console.error('Error fetching leave dashboard:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/absenteeism-report - Get absenteeism analytics report
router.get('/absenteeism-report', async (req, res) => {
    let conn;
    try {
        const { period, office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Build date range based on period
        let dateCondition = '';
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        switch (period) {
            case 'this-month':
                const thisMonthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                dateCondition = `AND l.from_date >= '${thisMonthStart}'`;
                break;
            case 'last-month':
                const lastMonth = month === 0 ? 12 : month;
                const lastMonthYear = month === 0 ? year - 1 : year;
                const lastMonthStart = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-01`;
                const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0).toISOString().slice(0, 10);
                dateCondition = `AND l.from_date BETWEEN '${lastMonthStart}' AND '${lastMonthEnd}'`;
                break;
            case 'this-year':
                dateCondition = `AND l.from_date >= '${year}-01-01'`;
                break;
            case 'last-year':
                dateCondition = `AND l.from_date BETWEEN '${year - 1}-01-01' AND '${year - 1}-12-31'`;
                break;
            case 'all':
            default:
                dateCondition = '';
                break;
        }

        // Build office filter
        let officeCondition = '';
        let params = [];

        if (userRole !== 'division_admin') {
            officeCondition = 'AND l.office_code = ?';
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            officeCondition = 'AND l.office_code = ?';
            params.push(office_code);
        }

        // Query 1: Overall stats
        const [statsResult] = await conn.query(`
            SELECT
                SUM(l.days) as total_days,
                COUNT(*) as total_instances,
                COUNT(DISTINCT l.staff_hrms_id) as staff_affected,
                SUM(CASE WHEN l.is_regularized = 1 THEN 1 ELSE 0 END) as regularized_count
            FROM div_leave_tracking l
            WHERE l.status = 'Absent' ${dateCondition} ${officeCondition}
        `, params);

        const stats = statsResult[0] || {};
        const totalInstances = parseInt(stats.total_instances) || 0;
        const regularizedCount = parseInt(stats.regularized_count) || 0;
        const regularizationRate = totalInstances > 0 ? Math.round((regularizedCount / totalInstances) * 100) : 0;

        // Query 2: Top absentees by days
        const [topByDays] = await conn.query(`
            SELECT
                l.staff_hrms_id,
                s.name,
                s.current_cms_id,
                SUM(l.days) as total_days,
                COUNT(*) as instance_count
            FROM div_leave_tracking l
            JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
            WHERE l.status = 'Absent' ${dateCondition} ${officeCondition}
            GROUP BY l.staff_hrms_id, s.name, s.current_cms_id
            ORDER BY total_days DESC
            LIMIT 10
        `, params);

        // Query 3: Top absentees by instances (chronic)
        const [topByInstances] = await conn.query(`
            SELECT
                l.staff_hrms_id,
                s.name,
                s.current_cms_id,
                COUNT(*) as instance_count,
                SUM(l.days) as total_days
            FROM div_leave_tracking l
            JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
            WHERE l.status = 'Absent' ${dateCondition} ${officeCondition}
            GROUP BY l.staff_hrms_id, s.name, s.current_cms_id
            ORDER BY instance_count DESC, total_days DESC
            LIMIT 10
        `, params);

        // Query 4: Absence by designation
        const [byDesignation] = await conn.query(`
            SELECT
                d.designation_name,
                COUNT(DISTINCT l.staff_hrms_id) as staff_count,
                SUM(l.days) as total_days,
                ROUND(SUM(l.days) / COUNT(DISTINCT l.staff_hrms_id), 1) as avg_per_staff
            FROM div_leave_tracking l
            LEFT JOIN designations d ON l.designation_id = d.id
            WHERE l.status = 'Absent' ${dateCondition} ${officeCondition}
            GROUP BY l.designation_id, d.designation_name
            ORDER BY total_days DESC
        `, params);

        // Query 5: Unregularized absences
        const [unregularized] = await conn.query(`
            SELECT
                l.id,
                l.staff_hrms_id,
                l.from_date,
                l.to_date,
                l.days,
                s.name,
                s.current_cms_id
            FROM div_leave_tracking l
            JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
            WHERE l.status = 'Absent' AND l.is_regularized = 0 ${officeCondition}
            ORDER BY l.from_date DESC
            LIMIT 20
        `, params);

        conn.release();

        res.json({
            success: true,
            stats: {
                total_days: parseInt(stats.total_days) || 0,
                total_instances: totalInstances,
                staff_affected: parseInt(stats.staff_affected) || 0,
                regularization_rate: regularizationRate
            },
            top_by_days: topByDays,
            top_by_instances: topByInstances,
            by_designation: byDesignation,
            unregularized: unregularized
        });

    } catch (error) {
        console.error('Error fetching absenteeism report:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/kpi-list/:type - Get staff list for KPI card click
router.get('/kpi-list/:type', async (req, res) => {
    let conn;
    try {
        const { type } = req.params;
        const { office_code, from_date, to_date, designation_ids } = req.query;
        const { from: normFrom, to: normTo } = normalizeDateRange(from_date, to_date);
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Build office + date + designation filters (overlap)
        let officeCondition = '';
        let dateCondition = '';
        let designationCondition = '';
        let params = [];

        if (userRole !== 'division_admin') {
            officeCondition = 'AND l.office_code = ?';
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            officeCondition = 'AND l.office_code = ?';
            params.push(office_code);
        }

        // Designation filter - support comma-separated IDs for grouping
        if (designation_ids && designation_ids !== 'ALL') {
            const ids = designation_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (ids.length > 0) {
                designationCondition = `AND l.designation_id IN (${ids.map(() => '?').join(',')})`;
                params.push(...ids);
            }
        }

        if (normFrom && normTo) {
            dateCondition = 'AND DATE(l.from_date) <= DATE(?) AND DATE(l.to_date) >= DATE(?)';
            params.push(normTo, normFrom);
        } else if (normFrom) {
            dateCondition = 'AND DATE(l.to_date) >= DATE(?)';
            params.push(normFrom);
        } else if (normTo) {
            dateCondition = 'AND DATE(l.from_date) <= DATE(?)';
            params.push(normTo);
        }

        let query = '';
        switch (type) {
            case 'pending':
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Pending' ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY l.from_date ASC
                `;
                break;

            case 'forwarded':
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Forwarded' ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY l.from_date ASC
                `;
                break;

            case 'approved':
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Approved' ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY l.from_date DESC
                    LIMIT 50
                `;
                break;

            case 'on-leave-today':
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Approved'
                    AND CURDATE() BETWEEN DATE(l.from_date) AND DATE(l.to_date)
                    ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY s.name ASC
                `;
                break;

            case 'absent':
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Absent' AND l.is_regularized = 0
                    ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY l.from_date DESC
                `;
                break;

            case 'returning':
                // Staff whose leave ends today (returning tomorrow)
                query = `
                    SELECT l.*, s.name, s.current_cms_id, d.designation_name
                    FROM div_leave_tracking l
                    JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
                    LEFT JOIN designations d ON l.designation_id = d.id
                    WHERE l.status = 'Approved'
                    AND DATE(l.to_date) = CURDATE()
                    ${officeCondition} ${designationCondition} ${dateCondition}
                    ORDER BY s.name ASC
                `;
                break;

            default:
                conn.release();
                return res.status(400).json({ error: 'Invalid KPI type' });
        }

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            type: type,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error('Error fetching KPI list:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/top-designations - Get top 2 designations by staff count for an office
router.get('/top-designations', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Determine which office to query
        const targetOffice = (userRole === 'division_admin' && office_code) ? office_code : userOffice;

        let query, params;

        if (targetOffice) {
            // Get top designations by staff count for the office
            // Group Sr.ALP with ALP (1,2) and Sr.LPS with LPS (3,4)
            query = `
                SELECT
                    CASE
                        WHEN designation_id IN (1, 2) THEN 1
                        WHEN designation_id IN (3, 4) THEN 3
                        ELSE designation_id
                    END as designation_id,
                    SUM(staff_count) as total_count
                FROM (
                    SELECT designation_id, COUNT(*) as staff_count
                    FROM div_staff_master s
                    WHERE s.status = 'Active'
                    AND s.designation_id BETWEEN 1 AND 10
                    AND s.current_office_code = ?
                    GROUP BY designation_id
                ) grouped
                GROUP BY
                    CASE
                        WHEN designation_id IN (1, 2) THEN 1
                        WHEN designation_id IN (3, 4) THEN 3
                        ELSE designation_id
                    END
                ORDER BY total_count DESC
            `;
            params = [targetOffice];
        } else {
            // Division-wide top designations
            query = `
                SELECT
                    CASE
                        WHEN designation_id IN (1, 2) THEN 1
                        WHEN designation_id IN (3, 4) THEN 3
                        ELSE designation_id
                    END as designation_id,
                    SUM(staff_count) as total_count
                FROM (
                    SELECT designation_id, COUNT(*) as staff_count
                    FROM div_staff_master s
                    WHERE s.status = 'Active'
                    AND s.designation_id BETWEEN 1 AND 10
                    GROUP BY designation_id
                ) grouped
                GROUP BY
                    CASE
                        WHEN designation_id IN (1, 2) THEN 1
                        WHEN designation_id IN (3, 4) THEN 3
                        ELSE designation_id
                    END
                ORDER BY total_count DESC
            `;
            params = [];
        }

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching top designations:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/calendar/:year/:month - Get calendar data (leave counts by day)
router.get('/calendar/:year/:month', async (req, res) => {
    let conn;
    try {
        const { year, month } = req.params;
        const { status, designation_ids, office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Build conditions
        let conditions = [];
        let params = [];

        // Office filter
        if (userRole !== 'division_admin') {
            conditions.push('l.office_code = ?');
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            conditions.push('l.office_code = ?');
            params.push(office_code);
        }

        // Designation filter (comma-separated IDs)
        if (designation_ids) {
            const ids = designation_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                conditions.push(`l.designation_id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
        }

        // Status filter
        if (status === 'Applied') {
            // Applied = all non-rejected, non-cancelled
            conditions.push("l.status NOT IN ('Rejected', 'Cancelled')");
        } else if (status === 'Approved') {
            conditions.push("l.status = 'Approved'");
        } else if (status === 'Approved+Absent') {
            conditions.push("l.status IN ('Approved', 'Absent')");
        }

        const whereClause = conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '';

        // Get date range for the month
        const paddedMonth = month.toString().padStart(2, '0');
        const startDate = `${year}-${paddedMonth}-01`;
        const daysInMonth = new Date(year, parseInt(month), 0).getDate();
        const endDate = `${year}-${paddedMonth}-${daysInMonth.toString().padStart(2, '0')}`;

        // Simpler query: Get all leave entries that overlap with this month
        // Use DATE() to extract date strings and avoid timezone issues
        const [results] = await conn.query(`
            SELECT l.id, DATE(l.from_date) AS from_date_str, DATE(l.to_date) AS to_date_str
            FROM div_leave_tracking l
            WHERE DATE(l.from_date) <= ? AND DATE(l.to_date) >= ?
            ${whereClause}
        `, [endDate, startDate, ...params]);

        conn.release();

        // Calculate counts for each day programmatically
        const dailyCounts = {};
        for (let day = 1; day <= daysInMonth; day++) {
            dailyCounts[day] = 0;
        }

        // For each leave entry, increment the count for each day it spans
        results.forEach(leave => {
            // MySQL DATE() returns Date objects - use them directly
            // The dates are already in local timezone from MySQL
            const leaveStart = new Date(leave.from_date_str);
            const leaveEnd = new Date(leave.to_date_str);
            const monthStart = new Date(year, parseInt(month) - 1, 1);
            const monthEnd = new Date(year, parseInt(month) - 1, daysInMonth);

            // Find overlap between leave period and current month
            const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
            const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;

            // Increment count for each day in the overlap
            for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
                const day = d.getDate();
                if (day >= 1 && day <= daysInMonth) {
                    dailyCounts[day]++;
                }
            }
        });

        res.json({
            success: true,
            year: parseInt(year),
            month: parseInt(month),
            data: dailyCounts
        });

    } catch (error) {
        console.error('Error fetching calendar data:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/day-details/:date - Get list of staff on leave for a specific day
router.get('/day-details/:date', async (req, res) => {
    let conn;
    try {
        const { date } = req.params;
        const { status, designation_ids, office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Build conditions - use DATE() to handle timezone issues
        let conditions = ['? BETWEEN DATE(l.from_date) AND DATE(l.to_date)'];
        let params = [date];

        // Office filter
        if (userRole !== 'division_admin') {
            conditions.push('l.office_code = ?');
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            conditions.push('l.office_code = ?');
            params.push(office_code);
        }

        // Designation filter
        if (designation_ids) {
            const ids = designation_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                conditions.push(`l.designation_id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
        }

        // Status filter
        if (status === 'Applied') {
            conditions.push("l.status NOT IN ('Rejected', 'Cancelled')");
        } else if (status === 'Approved') {
            conditions.push("l.status = 'Approved'");
        } else if (status === 'Approved+Absent') {
            conditions.push("l.status IN ('Approved', 'Absent')");
        }

        const whereClause = 'WHERE ' + conditions.join(' AND ');

        const [results] = await conn.query(`
            SELECT
                l.id AS leave_id,
                l.staff_hrms_id,
                s.name,
                s.current_cms_id,
                d.designation_name,
                l.leave_type,
                l.from_date,
                l.to_date,
                l.days,
                l.status,
                l.is_regularized,
                l.reason,
                l.remarks
            FROM div_leave_tracking l
            JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
            LEFT JOIN designations d ON l.designation_id = d.id
            ${whereClause}
            ORDER BY s.name
        `, params);

        conn.release();

        res.json({
            success: true,
            date: date,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error('Error fetching day details:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/submitted - List submitted leaves (grouping-ready)
router.get('/submitted', async (req, res) => {
    let conn;
    try {
        const { from_date, to_date, status, designation_ids, office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        // Default to current month range if not provided
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const paddedMonth = month.toString().padStart(2, '0');
        const defaultFrom = from_date || `${year}-${paddedMonth}-01`;
        const defaultTo = to_date || `${year}-${paddedMonth}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;

        conn = await req.app.locals.pool.getConnection();

        let conditions = ['DATE(l.from_date) <= ?', 'DATE(l.to_date) >= ?'];
        let params = [defaultTo, defaultFrom];

        // Office filter
        if (userRole !== 'division_admin') {
            conditions.push('l.office_code = ?');
            params.push(userOffice);
        } else if (office_code && office_code !== 'ALL') {
            conditions.push('l.office_code = ?');
            params.push(office_code);
        }

        // Designation filter
        if (designation_ids) {
            const ids = designation_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                conditions.push(`l.designation_id IN (${ids.map(() => '?').join(',')})`);
                params.push(...ids);
            }
        }

        // Status filter
        if (status === 'ALL' || !status) {
            // Default view excludes Cancelled (user must explicitly filter to see)
            conditions.push("l.status != 'Cancelled'");
        } else if (status === 'Applied') {
            conditions.push("l.status NOT IN ('Rejected', 'Cancelled')");
        } else if (status === 'Approved+Absent') {
            conditions.push("l.status IN ('Approved', 'Absent')");
        } else if (status === 'Conflict') {
            // Show only approved leaves with duty conflict
            conditions.push("l.status = 'Approved'");
            conditions.push("l.remarks LIKE '%[CONFLICT:%'");
        } else {
            // Specific status filter (including 'Cancelled' when explicitly selected)
            conditions.push('l.status = ?');
            params.push(status);
        }

        const whereClause = 'WHERE ' + conditions.join(' AND ');

        const [results] = await conn.query(`
            SELECT
                l.id AS leave_id,
                l.staff_hrms_id,
                s.name,
                s.current_cms_id,
                l.from_date,
                l.to_date,
                l.days,
                l.status,
                l.designation_id,
                l.leave_type,
                l.reason,
                l.remarks,
                l.is_regularized,
                l.created_at,
                CASE WHEN l.remarks LIKE '%[CONFLICT:%' THEN 1 ELSE 0 END AS has_conflict
            FROM div_leave_tracking l
            JOIN div_staff_master s ON l.staff_hrms_id = s.hrms_id
            ${whereClause}
            ORDER BY l.designation_id, l.from_date
        `, params);

        conn.release();

        res.json({
            success: true,
            from_date: defaultFrom,
            to_date: defaultTo,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error('Error fetching submitted leaves:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/leave/:id - Update leave entry (approve, reject, regularize, etc.)
router.put('/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { status, is_regularized, remarks, approved_by, to_date, days, leave_type } = req.body;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Get current leave entry (for status history and office validation)
        const [currentLeave] = await conn.query(
            'SELECT status, office_code FROM div_leave_tracking WHERE id = ?',
            [id]
        );

        if (currentLeave.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Leave entry not found' });
        }

        // Office authorization check - non-admin can only update their office's entries
        if (userRole !== 'division_admin' && currentLeave[0].office_code !== userOffice) {
            conn.release();
            return res.status(403).json({ error: 'Not authorized to update this leave entry' });
        }

        // Get current status before update (for history logging)
        let oldStatus = currentLeave[0].status;

        // Build update fields
        let updates = [];
        let params = [];

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (is_regularized !== undefined) {
            updates.push('is_regularized = ?');
            params.push(is_regularized ? 1 : 0);
        }
        if (remarks !== undefined) {
            updates.push('remarks = ?');
            params.push(remarks);
        }
        if (approved_by !== undefined) {
            updates.push('approved_by = ?');
            params.push(approved_by);
        }
        if (to_date !== undefined) {
            updates.push('to_date = ?');
            params.push(formatDateForDB(to_date));
        }
        if (req.body.from_date !== undefined) {
            updates.push('from_date = ?');
            params.push(formatDateForDB(req.body.from_date));
        }
        if (days !== undefined) {
            updates.push('days = ?');
            params.push(days);
        }
        if (leave_type !== undefined) {
            updates.push('leave_type = ?');
            params.push(leave_type);
        }
        if (req.body.reason !== undefined) {
            updates.push('reason = ?');
            params.push(req.body.reason);
        }

        if (updates.length === 0) {
            conn.release();
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        const [result] = await conn.query(
            `UPDATE div_leave_tracking SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            conn.release();
            return res.status(404).json({ error: 'Leave entry not found' });
        }

        // Log status change in history if status was updated
        if (status !== undefined && oldStatus !== null && oldStatus !== status) {
            const changedBy = req.session.user?.name || req.session.user?.username || 'System';
            await conn.query(
                `INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
                 VALUES (?, ?, ?, ?)`,
                [id, oldStatus, status, changedBy]
            );
        }

        conn.release();

        res.json({
            success: true,
            message: 'Leave entry updated successfully'
        });

    } catch (error) {
        console.error('Error updating leave entry:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/leave/:id/history - Get status change history for a leave
router.get('/:id/history', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;

        conn = await req.app.locals.pool.getConnection();

        const [history] = await conn.query(
            `SELECT
                h.id,
                h.old_status,
                h.new_status,
                h.changed_by,
                DATE_FORMAT(h.changed_at, '%d-%m-%Y %H:%i') as changed_at_formatted,
                h.changed_at,
                h.remarks
             FROM div_leave_status_history h
             WHERE h.leave_id = ?
             ORDER BY h.changed_at ASC`,
            [id]
        );

        conn.release();

        res.json({
            success: true,
            leave_id: id,
            history: history
        });

    } catch (error) {
        console.error('Error fetching leave history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/leave/:id/regularize - Regularize absent entry (supports partial with date selection)
router.post('/:id/regularize', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { leave_type, reg_from_date, reg_to_date, days_to_regularize, total_days, orig_from_date, orig_to_date, remarks, approved_by } = req.body;

        if (!leave_type || !reg_from_date || !reg_to_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Format dates to avoid timezone shift
        const formattedRegFromDate = formatDateForDB(reg_from_date);
        const formattedRegToDate = formatDateForDB(reg_to_date);
        const formattedOrigFromDate = formatDateForDB(orig_from_date);
        const formattedOrigToDate = formatDateForDB(orig_to_date);

        conn = await req.app.locals.pool.getConnection();

        // Get the original absent record
        const [original] = await conn.query(
            'SELECT * FROM div_leave_tracking WHERE id = ? AND status = "Absent"',
            [id]
        );

        if (original.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Absent entry not found' });
        }

        const absentRecord = original[0];

        // Check if full regularization (selected dates cover entire absent period)
        const isFullRegularization = (formattedRegFromDate === formattedOrigFromDate && formattedRegToDate === formattedOrigToDate);

        if (isFullRegularization) {
            // Full regularization - just update the existing record
            await conn.query(
                `UPDATE div_leave_tracking SET
                    leave_type = ?,
                    status = 'Approved',
                    is_regularized = 1,
                    remarks = ?,
                    approved_by = ?
                WHERE id = ?`,
                [leave_type, remarks, approved_by, id]
            );

            conn.release();
            return res.json({
                success: true,
                message: 'Absence fully regularized'
            });
        }

        // Partial regularization - need to handle different scenarios
        const hasAbsentBefore = formattedRegFromDate > formattedOrigFromDate;
        const hasAbsentAfter = formattedRegToDate < formattedOrigToDate;

        // Helper to calculate days between dates
        const daysBetween = (start, end) => {
            const s = new Date(start);
            const e = new Date(end);
            return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        };

        // Helper to add days to date (using local date to avoid timezone shift)
        const addDays = (dateStr, days) => {
            const d = new Date(dateStr + 'T00:00:00'); // Parse as local midnight
            d.setDate(d.getDate() + days);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        if (hasAbsentBefore && hasAbsentAfter) {
            // Regularizing middle portion: Absent-Before | Regularized | Absent-After
            // Update original record for "before" portion
            const beforeToDate = addDays(formattedRegFromDate, -1);
            const beforeDays = daysBetween(formattedOrigFromDate, beforeToDate);

            await conn.query(
                `UPDATE div_leave_tracking SET
                    to_date = ?,
                    days = ?,
                    remarks = CONCAT(IFNULL(remarks, ''), ' | Partial: middle portion regularized')
                WHERE id = ?`,
                [beforeToDate, beforeDays, id]
            );

            // Create record for regularized portion
            await conn.query(
                `INSERT INTO div_leave_tracking
                 (staff_hrms_id, leave_type, from_date, to_date, days, office_code, designation_id, reason, remarks, status, is_regularized, approved_by, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', 1, ?, NOW())`,
                [absentRecord.staff_hrms_id, leave_type, formattedRegFromDate, formattedRegToDate, days_to_regularize,
                 absentRecord.office_code, absentRecord.designation_id, absentRecord.reason, remarks, approved_by]
            );

            // Create record for "after" portion (still absent)
            const afterFromDate = addDays(formattedRegToDate, 1);
            const afterDays = daysBetween(afterFromDate, formattedOrigToDate);

            await conn.query(
                `INSERT INTO div_leave_tracking
                 (staff_hrms_id, leave_type, from_date, to_date, days, office_code, designation_id, reason, remarks, status, is_regularized, created_at)
                 VALUES (?, 'Unknown', ?, ?, ?, ?, ?, ?, 'Remaining absent after partial regularization', 'Absent', 0, NOW())`,
                [absentRecord.staff_hrms_id, afterFromDate, formattedOrigToDate, afterDays,
                 absentRecord.office_code, absentRecord.designation_id, absentRecord.reason]
            );

        } else if (hasAbsentBefore) {
            // Regularizing end portion: Absent-Before | Regularized
            const beforeToDate = addDays(formattedRegFromDate, -1);
            const beforeDays = daysBetween(formattedOrigFromDate, beforeToDate);

            // Update original for "before" portion
            await conn.query(
                `UPDATE div_leave_tracking SET
                    to_date = ?,
                    days = ?,
                    remarks = CONCAT(IFNULL(remarks, ''), ' | Partial: end portion regularized')
                WHERE id = ?`,
                [beforeToDate, beforeDays, id]
            );

            // Create record for regularized portion
            await conn.query(
                `INSERT INTO div_leave_tracking
                 (staff_hrms_id, leave_type, from_date, to_date, days, office_code, designation_id, reason, remarks, status, is_regularized, approved_by, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', 1, ?, NOW())`,
                [absentRecord.staff_hrms_id, leave_type, formattedRegFromDate, formattedRegToDate, days_to_regularize,
                 absentRecord.office_code, absentRecord.designation_id, absentRecord.reason, remarks, approved_by]
            );

        } else if (hasAbsentAfter) {
            // Regularizing start portion: Regularized | Absent-After
            // Update original record to be the regularized portion
            await conn.query(
                `UPDATE div_leave_tracking SET
                    leave_type = ?,
                    to_date = ?,
                    days = ?,
                    status = 'Approved',
                    is_regularized = 1,
                    remarks = ?,
                    approved_by = ?
                WHERE id = ?`,
                [leave_type, formattedRegToDate, days_to_regularize, remarks, approved_by, id]
            );

            // Create record for "after" portion (still absent)
            const afterFromDate = addDays(formattedRegToDate, 1);
            const afterDays = daysBetween(afterFromDate, formattedOrigToDate);

            await conn.query(
                `INSERT INTO div_leave_tracking
                 (staff_hrms_id, leave_type, from_date, to_date, days, office_code, designation_id, reason, remarks, status, is_regularized, created_at)
                 VALUES (?, 'Unknown', ?, ?, ?, ?, ?, ?, 'Remaining absent after partial regularization', 'Absent', 0, NOW())`,
                [absentRecord.staff_hrms_id, afterFromDate, formattedOrigToDate, afterDays,
                 absentRecord.office_code, absentRecord.designation_id, absentRecord.reason]
            );
        }

        conn.release();

        const remainingDays = total_days - days_to_regularize;
        res.json({
            success: true,
            message: `${days_to_regularize} days regularized as ${leave_type}, ${remainingDays} days remain absent`
        });

    } catch (error) {
        console.error('Error regularizing absence:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// DELETE /api/division/leave/:id - Delete leave entry
router.delete('/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Get leave entry for office validation
        const [leaveEntry] = await conn.query(
            'SELECT office_code FROM div_leave_tracking WHERE id = ?',
            [id]
        );

        if (leaveEntry.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Leave entry not found' });
        }

        // Office authorization check - non-admin can only delete their office's entries
        if (userRole !== 'division_admin' && leaveEntry[0].office_code !== userOffice) {
            conn.release();
            return res.status(403).json({ error: 'Not authorized to delete this leave entry' });
        }

        const [result] = await conn.query(
            'DELETE FROM div_leave_tracking WHERE id = ?',
            [id]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Leave entry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting leave entry:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
