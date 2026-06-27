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
const { matchSignalFromDb, normalizeForSignalMatch, routeSectionsForEvent } = require('../routes/division/awsUploadRoutes');

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
    // Pull FROM/TO stations + train so the matcher can scope by route.
    const [events] = await conn.query(
      `SELECT e.id, e.location_raw, e.train_number, r.from_station, r.to_station
       FROM div_aws_events e LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
       WHERE e.location_type = 'SIGNAL' AND e.location_raw IS NOT NULL AND e.location_raw <> '' AND e.signal_id IS NULL`
    );

    const hits = [];
    for (const ev of events) {
      const sections = await routeSectionsForEvent(conn, ev.from_station, ev.to_station, ev.train_number);
      const m = await matchSignalFromDb(conn, ev.location_raw, { sections });
      if (m.signal_id) hits.push({ id: ev.id, location_raw: ev.location_raw, signal: m.signal_number, conf: m.confidence, signal_id: m.signal_id });
    }

    console.log(`Unmatched signal events : ${events.length}`);
    console.log(`Newly matched           : ${hits.length}\n`);
    hits.forEach(h => console.log(`  ${h.id}: "${h.location_raw}" → ${h.signal} (${h.conf})`));

    if (!commit) {
      console.log('\nDry run. Re-run with --commit to write.');
      return;
    }
    for (const h of hits) {
      await conn.query(
        `UPDATE div_aws_events SET signal_id = ?, signal_match_confidence = ?, normalized_location = ? WHERE id = ? AND signal_id IS NULL`,
        [h.signal_id, h.conf, normalizeForSignalMatch(h.location_raw), h.id]
      );
    }
    console.log(`\nUpdated ${hits.length} events.`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
