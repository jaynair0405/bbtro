// Build the Automatic (training_id 5) insert from the MTC KYN "ONE DAY AUTOMATIC TRG" letters.
// Input:  data/automatic_update/dryrun_report_prod.json  (from automatic_update_dryrun.js run on PROD)
//         + the hand-confirmed PF -> HRMS mappings below (resolved 2026-10-05 against HRMS).
// Output: data/automatic_update/not_in_master.csv      (follow-up list, always)
//         sql/2026-10-05_automatic_training_from_letters.sql + _UNDO.sql   (only with --sql)
// Usage:  node scripts/automatic_update_build.js [--sql]
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'data', 'automatic_update');
const R = JSON.parse(fs.readFileSync(path.join(dir, 'dryrun_report_prod.json'), 'utf8'));
const CENTER_ID = 2; // MTC_KYN

// Ambiguous PFs: one PF printed against two names. PF owner + the other person (HRMS-verified).
const AMBIGUOUS = {
  '201795790': ['LYMMCP', 'SDUPHT'],
  '210003228': ['CSGCGJ', 'PYYEDE'],
  '210943160': ['DJMJAW', 'FTEOXZ'],
};
// Letter PF had a typo; person confirmed in HRMS (groups A + B).
const PF_FIX = {
  '11035134': 'OYMAEB', '11048037': 'ARPSGR', '201872709': 'LLGBHZ', '201941472': 'CPNAZI',
  '201974984': 'MSDTTC', '202256710': 'NUDISO', '21094142': 'CYLPNB', '211035225': 'SLMFQY',
  '214584372': 'LSZKOU', '219488191': 'RMBXPL', '223211904': 'WNWPNP', '22749155': 'MGCTZS',
  '229515985': 'RQKRBT', '229800126': 'YXQYMW', '229803057': 'DGCPMN', '22980391': 'NKRCEF',
  '22980604': 'AJAQBT', '229808791': 'XDEIGK', '22981084': 'OYGFGR', '2298120419': 'QAIIKA',
  '229812309': 'WGZLBC', '229812771': 'IWTLRU', '229814991': 'KZBKGX', '229815421': 'NOKWOI',
  '229817293': 'AADHAC', '229911949': 'URBQJI', '4356263': 'PBXPCO', '50813882735': 'ACDKUH',
  '229812638': 'XWRETA', '229813051': 'XNSWRD',
};
// Letter entries with no PF, matched by name + lobby.
const BY_NAME = {
  'ANKUSH RUHELA': 'HREPBA', 'GAHLOT MEENA': 'GHAPHC', 'M.K.VERMA': 'LMQMOS',
  'RITESH KUMAR': 'IHOHCM', 'RAM NARESH YADAV': 'QDLEZR', 'RAMPAL VERMA': 'ODDDEM',
};
// Known to HRMS but not in div_staff_master.
const HRMS_NOT_IN_MASTER = {
  '210935370': 'NXYXQU', '229806412': 'YDQYGT', '229806422': 'WSCSOL', '229806438': 'SDYDKA',
  '229806507': 'FZWXOC', '229806508': 'ETBRCP', '229806512': 'MKTBZZ', '229806517': 'LYDIYQ',
  '229806525': 'DJAQGW', '229806532': 'XIMASJ', '229809199': 'MMYXQI', '229811328': 'CIHZTE',
  '229812533': 'XTSSAQ', '229813002': 'UUMJYK', '229813370': 'FBQDZI', '229813371': 'OXKJKP',
  '229814465': 'QPQGMZ', '229814795': 'DFBDPT', '229815205': 'HMHOPF', '229815509': 'QJRBSI',
  '229815890': 'OXOKUG', '229815975': 'GGKNWD', '229816089': 'JIAIWX', '229816779': 'LEJECG',
  '229817025': 'URLUFB', '229817129': 'AAAXIG', '829801639': 'YQCKOK', '30429801164': 'QXPGTE',
};
// Parked: user to confirm with MTC / lobby / CMS portal.
const PARKED = {
  '229810299': 'Kajal Rani: HRMS says EAMSHX, master has EAMSHY - fix via docs/STAFF_HRMS_ID_CORRECTION.md first',
  'JITENDRA KUMAR': 'TLKUXX or XCWMLY (both PNVL-ML)',
  'MAHENDRA KR MEENA': 'HSYNRB, PCBZNW or SXYPIM (all PNVL-ML)',
  'LAXMAN KUMAR': 'only WMYDYG, but he is KYN-ML not PNVL',
};

const want = new Map(); // hrms -> { date, src }
const add = (h, date, src) => { const o = want.get(h); if (!o || date > o.date) want.set(h, { date, src }); };
for (const r of R.insert) add(r.hrms_id, r.date, 'pf');
for (const a of R.ambiguous) for (const h of AMBIGUOUS[a.pf] || []) add(h, a.date, 'ambiguous');

const follow = [['reason', 'pf_on_letter', 'name_on_letter', 'letter_date', 'hrms_id', 'note']];
for (const u of R.unmatched) {
  const nm = u.names.join(' / ');
  if (PF_FIX[u.pf]) add(PF_FIX[u.pf], u.date, 'pf_fix');
  else if (HRMS_NOT_IN_MASTER[u.pf]) follow.push(['not_in_master', u.pf, nm, u.date, HRMS_NOT_IN_MASTER[u.pf], 'in HRMS, add via staff bulk import']);
  else if (PARKED[u.pf]) follow.push(['parked', u.pf, nm, u.date, '', PARKED[u.pf]]);
  else follow.push(['unknown_pf', u.pf, nm, u.date, '', 'PF not in master nor HRMS']);
}
for (const b of R.blank_pf) for (const e of b.entries) {
  if (BY_NAME[e.name]) add(BY_NAME[e.name], e.date, 'by_name');
  else if (PARKED[e.name]) follow.push(['parked', '', e.name, e.date, '', PARKED[e.name]]);
  else follow.push(['no_pf_not_in_master', '', e.name, e.date, '', `${e.des} ${e.lobby}`]);
}

const csv = follow.map(r => r.map(v => /[",]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n') + '\n';
fs.writeFileSync(path.join(dir, 'not_in_master.csv'), csv);
const bySrc = {}; for (const v of want.values()) bySrc[v.src] = (bySrc[v.src] || 0) + 1;
const byReason = {}; for (const r of follow.slice(1)) byReason[r[0]] = (byReason[r[0]] || 0) + 1;
console.log('to insert (before prod later-than check):', want.size, bySrc);
console.log('follow-up list:', follow.length - 1, byReason);

if (process.argv.includes('--sql')) {
  const base = path.join(__dirname, '..', 'sql', '2026-10-05_automatic_training_from_letters');
  const rows = [...want].sort(([a], [b]) => a.localeCompare(b));
  const ids = rows.map(([h]) => `'${h}'`).join(',');
  let s = `-- Automatic (training_id 5) from MTC KYN "ONE DAY AUTOMATIC TRG" letters (23.05.2026 onwards).
-- Generated by scripts/automatic_update_build.js. One row per staff = latest letter date.
-- due_date = done_date + 6 months - 1 day. A row is inserted ONLY if the staff member has no
-- Automatic record on or after that date, checked at run time, so re-running is a no-op.
-- Undo: 2026-10-05_automatic_training_from_letters_UNDO.sql
SET @tag = 'automatic_letters_2026-10-05';
`;
  for (const [h, { date }] of rows) s +=
`INSERT INTO div_training_records (staff_hrms_id, training_id, training_center_id, status, done_date, due_date, medical_fit, general_remarks)
SELECT '${h}', 5, ${CENTER_ID}, 'Completed', '${date}', DATE_SUB(DATE_ADD('${date}', INTERVAL 6 MONTH), INTERVAL 1 DAY), 1, @tag
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM div_training_records WHERE staff_hrms_id = '${h}' AND training_id = 5 AND done_date >= '${date}');
`;
  s += `SELECT COUNT(*) AS inserted FROM div_training_records WHERE general_remarks = @tag;\n`;
  fs.writeFileSync(base + '.sql', s);
  fs.writeFileSync(base + '_UNDO.sql',
`-- Undo 2026-10-05_automatic_training_from_letters.sql: removes exactly the rows it inserted.
DELETE FROM div_training_records
WHERE training_id = 5 AND general_remarks = 'automatic_letters_2026-10-05'
  AND staff_hrms_id IN (${ids});
`);
  console.log('written:', base + '.sql', '+ _UNDO.sql');
}
