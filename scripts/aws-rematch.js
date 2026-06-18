/**
 * Re-run signal matching on currently-unmatched events, using the exact
 * matchSignalFromDb exported from awsUploadRoutes.js (same logic as the
 * POST /match-signals endpoint, but no server/auth needed). Only fills
 * signal_id IS NULL — never re-points an already-matched event.
 *
 * Dry run:  node scripts/aws-rematch.js
 * Commit:   node scripts/aws-rematch.js --commit
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { matchSignalFromDb, normalizeForSignalMatch } = require('../routes/division/awsUploadRoutes');

const commit = process.argv.includes('--commit');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER || 'jay',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '4310jay',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'bbtro'
  });

  try {
    const [events] = await conn.query(
      `SELECT id, location_raw FROM div_aws_events
       WHERE location_type = 'SIGNAL' AND location_raw IS NOT NULL AND location_raw <> '' AND signal_id IS NULL`
    );

    const hits = [];
    for (const ev of events) {
      const m = await matchSignalFromDb(conn, ev.location_raw);
      if (m.signal_id) hits.push({ id: ev.id, location_raw: ev.location_raw, signal: m.signal_number, conf: m.confidence });
    }

    console.log(`Unmatched signal events : ${events.length}`);
    console.log(`Newly matched           : ${hits.length}\n`);
    hits.forEach(h => console.log(`  ${h.id}: "${h.location_raw}" → ${h.signal} (${h.conf})`));

    if (!commit) {
      console.log('\nDry run. Re-run with --commit to write.');
      return;
    }
    for (const h of hits) {
      const m = await matchSignalFromDb(conn, h.location_raw);
      await conn.query(
        `UPDATE div_aws_events SET signal_id = ?, signal_match_confidence = ?, normalized_location = ? WHERE id = ? AND signal_id IS NULL`,
        [m.signal_id, m.confidence, normalizeForSignalMatch(h.location_raw), h.id]
      );
    }
    console.log(`\nUpdated ${hits.length} events.`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
