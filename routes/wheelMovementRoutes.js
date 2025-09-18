console.log('⚙️ CORRECTED WHEEL MOVEMENT ROUTES - WITH CMS ID FIX');

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { 
  generateDateRange, 
  parseTimeToMinutes, 
  calculateTrainWheelMovement, 
  parseDutyHours, 
  minutesToTimeString, 
  calculateCrossMidnightDutyHours 
} = require('../utils/helpers');
// const { 
//   calculateMemuWheelMovement, 
//   isMemuDetail 
// } = require('../utils/memuCalculator');

let memuCalculator;
try {
  memuCalculator = require('../utils/memuCalculator');
  console.log('✅ MEMU Calculator loaded successfully');
} catch (error) {
  console.warn('⚠️ MEMU Calculator not available:', error.message);
  memuCalculator = null;
}

// --- MEMU fallback helpers (IST-stable weekday + pattern resolver) ---
function istDow(ymd) {
  // 0=Sun..6=Sat, stable for 'YYYY-MM-DD' in IST
  return new Date(`${ymd}T00:00:00+05:30`).getUTCDay();
}

function memuDayTypeFor(ymd, isHoliday) {
  if (isHoliday) return 'sunday';
  const d = istDow(ymd);
  if (d === 0) return 'sunday';
  if (d === 6) return 'saturday';
  if (d === 5) return 'friday';
  // Your weekday data for 906/911/912 is under this key:
  return 'monday_saturday';
}

async function resolveMemuPatternId(conn, detailNumber, ymd, isHoliday) {
  const primary = memuDayTypeFor(ymd, isHoliday);
  const types = [...new Set([
    primary,
    'monday_saturday', 'monday_friday', 'monday_thursday',
    'saturday', 'friday', 'saturday_sunday', 'sunday'
  ])];

  for (const t of types) {
    const [p] = await conn.query(
      `SELECT id FROM memu_day_patterns
       WHERE detail_number=? AND day_type=? AND is_active=1 LIMIT 1`,
      [detailNumber, t]
    );
    if (!p.length) continue;
    const pid = p[0].id;
    const [[{ c }]] = await conn.query(
      `SELECT COUNT(*) AS c FROM memu_trains
       WHERE pattern_id=? AND is_active=1`,
      [pid]
    );
    if (c > 0) return pid;
  }
  return null;
}

async function computeMemuWheel(conn, patternId) {
  const [[{ wheel }]] = await conn.query(
    `SELECT DATE_FORMAT(SEC_TO_TIME(
        SUM(TIME_TO_SEC(TIMEDIFF(end_time,start_time)))
      ), '%H:%i') AS wheel
     FROM memu_trains
     WHERE pattern_id=? AND is_active=1 AND is_working=1`,
    [patternId]
  );
  const [[{ trains }]] = await conn.query(
    `SELECT COUNT(*) AS trains
     FROM memu_trains
     WHERE pattern_id=? AND is_active=1 AND is_working=1`,
    [patternId]
  );
  return { wheel: wheel || '00:00', trains: Number(trains || 0) };
}






// ===== MAIN WHEEL MOVEMENT ANALYSIS ENDPOINT =====
router.get("/", async (req, res) => {
  console.log('⚙️ WHEEL MOVEMENT ANALYSIS ROUTE HIT!');
  
  const { fromDate, toDate, detailNumber, motorman, office, reportType } = req.query;

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: "Missing required date parameters" });
  }

  console.log(`📊 Wheel movement analysis: ${fromDate} to ${toDate}`);

  const conn = await pool.getConnection();
  try {
    const analysis = await calculateWheelMovementCorrected(conn, {
      fromDate, toDate, detailNumber, motorman, office, reportType
    });

    res.json(analysis);
  } catch (err) {
    console.error("❌ Wheel movement analysis error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
});

// ===== MAIN CALCULATION FUNCTION - WITH CMS ID FIX =====
async function calculateWheelMovementCorrected(conn, filters) {
  console.log('🔄 CORRECTED: Starting wheel movement calculation with CMS ID fix...');
  
  const { fromDate, toDate, detailNumber, motorman, office, reportType } = filters;
  
  const dateRange = generateDateRange(fromDate, toDate);
  console.log(`📅 Processing date range: ${fromDate} to ${toDate} (${dateRange.length} days)`);

  // Get all train schedules
  const allTrainsQuery = `
    SELECT 
      t.*, 
      d.detail_number, 
      d.line as detail_line 
    FROM trains t 
    LEFT JOIN details d ON t.detail_id = d.detail_id 
    WHERE t.train_type IN ('working', 'piloting', 'waiting')
  `;
  const [allTrains] = await conn.query(allTrainsQuery);
  console.log(`🚂 Found ${allTrains.length} trains (working + piloting) with detail mapping`);

  // Get details for duty hours lookup
  const detailsQuery = `SELECT detail_number, total_duty_hours, total_wheel_movement FROM details`;
  const [allDetails] = await conn.query(detailsQuery);
  const detailsMap = new Map(allDetails.map(d => [d.detail_number, { 
    duty_hours: d.total_duty_hours, 
    wheel_movement: d.total_wheel_movement 
  }]));

  // Get waiting details
  const waitingDetailsQuery = `
    SELECT detail_number, sign_on_time, sign_off_time, total_duty_hours 
    FROM waiting_details
  `;
  const [waitingDetails] = await conn.query(waitingDetailsQuery);
  const waitingDetailsMap = new Map(waitingDetails.map(wd => [wd.detail_number, {
    sign_on_time: wd.sign_on_time,
    sign_off_time: wd.sign_off_time,
    total_duty_hours: wd.total_duty_hours
  }]));

  // Get holidays
  const holidaysQuery = `
    SELECT DATE_FORMAT(date, '%Y-%m-%d') as date_string, holiday, day 
    FROM holidays_list 
    WHERE date BETWEEN ${conn.escape(fromDate)} AND ${conn.escape(toDate)}
  `;
  const [holidays] = await conn.query(holidaysQuery);
  const holidayMap = new Map(holidays.map(h => [h.date_string, { holiday: h.holiday, day: h.day }]));

  // 🔧 CMS ID MAP: Store all motormen entries grouped by CMS ID
  const allMotormanResults = new Map();

  for (const currentDate of dateRange) {
    console.log(`\n📅 ==================== Processing ${currentDate} ====================`);
    
    // Get roster assignments
    let rosterQuery = `
      SELECT 
        dr.*,
        d.total_duty_hours,
        d.total_wheel_movement,
        d.line
      FROM duty_roster dr
      LEFT JOIN details d ON dr.detail_number = d.detail_number
      WHERE DATE(dr.date) = ${conn.escape(currentDate)}
    `;
    
    if (detailNumber) {
      rosterQuery += ` AND dr.detail_number = ${conn.escape(detailNumber)}`;
    }
    if (motorman) {
      rosterQuery += ` AND dr.motorman_name LIKE ${conn.escape(`%${motorman}%`)}`;
    }
    if (office) {
      rosterQuery += ` AND dr.office = ${conn.escape(office)}`;
    }

    const [dayAssignments] = await conn.query(rosterQuery);
    
    // 🔧 FIX: Get reassignments with CMS IDs
    const reassignmentsQuery = `
      SELECT rh.*, 
             rh.original_motorman_cmsid, 
             rh.new_motorman_cmsid
      FROM reassignment_history rh 
      WHERE rh.date = ${conn.escape(currentDate)} 
      ORDER BY rh.id
    `;
    const [dayReassignments] = await conn.query(reassignmentsQuery);
    
    const cancellationsQuery = `SELECT * FROM cancelled_trains WHERE DATE(date) = ${conn.escape(currentDate)}`;
    const [dayCancellations] = await conn.query(cancellationsQuery);

    const isSunday = new Date(currentDate).getDay() === 0;
    const holidayInfo = holidayMap.get(currentDate);
    const isHoliday = !!holidayInfo;
    const isSundayOrHoliday = isSunday || isHoliday;

    if (dayAssignments.length === 0) continue;

    // STEP 1: Process original assignments with CMS ID grouping
    let dayMotormanResults = await processOriginalAssignmentsCorrected(
      dayAssignments, 
      allTrains, 
      dayCancellations, 
      isSundayOrHoliday,
      currentDate,
      waitingDetailsMap,
      detailsMap
    );

    // STEP 2: Apply reassignments with CMS ID matching
    if (dayReassignments.length > 0) {
      dayMotormanResults = await applyReassignmentsCorrected(
        dayMotormanResults,
        dayReassignments,
        allTrains,
        detailsMap,
        waitingDetailsMap,
        dayCancellations,
        isSundayOrHoliday,
        currentDate
      );
    }

    // 🔧 FIX: Add to overall results using CMS ID as key
    for (const motormanResult of dayMotormanResults) {
      const motormanCmsId = motormanResult.motormanCmsId || `UNKNOWN_${motormanResult.motormanName}`;
      
      if (!allMotormanResults.has(motormanCmsId)) {
        allMotormanResults.set(motormanCmsId, {
          motormanName: motormanResult.motormanName,
          motormanCmsId: motormanResult.motormanCmsId,
          office: motormanResult.office,
          totalDays: 0,
          totalBaseWheelMovement: 0,
          totalDutyHours: 0,
          totalSundayDeductions: 0,
          totalRegularCancellations: 0,
          totalReassignmentAdjustments: 0,
          netWheelMovement: 0,
          totalTrainCount: 0,
          dailyBreakdown: []
        });
      }

      const overallResult = allMotormanResults.get(motormanCmsId);
      overallResult.totalDays++;
      overallResult.totalBaseWheelMovement += motormanResult.totalBaseWheelMovement;
      overallResult.totalDutyHours += motormanResult.totalDutyHours;
      overallResult.totalSundayDeductions += motormanResult.sundayDeductions;
      overallResult.totalRegularCancellations += motormanResult.regularCancellations;
      overallResult.totalReassignmentAdjustments += motormanResult.reassignmentAdjustments || 0;
      overallResult.totalTrainCount += motormanResult.trainCount;
      
      overallResult.dailyBreakdown.push({
        date: currentDate,
        isSunday: isSunday,
        isHoliday: isHoliday,
        holidayName: holidayInfo?.holiday || null,
        isSundayOrHoliday: isSundayOrHoliday,
        detailNumbers: motormanResult.detailNumbers,
        baseWheelMovement: motormanResult.totalBaseWheelMovement,
        dutyHours: motormanResult.totalDutyHours,
        sundayDeductions: motormanResult.sundayDeductions,
        regularCancellations: motormanResult.regularCancellations,
        reassignmentAdjustments: motormanResult.reassignmentAdjustments || 0,
        netWheelMovement: motormanResult.netWheelMovement,
        reassignments: motormanResult.reassignments || []
      });
    }
  }

  // Calculate final results
  const finalResults = Array.from(allMotormanResults.values()).map(motorman => {
    motorman.netWheelMovement = motorman.dailyBreakdown.reduce((sum, day) => sum + day.netWheelMovement, 0);
    return motorman;
  });

  const totals = {
    analysisDays: dateRange.length,
    totalBaseMovement: finalResults.reduce((sum, m) => sum + m.totalBaseWheelMovement, 0),
    totalDutyHours: finalResults.reduce((sum, m) => sum + m.totalDutyHours, 0),
    totalCancelledHours: finalResults.reduce((sum, m) => sum + m.totalRegularCancellations, 0),
    totalSundayDeductions: finalResults.reduce((sum, m) => sum + m.totalSundayDeductions, 0),
    totalReassignmentAdjustments: finalResults.reduce((sum, m) => sum + m.totalReassignmentAdjustments, 0),
    totalNetMovement: finalResults.reduce((sum, m) => sum + m.netWheelMovement, 0),
    totalHolidays: holidays.length
  };

  // Collect detail trains for display (without affecting calculations)
  const detailTrains = await collectDetailTrains(conn, dateRange, allTrains);

  return {
    period: { fromDate, toDate, totalDays: dateRange.length },
    totals,
    data: finalResults,
    detailTrains: detailTrains  // New: trains for each detail
  };
}

// commenting this new for all reassignment type to work.. for test 15:40
async function workingaAsON100925processOriginalAssignmentsCorrected(dayAssignments, allTrains, dayCancellations, isSundayOrHoliday, currentDate, waitingDetailsMap, detailsMap) {
  console.log(`  📋 STEP 1: Processing ${dayAssignments.length} original assignments with CMS ID grouping`);
  
  // 🔍 CRITICAL DEBUG: Log all assignments to identify the problem
  console.log(`🔍 ALL ASSIGNMENTS for ${currentDate}:`);
  dayAssignments.forEach((assignment, index) => {
    //console.log(`  ${index}: ${assignment.motorman_name} (${assignment.motorman_id}) → Detail ${assignment.detail_number}`);
  });
  
  const motormanMap = new Map();

  for (const assignment of dayAssignments) {
    const { motorman_name, motorman_id, detail_number, office } = assignment;
    
    const motormanKey = motorman_id || `UNKNOWN_${motorman_name}`;
    
    // 🔍 SPECIFIC DEBUG for MADHUKAR
    if (motorman_id === 'KYNS1272') {
      console.log(`\n🔍 PROCESSING MADHUKAR: Detail ${detail_number}`);
    }

    if (!motormanMap.has(motormanKey)) {
     // console.log(`🆕 Creating new entry for CMS ID: ${motormanKey}`);
      
      motormanMap.set(motormanKey, {
        motormanName: motorman_name,
        motormanCmsId: motorman_id,
        office: office,
        detailNumbers: detail_number,
        totalBaseWheelMovement: 0,
        totalDutyHours: 0,
        sundayDeductions: 0,
        regularCancellations: 0,
        netWheelMovement: 0,
        trainCount: 0,
        detailCount: 1,
        reassignmentAdjustments: 0,
        reassignments: [],
        processedDetails: new Set(),
        originalAssignments: [{ detailNumber: detail_number, type: 'original' }]
      });
    } else {
      const existing = motormanMap.get(motormanKey);
      
      // 🔍 DEBUG for MADHUKAR
      if (motorman_id === 'KYNS1272') {
        console.log(`📝 Existing entry found. Current processedDetails: [${Array.from(existing.processedDetails).join(', ')}]`);
        console.log(`📝 Checking if detail ${detail_number} already processed: ${existing.processedDetails.has(detail_number)}`);
      }
      
      if (!existing.processedDetails.has(detail_number)) {
        existing.detailNumbers += `, ${detail_number}`;
        existing.detailCount++;
        existing.originalAssignments.push({ detailNumber: detail_number, type: 'original' });
        
        if (motorman_id === 'KYNS1272') {
          console.log(`➕ Added detail ${detail_number}. New detailNumbers: ${existing.detailNumbers}`);
        }
      } else {
        if (motorman_id === 'KYNS1272') {
          console.log(`⚠️ Detail ${detail_number} already in detailNumbers, not adding again`);
        }
      }
    }

    const motormanData = motormanMap.get(motormanKey);
    
    // 🔍 CRITICAL DEBUG: Log state before processing check
    if (motorman_id === 'KYNS1272') {
      console.log(`🔍 BEFORE processing check for detail ${detail_number}:`);
      console.log(`   processedDetails: [${Array.from(motormanData.processedDetails).join(', ')}]`);
      console.log(`   has(${detail_number}): ${motormanData.processedDetails.has(detail_number)}`);
      console.log(`   Current totals: WM=${minutesToTimeString(motormanData.totalBaseWheelMovement)}, Duty=${minutesToTimeString(motormanData.totalDutyHours)}`);
    }
    
    // ✅ CRITICAL FIX: Skip if already processed
    if (motormanData.processedDetails.has(detail_number)) {
      if (motorman_id === 'KYNS1272') {
        console.log(`⏭️ SKIPPING detail ${detail_number} - already processed`);
      }
      continue; // This should prevent double processing
    }

    // 🔍 DEBUG: Confirm we're about to process
    if (motorman_id === 'KYNS1272') {
      console.log(`🚀 PROCESSING detail ${detail_number} for the first time`);
    }

    // 🚂 MEMU DETECTION AND PROCESSING
    if (memuCalculator && detail_number) {
      try {
        const memuConn = await pool.getConnection();
        const isMemuDetailResult = await memuCalculator.isMemuDetail(memuConn, detail_number);
        
        if (isMemuDetailResult) {
          if (motorman_id === 'KYNS1272') {
            console.log(`🚂 MEMU DETAIL DETECTED: ${detail_number}`);
          }
          
          const memuResult = await memuCalculator.calculateMemuWheelMovement(
            memuConn, 
            detail_number, 
            currentDate, 
            motorman_name, 
            motorman_id, 
            office, 
            isSundayOrHoliday, 
            dayCancellations
          );
          
          memuConn.release();
          
          if (memuResult.success) {
            // Apply MEMU results
            motormanData.totalBaseWheelMovement += memuResult.baseWheelMovement;
            motormanData.totalDutyHours += memuResult.dutyHours;
            motormanData.regularCancellations += memuResult.regularCancellations;
            motormanData.trainCount += memuResult.totalTrains;
            motormanData.isMemuResult = true;
            
            // ✅ CRITICAL: Mark as processed
            motormanData.processedDetails.add(detail_number);
            
            if (motorman_id === 'KYNS1272') {
              console.log(`✅ MEMU detail ${detail_number} processed successfully`);
              console.log(`   Added: WM=${minutesToTimeString(memuResult.baseWheelMovement)}, Duty=${minutesToTimeString(memuResult.dutyHours)}`);
              console.log(`   New totals: WM=${minutesToTimeString(motormanData.totalBaseWheelMovement)}, Duty=${minutesToTimeString(motormanData.totalDutyHours)}`);
              console.log(`   processedDetails now: [${Array.from(motormanData.processedDetails).join(', ')}]`);
            }
            
            // Continue to next assignment
            continue;
            
          } else {
            console.warn(`⚠️ MEMU calculation failed for detail ${detail_number}: ${memuResult.error || 'Unknown error'}`);
            // Fall through to regular processing
          }
        } else {
          if (motorman_id === 'KYNS1272') {
            console.log(`📋 Regular detail: ${detail_number} - Using standard calculation`);
          }
          memuConn.release();
          // Fall through to regular processing
        }
        
      } catch (error) {
        console.error(`❌ MEMU processing error for detail ${detail_number}:`, error);
        // Fall through to regular processing
      }
    }

    // 📋 REGULAR DETAIL PROCESSING
    if (motorman_id === 'KYNS1272') {
      console.log(`📋 Processing regular detail: ${detail_number}`);
    }
    
    const isWaitingDetail = waitingDetailsMap.has(detail_number);
    
    if (isWaitingDetail) {
      // WAITING DETAIL
      const waitingInfo = waitingDetailsMap.get(detail_number);
      const waitingDutyMinutes = calculateCrossMidnightDutyHours(waitingInfo.sign_on_time, waitingInfo.sign_off_time);
      motormanData.totalDutyHours += waitingDutyMinutes;
      
      if (motorman_id === 'KYNS1272') {
        console.log(`⏰ WAITING Detail ${detail_number}: Added ${minutesToTimeString(waitingDutyMinutes)} duty`);
      }
      
    } else {
      // WORKING DETAIL
      const detailInfo = detailsMap.get(detail_number);
      if (detailInfo) {
        const detailDutyHours = parseDutyHours(detailInfo?.duty_hours || '0:00');
        motormanData.totalDutyHours += detailDutyHours;
        
        if (motorman_id === 'KYNS1272') {
          console.log(`⏰ Working Detail ${detail_number}: Added ${minutesToTimeString(detailDutyHours)} duty (from details table)`);
        }
      }
      
      // Get trains for this detail
      const allDetailTrains = allTrains.filter(train => 
        train.detail_number == detail_number
      );

      const workingTrains = allDetailTrains.filter(train => 
        train.train_type === 'working' && 
        !isTrainPiloting(train.train_number)
      );

      let baseWheelMovement = 0;
      let sundayDeductions = 0;
      let regularCancellations = 0;

      // Calculate wheel movement
      for (const train of workingTrains) {
        if (train.start_time && train.end_time) {
          const trainWheelMovement = calculateTrainWheelMovement(train.start_time, train.end_time);
          baseWheelMovement += trainWheelMovement;
          
          const isRegularlyCancelled = dayCancellations.some(c => {
            const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
            const currentTrain = train.train_number.trim().replace(/\s+/g, '').toLowerCase();
            return cancelledTrain === currentTrain;
          });
          
          if (isRegularlyCancelled) {
            regularCancellations += trainWheelMovement;
          } else if (isSundayOrHoliday && train.status === 'cancelled') {
            sundayDeductions += trainWheelMovement;
          }
        }
      }

      motormanData.totalBaseWheelMovement += baseWheelMovement;
      motormanData.sundayDeductions += sundayDeductions;
      motormanData.regularCancellations += regularCancellations;
      motormanData.trainCount += workingTrains.length;
      
      if (motorman_id === 'KYNS1272') {
        console.log(`🚂 Working Detail ${detail_number}: Added WM=${minutesToTimeString(baseWheelMovement)}, Trains=${workingTrains.length}`);
      }
    }

    // ✅ CRITICAL: Mark regular detail as processed
    motormanData.processedDetails.add(detail_number);
    
    if (motorman_id === 'KYNS1272') {
      console.log(`✅ Regular detail ${detail_number} processed and marked complete`);
      console.log(`   New totals: WM=${minutesToTimeString(motormanData.totalBaseWheelMovement)}, Duty=${minutesToTimeString(motormanData.totalDutyHours)}`);
      console.log(`   processedDetails now: [${Array.from(motormanData.processedDetails).join(', ')}]\n`);
    }
  }

  // Calculate net wheel movement
  return Array.from(motormanMap.values()).map(motorman => {
    motorman.netWheelMovement = Math.max(0, 
      motorman.totalBaseWheelMovement - 
      motorman.sundayDeductions - 
      motorman.regularCancellations
    );
    
    // 🔍 FINAL DEBUG for MADHUKAR
    if (motorman.motormanCmsId === 'KYNS1272') {
      console.log(`\n🎯 FINAL RESULT for ${motorman.motormanName}:`);
      console.log(`   Details processed: [${Array.from(motorman.processedDetails).join(', ')}]`);
      console.log(`   Base WM: ${minutesToTimeString(motorman.totalBaseWheelMovement)}`);
      console.log(`   Net WM: ${minutesToTimeString(motorman.netWheelMovement)}`);
      console.log(`   Total Duty: ${minutesToTimeString(motorman.totalDutyHours)}`);
      console.log(`   Expected: WM=5:13, Duty=13:39`);
    }
    
    return motorman;
  });
}

async function processOriginalAssignmentsCorrected(
  dayAssignments,
  allTrains,
  dayCancellations,
  isSundayOrHoliday,
  currentDate,
  waitingDetailsMap,
  detailsMap
) {
  console.log(`  📋 STEP 1: Processing ${dayAssignments.length} original assignments with CMS ID grouping`);
  console.log(`🔍 ALL ASSIGNMENTS for ${currentDate}:`);
  dayAssignments.forEach((assignment, index) => {
    // console.log(`  ${index}: ${assignment.motorman_name} (${assignment.motorman_id}) → Detail ${assignment.detail_number}`);
  });

  // ─────────────────────────────────────────────────────────────────
  // Local helpers (scoped to this function to avoid touching other files)
  // ─────────────────────────────────────────────────────────────────
  const istDow = (ymd) => new Date(`${ymd}T00:00:00+05:30`).getUTCDay(); // 0..6 in IST
  const memuDayTypeFor = (ymd, isHoliday) => {
    if (isHoliday) return 'sunday';
    const d = istDow(ymd);
    if (d === 0) return 'sunday';
    if (d === 6) return 'saturday';
    if (d === 5) return 'friday';
    // Weekdays in your data for 906/911/912 are keyed as monday_saturday
    return 'monday_saturday';
  };

  // Get the primary (exact) day's pattern id (if any) and its active-train count
  const getPrimaryPatternInfo = async (conn, detailNumber, ymd, isHoliday) => {
    const primary = memuDayTypeFor(ymd, isHoliday);
    const [pats] = await conn.query(
      `SELECT * FROM memu_day_patterns
       WHERE detail_number=? AND day_type=? AND is_active=1
       LIMIT 1`,
      [detailNumber, primary]
    );
    if (!pats.length) return { primaryId: null, primaryDayType: primary, trainCount: 0, row: null };
    const pid = pats[0].id;
    const [[{ c }]] = await conn.query(
      `SELECT COUNT(*) AS c
       FROM memu_trains
       WHERE pattern_id=? AND is_active=1`,
      [pid]
    );
    return { primaryId: pid, primaryDayType: primary, trainCount: Number(c || 0), row: pats[0] };
  };

  // Existing fallback: find the first pattern with any active trains (kept as-is)
  const resolveMemuPatternId = async (conn, detailNumber, ymd, isHoliday) => {
    const primary = memuDayTypeFor(ymd, isHoliday);
    const candidates = [...new Set([
      primary,
      'monday_saturday', 'monday_friday', 'monday_thursday',
      'friday', 'saturday', 'saturday_sunday', 'sunday'
    ])];
    for (const t of candidates) {
      const [pats] = await conn.query(
        `SELECT id FROM memu_day_patterns
         WHERE detail_number=? AND day_type=? AND is_active=1
         LIMIT 1`,
        [detailNumber, t]
      );
      if (!pats.length) continue;
      const pid = pats[0].id;
      const [[{ c }]] = await conn.query(
        `SELECT COUNT(*) AS c
         FROM memu_trains
         WHERE pattern_id=? AND is_active=1`,
        [pid]
      );
      if (c > 0) return pid;
    }
    return null;
  };

  const computeMemuWheel = async (conn, patternId) => {
    // cross-midnight safe by schema flags elsewhere; here times are same-day or handled upstream
    const [[{ wheel }]] = await conn.query(
      `SELECT DATE_FORMAT(
          SEC_TO_TIME(SUM(TIME_TO_SEC(
            CASE
              WHEN end_time < start_time
                THEN (TIME_TO_SEC(end_time) + 24*3600) - TIME_TO_SEC(start_time)
              ELSE TIME_TO_SEC(end_time) - TIME_TO_SEC(start_time)
            END
          ))),
          '%H:%i'
        ) AS wheel
       FROM memu_trains
       WHERE pattern_id=? AND is_active=1 AND is_working=1`,
      [patternId]
    );
    const [[{ trains }]] = await conn.query(
      `SELECT COUNT(*) AS trains
       FROM memu_trains
       WHERE pattern_id=? AND is_active=1 AND is_working=1`,
      [patternId]
    );
    return { wheel: wheel || '00:00', trains: Number(trains || 0) };
  };

  const motormanMap = new Map();

  for (const assignment of dayAssignments) {
    const { motorman_name, motorman_id, detail_number, office } = assignment;
    const motormanKey = motorman_id || `UNKNOWN_${motorman_name}`;

    if (!motormanMap.has(motormanKey)) {
      motormanMap.set(motormanKey, {
        motormanName: motorman_name,
        motormanCmsId: motorman_id,
        office: office,
        detailNumbers: detail_number,
        totalBaseWheelMovement: 0,
        totalDutyHours: 0,
        sundayDeductions: 0,
        regularCancellations: 0,
        netWheelMovement: 0,
        trainCount: 0,
        detailCount: 1,
        reassignmentAdjustments: 0,
        reassignments: [],
        processedDetails: new Set(),
        originalAssignments: [{ detailNumber: detail_number, type: 'original' }],
        isMemuResult: false
      });
    } else {
      const existing = motormanMap.get(motormanKey);
      if (!existing.processedDetails.has(detail_number)) {
        existing.detailNumbers += `, ${detail_number}`;
        existing.detailCount++;
        existing.originalAssignments.push({ detailNumber: detail_number, type: 'original' });
      }
    }

    const motormanData = motormanMap.get(motormanKey);

    // DEBUG for 908
    if (detail_number === '908') {
      const dayOfWeek = new Date(currentDate).getDay();
      if (dayOfWeek === 0) { // Sunday
        console.log(`🔍 908 Sunday ${currentDate}:`);
        console.log(`   Assignment: ${motorman_name} (${motorman_id})`);
        console.log(`   isSundayOrHoliday: ${isSundayOrHoliday}`);
        console.log(`   processedDetails has 908: ${motormanData.processedDetails.has('908')}`);
      }
    }

    // ✅ Skip if already processed
    if (motormanData.processedDetails.has(detail_number)) {
      continue;
    }

    // ─────────────────────────────────────────────────────────────────
    // 🚂 MEMU DETECTION & CALCULATOR (with zero-train guard)
    // ─────────────────────────────────────────────────────────────────
    let calculatorBase = 0;
    let calculatorDuty = 0;
    let calculatorTrains = 0;
    let calculatorSucceeded = false;

    if (memuCalculator && detail_number) {
      try {
        const memuConn = await pool.getConnection();
        const isMemuDetailResult = await memuCalculator.isMemuDetail(memuConn, detail_number);

        if (isMemuDetailResult) {
          const memuResult = await memuCalculator.calculateMemuWheelMovement(
            memuConn,
            detail_number,
            currentDate,
            motorman_name,
            motorman_id,
            office,
            isSundayOrHoliday,
            dayCancellations
          );
          memuConn.release();

          if (memuResult && memuResult.success) {
            calculatorBase   = Number(memuResult.baseWheelMovement || 0);
            calculatorDuty   = Number(memuResult.dutyHours || 0);
            calculatorTrains = Number(memuResult.totalTrains || 0);
            calculatorSucceeded = true;

            // Enhanced debug for 908
            if (detail_number === '908') {
              console.log(`🔍 908 MEMU Result: Base=${calculatorBase}, Duty=${calculatorDuty}, Trains=${calculatorTrains}`);
              console.log(`🔍 908 Before zero-check: Base=${calculatorBase} (type: ${typeof calculatorBase}), Success=${calculatorSucceeded}`);
              console.log(`   Condition check: (${calculatorBase} === 0 && ${calculatorSucceeded}) = ${calculatorBase === 0 && calculatorSucceeded}`);
            }

            // 🔑 Check for zero WHEEL MOVEMENT (handles piloting-only patterns)
            if (calculatorBase === 0 && calculatorSucceeded) {
              motormanData.totalBaseWheelMovement += 0;
              motormanData.totalDutyHours += calculatorDuty;  // Use the calculated duty
              motormanData.trainCount += calculatorTrains;
              motormanData.isMemuResult = true;
              motormanData.processedDetails.add(detail_number);
              
              console.log(`✅ MEMU zero-movement honored for ${detail_number}: WM=0, Duty=${minutesToTimeString(calculatorDuty)}, Trains=${calculatorTrains}`);
              continue; // done for this detail
            }

            // Normal MEMU success with base > 0
            if (calculatorBase > 0) {
              motormanData.totalBaseWheelMovement += calculatorBase;
              motormanData.totalDutyHours         += calculatorDuty;
              motormanData.regularCancellations   += Number(memuResult.regularCancellations || 0);
              motormanData.trainCount             += calculatorTrains;
              motormanData.isMemuResult            = true;
              motormanData.processedDetails.add(detail_number);
              continue; // done for this detail
            }

            // If base is 0 and not a zero-train case (unlikely), allow DB fallback below.
          }
        } else {
          memuConn.release();
        }
      } catch (error) {
        console.error(`❌ MEMU processing error for detail ${detail_number}:`, error);
        // fall through to fallback/regular
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 🛟 MEMU DB FALLBACK / OVERRIDE
    // - Runs when calculator missing or produced base=0
    // - NEW GUARD #2: if primary day's pattern exists with zero trains → honor 0 WM, no fallback
    // ─────────────────────────────────────────────────────────────────
    try {
      if (!motormanData.processedDetails.has(detail_number)) {
        
        // FIX: Skip fallback if calculator already succeeded with zero base
        if (calculatorSucceeded && calculatorBase === 0) {
          // IMPORTANT: Add the values before skipping
          motormanData.totalBaseWheelMovement += 0;
          motormanData.totalDutyHours += calculatorDuty;  // Add the duty hours!
          motormanData.trainCount += calculatorTrains;
          motormanData.isMemuResult = true;
          motormanData.processedDetails.add(detail_number);
          
          console.log(`⏭️ Skipping fallback for ${detail_number} - calculator already handled zero-movement case`);
          console.log(`   Added duty: ${calculatorDuty} minutes`);
          
          // Debug for 908
          if (detail_number === '908') {
            console.log(`🔍 908 After fallback skip:`);
            console.log(`   motormanData.totalDutyHours: ${motormanData.totalDutyHours}`);
            console.log(`   motormanData.processedDetails: ${Array.from(motormanData.processedDetails).join(', ')}`);
            console.log(`   motormanData.isMemuResult: ${motormanData.isMemuResult}`);
          }
          
          continue;
        }
        
        let db;
        try {
          db = await pool.getConnection();

          // NEW: check the primary day's pattern first
          const { primaryId, trainCount: primaryTrains } =
            await getPrimaryPatternInfo(db, detail_number, currentDate, isSundayOrHoliday);

          if (primaryId && primaryTrains === 0) {
            // exact-day pattern exists but has no trains → WM = 0, no fallback
            const detailInfo = detailsMap.get(detail_number);
            const dutyMin = detailInfo?.duty_hours ? parseDutyHours(detailInfo.duty_hours) : 0;

            // remove any zeroes previously tentatively added (usually 0 anyway)
            motormanData.totalBaseWheelMovement -= calculatorBase || 0;
            motormanData.totalDutyHours         -= calculatorDuty || 0;

            motormanData.totalBaseWheelMovement += 0;
            motormanData.totalDutyHours         += 0;  // Ensure 0 duty for zero-service
            motormanData.trainCount             += 0;
            motormanData.isMemuResult            = true;
            motormanData.processedDetails.add(detail_number);

            console.log(`✅ MEMU zero-service honored for ${detail_number} (primary pattern has zero trains).`);
            // continue to next assignment
            continue;
          }

          // Otherwise: find a pattern that actually has trains (legacy behavior)
          const pid = await resolveMemuPatternId(db, detail_number, currentDate, isSundayOrHoliday);
          if (pid) {
            const { wheel, trains } = await computeMemuWheel(db, pid);
            if (wheel && wheel !== '00:00') {
              const [h, m] = wheel.split(':').map(Number);
              const baseMin = (h * 60) + m;

              const detailInfo = detailsMap.get(detail_number);
              const dutyMin = detailInfo?.duty_hours ? parseDutyHours(detailInfo.duty_hours) : 0;

              // If calculator previously wrote zeros, reverse them (no-op if 0)
              motormanData.totalBaseWheelMovement -= calculatorBase || 0;
              motormanData.totalDutyHours         -= calculatorDuty || 0;

              motormanData.totalBaseWheelMovement += baseMin;
              motormanData.totalDutyHours         += dutyMin;
              motormanData.trainCount             += trains;
              motormanData.isMemuResult            = true;
              motormanData.processedDetails.add(detail_number);

              console.log(`✅ MEMU fallback applied for ${detail_number}: WM=${minutesToTimeString(baseMin)}, Duty=${minutesToTimeString(dutyMin)}`);
              // fall through (processedDetails prevents double work)
            }
          }
        } finally {
          if (db) db.release();
        }
      }
    } catch (e) {
      console.warn('MEMU DB fallback failed:', e.message);
      // fall through to regular processing
    }

    // ─────────────────────────────────────────────────────────────────
    // 📋 REGULAR DETAIL PROCESSING (unchanged)
    // ─────────────────────────────────────────────────────────────────────
    const isWaitingDetail = waitingDetailsMap.has(detail_number);

    if (isWaitingDetail) {
      const waitingInfo = waitingDetailsMap.get(detail_number);
      const waitingDutyMinutes = calculateCrossMidnightDutyHours(
        waitingInfo.sign_on_time, waitingInfo.sign_off_time
      );
      motormanData.totalDutyHours += waitingDutyMinutes;
    } else {
      // Working detail
      const detailInfo = detailsMap.get(detail_number);
      if (detailInfo) {
        const detailDutyHours = parseDutyHours(detailInfo?.duty_hours || '0:00');
        motormanData.totalDutyHours += detailDutyHours;
      }

      const allDetailTrains = allTrains.filter(t => t.detail_number == detail_number);
      const workingTrains = allDetailTrains.filter(t =>
        t.train_type === 'working' && !isTrainPiloting(t.train_number)
      );

      let baseWheelMovement = 0;
      let sundayDeductions = 0;
      let regularCancellations = 0;

      for (const train of workingTrains) {
        if (train.start_time && train.end_time) {
          const trainWheelMovement = calculateTrainWheelMovement(train.start_time, train.end_time);
          baseWheelMovement += trainWheelMovement;

          const isRegularlyCancelled = dayCancellations.some(c => {
            const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
            const currentTrain = train.train_number.trim().replace(/\s+/g, '').toLowerCase();
            return cancelledTrain === currentTrain;
          });

          if (isRegularlyCancelled) {
            regularCancellations += trainWheelMovement;
          } else if (isSundayOrHoliday && train.status === 'cancelled') {
            sundayDeductions += trainWheelMovement;
          }
        }
      }

      motormanData.totalBaseWheelMovement += baseWheelMovement;
      motormanData.sundayDeductions += sundayDeductions;
      motormanData.regularCancellations += regularCancellations;
      motormanData.trainCount += workingTrains.length;
    }

    motormanData.processedDetails.add(detail_number);
  }

  // Finalize
  return Array.from(motormanMap.values()).map(motorman => {
    motorman.netWheelMovement = Math.max(
      0,
      motorman.totalBaseWheelMovement - motorman.sundayDeductions - motorman.regularCancellations
    );
    
    // Debug for 908
    if (motorman.detailNumbers && motorman.detailNumbers.includes('908')) {
      console.log(`🔍 908 FINAL: ${motorman.motormanName}`);
      console.log(`   detailNumbers: ${motorman.detailNumbers}`);
      console.log(`   totalDutyHours: ${motorman.totalDutyHours}`);
      console.log(`   isMemuResult: ${motorman.isMemuResult}`);
    }
    
    return motorman;
  });
}

// Helper function to check if train is piloting
function isTrainPiloting(trainNumber) {
  const trainNum = trainNumber.toLowerCase();
  return trainNum.includes('p/pl') || trainNum.includes('pil') || trainNum.includes('p/');
}
// =====================================================
// NEW HELPER FUNCTION: Process Regular (Non-MEMU) Details
// =====================================================

async function processRegularDetail(motormanData, detail_number, allTrains, dayCancellations, isSundayOrHoliday, waitingDetailsMap, detailsMap) {
  //console.log(`    📋 Processing regular detail: ${detail_number}`);
  
  const isWaitingDetail = waitingDetailsMap.has(detail_number);
  
  if (isWaitingDetail) {
    // WAITING DETAIL
    const waitingInfo = waitingDetailsMap.get(detail_number);
    const waitingDutyMinutes = calculateCrossMidnightDutyHours(waitingInfo.sign_on_time, waitingInfo.sign_off_time);
    motormanData.totalDutyHours += waitingDutyMinutes;
    
   // console.log(`      ⏰ WAITING Detail ${detail_number}: ${minutesToTimeString(waitingDutyMinutes)} duty (no wheel movement)`);
    
  } else {
    // WORKING DETAIL
    const detailInfo = detailsMap.get(detail_number);
    if (detailInfo) {
      const detailDutyHours = parseDutyHours(detailInfo.duty_hours || '8:00');
      motormanData.totalDutyHours += detailDutyHours;
     // console.log(`      ⏰ Working Detail ${detail_number}: Using stored duty hours ${minutesToTimeString(detailDutyHours)}`);
    }
    
    // Get ALL trains for this detail (working + piloting)
    const allDetailTrains = allTrains.filter(train => 
      train.detail_number == detail_number
    );

    // SEPARATE: Working trains for WHEEL MOVEMENT calculation
    const workingTrains = allDetailTrains.filter(train => 
      train.train_type === 'working' && 
      !isTrainPiloting(train.train_number)
    );

    //console.log(`      🚂 Detail ${detail_number}: ${allDetailTrains.length} total trains, ${workingTrains.length} working (non-piloting)`);

    let baseWheelMovement = 0;
    let sundayDeductions = 0;
    let regularCancellations = 0;

    // Calculate wheel movement using ONLY working trains
    for (const train of workingTrains) {
      if (train.start_time && train.end_time) {
        const trainWheelMovement = calculateTrainWheelMovement(train.start_time, train.end_time);
        baseWheelMovement += trainWheelMovement;
        
        const isRegularlyCancelled = dayCancellations.some(c => {
          const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
          const currentTrain = train.train_number.trim().replace(/\s+/g, '').toLowerCase();
          return cancelledTrain === currentTrain;
        });
        
        if (isRegularlyCancelled) {
          regularCancellations += trainWheelMovement;
         // console.log(`        🚂 Train ${train.train_number}: ${minutesToTimeString(trainWheelMovement)} (REGULARLY CANCELLED)`);
        } else if (isSundayOrHoliday && train.status === 'cancelled') {
          sundayDeductions += trainWheelMovement;
         // console.log(`        🚂 Train ${train.train_number}: ${minutesToTimeString(trainWheelMovement)} (SUNDAY/HOLIDAY CANCELLED)`);
        } else {
         // console.log(`        🚂 Train ${train.train_number}: ${minutesToTimeString(trainWheelMovement)} (RUNNING)`);
        }
      }
    }

    motormanData.totalBaseWheelMovement += baseWheelMovement;
    motormanData.sundayDeductions += sundayDeductions;
    motormanData.regularCancellations += regularCancellations;
    motormanData.trainCount += workingTrains.length;
    
   // console.log(`      📊 Detail ${detail_number}: Base movement: ${minutesToTimeString(baseWheelMovement)}, Working trains: ${workingTrains.length}`);
  }
}

// =====================================================
// TESTING ENDPOINT: Test MEMU calculation for specific detail
// ADD THIS NEW ROUTE to wheelMovementRoutes.js
// =====================================================

// Test MEMU calculation for specific detail and date
router.get("/test-memu/:detailNumber/:date", async (req, res) => {
  console.log('🧪 TEST MEMU CALCULATION ROUTE HIT!');
  
  const { detailNumber, date } = req.params;
  const { motormanName = 'TEST_MOTORMAN', isHoliday = 'false' } = req.query;
  
  console.log(`🧪 Testing MEMU calculation for detail ${detailNumber} on ${date}`);

  const conn = await pool.getConnection();
  try {
    // Check if it's MEMU
    
    // const isMemuDetailResult = await isMemuDetail(conn, detailNumber);
    const isMemuDetailResult = await memuCalculator.isMemuDetail(conn, detailNumber);
    
    if (!isMemuDetailResult) {
      return res.json({
        success: false,
        message: `Detail ${detailNumber} is not a MEMU detail`,
        detailNumber,
        date
      });
    }
    
    // Get sample cancellations for the date
    const cancellationsQuery = `SELECT * FROM cancelled_trains WHERE DATE(date) = ?`;
    const [cancellations] = await conn.query(cancellationsQuery, [date]);
    
    // Run MEMU calculation
    // const result = await calculateMemuWheelMovement(
      const result = await memuCalculator.calculateMemuWheelMovement(
      conn, 
      detailNumber, 
      date, 
      motormanName, 
      'TEST123', // Test CMS ID
      'KYN',     // Test office
      isHoliday === 'true', 
      cancellations
    );
    
    console.log(`🧪 Test result:`, result.success ? 'SUCCESS' : 'FAILED');
    
    res.json({
      testResult: result,
      cancellationsFound: cancellations.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ MEMU test error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      detailNumber,
      date
    });
  } finally {
    conn.release();
  }
});

async function applyReassignmentsCorrected(
  dayResults,
  reassignments,
  allTrains,
  detailsMap,
  waitingDetailsMap,
  dayCancellations,
  isSundayOrHoliday,
  currentDate
) {
  console.log(`🔄 STEP 2: Applying ${reassignments.length} reassignments with enhanced MEMU tracking`);
  
  // 🔑 Keyed by CMS ID (fallback to UNKNOWN_<name>)
  const resultMap = new Map();

  // ---- Initialize with Step-1 results and track individual MEMU contributions ----
  for (const result of dayResults) {
    const motormanKey = result.motormanCmsId || `UNKNOWN_${result.motormanName}`;

    resultMap.set(motormanKey, {
      ...result,
      reassignmentAdjustments: 0,
      reassignments: [],
      isReassigned: false,
      detailBreakdown: new Map(),
      
      // ⛳ Keep originals from STEP-1 to recover MEMU-only portion later
      _origBase: result.totalBaseWheelMovement || 0,
      _origDuty: result.totalDutyHours || 0,
      
      // 🚂 NEW: Track individual MEMU contributions from Step 1
      memuContributions: new Map(),  // Map<detailNumber, {baseMovement, dutyHours, regularCancellations}>
      totalMemuBase: 0,
      totalMemuDuty: 0
    });

    const motorman = resultMap.get(motormanKey);

    // 🚂 NEW: Build MEMU contributions map by recalculating each detail
    const detailNumbers = (result.detailNumbers || "").split(", ").filter(Boolean);
    
    for (const detailNumRaw of detailNumbers) {
      const cleanDetailNum = detailNumRaw.trim();
      if (!cleanDetailNum) continue;

      // Check if this detail is MEMU and get its individual contribution
      let isMemuDetail = false;
      if (memuCalculator) {
        try {
          const memuConn = await pool.getConnection();
          isMemuDetail = await memuCalculator.isMemuDetail(memuConn, cleanDetailNum);
          
          if (isMemuDetail) {
            console.log(`🚂 Recalculating MEMU detail ${cleanDetailNum} for tracking`);
            
            const memuResult = await memuCalculator.calculateMemuWheelMovement(
              memuConn, 
              cleanDetailNum, 
              currentDate, 
              result.motormanName, 
              result.motormanCmsId, 
              result.office, 
              isSundayOrHoliday, 
              dayCancellations
            );
            
            if (memuResult.success) {
              // Store individual MEMU contribution
              motorman.memuContributions.set(cleanDetailNum, {
                baseMovement: memuResult.baseWheelMovement,
                dutyHours: memuResult.dutyHours,
                regularCancellations: memuResult.regularCancellations,
                totalTrains: memuResult.totalTrains
              });
              
              motorman.totalMemuBase += memuResult.baseWheelMovement;
              motorman.totalMemuDuty += memuResult.dutyHours;
              
              console.log(`   ✅ MEMU ${cleanDetailNum}: WM=${minutesToTimeString(memuResult.baseWheelMovement)}, Duty=${minutesToTimeString(memuResult.dutyHours)}`);
            }
          }
          
          memuConn.release();
        } catch (error) {
          console.error(`Error checking/calculating MEMU detail ${cleanDetailNum}:`, error);
        }
      }

      // Build regular detail breakdown (for non-MEMU or as fallback)
      if (waitingDetailsMap.has(cleanDetailNum)) {
        // Waiting detail: duty only
        const waitingInfo = waitingDetailsMap.get(cleanDetailNum);
        const waitingDutyMinutes = calculateCrossMidnightDutyHours(
          waitingInfo.sign_on_time,
          waitingInfo.sign_off_time
        );

        motorman.detailBreakdown.set(cleanDetailNum, {
          type: "waiting",
          baseMovement: 0,
          sundayDeductions: 0,
          regularCancellations: 0,
          dutyHours: waitingDutyMinutes,
          trainCount: 0,
          isMemu: false
        });
      } else {
        // Working detail: compute from trains/details (will be overridden for MEMU in final calc)
        const detailCalc = calculateDetailMovementAndDuty(
          cleanDetailNum,
          allTrains,
          detailsMap,
          dayCancellations,
          isSundayOrHoliday
        );

        motorman.detailBreakdown.set(cleanDetailNum, {
          type: "working",
          baseMovement: detailCalc.baseMovement,
          sundayDeductions: detailCalc.sundayDeductions,
          regularCancellations: detailCalc.regularCancellations,
          dutyHours: detailCalc.dutyHours,
          trainCount: detailCalc.trainCount,
          isMemu: isMemuDetail  // 🚂 Mark MEMU details
        });
      }
    }
    
    console.log(`  ✅ ${result.motormanName}: ${motorman.memuContributions.size} MEMU details tracked, Total MEMU: WM=${minutesToTimeString(motorman.totalMemuBase)}, Duty=${minutesToTimeString(motorman.totalMemuDuty)}`);
  }

  // ---- Apply reassignments (enhanced with MEMU tracking) ----
  for (const reassignment of reassignments) {
    const {
      detail_number,
      original_motorman,
      original_motorman_cmsid,
      new_motorman,
      new_motorman_cmsid,
      reassignment_type,
      reason
    } = reassignment;

    const originalKey = original_motorman_cmsid || `UNKNOWN_${original_motorman}`;
    const newKey = new_motorman_cmsid || `UNKNOWN_${new_motorman}`;
    
    console.log(`\n🔄 Processing reassignment: Detail ${detail_number} from ${original_motorman} to ${new_motorman}`);

    // 🚂 Check if this is a MEMU detail being reassigned
    let isMemuDetail = false;
    let memuContribution = null;
    
    if (memuCalculator) {
      try {
        const memuConn = await pool.getConnection();
        isMemuDetail = await memuCalculator.isMemuDetail(memuConn, detail_number);
        memuConn.release();
      } catch (error) {
        console.error(`Error checking MEMU detail ${detail_number}:`, error);
      }
    }

    if (reassignment_type === "full_detail") {
      await processFullDetailReassignmentEnhanced(
        resultMap,
        reassignment,
        allTrains,
        detailsMap,
        waitingDetailsMap,
        dayCancellations,
        isSundayOrHoliday,
        currentDate,
        originalKey,
        newKey,
        isMemuDetail
      );
    } else if (reassignment_type === "partial_detail") {
      // For partial reassignments, we'll need more complex logic
      console.warn(`⚠️ Partial MEMU reassignments need special handling for detail ${detail_number}`);
      
      await processPartialDetailReassignmentWithCmsId(
        resultMap,
        reassignment,
        allTrains,
        detailsMap,
        waitingDetailsMap,
        dayCancellations,
        isSundayOrHoliday,
        waitingDetailsMap.has(detail_number),
        originalKey,
        newKey
      );
    } else if (reassignment_type === "detail_transfer") {
      console.log(`🔄 Processing DETAIL TRANSFER: Detail ${detail_number} from ${original_motorman} to ${new_motorman}`);
      
      await processFullDetailReassignmentEnhanced(
          resultMap,
          reassignment,
          allTrains,
          detailsMap,
          waitingDetailsMap,
          dayCancellations,
          isSundayOrHoliday,
          currentDate,
          originalKey,
          newKey,
          false // isMemuDetail - you can enhance this later if needed
      );
  } else {
      console.warn(`⚠️ Unknown reassignment type: ${reassignment_type} for detail ${detail_number}`);
  }
  }

  // ---- Final rollup per motorman with enhanced MEMU handling ----
  const finalResults = Array.from(resultMap.values()).map(motorman => {
    console.log(`\n🧮 FINAL CALCULATIONS for ${motorman.motormanName} (${motorman.motormanCmsId}):`);
    
    // Handle placeholder motorman gracefully
    if (!motorman.detailBreakdown || !(motorman.detailBreakdown instanceof Map)) {
      console.log(`   ⚠️ No detail breakdown available for ${motorman.motormanName} - skipping calculations`);
      motorman.detailBreakdown = new Map();
      motorman.memuContributions = motorman.memuContributions || new Map();
      motorman.totalBaseWheelMovement = 0;
      motorman.totalDutyHours = 0;
      motorman.sundayDeductions = 0;
      motorman.regularCancellations = 0;
      motorman.trainCount = 0;
      motorman.netWheelMovement = 0;
      return motorman;
    }
    
    // ✅ Always reset before recompute (prevents double counting)
    motorman.totalBaseWheelMovement = 0;
    motorman.totalDutyHours = 0;
    motorman.sundayDeductions = 0;
    motorman.regularCancellations = 0;
    motorman.trainCount = 0;

    let recomputedBase = 0;
    let recomputedDuty = 0;

    const activeDetails = [];
    
    // Calculate from breakdown, but use MEMU contributions for MEMU details
    for (const [detailNum, detailData] of motorman.detailBreakdown) {
      let baseMovement, dutyHours;
      
      if (detailData.isMemu && motorman.memuContributions.has(detailNum)) {
        // 🚂 Use tracked MEMU contribution instead of regular calculation
        const memuContrib = motorman.memuContributions.get(detailNum);
        baseMovement = memuContrib.baseMovement;
        dutyHours = memuContrib.dutyHours;
        
        console.log(`   🚂 MEMU Detail ${detailNum}: WM=${minutesToTimeString(baseMovement)}, Duty=${minutesToTimeString(dutyHours)} (from MEMU calc)`);
        
        motorman.regularCancellations += memuContrib.regularCancellations || 0;
        motorman.trainCount += memuContrib.totalTrains || 0;
      } else {
        // 📋 Use regular breakdown calculation
        baseMovement = detailData.baseMovement || 0;
        dutyHours = detailData.dutyHours || 0;
        
        console.log(`   📋 Regular Detail ${detailNum}: WM=${minutesToTimeString(baseMovement)}, Duty=${minutesToTimeString(dutyHours)} (from regular calc)`);
        
        motorman.sundayDeductions += detailData.sundayDeductions || 0;
        motorman.regularCancellations += detailData.regularCancellations || 0;
        motorman.trainCount += detailData.trainCount || 0;
      }

      motorman.totalBaseWheelMovement += baseMovement;
      motorman.totalDutyHours += dutyHours;
      recomputedBase += baseMovement;
      recomputedDuty += dutyHours;
      activeDetails.push(detailNum);
    }

    motorman.detailNumbers = activeDetails.join(", ");
    motorman.detailCount = activeDetails.length;

    // 🧩 For any remaining MEMU contribution not accounted for in breakdown
    // (This handles edge cases where MEMU calculations might not perfectly match)
    if (motorman.isMemuResult) {
      const origBase = motorman._origBase || 0;
      const origDuty = motorman._origDuty || 0;
      const remainingBase = Math.max(0, origBase - recomputedBase);
      const remainingDuty = Math.max(0, origDuty - recomputedDuty);
      
      if (remainingBase > 0 || remainingDuty > 0) {
        console.log(`   🔧 Adding remaining MEMU contribution: WM=${minutesToTimeString(remainingBase)}, Duty=${minutesToTimeString(remainingDuty)}`);
        motorman.totalBaseWheelMovement += remainingBase;
        motorman.totalDutyHours += remainingDuty;
      }
    }

    motorman.netWheelMovement = Math.max(
      0,
      motorman.totalBaseWheelMovement -
        motorman.sundayDeductions -
        motorman.regularCancellations +
        (motorman.reassignmentAdjustments || 0)
    );

    console.log(`  ✅ Final totals: Base WM=${minutesToTimeString(motorman.totalBaseWheelMovement)}, Net WM=${minutesToTimeString(motorman.netWheelMovement)}, Duty=${minutesToTimeString(motorman.totalDutyHours)}`);

    return motorman;
  });

  return finalResults;
}

// ===== ENHANCED FULL DETAIL REASSIGNMENT WITH MEMU SUPPORT =====
async function processFullDetailReassignmentEnhanced(
  resultMap,
  reassignment,
  allTrains,
  detailsMap,
  waitingDetailsMap,
  dayCancellations,
  isSundayOrHoliday,
  currentDate,
  originalKey,
  newKey,
  isMemuDetail
) {
  const { detail_number, original_motorman, new_motorman, reason } = reassignment;
  
  console.log(`   🔄 Full detail reassignment: ${isMemuDetail ? '🚂 MEMU' : '📋 Regular'} detail ${detail_number}`);

  // Step 1: Remove from original motorman
  if (resultMap.has(originalKey)) {
    const originalResult = resultMap.get(originalKey);
    
    // Remove from detail breakdown
    if (originalResult.detailBreakdown.has(detail_number)) {
      originalResult.detailBreakdown.delete(detail_number);
      console.log(`     ➖ Removed ${detail_number} from ${original_motorman}`);
    }
    
    // 🚂 Remove from MEMU contributions if it's a MEMU detail
    if (isMemuDetail && originalResult.memuContributions.has(detail_number)) {
      const memuContrib = originalResult.memuContributions.get(detail_number);
      originalResult.totalMemuBase -= memuContrib.baseMovement;
      originalResult.totalMemuDuty -= memuContrib.dutyHours;
      originalResult.memuContributions.delete(detail_number);
      
      console.log(`     🚂 Removed MEMU contribution: WM=${minutesToTimeString(memuContrib.baseMovement)}, Duty=${minutesToTimeString(memuContrib.dutyHours)}`);
    }
    
    originalResult.isReassigned = true;
  }

  // Step 2: Add to new motorman
  let targetResult = resultMap.get(newKey);
  
  if (!targetResult) {
    // Create new entry for the receiving motorman
    const cleanCmsId = newKey.startsWith('UNKNOWN_') ? null : newKey;
    
    targetResult = {
      motormanName: new_motorman,
      motormanCmsId: cleanCmsId,
      office: 'REASSIGNED',
      detailNumbers: '',
      totalBaseWheelMovement: 0,
      totalDutyHours: 0,
      sundayDeductions: 0,
      regularCancellations: 0,
      netWheelMovement: 0,
      reassignmentAdjustments: 0,
      trainCount: 0,
      detailCount: 0,
      isReassigned: true,
      isMemuResult: false,
      reassignments: [],
      detailBreakdown: new Map(),
      memuContributions: new Map(),
      totalMemuBase: 0,
      totalMemuDuty: 0,
      _origBase: 0,
      _origDuty: 0
    };
    
    resultMap.set(newKey, targetResult);
    console.log(`     🆕 Created new entry for ${new_motorman}`);
  }

  // Calculate the detail data to add
  if (isMemuDetail && memuCalculator) {
    // 🚂 Calculate MEMU detail properly
    try {
      const memuConn = await pool.getConnection();
      
      const memuResult = await memuCalculator.calculateMemuWheelMovement(
        memuConn, 
        detail_number, 
        currentDate, 
        new_motorman,
        targetResult.motormanCmsId,
        targetResult.office || 'REASSIGNED',
        isSundayOrHoliday, 
        dayCancellations
      );
      
      memuConn.release();
      
      if (memuResult.success) {
        // Add to MEMU contributions
        targetResult.memuContributions.set(detail_number, {
          baseMovement: memuResult.baseWheelMovement,
          dutyHours: memuResult.dutyHours,
          regularCancellations: memuResult.regularCancellations,
          totalTrains: memuResult.totalTrains
        });
        
        targetResult.totalMemuBase += memuResult.baseWheelMovement;
        targetResult.totalMemuDuty += memuResult.dutyHours;
        targetResult.isMemuResult = true;
        
        // Add to detail breakdown with MEMU flag
        targetResult.detailBreakdown.set(detail_number, {
          type: "memu",
          baseMovement: memuResult.baseWheelMovement,
          sundayDeductions: 0,
          regularCancellations: memuResult.regularCancellations,
          dutyHours: memuResult.dutyHours,
          trainCount: memuResult.totalTrains,
          isMemu: true
        });
        
        console.log(`     ➕ Added MEMU detail to ${new_motorman}: WM=${minutesToTimeString(memuResult.baseWheelMovement)}, Duty=${minutesToTimeString(memuResult.dutyHours)}`);
      }
    } catch (error) {
      console.error(`Error calculating MEMU reassignment for detail ${detail_number}:`, error);
    }
  } else {
    // 📋 Calculate regular/waiting detail
    if (waitingDetailsMap.has(detail_number)) {
      const waitingInfo = waitingDetailsMap.get(detail_number);
      const waitingDutyMinutes = calculateCrossMidnightDutyHours(
        waitingInfo.sign_on_time,
        waitingInfo.sign_off_time
      );

      targetResult.detailBreakdown.set(detail_number, {
        type: "waiting",
        baseMovement: 0,
        sundayDeductions: 0,
        regularCancellations: 0,
        dutyHours: waitingDutyMinutes,
        trainCount: 0,
        isMemu: false
      });
      
      console.log(`     ➕ Added waiting detail to ${new_motorman}: Duty=${minutesToTimeString(waitingDutyMinutes)}`);
    } else {
      const detailCalc = calculateDetailMovementAndDuty(
        detail_number,
        allTrains,
        detailsMap,
        dayCancellations,
        isSundayOrHoliday
      );

      targetResult.detailBreakdown.set(detail_number, {
        type: "working",
        baseMovement: detailCalc.baseMovement,
        sundayDeductions: detailCalc.sundayDeductions,
        regularCancellations: detailCalc.regularCancellations,
        dutyHours: detailCalc.dutyHours,
        trainCount: detailCalc.trainCount,
        isMemu: false
      });
      
      console.log(`     ➕ Added regular detail to ${new_motorman}: WM=${minutesToTimeString(detailCalc.baseMovement)}, Duty=${minutesToTimeString(detailCalc.dutyHours)}`);
    }
  }

  targetResult.isReassigned = true;
}



// ===== FULL DETAIL REASSIGNMENT WITH CMS ID =====
async function processFullDetailReassignmentWithCmsId(resultMap, reassignment, allTrains, detailsMap, waitingDetailsMap, dayCancellations, isSundayOrHoliday, isWaitingDetail, originalKey, newKey) {
  const { detail_number, original_motorman, new_motorman, reason } = reassignment;
  
  // console.log(`        🔄 PROCESSING FULL DETAIL with CMS IDs:`);
  // console.log(`           Original: ${originalKey} → New: ${newKey}`);
  
  // Calculate detail data
  let detailData;
  if (isWaitingDetail) {
    const waitingInfo = waitingDetailsMap.get(detail_number);
    const waitingDutyMinutes = calculateCrossMidnightDutyHours(waitingInfo.sign_on_time, waitingInfo.sign_off_time);
    
    detailData = {
      type: 'waiting',
      baseMovement: 0,
      sundayDeductions: 0,
      regularCancellations: 0,
      dutyHours: waitingDutyMinutes,
      trainCount: 0
    };
  } else {
    const detailCalc = calculateDetailMovementAndDuty(
      detail_number, allTrains, detailsMap, dayCancellations, isSundayOrHoliday
    );
    
    detailData = {
      type: 'working',
      baseMovement: detailCalc.baseMovement,
      sundayDeductions: detailCalc.sundayDeductions,
      regularCancellations: detailCalc.regularCancellations,
      dutyHours: detailCalc.dutyHours,
      trainCount: detailCalc.trainCount
    };
  }
  
  // REMOVE from original motorman
  if (resultMap.has(originalKey)) {
    const originalResult = resultMap.get(originalKey);
    if (originalResult.detailBreakdown && originalResult.detailBreakdown.has(detail_number)) {
     // console.log(`        ➖ REMOVING Detail ${detail_number} from ${originalKey}`);
      originalResult.detailBreakdown.delete(detail_number);
      originalResult.isReassigned = true;
    }
  }
  
  // ADD to new motorman
  if (resultMap.has(newKey)) {
    // 🔧 KEY FIX: MERGE with existing entry (this solves the duplicate row issue!)
    //console.log(`        ✅ MERGING Detail ${detail_number} with existing CMS ID: ${newKey}`);
    
    const newResult = resultMap.get(newKey);
    
    // Handle waiting detail replacement logic
    if (!isWaitingDetail) {
      const hasWaitingDetails = Array.from(newResult.detailBreakdown.values()).some(d => d.type === 'waiting');
      
      if (hasWaitingDetails) {
        //console.log(`        🔄 Replacing waiting details with working detail ${detail_number}`);
        
        const waitingDetailsToRemove = [];
        for (const [detailNum, detailInfo] of newResult.detailBreakdown) {
          if (detailInfo.type === 'waiting') {
            waitingDetailsToRemove.push(detailNum);
          }
        }
        
        for (const waitingDetailNum of waitingDetailsToRemove) {
          newResult.detailBreakdown.delete(waitingDetailNum);
        }
      }
    } else {
      //console.log(`        🔄 Waiting detail replaces all existing details`);
      newResult.detailBreakdown.clear();
    }
    
    newResult.detailBreakdown.set(detail_number, detailData);
    newResult.isReassigned = true;
    
   // console.log(`        ➕ MERGED Detail ${detail_number} successfully`);
    
  } else {
    // 🔧 CREATE new entry with proper CMS ID
    //console.log(`        🆕 CREATING new entry for CMS ID: ${newKey}`);
    
    // Extract clean CMS ID
    const cleanCmsId = newKey.startsWith('UNKNOWN_') ? null : newKey;
    
    resultMap.set(newKey, {
      motormanName: new_motorman,
      motormanCmsId: cleanCmsId,
      office: 'REASSIGNED', // Will be updated if needed
      detailNumbers: detail_number,
      totalBaseWheelMovement: 0,
      totalDutyHours: 0,
      sundayDeductions: 0,
      regularCancellations: 0,
      netWheelMovement: 0,
      reassignmentAdjustments: 0,
      trainCount: 0,
      detailCount: 1,
      isReassigned: true,
      reassignments: [],
      detailBreakdown: new Map([[detail_number, detailData]])
    });
    
    //console.log(`        ✅ NEW entry created for ${new_motorman} (${cleanCmsId})`);
  }
  
  // Add reassignment record
  const receivingMotorman = resultMap.get(newKey);
  receivingMotorman.reassignments = receivingMotorman.reassignments || [];
  receivingMotorman.reassignments.push({
    type: isWaitingDetail ? 'full_waiting_detail_received' : 'full_working_detail_received',
    detail: detail_number,
    amount: detailData.baseMovement,
    dutyHours: detailData.dutyHours,
    reason: `Received ${isWaitingDetail ? 'waiting' : 'working'} detail ${detail_number} from ${original_motorman}: ${reason}`
  });
}

// ===== PARTIAL DETAIL REASSIGNMENT WITH CMS ID =====
async function processPartialDetailReassignmentWithCmsId(resultMap, reassignment, allTrains, detailsMap, waitingDetailsMap, dayCancellations, isSundayOrHoliday, isWaitingDetail, originalKey, newKey) {
  const { detail_number, original_motorman, new_motorman, selected_trains, reason } = reassignment;
  
  if (isWaitingDetail) {
    console.log(`        ⚠️ PARTIAL reassignment from WAITING detail - not typical, treating as special case`);
    return;
  }
  
  console.log(`        🚂 PARTIAL reassignment FROM working detail ${detail_number}`);
  console.log(`           Original: ${originalKey} → New: ${newKey}`);
  
  let trainList = [];
  try {
    trainList = typeof selected_trains === 'string' ? 
      JSON.parse(selected_trains) : selected_trains || [];
  } catch (e) {
    console.log(`        ❌ Failed to parse selected trains: ${selected_trains}`);
    return;
  }
  
  console.log(`        📋 Selected trains: ${trainList.join(', ')}`);
  
  // Get ALL trains for this detail
  const allDetailTrains = allTrains.filter(t => 
    t.detail_number == detail_number
  );
  
  // Filter to selected trains
  const selectedDetailTrains = allDetailTrains.filter(train => 
    trainList.some(selectedTrain => 
      selectedTrain.trim() === train.train_number.trim()
    )
  );
  
  // Working trains for movement calculation
  const selectedWorkingTrains = selectedDetailTrains.filter(train => 
    train.train_type === 'working' && 
    !isTrainPiloting(train.train_number)
  );
  
  // Calculate wheel movement for selected working trains
  let selectedTrainMovement = 0;
  for (const train of selectedWorkingTrains) {
    if (train.start_time && train.end_time) {
      const trainWheelMovement = calculateTrainWheelMovement(train.start_time, train.end_time);
      selectedTrainMovement += trainWheelMovement;
      
      const isRegularlyCancelled = dayCancellations.some(c => {
        const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
        const currentTrain = train.train_number.trim().replace(/\s+/g, '').toLowerCase();
        return cancelledTrain === currentTrain;
      });
      
      if (isRegularlyCancelled) {
        selectedTrainMovement -= trainWheelMovement;
      } else if (isSundayOrHoliday && train.status === 'cancelled') {
        selectedTrainMovement -= trainWheelMovement;
      }
    }
  }
  
  // Calculate duty hours
  const partialDutyHours = calculatePartialDutyHours(selectedDetailTrains, waitingDetailsMap, new_motorman, resultMap);
  
  console.log(`        📊 PARTIAL: Movement: ${minutesToTimeString(selectedTrainMovement)}, Duty: ${minutesToTimeString(partialDutyHours)}`);
  
  // Apply to original motorman (subtract)
  if (resultMap.has(originalKey)) {
    const originalResult = resultMap.get(originalKey);
    originalResult.reassignmentAdjustments = (originalResult.reassignmentAdjustments || 0) - selectedTrainMovement;
    originalResult.reassignments = originalResult.reassignments || [];
    originalResult.reassignments.push({
      type: 'partial_trains_lost',
      detail: detail_number,
      trains: trainList,
      amount: -selectedTrainMovement,
      reason: `Lost ${trainList.length} trains from detail ${detail_number}: ${reason}`
    });
    
    console.log(`        ➖ ${originalKey} loses: ${minutesToTimeString(selectedTrainMovement)}`);
  }
  
  // Apply to new motorman (add)
  if (resultMap.has(newKey)) {
    // 🔧 MERGE with existing entry
    const newResult = resultMap.get(newKey);
    
    const hasWaitingInOriginal = newResult.originalAssignments?.some(a => 
      waitingDetailsMap.has(a.detailNumber)
    );
    
    if (hasWaitingInOriginal) {
      const recalculatedDutyHours = calculateWaitingToPartialDutyHours(
        newResult, detail_number, trainList, allTrains, waitingDetailsMap
      );
      newResult.totalDutyHours = recalculatedDutyHours;
    } else {
      newResult.totalDutyHours += partialDutyHours;
    }
    
    newResult.reassignmentAdjustments = (newResult.reassignmentAdjustments || 0) + selectedTrainMovement;
    newResult.trainCount += selectedWorkingTrains.length;
    newResult.detailNumbers += `, ${detail_number} (partial)`;
    newResult.isReassigned = true;
    
    newResult.reassignments = newResult.reassignments || [];
    newResult.reassignments.push({
      type: 'partial_trains_received',
      detail: detail_number,
      trains: trainList,
      amount: selectedTrainMovement,
      dutyHours: partialDutyHours,
      reason: `Received ${trainList.length} trains from detail ${detail_number}: ${reason}`
    });
    
    console.log(`        ➕ ${newKey} gains: ${minutesToTimeString(selectedTrainMovement)}`);
    
  } else {
    // 🔧 CREATE new entry
    const cleanCmsId = newKey.startsWith('UNKNOWN_') ? null : newKey;
    
    resultMap.set(newKey, {
      motormanName: new_motorman,
      motormanCmsId: cleanCmsId,
      office: 'REASSIGNED',
      detailNumbers: `${detail_number} (partial)`,
      totalBaseWheelMovement: 0,
      totalDutyHours: partialDutyHours,
      sundayDeductions: 0,
      regularCancellations: 0,
      netWheelMovement: selectedTrainMovement,
      reassignmentAdjustments: selectedTrainMovement,
      trainCount: selectedWorkingTrains.length,
      detailCount: 1,
      isReassigned: true,
      detailBreakdown: new Map(),  // Initialize detailBreakdown
      memuContributions: new Map(),  // Initialize memuContributions
      reassignments: [{
        type: 'partial_trains_received',
        detail: detail_number,
        trains: trainList,
        amount: selectedTrainMovement,
        dutyHours: partialDutyHours,
        reason: `Received ${trainList.length} trains from detail ${detail_number}: ${reason}`
      }]
    });
    
    console.log(`        🆕 Created ${newKey}: ${minutesToTimeString(selectedTrainMovement)} movement`);
  }
}

// ===== HELPER FUNCTIONS =====

// Calculate detail movement and duty
function calculateDetailMovementAndDuty(detail_number, allTrains, detailsMap, dayCancellations, isSundayOrHoliday) {
  const detailInfo = detailsMap.get(detail_number);
  //const dutyHours = parseDutyHours(detailInfo?.duty_hours || '8:00');
  const dutyHours = parseDutyHours(detailInfo?.duty_hours || '0:00');
  const allDetailTrains = allTrains.filter(t => 
    t.detail_number == detail_number
  );
  
  const workingTrains = allDetailTrains.filter(train => 
    train.train_type === 'working' && 
    !isTrainPiloting(train.train_number)
  );

  let baseMovement = 0;
  let sundayDeductions = 0;
  let regularCancellations = 0;

  for (const train of workingTrains) {
    if (train.start_time && train.end_time) {
      const trainWheelMovement = calculateTrainWheelMovement(train.start_time, train.end_time);
      baseMovement += trainWheelMovement;

      const isRegularlyCancelled = dayCancellations.some(c => {
        const cancelledTrain = c.train_number.trim().replace(/\s+/g, '').toLowerCase();
        const currentTrain = train.train_number.trim().replace(/\s+/g, '').toLowerCase();
        return cancelledTrain === currentTrain;
      });
      
      if (isRegularlyCancelled) {
        regularCancellations += trainWheelMovement;
      } else if (isSundayOrHoliday && train.status === 'cancelled') {
        sundayDeductions += trainWheelMovement;
      }
    }
  }

  const netMovement = baseMovement - sundayDeductions - regularCancellations;

  return {
    baseMovement,
    sundayDeductions,
    regularCancellations,
    netMovement,
    dutyHours,
    trainCount: workingTrains.length
  };
}

// Calculate partial duty hours for assigned trains
function calculatePartialDutyHours(selectedTrains, waitingDetailsMap, motormanName, resultMap) {
  if (selectedTrains.length === 0) return 0;
  
  const trainTimes = selectedTrains.map(t => ({
    trainNumber: t.train_number,
    startMinutes: parseTimeToMinutes(t.start_time),
    endMinutes: parseTimeToMinutes(t.end_time)
  }));
  
  const earliestStart = Math.min(...trainTimes.map(t => t.startMinutes));
  const latestEnd = Math.max(...trainTimes.map(t => t.endMinutes));
  
  let signOnMinutes = Math.max(0, earliestStart - 30);
  if (signOnMinutes < 0) signOnMinutes = 0;
  
  let signOffMinutes = latestEnd + 15;
  
  if (signOffMinutes < signOnMinutes) {
    signOffMinutes += 24 * 60;
  }
  
  const dutyMinutes = signOffMinutes - signOnMinutes;
  
  return dutyMinutes;
}

// Calculate waiting-to-partial duty hours
function calculateWaitingToPartialDutyHours(motormanResult, detailNumber, assignedTrains, allTrains, waitingDetailsMap) {
  let waitingInfo = null;
  if (motormanResult.originalAssignments) {
    for (const assignment of motormanResult.originalAssignments) {
      if (waitingDetailsMap.has(assignment.detailNumber)) {
        waitingInfo = waitingDetailsMap.get(assignment.detailNumber);
        break;
      }
    }
  }
  
  if (!waitingInfo) {
    return 0;
  }
  
  const waitingSignOnMinutes = parseTimeToMinutes(waitingInfo.sign_on_time);
  const waitingSignOffMinutes = parseTimeToMinutes(waitingInfo.sign_off_time);
  
  const relevantTrains = allTrains.filter(t => 
    t.detail_number == detailNumber && 
    assignedTrains.some(assigned => assigned.trim() === t.train_number.trim())
  );
  
  if (relevantTrains.length === 0) {
    return calculateCrossMidnightDutyHours(waitingInfo.sign_on_time, waitingInfo.sign_off_time);
  }
  
  const trainTimes = relevantTrains.map(t => ({
    startMinutes: parseTimeToMinutes(t.start_time),
    endMinutes: parseTimeToMinutes(t.end_time)
  }));
  
  const earliestTrainStart = Math.min(...trainTimes.map(t => t.startMinutes));
  const latestTrainEnd = Math.max(...trainTimes.map(t => t.endMinutes));
  
  const reassignedSignOnMinutes = Math.max(0, earliestTrainStart - 30);
  const reassignedSignOffMinutes = latestTrainEnd + 15;
  
  const finalSignOnMinutes = Math.min(waitingSignOnMinutes, reassignedSignOnMinutes);
  const finalSignOffMinutes = Math.max(waitingSignOffMinutes, reassignedSignOffMinutes);
  
  let finalDutyMinutes = finalSignOffMinutes - finalSignOnMinutes;
  if (finalDutyMinutes < 0) {
    finalDutyMinutes += 24 * 60;
  }
  
  return finalDutyMinutes;
}

// ===== DEBUG ENDPOINT FOR SPECIFIC MOTORMAN =====
router.get("/debug/:motormanName/:date", async (req, res) => {
  console.log('🔍 DEBUG WHEEL MOVEMENT ROUTE HIT!');
  
  const { motormanName, date } = req.params;
  
  console.log(`🔍 DEBUGGING: ${motormanName} on ${date}`);

  const conn = await pool.getConnection();
  try {
    const debugInfo = await debugMotormanProcessingWithCmsId(conn, motormanName, date);
    res.json(debugInfo);
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({ message: "Debug error", error: err.message });
  } finally {
    conn.release();
  }
});

// ===== DEBUG FUNCTION WITH CMS ID =====
async function debugMotormanProcessingWithCmsId(conn, motormanName, date) {
  console.log(`\n🔍 ==================== DEBUGGING ${motormanName} on ${date} with CMS ID ====================`);
  
  const debugLog = [];
  
  function log(message) {
    //console.log(message);
    //debugLog.push(message);
  }
  
  // Check original roster assignments with CMS ID
  log(`\n📋 STEP 1: Original Roster Assignments`);
  const rosterQuery = `
    SELECT 
      dr.*,
      d.total_duty_hours,
      d.total_wheel_movement,
      d.line
    FROM duty_roster dr
    LEFT JOIN details d ON dr.detail_number = d.detail_number
    WHERE DATE(dr.date) = ${conn.escape(date)}
    AND dr.motorman_name LIKE ${conn.escape(`%${motormanName}%`)}
    ORDER BY dr.detail_number
  `;
  
  const [rosterAssignments] = await conn.query(rosterQuery);
  log(`Found ${rosterAssignments.length} roster assignments:`);
  
  rosterAssignments.forEach((assignment, index) => {
    log(`  ${index + 1}. Detail ${assignment.detail_number} - ${assignment.motorman_name} (CMS: ${assignment.motorman_id}) (${assignment.office})`);
  });
  
  // Check reassignments with CMS IDs
  log(`\n🔄 STEP 2: Reassignments with CMS IDs`);
  const reassignmentsQuery = `
    SELECT rh.*, 
           rh.original_motorman_cmsid, 
           rh.new_motorman_cmsid
    FROM reassignment_history rh 
    WHERE rh.date = ${conn.escape(date)}
    AND (rh.original_motorman LIKE ${conn.escape(`%${motormanName}%`)} 
         OR rh.new_motorman LIKE ${conn.escape(`%${motormanName}%`)})
    ORDER BY rh.id
  `;
  
  const [reassignments] = await conn.query(reassignmentsQuery);
  log(`Found ${reassignments.length} reassignments:`);
  
  reassignments.forEach((reassignment, index) => {
    log(`  ${index + 1}. ID ${reassignment.id}: Detail ${reassignment.detail_number}`);
    log(`     ${reassignment.original_motorman} (CMS: ${reassignment.original_motorman_cmsid}) → ${reassignment.new_motorman} (CMS: ${reassignment.new_motorman_cmsid})`);
    log(`     Type: ${reassignment.reassignment_type}, Reason: ${reassignment.reason}`);
  });
  
  // Show CMS ID grouping simulation
  log(`\n🧮 STEP 3: CMS ID Grouping Simulation`);
  
  const cmsIdGroups = new Map();
  
  // Process roster assignments
  rosterAssignments.forEach(assignment => {
    const cmsId = assignment.motorman_id || `UNKNOWN_${assignment.motorman_name}`;
    if (!cmsIdGroups.has(cmsId)) {
      cmsIdGroups.set(cmsId, {
        motormanName: assignment.motorman_name,
        cmsId: cmsId,
        office: assignment.office,
        details: [],
        source: 'roster'
      });
    }
    cmsIdGroups.get(cmsId).details.push(assignment.detail_number);
  });
  
  // Process reassignments
  reassignments.forEach(reassignment => {
    if (reassignment.new_motorman.includes(motormanName)) {
      const cmsId = reassignment.new_motorman_cmsid || `UNKNOWN_${reassignment.new_motorman}`;
      if (!cmsIdGroups.has(cmsId)) {
        cmsIdGroups.set(cmsId, {
          motormanName: reassignment.new_motorman,
          cmsId: cmsId,
          office: 'REASSIGNED',
          details: [],
          source: 'reassignment'
        });
      }
      cmsIdGroups.get(cmsId).details.push(`${reassignment.detail_number} (reassigned)`);
    }
  });
  
  log(`\nCMS ID Groups for ${motormanName}:`);
  for (const [cmsId, group] of cmsIdGroups) {
    log(`  CMS ID: ${cmsId}`);
    log(`    Name: ${group.motormanName}`);
    log(`    Office: ${group.office}`);
    log(`    Details: ${group.details.join(', ')}`);
    log(`    Source: ${group.source}`);
  }
  
  log(`\n✅ EXPECTED RESULT: Should have ${cmsIdGroups.size} unique entries instead of separate rows`);
  
  return {
    motormanName,
    date,
    originalAssignments: rosterAssignments,
    reassignments,
    cmsIdGroups: Object.fromEntries(cmsIdGroups),
    debugLog
  };
}

// ===== COLLECT DETAIL TRAINS FOR DISPLAY =====
// This function collects train information for each detail
// without affecting any wheel movement calculations
async function collectDetailTrains(conn, dateRange, allTrains) {
  console.log('🚂 Collecting detail trains for display...');
  
  const detailTrains = {};
  
  // Get unique detail numbers from trains
  const uniqueDetails = [...new Set(allTrains.map(t => t.detail_number).filter(d => d))];
  
  for (const detailNumber of uniqueDetails) {
    // Get all trains for this detail
    const detailTrainList = allTrains
      .filter(t => t.detail_number == detailNumber)
      .map(train => ({
        trainNumber: train.train_number,
        trainType: train.train_type,
        status: train.status,
        startTime: train.start_time,
        endTime: train.end_time,
        startStation: train.start_station || 'N/A',
        endStation: train.end_station || 'N/A',
        line: train.line,
        isPiloting: train.train_type === 'piloting' || 
                   (train.train_number && (
                     train.train_number.toLowerCase().includes('p/pl') || 
                     train.train_number.toLowerCase().includes('pil') || 
                     train.train_number.toLowerCase().includes('p/')
                   )),
        wheelMovement: train.start_time && train.end_time ? 
          minutesToTimeString(calculateTrainWheelMovement(train.start_time, train.end_time)) : 
          '0:00'
      }))
      .sort((a, b) => {
        // Sort by start time
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
    
    const workingCount = detailTrainList.filter(t => t.trainType === 'working' && !t.isPiloting).length;
    const pilotingCount = detailTrainList.filter(t => t.isPiloting).length;
    detailTrains[detailNumber] = {
      totalTrains: workingCount + pilotingCount, // exclude waiting from total
      workingTrains: workingCount,
      pilotingTrains: pilotingCount,
      trains: detailTrainList
    };
  }
  
  console.log(`✅ Collected trains for ${Object.keys(detailTrains).length} details`);
  return detailTrains;
}

module.exports = router;
