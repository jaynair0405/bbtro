/**
 * Detail Book - Jr CC Interface for logging arrivals and assigning slots
 * Central Railway Mumbai Division - Digital Slate System
 * Depends on: slate-common.js
 */

// ========== STATE VARIABLES ==========
let activeCrews = [];
let pendingSafeEntries = []; // SAFE entries from Slate pending processing
let selectedLP = null;
let selectedALP = null;
let isManualMode = false;
const dateGroups = {}; // Stores date -> { element, tables }
let pendingPayload = null;
let collisionInfo = null;
let selectedSafeLogId = null; // Track which SAFE entry is being processed

// Warning state - blocks submission if hard errors exist
let lpWarnings = [];
let alpWarnings = [];
let lpCanAssign = true;
let alpCanAssign = true;
let isCheckingWarnings = false;  // True while API call is in-flight

// Leave confirmation state
let pendingLeaveConfirm = null;  // { type: 'lp'|'alp', hrms_id, name, callback }

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Update header with current date
    const headerInfo = document.getElementById('headerInfo');
    const dateStr = TODAY.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    headerInfo.textContent = `Office: ${SLATE_CONFIG.OFFICE_CODE} | Date: ${dateStr}`;

    // Keyboard navigation
    const scroll = document.getElementById('forecastScroll');
    scroll.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { scrollForecast(1); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { scrollForecast(-1); e.preventDefault(); }
    });

    // Initialize date dropdowns
    populateDateDropdowns();

    // Initialize with 11 days: yesterday (-1) through +9 days ahead
    for (let offset = -1; offset <= 9; offset++) {
        const date = new Date(TODAY.getTime());
        date.setDate(date.getDate() + offset);
        ensureDateGroup(formatDateKey(date));
    }

    // Load pending SAFE entries from Slate
    await loadPendingSafe();

    // Load active crews from API
    await loadActiveCrews();

    // Load existing slate data
    await loadSlateData();

    // Setup staff search for manual entry
    setupStaffSearch();

    // Initialize exception modal for AUC/NF marking
    initExceptionModal();

    // Attach date picker blur handlers
    document.getElementById('lpDatePicker').addEventListener('blur', () => handleDatePickerBlur('lp'));
    document.getElementById('alpDatePicker').addEventListener('blur', () => handleDatePickerBlur('alp'));

    // Attach rest rule change handlers for leave validation
    document.getElementById('lpRest').addEventListener('change', (e) => handleRestChange('lp', e.target.value));
    document.getElementById('alpRest').addEventListener('change', (e) => handleRestChange('alp', e.target.value));

    // Initialize scroll listener for date tab sync
    initScrollListener();

    // Mark today's tab as active and scroll to it
    setTimeout(() => {
        const todayStr = formatDateKey(TODAY);
        scrollToDate(todayStr);
    }, 200);
});

// ========== API: LOAD SLATE DATA ==========
async function loadSlateData() {
    try {
        // Fetch 11 days starting from yesterday (-1 to +9)
        const yesterday = new Date(TODAY.getTime());
        yesterday.setDate(yesterday.getDate() - 1);
        const data = await fetchSlateBoard(SLATE_CONFIG.OFFICE_CODE, 11, formatDateKey(yesterday));

        if (data.success && data.board) {
            // Iterate through each date and populate slots
            for (const dateStr of Object.keys(data.board).sort()) {
                ensureDateGroup(dateStr);

                const shifts = data.board[dateStr];
                for (const shiftCode of Object.keys(shifts)) {
                    const slots = shifts[shiftCode];
                    for (const slot of slots) {
                        // Format slot time (remove seconds)
                        const slotTime = slot.slot_time?.substring(0, 5);
                        if (!slotTime) continue;

                        // Check if this is an adhoc slot
                        const isAdhocSlot = slot.is_adhoc > 0;

                        // Add LP if exists
                        if (slot.lp_name) {
                            addStaffToSlate({
                                slotId: slot.id,
                                name: slot.lp_name,
                                type: 'LP',
                                time: slotTime,
                                date: dateStr,
                                isAdhoc: isAdhocSlot,
                                exception: slot.lp_exception,
                                exceptionRemark: slot.lp_exception_remark,
                                signedOnAt: slot.lp_signed_on_at,
                                lateReason: slot.lp_late_reason,
                                detention: slot.lp_detention,
                                detentionRemark: slot.lp_detention_remark,
                                incoming: slot.lp_incoming,
                                incomingLoco: slot.lp_incoming_loco,
                                isPilot: slot.lp_is_pilot,
                                signOffTime: slot.lp_sign_off_time,
                                nightStreak: slot.lp_night_streak,
                                prDays: slot.lp_pr_days
                            });
                        }

                        // Add ALP if exists
                        if (slot.alp_name) {
                            addStaffToSlate({
                                slotId: slot.id,
                                name: slot.alp_name,
                                type: 'ALP',
                                time: slotTime,
                                date: dateStr,
                                isAdhoc: isAdhocSlot,
                                exception: slot.alp_exception,
                                exceptionRemark: slot.alp_exception_remark,
                                signedOnAt: slot.alp_signed_on_at,
                                lateReason: slot.alp_late_reason,
                                detention: slot.alp_detention,
                                detentionRemark: slot.alp_detention_remark,
                                incoming: slot.alp_incoming,
                                incomingLoco: slot.alp_incoming_loco,
                                isPilot: slot.alp_is_pilot,
                                signOffTime: slot.alp_sign_off_time,
                                nightStreak: slot.alp_night_streak,
                                prDays: slot.alp_pr_days
                            });
                        }
                    }
                }
            }

            // Update vacancy counts
            updateDateTabs();
        }
    } catch (err) {
        console.error('Error loading slate data:', err);
    }
}

// ========== API: LOAD PENDING SAFE ENTRIES ==========
async function loadPendingSafe() {
    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/pending-safe?office_code=${SLATE_CONFIG.OFFICE_CODE}`);
        const data = await res.json();

        if (data.success) {
            pendingSafeEntries = data.data;
            renderPendingSafe();
        } else {
            console.error('Failed to load pending SAFE:', data.error);
        }
    } catch (err) {
        console.error('Error loading pending SAFE:', err);
    }
}

function renderPendingSafe() {
    // Find or create the pending SAFE container
    let container = document.getElementById('pendingSafeContainer');

    if (!container) {
        // Create container above the crew cards section
        const crewSection = document.querySelector('.active-crews-scroll');
        if (!crewSection) return;

        container = document.createElement('div');
        container.id = 'pendingSafeContainer';
        container.style.cssText = 'margin-bottom: 10px; position: sticky; top: 0; z-index: 10; background: var(--bg-panel);';
        crewSection.parentNode.insertBefore(container, crewSection);
    }

    if (pendingSafeEntries.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    const cardsHtml = pendingSafeEntries.map(entry => {
        const signOffTime = formatTime(entry.sign_off_time);
        const lpName = entry.lp_name || '--';
        const alpName = entry.alp_name || 'No ALP';

        return `
            <div class="safe-pending-card" onclick="selectSafeEntry(${entry.id})"
                 style="display: inline-block; padding: 8px 12px; margin-right: 8px; margin-bottom: 5px;
                        background: rgba(245, 158, 11, 0.15); border: 2px solid var(--warning);
                        border-radius: 6px; cursor: pointer; animation: safeBlink 1s infinite;
                        min-width: 120px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--warning);">⚠️ SAFE</div>
                <div style="font-size: 0.8rem; color: var(--text-main);">${lpName}</div>
                ${entry.alp_hrms_id ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${alpName}</div>` : ''}
                <div style="font-size: 0.65rem; color: var(--accent); margin-top: 2px;">Sign-off: ${signOffTime}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div style="font-size: 0.7rem; font-weight: 700; color: var(--warning); margin-bottom: 5px; text-transform: uppercase;">
            Pending SAFE from Slate (Click to Process)
        </div>
        <div style="display: flex; flex-wrap: wrap;">${cardsHtml}</div>
    `;
}

// Add CSS for blinking animation
if (!document.getElementById('safeBlinkStyle')) {
    const style = document.createElement('style');
    style.id = 'safeBlinkStyle';
    style.textContent = `
        @keyframes safeBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
}

function selectSafeEntry(logId) {
    const entry = pendingSafeEntries.find(e => e.id === logId);
    if (!entry) return;

    selectedSafeLogId = logId;

    // Enable manual mode first (this resets form)
    enableManualEntry();

    // Now override with SAFE entry data
    // Show dropdowns instead of search inputs
    const lpSelect = document.getElementById('lpSelect');
    const alpSelect = document.getElementById('alpSelect');
    const lpInput = document.getElementById('lpSearchInput');
    const alpInput = document.getElementById('alpSearchInput');

    // Hide search inputs, show dropdowns
    if (lpInput) lpInput.style.display = 'none';
    if (alpInput) alpInput.style.display = 'none';
    lpSelect.style.display = 'block';
    alpSelect.style.display = 'block';

    // Fill in the LP dropdown
    lpSelect.innerHTML = `<option value="${entry.lp_hrms_id}" selected data-hrms="${entry.lp_hrms_id}" data-name="${entry.lp_name}">${entry.lp_name} (${entry.lp_cms_id || 'SAFE'})</option>`;
    selectedLP = { hrms_id: entry.lp_hrms_id, name: entry.lp_name, cms_id: entry.lp_cms_id };

    // Fill in ALP if exists
    if (entry.alp_hrms_id) {
        alpSelect.innerHTML = `
            <option value="none">[ No ALP / Single Man ]</option>
            <option value="${entry.alp_hrms_id}" selected data-hrms="${entry.alp_hrms_id}" data-name="${entry.alp_name}">${entry.alp_name} (${entry.alp_cms_id || ''})</option>
        `;
        selectedALP = { hrms_id: entry.alp_hrms_id, name: entry.alp_name, cms_id: entry.alp_cms_id };
    } else {
        alpSelect.innerHTML = `<option value="none">[ No ALP / Single Man ]</option>`;
        selectedALP = null;
    }

    // Set incoming detail as SAFE
    document.getElementById('incomingTrain').value = 'SAFE';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('isPilot').checked = false;

    // Extract and set sign-on time (when staff started duty)
    const signOnTime = formatTime(entry.sign_on_time);
    if (signOnTime !== '--') {
        document.getElementById('signOn').value = signOnTime;
    }

    // Extract and set sign-off time
    const signOffTime = formatTime(entry.sign_off_time);
    if (signOffTime !== '--') {
        document.getElementById('signOff').value = signOffTime;
    }

    // Set sign-off date to today (SAFE was from slate today)
    document.getElementById('signOffDate').value = 'today';

    // Set off reason since coming from SAFE (not from working train)
    document.getElementById('offReason').value = 'off/rest';

    // Calculate slots
    calculateSlotsManual();

    showToast('SAFE entry loaded - fill rest details and submit', 'info');
}

// ========== API: LOAD ACTIVE CREWS ==========
async function loadActiveCrews() {
    try {
        const data = await fetchActiveCrews(SLATE_CONFIG.OFFICE_CODE);

        if (data.success) {
            activeCrews = data.data;
            renderActiveCrewCards();
        } else {
            console.error('Failed to load active crews:', data.error);
        }
    } catch (err) {
        console.error('Error loading active crews:', err);
    }
}

function renderActiveCrewCards() {
    const container = document.querySelector('.active-crews-scroll');

    // Generate cards from API data
    let cardsHtml = activeCrews.map(crew => {
        // Build leave warning badges for LP and ALP separately
        const leaveWarnings = [];
        if (crew.lp_leave_warning) {
            const status = crew.lp_leave_warning.status === 'Approved' ? 'Appr' : 'Pend';
            leaveWarnings.push(`LP:${status}`);
        }
        if (crew.alp_leave_warning) {
            const status = crew.alp_leave_warning.status === 'Approved' ? 'Appr' : 'Pend';
            leaveWarnings.push(`ALP:${status}`);
        }
        const warningHtml = leaveWarnings.length > 0
            ? `<div style="font-size: 0.65rem; color: var(--danger); margin-top: 4px; font-weight:bold;">⚠️ Leave: ${leaveWarnings.join(', ')}</div>`
            : '';

        // Build night streak indicators (🌙 with number for 4+ nights)
        const lpNightBadge = crew.lp_night_streak
            ? `<span style="font-size: 0.6rem; background: #1e3a5f; color: #7dd3fc; padding: 1px 4px; border-radius: 3px; margin-left: 4px;" title="${crew.lp_night_streak} consecutive night duties">🌙${crew.lp_night_streak}</span>`
            : '';
        const alpNightBadge = crew.alp_night_streak
            ? `<span style="font-size: 0.6rem; background: #1e3a5f; color: #7dd3fc; padding: 1px 4px; border-radius: 3px; margin-left: 4px;" title="${crew.alp_night_streak} consecutive night duties">🌙${crew.alp_night_streak}</span>`
            : '';

        // Build PR indicators (circle with number for 6+ consecutive duty days)
        const lpPRBadge = crew.lp_pr_days
            ? `<span style="font-size: 0.6rem; background: #7c3aed; color: #fff; padding: 1px 5px; border-radius: 50%; margin-left: 4px;" title="${crew.lp_pr_days} consecutive duty days - PR due">${crew.lp_pr_days}</span>`
            : '';
        const alpPRBadge = crew.alp_pr_days
            ? `<span style="font-size: 0.6rem; background: #7c3aed; color: #fff; padding: 1px 5px; border-radius: 50%; margin-left: 4px;" title="${crew.alp_pr_days} consecutive duty days - PR due">${crew.alp_pr_days}</span>`
            : '';

        // Check if LP or ALP is already assigned to future slot
        const lpAssigned = crew.lp_already_assigned;
        const alpAssigned = crew.alp_already_assigned;

        // Style for already-assigned staff: strikethrough + muted color + badge
        const lpStyle = lpAssigned ? 'text-decoration: line-through; color: var(--text-muted);' : '';
        const alpStyle = alpAssigned ? 'text-decoration: line-through; color: var(--text-muted);' : '';

        // Badge showing where they're assigned
        const lpBadge = lpAssigned
            ? `<span style="font-size: 0.6rem; background: var(--warning); color: #000; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">@ ${lpAssigned.date.substring(5)} ${lpAssigned.time}</span>`
            : '';
        const alpBadge = alpAssigned
            ? `<span style="font-size: 0.6rem; background: var(--warning); color: #000; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">@ ${alpAssigned.date.substring(5)} ${alpAssigned.time}</span>`
            : '';

        // If both assigned, dim the entire card
        const bothAssigned = lpAssigned && (alpAssigned || !crew.alp_hrms_id);
        const cardOpacity = bothAssigned ? 'opacity: 0.5; pointer-events: none;' : '';

        return `
            <div class="crew-card" onclick="selectCrewCard(${crew.slate_id})" style="${cardOpacity}">
                <div class="card-train">${crew.train_no || '--'} / ${crew.loco_no || '--'}</div>
                <div class="card-crew" style="${lpStyle}">LP: ${crew.lp_name || '--'}${lpBadge}${lpNightBadge}${lpPRBadge}</div>
                <div class="card-crew" style="${alpStyle}">ALP: ${crew.alp_name || 'No ALP'}${alpBadge}${alpNightBadge}${alpPRBadge}</div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">Sign-on: ${crew.slot_time?.substring(0,5) || '--'} (${crew.duty_hours}h ago)</div>
                ${warningHtml}
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHtml;

    // Show message if no crews
    if (activeCrews.length === 0) {
        container.innerHTML = `
            <div style="color: var(--text-muted); padding: 20px; font-size: 0.85rem;">
                No crews currently online (5+ hours). Use Manual Entry button above.
            </div>
        `;
    }
}

// Filter crew cards by name or CMS ID
function filterCrewCards(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll('.crew-card');

    cards.forEach((card, index) => {
        const crew = activeCrews[index];
        if (!crew) return;

        const searchableText = [
            crew.lp_name,
            crew.alp_name,
            crew.lp_cms_id,
            crew.alp_cms_id,
            crew.train_no,
            crew.loco_no
        ].filter(Boolean).join(' ').toLowerCase();

        if (!term || searchableText.includes(term)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========== CLICK-TO-ARRIVE ==========
function selectCrewCard(slateId) {
    const crew = activeCrews.find(c => c.slate_id === slateId);
    if (!crew) return;

    // Check if both LP and ALP are already assigned
    const lpAssigned = crew.lp_already_assigned;
    const alpAssigned = crew.alp_already_assigned;
    const bothAssigned = lpAssigned && (alpAssigned || !crew.alp_hrms_id);

    if (bothAssigned) {
        alert('Both LP and ALP are already assigned to future slots. Cannot sign off.');
        return;
    }

    // Exit manual mode
    isManualMode = false;

    // Hide off reason row, show duty time row
    document.getElementById('dutyTimeRow').style.display = 'grid';
    document.getElementById('offReasonRow').style.display = 'none';
    document.getElementById('incomingTrain').placeholder = 'Train No.';

    // Reset manual entry button style
    const manualBtn = document.getElementById('manualEntryBtn');
    if (manualBtn) {
        manualBtn.style.background = 'var(--bg-input)';
        manualBtn.style.color = 'var(--text-muted)';
        manualBtn.style.borderStyle = 'dashed';
    }

    // Hide search inputs, show selects
    const lpInput = document.getElementById('lpSearchInput');
    const alpInput = document.getElementById('alpSearchInput');
    if (lpInput) lpInput.style.display = 'none';
    if (alpInput) alpInput.style.display = 'none';

    // Only populate staff that are NOT already assigned to future slots
    const lpSelect = document.getElementById('lpSelect');
    const alpSelect = document.getElementById('alpSelect');
    const lpRestGroup = document.getElementById('lpRest').closest('.form-row');
    const alpRestGroup = document.getElementById('alpRest').closest('.form-row');

    if (lpAssigned) {
        // LP is already assigned - don't populate, show warning
        selectedLP = null;
        lpSelect.innerHTML = `<option value="none" selected style="color: var(--warning);">[LP Already @ ${lpAssigned.date.substring(5)} ${lpAssigned.time}]</option>`;
        lpSelect.disabled = true;
        document.getElementById('lpRest').value = 'suspend';
        lpRestGroup.style.opacity = '0.4';
        lpRestGroup.style.pointerEvents = 'none';
    } else {
        // LP is available - populate normally
        selectedLP = { hrms_id: crew.lp_hrms_id, name: crew.lp_name, cms_id: crew.lp_cms_id, source_slate_id: crew.slate_id };
        lpSelect.innerHTML = `<option value="${crew.lp_hrms_id}" selected>${crew.lp_name} (${crew.lp_cms_id})</option>`;
        lpSelect.disabled = true;
        document.getElementById('lpRest').value = '16';
        lpRestGroup.style.opacity = '1';
        lpRestGroup.style.pointerEvents = 'auto';
    }

    if (alpAssigned) {
        // ALP is already assigned - don't populate, show warning
        selectedALP = null;
        alpSelect.innerHTML = `<option value="none" selected style="color: var(--warning);">[ALP Already @ ${alpAssigned.date.substring(5)} ${alpAssigned.time}]</option>`;
        alpSelect.disabled = true;
        document.getElementById('alpRest').value = 'suspend';
        alpRestGroup.style.opacity = '0.4';
        alpRestGroup.style.pointerEvents = 'none';
    } else if (crew.alp_hrms_id) {
        // ALP exists and is available - populate normally
        selectedALP = { hrms_id: crew.alp_hrms_id, name: crew.alp_name, cms_id: crew.alp_cms_id, source_slate_id: crew.slate_id };
        alpSelect.innerHTML = `
            <option value="none">[ No ALP / Single Man ]</option>
            <option value="${crew.alp_hrms_id}" selected>${crew.alp_name} (${crew.alp_cms_id})</option>
        `;
        alpSelect.disabled = true;
        document.getElementById('alpRest').value = '16';
        alpRestGroup.style.opacity = '1';
        alpRestGroup.style.pointerEvents = 'auto';
    } else {
        // No ALP on this crew
        selectedALP = null;
        alpSelect.innerHTML = `<option value="none" selected>[ No ALP / Single Man ]</option>`;
        alpSelect.disabled = true;
        alpRestGroup.style.opacity = '0.4';
        alpRestGroup.style.pointerEvents = 'none';
    }

    // Fill form - RESET all fields including sign-off
    document.getElementById('incomingTrain').value = '';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('signOn').value = crew.slot_time?.substring(0, 5) || '';
    document.getElementById('signOff').value = '';  // Reset sign-off
    document.getElementById('signOffDate').value = 'today';  // Reset to today

    // Reset slot fields
    document.getElementById('lpNextSlot').value = '';
    document.getElementById('alpNextSlot').value = '';
    document.getElementById('lpSlotDate').selectedIndex = 0;
    document.getElementById('alpSlotDate').selectedIndex = 0;
    document.getElementById('lpSlotDateLabel').textContent = '';
    document.getElementById('alpSlotDateLabel').textContent = '';

    // Clear warnings
    document.getElementById('lpAlert').className = 'alert';
    document.getElementById('lpAlert').innerHTML = '';
    document.getElementById('alpAlert').className = 'alert';
    document.getElementById('alpAlert').innerHTML = '';
    lpWarnings = [];
    alpWarnings = [];
    lpCanAssign = true;
    alpCanAssign = true;

    // Check for warnings from card data (leave warnings)
    checkStaffWarnings(crew);

    // Visual Flash - only flash fields that are being populated
    const flashFields = ['incomingTrain', 'incomingLoco', 'signOn'];
    if (!lpAssigned) flashFields.push('lpSelect');
    if (!alpAssigned && crew.alp_hrms_id) flashFields.push('alpSelect');
    flashFields.forEach(id => flashHighlight(document.getElementById(id)));

    document.getElementById('signOff').focus();
}

function checkStaffWarnings(crew) {
    // Initial check from crew card data (basic leave warning)
    const alertBox = document.getElementById('lpAlert');
    alertBox.className = "alert";
    alertBox.innerHTML = "";

    if (crew.lp_leave_warning) {
        alertBox.classList.add("danger");
        alertBox.innerHTML = `⚠️ LP LEAVE ${crew.lp_leave_warning.status.toUpperCase()}: ${crew.lp_leave_warning.leave_type} from ${crew.lp_leave_warning.from_date}`;
        document.getElementById('lpRest').value = "suspend";
        calculateSlots();
    }
}

/**
 * Comprehensive staff warnings check - calls API for detailed validation
 * Called after slot calculation to verify assignment is allowed
 */
async function checkStaffWarningsComprehensive() {
    const lpSlotDate = getLpSlotDate();
    const alpSlotDate = getAlpSlotDate();
    const lpRest = document.getElementById('lpRest').value;
    const alpRest = document.getElementById('alpRest').value;

    // Reset warning state
    lpWarnings = [];
    alpWarnings = [];
    lpCanAssign = true;
    alpCanAssign = true;

    // Check LP warnings if not on multi-day leave
    if (selectedLP && lpRest !== 'suspend' && lpSlotDate) {
        try {
            const res = await fetch(`${SLATE_CONFIG.API_BASE}/staff-warnings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hrms_id: selectedLP.hrms_id,
                    next_slot_date: lpSlotDate,
                    office_code: SLATE_CONFIG.OFFICE_CODE
                })
            });
            const data = await res.json();
            if (data.success) {
                lpWarnings = data.warnings || [];
                lpCanAssign = data.can_assign;

                // Auto-suggest PR if needed
                if (data.needs_pr && lpRest === '16') {
                    document.getElementById('lpRest').value = '30';
                    calculateSlots();
                    showToast('LP needs Periodic Rest (30hr) - auto-selected', 'info');
                }
            }
        } catch (err) {
            console.error('Error checking LP warnings:', err);
        }
    }

    // Check ALP warnings if not on multi-day leave
    if (selectedALP && alpRest !== 'suspend' && alpSlotDate) {
        try {
            const res = await fetch(`${SLATE_CONFIG.API_BASE}/staff-warnings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hrms_id: selectedALP.hrms_id,
                    next_slot_date: alpSlotDate,
                    office_code: SLATE_CONFIG.OFFICE_CODE
                })
            });
            const data = await res.json();
            if (data.success) {
                alpWarnings = data.warnings || [];
                alpCanAssign = data.can_assign;

                // Auto-suggest PR if needed
                if (data.needs_pr && alpRest === '16') {
                    document.getElementById('alpRest').value = '30';
                    calculateSlots();
                    showToast('ALP needs Periodic Rest (30hr) - auto-selected', 'info');
                }
            }
        } catch (err) {
            console.error('Error checking ALP warnings:', err);
        }
    }

    // Clear checking state and display warnings
    isCheckingWarnings = false;
    displayWarnings();
}

function getLpSlotDate() {
    const lpDatePicker = document.getElementById('lpDatePicker');
    const lpSlotDate = document.getElementById('lpSlotDate');

    if (lpDatePicker.style.display !== 'none' && lpDatePicker.value) {
        return lpDatePicker.value;
    }
    const val = lpSlotDate.value;
    if (val && val !== 'pick') {
        return val;
    }
    return null;
}

function getAlpSlotDate() {
    const alpDatePicker = document.getElementById('alpDatePicker');
    const alpSlotDate = document.getElementById('alpSlotDate');

    if (alpDatePicker.style.display !== 'none' && alpDatePicker.value) {
        return alpDatePicker.value;
    }
    const val = alpSlotDate.value;
    if (val && val !== 'pick') {
        return val;
    }
    return null;
}

function displayWarnings() {
    const lpAlertBox = document.getElementById('lpAlert');
    const alpAlertBox = document.getElementById('alpAlert');

    // Clear previous
    lpAlertBox.className = 'alert';
    lpAlertBox.innerHTML = '';
    alpAlertBox.className = 'alert';
    alpAlertBox.innerHTML = '';

    // Display LP warnings
    if (lpWarnings.length > 0) {
        const hasError = lpWarnings.some(w => w.level === 'error');
        lpAlertBox.classList.add(hasError ? 'danger' : 'warning');
        lpAlertBox.innerHTML = lpWarnings.map(w =>
            `<div>${w.level === 'error' ? '🚫' : '⚠️'} ${w.message}</div>`
        ).join('');
    }

    // Display ALP warnings
    if (alpWarnings.length > 0) {
        const hasError = alpWarnings.some(w => w.level === 'error');
        alpAlertBox.classList.add(hasError ? 'danger' : 'warning');
        alpAlertBox.innerHTML = alpWarnings.map(w =>
            `<div>${w.level === 'error' ? '🚫' : '⚠️'} ${w.message}</div>`
        ).join('');
    }

    // Update submit button state
    updateSubmitButtonState();
}

/**
 * Update submit button state based on warnings and checking status
 */
function updateSubmitButtonState() {
    const submitBtn = document.querySelector('.btn-submit');
    if (!submitBtn) return;

    if (isCheckingWarnings) {
        // Still checking - show loading state
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.innerHTML = '<span style="opacity: 0.7;">Checking...</span>';
        submitBtn.title = 'Verifying staff availability...';
    } else if (!lpCanAssign || !alpCanAssign) {
        // Errors found - blocked
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.innerHTML = 'Save Arrival & Update Forecast';
        submitBtn.title = 'Cannot submit - resolve errors above';
    } else {
        // All clear
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = 'Save Arrival & Update Forecast';
        submitBtn.title = '';
    }
}

// ========== MANUAL ENTRY MODE ==========
function enableManualEntry() {
    isManualMode = true;
    selectedLP = null;
    selectedALP = null;

    // Reset form fields
    document.getElementById('incomingTrain').value = '';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('signOn').value = '';
    document.getElementById('signOff').value = '';
    document.getElementById('signOffDate').value = 'today';
    document.getElementById('lpNextSlot').value = '';
    document.getElementById('alpNextSlot').value = '';

    // Reset pilot fields
    document.getElementById('isPilot').checked = false;
    document.getElementById('pilotStation').value = '';
    document.getElementById('pilotStationGroup').style.display = 'none';

    // Reset date selectors and pickers
    document.getElementById('lpSlotDate').selectedIndex = 0;
    document.getElementById('alpSlotDate').selectedIndex = 0;
    document.getElementById('lpSlotDate').style.display = 'block';
    document.getElementById('alpSlotDate').style.display = 'block';
    document.getElementById('lpDatePicker').style.display = 'none';
    document.getElementById('alpDatePicker').style.display = 'none';
    document.getElementById('lpDatePicker').value = '';
    document.getElementById('alpDatePicker').value = '';
    document.getElementById('lpSlotDateLabel').textContent = '';
    document.getElementById('alpSlotDateLabel').textContent = '';

    document.getElementById('lpAlert').className = 'alert';
    document.getElementById('lpAlert').innerHTML = '';
    document.getElementById('alpAlert').className = 'alert';
    document.getElementById('alpAlert').innerHTML = '';
    document.getElementById('lpRest').value = '16';
    document.getElementById('alpRest').value = '16';

    // Reset warning state
    lpWarnings = [];
    alpWarnings = [];
    lpCanAssign = true;
    alpCanAssign = true;
    isCheckingWarnings = false;

    // Reset submit button
    updateSubmitButtonState();

    // Show both rows
    document.getElementById('dutyTimeRow').style.display = 'grid';
    document.getElementById('offReasonRow').style.display = 'grid';

    // Update labels
    document.getElementById('incomingTrain').placeholder = 'Train No. (or use Off Reason below)';

    // Update current time display
    updateCurrentTimeDisplay();

    // Highlight manual mode button
    document.getElementById('manualEntryBtn').style.background = 'var(--accent)';
    document.getElementById('manualEntryBtn').style.color = '#000';
    document.getElementById('manualEntryBtn').style.borderStyle = 'solid';

    // Show search inputs, hide selects
    const lpSelect = document.getElementById('lpSelect');
    const alpSelect = document.getElementById('alpSelect');
    const lpInput = document.getElementById('lpSearchInput');
    const alpInput = document.getElementById('alpSearchInput');

    lpSelect.style.display = 'none';
    alpSelect.style.display = 'none';

    if (lpInput) {
        lpInput.style.display = 'block';
        lpInput.value = '';
    }
    if (alpInput) {
        alpInput.style.display = 'block';
        alpInput.value = '';
    }

    // Calculate slots from current time
    calculateSlotsManual();

    // Focus on LP search
    if (lpInput) lpInput.focus();
}

// ========== DATE SELECTOR FOR SLOTS ==========
function populateDateDropdowns() {
    const lpDateSelect = document.getElementById('lpSlotDate');
    const alpDateSelect = document.getElementById('alpSlotDate');
    const lpDatePicker = document.getElementById('lpDatePicker');
    const alpDatePicker = document.getElementById('alpDatePicker');

    // Build options: Today, Tomorrow, Day After (with date), then "Pick Date..."
    let options = '';
    for (let i = 0; i <= 2; i++) {
        const date = new Date(TODAY.getTime());
        date.setDate(date.getDate() + i);
        const dateStr = formatDateKey(date);
        let label = '';
        if (i === 0) label = 'Today';
        else if (i === 1) label = 'Tomorrow';
        else label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        options += `<option value="${dateStr}">${label}</option>`;
    }
    // Add "Pick Date..." option
    options += `<option value="pick">Pick Date...</option>`;

    lpDateSelect.innerHTML = options;
    alpDateSelect.innerHTML = options;

    // Set min/max on date pickers
    const minDate = formatDateKey(TODAY);
    const maxDate = new Date(TODAY.getTime());
    maxDate.setDate(maxDate.getDate() + SLATE_CONFIG.MAX_ADVANCE_DAYS);
    const maxDateStr = formatDateKey(maxDate);

    lpDatePicker.min = minDate;
    lpDatePicker.max = maxDateStr;
    alpDatePicker.min = minDate;
    alpDatePicker.max = maxDateStr;
}

function handleDateSelect(type) {
    const dateSelect = document.getElementById(type === 'lp' ? 'lpSlotDate' : 'alpSlotDate');
    const datePicker = document.getElementById(type === 'lp' ? 'lpDatePicker' : 'alpDatePicker');

    if (dateSelect.value === 'pick') {
        // Set default value to tomorrow
        const tomorrow = new Date(TODAY.getTime());
        tomorrow.setDate(tomorrow.getDate() + 1);
        datePicker.value = formatDateKey(tomorrow);

        // Show date picker, hide select
        dateSelect.style.display = 'none';
        datePicker.style.display = 'block';
        datePicker.focus();

        // Auto-open the calendar picker (modern browsers)
        setTimeout(() => {
            if (typeof datePicker.showPicker === 'function') {
                try {
                    datePicker.showPicker();
                } catch (e) {
                    // Some browsers may throw if not triggered by user gesture
                    console.log('Auto-open picker not supported');
                }
            }
        }, 100);
    }
}

function applyPickedDate(type) {
    const dateSelect = document.getElementById(type === 'lp' ? 'lpSlotDate' : 'alpSlotDate');
    const datePicker = document.getElementById(type === 'lp' ? 'lpDatePicker' : 'alpDatePicker');
    const label = document.getElementById(type === 'lp' ? 'lpSlotDateLabel' : 'alpSlotDateLabel');

    const pickedDateRaw = datePicker.value;

    if (pickedDateRaw) {
        // Parse and validate the date
        const date = new Date(pickedDateRaw + 'T00:00:00');

        if (isNaN(date.getTime())) {
            console.error('Invalid date from picker:', pickedDateRaw);
            datePicker.style.display = 'none';
            dateSelect.style.display = 'block';
            dateSelect.selectedIndex = 0;
            return;
        }

        const pickedDate = formatDateKey(date);
        const displayLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        // Check if option already exists
        let found = false;
        for (let opt of dateSelect.options) {
            if (opt.value === pickedDate) {
                opt.selected = true;
                found = true;
                break;
            }
        }

        // Add new option if not found
        if (!found) {
            const newOption = document.createElement('option');
            newOption.value = pickedDate;
            newOption.textContent = displayLabel;
            newOption.selected = true;
            const pickOption = dateSelect.querySelector('option[value="pick"]');
            dateSelect.insertBefore(newOption, pickOption);
        }

        // Update label
        label.textContent = '(manual)';
        label.style.color = 'var(--warning)';
    }

    // Hide picker, show select
    datePicker.style.display = 'none';
    dateSelect.style.display = 'block';
}

function handleDatePickerBlur(type) {
    const dateSelect = document.getElementById(type === 'lp' ? 'lpSlotDate' : 'alpSlotDate');
    const datePicker = document.getElementById(type === 'lp' ? 'lpDatePicker' : 'alpDatePicker');

    setTimeout(() => {
        if (datePicker.style.display !== 'none' && !datePicker.value) {
            datePicker.style.display = 'none';
            dateSelect.style.display = 'block';
            dateSelect.selectedIndex = 0;
        }
    }, 200);
}

function setSlotDateDropdown(type, dateStr) {
    const dateSelect = document.getElementById(type === 'lp' ? 'lpSlotDate' : 'alpSlotDate');
    const datePicker = document.getElementById(type === 'lp' ? 'lpDatePicker' : 'alpDatePicker');

    datePicker.style.display = 'none';
    dateSelect.style.display = 'block';

    // Don't allow past dates - default to today if past
    const todayStr = formatDateKey(TODAY);
    if (dateStr < todayStr) {
        dateStr = todayStr;
    }

    let found = false;
    for (let opt of dateSelect.options) {
        if (opt.value === dateStr) {
            opt.selected = true;
            found = true;
            break;
        }
    }

    if (!found) {
        const date = new Date(dateStr + 'T00:00:00');
        const displayLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const newOption = document.createElement('option');
        newOption.value = dateStr;
        newOption.textContent = displayLabel;
        newOption.selected = true;
        const pickOption = dateSelect.querySelector('option[value="pick"]');
        dateSelect.insertBefore(newOption, pickOption);
    }
}

function togglePilotStation() {
    const isPilot = document.getElementById('isPilot').checked;
    const pilotGroup = document.getElementById('pilotStationGroup');
    const trainInput = document.getElementById('incomingTrain');

    if (isPilot) {
        pilotGroup.style.display = 'flex';
        trainInput.placeholder = 'Train No. (optional)';
    } else {
        pilotGroup.style.display = 'none';
        trainInput.placeholder = 'Train No.';
        document.getElementById('pilotStation').value = '';
    }
}

function updateCurrentTimeDisplay() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('currentTimeDisplay').value = timeStr;
}

// ========== SIGN-OFF DATE HELPER ==========
function getSignOffDate() {
    const signOffDateSelect = document.getElementById('signOffDate');
    if (signOffDateSelect && signOffDateSelect.value === 'prev') {
        // Yesterday's date
        const yesterday = new Date(TODAY.getTime());
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDateKey(yesterday);
    }
    return formatDateKey(TODAY);
}

// ========== SLOT CALCULATIONS ==========
function calculateSlotsManual() {
    const signOff = document.getElementById('signOff').value;
    let baseTime;

    // Get sign-off base date (today or yesterday)
    const signOffDateSelect = document.getElementById('signOffDate');
    let signOffBaseDate = new Date(TODAY.getTime());
    if (signOffDateSelect && signOffDateSelect.value === 'prev') {
        signOffBaseDate.setDate(signOffBaseDate.getDate() - 1);
    }

    if (signOff) {
        baseTime = signOff;
        const dateLabel = signOffDateSelect && signOffDateSelect.value === 'prev' ? ' (Prev)' : '';
        document.getElementById('currentTimeDisplay').value = `Sign-off: ${signOff}${dateLabel}`;
    } else {
        const now = new Date();
        baseTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        document.getElementById('currentTimeDisplay').value = `Now: ${baseTime}`;
    }

    // Calculate LP slot
    const lpRest = document.getElementById('lpRest').value;
    const lpSlotBox = document.getElementById('lpNextSlot');
    const lpDateSelect = document.getElementById('lpSlotDate');
    const lpDateLabel = document.getElementById('lpSlotDateLabel');
    const lpDatePicker = document.getElementById('lpDatePicker');

    if (lpRest === "suspend") {
        // Multi-day leave - allow manual date/time selection up to 10 days
        lpSlotBox.value = "08:00";  // Default morning slot
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        setSlotDateDropdown('lp', formatDateKey(TODAY));
        lpDateLabel.textContent = "(Select return date)";
        lpDateLabel.style.color = "var(--warning)";
    } else {
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        const lpSlot = calculateNextSlot(baseTime, parseInt(lpRest), signOffBaseDate);
        lpSlotBox.value = lpSlot.time;
        setSlotDateDropdown('lp', formatDateKey(lpSlot.date));
        lpDateLabel.textContent = `(${lpSlot.actualRestHours}hr rest)`;
        lpDateLabel.style.color = "var(--text-muted)";
    }

    // Calculate ALP slot
    const alpRest = document.getElementById('alpRest').value;
    const alpSlotBox = document.getElementById('alpNextSlot');
    const alpDateSelect = document.getElementById('alpSlotDate');
    const alpDateLabel = document.getElementById('alpSlotDateLabel');
    const alpDatePicker = document.getElementById('alpDatePicker');

    if (alpRest === "suspend") {
        // Multi-day leave - allow manual date/time selection up to 10 days
        alpSlotBox.value = "08:00";  // Default morning slot
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        setSlotDateDropdown('alp', formatDateKey(TODAY));
        alpDateLabel.textContent = "(Select return date)";
        alpDateLabel.style.color = "var(--warning)";
    } else {
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        const alpSlot = calculateNextSlot(baseTime, parseInt(alpRest), signOffBaseDate);
        alpSlotBox.value = alpSlot.time;
        setSlotDateDropdown('alp', formatDateKey(alpSlot.date));
        alpDateLabel.textContent = `(${alpSlot.actualRestHours}hr rest)`;
        alpDateLabel.style.color = "var(--text-muted)";
    }

    // Trigger comprehensive warnings check (debounced)
    debounceWarningsCheck();
}

function calculateSlots() {
    const signOff = document.getElementById('signOff').value;
    if (!signOff) return;

    // Get sign-off base date (today or yesterday)
    const signOffDateSelect = document.getElementById('signOffDate');
    let signOffBaseDate = new Date(TODAY.getTime());
    if (signOffDateSelect && signOffDateSelect.value === 'prev') {
        signOffBaseDate.setDate(signOffBaseDate.getDate() - 1);
    }

    // Calculate LP slot
    const lpRest = document.getElementById('lpRest').value;
    const lpSlotBox = document.getElementById('lpNextSlot');
    const lpDateSelect = document.getElementById('lpSlotDate');
    const lpDateLabel = document.getElementById('lpSlotDateLabel');
    const lpDatePicker = document.getElementById('lpDatePicker');

    if (lpRest === "suspend") {
        // Multi-day leave - allow manual date/time selection up to 10 days
        lpSlotBox.value = "08:00";  // Default morning slot
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        setSlotDateDropdown('lp', formatDateKey(TODAY));
        lpDateLabel.textContent = "(Select return date)";
        lpDateLabel.style.color = "var(--warning)";
    } else {
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        const lpSlot = calculateNextSlot(signOff, parseInt(lpRest), signOffBaseDate);
        lpSlotBox.value = lpSlot.time;
        setSlotDateDropdown('lp', formatDateKey(lpSlot.date));
        lpDateLabel.textContent = `(${lpSlot.actualRestHours}hr rest)`;
        lpDateLabel.style.color = "var(--text-muted)";
    }

    // Calculate ALP slot
    const alpRest = document.getElementById('alpRest').value;
    const alpSlotBox = document.getElementById('alpNextSlot');
    const alpDateSelect = document.getElementById('alpSlotDate');
    const alpDateLabel = document.getElementById('alpSlotDateLabel');
    const alpDatePicker = document.getElementById('alpDatePicker');

    if (alpRest === "suspend") {
        // Multi-day leave - allow manual date/time selection up to 10 days
        alpSlotBox.value = "08:00";  // Default morning slot
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        setSlotDateDropdown('alp', formatDateKey(TODAY));
        alpDateLabel.textContent = "(Select return date)";
        alpDateLabel.style.color = "var(--warning)";
    } else {
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        const alpSlot = calculateNextSlot(signOff, parseInt(alpRest), signOffBaseDate);
        alpSlotBox.value = alpSlot.time;
        setSlotDateDropdown('alp', formatDateKey(alpSlot.date));
        alpDateLabel.textContent = `(${alpSlot.actualRestHours}hr rest)`;
        alpDateLabel.style.color = "var(--text-muted)";
    }

    // Trigger comprehensive warnings check (debounced)
    debounceWarningsCheck();
}

// Debounce timer for warnings check
let warningsCheckTimeout = null;

function debounceWarningsCheck() {
    clearTimeout(warningsCheckTimeout);

    // Set checking state immediately to block submit
    isCheckingWarnings = true;
    updateSubmitButtonState();

    warningsCheckTimeout = setTimeout(() => {
        checkStaffWarningsComprehensive();
    }, 500); // Wait 500ms after last change
}

function checkStaffStatus() {
    calculateSlots();
}

// ========== STAFF SEARCH ==========
function setupStaffSearch() {
    // Create datalists for autocomplete
    const lpDatalist = document.createElement('datalist');
    lpDatalist.id = 'lpDatalist';
    document.body.appendChild(lpDatalist);

    const alpDatalist = document.createElement('datalist');
    alpDatalist.id = 'alpDatalist';
    document.body.appendChild(alpDatalist);

    // LP search input
    const lpSelect = document.getElementById('lpSelect');
    const lpInput = document.createElement('input');
    lpInput.type = 'text';
    lpInput.id = 'lpSearchInput';
    lpInput.placeholder = 'Type to search LP...';
    lpInput.setAttribute('list', 'lpDatalist');
    lpInput.style.display = 'none';
    lpSelect.parentElement.appendChild(lpInput);

    // ALP search input
    const alpSelect = document.getElementById('alpSelect');
    const alpInput = document.createElement('input');
    alpInput.type = 'text';
    alpInput.id = 'alpSearchInput';
    alpInput.placeholder = 'Type to search ALP...';
    alpInput.setAttribute('list', 'alpDatalist');
    alpInput.style.display = 'none';
    alpSelect.parentElement.appendChild(alpInput);

    // LP input events
    let lpTimeout;
    lpInput.addEventListener('input', (e) => {
        clearTimeout(lpTimeout);
        const q = e.target.value;
        if (q.length >= 2) {
            lpTimeout = setTimeout(() => loadStaffOptions(q, 'lp'), 300);
        }
    });

    lpInput.addEventListener('change', () => {
        const val = lpInput.value;
        const match = val.match(/\(([A-Z0-9]+)\)/);
        if (match) {
            const cmsId = match[1];
            const datalist = document.getElementById('lpDatalist');
            for (const opt of datalist.options) {
                if (opt.dataset.cms === cmsId) {
                    selectedLP = { hrms_id: opt.dataset.hrms, name: opt.dataset.name, cms_id: cmsId };
                    break;
                }
            }
        }
    });

    // ALP input events
    let alpTimeout;
    alpInput.addEventListener('input', (e) => {
        clearTimeout(alpTimeout);
        const q = e.target.value;
        if (q.length >= 2) {
            alpTimeout = setTimeout(() => loadStaffOptions(q, 'alp'), 300);
        }
    });

    alpInput.addEventListener('change', () => {
        const val = alpInput.value;
        if (!val || val === '') {
            selectedALP = null;
            return;
        }
        const match = val.match(/\(([A-Z0-9]+)\)/);
        if (match) {
            const cmsId = match[1];
            const datalist = document.getElementById('alpDatalist');
            for (const opt of datalist.options) {
                if (opt.dataset.cms === cmsId) {
                    selectedALP = { hrms_id: opt.dataset.hrms, name: opt.dataset.name, cms_id: cmsId };
                    break;
                }
            }
        }
    });
}

async function loadStaffOptions(query, type) {
    try {
        const data = await searchStaff(SLATE_CONFIG.OFFICE_CODE, query, type);

        if (data.success) {
            const datalist = document.getElementById(type === 'lp' ? 'lpDatalist' : 'alpDatalist');
            datalist.innerHTML = data.data.map(staff => {
                const warning = staff.current_night_streak >= 3 ? ` ⚠️${staff.current_night_streak}N` : '';
                return `<option value="${staff.name} (${staff.current_cms_id})${warning}" data-hrms="${staff.hrms_id}" data-name="${staff.name}" data-cms="${staff.current_cms_id}"></option>`;
            }).join('');
        }
    } catch (err) {
        console.error('Error loading staff:', err);
    }
}

// Legacy function for compatibility
function autoFillArrival(train, loco, lpValue, alpValue, signOnTime) {
    document.getElementById('incomingTrain').value = train;
    document.getElementById('incomingLoco').value = loco;
    document.getElementById('lpSelect').value = lpValue;
    document.getElementById('alpSelect').value = alpValue;
    document.getElementById('signOn').value = signOnTime;

    checkStaffStatus();

    const fields = ['incomingTrain', 'incomingLoco', 'lpSelect', 'alpSelect', 'signOn'];
    fields.forEach(id => flashHighlight(document.getElementById(id)));

    document.getElementById('signOff').focus();
}

function clearArrivalForm() {
    selectedLP = null;
    selectedALP = null;
    isManualMode = false;
    selectedSafeLogId = null;

    // Reset form fields
    document.getElementById('incomingTrain').value = '';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('signOn').value = '';
    document.getElementById('signOff').value = '';
    document.getElementById('signOffDate').value = 'today';
    document.getElementById('lpNextSlot').value = '';
    document.getElementById('alpNextSlot').value = '';

    // Reset pilot fields
    document.getElementById('isPilot').checked = false;
    document.getElementById('pilotStation').value = '';
    document.getElementById('pilotStationGroup').style.display = 'none';
    document.getElementById('incomingTrain').placeholder = 'Train No.';

    // Reset date selectors and pickers
    document.getElementById('lpSlotDate').selectedIndex = 0;
    document.getElementById('alpSlotDate').selectedIndex = 0;
    document.getElementById('lpSlotDate').style.display = 'block';
    document.getElementById('alpSlotDate').style.display = 'block';
    document.getElementById('lpDatePicker').style.display = 'none';
    document.getElementById('alpDatePicker').style.display = 'none';
    document.getElementById('lpDatePicker').value = '';
    document.getElementById('alpDatePicker').value = '';
    document.getElementById('lpSlotDateLabel').textContent = '';
    document.getElementById('alpSlotDateLabel').textContent = '';

    document.getElementById('lpAlert').className = 'alert';
    document.getElementById('lpAlert').innerHTML = '';
    document.getElementById('alpAlert').className = 'alert';
    document.getElementById('alpAlert').innerHTML = '';

    // Reset warning state
    lpWarnings = [];
    alpWarnings = [];
    lpCanAssign = true;
    alpCanAssign = true;
    isCheckingWarnings = false;

    // Reset submit button
    updateSubmitButtonState();

    // Show duty time row, hide off reason row
    document.getElementById('dutyTimeRow').style.display = 'grid';
    document.getElementById('offReasonRow').style.display = 'none';

    // Reset manual entry button style
    const manualBtn = document.getElementById('manualEntryBtn');
    if (manualBtn) {
        manualBtn.style.background = 'var(--bg-input)';
        manualBtn.style.color = 'var(--text-muted)';
        manualBtn.style.borderStyle = 'dashed';
    }

    // Show selects, hide search inputs
    const lpSelect = document.getElementById('lpSelect');
    const alpSelect = document.getElementById('alpSelect');
    const lpSearch = document.getElementById('lpSearchInput');
    const alpSearch = document.getElementById('alpSearchInput');

    lpSelect.innerHTML = '<option value="none">-- Select LP --</option>';
    lpSelect.disabled = false;
    lpSelect.style.display = 'block';

    alpSelect.innerHTML = '<option value="none">[ No ALP / Single Man ]</option>';
    alpSelect.disabled = false;
    alpSelect.style.display = 'block';

    if (lpSearch) {
        lpSearch.style.display = 'none';
        lpSearch.value = '';
    }
    if (alpSearch) {
        alpSearch.style.display = 'none';
        alpSearch.value = '';
    }

    // Reset rest dropdowns
    document.getElementById('lpRest').value = '16';
    document.getElementById('alpRest').value = '16';
    document.getElementById('lpNextSlot').disabled = false;
    document.getElementById('alpNextSlot').disabled = false;
    document.getElementById('lpSlotDate').disabled = false;
    document.getElementById('alpSlotDate').disabled = false;
    document.getElementById('lpSlotDate').selectedIndex = 1; // Tomorrow
    document.getElementById('alpSlotDate').selectedIndex = 1; // Tomorrow
}

// ========== FORECAST PANEL ==========
function generateShiftTableRows(dateStr, shiftIndex) {
    const slots = generateSlotTimes(shiftIndex);
    return slots.map(time =>
        `<tr id="slot-${dateStr}-${time.replace(':', '')}" data-slot="${time}">
            <td class="time-cell">${time}</td>
            <td class="empty-slot lp-cell" data-type="lp">--</td>
            <td class="empty-slot alp-cell" data-type="alp">--</td>
        </tr>`
    ).join('');
}

function ensureDateGroup(dateStr) {
    if (dateGroups[dateStr]) return dateGroups[dateStr];

    const date = new Date(dateStr + 'T00:00:00');
    const displayDate = formatDateDisplay(date);
    const isToday = formatDateKey(TODAY) === dateStr;
    const tomorrow = new Date(TODAY);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = formatDateKey(tomorrow) === dateStr;

    let dateLabel = displayDate;
    if (isToday) dateLabel = `Today (${displayDate})`;
    if (isTomorrow) dateLabel = `Tomorrow (${displayDate})`;

    const groupHtml = `
        <div class="date-group" id="date-group-${dateStr}" data-date="${dateStr}">
            <div class="date-header">${dateLabel}</div>
            <div class="shift-grid">
                <div class="shift-col">
                    <div class="shift-title">00:00 x 08:00</div>
                    <div class="shift-table-wrap">
                        <table id="table-${dateStr}-0">
                            <tr><th>TIME</th><th>LP</th><th>ALP</th></tr>
                            ${generateShiftTableRows(dateStr, 0)}
                        </table>
                    </div>
                </div>
                <div class="shift-col">
                    <div class="shift-title">08:00 x 16:00</div>
                    <div class="shift-table-wrap">
                        <table id="table-${dateStr}-1">
                            <tr><th>TIME</th><th>LP</th><th>ALP</th></tr>
                            ${generateShiftTableRows(dateStr, 1)}
                        </table>
                    </div>
                </div>
                <div class="shift-col">
                    <div class="shift-title">16:00 x 24:00</div>
                    <div class="shift-table-wrap">
                        <table id="table-${dateStr}-2">
                            <tr><th>TIME</th><th>LP</th><th>ALP</th></tr>
                            ${generateShiftTableRows(dateStr, 2)}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert in correct chronological order
    const scroll = document.getElementById('forecastScroll');
    const existingGroups = Array.from(scroll.querySelectorAll('.date-group'));
    let inserted = false;

    for (const group of existingGroups) {
        if (group.dataset.date > dateStr) {
            group.insertAdjacentHTML('beforebegin', groupHtml);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        scroll.insertAdjacentHTML('beforeend', groupHtml);
    }

    // Store reference
    dateGroups[dateStr] = {
        element: document.getElementById(`date-group-${dateStr}`),
        tables: [
            document.getElementById(`table-${dateStr}-0`),
            document.getElementById(`table-${dateStr}-1`),
            document.getElementById(`table-${dateStr}-2`)
        ]
    };

    updateDateTabs();
    return dateGroups[dateStr];
}

function updateDateTabs() {
    const tabsContainer = document.getElementById('dateTabs');
    const dates = Object.keys(dateGroups).sort();

    tabsContainer.innerHTML = dates.map(dateStr => {
        const date = new Date(dateStr);
        const isToday = formatDateKey(TODAY) === dateStr;
        const yesterday = new Date(TODAY);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = formatDateKey(yesterday) === dateStr;
        const tomorrow = new Date(TODAY);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = formatDateKey(tomorrow) === dateStr;

        // Compact label: day + short weekday
        const dayNum = date.getDate();
        const weekDay = date.toLocaleDateString('en-IN', { weekday: 'short' }).substring(0, 2);
        let label = `${dayNum} ${weekDay}`;
        if (isYesterday) label = 'Yest';
        if (isToday) label = 'Today';
        if (isTomorrow) label = 'Tmrw';

        const group = dateGroups[dateStr];
        const lpCount = group.tables.reduce((sum, t) => sum + t.querySelectorAll('td.lp-cell.new-entry').length, 0);
        const alpCount = group.tables.reduce((sum, t) => sum + t.querySelectorAll('td.alp-cell.new-entry').length, 0);
        const hasStaff = lpCount > 0 || alpCount > 0;

        return `<div class="date-tab" data-date="${dateStr}" onclick="scrollToDate('${dateStr}')">${label}${hasStaff ? `<span class="count">${lpCount}/${alpCount}</span>` : ''}</div>`;
    }).join('');

    updateVacancySummary();
}

function updateVacancySummary(forDate = null) {
    // Show vacancy for specific date, or default to currently visible date
    const dates = Object.keys(dateGroups).sort();
    const targetDate = forDate || getVisibleDate() || formatDateKey(TODAY);

    let lpVacant = 0;
    let alpVacant = 0;

    const group = dateGroups[targetDate];
    if (group) {
        group.tables.forEach(table => {
            lpVacant += table.querySelectorAll('td.lp-cell.empty-slot').length;
            alpVacant += table.querySelectorAll('td.alp-cell.empty-slot').length;
        });
    }

    // Format date label
    const date = new Date(targetDate);
    const todayStr = formatDateKey(TODAY);
    let dateLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (targetDate === todayStr) dateLabel = 'Today';

    const summaryEl = document.getElementById('vacantSummary');
    if (summaryEl) {
        summaryEl.textContent = `${dateLabel}: LP ${lpVacant} | ALP ${alpVacant} vacant`;
    }
}

function getVisibleDate() {
    const scroll = document.getElementById('forecastScroll');
    if (!scroll) return null;
    const scrollLeft = scroll.scrollLeft;
    const groupWidth = scroll.querySelector('.date-group')?.offsetWidth || scroll.offsetWidth;
    const dates = Object.keys(dateGroups).sort();
    const visibleIndex = Math.round(scrollLeft / groupWidth);
    return dates[visibleIndex] || null;
}

function scrollToDate(dateStr) {
    const group = dateGroups[dateStr];
    if (group) {
        group.element.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.date-tab[data-date="${dateStr}"]`)?.classList.add('active');
    }
}

function scrollForecast(direction) {
    const scroll = document.getElementById('forecastScroll');
    const groupWidth = scroll.querySelector('.date-group')?.offsetWidth || scroll.offsetWidth;
    scroll.scrollBy({ left: direction * groupWidth, behavior: 'smooth' });
}

// Detect visible date and highlight corresponding tab
function updateVisibleDateTab() {
    const scroll = document.getElementById('forecastScroll');
    const scrollLeft = scroll.scrollLeft;
    const groupWidth = scroll.querySelector('.date-group')?.offsetWidth || scroll.offsetWidth;

    // Find which date group is most visible
    const dates = Object.keys(dateGroups).sort();
    const visibleIndex = Math.round(scrollLeft / groupWidth);
    const visibleDate = dates[visibleIndex];

    if (visibleDate) {
        // Update tab highlighting
        document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.date-tab[data-date="${visibleDate}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            // Scroll tab into view if needed
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        // Update vacancy summary for visible date
        updateVacancySummary(visibleDate);
    }
}

// Initialize scroll listener
function initScrollListener() {
    const scroll = document.getElementById('forecastScroll');
    let scrollTimeout;
    scroll.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateVisibleDateTab, 100);
    });
}

// ========== ADD STAFF TO SLATE ==========
/**
 * Add staff to the forecast slate
 * @param {object} staff - { slotId, name, type, time, date, isAdhoc, exception, exceptionRemark, incoming, incomingLoco, isPilot }
 */
function addStaffToSlate(staff) {
    const { slotId, name, type, time, date, isAdhoc, exception, exceptionRemark,
            signedOnAt, lateReason, detention, detentionRemark,
            incoming, incomingLoco, isPilot, signOffTime, nightStreak, prDays } = staff;

    if (!time || !date) return false;

    ensureDateGroup(date);

    const rowId = `slot-${date}-${time.replace(':', '')}`;
    let slotRow = document.getElementById(rowId);

    // If adhoc and row exists with staff already, create a new adhoc row
    if (isAdhoc && slotRow) {
        const cellType = type.toLowerCase();
        const existingCell = slotRow.querySelector(`td[data-type="${cellType}"]`);
        if (existingCell && existingCell.textContent.trim() && !existingCell.classList.contains('empty-slot')) {
            slotRow = createAdhocRow(date, time, name, type);
            return true;
        }
    }

    if (!slotRow) {
        console.error('Slot not found:', rowId);
        return false;
    }

    const cellType = type.toLowerCase();
    const cell = slotRow.querySelector(`td[data-type="${cellType}"]`);

    if (!cell) {
        console.error('Cell not found for type:', cellType);
        return false;
    }

    // Check for late arrival using robust datetime comparison
    const signedOnTime = formatTime(signedOnAt);
    const isLate = signedOnTime !== '--' && isLateArrival(date, time, signedOnAt);

    // Build cell content with exception/late indicator
    let displayName = name;
    let badge = '';
    let cellColor = '';

    if (isLate) {
        // Late arrival - cyan color with time as subscript
        badge = `<br><sub style="color: #22d3ee; font-size: 0.7em;">@ ${signedOnTime}</sub>`;
        cellColor = '#22d3ee';
    } else if (exception === 'AUC') {
        badge = '<sup style="color: var(--warning); font-weight: 700; margin-left: 2px;">AUC</sup>';
        cellColor = 'var(--warning)';
    } else if (exception === 'NF') {
        badge = '<sup style="color: var(--danger); font-weight: 700; margin-left: 2px;">NF</sup>';
        cellColor = 'var(--danger)';
    }

    // Build incoming indicator (small dot BEFORE name that shows details on click)
    let incomingIndicator = '';
    if (incoming || incomingLoco) {
        const signOffStr = signOffTime ? formatTime(signOffTime) : '';
        const incomingTitle = isPilot
            ? `Pilot: ${incoming || '--'}`
            : `Ex: ${incoming || '--'} / ${incomingLoco || '--'}`;
        incomingIndicator = `<span class="incoming-dot" title="${incomingTitle}"
            onclick="event.stopPropagation(); showIncomingDetails(this, '${(incoming || '').replace(/'/g, "\\'")}', '${(incomingLoco || '').replace(/'/g, "\\'")}', ${isPilot || false}, '${signOffStr}')">●</span>`;
    }

    // Build fatigue indicators (night streak and PR)
    let fatigueBadge = '';
    if (nightStreak) {
        fatigueBadge += `<sup style="background: #1e3a5f; color: #7dd3fc; padding: 0 3px; border-radius: 3px; margin-left: 3px; font-size: 0.65em;" title="${nightStreak} consecutive night duties">🌙${nightStreak}</sup>`;
    }
    if (prDays) {
        fatigueBadge += `<sup style="background: #7c3aed; color: #fff; padding: 0 4px; border-radius: 50%; margin-left: 3px; font-size: 0.65em;" title="${prDays} consecutive duty days - PR due">${prDays}</sup>`;
    }

    cell.innerHTML = `${incomingIndicator}<span class="staff-name" style="cursor: pointer;">${displayName}${badge}${fatigueBadge}</span>`;
    cell.classList.remove('empty-slot');
    cell.classList.add('new-entry');

    // Store slot info for click handler
    cell.dataset.slotId = slotId;
    cell.dataset.staffType = cellType;
    cell.dataset.staffName = name;
    cell.dataset.slotTime = time;
    cell.dataset.slotDate = date;
    cell.dataset.exception = exception || '';
    cell.dataset.exceptionRemark = exceptionRemark || '';
    cell.dataset.signedOnAt = signedOnAt || '';
    cell.dataset.lateReason = lateReason || '';
    cell.dataset.detention = detention || '';
    cell.dataset.detentionRemark = detentionRemark || '';

    // Add click handler for Late/AUC/NF marking
    cell.onclick = function() {
        openExceptionModal(
            parseInt(this.dataset.slotId),
            this.dataset.staffType,
            {
                name: this.dataset.staffName,
                slot_time: this.dataset.slotTime,
                slot_date: this.dataset.slotDate,
                current_exception: this.dataset.exception || null,
                current_remark: this.dataset.exceptionRemark || null,
                signed_on_at: this.dataset.signedOnAt || null,
                late_reason: this.dataset.lateReason || null,
                detention: this.dataset.detention || null,
                detention_remark: this.dataset.detentionRemark || null
            },
            () => loadSlateData() // Refresh after save
        );
    };

    if (isAdhoc) {
        cell.style.borderLeft = '3px solid var(--warning)';
        cell.title = 'Adhoc entry';
    }

    // Apply styling based on late/exception
    if (isLate) {
        cell.style.color = '#22d3ee';
        cell.title = `Late arrival at ${signedOnTime}` + (detention === 'YES' ? ` - Train detained: ${detentionRemark}` : '');
    } else if (exception === 'AUC') {
        cell.style.color = 'var(--warning)';
        cell.title = exceptionRemark || 'Advised Unable to Come';
    } else if (exception === 'NF') {
        cell.style.color = 'var(--danger)';
        cell.title = exceptionRemark || 'Not Found';
    }

    slotRow.style.background = isAdhoc ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    setTimeout(() => {
        slotRow.style.background = '';
    }, 2000);

    return true;
}

function createAdhocRow(slotDate, slotTime, staffName, staffType) {
    const slotHour = parseInt(slotTime.split(':')[0]);
    let shiftIndex = 0;
    if (slotHour >= 8 && slotHour < 16) shiftIndex = 1;
    else if (slotHour >= 16) shiftIndex = 2;

    const tableId = `table-${slotDate}-${shiftIndex}`;
    const table = document.getElementById(tableId);

    if (!table) {
        console.error('Shift table not found:', tableId);
        return null;
    }

    let tbody = table.querySelector('tbody');
    if (!tbody) tbody = table;

    const existingRow = document.getElementById(`slot-${slotDate}-${slotTime.replace(':', '')}`);

    const adhocRow = document.createElement('tr');
    adhocRow.id = `slot-${slotDate}-${slotTime.replace(':', '')}-adhoc-${Date.now()}`;
    adhocRow.style.background = 'rgba(245, 158, 11, 0.1)';
    adhocRow.innerHTML = `
        <td class="slot-time" style="border-left: 3px solid var(--warning);">${slotTime.slice(0,5)}</td>
        <td data-type="lp" class="${staffType === 'LP' ? 'new-entry' : 'empty-slot'}" style="${staffType === 'LP' ? 'border-left: 3px solid var(--warning);' : ''}">${staffType === 'LP' ? staffName : '--'}</td>
        <td data-type="alp" class="${staffType === 'ALP' ? 'new-entry' : 'empty-slot'}" style="${staffType === 'ALP' ? 'border-left: 3px solid var(--warning);' : ''}">${staffType === 'ALP' ? staffName : '--'}</td>
    `;

    if (existingRow && existingRow.nextSibling) {
        tbody.insertBefore(adhocRow, existingRow.nextSibling);
    } else {
        tbody.appendChild(adhocRow);
    }

    adhocRow.style.background = 'rgba(245, 158, 11, 0.25)';
    setTimeout(() => {
        adhocRow.style.background = 'rgba(245, 158, 11, 0.1)';
    }, 2000);

    return adhocRow;
}

// ========== INCOMING DETAILS POPUP ==========
function showIncomingDetails(dot, train, loco, isPilot, signOffTime) {
    // Remove any existing popup
    document.querySelectorAll('.incoming-popup').forEach(p => p.remove());

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'incoming-popup';

    const signOffDisplay = signOffTime ? `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border);"><b>Sign-Off:</b> ${signOffTime}</div>` : '';

    if (isPilot) {
        popup.innerHTML = `
            <div style="font-weight: 700; color: var(--warning); margin-bottom: 4px;">PILOT</div>
            <div>Ex: ${train || '--'}</div>
            ${signOffDisplay}
        `;
    } else {
        popup.innerHTML = `
            <div style="margin-bottom: 4px;"><b>Train:</b> ${train || '--'}</div>
            <div><b>Loco:</b> ${loco || '--'}</div>
            ${signOffDisplay}
        `;
    }

    // Position popup near the dot
    const rect = dot.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = `${rect.left + 15}px`;
    popup.style.top = `${rect.top - 10}px`;
    popup.style.zIndex = '9999';

    document.body.appendChild(popup);

    // Close popup when clicking elsewhere
    const closePopup = (e) => {
        if (!popup.contains(e.target) && e.target !== dot) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    };
    setTimeout(() => document.addEventListener('click', closePopup), 10);
}

// ========== SUBMIT TO API ==========
async function submitToSlate() {
    // Check if still verifying warnings
    if (isCheckingWarnings) {
        showToast('Please wait - verifying staff availability...', 'info');
        return;
    }

    // Check if assignment is blocked due to warnings
    if (!lpCanAssign) {
        showToast('Cannot assign LP - resolve errors first', 'error');
        return;
    }
    if (!alpCanAssign) {
        showToast('Cannot assign ALP - resolve errors first', 'error');
        return;
    }

    const signOff = document.getElementById('signOff').value;
    const signOn = document.getElementById('signOn').value;

    // Parse LP/ALP if in manual mode
    if (isManualMode && !selectedLP) {
        const lpInput = document.getElementById('lpSearchInput');
        if (lpInput && lpInput.value) {
            const match = lpInput.value.match(/\(([A-Z0-9]+)\)/);
            if (match) {
                const cmsId = match[1];
                const datalist = document.getElementById('lpDatalist');
                for (const opt of datalist.options) {
                    if (opt.dataset.cms === cmsId) {
                        selectedLP = { hrms_id: opt.dataset.hrms, name: opt.dataset.name, cms_id: cmsId };
                        break;
                    }
                }
            }
        }
    }

    if (isManualMode && !selectedALP) {
        const alpInput = document.getElementById('alpSearchInput');
        if (alpInput && alpInput.value) {
            const match = alpInput.value.match(/\(([A-Z0-9]+)\)/);
            if (match) {
                const cmsId = match[1];
                const datalist = document.getElementById('alpDatalist');
                for (const opt of datalist.options) {
                    if (opt.dataset.cms === cmsId) {
                        selectedALP = { hrms_id: opt.dataset.hrms, name: opt.dataset.name, cms_id: cmsId };
                        break;
                    }
                }
            }
        }
    }

    // Validation
    if (!selectedLP && !selectedALP) {
        alert('Please select at least one staff (LP or ALP)');
        return;
    }

    if (!isManualMode) {
        if (!signOn) {
            alert('Please enter Sign-On time');
            document.getElementById('signOn').focus();
            return;
        }
        if (!signOff) {
            alert('Please enter Sign-Off time');
            document.getElementById('signOff').focus();
            return;
        }
    }

    // Get slot info
    const lpSlotBox = document.getElementById('lpNextSlot');
    const lpRest = document.getElementById('lpRest').value;
    const alpSlotBox = document.getElementById('alpNextSlot');
    const alpRest = document.getElementById('alpRest').value;

    // Get pilot and train info
    let trainNo = document.getElementById('incomingTrain').value.trim();
    const locoNo = document.getElementById('incomingLoco').value.trim();
    const isPilot = document.getElementById('isPilot').checked;
    const pilotStation = document.getElementById('pilotStation').value;

    if (isPilot && pilotStation) {
        trainNo = `P-${pilotStation}` + (trainNo ? ` (${trainNo})` : '');
    }

    // Build API payload
    const payload = {
        office_code: SLATE_CONFIG.OFFICE_CODE,
        is_pilot: isPilot
    };

    const lpDateSelect = document.getElementById('lpSlotDate');
    if (selectedLP) {
        if (lpRest !== 'suspend' && lpDateSelect.value === 'pick') {
            alert('Please select a date for LP slot');
            lpDateSelect.focus();
            return;
        }
        payload.lp_hrms_id = selectedLP.hrms_id;
        payload.lp_rest_type = mapRestType(lpRest);
        payload.lp_next_slot_date = lpRest !== 'suspend' ? lpDateSelect.value : null;
        payload.lp_next_slot_time = lpRest !== 'suspend' ? lpSlotBox.value + ':00' : null;
        // Source slate ID to mark old slot as signed-off
        if (selectedLP.source_slate_id) {
            payload.source_slate_id = selectedLP.source_slate_id;
        }
    }

    if (isManualMode) {
        if (trainNo) {
            payload.incoming_detail = trainNo;
            payload.loco_no = locoNo || null;
        } else {
            payload.incoming_detail = document.getElementById('offReason').value;
            payload.loco_no = null;
        }
        payload.sign_on_time = signOn ? `${formatDateKey(TODAY)} ${signOn}:00` : null;
        payload.sign_off_time = signOff ? `${getSignOffDate()} ${signOff}:00` : null;
    } else {
        payload.incoming_detail = trainNo;
        payload.loco_no = locoNo;
        payload.sign_on_time = `${formatDateKey(TODAY)} ${signOn}:00`;
        payload.sign_off_time = `${getSignOffDate()} ${signOff}:00`;
    }

    const alpDateSelect = document.getElementById('alpSlotDate');
    if (selectedALP) {
        if (alpRest !== 'suspend' && alpDateSelect.value === 'pick') {
            alert('Please select a date for ALP slot');
            alpDateSelect.focus();
            return;
        }
        payload.alp_hrms_id = selectedALP.hrms_id;
        payload.alp_rest_type = mapRestType(alpRest);
        payload.alp_next_slot_date = alpRest !== 'suspend' ? alpDateSelect.value : null;
        payload.alp_next_slot_time = alpRest !== 'suspend' ? alpSlotBox.value + ':00' : null;
    }

    // Check for collisions first
    try {
        const checkRes = await fetch(`${SLATE_CONFIG.API_BASE}/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                office_code: SLATE_CONFIG.OFFICE_CODE,
                lp_slot_date: payload.lp_next_slot_date,
                lp_slot_time: payload.lp_next_slot_time,
                alp_slot_date: payload.alp_next_slot_date,
                alp_slot_time: payload.alp_next_slot_time
            })
        });

        const checkData = await checkRes.json();

        if (checkData.lp_collision || checkData.alp_collision) {
            pendingPayload = payload;
            collisionInfo = checkData;

            // Show collision modal with independent LP/ALP choices
            showCollisionModal(checkData);
            return;
        }

    } catch (err) {
        console.error('Availability check failed:', err);
    }

    await doSubmit(payload);
}

// Collision choices state
let collisionChoices = { lp: null, alp: null };

function showCollisionModal(checkData) {
    const modal = document.getElementById('collisionModal');
    const lpRow = document.getElementById('lpCollisionRow');
    const alpRow = document.getElementById('alpCollisionRow');
    const msgEl = document.getElementById('collisionMessage');

    // Reset choices
    collisionChoices = { lp: null, alp: null };

    // Reset button styles
    document.querySelectorAll('.collision-opt').forEach(btn => {
        btn.style.background = 'var(--bg-card)';
        btn.style.color = 'var(--text-main)';
        btn.style.border = '1px solid var(--border)';
    });

    let hasCollision = false;

    // LP Collision
    if (checkData.lp_collision) {
        hasCollision = true;
        const c = checkData.lp_collision;
        lpRow.style.display = 'block';
        document.getElementById('lpCollisionName').textContent = selectedLP?.name || 'LP';

        let info = `Slot ${c.requested_time.slice(0,5)} occupied by ${c.occupied_by}`;
        if (c.next_available) {
            info += ` • Next: ${c.next_available.slice(0,5)}`;
        } else {
            info += ` • No more slots today!`;
            // Disable next slot button for LP
            const nextBtn = document.querySelector('.collision-opt[data-role="lp"][data-choice="next"]');
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.4';
            }
        }
        document.getElementById('lpCollisionInfo').textContent = info;

        // Default to adhoc
        setCollisionChoice('lp', 'adhoc');
    } else {
        lpRow.style.display = 'none';
    }

    // ALP Collision
    if (checkData.alp_collision) {
        hasCollision = true;
        const c = checkData.alp_collision;
        alpRow.style.display = 'block';
        document.getElementById('alpCollisionName').textContent = selectedALP?.name || 'ALP';

        let info = `Slot ${c.requested_time.slice(0,5)} occupied by ${c.occupied_by}`;
        if (c.next_available) {
            info += ` • Next: ${c.next_available.slice(0,5)}`;
        } else {
            info += ` • No more slots today!`;
            // Disable next slot button for ALP
            const nextBtn = document.querySelector('.collision-opt[data-role="alp"][data-choice="next"]');
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.4';
            }
        }
        document.getElementById('alpCollisionInfo').textContent = info;

        // Default to adhoc
        setCollisionChoice('alp', 'adhoc');
    } else {
        alpRow.style.display = 'none';
    }

    msgEl.innerHTML = hasCollision
        ? 'Select how to handle each collision:'
        : 'No collisions detected.';

    modal.style.display = 'flex';
}

function setCollisionChoice(role, choice) {
    collisionChoices[role] = choice;

    // Update button styles
    document.querySelectorAll(`.collision-opt[data-role="${role}"]`).forEach(btn => {
        if (btn.dataset.choice === choice) {
            btn.style.background = choice === 'adhoc' ? 'var(--warning)' : 'var(--accent)';
            btn.style.color = '#000';
            btn.style.border = 'none';
        } else {
            btn.style.background = 'var(--bg-card)';
            btn.style.color = 'var(--text-main)';
            btn.style.border = '1px solid var(--border)';
        }
    });
}

function applyCollisionChoices() {
    document.getElementById('collisionModal').style.display = 'none';

    if (!pendingPayload || !collisionInfo) {
        pendingPayload = null;
        collisionInfo = null;
        return;
    }

    // Apply LP choice
    if (collisionInfo.lp_collision) {
        if (collisionChoices.lp === 'adhoc') {
            pendingPayload.force_adhoc_lp = true;
        } else if (collisionChoices.lp === 'next' && collisionInfo.lp_collision.next_available) {
            pendingPayload.lp_next_slot_time = collisionInfo.lp_collision.next_available;
            if (collisionInfo.lp_collision.next_available_date) {
                // Always use formatDateKey to handle timezone correctly
                // ISO string like "2026-03-06T18:30:00.000Z" is actually March 7 in IST
                const lpDate = collisionInfo.lp_collision.next_available_date;
                pendingPayload.lp_next_slot_date = formatDateKey(new Date(lpDate));
            }
        }
    }

    // Apply ALP choice
    if (collisionInfo.alp_collision) {
        if (collisionChoices.alp === 'adhoc') {
            pendingPayload.force_adhoc_alp = true;
        } else if (collisionChoices.alp === 'next' && collisionInfo.alp_collision.next_available) {
            pendingPayload.alp_next_slot_time = collisionInfo.alp_collision.next_available;
            if (collisionInfo.alp_collision.next_available_date) {
                // Always use formatDateKey to handle timezone correctly
                const alpDate = collisionInfo.alp_collision.next_available_date;
                pendingPayload.alp_next_slot_date = formatDateKey(new Date(alpDate));
            }
        }
    }

    doSubmit(pendingPayload);
    pendingPayload = null;
    collisionInfo = null;
}

function resolveCollision(choice) {
    document.getElementById('collisionModal').style.display = 'none';

    if (choice === 'cancel' || !pendingPayload) {
        pendingPayload = null;
        collisionInfo = null;
        return;
    }
}

// ========== LEAVE CONFIRMATION MODAL ==========
async function handleRestChange(type, value) {
    // When Multi-Day Leave is selected, check if staff has leave application
    if (value === 'suspend') {
        const staff = type === 'lp' ? selectedLP : selectedALP;
        if (staff && staff.hrms_id) {
            await checkLeaveForMultiDay(type, staff.hrms_id, staff.name);
        }
    }
}

async function checkLeaveForMultiDay(type, hrmsId, staffName) {
    if (!hrmsId) return true;  // No staff selected, allow

    try {
        // Check if staff has any leave application (approved or pending)
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/check-leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hrms_id: hrmsId,
                office_code: SLATE_CONFIG.OFFICE_CODE
            })
        });

        const data = await res.json();

        if (data.success && !data.has_leave) {
            // No leave found - show confirmation modal
            pendingLeaveConfirm = { type, hrmsId, staffName };

            const modal = document.getElementById('leaveConfirmModal');
            const message = document.getElementById('leaveConfirmMessage');
            message.innerHTML = `
                <strong>${staffName}</strong> (${type.toUpperCase()}) is marked for Multi-Day Leave,
                but <strong>no leave application found</strong> in the system.<br><br>
                Do you want to proceed anyway or assign a normal detail instead?
            `;
            modal.style.display = 'flex';
            return false;  // Wait for user confirmation
        }

        return true;  // Has leave, proceed normally

    } catch (err) {
        console.error('Error checking leave:', err);
        return true;  // On error, allow to proceed
    }
}

function resolveLeaveConfirm(choice) {
    const modal = document.getElementById('leaveConfirmModal');
    modal.style.display = 'none';

    if (!pendingLeaveConfirm) return;

    const { type } = pendingLeaveConfirm;
    const restSelect = document.getElementById(type === 'lp' ? 'lpRest' : 'alpRest');

    if (choice === 'normal') {
        // Switch to normal rest (16hr)
        restSelect.value = '16';
        if (isManualMode) {
            calculateSlotsManual();
        } else {
            calculateSlots();
        }
        showToast(`${type.toUpperCase()} switched to Normal Rest`, 'info');
    } else if (choice === 'proceed') {
        // User confirmed to proceed with multi-day leave
        showToast(`Proceeding with Multi-Day Leave for ${type.toUpperCase()}`, 'warning');
    }
    // 'cancel' - just close modal, leave fields as-is

    pendingLeaveConfirm = null;
}

async function doSubmit(payload) {
    const lpSlotBox = document.getElementById('lpNextSlot');
    const lpDateSelect = document.getElementById('lpSlotDate');
    const alpSlotBox = document.getElementById('alpNextSlot');
    const alpDateSelect = document.getElementById('alpSlotDate');
    const lpRest = document.getElementById('lpRest').value;
    const alpRest = document.getElementById('alpRest').value;

    try {
        const res = await fetch(`${SLATE_CONFIG.API_BASE}/arrival`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            let lpAdded = false, alpAdded = false;

            // Use actual slot time/date from backend (may differ from form if collision occurred)
            const lpActualTime = data.lp_slot_time ? data.lp_slot_time.substring(0, 5) : lpSlotBox.value;
            const lpActualDate = data.lp_slot_date || lpDateSelect.value;
            const alpActualTime = data.alp_slot_time ? data.alp_slot_time.substring(0, 5) : alpSlotBox.value;
            const alpActualDate = data.alp_slot_date || alpDateSelect.value;

            if (selectedLP && lpRest !== 'suspend' && data.lp_slot_id) {
                lpAdded = addStaffToSlate({
                    slotId: data.lp_slot_id,
                    name: selectedLP.name,
                    type: 'LP',
                    time: lpActualTime,
                    date: lpActualDate,
                    isAdhoc: data.lp_is_adhoc,
                    incoming: payload.incoming_detail,
                    incomingLoco: payload.loco_no,
                    isPilot: payload.is_pilot,
                    signOffTime: payload.sign_off_time
                });
            }

            if (selectedALP && alpRest !== 'suspend' && data.alp_slot_id) {
                alpAdded = addStaffToSlate({
                    slotId: data.alp_slot_id,
                    name: selectedALP.name,
                    type: 'ALP',
                    time: alpActualTime,
                    date: alpActualDate,
                    isAdhoc: data.alp_is_adhoc,
                    incoming: payload.alp_incoming_detail || payload.incoming_detail,
                    incomingLoco: payload.loco_no,
                    isPilot: payload.alp_is_pilot !== undefined ? payload.alp_is_pilot : payload.is_pilot,
                    signOffTime: payload.alp_sign_off_time || payload.sign_off_time
                });
            }

            updateDateTabs();

            if (lpAdded && lpActualDate) {
                scrollToDate(lpActualDate);
            } else if (alpAdded && alpActualDate) {
                scrollToDate(alpActualDate);
            }

            let msg = `✅ Arrival saved! Log ID: ${data.log_id}`;
            if (data.lp_is_adhoc || data.alp_is_adhoc) {
                msg += ' (Adhoc entry created)';
            }
            if (!lpAdded && !alpAdded) {
                msg = "Arrival Saved. Staff on Multi-Day Leave - not added to board.";
            }
            showToast(msg, 'success');

            // Clear SAFE pending flag if this was a SAFE entry
            if (selectedSafeLogId) {
                try {
                    await fetch(`${SLATE_CONFIG.API_BASE}/clear-safe-pending`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ log_id: selectedSafeLogId })
                    });
                    selectedSafeLogId = null;
                    await loadPendingSafe(); // Refresh pending SAFE list
                } catch (err) {
                    console.error('Error clearing SAFE pending:', err);
                }
            }

            await loadActiveCrews();
            setTimeout(() => { clearArrivalForm(); }, 800);

        } else {
            showToast(`❌ Error: ${data.error}`, 'error');
        }
    } catch (err) {
        console.error('Submit error:', err);
        showToast('❌ Network error. Please try again.', 'error');
    }
}
