/* global apiUrl, centreConfig, showToast */
'use strict';
window.trainingManage = (() => {
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const sourceNames = {staff:'Staff',cli:'CLI',manual_tm:'Train Manager'};
    let epoch=0,page=1,courses=[],selectedRule=null,removeDate=null,lookupRows=[],matches=[],lookupSequence=0,registerSequence=0;
    async function api(route, options={}) {
        if (!centreConfig) throw new Error('Wait for centre details to load');
        const current = epoch;
        const response = await fetch(apiUrl('/manage'+route.split('?')[0],route.split('?')[1]),{
            ...options,headers:{'Content-Type':'application/json',...options.headers}
        });
        const result = await response.json();
        if (current !== epoch) throw new Error('Centre changed. Please retry in the selected centre.');
        if (!response.ok) throw Object.assign(new Error(result.error || 'Request failed'),{data:result});
        return result;
    }
    const post = (route,body) => api(route,{method:'POST',body:JSON.stringify(body)});
    async function action(button, fn) {
        const selector=$('centreSelector');
        if (button) button.disabled=true;
        selector.disabled=true;
        try { await fn(); }
        catch(error) { showToast(error.message,'error'); }
        finally { if(button)button.disabled=false;selector.disabled=false; }
    }
    function empty(id,message) { $(id).innerHTML='<p class="trg-empty">'+escape(message)+'</p>'; }
    function table(rows, mode) {
        if (!rows.length) return '<p class="trg-empty">No trainees found.</p>';
        return `<table><thead><tr><th>Name</th><th>CMS ID</th><th>Lobby</th><th>PF number</th><th>HRMS ID</th><th>${mode==='register'?'Source':'Action'}</th></tr></thead><tbody>`+
            rows.map((r,i)=>`<tr><td>${escape(r.name)}</td><td>${escape(r.cms_id || '—')}</td><td>${escape(r.lobby || '—')}</td><td>${escape(r.pf_number || '—')}</td><td>${escape(r.hrms_id || '—')}</td><td>${mode==='register'?escape(sourceNames[r.source]):`<button type="button" class="btn btn-outline btn-sm" data-${mode}="${i}">${mode==='match'?'Use existing':'Register'}</button>`}</td></tr>`).join('')+'</tbody></table>';
    }
    async function registerList() {
        const sequence=++registerSequence;
        const params=new URLSearchParams({q:$('trg-filter').value,source:$('trg-filter-source').value,page});
        empty('trg-register','Loading register…');
        try {
            const result=await api('/trainees?'+params);
            if(sequence!==registerSequence)return;
            $('trg-register').innerHTML=table(result.data,'register');
            $('trg-total').textContent=result.total+' trainees';
            $('trg-page').textContent='Page '+result.page;
            $('trg-prev').disabled=page<=1;$('trg-next').disabled=page*50>=result.total;
        } catch(error) {if(sequence===registerSequence)empty('trg-register',error.message);}
    }
    async function loadCourses() {
        empty('trg-courses','Loading courses…');
        try {
            const result=await api('/courses');courses=result.data;
            $('trg-course-count').textContent=courses.length+' courses';
            $('trg-preview-course').innerHTML=courses.map(c=>`<option value="${c.rule_id}">${escape(c.course_name)}</option>`).join('');
            if(!courses.length){empty('trg-courses','Courses are not configured for this centre yet.');return;}
            $('trg-courses').innerHTML=courses.map(c=>`<article class="trg-course">
                <h4>${escape(c.course_name)}</h4><span class="trg-rule">${c.working_days} working days</span><span class="trg-rule">Report ${escape(c.report_time.slice(0,5))}</span>${c.advance_planning?'<span class="trg-rule">Advance refresher planning</span>':''}
                <p><strong>Eligible:</strong> ${escape(c.eligibility_notes)}</p>
                ${c.subsequent_handling_days?`<p>Followed by ${c.subsequent_handling_days} days CLI handling. Renewal starts at MTC completion.</p>`:''}
                <p><strong>Renewal:</strong> ${c.renewals.length?c.renewals.map(r=>escape(r.target_name)+' — '+r.validity_months+' months').join('; '):'One-time course; no recurring due date.'}</p>
                <p><strong>Assessment:</strong> ${!c.assessment_configured?'Not configured':c.assessments.length?c.assessments.map(a=>`${escape(a.assessment_name)}: pass ${a.passing_marks} / ${a.maximum_marks}`).join('; '):'No assessment required (centre configured)'}</p>
                <button type="button" class="btn btn-outline btn-sm" data-assessment="${c.rule_id}">Configure assessments</button>
            </article>`).join('');
        } catch(error){empty('trg-courses',error.message);}
    }
    async function loadHolidays() {
        try {
            const {data}=await api('/holidays');
            $('trg-holidays').innerHTML=data.length?'<table><thead><tr><th>Date</th><th>Holiday / reason</th><th>Action</th></tr></thead><tbody>'+data.map(h=>`<tr><td>${escape(h.holiday_date)}</td><td>${escape(h.reason)}</td><td><button type="button" class="btn btn-outline btn-sm" data-remove="${escape(h.holiday_date)}">Remove</button></td></tr>`).join('')+'</tbody></table>':'<p class="trg-empty">No additional centre holidays recorded.</p>';
        } catch(error){empty('trg-holidays',error.message);}
    }
    function addAssessment(a={}) {
        const row=document.createElement('div');row.className='trg-assessment-row';
        row.innerHTML=`<label class="form-group">Name<input data-field="name" maxlength="150" value="${escape(a.assessment_name || '')}" required></label>
            <label class="form-group">Component<select data-field="component"><option value="written">Written</option><option value="oral" ${a.component==='oral'?'selected':''}>Oral</option></select></label>
            <label class="form-group">Maximum<input data-field="maximum_marks" type="number" min="0.01" max="999999.99" step="0.01" value="${escape(a.maximum_marks || '')}" required></label>
            <label class="form-group">Pass mark<input data-field="passing_marks" type="number" min="0" max="999999.99" step="0.01" value="${escape(a.passing_marks ?? '')}" required></label>
            <button class="btn btn-outline btn-sm" type="button" aria-label="Remove assessment component">Remove</button>`;
        row.querySelector('button').addEventListener('click',()=>row.remove());
        $('trg-assessment-rows').append(row);
    }
    function assessmentMode() {
        const none=$('trg-no-assessment').checked;
        $('trg-assessment-rows').hidden=none;$('trg-add-assessment').disabled=none;
        $('trg-assessment-rows').querySelectorAll('input,select').forEach(el=>el.disabled=none);
    }
    function configure(rule) {
        selectedRule=courses.find(c=>c.rule_id===rule);
        if(!selectedRule)return;
        $('trg-assessment-form').reset();$('trg-assessment-rows').replaceChildren();
        $('trg-assessment-course').textContent=selectedRule.course_name;
        $('trg-no-assessment').checked=!!selectedRule.assessment_configured && !selectedRule.assessments.length;
        selectedRule.assessments.forEach(addAssessment);assessmentMode();
        $('trg-assessment-dialog').showModal();
    }
    function bind() {
        $('trg-source').addEventListener('change',()=>{
            lookupSequence++;lookupRows=[];matches=[];
            const manual=$('trg-source').value==='manual_tm';
            $('trg-manual-form').hidden=!manual;$('trg-lookup-form').hidden=manual;$('trg-results').replaceChildren();
        });
        $('trg-lookup-form').addEventListener('submit',event=>{
            event.preventDefault();
            action(event.submitter,async()=>{
                const sequence=++lookupSequence,source=$('trg-source').value;
                const {data}=await api('/lookup?'+new URLSearchParams({source,q:$('trg-lookup').value}));
                if(sequence!==lookupSequence)return;
                lookupRows=data.map(r=>({...r,source}));
                $('trg-results').innerHTML=table(lookupRows,'lookup')+(data.length===50?'<p class="trg-help">Showing 50 matches. Refine your search if needed.</p>':'');
            });
        });
        $('trg-results').addEventListener('click',event=>{
            const button=event.target.closest('button');if(!button)return;
            action(button,async()=>{
                let result;
                if(button.dataset.lookup!=null){const row=lookupRows[Number(button.dataset.lookup)];result=await post('/trainees',{source:row.source,source_id:row.source_id});}
                else if(button.dataset.match!=null){const row=matches[Number(button.dataset.match)];result=await post('/trainees/link',{trainee_id:row.trainee_id});}
                else return;
                showToast(result.already_registered?'Already in this centre register':'Trainee registered');await registerList();
            });
        });
        $('trg-manual-form').addEventListener('submit',event=>{
            event.preventDefault();
            action(event.submitter,async()=>{
                try {
                    const result=await post('/trainees',{source:'manual_tm',...Object.fromEntries(new FormData(event.target))});
                    showToast(result.already_registered?'Already in this centre register':'Train Manager registered');
                    event.target.reset();$('trg-results').replaceChildren();await registerList();
                } catch(error){if(error.data?.matches){matches=error.data.matches;$('trg-results').innerHTML='<p class="trg-help">'+escape(error.message)+'</p>'+table(matches,'match');}throw error;}
            });
        });
        $('trg-filter-form').addEventListener('submit',e=>{e.preventDefault();page=1;registerList();});
        $('trg-prev').addEventListener('click',()=>{page--;registerList();});
        $('trg-next').addEventListener('click',()=>{page++;registerList();});
        $('trg-courses').addEventListener('click',e=>{const b=e.target.closest('[data-assessment]');if(b)configure(Number(b.dataset.assessment));});
        $('trg-add-assessment').addEventListener('click',()=>{
            if($('trg-assessment-rows').children.length>=12){showToast('Up to 12 components are supported','error');return;}addAssessment();
        });
        $('trg-no-assessment').addEventListener('change',assessmentMode);
        $('trg-assessment-form').addEventListener('submit',e=>{
            e.preventDefault();
            action(e.submitter,async()=>{
                const none=$('trg-no-assessment').checked;
                const assessments=none?[]:[...$('trg-assessment-rows').children].map(row=>Object.fromEntries([...row.querySelectorAll('[data-field]')].map(el=>[el.dataset.field,el.type==='number'?Number(el.value):el.value])));
                await post('/courses/'+selectedRule.rule_id+'/assessments',{no_assessment:none,assessments,reason:$('trg-assessment-reason').value});
                $('trg-assessment-dialog').close();showToast('Assessment settings saved');await loadCourses();
            });
        });
        $('trg-holiday-form').addEventListener('submit',e=>{
            e.preventDefault();action(e.submitter,async()=>{
                await post('/holidays',{holiday_date:$('trg-holiday-date').value,reason:$('trg-holiday-reason').value});
                e.target.reset();$('trg-preview-result').replaceChildren();showToast('Centre holiday saved');await loadHolidays();
            });
        });
        $('trg-holidays').addEventListener('click',e=>{
            const b=e.target.closest('[data-remove]');if(!b)return;
            removeDate=b.dataset.remove;$('trg-remove-date').textContent=removeDate;$('trg-remove-form').reset();$('trg-remove-dialog').showModal();
        });
        $('trg-remove-form').addEventListener('submit',e=>{
            e.preventDefault();action(e.submitter,async()=>{
                await api('/holidays/'+removeDate,{method:'DELETE',body:JSON.stringify({reason:$('trg-remove-reason').value})});
                $('trg-remove-dialog').close();$('trg-preview-result').replaceChildren();showToast('Holiday removed');await loadHolidays();
            });
        });
        $('trg-preview-form').addEventListener('submit',e=>{
            e.preventDefault();$('trg-preview-result').replaceChildren();action(e.submitter,async()=>{
                const r=await api('/courses/'+$('trg-preview-course').value+'/preview?joining_date='+encodeURIComponent($('trg-preview-date').value));
                $('trg-preview-result').textContent='Estimated completion: '+r.expected_completion+'. '+r.renewals.map(v=>v.target_name+' due: '+v.due_date).join('; ')+'. '+r.note;
            });
        });
        document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
    }
    async function load(tab) {
        if(tab==='register')await registerList();
        if(tab==='courses')await Promise.all([loadCourses(),loadHolidays()]);
    }
    function reset() {
        epoch++;lookupSequence++;registerSequence++;page=1;courses=[];lookupRows=[];matches=[];selectedRule=null;
        ['trg-assessment-dialog','trg-remove-dialog'].forEach(id=>$(id).close());
        ['trg-results','trg-preview-result','trg-register','trg-courses','trg-holidays'].forEach(id=>$(id).replaceChildren());
        ['trg-manual-form','trg-lookup-form','trg-holiday-form','trg-filter-form'].forEach(id=>$(id).reset());
        const tab=document.querySelector('.tab.active')?.dataset.tab;load(tab);
    }
    document.addEventListener('DOMContentLoaded',bind);
    return {load,reset};
})();
