/**
 * Suburban Crew Ops — Train Index.
 *
 * Answers both directions: "who works this train?" and "what does this detail
 * work?". The three indexes it runs on (TRAINS / TDET / TLEGS) are DERIVED HERE
 * from the dataset, using the same SubDerive.buildTrainIndex the server uses —
 * so the wire carries details+legs once and the client shapes them, rather than
 * the API shipping a third representation of the same rows.
 *
 * Deep links: #t=<normalized train no>, #d=<detail_id>.
 */
(function () {
  'use strict';

  var esc = SubDerive.esc;
  var OFFNAME = SubDerive.OFFN;

  function render(D) {
    var idx = SubDerive.buildTrainIndex(D.details, D.legs, D.master);
    var TRAINS = idx.TRAINS, TDET = idx.TDET, TLEGS = idx.TLEGS;

    SubShell.setCounts(D.counts);

    /* ---------- indexes ---------- */
    const byTrain = new Map();          // normalized train no -> legs
    const byDetail = new Map();         // detail_id -> legs
    for (const l of TLEGS) {
      if (!byTrain.has(l.t)) byTrain.set(l.t, []);
      byTrain.get(l.t).push(l);
      if (!byDetail.has(l.did)) byDetail.set(l.did, []);
      byDetail.get(l.did).push(l);
    }
    // NOT re-sorted by start time. The payload already arrives in DUTY order
    // (minutes since that detail's sign-on), and sorting by clock time would
    // put a 04:49 leg before a 22:58 one on the 133 duties that cross midnight
    // — detail 220 reads backwards that way. See lib/subCrew/queries.js.

    const trainOf = new Map(TRAINS.map(t => [t.t, t]));
    const didByNum = {};
    for (const [did, d] of Object.entries(TDET)) didByNum[d.num] = did;

    const DETAILS = Object.entries(TDET)
      .map(([did, d]) => ({ did, ...d }))
      .sort((a, b) => (+a.num || 0) - (+b.num || 0));

    /* ---------- state ---------- */
    let mode = 'train';           // 'train' | 'detail'
    let sel = null;               // selected key (norm train no, or detail_id)
    const F = { svc: '', lg: '', dir: '', off: '', multi: false };

    /* ---------- filter bar ---------- */
    const FILTS = {
      train: `
        <select id="f-svc"><option value="">Service · all</option><option>FAST</option><option>SEMI_FAST</option><option>SLOW</option><option>EMPTY_RAKE</option></select>
        <select id="f-lg"><option value="">Line · all</option><option>MAIN</option><option>HARBOUR</option><option>TRANS_HARBOUR</option><option>SE</option><option>NE</option><option>PORT</option><option>OTHER</option></select>
        <select id="f-dir"><option value="">Dir · all</option><option>UP</option><option>DN</option></select>
        <div class="chk" id="f-multi">Multi-detail only</div>`,
      detail: `
        <select id="f-off"><option value="">Office · all</option><option value="CSMT-SUB">CSMT</option><option value="KYN-SUB">KYN</option><option value="PNVL-SUB">PNVL</option></select>
        <select id="f-lg"><option value="">Line · all</option><option value="mainline">Mainline</option><option value="harbour">Harbour</option></select>
        <select id="f-svc"><option value="">Link · all</option><option value="continuous">Continuous</option><option value="fix">Fix</option><option value="memu">MEMU</option></select>`,
    };

    function paintFilts() {
      document.getElementById('filts').innerHTML = FILTS[mode];
      document.getElementById('q').placeholder = mode === 'train' ? 'Train no. — e.g. PL128, B75, K35' : 'Detail no. — e.g. 466, 201, 675';
      for (const [id, key] of [['f-svc', 'svc'], ['f-lg', 'lg'], ['f-dir', 'dir'], ['f-off', 'off']]) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.value = F[key];
        el.onchange = () => { F[key] = el.value; paintList(); };
      }
      const m = document.getElementById('f-multi');
      if (m) {
        m.classList.toggle('on', F.multi);
        m.onclick = () => { F.multi = !F.multi; m.classList.toggle('on', F.multi); paintList(); };
      }
    }

    /* ---------- list ---------- */
    const CAP = 300;   // render cap; search narrows below it

    function matches(q, ...fields) {
      if (!q) return true;
      return fields.some(f => f && String(f).toUpperCase().includes(q));
    }

    function filtered() {
      const q = document.getElementById('q').value.trim().toUpperCase().replace(/\s+/g, '');
      if (mode === 'train') {
        return TRAINS.filter(t =>
          matches(q, t.t, t.disp) &&
          (!F.svc || t.svc === F.svc) &&
          (!F.lg || t.lg === F.lg) &&
          (!F.dir || t.dir === F.dir) &&
          (!F.multi || t.ds.length > 1));
      }
      return DETAILS.filter(d =>
        matches(q, d.num, d.did) &&
        (!F.off || d.off === F.off) &&
        (!F.lg || d.ln === F.lg) &&
        (!F.svc || d.lk === F.svc));
    }

    function paintList() {
      const rows = filtered();
      const shown = rows.slice(0, CAP);
      document.getElementById('cnt').innerHTML = rows.length
        ? `<b>${rows.length}</b> ${mode === 'train' ? 'trains' : 'details'}` +
          (rows.length > CAP ? ` &nbsp;·&nbsp; showing first ${CAP}` : '')
        : 'no match';

      const list = document.getElementById('list');
      if (!rows.length) {
        list.innerHTML = `<div class="empty">Nothing matches that.<br>Try a shorter number — the index is on the working number, so <b>P/</b> prefixes are stripped.</div>`;
        return;
      }

      list.innerHTML = shown.map(r => mode === 'train' ? trainRow(r) : detailRow(r)).join('');
      list.querySelectorAll('.row').forEach(el => {
        el.onclick = () => { sel = el.dataset.k; location.hash = (mode === 'train' ? 't=' : 'd=') + sel; paint(); };
      });
    }

    function trainRow(t) {
      const n = t.ds.length;
      const sub = t.mm
        ? `${t.f || '?'} → ${t.to || '?'}${t.dir ? ' · ' + t.dir : ''}`
        : 'not in train master';
      return `<div class="row ${sel === t.t ? 'on' : ''}" data-k="${esc(t.t)}">
        <div class="rn">${esc(t.disp || t.t)}</div>
        <div class="rm">${esc(sub)}</div>
        <div class="rc ${n > 1 ? 'multi' : ''}">${n}</div>
      </div>`;
    }

    function detailRow(d) {
      const legs = byDetail.get(d.did) || [];
      return `<div class="row ${sel === d.did ? 'on' : ''}" data-k="${esc(d.did)}">
        <div class="rn">${esc(d.num)}</div>
        <div class="rm">${esc(OFFNAME[d.off] || '—')} · ${esc(d.ln || '')} · ${esc(d.son || '')}–${esc(d.soff || '')}</div>
        <div class="rc">${legs.length}</div>
      </div>`;
    }

    /* ---------- main panel ---------- */
    function paint() {
      paintList();
      const main = document.getElementById('main');
      if (!sel) { main.innerHTML = placeholder(); return; }
      main.innerHTML = mode === 'train' ? trainPanel(sel) : detailPanel(sel);
      main.scrollTop = 0;
      main.querySelectorAll('.chead').forEach(h => {
        h.onclick = () => h.parentElement.classList.toggle('open');
      });
      main.querySelectorAll('[data-goto]').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          const [m, k] = el.dataset.goto.split(':');
          setMode(m);
          sel = k;
          location.hash = (m === 'train' ? 't=' : 'd=') + k;
          paint();
        };
      });
    }

    /* The placeholder used to quote hardcoded figures ("548 of the 1,861", and
       an example train with its details listed). Both drift the moment the book
       is revised, so they are computed. */
    const MULTI = TRAINS.filter(t => t.ds.length > 1).length;
    // A readable example: shared enough to make the point, short enough to list.
    // (The most-shared number is an empty-rake move worked by a dozen details —
    // true, but it reads as noise.)
    const EG = TRAINS.filter(t => t.mm && t.ds.length >= 3 && t.ds.length <= 4)
      .sort((a, b) => b.ds.length - a.ds.length)[0] || TRAINS[0];

    function placeholder() {
      const egDs = EG ? EG.ds.slice().sort((a, b) => (+a || 0) - (+b || 0)) : [];
      const egList = egDs.length > 1
        ? egDs.slice(0, -1).join(', ') + ' and ' + egDs[egDs.length - 1]
        : egDs.join('');
      return `<div class="ph">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6M11 8v6"/></svg>
        <h3>Search a train, or a detail</h3>
        <p><b>By Train</b> answers “who works this train?” — <b>${MULTI}</b> of the ${TRAINS.length.toLocaleString('en-IN')} working numbers are shared by more than one detail, so this is the lookup the detail book can't give you.</p>
        <p><b>By Detail</b> answers the other direction — every train that detail works, in sign-on order.</p>
        ${EG ? `<div class="hint">try <b>${esc(EG.disp || EG.t)}</b> — worked by ${esc(egList)}</div>` : ''}
      </div>`;
    }

    function trainPanel(k) {
      const t = trainOf.get(k);
      if (!t) return unknownTrain(k);
      const legs = (byTrain.get(k) || []).slice();
      // group legs by the detail that works them
      const groups = new Map();
      for (const l of legs) {
        if (!groups.has(l.did)) groups.set(l.did, []);
        groups.get(l.did).push(l);
      }
      const ordered = [...groups.entries()].sort((a, b) => (+TDET[a[0]].num || 0) - (+TDET[b[0]].num || 0));

      const tags = [];
      if (t.svc) tags.push(`<span class="pill ${t.svc}">${t.svc.replace('_', '-')}</span>`);
      else tags.push(`<span class="pill unm">not in train master</span>`);
      if (t.car) tags.push(`<span class="pill car">${t.car}-car</span>`);
      if (t.ac === 'AC') tags.push(`<span class="pill AC">AC</span>`);
      if (t.lg) tags.push(`<span class="pill lg">${t.lg.replace('_', '-')}</span>`);
      if (t.dir) tags.push(`<span class="pill dir">${t.dir}</span>`);

      const route = t.mm
        ? `<span>${esc(t.f || '?')}</span><span class="ar">→</span><span>${esc(t.to || '?')}</span>`
        : `<span class="un">No master route — this number isn't in suburban_train_master.</span>`;

      return `
      <div class="thead">
        <div class="crumbs">Crew Ops<span>/</span>Train Index<span>/</span><span class="cur">${esc(t.disp || t.t)}</span></div>
        <h3>${esc(t.disp || t.t)}</h3>
        <div class="route">${route}</div>
        <div class="tags">${tags.join('')}</div>
      </div>
      <div class="sect">
        <h4>Worked by <span class="n">${ordered.length}</span> detail${ordered.length === 1 ? '' : 's'}
          ${t.w ? `· ${t.w} working` : ''} ${t.p ? `· ${t.p} piloting` : ''}</h4>
        <div class="cards">
          ${ordered.map(([did, ls]) => bindingCard(did, ls, k)).join('')}
        </div>
      </div>`;
    }

    /* A hash can name a train that no longer exists — say a bookmark kept after
       a detail-book revision retired the number. Say so rather than throwing. */
    function unknownTrain(k) {
      return `<div class="ph">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6"/></svg>
        <h3>No train ${esc(k)}</h3>
        <p>Nothing in the current detail book works that number. If you followed a
        saved link, the book may have been revised since.</p>
      </div>`;
    }

    /* one card = one detail that works this train, with that detail's full leg run
       so you can see where this train sits inside the duty */
    function bindingCard(did, hits, hiTrain) {
      const d = TDET[did];
      const all = byDetail.get(did) || [];
      const hitIds = new Set(hits.map(h => h.t + '|' + h.st));

      return `<div class="card open">
        <div class="chead">
          <div class="dnum">${esc(d.num)}</div>
          <div class="dmeta">
            <div class="r1">
              <span class="pill lg">${esc(OFFNAME[d.off] || 'DEPT')}</span>
              ${d.dt ? `<span class="pill ${d.dt}">${d.dt}</span>` : ''}
              ${d.lk ? `<span class="pill ${d.lk}">${d.lk}</span>` : ''}
              <span class="pill car">${esc(d.ln || '')}</span>
            </div>
            <div class="r2">Signs on ${esc(d.sonp || '?')} ${esc(d.son || '')} · signs off ${esc(d.soffp || '?')} ${esc(d.soff || '')} · ${all.length} legs</div>
          </div>
          <div class="sig"><b data-goto="detail:${esc(did)}" style="cursor:pointer;color:var(--amber)">open detail →</b><span>${esc(did)}</span></div>
          <svg class="caret" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="legs">${all.map(l => legRow(l, hitIds.has(l.t + '|' + l.st))).join('')}</div>
      </div>`;
    }

    /* R/T = this detail gives relief to that one (at the start station);
       R/B = that one relieves this detail (at the end station). */
    function reliefTag(kind, num) {
      if (!num) return '';
      const did = didByNum[num];
      const label = (kind === 'rt' ? 'R/T ' : 'R/B ') + num;
      const go = did ? ` data-goto="detail:${esc(did)}"` : '';
      return `<span class="tag ${kind}"${go} title="${kind === 'rt' ? 'gives relief to' : 'relieved by'} detail ${esc(num)}">${esc(label)}</span>`;
    }

    function legRow(l, hit) {
      const t = trainOf.get(l.t);
      const svc = t && t.svc && t.svc !== 'SLOW' ? `<span class="tag ${t.svc}">${t.svc.replace('_', '-')}</span>` : '';
      return `<div class="leg ${hit ? 'hit' : ''}">
        <div class="rail"><div class="d"></div></div>
        <div class="lc"><div class="l1">
          <span class="tno" ${hit ? '' : `data-goto="train:${esc(l.t)}" style="cursor:pointer"`}>${esc(l.tn || l.t)}</span>
          ${l.ty !== 'working' ? `<span class="tag ${l.ty}">${l.ty}</span>` : ''}
          ${svc}
          <span class="path"><b>${esc(l.ss || '?')}</b> → <b>${esc(l.es || '?')}</b></span>
          ${reliefTag('rt', l.rt)}${reliefTag('rb', l.rb)}
          ${l.rmk ? `<span class="tag waiting">${esc(l.rmk)}</span>` : ''}
          <span class="tm">${esc(l.st || '')} – ${esc(l.et || '')}</span>
        </div></div>
      </div>`;
    }

    function detailPanel(did) {
      const d = TDET[did];
      if (!d) return unknownDetail(did);
      const legs = byDetail.get(did) || [];
      const work = legs.filter(l => l.ty === 'working').length;
      const pil = legs.filter(l => l.ty === 'piloting').length;
      // trains of this detail that are also worked elsewhere
      const shared = legs.filter(l => (trainOf.get(l.t)?.ds.length || 0) > 1).length;

      return `
      <div class="thead">
        <div class="crumbs">Crew Ops<span>/</span>Train Index<span>/</span>By Detail<span>/</span><span class="cur">${esc(d.num)}</span></div>
        <h3>Detail ${esc(d.num)}
          <span class="pill lg">${esc(OFFNAME[d.off] || 'DEPT')}</span>
          ${d.dt ? `<span class="pill ${d.dt}">${d.dt}</span>` : ''}
          ${d.lk ? `<span class="pill ${d.lk}">${d.lk}</span>` : ''}
        </h3>
        <div class="route">
          <span>${esc(d.sonp || '?')} ${esc(d.son || '')}</span><span class="ar">→</span><span>${esc(d.soffp || '?')} ${esc(d.soff || '')}</span>
          <span class="un">&nbsp;·&nbsp; ${esc(d.ln || '')} &nbsp;·&nbsp; ${esc(did)}</span>
        </div>
        <div class="tags">
          <span class="pill car">${legs.length} legs</span>
          <span class="pill SLOW">${work} working</span>
          ${pil ? `<span class="pill fix">${pil} piloting</span>` : ''}
          ${shared ? `<span class="pill dir">${shared} shared with other details</span>` : ''}
        </div>
      </div>
      <div class="sect">
        <h4>Trains worked <span class="n">${legs.length}</span></h4>
        <div class="cards"><div class="card open"><div class="legs">
          ${legs.map(l => legRow(l, false)).join('')}
        </div></div></div>
      </div>`;
    }

    function unknownDetail(did) {
      return `<div class="ph">
        <svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-4-2.5L12 21l-2-2.5L6 21 4 19z"/></svg>
        <h3>No detail ${esc(did)}</h3>
        <p>That detail is not in the current book.</p>
      </div>`;
    }

    /* ---------- wiring ---------- */
    function setMode(m) {
      if (mode === m) return;
      mode = m;
      document.getElementById('mT').classList.toggle('on', m === 'train');
      document.getElementById('mD').classList.toggle('on', m === 'detail');
      F.svc = F.lg = F.dir = F.off = ''; F.multi = false;
      document.getElementById('q').value = '';
      paintFilts();
    }

    document.getElementById('mT').onclick = () => { setMode('train'); sel = null; paint(); };
    document.getElementById('mD').onclick = () => { setMode('detail'); sel = null; paint(); };
    document.getElementById('q').oninput = () => paintList();

    function fromHash() {
      const h = location.hash.slice(1);
      const m = h.match(/^([td])=(.+)$/);
      if (!m) return false;
      setMode(m[1] === 't' ? 'train' : 'detail');
      sel = decodeURIComponent(m[2]);
      return true;
    }
    // Registered only now, after the data exists — the listener used to be able
    // to fire against undefined indexes while the page was still loading.
    addEventListener('hashchange', () => { if (fromHash()) paint(); });

    paintFilts();
    fromHash();
    paint();
  }

  SubShell.render('train-index', null);
  SubCrew.boot(render);
})();
