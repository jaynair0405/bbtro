'use strict';

// Daily Position: a day's CMS count reports, recognised by content and stacked on
// one page. Every report arrives as generic tables ({title, headers, rows, total}),
// so this file knows nothing about any particular report — see lib/cmsReports/index.js.

// Resolve API calls relative to the page's own directory (works under any mount point).
const API_BASE = new URL('.', window.location.href).href; // always ends with "/"

const state = {
  date: '',        // ISO — typed by the user; the CMS files carry none
  catalogue: [],   // [{key,label,order}] every report the server knows
  reports: [],     // [{key,label,order,file,tables,warnings}] loaded so far
  layout: null,    // one-view pages (lib/cmsReports/position.js PAGES), from daily/catalogue
  drawer: null,    // key of the report whose details are open in the side drawer
};

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function dataDateOf(r) {
  const d = new Date(`${state.date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (r.dateOffset || 0));
  return d.toISOString().slice(0, 10);
}
function isoToDDMMYYYY(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

// The SHEET date is today (IST) and locked: users were picking a report's own date
// (yesterday for FSD…) here, which shifts every report. "Older sheet?" unlocks it for a
// missed day. Each report's data date follows from the sheet date (dateOffset).
const TODAY = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
$('reportDate').value = TODAY;

function showDateLock() {
  const older = !$('reportDate').disabled;
  ['reportDate', 'dayDate'].forEach((id) => { $(id).disabled = !older; });
  $('todayTag').hidden = $('reportDate').value !== TODAY;
  $('dayTodayTag').hidden = (state.date || $('reportDate').value) !== TODAY;
  document.querySelectorAll('[data-older]').forEach((a) => {
    a.textContent = older ? 'Back to today' : (a.closest('.day-title') ? 'Older sheet?' : 'Making an older sheet?');
  });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-older]');
  if (!a) return;
  e.preventDefault();
  if ($('reportDate').disabled) {             // unlock for a missed day
    $('reportDate').disabled = false;
    showDateLock();
    alertOlder();
    return;
  }
  $('reportDate').disabled = true;            // back to today
  clearDay();
  $('reportDate').value = TODAY;
  showDateLock();
  openDay(TODAY);
});
function alertOlder() {
  $('dayStatus').textContent = 'Older sheet: pick the date that sheet was DUE (sent to officers), not the reports\' dates.';
}

// "today's data" / "yesterday's data" for the sheet of today; a plain date for an older sheet.
function dataWords(dataDate, sheet) {
  if (sheet === TODAY) {
    const back = Math.round((Date.parse(TODAY) - Date.parse(dataDate)) / 86400000);
    if (back === 0) return "today's data";
    if (back === 1) return "yesterday's data";
    if (back === 2) return 'day before yesterday';
  }
  return `data of ${isoToDDMMYYYY(dataDate)}`;
}

// Everything already saved for a sheet date: shown straight away, so a day can be
// reopened, added to or exported later. Quietly does nothing if the date has none.
async function openDay(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  $('dayStatus').textContent = 'Looking for a saved day…';
  try {
    const res = await fetch(`${API_BASE}daily/day`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sheetDate: date }),
    });
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) throw new Error('Your session has expired — log in again.');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not read the saved day.');
    if ($('reportDate').value !== date || state.reports.length) return;   // the user moved on meanwhile
    if (data.reports.length === 0) { $('dayStatus').textContent = 'Nothing saved for this date yet.'; return; }
    state.date = date;
    state.catalogue = data.catalogue || state.catalogue;
    state.reports = data.reports;
    $('dayStatus').textContent = '';
    $('uploadStage').hidden = true;
    $('workStage').hidden = false;
    render();
  } catch (err) {
    $('dayStatus').textContent = err.message;
  }
}
$('reportDate').addEventListener('change', () => openDay($('reportDate').value));

// One POST to the daily API. Throws a readable message; a 409 (conflict) is returned.
async function call(url, opts) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'POST', ...opts });
  // A login redirect comes back as an HTML page: say so instead of a JSON parse error.
  if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) {
    throw new Error('Your session has expired — log in again, then try again.');
  }
  const data = await res.json();
  if (!res.ok && res.status !== 409) throw new Error(data.error || 'Request failed.');
  return Object.assign(data, { status: res.status });
}

// ---------- Confirm before saving ----------
// Every way of adding a report (files, tabs, fill by hand) comes through here. The server
// builds the reports without saving (check=1); the box lists the data date each one WOULD
// be saved under and whether that replaces a saved one. The sheet date can be changed in
// the box. Only Confirm saves (the same request again, check off).
//   send(date, check, opts) -> response JSON      apply(data) -> show the saved result
// A report whose files join (PDD) and is already saved for the day asks instead:
// Add to saved (default) or Replace saved — opts.mode = 'add' | 'replace'.
function confirmSave(send, apply) {
  const dlg = $('confirmBox');
  const date = state.reports.length ? state.date : $('reportDate').value;
  $('confirmFor').innerHTML = date === TODAY
    ? `Position for: <strong>Today, ${isoToDDMMYYYY(date)}</strong>`
    : `Position for: <strong class="older">${isoToDDMMYYYY(date)} (older sheet)</strong>`;
  let seq = 0;

  async function check() {
    const my = ++seq;
    $('confirmOk').disabled = true;
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) {
      $('confirmList').innerHTML = '<p class="tnote">Choose the sheet date first.</p>';
      return;
    }
    $('confirmList').innerHTML = '<p class="tnote">Checking…</p>';
    try {
      const data = await send(date, true);
      if (my !== seq) return;                        // the date was changed meanwhile
      const reps = data.reports || (data.report ? [data.report] : []);
      const rej = data.rejected || [];
      // Grouped today / yesterday / day before, sheet order within each.
      reps.sort((a, b) => (a.dateOffset || 0) - (b.dateOffset || 0) || a.order - b.order);
      const dd = (iso) => isoToDDMMYYYY(iso).slice(0, 5);
      const saved = (r) => `${esc(r.check.existing.by)}, ${esc(r.check.existing.at)}`;
      const row = (r) => `<tr><td>${esc(r.label)}${!r.check || !r.check.existing ? ''
        : r.check.mergeable
          ? `<div class="replaces">⚠ ${esc(r.label)} already saved (${saved(r)})</div>
             <label class="merge-pick"><input type="radio" name="mergeMode" value="add" checked> <strong>Add to saved ${esc(r.label)}</strong> — keeps the saved files, adds these</label>
             <label class="merge-pick"><input type="radio" name="mergeMode" value="replace"> <strong>Replace saved ${esc(r.label)}</strong> — start again with only these files</label>`
          : `<div class="replaces">⚠ replaces saved (${saved(r)})</div>`}</td>
        <td>${esc(dataWords(r.check.dataDate, date))}</td><td class="mono dim">${dd(r.check.dataDate)}</td></tr>`;
      $('confirmList').innerHTML =
        (reps.length ? `<table class="confirm-tbl"><tbody>${reps.map(row).join('')}</tbody></table>` : '') +
        (rej.length ? `<div class="confirm-rej"><strong>Not recognised</strong><ul>${rej.map((x) =>
          `<li>${x.file ? `<strong>${esc(x.file)}</strong> — ` : ''}${esc(x.error)}</li>`).join('')}</ul></div>` : '') +
        (reps.length ? '' : '<p class="err">Nothing to save.</p>');
      $('confirmOk').disabled = reps.length === 0;
    } catch (err) {
      if (my === seq) $('confirmList').innerHTML = `<p class="err">${esc(err.message)}</p>`;
    }
  }

  $('confirmCancel').onclick = () => { seq++; dlg.close(); };
  $('confirmOk').onclick = async () => {
    $('confirmOk').disabled = true;
    let data;
    try {
      const pick = $('confirmList').querySelector('input[name=mergeMode]:checked');
      data = await send(date, false, { mode: pick ? pick.value : 'add' });
    } catch (err) {
      $('confirmList').insertAdjacentHTML('beforeend', `<p class="err">${esc(err.message)}</p>`);
      $('confirmOk').disabled = false;
      return;
    }
    dlg.close();
    if (state.reports.length === 0 || date !== state.date) {
      // First save, or saved under another day than the one on screen: open the whole
      // stored day, so reports saved for it earlier show alongside the new ones.
      clearDay();
      $('reportDate').value = date;
      await openDay(date);
      showRejected(data.rejected || []);
      return;
    }
    state.date = date;
    $('reportDate').value = date;
    apply(data);
  };
  dlg.showModal();
  check();
}

// ---------- Upload ----------
const dropzone = $('dropzone');

['dragenter', 'dragover'].forEach((e) =>
  dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.add('drag'); }));
['dragleave', 'drop'].forEach((e) =>
  dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.remove('drag'); }));
dropzone.addEventListener('drop', (ev) => uploadFiles([...ev.dataTransfer.files]));
$('fileInput').addEventListener('change', (ev) => { uploadFiles([...ev.target.files]); ev.target.value = ''; });
$('addInput').addEventListener('change', (ev) => { uploadFiles([...ev.target.files]); ev.target.value = ''; });

function showUploadErr(msg) {
  const el = $('uploadErr');
  el.textContent = msg; el.hidden = false;
}

function uploadFiles(files) {
  $('uploadErr').hidden = true;
  if (files.length === 0) return;
  confirmSave((date, check, opts) => {
    const fd = new FormData();
    fd.append('sheetDate', date);
    if (check) fd.append('check', '1');
    if (opts && opts.mode === 'replace') fd.append('pddMode', 'replace');
    files.forEach((f) => fd.append('files', f));
    return call('daily/upload', { body: fd });
  }, showUploaded);
}

function showUploaded(data) {
  state.catalogue = data.catalogue || [];
  const rejected = [...(data.rejected || [])];
  // A report loaded again for the same day replaces the shown one — and the saved one,
  // which the server keeps as history (r.saved.replaced says so on the report).
  (data.reports || []).forEach((r) => {
    state.reports = state.reports.filter((x) => x.key !== r.key).concat(r);
  });
  state.reports.sort((a, b) => a.order - b.order);

  if (state.reports.length === 0) {
    return showUploadErr(rejected.map((x) => `${x.file}: ${x.error}`).join('\n') || 'No report could be read.');
  }
  $('uploadStage').hidden = true;
  $('workStage').hidden = false;
  showRejected(rejected);
  render();
}

// ---------- Slot uploads: reports whose files look alike ----------
// Continuous night working (3 / 4 / >4) and suburban sign on/off without biometric
// (summary + CSTS / KYNS / PNVS lists): the user says which file is which by tab.
// Every pick re-posts all the parts held; the answer replaces the whole report.
// status(slot, report) -> a tab's line when no file is held this session (BOR: what each
// period still needs, read from the shown report — so a day opened from storage says too).
function slotBox(id, url, firstSlot, reportKey, status) {
  // hand = one part typed in (Fill by hand), posted as JSON with the files held.
  const box = { files: {}, hand: null, handField: null, slot: firstSlot, reportKey };
  const tabs = $(`${id}Tabs`);
  const showErr = (msg) => { $(`${id}Err`).textContent = msg; $(`${id}Err`).hidden = !msg; };
  const marks = () => tabs.querySelectorAll('.night-tab').forEach((t) => {
    const held = box.files[t.dataset.slot];
    const line = held ? `✓ ${held.name}` : status ? status(t.dataset.slot, state.reports.find((r) => r.key === reportKey)) : '';
    const el = t.querySelector('.nt-file');
    el.textContent = line || '';
    el.classList.toggle('need', !held && /add /.test(line || ''));
  });

  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-slot]');
    if (!tab) return;
    box.slot = tab.dataset.slot;
    tabs.querySelectorAll('.night-tab').forEach((t) => t.classList.toggle('active', t === tab));
    $(`${id}SlotName`).textContent = tab.firstChild.textContent.trim();
  });
  $(`${id}Input`).addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (f) upload(box.slot, f);
  });

  function upload(slot, file) {
    showErr('');
    post({ ...box.files, [slot]: file }, box.hand, box.handField);
  }

  // Through the confirm box; errors show inside it.
  function post(next, hand, handField) {
    confirmSave((date, check) => {
      const fd = new FormData();
      fd.append('sheetDate', date);
      if (check) fd.append('check', '1');
      Object.entries(next).forEach(([k, f]) => fd.append(k, f));
      if (hand) fd.append(handField, JSON.stringify(hand));
      return call(url, { body: fd });
    }, (data) => applySaved(data, next, hand, handField));
  }

  function applySaved(data, next, hand, handField) {
    box.files = next;
    box.hand = hand;
    box.handField = handField;
    marks();
    state.reports = state.reports.filter((r) => r.key !== data.report.key).concat(data.report)
      .sort((a, b) => a.order - b.order);
    state.catalogue = data.catalogue || state.catalogue;
    $('uploadStage').hidden = true;
    $('workStage').hidden = false;
    render();
  }

  box.saveHand = (field, values) => post(box.files, values, field);
  box.marks = marks;
  box.reset = () => { box.files = {}; box.hand = null; box.handField = null; marks(); showErr(''); };
  return box;
}
// BOR tab lines from the shown report: its period rows ("?" = split still wanted) and
// the division row (the summary's figures; blank without a summary).
function borStatus(slot, r) {
  const P = { y: 0, fn: 1, m: 2 };
  const div = r && r.tables[1] && r.tables[1].rows[0];
  const hasSum = div && div[1] !== '';
  if (slot === 'sum') return hasSum ? '✓ saved' : '';
  if (!hasSum) return 'add the summary first';
  const fig = Number(div[P[slot] + 1]);
  if (fig === 0) return '0 — no list needed';
  const row = r.tables[0].rows[P[slot]];
  return row.includes('?') ? `${fig} case${fig > 1 ? 's' : ''} — add the list` : `${fig} — split ✓`;
}
const slotBoxes = [
  slotBox('night', 'daily/upload-night', 'n3', 'contnight'),
  slotBox('nonbio', 'daily/upload-nonbio', 'sum', 'subsonoff'),
  slotBox('bor', 'daily/upload-bor', 'sum', 'bor', borStatus),
];

// ---------- Fill by hand ----------
// Reports with a `manual` entry can be typed in; the server builds the same tables.
async function loadManual() {
  try {
    const res = await fetch(`${API_BASE}daily/catalogue`, { method: 'POST' });
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) return;
    const data = await res.json();
    if (state.catalogue.length === 0) state.catalogue = data.catalogue || [];
    state.layout = data.layout || null;
    if (state.reports.length) render();
    const list = (data.catalogue || []).filter((c) => c.manual);
    $('manualBox').hidden = list.length === 0;
    $('manualKey').innerHTML = list.map((c) => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join('');
    showManualFields();
  } catch (_) {
    $('manualBox').hidden = true;
  }
}
function showManualFields() {
  const c = state.catalogue.find((x) => x.key === $('manualKey').value);
  const input = (key, value, label) =>
    `<input type="number" min="0" step="1" inputmode="numeric" data-mkey="${esc(key)}" value="${esc(value)}" aria-label="${esc(label)}" />`;
  if (!c || !c.manual) { $('manualFields').innerHTML = ''; return; }
  if (!c.grid) {
    $('manualFields').innerHTML = c.manual.map((f) => `<label>${esc(f.label)}${input(f.key, 0, f.label)}</label>`).join('');
    return;
  }
  // Laid out as the sheet table. Pre-filled from the loaded report where it has a number.
  const loaded = state.reports.find((r) => r.key === c.key);
  const shown = loaded && loaded.tables[0] ? loaded.tables[0].rows : [];
  const held = c.slotOf ? (slotBoxes.find((b) => b.reportKey === c.slotOf) || {}).hand : null;
  const pre = (ri, ci) => {
    if (c.slotOf) return held ? held[`${c.grid.cols[ci].key}|${c.grid.rows[ri].key}`] : 0;
    const v = shown[ri] && shown[ri][ci + 1]; return /^\d+$/.test(String(v)) ? v : 0;
  };
  $('manualFields').innerHTML = `<table class="manual-grid"><thead><tr><th></th>${c.grid.cols.map((col) => `<th>${esc(col.label)}</th>`).join('')}</tr></thead>
    <tbody>${c.grid.rows.map((row, ri) => `<tr><th>${esc(row.label)}</th>${c.grid.cols.map((col, ci) =>
      `<td>${input(`${col.key}|${row.key}`, pre(ri, ci), `${col.label} ${row.label}`)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
$('manualKey').addEventListener('change', showManualFields);

function showManualErr(msg) {
  $('manualErr').textContent = msg;
  $('manualErr').hidden = !msg;
}

$('manualSave').addEventListener('click', () => {
  showManualErr('');
  const values = {};
  $('manualFields').querySelectorAll('[data-mkey]').forEach((i) => { values[i.dataset.mkey] = i.value; });
  // One part of a slot report (DR / LTT): saved with that report's files, not over them.
  const c = state.catalogue.find((x) => x.key === $('manualKey').value);
  if (c && c.slotOf) {
    slotBoxes.find((b) => b.reportKey === c.slotOf).saveHand(c.field, values);
    return;
  }
  const key = $('manualKey').value;
  confirmSave((date, check) => call('daily/manual', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, values, sheetDate: date, check: check ? '1' : undefined }),
  }), showManualSaved);
});

function showManualSaved(data) {
  state.catalogue = data.catalogue || state.catalogue;
  state.reports = state.reports.filter((r) => r.key !== data.report.key).concat(data.report)
    .sort((a, b) => a.order - b.order);
  $('uploadStage').hidden = true;
  $('workStage').hidden = false;
  render();
}
loadManual();

function showRejected(list) {
  const el = $('rejected');
  el.hidden = list.length === 0;
  el.innerHTML = list.length === 0 ? '' :
    `<strong>${list.length} file${list.length > 1 ? 's' : ''} not loaded</strong><ul>` +
    list.map((x) => `<li>${x.file ? `<strong>${esc(x.file)}</strong> — ` : ''}${esc(x.error)}</li>`).join('') + '</ul>';
}

// ---------- Render ----------
// A count, optionally with a bracketed figure after it: "24" or "24 (2:22)".
const isCount = (v) => /^\d+(\s*\(.*\))?$/.test(String(v));
const countOf = (v) => Number(String(v).match(/^\d+/)[0]);

// Every table on screen is registered here on render, so a clicked count finds its
// drill-down list again whichever view (block or drawer) drew it.
let shown = [];

function tableHtml(t) {
  const sid = shown.push(t) - 1;
  // A column is text when no body cell in it is a plain count.
  const textCol = t.headers.map((_, i) => t.rows.length > 0 && t.rows.every((r) => !isCount(r[i])));
  const alertCol = new Set(t.alertCols || []);
  // Clickable counts: drill entries keyed "row,col" ("T,col" for the total row).
  const drillAt = new Map((t.drill || []).map((d, di) => [`${d.r},${d.c}`, di]));
  const cell = (v, i, r) => {
    if (textCol[i]) return `<td>${esc(v)}</td>`;
    const cls = String(v) === '0' ? ' zero' : (alertCol.has(i) && isCount(v) && countOf(v) > 0 ? ' alert' : '');
    const di = drillAt.get(`${r},${i}`);
    const inner = di !== undefined && isCount(v) && countOf(v) > 0
      ? `<a href="#" class="drill" data-s="${sid}" data-d="${di}">${esc(v)}</a>` : esc(v);
    return `<td class="n${cls}">${inner}</td>`;
  };

  // Grouped headings come pre-laid-out from the server (lib/cmsReports/headLayout.js).
  const th = (h, i, extra = '') => `<th class="${textCol[i] ? 'txt' : ''}"${extra}>${esc(h)}</th>`;
  let head;
  if (!t.head) head = `<tr>${t.headers.map((h, i) => th(h, i)).join('')}</tr>`;
  else {
    head = '';
    for (let r = 0; r < t.head.rows; r++) {
      head += '<tr>' + t.head.cells.filter((c) => c.r === r).map((c) => {
        const span = (c.rs > 1 ? ` rowspan="${c.rs}"` : '') + (c.cs > 1 ? ` colspan="${c.cs}"` : '');
        return c.cs === 1 ? th(c.label, c.c, span) : `<th${span}>${esc(c.label)}</th>`;
      }).join('') + '</tr>';
    }
  }
  const body = t.rows.length === 0
    ? `<tr><td colspan="${t.headers.length}" class="empty">${esc(t.emptyText || 'None.')}</td></tr>`
    : t.rows.map((r, ri) => `<tr>${t.headers.map((_, i) => cell(r[i], i, ri)).join('')}</tr>`).join('');
  const total = Array.isArray(t.total)
    ? `<tr class="total">${t.headers.map((_, i) => cell(t.total[i], i, 'T')).join('')}</tr>` : '';

  const note = t.note ? `<p class="tnote">${esc(t.note)}</p>` : '';
  return `<div class="rtable">${t.title ? `<h3>${esc(t.title)}</h3>` : ''}${note}
    <div class="table-wrap"><table><thead>${head}</thead><tbody>${body}${total}</tbody></table></div>
    <div class="drill-panel" hidden></div></div>`;
}

// The tables a report shows in its block: the sheet tables (as the one-view PDF).
const sheetTables = (r) => r.tables.filter((t, i) => i === 0 || t.sheet);
const detailTables = (r) => r.tables.filter((t, i) => !(i === 0 || t.sheet));

// Change on Approval: one table, a Sign On and a Sign Off column, as the PDF prints it
// (keep in step with mergeApproval in lib/cmsReports/position.js). Drill-downs move with
// their column.
function mergeApproval(ts) {
  const [on, off] = ts;
  if (!off) return ts;
  const kind = (t) => t.title.split('—').pop().trim();
  return [{
    title: '',
    headers: ['Sr No.', 'Lobby', kind(on), kind(off)],
    rows: on.rows.map((r, i) => [...r, off.rows[i] ? off.rows[i][2] : '']),
    total: Array.isArray(on.total) ? [...on.total, off.total ? off.total[2] : ''] : null,
    alertCols: [2, 3],
    drill: [...(on.drill || []), ...(off.drill || []).map((d) => ({ ...d, c: 3 }))],
  }];
}

const labelOf = (key) => (state.catalogue.find((c) => c.key === key) || {}).label || key;

// "Saved 12-10 09:40 by clicms · replaced the 09:10 load" — or that it is NOT saved.
function savedLine(r) {
  const s = r.saved;
  if (!s) return '<span class="saved no">Not saved</span>';
  const at = String(s.at || '').replace(/^(\d{4})-(\d{2})-(\d{2})/, '$3-$2');
  const prev = s.replaced ? ` · replaced the load of ${esc(s.replaced.loadedAt.slice(11))} by ${esc(s.replaced.loadedBy)}`
    : s.earlier ? ` · ${s.earlier} earlier load${s.earlier > 1 ? 's' : ''} kept` : '';
  return `<span class="saved">Saved ${esc(at)} by ${esc(s.by)}${prev}</span>`;
}

function blockHtml(key) {
  const r = state.reports.find((x) => x.key === key);
  if (!r) {
    return `<section class="pblock missing" id="blk-${esc(key)}">
      <div class="pblock-head"><h2>${esc(labelOf(key))}</h2></div>
      <p class="pmissing">Not uploaded</p></section>`;
  }
  let ts = sheetTables(r).map((t) => (t.title === r.label ? { ...t, title: '' } : t));
  if (key === 'changeapproval') ts = mergeApproval(ts);
  const warn = (r.warnings || []).length;
  return `<section class="pblock" id="blk-${esc(key)}">
    <div class="pblock-head">
      <h2>${esc(r.label)} <span class="pdate">(${isoToDDMMYYYY(dataDateOf(r))})</span>${r.saved ? '' : ' <span class="saved no">Not saved</span>'}${r.saved && r.saved.id ? ` <button type="button" class="btn-move" data-move="${esc(key)}" title="Saved under the wrong date? Move it to the right one">Change date</button>` : ''}</h2>
      <button class="btn btn-ghost btn-details" data-open="${esc(key)}">${warn ? `<span class="wdot" title="${warn} warning${warn > 1 ? 's' : ''}"></span>` : ''}Details ›</button>
    </div>
    ${ts.map((t) => tableHtml({ ...t, note: t.noteOnSheet ? t.note : '' })).join('')}
  </section>`;
}

// Details drawer: the report's source, warnings, detail tables and own Excel export.
function drawerHtml() {
  const r = state.reports.find((x) => x.key === state.drawer);
  if (!r) return '';
  const det = detailTables(r);
  const warns = r.warnings || [];
  return `<div class="drawer-backdrop" data-close="1"></div>
  <aside class="drawer" role="dialog" aria-label="${esc(r.label)} details">
    <div class="drawer-head">
      <div><h2>${esc(r.label)} <span class="pdate">(${isoToDDMMYYYY(dataDateOf(r))})</span></h2>
        <span class="src">${esc(r.file)}</span><br />${savedLine(r)}</div>
      <a href="#" class="drawer-close" data-close="1" title="Close">×</a>
    </div>
    <div class="drawer-actions">
      <label class="detail-opt"><input type="checkbox" data-detail="${esc(r.key)}" checked /> Include detail tables</label>
      <button class="btn btn-export" data-xlsx="${esc(r.key)}">⬇ Excel</button>
    </div>
    ${warns.length ? `<div class="warnings"><ul>${warns.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
    ${sheetTables(r).map((t) => (t.note ? `<p class="tnote">${esc(t.title ? `${t.title}: ` : '')}${esc(t.note)}</p>` : '')).join('')}
    ${det.length ? det.map((t) => tableHtml(t)).join('') : '<p class="tnote">No detail tables for this report.</p>'}
  </aside>`;
}

function render() {
  $('dayDate').value = state.date;
  slotBoxes.forEach((b) => b.marks());          // BOR tabs say what each period needs
  showDateLock();
  showManualFields();            // a grid pre-fills from what is now loaded
  shown = [];

  // Sticky strip: every report, in sheet order; green = in, dashed = missing, dot = warnings.
  const byKey = new Map(state.reports.map((r) => [r.key, r]));
  const order = state.layout
    ? state.layout.flat().flatMap((row) => (Array.isArray(row) ? row.flat() : row.full))
    : state.catalogue.filter((c) => !c.slotOf).map((c) => c.key);
  state.catalogue.forEach((c) => { if (!c.slotOf && !order.includes(c.key)) order.push(c.key); });
  $('checklist').innerHTML = order.map((k) => {
    const r = byKey.get(k);
    const dot = r && (r.warnings || []).length ? '<span class="wdot"></span>' : '';
    return `<a href="#blk-${esc(k)}" class="chk ${r ? 'in' : 'missing'}">${dot}${r ? '✓ ' : ''}${esc(labelOf(k))}</a>`;
  }).join('');

  const warns = state.reports.flatMap((r) => (r.warnings || []).map((w) => `${r.label}: ${w}`));
  $('warnings').hidden = warns.length === 0;
  $('warnings').innerHTML = warns.length
    ? `<details><summary>${warns.length} warning${warns.length > 1 ? 's' : ''} — open a report's Details for its own</summary><ul>${warns.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></details>` : '';

  // Main view: the one-view layout, blocks in left/right pairs.
  const pages = state.layout || [state.catalogue.filter((c) => !c.slotOf).map((c) => ({ full: [c.key] }))];
  const side = (keys) => `<div class="pside">${keys.map(blockHtml).join('')}</div>`;
  const placed = new Set(pages.flat().flatMap((row) => (Array.isArray(row) ? row.flat() : row.full)));
  const extra = state.reports.filter((r) => !placed.has(r.key));   // a report the layout does not name
  $('reports').innerHTML = pages.map((rows, pi) => `
    ${pi > 0 ? '<div class="page-sep">Page 2</div>' : ''}
    ${rows.map((row) => (Array.isArray(row)
    ? `<div class="pos-row">${side(row[0])}${side(row[1] || [])}</div>`
    : `<div class="pos-row full">${side(row.full)}</div>`)).join('')}`).join('')
    + (extra.length ? `<div class="pos-row full">${side(extra.map((r) => r.key))}</div>` : '')
    + drawerHtml();
  document.body.classList.toggle('drawer-open', !!state.drawer);
}

// Details drawer: open from a block, close by ×, backdrop or Esc.
$('reports').addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) { state.drawer = open.dataset.open; render(); return; }
  if (e.target.closest('[data-close]')) { e.preventDefault(); state.drawer = null; render(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.drawer) { state.drawer = null; render(); }
});

// ---------- Export ----------
// Exports print the daily-sheet block (each report's first table, plus any marked sheet) unless the
// caller asks for the detail tables too. The page itself always shows everything.
// Drill-down rows are for the page only; exports print the counts.
const noDrill = (ts) => ts.map(({ drill, ...t }) => t);
const sheetOnly = (r) => ({ key: r.key, label: r.label, dataDate: dataDateOf(r), tables: noDrill(r.tables.filter((t, i) => i === 0 || t.sheet)) });
// kind = 'xlsx' | 'pdf' | 'position/xlsx' | 'position/pdf' (one view, sheet tables only).
async function exportAs(kind, reports, detail) {
  if (reports.length === 0) return;
  const ext = kind.split('/').pop();
  try {
    const res = await fetch(`${API_BASE}daily/export/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: state.date,
        reports: reports.map((r) => (detail ? { key: r.key, label: r.label, dataDate: dataDateOf(r), tables: noDrill(r.tables) } : sheetOnly(r))),
      }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert('Export failed. ' + (e.error || res.statusText));
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = kind.startsWith('position/')
      ? `CMS_position_${state.date}.${ext}`
      : `CMS_${reports.length === 1 ? reports[0].key : 'daily_position'}_${state.date}.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed. ' + err.message);
  }
}
$('dayXlsxBtn').addEventListener('click', () => exportAs('xlsx', state.reports, $('dayDetail').checked));
$('dayPdfBtn').addEventListener('click', () => exportAs('pdf', state.reports, $('dayDetail').checked));
// One view: always the sheet tables; a report not loaded prints as a "Not uploaded" block.
$('posPdfBtn').addEventListener('click', () => exportAs('position/pdf', state.reports, false));
$('posXlsxBtn').addEventListener('click', () => exportAs('position/xlsx', state.reports, false));
// Delegated: #reports is rebuilt on every render.
$('reports').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-xlsx]');
  if (!btn) return;
  const detail = $('reports').querySelector(`[data-detail="${btn.dataset.xlsx}"]`);
  exportAs('xlsx', state.reports.filter((r) => r.key === btn.dataset.xlsx), !!(detail && detail.checked));
});

// Drill-down: a clickable count lists the crew behind it under its table.
$('reports').addEventListener('click', (e) => {
  const close = e.target.closest('.drill-close');
  if (close) { e.preventDefault(); close.closest('.drill-panel').hidden = true; return; }
  const a = e.target.closest('a.drill');
  if (!a) return;
  e.preventDefault();
  const t = shown[+a.dataset.s];
  const d = t && t.drill && t.drill[+a.dataset.d];
  if (!d) return;
  const panel = a.closest('.rtable').querySelector('.drill-panel');
  const id = `${a.dataset.s}|${a.dataset.d}`;
  if (!panel.hidden && panel.dataset.id === id) { panel.hidden = true; return; }
  panel.dataset.id = id;
  panel._drill = d;
  panel._sort = null;               // rows arrive in the report's own order
  drawDrill(panel);
  panel.hidden = false;
});

// Sort value: a number, a "dd-mm-yyyy hh:mm" / "dd-mm-yy hh:mm" time, else text.
function sortKey(v) {
  const s = String(v == null ? '' : v).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  const m = s.match(/^(\d{2})-(\d{2})-(\d{2,4})(?: (\d{2}):(\d{2}))?/);
  if (m) return Number(`${m[3].length === 2 ? '20' + m[3] : m[3]}${m[2]}${m[1]}${m[4] || '00'}${m[5] || '00'}`);
  return s.toUpperCase();
}
function drawDrill(panel) {
  const d = panel._drill;
  const sortable = new Set(d.sortCols || []);
  let rows = d.rows;
  if (panel._sort) {
    const { c, dir } = panel._sort;
    rows = [...rows].sort((a, b) => {
      const x = sortKey(a[c]); const y = sortKey(b[c]);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }
  const arrow = (i) => (panel._sort && panel._sort.c === i ? (panel._sort.dir > 0 ? ' ▲' : ' ▼') : (sortable.has(i) ? ' ⇅' : ''));
  panel.innerHTML = `<div class="drill-head"><strong>${esc(d.title)}</strong> <span>${d.rows.length} row${d.rows.length === 1 ? '' : 's'}</span>
      <a href="#" class="drill-close" title="Close">×</a></div>
    ${d.note ? `<p class="tnote">${esc(d.note)}</p>` : ''}
    <div class="table-wrap"><table><thead><tr>${d.headers.map((h, i) => (sortable.has(i)
      ? `<th class="txt sortable" data-sc="${i}">${esc(h)}${arrow(i)}</th>` : `<th class="txt">${esc(h)}</th>`)).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
// Header click: sort by that column; again to reverse. Numbers start high-to-low.
$('reports').addEventListener('click', (e) => {
  const th = e.target.closest('.drill-panel th.sortable');
  if (!th) return;
  const panel = th.closest('.drill-panel');
  const c = +th.dataset.sc;
  const numeric = panel._drill.rows.some((r) => typeof sortKey(r[c]) === 'number');
  const dir = panel._sort && panel._sort.c === c ? -panel._sort.dir : (numeric ? -1 : 1);
  panel._sort = { c, dir };
  drawDrill(panel);
});

// Leave the shown day: back to the upload stage (date box kept as the user set it).
function clearDay() {
  state.reports = [];
  state.drawer = null;
  document.body.classList.remove('drawer-open');
  slotBoxes.forEach((b) => b.reset());
  $('workStage').hidden = true;
  $('uploadStage').hidden = false;
  $('dayStatus').textContent = '';
}
// The shown day also takes dropped files (same as + Add files). Only real file drags
// light it up, so dragging text or a table cell does nothing.
(function dropOnDay() {
  const stage = $('workStage');
  const hasFiles = (ev) => [...(ev.dataTransfer && ev.dataTransfer.types || [])].includes('Files');
  ['dragenter', 'dragover'].forEach((t) => stage.addEventListener(t, (ev) => {
    if (!hasFiles(ev) || $('confirmBox').open) return;
    ev.preventDefault();
    stage.classList.add('drag');
  }));
  stage.addEventListener('dragleave', (ev) => { if (!stage.contains(ev.relatedTarget)) stage.classList.remove('drag'); });
  stage.addEventListener('drop', (ev) => {
    if (!hasFiles(ev)) return;
    ev.preventDefault();
    stage.classList.remove('drag');
    uploadFiles([...ev.dataTransfer.files]);
  });
})();
showDateLock();
openDay(TODAY);     // today's sheet, if anything is already saved for it

// ---------- Change date of a saved report ----------
// The user picks the report's correct DATA date; its sheet date follows from the offset.
// The server copies it there (the old one kept as history), so this day loses it.
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
$('reports').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-move]');
  if (!btn) return;
  const r = state.reports.find((x) => x.key === btn.dataset.move);
  if (!r || !r.saved || !r.saved.id) return;
  const dlg = $('moveBox');
  const now = dataDateOf(r);
  const off = r.dateOffset || 0;
  $('moveTitle').textContent = `Change date — ${r.label}`;
  $('moveNow').textContent = `Saved for ${isoToDDMMYYYY(now)} (D-${off} of sheet ${isoToDDMMYYYY(state.date)}).`;
  $('moveDate').value = now;
  $('moveMsg').innerHTML = '';
  const sheetLine = () => {
    const v = $('moveDate').value;
    $('moveSheet').textContent = /^20\d{2}-\d{2}-\d{2}$/.test(v) ? `→ belongs to sheet ${isoToDDMMYYYY(addDays(v, off))}` : '';
  };
  let replace = false;
  $('moveDate').oninput = () => { replace = false; $('moveMsg').innerHTML = ''; $('moveOk').textContent = 'Move'; sheetLine(); };
  sheetLine();
  $('moveOk').textContent = 'Move';
  $('moveCancel').onclick = () => dlg.close();
  $('moveOk').onclick = async () => {
    const v = $('moveDate').value;
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(v) || v === now) { $('moveMsg').innerHTML = '<p class="err">Pick a different date.</p>'; return; }
    $('moveOk').disabled = true;
    try {
      const data = await call('daily/move', { headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadId: r.saved.id, dataDate: v, replace }) });
      if (data.status === 409) {
        $('moveMsg').innerHTML = `<p class="err">${isoToDDMMYYYY(v)} already has ${esc(r.label)} saved (${esc(data.conflict.by)}, ${esc(data.conflict.at)}). Move anyway and keep that one as history?</p>`;
        replace = true;
        $('moveOk').textContent = 'Replace';
        return;
      }
      dlg.close();
      state.reports = state.reports.filter((x) => x !== r);
      render();
      showRejected([]);
      $('rejected').hidden = false;
      $('rejected').innerHTML = `<strong>${esc(r.label)}</strong> moved to ${isoToDDMMYYYY(v)} — sheet
        <a href="#" data-goto="${esc(data.sheetDate)}">${isoToDDMMYYYY(data.sheetDate)}</a>.`;
    } catch (err) {
      $('moveMsg').innerHTML = `<p class="err">${esc(err.message)}</p>`;
    } finally {
      $('moveOk').disabled = false;
    }
  };
  dlg.showModal();
});
// "moved to sheet …" link: open that day.
$('rejected').addEventListener('click', (e) => {
  const a = e.target.closest('[data-goto]');
  if (!a) return;
  e.preventDefault();
  clearDay();
  $('reportDate').value = a.dataset.goto;
  openDay(a.dataset.goto);
});

// The date in the work bar: switching it opens that day's saved reports, or an empty
// day to upload into — so + Add files always saves under the date on screen.
$('dayDate').addEventListener('change', () => {
  const date = $('dayDate').value;
  // Typing a year fires change per digit (0002, 0020…): wait for a real year.
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || date === state.date) return;
  clearDay();
  $('reportDate').value = date;
  openDay(date);
});


// ---------- Topbar nav: Dashboard (admins) vs Logout (clicms user) ----------
(async function setupTopbarNav() {
  const btn = $('navBtn');
  try {
    const res = await fetch('/api/current-user', { credentials: 'same-origin' });
    if (!res.ok) return; // leave hidden if we can't tell
    const user = await res.json();
    if (user.div_role === 'division_admin' || user.role === 'admin') {
      btn.textContent = '← Dashboard';
      btn.href = '/div';
    } else {
      btn.textContent = 'Logout';
      btn.href = '/api/logout';
    }
    btn.hidden = false;
  } catch (e) { /* leave hidden */ }
})();
