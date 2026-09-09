/* ============================================================================
 * The ambush block of the officers' sheet.
 *
 * Transposed from the counselling block -- subjects down the side, depots
 * across -- because that is how the workbook has printed it for over a year and
 * the officers read it that way. Each subject appears twice, ML and SUB, which
 * is what the workbook's "Location of Ambush" column was recording.
 *
 * Empty rows are kept. A blank ML row says the mainline CLIs reported no checks
 * that day, which is information; a missing row says nothing at all.
 * ==========================================================================*/
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { from: null, to: null, range: false, data: null };

  function today() { return new Date().toISOString().slice(0, 10); }

  function table(d) {
    var head = '<tr><th>Subject</th><th>Line</th>' +
      d.depots.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') +
      '<th class="col-total">Total</th><th>Caught</th></tr>';

    var body = d.rows.map(function (r) {
      return '<tr><td>' + esc(r.subject_name) + '</td>' +
        '<td><span class="tag ' + (r.line === 'SUB' ? 'mine' : 'mute') + '">' + r.line + '</span></td>' +
        d.depots.map(function (x) {
          var n = r.counts[x];
          return '<td class="' + (n ? '' : 'zero') + '">' + n + '</td>';
        }).join('') +
        '<td class="col-total ' + (r.total ? '' : 'zero') + '">' + r.total + '</td>' +
        '<td class="' + (r.total_caught ? 'hit caught-cell' : 'zero') + '"' +
          (r.total_caught ? ' data-subject="' + r.subject_id + '" data-line="' + r.line + '"' : '') +
          '>' + r.total_caught + '</td></tr>';
    }).join('');

    var foot = '<tr class="total-row"><td>TOTAL</td><td></td>' +
      d.depots.map(function (x) { return '<td>' + d.colTotals[x] + '</td>'; }).join('') +
      '<td class="col-total">' + d.grandTotal + '</td><td>' + d.grandCaught + '</td></tr>';

    return '<div class="table-scroll"><table class="sheet">' +
      '<thead>' + head + '</thead><tbody>' + body + foot + '</tbody></table></div>';
  }

  function caught(subject, line) {
    var host = document.querySelector('[data-names]');
    host.hidden = false;
    host.innerHTML = '<div class="state"><div class="spinner"></div>Loading…</div>';
    var p = new URLSearchParams({ from: S.from, to: S.range ? S.to : S.from });
    if (subject) p.set('subject', subject);
    if (line) p.set('line', line);
    Cli.api('/ambush/caught?' + p).then(function (d) {
      host.innerHTML =
        '<div class="card-head"><h3>' + d.caught.length + ' caught</h3>' +
          '<div style="flex:1"></div><button class="btn sm" data-close>Close</button></div>' +
        '<div class="card-body tight"><ul class="rows">' +
          d.caught.map(function (c) {
            return '<li><div class="who"><div class="nm">' + esc(c.name) + '</div>' +
              '<div class="meta">' + esc(c.current_cms_id) + ' · ' + esc(c.designation_code) +
              ' · ' + esc(c.staff_office) + ' · ' + esc(c.subject_name) + ' · ' + esc(c.return_date) +
              ' · by ' + esc(c.cli_name || '—') + '</div>' +
              (c.remarks ? '<div class="meta" style="color:var(--red-600)">' + esc(c.remarks) + '</div>' : '') +
              '</div></li>';
          }).join('') + '</ul></div>';
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) { Cli.toast(e.message, 'alert'); });
  }

  function paint(d) {
    var title = S.range ? S.from + ' to ' + S.to : S.from;
    var warn = '';
    if (d.warnings && d.warnings.length) {
      warn += '<div class="banner warn">' + d.warnings.map(esc).join('<br>') + '</div>';
    }
    if (d.not_filed && d.not_filed.length) {
      warn += '<div class="banner info">Nothing filed yet by: <strong>' +
              d.not_filed.map(esc).join(', ') + '</strong>.</div>';
    }
    document.querySelector('[data-cli-main]').innerHTML =
      '<div class="card no-print"><div class="card-body" ' +
        'style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
        '<div class="field" style="margin:0"><label for="s-from"><span data-lbl>Date</span></label>' +
          '<input class="input" type="date" id="s-from" value="' + S.from + '"></div>' +
        '<div class="field" style="margin:0" data-to-wrap hidden><label for="s-to">To</label>' +
          '<input class="input" type="date" id="s-to" value="' + S.to + '"></div>' +
        '<button class="btn" data-range>Date range</button>' +
        '<div style="flex:1"></div>' +
        '<button class="btn" data-print>Print</button>' +
      '</div></div>' + warn +
      '<div class="card">' +
        '<div class="card-head"><h3>Ambush Check — ' + esc(title) + '</h3>' +
          '<div style="flex:1"></div>' +
          '<span class="tag">' + d.grandTotal + ' checked</span>' +
          (d.grandCaught ? ' <span class="tag warn">' + d.grandCaught + ' caught</span>' : '') +
        '</div>' +
        '<div class="print-title" style="padding:12px 18px">' +
          '<strong>AMBUSH CHECK</strong> — ' + esc(title) +
          '<div class="motto">Mission Zero SPAD</div></div>' +
        table(d) +
      '</div>' +
      '<div class="card" data-names hidden></div>' +
      '<p class="no-print" style="color:var(--ink-3);font-size:12px;margin-top:12px">' +
        'Tap a figure in the Caught column to see who, and what was found.</p>';

    var w = document.querySelector('[data-to-wrap]');
    w.hidden = !S.range;
    document.querySelector('[data-lbl]').textContent = S.range ? 'From' : 'Date';
    var rb = document.querySelector('[data-range]');
    rb.classList.toggle('primary', S.range);
    rb.textContent = S.range ? 'Single day' : 'Date range';
  }

  function load() {
    return Cli.api('/ambush/sheet?from=' + S.from + '&to=' + (S.range ? S.to : S.from))
      .then(function (d) { S.data = d; paint(d); });
  }

  function render() {
    S.from = S.to = today();
    document.querySelector('[data-cli-main]').addEventListener('click', function (e) {
      var td = e.target.closest('td.caught-cell');
      if (td) return caught(td.dataset.subject, td.dataset.line);
      if (e.target.matches('[data-close]')) { document.querySelector('[data-names]').hidden = true; return; }
      if (e.target.matches('[data-print]')) return window.print();
      if (e.target.matches('[data-range]')) { S.range = !S.range; return load(); }
    });
    document.querySelector('[data-cli-main]').addEventListener('change', function (e) {
      if (e.target.id === 's-from') { S.from = e.target.value; load(); }
      if (e.target.id === 's-to') { S.to = e.target.value; load(); }
    });
    return load();
  }

  CliShell.init('ambush-sheet');
  Cli.boot(render);
}());
