const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { ensureTripShedTemplates } = require('../../utils/tripShedTemplates');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const OPERATORS = new Set(['trip_shed_operator', 'trip_shed_supervisor', 'division_admin']);
const SUPERVISORS = new Set(['trip_shed_supervisor', 'division_admin']);
const CONTROL_READERS = new Set(['lpc', 'ctlc', 'ctlc_view', 'ssehq']);
const validStatus = new Set(['OPEN', 'UNDER_ATTENTION', 'CLOSED']);
const validOutcome = new Set(['OK', 'ATTENTION', 'NOT_APPLICABLE', 'NOT_CHECKED']);
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : null;
const text = (value, max = 65535) => value == null ? null : String(value).trim().slice(0, max) || null;
const defectStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, '_');
  return validStatus.has(normalized) ? normalized : null;
};
const userId = (req) => req.session?.user?.id || null;

function access(req, res, next) {
  const u = req.session?.user;
  if (!u || u.realm !== 'division' || (!OPERATORS.has(u.div_role) && !CONTROL_READERS.has(u.div_role))) {
    return res.status(403).json({ error: 'Trip Shed access required' });
  }
  req.tripReadOnly = CONTROL_READERS.has(u.div_role);
  next();
}
function write(req, res, next) {
  if (req.tripReadOnly) return res.status(403).json({ error: 'Trip Shed access is read-only for this role' });
  next();
}
function supervisor(req, res, next) {
  if (!SUPERVISORS.has(req.session?.user?.div_role)) return res.status(403).json({ error: 'Trip Shed supervisor access required' });
  next();
}
router.use(access);

async function shed(conn, code = 'VVH') {
  const [[row]] = await conn.execute('SELECT * FROM div_trip_sheds WHERE shed_code=? AND is_active=1 LIMIT 1', [code]);
  if (!row) throw new Error('Trip Shed configuration not found');
  return row;
}
async function setup(req) {
  const conn = await req.app.locals.pool.getConnection();
  try { await ensureTripShedTemplates(conn); return conn; } catch (e) { conn.release(); throw e; }
}
async function inspectionWithResponses(conn, id) {
  const [[inspection]] = await conn.execute(
    `SELECT i.*, s.shed_code, s.shed_name, t.inspection_type, t.version_no, t.title
       FROM div_trip_inspections i JOIN div_trip_sheds s ON s.id=i.shed_id
       JOIN div_trip_inspection_templates t ON t.id=i.template_id WHERE i.id=?`, [id]
  );
  if (!inspection) return null;
  const [items] = await conn.execute(
    `SELECT ti.id AS template_item_id, ti.section_name, ti.item_no, ti.label_en, ti.label_hi,
            ti.standard_value, ti.sort_order, ti.is_required, r.outcome, r.observed_value, r.remarks, r.defect_id
       FROM div_trip_inspection_template_items ti
       LEFT JOIN div_trip_inspection_responses r ON r.template_item_id=ti.id AND r.inspection_id=?
      WHERE ti.template_id=? ORDER BY ti.sort_order`, [id, inspection.template_id]
  );
  return { inspection, items };
}
function csv(res, filename, headers, rows) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send([headers.map(cell).join(','), ...rows.map(r => r.map(cell).join(','))].join('\n'));
}

router.get('/config', async (req, res) => {
  let conn;
  try {
    conn = await setup(req); const currentShed = await shed(conn);
    const [templates] = await conn.execute(
      `SELECT id, inspection_type, version_no, title, entry_enabled FROM div_trip_inspection_templates
       WHERE enabled=1 ORDER BY FIELD(inspection_type,'GC','TI_CONVENTIONAL','TI_3PHASE','IA','IB','IC')`
    );
    res.json({ shed: currentShed, templates, user: { ...req.session.user, can_finalize: SUPERVISORS.has(req.session.user.div_role), read_only: req.tripReadOnly } });
  } catch (e) { console.error('trip shed config', e); res.status(500).json({ error: 'Trip Shed configuration failed' }); }
  finally { conn?.release(); }
});

router.get('/dashboard', async (req, res) => {
  let conn;
  try {
    conn = await setup(req); const currentShed = await shed(conn, req.query.shed || 'VVH'); const d = date(req.query.date) || new Date().toISOString().slice(0, 10);
    const [[counts]] = await conn.execute(
      `SELECT SUM(status='draft') AS drafts, SUM(status='final') AS finalized, COUNT(*) AS total
         FROM div_trip_inspections WHERE shed_id=? AND inspection_date=?`, [currentShed.id, d]
    );
    const [[defects]] = await conn.execute(`SELECT COUNT(*) AS open_count FROM div_trip_defects WHERE shed_id=? AND status<>'CLOSED'`, [currentShed.id]);
    const [[overdue]] = await conn.execute(`SELECT COUNT(*) AS total FROM div_trip_overdue_entries WHERE shed_id=?`, [currentShed.id]);
    const [attention] = await conn.execute(
      `SELECT id,loco_number,loco_base,equipment_name,description,status,DATE_FORMAT(defect_date,'%Y-%m-%d') defect_date
         FROM div_trip_defects WHERE shed_id=? AND status<>'CLOSED' ORDER BY updated_at DESC LIMIT 8`, [currentShed.id]
    );
    const [recent] = await conn.execute(
      `SELECT i.id,i.loco_number,i.train_no,i.shift_code,i.status,t.inspection_type,DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date
         FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id
        WHERE i.shed_id=? ORDER BY i.updated_at DESC LIMIT 10`, [currentShed.id]
    );
    const [byEquipment] = await conn.execute(
      `SELECT COALESCE(equipment_name,'Unclassified') equipment, COUNT(*) total FROM div_trip_defects
       WHERE shed_id=? AND status<>'CLOSED' GROUP BY equipment_name ORDER BY total DESC LIMIT 8`, [currentShed.id]
    );
    res.json({ date: d, counts: { drafts: Number(counts.drafts || 0), finalized: Number(counts.finalized || 0), total: Number(counts.total || 0), open_defects: Number(defects.open_count || 0), overdue: Number(overdue.total || 0) }, attention, recent, byEquipment });
  } catch (e) { console.error('trip shed dashboard', e); res.status(500).json({ error: 'Dashboard failed' }); }
  finally { conn?.release(); }
});

router.get('/queue', async (req, res) => {
  try {
    const workingDate = date(req.query.date) || new Date().toISOString().slice(0, 10);
    const [rows] = await req.app.locals.pool.execute(
      `SELECT ll.train_no, ll.actual_loco_no AS loco_number, ll.base_shed AS loco_base, ll.working_date,
              ll.direction, ll.incoming_train, ll.outgoing_train
         FROM div_loco_link_log ll WHERE ll.working_date=?
           AND ll.actual_loco_no IS NOT NULL ORDER BY ll.train_no, ll.direction LIMIT 120`, [workingDate]
    );
    res.json({ rows, note: 'Suggested from Control Office only. Trip Shed never writes this source.' });
  } catch (e) { console.error('trip shed queue', e); res.json({ rows: [], note: 'Control Office queue unavailable.' }); }
});

router.get('/locos/:number', async (req, res) => {
  try {
    const locoNumber = text(req.params.number, 20) || '';
    const [[loco]] = await req.app.locals.pool.execute(
      `SELECT loco_number,loco_type,home_shed,traction_type,last_sched_type,
              DATE_FORMAT(last_sched_date,'%Y-%m-%d') last_sched_date,schedule_type,
              DATE_FORMAT(schedule_due_date,'%Y-%m-%d') schedule_due_date
         FROM div_locos WHERE loco_number=? LIMIT 1`, [locoNumber]
    );
    if (!loco) return res.status(404).json({ error: 'Loco not found in master' });
    const workingDate = date(req.query.date);
    let incoming_trains = [];
    if (workingDate) {
      const [links] = await req.app.locals.pool.execute(
        `SELECT DISTINCT incoming_train
           FROM div_loco_link_log
          WHERE working_date=? AND actual_loco_no=?
            AND incoming_train IS NOT NULL AND TRIM(incoming_train)<>''
          ORDER BY incoming_train LIMIT 5`, [workingDate, locoNumber]
      );
      incoming_trains = links.map((link) => link.incoming_train);
    }
    res.json({ loco, incoming_trains });
  } catch (e) { res.status(500).json({ error: 'Loco lookup failed' }); }
});

router.get('/staff/:query', async (req, res) => {
  const q = text(req.params.query, 80); if (!q || q.length < 3) return res.json({ staff: [] });
  try {
    const [staff] = await req.app.locals.pool.execute(
      `SELECT s.id,s.hrms_id,s.pf_number,s.name,d.designation_name FROM div_staff_master s
       LEFT JOIN designations d ON d.id=s.designation_id WHERE s.status='Active'
       AND (s.name LIKE ? OR s.hrms_id LIKE ? OR s.pf_number LIKE ?) ORDER BY s.name LIMIT 30`, [`%${q}%`, `%${q}%`, `%${q}%`]
    ); res.json({ staff });
  } catch (e) { res.status(500).json({ error: 'Staff search failed' }); }
});

router.get('/template/:id', async (req, res) => {
  let conn;
  try {
    conn = await setup(req);
    const [[template]] = await conn.execute(
      'SELECT id,inspection_type,version_no,title,entry_enabled FROM div_trip_inspection_templates WHERE id=? AND enabled=1',
      [req.params.id]
    );
    if (!template) return res.status(404).json({ error: 'Inspection template not found' });
    const [items] = await conn.execute(
      `SELECT id AS template_item_id,section_name,item_no,label_en,label_hi,standard_value,sort_order,is_required
         FROM div_trip_inspection_template_items WHERE template_id=? ORDER BY sort_order`, [template.id]
    );
    res.json({ template, items });
  } catch (e) { res.status(500).json({ error: 'Could not load inspection template' }); }
  finally { conn?.release(); }
});

router.get('/inspections', async (req, res) => {
  let conn;
  try {
    conn = await setup(req); const currentShed = await shed(conn); const where = ['i.shed_id=?']; const p = [currentShed.id];
    if (date(req.query.date)) { where.push('i.inspection_date=?'); p.push(req.query.date); }
    if (['draft','final'].includes(req.query.status)) { where.push('i.status=?'); p.push(req.query.status); }
    if (text(req.query.type, 30)) { where.push('t.inspection_type=?'); p.push(req.query.type); }
    if (text(req.query.q, 60)) { where.push('(i.loco_number LIKE ? OR i.train_no LIKE ?)'); p.push(`%${req.query.q}%`, `%${req.query.q}%`); }
    const [rows] = await conn.execute(
      `SELECT i.id,DATE_FORMAT(i.inspection_date,'%Y-%m-%d') inspection_date,i.shift_code,i.loco_number,i.loco_type,i.loco_base,i.train_no,i.status,i.technician_name,i.supervisor_name,t.inspection_type,t.title
       FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id
       WHERE ${where.join(' AND ')} ORDER BY i.inspection_date DESC,i.id DESC LIMIT 250`, p
    ); res.json({ rows });
  } catch (e) { console.error('trip inspection list', e); res.status(500).json({ error: 'Could not list inspections' }); }
  finally { conn?.release(); }
});

router.get('/inspections/:id', async (req, res) => { let conn; try { conn=await setup(req); const result=await inspectionWithResponses(conn, req.params.id); if (!result) return res.status(404).json({ error:'Inspection not found' }); res.json(result); } catch(e) { res.status(500).json({ error:'Could not load inspection' }); } finally { conn?.release(); } });

router.post('/inspections', write, async (req, res) => {
  let conn;
  try {
    conn = await setup(req); const currentShed = await shed(conn); const body = req.body || {}; const templateId = Number(body.template_id); const [[template]] = await conn.execute('SELECT * FROM div_trip_inspection_templates WHERE id=? AND enabled=1', [templateId]);
    if (!template?.entry_enabled) return res.status(400).json({ error: 'This maintenance proforma is not yet approved for data entry' });
    const inspectionDate = date(body.inspection_date); const shift = text(body.shift_code, 10); const loco = text(body.loco_number, 20);
    if (!inspectionDate || !['00/08','08/16','16/24'].includes(shift) || !loco) return res.status(400).json({ error: 'Date, shift and loco number are required' });
    const values = [templateId, inspectionDate, shift, loco, text(body.loco_type,30), text(body.loco_base,30), text(body.train_no,40), text(body.incoming_train_no,40), text(body.cab_leading,20), body.kms_reading || null, body.technician_staff_id || null, text(body.technician_name,160), body.supervisor_staff_id || null, text(body.supervisor_name,160), text(body.general_remarks), userId(req), userId(req)];
    await conn.beginTransaction(); let id = Number(body.id || 0);
    if (id) {
      const [[existing]] = await conn.execute('SELECT status FROM div_trip_inspections WHERE id=? AND shed_id=? FOR UPDATE', [id,currentShed.id]);
      if (!existing) throw new Error('Inspection not found');
      if (existing.status === 'final') {
        await conn.rollback();
        return res.status(409).json({ error:'Finalized inspection cannot be edited' });
      }
      await conn.execute(`UPDATE div_trip_inspections SET template_id=?,inspection_date=?,shift_code=?,loco_number=?,loco_type=?,loco_base=?,train_no=?,incoming_train_no=?,cab_leading=?,kms_reading=?,technician_staff_id=?,technician_name=?,supervisor_staff_id=?,supervisor_name=?,general_remarks=?,updated_by=? WHERE id=?`, [...values.slice(0,-1), id]);
    } else {
      const [result] = await conn.execute(`INSERT INTO div_trip_inspections (shed_id,template_id,inspection_date,shift_code,loco_number,loco_type,loco_base,train_no,incoming_train_no,cab_leading,kms_reading,technician_staff_id,technician_name,supervisor_staff_id,supervisor_name,general_remarks,created_by,updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [currentShed.id, ...values]); id = result.insertId;
    }
    const responses = Array.isArray(body.responses) ? body.responses : [];
    for (const r of responses) {
      const itemId=Number(r.template_item_id); if (!itemId) continue; const outcome=validOutcome.has(r.outcome) ? r.outcome : 'NOT_CHECKED';
      await conn.execute(`INSERT INTO div_trip_inspection_responses (inspection_id,template_item_id,outcome,observed_value,remarks,defect_id) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE outcome=VALUES(outcome),observed_value=VALUES(observed_value),remarks=VALUES(remarks),defect_id=VALUES(defect_id)`, [id,itemId,outcome,text(r.observed_value),text(r.remarks),r.defect_id || null]);
    }
    await conn.commit(); res.json({ id, message:'Inspection saved as draft' });
  } catch (e) { await conn?.rollback(); console.error('trip inspection save', e); res.status(500).json({ error: e.message || 'Inspection save failed' }); } finally { conn?.release(); }
});

router.post('/inspections/:id/finalize', write, supervisor, async (req,res) => { let conn; try { conn=await setup(req); const [[i]]=await conn.execute('SELECT status FROM div_trip_inspections WHERE id=? FOR UPDATE',[req.params.id]); if(!i) return res.status(404).json({error:'Inspection not found'}); if(i.status==='final') return res.json({message:'Already finalized'}); const [[missing]]=await conn.execute(`SELECT COUNT(*) n FROM div_trip_inspection_template_items ti LEFT JOIN div_trip_inspection_responses r ON r.template_item_id=ti.id AND r.inspection_id=? WHERE ti.template_id=(SELECT template_id FROM div_trip_inspections WHERE id=?) AND ti.is_required=1 AND (r.id IS NULL OR r.outcome='NOT_CHECKED')`,[req.params.id,req.params.id]); if(missing.n) return res.status(400).json({error:`${missing.n} required checklist item(s) still need an outcome`}); await conn.execute(`UPDATE div_trip_inspections SET status='final',finalized_by=?,finalized_at=NOW(),updated_by=? WHERE id=?`,[userId(req),userId(req),req.params.id]); res.json({message:'Inspection finalized'}); } catch(e){console.error('finalize trip inspection',e);res.status(500).json({error:'Could not finalize inspection'});} finally{conn?.release();} });

router.post('/inspections/:id/reopen', write, supervisor, async (req,res) => { const reason=text(req.body?.reason); if(!reason) return res.status(400).json({error:'Reopen reason is required'}); try { const [r]=await req.app.locals.pool.execute(`UPDATE div_trip_inspections SET status='draft',reopened_by=?,reopened_at=NOW(),reopen_reason=?,updated_by=? WHERE id=? AND status='final'`,[userId(req),reason,userId(req),req.params.id]); if(!r.affectedRows) return res.status(404).json({error:'Finalized inspection not found'});res.json({message:'Inspection reopened'}); } catch(e){res.status(500).json({error:'Could not reopen inspection'});} });

router.get('/defects', async (req,res) => { let conn; try { conn=await setup(req); const currentShed=await shed(conn); const p=[currentShed.id]; let where='d.shed_id=?'; if(validStatus.has(req.query.status)) {where+=' AND d.status=?';p.push(req.query.status);} if(text(req.query.q,60)){where+=' AND (d.loco_number LIKE ? OR d.equipment_name LIKE ? OR d.description LIKE ?)';p.push(`%${req.query.q}%`,`%${req.query.q}%`,`%${req.query.q}%`);} const [rows]=await conn.execute(`SELECT d.*,DATE_FORMAT(d.defect_date,'%Y-%m-%d') defect_date,DATE_FORMAT(d.outgoing_date,'%Y-%m-%d') outgoing_date FROM div_trip_defects d WHERE ${where} ORDER BY d.updated_at DESC LIMIT 250`,p);res.json({rows}); }catch(e){res.status(500).json({error:'Could not list defects'});}finally{conn?.release();} });

router.post('/defects', write, async (req,res) => { let conn; try { conn=await setup(req);const currentShed=await shed(conn);const b=req.body||{};const d=date(b.defect_date);const loco=text(b.loco_number,20);if(!d||!loco||!text(b.description))return res.status(400).json({error:'Date, loco number and defect description are required'});const category=['ELECTRICAL','MECHANICAL','SAFETY','OTHER'].includes(b.defect_category)?b.defect_category:'OTHER';const status=defectStatus(b.status)||'OPEN';const [r]=await conn.execute(`INSERT INTO div_trip_defects (shed_id,inspection_id,defect_date,loco_number,loco_base,incoming_train_no,equipment_name,defect_category,description,action_taken,responsible_party,outgoing_date,outgoing_train_no,remarks,status,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[currentShed.id,b.inspection_id||null,d,loco,text(b.loco_base,30),text(b.incoming_train_no,40),text(b.equipment_name,120),category,text(b.description),text(b.action_taken),text(b.responsible_party,160),date(b.outgoing_date),text(b.outgoing_train_no,40),text(b.remarks),status,userId(req),userId(req)]);await conn.execute(`INSERT INTO div_trip_defect_events(defect_id,event_type,event_note,status_after,created_by) VALUES(?,?,?,?,?)`,[r.insertId,'CREATED',text(b.description),status,userId(req)]);res.json({id:r.insertId,message:'Defect recorded'});}catch(e){console.error('trip defect',e);res.status(500).json({error:'Could not save defect'});}finally{conn?.release();} });

router.patch('/defects/:id', write, async (req,res) => { const b=req.body||{};const status=defectStatus(b.status);if(!status)return res.status(400).json({error:'Valid defect status is required'});let conn;try{conn=await setup(req);const [[old]]=await conn.execute('SELECT id,status FROM div_trip_defects WHERE id=?',[req.params.id]);if(!old)return res.status(404).json({error:'Defect not found'});if(status==='CLOSED'&&!text(b.action_taken))return res.status(400).json({error:'Action taken is required to close a defect'});await conn.execute(`UPDATE div_trip_defects SET status=?,action_taken=COALESCE(?,action_taken),responsible_party=COALESCE(?,responsible_party),outgoing_date=COALESCE(?,outgoing_date),outgoing_train_no=COALESCE(?,outgoing_train_no),remarks=COALESCE(?,remarks),updated_by=?,closed_by=IF(?='CLOSED',?,closed_by),closed_at=IF(?='CLOSED',NOW(),closed_at) WHERE id=?`,[status,text(b.action_taken),text(b.responsible_party,160),date(b.outgoing_date),text(b.outgoing_train_no,40),text(b.remarks),userId(req),status,userId(req),status,req.params.id]);await conn.execute(`INSERT INTO div_trip_defect_events(defect_id,event_type,event_note,status_after,created_by) VALUES(?,?,?,?,?)`,[req.params.id,status==='CLOSED'?'CLOSED':'STATUS_CHANGE',text(b.event_note)||text(b.action_taken),status,userId(req)]);res.json({message:'Defect updated'});}catch(e){res.status(500).json({error:'Could not update defect'});}finally{conn?.release();} });

router.get('/overdue', async (req,res) => { let conn;try{conn=await setup(req);const s=await shed(conn);const [rows]=await conn.execute(`SELECT *,DATE_FORMAT(entry_date,'%Y-%m-%d') entry_date,DATE_FORMAT(last_inspection_date,'%Y-%m-%d') last_inspection_date FROM div_trip_overdue_entries WHERE shed_id=? ORDER BY entry_date DESC,id DESC LIMIT 300`,[s.id]);res.json({rows});}catch(e){res.status(500).json({error:'Could not load overdue register'});}finally{conn?.release();} });

router.post('/overdue', write, async (req,res) => { let conn; try { conn=await setup(req); const s=await shed(conn); const b=req.body||{}; const entryDate=date(b.entry_date), locoNumber=text(b.loco_number,20); if(!entryDate||!locoNumber)return res.status(400).json({error:'Date and loco number are required'}); const [r]=await conn.execute(`INSERT INTO div_trip_overdue_entries(shed_id,entry_date,loco_number,loco_base,incoming_train_no,kms,last_inspection_date,last_inspection_type,outgoing_train_no,last_shed,remarks) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,[s.id,entryDate,locoNumber,text(b.loco_base,30),text(b.incoming_train_no,40),b.kms===''||b.kms==null?null:Number(b.kms),date(b.last_inspection_date),text(b.last_inspection_type,30),text(b.outgoing_train_no,40),text(b.last_shed,60),text(b.remarks)]); res.json({id:r.insertId,message:'TI overdue record saved'}); } catch(e) { console.error('trip overdue create',e);res.status(500).json({error:'Could not save TI overdue record'});} finally {conn?.release();} });

router.patch('/overdue/:id', write, async (req,res) => { let conn; try { conn=await setup(req); const s=await shed(conn),b=req.body||{}; const entryDate=date(b.entry_date),locoNumber=text(b.loco_number,20);if(!entryDate||!locoNumber)return res.status(400).json({error:'Date and loco number are required'}); const [r]=await conn.execute(`UPDATE div_trip_overdue_entries SET entry_date=?,loco_number=?,loco_base=?,incoming_train_no=?,kms=?,last_inspection_date=?,last_inspection_type=?,outgoing_train_no=?,last_shed=?,remarks=? WHERE id=? AND shed_id=?`,[entryDate,locoNumber,text(b.loco_base,30),text(b.incoming_train_no,40),b.kms===''||b.kms==null?null:Number(b.kms),date(b.last_inspection_date),text(b.last_inspection_type,30),text(b.outgoing_train_no,40),text(b.last_shed,60),text(b.remarks),req.params.id,s.id]);if(!r.affectedRows)return res.status(404).json({error:'TI overdue record not found'});res.json({message:'TI overdue record updated'});}catch(e){console.error('trip overdue update',e);res.status(500).json({error:'Could not update TI overdue record'});}finally{conn?.release();} });

router.post('/imports', write, supervisor, upload.single('file'), async (req,res) => { if(!req.file)return res.status(400).json({error:'Spreadsheet file is required'});let conn;try{conn=await setup(req);const s=await shed(conn);const kind=['MCDO','OVERDUE','REPAIR_ATTENTION'].includes(req.body?.import_kind)?req.body.import_kind:null;if(!kind)return res.status(400).json({error:'Select an import type'});const sha=crypto.createHash('sha256').update(req.file.buffer).digest('hex');const book=XLSX.read(req.file.buffer,{type:'buffer',cellDates:true});const [batch]=await conn.execute(`INSERT INTO div_trip_import_batches(shed_id,import_kind,source_filename,source_sha256,uploaded_by) VALUES(?,?,?,?,?)`,[s.id,kind,req.file.originalname,sha,userId(req)]);let total=0,valid=0,invalid=0;for(const sheetName of book.SheetNames){const rows=XLSX.utils.sheet_to_json(book.Sheets[sheetName],{header:1,defval:null,raw:false});let inherited={date:null,loco:null,base:null,train:null};for(let idx=0;idx<rows.length;idx++){const row=rows[idx];if(!row.some(v=>text(v)))continue;const norm=normalizeImport(kind,row,inherited);if(norm.date)inherited.date=norm.date;if(norm.loco_number)inherited.loco=norm.loco_number;if(norm.loco_base)inherited.base=norm.loco_base;if(norm.incoming_train_no)inherited.train=norm.incoming_train_no;const errors=[];if(idx<2||!norm.loco_number)errors.push('No usable loco number');if(kind!=='MCDO'&&!norm.date)errors.push('No usable date');const state=errors.length?'INVALID':'READY';total++;if(errors.length)invalid++;else valid++;await conn.execute(`INSERT INTO div_trip_import_staging_rows(batch_id,source_sheet,source_row_no,raw_json,normalized_json,validation_errors,status) VALUES(?,?,?,?,?,?,?)`,[batch.insertId,sheetName,idx+1,JSON.stringify(row),JSON.stringify(norm),JSON.stringify(errors),state]);}}
    await conn.execute(`UPDATE div_trip_import_batches SET total_rows=?,valid_rows=?,invalid_rows=? WHERE id=?`,[total,valid,invalid,batch.insertId]);res.json({id:batch.insertId,total_rows:total,valid_rows:valid,invalid_rows:invalid,message:'Rows staged for supervisor review'});
  }catch(e){console.error('trip import',e);res.status(500).json({error:'Could not stage import'});}finally{conn?.release();} });

function normalizeImport(kind,row,old){const v=(i)=>text(row[i],255);const dateCell=(value)=>{const s=String(value||'').trim();if(/^\d{4}-\d\d-\d\d/.test(s))return s.slice(0,10);const m=/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/.exec(s);return m?`${m[3].length===2?'20'+m[3]:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:null;};if(kind==='OVERDUE')return{date:dateCell(v(1))||old.date,loco_number:v(2)||old.loco,loco_base:v(3)||old.base,incoming_train_no:v(4)||old.train,kms:v(5),last_inspection_date:dateCell(v(6)),last_inspection_type:v(7),outgoing_train_no:v(8),last_shed:v(9),remarks:v(10)};if(kind==='REPAIR_ATTENTION')return{date:dateCell(v(1))||old.date,loco_number:v(2)||old.loco,loco_base:v(3)||old.base,incoming_train_no:v(4)||old.train,description:v(5),defect_category:v(6),equipment_name:v(7),outgoing_date:dateCell(v(8)),outgoing_train_no:v(9),remarks:v(10)};return{date:dateCell(v(0))||old.date,loco_number:v(2)||old.loco,loco_base:v(3)||old.base,incoming_train_no:v(4)||old.train,description:v(5),action_taken:v(6),equipment_name:v(7)};}

router.get('/imports', supervisor, async (req,res)=>{try{const [rows]=await req.app.locals.pool.execute(`SELECT b.*,s.shed_code FROM div_trip_import_batches b JOIN div_trip_sheds s ON s.id=b.shed_id ORDER BY b.id DESC LIMIT 100`);res.json({rows});}catch(e){res.status(500).json({error:'Could not list imports'});}});
router.get('/imports/:id/rows', supervisor, async (req,res)=>{try{const [rows]=await req.app.locals.pool.execute(`SELECT * FROM div_trip_import_staging_rows WHERE batch_id=? ORDER BY source_sheet,source_row_no LIMIT 1000`,[req.params.id]);res.json({rows});}catch(e){res.status(500).json({error:'Could not load staged rows'});}});
router.post('/imports/:id/review', write, supervisor, async (req,res)=>{const decision=req.body?.decision;if(!['APPROVE','REJECT'].includes(decision))return res.status(400).json({error:'Decision required'});let conn;try{conn=await setup(req);const [[b]]=await conn.execute('SELECT * FROM div_trip_import_batches WHERE id=? FOR UPDATE',[req.params.id]);if(!b)return res.status(404).json({error:'Import batch not found'});if(b.status!=='STAGED')return res.status(409).json({error:'Batch already reviewed'});await conn.beginTransaction();if(decision==='APPROVE'){const [rows]=await conn.execute(`SELECT * FROM div_trip_import_staging_rows WHERE batch_id=? AND status='READY'`,[b.id]);for(const r of rows){const n=typeof r.normalized_json==='string'?JSON.parse(r.normalized_json):r.normalized_json;if(b.import_kind==='OVERDUE'){const [x]=await conn.execute(`INSERT INTO div_trip_overdue_entries(shed_id,entry_date,loco_number,loco_base,incoming_train_no,kms,last_inspection_date,last_inspection_type,outgoing_train_no,last_shed,remarks,source_batch_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,[b.shed_id,n.date,n.loco_number,n.loco_base,n.incoming_train_no,n.kms||null,n.last_inspection_date,n.last_inspection_type,n.outgoing_train_no,n.last_shed,n.remarks,b.id]);await conn.execute(`UPDATE div_trip_import_staging_rows SET status='APPROVED',published_record_id=? WHERE id=?`,[x.insertId,r.id]);}else{const [x]=await conn.execute(`INSERT INTO div_trip_defects(shed_id,defect_date,loco_number,loco_base,incoming_train_no,equipment_name,defect_category,description,action_taken,remarks,status,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,[b.shed_id,n.date,n.loco_number,n.loco_base,n.incoming_train_no,n.equipment_name,['ELECTRICAL','MECHANICAL','SAFETY'].includes(n.defect_category)?n.defect_category:'OTHER',n.description,n.action_taken,n.remarks,'CLOSED',userId(req),userId(req)]);await conn.execute(`UPDATE div_trip_import_staging_rows SET status='APPROVED',published_record_id=? WHERE id=?`,[x.insertId,r.id]);}}}else await conn.execute(`UPDATE div_trip_import_staging_rows SET status='REJECTED' WHERE batch_id=? AND status='READY'`,[b.id]);await conn.execute(`UPDATE div_trip_import_batches SET status=?,reviewed_by=?,reviewed_at=NOW(),review_note=? WHERE id=?`,[decision==='APPROVE'?'APPROVED':'REJECTED',userId(req),text(req.body?.note),b.id]);await conn.commit();res.json({message:decision==='APPROVE'?'Import published':'Import rejected'});}catch(e){await conn?.rollback();console.error('trip import review',e);res.status(500).json({error:'Could not review import'});}finally{conn?.release();}});

router.get('/exports/:kind.csv', async (req,res)=>{try{const kind=req.params.kind;if(kind==='inspections'){const [r]=await req.app.locals.pool.execute(`SELECT DATE_FORMAT(i.inspection_date,'%Y-%m-%d'),i.shift_code,t.inspection_type,i.loco_number,i.loco_base,i.train_no,i.status,i.technician_name,i.supervisor_name FROM div_trip_inspections i JOIN div_trip_inspection_templates t ON t.id=i.template_id ORDER BY i.inspection_date DESC LIMIT 5000`);return csv(res,'trip-shed-inspections.csv',['Date','Shift','Type','Loco','Base','Train','Status','Technician','Supervisor'],r);}const [r]=await req.app.locals.pool.execute(`SELECT DATE_FORMAT(defect_date,'%Y-%m-%d'),loco_number,loco_base,equipment_name,defect_category,description,action_taken,status,outgoing_train_no FROM div_trip_defects ORDER BY defect_date DESC LIMIT 5000`);csv(res,'trip-shed-defects.csv',['Date','Loco','Base','Equipment','Category','Description','Action','Status','Outgoing train'],r);}catch(e){res.status(500).json({error:'Export failed'});}});

router.get('/inspections/:id/print', async (req,res)=>{let conn;try{conn=await setup(req);const result=await inspectionWithResponses(conn,req.params.id);if(!result)return res.status(404).send('Inspection not found');const {inspection,items}=result;if(inspection.status!=='final')return res.status(409).send('Finalize the inspection before printing the official form.');const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));res.type('html').send(`<!doctype html><title>${esc(inspection.title)} ${esc(inspection.loco_number)}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#111}.bar{position:sticky;top:0;background:#152238;color:#fff;padding:10px}.bar button{float:right;padding:6px 12px}h1{text-align:center;font-size:17px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #555;padding:5px;vertical-align:top}th{background:#e8eef6}@media print{.bar{display:none}}</style><div class="bar">CRTMS Trip Shed — Final inspection <button onclick="print()">Print / Save PDF</button></div><h1>${esc(inspection.title)}</h1><p><b>Loco:</b> ${esc(inspection.loco_number)} &nbsp; <b>Base:</b> ${esc(inspection.loco_base)} &nbsp; <b>Train:</b> ${esc(inspection.train_no)}<br><b>Date / shift:</b> ${esc(inspection.inspection_date)} / ${esc(inspection.shift_code)}<br><b>Technician:</b> ${esc(inspection.technician_name)} &nbsp; <b>Supervisor:</b> ${esc(inspection.supervisor_name)}</p><table><tr><th>Section</th><th>Item</th><th>Check</th><th>Standard</th><th>Outcome</th><th>Reading / remarks</th></tr>${items.map(x=>`<tr><td>${esc(x.section_name)}</td><td>${esc(x.item_no)}</td><td>${esc(x.label_en)}</td><td>${esc(x.standard_value)}</td><td>${esc(x.outcome)}</td><td>${esc(x.observed_value||x.remarks)}</td></tr>`).join('')}</table><p><b>General remarks:</b> ${esc(inspection.general_remarks)}<br><b>Finalized:</b> ${esc(inspection.finalized_at)}</p>`);}catch(e){res.status(500).send('Could not render inspection');}finally{conn?.release();}});

module.exports = router;
