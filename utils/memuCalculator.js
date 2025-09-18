// =====================================================
// STEP 3: MEMU WHEEL MOVEMENT CALCULATOR
// File: utils/memuCalculator.js (NEW FILE)
// Separate calculator for MEMU details with day-wise patterns
// =====================================================

console.log('🚂 MEMU CALCULATOR LOADED');
const { 
  parseTimeToMinutes, 
  minutesToTimeString, 
  calculateCrossMidnightDutyHours 
} = require('./helpers');

// ===== MAIN MEMU CALCULATION FUNCTION =====

/**
 * Calculate wheel movement and duty hours for MEMU details
 * @param {Object} conn - Database connection
 * @param {string} detailNumber - Detail number (e.g., '907')
 * @param {string} currentDate - Date in YYYY-MM-DD format
 * @param {string} motormanName - Motorman name from roster
 * @param {string} motormanCmsId - Motorman CMS ID
 * @param {string} office - Office (KYN, CSMT, etc.)
 * @param {boolean} isHoliday - Whether the date is a holiday
 * @param {Array} cancellations - Cancelled trains for the date
 * @returns {Object} Calculation results
 */

async function calculateMemuWheelMovement(conn, detailNumber, currentDate, motormanName, motormanCmsId, office, isHoliday, cancellations = []) {
  console.log(`🚂 MEMU CALCULATION: Detail ${detailNumber} on ${currentDate} for ${motormanName}`);
  
  try {
    // STEP 1: Get MEMU pattern for this date
    const pattern = await getMemuPatternForDate(conn, detailNumber, currentDate, isHoliday);
    
    if (!pattern) {
      console.warn(`⚠️ No MEMU pattern found for detail ${detailNumber} on ${currentDate}`);
      return {
        success: false,
        error: 'No MEMU pattern found',
        detailNumber,
        currentDate
      };
    }
    
    console.log(`✅ Found MEMU pattern: ${pattern.pattern_name} (${pattern.day_type})`);
    
    // STEP 2: Get trains for this pattern
    const trains = await getMemuTrainsForPattern(conn, pattern.id);
    
    // STEP 3: Calculate duty hours (from pattern) - MOVED UP BEFORE TRAIN CHECK
    const dutyHours = calculateMemuDutyHours(pattern);
    
    if (!trains || trains.length === 0) {
      console.warn(`⚠️ No trains found for MEMU pattern ${pattern.id}`);
      
      // Return with duty hours even when no trains
      return {
        success: true,  // Changed to true to indicate valid zero-service
        detailNumber,
        currentDate,
        motormanName,
        motormanCmsId,
        office,
        isMemuDetail: true,
        
        pattern: {
          id: pattern.id,
          name: pattern.pattern_name,
          dayType: pattern.day_type,
          description: pattern.day_description,
          crossesMidnight: pattern.crosses_midnight
        },
        
        // Use calculated duty hours even with no trains
        dutyHours: dutyHours,
        
        // Wheel movement stays 0
        baseWheelMovement: 0,
        workingTrains: [],
        pilotingTrains: [],
        cancelledMovement: 0,
        sundayDeductions: 0,
        regularCancellations: 0,
        netWheelMovement: 0,
        
        // Summary
        totalTrains: 0,
        workingTrainCount: 0,
        pilotingTrainCount: 0,
        
        trains: []
      };
    }
    
    console.log(`🚂 Found ${trains.length} trains for pattern ${pattern.pattern_name}`);
    
    // STEP 4: Calculate wheel movement (from trains)
    const wheelMovementResult = calculateMemuTrainsMovement(trains, cancellations, currentDate);
    
    // STEP 5: Build result
    const result = {
      success: true,
      detailNumber,
      currentDate,
      motormanName,
      motormanCmsId,
      office,
      isMemuDetail: true,
      
      // Pattern info
      pattern: {
        id: pattern.id,
        name: pattern.pattern_name,
        dayType: pattern.day_type,
        description: pattern.day_description,
        crossesMidnight: pattern.crosses_midnight
      },
      
      // Duty calculation - always use pattern duty hours
      dutyHours: dutyHours,
      
      // Wheel movement calculation - unchanged
      baseWheelMovement: wheelMovementResult.baseWheelMovement,
      workingTrains: wheelMovementResult.workingTrains,
      pilotingTrains: wheelMovementResult.pilotingTrains,
      cancelledMovement: wheelMovementResult.cancelledMovement,
      sundayDeductions: 0,
      regularCancellations: wheelMovementResult.cancelledMovement,
      netWheelMovement: Math.max(0, wheelMovementResult.baseWheelMovement - wheelMovementResult.cancelledMovement),
      
      // Summary
      totalTrains: trains.length,
      workingTrainCount: wheelMovementResult.workingTrains.length,
      pilotingTrainCount: wheelMovementResult.pilotingTrains.length,
      
      // Debug info
      trains: trains.map(train => ({
        trainNumber: train.train_number,
        type: train.train_type,
        isWorking: train.is_working,
        startTime: train.start_time,
        endTime: train.end_time,
        duration: train.duration,
        isCancelled: wheelMovementResult.cancelledTrains.includes(train.train_number)
      }))
    };
    
    console.log(`✅ MEMU calculation complete: Net movement: ${minutesToTimeString(result.netWheelMovement)}, Duty: ${minutesToTimeString(result.dutyHours)}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ MEMU calculation error for detail ${detailNumber}:`, error);
    return {
      success: false,
      error: error.message,
      detailNumber,
      currentDate
    };
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Get MEMU pattern for specific date
 */
async function getMemuPatternForDate(conn, detailNumber, currentDate, isHoliday) {
  console.log(`🔍 Getting MEMU pattern for detail ${detailNumber} on ${currentDate}, Holiday: ${isHoliday}`);
  
  // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const dayOfWeek = new Date(currentDate).getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(`📅 Day of week: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
  
  // Determine day type based on day of week and holiday
  let dayType = getMemuDayType(dayOfWeek, false); // Always pass false for MEMU
  console.log(`🔍 MEMU day_type: ${dayType} (holiday status ignored)`);
  
  // Query for pattern
  let query = `
    SELECT * FROM memu_day_patterns 
    WHERE detail_number = ? 
      AND day_type = ?
      AND is_active = TRUE
  `;
  
  console.log(`🔍 Looking for pattern: detail=${detailNumber}, day_type=${dayType}`);
  let [patterns] = await conn.query(query, [detailNumber, dayType]);
  console.log(`🔍 Found ${patterns.length} patterns for ${dayType}`);
  
  // If no exact match, try fallbacks
  if (patterns.length === 0) {
    console.log(`⚠️ No pattern found for ${dayType}, trying fallbacks...`);
    
    const fallbacks = getMemuFallbackDayTypes(dayType);
    console.log(`🔍 Fallback types to try: ${fallbacks.join(', ')}`);
    
    for (const fallbackType of fallbacks) {
      console.log(`🔄 Trying fallback: ${fallbackType}`);
      [patterns] = await conn.query(query, [detailNumber, fallbackType]);
      if (patterns.length > 0) {
        console.log(`✅ Found pattern with fallback: ${fallbackType}`);
        dayType = fallbackType;
        break;
      }
    }
  }
  
  if (patterns.length === 0) {
    console.warn(`❌ No MEMU pattern found for detail ${detailNumber} on ${dayType}`);
    return null;
  }
  
  console.log(`✅ Using pattern: ${patterns[0].pattern_name}`);
  return patterns[0];
}
/**
 * Get trains for MEMU pattern
 */
async function getMemuTrainsForPattern(conn, patternId) {
  const query = `
    SELECT * FROM memu_trains 
    WHERE pattern_id = ? AND is_active = TRUE 
    ORDER BY sequence_order
  `;
  
  const [trains] = await conn.query(query, [patternId]);
  return trains;
}

/**
 * Calculate duty hours from MEMU pattern
 */


function calculateMemuDutyHours(pattern) {
  console.log(`⏰ Calculating MEMU duty hours from pattern: ${pattern.total_duty_hours}`);
  
  // Always use the stored total_duty_hours value
  if (pattern.total_duty_hours) {
    const dutyMinutes = parseMemuDurationString(pattern.total_duty_hours);
    console.log(`⏰ Using stored duty hours: ${pattern.total_duty_hours} = ${minutesToTimeString(dutyMinutes)}`);
    return dutyMinutes;
  }
  
  // Fallback: calculate from sign-on/off (shouldn't normally be used)
  if (pattern.crosses_midnight) {
    console.log(`🌙 Cross-midnight duty detected`);
    const dutyMinutes = parseMemuDurationString(pattern.total_duty_hours);
    return dutyMinutes;
  } else {
    const signOnMinutes = parseTimeToMinutes(pattern.sign_on_time);
    const signOffMinutes = parseTimeToMinutes(pattern.sign_off_time);
    
    let dutyMinutes = signOffMinutes - signOnMinutes;
    if (dutyMinutes < 0) {
      dutyMinutes += 24 * 60;
    }
    
    console.log(`⏰ Calculated from times: ${pattern.sign_on_time} to ${pattern.sign_off_time} = ${minutesToTimeString(dutyMinutes)}`);
    return dutyMinutes;
  }
}

/**
 * Calculate wheel movement from MEMU trains
 */
function calculateMemuTrainsMovement(trains, cancellations, currentDate) {
  console.log(`🚂 Calculating wheel movement for ${trains.length} trains`);
  
  const workingTrains = [];
  const pilotingTrains = [];
  const cancelledTrains = [];
  
  let baseWheelMovement = 0;
  let cancelledMovement = 0;
  
  for (const train of trains) {
    const trainNumber = train.train_number.trim();
    const isWorking = train.is_working;
    const trainMinutes = parseMemuDurationString(train.duration);
    
    // Check if train is cancelled
    const isCancelled = cancellations.some(c => {
      const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
      const currentTrain = trainNumber.replace(/\s+/g, '').toLowerCase();
      return cancelledTrain === currentTrain;
    });
    
    if (isWorking) {
      workingTrains.push(train);
      baseWheelMovement += trainMinutes;
      
      if (isCancelled) {
        cancelledTrains.push(trainNumber);
        cancelledMovement += trainMinutes;
        console.log(`🚂 Working train ${trainNumber}: ${minutesToTimeString(trainMinutes)} (CANCELLED)`);
      } else {
        console.log(`🚂 Working train ${trainNumber}: ${minutesToTimeString(trainMinutes)} (RUNNING)`);
      }
    } else {
      pilotingTrains.push(train);
      console.log(`🚂 Piloting train ${trainNumber}: ${minutesToTimeString(trainMinutes)} (NOT COUNTED)`);
    }
  }
  
  console.log(`📊 Base wheel movement: ${minutesToTimeString(baseWheelMovement)}, Cancelled: ${minutesToTimeString(cancelledMovement)}`);
  
  return {
    baseWheelMovement,
    cancelledMovement,
    workingTrains,
    pilotingTrains,
    cancelledTrains
  };
}

/**
 * Determine MEMU day type based on day of week and holiday status
 */
function getMemuDayType(dayOfWeek, isHoliday) {
  // Don't treat holidays as Sunday for MEMU
  // if (isHoliday) {
  //   return 'sunday';
  // }
  
  switch (dayOfWeek) {
    case 0: return 'sunday';           // Sunday
    case 1: return 'monday_saturday';  // Monday
    case 2: return 'monday_saturday';  // Tuesday
    case 3: return 'monday_saturday';  // Wednesday  
    case 4: return 'monday_saturday';  // Thursday
    case 5: return 'friday';           // Friday
    case 6: return 'saturday';         // Saturday
    default: return 'monday_saturday';
  }
}

/**
 * Get fallback day types if exact match not found
 */

function getMemuFallbackDayTypes(dayType) {
  const fallbacks = {
    'sunday': ['saturday_sunday', 'monday_friday', 'monday_saturday'],  // saturday_sunday first
    'saturday': ['saturday_sunday', 'monday_saturday', 'friday'],
    'monday_saturday': ['monday_friday', 'monday_thursday'],
    'monday_friday': ['monday_saturday', 'monday_thursday'],
    'monday_thursday': ['monday_saturday', 'monday_friday'],
    'friday': ['monday_friday', 'monday_saturday'],
    'saturday_sunday': ['saturday', 'sunday']
  };
  
  return fallbacks[dayType] || [];
}

/**
 * Parse MEMU duration string (e.g., "2:35", "9:21")
 */
function parseMemuDurationString(durationStr) {
  if (!durationStr && durationStr !== 0) return 0;
  
  // Convert to string if it's a number
  const str = durationStr.toString().trim();
  
  // Check if it contains a colon (H:MM or MM:SS format)
  if (str.includes(':')) {
    const parts = str.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return (hours * 60) + minutes;
  } else {
    // Plain number - already in minutes
    return parseInt(str) || 0;
  }
}
/**
 * Check if a detail is MEMU
 */
async function isMemuDetail(conn, detailNumber) {
  const query = `
    SELECT COUNT(*) as count 
    FROM memu_details 
    WHERE detail_number = ? AND is_active = TRUE
  `;
  
  const [rows] = await conn.query(query, [detailNumber]);
  return rows[0].count > 0;
}

// ===== EXPORT FUNCTIONS =====

module.exports = {
  calculateMemuWheelMovement,
  isMemuDetail,
  getMemuPatternForDate,
  getMemuTrainsForPattern,
  calculateMemuDutyHours,
  calculateMemuTrainsMovement,
  parseMemuDurationString
};