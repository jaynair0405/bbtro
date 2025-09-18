const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== CANCELLATION ENDPOINTS =====

// Cancel single train
router.post("/single", async (req, res) => {
  const { date, trainNumber, reason, notes, timestamp, office } = req.body;

  if (!date || !trainNumber || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const formattedTimestamp = new Date(timestamp)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const sql = `
    INSERT INTO cancelled_trains (date, train_number, reason, notes, cancelled_at, office)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      reason = VALUES(reason), 
      notes = VALUES(notes), 
      cancelled_at = VALUES(cancelled_at),
      office = VALUES(office)
  `;

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.execute(sql, [
      date, trainNumber, reason, notes, formattedTimestamp, office
    ]);
    conn.release();

    if (result.affectedRows === 1) {
      res.json({
        message: `✅ Train ${trainNumber} cancelled successfully for ${date}`,
      });
    } else {
      res.json({
        message: `ℹ️ Train ${trainNumber} was already cancelled. Info updated.`,
      });
    }
  } catch (err) {
    console.error("❌ MySQL Error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get cancellations
router.get("/", async (req, res) => {
  const { date, office, search } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Missing required 'date' parameter" });
  }

  const conn = await pool.getConnection();
  try {
    let query = `
      SELECT c.*, t.detail_id, d.detail_number
      FROM cancelled_trains c
      LEFT JOIN trains t ON c.train_number = t.train_number
      LEFT JOIN details d ON t.detail_id = d.detail_id
      WHERE c.date = ?
    `;
    const params = [date];

    if (office) {
      query += ` AND c.office = ?`;
      params.push(office);
    }

    if (search) {
      query += ` AND (c.train_number LIKE ? OR d.detail_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.cancelled_at DESC`;

    const [rows] = await conn.execute(query, params);
    
    // Get statistics
    const [stats] = await conn.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN office = 'CSMT' THEN 1 ELSE 0 END) as csmt,
        SUM(CASE WHEN office = 'KYN' THEN 1 ELSE 0 END) as kyn,
        SUM(CASE WHEN office = 'PNVL' THEN 1 ELSE 0 END) as pnvl,
        SUM(CASE WHEN office = 'HQ' THEN 1 ELSE 0 END) as hq
      FROM cancelled_trains WHERE date = ?
    `, [date]);

    res.json({ 
      data: rows,
      stats: stats[0] 
    });
  } catch (err) {
    console.error("❌ Cancellation fetch error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;