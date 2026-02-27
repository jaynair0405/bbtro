/**
 * Detail Book - Jr CC Interface for logging arrivals and assigning slots
 * Central Railway Mumbai Division - Digital Slate System
 * Depends on: slate-common.js
 */

// ========== STATE VARIABLES ==========
let activeCrews = [];
let selectedLP = null;
let selectedALP = null;
let isManualMode = false;
const dateGroups = {}; // Stores date -> { element, tables }
let pendingPayload = null;
let collisionInfo = null;

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

    // Initialize with today and tomorrow date groups
    ensureDateGroup(formatDateKey(TODAY));
    const tomorrow = new Date(TODAY.getTime());
    tomorrow.setDate(tomorrow.getDate() + 1);
    ensureDateGroup(formatDateKey(tomorrow));

    // Load active crews from API
    await loadActiveCrews();

    // Load existing slate data
    await loadSlateData();

    // Setup staff search for manual entry
    setupStaffSearch();

    // Attach date picker blur handlers
    document.getElementById('lpDatePicker').addEventListener('blur', () => handleDatePickerBlur('lp'));
    document.getElementById('alpDatePicker').addEventListener('blur', () => handleDatePickerBlur('alp'));

    // Mark tomorrow tab as active
    setTimeout(() => {
        document.querySelector('.date-tab')?.classList.add('active');
    }, 100);
});

// ========== API: LOAD SLATE DATA ==========
async function loadSlateData() {
    try {
        const data = await fetchSlateBoard(SLATE_CONFIG.OFFICE_CODE, 3);

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
                            addStaffToSlate(slot.lp_name, 'LP', slotTime, dateStr, isAdhocSlot);
                        }

                        // Add ALP if exists
                        if (slot.alp_name) {
                            addStaffToSlate(slot.alp_name, 'ALP', slotTime, dateStr, isAdhocSlot);
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
        const leaveWarning = crew.lp_leave_warning || crew.alp_leave_warning;
        const warningHtml = leaveWarning
            ? `<div style="font-size: 0.65rem; color: var(--danger); margin-top: 4px; font-weight:bold;">⚠️ ${leaveWarning.status}</div>`
            : '';

        return `
            <div class="crew-card" onclick="selectCrewCard(${crew.slate_id})">
                <div class="card-train">${crew.train_no || '--'} / ${crew.loco_no || '--'}</div>
                <div class="card-crew">LP: ${crew.lp_name || '--'}</div>
                <div class="card-crew">ALP: ${crew.alp_name || 'No ALP'}</div>
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
                No crews currently online (8+ hours). Use Manual Entry button above.
            </div>
        `;
    }
}

// ========== CLICK-TO-ARRIVE ==========
function selectCrewCard(slateId) {
    const crew = activeCrews.find(c => c.slate_id === slateId);
    if (!crew) return;

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

    selectedLP = { hrms_id: crew.lp_hrms_id, name: crew.lp_name, cms_id: crew.lp_cms_id };
    selectedALP = crew.alp_hrms_id ? { hrms_id: crew.alp_hrms_id, name: crew.alp_name, cms_id: crew.alp_cms_id } : null;

    // Fill form
    document.getElementById('incomingTrain').value = '';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('signOn').value = crew.slot_time?.substring(0, 5) || '';

    // Update LP display
    const lpSelect = document.getElementById('lpSelect');
    lpSelect.innerHTML = `<option value="${crew.lp_hrms_id}" selected>${crew.lp_name} (${crew.lp_cms_id})</option>`;
    lpSelect.disabled = true;

    // Update ALP display
    const alpSelect = document.getElementById('alpSelect');
    if (crew.alp_hrms_id) {
        alpSelect.innerHTML = `
            <option value="none">[ No ALP / Single Man ]</option>
            <option value="${crew.alp_hrms_id}" selected>${crew.alp_name} (${crew.alp_cms_id})</option>
        `;
    } else {
        alpSelect.innerHTML = `<option value="none" selected>[ No ALP / Single Man ]</option>`;
    }
    alpSelect.disabled = true;

    // Check for warnings
    checkStaffWarnings(crew);

    // Visual Flash
    const fields = ['incomingTrain', 'incomingLoco', 'lpSelect', 'alpSelect', 'signOn'];
    fields.forEach(id => flashHighlight(document.getElementById(id)));

    document.getElementById('signOff').focus();
}

function checkStaffWarnings(crew) {
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
    document.getElementById('lpRest').value = '16';
    document.getElementById('alpRest').value = '16';

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

// ========== SLOT CALCULATIONS ==========
function calculateSlotsManual() {
    const signOff = document.getElementById('signOff').value;
    let baseTime;

    if (signOff) {
        baseTime = signOff;
        document.getElementById('currentTimeDisplay').value = `Sign-off: ${signOff}`;
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
        lpSlotBox.value = "";
        lpSlotBox.disabled = true;
        lpDateSelect.disabled = true;
        lpDatePicker.disabled = true;
        lpDateLabel.textContent = "On Leave";
        lpDateLabel.style.color = "var(--danger)";
    } else {
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        const lpSlot = calculateNextSlot(baseTime, parseInt(lpRest));
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
        alpSlotBox.value = "";
        alpSlotBox.disabled = true;
        alpDateSelect.disabled = true;
        alpDatePicker.disabled = true;
        alpDateLabel.textContent = "On Leave";
        alpDateLabel.style.color = "var(--danger)";
    } else {
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        const alpSlot = calculateNextSlot(baseTime, parseInt(alpRest));
        alpSlotBox.value = alpSlot.time;
        setSlotDateDropdown('alp', formatDateKey(alpSlot.date));
        alpDateLabel.textContent = `(${alpSlot.actualRestHours}hr rest)`;
        alpDateLabel.style.color = "var(--text-muted)";
    }
}

function calculateSlots() {
    const signOff = document.getElementById('signOff').value;
    if (!signOff) return;

    // Calculate LP slot
    const lpRest = document.getElementById('lpRest').value;
    const lpSlotBox = document.getElementById('lpNextSlot');
    const lpDateSelect = document.getElementById('lpSlotDate');
    const lpDateLabel = document.getElementById('lpSlotDateLabel');
    const lpDatePicker = document.getElementById('lpDatePicker');

    if (lpRest === "suspend") {
        lpSlotBox.value = "";
        lpSlotBox.disabled = true;
        lpDateSelect.disabled = true;
        lpDatePicker.disabled = true;
        lpDateLabel.textContent = "On Leave";
        lpDateLabel.style.color = "var(--danger)";
    } else {
        lpSlotBox.disabled = false;
        lpDateSelect.disabled = false;
        lpDatePicker.disabled = false;
        const lpSlot = calculateNextSlot(signOff, parseInt(lpRest));
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
        alpSlotBox.value = "";
        alpSlotBox.disabled = true;
        alpDateSelect.disabled = true;
        alpDatePicker.disabled = true;
        alpDateLabel.textContent = "On Leave";
        alpDateLabel.style.color = "var(--danger)";
    } else {
        alpSlotBox.disabled = false;
        alpDateSelect.disabled = false;
        alpDatePicker.disabled = false;
        const alpSlot = calculateNextSlot(signOff, parseInt(alpRest));
        alpSlotBox.value = alpSlot.time;
        setSlotDateDropdown('alp', formatDateKey(alpSlot.date));
        alpDateLabel.textContent = `(${alpSlot.actualRestHours}hr rest)`;
        alpDateLabel.style.color = "var(--text-muted)";
    }
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

    // Reset form fields
    document.getElementById('incomingTrain').value = '';
    document.getElementById('incomingLoco').value = '';
    document.getElementById('signOn').value = '';
    document.getElementById('signOff').value = '';
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
        const tomorrow = new Date(TODAY);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = formatDateKey(tomorrow) === dateStr;

        let label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (isToday) label = 'Today';
        if (isTomorrow) label = 'Tmrw';

        const group = dateGroups[dateStr];
        const lpCount = group.tables.reduce((sum, t) => sum + t.querySelectorAll('td.lp-cell.new-entry').length, 0);
        const alpCount = group.tables.reduce((sum, t) => sum + t.querySelectorAll('td.alp-cell.new-entry').length, 0);
        const totalCount = lpCount + alpCount;

        return `<div class="date-tab" data-date="${dateStr}" onclick="scrollToDate('${dateStr}')">${label}${totalCount > 0 ? `<span class="count">${totalCount}</span>` : ''}</div>`;
    }).join('');

    updateVacancySummary();
}

function updateVacancySummary() {
    const dates = Object.keys(dateGroups).sort();
    let totalLpVacant = 0;
    let totalAlpVacant = 0;

    dates.forEach(dateStr => {
        const group = dateGroups[dateStr];
        group.tables.forEach(table => {
            totalLpVacant += table.querySelectorAll('td.lp-cell.empty-slot').length;
            totalAlpVacant += table.querySelectorAll('td.alp-cell.empty-slot').length;
        });
    });

    const summaryEl = document.getElementById('vacantSummary');
    if (summaryEl) {
        summaryEl.textContent = `LP: ${totalLpVacant} | ALP: ${totalAlpVacant} vacant`;
    }
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

// ========== ADD STAFF TO SLATE ==========
function addStaffToSlate(staffName, staffType, slotTime, slotDate, isAdhoc = false) {
    if (!slotTime || !slotDate) return false;

    ensureDateGroup(slotDate);

    const slotId = `slot-${slotDate}-${slotTime.replace(':', '')}`;
    let slotRow = document.getElementById(slotId);

    // If adhoc and row exists with staff already, create a new adhoc row
    if (isAdhoc && slotRow) {
        const cellType = staffType.toLowerCase();
        const existingCell = slotRow.querySelector(`td[data-type="${cellType}"]`);
        if (existingCell && existingCell.textContent.trim() && !existingCell.classList.contains('empty-slot')) {
            slotRow = createAdhocRow(slotDate, slotTime, staffName, staffType);
            return true;
        }
    }

    if (!slotRow) {
        console.error('Slot not found:', slotId);
        return false;
    }

    const cellType = staffType.toLowerCase();
    const cell = slotRow.querySelector(`td[data-type="${cellType}"]`);

    if (!cell) {
        console.error('Cell not found for type:', cellType);
        return false;
    }

    cell.textContent = staffName;
    cell.classList.remove('empty-slot');
    cell.classList.add('new-entry');

    if (isAdhoc) {
        cell.style.borderLeft = '3px solid var(--warning)';
        cell.title = 'Adhoc entry';
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

// ========== SUBMIT TO API ==========
async function submitToSlate() {
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
        payload.sign_off_time = signOff ? `${formatDateKey(TODAY)} ${signOff}:00` : null;
    } else {
        payload.incoming_detail = trainNo;
        payload.loco_no = locoNo;
        payload.sign_on_time = `${formatDateKey(TODAY)} ${signOn}:00`;
        payload.sign_off_time = `${formatDateKey(TODAY)} ${signOff}:00`;
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

            let msg = '';
            if (checkData.lp_collision) {
                const c = checkData.lp_collision;
                msg += `<strong>LP Slot ${c.requested_time.slice(0,5)}</strong> is occupied by <strong>${c.occupied_by}</strong>`;
                if (c.next_available) {
                    msg += `<br>Next available: <strong>${c.next_available.slice(0,5)}</strong>`;
                } else {
                    msg += `<br><span style="color: var(--danger);">No more slots available today!</span>`;
                }
                msg += '<br><br>';
            }
            if (checkData.alp_collision) {
                const c = checkData.alp_collision;
                msg += `<strong>ALP Slot ${c.requested_time.slice(0,5)}</strong> is occupied by <strong>${c.occupied_by}</strong>`;
                if (c.next_available) {
                    msg += `<br>Next available: <strong>${c.next_available.slice(0,5)}</strong>`;
                } else {
                    msg += `<br><span style="color: var(--danger);">No more slots available today!</span>`;
                }
            }

            document.getElementById('collisionMessage').innerHTML = msg;

            const btnNext = document.getElementById('btnNextSlot');
            if ((checkData.lp_collision && !checkData.lp_collision.next_available) ||
                (checkData.alp_collision && !checkData.alp_collision.next_available)) {
                btnNext.disabled = true;
                btnNext.style.opacity = '0.5';
            } else {
                btnNext.disabled = false;
                btnNext.style.opacity = '1';
            }

            document.getElementById('collisionModal').style.display = 'flex';
            return;
        }

    } catch (err) {
        console.error('Availability check failed:', err);
    }

    await doSubmit(payload);
}

function resolveCollision(choice) {
    document.getElementById('collisionModal').style.display = 'none';

    if (choice === 'cancel' || !pendingPayload) {
        pendingPayload = null;
        collisionInfo = null;
        return;
    }

    if (choice === 'adhoc') {
        if (collisionInfo.lp_collision) {
            pendingPayload.force_adhoc_lp = true;
        }
        if (collisionInfo.alp_collision) {
            pendingPayload.force_adhoc_alp = true;
        }
    }

    doSubmit(pendingPayload);
    pendingPayload = null;
    collisionInfo = null;
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

            if (selectedLP && lpRest !== 'suspend' && lpSlotBox.value && lpDateSelect.value) {
                lpAdded = addStaffToSlate(selectedLP.name, 'LP', lpSlotBox.value, lpDateSelect.value, data.lp_is_adhoc);
            }

            if (selectedALP && alpRest !== 'suspend' && alpSlotBox.value && alpDateSelect.value) {
                alpAdded = addStaffToSlate(selectedALP.name, 'ALP', alpSlotBox.value, alpDateSelect.value, data.alp_is_adhoc);
            }

            updateDateTabs();

            if (lpAdded && lpDateSelect.value) {
                scrollToDate(lpDateSelect.value);
            } else if (alpAdded && alpDateSelect.value) {
                scrollToDate(alpDateSelect.value);
            }

            let msg = `✅ Arrival saved! Log ID: ${data.log_id}`;
            if (data.lp_is_adhoc || data.alp_is_adhoc) {
                msg += ' (Adhoc entry created)';
            }
            if (!lpAdded && !alpAdded) {
                msg = "Arrival Saved. Staff on Multi-Day Leave - not added to board.";
            }
            showToast(msg, 'success');

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
