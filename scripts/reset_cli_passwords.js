#!/usr/bin/env node
/**
 * reset_cli_passwords.js — set a known password on lobby-CLI logins.
 *
 * For rollout. Distributing 122 random passwords over the phone is a real
 * obstacle; a single known one that every CLI must replace at first sign-in is
 * the practical trade.
 *
 * THE RISK, so it is not forgotten: usernames are CMS IDs, which everyone in
 * the division knows. Until a CLI first signs in, anyone who knows the shared
 * password can sign in AS THEM and set a password of their own — taking the
 * account over and filing counselling under that CLI's name. The forced change
 * is what makes that possible, not what prevents it.
 *
 * Two things keep the window small:
 *   --office, so you can do one lobby at a time, minutes before telling them
 *   the CLI Logins page, which lists everyone still on the issued password
 *
 * Never touches an account that has already set its own password, so it is
 * safe to re-run for stragglers.
 *
 *   node scripts/reset_cli_passwords.js --password=test1234
 *   node scripts/reset_cli_passwords.js --password=test1234 --office=KYN-SUB --commit
 *   node scripts/reset_cli_passwords.js --password=test1234 --all --commit
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const args = process.argv.slice(2);
const arg = (n) => {
  const a = args.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : null;
};
const COMMIT = args.includes('--commit');
const ALL = args.includes('--all');           // include CLIs who already chose a password
const OFFICE = arg('office');
const PASSWORD = arg('password');

if (!PASSWORD) {
  console.error('Give a password:  --password=test1234   [--office=KYN-SUB] [--all] [--commit]');
  process.exit(1);
}
if (PASSWORD.length < 8) {
  // The change-password endpoint enforces 8; issuing something shorter would
  // hand every CLI a password they cannot re-enter as their "current" one.
  console.error(`"${PASSWORD}" is ${PASSWORD.length} characters. The app requires at least 8.`);
  process.exit(1);
}

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });
  const conn = await pool.getConnection();
  try {
    const where = ["u.realm = 'division'", "u.div_role = 'cli'"];
    const params = [];
    if (!ALL) where.push('u.must_change_password = 1');
    if (OFFICE) { where.push('c.current_office_code = ?'); params.push(OFFICE); }

    const [rows] = await conn.query(
      `SELECT u.id, u.username, c.cli_name, c.current_office_code AS lobby,
              u.must_change_password
         FROM users u
         LEFT JOIN div_cli_master c ON c.cli_id = u.cli_id
        WHERE ${where.join(' AND ')}
        ORDER BY c.current_office_code, c.cli_name`, params
    );

    const [[tot]] = await conn.query(
      `SELECT COUNT(*) n, SUM(must_change_password = 0) chosen
         FROM users WHERE realm='division' AND div_role='cli'`
    );
    console.log(`CLI logins in total            : ${tot.n}`);
    console.log(`  already chose own password   : ${tot.chosen}${ALL ? ' (INCLUDED — --all given)' : ' (left alone)'}`);
    if (OFFICE) console.log(`Restricted to lobby            : ${OFFICE}`);
    console.log(`Will be set to "${PASSWORD}"     : ${rows.length}`);

    const byLobby = rows.reduce((a, r) => { a[r.lobby || '—'] = (a[r.lobby || '—'] || 0) + 1; return a; }, {});
    Object.entries(byLobby).forEach(([k, v]) => console.log(`    ${String(k).padEnd(10)} ${v}`));

    if (!rows.length) { console.log('\nNothing to do.'); return; }
    if (!COMMIT) { console.log('\nDRY RUN — nothing written. Add --commit.'); return; }

    // One hash for all of them: same password, and bcrypt salts internally, so
    // the stored hashes still differ from each other.
    let n = 0;
    for (const r of rows) {
      const hash = await bcrypt.hash(PASSWORD, 12);
      await conn.query(
        'UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?', [hash, r.id]
      );
      n++;
    }
    console.log(`\nSet on ${n} accounts. Every one must replace it at first sign-in.`);
    console.log('Watch CLI Logins for anyone still showing "Not yet used" — until they');
    console.log('sign in, their account can be taken over by anyone who knows this password.');
  } finally {
    conn.release();
    await pool.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
