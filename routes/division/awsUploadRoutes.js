/**
 * awsUploadRoutes.js — AWS CMS Excel Upload endpoints
 * Mounted at /api/division/aws
 *
 * Phase 5: AWS raw import
 *   - POST /upload              → Upload CMS Excel, parse, preview, save raw rows
 *   - GET  /uploads             → List upload batches
 *   - GET  /uploads/:id         → Get upload batch details with raw rows
 *   - GET  /uploads/:id/raw     → Get raw rows for an upload batch
 *   - DELETE /uploads/:id       → Delete an upload batch (and associated raw rows)
 */

const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Helper: Generate unique batch ID ──────────────────────────────────────
function generateBatchId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const short = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `AWS-${dateStr}-${timeStr}-${short}`;
}

// ── Helper: Parse Excel date to YYYY-MM-DD ────────────────────────────────
function parseExcelDate(value) {
    if (!value) return null;

    // Excel serial date
    if (typeof value === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // String date: DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
    if (typeof value === 'string') {
        const trimmed = value.trim();

        // Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }

        // DD/MM/YYYY or DD-MM-YYYY
        const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (match) {
            const dd = match[1].padStart(2, '0');
            const mm = match[2].padStart(2, '0');
            const yyyy = match[3];
            return `${yyyy}-${mm}-${dd}`;
        }
    }

    return null;
}

// ── Helper: Parse Excel time to HH:MM:SS ──────────────────────────────────
function parseExcelTime(value) {
    if (!value) return null;

    // Excel serial time (fraction of day)
    if (typeof value === 'number') {
        const totalSeconds = Math.round(value * 86400);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // String time: HH:MM or HH:MM:SS
    if (typeof value === 'string') {
        const trimmed = value.trim();
        const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (match) {
            const hh = match[1].padStart(2, '0');
            const mm = match[2].padStart(2, '0');
            const ss = (match[3] || '00').padStart(2, '0');
            return `${hh}:${mm}:${ss}`;
        }
    }

    return null;
}

// ── Helper: Normalize column names ────────────────────────────────────────
function normalizeColumnName(name) {
    if (!name) return '';
    return String(name)
        .trim()
        .toUpperCase()
        .replace(/[.\s\/\\-]+/g, '_')  // Replace dots, spaces, slashes, backslashes, hyphens with underscore
        .replace(/_+/g, '_')            // Collapse multiple underscores
        .replace(/^_|_$/g, '');         // Trim leading/trailing underscores
}

// ── Helper: Map Excel columns to DB columns ───────────────────────────────
const COLUMN_MAP = {
    // ABN ID
    'ABN_ID': 'abn_id',
    'ABNID': 'abn_id',

    // ABN Type
    'ABN_TYPE': 'abn_type',
    'ABNTYPE': 'abn_type',

    // Subhead
    'SUBHEAD': 'subhead',
    'SUB_HEAD': 'subhead',

    // Report Station (various abbreviations)
    'REPORT_STATION': 'report_station',
    'REPORTSTATION': 'report_station',
    'REPORTSTTN': 'report_station',
    'REPORT_STTN': 'report_station',
    'RPT_STATION': 'report_station',
    'RPTSTTN': 'report_station',

    // Report Division (various abbreviations)
    'REPORT_DIVISION': 'report_division',
    'REPORTDIVISION': 'report_division',
    'REPORTDIV': 'report_division',
    'REPORT_DIV': 'report_division',
    'RPT_DIV': 'report_division',
    'RPTDIV': 'report_division',

    // From Station
    'FROM_STATION': 'from_station',
    'FROMSTATION': 'from_station',
    'FROMSTTN': 'from_station',
    'FROM_STTN': 'from_station',
    'FROM': 'from_station',

    // To Station
    'TO_STATION': 'to_station',
    'TOSTATION': 'to_station',
    'TOSTTN': 'to_station',
    'TO_STTN': 'to_station',
    'TO': 'to_station',

    // Crew ID
    'CREW_ID': 'crew_id',
    'CREWID': 'crew_id',
    'CREW': 'crew_id',
    'CREW_CLIID': 'crew_id',
    'CREWCLIID': 'crew_id',

    // Crew Name
    'CREW_NAME': 'crew_name',
    'CREWNAME': 'crew_name',
    'CREW_CLINAME': 'crew_name',
    'CREWCLINAME': 'crew_name',

    // Designation
    'DESIGNATION': 'designation',
    'DESIG': 'designation',
    'DESG': 'designation',

    // ABN Date
    'ABN_DATE': 'abn_date',
    'ABNDATE': 'abn_date',
    'DATE': 'abn_date',

    // ABN Time
    'ABN_TIME': 'abn_time',
    'ABNTIME': 'abn_time',
    'TIME': 'abn_time',

    // KM fields
    'FROM_KM': 'from_km',
    'FROMKM': 'from_km',
    'TO_KM': 'to_km',
    'TOKM': 'to_km',

    // Status
    'STATUS': 'status',

    // Filled By
    'FILLED_BY': 'filled_by',
    'FILLEDBY': 'filled_by',

    // Loco/D-Cab
    'LOCO': 'loco_raw',
    'LOCO_RAW': 'loco_raw',
    'D_CAB': 'loco_raw',
    'DCAB': 'loco_raw',
    'D-CAB': 'loco_raw',

    // Loco Shed
    'LOCO_SHED': 'loco_shed',
    'LOCOSHED': 'loco_shed',
    'SHED': 'loco_shed',

    // Train Number
    'TRAIN_NUMBER': 'train_number',
    'TRAINNUMBER': 'train_number',
    'TRAIN_NO': 'train_number',
    'TRAINNO': 'train_number',
    'TR_NO': 'train_number',
    'TRNO': 'train_number',
    'TRAIN': 'train_number',

    // SMS to LP
    'SMS_TO_LP': 'sms_to_lp',
    'SMSTOLP': 'sms_to_lp',
    'SMSTO_LP': 'sms_to_lp',
    'SMSTOLP': 'sms_to_lp',
    'SMS': 'sms_to_lp',

    // Detail
    'DETAIL': 'detail',
    'DETAILS': 'detail',

    // Closing Remarks
    'CLOSING_REMARKS': 'closing_remarks',
    'CLOSINGREMARKS': 'closing_remarks',
    'CLOSING_REM': 'closing_remarks',
    'CLOSINGREM': 'closing_remarks',
    'REMARKS': 'closing_remarks',

    // App Remarks Date
    'APP_REMARKS_DATE': 'app_remarks_date',
    'APPREMARKSDATE': 'app_remarks_date',
    'APP_REM_DATE': 'app_remarks_date',
    'APPREMDATE': 'app_remarks_date',

    // Reporting Date
    'REPORTING_DATE': 'reporting_date',
    'REPORTINGDATE': 'reporting_date',
    'RPTG_DATE': 'reporting_date',
    'RPTGDATE': 'reporting_date',
    'RPT_DATE': 'reporting_date',
    'RPTDATE': 'reporting_date',
};

function mapColumnName(excelCol) {
    const normalized = normalizeColumnName(excelCol);
    return COLUMN_MAP[normalized] || null;
}

// The three EMU crew lobbies. This module is about EMU motormen (MMAN/SGDP) and
// the JPO rules count acts per CAB and per RAKE, so a loco-hauled report has no
// place in it — its "D/Cab" is a loco number (39310, 37775) that can never match
// a rake. The CMS file is division-wide and carries loco lobbies (CSMT, CSTM,
// KYN, PNVL) plus ~40 foreign ones, so gate on the lobby in the abn_id.
const EMU_LOBBIES = ['CSTS', 'KYNS', 'PNVS'];

// The sections AWS covers: the suburban network only. The ghats (KJT-LNL,
// KSRA-IGP) and anything beyond (Roha, RN …) are worked by mail/goods crew, not
// EMU motormen, and are outside this module.
//
// This is not a nicety — it is what makes a Karjat signal resolvable. A station
// signal is recorded once per section running through it, so "KJT S-22" exists
// as KJT-KHPI id 1978 AND KJT-LNL ids 2012/2062 — the SAME physical magnet, but
// the ghat copies carry no magnet_id, so they would count as separate magnets
// and never trip Rule 3b. Scoping the match to suburban leaves exactly one
// candidate: the copy an EMU motorman can actually have passed.
//
// An ALLOWLIST, deliberately: a section added to div_signals later (another ghat,
// a goods line) is out of AWS scope until someone puts it here on purpose.
// Every signal in these sections has a magnet_id; the two excluded ones have none.
const AWS_SECTIONS = [
    'CSMT-KYN', 'CSMT-PNVL', 'CLA-KYN', 'KYN-KSRA', 'KYN-KJT', 'KJT-KHPI',
    'VDLR-GMN', 'TNA-TUH', 'TUH-NEU', 'TUH-VSH', 'NEU-KILLE', 'KILLE-URAN', 'BEPR-KILLE',
];

function isEmuLobby(abnId) {
    const lobby = String(abnId || '').split('/')[0].trim().toUpperCase();
    return EMU_LOBBIES.includes(lobby);
}

// ── Helper: Check if row is AWS candidate ─────────────────────────────────
// AWS events almost always have braking type codes: A, B, C, D, E, P, Q, R, or AUX
// Just mentioning "AWS" without a type code is usually a suggestion/feedback, not an event
function isAwsCandidate(row) {
    const abnType = String(row.abn_type || '').toUpperCase();
    const detail = String(row.detail || '').toUpperCase();

    // EMU lobbies only — see EMU_LOBBIES above.
    if (!isEmuLobby(row.abn_id)) {
        return false;
    }

    // Must be ST or EMU type
    if (!['ST', 'EMU'].includes(abnType)) {
        return false;
    }

    // Pattern 1: "TYPE A" / "Cat-E" / "CATEGORY B" (with optional separator)
    // Examples: "TYPE A at signal", "TYPE-B BRAKING", "TYPEC at KM 45", "Cat-E"
    if (/\b(?:TYPE|CAT(?:EGORY)?)[\s\-.:]*[ABCDEPQR]\b/i.test(detail)) {
        return true;
    }

    // Pattern 2: "A TYPE", "B TYPE", "E Cat" (reverse order)
    // Examples: "A TYPE at CSMT", "C-TYPE braking"
    if (/\b[ABCDEPQR][\s\-]*(?:TYPE|CAT(?:EGORY)?)\b/i.test(detail)) {
        return true;
    }

    // Pattern 3: AUX braking (standalone word)
    // Examples: "AUX at NRL S 18", "AUX BRAKING"
    if (/\bAUX\b/.test(detail)) {
        return true;
    }

    // Pattern 4: Standalone braking codes with context
    // Examples: "A BRKING at signal", "B BRKG", "C at signal S-18"
    // Must have single letter A-E or P-R followed by location/braking context
    if (/\b[ABCDEPQR]\s+(BRKING|BRKG|AT\s+\w+|SIGNAL|SIG\b)/i.test(detail)) {
        return true;
    }

    // Pattern 5: "AWS TYPE" followed by code
    // Examples: "AWS TYPE A", "AWS TYPE-C"
    if (/AWS\s+TYPE[\s\-]*[ABCDEPQR]\b/i.test(detail)) {
        return true;
    }

    // Pattern 6: "ON A", "ON B", etc. - code follows "ON" (acted on [code] aspect)
    // Examples: "AWS act BY S 46 On A", "acted on B", "on C aspect"
    if (/\bON\s+[ABCDEPQR]\b/i.test(detail)) {
        return true;
    }

    // Pattern 7: "ACT" or "ACTED" followed by signal/location then code at end
    // Examples: "AWS ACT at S-18 A", "acted S 46 B"
    if (/\b(ACT|ACTED)\b.*\b[ABCDEPQR]\s*$/i.test(detail)) {
        return true;
    }

    // Pattern 8: "AWS ACTED" or "AWS ACT" - clear AWS event indicator
    // Examples: "AWS ACTED ON GREEN ASPECT OF H2212", "AWS ACT at signal"
    if (/\bAWS\s+(ACT|ACTED|ACTING)\b/i.test(detail)) {
        return true;
    }

    // Pattern 9: Aspect color mentions (implies specific codes)
    // GREEN ASPECT/SIGNAL = A, DOUBLE YELLOW = B, YELLOW = C
    // Examples: "acted on green aspect", "double yellow signal", "at yellow"
    if (/\b(GREEN|DOUBLE\s*YELLOW|YELLOW)\s*(ASPECT|SIGNAL|SIG)\b/i.test(detail)) {
        return true;
    }

    // Pattern 10: Quoted or parenthesized codes like "D", 'A', (B)
    // Examples: AWS "D" @ NE 54/26, AWS Act 'AUX', AWS (C) at signal
    if (/["'(][ABCDEPQR]["')]/.test(detail)) {
        return true;
    }

    // Pattern 11: AWS malefaction/malfunction reports ("Aws Malefaction- B …").
    if (/\bMAL(E?FACTION|FUNCTION)\b/i.test(detail)) {
        return true;
    }

    return false;
}

// ── Helper: detail records 2+ AWS acts ────────────────────────────────────
// e.g. "B @ NE 5918   Aux @ NE 5510" — splitAwsEvents() breaks these into one
// act each; this just reports whether a split is warranted.
function isMultiAwsEvent(detail) {
    return splitAwsEvents(detail).length >= 2;
}

// ── Helper: split a multi-act detail into individual acts ──────────────────
// Grammar (validated on real CMS data): a detail is a sequence of
// "<CODE> (@|at) <location>" segments, optionally with a leading "AWS Unit no
// …" prefix and "and"/"&"/"and again"/"AWS act." noise between/after acts.
// Returns [{ code, locationText }, …] — one per act. A single-act detail yields
// one element; a detail with no "code @/at" anchor yields []. The location text
// is handed to extractLocation()/resolveBareSignalForRow() per act, so no new
// location parsing lives here.
function splitAwsEvents(detail) {
    const text = normalizeDetail(detail);
    // Same code-anchor used elsewhere: a code letter (or AUX) followed by @ or AT.
    const anchor = /\b(AUX|[ABCDEPQR])\s*(?:@|AT\b)\s*/g;
    const hits = [];
    let m;
    while ((m = anchor.exec(text)) !== null) {
        hits.push({ code: m[1], start: m.index, locStart: anchor.lastIndex });
    }
    return hits.map((h, i) => {
        const end = i + 1 < hits.length ? hits[i + 1].start : text.length;
        const locationText = text
            .slice(h.locStart, end)
            // drop joiners / trailing "AWS …" boilerplate that follow the location.
            .replace(/(\bAND AGAIN\b|\bAND\b|&|\bAWS\b.*).*$/, '')
            .trim();
        return { code: h.code, locationText };
    });
}

// ── Helper: Check if row is "suspected" AWS ───────────────────────────────
// ST/EMU type that contains AWS-related words but doesn't have clear type codes
// Also checks crew_id - only suburban motormen (PNVS/KYNS/CSTS) deal with AWS
function isSuspectedAws(row) {
    // If already detected as AWS candidate, not suspected
    if (isAwsCandidate(row)) {
        return false;
    }

    const abnType = String(row.abn_type || '').toUpperCase();
    const detail = String(row.detail || '').toUpperCase();
    const crewId = String(row.crew_id || '').toUpperCase();

    // Must be ST or EMU type
    if (!['ST', 'EMU'].includes(abnType)) {
        return false;
    }

    // Must be suburban motorman (PNVS, KYNS, CSTS prefix)
    // LP goods, LP mail, LP ghat etc. don't deal with AWS
    const suburbanPrefixes = ['PNVS', 'KYNS', 'CSTS'];
    const isSuburbanCrew = suburbanPrefixes.some(prefix => crewId.startsWith(prefix));
    if (!isSuburbanCrew && crewId.length > 0) {
        return false;
    }

    // Contains AWS-related keywords but no clear type code
    const suspectedKeywords = [
        'AWS',
        'SIGNAL',
        'SIG ',
        'SIG.',
        'MAGNET',
        'HOOTER',
        'VIGILANCE',
        'BRAKING',
        'BRKG',
    ];

    for (const kw of suspectedKeywords) {
        if (detail.includes(kw)) {
            return true;
        }
    }

    return false;
}

// ── POST /upload ──────────────────────────────────────────────────────────
// Upload CMS Excel, parse rows, show preview, save to div_aws_cms_raw
router.post('/upload', upload.single('file'), async (req, res) => {
    let filePath = null;
    let conn = null;

    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext !== '.xlsx' && ext !== '.xls') {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Only Excel files (.xlsx, .xls) are supported' });
        }

        console.log('[AWS Upload] Processing:', req.file.originalname);

        // Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // First, read as array of arrays to find the header row
        const rawArrays = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        console.log(`[AWS Upload] Sheet has ${rawArrays.length} rows`);

        if (rawArrays.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        // Find the header row - look for row containing ABN.ID or similar
        let headerRowIndex = 0;
        const headerKeywords = ['ABN.ID', 'ABN_ID', 'ABNID', 'ABN.TYPE', 'ABN_TYPE', 'ABNTYPE', 'FROM STATION', 'DETAIL'];

        for (let i = 0; i < Math.min(10, rawArrays.length); i++) {
            const row = rawArrays[i];
            const rowStr = row.map(c => String(c || '').toUpperCase()).join(' ');

            for (const kw of headerKeywords) {
                if (rowStr.includes(kw)) {
                    headerRowIndex = i;
                    console.log(`[AWS Upload] Found header row at index ${i}: "${row.slice(0, 5).join(', ')}..."`);
                    break;
                }
            }
            if (headerRowIndex > 0) break;
        }

        // Now read with the correct header row
        const rawData = xlsx.utils.sheet_to_json(sheet, {
            defval: '',
            range: headerRowIndex  // Start from the header row
        });

        console.log(`[AWS Upload] Found ${rawData.length} data rows (header at row ${headerRowIndex + 1})`);

        if (rawData.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'No data rows found after header' });
        }

        // Get column mapping from first row
        const firstRow = rawData[0];
        const excelColumns = Object.keys(firstRow);
        const columnMapping = {};
        const unmappedColumns = [];

        for (const col of excelColumns) {
            const dbCol = mapColumnName(col);
            if (dbCol) {
                columnMapping[col] = dbCol;
            } else {
                unmappedColumns.push(col);
            }
        }

        console.log('[AWS Upload] Excel columns found:', excelColumns);
        console.log('[AWS Upload] Column mapping:', columnMapping);
        console.log('[AWS Upload] Unmapped columns:', unmappedColumns);

        // Transform rows
        const transformedRows = [];
        let minDate = null, maxDate = null;

        for (const row of rawData) {
            const transformed = {};

            for (const [excelCol, dbCol] of Object.entries(columnMapping)) {
                let value = row[excelCol];

                // Handle date columns
                if (dbCol === 'abn_date' || dbCol === 'reporting_date') {
                    value = parseExcelDate(value);
                }
                // Handle time columns
                else if (dbCol === 'abn_time') {
                    value = parseExcelTime(value);
                }
                // Trim strings
                else if (typeof value === 'string') {
                    value = value.trim();
                }

                transformed[dbCol] = value || null;
            }

            // Track date range
            if (transformed.abn_date) {
                if (!minDate || transformed.abn_date < minDate) minDate = transformed.abn_date;
                if (!maxDate || transformed.abn_date > maxDate) maxDate = transformed.abn_date;
            }

            // Store original row as JSON
            transformed.raw_json = JSON.stringify(row);

            transformedRows.push(transformed);
        }

        // Identify AWS candidates
        const awsCandidates = transformedRows.filter(isAwsCandidate);
        console.log(`[AWS Upload] AWS candidates: ${awsCandidates.length} of ${transformedRows.length}`);

        // Get pool and check for duplicates
        const pool = req.app.locals.pool;
        conn = await pool.getConnection();

        // Get existing ABN IDs
        const abnIds = transformedRows
            .map(r => r.abn_id)
            .filter(id => id);

        let existingIds = new Set();
        if (abnIds.length > 0) {
            const [existing] = await conn.query(
                'SELECT abn_id FROM div_aws_cms_raw WHERE abn_id IN (?)',
                [abnIds]
            );
            existingIds = new Set(existing.map(r => r.abn_id));
        }

        // Separate new and duplicate rows
        const newRows = transformedRows.filter(r => r.abn_id && !existingIds.has(r.abn_id));
        const duplicateRows = transformedRows.filter(r => r.abn_id && existingIds.has(r.abn_id));
        const noIdRows = transformedRows.filter(r => !r.abn_id);

        // For preview mode, return without saving
        if (req.query.preview === 'true') {
            fs.unlinkSync(filePath);
            conn.release();

            // If no columns were mapped, show raw data preview instead
            const hasMapping = Object.keys(columnMapping).length > 0;

            if (!hasMapping) {
                // For unmapped files, show first few columns
                const sampleRows = rawData.slice(0, 10).map(r => {
                    const preview = {};
                    const keys = Object.keys(r).slice(0, 8);
                    for (const k of keys) {
                        let val = r[k];
                        if (typeof val === 'string' && val.length > 50) {
                            val = val.substring(0, 50) + '...';
                        }
                        preview[k] = val;
                    }
                    return preview;
                });

                return res.json({
                    preview: true,
                    filename: req.file.originalname,
                    total_rows: transformedRows.length,
                    has_mapping: false,
                    columns_found: excelColumns,
                    sample_rows: sampleRows,
                });
            }

            // Categorize rows: detected AWS, suspected AWS, other
            const suspectedAws = transformedRows.filter(r => isSuspectedAws(r));

            // Detect potential duplicates within the file (same crew + date + location)
            const duplicateKeys = new Map(); // key -> first index
            const potentialDuplicates = new Set(); // indices of potential duplicates
            transformedRows.forEach((r, idx) => {
                // Extract location from detail for duplicate detection
                const { raw: locRaw } = extractLocation(r.detail);

                // Key: crew_id + date + (km OR signal location OR loco)
                const locationPart = r.from_km || locRaw || r.loco_raw || '';
                const key = [
                    r.crew_id || '',
                    r.abn_date || '',
                    locationPart
                ].join('|').toUpperCase();

                if (key.length > 3) { // Only if key has meaningful data
                    if (duplicateKeys.has(key)) {
                        potentialDuplicates.add(idx);
                        potentialDuplicates.add(duplicateKeys.get(key));
                    } else {
                        duplicateKeys.set(key, idx);
                    }
                }
            });

            // Build row mapper function
            const mapRow = (r, idx) => ({
                _idx: idx,  // Original index for tracking
                abn_id: r.abn_id,
                abn_type: r.abn_type,
                abn_date: r.abn_date,
                from_station: r.from_station,
                to_station: r.to_station,
                train_number: r.train_number,
                loco_raw: r.loco_raw,
                crew_id: r.crew_id,
                from_km: r.from_km,
                detail: r.detail ? r.detail.substring(0, 150) + (r.detail.length > 150 ? '...' : '') : null,
                detail_full: r.detail || null,
                is_duplicate: r.abn_id && existingIds.has(r.abn_id),
                is_potential_duplicate: potentialDuplicates.has(idx),
            });

            // Get indices for each category
            const detectedRows = [];
            const suspectedRows = [];
            const otherRows = [];

            // Helper: Check if crew is relevant (suburban motormen or CLI)
            const isRelevantCrew = (crewId) => {
                if (!crewId) return false;
                const id = String(crewId).toUpperCase();
                // Suburban motormen: PNVS, CSTS, KYNS
                // CLI: CSTM (like CSTM0012, CSTM0102)
                const relevantPrefixes = ['PNVS', 'CSTS', 'KYNS', 'CSTM'];
                return relevantPrefixes.some(prefix => id.startsWith(prefix));
            };

            transformedRows.forEach((r, idx) => {
                const mapped = mapRow(r, idx);
                if (isAwsCandidate(r)) {
                    detectedRows.push(mapped);
                } else if (isSuspectedAws(r)) {
                    suspectedRows.push(mapped);
                } else if (isRelevantCrew(r.crew_id)) {
                    // Only show other rows from suburban motormen or CLI
                    otherRows.push(mapped);
                }
            });

            return res.json({
                preview: true,
                filename: req.file.originalname,
                total_rows: transformedRows.length,
                aws_candidate_rows: awsCandidates.length,
                suspected_aws_rows: suspectedAws.length,
                new_rows: newRows.length,
                duplicate_rows: duplicateRows.length,
                no_id_rows: noIdRows.length,
                date_range: { from: minDate, to: maxDate },
                columns_found: excelColumns,
                columns_mapped: Object.entries(columnMapping).map(([k, v]) => `${k} → ${v}`),
                unmapped_columns: unmappedColumns,
                has_mapping: true,
                // Categorized rows
                detected_aws: detectedRows,
                suspected_aws: suspectedRows,
                other_rows: otherRows,
            });
        }

        // Get user-selected AWS candidate indices from request
        // Sent as JSON string in FormData field 'aws_candidate_indices'
        let awsCandidateIndices = new Set();
        if (req.body && req.body.aws_candidate_indices) {
            try {
                const indices = JSON.parse(req.body.aws_candidate_indices);
                if (Array.isArray(indices)) {
                    awsCandidateIndices = new Set(indices);
                }
            } catch (e) {
                console.log('[AWS Upload] Could not parse aws_candidate_indices, using auto-detection');
            }
        }

        // If no indices provided, use auto-detected AWS candidates
        if (awsCandidateIndices.size === 0) {
            transformedRows.forEach((r, idx) => {
                if (isAwsCandidate(r)) {
                    awsCandidateIndices.add(idx);
                }
            });
        }

        // Create upload batch
        const batchId = generateBatchId();
        const userId = req.session.user.id || null;

        await conn.query(
            `INSERT INTO div_aws_cms_uploads
                (upload_batch_id, source_filename, uploaded_by_user_id, report_from_date, report_to_date,
                 total_rows, aws_candidate_rows, imported_rows, skipped_duplicate_rows, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IMPORTING')`,
            [batchId, req.file.originalname, userId, minDate, maxDate,
             transformedRows.length, awsCandidateIndices.size, 0, duplicateRows.length]
        );

        const [[{ id: uploadId }]] = await conn.query(
            'SELECT id FROM div_aws_cms_uploads WHERE upload_batch_id = ?',
            [batchId]
        );

        // Insert ALL rows (not just AWS candidates)
        let importedCount = 0;
        let awsCount = 0;
        for (let idx = 0; idx < transformedRows.length; idx++) {
            const row = transformedRows[idx];

            // Skip rows without abn_id or duplicates
            if (!row.abn_id || existingIds.has(row.abn_id)) {
                continue;
            }

            const isAws = awsCandidateIndices.has(idx) ? 1 : 0;
            if (isAws) awsCount++;

            try {
                await conn.query(
                    `INSERT INTO div_aws_cms_raw
                        (upload_id, abn_id, abn_type, subhead, report_station, report_division,
                         from_station, to_station, crew_id, crew_name, designation,
                         abn_date, abn_time, from_km, to_km, status, filled_by,
                         loco_raw, loco_shed, train_number, sms_to_lp,
                         detail, closing_remarks, app_remarks_date, reporting_date, raw_json, is_aws_candidate)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [uploadId, row.abn_id, row.abn_type, row.subhead, row.report_station, row.report_division,
                     row.from_station, row.to_station, row.crew_id, row.crew_name, row.designation,
                     row.abn_date, row.abn_time, row.from_km, row.to_km, row.status, row.filled_by,
                     row.loco_raw, row.loco_shed, row.train_number, row.sms_to_lp,
                     row.detail, row.closing_remarks, row.app_remarks_date, row.reporting_date, row.raw_json, isAws]
                );
                importedCount++;
            } catch (err) {
                // Skip duplicates (unique constraint on abn_id)
                if (err.code !== 'ER_DUP_ENTRY') {
                    console.error('[AWS Upload] Row insert error:', err.message);
                }
            }
        }

        // Update upload status
        await conn.query(
            `UPDATE div_aws_cms_uploads
             SET imported_rows = ?, aws_candidate_rows = ?, status = 'COMPLETED'
             WHERE id = ?`,
            [importedCount, awsCount, uploadId]
        );

        // ── Auto-parse AWS candidates into events ──
        let parsedCount = 0, needsReviewCount = 0, skippedDupCount = 0;
        if (awsCount > 0) {
            const [awsRows] = await conn.query(
                `SELECT * FROM div_aws_cms_raw WHERE upload_id = ? AND is_aws_candidate = 1`,
                [uploadId]
            );

            for (const raw of awsRows) {
                try {
                    // One CMS row -> 1..N events (multi-act details are split).
                    const r = await insertEventsForRaw(conn, raw, userId);
                    parsedCount += r.inserted;
                    needsReviewCount += r.needsReview;
                    skippedDupCount += r.skippedDup;
                } catch (err) {
                    if (err.code !== 'ER_DUP_ENTRY') {
                        console.error(`[AWS Auto-Parse] Error:`, err.message);
                    }
                }
            }
            console.log(`[AWS Auto-Parse] ${parsedCount} events created, ${needsReviewCount} need review, ${skippedDupCount} re-log duplicates skipped`);
        }

        // ── Auto-match the just-parsed events (signals + rakes) ──
        // So the operator only uploads — no separate Match Signals / Match Rakes
        // click per file. (Classify stays a per-period action, run at review.)
        let autoMatchedSignals = 0, autoMatchedRakes = 0;
        const [newEvents] = await conn.query(
            `SELECT e.id, e.location_raw, e.location_type, e.train_number, e.loco_raw,
                    r.from_station, r.to_station, r.detail
             FROM div_aws_events e
             JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE r.upload_id = ? AND (e.signal_id IS NULL OR e.matched_rake_id IS NULL)`,
            [uploadId]
        );
        for (const ev of newEvents) {
            if (ev.location_type === 'SIGNAL' && ev.location_raw) {
                const sections  = await routeSectionsForEvent(conn, ev.from_station, ev.to_station, ev.train_number);
                const direction = await directionForEvent(conn, ev);
                const sm = await matchSignalFromDb(conn, ev.location_raw, { sections, direction });
                if (sm.signal_id) {
                    // Canonicalise the displayed location to the matched signal's
                    // name so "SE5602" and "SE-5602" (same magnet) read identically
                    // and aggregate together in the reports.
                    await conn.query(
                        `UPDATE div_aws_events SET signal_id = ?, signal_match_confidence = ?,
                                location_raw = ?, normalized_location = ?
                         WHERE id = ? AND signal_id IS NULL`,
                        [sm.signal_id, sm.confidence, sm.signal_number, normalizeForSignalMatch(ev.location_raw), ev.id]
                    );
                    autoMatchedSignals++;
                }
            }
            if (ev.loco_raw) {
                const rm = await matchRakeFromDb(conn, ev.loco_raw);
                if (rm.rake_id) {
                    await conn.query(
                        `UPDATE div_aws_events SET matched_coach_id = ?, matched_rake_id = ?
                         WHERE id = ? AND matched_rake_id IS NULL`,
                        [rm.coach_id, rm.rake_id, ev.id]
                    );
                    autoMatchedRakes++;
                }
            }
        }
        console.log(`[AWS Upload] Auto-matched ${autoMatchedSignals} signals, ${autoMatchedRakes} rakes`);

        // Cleanup
        fs.unlinkSync(filePath);
        conn.release();

        console.log(`[AWS Upload] Completed: ${importedCount} rows imported (${awsCount} AWS), ${duplicateRows.length} duplicates skipped`);

        res.json({
            success: true,
            upload_id: uploadId,
            batch_id: batchId,
            filename: req.file.originalname,
            total_rows: transformedRows.length,
            aws_candidate_rows: awsCount,
            imported_rows: importedCount,
            skipped_duplicate_rows: duplicateRows.length,
            skipped_no_id_rows: noIdRows.length,
            date_range: { from: minDate, to: maxDate },
            // Auto-parse results
            events_created: parsedCount,
            events_need_review: needsReviewCount,
            events_auto_approved: parsedCount - needsReviewCount,
            auto_matched_signals: autoMatchedSignals,
            auto_matched_rakes: autoMatchedRakes,
        });

    } catch (err) {
        console.error('[AWS Upload] Error:', err);

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        if (conn) {
            conn.release();
        }

        res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});

// ── GET /uploads ──────────────────────────────────────────────────────────
// List all upload batches with summary stats
router.get('/uploads', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            `SELECT id, upload_batch_id, source_filename, uploaded_by_user_id,
                    report_from_date, report_to_date,
                    total_rows, aws_candidate_rows, imported_rows, skipped_duplicate_rows,
                    status, remarks, created_at
             FROM div_aws_cms_uploads
             ORDER BY created_at DESC
             LIMIT 100`
        );

        res.json({ uploads: rows });
    } catch (err) {
        console.error('[AWS /uploads] Error:', err);
        res.status(500).json({ error: 'Failed to load uploads' });
    }
});

// ── GET /uploads/:id ──────────────────────────────────────────────────────
// Get single upload batch details
router.get('/uploads/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const uploadId = parseInt(req.params.id, 10);

        const [[upload]] = await pool.query(
            `SELECT * FROM div_aws_cms_uploads WHERE id = ?`,
            [uploadId]
        );

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        // Get summary by abn_type
        const [typeSummary] = await pool.query(
            `SELECT abn_type, COUNT(*) AS count
             FROM div_aws_cms_raw
             WHERE upload_id = ?
             GROUP BY abn_type
             ORDER BY count DESC`,
            [uploadId]
        );

        // Get summary by from_station
        const [stationSummary] = await pool.query(
            `SELECT from_station, COUNT(*) AS count
             FROM div_aws_cms_raw
             WHERE upload_id = ?
             GROUP BY from_station
             ORDER BY count DESC
             LIMIT 10`,
            [uploadId]
        );

        res.json({
            upload,
            summary: {
                by_type: typeSummary,
                by_station: stationSummary,
            },
        });
    } catch (err) {
        console.error('[AWS /uploads/:id] Error:', err);
        res.status(500).json({ error: 'Failed to load upload details' });
    }
});

// ── GET /uploads/:id/raw ──────────────────────────────────────────────────
// Get raw rows for an upload batch with pagination
router.get('/uploads/:id/raw', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const uploadId = parseInt(req.params.id, 10);
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
        const offset = parseInt(req.query.offset, 10) || 0;
        const abnType = req.query.abn_type || null;
        const awsOnly = req.query.aws_only === 'true';

        // Build query
        let where = 'upload_id = ?';
        const params = [uploadId];

        if (abnType) {
            where += ' AND abn_type = ?';
            params.push(abnType);
        }

        // Count total
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM div_aws_cms_raw WHERE ${where}`,
            params
        );

        // Get rows
        const [rows] = await pool.query(
            `SELECT id, abn_id, abn_type, subhead, from_station, to_station,
                    crew_id, crew_name, abn_date, abn_time,
                    loco_raw, loco_shed, train_number, detail, closing_remarks
             FROM div_aws_cms_raw
             WHERE ${where}
             ORDER BY abn_date DESC, abn_time DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Mark AWS candidates
        const rowsWithFlag = rows.map(r => ({
            ...r,
            is_aws_candidate: isAwsCandidate(r),
        }));

        // Filter if requested
        const finalRows = awsOnly
            ? rowsWithFlag.filter(r => r.is_aws_candidate)
            : rowsWithFlag;

        res.json({
            total,
            limit,
            offset,
            rows: finalRows,
        });
    } catch (err) {
        console.error('[AWS /uploads/:id/raw] Error:', err);
        res.status(500).json({ error: 'Failed to load raw rows' });
    }
});

// ── DELETE /uploads/:id ───────────────────────────────────────────────────
// Delete an upload batch and all associated raw rows
router.delete('/uploads/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const pool = req.app.locals.pool;
        const uploadId = parseInt(req.params.id, 10);

        // Check if upload exists
        const [[upload]] = await pool.query(
            'SELECT id, upload_batch_id FROM div_aws_cms_uploads WHERE id = ?',
            [uploadId]
        );

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        // Check if any events have been parsed from this upload
        const [[{ eventCount }]] = await pool.query(
            `SELECT COUNT(*) AS eventCount FROM div_aws_events e
             JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE r.upload_id = ?`,
            [uploadId]
        );

        if (eventCount > 0) {
            return res.status(409).json({
                error: 'Cannot delete: parsed events exist',
                event_count: eventCount,
            });
        }

        // Delete raw rows first (FK will cascade, but explicit is clearer)
        await pool.query('DELETE FROM div_aws_cms_raw WHERE upload_id = ?', [uploadId]);

        // Delete upload batch
        await pool.query('DELETE FROM div_aws_cms_uploads WHERE id = ?', [uploadId]);

        console.log(`[AWS DELETE] Deleted upload ${upload.upload_batch_id}`);

        res.json({
            success: true,
            deleted_batch_id: upload.upload_batch_id,
        });
    } catch (err) {
        console.error('[AWS DELETE /uploads/:id] Error:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// ── GET /stats ────────────────────────────────────────────────────────────
// Dashboard stats for AWS module
router.get('/stats', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        // Total uploads
        const [[{ uploadCount }]] = await pool.query(
            'SELECT COUNT(*) AS uploadCount FROM div_aws_cms_uploads'
        );

        // Total raw rows
        const [[{ rawCount }]] = await pool.query(
            'SELECT COUNT(*) AS rawCount FROM div_aws_cms_raw'
        );

        // Total events
        const [[{ eventCount }]] = await pool.query(
            'SELECT COUNT(*) AS eventCount FROM div_aws_events'
        );

        // Pending review
        const [[{ pendingReview }]] = await pool.query(
            'SELECT COUNT(*) AS pendingReview FROM div_aws_events WHERE needs_manual_review = 1'
        );

        // Recent uploads
        const [recentUploads] = await pool.query(
            `SELECT id, upload_batch_id, source_filename, imported_rows, created_at
             FROM div_aws_cms_uploads
             ORDER BY created_at DESC
             LIMIT 5`
        );

        res.json({
            upload_count: uploadCount,
            raw_row_count: rawCount,
            event_count: eventCount,
            pending_review: pendingReview,
            recent_uploads: recentUploads,
        });
    } catch (err) {
        console.error('[AWS /stats] Error:', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 6: AWS Parser and Review
// ══════════════════════════════════════════════════════════════════════════

// ── Helper: Extract AWS code from detail text ─────────────────────────────
// A CMS re-log is one physical event submitted twice: same motorman, vehicle,
// exact minute AND AWS code (the abn_id differs each submission, so the abn_id
// dedup misses it). Distinct codes are NOT treated as duplicates — e.g. "C"
// (signal aspect) and "D" (additional magnet) can both genuinely occur, so
// those are left for the reviewing CLI's discretion. Only applied when crew,
// time and loco are all present (the fields that make the match meaningful).
async function isDuplicateAwsEvent(db, ev) {
    if (!ev.crew_id || !ev.abn_time || !ev.loco_raw) return false;
    // location_raw is part of the key so the separate acts of a split multi-event
    // detail (e.g. two "A at …" acts at different signals) are NOT collapsed into
    // one; a genuine CMS re-log still matches on identical crew+time+loco+code+loc.
    const [rows] = await db.query(
        `SELECT id FROM div_aws_events
         WHERE crew_id = ? AND abn_date <=> ? AND abn_time = ? AND loco_raw = ?
           AND aws_code <=> ? AND location_raw <=> ?
         LIMIT 1`,
        [ev.crew_id, ev.abn_date, ev.abn_time, ev.loco_raw, ev.aws_code ?? null, ev.location_raw ?? null]
    );
    return rows.length > 0;
}

// ── Helper: normalise the free-typed CMS detail before pattern matching ────
// Crew type these by hand, so two habits break the patterns:
//   "AWS act...  A. atK 047A"  -> an ellipsis run, and "at" glued to "K 047A".
// Ellipses collapse to a single space, and a glued AT/ON is separated ONLY when
// what follows looks like a signal (letter + 2-5 digits). That narrowness is
// deliberate: it keeps station codes that begin with those letters (ATG, ONE…)
// intact, since a plain word never follows.
function normalizeDetail(detail) {
    return String(detail || '')
        .toUpperCase()
        .replace(/^DETAIL:\s*/i, '')
        .replace(/\.{2,}/g, ' ')
        // Letter O typed for a zero inside a signal number ("LO12" -> "L 012").
        // Only fires behind a known signal prefix, and only when the token already
        // holds a digit — so "No. 7051" (a unit number, N + O) is never touched.
        .replace(/\b(NE|SE|[LKHSA])[\s\-]?([O0-9]{2,5}[A-Z]?)\b/g,
                 (m, prefix, num) => (/\d/.test(num) && /O/.test(num))
                     ? `${prefix} ${num.replace(/O/g, '0')}`
                     : m)
        // Same slip in a standalone number, where the prefix is a station rather
        // than a signal letter ("SIGNAL MNKD 2O" -> "... 20"). The token must be
        // ONLY digits and Os and hold at least one digit, so a word like "NO" or
        // "ON" can never be mangled into a number.
        .replace(/\b([0-9O]{2,5})\b/g,
                 (m) => (/\d/.test(m) && /O/.test(m)) ? m.replace(/O/g, '0') : m)
        .replace(/\b(AT|ON)(?=[A-Z]{1,2}[\s\-]?\d{2,5}[A-Z]?\b)/g, '$1 ')  // "atK 047A"
        .replace(/\b(AT|ON)(?=\d)/g, '$1 ')                          // "at16.21"
        .replace(/(\d)(AT|ON)\b/g, '$1 $2')                          // "NE6101at 16.01"
        // A code word glued to the end of the location ("@H34AUX" -> "@H34 AUX").
        // Without the space neither side can match: \bAUX\b has no word boundary
        // after the digit, and the signal number has none before the letters.
        // AUX only — a single trailing letter is ambiguous with a signal's
        // sub-block letter ("K 024A"), where it belongs to the signal, not the code.
        .replace(/(\d)(AUX)\b/g, '$1 $2')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function extractAwsCode(detail) {
    if (!detail) return { code: null, confidence: null };

    let text = normalizeDetail(detail);

    // Priority 0: Code at START followed by "at" + location (most common pattern)
    // Examples: "B at H-16 AWS ACT", "A at S 46", "C at KM 45"
    const startCodeMatch = text.match(/^([ABCDEPQR])\s+AT\b/);
    if (startCodeMatch) {
        return { code: startCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0b: "AWS [code] at" pattern
    // Examples: "AWS E at Km 55", "AWS C at KYN"
    const awsCodeAtMatch = text.match(/\bAWS\s+([ABCDEPQR])\s+AT\b/);
    if (awsCodeAtMatch) {
        return { code: awsCodeAtMatch[1], confidence: 'HIGH' };
    }

    // Priority 0c: "AWS ACT/ACTED [code] AT" pattern
    // Examples: "AWS ACT E AT THA PF-5", "AWS acted E At KM 76"
    const awsActCodeMatch = text.match(/\bAWS\s+(?:ACT|ACTED|ACTING)\s+([ABCDEPQR])\s+AT\b/);
    if (awsActCodeMatch) {
        return { code: awsActCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0d: "On [code]" at end or "On [code] aspect"
    // Examples: "AWS act BY S 46 On A", "acted on B"
    const onCodeMatch = text.match(/\bON\s+([ABCDEPQR])\s*$/);
    if (onCodeMatch) {
        return { code: onCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0e: Code in quotes or slashes, tolerating spaces:
    // "A", ' A ', "B" (as in 'S-12" B"'), /A/
    const quotedCodeMatch = text.match(/["'\/]\s*([ABCDEPQR])\s*["'\/]/);
    if (quotedCodeMatch) {
        return { code: quotedCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0f: Code in parentheses like (B) or ( A )
    // Examples: AWS Act (B), acted (C)
    const parenCodeMatch = text.match(/\([\s]*([ABCDEPQR])[\s]*\)/);
    if (parenCodeMatch) {
        return { code: parenCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0g: Code in commas like ,C, or , C ,
    // Examples: AWS ACT ,C, AT ASO
    const commaCodeMatch = text.match(/,[\s]*([ABCDEPQR])[\s]*,/);
    if (commaCodeMatch) {
        return { code: commaCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 0h: Single letter code at END of text, trailing the location.
    // Examples: "AWS ACT ON CLA S12 C", "acted at BY S-46 A",
    //           "AWS Act At SE7613 -A." (hyphen-led, full stop after).
    // A separator between the number and the code is REQUIRED — that is what
    // keeps a signal's sub-block letter ("K 024A") from reading as a code.
    const endCodeMatch = text.match(/\d+[A-Z]?[\s.,:\-\/]+([ABCDEPQR])[\s.]*$/);
    if (endCodeMatch) {
        return { code: endCodeMatch[1], confidence: 'HIGH' };
    }

    // Priority 1: Explicit TYPE / CATEGORY codes — "TYPE A", "Cat-E", "CATEGORY B".
    // The JPO calls them types; crew also write them as the category of braking.
    const explicitMatch = text.match(/\b(?:TYPE|CAT(?:EGORY)?)[\s\-.:]*([ABCDEPQR])\b/);
    if (explicitMatch) {
        return { code: explicitMatch[1], confidence: 'HIGH' };
    }

    // Priority 2: Letter + ACT/BRKG pattern (A ACT, B BRKG, etc.)
    const actMatch = text.match(/\b([ABCDEPQR])[\s\-]*(ACT|ACTED|ACTING|BRKG|BRKING)\b/);
    if (actMatch) {
        return { code: actMatch[1], confidence: 'HIGH' };
    }

    // Priority 2b: Code letter followed by "at" + signal/location pattern anywhere
    // Examples: "AWS B at H-16", "defect A at S 46"
    const codeAtMatch = text.match(/\b([ABCDEPQR])\s+AT\s+([A-Z][\-\s]?\d+|\w{2,5}\s+S[\s\-\/]?\d+|KM)/);
    if (codeAtMatch) {
        return { code: codeAtMatch[1], confidence: 'HIGH' };
    }

    // Priority 2c: code directly before "AT" anywhere ("B At SE6205", "D at 9/340",
    // "at C at KYN 84", "S 22 at C").
    const codeAtAnywhere = text.match(/\b([ABCDEPQR])\s+AT\b/);
    if (codeAtAnywhere) {
        return { code: codeAtAnywhere[1], confidence: 'HIGH' };
    }

    // Priority 2d: code right after AWS + separators ("AWS -A", "AWS. B", "AWS:-B").
    const awsSepCode = text.match(/\bAWS[\s.:@\-]+([ABCDEPQR])\b/);
    if (awsSepCode) {
        return { code: awsSepCode[1], confidence: 'HIGH' };
    }

    // Priority 2e: "<code> TYPE" / "<code> CAT" ("A TYPE AT AMB S6", "E Cat").
    const codeTypeMatch = text.match(/\b([ABCDEPQR])[\s\-]+(?:TYPE|CAT(?:EGORY)?)\b/);
    if (codeTypeMatch) {
        return { code: codeTypeMatch[1], confidence: 'HIGH' };
    }

    // Priority 3: AUX patterns
    const auxPatterns = [
        /\bAUX\b/,
        /CALLING[\s\-]*ON/,
        /CALL[\s\-]*ON/,
        /SHUNT(ING)?[\s\-]*SIG/,
        /\bA[\s\-]*MARKER\b/,
        /\bA[\s\-]*BOARD\b/,
        /\bG[\s\-]*BOARD\b/,
        /BLANK[\s\-]*SIG/,
        /T[\s\/]*A[\s\-]*912/,
        /WITH[\s\-]*AUTHORITY/,
        /PASSED.*AUTHORITY/,
    ];
    for (const pattern of auxPatterns) {
        if (pattern.test(text)) {
            return { code: 'AUX', confidence: 'HIGH' };
        }
    }

    // Priority 4: Aspect change patterns (P, Q, R)
    if (/GREEN.*TO.*DOUBLE[\s\-]*YELLOW|G[\s\-]*TO[\s\-]*DY|GREEN.*→.*D/i.test(text)) {
        return { code: 'P', confidence: 'MEDIUM' };
    }
    if (/GREEN.*TO.*YELLOW|G[\s\-]*TO[\s\-]*Y|GREEN.*→.*Y/i.test(text) && !/DOUBLE/.test(text)) {
        return { code: 'Q', confidence: 'MEDIUM' };
    }
    if (/DOUBLE[\s\-]*YELLOW.*TO.*YELLOW|DY[\s\-]*TO[\s\-]*Y|D.*→.*Y/i.test(text)) {
        return { code: 'R', confidence: 'MEDIUM' };
    }

    // Priority 5: Aspect color keywords
    // A - Green
    if (/GREEN[\s\-]*(ASPECT|SIGNAL|SIG)|PROCEED/i.test(text) && !/DOUBLE|CHANGE|TO/.test(text)) {
        return { code: 'A', confidence: 'MEDIUM' };
    }

    // B - Double Yellow
    if (/DOUBLE[\s\-]*YELLOW|DBL[\s\-]*YELLOW|D[\s\/]Y\b/i.test(text) && !/TO|CHANGE/.test(text)) {
        return { code: 'B', confidence: 'MEDIUM' };
    }

    // C - Yellow (single)
    // Patterns: "Yellow aspect", "yellow signal", "signal yellow", "on yellow", "at yellow"
    if ((/YELLOW[\s\-]*(ASPECT|SIGNAL|SIG)?|SIGNAL\s+YELLOW|(ON|AT)\s+YELLOW|CAUTION/i.test(text)) &&
        !/DOUBLE|TO|CHANGE/.test(text)) {
        return { code: 'C', confidence: 'MEDIUM' };
    }

    // Priority 5b: Aspect ABBREVIATIONS written as a letter instead of the word.
    //   G  -> A (Green)
    //   YY / DY / DBL Y -> B (Double Yellow)
    //   Y  -> C (Yellow)
    // Seen as "L 012 Y AWS ACT" (aspect before the keyword) and "AWS act on Y"
    // (aspect after it). The AWS/ACT/ON/AT keyword must sit next to the letter —
    // that is what stops a crew initial or a stray letter from reading as an
    // aspect. Aspect CHANGES ("G to Y") are already P/Q/R at Priority 4, so a
    // change description is excluded here.
    if (!/\bTO\b|CHANGE/.test(text)) {
        const KW = '(?:\\bAWS\\b|\\bACT(?:ED|ING)?\\b|\\bON\\b|\\bAT\\b)';
        const SEP = '[\\s.:@\\/\\-",]{0,4}';
        const ASPECTS = [
            ['(?:YY|D[\\s\\-\\/]?Y|DBL[\\s\\-]?Y)', 'B'],
            ['Y', 'C'],
            ['G', 'A'],
        ];
        for (const [aspect, code] of ASPECTS) {
            const beforeKw = new RegExp(`\\b${aspect}\\b${SEP}${KW}`);
            const afterKw  = new RegExp(`${KW}${SEP}\\b${aspect}\\b`);
            if (beforeKw.test(text) || afterKw.test(text)) {
                return { code, confidence: 'MEDIUM' };
            }
        }
    }

    // D - Additional magnet
    if (/ADD(ITIONAL|L)?[\s\.\-]*MAGNET/i.test(text)) {
        return { code: 'D', confidence: 'MEDIUM' };
    }

    // E - Without magnet/signal
    if (/WITHOUT[\s\-]*MAGNET|NO[\s\-]*MAGNET|W[\s\/]O[\s\-]*MAGNET|NO[\s\-]*SIG/i.test(text)) {
        return { code: 'E', confidence: 'MEDIUM' };
    }

    // Priority 6: Red aspect (usually shouldn't happen with AWS, but include for completeness)
    if (/RED[\s\-]*(ASPECT|SIGNAL|SIG)|DANGER/i.test(text)) {
        return { code: 'OTHER', confidence: 'LOW' };
    }

    // Last resort: a lone code letter ANCHORED to an AWS/ACT/AT/ON keyword, so a
    // stray letter inside a train/cab/unit number ("ER B 59", "D/CAB") is not
    // mistaken for a code. MEDIUM confidence — still surfaces for review.
    // keyword → code: "ACT @ E", "Act -A", "AWS ACT A ON", "at C"
    const kwThenCode = text.match(/(?:\bAWS\b|\bACT(?:ED|ING)?\b|\bAT\b|\bON\b|\bMAL(?:E?FACTION|FUNCTION)\b)[\s.:@\/\-",]{0,4}([ABCDEPQR])(?=$|[\s.,:@"'()\/\-])/);
    if (kwThenCode) {
        return { code: kwThenCode[1], confidence: 'MEDIUM' };
    }
    // code → keyword: "E - AWS Act", "C ,At KYN"
    const codeThenKw = text.match(/(?:^|[\s.,:@"'()\/\-])([ABCDEPQR])[\s.:@\/\-",]{0,4}(?:\bAT\b|\bON\b|\bAWS\b|\bACT)/);
    if (codeThenKw) {
        return { code: codeThenKw[1], confidence: 'MEDIUM' };
    }

    return { code: null, confidence: null };
}

// ── Helper: Extract location from detail text ─────────────────────────────
function extractLocation(detail) {
    if (!detail) return { raw: null, type: 'UNKNOWN' };

    let text = normalizeDetail(detail);

    // Pattern 0: "SIGNAL NO [station] S[number]" like "SIGNAL NO NEU S4"
    const signalNoMatch = text.match(/SIGNAL\s+NO\.?\s+([A-Z]{2,5})\s+S[\s\-]*(\d+[A-Z]?)\b/);
    if (signalNoMatch) {
        return { raw: `${signalNoMatch[1]} S ${signalNoMatch[2]}`, type: 'SIGNAL' };
    }

    // Pattern 0b: "SIGNAL NO [2 letters][4-5 digits]" like "Signal No NE6111" or "Signal No NE 6111"
    // With or without space between letters and digits
    const signalNo2LetterMatch = text.match(/SIGNAL\s+NO\.?\s+([A-Z]{2})\s*(\d{4,5})\b/);
    if (signalNo2LetterMatch) {
        return { raw: `${signalNo2LetterMatch[1]}${signalNo2LetterMatch[2]}`, type: 'SIGNAL' };
    }

    // Pattern 0c: "SIGNAL <station> <number>" with the S dropped —
    // "AWS ACT SIGNAL MNKD 20" means MNKD S-20. Station signals are named
    // "<STN> S-<n>", so the S is implied by the word SIGNAL plus a station code.
    // Bounded to 1-3 digits: a 4-5 digit number after two letters is an automatic
    // (NE6111), which Pattern 0b above already owns.
    const signalStationBare = text.match(/\bSIGNAL\s+(?:NO\.?\s*)?([A-Z]{2,5})[\s\-]+(\d{1,3}[A-Z]?)\b/);
    if (signalStationBare && !['NO', 'AT', 'ON', 'KM', 'PF'].includes(signalStationBare[1])) {
        return { raw: `${signalStationBare[1]} S ${signalStationBare[2]}`, type: 'SIGNAL' };
    }

    // Pattern 0c: "SIGNAL NO [letter] [2-5 digits]" like "Signal No K 48", "Signal No L 4810"
    // Single letter signal ID
    const signalNoLetterMatch = text.match(/SIGNAL\s+NO\.?\s+([A-Z])\s*(\d{2,5})\b/);
    if (signalNoLetterMatch) {
        return { raw: `${signalNoLetterMatch[1]}${signalNoLetterMatch[2]}`, type: 'SIGNAL' };
    }

    // Pattern 1d: Gate / level-crossing signal — "Gate No7 S1", "Gate No.12 S-2",
    // "LC 45 S1", "Gate LX-26 S-3", "Gate-26".
    // The gate may be written with an LX/LC prefix on its number, and the trailing
    // signal number is OPTIONAL: most gates ARE the signal (div_signals holds
    // "Gate-26"), and only a few carry a separate S-number row ("Gate-19 S-3").
    // Keep the S-number when the crew gave one — matchSignalFromDb tries
    // "GATE26S3" first and falls back to "GATE26" — so both kinds resolve.
    const gateSignalMatch = text.match(
        /\b(?:GATE|LC)[\s.\-]*(?:NO\.?|LX|LC)?[\s.\-]*(\d+)(?:[\s.\-]*S[\s\-]*(\d+[A-Z]?))?\b/i
    );
    if (gateSignalMatch) {
        const gateNo = gateSignalMatch[1];
        const sigNo = gateSignalMatch[2];
        return { raw: sigNo ? `Gate-${gateNo} S-${sigNo}` : `Gate-${gateNo}`, type: 'SIGNAL' };
    }

    // Pattern 1: Station + Signal format like "BY S 46", "NRL S-18", "KYN /S-78",
    // "ASO.S23", "ATG - S/13", "DW(S-7)"
    // Format: [2-5 letter station code] [sep] S [sep] [number]
    // The separator includes a HYPHEN and an OPENING BRACKET: without them
    // "ATG - S/13" and "SIGNAL NO.-DW(S-7)" fell through to the station-less
    // Pattern 1a and became a bare "S 13" / "S 7", which the matcher refuses
    // outright (every station has an S-13) — so the event landed in BOTH the
    // unmatched-signal list and UD, even though the crew HAD named the station.
    // Exclude common English words (2-3 letters only) that appear before signals
    // Note: Uses exact match so ASO, ATG, BEPR etc are NOT excluded
    const stationSignalMatch = text.match(/\b([A-Z]{2,5})[\s\.\/\-\(]+S[\s\-\.\/]*(\d+[A-Z]?)\b/);
    if (stationSignalMatch) {
        const station = stationSignalMatch[1];
        const sigNum = stationSignalMatch[2];
        // Only exclude very common English words that appear before "S [number]" in descriptions
        // Common English words AND CMS shorthand that precede "S NN" but are not
        // stations: AT = preposition "at", NO/NI = "No." (number). Treating them
        // as a station produced false matches (e.g. "at S-27" -> ATG S-27).
        // AWS/ACT/SIG/ON/IN joined the list with the hyphen separator above —
        // "AWS - S 22" must not read as a station called AWS.
        const excludedWords = ['OF', 'THE', 'AND', 'FOR', 'BUT', 'NOT', 'ALL', 'ONE', 'TWO', 'OUT', 'OUR',
                               'AT', 'NO', 'NI', 'ON', 'IN', 'AWS', 'ACT', 'SIG'];
        if (!excludedWords.includes(station)) {
            return { raw: `${station} S ${sigNum}`, type: 'SIGNAL' };
        }
        // If station word is excluded, keep it as a signal but let manual review confirm station context.
        return { raw: `S ${sigNum}`, type: 'SIGNAL' };
    }

    // Pattern 1a: Standalone "S-[number]" signal without station prefix (when no station word before)
    // Examples: "at S-22", "signal S 46" (no station code, needs CLI verification)
    const standaloneSignalMatch = text.match(/\bS[\s\-\/]*(\d+[A-Z]?)\b/);
    if (standaloneSignalMatch) {
        return { raw: `S ${standaloneSignalMatch[1]}`, type: 'SIGNAL' };
    }

    // Pattern 1a-IBS: Intermediate Block Signal distant — "KE UP IBS DISTANT",
    // "ASO IB DIST SIG", "OMB IBH DIST". Spelling varies (IB / IBS / IBH) and the
    // direction word may sit either side of it. div_signals names these
    // "<STN> IBS DIST" and holds a SEPARATE UP and DN copy under that one name,
    // so the direction is dropped from the location (it is not part of the signal
    // id) and recovered later by tripDirection() as a match tie-breaker.
    const ibsMatch = text.match(
        /\b([A-Z]{2,5})\s+(?:(?:UP|DN|DOWN)\s+)?IB[SH]?\s+(?:(?:UP|DN|DOWN)\s+)?DIST(?:ANT)?\b/
    );
    if (ibsMatch && !['UP', 'DN', 'DOWN'].includes(ibsMatch[1])) {
        return { raw: `${ibsMatch[1]} IBS DIST`, type: 'SIGNAL' };
    }

    // Pattern 1b: Station + Signal Type like "ASO STR SIG", "CLA HOME SIG",
    // "BY DIST SIG", "KE UP DISTANT SIGNAL". An optional UP/DN direction word may
    // sit between the station and the type — it must NOT be captured as the
    // station (that bug turned "KE UP DISTANT" into a station-less "UP DISTANT").
    const stationSigTypeMatch = text.match(/\b([A-Z]{2,5})\s+(?:(?:UP|DN|DOWN)\s+)?(STR|STRTR|STARTER|HOME|DIST|DISTANT|ADV|ADVANCED)\s*SIG/);
    if (stationSigTypeMatch) {
        const station = stationSigTypeMatch[1];
        const sigType = stationSigTypeMatch[2];
        if (!['UP', 'DN', 'DOWN'].includes(station)) {
            return { raw: `${station} ${sigType} SIG`, type: 'SIGNAL' };
        }
        // Station-less (e.g. "UP DISTANT SIG" with no station anywhere) — keep
        // generic; the CLI must identify the station.
        return { raw: `${sigType} SIG`, type: 'SIGNAL' };
    }

    // Pattern 1c: Station + Shunt signal like "KJT SH 22", "CLA SH-5"
    const shuntSignalMatch = text.match(/\b([A-Z]{2,5})\s+SH[\s\-]*(\d+[A-Z]?)\b/);
    if (shuntSignalMatch) {
        const station = shuntSignalMatch[1];
        const sigNum = shuntSignalMatch[2];
        return { raw: `${station} SH ${sigNum}`, type: 'SIGNAL' };
    }

    // Pattern 2: Letter + separator + digits, with an optional sub-block letter
    // like "L 4810", "K 48", "H-53", "H/4406", "K 24A", "K 024A" (K-series
    // automatics have A/B suffixes). The trailing [A-Z]? mirrors Pattern 2b (the
    // no-space form). The separator takes a SLASH — crew write "H/4406" as often
    // as "H-4406" — but NOT a dot: "Cab n. 7070" would then read as signal N-7070.
    // A single letter at a word boundary is required, so a chainage ("9/340") or a
    // unit number ("No. 7051") can never reach this.
    const letterSpaceDigits = text.match(/\b([A-Z])[\s\-\/]+(\d{2,5}[A-Z]?)\b/);
    if (letterSpaceDigits) {
        return { raw: letterSpaceDigits[1] + letterSpaceDigits[2], type: 'SIGNAL' };
    }

    // Pattern 2b: Alphanumeric signal IDs like "H38", "H2212", "T1234" (1 letter + 2-5 digits)
    const alphaNumSignal = text.match(/\b([A-Z]\d{2,5}[A-Z]?)\b/);
    if (alphaNumSignal) {
        return { raw: alphaNumSignal[1], type: 'SIGNAL' };
    }

    // Pattern 2c: Two-letter prefix + optional separator + digits: "NE6111",
    // "NE 5918", "SE-7306" (NE/SE/KE… automatic signals). Skip 2-letter words
    // that are prepositions, not signal prefixes.
    const twoLetterAlphaNum = text.match(/\b([A-Z]{2})[\s\-]?(\d{3,5})\b/);
    if (twoLetterAlphaNum && !['AT','ON','NO','NI','IN','TO','OF','IS','AS','OR','BE'].includes(twoLetterAlphaNum[1])) {
        return { raw: twoLetterAlphaNum[1] + twoLetterAlphaNum[2], type: 'SIGNAL' };
    }

    // Pattern 2d: Two letters + space + digits/digits like "NE 54/26", "SE 12/5" (OHE KM marker)
    // Format: Line code (NE/SE/etc) + KM chainage - used for D type (Additional Magnet) locations
    // Skip 2-letter prepositions ("D at 9/340" -> the "AT" must not read as a line code;
    // it falls through to the bare-chainage Pattern 4b below which returns "9/340").
    // The separator may be a hyphen, or a space AND a hyphen ("Km -9/239").
    const twoLetterChainage = text.match(/\b([A-Z]{2})[\s\-]+(\d+\/\d+)\b/);
    if (twoLetterChainage && !['AT','ON','NO','NI','IN','TO','OF','IS','AS','OR','BE'].includes(twoLetterChainage[1])) {
        return { raw: `${twoLetterChainage[1]} ${twoLetterChainage[2]}`, type: 'KM' };
    }

    // Pattern 3: Two letters + hyphen + number like "SE-8205", "NE-6111"
    const twoLetterHyphenSignal = text.match(/\b([A-Z]{2})-(\d{3,5})\b/);
    if (twoLetterHyphenSignal) {
        return { raw: `${twoLetterHyphenSignal[1]} ${twoLetterHyphenSignal[2]}`, type: 'SIGNAL' };
    }

    // Pattern 3b: Single letter + hyphen + number (H-16, S-18, T-5)
    // Must have hyphen to avoid matching random letters
    const hyphenSignal = text.match(/\b([A-Z])-(\d+[A-Z]?)\b/);
    if (hyphenSignal) {
        return { raw: `${hyphenSignal[1]}-${hyphenSignal[2]}`, type: 'SIGNAL' };
    }

    // Pattern 4: KM patterns like "KM 55", "KM 123/4", "Km 76/18", "Km.No.24/324"
    // Handles: KM, KM., KM.NO, KM.NO., KM NO etc.
    const kmMatch = text.match(/\bKM\.?\s*(?:NO\.?)?[\s\-.:]*(\d+(?:[\s\/]\d+)?)\b/i);
    if (kmMatch) {
        return { raw: kmMatch[1], type: 'KM' };
    }

    // Pattern 4b: Standalone chainage like "18/211", "24/324" (digits/digits without prefix)
    // Usually appears after "at" - for additional magnet locations
    const chainageMatch = text.match(/\bAT\s+(\d+\/\d+)\b/i);
    if (chainageMatch) {
        return { raw: chainageMatch[1], type: 'KM' };
    }

    // Pattern 5: Platform patterns like "PF-5", "PF 3"
    const pfMatch = text.match(/\bPF[\s\-]*(\d+[A-Z]?)\b/i);
    if (pfMatch) {
        return { raw: `PF ${pfMatch[1]}`, type: 'PLATFORM' };
    }

    // Pattern 6: Station codes after "AT" (fallback). KM/PF are units, not
    // stations — without this guard "at KM-9/239" returned the location "KM".
    const stnMatch = text.match(/\bAT[\s\-]+([A-Z]{2,5})\b/);
    if (stnMatch && !['KM', 'PF', 'CAT', 'TYPE', 'SIG'].includes(stnMatch[1])) {
        return { raw: stnMatch[1], type: 'SECTION' };
    }

    return { raw: null, type: 'UNKNOWN' };
}

// ── Helper: bare automatic-signal number (no NE/SE prefix) ─────────────────
// Some details give only the number of an inter-station automatic signal:
// "AWS act at B at 5602". The NE/SE prefix is missing, so extractLocation can't
// resolve it (5602 alone is ambiguous and could be a train number). This pulls
// the number ONLY when introduced by a location cue (AT / @ / NEAR / SIGNAL NO).
// It is used purely as a LAST RESORT — caller must validate it against the
// train's route (resolveBareAutoSignal); an un-routable number is left alone.
function extractBareAutoNumber(detail) {
    const text = String(detail || '').toUpperCase();
    // number must follow a location preposition/cue and be a 3-5 digit run.
    const m = text.match(/(?:@|\bAT\b|\bNEAR\b|\bSIG(?:NAL)?\b|\bNO\.?\b)[\s.:#\-]*(\d{3,5})\b/);
    return m ? m[1] : null;
}

// ── POST /parse ───────────────────────────────────────────────────────────
// Parse raw AWS candidates and create events
router.post('/parse', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const pool = req.app.locals.pool;
        const userId = req.session.user.id || null;

        // Get all unparsed AWS candidates
        const [rawRows] = await pool.query(
            `SELECT r.* FROM div_aws_cms_raw r
             LEFT JOIN div_aws_events e ON e.raw_id = r.id
             WHERE r.is_aws_candidate = 1 AND e.id IS NULL
             ORDER BY r.abn_date DESC, r.id`
        );

        console.log(`[AWS Parse] Found ${rawRows.length} unparsed AWS candidates`);

        let parsed = 0, needsReview = 0, errors = 0;

        for (const raw of rawRows) {
            try {
                // One CMS row -> 1..N events (multi-act details are split).
                const r = await insertEventsForRaw(pool, raw, userId);
                parsed += r.inserted;
                needsReview += r.needsReview;
            } catch (err) {
                if (err.code !== 'ER_DUP_ENTRY') {
                    console.error(`[AWS Parse] Error parsing ${raw.abn_id}:`, err.message);
                    errors++;
                }
            }
        }

        console.log(`[AWS Parse] Completed: ${parsed} parsed, ${needsReview} need review, ${errors} errors`);

        res.json({
            success: true,
            total_candidates: rawRows.length,
            parsed,
            needs_review: needsReview,
            errors,
        });
    } catch (err) {
        console.error('[AWS /parse] Error:', err);
        res.status(500).json({ error: 'Parse failed' });
    }
});

// ── GET /events ───────────────────────────────────────────────────────────
// Get parsed events with optional filters
router.get('/events', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const needsReview = req.query.needs_review === 'true';
        const awsCode = req.query.aws_code || null;
        const statusFilter = req.query.status || null;   // e.g. 'DISMISSED' for the Dismissed view
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const offset = parseInt(req.query.offset, 10) || 0;

        let where = '1=1';
        const params = [];

        if (statusFilter === 'DISMISSED') {
            where += " AND e.status = 'DISMISSED'";
        } else {
            // Pending and All views never show dismissed (not-AWS) events.
            where += " AND e.status <> 'DISMISSED'";
            if (needsReview) {
                where += ' AND e.needs_manual_review = 1';
            }
        }
        if (awsCode) {
            where += ' AND e.aws_code = ?';
            params.push(awsCode);
        }

        // Get count
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM div_aws_events e WHERE ${where}`,
            params
        );

        // Get events with raw detail.
        // act_count: how many events this ONE CMS row was split into. A split card
        // otherwise shows the same abn_id and the same full detail text as its
        // sibling, with nothing to say which act it is.
        // signal_number: whether this event is actually matched to a signal — the
        // card must show that, since a hand-typed location leaves it unmatched.
        const [events] = await pool.query(
            `SELECT e.*, r.detail, r.from_station, r.to_station, r.abn_type,
                    s.signal_number, s.section AS signal_section, s.direction AS signal_direction,
                    (SELECT COUNT(*) FROM div_aws_events x WHERE x.raw_id = e.raw_id) AS act_count
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             LEFT JOIN div_signals s ON s.id = e.signal_id
             WHERE ${where}
             ORDER BY e.abn_date DESC, e.id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({ total, limit, offset, events });
    } catch (err) {
        console.error('[AWS /events] Error:', err);
        res.status(500).json({ error: 'Failed to load events' });
    }
});

// ── GET /events/:id ───────────────────────────────────────────────────────
// Get single event with full details
router.get('/events/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const eventId = parseInt(req.params.id, 10);

        const [[event]] = await pool.query(
            `SELECT e.*, r.detail, r.from_station, r.to_station, r.abn_type,
                    r.report_station, r.closing_remarks
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE e.id = ?`,
            [eventId]
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ event });
    } catch (err) {
        console.error('[AWS /events/:id] Error:', err);
        res.status(500).json({ error: 'Failed to load event' });
    }
});

// ── PATCH /events/:id ─────────────────────────────────────────────────────
// Update event (for manual review)
router.patch('/events/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const pool = req.app.locals.pool;
        const eventId = parseInt(req.params.id, 10);
        const b = req.body || {};

        // Allowed fields to update
        const updates = [];
        const params = [];

        if (b.aws_code !== undefined) {
            const validCodes = ['A', 'B', 'C', 'D', 'E', 'AUX', 'P', 'Q', 'R', 'OTHER'];
            if (!validCodes.includes(b.aws_code)) {
                return res.status(400).json({ error: 'Invalid aws_code' });
            }
            updates.push('aws_code = ?');
            params.push(b.aws_code);
        }

        let locationParamIdx = -1;   // so a successful match can canonicalise it below
        let unresolvedSignal = false; // typed a signal name that matches nothing -> keep in review
        if (b.location_raw !== undefined) {
            updates.push('location_raw = ?');
            locationParamIdx = params.length;
            params.push(b.location_raw || null);
        }

        if (b.location_type !== undefined) {
            updates.push('location_type = ?');
            params.push(b.location_type || 'UNKNOWN');
        }

        if (b.responsibility !== undefined) {
            updates.push('responsibility = ?');
            params.push(b.responsibility || 'NOT_DETERMINED');
        }

        if (b.root_cause !== undefined) {
            updates.push('root_cause = ?');
            params.push(b.root_cause || null);
        }

        if (b.analysis_text !== undefined) {
            updates.push('analysis_text = ?');
            params.push(b.analysis_text || null);
        }

        if (b.status !== undefined) {
            updates.push('status = ?');
            params.push(b.status);
            if (b.status === 'DISMISSED') {
                // Soft-remove (not an AWS event). Keep needs_manual_review = 1 so the
                // report aggregations (which require = 0) never count it; Review/UD
                // lists drop it by status. Reversible via status = 'PENDING'.
                updates.push('needs_manual_review = 1');
            } else if (b.status === 'PENDING') {
                // Restore: recompute the review flag from the current code + location.
                const [[cur]] = await pool.query(
                    'SELECT aws_code, location_raw FROM div_aws_events WHERE id = ?', [eventId]
                );
                updates.push('needs_manual_review = ?');
                params.push(cur && cur.aws_code && cur.location_raw ? 0 : 1);
            }
        }

        if (b.signal_id !== undefined) {
            updates.push('signal_id = ?');
            params.push(b.signal_id || null);
            if (b.signal_id) {
                updates.push("signal_match_confidence = 'HIGH'");
            }
        } else if (b.location_raw !== undefined) {
            // The CLI typed a location instead of picking a signal. Run it through
            // the same matcher the import uses (route + direction aware) and record
            // the result. Without this the event left review with signal_id still
            // NULL — it looked reviewed, but was unmatched: it reappeared in the
            // unmatched-signal list and counted in the reports against no signal.
            // A typo simply fails to match, which is the point: it stays visible.
            const [[ctx]] = await pool.query(
                `SELECT e.train_number, r.from_station, r.to_station, r.detail
                   FROM div_aws_events e
                   LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
                  WHERE e.id = ?`,
                [eventId]
            );
            const sections  = ctx ? await routeSectionsForEvent(pool, ctx.from_station, ctx.to_station, ctx.train_number) : [];
            const direction = ctx ? await directionForEvent(pool, ctx) : null;
            const sm = await matchSignalFromDb(pool, b.location_raw, { sections, direction });

            updates.push('signal_id = ?');
            params.push(sm.signal_id || null);
            updates.push('signal_match_confidence = ?');
            params.push(sm.confidence || null);
            updates.push('normalized_location = ?');
            params.push(normalizeForSignalMatch(b.location_raw) || null);

            // Keep location_type in step with what was actually typed — a free-text
            // edit used to leave the parse-time type behind.
            const typedType = b.location_raw ? extractLocation(b.location_raw).type : 'UNKNOWN';
            if (b.location_type === undefined) {
                updates.push('location_type = ?');
                params.push(typedType);
            }
            // A typed location that LOOKS like a signal but matches nothing in
            // div_signals is almost always a typo. It must stay in review rather
            // than leave it "reviewed" but unmatched.
            unresolvedSignal = !sm.signal_id && typedType === 'SIGNAL';
            // Canonicalise to the matched signal's name, as the import does, so
            // "SE5602" and "SE-5602" aggregate together in the reports.
            if (sm.signal_id && locationParamIdx !== -1) {
                params[locationParamIdx] = sm.signal_number;
            }
        }

        // Review is complete only when the code and the location are present AND
        // the location actually resolved — a signal name that matches nothing in
        // div_signals is a typo, and must not leave review looking reviewed.
        if (b.aws_code !== undefined || b.location_raw !== undefined) {
            const [[currentEvent]] = await pool.query(
                'SELECT aws_code, location_raw FROM div_aws_events WHERE id = ?',
                [eventId]
            );
            const nextCode = b.aws_code !== undefined ? b.aws_code : currentEvent?.aws_code;
            const nextLocation = b.location_raw !== undefined ? b.location_raw : currentEvent?.location_raw;
            updates.push('needs_manual_review = ?');
            params.push(nextCode && nextLocation && !unresolvedSignal ? 0 : 1);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(eventId);

        await pool.query(
            `UPDATE div_aws_events SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Return updated event
        const [[event]] = await pool.query(
            'SELECT * FROM div_aws_events WHERE id = ?',
            [eventId]
        );

        res.json({ success: true, event });
    } catch (err) {
        console.error('[AWS PATCH /events/:id] Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
});

// ── GET /review/pending ───────────────────────────────────────────────────
// Get count of events needing review
router.get('/review/pending', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        const [[{ count }]] = await pool.query(
            "SELECT COUNT(*) AS count FROM div_aws_events WHERE needs_manual_review = 1 AND status <> 'DISMISSED'"
        );

        // Get breakdown by issue type
        const [breakdown] = await pool.query(
            `SELECT
                SUM(CASE WHEN aws_code IS NULL THEN 1 ELSE 0 END) AS no_code,
                SUM(CASE WHEN location_raw IS NULL THEN 1 ELSE 0 END) AS no_location
             FROM div_aws_events
             WHERE needs_manual_review = 1 AND status <> 'DISMISSED'`
        );

        res.json({
            pending_count: count,
            no_code: breakdown[0]?.no_code || 0,
            no_location: breakdown[0]?.no_location || 0,
        });
    } catch (err) {
        console.error('[AWS /review/pending] Error:', err);
        res.status(500).json({ error: 'Failed to load pending count' });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 7: AWS Report Data API
// ══════════════════════════════════════════════════════════════════════════

// ── GET /report-data ───────────────────────────────────────────────────────
// Get aggregated report data for a date range
router.get('/report-data', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const fromDate = req.query.from || null;
        const toDate = req.query.to || null;

        // Build date filter
        let dateFilter = '';
        const dateParams = [];
        if (fromDate && toDate) {
            dateFilter = 'AND e.abn_date BETWEEN ? AND ?';
            dateParams.push(fromDate, toDate);
        } else if (fromDate) {
            dateFilter = 'AND e.abn_date >= ?';
            dateParams.push(fromDate);
        } else if (toDate) {
            dateFilter = 'AND e.abn_date <= ?';
            dateParams.push(toDate);
        }

        // 1. Type-wise counts
        // S&T = has identified signal/location (location_type IN SIGNAL, KM, PLATFORM, SECTION)
        // CAB = no location identified but has loco_raw (cab-side defect)
        // Transient = location_type is UNKNOWN or neither condition met
        const [typeCounts] = await pool.query(
            // Classification follows the JPO rules stored in `responsibility`
            // (S&T = track magnet, CAB_SIDE = cab defect, TRANSIENT/unclassified
            // = transient). Run /classify-period to populate it.
            `SELECT
                aws_code,
                COUNT(*) AS total,
                SUM(responsibility = 'S&T') AS st_count,
                SUM(responsibility = 'CAB_SIDE') AS cab_count,
                SUM(responsibility = 'TRANSIENT' OR responsibility = 'NOT_DETERMINED' OR responsibility IS NULL) AS transient_count
             FROM div_aws_events e
             WHERE aws_code IS NOT NULL AND e.needs_manual_review = 0 ${dateFilter}
             GROUP BY aws_code
             ORDER BY FIELD(aws_code, 'A','B','C','D','E','P','Q','R','AUX','OTHER')`,
            dateParams
        );

        // 2. Summary stats
        const [[summary]] = await pool.query(
            `SELECT
                COUNT(*) AS total_events,
                SUM(responsibility = 'S&T') AS st_count,
                SUM(responsibility = 'CAB_SIDE') AS cab_count,
                SUM(responsibility = 'TRANSIENT' OR responsibility = 'NOT_DETERMINED' OR responsibility IS NULL) AS transient_count
             FROM div_aws_events e
             WHERE e.needs_manual_review = 0 ${dateFilter}`,
            dateParams
        );

        // 3. Repeated S&T defects - signals/locations with > 1 occurrence
        const [repeatedSignals] = await pool.query(
            `SELECT
                location_raw,
                location_type,
                COUNT(*) AS braking_count,
                GROUP_CONCAT(DISTINCT aws_code ORDER BY aws_code) AS codes,
                GROUP_CONCAT(DISTINCT DATE_FORMAT(e.abn_date, '%d-%m') ORDER BY e.abn_date) AS dates,
                GROUP_CONCAT(e.id ORDER BY e.abn_date) AS event_ids,
                MAX(e.abn_date) AS last_date
             FROM div_aws_events e
             WHERE e.responsibility = 'S&T' AND e.needs_manual_review = 0
               AND location_raw IS NOT NULL AND location_raw != '' ${dateFilter}
             GROUP BY location_raw, location_type
             HAVING COUNT(*) > 1
             ORDER BY braking_count DESC
             LIMIT 50`,
            dateParams
        );

        // 4. Repeated EMU/Cab defects - cabs with > 1 occurrence, joined with rake info
        const [repeatedCabs] = await pool.query(
            `SELECT
                e.loco_raw AS cab_number,
                COUNT(*) AS braking_count,
                GROUP_CONCAT(DISTINCT e.aws_code ORDER BY e.aws_code) AS codes,
                GROUP_CONCAT(DISTINCT DATE_FORMAT(e.abn_date, '%d-%m') ORDER BY e.abn_date) AS dates,
                GROUP_CONCAT(e.id ORDER BY e.abn_date) AS event_ids,
                MAX(e.abn_date) AS last_date,
                MAX(f.unit_no) AS unit_no,
                MAX(f.shed_code) AS shed_code
             FROM div_aws_events e
             LEFT JOIN rake_coaches c ON c.coach_number = CONCAT(e.loco_raw, 'C')
             LEFT JOIN rake_formations f ON f.id = c.rake_id
             WHERE e.responsibility = 'CAB_SIDE' AND e.needs_manual_review = 0
               AND e.loco_raw IS NOT NULL AND e.loco_raw != '' ${dateFilter}
             GROUP BY e.loco_raw
             HAVING COUNT(*) > 1
             ORDER BY braking_count DESC
             LIMIT 50`,
            dateParams
        );

        // 5. Transient/unverified cases (for detail table)
        const [transientCases] = await pool.query(
            `SELECT
                e.id,
                e.abn_date,
                e.train_number,
                e.loco_raw,
                e.aws_code,
                e.location_raw,
                e.crew_id,
                e.crew_name,
                e.analysis_text,
                r.from_station,
                r.to_station,
                r.detail
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE (e.responsibility = 'TRANSIENT'
                 OR e.responsibility = 'NOT_DETERMINED'
                 OR e.responsibility IS NULL)
               AND e.needs_manual_review = 0
               ${dateFilter}
             ORDER BY e.abn_date DESC, e.id DESC
             LIMIT 100`,
            dateParams
        );

        // 5b. UD (un-determined) cases — events the auto-rules couldn't settle and
        // that need a human decision: flagged for manual review, an unmatched
        // signal location, or still NOT_DETERMINED. Seeds the UD worksheet so the
        // CLI starts from a real list (rows stay editable; +Add Row still works).
        const [udCases] = await pool.query(
            `SELECT
                e.id, e.abn_date, e.train_number, e.loco_raw, e.aws_code,
                e.location_raw, e.location_type, e.analysis_text,
                e.responsibility, e.needs_manual_review,
                e.signal_match_confidence, e.signal_id,
                r.from_station, r.to_station
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE (
                e.needs_manual_review = 1
                OR e.responsibility = 'NOT_DETERMINED' OR e.responsibility IS NULL
                OR (e.signal_id IS NULL AND e.location_type = 'SIGNAL')
             )
               AND e.status <> 'DISMISSED'
               ${dateFilter}
             ORDER BY e.abn_date DESC, e.id DESC
             LIMIT 100`,
            dateParams
        );

        // 6. Section-wise breakdown using div_sub_sections master
        const [sectionWise] = await pool.query(
            `WITH event_section AS (
                SELECT
                    e.id as event_id,
                    s.section_code,
                    s.section_name,
                    s.line_type,
                    e.location_type,
                    e.loco_raw,
                    e.aws_code,
                    e.responsibility,
                    ROW_NUMBER() OVER (
                        PARTITION BY e.id
                        ORDER BY FIELD(s.line_type, 'HARBOUR', 'TRANS_HB', 'LOCAL', 'FAST', 'NE', 'SE', 'WESTERN', 'PORT', 'OTHER')
                    ) as rn
                FROM div_aws_events e
                JOIN div_aws_cms_raw r ON r.id = e.raw_id
                JOIN div_sub_section_stations ss1 ON ss1.station_code = r.from_station
                JOIN div_sub_section_stations ss2 ON ss2.station_code = r.to_station AND ss2.section_code = ss1.section_code
                JOIN div_sub_sections s ON s.section_code = ss1.section_code
                WHERE r.from_station IS NOT NULL
                  AND ss1.seq_order < ss2.seq_order
                  AND e.needs_manual_review = 0
                  ${dateFilter.replace(/e\./g, 'e.')}
            )
            SELECT
                section_code,
                section_name,
                line_type,
                COUNT(*) as braking_count,
                SUM(responsibility = 'S&T') AS st_count,
                SUM(responsibility = 'CAB_SIDE') AS cab_count,
                GROUP_CONCAT(DISTINCT aws_code ORDER BY aws_code) AS codes,
                GROUP_CONCAT(event_id ORDER BY event_id) AS event_ids
            FROM event_section
            WHERE rn = 1
            GROUP BY section_code, section_name, line_type
            ORDER BY
                FIELD(line_type, 'HARBOUR', 'TRANS_HB', 'LOCAL', 'FAST', 'NE', 'SE', 'WESTERN', 'PORT', 'OTHER'),
                braking_count DESC`,
            dateParams
        );

        // 7. Persistent / chronic magnets — signals flagged S&T in >=2 distinct
        // Fri–Thu review weeks within the range. A magnet failing week after week
        // is more urgent than a one-week spike, so it gets its own highlight.
        const friWk = `DATE_SUB(e.abn_date, INTERVAL ((DAYOFWEEK(e.abn_date) + 1) % 7) DAY)`;
        const [persistentMagnets] = await pool.query(
            `SELECT s.signal_number, s.line, s.section,
                    COUNT(*) AS total_acts,
                    COUNT(DISTINCT ${friWk}) AS weeks_count,
                    GROUP_CONCAT(DISTINCT DATE_FORMAT(${friWk}, '%d-%m') ORDER BY ${friWk}) AS weeks,
                    MAX(e.abn_date) AS last_date
             FROM div_aws_events e
             JOIN div_signals s ON s.id = e.signal_id
             WHERE e.responsibility = 'S&T' AND e.needs_manual_review = 0 ${dateFilter}
             GROUP BY s.signal_number, s.line, s.section
             HAVING COUNT(DISTINCT ${friWk}) >= 2
             ORDER BY weeks_count DESC, total_acts DESC`,
            dateParams
        );

        // 8. Potential duplicates (soft) — same crew + date + loco + AWS code but
        // a DIFFERENT time within 15 min. The exact-minute case is auto-deduped on
        // import; these near-misses are surfaced for the CLI to judge, NOT removed
        // (could be a re-log, or two genuine acts minutes apart on a run).
        const dupFilterA = dateFilter.replace(/\be\./g, 'a.');
        const [potentialDuplicates] = await pool.query(
            `SELECT a.id AS id1, b.id AS id2, a.crew_id, a.crew_name, a.abn_date,
                    a.loco_raw, a.aws_code,
                    TIME_FORMAT(a.abn_time, '%H:%i') AS time1,
                    TIME_FORMAT(b.abn_time, '%H:%i') AS time2,
                    a.location_raw AS loc1, b.location_raw AS loc2
             FROM div_aws_events a
             JOIN div_aws_events b
               ON a.crew_id = b.crew_id AND a.abn_date = b.abn_date
              AND a.loco_raw = b.loco_raw AND a.aws_code <=> b.aws_code
              AND a.id < b.id AND a.abn_time <> b.abn_time
              AND ABS(TIME_TO_SEC(a.abn_time) - TIME_TO_SEC(b.abn_time)) BETWEEN 1 AND 900
             WHERE a.crew_id IS NOT NULL AND a.crew_id <> ''
               AND a.loco_raw IS NOT NULL AND a.loco_raw <> ''
               AND a.needs_manual_review = 0 AND b.needs_manual_review = 0 ${dupFilterA}
             ORDER BY a.abn_date DESC, a.abn_time`,
            dateParams
        );

        // 9. Date range info
        const [[dateRange]] = await pool.query(
            `SELECT MIN(abn_date) AS min_date, MAX(abn_date) AS max_date
             FROM div_aws_events`
        );

        res.json({
            date_filter: { from: fromDate, to: toDate },
            available_range: dateRange,
            summary: {
                total_events: summary?.total_events || 0,
                st_count: summary?.st_count || 0,
                cab_count: summary?.cab_count || 0,
                transient_count: summary?.transient_count || 0,
            },
            type_counts: typeCounts,
            repeated_signals: repeatedSignals,
            repeated_cabs: repeatedCabs,
            transient_cases: transientCases,
            ud_cases: udCases,
            section_wise: sectionWise,
            persistent_magnets: persistentMagnets,
            potential_duplicates: potentialDuplicates,
        });
    } catch (err) {
        console.error('[AWS /report-data] Error:', err);
        res.status(500).json({ error: 'Failed to load report data' });
    }
});

// ── GET /chronic-cases ─────────────────────────────────────────────────────
// Chronic low-frequency repeaters — the JPO blind spot.
//
// Every JPO threshold measures a PEAK inside one window:
//   Rule 1  >=3 acts in a trip      Rule 2  >2/day on a signal
//   Rule 3a >3/week on a cab        Rule 3b >=3/week on a magnet
// A magnet or cab acting once or twice a week, week after week, clears all of
// them and is written off as "Rule 4: transient" forever. So look at the SPREAD
// instead: bucket the acts into Fri–Thu review weeks and surface anything seen
// in >= minWeeks distinct weeks that a rule NEVER caught (st_acts = 0 /
// cab_acts = 0). Whatever a rule DID catch is deliberately excluded — it is
// already in repeated_signals / persistent_magnets / repeated_cabs, so the
// lists never overlap.
//
// This carries its OWN date range, separate from the report period above it:
// the report defaults to the current week, and a chronic pattern by definition
// needs months to show. Sharing that range would silently return nothing.
// With no from/to it spans all data.
//
// Cabs are NOT folded into their rake. Each driving cab carries its own AWS
// equipment, so 2265 and 2266 of one unit are two separate cases.
router.get('/chronic-cases', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const fromDate = req.query.from || null;
        const toDate = req.query.to || null;

        let dateFilter = '';
        const dateParams = [];
        if (fromDate && toDate) {
            dateFilter = 'AND e.abn_date BETWEEN ? AND ?';
            dateParams.push(fromDate, toDate);
        } else if (fromDate) {
            dateFilter = 'AND e.abn_date >= ?';
            dateParams.push(fromDate);
        } else if (toDate) {
            dateFilter = 'AND e.abn_date <= ?';
            dateParams.push(toDate);
        }

        const minWeeks = Math.max(2, parseInt(req.query.min_weeks, 10) || 2);
        const minActs  = Math.max(2, parseInt(req.query.min_acts,  10) || 2);
        const friWk = `DATE_SUB(e.abn_date, INTERVAL ((DAYOFWEEK(e.abn_date) + 1) % 7) DAY)`;

        // Signals keyed by magnet_id so the per-section copies of one physical
        // magnet count as one. The +1000000 offset keeps the fallback signal ids
        // (158 signals carry no magnet_id) from colliding with real magnet ids.
        const [signals] = await pool.query(
            `WITH acts AS (
                SELECT COALESCE(s.magnet_id, s.id + 1000000) AS magnet_key,
                       s.signal_number, s.section, s.line,
                       e.id, e.abn_date, e.aws_code, e.responsibility, e.loco_raw,
                       ${friWk} AS wk
                  FROM div_aws_events e
                  JOIN div_signals s ON s.id = e.signal_id
                 WHERE e.needs_manual_review = 0 ${dateFilter}
             )
             SELECT MIN(signal_number) AS signal_number,
                    GROUP_CONCAT(DISTINCT section ORDER BY section) AS sections,
                    COUNT(*) AS total_acts,
                    -- The mirror of the cab cross-check: many different cabs
                    -- tripping one magnet points at the magnet; the same cab
                    -- every time points at that cab.
                    COUNT(DISTINCT loco_raw) AS distinct_cabs,
                    COUNT(DISTINCT wk) AS weeks_count,
                    ROUND(COUNT(*) / COUNT(DISTINCT wk), 1) AS acts_per_week,
                    GROUP_CONCAT(DISTINCT DATE_FORMAT(wk, '%d-%m') ORDER BY wk) AS weeks,
                    GROUP_CONCAT(DISTINCT aws_code ORDER BY aws_code) AS codes,
                    GROUP_CONCAT(id ORDER BY abn_date) AS event_ids,
                    MAX(abn_date) AS last_date
               FROM acts
              GROUP BY magnet_key
             HAVING COUNT(DISTINCT wk) >= ? AND COUNT(*) >= ?
                AND SUM(responsibility = 'S&T') = 0
              ORDER BY weeks_count DESC, total_acts DESC
              LIMIT 50`,
            [...dateParams, minWeeks, minActs]
        );

        const [cabs] = await pool.query(
            `WITH acts AS (
                SELECT e.loco_raw, e.id, e.abn_date, e.aws_code, e.responsibility,
                       e.matched_rake_id, ${friWk} AS wk
                  FROM div_aws_events e
                 WHERE e.needs_manual_review = 0
                   AND e.loco_raw IS NOT NULL AND e.loco_raw <> '' ${dateFilter}
             )
             SELECT a.loco_raw AS cab_number,
                    COUNT(*) AS total_acts,
                    COUNT(DISTINCT a.wk) AS weeks_count,
                    ROUND(COUNT(*) / COUNT(DISTINCT a.wk), 1) AS acts_per_week,
                    GROUP_CONCAT(DISTINCT DATE_FORMAT(a.wk, '%d-%m') ORDER BY a.wk) AS weeks,
                    GROUP_CONCAT(DISTINCT a.aws_code ORDER BY a.aws_code) AS codes,
                    GROUP_CONCAT(a.id ORDER BY a.abn_date) AS event_ids,
                    MAX(a.abn_date) AS last_date,
                    MAX(f.unit_no) AS unit_no,
                    MAX(f.shed_code) AS shed_code
               FROM acts a
               LEFT JOIN rake_formations f ON f.id = a.matched_rake_id
              GROUP BY a.loco_raw
             HAVING COUNT(DISTINCT a.wk) >= ? AND COUNT(*) >= ?
                AND SUM(a.responsibility = 'CAB_SIDE') = 0
              ORDER BY weeks_count DESC, total_acts DESC
              LIMIT 50`,
            [...dateParams, minWeeks, minActs]
        );

        // So the page can default its range to the data that actually exists,
        // instead of a window the operator has to discover is empty.
        const [[range]] = await pool.query(
            `SELECT MIN(abn_date) AS min_date, MAX(abn_date) AS max_date
               FROM div_aws_events WHERE needs_manual_review = 0`
        );

        res.json({
            signals,
            cabs,
            thresholds: { min_weeks: minWeeks, min_acts: minActs },
            date_filter: { from: fromDate, to: toDate },
            available_range: range,
        });
    } catch (err) {
        console.error('[AWS /chronic-cases] Error:', err);
        res.status(500).json({ error: 'Failed to load chronic cases' });
    }
});

// ── GET /recurrence-report ─────────────────────────────────────────────────
// The officer's management summary of recurring AWS defects over a fixed
// trailing window (14 / 30 / 90 days). Unlike /chronic-cases (which HIDES
// anything a JPO rule already caught, to surface the blind spot), this report
// INCLUDES every recurring magnet/cab — the officer wants the full picture.
//
// Why 14 and not 7: the JPO weekly rules (3a >3/week on a cab, 3b >=3/week on a
// magnet) evaluate a 7-DAY window. A calendar-week report can split a
// qualifying run across two reports (e.g. Thu-Sat in one, Sun-Mon in the next)
// so neither shows the rule tripping. A 14-day window guarantees any real
// 7-consecutive-day run of acts lands fully inside one report. The headline
// metric is therefore peak_7day: the MAX acts inside any trailing-6-day sub-
// window (MySQL 8 temporal RANGE frame), which is exactly what 3a/3b measure —
// so "did this ever hit 3-in-a-week" is answered regardless of calendar edges.
//
// The window is anchored to the LATEST data date, not today, so it is never
// silently empty when uploads lag. Scope is the same as everywhere else:
// needs_manual_review = 0 (matched events only, which are suburban-only since
// f137cc7). Cabs are NOT folded into their rake — each driving cab carries its
// own AWS equipment.
router.get('/recurrence-report', async (req, res) => {
    const pool = req.app.locals.pool;
    let conn;
    try {
        const allowed = [14, 30, 90];
        let windowDays = parseInt(req.query.window, 10);
        if (!allowed.includes(windowDays)) windowDays = 14;
        const minActs = Math.max(2, parseInt(req.query.min_acts, 10) || 2);

        conn = await pool.getConnection();
        // A very active magnet over 90 days can blow past the 1024-byte default
        // and truncate event_ids, breaking drill-down. Widen it on THIS
        // connection (which also runs the queries below).
        await conn.query('SET SESSION group_concat_max_len = 1000000');

        const [[range]] = await conn.query(
            `SELECT MIN(abn_date) AS min_date, MAX(abn_date) AS max_date
               FROM div_aws_events WHERE needs_manual_review = 0`
        );

        if (!range.max_date) {
            return res.json({
                signals: [], cabs: [],
                window_days: windowDays,
                period: { from: null, to: null },
                available_range: range,
            });
        }

        const toDate = range.max_date;
        // window_days inclusive of the end date, so subtract (n-1).
        const [[fromRow]] = await conn.query(
            'SELECT DATE_SUB(?, INTERVAL ? DAY) AS from_date',
            [toDate, windowDays - 1]
        );
        const fromDate = fromRow.from_date;

        // Signals keyed by magnet_id so the per-section copies of one physical
        // magnet count as one; the +1000000 offset keeps the fallback ids from
        // colliding with real magnet ids.
        const [signals] = await conn.query(
            `WITH acts AS (
                SELECT COALESCE(s.magnet_id, s.id + 1000000) AS magnet_key,
                       s.signal_number, s.section, s.line,
                       e.id, e.abn_date, e.aws_code, e.responsibility, e.loco_raw,
                       COUNT(*) OVER (
                           PARTITION BY COALESCE(s.magnet_id, s.id + 1000000)
                           ORDER BY e.abn_date
                           RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW
                       ) AS roll7
                  FROM div_aws_events e
                  JOIN div_signals s ON s.id = e.signal_id
                 WHERE e.needs_manual_review = 0
                   AND e.abn_date BETWEEN ? AND ?
             )
             SELECT MIN(signal_number) AS signal_number,
                    GROUP_CONCAT(DISTINCT section ORDER BY section) AS sections,
                    MIN(line) AS line,
                    COUNT(*) AS total_acts,
                    COUNT(DISTINCT abn_date) AS distinct_days,
                    COUNT(DISTINCT loco_raw) AS distinct_cabs,
                    MAX(roll7) AS peak_7day,
                    SUM(responsibility = 'S&T') AS st_acts,
                    GROUP_CONCAT(DISTINCT aws_code ORDER BY aws_code) AS codes,
                    GROUP_CONCAT(id ORDER BY abn_date) AS event_ids,
                    MAX(abn_date) AS last_date
               FROM acts
              GROUP BY magnet_key
             HAVING total_acts >= ?
              ORDER BY peak_7day DESC, total_acts DESC
              LIMIT 200`,
            [fromDate, toDate, minActs]
        );

        const [cabs] = await conn.query(
            `WITH acts AS (
                SELECT e.loco_raw, e.id, e.abn_date, e.aws_code,
                       e.responsibility, e.matched_rake_id,
                       COUNT(*) OVER (
                           PARTITION BY e.loco_raw
                           ORDER BY e.abn_date
                           RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW
                       ) AS roll7
                  FROM div_aws_events e
                 WHERE e.needs_manual_review = 0
                   AND e.loco_raw IS NOT NULL AND e.loco_raw <> ''
                   AND e.abn_date BETWEEN ? AND ?
             )
             SELECT a.loco_raw AS cab_number,
                    COUNT(*) AS total_acts,
                    COUNT(DISTINCT a.abn_date) AS distinct_days,
                    MAX(a.roll7) AS peak_7day,
                    SUM(a.responsibility = 'CAB_SIDE') AS cab_acts,
                    GROUP_CONCAT(DISTINCT a.aws_code ORDER BY a.aws_code) AS codes,
                    GROUP_CONCAT(a.id ORDER BY a.abn_date) AS event_ids,
                    MAX(a.abn_date) AS last_date,
                    MAX(f.unit_no) AS unit_no,
                    MAX(f.shed_code) AS shed_code
               FROM acts a
               LEFT JOIN rake_formations f ON f.id = a.matched_rake_id
              GROUP BY a.loco_raw
             HAVING total_acts >= ?
              ORDER BY peak_7day DESC, total_acts DESC
              LIMIT 200`,
            [fromDate, toDate, minActs]
        );

        res.json({
            signals,
            cabs,
            window_days: windowDays,
            period: { from: fromDate, to: toDate },
            min_acts: minActs,
            available_range: range,
        });
    } catch (err) {
        console.error('[AWS /recurrence-report] Error:', err);
        res.status(500).json({ error: 'Failed to load recurrence report' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /recurrence-full ───────────────────────────────────────────────────
// The printable version of /recurrence-report. The three windows are NESTED
// (90d contains 30d contains 14d), so instead of three repeating sections this
// returns ONE 90-day report and tags each incident with the band it falls in:
//   '14d' = last 14 days   '30d' = 15-30 days ago   '90d' = 31-90 days ago
// The page colour-codes by band, so 14d/30d/90d are all visible in one pass
// with no incident printed twice. Each recurring signal/cab carries its full
// incident list inline (not just last-seen) plus cumulative n14 / n30 counts.
router.get('/recurrence-full', async (req, res) => {
    const pool = req.app.locals.pool;
    let conn;
    try {
        const minActs = Math.max(2, parseInt(req.query.min_acts, 10) || 2);
        const allowedWin = [14, 30, 90];
        let windowDays = parseInt(req.query.window, 10);
        if (!allowedWin.includes(windowDays)) windowDays = 90;
        conn = await pool.getConnection();

        const [[range]] = await conn.query(
            `SELECT MIN(abn_date) AS min_date, MAX(abn_date) AS max_date
               FROM div_aws_events WHERE needs_manual_review = 0`
        );
        if (!range.max_date) {
            return res.json({ signals: [], cabs: [], window_days: windowDays, period: { from: null, to: null }, available_range: range });
        }

        const toDate = range.max_date;
        const [[fromRow]] = await conn.query(
            'SELECT DATE_SUB(?, INTERVAL ? DAY) AS from_date', [toDate, windowDays - 1]
        );
        const fromDate = fromRow.from_date;
        const [[cutRow]] = await conn.query(
            `SELECT DATE_SUB(?, INTERVAL 13 DAY) AS c14, DATE_SUB(?, INTERVAL 29 DAY) AS c30`,
            [toDate, toDate]
        );

        // Age band for an incident date. Shared shape for both queries.
        const BAND = `CASE WHEN e.abn_date >= DATE_SUB(?, INTERVAL 13 DAY) THEN '14d'
                          WHEN e.abn_date >= DATE_SUB(?, INTERVAL 29 DAY) THEN '30d'
                          ELSE '90d' END`;

        // ---- signals: aggregate (qualifying magnets) ----
        const [sigAgg] = await conn.query(
            `WITH acts AS (
                SELECT COALESCE(s.magnet_id, s.id + 1000000) AS magnet_key,
                       s.signal_number, s.section, s.line,
                       e.abn_date, e.aws_code, e.responsibility, e.loco_raw,
                       COUNT(*) OVER (
                           PARTITION BY COALESCE(s.magnet_id, s.id + 1000000)
                           ORDER BY e.abn_date
                           RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW
                       ) AS roll7
                  FROM div_aws_events e
                  JOIN div_signals s ON s.id = e.signal_id
                 WHERE e.needs_manual_review = 0 AND e.abn_date BETWEEN ? AND ?
             )
             SELECT magnet_key,
                    MIN(signal_number) AS signal_number,
                    GROUP_CONCAT(DISTINCT section ORDER BY section) AS sections,
                    MIN(line) AS line,
                    COUNT(*) AS total_acts,
                    SUM(abn_date >= DATE_SUB(?, INTERVAL 13 DAY)) AS n14,
                    SUM(abn_date >= DATE_SUB(?, INTERVAL 29 DAY)) AS n30,
                    COUNT(DISTINCT abn_date) AS distinct_days,
                    COUNT(DISTINCT loco_raw) AS distinct_cabs,
                    MAX(roll7) AS peak_7day,
                    SUM(responsibility = 'S&T') AS st_acts,
                    GROUP_CONCAT(DISTINCT aws_code ORDER BY aws_code) AS codes,
                    MAX(abn_date) AS last_date
               FROM acts
              GROUP BY magnet_key
             HAVING total_acts >= ?
              ORDER BY peak_7day DESC, total_acts DESC
              LIMIT 200`,
            [fromDate, toDate, toDate, toDate, minActs]
        );

        // ---- signals: every incident in the 90d window, banded ----
        const [sigInc] = await conn.query(
            `SELECT COALESCE(s.magnet_id, s.id + 1000000) AS magnet_key,
                    e.id, e.abn_date, e.abn_time, e.aws_code, e.location_raw,
                    e.loco_raw, e.train_number, e.crew_id, e.crew_name,
                    e.responsibility, r.detail, ${BAND} AS band
               FROM div_aws_events e
               JOIN div_signals s ON s.id = e.signal_id
               LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
              WHERE e.needs_manual_review = 0 AND e.abn_date BETWEEN ? AND ?
              ORDER BY e.abn_date DESC, e.abn_time DESC`,
            [toDate, toDate, fromDate, toDate]
        );

        // ---- cabs: aggregate ----
        const [cabAgg] = await conn.query(
            `WITH acts AS (
                SELECT e.loco_raw, e.abn_date, e.aws_code, e.responsibility, e.matched_rake_id,
                       COUNT(*) OVER (
                           PARTITION BY e.loco_raw
                           ORDER BY e.abn_date
                           RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW
                       ) AS roll7
                  FROM div_aws_events e
                 WHERE e.needs_manual_review = 0
                   AND e.loco_raw IS NOT NULL AND e.loco_raw <> ''
                   AND e.abn_date BETWEEN ? AND ?
             )
             SELECT a.loco_raw AS cab_number,
                    COUNT(*) AS total_acts,
                    SUM(a.abn_date >= DATE_SUB(?, INTERVAL 13 DAY)) AS n14,
                    SUM(a.abn_date >= DATE_SUB(?, INTERVAL 29 DAY)) AS n30,
                    COUNT(DISTINCT a.abn_date) AS distinct_days,
                    MAX(a.roll7) AS peak_7day,
                    SUM(a.responsibility = 'CAB_SIDE') AS cab_acts,
                    GROUP_CONCAT(DISTINCT a.aws_code ORDER BY a.aws_code) AS codes,
                    MAX(a.abn_date) AS last_date,
                    MAX(f.unit_no) AS unit_no,
                    MAX(f.shed_code) AS shed_code
               FROM acts a
               LEFT JOIN rake_formations f ON f.id = a.matched_rake_id
              GROUP BY a.loco_raw
             HAVING total_acts >= ?
              ORDER BY peak_7day DESC, total_acts DESC
              LIMIT 200`,
            [fromDate, toDate, toDate, toDate, minActs]
        );

        // ---- cabs: every incident, banded (with the signal it acted at) ----
        const [cabInc] = await conn.query(
            `SELECT e.loco_raw, e.id, e.abn_date, e.abn_time, e.aws_code,
                    e.location_raw, s.signal_number, e.train_number,
                    e.crew_id, e.crew_name, e.responsibility, r.detail, ${BAND} AS band
               FROM div_aws_events e
               LEFT JOIN div_signals s ON s.id = e.signal_id
               LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
              WHERE e.needs_manual_review = 0
                AND e.loco_raw IS NOT NULL AND e.loco_raw <> ''
                AND e.abn_date BETWEEN ? AND ?
              ORDER BY e.abn_date DESC, e.abn_time DESC`,
            [toDate, toDate, fromDate, toDate]
        );

        // stitch incidents onto their aggregate rows
        const sigMap = new Map();
        for (const r of sigInc) {
            const k = String(r.magnet_key);
            if (!sigMap.has(k)) sigMap.set(k, []);
            sigMap.get(k).push(r);
        }
        const signals = sigAgg.map(s => ({ ...s, incidents: sigMap.get(String(s.magnet_key)) || [] }));

        const cabMap = new Map();
        for (const r of cabInc) {
            const k = String(r.loco_raw);
            if (!cabMap.has(k)) cabMap.set(k, []);
            cabMap.get(k).push(r);
        }
        const cabs = cabAgg.map(c => ({ ...c, incidents: cabMap.get(String(c.cab_number)) || [] }));

        res.json({
            signals,
            cabs,
            window_days: windowDays,
            period: { from: fromDate, to: toDate },
            bands: { c14: cutRow.c14, c30: cutRow.c30, from: fromDate },
            min_acts: minActs,
            available_range: range,
        });
    } catch (err) {
        console.error('[AWS /recurrence-full] Error:', err);
        res.status(500).json({ error: 'Failed to load full recurrence report' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /cab-cross-check ───────────────────────────────────────────────────
// "Was it the cab, or the signal?" — the corroboration step for a chronic cab.
//
// A chronic cab acts at several different signals. For each of those acts, ask
// whether ANY OTHER cab also acted at that same magnet:
//   • nobody else ever did      -> the magnet is clean, the cab is the common
//                                  factor  (cab-side evidence)
//   • others did, same day      -> the magnet was misbehaving that day; this act
//                                  says nothing about the cab (magnet evidence)
//   • others did, but on other  -> weaker; the magnet has a history, so the act
//     days in the period           is not clean cab evidence either
//
// Comparison is by magnet_id, not signal_id, so the per-section copies of one
// physical magnet count as the same magnet. Acts that never resolved to a signal
// can't be cross-checked at all and are returned separately rather than being
// silently counted as cab evidence.
router.get('/cab-cross-check', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const cab = String(req.query.cab || '').trim();
        if (!cab) return res.status(400).json({ error: 'cab is required' });

        const fromDate = req.query.from || null;
        const toDate = req.query.to || null;

        // The window bounds BOTH the cab's acts and the other cabs we compare
        // against — otherwise a magnet could look "clean" only because the
        // corroborating act sat just outside the range.
        let dateFilter = '', otherFilter = '';
        const dateParams = [], otherParams = [];
        if (fromDate && toDate) {
            dateFilter  = 'AND e.abn_date BETWEEN ? AND ?'; dateParams.push(fromDate, toDate);
            otherFilter = 'AND o.abn_date BETWEEN ? AND ?'; otherParams.push(fromDate, toDate);
        } else if (fromDate) {
            dateFilter  = 'AND e.abn_date >= ?'; dateParams.push(fromDate);
            otherFilter = 'AND o.abn_date >= ?'; otherParams.push(fromDate);
        } else if (toDate) {
            dateFilter  = 'AND e.abn_date <= ?'; dateParams.push(toDate);
            otherFilter = 'AND o.abn_date <= ?'; otherParams.push(toDate);
        }

        const magnetKey = (a) => `COALESCE(${a}.magnet_id, ${a}.id + 1000000)`;

        const [acts] = await pool.query(
            `SELECT e.id, e.abn_date, e.abn_time, e.aws_code, e.train_number,
                    s.signal_number, s.section, s.line,
                    ${magnetKey('s')} AS magnet_key,

                    (SELECT COUNT(*) FROM div_aws_events o
                        JOIN div_signals os ON os.id = o.signal_id
                       WHERE ${magnetKey('os')} = ${magnetKey('s')}
                         AND o.loco_raw <> e.loco_raw
                         AND o.needs_manual_review = 0
                         AND o.abn_date = e.abn_date) AS others_same_day,

                    (SELECT COUNT(DISTINCT o.loco_raw) FROM div_aws_events o
                        JOIN div_signals os ON os.id = o.signal_id
                       WHERE ${magnetKey('os')} = ${magnetKey('s')}
                         AND o.loco_raw <> e.loco_raw
                         AND o.needs_manual_review = 0 ${otherFilter}) AS other_cabs_in_period,

                    (SELECT GROUP_CONCAT(DISTINCT o.loco_raw ORDER BY o.loco_raw)
                       FROM div_aws_events o
                        JOIN div_signals os ON os.id = o.signal_id
                       WHERE ${magnetKey('os')} = ${magnetKey('s')}
                         AND o.loco_raw <> e.loco_raw
                         AND o.needs_manual_review = 0 ${otherFilter}) AS other_cabs,

                    (SELECT GROUP_CONCAT(o.id) FROM div_aws_events o
                        JOIN div_signals os ON os.id = o.signal_id
                       WHERE ${magnetKey('os')} = ${magnetKey('s')}
                         AND o.loco_raw <> e.loco_raw
                         AND o.needs_manual_review = 0 ${otherFilter}) AS other_event_ids

               FROM div_aws_events e
               JOIN div_signals s ON s.id = e.signal_id
              WHERE e.loco_raw = ? AND e.needs_manual_review = 0 ${dateFilter}
              ORDER BY e.abn_date, e.abn_time`,
            [...otherParams, ...otherParams, ...otherParams, cab, ...dateParams]
        );

        // Acts that never resolved to a signal — not evidence either way.
        const [[unmatched]] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM div_aws_events e
              WHERE e.loco_raw = ? AND e.needs_manual_review = 0
                AND e.signal_id IS NULL ${dateFilter}`,
            [cab, ...dateParams]
        );

        const verdictFor = (a) => {
            if (a.others_same_day > 0)      return 'MAGNET';   // others tripped it that very day
            if (a.other_cabs_in_period > 0) return 'SHARED';   // magnet has a history with other cabs
            return 'CAB';                                      // nobody else ever — the cab is the common factor
        };
        const rows = acts.map((a) => ({ ...a, verdict: verdictFor(a) }));

        const cabOnly = rows.filter((r) => r.verdict === 'CAB').length;
        const magnet  = rows.filter((r) => r.verdict === 'MAGNET').length;
        const shared  = rows.filter((r) => r.verdict === 'SHARED').length;

        res.json({
            cab,
            date_filter: { from: fromDate, to: toDate },
            acts: rows,
            summary: {
                acts_with_signal: rows.length,
                acts_without_signal: unmatched.cnt,
                cab_evidence: cabOnly,      // magnet clean -> points at the cab
                magnet_evidence: magnet,    // others acted same day -> points at the magnet
                shared: shared,             // magnet has a history -> inconclusive
                distinct_magnets: new Set(rows.map((r) => r.magnet_key)).size,
            },
        });
    } catch (err) {
        console.error('[AWS /cab-cross-check] Error:', err);
        res.status(500).json({ error: 'Failed to cross-check cab' });
    }
});

async function ensureAwsReportDraftTable(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS div_aws_report_drafts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            period_from DATE NOT NULL,
            period_to DATE NOT NULL,
            office_code VARCHAR(20) NOT NULL DEFAULT '',
            payload JSON NOT NULL,
            saved_by_user_id INT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_aws_report_period_office (period_from, period_to, office_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

// ── GET /report-draft ─────────────────────────────────────────────────────
// Load the saved editable report draft for a date range and office.
router.get('/report-draft', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { from, to, office } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: 'from and to dates are required' });
        }

        await ensureAwsReportDraftTable(pool);

        const [[draft]] = await pool.query(
            `SELECT id, payload, saved_by_user_id, updated_at
             FROM div_aws_report_drafts
             WHERE period_from = ? AND period_to = ? AND office_code = ?
             LIMIT 1`,
            [from, to, office || '']
        );

        res.json({ draft: draft || null });
    } catch (err) {
        console.error('[AWS /report-draft GET] Error:', err);
        res.status(500).json({ error: 'Failed to load report draft' });
    }
});

// ── POST /report-draft ────────────────────────────────────────────────────
// Save the editable report draft for a date range and office.
router.post('/report-draft', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { meta, summary, typesOfBraking, jointInspection } = req.body || {};
        const periodFrom = meta?.periodFromApi || meta?.periodFrom;
        const periodTo = meta?.periodToApi || meta?.periodTo;
        const office = meta?.office || '';

        if (!periodFrom || !periodTo) {
            return res.status(400).json({ error: 'Report period is required' });
        }

        await ensureAwsReportDraftTable(pool);

        const payload = { meta, summary, typesOfBraking, jointInspection };
        const userId = req.session.user?.id || null;

        await pool.query(
            `INSERT INTO div_aws_report_drafts
                (period_from, period_to, office_code, payload, saved_by_user_id)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                payload = VALUES(payload),
                saved_by_user_id = VALUES(saved_by_user_id),
                updated_at = CURRENT_TIMESTAMP`,
            [periodFrom, periodTo, office, JSON.stringify(payload), userId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('[AWS /report-draft POST] Error:', err);
        res.status(500).json({ error: 'Failed to save report draft' });
    }
});

// ── GET /events-by-ids ─────────────────────────────────────────────────────
// Get event details by comma-separated IDs (for drill-down from repeated cases)
router.get('/events-by-ids', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const idsParam = req.query.ids || '';

        // Parse and validate IDs
        const ids = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0);

        if (ids.length === 0) {
            return res.json({ events: [] });
        }

        // Limit to 50 events max
        const limitedIds = ids.slice(0, 50);

        const [events] = await pool.query(
            `SELECT
                e.id,
                e.abn_id,
                e.abn_date,
                e.abn_time,
                e.aws_code,
                e.location_raw,
                e.location_type,
                e.loco_raw,
                e.train_number,
                e.crew_id,
                e.crew_name,
                e.responsibility,
                e.analysis_text,
                e.status,
                r.detail,
                r.from_station,
                r.to_station,
                f.unit_no,
                f.shed_code
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             LEFT JOIN rake_coaches c ON c.coach_number = CONCAT(e.loco_raw, 'C')
             LEFT JOIN rake_formations f ON f.id = c.rake_id
             WHERE e.id IN (?)
             ORDER BY e.abn_date DESC, e.abn_time DESC`,
            [limitedIds]
        );

        res.json({ events });
    } catch (err) {
        console.error('[AWS /events-by-ids] Error:', err);
        res.status(500).json({ error: 'Failed to load events' });
    }
});

// ── GET /export-excel ─────────────────────────────────────────────────────
// Export AWS report data to Excel
router.get('/export-excel', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { from, to } = req.query;

        // Build date filter
        let dateFilter = '';
        const dateParams = [];
        if (from) {
            const fromDate = from.split('-').reverse().join('-'); // DD-MM-YYYY to YYYY-MM-DD
            dateFilter += ' AND e.abn_date >= ?';
            dateParams.push(fromDate);
        }
        if (to) {
            const toDate = to.split('-').reverse().join('-');
            dateFilter += ' AND e.abn_date <= ?';
            dateParams.push(toDate);
        }

        // 1. Summary
        const [[summary]] = await pool.query(
            `SELECT
                COUNT(*) AS total_events,
                SUM(CASE WHEN location_type IN ('SIGNAL','KM','PLATFORM','SECTION') THEN 1 ELSE 0 END) AS st_count,
                SUM(CASE WHEN (location_type IS NULL OR location_type = 'UNKNOWN') AND loco_raw IS NOT NULL THEN 1 ELSE 0 END) AS cab_count
             FROM div_aws_events e
             WHERE e.needs_manual_review = 0 ${dateFilter}`,
            dateParams
        );

        // 2. Type-wise counts
        const [typeCounts] = await pool.query(
            `SELECT
                aws_code,
                COUNT(*) AS total,
                SUM(CASE WHEN location_type IN ('SIGNAL','KM','PLATFORM','SECTION') THEN 1 ELSE 0 END) AS st_count,
                SUM(CASE WHEN (location_type IS NULL OR location_type = 'UNKNOWN') AND loco_raw IS NOT NULL THEN 1 ELSE 0 END) AS cab_count
             FROM div_aws_events e
             WHERE e.needs_manual_review = 0 ${dateFilter}
             GROUP BY aws_code
             ORDER BY FIELD(aws_code,'A','B','C','D','E','P','Q','R','AUX','OTHER')`,
            dateParams
        );

        // 3. Repeated locations
        const [repeatedLocations] = await pool.query(
            `SELECT location_raw, location_type, COUNT(*) as cnt, GROUP_CONCAT(id) as event_ids
             FROM div_aws_events e
             WHERE location_raw IS NOT NULL AND location_raw != '' AND e.needs_manual_review = 0 ${dateFilter}
             GROUP BY location_raw, location_type
             HAVING cnt > 1
             ORDER BY cnt DESC`,
            dateParams
        );

        // 4. Repeated cabs
        const [repeatedCabs] = await pool.query(
            `SELECT loco_raw, COUNT(*) as cnt, GROUP_CONCAT(id) as event_ids
             FROM div_aws_events e
             WHERE loco_raw IS NOT NULL AND loco_raw != '' AND e.needs_manual_review = 0 ${dateFilter}
             GROUP BY loco_raw
             HAVING cnt > 1
             ORDER BY cnt DESC`,
            dateParams
        );

        // 5. Section-wise
        const [sectionWise] = await pool.query(
            `WITH event_section AS (
                SELECT e.id as event_id, s.section_code, s.section_name, s.line_type, e.location_type, e.loco_raw,
                    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY FIELD(s.line_type, 'HARBOUR', 'TRANS_HB', 'LOCAL', 'FAST', 'NE', 'SE', 'PORT', 'OTHER')) as rn
                FROM div_aws_events e
                JOIN div_aws_cms_raw r ON r.id = e.raw_id
                JOIN div_sub_section_stations ss1 ON ss1.station_code = r.from_station
                JOIN div_sub_section_stations ss2 ON ss2.station_code = r.to_station AND ss2.section_code = ss1.section_code
                JOIN div_sub_sections s ON s.section_code = ss1.section_code
                WHERE r.from_station IS NOT NULL AND ss1.seq_order < ss2.seq_order AND e.needs_manual_review = 0 ${dateFilter.replace(/e\./g, 'e.')}
            )
            SELECT section_code, section_name, line_type, COUNT(*) as braking_count,
                SUM(CASE WHEN location_type IN ('SIGNAL','KM','PLATFORM','SECTION') THEN 1 ELSE 0 END) AS st_count,
                SUM(CASE WHEN (location_type IS NULL OR location_type = 'UNKNOWN') AND loco_raw IS NOT NULL THEN 1 ELSE 0 END) AS cab_count
            FROM event_section WHERE rn = 1
            GROUP BY section_code, section_name, line_type
            ORDER BY FIELD(line_type, 'HARBOUR', 'TRANS_HB', 'LOCAL', 'FAST', 'NE', 'SE', 'PORT', 'OTHER'), braking_count DESC`,
            dateParams
        );

        // 6. All events
        const [allEvents] = await pool.query(
            `SELECT
                e.id, e.abn_date, e.abn_time, e.aws_code, e.location_raw, e.location_type,
                e.loco_raw, f.unit_no, e.train_number, e.crew_name, e.crew_id,
                r.detail, r.from_station, r.to_station
             FROM div_aws_events e
             LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
             LEFT JOIN rake_coaches c ON c.coach_number = CONCAT(e.loco_raw, 'C')
             LEFT JOIN rake_formations f ON f.id = c.rake_id
             WHERE e.needs_manual_review = 0 ${dateFilter}
             ORDER BY e.abn_date DESC, e.abn_time DESC`,
            dateParams
        );

        // Build Excel workbook
        const XLSX = require('xlsx');
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['AWS Weekly Report'],
            ['Period', from || 'All', 'to', to || 'All'],
            [],
            ['Metric', 'Count'],
            ['Total AWS Events', summary.total_events],
            ['S&T Account', summary.st_count],
            ['Cab/D-Cab', summary.cab_count],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Type-wise sheet
        const typeData = [
            ['Code', 'Total', 'S&T', 'Cab'],
            ...typeCounts.map(t => [t.aws_code, t.total, t.st_count, t.cab_count])
        ];
        const wsTypes = XLSX.utils.aoa_to_sheet(typeData);
        XLSX.utils.book_append_sheet(wb, wsTypes, 'Type-wise');

        // Repeated Locations sheet
        const locData = [
            ['Location', 'Type', 'Count'],
            ...repeatedLocations.map(l => [l.location_raw, l.location_type, l.cnt])
        ];
        const wsLoc = XLSX.utils.aoa_to_sheet(locData);
        XLSX.utils.book_append_sheet(wb, wsLoc, 'Repeated Locations');

        // Repeated Cabs sheet
        const cabData = [
            ['D/Cab', 'Count'],
            ...repeatedCabs.map(c => [c.loco_raw, c.cnt])
        ];
        const wsCabs = XLSX.utils.aoa_to_sheet(cabData);
        XLSX.utils.book_append_sheet(wb, wsCabs, 'Repeated Cabs');

        // Section-wise sheet
        const secData = [
            ['Section', 'Line Type', 'Total', 'S&T', 'Cab'],
            ...sectionWise.map(s => [s.section_name, s.line_type, s.braking_count, s.st_count, s.cab_count])
        ];
        const wsSec = XLSX.utils.aoa_to_sheet(secData);
        XLSX.utils.book_append_sheet(wb, wsSec, 'Section-wise');

        // All Events sheet
        const evtData = [
            ['Date', 'Time', 'Code', 'Location', 'Type', 'D/Cab', 'Unit', 'Train', 'Crew', 'Crew ID', 'From', 'To', 'Detail'],
            ...allEvents.map(e => [
                e.abn_date ? new Date(e.abn_date).toLocaleDateString('en-GB') : '',
                e.abn_time ? e.abn_time.toString().substring(0, 5) : '',
                e.aws_code,
                e.location_raw,
                e.location_type,
                e.loco_raw,
                e.unit_no,
                e.train_number,
                e.crew_name,
                e.crew_id,
                e.from_station,
                e.to_station,
                e.detail
            ])
        ];
        const wsEvents = XLSX.utils.aoa_to_sheet(evtData);
        XLSX.utils.book_append_sheet(wb, wsEvents, 'All Events');

        // Generate buffer and send
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=AWS_Report.xlsx`);
        res.send(buffer);

    } catch (err) {
        console.error('[AWS /export-excel] Error:', err);
        res.status(500).json({ error: 'Failed to export Excel' });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 6: Signal Matching
// ══════════════════════════════════════════════════════════════════════════

// ── Helper: Normalize text for signal matching ─────────────────────────────
// Removes spaces, hyphens, slashes, dots, commas and uppercases.
// Handles all signal-number forms in use on BB Div:
//   "KYN S-46"  → "KYNS46"   (station signal)
//   "K-056"     → "K056"     (TH-line automatic, km-derived)
//   "L-3403"    → "L3403"    (LL-line automatic)
//   "ME-2904"   → "ME2904"   (5th/6th-line automatic)
//   "K-044 A"   → "K044A"    (sub-numbered automatic)
// L/K/ME numbers are not globally unique — same number can exist in different
// (section,line,direction) partitions. matchSignalFromDb downgrades confidence
// to MEDIUM when the lookup is ambiguous so reviewers can disambiguate.
// Station-abbreviation synonyms: how motormen write a station in the CMS vs the
// canonical name in div_signals. Applied only to the leading token of an
// extracted location, so "KALVA S 10" lines up with "KLVA …", "KILE S 3" with
// "KILLE …" (Kille Cabin), and "AMB S 6" with "ABH …" (Ambernath — confirmed by
// the train route: AMB trains run the SE corridor, not Ambivli/NE).
// NB: "AT" is NOT a synonym — it is the preposition "at" and was wrongly mapping
// to Atgaon; route-aware matching + the parser exclusion handle it now.
const STATION_SYNONYMS = { KALVA: 'KLVA', KILE: 'KILLE', AMB: 'ABH' };

function normalizeForSignalMatch(text) {
    if (!text) return '';
    let t = String(text).toUpperCase().trim();
    // Canonicalise distant-signal wording before stripping separators so CMS
    // free-text ("VSD DISTANT SIG", "KE UP DISTANT SIGNAL") lines up with the
    // div_signals naming ("VSD DIST", "KE DIST").
    t = t
        .replace(/\bDISTANT\b/g, 'DIST')
        .replace(/\bSIGNAL\b/g, '')
        .replace(/\bSIG\b/g, '')
        .replace(/\b(UP|DN|DOWN)\b/g, '');   // direction word isn't part of the signal id
    // Station synonym on the leading alpha token.
    const lead = t.match(/^\s*([A-Z]+)\b/);
    if (lead && STATION_SYNONYMS[lead[1]]) {
        t = STATION_SYNONYMS[lead[1]] + t.slice(lead.index + lead[0].length);
    }
    return t.replace(/[\s\-\/\.\,]+/g, '').trim();
}

// ── Helper: Match signal against database ──────────────────────────────────
// Returns { signal_id, signal_number, confidence } or { signal_id: null }.
// Partition-aware: pass { section, line, direction } in `context` to filter
// candidates to one partition. Without context, ambiguous matches downgrade
// to MEDIUM confidence so they surface for manual review.
// Derive the section(s) a train ran, to scope route-aware signal matching.
// Primary source: the event's own FROM/TO stations (already in the abnormality
// row). Fallback: the train's start/end stations from the `trains` timetable.
// Station tokens pass through STATION_SYNONYMS (e.g. AMB -> ABH), so the corridor
// resolves even when the CMS abbreviation differs from the div_signals code.
// ── Helper: which way was the train running? ──────────────────────────────
// Some signals exist as a matched UP/DN pair under ONE name — "KE IBS DIST" is
// both signal 1258 (UP NE) and 1235 (DN NE) — so the name alone cannot identify
// the magnet. Direction comes from two places, in order of trust:
//   1. the crew wrote it in the detail ("KE UP IBS DISTANT")
//   2. the trip itself: div_sub_section_stations orders the stations per
//      direction (UP_NE runs KSRA->KYN, DN_NE runs KYN->KSRA), so the leg whose
//      seq_order increases from FROM to TO tells us the direction.
// Returns 'UP' | 'DN' | null (null = don't guess; leave the tie unbroken).
function directionFromText(detail) {
    const t = normalizeDetail(detail);
    if (/\bUP\b/.test(t)) return 'UP';
    if (/\b(DN|DOWN)\b/.test(t)) return 'DN';
    return null;
}

async function tripDirection(pool, fromStn, toStn) {
    const norm = (s) => {
        const u = (s || '').toString().trim().toUpperCase();
        return STATION_SYNONYMS[u] || u;
    };
    const from = norm(fromStn), to = norm(toStn);
    if (!from || !to || from === to) return null;

    const [rows] = await pool.query(
        `SELECT DISTINCT CASE WHEN LEFT(a.section_code, 3) = 'UP_' THEN 'UP' ELSE 'DN' END AS direction
           FROM div_sub_section_stations a
           JOIN div_sub_section_stations b ON b.section_code = a.section_code
          WHERE a.station_code = ? AND b.station_code = ?
            AND a.seq_order < b.seq_order`,
        [from, to]
    );
    // Every sub-section carrying this leg must agree, else we cannot tell.
    return rows.length === 1 ? rows[0].direction : null;
}

async function directionForEvent(pool, { detail, from_station, to_station }) {
    return directionFromText(detail) || await tripDirection(pool, from_station, to_station);
}

async function routeSectionsForEvent(pool, fromStn, toStn, trainNumber) {
    const norm = (s) => {
        const u = (s || '').toString().trim().toUpperCase();
        return STATION_SYNONYMS[u] || u;
    };
    const sectionsFor = async (codes) => {
        const list = [...new Set(codes.filter(Boolean))];
        if (!list.length) return [];
        const [rows] = await pool.query(
            // Scoped to AWS_SECTIONS: Karjat sits on the ghat as well as the
            // suburban line, so without this the route of an EMU trip would claim
            // the ghat sections too, and a ghat copy of a Karjat signal would look
            // like a legitimate in-route candidate.
            `SELECT DISTINCT section FROM div_signals
              WHERE station_code IN (?) AND section IS NOT NULL AND section IN (?)`,
            [list, AWS_SECTIONS]
        );
        return rows.map((r) => r.section);
    };

    let sections = await sectionsFor([norm(fromStn), norm(toStn)]);
    if (!sections.length && trainNumber) {
        const nt = String(trainNumber).toUpperCase().replace(/[\s/.\-]/g, '');
        const [legs] = await pool.query(
            `SELECT start_station, end_station FROM trains
              WHERE UPPER(REGEXP_REPLACE(train_number,'[[:space:]/.-]','')) = ?`,
            [nt]
        );
        sections = await sectionsFor(legs.flatMap((l) => [norm(l.start_station), norm(l.end_station)]));
    }
    return sections;
}

// ── Helper: resolve a prefix-less automatic signal number via the train route ─
// A bare number ("5602") is ambiguous on its own, but each ghat numbers its
// automatic signals uniquely (NE-#### on KYN-KSRA, SE-#### on KYN-KJT) and the
// 4-digit numbers do NOT collide across NE/SE. So the train's section(s) pick
// the prefix: number + section IN (route sections) -> exactly one signal.
// Existence-gated: returns a match ONLY if such an auto signal really exists on
// the route. No route / no such signal -> { signal_id: null } (left for review).
async function resolveBareAutoSignal(pool, bareNumber, routeSections) {
    const num = String(bareNumber || '').replace(/\D/g, '');
    const secs = [...new Set((routeSections || []).filter(Boolean))];
    if (!num || !secs.length) return { signal_id: null, signal_number: null, confidence: null };

    const [rows] = await pool.query(
        `SELECT id AS signal_id, signal_number, section
           FROM div_signals
          WHERE signal_type = 'Automatic'
            AND is_active = 1
            AND SUBSTRING_INDEX(signal_number, '-', -1) = ?
            AND section IN (?)`,
        [num, secs]
    );
    if (rows.length === 1) {
        return { signal_id: rows[0].signal_id, signal_number: rows[0].signal_number, confidence: 'HIGH' };
    }
    if (rows.length > 1) {
        // Train spans >1 ghat (rare) — ambiguous, leave for manual review.
        return { signal_id: rows[0].signal_id, signal_number: rows[0].signal_number, confidence: 'MEDIUM' };
    }
    return { signal_id: null, signal_number: null, confidence: null };
}

// ── Helper: bare auto-signal resolution for one raw row ────────────────────
// Glue for the parse loops: pull a prefix-less number from the detail, reject
// it if it is just the train/loco number echoed in the text, then resolve it
// against the train's ghat. Returns the full signal_number ("SE-5602") or null.
async function resolveBareSignalForRow(db, raw) {
    const bareNum = extractBareAutoNumber(raw.detail);
    if (!bareNum) return null;
    const digits = (s) => String(s || '').replace(/\D/g, '');
    if (bareNum === digits(raw.train_number) || bareNum === digits(raw.loco_raw)) return null;
    const sections = await routeSectionsForEvent(db, raw.from_station, raw.to_station, raw.train_number);
    const bare = await resolveBareAutoSignal(db, bareNum, sections);
    return bare.signal_id ? bare.signal_number : null;
}

// ── Helper: resolve ONE split act's location text ──────────────────────────
// The act's "code @/at" anchor has already been stripped, so locationText is
// just the place ("NE 5510", "KYN S 81", "8808"). Try extractLocation first;
// if it finds nothing, treat a 3-5 digit run as a prefix-less auto signal and
// resolve it via the train's ghat (the anchor already supplied the "at" cue).
async function resolveActLocation(db, raw, locationText) {
    const loc = extractLocation(locationText);
    if (loc.raw) return { raw: loc.raw, type: loc.type };
    const digits = (s) => String(s || '').replace(/\D/g, '');
    const num = (String(locationText).match(/\b(\d{3,5})\b/) || [])[1];
    if (num && num !== digits(raw.train_number) && num !== digits(raw.loco_raw)) {
        const sections = await routeSectionsForEvent(db, raw.from_station, raw.to_station, raw.train_number);
        const bare = await resolveBareAutoSignal(db, num, sections);
        if (bare.signal_id) return { raw: bare.signal_number, type: 'SIGNAL' };
    }
    return { raw: null, type: 'UNKNOWN' };
}

// ── Helper: parse one raw candidate into 1..N events and insert them ───────
// Single-act details behave exactly as before (one event). Multi-act details
// ("B @ NE 5918  Aux @ NE 5510") are split into one event per act, numbered by
// event_seq. Split acts are judged by the same completeness rule as single acts:
// an act with a code and a location is confirmed; only the incomplete acts
// ("D at Parel PF" — a platform, not a signal) go to manual review.
// Returns { inserted, needsReview, skippedDup }.
async function insertEventsForRaw(db, raw, userId) {
    const detail = raw.detail;
    const segments = splitAwsEvents(detail);
    const isSplit = segments.length >= 2;

    let inserted = 0, needsReview = 0, skippedDup = 0, seq = 0;
    // Single-act (or no anchor at all): one event from the whole detail.
    const acts = isSplit ? segments : [{ whole: true }];

    for (const act of acts) {
        seq++;
        let awsCode, confidence, locationRaw, locationType;
        if (act.whole) {
            ({ code: awsCode, confidence } = extractAwsCode(detail));
            ({ raw: locationRaw, type: locationType } = extractLocation(detail));
            if (!locationRaw) {
                const bareSig = await resolveBareSignalForRow(db, raw);
                if (bareSig) { locationRaw = bareSig; locationType = 'SIGNAL'; }
            }
        } else {
            awsCode = act.code;                 // straight from the anchor (e.g. B, AUX)
            confidence = 'HIGH';
            ({ raw: locationRaw, type: locationType } = await resolveActLocation(db, raw, act.locationText));
        }

        // Skip CMS re-logs (now location-aware so split acts aren't collapsed).
        if (await isDuplicateAwsEvent(db, {
            crew_id: raw.crew_id, abn_date: raw.abn_date, abn_time: raw.abn_time,
            loco_raw: raw.loco_raw, aws_code: awsCode, location_raw: locationRaw
        })) { skippedDup++; continue; }

        // Same completeness rule for split acts and single acts.
        const needsManualReview = (!awsCode || confidence === 'LOW' || !locationRaw) ? 1 : 0;
        if (needsManualReview) needsReview++;

        try {
            await db.query(
                `INSERT INTO div_aws_events
                    (raw_id, abn_id, event_seq, entry_source, entered_by_user_id,
                     abn_date, abn_time, aws_code, location_raw, location_type,
                     needs_manual_review, loco_raw, train_number, crew_id, crew_name, status)
                 VALUES (?, ?, ?, 'CMS_IMPORT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
                [raw.id, raw.abn_id, seq, userId,
                 raw.abn_date, raw.abn_time, awsCode, locationRaw, locationType,
                 needsManualReview, raw.loco_raw, raw.train_number, raw.crew_id, raw.crew_name]
            );
            inserted++;
        } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') throw err;
        }
    }
    return { inserted, needsReview, skippedDup };
}

async function matchSignalFromDb(pool, locationRaw, context = {}) {
    if (!locationRaw) return { signal_id: null, signal_number: null, confidence: null };

    const normalized = normalizeForSignalMatch(locationRaw);
    if (!normalized) return { signal_id: null, signal_number: null, confidence: null };

    // AWS scope is a HARD filter (unlike direction, below): an out-of-scope signal
    // is not a worse candidate, it is not a candidate at all. A ghat copy of a
    // Karjat signal is a magnet no EMU motorman passed. Applied to every tier —
    // including the alias tier, so a stale alias pointing into the ghat cannot
    // short-circuit the lookup, which is exactly how "KJT S-22" was resolving to
    // the wrong magnet.
    const partitionClauses = ['s.section IN (?)'];
    const partitionParams  = [AWS_SECTIONS];
    if (context.section)   { partitionClauses.push('s.section = ?');   partitionParams.push(context.section); }
    if (context.line)      { partitionClauses.push('s.`line` = ?');    partitionParams.push(context.line); }
    // NOTE: direction is deliberately NOT a WHERE clause. As a hard filter it
    // would drop a signal outright whenever our inferred direction is wrong,
    // turning a good match into no match. It is applied below as a tie-breaker.
    const partitionSql = ` AND ${partitionClauses.join(' AND ')}`;

    // Route-aware disambiguation: when a signal number exists in more than one
    // section (e.g. RVJ S-7 in VDLR-GMN and CSMT-PNVL), prefer the candidate in
    // the section(s) the train actually ran (context.sections, derived from the
    // event's FROM/TO stations + train route). A unique in-route hit is HIGH; a
    // remaining tie is MEDIUM.
    const routeSecs = Array.isArray(context.sections) && context.sections.length ? context.sections : null;
    const pickByRoute = (hits) => {
        if (!hits.length) return null;
        let pool = hits;
        if (routeSecs && pool.length > 1) {
            const inRoute = pool.filter((h) => routeSecs.includes(h.section));
            if (inRoute.length) pool = inRoute;
        }
        // Direction breaks a tie the section could not — "KE IBS DIST" exists once
        // UP and once DN, both in KYN-KSRA. Applied as a tie-breaker, never as a
        // filter: if it matches nothing we keep the section-narrowed candidates,
        // so a signal with no direction recorded can still match.
        if (context.direction && pool.length > 1) {
            const sameDir = pool.filter((h) => h.direction === context.direction);
            if (sameDir.length) pool = sameDir;
        }
        return { row: pool[0], confidence: pool.length > 1 ? 'MEDIUM' : 'HIGH' };
    };

    // 1. Exact match on normalized_alias
    const [aliasHits] = await pool.query(
        `SELECT a.signal_id, s.signal_number, s.section, s.direction
         FROM div_signal_aliases a
         JOIN div_signals s ON s.id = a.signal_id
         WHERE a.normalized_alias = ?
           AND a.is_active = 1 AND s.is_active = 1
           ${partitionSql}
         LIMIT 5`,
        [normalized, ...partitionParams]
    );
    // An alias is a single hand-linked row, so it carries whichever direction the
    // CLI happened to link ("KEIBSDIST" -> the UP copy). If every alias hit points
    // the wrong way for this trip, don't trust it — fall through to the direct
    // lookup, which sees both the UP and DN copy and can pick the right one.
    const aliasUsable = (context.direction && aliasHits.length &&
                         aliasHits.every((h) => h.direction && h.direction !== context.direction))
        ? [] : aliasHits;
    const aliasPick = pickByRoute(aliasUsable);
    if (aliasPick) {
        return { signal_id: aliasPick.row.signal_id, signal_number: aliasPick.row.signal_number, confidence: aliasPick.confidence };
    }

    // 2. Exact match on normalized_signal_number
    const [directHits] = await pool.query(
        `SELECT s.id AS signal_id, s.signal_number, s.section, s.direction
         FROM div_signals s
         WHERE s.normalized_signal_number = ?
           AND s.is_active = 1
           ${partitionSql}
         LIMIT 5`,
        [normalized, ...partitionParams]
    );
    const directPick = pickByRoute(directHits);
    if (directPick) {
        return { signal_id: directPick.row.signal_id, signal_number: directPick.row.signal_number, confidence: directPick.confidence };
    }

    // 2b. Gate signals. A crew writes "Gate LX-26 S-3", but for most gates the
    // GATE ITSELF is the signal — div_signals holds "Gate-26", not "Gate-26 S-3".
    // Only a few carry the S-number as their own row (Gate-19 S-3, Gate-22 S-3,
    // GATE-5 S-3), and the exact lookup above has already claimed those. So when
    // "GATE<n>S<x>" finds nothing, retry as the bare gate. Restricted to GATE so
    // it can never strip a station's S-number ("KYN S-19" is untouched).
    const gateBase = normalized.match(/^(GATE\d+)S\d+[A-Z]?$/);
    if (gateBase) {
        const [gateHits] = await pool.query(
            `SELECT s.id AS signal_id, s.signal_number, s.section, s.direction
               FROM div_signals s
              WHERE s.normalized_signal_number = ?
                AND s.is_active = 1
                ${partitionSql}
              LIMIT 5`,
            [gateBase[1], ...partitionParams]
        );
        const gatePick = pickByRoute(gateHits);
        if (gatePick) {
            return { signal_id: gatePick.row.signal_id, signal_number: gatePick.row.signal_number, confidence: gatePick.confidence };
        }
    }

    // Station-less signal refs ("S 24", "SH 59" — no station prefix) cannot be
    // uniquely resolved: every station has an S-24. The fuzzy tiers below would
    // LIKE-match an arbitrary signal ending in those digits (e.g. "S 24" ->
    // "STC A-924"), so stop here and leave it for route/CLI review.
    if (/^S[H]?\d+$/.test(normalized)) {
        return { signal_id: null, signal_number: null, confidence: null };
    }

    // 3. Partial match - try with LIKE pattern (MEDIUM confidence)
    // E.g., "KYNS8" might match "KYNS08" or vice versa
    // Build pattern: insert % between letters and numbers
    const likePattern = normalized.replace(/([A-Z]+)(\d+)/, '$1%$2');
    if (likePattern !== normalized) {
        const [partialMatch] = await pool.query(
            `SELECT a.signal_id, s.signal_number
             FROM div_signal_aliases a
             JOIN div_signals s ON s.id = a.signal_id
             WHERE a.normalized_alias LIKE ? AND a.is_active = 1 AND s.is_active = 1
               ${partitionSql}
             LIMIT 1`,
            [likePattern, ...partitionParams]
        );

        if (partialMatch.length > 0) {
            return {
                signal_id: partialMatch[0].signal_id,
                signal_number: partialMatch[0].signal_number,
                confidence: 'MEDIUM'
            };
        }
    }

    // 4. Try matching with leading zero padding (MEDIUM confidence)
    // Station signals use 2-digit padding ("KYNS8" → "KYNS08"); inter-station
    // automatics (K-/L-/ME-) use 3- or 4-digit numbers ("K48" → "K048").
    // Try each width that produces a different string.
    const padBase = normalized.match(/^([A-Z]+)(\d+)$/);
    if (padBase) {
        const [, letters, num] = padBase;
        const variants = [...new Set(
            [2, 3, 4]
                .map((w) => letters + num.padStart(w, '0'))
                .filter((v) => v !== normalized)
        )];

        for (const variant of variants) {
            const [padMatch] = await pool.query(
                `SELECT a.signal_id, s.signal_number
                 FROM div_signal_aliases a
                 JOIN div_signals s ON s.id = a.signal_id
                 WHERE a.normalized_alias = ?
                   AND a.is_active = 1 AND s.is_active = 1
                   ${partitionSql}
                 LIMIT 1`,
                [variant, ...partitionParams]
            );

            if (padMatch.length > 0) {
                return {
                    signal_id: padMatch[0].signal_id,
                    signal_number: padMatch[0].signal_number,
                    confidence: 'MEDIUM'
                };
            }
        }
    }

    // No match found
    return { signal_id: null, signal_number: null, confidence: null };
}

// ── POST /match-signals ────────────────────────────────────────────────────
// Run signal matching on all unmatched SIGNAL-type events
router.post('/match-signals', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        // Get all events that need signal matching (with route/direction context)
        const [events] = await pool.query(
            `SELECT e.id, e.location_raw, e.train_number,
                    r.from_station, r.to_station, r.detail
             FROM div_aws_events e
             JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE e.location_type = 'SIGNAL'
               AND e.location_raw IS NOT NULL
               AND e.location_raw != ''
               AND e.signal_id IS NULL`
        );

        let matched = 0;
        let unmatched = 0;
        const results = [];

        for (const event of events) {
            const sections  = await routeSectionsForEvent(pool, event.from_station, event.to_station, event.train_number);
            const direction = await directionForEvent(pool, event);
            const match = await matchSignalFromDb(pool, event.location_raw, { sections, direction });

            if (match.signal_id) {
                // Update the event with matched signal; canonicalise location_raw to
                // the matched signal name so variants ("SE5602"/"SE-5602") unify.
                await pool.query(
                    `UPDATE div_aws_events
                     SET signal_id = ?,
                         signal_match_confidence = ?,
                         location_raw = ?,
                         normalized_location = ?
                     WHERE id = ?`,
                    [match.signal_id, match.confidence, match.signal_number, normalizeForSignalMatch(event.location_raw), event.id]
                );
                matched++;
                results.push({
                    event_id: event.id,
                    location_raw: event.location_raw,
                    signal_id: match.signal_id,
                    signal_number: match.signal_number,
                    confidence: match.confidence
                });
            } else {
                // Update normalized_location even if no match
                await pool.query(
                    `UPDATE div_aws_events
                     SET normalized_location = ?
                     WHERE id = ?`,
                    [normalizeForSignalMatch(event.location_raw), event.id]
                );
                unmatched++;
            }
        }

        res.json({
            success: true,
            total: events.length,
            matched,
            unmatched,
            matches: results
        });
    } catch (err) {
        console.error('[AWS /match-signals] Error:', err);
        res.status(500).json({ error: 'Signal matching failed' });
    }
});

// ── GET /unmatched-signals ─────────────────────────────────────────────────
// Get distinct unmatched signal locations for review
router.get('/unmatched-signals', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        const [signals] = await pool.query(
            `SELECT
                location_raw,
                normalized_location,
                COUNT(*) as occurrence_count,
                GROUP_CONCAT(DISTINCT DATE_FORMAT(abn_date, '%d-%m') ORDER BY abn_date) as dates,
                GROUP_CONCAT(DISTINCT id) as event_ids
             FROM div_aws_events
             WHERE location_type = 'SIGNAL'
               AND location_raw IS NOT NULL
               AND location_raw != ''
               AND signal_id IS NULL
             GROUP BY location_raw, normalized_location
             ORDER BY occurrence_count DESC`
        );

        // Get available signals for manual linking
        const [availableSignals] = await pool.query(
            `SELECT id, signal_number, station_code, section, line
             FROM div_signals
             WHERE is_active = 1
             ORDER BY signal_number`
        );

        res.json({
            unmatched: signals,
            available_signals: availableSignals
        });
    } catch (err) {
        console.error('[AWS /unmatched-signals] Error:', err);
        res.status(500).json({ error: 'Failed to load unmatched signals' });
    }
});

// ── POST /link-signal ──────────────────────────────────────────────────────
// Manually link a location_raw to a signal and optionally create alias
router.post('/link-signal', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { location_raw, signal_id, create_alias } = req.body;

        if (!location_raw || !signal_id) {
            return res.status(400).json({ error: 'location_raw and signal_id required' });
        }

        // Verify signal exists
        const [[signal]] = await pool.query(
            'SELECT id, signal_number, signal_type, signal_function FROM div_signals WHERE id = ?',
            [signal_id]
        );

        if (!signal) {
            return res.status(404).json({ error: 'Signal not found' });
        }

        const normalized = normalizeForSignalMatch(location_raw);

        // ── Guard: never learn a STATION-LESS alias for an IBS signal ──────────
        // An IBS number ("IBS S23", "IB S 23") repeats across many stations on the
        // same section (in-scope KYN-KSRA alone has S-16 at ASO/ATG/KDV/KE). A
        // station-less alias would then wrongly claim EVERY future occurrence for
        // the one station picked here. So: still link these events (keeps them in
        // the transient/cab/signal/chronic analysis — the whole point), but teach
        // nothing. To learn an alias the reviewer must qualify the text with the
        // station first (e.g. edit "IBS S23" -> "VSD S-23" on the event card).
        // IBS is encoded two ways in div_signals: UP copies as signal_type='IBS',
        // DN copies as signal_type='Manual' with signal_function='IBS'. Check both.
        const isIbs = signal.signal_type === 'IBS' || signal.signal_function === 'IBS';
        const stationTok = (String(signal.signal_number).match(/^[A-Z]+/) || [''])[0];
        const stationLessIbs = isIbs && stationTok && !normalized.includes(stationTok);
        const effectiveCreateAlias = create_alias && !stationLessIbs;

        // Update all events with this location_raw
        const [updateResult] = await pool.query(
            `UPDATE div_aws_events
             SET signal_id = ?,
                 signal_match_confidence = 'HIGH',
                 normalized_location = ?
             WHERE location_raw = ? AND location_type = 'SIGNAL'`,
            [signal_id, normalized, location_raw]
        );

        // Create alias if requested
        let aliasCreated = false;
        if (effectiveCreateAlias && normalized) {
            // Check if alias already exists
            const [[existing]] = await pool.query(
                'SELECT id FROM div_signal_aliases WHERE normalized_alias = ?',
                [normalized]
            );

            if (!existing) {
                await pool.query(
                    `INSERT INTO div_signal_aliases
                     (signal_id, alias_text, normalized_alias, source, confidence)
                     VALUES (?, ?, ?, 'cms_parser', 'HIGH')`,
                    [signal_id, location_raw, normalized]
                );
                aliasCreated = true;
            }
        }

        res.json({
            success: true,
            events_updated: updateResult.affectedRows,
            alias_created: aliasCreated,
            alias_suppressed: stationLessIbs,   // station-less IBS -> linked but no alias learned
            signal_number: signal.signal_number
        });
    } catch (err) {
        console.error('[AWS /link-signal] Error:', err);
        res.status(500).json({ error: 'Failed to link signal' });
    }
});

// ── GET /signals/search ────────────────────────────────────────────────────
// Search signals for manual linking dropdown
router.get('/signals/search', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const query = req.query.q || '';

        if (query.length < 2) {
            return res.json({ signals: [] });
        }

        const searchPattern = `%${query}%`;
        // Collapse magnet-linked rows: return ONE canonical row per magnet (the row
        // whose id == its magnet_id), matching if ANY sibling of that magnet matches
        // the search text/alias. Prevents the same physical signal from showing twice
        // in the picker — e.g. CSMT S-26 prints on both UP TH and UP LOC (magnet 233),
        // and its aliases "CSMT S-26" / "CST S 26" point at the two different rows.
        const [signals] = await pool.query(
            `SELECT s.id, s.signal_number, s.station_code, s.section, s.line
             FROM div_signals s
             WHERE s.is_active = 1
               AND s.id = COALESCE(s.magnet_id, s.id)
               AND EXISTS (
                   SELECT 1 FROM div_signals s2
                   LEFT JOIN div_signal_aliases a ON a.signal_id = s2.id
                   WHERE s2.is_active = 1
                     AND COALESCE(s2.magnet_id, s2.id) = s.id
                     AND (s2.signal_number LIKE ?
                          OR s2.normalized_signal_number LIKE ?
                          OR a.alias_text LIKE ?
                          OR a.normalized_alias LIKE ?)
               )
             ORDER BY s.signal_number
             LIMIT 20`,
            [searchPattern, searchPattern.replace(/\s/g, ''), searchPattern, searchPattern.replace(/\s/g, '')]
        );

        res.json({ signals });
    } catch (err) {
        console.error('[AWS /signals/search] Error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 6: Rake/Cab Matching
// ══════════════════════════════════════════════════════════════════════════

// ── Helper: Match rake/cab from database ───────────────────────────────────
// loco_raw is typically "1002" or "5322" - the D/Cab number
// rake_coaches.coach_number is "1002C" (with C suffix for cab/driving motor)
async function matchRakeFromDb(pool, locoRaw) {
    if (!locoRaw) return { coach_id: null, rake_id: null, unit_no: null, shed_code: null };

    // Keep the digits and nothing else. Trimming only a trailing letter left
    // stray punctuation in place, so a cab typed ".1130" never matched 1130.
    const cleanLoco = (String(locoRaw).match(/\d+/) || [''])[0];
    if (!cleanLoco) return { coach_id: null, rake_id: null, unit_no: null, shed_code: null };

    // Try matching with C suffix (driving cab)
    const coachNumber = cleanLoco + 'C';

    const [match] = await pool.query(
        `SELECT c.id AS coach_id, c.rake_id, f.unit_no, f.shed_code
         FROM rake_coaches c
         JOIN rake_formations f ON f.id = c.rake_id
         WHERE c.coach_number = ?
         LIMIT 1`,
        [coachNumber]
    );

    if (match.length > 0) {
        return {
            coach_id: match[0].coach_id,
            rake_id: match[0].rake_id,
            unit_no: match[0].unit_no,
            shed_code: match[0].shed_code
        };
    }

    // Fallback: the cab has no row in rake_coaches, but the number is one of the
    // units in a formation's unit_no (cab 2126 -> rake 160, "2119-2127-2128-2126").
    // rake_coaches is not complete/consistent for every rake, so unit_no is the
    // better witness when it disagrees. Only accept a UNIQUE hit — a unit number
    // can repeat across formations (rakes 1 and 3 are both "2483-2483-2483-2483"),
    // and a guess there would pin an act on the wrong rake.
    const [byUnit] = await pool.query(
        `SELECT id AS rake_id, unit_no, shed_code
           FROM rake_formations
          WHERE is_active = 1
            AND FIND_IN_SET(?, REPLACE(unit_no, '-', ',')) > 0
          LIMIT 2`,
        [cleanLoco]
    );

    if (byUnit.length === 1) {
        return {
            coach_id: null,                 // no coach row exists for this cab
            rake_id: byUnit[0].rake_id,
            unit_no: byUnit[0].unit_no,
            shed_code: byUnit[0].shed_code
        };
    }

    // No match found (or ambiguous across formations)
    return { coach_id: null, rake_id: null, unit_no: null, shed_code: null };
}

// ── POST /match-rakes ──────────────────────────────────────────────────────
// Run rake matching on all unmatched events with loco_raw
router.post('/match-rakes', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        // Get all events that need rake matching
        const [events] = await pool.query(
            `SELECT id, loco_raw
             FROM div_aws_events
             WHERE loco_raw IS NOT NULL
               AND loco_raw != ''
               AND matched_rake_id IS NULL`
        );

        let matched = 0;
        let unmatched = 0;
        const results = [];

        for (const event of events) {
            const match = await matchRakeFromDb(pool, event.loco_raw);

            if (match.rake_id) {
                // Update the event with matched rake
                await pool.query(
                    `UPDATE div_aws_events
                     SET matched_coach_id = ?,
                         matched_rake_id = ?
                     WHERE id = ?`,
                    [match.coach_id, match.rake_id, event.id]
                );
                matched++;
                results.push({
                    event_id: event.id,
                    loco_raw: event.loco_raw,
                    coach_id: match.coach_id,
                    rake_id: match.rake_id,
                    unit_no: match.unit_no,
                    shed_code: match.shed_code
                });
            } else {
                unmatched++;
            }
        }

        res.json({
            success: true,
            total: events.length,
            matched,
            unmatched,
            matches: results.slice(0, 20) // Return first 20 for display
        });
    } catch (err) {
        console.error('[AWS /match-rakes] Error:', err);
        res.status(500).json({ error: 'Rake matching failed' });
    }
});

// ── GET /unmatched-rakes ───────────────────────────────────────────────────
// Get distinct unmatched cab numbers for review
router.get('/unmatched-rakes', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        const [cabs] = await pool.query(
            `SELECT
                loco_raw,
                COUNT(*) as occurrence_count,
                GROUP_CONCAT(DISTINCT DATE_FORMAT(abn_date, '%d-%m') ORDER BY abn_date) as dates,
                GROUP_CONCAT(DISTINCT id) as event_ids
             FROM div_aws_events
             WHERE loco_raw IS NOT NULL
               AND loco_raw != ''
               AND matched_rake_id IS NULL
             GROUP BY loco_raw
             ORDER BY occurrence_count DESC`
        );

        res.json({ unmatched: cabs });
    } catch (err) {
        console.error('[AWS /unmatched-rakes] Error:', err);
        res.status(500).json({ error: 'Failed to load unmatched rakes' });
    }
});

// ── POST /match-all ────────────────────────────────────────────────────────
// Run both signal and rake matching in one call
router.post('/match-all', async (req, res) => {
    try {
        const pool = req.app.locals.pool;

        // 1. Signal matching — with the same route/direction context the upload
        // auto-match uses, so a signal that needs the trip to disambiguate it
        // (e.g. the UP vs DN copy of "KE IBS DIST") resolves here too.
        const [signalEvents] = await pool.query(
            `SELECT e.id, e.location_raw, e.train_number,
                    r.from_station, r.to_station, r.detail
             FROM div_aws_events e
             JOIN div_aws_cms_raw r ON r.id = e.raw_id
             WHERE e.location_type = 'SIGNAL'
               AND e.location_raw IS NOT NULL
               AND e.location_raw != ''
               AND e.signal_id IS NULL`
        );

        let signalsMatched = 0;
        for (const event of signalEvents) {
            const sections  = await routeSectionsForEvent(pool, event.from_station, event.to_station, event.train_number);
            const direction = await directionForEvent(pool, event);
            const match = await matchSignalFromDb(pool, event.location_raw, { sections, direction });
            if (match.signal_id) {
                await pool.query(
                    `UPDATE div_aws_events
                     SET signal_id = ?, signal_match_confidence = ?, location_raw = ?, normalized_location = ?
                     WHERE id = ?`,
                    [match.signal_id, match.confidence, match.signal_number, normalizeForSignalMatch(event.location_raw), event.id]
                );
                signalsMatched++;
            } else {
                await pool.query(
                    `UPDATE div_aws_events SET normalized_location = ? WHERE id = ?`,
                    [normalizeForSignalMatch(event.location_raw), event.id]
                );
            }
        }

        // 2. Rake matching
        const [rakeEvents] = await pool.query(
            `SELECT id, loco_raw
             FROM div_aws_events
             WHERE loco_raw IS NOT NULL
               AND loco_raw != ''
               AND matched_rake_id IS NULL`
        );

        let rakesMatched = 0;
        for (const event of rakeEvents) {
            const match = await matchRakeFromDb(pool, event.loco_raw);
            if (match.rake_id) {
                await pool.query(
                    `UPDATE div_aws_events SET matched_coach_id = ?, matched_rake_id = ? WHERE id = ?`,
                    [match.coach_id, match.rake_id, event.id]
                );
                rakesMatched++;
            }
        }

        res.json({
            success: true,
            signals: { total: signalEvents.length, matched: signalsMatched },
            rakes: { total: rakeEvents.length, matched: rakesMatched }
        });
    } catch (err) {
        console.error('[AWS /match-all] Error:', err);
        res.status(500).json({ error: 'Matching failed' });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 7: JPO Classification (responsibility = S&T / CAB / TRANSIENT)
// ══════════════════════════════════════════════════════════════════════════
//
// Rules from AWS JPO (No.BB.TRSO.EMU.16, dated 07-03-2007), applied in
// priority order. Each event's `responsibility` column is set to the first
// rule that matches; rule 3 explicitly excludes events already classified
// by rules 1 or 2 (per JPO text "excluding 1 & 2 above").
//
//   Rule 1 (per trip)  — >2 events on consecutive signals AND ≥3 in trip
//                        on same cab → CAB defect.
//                        Adjacency comes from: seq_order ±1 within a
//                        (section,line,direction) partition, an explicit
//                        edge in div_signal_successors (either direction),
//                        or a shared parallel_group_id. A trip is one
//                        (cab, abn_date); events ordered by abn_time then
//                        seq_order. A trip with ≥3 events AND ≥2 of them on
//                        consecutive signals flags the whole trip CAB_SIDE.
//   Rule 2 (per day)   — >2 events on same signal in same day → S&T defect.
//   Rule 3a (per week) — >3 events on same cab in same Fri–Thu week,
//                        excluding rule-1 hits → CAB defect.
//   Rule 3b (per week) — ≥3 events on same magnet (signal) in same Fri–Thu week,
//                        excluding rule-2 hits → S&T defect.
//   Rule 4             — everything else → TRANSIENT.
//
// ── Helper: are two signals consecutive in running order? ───────────────────
// meta: Map signalId -> { section, line, direction, seq, group }
// succSet: Set of "fromId-toId" successor edges (undirected lookup — both
//          orientations are inserted when the set is built).
// Normalize a train number for matching against the `trains` timetable:
// strip spaces and / . - punctuation, upper-case. Mirrors the SQL
// REGEXP_REPLACE used when the schedule map is built so "BL/34", "KP7" and
// "AN.23" line up with their timetable rows.
function normalizeTrainNumber(text) {
    if (!text) return '';
    return String(text).toUpperCase().replace(/[\s/.\-]+/g, '');
}

// Resolve the SERVICE DATE (operating day) of an AWS event. A "trip" is one
// run of a service; its events are grouped by (train_number, service_date).
// Overnight services (a leg whose scheduled arrival is before its departure)
// carry a post-midnight tail: an event timed at/below that train's early
// morning arrival cutoff belongs to the PREVIOUS calendar date's run. Daytime
// services always map to their own date. Derived from the timetable, so it is
// immune to the fixed-cutoff (splits a trip crossing the cutoff) and gap
// threshold (breaks under en-route delays) pitfalls.
function serviceDateOf(abnDate, abnTime, trainInfo) {
    const ymd = abnDate instanceof Date
        ? abnDate.toISOString().slice(0, 10)
        : String(abnDate).slice(0, 10);
    const t = abnTime ? String(abnTime) : null;
    if (trainInfo && trainInfo.hasWrap && trainInfo.morningCutoff && t && t <= trainInfo.morningCutoff) {
        const d = new Date(ymd + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - 1);
        return d.toISOString().slice(0, 10);
    }
    return ymd;
}

function signalsAreConsecutive(aId, bId, meta, succSet) {
    if (!aId || !bId || aId === bId) return false;

    // Explicit successor edge (either direction)
    if (succSet.has(`${aId}-${bId}`) || succSet.has(`${bId}-${aId}`)) return true;

    const a = meta.get(aId);
    const b = meta.get(bId);
    if (!a || !b) return false;

    // Same parallel group = alternates at one position (treat as adjacent)
    if (a.group != null && a.group === b.group) return true;

    // Adjacent in the same partition's running sequence
    if (a.section === b.section && a.line === b.line && a.direction === b.direction
        && a.seq != null && b.seq != null
        && Math.abs(a.seq - b.seq) === 1) return true;

    return false;
}

// ── Helper: longest run of events on consecutive signals within a trip ──────
// Events are sorted by (abn_time, seq_order). Walks adjacent pairs; a pair on
// genuinely adjacent DISTINCT signals extends the run, anything else resets it.
// Returns { length, signals } for the best run found.
function longestConsecutiveRun(tripEvents, meta, succSet) {
    const sorted = [...tripEvents].sort((x, y) => {
        const tx = x.abn_time || '';
        const ty = y.abn_time || '';
        if (tx !== ty) return tx < ty ? -1 : 1;
        const sx = meta.get(x.signal_id)?.seq ?? Number.MAX_SAFE_INTEGER;
        const sy = meta.get(y.signal_id)?.seq ?? Number.MAX_SAFE_INTEGER;
        return sx - sy;
    });

    let best = { length: sorted.length ? 1 : 0, signals: sorted.length ? [sorted[0].signal_id] : [] };
    let curLen = 1;
    let curSignals = sorted.length ? [sorted[0].signal_id] : [];

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1].signal_id;
        const cur  = sorted[i].signal_id;
        if (signalsAreConsecutive(prev, cur, meta, succSet)) {
            curLen++;
            curSignals.push(cur);
        } else {
            curLen = 1;
            curSignals = [cur];
        }
        if (curLen > best.length) best = { length: curLen, signals: [...curSignals] };
    }
    return best;
}

// ── POST /classify-period ──────────────────────────────────────────────────
router.post('/classify-period', async (req, res) => {
    const pool = req.app.locals.pool;
    const from = req.body?.from;
    const to   = req.body?.to;

    if (!from || !to) {
        return res.status(400).json({ error: 'from and to dates required (YYYY-MM-DD)' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Step 0: reset all events in window to NOT_DETERMINED. This makes
        // the endpoint idempotent — re-running re-applies rules from scratch.
        const [resetRes] = await conn.execute(
            `UPDATE div_aws_events
             SET responsibility = 'NOT_DETERMINED', root_cause = NULL
             WHERE abn_date BETWEEN ? AND ?`,
            [from, to]
        );

        // Rule 1 — per trip, ≥3 events on consecutive signals on the same cab.
        // Build adjacency inputs, group window events into trips (cab + date),
        // and flag any trip with a consecutive-signal run of ≥3 events.
        let rule1Count = 0;
        const rule1Trips = [];
        {
            // Signal metadata for adjacency
            const [sigRows] = await conn.query(
                `SELECT id, section, \`line\` AS line, direction, seq_order AS seq, parallel_group_id AS grp
                 FROM div_signals`
            );
            const meta = new Map();
            for (const s of sigRows) {
                meta.set(s.id, { section: s.section, line: s.line, direction: s.direction, seq: s.seq, group: s.grp });
            }

            // Successor edges (only fully-resolved ones are usable)
            const [edgeRows] = await conn.query(
                `SELECT from_signal_id AS f, to_signal_id AS t
                 FROM div_signal_successors
                 WHERE from_signal_id IS NOT NULL AND to_signal_id IS NOT NULL`
            );
            const succSet = new Set();
            for (const e of edgeRows) {
                succSet.add(`${e.f}-${e.t}`);
                succSet.add(`${e.t}-${e.f}`);
            }

            // Timetable digest for trip grouping. Each `trains` row is one leg;
            // legs sharing a (normalized) train_number make one trip. has_wrap
            // flags overnight services; morning_cutoff is the latest scheduled
            // arrival before 06:00 (the post-midnight tail) used to roll early
            // events back to the departure date.
            const [trainRows] = await conn.query(
                `SELECT UPPER(REGEXP_REPLACE(train_number,'[[:space:]/.-]','')) AS ntn,
                        MAX(end_time < start_time)                         AS has_wrap,
                        MAX(CASE WHEN end_time < '06:00:00' THEN end_time END) AS morning_cutoff
                 FROM trains
                 WHERE train_number IS NOT NULL AND train_number <> ''
                 GROUP BY ntn`
            );
            const schedule = new Map();
            for (const r of trainRows) {
                schedule.set(r.ntn, {
                    hasWrap: Number(r.has_wrap) === 1,
                    morningCutoff: r.morning_cutoff != null ? String(r.morning_cutoff) : null
                });
            }

            // Window events with a matched signal. cab_key is a fallback
            // identity for events whose train_number is missing/non-service.
            const [evRows] = await conn.query(
                `SELECT id, signal_id, abn_date, abn_time, train_number,
                        COALESCE(matched_coach_id, matched_rake_id) AS cab_key
                 FROM div_aws_events
                 WHERE abn_date BETWEEN ? AND ?
                   AND signal_id IS NOT NULL`,
                [from, to]
            );

            // Group into trips: (train_number, service_date). service_date comes
            // from the timetable so overnight runs (dep 22:47 → arr 01:27 next
            // date) stay one trip. Fall back to (cab, service_date) when there
            // is no usable train number.
            const trips = new Map();
            for (const ev of evRows) {
                const ntn = normalizeTrainNumber(ev.train_number);
                const svcDate = serviceDateOf(ev.abn_date, ev.abn_time, ntn ? schedule.get(ntn) : null);
                const tripKey = ntn
                    ? `T:${ntn}|${svcDate}`
                    : (ev.cab_key != null ? `C:${ev.cab_key}|${svcDate}` : null);
                if (!tripKey) continue;                       // no identity → cannot form a trip
                if (!trips.has(tripKey)) trips.set(tripKey, []);
                trips.get(tripKey).push(ev);
            }

            // JPO Rule 1: cab defect when, in one trip, AWS acted ≥3 times (C2)
            // AND ≥2 of them fell on consecutive signals (C1). The 3 need not
            // themselves be consecutive.
            const rule1EventIds = [];
            for (const [key, events] of trips) {
                if (events.length < 3) continue;             // C2: ≥3 acts in the trip
                const run = longestConsecutiveRun(events, meta, succSet);
                if (run.length >= 2) {                       // C1: ≥2 on consecutive signals
                    events.forEach((e) => rule1EventIds.push(e.id));
                    rule1Trips.push({ trip: key, events: events.length, run: run.length });
                }
            }

            if (rule1EventIds.length > 0) {
                const placeholders = rule1EventIds.map(() => '?').join(',');
                const [r1] = await conn.execute(
                    `UPDATE div_aws_events
                     SET responsibility = 'CAB_SIDE',
                         root_cause     = 'JPO Rule 1: >=3 on consecutive signals in one trip'
                     WHERE id IN (${placeholders})
                       AND responsibility = 'NOT_DETERMINED'`,
                    rule1EventIds
                );
                rule1Count = r1.affectedRows;
            }
        }

        // Rule 2 — per day, per MAGNET (not raw signal_id), count > 2 → S&T.
        // Counting by div_signals.magnet_id so a physical magnet stored as
        // several per-section rows (junction/divert signals) isn't split.
        const [rule2Res] = await conn.execute(
            `UPDATE div_aws_events e
             JOIN div_signals es ON es.id = e.signal_id
             JOIN (
                 SELECT ds.magnet_id AS mid, ev.abn_date AS d
                 FROM div_aws_events ev
                 JOIN div_signals ds ON ds.id = ev.signal_id
                 WHERE ev.abn_date BETWEEN ? AND ?
                   AND ev.signal_id IS NOT NULL
                 GROUP BY ds.magnet_id, ev.abn_date
                 HAVING COUNT(*) > 2
             ) flagged
               ON flagged.mid = es.magnet_id
              AND flagged.d   = e.abn_date
             SET e.responsibility = 'S&T',
                 e.root_cause     = 'JPO Rule 2: >2/day on same signal'
             WHERE e.abn_date BETWEEN ? AND ?
               AND e.signal_id IS NOT NULL
               AND e.responsibility = 'NOT_DETERMINED'`,
            [from, to, from, to]
        );

        // The AWS review "week" runs Friday → Thursday (review meetings are on
        // Fridays), NOT the ISO Mon–Sun week. This expression maps a date to the
        // Friday that starts its week, so weekly grouping matches the meeting
        // cycle. (DAYOFWEEK: Sun=1..Sat=7; Friday=6 → offset 0.)
        const fridayWeek = (col) => `DATE_SUB(${col}, INTERVAL ((DAYOFWEEK(${col}) + 1) % 7) DAY)`;

        // Rule 3b — per (Fri–Thu) week, per signal (magnet), count ≥ 3 → S&T
        // (excludes already-classified rule-2 events via responsibility filter)
        const [rule3bRes] = await conn.execute(
            `UPDATE div_aws_events e
             JOIN div_signals es ON es.id = e.signal_id
             JOIN (
                 SELECT ds.magnet_id AS mid, ${fridayWeek('ev.abn_date')} AS wk
                 FROM div_aws_events ev
                 JOIN div_signals ds ON ds.id = ev.signal_id
                 WHERE ev.abn_date BETWEEN ? AND ?
                   AND ev.signal_id IS NOT NULL
                   AND ev.responsibility = 'NOT_DETERMINED'
                 GROUP BY ds.magnet_id, ${fridayWeek('ev.abn_date')}
                 HAVING COUNT(*) >= 3
             ) flagged
               ON flagged.mid = es.magnet_id
              AND ${fridayWeek('e.abn_date')} = flagged.wk
             SET e.responsibility = 'S&T',
                 e.root_cause     = 'JPO Rule 3b: >=3/week on same magnet'
             WHERE e.abn_date BETWEEN ? AND ?
               AND e.signal_id IS NOT NULL
               AND e.responsibility = 'NOT_DETERMINED'`,
            [from, to, from, to]
        );

        // Rule 3a — per (Fri–Thu) week, per cab, count > 3 → CAB_SIDE.
        // Threshold is strictly > 3 (i.e. ≥4): the JPO text "more than three
        // times or more on any cab" is garbled; confirmed with the division as
        // > 3, deliberately NOT ≥3 (which is the magnet rule). Do not change to >=3.
        // Cab identity = matched_coach_id when present, else matched_rake_id.
        // (excludes already-classified rule-1 events via responsibility filter,
        //  once rule 1 is implemented; rule 2 events are signal-side and don't
        //  collide with the per-cab key here.)
        const [rule3aRes] = await conn.execute(
            `UPDATE div_aws_events e
             JOIN (
                 SELECT COALESCE(matched_coach_id, matched_rake_id) AS cab_key,
                        ${fridayWeek('abn_date')} AS wk
                 FROM div_aws_events
                 WHERE abn_date BETWEEN ? AND ?
                   AND COALESCE(matched_coach_id, matched_rake_id) IS NOT NULL
                   AND responsibility = 'NOT_DETERMINED'
                 GROUP BY COALESCE(matched_coach_id, matched_rake_id), ${fridayWeek('abn_date')}
                 HAVING COUNT(*) > 3
             ) flagged
               ON COALESCE(e.matched_coach_id, e.matched_rake_id) = flagged.cab_key
              AND ${fridayWeek('e.abn_date')} = flagged.wk
             SET e.responsibility = 'CAB_SIDE',
                 e.root_cause     = 'JPO Rule 3a: >3/week on same cab'
             WHERE e.abn_date BETWEEN ? AND ?
               AND COALESCE(e.matched_coach_id, e.matched_rake_id) IS NOT NULL
               AND e.responsibility = 'NOT_DETERMINED'`,
            [from, to, from, to]
        );

        // Rule 4 — everything still NOT_DETERMINED → TRANSIENT
        const [rule4Res] = await conn.execute(
            `UPDATE div_aws_events
             SET responsibility = 'TRANSIENT',
                 root_cause     = 'JPO Rule 4: transient (no rule matched)'
             WHERE abn_date BETWEEN ? AND ?
               AND responsibility = 'NOT_DETERMINED'`,
            [from, to]
        );

        await conn.commit();

        res.json({
            success: true,
            from,
            to,
            total_in_window: resetRes.affectedRows,
            rule1_consecutive_trip_cab: rule1Count,
            rule2_per_day_signal:       rule2Res.affectedRows,
            rule3a_per_week_cab:        rule3aRes.affectedRows,
            rule3b_per_week_magnet:     rule3bRes.affectedRows,
            rule4_transient:            rule4Res.affectedRows,
            rule1_trips:                rule1Trips,
            notes: null
        });
    } catch (err) {
        await conn.rollback();
        console.error('[AWS /classify-period] Error:', err);
        res.status(500).json({ error: 'Classification failed', detail: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
// Exposed for the recode CLI (scripts/aws-recode.js) so it reuses the exact
// parser instead of duplicating the regexes.
module.exports.extractAwsCode = extractAwsCode;
module.exports.extractLocation = extractLocation;
module.exports.matchSignalFromDb = matchSignalFromDb;
module.exports.normalizeForSignalMatch = normalizeForSignalMatch;
module.exports.routeSectionsForEvent = routeSectionsForEvent;
module.exports.directionForEvent = directionForEvent;
module.exports.tripDirection = tripDirection;
module.exports.isAwsCandidate = isAwsCandidate;
module.exports.isEmuLobby = isEmuLobby;
module.exports.matchRakeFromDb = matchRakeFromDb;
module.exports.isMultiAwsEvent = isMultiAwsEvent;
module.exports.extractBareAutoNumber = extractBareAutoNumber;
module.exports.resolveBareAutoSignal = resolveBareAutoSignal;
module.exports.resolveBareSignalForRow = resolveBareSignalForRow;
module.exports.splitAwsEvents = splitAwsEvents;
module.exports.resolveActLocation = resolveActLocation;
module.exports.insertEventsForRaw = insertEventsForRaw;
