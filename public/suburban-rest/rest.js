'use strict';

/* Suburban rest analysis — client. Talks to /suburban-rest/*. */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let DATA = null;      // last analysis (from upload, or reconstructed from a saved run)
let TAB = 'double';

// ---- time helpers ----

// "5:00" / "5" / "300m" -> minutes. Returns null when unparseable.
function toMinutes(text) {
  const t = String(text || '').trim();
  let m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  m = t.match(/^(\d{1,4})\s*m$/i);
  if (m) return Number(m[1]);
  m = t.match(/^(\d{1,2}(?:\.\d+)?)$/);
  if (m) return Math.round(Number(m[1]) * 60);
  return null;
}

function hhmm(mins) {
  if (mins == null || mins === '') return '—';
  const n = Number(mins);
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  return `${sign}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
}

// Never toISOString() — it would shift IST by -5:30 and move times to the previous day.
function dt(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '—';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function options() {
  return {
    floorMinutes: toMinutes($('floorInput').value) ?? 300,
    extraDutyMaxGapMinutes: toMinutes($('gapInput').value) ?? 240,
  };
}

// ---- upload ----

async function upload(files) {
  $('uploadErr').hidden = true;
  const fd = new FormData();
  for (const f of files) fd.append('files', f);
  const opt = options();
  fd.append('floorMinutes', opt.floorMinutes);
  fd.append('extraDutyMaxGapMinutes', opt.extraDutyMaxGapMinutes);

  $('dropzone').classList.remove('over');
  $('dropzone').querySelector('.dz-title').textContent = 'Reading files…';
  try {
    const res = await fetch('upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed.');
    DATA = json;
    render();
  } catch (err) {
    $('uploadErr').textContent = err.message;
    $('uploadErr').hidden = false;
  } finally {
    $('dropzone').querySelector('.dz-title').textContent = 'Drop the CMS Sign On/Off Excel files here';
  }
}

// ---- render ----

function render() {
  $('uploadStage').hidden = true;
  $('workStage').hidden = false;

  const cov = DATA.coverage || {};
  if (cov.from) {
    $('asofPeriod').textContent = `${dt(cov.from)} → ${dt(cov.to)}`;
    $('asof').hidden = false;
  }

  // Coverage: name the gaps. A silent gap reads as "nothing happened then".
  let cv = '<strong>Coverage.</strong> ';
  cv += (cov.covered || []).map((c) => `<span class="cov-line">${dt(c.from)} → ${dt(c.to)}</span>`).join(' · ');
  if ((cov.gaps || []).length) {
    cv += '<br><span class="gap">Not covered: ' +
      cov.gaps.map((g) => `${dt(g.from)} → ${dt(g.to)}`).join(', ') +
      ' — duties in these windows are invisible to this report.</span>';
  }
  $('coverage').innerHTML = cv;
  $('coverage').hidden = false;

  const warns = DATA.warnings || [];
  $('warnings').innerHTML = warns.map((w) => `<p>${esc(w)}</p>`).join('');
  $('warnings').hidden = warns.length === 0;

  const t = DATA.totals || {};
  $('counters').innerHTML = [
    { n: t.dutyRows, l: 'Duties read' },
    { n: t.doublePairs, l: 'Double pairs' },
    { n: t.doublesBelowBooked, l: 'Below booked rest', c: 'amber' },
    { n: t.doublesBelowFloor, l: `Below ${hhmm((DATA.options || {}).floorMinutes)} floor`, c: 'red' },
    { n: t.extraDutyPairs, l: 'Extra-duty pairs', c: 'red' },
    { n: t.unpairedCrew, l: 'Crew with 1 duty only' },
  ].map((c) => `<div class="counter ${c.c || ''}"><div class="num">${c.n == null ? '—' : c.n}</div><div class="lbl">${esc(c.l)}</div></div>`).join('');

  renderTable();
}

const HEADS = {
  double: ['Office', 'Crew ID', 'Name', 'Det 1', 'Sign on', 'Sign off', 'Det 2', 'Sign on', 'Sign off', 'Booked rest', 'Actual rest', 'Rest lost', ''],
  extra:  ['Office', 'Crew ID', 'Name', 'Duty 1', 'Sign on', 'Sign off', 'Duty 2', 'Sign on', 'Sign off', 'Interval', 'Combined span', 'Note'],
};

function rowsFor(tab) {
  const list = tab === 'double' ? (DATA.doubles || []) : (DATA.extras || []);
  const office = $('officeSel').value;
  return office ? list.filter((r) => r.office === office) : list;
}

function renderTable() {
  const rows = rowsFor(TAB);
  $('resultHead').innerHTML = '<tr>' + HEADS[TAB].map((h, i) =>
    `<th class="${i >= 3 ? 'mono' : ''}">${esc(h)}</th>`).join('') + '</tr>';

  $('tableTitle').textContent = TAB === 'double'
    ? `Double-detail rest — booked vs actual (floor ${hhmm((DATA.options || {}).floorMinutes)})`
    : `Second duty starting within ${hhmm((DATA.options || {}).extraDutyMaxGapMinutes)} of the first signing off`;
  $('visibleCount').textContent = rows.length;
  $('emptyMsg').hidden = rows.length > 0;

  $('resultBody').innerHTML = rows.map((r) => {
    const common =
      `<td>${esc(r.office || '')}</td>` +
      `<td class="mono">${esc(r.crewId || r.crew_id)}</td>` +
      `<td>${esc(r.crewName || r.crew_name || '')}</td>` +
      `<td class="mono ctr">${esc(r.det1)}</td>` +
      `<td class="mono">${dt(r.det1On || r.det1_on)}</td>` +
      `<td class="mono">${dt(r.det1Off || r.det1_off)}</td>` +
      `<td class="mono ctr">${esc(r.det2)}</td>` +
      `<td class="mono">${dt(r.det2On || r.det2_on)}</td>` +
      `<td class="mono">${dt(r.det2Off || r.det2_off)}</td>`;

    const actual = r.actualRestMinutes ?? r.actual_rest_minutes;
    const sev = r.severity || 'ok';

    if (TAB === 'double') {
      const booked = r.bookedRestMinutes ?? r.booked_rest_minutes;
      const lost = r.shortfallMinutes ?? r.shortfall_minutes;
      return `<tr class="sev-${sev}">${common}` +
        `<td class="mono ctr">${hhmm(booked)}</td>` +
        `<td class="mono ctr ${sev === 'red' ? 'bad' : ''}">${hhmm(actual)}</td>` +
        `<td class="mono ctr ${lost > 0 ? 'bad' : ''}">${lost > 0 ? hhmm(lost) : '—'}</td>` +
        `<td class="ctr"><span class="flag ${sev}">${sev === 'red' ? 'BELOW FLOOR' : sev === 'amber' ? 'SHORT' : ''}</span></td></tr>`;
    }
    const span = r.spanMinutes ?? r.span_minutes;
    const chain = r.chainingIncomplete ?? r.chaining_incomplete;
    return `<tr class="sev-${sev}">${common}` +
      `<td class="mono ctr ${sev === 'red' ? 'bad' : ''}">${hhmm(actual)}</td>` +
      `<td class="mono ctr">${hhmm(span)}</td>` +
      `<td class="note">${chain ? 'Detail chaining incomplete — verify before acting' : ''}</td></tr>`;
  }).join('');
}

// ---- saved runs ----

async function loadHistory() {
  try {
    const res = await fetch('runs');
    if (!res.ok) return;
    const { runs } = await res.json();
    if (!runs || !runs.length) return;
    $('histList').innerHTML = runs.map((r) =>
      `<div class="run-row">
         <span class="rr-when">${dt(r.uploaded_at)}</span>
         <span>${dt(r.period_from)} → ${dt(r.period_to)}</span>
         <span>${r.double_pairs} doubles · ${r.extra_duty_pairs} extra</span>
         <button class="btn btn-ghost rr-open" data-run="${r.id}">Open</button>
       </div>`).join('');
    $('histWrap').hidden = false;
  } catch { /* history is a convenience; never block the page on it */ }
}

async function openRun(id) {
  const res = await fetch(`runs/${id}`);
  const json = await res.json();
  if (!res.ok) { $('uploadErr').textContent = json.error; $('uploadErr').hidden = false; return; }

  const run = json.run;
  DATA = {
    doubles: json.doubles,
    extras: json.extras,
    warnings: run.warnings || [],
    options: { floorMinutes: run.floor_minutes, extraDutyMaxGapMinutes: run.extra_duty_max_gap_minutes },
    coverage: {
      from: run.period_from, to: run.period_to,
      covered: run.period_from ? [{ from: run.period_from, to: run.period_to }] : [],
      gaps: run.coverage_gaps || [],
    },
    totals: {
      dutyRows: run.duty_rows, crew: run.crew_count, unpairedCrew: run.unpaired_crew,
      doublePairs: run.double_pairs, extraDutyPairs: run.extra_duty_pairs,
      ordinaryRests: run.ordinary_rests,
      doublesBelowBooked: json.doubles.filter((d) => d.shortfall_minutes > 0).length,
      doublesBelowFloor: json.doubles.filter((d) => d.actual_rest_minutes < run.floor_minutes).length,
    },
    files: (run.file_names || []).map((f) => ({ fileName: f })),
    savedRunId: run.id,
  };
  render();
}

// ---- wiring ----

$('fileInput').addEventListener('change', (e) => { if (e.target.files.length) upload(e.target.files); });

const dz = $('dropzone');
['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
dz.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) upload(e.dataTransfer.files); });

$('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.seg');
  if (!btn) return;
  TAB = btn.dataset.tab;
  [...$('tabs').children].forEach((b) => b.classList.toggle('active', b === btn));
  renderTable();
});

$('officeSel').addEventListener('change', renderTable);

$('newBtn').addEventListener('click', () => {
  DATA = null;
  $('workStage').hidden = true;
  $('uploadStage').hidden = false;
  $('asof').hidden = true;
  $('fileInput').value = '';
  loadHistory();
});

$('histList').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-run]');
  if (btn) openRun(btn.dataset.run);
});

$('saveBtn').addEventListener('click', async () => {
  const btn = $('saveBtn');
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Saving…';
  try {
    const res = await fetch('runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DATA),
    });
    const json = await res.json();
    btn.textContent = res.ok ? `Saved (run #${json.runId})` : (json.error || 'Save failed');
    if (res.ok) DATA.savedRunId = json.runId;
  } catch (err) {
    btn.textContent = 'Save failed';
  } finally {
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2500);
  }
});

$('xlsxBtn').addEventListener('click', async () => {
  const res = await fetch('export/xlsx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(DATA),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'suburban-rest-analysis.xlsx';
  a.click();
  URL.revokeObjectURL(a.href);
});

loadHistory();
