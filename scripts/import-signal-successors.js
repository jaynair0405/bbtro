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

  if (!shouldCommit) {
    console.log('\nDry run successful. Sample records (first 5):');
    records.slice(0, 5).forEach((r) => console.log(`  ${JSON.stringify(r)}`));
    console.log('\nRe-run with --commit to write to div_signal_successors.');
    return;
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // affectedRows from INSERT..ON DUPLICATE KEY UPDATE is driver/config
    // dependent, so measure net inserts by row count before/after instead.
    const [[{ c: countBefore }]] = await conn.query('SELECT COUNT(*) AS c FROM div_signal_successors');
    let processed = 0;

    for (const r of records) {
      // Try to resolve IDs at insert time. Resolve via normalized comparison
      // (mirroring the SQL migration's resolve step).
      const [fromHit] = await conn.execute(
        `SELECT id, section FROM div_signals
          WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(signal_number,' ',''),'-',''),'/',''),'.',''))
              = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(?,' ',''),'-',''),'/',''),'.',''))
            AND \`line\` = ?
          LIMIT 1`,
        [r.from_signal_text, r.from_line]
      );

      const [toHit] = await conn.execute(
        `SELECT id, section FROM div_signals
          WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(signal_number,' ',''),'-',''),'/',''),'.',''))
              = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(?,' ',''),'-',''),'/',''),'.',''))
            AND \`line\` = ?
          LIMIT 1`,
        [r.to_signal_text, r.to_line]
      );

      const fromId = fromHit.length ? fromHit[0].id : null;
      const toId   = toHit.length   ? toHit[0].id   : null;
      // Section taken from whichever endpoint resolved (from-side preferred).
      // NULL when neither signal is loaded yet — resolves on a later re-run.
      const section = fromHit.length ? fromHit[0].section
                    : toHit.length   ? toHit[0].section
                    : null;

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
          fromId, r.from_signal_text, r.from_line,
          toId,   r.to_signal_text,   r.to_line,
          r.succession_type, r.route_condition,
          section, r.direction
        ]
      );

      processed++;
    }

    const [[{ c: countAfter }]] = await conn.query('SELECT COUNT(*) AS c FROM div_signal_successors');
    const inserted = countAfter - countBefore;
    const updated  = processed - inserted;

    await conn.commit();

    console.log('\nImport completed.');
    console.log(`Inserted    : ${inserted}`);
    console.log(`Updated     : ${updated}`);

    // Coverage report
    const [cov] = await conn.execute(
      `SELECT COUNT(*) AS total,
              SUM(from_signal_id IS NOT NULL) AS from_resolved,
              SUM(to_signal_id   IS NOT NULL) AS to_resolved
         FROM div_signal_successors`
    );
    console.log(`\nResolution  : total=${cov[0].total}, from_resolved=${cov[0].from_resolved}, to_resolved=${cov[0].to_resolved}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
