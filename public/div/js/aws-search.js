/* ===========================================================================
 * AWS Search — one box, three entities: cab / signal / motorman.
 * Type a cab number, a signal number, or a motorman (name or CMS id) and see
 * ALL that entity's AWS acts across ALL history (independent of the page's
 * selected period). Hits GET /api/division/aws/search?q=... and shows the
 * results in a self-contained overlay (no Bootstrap dependency).
 *
 * Include once per page, and add one mount element where the box should appear:
 *   <span class="aws-search"></span>
 *   <script src="/div/js/aws-search.js"></script>
 * ======================================================================== */
(function () {
  if (window.__awsSearchLoaded) return;   // guard against double-include
  window.__awsSearchLoaded = true;

  var css = '' +
    '.awss-box{display:inline-flex;align-items:center;gap:6px;}' +
    '.awss-input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);' +
      'color:#fff;border-radius:12px;padding:7px 12px;width:230px;font-size:.9rem;outline:none;}' +
    '.awss-input::placeholder{color:rgba(255,255,255,.4);}' +
    '.awss-input:focus{border-color:rgba(110,231,255,.6);box-shadow:0 0 0 3px rgba(110,231,255,.12);}' +
    '.awss-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;' +
      'border-radius:12px;padding:7px 11px;cursor:pointer;}' +
    '.awss-btn:hover{background:rgba(255,255,255,.12);}' +
    '.awss-overlay{position:fixed;inset:0;z-index:2000;background:rgba(3,7,15,.6);' +
      'display:flex;align-items:flex-start;justify-content:center;padding:6vh 12px;' +
      '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);}' +
    '.awss-panel{width:100%;max-width:940px;max-height:86vh;display:flex;flex-direction:column;' +
      'background:#0b1220;border:1px solid rgba(255,255,255,.14);border-radius:16px;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.5);color:rgba(255,255,255,.92);' +
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +
    '.awss-head{display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.12);}' +
    '.awss-title{font-weight:800;font-size:1rem;}' +
    '.awss-close{background:none;border:none;color:rgba(255,255,255,.7);font-size:1.5rem;line-height:1;cursor:pointer;}' +
    '.awss-close:hover{color:#fff;}' +
    '.awss-body{overflow:auto;padding:12px 16px 16px;}' +
    '.awss-sum{font-size:.85rem;color:rgba(255,255,255,.7);margin-bottom:10px;}' +
    '.awss-loading{padding:26px 8px;text-align:center;color:rgba(255,255,255,.65);}' +
    '.awss-table{width:100%;border-collapse:collapse;font-size:.85rem;}' +
    '.awss-table th{position:sticky;top:0;background:#0b1220;text-align:left;color:rgba(255,255,255,.6);' +
      'font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.4px;' +
      'padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.15);}' +
    '.awss-table td{padding:5px 8px;border-top:1px solid rgba(255,255,255,.08);vertical-align:top;}' +
    '.awss-badge{display:inline-block;background:rgba(110,231,255,.18);border:1px solid rgba(110,231,255,.4);' +
      'color:#cdefff;border-radius:6px;padding:1px 7px;font-weight:700;font-size:.78rem;}' +
    '.awss-review{color:#ffcf6b;}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function esc(v) {
    return (v == null ? '' : String(v)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtD(d) {
    if (!d) return '';
    var x = new Date(d);
    if (isNaN(x)) return esc(d);
    return String(x.getDate()).padStart(2, '0') + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + x.getFullYear();
  }

  var overlay = document.createElement('div');
  overlay.className = 'awss-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML = '<div class="awss-panel">' +
    '<div class="awss-head"><span class="awss-title">Search</span>' +
    '<button class="awss-close" aria-label="Close">&times;</button></div>' +
    '<div class="awss-body"></div></div>';
  document.body.appendChild(overlay);

  function closeOverlay() { overlay.style.display = 'none'; }
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(); });
  overlay.querySelector('.awss-close').addEventListener('click', closeOverlay);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlay(); });

  async function run(q) {
    q = (q || '').trim();
    if (q.length < 2) return;
    overlay.style.display = 'flex';
    overlay.querySelector('.awss-title').textContent = 'Search: ' + q;
    var body = overlay.querySelector('.awss-body');
    body.innerHTML = '<div class="awss-loading">Searching…</div>';
    try {
      var r = await fetch('/api/division/aws/search?q=' + encodeURIComponent(q));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      if (!d.acts || !d.acts.length) {
        body.innerHTML = '<div class="awss-loading">No AWS acts found for “' + esc(q) + '”.</div>';
        return;
      }
      var s = d.summary || {};
      var sum = '<div class="awss-sum">' + d.acts.length + ' act' + (d.acts.length === 1 ? '' : 's') +
        (d.truncated ? ' (showing first 500)' : '') + ' · ' +
        (s.distinct_cabs || 0) + ' cab(s) · ' + (s.distinct_signals || 0) + ' signal(s) · ' +
        (s.distinct_crew || 0) + ' motorman(s)</div>';
      var rows = d.acts.map(function (a) {
        var loc = a.signal_number || a.location_raw ||
          (a.needs_manual_review ? '<span class="awss-review">review</span>' : '');
        var time = (a.abn_time || '').toString().substring(0, 5);
        var route = esc(a.from_station || '') + (a.to_station ? ' → ' + esc(a.to_station) : '');
        return '<tr>' +
          '<td>' + fmtD(a.abn_date) + '</td>' +
          '<td>' + esc(time) + '</td>' +
          '<td><span class="awss-badge">' + esc(a.aws_code || '?') + '</span></td>' +
          '<td>' + loc + '</td>' +
          '<td>' + esc(a.loco_raw || '') + '</td>' +
          '<td>' + esc(a.train_number || '') + '</td>' +
          '<td>' + esc(a.crew_name || '') + (a.crew_id ? '<br><small>' + esc(a.crew_id) + '</small>' : '') + '</td>' +
          '<td>' + route + '</td>' +
          '<td>' + esc(a.responsibility || '') + '</td>' +
          '</tr>';
      }).join('');
      body.innerHTML = sum +
        '<table class="awss-table"><thead><tr>' +
        '<th>Date</th><th>Time</th><th>Code</th><th>Signal</th><th>Cab</th>' +
        '<th>Train</th><th>Motorman</th><th>Route</th><th>Resp.</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>';
    } catch (err) {
      body.innerHTML = '<div class="awss-loading" style="color:#ff6b6b">Search failed: ' + esc(err.message) + '</div>';
    }
  }

  var mounts = document.querySelectorAll('.aws-search');
  Array.prototype.forEach.call(mounts, function (m) {
    m.innerHTML = '<span class="awss-box">' +
      '<input class="awss-input" type="text" placeholder="Search cab / signal / motorman…">' +
      '<button class="awss-btn" title="Search"><i class="bi bi-search"></i></button></span>';
    var inp = m.querySelector('.awss-input');
    var btn = m.querySelector('.awss-btn');
    btn.addEventListener('click', function () { run(inp.value); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(inp.value); } });
  });
})();
