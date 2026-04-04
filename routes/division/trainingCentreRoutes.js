const express = require('express');
const router = express.Router();

// Middleware to get database connection
async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

// Course type → batch code prefix
const COURSE_TYPE_PREFIX = {
    'REFRESHER': 'MMRC',
    'PROMOTION': 'MMPC',
    'ONE_DAY_INTENSIVE': 'MMOD',
    'MEMU_INITIAL': 'MMMI',
    'MEMU_REFRESHER': 'MMMR'
};

// Course type → training_id in div_training_types
const COURSE_TYPE_TRAINING_ID = {
    'REFRESHER': 26,
    'PROMOTION': 26,
    'ONE_DAY_INTENSIVE': 5,
    'MEMU_INITIAL': 17,
    'MEMU_REFRESHER': 17
};

// Course type labels
const COURSE_LABELS = {
    'REFRESHER': 'Refresher Course',
    'PROMOTION': 'Promotion Course',
    'ONE_DAY_INTENSIVE': 'One Day Intensive',
    'MEMU_INITIAL': 'MEMU Initial',
    'MEMU_REFRESHER': 'MEMU Refresher',
    'OTHERS': 'Others'
};

// Middleware: require centre access (trgcentre_admin or division_admin)
const requireCentreAccess = (req, res, next) => {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const role = req.session.user.div_role;
    if (role !== 'trgcentre_admin' && role !== 'division_admin') {
        return res.status(403).json({ error: 'Access denied. Training centre role required.' });
    }
    next();
};

// Helper: get centre id from session or query param (for admin)
function getCentreId(req) {
    if (req.session.user.div_role === 'division_admin') {
        return req.query.center_id ? parseInt(req.query.center_id) : null;
    }
    return req.session.user.training_center_id;
}

// Apply middleware to all routes
router.use(requireCentreAccess);

// ============================================================
// GET /config - Centre info and user config
// ============================================================
router.get('/config', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);

        let centre = null;
        if (centreId) {
            const [[row]] = await conn.query(
                'SELECT center_id, center_code, center_name, location, center_type FROM div_training_centers WHERE center_id = ?',
                [centreId]
            );
            centre = row || null;
        }

        // If division_admin, get all centres
        let allCentres = [];
        if (req.session.user.div_role === 'division_admin') {
            const [rows] = await conn.query(
                "SELECT center_id, center_code, center_name, location, center_type FROM div_training_centers WHERE center_type IN ('MTC','DTC') AND is_active = 1 ORDER BY FIELD(center_code,'MTC_CLA','MTC_KYN','DTC_KYN'), center_name"
            );
            allCentres = rows;
        }

        res.json({
            user: {
                username: req.session.user.username,
                fullName: req.session.user.full_name,
                divRole: req.session.user.div_role,
                centreId: centreId
            },
            centre,
            allCentres,
            courseTypes: Object.entries(COURSE_LABELS).map(([code, label]) => ({ code, label })),
            batchPrefixes: COURSE_TYPE_PREFIX
        });
    } catch (error) {
        console.error('Error getting centre config:', error);
        res.status(500).json({ error: 'Failed to get config' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// GET /dashboard-stats - Stats for dashboard cards
// ============================================================
router.get('/dashboard-stats', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.json({
            pending: 0, attendanceToday: 0, upcomingSlots: 0,
            completedMonth: { total: 0, breakup: {} },
            traineesMonth: { total: 0, breakup: {} }
        });

        // Pending letters (sent but attendance not confirmed)
        const [[{ pending }]] = await conn.query(
            "SELECT COUNT(*) AS pending FROM div_training_letters WHERE training_center_id = ? AND status = 'sent'",
            [centreId]
        );

        // Attendance due today
        const [[{ attendanceToday }]] = await conn.query(
            "SELECT COUNT(*) AS attendanceToday FROM div_training_letters WHERE training_center_id = ? AND status = 'sent' AND training_date <= CURDATE()",
            [centreId]
        );

        // Completed batches this month - breakup by course type
        const [completedRows] = await conn.query(
            `SELECT course_type, COUNT(*) AS cnt
             FROM div_training_letters
             WHERE training_center_id = ? AND status = 'completed'
               AND YEAR(completed_at) = YEAR(CURDATE()) AND MONTH(completed_at) = MONTH(CURDATE())
             GROUP BY course_type`,
            [centreId]
        );
        const completedBreakup = {};
        let completedTotal = 0;
        for (const row of completedRows) {
            const prefix = COURSE_TYPE_PREFIX[row.course_type] || row.course_type;
            completedBreakup[prefix] = row.cnt;
            completedTotal += row.cnt;
        }

        // Trainees completed this month - count DISTINCT staff with completion_status='completed'
        const [traineeRows] = await conn.query(
            `SELECT tl.course_type, COUNT(DISTINCT tls.staff_hrms_id) AS cnt
             FROM div_training_letter_staff tls
             JOIN div_training_letters tl ON tl.id = tls.letter_id
             WHERE tl.training_center_id = ? AND tls.completion_status = 'completed'
               AND YEAR(tl.completed_at) = YEAR(CURDATE()) AND MONTH(tl.completed_at) = MONTH(CURDATE())
             GROUP BY tl.course_type`,
            [centreId]
        );
        const traineesBreakup = {};
        let traineesTotal = 0;
        for (const row of traineeRows) {
            const prefix = COURSE_TYPE_PREFIX[row.course_type] || row.course_type;
            traineesBreakup[prefix] = row.cnt;
            traineesTotal += row.cnt;
        }

        // Upcoming calendar slots
        const [[{ upcomingSlots }]] = await conn.query(
            "SELECT COUNT(*) AS upcomingSlots FROM div_training_calendar WHERE training_center_id = ? AND status = 'planned' AND from_date >= CURDATE()",
            [centreId]
        );

        res.json({
            pending, attendanceToday, upcomingSlots,
            completedMonth: { total: completedTotal, breakup: completedBreakup },
            traineesMonth: { total: traineesTotal, breakup: traineesBreakup }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// GET /incoming-letters - Letters sent to this centre
// ============================================================
router.get('/incoming-letters', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.json({ data: [] });

        const { status, course_type, office_code } = req.query;

        let query = `
            SELECT
                tl.*,
                (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id) AS staff_count
            FROM div_training_letters tl
            WHERE tl.training_center_id = ?
        `;
        const params = [centreId];

        if (status) {
            query += ' AND tl.status = ?';
            params.push(status);
        }
        if (course_type) {
            query += ' AND tl.course_type = ?';
            params.push(course_type);
        }
        if (office_code) {
            query += ' AND tl.office_code = ?';
            params.push(office_code);
        }

        query += ' ORDER BY tl.training_date DESC, tl.id DESC LIMIT 100';

        const [letters] = await conn.query(query, params);
        res.json({ data: letters });
    } catch (error) {
        console.error('Error fetching incoming letters:', error);
        res.status(500).json({ error: 'Failed to fetch letters' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// GET /letter/:id - Single letter with staff details
// ============================================================
router.get('/letter/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { id } = req.params;

        const [[letter]] = await conn.query('SELECT * FROM div_training_letters WHERE id = ?', [id]);
        if (!letter) return res.status(404).json({ error: 'Letter not found' });

        const [staff] = await conn.query(`
            SELECT
                tls.id,
                tls.sr_no,
                tls.staff_hrms_id,
                tls.remarks,
                tls.attendance_status,
                tls.attendance_marked_at,
                tls.completion_status,
                tls.completion_date,
                tls.completion_marked_at,
                tls.completion_remarks,
                sm.name AS staff_name,
                sm.current_cms_id,
                sm.hrms_id,
                sm.pf_number,
                d.designation_name,
                sm.current_office_code AS depot,
                cli.cli_name
            FROM div_training_letter_staff tls
            JOIN div_staff_master sm ON sm.hrms_id = tls.staff_hrms_id
            LEFT JOIN designations d ON d.id = sm.designation_id
            LEFT JOIN div_cli_master cli ON cli.cli_id = sm.current_cli_id
            WHERE tls.letter_id = ?
            ORDER BY tls.sr_no
        `, [id]);

        res.json({ data: { letter, staff } });
    } catch (error) {
        console.error('Error fetching letter detail:', error);
        res.status(500).json({ error: 'Failed to fetch letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// POST /mark-attendance - Mark attendance for a letter
// ============================================================
router.post('/mark-attendance', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { letter_id, attendance } = req.body;
        const centreId = getCentreId(req);

        if (!letter_id || !attendance || !Array.isArray(attendance)) {
            return res.status(400).json({ error: 'Missing letter_id or attendance array' });
        }

        // Verify letter exists and belongs to this centre
        const [[letter]] = await conn.query('SELECT * FROM div_training_letters WHERE id = ?', [letter_id]);
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (letter.training_center_id && letter.training_center_id !== centreId) {
            return res.status(403).json({ error: 'Letter does not belong to this centre' });
        }

        await conn.beginTransaction();

        // Update each staff's attendance
        for (const item of attendance) {
            await conn.query(`
                UPDATE div_training_letter_staff
                SET attendance_status = ?, attendance_marked_at = NOW()
                WHERE letter_id = ? AND staff_hrms_id = ?
            `, [item.status, letter_id, item.staff_hrms_id]);
        }

        // Update letter status and set centre if not set
        await conn.query(`
            UPDATE div_training_letters
            SET status = 'attendance_confirmed',
                attendance_confirmed_at = NOW(),
                training_center_id = COALESCE(training_center_id, ?)
            WHERE id = ?
        `, [centreId, letter_id]);

        await conn.commit();

        const presentCount = attendance.filter(a => a.status === 'present').length;
        const absentCount = attendance.filter(a => a.status === 'absent').length;

        res.json({
            success: true,
            message: `Attendance confirmed: ${presentCount} present, ${absentCount} absent`,
            presentCount,
            absentCount
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// POST /mark-completion - Mark completion for a letter batch
// ============================================================
router.post('/mark-completion', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { letter_id, completion_date, completions } = req.body;
        const centreId = getCentreId(req);

        if (!letter_id || !completion_date || !completions || !Array.isArray(completions)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify letter
        const [[letter]] = await conn.query('SELECT * FROM div_training_letters WHERE id = ?', [letter_id]);
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (letter.training_center_id && letter.training_center_id !== centreId) {
            return res.status(403).json({ error: 'Letter does not belong to this centre' });
        }

        const trainingId = COURSE_TYPE_TRAINING_ID[letter.course_type] || null;

        await conn.beginTransaction();

        let completedCount = 0;
        let notCompletedCount = 0;

        for (const item of completions) {
            // Update staff completion status
            await conn.query(`
                UPDATE div_training_letter_staff
                SET completion_status = ?,
                    completion_date = ?,
                    completion_marked_at = NOW(),
                    completion_remarks = ?
                WHERE letter_id = ? AND staff_hrms_id = ?
            `, [item.status, completion_date, item.remarks || null, letter_id, item.staff_hrms_id]);

            if (item.status === 'completed') {
                completedCount++;

                // Update div_training_records ONLY if course type has a training_id
                // OTHERS type does NOT update training records
                if (trainingId && letter.course_type !== 'OTHERS') {
                    // Check if a record already exists for this staff + training_id on this date
                    const [[existing]] = await conn.query(
                        'SELECT record_id FROM div_training_records WHERE staff_hrms_id = ? AND training_id = ? AND done_date = ?',
                        [item.staff_hrms_id, trainingId, completion_date]
                    );

                    if (!existing) {
                        // Calculate due_date based on course type validity
                        // ONE_DAY_INTENSIVE (AUTOMATIC/5): 6 months
                        // REFRESHER, PROMOTION (MMPRC/26): 3 years
                        // MEMU_INITIAL, MEMU_REFRESHER (MEMU/17): 3 years
                        let dueDateExpr;
                        if (letter.course_type === 'ONE_DAY_INTENSIVE') {
                            // 6 months validity: due = done_date + 6 months - 1 day
                            dueDateExpr = 'DATE_SUB(DATE_ADD(?, INTERVAL 6 MONTH), INTERVAL 1 DAY)';
                        } else {
                            // 3 years validity: due = done_date + 3 years - 1 day
                            dueDateExpr = 'DATE_SUB(DATE_ADD(?, INTERVAL 3 YEAR), INTERVAL 1 DAY)';
                        }

                        await conn.query(`
                            INSERT INTO div_training_records
                                (staff_hrms_id, training_id, done_date, due_date, training_center_id, status)
                            VALUES (?, ?, ?, ${dueDateExpr}, ?, 'Completed')
                        `, [item.staff_hrms_id, trainingId, completion_date, completion_date, centreId]);
                    }
                }
            } else {
                notCompletedCount++;
            }
        }

        // Update letter status
        await conn.query(`
            UPDATE div_training_letters
            SET status = 'completed', completed_at = NOW()
            WHERE id = ?
        `, [letter_id]);

        await conn.commit();

        res.json({
            success: true,
            message: `Completion recorded: ${completedCount} completed, ${notCompletedCount} not completed`,
            completedCount,
            notCompletedCount
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error marking completion:', error);
        res.status(500).json({ error: 'Failed to mark completion' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// GET /calendar - Get calendar slots for this centre
// ============================================================
router.get('/calendar', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.json({ data: [] });

        const { course_type, month, year, status } = req.query;

        let query = `
            SELECT cal.*, tt.training_name, tt.training_code
            FROM div_training_calendar cal
            LEFT JOIN div_training_types tt ON tt.training_id = cal.training_id
            WHERE cal.training_center_id = ?
        `;
        const params = [centreId];

        if (course_type) {
            query += ' AND cal.course_type = ?';
            params.push(course_type);
        }
        if (month && year) {
            query += ' AND YEAR(cal.from_date) = ? AND MONTH(cal.from_date) = ?';
            params.push(parseInt(year), parseInt(month));
        } else if (year) {
            query += ' AND YEAR(cal.from_date) = ?';
            params.push(parseInt(year));
        }
        if (status) {
            query += ' AND cal.status = ?';
            params.push(status);
        }

        query += ' ORDER BY cal.from_date DESC';

        const [slots] = await conn.query(query, params);
        res.json({ data: slots });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        res.status(500).json({ error: 'Failed to fetch calendar' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// POST /calendar - Create a new calendar slot (auto-generate batch code)
// ============================================================
router.post('/calendar', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.status(400).json({ error: 'No centre assigned' });

        const { course_type, from_date, remarks } = req.body;

        if (!course_type || !from_date) {
            return res.status(400).json({ error: 'course_type and from_date are required' });
        }

        const prefix = COURSE_TYPE_PREFIX[course_type];
        if (!prefix) {
            return res.status(400).json({ error: 'Invalid course_type' });
        }

        const trainingId = COURSE_TYPE_TRAINING_ID[course_type] || null;

        await conn.beginTransaction();

        // Increment sequence atomically
        await conn.query(
            'UPDATE div_training_batch_sequences SET last_number = last_number + 1 WHERE training_center_id = ? AND prefix = ?',
            [centreId, prefix]
        );

        const [[seq]] = await conn.query(
            'SELECT last_number FROM div_training_batch_sequences WHERE training_center_id = ? AND prefix = ?',
            [centreId, prefix]
        );

        if (!seq) {
            await conn.rollback();
            return res.status(500).json({ error: 'Batch sequence not found for this centre/prefix' });
        }

        const batchCode = `${prefix}-${seq.last_number}`;

        // Insert calendar slot
        const [result] = await conn.query(`
            INSERT INTO div_training_calendar
                (training_center_id, training_id, course_type, batch_code, from_date, remarks, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [centreId, trainingId, course_type, batchCode, from_date, remarks || null, req.session.user.username]);

        await conn.commit();

        res.json({
            success: true,
            message: `Calendar slot created: ${batchCode}`,
            slot: {
                id: result.insertId,
                batch_code: batchCode,
                course_type,
                from_date,
                status: 'planned'
            }
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error creating calendar slot:', error);
        res.status(500).json({ error: 'Failed to create calendar slot' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// PUT /calendar/:id - Update a calendar slot
// ============================================================
router.put('/calendar/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        const { id } = req.params;
        const { from_date, to_date, remarks, status } = req.body;

        // Verify slot belongs to centre
        const [[slot]] = await conn.query(
            'SELECT * FROM div_training_calendar WHERE id = ? AND training_center_id = ?',
            [id, centreId]
        );
        if (!slot) return res.status(404).json({ error: 'Calendar slot not found' });

        const updates = [];
        const params = [];

        if (from_date !== undefined) { updates.push('from_date = ?'); params.push(from_date); }
        if (to_date !== undefined) { updates.push('to_date = ?'); params.push(to_date); }
        if (remarks !== undefined) { updates.push('remarks = ?'); params.push(remarks); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(id);
        await conn.query(`UPDATE div_training_calendar SET ${updates.join(', ')} WHERE id = ?`, params);

        res.json({ success: true, message: 'Calendar slot updated' });
    } catch (error) {
        console.error('Error updating calendar slot:', error);
        res.status(500).json({ error: 'Failed to update calendar slot' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// DELETE /calendar/:id - Delete a planned calendar slot
// ============================================================
router.delete('/calendar/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        const { id } = req.params;

        const [[slot]] = await conn.query(
            'SELECT * FROM div_training_calendar WHERE id = ? AND training_center_id = ?',
            [id, centreId]
        );
        if (!slot) return res.status(404).json({ error: 'Calendar slot not found' });
        if (slot.status !== 'planned') {
            return res.status(400).json({ error: 'Can only delete planned slots' });
        }

        await conn.query('DELETE FROM div_training_calendar WHERE id = ?', [id]);

        res.json({ success: true, message: 'Calendar slot deleted' });
    } catch (error) {
        console.error('Error deleting calendar slot:', error);
        res.status(500).json({ error: 'Failed to delete calendar slot' });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// GET /history - Completed training history
// ============================================================
router.get('/history', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.json({ data: [] });

        const { course_type, month, year } = req.query;

        let query = `
            SELECT
                tl.*,
                (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id) AS total_staff_count,
                (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id AND attendance_status = 'present') AS attended_count,
                (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id AND completion_status = 'completed') AS completed_count,
                (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id AND completion_status = 'not_completed') AS not_completed_count
            FROM div_training_letters tl
            WHERE tl.training_center_id = ?
              AND tl.status = 'completed'
        `;
        const params = [centreId];

        if (course_type) {
            query += ' AND tl.course_type = ?';
            params.push(course_type);
        }
        if (month && year) {
            query += ' AND YEAR(tl.completed_at) = ? AND MONTH(tl.completed_at) = ?';
            params.push(parseInt(year), parseInt(month));
        }

        query += ' ORDER BY tl.completed_at DESC LIMIT 100';

        const [letters] = await conn.query(query, params);
        res.json({ data: letters });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
