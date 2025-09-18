const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== DUTY ROSTER ENDPOINTS =====

// Get duty roster
router.get("/", async (req, res) => {
    const { date, office = "", search = "" } = req.query;
    
    console.log(`📡 /api/roster called with params:`, { date, office, search });

    if (!date) {
        console.log('❌ No date provided');
        return res.status(400).json({ message: "Date required" });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        console.log('✅ Database connection established');
        
        let query = `
            SELECT * FROM duty_roster
            WHERE DATE(CONVERT_TZ(date, '+00:00', '+05:30')) = ?
        `;
        let params = [date];
        
        // Add office filter if provided
        if (office) {
            query += ` AND office = ?`;
            params.push(office);
        }
        
        // Add search filter if provided  
        if (search) {
            query += ` AND (motorman_name LIKE ? OR detail_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY uploaded_at DESC`;
        
        console.log('🔍 Executing query:', query);
        console.log('🔍 With params:', params);
        
        const [rows] = await conn.execute(query, params);
        
        console.log(`✅ Query executed successfully`);
        console.log(`📊 Found ${rows.length} records`);
        
        // Log sample record for debugging
        if (rows.length > 0) {
            console.log('📋 Sample record:', {
                detail_number: rows[0].detail_number,
                motorman_name: rows[0].motorman_name,
                office: rows[0].office,
                date: rows[0].date
            });
        }
        
        // IMPORTANT: Send the response
        res.json({ 
            data: rows,
            count: rows.length,
            date: date,
            filters: { office, search }
        });
        
        console.log('✅ Response sent successfully');
        
    } catch (err) {
        console.error("❌ Roster fetch error:", err);
        res.status(500).json({ 
            message: "Database error", 
            error: err.message,
            date: date 
        });
    } finally {
        if (conn) {
            conn.release();
            console.log('🔌 Database connection released');
        }
    }
});

module.exports = router;