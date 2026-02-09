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

// Calculate retirement date from DOB
// Rule: Retirement at 60, last day of birth month
// Exception: If born on 1st, retirement is last day of previous month
function calculateRetirementDate(dob) {
    const birthDate = new Date(dob);
    const birthDay = birthDate.getDate();
    const birthMonth = birthDate.getMonth();
    const birthYear = birthDate.getFullYear();

    let retirementYear = birthYear + 60;
    let retirementMonth;

    if (birthDay === 1) {
        retirementMonth = birthMonth - 1;
        if (retirementMonth < 0) {
            retirementMonth = 11;
            retirementYear--;
        }
    } else {
        retirementMonth = birthMonth;
    }

    const retirementDate = new Date(retirementYear, retirementMonth + 1, 0);
    return retirementDate;
}

// GET /api/division/retirement/stats - Get retirement statistics
router.get('/stats', async (req, res) => {
    let conn;
    try {
        const { office_code } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Get all active staff with DOB for calculating upcoming retirements
        // Exclude transferred staff and those in 'OTHER' office (Other Railway/Transferred Out)
        let staffQuery = `
            SELECT s.hrms_id, s.date_of_birth
            FROM div_staff_master s
            WHERE s.status = 'Active'
              AND s.date_of_birth IS NOT NULL
              AND (s.assignment_status IS NULL OR s.assignment_status != 'transferred')
              AND (s.current_office_code IS NULL OR s.current_office_code != 'OTHER')
        `;
        const staffParams = [];

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            staffQuery += ' AND ' + filter.condition;
            staffParams.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            staffQuery += ' AND ' + filter.condition;
            staffParams.push(...filter.params);
        }

        const [staff] = await conn.query(staffQuery, staffParams);

        // Calculate retirement stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let retiringThisMonth = 0;
        let retiringThisYear = 0;
        let overdueCount = 0;

        staff.forEach(s => {
            const retDate = calculateRetirementDate(s.date_of_birth);
            const retMonth = retDate.getMonth();
            const retYear = retDate.getFullYear();

            if (retDate < now) {
                overdueCount++;
            } else if (retYear === currentYear && retMonth === currentMonth) {
                retiringThisMonth++;
            }
            if (retYear === currentYear) {
                retiringThisYear++;
            }
        });

        // Get VRS count for current year
        let vrsQuery = `
            SELECT COUNT(*) as vrs_count
            FROM div_staff_master s
            WHERE s.status = 'Retired'
            AND s.retirement_type = 'VRS'
            AND YEAR(s.retirement_date) = ?
        `;
        const vrsParams = [currentYear];

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            vrsQuery += ' AND ' + filter.condition;
            vrsParams.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            vrsQuery += ' AND ' + filter.condition;
            vrsParams.push(...filter.params);
        }

        let vrsCount = 0;
        try {
            const [vrsResult] = await conn.query(vrsQuery, vrsParams);
            vrsCount = vrsResult[0].vrs_count || 0;
        } catch (e) {
            // Column might not exist yet
        }

        // Get YTD separations (total retired this year)
        let sepQuery = `
            SELECT COUNT(*) as count
            FROM div_staff_master s
            WHERE s.status = 'Retired'
            AND YEAR(COALESCE(s.retirement_date, s.updated_at)) = ?
        `;
        const sepParams = [currentYear];

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            sepQuery += ' AND ' + filter.condition;
            sepParams.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            sepQuery += ' AND ' + filter.condition;
            sepParams.push(...filter.params);
        }

        const [sepResult] = await conn.query(sepQuery, sepParams);
        const ytdSeparation = sepResult[0].count || 0;

        conn.release();

        res.json({
            success: true,
            data: {
                retiringThisMonth,
                retiringThisYear,
                overdueCount,
                currentMonth: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
                vrsCount,
                ytdSeparation
            }
        });

    } catch (error) {
        console.error('Error fetching retirement stats:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/retirement/upcoming - Get upcoming retirements list
router.get('/upcoming', async (req, res) => {
    let conn;
    try {
        const { office_code, months = 3 } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Exclude transferred staff and those in 'OTHER' office (Other Railway/Transferred Out)
        let query = `
            SELECT s.hrms_id, s.name, s.date_of_birth, s.current_cms_id,
                   s.current_office_code, o.office_name, d.designation_name
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Active'
              AND s.date_of_birth IS NOT NULL
              AND (s.assignment_status IS NULL OR s.assignment_status != 'transferred')
              AND (s.current_office_code IS NULL OR s.current_office_code != 'OTHER')
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

        query += ' ORDER BY s.date_of_birth';

        const [staff] = await conn.query(query, params);

        // Filter to those retiring within specified months (includes overdue)
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() + parseInt(months));

        const upcomingRetirements = staff
            .map(s => {
                const retDate = calculateRetirementDate(s.date_of_birth);
                const isOverdue = retDate < now;
                return {
                    ...s,
                    retirement_date: retDate.toISOString().split('T')[0],
                    formatted_retirement_date: retDate.toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    }),
                    is_overdue: isOverdue
                };
            })
            .filter(s => {
                const retDate = new Date(s.retirement_date);
                // Include overdue (past dates) + upcoming within cutoff
                return retDate <= cutoffDate;
            })
            .sort((a, b) => new Date(a.retirement_date) - new Date(b.retirement_date));

        conn.release();

        res.json({
            success: true,
            data: upcomingRetirements,
            count: upcomingRetirements.length
        });

    } catch (error) {
        console.error('Error fetching upcoming retirements:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/retirement/yearly-forecast - Get monthly breakdown for the year
router.get('/yearly-forecast', async (req, res) => {
    let conn;
    try {
        const { office_code, year } = req.query;
        const targetYear = parseInt(year) || new Date().getFullYear();
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Exclude transferred staff and those in 'OTHER' office (Other Railway/Transferred Out)
        let query = `
            SELECT s.hrms_id, s.date_of_birth, s.designation_id, d.designation_name
            FROM div_staff_master s
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Active'
              AND s.date_of_birth IS NOT NULL
              AND (s.assignment_status IS NULL OR s.assignment_status != 'transferred')
              AND (s.current_office_code IS NULL OR s.current_office_code != 'OTHER')
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

        const [staff] = await conn.query(query, params);

        // Calculate monthly forecast
        const monthlyForecast = Array(12).fill(0);
        const designationBreakdown = {};

        staff.forEach(s => {
            const retDate = calculateRetirementDate(s.date_of_birth);
            if (retDate.getFullYear() === targetYear) {
                monthlyForecast[retDate.getMonth()]++;

                const desig = s.designation_name || 'Unknown';
                designationBreakdown[desig] = (designationBreakdown[desig] || 0) + 1;
            }
        });

        conn.release();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = months.map((month, idx) => ({
            month,
            count: monthlyForecast[idx]
        }));

        res.json({
            success: true,
            data: {
                year: targetYear,
                monthly: chartData,
                byDesignation: designationBreakdown,
                total: monthlyForecast.reduce((a, b) => a + b, 0)
            }
        });

    } catch (error) {
        console.error('Error fetching yearly forecast:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/retirement/vrs-list - Get list of VRS retired staff
router.get('/vrs-list', async (req, res) => {
    let conn;
    try {
        const { office_code, year } = req.query;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        let query = `
            SELECT s.hrms_id, s.name, s.current_cms_id, s.retirement_date,
                   o.office_name, d.designation_name
            FROM div_staff_master s
            LEFT JOIN offices o ON s.current_office_code = o.office_code
            LEFT JOIN designations d ON s.designation_id = d.id
            WHERE s.status = 'Retired' AND s.retirement_type = 'VRS'
        `;
        const params = [];

        if (year) {
            query += ' AND YEAR(s.retirement_date) = ?';
            params.push(parseInt(year));
        }

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        }

        query += ' ORDER BY s.retirement_date DESC';

        const [results] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error fetching VRS list:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/retirement/retire - Mark staff as retired
router.post('/retire', async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            retirement_date,
            retirement_type
        } = req.body;

        // Validation
        if (!staff_hrms_id || !retirement_date || !retirement_type) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, retirement_date, retirement_type'
            });
        }

        if (!['Superannuation', 'VRS'].includes(retirement_type)) {
            return res.status(400).json({
                error: 'Invalid retirement_type. Must be Superannuation or VRS'
            });
        }

        conn = await req.app.locals.pool.getConnection();

        // Check if staff exists and is active
        const [staffCheck] = await conn.query(
            'SELECT hrms_id, status, current_cli_id FROM div_staff_master WHERE hrms_id = ?',
            [staff_hrms_id]
        );

        if (staffCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Staff not found' });
        }

        if (staffCheck[0].status === 'Retired') {
            conn.release();
            return res.status(400).json({ error: 'Staff is already retired' });
        }

        // Update staff status
        await conn.query(
            `UPDATE div_staff_master
             SET status = 'Retired', retirement_date = ?, retirement_type = ?, updated_at = NOW()
             WHERE hrms_id = ?`,
            [retirement_date, retirement_type, staff_hrms_id]
        );

        // End any active CLI nomination (use 'Expired' as per enum values)
        await conn.query(
            `UPDATE div_cli_nominations
             SET status = 'Expired', nominated_to_date = ?
             WHERE staff_hrms_id = ? AND status = 'Active'`,
            [retirement_date, staff_hrms_id]
        );

        conn.release();

        res.json({
            success: true,
            message: `Staff marked as ${retirement_type} retired successfully`
        });

    } catch (error) {
        console.error('Error retiring staff:', error.message);
        console.error('Full error:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/retirement/history - Get historical retirement data
router.get('/history', async (req, res) => {
    let conn;
    try {
        const { office_code, year } = req.query;
        const targetYear = parseInt(year) || new Date().getFullYear() - 1;
        const userOffice = req.session.user?.div_office_code;
        const userRole = req.session.user?.div_role;

        conn = await req.app.locals.pool.getConnection();

        // Get retired staff for the year
        let query = `
            SELECT
                COUNT(*) as total_retired,
                SUM(CASE WHEN retirement_type = 'VRS' THEN 1 ELSE 0 END) as vrs_count,
                SUM(CASE WHEN retirement_type = 'Superannuation' OR retirement_type IS NULL THEN 1 ELSE 0 END) as superannuation_count
            FROM div_staff_master s
            WHERE s.status = 'Retired'
            AND YEAR(COALESCE(s.retirement_date, s.updated_at)) = ?
        `;
        const params = [targetYear];

        if (userRole !== 'division_admin') {
            const filter = buildOfficeFilter(userOffice, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        } else if (office_code && office_code !== 'ALL') {
            const filter = buildOfficeFilter(office_code, 's');
            query += ' AND ' + filter.condition;
            params.push(...filter.params);
        }

        const [result] = await conn.query(query, params);
        conn.release();

        res.json({
            success: true,
            data: {
                year: targetYear,
                totalRetired: result[0].total_retired || 0,
                superannuation: result[0].superannuation_count || 0,
                vrs: result[0].vrs_count || 0
            }
        });

    } catch (error) {
        console.error('Error fetching retirement history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
