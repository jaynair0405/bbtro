/**
 * Build per-line section + signals files from a corridor master workbook, in the
 * shape import-signal-section.js expects. Used for every plain corridor / branch
 * (LNL-PUNE, IGP-MMR, ROHA-RN, PEN-TVSG, CLA-TMBY, PNVL-ROHA, ...).
 *
 *   node scripts/build-corridor-master.js <master.xlsx> <outDir>
 *
 * The master workbook is auto-detected (both sheet-naming styles supported, and
 * spaces/hyphens in sheet names are treated as equivalent):
 *   SIGNALS sheet = any sheet with a `signal_number` column. Its direction and
 *                   section come from the rows (`direction`, `section`).
 *   aux sheets    = "<PREFIX> <signalsSheetName>" where PREFIX is
 *                   STATIONS|Stations|PSR|NS. So signals sheet "IGP-MMR" pairs with
 *                   "STATIONS IGP-MMR"/"PSR IGP-MMR"/"NS IGP-MMR", and "LNL-PUNE DN"
 *                   pairs with "Stations LNL-PUNE DN" etc. "NS PNVL-ROHA UP" pairs
 *                   with signals "PNVL ROHA UP" (hyphen≡space).
 *
 * Emits, per (direction, line) — a corridor with a MID line yields two per direction:
 *   <SECTION>_<LINE>.xlsx          sheets: section_info, inserts, PSR
 *   <SECTION>_<LINE>_signals.xlsx  sheet:  signals
 *
 * Conventions handled:
 *   - inserts route to the line that contains their before_signal; PSR routes by its
 *     own `line` column; NS rows become NEUTRAL_SECTION inserts.
 *   - a terminal station header with a blank before_signal is carried through (the
 *     importer appends it at the section end) for single-line directions.
 *   - when a corridor has no inserts / PSR, header-only (empty) sheets are written
 *     (a placeholder data row would fail the importer's validation).
 *   - text columns are trimmed (signal_type, placement, etc.).
 *
 * NOTE: build output is regenerated from the master; any build-time fix must also be
 * written back to the master (see SIGNAL_BOOK_IMPORT_RUNBOOK.md §10).
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const [masterPath, outDir] = process.argv.slice(2);
if (!masterPath || !outDir) {
  console.error('Usage: node scripts/build-corridor-master.js <master.xlsx> <outDir>');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const wb = XLSX.readFile(masterPath);
const J = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
const norm = (s) => String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[\/\-_.]/g, '');
const skey = (s) => String(s).toUpperCase().replace(/[-\s]+/g, ' ').trim(); // spaces ≡ hyphens
const lineTag = (line) => String(line).toUpperCase().replace(/\s+/g, '_');
const TEXT_TRIM = ['signal_type', 'placement', 'on_curve', 'direction', 'line', 'signal_function', 'section'];

const aux = { STATIONS: {}, PSR: {}, NS: {} };
const signalSheets = [];
for (const name of wb.SheetNames) {
  const rows = J(name);
  if (!rows.length) continue;
  const cols = Object.keys(rows[0]);
  const m = name.match(/^(STATIONS|Stations|PSR|NS)\s+(.+)$/i);
  if (m && !cols.includes('signal_number')) aux[m[1].toUpperCase()][skey(m[2])] = rows;
  else if (cols.includes('signal_number')) signalSheets.push({ name, rows });
}

const summary = [];
for (const { name, rows: sig } of signalSheets) {
  const dir = String(sig[0].direction || '').trim().toUpperCase();
  const SECTION = String(sig[0].section || '').trim();
  const stations = aux.STATIONS[skey(name)] || [];
  const ns = aux.NS[skey(name)] || [];
  const psr = aux.PSR[skey(name)] || [];

  const lines = [...new Set(sig.map((r) => r.line))];
  for (const line of lines) {
    const rowsL = sig.filter((r) => r.line === line).map((r) => {
      const o = { ...r };
      for (const c of TEXT_TRIM) if (o[c] != null) o[c] = String(o[c]).trim();
      return o;
    });
    const nameSet = new Set(rowsL.map((r) => norm(r.signal_number)));

    const inserts = [];
    for (const s of stations) {
      const b = String(s.before_signal || '').trim();
      if (b && nameSet.has(norm(b))) inserts.push({ row_type: 'STATION_HEADER', station_header: s.station_header, before_signal: s.before_signal });
      else if (!b && lines.length === 1) inserts.push({ row_type: 'STATION_HEADER', station_header: s.station_header, before_signal: '' });
    }
    for (const n of ns) if (n.before_signal && nameSet.has(norm(n.before_signal))) inserts.push({ row_type: 'NEUTRAL_SECTION', station_header: n.station_header, before_signal: n.before_signal });
    const psrRows = psr.filter((p) => String(p.line).trim() === line);

    const code = `${SECTION.replace(/-/g, '_')}_${lineTag(line)}`;
    const section_info = [{ section_code: code, section_title: `${line} LINE`, direction: dir, line }];

    const sfWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(sfWb, XLSX.utils.json_to_sheet(section_info), 'section_info');
    const insertsSheet = inserts.length ? XLSX.utils.json_to_sheet(inserts)
      : XLSX.utils.aoa_to_sheet([['row_type', 'station_header', 'before_signal']]);
    const psrSheet = psrRows.length ? XLSX.utils.json_to_sheet(psrRows)
      : XLSX.utils.aoa_to_sheet([['section', 'line', 'direction', 'start_km_text', 'end_km_text', 'speed_kmph', 'insert_before_signal']]);
    XLSX.utils.book_append_sheet(sfWb, insertsSheet, 'inserts');
    XLSX.utils.book_append_sheet(sfWb, psrSheet, 'PSR');
    XLSX.writeFile(sfWb, path.join(outDir, `${code}.xlsx`));

    const sigWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(sigWb, XLSX.utils.json_to_sheet(rowsL), 'signals');
    XLSX.writeFile(sigWb, path.join(outDir, `${code}_signals.xlsx`));

    summary.push({
      code,
      signals: rowsL.length,
      station_headers: inserts.filter((i) => i.row_type === 'STATION_HEADER').length,
      ns: inserts.filter((i) => i.row_type === 'NEUTRAL_SECTION').length,
      psr: psrRows.length,
    });
  }
}
console.table(summary);
console.log('Built into', outDir);
