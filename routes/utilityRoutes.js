const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== UTILITY ENDPOINTS =====

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Database connection test
router.get("/db-test", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT COUNT(*) as count FROM details");
    conn.release();
    res.json({ 
      status: "Connected", 
      detailsCount: rows[0].count,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Simple test endpoint
router.get("/test", (req, res) => {
  console.log('📡 /api/test endpoint called');
  res.json({ 
    message: "Server is running", 
    timestamp: new Date().toISOString(),
    port: 3000 
  });
});

// Test debug endpoint
router.get("/test-debug", (req, res) => {
  console.log('📡 Test debug endpoint called');
  res.json({ 
    message: "Debug endpoint works", 
    timestamp: new Date().toISOString() 
  });
});

// Get available detail numbers for dropdown
router.get("/details", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT DISTINCT detail_number, line FROM details ORDER BY detail_number"
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("Details fetch error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

// Get details by ID (CRITICAL for frontend!)
router.get("/details/:detailId", async (req, res) => {
  const { detailId } = req.params;
  
  console.log(`🔍 Fetching details for: ${detailId}`);
  
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT * FROM details WHERE detail_id = ? OR detail_number = ?`,
      [detailId, detailId]
    );
    
    console.log(`✅ Found ${rows.length} detail records for: ${detailId}`);
    
    res.json({ 
      data: rows,
      count: rows.length,
      detailId: detailId
    });
    
  } catch (err) {
    console.error("Details fetch error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

// Debug endpoint for detail IDs
router.get("/debug/detail-ids", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    // Get sample detail_ids from trains table
    const [rows] = await conn.execute(
      `SELECT DISTINCT detail_id FROM trains ORDER BY detail_id LIMIT 20`
    );
    
    console.log('📋 Sample detail_ids from trains table:', rows);
    
    res.json({ 
      data: rows,
      count: rows.length 
    });
    
  } catch (err) {
    console.error("Debug detail_ids error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

// Debug endpoint for detail numbers
router.get("/debug/detail-numbers", async (req, res) => {
  const { date = '2025-06-02' } = req.query;
  
  const conn = await pool.getConnection();
  try {
    // Get sample detail_numbers from roster table
    const [rows] = await conn.execute(
      `SELECT DISTINCT detail_number, office FROM duty_roster 
       WHERE DATE(CONVERT_TZ(date, '+00:00', '+05:30')) = ? 
       ORDER BY detail_number LIMIT 20`,
      [date]
    );
    
    console.log('📋 Sample detail_numbers from roster table:', rows);
    
    res.json({ 
      data: rows,
      count: rows.length 
    });
    
  } catch (err) {
    console.error("Debug detail_numbers error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;