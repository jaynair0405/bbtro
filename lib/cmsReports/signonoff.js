'use strict';

/*
 * CMS sign-on / sign-off mode summary -> "Sign On - Sign Off Biometric".
 *
 * One row per lobby x designation, 44 count columns: how each sign-on and sign-off
 * was done (kiosk, mobile, supervisor, CME direct...), HQ / non-HQ. CMS writes a
 * "[TOTAL]" designation row per lobby and a "[TOTAL]" lobby row for the division.
 *
 * The sheet prints four of the columns (user, 2026-10-10 — see COUNTS), each
 * located by header NAME, so a column CMS adds later cannot shift them.
 *
 * Counted from the designation rows; each lobby's [TOTAL] row and the division
 * [TOTAL] are checked against those sums (see fsd.js for why).
 * Counts only — no crew in the file. The file carries no date.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

const OUR_DIVISION = 'CSTM';

// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'JNPN', 'KYN', 'LNL', 'LNLX', 'LTT', 'PNVL', 'ROHA', 'VVH'];

// The counted columns, in sheet order (user, 2026-10-10; supervisor sign on was
// S.VISOR HQ until then — TOTAL counts HQ and outstation alike).
const COUNTS = [
  { key: 'supOn',       head: 'Supervisor Sign On',  aliases: ['S-ONS.VISORTOTAL', 'S-ON S.VISOR TOTAL'] },
  { key: 'cmeOn',       head: 'CME Sign On',         aliases: ['S-ONCME-DIRECTTOTAL', 'S-ON CME-DIRECT TOTAL'] },
  { key: 'cmeKioskOff', head: 'CME Kiosk Sign Off',  aliases: ['S-OFFCME-KIOSKTOTAL', 'S-OFF CME-KIOSK TOTAL'] },
  { key: 'cmeOff',      head: 'CME Direct Sign Off', aliases: ['S-OFFCME-DIRECTTOTAL', 'S-OFF CME-DIRECT TOTAL'] },
];
const KEYS = COUNTS.map((c) => c.key);

/*
 * DR and LTT rows of "Sign On/Sign Off without Biometric" come from this same file
 * (user, 2026-10-10; the suburban lobbies come from subsonoff.js). Total sign on is
 * GRAND TOTAL NHQ as CMS counts it, CME sign-ons included (user chose 14 over the
 * hand sheet's 13 for DR on 09/10). Sign off checked against the 10/10 sheet: DR 29 / 29.
 */
const BIO_LOBBIES = ['DR', 'LTT'];
const BIO = [
  { key: 'onTotal', aliases: ['S-ONGRAND TOTALNHQ', 'S-ON GRAND TOTAL NHQ'] },   // 22
  { key: 'onNoBio', aliases: ['S-ONKIOSKNHQBAPASS', 'S-ON KIOSK NHQ BA PASS'] }, // 9
  { key: 'offTotal', aliases: ['S-OFFGRANDTOTALNHQ', 'S-OFF GRAND TOTAL NHQ'] },  // 44
  { key: 'offNoBio', aliases: ['S-OFFKIOSKNHQBAPASS', 'S-OFF KIOSK NHQ BA PASS'] }, // 26
];
const BIO_KEYS = BIO.map((c) => c.key);

const FIELDS = [
  { key: 'div',   aliases: ['DIV'] },
  { key: 'lobby', aliases: ['LOBBY'] },
  { key: 'desig', aliases: ['DESIG'] },
  ...COUNTS,
  ...BIO,
];

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, ' ');
}

function columnMap(header) {
  const cells = (header || []).map(norm);
  const map = {};
  for (const f of FIELDS) {
    const i = cells.findIndex((c) => f.aliases.includes(c));
    if (i === -1) return null;
    map[f.key] = i;
  }
  return map;
}

function matchesHeader(header) {
  return columnMap(header) !== null;
}

const zero = () => Object.fromEntries(KEYS.map((k) => [k, 0]));

/*
 * Returns { rows: [{ lobby, desig, supOn, cmeOn, cmeKioskOff, cmeOff }], lobbies: Map(lobby -> counts), warnings }
 */
function parseSignOnOff(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the sign-on / sign-off report: DIV, LOBBY, DESIG, S-ON S.VISOR TOTAL, S-ON CME-DIRECT TOTAL, S-OFF CME-KIOSK TOTAL and S-OFF CME-DIRECT TOTAL are required.');

  const warnings = [];
  const rows = [];
  const lobbyTotals = new Map();
  let divTotal = null;
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    const desig = norm(rec[col.desig]);
    if (!lobby) return;
    // A CMS screen left on another division downloads a well-formed file of zeros for
    // every CSTM lobby — refuse it rather than print zeros.
    const div = norm(rec[col.div]);
    if (div !== OUR_DIVISION) throw new Error(`This download is for division ${div || '(blank)'}, not ${OUR_DIVISION} — set the division on the CMS screen and download again.`);
    const num = (k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby} ${desig}) has a non-numeric count "${raw}".`);
      return Number(raw);
    };
    const r = { lobby, desig };
    [...KEYS, ...BIO_KEYS].forEach((k) => { r[k] = num(k); });
    if (lobby.includes('TOTAL')) divTotal = r;
    else if (desig.includes('TOTAL')) lobbyTotals.set(lobby, r);
    else rows.push(r);
  });
  if (rows.length === 0) throw new Error('The file has a header but no lobby rows.');

  const lobbies = new Map();
  const add = (a, r) => { KEYS.forEach((k) => { a[k] += r[k]; }); return a; };
  rows.forEach((r) => lobbies.set(r.lobby, add(lobbies.get(r.lobby) || zero(), r)));
  const show = (x) => KEYS.map((k) => x[k]).join(' / ');
  const same = (x, y) => KEYS.every((k) => x[k] === y[k]);
  lobbyTotals.forEach((t, lobby) => {
    const ours = lobbies.get(lobby) || zero();
    if (!same(ours, t)) warnings.push(`${lobby}: CMS total ${show(t)}, designations add up to ${show(ours)}.`);
  });
  if (divTotal) {
    const all = [...lobbies.values()].reduce(add, zero());
    if (!same(all, divTotal)) {
      warnings.push(`Division total from CMS is ${show(divTotal)}, lobbies add up to ${show(all)} — the download may be incomplete.`);
    }
  } else {
    warnings.push('No division [TOTAL] row in the download — completeness could not be checked.');
  }
  // DR / LTT without-biometric figures, from each lobby's [TOTAL] row.
  const bio = new Map();
  lobbyTotals.forEach((t, lobby) => { if (BIO_LOBBIES.includes(lobby)) bio.set(lobby, t); });
  return { rows, lobbies, bio, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows, lobbies } = parsed;
  const line = (l) => { const c = lobbies.get(l) || zero(); return KEYS.map((k) => c[k]); };
  const sheet = SHEET_LOBBIES.map(line);
  const sum = (ls) => ls[0].map((_, i) => ls.reduce((s, l) => s + l[i], 0));
  const heads = COUNTS.map((c) => c.head);   // no Total Cases column (user, 2026-10-10)
  const alert = (from) => heads.map((_, i) => i + from);

  const main = {
    title: 'Sign On - Sign Off Biometric',
    note: 'Sign ons by the supervisor or CME, and sign offs by the CME (kiosk or direct).',
    headers: ['Sr No.', 'Lobby', ...heads],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, ...sheet[i]]),
    total: ['', 'TOTAL', ...sum(sheet)],
    alertCols: alert(2),
  };
  const out = [main];

  // DR / LTT without biometric. Supervisory and CME sign on = the same columns as above.
  const pct = (n, d) => (d ? `${(100 * n / d).toFixed(1)}%` : '');
  const bioRows = BIO_LOBBIES.map((l, i) => {
    const b = parsed.bio.get(l) || zero();
    return [i + 1, l, b.onTotal || 0, b.onNoBio || 0, pct(b.onNoBio, b.onTotal), b.supOn, b.cmeOn,
      b.offTotal || 0, b.offNoBio || 0, pct(b.offNoBio, b.offTotal), b.cmeKioskOff + b.cmeOff];
  });
  const bt = [2, 3, 5, 6, 7, 8, 10].reduce((t, c) => { t[c] = bioRows.reduce((s, r) => s + r[c], 0); return t; }, ['', 'TOTAL']);
  bt[4] = pct(bt[3], bt[2]);
  bt[9] = pct(bt[8], bt[7]);
  out.push({
    title: 'Sign On/Sign Off without Biometric — DR, LTT',
    note: 'Total = CMS grand total (non-HQ). CME sign off = CME kiosk + CME direct.',
    headers: ['Sr No.', 'Lobby', 'Total', 'W/O Bio', '%', 'Supervisory', 'CME', 'Total', 'W/O Bio', '%', 'CME'],
    groups: [null, null, 'Sign On', 'Sign On', 'Sign On', 'Sign On', 'Sign On', 'Sign Off', 'Sign Off', 'Sign Off', 'Sign Off'],
    rows: bioRows,
    total: bt,
    sheet: true,
  });

  const others = [...lobbies.keys()].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  if (others.length) {
    out.push({
      title: 'Other lobbies',
      headers: ['Lobby', ...heads],
      rows: others.map((l) => [l, ...line(l)]),
      total: null,
      alertCols: alert(1),
    });
  }

  out.push({
    title: 'By lobby and designation',
    headers: ['Lobby', 'Desig.', ...COUNTS.map((c) => c.head)],
    rows: rows.filter((r) => KEYS.some((k) => r[k])).map((r) => [r.lobby, r.desig, ...KEYS.map((k) => r[k])]),
    total: null,
    emptyText: 'No supervisor / CME sign on or CME sign off.',
  });
  return out;
}

module.exports = {
  key: 'signonoff',
  dateOffset: 2,          // data date = sheet date − 2 day(s)
  label: 'Sign On - Sign Off Biometric',
  order: 120,
  matchesHeader,
  parse: parseSignOnOff,
  tables,
};
