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
    const tables = ['div_trip_sheds','div_trip_inspection_templates','div_trip_inspection_template_items','div_trip_inspections','div_trip_inspection_responses','div_trip_defects','div_trip_defect_events','div_trip_overdue_entries','div_trip_import_batches','div_trip_import_staging_rows','div_trip_loco_movements'];
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
    await conn.query("CREATE TEMPORARY TABLE div_locos (loco_number VARCHAR(20) PRIMARY KEY, loco_type VARCHAR(20), home_shed VARCHAR(30))");
    await conn.query("INSERT INTO div_locos VALUES ('30790','WAP7','PADX'),('33678','WAG9','VTAD')");
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
    const convSaved = await call('POST','/inspections',{...tiDraft,loco_number:'CONV-HDR',si_unit_arno_make:'BHEL ARNO',fdcs_make:'Medha FDCS'},200,'trip_shed_operator'); // TS-042: conventional header makes
    const convLoaded = await call('GET','/inspections/'+convSaved.id,undefined,200); assert.equal(convLoaded.inspection.si_unit_arno_make,'BHEL ARNO'); assert.equal(convLoaded.inspection.fdcs_make,'Medha FDCS');
    const gcMakes = await call('POST','/inspections',{template_id:1,inspection_date:'2026-09-16',shift_code:'08/16',loco_number:'GC-MAKES',traction_converter_make:'ABB',auxiliary_converter_make:'Medha',responses:[{template_item_id:1,outcome:'OK'}]},200,'trip_shed_operator'); // officer: optional on GC
    const gcLoaded = await call('GET','/inspections/'+gcMakes.id,undefined,200); assert.equal(gcLoaded.inspection.traction_converter_make,'ABB'); assert.equal(gcLoaded.inspection.auxiliary_converter_make,'Medha'); assert.equal(gcLoaded.inspection.si_unit_arno_make,null);
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
    // ---- SLAM loco-movement import (TS-037) ----
    const slamCsv = (rows) => ['Trip Shed Loco Movement,,,,,,,,,,,,,,,,,,,,,','From Date: 2026-09-21    Up to: 2026-09-23,,,,,,,,,,,,,,,,,,,,,',
      'Sno,Zone,LOCO,SHED,Purpose,SPM(KM),TRIPSHED,Received at (Date/time),Loco Out (Date/time),Defect,Action Taken,Under Frame,H.T. Machine Room,Pneumatic,Others,Roof Equipment,Cab Equipment,HOGStatus1,HOGStatus2,CAB AC1,CAB AC2,Remarks', ...rows].join('\n');
    const ok = 'CHECKED AND FOUND OK';
    const slamRows = [
      `1,CR,30790,PADX,GC,804321,VVH,22/09/2026 21:04,23/09/2026 04:00,N/A,--,${ok},${ok},${ok},${ok},N/A,${ok},Working,Working,Working,Working,RTIS WKG  HOG AAL`,
      `2,CR,33678,VTAD,GC,40795,CSMT,22/09/2026 12:07,22/09/2026 23:35,LOCO SCH OVERDUE,INFORMED TO LPC,${ok},${ok},${ok},${ok},N/A,${ok},Working,Working,Working,Working,belongs to CSMT`,
      `3,CR,39180,KYNE,GC,1354120,VVH,bad time,22/09/2026 21:45,CAB-1 WIPER NOT WKG,ATTENDED,${ok},${ok},${ok},${ok},N/A,${ok},Working,Working,Working,Working,bad received`,
      `4,CR,99999,XXXX,TI,abc,VVH,21/09/2026 06:05,,N/A,--,${ok},${ok},${ok},${ok},N/A,${ok},Non HOG Loco,Non HOG Loco,Working,Working,not in master + bad spm`,
      `5,CR,30790,PADX,GC,804321,VVH,22/09/2026 21:04,23/09/2026 04:00,N/A,--,${ok},${ok},${ok},${ok},N/A,${ok},Working,Working,Working,Working,duplicate of row 1`];
    async function stageSlam(csvText, role='trip_shed_operator') { const form=new FormData(); form.append('import_kind','SLAM_MOVEMENT'); form.append('file',new Blob([csvText]),'Trip_Shed_Loco_Movement.csv'); const r=await fetch(base+'/imports/stage',{method:'POST',headers:{'x-test-role':role},body:form}); const d=await r.json(); assert.equal(r.status,200,JSON.stringify(d)); passed++; return d; }
    const slamStaged = await stageSlam(slamCsv(slamRows));
    assert.equal(slamStaged.row_count,5); assert.equal(slamStaged.ready_count,2); assert.equal(slamStaged.invalid_count,3); assert.equal(slamStaged.warning_count,1);
    const slamBatch = await call('GET',`/imports/${slamStaged.id}`,undefined,200);
    const j = v => typeof v === 'string' ? JSON.parse(v) : v, flagsOf = i => j(slamBatch.rows[i].validation_errors), warnOf = i => j(slamBatch.rows[i].normalized_json).warnings;
    assert.equal(slamBatch.rows[0].status,'READY'); assert.deepEqual(flagsOf(0),[]); assert.deepEqual(warnOf(0),[]);
    assert.equal(j(slamBatch.rows[0].normalized_json).record.received_at,'2026-09-22 21:04:00');
    assert.ok(flagsOf(1).includes('OTHER_SHED')); assert.ok(flagsOf(2).includes('INVALID_RECEIVED_AT'));
    assert.equal(slamBatch.rows[3].status,'READY'); assert.ok(warnOf(3).includes('LOCO_NOT_IN_MASTER')); assert.ok(warnOf(3).includes('INVALID_SPM'));
    assert.ok(flagsOf(4).includes('DUPLICATE'));
    await call('POST',`/imports/${slamStaged.id}/decision`,{decision:'APPROVE'},403,'trip_shed_operator');
    const slamApproved = await call('POST',`/imports/${slamStaged.id}/decision`,{decision:'APPROVE'},200,'trip_shed_supervisor');
    assert.equal(slamApproved.publication,'2 loco movement(s) published, 0 already present');
    const slamReviewed = await call('GET',`/imports/${slamStaged.id}`,undefined,200); assert.ok(slamReviewed.rows[0].published_record_id); assert.ok(slamReviewed.rows[3].published_record_id); assert.equal(slamReviewed.rows[1].published_record_id,null);
    const movements = await call('GET','/movements',undefined,200,'ctlc_view'); assert.equal(movements.rows.length,2); assert.equal(movements.rows[0].loco_number,'30790'); assert.equal(movements.rows[0].received_at,'2026-09-22 21:04'); assert.equal(movements.rows[0].loco_out_at,'2026-09-23 04:00'); assert.equal(movements.rows[0].spm_km,804321); assert.equal(movements.rows[1].spm_km,null);
    assert.equal((await call('GET','/movements?loco=30790',undefined,200)).rows.length,1); assert.equal((await call('GET','/movements?purpose=ti',undefined,200)).rows.length,1); assert.equal((await call('GET','/movements?from=2026-09-22&to=2026-09-22',undefined,200)).rows.length,1); await call('GET','/movements?from=bad',undefined,400);
    assert.equal((await call('GET','/movements?shed_code=CSMT',undefined,200,'division_admin')).rows.length,0,'CSMT context must not see VVH movements');
    const slamAgain = await stageSlam(slamCsv(slamRows)); assert.equal(slamAgain.warning_count,2);
    const againBatch = await call('GET',`/imports/${slamAgain.id}`,undefined,200); assert.ok(j(againBatch.rows[0].normalized_json).warnings.includes('EXISTING_VISIT'));
    const againApproved = await call('POST',`/imports/${slamAgain.id}/decision`,{decision:'APPROVE'},200,'trip_shed_supervisor'); assert.equal(againApproved.publication,'0 loco movement(s) published, 2 already present');
    assert.equal((await call('GET','/movements',undefined,200)).rows.length,2,'re-import must not duplicate visits');
    await exportCheck('movements','csv','30790'); await exportCheck('movements','xlsx','30790');
    const fixture = require('node:fs').readFileSync(path.join(__dirname,'fixtures/slam_loco_movement_2026-09-21_23.csv'),'utf8');
    const real = await stageSlam(fixture); assert.equal(real.row_count,24); assert.equal(real.ready_count,24); assert.equal(real.invalid_count,0);
    const realApproved = await call('POST',`/imports/${real.id}/decision`,{decision:'APPROVE'},200,'trip_shed_supervisor'); assert.equal(realApproved.publication,'23 loco movement(s) published, 1 already present');
    assert.equal((await call('GET','/movements',undefined,200)).rows.length,25);
    const [[{n: movementCount}]] = await conn.query('SELECT COUNT(*) n FROM div_trip_loco_movements'); assert.equal(movementCount,25);
    // TI required today, by train (TS-040): shed's own list, WTT scheduled arrival, CO loco with shed override, SLAM status
    await conn.query("CREATE TEMPORARY TABLE div_trip_ti_trains (id INT AUTO_INCREMENT PRIMARY KEY, shed_id INT NOT NULL, train_no VARCHAR(20) NOT NULL, arrival_station VARCHAR(10) NOT NULL, departs_as VARCHAR(60), link_no VARCHAR(10), source VARCHAR(60), remark VARCHAR(255), is_active TINYINT(1) NOT NULL DEFAULT 1, created_by INT, UNIQUE KEY uq (shed_id, train_no))");
    await conn.query("CREATE TEMPORARY TABLE div_trip_ti_train_locos (id INT AUTO_INCREMENT PRIMARY KEY, shed_id INT NOT NULL, service_date DATE NOT NULL, train_no VARCHAR(20) NOT NULL, loco_number VARCHAR(20) NOT NULL, entered_by INT, UNIQUE KEY uq (shed_id, service_date, train_no))");
    await conn.query("CREATE TEMPORARY TABLE div_trains (train_id INT AUTO_INCREMENT PRIMARY KEY, train_no VARCHAR(20), train_name VARCHAR(80), from_station VARCHAR(10), to_station VARCHAR(10), run_days VARCHAR(30), is_active TINYINT(1) DEFAULT 1)");
    await conn.query("CREATE TEMPORARY TABLE div_train_stops (id INT AUTO_INCREMENT PRIMARY KEY, train_id INT, station_code VARCHAR(10), arrival_time TIME, day_offset INT DEFAULT 0)");
    await conn.query("CREATE TEMPORARY TABLE div_loco_link_log (id INT AUTO_INCREMENT PRIMARY KEY, working_date DATE, train_no VARCHAR(20), actual_loco_no VARCHAR(20))");
    await conn.query("CREATE TEMPORARY TABLE div_loco_link_master (id INT AUTO_INCREMENT PRIMARY KEY, train_no VARCHAR(20), direction VARCHAR(8), run_days VARCHAR(30), active TINYINT(1) DEFAULT 1)");
    await conn.query("INSERT INTO div_loco_link_master(train_no,direction,run_days,active) VALUES ('11006','UP','2,4',1),('11006','UP','5',1),('11006','DN','1',1),('15018','UP','1',0),('12168','UP',NULL,1)"); // sheet days win: 11006 Tue/Thu/Fri (train master says Tue only); inactive and NULL rows ignored
    await conn.query("CREATE TEMPORARY TABLE div_loco_link_roster (id INT AUTO_INCREMENT PRIMARY KEY, link_no VARCHAR(10), ti_locations VARCHAR(60), active TINYINT(1) DEFAULT 1)");
    await conn.query("CREATE TEMPORARY TABLE div_loco_link_roster_legs (id INT AUTO_INCREMENT PRIMARY KEY, roster_id INT, train_no VARCHAR(20), ti_after TINYINT(1))");
    await conn.query("INSERT INTO div_trip_ti_trains(shed_id,train_no,arrival_station,is_active) VALUES (1,'20104','LTT',1),(1,'12168','LTT',1),(1,'15018','LTT',1),(1,'11006','DR',1),(1,'22184','LTT',1),(1,'99998','LTT',0),(3,'11010','CSMT',1)");
    await conn.query("INSERT INTO div_trains(train_id,train_no,train_name,from_station,to_station,run_days) VALUES (1,'20104','LTT-GKP EXP','IGP','LTT','DAILY'),(2,'12168','LTT-BNPRS EXP','IGP','LTT','2,5'),(3,'15018','KASHI EXP','IGP','LTT','1,3'),(4,'11006','CHALUKYA','PUNE','DR','2'),(5,'22184','SAKET','IGP','LTT',NULL),(6,'11010','CSMT TRAIN','PUNE','CSMT','DAILY'),(7,'99998','INACTIVE','IGP','LTT','DAILY')");
    await conn.query("INSERT INTO div_train_stops(train_id,station_code,arrival_time,day_offset) VALUES (1,'IGP','02:10:00',1),(1,'LTT','04:35:00',1),(2,'LTT','12:45:00',0),(4,'DR','05:45:00',0),(4,'CSMT','06:20:00',0)");
    await conn.query("INSERT INTO div_loco_link_log(working_date,train_no,actual_loco_no) VALUES ('2026-10-20','20104','T1'),('2026-10-20','12168','T2'),('2026-10-19','22184','T9')");
    await conn.query("INSERT INTO div_loco_link_roster(id,link_no,ti_locations,active) VALUES (1,'1','GKP AND LTT',1),(2,'X','CSMT',1)");
    await conn.query("INSERT INTO div_loco_link_roster_legs(roster_id,train_no,ti_after) VALUES (1,'20104',1),(1,'18519',0),(1,'77777',1),(2,'11010',1)");
    await conn.query("INSERT INTO div_trip_loco_movements(shed_id,loco_number,purpose,received_at,loco_out_at,created_by) VALUES (1,'T1','TI','2026-10-20 01:00:00','2026-10-20 06:00:00',990001),(1,'T2','TI','2026-10-20 10:30:00',NULL,990001),(2,'T9','TI','2026-10-20 03:00:00',NULL,990001),(1,'T5','TI','2026-10-20 06:00:00','2026-10-20 11:00:00',990001)");
    const tiTue = await call('GET','/ti-trains?date=2026-10-20',undefined,200); // Tuesday
    assert.equal(tiTue.configured,true); assert.deepEqual(tiTue.counts,{expected:4,done:1,in_shed:1,awaited:2,listed:5});
    assert.deepEqual(tiTue.rows.map(x=>[x.train_no,x.arrival_station,x.sched_arrival,x.loco_number,x.loco_source,x.status]),[['20104','LTT','04:35','T1','CONTROL_OFFICE','DONE'],['11006','DR','05:45',null,null,'AWAITED'],['12168','LTT','12:45','T2','CONTROL_OFFICE','IN_SHED'],['22184','LTT',null,null,null,'AWAITED']],'Tuesday trains ordered by WTT arrival at the arrival station; 15018 (Mon/Wed) and the inactive 99998 excluded');
    assert.deepEqual(tiTue.roster_only.map(r=>r.train_no),['77777'],'roster TI leg missing from the shed list is reported; 18519 (no TI) and CSMT roster are not');
    const tiThu = await call('GET','/ti-trains?date=2026-10-22',undefined,200); assert.deepEqual(tiThu.rows.map(x=>x.train_no),['20104','11006','22184'],'Thursday: 11006 runs per the link-master sheet days although the train master says Tuesday only');
    const tiMon = await call('GET','/ti-trains?date=2026-10-19',undefined,200); assert.deepEqual(tiMon.rows.map(x=>x.train_no),['20104','15018','22184']); assert.equal(tiMon.rows[2].loco_number,'T9'); assert.equal(tiMon.rows[2].status,'AWAITED','a visit at another shed does not count');
    await call('PUT','/ti-trains/11006/loco',{date:'2026-10-20',loco_number:'T5'},400,'trip_shed_operator'); // not 4-6 digits
    await call('PUT','/ti-trains/11006/loco',{date:'2026-10-20',loco_number:'39001'},403,'ctlc_view');
    await call('PUT','/ti-trains/55555/loco',{date:'2026-10-20',loco_number:'39001'},404,'trip_shed_operator');
    await call('PUT','/ti-trains/11006/loco',{date:'2026-10-20',loco_number:'39001'},200,'trip_shed_operator');
    await conn.query("INSERT INTO div_trip_loco_movements(shed_id,loco_number,purpose,received_at,loco_out_at,created_by) VALUES (1,'39001','TI','2026-10-20 06:30:00',NULL,990001)");
    await call('PUT','/ti-trains/20104/loco',{date:'2026-10-20',loco_number:'39002'},200,'trip_shed_supervisor'); // shed override beats CO entry
    const tiAfter = await call('GET','/ti-trains?date=2026-10-20',undefined,200);
    assert.deepEqual(tiAfter.rows.map(x=>[x.train_no,x.loco_number,x.loco_source,x.status]),[['20104','39002','SHED','AWAITED'],['11006','39001','SHED','IN_SHED'],['12168','T2','CONTROL_OFFICE','IN_SHED'],['22184',null,null,'AWAITED']]);
    await call('PUT','/ti-trains/20104/loco',{date:'2026-10-20',loco_number:''},200,'trip_shed_operator'); // empty clears the override
    assert.equal((await call('GET','/ti-trains?date=2026-10-20',undefined,200)).rows[0].loco_number,'T1');
    await call('PUT','/ti-trains/22184/loco',{date:'2026-10-20',loco_number:'39003'},200,'trip_shed_operator');
    await conn.query("INSERT INTO div_trip_loco_movements(shed_id,loco_number,purpose,received_at,loco_out_at,created_by) VALUES (1,'39003','TI','2026-10-21 02:00:00','2026-10-21 07:00:00',990001),(1,'39003','GC','2026-10-22 02:00:00',NULL,990001)");
    const tiOvernight = await call('GET','/ti-trains?date=2026-10-20',undefined,200); const ov = tiOvernight.rows.find(x=>x.train_no==='22184');
    assert.deepEqual([ov.loco_number,ov.status,ov.visit_purpose,ov.received_at],['39003','DONE','TI','2026-10-21 02:00'],'a visit on the morning after the arrival date counts; the one two days later does not');
    assert.equal((await call('GET','/ti-trains?date=2026-10-19',undefined,200)).rows.find(x=>x.train_no==='22184').status,'AWAITED','the Tuesday-night visit is not pulled back onto Monday (T9 has no visit in Mon..Tue)');
    await call('PUT','/ti-trains/22184/loco',{date:'2026-10-20',loco_number:''},200,'trip_shed_operator');
    const tiCsmt = await call('GET','/ti-trains?date=2026-10-20&shed_code=CSMT',undefined,200,'division_admin'); assert.deepEqual(tiCsmt.rows.map(x=>x.train_no),['11010']); assert.deepEqual(tiCsmt.roster_only,[]);
    await call('GET','/ti-trains?date=2026-10-20&shed_code=CSMT',undefined,403,'trip_shed_operator');
    assert.equal((await call('GET','/ti-trains?date=2026-10-20&shed_code=OTHER',undefined,200,'division_admin')).configured,false,'shed without a list is not configured');
    assert.equal((await call('GET','/ti-trains?date=2026-10-20',undefined,200,'ctlc_view')).counts.expected,4,'readers may view the TI tile');
    console.log(`PASS: ${passed} HTTP checks; rollback and final-record snapshots unchanged. All writes used temporary tables.`);
    if (process.argv.includes('--serve')) {
      console.log('Isolated browser fixture: http://127.0.0.1:3001/test/division_admin (also trip_shed_operator, trip_shed_supervisor, ctlc_view). Ctrl-C drops temporary data.');
      await new Promise(resolve => {process.once('SIGINT',resolve);process.once('SIGTERM',resolve);});
    }
  } finally { if(server) await new Promise(resolve=>server.close(resolve)); await conn.end(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
