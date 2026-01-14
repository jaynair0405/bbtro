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
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
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
router.post('/upload', upload.single('file'), async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.session?.user?.id || null;
    const batchId = crypto.randomUUID();
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const filename = req.file.originalname;
    const filepath = req.file.path;
    const office = req.body.office || detectOfficeFromFilename(filename);
    
    // Initialize upload log
    await pool.query(
        `INSERT INTO div_ctr_upload_log (batch_id, filename, source_office, uploaded_by, status) 
         VALUES (?, ?, ?, ?, 'PROCESSING')`,
        [batchId, filename, office, userId]
    );
    
    try {
        // Read Excel file
        const workbook = xlsx.readFile(filepath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, skipping first 2 header rows
        const rawData = xlsx.utils.sheet_to_json(sheet, { range: 2, defval: null });
        
        console.log(`Processing ${rawData.length} rows from ${filename}`);
        
        // Stats
        let stats = {
            totalRows: rawData.length,
            dutiesCreated: 0,
            legsCreated: 0,
            duplicatesSkipped: 0,
            errorsCount: 0,
            unmappedCmsIds: new Set()
        };
        
        // Date restriction: only process entries from last 15 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 15);
        
        // Process rows
        let currentDutyId = null;
        let currentSno = null;
        let currentCmsId = null;
        let legSequence = 0;
        
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            
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
                        legSequence = 0;
                        continue;
                    }
                    
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
                            signOnStation.toUpperCase(),
                            filename, office, userId
                        ]
                    );
                    
                    currentDutyId = result.insertId;
                    currentSno = sno;
                    currentCmsId = cmsId;
                    legSequence = 0;
                    stats.dutiesCreated++;
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
                
                await pool.query(
                    `INSERT INTO div_ctr_legs 
                     (duty_id, leg_sequence, from_station, to_station, departure_datetime, arrival_datetime,
                      cto_datetime, cmo_datetime, route_km, duty_type, train_no, loco_no)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        currentDutyId, legSequence, fromStation, toStation,
                        formatMySQLDateTime(departure),
                        formatMySQLDateTime(arrival),
                        formatMySQLDateTime(cto),
                        formatMySQLDateTime(cmo),
                        routeKm, dutyType.toUpperCase(), trainNo, locoNo
                    ]
                );
                stats.legsCreated++;
                
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
                console.error(`Error processing row ${i}:`, rowErr);
                stats.errorsCount++;
            }
        }
        
        // Update upload log
        await pool.query(
            `UPDATE div_ctr_upload_log 
             SET status = 'COMPLETED', completed_at = NOW(),
                 total_rows = ?, duties_created = ?, legs_created = ?,
                 duplicates_skipped = ?, errors_count = ?,
                 unmapped_cms_ids = ?
             WHERE batch_id = ?`,
            [
                stats.totalRows, stats.dutiesCreated, stats.legsCreated,
                stats.duplicatesSkipped, stats.errorsCount,
                JSON.stringify([...stats.unmappedCmsIds]),
                batchId
            ]
        );
        
        // Calculate LRD for affected staff (async, don't wait)
        // TODO: Implement LRD calculation
        
        res.json({
            success: true,
            batchId,
            stats: {
                totalRows: stats.totalRows,
                dutiesCreated: stats.dutiesCreated,
                legsCreated: stats.legsCreated,
                duplicatesSkipped: stats.duplicatesSkipped,
                errorsCount: stats.errorsCount,
                unmappedCmsIds: [...stats.unmappedCmsIds]
            }
        });
        
    } catch (err) {
        console.error('CTR Upload Error:', err);
        
        await pool.query(
            `UPDATE div_ctr_upload_log 
             SET status = 'FAILED', error_message = ?, completed_at = NOW()
             WHERE batch_id = ?`,
            [err.message, batchId]
        );
        
        res.status(500).json({ success: false, message: err.message });
    }
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
                
                await connection.query(
                    `INSERT INTO div_ctr_legs 
                     (duty_id, leg_sequence, from_station, to_station, 
                      departure_datetime, arrival_datetime,
                      cto_datetime, cmo_datetime,
                      route_km, duty_type, train_no, loco_no)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        dutyId, i + 1, 
                        leg.fromStation?.toUpperCase(), 
                        leg.toStation?.toUpperCase(),
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
            `SELECT hrms_id, cms_id, name, designation 
             FROM div_staff_master 
             WHERE cms_id LIKE ? OR hrms_id LIKE ? OR name LIKE ?
             LIMIT 20`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
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
            where.push('office = ?');
            params.push(office);
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

module.exports = router;