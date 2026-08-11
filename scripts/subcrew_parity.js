/**
 * Parity gate for the Suburban Crew Ops migration.
 *
 * The four mockup pages are the ground truth for what the live pages must
 * render. This script parses the eight data literals still embedded in them and
 * deep-compares each against what lib/subCrew/dataset.js derives from the DB
 * right now. Any difference is a regression in the extraction.
 *
 * It checks the DERIVATION. The companion check is byte-level: run
 * `node scripts/build_page_snapshots.js --commit` and confirm `git diff` on the
 * four mockups is empty — that additionally proves key order is preserved.
 *
 * Run:  node scripts/subcrew_parity.js
 * Exit: 0 = identical, 1 = differences (first 20 paths printed)
 *
 * TRANSITIONAL — delete with the mockups.
 */
'use strict';

const fs = require('fs');
const pool = require('../config/database');
const { buildSnapshots } = require('../lib/subCrew/dataset');

const DIV = 'public/div/';
const TARGETS = [
  ['crew-dashboard-mockup.html', 'BLOCKS', 'BLOCKS'],
  ['detail-book-mockup.html', 'CYCLES', 'CYCLES'],
  ['detail-book-mockup.html', 'LEGS', 'LEGS_BOOK'],
  ['reports-mockup.html', 'DETAILS', 'DETAILS'],
  ['reports-mockup.html', 'LEGS', 'LEGS_FULL'],
  ['train-index-mockup.html', 'TRAINS', 'TRAINS'],
  ['train-index-mockup.html', 'TDET', 'TDET'],
  ['train-index-mockup.html', 'TLEGS', 'TLEGS'],
];

/** Pull `const NAME = <json>;` out of a page — the same regex the splicer uses. */
function extract(file, name) {
  const h = fs.readFileSync(DIV + file, 'utf8');
  const re = new RegExp('const ' + name + ' *= *(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\});');
  const m = h.match(re);
  if (!m) throw new Error(`${name} not found in ${file}`);
  return JSON.parse(m[1]);
}

/** Deep diff, order-sensitive for arrays. Collects dotted paths. */
function diff(a, b, path, out, limit) {
  if (out.length >= limit) return out;
  if (a === b) return out;
  const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
  const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
  if (ta !== tb) { out.push(`${path}: ${ta} ${JSON.stringify(a)} != ${tb} ${JSON.stringify(b)}`); return out; }
  if (ta === 'array') {
    if (a.length !== b.length) out.push(`${path}: length ${a.length} != ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length) && out.length < limit; i++) {
      diff(a[i], b[i], `${path}[${i}]`, out, limit);
    }
    return out;
  }
  if (ta === 'object') {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    for (const k of keys) {
      if (out.length >= limit) break;
      if (!(k in a)) { out.push(`${path}.${k}: missing in page, is ${JSON.stringify(b[k])} in build`); continue; }
      if (!(k in b)) { out.push(`${path}.${k}: ${JSON.stringify(a[k])} in page, missing in build`); continue; }
      diff(a[k], b[k], `${path}.${k}`, out, limit);
    }
    return out;
  }
  out.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  return out;
}

(async () => {
  const S = await buildSnapshots(pool);
  let bad = 0;

  for (const [file, literal, key] of TARGETS) {
    const fromPage = extract(file, literal);
    const fromBuild = S[key];
    const d = diff(fromPage, fromBuild, `${literal}`, [], 20);
    const n = Array.isArray(fromBuild) ? fromBuild.length : Object.keys(fromBuild).length;
    if (d.length) {
      bad++;
      console.log(`FAIL  ${literal.padEnd(9)} ${file}  (${d.length}+ differences)`);
      for (const line of d) console.log('        ' + line);
    } else {
      console.log(`ok    ${literal.padEnd(9)} ${file}  (${n} records)`);
    }
  }

  // key order is not covered by the deep compare — flag it explicitly
  console.log(bad
    ? `\n${bad}/8 literals differ.`
    : '\n8/8 identical. Now confirm key order: '
      + 'node scripts/build_page_snapshots.js --commit && git diff --stat');

  await pool.end();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
