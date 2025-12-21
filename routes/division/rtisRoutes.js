const express = require("express");
const router = express.Router();

/**
 * GET /api/division/rtis/lp-search?q=vik&scope=CSMT|ALL
 * Filters:
 * - status = Active
 * - designation_id IN (5,6,7)
 * - default scope = CSMT (current_office_code)
 */
router.get("/lp-search", async (req, res) => {
  let conn;
  try {
    const qRaw = (req.query.q || "").trim();
    const q = qRaw.slice(0, 60); // safety
    const scope = (req.query.scope || "CSMT").toUpperCase(); // CSMT or ALL
    const hasQ = q.length > 0;

    conn = await req.app.locals.pool.getConnection();

    const baseWhere = `
      s.status = 'Active'
      AND s.designation_id IN (5,6,7)
      ${scope === "ALL" ? "" : "AND s.current_office_code = 'CSMT-ML'"}
    `;

    const sql = `
      SELECT
        s.hrms_id,
        s.name,
        s.current_cms_id,
        s.designation_id,
        s.current_cli_id,
        c.cli_name
      FROM div_staff_master s
      LEFT JOIN div_cli_master c ON c.cli_id = s.current_cli_id
      WHERE ${baseWhere}
      ${hasQ ? `
        AND (
          s.name LIKE CONCAT('%', ?, '%')
          OR s.hrms_id LIKE CONCAT('%', ?, '%')
          OR s.pf_number LIKE CONCAT('%', ?, '%')
          OR s.current_cms_id LIKE CONCAT('%', ?, '%')
          OR s.original_cms_id LIKE CONCAT('%', ?, '%')
        )
      ` : ""}
      ORDER BY s.name
      LIMIT ${hasQ ? 50 : 300};
    `;

    const params = hasQ ? [q, q, q, q, q] : [];
    const [rows] = await conn.query(sql, params);

    return res.json({
      success: true,
      scope,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("RTIS lp-search error:", error);
    return res.status(500).json({
      success: false,
      error: "Database error",
      details: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/division/rtis/lp/:hrms_id
 * Resolve one LP + current CLI snapshot (current_cli_id join cli_name)
 */
router.get("/lp/:hrms_id", async (req, res) => {
  let conn;
  try {
    const hrms_id = (req.params.hrms_id || "").trim().toUpperCase();
    if (!hrms_id) {
      return res.status(400).json({ success: false, error: "Missing hrms_id" });
    }

    conn = await req.app.locals.pool.getConnection();

    const sql = `
      SELECT
        s.hrms_id,
        s.name,
        s.current_cms_id,
        s.designation_id,
        s.current_cli_id,
        c.cli_name
      FROM div_staff_master s
      LEFT JOIN div_cli_master c ON c.cli_id = s.current_cli_id
      WHERE s.hrms_id = ?
        AND s.status = 'Active'
        AND s.designation_id IN (5,6,7)
      LIMIT 1;
    `;

    const [rows] = await conn.query(sql, [hrms_id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, error: "LP not found / not eligible" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("RTIS lp resolve error:", error);
    return res.status(500).json({
      success: false,
      error: "Database error",
      details: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/division/rtis/cli-search
 * Used for "Analyzed By" selection
 */
router.get("/cli-search", async (req, res) => {
  let conn;
  try {
    const qRaw = (req.query.q || "").trim();
    const q = qRaw.slice(0, 60);
    const hasQ = q.length > 0;

    conn = await req.app.locals.pool.getConnection();

    const sql = `
      SELECT
        cli_id,
        cli_name,
        cmsid,
        cli_hrms_id,
        current_office_code
      FROM div_cli_master
      WHERE is_active = 1
      ${hasQ ? `
        AND (
          cli_name LIKE CONCAT('%', ?, '%')
          OR cmsid LIKE CONCAT('%', ?, '%')
          OR cli_hrms_id LIKE CONCAT('%', ?, '%')
        )
      ` : ""}
      ORDER BY cli_name
      LIMIT ${hasQ ? 50 : 300};
    `;

    const params = hasQ ? [q, q, q] : [];
    const [rows] = await conn.query(sql, params);

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("RTIS cli-search error:", error);
    return res.status(500).json({
      success: false,
      error: "Database error",
      details: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});


module.exports = router;
