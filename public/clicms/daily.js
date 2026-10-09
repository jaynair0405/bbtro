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
  night: {},       // { n3?, n4?, n5? } File — continuous night working parts
  nightSlot: 'n3', // the tab being filled
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

// The SHEET date: today (IST). Each report's data date is this minus its dateOffset.
(function presetDate() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  $('reportDate').value = ist.toISOString().slice(0, 10);
})();

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

async function uploadFiles(files) {
  $('uploadErr').hidden = true;
  if (files.length === 0) return;

  const firstLoad = state.reports.length === 0;
  if (firstLoad) {
    const date = $('reportDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return showUploadErr('Choose the sheet date.');
    state.date = date;
  }

  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  let data;
  try {
    const res = await fetch(`${API_BASE}daily/upload`, { method: 'POST', body: fd });
    // A login redirect comes back as an HTML page: say so instead of a JSON parse error.
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) {
      throw new Error('Your session has expired — log in again, then re-upload.');
    }
    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
  } catch (err) {
    const msg = 'Upload failed. ' + err.message;
    return firstLoad ? showUploadErr(msg) : showRejected([{ file: '', error: msg }]);
  }

  state.catalogue = data.catalogue || [];
  const rejected = [...(data.rejected || [])];
  (data.reports || []).forEach((r) => {
    const have = state.reports.find((x) => x.key === r.key);
    // Never silently replace: a second file of the same report is another day's.
    if (have) rejected.push({ file: r.file, error: `${r.label} is already loaded from "${have.file}". Use New day to start over.` });
    else state.reports.push(r);
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

// ---------- Continuous night working (3 / 4 / >4 slots) ----------
// The three parts have identical headers, so the user says which is which by tab.
// Every pick re-posts all the parts held; the answer replaces the whole report.
$('nightTabs').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-slot]');
  if (!tab) return;
  state.nightSlot = tab.dataset.slot;
  document.querySelectorAll('.night-tab').forEach((t) => t.classList.toggle('active', t === tab));
  $('nightSlotName').textContent = tab.firstChild.textContent.trim();
});
$('nightInput').addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (f) uploadNight(state.nightSlot, f);
});

function showNightErr(msg) {
  $('nightErr').textContent = msg;
  $('nightErr').hidden = !msg;
}

async function uploadNight(slot, file) {
  showNightErr('');
  if (state.reports.length === 0) {
    const date = $('reportDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return showNightErr('Choose the sheet date first.');
    state.date = date;
  }
  const next = { ...state.night, [slot]: file };
  const fd = new FormData();
  Object.entries(next).forEach(([k, f]) => fd.append(k, f));
  let data;
  try {
    const res = await fetch(`${API_BASE}daily/upload-night`, { method: 'POST', body: fd });
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) {
      throw new Error('Your session has expired — log in again, then re-upload.');
    }
    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
  } catch (err) {
    return showNightErr(err.message);
  }
  state.night = next;
  document.querySelectorAll('.night-tab').forEach((t) => {
    t.querySelector('.nt-file').textContent = state.night[t.dataset.slot] ? `✓ ${state.night[t.dataset.slot].name}` : '';
  });
  state.reports = state.reports.filter((r) => r.key !== data.report.key).concat(data.report)
    .sort((a, b) => a.order - b.order);
  state.catalogue = data.catalogue || state.catalogue;
  $('uploadStage').hidden = true;
  $('workStage').hidden = false;
  render();
}

// ---------- Fill by hand ----------
// Reports with a `manual` entry can be typed in; the server builds the same tables.
async function loadManual() {
  try {
    const res = await fetch(`${API_BASE}daily/catalogue`, { method: 'POST' });
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) return;
    const data = await res.json();
    if (state.catalogue.length === 0) state.catalogue = data.catalogue || [];
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
  $('manualFields').innerHTML = !c || !c.manual ? '' : c.manual.map((f) =>
    `<label>${esc(f.label)}<input type="number" min="0" step="1" inputmode="numeric" data-mkey="${esc(f.key)}" value="0" /></label>`).join('');
}
$('manualKey').addEventListener('change', showManualFields);

function showManualErr(msg) {
  $('manualErr').textContent = msg;
  $('manualErr').hidden = !msg;
}

$('manualSave').addEventListener('click', async () => {
  showManualErr('');
  if (state.reports.length === 0) {
    const date = $('reportDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return showManualErr('Choose the sheet date first.');
    state.date = date;
  }
  const values = {};
  $('manualFields').querySelectorAll('[data-mkey]').forEach((i) => { values[i.dataset.mkey] = i.value; });
  let data;
  try {
    const res = await fetch(`${API_BASE}daily/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: $('manualKey').value, values }),
    });
    if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) {
      throw new Error('Your session has expired — log in again.');
    }
    data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save.');
  } catch (err) {
    return showManualErr(err.message);
  }
  state.catalogue = data.catalogue || state.catalogue;
  state.reports = state.reports.filter((r) => r.key !== data.report.key).concat(data.report)
    .sort((a, b) => a.order - b.order);
  $('uploadStage').hidden = true;
  $('workStage').hidden = false;
  render();
});
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

// key/ti locate the table again when a drill-down count is clicked.
function tableHtml(t, key, ti) {
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
      ? `<a href="#" class="drill" data-k="${esc(key)}" data-t="${ti}" data-d="${di}">${esc(v)}</a>` : esc(v);
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
  return `<div class="rtable"><h3>${esc(t.title)}</h3>${note}
    <div class="table-wrap"><table><thead>${head}</thead><tbody>${body}${total}</tbody></table></div>
    <div class="drill-panel" hidden></div></div>`;
}

function render() {
  $('dayLabel').textContent = isoToDDMMYYYY(state.date);

  const loaded = new Set(state.reports.map((r) => r.key));
  $('checklist').innerHTML = state.catalogue.map((c) => (loaded.has(c.key)
    ? `<span class="chk in">✓ ${esc(c.label)}</span>`
    : `<span class="chk missing">${esc(c.label)} — not uploaded</span>`)).join('');

  const warns = state.reports.flatMap((r) => (r.warnings || []).map((w) => `${r.label}: ${w}`));
  $('warnings').hidden = warns.length === 0;
  $('warnings').innerHTML = warns.length ? `<ul>${warns.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '';

  $('reports').innerHTML = state.reports.map((r) => `
    <section class="report">
      <div class="report-head">
        <h2>${esc(r.label)} (${isoToDDMMYYYY(dataDateOf(r))})<span class="src">${esc(r.file)}</span></h2>
        <span class="report-export">
          <label class="detail-opt"><input type="checkbox" data-detail="${esc(r.key)}" /> Include detail tables</label>
          <button class="btn btn-export" data-xlsx="${esc(r.key)}">⬇ Excel</button>
        </span>
      </div>
      ${r.tables.map((t, ti) => tableHtml(t, r.key, ti)).join('')}
    </section>`).join('');
}

// ---------- Export ----------
// Exports print the daily-sheet block (each report's first table, plus any marked sheet) unless the
// caller asks for the detail tables too. The page itself always shows everything.
// Drill-down rows are for the page only; exports print the counts.
const noDrill = (ts) => ts.map(({ drill, ...t }) => t);
const sheetOnly = (r) => ({ key: r.key, label: r.label, dataDate: dataDateOf(r), tables: noDrill(r.tables.filter((t, i) => i === 0 || t.sheet)) });
async function exportAs(kind, reports, detail) {
  if (reports.length === 0) return;
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
    a.download = `CMS_${reports.length === 1 ? reports[0].key : 'daily_position'}_${state.date}.${kind}`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed. ' + err.message);
  }
}
$('dayXlsxBtn').addEventListener('click', () => exportAs('xlsx', state.reports, $('dayDetail').checked));
$('dayPdfBtn').addEventListener('click', () => exportAs('pdf', state.reports, $('dayDetail').checked));
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
  const rep = state.reports.find((x) => x.key === a.dataset.k);
  const d = rep && rep.tables[+a.dataset.t] && rep.tables[+a.dataset.t].drill[+a.dataset.d];
  if (!d) return;
  const panel = a.closest('.rtable').querySelector('.drill-panel');
  const id = `${a.dataset.k}|${a.dataset.t}|${a.dataset.d}`;
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

$('newBtn').addEventListener('click', () => {
  state.reports = [];
  state.night = {};
  document.querySelectorAll('.night-tab .nt-file').forEach((s) => { s.textContent = ''; });
  showNightErr('');
  $('workStage').hidden = true;
  $('uploadStage').hidden = false;
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
