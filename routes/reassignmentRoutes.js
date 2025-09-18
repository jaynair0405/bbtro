console.log('🔄 REASSIGNMENT ROUTES FILE LOADED');
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== JFO REASSIGNMENT ENDPOINTS =====

async function lookupMotormanCmsId(conn, motormanName) {
    if (!motormanName || motormanName.trim() === '' || motormanName === '----') {
      return null;
    }
    
    try {
      console.log(`🔍 Looking up CMS ID for: ${motormanName}`);
      
      // Try duty_roster first (most recent data)
      let query = `
        SELECT DISTINCT motorman_id 
        FROM duty_roster 
        WHERE motorman_name = ? 
          AND motorman_id IS NOT NULL 
          AND TRIM(motorman_id) != '' 
        LIMIT 1
      `;
      let [rows] = await conn.query(query, [motormanName]);
      
      if (rows.length > 0) {
        console.log(`✅ Found CMS ID in duty_roster: ${motormanName} → ${rows[0].motorman_id}`);
        return rows[0].motorman_id;
      }
      
      // Fallback to motormen table
      query = `
        SELECT cmsid 
        FROM motormen 
        WHERE motorman_name = ? 
          AND status = 'active' 
          AND cmsid IS NOT NULL 
          AND TRIM(cmsid) != '' 
        LIMIT 1
      `;
      [rows] = await conn.query(query, [motormanName]);
      
      if (rows.length > 0) {
        console.log(`✅ Found CMS ID in motormen: ${motormanName} → ${rows[0].cmsid}`);
        return rows[0].cmsid;
      }
      
      console.warn(`⚠️ No CMS ID found for: ${motormanName}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error looking up CMS ID for ${motormanName}:`, error);
      return null;
    }
  }

function normalizeDisplay(name, idGuess) {
    const raw = String(name || '').trim();
    // Remove last (...) group (drops "(CSTS1739)" etc.)
    const nameOnly = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
    // Try to find digits
    const digits =
        String(idGuess || '').match(/\d+/)?.[0] ||
        raw.match(/\((\d+)\)\s*$/)?.[1] ||
        '';
    return digits ? `${nameOnly} (${digits})` : nameOnly;
}

// Create new reassignment
// router.post("/reassignments", async (req, res) => {
//     console.log('🔄 CREATE REASSIGNMENT ROUTE HIT!');
    
//     let {
//         detailId,
//         detailNumber,
//         originalMotorman,
//         newMotorman,
//         newOffice,
//         reassignmentType,
//         selectedTrains,
//         reason,
//         notes,
//         date,
//         createdBy
//     } = req.body;

//     // ========================= START OF PATCH =========================
//     // REMOVED: The call to normalizeDisplay is no longer necessary.
//     // The frontend, thanks to the API fix, now sends the exact `motorman_name`
//     // from the database, making server-side sanitation redundant and risky.
//     //
//     // OLD LINE:
//     // newMotorman = normalizeDisplay(newMotorman, req.body.newMotormanId || newMotorman);
//     // ========================== END OF PATCH ==========================

//     console.log('📡 Received reassignment request:', req.body);

//     if (!date || !detailNumber || !newMotorman || !reason) {
//         return res.status(400).json({ message: "Missing required reassignment fields." });
//     }

//     const conn = await pool.getConnection();
//     try {
//         await conn.beginTransaction();

//         // ONLY log the reassignment - DO NOT modify roster table
//         const insertQuery = `INSERT INTO reassignment_history 
//            (date, detail_number, original_motorman, new_motorman, reassignment_type, reason, notes, created_by, selected_trains)
//            VALUES (
//                ${conn.escape(date)}, 
//                ${conn.escape(detailNumber)}, 
//                ${conn.escape(originalMotorman)}, 
//                ${conn.escape(newMotorman)}, 
//                ${conn.escape(reassignmentType)}, 
//                ${conn.escape(reason)}, 
//                ${conn.escape(notes)}, 
//                ${conn.escape(createdBy || 'JFO Supervisor')}, 
//                ${conn.escape(selectedTrains ? JSON.stringify(selectedTrains) : null)}
//            )`;

//         await conn.query(insertQuery);

//         console.log(`✅ Logged reassignment for detail ${detailNumber} - roster table unchanged`);

//         await conn.commit();
//         res.json({
//             message: `✅ Reassignment logged successfully. Original roster preserved, calculations will use reassignment history.`,
//             data: req.body
//         });

//     } catch (err) {
//         if (conn) {
//             await conn.rollback();
//         }
//         console.error("❌ Reassignment error:", err);
//         res.status(500).json({ message: "Database error", error: err.message });
//     } finally {
//         conn.release();
//     }
// });

// // Get reassignments for a specific date
// router.get("/reassignments", async (req, res) => {
//     console.log('🔄 GET REASSIGNMENTS ROUTE HIT!');
    
//     const { date, office, search } = req.query;
    
//     if (!date) {
//         return res.status(400).json({ message: "Date parameter is required" });
//     }
    
//     console.log(`📡 GET /api/jfo/reassignments - Date: ${date}, Office: ${office}, Search: ${search}`);
    
//     const conn = await pool.getConnection();
//     try {
//         let query = `
//             SELECT 
//                 rh.*,
//                 DATE_FORMAT(rh.created_at, '%Y-%m-%d %H:%i:%s') as formatted_created_at
//             FROM reassignment_history rh
//             WHERE rh.date = ${conn.escape(date)}
//         `;
        
//         if (office) {
//             query += ` AND (rh.original_office = ${conn.escape(office)} OR rh.new_office = ${conn.escape(office)})`;
//         }
        
//         if (search) {
//             const safeSearch = conn.escape(`%${search}%`);
//             query += ` AND (
//                 rh.detail_number LIKE ${safeSearch} OR 
//                 rh.original_motorman LIKE ${safeSearch} OR 
//                 rh.new_motorman LIKE ${safeSearch}
//             )`;
//         }
        
//         query += ` ORDER BY rh.created_at DESC`;
        
//         const [rows] = await conn.query(query);
        
//         console.log(`✅ Found ${rows.length} reassignments for ${date}`);
        
//         // Get statistics
//         const statsQuery = `SELECT 
//             COUNT(*) as total_reassignments,
//             COUNT(DISTINCT detail_number) as affected_details,
//             SUM(CASE WHEN reassignment_type = 'full_detail' THEN 1 ELSE 0 END) as full_transfers,
//             SUM(CASE WHEN reassignment_type = 'partial_detail' THEN 1 ELSE 0 END) as partial_transfers,
//             SUM(CASE WHEN reassignment_type = 'specific_trains' THEN 1 ELSE 0 END) as train_reassignments
//         FROM reassignment_history 
//         WHERE date = ${conn.escape(date)}`;
        
//         const [stats] = await conn.query(statsQuery);
        
//         res.json({ 
//             data: rows,
//             stats: stats[0],
//             date: date 
//         });
        
//     } catch (err) {
//         console.error("❌ Reassignments fetch error:", err);
//         res.status(500).json({ 
//             message: "Failed to fetch reassignments", 
//             error: err.message 
//         });
//     } finally {
//         conn.release();
//     }
// });

router.post("/reassignments", async (req, res) => {
    console.log('🔄 CREATE REASSIGNMENT ROUTE HIT WITH CMS ID LOOKUP!');
    
    let {
        detailId,
        detailNumber,
        originalMotorman,
        newMotorman,
        newOffice,
        reassignmentType,
        selectedTrains,
        reason,
        notes,
        date,
        createdBy
    } = req.body;

    console.log('📡 Received reassignment request:', req.body);

    if (!date || !detailNumber || !newMotorman || !reason) {
        return res.status(400).json({ message: "Missing required reassignment fields." });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 🔧 NEW: Automatically lookup CMS IDs
        console.log('🔍 Looking up CMS IDs for motormen...');
        
        const originalMotormanCmsId = await lookupMotormanCmsId(conn, originalMotorman);
        const newMotormanCmsId = await lookupMotormanCmsId(conn, newMotorman);
        
        console.log(`📋 CMS ID Lookup Results:`);
        console.log(`   Original: ${originalMotorman} → ${originalMotormanCmsId}`);
        console.log(`   New: ${newMotorman} → ${newMotormanCmsId}`);

        // 🔧 UPDATED: Insert with CMS IDs
        const insertQuery = `INSERT INTO reassignment_history 
           (date, detail_number, original_motorman, original_motorman_cmsid, 
            new_motorman, new_motorman_cmsid, reassignment_type, reason, notes, created_by, selected_trains)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const insertValues = [
            date,
            detailNumber,
            originalMotorman,
            originalMotormanCmsId,  // 🔧 NEW: Auto-populated CMS ID
            newMotorman,
            newMotormanCmsId,       // 🔧 NEW: Auto-populated CMS ID
            reassignmentType,
            reason,
            notes,
            createdBy || 'JFO Supervisor',
            selectedTrains ? JSON.stringify(selectedTrains) : null
        ];

        const [result] = await conn.query(insertQuery, insertValues);

        console.log(`✅ Reassignment logged with CMS IDs:`);
        console.log(`   ID: ${result.insertId}`);
        console.log(`   Original: ${originalMotorman} (${originalMotormanCmsId})`);
        console.log(`   New: ${newMotorman} (${newMotormanCmsId})`);
        console.log(`   Detail: ${detailNumber}`);

        await conn.commit();
        
        res.json({
            message: `✅ Reassignment logged successfully with CMS ID mapping. Original roster preserved, calculations will use CMS ID matching.`,
            data: {
                ...req.body,
                id: result.insertId,
                originalMotormanCmsId,
                newMotormanCmsId
            }
        });

    } catch (err) {
        if (conn) {
            await conn.rollback();
        }
        console.error("❌ Reassignment error:", err);
        res.status(500).json({ message: "Database error", error: err.message });
    } finally {
        conn.release();
    }
});

router.get("/reassignments/cms-id-status", async (req, res) => {
    console.log('📊 CMS ID STATUS CHECK ROUTE HIT!');
    
    const conn = await pool.getConnection();
    try {
        // Check CMS ID population status
        const [status] = await conn.query(`
            SELECT 
                COUNT(*) as total_reassignments,
                COUNT(original_motorman_cmsid) as original_cms_populated,
                COUNT(new_motorman_cmsid) as new_cms_populated,
                COUNT(*) - COUNT(original_motorman_cmsid) as original_cms_missing,
                COUNT(*) - COUNT(new_motorman_cmsid) as new_cms_missing,
                ROUND((COUNT(original_motorman_cmsid) / COUNT(*)) * 100, 2) as original_cms_percentage,
                ROUND((COUNT(new_motorman_cmsid) / COUNT(*)) * 100, 2) as new_cms_percentage
            FROM reassignment_history
        `);

        // Get sample of missing CMS IDs
        const [missingOriginal] = await conn.query(`
            SELECT DISTINCT original_motorman, COUNT(*) as occurrences
            FROM reassignment_history 
            WHERE original_motorman_cmsid IS NULL 
              AND original_motorman != '----'
            GROUP BY original_motorman
            LIMIT 10
        `);

        const [missingNew] = await conn.query(`
            SELECT DISTINCT new_motorman, COUNT(*) as occurrences
            FROM reassignment_history 
            WHERE new_motorman_cmsid IS NULL 
              AND new_motorman != '----'
            GROUP BY new_motorman
            LIMIT 10
        `);

        res.json({
            status: status[0],
            missingExamples: {
                originalMotormen: missingOriginal,
                newMotormen: missingNew
            }
        });

    } catch (err) {
        console.error("❌ Status check error:", err);
        res.status(500).json({ message: "Status check failed", error: err.message });
    } finally {
        conn.release();
    }
});

// Get detailed reassignment history for a specific detail
router.get("/reassignments/detail/:detailNumber", async (req, res) => {
    console.log('🔄 GET REASSIGNMENTS BY DETAIL ROUTE HIT!');
    
    const { detailNumber } = req.params;
    const { date } = req.query;
    
    if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
    }
    
    console.log(`📡 GET /api/jfo/reassignments/detail/${detailNumber} - Date: ${date}`);
    
    const conn = await pool.getConnection();
    try {
        const query = `SELECT 
            rh.*,
            DATE_FORMAT(rh.created_at, '%Y-%m-%d %H:%i:%s') as formatted_created_at
        FROM reassignment_history rh
        WHERE rh.detail_number = ${conn.escape(detailNumber)} AND rh.date = ${conn.escape(date)}
        ORDER BY rh.created_at ASC`;
        
        const [rows] = await conn.query(query);
        
        console.log(`✅ Found ${rows.length} reassignments for detail ${detailNumber} on ${date}`);
        
        res.json({ 
            data: rows,
            detailNumber: detailNumber,
            date: date 
        });
        
    } catch (err) {
        console.error("❌ Detail reassignments fetch error:", err);
        res.status(500).json({ 
            message: "Failed to fetch detail reassignments", 
            error: err.message 
        });
    } finally {
        conn.release();
    }
});

// Get reassignment summary for dashboard
router.get("/reassignments/summary/:date", async (req, res) => {
    console.log('📊 GET REASSIGNMENTS SUMMARY ROUTE HIT!');
    
    const { date } = req.params;
    
    console.log(`📡 GET /api/jfo/reassignments/summary/${date}`);
    
    const conn = await pool.getConnection();
    try {
        // Get comprehensive summary using actual table columns
        const summaryQuery = `SELECT 
            COUNT(*) as total_reassignments,
            COUNT(DISTINCT detail_number) as affected_details,
            COUNT(DISTINCT original_motorman) as affected_original_motormen,
            COUNT(DISTINCT new_motorman) as involved_new_motormen,
            
            SUM(CASE WHEN reassignment_type = 'full_detail' THEN 1 ELSE 0 END) as full_transfers,
            SUM(CASE WHEN reassignment_type = 'partial_detail' THEN 1 ELSE 0 END) as partial_transfers,
            SUM(CASE WHEN reassignment_type = 'specific_trains' THEN 1 ELSE 0 END) as train_reassignments,
            
            SUM(CASE WHEN reason LIKE '%Emergency%' THEN 1 ELSE 0 END) as emergency_reassignments,
            SUM(CASE WHEN reason LIKE '%Training%' THEN 1 ELSE 0 END) as training_reassignments,
            SUM(CASE WHEN reason LIKE '%Operational%' THEN 1 ELSE 0 END) as operational_reassignments,
            
            MAX(created_at) as latest_reassignment_time,
            MIN(created_at) as earliest_reassignment_time
        FROM reassignment_history 
        WHERE date = ${conn.escape(date)}`;
        
        const [summary] = await conn.query(summaryQuery);
        
        // Get breakdown by reassignment type (since no office columns exist)
        const typeBreakdownQuery = `SELECT 
            COALESCE(reassignment_type, 'Unknown') as type,
            COUNT(*) as reassignment_count,
            COUNT(DISTINCT detail_number) as affected_details
        FROM reassignment_history 
        WHERE date = ${conn.escape(date)}
        GROUP BY reassignment_type
        ORDER BY reassignment_count DESC`;
        
        const [typeBreakdown] = await conn.query(typeBreakdownQuery);
        
        // Get breakdown by person who created the reassignment
        const creatorBreakdownQuery = `SELECT 
            COALESCE(created_by, 'Unknown') as creator,
            COUNT(*) as reassignment_count,
            COUNT(DISTINCT detail_number) as affected_details
        FROM reassignment_history 
        WHERE date = ${conn.escape(date)}
        GROUP BY created_by
        ORDER BY reassignment_count DESC`;
        
        const [creatorBreakdown] = await conn.query(creatorBreakdownQuery);
        
        // Get hourly breakdown
        const hourlyQuery = `SELECT 
            HOUR(created_at) as hour,
            COUNT(*) as reassignment_count
        FROM reassignment_history 
        WHERE date = ${conn.escape(date)}
        GROUP BY HOUR(created_at)
        ORDER BY hour`;
        
        const [hourlyBreakdown] = await conn.query(hourlyQuery);
        
        console.log('✅ Summary data retrieved successfully');
        
        res.json({ 
            date: date,
            summary: summary[0],
            typeBreakdown: typeBreakdown,      // Breakdown by reassignment type
            creatorBreakdown: creatorBreakdown, // Breakdown by who created
            hourlyBreakdown: hourlyBreakdown
        });
        
    } catch (err) {
        console.error("❌ Reassignments summary error:", err);
        console.error("❌ Error details:", {
            code: err.code,
            errno: err.errno,
            message: err.message
        });
        res.status(500).json({ 
            message: "Failed to fetch reassignments summary", 
            error: err.message 
        });
    } finally {
        conn.release();
    }
});

module.exports = router;


