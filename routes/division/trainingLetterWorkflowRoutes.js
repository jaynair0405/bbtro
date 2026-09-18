'use strict';
const router=require('express').Router();
const w=require('../../lib/trainingLetterWorkflow');
const wrap=fn=>async(req,res)=>{try{await fn(req,res);}catch(e){if(!e.status)console.error('Training letter workflow:',e.code||e.message);res.status(e.status||500).json({error:e.status?e.message:'Unable to process letter'});}};
router.use((req,res,next)=>{try{w.actor(req);next();}catch(e){res.status(e.status).json({error:e.message});}});
router.get('/config',wrap(async(req,res)=>{
    const s=w.scope(req),pool=req.app.locals.pool;
    const [[centre]]=await pool.query(`SELECT * FROM div_training_centers WHERE ${s.center?'center_id=?':"center_code='MTC_CLA'"} AND is_active=1`,s.center?[s.center]:[]);
    if(!centre)throw w.error(404,'Centre not found');
    const [courses]=await pool.query(`SELECT c.course_code,c.course_name,c.legacy_course_type,r.rule_id,r.working_days,r.eligibility_notes,o.report_time,o.requirements_text
        FROM div_training_courses c JOIN div_training_course_rules r ON r.course_id=c.course_id JOIN div_training_course_offerings o ON o.rule_id=r.rule_id
        WHERE o.training_center_id=? AND o.is_active=1 AND c.is_active=1 ORDER BY c.course_id`,[centre.center_id]);
    const office=s.office||centre.center_code;
    const options=Object.entries(w.offices).map(([code,config])=>({code,...config}));
    if(!options.some(o=>o.code===office))options.push({code:office,label:s.origin==='centre'?centre.center_name:office,officeHeader:office});
    const [[number]]=await pool.query('SELECT COALESCE(MAX(id),0)+1 AS n FROM div_training_letters');
    res.json({origin:s.origin,office_code:office,center_id:centre.center_id,centre,offices:options,courses,user:{role:w.actor(req).div_role},suggested_number:`${s.origin==='centre'?centre.center_code:(w.offices[office]?.letterNoPrefix||office)}/${new Date().getFullYear()}/${number.n}`});
}));
router.get('/lookup',wrap(async(req,res)=>{
    const s=w.scope(req),pool=req.app.locals.pool,q=w.text(req.query.q,100,true),source=req.query.source;
    if(q.length<2)throw w.error(400,'Enter at least two characters');
    if(!s.center){const [[c]]=await pool.query("SELECT center_id FROM div_training_centers WHERE center_code='MTC_CLA'");s.center=c?.center_id;}
    const r=await w.course(pool,req.query.rule_id,s.center);
    const pattern='%'+q.replace(/[!%_]/g,'!$&')+'%';let candidates;
    if(source==='staff'){
        [candidates]=await pool.query(`SELECT hrms_id AS source_id FROM div_staff_master WHERE status='Active'
            AND (name LIKE ? ESCAPE '!' OR current_cms_id LIKE ? ESCAPE '!' OR hrms_id LIKE ? ESCAPE '!')
            ${s.origin==='lobby'?'AND current_office_code=?':''} ORDER BY name LIMIT 20`,[pattern,pattern,pattern,...(s.origin==='lobby'?[s.office]:[])]);
    }else if(source==='cli'){
        [candidates]=await pool.query(`SELECT cli_id AS source_id FROM div_cli_master WHERE is_active=1
            AND (cli_name LIKE ? ESCAPE '!' OR cmsid LIKE ? ESCAPE '!' OR cli_hrms_id LIKE ? ESCAPE '!')
            ${s.origin==='lobby'?'AND current_office_code=?':''} ORDER BY cli_name LIMIT 20`,[pattern,pattern,pattern,...(s.origin==='lobby'?[s.office]:[])]);
    }else if(source==='manual_tm'&&s.origin==='centre'){
        [candidates]=await pool.query(`SELECT t.trainee_id AS source_id FROM div_training_trainees t JOIN div_training_trainee_centers m ON m.trainee_id=t.trainee_id
            WHERE t.source='manual_tm' AND m.training_center_id=? AND (t.name LIKE ? ESCAPE '!' OR t.cms_id LIKE ? ESCAPE '!' OR t.pf_number LIKE ? ESCAPE '!') ORDER BY t.name LIMIT 20`,[s.center,pattern,pattern,pattern]);
    }else throw w.error(403,'Select an allowed trainee source');
    const data=[];for(const ref of candidates)data.push(await w.person(pool,req,{source,...ref},s,r,false));
    res.json({data});
}));
router.get('/',wrap(async(req,res)=>{
    const s=w.scope(req);
    const [data]=await req.app.locals.pool.query(`SELECT l.id,l.letter_no,l.letter_date,l.training_date,l.office_code,l.total_staff,l.course_type,
        COALESCE(w.workflow_status,l.status) AS workflow_status,w.revision,w.origin,w.rule_id,
        (SELECT GROUP_CONCAT(JSON_UNQUOTE(JSON_EXTRACT(n.identity_snapshot,'$.name')) ORDER BY n.sr_no SEPARATOR ', ') FROM div_training_nominees n WHERE n.letter_id=l.id AND n.decision<>'withdrawn') AS names
        FROM div_training_letters l LEFT JOIN div_training_letter_workflows w ON w.letter_id=l.id
        WHERE ${s.origin==='centre'?'l.training_center_id=? AND w.letter_id IS NOT NULL':"l.office_code=? AND w.origin='lobby'"}
        ORDER BY l.id DESC LIMIT 100`,[s.origin==='centre'?s.center:s.office]);res.json({data});
}));
router.get('/available-plans',wrap(async(req,res)=>{
    const s=w.scope(req),pool=req.app.locals.pool;
    let centre=s.center;
    if(!centre){const [[row]]=await pool.query("SELECT center_id FROM div_training_centers WHERE center_code='MTC_CLA' AND is_active=1");centre=row?.center_id;}
    if(!centre)throw w.error(404,'Centre not found');
    const params=[s.origin==='lobby'?s.office:'',centre];
    const [data]=await pool.query(`SELECT cal.id,cal.batch_code,DATE_FORMAT(cal.from_date,'%Y-%m-%d') from_date,
        DATE_FORMAT(bs.expected_end_date,'%Y-%m-%d') expected_end_date,cal.status,bs.capacity,c.course_code,c.course_name,
        own.suggested_seats,(SELECT COALESCE(SUM(a.suggested_seats),0) FROM div_training_batch_allocations a WHERE a.calendar_id=cal.id) allocated_seats
        FROM div_training_calendar cal JOIN div_training_batch_settings bs ON bs.calendar_id=cal.id
        JOIN div_training_course_rules r ON r.rule_id=bs.rule_id JOIN div_training_courses c ON c.course_id=r.course_id
        LEFT JOIN div_training_batch_allocations own ON own.calendar_id=cal.id AND own.lobby=?
        WHERE bs.training_center_id=? AND cal.status IN ('planned','ongoing') ORDER BY cal.from_date,cal.id`,params);
    res.json({data,note:'Lobby allocations are planning suggestions; the centre may accept nominees flexibly.'});
}));
router.get('/:id',wrap(async(req,res)=>{
    const data=await w.read(req.app.locals.pool,req,req.params.id);
    if(req.query.version){
        const [[version]]=await req.app.locals.pool.query('SELECT snapshot FROM div_training_letter_versions WHERE letter_id=? AND version_no=?',[data.letter.id,w.id(req.query.version)]);
        if(!version)throw w.error(404,'Letter version not found');data.snapshot=w.json(version.snapshot);
    }
    res.json(data);
}));
router.post('/',wrap(async(req,res)=>res.json(await w.submit(req))));
router.post('/:id/decisions',wrap(async(req,res)=>res.json(await w.decide(req))));
module.exports=router;
