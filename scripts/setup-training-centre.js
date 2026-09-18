#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const e=require('dotenv').config({path:path.join(root,'.env'),quiet:true}).parsed;
const mysql=require('mysql2/promise');
const {seedCourses}=require('../lib/trainingCentreSetup');
async function run(){
    if(process.argv[2]!=='--apply') throw Error('Use --apply to set up local registration and MTC CLA courses');
    if(!['localhost','127.0.0.1','::1'].includes(e.DB_HOST)||e.DB_NAME!=='bbtro') throw Error('Only local bbtro is permitted');
    const c=await mysql.createConnection({host:e.DB_HOST,port:Number(e.DB_PORT||3306),user:e.DB_USER,password:e.DB_PASSWORD,database:e.DB_NAME});
    let locked=false;
    try {
        const [[lock]]=await c.query("SELECT GET_LOCK('bbtro.training_centre_setup',5) AS ok");
        if(lock.ok!==1)throw Error('Setup lock unavailable');locked=true;
        const [tables]=await c.query("SHOW TABLES LIKE 'div_training_trainee_centers'");
        if(!tables.length)await c.query(fs.readFileSync(path.join(root,'sql/2026-09-15_training_centre_registry.sql'),'utf8'));
        const [[ddl]]=await c.query('SHOW CREATE TABLE div_training_trainee_centers');
        if(!ddl['Create Table'].includes('fk_trg_register_trainee')||!ddl['Create Table'].includes('fk_trg_register_center'))throw Error('Registry membership schema differs');
        const protectedTables=['div_training_records','div_training_letters','div_training_letter_staff','div_staff_master','div_cli_master','holidays_list'];
        async function fingerprint(){const out={};for(const t of protectedTables){const [rows]=await c.query('SELECT * FROM '+t);out[t]={rows:rows.length,sha256:crypto.createHash('sha256').update(rows.map(r=>JSON.stringify(r)).sort().join('\n')).digest('hex')};}return out;}
        const before=await fingerprint();
        await c.beginTransaction();
        const result=await seedCourses(c);
        const after=await fingerprint();
        if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Existing data changed during setup');
        await c.commit();
        fs.writeFileSync(path.join(root,'docs/TRAINING_CENTRE_SETUP_RESULT.json'),JSON.stringify({appliedAt:new Date().toISOString(),...result,legacyUnchanged:true,protectedTables:before},null,2)+'\n');
        console.log(JSON.stringify({...result,legacyUnchanged:true}));
    } catch(error){await c.rollback();throw error;}
    finally{if(locked)await c.query("SELECT RELEASE_LOCK('bbtro.training_centre_setup')");await c.end();}
}
run().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
