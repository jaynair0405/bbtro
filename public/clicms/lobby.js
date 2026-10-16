'use strict';

/*
 * Lobby page: one card per drill report on the Daily Position; the lobby uploads the CMS
 * crew list behind its count and writes a remark per name. Data from POST lobby/day,
 * lobby/upload, lobby/remark (routes/clicmsLobby.js). HQ users pick a lobby and view.
 */
const API_BASE = './';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const state = { date: '', day: null, user: null, lobby: '' };

const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const fmt = (iso) => (iso ? iso.split('-').reverse().join('-') : '');
const shift = (iso, days) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };

async function post(url, body, isForm) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'POST', credentials: 'same-origin',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' }, body: isForm ? body : JSON.stringify(body) });
  if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) throw new Error('Your session has expired — log in again.');
  const data = await res.json();
  if (!res.ok) { const e = new Error(data.error || 'Request failed.'); e.data = data; throw e; }
  return data;
}
function showErr(msg) { $('err').textContent = msg; $('err').hidden = !msg; if (msg) window.scrollTo(0, 0); }

async function load(date) {
  state.date = date; $('sheetDate').value = date; showErr('');
  try {
    const body = { sheetDate: date }; if (state.lobby) body.lobby = state.lobby;
    state.day = await post('lobby/day', body);
    render();
  } catch (err) {
    if (err.data && err.data.choose) { showPicker(err.data.choose); return; }
    showErr(err.message);
  }
}
function showPicker(lobbies) {
  const sel = $('lobbyPick'); sel.hidden = false;
  if (!sel.options.length) sel.innerHTML = `<option value="">Choose a lobby…</option>${lobbies.map((l) => `<option>${esc(l)}</option>`).join('')}`;
  $('intro').textContent = 'HQ view: choose a lobby to see its lists and remarks.';
  $('chips').innerHTML = ''; $('cards').innerHTML = '';
}
$('lobbyPick').addEventListener('change', (e) => { state.lobby = e.target.value; if (state.lobby) load(state.date); });

const CHIP = { done: 'done', pending: 'part', needed: 'need', none: 'none', nohq: 'none' };
function stateLabel(c) {
  switch (c.state) {
    case 'done': return 'remarked';
    case 'pending': return `${c.pending} remark${c.pending > 1 ? 's' : ''} pending`;
    case 'needed': return 'list needed';
    case 'nohq': return 'HQ not loaded';
    default: return '';
  }
}

// Text typed but not yet saved: kept on the item, so a render (after an upload or another
// card's Save) does not throw it away.
function harvestDrafts() {
  document.querySelectorAll('#cards td.rem').forEach((td) => {
    const inp = td.querySelector('input'); if (!inp || !state.day) return;
    const it = findItem(td); if (it) it.draft = inp.value;
  });
}
function render() {
  harvestDrafts();
  const d = state.day;
  $('lobbyTag').textContent = d.lobby;
  $('covers').textContent = d.covers.length ? `also ${d.covers.join(', ')}` : '';
  if (!d.writer) { $('lobbyPick').hidden = false; $('lobbyPick').value = d.lobby; }
  $('intro').textContent = d.writer
    ? `Daily Position and Due List open read-only for a lobby user. Below is what the sheet of ${fmt(d.sheetDate)} shows against ${d.lobby}${d.covers.length ? ' and ' + d.covers.join(', ') : ''}. Each count is HQ's figure from the CMS download; upload your list and add a remark against each name.`
    : `Viewing ${d.lobby}'s lists and remarks for the sheet of ${fmt(d.sheetDate)}.`;
  $('chips').innerHTML = d.cards.map((c) => {
    const n = c.hq ? c.hq.value : (c.items.length || '—');
    const lab = stateLabel(c);
    return `<span class="chk ${CHIP[c.state]}">${esc(c.label)} <b>${esc(n)}</b>${lab ? ' · ' + esc(lab) : ''}</span>`;
  }).join('');
  $('cards').innerHTML = d.cards.map(card).join('');
}

function statusOf(c) {
  if (c.list) {
    if (c.source === 'hq') return { cls: c.state === 'done' ? 'done' : 'part', text: "names from HQ's file" };
    let text = `${state.day.writer ? 'your list' : "lobby's list"}: ${c.list.count} name${c.list.count === 1 ? '' : 's'}`;
    if (c.hq) text += c.list.count === c.hq.value ? ', matches' : `, HQ counts ${c.hq.value}`;
    return { cls: c.state === 'done' ? 'done' : 'part', text };
  }
  if (c.upload && c.hq && c.hq.value > 0) return { cls: 'need', text: 'list not uploaded' };
  return null;
}

function card(c) {
  const d = state.day;
  const st = statusOf(c);
  const head = `<div class="report-head"><h2>${esc(c.label)} <span class="src">D-${c.dateOffset} · data of ${fmt(c.dataDate)}</span></h2>
    <div class="hqcount">${c.hq ? `HQ count ${esc(d.lobby)} <b class="${c.hq.value ? '' : 'zero'}">${c.hq.value}</b>` : 'HQ has not loaded this report'}${st ? ` · <span class="status ${st.cls}">${esc(st.text)}</span>` : ''}</div></div>`;
  if (c.state === 'none' && !c.items.length) {
    return `<section class="report" data-card="${esc(c.key)}">${head}<p class="empty">Nothing against ${esc(d.lobby)} on this sheet.</p>${uploadRow(c, true)}</section>`;
  }
  const showLobby = d.covers.length > 0;
  const rows = c.items.map((i) => `<tr>${i.cols.map((v, k) => `<td class="${k === 0 ? 'mono' : ''}">${esc(v)}${k === 1 && i.fromMaster ? ' <span class="flag">name from staff master</span>' : ''}</td>`).join('')}${showLobby ? `<td class="lobby-col">${esc(i.lobby)}</td>` : ''}
      <td class="rem" data-key="${esc(c.key)}" data-cms="${esc(i.cmsId)}" data-item="${esc(i.itemKey)}">${remarkCell(i, d.writer)}</td></tr>`).join('');
  const table = c.items.length ? `<div class="table-wrap"><table><thead><tr>${c.headers.map((h) => `<th class="txt">${esc(h)}</th>`).join('')}${showLobby ? '<th class="txt">Lobby</th>' : ''}<th class="txt">Remark</th></tr></thead><tbody>${rows}</tbody></table></div>` : '';
  const src = c.list ? `<span class="src">${c.source === 'hq' ? "HQ's file" : esc(c.list.fileNames || 'list')} · ${esc(c.list.by)} ${esc(c.list.at)}</span>` : '';
  const save = d.writer && c.items.length ? `<button type="button" class="btn btn-primary" data-save="${esc(c.key)}">Save remarks</button>` : '';
  return `<section class="report" data-card="${esc(c.key)}">${head}${uploadRow(c, false)}${table}<div class="card-actions">${save}${src}</div></section>`;
}
function uploadRow(c, quiet) {
  const d = state.day;
  if (!c.upload || !d.writer) return '';
  // Shown even before HQ has loaded the report — the lobby may be first.
  if (quiet && c.hq && c.hq.value === 0) return '';
  const wr = c.key === 'wrwor' || c.key === 'wrworhq';
  return `<div class="upload-row"><span class="what">${c.list ? 'Replace' : 'Upload'} the CMS ${esc(c.label)} list for ${esc(d.lobby)}</span>
      <label class="btn btn-primary">Choose CSV<input type="file" accept=".csv,text/csv" ${wr ? 'multiple' : ''} hidden data-up="${esc(c.key)}" /></label>
      <span class="date-note">${wr ? 'WOR and WR→WOR lists, lobbywise and HQ-wise, can go in together; one upload fills both WR/WOR blocks.' : `Data of ${fmt(c.dataDate)}.`}</span></div>`;
}
function remarkCell(i, writer) {
  if (i.remark && !i.editing) {
    return `<span class="saved">${esc(i.remark.remark)}</span><span class="by">${esc(i.remark.by)} · ${esc(i.remark.at)}</span>${writer ? '<span class="edit">edit</span>' : ''}`;
  }
  if (!writer) return '<span class="empty">—</span>';
  const text = i.draft != null ? i.draft : (i.remark ? i.remark.remark : '');
  return `<input type="text" value="${esc(text)}" placeholder="Remark" maxlength="2000" />`;
}
function findItem(td) {
  const c = state.day.cards.find((x) => x.key === td.dataset.key);
  return c.items.find((i) => i.cmsId === td.dataset.cms && i.itemKey === td.dataset.item);
}

// Upload a list
$('cards').addEventListener('change', async (e) => {
  const inp = e.target.closest('input[data-up]'); if (!inp || !inp.files.length) return;
  const fd = new FormData(); fd.append('key', inp.dataset.up); fd.append('sheetDate', state.date);
  [...inp.files].forEach((f) => fd.append('files', f));
  inp.disabled = true;
  try {
    harvestDrafts();
    const drafts = new Map(state.day.cards.flatMap((c) => c.items.filter((i) => i.draft != null).map((i) => [`${c.key}|${i.cmsId}|${i.itemKey}`, i.draft])));
    state.day = await post('lobby/upload', fd, true);
    state.day.cards.forEach((c) => c.items.forEach((i) => { const v = drafts.get(`${c.key}|${i.cmsId}|${i.itemKey}`); if (v != null) i.draft = v; }));
    render();
    if (state.day.warnings && state.day.warnings.length) showErr(state.day.warnings.join(' '));
  } catch (err) { showErr(err.message); inp.disabled = false; inp.value = ''; }
});

// Edit a saved remark; Save a card's changed remarks
$('cards').addEventListener('click', async (e) => {
  const ed = e.target.closest('.edit');
  if (ed) {
    const td = ed.closest('td.rem'); const it = findItem(td); it.editing = true;
    td.innerHTML = remarkCell(it, true); td.querySelector('input').focus(); return;
  }
  const btn = e.target.closest('button[data-save]'); if (!btn) return;
  const sec = btn.closest('section');
  const tds = [...sec.querySelectorAll('td.rem')].filter((td) => td.querySelector('input'));
  btn.disabled = true; showErr('');
  try {
    for (const td of tds) {
      const it = findItem(td); const text = td.querySelector('input').value.trim();
      if ((it.remark ? it.remark.remark : '') === text) { it.editing = false; td.innerHTML = remarkCell(it, true); continue; }
      const out = await post('lobby/remark', { key: td.dataset.key, cmsId: td.dataset.cms, itemKey: td.dataset.item, remark: text });
      it.remark = out.withdrawn ? null : { remark: text, by: out.by, at: out.at }; it.editing = false; delete it.draft;
      td.innerHTML = remarkCell(it, true);
      // The two WR/WOR cards share one remark per booking.
      const twin = { wrwor: 'wrworhq', wrworhq: 'wrwor' }[td.dataset.key];
      if (twin) {
        const tc = state.day.cards.find((x) => x.key === twin);
        const ti = tc && tc.items.find((i) => i.cmsId === it.cmsId && i.itemKey === it.itemKey);
        if (ti) { ti.remark = it.remark; ti.editing = false; delete ti.draft; }
      }
    }
    state.day.cards.forEach((c) => {
      c.pending = c.items.filter((i) => !i.remark).length;
      if (c.state === 'pending' || c.state === 'done') c.state = c.pending ? 'pending' : 'done';
    });
    render();
  } catch (err) { showErr(err.message); }
  finally { btn.disabled = false; }
});

// Date
$('sheetDate').addEventListener('change', () => load($('sheetDate').value));
$('prevDay').addEventListener('click', () => load(shift(state.date, -1)));
$('nextDay').addEventListener('click', () => load(shift(state.date, 1)));

(async function start() {
  try {
    const res = await fetch('/api/current-user', { credentials: 'same-origin' });
    if (res.ok) {
      state.user = await res.json();
      $('who').innerHTML = `signed in as <strong>${esc(state.user.username)}</strong>`;
      const b = $('navBtn');
      if (state.user.div_role === 'division_admin' || state.user.role === 'admin') { b.textContent = '← Dashboard'; b.href = '/div'; }
      else { b.textContent = 'Logout'; b.href = '/api/logout'; }
      b.hidden = false;
    }
  } catch (e) { /* leave hidden */ }
  load(istToday());
})();
