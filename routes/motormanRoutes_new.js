
console.log('🔥 MOTORMAN ROUTES FILE VERSION: FULL-WORKING');
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== MOTORMAN API ENDPOINTS =====

// 1. GET /api/motormen - Using string interpolation instead of parameters
router.get('/', async (req, res) => {
  console.log('🎯 MOTORMAN MAIN ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const { office, search, limit = 1000 } = req.query;
      console.log('📋 Query params:', { office, search, limit });
      
      // WORKAROUND: Use string interpolation instead of parameters
      // This bypasses the MySQL2 parameter issue
      
      let query = `
          SELECT cmsid, motorman_name, mobile_number, pf_number, hrms_id, office, status, created_at 
          FROM motormen 
          WHERE status = 'active'
      `;
      
      // Add office filter (escape single quotes for security)
      if (office) {
          const safeOffice = conn.escape(office);
          query += ` AND office = ${safeOffice}`;
      }
      
      // Add search filter
      if (search) {
          const safeSearch = conn.escape(`%${search}%`);
          query += ` AND (motorman_name LIKE ${safeSearch} OR cmsid LIKE ${safeSearch} OR mobile_number LIKE ${safeSearch})`;
      }
      
      // Add limit (safe since it's parsed as integer)
      const safeLimit = parseInt(limit) || 1000;
      query += ` ORDER BY motorman_name ASC LIMIT ${safeLimit}`;
      
      console.log('🔍 Final query (no parameters):', query);
      
      // Use query() instead of execute() - no parameters needed
      const [rows] = await conn.query(query);
      
      res.json({
          success: true,
          data: rows,
          count: rows.length,
          message: `Found ${rows.length} motormen (using string interpolation)`
      });
      
  } catch (error) {
      console.error('❌ Error in motorman route:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch motormen',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

// 2. GET /api/motormen/statistics - Get motorman statistics by office
router.get('/statistics', async (req, res) => {
  console.log('📊 MOTORMAN STATISTICS ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const query = `
          SELECT 
              office,
              COUNT(*) as count
          FROM motormen 
          WHERE status = 'active' 
          GROUP BY office
      `;
      
      // No parameters needed here
      const [results] = await conn.query(query);
      
      // Process results into expected format
      const stats = {
          total: 0,
          csmt: 0,
          kyn: 0,
          pnvl: 0
      };
      
      results.forEach(row => {
          const count = parseInt(row.count);
          stats.total += count;
          
          switch (row.office.toUpperCase()) {
              case 'CSMT':
                  stats.csmt = count;
                  break;
              case 'KYN':
                  stats.kyn = count;
                  break;
              case 'PNVL':
                  stats.pnvl = count;
                  break;
          }
      });
      
      console.log('✅ Statistics calculated:', stats);
      
      res.json({
          success: true,
          data: stats,
          message: 'Statistics retrieved successfully'
      });
      
  } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch statistics',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

// 3. GET /api/motormen/:id - Get specific motorman
router.get('/:id', async (req, res) => {
  console.log('🔍 MOTORMAN BY ID ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const { id } = req.params;
      const safeId = conn.escape(id);
      
      const query = `
          SELECT cmsid, motorman_name, mobile_number, pf_number, hrms_id, office, 
                 status, created_at, updated_at 
          FROM motormen 
          WHERE (id = ${safeId} OR cmsid = ${safeId}) AND status = 'active'
      `;
      
      const [rows] = await conn.query(query);
      
      if (rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Motorman not found'
          });
      }
      
      res.json({
          success: true,
          data: rows[0],
          message: 'Motorman retrieved successfully'
      });
      
  } catch (error) {
      console.error('❌ Error fetching motorman:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch motorman',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

// 4. GET /api/motormen/jfo/for-reassignment - Get motormen for reassignment dropdowns
router.get('/jfo/for-reassignment', async (req, res) => {
  console.log('🎯 JFO REASSIGNMENT ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const { office, excludeCmsId } = req.query;
      
      let query = `
          SELECT cmsid, motorman_name, office, mobile_number
          FROM motormen 
          WHERE status = 'active'
      `;
      
      if (office) {
          const safeOffice = conn.escape(office);
          query += ` AND office = ${safeOffice}`;
      }
      
      if (excludeCmsId) {
          const safeExcludeCmsId = conn.escape(excludeCmsId);
          query += ` AND cmsid != ${safeExcludeCmsId}`;
      }
      
      query += ` ORDER BY motorman_name ASC`;
      
      const [rows] = await conn.query(query);
      
      // ========================= START OF PATCH =========================
      // Format for dropdown use.
      // - 'value' is the unique ID for the dropdown option.
      // - 'label' is what the user sees. Use the exact name from the database.
      // - 'motorman_name' is explicitly passed so the frontend can easily access the canonical name for submission.
      const formattedMotormen = rows.map(m => ({
          value: m.cmsid,
          label: m.motorman_name,         // Use the exact database name for display.
          motorman_name: m.motorman_name, // Provide the canonical name for submission logic.
          office: m.office,
          mobile: m.mobile_number
      }));
      // ========================== END OF PATCH ==========================
      
      res.json({
          success: true,
          data: formattedMotormen,
          count: formattedMotormen.length
      });
      
  } catch (error) {
      console.error('❌ Error fetching motormen for reassignment:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch motormen for reassignment',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

// 5. PUT /api/motormen/:id - Update motorman
router.put('/:id', async (req, res) => {
  console.log('✏️ MOTORMAN UPDATE ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const { id } = req.params;
      const { motormanName, mobileNumber, pfNumber, hrmsId, office } = req.body;
      
      const [result] = await conn.execute(`
          UPDATE motormen 
          SET motorman_name = ?, mobile_number = ?, pf_number = ?, hrms_id = ?, 
              office = ?, updated_at = NOW()
          WHERE (id = ? OR cmsid = ?) AND status = 'active'
      `, [motormanName, mobileNumber, pfNumber, hrmsId, office, id, id]);
      
      if (result.affectedRows === 0) {
          return res.status(404).json({
              success: false,
              message: 'Motorman not found'
          });
      }
      
      res.json({
          success: true,
          message: 'Motorman updated successfully'
      });
      
  } catch (error) {
      console.error('❌ Error updating motorman:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to update motorman',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

// 6. DELETE /api/motormen/:id - Soft delete motorman
router.delete('/:id', async (req, res) => {
  console.log('🗑️ MOTORMAN DELETE ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
      const { id } = req.params;
      
      const [result] = await conn.execute(`
          UPDATE motormen 
          SET status = 'inactive', updated_at = NOW()
          WHERE (id = ? OR cmsid = ?) AND status = 'active'
      `, [id, id]);
      
      if (result.affectedRows === 0) {
          return res.status(404).json({
              success: false,
              message: 'Motorman not found'
          });
      }
      
      res.json({
          success: true,
          message: 'Motorman deleted successfully'
      });
      
  } catch (error) {
      console.error('❌ Error deleting motorman:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to delete motorman',
          error: error.message
      });
  } finally {
      conn.release();
  }
});

module.exports = router;