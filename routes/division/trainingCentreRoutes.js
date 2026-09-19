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
router.use('/manage', require('./trainingCentreManageRoutes'));
router.use('/operations', require('./trainingCentreOperationsRoutes'));

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
// The three suburban crew lobbies. MTC CLA serves these; the Kalyan centres
// serve everything else.
const SUBURBAN_OFFICES = ['CSMT-SUB', 'KYN-SUB', 'PNVL-SUB'];

// ============================================================
// GET /due-by-lobby - who each lobby still owes the centre
// ============================================================
// The centre plans from this: which lobby is falling behind on which
// recurring course. Counts use the same latest-record rule as the lobby's own
// due list, so the two cannot disagree.
router.get('/due-by-lobby', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const centreId = getCentreId(req);
        if (!centreId) return res.json({ data: [], within: 90 });
        const within = Math.min(Math.max(parseInt(req.query.within, 10) || 90, 0), 365);

        // MTC CLA trains the suburban lobbies' motormen; the Kalyan centres
        // take everyone else. Each centre must be shown its own lobbies only,
        // or the due position reads as a backlog it cannot act on.
        const [[centre]] = await conn.query(
            'SELECT center_code FROM div_training_centers WHERE center_id = ?', [centreId]);
        const suburban = centre && centre.center_code === 'MTC_CLA';
        const officeClause = suburban
            ? 'AND s.current_office_code IN (?, ?, ?)'
            : 'AND s.current_office_code NOT IN (?, ?, ?)';
        const officeParams = SUBURBAN_OFFICES;

        // Only recurring courses have a due position: a course renews itself
        // when its own code is one of its renewal targets.
        const [courses] = await conn.query(
            `SELECT DISTINCT c.course_id, c.course_code, c.course_name, t.legacy_training_id, t.target_name
               FROM div_training_course_offerings o
               JOIN div_training_course_rules r ON r.rule_id = o.rule_id
               JOIN div_training_courses c ON c.course_id = r.course_id
               JOIN div_training_rule_renewals rr ON rr.rule_id = r.rule_id
               JOIN div_training_renewal_targets t ON t.target_id = rr.target_id
              WHERE o.training_center_id = ? AND o.is_active = 1 AND c.is_active = 1
                AND t.target_code = c.course_code AND t.legacy_training_id IS NOT NULL
              ORDER BY c.course_id`, [centreId]);

        const data = [];
        for (const course of courses) {
            const designation = course.course_code.startsWith('LPS_') ? '%shunt%' : '%motorman%';
            const [rows] = await conn.query(
                `SELECT s.current_office_code AS lobby,
                        SUM(last.done_date IS NULL) AS never_recorded,
                        SUM(last.due_date < CURDATE()) AS overdue,
                        SUM(last.due_date >= CURDATE() AND last.due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) AS due_soon,
                        COUNT(*) AS strength
                   FROM div_staff_master s
                   LEFT JOIN designations d ON d.id = s.designation_id
                   LEFT JOIN div_training_records last ON last.record_id = (
                        SELECT r2.record_id FROM div_training_records r2
                         WHERE r2.staff_hrms_id = s.hrms_id AND r2.training_id = ?
                           AND r2.done_date IS NOT NULL
                         ORDER BY r2.done_date DESC, r2.record_id DESC LIMIT 1)
                  WHERE s.status = 'Active' AND LOWER(d.designation_name) LIKE ?
                    AND s.current_office_code IS NOT NULL
                    ${officeClause}
                  GROUP BY s.current_office_code
                  ORDER BY s.current_office_code`,
                [within, course.legacy_training_id, designation, ...officeParams]);
            const lobbies = rows.map(r => ({
                lobby: r.lobby,
                never_recorded: Number(r.never_recorded) || 0,
                overdue: Number(r.overdue) || 0,
                due_soon: Number(r.due_soon) || 0,
                strength: Number(r.strength) || 0
            })).filter(r => r.never_recorded || r.overdue || r.due_soon);
            if (lobbies.length) data.push({
                course_id: course.course_id,
                course_name: course.course_name,
                lobbies,
                totals: lobbies.reduce((a, r) => ({
                    never_recorded: a.never_recorded + r.never_recorded,
                    overdue: a.overdue + r.overdue,
                    due_soon: a.due_soon + r.due_soon
                }), { never_recorded: 0, overdue: 0, due_soon: 0 })
            });
        }
        res.json({ data, within });
    } catch (error) {
        console.error('Error fetching due by lobby:', error);
        res.status(500).json({ error: 'Failed to fetch due position' });
    } finally {
        if (conn) conn.release();
    }
});

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

        // Pending: letters with a nominee still awaiting the centre's accept
        // or return decision. Letters from before the workflow have no
        // nominees, so their legacy 'sent' status still counts.
        const [[{ pending }]] = await conn.query(
            `SELECT COUNT(DISTINCT tl.id) AS pending
               FROM div_training_letters tl
               LEFT JOIN div_training_letter_workflows wf ON wf.letter_id = tl.id
              WHERE tl.training_center_id = ?
                AND ( (wf.letter_id IS NOT NULL AND EXISTS (
                          SELECT 1 FROM div_training_nominees n
                           WHERE n.letter_id = tl.id AND n.decision = 'pending'))
                   OR (wf.letter_id IS NULL AND tl.status = 'sent') )`,
            [centreId]
        );

        // Attendance due: a course day on or before today with an accepted
        // trainee who has not been marked for it.
        const [[{ attendanceToday }]] = await conn.query(
            `SELECT COUNT(DISTINCT tl.id) AS attendanceToday
               FROM div_training_letters tl
               LEFT JOIN div_training_letter_workflows wf ON wf.letter_id = tl.id
              WHERE tl.training_center_id = ? AND tl.training_date <= CURDATE()
                AND ( (wf.letter_id IS NOT NULL AND EXISTS (
                          SELECT 1 FROM div_training_nominees n
                           LEFT JOIN div_training_attempts a ON a.nominee_id = n.nominee_id
                           WHERE n.letter_id = tl.id AND n.decision = 'accepted'
                             AND ( a.attempt_id IS NULL
                                OR (a.outcome = 'in_progress' AND NOT EXISTS (
                                     SELECT 1 FROM div_training_daily_attendance d
                                      WHERE d.attempt_id = a.attempt_id
                                        AND d.attendance_date = CURDATE())))))
                   OR (wf.letter_id IS NULL AND tl.status = 'sent') )`,
            [centreId]
        );

        // Batches completed this month, by the real course where known.
        const [completedRows] = await conn.query(
            `SELECT COALESCE(c.course_name, tl.course_type) AS label, COUNT(*) AS cnt
               FROM div_training_letters tl
               LEFT JOIN div_training_letter_workflows wf ON wf.letter_id = tl.id
               LEFT JOIN div_training_course_rules r ON r.rule_id = wf.rule_id
               LEFT JOIN div_training_courses c ON c.course_id = r.course_id
              WHERE tl.training_center_id = ? AND tl.status = 'completed'
                AND YEAR(tl.completed_at) = YEAR(CURDATE()) AND MONTH(tl.completed_at) = MONTH(CURDATE())
              GROUP BY label`,
            [centreId]
        );
        const completedBreakup = {};
        let completedTotal = 0;
        for (const row of completedRows) {
            completedBreakup[row.label || '-'] = row.cnt;
            completedTotal += row.cnt;
        }

        // Trainees completed this month: confirmed completion events, plus the
        // legacy per-staff rows for letters that never went through the
        // workflow.
        const [traineeRows] = await conn.query(
            `SELECT label, COUNT(*) AS cnt FROM (
                SELECT COALESCE(c.course_name, tl.course_type) AS label, e.attempt_id
                  FROM div_training_completion_events e
                  JOIN div_training_attempts a ON a.attempt_id = e.attempt_id
                  JOIN div_training_letters tl ON tl.id = a.letter_id
                  LEFT JOIN div_training_course_rules r ON r.rule_id = a.rule_id
                  LEFT JOIN div_training_courses c ON c.course_id = r.course_id
                 WHERE a.training_center_id = ? AND e.event_type = 'confirmed'
                   AND YEAR(e.completion_date) = YEAR(CURDATE())
                   AND MONTH(e.completion_date) = MONTH(CURDATE())
                UNION ALL
                SELECT tl.course_type AS label, NULL
                  FROM div_training_letter_staff tls
                  JOIN div_training_letters tl ON tl.id = tls.letter_id
                  LEFT JOIN div_training_letter_workflows wf ON wf.letter_id = tl.id
                 WHERE tl.training_center_id = ? AND wf.letter_id IS NULL
                   AND tls.completion_status = 'completed'
                   AND YEAR(tl.completed_at) = YEAR(CURDATE())
                   AND MONTH(tl.completed_at) = MONTH(CURDATE())
             ) x GROUP BY label`,
            [centreId, centreId]
        );
        const traineesBreakup = {};
        let traineesTotal = 0;
        for (const row of traineeRows) {
            traineesBreakup[row.label || '-'] = row.cnt;
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
                COALESCE(
                    NULLIF((SELECT COUNT(*) FROM div_training_nominees n
                             WHERE n.letter_id = tl.id AND n.decision <> 'withdrawn'), 0),
                    (SELECT COUNT(*) FROM div_training_letter_staff WHERE letter_id = tl.id)
                ) AS staff_count
            FROM div_training_letters tl
            WHERE tl.training_center_id = ?
              -- A letter finished on an earlier day is history, not incoming
              -- work. Today's stay visible until the day is over.
              AND NOT (tl.status = 'completed' AND tl.training_date < CURDATE())
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
        const [[workflow]] = await conn.query('SELECT workflow_status FROM div_training_letter_workflows WHERE letter_id = ?', [letter_id]);
        if (workflow) return res.status(409).json({ error: 'Accept this workflow letter before recording attendance in the new attendance step' });
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
        const [[workflow]] = await conn.query('SELECT workflow_status FROM div_training_letter_workflows WHERE letter_id = ?', [letter_id]);
        if (workflow) return res.status(409).json({ error: 'Use the new completion workflow for this letter' });
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
        if (!centreId) return res.json({ data: [], courses: [] });

        const { course_type, course_id, month, year } = req.query;

        // Counts come from the workflow tables. Letters raised before the
        // workflow existed have none, so their legacy per-staff rows are used
        // instead — a letter is never reported as empty merely because it
        // predates the new path.
        let query = `
            SELECT tl.id, tl.letter_no, tl.office_code, tl.letter_date, tl.training_date,
                   tl.course_type, tl.status, tl.completed_at,
                   c.course_id, c.course_name,
                   wf.letter_id IS NOT NULL AS is_workflow,
                   (SELECT COUNT(*) FROM div_training_nominees n WHERE n.letter_id = tl.id AND n.decision <> 'withdrawn') AS wf_nominated,
                   (SELECT COUNT(*) FROM div_training_nominees n WHERE n.letter_id = tl.id AND n.decision = 'accepted') AS wf_accepted,
                   (SELECT COUNT(*) FROM div_training_nominees n WHERE n.letter_id = tl.id AND n.decision = 'returned') AS wf_returned,
                   (SELECT COUNT(DISTINCT a.attempt_id) FROM div_training_attempts a
                      JOIN div_training_daily_attendance d ON d.attempt_id = a.attempt_id AND d.status = 'present'
                     WHERE a.letter_id = tl.id) AS wf_attended,
                   (SELECT COUNT(*) FROM div_training_attempts a WHERE a.letter_id = tl.id AND a.outcome = 'passed') AS wf_completed,
                   (SELECT COUNT(*) FROM div_training_letter_staff s WHERE s.letter_id = tl.id) AS legacy_total,
                   (SELECT COUNT(*) FROM div_training_letter_staff s WHERE s.letter_id = tl.id AND s.attendance_status = 'present') AS legacy_attended,
                   (SELECT COUNT(*) FROM div_training_letter_staff s WHERE s.letter_id = tl.id AND s.completion_status = 'completed') AS legacy_completed
            FROM div_training_letters tl
            LEFT JOIN div_training_letter_workflows wf ON wf.letter_id = tl.id
            LEFT JOIN div_training_course_rules r ON r.rule_id = wf.rule_id
            LEFT JOIN div_training_courses c ON c.course_id = r.course_id
            WHERE tl.training_center_id = ?
              AND tl.status = 'completed'
        `;
        const params = [centreId];

        if (course_id) { query += ' AND c.course_id = ?'; params.push(parseInt(course_id, 10)); }
        if (course_type) { query += ' AND tl.course_type = ?'; params.push(course_type); }
        if (month && year) {
            query += ' AND YEAR(tl.completed_at) = ? AND MONTH(tl.completed_at) = ?';
            params.push(parseInt(year), parseInt(month));
        }

        query += ' ORDER BY tl.completed_at DESC LIMIT 100';

        const [letters] = await conn.query(query, params);
        const data = letters.map(l => {
            const workflow = !!l.is_workflow;
            return {
                ...l,
                source: workflow ? 'workflow' : 'legacy',
                course_label: l.course_name || COURSE_LABELS[l.course_type] || l.course_type || '-',
                nominated_count: workflow ? l.wf_nominated : l.legacy_total,
                accepted_count: workflow ? l.wf_accepted : null,
                returned_count: workflow ? l.wf_returned : null,
                attended_count: workflow ? l.wf_attended : l.legacy_attended,
                completed_count: workflow ? l.wf_completed : l.legacy_completed
            };
        });

        // The filter should offer the courses this centre actually runs, not
        // the five legacy types, which cannot name six of the eleven courses.
        const [courses] = await conn.query(
            `SELECT DISTINCT c.course_id, c.course_name FROM div_training_course_offerings o
               JOIN div_training_course_rules r ON r.rule_id = o.rule_id
               JOIN div_training_courses c ON c.course_id = r.course_id
              WHERE o.training_center_id = ? AND o.is_active = 1 AND c.is_active = 1
              ORDER BY c.course_id`, [centreId]);

        res.json({ data, courses });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
