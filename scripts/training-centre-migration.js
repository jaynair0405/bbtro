#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const mysql=require('mysql2/promise');
const root=path.resolve(__dirname,'..');
const env=require('dotenv').config({path:path.join(root,'.env'),quiet:true}).parsed||{};
const sqlPath=path.join(root,'sql/2026-09-15_training_centre_foundation.sql');
const sql=fs.readFileSync(sqlPath,'utf8');
// Split statement terminators outside SQL string literals.
function splitSql(text) {
  const out=[]; let start=0, quoted=false;
  for(let i=0;i<text.length;i++) {
    if(text[i]==="'" && text[i-1]!==String.fromCharCode(92)) {
      if(quoted && text[i+1]==="'") { i++; continue; }
      quoted=!quoted;
    }
    if(text[i]===';'&&!quoted) { out.push(text.slice(start,i).trim());start=i+1; }
  }
  if(text.slice(start).trim())throw Error('Unterminated SQL');
  return out.filter(Boolean);
}
const statements=splitSql(sql.replace(/^--.*$/gm,''));
const names=statements.map(s=>{const m=s.match(/^CREATE TABLE (div_training_[a-z_]+)\s*\(/);if(!m)throw Error('Only CREATE TABLE is allowed');return m[1];});
const parents=['div_staff_master','div_cli_master','div_training_centers','div_training_types','div_training_letters','div_training_letter_staff','div_training_calendar','div_training_records'];
const legacy=[...parents,'div_training_batch_sequences','holidays_list'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const qi=s=>'`'+s.replace(/`/g,'``')+'`';
const norm=s=>s.replace(/AUTO_INCREMENT=\d+\s*/g,'');
const report={migration:path.basename(sqlPath),sqlSha256:hash(sql),mode:process.argv[2],startedAt:new Date().toISOString(),tests:[]};
let c,scratch,locked=false;
const q=(s,p=[])=>c.query(s,p);
async function schema(t){return (await q('SHOW CREATE TABLE '+qi(t)))[0][0]['Create Table'];}
async function snapshot(){const out={};for(const t of legacy){const ddl=await schema(t);const [rows]=await q('SELECT * FROM '+qi(t));out[t]={rows:rows.length,dataSha256:hash(rows.map(r=>JSON.stringify(r)).sort().join('\n')),schemaSha256:hash(ddl)};}return out;}
async function reject(label,s){try{await q(s);}catch(e){if(!['ER_CHECK_CONSTRAINT_VIOLATED','ER_NO_REFERENCED_ROW_2','ER_DUP_ENTRY','ER_ROW_IS_REFERENCED_2','ER_BAD_NULL_ERROR'].includes(e.code))throw e;report.tests.push({test:label,result:'passed',rejectedWith:e.code});return;}throw Error('Unexpected acceptance: '+label);}
async function fixtures(){await c.beginTransaction();try{
await q("INSERT INTO div_training_centers(center_id,center_code) VALUES(1,'TEST')");
await q("INSERT INTO div_staff_master(hrms_id,name) VALUES('TESTSTAFF','Test Staff')");
await q("INSERT INTO div_cli_master(cli_id,cli_name) VALUES(1,'Test CLI')");
await q("INSERT INTO div_training_letters(id,letter_date,office_code,course_type,training_date) VALUES(1,'2026-09-15','TEST','TEST','2026-09-15'),(2,'2026-09-15','TEST','TEST','2026-09-15')");
await q("INSERT INTO div_training_courses(course_id,course_code,course_name) VALUES(1,'TEST','Test')");
await q("INSERT INTO div_training_course_rules(rule_id,course_id,version_no,effective_from,working_days,created_by) VALUES(1,1,1,'2026-09-15',1,'test'),(2,1,2,'2026-09-15',1,'test')");
await q("INSERT INTO div_training_course_offerings(training_center_id,rule_id) VALUES(1,1),(1,2)");
await q("INSERT INTO div_training_trainees(trainee_id,source,name,cms_id,lobby,pf_number,created_by) VALUES(1,'manual_tm','Test TM','TESTCMS','TEST','TESTPF','test')");
await q("INSERT INTO div_training_trainees(trainee_id,source,cli_id,name,created_by) VALUES(2,'cli',1,'Test CLI','test')");
await q("INSERT INTO div_training_trainees(trainee_id,source,staff_hrms_id,name,created_by) VALUES(3,'staff','TESTSTAFF','Test Staff','test')");
report.tests.push({test:'TM without HRMS, CLI without staff-master row, and staff lookup',result:'passed'});
for(const f of ['name','cms_id','lobby','pf_number']){
await reject('TM rejects missing '+f,`UPDATE div_training_trainees SET ${qi(f)}=NULL WHERE trainee_id=1`);
await reject('TM rejects blank '+f,`UPDATE div_training_trainees SET ${qi(f)}=' ' WHERE trainee_id=1`);}
await reject('CLI must exist',"INSERT INTO div_training_trainees(source,cli_id,name,created_by) VALUES('cli',999,'Invalid','test')");
await reject('Cannot mix identity sources','UPDATE div_training_trainees SET cli_id=1 WHERE trainee_id=3');
await reject('Duplicate CLI identity',"INSERT INTO div_training_trainees(source,cli_id,name,created_by) VALUES('cli',1,'Duplicate','test')");
await q("INSERT INTO div_training_letter_workflows(letter_id,training_center_id,rule_id,origin,updated_by) VALUES(1,1,1,'centre','test'),(2,1,1,'centre','test')");
await q("INSERT INTO div_training_letter_versions(version_id,letter_id,version_no,snapshot,submitted_by) VALUES(1,1,1,JSON_OBJECT('test',true),'test'),(2,2,1,JSON_OBJECT('test',true),'test')");
await q("INSERT INTO div_training_nominees(nominee_id,letter_id,trainee_id,version_id,sr_no,identity_snapshot,decision,decided_by,decided_at) VALUES(1,1,1,1,1,JSON_OBJECT('name','Test TM'),'accepted','test',NOW()),(2,1,2,1,2,JSON_OBJECT('name','Test CLI'),'accepted','test',NOW())");
await reject('Version belongs to same letter','UPDATE div_training_nominees SET version_id=2 WHERE nominee_id=1');
await reject('Return requires reason',"UPDATE div_training_nominees SET decision='returned' WHERE nominee_id=1");
await q("INSERT INTO div_training_attempts(attempt_id,nominee_id,letter_id,training_center_id,rule_id,joining_date,created_by) VALUES(1,1,1,1,1,'2026-09-15','test'),(2,2,1,1,1,'2026-09-15','test')");
await reject('Attempt course matches letter','UPDATE div_training_attempts SET rule_id=2 WHERE attempt_id=1');
await reject('Completion cannot precede joining',"UPDATE div_training_attempts SET completion_date='2026-09-14' WHERE attempt_id=1");
await q("INSERT INTO div_training_daily_attendance(attempt_id,attendance_date,status,marked_by) VALUES(1,'2026-09-15','present','test')");
await reject('One attendance per date',"INSERT INTO div_training_daily_attendance(attempt_id,attendance_date,status,marked_by) VALUES(1,'2026-09-15','absent','test')");
await q("INSERT INTO div_training_assessment_definitions(assessment_id,rule_id,assessment_code,assessment_name,component,maximum_marks,passing_marks) VALUES(1,1,'TEST','Test','written',100,50),(2,2,'TEST','Test','oral',100,50)");
await reject('Valid assessment thresholds','UPDATE div_training_assessment_definitions SET passing_marks=101 WHERE assessment_id=1');
await q("INSERT INTO div_training_assessment_results(attempt_id,assessment_id,rule_id,exam_no,exam_date,marks,result,recorded_by) VALUES(1,1,1,1,'2026-09-15',40,'fail','test'),(1,1,1,2,'2026-09-16',60,'pass','test')");
await reject('Assessment matches attempt rule',"INSERT INTO div_training_assessment_results(attempt_id,assessment_id,rule_id,exam_date,marks,result,recorded_by) VALUES(1,2,2,'2026-09-15',60,'pass','test')");
await q("INSERT INTO div_training_completion_events(completion_id,attempt_id,completion_date,request_key,confirmed_by) VALUES(1,1,'2026-09-16','test-1','test'),(2,2,'2026-09-17','test-2','test')");
report.tests.push({test:'Re-exam retains results and trainees have individual completion dates',result:'passed'});
await reject('Duplicate completion request',"INSERT INTO div_training_completion_events(attempt_id,completion_date,request_key,confirmed_by) VALUES(1,'2026-09-16','test-1','test')");
await reject('Different request cannot reconfirm same attempt',"INSERT INTO div_training_completion_events(attempt_id,completion_date,request_key,confirmed_by) VALUES(1,'2026-09-16','other','test')");
await reject('Correction requires reason',"INSERT INTO div_training_completion_events(attempt_id,revision,completion_date,event_type,supersedes_id,request_key,confirmed_by) VALUES(1,2,'2026-09-17','corrected',1,'test-correction','test')");
await reject('Correction belongs to same attempt',"INSERT INTO div_training_completion_events(attempt_id,revision,completion_date,event_type,supersedes_id,request_key,reason,confirmed_by) VALUES(1,2,'2026-09-17','corrected',2,'test-cross','test reason','test')");
await q("INSERT INTO div_training_completion_events(completion_id,attempt_id,revision,completion_date,event_type,supersedes_id,request_key,reason,confirmed_by) VALUES(3,1,2,'2026-09-17','corrected',1,'test-correct','Date corrected','test')");
await q("INSERT INTO div_training_renewal_targets(target_id,target_code,target_name) VALUES(1,'TEST_REF','Test Refresher'),(2,'TEST_AUTO','Test Automatic')");
await q("INSERT INTO div_training_rule_renewals(rule_id,target_id,validity_months) VALUES(1,1,36),(1,2,6)");
await q("INSERT INTO div_training_completion_renewals(completion_id,target_id,due_date) VALUES(3,1,'2029-09-16'),(3,2,'2027-03-16')");
report.tests.push({test:'Two renewal effects without a staff-master record',result:'passed'});
await reject('Preserve nominee with history','DELETE FROM div_training_nominees WHERE nominee_id=1');
await reject('Holiday reason required',"INSERT INTO div_training_center_holidays(training_center_id,holiday_date,reason,created_by) VALUES(1,'2026-09-15',' ','test')");
await reject('Audit reason required',"INSERT INTO div_training_audit_events(training_center_id,entity_type,entity_id,action,reason,actor) VALUES(1,'test','1','correct',' ','test')");
}finally{await c.rollback();}}
async function run(){
if(!['--verify','--apply'].includes(process.argv[2]))throw Error('Usage: --verify|--apply');
if(!['localhost','127.0.0.1','::1'].includes(env.DB_HOST)||env.DB_NAME!=='bbtro')throw Error('Only local bbtro permitted');
c=await mysql.createConnection({host:env.DB_HOST,port:Number(env.DB_PORT||3306),user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME,dateStrings:true});
report.server=(await q('SELECT DATABASE() AS db,@@hostname AS hostname,VERSION() AS version'))[0][0];
const [[lock]]=await q("SELECT GET_LOCK('bbtro.training_centre_foundation',5) AS acquired");
if(lock.acquired!==1)throw Error('Migration lock unavailable');locked=true;
report.before=await snapshot();
scratch='bbtro_trg_verify_'+crypto.randomBytes(6).toString('hex');
await q('CREATE DATABASE '+qi(scratch)+' CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
await q('USE '+qi(scratch));
for(const t of parents)await q('CREATE TABLE '+qi(t)+' LIKE `bbtro`.'+qi(t));
for(const s of statements)await q(s);
await fixtures();
const expected={};for(const t of names)expected[t]=norm(await schema(t));
await q('USE `bbtro`');await q('DROP DATABASE '+qi(scratch));scratch=null;
console.log('Scratch schema and '+report.tests.length+' checks passed.');
const [existing]=await q('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME IN (?)',['bbtro',names]);
if(existing.length!==0&&existing.length!==names.length)throw Error('Partial installation: inspect recovery notes');
if(existing.length===names.length){for(const t of names)if(norm(await schema(t))!==expected[t])throw Error('Schema drift: '+t);report.applyResult='already_applied_exact_schema';}
else if(process.argv[2]==='--apply'){
if(JSON.stringify(await snapshot())!==JSON.stringify(report.before))throw Error('Legacy state changed during validation');
report.createdTables=[];for(let i=0;i<statements.length;i++){await q(statements[i]);report.createdTables.push(names[i]);}report.applyResult='applied';
}else report.applyResult='verified_only';
report.after=await snapshot();if(JSON.stringify(report.before)!==JSON.stringify(report.after))throw Error('Legacy data/schema changed');
report.legacyUnchanged=true;report.tableCounts={};
if(report.applyResult!=='verified_only')for(const t of names){report.tableCounts[t]=(await q('SELECT COUNT(*) AS n FROM '+qi(t)))[0][0].n;if(norm(await schema(t))!==expected[t])throw Error('Applied schema mismatch: '+t);}
report.success=true;console.log(JSON.stringify({result:report.applyResult,tables:names.length,checks:report.tests.length,legacyUnchanged:true}));
}
run().catch(e=>{report.success=false;report.error={code:e.code,message:e.message};console.error(e.code||e.message);process.exitCode=1;}).finally(async()=>{
if(c){try{await q('USE `bbtro`');if(scratch)await q('DROP DATABASE '+qi(scratch));if(locked)await q("SELECT RELEASE_LOCK('bbtro.training_centre_foundation')");}catch(e){report.cleanupError=e.code;process.exitCode=1;}await c.end();}
report.finishedAt=new Date().toISOString();const output=path.join(root,'docs','training-centre-migration-'+Date.now()+'.json');fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('Report: '+output);
});
