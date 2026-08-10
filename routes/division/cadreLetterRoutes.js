/**
 * cadreLetterRoutes.js — Cadre Management (HQ CLI cadre desk letters)
 * Mounted at /api/division/cadre-letters
 *
 * The cadre desk's inter-departmental correspondence: transfers, postings,
 * training deputations, panel/vacancy requests and one-off letters, addressed
 * to Sr.DPO / DRM(P) / ZRTI/BSL / Dy.CEE(OP) / MTC-DTC KYN / "ALL CONCERNED".
 *
 * Letter TYPES are seeded data (div_cadre_letter_types), not code — a type
 * carries the addressee, subject, body template and a JSON column schema, and
 * every one of those is copied onto the letter so editing a type never
 * rewrites a letter already written.
 *
 * Lifecycle: draft → finalized. Finalizing renders the letter to a complete
 * A4 HTML page and files it into div_documents as source_type='composed'
 * (category CADRE_LETTER, folder = family). NOT a pdfkit PDF — pdfkit cannot
 * render Devanagari and these letters are Devanagari in the letterhead,
 * addressee and signature. See utils/cadreLetterHtml.js.
 *
 * Unlike transferLetterRoutes this module routes NOTHING inside the portal —
 * no receiver, no div_transfer_requests. Prepare, print, archive.
 *
 *   GET    /config             user + the full type catalogue, grouped by family
 *   GET    /types/:code        one type's defaults + schemas
 *   GET    /next-number        suggested letter number (editable)
 *   GET    /search-staff/:q    division-wide staff picker
 *   GET    /                   letters list (?family=&type_code=&status=&q=&from=&to=)
 *   GET    /:id                letter + staff rows
 *   POST   /                   create/update draft
 *   POST   /:id/finalize       render + file into div_documents, lock
 *   POST   /:id/unfinalize     admin-only: back to draft, remove filed document
 *   DELETE /:id                delete draft
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');

const { renderCadreLetterPage, renderCadreLetterWord, letterSubject, shortDesignation } = require('../../utils/cadreLetterHtml');

// The ZRTI list arrives as a workbook attachment. Held in memory only — it is
// parsed into rows and thrown away; nothing is written to disk.
const sheetUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
const SHEET_EXT = /\.(xlsx|xlsm|xls|csv)$/i;
const MAX_SHEET_ROWS = 500;

// ── Access ─────────────────────────────────────────────────────────────────
// Cadre letters are an HQ-level function, not a per-lobby one, so unlike
// transfer letters there is no office lock: any division user may prepare
// one. Unfinalizing a filed letter stays admin-only.

const requireDivisionAccess = (req, res, next) => {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const isAdmin = (req) => req.session.user?.div_role === 'division_admin';

async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

/* Letter number.
 * Agreed shape: BB.TRSO.TECH.04 → sub-series (promotion/transfer/misc/…) →
 * day-wise serial. The exact format is still being settled by the cadre desk,
 * so it lives HERE, in one place, and the field stays editable on the page.
 * Change this function and nothing else moves. */
const LETTER_NO_BASE = 'BB.TRSO.TECH.04';

function buildLetterNo(series, dateStr, serial) {
    const d = new Date(dateStr);
    const p = (n) => String(n).padStart(2, '0');
    const ddmmyy = `${p(d.getDate())}${p(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}`;
    const s = (series || 'MISC').toUpperCase();
    return `${LETTER_NO_BASE}/${s}/${ddmmyy}/${String(serial).padStart(2, '0')}`;
}

// JSON columns come back parsed from mysql2; accept strings too so the same
// helper works on request bodies.
function asJson(v) {
    if (v == null) return null;
    if (typeof v === 'object') return v;
    try { return JSON.parse(v); } catch (e) { return null; }
}
function toJsonCol(v) {
    if (v == null) return null;
    return typeof v === 'string' ? v : JSON.stringify(v);
}

// ── GET /config ────────────────────────────────────────────────────────────

router.get('/config', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [types] = await conn.query(
            `SELECT type_code, type_name, family, doc_kind, staff_source, letter_series,
                    banner_text, IF(table_schema IS NULL, 0, 1) AS has_table,
                    IF(aux_schema IS NULL, 0, 1) AS has_aux, sort_order
               FROM div_cadre_letter_types
              WHERE is_active = 1
              ORDER BY family, sort_order`
        );
        const families = {};
        for (const t of types) (families[t.family] = families[t.family] || []).push(t);

        // Lobby suggestions for the lobby columns. Letters print the SHORT name
        // ("CSMT", "KYN", "PNVL"), not the office code ("CSMT-ML", "CSMT-SUB"),
        // so the -ML/-SUB suffix is dropped and the result deduped. Lobbies
        // already typed on earlier letters are folded in, which is how a name
        // no table knows about ("CSMT Layer-1") becomes a suggestion once used.
        // These are SUGGESTIONS, never a closed list — the field stays free text.
        const [offices] = await conn.query(
            `SELECT DISTINCT TRIM(SUBSTRING_INDEX(office_code, '-', 1)) AS lobby
               FROM offices
              WHERE is_active = 1 AND office_code <> 'OTHER'`
        );
        const [used] = await conn.query(
            `SELECT DISTINCT lobby FROM (
                SELECT proposed_lobby AS lobby FROM div_cadre_letter_staff
                UNION SELECT present_lobby FROM div_cadre_letter_staff
             ) x WHERE lobby IS NOT NULL AND lobby <> ''`
        );
        const lobbies = [...new Set([...offices, ...used].map((r) => r.lobby).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b));

        res.json({
            user: {
                username: req.session.user.username,
                full_name: req.session.user.full_name,
                div_role: req.session.user.div_role,
                office_code: req.session.user.div_office_code,
                is_admin: isAdmin(req),
            },
            families,
            types,
            lobbies,
        });
    } catch (error) {
        console.error('cadre-letters /config error:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    } finally {
        if (conn) conn.release();
    }
});

// ── POST /parse-sheet — read an uploaded .xlsx/.csv into rows ─────────────
//
// The ZRTI/BSL list usually arrives as a workbook, so the CLI should be able to
// drop the file in rather than copy-paste out of it. This returns the raw grid;
// the client maps columns with the same preview the paste flow uses, so the two
// entry paths cannot drift apart.
//
// Cells are read FORMATTED, not raw: a PF number like "0350100" is text on the
// sheet and must not come back as the number 350100 with its leading zero lost.

router.post('/parse-sheet', requireDivisionAccess, sheetUpload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file was received.' });
    if (!SHEET_EXT.test(req.file.originalname || '')) {
        return res.status(400).json({ error: 'Only .xlsx, .xls, .xlsm or .csv files can be read.' });
    }
    try {
        const wb = XLSX.read(req.file.buffer, { type: 'buffer', raw: false, cellDates: false });
        if (!wb.SheetNames.length) return res.status(400).json({ error: 'That workbook has no sheets.' });

        const sheet = wb.SheetNames.includes(req.body.sheet) ? req.body.sheet : wb.SheetNames[0];
        const rows = XLSX.utils
            .sheet_to_json(wb.Sheets[sheet], { header: 1, blankrows: false, defval: '', raw: false })
            .map((r) => r.map((c) => String(c == null ? '' : c).trim()))
            .filter((r) => r.some((c) => c !== ''));

        if (!rows.length) return res.status(400).json({ error: `Sheet "${sheet}" is empty.` });

        res.json({
            sheets: wb.SheetNames,
            sheet,
            filename: req.file.originalname,
            rows: rows.slice(0, MAX_SHEET_ROWS),
            total: rows.length,
            truncated: rows.length > MAX_SHEET_ROWS,
        });
    } catch (error) {
        console.error('cadre-letters /parse-sheet error:', error);
        res.status(400).json({ error: 'That file could not be read as a spreadsheet.' });
    }
});

// ── GET /:id/word — download the letter as a Word document ───────────────
//
// The cadre desk wrote these in Word before this module existed, and will still
// want to hand-adjust one occasionally. Same renderer as the print and archive
// paths, wrapped for Word — see renderCadreLetterWord().

router.get('/:id/word', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [[letter]] = await conn.query(
            `SELECT *, DATE_FORMAT(letter_date, '%Y-%m-%d') AS letter_date
               FROM div_cadre_letters WHERE id = ?`, [req.params.id]);
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        const [staff] = await conn.query(
            `SELECT * FROM div_cadre_letter_staff WHERE letter_id = ? ORDER BY sr_no`,
            [req.params.id]);

        letter.table_columns = asJson(letter.table_columns);
        letter.aux_data = asJson(letter.aux_data);
        letter.tokens = asJson(letter.tokens) || {};

        // Filename from the letter number, which contains slashes.
        const base = String(letter.letter_no || ('cadre-letter-' + letter.id))
            .replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
        res.setHeader('Content-Type', 'application/msword; charset=utf-8');
        res.setHeader('Content-Disposition',
            `attachment; filename="${base}.doc"; filename*=UTF-8''${encodeURIComponent(base)}.doc`);
        // No UTF-8 BOM. It is not needed — the meta charset and the
        // Content-Type both declare the encoding — and it actively hurts:
        // a leading BOM makes HTML sniffing fail, so the file opens as
        // plain text showing raw markup instead of as a document.
        res.send(renderCadreLetterWord(letter, staff));
    } catch (error) {
        console.error('cadre-letters /:id/word error:', error);
        res.status(500).json({ error: 'Failed to build the Word file' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /staff-by-pf/:pf — one staff member, for autofill ─────────────────
//
// The seniority-verification letter names one employee inline in its body
// ("received from Shri X, LPG, PF No. 00211047471, working at CSMT Lobby"), and
// the transfer letters list PF numbers the CLI already has on paper. Typing the
// PF and having the rest appear beats copying four fields by hand — and it is
// the division's own record rather than a retyped one.
//
// Matched ignoring leading zeros: the letters print "00211047471" but a CLI
// reading off a list may well type "211047471", and both must find the person.
// pf_number is effectively unique (3,695 distinct of 3,697 rows) though NOT
// uniquely indexed, so this deliberately reports how many matched instead of
// silently taking the first.

// ── GET /staff-by-pf/:pf — one staff member, for autofill ─────────────────
//
// The seniority-verification letter names one employee inline in its body
// ("received from Shri X, LPG, PF No. 00211047471, working at CSMT Lobby"), and
// the transfer letters list PF numbers the CLI already has on paper. Typing the
// PF and having the rest appear beats copying four fields by hand.
//
// Matching has to be forgiving, because div_staff_master does NOT store PF
// numbers in one shape. Lengths run 6 to 13; most are 11 digits with leading
// zeros ("00229816985") but 60 are 7 digits, 23 are 8, one carries a hyphen
// ("0021-11048293") and two contain letters ("207CB0850"). The real case that
// exposed this: the letter prints 00211047471 and the master stores 11047471
// for the same person — the "002" prefix is simply absent.
//
// So three tiers, reported so the caller knows which one hit:
//   exact       the string as stored
//   normalised  digits only, leading zeros dropped, equal
//   partial     one is a suffix of the other, minimum 8 digits
//
// Partial matching is NOT safe on its own: 9 groups of staff share their last
// 8 digits. Every match is returned with a count so the caller can refuse to
// guess rather than quietly picking the first.

router.get('/staff-by-pf/:pf', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        const raw = String(req.params.pf || '').trim();
        if (!raw) return res.status(400).json({ error: 'No PF number given.' });
        // digits only, leading zeros dropped — the comparable core of a PF
        const norm = raw.replace(/[^0-9]/g, '').replace(/^0+/, '');
        if (!norm) return res.status(400).json({ error: 'That is not a PF number.' });

        conn = await getConnection(req);
        const [rows] = await conn.query(
            `SELECT s.hrms_id, s.pf_number, s.name, s.current_cms_id,
                    s.current_office_code, d.designation_name,
                    CASE
                      WHEN s.pf_number = ?                       THEN 'exact'
                      WHEN TRIM(LEADING '0' FROM REGEXP_REPLACE(s.pf_number, '[^0-9]', '')) = ?                           THEN 'normalised'
                      ELSE 'partial'
                    END AS match_type
               FROM div_staff_master s
               LEFT JOIN designations d ON d.id = s.designation_id
              WHERE s.status = 'Active'
                AND (
                     s.pf_number = ?
                  OR TRIM(LEADING '0' FROM REGEXP_REPLACE(s.pf_number, '[^0-9]', '')) = ?
                  OR (CHAR_LENGTH(?) >= 8 AND TRIM(LEADING '0' FROM REGEXP_REPLACE(s.pf_number, '[^0-9]', '')) <> ''
                      AND (TRIM(LEADING '0' FROM REGEXP_REPLACE(s.pf_number, '[^0-9]', '')) LIKE CONCAT('%', ?) OR ? LIKE CONCAT('%', TRIM(LEADING '0' FROM REGEXP_REPLACE(s.pf_number, '[^0-9]', '')))))
                )
              ORDER BY FIELD(match_type,'exact','normalised','partial'), s.hrms_id
              LIMIT 5`,
            [raw, norm, raw, norm, norm, norm, norm]
        );
        if (!rows.length) return res.status(404).json({ error: 'No active staff with that PF number.' });

        const shape = (s) => ({
            hrms_id: s.hrms_id,
            pf_number: s.pf_number,
            name: s.name,
            cms_id: s.current_cms_id,
            designation: s.designation_name || '',
            designation_short: shortDesignation(s.designation_name),
            office_code: s.current_office_code,
            lobby: String(s.current_office_code || '').split('-')[0],
            match_type: s.match_type,
        });
        res.json({
            matches: rows.length,
            match_type: rows[0].match_type,
            staff: shape(rows[0]),
            all: rows.map(shape),
        });
    } catch (error) {
        console.error('cadre-letters /staff-by-pf error:', error);
        res.status(500).json({ error: 'Lookup failed' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /types/:code — full defaults for seeding a new letter ─────────────

router.get('/types/:code', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [[type]] = await conn.query(
            'SELECT * FROM div_cadre_letter_types WHERE type_code = ? AND is_active = 1',
            [req.params.code]
        );
        if (!type) return res.status(404).json({ error: 'Unknown letter type' });
        type.table_schema = asJson(type.table_schema);
        type.aux_schema = asJson(type.aux_schema);
        res.json({ type });
    } catch (error) {
        console.error('cadre-letters /types error:', error);
        res.status(500).json({ error: 'Failed to load letter type' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /next-number ───────────────────────────────────────────────────────

router.get('/next-number', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        const series = req.query.series || 'misc';
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        conn = await getConnection(req);
        // Day-wise serial: how many letters this series already has on this date.
        const [[row]] = await conn.query(
            `SELECT COUNT(*) AS n FROM div_cadre_letters
              WHERE letter_date = ? AND IFNULL(letter_series,'misc') = ?`,
            [date, series]
        );
        res.json({ letter_no: buildLetterNo(series, date, row.n + 1) });
    } catch (error) {
        console.error('cadre-letters /next-number error:', error);
        res.status(500).json({ error: 'Failed to build a letter number' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /search-staff/:query ───────────────────────────────────────────────
// Division-wide on purpose: a cadre letter routinely lists staff across
// CSMT/KYN/PNVL/LNL/IGP in one table. ?office_code= narrows it optionally.

router.get('/search-staff/:query', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const like = `%${req.params.query}%`;
        const pre = `${req.params.query}%`;
        const officeCode = req.query.office_code || null;
        const [rows] = await conn.query(
            `SELECT s.hrms_id, s.pf_number, s.name, s.current_cms_id,
                    s.current_office_code, d.designation_name
               FROM div_staff_master s
               LEFT JOIN designations d ON s.designation_id = d.id
              WHERE s.status = 'Active'
                AND (? IS NULL OR s.current_office_code = ?)
                AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ? OR s.current_cms_id LIKE ?)
              ORDER BY (s.name LIKE ? OR s.pf_number LIKE ? OR s.current_cms_id LIKE ?) DESC, s.name
              LIMIT 40`,
            [officeCode, officeCode, like, like, like, like, pre, pre, pre]
        );
        res.json({ staff: rows });
    } catch (error) {
        console.error('cadre-letters /search-staff error:', error);
        res.status(500).json({ error: 'Search failed' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET / — letters list ───────────────────────────────────────────────────

router.get('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const where = [];
        const params = [];
        if (req.query.family) { where.push('t.family = ?'); params.push(req.query.family); }
        if (req.query.type_code) { where.push('l.type_code = ?'); params.push(req.query.type_code); }
        if (req.query.status) { where.push('l.status = ?'); params.push(req.query.status); }
        if (req.query.from) { where.push('l.letter_date >= ?'); params.push(req.query.from); }
        if (req.query.to) { where.push('l.letter_date <= ?'); params.push(req.query.to); }
        if (req.query.q) {
            // Search the letter itself, and the names/PF numbers on it.
            where.push(`(l.subject_text LIKE ? OR l.letter_no LIKE ? OR EXISTS (
                          SELECT 1 FROM div_cadre_letter_staff s
                           WHERE s.letter_id = l.id
                             AND (s.name LIKE ? OR s.pf_number LIKE ?)))`);
            const like = `%${req.query.q}%`;
            params.push(like, like, like, like);
        }
        const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

        const [rows] = await conn.query(
            `SELECT l.id, l.letter_no, l.letter_series,
                    DATE_FORMAT(l.letter_date, '%Y-%m-%d') AS letter_date,
                    l.type_code, t.type_name, t.family, l.doc_kind,
                    l.subject_text, l.total_staff, l.status, l.document_id,
                    l.created_by, l.created_at
               FROM div_cadre_letters l
               JOIN div_cadre_letter_types t ON t.type_code = l.type_code
             ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
              ORDER BY l.letter_date DESC, l.id DESC
              LIMIT ${limit}`,
            params
        );
        res.json({ letters: rows });
    } catch (error) {
        console.error('cadre-letters list error:', error);
        res.status(500).json({ error: 'Failed to load letters' });
    } finally {
        if (conn) conn.release();
    }
});

// ── GET /:id ───────────────────────────────────────────────────────────────

router.get('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { letter, staff, error } = await loadLetter(conn, req.params.id);
        if (error) return res.status(404).json({ error });
        res.json({ letter, staff });
    } catch (error) {
        console.error('cadre-letters get error:', error);
        res.status(500).json({ error: 'Failed to load the letter' });
    } finally {
        if (conn) conn.release();
    }
});

async function loadLetter(conn, id) {
    const [[letter]] = await conn.query(
        `SELECT l.*, DATE_FORMAT(l.letter_date, '%Y-%m-%d') AS letter_date,
                t.type_name, t.family
           FROM div_cadre_letters l
           JOIN div_cadre_letter_types t ON t.type_code = l.type_code
          WHERE l.id = ?`, [id]
    );
    if (!letter) return { error: 'Letter not found' };
    letter.table_columns = asJson(letter.table_columns);
    letter.aux_data = asJson(letter.aux_data);
    letter.tokens = asJson(letter.tokens) || {};
    const [staff] = await conn.query(
        `SELECT id, sr_no, staff_hrms_id, pf_number, name, designation,
                present_lobby, proposed_lobby, remarks, extra
           FROM div_cadre_letter_staff WHERE letter_id = ? ORDER BY sr_no, id`, [id]
    );
    staff.forEach((s) => { s.extra = asJson(s.extra) || {}; });
    return { letter, staff };
}

// ── POST / — create or update a draft ─────────────────────────────────────

const LETTER_FIELDS = [
    'letter_no', 'letter_series', 'letter_date', 'type_code', 'doc_kind',
    'staff_source', 'body_indent', 'page_margin', 'sig_gap', 'banner_text',
    'office_header_text', 'addressee_text', 'addressee_text_hi', 'subject_text',
    'ref_text', 'body_text', 'footer_text', 'encl_text', 'cc_text',
    'approval_chain_text', 'signing_designation', 'signing_designation_hindi',
    'signing_place',
];

router.post('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        const b = req.body || {};
        if (!b.type_code) return res.status(400).json({ error: 'type_code is required' });
        if (!b.letter_date) return res.status(400).json({ error: 'letter_date is required' });

        conn = await getConnection(req);
        const [[type]] = await conn.query(
            'SELECT type_code, doc_kind, staff_source, body_indent, page_margin, sig_gap, letter_series FROM div_cadre_letter_types WHERE type_code = ?',
            [b.type_code]
        );
        if (!type) return res.status(400).json({ error: 'Unknown letter type' });

        // doc_kind is NOT NULL and decides whether the NOTE approval chain
        // prints; staff_source is NOT NULL and decides whether the staff picker
        // is offered at all — never trust the client to have sent either. The
        // rest of the fields are seeded client-side from GET /types/:code and
        // may legitimately be cleared to empty, so they are NOT backfilled here.
        b.doc_kind = b.doc_kind || type.doc_kind || 'LETTER';
        b.staff_source = b.staff_source || type.staff_source || 'ROLL';
        // body_indent is NOT NULL and 0 is a meaningful value, so ?? not ||.
        b.body_indent = b.body_indent ?? type.body_indent ?? 1;
        b.page_margin = b.page_margin || type.page_margin || 'NORMAL';
        b.sig_gap = b.sig_gap ?? type.sig_gap ?? 18;
        b.letter_series = b.letter_series || type.letter_series || null;

        const staff = Array.isArray(b.staff) ? b.staff : [];
        const values = LETTER_FIELDS.map((f) => (b[f] === '' ? null : b[f] ?? null));
        const jsonVals = [toJsonCol(b.table_columns), toJsonCol(b.aux_data), toJsonCol(b.tokens)];

        await conn.beginTransaction();
        let letterId = b.id ? Number(b.id) : null;

        if (letterId) {
            const [[existing]] = await conn.query(
                'SELECT status FROM div_cadre_letters WHERE id = ? FOR UPDATE', [letterId]
            );
            if (!existing) { await conn.rollback(); return res.status(404).json({ error: 'Letter not found' }); }
            if (existing.status !== 'draft') {
                await conn.rollback();
                return res.status(409).json({ error: 'This letter is finalized and can no longer be edited.' });
            }
            await conn.query(
                `UPDATE div_cadre_letters SET ${LETTER_FIELDS.map((f) => `${f} = ?`).join(', ')},
                        table_columns = ?, aux_data = ?, tokens = ?, total_staff = ?
                  WHERE id = ?`,
                [...values, ...jsonVals, staff.length, letterId]
            );
            await conn.query('DELETE FROM div_cadre_letter_staff WHERE letter_id = ?', [letterId]);
        } else {
            const [result] = await conn.query(
                `INSERT INTO div_cadre_letters
                   (${LETTER_FIELDS.join(', ')}, table_columns, aux_data, tokens, total_staff, created_by)
                 VALUES (${LETTER_FIELDS.map(() => '?').join(', ')}, ?, ?, ?, ?, ?)`,
                [...values, ...jsonVals, staff.length, req.session.user.username]
            );
            letterId = result.insertId;
        }

        if (staff.length) {
            await conn.query(
                `INSERT INTO div_cadre_letter_staff
                   (letter_id, sr_no, staff_hrms_id, pf_number, name, designation,
                    present_lobby, proposed_lobby, remarks, extra)
                 VALUES ?`,
                [staff.map((s, i) => [
                    letterId, s.sr_no || i + 1, s.staff_hrms_id || null,
                    s.pf_number || null, s.name || null, s.designation || null,
                    s.present_lobby || null, s.proposed_lobby || null,
                    s.remarks || null, toJsonCol(s.extra),
                ])]
            );
        }

        await conn.commit();
        res.json({ success: true, id: letterId });
    } catch (error) {
        if (conn) { try { await conn.rollback(); } catch (e) { /* already rolled back */ } }
        console.error('cadre-letters save error:', error);
        res.status(500).json({ error: 'Failed to save the letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── POST /:id/finalize ────────────────────────────────────────────────────
// Renders the letter and files it into the documents repository as a composed
// document, then locks the letter. Transactional: if filing fails the letter
// stays a draft.

router.post('/:id/finalize', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { letter, staff, error } = await loadLetter(conn, req.params.id);
        if (error) return res.status(404).json({ error });
        if (letter.status === 'finalized') {
            return res.status(409).json({ error: 'This letter is already finalized.' });
        }
        if (!letter.letter_no) return res.status(400).json({ error: 'A letter number is required before finalizing.' });
        if (!letter.subject_text) return res.status(400).json({ error: 'A subject is required before finalizing.' });

        const html = renderCadreLetterPage(letter, staff);
        const title = letter.letter_no;
        // Resolve {{tokens}} — the stored subject is still a template, and this
        // string is what the Documents repository lists the letter under.
        const description = letterSubject(letter, staff);

        await conn.beginTransaction();
        const [doc] = await conn.query(
            `INSERT INTO div_documents
               (title, category, description, doc_date, folder, body_html,
                language, source_type, status, header, uploaded_by)
             VALUES (?, 'CADRE_LETTER', ?, ?, ?, ?, 'both', 'composed', 'final', ?, ?)`,
            [title, description, letter.letter_date, letter.family, html,
             JSON.stringify({ ref_no: letter.letter_no, type_code: letter.type_code }),
             req.session.user.username]
        );
        await conn.query(
            `UPDATE div_cadre_letters
                SET status = 'finalized', document_id = ?, finalized_at = NOW()
              WHERE id = ? AND status = 'draft'`,
            [doc.insertId, letter.id]
        );
        await conn.commit();

        res.json({ success: true, document_id: doc.insertId });
    } catch (error) {
        if (conn) { try { await conn.rollback(); } catch (e) { /* already rolled back */ } }
        console.error('cadre-letters finalize error:', error);
        res.status(500).json({ error: 'Failed to finalize the letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── POST /:id/unfinalize — admin only ─────────────────────────────────────

router.post('/:id/unfinalize', requireDivisionAccess, async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Only a division admin can reopen a filed letter.' });
    let conn;
    try {
        conn = await getConnection(req);
        const [[letter]] = await conn.query(
            'SELECT id, status, document_id FROM div_cadre_letters WHERE id = ?', [req.params.id]
        );
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (letter.status !== 'finalized') return res.status(409).json({ error: 'This letter is not finalized.' });

        await conn.beginTransaction();
        await conn.query(
            `UPDATE div_cadre_letters SET status = 'draft', document_id = NULL, finalized_at = NULL
              WHERE id = ?`, [letter.id]
        );
        if (letter.document_id) {
            // Composed documents have no file on disk — deleting the row is enough.
            await conn.query('DELETE FROM div_documents WHERE id = ? AND source_type = ?',
                [letter.document_id, 'composed']);
        }
        await conn.commit();
        res.json({ success: true });
    } catch (error) {
        if (conn) { try { await conn.rollback(); } catch (e) { /* already rolled back */ } }
        console.error('cadre-letters unfinalize error:', error);
        res.status(500).json({ error: 'Failed to reopen the letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── DELETE /:id — drafts only ─────────────────────────────────────────────

router.delete('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [[letter]] = await conn.query(
            'SELECT id, status, created_by FROM div_cadre_letters WHERE id = ?', [req.params.id]
        );
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (letter.status !== 'draft') {
            return res.status(409).json({ error: 'A finalized letter cannot be deleted. Reopen it first.' });
        }
        if (!isAdmin(req) && letter.created_by !== req.session.user.username) {
            return res.status(403).json({ error: 'You can only delete your own drafts.' });
        }
        await conn.query('DELETE FROM div_cadre_letters WHERE id = ?', [letter.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('cadre-letters delete error:', error);
        res.status(500).json({ error: 'Failed to delete the letter' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
