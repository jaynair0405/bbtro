/**
 * Chief OS — D&AR desk: cases and Standard Form letters.
 *
 *   GET    /config                       user, desks, forms, signatories
 *   GET    /dashboard                    counts + recent cases
 *   GET    /cases                        ?status=open|closed&desk=&q=
 *   POST   /cases                        open a case
 *   GET    /cases/:id                    case + its letters
 *   PUT    /cases/:id                    edit an open case
 *   POST   /cases/:id/close | /reopen
 *   DELETE /cases/:id                    only while it has no filed letter
 *
 *   GET    /letter?case_id=              letters (editor history drawer)
 *   GET    /letter/:id                   { record (flattened), events: [] }
 *   POST   /letter                       { id, record } save draft
 *   POST   /letter/:id/finalize          render + file into div_documents, lock
 *   POST   /letter/:id/unfinalize        back to draft, filed copy removed
 *   DELETE /letter/:id
 *   GET    /letter/:id/word | /print
 *   GET    /next-number?case_id=         BB.TRSO.DAR.<desk>.<yy>.<nn>
 *   GET    /search-staff/:q, /search-cli/:q   the pickers (as SSE-HQ's)
 *
 * The letter endpoints follow the shape public/div/js/ssehq-editor.js expects,
 * so the letter page is that editor with a different renderer. A letter's own
 * blanks (f_*) live in div_dar_letters.fields JSON; the editor sees them
 * flattened onto the record, and the save folds them back (see FORMS[x].fields
 * in chiefos-render.js, the single list of what each form holds).
 *
 * Access: div_role chiefos, or division_admin. Reopening a filed letter is
 * allowed to the desk itself (same reasoning as SSE-HQ's reports).
 */

const express = require('express');
const router = express.Router();
const R = require('../../public/div/js/chiefos-render.js');
const { SHEET_CSS, escapeHtml } = require('../../public/div/js/ssehq-report-render.js');

// ── Helpers ────────────────────────────────────────────────────────────────
const ALLOWED = new Set(['chiefos', 'division_admin']);
function requireChiefOs(req, res, next) {
    const u = req.session?.user;
    if (!u || u.realm !== 'division' || !ALLOWED.has(u.div_role)) {
        return res.status(403).json({ error: 'Chief OS access required' });
    }
    next();
}
router.use(requireChiefOs);

const isAdmin = (req) => req.session.user.div_role === 'division_admin';
const pool = (req) => req.app.locals.pool;

function asText(v, max) {
    if (v == null) return null;
    const s = String(v).trim();
    return s === '' ? null : s.slice(0, max || 100000);
}
function asDate(v) {
    if (!v) return null;
    const s = String(v).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
function asInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
const today = () => new Date().toISOString().slice(0, 10);
const DESK = (v) => { const d = String(v || '').toUpperCase(); return R.DESKS[d] ? d : null; };
const FORM = (v) => { const f = String(v || '').toUpperCase(); return R.FORMS[f] ? f : null; };

/* DATE columns come back as JS Dates at local midnight (mysql2); alias them
 * as text so the form and the renderer see yyyy-mm-dd. */
const CASE_SELECT = `c.*, DATE_FORMAT(c.incident_date,'%Y-%m-%d') AS incident_date,
                     DATE_FORMAT(c.opened_on,'%Y-%m-%d') AS opened_on,
                     DATE_FORMAT(c.closed_on,'%Y-%m-%d') AS closed_on`;
const LETTER_SELECT = `l.*, DATE_FORMAT(l.letter_date,'%Y-%m-%d') AS letter_date`;

// ── Config / dashboard ─────────────────────────────────────────────────────
router.get('/config', (req, res) => {
    const u = req.session.user;
    res.json({
        user: { username: u.username, full_name: u.full_name, div_role: u.div_role, is_admin: isAdmin(req) },
        desks: R.DESKS, forms: R.FORMS, form_order: R.FORM_ORDER,
        signatories: R.SIGNATORIES, place_default: R.PLACE_DEFAULT,
    });
});

router.get('/dashboard', async (req, res) => {
    try {
        const p = pool(req);
        const [[c]] = await p.query(
            `SELECT SUM(status='open') open_cases, SUM(status='closed') closed_cases,
                    SUM(status='open' AND desk='ML') open_ml, SUM(status='open' AND desk='DSL') open_dsl,
                    SUM(status='open' AND desk='SUB') open_sub
               FROM div_dar_cases`);
        const [[l]] = await p.query(
            `SELECT SUM(status='draft') drafts,
                    SUM(status='final' AND YEAR(letter_date)=YEAR(CURDATE()) AND MONTH(letter_date)=MONTH(CURDATE())) this_month,
                    SUM(form_code='SF1' AND status='final') suspensions,
                    SUM(form_code='SF4' AND status='final') revocations
               FROM div_dar_letters`);
        // staff under suspension: a filed SF-1 in an open case with no filed SF-4 after it
        const [[s]] = await p.query(
            `SELECT COUNT(DISTINCT a.case_id) n
               FROM div_dar_letters a JOIN div_dar_cases c ON c.id = a.case_id AND c.status='open'
              WHERE a.form_code='SF1' AND a.status='final'
                AND NOT EXISTS (SELECT 1 FROM div_dar_letters b
                                 WHERE b.case_id=a.case_id AND b.form_code='SF4' AND b.status='final')`);
        const [recent] = await p.query(
            `SELECT ${CASE_SELECT},
                    (SELECT COUNT(*) FROM div_dar_letters l WHERE l.case_id=c.id) letters,
                    (SELECT CONCAT(l.form_code,'|',l.status) FROM div_dar_letters l WHERE l.case_id=c.id ORDER BY l.letter_date DESC, l.id DESC LIMIT 1) last_letter
               FROM div_dar_cases c ORDER BY c.updated_at DESC, c.id DESC LIMIT 12`);
        res.json({ ...c, ...l, under_suspension: s.n, recent });
    } catch (e) {
        console.error('chiefos dashboard:', e);
        res.status(500).json({ error: 'Failed to load the desk' });
    }
});

// ── Cases ──────────────────────────────────────────────────────────────────
function normaliseCase(b = {}) {
    return {
        desk: DESK(b.desk),
        staff_hrms_id: asText(b.staff_hrms_id, 10),
        staff_is_cli: b.staff_is_cli ? 1 : 0,
        staff_name: asText(b.staff_name, 120),
        staff_designation: asText(b.staff_designation, 120),
        staff_pf: asText(b.staff_pf, 20),
        staff_office: asText(b.staff_office, 60),
        incident_date: asDate(b.incident_date),
        subject_text: asText(b.subject_text, 500),
        opened_on: asDate(b.opened_on) || today(),
    };
}

router.get('/cases', async (req, res) => {
    try {
        const where = [], params = [];
        if (['open', 'closed'].includes(req.query.status)) { where.push('c.status = ?'); params.push(req.query.status); }
        if (DESK(req.query.desk)) { where.push('c.desk = ?'); params.push(DESK(req.query.desk)); }
        if (asText(req.query.q)) {
            const q = `%${req.query.q.trim()}%`;
            where.push('(c.staff_name LIKE ? OR c.subject_text LIKE ? OR c.staff_hrms_id LIKE ? OR c.staff_pf LIKE ?)');
            params.push(q, q, q, q);
        }
        const [rows] = await pool(req).query(
            `SELECT ${CASE_SELECT},
                    (SELECT COUNT(*) FROM div_dar_letters l WHERE l.case_id=c.id) letters,
                    (SELECT COUNT(*) FROM div_dar_letters l WHERE l.case_id=c.id AND l.status='draft') drafts,
                    (SELECT CONCAT(l.form_code,'|',l.status,'|',DATE_FORMAT(l.letter_date,'%Y-%m-%d')) FROM div_dar_letters l
                      WHERE l.case_id=c.id ORDER BY l.letter_date DESC, l.id DESC LIMIT 1) last_letter
               FROM div_dar_cases c ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
              ORDER BY c.status='closed', c.opened_on DESC, c.id DESC LIMIT 300`, params);
        res.json({ cases: rows });
    } catch (e) {
        console.error('chiefos cases list:', e);
        res.status(500).json({ error: 'Failed to list cases' });
    }
});

router.post('/cases', async (req, res) => {
    const c = normaliseCase(req.body);
    if (!c.desk) return res.status(400).json({ error: 'Choose the desk (ML / DSL / SUB).' });
    if (!c.staff_name) return res.status(400).json({ error: 'Pick the staff member from the master.' });
    if (!c.subject_text) return res.status(400).json({ error: 'A subject is required.' });
    try {
        const [r] = await pool(req).query(
            `INSERT INTO div_dar_cases (desk, staff_hrms_id, staff_is_cli, staff_name, staff_designation, staff_pf,
                                        staff_office, incident_date, subject_text, opened_on, created_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [c.desk, c.staff_hrms_id, c.staff_is_cli, c.staff_name, c.staff_designation, c.staff_pf,
             c.staff_office, c.incident_date, c.subject_text, c.opened_on, req.session.user.username]);
        res.status(201).json({ success: true, id: r.insertId });
    } catch (e) {
        console.error('chiefos case create:', e);
        res.status(500).json({ error: 'Failed to open the case' });
    }
});

async function loadCase(req, id) {
    const [[c]] = await pool(req).query(`SELECT ${CASE_SELECT} FROM div_dar_cases c WHERE c.id = ?`, [id]);
    return c || null;
}

router.get('/cases/:id', async (req, res) => {
    try {
        const c = await loadCase(req, req.params.id);
        if (!c) return res.status(404).json({ error: 'Case not found' });
        const [letters] = await pool(req).query(
            `SELECT l.id, l.form_code, l.letter_no, DATE_FORMAT(l.letter_date,'%Y-%m-%d') letter_date,
                    l.signatory, l.follows_letter_id, l.status, l.document_id, l.created_by, l.updated_at
               FROM div_dar_letters l WHERE l.case_id = ? ORDER BY l.letter_date, l.id`, [c.id]);
        res.json({ case: c, letters });
    } catch (e) {
        console.error('chiefos case get:', e);
        res.status(500).json({ error: 'Failed to load the case' });
    }
});

router.put('/cases/:id', async (req, res) => {
    const c = normaliseCase(req.body);
    if (!c.staff_name || !c.subject_text) return res.status(400).json({ error: 'Staff and subject are required.' });
    try {
        const cur = await loadCase(req, req.params.id);
        if (!cur) return res.status(404).json({ error: 'Case not found' });
        if (cur.status !== 'open') return res.status(409).json({ error: 'A closed case cannot be edited. Reopen it first.' });
        await pool(req).query(
            `UPDATE div_dar_cases SET staff_hrms_id=?, staff_is_cli=?, staff_name=?, staff_designation=?, staff_pf=?,
                    staff_office=?, incident_date=?, subject_text=?, opened_on=? WHERE id=?`,
            [c.staff_hrms_id, c.staff_is_cli, c.staff_name, c.staff_designation, c.staff_pf,
             c.staff_office, c.incident_date, c.subject_text, c.opened_on, cur.id]);
        // desk is fixed at opening: the letters already issued carry its number series
        res.json({ success: true });
    } catch (e) {
        console.error('chiefos case update:', e);
        res.status(500).json({ error: 'Failed to update the case' });
    }
});

router.post('/cases/:id/close', async (req, res) => {
    try {
        const [r] = await pool(req).query(
            `UPDATE div_dar_cases SET status='closed', closed_on=?, closing_remarks=? WHERE id=? AND status='open'`,
            [asDate(req.body.closed_on) || today(), asText(req.body.closing_remarks, 65535), req.params.id]);
        if (!r.affectedRows) return res.status(409).json({ error: 'Case not open' });
        res.json({ success: true });
    } catch (e) { console.error('chiefos case close:', e); res.status(500).json({ error: 'Failed to close the case' }); }
});
router.post('/cases/:id/reopen', async (req, res) => {
    try {
        const [r] = await pool(req).query(
            `UPDATE div_dar_cases SET status='open', closed_on=NULL WHERE id=? AND status='closed'`, [req.params.id]);
        if (!r.affectedRows) return res.status(409).json({ error: 'Case not closed' });
        res.json({ success: true });
    } catch (e) { console.error('chiefos case reopen:', e); res.status(500).json({ error: 'Failed to reopen the case' }); }
});
router.delete('/cases/:id', async (req, res) => {
    try {
        const [[f]] = await pool(req).query(
            `SELECT COUNT(*) n FROM div_dar_letters WHERE case_id=? AND status='final'`, [req.params.id]);
        if (f.n) return res.status(409).json({ error: 'This case has filed letters and cannot be deleted. Close it instead.' });
        const [r] = await pool(req).query(`DELETE FROM div_dar_cases WHERE id=?`, [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ error: 'Case not found' });
        res.json({ success: true });  // draft letters cascade
    } catch (e) { console.error('chiefos case delete:', e); res.status(500).json({ error: 'Failed to delete the case' }); }
});

// ── Letters ────────────────────────────────────────────────────────────────
const LETTER_COLS = ['case_id', 'form_code', 'letter_no', 'letter_date', 'place_of_issue', 'signatory',
                     'follows_letter_id', 'copy_to_text'];

/* The editor posts every input flat. Split into the letter's own columns and
 * the form's f_* fields, dropping anything the form does not declare. */
function normaliseLetter(b = {}) {
    const form = FORM(b.form_code);
    const out = {
        case_id: asInt(b.case_id),
        form_code: form,
        letter_no: asText(b.letter_no, 80),
        letter_date: asDate(b.letter_date) || today(),
        place_of_issue: asText(b.place_of_issue, 120),
        signatory: asText(b.signatory, 160),
        follows_letter_id: asInt(b.follows_letter_id),
        copy_to_text: asText(b.copy_to_text, 65535),
        fields: null,
    };
    if (form) {
        const f = {};
        for (const k of R.FORMS[form].fields) {
            let v = b[k];
            if (k === 'f_board_rows') {
                if (typeof v === 'string') { try { v = JSON.parse(v); } catch (_) { v = null; } }
                v = Array.isArray(v) ? v.map((x) => ({ name: asText(x && x.name, 120), designation: asText(x && x.designation, 120) }))
                                        .filter((x) => x.name || x.designation) : null;
                f[k] = v && v.length ? v : null;
            } else if (/_date$/.test(k)) {
                f[k] = asDate(v);
            } else {
                f[k] = asText(v, 4294967295);
            }
        }
        out.fields = JSON.stringify(f);
    }
    return out;
}

/* One flat object for the renderer and the form: letter columns, the case's
 * staff columns, the f_* fields, and the number/date of the letter it follows. */
async function loadLetter(req, id) {
    const [[l]] = await pool(req).query(`SELECT ${LETTER_SELECT} FROM div_dar_letters l WHERE l.id = ?`, [id]);
    if (!l) return null;
    return flattenLetter(req, l);
}
async function flattenLetter(req, l) {
    const c = await loadCase(req, l.case_id);
    let fields = l.fields;
    if (typeof fields === 'string') { try { fields = JSON.parse(fields); } catch (_) { fields = {}; } }
    const rec = { ...(fields || {}), ...l,
        staff_hrms_id: c?.staff_hrms_id, staff_name: c?.staff_name, staff_designation: c?.staff_designation,
        staff_pf: c?.staff_pf, staff_office: c?.staff_office, desk: c?.desk, subject_text: c?.subject_text,
        case_status: c?.status, follows_no: null, follows_date: null };
    if (rec.f_board_rows && typeof rec.f_board_rows !== 'string') rec.f_board_rows = JSON.stringify(rec.f_board_rows);
    delete rec.fields;
    if (l.follows_letter_id) {
        const [[f]] = await pool(req).query(
            `SELECT letter_no, DATE_FORMAT(letter_date,'%Y-%m-%d') d FROM div_dar_letters WHERE id = ?`, [l.follows_letter_id]);
        if (f) { rec.follows_no = f.letter_no; rec.follows_date = f.d; }
    }
    return rec;
}

// list — the editor's history drawer; scoped to a case when asked
router.get('/letter', async (req, res) => {
    try {
        const where = [], params = [];
        if (asInt(req.query.case_id)) { where.push('l.case_id = ?'); params.push(asInt(req.query.case_id)); }
        if (['draft', 'final'].includes(req.query.status)) { where.push('l.status = ?'); params.push(req.query.status); }
        if (asText(req.query.q)) { const q = `%${req.query.q.trim()}%`; where.push('(l.letter_no LIKE ? OR c.staff_name LIKE ?)'); params.push(q, q); }
        const [rows] = await pool(req).query(
            `SELECT l.id, l.letter_no AS number, DATE_FORMAT(l.letter_date,'%Y-%m-%d') AS report_date,
                    NULL AS train_no, NULL AS loco_number,
                    CONCAT(l.form_code, ' · ', c.staff_name) AS subject_text, NULL AS addressee_name,
                    l.form_code, l.status, l.document_id, l.created_by, l.updated_at
               FROM div_dar_letters l JOIN div_dar_cases c ON c.id = l.case_id
              ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
              ORDER BY l.letter_date DESC, l.id DESC LIMIT 200`, params);
        res.json({ records: rows });
    } catch (e) { console.error('chiefos letter list:', e); res.status(500).json({ error: 'Failed to list letters' }); }
});

router.get('/letter/:id', async (req, res) => {
    try {
        const record = await loadLetter(req, req.params.id);
        if (!record) return res.status(404).json({ error: 'Letter not found' });
        res.json({ record, events: [] });
    } catch (e) { console.error('chiefos letter get:', e); res.status(500).json({ error: 'Failed to load the letter' }); }
});

router.post('/letter', async (req, res) => {
    const rec = normaliseLetter(req.body.record || {});
    const id = asInt(req.body.id);
    if (!rec.form_code) return res.status(400).json({ error: 'Unknown form.' });
    if (!rec.case_id) return res.status(400).json({ error: 'A letter belongs to a case.' });
    try {
        const c = await loadCase(req, rec.case_id);
        if (!c) return res.status(404).json({ error: 'Case not found' });
        if (c.status !== 'open') return res.status(409).json({ error: 'This case is closed. Reopen it to issue a letter.' });
        if (rec.follows_letter_id) {
            const [[f]] = await pool(req).query(`SELECT id FROM div_dar_letters WHERE id=? AND case_id=?`, [rec.follows_letter_id, c.id]);
            if (!f) rec.follows_letter_id = null;   // must be a letter of the same case
        }
        if (id) {
            const [[ex]] = await pool(req).query(`SELECT id, status, case_id FROM div_dar_letters WHERE id=?`, [id]);
            if (!ex) return res.status(404).json({ error: 'Letter not found' });
            if (ex.status !== 'draft') return res.status(409).json({ error: 'This letter is filed and can no longer be edited. Reopen it first.' });
            await pool(req).query(
                `UPDATE div_dar_letters SET ${LETTER_COLS.filter((k) => k !== 'case_id').map((k) => `${k}=?`).join(', ')}, fields=? WHERE id=?`,
                [...LETTER_COLS.filter((k) => k !== 'case_id').map((k) => rec[k]), rec.fields, id]);
            return res.json({ success: true, id });
        }
        const [r] = await pool(req).query(
            `INSERT INTO div_dar_letters (${LETTER_COLS.join(',')}, fields, status, created_by)
             VALUES (${LETTER_COLS.map(() => '?').join(',')}, ?, 'draft', ?)`,
            [...LETTER_COLS.map((k) => rec[k]), rec.fields, req.session.user.username]);
        res.status(201).json({ success: true, id: r.insertId });
    } catch (e) { console.error('chiefos letter save:', e); res.status(500).json({ error: 'Failed to save the letter' }); }
});

// ── Page / Word shells (same convention as utils/ssehqReportHtml.js) ───────
const MARGIN = '16mm 18mm 14mm 22mm';
const DEVA_FONT =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">';

function renderPage(rec) {
    const title = R.darTitle(rec), subject = R.darSubject(rec);
    const sheet = R.renderDarSheet(rec, { placeholders: false });
    return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — ${escapeHtml(subject)}</title>
${DEVA_FONT}
<style>
@page { size: A4; margin: ${MARGIN}; }
body { margin:0; background:#5a5f66; font-family:"Times New Roman",Times,serif; }
.bar { position:sticky; top:0; z-index:5; background:#1b2333; color:#e7edf7; padding:10px 16px; display:flex; align-items:center; gap:14px; font-family:system-ui,-apple-system,sans-serif; font-size:13px; }
.bar .sp { flex:1; }
.bar button { background:#f5a524; border:none; color:#17130b; border-radius:7px; padding:8px 15px; cursor:pointer; font:inherit; font-weight:700; }
.sheet { width:210mm; min-height:297mm; margin:22px auto; background:#fff; padding:${MARGIN}; box-shadow:0 10px 40px rgba(0,0,0,.45); }
${SHEET_CSS}
${R.DAR_CSS}
@media print { body { background:#fff; } .bar { display:none !important; } .sheet { width:auto; min-height:auto; margin:0; padding:0; box-shadow:none; } }
</style></head>
<body><div class="bar"><b>${escapeHtml(title)}</b><span class="sp"></span><button onclick="window.print()">&#128424; Print / Save PDF</button></div>
<div class="sheet">${sheet}</div></body></html>`;
}
function renderWord(rec) {
    const title = R.darTitle(rec);
    const sheet = R.renderDarSheet(rec, { placeholders: false });
    return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
${DEVA_FONT}
<style>
@page WordSection1 { size:210.0mm 297.0mm; margin:${MARGIN}; }
div.WordSection1 { page: WordSection1; }
body { font-family:"Times New Roman",Times,serif; }
.deva,.sheet .deva,.sheet p.deva{font-family:"Nirmala UI","Mangal","Noto Sans Devanagari","Times New Roman",serif;}
${SHEET_CSS}
${R.DAR_CSS}
.sheet { width:auto; margin:0; padding:0; border:none; box-shadow:none; }
.sheet .annex { page-break-before:always; }
</style></head>
<body><div class="WordSection1"><div class="sheet">${sheet}</div></div></body></html>`;
}

router.post('/letter/:id/finalize', async (req, res) => {
    let conn;
    try {
        const rec = await loadLetter(req, req.params.id);
        if (!rec) return res.status(404).json({ error: 'Letter not found' });
        if (rec.status === 'final') return res.status(409).json({ error: 'This letter is already filed.' });
        if (!rec.letter_no) return res.status(400).json({ error: 'A letter number is required before filing.' });
        if (!rec.signatory) return res.status(400).json({ error: 'Choose the signing authority before filing.' });
        if (rec.form_code === 'SF5' && !rec.f_articles) return res.status(400).json({ error: 'Annexure-I (Articles of Charge) is empty.' });
        if (rec.form_code === 'SF11' && !rec.f_imputation) return res.status(400).json({ error: 'The statement of imputation is empty.' });
        if (rec.form_code === 'SF4' && !rec.f_revoke_from) return res.status(400).json({ error: 'The date the suspension is revoked from is required.' });
        if (rec.form_code === 'SF7' && rec.f_mode !== 'board' && !rec.f_io_name) return res.status(400).json({ error: 'Name the Inquiry Officer.' });

        conn = await pool(req).getConnection();
        await conn.beginTransaction();
        const [doc] = await conn.query(
            `INSERT INTO div_documents (title, category, description, doc_date, folder, body_html, language, source_type, status, header, uploaded_by)
             VALUES (?, 'DAR_LETTER', ?, ?, ?, ?, 'en', 'composed', 'final', ?, ?)`,
            [R.darTitle(rec), R.darSubject(rec), rec.letter_date, rec.form_code, renderPage(rec),
             JSON.stringify({ ref_no: rec.letter_no, kind: 'dar', form_code: rec.form_code, case_id: rec.case_id,
                              staff_hrms_id: rec.staff_hrms_id || null, desk: rec.desk || null }),
             req.session.user.username]);
        await conn.query(`UPDATE div_dar_letters SET status='final', document_id=?, finalized_at=NOW() WHERE id=? AND status='draft'`,
            [doc.insertId, rec.id]);
        await conn.commit();
        res.json({ success: true, document_id: doc.insertId });
    } catch (e) {
        if (conn) { try { await conn.rollback(); } catch (_) { /* rolled back */ } }
        console.error('chiefos finalize:', e);
        res.status(500).json({ error: 'Failed to file the letter' });
    } finally { if (conn) conn.release(); }
});

router.post('/letter/:id/unfinalize', async (req, res) => {
    let conn;
    try {
        const [[l]] = await pool(req).query(`SELECT id, status, document_id FROM div_dar_letters WHERE id=?`, [req.params.id]);
        if (!l) return res.status(404).json({ error: 'Letter not found' });
        if (l.status !== 'final') return res.status(409).json({ error: 'This letter is not filed.' });
        conn = await pool(req).getConnection();
        await conn.beginTransaction();
        await conn.query(`UPDATE div_dar_letters SET status='draft', document_id=NULL, finalized_at=NULL WHERE id=?`, [l.id]);
        if (l.document_id) await conn.query(`DELETE FROM div_documents WHERE id=?`, [l.document_id]);
        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        if (conn) { try { await conn.rollback(); } catch (_) { /* rolled back */ } }
        console.error('chiefos unfinalize:', e);
        res.status(500).json({ error: 'Failed to reopen the letter' });
    } finally { if (conn) conn.release(); }
});

router.delete('/letter/:id', async (req, res) => {
    try {
        const [[l]] = await pool(req).query(`SELECT id, status, created_by FROM div_dar_letters WHERE id=?`, [req.params.id]);
        if (!l) return res.status(404).json({ error: 'Letter not found' });
        if (l.status !== 'draft') return res.status(409).json({ error: 'A filed letter cannot be deleted. Reopen it first.' });
        await pool(req).query(`DELETE FROM div_dar_letters WHERE id=?`, [l.id]);
        res.json({ success: true });
    } catch (e) { console.error('chiefos letter delete:', e); res.status(500).json({ error: 'Failed to delete the letter' }); }
});

router.get('/letter/:id/print', async (req, res) => {
    try {
        const rec = await loadLetter(req, req.params.id);
        if (!rec) return res.status(404).send('Letter not found');
        res.type('html').send(renderPage(rec));
    } catch (e) { console.error('chiefos print:', e); res.status(500).send('Failed to render'); }
});
router.get('/letter/:id/word', async (req, res) => {
    try {
        const rec = await loadLetter(req, req.params.id);
        if (!rec) return res.status(404).send('Letter not found');
        const name = R.darTitle(rec).replace(/[\\/:*?"<>|]+/g, '-');
        res.setHeader('Content-Type', 'application/msword; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.doc"; filename*=UTF-8''${encodeURIComponent(name)}.doc`);
        res.send(renderWord(rec));
    } catch (e) { console.error('chiefos word:', e); res.status(500).send('Failed to build the Word file'); }
});

// ── Numbering ──────────────────────────────────────────────────────────────
// BB.TRSO.DAR.<desk>.<yy>.<nn>, serial per desk per year across all five
// forms (the samples: ML/26/08 on an SF-5, SUB.26.12 on an SF-11). Suggested
// only; the desk may overwrite it.
router.get('/next-number', async (req, res) => {
    try {
        const c = asInt(req.query.case_id) ? await loadCase(req, asInt(req.query.case_id)) : null;
        if (!c) return res.status(400).json({ error: 'Open the letter from a case.' });
        const [[o]] = await pool(req).query(
            `SELECT COUNT(*) n FROM div_dar_letters l JOIN div_dar_cases k ON k.id=l.case_id
              WHERE k.desk=? AND YEAR(l.letter_date)=YEAR(CURDATE())`, [c.desk]);
        const yy = String(new Date().getFullYear()).slice(-2);
        res.json({ number: `${R.DESKS[c.desk].series}${yy}.${String(o.n + 1).padStart(2, '0')}` });
    } catch (e) { console.error('chiefos next-number:', e); res.status(500).json({ error: 'Failed to build a number' }); }
});

// ── Pickers (same as SSE-HQ's; the staff box is the shared picker) ─────────
router.get('/search-staff/:query', async (req, res) => {
    const raw = String(req.params.query || '').trim();
    if (raw.length < 3) return res.json({ staff: [] });
    const q = `%${raw}%`;
    try {
        const [staff] = await pool(req).query(
            `SELECT s.hrms_id, s.pf_number, s.name, s.current_cms_id, s.current_office_code, d.designation_name
               FROM div_staff_master s LEFT JOIN designations d ON s.designation_id = d.id
              WHERE s.status = 'Active'
                AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ? OR s.current_cms_id LIKE ?
                     OR s.cug_number LIKE ? OR s.phone_number LIKE ?)
              ORDER BY s.name LIMIT 40`, [q, q, q, q, q, q]);
        res.json({ staff });
    } catch (e) { console.error('chiefos staff search:', e); res.status(500).json({ error: 'Staff search failed' }); }
});
router.get('/search-cli/:query', async (req, res) => {
    const raw = String(req.params.query || '').trim();
    if (raw.length < 3) return res.json({ staff: [] });
    const q = `%${raw}%`;
    try {
        const [staff] = await pool(req).query(
            `SELECT c.cli_hrms_id AS hrms_id, NULL AS pf_number, c.cli_name AS name, c.cmsid AS current_cms_id,
                    c.current_office_code, 'CLI' AS designation_name, 1 AS is_cli
               FROM div_cli_master c
              WHERE c.is_active = 1
                AND (c.cli_name LIKE ? OR c.cli_hrms_id LIKE ? OR c.cmsid LIKE ? OR c.cli_mobile LIKE ?)
              ORDER BY c.cli_name LIMIT 40`, [q, q, q, q]);
        res.json({ staff });
    } catch (e) { console.error('chiefos cli search:', e); res.status(500).json({ error: 'CLI search failed' }); }
});
// the editor asks for corridor suggestions; a letter has none
router.get('/sections', (req, res) => res.json({ sections: [] }));

module.exports = router;
