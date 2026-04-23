const express = require('express');
const router = express.Router();

// ===== Auth middleware (division realm) =====
function requireAuth(req, res, next) {
  if (!req.session.user || req.session.user.realm !== 'division') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Designation codes that qualify as LP or ALP (Mainline crew)
const LP_DESIG_CODES  = ['LPM', 'LPP', 'LPG', 'LP_GHAT'];
const ALP_DESIG_CODES = ['ALP', 'Sr.ALP'];

// ============================================================================
// GET /api/division/cvvrs/checklist
// Returns sections + items for rendering the form
// ============================================================================
router.get('/checklist', requireAuth, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();

    const [sections] = await conn.query(
      `SELECT section_id, section_code, section_name, display_order
       FROM div_cvvrs_sections
       WHERE is_active = 1
       ORDER BY display_order`
    );

    const [items] = await conn.query(
      `SELECT item_id, section_id, item_text, response_options, applies_to, display_order
       FROM div_cvvrs_items
       WHERE is_active = 1
       ORDER BY section_id, display_order`
    );

    conn.release();

    // Group items under their sections
    const sectionsWithItems = sections.map(s => ({
      ...s,
      items: items
        .filter(i => i.section_id === s.section_id)
        .map(i => ({
          ...i,
          // response_options is already parsed as array by mysql2 JSON type
          response_options: typeof i.response_options === 'string'
            ? JSON.parse(i.response_options)
            : i.response_options
        }))
    }));

    res.json({ success: true, data: sectionsWithItems });
  } catch (error) {
    console.error('Error fetching CVVRS checklist:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/cvvrs/staff-search?q=X&role=LP|ALP
// Search staff filtered by mainline LP or ALP designations
// ============================================================================
router.get('/staff-search', requireAuth, async (req, res) => {
  let conn;
  try {
    const { q = '', role = '' } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const codes = role === 'LP' ? LP_DESIG_CODES
                : role === 'ALP' ? ALP_DESIG_CODES
                : [...LP_DESIG_CODES, ...ALP_DESIG_CODES];

    conn = await req.app.locals.pool.getConnection();

    const placeholders = codes.map(() => '?').join(',');
    const query = `
      SELECT s.hrms_id, s.name, s.current_cms_id, s.pf_number,
             d.designation_code, d.designation_name,
             o.office_code, o.office_name,
             s.current_cli_id, c.cli_name AS current_cli_name
      FROM div_staff_master s
      LEFT JOIN designations d ON s.designation_id = d.id
      LEFT JOIN offices o ON s.current_office_code = o.office_code
      LEFT JOIN div_cli_master c ON s.current_cli_id = c.cli_id
      WHERE d.designation_code IN (${placeholders})
        AND s.status = 'Active'
        AND (s.hrms_id LIKE ? OR s.name LIKE ? OR s.current_cms_id LIKE ? OR s.pf_number LIKE ?)
      ORDER BY s.name
      LIMIT 15
    `;

    const term = `%${q}%`;
    const params = [...codes, term, term, term, term];

    const [rows] = await conn.query(query, params);
    conn.release();

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error searching CVVRS staff:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/cvvrs/reports
// List reports with filters + pagination
// Query params: from, to, crew_hrms, cli_hrms, performance, page, limit
// ============================================================================
router.get('/reports', requireAuth, async (req, res) => {
  let conn;
  try {
    const { from, to, crew_hrms, cli_hrms, performance, page = 1, limit = 20 } = req.query;

    const filters = [];
    const params = [];

    if (from) { filters.push('r.event_date >= ?'); params.push(from); }
    if (to)   { filters.push('r.event_date <= ?'); params.push(to); }
    if (crew_hrms) {
      filters.push('(r.lp_hrms_id = ? OR r.alp_hrms_id = ?)');
      params.push(crew_hrms, crew_hrms);
    }
    if (cli_hrms) { filters.push('r.cli_hrms_id = ?'); params.push(cli_hrms); }
    if (performance) {
      filters.push('(r.lp_performance = ? OR r.alp_performance = ?)');
      params.push(performance, performance);
    }

    const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    conn = await req.app.locals.pool.getConnection();

    const [countResult] = await conn.query(
      `SELECT COUNT(*) as total FROM div_cvvrs_reports r ${whereClause}`,
      params
    );

    const [rows] = await conn.query(
      `SELECT r.report_id, r.analysis_date, r.event_date, r.train_number, r.loco_number,
              r.lp_name, r.lp_hrms_id, r.alp_name, r.alp_hrms_id,
              r.from_station, r.to_station, r.cli_name,
              r.lp_performance, r.alp_performance, r.final_remark,
              r.created_at
       FROM div_cvvrs_reports r
       ${whereClause}
       ORDER BY r.event_date DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    conn.release();

    res.json({
      success: true,
      data: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error listing CVVRS reports:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/cvvrs/reports/:id
// Fetch full report with observations
// ============================================================================
router.get('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await req.app.locals.pool.getConnection();

    const [reports] = await conn.query(
      `SELECT * FROM div_cvvrs_reports WHERE report_id = ?`,
      [id]
    );

    if (!reports.length) {
      conn.release();
      return res.status(404).json({ error: 'Report not found' });
    }

    const [observations] = await conn.query(
      `SELECT o.item_id, o.lp_value, o.alp_value, o.remark,
              i.item_text, i.response_options, i.applies_to, i.section_id,
              s.section_code, s.section_name, s.display_order AS section_order,
              i.display_order AS item_order
       FROM div_cvvrs_observations o
       JOIN div_cvvrs_items i ON o.item_id = i.item_id
       JOIN div_cvvrs_sections s ON i.section_id = s.section_id
       WHERE o.report_id = ?
       ORDER BY s.display_order, i.display_order`,
      [id]
    );

    conn.release();

    res.json({
      success: true,
      data: {
        report: reports[0],
        observations: observations.map(o => ({
          ...o,
          response_options: typeof o.response_options === 'string'
            ? JSON.parse(o.response_options)
            : o.response_options
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching CVVRS report:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// POST /api/division/cvvrs/reports
// Create a new CVVRS report (header + observations, transactional)
// ============================================================================
router.post('/reports', requireAuth, async (req, res) => {
  let conn;
  try {
    const {
      cli_hrms_id, cli_name,
      analysis_date, event_date,
      train_number, loco_number,
      lp_hrms_id, lp_name,
      alp_hrms_id, alp_name,
      from_station, to_station,
      ncli_lp_id, ncli_lp_name,
      ncli_alp_id, ncli_alp_name,
      crew_hq, departure_time, arrival_time,
      lp_performance, alp_performance,
      final_remark,
      observations = []
    } = req.body;

    if (!cli_name || !analysis_date || !event_date || !train_number || !lp_name) {
      return res.status(400).json({
        error: 'Missing required fields: cli_name, analysis_date, event_date, train_number, lp_name'
      });
    }

    const createdBy = req.session.user?.username || req.session.user?.user_id || 'unknown';
    const officeCode = req.session.user?.div_office_code || null;

    conn = await req.app.locals.pool.getConnection();
    await conn.beginTransaction();

    const [headerResult] = await conn.query(
      `INSERT INTO div_cvvrs_reports
       (cli_hrms_id, cli_name, analysis_date, event_date, train_number, loco_number,
        lp_hrms_id, lp_name, alp_hrms_id, alp_name,
        from_station, to_station,
        ncli_lp_id, ncli_lp_name, ncli_alp_id, ncli_alp_name,
        crew_hq, departure_time, arrival_time,
        lp_performance, alp_performance, final_remark,
        created_by, office_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cli_hrms_id || null, cli_name,
        analysis_date, event_date,
        train_number, loco_number || null,
        lp_hrms_id || null, lp_name,
        alp_hrms_id || null, alp_name || null,
        from_station || null, to_station || null,
        ncli_lp_id || null, ncli_lp_name || null,
        ncli_alp_id || null, ncli_alp_name || null,
        crew_hq || null, departure_time || null, arrival_time || null,
        lp_performance || null, alp_performance || null, final_remark || null,
        createdBy, officeCode
      ]
    );

    const reportId = headerResult.insertId;

    if (observations.length) {
      const obsValues = observations.map(o => [
        reportId, o.item_id, o.lp_value || null, o.alp_value || null, o.remark || null
      ]);
      await conn.query(
        `INSERT INTO div_cvvrs_observations (report_id, item_id, lp_value, alp_value, remark) VALUES ?`,
        [obsValues]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ success: true, data: { report_id: reportId } });
  } catch (error) {
    console.error('Error creating CVVRS report:', error);
    if (conn) { try { await conn.rollback(); } catch(e) {} conn.release(); }
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// PUT /api/division/cvvrs/reports/:id
// Update report + observations (delete + reinsert observations for simplicity)
// ============================================================================
router.put('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      cli_hrms_id, cli_name,
      analysis_date, event_date,
      train_number, loco_number,
      lp_hrms_id, lp_name,
      alp_hrms_id, alp_name,
      from_station, to_station,
      ncli_lp_id, ncli_lp_name,
      ncli_alp_id, ncli_alp_name,
      crew_hq, departure_time, arrival_time,
      lp_performance, alp_performance,
      final_remark,
      observations = []
    } = req.body;

    conn = await req.app.locals.pool.getConnection();
    await conn.beginTransaction();

    const [updateResult] = await conn.query(
      `UPDATE div_cvvrs_reports SET
        cli_hrms_id = ?, cli_name = ?,
        analysis_date = ?, event_date = ?,
        train_number = ?, loco_number = ?,
        lp_hrms_id = ?, lp_name = ?,
        alp_hrms_id = ?, alp_name = ?,
        from_station = ?, to_station = ?,
        ncli_lp_id = ?, ncli_lp_name = ?, ncli_alp_id = ?, ncli_alp_name = ?,
        crew_hq = ?, departure_time = ?, arrival_time = ?,
        lp_performance = ?, alp_performance = ?, final_remark = ?
       WHERE report_id = ?`,
      [
        cli_hrms_id || null, cli_name,
        analysis_date, event_date,
        train_number, loco_number || null,
        lp_hrms_id || null, lp_name,
        alp_hrms_id || null, alp_name || null,
        from_station || null, to_station || null,
        ncli_lp_id || null, ncli_lp_name || null,
        ncli_alp_id || null, ncli_alp_name || null,
        crew_hq || null, departure_time || null, arrival_time || null,
        lp_performance || null, alp_performance || null, final_remark || null,
        id
      ]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Report not found' });
    }

    // Clear old observations and reinsert
    await conn.query(`DELETE FROM div_cvvrs_observations WHERE report_id = ?`, [id]);
    if (observations.length) {
      const obsValues = observations.map(o => [
        id, o.item_id, o.lp_value || null, o.alp_value || null, o.remark || null
      ]);
      await conn.query(
        `INSERT INTO div_cvvrs_observations (report_id, item_id, lp_value, alp_value, remark) VALUES ?`,
        [obsValues]
      );
    }

    await conn.commit();
    conn.release();

    res.json({ success: true, data: { report_id: parseInt(id) } });
  } catch (error) {
    console.error('Error updating CVVRS report:', error);
    if (conn) { try { await conn.rollback(); } catch(e) {} conn.release(); }
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// DELETE /api/division/cvvrs/reports/:id
// ============================================================================
router.delete('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await req.app.locals.pool.getConnection();

    const [result] = await conn.query(
      `DELETE FROM div_cvvrs_reports WHERE report_id = ?`,
      [id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting CVVRS report:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/cvvrs/stats
// Dashboard stats for SPM Hub card (yesterday count + total)
// ============================================================================
router.get('/stats', requireAuth, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();

    const [[yesterdayRow]] = await conn.query(
      `SELECT COUNT(*) as count FROM div_cvvrs_reports
       WHERE DATE(created_at) = DATE(NOW() - INTERVAL 1 DAY)`
    );
    const [[totalRow]] = await conn.query(
      `SELECT COUNT(*) as count FROM div_cvvrs_reports`
    );

    conn.release();

    res.json({
      success: true,
      yesterday: yesterdayRow.count,
      total: totalRow.count
    });
  } catch (error) {
    console.error('Error fetching CVVRS stats:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;
