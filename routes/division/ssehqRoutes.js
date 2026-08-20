/**
 * ssehqRoutes.js — SSE-HQ reports
 * Mounted at /api/division/ssehq
 *
 * Two reports the SSE-HQ desk writes when a train is detained:
 *   • OPR   — "One page report of Detention of Train ___ with Loco no. ___",
 *             a fixed proforma plus a chronological event log.
 *   • DElogging Note — the longer narrative that asks for the punctuality loss
 *             to be delogged from the Electric Loco and booked elsewhere.
 *
 * They stay INDEPENDENT records. In practice both describe one incident, so
 * GET /opr/:id/as-note returns a note prefilled from an OPR — but it returns
 * it unsaved, with no FK between the two, so correcting one never silently
 * rewrites the other.
 *
 * Lifecycle: draft → final. Finalizing renders the report to a complete A4
 * HTML page and files it into div_documents as source_type='composed'
 * (category SSE_HQ_REPORT, folder OPR | DELOGGING_NOTE). NOT a pdfkit PDF —
 * see utils/ssehqReportHtml.js for why. Reopening is admin-only and removes
 * the filed document, so there is never a stale copy in the repository.
 *
 *   GET    /config                user + is_admin
 *   GET    /next-number           suggested report number (editable)
 *   GET    /search-staff/:q       division-wide staff picker
 *   GET    /search-loco/:q        loco picker from div_locos
 *   GET    /locos/:number         exact loco lookup
 *   GET    /opr | /delogging      list (?q=&from=&to=&status=)
 *   GET    /opr/:id               report + events
 *   POST   /opr                   create/update draft (id in body)
 *   POST   /opr/:id/finalize      render + file into div_documents, lock
 *   POST   /opr/:id/unfinalize    admin only: back to draft, remove document
 *   DELETE /opr/:id               delete draft
 *   GET    /opr/:id/word          Word download
 *   GET    /opr/:id/print         printable A4 page
 *   GET    /opr/:id/as-note       unsaved DElogging Note prefilled from an OPR
 */

const express = require('express');
const router = express.Router();

const {
    renderOprPage, renderNotePage, renderOprWord, renderNoteWord,
    oprTitle, noteTitle, oprSubject, noteSubject,
} = require('../../utils/ssehqReportHtml');
const { DEFAULT_FORWARDING, fmtDate } = require('../../public/div/js/ssehq-report-render.js');

// ── Access ─────────────────────────────────────────────────────────────────
// SSE-HQ reports are an HQ-level function, not a per-lobby one, so — as with
// cadre letters — there is no office lock. Reopening a filed report is
// admin-only.

const ALLOWED = new Set(['ssehq', 'division_admin']);

function requireSsehq(req, res, next) {
    const u = req.session?.user;
    if (!u || u.realm !== 'division' || !ALLOWED.has(u.div_role)) {
        return res.status(403).json({ error: 'SSE-HQ access required' });
    }
    next();
}

const isAdmin = (req) => req.session.user?.div_role === 'division_admin';
const getConnection = (req) => req.app.locals.pool.getConnection();

// ── Normalisation ──────────────────────────────────────────────────────────

const asDate = (v) => {
    if (v == null || v === '') return null;
    const s = String(v).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
const asInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* Trim, then cap to the column's own width. The module this replaced ran every
 * OPR field through a 100 000-char default while the columns are VARCHAR(20)
 * to VARCHAR(255), so pasting a long "Major" turned into a MySQL data-too-long
 * error surfacing as a bare 500 with no hint which field was at fault. The
 * limits below mirror sql/2026-08-19_ssehq_reports.sql exactly; TEXT columns
 * get a generous ceiling rather than none, so a runaway paste still fails
 * loudly here instead of at the database. */
function asText(v, max) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s === '') return null;
    return s.slice(0, max || 100000);
}

const OPR_LIMITS = {
    report_no: 80, division_railway: 120, train_no: 40,
    loco_number: 20, loco_type: 30, loco_base: 30,
    last_inspection_type: 30, last_schedule_type: 30, load_text: 120,
    lp_staff_hrms_id: 10, lp_name: 120, alp_staff_hrms_id: 10, alp_name: 120,
    section_text: 120, major_text: 255, minor_text: 255,
    detention_text: 65535, repercussion_text: 65535, punctuality_text: 65535,
    reported_text: 65535, reason_text: 65535, responsibility_text: 65535,
};
const OPR_DATES = ['report_date', 'failure_date', 'loco_commission_date',
                   'last_inspection_date', 'last_schedule_date'];
const OPR_FIELDS = [...Object.keys(OPR_LIMITS), ...OPR_DATES];

const NOTE_LIMITS = {
    note_no: 80, subject_text: 500, train_no: 40,
    loco_number: 20, loco_type: 30, loco_base: 30,
    staff_hrms_id: 10, staff_name: 120,
    body_text: 4294967295, punctuality_text: 65535, repercussion_text: 65535,
    statements_text: 4294967295, conclusion_text: 4294967295,
    signing_text: 255, forwarding_text: 65535,
};
const NOTE_DATES = ['note_date', 'train_date', 'loco_commission_date'];
const NOTE_FIELDS = [...Object.keys(NOTE_LIMITS), ...NOTE_DATES];

const today = () => new Date().toISOString().slice(0, 10);

function normaliseOpr(input = {}) {
    const out = {};
    for (const [f, max] of Object.entries(OPR_LIMITS)) out[f] = asText(input[f], max);
    for (const f of OPR_DATES) out[f] = asDate(input[f]);
    out.report_date = out.report_date || today();
    out.division_railway = out.division_railway || 'Mumbai/CR';
    return out;
}

function normaliseNote(input = {}) {
    const out = {};
    for (const [f, max] of Object.entries(NOTE_LIMITS)) out[f] = asText(input[f], max);
    for (const f of NOTE_DATES) out[f] = asDate(input[f]);
    out.note_date = out.note_date || today();
    return out;
}

/* Rows with neither a time nor a description are dropped rather than stored —
 * the editor keeps a blank row at the bottom for typing into, and that row is
 * not an event. */
function normaliseEvents(events) {
    if (!Array.isArray(events)) return [];
    return events
        .map((e, i) => ({
            event_no: asInt(e.event_no) || i + 1,
            event_time: asText(e.event_time, 20),
            description: asText(e.description, 65535),
        }))
        .filter((e) => e.event_time || e.description)
        .map((e, i) => ({ ...e, event_no: i + 1 }));
}

/* Per-kind configuration. Both reports are the same shape — a header row, a
 * child event table, a composed document — so every handler below is written
 * once against this table instead of twice against two near-identical copies. */
const KIND = {
    opr: {
        table: 'div_ssehq_opr_reports',
        events: 'div_ssehq_opr_events',
        fk: 'report_id',
        dateCol: 'report_date',
        numberCol: 'report_no',
        fields: OPR_FIELDS,
        dates: OPR_DATES,
        folder: 'OPR',
        label: 'OPR',
        normalise: normaliseOpr,
        title: oprTitle,
        subject: oprSubject,
        page: renderOprPage,
        word: renderOprWord,
    },
    note: {
        table: 'div_ssehq_delogging_notes',
        events: 'div_ssehq_delogging_events',
        fk: 'note_id',
        dateCol: 'note_date',
        numberCol: 'note_no',
        fields: NOTE_FIELDS,
        dates: NOTE_DATES,
        folder: 'DELOGGING_NOTE',
        label: 'DElogging Note',
        normalise: normaliseNote,
        title: noteTitle,
        subject: noteSubject,
        page: renderNotePage,
        word: renderNoteWord,
    },
};

/* Every DATE column is aliased over the SELECT *, never read raw. mysql2 hands
 * back a JS Date unless dateStrings is set (it is not, pool-wide), and the
 * export path used to SELECT * — which is how a filed report came to carry
 * "Wed Aug 19 2026 00:00:00 GMT+0530 (India Standard Time)" where the proforma
 * wants 19.08.2026. */
const dateAliases = (k) =>
    k.dates.map((d) => `DATE_FORMAT(${d}, '%Y-%m-%d') AS ${d}`).join(', ');

async function loadRecord(conn, k, id) {
    const [[record]] = await conn.query(
        `SELECT *, ${dateAliases(k)} FROM ${k.table} WHERE id = ?`, [id]
    );
    if (!record) return { error: `${k.label} not found` };
    const [events] = await conn.query(
        `SELECT id, event_no, event_time, description FROM ${k.events}
          WHERE ${k.fk} = ? ORDER BY event_no, id`, [id]
    );
    return { record, events };
}

async function replaceEvents(conn, k, id, events) {
    await conn.query(`DELETE FROM ${k.events} WHERE ${k.fk} = ?`, [id]);
    for (const e of events) {
        await conn.query(
            `INSERT INTO ${k.events} (${k.fk}, event_no, event_time, description)
             VALUES (?,?,?,?)`, [id, e.event_no, e.event_time, e.description]
        );
    }
}

// ── Everything below needs SSE-HQ access ───────────────────────────────────
router.use(requireSsehq);

router.get('/config', (req, res) => {
    res.json({
        user: {
            username: req.session.user.username,
            full_name: req.session.user.full_name,
            div_role: req.session.user.div_role,
            is_admin: isAdmin(req),
        },
        forwarding_default: DEFAULT_FORWARDING,
    });
});

// ── GET /next-number ───────────────────────────────────────────────────────
// Year-wise serial across both report kinds, matching the sample's "BB/Tech/2".
// Suggested only — the desk overrides it freely, so it is not made unique.

router.get('/next-number', async (req, res) => {
    try {
        const [[o]] = await req.app.locals.pool.query(
            `SELECT COUNT(*) n FROM div_ssehq_opr_reports WHERE YEAR(report_date) = YEAR(CURDATE())`);
        const [[n]] = await req.app.locals.pool.query(
            `SELECT COUNT(*) n FROM div_ssehq_delogging_notes WHERE YEAR(note_date) = YEAR(CURDATE())`);
        res.json({ number: `BB/Tech/${o.n + n.n + 1}` });
    } catch (e) {
        console.error('ssehq next-number:', e);
        res.status(500).json({ error: 'Failed to build a report number' });
    }
});

// ── GET /dashboard ─────────────────────────────────────────────────────────
/* The desk's own numbers for the landing page. Shed figures (sick locos,
 * defects, schedules due) are NOT duplicated here — they come from
 * /api/division/loco-link, which already owns them and which this role may
 * read. Re-deriving them would be a second version of the same truth. */
router.get('/dashboard', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const counts = async (table, dateCol) => {
      const [[c]] = await pool.query(
        `SELECT SUM(status = 'draft') AS draft,
                SUM(status = 'final') AS final,
                SUM(${dateCol} >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS this_month,
                COUNT(*) AS total
           FROM ${table}`);
      return { draft: Number(c.draft || 0), final: Number(c.final || 0),
               this_month: Number(c.this_month || 0), total: Number(c.total || 0) };
    };
    const recent = async (table, numberCol, dateCol) => {
      const [rows] = await pool.query(
        `SELECT id, ${numberCol} AS number,
                DATE_FORMAT(${dateCol}, '%Y-%m-%d') AS report_date,
                train_no, loco_number, status, document_id
           FROM ${table} ORDER BY ${dateCol} DESC, id DESC LIMIT 6`);
      return rows;
    };
    const [oprCounts, noteCounts, oprRecent, noteRecent] = await Promise.all([
      counts('div_ssehq_opr_reports', 'report_date'),
      counts('div_ssehq_delogging_notes', 'note_date'),
      recent('div_ssehq_opr_reports', 'report_no', 'report_date'),
      recent('div_ssehq_delogging_notes', 'note_no', 'note_date'),
    ]);
    res.json({
      opr: { ...oprCounts, recent: oprRecent },
      note: { ...noteCounts, recent: noteRecent },
    });
  } catch (e) {
    console.error('ssehq dashboard:', e);
    res.status(500).json({ error: 'Failed to load the dashboard' });
  }
});

// ── GET /sections ──────────────────────────────────────────────────────────
/* Corridor names for the Section / Major / Minor boxes, offered as
 * suggestions rather than a closed list — the desk still has to be able to
 * write a section the signal book has not been loaded with yet, and Minor in
 * the sample carries "OMB-KSRA", a station pair rather than a whole corridor.
 *
 * Derived from div_signal_book_sections rather than div_lrd_sections: that
 * table's section_name is a mix of styles ("CSMT to Kalyan", "PNVL-PEN",
 * "DTVL to KOPR (BSR branch head)"), while the signal book's section_code
 * carries the corridor as its first two parts (CSMT_KYN_DN_TH -> CSMT-KYN)
 * in exactly the form the proforma uses. Both directions of a corridor
 * collapse to the same entry, which is what the Section box wants. */
router.get('/sections', async (req, res) => {
  try {
    const [rows] = await req.app.locals.pool.query(
      `SELECT DISTINCT REPLACE(SUBSTRING_INDEX(section_code, '_', 2), '_', '-') AS section
         FROM div_signal_book_sections
        WHERE is_active = 1 AND section_code LIKE '%\\_%'
        ORDER BY section`
    );
    res.json({ sections: rows.map((r) => r.section).filter(Boolean) });
  } catch (e) {
    console.error('ssehq sections:', e);
    // A missing list must not stop a report being written — the boxes are
    // free text and simply lose their suggestions.
    res.json({ sections: [] });
  }
});

// ── Pickers ────────────────────────────────────────────────────────────────

router.get('/search-staff/:query', async (req, res) => {
    const raw = String(req.params.query || '').trim();
    if (raw.length < 3) return res.json({ staff: [] });
    const q = `%${raw}%`;
    try {
        const [staff] = await req.app.locals.pool.query(
            `SELECT s.hrms_id, s.pf_number, s.name, s.current_cms_id,
                    s.current_office_code, d.designation_name
               FROM div_staff_master s
               LEFT JOIN designations d ON s.designation_id = d.id
              WHERE s.status = 'Active'
                AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ?
                     OR s.current_cms_id LIKE ?)
              ORDER BY s.name LIMIT 40`, [q, q, q, q]
        );
        res.json({ staff });
    } catch (e) {
        console.error('ssehq staff search:', e);
        res.status(500).json({ error: 'Staff search failed' });
    }
});

/* What the loco master can and cannot fill in.
 *
 * commission_date is populated for every one of the 13,806 locos, so DOC
 * auto-fills reliably — that is the field the desk was retyping.
 *
 * last_sched_type / last_sched_date are populated for ZERO of them, so the
 * old code's "Last schedule" autofill could only ever blank the field. The
 * columns that do carry data are schedule_type / schedule_due_date (~300
 * rows), but those are the NEXT schedule DUE, which is the opposite of what
 * the proforma's Schedule row asks for. Both are returned and the editor
 * shows the due date as a labelled hint beside the manual Major/Last
 * inspection boxes — mapping it into them would put a future date under a
 * heading that means "last done".
 */
const LOCO_COLS = `loco_number, loco_type, home_shed, railway_zone, traction_type,
        DATE_FORMAT(commission_date, '%Y-%m-%d')     AS commission_date,
        last_sched_type,
        DATE_FORMAT(last_sched_date, '%Y-%m-%d')     AS last_sched_date,
        schedule_type,
        DATE_FORMAT(schedule_due_date, '%Y-%m-%d')   AS schedule_due_date`;

router.get('/search-loco/:query', async (req, res) => {
    const raw = String(req.params.query || '').trim();
    if (raw.length < 3) return res.json({ locos: [] });
    try {
        const [locos] = await req.app.locals.pool.query(
            `SELECT ${LOCO_COLS} FROM div_locos WHERE loco_number LIKE ?
              ORDER BY loco_number LIMIT 40`, [`%${raw}%`]
        );
        res.json({ locos });
    } catch (e) {
        console.error('ssehq loco search:', e);
        res.status(500).json({ error: 'Loco search failed' });
    }
});

router.get('/locos/:number', async (req, res) => {
    try {
        const [[loco]] = await req.app.locals.pool.query(
            `SELECT ${LOCO_COLS} FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [String(req.params.number || '').trim()]
        );
        if (!loco) return res.status(404).json({ error: 'Loco not found in master' });
        res.json({ loco });
    } catch (e) {
        console.error('ssehq loco details:', e);
        res.status(500).json({ error: 'Loco lookup failed' });
    }
});

// ── Generic handlers, mounted once per kind ────────────────────────────────

function mount(kindKey, base) {
    const k = KIND[kindKey];

    // list
    router.get(base, async (req, res) => {
        try {
            const where = [];
            const params = [];
            if (req.query.q) {
                const q = `%${req.query.q}%`;
                where.push(`(${k.numberCol} LIKE ? OR train_no LIKE ? OR loco_number LIKE ?)`);
                params.push(q, q, q);
            }
            if (asDate(req.query.from)) { where.push(`${k.dateCol} >= ?`); params.push(asDate(req.query.from)); }
            if (asDate(req.query.to)) { where.push(`${k.dateCol} <= ?`); params.push(asDate(req.query.to)); }
            if (['draft', 'final'].includes(req.query.status)) { where.push('status = ?'); params.push(req.query.status); }
            const [rows] = await req.app.locals.pool.query(
                `SELECT id, ${k.numberCol} AS number,
                        DATE_FORMAT(${k.dateCol}, '%Y-%m-%d') AS report_date,
                        train_no, loco_number, status, document_id, created_by, updated_at
                   FROM ${k.table} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                  ORDER BY ${k.dateCol} DESC, id DESC LIMIT 200`, params
            );
            res.json({ records: rows });
        } catch (e) {
            console.error(`ssehq ${kindKey} list:`, e);
            res.status(500).json({ error: `Failed to list ${k.label}s` });
        }
    });

    // one record
    router.get(`${base}/:id`, async (req, res) => {
        let conn;
        try {
            conn = await getConnection(req);
            const { record, events, error } = await loadRecord(conn, k, req.params.id);
            if (error) return res.status(404).json({ error });
            res.json({ record, events });
        } catch (e) {
            console.error(`ssehq ${kindKey} get:`, e);
            res.status(500).json({ error: `Failed to load the ${k.label}` });
        } finally { if (conn) conn.release(); }
    });

    // create or update a draft — id in the body, as the letter modules do
    router.post(base, async (req, res) => {
        const rec = k.normalise(req.body.record);
        const events = normaliseEvents(req.body.events);
        const id = asInt(req.body.id);
        let conn;
        try {
            conn = await getConnection(req);
            await conn.beginTransaction();

            let recordId = id;
            if (id) {
                const [[existing]] = await conn.query(
                    `SELECT id, status FROM ${k.table} WHERE id = ?`, [id]);
                if (!existing) { await conn.rollback(); return res.status(404).json({ error: `${k.label} not found` }); }
                if (existing.status !== 'draft') {
                    await conn.rollback();
                    return res.status(409).json({
                        error: `This ${k.label} is filed and can no longer be edited. Reopen it first.` });
                }
                await conn.query(
                    `UPDATE ${k.table} SET ${k.fields.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
                    [...k.fields.map((c) => rec[c]), id]
                );
            } else {
                const [result] = await conn.query(
                    `INSERT INTO ${k.table} (${k.fields.join(',')}, status, created_by)
                     VALUES (${k.fields.map(() => '?').join(',')}, 'draft', ?)`,
                    [...k.fields.map((c) => rec[c]), req.session.user.username]
                );
                recordId = result.insertId;
            }
            await replaceEvents(conn, k, recordId, events);
            await conn.commit();
            res.status(id ? 200 : 201).json({ success: true, id: recordId });
        } catch (e) {
            if (conn) { try { await conn.rollback(); } catch (_) { /* already rolled back */ } }
            console.error(`ssehq ${kindKey} save:`, e);
            res.status(500).json({ error: `Failed to save the ${k.label}` });
        } finally { if (conn) conn.release(); }
    });

    // finalize — render, file into div_documents, lock. Transactional: if
    // filing fails the report stays a draft.
    router.post(`${base}/:id/finalize`, async (req, res) => {
        let conn;
        try {
            conn = await getConnection(req);
            const { record, events, error } = await loadRecord(conn, k, req.params.id);
            if (error) return res.status(404).json({ error });
            if (record.status === 'final') {
                return res.status(409).json({ error: `This ${k.label} is already filed.` });
            }
            if (!record[k.numberCol]) {
                return res.status(400).json({ error: 'A report number is required before filing.' });
            }
            if (!record.train_no) {
                return res.status(400).json({ error: 'A train number is required before filing.' });
            }

            const html = k.page(record, events);

            await conn.beginTransaction();
            const [doc] = await conn.query(
                `INSERT INTO div_documents
                   (title, category, description, doc_date, folder, body_html,
                    language, source_type, status, header, uploaded_by)
                 VALUES (?, 'SSE_HQ_REPORT', ?, ?, ?, ?, 'en', 'composed', 'final', ?, ?)`,
                [
                    k.title(record),
                    k.subject(record),
                    // SSE_HQ_REPORT is in DATE_TREE_CATEGORIES, so the repository
                    // files it under Year → Month by this column. The old code
                    // inserted NULL here and every report landed in "Undated".
                    record[k.dateCol],
                    k.folder,
                    html,
                    JSON.stringify({ ref_no: record[k.numberCol], kind: kindKey,
                                     train_no: record.train_no, loco_number: record.loco_number }),
                    req.session.user.username,
                ]
            );
            await conn.query(
                `UPDATE ${k.table} SET status = 'final', document_id = ?, finalized_at = NOW()
                  WHERE id = ? AND status = 'draft'`, [doc.insertId, record.id]
            );
            await conn.commit();
            res.json({ success: true, document_id: doc.insertId });
        } catch (e) {
            if (conn) { try { await conn.rollback(); } catch (_) { /* already rolled back */ } }
            console.error(`ssehq ${kindKey} finalize:`, e);
            res.status(500).json({ error: `Failed to file the ${k.label}` });
        } finally { if (conn) conn.release(); }
    });

    /* reopen — the SSE-HQ desk may reopen its own filed reports.
     *
     * Cadre letters keep this admin-only, but these are the desk's own working
     * documents and a correction should not require finding an admin: a wrong
     * loco number on a detention report is noticed by the person who typed it,
     * usually minutes later. Reopening still removes the filed copy from the
     * repository, so nobody is left reading a version that no longer matches.
     * Role-based rather than created_by, because SSE-HQ is a shared desk and a
     * report must stay correctable if the account that wrote it changes. */
    router.post(`${base}/:id/unfinalize`, async (req, res) => {
        let conn;
        try {
            conn = await getConnection(req);
            const [[record]] = await conn.query(
                `SELECT id, status, document_id FROM ${k.table} WHERE id = ?`, [req.params.id]);
            if (!record) return res.status(404).json({ error: `${k.label} not found` });
            if (record.status !== 'final') return res.status(409).json({ error: `This ${k.label} is not filed.` });

            await conn.beginTransaction();
            await conn.query(
                `UPDATE ${k.table} SET status = 'draft', document_id = NULL, finalized_at = NULL
                  WHERE id = ?`, [record.id]);
            if (record.document_id) {
                // Composed documents have no file on disk — deleting the row is
                // enough, and it must go or the repository keeps showing a copy
                // that no longer matches the report.
                await conn.query(
                    'DELETE FROM div_documents WHERE id = ? AND source_type = ?',
                    [record.document_id, 'composed']);
            }
            await conn.commit();
            res.json({ success: true });
        } catch (e) {
            if (conn) { try { await conn.rollback(); } catch (_) { /* already rolled back */ } }
            console.error(`ssehq ${kindKey} unfinalize:`, e);
            res.status(500).json({ error: `Failed to reopen the ${k.label}` });
        } finally { if (conn) conn.release(); }
    });

    // delete — drafts only
    router.delete(`${base}/:id`, async (req, res) => {
        try {
            const [[record]] = await req.app.locals.pool.query(
                `SELECT id, status, created_by FROM ${k.table} WHERE id = ?`, [req.params.id]);
            if (!record) return res.status(404).json({ error: `${k.label} not found` });
            if (record.status !== 'draft') {
                return res.status(409).json({ error: 'A filed report cannot be deleted. Reopen it first.' });
            }
            if (!isAdmin(req) && record.created_by !== req.session.user.username) {
                return res.status(403).json({ error: 'You can only delete your own drafts.' });
            }
            // Events go with it — fk_ssehq_*_event is ON DELETE CASCADE.
            await req.app.locals.pool.query(`DELETE FROM ${k.table} WHERE id = ?`, [record.id]);
            res.json({ success: true });
        } catch (e) {
            console.error(`ssehq ${kindKey} delete:`, e);
            res.status(500).json({ error: `Failed to delete the ${k.label}` });
        }
    });

    // printable page and Word download
    router.get(`${base}/:id/print`, async (req, res) => {
        let conn;
        try {
            conn = await getConnection(req);
            const { record, events, error } = await loadRecord(conn, k, req.params.id);
            if (error) return res.status(404).send(error);
            res.type('html').send(k.page(record, events));
        } catch (e) {
            console.error(`ssehq ${kindKey} print:`, e);
            res.status(500).send(`Failed to render the ${k.label}`);
        } finally { if (conn) conn.release(); }
    });

    router.get(`${base}/:id/word`, async (req, res) => {
        let conn;
        try {
            conn = await getConnection(req);
            const { record, events, error } = await loadRecord(conn, k, req.params.id);
            if (error) return res.status(404).send(error);
            // Report numbers contain slashes ("BB/Tech/2"), so strip only what a
            // filename cannot hold rather than flattening every punctuation mark.
            const name = String(k.title(record))
                .replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
            res.setHeader('Content-Type', 'application/msword; charset=utf-8');
            res.setHeader('Content-Disposition',
                `attachment; filename="${name}.doc"; filename*=UTF-8''${encodeURIComponent(name)}.doc`);
            res.send(k.word(record, events));
        } catch (e) {
            console.error(`ssehq ${kindKey} word:`, e);
            res.status(500).send(`Failed to build the ${k.label} Word file`);
        } finally { if (conn) conn.release(); }
    });
}

mount('opr', '/opr');
mount('note', '/delogging');

// ── GET /opr/:id/as-note ───────────────────────────────────────────────────
// A DElogging Note prefilled from an OPR, returned UNSAVED. Both documents
// describe one incident, so retyping the train, loco, crew, punctuality,
// repercussion and the whole chronology was the bulk of writing the second
// one. Deliberately no FK back to the OPR: once the note exists it is its own
// document, and editing it must never rewrite the report already filed.

router.get('/opr/:id/as-note', async (req, res) => {
    let conn;
    try {
        conn = await getConnection(req);
        const { record: r, events, error } = await loadRecord(conn, KIND.opr, req.params.id);
        if (error) return res.status(404).json({ error });

        // The subject is prose on an official note, so the date reads the way
        // the division writes it (01.08.2026), not the way it is stored.
        const detained = [r.train_no, r.failure_date && `of dated ${fmtDate(r.failure_date)}`]
            .filter(Boolean).join(' ');
        res.json({
            note: {
                note_no: r.report_no,
                note_date: today(),
                subject_text: `Delogging of Train No. ${detained || '________'}.`,
                train_no: r.train_no,
                train_date: r.failure_date,
                loco_number: r.loco_number,
                loco_type: r.loco_type,
                loco_base: r.loco_base,
                loco_commission_date: r.loco_commission_date,
                staff_hrms_id: r.lp_staff_hrms_id,
                staff_name: r.lp_name,
                body_text: r.detention_text,
                punctuality_text: r.punctuality_text,
                repercussion_text: r.repercussion_text,
                statements_text: r.reported_text,
                conclusion_text: r.reason_text,
                signing_text: 'DEE(TRO)BB',
                forwarding_text: DEFAULT_FORWARDING,
            },
            events: events.map((e) => ({ event_time: e.event_time, description: e.description })),
            from_opr: { id: r.id, report_no: r.report_no },
        });
    } catch (e) {
        console.error('ssehq as-note:', e);
        res.status(500).json({ error: 'Failed to build the note from this OPR' });
    } finally { if (conn) conn.release(); }
});

module.exports = router;
