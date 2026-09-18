'use strict';
const router = require('express').Router();
const {parseDate, expectedEnd, nextDue} = require('../../lib/trainingCentreDates');
const fail = (status, message, details) => Object.assign(new Error(message), {status, details});
const positiveId = value => {
    if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) throw fail(400, 'Invalid identifier');
    return Number(value);
};
function field(value, name, max, required = false) {
    if (value == null && !required) return null;
    if (typeof value !== 'string') throw fail(400, name + ' must be text');
    const clean = value.trim().replace(/\s+/g, ' ');
    if ((required && !clean) || clean.length > max) throw fail(400, name + ' is required and must be at most ' + max + ' characters');
    return clean || null;
}
function date(value) { try { parseDate(value); return value; } catch (e) { throw fail(400, e.message); } }
const like = value => '%' + value.replace(/[!%_]/g, '!$&') + '%';
function endpoint(fn) {
    return async (req, res, next) => {
        try { await fn(req, res, next); }
        catch (error) {
            if (!error.status) console.error('Training centre management:', error.code || error.message);
            res.status(error.status || 500).json({error: error.status ? error.message : 'Unable to complete this request', ...(error.details || {})});
        }
    };
}
router.use(endpoint(async (req, res, next) => {
    const user = req.session?.user;
    if (!user || user.realm !== 'division') throw fail(401, 'Sign in to the division portal');
    if (!['trgcentre_admin','division_admin'].includes(user.div_role)) throw fail(403, 'Training centre access required');
    if (['POST','PATCH','DELETE'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) throw fail(400, 'A JSON object is required');
    const centreId = positiveId(user.div_role === 'division_admin' ? req.query.center_id : user.training_center_id);
    if (user.div_role !== 'division_admin' && req.query.center_id != null && positiveId(req.query.center_id) !== centreId) throw fail(403, 'Another centre cannot be selected');
    if (req.body?.center_id != null && positiveId(req.body.center_id) !== centreId) throw fail(403, 'Centre mismatch');
    const [[centre]] = await req.app.locals.pool.query("SELECT center_id FROM div_training_centers WHERE center_id=? AND is_active=1 AND center_type IN ('MTC','DTC')", [centreId]);
    if (!centre) throw fail(403, 'Active training centre required');
    req.trainingCentreId = centreId;
    req.trainingActor = user.username;
    next();
}));
async function write(req, fn) {
    const conn = await req.app.locals.pool.getConnection();
    let locked = false;
    try {
        const [[lock]] = await conn.query("SELECT GET_LOCK('bbtro.training_centre_manage',5) AS ok");
        if (lock.ok !== 1) throw fail(409, 'Another update is in progress. Please retry.');
        locked = true;
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (e) { await conn.rollback(); throw e; }
    finally {
        if (locked) await conn.query("SELECT RELEASE_LOCK('bbtro.training_centre_manage')");
        conn.release();
    }
}
async function audit(conn, req, type, id, action, reason, before, after) {
    await conn.query(`INSERT INTO div_training_audit_events(training_center_id,entity_type,entity_id,action,reason,before_data,after_data,actor)
        VALUES(?,?,?,?,?,?,?,?)`, [req.trainingCentreId,type,String(id),action,reason,before == null ? null : JSON.stringify(before),after == null ? null : JSON.stringify(after),req.trainingActor]);
}
async function link(conn, req, traineeId) {
    const [result] = await conn.query(`INSERT INTO div_training_trainee_centers(trainee_id,training_center_id,registered_by)
        SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM div_training_trainee_centers WHERE trainee_id=? AND training_center_id=?)`,
        [traineeId,req.trainingCentreId,req.trainingActor,traineeId,req.trainingCentreId]);
    if (result.affectedRows) await audit(conn,req,'trainee',traineeId,'register','Registered in centre trainee register',null,{trainee_id:traineeId});
    return {trainee_id:traineeId,already_registered:!result.affectedRows};
}
router.get('/lookup', endpoint(async (req, res) => {
    const source = req.query.source;
    if (!['staff','cli'].includes(source)) throw fail(400, 'Select staff or CLI');
    const search = field(req.query.q,'Search',100,true);
    if (search.length < 2) throw fail(400, 'Enter at least two characters');
    let sql;
    if (source === 'staff') sql = `SELECT s.hrms_id AS source_id,s.name,s.current_cms_id AS cms_id,s.current_office_code AS lobby,s.pf_number,s.hrms_id,d.designation_name
        FROM div_staff_master s LEFT JOIN designations d ON d.id=s.designation_id
        WHERE s.status='Active' AND (s.name LIKE ? ESCAPE '!' OR s.current_cms_id LIKE ? ESCAPE '!' OR s.hrms_id LIKE ? ESCAPE '!' OR s.pf_number LIKE ? ESCAPE '!') ORDER BY s.name,s.hrms_id LIMIT 50`;
    else sql = `SELECT cli_id AS source_id,cli_name AS name,cmsid AS cms_id,current_office_code AS lobby,NULL AS pf_number,cli_hrms_id AS hrms_id,'CLI' AS designation_name
        FROM div_cli_master WHERE is_active=1 AND (cli_name LIKE ? ESCAPE '!' OR cmsid LIKE ? ESCAPE '!' OR cli_hrms_id LIKE ? ESCAPE '!' OR current_office_code LIKE ? ESCAPE '!') ORDER BY cli_name,cli_id LIMIT 50`;
    const [data] = await req.app.locals.pool.query(sql,Array(4).fill(like(search)));
    res.json({data,limit:50});
}));
router.get('/trainees', endpoint(async (req, res) => {
    const search = field(req.query.q || '', 'Search',100) || '';
    const page = positiveId(req.query.page || 1);
    if (page > 10000) throw fail(400,'Page is too large');
    const source = req.query.source || '';
    if (source && !['staff','cli','manual_tm'].includes(source)) throw fail(400,'Invalid trainee source');
    const select = `FROM div_training_trainees t JOIN div_training_trainee_centers m ON m.trainee_id=t.trainee_id
        LEFT JOIN div_staff_master s ON s.hrms_id=t.staff_hrms_id LEFT JOIN div_cli_master c ON c.cli_id=t.cli_id
        WHERE m.training_center_id=? AND (?='' OR t.source=?) AND
        (COALESCE(s.name,c.cli_name,t.name) LIKE ? ESCAPE '!' OR COALESCE(s.current_cms_id,c.cmsid,t.cms_id,'') LIKE ? ESCAPE '!'
         OR COALESCE(s.pf_number,t.pf_number,'') LIKE ? ESCAPE '!' OR COALESCE(s.hrms_id,c.cli_hrms_id,t.hrms_id,'') LIKE ? ESCAPE '!')`;
    const params = [req.trainingCentreId,source,source,...Array(4).fill(like(search))];
    const [data] = await req.app.locals.pool.query(`SELECT t.trainee_id,t.source,COALESCE(s.name,c.cli_name,t.name) AS name,
        COALESCE(s.current_cms_id,c.cmsid,t.cms_id) AS cms_id,COALESCE(s.current_office_code,c.current_office_code,t.lobby) AS lobby,
        COALESCE(s.pf_number,t.pf_number) AS pf_number,COALESCE(s.hrms_id,c.cli_hrms_id,t.hrms_id) AS hrms_id,m.registered_at ${select}
        ORDER BY m.registered_at DESC,t.trainee_id DESC LIMIT 50 OFFSET ?`,[...params,(page-1)*50]);
    const [[count]] = await req.app.locals.pool.query('SELECT COUNT(*) AS total '+select,params);
    res.json({data,total:count.total,page,page_size:50});
}));
router.post('/trainees', endpoint(async (req, res) => {
    const source = req.body.source;
    if (!['staff','cli','manual_tm'].includes(source)) throw fail(400,'Invalid trainee source');
    const result = await write(req,async conn => {
        let person, existing, staffId = null, cliId = null;
        if (source === 'manual_tm') {
            person = {name:field(req.body.name,'Name',100,true),cms_id:field(req.body.cms_id,'CMS ID',30,true),
                lobby:field(req.body.lobby,'Lobby',50,true),pf_number:field(req.body.pf_number,'PF number',30,true),hrms_id:field(req.body.hrms_id,'HRMS ID',20)};
            const [matches] = await conn.query("SELECT trainee_id,name,cms_id,lobby,pf_number,hrms_id FROM div_training_trainees WHERE source='manual_tm' AND (pf_number=? OR cms_id=?)",[person.pf_number,person.cms_id]);
            const same = matches.find(row => Object.keys(person).every(k => String(row[k]||'').toUpperCase() === String(person[k]||'').toUpperCase()));
            if (matches.length && (!same || matches.length !== 1)) throw fail(409,'A Train Manager with this CMS ID or PF number is already registered. Review and use the existing entry.',{matches});
            existing = same;
        } else if (source === 'staff') {
            staffId = field(req.body.source_id,'Staff reference',10,true);
            [[person]] = await conn.query(`SELECT name,current_cms_id AS cms_id,current_office_code AS lobby,pf_number,hrms_id FROM div_staff_master WHERE hrms_id=? AND status='Active'`,[staffId]);
            [[existing]] = await conn.query('SELECT trainee_id FROM div_training_trainees WHERE staff_hrms_id=?',[staffId]);
        } else {
            cliId = positiveId(req.body.source_id);
            [[person]] = await conn.query(`SELECT cli_name AS name,cmsid AS cms_id,current_office_code AS lobby,NULL AS pf_number,cli_hrms_id AS hrms_id FROM div_cli_master WHERE cli_id=? AND is_active=1`,[cliId]);
            [[existing]] = await conn.query('SELECT trainee_id FROM div_training_trainees WHERE cli_id=?',[cliId]);
        }
        if (!person) throw fail(404,'Active master record not found');
        let traineeId = existing?.trainee_id;
        if (!traineeId) {
            const [insert] = await conn.query(`INSERT INTO div_training_trainees(source,staff_hrms_id,cli_id,name,cms_id,lobby,pf_number,hrms_id,created_by)
                VALUES(?,?,?,?,?,?,?,?,?)`,[source,staffId,cliId,person.name,person.cms_id,person.lobby,person.pf_number,person.hrms_id,req.trainingActor]);
            traineeId = insert.insertId;
            await audit(conn,req,'trainee',traineeId,'create','Trainee registered',null,{source,...person});
        }
        return link(conn,req,traineeId);
    });
    res.status(result.already_registered ? 200 : 201).json(result);
}));
router.post('/trainees/link', endpoint(async (req,res) => {
    const traineeId = positiveId(req.body.trainee_id);
    const result = await write(req,async conn => {
        const [[person]] = await conn.query("SELECT trainee_id FROM div_training_trainees WHERE trainee_id=? AND source='manual_tm'",[traineeId]);
        if (!person) throw fail(404,'Train Manager entry not found');
        return link(conn,req,traineeId);
    });
    res.json(result);
}));
async function courseList(pool, centreId) {
    const [data] = await pool.query(`SELECT c.course_id,c.course_code,c.course_name,r.*,o.report_time,o.advance_planning,o.requirements_text
        FROM div_training_course_offerings o JOIN div_training_course_rules r ON r.rule_id=o.rule_id
        JOIN div_training_courses c ON c.course_id=r.course_id
        WHERE o.training_center_id=? AND o.is_active=1 AND c.is_active=1 ORDER BY c.course_id`,[centreId]);
    for (const course of data) {
        [course.renewals] = await pool.query(`SELECT t.target_name,t.target_code,r.validity_months FROM div_training_rule_renewals r
            JOIN div_training_renewal_targets t ON t.target_id=r.target_id WHERE r.rule_id=? ORDER BY t.target_id`,[course.rule_id]);
        [course.assessments] = await pool.query('SELECT * FROM div_training_assessment_definitions WHERE rule_id=? ORDER BY assessment_id',[course.rule_id]);
    }
    return data;
}
router.get('/courses', endpoint(async (req,res) => res.json({data:await courseList(req.app.locals.pool,req.trainingCentreId)})));
router.post('/courses/:ruleId/assessments', endpoint(async (req,res) => {
    const ruleId = positiveId(req.params.ruleId);
    const reason = field(req.body.reason,'Change reason',1000,true);
    if (!Array.isArray(req.body.assessments) || req.body.assessments.length > 12) throw fail(400,'Supply up to 12 assessment components');
    if (!req.body.assessments.length && req.body.no_assessment !== true) throw fail(400,'Add an assessment or explicitly select no assessment required');
    if (req.body.assessments.length && req.body.no_assessment === true) throw fail(400,'Remove assessments before selecting no assessment required');
    const assessments = req.body.assessments.map((a,i) => {
        if (!a || typeof a !== 'object' || Array.isArray(a)) throw fail(400, 'Each assessment must be an object');
        if (!['written','oral'].includes(a.component)) throw fail(400,'Assessment must be written or oral');
        if (typeof a.maximum_marks !== 'number' || typeof a.passing_marks !== 'number' || !Number.isFinite(a.maximum_marks) || !Number.isFinite(a.passing_marks) || a.maximum_marks <= 0 || a.maximum_marks > 999999.99 || a.passing_marks < 0 || a.passing_marks > a.maximum_marks || Math.abs(a.maximum_marks*100-Math.round(a.maximum_marks*100))>1e-6 || Math.abs(a.passing_marks*100-Math.round(a.passing_marks*100))>1e-6) throw fail(400,'Use valid maximum and passing marks with up to two decimal places');
        return {code:'COMPONENT_'+(i+1),name:field(a.name,'Assessment name',150,true),component:a.component,maximum_marks:a.maximum_marks,passing_marks:a.passing_marks};
    });
    const result = await write(req,async conn => {
        const [[old]] = await conn.query(`SELECT r.*,o.report_time,o.advance_planning,o.requirements_text FROM div_training_course_rules r
            JOIN div_training_course_offerings o ON o.rule_id=r.rule_id WHERE r.rule_id=? AND o.training_center_id=? AND o.is_active=1 FOR UPDATE`,[ruleId,req.trainingCentreId]);
        if (!old) throw fail(409,'This course configuration has changed or is not offered at your centre. Reload it.');
        const [[number]] = await conn.query('SELECT MAX(version_no)+1 AS next_version FROM div_training_course_rules WHERE course_id=?',[old.course_id]);
        const [insert] = await conn.query(`INSERT INTO div_training_course_rules(course_id,version_no,effective_from,working_days,subsequent_handling_days,eligibility_notes,syllabus_details,assessment_configured,created_by)
            VALUES(?,?,CURDATE(),?,?,?,?,1,?)`,[old.course_id,number.next_version,old.working_days,old.subsequent_handling_days,old.eligibility_notes,old.syllabus_details == null ? null : JSON.stringify(old.syllabus_details),req.trainingActor]);
        const newId = insert.insertId;
        await conn.query(`INSERT INTO div_training_rule_renewals(rule_id,target_id,validity_months) SELECT ?,target_id,validity_months FROM div_training_rule_renewals WHERE rule_id=?`,[newId,ruleId]);
        for (const a of assessments) await conn.query(`INSERT INTO div_training_assessment_definitions(rule_id,assessment_code,assessment_name,component,maximum_marks,passing_marks)
            VALUES(?,?,?,?,?,?)`,[newId,a.code,a.name,a.component,a.maximum_marks,a.passing_marks]);
        await conn.query('UPDATE div_training_course_offerings SET is_active=0 WHERE training_center_id=? AND rule_id=?',[req.trainingCentreId,ruleId]);
        await conn.query(`INSERT INTO div_training_course_offerings(training_center_id,rule_id,report_time,advance_planning,requirements_text)
            VALUES(?,?,?,?,?)`,[req.trainingCentreId,newId,old.report_time,old.advance_planning,old.requirements_text]);
        const [beforeAssessments] = await conn.query('SELECT * FROM div_training_assessment_definitions WHERE rule_id=?',[ruleId]);
        await audit(conn,req,'course_rule',newId,'configure_assessment',reason,{rule_id:ruleId,assessments:beforeAssessments},{rule_id:newId,assessments,no_assessment:!assessments.length});
        return {rule_id:newId};
    });
    res.status(201).json(result);
}));
router.get('/holidays', endpoint(async (req,res) => {
    const [data] = await req.app.locals.pool.query("SELECT DATE_FORMAT(holiday_date,'%Y-%m-%d') AS holiday_date,reason FROM div_training_center_holidays WHERE training_center_id=? ORDER BY holiday_date",[req.trainingCentreId]);
    res.json({data});
}));
router.post('/holidays', endpoint(async (req,res) => {
    const holiday = date(req.body.holiday_date), reason = field(req.body.reason,'Holiday reason',255,true);
    await write(req,async conn => {
        const [[old]] = await conn.query('SELECT * FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?',[req.trainingCentreId,holiday]);
        await conn.query(`INSERT INTO div_training_center_holidays(training_center_id,holiday_date,reason,created_by) VALUES(?,?,?,?)
            ON DUPLICATE KEY UPDATE reason=VALUES(reason)`,[req.trainingCentreId,holiday,reason,req.trainingActor]);
        await audit(conn,req,'holiday',holiday,old?'update':'create',reason,old||null,{holiday_date:holiday,reason});
    });
    res.json({success:true});
}));
router.delete('/holidays/:date', endpoint(async (req,res) => {
    const holiday = date(req.params.date), reason = field(req.body.reason,'Removal reason',255,true);
    await write(req,async conn => {
        const [[old]] = await conn.query('SELECT * FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?',[req.trainingCentreId,holiday]);
        if (!old) throw fail(404,'Holiday not found');
        await conn.query('DELETE FROM div_training_center_holidays WHERE training_center_id=? AND holiday_date=?',[req.trainingCentreId,holiday]);
        await audit(conn,req,'holiday',holiday,'remove',reason,old,null);
    });
    res.json({success:true});
}));
router.get('/courses/:ruleId/preview', endpoint(async (req,res) => {
    const ruleId=positiveId(req.params.ruleId),joining=date(req.query.joining_date);
    const course=(await courseList(req.app.locals.pool,req.trainingCentreId)).find(c=>c.rule_id===ruleId);
    if (!course) throw fail(404,'Course is not offered at this centre');
    const [holidays]=await req.app.locals.pool.query("SELECT DATE_FORMAT(holiday_date,'%Y-%m-%d') AS day FROM div_training_center_holidays WHERE training_center_id=?",[req.trainingCentreId]);
    if (course.course_code==='AUTOMATIC' && (parseDate(joining).getUTCDay()===0 || holidays.some(h=>h.day===joining))) throw fail(400,'One-Day Automatic cannot start on a Sunday or centre holiday');
    const end=expectedEnd(joining,course.working_days,holidays.map(h=>h.day));
    res.json({expected_completion:end,renewals:course.renewals.map(r=>({...r,due_date:nextDue(end,r.validity_months)})),note:'Estimate only. Actual renewal starts from centre-confirmed completion.'});
}));
module.exports=router;
