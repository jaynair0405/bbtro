#!/usr/bin/env node
/**
 * create_cli_users.js — bulk-generate logins for the lobby CLIs.
 *
 * One `users` row per active div_cli_master CLI:
 *   username = cmsid, realm = division, div_role = 'cli',
 *   div_office_code = the CLI's lobby, cli_id = the link back to the master.
 *
 * Passwords are random and printed ONCE to a CSV for HQ to distribute; every
 * account starts with must_change_password = 1, so the issued password is only
 * ever good for the first login.
 *
 * IDEMPOTENT. An existing username is reported and skipped, never reset — a
 * re-run after 30 more CLIs join must not silently log out the other 145.
 *
 *   node scripts/create_cli_users.js            # dry run: report only
 *   node scripts/create_cli_users.js --commit   # create, and write the CSV
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const COMMIT = process.argv.includes('--commit');
const OUT = path.join(__dirname, '..', `cli_user_passwords_${new Date().toISOString().slice(0, 10)}.csv`);

// Unambiguous alphabet: no O/0, l/1/I. These get read off a printed list and
// typed on a phone keyboard.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function makePassword(len = 10) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const conn = await pool.getConnection();
  try {
    const [clis] = await conn.query(
      `SELECT cli_id, cli_name, cmsid, cli_hrms_id, current_office_code
         FROM div_cli_master
        WHERE is_active = 1
        ORDER BY current_office_code, cli_name`
    );
    const [existing] = await conn.query(
      `SELECT id, username, cli_id FROM users WHERE realm = 'division' AND div_role = 'cli'`
    );
    const byCli = new Map(existing.map((u) => [u.cli_id, u]));
    const [allUsers] = await conn.query(`SELECT LOWER(username) AS u FROM users`);
    const takenNames = new Set(allUsers.map((r) => r.u));

    const create = [];
    const skipped = [];
    const placeholders = [];

    for (const c of clis) {
      if (byCli.has(c.cli_id)) { skipped.push([c.cli_name, 'already has an account: ' + byCli.get(c.cli_id).username]); continue; }
      // A CLI with no CMS ID is not a person: "Not Assigned" is a placeholder row
      // that staff are parked under while on long training or under punishment.
      // It is not skipped as a problem — it is simply not a CLI.
      if (!c.cmsid) { placeholders.push(c.cli_name); continue; }
      if (!c.current_office_code) { skipped.push([c.cli_name, 'no lobby in div_cli_master — the app would show them no staff']); continue; }
      const username = String(c.cmsid).trim().toLowerCase();
      if (takenNames.has(username)) { skipped.push([c.cli_name, `username "${username}" is already taken by another account`]); continue; }
      takenNames.add(username);
      create.push({ ...c, username, password: makePassword() });
    }

    console.log(`Active CLIs in master : ${clis.length}`);
    console.log(`Accounts to create    : ${create.length}`);
    console.log(`Skipped               : ${skipped.length}`);
    if (placeholders.length) {
      console.log(`Placeholder rows      : ${placeholders.length} (${placeholders.join(', ')}) — not real CLIs, ignored`);
    }
    if (skipped.length) {
      console.log('\n-- skipped --');
      skipped.forEach(([n, why]) => console.log(`  ${String(n).padEnd(28)} ${why}`));
    }

    if (!COMMIT) {
      console.log('\nDRY RUN — nothing written. Re-run with --commit to create these accounts.');
      return;
    }

    let made = 0;
    for (const c of create) {
      const hash = await bcrypt.hash(c.password, 12);
      await conn.query(
        `INSERT INTO users (username, password, role, full_name, realm, div_role, div_office_code, cli_id, must_change_password)
         VALUES (?, ?, 'user', ?, 'division', 'cli', ?, ?, 1)`,
        [c.username, hash, c.cli_name, c.current_office_code, c.cli_id]
      );
      made++;
    }

    const csv = ['username,password,cli_name,lobby']
      .concat(create.map((c) => [c.username, c.password, `"${String(c.cli_name).replace(/"/g, '""')}"`, c.current_office_code].join(',')))
      .join('\n');
    fs.writeFileSync(OUT, csv + '\n', { mode: 0o600 });

    console.log(`\nCreated ${made} accounts.`);
    console.log(`Passwords written to ${OUT} (mode 600).`);
    console.log('Distribute it, then DELETE it — the hashes in the database cannot regenerate these.');
  } finally {
    conn.release();
    await pool.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
