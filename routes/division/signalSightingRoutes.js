const express = require('express');
const router = express.Router();

const QUARTER_MONTHS = new Set([1, 4, 7, 10]);
const VALID_INSPECTION_TYPES = new Set(['MONTHLY', 'QUARTERLY']);
const VALID_STATUSES = new Set(['DRAFT', 'SUBMITTED', 'REOPENED']);
const VALID_SIDES = new Set(['LHS', 'RHS', 'ELHS', 'ERHS', 'UNKNOWN']);
const VALID_OBSTRUCTIONS = new Set(['NONE', 'OHE_MAST', 'TREE_BRANCH', 'CURVE', 'STRUCTURE', 'SIGNAL_CONFUSION', 'NUMBER_PLATE', 'OTHER']);
const VALID_ACTION_STATUSES = new Set(['NOT_REQUIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETED']);
const VALID_RISKS = new Set(['CLEAR', 'WATCH', 'ATTENTION', 'CRITICAL']);

function requireDivision(req, res, next) {
  if (!req.session.user || req.session.user.realm !== 'division') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function normalizeMonth(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!year || month < 1 || month > 12) return null;
  return `${match[1]}-${match[2]}-01`;
}

function normalizeDate(value) {
  const raw = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function inspectionTypeForMonth(monthDate) {
  const month = Number(monthDate.slice(5, 7));
  return QUARTER_MONTHS.has(month) ? 'QUARTERLY' : 'MONTHLY';
}

function cleanInspectionType(value, monthDate) {
  return cleanEnum(value, VALID_INSPECTION_TYPES, inspectionTypeForMonth(monthDate));
}

function titleFor(type, territoryName, monthDate) {
  const date = new Date(`${monthDate}T00:00:00Z`);
  const monthLabel = date.toLocaleString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const prefix = type === 'QUARTERLY' ? 'Quarterly Signal Inspection' : 'Monthly Signal Inspection';
  return `${prefix} - ${territoryName} - ${monthLabel}`;
}

function cleanStr(value, max = 255) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  return s.slice(0, max);
}

function cleanInt(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function cleanEnum(value, valid, fallback) {
  const s = String(value || '').trim().toUpperCase();
  return valid.has(s) ? s : fallback;
}

function normalizeSignalNumber(value) {
  return String(value || '').toUpperCase().replace(/\s+/g, '').replace(/[\/\-_.]/g, '');
}

function observationKey(row) {
  if (row.signal_id) return `S:${row.signal_id}`;
  if (row.provisional_signal_id) return `P:${row.provisional_signal_id}`;
  return `N:${normalizeSignalNumber(row.signal_number_snapshot || row.signal_number)}`;
}

function timeOrNull(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  return null;
}

function isManager(user) {
  return user && (user.div_role === 'division_admin' || user.role === 'admin' || user.username === 'clicokynsub');
}

async function resolveCliProfile(conn, user) {
  if (!user) return null;

  const [mapped] = await conn.execute(
    `SELECT c.cli_id, c.cli_name, c.cli_mobile, c.current_office_code
       FROM div_signal_sighting_cli_users m
       JOIN div_cli_master c ON c.cli_id = m.cli_id
      WHERE m.user_id = ? AND m.is_active = 1 AND c.is_active = 1
      LIMIT 1`,
    [user.id]
  );
  if (mapped.length) return mapped[0];

  const [matched] = await conn.execute(
    `SELECT cli_id, cli_name, cli_mobile, current_office_code
       FROM div_cli_master
      WHERE is_active = 1
        AND (cmsid = ? OR cli_hrms_id = ?)
      LIMIT 1`,
    [user.username, user.username]
  );
  return matched[0] || null;
}

async function ensureTerritoryAccess(conn, user, cliProfile, territoryId, monthDate) {
  if (isManager(user)) return true;
  if (!cliProfile) return false;

  const [rows] = await conn.execute(
    `SELECT id
       FROM div_signal_sighting_assignments
      WHERE territory_id = ?
        AND cli_id = ?
        AND is_active = 1
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to >= ?)
      LIMIT 1`,
    [territoryId, cliProfile.cli_id, monthDate, monthDate]
  );
  return rows.length > 0;
}

async function loadTerritory(conn, territoryId) {
  const [rows] = await conn.execute(
    `SELECT * FROM div_signal_sighting_territories WHERE id = ? AND is_active = 1`,
    [territoryId]
  );
  return rows[0] || null;
}

async function loadLatestObservationMap(conn, territoryId, monthDate) {
  const [rows] = await conn.execute(
    `SELECT x.*
       FROM (
             SELECT o.*,
                    i.inspection_month,
                    ROW_NUMBER() OVER (
                      PARTITION BY COALESCE(CONCAT('S:', o.signal_id), CONCAT('P:', o.provisional_signal_id), CONCAT('M:', o.signal_number_snapshot))
                      ORDER BY i.inspection_month DESC, o.id DESC
                    ) AS rn
               FROM div_signal_sighting_observations o
               JOIN div_signal_sighting_inspections i ON i.id = o.inspection_id
              WHERE i.territory_id = ?
                AND i.inspection_month < ?
                AND i.status IN ('DRAFT','SUBMITTED','REOPENED')
            ) x
      WHERE x.rn = 1`,
    [territoryId, monthDate]
  );

  const bySignal = new Map();
  const byProvisional = new Map();
  const byNumber = new Map();
  for (const r of rows) {
    if (r.signal_id) bySignal.set(Number(r.signal_id), r);
    if (r.provisional_signal_id) byProvisional.set(Number(r.provisional_signal_id), r);
    byNumber.set(String(r.signal_number_snapshot || '').toUpperCase(), r);
  }
  return { bySignal, byProvisional, byNumber };
}

async function buildTemplateRows(conn, territoryId, monthDate) {
  const latest = await loadLatestObservationMap(conn, territoryId, monthDate);
  const [parts] = await conn.execute(
    `SELECT *
       FROM div_signal_sighting_territory_parts
      WHERE territory_id = ? AND is_active = 1
      ORDER BY display_order, id`,
    [territoryId]
  );

  const rows = [];
  let order = 0;

  for (const part of parts) {
    if (!part.section || !part.line) continue;
    const params = [part.section, part.line];
    let dirClause = '';
    if (part.direction !== 'BOTH' && part.direction !== 'UNKNOWN') {
      dirClause = 'AND direction = ?';
      params.push(part.direction);
    }

    const [signals] = await conn.execute(
      `SELECT id, signal_number, station_code, section, \`line\`, direction,
              location_text, km_text, placement, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
              visibility_distance_m, sighting_remarks, seq_order
         FROM div_signals
        WHERE is_active = 1
          AND section = ?
          AND \`line\` = ?
          ${dirClause}
        ORDER BY
          CASE WHEN seq_order IS NULL THEN 1 ELSE 0 END,
          seq_order,
          id`,
      params
    );

    for (const sig of signals) {
      order += 100;
      const previous = latest.bySignal.get(Number(sig.id));
      rows.push({
        row_order: order,
        source: 'MASTER',
        is_added_by_cli: false,
        signal_id: sig.id,
        provisional_signal_id: null,
        signal_number: sig.signal_number,
        station_code: sig.station_code || '',
        direction: sig.direction || 'UNKNOWN',
        location_text: sig.location_text || sig.km_text || '',
        side: sideFromSignal(sig),
        previous_visibility_distance_m: previous ? previous.visibility_distance_m : sig.visibility_distance_m,
        visibility_distance_m: previous ? previous.visibility_distance_m : sig.visibility_distance_m,
        previous_remarks: previous ? previous.remarks : sig.sighting_remarks,
        remarks: previous ? previous.remarks : sig.sighting_remarks,
        obstruction_type: previous ? previous.obstruction_type : 'NONE',
        remedial_action: previous ? previous.remedial_action : '',
        action_taken: previous ? previous.action_taken : '',
        action_status: previous ? previous.action_status : 'NOT_REQUIRED',
        risk_level: previous ? previous.risk_level : 'CLEAR',
      });
    }
  }

  const [provisional] = await conn.execute(
    `SELECT *
       FROM div_signal_sighting_provisional_signals
      WHERE territory_id = ?
        AND status = 'PROVISIONAL'
      ORDER BY COALESCE(display_order, 999999), id`,
    [territoryId]
  );

  for (const sig of provisional) {
    order += 100;
    const previous = latest.byProvisional.get(Number(sig.id)) || latest.byNumber.get(String(sig.signal_number || '').toUpperCase());
    rows.push({
      row_order: order,
      source: 'PROVISIONAL',
      is_added_by_cli: true,
      signal_id: null,
      provisional_signal_id: sig.id,
      signal_number: sig.signal_number,
      station_code: sig.station_code || '',
      direction: sig.direction || 'UNKNOWN',
      location_text: sig.location_text || '',
      side: sig.side || 'UNKNOWN',
      previous_visibility_distance_m: previous ? previous.visibility_distance_m : null,
      visibility_distance_m: previous ? previous.visibility_distance_m : null,
      previous_remarks: previous ? previous.remarks : sig.remarks,
      remarks: previous ? previous.remarks : sig.remarks,
      obstruction_type: previous ? previous.obstruction_type : 'NONE',
      remedial_action: previous ? previous.remedial_action : '',
      action_taken: previous ? previous.action_taken : '',
      action_status: previous ? previous.action_status : 'NOT_REQUIRED',
      risk_level: previous ? previous.risk_level : 'CLEAR',
    });
  }

  return rows;
}

function sideFromSignal(sig) {
  if (sig.is_ext_rhs) return 'ERHS';
  if (sig.is_rhs) return 'RHS';
  if (sig.is_ext_lhs) return 'ELHS';
  if (sig.is_lhs) return 'LHS';
  const p = String(sig.placement || '').toUpperCase();
  if (p === 'EXTREME RIGHT') return 'ERHS';
  if (p === 'RIGHT') return 'RHS';
  if (p === 'EXTREME LEFT') return 'ELHS';
  if (p === 'LEFT') return 'LHS';
  return 'UNKNOWN';
}

async function loadInspectionRows(conn, inspectionId) {
  const [rows] = await conn.execute(
    `SELECT o.*,
            s.signal_number AS master_signal_number,
            s.station_code AS master_station_code,
            s.direction AS master_direction,
            p.signal_number AS provisional_signal_number,
            p.station_code AS provisional_station_code,
            p.direction AS provisional_direction
       FROM div_signal_sighting_observations o
       LEFT JOIN div_signals s ON s.id = o.signal_id
       LEFT JOIN div_signal_sighting_provisional_signals p ON p.id = o.provisional_signal_id
      WHERE o.inspection_id = ?
      ORDER BY o.row_order`,
    [inspectionId]
  );
  return rows.map((r) => ({
    row_order: r.row_order,
    source: r.source,
    is_added_by_cli: !!r.is_added_by_cli,
    signal_id: r.signal_id,
    provisional_signal_id: r.provisional_signal_id,
    signal_number: r.signal_number_snapshot,
    station_code: r.master_station_code || r.provisional_station_code || '',
    direction: r.master_direction || r.provisional_direction || 'UNKNOWN',
    location_text: r.location_text,
    side: r.side,
    previous_visibility_distance_m: r.previous_visibility_distance_m,
    visibility_distance_m: r.visibility_distance_m,
    previous_remarks: r.previous_remarks,
    remarks: r.remarks,
    obstruction_type: r.obstruction_type,
    remedial_action: r.remedial_action,
    action_taken: r.action_taken,
    action_status: r.action_status,
    risk_level: r.risk_level,
  }));
}

router.use(requireDivision);

router.get('/meta', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const cli = await resolveCliProfile(conn, req.session.user);
    res.json({
      user: req.session.user,
      cli,
      canManage: isManager(req.session.user),
      quarterMonths: [1, 4, 7, 10],
    });
  } catch (err) {
    console.error('signal-sighting/meta failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/territories', async (req, res) => {
  let conn;
  try {
    const monthDate = normalizeMonth(req.query.month) || normalizeMonth(new Date().toISOString().slice(0, 7));
    const effectiveDate = normalizeDate(req.query.effective_on) || monthDate;
    conn = await req.app.locals.pool.getConnection();
    const cli = await resolveCliProfile(conn, req.session.user);
    const manager = isManager(req.session.user);
    const params = [];
    let where = 'WHERE t.is_active = 1';
    if (!manager) {
      if (!cli) return res.json({ territories: [], cli: null });
      where += ` AND EXISTS (
          SELECT 1 FROM div_signal_sighting_assignments a
           WHERE a.territory_id = t.id
             AND a.cli_id = ?
             AND a.is_active = 1
             AND a.effective_from <= ?
             AND (a.effective_to IS NULL OR a.effective_to >= ?)
        )`;
      params.push(cli.cli_id, effectiveDate, effectiveDate);
    }

    const [rows] = await conn.execute(
      `SELECT t.*,
              c.cli_id, c.cli_name, c.cli_mobile, c.current_office_code,
              COUNT(DISTINCT p.id) AS part_count,
              COUNT(DISTINCT i.id) AS inspection_count
         FROM div_signal_sighting_territories t
         LEFT JOIN div_signal_sighting_assignments a
           ON a.territory_id = t.id
          AND a.is_active = 1
          AND a.effective_from <= ?
          AND (a.effective_to IS NULL OR a.effective_to >= ?)
         LEFT JOIN div_cli_master c ON c.cli_id = a.cli_id
         LEFT JOIN div_signal_sighting_territory_parts p ON p.territory_id = t.id AND p.is_active = 1
         LEFT JOIN div_signal_sighting_inspections i ON i.territory_id = t.id
        ${where}
        GROUP BY t.id, c.cli_id, c.cli_name, c.cli_mobile, c.current_office_code
        ORDER BY t.id`,
      [effectiveDate, effectiveDate, ...params]
    );
    res.json({ territories: rows, cli });
  } catch (err) {
    console.error('signal-sighting/territories failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/clis', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.execute(
      `SELECT cli_id, cli_name, cmsid, cli_mobile, current_office_code
         FROM div_cli_master
        WHERE is_active = 1
        ORDER BY current_office_code, cli_name`
    );
    res.json({ clis: rows });
  } catch (err) {
    console.error('signal-sighting/clis failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/history', async (req, res) => {
  let conn;
  try {
    const monthDate = normalizeMonth(req.query.month);
    const territoryId = req.query.territory_id ? Number(req.query.territory_id) : null;
    const status = cleanEnum(req.query.status, VALID_STATUSES, '');
    conn = await req.app.locals.pool.getConnection();
    const where = ['1=1'];
    const params = [];
    if (monthDate) {
      where.push('i.inspection_month = ?');
      params.push(monthDate);
    }
    if (territoryId) {
      where.push('i.territory_id = ?');
      params.push(territoryId);
    }
    if (status) {
      where.push('i.status = ?');
      params.push(status);
    }
    const [rows] = await conn.execute(
      `SELECT i.*, t.territory_code, t.territory_name, c.cli_name, c.cli_mobile,
              (SELECT COUNT(*) FROM div_signal_sighting_observations o WHERE o.inspection_id = i.id) AS row_count
         FROM div_signal_sighting_inspections i
         JOIN div_signal_sighting_territories t ON t.id = i.territory_id
         JOIN div_cli_master c ON c.cli_id = i.cli_id
        WHERE ${where.join(' AND ')}
        ORDER BY i.inspection_month DESC, t.territory_name ASC, i.id DESC
        LIMIT 250`,
      params
    );
    res.json({ inspections: rows });
  } catch (err) {
    console.error('signal-sighting/history failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/history/:inspectionId/comparison', async (req, res) => {
  let conn;
  try {
    const inspectionId = Number(req.params.inspectionId);
    if (!inspectionId) return res.status(400).json({ error: 'inspection id is required' });

    conn = await req.app.locals.pool.getConnection();
    const [currentRows] = await conn.execute(
      `SELECT i.*, t.territory_code, t.territory_name, c.cli_name, c.cli_mobile
         FROM div_signal_sighting_inspections i
         JOIN div_signal_sighting_territories t ON t.id = i.territory_id
         JOIN div_cli_master c ON c.cli_id = i.cli_id
        WHERE i.id = ?
        LIMIT 1`,
      [inspectionId]
    );
    if (!currentRows.length) return res.status(404).json({ error: 'Inspection not found' });

    const current = currentRows[0];
    const [previousRows] = await conn.execute(
      `SELECT i.*, t.territory_code, t.territory_name, c.cli_name, c.cli_mobile
         FROM div_signal_sighting_inspections i
         JOIN div_signal_sighting_territories t ON t.id = i.territory_id
         JOIN div_cli_master c ON c.cli_id = i.cli_id
        WHERE i.territory_id = ?
          AND i.inspection_month < ?
          AND i.status IN ('DRAFT','SUBMITTED','REOPENED')
        ORDER BY i.inspection_month DESC, i.id DESC
        LIMIT 1`,
      [current.territory_id, current.inspection_month]
    );
    const previous = previousRows[0] || null;
    const currentObservations = await loadInspectionRows(conn, inspectionId);
    const previousObservations = previous ? await loadInspectionRows(conn, previous.id) : [];
    const previousByKey = new Map(previousObservations.map((row) => [observationKey(row), row]));

    const summary = {
      total: currentObservations.length,
      improved: 0,
      reduced: 0,
      unchanged: 0,
      new: 0,
      pendingAction: 0,
      attention: 0,
    };

    const rows = currentObservations.map((row) => {
      const prev = previousByKey.get(observationKey(row)) || null;
      const latestDistance = cleanInt(row.visibility_distance_m);
      const previousDistance = prev ? cleanInt(prev.visibility_distance_m) : null;
      const delta = latestDistance !== null && previousDistance !== null ? latestDistance - previousDistance : null;
      if (!prev) summary.new += 1;
      else if (delta > 0) summary.improved += 1;
      else if (delta < 0) summary.reduced += 1;
      else summary.unchanged += 1;
      if (row.action_status && row.action_status !== 'NOT_REQUIRED' && row.action_status !== 'COMPLETED') summary.pendingAction += 1;
      if (row.risk_level === 'ATTENTION' || row.risk_level === 'CRITICAL') summary.attention += 1;

      return {
        signal_id: row.signal_id,
        provisional_signal_id: row.provisional_signal_id,
        signal_number: row.signal_number,
        location_text: row.location_text,
        side: row.side,
        source: row.source,
        latest_visibility_distance_m: latestDistance,
        previous_visibility_distance_m: previousDistance,
        visibility_delta_m: delta,
        latest_remarks: row.remarks,
        previous_remarks: prev ? prev.remarks : null,
        remedial_action: row.remedial_action,
        action_taken: row.action_taken,
        action_status: row.action_status,
        risk_level: row.risk_level,
      };
    });

    res.json({ current, previous, summary, rows });
  } catch (err) {
    console.error('signal-sighting/comparison failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/territories/:id/template', async (req, res) => {
  let conn;
  try {
    const territoryId = Number(req.params.id);
    const monthDate = normalizeMonth(req.query.month);
    if (!territoryId || !monthDate) return res.status(400).json({ error: 'territory id and month are required' });

    conn = await req.app.locals.pool.getConnection();
    const cli = await resolveCliProfile(conn, req.session.user);
    const allowed = await ensureTerritoryAccess(conn, req.session.user, cli, territoryId, monthDate);
    if (!allowed) return res.status(403).json({ error: 'This territory is not assigned to your CLI login' });

    const territory = await loadTerritory(conn, territoryId);
    if (!territory) return res.status(404).json({ error: 'Territory not found' });

    const [existing] = await conn.execute(
      `SELECT i.*, c.cli_name, c.cli_mobile
         FROM div_signal_sighting_inspections i
         JOIN div_cli_master c ON c.cli_id = i.cli_id
        WHERE i.territory_id = ? AND i.inspection_month = ?
        LIMIT 1`,
      [territoryId, monthDate]
    );
    if (existing.length) {
      const rows = await loadInspectionRows(conn, existing[0].id);
      return res.json({ territory, inspection: existing[0], rows, existing: true });
    }

    const type = inspectionTypeForMonth(monthDate);
    const rows = await buildTemplateRows(conn, territoryId, monthDate);
    const [assignment] = await conn.execute(
      `SELECT c.cli_id, c.cli_name, c.cli_mobile
         FROM div_signal_sighting_assignments a
         JOIN div_cli_master c ON c.cli_id = a.cli_id
        WHERE a.territory_id = ?
          AND a.is_active = 1
          AND a.effective_from <= ?
          AND (a.effective_to IS NULL OR a.effective_to >= ?)
        ORDER BY a.effective_from DESC
        LIMIT 1`,
      [territoryId, monthDate, monthDate]
    );
    const assignedCli = isManager(req.session.user) ? assignment[0] : cli;
    res.json({
      territory,
      inspection: {
        inspection_month: monthDate,
        inspection_date: null,
        inspection_type: type,
        title: titleFor(type, territory.territory_name, monthDate),
        territory_id: territoryId,
        cli_id: assignedCli ? assignedCli.cli_id : null,
        cli_name: assignedCli ? assignedCli.cli_name : null,
        status: 'DRAFT',
      },
      rows,
      existing: false,
    });
  } catch (err) {
    console.error('signal-sighting/template failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.put('/inspections', async (req, res) => {
  let conn;
  try {
    const body = req.body || {};
    const territoryId = Number(body.territory_id);
    const monthDate = normalizeMonth(body.inspection_month);
    if (!territoryId || !monthDate) return res.status(400).json({ error: 'territory_id and inspection_month are required' });

    conn = await req.app.locals.pool.getConnection();
    const cli = await resolveCliProfile(conn, req.session.user);
    const allowed = await ensureTerritoryAccess(conn, req.session.user, cli, territoryId, monthDate);
    if (!allowed) return res.status(403).json({ error: 'This territory is not assigned to your CLI login' });

    const territory = await loadTerritory(conn, territoryId);
    if (!territory) return res.status(404).json({ error: 'Territory not found' });

    const type = cleanInspectionType(body.inspection_type, monthDate);
    const selectedCliId = isManager(req.session.user) ? Number(body.cli_id || 0) : (cli && cli.cli_id);
    if (!selectedCliId) return res.status(400).json({ error: 'Unable to resolve conducting CLI' });

    await conn.beginTransaction();
    const [upsert] = await conn.execute(
      `INSERT INTO div_signal_sighting_inspections
          (inspection_month, inspection_date, inspection_type, title, territory_id, cli_id,
           conducted_by_user_id, status, train_no, cab_no, lp_name, alp_name,
           departure_station, departure_time, arrival_station, arrival_time,
           snt_representative, signal_dept_representative, reference_text, remarks)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
           id = LAST_INSERT_ID(id),
           inspection_date = VALUES(inspection_date),
           inspection_type = VALUES(inspection_type),
           title = VALUES(title),
           cli_id = VALUES(cli_id),
           conducted_by_user_id = VALUES(conducted_by_user_id),
           status = IF(status = 'SUBMITTED', 'REOPENED', VALUES(status)),
           train_no = VALUES(train_no),
           cab_no = VALUES(cab_no),
           lp_name = VALUES(lp_name),
           alp_name = VALUES(alp_name),
           departure_station = VALUES(departure_station),
           departure_time = VALUES(departure_time),
           arrival_station = VALUES(arrival_station),
           arrival_time = VALUES(arrival_time),
           snt_representative = VALUES(snt_representative),
           signal_dept_representative = VALUES(signal_dept_representative),
           reference_text = VALUES(reference_text),
           remarks = VALUES(remarks)`,
      [
        monthDate,
        cleanStr(body.inspection_date, 10),
        type,
        cleanStr(body.title, 160) || titleFor(type, territory.territory_name, monthDate),
        territoryId,
        selectedCliId,
        req.session.user.id,
        cleanEnum(body.status, VALID_STATUSES, 'DRAFT'),
        cleanStr(body.train_no, 30),
        cleanStr(body.cab_no, 30),
        cleanStr(body.lp_name, 100),
        cleanStr(body.alp_name, 100),
        cleanStr(body.departure_station, 30),
        timeOrNull(body.departure_time),
        cleanStr(body.arrival_station, 30),
        timeOrNull(body.arrival_time),
        cleanStr(body.snt_representative, 100),
        cleanStr(body.signal_dept_representative, 100),
        cleanStr(body.reference_text, 255),
        cleanStr(body.remarks, 10000),
      ]
    );

    const inspectionId = upsert.insertId;
    await saveRows(conn, inspectionId, territoryId, body.rows || [], req.session.user.id);
    await conn.commit();

    const [[inspection]] = await conn.execute(
      `SELECT i.*, c.cli_name, c.cli_mobile
         FROM div_signal_sighting_inspections i
         JOIN div_cli_master c ON c.cli_id = i.cli_id
        WHERE i.id = ?`,
      [inspectionId]
    );
    const rows = await loadInspectionRows(conn, inspectionId);
    res.json({ ok: true, inspection, rows });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error('signal-sighting/save failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

async function saveRows(conn, inspectionId, territoryId, rows, userId) {
  await conn.execute(`DELETE FROM div_signal_sighting_observations WHERE inspection_id = ?`, [inspectionId]);
  let order = 0;
  for (const raw of rows) {
    order += 100;
    let signalId = raw.signal_id ? Number(raw.signal_id) : null;
    let provisionalId = raw.provisional_signal_id ? Number(raw.provisional_signal_id) : null;
    let source = signalId ? 'MASTER' : (provisionalId ? 'PROVISIONAL' : 'MANUAL');
    const signalNumber = cleanStr(raw.signal_number || raw.signal_number_snapshot, 80);
    if (!signalNumber) continue;

    if (!signalId && !provisionalId) {
      const [ins] = await conn.execute(
        `INSERT INTO div_signal_sighting_provisional_signals
            (territory_id, created_from_inspection_id, signal_number, normalized_signal_number,
             station_code, section, \`line\`, direction, location_text, side, display_order,
             remarks, created_by_user_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          territoryId,
          inspectionId,
          signalNumber,
          normalizeSignalNumber(signalNumber),
          cleanStr(raw.station_code, 10),
          cleanStr(raw.section, 40),
          cleanStr(raw.line, 40),
          cleanEnum(raw.direction, new Set(['UP', 'DN', 'BOTH', 'UNKNOWN']), 'UNKNOWN'),
          cleanStr(raw.location_text, 100),
          cleanEnum(raw.side, VALID_SIDES, 'UNKNOWN'),
          order,
          cleanStr(raw.remarks, 255),
          userId,
        ]
      );
      provisionalId = ins.insertId;
      source = 'PROVISIONAL';
    } else if (provisionalId) {
      await conn.execute(
        `UPDATE div_signal_sighting_provisional_signals
            SET signal_number = ?, normalized_signal_number = ?, location_text = ?, side = ?,
                remarks = COALESCE(?, remarks), display_order = COALESCE(display_order, ?)
          WHERE id = ? AND territory_id = ?`,
        [
          signalNumber,
          normalizeSignalNumber(signalNumber),
          cleanStr(raw.location_text, 100),
          cleanEnum(raw.side, VALID_SIDES, 'UNKNOWN'),
          cleanStr(raw.remarks, 255),
          order,
          provisionalId,
          territoryId,
        ]
      );
    }

    await conn.execute(
      `INSERT INTO div_signal_sighting_observations
          (inspection_id, row_order, signal_id, provisional_signal_id, signal_number_snapshot,
           location_text, side, previous_visibility_distance_m, visibility_distance_m,
           previous_remarks, remarks, obstruction_type, remedial_action, action_taken,
           action_status, risk_level, source, is_added_by_cli)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        inspectionId,
        order,
        signalId,
        provisionalId,
        signalNumber,
        cleanStr(raw.location_text, 100),
        cleanEnum(raw.side, VALID_SIDES, 'UNKNOWN'),
        cleanInt(raw.previous_visibility_distance_m),
        cleanInt(raw.visibility_distance_m),
        cleanStr(raw.previous_remarks, 10000),
        cleanStr(raw.remarks, 10000),
        cleanEnum(raw.obstruction_type, VALID_OBSTRUCTIONS, 'NONE'),
        cleanStr(raw.remedial_action, 10000),
        cleanStr(raw.action_taken, 10000),
        cleanEnum(raw.action_status, VALID_ACTION_STATUSES, 'NOT_REQUIRED'),
        cleanEnum(raw.risk_level, VALID_RISKS, 'CLEAR'),
        source,
        raw.is_added_by_cli || source !== 'MASTER' ? 1 : 0,
      ]
    );
  }
}

router.post('/inspections/:id/submit', async (req, res) => {
  let conn;
  try {
    const inspectionId = Number(req.params.id);
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.execute(
      `SELECT i.territory_id, i.inspection_month
         FROM div_signal_sighting_inspections i
        WHERE i.id = ?`,
      [inspectionId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Inspection not found' });

    const cli = await resolveCliProfile(conn, req.session.user);
    const allowed = await ensureTerritoryAccess(conn, req.session.user, cli, rows[0].territory_id, rows[0].inspection_month);
    if (!allowed) return res.status(403).json({ error: 'This inspection is not assigned to your CLI login' });

    await conn.execute(
      `UPDATE div_signal_sighting_inspections
          SET status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [inspectionId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('signal-sighting/submit failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.put('/territories/:id/assignment', async (req, res) => {
  let conn;
  try {
    const territoryId = Number(req.params.id);
    const body = req.body || {};
    const cliId = Number(body.cli_id);
    if (!territoryId || !cliId) return res.status(400).json({ error: 'territory id and cli_id are required' });

    conn = await req.app.locals.pool.getConnection();
    if (!isManager(req.session.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const effectiveFrom = normalizeDate(body.effective_from) || new Date().toISOString().slice(0, 10);
    const effectiveTo = normalizeDate(body.effective_to);
    const [cliRows] = await conn.execute(
      `SELECT cli_id, cli_name FROM div_cli_master WHERE cli_id = ? AND is_active = 1 LIMIT 1`,
      [cliId]
    );
    if (!cliRows.length) return res.status(404).json({ error: 'CLI not found' });

    await conn.beginTransaction();
    await conn.execute(
      `UPDATE div_signal_sighting_assignments
          SET effective_to = DATE_SUB(?, INTERVAL 1 DAY)
        WHERE territory_id = ?
          AND is_active = 1
          AND (effective_to IS NULL OR effective_to >= ?)
          AND NOT (cli_id = ? AND effective_from = ?)`,
      [effectiveFrom, territoryId, effectiveFrom, cliId, effectiveFrom]
    );
    await conn.execute(
      `INSERT INTO div_signal_sighting_assignments
          (territory_id, cli_id, effective_from, effective_to, remarks, is_active)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE
         effective_to = VALUES(effective_to),
         remarks = VALUES(remarks),
         is_active = 1`,
      [
        territoryId,
        cliId,
        effectiveFrom,
        effectiveTo,
        cleanStr(body.remarks, 255),
      ]
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error('signal-sighting/assignment failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
