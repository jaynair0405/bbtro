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
const importKinds = new Set(['MCDO','OVERDUE','REPAIR_ATTENTION']);
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
async function stageImport(req, res) {
  let conn, transaction = false;
  try {
    const kind = String(req.body?.import_kind || '').toUpperCase();
    if (!importKinds.has(kind)) throw inspectionError(400, 'Import kind must be MCDO, OVERDUE or REPAIR_ATTENTION');
    if (!req.file) throw inspectionError(400, 'Spreadsheet file is required');
    const workbook = XLSX.read(req.file.buffer, { type:'buffer', cellDates:true, raw:false });
    if (!workbook.SheetNames.length) throw inspectionError(400, 'Spreadsheet has no worksheets');
    const staged = [];
    for (const sheetName of workbook.SheetNames) {
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval:null, raw:false });
      staged.push(...normalizeImportRows(kind, sheetName, rawRows));
    }
    if (!staged.length) throw inspectionError(400, 'Spreadsheet has no data rows');
    conn = await connOf(req); await conn.beginTransaction(); transaction = true;
    const s = await shed(conn,req), sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex'), readyCount=staged.filter(x=>x.status==='READY').length, invalidCount=staged.length-readyCount;
    const [batch] = await conn.execute('INSERT INTO div_trip_import_batches(shed_id,import_kind,source_filename,source_sha256,status,total_rows,valid_rows,invalid_rows,uploaded_by) VALUES(?,?,?,?,?,?,?,?,?)',[s.id,kind,req.file.originalname,sha256,'STAGED',staged.length,readyCount,invalidCount,uid(req)]);
    for (const row of staged) await conn.execute('INSERT INTO div_trip_import_staging_rows(batch_id,source_sheet,source_row_no,raw_json,normalized_json,validation_errors,status) VALUES(?,?,?,?,?,?,?)',[batch.insertId,row.normalized.sheet,row.sourceRowNo,JSON.stringify(row.normalized.values),JSON.stringify(row.normalized),JSON.stringify(row.normalized.flags),'READY'===row.status?'READY':'INVALID']);
    await conn.commit(); transaction = false;
    res.json({ id: batch.insertId, import_kind: kind, source_filename: req.file.originalname, row_count: staged.length, ready_count: staged.filter(x=>x.status==='READY').length, invalid_count: staged.filter(x=>x.status!=='READY').length });
  } catch (e) { if (transaction) await conn.rollback(); res.status(e.status || 500).json({ error:e.message }); }
  finally { conn?.release(); }
}

router.get('/config', async (req, res) => { let conn; try { conn = await connOf(req); const current = await shed(conn,req), sheds=await availableSheds(conn,req); const [templates] = await conn.execute("SELECT id,inspection_type,title,entry_enabled FROM div_trip_inspection_templates WHERE enabled=1 AND inspection_type NOT IN ('IA','IB','IC') ORDER BY id"); res.json({ shed: current, sheds, templates, deferred_modules: DEFERRED_MODULES, out_of_scope_modules: OUT_OF_SCOPE_MODULES, user: { ...req.session.user, read_only: req.tripReadOnly, can_finalize: SUPERVISORS.has(req.session.user.div_role) } }); } catch (e) { res.status(e.status||500).json({ error: e.message }); } finally { conn?.release(); } });
router.get('/export/:kind', async (req,res) => {
  let conn;
  try {
    const kind=String(req.params.kind||'').toLowerCase(), format=String(req.query.format||'csv').toLowerCase();
    if (!['inspections','defects','overdue'].includes(kind)) throw inspectionError(400,'Unsupported export register');
    if (!['csv','xlsx'].includes(format)) throw inspectionError(400,'Export format must be csv or xlsx');
    const from=asDate(req.query.from), to=asDate(req.query.to); if ((req.query.from && !from) || (req.query.to && !to)) throw inspectionError(400,'Export dates must use YYYY-MM-DD');
    conn=await connOf(req); const s=await shed(conn,req); let rows, title;
    if (kind==='inspections') { const where=['i.shed_id=?'], p=[s.id]; if(from){where.push('i.inspection_date>=?');p.push(from)} if(to){where.push('i.inspection_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date,i.shift_code,t.inspection_type,i.loco_number,i.loco_type,i.loco_base,i.train_no,i.incoming_train_no,i.technician_name,i.technician_hrms_id,i.supervisor_name,i.supervisor_hrms_id,i.status,i.general_remarks FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE ${where.join(' AND ')} ORDER BY i.inspection_date,i.id`,p); title='trip_shed_inspections'; }
    if (kind==='defects') { const where=['d.shed_id=?'], p=[s.id]; if(from){where.push('d.defect_date>=?');p.push(from)} if(to){where.push('d.defect_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(d.defect_date,'%Y-%m-%d') defect_date,d.loco_number,d.loco_base,d.incoming_train_no,d.equipment_name,d.description,d.action_taken,d.responsible_party,d.status,d.created_by,d.updated_by FROM div_trip_defects d WHERE ${where.join(' AND ')} ORDER BY d.defect_date,d.id`,p); title='trip_shed_defects'; }
    if (kind==='overdue') { const where=['o.shed_id=?'], p=[s.id]; if(from){where.push('o.entry_date>=?');p.push(from)} if(to){where.push('o.entry_date<=?');p.push(to)}; [rows]=await conn.execute(`SELECT DATE_FORMAT(o.entry_date,'%Y-%m-%d') entry_date,o.loco_number,o.loco_base,o.incoming_train_no,o.kms,DATE_FORMAT(o.last_inspection_date,'%Y-%m-%d') last_inspection_date,o.last_inspection_type,o.outgoing_train_no,o.last_shed,o.remarks FROM div_trip_overdue_entries o WHERE ${where.join(' AND ')} ORDER BY o.entry_date,o.id`,p); title='trip_shed_ti_overdue'; }
    const sheet=XLSX.utils.json_to_sheet(rows); if(format==='csv'){const csv=XLSX.utils.sheet_to_csv(sheet); res.status(200).set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${title}.csv"`}).send('\ufeff'+csv);} else {const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,sheet,'Trip Shed'); const buf=XLSX.write(book,{type:'buffer',bookType:'xlsx'}); res.status(200).set({'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${title}.xlsx"`}).send(buf);}
  } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); }
});
router.post('/imports/stage', write, importUpload.single('file'), stageImport);
router.get('/imports', async (req,res) => { let conn; try { conn=await connOf(req); const s=await shed(conn,req); const [rows]=await conn.execute("SELECT id,import_kind,source_filename,status,total_rows,valid_rows,invalid_rows,uploaded_by,reviewed_by,reviewed_at,created_at FROM div_trip_import_batches WHERE shed_id=? ORDER BY id DESC LIMIT 100",[s.id]); res.json({rows}); } catch(e) { res.status(500).json({error:e.message}); } finally { conn?.release(); } });
router.get('/imports/:id', async (req,res) => { let conn; try { const id=positiveId(req.params.id); if(!id) throw inspectionError(400,'Invalid import batch ID'); conn=await connOf(req); const s=await shed(conn,req); const [[batch]]=await conn.execute('SELECT * FROM div_trip_import_batches WHERE id=? AND shed_id=?',[id,s.id]); if(!batch) throw inspectionError(404,'Import batch not found'); const [rows]=await conn.execute('SELECT id,source_sheet,source_row_no,raw_json,normalized_json,validation_errors,status,published_record_id FROM div_trip_import_staging_rows WHERE batch_id=? ORDER BY id',[id]); res.json({batch,rows}); } catch(e) { res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
router.post('/imports/:id/decision', write, supervisor, async(req,res) => { let conn,transaction=false; try { const id=positiveId(req.params.id), decision=String(req.body?.decision||'').toUpperCase(), note=asText(req.body?.review_note); if(!id) throw inspectionError(400,'Invalid import batch ID'); if(!['APPROVE','REJECT'].includes(decision)) throw inspectionError(400,'Decision must be APPROVE or REJECT'); conn=await connOf(req); await conn.beginTransaction(); transaction=true; const s=await shed(conn,req); const [[batch]]=await conn.execute('SELECT * FROM div_trip_import_batches WHERE id=? AND shed_id=? FOR UPDATE',[id,s.id]); if(!batch) throw inspectionError(404,'Import batch not found'); if(batch.status!=='STAGED') throw inspectionError(409,'Import batch has already been reviewed'); const next=decision==='APPROVE'?'APPROVED':'REJECTED'; await conn.execute('UPDATE div_trip_import_batches SET status=?,reviewed_by=?,reviewed_at=NOW(),review_note=? WHERE id=? AND shed_id=?',[next,uid(req),note,id,s.id]); await conn.execute('UPDATE div_trip_import_staging_rows SET status=? WHERE batch_id=? AND status=?',[next==='APPROVED'?'APPROVED':'REJECTED',id,decision==='APPROVE'?'READY':'INVALID']); await conn.commit(); transaction=false; res.json({message:`Import batch ${next.toLowerCase()}`,status:next,reviewed_by:uid(req),publication:'not applied'}); } catch(e) { if(transaction) await conn.rollback(); res.status(e.status||500).json({error:e.message}); } finally { conn?.release(); } });
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
router.get('/overdue',async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),q=req.query||{},from=asDate(q.from),to=asDate(q.to),params=[s.id],where=['shed_id=?'];if((q.from&&!from)||(q.to&&!to))throw inspectionError(400,'Overdue filter dates must use YYYY-MM-DD');if(from){where.push('entry_date>=?');params.push(from)}if(to){where.push('entry_date<=?');params.push(to)}if(q.loco){where.push('(loco_number LIKE ? OR loco_base LIKE ?)');const x=`%${asText(q.loco,40)}%`;params.push(x,x)}const [rows]=await conn.execute(`SELECT *,DATE_FORMAT(entry_date,'%Y-%m-%d') entry_date,DATE_FORMAT(last_inspection_date,'%Y-%m-%d') last_inspection_date FROM div_trip_overdue_entries WHERE ${where.join(' AND ')} ORDER BY entry_date DESC,id DESC`,params);res.json({rows,filters:{from:from||null,to:to||null,loco:q.loco||null}});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.get('/overdue/:id',async(req,res)=>{let conn;try{const id=positiveId(req.params.id);if(!id)throw inspectionError(400,'Invalid overdue entry ID');conn=await connOf(req);const s=await shed(conn,req);const [[row]]=await conn.execute("SELECT *,DATE_FORMAT(entry_date,'%Y-%m-%d') entry_date,DATE_FORMAT(last_inspection_date,'%Y-%m-%d') last_inspection_date FROM div_trip_overdue_entries WHERE id=? AND shed_id=?",[id,s.id]);if(!row)throw inspectionError(404,'TI-overdue entry not found');res.json({row});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
router.post('/overdue',write,async(req,res)=>{let conn;try{conn=await connOf(req);const s=await shed(conn,req),b=req.body||{},d=asDate(b.entry_date),l=asText(b.loco_number,20);if(!d||!l)return res.status(400).json({error:'Date and loco number are required'});const [r]=await conn.execute('INSERT INTO div_trip_overdue_entries(shed_id,entry_date,loco_number,loco_base,incoming_train_no,kms,last_inspection_date,last_inspection_type,outgoing_train_no,last_shed,remarks) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[s.id,d,l,asText(b.loco_base,30),asText(b.incoming_train_no,40),b.kms||null,asDate(b.last_inspection_date),asText(b.last_inspection_type,30),asText(b.outgoing_train_no,40),asText(b.last_shed,60),asText(b.remarks)]);res.json({id:r.insertId});}catch(e){res.status(500).json({error:e.message});}finally{conn?.release();}});
router.patch('/overdue/:id',write,async(req,res)=>{let conn;try{const id=positiveId(req.params.id),b=req.body||{},d=asDate(b.entry_date),l=asText(b.loco_number,20);if(!id)throw inspectionError(400,'Invalid overdue entry ID');if(!d||!l)return res.status(400).json({error:'Date and loco number are required'});conn=await connOf(req);const s=await shed(conn,req);const [r]=await conn.execute('UPDATE div_trip_overdue_entries SET entry_date=?,loco_number=?,loco_base=?,incoming_train_no=?,kms=?,last_inspection_date=?,last_inspection_type=?,outgoing_train_no=?,last_shed=?,remarks=? WHERE id=? AND shed_id=?',[d,l,asText(b.loco_base,30),asText(b.incoming_train_no,40),b.kms===''||b.kms==null?null:b.kms,asDate(b.last_inspection_date),asText(b.last_inspection_type,30),asText(b.outgoing_train_no,40),asText(b.last_shed,60),asText(b.remarks),id,s.id]);if(!r.affectedRows)throw inspectionError(404,'TI-overdue entry not found');res.json({id,message:'TI-overdue entry updated'});}catch(e){res.status(e.status||500).json({error:e.message});}finally{conn?.release();}});
module.exports=router;
