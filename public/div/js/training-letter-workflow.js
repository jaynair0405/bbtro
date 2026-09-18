'use strict';
(() => {
  const API='/api/division/training-letter-workflow',$=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state={config:null,letterId:null,revision:null,nominees:[],locked:false,historical:false,results:[]};
  const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const query=()=>{const p=new URLSearchParams(location.search);return p.toString()?'?'+p:''};
  async function api(path,options={}){const join=path.includes('?')?'&':'?';const res=await fetch(API+path+(query()?join+query().slice(1):''),{...options,headers:{'Content-Type':'application/json',...options.headers}});const data=await res.json();if(!res.ok)throw new Error(data.error||'Request failed');return data;}
  function toast(message,error=false){$('toast').textContent=message;$('toast').className='toast show'+(error?' error':'');setTimeout(()=>$('toast').className='toast',3500)}
  function course(){return state.config?.courses.find(c=>String(c.rule_id)===$('course').value)}
  function sourceOptions(){const values=state.config.origin==='centre'?['staff','cli','manual_tm']:['staff','cli'];$('source').innerHTML=values.map(v=>`<option value="${v}">${v==='manual_tm'?'Train Manager':v==='cli'?'CLI':'Staff'}</option>`).join('')}
  function render(){const c=course(),office=state.config.offices.find(o=>o.code===state.config.office_code)||{};
    $('scope').textContent=(state.config.origin==='centre'?'Centre: '+state.config.centre.center_name:'Lobby: '+(office.label||state.config.office_code));
    $('office-head').innerHTML=esc((office.officeHeader||state.config.office_code).replace('\n','\n')).replace('\n','<br>');$('print-number').textContent=$('number').value||'—';$('print-date').textContent=$('letter-date').value||'—';$('print-requirements').textContent=$('requirements').value;
    $('print-subject').textContent=c?c.course_name.toUpperCase()+' AT MTC CLA':'—';$('name-heading').textContent=c?.course_code?.startsWith('TM_')?'Train Manager Name':c?.course_code==='CLI_CONVERSION'?'CLI Name':c?.course_code?.startsWith('LPS_')?'Loco Pilot Name':'Motorman Name';
    $('print-body').textContent=c?`The following trainees from ${office.label||state.config.office_code} are directed to attend ${c.course_name} at Motormen Training Centre, CLA ${c.working_days===1?'on':'from'} ${$('training-date').value||'—'} at ${String(c.report_time).slice(0,5)} Hrs.`:'—';
    $('signature').textContent=[office.signingDesignation,office.signingDesignationHindi,office.signingPlace].filter(Boolean).join('\n');$('cc').textContent=office.ccText||'';$('count').textContent=state.nominees.length;
    $('nominees').innerHTML=state.nominees.length?state.nominees.map((n,i)=>`<div class="row"><div><strong>${esc(n.name)}</strong><div class="meta">CMS: ${esc(n.cms_id||'—')} · PF: ${esc(n.pf_number||'—')} · HRMS: ${esc(n.hrms_id||'—')}</div>${n.warning?`<div class="warning">${esc(n.warning)}</div>`:''}${n.decision?`<span class="status ${esc(n.decision)}">${esc(n.decision)}</span>`:''}</div><button class="btn danger" data-remove="${i}" ${state.historical||(state.locked&&n.decision!=='returned')?'disabled':''}>Remove</button></div>`).join(''):'<p class="empty">No nominees added.</p>';
    $('print-trainees').innerHTML=state.nominees.length?state.nominees.map((n,i)=>{const h=n.history?.[0]||{};return `<tr><td>${i+1}</td><td>${esc(n.name)}<br><small>CMS: ${esc(n.cms_id||'—')} · HRMS: ${esc(n.hrms_id||'—')}</small></td><td>${esc(n.pf_number||'—')}</td><td>${esc(h.last_training_date||'Not recorded')}</td><td>${esc(h.due_date||'Not recorded')}</td></tr>`}).join(''):'<tr><td colspan="5">No nominees added</td></tr>';
    $('lock-note').textContent=state.historical?'Historical version is read only.':state.locked?'Accepted letter wording, course and dates are locked. Only returned nominee places may be corrected.':'';$('course').disabled=state.locked||state.historical;['number','letter-date','training-date','requirements'].forEach(id=>$(id).disabled=state.locked||state.historical);$('save-letter').disabled=state.historical||(state.nominees.length>0&&state.nominees.every(n=>n.decision==='accepted'));$('version-info').textContent=state.revision?'Current workflow revision '+state.revision:'';
  }
  async function init(){try{state.config=await api('/config');$('course').innerHTML=state.config.courses.map(c=>`<option value="${c.rule_id}">${esc(c.course_name)}</option>`).join('');sourceOptions();const preferred=state.config.courses.find(c=>c.course_code==='AUTOMATIC');if(preferred)$('course').value=String(preferred.rule_id);newLetter();const id=new URLSearchParams(location.search).get('letter_id');if(id)await loadLetter(id)}catch(e){toast(e.message,true)}}
  function newLetter(){state.letterId=null;state.revision=null;state.nominees=[];state.locked=false;state.historical=false;$('number').value=state.config.suggested_number;$('letter-date').value=today();$('training-date').value=today();$('requirements').value=course()?.requirements_text||'';$('history-section').hidden=true;render()}
  let searchSeq=0,searchTimer=null,activeIndex=-1;
  function renderResults(){
    const data=state.results;
    if(!data.length){$('results').innerHTML=$('search').value.trim().length>=2?'<p class="empty">No matching trainees.</p>':($('search').value.trim()?'<p class="empty">Keep typing \u2014 at least two characters.</p>':'');return}
    $('results').innerHTML=data.map((p,i)=>`<div class="row${i===activeIndex?' active':''}"><div><strong>${esc(p.name)}</strong><div class="meta">${esc(p.cms_id||'\u2014')} \u00b7 ${esc(p.lobby||'\u2014')} \u00b7 PF ${esc(p.pf_number||'\u2014')}</div>${p.warning?`<div class="warning">${esc(p.warning)}</div>`:''}</div><button class="btn outline" data-add="${i}">Add</button></div>`).join('');
    const row=$('results').querySelector('.row.active');
    if(row)row.scrollIntoView({block:'nearest'});
  }
  async function search(){
    const q=$('search').value.trim(),seq=++searchSeq;
    if(q.length<2){state.results=[];activeIndex=-1;renderResults();return}
    try{
      const data=(await api('/lookup?'+new URLSearchParams({q,source:$('source').value,rule_id:$('course').value}))).data;
      if(seq!==searchSeq)return;
      state.results=data;activeIndex=data.length?0:-1;renderResults();
    }catch(e){if(seq===searchSeq)toast(e.message,true)}
  }
  const searchSoon=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,250)};
  function clearSearch(){state.results=[];activeIndex=-1;$('search').value='';renderResults()}
  async function refreshNominees(){
    if(!state.nominees.length)return;
    try{
      const data=(await api('/refresh',{method:'POST',body:JSON.stringify({rule_id:Number($('course').value),trainees:state.nominees.map(n=>({source:n.source,source_id:n.source_id}))})})).data;
      state.nominees=state.nominees.map((n,i)=>data[i]?{...n,...data[i]}:n);
      render();
    }catch(e){toast(e.message,true)}
  }
  function add(index){const p=state.results[index];if(!p)return false;const key=p.source+':'+p.source_id;if(state.nominees.some(n=>(n.source+':'+n.source_id)===key)){toast('Already selected',true);return false}state.nominees.push(p);render();return true}
  function addAndContinue(index){if(add(index))clearSearch();$('search').focus()}
  async function save(){const button=$('save-letter');button.disabled=true;try{const data=await api('/',{method:'POST',body:JSON.stringify({letter_id:state.letterId,revision:state.revision,rule_id:Number($('course').value),letter_no:$('number').value,letter_date:$('letter-date').value,training_date:$('training-date').value,requirements_text:$('requirements').value,trainees:state.nominees.map(n=>({source:n.source,source_id:n.source_id}))})});state.letterId=data.letter.id;state.revision=data.letter.revision;state.nominees=data.nominees.map(n=>({...n.identity_snapshot,decision:n.decision,nominee_id:n.nominee_id}));state.locked=state.nominees.some(n=>n.decision==='accepted');state.historical=false;render();toast('Letter submitted and version saved')}catch(e){toast(e.message,true)}finally{render()}}
  async function loadLetter(id,version){try{const data=await api('/'+id+(version?'?version='+version:''));const snap=data.snapshot;state.letterId=data.letter.id;state.revision=data.letter.revision;state.historical=!!version;state.locked=data.nominees.some(n=>n.decision==='accepted');$('course').value=String(snap.header.rule_id);$('number').value=snap.header.letter_no;$('letter-date').value=snap.header.letter_date;$('training-date').value=snap.header.training_date;$('requirements').value=snap.header.requirements_text||'';state.nominees=version?snap.trainees.map(n=>({...n,decision:'version snapshot'})):data.nominees.filter(n=>n.decision!=='withdrawn').map(n=>({...n.identity_snapshot,decision:n.decision,nominee_id:n.nominee_id}));$('history-section').hidden=false;$('history').innerHTML=data.versions.map(v=>`<div class="row"><div><strong>Version ${v.version_no}</strong><div class="meta">${esc(v.submitted_at)} · ${esc(v.submitted_by)}</div></div><button class="btn outline" data-version="${v.version_no}">View</button></div>`).join('');render();if(version)$('version-info').textContent='Historical version '+version+' · read only'}catch(e){toast(e.message,true)}}
  async function history(){try{const data=(await api('/')).data;$('history-section').hidden=false;$('history').innerHTML=data.length?data.map(l=>`<div class="row"><div><strong>${esc(l.letter_no)}</strong><div class="meta">${esc(l.training_date)} · ${esc(l.workflow_status)} · ${esc(l.names||'')}</div></div><button class="btn outline" data-letter="${l.id}">Open</button></div>`).join(''):'<p class="empty">No letters.</p>'}catch(e){toast(e.message,true)}}
  $('new-letter').addEventListener('click',newLetter);$('history-button').addEventListener('click',history);$('search').addEventListener('input',searchSoon);$('source').addEventListener('change',search);$('search').addEventListener('keydown',e=>{
    if(e.key==='Escape'){clearSearch();return}
    if(!state.results.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();activeIndex=Math.min(activeIndex+1,state.results.length-1);renderResults()}
    else if(e.key==='ArrowUp'){e.preventDefault();activeIndex=Math.max(activeIndex-1,0);renderResults()}
    else if(e.key==='Enter'){e.preventDefault();if(activeIndex>=0)addAndContinue(activeIndex)}
  });$('save-letter').addEventListener('click',save);['course','number','letter-date','training-date','requirements'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='course'){if(!state.letterId)$('requirements').value=course()?.requirements_text||'';refreshNominees();if(state.results.length)search()}render()}));
  $('results').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addAndContinue(Number(b.dataset.add))});$('nominees').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){state.nominees.splice(Number(b.dataset.remove),1);render()}});$('history').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.letter)loadLetter(b.dataset.letter);if(b?.dataset.version)loadLetter(state.letterId,b.dataset.version)});init();
})();
