console.log('🚂 SPECIAL TRAINS ROUTES FILE LOADED');
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== SPECIAL TRAINS ENDPOINTS =====

// Get special trains for a specific date
router.get("/", async (req, res) => {
  console.log('🚂 SPECIAL TRAINS LIST ROUTE HIT!');
  
  const { date, office, search } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date parameter is required" });
  }

  console.log(`📡 GET /api/special-trains - Date: ${date}, Office: ${office}, Search: ${search}`);

  const conn = await pool.getConnection();
  try {
    let query = `
      SELECT 
        st.*,
        DATE_FORMAT(st.sign_on_time, '%H:%i') as sign_on_time,
        DATE_FORMAT(st.sign_off_time, '%H:%i') as sign_off_time,
        DATE_FORMAT(st.start_time, '%H:%i') as start_time,
        DATE_FORMAT(st.end_time, '%H:%i') as end_time,
        DATE_FORMAT(st.date, '%Y-%m-%d') as formatted_date
      FROM special_trains st
      WHERE st.date = ${conn.escape(date)} AND st.is_active = TRUE
    `;
    
    if (office) {
      query += ` AND st.office = ${conn.escape(office)}`;
    }
    
    if (search) {
      const safeSearch = conn.escape(`%${search}%`);
      query += ` AND (
        st.train_number LIKE ${safeSearch} OR 
        st.train_name LIKE ${safeSearch} OR 
        st.assigned_motorman LIKE ${safeSearch}
      )`;
    }
    
    query += ` ORDER BY st.start_time ASC, st.created_at DESC`;
    
    console.log('🔍 Executing query:', query);
    const [rows] = await conn.query(query);
    
    console.log(`✅ Found ${rows.length} special trains for ${date}`);
    
    res.json({ 
      data: rows,
      count: rows.length,
      date: date 
    });
    
  } catch (err) {
    console.error("❌ Special trains fetch error:", err);
    res.status(500).json({ 
      message: "Failed to fetch special trains", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

// Create new special train
router.post("/", async (req, res) => {
  console.log('🚂 CREATE SPECIAL TRAIN ROUTE HIT!');
  
  const {
    date, trainNumber, trainName, trainTypeOperation,
    signOnTime, signOffTime, startTime, endTime,
    startStation, endStation, assignedMotorman, office,
    dutyHours, wheelMovementHours, remarks, createdBy
  } = req.body;

  // Validation
  const requiredFields = {
    date, trainNumber, signOnTime, signOffTime, 
    startTime, endTime, startStation, endStation, office
  };
  
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
    
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  console.log(`📡 POST /api/special-trains - Creating: ${trainNumber} for ${date}`);

  const conn = await pool.getConnection();
  try {
    // Check for duplicate train number on same date
    const checkQuery = `SELECT id FROM special_trains WHERE date = ${conn.escape(date)} AND train_number = ${conn.escape(trainNumber)} AND is_active = TRUE`;
    const [existing] = await conn.query(checkQuery);
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        message: `Special train "${trainNumber}" already exists for ${date}` 
      });
    }

    // Insert new special train
    const insertQuery = `INSERT INTO special_trains (
      date, train_number, train_name, train_type_operation,
      sign_on_time, sign_off_time, start_time, end_time,
      start_station, end_station, assigned_motorman, office,
      duty_hours, wheel_movement_hours, remarks, created_by
    ) VALUES (
      ${conn.escape(date)}, ${conn.escape(trainNumber)}, ${conn.escape(trainName)}, ${conn.escape(trainTypeOperation)},
      ${conn.escape(signOnTime)}, ${conn.escape(signOffTime)}, ${conn.escape(startTime)}, ${conn.escape(endTime)},
      ${conn.escape(startStation)}, ${conn.escape(endStation)}, ${conn.escape(assignedMotorman)}, ${conn.escape(office)},
      ${conn.escape(dutyHours)}, ${conn.escape(wheelMovementHours)}, ${conn.escape(remarks)}, ${conn.escape(createdBy || 'System')}
    )`;
    
    const [result] = await conn.query(insertQuery);
    const specialTrainId = result.insertId;
    
    // Create corresponding train assignment record
    const assignmentQuery = `INSERT INTO train_assignments (
      date, detail_id, train_number, assigned_motorman,
      is_original_assignment, train_source, source_train_id,
      start_time, end_time, start_station, end_station,
      duty_hours, wheel_movement_hours, office, assigned_by
    ) VALUES (
      ${conn.escape(date)}, 'SPECIAL', ${conn.escape(trainNumber)}, ${conn.escape(assignedMotorman)},
      TRUE, 'special', ${specialTrainId},
      ${conn.escape(startTime)}, ${conn.escape(endTime)}, ${conn.escape(startStation)}, ${conn.escape(endStation)},
      ${conn.escape(dutyHours)}, ${conn.escape(wheelMovementHours)}, ${conn.escape(office)}, ${conn.escape(createdBy || 'System')}
    )`;
    
    await conn.query(assignmentQuery);
    
    console.log(`✅ Special train created with ID: ${specialTrainId}`);
    
    res.json({ 
      message: `✅ Special train "${trainNumber}" created successfully`,
      id: specialTrainId,
      trainNumber: trainNumber,
      date: date
    });
    
  } catch (err) {
    console.error("❌ Special train creation error:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ 
        message: `Special train "${trainNumber}" already exists for this date` 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to create special train", 
        error: err.message 
      });
    }
  } finally {
    conn.release();
  }
});

// Update special train
router.put("/:id", async (req, res) => {
  console.log('🚂 UPDATE SPECIAL TRAIN ROUTE HIT!');
  
  const { id } = req.params;
  const {
    trainNumber, trainName, trainTypeOperation,
    signOnTime, signOffTime, startTime, endTime,
    startStation, endStation, assignedMotorman, office,
    dutyHours, wheelMovementHours, remarks
  } = req.body;

  console.log(`📡 PUT /api/special-trains/${id} - Updating special train`);

  const conn = await pool.getConnection();
  try {
    // Check if special train exists
    const checkQuery = `SELECT * FROM special_trains WHERE id = ${conn.escape(id)} AND is_active = TRUE`;
    const [existing] = await conn.query(checkQuery);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Special train not found" });
    }

    // Update special train
    const updateQuery = `UPDATE special_trains SET 
      train_number = ${conn.escape(trainNumber)}, 
      train_name = ${conn.escape(trainName)}, 
      train_type_operation = ${conn.escape(trainTypeOperation)},
      sign_on_time = ${conn.escape(signOnTime)}, 
      sign_off_time = ${conn.escape(signOffTime)}, 
      start_time = ${conn.escape(startTime)}, 
      end_time = ${conn.escape(endTime)},
      start_station = ${conn.escape(startStation)}, 
      end_station = ${conn.escape(endStation)}, 
      assigned_motorman = ${conn.escape(assignedMotorman)}, 
      office = ${conn.escape(office)},
      duty_hours = ${conn.escape(dutyHours)}, 
      wheel_movement_hours = ${conn.escape(wheelMovementHours)}, 
      remarks = ${conn.escape(remarks)}
     WHERE id = ${conn.escape(id)}`;
    
    console.log('🔍 Update query:', updateQuery);
    
    const [result] = await conn.query(updateQuery);
    
    // Update corresponding train assignment
    const assignmentUpdateQuery = `UPDATE train_assignments SET 
      train_number = ${conn.escape(trainNumber)}, assigned_motorman = ${conn.escape(assignedMotorman)},
      start_time = ${conn.escape(startTime)}, end_time = ${conn.escape(endTime)}, start_station = ${conn.escape(startStation)}, end_station = ${conn.escape(endStation)},
      duty_hours = ${conn.escape(dutyHours)}, wheel_movement_hours = ${conn.escape(wheelMovementHours)}, office = ${conn.escape(office)}
     WHERE source_train_id = ${conn.escape(id)} AND train_source = 'special'`;
    
    await conn.query(assignmentUpdateQuery);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Special train not found" });
    }
    
    console.log(`✅ Special train ${id} updated successfully`);
    
    res.json({ 
      message: `✅ Special train "${trainNumber}" updated successfully`,
      id: id
    });
    
  } catch (err) {
    console.error("❌ Special train update error:", err);
    res.status(500).json({ 
      message: "Failed to update special train", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

// Delete special train (soft delete)
router.delete("/:id", async (req, res) => {
  console.log('🚂 DELETE SPECIAL TRAIN ROUTE HIT!');
  
  const { id } = req.params;

  console.log(`📡 DELETE /api/special-trains/${id} - Deleting special train`);

  const conn = await pool.getConnection();
  try {
    // Debug: Check what's in the database first
    console.log('🔍 Checking if special train exists...');
    const checkQuery = `SELECT train_number, assigned_motorman FROM special_trains WHERE id = ${conn.escape(id)} AND is_active = TRUE`;
    console.log('🔍 Check query:', checkQuery);
    
    const [existing] = await conn.query(checkQuery);
    console.log(`🔍 Found ${existing.length} records`);
    
    if (existing.length === 0) {
      console.log('❌ Special train not found');
      return res.status(404).json({ message: "Special train not found" });
    }
    
    const trainInfo = existing[0];
    console.log('✅ Train info:', trainInfo);
    
    // Try the soft delete
    console.log('🗑️ Attempting soft delete...');
    const deleteQuery = `UPDATE special_trains SET is_active = FALSE WHERE id = ${conn.escape(id)}`;
    console.log('🔍 Delete query:', deleteQuery);
    
    const [result] = await conn.query(deleteQuery);
    console.log('✅ Delete result:', result);
    
    // Try to delete corresponding train assignment (this might fail if table doesn't exist)
    try {
      console.log('🗑️ Attempting to delete train assignment...');
      const assignmentDeleteQuery = `DELETE FROM train_assignments WHERE source_train_id = ${conn.escape(id)} AND train_source = 'special'`;
      console.log('🔍 Assignment delete query:', assignmentDeleteQuery);
      
      await conn.query(assignmentDeleteQuery);
      console.log('✅ Train assignment deleted');
    } catch (assignmentError) {
      console.log('⚠️ Train assignment delete failed (table might not exist):', assignmentError.message);
      // Continue anyway - this is not critical
    }
    
    console.log(`✅ Special train ${id} deleted successfully`);
    
    res.json({ 
      message: `✅ Special train "${trainInfo.train_number}" deleted successfully`,
      deletedTrain: trainInfo.train_number
    });
    
  } catch (err) {
    console.error("❌ Special train deletion error:", err);
    console.error("❌ Error details:", {
      code: err.code,
      errno: err.errno,
      message: err.message
    });
    res.status(500).json({ 
      message: "Failed to delete special train", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

// Get special train by ID
router.get("/:id", async (req, res) => {
  console.log('🚂 GET SPECIAL TRAIN BY ID ROUTE HIT!');
  
  const { id } = req.params;

  console.log(`📡 GET /api/special-trains/${id}`);

  const conn = await pool.getConnection();
  try {
    const query = `SELECT 
      st.*,
      DATE_FORMAT(st.sign_on_time, '%H:%i') as sign_on_time,
      DATE_FORMAT(st.sign_off_time, '%H:%i') as sign_off_time,
      DATE_FORMAT(st.start_time, '%H:%i') as start_time,
      DATE_FORMAT(st.end_time, '%H:%i') as end_time
     FROM special_trains st
     WHERE st.id = ${conn.escape(id)} AND st.is_active = TRUE`;
    
    const [rows] = await conn.query(query);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Special train not found" });
    }
    
    res.json({ data: rows[0] });
    
  } catch (err) {
    console.error("❌ Special train fetch error:", err);
    res.status(500).json({ 
      message: "Failed to fetch special train", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

// Get special trains statistics
router.get("/stats/:date", async (req, res) => {
  console.log('📊 SPECIAL TRAINS STATS ROUTE HIT!');
  
  const { date } = req.params;

  console.log(`📡 GET /api/special-trains/stats/${date}`);

  const conn = await pool.getConnection();
  try {
    const statsQuery = `SELECT 
      COUNT(*) as total_special_trains,
      SUM(CASE WHEN train_type_operation = 'working' THEN 1 ELSE 0 END) as working_trains,
      SUM(CASE WHEN train_type_operation = 'piloting' THEN 1 ELSE 0 END) as piloting_trains,
      SUM(CASE WHEN assigned_motorman IS NOT NULL AND assigned_motorman != '' THEN 1 ELSE 0 END) as assigned_trains,
      SUM(duty_hours) as total_duty_hours,
      SUM(wheel_movement_hours) as total_wheel_movement_hours,
      COUNT(DISTINCT office) as offices_involved
     FROM special_trains 
     WHERE date = ${conn.escape(date)} AND is_active = TRUE`;
    
    const [stats] = await conn.query(statsQuery);
    
    const officeQuery = `SELECT 
      office,
      COUNT(*) as count,
      SUM(duty_hours) as duty_hours,
      SUM(wheel_movement_hours) as wheel_movement_hours
     FROM special_trains 
     WHERE date = ${conn.escape(date)} AND is_active = TRUE
     GROUP BY office`;
    
    const [officeBreakdown] = await conn.query(officeQuery);
    
    res.json({ 
      date: date,
      stats: stats[0],
      officeBreakdown: officeBreakdown
    });
    
  } catch (err) {
    console.error("❌ Special trains stats error:", err);
    res.status(500).json({ 
      message: "Failed to fetch special trains statistics", 
      error: err.message 
    });
  } finally {
    conn.release();
  }
});

module.exports = router;