const KIOSK_SLATE_CONFIG = {
    API_BASE: '/api/kiosk/slate',
    REFRESH_INTERVAL: 30000,
    DISPLAY_TITLES: {
        'pnvl-office': 'PNVL BOOKING SLATE'
    }
};

let slateData = {};
let vacancyData = {};
let dateOffset = 0;
let currentDate = formatDateKey(new Date());
let currentShiftIndex = getCurrentShiftIndex();
let forceShift = null;
let refreshTimer = null;
let clockTimer = null;
let idleTimer = null;
let displayId = '';
let kioskToken = '';

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

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    kioskToken = (urlParams.get('token') || '').trim();
    displayId = getDisplayIdFromPath();
    forceShift = urlParams.has('shift') ? parseInt(urlParams.get('shift'), 10) : null;

    if (urlParams.get('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    updateTitle();
    buildDateNav();
    buildShiftNav();
    updateHeader();
    startClock();
    loadSlateData();
    startAutoRefresh();

    document.addEventListener('keydown', handleKeyNav);
});

function getDisplayIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'pnvl-office';
}

function updateTitle() {
    const title = KIOSK_SLATE_CONFIG.DISPLAY_TITLES[displayId] || 'CRTMS SLATE KIOSK';
    document.title = title;
    const titleEl = document.getElementById('headerTitle');
    if (titleEl) titleEl.textContent = title;
}

function getSafetySlogan() {
    const dayOfMonth = new Date().getDate();
    return SAFETY_SLOGANS[(dayOfMonth - 1) % SAFETY_SLOGANS.length];
}

function renderSafetyFooter() {
    return `<div class="safety-footer"><div class="slogan">${getSafetySlogan()}</div></div>`;
}

function startClock() {
    stopClock();
    clockTimer = setInterval(updateHeader, 1000);
}

function stopClock() {
    if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
    }
}

function updateHeader() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    updateHeaderDate();
    document.getElementById('headerTime').textContent = timeStr;
    document.getElementById('headerShift').textContent = getShiftLabel(forceShift ?? currentShiftIndex);
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

function buildShiftNav() {
    const nav = document.getElementById('shiftNav');
    const shiftColors = ['shift-night', 'shift-day', 'shift-evening'];
    const shiftLabels = ['00-08', '08-16', '16-24'];
    const shiftIcons = ['N', 'D', 'E'];
    const activeShift = forceShift ?? currentShiftIndex;

    nav.innerHTML = `
        <button class="nav-btn" onclick="changeShift(-1)" title="Previous Shift">‹</button>
        <div class="shift-tabs">
            ${[0, 1, 2].map((index) => `
                <button class="shift-tab ${shiftColors[index]} ${index === activeShift ? 'active' : ''}"
                        onclick="selectShift(${index})">
                    ${shiftIcons[index]} ${shiftLabels[index]}
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
    updateVacancySummary();
    resetIdleTimer();
}

function changeShift(delta) {
    const current = forceShift ?? currentShiftIndex;
    const newShift = (current + delta + 3) % 3;
    selectShift(newShift);
}

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        forceShift = null;
        currentShiftIndex = getCurrentShiftIndex();
        buildShiftNav();
        renderCurrentShift();
        updateVacancySummary();
    }, 60000);
}

function buildDateNav() {
    const nav = document.getElementById('dateNav');
    const today = new Date();

    nav.innerHTML = [-1, 0, 1].map((offset) => {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + offset);

        const label = `${targetDate.getDate()} ${targetDate.toLocaleDateString('en-IN', { month: 'short' })} (${targetDate.toLocaleDateString('en-IN', { weekday: 'short' })})`;

        return `
            <button class="date-btn ${offset === dateOffset ? 'active' : ''}"
                    onclick="changeDate(${offset})"
                    data-offset="${offset}">
                ${label}
            </button>
        `;
    }).join('');
}

function changeDate(offset) {
    dateOffset = offset;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + offset);
    currentDate = formatDateKey(baseDate);

    buildDateNav();
    updateHeaderDate();
    loadSlateData();
}

function getBoardUrl() {
    const params = new URLSearchParams({
        token: kioskToken,
        date: currentDate,
        days: '1'
    });
    return `${KIOSK_SLATE_CONFIG.API_BASE}/${encodeURIComponent(displayId)}/board?${params.toString()}`;
}

async function loadSlateData() {
    if (!kioskToken) {
        const message = 'Missing kiosk token in the page URL.';
        showStatus(message, 'error');
        renderNoData(message);
        return;
    }

    try {
        const response = await fetch(getBoardUrl(), { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            const message = data.error || `Failed to load slate data (${response.status})`;
            showStatus(message, 'error');
            if (!hasAnyLoadedData()) {
                renderNoData(message);
            }
            return;
        }

        hideStatus();
        slateData = data.board || {};
        vacancyData = data.vacancy || {};
        renderCurrentShift();
        updateVacancySummary();
    } catch (error) {
        console.error('Kiosk slate load error:', error);
        const message = 'Network error while loading the slate.';
        showStatus(message, 'error');
        if (!hasAnyLoadedData()) {
            renderNoData(message);
        }
    }
}

function hasAnyLoadedData() {
    return Object.values(slateData).some((dateEntry) =>
        Object.values(dateEntry || {}).some((slots) => Array.isArray(slots) && slots.length > 0)
    );
}

function renderNoData(message) {
    const container = document.getElementById('slateContent');
    container.innerHTML = `<div class="no-data">${message}</div>`;
}

function renderCurrentShift() {
    const shiftIndex = forceShift ?? currentShiftIndex;
    const shiftCode = getShiftCode(shiftIndex);
    const dateData = slateData[currentDate] || {};
    const slots = dateData[shiftCode] || [];

    renderDisplayMode(slots, shiftIndex);
}

function renderDisplayMode(slots, shiftIndex) {
    const container = document.getElementById('slateContent');
    const startHour = shiftIndex * 8;
    const midHour = startHour + 4;

    const firstHalf = slots.filter((slot) => {
        const hour = parseInt(slot.slot_time.split(':')[0], 10);
        return hour >= startHour && hour < midHour;
    });

    const secondHalf = slots.filter((slot) => {
        const hour = parseInt(slot.slot_time.split(':')[0], 10);
        return hour >= midHour && hour < startHour + 8;
    });

    const shiftColors = ['--shift-night', '--shift-day', '--shift-evening'];
    const firstLabel = `${String(startHour).padStart(2, '0')}:00 - ${String(midHour).padStart(2, '0')}:00`;
    const secondLabel = `${String(midHour).padStart(2, '0')}:00 - ${String(startHour + 8).padStart(2, '0')}:00`;

    const renderHalfTable = (halfSlots, label) => `
        <div class="interactive-half">
            <div class="half-header" style="border-color: var(${shiftColors[shiftIndex]})">${label}</div>
            <table class="slate-table">
                <thead>
                    <tr>
                        <th class="lp-header" colspan="3">LP</th>
                        <th class="time-header">TIME</th>
                        <th class="alp-header" colspan="3">ALP</th>
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
                    ${halfSlots.map((slot) => renderCompactRow(slot)).join('')}
                    ${halfSlots.length === 0 ? '<tr><td colspan="7" class="no-data-cell">No slots</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = `
        <div class="interactive-grid">
            ${renderHalfTable(firstHalf, firstLabel)}
            ${renderHalfTable(secondHalf, secondLabel)}
        </div>
        ${renderSafetyFooter()}
    `;
}

function renderCompactRow(slot) {
    const statusClass = getRowStatusClass(slot);
    const crossSlotInfo = slot.alp_cross_slot_time ? `<span class="cross-link">↳ ${formatTime(slot.alp_cross_slot_time)}</span>` : '';

    let lpName = slot.lp_name ? escapeHtml(slot.lp_name) : '<span class="empty-slot">--</span>';
    let alpName = slot.alp_name ? escapeHtml(slot.alp_name) : '<span class="empty-slot">--</span>';

    const lpSignedOnTime = formatTime(slot.lp_signed_on_at);
    const isLpLate = slot.lp_signed_on_at && lpSignedOnTime !== '--' &&
        isLateArrival(slot.slot_date, slot.slot_time, slot.lp_signed_on_at);

    const alpSignedOnTime = formatTime(slot.alp_signed_on_at);
    const isAlpLate = slot.alp_signed_on_at && alpSignedOnTime !== '--' &&
        isLateArrival(slot.slot_date, slot.slot_time, slot.alp_signed_on_at);

    if (isLpLate) {
        lpName += `<br><sub class="status-sub late-sub">@ ${lpSignedOnTime}</sub>`;
    } else if (slot.lp_exception === 'AUC') {
        lpName += ' <sup class="status-sup warning-sup">AUC</sup>';
    } else if (slot.lp_exception === 'NF') {
        lpName += ' <sup class="status-sup danger-sup">NF</sup>';
    }

    if (isAlpLate) {
        alpName += `<br><sub class="status-sub late-sub">@ ${alpSignedOnTime}</sub>`;
    } else if (slot.alp_exception === 'AUC') {
        alpName += ' <sup class="status-sup warning-sup">AUC</sup>';
    } else if (slot.alp_exception === 'NF') {
        alpName += ' <sup class="status-sup danger-sup">NF</sup>';
    }

    return `
        <tr class="${statusClass} ${slot.is_adhoc ? 'adhoc-row' : ''}">
            <td class="loco-cell">${slot.loco_no || '<span class="empty-slot">--</span>'}</td>
            <td class="train-cell">${slot.train_no || '<span class="empty-slot">--</span>'}</td>
            <td class="name-cell lp-name">${lpName}</td>
            <td class="time-cell">${formatTime(slot.slot_time)}</td>
            <td class="name-cell alp-name">${alpName}${crossSlotInfo}</td>
            <td class="train-cell">${slot.train_no || '<span class="empty-slot">--</span>'}</td>
            <td class="loco-cell">${slot.loco_no || '<span class="empty-slot">--</span>'}</td>
        </tr>
    `;
}

function getRowStatusClass(slot) {
    const status = slot.lp_status || slot.alp_status || 'AVAILABLE';
    return getStatusClass(status);
}

function getStatusIcon(slot) {
    const status = slot.lp_status || slot.alp_status || 'AVAILABLE';
    return getStatusIndicator(status);
}

function truncateName(name) {
    if (!name) return '--';

    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.substring(0, 15).toUpperCase();

    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1];
    const truncated = `${first}. ${last}`.toUpperCase();

    return truncated.length > 15 ? truncated.substring(0, 15) : truncated;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isLateArrival(slotDate, slotTime, signedOnAt) {
    if (!slotDate || !slotTime || !signedOnAt) return false;

    const slotDateTime = new Date(`${slotDate}T${formatTime(slotTime)}:00`);
    const signedOnDateTime = new Date(signedOnAt.replace(' ', 'T'));

    if (Number.isNaN(slotDateTime.getTime()) || Number.isNaN(signedOnDateTime.getTime())) {
        return false;
    }

    return signedOnDateTime.getTime() > slotDateTime.getTime();
}

function updateVacancySummary(source = vacancyData) {
    const el = document.getElementById('vacancySummary');
    if (!el || !source || !source[currentDate]) return;

    const shiftCode = getShiftCode(forceShift ?? currentShiftIndex);
    const lpVacant = source[currentDate].lp[shiftCode] || 0;
    const alpVacant = source[currentDate].alp[shiftCode] || 0;

    el.textContent = `LP: ${lpVacant} vacant | ALP: ${alpVacant} vacant`;
}

function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = setInterval(() => {
        currentShiftIndex = getCurrentShiftIndex();
        updateHeader();

        if (forceShift === null) {
            buildShiftNav();
        }

        loadSlateData();
    }, KIOSK_SLATE_CONFIG.REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

function handleKeyNav(event) {
    switch (event.key) {
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
        default:
            break;
    }
}

function showStatus(message, type = 'info') {
    const banner = document.getElementById('statusBanner');
    banner.textContent = message;
    banner.className = `status-banner ${type}`;
}

function hideStatus() {
    const banner = document.getElementById('statusBanner');
    banner.textContent = '';
    banner.className = 'status-banner hidden';
}
