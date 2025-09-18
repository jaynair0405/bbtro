// Updated script.js for MySQL backend integration
const app = {};

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
  loadDashboardData();
});

function initializeApp() {
  // Tab switching
  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".content-section");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const sectionId = tab.dataset.section;
      sections.forEach(s => {
        if (s.id === sectionId) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });

      // Load section-specific data
      handleSectionSwitch(sectionId);
    });
  });

  // Set current date
  const now = new Date();
  const dateString = now.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const currentDateElem = document.getElementById("currentDate");
  if (currentDateElem) currentDateElem.textContent = dateString;

  // Set today's date for date inputs
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['cancelledDate', 'singleCancelDate', 'mlDate', 'hbDate', 'mgmtDate', 'dutyDate', 'cancellationDate', 'wheelFromDate', 'wheelToDate'];
  dateInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input && !input.value) {
      input.value = today;
    }
  });
}

function setupEventListeners() {
  // Main line schedule
  const loadMainlineBtn = document.getElementById("loadMainlineBtn");
  if (loadMainlineBtn) {
    loadMainlineBtn.addEventListener("click", () => loadSchedule('mainline'));
  }

  // Harbour line schedule
  const loadHarbourBtn = document.getElementById("loadHarbourBtn");
  if (loadHarbourBtn) {
    loadHarbourBtn.addEventListener("click", () => loadSchedule('harbour'));
  }

  // Management search
  const searchMgmtBtn = document.getElementById("searchMgmtBtn");
  if (searchMgmtBtn) {
    searchMgmtBtn.addEventListener("click", searchManagementSchedules);
  }

  // Schedule management buttons
  const addScheduleBtn = document.getElementById("addScheduleBtn");
  if (addScheduleBtn) {
    addScheduleBtn.addEventListener("click", showAddScheduleModal);
  }

  const uploadCsvBtn = document.getElementById("uploadCsvBtn");
  if (uploadCsvBtn) {
    uploadCsvBtn.addEventListener("click", handleCsvUpload);
  }

  // Duty roster
  const loadDutyRosterBtn = document.getElementById("loadDutyRosterBtn");
  if (loadDutyRosterBtn) {
    loadDutyRosterBtn.addEventListener("click", loadDutyRoster);
  }

  // Cancellations
  const loadCancellationsBtn = document.getElementById("loadCancellationsBtn");
  if (loadCancellationsBtn) {
    loadCancellationsBtn.addEventListener("click", loadCancellations);
  }

  // Wheel movement analysis
  const showWheelAnalysisBtn = document.getElementById("showWheelAnalysisBtn");
  if (showWheelAnalysisBtn) {
    showWheelAnalysisBtn.addEventListener("click", loadWheelMovementAnalysis);
  }

  // Modal handlers
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  if (closeModal) closeModal.addEventListener("click", hideScheduleModal);
  if (cancelBtn) cancelBtn.addEventListener("click", hideScheduleModal);

  // Form submission
  const scheduleForm = document.getElementById("scheduleForm");
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", handleScheduleSubmit);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleSectionSwitch(sectionId) {
  switch(sectionId) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'wheel-movement':
      loadWheelMovementFilters();
      break;
    default:
      break;
  }
}

function handleKeyboardShortcuts(e) {
  // Ctrl+N for new schedule
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    showAddScheduleModal();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    hideScheduleModal();
  }
}

// ===== DASHBOARD FUNCTIONS =====

async function loadDashboardData() {
  try {
    showLoading("Loading dashboard data...");
    const response = await fetch('/api/dashboard/stats');
    const data = await response.json();

    if (response.ok) {
      updateDashboardCards(data);
    } else {
      showToast("Failed to load dashboard data", "error");
    }
  } catch (error) {
    console.error("Dashboard load error:", error);
    showToast("Error loading dashboard data", "error");
  } finally {
    hideLoading();
  }
}

function updateDashboardCards(data) {
  // Update mainline card
  const mainlineCount = document.getElementById("mainlineCount");
  const mainlineActive = document.getElementById("mainlineActive");
  const mainlineCancelled = document.getElementById("mainlineCancelled");
  const mainlineDelayed = document.getElementById("mainlineDelayed");

  if (mainlineCount) mainlineCount.textContent = data.mainline.total;
  if (mainlineActive) mainlineActive.textContent = data.mainline.active;
  if (mainlineCancelled) mainlineCancelled.textContent = data.mainline.cancelled;
  if (mainlineDelayed) mainlineDelayed.textContent = data.mainline.delayed;

  // Update harbour card
  const harbourCount = document.getElementById("harbourCount");
  const harbourActive = document.getElementById("harbourActive");
  const harbourCancelled = document.getElementById("harbourCancelled");
  const harbourDelayed = document.getElementById("harbourDelayed");

  if (harbourCount) harbourCount.textContent = data.harbour.total;
  if (harbourActive) harbourActive.textContent = data.harbour.active;
  if (harbourCancelled) harbourCancelled.textContent = data.harbour.cancelled;
  if (harbourDelayed) harbourDelayed.textContent = data.harbour.delayed;

  // Update totals
  const todayUpdates = document.getElementById("todayUpdates");
  const lastUpdate = document.getElementById("lastUpdate");

  if (todayUpdates) todayUpdates.textContent = data.totalUpdates;
  if (lastUpdate) {
    const updateTime = new Date(data.lastUpdate).toLocaleTimeString();
    lastUpdate.textContent = updateTime;
  }

  // Add animation to numbers
  animateNumbers();
}

function animateNumbers() {
  const numberElements = document.querySelectorAll('.train-count');
  numberElements.forEach(element => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'countUp 1s ease-out';
  });
}

// ===== SCHEDULE FUNCTIONS =====

async function loadSchedule(line) {
  try {
    showLoading(`Loading ${line} schedule...`);
    
    const date = document.getElementById(`${line === 'mainline' ? 'ml' : 'hb'}Date`).value;
    const station = document.getElementById(`${line === 'mainline' ? 'ml' : 'hb'}Station`).value;
    const status = document.getElementById(`${line === 'mainline' ? 'ml' : 'hb'}Status`).value;

    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (station) params.append('station', station);
    if (status) params.append('status', status);

    const response = await fetch(`/api/schedules/${line}?${params.toString()}`);
    const data = await response.json();

    if (response.ok) {
      populateScheduleTable(line, data.data);
      showToast(`Loaded ${data.data.length} ${line} schedules`, "success");
    } else {
      showToast(`Failed to load ${line} schedules`, "error");
    }
  } catch (error) {
    console.error(`${line} schedule load error:`, error);
    showToast(`Error loading ${line} schedules`, "error");
  } finally {
    hideLoading();
  }
}

function populateScheduleTable(line, schedules) {
  const tableId = line === 'mainline' ? 'mainlineTableBody' : 'harbourTableBody';
  const tbody = document.getElementById(tableId);
  
  if (!tbody) return;

  tbody.innerHTML = '';

  if (schedules.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
          No schedules found for the selected criteria
        </td>
      </tr>
    `;
    return;
  }

  schedules.forEach((schedule, index) => {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = getStatusClass(schedule.status);
    const statusIcon = getStatusIcon(schedule.status);
    
    row.innerHTML = `
      <td><strong>${schedule.scheduleId}</strong><br><small>${schedule.detailNumber || ''}</small></td>
      <td>
        <strong>${schedule.trainNumber}</strong><br>
        <small>${schedule.dutyHours || ''} hrs</small>
      </td>
      <td>
        ${schedule.route}<br>
        <small>${schedule.signOnTime || ''} - ${schedule.signOffTime || ''}</small>
      </td>
      <td>
        ${schedule.startTime} → ${schedule.endTime}<br>
        <small>Movement: ${schedule.wheelMovement || 'N/A'}</small>
      </td>
      <td>
        <span class="status-indicator ${statusClass}">
          ${statusIcon} ${schedule.status}
        </span>
        ${schedule.cancellationReason ? `<br><small>Reason: ${schedule.cancellationReason}</small>` : ''}
      </td>
      <td>
        <button onclick="editSchedule(${schedule.id})" class="btn-sm btn-primary">Edit</button>
        <button onclick="deleteSchedule(${schedule.id})" class="btn-sm btn-danger">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

function getStatusClass(status) {
  switch(status) {
    case 'active': return 'status-active';
    case 'cancelled': return 'status-cancelled';
    case 'delayed': return 'status-delayed';
    default: return 'status-active';
  }
}

function getStatusIcon(status) {
  switch(status) {
    case 'active': return '✅';
    case 'cancelled': return '❌';
    case 'delayed': return '⏰';
    default: return '•';
  }
}

// ===== SCHEDULE MANAGEMENT =====

async function searchManagementSchedules() {
  try {
    showLoading("Searching schedules...");
    
    const line = document.getElementById('mgmtLine').value;
    const date = document.getElementById('mgmtDate').value;
    const search = document.getElementById('mgmtSearch').value;

    const params = new URLSearchParams();
    if (line) params.append('line', line);
    if (date) params.append('date', date);
    if (search) params.append('search', search);

    const response = await fetch(`/api/management/schedules?${params.toString()}`);
    const data = await response.json();

    if (response.ok) {
      populateManagementTable(data.data);
      showToast(`Found ${data.data.length} schedules`, "success");
    } else {
      showToast("Failed to search schedules", "error");
    }
  } catch (error) {
    console.error("Management search error:", error);
    showToast("Error searching schedules", "error");
  } finally {
    hideLoading();
  }
}

function populateManagementTable(schedules) {
  const tbody = document.getElementById('managementTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (schedules.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
          No schedules found. Try adjusting your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  schedules.forEach((schedule, index) => {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.05}s`;
    
    const statusClass = getStatusClass(schedule.status);
    const statusIcon = getStatusIcon(schedule.status);
    
    row.innerHTML = `
      <td><strong>${schedule.scheduleId}</strong><br><small>${schedule.detailNumber || ''}</small></td>
      <td><span class="line-badge ${schedule.line}">${schedule.line.toUpperCase()}</span></td>
      <td><strong>${schedule.trainNumber}</strong></td>
      <td>${schedule.route}</td>
      <td>${schedule.startTime} → ${schedule.endTime}</td>
      <td>
        <span class="status-indicator ${statusClass}">
          ${statusIcon} ${schedule.status}
        </span>
      </td>
      <td>
        <button onclick="editSchedule(${schedule.id})" class="btn-sm btn-primary">✏️</button>
        <button onclick="deleteSchedule(${schedule.id})" class="btn-sm btn-danger">🗑️</button>
        <button onclick="viewScheduleDetails(${schedule.id})" class="btn-sm btn-info">👁️</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Schedule CRUD operations
function showAddScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('scheduleForm');
  
  if (title) title.textContent = 'Add New Schedule';
  if (form) form.reset();
  if (modal) modal.style.display = 'block';
  
  // Set current editing ID to null for new schedule
  app.currentEditingId = null;
}

function hideScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) modal.style.display = 'none';
}

async function editSchedule(id) {
  try {
    // For now, we'll use the management search data
    // In a full implementation, you'd fetch individual schedule details
    showToast("Edit functionality - would load schedule details", "info");
    showAddScheduleModal();
    app.currentEditingId = id;
    
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Edit Schedule';
    
  } catch (error) {
    console.error("Edit schedule error:", error);
    showToast("Error loading schedule for editing", "error");
  }
}

async function deleteSchedule(id) {
  if (!confirm('Are you sure you want to delete this schedule?')) {
    return;
  }

  try {
    const response = await fetch(`/api/schedules/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast("Schedule deleted successfully", "success");
      searchManagementSchedules(); // Refresh the table
    } else {
      showToast("Failed to delete schedule", "error");
    }
  } catch (error) {
    console.error("Delete schedule error:", error);
    showToast("Error deleting schedule", "error");
  }
}

async function handleScheduleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const scheduleData = {
    scheduleId: formData.get('scheduleId'),
    line: formData.get('line'),
    trainNumber: formData.get('trainNumber'),
    startStation: formData.get('startStation'),
    startTime: formData.get('startTime'),
    endStation: formData.get('endStation'),
    endTime: formData.get('endTime'),
    status: formData.get('status'),
    remarks: formData.get('remarks')
  };

  try {
    const url = app.currentEditingId ? 
      `/api/schedules/${app.currentEditingId}` : 
      '/api/schedules';
    
    const method = app.currentEditingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleData)
    });

    if (response.ok) {
      const action = app.currentEditingId ? 'updated' : 'added';
      showToast(`Schedule ${action} successfully`, "success");
      hideScheduleModal();
      searchManagementSchedules(); // Refresh the table
    } else {
      const error = await response.json();
      showToast(error.message || 'Failed to save schedule', "error");
    }
  } catch (error) {
    console.error("Schedule submit error:", error);
    showToast("Error saving schedule", "error");
  }
}

// ===== CSV UPLOAD FUNCTIONS =====

function handleCsvUpload() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>📁 Upload CSV Files</h2>
      <div style="display: grid; gap: 20px;">
        <div style="padding: 20px; border: 2px dashed #667eea; border-radius: 10px;">
          <h4>📊 Upload Details CSV</h4>
          <p>Upload ML89A or HB87 details file</p>
          <input type="file" id="detailsCsvFile" accept=".csv" style="margin: 10px 0;"/>
          <button onclick="uploadDetailsCSV()" class="btn-primary">Upload Details</button>
        </div>
        <div style="padding: 20px; border: 2px dashed #28a745; border-radius: 10px;">
          <h4>🚂 Upload Trains CSV</h4>
          <p>Upload train schedules file</p>
          <input type="file" id="trainsCsvFile" accept=".csv" style="margin: 10px 0;"/>
          <button onclick="uploadTrainsCSV()" class="btn-primary" style="background: #28a745;">Upload Trains</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function uploadDetailsCSV() {
  const fileInput = document.getElementById('detailsCsvFile');
  if (!fileInput.files.length) {
    showToast("Please select a CSV file", "error");
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    showLoading("Uploading details CSV...");
    const response = await fetch('/upload/details', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      showToast(result.message, "success");
      fileInput.value = '';
    } else {
      showToast(result.message || "Upload failed", "error");
    }
  } catch (error) {
    console.error("Details upload error:", error);
    showToast("Upload error", "error");
  } finally {
    hideLoading();
  }
}

async function uploadTrainsCSV() {
  const fileInput = document.getElementById('trainsCsvFile');
  if (!fileInput.files.length) {
    showToast("Please select a CSV file", "error");
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    showLoading("Uploading trains CSV...");
    const response = await fetch('/upload/trains', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      showToast(result.message, "success");
      fileInput.value = '';
    } else {
      showToast(result.message || "Upload failed", "error");
    }
  } catch (error) {
    console.error("Trains upload error:", error);
    showToast("Upload error", "error");
  } finally {
    hideLoading();
  }
}

// ===== DUTY ROSTER FUNCTIONS =====

app.handleDutyRosterUpload = function (office) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .xlsx";
  
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
  
      // Get date from the global date picker (from improved upload section)
      const globalDateInput = document.getElementById('globalRosterDate');
      let date = globalDateInput ? globalDateInput.value : null;
      
      // Fallback to dutyDate if globalRosterDate doesn't exist (backward compatibility)
      if (!date) {
        const dutyDateInput = document.getElementById('dutyDate');
        date = dutyDateInput ? dutyDateInput.value : null;
      }
      
      // Final fallback to prompt (as your original code did)
      if (!date) {
        date = prompt("📅 Enter the date for this roster (YYYY-MM-DD):");
      }
      
      if (!date) {
        showToast("⚠️ Date is required!", "warning");
        return;
      }
  
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        showToast("⚠️ Please enter date in YYYY-MM-DD format", "warning");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("date", date);
      formData.append("office", office);
  
      console.log(`📋 Uploading ${office} roster for ${date}:`, file.name);
  
      try {
        showLoading(`Uploading ${office} duty roster...`);
        const res = await fetch("/upload/roster", {
          method: "POST",
          body: formData,
        });
  
        const result = await res.json();
        if (res.ok) {
          showToast(result.message || `✅ ${office} roster uploaded successfully!`, "success");
          
          // Refresh the data if loadDutyRoster function exists
          if (typeof loadDutyRoster === 'function') {
            loadDutyRoster();
          }
          
          console.log('✅ Upload successful:', result);
        } else {
          showToast("❌ Error: " + (result.message || "Upload failed"), "error");
          console.error('❌ Upload failed:', result);
        }
      } catch (err) {
        console.error("Roster upload failed:", err);
        showToast("❌ Upload error: " + err.message, "error");
      } finally {
        hideLoading();
      }
    });
  
    // Trigger file selection
    input.click();
  };
  
  // Enhanced loadDutyRoster function with better error handling
  async function loadDutyRoster() {
    // Try multiple date input sources (for flexibility)
    let date = null;
    const globalDateInput = document.getElementById('globalRosterDate');
    const dutyDateInput = document.getElementById("dutyDate");
    
    if (globalDateInput && globalDateInput.value) {
      date = globalDateInput.value;
    } else if (dutyDateInput && dutyDateInput.value) {
      date = dutyDateInput.value;
    }
    
    if (!date) {
      showToast("⚠️ Please select a date to load duty roster", "warning");
      return;
    }
  
    const officeInput = document.getElementById("dutyOffice");
    const searchInput = document.getElementById("dutySearch");
    
    const office = officeInput ? officeInput.value : "";
    const search = searchInput ? searchInput.value.trim() : "";
  
    const params = new URLSearchParams({ date });
    if (office) params.append('office', office);
    if (search) params.append('search', search);
  
    console.log(`📋 Loading duty roster for ${date}`, { office, search });
  
    try {
      showLoading("Loading duty roster...");
      const res = await fetch(`/api/roster?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const result = await res.json();
      
      console.log('📊 Roster data received:', result);
      
      if (result.data) {
        populateDutyRosterTable(result.data);
        updateDutyStats(result.data);
        showToast(`✅ Loaded ${result.data.length} duty records for ${date}`, "success");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching roster:", err);
      showToast(`❌ Error loading duty roster: ${err.message}`, "error");
      
      // Clear table on error
      const tbody = document.getElementById("dutyRosterTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;color:#dc3545;padding:20px;">
              ❌ Failed to load duty roster: ${err.message}
            </td>
          </tr>
        `;
      }
    } finally {
      hideLoading();
    }
  }
  
  // Enhanced populateDutyRosterTable with better formatting
  function populateDutyRosterTable(records) {
    const tbody = document.getElementById("dutyRosterTableBody");
    if (!tbody) {
      console.warn('Table body element "dutyRosterTableBody" not found');
      return;
    }
  
    tbody.innerHTML = "";
  
    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#666;padding:30px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">📅</div>
            <div>No duty roster records found for the selected criteria</div>
            <div style="font-size: 0.9em; color: #999; margin-top: 8px;">
              Try selecting a different date or adjusting filters
            </div>
          </td>
        </tr>
      `;
      return;
    }
  
    console.log(`📋 Populating table with ${records.length} records`);
  
    records.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.style.animationDelay = `${index * 0.05}s`;
      tr.style.opacity = '0';
      tr.style.animation = 'fadeInUp 0.6s ease forwards';
      
      // Format date nicely
      const formattedDate = row.date ? new Date(row.date).toLocaleDateString('en-IN') : '-';
      
      tr.innerHTML = `
        <td>
          <strong style="color: #2c3e50;">${row.detail_number}</strong>
        </td>
        <td>
          <div style="font-weight: 500;">${row.motorman_name}</div>
          ${row.motorman_id ? `<small style="color: #666;">${row.motorman_id}</small>` : ''}
        </td>
        <td>
          <span class="office-badge ${row.office.toLowerCase()}" style="
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 0.8em; 
            font-weight: 600;
            ${getOfficeBadgeStyle(row.office)}
          ">${row.office}</span>
        </td>
        <td>${formattedDate}</td>
        <td>${row.formatted_upload_time || new Date(row.uploaded_at).toLocaleTimeString('en-IN') || "-"}</td>
        <td>
          <button onclick="viewDutyDetails('${row.detail_number}', '${row.date}')" 
                  class="btn-sm" 
                  style="
                    padding: 6px 12px; 
                    background: #17a2b8; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 0.8em;
                  ">
            📋 View Details
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // Helper function for office badge styling
  function getOfficeBadgeStyle(office) {
    switch(office) {
      case 'CSMT': return 'background: #667eea; color: white;';
      case 'KYN': return 'background: #28a745; color: white;';
      case 'PNVL': return 'background: #ffc107; color: #212529;';
      default: return 'background: #6c757d; color: white;';
    }
  }
  
  // Enhanced updateDutyStats with better animation
  function updateDutyStats(data) {
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data provided to updateDutyStats');
      return;
    }
  
    const csmt = data.filter(r => r.office === "CSMT").length;
    const kyn = data.filter(r => r.office === "KYN").length;
    const pnvl = data.filter(r => r.office === "PNVL").length;
  
    const stats = [
      { id: "csmtCount", value: csmt },
      { id: "kynCount", value: kyn },
      { id: "pnvlCount", value: pnvl },
      { id: "totalDutyCount", value: data.length }
    ];
  
    stats.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        // Animate number change
        animateCountUp(element, value);
      }
    });
  
    console.log('📊 Stats updated:', { csmt, kyn, pnvl, total: data.length });
  }
  
  // Helper function for count-up animation
  function animateCountUp(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const step = (targetValue - startValue) / (duration / 16);
    let currentValue = startValue;
    
    const animation = setInterval(() => {
      currentValue += step;
      if ((step > 0 && currentValue >= targetValue) || (step < 0 && currentValue <= targetValue)) {
        element.textContent = targetValue;
        clearInterval(animation);
      } else {
        element.textContent = Math.round(currentValue);
      }
    }, 16);
  }
  
  // Add CSS for animation if not already present
  if (!document.querySelector('#dutyRosterAnimations')) {
    const style = document.createElement('style');
    style.id = 'dutyRosterAnimations';
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes countUp {
        from { transform: scale(1); }
        50% { transform: scale(1.1); }
        to { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize date picker on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today for any date input
    const dateInputs = ['globalRosterDate', 'dutyDate'];
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input && !input.value) {
        input.value = today;
      }
    });
    
    console.log('📅 Date inputs initialized with today\'s date:', today);
  });

// ===== CANCELLATION FUNCTIONS =====

// Bulk Cancelled Train Upload Logic
async function uploadCancelled() {
  const fileInput = document.getElementById("cancelledFileInput");
  const dateInput = document.getElementById("cancelledDate");
  const resultPara = document.getElementById("cancelledUploadResult");

  // Clear previous results
  if (resultPara) {
    resultPara.textContent = "";
    resultPara.className = "";
    resultPara.style.display = "none";
  }

  // Validation
  if (!fileInput || !fileInput.files.length) {
    showToast("Please select a CSV or Excel file", "error");
    return;
  }

  if (!dateInput || !dateInput.value) {
    showToast("Please select a date", "error");
    return;
  }

  // File type validation
  const file = fileInput.files[0];
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(fileExtension)) {
    showToast("Please select a valid CSV or Excel file", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("date", dateInput.value);

  try {
    showLoading("Uploading cancelled trains...");
    const res = await fetch("/upload/cancelled", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const message = data.message || `✅ Successfully uploaded cancelled trains for ${dateInput.value}`;

    // Show success in result paragraph
    if (resultPara) {
      resultPara.textContent = message;
      resultPara.className = "success";
      resultPara.style.display = "block";
    }

    // Show success toast
    showToast(message, "success");

    // Clear the file input
    fileInput.value = "";
    
    // Refresh cancellations if we're on that tab
    if (document.getElementById('train-cancellations').classList.contains('active')) {
      loadCancellations();
    }
    
  } catch (err) {
    console.error("Upload error:", err);
    const errorMsg = "❌ Upload failed. Please try again.";

    // Show error in result paragraph
    if (resultPara) {
      resultPara.textContent = errorMsg;
      resultPara.className = "error";
      resultPara.style.display = "block";
    }

    // Show error toast
    showToast(errorMsg, "error");
  } finally {
    hideLoading();
  }
}

// Single Train Cancellation Function
async function cancelSingleTrain() {
  const dateInput = document.getElementById('singleCancelDate');
  const trainNumberInput = document.getElementById('singleTrainNumber');
  const reasonSelect = document.getElementById('cancellationReason');
  const notesTextarea = document.getElementById('additionalNotes');

  // Validation
  if (!dateInput || !dateInput.value) {
    showToast('Please select a date', 'error');
    if (dateInput) dateInput.focus();
    return;
  }

  if (!trainNumberInput || !trainNumberInput.value.trim()) {
    showToast('Please enter a train number', 'error');
    if (trainNumberInput) trainNumberInput.focus();
    return;
  }

  if (!reasonSelect || !reasonSelect.value) {
    showToast('Please select a cancellation reason', 'error');
    if (reasonSelect) reasonSelect.focus();
    return;
  }

  // Prepare cancellation data
  const cancellationData = {
    date: dateInput.value,
    trainNumber: trainNumberInput.value.trim(),
    reason: reasonSelect.value,
    notes: notesTextarea ? notesTextarea.value.trim() : '',
    timestamp: new Date().toISOString(),
    office: getCurrentUserOffice()
  };

  try {
    showLoading('Cancelling train...');
    const res = await fetch("/cancel/single", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cancellationData)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const message = data.message || `✅ Train ${cancellationData.trainNumber} cancelled successfully for ${cancellationData.date}`;
    showToast(message, 'cancellation');

    // Clear the form
    clearSingleCancellationForm();

    // Refresh cancellations view
    loadCancellations();
    
  } catch (err) {
    console.error("Cancellation error:", err);
    const errorMsg = "❌ Failed to cancel train. Please try again.";
    showToast(errorMsg, 'error');
  } finally {
    hideLoading();
  }
}

async function loadCancellations() {
  const date = document.getElementById("cancellationDate").value;
  const office = document.getElementById("cancellationOffice").value;
  const search = document.getElementById("cancellationSearch").value.trim();

  if (!date) {
    showToast("Please select a date", "warning");
    return;
  }

  const params = new URLSearchParams({ date });
  if (office) params.append('office', office);
  if (search) params.append('search', search);

  try {
    showLoading("Loading cancellations...");
    const res = await fetch(`/api/cancellations?${params.toString()}`);
    const result = await res.json();
    
    if (res.ok) {
      populateCancellationTable(result.data);
      updateCancellationStats(result.stats);
      showToast(`Loaded ${result.data.length} cancellation records`, "success");
    } else {
      showToast(result.message || "Failed to load cancellations", "error");
    }
  } catch (err) {
    console.error("Error fetching cancellations:", err);
    showToast("Error loading cancellations", "error");
  } finally {
    hideLoading();
  }
}

function populateCancellationTable(records) {
  const tbody = document.getElementById("cancellationTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#666;padding:20px;">
          No cancelled trains found for the selected criteria
        </td>
      </tr>
    `;
    return;
  }

  records.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.style.animationDelay = `${index * 0.05}s`;
    
    const cancelledAt = new Date(row.cancelled_at).toLocaleString();
    
    tr.innerHTML = `
      <td><strong>${row.train_number}</strong></td>
      <td>${row.detail_number || row.detail_id || '-'}</td>
      <td>${row.date}</td>
      <td><span class="office-badge ${(row.office || '').toLowerCase()}">${row.office || 'N/A'}</span></td>
      <td>
        <span class="reason-badge">${row.reason || 'Not specified'}</span>
        ${row.notes ? `<br><small style="color: #666;">${row.notes}</small>` : ''}
      </td>
      <td><small>${cancelledAt}</small></td>
      <td>
        <button onclick="viewCancellationDetails('${row.train_number}', '${row.date}')" class="btn-sm btn-info">
          📋 Details
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCancellationStats(stats) {
  const totalCancellations = document.getElementById("totalCancellations");
  const csmtCancellations = document.getElementById("csmtCancellations");
  const kynCancellations = document.getElementById("kynCancellations");
  const pnvlCancellations = document.getElementById("pnvlCancellations");
  const hqCancellations = document.getElementById("hqCancellations");

  if (totalCancellations) totalCancellations.textContent = stats.total || 0;
  if (csmtCancellations) csmtCancellations.textContent = stats.csmt || 0;
  if (kynCancellations) kynCancellations.textContent = stats.kyn || 0;
  if (pnvlCancellations) pnvlCancellations.textContent = stats.pnvl || 0;
  if (hqCancellations) hqCancellations.textContent = stats.hq || 0;

  // Animate the numbers
  [totalCancellations, csmtCancellations, kynCancellations, pnvlCancellations, hqCancellations]
    .forEach(elem => {
      if (elem) {
        elem.style.animation = 'none';
        elem.offsetHeight;
        elem.style.animation = 'countUp 1s ease-out';
      }
    });
}

// ===== WHEEL MOVEMENT ANALYSIS =====

async function loadWheelMovementFilters() {
  try {
    // Load detail numbers
    const detailsResponse = await fetch('/api/details');
    const detailsData = await detailsResponse.json();
    
    if (detailsResponse.ok) {
      const detailSelect = document.getElementById('wheelDetailNumber');
      if (detailSelect) {
        detailSelect.innerHTML = '<option value="">All Details</option>';
        detailsData.data.forEach(detail => {
          const option = document.createElement('option');
          option.value = detail.detail_number;
          option.textContent = `${detail.detail_number} (${detail.line})`;
          detailSelect.appendChild(option);
        });
      }
    }

    // Load motormen (if available)
    const motormenResponse = await fetch('/api/motormen');
    const motormenData = await motormenResponse.json();
    
    if (motormenResponse.ok) {
      const motormanSelect = document.getElementById('wheelMotorman');
      if (motormanSelect) {
        motormanSelect.innerHTML = '<option value="">All Motormen</option>';
        motormenData.data.forEach(motorman => {
          const option = document.createElement('option');
          option.value = motorman.motorman_name;
          option.textContent = `${motorman.motorman_name} (${motorman.office})`;
          motormanSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Error loading wheel movement filters:", error);
  }
}

// Helper function to convert minutes to readable format
function minutesToHoursString(minutes) {
  if (!minutes || minutes === 0) return '0:00';
  
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${hours}:${mins.toString().padStart(2, '0')}`;
}
async function loadWheelMovementAnalysis() {
  const fromDate = document.getElementById('wheelFromDate').value;
  const toDate = document.getElementById('wheelToDate').value;
  const detailNumber = document.getElementById('wheelDetailNumber').value;
  const motorman = document.getElementById('wheelMotorman').value;
  const office = document.getElementById('wheelOffice').value;
  const reportType = document.getElementById('wheelReportType').value;

  // Validation
  if (!fromDate || !toDate) {
    showToast("Please select both from and to dates", "warning");
    return;
  }

  if (new Date(fromDate) > new Date(toDate)) {
    showToast("From date cannot be later than to date", "error");
    return;
  }

  const params = new URLSearchParams({
    fromDate,
    toDate
  });
  
  if (detailNumber) params.append('detailNumber', detailNumber);
  if (motorman) params.append('motorman', motorman);
  if (office) params.append('office', office);
  if (reportType) params.append('reportType', reportType);

  console.log('🔍 Loading wheel movement analysis:', params.toString());

  try {
    showLoading("Analyzing wheel movement data...");
    const response = await fetch(`/api/wheel-movement?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 Received wheel movement data:', result);
    window.lastAnalysisResult = result;
    if (result.data && result.totals) {
      displayWheelMovementAnalysis(result);
      showToast(`Analysis completed for ${result.data.length} motormen over ${result.period.totalDays} days`, "success");
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Wheel movement analysis error:", error);
    showToast(`Error loading wheel movement analysis: ${error.message}`, "error");
    
    // Clear table on error
    const tbody = document.getElementById('wheelMovementTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #dc3545; padding: 20px;">
            ❌ Failed to load analysis: ${error.message}
          </td>
        </tr>
      `;
    }
  } finally {
    hideLoading();
  }
}

// UPDATED: displayWheelMovementAnalysis with proper time formatting and reassignments
function displayWheelMovementAnalysis(result) {
  console.log('📊 Displaying analysis result:', result);
  console.log('📊 Raw data before merging:', result.data);
  
  // Store detail trains globally for access
  window.detailTrainsData = result.detailTrains || {};
  console.log('🚂 Detail trains data available:', Object.keys(window.detailTrainsData).length, 'details');
  
  // Add floating button for train reference if data is available
  if (window.detailTrainsData && Object.keys(window.detailTrainsData).length > 0) {
    addTrainReferenceButton();
  }
  
  // STEP 1: Debug the raw data
  console.log('🔍 DEBUGGING: Analyzing raw data structure...');
  result.data.forEach((entry, index) => {
    console.log(`   Entry ${index}: ${entry.motormanName} | Days: ${entry.totalDays} | Movement: ${minutesToHoursString(entry.netWheelMovement)}`);
  });

  console.log('🎭 DISPLAY DEBUG: Raw data received from backend:');

  console.log('\n🎭 === FRONTEND DEBUG START ===');
  
  // // Check raw data from backend
  // const madhukarRaw = result.data.filter(entry => 
  //   entry.motormanName.includes('MADHUKAR') || 
  //   (entry.motormanCmsId && entry.motormanCmsId.includes('1272'))
  // );
  
  // console.log(`🔍 Backend sent ${madhukarRaw.length} MADHUKAR entries:`);
  // madhukarRaw.forEach((entry, i) => {
  //   console.log(`  ${i+1}. WM: ${entry.netWheelMovement}min (${minutesToHoursString(entry.netWheelMovement)}), Duty: ${entry.totalDutyHours}min (${minutesToHoursString(entry.totalDutyHours)})`);
  // });
  
  
  // // Check if MADHUKAR data is duplicated in the raw result
  // const madhukarRawEntries = result.data.filter(entry => 
  //   entry.motormanName.includes('MADHUKAR') || 
  //   entry.motormanCmsId === 'KYNS1272'
  // );
  
  // console.log(`🔍 MADHUKAR raw entries from backend: ${madhukarRawEntries.length}`);
  // madhukarRawEntries.forEach((entry, index) => {
  //   console.log(`  ${index + 1}. Name: ${entry.motormanName}`);
  //   console.log(`     CMS: ${entry.motormanCmsId}`);
  //   console.log(`     WM: ${entry.netWheelMovement} minutes`);
  //   console.log(`     Duty: ${entry.totalDutyHours} minutes`);
  // });
  
  // if (madhukarRawEntries.length > 1) {
  //   console.error('❌ PROBLEM: Backend is sending duplicate entries!');
  //   console.error('The issue is in the backend, not frontend merge logic');
  // } else {
  //   console.log('✅ Backend sending single entry - problem is in frontend merge');
  // }
  
  // STEP 2: Merge duplicate motorman entries BEFORE displaying
  const mergedData = mergeMotormanEntries(result.data);
  console.log(`🔀 Merged ${result.data.length} entries into ${mergedData.length} unique motormen`);
  
  // const madhukarMerged = mergedData.find(m => 
  //   m.motormanName.includes('MADHUKAR') || 
  //   (m.motormanCmsId && m.motormanCmsId.includes('1272'))
  // );
  
  // if (madhukarMerged) {
  //   console.log(`🔀 After merge: WM: ${madhukarMerged.netWheelMovement}min (${minutesToHoursString(madhukarMerged.netWheelMovement)}), Duty: ${madhukarMerged.totalDutyHours}min (${minutesToHoursString(madhukarMerged.totalDutyHours)})`);
    
  //   // Check if values are correct
  //   const expectedWM = 313; // 5:13 in minutes
  //   const expectedDuty = 819; // 13:39 in minutes
    
  //   if (madhukarMerged.netWheelMovement === expectedWM && madhukarMerged.totalDutyHours === expectedDuty) {
  //     console.log('✅ Merge is correct - problem must be in display logic');
  //   } else {
  //     console.log(`❌ Merge is wrong! Expected WM: ${expectedWM}, Duty: ${expectedDuty}`);
      
  //     // Check if backend sent duplicates
  //     if (madhukarRaw.length > 1) {
  //       console.log('🚨 CAUSE: Backend sent duplicate entries');
  //     } else {
  //       console.log('🚨 CAUSE: Frontend merge logic is duplicating');
  //     }
  //   }
  // }
  
  console.log('🎭 === FRONTEND DEBUG END ===\n');
  // Update summary cards with proper time conversion
  updateSummaryCards(result.totals);
  
  // Populate the main table with merged data
  populateWheelMovementTable(mergedData, result.period);
}


// 24052025

function mergeMotormanEntries(analysisData) {
  console.log('🔀 MERGE DEBUG: Starting merge process...');
  console.log(`🔍 Input data: ${analysisData.length} entries`);
  
  // Debug: Log all entries for MADHUKAR before merging
  // const madhukarEntries = analysisData.filter(entry => 
  //   entry.motormanName.includes('MADHUKAR') || 
  //   entry.motormanCmsId === 'KYNS1272'
  // );
  
  // console.log('🔍 MADHUKAR entries BEFORE merge:');
  // madhukarEntries.forEach((entry, index) => {
  //   console.log(`  ${index + 1}. Name: ${entry.motormanName}`);
  //   console.log(`     CMS: ${entry.motormanCmsId}`);
  //   console.log(`     Details: ${entry.detailNumbers || 'N/A'}`);
  //   console.log(`     WM: ${minutesToHoursString(entry.netWheelMovement)} (${entry.netWheelMovement} minutes)`);
  //   console.log(`     Duty: ${minutesToHoursString(entry.totalDutyHours)} (${entry.totalDutyHours} minutes)`);
  //   console.log(`     Days: ${entry.totalDays}`);
  // });
  
  const motormanMap = new Map();
  
  for (const entry of analysisData) {
    const motormanName = entry.motormanName;
    const motormanCmsId = entry.motormanCmsId;
    
    // Use CMS ID as the key for grouping
    const mapKey = motormanCmsId || `UNKNOWN_${motormanName}`;
    
    // // Debug for MADHUKAR specifically
    // if (motormanName.includes('MADHUKAR')) {
    //   console.log(`\n🔍 PROCESSING MADHUKAR entry:`);
    //   console.log(`   Name: ${motormanName}`);
    //   console.log(`   CMS: ${motormanCmsId}`);
    //   console.log(`   Map Key: ${mapKey}`);
    //   console.log(`   WM: ${entry.netWheelMovement} minutes`);
    //   console.log(`   Duty: ${entry.totalDutyHours} minutes`);
    //   console.log(`   Details: ${entry.detailNumbers}`);
    //   console.log(`   Already in map: ${motormanMap.has(mapKey)}`);
    // }
    
    if (motormanMap.has(mapKey)) {
      // MERGE with existing entry
      const existing = motormanMap.get(mapKey);
      
      // if (motormanName.includes('MADHUKAR')) {
      //   console.log(`🔗 MERGING MADHUKAR entries:`);
      //   console.log(`   Existing WM: ${existing.netWheelMovement} minutes`);
      //   console.log(`   Adding WM: ${entry.netWheelMovement} minutes`);
      //   console.log(`   Existing Duty: ${existing.totalDutyHours} minutes`);
      //   console.log(`   Adding Duty: ${entry.totalDutyHours} minutes`);
      // }
      
      // ❌ POTENTIAL BUG: Check if we're double-adding
      existing.totalDays += entry.totalDays;
      existing.totalBaseWheelMovement += entry.totalBaseWheelMovement;
      existing.totalDutyHours += entry.totalDutyHours;
      existing.totalSundayDeductions += entry.totalSundayDeductions;
      existing.totalRegularCancellations += entry.totalRegularCancellations;
      existing.totalReassignmentAdjustments += (entry.totalReassignmentAdjustments || 0);
      existing.netWheelMovement += entry.netWheelMovement;
      existing.totalTrainCount += entry.totalTrainCount;
      
      // if (motormanName.includes('MADHUKAR')) {
      //   console.log(`   Result WM: ${existing.netWheelMovement} minutes`);
      //   console.log(`   Result Duty: ${existing.totalDutyHours} minutes`);
      //   console.log(`   Expected: WM should be 313 minutes (5:13), Duty should be 819 minutes (13:39)`);
      // }
      
      // Merge daily breakdowns
      if (entry.dailyBreakdown && entry.dailyBreakdown.length > 0) {
        existing.dailyBreakdown = existing.dailyBreakdown || [];
        
        for (const newDay of entry.dailyBreakdown) {
          const existingDayIndex = existing.dailyBreakdown.findIndex(d => d.date === newDay.date);
          
          if (existingDayIndex >= 0) {
            // ❌ POTENTIAL BUG: Merging same date multiple times
            const existingDay = existing.dailyBreakdown[existingDayIndex];
            
            // if (motormanName.includes('MADHUKAR')) {
            //   console.log(`📅 MERGING same date ${newDay.date}:`);
            //   console.log(`   Existing details: ${existingDay.detailNumbers}`);
            //   console.log(`   Adding details: ${newDay.detailNumbers}`);
            //   console.log(`   Existing WM: ${existingDay.netWheelMovement}`);
            //   console.log(`   Adding WM: ${newDay.netWheelMovement}`);
            // }
            
            // Combine detail numbers
            const existingDetails = existingDay.detailNumbers.split(', ').map(d => d.trim()).filter(d => d);
            const newDetails = newDay.detailNumbers.split(', ').map(d => d.trim()).filter(d => d);
            const allDetails = [...new Set([...existingDetails, ...newDetails])];
            existingDay.detailNumbers = allDetails.join(', ');
            
            // Add numerical values - THIS COULD BE THE PROBLEM
            existingDay.baseWheelMovement += newDay.baseWheelMovement;
            existingDay.dutyHours += newDay.dutyHours;
            existingDay.sundayDeductions += newDay.sundayDeductions;
            existingDay.regularCancellations += newDay.regularCancellations;
            existingDay.reassignmentAdjustments += (newDay.reassignmentAdjustments || 0);
            existingDay.netWheelMovement += newDay.netWheelMovement;
            
            if (motormanName.includes('MADHUKAR')) {
              console.log(`   Result details: ${existingDay.detailNumbers}`);
              console.log(`   Result WM: ${existingDay.netWheelMovement}`);
            }
            
          } else {
            // Add new date
            existing.dailyBreakdown.push({...newDay});
          }
        }
      }
      
    } else {
      // NEW entry
      if (motormanName.includes('MADHUKAR')) {
        console.log(`🆕 NEW entry for MADHUKAR`);
      }
      
      const clonedEntry = {
        ...entry,
        dailyBreakdown: entry.dailyBreakdown ? entry.dailyBreakdown.map(day => ({...day})) : []
      };
      
      motormanMap.set(mapKey, clonedEntry);
    }
  }
  
  const mergedArray = Array.from(motormanMap.values());
  
  // Debug final result for MADHUKAR
  const finalMadhukar = mergedArray.find(m => m.motormanName.includes('MADHUKAR'));
  if (finalMadhukar) {
    console.log('\n🎯 FINAL MERGED RESULT for MADHUKAR:');
    console.log(`   WM: ${minutesToHoursString(finalMadhukar.netWheelMovement)} (${finalMadhukar.netWheelMovement} minutes)`);
    console.log(`   Duty: ${minutesToHoursString(finalMadhukar.totalDutyHours)} (${finalMadhukar.totalDutyHours} minutes)`);
    console.log(`   Expected: WM=5:13 (313 min), Duty=13:39 (819 min)`);
    console.log(`   Details: ${finalMadhukar.detailNumbers}`);
    
    if (finalMadhukar.netWheelMovement !== 313 || finalMadhukar.totalDutyHours !== 819) {
      console.error('❌ MERGE CREATED WRONG VALUES!');
      console.error('This confirms the frontend merge logic is the problem');
    } else {
      console.log('✅ Merge logic is correct - problem must be elsewhere');
    }
  }
  
  console.log(`🔀 MERGE COMPLETE: ${analysisData.length} entries → ${mergedArray.length} merged entries`);
  
  return mergedArray;
}

// NEW: Update summary cards
function updateSummaryCards(totals) {
  const summaryElements = {
    totalWheelMovementDays: document.getElementById('totalWheelMovementDays'),
    totalBaseWheelMovement: document.getElementById('totalBaseWheelMovement'),
    totalDutyHours: document.getElementById('totalDutyHours'),
    totalCancelledWheelMovement: document.getElementById('totalCancelledWheelMovement'),
    totalSundayDeductions: document.getElementById('totalSundayDeductions'),
    totalNetWheelMovement: document.getElementById('totalNetWheelMovement')
  };

  if (summaryElements.totalWheelMovementDays) {
    summaryElements.totalWheelMovementDays.textContent = totals.analysisDays;
  }
  
  if (summaryElements.totalBaseWheelMovement) {
    summaryElements.totalBaseWheelMovement.textContent = minutesToHoursString(totals.totalBaseMovement);
  }
  
  if (summaryElements.totalDutyHours) {
    summaryElements.totalDutyHours.textContent = minutesToHoursString(totals.totalDutyHours);
  }
  
  if (summaryElements.totalCancelledWheelMovement) {
    summaryElements.totalCancelledWheelMovement.textContent = minutesToHoursString(totals.totalCancelledHours);
  }
  
  if (summaryElements.totalSundayDeductions) {
    summaryElements.totalSundayDeductions.textContent = minutesToHoursString(totals.totalSundayDeductions);
  }
  
  if (summaryElements.totalNetWheelMovement) {
    summaryElements.totalNetWheelMovement.textContent = minutesToHoursString(totals.totalNetMovement);
  }

  // Animate the summary cards
  Object.values(summaryElements).forEach(element => {
    if (element) {
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = 'countUp 1s ease-out';
    }
  });
}

// UPDATED: populateWheelMovementTable with improved data attributes and efficiency sorting
function populateWheelMovementTable(analysisData, period) {
  const tbody = document.getElementById('wheelMovementTableBody');
  if (!tbody) {
    console.warn('wheelMovementTableBody not found');
    return;
  }

  tbody.innerHTML = '';

  if (!analysisData || analysisData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 1.2em; margin-bottom: 10px;">📊</div>
          <div>No data found for the selected criteria</div>
          <div style="font-size: 0.9em; color: #999; margin-top: 5px;">
            Try adjusting your date range or filters
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Sort by efficiency percentage (ascending order - lowest efficiency first)
  const sortedData = [...analysisData].sort((a, b) => {
    const efficiencyA = a.totalDutyHours > 0 ? (a.netWheelMovement / a.totalDutyHours) * 100 : 0;
    const efficiencyB = b.totalDutyHours > 0 ? (b.netWheelMovement / b.totalDutyHours) * 100 : 0;
    return efficiencyA - efficiencyB; // Ascending order
  });

  console.log(`📋 Populating table with ${sortedData.length} unique motormen (sorted by efficiency ascending)`);

  sortedData.forEach((motorman, index) => {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.1}s`;
    row.className = 'fade-in-row';
    
    // Calculate efficiency ratio
    const efficiencyRatio = motorman.totalDutyHours > 0 ? 
      ((motorman.netWheelMovement / motorman.totalDutyHours) * 100).toFixed(1) : '0.0';
    
    // Add visual indicator for efficiency level
    let efficiencyClass = 'efficiency-normal';
    let efficiencyIcon = '📊';
    const efficiencyValue = parseFloat(efficiencyRatio);
    
    if (efficiencyValue < 50) {
      efficiencyClass = 'efficiency-low';
      efficiencyIcon = '📉';
    } else if (efficiencyValue > 80) {
      efficiencyClass = 'efficiency-high';
      efficiencyIcon = '📈';
    }
    
    // Check for reassignments
    const hasReassignments = (motorman.totalReassignmentAdjustments || 0) !== 0;
    const reassignmentIndicator = hasReassignments ? 
      `<span class="reassignment-indicator" title="Has reassignments: ${minutesToHoursString(motorman.totalReassignmentAdjustments)}" style="color: #667eea; font-size: 1.2em;">🔄</span>` : '';
    
    // Get unique details across all days
    const allDetails = new Set();
    if (motorman.dailyBreakdown) {
      motorman.dailyBreakdown.forEach(day => {
        if (day.detailNumbers) {
          const details = day.detailNumbers.split(', ').map(d => d.trim()).filter(d => d);
          details.forEach(detail => allDetails.add(detail));
        }
      });
    }
    const uniqueDetailsText = Array.from(allDetails).join(', ') || 'N/A';
    
    row.innerHTML = `
      <td>
        <div class="motorman-info">
          <strong>${escapeHtml(motorman.motormanName)}</strong> ${reassignmentIndicator}
          <br>
          <small style="color: #666;">${motorman.office} Office • ${motorman.totalDays} day(s)</small>
          <br>
          <small style="color: #999;">
            Details: ${uniqueDetailsText}
            ${window.detailTrainsData ? ' <span onclick="showDetailTrains(event)" style="cursor: pointer; color: #667eea;" title="View trains for all details">📋</span>' : ''}
          </small>
        </div>
      </td>
      <td>
        <div class="period-info">
          <strong>${period.fromDate} to ${period.toDate}</strong>
          <br>
          <small style="color: #666;">
            ${motorman.totalTrainCount} trains • ${motorman.totalDays} working days
          </small>
          ${hasReassignments ? '<br><small style="color: #667eea;">⚡ Includes reassignments</small>' : ''}
        </div>
      </td>
      <td>
        <div class="wheel-movement-display">
          <div class="wheel-movement-value" style="font-size: 1.2em; font-weight: bold; color: #28a745;">
            ${minutesToHoursString(motorman.netWheelMovement)}
          </div>
          <div class="breakdown-summary">
            <small style="color: #666; line-height: 1.4;">
              Base: <span style="color: #28a745; font-weight: 600;">${minutesToHoursString(motorman.totalBaseWheelMovement)}</span><br>
              ${motorman.totalSundayDeductions > 0 ? `Sunday: <span style="color: #ffc107; font-weight: 600;">-${minutesToHoursString(motorman.totalSundayDeductions)}</span><br>` : ''}
              ${motorman.totalRegularCancellations > 0 ? `Cancelled: <span style="color: #dc3545; font-weight: 600;">-${minutesToHoursString(motorman.totalRegularCancellations)}</span><br>` : ''}
              ${hasReassignments ? `Reassignments: <span style="color: #667eea; font-weight: 600;">${(motorman.totalReassignmentAdjustments || 0) > 0 ? '+' : ''}${minutesToHoursString(motorman.totalReassignmentAdjustments || 0)}</span>` : ''}
            </small>
          </div>
        </div>
      </td>
      <td>
        <div class="duty-hours-display">
          <div class="duty-hours-value" style="font-size: 1.1em; font-weight: bold; color: #2c3e50;">
            ${minutesToHoursString(motorman.totalDutyHours)}
          </div>
          <div class="${efficiencyClass}" style="margin-top: 4px;">
            <span style="font-weight: 600;">${efficiencyIcon} Efficiency: ${efficiencyRatio}%</span>
            ${efficiencyValue < 50 ? '<br><small style="color: #dc3545;">⚠️ Low Efficiency</small>' : 
              efficiencyValue > 80 ? '<br><small style="color: #28a745;">⭐ High Efficiency</small>' : ''}
          </div>
          <small style="color: #999;">Avg/day: ${minutesToHoursString(Math.round(motorman.totalDutyHours / motorman.totalDays))}</small>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button onclick="expandMotormanDetail('${escapeHtml(motorman.motormanName).replace(/'/g, "\\'")}', ${index})" 
                  class="expand-btn" 
                  id="expand-btn-${index}"
                  title="View daily breakdown for all details"
                  style="background: #667eea; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
            ➕ Details
          </button>
          <button onclick="downloadMotormanReport('${escapeHtml(motorman.motormanName).replace(/'/g, "\\'")}', ${index})" 
                  class="btn-sm btn-info" 
                  title="Download comprehensive report"
                  style="background: #17a2b8; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">
            📥 Export
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
    
    // IMPORTANT: Store data using the original index, not DOM position
    row.dataset.motormanData = JSON.stringify(motorman);
    row.dataset.motormanIndex = index; // This stays constant even when DOM changes
    row.dataset.motormanName = motorman.motormanName; // Additional identifier
    
    console.log(`✅ Row created for ${motorman.motormanName}: ${motorman.totalDays} days, ${minutesToHoursString(motorman.netWheelMovement)} net movement, ${efficiencyRatio}% efficiency (sorted index: ${index})`);
  });

  console.log(`🎯 Table populated with ${sortedData.length} unique motormen (sorted by efficiency: lowest to highest)`);

  // Log efficiency distribution for debugging
  const efficiencyStats = sortedData.map(m => {
    const eff = m.totalDutyHours > 0 ? ((m.netWheelMovement / m.totalDutyHours) * 100).toFixed(1) : '0.0';
    return parseFloat(eff);
  });
  console.log(`📈 Efficiency range: ${Math.min(...efficiencyStats).toFixed(1)}% to ${Math.max(...efficiencyStats).toFixed(1)}%`);
}

// Fixed wheel movement expansion functions
let expandedMotormen = new Set();

function expandMotormanDetail(motormanName, originalIndex) {
  console.log(`🔍 Expanding details for: ${motormanName} (original index: ${originalIndex})`);
  
  const expandKey = `${motormanName}-${originalIndex}`;
  
  if (expandedMotormen.has(expandKey)) {
    // Collapse - remove the expanded row
    const expandedRow = document.querySelector(`tr[data-expanded="${expandKey}"]`);
    if (expandedRow) {
      expandedRow.remove();
    }
    expandedMotormen.delete(expandKey);
    
    // Update button text
    const button = document.getElementById(`expand-btn-${originalIndex}`);
    if (button) button.innerHTML = '➕ Details';
    
    console.log(`🔽 Collapsed details for ${motormanName}`);
    return;
  }

  // Find the current row by searching for the motorman name and original index
  // This is more reliable than using DOM index which changes with expansions
  const tbody = document.getElementById('wheelMovementTableBody');
  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  // Find the row with matching data
  let targetRow = null;
  const rows = tbody.querySelectorAll('tr:not(.expanded-detail-row)'); // Exclude expanded rows
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.dataset.motormanIndex == originalIndex && row.dataset.motormanData) {
      targetRow = row;
      break;
    }
  }

  if (!targetRow) {
    console.warn(`No row found for motorman: ${motormanName} with original index ${originalIndex}`);
    return;
  }
  
  try {
    const motormanData = JSON.parse(targetRow.dataset.motormanData);
    console.log(`📊 Expanding data for ${motormanName}:`, motormanData);
    
    insertDailyBreakdownForMotorman(motormanName, motormanData, targetRow, expandKey);
    expandedMotormen.add(expandKey);
    
    // Update button text
    const button = document.getElementById(`expand-btn-${originalIndex}`);
    if (button) button.innerHTML = '➖ Details';
    
    console.log(`🔼 Expanded details for ${motormanName}`);
    
  } catch (error) {
    console.error('Error parsing motorman data:', error);
    showToast('Error displaying daily breakdown', 'error');
  }
}

// ENHANCED: Insert daily breakdown with better error handling
function insertDailyBreakdownForMotorman(motormanName, motormanData, currentRow, expandKey) {
  const expandedRow = document.createElement('tr');
  expandedRow.className = 'expanded-detail-row';
  expandedRow.setAttribute('data-expanded', expandKey);
  
  const dailyBreakdown = motormanData.dailyBreakdown || [];
  
  console.log(`📋 Creating daily breakdown for ${motormanName}:`, {
    totalDays: motormanData.totalDays,
    dailyEntries: dailyBreakdown.length,
    netMovement: minutesToHoursString(motormanData.netWheelMovement)
  });
  
  expandedRow.innerHTML = `
    <td colspan="5" style="padding: 25px; background: #f8f9fa;">
      <div class="daily-breakdown-container">
        <h4 style="margin-bottom: 20px; color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
          📊 Daily Breakdown for ${escapeHtml(motormanName)}
        </h4>
        
        <div class="daily-summary" style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #17a2b8;">
          <strong>📈 Summary:</strong>
          Total Days: ${motormanData.totalDays} | 
          Net Movement: ${minutesToHoursString(motormanData.netWheelMovement)} | 
          Total Duty: ${minutesToHoursString(motormanData.totalDutyHours)}
          ${(motormanData.totalReassignmentAdjustments || 0) !== 0 ? ` | Reassignments: ${(motormanData.totalReassignmentAdjustments || 0) > 0 ? '+' : ''}${minutesToHoursString(motormanData.totalReassignmentAdjustments || 0)}` : ''}
        </div>
        
        <div class="daily-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; max-height: 500px; overflow-y: auto;">
          ${dailyBreakdown.length > 0 ? dailyBreakdown.map((day, dayIndex) => {
            const dayDate = new Date(day.date);
            const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
            const hasReassignments = day.reassignments && day.reassignments.length > 0;
            
            let cardClass = 'daily-breakdown-card';
            let borderColor = '#28a745';
            
            if (day.isSunday) {
              cardClass += ' is-sunday';
              borderColor = '#ffc107';
            } else if (isWeekend) {
              borderColor = '#17a2b8';
            }
            
            if (hasReassignments) {
              cardClass += ' has-reassignments';
              borderColor = '#667eea';
            }
            
            return `
              <div class="${cardClass}" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong style="color: #2c3e50;">${dayDate.toLocaleDateString()}</strong>
                  <div style="font-size: 0.8em; color: #666;">
                    ${day.isSunday ? '📅 Sunday' : (isWeekend ? '📅 Weekend' : '📅 Weekday')}
                    ${hasReassignments ? ' 🔄' : ''}
                  </div>
                </div>
                
                <div style="font-size: 0.9em; color: #555; line-height: 1.4;">
                  <div style="margin-bottom: 8px;"><strong>Details:</strong> ${day.detailNumbers || 'N/A'}</div>
                  
                  <div class="breakdown-values" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div>🚄 <strong>Base:</strong> ${minutesToHoursString(day.baseWheelMovement || 0)}</div>
                    <div>⏰ <strong>Duty:</strong> ${minutesToHoursString(day.dutyHours || 0)}</div>
                  </div>
                  
                  ${(day.sundayDeductions || 0) > 0 ? `
                    <div style="color: #ffc107; margin-bottom: 4px;">
                      📅 <strong>Sunday Deduction:</strong> -${minutesToHoursString(day.sundayDeductions)}
                    </div>
                  ` : ''}
                  
                  ${(day.regularCancellations || 0) > 0 ? `
                    <div style="color: #dc3545; margin-bottom: 4px;">
                      🚫 <strong>Cancellations:</strong> -${minutesToHoursString(day.regularCancellations)}
                    </div>
                  ` : ''}
                  
                  ${(day.reassignmentAdjustments || 0) !== 0 ? `
                    <div style="color: #667eea; margin-bottom: 4px;">
                      🔄 <strong>Reassignments:</strong> ${(day.reassignmentAdjustments || 0) > 0 ? '+' : ''}${minutesToHoursString(day.reassignmentAdjustments || 0)}
                    </div>
                  ` : ''}
                  
                  <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
                    <strong style="color: #28a745;">📊 Net Movement: ${minutesToHoursString(day.netWheelMovement || 0)}</strong>
                  </div>
                  
                  ${hasReassignments ? `
                    <div style="margin-top: 10px; padding: 8px; background: #f0f4ff; border-radius: 4px; border-left: 3px solid #667eea;">
                      <strong style="color: #667eea; font-size: 0.8em;">🔄 REASSIGNMENTS:</strong>
                      <div style="font-size: 0.8em; margin-top: 4px;">
                        ${day.reassignments.map(r => `
                          <div style="margin-bottom: 2px;">
                            • ${r.type && (r.type.includes('received') || r.type.includes('gained')) ? '➕' : '➖'} 
                            ${r.detail ? `Detail ${r.detail}` : ''} 
                            ${r.trains ? `(${Array.isArray(r.trains) ? r.trains.join(', ') : r.trains})` : ''}
                            : ${(r.amount || 0) > 0 ? '+' : ''}${minutesToHoursString(Math.abs(r.amount || 0))}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('') : '<div style="text-align: center; color: #666; padding: 20px;">No daily breakdown data available</div>'}
        </div>
      </div>
    </td>
  `;
  
  // Insert the expanded row immediately after the current row
  currentRow.parentNode.insertBefore(expandedRow, currentRow.nextSibling);
  
  // Animate the expansion
  expandedRow.style.opacity = '0';
  expandedRow.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    expandedRow.style.transition = 'all 0.3s ease';
    expandedRow.style.opacity = '1';
    expandedRow.style.transform = 'translateY(0)';
  }, 50);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// NEW: Download motorman report
function downloadMotormanReport(motormanName, index) {
  const fromDate = document.getElementById('wheelFromDate')?.value || 'N/A';
  const toDate = document.getElementById('wheelToDate')?.value || 'N/A';
  
  showToast(`Downloading detailed report for ${motormanName} (${fromDate} to ${toDate})...`, "info");
  
  // TODO: Implement actual download functionality
  console.log(`Download request for ${motormanName}`, { fromDate, toDate, index });
}

// Update the global functions
window.expandMotormanDetail = expandMotormanDetail;
window.downloadMotormanReport = downloadMotormanReport;

console.log('✅ Wheel Movement Frontend Integration loaded');

// ===== UTILITY FUNCTIONS =====

// Helper function to clear single cancellation form
function clearSingleCancellationForm() {
  const dateInput = document.getElementById('singleCancelDate');
  const trainNumberInput = document.getElementById('singleTrainNumber');
  const reasonSelect = document.getElementById('cancellationReason');
  const notesTextarea = document.getElementById('additionalNotes');

  if (trainNumberInput) trainNumberInput.value = '';
  if (reasonSelect) reasonSelect.value = '';
  if (notesTextarea) notesTextarea.value = '';

  // Reset date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;
}

// Helper function to get current user's office (implement based on your auth system)
function getCurrentUserOffice() {
  // TODO: Implement based on your authentication system
  // This could come from localStorage, session, JWT token, etc.
  return localStorage.getItem('userOffice') || 'CSMT'; // Default fallback
}

// Enhanced toast function with better positioning
function showToast(message, type = 'info', duration = 5000) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    // Fallback: log to console if toast container doesn't exist
    console.log(`Toast (${type}): ${message}`);
    return;
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type} show`;

  // Get appropriate icon for each type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    cancellation: '🚫',
    'duty-roster': '📋',
    'file-upload': '📁'
  };

  toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">×</span>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    if (toast && toast.parentElement) {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast && toast.parentElement) {
          toast.remove();
        }
      }, 400); // Match CSS transition duration
    }
  }, duration);
}

// Loading overlay functions
function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const text = document.querySelector('.loading-text');
  if (overlay) {
    if (text) text.textContent = message;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// View functions for detail modals
function viewScheduleDetails(id) {
  showToast(`View details for schedule ID: ${id}`, "info");
  // TODO: Implement detailed view modal
}

function viewDutyDetails(detailNumber, date) {
  showToast(`View duty details for ${detailNumber} on ${date}`, "info");
  // TODO: Implement duty details modal
}

function viewCancellationDetails(trainNumber, date) {
  showToast(`View cancellation details for train ${trainNumber} on ${date}`, "info");
  // TODO: Implement cancellation details modal
}

function downloadDetailReport(detailId) {
  const fromDate = document.getElementById('wheelFromDate').value;
  const toDate = document.getElementById('wheelToDate').value;
  
  showToast(`Downloading report for ${detailId} (${fromDate} to ${toDate})`, "info");
  // TODO: Implement report download
}

// Enhanced file input handler for better UX
document.addEventListener('DOMContentLoaded', function() {
  // File input enhancements
  const fileInput = document.getElementById('cancelledFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
        showToast(`File selected: ${file.name} (${fileSize} MB)`, 'file-upload', 3000);
      }
    });
  }

  // Add enter key support for train number input
  const trainNumberInput = document.getElementById('singleTrainNumber');
  if (trainNumberInput) {
    trainNumberInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        cancelSingleTrain();
      }
    });

    // Real-time validation for train number
    trainNumberInput.addEventListener('input', function(e) {
      const value = e.target.value.trim();

      // Basic validation - adjust according to your requirements
      if (value.length > 0 && value.length < 3) {
        e.target.style.borderColor = '#dc3545';
      } else if (value.length >= 3) {
        e.target.style.borderColor = '#28a745';
      } else {
        e.target.style.borderColor = '#e9ecef';
      }
    });
  }

  // Auto-refresh dashboard every 5 minutes
  setInterval(() => {
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboardData();
    }
  }, 5 * 60 * 1000);

  // Add loading state to buttons when clicked
  document.querySelectorAll('button').forEach(button => {
    if (button.classList.contains('btn-primary')) {
      button.addEventListener('click', function() {
        if (!this.disabled) {
          const originalText = this.textContent;
          this.textContent = '⏳ Loading...';
          this.disabled = true;
          
          // Re-enable after 3 seconds (fallback)
          setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
          }, 3000);
        }
      });
    }
  });
});

// Enhanced search functionality with debouncing
function setupSearchDebouncing() {
  const searchInputs = ['mgmtSearch', 'dutySearch', 'cancellationSearch'];
  
  searchInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      let timeout;
      input.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          // Trigger search based on the input
          switch(inputId) {
            case 'mgmtSearch':
              searchManagementSchedules();
              break;
            case 'dutySearch':
              loadDutyRoster();
              break;
            case 'cancellationSearch':
              loadCancellations();
              break;
          }
        }, 500); // 500ms delay
      });
    }
  });
}

// Call setup functions
document.addEventListener('DOMContentLoaded', function() {
  setupSearchDebouncing();
});

// Authentication and role-based access control
async function initializeAuth() {
  try {
      const response = await fetch('/api/current-user');
      if (response.status === 401) {
          // User not logged in, redirect to login
          window.location.href = '/login.html';
          return null;
      }
      
      const user = await response.json();
      
      // Show user info in header
      if (user && user.full_name) {
          document.getElementById('currentUser').innerHTML = 
              `<strong>${user.full_name}</strong><br>
               <small>${user.role.toUpperCase()} - ${user.office || 'HQ'}</small>`;
          
          // Hide Wheel Movement section for non-admin users
          if (user.role !== 'admin') {
              hideWheelMovementSection();
          }
      }
      
      // Show the page content now that auth is verified
      document.body.classList.remove('auth-loading');
      document.body.classList.add('auth-ready');
      
      return user;
  } catch (error) {
      console.log('Auth check failed:', error);
      window.location.href = '/login.html';
      return null;
  }
}

async function logout() {
  console.log('Logout clicked');
  
  try {
      const response = await fetch('/api/logout', { 
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      
      console.log('Logout response status:', response.status);
      const result = await response.json();
      console.log('Logout result:', result);
      
      if (result.success) {
          console.log('Logout successful, redirecting...');
          window.location.href = '/login.html';
      } else {
          console.error('Logout failed:', result);
          // Force redirect anyway
          window.location.href = '/login.html';
      }
  } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.href = '/login.html';
  }
}

function hideWheelMovementSection() {
  // Hide the wheel movement tab
  const wheelTab = document.querySelector('[data-section="wheel-movement"]');
  if (wheelTab) {
      wheelTab.style.display = 'none';
  }
  
  // Hide the wheel movement content section
  const wheelSection = document.getElementById('wheel-movement');
  if (wheelSection) {
      wheelSection.style.display = 'none';
  }
  
  console.log('Wheel Movement section hidden for non-admin user');
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth();
  // Your existing DOMContentLoaded code continues to work
});

// Add CSS classes for styling
const additionalStyles = `
  .btn-sm {
    padding: 4px 8px;
    font-size: 0.8em;
    margin: 2px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
  
  .btn-info {
    background: #17a2b8;
    color: white;
  }
  
  .btn-info:hover {
    background: #138496;
    transform: translateY(-1px);
  }
  
  .line-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .line-badge.mainline {
    background: #667eea;
    color: white;
  }
  
  .line-badge.harbour {
    background: #28a745;
    color: white;
  }
  
  .office-badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 600;
  }
  
  .office-badge.csmt {
    background: #667eea;
    color: white;
  }
  
  .office-badge.kyn {
    background: #28a745;
    color: white;
  }
  
  .office-badge.pnvl {
    background: #ffc107;
    color: #212529;
  }
  
  .office-badge.hq {
    background: #6f42c1;
    color: white;
  }
  
  .reason-badge {
    padding: 4px 8px;
    background: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    font-size: 0.85em;
    border: 1px solid #f5c6cb;
  }
  
  .expanded-detail-row {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-left: 4px solid #667eea;
  }
  
  .daily-breakdown-card {
    background: white;
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid #28a745;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .daily-breakdown-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .daily-breakdown-card.has-cancellations {
    border-left-color: #dc3545;
  }
  
  .wheel-movement-value {
    font-weight: 600;
    font-size: 1.1em;
    color: #28a745;
  }
  
  .duty-hours-value {
    font-weight: 600;
    font-size: 1.1em;
    color: #17a2b8;
  }
  
  .expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;
    margin-right: 10px;
    transition: all 0.2s ease;
    border-radius: 4px;
    padding: 4px 8px;
  }
  
  .expand-btn:hover {
    background-color: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Performance monitoring
const performanceMonitor = {
  startTime: null,
  
  start(operation) {
    this.startTime = performance.now();
    console.log(`🚀 Starting: ${operation}`);
  },
  
  end(operation) {
    if (this.startTime) {
      const duration = (performance.now() - this.startTime).toFixed(2);
      console.log(`✓ Completed: ${operation} in ${duration}ms`);
      this.startTime = null;
    }
  }
};

// Add to global app object for debugging
app.performanceMonitor = performanceMonitor;
app.showToast = showToast;
app.showLoading = showLoading;
app.hideLoading = hideLoading;

// Export functions that are called from HTML
window.uploadCancelled = uploadCancelled;
// ===== DETAIL TRAINS DISPLAY FUNCTIONS =====

// Show trains in a modal when clicking the 📋 icon or floating button
function showDetailTrains(event) {
  // Support calls without an event (e.g., from floating button)
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  
  if (!window.detailTrainsData) {
    showToast('Train details not available', 'warning');
    return;
  }
  
  // Create modal HTML with search
  const modalHtml = `
    <div id="trainDetailsModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
      <div class="modal-content" style="position: relative; background: white; margin: 2% auto; padding: 20px; width: 90%; max-width: 1200px; max-height: 90vh; overflow-y: auto; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <span class="close" onclick="closeTrainModal()" style="position: absolute; right: 20px; top: 15px; font-size: 28px; cursor: pointer; color: #999;">&times;</span>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-bottom: 15px;">🚂 Train Details for All Details</h2>
          
          <!-- Search Box -->
          <div style="margin-bottom: 15px;">
            <input type="text" id="detailSearchBox" placeholder="Type detail number to search..." style="
              padding: 12px 15px; 
              border: 2px solid #ddd; 
              border-radius: 8px; 
              width: 300px;
              font-size: 16px;
            " oninput="filterTrainDetails()" onkeyup="filterTrainDetails()">
            <small style="display: block; color: #666; margin-top: 5px;">Search by detail number (e.g., 484, 507)</small>
          </div>
        </div>
        
        <div id="trainDetailsContent">
          ${generateTrainDetailsHTML()}
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Close modal on click outside
  document.getElementById('trainDetailsModal').addEventListener('click', function(e) {
    if (e.target.id === 'trainDetailsModal') {
      closeTrainModal();
    }
  });
}

// Generate HTML for train details
function generateTrainDetailsHTML() {
  const detailTrains = window.detailTrainsData;
  
  if (!detailTrains || Object.keys(detailTrains).length === 0) {
    return '<p style="text-align: center; color: #666;">No train data available</p>';
  }
  
  let html = '<div style="display: grid; gap: 20px;" id="trainDetailsGrid">';
  
  // Sort detail numbers
  const sortedDetails = Object.keys(detailTrains).sort((a, b) => {
    const numA = parseInt(a) || 999;
    const numB = parseInt(b) || 999;
    return numA - numB;
  });
  
  sortedDetails.forEach(detailNum => {
    const detail = detailTrains[detailNum];
    
    html += `
      <div class="detail-card" data-detail-number="${escapeHtml(detailNum)}" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9;">
        <h3 style="color: #667eea; margin-bottom: 10px;">
          Detail ${detailNum} 
          <span style="font-size: 0.9em; color: #666;">
            (${detail.totalTrains} trains: ${detail.workingTrains} working, ${detail.pilotingTrains} piloting)
          </span>
        </h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Train #</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Type</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Time</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Stations</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Movement</th>
              </tr>
            </thead>
            <tbody>
              ${detail.trains.map(train => `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 6px;">
                    <strong ${train.status === 'cancelled' ? 'style="color:#dc3545;"' : ''}>${escapeHtml(train.trainNumber)}</strong>
                    ${train.isPiloting ? '<span style="color: #ffc107;">🅿️</span>' : ''}
                  </td>
                  <td style="padding: 6px; color: ${train.isPiloting ? '#ffc107' : '#28a745'};">
                    ${train.trainType}
                  </td>
                  <td style="padding: 6px;">${train.startTime || 'N/A'} - ${train.endTime || 'N/A'}</td>
                  <td style="padding: 6px; font-size: 0.85em;">${train.startStation} → ${train.endStation}</td>
                  <td style="padding: 6px; font-weight: bold; color: #2c3e50;">${train.wheelMovement}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Close train details modal
function closeTrainModal() {
  const modal = document.getElementById('trainDetailsModal');
  if (modal) {
    modal.remove();
  }
}

// Filter train details based on search input
function filterTrainDetails() {
  const input = document.getElementById('detailSearchBox');
  const rawValue = (input ? input.value : '').trim();
  const numericValue = rawValue.replace(/[^0-9]/g, '');
  const grid = document.getElementById('trainDetailsGrid');

  if (!grid) return;

  const detailCards = grid.querySelectorAll('.detail-card');
  let visibleCount = 0;

  // If empty or non-numeric, show all
  if (!numericValue) {
    detailCards.forEach(card => {
      card.style.display = 'block';
      visibleCount++;
    });
  } else {
    detailCards.forEach(card => {
      const cardDetail = (card.dataset.detailNumber || '').toString();
      const isVisible = cardDetail === numericValue; // exact match only
      card.style.display = isVisible ? 'block' : 'none';
      if (isVisible) visibleCount++;
    });
  }

  // Show/hide no results message
  const existingNoResults = document.getElementById('noSearchResults');
  if (existingNoResults) existingNoResults.remove();

  if (visibleCount === 0 && numericValue) {
    grid.insertAdjacentHTML('afterend',
      '<p id="noSearchResults" style="text-align: center; color: #999; margin-top: 20px; padding: 20px;">No details found matching "' + numericValue + '"</p>'
    );
  }
}

// Toggle side panel for train reference
function toggleTrainSidePanel() {
  let panel = document.getElementById('trainSidePanel');
  
  if (panel) {
    // Toggle existing panel
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  } else {
    // Create new panel
    createTrainSidePanel();
  }
}

// Create side panel for train reference
function createTrainSidePanel() {
  const panelHtml = `
    <div id="trainSidePanel" style="
      position: fixed;
      right: 0;
      top: 60px;
      width: 400px;
      height: calc(100vh - 60px);
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 1000;
      overflow-y: auto;
      padding: 20px;
      border-left: 3px solid #667eea;
    ">
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #2c3e50; margin: 0; font-size: 1.1em;">📋 Train Reference</h3>
        <button onclick="toggleTrainSidePanel()" style="
          position: absolute;
          right: 10px;
          top: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        ">&times;</button>
      </div>
      
      <div id="sidePanelContent">
        ${generateCompactTrainList()}
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', panelHtml);
}

// Add floating button for train reference
function addTrainReferenceButton() {
  // Remove existing button if any
  const existingBtn = document.getElementById('floatingTrainBtn');
  if (existingBtn) existingBtn.remove();
  
  const floatingBtn = `
    <button id="floatingTrainBtn" onclick="showDetailTrains(event)" style="
      position: fixed;
      right: 20px;
      bottom: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
      z-index: 999;
      font-weight: bold;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      📋 Train Reference
    </button>
  `;
  
  document.body.insertAdjacentHTML('beforeend', floatingBtn);
}

// Generate compact train list for side panel
function generateCompactTrainList() {
  const detailTrains = window.detailTrainsData;
  
  if (!detailTrains || Object.keys(detailTrains).length === 0) {
    return '<p style="text-align: center; color: #666;">No train data available</p>';
  }
  
  let html = '<div style="font-size: 0.85em;">';
  
  const sortedDetails = Object.keys(detailTrains).sort((a, b) => {
    const numA = parseInt(a) || 999;
    const numB = parseInt(b) || 999;
    return numA - numB;
  });
  
  sortedDetails.forEach(detailNum => {
    const detail = detailTrains[detailNum];
    
    html += `
      <details style="margin-bottom: 10px; border: 1px solid #e9ecef; border-radius: 5px; padding: 10px;">
        <summary style="cursor: pointer; font-weight: bold; color: #667eea;">
          Detail ${detailNum} (${detail.totalTrains} trains)
        </summary>
        <div style="margin-top: 10px; padding-left: 10px;">
          ${detail.trains.map(train => `
            <div style="padding: 3px 0; border-bottom: 1px solid #f0f0f0;">
              <strong>${train.trainNumber}</strong>
              ${train.isPiloting ? '🅿️' : ''} 
              <span style="color: #666;">${train.startTime}-${train.endTime}</span>
              <span style="float: right; color: #28a745;">${train.wheelMovement}</span>
            </div>
          `).join('')}
        </div>
      </details>
    `;
  });
  
  html += '</div>';
  return html;
}

window.cancelSingleTrain = cancelSingleTrain;
window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;
window.viewScheduleDetails = viewScheduleDetails;
window.viewDutyDetails = viewDutyDetails;
window.viewCancellationDetails = viewCancellationDetails;
window.expandMotormanDetail = expandMotormanDetail;
window.downloadDetailReport = downloadDetailReport;
window.uploadDetailsCSV = uploadDetailsCSV;
window.uploadTrainsCSV = uploadTrainsCSV;
window.showDetailTrains = showDetailTrains;
window.closeTrainModal = closeTrainModal;
window.toggleTrainSidePanel = toggleTrainSidePanel;
window.filterTrainDetails = filterTrainDetails;

console.log('✅ MySQL Railway Management System - Frontend Initialized');
console.log('📊 All functions loaded and ready');

// Test database connection on load
fetch('/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('💚 Server health check:', data.status);
  })
  .catch(err => {
    console.error('❌ Server connection failed:', err);
    showToast('Server connection failed', 'error');
  });
  
