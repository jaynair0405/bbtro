'use strict';

// Resolve API calls relative to the page's own directory, so this works no
// matter what path the router is mounted at (e.g. /clicms/ or /tools/clicms/).
const API_BASE = new URL('.', window.location.href).href; // always ends with "/"

const state = {
  rows: [],
  parameters: {},          // { footplate:{label,dueCol}, ... }
  generatedAtIST: '',
  activeParam: 'footplate',
  sortBy: 'cli',
  cliSort: 'count',          // summary "By CLI" order: 'count' | 'name'
  removed: {},             // { paramKey: Set(rowId) }
  remarks: {},             // { rowId: text } — per-staff, shared across parameters
};

const $ = (id) => document.getElementById(id);

// ---------- Upload ----------
const dropzone = $('dropzone');
const fileInput = $('fileInput');

['dragenter', 'dragover'].forEach((e) =>
  dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.add('drag'); }));
['dragleave', 'drop'].forEach((e) =>
  dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.remove('drag'); }));
dropzone.addEventListener('drop', (ev) => {
  const f = ev.dataTransfer.files[0];
  if (f) uploadFile(f);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) uploadFile(fileInput.files[0]);
});

async function uploadFile(file) {
  $('uploadErr').hidden = true;
  if (!/\.csv$/i.test(file.name)) {
    return showUploadErr('Please choose a .csv file.');
  }
  const fd = new FormData();
  fd.append('csv', file);
  try {
    const res = await fetch(`${API_BASE}upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) return showUploadErr(data.error || 'Upload failed.');
    initWorkStage(data);
  } catch (err) {
    showUploadErr('Could not reach the server. ' + err.message);
  }
}
function showUploadErr(msg) {
  const el = $('uploadErr');
  el.textContent = msg; el.hidden = false;
}

// ---------- Init work stage ----------
function initWorkStage(data) {
  state.rows = data.rows;
  state.parameters = data.parameters;
  state.generatedAtIST = data.generatedAtIST;
  state.removed = {};
  state.remarks = {};
  Object.keys(state.parameters).forEach((k) => (state.removed[k] = new Set()));
  state.activeParam = Object.keys(state.parameters)[0] || 'footplate';

  $('uploadStage').hidden = true;
  $('workStage').hidden = false;
  $('asof').hidden = false;
  $('asofDate').textContent = data.generatedAtIST;

  // warnings
  const w = $('warnings');
  if (data.warnings && data.warnings.length) {
    w.innerHTML = '⚠ ' + data.warnings.join('<br>⚠ ');
    w.hidden = false;
  } else { w.hidden = true; }

  buildCounters();
  buildParamTabs();
  renderSummary();
  render();
}

function overdueRows(param) {
  return state.rows.filter((r) => r.params[param].overdue && !state.removed[param].has(r.id));
}

// Switch active parameter from any control (counter or tab) in one place.
function setParam(key) {
  state.activeParam = key;
  syncActive();
  renderSummary();
  render();
}

// ---------- Summary (active parameter) ----------
// Summary is based on the RAW overdue population (matches the counters), not the
// trimmed export list — it's an analytical overview, not the deliverable.
const CATS = ['A', 'B', 'C'];
function catOf(grade) {
  const g = (grade || '').trim().toUpperCase();
  return CATS.includes(g) ? g : 'Other';
}
function cliKeyOf(r) {
  return r.cliId || r.cliName || '—';
}
function blankCounts(cats) {
  const o = {};
  cats.forEach((c) => (o[c] = 0));
  o.total = 0;
  return o;
}
function totalRow(cats, rows) {
  const t = blankCounts(cats);
  rows.forEach((r) => {
    cats.forEach((c) => (t[c] += r[c] || 0));
    t.total += r.total || 0;
  });
  return t;
}

function summarize(param) {
  const rows = overdueRows(param); // curated set (respects removals), so it matches the list + PDF
  const cats = rows.some((r) => catOf(r.grade) === 'Other') ? [...CATS, 'Other'] : [...CATS];

  const byDesigMap = {};
  const totals = blankCounts(cats);
  const cliMap = {};

  rows.forEach((r) => {
    const cat = catOf(r.grade);
    const desig = r.desig || '—';

    if (!byDesigMap[desig]) byDesigMap[desig] = blankCounts(cats);
    byDesigMap[desig][cat]++;
    byDesigMap[desig].total++;
    totals[cat]++;
    totals.total++;

    const cliKey = cliKeyOf(r);
    if (!cliMap[cliKey]) cliMap[cliKey] = { key: cliKey, cliId: r.cliId, cliName: r.cliName, total: 0, desigs: {} };
    const cli = cliMap[cliKey];
    if (!cli.desigs[desig]) cli.desigs[desig] = blankCounts(cats);
    cli.desigs[desig][cat]++;
    cli.desigs[desig].total++;
    cli.total++;
  });

  const byDesig = Object.keys(byDesigMap).sort().map((d) => ({ desig: d, ...byDesigMap[d] }));
  const byCli = Object.values(cliMap).map((c) => ({
    key: c.key,
    cliId: c.cliId,
    cliName: c.cliName,
    total: c.total,
    rows: Object.keys(c.desigs).sort().map((d) => ({ desig: d, ...c.desigs[d] })),
  }));

  return { cats, byDesig, totals, byCli };
}

// opts: { mini, cli } — when cli (a CLI key) is set, non-zero count cells become
// drillable (data attrs let the click handler list the matching staff).
function matrixTable(cats, rows, totals, opts = {}) {
  const head =
    `<tr><th>Designation</th>${cats.map((c) => `<th class="ctr">${c}</th>`).join('')}<th class="ctr">Total</th></tr>`;
  const cell = (r, c) => {
    const v = r[c] || 0;
    if (opts.cli && v > 0) {
      return `<td class="ctr drill" data-cli="${esc(opts.cli)}" data-desig="${esc(r.desig)}" data-cat="${c}">${v}</td>`;
    }
    return `<td class="ctr">${v || ''}</td>`;
  };
  const body = rows
    .map(
      (r) =>
        `<tr><td>${esc(r.desig)}</td>${cats.map((c) => cell(r, c)).join('')}<td class="ctr strong">${r.total}</td></tr>`
    )
    .join('');
  const foot =
    `<tr class="total-row"><td>TOTAL</td>${cats
      .map((c) => `<td class="ctr">${totals[c]}</td>`)
      .join('')}<td class="ctr strong">${totals.total}</td></tr>`;
  return `<table class="matrix${opts.mini ? ' mini' : ''}">${head}${body}${foot}</table>`;
}

function renderSummary() {
  const param = state.activeParam;
  const meta = state.parameters[param];
  const s = summarize(param);
  state._summary = s; // cached for the Summary PDF export

  $('summary').hidden = false;
  $('summaryTitle').textContent = `Summary — ${meta.label}`;

  $('byDesig').innerHTML = s.byCli.length
    ? matrixTable(s.cats, s.byDesig, s.totals)
    : '<p class="empty">No overdue staff for this parameter.</p>';

  const acc = $('byCli');
  acc.innerHTML = '';
  if (!s.byCli.length) {
    acc.innerHTML = '<p class="empty">—</p>';
    return;
  }
  const ordered = [...s.byCli].sort(
    state.cliSort === 'name'
      ? (a, b) => (a.cliName || '').localeCompare(b.cliName || '')
      : (a, b) => b.total - a.total || (a.cliName || '').localeCompare(b.cliName || '')
  );
  ordered.forEach((cli) => {
    const item = document.createElement('div');
    item.className = 'acc-item';

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'acc-head';
    head.innerHTML =
      `<span class="acc-caret">▸</span>` +
      `<span class="acc-name">${esc(cli.cliName) || '—'}` +
      (cli.cliId ? ` <span class="acc-id">(${esc(cli.cliId)})</span>` : '') +
      `</span>` +
      `<span class="acc-total">${cli.total}</span>`;

    const panel = document.createElement('div');
    panel.className = 'acc-panel';
    panel.hidden = true;
    panel.innerHTML = matrixTable(s.cats, cli.rows, totalRow(s.cats, cli.rows), { mini: true, cli: cli.key });

    head.addEventListener('click', () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      item.classList.toggle('open', opening);
    });

    item.appendChild(head);
    item.appendChild(panel);
    acc.appendChild(item);
  });
}

async function exportSummaryPdf() {
  const param = state.activeParam;
  const s = state._summary || summarize(param);
  if (!s.byCli.length) {
    alert('Nothing to export — no overdue staff for this parameter.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}export/summary/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parameter: param,
        generatedAtIST: state.generatedAtIST,
        cats: s.cats,
        byDesig: s.byDesig,
        totals: s.totals,
        byCli: s.byCli,
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
    a.download = `CMS_${param}_summary_${state.generatedAtIST}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed. ' + err.message);
  }
}

// ---------- Counters ----------
function buildCounters() {
  const c = $('counters');
  c.innerHTML = '';
  Object.values(state.parameters).forEach((p) => {
    const n = overdueRows(p.key).length;
    const div = document.createElement('div');
    div.className = 'counter' + (p.key === state.activeParam ? ' active' : '');
    div.dataset.key = p.key;
    div.innerHTML =
      `<div class="c-label">${p.label}</div>` +
      `<div class="c-num ${n ? 'has' : ''}">${n}</div>` +
      `<div class="c-sub">overdue · due col ${p.dueCol}</div>`;
    div.addEventListener('click', () => setParam(p.key));
    c.appendChild(div);
  });
}

// ---------- Parameter tabs ----------
function buildParamTabs() {
  const t = $('paramTabs');
  t.innerHTML = '';
  Object.values(state.parameters).forEach((p) => {
    const b = document.createElement('button');
    b.textContent = p.label;
    b.dataset.key = p.key;
    if (p.key === state.activeParam) b.classList.add('active');
    b.addEventListener('click', () => setParam(p.key));
    t.appendChild(b);
  });
}
function syncActive() {
  document.querySelectorAll('#paramTabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.key === state.activeParam));
  document.querySelectorAll('.counter').forEach((c) =>
    c.classList.toggle('active', c.dataset.key === state.activeParam));
}

// ---------- Sort ----------
$('sortSel').addEventListener('change', (e) => { state.sortBy = e.target.value; render(); });

function sortRows(rows, param) {
  const by = state.sortBy;
  const arr = [...rows];
  arr.sort((a, b) => {
    if (by === 'due') return (a.params[param].dueISO || '').localeCompare(b.params[param].dueISO || '');
    if (by === 'cli') return a.cliName.localeCompare(b.cliName);
    if (by === 'desig') return a.desig.localeCompare(b.desig) || a.cliName.localeCompare(b.cliName);
    if (by === 'grade') return a.grade.localeCompare(b.grade) || (a.params[param].dueISO || '').localeCompare(b.params[param].dueISO || '');
    return 0;
  });
  return arr;
}

// ---------- Render table ----------
function render() {
  const param = state.activeParam;
  const meta = state.parameters[param];
  const rows = sortRows(overdueRows(param), param);

  $('tableTitle').textContent = `${meta.label} — overdue list`;
  $('visibleCount').textContent = rows.length;

  const body = $('dueBody');
  body.innerHTML = '';
  $('emptyMsg').hidden = rows.length > 0;

  rows.forEach((r, i) => {
    const p = r.params[param];
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td class="num">${i + 1}</td>` +
      `<td class="mono">${esc(r.cliId)}</td>` +
      `<td>${esc(r.cliName)}</td>` +
      `<td class="mono">${esc(r.crewId)}</td>` +
      `<td>${esc(r.name)}</td>` +
      `<td>${esc(r.desig)}</td>` +
      `<td class="ctr"><span class="cat cat-${esc(r.grade)}">${esc(r.grade) || '—'}</span></td>` +
      `<td class="mono">${esc(p.done) || '—'}</td>` +
      `<td><span class="due-date">${esc(p.due)}</span></td>` +
      `<td class="rmk"><input class="rmk-input" type="text" placeholder="—" /></td>` +
      `<td class="ctr"><button class="rm-btn" title="Remove row">×</button></td>`;
    const rmk = tr.querySelector('.rmk-input');
    rmk.value = state.remarks[r.id] || '';
    rmk.addEventListener('input', () => { state.remarks[r.id] = rmk.value; });
    tr.querySelector('.rm-btn').addEventListener('click', () => {
      state.removed[param].add(r.id);
      buildCounters(); renderSummary(); syncActive(); render();
    });
    body.appendChild(tr);
  });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Remove / restore / new ----------
$('resetBtn').addEventListener('click', () => {
  state.removed[state.activeParam] = new Set();
  buildCounters(); renderSummary(); syncActive(); render();
});
$('newBtn').addEventListener('click', () => {
  fileInput.value = '';
  $('workStage').hidden = true;
  $('asof').hidden = true;
  $('uploadStage').hidden = false;
});

// ---------- Export ----------
async function exportAs(kind) {
  const param = state.activeParam;
  const rows = sortRows(overdueRows(param), param).map((r) => ({ ...r, remark: state.remarks[r.id] || '' }));
  if (rows.length === 0) { alert('Nothing to export — the list is empty.'); return; }
  try {
    const res = await fetch(`${API_BASE}export/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameter: param, generatedAtIST: state.generatedAtIST, rows }),
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
    a.download = `CMS_${param}_due_${state.generatedAtIST}.${kind === 'xlsx' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed. ' + err.message);
  }
}
$('xlsxBtn').addEventListener('click', () => exportAs('xlsx'));
$('pdfBtn').addEventListener('click', () => exportAs('pdf'));
$('summaryPdfBtn').addEventListener('click', exportSummaryPdf);

// ---------- Summary: CLI sort toggle ----------
function setCliSort(mode) {
  state.cliSort = mode;
  $('cliSortCount').classList.toggle('active', mode === 'count');
  $('cliSortName').classList.toggle('active', mode === 'name');
  renderSummary();
}
$('cliSortCount').addEventListener('click', () => setCliSort('count'));
$('cliSortName').addEventListener('click', () => setCliSort('name'));

// ---------- Summary: drill a count cell -> staff names + due dates ----------
function drillList(cliKey, desig, cat) {
  const param = state.activeParam;
  const staff = state.rows
    .filter(
      (r) =>
        r.params[param].overdue &&
        !state.removed[param].has(r.id) &&
        cliKeyOf(r) === cliKey &&
        (r.desig || '—') === desig &&
        catOf(r.grade) === cat
    )
    .sort((a, b) => (a.params[param].dueISO || '').localeCompare(b.params[param].dueISO || ''));

  const head = `<div class="drill-head">${esc(desig)} · Cat ${esc(cat)} · ${staff.length} staff</div>`;
  const items = staff
    .map(
      (r) =>
        `<div class="drill-row"><span class="dn">${esc(r.name) || '—'}</span>` +
        `<span class="dc mono">${esc(r.crewId) || ''}</span>` +
        `<span class="dd mono">due ${esc(r.params[param].due) || '—'}</span></div>`
    )
    .join('');
  return head + items;
}

// Delegated: #byCli persists across re-renders (only its innerHTML is rebuilt).
$('byCli').addEventListener('click', (e) => {
  const cellEl = e.target.closest('.drill');
  if (!cellEl) return;
  const panel = cellEl.closest('.acc-panel');
  if (!panel) return;
  const { cli, desig, cat } = cellEl.dataset;
  const key = `${cli}|${desig}|${cat}`;

  let box = panel.querySelector('.drill-detail');
  if (!box) {
    box = document.createElement('div');
    box.className = 'drill-detail';
    panel.appendChild(box);
  }
  const wasActive = cellEl.classList.contains('active');
  panel.querySelectorAll('.drill.active').forEach((c) => c.classList.remove('active'));

  if (wasActive && box.dataset.key === key) {
    box.hidden = true;            // toggle off if the same cell is clicked again
    box.dataset.key = '';
    return;
  }
  box.dataset.key = key;
  box.innerHTML = drillList(cli, desig, cat);
  box.hidden = false;
  cellEl.classList.add('active');
});
