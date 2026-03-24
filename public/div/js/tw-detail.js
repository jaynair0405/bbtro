/**
 * tw-detail.js
 * Tower Wagon Detail Book page logic
 */

// ============================================================================
// Configuration
// ============================================================================
const TW_CONFIG = {
    API_BASE: '/api/division/tw',
    OFFICE_CODE: 'PNVL-ML',
    REFRESH_INTERVAL: 60000
};

// State
let twScheduleData = {};
let selectedLP = null;
let selectedDateOffset = 0;
let signoffSlotId = null;
let exceptionSlotId = null;
let yardsData = [];
let slotsData = [];

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Set today's date as default
    const today = new Date();
    document.getElementById('detailDate').value = formatDateKey(today);

    // Update header
    updateHeader();

    // Load yards from database
    await loadYards();

    // Load initial data
    await loadTWCrews();
    await loadTWSchedule();

    // Auto-refresh
    setInterval(async () => {
        await loadTWSchedule();
    }, TW_CONFIG.REFRESH_INTERVAL);
});

// ============================================================================
// Header
// ============================================================================
function updateHeader() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    document.getElementById('headerInfo').textContent = `Tower Wagon | Date: ${dateStr}`;
}

// ============================================================================
// Load Yards from Database
// ============================================================================
async function loadYards() {
    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/yards?office_code=${TW_CONFIG.OFFICE_CODE}`);
        const data = await res.json();

        const select = document.getElementById('yardCode');
        select.innerHTML = '<option value="">-- Select Yard --</option>';

        if (data.success && data.yards) {
            yardsData = data.yards;
            data.yards.forEach(yard => {
                const opt = document.createElement('option');
                opt.value = yard.yard_code;
                opt.textContent = `${yard.yard_code} - ${yard.yard_name}`;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error loading yards:', error);
    }
}

// ============================================================================
// On Yard Change - Load Slots for Selected Yard
// ============================================================================
async function onYardChange() {
    const yardCode = document.getElementById('yardCode').value;
    const slotSelect = document.getElementById('slotTime');
    const detailTiming = document.getElementById('detailTiming');

    // Clear slot and detail timing
    slotSelect.innerHTML = '<option value="">-- Select Slot --</option>';
    detailTiming.value = '';
    slotsData = [];

    if (!yardCode) {
        slotSelect.innerHTML = '<option value="">-- Select Yard First --</option>';
        return;
    }

    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/slots?office_code=${TW_CONFIG.OFFICE_CODE}&yard_code=${yardCode}`);
        const data = await res.json();

        if (data.success && data.slots && data.slots.length > 0) {
            slotsData = data.slots;
            data.slots.forEach(slot => {
                const opt = document.createElement('option');
                opt.value = slot.slot_time;
                opt.textContent = `${slot.slot_time} → ${slot.detail_timing}`;
                opt.dataset.detailTiming = slot.detail_timing;
                slotSelect.appendChild(opt);
            });
        } else {
            slotSelect.innerHTML = '<option value="">No slots configured</option>';
        }
    } catch (error) {
        console.error('Error loading slots:', error);
        slotSelect.innerHTML = '<option value="">Error loading slots</option>';
    }
}

// ============================================================================
// On Slot Change - Auto-fill Detail Timing
// ============================================================================
function onSlotChange() {
    const slotSelect = document.getElementById('slotTime');
    const detailTiming = document.getElementById('detailTiming');
    const selectedOption = slotSelect.options[slotSelect.selectedIndex];

    if (selectedOption && selectedOption.dataset.detailTiming) {
        detailTiming.value = selectedOption.dataset.detailTiming;
    } else {
        detailTiming.value = '';
    }
}

// ============================================================================
// Load TW-Trained Crews
// ============================================================================
async function loadTWCrews() {
    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/active-crews?office_code=${TW_CONFIG.OFFICE_CODE}`);
        const data = await res.json();

        const container = document.getElementById('twCrewCards');

        if (!data.success || !data.crews || data.crews.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">No TW-trained staff available</div>';
            return;
        }

        container.innerHTML = data.crews.map(crew => `
            <div class="tw-crew-card" onclick="selectCrewCard(this, '${crew.hrms_id}', '${escapeHtml(crew.name)}', '${crew.current_cms_id || ''}')">
                <div class="name">${crew.name}</div>
                <div class="cms">${crew.current_cms_id || 'No CMS'}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading TW crews:', error);
        document.getElementById('twCrewCards').innerHTML = '<div style="color: var(--danger); font-size: 0.8rem; padding: 10px;">Error loading crews</div>';
    }
}

// ============================================================================
// Select Crew Card
// ============================================================================
function selectCrewCard(card, hrmsId, name, cmsId) {
    // Remove selection from all cards
    document.querySelectorAll('.tw-crew-card').forEach(c => c.classList.remove('selected'));

    // Select this card
    card.classList.add('selected');

    // Set selected LP
    selectedLP = { hrms_id: hrmsId, name: name, cms_id: cmsId };

    // Show selected LP info
    document.getElementById('selectedLP').style.display = 'block';
    document.getElementById('selectedLPName').textContent = name;
    document.getElementById('selectedLPCMS').textContent = cmsId || 'No CMS';

    // Clear search
    document.getElementById('lpSearch').value = '';
    document.getElementById('lpSearchResults').style.display = 'none';
}

// ============================================================================
// Clear Selected LP
// ============================================================================
function clearSelectedLP() {
    selectedLP = null;
    document.getElementById('selectedLP').style.display = 'none';
    document.querySelectorAll('.tw-crew-card').forEach(c => c.classList.remove('selected'));
}

// ============================================================================
// Search LP
// ============================================================================
let searchTimeout = null;
async function searchLP(query) {
    clearTimeout(searchTimeout);

    const resultsDiv = document.getElementById('lpSearchResults');

    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`${TW_CONFIG.API_BASE}/staff/search?q=${encodeURIComponent(query)}&office_code=${TW_CONFIG.OFFICE_CODE}`);
            const data = await res.json();

            if (data.success && data.staff && data.staff.length > 0) {
                resultsDiv.innerHTML = data.staff.map(s => `
                    <div onclick="selectSearchResult('${s.hrms_id}', '${escapeHtml(s.name)}', '${s.current_cms_id || ''}')"
                         style="padding: 8px 10px; cursor: pointer; border-bottom: 1px solid var(--border);"
                         onmouseover="this.style.background='var(--bg-input)'"
                         onmouseout="this.style.background='transparent'">
                        <div style="font-weight: 600; font-size: 0.85rem;">${s.name}</div>
                        <div style="color: var(--text-muted); font-size: 0.7rem;">${s.current_cms_id || 'No CMS'} | ${s.designation_name || 'LPG'}</div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">No TW-trained staff found</div>';
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 300);
}

function selectSearchResult(hrmsId, name, cmsId) {
    selectedLP = { hrms_id: hrmsId, name: name, cms_id: cmsId };

    document.getElementById('selectedLP').style.display = 'block';
    document.getElementById('selectedLPName').textContent = name;
    document.getElementById('selectedLPCMS').textContent = cmsId || 'No CMS';

    document.getElementById('lpSearch').value = '';
    document.getElementById('lpSearchResults').style.display = 'none';

    // Deselect cards
    document.querySelectorAll('.tw-crew-card').forEach(c => c.classList.remove('selected'));
}

// ============================================================================
// Assign TW Detail
// ============================================================================
async function assignTW() {
    if (!selectedLP) {
        showToast('Please select an LP first', 'error');
        return;
    }

    const yardCode = document.getElementById('yardCode').value;
    const slotTime = document.getElementById('slotTime').value;
    const detailTiming = document.getElementById('detailTiming').value;
    const detailDate = document.getElementById('detailDate').value;

    if (!yardCode || !slotTime || !detailDate) {
        showToast('Please fill Yard, Slot Time, and Date', 'error');
        return;
    }

    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                office_code: TW_CONFIG.OFFICE_CODE,
                detail_date: detailDate,
                slot_time: slotTime,
                yard_code: yardCode,
                detail_timing: detailTiming,
                lp_hrms_id: selectedLP.hrms_id,
                lp_cms_id: selectedLP.cms_id,
                lp_name: selectedLP.name
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast('TW assigned successfully', 'success');
            clearSelectedLP();
            await loadTWCrews();
            await loadTWSchedule();
        } else {
            showToast(data.error || 'Failed to assign TW', 'error');
        }
    } catch (error) {
        console.error('Assign error:', error);
        showToast('Network error', 'error');
    }
}

// ============================================================================
// Load TW Schedule
// ============================================================================
async function loadTWSchedule() {
    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/board?office_code=${TW_CONFIG.OFFICE_CODE}&days=3`);
        const data = await res.json();

        if (data.success) {
            twScheduleData = data.board;
            renderSchedule();
        }
    } catch (error) {
        console.error('Error loading TW schedule:', error);
    }
}

// ============================================================================
// Render Schedule
// ============================================================================
function renderSchedule() {
    const tbody = document.getElementById('twScheduleBody');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + selectedDateOffset);
    const dateKey = formatDateKey(targetDate);

    const rows = twScheduleData[dateKey] || [];

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No TW assignments for this date</td></tr>';
        document.getElementById('twSummary').textContent = `${formatDateDisplay(targetDate)}: 0 assigned`;
        return;
    }

    let onlineCount = 0;
    let safeCount = 0;

    tbody.innerHTML = rows.map(row => {
        const statusClass = getRowClass(row.lp_status);
        const slotTime = formatTime(row.slot_time);

        if (row.lp_status === 'ONLINE') onlineCount++;
        if (row.lp_status === 'SAFE') safeCount++;

        // Build badges
        let badges = '';
        if (row.lp_exception === 'AUC') badges += ' <span class="badge-auc">AUC</span>';
        if (row.lp_exception === 'NF') badges += ' <span class="badge-nf">NF</span>';
        if (row.lp_status === 'SAFE') badges += ' <span class="badge-safe">SAFE</span>';
        if (row.lp_status === 'ONLINE') badges += ' <span class="badge-online" style="background:#3b82f6;color:#fff;padding:1px 4px;border-radius:3px;font-size:0.65em;font-weight:700;">ONLINE</span>';

        // Row click handler for ONLINE rows (signoff)
        const rowClick = row.lp_status === 'ONLINE' ? `onclick="openSignoff(${row.id}, '${escapeHtml(row.lp_name || '')}', '${slotTime}', '${row.yard_code}')"` : '';
        const rowStyle = row.lp_status === 'ONLINE' ? 'cursor: pointer;' : '';

        return `
            <tr class="${statusClass}" ${rowClick} style="${rowStyle}" data-id="${row.id}">
                <td style="font-family: 'JetBrains Mono', monospace;">${slotTime}</td>
                <td>${row.yard_code}</td>
                <td>
                    ${row.lp_name || '--'}${badges}
                    <div style="font-size: 0.7em; color: var(--text-muted);">${row.lp_cms_id || ''}</div>
                </td>
                <td style="font-size: 0.75rem;">${row.detail_timing || '--'}</td>
                <td>
                    ${row.lp_status === 'FORECAST' ? `<button onclick="deleteTW(event, ${row.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;" title="Remove">&times;</button>` : ''}
                    ${row.lp_status === 'ONLINE' || row.lp_status === 'FORECAST' ? `<button onclick="openExceptionModal(event, ${row.id}, '${escapeHtml(row.lp_name || '')}', '${row.lp_exception || ''}')" style="background: none; border: none; color: var(--warning); cursor: pointer; font-size: 0.8rem;" title="Mark Exception">!</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('twSummary').textContent = `${formatDateDisplay(targetDate)}: ${rows.length} assigned | ${onlineCount} online | ${safeCount} safe`;
}

function getRowClass(status) {
    const classes = {
        'FORECAST': 'row-forecast',
        'ONLINE': 'row-online',
        'SAFE': 'row-safe'
    };
    return classes[status] || '';
}

// ============================================================================
// Date Navigation
// ============================================================================
function changeDate(offset) {
    selectedDateOffset = offset;

    // Update tab styling
    document.querySelectorAll('.date-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.offset) === offset);
    });

    renderSchedule();
}

// ============================================================================
// Sign-Off
// ============================================================================
function openSignoff(id, lpName, slotTime, yard) {
    signoffSlotId = id;

    document.getElementById('signoffLPName').textContent = lpName;
    document.getElementById('signoffSlotInfo').textContent = `${yard} @ ${slotTime}`;

    document.getElementById('signoffSection').style.display = 'block';
    document.getElementById('noSignoffMsg').style.display = 'none';

    // Set default sign-off time to current time
    const now = new Date();
    document.getElementById('signoffTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Scroll to signoff section
    document.getElementById('signoffSection').scrollIntoView({ behavior: 'smooth' });
}

function cancelSignoff() {
    signoffSlotId = null;
    document.getElementById('signoffSection').style.display = 'none';
    document.getElementById('noSignoffMsg').style.display = 'block';

    // Clear fields
    document.getElementById('trNo').value = '';
    document.getElementById('locoNo').value = '';
    document.getElementById('signoffTime').value = '';
}

async function markSignoff() {
    if (!signoffSlotId) return;

    const trNo = document.getElementById('trNo').value.trim();
    const locoNo = document.getElementById('locoNo').value.trim();
    const signoffTime = document.getElementById('signoffTime').value;

    if (!signoffTime) {
        showToast('Sign-off time is required', 'error');
        return;
    }

    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/signoff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: signoffSlotId,
                tr_no: trNo,
                loco_no: locoNo,
                signed_off_at: signoffTime
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Marked SAFE - LP available in Detail Book', 'success');
            cancelSignoff();
            await loadTWCrews();
            await loadTWSchedule();
        } else {
            showToast(data.error || 'Failed to mark sign-off', 'error');
        }
    } catch (error) {
        console.error('Sign-off error:', error);
        showToast('Network error', 'error');
    }
}

// ============================================================================
// Delete TW Assignment
// ============================================================================
async function deleteTW(event, id) {
    event.stopPropagation();

    if (!confirm('Remove this TW assignment?')) return;

    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (data.success) {
            showToast('TW assignment removed', 'success');
            await loadTWCrews();
            await loadTWSchedule();
        } else {
            showToast(data.error || 'Failed to remove', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error', 'error');
    }
}

// ============================================================================
// Exception Modal
// ============================================================================
function openExceptionModal(event, id, lpName, currentException) {
    event.stopPropagation();
    exceptionSlotId = id;

    document.getElementById('exceptionLPInfo').innerHTML = `
        <div style="font-weight: 600;">${lpName}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Current: ${currentException || 'None'}</div>
    `;

    document.getElementById('exceptionModal').style.display = 'flex';
}

function closeExceptionModal() {
    exceptionSlotId = null;
    document.getElementById('exceptionModal').style.display = 'none';
}

async function setException(exception) {
    if (!exceptionSlotId) return;

    try {
        const res = await fetch(`${TW_CONFIG.API_BASE}/exception`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: exceptionSlotId,
                exception: exception
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast(data.message, 'success');
            closeExceptionModal();
            await loadTWSchedule();
        } else {
            showToast(data.error || 'Failed to update exception', 'error');
        }
    } catch (error) {
        console.error('Exception error:', error);
        showToast('Network error', 'error');
    }
}

// ============================================================================
// Utilities
// ============================================================================
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatTime(timeStr) {
    if (!timeStr) return '--';
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
        // ISO datetime
        const d = new Date(timeStr);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
        return timeStr.substring(0, 5);
    }
    return '--';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--danger)' : type === 'success' ? '#22c55e' : 'var(--accent)';
    toast.style.color = type === 'error' ? '#fff' : '#000';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
