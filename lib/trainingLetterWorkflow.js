'use strict';
const offices = require('./trainingLetterOffices');
const {parseDate,nextDue} = require('./trainingCentreDates');
const error = (status,message) => Object.assign(new Error(message),{status});
function id(value) { if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value)<1) throw error(400,'Invalid identifier'); return Number(value); }
function text(value,max,required=false) {
    if (value==null&&!required)return '';
    if (typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))throw error(400,'Missing or invalid letter field');
    return value.trim();
}
function date(value) { try {parseDate(value);return value;}catch(e){throw error(400,e.message);} }
const day = v => typeof v==='string'?v.slice(0,10):v.toISOString().slice(0,10);
const json = v => typeof v==='string'?JSON.parse(v):v;
const officeOf = user => user.div_office_code==='CSMT-HQ'?'CSMT-SUB':user.div_office_code;
function actor(req) {
    const u=req.session?.user;
    if(!u||u.realm!=='division')throw error(401,'Division login required');
    if(!['division_admin','office_hr','trgcentre_admin'].includes(u.div_role))throw error(403,'Letter access denied');
    return u;
}
function scope(req) {
    const u=actor(req),centre=u.div_role==='trgcentre_admin'||req.query.view==='centre';
    if(centre&&u.div_role==='office_hr')throw error(403,'Centre access denied');
    if(centre){
        const center=id(u.div_role==='trgcentre_admin'?u.training_center_id:req.query.center_id);
        if(req.query.center_id&&id(req.query.center_id)!==center)throw error(403,'Centre mismatch');
        return {origin:'centre',center,office:null};
    }
    const office=u.div_role==='division_admin'?(req.query.office_code||'CSMT-SUB'):officeOf(u);
    if(!office||req.query.office_code&&req.query.office_code!==office)throw error(403,'Office access denied');
    return {origin:'lobby',office,center:null};
}
function mayRead(req,letter) {
    const u=actor(req);
    if(u.div_role==='division_admin')return;
    if(u.div_role==='trgcentre_admin'&&Number(u.training_center_id)===letter.training_center_id)return;
    if(u.div_role==='office_hr'&&officeOf(u)===letter.office_code&&letter.origin==='lobby')return;
    throw error(403,'This letter belongs to another office or centre');
}
function mayEdit(req,letter) {
    mayRead(req,letter);const u=actor(req);
    if(u.div_role==='division_admin')return;
    if(letter.origin==='centre'&&u.div_role==='trgcentre_admin')return;
    if(letter.origin==='lobby'&&u.div_role==='office_hr')return;
    throw error(403,'Only the submitting office can edit this letter');
}
async function transaction(req,fn) {
    const c=await req.app.locals.pool.getConnection();let locked=false;
    try{
        // Shared with registry writes, so simultaneous master registration cannot duplicate an identity.
        const [[l]]=await c.query("SELECT GET_LOCK('bbtro.training_centre_manage',5) AS ok");
        if(l.ok!==1)throw error(409,'Another training update is in progress. Retry.');locked=true;
        await c.beginTransaction();const result=await fn(c);await c.commit();return result;
    }catch(e){await c.rollback();throw e;}finally{if(locked)await c.query("SELECT RELEASE_LOCK('bbtro.training_centre_manage')");c.release();}
}
async function audit(c,req,letter,action,before,after,reason) {
    await c.query(`INSERT INTO div_training_audit_events(training_center_id,entity_type,entity_id,action,reason,before_data,after_data,actor)
        VALUES(?,'letter',?,?,?,?,?,?)`,[letter.training_center_id,String(letter.id),action,reason||action,JSON.stringify(before),JSON.stringify(after),actor(req).username]);
}
async function read(c,req,letterId,lock=false) {
    const [[letter]]=await c.query(`SELECT l.*,w.origin,w.rule_id,w.revision,w.workflow_status FROM div_training_letters l
        JOIN div_training_letter_workflows w ON w.letter_id=l.id WHERE l.id=? ${lock?'FOR UPDATE':''}`,[id(letterId)]);
    if(!letter)throw error(404,'Workflow letter not found');mayRead(req,letter);
    const [nominees]=await c.query('SELECT * FROM div_training_nominees WHERE letter_id=? ORDER BY sr_no,nominee_id',[letter.id]);
    nominees.forEach(n=>n.identity_snapshot=json(n.identity_snapshot));
    const [versions]=await c.query('SELECT version_id,version_no,submitted_at,submitted_by FROM div_training_letter_versions WHERE letter_id=? ORDER BY version_no DESC',[letter.id]);
    const [[latest]]=await c.query('SELECT snapshot FROM div_training_letter_versions WHERE letter_id=? ORDER BY version_no DESC LIMIT 1',[letter.id]);
    return {letter,nominees,versions,snapshot:latest?json(latest.snapshot):null};
}
async function course(c,ruleId,centreId,active=true) {
    const [[r]]=await c.query(`SELECT r.*,co.course_code,co.course_name,co.legacy_course_type,o.report_time,o.requirements_text,
        tc.center_code,tc.center_name FROM div_training_course_rules r JOIN div_training_courses co ON co.course_id=r.course_id
        JOIN div_training_course_offerings o ON o.rule_id=r.rule_id JOIN div_training_centers tc ON tc.center_id=o.training_center_id
        WHERE r.rule_id=? AND o.training_center_id=? ${active?'AND o.is_active=1 AND co.is_active=1':''} AND tc.is_active=1`,[id(ruleId),centreId]);
    if(!r)throw error(409,'Course configuration changed or is not offered here. Reload the course list.');
    if(r.center_code!=='MTC_CLA')throw error(409,'Letter format is not configured for this centre');
    [r.renewals]=await c.query(`SELECT rr.*,t.target_code,t.target_name,t.legacy_training_id FROM div_training_rule_renewals rr JOIN div_training_renewal_targets t ON t.target_id=rr.target_id WHERE rr.rule_id=? ORDER BY t.target_id`,[r.rule_id]);
    return r;
}
function warning(person,r) {
    const d=(person.designation_name||'').toLowerCase(),code=r.course_code;
    let eligible=true;
    if(code.startsWith('TM_'))eligible=person.source==='manual_tm';
    else if(code==='CLI_CONVERSION')eligible=person.source==='cli';
    else if(code.startsWith('LPS_'))eligible=/shunt/.test(d);
    else if(code==='MM_PROMOTION')eligible=/goods|passenger/.test(d);
    else eligible=/motorman/.test(d);
    return eligible?null:'Check eligibility: '+r.eligibility_notes+'. Centre decides acceptance.';
}
async function history(c,p,r) {
    const out=[];
    for(const target of r.renewals){
        let legacy=null;
        if(p.staff_hrms_id&&target.legacy_training_id){
            [[legacy]]=await c.query(`SELECT DATE_FORMAT(done_date,'%Y-%m-%d') AS done_date,DATE_FORMAT(due_date,'%Y-%m-%d') AS due_date
                FROM div_training_records WHERE staff_hrms_id=? AND training_id=? AND done_date IS NOT NULL ORDER BY done_date DESC,record_id DESC LIMIT 1`,[p.staff_hrms_id,target.legacy_training_id]);
        }
        let current=null;
        if(p.trainee_id){
            [[current]]=await c.query(`SELECT DATE_FORMAT(e.completion_date,'%Y-%m-%d') AS done_date,DATE_FORMAT(x.due_date,'%Y-%m-%d') AS due_date
                FROM div_training_completion_events e JOIN div_training_attempts a ON a.attempt_id=e.attempt_id
                JOIN div_training_nominees n ON n.nominee_id=a.nominee_id JOIN div_training_completion_renewals x ON x.completion_id=e.completion_id
                WHERE n.trainee_id=? AND x.target_id=? AND e.event_type<>'voided'
                  AND NOT EXISTS(SELECT 1 FROM div_training_completion_events newer WHERE newer.supersedes_id=e.completion_id)
                ORDER BY e.completion_date DESC,e.completion_id DESC LIMIT 1`,[p.trainee_id,target.target_id]);
        }
        const latest=current&&(!legacy||current.done_date>=legacy.done_date)?current:legacy;
        out.push({target:target.target_name,last_training_date:latest?.done_date||null,due_date:latest?(latest.due_date||nextDue(latest.done_date,target.validity_months)):null});
    }
    return out;
}
async function person(c,req,ref,s,r,create) {
    if(!ref||typeof ref!=='object')throw error(400,'Invalid nominee');
    let p;
    if(ref.source==='staff'){
        const refId=text(ref.source_id,10,true);
        [[p]]=await c.query(`SELECT s.hrms_id AS source_id,s.hrms_id AS staff_hrms_id,s.name,s.current_cms_id AS cms_id,s.current_office_code AS lobby,s.pf_number,s.hrms_id,d.designation_name
            FROM div_staff_master s LEFT JOIN designations d ON d.id=s.designation_id WHERE s.hrms_id=? AND s.status='Active'`,[refId]);
    }else if(ref.source==='cli'){
        [[p]]=await c.query(`SELECT cli_id AS source_id,cli_id,cli_name AS name,cmsid AS cms_id,current_office_code AS lobby,NULL AS pf_number,cli_hrms_id AS hrms_id,'CLI' AS designation_name FROM div_cli_master WHERE cli_id=? AND is_active=1`,[id(ref.source_id)]);
    }else if(ref.source==='manual_tm'&&s.origin==='centre'){
        [[p]]=await c.query(`SELECT t.*,t.trainee_id AS source_id,'Train Manager' AS designation_name FROM div_training_trainees t
            JOIN div_training_trainee_centers m ON m.trainee_id=t.trainee_id WHERE t.trainee_id=? AND t.source='manual_tm' AND m.training_center_id=?`,[id(ref.source_id),s.center]);
    }else throw error(403,'This trainee source is not permitted');
    if(!p)throw error(404,'Active trainee record not found');
    if(s.origin==='lobby'&&p.lobby!==s.office)throw error(403,'Trainee belongs to another lobby');
    p.source=ref.source;
    if(!p.trainee_id){
        const field=p.source==='staff'?'staff_hrms_id':'cli_id';
        const [[existing]]=await c.query(`SELECT trainee_id FROM div_training_trainees WHERE ${field}=?`,[p.source_id]);
        p.trainee_id=existing?.trainee_id;
        if(!p.trainee_id&&create){
            const [insert]=await c.query(`INSERT INTO div_training_trainees(source,staff_hrms_id,cli_id,name,cms_id,lobby,pf_number,hrms_id,created_by)
                VALUES(?,?,?,?,?,?,?,?,?)`,[p.source,p.staff_hrms_id||null,p.cli_id||null,p.name,p.cms_id,p.lobby,p.pf_number,p.hrms_id,actor(req).username]);p.trainee_id=insert.insertId;
        }
    }
    if(create)await c.query(`INSERT INTO div_training_trainee_centers(trainee_id,training_center_id,registered_by)
        SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM div_training_trainee_centers WHERE trainee_id=? AND training_center_id=?)`,[p.trainee_id,s.center,actor(req).username,p.trainee_id,s.center]);
    p.warning=warning(p,r);p.history=await history(c,p,r);
    return p;
}
async function submit(req) {
    const b=req.body,u=actor(req),s=scope(req);
    if(!b||!Array.isArray(b.trainees)||!b.trainees.length||b.trainees.length>100)throw error(400,'Select between 1 and 100 trainees');
    return transaction(req,async c=>{
        let old=null;
        if(b.letter_id){old=await read(c,req,b.letter_id,true);mayEdit(req,old.letter);}
        if(old&&id(b.revision)!==old.letter.revision)throw error(409,'Letter changed. Reload before saving.');
        if(old&&['completed','cancelled','in_progress'].includes(old.letter.workflow_status))throw error(409,'Letter is locked');
        if(old){s.origin=old.letter.origin;s.office=old.letter.office_code;s.center=old.letter.training_center_id;}
        if(!s.center){const [[centre]]=await c.query("SELECT center_id FROM div_training_centers WHERE center_code='MTC_CLA' AND is_active=1");if(!centre)throw error(409,'MTC CLA missing');s.center=centre.center_id;}
        const r=await course(c,b.rule_id,s.center,!old||Number(b.rule_id)!==old.letter.rule_id);
        if(!s.office)s.office=r.center_code;
        const header={letter_no:text(b.letter_no,50,true),letter_date:date(b.letter_date),training_date:date(b.training_date),requirements_text:text(b.requirements_text,255),office_code:s.office,rule_id:r.rule_id};
        if(r.course_code==='AUTOMATIC'){
            const [[holiday]]=await c.query('SELECT 1 AS yes FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?',[s.center,header.training_date]);
            if(parseDate(header.training_date).getUTCDay()===0||holiday)throw error(400,'Automatic nominations cannot start on Sundays or centre holidays');
        }
        const active=old?old.nominees.filter(n=>n.decision!=='withdrawn'):[];
        const accepted=active.filter(n=>n.decision==='accepted');
        if(accepted.length){
            const previous=old.snapshot.header;
            if(Object.keys(header).some(k=>header[k]!==previous[k]))throw error(409,'Letter wording, course and dates are locked after acceptance');
        }
        const people=[];const keys=new Set();
        for(const ref of b.trainees){
            const key=ref.source+':'+String(ref.source_id);if(keys.has(key))throw error(400,'Duplicate trainee in letter');keys.add(key);
            const locked=accepted.length?active.find(n=>['accepted','pending'].includes(n.decision)&&n.identity_snapshot.source===ref.source&&String(n.identity_snapshot.source_id)===String(ref.source_id)):null;
            people.push(locked?locked.identity_snapshot:await person(c,req,ref,s,r,true));
        }
        if(accepted.length){
            for(const n of active.filter(n=>['accepted','pending'].includes(n.decision)))if(!people.some(p=>p.trainee_id===n.trainee_id))throw error(409,'Accepted and pending nominees cannot be removed; only returned nominees can be corrected');
            const removed=active.filter(n=>n.decision==='returned'&&!people.some(p=>p.trainee_id===n.trainee_id)).length;
            const added=people.filter(p=>!active.some(n=>n.trainee_id===p.trainee_id)).length;
            if(added>removed)throw error(409,'Only returned nominee places can be replaced after acceptance');
        }
        const [[sameNumber]]=await c.query('SELECT id FROM div_training_letters WHERE office_code=? AND letter_no=? AND id<>? LIMIT 1',[s.office,header.letter_no,old?.letter.id||0]);
        if(sameNumber)throw error(409,'This letter number is already used. Choose another number or open the existing letter.');
        const office=offices[s.office]||{label:s.origin==='centre'?r.center_name:s.office,officeHeader:s.origin==='centre'?'MOTORMEN TRAINING CENTRE\nKURLA (CLA)':s.office,signingDesignation:s.origin==='centre'?'Training Centre':'',signingDesignationHindi:'',signingPlace:s.origin==='centre'?'Kurla (CLA)':s.office,ccText:''};
        const nameLabel=r.course_code.startsWith('TM_')?'Train Manager Name':r.course_code==='CLI_CONVERSION'?'CLI Name':r.course_code.startsWith('LPS_')?'Loco Pilot Name':'Motorman Name';
        const body=`The following trainees from ${office.label} are directed to attend ${r.course_name} at Motormen Training Centre, CLA ${r.working_days===1?'on':'from'} ${header.training_date} at ${r.report_time.slice(0,5)} Hrs.`;
        const snapshot={header,office,course_name:r.course_name,name_label:nameLabel,subject:r.course_name.toUpperCase()+' AT MTC CLA',body,report_time:r.report_time,addressee:'The Chief Loco Inspector,\nMotormen Training Centre, Kurla (CLA)',trainees:people,footer:'Please report their arrival.'};
        let letterId=old?.letter.id;
        if(!letterId){
            const [insert]=await c.query(`INSERT INTO div_training_letters(letter_no,letter_date,office_code,course_type,training_date,report_time,subject_text,body_text,requirements_text,total_staff,status,training_center_id,created_by)
                VALUES(?,?,?,?,?,?,?,?,?,?,'draft',?,?)`,[header.letter_no,header.letter_date,s.office,r.legacy_course_type||r.course_code,header.training_date,r.report_time,snapshot.subject,body,header.requirements_text,people.length,s.center,u.username]);letterId=insert.insertId;
            await c.query(`INSERT INTO div_training_letter_workflows(letter_id,training_center_id,rule_id,origin,workflow_status,updated_by)
                VALUES(?,?,?,?,'submitted',?)`,[letterId,s.center,r.rule_id,s.origin,u.username]);
        }else{
            await c.query(`UPDATE div_training_letters SET letter_no=?,letter_date=?,training_date=?,course_type=?,report_time=?,subject_text=?,body_text=?,requirements_text=?,total_staff=? WHERE id=?`,[header.letter_no,header.letter_date,header.training_date,r.legacy_course_type||r.course_code,r.report_time,snapshot.subject,body,header.requirements_text,people.length,letterId]);
            await c.query('UPDATE div_training_letter_workflows SET rule_id=?,revision=revision+1,updated_by=? WHERE letter_id=?',[r.rule_id,u.username,letterId]);
        }
        // Use monotonic serials so an accepted nominee's serial never changes after replacements.
        let serial=Math.max(0,...(old?.nominees||[]).map(n=>n.sr_no));
        people.forEach(p=>{const existing=old?.nominees.find(n=>n.trainee_id===p.trainee_id);p.sr_no=existing?.sr_no||++serial;});
        people.sort((a,b)=>a.sr_no-b.sr_no);
        const [[version]]=await c.query('SELECT COALESCE(MAX(version_no),0)+1 AS n FROM div_training_letter_versions WHERE letter_id=?',[letterId]);
        const [v]=await c.query('INSERT INTO div_training_letter_versions(letter_id,version_no,snapshot,submitted_by) VALUES(?,?,?,?)',[letterId,version.n,JSON.stringify(snapshot),u.username]);
        for(const n of active)if(!people.some(p=>p.trainee_id===n.trainee_id))await c.query("UPDATE div_training_nominees SET decision='withdrawn',decision_reason='Removed on resubmission',decided_by=?,decided_at=NOW() WHERE nominee_id=?",[u.username,n.nominee_id]);
        for(const p of people){
            const n=old?.nominees.find(n=>n.trainee_id===p.trainee_id);
            if(n&&accepted.length&&['accepted','pending'].includes(n.decision))continue;
            if(n)await c.query("UPDATE div_training_nominees SET version_id=?,identity_snapshot=?,decision='pending',decision_reason=NULL,decided_by=NULL,decided_at=NULL WHERE nominee_id=?",[v.insertId,JSON.stringify(p),n.nominee_id]);
            else await c.query('INSERT INTO div_training_nominees(letter_id,trainee_id,version_id,sr_no,identity_snapshot) VALUES(?,?,?,?,?)',[letterId,p.trainee_id,v.insertId,p.sr_no,JSON.stringify(p)]);
        }
        const status=accepted.length?(accepted.length===people.length?'accepted':'partly_accepted'):'submitted';
        await c.query('UPDATE div_training_letter_workflows SET workflow_status=? WHERE letter_id=?',[status,letterId]);
        await audit(c,req,{id:letterId,training_center_id:s.center},old?'resubmit':'submit',old?.snapshot||null,snapshot,old?'Letter revised and resubmitted':'Letter submitted');
        return read(c,req,letterId);
    });
}
async function decide(req) {
    const u=actor(req),b=req.body;if(u.div_role==='office_hr')throw error(403,'Centre decision required');
    if(!b||!Array.isArray(b.decisions)||!b.decisions.length||b.decisions.length>100)throw error(400,'Select nominees for a decision');
    return transaction(req,async c=>{
        const old=await read(c,req,req.params.id,true),l=old.letter;
        const s=scope(req);if(s.origin!=='centre'||s.center!==l.training_center_id)throw error(403,'Select the letter centre');
        if(id(b.revision)!==l.revision)throw error(409,'Letter changed. Reload before deciding.');
        if(['in_progress','completed','cancelled'].includes(l.workflow_status))throw error(409,'Letter is locked');
        const seen=new Set();
        for(const d of b.decisions){
            const nomineeId=id(d.nominee_id);if(seen.has(nomineeId))throw error(400,'Duplicate decision');seen.add(nomineeId);
            const n=old.nominees.find(n=>n.nominee_id===nomineeId);
            if(!n||n.decision!=='pending')throw error(409,'Only pending nominees in this letter can be decided');
            if(!['accepted','returned'].includes(d.decision))throw error(400,'Choose accepted or returned');
            const reason=text(d.reason,1000,d.decision==='returned');
            await c.query('UPDATE div_training_nominees SET decision=?,decision_reason=?,decided_by=?,decided_at=NOW() WHERE nominee_id=?',[d.decision,reason||null,u.username,nomineeId]);
        }
        const [states]=await c.query("SELECT decision FROM div_training_nominees WHERE letter_id=? AND decision<>'withdrawn'",[l.id]);
        const accepted=states.filter(n=>n.decision==='accepted').length;
        const status=accepted===states.length?'accepted':accepted?'partly_accepted':states.some(n=>n.decision==='returned')?'returned':'submitted';
        await c.query('UPDATE div_training_letter_workflows SET workflow_status=?,revision=revision+1,updated_by=? WHERE letter_id=?',[status,u.username,l.id]);
        await audit(c,req,l,'centre_decision',old.nominees,b.decisions,'Centre acceptance/return decision');
        return read(c,req,l.id);
    });
}
module.exports={actor,scope,officeOf,mayRead,mayEdit,error,id,text,date,day,json,read,course,person,submit,decide,offices};
