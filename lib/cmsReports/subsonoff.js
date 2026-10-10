'use strict';

/*
 * CMS "Sign On/Off Report" (suburban lobby summary) -> the CSTS / KYNS / PNVS rows of
 * "Sign On/Off without Biometric".
 *
 * One row per lobby. CMS names the columns only by letter in the download
 * (A, B, C ... "I=C+E+F" ... "M=J+L"); the screen shows the names:
 *   C KIOSK SIGN ON        D KIOSK SIGN ON RANDOM BA
 *   E SUPERVISOR SIGN ON   F SUPERVISOR SIGN ON RANDOM BA   G SUPERVISOR SIGN ON ENFORCED BA
 *   H CME SIGN ON          I TOTAL SIGN ON (=C+E+F)
 *   J KIOSK SIGN OFF       K KIOSK SIGN OFF RANDOM BA       L CME SIGN OFF   M TOTAL SIGN OFF (=J+L)
 *
 * The sheet takes (user, 2026-10-10): Total Sign On = I, Supervisory Sign On = E+F+G,
 * CME Sign On = H, CME Sign Off = L, Total Sign Off = M. The without-biometric counts
 * themselves come from three per-lobby crew lists (see parseList below). Columns are read by their LETTER header, so a column
 * CMS inserts later is refused rather than read shifted.
 *
 * The file carries no total row; I and M are checked per lobby instead. CMS's label says
 * I=C+E+F, but its figures are C+E+F+H (CME sign-ons included) — checked as the figures are.
 * Counts only — no crew in the file. The file carries no date.
 */

const { parse } = require('csv-parse/sync');

// Either line ending, per record (see wrwor.js).
const EOL = ['\r\n', '\n', '\r'];

// Lobbies printed on the daily sheet (user, 2026-10-10).
const SHEET_LOBBIES = ['CSTS', 'KYNS', 'PNVS'];

const HEADER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I=C+E+F', 'J', 'K', 'L', 'M=J+L'];
const LETTERS = 'ABCDEFGHIJKLM';

function norm(cell) {
  return String(cell == null ? '' : cell).trim().toUpperCase().replace(/\s+/g, '');
}

function matchesHeader(header) {
  const cells = (header || []).map(norm);
  return cells.length >= HEADER.length && HEADER.every((h, i) => cells[i] === h);
}

/*
 * Returns { lobbies: Map(lobby -> {C..M}), warnings }
 */
function parseSubSonOff(input) {
  const records = parse(input, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error('The file is empty.');
  if (!matchesHeader(records[0])) throw new Error('This is not the suburban sign-on / sign-off report: the header must read A, B, C … I=C+E+F … M=J+L.');

  const warnings = [];
  const lobbies = new Map();
  records.slice(1).forEach((rec, i) => {
    const lobby = norm(rec[1]);
    if (!lobby) return;
    const r = {};
    for (let c = 2; c < LETTERS.length; c++) {
      const raw = String(rec[c] == null ? '' : rec[c]).trim();
      if (!/^\d+$/.test(raw)) throw new Error(`Row ${i + 2} (${lobby}) has a non-numeric count "${raw}" in column ${LETTERS[c]}.`);
      r[LETTERS[c]] = Number(raw);
    }
    // CMS labels I as C+E+F, but its figures include the CME sign-ons (H).
    if (r.I !== r.C + r.E + r.F + r.H) warnings.push(`${lobby}: total sign on I = ${r.I}, but C+E+F+H = ${r.C + r.E + r.F + r.H}.`);
    if (r.M !== r.J + r.L) warnings.push(`${lobby}: total sign off M = ${r.M}, but J+L = ${r.J + r.L}.`);
    lobbies.set(lobby, r);
  });
  if (lobbies.size === 0) throw new Error('The file has a header but no lobby rows.');
  const missing = SHEET_LOBBIES.filter((l) => !lobbies.has(l));
  if (missing.length) warnings.push(`No row for ${missing.join(', ')} — the download may have the wrong filter.`);
  return { lobbies, warnings };
}

const ZERO = { C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0 };

/*
 * The without-biometric counts: one per-crew list per lobby (CMS "non biometric"
 * download, run once for each of CSTS / KYNS / PNVS). Every list has the same header,
 * so the page posts them by slot. A row is a sign on when Action = REST and a sign
 * off when Action = SIGNOFF; it is without biometric when CAM Flag(Lobby) = N
 * (user, 2026-10-10). Columns by header name.
 */
const LIST_FIELDS = [
  { key: 'crewId', aliases: ['CREW ID'] },
  { key: 'name',   aliases: ['CREW NAME'] },
  { key: 'desig',  aliases: ['DESIG'] },
  { key: 'action', aliases: ['ACTION'] },
  { key: 'when',   aliases: ['DATETIME'] },
  { key: 'lobby',  aliases: ['LOBBY'] },
  { key: 'cam',    aliases: ['CAM FLAG(LOBBY)'] },
];
const ACTIONS = { REST: 'on', SIGNOFF: 'off' };

function listMap(header) {
  const cells = (header || []).map((c) => String(c == null ? '' : c).trim().toUpperCase().replace(/\s+/g, ' '));
  const map = {};
  for (const f of LIST_FIELDS) {
    const i = cells.findIndex((c) => f.aliases.includes(c));
    if (i === -1) return null;
    map[f.key] = i;
  }
  return map;
}

function parseList(buffer, slotLobby) {
  const records = parse(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, record_delimiter: EOL });
  if (records.length === 0) throw new Error(`${slotLobby}: the file is empty.`);
  const col = listMap(records[0]);
  if (!col) throw new Error(`${slotLobby}: not the non-biometric crew list (Crew Id, Action, Lobby, CAM Flag(Lobby) …).`);
  const warnings = [];
  const out = { on: [], off: [], all: { on: 0, off: 0 } };
  const other = new Set();
  records.slice(1).forEach((rec) => {
    const lobby = norm(rec[col.lobby]);
    if (!lobby) return;
    if (lobby !== slotLobby) { other.add(lobby); return; }
    const which = ACTIONS[norm(rec[col.action])];
    if (!which) return;
    out.all[which]++;
    if (norm(rec[col.cam]) !== 'N') return;
    out[which].push({ crewId: String(rec[col.crewId] || '').trim(), name: String(rec[col.name] || '').trim(),
      desig: String(rec[col.desig] || '').trim(), when: String(rec[col.when] || '').trim() });
  });
  if (other.size) throw new Error(`${slotLobby}: this file is for ${[...other].join(', ')} — put it under that lobby's tab.`);
  if (out.all.on + out.all.off === 0) warnings.push(`${slotLobby}: the list has no sign-on or sign-off rows.`);
  return { ...out, warnings };
}

// Upload slots, in page order: the lobby summary plus one list per sheet lobby.
const PARTS = [
  { slot: 'sum', label: 'Lobby summary' },
  ...SHEET_LOBBIES.map((l) => ({ slot: l.toLowerCase(), label: `${l} list` })),
];

/*
 * files: { sum?, csts?, kyns?, pnvs? } buffers — at least one.
 * Returns { lobbies: Map|null, lists: {CSTS: list|null, ...}, warnings }
 */
function parseParts(files) {
  if (PARTS.every((p) => !files[p.slot])) throw new Error('No file uploaded.');
  const warnings = [];
  let lobbies = null;
  if (files.sum) {
    const s = parseSubSonOff(files.sum);
    lobbies = s.lobbies;
    warnings.push(...s.warnings);
  } else warnings.push('Lobby summary not uploaded — totals and % are blank.');
  const lists = {};
  SHEET_LOBBIES.forEach((l) => {
    const b = files[l.toLowerCase()];
    lists[l] = b ? parseList(b, l) : null;
    if (lists[l]) warnings.push(...lists[l].warnings);
    else warnings.push(`${l} list not uploaded — its without-biometric counts are blank.`);
  });
  // The lists and the summary are separate downloads: a different day or filter shows here.
  if (lobbies) SHEET_LOBBIES.forEach((l) => {
    const r = lobbies.get(l); const li = lists[l];
    if (!r || !li) return;
    if (li.all.on !== r.I || li.all.off !== r.M) {
      warnings.push(`${l}: the list has ${li.all.on} sign on / ${li.all.off} sign off, the summary ${r.I} / ${r.M} — check both are for the same day.`);
    }
  });
  return { lobbies, lists, warnings };
}

const pct = (n, d) => (n === '' || d === '' || !d ? '' : `${(100 * n / d).toFixed(1)}%`);

// Sheet columns, in sheet order; '' = its file not uploaded.
function line(r, li) {
  const on = li ? li.on.length : '';
  const off = li ? li.off.length : '';
  return r
    ? [r.I, on, pct(on, r.I), r.E + r.F + r.G, r.H, r.M, off, pct(off, r.M), r.L]
    : ['', on, '', '', '', '', off, '', ''];
}

// Printable tables — shape documented in lib/cmsReports/index.js.
function tables(parsed) {
  const { lobbies, lists } = parsed;
  const sheet = SHEET_LOBBIES.map((l) => line(lobbies ? lobbies.get(l) || ZERO : null, lists[l]));
  const add = (i) => {
    const vals = sheet.map((r) => r[i]);
    return vals.some((v) => v === '') ? '' : vals.reduce((s, v) => s + v, 0);
  };
  const total = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(add);
  total[2] = pct(total[1], total[0]);
  total[7] = pct(total[6], total[5]);

  const main = {
    title: 'Sign On/Sign Off without Biometric',
    note: 'Without biometric = CAM flag N in the lobby crew list. Supervisory sign on = supervisor + random BA + enforced BA. Click a count to see the crew.',
    headers: ['Sr No.', 'Lobby', 'Total', 'W/O Bio', '%', 'Supervisory', 'CME', 'Total', 'W/O Bio', '%', 'CME'],
    groups: [null, null, 'Sign On', 'Sign On', 'Sign On', 'Sign On', 'Sign On', 'Sign Off', 'Sign Off', 'Sign Off', 'Sign Off'],
    rows: SHEET_LOBBIES.map((l, i) => [i + 1, l, ...sheet[i]]),
    total: ['', 'TOTAL', ...total],
  };

  const crewHeaders = ['Crew Id', 'Crew Name', 'Desig.', 'Date / Time'];
  const crewRow = (c) => [c.crewId, c.name, c.desig, c.when];
  main.drill = [];
  [[3, 'on', 'sign on'], [8, 'off', 'sign off']].forEach(([c, which, what]) => {
    SHEET_LOBBIES.forEach((l, ri) => {
      const li = lists[l];
      if (!li || li[which].length === 0) return;
      main.drill.push({ r: ri, c, title: `${l} — ${what} without biometric`, headers: crewHeaders,
        rows: li[which].map(crewRow), sortCols: [0, 1, 2, 3] });
    });
    const all = SHEET_LOBBIES.filter((l) => lists[l]).flatMap((l) => lists[l][which].map((x) => [l, ...crewRow(x)]));
    if (all.length) {
      main.drill.push({ r: 'T', c, title: `All three lobbies — ${what} without biometric`,
        headers: ['Lobby', ...crewHeaders], rows: all, sortCols: [0, 1, 2, 3, 4] });
    }
  });

  const out = [main];
  if (lobbies) {
    const get = (l) => lobbies.get(l) || ZERO;
    out.push({
      title: 'All lobbies (lobby summary as downloaded)',
      headers: ['Lobby', 'Kiosk Sign On', 'Kiosk Random BA', 'Supervisor', 'Sup. Random BA', 'Sup. Enforced BA', 'CME Sign On', 'Total Sign On', 'Kiosk Sign Off', 'Kiosk Off Random BA', 'CME Sign Off', 'Total Sign Off'],
      rows: [...lobbies.keys()].sort().map((l) => { const r = get(l); return [l, r.C, r.D, r.E, r.F, r.G, r.H, r.I, r.J, r.K, r.L, r.M]; }),
      total: null,
    });
  }
  return out;
}

// Either file kind — summary or crew list — is this report's; both go in by slot.
function matchesAny(header) {
  return matchesHeader(header) || listMap(header) !== null;
}

module.exports = {
  key: 'subsonoff',
  dateOffset: 1,          // data date = sheet date − 1 day(s)
  label: 'Sign On/Sign Off without Biometric',
  order: 125,
  slotOnly: true,         // summary + 3 look-alike lobby lists: uploaded via slots only
  PARTS,
  matchesHeader: matchesAny,
  parseParts,
  tables,
};
