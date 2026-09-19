'use strict';
const router = require('express').Router();
const {parseDate, expectedEnd, nextDue} = require('../../lib/trainingCentreDates');

const fail=(status,message,details)=>Object.assign(new Error(message),{status,details});
const id=v=>{if(!/^\d+$/.test(String(v))||Number(v)<1)throw fail(400,'Invalid identifier');return Number(v);};
const text=(v,n,required=false)=>{if(v==null&&!required)return null;if(typeof v!=='string')throw fail(400,'Invalid text');const s=v.trim().replace(/\s+/g,' ');if((required&&!s)||s.length>n)throw fail(400,'Missing or invalid text');return s||null;};
const date=v=>{try{parseDate(v);return v;}catch(e){throw fail(400,e.message);}};
const day=v=>typeof v==='string'?v.slice(0,10):v.toISOString().slice(0,10);
const json=v=>typeof v==='string'?JSON.parse(v):v;
const endpoint=fn=>async(req,res,next)=>{try{await fn(req,res,next);}catch(e){if(!e.status)console.error('Training centre operations:',e.code||e.message);res.status(e.status||500).json({error:e.status?e.message:'Unable to complete this request',...(e.details||{})});}};

router.use(endpoint(async(req,res,next)=>{
  const u=req.session?.user;
  if(!u||u.realm!=='division')throw fail(401,'Sign in to the division portal');
  if(!['trgcentre_admin','division_admin'].includes(u.div_role))throw fail(403,'Training centre access required');
  const centre=id(u.div_role==='division_admin'?req.query.center_id:u.training_center_id);
  if(req.body?.center_id!=null&&id(req.body.center_id)!==centre)throw fail(403,'Centre mismatch');
  const [[found]]=await req.app.locals.pool.query("SELECT center_id FROM div_training_centers WHERE center_id=? AND is_active=1",[centre]);
  if(!found)throw fail(403,'Active training centre required');
  req.trainingCentreId=centre;req.trainingActor=u.username;next();
}));

async function write(req,fn){const c=await req.app.locals.pool.getConnection();let locked=false;try{const [[l]]=await c.query("SELECT GET_LOCK('bbtro.training_centre_manage',5) ok");if(l.ok!==1)throw fail(409,'Another training update is in progress. Retry.');locked=true;await c.beginTransaction();const out=await fn(c);await c.commit();return out;}catch(e){await c.rollback();throw e;}finally{if(locked)await c.query("SELECT RELEASE_LOCK('bbtro.training_centre_manage')");c.release();}}
async function audit(c,req,type,entity,action,reason,before,after){await c.query(`INSERT INTO div_training_audit_events(training_center_id,entity_type,entity_id,action,reason,before_data,after_data,actor) VALUES(?,?,?,?,?,?,?,?)`,[req.trainingCentreId,type,String(entity),action,reason,JSON.stringify(before??null),JSON.stringify(after??null),req.trainingActor]);}
async function course(c,centre,rule,active=true){const [[r]]=await c.query(`SELECT r.*,co.course_code,co.course_name,co.legacy_course_type,o.advance_planning FROM div_training_course_rules r JOIN div_training_courses co ON co.course_id=r.course_id JOIN div_training_course_offerings o ON o.rule_id=r.rule_id WHERE r.rule_id=? AND o.training_center_id=? ${active?'AND o.is_active=1 AND co.is_active=1':''}`,[id(rule),centre]);if(!r)throw fail(409,'Course is not offered at this centre');return r;}
async function holidays(c,centre){const [rows]=await c.query("SELECT DATE_FORMAT(holiday_date,'%Y-%m-%d') d FROM div_training_center_holidays WHERE training_center_id=?",[centre]);return rows.map(x=>x.d);}

router.get('/plans',endpoint(async(req,res)=>{const [rows]=await req.app.locals.pool.query(`SELECT cal.id,cal.batch_code,DATE_FORMAT(cal.from_date,'%Y-%m-%d') from_date,cal.status,cal.remarks,s.capacity,DATE_FORMAT(s.expected_end_date,'%Y-%m-%d') expected_end_date,s.rule_id,c.course_code,c.course_name FROM div_training_calendar cal JOIN div_training_batch_settings s ON s.calendar_id=cal.id JOIN div_training_course_rules r ON r.rule_id=s.rule_id JOIN div_training_courses c ON c.course_id=r.course_id WHERE s.training_center_id=? ORDER BY cal.from_date DESC,cal.id DESC`,[req.trainingCentreId]);for(const row of rows)[row.allocations]=await req.app.locals.pool.query('SELECT lobby,suggested_seats FROM div_training_batch_allocations WHERE calendar_id=? ORDER BY lobby',[row.id]);res.json({data:rows});}));

router.post('/plans',endpoint(async(req,res)=>{const rule=id(req.body.rule_id),from=date(req.body.from_date),batch=text(req.body.batch_code,20,true),capacity=req.body.capacity==null?null:id(req.body.capacity),remarks=text(req.body.remarks,2000);const allocations=Array.isArray(req.body.allocations)?req.body.allocations:[];if(allocations.length>50)throw fail(400,'Too many lobby allocations');const parsed=allocations.map(a=>({lobby:text(a?.lobby,50,true),suggested_seats:Number(a?.suggested_seats)}));if(parsed.some(a=>!Number.isInteger(a.suggested_seats)||a.suggested_seats<0))throw fail(400,'Suggested seats must be whole numbers');if(new Set(parsed.map(a=>a.lobby.toUpperCase())).size!==parsed.length)throw fail(400,'Each lobby may appear once');if(capacity!=null&&parsed.reduce((n,a)=>n+a.suggested_seats,0)>capacity)throw fail(400,'Suggested seats exceed batch capacity');const result=await write(req,async c=>{const r=await course(c,req.trainingCentreId,rule);if(!r.advance_planning)throw fail(409,'Advance planning is enabled only for refresher courses');const end=expectedEnd(from,r.working_days,await holidays(c,req.trainingCentreId));const [[target]]=await c.query(`SELECT t.legacy_training_id FROM div_training_rule_renewals rr JOIN div_training_renewal_targets t ON t.target_id=rr.target_id WHERE rr.rule_id=? AND t.legacy_training_id IS NOT NULL ORDER BY t.target_id LIMIT 1`,[rule]);const [ins]=await c.query(`INSERT INTO div_training_calendar(training_center_id,training_id,course_type,batch_code,from_date,status,remarks,created_by) VALUES(?,?,?,?,?,'planned',?,?)`,[req.trainingCentreId,target?.legacy_training_id||null,r.legacy_course_type||r.course_code,batch,from,remarks,req.trainingActor]);await c.query('INSERT INTO div_training_batch_settings(calendar_id,training_center_id,rule_id,capacity,expected_end_date) VALUES(?,?,?,?,?)',[ins.insertId,req.trainingCentreId,rule,capacity,end]);for(const a of parsed)await c.query('INSERT INTO div_training_batch_allocations(calendar_id,lobby,suggested_seats) VALUES(?,?,?)',[ins.insertId,a.lobby,a.suggested_seats]);await audit(c,req,'batch',ins.insertId,'create','Refresher batch planned',null,{batch_code:batch,from_date:from,expected_end_date:end,capacity,allocations:parsed});return{id:ins.insertId,expected_end_date:end};});res.status(201).json(result);}));

router.patch('/plans/:planId',endpoint(async(req,res)=>{const plan=id(req.params.planId),reason=text(req.body.reason,1000,true);const out=await write(req,async c=>{const [[old]]=await c.query(`SELECT cal.*,s.capacity,s.rule_id,DATE_FORMAT(s.expected_end_date,'%Y-%m-%d') expected_end_date FROM div_training_calendar cal JOIN div_training_batch_settings s ON s.calendar_id=cal.id WHERE cal.id=? AND s.training_center_id=? FOR UPDATE`,[plan,req.trainingCentreId]);if(!old)throw fail(404,'Plan not found');if(old.status!=='planned')throw fail(409,'Only planned batches can be changed');const from=req.body.from_date?date(req.body.from_date):day(old.from_date),capacity=req.body.capacity===undefined?old.capacity:(req.body.capacity==null?null:id(req.body.capacity));const r=await course(c,req.trainingCentreId,old.rule_id,false),end=expectedEnd(from,r.working_days,await holidays(c,req.trainingCentreId));let allocations;if(req.body.allocations!==undefined){if(!Array.isArray(req.body.allocations)||req.body.allocations.length>50)throw fail(400,'Invalid allocations');allocations=req.body.allocations.map(a=>({lobby:text(a?.lobby,50,true),suggested_seats:Number(a?.suggested_seats)}));if(allocations.some(a=>!Number.isInteger(a.suggested_seats)||a.suggested_seats<0))throw fail(400,'Suggested seats must be whole numbers');if(new Set(allocations.map(a=>a.lobby.toUpperCase())).size!==allocations.length)throw fail(400,'Each lobby may appear once');if(capacity!=null&&allocations.reduce((n,a)=>n+a.suggested_seats,0)>capacity)throw fail(400,'Suggested seats exceed batch capacity');await c.query('DELETE FROM div_training_batch_allocations WHERE calendar_id=?',[plan]);for(const a of allocations)await c.query('INSERT INTO div_training_batch_allocations VALUES(?,?,?)',[plan,a.lobby,a.suggested_seats]);}await c.query('UPDATE div_training_calendar SET from_date=?,remarks=? WHERE id=?',[from,req.body.remarks===undefined?old.remarks:text(req.body.remarks,2000),plan]);await c.query('UPDATE div_training_batch_settings SET capacity=?,expected_end_date=? WHERE calendar_id=?',[capacity,end,plan]);const after={...old,from_date:from,capacity,expected_end_date:end,allocations};await audit(c,req,'batch',plan,'update',reason,old,after);return after;});res.json(out);}));

router.get('/candidates',endpoint(async(req,res)=>{const [data]=await req.app.locals.pool.query(`SELECT n.nominee_id,n.letter_id,n.decision,n.identity_snapshot,w.rule_id,w.workflow_status,c.course_code,c.course_name,l.letter_no,DATE_FORMAT(l.training_date,'%Y-%m-%d') training_date,a.attempt_id,a.outcome,DATE_FORMAT(a.joining_date,'%Y-%m-%d') joining_date FROM div_training_nominees n JOIN div_training_letter_workflows w ON w.letter_id=n.letter_id JOIN div_training_letters l ON l.id=n.letter_id JOIN div_training_course_rules r ON r.rule_id=w.rule_id JOIN div_training_courses c ON c.course_id=r.course_id LEFT JOIN div_training_attempts a ON a.nominee_id=n.nominee_id WHERE w.training_center_id=? AND n.decision='accepted' ORDER BY l.training_date DESC,n.sr_no`,[req.trainingCentreId]);data.forEach(x=>x.identity_snapshot=json(x.identity_snapshot));res.json({data});}));

router.post('/attempts',endpoint(async(req,res)=>{const nominee=id(req.body.nominee_id),joining=date(req.body.joining_date),calendar=req.body.calendar_id==null?null:id(req.body.calendar_id);const out=await write(req,async c=>{const [[n]]=await c.query(`SELECT n.*,w.training_center_id,w.rule_id,w.workflow_status FROM div_training_nominees n JOIN div_training_letter_workflows w ON w.letter_id=n.letter_id WHERE n.nominee_id=? FOR UPDATE`,[nominee]);if(!n||n.training_center_id!==req.trainingCentreId)throw fail(404,'Accepted nominee not found');if(n.decision!=='accepted')throw fail(409,'The nominee has not been accepted');if(calendar){const [[b]]=await c.query("SELECT calendar_id FROM div_training_batch_settings s JOIN div_training_calendar cal ON cal.id=s.calendar_id WHERE s.calendar_id=? AND s.training_center_id=? AND s.rule_id=? AND cal.status IN ('planned','ongoing')",[calendar,req.trainingCentreId,n.rule_id]);if(!b)throw fail(409,'Selected batch does not match this course');}const [[joinHoliday]]=await c.query("SELECT 1 ok FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?",[req.trainingCentreId,joining]);if(parseDate(joining).getUTCDay()===0||joinHoliday)throw fail(400,'A course cannot start on a Sunday or centre holiday');const [ins]=await c.query(`INSERT INTO div_training_attempts(nominee_id,letter_id,training_center_id,rule_id,calendar_id,joining_date,outcome,created_by) VALUES(?,?,?,?,?,?,'in_progress',?)`,[nominee,n.letter_id,req.trainingCentreId,n.rule_id,calendar,joining,req.trainingActor]);if(!['partly_accepted','returned'].includes(n.workflow_status))await c.query("UPDATE div_training_letter_workflows SET workflow_status='in_progress',updated_by=? WHERE letter_id=?",[req.trainingActor,n.letter_id]);await audit(c,req,'attempt',ins.insertId,'start','Accepted trainee joined',null,{nominee_id:nominee,joining_date:joining,calendar_id:calendar});return{attempt_id:ins.insertId};});res.status(201).json(out);}));

// The working view is what still needs a decision. A finished batch is
// reachable by picking its day, so completed trainees do not pile up on the
// screen used every day.
router.get('/attempts/days',endpoint(async(req,res)=>{
    const [rows]=await req.app.locals.pool.query(`SELECT DATE_FORMAT(a.joining_date,'%Y-%m-%d') day,c.course_id,c.course_code,c.course_name,MIN(r.working_days) AS working_days,
            SUM(a.outcome='in_progress') AS open_count,SUM(a.outcome='passed') AS done_count,COUNT(*) AS total
        FROM div_training_attempts a
        JOIN div_training_course_rules r ON r.rule_id=a.rule_id
        JOIN div_training_courses c ON c.course_id=r.course_id
        WHERE a.training_center_id=?
        GROUP BY a.joining_date,c.course_id ORDER BY a.joining_date DESC,c.course_id`,[req.trainingCentreId]);
    // Thirty days of a one-day course is thirty batches; thirty days of a
    // refresher is barely two. So the cut differs by course length.
    const single=[],multi=[];
    for(const r of rows)(Number(r.working_days)===1?single:multi).push(r);
    const data=[...single.slice(0,30),...multi.slice(0,10)].sort((a,b)=>b.day<a.day?-1:b.day>a.day?1:a.course_id-b.course_id);
    res.json({data});
}));
router.get('/attempts',endpoint(async(req,res)=>{const state=['open','done','all'].includes(req.query.state)?req.query.state:'open';const day=req.query.day?date(req.query.day):null;const courseId=req.query.course_id?id(req.query.course_id):null;const [data]=await req.app.locals.pool.query(`SELECT a.*,DATE_FORMAT(a.joining_date,'%Y-%m-%d') joining_date,DATE_FORMAT(a.completion_date,'%Y-%m-%d') completion_date,n.identity_snapshot,c.course_code,c.course_name,r.working_days,r.assessment_configured,l.letter_no FROM div_training_attempts a JOIN div_training_nominees n ON n.nominee_id=a.nominee_id JOIN div_training_letters l ON l.id=a.letter_id JOIN div_training_course_rules r ON r.rule_id=a.rule_id JOIN div_training_courses c ON c.course_id=r.course_id WHERE a.training_center_id=?
          ${state==='open'?"AND a.outcome='in_progress'":state==='done'?"AND a.outcome='passed'":''}
          ${day?'AND a.joining_date=?':''}
          ${courseId?'AND c.course_id=?':''}
        ORDER BY a.attempt_id DESC LIMIT 200`,[req.trainingCentreId,...(day?[day]:[]),...(courseId?[courseId]:[])]);for(const a of data){a.identity_snapshot=json(a.identity_snapshot);[a.attendance]=await req.app.locals.pool.query("SELECT DATE_FORMAT(attendance_date,'%Y-%m-%d') attendance_date,status,remarks,marked_by,marked_at FROM div_training_daily_attendance WHERE attempt_id=? ORDER BY attendance_date",[a.attempt_id]);[a.assessments]=await req.app.locals.pool.query(`SELECT d.*,x.result_id,x.exam_no,DATE_FORMAT(x.exam_date,'%Y-%m-%d') exam_date,x.marks,x.result FROM div_training_assessment_definitions d LEFT JOIN div_training_assessment_results x ON x.assessment_id=d.assessment_id AND x.attempt_id=? WHERE d.rule_id=? ORDER BY d.assessment_id,x.exam_no`,[a.attempt_id,a.rule_id]);[a.completions]=await req.app.locals.pool.query("SELECT completion_id,revision,DATE_FORMAT(completion_date,'%Y-%m-%d') completion_date,event_type,supersedes_id,reason,confirmed_by,confirmed_at FROM div_training_completion_events WHERE attempt_id=? ORDER BY revision",[a.attempt_id]);}res.json({data});}));

async function lockedAttempt(c,req,attempt){const [[a]]=await c.query(`SELECT a.*,n.trainee_id,n.identity_snapshot,t.source,t.staff_hrms_id,r.working_days,r.assessment_configured,co.course_id,co.course_name FROM div_training_attempts a JOIN div_training_nominees n ON n.nominee_id=a.nominee_id JOIN div_training_trainees t ON t.trainee_id=n.trainee_id JOIN div_training_course_rules r ON r.rule_id=a.rule_id JOIN div_training_courses co ON co.course_id=r.course_id WHERE a.attempt_id=? AND a.training_center_id=? FOR UPDATE`,[attempt,req.trainingCentreId]);if(!a)throw fail(404,'Training attempt not found');a.identity_snapshot=json(a.identity_snapshot);return a;}

// Marking thirty trainees present one by one is the centre's daily reality.
// Mark the whole day present, then correct the few who were absent.
router.post('/attendance/bulk',endpoint(async(req,res)=>{
    const attendanceDate=date(req.body.attendance_date);
    const status=req.body.status||'present';
    if(!['present','absent','leave'].includes(status))throw fail(400,'Invalid attendance status');
    const only=Array.isArray(req.body.attempt_ids)?req.body.attempt_ids.map(id):null;
    if(only&&(!only.length||only.length>200))throw fail(400,'Select between 1 and 200 trainees');
    const out=await write(req,async c=>{
        const [[holiday]]=await c.query("SELECT 1 ok FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?",[req.trainingCentreId,attendanceDate]);
        if(parseDate(attendanceDate).getUTCDay()===0||holiday)throw fail(400,'Attendance cannot be marked on a Sunday or centre holiday');
        // On a single-day course, joining and being present are one event, so
        // an accepted nominee whose letter names this day is joined here rather
        // than in a separate step. Multi-day courses still join per trainee,
        // where the joining date is a real decision.
        let joined=0;
        if(!only){
            const [pending]=await c.query(`SELECT n.nominee_id,w.rule_id,w.letter_id,w.workflow_status
                FROM div_training_nominees n
                JOIN div_training_letter_workflows w ON w.letter_id=n.letter_id
                JOIN div_training_letters l ON l.id=n.letter_id
                JOIN div_training_course_rules r ON r.rule_id=w.rule_id
                LEFT JOIN div_training_attempts a ON a.nominee_id=n.nominee_id
                WHERE w.training_center_id=? AND n.decision='accepted' AND a.attempt_id IS NULL
                  AND r.working_days=1 AND l.training_date=? FOR UPDATE`,[req.trainingCentreId,attendanceDate]);
            for(const n of pending){
                const [ins]=await c.query(`INSERT INTO div_training_attempts(nominee_id,letter_id,training_center_id,rule_id,calendar_id,joining_date,outcome,created_by)
                    VALUES(?,?,?,?,NULL,?,'in_progress',?)`,[n.nominee_id,n.letter_id,req.trainingCentreId,n.rule_id,attendanceDate,req.trainingActor]);
                if(!['partly_accepted','returned'].includes(n.workflow_status))await c.query("UPDATE div_training_letter_workflows SET workflow_status='in_progress',updated_by=? WHERE letter_id=?",[req.trainingActor,n.letter_id]);
                await audit(c,req,'attempt',ins.insertId,'start','Joined with the day',null,{nominee_id:n.nominee_id,joining_date:attendanceDate,single_day:true});
                joined++;
            }
        }
        // A single-day trainee is only ever present on his own day. Without
        // this, an attempt left in progress from an earlier course is swept
        // into every later day's marking.
        const [rows]=await c.query(`SELECT a.attempt_id,DATE_FORMAT(a.joining_date,'%Y-%m-%d') joining_date
            FROM div_training_attempts a JOIN div_training_course_rules r ON r.rule_id=a.rule_id
            WHERE a.training_center_id=? AND a.outcome='in_progress'
              AND (CASE WHEN r.working_days=1 THEN a.joining_date=? ELSE a.joining_date<=? END)
            ${only?'AND a.attempt_id IN (?)':''} FOR UPDATE`,
            only?[req.trainingCentreId,attendanceDate,attendanceDate,only]:[req.trainingCentreId,attendanceDate,attendanceDate]);
        let marked=0,skipped=0;
        for(const a of rows){
            // Never silently overwrite a decision already recorded for that day.
            const [[old]]=await c.query('SELECT status FROM div_training_daily_attendance WHERE attempt_id=? AND attendance_date=?',[a.attempt_id,attendanceDate]);
            if(old){skipped++;continue}
            await c.query('INSERT INTO div_training_daily_attendance(attempt_id,attendance_date,status,marked_by) VALUES(?,?,?,?)',[a.attempt_id,attendanceDate,status,req.trainingActor]);
            await audit(c,req,'attendance',a.attempt_id+':'+attendanceDate,'mark','Marked with the day',null,{attendance_date:attendanceDate,status,bulk:true});
            marked++;
        }
        return{joined,marked,skipped,eligible:rows.length,attendance_date:attendanceDate,status};
    });
    res.json(out);
}));
router.post('/attempts/:attemptId/attendance',endpoint(async(req,res)=>{const attempt=id(req.params.attemptId),attendanceDate=date(req.body.attendance_date),status=req.body.status,remarks=text(req.body.remarks,1000),reason=text(req.body.reason,1000);if(!['present','absent','leave'].includes(status))throw fail(400,'Invalid attendance status');await write(req,async c=>{const a=await lockedAttempt(c,req,attempt);if(a.outcome!=='in_progress')throw fail(409,'Attendance is closed for this attempt');if(attendanceDate<day(a.joining_date))throw fail(400,'Attendance cannot precede joining');const [[holiday]]=await c.query("SELECT 1 ok FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?",[req.trainingCentreId,attendanceDate]);if(parseDate(attendanceDate).getUTCDay()===0||holiday)throw fail(400,'Attendance cannot be marked on a Sunday or centre holiday');const [[old]]=await c.query("SELECT DATE_FORMAT(attendance_date,'%Y-%m-%d') attendance_date,status,remarks FROM div_training_daily_attendance WHERE attempt_id=? AND attendance_date=?",[attempt,attendanceDate]);if(old&&!reason)throw fail(400,'A reason is required to correct attendance already marked');await c.query(`INSERT INTO div_training_daily_attendance(attempt_id,attendance_date,status,remarks,marked_by) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status),remarks=VALUES(remarks),marked_by=VALUES(marked_by),marked_at=CURRENT_TIMESTAMP`,[attempt,attendanceDate,status,remarks,req.trainingActor]);await audit(c,req,'attendance',attempt+':'+attendanceDate,old?'correct':'mark',reason,old||null,{attendance_date:attendanceDate,status,remarks});});res.json({success:true});}));

router.post('/attempts/:attemptId/assessments',endpoint(async(req,res)=>{const attempt=id(req.params.attemptId),assessment=id(req.body.assessment_id),examDate=date(req.body.exam_date),absent=req.body.absent===true,reason=text(req.body.reason,1000,true);const marks=absent?null:Number(req.body.marks);if(!absent&&(!Number.isFinite(marks)||marks<0))throw fail(400,'Enter valid marks');const out=await write(req,async c=>{const a=await lockedAttempt(c,req,attempt);if(a.outcome!=='in_progress')throw fail(409,'Assessment is closed for this attempt');const [[d]]=await c.query('SELECT * FROM div_training_assessment_definitions WHERE assessment_id=? AND rule_id=?',[assessment,a.rule_id]);if(!d)throw fail(404,'Assessment component not found');if(!absent&&marks>Number(d.maximum_marks))throw fail(400,'Marks exceed maximum');const [[last]]=await c.query('SELECT COALESCE(MAX(exam_no),0) n FROM div_training_assessment_results WHERE attempt_id=? AND assessment_id=?',[attempt,assessment]);const exam=last.n+1,result=absent?'absent':marks>=Number(d.passing_marks)?'pass':'fail';const [ins]=await c.query(`INSERT INTO div_training_assessment_results(attempt_id,assessment_id,rule_id,exam_no,exam_date,marks,result,recorded_by) VALUES(?,?,?,?,?,?,?,?)`,[attempt,assessment,a.rule_id,exam,examDate,marks,result,req.trainingActor]);await audit(c,req,'assessment_result',ins.insertId,'record',reason,null,{attempt_id:attempt,assessment_id:assessment,exam_no:exam,marks,result});return{result_id:ins.insertId,exam_no:exam,result};});res.status(201).json(out);}));

async function validateCompletion(c,req,a,completion){if(completion<day(a.joining_date))throw fail(400,'Completion cannot precede joining');const end=expectedEnd(day(a.joining_date),a.working_days,await holidays(c,req.trainingCentreId));if(completion<end)throw fail(409,'Completion is before the expected course end',{expected_completion:end});const [att]=await c.query("SELECT DATE_FORMAT(attendance_date,'%Y-%m-%d') d,status FROM div_training_daily_attendance WHERE attempt_id=? AND attendance_date BETWEEN ? AND ?",[a.attempt_id,day(a.joining_date),completion]);const absent=att.filter(x=>x.status!=='present').length;if(att.length<a.working_days)throw fail(409,'Daily attendance is incomplete',{required_days:a.working_days,marked_days:att.length});if((a.working_days===1&&absent)||(a.working_days>1&&absent>2))throw fail(409,'Attendance requires a repeat course',{non_present_days:absent});if(!a.assessment_configured)throw fail(409,'Configure assessment requirements before completion');const [missing]=await c.query(`SELECT d.assessment_id,d.assessment_name FROM div_training_assessment_definitions d WHERE d.rule_id=? AND d.is_required=1 AND COALESCE((SELECT x.result FROM div_training_assessment_results x WHERE x.attempt_id=? AND x.assessment_id=d.assessment_id ORDER BY x.exam_no DESC LIMIT 1),'fail')<>'pass'`,[a.rule_id,a.attempt_id]);if(missing.length)throw fail(409,'Required assessments are not passed',{assessments:missing});}
async function renewals(c,req,a,completionId,completionDate,previous={}){const [rules]=await c.query(`SELECT rr.target_id,rr.validity_months,t.legacy_training_id FROM div_training_rule_renewals rr JOIN div_training_renewal_targets t ON t.target_id=rr.target_id WHERE rr.rule_id=?`,[a.rule_id]);for(const r of rules){const due=nextDue(completionDate,r.validity_months);let legacy=previous[r.target_id]||null;if(a.source==='staff'&&r.legacy_training_id){if(legacy){await c.query(`UPDATE div_training_records SET done_date=?,due_date=?,training_center_id=?,status='Completed',source_course_id=? WHERE record_id=? AND staff_hrms_id=?`,[completionDate,due,req.trainingCentreId,a.course_id,legacy,a.staff_hrms_id]);}else{const [ins]=await c.query(`INSERT INTO div_training_records(staff_hrms_id,training_id,source_course_id,done_date,due_date,training_center_id,status) VALUES(?,?,?,?,?,?,'Completed') ON DUPLICATE KEY UPDATE record_id=LAST_INSERT_ID(record_id),source_course_id=VALUES(source_course_id)`,[a.staff_hrms_id,r.legacy_training_id,a.course_id,completionDate,due,req.trainingCentreId]);legacy=ins.insertId;}}await c.query('INSERT INTO div_training_completion_renewals(completion_id,target_id,due_date,legacy_record_id) VALUES(?,?,?,?)',[completionId,r.target_id,due,legacy]);}}

// One trainee's completion. The bulk route runs this too, so a rule can
// never apply to an individual and not to a batch.
async function completeOne(c,req,attempt,completion,key){const [[existing]]=await c.query('SELECT completion_id,attempt_id,revision FROM div_training_completion_events WHERE request_key=?',[key]);if(existing){if(Number(existing.attempt_id)!==attempt)throw fail(409,'Request key was already used');return{completion_id:existing.completion_id,revision:existing.revision,idempotent:true};}const a=await lockedAttempt(c,req,attempt);if(a.outcome!=='in_progress')throw fail(409,'Only an in-progress attempt can be completed');await validateCompletion(c,req,a,completion);const [ins]=await c.query(`INSERT INTO div_training_completion_events(attempt_id,revision,completion_date,event_type,request_key,confirmed_by) VALUES(?,1,?,'confirmed',?,?)`,[attempt,completion,key,req.trainingActor]);await renewals(c,req,a,ins.insertId,completion);await c.query("UPDATE div_training_attempts SET completion_date=?,outcome='passed' WHERE attempt_id=?",[completion,attempt]);const [[remaining]]=await c.query("SELECT COUNT(*) n FROM div_training_nominees n LEFT JOIN div_training_attempts a ON a.nominee_id=n.nominee_id WHERE n.letter_id=? AND n.decision='accepted' AND COALESCE(a.outcome,'pending')<>'passed'",[a.letter_id]);if(!remaining.n){await c.query("UPDATE div_training_letter_workflows SET workflow_status='completed',updated_by=? WHERE letter_id=?",[req.trainingActor,a.letter_id]);await c.query("UPDATE div_training_letters SET status='completed',completed_at=NOW() WHERE id=?",[a.letter_id]);}await audit(c,req,'completion',ins.insertId,'confirm','Centre confirmed individual completion',null,{attempt_id:attempt,completion_date:completion});return{completion_id:ins.insertId,revision:1};}
// End of the day: the centre marks the day's trainees attended. Each one is
// completed in its own transaction, so a man who cannot be completed — absent,
// assessment outstanding — does not roll back the rest. Every rule still runs.
router.post('/completions/bulk',endpoint(async(req,res)=>{
    const completion=date(req.body.completion_date);
    const batch=text(req.body.request_key,80,true);
    const only=Array.isArray(req.body.attempt_ids)?req.body.attempt_ids.map(id):null;
    if(only&&(!only.length||only.length>200))throw fail(400,'Select between 1 and 200 trainees');
    const [rows]=await req.app.locals.pool.query(`SELECT a.attempt_id,
            JSON_UNQUOTE(JSON_EXTRACT(n.identity_snapshot,'$.name')) AS name
        FROM div_training_attempts a
        JOIN div_training_course_rules r ON r.rule_id=a.rule_id
        JOIN div_training_nominees n ON n.nominee_id=a.nominee_id
        WHERE a.training_center_id=? AND a.outcome='in_progress'
          AND (CASE WHEN r.working_days=1 THEN a.joining_date=? ELSE a.joining_date<=? END)
          ${only?'AND a.attempt_id IN (?)':''}
        ORDER BY a.attempt_id`,
        only?[req.trainingCentreId,completion,completion,only]:[req.trainingCentreId,completion,completion]);
    const completed=[],failed=[];
    for(const row of rows){
        try{
            const out=await write(req,async c=>completeOne(c,req,row.attempt_id,completion,batch+':'+row.attempt_id));
            completed.push({attempt_id:row.attempt_id,name:row.name,completion_id:out.completion_id});
        }catch(e){
            failed.push({attempt_id:row.attempt_id,name:row.name,reason:e.status?e.message:'Could not be completed'});
        }
    }
    res.json({completion_date:completion,eligible:rows.length,completed:completed.length,completed_list:completed,failed});
}));
router.post('/attempts/:attemptId/complete',endpoint(async(req,res)=>{const attempt=id(req.params.attemptId),completion=date(req.body.completion_date),key=text(req.body.request_key,100,true);const out=await write(req,async c=>completeOne(c,req,attempt,completion,key));res.status(out.idempotent?200:201).json(out);}));

router.post('/attempts/:attemptId/correct-completion',endpoint(async(req,res)=>{const attempt=id(req.params.attemptId),completion=date(req.body.completion_date),key=text(req.body.request_key,100,true),reason=text(req.body.reason,2000,true);const out=await write(req,async c=>{const [[existing]]=await c.query('SELECT completion_id,attempt_id,revision FROM div_training_completion_events WHERE request_key=?',[key]);if(existing){if(Number(existing.attempt_id)!==attempt)throw fail(409,'Request key was already used');return{...existing,idempotent:true};}const a=await lockedAttempt(c,req,attempt);if(a.outcome!=='passed')throw fail(409,'Only a confirmed completion can be corrected');const [[old]]=await c.query(`SELECT * FROM div_training_completion_events e WHERE e.attempt_id=? AND NOT EXISTS(SELECT 1 FROM div_training_completion_events newer WHERE newer.supersedes_id=e.completion_id) FOR UPDATE`,[attempt]);if(!old||old.event_type==='voided')throw fail(409,'No active completion exists');await validateCompletion(c,req,a,completion);const [links]=await c.query('SELECT target_id,legacy_record_id FROM div_training_completion_renewals WHERE completion_id=?',[old.completion_id]);const previous=Object.fromEntries(links.map(x=>[x.target_id,x.legacy_record_id]));const revision=old.revision+1;const [ins]=await c.query(`INSERT INTO div_training_completion_events(attempt_id,revision,completion_date,event_type,supersedes_id,request_key,reason,confirmed_by) VALUES(?,?,?,'corrected',?,?,?,?)`,[attempt,revision,completion,old.completion_id,key,reason,req.trainingActor]);await renewals(c,req,a,ins.insertId,completion,previous);await c.query('UPDATE div_training_attempts SET completion_date=? WHERE attempt_id=?',[completion,attempt]);await audit(c,req,'completion',ins.insertId,'correct',reason,{completion_id:old.completion_id,completion_date:day(old.completion_date)},{completion_id:ins.insertId,completion_date:completion});return{completion_id:ins.insertId,revision};});res.status(out.idempotent?200:201).json(out);}));

router.post('/attempts/:attemptId/outcome',endpoint(async(req,res)=>{const attempt=id(req.params.attemptId),outcome=req.body.outcome,reason=text(req.body.reason,2000,true);if(!['failed','repeat_required','withdrawn'].includes(outcome))throw fail(400,'Invalid outcome');await write(req,async c=>{const a=await lockedAttempt(c,req,attempt);if(a.outcome==='passed')throw fail(409,'Correct a confirmed completion through completion history');await c.query('UPDATE div_training_attempts SET outcome=? WHERE attempt_id=?',[outcome,attempt]);await audit(c,req,'attempt',attempt,'outcome',reason,{outcome:a.outcome},{outcome});});res.json({success:true});}));

module.exports=router;
