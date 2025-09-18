const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { formatTime } = require('../utils/helpers');

// ===== SCHEDULE ENDPOINTS =====

// Get mainline/harbour schedules

router.get("/:line", async (req, res) => {
    console.log(`📋 Schedule route hit for line: ${req.params.line}`);
    const { line } = req.params;
    const { date, station, status } = req.query;
    
    const conn = await pool.getConnection();
    try {
      let query = `
        SELECT 
          t.*,
          d.detail_number,
          d.sign_on_time,
          d.sign_off_time,
          d.total_duty_hours,
          d.total_wheel_movement,
          CASE 
            WHEN c.train_number IS NOT NULL THEN 'cancelled'
            ELSE t.status 
          END as current_status,
          c.reason as cancellation_reason
        FROM trains t
        LEFT JOIN details d ON t.detail_id = d.detail_id
        LEFT JOIN cancelled_trains c ON t.train_number = c.train_number 
          AND c.date = COALESCE(?, CURDATE())
        WHERE t.line = ?
      `;
      
      const params = [date || null, line];
      
      if (station) {
        query += ` AND (t.start_station = ? OR t.end_station = ?)`;
        params.push(station, station);
      }
      
      if (status) {
        if (status === 'cancelled') {
          query += ` AND c.train_number IS NOT NULL`;
        } else {
          query += ` AND t.status = ? AND c.train_number IS NULL`;
          params.push(status);
        }
      }
      
      query += ` ORDER BY t.start_time`;
      
      const [rows] = await conn.execute(query, params);
      
      // Format the data
      const schedules = rows.map(row => ({
        id: row.id,
        scheduleId: row.detail_id,
        detailNumber: row.detail_number,
        trainNumber: row.train_number,
        line: row.line,
        route: `${row.start_station} → ${row.end_station}`,
        startStation: row.start_station,
        startTime: formatTime(row.start_time),
        endStation: row.end_station,
        endTime: formatTime(row.end_time),
        status: row.current_status,
        remarks: row.remarks,
        cancellationReason: row.cancellation_reason,
        dutyHours: row.total_duty_hours,
        wheelMovement: row.total_wheel_movement,
        signOnTime: formatTime(row.sign_on_time),
        signOffTime: formatTime(row.sign_off_time)
      }));
      
      res.json({ data: schedules });
      
    } catch (err) {
      console.error(`${line} schedule fetch error:`, err);
      res.status(500).json({ message: "Server error" });
    } finally {
      conn.release();
    }
  });

  router.post("/api/schedules", async (req, res) => {
    const {
      scheduleId, line, trainNumber, startStation, startTime,
      endStation, endTime, status, remarks
    } = req.body;
    
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO trains 
         (detail_id, line, train_number, start_station, start_time, end_station, end_time, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [scheduleId, line, trainNumber, startStation, startTime, endStation, endTime, status, remarks]
      );
      
      res.json({ 
        message: "Schedule added successfully",
        id: result.insertId 
      });
      
    } catch (err) {
      console.error("Add schedule error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ message: "Schedule with this ID already exists" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    } finally {
      conn.release();
    }
  });

// Search schedules for management
router.get("/management/schedules", async (req, res) => {
  const { line, date, search } = req.query;
  
  const conn = await pool.getConnection();
  try {
    let query = `
      SELECT 
        t.*,
        d.detail_number,
        d.sign_on_time,
        d.sign_off_time,
        d.total_duty_hours,
        CASE 
          WHEN c.train_number IS NOT NULL THEN 'cancelled'
          ELSE t.status 
        END as current_status,
        c.reason as cancellation_reason
      FROM trains t
      LEFT JOIN details d ON t.detail_id = d.detail_id
      LEFT JOIN cancelled_trains c ON t.train_number = c.train_number 
        AND c.date = COALESCE(?, CURDATE())
      WHERE 1=1
    `;
    
    const params = [date || null];
    
    if (line) {
      query += ` AND t.line = ?`;
      params.push(line);
    }
    
    if (search) {
      query += ` AND (
        t.train_number LIKE ? OR 
        t.start_station LIKE ? OR 
        t.end_station LIKE ? OR
        d.detail_number LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY t.line, t.start_time`;
    
    const [rows] = await conn.execute(query, params);
    
    const schedules = rows.map(row => ({
      id: row.id,
      scheduleId: row.detail_id,
      detailNumber: row.detail_number,
      trainNumber: row.train_number,
      line: row.line,
      route: `${row.start_station} → ${row.end_station}`,
      startStation: row.start_station,
      startTime: formatTime(row.start_time),
      endStation: row.end_station,
      endTime: formatTime(row.end_time),
      status: row.current_status,
      remarks: row.remarks,
      cancellationReason: row.cancellation_reason,
      dutyHours: row.total_duty_hours,
      signOnTime: formatTime(row.sign_on_time),
      signOffTime: formatTime(row.sign_off_time)
    }));
    
    res.json({ data: schedules });
    
  } catch (err) {
    console.error("Management schedule search error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});



// Update schedule
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
      scheduleId, line, trainNumber, startStation, startTime,
      endStation, endTime, status, remarks
    } = req.body;
    
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `UPDATE trains SET 
         detail_id = ?, line = ?, train_number = ?, start_station = ?, start_time = ?,
         end_station = ?, end_time = ?, status = ?, remarks = ?
         WHERE id = ?`,
        [scheduleId, line, trainNumber, startStation, startTime, endStation, endTime, status, remarks, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ message: "Schedule updated successfully" });
      
    } catch (err) {
      console.error("Update schedule error:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      conn.release();
    }
  });
  

// Delete schedule

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute("DELETE FROM trains WHERE id = ?", [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ message: "Schedule deleted successfully" });
      
    } catch (err) {
      console.error("Delete schedule error:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      conn.release();
    }
  });


// Get trains by detail ID
router.get("/by-detail/:detailId", async (req, res) => {
    const { detailId } = req.params;
    
    console.log(`🔍 Looking for trains with detail_id: ${detailId}`);
    
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM trains WHERE detail_id = ? ORDER BY start_time`,
        [detailId]
      );
      
      console.log(`📊 Found ${rows.length} trains for detail_id: ${detailId}`);
      
      res.json({ 
        data: rows,
        count: rows.length 
      });
      
    } catch (err) {
      console.error("Train fetch error:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      conn.release();
    }
  });

module.exports = router;