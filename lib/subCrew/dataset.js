/**
 * Suburban Crew Ops — build the dataset the pages run on.
 *
 * One shape, four pages. buildDataset() is what the API serves; the pages derive
 * the train index and block totals from it client-side using the SAME module the
 * server would use (public/div/suburban/js/sub-derive.js — see the header there
 * for why it lives under public/).
 *
 * Key order in the object literals below is not decorative: it was chosen to
 * match the literals the pages were originally built with, which is how the
 * conversion was proved byte-identical. Add new keys at the END.
 */
'use strict';

const D = require('../../public/div/suburban/js/sub-derive.js');
const { SQL_BLOCKS, SQL_DETAILS, SQL_LEGS, SQL_MASTER } = require('./queries');

/** All four reads, in parallel. */
async function fetchRaw(pool) {
  const [[blocks], [rawDetails], [rawLegs], [master]] = await Promise.all([
    pool.query(SQL_BLOCKS),
    pool.query(SQL_DETAILS),
    pool.query(SQL_LEGS),
    pool.query(SQL_MASTER),
  ]);
  return { blocks, rawDetails, rawLegs, master };
}

/**
 * Canonical detail. Key order matches the legacy DETAILS/CYCLES literal; `blk`
 * (the resolved detail_blocks id) is appended so block totals can count by
 * identity instead of re-testing ranges. Strip it for snapshot parity.
 */
function buildDetails(rawDetails, blocks) {
  return rawDetails.map((d) => {
    const b = D.blockOf(blocks, d.line, d.detail_number);
    return {
      id: d.detail_id, wm: d.total_wheel_movement, num: d.detail_number,
      pil: d.total_piloting, son: D.hhmm(d.sign_on_time), duty: d.total_duty_hours,
      line: d.line, link: b ? b.link_type : null, next: d.next_detail_id,
      soff: D.hhmm(d.sign_off_time), sonp: d.sign_on_place, type: d.detail_type,
      soffp: d.sign_off_place, anchor: d.cycle_anchor, office: b ? b.office_code : null,
      blk: b ? b.id : null,
    };
  });
}

/**
 * Canonical leg — the superset both leg flavours are projected from. Key order
 * matches the legacy LEGS_FULL literal; `rmk` is appended (LEGS_FULL never
 * carried remarks, but the detail book needs them to compose its remarks line,
 * and the train index needs them for TLEGS.rmk).
 */
function buildLegs(rawLegs) {
  return rawLegs.map((l) => ({
    ac: l.ac_service, es: l.end_station, et: D.hhmm(l.end_time), lg: l.line_group,
    ss: l.start_station, st: D.hhmm(l.start_time), tn: l.train_number, ty: l.train_type,
    car: l.car_composition, did: l.detail_id, dir: l.direction, svc: l.service_type,
    rt: l.rt_detail, rb: l.rb_detail,
    rmk: l.remarks,
  }));
}

/**
 * from/to + display number per normalized train number.
 * First wins, and SQL_MASTER orders by train_code — so a duplicate normalized
 * number resolves to MIN(train_code), the same row SQL_LEGS's join picks.
 */
function buildMasterSlice(master) {
  const seen = new Set();
  const out = [];
  for (const m of master) {
    if (seen.has(m.n)) continue;
    seen.add(m.n);
    out.push({ n: m.n, tn: m.tn, f: m.f, to: m.to_ });
  }
  return out;
}

/** Things that are not errors but should not pass unnoticed either. */
function checkWarnings(blocks, details) {
  const w = D.checkBlockRanges(blocks);
  const noOffice = details.filter((d) => !d.office);
  if (noOffice.length) {
    w.push(noOffice.length + ' detail(s) fall in no block and so appear in no '
      + 'office report: ' + noOffice.map((d) => d.num).join(', '));
  }
  const unclassified = details.filter((d) => !d.type);
  if (unclassified.length) {
    w.push(unclassified.length + ' detail(s) have no single/double/triple '
      + 'classification: ' + unclassified.map((d) => d.num).join(', '));
  }
  return w;
}

/** The payload the API serves and every page runs on. */
async function buildDataset(pool) {
  const { blocks, rawDetails, rawLegs, master } = await fetchRaw(pool);

  const details = buildDetails(rawDetails, blocks);
  const legs = buildLegs(rawLegs);
  const masterSlice = buildMasterSlice(master);
  const blockList = D.blockTotals(blocks, details);
  const warnings = checkWarnings(blocks, details);

  const byType = (t) => details.filter((d) => d.type === t).length;
  const counts = {
    details: details.length,
    single: byType('single'), double: byType('double'), triple: byType('triple'),
    unclassified: details.filter((d) => !d.type).length,
    legs: legs.length,
    trains: new Set(legs.filter(D.isTrain).map((l) => D.norm(l.tn)).filter(Boolean)).size,
    blocks: blockList.filter((b) => b.n > 0).length,
    blocksTotal: blockList.length,
    offices: new Set(details.map((d) => d.office).filter(Boolean)).size,
    unblocked: details.filter((d) => !d.office).length,
  };

  return {
    blocks: blockList,
    details,
    legs,
    master: masterSlice,
    counts,
    warnings,
    generatedAt: new Date().toISOString(),
  };
}

/** Cheap payload for the Overview page — no details, no legs. */
async function buildSummary(pool) {
  const ds = await buildDataset(pool);
  return {
    blocks: ds.blocks, counts: ds.counts,
    warnings: ds.warnings, generatedAt: ds.generatedAt,
  };
}

module.exports = {
  fetchRaw, buildDetails, buildLegs, buildMasterSlice, checkWarnings,
  buildDataset, buildSummary,
};
