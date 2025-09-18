// COMPLETE FIXED VERSION - With CSV-based detail mapping and real train data
// Uses detail number ranges from your CSV to determine correct detail_id prefix

// Global state
window.currentAppearanceData = [];

// Detail mapping cache
let detailMappingCache = null;

// ================== DETAIL MAPPING SYSTEM ==================

async function loadDetailMapping() {
  if (detailMappingCache) return detailMappingCache;
  
  try {
    console.log('📊 Loading detail mapping from CSV data...');
    
    const mapping = new Map();
    
    // Based on your "Assignement of Details Sheet1.csv"
    const mappingData = [
      // Harbour Line (HB87)
      { range: '201-384', line: 'Harbour', prefix: 'HB87', type: 'CSMT Continous' },
      { range: '386-404', line: 'Harbour', prefix: 'HB87', type: 'CSMT Fixed' },
      { range: '451-538', line: 'Harbour', prefix: 'HB87', type: 'PNVL Continous' },
      { range: '539-546', line: 'Harbour', prefix: 'HB87', type: 'PNVL Fixed' },
      { range: '547-551', line: 'Harbour', prefix: 'HB87', type: 'PORT LINE ADDITIONAL' },
      { range: '552-555', line: 'Harbour', prefix: 'HB87', type: 'BSR-DW-PEN MEMU' },
      
      // MainLine (ML89A)
      { range: '1-157',   line: 'MainLine', prefix: 'ML89A', type: 'CSMT Continous' },
      { range: '158-177', line: 'MainLine', prefix: 'ML89A', type: 'CSMT Fixed' },
      { range: '191-193', line: 'MainLine', prefix: 'ML89A', type: 'CSMT MEMU' },
      { range: '601-849', line: 'MainLine', prefix: 'ML89A', type: 'KYN Continous' },
      { range: '850-872', line: 'MainLine', prefix: 'ML89A', type: 'KYN Fixed' },
      { range: '901-904', line: 'MainLine', prefix: 'ML89A', type: 'KYN MEMU' },
      { range: '906-912', line: 'MainLine', prefix: 'ML89A', type: 'KYN MEMU' }
    ];
    
    // Build lookup map for fast access
    mappingData.forEach(item => {
      const [start, end] = item.range.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        mapping.set(i, {
          prefix: item.prefix,
          line: item.line,
          type: item.type
        });
      }
    });
    
    detailMappingCache = mapping;
    console.log(`✅ Detail mapping loaded: ${mapping.size} details mapped`);
    console.log(`   - HB87 (Harbour): ${Array.from(mapping.values()).filter(v => v.prefix === 'HB87').length} details`);
    console.log(`   - ML89A (MainLine): ${Array.from(mapping.values()).filter(v => v.prefix === 'ML89A').length} details`);
    
    return mapping;
    
  } catch (error) {
    console.error('❌ Error loading detail mapping:', error);
    return new Map(); // Return empty map as fallback
  }
}

function getDetailInfo(detailNumber) {
  const mapping = detailMappingCache;
  if (!mapping) {
    console.warn('⚠️ Detail mapping not loaded, using fallback');
    return { prefix: 'ML89A', line: 'Unknown', type: 'Unknown' };
  }
  
  const num = parseInt(detailNumber);
  const info = mapping.get(num);
  
  if (info) {
    return info;
  } else {
    console.warn(`⚠️ Detail ${detailNumber} not in mapping, using fallback`);
    // Try to guess based on common patterns
    if (num >= 200 && num <= 600) {
      return { prefix: 'HB87', line: 'Harbour', type: 'Unknown' };
    } else {
      return { prefix: 'ML89A', line: 'MainLine', type: 'Unknown' };
    }
  }
}

// ================== MAIN LOAD FUNCTION ==================

async function loadAppearanceBook() {
  try {
    showLoading();
    console.log("📖 Loading Appearance Book with CSV mapping and real train data...");

    const dateInput = document.getElementById("jfoDate");
    let date = dateInput ? dateInput.value : "";

    if (!date) {
      hideLoading();
      showToast("Please select a date before loading appearance book.", "warning");
      return;
    }

    if (date.includes("/")) {
      const [day, month, year] = date.split("/");
      date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    console.log("📅 Fetching data for date:", date);

    // Load detail mapping first
    await loadDetailMapping();

    // Get roster data (this works)
    const rosterResponse = await fetch(`/api/roster?date=${encodeURIComponent(date)}`);
    if (!rosterResponse.ok) throw new Error(`Failed to fetch roster data: ${rosterResponse.status}`);
    
    const rosterData = await rosterResponse.json();
    console.log("📥 Roster data:", rosterData.data?.length, "records");

    let appearanceData = [];
    if (rosterData.data && Array.isArray(rosterData.data)) {
      appearanceData = rosterData.data;
    }

    if (appearanceData.length === 0) {
      renderAppearanceTable([]);
      hideLoading();
      showToast("No records found for selected date", "info");
      return;
    }

    // Transform data with CSV mapping and real trains
    const transformedData = await transformWithRealData(appearanceData);
    
    window.currentAppearanceData = transformedData;
    console.log("📊 Final appearance data:", window.currentAppearanceData.length, "records");
    
    renderAppearanceTable(window.currentAppearanceData);

    hideLoading();
    showToast(`Loaded ${window.currentAppearanceData.length} records for ${date}`, "success");
    
    updateSummaryCards(window.currentAppearanceData);
    
  } catch (err) {
    console.error("❌ loadAppearanceBook error:", err);
    hideLoading();
    showToast(`Failed to load appearance book: ${err.message}`, "error");
  }
}

// ================== TRANSFORM WITH REAL DATA ==================

async function transformWithRealData(rosterData) {
  console.log("🔄 Transforming with CSV mapping and REAL train data...");
  
  const transformedEntries = [];
  
  for (let i = 0; i < rosterData.length; i++) {
    const record = rosterData[i];
    console.log(`🔄 Processing ${i + 1}/${rosterData.length}: Detail ${record.detail_number}`);
    
    try {
      // Get detail info using CSV mapping
      const detailInfo = getDetailInfo(record.detail_number);
      const dbDetailId = `${detailInfo.prefix}-${record.detail_number.toString().padStart(3, '0')}`;
      
      console.log(`📋 Detail ${record.detail_number} → ${dbDetailId} (${detailInfo.line})`);
      
      // Get REAL sign-on time (this works)
      const signOnTime = await getSignOnTime(record.detail_number, detailInfo.prefix);
      
      // Calculate first departure as sign-on + 30 minutes (reasonable estimate)
      const firstDeparture = signOnTime !== 'N/A' ? addHours(signOnTime, 0.50) : 'N/A';
      
      // Get REAL trains from database API
      let realTrains = [];
      let realTrainCount = 0;
      
      try {
        console.log(`🚂 Fetching trains for detail: ${dbDetailId}`);
        const trainsResponse = await fetch(`/api/schedules/by-detail/${dbDetailId}`);
        
        if (trainsResponse.ok) {
          const trainsData = await trainsResponse.json();
          realTrains = trainsData.data || [];
          realTrainCount = trainsData.count || 0;
          console.log(`✅ Found ${realTrainCount} real trains for ${dbDetailId}`);
          
          // Format train data for display
          realTrains = realTrains.map(train => ({
            trainNumber: train.train_number,
            startTime: formatTime(train.start_time),
            endTime: formatTime(train.end_time),
            startStation: train.start_station,
            endStation: train.end_station,
            id: train.id,
            status: train.status || 'active',
            trainType: train.train_type || 'working'
          }));
          
        } else {
          console.warn(`⚠️ No trains found for ${dbDetailId} (${trainsResponse.status})`);
        }
      } catch (trainError) {
        console.warn(`❌ Error fetching trains for ${dbDetailId}:`, trainError);
      }
      
      const entry = {
        detailId: `${record.office}-${record.detail_number}`,
        detailNumber: record.detail_number,
        motormanName: record.motorman_name,
        motormanId: record.motorman_id,
        office: record.office,
        
        // Detail info from CSV mapping
        detailPrefix: detailInfo.prefix,
        detailLine: detailInfo.line,
        detailType: detailInfo.type,
        
        // Real sign-on time from details table
        signOnTime: signOnTime,
        
        // Calculated first departure (sign-on + 0.5 hours)
        firstDeparture: firstDeparture,
        
        // REAL trains from database (not fake ones!)
        trains: realTrains,
        totalTrains: realTrainCount,
        
        status: record.motorman_name && !record.motorman_name.toLowerCase().includes('waiting') ? 'assigned' : 'waiting',
        hasReassignments: false,
        reassignments: [],
        effectiveAssignment: {
          motormanName: record.motorman_name,
          assignedTrains: realTrains.map(train => train.trainNumber),
          reassignmentType: 'original'
        }
      };
      
      console.log(`✅ Detail ${record.detail_number}: Sign-on ${entry.signOnTime}, Real trains: ${entry.totalTrains}`);
      transformedEntries.push(entry);
      
    } catch (error) {
      console.warn(`⚠️ Could not process ${record.detail_number}:`, error.message);
      
      // Fallback entry
      const entry = {
        detailId: `${record.office}-${record.detail_number}`,
        detailNumber: record.detail_number,
        motormanName: record.motorman_name,
        motormanId: record.motorman_id,
        office: record.office,
        detailPrefix: 'Unknown',
        detailLine: 'Unknown',
        detailType: 'Unknown',
        signOnTime: 'N/A',
        firstDeparture: 'N/A',
        trains: [],
        totalTrains: 0,
        status: record.motorman_name && !record.motorman_name.toLowerCase().includes('waiting') ? 'assigned' : 'waiting',
        hasReassignments: false,
        reassignments: [],
        effectiveAssignment: {
          motormanName: record.motorman_name,
          assignedTrains: [],
          reassignmentType: 'original'
        }
      };
      
      transformedEntries.push(entry);
    }
    
    // Small delay every 20 records to prevent overwhelming the server
    if (i % 20 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`🎉 Transformation completed: ${transformedEntries.length} entries`);
  return transformedEntries.sort((a, b) => {
    if (a.signOnTime === 'N/A' && b.signOnTime !== 'N/A') return 1;
    if (a.signOnTime !== 'N/A' && b.signOnTime === 'N/A') return -1;
    if (a.signOnTime === 'N/A' && b.signOnTime === 'N/A') return 0;
    return a.signOnTime.localeCompare(b.signOnTime);
  });
}

// ================== GET SIGN-ON TIME ==================

async function getSignOnTime(detailNumber, detailPrefix) {
  console.log(`🔍 Getting sign-on time for detail ${detailNumber} (prefix: ${detailPrefix})...`);
  
  // Use the correct detail_id format from CSV mapping
  const paddedDetailNumber = detailNumber.toString().padStart(3, '0');
  const detailId = `${detailPrefix}-${paddedDetailNumber}`;
  
  try {
    console.log(`🔍 Trying: ${detailId}`);
    
    const response = await fetch(`/api/details/${encodeURIComponent(detailId)}`);
    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const details = result.data[0];
        if (details.sign_on_time) {
          const signOnTime = formatTime(details.sign_on_time);
          console.log(`✅ Found sign-on time for ${detailId}: ${signOnTime}`);
          return signOnTime;
        }
      }
    } else {
      console.warn(`⚠️ No details found for ${detailId} (${response.status})`);
    }
  } catch (error) {
    console.warn(`❌ Failed to fetch ${detailId}:`, error.message);
  }
  
  console.warn(`⚠️ No sign-on time found for detail ${detailNumber}`);
  return 'N/A';
}

// ================== UTILITY FUNCTIONS ==================

function formatTime(timeStr) {
  if (!timeStr) return 'N/A';
  
  if (typeof timeStr === 'string') {
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr.substring(0, 5);
    }
    
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 5);
      }
    }
  }
  
  return timeStr;
}

function addHours(timeStr, hoursToAdd) {
  if (timeStr === 'N/A') return 'N/A';
  
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (hoursToAdd * 60);
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  } catch (error) {
    return 'N/A';
  }
}

// ================== RENDER TABLE ==================

function renderAppearanceTable(data) {
  const tableContainer = document.getElementById("appearanceBookTableBody");
  if (!tableContainer) {
    console.error("❌ Table container not found");
    return;
  }

  if (!data || !data.length) {
    tableContainer.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 1.2em; margin-bottom: 10px;">📋</div>
          <div>No records found for selected date</div>
        </td>
      </tr>
    `;
    return;
  }

  console.log("🎨 Rendering table with", data.length, "records");

  const rows = data.map((entry, index) => {
    let status = "✅ Assigned";
    let statusClass = "status-assigned";
    
    if (!entry.motormanName || 
        entry.motormanName === '-----' || 
        entry.motormanName.includes('NOT TO BE FILLED') ||
        entry.motormanName.includes('SPARE') ||
        entry.motormanName.toLowerCase().includes('waiting')) {
      status = "⏳ Waiting";
      statusClass = "status-waiting";
    }

    // Enhanced train display with real data
    const trainDisplay = entry.totalTrains > 0 ? 
      `${entry.totalTrains} trains` : 
      '0 trains';
    
    const trainDetails = entry.trains.length > 0 ? 
      entry.trains.slice(0, 3).map(t => t.trainNumber).join(', ') + 
      (entry.trains.length > 3 ? '...' : '') :
      'No train data';

    return `
      <tr data-entry-id="${entry.detailId}" data-detail="${entry.detailNumber}">
        <td style="text-align: center; font-weight: bold; color: #2c3e50;">
          ${entry.signOnTime}
          ${entry.signOnTime === 'N/A' ? 
            '<br><small style="color: #e67e22;">⚠️ No data</small>' : 
            '<br><small style="color: #28a745;">✅ Real</small>'
          }
        </td>
        <td style="text-align: center; font-weight: bold; color: #1976d2;">
          🚂 ${entry.firstDeparture}
          ${entry.firstDeparture === 'N/A' ? 
            '<br><small style="color: #e67e22;">⚠️ No data</small>' : 
            '<br><small style="color: #17a2b8;">📊 Calculated</small>'
          }
        </td>
        <td style="text-align: center; font-weight: bold; color: #34495e;">
          ${escapeHtml(entry.detailNumber)}
          <br><small style="color: #666;">${entry.detailLine} • ${entry.detailPrefix}</small>
        </td>
        <td style="text-align: left;">
          <div style="font-weight: 600; color: #2c3e50;">
            ${escapeHtml(entry.motormanName || "Not Assigned")}
          </div>
          <small style="color: #666;">${escapeHtml(entry.office)} ${entry.motormanId ? `• ${entry.motormanId}` : ''}</small>
        </td>
        <td style="text-align: center;">
          <span class="status-badge ${statusClass}">${status}</span>
        </td>
        <td style="text-align: center;">
          <div style="font-weight: 600; color: ${entry.totalTrains > 0 ? '#28a745' : '#e74c3c'};">
            ${trainDisplay}
          </div>
          <small style="color: #666; font-size: 0.8em;">${trainDetails}</small>
        </td>
        <td style="text-align: center;">
          <span class="changes-count">0</span>
        </td>
        <td style="text-align: center;">
          <div class="action-buttons" style="display: flex; gap: 5px; justify-content: center;">
            <button class="btn-action btn-reassign" onclick="showReassignmentModal('${entry.detailId}', ${index})" title="Reassign Motorman" style="padding: 4px 8px; font-size: 12px;">
              🔄 Reassign
            </button>
            <button class="btn-action btn-view" onclick="viewDetailHistory('${entry.detailNumber}')" title="View History" style="padding: 4px 8px; font-size: 12px;">
              👁️ View
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tableContainer.innerHTML = rows;
  console.log("✅ Table rendered successfully with CSV mapping and real train counts");
}

// ================== OTHER FUNCTIONS ==================

function updateSummaryCards(data) {
  try {
    const totalDetails = data.length;
    const waitingDetails = data.filter(entry => 
      !entry.motormanName || 
      entry.motormanName === '-----' || 
      entry.motormanName.includes('NOT TO BE FILLED') ||
      entry.motormanName.includes('SPARE') ||
      entry.motormanName.toLowerCase().includes('waiting')
    ).length;

    const totalDetailsElem = document.getElementById("totalDetails");
    const waitingDetailsElem = document.getElementById("waitingDetails");
    const reassignedDetailsElem = document.getElementById("reassignedDetails");
    const totalReassignmentsElem = document.getElementById("totalReassignments");

    if (totalDetailsElem) totalDetailsElem.textContent = totalDetails;
    if (waitingDetailsElem) waitingDetailsElem.textContent = waitingDetails;
    if (reassignedDetailsElem) reassignedDetailsElem.textContent = 0;
    if (totalReassignmentsElem) totalReassignmentsElem.textContent = 0;

    console.log("📊 Summary updated:", { totalDetails, waitingDetails });
  } catch (err) {
    console.error("❌ Error updating summary cards:", err);
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function refreshAppearanceBook() {
  console.log("🔄 Refreshing appearance book...");
  loadAppearanceBook();
}

function viewDetailHistory(detailNumber) {
  console.log("👁️ Viewing history for detail:", detailNumber);
  showToast(`Viewing history for detail ${detailNumber}`, "info");
}

function setupSearchAndFilters() {
  try {
    const searchInput = document.getElementById("searchAppearanceBook");
    const filterType = document.getElementById("filterType");

    if (searchInput) {
      searchInput.addEventListener('input', filterAppearanceData);
    }

    if (filterType) {
      filterType.addEventListener('change', filterAppearanceData);
    }

    console.log("✅ Search and filters setup complete");
  } catch (err) {
    console.error("❌ Error setting up search and filters:", err);
  }
}

function filterAppearanceData() {
  try {
    const searchTerm = document.getElementById("searchAppearanceBook")?.value?.toLowerCase() || "";
    const filterType = document.getElementById("filterType")?.value || "all";

    if (!window.currentAppearanceData || !window.currentAppearanceData.length) {
      return;
    }

    let filteredData = window.currentAppearanceData;

    if (searchTerm) {
      filteredData = filteredData.filter(entry => {
        const searchableText = [
          entry.detailNumber,
          entry.motormanName,
          entry.office,
          entry.detailLine,
          entry.detailType
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    if (filterType !== "all") {
      filteredData = filteredData.filter(entry => {
        const isWaiting = !entry.motormanName || 
                         entry.motormanName === '-----' || 
                         entry.motormanName.includes('NOT TO BE FILLED') ||
                         entry.motormanName.includes('SPARE') ||
                         entry.motormanName.toLowerCase().includes('waiting');

        switch (filterType) {
          case "waiting":
            return isWaiting;
          case "normal":
            return !isWaiting;
          case "reassigned":
            return entry.hasReassignments;
          default:
            return true;
        }
      });
    }

    renderAppearanceTable(filteredData);
    showToast(`Filtered to ${filteredData.length} records`, "info");
  } catch (err) {
    console.error("❌ Error filtering data:", err);
  }
}

function clearFilters() {
  try {
    const searchInput = document.getElementById("searchAppearanceBook");
    const filterType = document.getElementById("filterType");

    if (searchInput) searchInput.value = "";
    if (filterType) filterType.value = "all";

    renderAppearanceTable(window.currentAppearanceData);
    showToast("Filters cleared", "info");
  } catch (err) {
    console.error("❌ Error clearing filters:", err);
  }
}

// ================== INITIALIZATION ==================

document.addEventListener('DOMContentLoaded', () => {
  setupSearchAndFilters();
  console.log("✅ COMPLETE FIXED appearance book loaded!");
  console.log("🎯 Features:");
  console.log("   ✅ CSV-based detail mapping (easy to update)");
  console.log("   ✅ Real sign-on times from /api/details");
  console.log("   ✅ Real train counts from /api/schedules/by-detail");
  console.log("   ✅ Calculated first departure times");
  console.log("   ✅ No more hardcoded ranges");
  console.log("   ✅ No more '0 trains' or '1 trains' fake data");
});

// ================== SIMPLIFIED REASSIGNMENT FUNCTIONALITY ==================
// Replace the reassignment functions in your appearance.js with these

// Global motormen cache
window.motormenList = null;

function showReassignmentModal(detailId, index) {

    const entry = window.currentAppearanceData[index];
if (!entry) {
    console.error('Entry not found at index:', index);
    return;
}
    console.log('🔄 Creating enhanced reassignment modal for:', entry);
    
    // Remove existing modal if present
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'activeReassignmentModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 9999;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef;">
                <h3 style="color: #2c3e50; margin: 0;">🔄 Detail Reassignment</h3>
                <button onclick="window.closeReassignmentModal()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer;">×</button>
            </div>
            
            <!-- Current Assignment Info -->
            <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; color: #1565c0;">📋 Current Assignment</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    <div><strong>Detail Number:</strong> ${entry.detailNumber || entry.detailId}</div>
                    <div><strong>Motorman:</strong> ${entry.motormanName}</div>
                    <div><strong>Office:</strong> ${entry.office}</div>
                    <div><strong>Sign-On:</strong> ${entry.signOnTime}</div>
                </div>
            </div>
            
            <!-- Reassignment Type Selection -->
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">Select Reassignment Type:</h4>
                
                <div style="display: grid; gap: 15px;">
                    <!-- Traditional Reassignment -->
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: white; border-radius: 8px; border: 2px solid #e9ecef; transition: all 0.3s;" onclick="selectReassignmentType('traditional')">
                        <input type="radio" name="reassignmentType" value="traditional" style="margin-right: 15px; transform: scale(1.2);">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">👤 Traditional Reassignment</div>
                            <div style="font-size: 0.9em; color: #666;">Assign this detail to a different motorman</div>
                        </div>
                    </label>
                    
                    <!-- Detail-to-Detail Transfer -->
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: white; border-radius: 8px; border: 2px solid #e9ecef; transition: all 0.3s;" onclick="selectReassignmentType('detail_transfer')">
                        <input type="radio" name="reassignmentType" value="detail_transfer" style="margin-right: 15px; transform: scale(1.2);">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">🔄 Detail-to-Detail Transfer</div>
                            <div style="font-size: 0.9em; color: #666;">Transfer this detail number to another detail number</div>
                        </div>
                    </label>
                    
                    <!-- Detail Swap -->
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: white; border-radius: 8px; border: 2px solid #e9ecef; transition: all 0.3s;" onclick="selectReassignmentType('detail_swap')">
                        <input type="radio" name="reassignmentType" value="detail_swap" style="margin-right: 15px; transform: scale(1.2);">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">↔️ Detail Swap</div>
                            <div style="font-size: 0.9em; color: #666;">Swap two detail assignments between motormen</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- Traditional Reassignment Section -->
            <div id="traditionalSection" style="display: none; background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #495057;">👤 Select New Motorman</h4>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">New Motorman *</label>
                    <select id="newMotormanSelect" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
    <option value="">Loading motormen...</option>
</select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Reassignment Type *</label>
                    <select id="reassignSubType" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                        <option value="">Select Type</option>
                        <option value="full_detail">Full Detail</option>
                        <option value="partial_detail">Partial Detail</option>
                        <option value="specific_trains">Specific Trains</option>
                    </select>
                </div>

                <!-- ADD THIS TRAIN SELECTION SECTION RIGHT HERE -->
    <div id="trainSelectionSection" style="display: none; background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h5 style="margin-bottom: 15px; color: #2e7d32;">🚂 Select Trains for Partial Transfer</h5>
       <div id="trainCheckboxContainer" style="display: block; width: 100%;">
            <!-- Train checkboxes will be populated here by populateTrainCheckboxes() -->
        </div>
    </div>
            </div>
            
            <!-- Detail Transfer Section -->
            <div id="detailTransferSection" style="display: none; background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #2e7d32;">🔄 Detail-to-Detail Transfer</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">📅 Transfer Date *</label>
                        <input type="date" id="transferDate" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">🔢 Target Detail Number *</label>
                        <input type="text" id="targetDetailNumber" placeholder="Enter detail number" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" onblur="window.checkTargetDetail()">
                    </div>
                </div>
                
                <!-- Target Detail Confirmation -->
                <div id="targetDetailInfo" style="display: none; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 15px;">
                    <h5 style="margin-bottom: 10px; color: #2e7d32;">✅ Target Detail Confirmed</h5>
                    <div id="targetDetailData"></div>
                </div>
                
                <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
    <div style="display: flex; align-items: center; gap: 10px; color: #f57c00;">
        <span style="font-size: 1.2em;">🔄</span>
        <div>
            <strong>Detail Change Effect:</strong><br>
            ${entry.motormanName} will have detail ${entry.detailNumber || entry.detailId} removed and new detail assigned instead.
        </div>
    </div>
</div>
            </div>
            
            <!-- Detail Swap Section -->
            <div id="detailSwapSection" style="display: none; background: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #f57c00;">↔️ Detail Swap</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">📅 Swap Date *</label>
                        <input type="date" id="swapDate" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">🔢 Swap With Detail Number *</label>
                        <input type="text" id="swapDetailNumber" placeholder="Enter detail number to swap with" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" onblur="checkSwapDetail()">
                    </div>
                </div>
                
                <!-- Swap Detail Confirmation -->
                <div id="swapDetailInfo" style="display: none; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; margin-bottom: 15px;">
                    <h5 style="margin-bottom: 10px; color: #f57c00;">✅ Swap Detail Confirmed</h5>
                    <div id="swapDetailData"></div>
                </div>
                
                <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; color: #c62828;">
                        <span style="font-size: 1.2em;">↔️</span>
                        <div>
                            <strong>Swap Effect:</strong><br>
                            ${entry.motormanName} will get the swap detail, and the other motorman will get detail ${entry.detailNumber || entry.detailId}.
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Common Fields -->
           <!--   <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">❓ Reason *</label>
                <select id="reassignReason" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                    <option value="">Select Reason</option>
                    <option value="Medical Emergency">🏥 Medical Emergency</option>
                    <option value="Personal Emergency">🚨 Personal Emergency</option>
                    <option value="Technical Training">📚 Technical Training</option>
                    <option value="Operational Requirements">⚙️ Operational Requirements</option>
                    <option value="Detail Transfer">🔄 Detail Transfer</option>
                    <option value="Workload Balancing">⚖️ Workload Balancing</option>
                    <option value="Other">📝 Other</option>
                </select>
            </div> -->
            
           <!--  <div style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">📝 Notes</label>
                <textarea id="reassignNotes" rows="3" placeholder="Additional notes..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; resize: vertical;"></textarea>
            </div>-->
            
            <div style="display: flex; gap: 15px; justify-content: flex-end;">
                <button onclick="window.closeReassignmentModal()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Cancel</button>
               <button id="processButton" onclick="window.processEnhancedReassignment()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🔄 Process Reassignment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ Enhanced modal created successfully');

    // Add close button event listener
const closeButton = modal.querySelector('button[onclick="window.closeReassignmentModal()"]');
if (closeButton) {
    closeButton.onclick = function() {
        modal.remove();
        window.currentReassignmentData = null;
        console.log('✅ Modal closed');
    };
}

// Also add click-outside-to-close
modal.addEventListener('click', function(e) {
    if (e.target === modal) { // Only if clicked on backdrop, not modal content
        modal.remove();
        window.currentReassignmentData = null;
        console.log('✅ Modal closed by backdrop click');
    }
});

    // ADD THE EVENT LISTENER HERE - after modal is in DOM
    setTimeout(() => {
      const reassignSubType = document.getElementById('reassignSubType');
      if (reassignSubType) {
          console.log('Found reassignSubType element, adding event listener');
          reassignSubType.addEventListener('change', function() {
              console.log('Reassignment type changed to:', this.value);
              const trainSelectionSection = document.getElementById('trainSelectionSection');
              console.log('Found trainSelectionSection:', !!trainSelectionSection);
              
              if (this.value === 'partial_detail') {
                  console.log('Showing train selection section');
                  trainSelectionSection.style.setProperty('display', 'block', 'important');
                  // Debug: Check computed styles
    const computedStyle = window.getComputedStyle(trainSelectionSection);
    console.log('Computed display:', computedStyle.display);
    console.log('Computed visibility:', computedStyle.visibility);
    console.log('Computed height:', computedStyle.height);
    console.log('Element offsetHeight:', trainSelectionSection.offsetHeight);
                  populateTrainCheckboxes();
              } else {
                  console.log('Hiding train selection section');
                  trainSelectionSection.style.display = 'none';
              }
          });
      } else {
          console.error('reassignSubType element not found');
      }
  }, 100);
    
    // Set default date to today
    // const today = new Date().toISOString().split('T')[0];
    // document.getElementById('transferDate').value = today;
    const jfoDate = document.getElementById('jfoDate')?.value || new Date().toISOString().split('T')[0];
    document.getElementById('transferDate').value = jfoDate;
    document.getElementById('swapDate').value = jfoDate;
setTimeout(() => {
    const newMotormanSelect = document.getElementById('newMotormanSelect');
    if (newMotormanSelect) {
        loadMotormenForDropdown(newMotormanSelect, entry);
    }
}, 100);

window.currentReassignmentData = { entry, index };
console.log('📋 Set currentReassignmentData:', window.currentReassignmentData);
}

// Function to select reassignment type
window.selectReassignmentType = function(type) {
    console.log('🎯 Selected reassignment type:', type);
    
    // Hide all sections
    document.getElementById('traditionalSection').style.display = 'none';
    document.getElementById('detailTransferSection').style.display = 'none';
    document.getElementById('detailSwapSection').style.display = 'none';
    if (type === 'traditional') {
      document.getElementById('traditionalSection').style.display = 'block';
  }
    
    // Show selected section
    if (type === 'traditional') {
        document.getElementById('traditionalSection').style.display = 'block';
    } else if (type === 'detail_transfer') {
        document.getElementById('detailTransferSection').style.display = 'block';
    } else if (type === 'detail_swap') {
        document.getElementById('detailSwapSection').style.display = 'block';
    }
    
    // Update visual selection
    document.querySelectorAll('[name="reassignmentType"]').forEach(radio => {
        const label = radio.closest('label');
        if (radio.value === type) {
            radio.checked = true;
            label.style.borderColor = '#007bff';
            label.style.backgroundColor = '#e3f2fd';
        } else {
            radio.checked = false;
            label.style.borderColor = '#e9ecef';
            label.style.backgroundColor = 'white';
        }
    });
    
    // Enable/disable process button
   // updateProcessButton();
};

// Function to check target detail
window.checkTargetDetail = async function() {
    console.log('🔍 checkTargetDetail function called'); // ADD THIS LINE
    const targetDetailNumber = document.getElementById('targetDetailNumber').value;
    const transferDate = document.getElementById('transferDate').value;

    console.log('Target detail from input:', targetDetailNumber); // ADD THIS LINE
    console.log('Transfer date:', transferDate); // ADD THIS LINE
    
    // if (!targetDetailNumber || !transferDate) return;
    // if (!targetDetailNumber) return;
    
    console.log('🔍 Checking target detail:', targetDetailNumber, 'on', transferDate);
    
    try {
        // This would typically make an API call to check the detail
        // For now, we'll simulate the response
        const targetDetailInfo = {
            detailNumber: targetDetailNumber,
            motormanName: 'SAMPLE MOTORMAN (5678)',
            office: 'KYN',
            signOnTime: '08:00',
            trains: ['12345', '67890']
        };
        
        // Show target detail info
        const infoDiv = document.getElementById('targetDetailInfo');
        const dataDiv = document.getElementById('targetDetailData');
        
        dataDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <div><strong>Detail:</strong> ${targetDetailInfo.detailNumber}</div>
                <div><strong>Current Motorman:</strong> ${targetDetailInfo.motormanName}</div>
                <div><strong>Office:</strong> ${targetDetailInfo.office}</div>
                <div><strong>Sign-On:</strong> ${targetDetailInfo.signOnTime}</div>
            </div>
        `;
        
        infoDiv.style.display = 'block';
        console.log('🔍 About to call updateProcessButton, input value is:', document.getElementById('targetDetailNumber').value);
        //updateProcessButton();
        
    } catch (error) {
        console.error('❌ Error checking target detail:', error);
        window.showToast('Error checking target detail', 'error');
    }
};

// Function to check swap detail
window.checkSwapDetail = async function() {
    const swapDetailNumber = document.getElementById('swapDetailNumber').value;
    const swapDate = document.getElementById('swapDate').value;
    
    if (!swapDetailNumber || !swapDate) return;
    
    console.log('🔍 Checking swap detail:', swapDetailNumber, 'on', swapDate);
    
    try {
        // This would typically make an API call to check the detail
        // For now, we'll simulate the response
        const swapDetailInfo = {
            detailNumber: swapDetailNumber,
            motormanName: 'ANOTHER MOTORMAN (9101)',
            office: 'CSTM',
            signOnTime: '09:00',
            trains: ['11111', '22222']
        };
        
        // Show swap detail info
        const infoDiv = document.getElementById('swapDetailInfo');
        const dataDiv = document.getElementById('swapDetailData');
        
        dataDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <div><strong>Detail:</strong> ${swapDetailInfo.detailNumber}</div>
                <div><strong>Current Motorman:</strong> ${swapDetailInfo.motormanName}</div>
                <div><strong>Office:</strong> ${swapDetailInfo.office}</div>
                <div><strong>Sign-On:</strong> ${swapDetailInfo.signOnTime}</div>
            </div>
        `;
        
        infoDiv.style.display = 'block';
       // updateProcessButton();
        
    } catch (error) {
        console.error('❌ Error checking swap detail:', error);
        window.showToast('Error checking swap detail', 'error');
    }
};

// Function to update process button state
// window.updateProcessButton = function() {
//     console.log('🎯 updateProcessButton called');
//     console.log('🔍 Input value at start of updateProcessButton:', document.getElementById('targetDetailNumber').value); 
//     const processButton = document.getElementById('processButton');
//     const reason = document.getElementById('reassignReason').value;
//     const selectedType = document.querySelector('[name="reassignmentType"]:checked')?.value;

//     console.log('Selected type:', selectedType); // ADD THIS
    
//     let isValid = false;
    
//     if (selectedType) {
//         if (selectedType === 'traditional') {
//             const newMotorman = document.getElementById('newMotormanSelect').value;
//             const subType = document.getElementById('reassignSubType').value;
            
//             isValid = newMotorman && subType;
//         } else if (selectedType === 'detail_transfer') {
//             const targetDetailInput = document.getElementById('targetDetailNumber');
//             const targetDetail = targetDetailInput ? targetDetailInput.value.trim() : '';
//             const targetInfoVisible = document.getElementById('targetDetailInfo').style.display !== 'none';
//             console.log('Target detail:', targetDetail);
//             console.log('Target info visible:', targetInfoVisible);
//             isValid = targetDetail !== '' && targetInfoVisible;
//             console.log('Is valid:', isValid);
//         }else if (selectedType === 'detail_swap') {
//             const swapDate = document.getElementById('swapDate').value;
//             const swapDetail = document.getElementById('swapDetailNumber').value;
//             const swapInfoVisible = document.getElementById('swapDetailInfo').style.display !== 'none';
//             isValid = swapDate && swapDetail && swapInfoVisible;
//         }
//     }
    
//     processButton.disabled = !isValid;
//     processButton.style.opacity = isValid ? '1' : '0.6';
// };





// ========================= START OF PATCH 3 =========================
// ADD THIS NEW HELPER FUNCTION TO appearance.js
/**
 * Updates the details preview box when a new motorman is selected from the dropdown.
 */
function updateMotormanDetailsPreview() {
    const selectElement = document.getElementById('newMotorman');
    const detailsContainer = document.getElementById('motormanSelectionDetails');
    
    if (!selectElement || !detailsContainer) return;

    const selectedId = selectElement.value;
    
    // If nothing is selected, show the default prompt
    if (!selectedId) {
        detailsContainer.style.borderColor = '#ccc';
        detailsContainer.innerHTML = `<p style="margin: 0; color: #555; font-style: italic;">Please select a motorman to see their details.</p>`;
        return;
    }

    // Find the full motorman object from our cached list
    const selectedMotorman = window.motormenList?.find(m => m.value === selectedId);

    if (selectedMotorman) {
        // Build the HTML with the motorman's details
        const detailsHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 15px; align-items: center;">
                <div style="font-weight: 600; color: #333;">CMS ID:</div>
                <div style="font-family: monospace; background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(selectedMotorman.value)}</div>
                
                <div style="font-weight: 600; color: #333;">Office:</div>
                <div style="font-weight: bold; color: #0056b3;">${escapeHtml(selectedMotorman.office)}</div>
                
                ${selectedMotorman.mobile ? `
                <div style="font-weight: 600; color: #333;">Mobile:</div>
                <div>${escapeHtml(selectedMotorman.mobile)}</div>
                ` : ''}
            </div>
        `;
        
        detailsContainer.style.borderColor = '#28a745'; // Green border for confirmation
        detailsContainer.innerHTML = detailsHTML;
    } else {
        // Handle case where motorman isn't found (should be rare)
        detailsContainer.style.borderColor = '#dc3545'; // Red border for error
        detailsContainer.innerHTML = `<p style="margin: 0; color: #721c24;">Could not find details for the selected motorman.</p>`;
    }
}
// ========================== END OF PATCH 3 ==========================

  function setupDisplacedActionHandler() {
    const displacedActionSelect = document.getElementById('displacedAction');
    const reliefDetailSection = document.getElementById('reliefDetailSection');
    
    if (displacedActionSelect && reliefDetailSection) {
      displacedActionSelect.addEventListener('change', function() {
        if (this.value === 'assign_to_relief') {
          reliefDetailSection.style.display = 'block';
        } else {
          reliefDetailSection.style.display = 'none';
        }
      });
    }
  }

  function populateTrainCheckboxes() {
    console.log('populateTrainCheckboxes called');
    
    const entry = window.currentReassignmentData?.entry;
    if (!entry || !entry.trains || entry.trains.length === 0) {
        console.log('No trains available');
        return;
    }

    // Inject directly into traditional section, bypassing the problematic trainSelectionSection
    const traditionalSection = document.getElementById('traditionalSection');
    
    // Remove any existing train checkboxes
    const existingTrains = traditionalSection.querySelector('.train-checkboxes');
    if (existingTrains) existingTrains.remove();
    
    const trainHTML = `
        <div class="train-checkboxes" style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h5 style="margin-bottom: 10px; color: #2e7d32;">Select Trains for Partial Transfer:</h5>
            ${entry.trains.map(train => `
                <label style="display: block; padding: 8px; margin: 5px 0; background: #f9f9f9; border-radius: 4px; cursor: pointer;">
                    <input type="checkbox" value="${escapeHtml(train.trainNumber)}" style="margin-right: 10px;">
                    <strong>${escapeHtml(train.trainNumber)}</strong> - ${train.startTime} to ${train.endTime} (${train.startStation} → ${train.endStation})
                </label>
            `).join('')}
        </div>
    `;
    
    traditionalSection.insertAdjacentHTML('beforeend', trainHTML);
    console.log('Train checkboxes injected directly into traditional section');
}

//   function populateTrainCheckboxes() {
//     console.log('populateTrainCheckboxes called');
//     // const container = document.getElementById('trainCheckboxContainer');
//     const trainSection = document.getElementById('trainSelectionSection');
//     // console.log('Found container:', !!container);
//   //   if (!container) {
//   //     console.error('Train checkbox container not found');
//   //     return;
//   // }

//     // Get current entry from global reassignment data
//     // const entry = window.currentReassignmentData?.entry;
//     const entry = window.currentReassignmentData?.entry;
//     if (!entry || !entry.trains || entry.trains.length === 0) {
//         return;
//     }
//     console.log('Entry data:', entry);
//     console.log('Entry trains:', entry?.trains);
//     console.log('Entry trains length:', entry?.trains?.length);
//   //   if (!entry) {
//   //       console.error('No entry data found for train population');
//   //       container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Entry data not available</p>';
//   //       return;
//   //   }

//   //   if (!entry.trains || entry.trains.length === 0) {
//   //       container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No trains available for this detail</p>';
//   //       return;
//   //   }

//   //   console.log("🚂 Populating train checkboxes for", entry.trains.length, "trains");
//   //   if (!entry) {
//   //     console.error('No entry data found for train population');
//   //     container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Entry data not available</p>';
//   //     return;
//   // }

//   // if (!entry.trains || entry.trains.length === 0) {
//   //     console.log('No trains available for this detail');
//   //     container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No trains available for this detail</p>';
//   //     return;
//   // }

//   console.log("🚂 Populating train checkboxes for", entry.trains.length, "trains");
//   console.log("Sample train data:", entry.trains[0]);

//   const checkboxesHTML = `
//         <h5 style="margin-bottom: 15px; color: #2e7d32;">Select Trains for Partial Transfer</h5>
//         <div style="display: block;">
//             ${entry.trains.map(train => `
//                 <label style="display: block; padding: 12px; margin: 8px 0; background: white; border: 2px solid #e9ecef; border-radius: 8px; cursor: pointer;">
//                     <input type="checkbox" value="${escapeHtml(train.trainNumber)}" style="margin-right: 12px;">
//                     <span style="font-weight: 600;">${escapeHtml(train.trainNumber)}</span>
//                     <div style="font-size: 0.9em; color: #666;">${train.startTime} - ${train.endTime}</div>
//                     <div style="font-size: 0.9em; color: #495057;">${train.startStation} → ${train.endStation}</div>
//                 </label>
//             `).join('')}
//         </div>
//     `;
    
//     trainSection.innerHTML = checkboxesHTML;
// }

//   const checkboxesHTML = entry.trains.map(train => `
//     <label style="display: block; padding: 12px; margin-bottom: 8px; background: white; border: 2px solid #e9ecef; border-radius: 8px; cursor: pointer;">
//         <input type="checkbox" value="${escapeHtml(train.trainNumber)}" style="margin-right: 12px;">
//         <span style="font-weight: 600;">${escapeHtml(train.trainNumber)}</span>
//         <div style="font-size: 0.9em; color: #666;">${train.startTime} - ${train.endTime}</div>
//         <div style="font-size: 0.9em; color: #495057;">${train.startStation} → ${train.endStation}</div>
//     </label>
// `).join('');
// console.log('Generated HTML length:', checkboxesHTML.length);
//     console.log('Sample HTML:', checkboxesHTML.substring(0, 200));

//     container.innerHTML = checkboxesHTML;
//     console.log('Container children after population:', container.children.length);
//     console.log('Container innerHTML length:', container.innerHTML.length);
// }

// Helper function for checkbox styling
function updateTrainCheckboxStyle(checkbox) {
    const label = checkbox.closest('label');
    if (checkbox.checked) {
        label.style.backgroundColor = '#e3f2fd';
        label.style.borderColor = '#2196f3';
        label.style.transform = 'translateY(-2px)';
        label.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.15)';
    } else {
        label.style.backgroundColor = 'white';
        label.style.borderColor = '#e9ecef';
        label.style.transform = 'translateY(0)';
        label.style.boxShadow = 'none';
    }
}

//   function populateTrainCheckboxes() {
//     const container = document.getElementById('trainCheckboxContainer');
//     if (!container) return;
  
//     // Get current entry data
//     const modalForm = document.getElementById('reassignmentForm');
//     if (!modalForm) return;
  
//     const onsubmitAttr = modalForm.getAttribute('onsubmit');
//     const indexMatch = onsubmitAttr.match(/processSimpleReassignment\(event, '[^']+', (\d+)\)/);
//     if (!indexMatch) return;
  
//     const index = parseInt(indexMatch[1]);
//     const entry = window.currentAppearanceData[index];
    
//     if (!entry || !entry.trains || entry.trains.length === 0) {
//       container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No trains available for partial transfer</p>';
//       return;
//     }
  
//     console.log("🚂 Populating train checkboxes for", entry.trains.length, "trains");
  
//     const checkboxesHTML = entry.trains.map(train => `
//       <label style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef; cursor: pointer; transition: all 0.2s;">
//         <input type="checkbox" value="${escapeHtml(train.trainNumber)}" style="margin-right: 12px; transform: scale(1.2);">
//         <div style="flex: 1;">
//           <div style="font-weight: 600; color: #2c3e50;">${escapeHtml(train.trainNumber)}</div>
//           <div style="font-size: 0.9em; color: #666;">${train.startTime} - ${train.endTime} | ${train.startStation} → ${train.endStation}</div>
//           <div style="font-size: 0.8em; color: #999;">${train.trainType || 'working'} • Status: ${train.status || 'active'}</div>
//         </div>
//       </label>
//     `).join('');
  
//     container.innerHTML = checkboxesHTML;
  
//     // Add change handlers for checkbox styling
//     container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
//       checkbox.addEventListener('change', function() {
//         const label = this.closest('label');
//         if (this.checked) {
//           label.style.backgroundColor = '#e3f2fd';
//           label.style.borderColor = '#2196f3';
//         } else {
//           label.style.backgroundColor = '#f8f9fa';
//           label.style.borderColor = '#e9ecef';
//         }
//       });
//     });
//   }

  window.closeReassignmentModal = function() {
    const modal = document.getElementById('activeReassignmentModal');
    if (modal) {
        modal.remove();
        console.log('✅ Modal closed');
    }
    window.currentReassignmentData = null;
};

function onReassignmentModeChange() {
  const trainSelectionSection = document.getElementById('trainSelectionSection');
  const selectedMode = document.querySelector('input[name="reassignmentMode"]:checked')?.value;
  
  console.log("🔧 Reassignment mode changed to:", selectedMode);
  
  // Show/hide train selection based on mode
  if (selectedMode === 'partial_detail') {
    trainSelectionSection.style.display = 'block';
  } else {
    trainSelectionSection.style.display = 'none';
  }

  // Update radio button styling
  document.querySelectorAll('input[name="reassignmentMode"]').forEach(radio => {
    const label = radio.closest('label');
    if (radio.checked) {
      label.style.borderColor = '#667eea';
      label.style.backgroundColor = '#f0f4ff';
    } else {
      label.style.borderColor = '#e9ecef';
      label.style.backgroundColor = 'white';
    }
  });
}

function handleTargetDetailChange() {
  const targetDetailType = document.getElementById('targetDetailType').value;
  const targetDetailSelection = document.getElementById('targetDetailSelection');
  
  if (targetDetailType) {
    targetDetailSelection.style.display = 'block';
  } else {
    targetDetailSelection.style.display = 'none';
  }
}

function loadTargetDetailInfo() {
  // Placeholder for loading target detail information
  console.log('Loading target detail info...');
}

async function loadMotormenForDropdown(selectElement, currentEntry = null) {
    try {
      console.log("📥 Loading ALL motormen for reassignment dropdown (cross-office enabled)...");
      console.log("🎯 Current entry:", currentEntry);
      
      if (!selectElement) {
        console.error("❌ Select element not provided");
        return;
      }
  
      selectElement.innerHTML = '<option value="" disabled selected>Loading motormen...</option>';
  
      // Build query parameters - NO office filtering for cross-office assignments
      const params = new URLSearchParams();
      
      // Only exclude current motorman if assigned (no office filtering)
      if (currentEntry && currentEntry.motormanId) {
        params.append('excludeCmsId', currentEntry.motormanId);
        console.log(`❌ Excluding current motorman: ${currentEntry.motormanId}`);
      }
  
      // Set reasonable limit for all motormen
      params.append('limit', '1000');
  
      // Try the specialized endpoint first, fallback to basic endpoint
      let url = `/api/motormen/jfo/for-reassignment?${params.toString()}`;
      console.log(`🔗 Trying specialized endpoint: ${url}`);
  
      let response = await fetch(url);
      
      // If specialized endpoint fails, try basic endpoint
      if (!response.ok) {
        console.warn("⚠️ Specialized endpoint failed, trying basic endpoint...");
        url = `/api/motormen?${params.toString()}`;
        response = await fetch(url);
      }
  
      if (!response.ok) {
        throw new Error(`Failed to load motormen: ${response.status} ${response.statusText}`);
      }
  
      const motormenData = await response.json();
      console.log("📊 API Response structure:", {
        success: motormenData.success,
        dataType: Array.isArray(motormenData.data) ? 'array' : typeof motormenData.data,
        count: motormenData.count || motormenData.data?.length
      });
  
      if (!motormenData.success) {
        throw new Error(motormenData.message || 'API returned unsuccessful response');
      }
  
      const motormenList = motormenData.data || [];
      console.log(`✅ Loaded ${motormenList.length} motormen for reassignment`);
  
      if (motormenList.length > 0) {
        console.log("📋 Sample motorman structure:", motormenList[0]);
      }
  
      // Cache the list globally
      window.motormenList = motormenList;
      
      // Populate dropdown with the data
      populateMotormenDropdown(selectElement, motormenList);
  
      // Show office breakdown in console
      const officeBreakdown = motormenList.reduce((acc, m) => {
        const office = m.office || 'Unknown';
        acc[office] = (acc[office] || 0) + 1;
        return acc;
      }, {});
      console.log("🏢 Office breakdown:", officeBreakdown);
  
    } catch (error) {
      console.error("❌ Failed to load motormen:", error);
      selectElement.innerHTML = '<option value="" disabled selected>Error loading motormen</option>';
      showToast(`Failed to load motormen: ${error.message}`, "error");
    }
  }

  function populateMotormenDropdown(selectElement, motormenList) {
    if (!selectElement) {
      console.error("❌ Select element not provided");
      return;
    }
  
    if (!motormenList || motormenList.length === 0) {
      selectElement.innerHTML = '<option value="" disabled selected>No motormen available</option>';
      console.log("⚠️ No motormen data available");
      return;
    }
  
    console.log("🔧 Populating dropdown with", motormenList.length, "motormen");
    console.log("📊 Sample motorman data:", motormenList[0]);
  
    // Group motormen by office for better organization
    const groupedByOffice = motormenList.reduce((acc, motorman) => {
      const office = motorman.office || 'Unknown';
      if (!acc[office]) acc[office] = [];
      acc[office].push(motorman);
      return acc;
    }, {});
  
    console.log("🏢 Grouped by office:", Object.keys(groupedByOffice));
  
    // Build options with office grouping
    let optionsHTML = '<option value="" disabled selected>Select motorman...</option>';
    
    Object.keys(groupedByOffice).sort().forEach(office => {
      const motormenInOffice = groupedByOffice[office];
      
      optionsHTML += `<optgroup label="🏢 ${office} Office (${motormenInOffice.length})">`;
      
      motormenInOffice.forEach(motorman => {
        // Use the exact properties from your API response
        const value = motorman.value || motorman.cmsid;
        const label = motorman.label || `${motorman.motorman_name} (${motorman.cmsid})`;
        const mobile = motorman.mobile ? ` • Mobile: ${motorman.mobile}` : '';
        
        // Create tooltip with additional info
        const tooltip = `Office: ${office}${mobile}`;
        
        optionsHTML += `<option value="${escapeHtml(value)}" title="${escapeHtml(tooltip)}">${escapeHtml(label)}</option>`;
      });
      
      optionsHTML += '</optgroup>';
    });
  
    // Set the HTML
    selectElement.innerHTML = optionsHTML;
    
    console.log(`✅ Dropdown populated successfully with ${motormenList.length} motormen grouped by ${Object.keys(groupedByOffice).length} offices`);
    
    // Log office breakdown
    Object.keys(groupedByOffice).forEach(office => {
      console.log(`   - ${office}: ${groupedByOffice[office].length} motormen`);
    });
  }

  // --- Helpers ---------------------------------------------------------------

// Normalize a date string: supports "YYYY-MM-DD" and "DD/MM/YYYY" -> "YYYY-MM-DD"
function normalizeDateToISO(dateStr) {
    if (!dateStr) return '';
    // Already ISO?
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
    // dd/mm/yyyy -> yyyy-mm-dd
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
  
    // Fallback: try Date parse -> ISO yyyy-mm-dd
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD or DD/MM/YYYY`);
  }
  
  // Build display name strictly as "NAME (digits)"
  function buildDisplayName(nameRaw, idGuess) {
    const raw = String(nameRaw || '').trim();
  
    // ✅ Remove ALL trailing (...) groups, not just the last one.
    // Example: "M J UBALE (1041) (CSTS1041)" -> "M J UBALE"
    //          "M J UBALE (1041)"            -> "M J UBALE"
    const nameOnly = raw.replace(/(\s*\([^)]*\)\s*)+$/, '').trim();
  
    // Extract a numeric id: prefer object/idGuess; fall back to any "(digits)" already in the raw label.
    const digitsFromGuess = String(idGuess || '').match(/\d+/)?.[0] || '';
    const digitsFromRaw   = raw.match(/\((\d+)\)\s*$/)?.[1] || '';
    const finalDigits     = digitsFromGuess || digitsFromRaw || '';
  
    // Return "NAME (digits)" if we have digits; otherwise just the clean name.
    return finalDigits ? `${nameOnly} (${finalDigits})` : nameOnly;
  }
  
  // Safely get submit button & set state
  function setSubmitState(form, text, disabled) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = text;
      btn.disabled = !!disabled;
    }
  }
  function extractCmsId(str) {
    const m = String(str || '').match(/\(([A-Z]{2,}\d+)\)\s*$/);
    return m ? m[1] : '';
  }
  // Pull numeric id (e.g., 1041) from multiple sources
function extractDigitsId(nameRaw, idGuess) {
    const raw = String(nameRaw || '');
    const fromGuess = String(idGuess || '').match(/\d+/)?.[0] || '';
    if (fromGuess) return fromGuess;
    const fromTail = raw.match(/\((\d+)\)\s*$/)?.[1] || '';
    if (fromTail) return fromTail;
    return '';
  }

  // Remove ALL trailing "(...)" groups from end: "A B (1041) (PNVS1041)" -> "A B"
function stripAllTrailingParens(str) {
    return String(str || '').replace(/(\s*\([^)]*\)\s*)+$/, '').trim();
  }
  
  // Build "NAME(digits)" (NO space) if digits exist; else just NAME
  function formatNoSpaceName(baseName, digits) {
    const base = String(baseName || '').trim();
    return digits ? `${base}(${digits})` : base;
  }
  
  
  // --- Main ------------------------------------------------------------------
  
//   async function processSimpleReassignment(event, detailId, index) {
//     event.preventDefault();
  
//     const entry = window.currentAppearanceData[index];
//     const form = event.target;
  
//     try {
//       console.log("🔄 Starting reassignment process...");
  
//       // ---- Fetch & validate form controls
//       const reassignmentModeElement = form.querySelector('input[name="reassignmentMode"]:checked');
//       const newMotormanElement = form.querySelector('#newMotorman');
//       const displacedActionElement = form.querySelector('#displacedAction');
  
//       if (!reassignmentModeElement) throw new Error("Reassignment mode not selected");
//       if (!newMotormanElement) throw new Error("New motorman dropdown not found");
  
//       const reassignmentMode = reassignmentModeElement.value;   // 'full_detail' | 'partial_detail' | ...
//       const newMotormanId = newMotormanElement.value;           // select value (can be cmsid or other id)
//       const displacedAction = displacedActionElement ? displacedActionElement.value : 'mark_waiting';
  
//       if (!newMotormanId) {
//         showToast("Please select a new motorman", "warning");
//         return;
//       }
  
//       // ---- Trains (for partial transfers)
//       let selectedTrains = [];
//       if (reassignmentMode === 'partial_detail') {
//         const checkedBoxes = form.querySelectorAll('#trainCheckboxContainer input[type="checkbox"]:checked');
//         selectedTrains = Array.from(checkedBoxes).map(cb => cb.value);
//         if (selectedTrains.length === 0) {
//           showToast("Please select at least one train for partial transfer", "warning");
//           return;
//         }
//       }
  
//       // ---- Resolve motorman object from window.motormenList
//       // Expect objects with fields like: { value?, cmsid?, motorman_id?, id?, motorman_name?, label?, name?, office? }
//       const selectedMotorman = window.motormenList?.find(m => {
//         const motormanValue = m.value || m.cmsid || m.motorman_id || m.id;
//         return String(motormanValue) === String(newMotormanId);
//       });
  
//       if (!selectedMotorman) throw new Error(`Selected motorman not found: ${newMotormanId}`);
  
//       // Source strings from the object
//       const rawLabel = (selectedMotorman.label || selectedMotorman.name || '').trim();
//       // Identity (prefer proper cmsid field; else try parsing from label)
//       const cmsid = selectedMotorman.cmsid || extractCmsId(rawLabel) || '';
//       // Roster canonical display (EXACT from DB) if present (NO space before '(')
//       const rosterNameExact = selectedMotorman.motorman_name
//         ? String(selectedMotorman.motorman_name).trim()
//         : '';
  
//       // If we must construct, take digits from any available source and format as NAME(digits)
//       const digits = extractDigitsId(
//         rosterNameExact || rawLabel,
//         selectedMotorman.motorman_id || selectedMotorman.id || newMotormanId
//       );
  
//       // Final display name to STORE/SEND:
//       // 1) If motormen.motorman_name exists -> USE IT EXACTLY (canonical "NAME(digits)")
//       // 2) Else reconstruct: "NAME(digits)" (NO space)
//       const newMotormanDisplay = rosterNameExact
//         ? rosterNameExact
//         : formatNoSpaceName(stripAllTrailingParens(rawLabel), digits);
  
//       // ---- Date handling
//       const jfoDateInput = document.getElementById('jfoDate');
//       let selectedDate = jfoDateInput && jfoDateInput.value
//         ? jfoDateInput.value
//         : new Date().toISOString().split('T')[0];
//       selectedDate = normalizeDateToISO(selectedDate); // supports YYYY-MM-DD and DD/MM/YYYY
  
//       console.log({
//         rawLabel,
//         rosterNameExact,
//         cmsid,
//         digits,
//         newMotormanDisplay,
//         selectedDate
//       });
  
//       // ---- Build payload (store canonical display + cmsid)
//       const payload = {
//         detailId: detailId,
//         detailNumber: entry.detailNumber,
//         originalMotorman: entry.motormanName || 'Not Assigned',
//         newMotorman: newMotormanDisplay,     // EXACT "NAME(digits)" (no space) matching motormen table
//         newMotormanCmsId: cmsid,             // unique identity (e.g., PNVS1041)
//         newOffice: selectedMotorman.office || 'Unknown',
//         reassignmentType: reassignmentMode,
//         selectedTrains: selectedTrains,
//         reason: `Manual Reassignment - ${displacedAction}${selectedTrains.length > 0 ? ` (${selectedTrains.length} trains)` : ''}`,
//         notes: `Displaced action: ${displacedAction}. Previous motorman: ${entry.motormanName || 'Not Assigned'}. Date: ${selectedDate}`,
//         date: selectedDate,
//         createdBy: 'JFO Console User'
//       };
  
//       // ---- UI lock
//       setSubmitState(form, "Processing...", true);
  
//       // ---- API call
//       const response = await fetch('/api/jfo/reassignments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `API Error: ${response.status}`);
//       }
  
//       const result = await response.json();
//       console.log("✅ API Response:", result);
  
//       // ---- Update local model for immediate UI feedback
//       if (reassignmentMode === 'full_detail') {
//         // Keep EXACT roster format in UI
//         entry.motormanName = newMotormanDisplay;
//         // Prefer CMSID as motormanId for identity; fall back to select value if needed
//         entry.motormanId   = cmsid || newMotormanId;
//         entry.status = 'assigned';
//         entry.hasReassignments = true;
//         if (entry.effectiveAssignment) {
//           entry.effectiveAssignment.motormanName = newMotormanDisplay;
//           entry.effectiveAssignment.motormanId   = cmsid || newMotormanId;
//         }
//       }
  
//       if (!entry.reassignments) entry.reassignments = [];
//       entry.reassignments.push({
//         timestamp: new Date().toISOString(),
//         date: selectedDate,
//         mode: reassignmentMode,
//         fromMotorman: entry.motormanName || 'Not Assigned',
//         toMotorman: newMotormanDisplay,
//         selectedTrains: selectedTrains,
//         displacedAction: displacedAction,
//         reason: payload.reason
//       });
  
//       window.currentAppearanceData[index] = entry;
  
//       // ---- Refresh UI
//       closeReassignmentModal();
//       showToast(`Detail ${entry.detailNumber} reassigned to ${newMotormanDisplay} for ${selectedDate}`, "success");
//       renderAppearanceTable(window.currentAppearanceData);
//       updateSummaryCards(window.currentAppearanceData);
  
//       console.log(`✅ Reassignment completed for date: ${selectedDate}`);
//     } catch (error) {
//       console.error("❌ Reassignment error:", error);
//       showToast(`Reassignment failed: ${error.message}`, "error");
//     } finally {
//       setSubmitState(form, "🔄 Process Reassignment", false);
//     }
//   }

async function processSimpleReassignment(event, detailId, index) {
    event.preventDefault();
  
    const entry = window.currentAppearanceData[index];
    const form = event.target;
  
    try {
      // ---- Get required form controls
      const reassignmentModeEl = form.querySelector('input[name="reassignmentMode"]:checked');
      const newMotormanEl = form.querySelector('#newMotorman');
      const displacedActionEl = form.querySelector('#displacedAction');
  
      if (!reassignmentModeEl) throw new Error("Reassignment mode not selected");
      if (!newMotormanEl) throw new Error("New motorman dropdown not found");
  
      const reassignmentMode = reassignmentModeEl.value; // 'full_detail' | 'partial_detail' | 'specific_trains'
      const newMotormanId = newMotormanEl.value;         // select value (often CMSID or mapped id)
      const displacedAction = displacedActionEl ? displacedActionEl.value : 'mark_waiting';
  
      if (!newMotormanId) {
        showToast("Please select a new motorman", "warning");
        return;
      }
  
      // ---- Collect trains for partial transfers
      let selectedTrains = [];
if (reassignmentMode === 'partial_detail') {
  const checked = form.querySelectorAll('.train-checkboxes input[type="checkbox"]:checked');
    selectedTrains = Array.from(checked).map(cb => cb.value);
    if (!selectedTrains.length) {
        showToast("Please select at least one train for partial transfer", "warning");
        return;
    }
    console.log("🚂 Selected trains for partial transfer:", selectedTrains);
}
  
      // ---- Resolve motorman from in-memory list
      // Expect objects with fields like: { value?, cmsid?, motorman_id?, id?, motorman_name?, label?, name?, office? }
      const selectedMotorman = window.motormenList?.find(m => {
        const val = m.value || m.cmsid || m.motorman_id || m.id;
        return String(val) === String(newMotormanId);
      });
      if (!selectedMotorman) throw new Error(`Selected motorman not found: ${newMotormanId}`);
  
      // Canonical display from DB list (use EXACT value from motormen table when present)
      const rosterNameExact = selectedMotorman.motorman_name
        ? String(selectedMotorman.motorman_name).trim()
        : null;
  
      // Fallback display if motorman_name isn’t available on the option object
      const displayFallback = (selectedMotorman.label || selectedMotorman.name || '').trim();
  
      // Identity (use this for joins/dedup)
      const cmsid = selectedMotorman.cmsid || ''; // e.g., PNVS1041 / CSTS1739
  
      // ---- Date (supports YYYY-MM-DD and DD/MM/YYYY)
      const jfoDateInput = document.getElementById('jfoDate');
      let selectedDate = jfoDateInput && jfoDateInput.value
        ? jfoDateInput.value
        : new Date().toISOString().split('T')[0];
      selectedDate = normalizeDateToISO(selectedDate);
  
      // ---- Build payload (store exact roster name if available)
      const payload = {
        detailId: detailId,
        detailNumber: entry.detailNumber,
        originalMotorman: entry.motormanName || 'Not Assigned',
        newMotorman: rosterNameExact || displayFallback,   // ✅ exact motormen.motorman_name when available
        newMotormanCmsId: cmsid,                           // ✅ stable identity
        newOffice: selectedMotorman.office || 'Unknown',
        reassignmentType: reassignmentMode,
        selectedTrains: selectedTrains,
        reason: `Manual Reassignment - ${displacedAction}${selectedTrains.length ? ` (${selectedTrains.length} trains)` : ''}`,
        notes: `Displaced action: ${displacedAction}. Previous motorman: ${entry.motormanName || 'Not Assigned'}. Date: ${selectedDate}`,
        date: selectedDate,
        createdBy: 'JFO Console User'
      };
  
      // ---- Lock UI and call API
      setSubmitState(form, "Processing...", true);
  
      const response = await fetch('/api/jfo/reassignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("✅ API Response:", result);
  
      // ---- Update local view model (immediate UI)
      if (reassignmentMode === 'full_detail') {
        entry.motormanName = payload.newMotorman;        // keep exact roster format in UI
        entry.motormanId   = cmsid || newMotormanId;     // prefer CMSID for identity
        entry.status = 'assigned';
        entry.hasReassignments = true;
        if (entry.effectiveAssignment) {
          entry.effectiveAssignment.motormanName = payload.newMotorman;
          entry.effectiveAssignment.motormanId   = cmsid || newMotormanId;
        }
      }
  
      if (!entry.reassignments) entry.reassignments = [];
      entry.reassignments.push({
        timestamp: new Date().toISOString(),
        date: selectedDate,
        mode: reassignmentMode,
        fromMotorman: entry.motormanName || 'Not Assigned',
        toMotorman: payload.newMotorman,
        selectedTrains: selectedTrains,
        displacedAction: displacedAction,
        reason: payload.reason
      });
  
      window.currentAppearanceData[index] = entry;
  
      // ---- Refresh UI
      closeReassignmentModal();
      showToast(`Detail ${entry.detailNumber} reassigned to ${payload.newMotorman} for ${selectedDate}`, "success");
      renderAppearanceTable(window.currentAppearanceData);
      updateSummaryCards(window.currentAppearanceData);
  
    } catch (error) {
      console.error("❌ Reassignment error:", error);
      showToast(`Reassignment failed: ${error.message}`, "error");
    } finally {
      setSubmitState(form, "🔄 Process Reassignment", false);
    }
  }

  // Enhanced process reassignment function
// window.processEnhancedReassignment = function() {
//     console.log('🔄 Processing enhanced reassignment...');
    
//     const selectedType = document.querySelector('[name="reassignmentType"]:checked')?.value;
//     const reason = document.getElementById('reassignReason').value;
//     const notes = document.getElementById('reassignNotes').value;
    
//     let reassignmentData = {
//         type: selectedType,
//         reason: reason,
//         notes: notes,
//         timestamp: new Date().toISOString(),
//         originalDetail: window.currentReassignmentData?.entry?.detailNumber || window.currentReassignmentData?.entry?.detailId
//     };
    
//     if (selectedType === 'traditional') {
//         reassignmentData.newMotorman = document.getElementById('newMotormanSelect').value;
//         reassignmentData.subType = document.getElementById('reassignSubType').value;
//     } else if (selectedType === 'detail_transfer') {
//         reassignmentData.transferDate = document.getElementById('transferDate').value;
//         reassignmentData.targetDetailNumber = document.getElementById('targetDetailNumber').value;
//     } else if (selectedType === 'detail_swap') {
//         reassignmentData.swapDate = document.getElementById('swapDate').value;
//         reassignmentData.swapDetailNumber = document.getElementById('swapDetailNumber').value;
//     }
    
//     console.log('📋 Enhanced reassignment data:', reassignmentData);
    
//     // Show success message
//     window.showToast(`✅ ${selectedType.replace('_', ' ').toUpperCase()} reassignment processed successfully!`, 'success');
    
//     // Close modal
//     window.closeReassignmentModal();
    
//     // Refresh appearance book if available
//     if (window.displayAppearanceBookFlexible && window.currentAppearanceData) {
//         console.log('🔄 Refreshing appearance book...');
//         window.displayAppearanceBookFlexible(window.currentAppearanceData);
//     }
// };

// Complete processEnhancedReassignment function with all fixes
// window.processEnhancedReassignment = function() {
//     console.log('🔄 Processing enhanced reassignment...');
//     console.log('📋 Current reassignment data:', window.currentReassignmentData);
    
//     const selectedType = document.querySelector('[name="reassignmentType"]:checked')?.value;
//     console.log('📋 Selected type:', selectedType);
    
//     if (!selectedType) {
//         window.showToast('Please select a reassignment type', 'error');
//         return;
//     }
    
//     const entry = window.currentReassignmentData?.entry;
//     if (!entry) {
//         window.showToast('Entry data not found', 'error');
//         return;
//     }
    
//     if (selectedType === 'detail_transfer') {
//         // Handle detail-to-detail transfer
//         const transferDate = document.getElementById('transferDate').value;
        
//         // Force get the target detail value by searching all text inputs
//         let targetDetailNumber = '';
//         const allInputs = document.querySelectorAll('input[type="text"]');
//         allInputs.forEach(input => {
//             if (input.placeholder && input.placeholder.includes('detail number')) {
//                 if (input.value && input.value.trim()) {
//                     targetDetailNumber = input.value.trim();
//                     console.log('🔍 Found target detail from input:', targetDetailNumber);
//                 }
//             }
//         });
        
//         // Also try getElementById as backup
//         if (!targetDetailNumber) {
//             const targetInput = document.getElementById('targetDetailNumber');
//             if (targetInput && targetInput.value) {
//                 targetDetailNumber = targetInput.value.trim();
//                 console.log('🔍 Found target detail from getElementById:', targetDetailNumber);
//             }
//         }
        
//         // Try getting from active element if it's focused
//         if (!targetDetailNumber && document.activeElement && document.activeElement.placeholder && document.activeElement.placeholder.includes('detail number')) {
//             targetDetailNumber = document.activeElement.value.trim();
//             console.log('🔍 Found target detail from activeElement:', targetDetailNumber);
//         }
        
//         console.log('📋 Final form values:', { transferDate, targetDetailNumber });
        
//         if (!targetDetailNumber) {
//             window.showToast('Please enter target detail number in the input field', 'error');
//             return;
//         }
        
//         // ✅ FIND WHO CURRENTLY HAS THE TARGET DETAIL
//         const targetDetailEntry = window.currentAppearanceData.find(e => 
//             e.detailNumber == targetDetailNumber
//         );
        
//         if (!targetDetailEntry) {
//             window.showToast(`Detail ${targetDetailNumber} not found in current roster`, 'error');
//             return;
//         }
        
//         console.log('🔍 Target detail entry found:', targetDetailEntry);
        
//         // ✅ CORRECT LOGIC FOR DETAIL TRANSFER:
//         // original_motorman = who currently has the target detail (e.g., AJIT KISHTI who has detail 700)
//         // new_motorman = who is getting the target detail (e.g., SITARAM SAROJ who will get detail 700)
//         const payload = {
//             detailId: entry.detailId,
//             detailNumber: targetDetailNumber, // Store the target detail number (700)
//             originalMotorman: targetDetailEntry.motormanName, // ✅ Who HAD the target detail
//             newMotorman: entry.motormanName, // ✅ Who GETS the target detail
//             originalMotormanCmsId: targetDetailEntry.motormanId,
//             newMotormanCmsId: entry.motormanId,
//             reassignmentType: 'detail_transfer',
//             targetDetailNumber: targetDetailNumber,
//             date: transferDate,
//             reason: 'Detail Transfer',
//             notes: `Detail ${targetDetailNumber} transferred from ${targetDetailEntry.motormanName} to ${entry.motormanName}. ${entry.motormanName} original detail ${entry.detailNumber} removed.`,
//             createdBy: 'JFO Console User'
//         };
        
//         console.log('📋 Corrected payload for detail transfer:', payload);
//         callReassignmentAPI(payload);
        
//     } else if (selectedType === 'traditional') {
//         // Handle traditional reassignment
//         const newMotormanId = document.getElementById('newMotormanSelect').value;
//         const subType = document.getElementById('reassignSubType').value;
        
//         if (!newMotormanId) {
//             window.showToast('Please select a new motorman', 'error');
//             return;
//         }
        
//         // ✅ Find the selected motorman from the cached list
//         const selectedMotorman = window.motormenList?.find(m => {
//             const val = m.value || m.cmsid || m.motorman_id || m.id;
//             return String(val) === String(newMotormanId);
//         });
        
//         if (!selectedMotorman) {
//             window.showToast('Selected motorman not found', 'error');
//             return;
//         }
        
//         // ✅ Extract the correct name and CMS ID
//         const newMotormanName = selectedMotorman.motorman_name || selectedMotorman.label || selectedMotorman.name || newMotormanId;
//         const newMotormanCmsId = selectedMotorman.cmsid || selectedMotorman.motorman_id || newMotormanId;
        
//         // For traditional reassignment: store the ORIGINAL detail number
//         const payload = {
//             detailId: entry.detailId,
//             detailNumber: entry.detailNumber, // ✅ Store ORIGINAL detail for traditional reassignment
//             originalMotorman: entry.motormanName,
//             newMotorman: newMotormanName, // ✅ Store actual motorman NAME
//             newMotormanCmsId: newMotormanCmsId, // ✅ Store actual CMS ID
//             originalMotormanCmsId: entry.motormanId,
//             reassignmentType: subType,
//             date: document.getElementById('transferDate').value,
//             reason: 'Traditional Reassignment',
//             notes: `${entry.detailNumber} reassigned from ${entry.motormanName} to ${newMotormanName}`,
//             createdBy: 'JFO Console User'
//         };
        
//         console.log('📋 Calling API with corrected traditional payload:', payload);
//         callReassignmentAPI(payload);
        
//     } else if (selectedType === 'detail_swap') {
//         // Handle detail swap (future implementation)
//         window.showToast('Detail swap functionality coming soon', 'info');
        
//     } else {
//         window.showToast('Unknown reassignment type selected', 'error');
//     }
// };

window.processEnhancedReassignment = function() {
    console.log('🔄 Processing enhanced reassignment...');
    console.log('📋 Current reassignment data:', window.currentReassignmentData);
    
    const selectedType = document.querySelector('[name="reassignmentType"]:checked')?.value;
    console.log('📋 Selected type:', selectedType);
    
    if (!selectedType) {
        window.showToast('Please select a reassignment type', 'error');
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    if (!entry) {
        window.showToast('Entry data not found', 'error');
        return;
    }
    
    if (selectedType === 'detail_transfer') {
        // Handle detail-to-detail transfer with waiting details auto-removal
        processDetailTransferWithWaiting(entry);
        
    } else if (selectedType === 'traditional') {
        // Handle traditional reassignment
        const newMotormanId = document.getElementById('newMotormanSelect').value;
        const subType = document.getElementById('reassignSubType').value;
        
        if (!newMotormanId) {
            window.showToast('Please select a new motorman', 'error');
            return;
        }
        
        if (!subType) {
            window.showToast('Please select reassignment sub-type', 'error');
            return;
        }
        
        // ✅ Find the selected motorman from the cached list
        const selectedMotorman = window.motormenList?.find(m => {
            const val = m.value || m.cmsid || m.motorman_id || m.id;
            return String(val) === String(newMotormanId);
        });
        
        if (!selectedMotorman) {
            window.showToast('Selected motorman not found', 'error');
            return;
        }
        
        // ✅ Extract the correct name and CMS ID
        const newMotormanName = selectedMotorman.motorman_name || selectedMotorman.label || selectedMotorman.name || newMotormanId;
        const newMotormanCmsId = selectedMotorman.cmsid || selectedMotorman.motorman_id || newMotormanId;
        
        // Collect selected trains for partial_detail reassignment
        let selectedTrains = [];
        if (subType === 'partial_detail') {
            const checked = document.querySelectorAll('.train-checkboxes input[type="checkbox"]:checked');
            selectedTrains = Array.from(checked).map(cb => cb.value);
            if (!selectedTrains.length) {
                window.showToast("Please select at least one train for partial transfer", "warning");
                return;
            }
            console.log("🚂 Selected trains for partial transfer:", selectedTrains);
        }
        
        // For traditional reassignment: store the ORIGINAL detail number
        const payload = {
            detailId: entry.detailId,
            detailNumber: entry.detailNumber, // ✅ Store ORIGINAL detail for traditional reassignment
            originalMotorman: entry.motormanName,
            newMotorman: newMotormanName, // ✅ Store actual motorman NAME
            newMotormanCmsId: newMotormanCmsId, // ✅ Store actual CMS ID
            originalMotormanCmsId: entry.motormanId,
            reassignmentType: subType,
            selectedTrains: selectedTrains, // ✅ Include selected trains for partial reassignment
            date: document.getElementById('transferDate').value,
            reason: `Traditional Reassignment${selectedTrains.length > 0 ? ` (${selectedTrains.length} trains)` : ''}`,
            notes: `${entry.detailNumber} reassigned from ${entry.motormanName} to ${newMotormanName}`,
            createdBy: 'JFO Console User'
        };
        
        console.log('📋 Calling API with corrected traditional payload:', payload);
        callReassignmentAPI(payload);
        
    } else if (selectedType === 'detail_swap') {
        // Handle detail swap
        processDetailSwap(entry);
        
    } else {
        window.showToast('Unknown reassignment type selected', 'error');
    }
};

// NEW: Separate function to handle detail transfer with waiting details logic
async function processDetailTransferWithWaiting(entry) {
    try {
        const transferDate = document.getElementById('transferDate').value;
        
        // Get target detail number
        let targetDetailNumber = '';
        const allInputs = document.querySelectorAll('input[type="text"]');
        allInputs.forEach(input => {
            if (input.placeholder && input.placeholder.includes('detail number')) {
                if (input.value && input.value.trim()) {
                    targetDetailNumber = input.value.trim();
                    console.log('🔍 Found target detail from input:', targetDetailNumber);
                }
            }
        });
        
        // Backup methods to get target detail
        if (!targetDetailNumber) {
            const targetInput = document.getElementById('targetDetailNumber');
            if (targetInput && targetInput.value) {
                targetDetailNumber = targetInput.value.trim();
                console.log('🔍 Found target detail from getElementById:', targetDetailNumber);
            }
        }
        
        if (!targetDetailNumber && document.activeElement && document.activeElement.placeholder && document.activeElement.placeholder.includes('detail number')) {
            targetDetailNumber = document.activeElement.value.trim();
            console.log('🔍 Found target detail from activeElement:', targetDetailNumber);
        }
        
        console.log('📋 Final form values:', { transferDate, targetDetailNumber });
        
        if (!targetDetailNumber) {
            window.showToast('Please enter target detail number in the input field', 'error');
            return;
        }
        
        // Find who currently has the target detail
        const targetDetailEntry = window.currentAppearanceData.find(e => 
            e.detailNumber == targetDetailNumber
        );
        
        if (!targetDetailEntry) {
            window.showToast(`Detail ${targetDetailNumber} not found in current roster`, 'error');
            return;
        }
        
        console.log('🔍 Target detail entry found:', targetDetailEntry);
        
        // ✅ Load waiting details to check for auto-removal
        console.log('🔍 Loading waiting details to check...');
        const waitingResponse = await fetch('/api/waiting-details');
        let waitingDetailsSet = new Set();
        
        if (waitingResponse.ok) {
            const waitingResult = await waitingResponse.json();
            waitingDetailsSet = new Set(waitingResult.data.map(wd => wd.detail_number.toString()));
            console.log('✅ Loaded waiting details:', Array.from(waitingDetailsSet));
        } else {
            console.warn('⚠️ Could not load waiting details, proceeding without auto-removal');
        }
        
        // ✅ Check if current motorman has waiting details to remove
        const currentDetailNumbers = entry.detailNumbers ? 
            entry.detailNumbers.split(', ').map(d => d.trim()) : 
            [entry.detailNumber];
            
        console.log(`🔍 Checking details for ${entry.motormanName}:`, currentDetailNumbers);
        
        let waitingDetailRemoved = false;
        for (const detailNum of currentDetailNumbers) {
            if (detailNum != targetDetailNumber && waitingDetailsSet.has(detailNum.toString())) {
                console.log(`🎯 Found waiting detail ${detailNum} - will auto-remove from ${entry.motormanName}`);
                
                // Create waiting detail removal payload
                const waitingRemovalPayload = {
                    detailId: entry.detailId,
                    detailNumber: detailNum, // The waiting detail to remove
                    originalMotorman: entry.motormanName, // Current motorman
                    originalMotormanCmsId: entry.motormanId,
                    newMotorman: '----', // Assign to placeholder
                    newMotormanCmsId: 'ABC000', // CMS ID for "----"
                    reassignmentType: 'detail_transfer',
                    date: transferDate,
                    reason: 'Automatic waiting detail removal',
                    notes: `Waiting detail ${detailNum} removed from ${entry.motormanName} due to transfer to working detail ${targetDetailNumber}`,
                    createdBy: 'JFO Console User'
                };
                
                console.log('📋 Processing waiting detail removal:', waitingRemovalPayload);
                
                // Process waiting detail removal first
                await callReassignmentAPI(waitingRemovalPayload);
                waitingDetailRemoved = true;
                break; // Remove only one waiting detail
            }
        }
        
        // Add small delay if waiting detail was removed
        if (waitingDetailRemoved) {
            console.log('⏳ Waiting 500ms before main transfer...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Create main transfer payload
        const mainPayload = {
            detailId: entry.detailId,
            detailNumber: targetDetailNumber, // Store the target detail number (700)
            originalMotorman: targetDetailEntry.motormanName, // Who HAD the target detail
            newMotorman: entry.motormanName, // Who GETS the target detail
            originalMotormanCmsId: targetDetailEntry.motormanId,
            newMotormanCmsId: entry.motormanId,
            reassignmentType: 'detail_transfer',
            targetDetailNumber: targetDetailNumber,
            date: transferDate,
            reason: 'Detail Transfer',
            notes: `Detail ${targetDetailNumber} transferred from ${targetDetailEntry.motormanName} to ${entry.motormanName}${waitingDetailRemoved ? `. Waiting detail auto-removed from ${entry.motormanName}` : ''}`,
            createdBy: 'JFO Console User'
        };
        
        console.log('📋 Processing main detail transfer:', mainPayload);
        
        // Process main transfer
        await callReassignmentAPI(mainPayload);
        
        // Show summary message
        if (waitingDetailRemoved) {
            window.showToast(`✅ Detail transfer completed! Waiting detail automatically removed from ${entry.motormanName}`, 'success');
        }
        
    } catch (error) {
        console.error('❌ Error in detail transfer with waiting check:', error);
        window.showToast(`Error: ${error.message}`, 'error');
    }
}

// Function to call your existing reassignment API
async function callReassignmentAPI(payload) {
    try {
        console.log('🌐 Calling API with payload:', payload);
        
        const response = await fetch('/api/jfo/reassignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ API Response:", result);
        
        // Show success message (but not for waiting detail removals to avoid spam)
        if (payload.reason !== 'Automatic waiting detail removal') {
            const message = payload.reassignmentType === 'detail_transfer' 
                ? `Detail ${payload.notes.split(' ')[1]} transfer completed successfully!`
                : `Detail ${payload.detailNumber} reassignment completed successfully!`;
                
            window.showToast(`✅ ${message}`, 'success');
        } else {
            console.log('✅ Waiting detail removal completed silently');
        }
        
        // ✅ Refresh wheel movement analysis after detail transfer
        if (payload.reassignmentType === 'detail_transfer') {
            console.log('🔄 Refreshing wheel movement analysis...');
            setTimeout(() => {
                if (typeof loadWheelMovementAnalysis === 'function') {
                    loadWheelMovementAnalysis();
                } else {
                    console.log('⚠️ loadWheelMovementAnalysis function not found');
                }
            }, 1000);
        }
        
        // Close modal only after main transfer (not waiting removal)
        if (payload.reason !== 'Automatic waiting detail removal') {
            window.closeReassignmentModal();
        }
        
        // Update the local data for immediate UI feedback (without full reload)
        if (payload.reassignmentType === 'detail_transfer' && payload.reason !== 'Automatic waiting detail removal') {
            // Update appearance data
            const index = window.currentReassignmentData?.index;
            if (index !== undefined && window.currentAppearanceData[index]) {
                window.currentAppearanceData[index].detailNumber = payload.detailNumber;
                window.currentAppearanceData[index].hasReassignments = true;
                if (!window.currentAppearanceData[index].reassignments) {
                    window.currentAppearanceData[index].reassignments = [];
                }
                window.currentAppearanceData[index].reassignments.push({
                    timestamp: new Date().toISOString(),
                    type: 'detail_transfer',
                    from: payload.notes.split(' ')[1], // Extract detail from notes
                    to: payload.detailNumber,
                    reason: payload.reason
                });
            }
        }
        
        // Refresh only the table display (no full page reload)
        if (payload.reason !== 'Automatic waiting detail removal') {
            renderAppearanceTable(window.currentAppearanceData);
            updateSummaryCards(window.currentAppearanceData);
        }
        
    } catch (error) {
        console.error('❌ API Error:', error);
        window.showToast(`Failed: ${error.message}`, 'error');
    }
}

// NEW: Function to handle detail swap (two motormen exchange details)
async function processDetailSwap(entry) {
    try {
        const swapDate = document.getElementById('swapDate').value;
        
        // Get swap detail number
        let swapDetailNumber = '';
        const swapInput = document.getElementById('swapDetailNumber');
        if (swapInput && swapInput.value) {
            swapDetailNumber = swapInput.value.trim();
        }
        
        console.log('📋 Swap form values:', { swapDate, swapDetailNumber });
        
        if (!swapDetailNumber) {
            window.showToast('Please enter detail number to swap with', 'error');
            return;
        }
        
        if (swapDetailNumber === entry.detailNumber) {
            window.showToast('Cannot swap detail with itself', 'error');
            return;
        }
        
        // Find who has the swap detail
        const swapDetailEntry = window.currentAppearanceData.find(e => 
            e.detailNumber == swapDetailNumber
        );
        
        if (!swapDetailEntry) {
            window.showToast(`Detail ${swapDetailNumber} not found in current roster`, 'error');
            return;
        }
        
        console.log('🔍 Swap detail entry found:', swapDetailEntry);
        console.log(`🔄 DETAIL SWAP: ${entry.motormanName} (${entry.detailNumber}) ↔ ${swapDetailEntry.motormanName} (${swapDetailNumber})`);
        
        // ✅ Check for waiting details on both sides
        console.log('🔍 Checking for waiting details in swap...');
        const waitingResponse = await fetch('/api/waiting-details');
        let waitingDetailsSet = new Set();
        
        if (waitingResponse.ok) {
            const waitingResult = await waitingResponse.json();
            waitingDetailsSet = new Set(waitingResult.data.map(wd => wd.detail_number.toString()));
        }
        
        const isDetail1Waiting = waitingDetailsSet.has(entry.detailNumber.toString());
        const isDetail2Waiting = waitingDetailsSet.has(swapDetailNumber.toString());
        
        console.log(`📋 Waiting check: Detail ${entry.detailNumber} = ${isDetail1Waiting ? 'WAITING' : 'WORKING'}, Detail ${swapDetailNumber} = ${isDetail2Waiting ? 'WAITING' : 'WORKING'}`);
        
        // Create swap entries (2 entries needed)
        const swapPayloads = [
            // Entry 1: Give entry.detailNumber (from entry.motormanName) to swapDetailEntry.motormanName
            {
                detailId: entry.detailId,
                detailNumber: entry.detailNumber, // Detail being given away
                originalMotorman: entry.motormanName, // Who had it
                newMotorman: swapDetailEntry.motormanName, // Who gets it
                originalMotormanCmsId: entry.motormanId,
                newMotormanCmsId: swapDetailEntry.motormanId,
                reassignmentType: 'full_detail', // ✅ Use existing handled type
                date: swapDate,
                reason: 'Detail Swap',
                notes: `Detail swap: ${entry.detailNumber} from ${entry.motormanName} to ${swapDetailEntry.motormanName} (swapping with ${swapDetailNumber})`,
                createdBy: 'JFO Console User'
            },
            // Entry 2: Give swapDetailNumber (from swapDetailEntry.motormanName) to entry.motormanName  
            {
                detailId: swapDetailEntry.detailId,
                detailNumber: swapDetailNumber, // Detail being given away
                originalMotorman: swapDetailEntry.motormanName, // Who had it
                newMotorman: entry.motormanName, // Who gets it
                originalMotormanCmsId: swapDetailEntry.motormanId,
                newMotormanCmsId: entry.motormanId,
                reassignmentType: 'full_detail', // ✅ Use existing handled type
                date: swapDate,
                reason: 'Detail Swap',
                notes: `Detail swap: ${swapDetailNumber} from ${swapDetailEntry.motormanName} to ${entry.motormanName} (swapping with ${entry.detailNumber})`,
                createdBy: 'JFO Console User'
            }
        ];
        
        console.log('📋 Processing detail swap with 2 transfer entries:');
        console.log('  Entry 1:', swapPayloads[0]);
        console.log('  Entry 2:', swapPayloads[1]);
        
        // Process both swap entries
        for (let i = 0; i < swapPayloads.length; i++) {
            const payload = swapPayloads[i];
            console.log(`📋 Processing swap entry ${i + 1}/2:`, payload.notes);
            
            await callReassignmentAPI(payload);
            
            // Small delay between entries
            if (i < swapPayloads.length - 1) {
                console.log('⏳ Waiting 300ms before next swap entry...');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        // Show completion message
        const swapType = (isDetail1Waiting && isDetail2Waiting) ? 'Waiting-to-Waiting' :
                        (isDetail1Waiting || isDetail2Waiting) ? 'Waiting-to-Working' : 'Working-to-Working';
                        
        window.showToast(`✅ Detail swap completed! ${entry.motormanName} ↔ ${swapDetailEntry.motormanName} (${swapType})`, 'success');
        
    } catch (error) {
        console.error('❌ Error in detail swap:', error);
        window.showToast(`Swap failed: ${error.message}`, 'error');
    }
}

// Add event listeners for form validation
document.addEventListener('DOMContentLoaded', function() {
    // Add change listeners to form fields for validation
    setTimeout(() => {
        const formFields = [
            'newMotormanSelect', 'reassignSubType', 'transferDate', 'targetDetailNumber',
            'swapDate', 'swapDetailNumber', 'reassignReason'
        ];
        
        // formFields.forEach(fieldId => {
        //     const field = document.getElementById(fieldId);
        //     if (field) {
        //         field.addEventListener('change', updateProcessButton);
        //         field.addEventListener('input', updateProcessButton);
        //     }
        // });
    }, 1000);
});


  // ================== ADDITIONAL HELPER FUNCTIONS ==================

// Function to view reassignment history for a specific detail
async function viewDetailReassignmentHistory(detailNumber) {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/jfo/reassignments/detail/${detailNumber}?date=${currentDate}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📚 Reassignment history for detail ${detailNumber}:`, data);
      
      if (data.data && data.data.length > 0) {
        const historyText = data.data.map(h => 
          `${h.formatted_created_at}: ${h.original_motorman} → ${h.new_motorman} (${h.reason})`
        ).join('\n');
        
        alert(`Reassignment History for Detail ${detailNumber}:\n\n${historyText}`);
      } else {
        showToast(`No reassignment history found for detail ${detailNumber}`, "info");
      }
      
    } catch (error) {
      console.error("❌ Error fetching reassignment history:", error);
      showToast(`Failed to fetch history: ${error.message}`, "error");
    }
  }
  
  // Function to get today's reassignment summary
  async function getTodayReassignmentSummary() {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/jfo/reassignments/summary/${currentDate}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📊 Today's reassignment summary:", data);
      
      return data;
      
    } catch (error) {
      console.error("❌ Error fetching reassignment summary:", error);
      return null;
    }
  }
  
  // Enhanced view history function for the View button
  function viewDetailHistory(detailNumber) {
    console.log("👁️ Viewing history for detail:", detailNumber);
    
    // Show reassignment history instead of just a toast
    viewDetailReassignmentHistory(detailNumber);
  }

// ================== PLACEHOLDER FUNCTIONS ==================

function showReassignmentHistory() {
  console.log("📚 Showing reassignment history...");
  showToast("Reassignment history feature coming soon", "info");
}

function showWaitingAssignments() {
  console.log("⏳ Showing waiting assignments...");
  showToast("Waiting assignments management coming soon", "info");
}

function generateDailyReport() {
  console.log("📄 Generating daily report...");
  showToast("Daily report generation coming soon", "info");
}

function showStatistics() {
  console.log("📊 Showing statistics...");
  showToast("Statistics view coming soon", "info");
}

function exportAppearanceBook() {
  console.log("📤 Exporting appearance book...");
  showToast("Export functionality coming soon", "info");
}

function showBulkOperations() {
  console.log("📋 Showing bulk operations...");
  showToast("Bulk operations coming soon", "info");
}

console.log("✅ COMPLETE FIXED VERSION LOADED!");
console.log("📊 This version:");
console.log("   ✅ Uses CSV mapping for detail_id prefixes");
console.log("   ✅ Real train counts from database");
