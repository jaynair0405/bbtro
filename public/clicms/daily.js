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
};

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function isoToDDMMYYYY(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

// Default to yesterday (IST): the position is compiled the morning after.
(function presetDate() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return showUploadErr('Choose the date these reports are for.');
    state.date = date;
  }

  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  let data;
  try {
    const res = await fetch(`${API_BASE}daily/upload`, { method: 'POST', body: fd });
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

function showRejected(list) {
  const el = $('rejected');
  el.hidden = list.length === 0;
  el.innerHTML = list.length === 0 ? '' :
    `<strong>${list.length} file${list.length > 1 ? 's' : ''} not loaded</strong><ul>` +
    list.map((x) => `<li>${x.file ? `<strong>${esc(x.file)}</strong> — ` : ''}${esc(x.error)}</li>`).join('') + '</ul>';
}

// ---------- Render ----------
const isCount = (v) => /^\d+$/.test(String(v));

function tableHtml(t) {
  // A column is text when no body cell in it is a plain count.
  const textCol = t.headers.map((_, i) => t.rows.length > 0 && t.rows.every((r) => !isCount(r[i])));
  const alertCol = new Set(t.alertCols || []);
  const cell = (v, i) => {
    if (textCol[i]) return `<td>${esc(v)}</td>`;
    const cls = String(v) === '0' ? ' zero' : (alertCol.has(i) && isCount(v) ? ' alert' : '');
    return `<td class="n${cls}">${esc(v)}</td>`;
  };

  const head = t.headers.map((h, i) => `<th class="${textCol[i] ? 'txt' : ''}">${esc(h)}</th>`).join('');
  const body = t.rows.length === 0
    ? `<tr><td colspan="${t.headers.length}" class="empty">${esc(t.emptyText || 'None.')}</td></tr>`
    : t.rows.map((r) => `<tr>${t.headers.map((_, i) => cell(r[i], i)).join('')}</tr>`).join('');
  const total = Array.isArray(t.total)
    ? `<tr class="total">${t.headers.map((_, i) => cell(t.total[i], i)).join('')}</tr>` : '';

  const note = t.note ? `<p class="tnote">${esc(t.note)}</p>` : '';
  return `<div class="rtable"><h3>${esc(t.title)}</h3>${note}
    <div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}${total}</tbody></table></div></div>`;
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
        <h2>${esc(r.label)}<span class="src">${esc(r.file)}</span></h2>
        <button class="btn btn-export" data-xlsx="${esc(r.key)}">⬇ Excel</button>
      </div>
      ${r.tables.map(tableHtml).join('')}
    </section>`).join('');
}

// ---------- Export ----------
async function exportAs(kind, reports) {
  if (reports.length === 0) return;
  try {
    const res = await fetch(`${API_BASE}daily/export/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: state.date,
        reports: reports.map(({ key, label, tables }) => ({ key, label, tables })),
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
$('dayXlsxBtn').addEventListener('click', () => exportAs('xlsx', state.reports));
$('dayPdfBtn').addEventListener('click', () => exportAs('pdf', state.reports));
// Delegated: #reports is rebuilt on every render.
$('reports').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-xlsx]');
  if (btn) exportAs('xlsx', state.reports.filter((r) => r.key === btn.dataset.xlsx));
});

$('newBtn').addEventListener('click', () => {
  state.reports = [];
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
