'use strict';

/*
 * Lobby page routes (mounted at /clicms/lobby by routes/clicms.js). Writers = jrcc /
 * office_hr of the lobby's office; HQ (clicms, division_admin) views any lobby.
 * All POST, so the service worker never caches them.
 */
const express = require('express');
const multer = require('multer');
const lobbies = require('../lib/cmsReports/lobbies');
const lists = require('../lib/cmsReports/lobbyLists');
const lobbyDay = require('../lib/cmsReports/lobbyDay');
const store = require('../lib/cmsReports/store');
const ls = require('../lib/cmsReports/lobbyStore');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const safeISO = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '');

// Which lobbies this request is about, and whether the user may write them.
function scope(req) {
  const user = req.session && req.session.user;
  if (lobbies.isLobbyWriterRole(user)) {
    const m = lobbies.lobbyOf(user.div_office_code);
    if (!m) return { error: `No CMS lobby is mapped to your office (${user.div_office_code || 'none'}).` };
    return { lobby: m.lobby, lobbies: [m.lobby, ...m.covers], writer: true, user };
  }
  if (lobbies.isLobbyViewerRole(user)) {
    const want = String((req.body || {}).lobby || '').toUpperCase();
    const office = want && lobbies.officeOfLobby(want);
    if (!office) return { error: 'Choose a lobby.', choose: Object.values(lobbies.LOBBY_OFFICES).map((o) => o.lobby) };
    const m = lobbies.lobbyOf(office);
    return { lobby: m.lobby, lobbies: [m.lobby, ...m.covers], writer: false, user };
  }
  return { error: 'Not allowed.' };
}

const dayOut = (day, s, extra) => ({ ...day, lobby: s.lobby, covers: s.lobbies.slice(1), writer: s.writer, ...extra });

router.post('/day', express.json(), async (req, res) => {
  const sheetDate = safeISO((req.body || {}).sheetDate);
  if (!sheetDate) return res.status(400).json({ error: 'Choose a valid sheet date.' });
  const s = scope(req);
  if (s.error) return res.status(403).json({ error: s.error, choose: s.choose || null });
  try {
    const day = await lobbyDay.build({ sheetDate, lobbies: s.lobbies });
    res.json(dayOut(day, s, { catalogue: lists.catalogue() }));
  } catch (err) {
    res.status(500).json({ error: `Could not build the lobby day (${err.message}).` });
  }
});

/*
 * One list (several files for WR/WOR) for one card. Refused when the file is another
 * list, carries another lobby's crew, or is dated for another sheet. Never refused for
 * disagreeing with HQ's count — the lobby downloads later than HQ did.
 */
router.post('/upload', upload.array('files', 6), async (req, res) => {
  const s = scope(req);
  if (s.error) return res.status(403).json({ error: s.error });
  if (!s.writer) return res.status(403).json({ error: 'Viewing only — the lobby uploads its own lists.' });
  const sheetDate = safeISO((req.body || {}).sheetDate);
  const key = String((req.body || {}).key || '');
  const card = lobbyDay.CARDS.find((c) => c.key === key && c.drill);
  const files = req.files || [];
  if (!sheetDate || !card || files.length === 0) return res.status(400).json({ error: 'Send the sheet date, the report and at least one file.' });
  const mod = lists.byKey(card.drill);
  // The card's own offset (subhours and dutyhours share whlist but are both D-2; wrworhq = wrwor D-1).
  const dateOffset = require('../lib/cmsReports').catalogue().find((c) => c.key === card.key).dateOffset;
  try {
    const parsedList = files.map((f) => {
      const got = lists.processLobbyFile(f.buffer);
      if (got.key !== mod.key) throw new Error(`${f.originalname}: this is the ${got.label} list, not ${mod.label}.`);
      return got.parsed;
    });
    if (parsedList.length > 1 && !mod.merge) throw new Error(`${mod.label}: upload one file.`);
    const parsed = mod.merge ? parsedList.reduce((a, b) => mod.merge(a, b)) : parsedList[0];
    const dataDate = store.dataDateFor(sheetDate, dateOffset);
    const chk = mod.checkDate(parsed, { dataDate, sheetDate });
    if (chk && chk.error) return res.status(400).json({ error: `${mod.label}: ${chk.error}` });
    const items = mod.key === 'wrworlist' ? mod.items(parsed, { lobby: s.lobby }) : mod.items(parsed);
    const foreign = items.filter((i) => !s.lobbies.includes(i.lobby));
    if (foreign.length) {
      const some = [...new Set(foreign.map((i) => `${i.lobby} ${i.cmsId}`))].slice(0, 5).join(', ');
      return res.status(400).json({ error: `${foreign.length} row${foreign.length > 1 ? 's' : ''} of another lobby (${some}${foreign.length > 5 ? ', …' : ''}) — download the list filtered to ${s.lobbies.join(' / ')}.` });
    }
    if (items.length === 0) return res.status(400).json({ error: `${mod.label}: no rows for ${s.lobbies.join(' / ')} in this file.` });
    const warnings = [...(parsed.warnings || []), ...(chk && chk.unchecked ? [`Date not checked: ${chk.unchecked}.`] : [])];
    const report = { key: card.key, dateOffset, tables: [], warnings };
    const facts = { counts: [], crew: items.map((i) => ({ lobby: i.lobby, cmsId: i.cmsId, name: i.name, measure: i.measure || mod.measure, eventTime: i.eventTime,
      detail: { itemKey: i.itemKey, cols: i.cols, desig: i.desig, blocks: i.blocks || null, ...(i.detail || {}) } })) };
    const packed = files.map((f, i) => ({ name: f.originalname, buffer: f.buffer, slot: files.length > 1 ? `f${i + 1}` : undefined }));
    await store.saveLoad({ report, facts, sheetDate, files: packed, hand: null, user: s.user.username, lobby: s.lobby });
    // WR/WOR: one upload serves both blocks (same lists, same date).
    if (card.key === 'wrwor' || card.key === 'wrworhq') {
      const other = card.key === 'wrwor' ? 'wrworhq' : 'wrwor';
      await store.saveLoad({ report: { ...report, key: other }, facts, sheetDate, files: packed, hand: null, user: s.user.username, lobby: s.lobby });
    }
    const day = await lobbyDay.build({ sheetDate, lobbies: s.lobbies });
    res.json(dayOut(day, s, { warnings, uploaded: card.key }));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not read the file.' });
  }
});

router.post('/remark', express.json(), async (req, res) => {
  const s = scope(req);
  if (s.error) return res.status(403).json({ error: s.error });
  if (!s.writer) return res.status(403).json({ error: 'Viewing only.' });
  const { key, cmsId, itemKey, remark } = req.body || {};
  if (!lobbyDay.CARDS.some((c) => c.key === key) || !cmsId || !itemKey) return res.status(400).json({ error: 'Missing report, crew or item.' });
  const id = String(cmsId).toUpperCase();
  // Covered lobbies' crew (DR, JNPN…) may carry the parent's prefix; the row's lobby was
  // checked at upload, so here the prefix only has to be one of the writer's lobbies.
  if (!s.lobbies.includes(id.replace(/\d.*$/, ''))) return res.status(403).json({ error: `${id} is not ${s.lobbies.join(' / ')} crew.` });
  try {
    const out = await ls.saveRemark({ reportKey: key, lobby: s.lobby, cmsId: id, itemKey: String(itemKey).slice(0, 60), remark, user: s.user.username });
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: `Could not save the remark (${err.message}).` });
  }
});

module.exports = router;
