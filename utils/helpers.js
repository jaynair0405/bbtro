// ===== UTILITY HELPER FUNCTIONS =====

// ✅ Normalizes to your DB format: removes spaces, hyphens, uppercase
function normalizeTrainNumber(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[\s-]+/g, "").toUpperCase();
  }
  
  // ✅ Checks validity after normalization
  function isTrainNumberValid(str) {
    const cleaned = normalizeTrainNumber(str);
    return /^[A-Z]+\d+$/.test(cleaned); // letters + digits only
  }
  
  function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.slice(0, 5); // HH:MM format
  }
  
  // Date range generator
  function generateDateRange(fromDate, toDate) {
    const dates = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);
  
    console.log(`📅 Generating date range from ${fromDate} to ${toDate}`);
  
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dates.push(dateString);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }
  
  function parseTimeToMinutes(timeString) {
    if (!timeString) return 0;
    
    const timeStr = timeString.toString();
    const parts = timeStr.split(':');
    
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return (hours * 60) + minutes;
    }
    
    return 0;
  }
  
  function calculateTrainWheelMovement(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    let durationMinutes = endMinutes - startMinutes;
    
    // Handle next day scenario (e.g., 23:30 to 01:30)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Add 24 hours
    }
    
    return durationMinutes;
  }
  
  function parseDutyHours(dutyHoursString) {
    if (!dutyHoursString || dutyHoursString === '0:00') return 0;
    
    if (dutyHoursString.includes(':')) {
      const parts = dutyHoursString.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return (hours * 60) + minutes;
    }
    
    return 0;
  }
  
  function minutesToTimeString(minutes) {
    if (!minutes || minutes === 0) return '0:00';
    
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
  }
  
  function calculateCrossMidnightDutyHours(signOnTime, signOffTime) {
    if (!signOnTime || !signOffTime) return 0;
    
    const signOnMinutes = parseTimeToMinutes(signOnTime);
    const signOffMinutes = parseTimeToMinutes(signOffTime);
    
    let dutyMinutes = signOffMinutes - signOnMinutes;
    
    // Handle cross-midnight scenario
    if (dutyMinutes <= 0) {
      dutyMinutes += 24 * 60; // Add 24 hours
    }
    
    return dutyMinutes;
  }
  
  module.exports = {
    normalizeTrainNumber,
    isTrainNumberValid,
    formatTime,
    generateDateRange,
    parseTimeToMinutes,
    calculateTrainWheelMovement,
    parseDutyHours,
    minutesToTimeString,
    calculateCrossMidnightDutyHours
  };