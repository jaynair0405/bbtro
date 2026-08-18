/**
 * Suburban Crew Ops — Reports.
 *
 * Eight reports over the detail book and train master, all computed in the
 * browser from the shared dataset: filters and sorting stay instant because the
 * whole corpus is already here, and adding a report is a single entry in
 * REPORTS with no backend work at all.
 */
(function () {
  'use strict';

  function render(D) {
    const DETAILS = D.details;
    let LEGS = D.legs;

    SubShell.setCounts(D.counts);

    const OFF = SubDerive.OFFN;
    const toMin = SubDerive.toMin;
    const fmtHM = SubDerive.fmtHM;
    // Rolling links work the next detail the NEXT day, so rest = 24h + (nextOn - thisOff).
    // (Evening->morning doubles fall out short ~5-6h; single->single turnarounds ~24h.)
    const restBetween = (off, son) => 1440 + son - off;
    function nightMins(son, soff) {
      let a = toMin(son), b = toMin(soff);
      if (a == null || b == null) return 0;
      if (b <= a) b += 1440;
      let s = 0;
      for (const k of [-1, 0, 1]) {
        const ws = 1320 + k * 1440, we = 1800 + k * 1440;
        s += Math.max(0, Math.min(b, we) - Math.max(a, ws));
      }
      return s;
    }
    const byId = new Map(DETAILS.map(d => [d.id, d]));

    // MEMU is separate stock worked by a separate crew pool, so it is OUT by
    // default and the "Include MEMU" box brings it back. Applied centrally
    // here rather than in each report: render() reassigns `blocked` and `LEGS`
    // before calling build(), and every report closes over these bindings.
    const ALL_BLOCKED = DETAILS.filter(d => d.office);
    const ALL_LEGS = LEGS;
    let blocked = ALL_BLOCKED;
    const short = o => OFF[o] || o || '—';
    // Math.min of nothing is Infinity, which renders as "Infinity:NaN".
    const minOf = xs => (xs.length ? fmtHM(Math.min(...xs)) : '–');

    // ---- report definitions ----
    const REPORTS = [
     {id:'inter_rest',group:'Rest & Duty',name:'Inter-detail rest',desc:'Home rest between consecutive details in a rolling (continuous) link — computed live.',filters:['office','link'],dsort:['rest','asc'],
      build(f){const rows=blocked.filter(d=>d.link==='continuous'&&d.next&&byId.get(d.next))
        .filter(d=>(!f.office||d.office===f.office))
        .map(d=>{const n=byId.get(d.next);const r=restBetween(toMin(d.soff),toMin(n.son));
          return{num:+d.num,office:short(d.office),type:d.type,off:d.soff+' '+d.soffp,nx:+n.num,non:n.son+' '+n.sonp,rest:r};});
        return{cols:[{k:'num',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'type',l:'Type',pill:1},{k:'off',l:'Signs off',m:1},{k:'nx',l:'Next',m:1,num:1},{k:'non',l:'Next on',m:1},{k:'rest',l:'Rest',r:1,num:1,rest:1}],rows,
          sum:`<span>rolling turns <b>${rows.length}</b></span><span>min rest <b>${minOf(rows.map(r=>r.rest))}</b></span>`};}},

     {id:'night_duty',group:'Rest & Duty',name:'Night duty hours',desc:'Overlap of each duty with the 22:00–06:00 night window (NDH), cross-midnight aware.',filters:['office','link'],dsort:['ndh','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link))
        .map(d=>({num:+d.num,office:short(d.office),link:d.link,son:d.son+' '+d.sonp,soff:d.soff+' '+d.soffp,duty:d.duty,ndh:nightMins(d.son,d.soff)}));
        const tot=rows.reduce((a,r)=>a+r.ndh,0);
        return{cols:[{k:'num',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'son',l:'Sign on',m:1},{k:'soff',l:'Sign off',m:1},{k:'duty',l:'Duty',m:1,r:1},{k:'ndh',l:'Night hrs',r:1,num:1,ndhbar:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span><span>total NDH <b>${fmtHM(tot)}</b></span>`};}},

     {id:'double_rest',group:'Rest & Duty',name:'Double-detail rest',desc:'Rest between an evening sign-off and its next-morning sign-on — shortest first.',filters:['office'],dsort:['rest','asc'],
      build(f){const rows=blocked.filter(d=>d.type==='double'&&d.anchor===d.id&&d.next&&byId.get(d.next))
        .filter(d=>(!f.office||d.office===f.office))
        .map(d=>{const n=byId.get(d.next);const r=restBetween(toMin(d.soff),toMin(n.son));
          return{cyc:+d.num,ev:+d.num,off:d.soff,at:d.soffp,mor:+n.num,on:n.son,rest:r};});
        return{cols:[{k:'ev',l:'Evening',dn:1,num:1},{k:'off',l:'Off',m:1},{k:'at',l:'Rest at'},{k:'mor',l:'Morning',dn:1,num:1},{k:'on',l:'On',m:1},{k:'rest',l:'Double rest',r:1,num:1,rest:1,key:1}],rows,
          sum:`<span>double pairs <b>${rows.length}</b></span><span>min <b>${minOf(rows.map(r=>r.rest))}</b></span>`};}},

     {id:'duty_board',group:'Rest & Duty',name:'Duty · wheel · pilot',desc:'Every detail by duty hours, wheel movement and piloting — sort any column.',filters:['office','link','type'],dsort:['duty','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link)&&(!f.type||d.type===f.type))
        .map(d=>({num:+d.num,office:short(d.office),link:d.link,type:d.type,son:d.son,soff:d.soff,duty:toMin(d.duty),wm:toMin(d.wm),pil:toMin(d.pil)}));
        return{cols:[{k:'num',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'type',l:'Type',pill:1},{k:'son',l:'On',m:1},{k:'soff',l:'Off',m:1},{k:'duty',l:'Duty',r:1,num:1,hm:1},{k:'wm',l:'Wheel',r:1,num:1,hm:1},{k:'pil',l:'Pilot',r:1,num:1,hm:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span>`};}},

     {id:'service_list',group:'Trains & Service',name:'Fast / Semi / Slow',desc:'Working services classified by the train master — filter by service type.',filters:['service','office'],dsort:['dep','asc'],
      build(f){const rows=LEGS.filter(l=>l.ty==='working'&&l.svc&&(!f.service||l.svc===f.service))
        .map(l=>({tn:l.tn,svc:l.svc,car:l.car==='15_CAR'?'15':'12',ac:l.ac==='AC'?'AC':'',fromto:l.ss+' → '+l.es,dep:toMin(l.st),det:(byId.get(l.did)||{}).num,office:short((byId.get(l.did)||{}).office)}));
        const fa=rows.filter(r=>r.svc==='FAST').length,se=rows.filter(r=>r.svc==='SEMI_FAST').length;
        return{cols:[{k:'tn',l:'Train',m:1},{k:'svc',l:'Service',pill:1},{k:'fromto',l:'Section',m:1},{k:'dep',l:'Dep',r:1,num:1,hm:1},{k:'car',l:'Car',c:1,m:1},{k:'ac',l:'AC',c:1},{k:'det',l:'Detail',dn:1,num:1,r:1},{k:'office',l:'Office'}],rows,
          sum:`<span>legs <b>${rows.length}</b></span><span style="color:var(--fast)">fast ${fa}</span><span style="color:var(--semi)">semi ${se}</span>`};}},

     {id:'car15',group:'Trains & Service',name:'15-car & AC services',desc:'The premium 15-car and AC services, and which crews work them.',filters:['office'],dsort:['dep','asc'],
      build(f){const rows=LEGS.filter(l=>l.ty==='working'&&(l.car==='15_CAR'||l.ac==='AC'))
        .filter(l=>(!f.office||short((byId.get(l.did)||{}).office)===short(f.office)))
        .map(l=>({tn:l.tn,svc:l.svc,car:l.car==='15_CAR'?'15-CAR':'12',ac:l.ac==='AC'?'AC':'',fromto:l.ss+' → '+l.es,dep:toMin(l.st),det:(byId.get(l.did)||{}).num,office:short((byId.get(l.did)||{}).office)}));
        return{cols:[{k:'tn',l:'Train',m:1},{k:'svc',l:'Service',pill:1},{k:'car',l:'Car',c:1,m:1},{k:'ac',l:'AC',c:1,pill:1},{k:'fromto',l:'Section',m:1},{k:'dep',l:'Dep',r:1,num:1,hm:1},{k:'det',l:'Detail',dn:1,num:1,r:1}],rows,
          sum:`<span>premium legs <b>${rows.length}</b></span>`};}},

     {id:'service_mix',group:'Trains & Service',name:'Service mix per detail',desc:'Count of fast / semi / slow working legs each detail works.',filters:['office','link'],dsort:['fast','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link)).map(d=>{
        const legs=LEGS.filter(l=>l.did===d.id&&l.ty==='working');
        const c=s=>legs.filter(l=>l.svc===s).length;
        return{num:+d.num,office:short(d.office),link:d.link,fast:c('FAST'),semi:c('SEMI_FAST'),slow:c('SLOW'),total:legs.length};}).filter(r=>r.total);
        return{cols:[{k:'num',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'fast',l:'Fast',r:1,num:1},{k:'semi',l:'Semi',r:1,num:1},{k:'slow',l:'Slow',r:1,num:1},{k:'total',l:'Legs',r:1,num:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span>`};}},

     {id:'terminal',group:'Terminals',name:'Terminal-wise trains',desc:'All trains starting from or ending at a terminal, with their detail.',filters:['terminal'],dsort:['time','asc'],
      build(f){const term=f.terminal||'VDLR';const rows=[];
        LEGS.forEach(l=>{if(l.ss===term)rows.push({tn:l.tn,dir:'FROM',other:l.es,time:toMin(l.st),svc:l.svc||'',ty:l.ty,det:(byId.get(l.did)||{}).num});
          if(l.es===term)rows.push({tn:l.tn,dir:'TO',other:l.ss,time:toMin(l.et),svc:l.svc||'',ty:l.ty,det:(byId.get(l.did)||{}).num});});
        return{cols:[{k:'tn',l:'Train',m:1},{k:'dir',l:'Dir',dir:1},{k:'other',l:'Other end',m:1},{k:'time',l:'Time',r:1,num:1,hm:1},{k:'svc',l:'Service',pill:1},{k:'det',l:'Detail',dn:1,num:1,r:1}],rows,
          sum:`<span>@ <b>${term}</b></span><span>movements <b>${rows.length}</b></span>`};}},

     // Where a detail's piloting sits. A piloting leg is the crew travelling as
     // passengers — right after sign-on to reach the train they work, or right
     // before sign-off to get home. LEGS arrives in DUTY order (minutes since
     // sign-on), so first/last are simply the ends of the run; do NOT re-sort by
     // clock time or the 133 cross-midnight duties read backwards.
     {id:'pilot_position',group:'Crew Movement',name:'Piloting position',desc:'Details that begin or end with the crew travelling as passengers — and where they are dropped off or picked up.',filters:['office','position','pilotTo','link'],dsort:['num','asc'],
      build(f){
        const first={},last={};
        for(const l of LEGS){ if(!first[l.did])first[l.did]=l; last[l.did]=l; }
        const rows=blocked
          .filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link))
          .map(d=>{
            const a=first[d.id],z=last[d.id];
            if(!a||!z)return null;
            const atStart=a.ty==='piloting', atEnd=z.ty==='piloting';
            if(!atStart&&!atEnd)return null;
            // A detail with ONE leg has first === last, so testing both ends
            // would report it as "both" and print the same leg twice. Detail
            // 134 is the only case in the book — its sole leg is piloting and
            // it works no train at all. Decide which end it belongs to by
            // proximity: 134's leg ends 15 min before sign-off but starts
            // 4h17 after sign-on, so it is a ride home.
            let pos;
            if(a===z){
              const gapStart=Math.abs((toMin(a.st)-toMin(d.son)+1440)%1440);
              const gapEnd  =Math.abs((toMin(d.soff)-toMin(a.et)+1440)%1440);
              pos = gapEnd<=gapStart ? 'end' : 'start';
            } else {
              pos = atStart&&atEnd ? 'both' : atStart ? 'start' : 'end';
            }
            const showOut = pos==='start'||pos==='both';
            const showIn  = pos==='end'  ||pos==='both';
            return{num:+d.num,office:short(d.office),link:d.link,pos,
                   son:d.son+' '+d.sonp,
                   outTn:showOut?a.tn:'',outTo:showOut?a.es:'',
                   inTn:showIn?z.tn:'',inFrom:showIn?z.ss:'',
                   soff:d.soff+' '+d.soffp,
                   pil:toMin(d.pil)};
          }).filter(Boolean)
          // "After sign-on" means the FIRST leg is piloting, which includes
          // details that also pilot at the end — matching the summary line and
          // the original query. Exact matching on pos would hide those 72 and
          // make the filter disagree with its own total.
          .filter(r=>!f.position || r.pos===f.position
                     || (f.position==='start' && r.pos==='both')
                     || (f.position==='end'   && r.pos==='both'))
          // station matches EITHER end of the piloting — where the crew is
          // dropped off on the way out, or picked up on the way back
          .filter(r=>!f.pilotTo || r.outTo===f.pilotTo || r.inFrom===f.pilotTo);
        const nS=rows.filter(r=>r.pos!=='end').length, nE=rows.filter(r=>r.pos!=='start').length;
        return{cols:[{k:'num',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},
                     {k:'pos',l:'Piloting at',pill:1},{k:'son',l:'Signs on',m:1},
                     {k:'outTn',l:'Rides out on',m:1},{k:'outTo',l:'To',m:1},
                     {k:'inTn',l:'Rides back on',m:1},{k:'inFrom',l:'From',m:1},
                     {k:'soff',l:'Signs off',m:1},{k:'pil',l:'Pilot time',r:1,num:1,hm:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span><span>after sign-on <b>${nS}</b></span><span>before sign-off <b>${nE}</b></span>`};}},

     // The relief backfill worklist.
     //
     // A reciprocal is only owed when the TRAIN CONTINUES — crew A hands the
     // same train to crew B, who works it onward, and both pages record it.
     // That happens at VDLR on the PLGN/GNPL services and occasionally at KYN.
     //
     // It is NOT owed at a terminal. At PNVL, TNA, CSMT, GMN the rake reverses:
     // the arriving crew walks off and the next crew — already there off another
     // train — takes charge at the OTHER END and works it out under a new
     // number. The two crews never meet, so the marker records where the rake
     // goes, not a relief, and the far side has no reason to print anything.
     // 58 of the original 75 "gaps" were this, which made the report 92% noise.
     // Some relinks do carry both sides (774 T 45 / 36 T 72 at TNA) — allowed,
     // not required.
     {id:'relief_gaps',group:'Crew Movement',name:'Relief gaps',desc:'Relief markers that genuinely lack their reciprocal — the train continues but the other detail records nothing. Terminal rake relinks are excluded; they are one-sided by nature.',filters:['office','reliefKind'],dsort:['det','asc'],
      build(f){
        const byNum=new Map(ALL_BLOCKED.map(d=>[String(d.num),d]));
        const legsBy={}; for(const l of ALL_LEGS){ (legsBy[l.did]=legsBy[l.did]||[]).push(l); }
        const N=t=>String(t||'').toUpperCase().replace(/\s|^P\//g,'');
        const rows=[]; let relink=0;
        for(const l of LEGS){
          const d=byId.get(l.did); if(!d||!d.office) continue;
          if(f.office&&d.office!==f.office) continue;
          for(const kind of ['rt','rb']){
            const names=l[kind]; if(!names) continue;
            const other=byNum.get(String(names));
            const want=kind==='rt'?'rb':'rt';
            if(other&&(legsBy[other.id]||[]).some(x=>x[want]===String(d.num))) continue;
            // R/T applies at the leg's START, R/B at its END — that is where
            // and when the other crew must be
            const stn=kind==='rt'?l.ss:l.es, at=kind==='rt'?l.st:l.et;
            let best=null;
            if(other) for(const x of (legsBy[other.id]||[])){
              if(x.ty!=='working') continue;
              if(kind==='rt'? x.es!==stn : x.ss!==stn) continue;
              // Direction matters: for R/T the counterpart ARRIVED before we
              // take over, for R/B it DEPARTS after we hand over. Wrapping the
              // difference the wrong way turns 11 minutes into 1429.
              const g=kind==='rt' ? ((toMin(at)-toMin(x.et)+1440)%1440)
                                  : ((toMin(x.st)-toMin(at)+1440)%1440);
              if(g<=30&&(!best||g<best.g)) best={x,g};
            }
            if(best&&N(best.x.tn)!==N(l.tn)){ relink++; continue; }   // rake relink, not relief
            rows.push({det:+d.num,office:short(d.office),tn:l.tn,
                       mark:kind==='rt'?'R/T':'R/B',names:+names,
                       stn,at:toMin(at),
                       needs:(kind==='rt'?'R/B ':'R/T ')+d.num,
                       on:best?best.x.tn:'',gap:best?best.g:null,
                       kindOf:best?'continues':'unresolved'});
          }
        }
        const out=rows.filter(r=>!f.reliefKind||r.mark===f.reliefKind);
        const nC=out.filter(r=>r.kindOf==='continues').length;
        return{cols:[{k:'det',l:'Detail',dn:1,num:1},{k:'office',l:'Office'},{k:'tn',l:'On train',m:1},
                     {k:'mark',l:'Marker',pill:1},{k:'names',l:'Names',dn:1,num:1},
                     {k:'stn',l:'Relief at',m:1},{k:'at',l:'Time',r:1,num:1,hm:1},
                     {k:'needs',l:'Counterpart needs',m:1},
                     {k:'on',l:'On its leg',m:1},{k:'gap',l:'Gap',r:1,num:1},
                     {k:'kindOf',l:'Status',pill:1}],rows:out,
          sum:`<span>real gaps <b>${out.length}</b></span><span>train continues <b>${nC}</b></span>`+
              `<span>unresolved <b>${out.length-nC}</b></span><span>rake relinks excluded <b>${relink}</b></span>`};}},

     // The rake's onward path at a terminal — see RAKE_LINKS above. These are
     // NOT relief gaps: the crews never meet, so neither owes the other a
     // reciprocal marker.
     {id:'rake_links',group:'Terminals',name:'Rake links',desc:'Where a rake goes when it terminates — which detail brings it in, which takes it out, and under what number.',filters:['office','linkTerm'],dsort:['inAt','asc'],
      build(f){
        const rows=RAKE_LINKS()
          .filter(r=>!f.office||r.office===f.office)
          .filter(r=>!f.linkTerm||r.stn===f.linkTerm)
          .filter(r=>filters.memu||r.link!=='memu')
          .map(r=>({stn:r.stn,inD:r.inD,inT:r.inT,inAt:toMin(r.inAt),
                    outD:r.outD,outT:r.outT,outAt:toMin(r.outAt),g:r.g}));
        const terms=new Set(rows.map(r=>r.stn));
        const avg=rows.length?Math.round(rows.reduce((a,r)=>a+r.g,0)/rows.length):0;
        return{cols:[{k:'stn',l:'Terminal',m:1},
                     {k:'inD',l:'In by',dn:1,num:1},{k:'inT',l:'As',m:1},{k:'inAt',l:'Arr',r:1,num:1,hm:1},
                     {k:'outD',l:'Out by',dn:1,num:1},{k:'outT',l:'As',m:1},{k:'outAt',l:'Dep',r:1,num:1,hm:1},
                     {k:'g',l:'Turnaround',r:1,num:1}],rows,
          sum:`<span>links <b>${rows.length}</b></span><span>terminals <b>${terms.size}</b></span>`+
              `<span>avg turnaround <b>${avg}m</b></span>`};}},
    ];

    // ------------------------------------------------------------------
    // Marker-backed rake links.
    //
    // At a terminal the rake reverses: the arriving crew walks off and the
    // next crew — already there off another train — takes charge at the OTHER
    // END and works it out under a NEW number. The relief marker is the only
    // record in the book of where that rake goes; nothing else in the system
    // captures it.
    //
    // Both crews may mark it (one R/B, one R/T) so the same physical link can
    // surface twice — collapsed on terminal + the two detail/train pairs.
    // Same train number = mid-journey relief, not a relink, and is excluded.
    // ------------------------------------------------------------------
    let _links=null;
    const RAKE_LINKS=()=>{
      if(_links) return _links;
      const byNum=new Map(ALL_BLOCKED.map(d=>[String(d.num),d]));
      const legsBy={}; for(const l of ALL_LEGS){ (legsBy[l.did]=legsBy[l.did]||[]).push(l); }
      const N=t=>String(t||'').toUpperCase().replace(/\s|^P\//g,'');
      const out=new Map();
      for(const l of ALL_LEGS){
        const d=byId.get(l.did); if(!d||!d.office) continue;
        for(const kind of ['rt','rb']){
          const names=l[kind]; if(!names) continue;
          const other=byNum.get(String(names)); if(!other) continue;
          const stn=kind==='rt'?l.ss:l.es, at=kind==='rt'?l.st:l.et;
          let best=null;
          for(const x of (legsBy[other.id]||[])){
            if(x.ty!=='working') continue;
            if(kind==='rt'? x.es!==stn : x.ss!==stn) continue;
            const g=kind==='rt' ? ((toMin(at)-toMin(x.et)+1440)%1440)
                                : ((toMin(x.st)-toMin(at)+1440)%1440);
            if(g<=30&&(!best||g<best.g)) best={x,g};
          }
          if(!best||N(best.x.tn)===N(l.tn)) continue;
          const r = kind==='rb'
            ? {stn,inD:+d.num,inT:l.tn,inAt:l.et,outD:+names,outT:best.x.tn,outAt:best.x.st,
               g:best.g,office:d.office,link:d.link}
            : {stn,inD:+names,inT:best.x.tn,inAt:best.x.et,outD:+d.num,outT:l.tn,outAt:l.st,
               g:best.g,office:other.office,link:other.link};
          out.set([r.stn,r.inD,r.inT,r.outD,r.outT].join('|'), r);
        }
      }
      return (_links=[...out.values()]);
    };

    const FILTER_OPTS={
      office:[['','All offices'],['CSMT-SUB','CSMT'],['KYN-SUB','KYN'],['PNVL-SUB','PNVL']],
      link:[['','All links'],['continuous','Continuous'],['fix','Fix'],['memu','MEMU']],
      type:[['','All types'],['single','Single'],['double','Double'],['triple','Triple']],
      service:[['','All services'],['FAST','Fast'],['SEMI_FAST','Semi-fast'],['SLOW','Slow']],
      terminal:[...new Set(LEGS.flatMap(l=>[l.ss,l.es]).filter(Boolean))].sort().map(s=>[s,s]),
      position:[['','Either end'],['start','After sign-on'],['end','Before sign-off'],['both','Both ends only']],
      reliefKind:[['','R/T and R/B'],['R/T','R/T only'],['R/B','R/B only']],
      // A function, not a list: the stations offered must be the ones crews are
      // actually piloted TO or FROM in the CURRENT view, so picking an office
      // narrows the dropdown with it. A fixed list of all 30 stations offered
      // choices that return nothing.
      // Only terminals that actually carry a marker-backed rake link — eight of
      // them, against thirty-odd stations in the full list.
      linkTerm:(f)=>{
        const seen=new Map();
        for(const r of RAKE_LINKS()) if(!f.office||r.office===f.office)
          seen.set(r.stn,(seen.get(r.stn)||0)+1);
        return [['','All terminals']].concat(
          [...seen.entries()].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0]))
            .map(([st,n])=>[st,st+' ('+n+')']));
      },
      pilotTo:(f)=>{
        const first={},last={};
        for(const l of LEGS){ if(!first[l.did])first[l.did]=l; last[l.did]=l; }
        const seen=new Map();          // station -> count, for the label
        blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link))
          .forEach(d=>{
            const a=first[d.id],z=last[d.id];
            if(a&&a.ty==='piloting'&&a.es) seen.set(a.es,(seen.get(a.es)||0)+1);
            if(z&&z.ty==='piloting'&&z.ss) seen.set(z.ss,(seen.get(z.ss)||0)+1);
          });
        return [['','Any station']].concat(
          [...seen.entries()].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0]))
            .map(([st,n])=>[st,st+' ('+n+')']));
      },
    };
    const FL_LABEL={office:'Office',link:'Link',type:'Type',service:'Service',terminal:'Terminal',position:'Piloting at',pilotTo:'Station',reliefKind:'Marker',linkTerm:'Terminal',memu:'MEMU'};
    // filters rendered as a checkbox rather than a <select>
    const CHECKBOX_FILTERS = new Set(['memu']);

    let cur=REPORTS[0], filters={}, sortKey=null, sortDir='asc';
    {const hr=location.hash.slice(1);const r=hr&&REPORTS.find(x=>x.id===hr);if(r)cur=r;}

    function buildPicker(){
      const groups=[...new Set(REPORTS.map(r=>r.group))];
      document.getElementById('picker').innerHTML=groups.map(g=>
        `<div class="pgroup">${g}</div>`+REPORTS.filter(r=>r.group===g).map(r=>
          `<div class="rep ${r===cur?'on':''}" data-id="${r.id}"><b>${r.name}</b><span>${r.desc}</span></div>`).join('')).join('');
      document.querySelectorAll('.rep').forEach(el=>el.onclick=()=>{
        cur=REPORTS.find(r=>r.id===el.dataset.id);filters={};sortKey=null;
        location.hash=cur.id;      // the picked report is now linkable
        render();});
    }
    function renderControls(){
      const ctl=document.getElementById('ctl');
      // every report gets the MEMU box; it is a property of the data, not of
      // any one report
      let h=cur.filters.concat(['memu']).map(fk=>{
        if(CHECKBOX_FILTERS.has(fk))
          return `<div class="chk ${filters[fk]?'on':''}" data-fk="${fk}">Include MEMU</div>`;
        if(fk==='terminal'&&!filters.terminal)filters.terminal='VDLR';
        const src=FILTER_OPTS[fk];
        const list=typeof src==='function'?src(filters):src;
        // if narrowing the office removed the chosen station, clear it rather
        // than leaving a selection that returns nothing
        if(filters[fk]&&!list.some(([v])=>v===filters[fk])) filters[fk]='';
        const opts=list.map(([v,l])=>`<option value="${v}" ${filters[fk]===v?'selected':''}>${l}</option>`).join('');
        return `<div class="fl"><label>${FL_LABEL[fk]}</label><select data-fk="${fk}">${opts}</select></div>`;
      }).join('');
      h+=`<div class="fl"><label>Find</label><input class="q" id="rowq" autocomplete="off"
             spellcheck="false" placeholder="detail, train, station…"
             value="${(filters.__q||'').replace(/"/g,'&quot;')}"></div>`;
      h+=`<div class="spacer"></div><div class="sum" id="sum"></div>
         <div class="exp" id="exp"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>Export CSV</div>`;
      ctl.innerHTML=h;
      ctl.querySelectorAll('select').forEach(s=>s.onchange=()=>{filters[s.dataset.fk]=s.value;render();});
      ctl.querySelectorAll('.chk[data-fk]').forEach(c=>c.onclick=()=>{
        filters[c.dataset.fk]=!filters[c.dataset.fk]; render();});
      const q=document.getElementById('rowq');
      if(q) q.oninput=()=>{ filters.__q=q.value; paintRows();
        // keep focus and caret while typing — render() would rebuild the input
        const el=document.getElementById('rowq'); if(el&&el!==document.activeElement) el.focus(); };
      document.getElementById('exp').onclick=exportCSV;
    }
    let CURRENT={cols:[],rows:[]}, VISIBLE=[];
    function fmtCell(c,v){
      if(v==null||v==='')return'<span style="color:var(--ink3)">–</span>';
      if(c.dn)return`<span class="dn">${v}</span>`;
      if(c.pill)return`<span class="pill ${v}">${String(v).replace('_',' ')}</span>`;
      if(c.dir)return`<span class="dir ${v}">${v}</span>`;
      if(c.rest){const cls=c.key?'key':(v<300||v>16*60?'warn':'');return`<span class="restcell ${cls}">${fmtHM(v)}</span>`;}
      if(c.hm)return`<span class="m">${fmtHM(v)}</span>`;
      if(c.ndhbar){const w=Math.min(100,v/480*100);return`<span class="nd"><span class="bar" style="width:${w}%"></span><span class="m">${fmtHM(v)}</span></span>`;}
      if(c.m)return`<span class="m">${v}</span>`;
      return v;
    }
    function render(){
      // scope the data before any report runs
      const memuOn = !!filters.memu;
      blocked = memuOn ? ALL_BLOCKED : ALL_BLOCKED.filter(d=>d.link!=='memu');
      LEGS    = memuOn ? ALL_LEGS    : ALL_LEGS.filter(l=>{
        const d=byId.get(l.did); return !d || d.link!=='memu'; });
      buildPicker();renderControls();
      document.getElementById('rt').textContent=cur.name;
      document.getElementById('rd').textContent=cur.desc;
      const out=cur.build(filters);CURRENT=out;
      if(!sortKey){sortKey=cur.dsort[0];sortDir=cur.dsort[1];}
      const col=out.cols.find(c=>c.k===sortKey)||out.cols[0];
      out.rows.sort((a,b)=>{let x=a[col.k],y=b[col.k];if(col.num){x=+x||0;y=+y||0;}else{x=String(x||'');y=String(y||'');}
        return (x<y?-1:x>y?1:0)*(sortDir==='asc'?1:-1);});
      document.getElementById('thead').innerHTML='<tr>'+out.cols.map(c=>
        `<th class="${c.r?'r':c.c?'c':''} ${c.k===sortKey?'sorted':''}" data-k="${c.k}">${c.l}<span class="ar">${sortDir==='asc'?'▲':'▼'}</span></th>`).join('')+'</tr>';
      document.querySelectorAll('thead th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;
        if(sortKey===k)sortDir=sortDir==='asc'?'desc':'asc';else{sortKey=k;sortDir='asc';}render();});
      paintRows();
    }

    // Rows only — so typing in Find does not rebuild the controls and steal
    // focus mid-keystroke. Matches against every displayed cell, which is why
    // one box serves "detail 116", "PL 128" and "VDLR" alike.
    function paintRows(){
      const {cols,rows}=CURRENT;
      const q=(filters.__q||'').trim().toUpperCase();
      const shown=!q?rows:rows.filter(r=>cols.some(c=>{
        const v=r[c.k];
        if(v==null||v==='')return false;
        const txt=(c.hm||c.rest||c.ndhbar)&&typeof v==='number'?fmtHM(v):String(v);
        return txt.toUpperCase().includes(q);
      }));
      VISIBLE=shown;
      document.getElementById('tbody').innerHTML=shown.map(r=>'<tr>'+cols.map(c=>
        `<td class="${c.r?'r':c.c?'c':''}">${fmtCell(c,r[c.k])}</td>`).join('')+'</tr>').join('')
        || `<tr><td colspan="${cols.length}" style="text-align:center;color:var(--ink3);padding:34px">Nothing matches “${SubDerive.esc(filters.__q||'')}”.</td></tr>`;
      document.getElementById('sum').innerHTML=(CURRENT.sum||'')
        + (q?`<span style="color:var(--amber)">showing <b>${shown.length}</b> of ${rows.length}</span>`:'');
    }
    function exportCSV(){
      // export what is on screen, search included — otherwise a filtered view
      // silently exports rows the user cannot see
      const cols=CURRENT.cols, rows=VISIBLE;
      const head=cols.map(c=>c.l).join(',');
      const body=rows.map(r=>cols.map(c=>{let v=r[c.k];if((c.hm||c.rest||c.ndhbar)&&typeof v==='number')v=fmtHM(v);return `"${String(v==null?'':v).replace(/"/g,'""')}"`;}).join(',')).join('\n');
      const blob=new Blob([head+'\n'+body],{type:'text/csv'});const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);a.download=cur.id+'.csv';a.click();
    }

    // a pasted #report_id should switch reports, not just work on first load
    addEventListener('hashchange',()=>{
      const r=REPORTS.find(x=>x.id===location.hash.slice(1));
      if(r&&r!==cur){cur=r;filters={};sortKey=null;render();}
    });

    // exposed so the parity check can drive every report headlessly
    window.__reports={REPORTS,build:(id,f)=>REPORTS.find(r=>r.id===id).build(f||{}),
      csv:()=>{const{cols,rows}=CURRENT;return cols.map(c=>c.l).join(',')+'\n'+
        rows.map(r=>cols.map(c=>{let v=r[c.k];if((c.hm||c.rest||c.ndhbar)&&typeof v==='number')v=fmtHM(v);
          return `"${String(v==null?'':v).replace(/"/g,'""')}"`;}).join(',')).join('\n');}};

    // Collapse the report list to give the table the full width. The choice
    // sticks, because someone reading a wide report wants it to stay wide when
    // they switch reports.
    (function pickerCollapse(){
      const app=document.querySelector('.app'), btn=document.getElementById('pickerToggle');
      if(!app||!btn)return;
      const KEY='subReportsPickerHidden';
      const apply=h=>{ app.classList.toggle('picker-hidden',h);
        btn.innerHTML=h?'&#8594;':'&#8592;';
        btn.title=h?'Show the report list':'Hide the report list'; };
      apply(localStorage.getItem(KEY)==='1');
      btn.onclick=()=>{ const h=!app.classList.contains('picker-hidden');
        localStorage.setItem(KEY,h?'1':'0'); apply(h); };
    })();

    render();
  }

  SubShell.render('reports', null);
  SubCrew.boot(render);
})();
