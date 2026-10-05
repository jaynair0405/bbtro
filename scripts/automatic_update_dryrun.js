// READ-ONLY dry run: match ONE DAY AUTOMATIC TRG docx data to div_staff_master by PF.
// Usage (from bbtro folder):  node scripts/automatic_update_dryrun.js
require('dotenv').config();
const fs = require('fs'), path = require('path');
const mysql = require('mysql2/promise');
const dir = path.join(__dirname, '..', 'data', 'automatic_update');
const items = JSON.parse(fs.readFileSync(path.join(dir, 'automatic_latest_by_pf.json'), 'utf8'));
const nz = p => String(p || '').trim().toUpperCase().replace(/^0+/, '');
(async () => {
  const c = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const [staff] = await c.query('SELECT hrms_id, name, pf_number, current_office_code, status FROM div_staff_master');
  const [rec] = await c.query('SELECT staff_hrms_id, MAX(done_date) AS last_done FROM div_training_records WHERE training_id = 5 GROUP BY staff_hrms_id');
  const lastDone = new Map(rec.map(r => [r.staff_hrms_id, r.last_done && r.last_done.toISOString ? r.last_done.toLocaleDateString('en-CA') : r.last_done]));
  const idx = new Map();
  for (const s of staff) { const k = nz(s.pf_number); if (!k) continue; (idx.get(k) || idx.set(k, []).get(k)).push(s); }
  const out = { insert: [], skip_not_later: [], unmatched: [], ambiguous: [], blank_pf: [] };
  for (const it of items) {
    if (!it.pf) { out.blank_pf.push(it); continue; }
    const m = idx.get(nz(it.pf)) || [];
    if (m.length === 0) { out.unmatched.push({ pf: it.pf, date: it.latest_date, names: it.names_on_latest }); continue; }
    if (m.length > 1 || it.names_on_latest.length > 1) { out.ambiguous.push({ pf: it.pf, date: it.latest_date, docx_names: it.names_on_latest, db: m.map(s => ({ hrms_id: s.hrms_id, name: s.name, pf: s.pf_number, office: s.current_office_code, status: s.status })) }); continue; }
    const s = m[0], ld = lastDone.get(s.hrms_id);
    const row = { pf: it.pf, hrms_id: s.hrms_id, db_name: s.name, docx_name: it.names_on_latest[0], date: it.latest_date, existing_last_done: ld || null };
    if (ld && ld >= it.latest_date) out.skip_not_later.push(row); else out.insert.push(row);
  }
  fs.writeFileSync(path.join(dir, 'dryrun_report.json'), JSON.stringify(out, null, 1));
  console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));
  console.log('Report written: data/automatic_update/dryrun_report.json');
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
