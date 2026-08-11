/**
 * Suburban Crew Ops — Detail Book.
 *
 * Duty cycles by office → link block, drawn as connected chains with the rest
 * between consecutive leaves computed live. Clicking a leaf opens that detail's
 * train legs.
 *
 * The block list comes from `detail_blocks` via the dataset — the mockup carried
 * a hand-maintained copy of the twelve ranges, which is exactly the kind of
 * thing that drifts the day someone renumbers a link.
 *
 * Deep link: #c<cycle anchor number>, e.g. #c201.
 */
(function () {
  'use strict';

  const LINE_C = SubDerive.LINE_C;
  // The mockup derived this by string-replacing "var(--cont)" into "rgba(cont,.14)",
  // which is not a colour, so the chip had no background at all.
  const LINK_BG = {
    continuous: 'rgba(79,209,165,.14)',
    fix: 'rgba(185,140,255,.14)',
    memu: 'rgba(87,182,255,.14)',
  };
  const OFFN = SubDerive.OFFN;
  const esc = SubDerive.esc;
  const fmtRest = SubDerive.fmtHM;

  function render(D) {
    SubShell.setCounts(D.counts);

    const CYCLES = D.details;
    const blocks = D.blocks;

    // legs per detail, in the order the SQL returned them (detail, start time)
    const legsBy = new Map();
    for (const l of D.legs) {
      if (!legsBy.has(l.did)) legsBy.set(l.did, []);
      legsBy.get(l.did).push(l);
    }
    const byId = new Map(CYCLES.map(d => [d.id, d]));

    // Rest between the sign-off of one detail and the sign-on of the next.
    const restBetween = (a, b) => {
      let d = (SubDerive.toMin(b.son) - SubDerive.toMin(a.soff) + 1440) % 1440;
      if (d === 0) d = 1440;
      return d;
    };

    // A detail belongs to the block it was RESOLVED to when the dataset was
    // built, not to whatever range happens to match now.
    const inBlock = (d, b) => d.blk === b.id;

    let active = blocks.find(b => b.n > 0 && b.label === 'CSMT Harbour Continuous')
      || blocks.find(b => b.n > 0) || blocks[0];

    function buildNav() {
      const nav = document.getElementById('nav');
      nav.innerHTML = '';
      const offices = [...new Set(blocks.map(b => b.office))];
      offices.forEach(o => {
        const sec = document.createElement('div');
        sec.className = 'office';
        sec.innerHTML = `<div class="oname"><span class="dot"></span>${esc(OFFN[o] || o)} Suburban</div>`;
        blocks.filter(b => b.office === o).forEach(b => {
          const has = b.n > 0;
          const el = document.createElement('div');
          el.className = 'link' + (b === active ? ' on' : '') + (has ? '' : ' off');
          el.style.opacity = has ? 1 : .4;
          el.innerHTML = `<span class="tick" style="background:${LINE_C[b.link]}"></span>
            <span class="lt"><b>${esc(b.label.replace((OFFN[o] || o) + ' ', ''))}</b>
            <span>${esc(b.line)} · ${b.sn}–${b.en}</span></span>
            <span class="cnt">${b.n || '–'}</span>`;
          if (has) el.onclick = () => { active = b; render2(); };
          sec.appendChild(el);
        });
        nav.appendChild(sec);
      });
    }

    function cyclesFor(b) {
      const ds = CYCLES.filter(d => inBlock(d, b)).sort((x, y) => +x.num - +y.num);
      const groups = new Map(), order = [];
      ds.forEach(d => {
        const key = d.anchor || d.id;
        if (!groups.has(key)) { groups.set(key, []); order.push(key); }
        groups.get(key).push(d);
      });
      return order.map(k => groups.get(k));
    }

    function leafHTML(d) {
      const role = d.type === 'double' ? (d.anchor === d.id ? 'EVENING' : 'MORNING')
        : d.type === 'triple' ? 'NIGHT' : 'SHIFT';
      return `<div class="leaf" data-id="${esc(d.id)}">
        <div class="leaf-top"><span class="dnum">${esc(d.num)}</span><span class="role">${role}</span></div>
        <div class="route">
          <div class="tchip"><span class="t">${esc(d.son)}</span><span class="p">${esc(d.sonp)}</span></div>
          <div class="arrow"></div>
          <div class="tchip"><span class="t">${esc(d.soff)}</span><span class="p">${esc(d.soffp)}</span></div>
        </div>
        <div class="meta">
          <div><b>${esc(d.duty)}</b><span>Duty</span></div>
          <div><b>${esc(d.wm)}</b><span>Wheel</span></div>
          <div><b>${esc(d.pil)}</b><span>Pilot</span></div>
        </div></div>`;
    }

    function toggle(id, el) {
      const wasOpen = el.classList.contains('open');
      el.closest('.chain').querySelectorAll('.leaf').forEach(l => l.classList.remove('open'));
      const draw = el.closest('.cyc').querySelector('.legdraw');
      if (wasOpen) { draw.innerHTML = ''; return; }
      el.classList.add('open');
      const legs = legsBy.get(id) || [];
      const d = byId.get(id);
      if (!legs.length) {
        draw.innerHTML = `<div class="legwrap"><h4><span class="d">${esc(d.num)}</span> no train legs recorded for this detail</h4></div>`;
        return;
      }
      draw.innerHTML = `<div class="legwrap"><h4><span class="d">${esc(d.num)}</span> ${esc(d.son)} ${esc(d.sonp)} → ${esc(d.soff)} ${esc(d.soffp)}</h4>
        ${legs.map(l => `<div class="leg">
           <div class="tn ${l.ty === 'piloting' ? 'pilot' : ''}">${esc(l.tn)}<span class="tag2 ${l.ty === 'piloting' ? 'p' : 'w'}">${l.ty === 'piloting' ? 'PIL' : 'WKG'}</span></div>
           <div class="seg"><span class="st">${esc(l.st)}</span><span class="stn">${esc(l.ss)}</span>
             <span class="bar ${l.ty === 'piloting' ? 'pilot' : ''}"></span>
             <span class="stn">${esc(l.es)}</span><span class="st" style="text-align:right">${esc(l.et)}</span></div>
           <div class="rem">${esc(SubDerive.bookRemarks(l))}</div></div>`).join('')}
        </div>`;
    }

    function render2() {
      buildNav();
      const cys = cyclesFor(active);
      const flat = CYCLES.filter(d => inBlock(d, active));
      const nS = cys.filter(g => g[0].type === 'single').length;
      const nD = cys.filter(g => g[0].type === 'double').length;
      const nT = cys.filter(g => g.some(x => x.type === 'triple')).length;
      document.getElementById('top').innerHTML = `
        <div class="crumbs">${esc(OFFN[active.office] || active.office)}<span class="sep">/</span>${esc(active.line)}<span class="sep">/</span><span class="cur">${esc(active.link.toUpperCase())}</span></div>
        <h2>${esc(active.label)}<span class="lk" style="background:${LINK_BG[active.link]};color:${LINE_C[active.link]}">${esc(active.link)}</span></h2>
        <div class="stats">
          <div class="stat"><b>${flat.length}</b><span>Details</span></div>
          <div class="stat s"><b>${nS}</b><span>Single</span></div>
          <div class="stat d"><b>${nD}</b><span>Double</span></div>
          <div class="stat t"><b>${nT}</b><span>Triple</span></div>
        </div>`;
      const grid = document.getElementById('grid');
      if (!cys.length) { grid.innerHTML = '<div class="empty"><b>No details in this block</b>Pick a link with a count.</div>'; return; }
      grid.innerHTML = cys.map((g, gi) => {
        const type = g.some(x => x.type === 'triple') ? 'triple' : g[0].type;
        const anchor = g[0];
        const span = `${esc(anchor.son)} <span class="a">${esc(anchor.sonp)}</span> → ${esc(g[g.length - 1].soff)} <span class="a">${esc(g[g.length - 1].soffp)}</span>`;
        let chain = '';
        g.forEach((d, i) => {
          chain += leafHTML(d);
          if (i < g.length - 1) {
            const r = restBetween(d, g[i + 1]);
            const isKey = d.type === 'double' && d.anchor === d.id;   // the double-detail rest
            const warn = r < 300 || r > 16 * 60;
            chain += `<div class="rest ${isKey ? 'rest-key' : ''} ${warn && !isKey ? 'warn' : ''}">
              <div class="wire"></div><div class="node"><span class="rv">${fmtRest(r)}</span><span class="rl">${isKey ? 'DBL REST' : 'rest'}</span></div></div>`;
          }
        });
        return `<div class="cyc" data-cyc="c${esc(anchor.num)}" style="animation-delay:${gi * 55}ms">
          <div class="cyc-head">
            <span class="ctag ${type}"><span class="g"></span>${type} · ${g.length}</span>
            <span class="anchor">cycle ${esc(anchor.num)}</span>
            <span class="spacer"></span>
            <span class="span">${span}</span>
          </div>
          <div class="chain">${chain}</div>
          <div class="legdraw"></div>
        </div>`;
      }).join('');
      if (location.hash) {
        const el = document.querySelector('[data-cyc="' + CSS.escape(location.hash.slice(1)) + '"]');
        if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
      }
    }

    // Delegated, so leaf ids never have to survive a round-trip through an
    // inline onclick attribute.
    document.getElementById('grid').addEventListener('click', (e) => {
      const leaf = e.target.closest('.leaf');
      if (leaf) toggle(leaf.dataset.id, leaf);
    });

    // A pasted #c<num> should jump even in an already-open tab.
    addEventListener('hashchange', () => {
      const el = document.querySelector('[data-cyc="' + CSS.escape(location.hash.slice(1)) + '"]');
      if (el) el.scrollIntoView({ block: 'start' });
    });

    render2();
  }

  SubShell.render('detail-book', null);
  SubCrew.boot(render);
})();
