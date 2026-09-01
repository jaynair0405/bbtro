/* ============================================================================
 * The consolidated sheet — the thing that goes before the officers.
 *
 * Reproduces the HQ workbook's SPAD block exactly: depot rows x designation
 * columns, row totals, column totals, grand total. The difference from paper is
 * that every cell is a door: tap it and the names behind the number appear.
 * ==========================================================================*/
(function () {
  'use strict';
  var esc = CliShell.esc;
  var S = { date: null, from: null, to: null, range: false, data: null };

  function today() { return new Date().toISOString().slice(0, 10); }

  function controls() {
    return '<div class="card no-print"><div class="card-body" ' +
      'style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
      '<div class="field" style="margin:0"><label for="s-from">' +
        '<span data-lbl>Date</span></label>' +
        '<input class="input" type="date" id="s-from" value="' + S.from + '"></div>' +
      '<div class="field" style="margin:0" data-to-wrap hidden><label for="s-to">To</label>' +
        '<input class="input" type="date" id="s-to" value="' + S.to + '"></div>' +
      '<button class="btn" data-range>Date range</button>' +
      '<div style="flex:1"></div>' +
      '<button class="btn" data-print>Print</button>' +
      '<a class="btn" data-export>Export .xlsx</a>' +
      '</div></div>';
  }

  function table(d) {
    var cols = d.columns;
    var head = '<tr><th>Depot</th>' + cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') +
               '<th class="col-total">Total</th></tr>';

    var body = d.rows.map(function (r) {
      return '<tr><td>' + esc(r.depot) + '</td>' +
        cols.map(function (c) {
          var n = r.counts[c.key];
          return '<td class="' + (n ? 'hit' : 'zero') + '"' +
                 (n ? ' data-depot="' + esc(r.depot) + '" data-col="' + esc(c.key) + '"' : '') +
                 '>' + n + '</td>';
        }).join('') +
        '<td class="col-total ' + (r.total ? 'hit' : 'zero') + '"' +
          (r.total ? ' data-depot="' + esc(r.depot) + '"' : '') + '>' + r.total + '</td></tr>';
    }).join('');

    var foot = '<tr class="total-row"><td>TOTAL</td>' +
      cols.map(function (c) { return '<td>' + d.colTotals[c.key] + '</td>'; }).join('') +
      '<td class="col-total">' + d.grandTotal + '</td></tr>';

    return '<div class="table-scroll"><table class="sheet">' +
      '<thead>' + head + '</thead><tbody>' + body + foot + '</tbody></table></div>';
  }

  function cell(depot, col) {
    var host = document.querySelector('[data-names]');
    host.hidden = false;
    host.innerHTML = '<div class="state"><div class="spinner"></div>Loading names…</div>';
    var p = new URLSearchParams({ from: S.from, to: S.range ? S.to : S.from, depot: depot });
    if (col) p.set('column', col);
    Cli.api('/sheet/cell?' + p).then(function (d) {
      host.innerHTML =
        '<div class="card-head"><h3>' + esc(depot) + (col ? ' · ' + esc(col.replace('_', ' ')) : '') +
          ' — ' + d.staff.length + ' counselled</h3>' +
          '<div style="flex:1"></div><button class="btn sm" data-close>Close</button></div>' +
        '<div class="card-body tight"><ul class="rows">' +
          d.staff.map(function (s) {
            return '<li><div class="who"><div class="nm">' + esc(s.name) + '</div>' +
              '<div class="meta">' + esc(s.current_cms_id || s.staff_hrms_id) + ' · ' +
              esc(s.designation_code) + ' · ' + esc(s.office_code) + ' · ' + esc(s.session_date) +
              ' · by ' + esc(s.cli_name || '—') +
              (s.remarks ? ' · ' + esc(s.remarks) : '') + '</div></div></li>';
          }).join('') +
        '</ul></div>';
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) { Cli.toast(e.message, 'alert'); });
  }

  function lockBar(d, isHQ) {
    if (!isHQ) return '';
    var locked = d.locks.length > 0;
    return '<div class="card no-print"><div class="card-body" ' +
      'style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
      '<div style="flex:1;font-size:13px;color:var(--ink-2)">' +
        (locked
          ? 'Locked — lobbies can no longer change this date.'
          : 'Once this has gone to the officers, lock it so the figures cannot move underneath them.') +
      '</div>' +
      (locked
        ? '<button class="btn danger" data-unlock>Reopen for lobbies</button>'
        : '<button class="btn primary" data-lock>Lock this date</button>') +
      '</div></div>';
  }

  function paint(d, isHQ) {
    var main = document.querySelector('[data-cli-main]');
    var title = S.range ? S.from + ' to ' + S.to : S.from;

    var warn = '';
    if (d.warnings && d.warnings.length) {
      warn += '<div class="banner warn">' + d.warnings.map(esc).join('<br>') + '</div>';
    }
    // A lobby that filed nothing and a lobby that counselled nobody looked
    // identical on paper. Say which it is.
    if (d.not_filed && d.not_filed.length) {
      warn += '<div class="banner info">Nothing filed yet by: <strong>' +
              d.not_filed.map(esc).join(', ') + '</strong>.</div>';
    }

    main.innerHTML =
      controls() +
      warn +
      lockBar(d, isHQ) +
      '<div class="card">' +
        '<div class="card-head">' +
          '<h3>' + esc(d.topic.topic_name) + ' — ' + esc(title) + '</h3>' +
          '<div style="flex:1"></div>' +
          '<span class="tag">' + d.grandTotal + ' counselled</span>' +
        '</div>' +
        '<div class="print-title" style="padding:12px 18px">' +
          '<strong>' + esc(d.topic.topic_name.toUpperCase()) + '</strong> — ' + esc(title) +
          '<div class="motto">Mission Zero SPAD</div>' +
        '</div>' +
        table(d) +
      '</div>' +
      '<div class="card" data-names hidden></div>' +
      '<p class="no-print" style="color:var(--ink-3);font-size:12px;margin-top:12px">' +
        'Tap any number to see the names behind it.</p>';

    // range toggle + date inputs
    var toWrap = main.querySelector('[data-to-wrap]');
    toWrap.hidden = !S.range;
    main.querySelector('[data-lbl]').textContent = S.range ? 'From' : 'Date';
    var rangeBtn = main.querySelector('[data-range]');
    rangeBtn.classList.toggle('primary', S.range);
    rangeBtn.textContent = S.range ? 'Single day' : 'Date range';
    main.querySelector('[data-export]').href =
      '/api/division/counselling/sheet/export?from=' + S.from + '&to=' + (S.range ? S.to : S.from);
  }

  function load() {
    var isHQ = Cli.boot_.me.is_hq;
    return Cli.api('/sheet?from=' + S.from + '&to=' + (S.range ? S.to : S.from)).then(function (d) {
      S.data = d;
      paint(d, isHQ);
    });
  }

  function render(boot) {
    S.from = S.to = today();

    document.querySelector('[data-cli-main]').addEventListener('click', function (e) {
      var td = e.target.closest('td.hit');
      if (td) return cell(td.dataset.depot, td.dataset.col || null);
      if (e.target.matches('[data-close]')) { document.querySelector('[data-names]').hidden = true; return; }
      if (e.target.matches('[data-print]')) return window.print();
      if (e.target.matches('[data-range]')) { S.range = !S.range; return load(); }
      if (e.target.matches('[data-lock]')) {
        return Cli.post('/locks', { date: S.from })
          .then(function () { Cli.toast('Locked ' + S.from + '.', 'info'); return load(); })
          .catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
      if (e.target.matches('[data-unlock]')) {
        return Cli.api('/locks?date=' + S.from, { method: 'DELETE' })
          .then(function () { Cli.toast('Reopened ' + S.from + '.', 'info'); return load(); })
          .catch(function (err) { Cli.toast(err.message, 'alert'); });
      }
    });
    document.querySelector('[data-cli-main]').addEventListener('change', function (e) {
      if (e.target.id === 's-from') { S.from = e.target.value; load(); }
      if (e.target.id === 's-to') { S.to = e.target.value; load(); }
    });

    return load();
  }

  CliShell.init('sheet');
  Cli.boot(render);
}());
