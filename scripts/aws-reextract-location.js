/**
 * Re-extract location_raw / location_type for currently UNMATCHED signal events
 * using the (improved) extractLocation parser. Safe: only touches events with
 * signal_id IS NULL, so it can only help — a matched event is never disturbed.
 *
 * Reuses the exact extractLocation exported from awsUploadRoutes.js.
 *
 * Dry run:  node scripts/aws-reextract-location.js
 * Commit:   node scripts/aws-reextract-location.js --commit
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { extractLocation } = require('../routes/division/awsUploadRoutes');

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
    const [rows] = await conn.query(
      `SELECT e.id, e.location_raw, e.location_type, r.detail
       FROM div_aws_events e LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
       WHERE e.signal_id IS NULL AND r.detail IS NOT NULL AND r.detail <> ''`
    );

    const changes = [];
    for (const row of rows) {
      const { raw, type } = extractLocation(row.detail);
      if (raw && (raw !== row.location_raw || type !== row.location_type)) {
        changes.push({ id: row.id, from: row.location_raw, to: raw, type, detail: row.detail });
      }
    }

    console.log(`Unmatched events scanned : ${rows.length}`);
    console.log(`Location re-extractions  : ${changes.length}\n`);
    changes.forEach(c => console.log(`  ${c.id}: "${c.from}" → "${c.to}" [${c.type}]  ← ${c.detail.replace(/^DETAIL:\s*/i,'').slice(0,50)}`));

    if (!commit) {
      console.log('\nDry run. Re-run with --commit to write.');
      return;
    }
    for (const c of changes) {
      await conn.query('UPDATE div_aws_events SET location_raw = ?, location_type = ? WHERE id = ? AND signal_id IS NULL', [c.to, c.type, c.id]);
    }
    console.log(`\nUpdated ${changes.length} events.`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
