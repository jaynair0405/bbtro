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

// ---------- Slot uploads: reports whose files look alike ----------
// Continuous night working (3 / 4 / >4) and suburban sign on/off without biometric
// (summary + CSTS / KYNS / PNVS lists): the user says which file is which by tab.
// Every pick re-posts all the parts held; the answer replaces the whole report.
function slotBox(id, url, firstSlot) {
  const box = { files: {}, slot: firstSlot };
  const tabs = $(`${id}Tabs`);
  const showErr = (msg) => { $(`${id}Err`).textContent = msg; $(`${id}Err`).hidden = !msg; };
  const marks = () => tabs.querySelectorAll('.night-tab').forEach((t) => {
    t.querySelector('.nt-file').textContent = box.files[t.dataset.slot] ? `✓ ${box.files[t.dataset.slot].name}` : '';
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

  async function upload(slot, file) {
    showErr('');
    if (state.reports.length === 0) {
      const date = $('reportDate').value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return showErr('Choose the sheet date first.');
      state.date = date;
    }
    const next = { ...box.files, [slot]: file };
    const fd = new FormData();
    Object.entries(next).forEach(([k, f]) => fd.append(k, f));
    let data;
    try {
      const res = await fetch(`${API_BASE}${url}`, { method: 'POST', body: fd });
      if (res.redirected || !/json/i.test(res.headers.get('content-type') || '')) {
        throw new Error('Your session has expired — log in again, then re-upload.');
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
    } catch (err) {
      return showErr(err.message);
    }
    box.files = next;
    marks();
    state.reports = state.reports.filter((r) => r.key !== data.report.key).concat(data.report)
      .sort((a, b) => a.order - b.order);
    state.catalogue = data.catalogue || state.catalogue;
    $('uploadStage').hidden = true;
    $('workStage').hidden = false;
    render();
  }

  box.reset = () => { box.files = {}; marks(); showErr(''); };
  return box;
}
const slotBoxes = [
  slotBox('night', 'daily/upload-night', 'n3'),
  slotBox('nonbio', 'daily/upload-nonbio', 'sum'),
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
  const pre = (ri, ci) => { const v = shown[ri] && shown[ri][ci + 1]; return /^\d+$/.test(String(v)) ? v : 0; };
  $('manualFields').innerHTML = `<table class="manual-grid"><thead><tr><th></th>${c.grid.cols.map((col) => `<th>${esc(col.label)}</th>`).join('')}</tr></thead>
    <tbody>${c.grid.rows.map((row, ri) => `<tr><th>${esc(row.label)}</th>${c.grid.cols.map((col, ci) =>
      `<td>${input(`${col.key}|${row.key}`, pre(ri, ci), `${col.label} ${row.label}`)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
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
      <h2>${esc(r.label)} <span class="pdate">(${isoToDDMMYYYY(dataDateOf(r))})</span></h2>
      <button class="btn btn-ghost btn-details" data-open="${esc(key)}">${warn ? `<span class="wdot" title="${warn} warning${warn > 1 ? 's' : ''}"></span>` : ''}Details ›</button>
    </div>
    ${ts.map((t) => tableHtml({ ...t, note: '' })).join('')}
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
        <span class="src">${esc(r.file)}</span></div>
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
  $('dayLabel').textContent = isoToDDMMYYYY(state.date);
  showManualFields();            // a grid pre-fills from what is now loaded
  shown = [];

  // Sticky strip: every report, in sheet order; green = in, dashed = missing, dot = warnings.
  const byKey = new Map(state.reports.map((r) => [r.key, r]));
  const order = state.layout
    ? state.layout.flat().flatMap((row) => (Array.isArray(row) ? row.flat() : row.full))
    : state.catalogue.map((c) => c.key);
  state.catalogue.forEach((c) => { if (!order.includes(c.key)) order.push(c.key); });
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
  const pages = state.layout || [state.catalogue.map((c) => ({ full: [c.key] }))];
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

$('newBtn').addEventListener('click', () => {
  state.reports = [];
  state.drawer = null;
  document.body.classList.remove('drawer-open');
  slotBoxes.forEach((b) => b.reset());
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
