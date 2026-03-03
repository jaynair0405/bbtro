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
        lpNameHtml = `<span class="clickable-name" style="cursor: pointer; ${lpStyle}"
            onclick="openSlotException(${slot.id}, 'lp', JSON.parse(this.dataset.info))"
            data-info="${lpData}"
            title="Click to mark Late/AUC/NF">${slot.lp_name}${lpBadge}</span>`;
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
        alpNameHtml = `<span class="clickable-name" style="cursor: pointer; ${alpStyle}"
            onclick="openSlotException(${slot.id}, 'alp', JSON.parse(this.dataset.info))"
            data-info="${alpData}"
            title="Click to mark Late/AUC/NF">${slot.alp_name}${alpBadge}</span>`;
    }

    return `
        <tr class="${statusClass} ${slot.is_adhoc ? 'adhoc-row' : ''}" data-slot-id="${slot.id}">
            <td class="loco-cell editable" onclick="editCell(${slot.id}, 'loco_no')">
                ${slot.loco_no || '<span class="empty-slot">--</span>'}
            </td>
            <td class="train-cell editable" onclick="editCell(${slot.id}, 'train_no')">
                ${slot.train_no ? `<span class="badge-train">${slot.train_no}</span>` : '<span class="empty-slot">+ Book</span>'}
            </td>
            <td class="name-cell lp-name">${lpNameHtml}</td>
            <td class="time-cell">${formatTime(slot.slot_time)}</td>
            <td class="name-cell alp-name">
                ${alpNameHtml}
                ${crossSlotInfo}
            </td>
            <td class="train-cell editable" onclick="editCell(${slot.id}, 'train_no')">
                ${slot.train_no ? `<span class="badge-train">${slot.train_no}</span>` : '<span class="empty-slot">+ Book</span>'}
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

    const currentValue = slot[field] || '';
    const newValue = prompt(`Enter ${field === 'train_no' ? 'Train No.' : 'Loco No.'}:`, currentValue);

    if (newValue !== null && newValue !== currentValue) {
        updateSlot(slotId, { [field]: newValue || null });
    }
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
    }
}
