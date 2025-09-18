// =====================================================
// STEP 1: MEMU ROUTES - SAFE ADDITION TO EXISTING SYSTEM
// File: routes/memuRoutes.js (NEW FILE)
// =====================================================

console.log('🚂 MEMU ROUTES FILE LOADED - SAFE ADDITION');
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ===== MEMU MANAGEMENT ENDPOINTS =====

// 1. Check if detail is MEMU (used by wheel movement calculation)
router.get('/check/:detailNumber', async (req, res) => {
  console.log('🔍 MEMU CHECK ROUTE HIT!');
  
  const { detailNumber } = req.params;
  
  console.log(`🔍 Checking if detail ${detailNumber} is MEMU`);
  
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT 
        md.detail_number,
        md.description,
        md.is_active,
        COUNT(mdp.id) as pattern_count
      FROM memu_details md
      LEFT JOIN memu_day_patterns mdp ON md.detail_number = mdp.detail_number AND mdp.is_active = TRUE
      WHERE md.detail_number = ? AND md.is_active = TRUE
      GROUP BY md.detail_number
    `;
    
    const [rows] = await conn.query(query, [detailNumber]);
    
    const isMemu = rows.length > 0;
    const hasPatterns = isMemu && rows[0].pattern_count > 0;
    
    console.log(`✅ Detail ${detailNumber}: MEMU=${isMemu}, Patterns=${hasPatterns}`);
    
    res.json({
      success: true,
      detailNumber,
      isMemu,
      hasPatterns,
      data: isMemu ? rows[0] : null
    });
    
  } catch (error) {
    console.error('❌ Error checking MEMU detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check MEMU detail',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// 2. Get MEMU pattern for specific detail and date
router.get('/pattern/:detailNumber/:date', async (req, res) => {
  console.log('📅 MEMU PATTERN ROUTE HIT!');
  
  const { detailNumber, date } = req.params;
  const { isHoliday } = req.query;
  
  console.log(`📅 Getting MEMU pattern for detail ${detailNumber} on ${date}, Holiday: ${isHoliday}`);
  
  const conn = await pool.getConnection();
  try {
    // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const dayOfWeek = new Date(date).getDay();
    console.log(`📅 Day of week: ${dayOfWeek} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]})`);
    
    // Determine day type based on day of week and holiday
    let dayType = getDayType(dayOfWeek, isHoliday === 'true');
    console.log(`🔍 Looking for day_type: ${dayType}`);
    
    // Query for pattern
    let query = `
      SELECT 
        mdp.*,
        md.description as detail_description
      FROM memu_day_patterns mdp
      JOIN memu_details md ON mdp.detail_number = md.detail_number
      WHERE mdp.detail_number = ? 
        AND mdp.day_type = ?
        AND mdp.is_active = TRUE
        AND md.is_active = TRUE
    `;
    
    let [patterns] = await conn.query(query, [detailNumber, dayType]);
    
    // If no exact match found, try fallbacks
    if (patterns.length === 0) {
      console.log(`⚠️ No pattern found for ${dayType}, trying fallbacks...`);
      
      // Try fallback patterns
      const fallbacks = getFallbackDayTypes(dayType);
      for (const fallbackType of fallbacks) {
        console.log(`🔄 Trying fallback: ${fallbackType}`);
        [patterns] = await conn.query(query, [detailNumber, fallbackType]);
        if (patterns.length > 0) {
          console.log(`✅ Found pattern with fallback: ${fallbackType}`);
          break;
        }
      }
    }
    
    if (patterns.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No MEMU pattern found for detail ${detailNumber} on ${dayType}`,
        detailNumber,
        date,
        dayOfWeek,
        dayType
      });
    }
    
    const pattern = patterns[0];
    
    // Get trains for this pattern
    const trainsQuery = `
      SELECT *
      FROM memu_trains
      WHERE pattern_id = ? AND is_active = TRUE
      ORDER BY sequence_order
    `;
    
    const [trains] = await conn.query(trainsQuery, [pattern.id]);
    
    console.log(`✅ Found pattern: ${pattern.pattern_name} with ${trains.length} trains`);
    
    res.json({
      success: true,
      detailNumber,
      date,
      dayOfWeek,
      dayType,
      pattern: {
        ...pattern,
        trains: trains
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting MEMU pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MEMU pattern',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// 3. Get all MEMU details
router.get('/details', async (req, res) => {
  console.log('📋 MEMU DETAILS LIST ROUTE HIT!');
  
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT 
        md.*,
        COUNT(mdp.id) as pattern_count,
        COUNT(mt.id) as train_count
      FROM memu_details md
      LEFT JOIN memu_day_patterns mdp ON md.detail_number = mdp.detail_number AND mdp.is_active = TRUE
      LEFT JOIN memu_trains mt ON mdp.id = mt.pattern_id AND mt.is_active = TRUE
      WHERE md.is_active = TRUE
      GROUP BY md.detail_number
      ORDER BY CAST(md.detail_number AS UNSIGNED)
    `;
    
    const [details] = await conn.query(query);
    
    console.log(`✅ Found ${details.length} MEMU details`);
    
    res.json({
      success: true,
      data: details,
      count: details.length
    });
    
  } catch (error) {
    console.error('❌ Error getting MEMU details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MEMU details',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// 4. Get patterns for specific detail
router.get('/details/:detailNumber/patterns', async (req, res) => {
  console.log('📋 MEMU DETAIL PATTERNS ROUTE HIT!');
  
  const { detailNumber } = req.params;
  
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT 
        mdp.*,
        COUNT(mt.id) as train_count
      FROM memu_day_patterns mdp
      LEFT JOIN memu_trains mt ON mdp.id = mt.pattern_id AND mt.is_active = TRUE
      WHERE mdp.detail_number = ? AND mdp.is_active = TRUE
      GROUP BY mdp.id
      ORDER BY mdp.day_type
    `;
    
    const [patterns] = await conn.query(query, [detailNumber]);
    
    console.log(`✅ Found ${patterns.length} patterns for detail ${detailNumber}`);
    
    res.json({
      success: true,
      detailNumber,
      data: patterns,
      count: patterns.length
    });
    
  } catch (error) {
    console.error('❌ Error getting MEMU patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MEMU patterns',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// ===== HELPER FUNCTIONS =====

// IST day-of-week from 'YYYY-MM-DD' (0=Sun..6=Sat)
function getISTDayOfWeek(ymd) {
  // Force midnight in IST so the weekday doesn't shift on a UTC server
  const d = new Date(`${ymd}T00:00:00+05:30`);
  return d.getUTCDay();
}

function getDayType(ymd, isHoliday) {
  if (isHoliday) return 'sunday';
  const dow = getISTDayOfWeek(ymd);   // 0=Sun ... 6=Sat
  if (dow === 0) return 'sunday';
  if (dow === 6) return 'saturday';
  if (dow === 5) return 'friday';
  // 🔧 Key change: your 906/911/912 weekday data is under 'monday_saturday'
  return 'monday_saturday';           // (was 'monday_friday')
}

// Get fallback day types if exact match not found
function getFallbackDayTypes(dayType) {
  const fallbacks = {
    'monday_friday': ['monday_thursday', 'monday_saturday'],
    'monday_thursday': ['monday_friday', 'monday_saturday'],
    'friday': ['monday_friday', 'monday_saturday'],
    'saturday': ['saturday_sunday', 'monday_saturday'],
    'sunday': ['saturday_sunday'],
    'saturday_sunday': ['saturday', 'sunday'],
    'monday_saturday': ['monday_friday', 'monday_thursday']
  };
  
  return fallbacks[dayType] || [];
}

// ===== VALIDATION ENDPOINTS (FOR DEVELOPMENT) =====

// 5. Validate MEMU data
router.get('/validate/:detailNumber', async (req, res) => {
  console.log('🧪 MEMU VALIDATION ROUTE HIT!');
  
  const { detailNumber } = req.params;
  
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT 
        mdp.pattern_name,
        mdp.day_type,
        mdp.calculated_wheel_movement,
        mdp.working_train_count,
        mdp.piloting_train_count,
        COUNT(mt.id) as actual_train_count,
        SUM(CASE WHEN mt.is_working = TRUE THEN 1 ELSE 0 END) as actual_working_count,
        SUM(CASE WHEN mt.is_working = FALSE THEN 1 ELSE 0 END) as actual_piloting_count
      FROM memu_day_patterns mdp
      LEFT JOIN memu_trains mt ON mdp.id = mt.pattern_id AND mt.is_active = TRUE
      WHERE mdp.detail_number = ? AND mdp.is_active = TRUE
      GROUP BY mdp.id
    `;
    
    const [validation] = await conn.query(query, [detailNumber]);
    
    // Check for discrepancies
    const issues = [];
    validation.forEach(row => {
      if (row.working_train_count !== row.actual_working_count) {
        issues.push(`${row.pattern_name}: Expected ${row.working_train_count} working trains, found ${row.actual_working_count}`);
      }
      if (row.piloting_train_count !== row.actual_piloting_count) {
        issues.push(`${row.pattern_name}: Expected ${row.piloting_train_count} piloting trains, found ${row.actual_piloting_count}`);
      }
    });
    
    console.log(`✅ Validation complete for detail ${detailNumber}: ${issues.length} issues found`);
    
    res.json({
      success: true,
      detailNumber,
      validation,
      issues,
      isValid: issues.length === 0
    });
    
  } catch (error) {
    console.error('❌ Error validating MEMU data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate MEMU data',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

module.exports = router;