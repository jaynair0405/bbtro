'use strict';

/*
 * Which CMS lobby a division office speaks for, and which further lobbies it covers
 * (lobbies with no office of their own in users.div_office_code). Read by the Lobby
 * page, the upload check and the HQ drill — the only place this mapping lives.
 */
const LOBBY_OFFICES = {
  'CSMT-ML':  { lobby: 'CSMT', covers: ['DR'] },
  'KYN-ML':   { lobby: 'KYN',  covers: [] },
  'PNVL-ML':  { lobby: 'PNVL', covers: ['JNPN', 'ROHA'] },
  'IGP':      { lobby: 'IGP',  covers: [] },
  'LNL':      { lobby: 'LNLX', covers: ['LNL'] },
  'VVH':      { lobby: 'VVH',  covers: [] },
  'NRL':      { lobby: 'NRL',  covers: [] },
  'CSMT-SUB': { lobby: 'CSTS', covers: [] },
  'KYN-SUB':  { lobby: 'KYNS', covers: [] },
  'PNVL-SUB': { lobby: 'PNVS', covers: [] },
};

const WRITER_ROLES = ['jrcc', 'office_hr'];
const VIEWER_ROLES = ['clicms', 'division_admin'];

function lobbyOf(officeCode) {
  const m = LOBBY_OFFICES[String(officeCode || '').toUpperCase()];
  return m ? { lobby: m.lobby, covers: [...m.covers] } : null;
}

// The lobby and everything it covers, as one list (own lobby first).
function lobbiesOf(officeCode) {
  const m = lobbyOf(officeCode);
  return m ? [m.lobby, ...m.covers] : [];
}

const isLobbyWriterRole = (user) => !!user && WRITER_ROLES.includes(user.div_role);
const isLobbyViewerRole = (user) => !!user && VIEWER_ROLES.includes(user.div_role);

// May this session user upload / remark for `lobby`?
function canWriteLobby(user, lobby) {
  if (!isLobbyWriterRole(user)) return false;
  return lobbiesOf(user.div_office_code).includes(String(lobby || '').toUpperCase());
}

// The office whose lobby this is (for a lobby chosen by a viewer) — null if none.
function officeOfLobby(lobby) {
  const L = String(lobby || '').toUpperCase();
  return Object.keys(LOBBY_OFFICES).find((o) => LOBBY_OFFICES[o].lobby === L || LOBBY_OFFICES[o].covers.includes(L)) || null;
}

module.exports = { LOBBY_OFFICES, lobbyOf, lobbiesOf, canWriteLobby, isLobbyWriterRole, isLobbyViewerRole, officeOfLobby };
