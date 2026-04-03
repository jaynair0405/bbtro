/**
 * Slate.js - Digital Booking Slate for Jr CC and Big Screen Display
 * Central Railway Mumbai Division - Digital Slate System
 */

// ========== STATE ==========
let slateData = {};          // { date: { shift: [slots] } }
let dateOffset = 0;          // -1 = yesterday, 0 = today, 1 = tomorrow
let currentDate = formatDateKey(new Date());
let currentShiftIndex = getCurrentShiftIndex();
let isDisplayMode = false;   // Read-only mode for big screen
let forceShift = null;       // Force specific shift via URL
let refreshTimer = null;
let idleTimer = null;
let editingSlotId = null;

// Safety slogans - one per day of month (placeholder for now, will be from DB/CSV)
const SAFETY_SLOGANS = [
    "Safety is not a choice, it's a responsibility",
    "When in doubt, don't proceed",
    "One unsafe act can change lives forever",
    "Alert today, alive tomorrow",
    "Safety first, because accidents last",
    "Your family is waiting for you at home",
    "Rules are written in blood - follow them",
    "A moment of caution is worth a lifetime",
    "Safety is a full-time job - don't make it part-time",
    "Think safety, work safely",
    "Safety begins with you",
    "Don't learn safety by accident",
    "Safety is no accident",
    "The best safety device is a careful worker",
    "Safety is a state of mind - accidents are an absence of mind",
    "Be aware, take care",
    "Safety: It's the little things that count",
    "Working safely may get old, but so do those who practice it",
    "Safety isn't expensive, it's priceless",
    "If you think safety is expensive, try an accident",
    "Safety - a small investment for a rich future",
    "Your safety is everyone's responsibility",
    "Safety starts with S but begins with YOU",
    "Zero accidents is the only acceptable number",
    "Safety is our way of life",
    "Make safety your priority, not your choice",
    "Safety: Expect the unexpected",
    "Carelessness can be more dangerous than ignorance",
    "Take time for safety, it's worth it",
    "Safety is not just a slogan, it's a way of life",
    "Tomorrow - your reward for working safely today"
];

function getSafetySlogan() {
    const dayOfMonth = new Date().getDate();
    return SAFETY_SLOGANS[(dayOfMonth - 1) % SAFETY_SLOGANS.length];
}

function renderSafetyFooter() {
    return `<div class="safety-footer"><div class="slogan">${getSafetySlogan()}</div></div>`;
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    isDisplayMode = urlParams.get('display') === '1';
    forceShift = urlParams.has('shift') ? parseInt(urlParams.get('shift')) : null;

    // Apply theme from URL
    if (urlParams.get('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // Set display mode class
    if (isDisplayMode) {
        document.body.classList.add('display-mode');
    }

    // Initialize
    updateHeader();
    buildDateNav();
    buildShiftNav();
    loadSlateData();

    // Initialize exception modal (only for interactive mode)
    if (!isDisplayMode) {
        initExceptionModal();
    }

    // Start auto-refresh
    startAutoRefresh();

    // Keyboard navigation for display mode
    if (isDisplayMode) {
        document.addEventListener('keydown', handleKeyNav);
    }
});

// ========== DATA LOADING ==========

async function loadSlateData() {
    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/board?office_code=${SLATE_CONFIG.OFFICE_CODE}&date=${currentDate}&days=1`);
        const data = await res.json();

        if (data.success && data.board) {
            slateData = data.board;
            renderCurrentShift();
            updateVacancySummary(data.vacancy);
            // Reinforce date button highlighting after data load
            updateDateButtons();
        } else {
            showToast('Failed to load slate data', 'error');
        }
    } catch (error) {
        console.error('Error loading slate:', error);
        showToast('Network error loading slate', 'error');
    }
}

// ========== HEADER ==========

function updateHeader() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    updateHeaderDate(); // Uses dateOffset for correct date display
    document.getElementById('headerTime').textContent = timeStr;
    document.getElementById('headerShift').textContent = getShiftLabel(forceShift ?? currentShiftIndex);

    // Update time every second in display mode
    if (isDisplayMode) {
        setTimeout(updateHeader, 1000);
    }
}

// ========== SHIFT NAVIGATION ==========

function buildShiftNav() {
    const nav = document.getElementById('shiftNav');
    const shiftColors = ['shift-night', 'shift-day', 'shift-evening'];
    const shiftLabels = ['00-08', '08-16', '16-24'];
    const shiftIcons = ['🔵', '🟢', '🟠'];

    const activeShift = forceShift ?? currentShiftIndex;

    nav.innerHTML = `
        <button class="nav-btn" onclick="changeShift(-1)" title="Previous Shift">‹</button>
        <div class="shift-tabs">
            ${[0, 1, 2].map(i => `
                <button class="shift-tab ${shiftColors[i]} ${i === activeShift ? 'active' : ''}"
                        onclick="selectShift(${i})">
                    ${shiftIcons[i]} ${shiftLabels[i]}
                </button>
            `).join('')}
        </div>
        <button class="nav-btn" onclick="changeShift(1)" title="Next Shift">›</button>
    `;
}

function selectShift(index) {
    forceShift = index;
    buildShiftNav();
    renderCurrentShift();
    resetIdleTimer();
}

function changeShift(delta) {
    const current = forceShift ?? currentShiftIndex;
    const newShift = (current + delta + 3) % 3;
    selectShift(newShift);
}

function resetIdleTimer() {
    if (!isDisplayMode) return;

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        // Return to current shift after idle
        forceShift = null;
        currentShiftIndex = getCurrentShiftIndex();
        buildShiftNav();
        renderCurrentShift();
    }, 60000); // 60 seconds idle
}

// ========== DATE NAVIGATION ==========

function buildDateNav() {
    const nav = document.getElementById('dateNav');
    if (!nav) return;

    const today = new Date();
    const buttons = [-1, 0, 1].map(offset => {
        const date = new Date(today);
        date.setDate(date.getDate() + offset);

        const dayNum = date.getDate();
        const monthShort = date.toLocaleDateString('en-IN', { month: 'short' });
        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });

        const isActive = offset === dateOffset;
        const label = `${dayNum} ${monthShort} (${dayName})`;

        return `<button class="nav-btn date-btn ${isActive ? 'active' : ''}"
                        onclick="changeDate(${offset})"
                        data-offset="${offset}"
                        style="min-width: 110px;">${label}</button>`;
    });

    nav.innerHTML = buttons.join('');
}

function changeDate(offset) {
    dateOffset = offset;

    // Calculate new date
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + offset);
    currentDate = formatDateKey(baseDate);

    // Update date button active states
    updateDateButtons();

    // Update header with selected date
    updateHeaderDate();

    // Reload data for selected date
    loadSlateData();
}

function updateDateButtons() {
    const buttons = document.querySelectorAll('.date-nav .date-btn');
    buttons.forEach(btn => {
        const btnOffset = parseInt(btn.dataset.offset);
        btn.classList.toggle('active', btnOffset === dateOffset);
    });
}

function updateHeaderDate() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dateOffset);

    const dateStr = targetDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const headerDateEl = document.getElementById('headerDate');
    if (headerDateEl) {
        headerDateEl.textContent = dateStr;
    }
}

// ========== RENDERING ==========

function renderCurrentShift() {
    const shiftIndex = forceShift ?? currentShiftIndex;
    const shiftCode = getShiftCode(shiftIndex);
    const dateData = slateData[currentDate] || {};
    const slots = dateData[shiftCode] || [];

    if (isDisplayMode) {
        renderDisplayMode(slots, shiftIndex);
    } else {
        renderInteractiveMode(slots, shiftIndex);
    }
}

function renderDisplayMode(slots, shiftIndex) {
    const container = document.getElementById('slateContent');
    const startHour = shiftIndex * 8;
    const midHour = startHour + 4;

    // Split shift into two halves for display
    const firstHalf = slots.filter(s => {
        const hour = parseInt(s.slot_time.split(':')[0]);
        return hour >= startHour && hour < midHour;
    });
    const secondHalf = slots.filter(s => {
        const hour = parseInt(s.slot_time.split(':')[0]);
        return hour >= midHour && hour < startHour + 8;
    });

    const shiftColors = ['--shift-night', '--shift-day', '--shift-evening'];
    const halfLabels = [
        [`${String(startHour).padStart(2, '0')}:00 - ${String(midHour).padStart(2, '0')}:00`,
         `${String(midHour).padStart(2, '0')}:00 - ${String(startHour + 8).padStart(2, '0')}:00`]
    ];

    container.innerHTML = `
        <div class="display-grid">
            <div class="display-half">
                <div class="half-header" style="border-color: var(${shiftColors[shiftIndex]})">
                    ${halfLabels[0][0]}
                </div>
                <div class="display-rows">
                    ${firstHalf.map(slot => renderDisplayRow(slot)).join('')}
                    ${firstHalf.length === 0 ? '<div class="no-data">No slots in this period</div>' : ''}
                </div>
            </div>
            <div class="display-half">
                <div class="half-header" style="border-color: var(${shiftColors[shiftIndex]})">
                    ${halfLabels[0][1]}
                </div>
                <div class="display-rows">
                    ${secondHalf.map(slot => renderDisplayRow(slot)).join('')}
                    ${secondHalf.length === 0 ? '<div class="no-data">No slots in this period</div>' : ''}
                </div>
            </div>
        </div>
        ${renderSafetyFooter()}
    `;
}

function renderDisplayRow(slot) {
    const statusClass = getRowStatusClass(slot);
    const trainDisplay = slot.train_no || '--';
    const locoDisplay = slot.loco_no || '--';
    const crossSlotInfo = slot.alp_cross_slot_time ? `↳ ${formatTime(slot.alp_cross_slot_time)}` : '';
    const statusIcon = getStatusIcon(slot);

    // LP name with exception/late badge
    let lpName = slot.lp_name ? truncateName(slot.lp_name) : '--';
    let lpStyle = '';
    const lpSignedOnTime = formatTime(slot.lp_signed_on_at);
    const isLpLate = slot.lp_signed_on_at && lpSignedOnTime !== '--' &&
        isLateArrival(slot.slot_date, slot.slot_time, slot.lp_signed_on_at);

    if (isLpLate) {
        lpName += `<br><sub style="font-size: 0.55em; color: #22d3ee;">@ ${lpSignedOnTime}</sub>`;
        lpStyle = 'color: #22d3ee;';
    } else if (slot.lp_exception === 'AUC') {
        lpName += ' <sup style="font-size: 0.6em;">AUC</sup>';
        lpStyle = 'color: var(--warning);';
    } else if (slot.lp_exception === 'NF') {
        lpName += ' <sup style="font-size: 0.6em;">NF</sup>';
        lpStyle = 'color: var(--danger);';
    }

    // ALP name with exception/late badge
    let alpName = slot.alp_name ? truncateName(slot.alp_name) : '--';
    let alpStyle = '';
    const alpSignedOnTime = formatTime(slot.alp_signed_on_at);
    const isAlpLate = slot.alp_signed_on_at && alpSignedOnTime !== '--' &&
        isLateArrival(slot.slot_date, slot.slot_time, slot.alp_signed_on_at);

    if (isAlpLate) {
        alpName += `<br><sub style="font-size: 0.55em; color: #22d3ee;">@ ${alpSignedOnTime}</sub>`;
        alpStyle = 'color: #22d3ee;';
    } else if (slot.alp_exception === 'AUC') {
        alpName += ' <sup style="font-size: 0.6em;">AUC</sup>';
        alpStyle = 'color: var(--warning);';
    } else if (slot.alp_exception === 'NF') {
        alpName += ' <sup style="font-size: 0.6em;">NF</sup>';
        alpStyle = 'color: var(--danger);';
    }

    return `
        <div class="display-row ${statusClass} ${slot.is_adhoc ? 'adhoc-row' : ''}">
            <div class="row-time">${formatTime(slot.slot_time)}</div>
            <div class="row-train">${trainDisplay}</div>
            <div class="row-loco">${locoDisplay}</div>
            <div class="row-lp" style="${lpStyle}">${lpName}</div>
            <div class="row-alp" style="${alpStyle}">
                ${alpName}
                ${crossSlotInfo ? `<span class="cross-link">${crossSlotInfo}</span>` : ''}
            </div>
            <div class="row-status">${statusIcon}</div>
        </div>
    `;
}

function renderInteractiveMode(slots, shiftIndex) {
    const container = document.getElementById('slateContent');
    const startHour = shiftIndex * 8;
    const midHour = startHour + 4;

    // Split shift into two halves
    const firstHalf = slots.filter(s => {
        const hour = parseInt(s.slot_time.split(':')[0]);
        return hour >= startHour && hour < midHour;
    });
    const secondHalf = slots.filter(s => {
        const hour = parseInt(s.slot_time.split(':')[0]);
        return hour >= midHour && hour < startHour + 8;
    });

    const shiftColors = ['--shift-night', '--shift-day', '--shift-evening'];
    const halfLabels = [
        `${String(startHour).padStart(2, '0')}:00 - ${String(midHour).padStart(2, '0')}:00`,
        `${String(midHour).padStart(2, '0')}:00 - ${String(startHour + 8).padStart(2, '0')}:00`
    ];

    const renderHalfTable = (halfSlots, label) => `
        <div class="interactive-half">
            <div class="half-header" style="border-color: var(${shiftColors[shiftIndex]}); margin-bottom: 8px; padding: 6px 12px; font-weight: 700; font-size: 0.85rem;">
                ${label}
            </div>
            <table class="slate-table">
                <thead>
                    <tr>
                        <th colspan="3" class="lp-header">LP</th>
                        <th class="time-header">TIME</th>
                        <th colspan="3" class="alp-header">ALP</th>
                    </tr>
                    <tr>
                        <th>Loco</th>
                        <th>Train</th>
                        <th>Name</th>
                        <th></th>
                        <th>Name</th>
                        <th>Train</th>
                        <th>Loco</th>
                    </tr>
                </thead>
                <tbody>
                    ${halfSlots.map(slot => renderInteractiveRow(slot)).join('')}
                    ${halfSlots.length === 0 ? '<tr><td colspan="7" class="no-data">No slots</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = `
        <div class="interactive-grid">
            ${renderHalfTable(firstHalf, halfLabels[0])}
            ${renderHalfTable(secondHalf, halfLabels[1])}
        </div>
        ${renderSafetyFooter()}
    `;
}

function renderInteractiveRow(slot) {
    const statusClass = getRowStatusClass(slot);
    const isBooked = slot.train_no || slot.loco_no;
    const crossSlotInfo = slot.alp_cross_slot_time ? `<span class="cross-link">↳ from ${formatTime(slot.alp_cross_slot_time)}</span>` : '';

    // LP name with exception/late badge and click handler
    let lpNameHtml = '<span class="empty-slot">--</span>';
    let lpStyle = '';
    if (slot.lp_name) {
        let lpBadge = '';
        // Check for late arrival first (has signed_on_at and time > slot_time)
        const lpSignedOnTime = formatTime(slot.lp_signed_on_at);
        const isLpLate = slot.lp_signed_on_at && lpSignedOnTime !== '--' &&
            isLateArrival(slot.slot_date, slot.slot_time, slot.lp_signed_on_at);

        if (isLpLate) {
            // Show late time below name as subscript
            lpBadge = `<br><sub style="color: #22d3ee; font-size: 0.7em;">@ ${lpSignedOnTime}</sub>`;
            lpStyle = 'color: #22d3ee;';
        } else if (slot.lp_exception === 'AUC') {
            lpBadge = '<sup style="color: var(--warning); font-weight: 700; margin-left: 2px;">AUC</sup>';
            lpStyle = 'color: var(--warning);';
        } else if (slot.lp_exception === 'NF') {
            lpBadge = '<sup style="color: var(--danger); font-weight: 700; margin-left: 2px;">NF</sup>';
            lpStyle = 'color: var(--danger);';
        }
        const lpData = escapeJsonForAttr({
            name: slot.lp_name,
            slot_time: formatTime(slot.slot_time),
            slot_date: slot.slot_date,
            current_exception: slot.lp_exception,
            current_remark: slot.lp_exception_remark,
            signed_on_at: slot.lp_signed_on_at,
            late_reason: slot.lp_late_reason,
            detention: slot.lp_detention,
            detention_remark: slot.lp_detention_remark
        });
        // Build fatigue/PR indicators for LP
        let lpFatigueBadge = '';
        if (slot.lp_night_streak) {
            lpFatigueBadge += `<sup style="background: #1e3a5f; color: #7dd3fc; padding: 0 3px; border-radius: 3px; margin-left: 3px; font-size: 0.65em;" title="${slot.lp_night_streak} consecutive night duties">🌙${slot.lp_night_streak}</sup>`;
        }
        if (slot.lp_pr_days) {
            lpFatigueBadge += `<sup style="background: #7c3aed; color: #fff; padding: 0 4px; border-radius: 50%; margin-left: 3px; font-size: 0.65em;" title="${slot.lp_pr_days} consecutive duty days - PR due">${slot.lp_pr_days}</sup>`;
        }
        lpNameHtml = `<span class="clickable-name" style="cursor: pointer; ${lpStyle}"
            onclick="openSlotException(${slot.id}, 'lp', JSON.parse(this.dataset.info))"
            data-info="${lpData}"
            title="Click to mark Late/AUC/NF">${slot.lp_name}${lpBadge}${lpFatigueBadge}</span>`;
    }

    // ALP name with exception/late badge and click handler
    let alpNameHtml = '<span class="empty-slot">--</span>';
    let alpStyle = '';
    if (slot.alp_name) {
        let alpBadge = '';
        const alpSignedOnTime = formatTime(slot.alp_signed_on_at);
        const isAlpLate = slot.alp_signed_on_at && alpSignedOnTime !== '--' &&
            isLateArrival(slot.slot_date, slot.slot_time, slot.alp_signed_on_at);

        if (isAlpLate) {
            // Show late time below name as subscript
            alpBadge = `<br><sub style="color: #22d3ee; font-size: 0.7em;">@ ${alpSignedOnTime}</sub>`;
            alpStyle = 'color: #22d3ee;';
        } else if (slot.alp_exception === 'AUC') {
            alpBadge = '<sup style="color: var(--warning); font-weight: 700; margin-left: 2px;">AUC</sup>';
            alpStyle = 'color: var(--warning);';
        } else if (slot.alp_exception === 'NF') {
            alpBadge = '<sup style="color: var(--danger); font-weight: 700; margin-left: 2px;">NF</sup>';
            alpStyle = 'color: var(--danger);';
        }
        const alpData = escapeJsonForAttr({
            name: slot.alp_name,
            slot_time: formatTime(slot.slot_time),
            slot_date: slot.slot_date,
            current_exception: slot.alp_exception,
            current_remark: slot.alp_exception_remark,
            signed_on_at: slot.alp_signed_on_at,
            late_reason: slot.alp_late_reason,
            detention: slot.alp_detention,
            detention_remark: slot.alp_detention_remark
        });
        // Build fatigue/PR indicators for ALP
        let alpFatigueBadge = '';
        if (slot.alp_night_streak) {
            alpFatigueBadge += `<sup style="background: #1e3a5f; color: #7dd3fc; padding: 0 3px; border-radius: 3px; margin-left: 3px; font-size: 0.65em;" title="${slot.alp_night_streak} consecutive night duties">🌙${slot.alp_night_streak}</sup>`;
        }
        if (slot.alp_pr_days) {
            alpFatigueBadge += `<sup style="background: #7c3aed; color: #fff; padding: 0 4px; border-radius: 50%; margin-left: 3px; font-size: 0.65em;" title="${slot.alp_pr_days} consecutive duty days - PR due">${slot.alp_pr_days}</sup>`;
        }
        alpNameHtml = `<span class="clickable-name" style="cursor: pointer; ${alpStyle}"
            onclick="openSlotException(${slot.id}, 'alp', JSON.parse(this.dataset.info))"
            data-info="${alpData}"
            title="Click to mark Late/AUC/NF">${slot.alp_name}${alpBadge}${alpFatigueBadge}</span>`;
    }

    return `
        <tr class="${statusClass} ${slot.is_adhoc ? 'adhoc-row' : ''}" data-slot-id="${slot.id}">
            <td class="loco-cell editable" onclick="editCell(${slot.id}, 'loco_no')">
                ${slot.loco_no || '<span class="empty-slot">--</span>'}
            </td>
            <td class="train-cell editable" onclick="editCell(${slot.id}, 'train_no')">
                ${slot.train_no ? `<span class="badge-train">${slot.train_no}</span>` : '<span class="empty-slot" style="opacity: 0.5;">+ Book</span>'}
            </td>
            <td class="name-cell lp-name">${lpNameHtml}</td>
            <td class="time-cell">${formatTime(slot.slot_time)}</td>
            <td class="name-cell alp-name">
                ${alpNameHtml}
                ${crossSlotInfo}
            </td>
            <td class="train-cell alp-train editable" onclick="editCell(${slot.id}, 'train_no')">
                ${slot.train_no ? `<span class="badge-train">${slot.train_no}</span>` : '<span class="empty-slot" style="opacity: 0.5;">+ Book</span>'}
            </td>
            <td class="loco-cell editable" onclick="editCell(${slot.id}, 'loco_no')">
                ${slot.loco_no || '<span class="empty-slot">--</span>'}
            </td>
        </tr>
    `;
}

// ========== INTERACTIVE EDITING ==========

function editCell(slotId, field) {
    if (isDisplayMode) return;

    // Find the slot
    const slot = findSlotById(slotId);
    if (!slot) return;

    // Open booking modal instead of simple prompt
    openBookingModal(slot);
}

async function updateSlot(slotId, updates) {
    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_id: slotId, ...updates })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Booking updated', 'success');
            loadSlateData(); // Refresh
        } else {
            showToast(data.error || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast('Network error', 'error');
    }
}

function findSlotById(slotId) {
    for (const dateKey of Object.keys(slateData)) {
        for (const shiftCode of Object.keys(slateData[dateKey])) {
            const slot = slateData[dateKey][shiftCode].find(s => s.id === slotId);
            if (slot) return slot;
        }
    }
    return null;
}

// ========== AUC/NF EXCEPTION HELPERS ==========

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function escapeJsonForAttr(obj) {
    // Safely escape JSON for use in HTML onclick attribute
    return JSON.stringify(obj)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

function openSlotException(slotId, staffType, staffInfo) {
    // staffInfo contains: name, slot_time, slot_date, current_exception, current_remark,
    // signed_on_at, late_reason, detention, detention_remark
    openExceptionModal(
        slotId,
        staffType,
        {
            name: staffInfo.name,
            slot_time: staffInfo.slot_time,
            slot_date: staffInfo.slot_date || currentDate,
            current_exception: staffInfo.current_exception || null,
            current_remark: staffInfo.current_remark || null,
            signed_on_at: staffInfo.signed_on_at || null,
            late_reason: staffInfo.late_reason || null,
            detention: staffInfo.detention || null,
            detention_remark: staffInfo.detention_remark || null
        },
        () => loadSlateData() // Refresh after save
    );
}

// ========== STATUS HELPERS ==========

function getRowStatusClass(slot) {
    // Determine overall row status (use LP status as primary)
    const status = slot.lp_status || 'AVAILABLE';
    return getStatusClass(status);
}

function getStatusIcon(slot) {
    const status = slot.lp_status || 'AVAILABLE';
    return getStatusIndicator(status);
}

function truncateName(name) {
    if (!name) return '--';
    // Get first name initial + last name, max 15 chars
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.substring(0, 15).toUpperCase();
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1];
    const truncated = `${first}. ${last}`.toUpperCase();
    return truncated.length > 15 ? truncated.substring(0, 15) : truncated;
}

// ========== VACANCY SUMMARY ==========

function updateVacancySummary(vacancy) {
    const el = document.getElementById('vacancySummary');
    if (!el || !vacancy || !vacancy[currentDate]) return;

    const dateVacancy = vacancy[currentDate];
    const shiftCode = getShiftCode(forceShift ?? currentShiftIndex);
    const lpVacant = dateVacancy.lp[shiftCode] || 0;
    const alpVacant = dateVacancy.alp[shiftCode] || 0;

    el.textContent = `LP: ${lpVacant} vacant | ALP: ${alpVacant} vacant`;
}

// ========== AUTO-REFRESH ==========

function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = setInterval(() => {
        loadSlateData();
        currentShiftIndex = getCurrentShiftIndex();
        updateHeader();

        // Auto-switch shift in display mode if not manually overridden
        if (isDisplayMode && forceShift === null) {
            buildShiftNav();
        }
    }, SLATE_CONFIG.REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// ========== KEYBOARD NAVIGATION ==========

function handleKeyNav(e) {
    switch (e.key) {
        case 'ArrowLeft':
            changeShift(-1);
            break;
        case 'ArrowRight':
            changeShift(1);
            break;
        case 'r':
        case 'R':
            loadSlateData();
            showToast('Refreshed', 'info');
            break;
        case 'Escape':
            closeBookingModal();
            break;
    }
}

// ========== BOOKING MODAL ==========

let bookingModalSlot = null;
let availableAlps = [];

function initBookingModal() {
    if (document.getElementById('bookingModal')) return;

    const modalHtml = `
        <div id="bookingModal" class="modal-overlay">
            <div class="modal-content" style="max-width: 480px;">
                <h3 style="margin: 0 0 15px 0; color: var(--accent); font-size: 1.1rem;">BOOK DETAIL</h3>

                <!-- Slot Info -->
                <div id="bookingSlotInfo" style="margin-bottom: 15px; padding: 10px; background: var(--bg-input); border-radius: 6px; font-size: 0.85rem;"></div>

                <!-- Staff Selection -->
                <div style="margin-bottom: 15px; padding: 10px; background: #0b1120; border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" id="bookLpCheck" checked style="width: 18px; height: 18px; cursor: pointer;">
                        <label for="bookLpCheck" style="cursor: pointer; flex: 1;">
                            <strong>LP:</strong> <span id="bookingLpName">--</span>
                        </label>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="bookAlpCheck" checked style="width: 18px; height: 18px; cursor: pointer;">
                        <label for="bookAlpCheck" style="cursor: pointer; flex: 1;">
                            <strong>ALP:</strong>
                            <select id="alpSelection" style="margin-left: 5px; padding: 4px 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.8rem; min-width: 150px;">
                                <option value="">-- No ALP --</option>
                            </select>
                        </label>
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 0.75rem; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" id="alpOutOfSlate" onchange="toggleAlpSource()">
                            <span style="color: var(--text-muted);">Out of Slate</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" id="alpOtherDepot" onchange="toggleAlpSource()">
                            <span style="color: var(--text-muted);">Other Depot</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                            <input type="checkbox" id="addExtraAlp" onchange="toggleExtraAlp()">
                            <span style="color: var(--accent);">+ Extra ALP</span>
                        </label>
                    </div>
                    <div id="alpManualEntry" style="display: none; margin-top: 10px;">
                        <div style="position: relative;">
                            <input type="text" id="alpManualSearch" placeholder="Search by CMS ID or Name..."
                                   oninput="searchAlpStaff(this.value)"
                                   autocomplete="off"
                                   style="width: 100%; padding: 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.8rem;">
                            <div id="alpSearchResults" style="display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 4px; z-index: 1000;"></div>
                        </div>
                        <div id="alpSelectedStaff" style="display: none; margin-top: 8px; padding: 8px; background: rgba(56, 189, 248, 0.1); border: 1px solid var(--accent); border-radius: 4px; font-size: 0.8rem;">
                            <span id="alpSelectedName" style="font-weight: 600;"></span>
                            <span id="alpSelectedCms" style="color: var(--text-muted); margin-left: 8px;"></span>
                            <button type="button" onclick="clearAlpSelection()" style="float: right; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;">&times;</button>
                        </div>
                        <input type="hidden" id="alpManualCms">
                        <input type="hidden" id="alpManualName">
                        <input type="text" id="alpManualDepot" placeholder="Depot (for Other Depot)" style="display: none; margin-top: 8px; width: 100%; padding: 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.8rem;">
                    </div>
                    <!-- Extra ALP Section -->
                    <div id="extraAlpSection" style="display: none; margin-top: 10px; padding: 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid var(--accent); border-radius: 6px;">
                        <label style="font-size: 0.75rem; color: var(--accent); margin-bottom: 6px; display: block;">Extra ALP</label>
                        <select id="extraAlpSelection" style="width: 100%; padding: 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.8rem;">
                            <option value="">-- Select Extra ALP --</option>
                        </select>
                        <div style="margin-top: 8px; display: flex; gap: 10px; font-size: 0.7rem;">
                            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <input type="checkbox" id="extraAlpOutOfSlate" onchange="toggleExtraAlpSource()">
                                <span style="color: var(--text-muted);">Out of Slate</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <input type="checkbox" id="extraAlpOtherDepot" onchange="toggleExtraAlpSource()">
                                <span style="color: var(--text-muted);">Other Depot</span>
                            </label>
                        </div>
                        <div id="extraAlpManualEntry" style="display: none; margin-top: 8px;">
                            <div style="position: relative;">
                                <input type="text" id="extraAlpManualSearch" placeholder="Search by CMS ID or Name..."
                                       oninput="searchExtraAlpStaff(this.value)"
                                       autocomplete="off"
                                       style="width: 100%; padding: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.75rem;">
                                <div id="extraAlpSearchResults" style="display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 150px; overflow-y: auto; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 4px; z-index: 1000;"></div>
                            </div>
                            <div id="extraAlpSelectedStaff" style="display: none; margin-top: 6px; padding: 6px; background: rgba(56, 189, 248, 0.1); border: 1px solid var(--accent); border-radius: 4px; font-size: 0.75rem;">
                                <span id="extraAlpSelectedName" style="font-weight: 600;"></span>
                                <span id="extraAlpSelectedCms" style="color: var(--text-muted); margin-left: 6px;"></span>
                                <button type="button" onclick="clearExtraAlpSelection()" style="float: right; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem;">&times;</button>
                            </div>
                            <input type="hidden" id="extraAlpManualCms">
                            <input type="hidden" id="extraAlpManualName">
                            <input type="text" id="extraAlpManualDepot" placeholder="Depot" style="display: none; margin-top: 6px; width: 100%; padding: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-size: 0.75rem;">
                        </div>
                    </div>
                </div>

                <!-- Train Details -->
                <div style="margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; display: block;">Train No <span style="color: var(--danger);">*</span></label>
                            <input type="text" id="bookingTrainNo" placeholder="e.g., 12101, LE" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: white; font-family: inherit; font-weight: 600;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; display: block;">Loco No</label>
                            <input type="text" id="bookingLocoNo" placeholder="e.g., 21950+22998" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: white; font-family: inherit;">
                        </div>
                    </div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 10px;">
                        Loco format: 21950 | 22930+22998 | 27227+327+434 | 23451+40413(DE)
                    </div>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 10px;">
                        <input type="checkbox" id="bookingIsPilot" style="width: 16px; height: 16px;">
                        <span style="font-size: 0.85rem;">Pilot</span>
                    </label>
                    <div>
                        <label style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; display: block;">Remarks (optional)</label>
                        <input type="text" id="bookingRemarks" placeholder="Any remarks" style="width: 100%; padding: 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: white; font-family: inherit; font-size: 0.85rem;">
                    </div>
                </div>

                <!-- SAFE Section (hidden by default) -->
                <div id="safeSection" style="display: none; margin-bottom: 15px; padding: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--warning); border-radius: 6px;">
                    <label style="font-size: 0.8rem; color: var(--warning); margin-bottom: 6px; display: block; font-weight: 600;">SAFE Sign-Off Time</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="time" id="safeSignOffTime" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: white; font-family: 'JetBrains Mono', monospace;">
                        <button onclick="confirmSafe()" style="padding: 8px 16px; background: var(--warning); color: #000; border: none; border-radius: 4px; font-weight: 700; cursor: pointer;">Confirm SAFE</button>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="closeBookingModal()" style="padding: 12px 16px; background: var(--bg-input); color: var(--text-muted); border: 1px solid var(--border); border-radius: 6px; font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                    <button id="btnClearBooking" onclick="clearBooking()" style="padding: 12px 16px; background: var(--bg-input); color: var(--danger); border: 1px solid var(--danger); border-radius: 6px; font-weight: 600; cursor: pointer; display: none;">
                        Clear
                    </button>
                    <button onclick="toggleSafeSection()" style="padding: 12px 16px; background: var(--bg-input); color: var(--warning); border: 1px solid var(--warning); border-radius: 6px; font-weight: 600; cursor: pointer;">
                        SAFE
                    </button>
                    <button onclick="saveBooking()" style="flex: 1; padding: 12px; background: var(--accent); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                        Save Booking
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openBookingModal(slot) {
    initBookingModal();
    bookingModalSlot = slot;

    // Set slot info
    document.getElementById('bookingSlotInfo').innerHTML = `
        <strong>Slot:</strong> ${formatTime(slot.slot_time)} | ${slot.slot_date}
        <span style="margin-left: 15px; color: var(--text-muted);">${getShiftLabel(getShiftIndex(parseInt(slot.slot_time.split(':')[0])))}</span>
    `;

    // Set LP info
    const lpName = slot.lp_name || '--';
    document.getElementById('bookingLpName').textContent = lpName;
    document.getElementById('bookLpCheck').checked = !!slot.lp_hrms_id;
    document.getElementById('bookLpCheck').disabled = !slot.lp_hrms_id;

    // Set ALP info - always enable checkbox so user can select different ALP
    document.getElementById('bookAlpCheck').checked = !!slot.alp_hrms_id;
    document.getElementById('bookAlpCheck').disabled = false;  // Allow selecting ALP even if slot has none

    // Load available ALPs
    await loadAvailableAlps(slot);

    // Pre-fill existing booking if any
    document.getElementById('bookingTrainNo').value = slot.train_no || '';
    document.getElementById('bookingLocoNo').value = slot.loco_no || '';
    document.getElementById('bookingIsPilot').checked = slot.is_pilot || false;
    document.getElementById('bookingRemarks').value = slot.booking_remarks || '';

    // Show/hide clear button based on existing booking
    document.getElementById('btnClearBooking').style.display = slot.train_no ? 'block' : 'none';

    // Reset SAFE section
    document.getElementById('safeSection').style.display = 'none';
    document.getElementById('safeSignOffTime').value = '';

    // Reset ALP source checkboxes
    document.getElementById('alpOutOfSlate').checked = false;
    document.getElementById('alpOtherDepot').checked = false;
    document.getElementById('alpManualEntry').style.display = 'none';
    document.getElementById('alpManualDepot').style.display = 'none';

    // Reset Extra ALP
    document.getElementById('addExtraAlp').checked = false;
    document.getElementById('extraAlpSection').style.display = 'none';
    document.getElementById('extraAlpOutOfSlate').checked = false;
    document.getElementById('extraAlpOtherDepot').checked = false;
    document.getElementById('extraAlpManualEntry').style.display = 'none';
    document.getElementById('extraAlpSelection').innerHTML = '<option value="">-- Select Extra ALP --</option>';

    // Show modal
    document.getElementById('bookingModal').style.display = 'flex';

    // Focus on train number field
    setTimeout(() => document.getElementById('bookingTrainNo').focus(), 100);
}

async function loadAvailableAlps(slot) {
    const select = document.getElementById('alpSelection');
    console.log('[DEBUG] loadAvailableAlps called for slot:', slot.id, 'slot_date:', slot.slot_date);

    // Ensure dropdown is visible
    select.style.display = 'inline-block';

    // Clear existing options
    select.innerHTML = '';

    // Add "No ALP" option
    const noAlpOption = document.createElement('option');
    noAlpOption.value = '';
    noAlpOption.textContent = '-- No ALP --';
    select.appendChild(noAlpOption);

    // Add current ALP if exists
    if (slot.alp_hrms_id && slot.alp_name) {
        const currentOption = document.createElement('option');
        currentOption.value = slot.alp_hrms_id;
        currentOption.dataset.slotId = slot.id;
        currentOption.textContent = `${slot.alp_name} (Current)`;
        currentOption.selected = true;
        select.appendChild(currentOption);
    }

    try {
        // Format date properly - always use formatDateKey to handle timezone correctly
        // slot.slot_date from API is ISO string like "2026-03-05T18:30:00.000Z" which is UTC
        // We need the local date, not the UTC date
        const dateStr = formatDateKey(new Date(slot.slot_date));
        console.log('[DEBUG] Fetching ALPs for date:', dateStr, 'exclude_slot_id:', slot.id);
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/available-alp?office_code=${SLATE_CONFIG.OFFICE_CODE}&date=${dateStr}&exclude_slot_id=${slot.id}`);
        const data = await res.json();
        console.log('[DEBUG] API response:', data.success, 'count:', data.count, 'data length:', data.data?.length, 'raw data:', data);

        if (data.success && data.data && data.data.length > 0) {
            availableAlps = data.data;
            console.log('[DEBUG] Adding', data.data.length, 'ALPs to dropdown');

            // Add separator
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '── Other Available ALPs ──';
            select.appendChild(separator);

            data.data.forEach(alp => {
                const option = document.createElement('option');
                option.value = alp.alp_hrms_id;
                option.dataset.slotId = alp.slot_id;
                const statusBadge = alp.alp_status === 'BOOKED' ? ' (Booked)' : '';
                const timeStr = formatTime(alp.slot_time);
                option.textContent = `${alp.alp_name} @ ${timeStr}${statusBadge}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading available ALPs:', error);
    }
}

function toggleAlpSource() {
    const outOfSlate = document.getElementById('alpOutOfSlate').checked;
    const otherDepot = document.getElementById('alpOtherDepot').checked;

    // Only one can be checked
    if (outOfSlate && otherDepot) {
        // If both checked, uncheck the other
        document.getElementById('alpOtherDepot').checked = false;
    }

    const showManual = outOfSlate || otherDepot;
    document.getElementById('alpManualEntry').style.display = showManual ? 'block' : 'none';
    document.getElementById('alpSelection').style.display = showManual ? 'none' : 'inline-block';
    document.getElementById('alpManualDepot').style.display = otherDepot ? 'block' : 'none';

    // Reset search state when toggling
    if (showManual) {
        clearAlpSelection();
        document.getElementById('alpManualSearch').value = '';
    }
}

// ALP Staff Search with debounce
let alpSearchTimeout = null;
async function searchAlpStaff(query) {
    const resultsDiv = document.getElementById('alpSearchResults');
    const isOtherDepot = document.getElementById('alpOtherDepot').checked;

    // Clear previous timeout
    if (alpSearchTimeout) clearTimeout(alpSearchTimeout);

    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    // Debounce - wait 300ms before searching
    alpSearchTimeout = setTimeout(async () => {
        try {
            // For Other Depot, search all depots; otherwise search only our depot
            const officeParam = isOtherDepot ? 'all' : SLATE_CONFIG.OFFICE_CODE;
            const res = await fetch(`${SLATE_CONFIG.API_BASE}/staff/search?office_code=${officeParam}&q=${encodeURIComponent(query)}&type=alp`);
            const data = await res.json();

            if (data.success && data.data.length > 0) {
                resultsDiv.innerHTML = data.data.map(staff => `
                    <div onclick="selectAlpStaff('${staff.hrms_id}', '${staff.name.replace(/'/g, "\\'")}', '${staff.current_cms_id || ''}', '${staff.current_office_code || ''}')"
                         style="padding: 8px 10px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.2s;"
                         onmouseover="this.style.background='var(--bg-input)'"
                         onmouseout="this.style.background='transparent'">
                        <div style="font-weight: 600; font-size: 0.85rem;">${staff.name}</div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">
                            ${staff.current_cms_id || 'No CMS'} | ${staff.designation_name || 'ALP'}
                            ${staff.current_office_code && staff.current_office_code !== SLATE_CONFIG.OFFICE_CODE ? ' | <span style="color: var(--warning);">' + staff.current_office_code + '</span>' : ''}
                            ${staff.current_night_streak >= 3 ? ' | 🌙' + staff.current_night_streak : ''}
                        </div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                // No match - allow manual entry with the search query as name
                resultsDiv.innerHTML = `
                    <div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">
                        No matching staff in our depot
                    </div>
                    <div onclick="selectAlpStaffManual('${query.replace(/'/g, "\\'")}')"
                         style="padding: 8px 10px; cursor: pointer; border-top: 1px solid var(--border); background: rgba(251, 191, 36, 0.1);"
                         onmouseover="this.style.background='rgba(251, 191, 36, 0.2)'"
                         onmouseout="this.style.background='rgba(251, 191, 36, 0.1)'">
                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--warning);">+ Add "${query}" manually</div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">For Other Depot staff not in system</div>
                    </div>
                `;
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error searching staff:', error);
            resultsDiv.style.display = 'none';
        }
    }, 300);
}

function selectAlpStaff(hrmsId, name, cmsId, depot) {
    // Set hidden fields
    document.getElementById('alpManualCms').value = hrmsId;
    document.getElementById('alpManualName').value = name;
    // Set depot field if Other Depot
    if (depot && depot !== SLATE_CONFIG.OFFICE_CODE) {
        document.getElementById('alpManualDepot').value = depot;
    }

    // Show selected staff
    document.getElementById('alpSelectedName').textContent = name;
    const depotBadge = depot && depot !== SLATE_CONFIG.OFFICE_CODE ? ` (${depot})` : '';
    document.getElementById('alpSelectedCms').textContent = (cmsId || hrmsId) + depotBadge;
    document.getElementById('alpSelectedStaff').style.display = 'block';

    // Hide search
    document.getElementById('alpManualSearch').style.display = 'none';
    document.getElementById('alpSearchResults').style.display = 'none';
}

function selectAlpStaffManual(name) {
    // Set only name (no HRMS ID for external staff)
    document.getElementById('alpManualCms').value = '';
    document.getElementById('alpManualName').value = name;

    // Show selected staff with "External" badge
    document.getElementById('alpSelectedName').textContent = name;
    document.getElementById('alpSelectedCms').textContent = '(External)';
    document.getElementById('alpSelectedStaff').style.display = 'block';

    // Hide search
    document.getElementById('alpManualSearch').style.display = 'none';
    document.getElementById('alpSearchResults').style.display = 'none';
}

function clearAlpSelection() {
    document.getElementById('alpManualCms').value = '';
    document.getElementById('alpManualName').value = '';
    document.getElementById('alpSelectedStaff').style.display = 'none';
    document.getElementById('alpManualSearch').style.display = 'block';
    document.getElementById('alpManualSearch').value = '';
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    // Main ALP search
    const searchInput = document.getElementById('alpManualSearch');
    const resultsDiv = document.getElementById('alpSearchResults');
    if (searchInput && resultsDiv && !searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
        resultsDiv.style.display = 'none';
    }
    // Extra ALP search
    const extraSearch = document.getElementById('extraAlpManualSearch');
    const extraResults = document.getElementById('extraAlpSearchResults');
    if (extraSearch && extraResults && !extraSearch.contains(e.target) && !extraResults.contains(e.target)) {
        extraResults.style.display = 'none';
    }
});

function toggleExtraAlp() {
    const checked = document.getElementById('addExtraAlp').checked;
    document.getElementById('extraAlpSection').style.display = checked ? 'block' : 'none';

    if (checked && bookingModalSlot) {
        // Populate extra ALP dropdown with available ALPs
        loadExtraAlpOptions();
    }
}

async function loadExtraAlpOptions() {
    const select = document.getElementById('extraAlpSelection');
    select.innerHTML = '<option value="">-- Select Extra ALP --</option>';

    // Add available ALPs from the already loaded list
    availableAlps.forEach(alp => {
        const statusBadge = alp.alp_status === 'BOOKED' ? ' (Booked)' : '';
        const timeStr = formatTime(alp.slot_time);
        select.innerHTML += `<option value="${alp.alp_hrms_id}" data-slot-id="${alp.slot_id}">${alp.alp_name} @ ${timeStr}${statusBadge}</option>`;
    });
}

function toggleExtraAlpSource() {
    const outOfSlate = document.getElementById('extraAlpOutOfSlate').checked;
    const otherDepot = document.getElementById('extraAlpOtherDepot').checked;

    // Only one can be checked
    if (outOfSlate && otherDepot) {
        document.getElementById('extraAlpOtherDepot').checked = false;
    }

    const showManual = outOfSlate || otherDepot;
    document.getElementById('extraAlpManualEntry').style.display = showManual ? 'block' : 'none';
    document.getElementById('extraAlpSelection').style.display = showManual ? 'none' : 'block';
    document.getElementById('extraAlpManualDepot').style.display = otherDepot ? 'block' : 'none';

    // Reset search state when toggling
    if (showManual) {
        clearExtraAlpSelection();
        document.getElementById('extraAlpManualSearch').value = '';
    }
}

// Extra ALP Staff Search
let extraAlpSearchTimeout = null;
async function searchExtraAlpStaff(query) {
    const resultsDiv = document.getElementById('extraAlpSearchResults');
    const isOtherDepot = document.getElementById('extraAlpOtherDepot').checked;

    if (extraAlpSearchTimeout) clearTimeout(extraAlpSearchTimeout);

    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    extraAlpSearchTimeout = setTimeout(async () => {
        try {
            // For Other Depot, search all depots
            const officeParam = isOtherDepot ? 'all' : SLATE_CONFIG.OFFICE_CODE;
            const res = await fetch(`${SLATE_CONFIG.API_BASE}/staff/search?office_code=${officeParam}&q=${encodeURIComponent(query)}&type=alp`);
            const data = await res.json();

            if (data.success && data.data.length > 0) {
                resultsDiv.innerHTML = data.data.map(staff => `
                    <div onclick="selectExtraAlpStaff('${staff.hrms_id}', '${staff.name.replace(/'/g, "\\'")}', '${staff.current_cms_id || ''}', '${staff.current_office_code || ''}')"
                         style="padding: 6px 8px; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 0.75rem;"
                         onmouseover="this.style.background='var(--bg-input)'"
                         onmouseout="this.style.background='transparent'">
                        <div style="font-weight: 600;">${staff.name}</div>
                        <div style="color: var(--text-muted); font-size: 0.7rem;">
                            ${staff.current_cms_id || 'No CMS'}
                            ${staff.current_office_code && staff.current_office_code !== SLATE_CONFIG.OFFICE_CODE ? ' | <span style="color: var(--warning);">' + staff.current_office_code + '</span>' : ''}
                        </div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = `
                    <div style="padding: 8px; color: var(--text-muted); font-size: 0.75rem;">No matching staff</div>
                    <div onclick="selectExtraAlpStaffManual('${query.replace(/'/g, "\\'")}')"
                         style="padding: 6px 8px; cursor: pointer; border-top: 1px solid var(--border); background: rgba(251, 191, 36, 0.1); font-size: 0.75rem;"
                         onmouseover="this.style.background='rgba(251, 191, 36, 0.2)'"
                         onmouseout="this.style.background='rgba(251, 191, 36, 0.1)'">
                        <div style="font-weight: 600; color: var(--warning);">+ Add "${query}" manually</div>
                    </div>
                `;
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error searching extra ALP:', error);
            resultsDiv.style.display = 'none';
        }
    }, 300);
}

function selectExtraAlpStaff(hrmsId, name, cmsId, depot) {
    document.getElementById('extraAlpManualCms').value = hrmsId;
    document.getElementById('extraAlpManualName').value = name;
    if (depot && depot !== SLATE_CONFIG.OFFICE_CODE) {
        document.getElementById('extraAlpManualDepot').value = depot;
    }
    document.getElementById('extraAlpSelectedName').textContent = name;
    const depotBadge = depot && depot !== SLATE_CONFIG.OFFICE_CODE ? ` (${depot})` : '';
    document.getElementById('extraAlpSelectedCms').textContent = (cmsId || hrmsId) + depotBadge;
    document.getElementById('extraAlpSelectedStaff').style.display = 'block';
    document.getElementById('extraAlpManualSearch').style.display = 'none';
    document.getElementById('extraAlpSearchResults').style.display = 'none';
}

function selectExtraAlpStaffManual(name) {
    document.getElementById('extraAlpManualCms').value = '';
    document.getElementById('extraAlpManualName').value = name;
    document.getElementById('extraAlpSelectedName').textContent = name;
    document.getElementById('extraAlpSelectedCms').textContent = '(External)';
    document.getElementById('extraAlpSelectedStaff').style.display = 'block';
    document.getElementById('extraAlpManualSearch').style.display = 'none';
    document.getElementById('extraAlpSearchResults').style.display = 'none';
}

function clearExtraAlpSelection() {
    document.getElementById('extraAlpManualCms').value = '';
    document.getElementById('extraAlpManualName').value = '';
    document.getElementById('extraAlpSelectedStaff').style.display = 'none';
    document.getElementById('extraAlpManualSearch').style.display = 'block';
    document.getElementById('extraAlpManualSearch').value = '';
}

function toggleSafeSection() {
    const section = document.getElementById('safeSection');
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        // Set default time to current time
        const now = new Date();
        document.getElementById('safeSignOffTime').value =
            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        document.getElementById('safeSignOffTime').focus();
    }
}

async function saveBooking() {
    if (!bookingModalSlot) return;

    const trainNo = document.getElementById('bookingTrainNo').value.trim();
    const locoNo = document.getElementById('bookingLocoNo').value.trim();
    const isPilot = document.getElementById('bookingIsPilot').checked;
    const remarks = document.getElementById('bookingRemarks').value.trim();
    const bookLp = document.getElementById('bookLpCheck').checked;
    const bookAlp = document.getElementById('bookAlpCheck').checked;

    if (!trainNo) {
        showToast('Train number is required', 'error');
        document.getElementById('bookingTrainNo').focus();
        return;
    }

    if (!bookLp && !bookAlp) {
        showToast('Select at least LP or ALP to book', 'error');
        return;
    }

    const payload = {
        slot_id: bookingModalSlot.id,
        train_no: trainNo,
        loco_no: locoNo || null,
        is_pilot: isPilot,
        booking_remarks: remarks || null,
        book_lp: bookLp,
        book_alp: bookAlp
    };

    // Handle ALP selection
    const outOfSlate = document.getElementById('alpOutOfSlate').checked;
    const otherDepot = document.getElementById('alpOtherDepot').checked;

    if (bookAlp) {
        if (outOfSlate || otherDepot) {
            payload.alp_source = otherDepot ? 'OTHER_DEPOT' : 'OUT_OF_SLATE';
            payload.alp_hrms_id = document.getElementById('alpManualCms').value.trim() || null;
            payload.alp_source_name = document.getElementById('alpManualName').value.trim() || null;
            if (otherDepot) {
                payload.alp_source_depot = document.getElementById('alpManualDepot').value.trim() || null;
            }
        } else {
            const alpSelect = document.getElementById('alpSelection');
            const selectedOption = alpSelect.options[alpSelect.selectedIndex];
            if (selectedOption && selectedOption.value) {
                payload.alp_hrms_id = selectedOption.value;
                payload.alp_original_slot_id = selectedOption.dataset.slotId || null;
                payload.alp_source = 'SLATE';
            }
        }
    }

    // Handle Extra ALP
    const addExtraAlp = document.getElementById('addExtraAlp').checked;
    if (addExtraAlp) {
        const extraOutOfSlate = document.getElementById('extraAlpOutOfSlate').checked;
        const extraOtherDepot = document.getElementById('extraAlpOtherDepot').checked;

        if (extraOutOfSlate || extraOtherDepot) {
            payload.extra_alp_source = extraOtherDepot ? 'OTHER_DEPOT' : 'OUT_OF_SLATE';
            payload.extra_alp_hrms_id = document.getElementById('extraAlpManualCms').value.trim() || null;
            payload.extra_alp_source_name = document.getElementById('extraAlpManualName').value.trim() || null;
            if (extraOtherDepot) {
                payload.extra_alp_source_depot = document.getElementById('extraAlpManualDepot').value.trim() || null;
            }
        } else {
            const extraAlpSelect = document.getElementById('extraAlpSelection');
            const selectedOption = extraAlpSelect.options[extraAlpSelect.selectedIndex];
            if (selectedOption && selectedOption.value) {
                payload.extra_alp_hrms_id = selectedOption.value;
                payload.extra_alp_original_slot_id = selectedOption.dataset.slotId || null;
                payload.extra_alp_source = 'SLATE';
            }
        }
    }

    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            showToast('Booking saved', 'success');
            closeBookingModal();
            loadSlateData();
        } else {
            showToast(data.error || 'Failed to save booking', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showToast('Network error', 'error');
    }
}

async function confirmSafe() {
    if (!bookingModalSlot) return;

    const signOffTime = document.getElementById('safeSignOffTime').value;
    const bookLp = document.getElementById('bookLpCheck').checked;
    const bookAlp = document.getElementById('bookAlpCheck').checked;

    if (!signOffTime) {
        showToast('Sign-off time is required for SAFE', 'error');
        document.getElementById('safeSignOffTime').focus();
        return;
    }

    if (!bookLp && !bookAlp) {
        showToast('Select at least LP or ALP to mark SAFE', 'error');
        return;
    }

    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slot_id: bookingModalSlot.id,
                mark_safe: true,
                safe_sign_off_time: signOffTime,
                book_lp: bookLp,
                book_alp: bookAlp
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Marked as SAFE', 'success');
            closeBookingModal();
            loadSlateData();
        } else {
            showToast(data.error || 'Failed to mark SAFE', 'error');
        }
    } catch (error) {
        console.error('SAFE error:', error);
        showToast('Network error', 'error');
    }
}

async function clearBooking() {
    if (!bookingModalSlot) return;

    if (!confirm('Clear this booking?')) return;

    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slot_id: bookingModalSlot.id,
                clear_booking: true
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Booking cleared', 'info');
            closeBookingModal();
            loadSlateData();
        } else {
            showToast(data.error || 'Failed to clear booking', 'error');
        }
    } catch (error) {
        console.error('Clear booking error:', error);
        showToast('Network error', 'error');
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
    bookingModalSlot = null;
}

// ========== EXCEPTION MODAL ==========

let currentExceptionData = null;
let exceptionCallback = null;

/**
 * Initialize exception modal (create DOM element if not exists)
 */
function initExceptionModal() {
    if (document.getElementById('exceptionModal')) return;

    const modalHtml = `
        <div id="exceptionModal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 id="exceptionModalTitle" style="margin: 0; color: var(--accent); font-size: 1.1rem;">Staff Name</h3>
                    <button onclick="closeExceptionModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div id="exceptionModalInfo" style="margin-bottom: 15px; color: var(--text-muted); font-size: 0.85rem;"></div>
                <div id="exceptionOptions" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Add CSS for modal if not exists
    if (!document.getElementById('exceptionModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'exceptionModalStyles';
        styles.textContent = `
            .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .modal-overlay:not(.active) { display: none; }
            .modal-content { background: var(--bg-panel); padding: 20px; border-radius: 8px; border: 1px solid var(--border); }
        `;
        document.head.appendChild(styles);
    }
}

/**
 * Open exception modal for staff
 */
function openExceptionModal(slotId, staffType, data, callback) {
    currentExceptionData = { slotId, staffType, ...data };
    exceptionCallback = callback;

    const modal = document.getElementById('exceptionModal');
    const title = document.getElementById('exceptionModalTitle');
    const info = document.getElementById('exceptionModalInfo');
    const options = document.getElementById('exceptionOptions');

    title.textContent = data.name;
    info.innerHTML = `Slot: ${data.slot_date} @ ${data.slot_time}<br>Type: ${staffType.toUpperCase()}`;

    const canDelete = !data.signed_on_at && !data.current_exception;
    const isSignedOn = !!data.signed_on_at;
    const signOnTime = data.signed_on_at ? formatTime(data.signed_on_at) : '';

    let buttonsHtml = '';

    // Late arrival section - show for both signed on and not signed on
    buttonsHtml += `
        <div style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: var(--accent);">Late Arrival</div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                <label style="width: 80px; color: var(--text-muted);">Sign-On:</label>
                <input type="time" id="lateSignOnTime" value="${signOnTime}" style="flex: 1; padding: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: var(--text-main);">
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                <label style="width: 80px; color: var(--text-muted);">Reason:</label>
                <input type="text" id="lateReason" value="${data.late_reason || ''}" placeholder="Reason for late" style="flex: 1; padding: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: var(--text-main);">
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" id="trainDetained" ${data.detention === 'YES' ? 'checked' : ''}>
                    <span style="color: var(--warning);">Train Detained</span>
                </label>
            </div>
            <div id="detentionRemarkDiv" style="display: ${data.detention === 'YES' ? 'flex' : 'none'}; gap: 8px; align-items: center; margin-bottom: 8px;">
                <label style="width: 80px; color: var(--text-muted);">Remark:</label>
                <input type="text" id="detentionRemark" value="${data.detention_remark || ''}" placeholder="Detention details" style="flex: 1; padding: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; color: var(--text-main);">
            </div>
            <button onclick="saveLateArrival()" style="width: 100%; padding: 10px; background: #22d3ee; color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                Save Late Arrival
            </button>
        </div>
    `;

    if (!isSignedOn) {
        buttonsHtml += `
            <button onclick="markException('AUC')" style="padding: 12px; background: var(--warning); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                Mark AUC (Unable to Come)
            </button>
            <button onclick="markException('NF')" style="padding: 12px; background: var(--danger); color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                Mark NF (Not Found)
            </button>
        `;
        if (canDelete) {
            buttonsHtml += `
                <button onclick="deleteFromModal()" style="padding: 12px; background: #7f1d1d; color: #fca5a5; border: 1px solid var(--danger); border-radius: 6px; font-weight: 700; cursor: pointer;">
                    Remove from Slot
                </button>
            `;
        }
    }

    if (data.current_exception) {
        info.innerHTML += `<br><span style="color: var(--warning);">Current: ${data.current_exception}</span>`;
        buttonsHtml += `
            <button onclick="clearException()" style="padding: 12px; background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border); border-radius: 6px; font-weight: 600; cursor: pointer;">
                Clear Exception
            </button>
        `;
    }

    options.innerHTML = buttonsHtml;
    modal.style.display = 'flex';
    modal.classList.add('active');

    // Toggle detention remark visibility
    document.getElementById('trainDetained').addEventListener('change', function() {
        document.getElementById('detentionRemarkDiv').style.display = this.checked ? 'flex' : 'none';
    });
}

function closeExceptionModal() {
    const modal = document.getElementById('exceptionModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    currentExceptionData = null;
    exceptionCallback = null;
}

async function markException(exceptionType) {
    if (!currentExceptionData) return;

    const { slotId, staffType } = currentExceptionData;

    try {
        const payload = {};
        if (staffType === 'lp') {
            payload.lp_exception = exceptionType;
        } else {
            payload.alp_exception = exceptionType;
        }

        const res = await fetch(`${SLATE_CONFIG.API_BASE}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_id: slotId, ...payload })
        });
        const data = await res.json();

        if (data.success) {
            showToast(`Marked as ${exceptionType}`, 'success');
            closeExceptionModal();
            if (exceptionCallback) exceptionCallback();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (err) {
        console.error('Exception error:', err);
        showToast('Network error', 'error');
    }
}

async function clearException() {
    if (!currentExceptionData) return;

    const { slotId, staffType } = currentExceptionData;

    try {
        const payload = {};
        if (staffType === 'lp') {
            payload.lp_exception = null;
        } else {
            payload.alp_exception = null;
        }

        const res = await fetch(`${SLATE_CONFIG.API_BASE}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_id: slotId, ...payload })
        });
        const data = await res.json();

        if (data.success) {
            showToast('Exception cleared', 'success');
            closeExceptionModal();
            if (exceptionCallback) exceptionCallback();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (err) {
        console.error('Clear exception error:', err);
        showToast('Network error', 'error');
    }
}

async function saveLateArrival() {
    if (!currentExceptionData) return;

    const { slotId, staffType } = currentExceptionData;
    const signOnTime = document.getElementById('lateSignOnTime').value;
    const lateReason = document.getElementById('lateReason').value.trim();
    const trainDetained = document.getElementById('trainDetained').checked;
    const detentionRemark = document.getElementById('detentionRemark').value.trim();

    if (!signOnTime) {
        showToast('Please enter sign-on time', 'error');
        return;
    }

    try {
        const payload = { slot_id: slotId };

        if (staffType === 'lp') {
            payload.lp_signed_on_at = signOnTime;
            payload.lp_late_reason = lateReason || null;
            payload.lp_detention = trainDetained ? 'YES' : 'NO';
            payload.lp_detention_remark = trainDetained ? detentionRemark : null;
        } else {
            payload.alp_signed_on_at = signOnTime;
            payload.alp_late_reason = lateReason || null;
            payload.alp_detention = trainDetained ? 'YES' : 'NO';
            payload.alp_detention_remark = trainDetained ? detentionRemark : null;
        }

        const res = await fetch(`${SLATE_CONFIG.API_BASE}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            showToast('Late arrival saved', 'success');
            closeExceptionModal();
            if (exceptionCallback) exceptionCallback();
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (err) {
        console.error('Save late arrival error:', err);
        showToast('Network error', 'error');
    }
}
