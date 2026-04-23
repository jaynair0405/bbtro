/**
 * Slate Common - Shared utilities for Detail Book and Slate pages
 * Central Railway Mumbai Division - Digital Slate System
 */

// ========== CONFIGURATION ==========
const SLATE_CONFIG = {
    API_BASE: '/api/division/slate',
    OFFICE_CODE: 'PNVL-ML', // Will be dynamic later based on user session
    MAX_ADVANCE_DAYS: 10,   // Maximum days in advance for slot assignment
    SLOT_INTERVAL: 15,      // Minutes between slots
    SLOTS_PER_SHIFT: 32,    // 8 hours * 4 slots/hour
    REFRESH_INTERVAL: 30000 // Auto-refresh every 30 seconds
};

// Current working date (set to midnight)
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

// ========== DATE UTILITIES ==========

/**
 * Format date as YYYY-MM-DD in local timezone (avoids UTC shift)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string YYYY-MM-DD
 */
function formatDateKey(date) {
    if (typeof date === 'string') date = new Date(date + 'T00:00:00');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "27 Feb, Thu")
 * @param {Date} date - Date object
 * @returns {string} Formatted display string
 */
function formatDateDisplay(date) {
    const options = { day: '2-digit', month: 'short', weekday: 'short' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Format time string (HH:MM)
 * @param {string} time - Time string (may include seconds or be a datetime)
 * @returns {string} Formatted time HH:MM
 */
function formatTime(time) {
    if (!time) return '--';
    // Handle datetime format: "2026-04-03 02:15:00" or "2026-04-03T02:15:00"
    if (time.includes(' ')) {
        const timePart = time.split(' ')[1];
        return timePart ? timePart.substring(0, 5) : '--';
    }
    if (time.includes('T')) {
        const timePart = time.split('T')[1];
        return timePart ? timePart.substring(0, 5) : '--';
    }
    // Handle time-only format: "02:15:00" or "02:15"
    return time.substring(0, 5);
}

/**
 * Get shift index from hour (0=00-08, 1=08-16, 2=16-24)
 * @param {number} hour - Hour of day (0-23)
 * @returns {number} Shift index (0, 1, or 2)
 */
function getShiftIndex(hour) {
    if (hour >= 0 && hour < 8) return 0;
    if (hour >= 8 && hour < 16) return 1;
    return 2;
}

/**
 * Get shift code from index
 * @param {number} index - Shift index (0, 1, or 2)
 * @returns {string} Shift code ('00_08', '08_16', '16_24')
 */
function getShiftCode(index) {
    const codes = ['00_08', '08_16', '16_24'];
    return codes[index] || '08_16';
}

/**
 * Get shift label for display
 * @param {number} index - Shift index (0, 1, or 2)
 * @returns {string} Shift label ('00:00 x 08:00', etc.)
 */
function getShiftLabel(index) {
    const labels = ['00:00 x 08:00', '08:00 x 16:00', '16:00 x 24:00'];
    return labels[index] || labels[1];
}

/**
 * Get current shift index based on current time
 * @returns {number} Current shift index (0, 1, or 2)
 */
function getCurrentShiftIndex() {
    const hour = new Date().getHours();
    return getShiftIndex(hour);
}

/**
 * Generate slot times for a shift (every 15 minutes)
 * @param {number} shiftIndex - Shift index (0, 1, or 2)
 * @returns {string[]} Array of time strings ['00:00', '00:15', ...]
 */
function generateSlotTimes(shiftIndex) {
    const slots = [];
    const startHour = shiftIndex * 8; // 0, 8, or 16
    for (let h = startHour; h < startHour + 8; h++) {
        for (let m = 0; m < 60; m += SLATE_CONFIG.SLOT_INTERVAL) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    return slots;
}

/**
 * Calculate next available slot time based on sign-off and rest hours
 * @param {string} signOffTime - Sign-off time (HH:MM)
 * @param {number} restHours - Required rest hours
 * @returns {object} { time: 'HH:MM', date: Date, dateLabel: string, dayOffset: number, actualRestHours: number }
 */
function calculateNextSlot(signOffTime, restHours) {
    // Create datetime from today + sign-off time
    const [hours, minutes] = signOffTime.split(':').map(Number);
    const signOffDate = new Date(TODAY.getTime()); // Clone TODAY
    signOffDate.setHours(hours, minutes, 0, 0);

    // Add rest hours
    const nextSlotDate = new Date(signOffDate.getTime() + (restHours * 60 * 60 * 1000));

    // Extract time
    const slotTime = `${String(nextSlotDate.getHours()).padStart(2, '0')}:${String(nextSlotDate.getMinutes()).padStart(2, '0')}`;

    // Calculate day offset
    const todayMidnight = new Date(TODAY.getTime());
    const slotMidnight = new Date(nextSlotDate.getTime());
    slotMidnight.setHours(0, 0, 0, 0);
    const dayOffset = Math.round((slotMidnight - todayMidnight) / (24 * 60 * 60 * 1000));

    // Format date label
    let dateLabel = '';
    if (dayOffset === 0) {
        dateLabel = 'Today';
    } else if (dayOffset === 1) {
        dateLabel = 'Tomorrow';
    } else {
        const options = { day: '2-digit', month: 'short' };
        dateLabel = nextSlotDate.toLocaleDateString('en-IN', options);
    }

    return {
        time: slotTime,
        date: nextSlotDate,
        dateLabel: dateLabel,
        dayOffset: dayOffset,
        actualRestHours: restHours
    };
}

// ========== STATUS UTILITIES ==========

/**
 * Get CSS class for status
 * @param {string} status - Status code (AVAILABLE, FORECAST, SIGNED_ON, ONLINE)
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
    const statusMap = {
        'AVAILABLE': 'row-waiting',
        'FORECAST': 'row-forecast',
        'SIGNED_ON': 'row-signed-on',
        'ONLINE': 'row-online',
        'SAFE': 'row-safe',
        'BOOKED': 'row-booked'
    };
    return statusMap[status] || 'row-waiting';
}

/**
 * Get display label for status
 * @param {string} status - Status code
 * @returns {string} Display label
 */
function getStatusLabel(status) {
    const labels = {
        'AVAILABLE': 'Waiting',
        'FORECAST': 'Forecast',
        'SIGNED_ON': 'Sign-On',
        'ONLINE': 'Online'
    };
    return labels[status] || 'Waiting';
}

/**
 * Get status emoji indicator
 * @param {string} status - Status code
 * @returns {string} Emoji indicator
 */
function getStatusIndicator(status) {
    const indicators = {
        'AVAILABLE': '⬜',
        'FORECAST': '🔵',
        'SIGNED_ON': '🟡',
        'ONLINE': '🟢'
    };
    return indicators[status] || '⬜';
}

// ========== SHIFT COLOR UTILITIES ==========

/**
 * Get shift color class
 * @param {number} shiftIndex - Shift index (0, 1, or 2)
 * @returns {string} CSS class name
 */
function getShiftColorClass(shiftIndex) {
    const classes = ['shift-night', 'shift-day', 'shift-evening'];
    return classes[shiftIndex] || 'shift-day';
}

/**
 * Get shift color hex value
 * @param {number} shiftIndex - Shift index (0, 1, or 2)
 * @returns {string} Hex color code
 */
function getShiftColor(shiftIndex) {
    const colors = ['#3b82f6', '#22c55e', '#f97316']; // Blue, Green, Orange
    return colors[shiftIndex] || colors[1];
}

// ========== API UTILITIES ==========

/**
 * Fetch slots from API
 * @param {string} officeCode - Office code
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<object>} API response
 */
async function fetchSlots(officeCode, date) {
    const res = await fetch(`${SLATE_CONFIG.API_BASE}/slots?office_code=${officeCode}&date=${date}`);
    return await res.json();
}

/**
 * Fetch multiple days of slate data
 * @param {string} officeCode - Office code
 * @param {number} days - Number of days to fetch
 * @param {string} startDate - Optional start date (YYYY-MM-DD), defaults to today
 * @returns {Promise<object>} API response
 */
async function fetchSlateBoard(officeCode, days = 3, startDate = null) {
    let url = `${SLATE_CONFIG.API_BASE}/board?office_code=${officeCode}&days=${days}`;
    if (startDate) {
        url += `&date=${startDate}`;
    }
    const res = await fetch(url);
    return await res.json();
}

/**
 * Fetch active/returning crews
 * @param {string} officeCode - Office code
 * @returns {Promise<object>} API response
 */
async function fetchActiveCrews(officeCode) {
    const res = await fetch(`${SLATE_CONFIG.API_BASE}/active-crews?office_code=${officeCode}`);
    return await res.json();
}

/**
 * Search staff
 * @param {string} officeCode - Office code
 * @param {string} query - Search query
 * @param {string} type - Staff type ('lp' or 'alp')
 * @returns {Promise<object>} API response
 */
async function searchStaff(officeCode, query, type) {
    const res = await fetch(`${SLATE_CONFIG.API_BASE}/staff/search?office_code=${officeCode}&q=${encodeURIComponent(query)}&type=${type}`);
    return await res.json();
}

// ========== UI UTILITIES ==========

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type ('success', 'error', 'info')
 * @param {number} duration - Duration in ms (default 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

/**
 * Flash highlight effect on element
 * @param {HTMLElement} element - Element to highlight
 * @param {string} color - Highlight color (CSS color)
 * @param {number} duration - Duration in ms
 */
function flashHighlight(element, color = '#10b981', duration = 800) {
    if (!element) return;
    element.style.boxShadow = `0 0 0 2px ${color}`;
    setTimeout(() => element.style.boxShadow = 'none', duration);
}

/**
 * Format rest type for API
 * @param {string} restValue - Rest dropdown value ('16', '30')
 * @returns {string} API enum value
 */
function mapRestType(restValue) {
    const map = {
        '16': 'NORMAL',
        '30': 'PR'
    };
    return map[restValue] || 'NORMAL';
}

/**
 * Calculate minimum days off based on rest type and leave selection
 * @param {string} restType - Rest type ('16' for Normal, '30' for PR)
 * @param {string} leave - Leave selection ('0', '1B', '2B', '3B', '1A', '2A', '3A', 'MULTI')
 * @returns {number} Minimum days until next slot
 */
function calculateMinDaysOff(restType, leave) {
    // Base rest days: Normal=1, PR=2
    let days = (restType === '30') ? 2 : 1;

    // Add leave days
    if (leave && leave !== '0' && leave !== 'MULTI') {
        const leaveDays = parseInt(leave.charAt(0));
        if (!isNaN(leaveDays)) {
            days += leaveDays;
        }
    }

    return days;
}

/**
 * Parse leave selection to get days and position
 * @param {string} leave - Leave selection ('0', '1B', '2B', '3B', '1A', '2A', '3A', 'MULTI')
 * @returns {object} { days: number, position: 'before'|'after'|null, isMultiDay: boolean }
 */
function parseLeaveSelection(leave) {
    if (!leave || leave === '0') {
        return { days: 0, position: null, isMultiDay: false };
    }
    if (leave === 'MULTI') {
        return { days: 0, position: null, isMultiDay: true };
    }

    const days = parseInt(leave.charAt(0));
    const position = leave.charAt(1) === 'B' ? 'before' : 'after';

    return { days, position, isMultiDay: false };
}

// ========== LATE ARRIVAL CHECK ==========

/**
 * Check if staff arrival time is late (after slot time)
 * @param {string} slotDate - Slot date (YYYY-MM-DD or Date string)
 * @param {string} slotTime - Slot time (HH:MM or HH:MM:SS)
 * @param {string} signedOnAt - Actual sign-on time (HH:MM or HH:MM:SS or datetime string)
 * @returns {boolean} True if late arrival
 */
function isLateArrival(slotDate, slotTime, signedOnAt) {
    if (!slotTime || !signedOnAt) return false;

    try {
        // Extract HH:MM from slot time
        const slotTimeStr = slotTime.substring(0, 5);
        const [slotHour, slotMin] = slotTimeStr.split(':').map(Number);

        // Extract HH:MM from signed on time (may be datetime or just time)
        let signedOnTimeStr = signedOnAt;
        if (signedOnAt.includes(' ')) {
            // It's a datetime string like "2026-04-03 02:15:00"
            signedOnTimeStr = signedOnAt.split(' ')[1];
        }
        signedOnTimeStr = signedOnTimeStr.substring(0, 5);
        const [signedHour, signedMin] = signedOnTimeStr.split(':').map(Number);

        // Compare times (consider as late if signed on time > slot time)
        const slotMinutes = slotHour * 60 + slotMin;
        const signedMinutes = signedHour * 60 + signedMin;

        return signedMinutes > slotMinutes;
    } catch (e) {
        console.error('Error checking late arrival:', e);
        return false;
    }
}

// ========== EXPORTS (for module systems) ==========
// These are available globally when included via script tag

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SLATE_CONFIG,
        TODAY,
        formatDateKey,
        formatDateDisplay,
        formatTime,
        getShiftIndex,
        getShiftCode,
        getShiftLabel,
        getCurrentShiftIndex,
        generateSlotTimes,
        calculateNextSlot,
        getStatusClass,
        getStatusLabel,
        getStatusIndicator,
        getShiftColorClass,
        getShiftColor,
        fetchSlots,
        fetchSlateBoard,
        fetchActiveCrews,
        searchStaff,
        showToast,
        flashHighlight,
        mapRestType,
        calculateMinDaysOff,
        parseLeaveSelection
    };
}
