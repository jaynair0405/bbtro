'use strict';
const courses = require('./trainingCentreCourses');
const targets = [
    ['MM_REFRESHER','Motorman Refresher','MMPRC'], ['AUTOMATIC','Automatic','AUTOMATIC'],
    ['MEMU_REFRESHER','MEMU Refresher','MEMU'], ['TM_REFRESHER','Train Manager Refresher',null],
    ['LPS_REFRESHER','LPS Refresher',null]
];
async function seedCourses(conn) {
    const [[centre]] = await conn.query("SELECT center_id FROM div_training_centers WHERE center_code='MTC_CLA' AND is_active=1");
    if (!centre) throw new Error('Active MTC_CLA centre missing');
    for (const [code,name,legacy] of targets) {
        let trainingId = null;
        if (legacy) {
            const [[type]] = await conn.query('SELECT training_id FROM div_training_types WHERE training_code=?',[legacy]);
            if (!type) throw new Error('Training type missing: '+legacy);
            trainingId = type.training_id;
        }
        const [[existing]] = await conn.query('SELECT * FROM div_training_renewal_targets WHERE target_code=?',[code]);
        if (existing && existing.legacy_training_id !== trainingId) throw new Error('Renewal mapping differs: '+code);
        if (!existing) await conn.query('INSERT INTO div_training_renewal_targets(target_code,target_name,legacy_training_id) VALUES(?,?,?)',[code,name,trainingId]);
    }
    for (const course of courses) {
        let [[row]] = await conn.query('SELECT * FROM div_training_courses WHERE course_code=?',[course.code]);
        if (!row) {
            const [insert] = await conn.query('INSERT INTO div_training_courses(course_code,course_name,legacy_course_type) VALUES(?,?,?)',[course.code,course.name,course.legacy||null]);
            row = {course_id:insert.insertId};
        }
        let [[rule]] = await conn.query('SELECT * FROM div_training_course_rules WHERE course_id=? AND version_no=1',[row.course_id]);
        if (rule && (rule.working_days !== course.days || rule.subsequent_handling_days !== (course.handling||null) || rule.eligibility_notes !== course.eligibility)) throw new Error('Initial course rule differs: '+course.code);
        if (!rule) {
            const [insert] = await conn.query(`INSERT INTO div_training_course_rules(course_id,version_no,effective_from,working_days,subsequent_handling_days,eligibility_notes,syllabus_details,created_by)
                VALUES(?,1,'2026-09-15',?,?,?,?,'setup:2026-09-15')`,[row.course_id,course.days,course.handling||null,course.eligibility,JSON.stringify(course.syllabus||{})]);
            rule = {rule_id:insert.insertId};
        }
        const [actual] = await conn.query(`SELECT t.target_code,r.validity_months FROM div_training_rule_renewals r JOIN div_training_renewal_targets t ON t.target_id=r.target_id WHERE r.rule_id=?`,[rule.rule_id]);
        const expected = JSON.stringify([...course.renewals].sort());
        if (actual.length && JSON.stringify(actual.map(r=>[r.target_code,r.validity_months]).sort()) !== expected) throw new Error('Initial renewals differ: '+course.code);
        if (!actual.length) for (const [target,months] of course.renewals) await conn.query(`INSERT INTO div_training_rule_renewals(rule_id,target_id,validity_months)
            SELECT ?,target_id,? FROM div_training_renewal_targets WHERE target_code=?`,[rule.rule_id,months,target]);
        await conn.query(`INSERT INTO div_training_course_offerings(training_center_id,rule_id,report_time,advance_planning)
            SELECT ?,?,'09:30:00',? WHERE NOT EXISTS(SELECT 1 FROM div_training_course_offerings WHERE training_center_id=? AND rule_id=?)`,
            [centre.center_id,rule.rule_id,!!course.planning,centre.center_id,rule.rule_id]);
    }
    return {centreId:centre.center_id,courses:courses.length,renewalTargets:targets.length};
}
module.exports = {seedCourses};
