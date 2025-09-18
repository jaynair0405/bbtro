const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const upload = require('../middleware/upload');
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { normalizeTrainNumber, isTrainNumberValid } = require('../utils/helpers');

console.log("✅ Upload routes module loaded successfully");


// ===== UPLOAD ENDPOINTS =====

// Upload cancelled trains
router.post("/cancelled", upload.single("file"), async (req, res) => {
  try {
    const { date } = req.body;
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let trainNumbers = [];

    console.log(`📂 Uploading cancelled trains for ${date}`);
    console.log(`📄 File: ${req.file.originalname} (${ext})`);

    if (ext === ".csv") {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csvParser({ headers: false }))
        .on("data", row => rows.push(row))
        .on("end", async () => {
          trainNumbers = rows
            .map(row => normalizeTrainNumber(Object.values(row)[0] || ""))
            .filter(val => isTrainNumberValid(val));

          console.log(`🚂 Total valid trains after normalization: ${trainNumbers.length}`);
          console.log(trainNumbers);

          await insertCancelledTrains(trainNumbers, date, res);
          fs.unlinkSync(filePath);
        });
    } 
    else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      trainNumbers = data
        .map(row => normalizeTrainNumber(row[0] || ""))
        .filter(val => isTrainNumberValid(val));

      console.log(`🚂 Total valid trains after normalization: ${trainNumbers.length}`);
      console.log(trainNumbers);

      await insertCancelledTrains(trainNumbers, date, res);
      fs.unlinkSync(filePath);
    } 
    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Unsupported file format." });
    }

  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Helper function to insert cancelled trains
async function insertCancelledTrains(trainNumbers, date, res) {
  const conn = await pool.getConnection();
  let insertedCount = 0;

  try {
    console.log(`🛠 Attempting to insert ${trainNumbers.length} trains for ${date}`);
    for (let train of trainNumbers) {
      train = normalizeTrainNumber(train); // always normalize again

      if (!isTrainNumberValid(train)) {
        console.warn(`⚠ Skipped invalid: "${train}"`);
        continue;
      }

      try {
        await conn.execute(
          "INSERT INTO cancelled_trains (train_number, date) VALUES (?, ?)",
          [train, date]
        );
        console.log(`✅ Inserted: "${train}"`);
        insertedCount++;
      } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
          console.warn(`⚠️ Duplicate skipped: "${train}" for ${date}`);
        } else {
          console.error(`❌ Insert failed for "${train}":`, e.message);
        }
      }
    }
    res.json({
      message: `✅ Successfully inserted ${insertedCount} trains for ${date}`,
    });
  } finally {
    conn.release();
  }
}

// Upload duty roster
router.post("/roster", upload.single("file"), async (req, res) => {
  try {
    const { date, office } = req.body;
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    console.log(`📋 Processing roster upload: ${req.file.originalname}`);
    console.log(`📅 Date: ${date}, Office: ${office}`);

    let rosterEntries = [];

    if (ext === ".csv") {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csvParser({ headers: false }))
        .on("data", row => rows.push(row))
        .on("end", async () => {
          // Process CSV rows
          rosterEntries = rows
            .map(row => {
              const values = Object.values(row);
              if (values.length >= 2) {
                const detail = values[0]?.toString().trim();
                const motorman = values[1]?.toString().trim();
                
                if (detail && motorman) {
                  return { detail, motorman };
                }
              }
              return null;
            })
            .filter(entry => entry !== null);

          await insertDutyRoster(rosterEntries, date, office, res);
          fs.unlinkSync(filePath);
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          fs.unlinkSync(filePath);
          res.status(500).json({ message: "CSV parsing failed" });
        });

    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      rosterEntries = data
        .map(row => {
          if (row.length >= 2) {
            const detail = row[0]?.toString().trim();
            const motorman = row[1]?.toString().trim();
            
            if (detail && motorman) {
              return { detail, motorman };
            }
          }
          return null;
        })
        .filter(entry => entry !== null);

      await insertDutyRoster(rosterEntries, date, office, res);
      fs.unlinkSync(filePath);

    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Unsupported file format. Please use CSV or Excel files." });
    }

  } catch (err) {
    console.error("Roster upload failed:", err);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      message: "Roster upload failed", 
      error: err.message 
    });
  }
});

// Helper function to insert duty roster
async function insertDutyRoster(entries, date, office, res) {
  const conn = await pool.getConnection();
  let insertedCount = 0;
  let updatedCount = 0;

  try {
    console.log(`📋 Processing ${entries.length} roster entries for ${office} on ${date}`);

    for (const { detail, motorman } of entries) {
      try {
        // Extract motorman ID if present (e.g., "Jayakumar M D (1765)" -> "CSMTS1765")
        const idMatch = motorman.match(/\((\d{4})\)/);

        // Office prefix map
        const officePrefixMap = {
          CSMT: 'CSTS',
          PNVL: 'PNVS',
          KYN: 'KYNS'
        };
        
        const prefix = officePrefixMap[office] || `${office}S`;
        const motormanId = idMatch ? `${prefix}${idMatch[1]}` : null;
        
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle existing records
        const [result] = await conn.execute(
          `INSERT INTO duty_roster (detail_number, motorman_name, motorman_id, office, date)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           motorman_name = VALUES(motorman_name),
           motorman_id = VALUES(motorman_id),
           uploaded_at = CURRENT_TIMESTAMP`,
          [detail, motorman, motormanId, office, date]
        );

        if (result.affectedRows === 1) {
          insertedCount++;
        } else if (result.affectedRows === 2) {
          updatedCount++;
        }

      } catch (e) {
        console.warn(`Failed to process entry: Detail ${detail}, Motorman ${motorman}`, e.message);
      }
    }

    console.log(`✅ Roster upload completed: ${insertedCount} inserted, ${updatedCount} updated`);

    res.json({
      message: `✅ Successfully processed ${insertedCount + updatedCount} roster entries for ${office} on ${date}`,
      details: {
        inserted: insertedCount,
        updated: updatedCount,
        total: entries.length,
        office: office,
        date: date
      }
    });

  } catch (error) {
    console.error("Database error during roster insertion:", error);
    res.status(500).json({ 
      message: "Database error during roster upload", 
      error: error.message 
    });
  } finally {
    conn.release();
  }
}

// Upload details CSV
router.post("/details", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let count = 0;
    const conn = await pool.getConnection();

    if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", async (row) => {
          try {
            await conn.execute(
              `INSERT INTO details 
               (detail_id, detail_number, line, sign_on_time, sign_on_place, sign_off_time, 
                sign_off_place, total_duty_hours, total_wheel_movement, total_piloting)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               detail_number = VALUES(detail_number),
               line = VALUES(line),
               sign_on_time = VALUES(sign_on_time),
               sign_on_place = VALUES(sign_on_place),
               sign_off_time = VALUES(sign_off_time),
               sign_off_place = VALUES(sign_off_place),
               total_duty_hours = VALUES(total_duty_hours),
               total_wheel_movement = VALUES(total_wheel_movement),
               total_piloting = VALUES(total_piloting)`,
              [
                row.detailId || row.detail_id,
                row.detailNumber || row.detail_number,
                row.line,
                row.signOnTime || row.sign_on_time,
                row.signOnPlace || row.sign_on_place,
                row.signOffTime || row.sign_off_time,
                row.signOffPlace || row.sign_off_place,
                row.totalDutyHours || row.total_duty_hours,
                row.totalWheelMovement || row.total_wheel_movement,
                row.totalPiloting || row.total_piloting
              ]
            );
            count++;
          } catch (e) {
            console.warn("Insert error:", e.message);
          }
        })
        .on("end", () => {
          conn.release();
          fs.unlinkSync(filePath);
          res.json({ message: `✅ Processed ${count} detail records` });
        });
    } else {
      conn.release();
      fs.unlinkSync(filePath);
      res.status(400).json({ message: "Only CSV files supported for details upload" });
    }

  } catch (err) {
    console.error("Details upload failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload trains CSV
router.post("/trains", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let count = 0;
    const conn = await pool.getConnection();

    if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", async (row) => {
          try {
            // Extract detail_id from scheduleId (remove -XX suffix)
            const detailId = (row.scheduleId || row.detail_id || '').replace(/-\d+$/, '');
            
            await conn.execute(
              `INSERT INTO trains 
               (detail_id, line, train_number, start_station, start_time, end_station, end_time, status, remarks)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                detailId,
                row.line,
                row.trainNumber || row.train_number,
                row.startStation || row.start_station,
                row.startTime || row.start_time,
                row.endStation || row.end_station,
                row.endTime || row.end_time,
                row.status || 'active',
                row.remarks || ''
              ]
            );
            count++;
          } catch (e) {
            console.warn("Insert error:", e.message);
          }
        })
        .on("end", () => {
          conn.release();
          fs.unlinkSync(filePath);
          res.json({ message: `✅ Processed ${count} train records` });
        });
    } else {
      conn.release();
      fs.unlinkSync(filePath);
      res.status(400).json({ message: "Only CSV files supported for trains upload" });
    }

  } catch (err) {
    console.error("Trains upload failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;