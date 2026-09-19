'use strict';
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const person=a=>a.identity_snapshot?.name||'Trainee';
  async function request(path,options={}){const r=await fetch(apiUrl('/operations'+path),{headers:{'Content-Type':'application/json'},...options});const d=await r.json();if(!r.ok)throw Error(d.error+(d.expected_completion?' Expected: '+d.expected_completion:''));return d;}
  const notify=(m,t='success')=>typeof showToast==='function'?showToast(m,t):alert(m);

  window.loadCalendar=async function(){const box=document.getElementById('tab-calendar');if(!box)return;box.innerHTML=`<div class="card"><div class="card-header"><h3>Refresher batch planning</h3></div><div class="card-body"><p class="trg-help">Capacity and lobby seats guide nominations. Suggested allocations remain flexible.</p><form id="ops-plan" class="form-row"><div class="form-group trg-grow"><label>Course</label><select name="rule_id" required></select></div><div class="form-group"><label>Batch code</label><input name="batch_code" maxlength="20" required></div><div class="form-group"><label>Start date</label><input name="from_date" type="date" required></div><div class="form-group"><label>Capacity</label><input name="capacity" type="number" min="1"></div><div class="form-group trg-grow"><label>Lobby suggestions</label><input name="allocations" placeholder="CSMT-SUB:12, KYN-SUB:10"></div><button class="btn btn-primary" type="submit">Plan batch</button></form><div id="ops-plans" class="trg-scroll"></div></div></div>`;try{const [courses,plans]=await Promise.all([fetch(apiUrl('/manage/courses')).then(r=>r.json()),request('/plans')]);const sel=box.querySelector('[name=rule_id]');courses.data.filter(c=>c.advance_planning).forEach(c=>sel.add(new Option(c.course_name,c.rule_id)));renderPlans(plans.data);box.querySelector('#ops-plan').onsubmit=savePlan;}catch(e){box.querySelector('#ops-plans').textContent=e.message;}}
  function renderPlans(rows){const box=document.getElementById('ops-plans');box.innerHTML=rows.length?`<table><thead><tr><th>Batch</th><th>Course</th><th>Dates</th><th>Capacity</th><th>Suggested lobby seats</th><th>Status</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.batch_code)}</td><td>${esc(x.course_name)}</td><td>${esc(x.from_date)} to ${esc(x.expected_end_date)}</td><td>${esc(x.capacity||'Open')}</td><td>${x.allocations.map(a=>esc(a.lobby)+': '+a.suggested_seats).join('<br>')||'None'}</td><td>${esc(x.status)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty-state"><p>No refresher batches planned.</p></div>';}
  async function savePlan(e){e.preventDefault();const f=new FormData(e.currentTarget);try{const allocations=String(f.get('allocations')||'').split(',').filter(Boolean).map(x=>{const [lobby,seats]=x.split(':');return{lobby:lobby.trim(),suggested_seats:Number(seats)}});await request('/plans',{method:'POST',body:JSON.stringify({rule_id:Number(f.get('rule_id')),batch_code:f.get('batch_code'),from_date:f.get('from_date'),capacity:f.get('capacity')?Number(f.get('capacity')):null,allocations})});notify('Batch plan saved');loadCalendar();}catch(e){notify(e.message,'error')}}

  window.loadAttendanceLetters=async function(){const box=document.getElementById('attendance-list');try{const [candidates,attempts,plans]=await Promise.all([request('/candidates'),request('/attempts'),request('/plans')]);const fresh=candidates.data.filter(x=>!x.attempt_id);box.innerHTML=`<div class="card"><div class="card-body"><h4>Accepted trainees awaiting joining</h4>${fresh.length?fresh.map(x=>`<form class="ops-start completion-row" data-id="${x.nominee_id}"><span><strong>${esc(x.identity_snapshot.name)}</strong><br><small>${esc(x.letter_no)} · ${esc(x.course_name)}</small></span><input name="joining_date" type="date" value="${esc(x.training_date)}" required><select name="calendar_id"><option value="">No planned batch</option>${plans.data.filter(p=>p.rule_id===x.rule_id).map(p=>`<option value="${p.id}">${esc(p.batch_code)}</option>`).join('')}</select><button class="btn btn-primary btn-sm">Start</button></form>`).join(''):'<p class="trg-help">No accepted trainees awaiting joining.</p>'}<h4>Attendance in progress</h4><form class="ops-bulk completion-row"><span><strong>Mark the whole day</strong><br><small>Everyone joined and still in progress. Already-marked trainees are left alone.</small></span><input name="attendance_date" type="date" required><select name="status"><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select><button class="btn btn-primary btn-sm">Mark all</button></form>${attempts.data.filter(a=>a.outcome==='in_progress').map(attendanceCard).join('')||'<p class="trg-help">No active attempts.</p>'}</div></div>`;box.querySelectorAll('.ops-start').forEach(f=>f.onsubmit=startAttempt);box.querySelectorAll('.ops-att').forEach(f=>f.onsubmit=markAttendance);const bulk=box.querySelector('.ops-bulk');if(bulk)bulk.onsubmit=markWholeDay;}catch(e){box.innerHTML='<div class="card-body">'+esc(e.message)+'</div>';}}
  function attendanceCard(a){return `<form class="ops-att completion-row" data-id="${a.attempt_id}"><span><strong>${esc(person(a))}</strong><br><small>${esc(a.course_name)} · joined ${esc(a.joining_date)} · ${a.attendance.length} day(s) marked</small></span><input name="attendance_date" type="date" required><select name="status"><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select><input name="reason" placeholder="Reason (only when changing)"><button class="btn btn-primary btn-sm">Save</button></form>`;}
  async function startAttempt(e){e.preventDefault();const f=new FormData(e.currentTarget);try{await request('/attempts',{method:'POST',body:JSON.stringify({nominee_id:Number(e.currentTarget.dataset.id),joining_date:f.get('joining_date'),calendar_id:f.get('calendar_id')?Number(f.get('calendar_id')):null})});notify('Training attempt started');loadAttendanceLetters();}catch(e){notify(e.message,'error')}}
  async function markWholeDay(e){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    try{
      const r=await request('/attendance/bulk',{method:'POST',body:JSON.stringify(Object.fromEntries(f))});
      notify((r.joined?r.joined+' joined, ':'')+r.marked+' marked '+r.status+(r.skipped?', '+r.skipped+' already marked and left unchanged':''));
      loadAttendanceLetters();
    }catch(e){notify(e.message,'error')}
  }
  async function markAttendance(e){e.preventDefault();const f=new FormData(e.currentTarget);try{await request(`/attempts/${e.currentTarget.dataset.id}/attendance`,{method:'POST',body:JSON.stringify(Object.fromEntries(f))});notify('Attendance saved');loadAttendanceLetters();}catch(e){notify(e.message,'error')}}

  let completionFilter={day:null,course_id:null,course_name:''};
  window.loadCompletionLetters=async function(){
    const box=document.getElementById('completion-table-body');
    document.getElementById('completion-panel-area').innerHTML='';
    try{
      const f=completionFilter;
      const q=new URLSearchParams(f.day?{state:'all',day:f.day,course_id:f.course_id}:{state:'open'});
      const [days,attempts]=await Promise.all([request('/attempts/days'),request('/attempts?'+q)]);
      const strip=days.data.length
        ? days.data.map(d=>{
            const on=f.day===d.day&&String(f.course_id)===String(d.course_id);
            const count=Number(d.open_count)>0?d.open_count+' open':d.done_count+' done';
            return `<button class="btn btn-outline btn-sm ops-day${on?' active':''}" data-day="${esc(d.day)}" data-course="${esc(d.course_id)}" data-name="${esc(d.course_name)}">${esc(d.day)} \u00b7 ${esc(d.course_name)} \u00b7 ${esc(count)}</button>`;
          }).join(' ')
        : '<p class="trg-help">No course days yet.</p>';
      const header=f.day
        ? `<p class="trg-help">${esc(f.course_name)} on ${esc(f.day)} \u2014 completed trainees shown too. <button class="btn btn-outline btn-sm ops-day-clear">Back to open work</button></p>`
        : '<p class="trg-help">Trainees still awaiting a completion decision. Pick a day above to see a finished batch.</p>';
      const bulk=f.day
        ? `<form class="ops-complete-all completion-row"><span><strong>Mark the day attended</strong><br><small>${esc(f.course_name)} on ${esc(f.day)} \u2014 completes everyone whose attendance is in order.</small></span><input type="hidden" name="completion_date" value="${esc(f.day)}"><button class="btn btn-primary btn-sm">Mark all attended</button></form>`
        : '';
      box.innerHTML='<div class="card-body"><div class="ops-days">'+strip+'</div>'+header+bulk
        +(attempts.data.map(completionCard).join('')||'<p class="trg-help">Nothing awaiting a decision.</p>')+'</div>';
      box.querySelectorAll('.ops-result').forEach(x=>x.onsubmit=saveResult);
      box.querySelectorAll('.ops-complete').forEach(x=>x.onsubmit=complete);
      box.querySelectorAll('.ops-correct').forEach(x=>x.onsubmit=correct);
      box.querySelectorAll('.ops-outcome').forEach(x=>x.onsubmit=outcome);
      const all=box.querySelector('.ops-complete-all');if(all)all.onsubmit=completeWholeDay;
      box.querySelectorAll('.ops-day').forEach(b=>b.onclick=()=>{completionFilter={day:b.dataset.day,course_id:b.dataset.course,course_name:b.dataset.name};loadCompletionLetters()});
      const clear=box.querySelector('.ops-day-clear');if(clear)clear.onclick=()=>{completionFilter={day:null,course_id:null,course_name:''};loadCompletionLetters()};
    }catch(e){box.innerHTML='<div class="card-body">'+esc(e.message)+'</div>';}}
  function completionCard(a){const defs=[...new Map(a.assessments.map(x=>[x.assessment_id,x])).values()];return `<section class="card" style="margin:12px"><div class="card-header"><h4>${esc(person(a))} · ${esc(a.course_name)}</h4><span class="status">${esc(a.outcome)}</span></div><div class="card-body"><p class="trg-help">Letter ${esc(a.letter_no)} · joined ${esc(a.joining_date)}</p>${a.outcome==='in_progress'?defs.map(d=>`<form class="ops-result form-row" data-id="${a.attempt_id}"><input type="hidden" name="assessment_id" value="${d.assessment_id}"><strong>${esc(d.assessment_name)}</strong><input name="exam_date" type="date" required><input name="marks" type="number" step="0.01" max="${d.maximum_marks}" placeholder="Marks / ${d.maximum_marks}" required><input name="reason" value="Assessment result" required><button class="btn btn-outline btn-sm">Record / re-exam</button><small>${a.assessments.filter(x=>x.assessment_id===d.assessment_id&&x.result).map(x=>'Exam '+x.exam_no+': '+x.result+' ('+x.marks+')').join(', ')}</small></form>`).join('')+`<form class="ops-complete form-row" data-id="${a.attempt_id}"><input name="completion_date" type="date" required><button class="btn btn-success btn-sm">Confirm completion</button></form><form class="ops-outcome form-row" data-id="${a.attempt_id}"><select name="outcome"><option value="failed">Failed</option><option value="repeat_required">Repeat required</option><option value="withdrawn">Withdrawn</option></select><input name="reason" placeholder="Mandatory reason" required><button class="btn btn-outline btn-sm">Save outcome</button></form>`:''}${a.outcome==='passed'?`<p>Confirmed: ${esc(a.completion_date)}</p><form class="ops-correct form-row" data-id="${a.attempt_id}"><input name="completion_date" type="date" value="${esc(a.completion_date)}" required><input name="reason" placeholder="Mandatory correction reason" required><button class="btn btn-outline btn-sm">Correct date</button></form><details><summary>Completion revisions</summary>${a.completions.map(c=>'Revision '+c.revision+': '+esc(c.completion_date)+' · '+esc(c.event_type)+' · '+esc(c.confirmed_by)).join('<br>')}</details>`:''}</div></section>`;}
  async function saveResult(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));f.assessment_id=Number(f.assessment_id);f.marks=Number(f.marks);try{await request(`/attempts/${e.currentTarget.dataset.id}/assessments`,{method:'POST',body:JSON.stringify(f)});notify('Assessment result recorded');loadCompletionLetters();}catch(e){notify(e.message,'error')}}
  async function completeWholeDay(e){
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.currentTarget));
    f.request_key=crypto.randomUUID();
    const button=e.currentTarget.querySelector('button');button.disabled=true;
    try{
      const r=await request('/completions/bulk',{method:'POST',body:JSON.stringify(f)});
      if(!r.eligible)notify('Nobody was in progress for that day');
      else if(!r.failed.length)notify(r.completed+' of '+r.eligible+' completed');
      else notify(r.completed+' of '+r.eligible+' completed. Not completed: '+r.failed.map(x=>x.name+' \u2014 '+x.reason).join('; '),'error');
      loadCompletionLetters();
    }catch(e){notify(e.message,'error')}finally{button.disabled=false}
  }
  async function complete(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));f.request_key=crypto.randomUUID();try{await request(`/attempts/${e.currentTarget.dataset.id}/complete`,{method:'POST',body:JSON.stringify(f)});notify('Completion confirmed');loadCompletionLetters();}catch(e){notify(e.message,'error')}}
  async function correct(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));f.request_key=crypto.randomUUID();try{await request(`/attempts/${e.currentTarget.dataset.id}/correct-completion`,{method:'POST',body:JSON.stringify(f)});notify('Completion date corrected');loadCompletionLetters();}catch(e){notify(e.message,'error')}}
  async function outcome(e){e.preventDefault();try{await request(`/attempts/${e.currentTarget.dataset.id}/outcome`,{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });notify('Outcome saved');loadCompletionLetters();}catch(e){notify(e.message,'error')}}
})();
