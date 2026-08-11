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
    const LEGS = D.legs;

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
    const blocked = DETAILS.filter(d => d.office);
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
        return{cols:[{k:'num',l:'Detail',dn:1},{k:'office',l:'Office'},{k:'type',l:'Type',pill:1},{k:'off',l:'Signs off',m:1},{k:'nx',l:'Next',m:1},{k:'non',l:'Next on',m:1},{k:'rest',l:'Rest',r:1,num:1,rest:1}],rows,
          sum:`<span>rolling turns <b>${rows.length}</b></span><span>min rest <b>${minOf(rows.map(r=>r.rest))}</b></span>`};}},

     {id:'night_duty',group:'Rest & Duty',name:'Night duty hours',desc:'Overlap of each duty with the 22:00–06:00 night window (NDH), cross-midnight aware.',filters:['office','link'],dsort:['ndh','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link))
        .map(d=>({num:+d.num,office:short(d.office),link:d.link,son:d.son+' '+d.sonp,soff:d.soff+' '+d.soffp,duty:d.duty,ndh:nightMins(d.son,d.soff)}));
        const tot=rows.reduce((a,r)=>a+r.ndh,0);
        return{cols:[{k:'num',l:'Detail',dn:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'son',l:'Sign on',m:1},{k:'soff',l:'Sign off',m:1},{k:'duty',l:'Duty',m:1,r:1},{k:'ndh',l:'Night hrs',r:1,num:1,ndhbar:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span><span>total NDH <b>${fmtHM(tot)}</b></span>`};}},

     {id:'double_rest',group:'Rest & Duty',name:'Double-detail rest',desc:'Rest between an evening sign-off and its next-morning sign-on — shortest first.',filters:['office'],dsort:['rest','asc'],
      build(f){const rows=blocked.filter(d=>d.type==='double'&&d.anchor===d.id&&d.next&&byId.get(d.next))
        .filter(d=>(!f.office||d.office===f.office))
        .map(d=>{const n=byId.get(d.next);const r=restBetween(toMin(d.soff),toMin(n.son));
          return{cyc:+d.num,ev:+d.num,off:d.soff,at:d.soffp,mor:+n.num,on:n.son,rest:r};});
        return{cols:[{k:'ev',l:'Evening',dn:1},{k:'off',l:'Off',m:1},{k:'at',l:'Rest at'},{k:'mor',l:'Morning',dn:1},{k:'on',l:'On',m:1},{k:'rest',l:'Double rest',r:1,num:1,rest:1,key:1}],rows,
          sum:`<span>double pairs <b>${rows.length}</b></span><span>min <b>${minOf(rows.map(r=>r.rest))}</b></span>`};}},

     {id:'duty_board',group:'Rest & Duty',name:'Duty · wheel · pilot',desc:'Every detail by duty hours, wheel movement and piloting — sort any column.',filters:['office','link','type'],dsort:['duty','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link)&&(!f.type||d.type===f.type))
        .map(d=>({num:+d.num,office:short(d.office),link:d.link,type:d.type,son:d.son,soff:d.soff,duty:toMin(d.duty),wm:toMin(d.wm),pil:toMin(d.pil)}));
        return{cols:[{k:'num',l:'Detail',dn:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'type',l:'Type',pill:1},{k:'son',l:'On',m:1},{k:'soff',l:'Off',m:1},{k:'duty',l:'Duty',r:1,num:1,hm:1},{k:'wm',l:'Wheel',r:1,num:1,hm:1},{k:'pil',l:'Pilot',r:1,num:1,hm:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span>`};}},

     {id:'service_list',group:'Trains & Service',name:'Fast / Semi / Slow',desc:'Working services classified by the train master — filter by service type.',filters:['service','office'],dsort:['dep','asc'],
      build(f){const rows=LEGS.filter(l=>l.ty==='working'&&l.svc&&(!f.service||l.svc===f.service))
        .map(l=>({tn:l.tn,svc:l.svc,car:l.car==='15_CAR'?'15':'12',ac:l.ac==='AC'?'AC':'',fromto:l.ss+' → '+l.es,dep:toMin(l.st),det:(byId.get(l.did)||{}).num,office:short((byId.get(l.did)||{}).office)}));
        const fa=rows.filter(r=>r.svc==='FAST').length,se=rows.filter(r=>r.svc==='SEMI_FAST').length;
        return{cols:[{k:'tn',l:'Train',m:1},{k:'svc',l:'Service',pill:1},{k:'fromto',l:'Section',m:1},{k:'dep',l:'Dep',r:1,num:1,hm:1},{k:'car',l:'Car',c:1,m:1},{k:'ac',l:'AC',c:1},{k:'det',l:'Detail',dn:1,r:1},{k:'office',l:'Office'}],rows,
          sum:`<span>legs <b>${rows.length}</b></span><span style="color:var(--fast)">fast ${fa}</span><span style="color:var(--semi)">semi ${se}</span>`};}},

     {id:'car15',group:'Trains & Service',name:'15-car & AC services',desc:'The premium 15-car and AC services, and which crews work them.',filters:['office'],dsort:['dep','asc'],
      build(f){const rows=LEGS.filter(l=>l.ty==='working'&&(l.car==='15_CAR'||l.ac==='AC'))
        .filter(l=>(!f.office||short((byId.get(l.did)||{}).office)===short(f.office)))
        .map(l=>({tn:l.tn,svc:l.svc,car:l.car==='15_CAR'?'15-CAR':'12',ac:l.ac==='AC'?'AC':'',fromto:l.ss+' → '+l.es,dep:toMin(l.st),det:(byId.get(l.did)||{}).num,office:short((byId.get(l.did)||{}).office)}));
        return{cols:[{k:'tn',l:'Train',m:1},{k:'svc',l:'Service',pill:1},{k:'car',l:'Car',c:1,m:1},{k:'ac',l:'AC',c:1,pill:1},{k:'fromto',l:'Section',m:1},{k:'dep',l:'Dep',r:1,num:1,hm:1},{k:'det',l:'Detail',dn:1,r:1}],rows,
          sum:`<span>premium legs <b>${rows.length}</b></span>`};}},

     {id:'service_mix',group:'Trains & Service',name:'Service mix per detail',desc:'Count of fast / semi / slow working legs each detail works.',filters:['office','link'],dsort:['fast','desc'],
      build(f){const rows=blocked.filter(d=>(!f.office||d.office===f.office)&&(!f.link||d.link===f.link)).map(d=>{
        const legs=LEGS.filter(l=>l.did===d.id&&l.ty==='working');
        const c=s=>legs.filter(l=>l.svc===s).length;
        return{num:+d.num,office:short(d.office),link:d.link,fast:c('FAST'),semi:c('SEMI_FAST'),slow:c('SLOW'),total:legs.length};}).filter(r=>r.total);
        return{cols:[{k:'num',l:'Detail',dn:1},{k:'office',l:'Office'},{k:'link',l:'Link',pill:1},{k:'fast',l:'Fast',r:1,num:1},{k:'semi',l:'Semi',r:1,num:1},{k:'slow',l:'Slow',r:1,num:1},{k:'total',l:'Legs',r:1,num:1}],rows,
          sum:`<span>details <b>${rows.length}</b></span>`};}},

     {id:'terminal',group:'Terminals',name:'Terminal-wise trains',desc:'All trains starting from or ending at a terminal, with their detail.',filters:['terminal'],dsort:['time','asc'],
      build(f){const term=f.terminal||'VDLR';const rows=[];
        LEGS.forEach(l=>{if(l.ss===term)rows.push({tn:l.tn,dir:'FROM',other:l.es,time:toMin(l.st),svc:l.svc||'',ty:l.ty,det:(byId.get(l.did)||{}).num});
          if(l.es===term)rows.push({tn:l.tn,dir:'TO',other:l.ss,time:toMin(l.et),svc:l.svc||'',ty:l.ty,det:(byId.get(l.did)||{}).num});});
        return{cols:[{k:'tn',l:'Train',m:1},{k:'dir',l:'Dir',dir:1},{k:'other',l:'Other end',m:1},{k:'time',l:'Time',r:1,num:1,hm:1},{k:'svc',l:'Service',pill:1},{k:'det',l:'Detail',dn:1,r:1}],rows,
          sum:`<span>@ <b>${term}</b></span><span>movements <b>${rows.length}</b></span>`};}},
    ];

    const FILTER_OPTS={
      office:[['','All offices'],['CSMT-SUB','CSMT'],['KYN-SUB','KYN'],['PNVL-SUB','PNVL']],
      link:[['','All links'],['continuous','Continuous'],['fix','Fix'],['memu','MEMU']],
      type:[['','All types'],['single','Single'],['double','Double'],['triple','Triple']],
      service:[['','All services'],['FAST','Fast'],['SEMI_FAST','Semi-fast'],['SLOW','Slow']],
      terminal:[...new Set(LEGS.flatMap(l=>[l.ss,l.es]).filter(Boolean))].sort().map(s=>[s,s]),
    };
    const FL_LABEL={office:'Office',link:'Link',type:'Type',service:'Service',terminal:'Terminal'};

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
      let h=cur.filters.map(fk=>{
        if(fk==='terminal'&&!filters.terminal)filters.terminal='VDLR';
        const opts=FILTER_OPTS[fk].map(([v,l])=>`<option value="${v}" ${filters[fk]===v?'selected':''}>${l}</option>`).join('');
        return `<div class="fl"><label>${FL_LABEL[fk]}</label><select data-fk="${fk}">${opts}</select></div>`;
      }).join('');
      h+=`<div class="spacer"></div><div class="sum" id="sum"></div>
         <div class="exp" id="exp"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>Export CSV</div>`;
      ctl.innerHTML=h;
      ctl.querySelectorAll('select').forEach(s=>s.onchange=()=>{filters[s.dataset.fk]=s.value;render();});
      document.getElementById('exp').onclick=exportCSV;
    }
    let CURRENT={cols:[],rows:[]};
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
      document.getElementById('tbody').innerHTML=out.rows.map(r=>'<tr>'+out.cols.map(c=>
        `<td class="${c.r?'r':c.c?'c':''}">${fmtCell(c,r[c.k])}</td>`).join('')+'</tr>').join('');
      document.getElementById('sum').innerHTML=out.sum||'';
    }
    function exportCSV(){
      const{cols,rows}=CURRENT;
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

    render();
  }

  SubShell.render('reports', null);
  SubCrew.boot(render);
})();
