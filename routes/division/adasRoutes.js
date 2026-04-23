const express = require('express');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user || req.session.user.realm !== 'division') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

const MOTORMAN_DESIG_CODES = ['MOTORMAN'];

// ============================================================================
// GET /api/division/adas/checklist
// Returns all 13 items for the suburban ADAS form
// ============================================================================
router.get('/checklist', requireAuth, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [items] = await conn.query(
      `SELECT item_id, item_text, is_inverse, display_order
       FROM div_adas_items
       WHERE is_active = 1
       ORDER BY display_order`
    );
    conn.release();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching ADAS checklist:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/adas/staff-search?q=X
// Motorman-only staff search
// ============================================================================
router.get('/staff-search', requireAuth, async (req, res) => {
  let conn;
  try {
    const { q = '' } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    conn = await req.app.locals.pool.getConnection();

    const placeholders = MOTORMAN_DESIG_CODES.map(() => '?').join(',');
    const term = `%${q}%`;
    const [rows] = await conn.query(
      `SELECT s.hrms_id, s.name, s.current_cms_id, s.pf_number,
              s.safety_category,
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
       LIMIT 15`,
      [...MOTORMAN_DESIG_CODES, term, term, term, term]
    );

    conn.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error searching ADAS staff:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/adas/reports
// List reports with filters
// ============================================================================
router.get('/reports', requireAuth, async (req, res) => {
  let conn;
  try {
    const { from, to, mman_hrms, cli_hrms, section, page = 1, limit = 20 } = req.query;

    const filters = [];
    const params = [];

    if (from) { filters.push('r.event_date >= ?'); params.push(from); }
    if (to)   { filters.push('r.event_date <= ?'); params.push(to); }
    if (mman_hrms) { filters.push('r.mman_hrms_id = ?'); params.push(mman_hrms); }
    if (cli_hrms)  { filters.push('r.cli_hrms_id = ?'); params.push(cli_hrms); }
    if (section)   { filters.push('r.section = ?'); params.push(section); }

    const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    conn = await req.app.locals.pool.getConnection();

    const [countResult] = await conn.query(
      `SELECT COUNT(*) as total FROM div_adas_reports r ${whereClause}`,
      params
    );

    const [rows] = await conn.query(
      `SELECT r.report_id, r.analysis_date, r.event_date, r.train_number, r.d_cab,
              r.mman_hrms_id, r.mman_name, r.mman_hq, r.safety_category,
              r.section, r.from_station, r.to_station,
              r.cli_name, r.nli_name, r.final_remark,
              r.created_at
       FROM div_adas_reports r
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
    console.error('Error listing ADAS reports:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/adas/reports/:id
// Full report with observations
// ============================================================================
router.get('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await req.app.locals.pool.getConnection();

    const [reports] = await conn.query(
      `SELECT * FROM div_adas_reports WHERE report_id = ?`,
      [id]
    );

    if (!reports.length) {
      conn.release();
      return res.status(404).json({ error: 'Report not found' });
    }

    const [observations] = await conn.query(
      `SELECT o.item_id, o.value_text,
              i.item_text, i.is_inverse, i.display_order
       FROM div_adas_observations o
       JOIN div_adas_items i ON o.item_id = i.item_id
       WHERE o.report_id = ?
       ORDER BY i.display_order`,
      [id]
    );

    conn.release();

    res.json({
      success: true,
      data: {
        report: reports[0],
        observations
      }
    });
  } catch (error) {
    console.error('Error fetching ADAS report:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// POST /api/division/adas/reports
// Create new report + observations (transactional)
// ============================================================================
router.post('/reports', requireAuth, async (req, res) => {
  let conn;
  try {
    const {
      cli_hrms_id, cli_name,
      analysis_date, event_date,
      train_number, d_cab,
      mman_hrms_id, mman_name, mman_hq, safety_category,
      section, from_station, to_station, time_from, time_to,
      nli_id, nli_name,
      final_remark,
      observations = []
    } = req.body;

    if (!cli_name || !analysis_date || !event_date || !train_number || !mman_name) {
      return res.status(400).json({
        error: 'Missing required fields: cli_name, analysis_date, event_date, train_number, mman_name'
      });
    }

    const createdBy = req.session.user?.username || req.session.user?.user_id || 'unknown';
    const officeCode = req.session.user?.div_office_code || null;

    conn = await req.app.locals.pool.getConnection();
    await conn.beginTransaction();

    const [headerResult] = await conn.query(
      `INSERT INTO div_adas_reports
       (cli_hrms_id, cli_name, analysis_date, event_date,
        train_number, d_cab,
        mman_hrms_id, mman_name, mman_hq, safety_category,
        section, from_station, to_station, time_from, time_to,
        nli_id, nli_name, final_remark,
        created_by, office_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cli_hrms_id || null, cli_name,
        analysis_date, event_date,
        train_number, d_cab || null,
        mman_hrms_id || null, mman_name, mman_hq || null, safety_category || null,
        section || null, from_station || null, to_station || null,
        time_from || null, time_to || null,
        nli_id || null, nli_name || null, final_remark || null,
        createdBy, officeCode
      ]
    );

    const reportId = headerResult.insertId;

    if (observations.length) {
      const obsValues = observations.map(o => [reportId, o.item_id, o.value_text || null]);
      await conn.query(
        `INSERT INTO div_adas_observations (report_id, item_id, value_text) VALUES ?`,
        [obsValues]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ success: true, data: { report_id: reportId } });
  } catch (error) {
    console.error('Error creating ADAS report:', error);
    if (conn) { try { await conn.rollback(); } catch(e) {} conn.release(); }
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// PUT /api/division/adas/reports/:id
// Update report + observations
// ============================================================================
router.put('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      cli_hrms_id, cli_name,
      analysis_date, event_date,
      train_number, d_cab,
      mman_hrms_id, mman_name, mman_hq, safety_category,
      section, from_station, to_station, time_from, time_to,
      nli_id, nli_name,
      final_remark,
      observations = []
    } = req.body;

    conn = await req.app.locals.pool.getConnection();
    await conn.beginTransaction();

    const [updateResult] = await conn.query(
      `UPDATE div_adas_reports SET
        cli_hrms_id = ?, cli_name = ?,
        analysis_date = ?, event_date = ?,
        train_number = ?, d_cab = ?,
        mman_hrms_id = ?, mman_name = ?, mman_hq = ?, safety_category = ?,
        section = ?, from_station = ?, to_station = ?, time_from = ?, time_to = ?,
        nli_id = ?, nli_name = ?, final_remark = ?
       WHERE report_id = ?`,
      [
        cli_hrms_id || null, cli_name,
        analysis_date, event_date,
        train_number, d_cab || null,
        mman_hrms_id || null, mman_name, mman_hq || null, safety_category || null,
        section || null, from_station || null, to_station || null,
        time_from || null, time_to || null,
        nli_id || null, nli_name || null, final_remark || null,
        id
      ]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Report not found' });
    }

    await conn.query(`DELETE FROM div_adas_observations WHERE report_id = ?`, [id]);
    if (observations.length) {
      const obsValues = observations.map(o => [id, o.item_id, o.value_text || null]);
      await conn.query(
        `INSERT INTO div_adas_observations (report_id, item_id, value_text) VALUES ?`,
        [obsValues]
      );
    }

    await conn.commit();
    conn.release();

    res.json({ success: true, data: { report_id: parseInt(id) } });
  } catch (error) {
    console.error('Error updating ADAS report:', error);
    if (conn) { try { await conn.rollback(); } catch(e) {} conn.release(); }
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// DELETE /api/division/adas/reports/:id
// ============================================================================
router.delete('/reports/:id', requireAuth, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await req.app.locals.pool.getConnection();

    const [result] = await conn.query(
      `DELETE FROM div_adas_reports WHERE report_id = ?`,
      [id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ADAS report:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================================
// GET /api/division/adas/stats
// ============================================================================
router.get('/stats', requireAuth, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();

    const [[yesterdayRow]] = await conn.query(
      `SELECT COUNT(*) as count FROM div_adas_reports
       WHERE DATE(created_at) = DATE(NOW() - INTERVAL 1 DAY)`
    );
    const [[totalRow]] = await conn.query(
      `SELECT COUNT(*) as count FROM div_adas_reports`
    );

    conn.release();

    res.json({
      success: true,
      yesterday: yesterdayRow.count,
      total: totalRow.count
    });
  } catch (error) {
    console.error('Error fetching ADAS stats:', error);
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;
