/**
 * transferLetterRoutes.js — Prepare Transfer Letter (inter-lobby staff transfers)
 * Mounted at /api/division/transfer-letters
 *
 * Uniform transfer letter (reference: tmp/transfer_letter_new_format.jpeg).
 * Lifecycle: draft → finalized (PDF auto-filed into the Documents repo,
 * category TRANSFER_LETTER, folder = sending lobby) → transferred (one
 * Pending div_transfer_requests row per staff, letter_id stamped, staff
 * appear in the receiving lobby's existing transfer inbox).
 *
 * Access: office_hr prepares for their own lobby only; division_admin for any.
 *
 *   GET    /config           user + offices + per-office defaults + categories
 *   GET    /next-number      auto letter number per office+year (editable)
 *   GET    /search-staff/:q  active staff of the sending lobby
 *   GET    /                 letters list (?office_code=&status=&limit=)
 *   GET    /:id              letter + staff rows
 *   POST   /                 create/update draft
 *   DELETE /:id              delete draft
 *   POST   /:id/finalize     render PDF (pdfkit) + file into div_documents
 *   POST   /:id/unfinalize   admin-only: back to draft, remove filed PDF
 *   POST   /:id/transfer     create Pending transfer requests (all-or-nothing)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const documentRoutes = require('./documentRoutes');
const { createPendingTransferRequest } = require('../../utils/transferRequests');
const { renderTransferLetterPdf } = require('../../utils/transferLetterPdf');

const UPLOAD_DIR = documentRoutes.UPLOAD_DIR;
const sanitize = documentRoutes.sanitize;

// ── Access helpers ─────────────────────────────────────────────────────────

const requireDivisionAccess = (req, res, next) => {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const isAdmin = (req) => req.session.user?.div_role === 'division_admin';

// office_hr users are locked to their own lobby as the SENDING office.
function assertOfficeAllowed(req, officeCode) {
    if (isAdmin(req)) return true;
    return !!officeCode && officeCode === req.session.user?.div_office_code;
}

async function getConnection(req) {
    return await req.app.locals.pool.getConnection();
}

// ── Letter defaults ────────────────────────────────────────────────────────

const CATEGORIES = ['Permanent Transfer', 'Promotion', 'Temporary Transfer'];
// Inter Railway is deliberately excluded: it auto-approves to office OTHER
// and never lands in a receiving lobby's inbox — incompatible with an
// inter-lobby letter.

const DEFAULT_BULLETS = [
    'Leave balance as per HRMS. CMS IDs will be transferred to your lobby.',
    'They have not submitted their Personnel stores/FRC/Duty card pass.',
].join('\n');

const DEFAULT_CC = 'C/- Sr.DEE (TRO)/CSMT for kind information please.';

const DEFAULT_FOOTER = 'Please report their arrival.';

const DEFAULT_BODY =
    'As per above Office Orders, the following staff of this depot are being ' +
    'transferred to your depot. They are advised to report to your office as ' +
    'per the reporting date mentioned against their names:';

// Per-office defaults are derived from the offices table — every value is
// editable on the form and stored on the letter row, so these only seed.
function officeDefaults(office) {
    const nameUpper = (office.office_name || office.office_code).toUpperCase();
    return {
        code: office.office_code,
        label: office.office_name,
        officeHeader: `SR. CREW CONTROLLER\n${nameUpper} LOBBY`,
        letterNoPrefix: `SR CC/TFR/${office.office_code}`,
        signingDesignation: 'Sr. Crew Controller',
        signingDesignationHindi: 'वरिष्ठ कर्मीदल नियंत्रक',
    };
}

// ── Config ─────────────────────────────────────────────────────────────────

router.get('/config', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [offices] = await conn.query(
            `SELECT office_code, office_name, office_type FROM offices
             WHERE is_active = 1 AND office_code <> 'OTHER'
             ORDER BY office_name`
        );
        res.json({
            user: {
                username: req.session.user.username,
                fullName: req.session.user.full_name,
                officeCode: req.session.user.div_office_code || null,
                isAdmin: isAdmin(req),
                canSwitchOffice: isAdmin(req),
            },
            offices: offices.map(officeDefaults),
            categories: CATEGORIES,
            defaults: {
                body: DEFAULT_BODY,
                bullets: DEFAULT_BULLETS,
                cc: DEFAULT_CC,
                footer: DEFAULT_FOOTER,
            },
        });
    } catch (error) {
        console.error('transfer-letters /config error:', error);
        res.status(500).json({ error: 'Failed to load config' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Next letter number (per office + year, office-editable) ───────────────

router.get('/next-number', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const officeCode = req.query.office_code || req.session.user.div_office_code;
        const year = new Date().getFullYear();

        const [[lastLetter]] = await conn.query(
            `SELECT letter_no FROM div_transfer_letters
             WHERE from_office_code = ? AND YEAR(letter_date) = ?
             ORDER BY id DESC LIMIT 1`,
            [officeCode, year]
        );

        let nextNum = 1;
        if (lastLetter && lastLetter.letter_no) {
            const match = lastLetter.letter_no.match(/\/(\d+)$/);
            if (match) nextNum = parseInt(match[1]) + 1;
        }
        const letterNo = `SR CC/TFR/${officeCode}/${year}/${String(nextNum).padStart(2, '0')}`;
        res.json({ letterNo, nextNum });
    } catch (error) {
        console.error('transfer-letters /next-number error:', error);
        res.status(500).json({ error: 'Failed to get letter number' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Staff search (sending lobby, all designations) ────────────────────────

router.get('/search-staff/:query', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        const officeCode = req.query.office_code || req.session.user.div_office_code;
        if (!officeCode) return res.status(400).json({ error: 'office_code required' });
        conn = await getConnection(req);
        const like = `%${req.params.query}%`;
        const [rows] = await conn.query(
            `SELECT s.hrms_id, s.pf_number, s.name, s.current_cms_id,
                    s.reporting_date, d.designation_name
             FROM div_staff_master s
             LEFT JOIN designations d ON s.designation_id = d.id
             WHERE s.current_office_code = ?
               AND s.status = 'Active'
               AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ? OR s.current_cms_id LIKE ?)
             ORDER BY s.name
             LIMIT 15`,
            [officeCode, like, like, like, like]
        );
        res.json({ staff: rows });
    } catch (error) {
        console.error('transfer-letters /search-staff error:', error);
        res.status(500).json({ error: 'Search failed' });
    } finally {
        if (conn) conn.release();
    }
});

// ── List letters ───────────────────────────────────────────────────────────

router.get('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        let officeCode = req.query.office_code || null;
        if (!isAdmin(req)) officeCode = req.session.user.div_office_code; // forced own office
        const status = req.query.status || null;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);

        const where = [];
        const params = [];
        if (officeCode) { where.push('l.from_office_code = ?'); params.push(officeCode); }
        if (status) { where.push('l.status = ?'); params.push(status); }

        const [rows] = await conn.query(
            `SELECT l.id, l.letter_no, l.letter_date, l.from_office_code, l.to_office_code,
                    l.transfer_category, l.status, l.total_staff, l.document_id,
                    l.created_by, l.created_at, l.finalized_at, l.transferred_at,
                    o1.office_name AS from_office_name, o2.office_name AS to_office_name
             FROM div_transfer_letters l
             LEFT JOIN offices o1 ON l.from_office_code = o1.office_code
             LEFT JOIN offices o2 ON l.to_office_code = o2.office_code
             ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
             ORDER BY l.id DESC
             LIMIT ${limit}`,
            params
        );
        res.json({ letters: rows });
    } catch (error) {
        console.error('transfer-letters list error:', error);
        res.status(500).json({ error: 'Failed to list letters' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Load one letter (declared after the literal routes above) ─────────────

async function loadLetter(conn, id) {
    const [[letter]] = await conn.query(
        `SELECT l.*, o1.office_name AS from_office_name, o2.office_name AS to_office_name
         FROM div_transfer_letters l
         LEFT JOIN offices o1 ON l.from_office_code = o1.office_code
         LEFT JOIN offices o2 ON l.to_office_code = o2.office_code
         WHERE l.id = ?`,
        [id]
    );
    if (!letter) return null;
    const [staff] = await conn.query(
        `SELECT ls.*, s.name AS live_name, s.pf_number AS live_pf, s.current_cms_id,
                s.current_office_code, d.designation_name
         FROM div_transfer_letter_staff ls
         LEFT JOIN div_staff_master s ON ls.staff_hrms_id = s.hrms_id
         LEFT JOIN designations d ON s.designation_id = d.id
         WHERE ls.letter_id = ?
         ORDER BY ls.sr_no`,
        [id]
    );
    return { letter, staff };
}

router.get('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const data = await loadLetter(conn, req.params.id);
        if (!data) return res.status(404).json({ error: 'Letter not found' });
        if (!assertOfficeAllowed(req, data.letter.from_office_code) ) {
            return res.status(403).json({ error: 'Not allowed for this office' });
        }
        res.json(data);
    } catch (error) {
        console.error('transfer-letters get error:', error);
        res.status(500).json({ error: 'Failed to load letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Create / update draft ──────────────────────────────────────────────────

router.post('/', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        const b = req.body || {};
        const staffList = Array.isArray(b.staff) ? b.staff : [];

        if (!b.letter_date || !b.from_office_code || !b.to_office_code) {
            return res.status(400).json({ error: 'letter_date, from_office_code and to_office_code are required' });
        }
        if (b.from_office_code === b.to_office_code) {
            return res.status(400).json({ error: 'Sending and receiving lobby cannot be the same' });
        }
        if (!assertOfficeAllowed(req, b.from_office_code)) {
            return res.status(403).json({ error: 'Not allowed for this office' });
        }
        if (!CATEGORIES.includes(b.transfer_category || 'Permanent Transfer')) {
            return res.status(400).json({ error: 'Invalid transfer category' });
        }

        conn = await getConnection(req);
        await conn.beginTransaction();

        let letterId = b.letter_id || null;
        if (letterId) {
            const [[existing]] = await conn.query(
                'SELECT id, status, from_office_code FROM div_transfer_letters WHERE id = ? FOR UPDATE',
                [letterId]
            );
            if (!existing) {
                await conn.rollback();
                return res.status(404).json({ error: 'Letter not found' });
            }
            if (existing.status !== 'draft') {
                await conn.rollback();
                return res.status(409).json({ error: 'Only draft letters can be edited' });
            }
            if (!assertOfficeAllowed(req, existing.from_office_code)) {
                await conn.rollback();
                return res.status(403).json({ error: 'Not allowed for this office' });
            }
            await conn.query(
                `UPDATE div_transfer_letters SET
                    letter_no=?, letter_date=?, from_office_code=?, to_office_code=?,
                    transfer_category=?, office_header_text=?, addressee_text=?,
                    subject_text=?, ref_text=?, body_text=?, bullets_text=?,
                    footer_text=?, signing_designation=?, signing_designation_hindi=?,
                    cc_text=?, total_staff=?
                 WHERE id=?`,
                [
                    b.letter_no || null, b.letter_date, b.from_office_code, b.to_office_code,
                    b.transfer_category || 'Permanent Transfer', b.office_header_text || null,
                    b.addressee_text || null, b.subject_text || null, b.ref_text || null,
                    b.body_text || null, b.bullets_text || null,
                    b.footer_text || DEFAULT_FOOTER, b.signing_designation || null,
                    b.signing_designation_hindi || null, b.cc_text || null,
                    staffList.length, letterId,
                ]
            );
            await conn.query('DELETE FROM div_transfer_letter_staff WHERE letter_id = ?', [letterId]);
        } else {
            const [result] = await conn.query(
                `INSERT INTO div_transfer_letters
                    (letter_no, letter_date, from_office_code, to_office_code, transfer_category,
                     office_header_text, addressee_text, subject_text, ref_text, body_text,
                     bullets_text, footer_text, signing_designation, signing_designation_hindi,
                     cc_text, total_staff, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
                [
                    b.letter_no || null, b.letter_date, b.from_office_code, b.to_office_code,
                    b.transfer_category || 'Permanent Transfer', b.office_header_text || null,
                    b.addressee_text || null, b.subject_text || null, b.ref_text || null,
                    b.body_text || null, b.bullets_text || null,
                    b.footer_text || DEFAULT_FOOTER, b.signing_designation || null,
                    b.signing_designation_hindi || null, b.cc_text || null,
                    staffList.length, req.session.user.username,
                ]
            );
            letterId = result.insertId;
        }

        // Re-insert staff rows; snapshots come from the DB, not the client.
        for (let i = 0; i < staffList.length; i++) {
            const s = staffList[i];
            const [[live]] = await conn.query(
                'SELECT pf_number, name FROM div_staff_master WHERE hrms_id = ?',
                [s.staff_hrms_id]
            );
            if (!live) {
                await conn.rollback();
                return res.status(400).json({ error: `Staff ${s.staff_hrms_id} not found` });
            }
            await conn.query(
                `INSERT INTO div_transfer_letter_staff
                    (letter_id, staff_hrms_id, sr_no, pf_number_snapshot, name_snapshot,
                     existing_reporting_date, relieving_date, footplate_km, new_reporting_date, remarks)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    letterId, s.staff_hrms_id, i + 1, live.pf_number, live.name,
                    s.existing_reporting_date || null, s.relieving_date || null,
                    (s.footplate_km === '' || s.footplate_km == null) ? null : parseInt(s.footplate_km),
                    s.new_reporting_date || null,
                    (s.remarks || '').trim().slice(0, 255) || null,
                ]
            );
        }

        await conn.commit();
        res.json({ success: true, letter_id: letterId });
    } catch (error) {
        console.error('transfer-letters save error:', error);
        if (conn) { try { await conn.rollback(); } catch (e) {} }
        if (error && error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'The same staff member appears twice on the letter' });
        }
        res.status(500).json({ error: 'Failed to save letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Delete draft ───────────────────────────────────────────────────────────

router.delete('/:id', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const [[letter]] = await conn.query(
            'SELECT id, status, from_office_code FROM div_transfer_letters WHERE id = ?',
            [req.params.id]
        );
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (!assertOfficeAllowed(req, letter.from_office_code)) {
            return res.status(403).json({ error: 'Not allowed for this office' });
        }
        if (letter.status !== 'draft') {
            return res.status(409).json({ error: 'Only draft letters can be deleted' });
        }
        await conn.query('DELETE FROM div_transfer_letters WHERE id = ?', [letter.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('transfer-letters delete error:', error);
        res.status(500).json({ error: 'Failed to delete letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Finalize: render PDF + auto-file into Documents ───────────────────────

router.post('/:id/finalize', requireDivisionAccess, async (req, res) => {
    let conn;
    let writtenFile = null;
    try {
        conn = await getConnection(req);
        const data = await loadLetter(conn, req.params.id);
        if (!data) return res.status(404).json({ error: 'Letter not found' });
        const { letter, staff } = data;
        if (!assertOfficeAllowed(req, letter.from_office_code)) {
            return res.status(403).json({ error: 'Not allowed for this office' });
        }
        if (letter.status !== 'draft') {
            return res.status(409).json({ error: 'Letter is already finalized' });
        }
        if (!staff.length) {
            return res.status(400).json({ error: 'Add at least one staff member before finalizing' });
        }
        // Required per staff: relieving + new-lobby reporting dates.
        // Footplate KM / existing reporting date are optional (may tighten later).
        const missing = staff.filter(s => !s.relieving_date || !s.new_reporting_date);
        if (missing.length) {
            return res.status(400).json({
                error: `Relieving and new reporting dates are required for: ${missing.map(s => s.name_snapshot || s.staff_hrms_id).join(', ')}`,
            });
        }

        const pdf = await renderTransferLetterPdf(letter, staff);
        const originalName = sanitize(`Transfer_Letter_${letter.letter_no || letter.id}.pdf`);
        const fileName = `${crypto.randomUUID()}__${originalName}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, fileName), pdf);
        writtenFile = fileName;

        await conn.beginTransaction();
        const title = `Transfer Letter ${letter.letter_no || '#' + letter.id} — ${letter.from_office_code} → ${letter.to_office_code}`;
        const [docResult] = await conn.query(
            `INSERT INTO div_documents
                (title, category, description, doc_date, folder, file_name,
                 original_name, file_type, file_size, uploaded_by)
             VALUES (?, 'TRANSFER_LETTER', ?, ?, ?, ?, ?, 'pdf', ?, ?)`,
            [
                title,
                `${letter.total_staff} staff · ${letter.transfer_category}`,
                letter.letter_date, letter.from_office_code,
                fileName, originalName, pdf.length, req.session.user.username,
            ]
        );
        await conn.query(
            `UPDATE div_transfer_letters
             SET status='finalized', document_id=?, finalized_at=NOW()
             WHERE id=? AND status='draft'`,
            [docResult.insertId, letter.id]
        );
        await conn.commit();
        res.json({ success: true, document_id: docResult.insertId });
    } catch (error) {
        console.error('transfer-letters finalize error:', error);
        if (conn) { try { await conn.rollback(); } catch (e) {} }
        if (writtenFile) { try { fs.unlinkSync(path.join(UPLOAD_DIR, writtenFile)); } catch (e) {} }
        res.status(500).json({ error: 'Failed to finalize letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Unfinalize (admin escape hatch, only while not transferred) ────────────

router.post('/:id/unfinalize', requireDivisionAccess, async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
    let conn;
    try {
        conn = await getConnection(req);
        const [[letter]] = await conn.query(
            'SELECT id, status, document_id FROM div_transfer_letters WHERE id = ?',
            [req.params.id]
        );
        if (!letter) return res.status(404).json({ error: 'Letter not found' });
        if (letter.status !== 'finalized') {
            return res.status(409).json({ error: 'Only finalized (not yet transferred) letters can be reverted' });
        }
        await conn.beginTransaction();
        if (letter.document_id) {
            const [[docRow]] = await conn.query(
                'SELECT file_name FROM div_documents WHERE id = ?', [letter.document_id]
            );
            await conn.query('DELETE FROM div_documents WHERE id = ?', [letter.document_id]);
            if (docRow) { try { fs.unlinkSync(path.join(UPLOAD_DIR, docRow.file_name)); } catch (e) {} }
        }
        await conn.query(
            `UPDATE div_transfer_letters
             SET status='draft', document_id=NULL, finalized_at=NULL WHERE id=?`,
            [letter.id]
        );
        await conn.commit();
        res.json({ success: true });
    } catch (error) {
        console.error('transfer-letters unfinalize error:', error);
        if (conn) { try { await conn.rollback(); } catch (e) {} }
        res.status(500).json({ error: 'Failed to revert letter' });
    } finally {
        if (conn) conn.release();
    }
});

// ── Transfer staff now (all-or-nothing) ────────────────────────────────────

router.post('/:id/transfer', requireDivisionAccess, async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const data = await loadLetter(conn, req.params.id);
        if (!data) return res.status(404).json({ error: 'Letter not found' });
        const { letter, staff } = data;
        if (!assertOfficeAllowed(req, letter.from_office_code)) {
            return res.status(403).json({ error: 'Not allowed for this office' });
        }
        if (letter.status === 'transferred') {
            return res.status(409).json({ error: 'Staff on this letter have already been transferred' });
        }
        if (letter.status !== 'finalized') {
            return res.status(409).json({ error: 'Finalize the letter before transferring staff' });
        }

        await conn.beginTransaction();
        const failed = [];
        const dateOrNull = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

        for (const s of staff) {
            const remarks =
                `Category: ${letter.transfer_category}. Transfer Letter No: ${letter.letter_no || letter.id}.` +
                (s.relieving_date ? ` Relieved: ${dateOrNull(s.relieving_date)}.` : '') +
                (s.new_reporting_date ? ` Reporting at ${letter.to_office_code}: ${dateOrNull(s.new_reporting_date)}.` : '') +
                (s.remarks ? ` ${s.remarks}` : '');
            try {
                await createPendingTransferRequest(conn, {
                    staff_hrms_id: s.staff_hrms_id,
                    from_office_code: letter.from_office_code,
                    to_office_code: letter.to_office_code,
                    transfer_category: letter.transfer_category,
                    current_cms_id: s.current_cms_id || null,
                    request_date: dateOrNull(letter.letter_date) || new Date().toISOString().split('T')[0],
                    requested_by: req.session.user.username,
                    remarks,
                    letter_id: letter.id,
                });
            } catch (err) {
                failed.push({
                    staff_hrms_id: s.staff_hrms_id,
                    name: s.name_snapshot || s.live_name || s.staff_hrms_id,
                    reason: err && err.code === 'DUPLICATE_PENDING'
                        ? 'already has a pending transfer request'
                        : err && err.code === 'STAFF_NOT_FOUND'
                            ? 'not found in staff master'
                            : 'could not be processed',
                });
            }
        }

        if (failed.length) {
            await conn.rollback();
            return res.status(409).json({
                error: 'No transfers were created. Resolve these staff first:',
                failed,
            });
        }

        await conn.query(
            `UPDATE div_transfer_letters SET status='transferred', transferred_at=NOW() WHERE id=?`,
            [letter.id]
        );
        await conn.commit();
        res.json({
            success: true,
            message: `${staff.length} transfer request(s) created — now pending acceptance at ${letter.to_office_code}`,
            count: staff.length,
        });
    } catch (error) {
        console.error('transfer-letters transfer error:', error);
        if (conn) { try { await conn.rollback(); } catch (e) {} }
        res.status(500).json({ error: 'Failed to create transfer requests' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
