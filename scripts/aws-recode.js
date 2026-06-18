/**
 * Backfill aws_code for events that imported with NO code, by re-running the
 * (improved) extractAwsCode parser over their raw detail text. Reuses the exact
 * function exported from awsUploadRoutes.js — no duplicated regexes.
 *
 * Only touches events where aws_code IS NULL, so manually-set/already-parsed
 * codes are never overwritten.
 *
 * Dry run:   node scripts/aws-recode.js
 * Commit:    node scripts/aws-recode.js --commit
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { extractAwsCode } = require('../routes/division/awsUploadRoutes');

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
      `SELECT e.id, r.detail
       FROM div_aws_events e LEFT JOIN div_aws_cms_raw r ON r.id = e.raw_id
       WHERE e.aws_code IS NULL AND r.detail IS NOT NULL AND r.detail <> ''`
    );

    const recovered = [];
    const stillBlank = [];
    for (const row of rows) {
      const { code, confidence } = extractAwsCode(row.detail);
      if (code) recovered.push({ id: row.id, code, confidence, detail: row.detail });
      else stillBlank.push(row.id);
    }

    const byCode = {};
    for (const r of recovered) byCode[r.code] = (byCode[r.code] || 0) + 1;

    console.log(`NULL-code events scanned : ${rows.length}`);
    console.log(`Recoverable now          : ${recovered.length}`);
    console.log(`Still blank (genuine)    : ${stillBlank.length}`);
    console.log(`By code                  : ${JSON.stringify(byCode)}`);
    console.log('\nRecovered (id → code/confidence ← detail):');
    recovered.forEach(r => console.log(`  ${r.id} → ${r.code}/${r.confidence}  ← ${r.detail.replace(/^DETAIL:\s*/i,'').slice(0,55)}`));

    if (!commit) {
      console.log('\nDry run. Re-run with --commit to write aws_code.');
      return;
    }

    for (const r of recovered) {
      await conn.query('UPDATE div_aws_events SET aws_code = ? WHERE id = ? AND aws_code IS NULL', [r.code, r.id]);
    }
    console.log(`\nUpdated ${recovered.length} events.`);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
