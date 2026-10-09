'use strict';

/*
 * CMS lobby device position -> "Kiosk Detail".
 *
 * One row per CSTM lobby: thin clients (TC) and kiosks (K) by model, used / unused
 * (UU), and for each of BA (breath analyser), BIO (biometric) and CAM (camera)
 * whether it is enabled (EN) or disabled (DIS) on the used and unused devices:
 *
 *   SNO | ZONE | DIV | LOBBY | TOTALTHIN CLIENT | ... | TC(USED) | TC(UU) |
 *   TOTALKIOSK | ... | KIOSK(USED) | KIOSK(UU) | TOTAL(TC+K) |
 *   BA EN(USED) | BA DIS(USED) | BA EN(UU) | BA DIS(UU) | BIO ... | CAM ...
 *
 * CMS writes a "[TOTAL]" row into the data; it is never counted, but our sums are
 * checked against it (see fsd.js for why).
 *
 * The sheet's four lines: kiosks in use, and lobbies with BIO / BA / CAM disabled on
 * a device IN USE. Disabled on an unused device does not stop anyone signing on.
 *
 * The file carries no date — the caller supplies it.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

const FIELDS = [
  { key: 'lobby',   aliases: ['LOBBY'] },
  { key: 'tc',      aliases: ['TOTALTHIN CLIENT', 'TOTAL THIN CLIENT'] },
  { key: 'tcUsed',  aliases: ['TC(USED)'] },
  { key: 'k',       aliases: ['TOTALKIOSK', 'TOTAL KIOSK'] },
  { key: 'kUsed',   aliases: ['KIOSK(USED)'] },
  { key: 'baDis',   aliases: ['BA DIS(USED)'] },
  { key: 'bioDis',  aliases: ['BIO DIS(USED)'] },
  { key: 'camDis',  aliases: ['CAM DIS(USED)'] },
];
const COUNTS = FIELDS.filter((f) => f.key !== 'lobby').map((f) => f.key);

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
 * Returns { lobbies: [{ lobby, tc, tcUsed, k, kUsed, baDis, bioDis, camDis }], totals, warnings }
 */
function parseKiosk(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  const col = columnMap(records[0]);
  if (!col) throw new Error('This is not the kiosk / thin client report: LOBBY, TOTALKIOSK, KIOSK(USED), BA / BIO / CAM DIS(USED) are all required.');

  const warnings = [];
  const lobbies = [];
  let cmsTotal = null;
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[col.lobby]);
    if (!lobby) return;
    const r = { lobby };
    COUNTS.forEach((k) => {
      const raw = String(rec[col[k]] == null ? '' : rec[col[k]]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby}) has a non-numeric count "${raw}".`);
      r[k] = Number(raw);
    });
    if (lobby.includes('TOTAL')) cmsTotal = r;
    else lobbies.push(r);
  });
  if (lobbies.length === 0) throw new Error('The file has a header but no lobby rows.');

  const totals = {};
  COUNTS.forEach((k) => { totals[k] = lobbies.reduce((s, l) => s + l[k], 0); });
  if (cmsTotal) {
    COUNTS.forEach((k) => {
      if (cmsTotal[k] !== totals[k]) {
        warnings.push(`CMS total for ${FIELDS.find((f) => f.key === k).aliases[0]} is ${cmsTotal[k]}, the lobbies add up to ${totals[k]} — the download may be incomplete.`);
      }
    });
  } else {
    warnings.push('No [TOTAL] row in the download — completeness could not be checked.');
  }
  return { lobbies, totals, warnings };
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { lobbies, totals } = parsed;
  const which = (k) => lobbies.filter((l) => l[k] > 0).map((l) => l.lobby).join(', ') || '0';

  const main = {
    title: 'Kiosk Detail',
    headers: ['Sr No.', 'Details', 'Units', 'Lobby Detail'],
    rows: [
      [1, 'Total kiosk used', totals.kUsed, String(totals.kUsed)],
      [2, 'Biometric disabled', totals.bioDis, which('bioDis')],
      [3, 'BA disabled', totals.baDis, which('baDis')],
      [4, 'Camera disabled', totals.camDis, which('camDis')],
    ],
    total: null,
  };

  const detail = {
    title: 'By lobby',
    note: 'Lobbies with a device in use or something disabled. Disabled = on a device in use.',
    headers: ['Lobby', 'Thin clients used', 'Thin clients', 'Kiosks used', 'Kiosks', 'BIO disabled', 'BA disabled', 'CAM disabled'],
    rows: lobbies.filter((l) => l.tcUsed || l.kUsed || l.bioDis || l.baDis || l.camDis)
      .map((l) => [l.lobby, l.tcUsed, l.tc, l.kUsed, l.k, l.bioDis, l.baDis, l.camDis]),
    total: ['TOTAL', totals.tcUsed, totals.tc, totals.kUsed, totals.k, totals.bioDis, totals.baDis, totals.camDis],
    alertCols: [5, 6, 7],
  };
  return [main, detail];
}

module.exports = {
  key: 'kiosk',
  dateOffset: 0,          // data date = sheet date − 0 day(s)
  label: 'Kiosk Detail',
  order: 90,
  matchesHeader,
  parse: parseKiosk,
  tables,
};
