'use strict';

/*
 * HQ drill: under a lobby's count on the Daily Position, the lobby's uploaded list and
 * its remarks (spec §7). Attached when a day is opened or uploaded — never frozen into
 * tables_json, so a remark written after the sheet was saved still shows.
 *
 * Two kinds of report:
 *   - counts-only (the six with a lobby list): a drill is ADDED at each lobby's count,
 *     rows = the lobby's list (or empty + "not uploaded");
 *   - names-from-HQ (safety due, change on approval, BOR, working hours sub): the
 *     existing drills GAIN "Lobby remark" / "By" columns, matched by crew id.
 */
const lobbyDay = require('./lobbyDay');
const ls = require('./lobbyStore');
const store = require('./store');

/*
 * First-table layout per counts-only report, from each module's tables()[0].headers:
 *   lobby  = index of the lobby column; counts = indexes of the count columns to drill
 *   (null = lobby names are in the HEADER row — one row across lobbies).
 */
const COLS = {
  fsd:       { lobby: 1, count: 3, counts: [3] },          // Sr No. | Lobby | FSD (Y) | FSD (N) | Total
  wrwor:     { lobby: 1, count: 4, counts: [3, 4] },       // Sr No. | Lobby | With Rule | Without Rule | WR to W/O Rule
  wrworhq:   { lobby: 1, count: 2, counts: [2, 3, 4, 5, 6, 7, 8, 9] }, // Sr No. | Lobby | HQ OS × 4
  dutyhours: { lobby: 1, count: 4, counts: [4] },          // Sr No. | Lobby | >09<=12 | >12<=14 | >14
  subhours:  { lobby: 1, count: 4, counts: [4] },
  contnight: { lobby: null, row: (rows) => rows.findIndex((r) => /^>4/.test(String(r[0]))) }, // Nights | CSMT | IGP …
  prdue:     { lobby: null, row: () => 0 },                // Crew / Lobby | CSMT | IGP …
};

// The lobby's own rows + current remarks as drill rows.
async function lobbyRows(card, lobby, dataDate) {
  const got = await lobbyDay.itemsFor(card, [lobby], dataDate);
  const remarks = await ls.remarksFor(lobbyDay.remarkKeyOf(card.key), [lobby], { cmsIds: got.items.map((i) => i.cmsId) });
  // The remark is what HQ clicks for: it follows the name, the list's other columns after.
  const rows = got.items.map((i) => {
    const m = remarks.get(`${i.cmsId}|${i.itemKey}`);
    return [...i.cols.slice(0, 2), m ? m.remark : '', m ? `${m.by} ${m.at}` : '', ...i.cols.slice(2)];
  });
  return { rows, headers: [...got.headers.slice(0, 2), 'Lobby remark', 'By', ...got.headers.slice(2)], list: got.list };
}

async function attach(reports, sheetDate) {
  for (const r of reports) {
    const card = lobbyDay.CARDS.find((c) => c.key === r.key);
    if (!card || !Array.isArray(r.tables) || !r.tables[0]) continue;
    const t = r.tables[0];
    const dataDate = store.dataDateFor(sheetDate, r.dateOffset);

    if (card.drill) {
      const cfg = COLS[r.key];
      if (!cfg) continue;
      const cells = [];
      if (cfg.lobby != null) {
        t.rows.forEach((row, i) => {
          const lobby = String(row[cfg.lobby] || '').toUpperCase();
          if (!/^[A-Z]{2,5}$/.test(lobby)) return;
          cfg.counts.forEach((c) => cells.push({ r: i, c, lobby }));
        });
      } else {
        const ri = cfg.row(t.rows);
        if (ri >= 0) t.headers.forEach((h, c) => { const L = String(h).toUpperCase(); if (c > 0 && /^[A-Z]{2,5}$/.test(L)) cells.push({ r: ri, c, lobby: L }); });
      }
      t.drill = (t.drill || []).filter((d) => !cells.some((x) => x.r === d.r && x.c === d.c));
      const perLobby = new Map();
      for (const cell of cells) {
        if (!perLobby.has(cell.lobby)) perLobby.set(cell.lobby, await lobbyRows(card, cell.lobby, dataDate));
        const got = perLobby.get(cell.lobby);
        t.drill.push({ r: cell.r, c: cell.c, title: `${r.label || r.key} — ${cell.lobby}`, headers: got.headers, rows: got.rows, sortCols: [0],
          lobbyNote: got.list ? `Lobby list from ${got.list.by}, ${got.list.at}` : `${cell.lobby}: list not uploaded by the lobby.` });
      }
    } else {
      // Names come from HQ's own file: add the remark columns to every drill of the report.
      for (const tb of r.tables) {
        for (const d of tb.drill || []) {
          if (!Number.isInteger(d.crewCol) || d.headers.includes('Lobby remark')) continue;
          const ids = [...new Set(d.rows.map((row) => String(row[d.crewCol] || '').toUpperCase()).filter(Boolean))];
          const lobbiesIn = [...new Set(ids.map((id) => id.replace(/\d.*$/, '')))];
          const remarks = await ls.remarksFor(lobbyDay.remarkKeyOf(r.key), lobbiesIn, { cmsIds: ids });
          d.headers = [...d.headers, 'Lobby remark', 'By'];
          d.rows.forEach((row) => {
            const id = String(row[d.crewCol] || '').toUpperCase();
            // HQ drill rows do not carry the item key; the latest current remark for the crew stands in.
            const hit = [...remarks.entries()].find(([k]) => k.startsWith(`${id}|`));
            row.push(hit ? hit[1].remark : '', hit ? `${hit[1].by} ${hit[1].at}` : '');
          });
        }
      }
    }
  }
  return reports;
}

module.exports = { attach, COLS };
