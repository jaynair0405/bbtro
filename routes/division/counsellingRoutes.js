/**
 * counsellingRoutes.js — CLI counselling (SPAD Prevention, phase 1)
 * Mounted at /api/division/counselling
 *
 * Backs the CLI PWA at public/cli/. Replaces the register-photo-over-WhatsApp
 * workflow: the lobby CLI records the actual staff counselled, and the division
 * consolidated sheet the officers see is DERIVED from those names rather than
 * typed in from a headcount.
 *
 *   GET    /bootstrap              → me, topics, sheet columns, depot order
 *   GET    /roster                 → my nominated staff + last counselled + pending
 *   GET    /lobby-roster           → the whole lobby's running staff (the picker)
 *   GET    /sessions               → session list (scoped)
 *   GET    /sessions/:id           → one session with attendees
 *   POST   /sessions               → create (idempotent on client_uuid)
 *   PUT    /sessions/:id           → edit
 *   DELETE /sessions/:id           → delete
 *   POST   /sessions/:id/photo     → attach the register photo
 *   GET    /sessions/:id/photo     → view it
 *   GET    /sheet                  → depot × designation matrix
 *   GET    /sheet/cell             → the names behind one cell
 *   GET    /sheet/export           → the matrix as .xlsx
 *   POST   /locks   DELETE /locks  → HQ freezes / reopens a day
 *   GET    /topics  PUT /topics/:id→ read / set the counselling cycle
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');

// The SAME file the browser loads. See its header for why this is shared.
const D = require('../../public/cli/js/cli-derive.js');

const SPAD = 'SPAD';

/* "Not Assigned" is a PLACEHOLDER row in div_cli_master, not a person — staff are
   parked under it while on long training or under punishment. It is the only CLI
   with no CMS ID, which is also why it can never have a login. Everywhere the app
   offers a CLI to a human, this excludes it. */
const REAL_CLI = `c.cmsid IS NOT NULL AND c.cmsid <> ''`;

/**
 * What the counselling was about.
 *
 * The default is the standing topic; the other three are the instruction being
 * counselled against, and each needs its number typed in — which is why they
 * carry a `numbered` flag rather than being plain strings. Storing the number
 * inside the subject text keeps it visible on the officers' sheet without a
 * further column.
 */
const SUBJECT_OPTIONS = [
  { key: 'SIGNAL_VIGILANCE', label: 'Signal Vigilance and SPAD Awareness', numbered: false },
  { key: 'SR_DEE',           label: 'Sr DEE Instruction',                  numbered: true },
  { key: 'CEE_OP',           label: 'CEE OP Instruction',                  numbered: true },
  { key: 'SAFETY_CIRCULAR',  label: 'Safety Circular',                     numbered: true },
];
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'counselling');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_PHOTO = 8 * 1024 * 1024; // 8 MB — a phone camera shot of a register
const PHOTO_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname || '') || '.jpg').toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: MAX_PHOTO },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(1).toLowerCase();
    cb(PHOTO_EXT.has(ext) ? null : new Error('Only image files are accepted'), PHOTO_EXT.has(ext));
  },
});

// ── Access ────────────────────────────────────────────────────────────────

const HQ_ROLES = new Set(['division_admin']);
const ENTRY_ROLES = new Set(['cli', 'division_admin']);

function access(req, res, next) {
  const u = req.session?.user;
  if (!u || u.realm !== 'division') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const role = u.div_role;
  if (!ENTRY_ROLES.has(role)) {
    return res.status(403).json({ error: 'CLI counselling access required' });
  }
  req.isHQ = HQ_ROLES.has(role);
  next();
}
router.use(access);

/* A bulk-generated account is on a password HQ read out over the phone. Until it
   is replaced, the account may look around but may not write — otherwise the
   "counselled by" on a permanent record could be anyone who overheard it.
   Reads stay open so the redirect target can load and explain itself. */
router.use((req, res, next) => {
  if (!req.session.user?.must_change_password) return next();
  if (req.method === 'GET') return next();
  return res.status(403).json({
    error: 'Change your password before recording anything.',
    must_change_password: true,
  });
});

/**
 * The per-lobby scope, in ONE place.
 *
 * This repo's usual idiom is to paste `if (role !== 'division_admin') query +=
 * ' AND office = ?'` into each handler — it appears ~40 times, and any handler
 * that forgets it leaks another lobby's staff. Here every query calls this
 * instead, so forgetting is a missing argument rather than a silent leak.
 *
 * Returns { sql, params } to AND into a WHERE clause. HQ may narrow to one
 * lobby with ?office=; a lobby CLI is pinned to their own.
 */
function scopeOffice(req, column) {
  const mine = req.session.user?.div_office_code || null;
  if (!req.isHQ) {
    if (!mine) return { sql: ` AND 1=0 `, params: [] }; // no lobby → no data, never all data
    return { sql: ` AND ${column} = ? `, params: [mine] };
  }
  const want = (req.query.office || '').trim();
  return want ? { sql: ` AND ${column} = ? `, params: [want] } : { sql: '', params: [] };
}

function actorLabel(req) {
  const u = req.session.user || {};
  return `${u.full_name || u.username || 'unknown'} (${u.username || '-'})`;
}

async function audit(conn, req, sessionId, action, detail) {
  await conn.query(
    `INSERT INTO div_counselling_audit (session_id, action, actor_user_id, actor_label, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, action, req.session.user?.id || null, actorLabel(req), JSON.stringify(detail || {})]
  );
}

/**
 * Normalise anything date-shaped to YYYY-MM-DD, or null.
 *
 * mysql2 hands back a DATE column as a JS Date at LOCAL midnight, so this has
 * to accept Date as well as a string — an earlier version did not, and every
 * lock check on a value read back from the database silently compared against
 * null, i.e. never locked.
 *
 * The local getters are deliberate: toISOString() would shift IST local
 * midnight back to 18:30 UTC the previous day and report the wrong date.
 */
const isoDate = (v) => {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const p = (n) => String(n).padStart(2, '0');
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  const s = String(v || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
const today = () => new Date().toISOString().slice(0, 10);

async function topicByCode(conn, code) {
  const [[t]] = await conn.query(
    `SELECT topic_id, topic_code, topic_name, cycle_days FROM div_counselling_topics WHERE topic_code = ?`,
    [code || SPAD]
  );
  return t || null;
}

/** Is (date, topic, lobby) frozen? HQ may still write; a lobby CLI may not. */
async function isLocked(conn, date, topicId, office) {
  const [[row]] = await conn.query(
    `SELECT 1 AS locked FROM div_counselling_locks
      WHERE lock_date = ? AND topic_id = ? AND office_code = ?`,
    [date, topicId, office]
  );
  return !!row;
}

function hqOnly(req, res, next) {
  if (!req.isHQ) return res.status(403).json({ error: 'HQ access required' });
  next();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

router.get('/bootstrap', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const u = req.session.user;

    let cli = null;
    if (u.cli_id) {
      const [[row]] = await conn.query(
        `SELECT cli_id, cli_name, cmsid, current_office_code FROM div_cli_master WHERE cli_id = ?`,
        [u.cli_id]
      );
      cli = row || null;
    }

    const [topics] = await conn.query(
      `SELECT topic_id, topic_code, topic_name, cycle_days
         FROM div_counselling_topics WHERE is_active = 1 ORDER BY sort_order, topic_name`
    );

    // The "on behalf of" list: any active CLI in the same lobby. HQ sees all.
    const scope = req.isHQ ? { sql: '', params: [] }
      : { sql: ' AND c.current_office_code = ? ', params: [u.div_office_code] };
    const [clis] = await conn.query(
      `SELECT c.cli_id, c.cli_name, c.current_office_code
         FROM div_cli_master c
        WHERE c.is_active = 1 AND ${REAL_CLI} ${scope.sql}
        ORDER BY c.cli_name`, scope.params
    );

    // Lobbies, for the venue picker. Every active CLI but one carries a
    // current_office_code, so the venue prefills from it and is only ever
    // changed when counselling happened somewhere else.
    const [offices] = await conn.query(
      `SELECT office_code, office_name FROM offices
        WHERE is_active = 1 AND office_code <> 'OTHER' ORDER BY office_name`
    );

    conn.release();
    res.json({
      offices,
      subjects: SUBJECT_OPTIONS,
      me: {
        user_id: u.id,
        username: u.username,
        full_name: u.full_name,
        div_role: u.div_role,
        office_code: u.div_office_code,
        cli_id: cli ? cli.cli_id : null,
        cli_name: cli ? cli.cli_name : null,
        is_hq: req.isHQ,
        must_change_password: !!u.must_change_password,
      },
      topics,
      clis,
      columns: D.DESIGNATION_COLUMNS,
      depots: D.DEPOT_ORDER,
      today: today(),
    });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/bootstrap:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── Rosters ───────────────────────────────────────────────────────────────

const RUNNING_IDS = D.RUNNING_DESIGNATION_IDS;

/**
 * The roster query, shared by /roster and /lobby-roster.
 * `last_counselled` is the most recent session date for this topic across ALL
 * lobbies — a staff member counselled at KYN last week is not due again just
 * because they were counselled elsewhere.
 */
function rosterSql(extraWhere) {
  return `
    SELECT s.hrms_id, s.name, s.current_cms_id, s.pf_number,
           s.designation_id, dg.designation_code, s.current_office_code,
           s.current_cli_id,
           (SELECT MAX(cs.session_date)
              FROM div_counselling_attendees ca
              JOIN div_counselling_sessions  cs ON cs.session_id = ca.session_id
             WHERE ca.staff_hrms_id = s.hrms_id AND cs.topic_id = ?) AS last_counselled,
           -- How often this person has been counselled recently. A staff member
           -- counselled four times in a quarter and one counselled once both read
           -- as "done" against the cycle; this is what tells them apart.
           (SELECT COUNT(DISTINCT cs2.session_id)
              FROM div_counselling_attendees ca2
              JOIN div_counselling_sessions  cs2 ON cs2.session_id = ca2.session_id
             WHERE ca2.staff_hrms_id = s.hrms_id AND cs2.topic_id = ?
               AND cs2.session_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)) AS count_90d
      FROM div_staff_master s
      JOIN designations dg ON dg.id = s.designation_id
     WHERE s.status = 'Active'
       AND s.designation_id IN (${RUNNING_IDS.join(',')})
       ${extraWhere}`;
}

function decorate(rows, cycleDays) {
  const t = today();
  return rows.map((r) => {
    // isoDate FIRST. MAX(session_date) comes back as a Date, and both the
    // string sent to the browser and the day arithmetic have to work off the
    // same normalised local calendar date — mixing a Date with an ISO string
    // is how an IST user ends up one day out.
    const last = isoDate(r.last_counselled);
    return {
      ...r,
      last_counselled: last,
      days_since: last ? D.daysBetween(last, t) : null,
      pending: D.isPending(last, cycleDays, t),
    };
  });
}

/** My nominated staff — the basis of the coverage figures on the Home screen. */
router.get('/roster', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.query.topic);
    if (!topic) { conn.release(); return res.status(400).json({ error: 'Unknown topic' }); }

    // HQ has no nominees of its own; ?cli= lets it look at any CLI's list.
    const cliId = req.isHQ ? (req.query.cli ? Number(req.query.cli) : null)
                           : (req.session.user.cli_id || null);
    if (!cliId) { conn.release(); return res.json({ topic, cli_id: null, staff: [], counts: { total: 0, done: 0, pending: 0 } }); }

    const [rows] = await conn.query(
      rosterSql(' AND s.current_cli_id = ? ') + ' ORDER BY s.name',
      [topic.topic_id, topic.topic_id, cliId]
    );

    // Where this CLI actually sits, so we can tell which nominees they can reach.
    const [[cliRow]] = await conn.query(
      `SELECT current_office_code FROM div_cli_master WHERE cli_id = ?`, [cliId]
    );
    const cliOffice = cliRow ? cliRow.current_office_code : null;

    /* What this CLI has personally counselled lately, split by whether the staff
       are their own nominees. Coverage answers "is my patch up to date"; this
       answers "what have I been doing" — a CLI who counsels 40 people a month,
       none of them nominated to them, looks idle on coverage alone. */
    const [[act]] = await conn.query(
      `SELECT COUNT(DISTINCT cs.session_id) AS sessions,
              COUNT(DISTINCT a.staff_hrms_id) AS staff_total,
              COUNT(DISTINCT CASE WHEN sm.current_cli_id = ? THEN a.staff_hrms_id END) AS staff_mine
         FROM div_counselling_sessions cs
         JOIN div_counselling_attendees a ON a.session_id = cs.session_id
         JOIN div_staff_master sm ON sm.hrms_id = a.staff_hrms_id
        WHERE cs.cli_id = ? AND cs.topic_id = ?
          AND cs.session_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [cliId, cliId, topic.topic_id, topic.cycle_days || 90]
    );
    conn.release();

    const depot = D.depotOf(cliOffice);
    const scope = D.staffScopeFor(cliOffice);
    const staff = decorate(rows, topic.cycle_days).map((r) => {
      // Two ways a nominee can be unreachable: they sit at another depot, or
      // their designation falls outside this CLI's half of the lobby (an LPG
      // promoted to motorman under a mainline CLI). Both are shown rather than
      // hidden — silently dropping them would make coverage look complete when
      // it is not.
      const offLobby = !!depot && D.depotOf(r.current_office_code) !== depot;
      const offScope = !offLobby && !D.inScope(scope, r.designation_id);
      return { ...r, off_lobby: offLobby, off_scope: offScope };
    });

    // Coverage counts EVERY nominee. Cross-lobby nomination is legitimate, and
    // the picker now lets a CLI select any of their own nominees, so there is no
    // such thing as a nominee who cannot be counselled. off_lobby / off_scope
    // remain as information — worth noticing, not worth excluding.
    const pending = staff.filter((x) => x.pending).length;
    res.json({
      topic,
      cli_id: cliId,
      cli_office: cliOffice,
      staff,
      counts: {
        total: staff.length,
        done: staff.length - pending,
        pending,
        off_lobby: staff.filter((x) => x.off_lobby).length,
        off_scope: staff.filter((x) => x.off_scope).length,
      },
      activity: {
        window_days: topic.cycle_days || 90,
        sessions: Number(act.sessions || 0),
        staff_total: Number(act.staff_total || 0),
        staff_mine: Number(act.staff_mine || 0),
        staff_others: Number(act.staff_total || 0) - Number(act.staff_mine || 0),
      },
    });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/roster:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

/**
 * The whole lobby, for the staff picker.
 *
 * A CLI counsels whoever is AVAILABLE in the lobby that day, not only their own
 * nominees — so the picker must search the entire lobby. The CLI's own nominees
 * come back flagged (`is_mine`) so the UI can pin them to the top.
 *
 * A lobby means both its halves: a CLI at CSMT-ML and one at CSMT-SUB share a
 * building, and a motorman may well be in the room. Scope is therefore by
 * DEPOT, matching the sheet.
 */
router.get('/lobby-roster', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.query.topic);
    if (!topic) { conn.release(); return res.status(400).json({ error: 'Unknown topic' }); }

    const mineOffice = req.session.user.div_office_code || '';
    const depot = req.isHQ
      ? (req.query.office ? D.depotOf(req.query.office) : null)
      : D.depotOf(mineOffice);

    // A mainline CLI does not counsel motormen and a suburban CLI counsels only
    // motormen — but at IGP / LNL / NRL, which are not split into -ML and -SUB,
    // motormen genuinely work alongside everyone else, so no filter applies.
    // See staffScopeFor() in cli-derive.js.
    const scope = req.isHQ && req.query.office ? D.staffScopeFor(req.query.office)
                : req.isHQ ? 'all'
                : D.staffScopeFor(mineOffice);

    const params = [topic.topic_id, topic.topic_id];
    let where = '';
    if (depot) {
      // CSMT → CSMT-ML + CSMT-SUB + a bare CSMT row should one ever exist.
      // Plus this CLI's own nominees at any depot — cross-lobby nomination is
      // routine in suburban, and those staff are still theirs to counsel.
      const mine = req.session.user.cli_id || null;
      where += ` AND (s.current_office_code = ? OR s.current_office_code = ? OR s.current_office_code = ?` +
               (mine ? ` OR s.current_cli_id = ?` : ``) + `) `;
      params.push(depot, `${depot}-ML`, `${depot}-SUB`);
      if (mine) params.push(mine);
    } else if (!req.isHQ) {
      where += ' AND 1=0 ';
    }

    /* The designation rule governs BROWSING the lobby: a mainline CLI should not
       wade through 381 motormen. It must not govern the CLI's OWN nominees.
       Cross-lobby nomination is normal in suburban, and a nominee who has been
       transferred or promoted is still that CLI's to counsel — excluding them
       would leave staff nobody could reach. So the scope filter is OR-ed with
       "is nominated to me". */
    const myCliId = req.session.user.cli_id || null;
    if (scope === 'motorman' || scope === 'non-motorman') {
      const op = scope === 'motorman' ? '=' : '<>';
      if (myCliId) {
        where += ` AND (s.designation_id ${op} ${D.MOTORMAN_ID} OR s.current_cli_id = ?) `;
        params.push(myCliId);
      } else {
        where += ` AND s.designation_id ${op} ${D.MOTORMAN_ID} `;
      }
    }

    const q = (req.query.q || '').trim();
    if (q) {
      where += ` AND (s.name LIKE ? OR s.current_cms_id LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ?) `;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [rows] = await conn.query(rosterSql(where) + ' ORDER BY s.name LIMIT 3000', params);
    conn.release();

    const myCli = req.session.user.cli_id || null;
    const staff = decorate(rows, topic.cycle_days)
      .map((r) => ({ ...r, is_mine: !!myCli && r.current_cli_id === myCli }));
    res.json({
      topic,
      depot,
      scope,
      staff,
      // The designation filter's options come from what is actually in this
      // lobby, so a mainline CLI is never offered an empty "M/Man" chip.
      designations: D.DESIGNATION_COLUMNS
        .filter((c) => staff.some((s2) => c.ids.indexOf(Number(s2.designation_id)) >= 0))
        .map((c) => ({ key: c.key, label: c.label, ids: c.ids,
                       n: staff.filter((s2) => c.ids.indexOf(Number(s2.designation_id)) >= 0).length })),
      counts: {
        total: staff.length,
        mine: staff.filter((s2) => s2.is_mine).length,
        others: staff.filter((s2) => !s2.is_mine).length,
      },
    });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/lobby-roster:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── Sessions ──────────────────────────────────────────────────────────────

router.get('/sessions', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.query.topic);
    const from = isoDate(req.query.from);
    const to = isoDate(req.query.to);

    const params = [topic.topic_id];
    let where = ' WHERE cs.topic_id = ? ';
    if (from) { where += ' AND cs.session_date >= ? '; params.push(from); }
    if (to) { where += ' AND cs.session_date <= ? '; params.push(to); }

    const scope = scopeOffice(req, 'cs.office_code');
    where += scope.sql; params.push(...scope.params);

    // A lobby CLI sees the whole lobby's sessions (they cover for each other),
    // but ?mine=1 narrows to their own.
    if (req.query.mine === '1' && req.session.user.cli_id) {
      where += ' AND cs.cli_id = ? '; params.push(req.session.user.cli_id);
    }

    const [rows] = await conn.query(
      `SELECT cs.session_id, cs.client_uuid, cs.session_date, cs.topic_id, cs.cli_id,
              cm.cli_name, cs.office_code, cs.subject, cs.venue, cs.remarks,
              cs.register_photo_path IS NOT NULL AS has_photo, cs.created_at,
              (SELECT COUNT(*) FROM div_counselling_attendees a WHERE a.session_id = cs.session_id) AS staff_count,
              (SELECT COUNT(*) FROM div_counselling_locks l
                WHERE l.lock_date = cs.session_date AND l.topic_id = cs.topic_id
                  AND l.office_code = cs.office_code) AS is_locked
         FROM div_counselling_sessions cs
         LEFT JOIN div_cli_master cm ON cm.cli_id = cs.cli_id
         ${where}
        ORDER BY cs.session_date DESC, cs.session_id DESC
        LIMIT 500`, params
    );
    conn.release();
    // Normalise before serialising: a raw Date would go out as a UTC timestamp
    // and render as the PREVIOUS day for every IST user.
    res.json({ sessions: rows.map((r) => ({ ...r, session_date: isoDate(r.session_date) })) });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/sessions:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.get('/sessions/:id', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const scope = scopeOffice(req, 'cs.office_code');
    const [[s]] = await conn.query(
      `SELECT cs.*, cm.cli_name
         FROM div_counselling_sessions cs
         LEFT JOIN div_cli_master cm ON cm.cli_id = cs.cli_id
        WHERE cs.session_id = ? ${scope.sql}`,
      [req.params.id, ...scope.params]
    );
    if (!s) { conn.release(); return res.status(404).json({ error: 'Session not found' }); }

    const [attendees] = await conn.query(
      `SELECT a.attendee_id, a.staff_hrms_id, a.designation_id, a.office_code, a.remarks,
              s.name, s.current_cms_id, dg.designation_code
         FROM div_counselling_attendees a
         JOIN div_staff_master s ON s.hrms_id = a.staff_hrms_id
         JOIN designations dg ON dg.id = a.designation_id
        WHERE a.session_id = ?
        ORDER BY s.name`, [req.params.id]
    );
    const locked = await isLocked(conn, isoDate(s.session_date), s.topic_id, s.office_code);
    conn.release();
    res.json({
      session: { ...s, session_date: isoDate(s.session_date), has_photo: !!s.register_photo_path },
      attendees,
      locked,
      can_edit: req.isHQ || !locked,
    });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/session:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

/**
 * Create a session.
 *
 * IDEMPOTENT on client_uuid. The phone generates the uuid before it ever tries
 * to POST, so an offline outbox that flushes twice — or a user who taps Submit
 * on a stalled connection — lands exactly one session. Without this, a flaky
 * lobby network turns straight into double counts on the officers' sheet.
 */
router.post('/sessions', async (req, res) => {
  const b = req.body || {};
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, b.topic_code);
    if (!topic) { conn.release(); return res.status(400).json({ error: 'Unknown topic' }); }

    const clientUuid = String(b.client_uuid || '').trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(clientUuid)) {
      conn.release(); return res.status(400).json({ error: 'client_uuid is required' });
    }

    // Replay of an already-accepted submission → return the original, unchanged.
    const [[existing]] = await conn.query(
      `SELECT session_id FROM div_counselling_sessions WHERE client_uuid = ?`, [clientUuid]
    );
    if (existing) {
      conn.release();
      return res.json({ success: true, session_id: existing.session_id, duplicate: true });
    }

    const date = isoDate(b.session_date);
    if (!date) { conn.release(); return res.status(400).json({ error: 'A valid session_date is required' }); }
    if (date > today()) { conn.release(); return res.status(400).json({ error: 'Counselling cannot be dated in the future' }); }

    const cliId = Number(b.cli_id || req.session.user.cli_id || 0);
    if (!cliId) { conn.release(); return res.status(400).json({ error: 'A counselling CLI must be named' }); }

    const [[cli]] = await conn.query(
      `SELECT cli_id, current_office_code FROM div_cli_master WHERE cli_id = ? AND is_active = 1`, [cliId]
    );
    if (!cli) { conn.release(); return res.status(400).json({ error: 'Unknown or inactive CLI' }); }

    // A lobby CLI may only file against their own lobby, whoever they name as
    // the counsellor. HQ may file anywhere.
    const office = req.isHQ ? (b.office_code || cli.current_office_code)
                            : req.session.user.div_office_code;
    if (!office) { conn.release(); return res.status(400).json({ error: 'No lobby on your account' }); }
    if (!req.isHQ && D.depotOf(cli.current_office_code) !== D.depotOf(office)) {
      conn.release(); return res.status(403).json({ error: 'That CLI belongs to another lobby' });
    }

    if (!req.isHQ && await isLocked(conn, date, topic.topic_id, office)) {
      conn.release(); return res.status(409).json({ error: 'That date has been locked by HQ. Ask HQ to reopen it.' });
    }

    const hrmsIds = Array.from(new Set((b.staff || []).map((s) => String(s.hrms_id || s).trim()).filter(Boolean)));
    if (!hrmsIds.length) { conn.release(); return res.status(400).json({ error: 'Name at least one staff member' }); }

    // Snapshot designation + office from the master AS AT NOW. See the sql
    // migration for why these are copied rather than joined at read time.
    //
    // status='Active' is checked HERE, not just in the picker. A phone can hold a
    // cached roster for days and flush it from the outbox later, so the staff it
    // names may since have been drafted out or medically decategorised. The
    // picker never offers them; this is what stops a stale queue slipping one in.
    const [staffRows] = await conn.query(
      `SELECT hrms_id, designation_id, current_office_code FROM div_staff_master
        WHERE hrms_id IN (?) AND status = 'Active'
          AND designation_id IN (${RUNNING_IDS.join(',')})`, [hrmsIds]
    );
    if (staffRows.length !== hrmsIds.length) {
      const found = new Set(staffRows.map((r) => r.hrms_id));
      // Name them. This can surface days later when an offline queue flushes,
      // by which time "some staff were rejected" would be useless to the CLI.
      const missing = hrmsIds.filter((h) => !found.has(h));
      const [why] = await conn.query(
        `SELECT hrms_id, name, status FROM div_staff_master WHERE hrms_id IN (?)`, [missing]
      );
      conn.release();
      return res.status(400).json({
        error: 'Some staff are no longer on the running roster',
        details: missing.map((h) => {
          const w = why.find((x) => x.hrms_id === h);
          return w ? `${w.name} (${w.status})` : `${h} (not found)`;
        }).join(', '),
      });
    }
    const remarkBy = {};
    (b.staff || []).forEach((s) => { if (s && s.hrms_id && s.remarks) remarkBy[s.hrms_id] = String(s.remarks).slice(0, 500); });

    await conn.beginTransaction();
    const [ins] = await conn.query(
      `INSERT INTO div_counselling_sessions
         (client_uuid, session_date, topic_id, cli_id, office_code, subject, venue, remarks, entered_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientUuid, date, topic.topic_id, cliId, office,
       (b.subject || '').trim() || null, (b.venue || '').trim() || null,
       (b.remarks || '').trim() || null, req.session.user.id || null]
    );
    const sessionId = ins.insertId;
    await conn.query(
      `INSERT INTO div_counselling_attendees (session_id, staff_hrms_id, designation_id, office_code, remarks)
       VALUES ?`,
      [staffRows.map((r) => [sessionId, r.hrms_id, r.designation_id, r.current_office_code, remarkBy[r.hrms_id] || null])]
    );
    await audit(conn, req, sessionId, 'create', { date, office, cli_id: cliId, staff: staffRows.length });
    await conn.commit();
    conn.release();
    res.json({ success: true, session_id: sessionId, staff_count: staffRows.length });
  } catch (e) {
    if (conn) { try { await conn.rollback(); } catch (_) {} conn.release(); }
    // Two devices replaying the same uuid at once: the unique key wins, and the
    // loser reports success rather than an error the CLI cannot act on.
    if (e && e.code === 'ER_DUP_ENTRY') return res.json({ success: true, duplicate: true });
    console.error('counselling/create:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.put('/sessions/:id', async (req, res) => {
  const b = req.body || {};
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const scope = scopeOffice(req, 'office_code');
    const [[s]] = await conn.query(
      `SELECT * FROM div_counselling_sessions WHERE session_id = ? ${scope.sql}`,
      [req.params.id, ...scope.params]
    );
    if (!s) { conn.release(); return res.status(404).json({ error: 'Session not found' }); }

    const date = isoDate(b.session_date) || isoDate(s.session_date);
    if (!req.isHQ && await isLocked(conn, isoDate(s.session_date), s.topic_id, s.office_code)) {
      conn.release(); return res.status(409).json({ error: 'That date has been locked by HQ.' });
    }

    await conn.beginTransaction();
    await conn.query(
      `UPDATE div_counselling_sessions
          SET session_date = ?, cli_id = ?, subject = ?, venue = ?, remarks = ?
        WHERE session_id = ?`,
      [date, Number(b.cli_id || s.cli_id), (b.subject ?? s.subject) || null,
       (b.venue ?? s.venue) || null, (b.remarks ?? s.remarks) || null, s.session_id]
    );

    if (Array.isArray(b.staff)) {
      const hrmsIds = Array.from(new Set(b.staff.map((x) => String(x.hrms_id || x).trim()).filter(Boolean)));
      if (!hrmsIds.length) {
        await conn.rollback(); conn.release();
        return res.status(400).json({ error: 'A session must name at least one staff member' });
      }
      const [staffRows] = await conn.query(
        `SELECT hrms_id, designation_id, current_office_code FROM div_staff_master
          WHERE hrms_id IN (?) AND status = 'Active'
            AND designation_id IN (${RUNNING_IDS.join(',')})`, [hrmsIds]
      );
      const remarkBy = {};
      b.staff.forEach((x) => { if (x && x.hrms_id && x.remarks) remarkBy[x.hrms_id] = String(x.remarks).slice(0, 500); });
      await conn.query(`DELETE FROM div_counselling_attendees WHERE session_id = ?`, [s.session_id]);
      await conn.query(
        `INSERT INTO div_counselling_attendees (session_id, staff_hrms_id, designation_id, office_code, remarks) VALUES ?`,
        [staffRows.map((r) => [s.session_id, r.hrms_id, r.designation_id, r.current_office_code, remarkBy[r.hrms_id] || null])]
      );
    }
    await audit(conn, req, s.session_id, 'update', { date, by_hq: req.isHQ });
    await conn.commit();
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) { try { await conn.rollback(); } catch (_) {} conn.release(); }
    console.error('counselling/update:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const scope = scopeOffice(req, 'office_code');
    const [[s]] = await conn.query(
      `SELECT * FROM div_counselling_sessions WHERE session_id = ? ${scope.sql}`,
      [req.params.id, ...scope.params]
    );
    if (!s) { conn.release(); return res.status(404).json({ error: 'Session not found' }); }
    if (!req.isHQ && await isLocked(conn, isoDate(s.session_date), s.topic_id, s.office_code)) {
      conn.release(); return res.status(409).json({ error: 'That date has been locked by HQ.' });
    }
    // Audit first: the row must outlive what it describes, which is why
    // div_counselling_audit has no FK to sessions.
    await audit(conn, req, s.session_id, 'delete',
      { date: isoDate(s.session_date), office: s.office_code, cli_id: s.cli_id });
    await conn.query(`DELETE FROM div_counselling_sessions WHERE session_id = ?`, [s.session_id]);
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/delete:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── Register photo ────────────────────────────────────────────────────────
// Uploaded separately from the session so the offline outbox never has to carry
// a multi-megabyte blob: the session syncs first, the photo follows.

router.post('/sessions/:id/photo', upload.single('photo'), async (req, res) => {
  let conn;
  try {
    if (!req.file) return res.status(400).json({ error: 'No image received' });
    conn = await req.app.locals.pool.getConnection();
    const scope = scopeOffice(req, 'office_code');
    const [[s]] = await conn.query(
      `SELECT session_id, register_photo_path FROM div_counselling_sessions WHERE session_id = ? ${scope.sql}`,
      [req.params.id, ...scope.params]
    );
    if (!s) { conn.release(); fs.unlink(req.file.path, () => {}); return res.status(404).json({ error: 'Session not found' }); }
    if (s.register_photo_path) {
      fs.unlink(path.join(UPLOAD_DIR, s.register_photo_path), () => {}); // replace, don't orphan
    }
    await conn.query(`UPDATE div_counselling_sessions SET register_photo_path = ? WHERE session_id = ?`,
      [req.file.filename, s.session_id]);
    await audit(conn, req, s.session_id, 'photo', { file: req.file.filename });
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/photo:', e);
    res.status(500).json({ error: 'Upload failed', details: e.message });
  }
});

router.get('/sessions/:id/photo', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const scope = scopeOffice(req, 'office_code');
    const [[s]] = await conn.query(
      `SELECT register_photo_path FROM div_counselling_sessions WHERE session_id = ? ${scope.sql}`,
      [req.params.id, ...scope.params]
    );
    conn.release();
    if (!s || !s.register_photo_path) return res.status(404).json({ error: 'No photo' });
    res.sendFile(path.join(UPLOAD_DIR, s.register_photo_path));
  } catch (e) {
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── The consolidated sheet ────────────────────────────────────────────────

/** Shared by /sheet and /sheet/export. */
async function sheetData(conn, req) {
  const topic = await topicByCode(conn, req.query.topic);
  const from = isoDate(req.query.from) || isoDate(req.query.date) || today();
  const to = isoDate(req.query.to) || isoDate(req.query.date) || from;

  const params = [topic.topic_id, from, to];
  let where = ' WHERE cs.topic_id = ? AND cs.session_date BETWEEN ? AND ? ';
  const scope = scopeOffice(req, 'cs.office_code');
  where += scope.sql; params.push(...scope.params);

  // Aggregate on the attendee's SNAPSHOT office/designation, not the session's
  // and not the staff master's — that is what keeps an old sheet reproducible.
  const [rows] = await conn.query(
    `SELECT a.office_code, a.designation_id, COUNT(DISTINCT a.staff_hrms_id) AS n
       FROM div_counselling_attendees a
       JOIN div_counselling_sessions cs ON cs.session_id = a.session_id
       ${where}
      GROUP BY a.office_code, a.designation_id`, params
  );

  const sheet = D.buildSheet(rows);
  const [locks] = await conn.query(
    `SELECT lock_date, office_code, locked_at, actor.full_name AS locked_by
       FROM div_counselling_locks l
       LEFT JOIN users actor ON actor.id = l.locked_by_user_id
      WHERE l.topic_id = ? AND l.lock_date BETWEEN ? AND ?`, [topic.topic_id, from, to]
  );
  return { topic, from, to, ...sheet, locks: locks.map((l) => ({ ...l, lock_date: isoDate(l.lock_date) })) };
}

router.get('/sheet', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const data = await sheetData(conn, req);

    // Which lobbies have filed nothing at all for this date? On paper a missing
    // lobby was indistinguishable from a lobby that counselled nobody.
    const [filed] = await conn.query(
      `SELECT DISTINCT cs.office_code FROM div_counselling_sessions cs
        WHERE cs.topic_id = ? AND cs.session_date BETWEEN ? AND ?`,
      [data.topic.topic_id, data.from, data.to]
    );
    const filedDepots = new Set(filed.map((r) => D.depotOf(r.office_code)));
    conn.release();
    res.json({ ...data, not_filed: D.DEPOT_ORDER.filter((d) => !filedDepots.has(d)) });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/sheet:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

/** The names behind one cell — the thing the paper register could never do. */
router.get('/sheet/cell', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.query.topic);
    const from = isoDate(req.query.from) || isoDate(req.query.date) || today();
    const to = isoDate(req.query.to) || isoDate(req.query.date) || from;
    const depot = (req.query.depot || '').toUpperCase();
    const col = D.DESIGNATION_COLUMNS.find((c) => c.key === req.query.column);

    const params = [topic.topic_id, from, to];
    let where = ' WHERE cs.topic_id = ? AND cs.session_date BETWEEN ? AND ? ';
    if (depot && depot !== 'OTHER') {
      where += ' AND (a.office_code = ? OR a.office_code = ? OR a.office_code = ?) ';
      params.push(depot, `${depot}-ML`, `${depot}-SUB`);
    }
    if (col) { where += ` AND a.designation_id IN (${col.ids.join(',')}) `; }
    const scope = scopeOffice(req, 'cs.office_code');
    where += scope.sql; params.push(...scope.params);

    const [rows] = await conn.query(
      `SELECT s.name, s.current_cms_id, a.staff_hrms_id, dg.designation_code,
              a.office_code, a.remarks, cs.session_date, cm.cli_name, cs.session_id
         FROM div_counselling_attendees a
         JOIN div_counselling_sessions cs ON cs.session_id = a.session_id
         JOIN div_staff_master s ON s.hrms_id = a.staff_hrms_id
         JOIN designations dg ON dg.id = a.designation_id
         LEFT JOIN div_cli_master cm ON cm.cli_id = cs.cli_id
         ${where}
        ORDER BY s.name LIMIT 1000`, params
    );
    conn.release();
    res.json({ staff: rows.map((r) => ({ ...r, session_date: isoDate(r.session_date) })) });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/sheet-cell:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.get('/sheet/export', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const d = await sheetData(conn, req);
    conn.release();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('SPAD Counselling');
    const title = d.from === d.to ? d.from : `${d.from} to ${d.to}`;

    ws.mergeCells(1, 1, 1, d.columns.length + 2);
    ws.getCell(1, 1).value = `${d.topic.topic_name.toUpperCase()} — ${title}`;
    ws.getCell(1, 1).font = { bold: true, size: 14 };
    ws.getCell(1, 1).alignment = { horizontal: 'center' };

    ws.getRow(3).values = ['Depot', ...d.columns.map((c) => c.label), 'TOTAL'];
    ws.getRow(3).font = { bold: true };
    d.rows.forEach((r) => ws.addRow([r.depot, ...d.columns.map((c) => r.counts[c.key]), r.total]));
    const totalRow = ws.addRow(['TOTAL', ...d.columns.map((c) => d.colTotals[c.key]), d.grandTotal]);
    totalRow.font = { bold: true };
    ws.columns.forEach((c) => { c.width = 12; });
    ws.getColumn(1).width = 16;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="spad-counselling-${d.from}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/export:', e);
    res.status(500).json({ error: 'Export failed', details: e.message });
  }
});

// ── Locks ─────────────────────────────────────────────────────────────────

router.post('/locks', hqOnly, async (req, res) => {
  let conn;
  try {
    const date = isoDate(req.body?.date);
    if (!date) return res.status(400).json({ error: 'A valid date is required' });
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.body?.topic_code);
    // No office named → lock every depot for that day, which is what "the sheet
    // has gone to the officers" actually means.
    const offices = req.body?.office_code ? [req.body.office_code] : D.DEPOT_ORDER;
    for (const o of offices) {
      await conn.query(
        `INSERT INTO div_counselling_locks (lock_date, topic_id, office_code, locked_by_user_id, note)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE locked_by_user_id = VALUES(locked_by_user_id),
                                 locked_at = CURRENT_TIMESTAMP, note = VALUES(note)`,
        [date, topic.topic_id, o, req.session.user.id || null, (req.body?.note || '').slice(0, 255) || null]
      );
      // A depot label locks both halves of the lobby.
      if (D.DEPOT_ORDER.includes(o)) {
        for (const suffix of ['-ML', '-SUB']) {
          await conn.query(
            `INSERT IGNORE INTO div_counselling_locks (lock_date, topic_id, office_code, locked_by_user_id, note)
             VALUES (?, ?, ?, ?, ?)`,
            [date, topic.topic_id, o + suffix, req.session.user.id || null, null]
          );
        }
      }
    }
    await audit(conn, req, null, 'lock', { date, offices });
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/lock:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.delete('/locks', hqOnly, async (req, res) => {
  let conn;
  try {
    const date = isoDate(req.body?.date || req.query.date);
    if (!date) return res.status(400).json({ error: 'A valid date is required' });
    conn = await req.app.locals.pool.getConnection();
    const topic = await topicByCode(conn, req.body?.topic_code || req.query.topic);
    const office = req.body?.office_code || req.query.office || null;
    if (office) {
      const depot = D.depotOf(office);
      await conn.query(
        `DELETE FROM div_counselling_locks
          WHERE lock_date = ? AND topic_id = ? AND office_code IN (?, ?, ?)`,
        [date, topic.topic_id, depot, `${depot}-ML`, `${depot}-SUB`]
      );
    } else {
      await conn.query(`DELETE FROM div_counselling_locks WHERE lock_date = ? AND topic_id = ?`,
        [date, topic.topic_id]);
    }
    await audit(conn, req, null, 'unlock', { date, office });
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/unlock:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── CLI accounts (HQ) ─────────────────────────────────────────────────────
// Answers "what if a CLI forgets their password?". There is no email or SMS on
// these accounts, so the only workable reset is HQ issuing a new one and reading
// it out — which is exactly how the first password was distributed.

const PW_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // no O/0, l/1/I
function makePassword(len = 10) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += PW_ALPHABET[bytes[i] % PW_ALPHABET.length];
  return out;
}

router.get('/cli-users', hqOnly, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.query(
      `SELECT c.cli_id, c.cli_name, c.cmsid, c.current_office_code, c.cli_mobile,
              u.id AS user_id, u.username, u.must_change_password,
              (SELECT COUNT(*) FROM div_staff_master s
                WHERE s.current_cli_id = c.cli_id AND s.status = 'Active') AS nominees,
              (SELECT MAX(cs.session_date) FROM div_counselling_sessions cs
                WHERE cs.cli_id = c.cli_id) AS last_session
         FROM div_cli_master c
         LEFT JOIN users u ON u.cli_id = c.cli_id AND u.div_role = 'cli'
        WHERE c.is_active = 1 AND ${REAL_CLI}
        ORDER BY c.current_office_code, c.cli_name`
    );
    conn.release();
    res.json({
      clis: rows.map((r) => ({
        ...r,
        last_session: isoDate(r.last_session),
        has_login: !!r.user_id,
        must_change_password: !!r.must_change_password,
      })),
    });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/cli-users:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

/**
 * Reset (or first-time issue) a CLI's password.
 * The new password is returned ONCE and never stored in the clear — HQ reads it
 * out, and must_change_password forces the CLI to replace it at first use.
 */
router.post('/cli-users/:cliId/reset-password', hqOnly, async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [[cli]] = await conn.query(
      `SELECT cli_id, cli_name, cmsid, current_office_code
         FROM div_cli_master WHERE cli_id = ? AND is_active = 1`, [req.params.cliId]
    );
    if (!cli) { conn.release(); return res.status(404).json({ error: 'Unknown or inactive CLI' }); }
    if (!cli.cmsid) {
      conn.release();
      return res.status(400).json({ error: 'This CLI has no CMS ID in the master, so no username can be made.' });
    }

    const password = makePassword();
    const hash = await bcrypt.hash(password, 12);
    const username = String(cli.cmsid).trim().toLowerCase();

    const [[existing]] = await conn.query(
      `SELECT id FROM users WHERE cli_id = ? AND div_role = 'cli'`, [cli.cli_id]
    );
    if (existing) {
      await conn.query(
        `UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?`, [hash, existing.id]
      );
    } else {
      const [[clash]] = await conn.query(`SELECT id FROM users WHERE username = ?`, [username]);
      if (clash) {
        conn.release();
        return res.status(409).json({ error: `Username "${username}" already belongs to another account.` });
      }
      await conn.query(
        `INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code, cli_id, must_change_password)
         VALUES (?, ?, 'user', ?, 'division', 'cli', ?, ?, 1)`,
        [username, hash, cli.cli_name, cli.current_office_code, cli.cli_id]
      );
    }
    // The password itself is never audited — only that a reset happened.
    await audit(conn, req, null, existing ? 'password_reset' : 'account_created',
      { cli_id: cli.cli_id, cli_name: cli.cli_name, username });
    conn.release();
    res.json({ success: true, username, password, created: !existing });
  } catch (e) {
    if (conn) conn.release();
    console.error('counselling/reset-password:', e);
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

// ── Topics / the cycle setting ────────────────────────────────────────────

router.get('/topics', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.query(
      `SELECT topic_id, topic_code, topic_name, cycle_days, is_active, sort_order
         FROM div_counselling_topics ORDER BY sort_order, topic_name`
    );
    conn.release();
    res.json({ topics: rows });
  } catch (e) {
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

router.put('/topics/:id', hqOnly, async (req, res) => {
  let conn;
  try {
    const raw = req.body?.cycle_days;
    const cycle = raw === null || raw === '' ? null : Number(raw);
    if (cycle !== null && (!Number.isInteger(cycle) || cycle < 1 || cycle > 3650)) {
      return res.status(400).json({ error: 'cycle_days must be between 1 and 3650, or blank for "not tracked"' });
    }
    conn = await req.app.locals.pool.getConnection();
    await conn.query(`UPDATE div_counselling_topics SET cycle_days = ? WHERE topic_id = ?`, [cycle, req.params.id]);
    await audit(conn, req, null, 'set_cycle', { topic_id: Number(req.params.id), cycle_days: cycle });
    conn.release();
    res.json({ success: true });
  } catch (e) {
    if (conn) conn.release();
    res.status(500).json({ error: 'Database error', details: e.message });
  }
});

module.exports = router;
