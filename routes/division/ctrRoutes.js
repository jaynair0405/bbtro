/**
 * CTR (Crew Time Record) Routes
 * Handles Excel upload, manual entry, and LRD calculations
 */

const express = require('express');
const router = express.Router();
router.get('/ping', (req, res) => {
    res.json({ message: 'CTR routes working!' });
});
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// LRD Route Resolver
const {
    loadRoutesJson,
    buildRouteIndex,
    resolveLegWithRoutes,
    resolveLegForOffice,
    getRoutesForOffice
} = require('./lrd_route_resolver');

// Load routes.json at startup
const routesJsonPath = path.join(__dirname, '../../data/routes.json');
let routeCtx = null;
try {
    const routeDb = loadRoutesJson(routesJsonPath);
    routeCtx = buildRouteIndex(routeDb);
    console.log(`[CTR] Loaded ${routeDb.routes.length} routes from routes.json`);
} catch (err) {
    console.error('[CTR] Failed to load routes.json:', err.message);
}

// Load lrd_beats.json at startup (section definitions)
const beatsJsonPath = path.join(__dirname, '../../data/lrd_beats.json');
let beatsData = null;
try {
    const beatsRaw = fs.readFileSync(beatsJsonPath, 'utf8');
    beatsData = JSON.parse(beatsRaw);
    console.log(`[CTR] Loaded ${beatsData.beats.length} beats from lrd_beats.json`);
} catch (err) {
    console.error('[CTR] Failed to load lrd_beats.json:', err.message);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/ctr');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `ctr_${timestamp}_${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.xlsx', '.xls', '.csv'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ============================================
// Helper Functions
// ============================================

/**
 * Parse Excel date/time values
 */
function parseExcelDateTime(value, dateContext = null) {
    if (!value || value === '-' || value === '') return null;
    
    // If it's already a Date object
    if (value instanceof Date) return value;
    
    // If it's an Excel serial number
    if (typeof value === 'number') {
        const date = xlsx.SSF.parse_date_code(value);
        return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
    }
    
    // If it's a string like "07-01-2026 21:15"
    if (typeof value === 'string') {
        // Try DD-MM-YYYY HH:mm format
        const match = value.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
        if (match) {
            const [, day, month, year, hour, min] = match;
            return new Date(year, month - 1, day, hour, min);
        }
        
        // Try other common formats
        const parsed = new Date(value);
        if (!isNaN(parsed)) return parsed;
    }
    
    return null;
}

/**
 * Format date for MySQL
 */
function formatMySQLDateTime(date) {
    if (!date) return null;
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) return null;
    
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Format date only for MySQL
 */
function formatMySQLDate(date) {
    if (!date) return null;
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) return null;
    
    return date.toISOString().slice(0, 10);
}

/**
 * Detect office from filename
 */
function detectOfficeFromFilename(filename) {
    const upper = filename.toUpperCase();
    if (upper.includes('KYN')) return 'KYN';
    if (upper.includes('PNVL')) return 'PNVL';
    return null;
}

/**
 * Lookup HRMS ID from CMS ID
 */
async function lookupHRMSId(pool, cmsId) {
    try {
        const [rows] = await pool.query(
            `SELECT hrms_id FROM div_staff_master WHERE original_cms_id = ? OR current_cms_id = ? LIMIT 1`,
            [cmsId, cmsId]
        );
        return rows.length > 0 ? rows[0].hrms_id : null;
    } catch (err) {
        console.error('Error looking up HRMS ID:', err);
        return null;
    }
}

function normalizeRouteName(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const upper = s.toUpperCase();
  if (upper === 'NA' || upper === 'N/A' || upper === '-' || upper === 'NULL') return null;
  return s; // keep original case as entered
}

/**
 * Extract adjacent station pairs from a stations array
 * ["PEN", "JITE", "APTA"] => [["PEN","JITE"], ["JITE","APTA"]]
 */
function extractAdjacentPairs(stations) {
    const pairs = [];
    if (!Array.isArray(stations) || stations.length < 2) return pairs;

    for (let i = 0; i < stations.length - 1; i++) {
        const from = String(stations[i]).trim().toUpperCase();
        const to = String(stations[i + 1]).trim().toUpperCase();
        if (from && to && from !== to) {
            pairs.push([from, to]);
        }
    }
    return pairs;
}

/**
 * Update segment coverage for a staff member based on matched_sections
 * @param {Object} pool - Database pool
 * @param {string} hrmsId - Staff HRMS ID
 * @param {string} matchedSectionsJson - JSON string of matched_sections
 * @param {Date|string} dutyDate - Date the leg was worked
 * @param {number} dutyId - ID of the duty
 */
async function updateSegmentCoverage(pool, hrmsId, matchedSectionsJson, dutyDate, dutyId) {
    if (!hrmsId || !matchedSectionsJson) return;

    try {
        const matched = JSON.parse(matchedSectionsJson);
        if (!Array.isArray(matched) || matched.length === 0) return;

        // Get stations from first match
        const stations = matched[0].stations;
        if (!Array.isArray(stations) || stations.length < 2) return;

        // Extract adjacent pairs
        const pairs = extractAdjacentPairs(stations);

        // Format duty date
        const dutyDateStr = dutyDate instanceof Date
            ? dutyDate.toISOString().slice(0, 10)
            : String(dutyDate).slice(0, 10);

        // Insert/update each pair
        for (const [fromStn, toStn] of pairs) {
            await pool.query(
                `INSERT INTO div_lrd_segment_coverage
                 (staff_hrms_id, from_station, to_station, last_worked_date, last_duty_id, work_count)
                 VALUES (?, ?, ?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE
                   last_worked_date = CASE
                     WHEN VALUES(last_worked_date) > last_worked_date
                     THEN VALUES(last_worked_date)
                     ELSE last_worked_date
                   END,
                   last_duty_id = CASE
                     WHEN VALUES(last_worked_date) > last_worked_date
                     THEN VALUES(last_duty_id)
                     ELSE last_duty_id
                   END,
                   work_count = work_count + 1`,
                [hrmsId, fromStn, toStn, dutyDateStr, dutyId]
            );
        }
    } catch (err) {
        console.error('[CTR] Error updating segment coverage:', err.message);
    }
}

/**
 * Get beats/sections filtered by office
 * Handles office codes like "PNVL-ML" matching beat office "PNVL"
 */
function getBeatsForOffice(office, beats) {
    if (!beats || !office) return beats || [];
    const upperOffice = office.toUpperCase();
    // Extract base office code (PNVL-ML -> PNVL, KYN-RR -> KYN)
    const baseOffice = upperOffice.split('-')[0];
    return beats.filter(b =>
        b.office === baseOffice ||
        b.office === upperOffice ||
        b.office === 'SHARED' ||
        !b.office
    );
}

/**
 * Fix inline strings that xlsx library fails to parse
 * Some Excel exports (depending on CMS/Excel version) add extra whitespace
 * in XML tags like <is > or <t  > which breaks xlsx parsing
 */
function fixInlineStrings(filePath, sheet) {
  try {
    const xml = execSync(`unzip -p "${filePath}" xl/worksheets/sheet1.xml`, {
      maxBuffer: 50 * 1024 * 1024,
      encoding: 'utf8'
    });

    // Parse inline strings with flexible whitespace handling
    // Matches: <c t="inlineStr" r="B4"><is><t xml:space="preserve">VALUE</t></is></c>
    const regex = /<c\s+(?:[^>]*?\s+)?t="inlineStr"\s+(?:[^>]*?\s+)?r="([A-Z]+\d+)"[^>]*>.*?<is\s*>.*?<t[^>]*>([^<]*)<\/t>.*?<\/is\s*>.*?<\/c>/gs;

    let match;
    let fixed = 0;
    while ((match = regex.exec(xml)) !== null) {
      const cellRef = match[1];
      const value = match[2];

      if (sheet[cellRef]) {
        sheet[cellRef].v = value;
        sheet[cellRef].w = value;
        fixed++;
      }
    }
    return fixed;
  } catch (e) {
    console.error('[CTR] Error fixing inline strings:', e.message);
    return 0;
  }
}

/**
 * Parse Excel file and return rows
 */
async function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Fix inline strings that xlsx may fail to parse due to XML whitespace variations
  const fixedCount = fixInlineStrings(filePath, sheet);
  if (fixedCount > 0) {
    console.log(`[CTR] Fixed ${fixedCount} inline string cells in ${path.basename(filePath)}`);
  }

  // Skip first 2 header rows
  const rows = xlsx.utils.sheet_to_json(sheet, { range: 2, defval: null });
  return rows;
}

/**
 * Parse CSV file and return rows
 */
async function parseCsv(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Skip first 2 header rows
  const rows = xlsx.utils.sheet_to_json(sheet, { range: 2, defval: null });
  return rows;
}

// ============================================
// Excel Column Mapping
// ============================================
const COLUMN_MAP = {
    'S.No.': 'sno',
    'SIGNON DATE': 'sign_on_date',
    'SIGNON TIME': 'sign_on_time',
    'SIGNON STTN': 'sign_on_station',
    'SIGNOFF DATE': 'sign_off_date',
    'SIGNOFF TIME': 'sign_off_time',
    'SIGNOFF STTN': 'sign_off_station',
    'CREW ID': 'crew_id',
    'NAME': 'name',
    'DESIG': 'designation',
    'DEPARTURE': 'departure',
    'ARRIVAL': 'arrival',
    'CTO': 'cto',
    'CMO': 'cmo',
    'Route KM': 'route_km',
    'DUTY TYPE': 'duty_type',
    'TRAIN NO': 'train_no',
    'LOCO NO': 'loco_no'
};

// ============================================
// API Routes
// ============================================

/**
 * POST /api/ctr/upload
 * Upload and process CTR Excel file
 */
// router.post('/upload', upload.single('file'), async (req, res) => {
//     const pool = req.app.locals.pool;
//     const userId = req.session?.user?.id || null;
//     const batchId = (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));

    
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }
    
//     const filename = req.file.originalname;
//     const filepath = req.file.path;
//     const office = req.body.office || detectOfficeFromFilename(filename);
    
//     // Initialize upload log
//     await pool.query(
//         `INSERT INTO div_ctr_upload_log (batch_id, filename, source_office, uploaded_by, status) 
//          VALUES (?, ?, ?, ?, 'PROCESSING')`,
//         [batchId, filename, office, userId]
//     );
    
//     try {
//         // Read Excel file
//         const workbook = xlsx.readFile(filepath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // Convert to JSON, skipping first 2 header rows
//         const rawData = xlsx.utils.sheet_to_json(sheet, { range: 2, defval: null });
        
//         console.log(`Processing ${rawData.length} rows from ${filename}`);
        
//         // Stats
//         let stats = {
//             totalRows: rawData.length,
//             dutiesCreated: 0,
//             legsCreated: 0,
//             duplicatesSkipped: 0,
//             errorsCount: 0,
//             unmappedCmsIds: new Set()
//         };
        
//         // Date restriction: only process entries from last 15 days
//         const cutoffDate = new Date();
//         cutoffDate.setDate(cutoffDate.getDate() - 15);
        
//         // Process rows
//         let currentDutyId = null;
//         let currentSno = null;
//         let currentCmsId = null;
//         let legSequence = 0;
        
//         for (let i = 0; i < rawData.length; i++) {
//             const row = rawData[i];
            
//             try {
//                 // Get duty type and route km
//                 const dutyType = row['DUTY TYPE'] || row['Duty Type'] || '';
//                 const routeKm = parseFloat(row['Route KM'] || row['KM'] || 0) || 0;
                
//                 // Filter: Only WR and PL with KM > 0
//                 if (!['WR', 'PL'].includes(dutyType.toUpperCase()) || routeKm <= 0) {
//                     continue;
//                 }
                
//                 const sno = row['S.No.'] || row['SNo'] || row['SNO'];
//                 const cmsId = row['CREW ID'] || row['Crew ID'] || row['CMS ID'];
                
//                 // Parse sign on datetime
//                 let signOnDateRaw = row['SIGNON DATE'] || row['Sign On Date'];
//                 let signOnDateTime = parseExcelDateTime(signOnDateRaw);
                
//                 // Check if this is a new duty (sign on date is not "-")
//                 const isNewDuty = signOnDateTime && signOnDateRaw !== '-';
                
//                 if (isNewDuty) {
//                     // Check date restriction
//                     if (signOnDateTime < cutoffDate) {
//                         continue; // Skip old entries
//                     }
                    
//                     // Lookup HRMS ID
//                     const hrmsId = await lookupHRMSId(pool, cmsId);
//                     if (!hrmsId) {
//                         stats.unmappedCmsIds.add(cmsId);
//                     }
                    
//                     // Check for duplicate
//                     const [existing] = await pool.query(
//                         `SELECT id, staff_hrms_id FROM div_ctr_duties
//                          WHERE staff_cms_id = ? AND sign_on_datetime = ?`,
//                         [cmsId, formatMySQLDateTime(signOnDateTime)]
//                     );

//                     if (existing.length > 0) {
//                         stats.duplicatesSkipped++;
//                         // If hrms_id was missing before but available now, update it
//                         if (hrmsId && !existing[0].staff_hrms_id) {
//                             await pool.query(
//                                 'UPDATE div_ctr_duties SET staff_hrms_id = ? WHERE id = ?',
//                                 [hrmsId, existing[0].id]
//                             );
//                         }
//                         currentDutyId = existing[0].id; // Use existing for legs
//                         legSequence = 0;
//                         continue;
//                     }
                    
//                     // Create new duty
//                     const signOnStation = row['SIGNON STTN'] || row['Sign On Stn'] || '';
//                     const staffName = row['NAME'] || row['Name'] || '';
//                     const designation = row['DESIG'] || row['Designation'] || '';
                    
//                     const [result] = await pool.query(
//                         `INSERT INTO div_ctr_duties 
//                          (upload_batch_id, staff_cms_id, staff_hrms_id, staff_name, designation,
//                           duty_date, sign_on_datetime, sign_on_station, source_file, source_office, uploaded_by)
//                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                         [
//                             batchId, cmsId, hrmsId, staffName, designation,
//                             formatMySQLDate(signOnDateTime),
//                             formatMySQLDateTime(signOnDateTime),
//                             signOnStation.toUpperCase(),
//                             filename, office, userId
//                         ]
//                     );
                    
//                     currentDutyId = result.insertId;
//                     currentSno = sno;
//                     currentCmsId = cmsId;
//                     legSequence = 0;
//                     stats.dutiesCreated++;
//                 }
                
//                 // Skip if no current duty
//                 if (!currentDutyId) continue;
                
//                 // Insert leg
//                 legSequence++;
//                 const fromStation = (row['SIGNON STTN'] || row['From'] || '').toString().toUpperCase();
//                 const toStation = (row['SIGNOFF STTN'] || row['To'] || '').toString().toUpperCase();
//                 const departure = parseExcelDateTime(row['DEPARTURE'] || row['Departure']);
//                 const arrival = parseExcelDateTime(row['ARRIVAL'] || row['Arrival']);
//                 const cto = parseExcelDateTime(row['CTO']);
//                 const cmo = parseExcelDateTime(row['CMO']);
//                 const trainNo = row['TRAIN NO'] || row['Train No'] || '';
//                 const locoNo = row['LOCO NO'] || row['Loco No'] || '';
//                 const routeNameRaw = row['Route Name'] || row['ROUTE NAME'] || row['ROUTE'] || row['Route'] || null;
//                 const routeName = normalizeRouteName(routeNameRaw);

//                 try {
//   const [legRes] = await pool.query(
//   `INSERT INTO div_ctr_legs
//    (duty_id, leg_sequence, from_station, to_station, route_name,
//     departure_datetime, arrival_datetime, cto_datetime, cmo_datetime,
//     route_km, duty_type, train_no, loco_no)
//    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//   [
//     currentDutyId, legSequence, fromStation, toStation, routeName,
//     formatMySQLDateTime(departure),
//     formatMySQLDateTime(arrival),
//     formatMySQLDateTime(cto),
//     formatMySQLDateTime(cmo),
//     routeKm, dutyType ? dutyType.toUpperCase() : null,
//     trainNo || null, locoNo || null
//   ]
// );

//   stats.legsCreated++;

// } catch (e) {
//   // Duplicate leg (uniq_leg_fingerprint)
//   if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
//     stats.duplicatesSkipped++;
//     legSequence--;
//   } else {
//     throw e;
//   }
// }

// // Check if this is sign off (has sign off date)
//                 let signOffDateRaw = row['SIGNOFF DATE'] || row['Sign Off Date'];
//                 let signOffDateTime = parseExcelDateTime(signOffDateRaw);
                
//                 if (signOffDateTime && signOffDateRaw !== '-') {
//                     const signOffStation = (row['SIGNOFF STTN'] || row['Sign Off Stn'] || '').toString().toUpperCase();
                    
//                     // Update duty with sign off and totals
//                     await pool.query(
//                         `UPDATE div_ctr_duties 
//                          SET sign_off_datetime = ?, sign_off_station = ?,
//                              total_legs = (SELECT COUNT(*) FROM div_ctr_legs WHERE duty_id = ?),
//                              total_km = (SELECT COALESCE(SUM(route_km), 0) FROM div_ctr_legs WHERE duty_id = ?)
//                          WHERE id = ?`,
//                         [
//                             formatMySQLDateTime(signOffDateTime),
//                             signOffStation,
//                             currentDutyId, currentDutyId, currentDutyId
//                         ]
//                     );
//                 }
                
//             } catch (rowErr) {
//   // Ignore errors caused by duplicate-only rows during reupload
//   if (
//     rowErr &&
//     (rowErr.code === 'ER_DUP_ENTRY' || rowErr.errno === 1062)
//   ) {
//     // already counted as duplicate
//   } else {
//     console.error(`Error processing row ${i}:`, rowErr);
//     stats.errorsCount++;
//     // capture first error details so we can see it in UI response
//   if (!stats.firstError) {
//     stats.firstError = {
//       rowIndex: i,
//       message: rowErr?.message || String(rowErr),
//       code: rowErr?.code || null,
//       errno: rowErr?.errno || null,
//       sqlMessage: rowErr?.sqlMessage || null
//     };
//   }
//   }
// }
//         }
        
//         // Update upload log
//         await pool.query(
//             `UPDATE div_ctr_upload_log 
//              SET status = 'COMPLETED', completed_at = NOW(),
//                  total_rows = ?, duties_created = ?, legs_created = ?,
//                  duplicates_skipped = ?, errors_count = ?,
//                  unmapped_cms_ids = ?
//              WHERE batch_id = ?`,
//             [
//                 stats.totalRows, stats.dutiesCreated, stats.legsCreated,
//                 stats.duplicatesSkipped, stats.errorsCount,
//                 JSON.stringify([...stats.unmappedCmsIds]),
//                 batchId
//             ]
//         );
        
//         // Calculate LRD for affected staff (async, don't wait)
//         // TODO: Implement LRD calculation
        
//         res.json({
//             success: true,
//             batchId,
//             stats: {
//                 totalRows: stats.totalRows,
//                 dutiesCreated: stats.dutiesCreated,
//                 legsCreated: stats.legsCreated,
//                 duplicatesSkipped: stats.duplicatesSkipped,
//                 errorsCount: stats.errorsCount,
//                 unmappedCmsIds: [...stats.unmappedCmsIds],
//                 first_error: stats.firstError || null,
//             }
//         });
        
//     } catch (err) {
//         console.error('CTR Upload Error:', err);
        
//         await pool.query(
//             `UPDATE div_ctr_upload_log 
//              SET status = 'FAILED', error_message = ?, completed_at = NOW()
//              WHERE batch_id = ?`,
//             [err.message, batchId]
//         );
        
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

router.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (multerErr) => {

    /* ===============================
       1. Multer-level error handling
       =============================== */
    if (multerErr) {
      console.error('CTR Upload Multer Error:', multerErr);
      return res.status(400).json({
        success: false,
        message: multerErr.message || 'File upload error'
      });
    }

    /* ===============================
       2. Basic request validation
       =============================== */
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const pool = req.app.locals.pool;
    const office = req.body.office || null;
    const userId = req.session?.user?.id || null;

    /* ===============================
       3. SAFE batchId generation
       =============================== */
    const batchId = (
      crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString('hex')
    );

    /* ===============================
       4. Main processing block
       =============================== */
    try {
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();

      let rows = [];

      if (ext === '.csv') {
        rows = await parseCsv(filePath);
      } else {
        rows = await parseExcel(filePath);
      }

      if (!rows || rows.length === 0) {
        throw new Error('No data rows found in uploaded file');
      }

      /* ===============================
         Upload log entry
         =============================== */
      await pool.query(
        `INSERT INTO div_ctr_upload_log
         (batch_id, filename, source_office, uploaded_by, status)
         VALUES (?, ?, ?, ?, 'PROCESSING')`,
        [batchId, req.file.originalname, office, userId]
      );

      let stats = {
        totalRows: rows.length,
        dutiesCreated: 0,
        legsCreated: 0,
        duplicatesSkipped: 0,
        errorsCount: 0,
        unmappedCmsIds: new Set()
      };

      /* ===============================
         Main row loop
         =============================== */
      // Date restriction: only process entries from last 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      let currentDutyId = null;
      let currentSno = null;
      let currentCmsId = null;
      let currentHrmsId = null;
      let currentDutyDate = null;
      let legSequence = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          // Get duty type and route km
          const dutyType = row['DUTY TYPE'] || row['Duty Type'] || '';
          const routeKm = parseFloat(row['Route KM'] || row['KM'] || 0) || 0;

          // Filter: Only WR and PL with KM > 0
          if (!['WR', 'PL'].includes(dutyType.toUpperCase()) || routeKm <= 0) {
            continue;
          }

          const sno = row['S.No.'] || row['SNo'] || row['SNO'];
          const cmsId = row['CREW ID'] || row['Crew ID'] || row['CMS ID'];

          // Parse sign on datetime
          let signOnDateRaw = row['SIGNON DATE'] || row['Sign On Date'];
          let signOnDateTime = parseExcelDateTime(signOnDateRaw);

          // Check if this is a new duty (sign on date is not "-")
          const isNewDuty = signOnDateTime && signOnDateRaw !== '-';

          if (isNewDuty) {
            // Check date restriction
            if (signOnDateTime < cutoffDate) {
              continue; // Skip old entries
            }

            // Lookup HRMS ID
            const hrmsId = await lookupHRMSId(pool, cmsId);
            if (!hrmsId) {
              stats.unmappedCmsIds.add(cmsId);
            }

            // Check for duplicate
            const [existing] = await pool.query(
              `SELECT id, staff_hrms_id FROM div_ctr_duties
               WHERE staff_cms_id = ? AND sign_on_datetime = ?`,
              [cmsId, formatMySQLDateTime(signOnDateTime)]
            );

            if (existing.length > 0) {
              stats.duplicatesSkipped++;
              // If hrms_id was missing before but available now, update it
              if (hrmsId && !existing[0].staff_hrms_id) {
                await pool.query(
                  'UPDATE div_ctr_duties SET staff_hrms_id = ? WHERE id = ?',
                  [hrmsId, existing[0].id]
                );
              }
              currentDutyId = existing[0].id; // Use existing for legs
              currentHrmsId = hrmsId || existing[0].staff_hrms_id;
              currentDutyDate = formatMySQLDate(signOnDateTime);
              legSequence = 0;
              // Don't continue - still need to insert the leg from this row
            } else {
              // Create new duty
              const signOnStation = row['SIGNON STTN'] || row['Sign On Stn'] || '';
              const staffName = row['NAME'] || row['Name'] || '';
              const designation = row['DESIG'] || row['Designation'] || '';

              const [result] = await pool.query(
                `INSERT INTO div_ctr_duties
                 (upload_batch_id, staff_cms_id, staff_hrms_id, staff_name, designation,
                  duty_date, sign_on_datetime, sign_on_station, source_file, source_office, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  batchId, cmsId, hrmsId, staffName, designation,
                  formatMySQLDate(signOnDateTime),
                  formatMySQLDateTime(signOnDateTime),
                  signOnStation.toString().toUpperCase(),
                  req.file.originalname, office, userId
                ]
              );

              currentDutyId = result.insertId;
              currentSno = sno;
              currentCmsId = cmsId;
              currentHrmsId = hrmsId;
              currentDutyDate = formatMySQLDate(signOnDateTime);
              legSequence = 0;
              stats.dutiesCreated++;
            }
          }

          // Skip if no current duty
          if (!currentDutyId) continue;

          // Insert leg
          legSequence++;
          const fromStation = (row['SIGNON STTN'] || row['From'] || '').toString().toUpperCase();
          const toStation = (row['SIGNOFF STTN'] || row['To'] || '').toString().toUpperCase();
          const departure = parseExcelDateTime(row['DEPARTURE'] || row['Departure']);
          const arrival = parseExcelDateTime(row['ARRIVAL'] || row['Arrival']);
          const cto = parseExcelDateTime(row['CTO']);
          const cmo = parseExcelDateTime(row['CMO']);
          const trainNo = row['TRAIN NO'] || row['Train No'] || '';
          const locoNo = row['LOCO NO'] || row['Loco No'] || '';
          const routeNameRaw = row['Route Name'] || row['ROUTE NAME'] || row['ROUTE'] || row['Route'] || null;
          const routeName = normalizeRouteName(routeNameRaw);

          // Resolve route match using LRD resolver
          let matchedSections = null;
          if (routeCtx && fromStation && toStation) {
            const resolved = resolveLegWithRoutes(fromStation, toStation, routeCtx);
            if (resolved.status === 'OK' && resolved.route_id) {
              matchedSections = JSON.stringify([{
                route_id: resolved.route_id,
                stations: resolved.stations,
                reason: resolved.reason
              }]);
            }
          }

          try {
            await pool.query(
              `INSERT INTO div_ctr_legs
               (duty_id, leg_sequence, from_station, to_station, route_name, matched_sections,
                departure_datetime, arrival_datetime, cto_datetime, cmo_datetime,
                route_km, duty_type, train_no, loco_no)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                currentDutyId, legSequence, fromStation, toStation, routeName, matchedSections,
                formatMySQLDateTime(departure),
                formatMySQLDateTime(arrival),
                formatMySQLDateTime(cto),
                formatMySQLDateTime(cmo),
                routeKm, dutyType.toUpperCase(), trainNo || null, locoNo || null
              ]
            );
            stats.legsCreated++;

            // Update segment coverage for LRD tracking (only WR legs, not PL)
            if (currentHrmsId && matchedSections && dutyType.toUpperCase() === 'WR') {
              await updateSegmentCoverage(pool, currentHrmsId, matchedSections, currentDutyDate, currentDutyId);
            }
          } catch (legErr) {
            // Duplicate leg (uniq_leg_fingerprint)
            if (legErr && (legErr.code === 'ER_DUP_ENTRY' || legErr.errno === 1062)) {
              stats.duplicatesSkipped++;
              legSequence--;
            } else {
              throw legErr;
            }
          }

          // Check if this is sign off (has sign off date)
          let signOffDateRaw = row['SIGNOFF DATE'] || row['Sign Off Date'];
          let signOffDateTime = parseExcelDateTime(signOffDateRaw);

          if (signOffDateTime && signOffDateRaw !== '-') {
            const signOffStation = (row['SIGNOFF STTN'] || row['Sign Off Stn'] || '').toString().toUpperCase();

            // Update duty with sign off and totals
            await pool.query(
              `UPDATE div_ctr_duties
               SET sign_off_datetime = ?, sign_off_station = ?,
                   total_legs = (SELECT COUNT(*) FROM div_ctr_legs WHERE duty_id = ?),
                   total_km = (SELECT COALESCE(SUM(route_km), 0) FROM div_ctr_legs WHERE duty_id = ?)
               WHERE id = ?`,
              [
                formatMySQLDateTime(signOffDateTime),
                signOffStation,
                currentDutyId, currentDutyId, currentDutyId
              ]
            );
          }

        } catch (rowErr) {
          // Ignore errors caused by duplicate-only rows during reupload
          if (rowErr && (rowErr.code === 'ER_DUP_ENTRY' || rowErr.errno === 1062)) {
            // already counted as duplicate
          } else {
            console.error(`Error processing row ${i}:`, rowErr);
            stats.errorsCount++;
          }
        }
      }

      /* ===============================
         Finalize upload log
         =============================== */
      await pool.query(
        `UPDATE div_ctr_upload_log
         SET status='COMPLETED', completed_at=NOW(),
             total_rows=?,
             duties_created=?,
             legs_created=?,
             duplicates_skipped=?,
             errors_count=?,
             unmapped_cms_ids=?
         WHERE batch_id=?`,
        [
          stats.totalRows,
          stats.dutiesCreated,
          stats.legsCreated,
          stats.duplicatesSkipped,
          stats.errorsCount,
          Array.from(stats.unmappedCmsIds).join(','),
          batchId
        ]
      );

      /* ===============================
         Respond SUCCESS
         =============================== */
      return res.json({
        success: true,
        stats: {
          ...stats,
          unmappedCmsIds: Array.from(stats.unmappedCmsIds)
        }
      });

    } catch (err) {
      console.error('CTR Upload Error:', err);

      /* ===============================
         Mark upload as FAILED
         =============================== */
      try {
        await pool.query(
          `UPDATE div_ctr_upload_log
           SET status='FAILED', error_message=?
           WHERE batch_id=?`,
          [err.message, batchId]
        );
      } catch (logErr) {
        console.error('CTR Upload Log Update Failed:', logErr);
      }

      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
});


/**
 * POST /api/ctr/manual
 * Save manual CTR entry
 */
router.post('/manual', async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.session?.user?.id || null;
    
    const {
        staffCmsId, staffHrmsId, staffName, designation,
        dutyDate, signOnTime, signOnStation, signOffTime, signOffStation,
        signOffNextDay, legs, office
    } = req.body;
    
    if (!staffCmsId || !dutyDate || !signOnTime || !signOnStation) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Build sign on datetime
        const signOnDateTime = new Date(`${dutyDate}T${signOnTime}`);
        
        // Build sign off datetime (handle next day)
        let signOffDateTime = null;
        if (signOffTime) {
            const signOffDate = signOffNextDay 
                ? new Date(new Date(dutyDate).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                : dutyDate;
            signOffDateTime = new Date(`${signOffDate}T${signOffTime}`);
        }
        
        // Check for duplicate
        const [existing] = await connection.query(
            `SELECT id FROM div_ctr_duties 
             WHERE staff_cms_id = ? AND sign_on_datetime = ?`,
            [staffCmsId, formatMySQLDateTime(signOnDateTime)]
        );
        
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'Duplicate entry exists' });
        }
        
        // Insert duty
        const [dutyResult] = await connection.query(
            `INSERT INTO div_ctr_duties 
             (staff_cms_id, staff_hrms_id, staff_name, designation,
              duty_date, sign_on_datetime, sign_on_station,
              sign_off_datetime, sign_off_station,
              source_file, source_office, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MANUAL_ENTRY', ?, ?)`,
            [
                staffCmsId, staffHrmsId, staffName, designation,
                dutyDate, formatMySQLDateTime(signOnDateTime), signOnStation.toUpperCase(),
                formatMySQLDateTime(signOffDateTime), signOffStation?.toUpperCase() || null,
                office, userId
            ]
        );
        
        const dutyId = dutyResult.insertId;
        let totalKm = 0;
        
        // Insert legs
        if (legs && legs.length > 0) {
            for (let i = 0; i < legs.length; i++) {
                const leg = legs[i];
                const km = parseFloat(leg.routeKm) || 0;
                totalKm += km;
                
                // Parse leg times with date context
                let depDateTime = null;
                let arrDateTime = null;
                
                if (leg.departure) {
                    // Determine if departure is on duty date or next day based on time comparison
                    depDateTime = new Date(`${dutyDate}T${leg.departure}`);
                    if (depDateTime < signOnDateTime) {
                        depDateTime = new Date(depDateTime.getTime() + 24 * 60 * 60 * 1000);
                    }
                }
                
                if (leg.arrival) {
                    arrDateTime = new Date(`${dutyDate}T${leg.arrival}`);
                    if (depDateTime && arrDateTime < depDateTime) {
                        arrDateTime = new Date(arrDateTime.getTime() + 24 * 60 * 60 * 1000);
                    }
                }

                // Resolve route match using LRD resolver
                const legFromStation = leg.fromStation?.toUpperCase();
                const legToStation = leg.toStation?.toUpperCase();
                let matchedSections = null;
                if (routeCtx && legFromStation && legToStation) {
                    const resolved = resolveLegWithRoutes(legFromStation, legToStation, routeCtx);
                    if (resolved.status === 'OK' && resolved.route_id) {
                        matchedSections = JSON.stringify([{
                            route_id: resolved.route_id,
                            stations: resolved.stations,
                            reason: resolved.reason
                        }]);
                    }
                }

                await connection.query(
  `INSERT INTO div_ctr_legs
   (duty_id, leg_sequence, from_station, to_station, route_name, matched_sections,
    departure_datetime, arrival_datetime,
    cto_datetime, cmo_datetime,
    route_km, duty_type, train_no, loco_no)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    dutyId, i + 1,
    legFromStation,
    legToStation,
    null,
    matchedSections,
    formatMySQLDateTime(depDateTime),
    formatMySQLDateTime(arrDateTime),
    leg.cto ? formatMySQLDateTime(new Date(`${dutyDate}T${leg.cto}`)) : null,
    leg.cmo ? formatMySQLDateTime(new Date(`${dutyDate}T${leg.cmo}`)) : null,
    km,
    leg.dutyType?.toUpperCase() || 'WR',
    leg.trainNo || null,
    leg.locoNo || null
  ]
);

                // Update segment coverage for LRD tracking (only WR legs, not PL)
                const legDutyType = leg.dutyType?.toUpperCase() || 'WR';
                if (staffHrmsId && matchedSections && legDutyType === 'WR') {
                    await updateSegmentCoverage(connection, staffHrmsId, matchedSections, dutyDate, dutyId);
                }
            }
        }
    
        // Update duty totals
        await connection.query(
            `UPDATE div_ctr_duties SET total_legs = ?, total_km = ? WHERE id = ?`,
            [legs?.length || 0, totalKm, dutyId]
        );
        
        await connection.commit();
        
        res.json({ success: true, dutyId, totalKm });
        
    } catch (err) {
        await connection.rollback();
        console.error('Manual CTR Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/ctr/duties
 * List CTR duties with filters
 */
router.get('/duties', async (req, res) => {
    const pool = req.app.locals.pool;
    
    const {
        startDate, endDate, staffId, designation, office,
        page = 1, limit = 50
    } = req.query;
    
    try {
        let where = ['1=1'];
        let params = [];
        
        if (startDate) {
            where.push('d.duty_date >= ?');
            params.push(startDate);
        }
        if (endDate) {
            where.push('d.duty_date <= ?');
            params.push(endDate);
        }
        if (staffId) {
            where.push('(d.staff_cms_id LIKE ? OR d.staff_hrms_id LIKE ? OR d.staff_name LIKE ?)');
            params.push(`%${staffId}%`, `%${staffId}%`, `%${staffId}%`);
        }
        if (designation) {
            where.push('d.designation = ?');
            params.push(designation);
        }
        if (office) {
            where.push('d.source_office = ?');
            params.push(office);
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM div_ctr_duties d WHERE ${where.join(' AND ')}`,
            params
        );
        
        // Get duties with legs count
        const [duties] = await pool.query(
            `SELECT d.*, 
                    (SELECT COUNT(*) FROM div_ctr_legs WHERE duty_id = d.id) as legs_count
             FROM div_ctr_duties d
             WHERE ${where.join(' AND ')}
             ORDER BY d.sign_on_datetime DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        // Get legs for each duty
        for (let duty of duties) {
            const [legs] = await pool.query(
                `SELECT * FROM div_ctr_legs WHERE duty_id = ? ORDER BY leg_sequence`,
                [duty.id]
            );
            duty.legs = legs;
        }
        
        res.json({
            success: true,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            duties
        });
        
    } catch (err) {
        console.error('Get Duties Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/duty/:id
 * Get single duty with legs
 */
router.get('/duty/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const [duties] = await pool.query(
            `SELECT * FROM div_ctr_duties WHERE id = ?`,
            [req.params.id]
        );
        
        if (duties.length === 0) {
            return res.status(404).json({ success: false, message: 'Duty not found' });
        }
        
        const [legs] = await pool.query(
            `SELECT * FROM div_ctr_legs WHERE duty_id = ? ORDER BY leg_sequence`,
            [req.params.id]
        );
        
        res.json({
            success: true,
            duty: { ...duties[0], legs }
        });
        
    } catch (err) {
        console.error('Get Duty Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * DELETE /api/ctr/duty/:id
 * Delete a duty and its legs
 */
router.delete('/duty/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const [result] = await pool.query(
            `DELETE FROM div_ctr_duties WHERE id = ?`,
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Duty not found' });
        }
        
        res.json({ success: true, message: 'Duty deleted' });
        
    } catch (err) {
        console.error('Delete Duty Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/upload-history
 * Get upload batch history
 */
router.get('/upload-history', async (req, res) => {
    const pool = req.app.locals.pool;
    const user = req.session?.user;
    const userOffice = user?.div_office_code || user?.office_code || null;
    const isAdmin = (user?.role || '').toLowerCase() === 'admin';

    try {
        let query = `SELECT * FROM div_ctr_upload_log`;
        let params = [];

        // Non-admin users only see their office uploads
        // Match if source_office is prefix of user's office code (e.g., PNVL matches PNVL-ML)
        if (!isAdmin && userOffice) {
            query += ` WHERE ? LIKE CONCAT(source_office, '%')`;
            params.push(userOffice);
        }

        query += ` ORDER BY uploaded_at DESC LIMIT 50`;

        const [logs] = await pool.query(query, params);

        res.json({ success: true, logs });

    } catch (err) {
        console.error('Get Upload History Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/staff/search
 * Search staff for dropdown
 */
router.get('/staff/search', async (req, res) => {
    const pool = req.app.locals.pool;
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json({ success: true, staff: [] });
    }

    try {
        const [staff] = await pool.query(
            `SELECT sm.hrms_id,
                    COALESCE(sm.current_cms_id, sm.original_cms_id) as cms_id,
                    sm.name,
                    d.designation_name as designation,
                    sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.original_cms_id LIKE ? OR sm.current_cms_id LIKE ?
                OR sm.hrms_id LIKE ? OR sm.name LIKE ?
             ORDER BY sm.name
             LIMIT 20`,
            [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
        );

        res.json({ success: true, staff });

    } catch (err) {
        console.error('Staff Search Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/presence
 * Get staff presence for a date (for Midnight Position)
 */
router.get('/presence', async (req, res) => {
    const pool = req.app.locals.pool;
    const { date, office } = req.query;
    
    if (!date) {
        return res.status(400).json({ success: false, message: 'Date required' });
    }
    
    try {
        let where = [];
        let params = [];
        
        // Present if sign_on or sign_off on that date
        where.push('(DATE(sign_on_datetime) = ? OR DATE(sign_off_datetime) = ?)');
        params.push(date, date);
        
        if (office) {
            where.push('source_office = ?');
            params.push(office);
        }
        
        const [staff] = await pool.query(
            `SELECT DISTINCT staff_cms_id, staff_hrms_id, staff_name, designation, source_office
             FROM div_ctr_duties
             WHERE ${where.join(' AND ')}
             ORDER BY designation, staff_name`,
            params
        );
        
        res.json({ success: true, date, count: staff.length, staff });
        
    } catch (err) {
        console.error('Presence Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// LRD Routes
// ============================================

/**
 * GET /api/ctr/lrd/sections
 * Get all LRD sections
 */
router.get('/lrd/sections', async (req, res) => {
    const pool = req.app.locals.pool;
    const { office } = req.query;

    try {
        let where = ['is_active = 1'];
        let params = [];

        if (office) {
            // Handle compound office codes like PNVL-ML -> match PNVL
            const baseOffice = office.toUpperCase().split('-')[0];
            where.push('(office = ? OR office = ? OR office = "SHARED" OR office IS NULL)');
            params.push(office.toUpperCase(), baseOffice);
        }
        
        const [sections] = await pool.query(
            `SELECT * FROM div_lrd_sections WHERE ${where.join(' AND ')} ORDER BY section_code`,
            params
        );
        
        // Get stations for each section
        for (let section of sections) {
            const [stations] = await pool.query(
                `SELECT station_code FROM div_lrd_section_stations 
                 WHERE section_code = ? ORDER BY seq_order`,
                [section.section_code]
            );
            section.stations = stations.map(s => s.station_code);
        }
        
        res.json({ success: true, sections });
        
    } catch (err) {
        console.error('Get Sections Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/ctr/lrd/sections
 * Add new LRD section
 */
router.post('/lrd/sections', async (req, res) => {
    const pool = req.app.locals.pool;
    const { sectionCode, sectionName, direction, office, stations } = req.body;
    
    if (!sectionCode || !direction || !stations || stations.length < 2) {
        return res.status(400).json({ success: false, message: 'Invalid section data' });
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Insert section
        await connection.query(
            `INSERT INTO div_lrd_sections (section_code, section_name, direction, office)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE section_name = ?, direction = ?, office = ?, is_active = 1`,
            [sectionCode, sectionName, direction, office, sectionName, direction, office]
        );
        
        // Delete old stations
        await connection.query(
            `DELETE FROM div_lrd_section_stations WHERE section_code = ?`,
            [sectionCode]
        );
        
        // Insert new stations
        for (let i = 0; i < stations.length; i++) {
            await connection.query(
                `INSERT INTO div_lrd_section_stations (section_code, station_code, seq_order)
                 VALUES (?, ?, ?)`,
                [sectionCode, stations[i].toUpperCase(), i + 1]
            );
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Section saved' });
        
    } catch (err) {
        await connection.rollback();
        console.error('Save Section Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/ctr/lrd/sections/:code
 * Deactivate LRD section
 */
router.delete('/lrd/sections/:code', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        await pool.query(
            `UPDATE div_lrd_sections SET is_active = 0 WHERE section_code = ?`,
            [req.params.code]
        );
        
        res.json({ success: true, message: 'Section deactivated' });
        
    } catch (err) {
        console.error('Delete Section Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/status
 * Get LRD status with filters
 */
router.get('/lrd/status', async (req, res) => {
    const pool = req.app.locals.pool;
    
    const {
        staffId, designation, status, section, 
        expiringInDays, page = 1, limit = 100
    } = req.query;
    
    try {
        let where = ['1=1'];
        let params = [];
        
        if (staffId) {
            where.push('(staff_hrms_id LIKE ? OR staff_cms_id LIKE ?)');
            params.push(`%${staffId}%`, `%${staffId}%`);
        }
        if (designation) {
            where.push('designation = ?');
            params.push(designation);
        }
        if (status) {
            where.push('status = ?');
            params.push(status);
        }
        if (section) {
            where.push('(from_station = ? OR to_station = ?)');
            params.push(section, section);
        }
        if (expiringInDays) {
            where.push('expires_on <= DATE_ADD(CURDATE(), INTERVAL ? DAY)');
            params.push(parseInt(expiringInDays));
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Get count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM div_lrd_status WHERE ${where.join(' AND ')}`,
            params
        );
        
        // Get status records
        const [records] = await pool.query(
            `SELECT * FROM div_lrd_status 
             WHERE ${where.join(' AND ')}
             ORDER BY expires_on ASC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        // Get summary
        const [summary] = await pool.query(
            `SELECT 
                SUM(CASE WHEN status = 'VALID' THEN 1 ELSE 0 END) as valid,
                SUM(CASE WHEN status = 'EXPIRING_SOON' THEN 1 ELSE 0 END) as expiring,
                SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired
             FROM div_lrd_status
             WHERE ${where.join(' AND ')}`,
            params
        );
        
        res.json({
            success: true,
            total: countResult[0].total,
            summary: summary[0],
            page: parseInt(page),
            limit: parseInt(limit),
            records
        });
        
    } catch (err) {
        console.error('Get LRD Status Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/staff/:hrmsId
 * Get LRD status for specific staff
 */
router.get('/lrd/staff/:hrmsId', async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        const [records] = await pool.query(
            `SELECT * FROM div_lrd_status 
             WHERE staff_hrms_id = ?
             ORDER BY expires_on ASC`,
            [req.params.hrmsId]
        );
        
        res.json({ success: true, records });
        
    } catch (err) {
        console.error('Get Staff LRD Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/ctr/lrd/recalculate
 * Recalculate LRD status (manual trigger)
 */
router.post('/lrd/recalculate', async (req, res) => {
    const pool = req.app.locals.pool;
    const { staffHrmsId } = req.body;
    
    try {
        // Call stored procedure
        await pool.query('CALL sp_update_lrd_status_for_staff(?)', [staffHrmsId || null]);
        
        res.json({ success: true, message: 'LRD status recalculated' });
        
    } catch (err) {
        console.error('Recalculate LRD Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/ctr/lrd/road-learning
 * Update LRD segment coverage for road learning trips
 * Used when staff completes road learning that may not be in CTR
 */
router.post('/lrd/road-learning', async (req, res) => {
    const pool = req.app.locals.pool;
    const { staff_hrms_id, learning_date, sections } = req.body;

    try {
        if (!staff_hrms_id || !learning_date || !sections?.length) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: staff_hrms_id, learning_date, sections'
            });
        }

        const dateStr = learning_date.slice(0, 10);
        let segmentsUpdated = 0;

        // Process each selected section
        for (const section of sections) {
            const stations = section.stations;
            if (!Array.isArray(stations) || stations.length < 2) continue;

            // Extract adjacent pairs from stations
            const pairs = extractAdjacentPairs(stations);

            // Insert/update each segment pair (use 0 for road learning to distinguish from CTR duties)
            for (const [fromStn, toStn] of pairs) {
                await pool.query(
                    `INSERT INTO div_lrd_segment_coverage
                     (staff_hrms_id, from_station, to_station, last_worked_date, last_duty_id, work_count)
                     VALUES (?, ?, ?, ?, 0, 1)
                     ON DUPLICATE KEY UPDATE
                       last_worked_date = CASE
                         WHEN VALUES(last_worked_date) > last_worked_date
                         THEN VALUES(last_worked_date)
                         ELSE last_worked_date
                       END,
                       last_duty_id = CASE
                         WHEN VALUES(last_worked_date) > last_worked_date
                         THEN 0
                         ELSE last_duty_id
                       END,
                       work_count = work_count + 1`,
                    [staff_hrms_id, fromStn, toStn, dateStr]
                );
                segmentsUpdated++;
            }
        }

        res.json({
            success: true,
            message: `Road learning updated: ${sections.length} section(s), ${segmentsUpdated} segment(s)`
        });

    } catch (err) {
        console.error('Road Learning Update Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/stations
 * Get unique stations from CTR data
 */
router.get('/stations', async (req, res) => {
    const pool = req.app.locals.pool;

    try {
        const [stations] = await pool.query(
            `SELECT DISTINCT station FROM (
                SELECT from_station as station FROM div_ctr_legs
                UNION
                SELECT to_station as station FROM div_ctr_legs
             ) t WHERE station IS NOT NULL AND station != ''
             ORDER BY station`
        );

        res.json({ success: true, stations: stations.map(s => s.station) });

    } catch (err) {
        console.error('Get Stations Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// LRD Status APIs (Route-based)
// ============================================

// LRD Configuration
const LRD_CONFIG = {
    VALIDITY_DAYS: 90,           // Days until LRD expires after last worked
    EXPIRING_THRESHOLD_DAYS: 15  // Days before expiry to mark as "expiring soon"
};

/**
 * GET /api/ctr/lrd/routes
 * Get all routes applicable to an office
 */
router.get('/lrd/routes', (req, res) => {
    const { office } = req.query;

    try {
        if (!routeCtx) {
            return res.status(500).json({ success: false, message: 'Route data not loaded' });
        }

        const routes = office
            ? getRoutesForOffice(office.toUpperCase(), routeCtx)
            : routeCtx.routes;

        res.json({
            success: true,
            routes: routes.map(r => ({
                route_id: r.route_id,
                from: r.from,
                to: r.to,
                variant: r.variant,
                station_count: r.stations.length
            })),
            total: routes.length
        });

    } catch (err) {
        console.error('Get LRD Routes Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/beats
 * Get all LRD beats/sections applicable to an office
 */
router.get('/lrd/beats', (req, res) => {
    const { office } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const beats = office
            ? getBeatsForOffice(office.toUpperCase(), beatsData.beats)
            : beatsData.beats;

        res.json({
            success: true,
            config: beatsData.config,
            beats: beats.map(b => ({
                beat_id: b.beat_id,
                name: b.name,
                office: b.office,
                stations: b.stations,
                segment_count: b.stations.length - 1
            })),
            total: beats.length
        });

    } catch (err) {
        console.error('Get LRD Beats Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/staff-status/:hrmsId
 * Get LRD status for a specific staff - shows section validity based on segment coverage
 * Each section is VALID only if ALL its segments were worked within 90 days
 */
router.get('/lrd/staff-status/:hrmsId', async (req, res) => {
    const pool = req.app.locals.pool;
    const { hrmsId } = req.params;
    const includePiloting = req.query.include_piloting === 'true';

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        // Get staff details and office
        const [staffRows] = await pool.query(
            `SELECT sm.hrms_id, sm.original_cms_id, sm.current_cms_id,
                    sm.name as staff_name,
                    d.designation_name as designation,
                    sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.hrms_id = ?`,
            [hrmsId]
        );

        if (staffRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        const staff = staffRows[0];
        const staffOffice = staff.office?.toUpperCase() || 'KYN';

        // Get beats/sections applicable to this office
        const applicableBeats = getBeatsForOffice(staffOffice, beatsData.beats);

        // Get all segment coverage for this staff (WR duties - pre-computed)
        const [segments] = await pool.query(
            `SELECT from_station, to_station, last_worked_date, work_count, last_duty_id
             FROM div_lrd_segment_coverage
             WHERE staff_hrms_id = ?`,
            [hrmsId]
        );

        // If include_piloting is true, also get coverage from PL duties via CTR legs
        let pilotingSegments = [];
        if (includePiloting) {
            const [plLegs] = await pool.query(
                `SELECT l.from_station, l.to_station, d.duty_date
                 FROM div_ctr_legs l
                 JOIN div_ctr_duties d ON l.duty_id = d.id
                 WHERE d.staff_hrms_id = ? AND l.duty_type = 'PL'
                   AND l.from_station IS NOT NULL AND l.to_station IS NOT NULL
                 ORDER BY d.duty_date DESC`,
                [hrmsId]
            );
            pilotingSegments = plLegs;
        }

        // Build map: "FROM-TO" -> { last_worked_date, work_count, is_road_learning }
        const segmentMap = new Map();
        for (const seg of segments) {
            const key = `${seg.from_station}-${seg.to_station}`;
            segmentMap.set(key, {
                last_worked: seg.last_worked_date,
                work_count: seg.work_count,
                is_road_learning: seg.last_duty_id === 0
            });
        }

        // Merge piloting segments (PL) if include_piloting is enabled
        if (includePiloting && pilotingSegments.length > 0) {
            for (const leg of pilotingSegments) {
                const key = `${leg.from_station}-${leg.to_station}`;
                const legDate = leg.duty_date instanceof Date ? leg.duty_date : new Date(leg.duty_date);
                const existing = segmentMap.get(key);

                if (!existing) {
                    // No WR coverage for this segment, use PL coverage
                    segmentMap.set(key, {
                        last_worked: legDate,
                        work_count: 1
                    });
                } else {
                    // Merge: use the more recent date between WR and PL
                    const existingDate = existing.last_worked instanceof Date ? existing.last_worked : new Date(existing.last_worked);
                    if (legDate > existingDate) {
                        segmentMap.set(key, {
                            last_worked: legDate,
                            work_count: existing.work_count + 1
                        });
                    }
                }
            }
        }

        // Get config
        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate status for each beat/section
        const sectionStatuses = applicableBeats.map(beat => {
            // Extract adjacent pairs from this section's stations
            const requiredSegments = extractAdjacentPairs(beat.stations);
            const totalSegments = requiredSegments.length;

            let validCount = 0;
            let expiredCount = 0;
            let expiringCount = 0;
            let neverWorkedCount = 0;
            let oldestExpiry = null;
            let newestExpiry = null;

            const segmentDetails = requiredSegments.map(([from, to]) => {
                const key = `${from}-${to}`;
                // Only check the exact direction (directional coverage)
                const segData = segmentMap.get(key);

                let segStatus = 'NEVER_WORKED';
                let lastWorked = null;
                let expiresOn = null;
                let daysRemaining = null;

                if (segData && segData.last_worked) {
                    lastWorked = new Date(segData.last_worked);
                    expiresOn = new Date(lastWorked);
                    expiresOn.setDate(expiresOn.getDate() + validityDays);

                    const diffTime = expiresOn - today;
                    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (daysRemaining < 0) {
                        segStatus = 'EXPIRED';
                        expiredCount++;
                    } else if (daysRemaining <= expiringThreshold) {
                        segStatus = 'EXPIRING_SOON';
                        expiringCount++;
                        validCount++; // Still valid, just expiring soon
                    } else {
                        segStatus = 'VALID';
                        validCount++;
                    }

                    // Track earliest expiry for section-level status
                    if (!oldestExpiry || expiresOn < oldestExpiry) {
                        oldestExpiry = expiresOn;
                    }
                    if (!newestExpiry || expiresOn > newestExpiry) {
                        newestExpiry = expiresOn;
                    }
                } else {
                    neverWorkedCount++;
                }

                return {
                    from,
                    to,
                    status: segStatus,
                    last_worked: lastWorked ? lastWorked.toISOString().split('T')[0] : null,
                    expires_on: expiresOn ? expiresOn.toISOString().split('T')[0] : null,
                    days_remaining: daysRemaining,
                    is_road_learning: segData?.is_road_learning || false
                };
            });

            // Determine section-level status
            let sectionStatus;
            let sectionExpiresOn = null;
            let sectionDaysRemaining = null;

            if (neverWorkedCount === totalSegments) {
                sectionStatus = 'NEVER_WORKED';
            } else if (expiredCount > 0 || neverWorkedCount > 0) {
                // Any expired or never-worked segment means section is not fully valid
                sectionStatus = validCount > 0 ? 'PARTIAL' : 'EXPIRED';
                sectionExpiresOn = oldestExpiry;
            } else if (expiringCount > 0) {
                sectionStatus = 'EXPIRING_SOON';
                sectionExpiresOn = oldestExpiry;
            } else {
                sectionStatus = 'VALID';
                sectionExpiresOn = oldestExpiry; // Earliest segment expiry
            }

            if (sectionExpiresOn) {
                const diffTime = sectionExpiresOn - today;
                sectionDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return {
                beat_id: beat.beat_id,
                name: beat.name,
                office: beat.office,
                status: sectionStatus,
                coverage: {
                    total: totalSegments,
                    valid: validCount,
                    expired: expiredCount,
                    never_worked: neverWorkedCount,
                    percentage: totalSegments > 0 ? Math.round((validCount / totalSegments) * 100) : 0
                },
                expires_on: sectionExpiresOn ? sectionExpiresOn.toISOString().split('T')[0] : null,
                days_remaining: sectionDaysRemaining,
                segments: segmentDetails
            };
        });

        // Sort: EXPIRED first, then PARTIAL, then EXPIRING_SOON, then NEVER_WORKED, then VALID
        const statusOrder = { 'EXPIRED': 0, 'PARTIAL': 1, 'EXPIRING_SOON': 2, 'NEVER_WORKED': 3, 'VALID': 4 };
        sectionStatuses.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

        // Summary counts
        const summary = {
            valid: sectionStatuses.filter(s => s.status === 'VALID').length,
            expiring_soon: sectionStatuses.filter(s => s.status === 'EXPIRING_SOON').length,
            partial: sectionStatuses.filter(s => s.status === 'PARTIAL').length,
            expired: sectionStatuses.filter(s => s.status === 'EXPIRED').length,
            never_worked: sectionStatuses.filter(s => s.status === 'NEVER_WORKED').length,
            total: sectionStatuses.length
        };

        res.json({
            success: true,
            staff: {
                hrms_id: staff.hrms_id,
                cms_id: staff.current_cms_id || staff.original_cms_id,
                name: staff.staff_name,
                designation: staff.designation,
                office: staffOffice
            },
            config: {
                validity_days: validityDays,
                expiring_threshold_days: expiringThreshold,
                include_piloting: includePiloting
            },
            summary,
            sections: sectionStatuses
        });

    } catch (err) {
        console.error('Get Staff LRD Status Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/summary
 * Get overall LRD summary counts across all staff (section-based)
 */
router.get('/lrd/summary', async (req, res) => {
    const pool = req.app.locals.pool;
    const { office, designation } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;

        // Build WHERE clause for staff filter
        let staffWhere = ['sm.status = "Active"'];
        let staffParams = [];

        if (office) {
            staffWhere.push('sm.current_office_code = ?');
            staffParams.push(office.toUpperCase());
        }
        if (designation) {
            staffWhere.push('d.designation_name = ?');
            staffParams.push(designation);
        }

        // Get all active staff
        const [staffList] = await pool.query(
            `SELECT sm.hrms_id, sm.original_cms_id, sm.current_cms_id,
                    sm.name as staff_name,
                    d.designation_name as designation,
                    sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE ${staffWhere.join(' AND ')}`,
            staffParams
        );

        // Get all segment coverage data
        const [allSegments] = await pool.query(
            `SELECT staff_hrms_id, from_station, to_station, last_worked_date
             FROM div_lrd_segment_coverage`
        );

        // Build map: staff_hrms_id -> "FROM-TO" -> last_worked_date
        const staffSegmentMap = new Map();
        for (const seg of allSegments) {
            if (!staffSegmentMap.has(seg.staff_hrms_id)) {
                staffSegmentMap.set(seg.staff_hrms_id, new Map());
            }
            const key = `${seg.from_station}-${seg.to_station}`;
            staffSegmentMap.get(seg.staff_hrms_id).set(key, seg.last_worked_date);
        }

        // Calculate summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalValid = 0;
        let totalExpiring = 0;
        let totalPartial = 0;
        let totalExpired = 0;
        let totalNeverWorked = 0;

        const staffSummaries = [];

        for (const staff of staffList) {
            const staffOffice = staff.office?.toUpperCase() || 'KYN';
            const applicableBeats = getBeatsForOffice(staffOffice, beatsData.beats);
            const staffSegs = staffSegmentMap.get(staff.hrms_id) || new Map();

            let valid = 0, expiring = 0, partial = 0, expired = 0, neverWorked = 0;

            for (const beat of applicableBeats) {
                const requiredSegments = extractAdjacentPairs(beat.stations);
                const totalSegs = requiredSegments.length;

                let validSegs = 0;
                let expiredSegs = 0;
                let neverWorkedSegs = 0;
                let expiringSegs = 0;

                for (const [from, to] of requiredSegments) {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    if (!lastWorked) {
                        neverWorkedSegs++;
                        continue;
                    }

                    const lastWorkedDate = new Date(lastWorked);
                    const expiresOn = new Date(lastWorkedDate);
                    expiresOn.setDate(expiresOn.getDate() + validityDays);

                    const daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                    if (daysRemaining < 0) {
                        expiredSegs++;
                    } else if (daysRemaining <= expiringThreshold) {
                        expiringSegs++;
                        validSegs++;
                    } else {
                        validSegs++;
                    }
                }

                // Determine section status
                if (neverWorkedSegs === totalSegs) {
                    neverWorked++;
                } else if (expiredSegs > 0 || neverWorkedSegs > 0) {
                    if (validSegs > 0) {
                        partial++;
                    } else {
                        expired++;
                    }
                } else if (expiringSegs > 0) {
                    expiring++;
                } else {
                    valid++;
                }
            }

            totalValid += valid;
            totalExpiring += expiring;
            totalPartial += partial;
            totalExpired += expired;
            totalNeverWorked += neverWorked;

            // Include staff with issues (expired, partial, or expiring sections)
            if (expired > 0 || expiring > 0 || partial > 0) {
                staffSummaries.push({
                    hrms_id: staff.hrms_id,
                    cms_id: staff.current_cms_id || staff.original_cms_id,
                    name: staff.staff_name,
                    designation: staff.designation,
                    office: staffOffice,
                    valid,
                    expiring,
                    partial,
                    expired,
                    never_worked: neverWorked,
                    total_sections: applicableBeats.length
                });
            }
        }

        // Sort by expired (desc), then partial (desc), then expiring (desc)
        staffSummaries.sort((a, b) => {
            if (b.expired !== a.expired) return b.expired - a.expired;
            if (b.partial !== a.partial) return b.partial - a.partial;
            return b.expiring - a.expiring;
        });

        res.json({
            success: true,
            config: {
                validity_days: validityDays,
                expiring_threshold_days: expiringThreshold
            },
            overall: {
                total_staff: staffList.length,
                total_section_assignments: totalValid + totalExpiring + totalPartial + totalExpired + totalNeverWorked,
                valid: totalValid,
                expiring_soon: totalExpiring,
                partial: totalPartial,
                expired: totalExpired,
                never_worked: totalNeverWorked
            },
            staff_with_issues: staffSummaries.slice(0, 100) // Top 100
        });

    } catch (err) {
        console.error('Get LRD Summary Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/ctr/lrd/backfill
 * Backfill matched_sections for existing legs (one-time operation)
 */
router.post('/lrd/backfill', async (req, res) => {
    const pool = req.app.locals.pool;
    const { limit = 1000 } = req.body;

    try {
        if (!routeCtx) {
            return res.status(500).json({ success: false, message: 'Route data not loaded' });
        }

        // Get legs without matched_sections
        const [legs] = await pool.query(
            `SELECT id, from_station, to_station
             FROM div_ctr_legs
             WHERE matched_sections IS NULL
               AND duty_type IN ('WR', 'PL')
               AND from_station IS NOT NULL
               AND to_station IS NOT NULL
             LIMIT ?`,
            [parseInt(limit)]
        );

        if (legs.length === 0) {
            return res.json({
                success: true,
                message: 'No legs to backfill',
                stats: { processed: 0, matched: 0, unmapped: 0 }
            });
        }

        let matched = 0, unmapped = 0, ambiguous = 0;

        for (const leg of legs) {
            const resolved = resolveLegWithRoutes(leg.from_station, leg.to_station, routeCtx);

            let matchedSections = null;
            if (resolved.status === 'OK' && resolved.route_id) {
                matchedSections = JSON.stringify([{
                    route_id: resolved.route_id,
                    stations: resolved.stations,
                    reason: resolved.reason
                }]);
                matched++;
            } else if (resolved.status === 'AMBIGUOUS') {
                ambiguous++;
            } else {
                unmapped++;
            }

            await pool.query(
                `UPDATE div_ctr_legs SET matched_sections = ? WHERE id = ?`,
                [matchedSections, leg.id]
            );
        }

        // Check remaining
        const [remaining] = await pool.query(
            `SELECT COUNT(*) as cnt FROM div_ctr_legs
             WHERE matched_sections IS NULL
               AND duty_type IN ('WR', 'PL')
               AND from_station IS NOT NULL
               AND to_station IS NOT NULL`
        );

        res.json({
            success: true,
            message: `Backfilled ${legs.length} legs`,
            stats: {
                processed: legs.length,
                matched,
                unmapped,
                ambiguous,
                remaining: remaining[0].cnt
            }
        });

    } catch (err) {
        console.error('Backfill Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/due-report
 * Get LRD due report - staff with expired/expiring sections
 * Groups problem segments into ranges (e.g., PEN-ROHA instead of individual segments)
 */
router.get('/lrd/due-report', async (req, res) => {
    const pool = req.app.locals.pool;
    const { depot = 'PNVL', section, status = 'all', desig = 'all' } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;

        // Get base office from depot (PNVL-ML -> PNVL)
        const baseOffice = depot.toUpperCase().split('-')[0];

        // Get applicable beats for this depot (include SHARED)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // If section specified, filter to matching beat (single direction only)
        let targetBeats = applicableBeats;
        if (section) {
            const sectionUpper = section.toUpperCase().replace(/-/g, '_');
            targetBeats = applicableBeats.filter(b => {
                const beatId = b.beat_id.toUpperCase();
                return beatId === sectionUpper;
            });
        }

        if (targetBeats.length === 0) {
            return res.json({
                success: true,
                depot,
                section,
                staff: [],
                message: 'No matching sections found'
            });
        }

        // Determine designation filter: all = (1,2,5), lpg = (5), alp = (1,2)
        let desigIds;
        if (desig === 'lpg') {
            desigIds = [5];
        } else if (desig === 'alp') {
            desigIds = [1, 2];
        } else {
            desigIds = [1, 2, 5];
        }

        // Get all staff for this depot (exact match, filtered by designation)
        // Sort: LPG (5) first alphabetically, then ALP (1,2) alphabetically
        const [staffList] = await pool.query(
            `SELECT
                sm.hrms_id,
                sm.current_cms_id,
                sm.original_cms_id,
                sm.name as staff_name,
                sm.designation_id,
                d.designation_name as designation,
                sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.status = 'Active'
               AND sm.current_office_code = ?
               AND sm.designation_id IN (?)
             ORDER BY CASE WHEN sm.designation_id = 5 THEN 0 ELSE 1 END, sm.name`,
            [depot.toUpperCase(), desigIds]
        );

        if (staffList.length === 0) {
            return res.json({
                success: true,
                depot,
                section,
                staff: [],
                message: 'No staff found for depot'
            });
        }

        // Get all CTR legs for these staff (join with duties to get staff_hrms_id)
        const hrmsIds = staffList.map(s => s.hrms_id);
        const [allLegs] = await pool.query(
            `SELECT
                d.staff_hrms_id,
                l.from_station,
                l.to_station,
                MAX(d.duty_date) as last_worked_date
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE d.staff_hrms_id IN (?)
               AND l.duty_type IN ('WR', 'PL')
               AND l.from_station IS NOT NULL
               AND l.to_station IS NOT NULL
             GROUP BY d.staff_hrms_id, l.from_station, l.to_station`,
            [hrmsIds]
        );

        // Build segment map per staff
        const staffSegmentMap = new Map();
        for (const leg of allLegs) {
            if (!staffSegmentMap.has(leg.staff_hrms_id)) {
                staffSegmentMap.set(leg.staff_hrms_id, new Map());
            }
            const key = `${leg.from_station}-${leg.to_station}`;
            staffSegmentMap.get(leg.staff_hrms_id).set(key, leg.last_worked_date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const staffResults = [];

        for (const staff of staffList) {
            const staffSegs = staffSegmentMap.get(staff.hrms_id) || new Map();

            for (const beat of targetBeats) {
                const requiredSegments = extractAdjacentPairs(beat.stations);
                const totalSegs = requiredSegments.length;

                // Analyze each segment
                const segmentAnalysis = requiredSegments.map(([from, to], idx) => {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    let segStatus = 'NEVER_WORKED';
                    let daysRemaining = null;

                    if (lastWorked) {
                        const lastWorkedDate = new Date(lastWorked);
                        const expiresOn = new Date(lastWorkedDate);
                        expiresOn.setDate(expiresOn.getDate() + validityDays);
                        daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                        if (daysRemaining < 0) {
                            segStatus = 'EXPIRED';
                        } else if (daysRemaining <= expiringThreshold) {
                            segStatus = 'EXPIRING';
                        } else {
                            segStatus = 'VALID';
                        }
                    }

                    return {
                        from,
                        to,
                        status: segStatus,
                        days: daysRemaining,
                        idx
                    };
                });

                // Find problem segments (expired or expiring)
                const problemSegs = segmentAnalysis.filter(s =>
                    s.status === 'EXPIRED' || s.status === 'EXPIRING' || s.status === 'NEVER_WORKED'
                );

                if (problemSegs.length === 0) continue; // All valid, skip

                // Check if all segments are valid (shouldn't reach here, but safety check)
                const validCount = segmentAnalysis.filter(s => s.status === 'VALID').length;
                const expiredCount = segmentAnalysis.filter(s => s.status === 'EXPIRED').length;
                const expiringCount = segmentAnalysis.filter(s => s.status === 'EXPIRING').length;
                const neverWorkedCount = segmentAnalysis.filter(s => s.status === 'NEVER_WORKED').length;

                // Determine overall status
                let overallStatus;
                if (expiredCount > 0) {
                    overallStatus = validCount > 0 ? 'PARTIAL_EXPIRED' : 'EXPIRED';
                } else if (expiringCount > 0) {
                    overallStatus = validCount > 0 ? 'PARTIAL_EXPIRING' : 'EXPIRING';
                } else if (neverWorkedCount === totalSegs) {
                    overallStatus = 'NEVER_WORKED';
                } else {
                    overallStatus = 'PARTIAL_NEVER';
                }

                // Filter by requested status
                if (status === 'expired' && !overallStatus.includes('EXPIRED')) {
                    continue;
                }
                if (status === 'expiring' && !overallStatus.includes('EXPIRING')) {
                    continue;
                }

                // Collapse contiguous problem segments into ranges
                const problemRanges = collapseProblemSegments(segmentAnalysis, beat.stations);

                // Find worst days (most negative or smallest positive)
                const worstDays = problemSegs
                    .filter(s => s.days !== null)
                    .reduce((min, s) => s.days < min ? s.days : min, Infinity);

                // Section name as FROM-TO format
                const sectionName = `${beat.stations[0]}-${beat.stations[beat.stations.length - 1]}`;

                staffResults.push({
                    hrms_id: staff.hrms_id,
                    cms_id: staff.current_cms_id || staff.original_cms_id,
                    name: staff.staff_name,
                    designation_id: staff.designation_id,
                    designation: staff.designation || '-',
                    office: staff.office,
                    section: sectionName,
                    section_id: beat.beat_id,
                    status: overallStatus,
                    problem_range: problemRanges.join(', '),
                    days: worstDays === Infinity ? null : worstDays,
                    coverage: {
                        total: totalSegs,
                        valid: validCount,
                        expired: expiredCount,
                        expiring: expiringCount,
                        never_worked: neverWorkedCount
                    }
                });
            }
        }

        // Sort: Status first, then LPG (5) before ALP (1,2), then alphabetically by name
        staffResults.sort((a, b) => {
            // Status priority: EXPIRED > PARTIAL_EXPIRED > EXPIRING > PARTIAL_EXPIRING > others
            const statusOrder = {
                'EXPIRED': 0, 'PARTIAL_EXPIRED': 1,
                'EXPIRING': 2, 'PARTIAL_EXPIRING': 3,
                'NEVER_WORKED': 4, 'PARTIAL_NEVER': 5
            };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            // Then by designation: LPG (5) first, then ALP (1,2)
            const aIsLPG = a.designation_id === 5 ? 0 : 1;
            const bIsLPG = b.designation_id === 5 ? 0 : 1;
            if (aIsLPG !== bIsLPG) {
                return aIsLPG - bIsLPG;
            }
            // Then alphabetically by name (case-insensitive)
            return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        });

        res.json({
            success: true,
            depot,
            section: section || 'All',
            config: {
                validity_days: validityDays,
                expiring_threshold_days: expiringThreshold
            },
            summary: {
                total_staff: staffResults.length,
                expired: staffResults.filter(s => s.status.includes('EXPIRED')).length,
                expiring: staffResults.filter(s => s.status.includes('EXPIRING')).length
            },
            staff: staffResults
        });

    } catch (err) {
        console.error('Get LRD Due Report Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/staff-due/:hrmsId
 * Get all due/expiring sections for a specific staff member
 */
router.get('/lrd/staff-due/:hrmsId', async (req, res) => {
    const pool = req.app.locals.pool;
    const { hrmsId } = req.params;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;

        // Get staff details
        const [staffRows] = await pool.query(
            `SELECT sm.hrms_id, sm.current_cms_id, sm.name, sm.current_office_code as office,
                    d.designation_name as designation
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.hrms_id = ?`,
            [hrmsId]
        );

        if (staffRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        const staff = staffRows[0];
        const baseOffice = (staff.office || 'PNVL').split('-')[0].toUpperCase();

        // Get applicable beats for staff's office (include SHARED)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // Get all CTR legs for this staff
        const [allLegs] = await pool.query(
            `SELECT l.from_station, l.to_station, MAX(d.duty_date) as last_worked_date
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE d.staff_hrms_id = ?
               AND l.duty_type IN ('WR', 'PL')
               AND l.from_station IS NOT NULL
               AND l.to_station IS NOT NULL
             GROUP BY l.from_station, l.to_station`,
            [hrmsId]
        );

        // Build segment map
        const segmentMap = new Map();
        for (const leg of allLegs) {
            const key = `${leg.from_station}-${leg.to_station}`;
            segmentMap.set(key, leg.last_worked_date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueResults = [];

        for (const beat of applicableBeats) {
            const requiredSegments = extractAdjacentPairs(beat.stations);
            const totalSegs = requiredSegments.length;

            // Analyze each segment
            const segmentAnalysis = requiredSegments.map(([from, to], idx) => {
                const key = `${from}-${to}`;
                const lastWorked = segmentMap.get(key);

                let segStatus = 'NEVER_WORKED';
                let daysRemaining = null;

                if (lastWorked) {
                    const lastWorkedDate = new Date(lastWorked);
                    const expiresOn = new Date(lastWorkedDate);
                    expiresOn.setDate(expiresOn.getDate() + validityDays);
                    daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                    if (daysRemaining < 0) {
                        segStatus = 'EXPIRED';
                    } else if (daysRemaining <= expiringThreshold) {
                        segStatus = 'EXPIRING';
                    } else {
                        segStatus = 'VALID';
                    }
                }

                return { from, to, status: segStatus, days: daysRemaining, idx };
            });

            // Find problem segments
            const problemSegs = segmentAnalysis.filter(s =>
                s.status === 'EXPIRED' || s.status === 'EXPIRING' || s.status === 'NEVER_WORKED'
            );

            if (problemSegs.length === 0) continue; // All valid, skip

            const validCount = segmentAnalysis.filter(s => s.status === 'VALID').length;
            const expiredCount = segmentAnalysis.filter(s => s.status === 'EXPIRED').length;
            const expiringCount = segmentAnalysis.filter(s => s.status === 'EXPIRING').length;
            const neverWorkedCount = segmentAnalysis.filter(s => s.status === 'NEVER_WORKED').length;

            // Determine overall status
            let overallStatus;
            if (expiredCount > 0) {
                overallStatus = validCount > 0 ? 'PARTIAL_EXPIRED' : 'EXPIRED';
            } else if (expiringCount > 0) {
                overallStatus = validCount > 0 ? 'PARTIAL_EXPIRING' : 'EXPIRING';
            } else if (neverWorkedCount === totalSegs) {
                overallStatus = 'NEVER_WORKED';
            } else {
                overallStatus = 'PARTIAL_NEVER';
            }

            // Collapse problem segments
            const problemRanges = collapseProblemSegments(segmentAnalysis, beat.stations);

            // Find worst days
            const worstDays = problemSegs
                .filter(s => s.days !== null)
                .reduce((min, s) => s.days < min ? s.days : min, Infinity);

            const sectionName = `${beat.stations[0]}-${beat.stations[beat.stations.length - 1]}`;

            dueResults.push({
                section: sectionName,
                section_id: beat.beat_id,
                status: overallStatus,
                problem_range: problemRanges.join(', '),
                days: worstDays === Infinity ? null : worstDays,
                coverage: {
                    total: totalSegs,
                    valid: validCount,
                    expired: expiredCount,
                    expiring: expiringCount,
                    never_worked: neverWorkedCount
                }
            });
        }

        // Sort: EXPIRED first, then EXPIRING, then by days
        const statusOrder = {
            'EXPIRED': 0, 'PARTIAL_EXPIRED': 1,
            'EXPIRING': 2, 'PARTIAL_EXPIRING': 3,
            'NEVER_WORKED': 4, 'PARTIAL_NEVER': 5
        };
        dueResults.sort((a, b) => {
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            const aDays = a.days ?? 999;
            const bDays = b.days ?? 999;
            return aDays - bDays;
        });

        res.json({
            success: true,
            staff: {
                hrms_id: staff.hrms_id,
                cms_id: staff.current_cms_id,
                name: staff.name,
                designation: staff.designation,
                office: staff.office
            },
            config: {
                validity_days: validityDays,
                expiring_threshold_days: expiringThreshold
            },
            summary: {
                total: dueResults.length,
                expired: dueResults.filter(s => s.status.includes('EXPIRED')).length,
                expiring: dueResults.filter(s => s.status.includes('EXPIRING')).length
            },
            sections: dueResults
        });

    } catch (err) {
        console.error('Get Staff Due Report Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/staff-checklist
 * Get all staff with their expired/expiring sections aggregated
 * Each staff appears once with all their problem sections listed
 */
router.get('/lrd/staff-checklist', async (req, res) => {
    const pool = req.app.locals.pool;
    const { depot = 'PNVL-ML', desig = 'all', status = 'all' } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;
        const baseOffice = depot.toUpperCase().split('-')[0];

        // Get applicable beats for this depot (include SHARED)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // Build designation filter
        let desigFilter = '';
        if (desig === 'lpg') {
            desigFilter = 'AND sm.designation_id = 5';
        } else if (desig === 'alp') {
            desigFilter = 'AND sm.designation_id IN (1, 2)';
        } else {
            desigFilter = 'AND sm.designation_id IN (1, 2, 5)';
        }

        // Get all staff for depot
        const [staffList] = await pool.query(
            `SELECT sm.hrms_id, sm.current_cms_id, sm.original_cms_id, sm.name as staff_name,
                    sm.designation_id, d.designation_name as designation, sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.current_office_code = ?
               AND sm.status = 'Active'
               ${desigFilter}
             ORDER BY sm.name`,
            [depot]
        );

        if (staffList.length === 0) {
            return res.json({ success: true, depot, staff: [], summary: { total: 0, with_expired: 0, with_expiring: 0 } });
        }

        const hrmsIds = staffList.map(s => s.hrms_id);

        // Get all CTR legs for these staff
        const [allLegs] = await pool.query(
            `SELECT d.staff_hrms_id, l.from_station, l.to_station, MAX(d.duty_date) as last_worked_date
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE d.staff_hrms_id IN (?)
               AND l.duty_type IN ('WR', 'PL')
               AND l.from_station IS NOT NULL
               AND l.to_station IS NOT NULL
             GROUP BY d.staff_hrms_id, l.from_station, l.to_station`,
            [hrmsIds]
        );

        // Build segment map per staff
        const staffSegmentMap = new Map();
        for (const leg of allLegs) {
            if (!staffSegmentMap.has(leg.staff_hrms_id)) {
                staffSegmentMap.set(leg.staff_hrms_id, new Map());
            }
            const key = `${leg.from_station}-${leg.to_station}`;
            staffSegmentMap.get(leg.staff_hrms_id).set(key, leg.last_worked_date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const staffResults = [];

        for (const staff of staffList) {
            const staffSegs = staffSegmentMap.get(staff.hrms_id) || new Map();
            const expiredSections = [];
            const expiringSections = [];

            for (const beat of applicableBeats) {
                const requiredSegments = extractAdjacentPairs(beat.stations);
                const sectionName = `${beat.stations[0]}-${beat.stations[beat.stations.length - 1]}`;

                // Analyze segments for this beat
                let hasExpired = false;
                let hasExpiring = false;
                let worstExpiredDays = null;
                let worstExpiringDays = null;

                for (const [from, to] of requiredSegments) {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    if (lastWorked) {
                        const lastWorkedDate = new Date(lastWorked);
                        const expiresOn = new Date(lastWorkedDate);
                        expiresOn.setDate(expiresOn.getDate() + validityDays);
                        const daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                        if (daysRemaining < 0) {
                            hasExpired = true;
                            if (worstExpiredDays === null || daysRemaining < worstExpiredDays) {
                                worstExpiredDays = daysRemaining;
                            }
                        } else if (daysRemaining <= expiringThreshold) {
                            hasExpiring = true;
                            if (worstExpiringDays === null || daysRemaining < worstExpiringDays) {
                                worstExpiringDays = daysRemaining;
                            }
                        }
                    }
                }

                if (hasExpired) {
                    expiredSections.push({ section: sectionName, days: worstExpiredDays });
                } else if (hasExpiring) {
                    expiringSections.push({ section: sectionName, days: worstExpiringDays });
                }
            }

            // Filter by status
            if (status === 'expired' && expiredSections.length === 0) continue;
            if (status === 'expiring' && expiringSections.length === 0) continue;
            if (status === 'all' && expiredSections.length === 0 && expiringSections.length === 0) continue;

            // Format sections as strings
            const expiredStr = expiredSections
                .sort((a, b) => a.days - b.days)
                .map(s => `${s.section} (${s.days})`)
                .join(', ');
            const expiringStr = expiringSections
                .sort((a, b) => a.days - b.days)
                .map(s => `${s.section} (+${s.days})`)
                .join(', ');

            staffResults.push({
                hrms_id: staff.hrms_id,
                cms_id: staff.current_cms_id || staff.original_cms_id,
                name: staff.staff_name,
                designation_id: staff.designation_id,
                designation: staff.designation || '-',
                expired_sections: expiredStr || '-',
                expiring_sections: expiringStr || '-',
                expired_count: expiredSections.length,
                expiring_count: expiringSections.length
            });
        }

        // Sort: LPG first, then by name
        staffResults.sort((a, b) => {
            if (a.designation_id === 5 && b.designation_id !== 5) return -1;
            if (a.designation_id !== 5 && b.designation_id === 5) return 1;
            return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        });

        res.json({
            success: true,
            depot,
            config: { validity_days: validityDays, expiring_threshold_days: expiringThreshold },
            summary: {
                total: staffResults.length,
                with_expired: staffResults.filter(s => s.expired_count > 0).length,
                with_expiring: staffResults.filter(s => s.expiring_count > 0).length
            },
            staff: staffResults
        });

    } catch (err) {
        console.error('Get Staff Checklist Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/section-checklist
 * Get all sections with their expired/expiring staff grouped under each section
 */
router.get('/lrd/section-checklist', async (req, res) => {
    const pool = req.app.locals.pool;
    const { depot = 'PNVL-ML', desig = 'all', status = 'all' } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;
        const baseOffice = depot.toUpperCase().split('-')[0];

        // Get applicable beats for this depot (include SHARED)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // Build designation filter
        let desigFilter = '';
        if (desig === 'lpg') {
            desigFilter = 'AND sm.designation_id = 5';
        } else if (desig === 'alp') {
            desigFilter = 'AND sm.designation_id IN (1, 2)';
        } else {
            desigFilter = 'AND sm.designation_id IN (1, 2, 5)';
        }

        // Get all staff for depot
        const [staffList] = await pool.query(
            `SELECT sm.hrms_id, sm.current_cms_id, sm.original_cms_id, sm.name as staff_name,
                    sm.designation_id, d.designation_name as designation
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.current_office_code = ?
               AND sm.status = 'Active'
               ${desigFilter}
             ORDER BY sm.name`,
            [depot]
        );

        if (staffList.length === 0) {
            return res.json({ success: true, depot, sections: [], summary: { total_sections: 0 } });
        }

        const hrmsIds = staffList.map(s => s.hrms_id);

        // Get all CTR legs for these staff
        const [allLegs] = await pool.query(
            `SELECT d.staff_hrms_id, l.from_station, l.to_station, MAX(d.duty_date) as last_worked_date
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE d.staff_hrms_id IN (?)
               AND l.duty_type IN ('WR', 'PL')
               AND l.from_station IS NOT NULL
               AND l.to_station IS NOT NULL
             GROUP BY d.staff_hrms_id, l.from_station, l.to_station`,
            [hrmsIds]
        );

        // Build segment map per staff
        const staffSegmentMap = new Map();
        for (const leg of allLegs) {
            if (!staffSegmentMap.has(leg.staff_hrms_id)) {
                staffSegmentMap.set(leg.staff_hrms_id, new Map());
            }
            const key = `${leg.from_station}-${leg.to_station}`;
            staffSegmentMap.get(leg.staff_hrms_id).set(key, leg.last_worked_date);
        }

        // Create staff lookup map
        const staffLookup = new Map();
        for (const staff of staffList) {
            staffLookup.set(staff.hrms_id, staff);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sectionResults = [];

        for (const beat of applicableBeats) {
            const requiredSegments = extractAdjacentPairs(beat.stations);
            const sectionName = `${beat.stations[0]}-${beat.stations[beat.stations.length - 1]}`;
            const sectionStaff = [];

            for (const staff of staffList) {
                const staffSegs = staffSegmentMap.get(staff.hrms_id) || new Map();

                // Check worst status for this staff on this beat
                let worstStatus = 'VALID';
                let worstDays = null;

                for (const [from, to] of requiredSegments) {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    if (lastWorked) {
                        const lastWorkedDate = new Date(lastWorked);
                        const expiresOn = new Date(lastWorkedDate);
                        expiresOn.setDate(expiresOn.getDate() + validityDays);
                        const daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                        if (daysRemaining < 0) {
                            if (worstStatus !== 'EXPIRED' || (worstDays !== null && daysRemaining < worstDays)) {
                                worstStatus = 'EXPIRED';
                                worstDays = daysRemaining;
                            }
                        } else if (daysRemaining <= expiringThreshold && worstStatus !== 'EXPIRED') {
                            if (worstStatus !== 'EXPIRING' || (worstDays !== null && daysRemaining < worstDays)) {
                                worstStatus = 'EXPIRING';
                                worstDays = daysRemaining;
                            }
                        }
                    }
                }

                // Filter by status
                if (worstStatus === 'VALID') continue;
                if (status === 'expired' && worstStatus !== 'EXPIRED') continue;
                if (status === 'expiring' && worstStatus !== 'EXPIRING') continue;

                sectionStaff.push({
                    hrms_id: staff.hrms_id,
                    cms_id: staff.current_cms_id || staff.original_cms_id,
                    name: staff.staff_name,
                    designation_id: staff.designation_id,
                    designation: staff.designation || '-',
                    status: worstStatus,
                    days: worstDays
                });
            }

            if (sectionStaff.length > 0) {
                // Sort staff: Expired first (by days), then Expiring (by days), then LPG before ALP, then by name
                sectionStaff.sort((a, b) => {
                    // Status first
                    if (a.status === 'EXPIRED' && b.status !== 'EXPIRED') return -1;
                    if (a.status !== 'EXPIRED' && b.status === 'EXPIRED') return 1;
                    // Then by days (most negative first for expired, smallest first for expiring)
                    if (a.days !== b.days) return (a.days ?? 999) - (b.days ?? 999);
                    // Then LPG first
                    if (a.designation_id === 5 && b.designation_id !== 5) return -1;
                    if (a.designation_id !== 5 && b.designation_id === 5) return 1;
                    // Then by name
                    return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
                });

                sectionResults.push({
                    section: sectionName,
                    expired_count: sectionStaff.filter(s => s.status === 'EXPIRED').length,
                    expiring_count: sectionStaff.filter(s => s.status === 'EXPIRING').length,
                    staff: sectionStaff
                });
            }
        }

        // Sort sections by total problem staff (descending)
        sectionResults.sort((a, b) => {
            const aTotal = a.expired_count + a.expiring_count;
            const bTotal = b.expired_count + b.expiring_count;
            return bTotal - aTotal;
        });

        res.json({
            success: true,
            depot,
            config: { validity_days: validityDays, expiring_threshold_days: expiringThreshold },
            summary: {
                total_sections: sectionResults.length,
                total_expired: sectionResults.reduce((sum, s) => sum + s.expired_count, 0),
                total_expiring: sectionResults.reduce((sum, s) => sum + s.expiring_count, 0)
            },
            sections: sectionResults
        });

    } catch (err) {
        console.error('Get Section Checklist Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/lrd/matrix-view
 * Get matrix view: Staff (rows) × Sections (columns) with last worked dates
 * Each cell shows worst status and date for that staff-section combination
 */
router.get('/lrd/matrix-view', async (req, res) => {
    const pool = req.app.locals.pool;
    const { depot = 'PNVL-ML', desig = 'all', includeAll = 'false' } = req.query;
    const showAll = includeAll === 'true';

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const validityDays = beatsData.config?.validity_days || 90;
        const expiringThreshold = beatsData.config?.expiring_threshold_days || 15;
        const baseOffice = depot.toUpperCase().split('-')[0];

        // Get applicable beats for this depot (include SHARED)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // Build section list (columns)
        const sections = applicableBeats.map(b => ({
            id: b.beat_id,
            name: `${b.stations[0]}-${b.stations[b.stations.length - 1]}`,
            stations: b.stations
        }));

        // Build designation filter
        let desigFilter = '';
        if (desig === 'lpg') {
            desigFilter = 'AND sm.designation_id = 5';
        } else if (desig === 'alp') {
            desigFilter = 'AND sm.designation_id IN (1, 2)';
        } else {
            desigFilter = 'AND sm.designation_id IN (1, 2, 5)';
        }

        // Get all staff for depot
        const [staffList] = await pool.query(
            `SELECT sm.hrms_id, sm.current_cms_id, sm.original_cms_id, sm.name as staff_name,
                    sm.designation_id, d.designation_name as designation
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.current_office_code = ?
               AND sm.status = 'Active'
               ${desigFilter}
             ORDER BY
               CASE WHEN sm.designation_id = 5 THEN 0 ELSE 1 END,
               sm.name`,
            [depot]
        );

        if (staffList.length === 0) {
            return res.json({ success: true, depot, sections: [], staff: [], matrix: [] });
        }

        const hrmsIds = staffList.map(s => s.hrms_id);

        // Get all CTR legs for these staff
        const [allLegs] = await pool.query(
            `SELECT d.staff_hrms_id, l.from_station, l.to_station, MAX(d.duty_date) as last_worked_date
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE d.staff_hrms_id IN (?)
               AND l.duty_type IN ('WR', 'PL')
               AND l.from_station IS NOT NULL
               AND l.to_station IS NOT NULL
             GROUP BY d.staff_hrms_id, l.from_station, l.to_station`,
            [hrmsIds]
        );

        // Build segment map per staff
        const staffSegmentMap = new Map();
        for (const leg of allLegs) {
            if (!staffSegmentMap.has(leg.staff_hrms_id)) {
                staffSegmentMap.set(leg.staff_hrms_id, new Map());
            }
            const key = `${leg.from_station}-${leg.to_station}`;
            staffSegmentMap.get(leg.staff_hrms_id).set(key, leg.last_worked_date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const matrixData = [];

        for (const staff of staffList) {
            const staffSegs = staffSegmentMap.get(staff.hrms_id) || new Map();
            const sectionStatuses = {};
            let hasAnyIssue = false;

            for (const section of sections) {
                const requiredSegments = extractAdjacentPairs(section.stations);

                let worstStatus = 'VALID';
                let worstDays = Infinity;
                let worstDate = null;
                let validCount = 0, expiredCount = 0, expiringCount = 0, neverCount = 0;

                for (const [from, to] of requiredSegments) {
                    const key = `${from}-${to}`;
                    const lastWorked = staffSegs.get(key);

                    if (!lastWorked) {
                        neverCount++;
                        continue;
                    }

                    const lastWorkedDate = new Date(lastWorked);
                    const expiresOn = new Date(lastWorkedDate);
                    expiresOn.setDate(expiresOn.getDate() + validityDays);
                    const daysRemaining = Math.ceil((expiresOn - today) / (1000 * 60 * 60 * 24));

                    if (daysRemaining < 0) {
                        expiredCount++;
                        if (worstStatus !== 'EXPIRED' || daysRemaining < worstDays) {
                            worstStatus = 'EXPIRED';
                            worstDays = daysRemaining;
                            worstDate = lastWorked;
                        }
                    } else if (daysRemaining <= expiringThreshold) {
                        expiringCount++;
                        if (worstStatus !== 'EXPIRED') {
                            if (worstStatus !== 'EXPIRING' || daysRemaining < worstDays) {
                                worstStatus = 'EXPIRING';
                                worstDays = daysRemaining;
                                worstDate = lastWorked;
                            }
                        }
                    } else {
                        validCount++;
                        if (worstStatus === 'VALID' && (!worstDate || lastWorkedDate > new Date(worstDate))) {
                            worstDate = lastWorked;
                            worstDays = daysRemaining;
                        }
                    }
                }

                // Determine overall status for this section
                let overallStatus = 'VALID';
                if (expiredCount > 0) {
                    overallStatus = validCount > 0 || expiringCount > 0 ? 'PARTIAL_EXPIRED' : 'EXPIRED';
                    hasAnyIssue = true;
                } else if (expiringCount > 0) {
                    overallStatus = validCount > 0 ? 'PARTIAL_EXPIRING' : 'EXPIRING';
                    hasAnyIssue = true;
                } else if (neverCount === requiredSegments.length) {
                    overallStatus = 'NEVER_WORKED';
                } else if (neverCount > 0) {
                    overallStatus = 'PARTIAL_NEVER';
                }

                sectionStatuses[section.id] = {
                    status: overallStatus,
                    days: worstDays === Infinity ? null : worstDays,
                    date: worstDate,
                    breakdown: { valid: validCount, expired: expiredCount, expiring: expiringCount, never: neverCount, total: requiredSegments.length }
                };
            }

            // Skip staff with no issues if includeAll is false
            if (!showAll && !hasAnyIssue) continue;

            matrixData.push({
                hrms_id: staff.hrms_id,
                cms_id: staff.current_cms_id || staff.original_cms_id,
                name: staff.staff_name,
                designation: staff.designation || '-',
                sections: sectionStatuses
            });
        }

        res.json({
            success: true,
            depot,
            config: { validity_days: validityDays, expiring_threshold_days: expiringThreshold },
            sections: sections.map(s => ({ id: s.id, name: s.name })),
            summary: {
                total_staff: matrixData.length,
                total_sections: sections.length
            },
            matrix: matrixData
        });

    } catch (err) {
        console.error('Get Matrix View Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/ctr/staff-search
 * Search staff by CMS ID or name
 */
router.get('/staff-search', async (req, res) => {
    const pool = req.app.locals.pool;
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json({ success: true, staff: [] });
    }

    try {
        const searchTerm = `%${q}%`;
        const [staff] = await pool.query(
            `SELECT sm.hrms_id, sm.current_cms_id as cms_id, sm.name,
                    d.designation_name as designation, sm.current_office_code as office
             FROM div_staff_master sm
             LEFT JOIN designations d ON sm.designation_id = d.id
             WHERE sm.status = 'Active'
               AND (sm.current_cms_id LIKE ? OR sm.name LIKE ? OR sm.hrms_id LIKE ?)
             ORDER BY sm.name
             LIMIT 15`,
            [searchTerm, searchTerm, searchTerm]
        );

        res.json({ success: true, staff });

    } catch (err) {
        console.error('Staff Search Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * Collapse contiguous problem segments into ranges
 * e.g., PEN-KASU(expired), KASU-NGTN(expired), NGTN-ROHA(expired) -> "PEN-ROHA (-18)"
 */
function collapseProblemSegments(segmentAnalysis, stations) {
    const ranges = [];
    let rangeStart = null;
    let rangeEnd = null;
    let rangeStatus = null;
    let worstDays = null;

    for (let i = 0; i < segmentAnalysis.length; i++) {
        const seg = segmentAnalysis[i];
        const isProblem = seg.status !== 'VALID';

        if (isProblem) {
            if (rangeStart === null) {
                // Start new range
                rangeStart = seg.from;
                rangeEnd = seg.to;
                rangeStatus = seg.status;
                worstDays = seg.days;
            } else {
                // Extend range
                rangeEnd = seg.to;
                // Track worst status and days
                if (seg.status === 'EXPIRED' || (seg.status === 'EXPIRING' && rangeStatus !== 'EXPIRED')) {
                    rangeStatus = seg.status;
                }
                if (seg.days !== null && (worstDays === null || seg.days < worstDays)) {
                    worstDays = seg.days;
                }
            }
        } else {
            // Valid segment - close any open range
            if (rangeStart !== null) {
                ranges.push(formatRange(rangeStart, rangeEnd, rangeStatus, worstDays));
                rangeStart = null;
                rangeEnd = null;
                rangeStatus = null;
                worstDays = null;
            }
        }
    }

    // Close final range if any
    if (rangeStart !== null) {
        ranges.push(formatRange(rangeStart, rangeEnd, rangeStatus, worstDays));
    }

    return ranges;
}

function formatRange(from, to, status, days) {
    let label = `${from}-${to}`;
    if (status === 'NEVER_WORKED') {
        label += ' (Never)';
    } else if (days !== null) {
        label += ` (${days > 0 ? '+' + days : days}d)`;
    }
    return label;
}

/**
 * GET /api/ctr/lrd/sections-for-depot
 * Get available sections for a depot (for dropdown) - direction-wise
 */
router.get('/lrd/sections-for-depot', (req, res) => {
    const { depot = 'PNVL' } = req.query;

    try {
        if (!beatsData) {
            return res.status(500).json({ success: false, message: 'Beats data not loaded' });
        }

        const baseOffice = depot.toUpperCase().split('-')[0];

        // Get beats for this depot + SHARED (each direction as separate option)
        const applicableBeats = beatsData.beats.filter(b => {
            const beatOffice = b.office?.toUpperCase();
            return beatOffice === baseOffice || beatOffice === 'SHARED';
        });

        // Return each beat as a separate section (direction-wise)
        const sections = applicableBeats.map(beat => {
            const stations = beat.stations;
            const first = stations[0];
            const last = stations[stations.length - 1];

            return {
                beat_id: beat.beat_id,
                name: `${first}-${last}`,
                display_name: beat.name,
                station_count: stations.length
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            depot,
            sections
        });

    } catch (err) {
        console.error('Get Sections for Depot Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;