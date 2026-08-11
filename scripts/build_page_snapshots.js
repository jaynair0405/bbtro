/**
 * Rebuild the embedded data snapshots in the Crew-Ops mockup pages from the DB.
 *
 * TRANSITIONAL. The four public/div/*-mockup.html pages are being replaced by
 * live pages under /div/suburban/ that fetch the same data from
 * /api/division/suburban/dataset. Until that migration finishes, this script
 * keeps the mockups current — and, more usefully, acts as the parity gate:
 * running it must produce an EMPTY git diff, which proves lib/subCrew/dataset.js
 * derives exactly what the pages were built with. Delete it with the mockups.
 *
 * All query and derivation logic now lives in lib/subCrew/ and
 * public/div/suburban/js/sub-derive.js. This file is just the splicer.
 *
 * Dry run (report only, writes nothing):  node scripts/build_page_snapshots.js
 * Write the pages:                        node scripts/build_page_snapshots.js --commit
 */
'use strict';

const fs = require('fs');
const pool = require('../config/database');
const { buildSnapshots } = require('../lib/subCrew/dataset');

const DIV = 'public/div/';
const COMMIT = process.argv.includes('--commit');

// replace `const NAME = <json>;` in place, leaving the rest of the page untouched
function splice(file, name, value) {
  const p = DIV + file;
  let h = fs.readFileSync(p, 'utf8');
  const re = new RegExp('(const ' + name + ' *= *)(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\})(;)');
  if (!re.test(h)) throw new Error(`${name} not found in ${file}`);
  h = h.replace(re, (_, a, __, c) => a + JSON.stringify(value) + c);
  if (COMMIT) fs.writeFileSync(p, h);
}

(async () => {
  const S = await buildSnapshots(pool);

  splice('crew-dashboard-mockup.html', 'BLOCKS', S.BLOCKS);
  splice('detail-book-mockup.html', 'CYCLES', S.CYCLES);
  splice('detail-book-mockup.html', 'LEGS', S.LEGS_BOOK);
  splice('reports-mockup.html', 'DETAILS', S.DETAILS);
  splice('reports-mockup.html', 'LEGS', S.LEGS_FULL);
  splice('train-index-mockup.html', 'TRAINS', S.TRAINS);
  splice('train-index-mockup.html', 'TDET', S.TDET);
  splice('train-index-mockup.html', 'TLEGS', S.TLEGS);

  const c = S.counts;
  console.log(`${COMMIT ? 'WROTE' : 'DRY RUN'} — details ${c.details}` +
    ` (single ${c.single} / double ${c.double} / triple ${c.triple}` +
    ` / unclassified ${c.unclassified})`);
  console.log(`  legs ${c.legs} · trains ${S.TRAINS.length}` +
    ` (matched ${S.TRAINS.filter((t) => t.mm).length})` +
    ` · blocks ${c.blocks} · no-office details ${c.unblocked}`);
  for (const w of S.warnings) console.log('  ! ' + w);
  if (!COMMIT) console.log('  (nothing written — re-run with --commit)');

  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
