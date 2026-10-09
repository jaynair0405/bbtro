'use strict';

/*
 * CMS sign-on / sign-off mode summary -> "Sign On/Off" (SUP-SON / CME-SOFF).
 *
 * One row per lobby x designation, 44 count columns: how each sign-on and sign-off
 * was done (kiosk, mobile, supervisor, CME direct...), HQ / non-HQ. CMS writes a
 * "[TOTAL]" designation row per lobby and a "[TOTAL]" lobby row for the division.
 *
 * The sheet prints two of the columns (user, 2026-10-09):
 *   SUP-SON  = S-ON S.VISOR HQ          sign-on done by the supervisor at HQ
 *   CME-SOFF = S-OFF CME-DIRECT TOTAL   sign-off done directly by the CME
 * Both located by header NAME, so a column CMS adds later cannot shift them.
 *
 * Counted from the designation rows; each lobby's [TOTAL] row and the division
 * [TOTAL] are checked against those sums (see fsd.js for why).
 * Counts only — no crew in the file. The file carries no date.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet, in sheet order (25/09 and 08/10/2026 sheets).
const SHEET_LOBBIES = ['CSMT', 'IGP', 'JNPN', 'KYN', 'LNL', 'LNLX', 'LTT', 'PNVL', 'ROHA', 'VVH'];

const FIELDS = [
  { key: 'lobby', aliases: ['LOBBY'] },
  { key: 'desig', aliases: ['DESIG'] },
  { key: 'supOn', aliases: ['S-ONS.VISORHQ', 'S-ON S.VISOR HQ'] },
  { key: 'cmeOff', aliases: ['S-OFFCME-DIRECTTOTAL', 'S-OFF CME-DIRECT TOTAL'] },
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

/*
 * Returns { rows: [{ lobby, desig, supOn, cmeOff }], lobbies: Map(lobby -> {supOn, cmeOff}), warnings }
 */
function parseSignOnOff(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the sign-on / sign-off report: LOBBY, DESIG, S-ON S.VISOR HQ and S-OFF CME-DIRECT TOTAL are required.');

  const warnings = [];
  const rows = [];
  const lobbyTotals = new Map();
  let divTotal = null;
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    const desig = norm(rec[col.desig]);
    if (!lobby) return;
    const num = (k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby} ${desig}) has a non-numeric count "${raw}".`);
      return Number(raw);
    };
    const r = { lobby, desig, supOn: num('supOn'), cmeOff: num('cmeOff') };
    if (lobby.includes('TOTAL')) divTotal = r;
    else if (desig.includes('TOTAL')) lobbyTotals.set(lobby, r);
    else rows.push(r);
  });
  if (rows.length === 0) throw new Error('The file has a header but no lobby rows.');

  const lobbies = new Map();
  rows.forEach((r) => {
    const l = lobbies.get(r.lobby) || { supOn: 0, cmeOff: 0 };
    l.supOn += r.supOn; l.cmeOff += r.cmeOff;
    lobbies.set(r.lobby, l);
  });
  lobbyTotals.forEach((t, lobby) => {
    const ours = lobbies.get(lobby) || { supOn: 0, cmeOff: 0 };
    if (ours.supOn !== t.supOn || ours.cmeOff !== t.cmeOff) {
      warnings.push(`${lobby}: CMS total ${t.supOn} / ${t.cmeOff}, designations add up to ${ours.supOn} / ${ours.cmeOff}.`);
    }
  });
  if (divTotal) {
    const all = [...lobbies.values()].reduce((a, l) => ({ supOn: a.supOn + l.supOn, cmeOff: a.cmeOff + l.cmeOff }), { supOn: 0, cmeOff: 0 });
    if (all.supOn !== divTotal.supOn || all.cmeOff !== divTotal.cmeOff) {
      warnings.push(`Division total from CMS is ${divTotal.supOn} / ${divTotal.cmeOff}, lobbies add up to ${all.supOn} / ${all.cmeOff} — the download may be incomplete.`);
    }
  } else {
    warnings.push('No division [TOTAL] row in the download — completeness could not be checked.');
  }
  return { rows, lobbies, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { rows, lobbies } = parsed;
  const get = (l) => lobbies.get(l) || { supOn: 0, cmeOff: 0 };
  const line = (l) => { const c = get(l); return [c.supOn, c.cmeOff, c.supOn + c.cmeOff]; };
  const sheet = SHEET_LOBBIES.map(line);
  const sum = (ls) => [0, 1, 2].map((i) => ls.reduce((s, l) => s + l[i], 0));

  const main = {
    title: 'Sign On/Off',
    note: 'SUP-SON = signed on by the supervisor at HQ. CME-SOFF = signed off directly by the CME.',
    headers: ['Sr No.', 'Lobby', 'SUP-SON', 'CME-SOFF', 'Total Cases'],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, ...sheet[i]]),
    total: ['', 'TOTAL', ...sum(sheet)],
    alertCols: [2, 3, 4],
  };
  const out = [main];

  const others = [...lobbies.keys()].filter((l) => !SHEET_LOBBIES.includes(l)).sort();
  if (others.length) {
    out.push({
      title: 'Other lobbies',
      headers: ['Lobby', 'SUP-SON', 'CME-SOFF', 'Total Cases'],
      rows: others.map((l) => [l, ...line(l)]),
      total: null,
      alertCols: [1, 2, 3],
    });
  }

  out.push({
    title: 'By lobby and designation',
    headers: ['Lobby', 'Desig.', 'SUP-SON', 'CME-SOFF'],
    rows: rows.filter((r) => r.supOn || r.cmeOff).map((r) => [r.lobby, r.desig, r.supOn, r.cmeOff]),
    total: null,
    emptyText: 'No supervisor sign-on or CME sign-off.',
  });
  return out;
}

module.exports = {
  key: 'signonoff',
  dateOffset: 2,          // data date = sheet date − 2 day(s)
  label: 'Sign On/Off',
  order: 120,
  matchesHeader,
  parse: parseSignOnOff,
  tables,
};
