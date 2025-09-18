const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== DASHBOARD ENDPOINTS =====

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    // Get mainline stats
    const [mainlineTotal] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'mainline'"
    );
    
    const [mainlineActive] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'mainline' AND status = 'active'"
    );
    
    const [mainlineCancelled] = await conn.execute(
      `SELECT COUNT(DISTINCT t.train_number) as count 
       FROM trains t 
       JOIN cancelled_trains c ON t.train_number = c.train_number 
       WHERE t.line = 'mainline' AND c.date = CURDATE()`
    );
    
    const [mainlineDelayed] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'mainline' AND status = 'delayed'"
    );

    // Get harbour stats
    const [harbourTotal] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'harbour'"
    );
    
    const [harbourActive] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'harbour' AND status = 'active'"
    );
    
    const [harbourCancelled] = await conn.execute(
      `SELECT COUNT(DISTINCT t.train_number) as count 
       FROM trains t 
       JOIN cancelled_trains c ON t.train_number = c.train_number 
       WHERE t.line = 'harbour' AND c.date = CURDATE()`
    );
    
    const [harbourDelayed] = await conn.execute(
      "SELECT COUNT(*) as count FROM trains WHERE line = 'harbour' AND status = 'delayed'"
    );

    // Total updates (total trains + cancelled trains for today)
    const [totalUpdates] = await conn.execute(
      `SELECT (
        (SELECT COUNT(*) FROM trains) + 
        (SELECT COUNT(*) FROM cancelled_trains WHERE date = CURDATE())
       ) as count`
    );

    res.json({
      mainline: {
        total: mainlineTotal[0].count,
        active: mainlineActive[0].count,
        cancelled: mainlineCancelled[0].count,
        delayed: mainlineDelayed[0].count
      },
      harbour: {
        total: harbourTotal[0].count,
        active: harbourActive[0].count,
        cancelled: harbourCancelled[0].count,
        delayed: harbourDelayed[0].count
      },
      totalUpdates: totalUpdates[0].count,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;