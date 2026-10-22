const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const crypto = require('crypto');

const WRITERS = new Set(['division_admin', 'trip_shed_operator', 'trip_shed_supervisor']);
const SUPERVISORS = new Set(['division_admin', 'trip_shed_supervisor']);
const READERS = new Set([...WRITERS, 'lpc', 'ctlc', 'ctlc_view', 'ssehq']);
const DEFERRED_MODULES = Object.freeze(['Wheel profile', 'Temperature', 'Materials', 'Roster', 'Awards / warnings']);
const OUT_OF_SCOPE_MODULES = Object.freeze(['IA — Periodic Maintenance', 'IB — Periodic Maintenance', 'IC — Periodic Maintenance']);
const asText = (value, max = 65535) => value == null ? null : String(value).trim().slice(0, max) || null;
const asDecimal = (value, max = 9999999999.99) => value == null || value === '' ? null : (/^\d+(?:\.\d{1,2})?$/.test(String(value).trim()) && Number(value) <= max ? Number(value) : null);
const asDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : null;
const uid = (req) => req.session?.user?.id || null;

router.use((req, res, next) => {
  const user = req.session?.user;
  if (!user || user.realm !== 'division' || !READERS.has(user.div_role)) return res.status(403).json({ error: 'Trip Shed access required' });
  req.tripReadOnly = !WRITERS.has(user.div_role);
  next();
});
const write = (req, res, next) => req.tripReadOnly ? res.status(403).json({ error: 'Read-only access' }) : next();
const supervisor = (req, res, next) => SUPERVISORS.has(req.session.user?.div_role) ? next() : res.status(403).json({ error: 'Supervisor access required' });
async function shed(conn, req) {
  const user=req?.session?.user||{}, requested=asText(req?.query?.shed_code||req?.body?.shed_code||req?.headers?.['x-trip-shed']||user.trip_shed_code,20)||'VVH';
  const params=[user.id||null,requested];
  const admin=user.div_role==='division_admin';
  const [rows]=await conn.execute(`SELECT s.* FROM div_trip_sheds s LEFT JOIN div_trip_shed_users su ON su.shed_id=s.id AND su.user_id=? AND su.is_active=1 WHERE s.shed_code=? AND s.is_active=1 AND (${admin?'1=1':'su.user_id IS NOT NULL'}) LIMIT 1`,params);
  if (!rows.length) throw inspectionError(403,`No active Trip Shed access for ${requested}`);
  return rows[0];
}
async function availableSheds(conn, req) {
  const user=req?.session?.user||{}, admin=user.div_role==='division_admin';
  const [rows]=await conn.execute(`SELECT DISTINCT s.id,s.shed_code,s.shed_name,s.station_code FROM div_trip_sheds s LEFT JOIN div_trip_shed_users su ON su.shed_id=s.id AND su.user_id=? AND su.is_active=1 WHERE s.is_active=1 AND (${admin?'1=1':'su.user_id IS NOT NULL'}) ORDER BY s.shed_code`,[user.id||null]);
  return rows;
}
async function connOf(req) { return req.app.locals.pool.getConnection(); }
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const importKinds = new Set(['MCDO','OVERDUE','REPAIR_ATTENTION','SLAM_MOVEMENT']);
const normalizeImportDate = value => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0,10);
  const s = String(value ?? '').trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(s);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  const month = Number(m[1]) > 12 ? m[2] : Number(m[2]) > 12 ? m[1] : m[2];
  const day = Number(m[1]) > 12 ? m[1] : Number(m[2]) > 12 ? m[2] : m[1];
  const d = `${y}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  return asDate(d) ? d : null;
};
function normalizeImportRows(kind, sheetName, rows) {
  let previousLoco = null;
  let previousDate = null;
  const seen = new Set();
  return rows.map((raw, index) => {
    const sourceRowNo = index + 2;
    const values = Object.fromEntries(Object.entries(raw || {}).map(([k,v]) => [String(k).trim(), v == null ? null : String(v).trim()]));
    const find = (...names) => { const key = Object.keys(values).find(k => names.includes(k.toUpperCase())); return key ? values[key] : null; };
    const rawLoco = find('LOCO NO','LOCO NUMBER','LOCO','LOCO NO.');
    const loco = rawLoco || previousLoco;
    if (rawLoco) previousLoco = rawLoco;
    const dateValue = find('DATE','ENTRY DATE','LAST TI DATE');
    const date = dateValue ? normalizeImportDate(dateValue) : previousDate;
    if (date) previousDate = date;
    const key = `${date || 'INVALID'}|${loco || 'MISSING'}|${kind}`;
    const flags = [];
    if (!date) flags.push('INVALID_DATE');
    if (!loco) flags.push('MISSING_LOCO');
    if ((!rawLoco || !dateValue) && (loco || date)) flags.push('CONTINUATION');
    if (seen.has(key)) flags.push('DUPLICATE');
    seen.add(key);
    const normalized = { kind, sheet: sheetName, source_row_no: sourceRowNo, date, loco_number: loco, raw_date: dateValue, values, flags };
    return { sourceRowNo, normalized, status: flags.length ? 'INVALID' : 'READY' };
  });
}
// ---- SLAM "Trip Shed Loco Movement" export (CSV from the central SLAM application) ----
// Header row is found by its LOCO + TRIPSHED cells, so the two banner lines above it never
// matter and column order may change. Keys are header text upper-cased with everything but
// A-Z0-9 removed.
const SLAM_COLUMNS = Object.freeze({ SNO:'slam_sno', ZONE:'zone', LOCO:'loco_number', SHED:'home_shed', PURPOSE:'purpose', SPMKM:'spm_km', TRIPSHED:'trip_shed',
  RECEIVEDATDATETIME:'received_at', LOCOOUTDATETIME:'loco_out_at', DEFECT:'defect', ACTIONTAKEN:'action_taken', UNDERFRAME:'under_frame', HTMACHINEROOM:'ht_machine_room',
  PNEUMATIC:'pneumatic', OTHERS:'others', ROOFEQUIPMENT:'roof_equipment', CABEQUIPMENT:'cab_equipment', HOGSTATUS1:'hog_status_1', HOGSTATUS2:'hog_status_2', CABAC1:'cab_ac_1', CABAC2:'cab_ac_2', REMARKS:'remarks' });
const SLAM_FIELDS = Object.freeze(['slam_sno','zone','loco_number','home_shed','purpose','spm_km','received_at','loco_out_at','defect','action_taken','under_frame','ht_machine_room','pneumatic','others','roof_equipment','cab_equipment','hog_status_1','hog_status_2','cab_ac_1','cab_ac_2','remarks']);
const slamKey = value => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// "22/09/2026 21:04" -> "2026-09-22 21:04:00"; also accepts an ISO date-time.
const normalizeSlamDateTime = value => {
  const str = String(value ?? '').trim();
  if (!str) return null;
  let m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(str);
  if (m) { const d=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; return asDate(d) && Number(m[2])<=12 && Number(m[1])<=31 ? `${d} ${(m[4]||'0').padStart(2,'0')}:${m[5]||'00'}:00` : null; }
  m = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(str);
  return m && asDate(m[1]) ? `${m[1]} ${m[2]||'00'}:${m[3]||'00'}:00` : null;
};
// Returns staged rows in the same shape as normalizeImportRows(); DB-dependent flags
// (OTHER_SHED is decided here from shedCode; EXISTING_VISIT / LOCO_NOT_IN_MASTER are added
// by stageImport once it has a connection).
function normalizeSlamRows(sheetName, matrix, shedCode) {
  const headerIdx = matrix.findIndex(r => { const k = (r||[]).map(slamKey); return k.includes('LOCO') && k.includes('TRIPSHED'); });
  if (headerIdx < 0) throw inspectionError(400, 'SLAM file: header row with LOCO and TRIPSHED columns not found');
  const columns = matrix[headerIdx].map(h => SLAM_COLUMNS[slamKey(h)] || null);
  const seen = new Set();
  return matrix.slice(headerIdx + 1).map((raw, i) => ({ raw, sourceRowNo: headerIdx + 2 + i }))
    .filter(({ raw }) => (raw||[]).some(v => String(v ?? '').trim() !== ''))
    .map(({ raw, sourceRowNo }) => {
      const values = {}; columns.forEach((c, idx) => { if (c) values[c] = asText(raw[idx], 2000); });
      const flags = [], warnings = [];
      const loco = values.loco_number; if (!loco) flags.push('MISSING_LOCO');
      const received_at = normalizeSlamDateTime(values.received_at); if (!received_at) flags.push('INVALID_RECEIVED_AT');
      const loco_out_at = normalizeSlamDateTime(values.loco_out_at); if (values.loco_out_at && !loco_out_at) warnings.push('INVALID_OUT_AT');
      if (values.trip_shed && values.trip_shed.toUpperCase() !== shedCode) flags.push('OTHER_SHED');
      const sno = /^\d+$/.test(values.slam_sno || '') ? Number(values.slam_sno) : null;
      const spm = /^\d+$/.test(values.spm_km || '') ? Number(values.spm_km) : null; if (values.spm_km && spm === null) warnings.push('INVALID_SPM');
      const key = `${loco || 'MISSING'}|${received_at || 'INVALID'}`; if (seen.has(key)) flags.push('DUPLICATE'); seen.add(key);
      const record = { ...values, slam_sno: sno, spm_km: spm, received_at, loco_out_at, purpose: values.purpose ? values.purpose.toUpperCase().slice(0,20) : null, zone: values.zone ? values.zone.slice(0,10) : null };
      const normalized = { kind:'SLAM_MOVEMENT', sheet: sheetName, source_row_no: sourceRowNo, date: received_at ? received_at.slice(0,10) : null, loco_number: loco, record, values, flags, warnings };
      return { sourceRowNo, normalized, status: flags.length ? 'INVALID' : 'READY' };
    });
}
async function flagSlamAgainstDb(conn, shedId, staged) {
  for (const row of staged) {
    const r = row.normalized.record; if (row.status !== 'READY') continue;
    const [[loco]] = await conn.execute('SELECT 1 x FROM div_locos WHERE loco_number=? LIMIT 1', [r.loco_number]); if (!loco) row.normalized.warnings.push('LOCO_NOT_IN_MASTER');
    const [[dup]] = await conn.execute('SELECT id FROM div_trip_loco_movements WHERE shed_id=? AND loco_number=? AND received_at=? LIMIT 1', [shedId, r.loco_number, r.received_at]);
    if (dup) { row.normalized.warnings.push('EXISTING_VISIT'); row.normalized.existing_id = dup.id; }
  }
}
// Approval publishes READY rows; an EXISTING_VISIT row is linked to the record already there.
async function publishSlamBatch(conn, shedId, batchId, userId) {
  const [rows] = await conn.execute("SELECT id,source_row_no,normalized_json FROM div_trip_import_staging_rows WHERE batch_id=? AND status='APPROVED' ORDER BY id", [batchId]);
  let inserted = 0, linked = 0;
  for (const row of rows) {
    const n = typeof row.normalized_json === 'string' ? JSON.parse(row.normalized_json || '{}') : (row.normalized_json || {}), r = n.record || {};
    const [[dup]] = await conn.execute('SELECT id FROM div_trip_loco_movements WHERE shed_id=? AND loco_number=? AND received_at=? LIMIT 1', [shedId, r.loco_number, r.received_at]);
    let id;
    if (dup) { id = dup.id; linked++; }
    else {
      const [ins] = await conn.execute(`INSERT INTO div_trip_loco_movements(shed_id,${SLAM_FIELDS.join(',')},source_batch_id,source_row_no,created_by) VALUES(?,${SLAM_FIELDS.map(()=>'?').join(',')},?,?,?)`,
        [shedId, ...SLAM_FIELDS.map(f => r[f] ?? null), batchId, row.source_row_no, userId]);
      id = ins.insertId; inserted++;
    }
    await conn.execute('UPDATE div_trip_import_staging_rows SET published_record_id=? WHERE id=?', [id, row.id]);
  }
  return { inserted, linked };
}
async function stageImport(req, res) {
  let conn, transaction = false;
  try {
    const kind = String(req.body?.import_kind || '').toUpperCase();
    if (!importKinds.has(kind)) throw inspectionError(400, 'Import kind must be MCDO, OVERDUE, REPAIR_ATTENTION or SLAM_MOVEMENT');
    if (!req.file) throw inspectionError(400, 'Spreadsheet file is required');
    const slam = kind === 'SLAM_MOVEMENT';
    const workbook = XLSX.read(req.file.buffer, slam ? { type:'buffer', raw:true, cellDates:false } : { type:'buffer', cellDates:true, raw:false });
    if (!workbook.SheetNames.length) throw inspectionError(400, 'Spreadsheet has no worksheets');
    conn = await connOf(req);
    const s = await shed(conn,req);
    const staged = [];
    for (const sheetName of workbook.SheetNames) {
      if (slam) { const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header:1, defval:null, raw:true }); staged.push(...normalizeSlamRows(sheetName, matrix, s.shed_code)); continue; }
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval:null, raw:false });
      staged.push(...normalizeImportRows(kind, sheetName, rawRows));
    }
    if (!staged.length) throw inspectionError(400, 'Spreadsheet has no data rows');
    if (slam) await flagSlamAgainstDb(conn, s.id, staged);
    await conn.beginTransaction(); transaction = true;
    const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex'), readyCount=staged.filter(x=>x.status==='READY').length, invalidCount=staged.length-readyCount;
    const [batch] = await conn.execute('INSERT INTO div_trip_import_batches(shed_id,import_kind,source_filename,source_sha256,status,total_rows,valid_rows,invalid_rows,uploaded_by) VALUES(?,?,?,?,?,?,?,?,?)',[s.id,kind,req.file.originalname,sha256,'STAGED',staged.length,readyCount,invalidCount,uid(req)]);
    for (const row of staged) await conn.execute('INSERT INTO div_trip_import_staging_rows(batch_id,source_sheet,source_row_no,raw_json,normalized_json,validation_errors,status) VALUES(?,?,?,?,?,?,?)',[batch.insertId,row.normalized.sheet,row.sourceRowNo,JSON.stringify(row.normalized.values),JSON.stringify(row.normalized),JSON.stringify(row.normalized.flags),'READY'===row.status?'READY':'INVALID']);
    await conn.commit(); transaction = false;
    res.json({ id: batch.insertId, import_kind: kind, source_filename: req.file.originalname, row_count: staged.length, ready_count: staged.filter(x=>x.status==='READY').length, invalid_count: staged.filter(x=>x.status!=='READY').length, warning_count: staged.filter(x=>(x.normalized.warnings||[]).length).length });
  } catch (e) { if (transaction) await conn.rollback(); res.status(e.status || 500).json({ error:e.message }); }
  finally { conn?.release(); }
}

router.get('/config', async (req, res) => { let conn; try { conn = await connOf(req); const current = await shed(conn,req), sheds=await availableSheds(conn,req); const [templates] = await conn.execute("SELECT id,inspection_type,title,entry_enabled FROM div_trip_inspection_templates WHERE enabled=1 AND inspection_type NOT IN ('IA','IB','IC') ORDER BY id"); res.json({ shed: current, sheds, templates, deferred_modules: DEFERRED_MODULES, out_of_scope_modules: OUT_OF_SCOPE_MODULES, user: { ...req.session.user, read_only: req.tripReadOnly, can_finalize: SUPERVISORS.has(req.session.user.div_role) } }); } catch (e) { res.status(e.status||500).json({ error: e.message }); } finally { conn?.release(); } });
router.get('/export/:kind', async (req,res) => {
  let conn;
  try {
    const kind=String(req.params.kind||'').toLowerCase(), format=String(req.query.format||'csv').toLowerCase();
    if (!['inspections','defects','overdue','movements'].includes(kind)) throw inspectionError(400,'Unsupported export register');
    if (!['csv','xlsx'].includes(format)) throw inspectionError(400,'Export format must be csv or xlsx');
    const from=asDate(req.query.from), to=asDate(req.query.to); if ((req.query.from && !from) || (req.query.to && !to)) throw inspectionError(400,'Export dates must use YYYY-MM-DD');
    conn=await connOf(req); const s=await shed(conn,req); let rows, title;
    if (kind==='inspections') { const where=['i.shed_id=?'], p=[s.id]; if(from){where.push('i.inspection_date>=?');p.push(from)} if(to){where.push('i.inspection_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date,i.shift_code,t.inspection_type,i.loco_number,i.loco_type,i.loco_base,i.train_no,i.incoming_train_no,i.technician_name,i.technician_hrms_id,i.supervisor_name,i.supervisor_hrms_id,i.status,i.general_remarks FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE ${where.join(' AND ')} ORDER BY i.inspection_date,i.id`,p); title='trip_shed_inspections'; }
    if (kind==='defects') { const where=['d.shed_id=?'], p=[s.id]; if(from){where.push('d.defect_date>=?');p.push(from)} if(to){where.push('d.defect_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(d.defect_date,'%Y-%m-%d') defect_date,d.loco_number,d.loco_base,d.incoming_train_no,d.equipment_name,d.description,d.action_taken,d.responsible_party,d.status,d.created_by,d.updated_by FROM div_trip_defects d WHERE ${where.join(' AND ')} ORDER BY d.defect_date,d.id`,p); title='trip_shed_defects'; }
    if (kind==='overdue') { const where=['o.shed_id=?'], p=[s.id]; if(from){where.push('o.entry_date>=?');p.push(from)} if(to){where.push('o.entry_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(o.entry_date,'%Y-%m-%d') entry_date,o.loco_number,o.loco_base,o.incoming_train_no,o.kms,DATE_FORMAT(o.last_inspection_date,'%Y-%m-%d') last_inspection_date,o.last_inspection_type,o.outgoing_train_no,o.last_shed,o.remarks FROM div_trip_overdue_entries o WHERE ${where.join(' AND ')} ORDER BY o.entry_date,o.id`,p); title='trip_shed_ti_overdue'; }
    if (kind==='movements') { const where=['m.shed_id=?'], p=[s.id]; if(from){where.push('m.received_at>=?');p.push(from+' 00:00:00')} if(to){where.push('m.received_at<=?');p.push(to+' 23:59:59')}; [rows]=await conn.execute(`SELECT m.slam_sno,m.zone,m.loco_number,m.home_shed,m.purpose,m.spm_km,DATE_FORMAT(m.received_at,'%Y-%m-%d %H:%i') received_at,DATE_FORMAT(m.loco_out_at,'%Y-%m-%d %H:%i') loco_out_at,m.defect,m.action_taken,m.under_frame,m.ht_machine_room,m.pneumatic,m.others,m.roof_equipment,m.cab_equipment,m.hog_status_1,m.hog_status_2,m.cab_ac_1,m.cab_ac_2,m.remarks FROM div_trip_loco_movements m WHERE ${where.join(' AND ')} ORDER BY m.received_at,m.id`,p); title='trip_shed_movements'; }
    const sheet=XLSX.utils.json_to_sheet(rows); if(format==='csv'){const csv=XLSX.utils.sheet_to_csv(sheet); res.status(200).set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${title}.csv"`}).send('\ufeff'+csv);} else {const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,sheet,'Trip Shed'); const buf=XLSX.write(book,{type:'buffer',bookType:'xlsx'}); res.status(200).set({'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${title}.xlsx"`}).send(buf);}
  } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); }
});
router.post('/imports/stage', write, importUpload.single('file'), stageImport);
router.get('/imports', async (req,res) => { let conn; try { conn=await connOf(req); const s=await shed(conn,req); const [rows]=await conn.execute("SELECT id,import_kind,source_filename,status,total_rows,valid_rows,invalid_rows,uploaded_by,reviewed_by,reviewed_at,created_at FROM div_trip_import_batches WHERE shed_id=? ORDER BY id DESC LIMIT 100",[s.id]); res.json({rows}); } catch(e) { res.status(500).json({error:e.message}); } finally { conn?.release(); } });
router.get('/imports/:id', async (req,res) => { let conn; try { const id=positiveId(req.params.id); if(!id) throw inspectionError(400,'Invalid import batch ID'); conn=await connOf(req); const s=await shed(conn,req); const [[batch]]=await conn.execute('SELECT * FROM div_trip_import_batches WHERE id=? AND shed_id=?',[id,s.id]); if(!batch) throw inspectionError(404,'Import batch not found'); const [rows]=await conn.execute('SELECT id,source_sheet,source_row_no,raw_json,normalized_json,validation_errors,status,published_record_id FROM div_trip_import_staging_rows WHERE batch_id=? ORDER BY id',[id]); res.json({batch,rows}); } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
router.post('/imports/:id/decision', write, supervisor, async(req,res) => { let conn,transaction=false; try { const id=positiveId(req.params.id), decision=String(req.body?.decision||'').toUpperCase(), note=asText(req.body?.review_note); if(!id) throw inspectionError(400,'Invalid import batch ID'); if(!['APPROVE','REJECT'].includes(decision)) throw inspectionError(400,'Decision must be APPROVE or REJECT'); conn=await connOf(req); await conn.beginTransaction(); transaction=true; const s=await shed(conn,req); const [[batch]]=await conn.execute('SELECT * FROM div_trip_import_batches WHERE id=? AND shed_id=? FOR UPDATE',[id,s.id]); if(!batch) throw inspectionError(404,'Import batch not found'); if(batch.status!=='STAGED') throw inspectionError(409,'Import batch has already been reviewed'); const next=decision==='APPROVE'?'APPROVED':'REJECTED'; await conn.execute('UPDATE div_trip_import_batches SET status=?,reviewed_by=?,reviewed_at=NOW(),review_note=? WHERE id=? AND shed_id=?',[next,uid(req),note,id,s.id]); await conn.execute('UPDATE div_trip_import_staging_rows SET status=? WHERE batch_id=? AND status=?',[next==='APPROVED'?'APPROVED':'REJECTED',id,decision==='APPROVE'?'READY':'INVALID']); let publication='not applied'; if(next==='APPROVED'&&batch.import_kind==='SLAM_MOVEMENT'){const p=await publishSlamBatch(conn,s.id,id,uid(req)); publication=`${p.inserted} loco movement(s) published, ${p.linked} already present`;} await conn.commit(); transaction=false; res.json({message:`Import batch ${next.toLowerCase()}`,status:next,reviewed_by:uid(req),publication}); } catch(e) { if(transaction) await conn.rollback(); res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
// TI required today, by train (TS-040). Source: div_trip_ti_trains — Trip Shed's own list per shed,
// seeded from the CR loco-link PDF (a TI marker on a departure row = TI after the preceding arrival).
// Status window: a late-evening arrival reaches the shed next morning, so visits are looked up from the
// arrival date through the next day, earliest first.
// Joins (all read-only): div_trains for name; run days from the link master's UP working(s) as the
// Control Office sheet does (div_trains.run_days is incomplete, see RUN_DAYS_TWO_TABLE_RECONCILIATION.md),
// falling back to div_trains only when there is no working; div_train_stops (WTT)
// for the scheduled arrival at the arrival station, div_loco_link_log (Control Office daily sheet)
// for the loco, overridden by the shed's own fill-in in div_trip_ti_train_locos, and the SLAM
// register for status. Roster legs (link-maintenance) with ti_after=1 that are not on the shed list
// are reported as roster_only for reconciliation; absent roster tables are simply ignored.
const runsOn = (runDays, dow) => !runDays || /DAILY/i.test(runDays) || String(runDays).split(/[,\s]+/).map(Number).includes(dow);
const TI_SHED_ALIASES = Object.freeze({ VVH: ['VVH', 'LTT'] });
router.get('/ti-trains', async (req, res) => { let conn; try { conn = await connOf(req); const s = await shed(conn, req), day = asDate(req.query.date) || new Date().toISOString().slice(0,10); const dow = ((new Date(day + 'T00:00:00').getDay() + 6) % 7) + 1; const [rows] = await conn.execute(`SELECT x.train_no, x.arrival_station, x.departs_as, x.link_no, t.train_name, t.from_station, COALESCE((SELECT GROUP_CONCAT(DISTINCT m.run_days SEPARATOR ',') FROM div_loco_link_master m WHERE m.train_no = x.train_no AND m.direction = 'UP' AND m.active = 1 AND m.run_days IS NOT NULL), t.run_days) AS run_days, (SELECT TIME_FORMAT(MAX(st.arrival_time),'%H:%i') FROM div_train_stops st WHERE st.train_id = t.train_id AND st.station_code = x.arrival_station) AS sched_arrival, (SELECT g.actual_loco_no FROM div_loco_link_log g WHERE g.train_no = x.train_no AND g.working_date = ? ORDER BY g.id DESC LIMIT 1) AS co_loco, (SELECT f.loco_number FROM div_trip_ti_train_locos f WHERE f.shed_id = x.shed_id AND f.service_date = ? AND f.train_no = x.train_no) AS shed_loco FROM div_trip_ti_trains x LEFT JOIN div_trains t ON t.train_no = x.train_no AND t.is_active = 1 WHERE x.shed_id = ? AND x.is_active = 1 ORDER BY sched_arrival IS NULL, sched_arrival, x.train_no`, [day, day, s.id]); const todays = rows.filter(r => runsOn(r.run_days, dow)); const locos = [...new Set(todays.map(r => r.shed_loco || r.co_loco).filter(Boolean))]; const visits = new Map(); if (locos.length) { const [v] = await conn.execute(`SELECT loco_number, purpose, DATE_FORMAT(received_at,'%Y-%m-%d %H:%i') received_at, DATE_FORMAT(loco_out_at,'%Y-%m-%d %H:%i') loco_out_at FROM div_trip_loco_movements WHERE shed_id = ? AND received_at >= ? AND received_at < DATE_ADD(?, INTERVAL 2 DAY) AND loco_number IN (${locos.map(() => '?').join(',')}) ORDER BY received_at ASC`, [s.id, day, day, ...locos]); for (const row of v) if (!visits.has(row.loco_number)) visits.set(row.loco_number, row); } const out = todays.map(r => { const loco = r.shed_loco || r.co_loco || null, v = loco ? visits.get(loco) : null; return { train_no: r.train_no, train_name: r.train_name, from_station: r.from_station, arrival_station: r.arrival_station, sched_arrival: r.sched_arrival, departs_as: r.departs_as, loco_number: loco, loco_source: r.shed_loco ? 'SHED' : (r.co_loco ? 'CONTROL_OFFICE' : null), visit_purpose: v ? v.purpose : null, received_at: v ? v.received_at : null, loco_out_at: v ? v.loco_out_at : null, status: !v ? 'AWAITED' : (v.loco_out_at ? 'DONE' : 'IN_SHED') }; }); let roster_only = []; try { const names = TI_SHED_ALIASES[s.shed_code] || [s.shed_code]; const [legs] = await conn.execute(`SELECT DISTINCT l.train_no, r.link_no FROM div_loco_link_roster_legs l JOIN div_loco_link_roster r ON r.id = l.roster_id AND r.active = 1 WHERE l.ti_after = 1 AND (${names.map(() => 'r.ti_locations LIKE ?').join(' OR ')})`, names.map(n => `%${n}%`)); const listed = new Set(rows.map(r => r.train_no)); roster_only = legs.filter(l => !listed.has(l.train_no)); } catch (e) { if (e.code !== 'ER_NO_SUCH_TABLE') throw e; } const counts = { expected: out.length, done: out.filter(x => x.status === 'DONE').length, in_shed: out.filter(x => x.status === 'IN_SHED').length, awaited: out.filter(x => x.status === 'AWAITED').length, listed: rows.length }; res.json({ configured: rows.length > 0, date: day, shed: { id: s.id, code: s.shed_code }, rows: out, counts, roster_only }); } catch (e) { res.status(e.status || 500).json({ error: e.message }); } finally { conn?.release(); } });
// Shed's own loco fill-in for a TI train on a date (writers only); empty loco removes the entry.
router.put('/ti-trains/:train_no/loco', write, async (req, res) => { let conn; try { conn = await connOf(req); const s = await shed(conn, req), train = asText(req.params.train_no, 20), day = asDate(req.body?.date) || new Date().toISOString().slice(0,10), loco = asText(req.body?.loco_number, 20); if (!train) throw inspectionError(400, 'Train number required'); const [[listed]] = await conn.execute('SELECT id FROM div_trip_ti_trains WHERE shed_id = ? AND train_no = ? AND is_active = 1', [s.id, train]); if (!listed) throw inspectionError(404, 'Train is not on this shed\'s TI list'); if (loco && !/^[0-9]{4,6}$/.test(loco)) throw inspectionError(400, 'Loco number must be 4 to 6 digits'); if (loco) await conn.execute('INSERT INTO div_trip_ti_train_locos (shed_id, service_date, train_no, loco_number, entered_by) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE loco_number = VALUES(loco_number), entered_by = VALUES(entered_by)', [s.id, day, train, loco, req.session.user.id]); else await conn.execute('DELETE FROM div_trip_ti_train_locos WHERE shed_id = ? AND service_date = ? AND train_no = ?', [s.id, day, train]); res.json({ ok: true, train_no: train, date: day, loco_number: loco }); } catch (e) { res.status(e.status || 500).json({ error: e.message }); } finally { conn?.release(); } });

router.get('/dashboard', async (req, res) => { let conn; try { conn = await connOf(req); const s = await shed(conn,req), day = asDate(req.query.date) || new Date().toISOString().slice(0,10); const [[counts]] = await conn.execute("SELECT COUNT(*) total,SUM(status='draft') drafts,SUM(status='final') finalized FROM div_trip_inspections WHERE shed_id=? AND inspection_date=?", [s.id, day]); const [[open]] = await conn.execute("SELECT COUNT(*) total FROM div_trip_defects WHERE shed_id=? AND status<>'CLOSED'", [s.id]); const [[overdue]] = await conn.execute('SELECT COUNT(*) total FROM div_trip_overdue_entries WHERE shed_id=?', [s.id]); const [recent] = await conn.execute("SELECT i.id,i.loco_number,i.train_no,i.shift_code,i.status,t.inspection_type FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE i.shed_id=? ORDER BY i.updated_at DESC LIMIT 10", [s.id]); res.json({ date: day, counts: { total:+counts.total, drafts:+(counts.drafts||0), finalized:+(counts.finalized||0), open_defects:+open.total, overdue:+overdue.total }, recent }); } catch(e) { res.status(500).json({error:e.message}); } finally { conn?.release(); } });
router.get('/queue', async (req,res) => { try { const day=asDate(req.query.date)||new Date().toISOString().slice(0,10); const [rows]=await req.app.locals.pool.execute("SELECT train_no,actual_loco_no loco_number,base_shed loco_base,direction,incoming_train,outgoing_train FROM div_loco_link_log WHERE working_date=? AND actual_loco_no IS NOT NULL ORDER BY train_no LIMIT 100",[day]);res.json({rows}); } catch(e){res.json({rows:[]});} });
router.get('/locos/:number', async (req,res) => { try { const no=asText(req.params.number,20)||'';const [[loco]]=await req.app.locals.pool.execute('SELECT loco_number,loco_type,home_shed FROM div_locos WHERE loco_number=? LIMIT 1',[no]);if(!loco)return res.status(404).json({error:'Loco not found'});const d=asDate(req.query.date);let incoming_trains=[];if(d){const [x]=await req.app.locals.pool.execute("SELECT DISTINCT incoming_train FROM div_loco_link_log WHERE working_date=? AND actual_loco_no=? AND incoming_train IS NOT NULL AND TRIM(incoming_train)<>'' LIMIT 5",[d,no]);incoming_trains=x.map(r=>r.incoming_train)}res.json({loco,incoming_trains});}catch(e){res.status(500).json({error:'Loco lookup failed'});} });
router.get('/staff', async (req,res) => { let conn; try { conn=await connOf(req); const s=await shed(conn,req), q=asText(req.query.q,100), designation=asText(req.query.designation,60); const where=['s.shed_id=?','s.is_active=1'], params=[s.id]; if(q){where.push('(s.hrms_id LIKE ? OR s.staff_name LIKE ? OR s.pf_number LIKE ? OR s.mobile_number LIKE ?)'); const term=`%${q}%`; params.push(term,term,term,term)} if(designation){where.push('TRIM(s.designation)=TRIM(?)');params.push(designation)} const [rows]=await conn.execute(`SELECT s.id,s.staff_name,s.hrms_id,s.pf_number,s.mobile_number,s.designation,s.email,s.vvh_posting_year FROM div_trip_shed_staff s WHERE ${where.join(' AND ')} ORDER BY TRIM(s.designation),s.staff_name`,params); const [counts]=await conn.execute("SELECT TRIM(designation) designation,COUNT(*) count FROM div_trip_shed_staff WHERE shed_id=? AND is_active=1 GROUP BY TRIM(designation) ORDER BY TRIM(designation)",[s.id]); res.json({shed:{id:s.id,code:s.shed_code,name:s.shed_name},rows,counts}); } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
router.post('/staff', write, async (req,res) => { let conn; try { const b=req.body||{}, staffName=asText(b.staff_name,160), hrmsId=asText(b.hrms_id,20), pfNumber=asText(b.pf_number,20), designation=asText(b.designation,60), mobile=asText(b.mobile_number,20), email=asText(b.email,160); if(!staffName||!hrmsId||!pfNumber||!designation) throw inspectionError(400,'Name, HRMS ID, PF number and designation are required'); conn=await connOf(req); const s=await shed(conn,req); const [result]=await conn.execute('INSERT INTO div_trip_shed_staff (shed_id,staff_name,hrms_id,pf_number,mobile_number,designation,email,is_active,source_file,source_sheet) VALUES (?,?,?,?,?,?,?,1,?,?)',[s.id,staffName,hrmsId,pfNumber,mobile,designation,email,'UI entry','VVH STAFF UI']); res.status(201).json({id:result.insertId,message:'VVH staff added'}); } catch(e) { res.status(e.code==='ER_DUP_ENTRY'?409:e.status||500).json({error:e.code==='ER_DUP_ENTRY'?'This HRMS ID already exists for the shed':e.message}); } finally { conn?.release(); } });
router.patch('/staff/:id', write, async (req,res) => { let conn; try { const id=positiveId(req.params.id), b=req.body||{}, staffName=asText(b.staff_name,160), hrmsId=asText(b.hrms_id,20), pfNumber=asText(b.pf_number,20), designation=asText(b.designation,60), mobile=asText(b.mobile_number,20), email=asText(b.email,160); if(!id) throw inspectionError(400,'Invalid staff ID'); if(!staffName||!hrmsId||!pfNumber||!designation) throw inspectionError(400,'Name, HRMS ID, PF number and designation are required'); conn=await connOf(req); const s=await shed(conn,req); const [result]=await conn.execute('UPDATE div_trip_shed_staff SET staff_name=?,hrms_id=?,pf_number=?,mobile_number=?,designation=?,email=? WHERE id=? AND shed_id=? AND is_active=1',[staffName,hrmsId,pfNumber,mobile,designation,email,id,s.id]); if(!result.affectedRows) throw inspectionError(404,'Active staff record not found'); res.json({id,message:'VVH staff updated'}); } catch(e) { res.status(e.code==='ER_DUP_ENTRY'?409:e.status||500).json({error:e.code==='ER_DUP_ENTRY'?'This HRMS ID already exists for the shed':e.message}); } finally { conn?.release(); } });
router.get('/staff-search', async (req,res) => { let conn; try { const q=asText(req.query.q,80)||'', role=String(req.query.role||'').toLowerCase(); if(q.length<2)return res.json({rows:[]}); conn=await connOf(req); const s=await shed(conn,req), term=`%${q}%`; const roleFilter=role==='supervisor'?" AND TRIM(s.designation) IN ('SSE','JE','MCM M/F','MCM E/F')":role==='technician'?" AND TRIM(s.designation) NOT IN ('SSE','JE','MCM M/F','MCM E/F')":''; const [rows]=await conn.execute(`SELECT s.hrms_id,s.staff_name name,s.pf_number,s.designation designation_name FROM div_trip_shed_staff s WHERE s.shed_id=? AND s.is_active=1${roleFilter} AND (s.hrms_id LIKE ? OR s.staff_name LIKE ? OR s.pf_number LIKE ? OR s.mobile_number LIKE ?) ORDER BY (s.hrms_id=? OR s.pf_number=?) DESC,s.staff_name LIMIT 20`,[s.id,term,term,term,term,q,q]); res.json({role:['technician','supervisor'].includes(role)?role:null,rows}); } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
router.get('/template/:id', async(req,res)=>{try{const [items]=await req.app.locals.pool.execute('SELECT id template_item_id,section_name,item_no,label_en,label_hi,standard_value,is_required FROM div_trip_inspection_template_items WHERE template_id=? ORDER BY sort_order',[req.params.id]);res.json({items});}catch(e){res.status(500).json({error:'Template unavailable'});}});
router.get('/inspections', async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),q=req.query||{},params=[s.id],where=['i.shed_id=?'];const from=asDate(q.from),to=asDate(q.to),date=asDate(q.date);if((q.from&&!from)||(q.to&&!to)||(q.date&&!date))throw inspectionError(400,'Inspection filter dates must use YYYY-MM-DD');if(date){where.push('i.inspection_date=?');params.push(date)}else{if(from){where.push('i.inspection_date>=?');params.push(from)}if(to){where.push('i.inspection_date<=?');params.push(to)}}if(q.shift){if(!['00/08','08/16','16/24'].includes(q.shift))throw inspectionError(400,'Invalid inspection shift');where.push('i.shift_code=?');params.push(q.shift)}if(q.status){if(!['draft','final'].includes(q.status))throw inspectionError(400,'Invalid inspection status');where.push('i.status=?');params.push(q.status)}if(q.inspection_type){where.push('t.inspection_type=?');params.push(asText(q.inspection_type,30))}if(q.loco){where.push('(i.loco_number LIKE ? OR i.loco_base LIKE ?)');params.push(`%${asText(q.loco,40)}%`,`%${asText(q.loco,40)}%`)}if(q.train){where.push('(i.train_no LIKE ? OR i.incoming_train_no LIKE ?)');params.push(`%${asText(q.train,40)}%`,`%${asText(q.train,40)}%`)}const [rows]=await conn.execute(`SELECT i.id,DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date,i.shift_code,i.loco_number,i.loco_base,i.train_no,i.status,t.inspection_type,i.technician_name FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE ${where.join(' AND ')} ORDER BY i.updated_at DESC LIMIT 300`,params);res.json({rows,filters:{date:date||null,from:from||null,to:to||null,shift:q.shift||null,inspection_type:q.inspection_type||null,loco:q.loco||null,train:q.train||null,status:q.status||null}});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
// Every inspection mutation locks the header first, so save and finalise serialize.
const inspectionError = (status, message) => Object.assign(new Error(message), { status });
const positiveId = value => /^(?:[1-9][0-9]*)$/.test(String(value)) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
const validInspectionDate = value => {
  const date = asDate(value);
  return date && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date ? date : null;
};
async function eligibleTemplate(conn, id) {
  const [[template]] = await conn.execute('SELECT id,enabled,entry_enabled FROM div_trip_inspection_templates WHERE id=? FOR SHARE', [id]);
  if (!template || !template.enabled || !template.entry_enabled) throw inspectionError(400, 'This inspection template is not enabled for entry');
  const [items] = await conn.execute('SELECT id,is_required FROM div_trip_inspection_template_items WHERE template_id=? ORDER BY sort_order FOR SHARE', [id]);
  if (!items.length) throw inspectionError(400, 'This template has no checklist items');
  return items;
}
async function lockedInspection(conn, id, shedId) {
  const [[record]] = await conn.execute('SELECT * FROM div_trip_inspections WHERE id=? AND shed_id=? FOR UPDATE', [id, shedId]);
  if (!record) throw inspectionError(404, 'Inspection not found');
  if (record.status !== 'draft') throw inspectionError(409, 'Finalized inspection is locked');
  return record;
}
router.get('/inspections/:id', async (req, res) => {
  let conn;
  try {
    const id = positiveId(req.params.id);
    if (!id) throw inspectionError(400, 'Invalid inspection ID');
    conn = await connOf(req);
    const s = await shed(conn,req);
    const [[inspection]] = await conn.execute("SELECT i.*,DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date FROM div_trip_inspections i WHERE i.id=? AND i.shed_id=?", [id, s.id]);
    if (!inspection) throw inspectionError(404, 'Inspection not found');
    const [items] = await conn.execute('SELECT ti.id template_item_id,ti.section_name,ti.item_no,ti.label_en,ti.label_hi,ti.standard_value,ti.is_required,r.outcome,r.observed_value FROM div_trip_inspection_template_items ti LEFT JOIN div_trip_inspection_responses r ON r.template_item_id=ti.id AND r.inspection_id=? WHERE ti.template_id=? ORDER BY ti.sort_order', [id, inspection.template_id]);
    res.json({ inspection, items });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
  finally { conn?.release(); }
});
router.get('/inspections/:id/print', async (req, res) => {
  let conn;
  try {
    const id = positiveId(req.params.id);
    if (!id) throw inspectionError(400, 'Invalid inspection ID');
    conn = await connOf(req);
    const s = await shed(conn,req);
    const [[inspection]] = await conn.execute("SELECT i.*,DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date,DATE_FORMAT(i.finalized_at,'%Y-%m-%d %H:%i') finalized_at,t.inspection_type,t.title template_title FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE i.id=? AND i.shed_id=?", [id, s.id]);
    if (!inspection) throw inspectionError(404, 'Inspection not found');
    if (inspection.status !== 'final') throw inspectionError(409, 'Only finalized inspections can be printed');
    const [items] = await conn.execute('SELECT ti.id template_item_id,ti.section_name,ti.item_no,ti.label_en,ti.label_hi,ti.standard_value,ti.is_required,r.outcome,r.observed_value FROM div_trip_inspection_template_items ti LEFT JOIN div_trip_inspection_responses r ON r.template_item_id=ti.id AND r.inspection_id=? WHERE ti.template_id=? ORDER BY ti.sort_order', [id, inspection.template_id]);
    res.json({ inspection, items, shed: s });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
  finally { conn?.release(); }
});
router.post('/inspections', write, async (req, res) => {
  let conn, transaction = false;
  try {
    const b = req.body || {};
    let id = b.id == null || b.id === '' ? null : positiveId(b.id);
    if (b.id != null && b.id !== '' && !id) throw inspectionError(400, 'Invalid inspection ID');
    const templateId = positiveId(b.template_id);
    const date = validInspectionDate(b.inspection_date), loco = asText(b.loco_number, 20);
    const kmsReading = asDecimal(b.kms_reading);
    const energyConsumed = asDecimal(b.energy_consumed_kwh, 999999999999.99);
    const rtisStatus = asText(b.rtis_status, 20);
    if (b.kms_reading != null && b.kms_reading !== '' && kmsReading == null) throw inspectionError(400, 'Kilometre reading must be a non-negative number');
    if (b.energy_consumed_kwh != null && b.energy_consumed_kwh !== '' && energyConsumed == null) throw inspectionError(400, 'Energy consumed (KWH) must be a non-negative number');
    if (rtisStatus && !['WORKING', 'NOT_WORKING', 'NOT_RECORDED'].includes(rtisStatus)) throw inspectionError(400, 'RTIS status is invalid');
    if (!templateId || !date || !loco || !['00/08', '08/16', '16/24'].includes(b.shift_code)) throw inspectionError(400, 'Valid template, date, shift and loco number are required');
    if (!Array.isArray(b.responses)) throw inspectionError(400, 'Checklist responses must be an array');
    conn = await connOf(req);
    await conn.beginTransaction(); transaction = true;
    const s = await shed(conn,req);
    if (id) {
      const record = await lockedInspection(conn, id, s.id);
      // Changing a saved form's template could orphan historical response links.
      if (record.template_id !== templateId) throw inspectionError(400, 'The template of a saved inspection cannot be changed; create a new inspection');
    }
    const items = await eligibleTemplate(conn, templateId), allowed = new Set(items.map(x => x.id)), seen = new Set();
    for (const response of b.responses) {
      const itemId = positiveId(response?.template_item_id);
      if (!allowed.has(itemId) || seen.has(itemId)) throw inspectionError(400, 'Checklist contains an invalid, duplicate or unrelated item');
      if (!['OK', 'ATTENTION', 'NOT_APPLICABLE', 'NOT_CHECKED'].includes(response.outcome)) throw inspectionError(400, 'Invalid checklist outcome');
      seen.add(itemId);
    }
    const values = [templateId, date, b.shift_code, loco, asText(b.loco_type,30), asText(b.loco_base,30), asText(b.train_no,40), asText(b.incoming_train_no,40), asText(b.technician_name,160), asText(b.supervisor_name,160), asText(b.technician_hrms_id,20), asText(b.supervisor_hrms_id,20), asText(b.cab_leading,30), kmsReading, asText(b.traction_converter_make,80), asText(b.auxiliary_converter_make,80), asText(b.brake_system_make,80), asText(b.hlc_make,80), asText(b.spm_make,80), energyConsumed, rtisStatus, asText(b.rtis_remarks,160), asText(b.general_remarks), uid(req)];
    if (id) {
      await conn.execute("UPDATE div_trip_inspections SET template_id=?,inspection_date=?,shift_code=?,loco_number=?,loco_type=?,loco_base=?,train_no=?,incoming_train_no=?,technician_name=?,supervisor_name=?,technician_hrms_id=?,supervisor_hrms_id=?,cab_leading=?,kms_reading=?,traction_converter_make=?,auxiliary_converter_make=?,brake_system_make=?,hlc_make=?,spm_make=?,energy_consumed_kwh=?,rtis_status=?,rtis_remarks=?,general_remarks=?,updated_by=? WHERE id=? AND shed_id=? AND status='draft'", [...values, id, s.id]);
    } else {
      const [result] = await conn.execute('INSERT INTO div_trip_inspections(shed_id,template_id,inspection_date,shift_code,loco_number,loco_type,loco_base,train_no,incoming_train_no,technician_name,supervisor_name,technician_hrms_id,supervisor_hrms_id,cab_leading,kms_reading,traction_converter_make,auxiliary_converter_make,brake_system_make,hlc_make,spm_make,energy_consumed_kwh,rtis_status,rtis_remarks,general_remarks,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [s.id, ...values, uid(req)]);
      id = result.insertId;
    }
    for (const response of b.responses) {
      await conn.execute('INSERT INTO div_trip_inspection_responses(inspection_id,template_item_id,outcome,observed_value) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE outcome=VALUES(outcome),observed_value=VALUES(observed_value)', [id, Number(response.template_item_id), response.outcome, asText(response.observed_value)]);
    }
    await conn.commit(); transaction = false;
    res.json({ id, message: 'Draft saved' });
  } catch (e) {
    if (transaction) await conn.rollback();
    res.status(e.status || 500).json({ error: e.message });
  } finally { conn?.release(); }
});
router.post('/inspections/:id/finalize', write, supervisor, async (req, res) => {
  let conn, transaction = false;
  try {
    const id = positiveId(req.params.id);
    if (!id) throw inspectionError(400, 'Invalid inspection ID');
    conn = await connOf(req);
    await conn.beginTransaction(); transaction = true;
    const s = await shed(conn,req), record = await lockedInspection(conn, id, s.id);
    const items = await eligibleTemplate(conn, record.template_id);
    if (!record.loco_number?.trim() || !record.inspection_date || !['00/08','08/16','16/24'].includes(record.shift_code)) throw inspectionError(400, 'Complete the inspection header before finalizing');
    const [responses] = await conn.execute('SELECT template_item_id,outcome FROM div_trip_inspection_responses WHERE inspection_id=?', [id]);
    const allowed = new Set(items.map(x => x.id)), answers = new Map(responses.map(x => [x.template_item_id, x.outcome]));
    if (responses.some(x => !allowed.has(x.template_item_id))) throw inspectionError(400, 'Inspection contains responses from another template');
    const missing = items.filter(x => x.is_required && !['OK','ATTENTION','NOT_APPLICABLE'].includes(answers.get(x.id)));
    if (missing.length) throw inspectionError(400, `Complete all required checklist items before finalizing (${missing.length} remaining)`);
    await conn.execute("UPDATE div_trip_inspections SET status='final',finalized_by=?,finalized_at=NOW(),updated_by=? WHERE id=? AND shed_id=? AND status='draft'", [uid(req), uid(req), id, s.id]);
    await conn.commit(); transaction = false;
    res.json({ message: 'Inspection finalized' });
  } catch (e) {
    if (transaction) await conn.rollback();
    res.status(e.status || 500).json({ error: e.message });
  } finally { conn?.release(); }
});
router.get('/defects',async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),q=req.query||{},status=asText(q.status,20),from=asDate(q.from),to=asDate(q.to),params=[s.id],where=['d.shed_id=?'];if(status&&!['OPEN','UNDER_ATTENTION','CLOSED'].includes(status))throw inspectionError(400,'Invalid defect status');if((q.from&&!from)||(q.to&&!to))throw inspectionError(400,'Defect filter dates must use YYYY-MM-DD');if(from){where.push('d.defect_date>=?');params.push(from)}if(to){where.push('d.defect_date<=?');params.push(to)}if(status){where.push('d.status=?');params.push(status)}if(q.loco){where.push('(d.loco_number LIKE ? OR d.loco_base LIKE ?)');const x=`%${asText(q.loco,40)}%`;params.push(x,x)}const [rows]=await conn.execute(`SELECT d.*,DATE_FORMAT(d.defect_date,'%Y-%m-%d') defect_date,(SELECT COUNT(*) FROM div_trip_defect_events e WHERE e.defect_id=d.id) event_count FROM div_trip_defects d WHERE ${where.join(' AND ')} ORDER BY d.updated_at DESC LIMIT 300`,params);res.json({rows,filters:{from:from||null,to:to||null,loco:q.loco||null,status:status||null}});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.get('/defects/:id/events',async(req,res)=>{let conn;try{const id=positiveId(req.params.id);if(!id)throw inspectionError(400,'Invalid defect ID');conn=await connOf(req);const s=await shed(conn,req);const [[defect]]=await conn.execute("SELECT d.*,DATE_FORMAT(d.defect_date,'%Y-%m-%d') defect_date FROM div_trip_defects d WHERE d.id=? AND d.shed_id=?",[id,s.id]);if(!defect)throw inspectionError(404,'Defect not found');const [events]=await conn.execute("SELECT id,event_type,event_note,status_after,created_by,DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') created_at FROM div_trip_defect_events WHERE defect_id=? ORDER BY id",[id]);res.json({defect,events});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.post('/defects',write,async(req,res)=>{let conn,transaction=false;try{conn=await connOf(req);const s=await shed(conn,req),b=req.body||{},d=asDate(b.defect_date),l=asText(b.loco_number,20),description=asText(b.description);if(!d||!l||!description)return res.status(400).json({error:'Date, loco and description are required'});await conn.beginTransaction();transaction=true;const [r]=await conn.execute('INSERT INTO div_trip_defects(shed_id,defect_date,loco_number,loco_base,incoming_train_no,equipment_name,defect_category,description,action_taken,responsible_party,status,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',[s.id,d,l,asText(b.loco_base,30),asText(b.incoming_train_no,40),asText(b.equipment_name,120),asText(b.defect_category,20)||'OTHER',description,asText(b.action_taken),asText(b.responsible_party,160),'OPEN',uid(req),uid(req)]);await conn.execute("INSERT INTO div_trip_defect_events(defect_id,event_type,event_note,status_after,created_by) VALUES(?,?,?,?,?)",[r.insertId,'CREATED','Defect recorded','OPEN',uid(req)]);await conn.commit();transaction=false;res.json({id:r.insertId,message:'Defect saved'});}catch(e){if(transaction)await conn.rollback();res.status(500).json({error:e.message});}finally{conn?.release();}});
router.post('/defects/:id/lifecycle',write,async(req,res)=>{let conn,transaction=false;try{const id=positiveId(req.params.id),b=req.body||{},next=asText(b.status,20),note=asText(b.event_note);if(!id)throw inspectionError(400,'Invalid defect ID');if(!['OPEN','UNDER_ATTENTION','CLOSED'].includes(next))throw inspectionError(400,'Invalid defect status');conn=await connOf(req);await conn.beginTransaction();transaction=true;const s=await shed(conn,req);const [[defect]]=await conn.execute('SELECT * FROM div_trip_defects WHERE id=? AND shed_id=? FOR UPDATE',[id,s.id]);if(!defect)throw inspectionError(404,'Defect not found');if(defect.status==='CLOSED')throw inspectionError(409,'Closed defect is locked');if(next==='OPEN'&&defect.status!=='OPEN')throw inspectionError(400,'A defect cannot move back to Open');if(next==='CLOSED'&&!asText(b.action_taken)&&!asText(defect.action_taken))throw inspectionError(400,'Action taken is required before closing');if(next===defect.status&&!note)throw inspectionError(400,'Choose a new lifecycle status or add an event note');const action=asText(b.action_taken)||defect.action_taken,party=asText(b.responsible_party)||defect.responsible_party;await conn.execute('UPDATE div_trip_defects SET status=?,action_taken=?,responsible_party=?,updated_by=? WHERE id=? AND shed_id=? AND status<>\'CLOSED\'', [next,action,party,uid(req),id,s.id]);await conn.execute('INSERT INTO div_trip_defect_events(defect_id,event_type,event_note,status_after,created_by) VALUES(?,?,?,?,?)',[id,next==='CLOSED'?'CLOSED':'STATUS_CHANGE',note||null,next,uid(req)]);await conn.commit();transaction=false;res.json({message:'Defect lifecycle updated',status:next});}catch(e){if(transaction)await conn.rollback();res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.get('/movements',async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),q=req.query||{},from=asDate(q.from),to=asDate(q.to),params=[s.id],where=['shed_id=?'];if((q.from&&!from)||(q.to&&!to))throw inspectionError(400,'Movement filter dates must use YYYY-MM-DD');if(from){where.push('received_at>=?');params.push(from+' 00:00:00')}if(to){where.push('received_at<=?');params.push(to+' 23:59:59')}if(q.loco){where.push('(loco_number LIKE ? OR home_shed LIKE ?)');const x=`%${asText(q.loco,40)}%`;params.push(x,x)}if(q.purpose){where.push('purpose=?');params.push(String(q.purpose).toUpperCase().slice(0,20))}const [rows]=await conn.execute(`SELECT *,DATE_FORMAT(received_at,'%Y-%m-%d %H:%i') received_at,DATE_FORMAT(loco_out_at,'%Y-%m-%d %H:%i') loco_out_at FROM div_trip_loco_movements WHERE ${where.join(' AND ')} ORDER BY received_at DESC,id DESC LIMIT 1000`,params);res.json({rows,filters:{from:from||null,to:to||null,loco:q.loco||null,purpose:q.purpose||null}});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.get('/overdue',async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),q=req.query||{},from=asDate(q.from),to=asDate(q.to),params=[s.id],where=['shed_id=?'];if((q.from&&!from)||(q.to&&!to))throw inspectionError(400,'Overdue filter dates must use YYYY-MM-DD');if(from){where.push('entry_date>=?');params.push(from)}if(to){where.push('entry_date<=?');params.push(to)}if(q.loco){where.push('(loco_number LIKE ? OR loco_base LIKE ?)');const x=`%${asText(q.loco,40)}%`;params.push(x,x)}const [rows]=await conn.execute(`SELECT *,DATE_FORMAT(entry_date,'%Y-%m-%d') entry_date,DATE_FORMAT(last_inspection_date,'%Y-%m-%d') last_inspection_date FROM div_trip_overdue_entries WHERE ${where.join(' AND ')} ORDER BY entry_date DESC,id DESC`,params);res.json({rows,filters:{from:from||null,to:to||null,loco:q.loco||null}});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.get('/overdue/:id',async(req,res)=>{let conn;try{const id=positiveId(req.params.id);if(!id)throw inspectionError(400,'Invalid overdue entry ID');conn=await connOf(req);const s=await shed(conn,req);const [[row]]=await conn.execute("SELECT *,DATE_FORMAT(entry_date,'%Y-%m-%d') entry_date,DATE_FORMAT(last_inspection_date,'%Y-%m-%d') last_inspection_date FROM div_trip_overdue_entries WHERE id=? AND shed_id=?",[id,s.id]);if(!row)throw inspectionError(404,'TI-overdue entry not found');res.json({row});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.post('/overdue',write,async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),b=req.body||{},d=asDate(b.entry_date),l=asText(b.loco_number,20);if(!d||!l)return res.status(400).json({error:'Date and loco number are required'});const [r]=await conn.execute('INSERT INTO div_trip_overdue_entries(shed_id,entry_date,loco_number,loco_base,incoming_train_no,kms,last_inspection_date,last_inspection_type,outgoing_train_no,last_shed,remarks) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[s.id,d,l,asText(b.loco_base,30),asText(b.incoming_train_no,40),b.kms||null,asDate(b.last_inspection_date),asText(b.last_inspection_type,30),asText(b.outgoing_train_no,40),asText(b.last_shed,60),asText(b.remarks)]);res.json({id:r.insertId});}catch(e){res.status(500).json({error:e.message});}finally{conn?.release();}});
router.patch('/overdue/:id',write,async(req,res)=>{let conn;try{const id=positiveId(req.params.id),b=req.body||{},d=asDate(b.entry_date),l=asText(b.loco_number,20);if(!id)throw inspectionError(400,'Invalid overdue entry ID');if(!d||!l)return res.status(400).json({error:'Date and loco number are required'});conn=await connOf(req);const s=await shed(conn,req);const [r]=await conn.execute('UPDATE div_trip_overdue_entries SET entry_date=?,loco_number=?,loco_base=?,incoming_train_no=?,kms=?,last_inspection_date=?,last_inspection_type=?,outgoing_train_no=?,last_shed=?,remarks=? WHERE id=? AND shed_id=?',[d,l,asText(b.loco_base,30),asText(b.incoming_train_no,40),b.kms===''||b.kms==null?null:b.kms,asDate(b.last_inspection_date),asText(b.last_inspection_type,30),asText(b.outgoing_train_no,40),asText(b.last_shed,60),asText(b.remarks),id,s.id]);if(!r.affectedRows)throw inspectionError(404,'TI-overdue entry not found');res.json({id,message:'TI-overdue entry updated'});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
module.exports=router;
