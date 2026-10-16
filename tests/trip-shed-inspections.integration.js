// Run: node tests/trip-shed-inspections.integration.js [--serve]
// Uses connection-local TEMPORARY tables only; never writes operational tables.
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

(async () => {
  const conn = await mysql.createConnection({ host:process.env.DB_HOST, user:process.env.DB_USER, password:process.env.DB_PASSWORD, database:process.env.DB_NAME, port:Number(process.env.DB_PORT || 3306) });
  let server;
  try {
    const tables = ['div_trip_sheds','div_trip_inspection_templates','div_trip_inspection_template_items','div_trip_inspections','div_trip_inspection_responses','div_trip_defects','div_trip_defect_events','div_trip_overdue_entries','div_trip_import_batches','div_trip_import_staging_rows'];
    for (const table of tables) {
      const [[definition]] = await conn.query('SHOW CREATE TABLE ' + table);
      const ddl = definition['Create Table'].replace(/^CREATE TABLE /, 'CREATE TEMPORARY TABLE ')
        .split('\n').filter(line => !line.trim().startsWith('CONSTRAINT ')).join('\n')
        .replace(/,\n\) ENGINE/, '\n) ENGINE').replace(/AUTO_INCREMENT=\d+ /, '');
      assert.ok(ddl.startsWith('CREATE TEMPORARY TABLE '));
      await conn.query(ddl);
    }
    await conn.query("CREATE TEMPORARY TABLE div_trip_shed_staff (id INT AUTO_INCREMENT PRIMARY KEY,shed_id INT NOT NULL,staff_name VARCHAR(160) NOT NULL,pf_number VARCHAR(20),mobile_number VARCHAR(20),designation VARCHAR(60),hrms_id VARCHAR(20) NOT NULL,email VARCHAR(160),vvh_posting_year SMALLINT,is_active TINYINT(1) NOT NULL DEFAULT 1,source_file VARCHAR(255) NOT NULL DEFAULT 'test',source_sheet VARCHAR(120) NOT NULL DEFAULT 'test')");
    await conn.query("INSERT INTO div_trip_sheds(id,shed_code,shed_name,is_active) VALUES(1,'VVH','Temporary test shed',1),(2,'OTHER','Other test shed',1),(3,'CSMT','Temporary CSMT shed',1)");
    await conn.query("INSERT INTO div_trip_shed_staff(shed_id,staff_name,pf_number,designation,hrms_id) VALUES (1,'Test Technician','PF-T-1','M/F I','HR-T-001'),(1,'Test Supervisor','PF-S-1','SSE','HR-S-001')");
    await conn.query("CREATE TEMPORARY TABLE div_trip_shed_users (user_id INT NOT NULL,shed_id INT NOT NULL,is_active TINYINT(1) NOT NULL DEFAULT 1,PRIMARY KEY(user_id,shed_id))");
    await conn.query("INSERT INTO div_trip_shed_users(user_id,shed_id) VALUES(990001,1)");
    await conn.query("INSERT INTO div_trip_inspection_templates(id,inspection_type,version_no,title,enabled,entry_enabled) VALUES(1,'GC','TEST','Test GC',1,1),(2,'TI_CONVENTIONAL','TEST','Test conventional',1,1),(3,'IA','TEST','Disabled test template',1,0),(4,'IB','TEST','Empty test template',1,0),(5,'IC','TEST','Inactive test template',1,0)");
    await conn.query("INSERT INTO div_trip_inspection_template_items(id,template_id,item_no,label_en,sort_order,is_required) VALUES(1,1,'1','Test required check',1,1),(2,1,'2','Test optional check',2,0),(3,2,'1','Other template check',1,1)");
    let failResponse = false;
    const wrapper = {
      execute: async (sql, args) => {
        if (failResponse && sql.startsWith('INSERT INTO div_trip_inspection_responses')) { failResponse = false; throw Error('Injected response write failure'); }
        return conn.execute(sql,args);
      },
      beginTransaction: () => conn.beginTransaction(), commit: () => conn.commit(), rollback: () => conn.rollback(), release: () => {}
    };
    const app = express();
    app.use(express.json());
    app.locals.pool = {...wrapper, getConnection:async () => wrapper};
    app.use((req,res,next) => {
      const role = req.get('x-test-role') || /test_role=([^;]+)/.exec(req.headers.cookie || '')?.[1] || 'division_admin';
      req.session = role === 'anonymous' ? {} : {user:{id:990001,realm:role==='wrong_realm'?'suburban':'division',div_role:role}};
      next();
    });
    app.get('/test/:role', (req,res) => {
      if (!['division_admin','trip_shed_operator','trip_shed_supervisor','ctlc_view'].includes(req.params.role)) return res.sendStatus(400);
      res.cookie('test_role',req.params.role,{httpOnly:true,sameSite:'strict'});
      res.redirect('/div/trip-shed-inspection.html');
    });
    app.use('/api/division/trip-shed',require('../routes/division/tripShedRoutes'));
    app.use(express.static(path.join(__dirname,'../public')));
    server = await new Promise(resolve => { const s=app.listen(process.argv.includes('--serve')?3001:0,'127.0.0.1',()=>resolve(s)); });
    const base = `http://127.0.0.1:${server.address().port}/api/division/trip-shed`;
    let passed = 0;
    async function call(method, route, body, expected, role='division_admin') {
      const r = await fetch(base+route,{method,headers:{'content-type':'application/json','x-test-role':role},...(body===undefined?{}:{body:JSON.stringify(body)})});
      const data = await r.json(); assert.equal(r.status,expected,`${method} ${route}: ${JSON.stringify(data)}`); passed++; return data;
    }
    const draft = {template_id:1,inspection_date:'2026-09-16',shift_code:'08/16',loco_number:'TEST-ONLY',responses:[{template_item_id:1,outcome:'NOT_CHECKED'}]};
    const tiDraft = {template_id:2,inspection_date:'2026-09-16',shift_code:'08/16',loco_number:'TI-ONLY',traction_converter_make:'ABB',auxiliary_converter_make:'Medha',brake_system_make:'Knorr',hlc_make:'HLC-A',spm_make:'Laxven',energy_consumed_kwh:'1234.50',rtis_status:'WORKING',rtis_remarks:'Signal available',responses:[{template_item_id:3,outcome:'OK'}]};
    for (const role of ['ctlc_view','ssehq','anonymous','wrong_realm']) await call('POST','/inspections',draft,403,role);
    for (const extra of [{template_id:3},{template_id:4},{template_id:5},{inspection_date:'2026-02-30'},{shift_code:'bad'},{id:'bad'},{kms_reading:'bad'},{energy_consumed_kwh:'bad'},{rtis_status:'BROKEN'},{responses:[{template_item_id:3,outcome:'OK'}]},{responses:[{template_item_id:1,outcome:'BAD'}]},{responses:[{template_item_id:1,outcome:'OK'},{template_item_id:1,outcome:'OK'}]}]) await call('POST','/inspections',{...draft,...extra},400);
    const {id} = await call('POST','/inspections',draft,200,'trip_shed_operator');
    const staff = await call('GET','/staff-search?q=Test&role=technician',undefined,200); assert.equal(staff.rows.length,1); assert.equal(staff.rows[0].hrms_id,'HR-T-001');
    const supervisors = await call('GET','/staff-search?q=Test&role=supervisor',undefined,200); assert.equal(supervisors.rows.length,1); assert.equal(supervisors.rows[0].hrms_id,'HR-S-001');
    const staffRegister = await call('GET','/staff?q=Test',undefined,200); assert.equal(staffRegister.rows.length,2); assert.equal(staffRegister.counts.find(x=>x.designation==='SSE').count,1);
    const added = await call('POST','/staff',{staff_name:'Added Staff',hrms_id:'HR-A-001',pf_number:'PF-A-1',mobile_number:'9876543210',designation:'ALS'},201,'trip_shed_operator'); assert.ok(added.id);
    const addedSearch = await call('GET','/staff?q=9876543210',undefined,200); assert.equal(addedSearch.rows[0].hrms_id,'HR-A-001');
    await call('PATCH',`/staff/${added.id}`,{staff_name:'Edited Staff',hrms_id:'HR-A-001',pf_number:'PF-A-1',mobile_number:'9876543211',designation:'JE'},200,'trip_shed_operator');
    const editedSearch = await call('GET','/staff?q=Edited',undefined,200); assert.equal(editedSearch.rows[0].designation,'JE');
    const selectedStaff = {...draft, technician_name:'Test Technician', supervisor_name:'Test Supervisor', technician_hrms_id:'HR-T-001', supervisor_hrms_id:'HR-S-001'};
    const selected = await call('POST','/inspections',selectedStaff,200,'trip_shed_operator');
    const selectedLoaded = await call('GET',`/inspections/${selected.id}`,undefined,200); assert.equal(selectedLoaded.inspection.technician_hrms_id,'HR-T-001'); assert.equal(selectedLoaded.inspection.supervisor_hrms_id,'HR-S-001');
    const loaded = await call('GET','/inspections/'+id,undefined,200);
    assert.equal(loaded.inspection.inspection_date,'2026-09-16');
    const ti = await call('POST','/inspections',tiDraft,200,'trip_shed_operator');
    const loadedTi = await call('GET','/inspections/'+ti.id,undefined,200);
    assert.equal(loadedTi.inspection.traction_converter_make,'ABB');
    assert.equal(loadedTi.inspection.auxiliary_converter_make,'Medha');
    assert.equal(loadedTi.inspection.brake_system_make,'Knorr');
    assert.equal(loadedTi.inspection.hlc_make,'HLC-A');
    assert.equal(loadedTi.inspection.spm_make,'Laxven');
    assert.equal(String(loadedTi.inspection.energy_consumed_kwh),'1234.50');
    assert.equal(loadedTi.inspection.rtis_status,'WORKING');
    assert.equal(loadedTi.inspection.rtis_remarks,'Signal available');
    await call('POST',`/inspections/${id}/finalize`,{},403,'trip_shed_operator');
    await call('POST',`/inspections/${id}/finalize`,{},400);
    await call('POST','/inspections',{...draft,id,template_id:2,responses:[]},400);
    await call('POST','/inspections',{...draft,id:99999},404);
    await conn.query("INSERT INTO div_trip_inspections(id,shed_id,template_id,inspection_date,shift_code,loco_number) VALUES(998,3,1,'2026-09-16','00/08','CSMT-ONLY'),(999,2,1,'2026-09-16','00/08','OTHER')");
    await call('GET','/inspections/999',undefined,404);
    const csmtConfig = await call('GET','/config?shed_code=CSMT',undefined,200,'division_admin'); assert.equal(csmtConfig.shed.shed_code,'CSMT');
    await call('GET','/config?shed_code=CSMT',undefined,403,'trip_shed_operator');
    const csmtRows = await call('GET','/inspections?shed_code=CSMT',undefined,200,'division_admin'); assert.equal(csmtRows.rows.length,1); assert.equal(csmtRows.rows[0].loco_number,'CSMT-ONLY');
    const vvRows = await call('GET','/inspections?shed_code=VVH',undefined,200,'division_admin'); assert.ok(vvRows.rows.every(row => row.loco_number !== 'CSMT-ONLY'));
    await call('POST','/inspections',{...draft,id:999},404);
    await call('POST','/inspections/999/finalize',{},404);
    const snapshot = async () => {const [a]=await conn.query('SELECT * FROM div_trip_inspections ORDER BY id');const [b]=await conn.query('SELECT * FROM div_trip_inspection_responses ORDER BY id');return JSON.stringify([a,b]);};
    let before = await snapshot(); failResponse = true;
    await call('POST','/inspections',{...draft,id,general_remarks:'Must roll back',responses:[{template_item_id:1,outcome:'OK'}]},500);
    assert.equal(await snapshot(),before,'Failed response write must roll back header changes');
    failResponse = true;
    await call('POST','/inspections',draft,500);
    assert.equal(await snapshot(),before,'Failed new save must not leave orphan header');
    await call('POST','/inspections',{...draft,id,responses:[{template_item_id:1,outcome:'ATTENTION'}]},200);
    await call('POST',`/inspections/${id}/finalize`,{},200,'trip_shed_supervisor');
    const printable = await call('GET',`/inspections/${id}/print`,undefined,200);
    assert.equal(printable.inspection.status,'final');
    assert.equal(printable.items.length,2);
    await call('GET',`/inspections/${ti.id}/print`,undefined,409);
    before = await snapshot();
    await call('POST','/inspections',{...draft,id,responses:[{template_item_id:1,outcome:'OK',observed_value:'Must not persist'}]},409);
    await call('POST',`/inspections/${id}/finalize`,{},409);
    assert.equal(await snapshot(),before,'Final record, responses and audit fields must remain unchanged');
    const reader = await call('GET','/config',undefined,200,'ctlc_view'); assert.equal(reader.user.read_only,true); assert.equal(reader.user.can_finalize,false); assert.deepEqual(reader.deferred_modules,['Wheel profile','Temperature','Materials','Roster','Awards / warnings']);
    const gatedTypes = reader.templates.filter(t => ['IA','IB','IC'].includes(t.inspection_type)); assert.equal(gatedTypes.length,0); assert.deepEqual(reader.out_of_scope_modules,['IA — Periodic Maintenance','IB — Periodic Maintenance','IC — Periodic Maintenance']);
    const operator = await call('GET','/config',undefined,200,'trip_shed_operator'); assert.equal(operator.user.read_only,false); assert.equal(operator.user.can_finalize,false);
    const operatorSheds = await call('GET','/config',undefined,200,'trip_shed_operator'); assert.equal(operatorSheds.sheds.length,1); assert.equal(operatorSheds.sheds[0].shed_code,'VVH');
    await call('GET','/config?shed_code=OTHER',undefined,403,'trip_shed_operator'); const adminOther = await call('GET','/config?shed_code=OTHER',undefined,200,'division_admin'); assert.equal(adminOther.shed.shed_code,'OTHER');
    const defect = await call('POST','/defects',{defect_date:'2026-09-16',loco_number:'DEFECT-1',description:'Brake issue'},200,'trip_shed_operator');
    const defectList = await call('GET','/defects?status=OPEN',undefined,200); assert.equal(defectList.rows.length,1); assert.equal(defectList.rows[0].event_count,1);
    const defectEvents = await call('GET',`/defects/${defect.id}/events`,undefined,200); assert.equal(defectEvents.events.length,1); assert.equal(defectEvents.events[0].status_after,'OPEN');
    await call('POST',`/defects/${defect.id}/lifecycle`,{status:'CLOSED'},400,'trip_shed_operator');
    await call('POST',`/defects/${defect.id}/lifecycle`,{status:'UNDER_ATTENTION',event_note:'Assigned to shed technician'},200,'trip_shed_operator');
    await call('POST',`/defects/${defect.id}/lifecycle`,{status:'CLOSED',action_taken:'Brake cylinder inspected and repaired',event_note:'Released after test'},200,'trip_shed_supervisor');
    const closed = await call('GET',`/defects/${defect.id}/events`,undefined,200); assert.equal(closed.defect.status,'CLOSED'); assert.equal(closed.events.length,3);
    await call('POST',`/defects/${defect.id}/lifecycle`,{status:'OPEN'},409,'trip_shed_supervisor');
    const overdue = await call('POST','/overdue',{entry_date:'2026-09-16',loco_number:'OVD-1',loco_base:'VVH',kms:'12.50',remarks:'Awaiting TI'},200,'trip_shed_operator');
    const filteredInspections = await call('GET','/inspections?status=final&from=2026-09-01&to=2026-09-30&loco=TEST-ONLY',undefined,200); assert.equal(filteredInspections.rows.length,1); assert.equal(filteredInspections.rows[0].status,'final');
    const filteredDefects = await call('GET','/defects?status=CLOSED&loco=DEFECT-1',undefined,200); assert.equal(filteredDefects.rows.length,1); assert.equal(filteredDefects.rows[0].status,'CLOSED');
    const filteredOverdue = await call('GET','/overdue?from=2026-09-01&to=2026-09-30&loco=OVD-1',undefined,200); assert.equal(filteredOverdue.rows.length,1); assert.equal(filteredOverdue.rows[0].loco_number,'OVD-1');
    await call('GET','/inspections?shift=bad',undefined,400); await call('GET','/defects?from=bad',undefined,400); await call('GET','/overdue?to=bad',undefined,400);
    const overdueLoaded = await call('GET',`/overdue/${overdue.id}`,undefined,200); assert.equal(overdueLoaded.row.loco_number,'OVD-1');
    await call('PATCH',`/overdue/${overdue.id}`,{entry_date:'2026-09-17',loco_number:'OVD-2',loco_base:'VVH',kms:'15.25',remarks:'Updated factual row'},200,'trip_shed_operator');
    const overdueEdited = await call('GET',`/overdue/${overdue.id}`,undefined,200); assert.equal(overdueEdited.row.loco_number,'OVD-2'); assert.equal(String(overdueEdited.row.kms),'15.25');
    await call('PATCH',`/overdue/${overdue.id}`,{entry_date:'bad',loco_number:'OVD-3'},400,'trip_shed_operator');
    await call('PATCH',`/overdue/${overdue.id}`,{entry_date:'2026-09-17',loco_number:'OVD-3'},403,'ctlc_view');
    const XLSX = require('xlsx');
    async function exportCheck(kind, format, expected) { const r=await fetch(base+`/export/${kind}?format=${format}&from=2026-09-01&to=2026-09-30`,{headers:{'x-test-role':'ctlc_view'}}); assert.equal(r.status,200,`${kind}/${format} export status`); assert.match(r.headers.get('content-disposition')||'',new RegExp(`trip_shed_${kind==='overdue'?'ti_overdue':kind}\\.${format}`)); const bytes=Buffer.from(await r.arrayBuffer()); assert.ok(bytes.length>20); if(format==='csv') assert.match(bytes.toString('utf8'),new RegExp(expected)); else { const wb=XLSX.read(bytes,{type:'buffer'}); const data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''}); assert.ok(data.some(row=>Object.values(row).some(v=>String(v).includes(expected)))); } }
    await exportCheck('inspections','csv','TEST-ONLY'); await exportCheck('inspections','xlsx','TEST-ONLY'); await exportCheck('defects','csv','DEFECT-1'); await exportCheck('overdue','xlsx','OVD-2');
    await call('GET','/export/bad?format=csv',undefined,400,'ctlc_view'); await call('GET','/export/inspections?format=pdf',undefined,400,'ctlc_view');
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['DATE','LOCO NO','REMARK'],['16/09/2026','IMP-1','ready'],['','IMP-1','continuation duplicate']]), 'VVH');
    const workbook = XLSX.write(book,{type:'buffer',bookType:'xlsx'}); const form = new FormData(); form.append('import_kind','OVERDUE'); form.append('file',new Blob([workbook]),'TI OVERDUE.xlsx');
    const stagedResponse = await fetch(base+'/imports/stage',{method:'POST',headers:{'x-test-role':'trip_shed_operator'},body:form}); const staged = await stagedResponse.json(); assert.equal(stagedResponse.status,200,JSON.stringify(staged)); assert.equal(staged.row_count,2); assert.equal(staged.invalid_count,1);
    const batch = await call('GET',`/imports/${staged.id}`,undefined,200); assert.equal(batch.rows.length,2); assert.equal(batch.rows[1].status,'INVALID'); assert.ok(batch.rows[1].validation_errors.includes('DUPLICATE')); assert.equal(batch.batch.total_rows,2); assert.equal(batch.batch.invalid_rows,1); assert.match(batch.batch.source_sha256,/^[a-f0-9]{64}$/);
    await call('POST',`/imports/${staged.id}/decision`,{decision:'APPROVE'},403,'trip_shed_operator');
    await call('POST',`/imports/${staged.id}/decision`,{decision:'APPROVE'},200,'trip_shed_supervisor');
    const reviewed = await call('GET',`/imports/${staged.id}`,undefined,200); assert.equal(reviewed.batch.status,'APPROVED'); assert.equal(reviewed.batch.reviewed_by,990001); assert.ok(reviewed.batch.reviewed_at); assert.equal(reviewed.rows[0].status,'APPROVED'); assert.equal(reviewed.rows[1].status,'INVALID');
    console.log(`PASS: ${passed} HTTP checks; rollback and final-record snapshots unchanged. All writes used temporary tables.`);
    if (process.argv.includes('--serve')) {
      console.log('Isolated browser fixture: http://127.0.0.1:3001/test/division_admin (also trip_shed_operator, trip_shed_supervisor, ctlc_view). Ctrl-C drops temporary data.');
      await new Promise(resolve => {process.once('SIGINT',resolve);process.once('SIGTERM',resolve);});
    }
  } finally { if(server) await new Promise(resolve=>server.close(resolve)); await conn.end(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
