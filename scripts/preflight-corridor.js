/**
 * Pre-flight a corridor master workbook BEFORE building/importing. Auto-detects
 * sheets (both naming styles; spaces≡hyphens) and reports, per signals sheet:
 *   - duplicate signal_number within a line (blocks import — unique key)
 *   - invalid signal_type / placement / signal_function (would fail DB enums)
 *   - direction mismatches, blank signal_number / line
 *   - station / NS / PSR anchors that don't resolve to a signal in the sheet
 *   - PSR line values (catch e.g. 'UP SE' where signals are 'UP NE')
 *   - terminal station headers with a blank anchor (append at end)
 *
 *   node scripts/preflight-corridor.js <master.xlsx>
 *
 * ALSO run a cross-section check separately (number+direction vs existing
 * div_signals) before importing a renamed/deduped master — an intra-sheet dedupe
 * can hide a DB-wide identity collision (see the CLA-TMBY/VVH lesson in
 * bbtro_signal_aws_master_plan.md).
 */
const XLSX = require('xlsx');
const [masterPath] = process.argv.slice(2);
if (!masterPath) { console.error('Usage: node scripts/preflight-corridor.js <master.xlsx>'); process.exit(1); }
const wb = XLSX.readFile(masterPath);
const J = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
const norm = (s) => String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[\/\-_.]/g, '');
const skey = (s) => String(s).toUpperCase().replace(/[-\s]+/g, ' ').trim();

const SIG = ['Automatic', 'Semi-Automatic', 'Manual', 'Gate', 'IBS', 'Repeater', 'Board', 'Other'];
const PLACE = ['Left', 'Right', 'Extreme Right', 'Extreme Left', 'Gantry', 'Unknown'];
const FUNC = ['Double Distant', 'Distant', 'Inner Distant', 'Home', 'Inner Home', 'Starter', 'Starter (Loop)', 'Advance Starter', 'Advanced Starter', 'IBS', 'IBS Distant', 'Gate Distant', 'Repeater', 'Other', 'Intermediate Starter'];

const aux = { STATIONS: {}, PSR: {}, NS: {} };
const sigSheets = [];
for (const name of wb.SheetNames) {
  const rows = J(name);
  if (!rows.length) continue;
  const cols = Object.keys(rows[0]);
  const m = name.match(/^(STATIONS|Stations|PSR|NS)\s+(.+)$/i);
  if (m && !cols.includes('signal_number')) aux[m[1].toUpperCase()][skey(m[2])] = rows;
  else if (cols.includes('signal_number')) sigSheets.push({ name, rows });
}

for (const { name, rows: sig } of sigSheets) {
  const dir = String(sig[0].direction || '').trim().toUpperCase();
  const st = aux.STATIONS[skey(name)] || [], ns = aux.NS[skey(name)] || [], psr = aux.PSR[skey(name)] || [];
  const names = new Set(sig.map((r) => norm(r.signal_number)));
  const lines = [...new Set(sig.map((r) => String(r.line).trim()))];
  console.log(`\n===== ${name} (dir ${dir}) ===== signals=${sig.length} lines=${JSON.stringify(lines)}`);

  const seen = {}, dups = [];
  sig.forEach((r) => { const k = norm(r.signal_number) + '|' + r.line; if (seen[k]) dups.push(r.signal_number + ' [' + r.line + ']'); seen[k] = 1; });
  console.log('  DUP (num+line):', dups.length ? dups.join(', ') : 'none');

  const bad = [];
  sig.forEach((r, i) => {
    const t = String(r.signal_type).trim(), p = String(r.placement).trim(), f = String(r.signal_function).trim();
    if (t && !SIG.includes(t)) bad.push(`r${i} type="${r.signal_type}"(${r.signal_number})`);
    if (p && !PLACE.includes(p)) bad.push(`r${i} place="${r.placement}"(${r.signal_number})`);
    if (f && !FUNC.includes(f)) bad.push(`r${i} func="${r.signal_function}"(${r.signal_number})`);
    if (String(r.direction).trim().toUpperCase() !== dir) bad.push(`r${i} dir="${r.direction}"(${r.signal_number})`);
    if (!String(r.signal_number).trim()) bad.push(`r${i} BLANK num`);
    if (!String(r.line).trim()) bad.push(`r${i} BLANK line(${r.signal_number})`);
  });
  console.log('  ENUM/blank issues:', bad.length ? bad.join('; ') : 'none');

  const orphan = (arr, key) => [...new Set(arr.filter((r) => String(r[key]).trim() && !names.has(norm(r[key]))).map((r) => r[key]))];
  console.log('  Station anchors NOT in signals:', orphan(st, 'before_signal').join(', ') || 'none');
  console.log('  NS anchors NOT in signals:', orphan(ns, 'before_signal').join(', ') || 'none');
  console.log('  PSR anchors NOT in signals:', orphan(psr, 'insert_before_signal').join(', ') || 'none');
  // PSR completeness — the importer requires start_km_text, end_km_text and speed_kmph
  // (catches column-offset / missing cells before import).
  const psrBad = [];
  psr.forEach((r, i) => {
    if (!String(r.start_km_text).trim()) psrBad.push(`row${i} blank start_km (before ${r.insert_before_signal})`);
    if (!String(r.end_km_text).trim()) psrBad.push(`row${i} blank end_km (before ${r.insert_before_signal})`);
    if (!String(r.speed_kmph).trim()) psrBad.push(`row${i} blank speed (before ${r.insert_before_signal})`);
  });
  console.log('  PSR incomplete rows:', psrBad.length ? psrBad.join('; ') : 'none');
  console.log('  PSR line values:', JSON.stringify([...new Set(psr.map((r) => String(r.line).trim()))]));
  const stBlank = st.filter((r) => !String(r.before_signal).trim()).map((r) => r.station_header);
  if (stBlank.length) console.log('  Terminal station header (blank anchor, appends at end):', stBlank.join(' | '));
}
