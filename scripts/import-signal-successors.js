/**
 * Import signal successor data (line crossovers, platform routing, loop
 * routing, section boundaries) into div_signal_successors.
 *
 * Dry run:
 *   node scripts/import-signal-successors.js ./corridor_changing_signals.csv [LINE_CROSSOVER]
 *
 * Commit:
 *   node scripts/import-signal-successors.js ./corridor_changing_signals.csv LINE_CROSSOVER --commit
 *
 * CSV format (crossovers):
 *   from_signal,diverted_to,from_line,to_line
 *
 * CSV format (platform routing, loop routing, section boundaries):
 *   from_signal,diverted_to,from_line,to_line,route_condition
 *
 * The script:
 *   - Reads the CSV
 *   - Derives `direction` from whichever side has DN/UP prefix
 *   - Inserts/updates div_signal_successors via ON DUPLICATE KEY UPDATE
 *   - Leaves from_signal_id / to_signal_id NULL — the SQL migration's
 *     resolve step (or a re-run) links them to actual signals.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const filePath = process.argv[2];
const succType = process.argv[3] || 'AUTO';
const shouldCommit = process.argv.includes('--commit');

const VALID_TYPES = ['LINE_CROSSOVER', 'PLATFORM_ROUTING', 'LOOP_ROUTING', 'SECTION_BOUNDARY'];

if (!filePath) {
  console.error('Usage: node scripts/import-signal-successors.js <csv> [succession_type|AUTO] [--commit]');
  console.error(`succession_type one of: ${VALID_TYPES.join(', ')}, or AUTO (default)`);
  console.error('AUTO: per row — line changes -> LINE_CROSSOVER, same line -> PLATFORM_ROUTING');
  process.exit(1);
}

if (succType !== 'AUTO' && !VALID_TYPES.includes(succType)) {
  console.error(`Invalid succession_type "${succType}". Must be one of: ${VALID_TYPES.join(', ')}, or AUTO`);
  process.exit(1);
}

// Per-row succession type when caller passes AUTO: a change of line is a
// crossover; staying on the same line is platform/loop routing within a
// station. (LOOP_ROUTING / SECTION_BOUNDARY remain explicit-only.)
function resolveSuccType(fromLine, toLine) {
  if (succType !== 'AUTO') return succType;
  return fromLine === toLine ? 'PLATFORM_ROUTING' : 'LINE_CROSSOVER';
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] !== undefined ? cells[idx] : ''; });
    rows.push(row);
  }

  return { headers, rows };
}

// Map colloquial line names (as written in user CSVs) to the canonical
// values used by div_signals imports.
const LINE_NAME_MAP = {
  'DN LL': 'DN LOC',
  'UP LL': 'UP LOC',
  '5TH LINE': '5TH',
  '6TH LINE': '6TH'
};

function canonicalLine(line) {
  const upper = (line || '').trim().toUpperCase();
  return LINE_NAME_MAP[upper] || upper;
}

function deriveDirection(fromLine, toLine) {
  for (const candidate of [fromLine, toLine]) {
    if (!candidate) continue;
    const upper = candidate.toUpperCase();
    if (upper.startsWith('DN')) return 'DN';
    if (upper.startsWith('UP')) return 'UP';
  }
  return null;
}

async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bbtro'
  });
}

async function main() {
  console.log('============================================================');
  console.log('Signal Successor Import');
  console.log('============================================================');
  console.log(`File              : ${path.resolve(filePath)}`);
  console.log(`Succession type   : ${succType}`);
  console.log(`Mode              : ${shouldCommit ? 'COMMIT' : 'DRY RUN'}`);
  console.log('============================================================');

  const text = fs.readFileSync(filePath, 'utf-8');
  const { headers, rows } = parseCsv(text);

  // Map CSV column variants to canonical fields
  const colFrom    = headers.find((h) => h === 'from_signal') || 'from_signal';
  const colTo      = headers.find((h) => h === 'diverted_to' || h === 'to_signal') || 'diverted_to';
  const colFromLn  = 'from_line';
  const colToLn    = 'to_line';
  const colCond    = headers.find((h) => h === 'route_condition' || h === 'platform_or_route');

  const errors = [];
  const records = [];

  rows.forEach((row, idx) => {
    const rowNo = idx + 2; // header is row 1
    const fromSignal = (row[colFrom] || '').trim();
    const toSignal   = (row[colTo]   || '').trim();
    const fromLine   = canonicalLine(row[colFromLn]);
    const toLine     = canonicalLine(row[colToLn]);
    const routeCond  = colCond ? (row[colCond] || '').trim() : null;

    if (!fromSignal || !toSignal || !fromLine || !toLine) {
      errors.push(`Row ${rowNo}: missing required field (from_signal/diverted_to/from_line/to_line)`);
      return;
    }

    const direction = deriveDirection(fromLine, toLine);

    records.push({
      from_signal_text: fromSignal,
      to_signal_text:   toSignal,
      from_line:        fromLine,
      to_line:          toLine,
      succession_type:  resolveSuccType(fromLine, toLine),
      // Empty string (not NULL) — NULL bypasses the uq_succession unique key
      // and would duplicate on every re-import.
      route_condition:  routeCond || '',
      direction
    });
  });

  console.log(`Rows read   : ${rows.length}`);
  console.log(`Rows valid  : ${records.length}`);
  console.log(`Errors      : ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.forEach((e) => console.log(`- ${e}`));
    process.exit(1);
  }

  // Direction breakdown
  const byDir = { UP: 0, DN: 0, NULL: 0 };
  records.forEach((r) => byDir[r.direction || 'NULL']++);
  console.log(`\nDirection   : UP=${byDir.UP}, DN=${byDir.DN}, NULL=${byDir.NULL}`);

  const conn = await getConnection();
  try {
    // ── Resolve every record to signal IDs (read-only; runs for dry-run too) ──
    // A signal_number can exist in more than one section on the same line (the
    // RVJ S-7/S-8 case: VDLR-GMN and CSMT-PNVL). Resolving by (number, line)
    // alone is ambiguous, so disambiguate by the SECTION the two endpoints
    // share. If the ambiguity can't be settled, leave the id NULL and warn —
    // never attach to an arbitrary candidate.
    const candidates = async (sigText, line) => {
      const [rows] = await conn.execute(
        `SELECT id, section FROM div_signals
          WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(signal_number,' ',''),'-',''),'/',''),'.',''))
              = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(?,' ',''),'-',''),'/',''),'.',''))
            AND \`line\` = ?
          ORDER BY id`,
        [sigText, line]
      );
      return rows;
    };

    const warnings = [];
    for (const r of records) {
      const fc = await candidates(r.from_signal_text, r.from_line);
      const tc = await candidates(r.to_signal_text, r.to_line);
      const fSecs = [...new Set(fc.map((x) => x.section))];
      const tSecs = [...new Set(tc.map((x) => x.section))];
      const common = fSecs.filter((s) => tSecs.includes(s));

      let fromId = null, toId = null, section = null, note = '';
      if (common.length === 1) {
        section = common[0];
        fromId = fc.find((x) => x.section === section).id;
        toId   = tc.find((x) => x.section === section).id;
        if (fc.length > 1 || tc.length > 1) note = `disambiguated by common section ${section}`;
      } else {
        if (fc.length === 1) fromId = fc[0].id;
        else if (fc.length > 1) note += `from-side AMBIGUOUS [${fSecs.join('|')}] `;
        if (tc.length === 1) toId = tc[0].id;
        else if (tc.length > 1) note += `to-side AMBIGUOUS [${tSecs.join('|')}] `;
        if (common.length > 1) note += `multiple common sections [${common.join('|')}] `;
        section = fromId != null ? fc.find((x) => x.id === fromId).section
               : toId   != null ? tc.find((x) => x.id === toId).section
               : null;
        if (fromId != null && toId != null && fc.find((x) => x.id === fromId).section !== tc.find((x) => x.id === toId).section) {
          note += `cross-section edge (${fc.find((x) => x.id === fromId).section} → ${tc.find((x) => x.id === toId).section}) `;
        }
      }
      r._fromId = fromId; r._toId = toId; r._section = section;
      if (note) warnings.push({ row: `${r.from_signal_text} → ${r.to_signal_text} [${r.from_line}/${r.to_line}]`, note });
    }

    const resFrom = records.filter((r) => r._fromId != null).length;
    const resTo   = records.filter((r) => r._toId != null).length;
    console.log(`\nResolved    : from=${resFrom}/${records.length}, to=${resTo}/${records.length}`);
    if (warnings.length) {
      console.log(`\nAmbiguities / notes (${warnings.length}):`);
      warnings.forEach((w) => console.log(`  - ${w.row}: ${w.note}`));
    }

    if (!shouldCommit) {
      console.log('\nDry run. Re-run with --commit to write to div_signal_successors.');
      return;
    }

    await conn.beginTransaction();
    const [[{ c: countBefore }]] = await conn.query('SELECT COUNT(*) AS c FROM div_signal_successors');
    let processed = 0;
    for (const r of records) {
      await conn.execute(
        `INSERT INTO div_signal_successors (
            from_signal_id, from_signal_text, from_line,
            to_signal_id,   to_signal_text,   to_line,
            succession_type, route_condition,
            section, direction
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            from_signal_id   = VALUES(from_signal_id),
            to_signal_id     = VALUES(to_signal_id),
            succession_type  = VALUES(succession_type),
            section          = VALUES(section),
            direction        = VALUES(direction)`,
        [
          r._fromId, r.from_signal_text, r.from_line,
          r._toId,   r.to_signal_text,   r.to_line,
          r.succession_type, r.route_condition,
          r._section, r.direction
        ]
      );
      processed++;
    }
    const [[{ c: countAfter }]] = await conn.query('SELECT COUNT(*) AS c FROM div_signal_successors');
    await conn.commit();

    console.log('\nImport completed.');
    console.log(`Inserted    : ${countAfter - countBefore}`);
    console.log(`Updated     : ${processed - (countAfter - countBefore)}`);
    const [cov] = await conn.execute(
      `SELECT COUNT(*) AS total,
              SUM(from_signal_id IS NOT NULL) AS from_resolved,
              SUM(to_signal_id   IS NOT NULL) AS to_resolved
         FROM div_signal_successors`
    );
    console.log(`\nResolution  : total=${cov[0].total}, from_resolved=${cov[0].from_resolved}, to_resolved=${cov[0].to_resolved}`);
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* not in txn */ }
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
