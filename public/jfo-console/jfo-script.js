// JFO Console - Complete JavaScript
let jfoConsoleManager = null;
let currentDate = null;
let currentReassignmentData = null;
let expandedRows = new Set();

// ===== UTILITY FUNCTIONS (Define first) =====
function showLoading() {
    console.log('🔄 showLoading called');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        console.log('✅ Loading overlay shown');
    } else {
        console.error('❌ Loading overlay element not found');
    }
}

function hideLoading() {
    console.log('🔄 hideLoading called');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log('✅ Loading overlay hidden');
    } else {
        console.error('❌ Loading overlay element not found');
    }
}

function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.log(`Toast (${type}): ${message}`);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span style="margin-right: 8px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
        <span onclick="this.parentElement.remove()" style="margin-left: auto; cursor: pointer; opacity: 0.7;">×</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger show animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

function updateCurrentDateDisplay() {
    const dateInput = document.getElementById('jfoDate');
    const display = document.getElementById('currentDateDisplay');
    
    if (dateInput.value) {
        const date = new Date(dateInput.value);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        display.textContent = date.toLocaleDateString('en-IN', options);
    } else {
        display.textContent = 'No date selected';
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
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

function updateDemoSummaryCards(data) {
    const summary = {
        total: data.length,
        waiting: data.filter(e => e.status === 'waiting').length,
        reassigned: data.filter(e => e.hasReassignments).length,
        totalReassignments: data.reduce((sum, e) => sum + (e.reassignments?.length || 0), 0)
    };

    animateCounter('totalDetails', summary.total);
    animateCounter('waitingDetails', summary.waiting);
    animateCounter('reassignedDetails', summary.reassigned);
    animateCounter('totalReassignments', summary.totalReassignments);
}

function updateSummaryCards(summary) {
    if (!summary) return;
    
    animateCounter('totalDetails', summary.total || 0);
    animateCounter('waitingDetails', summary.waiting || 0);
    animateCounter('reassignedDetails', summary.reassigned || 0);
    animateCounter('totalReassignments', summary.totalReassignments || 0);
}

// ===== SEARCH AND FILTER FUNCTIONS =====
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchAppearanceBook');
    const filterSelect = document.getElementById('filterType');
    const dateInput = document.getElementById('jfoDate');

    if (!searchInput || !filterSelect || !dateInput) {
        console.warn('Some filter elements not found');
        return;
    }

    // Update date display when changed
    dateInput.addEventListener('change', updateCurrentDateDisplay);

    // Search functionality with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterAppearanceBook(e.target.value, filterSelect.value);
        }, 300);
    });

    // Filter functionality
    filterSelect.addEventListener('change', (e) => {
        filterAppearanceBook(searchInput.value, e.target.value);
    });
}

function filterAppearanceBook(searchTerm, filterType) {
    if (!window.currentAppearanceData) return;

    let filteredData = [...window.currentAppearanceData];

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
        const search = searchTerm.toLowerCase();
        filteredData = filteredData.filter(entry => 
            entry.detailId.toLowerCase().includes(search) ||
            entry.detailNumber.toLowerCase().includes(search) ||
            entry.motormanName.toLowerCase().includes(search) ||
            entry.office.toLowerCase().includes(search) ||
            entry.trains.some(train => train.trainNumber.toLowerCase().includes(search))
        );
    }

    // Apply type filter
    if (filterType && filterType !== 'all') {
        switch (filterType) {
            case 'waiting':
                filteredData = filteredData.filter(e => e.status === 'waiting');
                break;
            case 'reassigned':
                filteredData = filteredData.filter(e => e.hasReassignments);
                break;
            case 'normal':
                filteredData = filteredData.filter(e => e.status === 'assigned' && !e.hasReassignments);
                break;
        }
    }

    displayAppearanceBook(filteredData);
    
    // Show filter results message
    if (searchTerm || filterType !== 'all') {
        const originalCount = window.currentAppearanceData.length;
        const filteredCount = filteredData.length;
        showToast(`📋 Showing ${filteredCount} of ${originalCount} entries`, 'info', 3000);
    }
}

function clearFilters() {
    document.getElementById('searchAppearanceBook').value = '';
    document.getElementById('filterType').value = 'all';
    
    if (window.currentAppearanceData) {
        displayAppearanceBook(window.currentAppearanceData);
        showToast('🔄 Filters cleared', 'info', 2000);
    }
}

// ===== REASSIGNMENT MODAL FUNCTIONS (Define BEFORE displayAppearanceBook) =====
function showReassignmentModal(detailId, index) {
    console.log(`🔄 Opening reassignment modal for ${detailId}, index ${index}`);
    
    const entry = window.currentAppearanceData?.[index];
    if (!entry) {
        console.error(`❌ Entry not found at index ${index}`);
        showToast('❌ Detail not found', 'error');
        return;
    }

    // Store current reassignment data globally
    window.currentReassignmentData = { entry, index };
    
    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal with fixed validation
    createModalWithWorkingCSS(entry);
}



function createModalWithWorkingCSS(entry) {
    console.log('🔧 Creating enhanced modal with ALL fixes...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
        console.log('🗑️ Removed existing modal');
    }
    
    // Create the modal HTML with FIXED structure
    const modal = document.createElement('div');
    modal.id = 'activeReassignmentModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; color: #2c3e50;">🔄 Reassign Detail ${entry.detailNumber}</h2>
                <button onclick="closeReassignmentModal()" style="background: none; border: none; font-size: 30px; cursor: pointer; color: #999; line-height: 1;">&times;</button>
            </div>
            
            <!-- Current Assignment Info -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 20px 0; color: #495057; font-size: 18px;">📋 Current Assignment Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Detail Number:</strong><br>
                        <span style="font-size: 16px; font-weight: 600; color: #2c3e50;">${entry.detailNumber}</span>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Current Motorman:</strong><br>
                        <span style="font-size: 16px; color: #2c3e50;">${entry.motormanName}</span>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Office:</strong><br>
                        <span style="font-size: 16px; color: #2c3e50;">${entry.office}</span>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Sign On Time:</strong><br>
                        <span style="font-size: 16px; color: #2c3e50;">${entry.signOnTime}</span>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Total Trains:</strong><br>
                        <span style="font-size: 16px; font-weight: 600; color: #e67e22;">${entry.trains.length}</span>
                    </div>
                    <div style="padding: 10px; background: white; border-radius: 6px;">
                        <strong style="color: #6c757d;">Date:</strong><br>
                        <span style="font-size: 16px; color: #2c3e50;">${currentDate}</span>
                    </div>
                </div>
                
                <div>
                    <strong style="color: #495057;">🚂 Assigned Trains:</strong><br>
                    <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                        ${entry.trains.map(train => `
                            <span style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 5px; display: inline-block; box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);">
                                ${train.trainNumber} (${train.startTime}-${train.endTime})
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Reassignment Mode Selection -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">🔧 Reassignment Mode</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <label id="motormanModeLabel" style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: white; border-radius: 8px; border: 2px solid #007bff; transition: all 0.3s; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);">
                        <input type="radio" name="reassignmentMode" value="motorman_change" checked 
                               style="margin-right: 10px; transform: scale(1.2);">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">👤 Change Motorman</div>
                            <div style="font-size: 0.9em; color: #666;">Assign different motorman to this detail (full or partial)</div>
                        </div>
                    </label>
                    <label id="detailModeLabel" style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: white; border-radius: 8px; border: 2px solid #e9ecef; transition: all 0.3s;">
                        <input type="radio" name="reassignmentMode" value="detail_change" 
                               style="margin-right: 10px; transform: scale(1.2);">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">📋 Change Detail</div>
                            <div style="font-size: 0.9em; color: #666;">Move motorman to different detail</div>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Motorman Change Section -->
            <div id="motormanChangeSection" style="display: block;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">🔄 Reassignment Type *</label>
                    <select id="reassignType" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                        <option value="">Select Type</option>
                        <option value="full_detail">🚂 Full Detail Transfer (All trains to new motorman)</option>
                        <option value="partial_detail">📋 Partial Detail Transfer (Some trains to new motorman)</option>
                        <option value="specific_trains">🎯 Specific Trains Only (Selected trains to new motorman)</option>
                        <option value="waiting_to_detail">⏳ Waiting Motorman → This Detail</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">👤 New Motorman *</label>
                    <input type="text" id="newMotorman" placeholder="Enter new motorman name" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">❓ What happens to ${entry.motormanName}?</label>
                    <select id="displacedAction" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                        <option value="mark_waiting">Mark as Waiting</option>
                        <option value="assign_to_relief">Assign to Relief Detail</option>
                        <option value="assign_to_other">Assign to Another Detail</option>
                        <option value="keep_remaining">Keep Remaining Trains (for partial)</option>
                    </select>
                </div>

                <!-- Train Selection Section -->
                <div id="trainSelectionSection" style="display: none; background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #007bff;">
                    <h5 style="margin-bottom: 15px; color: #0056b3;">🚂 Select Trains for Reassignment</h5>
                    <div id="trainSelectionInstructions" style="background: #e7f3ff; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9em; color: #004085;">
                        <!-- Instructions will be populated based on reassignment type -->
                    </div>
                    <div id="trainCheckboxContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                        <!-- Train checkboxes will be populated here -->
                    </div>
                    <div id="reassignmentPreview" style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px; display: none;">
                        <h6 style="color: #856404; margin-bottom: 10px;">📋 Reassignment Preview</h6>
                        <div id="previewContent" style="font-size: 0.9em; color: #856404;">
                            <!-- Preview content will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Change Section -->
            <div id="detailChangeSection" style="display: none;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">📋 Target Detail Type *</label>
                    <select id="targetDetailType" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                        <option value="">Select Target</option>
                        <option value="vacant_detail">Vacant Detail (Unassigned)</option>
                        <option value="occupied_detail">Occupied Detail (Replace Motorman)</option>
                        <option value="waiting_detail">Waiting Detail</option>
                    </select>
                </div>

                <div id="targetDetailSelection" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">📋 Target Detail Number *</label>
                        <input type="text" id="targetDetailNumber" placeholder="Enter target detail number" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px;">
                    </div>
                    
                    <div id="targetDetailInfo" style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 10px; display: none;">
                        <!-- Target detail information will be shown here -->
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 16px;">🔧 Assignment Scope</label>
                    <select id="detailAssignmentScope" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                        <option value="full">Full Detail Assignment</option>
                        <option value="partial">Partial Detail Assignment</option>
                    </select>
                </div>
            </div>
            
            <!-- Common Fields -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057; font-size: 16px;">🏢 Office</label>
                <select id="reassignOffice" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                    <option value="CSMT">CSMT</option>
                    <option value="KYN">KYN</option>
                    <option value="PNVL">PNVL</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057; font-size: 16px;">❓ Reason for Reassignment *</label>
                <select id="reassignReason" style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; background: white;">
                    <option value="">Select Reason</option>
                    <option value="Medical Emergency">🏥 Medical Emergency</option>
                    <option value="Personal Emergency">🚨 Personal Emergency</option>
                    <option value="Technical Training">📚 Technical Training</option>
                    <option value="Administrative Work">📋 Administrative Work</option>
                    <option value="Operational Requirements">⚙️ Operational Requirements</option>
                    <option value="Relief Assignment">🆘 Relief Assignment</option>
                    <option value="Detail Optimization">⚡ Detail Optimization</option>
                    <option value="Partial Reassignment">🔄 Partial Reassignment</option>
                    <option value="Other">📝 Other</option>
                </select>
            </div>
            
            <div style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057; font-size: 16px;">📝 Additional Notes</label>
                <textarea id="reassignNotes" rows="4" placeholder="Optional additional details, approval reference, etc..." style="width: 100%; padding: 12px 15px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; resize: vertical; font-family: Arial, sans-serif;"></textarea>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                <button type="button" onclick="closeReassignmentModal()" style="padding: 14px 28px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">❌ Cancel</button>
                <button type="button" onclick="processEnhancedReassignment()" style="padding: 14px 28px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);">🔄 Process Reassignment</button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Setup FIXED event listeners
    setupFixedModalEventListeners(modal);
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('#reassignType');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
    
    console.log('✅ Enhanced modal with ALL FIXES created');
}

// 2. FIXED event listeners setup
function setupFixedModalEventListeners(modal) {
    console.log('🔧 Setting up FIXED modal event listeners...');
    
    // 1. FIXED Radio button handlers
    const motormanModeLabel = modal.querySelector('#motormanModeLabel');
    const detailModeLabel = modal.querySelector('#detailModeLabel');
    const motormanRadio = modal.querySelector('input[value="motorman_change"]');
    const detailRadio = modal.querySelector('input[value="detail_change"]');
    
    // Reset and add click handlers
    if (motormanModeLabel && detailModeLabel && motormanRadio && detailRadio) {
        // Remove any existing listeners
        motormanModeLabel.onclick = null;
        detailModeLabel.onclick = null;
        
        // Add FIXED click handlers
        motormanModeLabel.addEventListener('click', function(e) {
            console.log('👤 Motorman mode clicked');
            motormanRadio.checked = true;
            detailRadio.checked = false;
            updateModeSelection('motorman_change');
            onReassignmentModeChange();
        });
        
        detailModeLabel.addEventListener('click', function(e) {
            console.log('📋 Detail mode clicked');
            detailRadio.checked = true;
            motormanRadio.checked = false;
            updateModeSelection('detail_change');
            onReassignmentModeChange();
        });
        
        // Add change listeners to radio buttons themselves
        motormanRadio.addEventListener('change', function() {
            if (this.checked) {
                updateModeSelection('motorman_change');
                onReassignmentModeChange();
            }
        });
        
        detailRadio.addEventListener('change', function() {
            if (this.checked) {
                updateModeSelection('detail_change');
                onReassignmentModeChange();
            }
        });
    }
    
    // 2. FIXED Reassignment type handler
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        reassignTypeSelect.addEventListener('change', function() {
            console.log('🔄 Reassignment type changed to:', this.value);
            handleReassignmentTypeChange();
        });
    }
    
    // 3. FIXED Target detail type handler
    const targetDetailTypeSelect = modal.querySelector('#targetDetailType');
    if (targetDetailTypeSelect) {
        targetDetailTypeSelect.addEventListener('change', function() {
            console.log('📋 Target detail type changed to:', this.value);
            handleTargetDetailChange();
        });
    }
    
    console.log('✅ FIXED modal event listeners setup complete');
}

// 9. FIXED target detail change handler
function handleTargetDetailChange() {
    const targetDetailType = document.getElementById('targetDetailType')?.value;
    const targetDetailSelection = document.getElementById('targetDetailSelection');
    
    if (targetDetailType && targetDetailSelection) {
        if (targetDetailType === 'vacant_detail' || targetDetailType === 'occupied_detail') {
            targetDetailSelection.style.display = 'block';
        } else {
            targetDetailSelection.style.display = 'none';
        }
    }
}

// 3. FIXED mode selection visual update
function updateModeSelection(selectedMode) {
    console.log('🔄 Updating mode selection to:', selectedMode);
    
    const motormanLabel = document.getElementById('motormanModeLabel');
    const detailLabel = document.getElementById('detailModeLabel');
    
    if (motormanLabel && detailLabel) {
        // Reset styles
        motormanLabel.style.borderColor = '#e9ecef';
        motormanLabel.style.boxShadow = 'none';
        detailLabel.style.borderColor = '#e9ecef';
        detailLabel.style.boxShadow = 'none';
        
        // Apply selected style
        if (selectedMode === 'motorman_change') {
            motormanLabel.style.borderColor = '#007bff';
            motormanLabel.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        } else if (selectedMode === 'detail_change') {
            detailLabel.style.borderColor = '#007bff';
            detailLabel.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        }
    }
}

// Enhanced handlers for the modal
function setupEnhancedModalListeners(modal) {
    // Radio button selection for visual feedback
    const radioLabels = modal.querySelectorAll('label[onclick*="selectReassignmentMode"]');
    radioLabels.forEach(label => {
        label.addEventListener('click', function() {
            // Remove selection from all labels
            radioLabels.forEach(l => l.style.borderColor = '#e9ecef');
            // Add selection to clicked label
            this.style.borderColor = '#007bff';
            this.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        });
    });
}

// 4. FIXED mode change handler
function onReassignmentModeChange() {
    console.log('🔄 Processing reassignment mode change...');
    
    const checkedRadio = document.querySelector('input[name="reassignmentMode"]:checked');
    if (!checkedRadio) {
        console.warn('⚠️ No radio button checked');
        return;
    }
    
    const mode = checkedRadio.value;
    console.log('📋 Selected mode:', mode);
    
    const motormanSection = document.getElementById('motormanChangeSection');
    const detailSection = document.getElementById('detailChangeSection');
    
    if (!motormanSection || !detailSection) {
        console.error('❌ Sections not found');
        return;
    }
    
    if (mode === 'motorman_change') {
        motormanSection.style.display = 'block';
        detailSection.style.display = 'none';
        console.log('✅ Showing motorman section');
    } else if (mode === 'detail_change') {
        motormanSection.style.display = 'none';
        detailSection.style.display = 'block';
        console.log('✅ Showing detail section');
    }
}

// Add this function to handle the action change
function handleActionChange() {
    const action = document.getElementById('reassignmentAction')?.value;
    
    // Hide all sections first
    const sections = [
        'changeMotormanSection',
        'moveMotormanSection', 
        'assignWaitingSection',
        'swapMotormenSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Show relevant section based on selection
    if (action === 'change_motorman') {
        const section = document.getElementById('changeMotormanSection');
        if (section) section.style.display = 'block';
    } else if (action === 'move_motorman') {
        const section = document.getElementById('moveMotormanSection');
        if (section) section.style.display = 'block';
    } else if (action === 'assign_waiting') {
        const section = document.getElementById('assignWaitingSection');
        if (section) section.style.display = 'block';
    } else if (action === 'swap_motormen') {
        const section = document.getElementById('swapMotormenSection');
        if (section) section.style.display = 'block';
    }
}



// 10. FIXED processEnhancedReassignment function
function processEnhancedReassignment() {
    console.log('🔄 Processing enhanced reassignment with COMPLETE fixes...');
    
    // Get reassignment mode
    const checkedRadio = document.querySelector('input[name="reassignmentMode"]:checked');
    if (!checkedRadio) {
        showToast('⚠️ Please select a reassignment mode', 'warning');
        return;
    }
    
    const mode = checkedRadio.value;
    console.log('📋 Processing mode:', mode);
    
    if (mode === 'motorman_change') {
        return processMotormanReassignment();
    } else if (mode === 'detail_change') {
        return processDetailReassignment();
    }
}

// 11. FIXED processMotormanReassignment function
function processMotormanReassignment() {
    console.log('👤 Processing motorman reassignment...');
    
    // Get all form elements
    const reassignType = document.getElementById('reassignType')?.value;
    const newMotorman = document.getElementById('newMotorman')?.value?.trim();
    const reason = document.getElementById('reassignReason')?.value;
    const office = document.getElementById('reassignOffice')?.value || 'CSMT';
    const notes = document.getElementById('reassignNotes')?.value || '';
    const displacedAction = document.getElementById('displacedAction')?.value || 'mark_waiting';
    
    console.log('📋 Form values:', { reassignType, newMotorman, reason, office, notes, displacedAction });
    
    // Manual validation
    if (!reassignType) {
        showToast('⚠️ Please select reassignment type', 'warning');
        document.getElementById('reassignType')?.focus();
        return;
    }
    
    if (!newMotorman) {
        showToast('⚠️ Please enter new motorman name', 'warning');
        document.getElementById('newMotorman')?.focus();
        return;
    }
    
    if (!reason) {
        showToast('⚠️ Please select a reason', 'warning');
        document.getElementById('reassignReason')?.focus();
        return;
    }
    
    // Check if we have the current data
    if (!window.currentReassignmentData?.entry) {
        showToast('❌ No detail data found', 'error');
        return;
    }
    
    // Get selected trains for partial/specific reassignments
    let selectedTrains = [];
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        const trainInputs = document.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked');
        selectedTrains = Array.from(trainInputs).map(input => input.value);
        
        console.log(`🚂 Selected trains: ${selectedTrains.length}`);
        
        if (selectedTrains.length === 0) {
            showToast(`⚠️ Please select at least one train for ${reassignType.replace('_', ' ')}`, 'warning');
            return;
        }
        
        // For partial detail, ensure not all trains are selected
        if (reassignType === 'partial_detail' && selectedTrains.length >= window.currentReassignmentData.entry.trains.length) {
            showToast('⚠️ For partial reassignment, please leave some trains with the original motorman', 'warning');
            return;
        }
    }
    
    // Prepare comprehensive reassignment data
    let reassignmentData = {
        mode: 'motorman_change',
        reassignmentType: reassignType,
        originalDetail: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        originalOffice: window.currentReassignmentData.entry.office,
        newMotorman: newMotorman,
        office: office,
        reason: reason,
        notes: notes,
        displacedAction: displacedAction,
        selectedTrains: selectedTrains,
        date: currentDate || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        createdBy: 'JFO Supervisor',
        index: window.currentReassignmentData.index
    };
    
    console.log('📋 Complete reassignment data:', reassignmentData);
    
    // Show processing feedback
    showToast('🔄 Processing reassignment...', 'info', 2000);
    
    // Process the reassignment
    setTimeout(() => {
        try {
            // Update the actual data in memory
            updateAppearanceDataWithPartialReassignment(reassignmentData);
            
            // Close modal first
            closeReassignmentModal();
            
            // Show detailed success message
            const successMessage = createPartialReassignmentSuccessMessage(reassignmentData);
            showToast(successMessage, 'success', 6000);
            
            // Refresh the display to show changes
            if (window.currentAppearanceData) {
                displayAppearanceBookDebug(window.currentAppearanceData);
                updateSummaryCards(calculateSummaryStats(window.currentAppearanceData));
            }
            
            // Show reassignment confirmation modal
            setTimeout(() => {
                showPartialReassignmentConfirmation(reassignmentData);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error processing reassignment:', error);
            showToast('❌ Failed to process reassignment', 'error');
        }
    }, 1500);
}

// Create success message for partial reassignments
function createPartialReassignmentSuccessMessage(reassignmentData) {
    const actionDesc = getActionDescription(reassignmentData.reassignmentType);
    const details = getPartialActionDetails(reassignmentData);
    
    return `✅ ${actionDesc} completed!\n📋 Detail ${reassignmentData.originalDetail}\n${details.summary}`;
}


// 12. FIXED processDetailReassignment function
function processDetailReassignment() {
    console.log('📋 Processing detail reassignment...');
    
    // Get detail change form elements
    const targetDetailType = document.getElementById('targetDetailType')?.value;
    const targetDetailNumber = document.getElementById('targetDetailNumber')?.value?.trim();
    const detailAssignmentScope = document.getElementById('detailAssignmentScope')?.value || 'full';
    const reason = document.getElementById('reassignReason')?.value;
    const office = document.getElementById('reassignOffice')?.value || 'CSMT';
    const notes = document.getElementById('reassignNotes')?.value || '';
    
    // Validation for detail change
    if (!targetDetailType) {
        showToast('⚠️ Please select target detail type', 'warning');
        document.getElementById('targetDetailType')?.focus();
        return;
    }
    
    if (!reason) {
        showToast('⚠️ Please select a reason', 'warning');
        document.getElementById('reassignReason')?.focus();
        return;
    }
    
    let reassignmentData = {
        mode: 'detail_change',
        reassignmentType: 'detail_transfer',
        originalDetail: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        originalOffice: window.currentReassignmentData.entry.office,
        targetDetailType: targetDetailType,
        targetDetailNumber: targetDetailNumber,
        detailAssignmentScope: detailAssignmentScope,
        office: office,
        reason: reason,
        notes: notes,
        date: currentDate || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        createdBy: 'JFO Supervisor',
        index: window.currentReassignmentData.index
    };
    
    console.log('📋 Detail reassignment data:', reassignmentData);
    
    // Show processing feedback
    showToast('🔄 Processing detail transfer...', 'info', 2000);
    
    // Process detail reassignment
    setTimeout(() => {
        try {
            updateAppearanceDataWithDetailReassignment(reassignmentData);
            closeReassignmentModal();
            
            const successMessage = `✅ Detail transfer completed!\n📋 ${reassignmentData.originalMotorman} moved from Detail ${reassignmentData.originalDetail} to Detail ${reassignmentData.targetDetailNumber}`;
            showToast(successMessage, 'success', 6000);
            
            if (window.currentAppearanceData) {
                displayAppearanceBookDebug(window.currentAppearanceData);
                updateSummaryCards(calculateSummaryStats(window.currentAppearanceData));
            }
            
            setTimeout(() => {
                showPartialReassignmentConfirmation(reassignmentData);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error processing detail reassignment:', error);
            showToast('❌ Failed to process detail transfer', 'error');
        }
    }, 1500);
}

// Enhanced reassignment confirmation modal for partial reassignments
function showPartialReassignmentConfirmation(reassignmentData) {
    console.log('📋 Showing partial reassignment confirmation...');
    
    const modal = document.createElement('div');
    modal.id = 'reassignmentConfirmationModal';
    modal.className = 'modal';
    
    const details = getPartialActionDetails(reassignmentData);
    const isPartial = reassignmentData.selectedTrains && reassignmentData.selectedTrains.length > 0;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 3em; margin-bottom: 15px;">✅</div>
                <h2 style="color: #27ae60; margin: 0;">Reassignment Successful!</h2>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745; margin-bottom: 20px;">
                <h4 style="color: #155724; margin-bottom: 15px;">📋 Reassignment Details</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">Detail Number:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.originalDetail}</span>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">Reassignment Type:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.reassignmentType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">Original Motorman:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.originalMotorman}</span>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">${reassignmentData.mode === 'detail_change' ? 'Target Detail:' : 'New Motorman:'}</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.newMotorman || reassignmentData.targetDetailNumber}</span>
                    </div>
                </div>
                
                ${isPartial ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
                        <h5 style="color: #856404; margin-bottom: 10px;">🚂 Train Assignment Details</h5>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #856404;">Reassigned Trains (${details.trainCount}):</strong><br>
                                <span style="color: #2c3e50; font-size: 0.9em;">${reassignmentData.selectedTrains.join(', ')}</span>
                            </div>
                            ${details.remainingCount ? `
                                <div>
                                    <strong style="color: #856404;">Remaining with ${reassignmentData.originalMotorman} (${details.remainingCount}):</strong><br>
                                    <span style="color: #2c3e50; font-size: 0.9em;">Other trains in detail</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <strong style="color: #666;">Summary:</strong><br>
                    <span style="font-size: 1.1em; color: #2c3e50;">${details.summary}</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">Date & Time:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${new Date(reassignmentData.timestamp).toLocaleString()}</span>
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong style="color: #666;">Reason:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.reason}</span>
                    </div>
                </div>
                
                ${reassignmentData.notes ? `
                    <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 15px;">
                        <strong style="color: #666;">Notes:</strong><br>
                        <span style="font-size: 1.1em; color: #2c3e50;">${reassignmentData.notes}</span>
                    </div>
                ` : ''}
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; color: #856404;">
                    <span style="font-size: 1.2em;">💡</span>
                    <span><strong>Next Steps:</strong> The appearance book has been updated. ${isPartial ? 'Check both the original and new train assignments.' : 'You can view the complete reassignment history by clicking "👁️ History".'}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeReassignmentConfirmation()" style="
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1.1em;
                    font-weight: 600;
                ">
                    ✅ Got It!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 12 seconds for partial reassignments (more info to read)
    setTimeout(() => {
        closeReassignmentConfirmation();
    }, 12000);
}

// Close confirmation modal
function closeReassignmentConfirmation() {
    const modal = document.getElementById('reassignmentConfirmationModal');
    if (modal) {
        modal.remove();
    }
}

// Update appearance data with partial reassignment support
function updateAppearanceDataWithPartialReassignment(reassignmentData) {
    console.log('🔄 Updating appearance data with partial reassignment...');
    
    if (!window.currentAppearanceData || !window.currentAppearanceData[reassignmentData.index]) {
        console.error('❌ No appearance data to update');
        return;
    }
    
    const entry = window.currentAppearanceData[reassignmentData.index];
    
    // Create detailed reassignment record
    const reassignmentRecord = {
        id: `reassign_${Date.now()}`,
        type: reassignmentData.reassignmentType,
        reason: reassignmentData.reason,
        notes: reassignmentData.notes,
        originalMotorman: reassignmentData.originalMotorman,
        newMotorman: reassignmentData.newMotorman,
        selectedTrains: reassignmentData.selectedTrains || [],
        displacedAction: reassignmentData.displacedAction,
        createdAt: reassignmentData.timestamp,
        createdBy: reassignmentData.createdBy,
        actionDetails: getPartialActionDetails(reassignmentData)
    };
    
    // Initialize reassignments array if not exists
    if (!entry.reassignments) {
        entry.reassignments = [];
    }
    
    // Add the new reassignment
    entry.reassignments.push(reassignmentRecord);
    entry.hasReassignments = true;
    
    // Update entry based on reassignment type
    switch (reassignmentData.reassignmentType) {
        case 'full_detail':
            // Full transfer - new motorman gets all trains
            entry.motormanName = reassignmentData.newMotorman;
            entry.office = reassignmentData.office;
            entry.effectiveAssignment.motormanName = reassignmentData.newMotorman;
            entry.effectiveAssignment.assignedTrains = entry.trains.map(t => t.trainNumber);
            break;
            
        case 'partial_detail':
        case 'specific_trains':
            // Partial transfer - split the trains
            const selectedTrainObjects = entry.trains.filter(train => 
                reassignmentData.selectedTrains.includes(train.trainNumber)
            );
            const remainingTrainObjects = entry.trains.filter(train => 
                !reassignmentData.selectedTrains.includes(train.trainNumber)
            );
            
            // Update the original entry to show partial assignment
            if (remainingTrainObjects.length > 0) {
                entry.motormanName = `${reassignmentData.originalMotorman} (${remainingTrainObjects.length}/${entry.trains.length} trains)`;
                entry.effectiveAssignment.assignedTrains = remainingTrainObjects.map(t => t.trainNumber);
                
                // Create a new entry for the reassigned trains (optional)
                createPartialReassignmentEntry(reassignmentData, selectedTrainObjects);
            } else {
                // All trains were reassigned
                entry.motormanName = reassignmentData.newMotorman;
                entry.office = reassignmentData.office;
                entry.effectiveAssignment.motormanName = reassignmentData.newMotorman;
            }
            break;
            
        case 'waiting_to_detail':
            entry.motormanName = reassignmentData.newMotorman;
            entry.office = reassignmentData.office;
            entry.status = 'assigned';
            entry.effectiveAssignment.motormanName = reassignmentData.newMotorman;
            break;
    }
    
    // Update reassignment type
    entry.effectiveAssignment.reassignmentType = 'reassigned';
    
    console.log('✅ Entry updated with partial reassignment:', entry);
}

// Get detailed action description for partial reassignments
function getPartialActionDetails(reassignmentData) {
    const selectedCount = reassignmentData.selectedTrains?.length || 0;
    const totalTrains = window.currentReassignmentData?.entry?.trains?.length || 0;
    
    switch (reassignmentData.reassignmentType) {
        case 'full_detail':
            return {
                summary: `Full detail transfer: All ${totalTrains} trains assigned to ${reassignmentData.newMotorman}`,
                type: 'full_transfer',
                trainCount: totalTrains
            };
        case 'partial_detail':
            return {
                summary: `Partial transfer: ${selectedCount} of ${totalTrains} trains assigned to ${reassignmentData.newMotorman}`,
                type: 'partial_transfer',
                selectedTrains: reassignmentData.selectedTrains,
                trainCount: selectedCount,
                remainingCount: totalTrains - selectedCount
            };
        case 'specific_trains':
            return {
                summary: `Specific trains reassigned: ${reassignmentData.selectedTrains.join(', ')} → ${reassignmentData.newMotorman}`,
                type: 'specific_transfer',
                selectedTrains: reassignmentData.selectedTrains,
                trainCount: selectedCount
            };
        case 'waiting_to_detail':
            return {
                summary: `Waiting motorman ${reassignmentData.newMotorman} assigned to detail`,
                type: 'waiting_assignment'
            };
        default:
            return { summary: 'Reassignment processed', type: 'unknown' };
    }
}

// Update appearance data for detail reassignment
function updateAppearanceDataWithDetailReassignment(reassignmentData) {
    console.log('🔄 Updating appearance data with detail reassignment...');
    
    const entry = window.currentAppearanceData[reassignmentData.index];
    
    const reassignmentRecord = {
        id: `detail_reassign_${Date.now()}`,
        type: 'detail_transfer',
        reason: reassignmentData.reason,
        notes: reassignmentData.notes,
        originalMotorman: reassignmentData.originalMotorman,
        targetDetail: reassignmentData.targetDetailNumber,
        targetDetailType: reassignmentData.targetDetailType,
        detailAssignmentScope: reassignmentData.detailAssignmentScope,
        createdAt: reassignmentData.timestamp,
        createdBy: reassignmentData.createdBy
    };
    
    if (!entry.reassignments) {
        entry.reassignments = [];
    }
    
    entry.reassignments.push(reassignmentRecord);
    entry.hasReassignments = true;
    
    // Update entry based on detail change
    entry.status = 'vacant';
    entry.motormanName = `Vacant (${reassignmentData.originalMotorman} → Detail ${reassignmentData.targetDetailNumber})`;
    
    console.log('✅ Entry updated with detail reassignment:', entry);
}

// Create a new entry for partially reassigned trains (optional feature)
function createPartialReassignmentEntry(reassignmentData, selectedTrainObjects) {
    if (selectedTrainObjects.length === 0) return;
    
    const newEntry = {
        detailId: `${reassignmentData.originalDetail}-PARTIAL-${Date.now()}`,
        detailNumber: `${reassignmentData.originalDetail}P`,
        motormanName: `${reassignmentData.newMotorman} (Partial - ${selectedTrainObjects.length} trains)`,
        office: reassignmentData.office,
        signOnTime: selectedTrainObjects[0]?.startTime || '06:00',
        signOffTime: selectedTrainObjects[selectedTrainObjects.length - 1]?.endTime || '14:00',
        trains: selectedTrainObjects,
        totalTrains: selectedTrainObjects.length,
        status: 'assigned',
        hasReassignments: true,
        reassignments: [{
            id: `partial_${Date.now()}`,
            type: 'partial_creation',
            reason: 'Partial reassignment from original detail',
            originalDetail: reassignmentData.originalDetail,
            createdAt: reassignmentData.timestamp,
            createdBy: reassignmentData.createdBy
        }],
        effectiveAssignment: {
            motormanName: reassignmentData.newMotorman,
            assignedTrains: selectedTrainObjects.map(t => t.trainNumber),
            reassignmentType: 'partial_transfer'
        },
        isPartialEntry: true
    };
    
    // Add to the appearance data
    window.currentAppearanceData.push(newEntry);
    
    console.log('✅ Created partial reassignment entry:', newEntry);
}

// Helper function to get action description
function getActionDescription(reassignmentType) {
    switch(reassignmentType) {
        case 'full_detail': return 'Full detail transfer';
        case 'partial_detail': return 'Partial detail transfer';
        case 'specific_trains': return 'Specific train reassignment';
        case 'waiting_to_detail': return 'Waiting assignment';
        case 'detail_transfer': return 'Detail transfer';
        default: return 'Reassignment';
    }
}

// Make functions globally accessible
window.handleActionChange = handleActionChange;
window.processEnhancedReassignment = processEnhancedReassignment;

function processModalReassignment(event) {
    event.preventDefault();
    
    const reassignType = document.getElementById('modalReassignType').value;
    const newMotorman = document.getElementById('modalNewMotorman').value;
    const reason = document.getElementById('modalReassignReason').value;
    const notes = document.getElementById('modalReassignNotes').value;
    const newOffice = document.getElementById('modalNewOffice').value;
    
    if (!reassignType || !newMotorman || !reason) {
        alert('Please fill in all required fields (Type, Motorman, Reason)');
        return;
    }
    
    const reassignmentData = {
        detailNumber: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        newMotorman: newMotorman,
        newOffice: newOffice,
        reassignmentType: reassignType,
        reason: reason,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    console.log('📋 Reassignment processed:', reassignmentData);
    showToast(`✅ Reassignment recorded: Detail ${reassignmentData.detailNumber} → ${reassignmentData.newMotorman}`, 'success');
    
    closeReassignmentModal();
}

function createForceModal(entry) {
    console.log('🔧 Creating FORCE modal...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
        console.log('🗑️ Removed existing modal');
    }
    
    // Create the most basic modal possible
    const modal = document.createElement('div');
    modal.id = 'activeReassignmentModal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px;">🔄 Reassign Detail ${entry.detailNumber}</h2>
                    <button onclick="forceCloseModal()" style="background: none; border: none; font-size: 30px; cursor: pointer; color: #999;">&times;</button>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0;">Current Assignment</h3>
                    <p><strong>Detail:</strong> ${entry.detailNumber}</p>
                    <p><strong>Motorman:</strong> ${entry.motormanName}</p>
                    <p><strong>Office:</strong> ${entry.office}</p>
                    <p><strong>Sign On:</strong> ${entry.signOnTime}</p>
                    <p><strong>Trains:</strong> ${entry.trains.length}</p>
                    <p><strong>Train Numbers:</strong></p>
                    <div style="margin-top: 10px;">
                        ${entry.trains.map(train => `
                            <span style="background: #007bff; color: white; padding: 5px 10px; border-radius: 15px; margin-right: 8px; margin-bottom: 5px; display: inline-block; font-size: 14px;">
                                ${train.trainNumber}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Reassignment Type *</label>
                        <select id="forceReassignType" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                            <option value="">Select Type</option>
                            <option value="full_detail">Full Detail Transfer</option>
                            <option value="partial_detail">Partial Detail Transfer</option>
                            <option value="specific_trains">Specific Trains Only</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">New Motorman *</label>
                        <input type="text" id="forceNewMotorman" placeholder="Enter new motorman name" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Office</label>
                        <select id="forceNewOffice" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                            <option value="CSMT">CSMT</option>
                            <option value="KYN">KYN</option>
                            <option value="PNVL">PNVL</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Reason *</label>
                        <select id="forceReason" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;">
                            <option value="">Select Reason</option>
                            <option value="Medical Emergency">Medical Emergency</option>
                            <option value="Personal Emergency">Personal Emergency</option>
                            <option value="Technical Training">Technical Training</option>
                            <option value="Administrative Work">Administrative Work</option>
                            <option value="Operational Requirements">Operational Requirements</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Notes</label>
                        <textarea id="forceNotes" rows="3" placeholder="Additional notes..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button onclick="forceCloseModal()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Cancel</button>
                        <button onclick="forceProcessReassignment()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🔄 Process Reassignment</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add directly to body
    document.body.appendChild(modal);
    modal.style.display = 'flex';  // <- Ensure it activates the flex overlay layout

    
    console.log('✅ FORCE modal created and added');
    console.log('🔍 Modal element:', modal);
    console.log('🔍 Modal in DOM:', document.getElementById('activeReassignmentModal'));
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = document.getElementById('forceReassignType');
        if (firstInput) {
            firstInput.focus();
            console.log('✅ Focus set');
        }
    }, 100);
    
    // Double check visibility
    setTimeout(() => {
        const checkModal = document.getElementById('activeReassignmentModal');
        if (checkModal) {
            const styles = getComputedStyle(checkModal);
            console.log('🔍 Final modal check:', {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                position: styles.position
            });
        }
    }, 200);
}

function setupModalEventListeners(modal) {
    // Reassignment type change handler
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        reassignTypeSelect.addEventListener('change', function() {
            handleReassignmentTypeChange(modal);
        });
    }
    
    // Form submission handler
    const form = modal.querySelector('#reassignmentForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            processReassignment(event, modal);
        });
    }
}

// Handle reassignment type changes (with train selection)
function handleReassignmentTypeChange() {
    const reassignType = document.getElementById('reassignType')?.value;
    const trainSelectionSection = document.getElementById('trainSelectionSection');
    const instructionsDiv = document.getElementById('trainSelectionInstructions');
    const displacedAction = document.getElementById('displacedAction');
    
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        trainSelectionSection.style.display = 'block';
        
        // Update instructions based on type
        if (reassignType === 'partial_detail') {
            instructionsDiv.innerHTML = `
                <strong>📋 Partial Detail Transfer:</strong> Select multiple trains to transfer to the new motorman. 
                The remaining trains will stay with ${window.currentReassignmentData?.entry?.motormanName || 'current motorman'}.
            `;
            displacedAction.value = 'keep_remaining';
        } else {
            instructionsDiv.innerHTML = `
                <strong>🎯 Specific Trains:</strong> Select specific trains to reassign to the new motorman. 
                This is useful for operational adjustments or emergency replacements.
            `;
        }
        
        // Populate train selection
        populateTrainSelection();
    } else {
        trainSelectionSection.style.display = 'none';
        displacedAction.value = 'mark_waiting';
    }
}

// 6. FIXED train selection population
function populateTrainSelection() {
    console.log('🚂 Populating train selection...');
    
    const container = document.getElementById('trainCheckboxContainer');
    const reassignType = document.getElementById('reassignType')?.value;
    const entry = window.currentReassignmentData?.entry;
    
    if (!container) {
        console.error('❌ Train container not found');
        return;
    }
    
    if (!entry?.trains || entry.trains.length === 0) {
        console.error('❌ No trains data found');
        container.innerHTML = '<div style="color: red;">No trains data available</div>';
        return;
    }
    
    console.log(`📋 Found ${entry.trains.length} trains to display`);
    
    container.innerHTML = '';
    
    const inputType = reassignType === 'partial_detail' ? 'checkbox' : 'radio';
    const inputName = reassignType === 'partial_detail' ? 'selectedTrains' : 'selectedTrain';
    
    entry.trains.forEach((train, index) => {
        console.log(`🚂 Creating card for train ${index + 1}: ${train.trainNumber}`);
        
        const trainCard = document.createElement('div');
        trainCard.className = 'train-selection-card';
        trainCard.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        trainCard.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" style="margin-right: 12px; transform: scale(1.3);">
                <label for="train_${index}" style="font-weight: 600; color: #2c3e50; font-size: 1.1em; cursor: pointer;">
                    🚂 ${train.trainNumber}
                </label>
            </div>
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                <strong>Route:</strong> ${train.startStation} → ${train.endStation}
            </div>
            <div style="color: #495057; font-size: 0.9em; font-weight: 500;">
                <strong>Time:</strong> ${train.startTime} - ${train.endTime}
            </div>
        `;
        
        // Add FIXED click handler for the entire card
        trainCard.addEventListener('click', function() {
            const checkbox = this.querySelector('input');
            if (inputType === 'radio') {
                // For radio buttons, uncheck all others first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    r.closest('.train-selection-card').style.borderColor = '#e9ecef';
                    r.closest('.train-selection-card').style.backgroundColor = 'white';
                });
            }
            
            checkbox.checked = !checkbox.checked;
            updateTrainCardSelection(this, checkbox.checked);
            updateReassignmentPreview();
        });
        
        // Add change listener to checkbox/radio
        const input = trainCard.querySelector('input');
        input.addEventListener('change', function() {
            updateTrainCardSelection(trainCard, this.checked);
            updateReassignmentPreview();
        });
        
        container.appendChild(trainCard);
    });
    
    console.log('✅ Train selection populated successfully');
}
// 7. FIXED train card selection visual update
function updateTrainCardSelection(card, isSelected) {
    if (isSelected) {
        card.style.borderColor = '#28a745';
        card.style.backgroundColor = '#f8fff9';
        card.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
    } else {
        card.style.borderColor = '#e9ecef';
        card.style.backgroundColor = 'white';
        card.style.boxShadow = 'none';
    }
}

// Update train selection handler
function updateTrainSelection() {
    const container = document.getElementById('trainCheckboxContainer');
    const cards = container.querySelectorAll('.train-selection-card');
    
    cards.forEach(card => {
        const checkbox = card.querySelector('input');
        updateTrainCardSelection(card, checkbox.checked);
    });
}
// 8. FIXED reassignment preview update
function updateReassignmentPreview() {
    console.log('🔄 Updating reassignment preview...');
    
    const previewDiv = document.getElementById('reassignmentPreview');
    const previewContent = document.getElementById('previewContent');
    const reassignType = document.getElementById('reassignType')?.value;
    const newMotorman = document.getElementById('newMotorman')?.value?.trim();
    
    if (!reassignType || !newMotorman || !previewDiv || !previewContent) {
        if (previewDiv) previewDiv.style.display = 'none';
        return;
    }
    
    const selectedTrains = Array.from(document.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked'))
        .map(input => input.value);
    
    console.log(`📋 Selected trains: ${selectedTrains.length}`);
    
    if (selectedTrains.length === 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    const remainingTrains = entry?.trains.filter(train => !selectedTrains.includes(train.trainNumber)) || [];
    
    let previewHTML = `
        <div style="margin-bottom: 12px;">
            <strong>🔄 ${newMotorman} will get:</strong><br>
            <span style="color: #28a745;">${selectedTrains.join(', ')}</span> (${selectedTrains.length} trains)
        </div>
    `;
    
    if (remainingTrains.length > 0 && reassignType === 'partial_detail') {
        previewHTML += `
            <div>
                <strong>✅ ${entry.motormanName} will keep:</strong><br>
                <span style="color: #007bff;">${remainingTrains.map(t => t.trainNumber).join(', ')}</span> (${remainingTrains.length} trains)
            </div>
        `;
    }
    
    previewContent.innerHTML = previewHTML;
    previewDiv.style.display = 'block';
    
    console.log('✅ Preview updated successfully');
}

// Helper function for mode selection
function selectReassignmentMode(mode) {
    const radio = document.querySelector(`input[name="reassignmentMode"][value="${mode}"]`);
    if (radio) {
        radio.checked = true;
        onReassignmentModeChange();
    }
}

function closeReassignmentModal() {
    const modal = document.getElementById('activeReassignmentModal');
    if (modal) {
        modal.remove();
        console.log('✅ Modal closed');
    }
    window.currentReassignmentData = null;
}

function showReassignmentHistory(detailId) {
    const entry = window.currentAppearanceData.find(e => e.detailId === detailId);
    if (!entry || !entry.reassignments || entry.reassignments.length === 0) {
        showToast('ℹ️ No reassignment history found for this detail', 'info');
        return;
    }
    
    const historyHtml = entry.reassignments.map(r => `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3498db;">
            <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                ${r.type.replace('_', ' ').toUpperCase()} - ${r.reason}
            </div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">
                <strong>From:</strong> ${r.originalMotorman} → <strong>To:</strong> ${r.newMotorman}
            </div>
            ${r.selectedTrains && r.selectedTrains.length > 0 ? `
                <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">
                    <strong>Trains:</strong> ${r.selectedTrains.join(', ')}
                </div>
            ` : ''}
            ${r.notes ? `<div style="font-size: 0.9em; color: #666; margin-bottom: 8px;"><strong>Notes:</strong> ${r.notes}</div>` : ''}
            <div style="font-size: 0.8em; color: #999;">
                ${new Date(r.createdAt).toLocaleString()} by ${r.createdBy}
            </div>
        </div>
    `).join('');
    
    const historyModal = `
        <div id="historyModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('historyModal').remove()">&times;</span>
                <h2>📚 Reassignment History - Detail ${entry.detailNumber}</h2>
                <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
                    ${historyHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', historyModal);
}
function generateDemoAppearanceData() {
    const offices = ['CSMT', 'KYN', 'PNVL'];
    const motormen = [
        'Rajesh Kumar (4523)', 'Suresh Patil (3456)', 'Amit Sharma (2789)', 
        'Waiting', 'Ravi Singh (5678)', 'Deepak Yadav (4321)', 'Waiting', 
        'Sanjay Gupta (8765)', 'Manoj Tiwari (9876)', 'Waiting',
        'Ashok Verma (1234)', 'Vinod Sharma (5432)', 'Pramod Kumar (6789)'
    ];
    
    const sampleData = [];
    
    for (let i = 1; i <= 15; i++) {
        const detailId = `ML89A-${200 + i}`;
        const motorman = motormen[Math.floor(Math.random() * motormen.length)];
        const office = offices[Math.floor(Math.random() * offices.length)];
        const signOnTime = `${String(5 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`;
        const hasReassignments = Math.random() > 0.7;
        const isWaiting = motorman === 'Waiting';
        
        const trains = [];
        const trainCount = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < trainCount; j++) {
            const trainPrefix = ['A', 'H', 'BL', 'DL'][Math.floor(Math.random() * 4)];
            const trainNum = Math.floor(Math.random() * 99) + 1;
            const startHour = 6 + (j * 2);
            const endHour = startHour + 1;
            
            trains.push({
                trainNumber: `${trainPrefix} ${trainNum}`,
                startTime: `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
                endTime: `${String(endHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
                startStation: 'CSMT',
                endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][Math.floor(Math.random() * 4)],
                id: `train_${i}_${j}`
            });
        }

        // Simulate some reassignments
        let reassignedTrains = [];
        if (hasReassignments && !isWaiting) {
            const numReassigned = Math.floor(trains.length / 2);
            reassignedTrains = trains.slice(0, numReassigned).map(t => t.trainNumber);
        }

        sampleData.push({
            detailId: detailId,
            detailNumber: (200 + i).toString(),
            motormanName: motorman,
            office: office,
            signOnTime: signOnTime,
            signOffTime: `${String(14 + Math.floor(Math.random() * 4)).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
            trains: trains,
            totalTrains: trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: hasReassignments && !isWaiting,
            reassignments: hasReassignments && !isWaiting ? [{
                id: `reassign_${i}`,
                type: 'partial_detail',
                reason: ['Medical Emergency', 'Personal Emergency', 'Operational Requirements'][Math.floor(Math.random() * 3)],
                reassignedTrains: reassignedTrains,
                newMotorman: 'Relief Motorman',
                createdAt: new Date().toISOString(),
                createdBy: 'JFO Supervisor'
            }] : [],
            effectiveAssignment: {
                motormanName: motorman,
                assignedTrains: hasReassignments && !isWaiting ? 
                    trains.filter(t => !reassignedTrains.includes(t.trainNumber)).map(t => t.trainNumber) :
                    trains.map(t => t.trainNumber),
                reassignmentType: hasReassignments && !isWaiting ? 'partial_transfer' : 'original'
            }
        });
    }

    return sampleData.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

function getStatusDisplay(entry) {
    if (entry.status === 'waiting') {
        return '<span style="color: #f39c12; font-weight: 500;">⏳ Waiting Assignment</span>';
    }

    if (!entry.hasReassignments) {
        return '<span style="color: #27ae60; font-weight: 500;">✅ Original Assignment</span>';
    }

    const reassignmentType = entry.reassignments[0]?.type || 'unknown';
    switch (reassignmentType) {
        case 'full_detail':
            return '<span style="color: #e74c3c; font-weight: 500;">🔄 Full Transfer</span>';
        case 'partial_detail':
            return '<span style="color: #3498db; font-weight: 500;">🔄 Partial Transfer</span>';
        case 'specific_trains':
            return '<span style="color: #9b59b6; font-weight: 500;">🔄 Train Reassignment</span>';
        default:
            return '<span style="color: #3498db; font-weight: 500;">🔄 Reassigned</span>';
    }
}

function displayAppearanceBook(data) {
    const tbody = document.getElementById('appearanceBookTableBody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 1.2em; margin-bottom: 10px;">📅</div>
                    <div>No appearance book data found for ${currentDate || 'selected date'}</div>
                    <div style="font-size: 0.9em; color: #999; margin-top: 5px;">
                        Check if duty roster data exists for this date
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.id = `row-${index}`;
        row.style.animationDelay = `${index * 0.05}s`;

        const statusIcon = entry.status === 'waiting' ? '⏳' : 
                         entry.hasReassignments ? '🔄' : '✅';
        const statusClass = entry.status === 'waiting' ? 'waiting-detail' : 
                          entry.hasReassignments ? 'reassigned-detail' : 'normal-detail';

        row.innerHTML = `
            <td>
                <button class="expand-btn" onclick="toggleTrainDetails(${index})" id="expand-btn-${index}">
                    ➕
                </button>
                <span style="font-weight: 500; color: #2c3e50;">${entry.signOnTime}</span>
            </td>
            <td>
                <div style="font-weight: 600; color: #34495e;">${entry.detailNumber}</div>
                <div style="font-size: 0.8em; color: #666;">
                    ${entry.trains.length} train${entry.trains.length !== 1 ? 's' : ''}
                    ${entry.hasReassignments ? ' • Modified' : ''}
                </div>
            </td>
            <td>
                <span class="motorman-name ${statusClass}" style="font-weight: 500;">
                    ${statusIcon} ${entry.motormanName}
                </span>
                <div style="font-size: 0.8em; color: #666;">${entry.office}</div>
            </td>
            <td>
                ${getStatusDisplay(entry)}
            </td>
            <td>
                <div style="font-size: 0.9em; color: #666;">
                    ${entry.effectiveAssignment.assignedTrains.length} of ${entry.totalTrains} trains
                </div>
                <div style="font-size: 0.8em; color: #999;">
                    Active assignments
                </div>
            </td>
            <td>
                <div style="font-size: 0.9em;">
                    ${entry.hasReassignments ? 
                        `<span style="color: #e67e22;">📋 ${entry.reassignments.length} change${entry.reassignments.length !== 1 ? 's' : ''}</span>` : 
                        '<span style="color: #95a5a6;">No changes</span>'
                    }
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="console.log('Button clicked!'); showReassignmentModal('${entry.detailId}', ${index})" 
                            style="padding: 6px 12px; font-size: 0.8em; background: #3498db;">
                        🔄 Reassign
                    </button>
                    ${entry.hasReassignments ? `
                        <button class="btn-primary" onclick="showReassignmentHistory('${entry.detailId}')" 
                                style="padding: 6px 12px; font-size: 0.8em; background: #17a2b8;">
                            👁️ History
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Store data globally for other functions
    window.currentAppearanceData = data;
}
// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 JFO Console initializing...');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('jfoDate');
    if (dateInput) {
        dateInput.value = today;
        updateCurrentDateDisplay();
    }
    
    // Initialize search functionality
    setupSearchAndFilters();
    
    // Check if integrated with main app
    if (window.app) {
        // Initialize with MySQL backend
        initializeWithBackend();
        console.log('✅ JFO Console integrated with main app (MySQL)');
    } else {
        console.log('⚠️ Running in standalone demo mode');
    }
    
    console.log('✅ JFO Console ready!');
});

// ===== BACKEND INTEGRATION =====
async function initializeWithBackend(date, office = '', search = '') {
    try {
      const url = `/api/roster?date=${encodeURIComponent(date)}&office=${encodeURIComponent(office)}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
  
      const result = await response.json();
      const data = result.data || [];
  
      renderBookTable(data); // Replace demo data with real data
  
    } catch (err) {
      console.error("Error fetching roster:", err);
      alert("❌ Failed to load duty roster from backend. Check console for details.");
    }
  }
  
function renderBookTable(data) {
    const tbody = document.getElementById("appearanceBookTableBody");
    tbody.innerHTML = "";
  
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">📅</div>
            <div>No records found for the selected date.</div>
          </td>
        </tr>
      `;
      return;
    }
    console.log("📋 Rendering", data.length, "records into appearance book");

    data.forEach(record => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>–</td> <!-- Sign On placeholder -->
        <td>${record.detail_number}</td>
        <td>${record.motorman_name}</td>
        <td><span class="status-badge pending">Pending</span></td>
        <td>–</td> <!-- Trains placeholder -->
        <td>–</td> <!-- Changes placeholder -->
        <td>
          <button class="btn-action" onclick="handleReassign('${record.id}')">🔁 Reassign</button>
        </td>
      `;
  
      tbody.appendChild(row);
    });
  }
  
  

// ===== TRAIN DETAILS EXPANSION =====
function toggleTrainDetails(index) {
    const button = document.getElementById(`expand-btn-${index}`);
    const isExpanded = expandedRows.has(index);
    
    if (isExpanded) {
        button.textContent = '➕';
        removeExpandedRow(index);
        expandedRows.delete(index);
    } else {
        button.textContent = '➖';
        addExpandedRow(index);
        expandedRows.add(index);
    }
}

function addExpandedRow(index) {
    const data = window.currentAppearanceData[index];
    const tbody = document.getElementById('appearanceBookTableBody');
    const targetRow = document.getElementById(`row-${index}`);
    
    const expandedRow = document.createElement('tr');
    expandedRow.id = `expanded-${index}`;
    expandedRow.className = 'expanded-row';

    const trainsHtml = data.trains.map((train) => {
        const isAssigned = data.effectiveAssignment.assignedTrains.includes(train.trainNumber);
        const cardClass = isAssigned ? 'assigned' : 'reassigned';
        const statusText = isAssigned ? '✅ Assigned' : '❌ Reassigned';
        const statusClass = isAssigned ? 'assigned' : 'reassigned';
        
        return `
            <div class="train-card ${cardClass}">
                <div class="train-card-header">
                    <div class="train-card-number">
                        🚂 ${train.trainNumber}
                    </div>
                    <div class="train-card-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="train-card-details">
                    <div><strong>Route:</strong> ${train.startStation} → ${train.endStation}</div>
                    <div><strong>Time:</strong> ${train.startTime} - ${train.endTime}</div>
                </div>
                
                <div class="train-card-actions">
                    <button class="btn-primary btn-sm" onclick="reassignSingleTrain('${data.detailId}', '${train.trainNumber}', ${index})"
                            style="background: #8e44ad;">
                        🔄 Reassign This Train
                    </button>
                </div>
            </div>
        `;
    }).join('');

    expandedRow.innerHTML = `
        <td colspan="7" class="expanded-content">
            <h5>🚂 Trains for Detail ${data.detailNumber} - ${data.motormanName}</h5>
            
            <div class="train-cards-grid">
                ${trainsHtml}
            </div>
            
            ${data.hasReassignments ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <strong>Recent Changes:</strong><br>
                    ${data.reassignments.map(r => `
                        • ${r.type.replace('_', ' ').toUpperCase()}: ${r.reason} 
                        ${r.reassignedTrains ? `(${r.reassignedTrains.length} trains)` : ''}
                    `).join('<br>')}
                </div>
            ` : ''}
        </td>
    `;

    targetRow.parentNode.insertBefore(expandedRow, targetRow.nextSibling);
}

function removeExpandedRow(index) {
    const expandedRow = document.getElementById(`expanded-${index}`);
    if (expandedRow) {
        expandedRow.remove();
    }
}

function setupModalEventListeners(modal) {
    // 1. Reassignment type change handler
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        reassignTypeSelect.addEventListener('change', () => {
            handleReassignmentTypeChange(modal);
        });
    }

    // 2. Form submission handler
    const form = modal.querySelector('#reassignmentForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            processReassignment(event, modal);
        });
    }

    // 3. Close button handler
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeReassignmentModal();
        });
    }

    // 4. Escape key closes modal
    function handleEsc(event) {
        if (event.key === 'Escape') {
            closeReassignmentModal();
            document.removeEventListener('keydown', handleEsc);
        }
    }
    document.addEventListener('keydown', handleEsc);

    // 5. Clicking outside modal-content closes modal
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeReassignmentModal();
        }
    });

    // 6. Ensure modal is visible and centered
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '9999';

    // 7. Auto-focus first field
    const firstInput = modal.querySelector('#reassignType');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
            console.log('✅ Focus set on first input from modal event setup');
        }, 150);
    }
}



function handleReassignmentTypeChange(modal = null) {
    if (!modal) {
        modal = document.getElementById('activeReassignmentModal');
    }
    
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    
    const reassignTypeSelect = modal.querySelector('#reassignType');
    const trainSelectionSection = modal.querySelector('#trainSelectionSection');
    const trainCheckboxContainer = modal.querySelector('#trainCheckboxContainer');
    
    if (!reassignTypeSelect || !trainSelectionSection || !trainCheckboxContainer) {
        console.error('Modal elements not found');
        return;
    }
    
    const reassignType = reassignTypeSelect.value;
    
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        // Show train selection
        trainSelectionSection.style.display = 'block';
        
        // Populate train checkboxes
        if (currentReassignmentData && currentReassignmentData.entry) {
            populateTrainSelection(trainCheckboxContainer, currentReassignmentData.entry.trains, reassignType);
        }
    } else {
        // Hide train selection
        trainSelectionSection.style.display = 'none';
        trainCheckboxContainer.innerHTML = '';
    }
}

function populateTrainSelection(container, trains, reassignType) {
    const isPartialDetail = reassignType === 'partial_detail';
    const inputType = isPartialDetail ? 'checkbox' : 'radio';
    const inputName = isPartialDetail ? 'selectedTrains' : 'selectedTrain';
    
    container.innerHTML = '';
    
    trains.forEach((train, index) => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'train-checkbox-item';
        checkboxItem.onclick = function() {
            const checkbox = this.querySelector('input');
            if (inputType === 'radio') {
                // For radio buttons, uncheck all others first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    r.closest('.train-checkbox-item').classList.remove('selected');
                });
            }
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        };
        
        checkboxItem.innerHTML = `
            <div class="train-info">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" onclick="event.stopPropagation();">
                <label for="train_${index}" class="train-number">🚂 ${train.trainNumber}</label>
            </div>
            <div class="train-route">${train.startStation} → ${train.endStation}</div>
            <div class="train-timing">⏰ ${train.startTime} - ${train.endTime}</div>
        `;
        
        container.appendChild(checkboxItem);
    });
    
    // Add instruction text
    const instructionText = document.createElement('div');
    instructionText.style.marginTop = '15px';
    instructionText.style.fontSize = '0.9em';
    instructionText.style.color = '#666';
    instructionText.innerHTML = isPartialDetail ? 
        '💡 Select multiple trains to transfer to the new motorman. Remaining trains stay with current motorman.' :
        '💡 Select one specific train to reassign to the new motorman.';
    
    container.appendChild(instructionText);
}

async function processReassignment(event, modal) {
    event.preventDefault();
    
    console.log('🔄 Processing reassignment...');
    
    if (!window.currentReassignmentData) {
        showToast('❌ No reassignment data found', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const reassignType = formData.get('reassignType');
    const newMotorman = formData.get('newMotorman');
    const newOffice = formData.get('newOffice');
    const reason = formData.get('reassignReason');
    const notes = formData.get('reassignNotes');
    
    // Validation
    if (!reassignType || !newMotorman || !reason) {
        showToast('⚠️ Please fill in all required fields', 'warning');
        return;
    }
    
    // Get selected trains for partial/specific reassignments
    let selectedTrains = [];
    if (reassignType === 'partial_detail') {
        const checkboxes = modal.querySelectorAll('input[name="selectedTrains"]:checked');
        selectedTrains = Array.from(checkboxes).map(cb => cb.value);
        if (selectedTrains.length === 0) {
            showToast('⚠️ Please select at least one train', 'warning');
            return;
        }
    } else if (reassignType === 'specific_trains') {
        const radio = modal.querySelector('input[name="selectedTrain"]:checked');
        if (!radio) {
            showToast('⚠️ Please select a train', 'warning');
            return;
        }
        selectedTrains = [radio.value];
    }
    
    const reassignmentData = {
        detailId: window.currentReassignmentData.entry.detailId,
        detailNumber: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        originalOffice: window.currentReassignmentData.entry.office,
        newMotorman: newMotorman.trim(),
        newOffice: newOffice,
        reassignmentType: reassignType,
        selectedTrains: selectedTrains,
        reason: reason,
        notes: notes.trim(),
        date: currentDate,
        timestamp: new Date().toISOString(),
        createdBy: 'JFO Supervisor'
    };
    
    console.log('📋 Reassignment data:', reassignmentData);
    
    // For now, just show success message
    showToast(`✅ Reassignment recorded: ${reassignmentData.detailNumber} → ${reassignmentData.newMotorman}`, 'success');
    
    // Close modal
    closeReassignmentModal();
    
    // TODO: Send to backend API
    // await sendReassignmentToBackend(reassignmentData);
}

async function processReassignmentWithBackend(reassignmentData) {
    const response = await fetch('/api/jfo/reassignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reassignmentData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Backend processing failed');
    }
    
    return await response.json();
}

async function processReassignmentDemo(reassignmentData) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update demo data
    const entryIndex = currentReassignmentData.index;
    const entry = window.currentAppearanceData[entryIndex];
    
    if (entry) {
        // Add reassignment record
        entry.reassignments = entry.reassignments || [];
        entry.reassignments.push({
            id: `reassign_${Date.now()}`,
            type: reassignmentData.reassignmentType,
            reason: reassignmentData.reason,
            notes: reassignmentData.notes,
            originalMotorman: reassignmentData.originalMotorman,
            newMotorman: reassignmentData.newMotorman,
            selectedTrains: reassignmentData.selectedTrains,
            createdAt: reassignmentData.timestamp,
            createdBy: reassignmentData.createdBy
        });
        
        // Update status
        entry.hasReassignments = true;
        
        // Update effective assignment based on type
        if (reassignmentData.reassignmentType === 'full_detail') {
            entry.motormanName = reassignmentData.newMotorman;
            entry.office = reassignmentData.newOffice;
        } else if (reassignmentData.reassignmentType === 'partial_detail' || 
                   reassignmentData.reassignmentType === 'specific_trains') {
            // Remove selected trains from effective assignment
            entry.effectiveAssignment.assignedTrains = entry.effectiveAssignment.assignedTrains
                .filter(trainNum => !reassignmentData.selectedTrains.includes(trainNum));
        }
    }
    
    console.log('Demo reassignment processed:', reassignmentData);
}

function reassignSingleTrain(detailId, trainNumber, index) {
    const entry = window.currentAppearanceData.find(e => e.detailId === detailId);
    if (!entry) {
        showToast('❌ Detail not found', 'error');
        return;
    }

    currentReassignmentData = { entry, index };
    
    // Clone the modal template
    const template = document.getElementById('reassignmentModalTemplate');
    const modalClone = template.cloneNode(true);
    modalClone.id = 'activeReassignmentModal';
    modalClone.style.display = 'block';
    
    // Update modal content for single train
    const modalTitle = modalClone.querySelector('#modalTitle');
    modalTitle.textContent = `🔄 Reassign Single Train: ${trainNumber}`;
    
    // Set reassignment type to specific trains and pre-select the train
    const reassignTypeSelect = modalClone.querySelector('#reassignType');
    reassignTypeSelect.value = 'specific_trains';
    
    // Populate current assignment info
    const assignmentInfo = modalClone.querySelector('#currentAssignmentInfo');
    assignmentInfo.innerHTML = `
        <h4>Single Train Reassignment</h4>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Detail:</div>
                <div class="info-value">${entry.detailNumber} (${entry.detailId})</div>
            </div>
            <div class="info-item">
                <div class="info-label">Current Motorman:</div>
                <div class="info-value">${entry.motormanName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Train to Reassign:</div>
                <div class="info-value" style="background: #fff3cd; padding: 8px; border-radius: 4px; font-weight: 600;">🚂 ${trainNumber}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Office:</div>
                <div class="info-value">${entry.office}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date:</div>
                <div class="info-value">${currentDate}</div>
            </div>
        </div>
    `;
    
    // Add event listeners to the cloned modal
    setupModalEventListeners(modalClone);
    
    // Trigger the type change to show train selection
    handleReassignmentTypeChange(modalClone);
    
    // Pre-select the specific train
    setTimeout(() => {
        const targetRadio = modalClone.querySelector(`input[value="${trainNumber}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
            targetRadio.closest('.train-checkbox-item').classList.add('selected');
        }
    }, 100);
    
    // Add to document
    document.body.appendChild(modalClone);
    
    // Set focus on new motorman input
    setTimeout(() => {
        const newMotormanInput = modalClone.querySelector('#newMotorman');
        if (newMotormanInput) newMotormanInput.focus();
    }, 200);
}

function closeReassignmentModal() {
    const modal = document.getElementById('activeReassignmentModal');
    if (modal) {
        modal.remove();
    }
    currentReassignmentData = null;
}

async function testRosterEndpoint(date) {
    console.log('🔍 Testing roster endpoint...');
    
    try {
        const url = `/api/roster?date=${encodeURIComponent(date)}`;
        console.log('🔍 Testing URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        console.log('📡 Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response body:', errorText);
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Roster API response:', result);
        console.log('📊 Records found:', result.data?.length || 0);
        return result;
        
    } catch (error) {
        console.error('❌ Roster endpoint test failed:', error);
        throw error;
    }
}

async function loadAppearanceBookFromBackend(date) {
    try {
        console.log(`🔄 Loading appearance book data for ${date}...`);
        
        const response = await fetch(`/api/roster?date=${encodeURIComponent(date)}`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const result = await response.json();
        const allRosterData = result.data || [];
        
        // Use first 10 for testing
        const rosterData = allRosterData//.slice(0, 10);
        
        console.log(`✅ Fetched ${allRosterData.length} total, using first ${rosterData.length} for testing`);
        if (rosterData.length === 0) {
            displayAppearanceBookDebug([]);
            updateSummaryCards({ total: 0, waiting: 0, reassigned: 0, totalReassignments: 0 });
            showToast('ℹ️ No duty roster data found', 'info');
            return;
        }

        console.log('🔄 Fetching REAL trains for each detail...');
        
        // This will fetch real trains for each detail
        const appearanceData = await transformRosterToRealTrains(rosterData, date);
        
        console.log('✅ Real train data transformation completed');
        
        displayAppearanceBookDebug(appearanceData);
        
        const summaryStats = calculateSummaryStats(appearanceData);
        updateSummaryCards(summaryStats);
        
        showToast(`✅ Loaded ${appearanceData.length} details with REAL trains`, 'success');
        
    } catch (error) {
        console.error('❌ Backend loading failed:', error);
        throw error;
    }
}

function transformRosterDataSimple(rosterData, date) {
    console.log('🔄 Starting simple roster transformation...');
    console.log('📥 Input data length:', rosterData.length);
    
    // Group roster entries by detail number
    const detailGroups = {};
    
    rosterData.forEach((record, index) => {
        console.log(`Processing record ${index + 1}:`, record.detail_number, record.motorman_name);
        
        const detailNumber = record.detail_number;
        if (!detailGroups[detailNumber]) {
            detailGroups[detailNumber] = {
                detailNumber,
                motormanName: record.motorman_name,
                office: record.office,
                records: []
            };
        }
        detailGroups[detailNumber].records.push(record);
    });

    console.log('📊 Grouped into', Object.keys(detailGroups).length, 'detail groups');

    // Convert to appearance book format
    const appearanceEntries = [];
    
    Object.values(detailGroups).forEach((group, index) => {
        console.log(`Creating appearance entry for detail ${group.detailNumber}`);
        
        // Create simple train data
        const trains = createSimpleTrains(group.detailNumber, index);
        const isWaiting = group.motormanName.toLowerCase().includes('waiting');
        
        const entry = {
            detailId: `${group.office}-${group.detailNumber}`,
            detailNumber: group.detailNumber,
            motormanName: group.motormanName,
            office: group.office,
            signOnTime: `0${6 + (index % 6)}:00`.slice(-5), // 06:00 to 11:00
            signOffTime: `${14 + (index % 4)}:00`, // 14:00 to 17:00
            trains: trains,
            totalTrains: trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: false,
            reassignments: [],
            effectiveAssignment: {
                motormanName: group.motormanName,
                assignedTrains: trains.map(t => t.trainNumber),
                reassignmentType: 'original'
            }
        };
        
        console.log(`✅ Created entry for ${entry.detailNumber}: ${entry.motormanName}`);
        appearanceEntries.push(entry);
    });

    console.log(`✅ Created ${appearanceEntries.length} appearance entries`);
    return appearanceEntries.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

function createSimpleTrains(detailNumber, index) {
    const trainPrefixes = ['A', 'H', 'BL', 'DL'];
    const trains = [];
    const numTrains = 1 + (index % 2); // 1 or 2 trains
    
    for (let i = 0; i < numTrains; i++) {
        const prefix = trainPrefixes[index % trainPrefixes.length];
        const trainNum = (parseInt(detailNumber) + i * 5).toString();
        const startHour = 6 + (i * 3);
        const endHour = startHour + 2;
        
        trains.push({
            trainNumber: `${prefix} ${trainNum}`,
            startTime: `${String(startHour).padStart(2, '0')}:00`,
            endTime: `${String(endHour).padStart(2, '0')}:00`,
            startStation: 'CSMT',
            endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][i % 4],
            id: `train_${detailNumber}_${i}`
        });
    }
    
    console.log(`Generated ${trains.length} simple trains for detail ${detailNumber}`);
    return trains;
}

async function loadAppearanceBook() {
    const dateInput = document.getElementById("jfoDate");
    const selectedDate = dateInput ? dateInput.value : null;
  
    if (!selectedDate) {
        showToast('⚠️ Please select a date', 'warning');
        return;
    }

    currentDate = selectedDate;
    updateCurrentDateDisplay();
    
    console.log('🔄 Starting loadAppearanceBook...');
    console.log('📅 Selected date:', selectedDate);
    showLoading();

    try {
        // First test the roster endpoint
        console.log('🔍 Step 1: Testing roster endpoint...');
        await testRosterEndpoint(selectedDate);
        console.log('✅ Roster endpoint test passed');
        
        // Add a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            console.log('⚠️ Loading timeout reached, hiding loading overlay');
            hideLoading();
            showToast('⚠️ Loading timeout - please try again', 'warning');
        }, 15000); // 15 second timeout

        // Check if integrated with main app
        if (window.app) {
            console.log('🔄 Step 2: Loading from backend...');
            await loadAppearanceBookFromBackend(selectedDate);
        } else {
            console.log('🔄 Step 2: Backend not detected, loading demo data...');
            await loadDemoData();
        }
        
        // Clear the timeout if we reach here
        clearTimeout(loadingTimeout);
        console.log('✅ Loading completed successfully');
        
    } catch (error) {
        console.error('❌ Error in loadAppearanceBook:', error);
        console.log('🔄 Falling back to demo data due to error...');
        
        try {
            await loadDemoData();
            showToast(`⚠️ Using demo data - Backend error: ${error.message}`, 'warning');
        } catch (demoError) {
            console.error('❌ Even demo data failed:', demoError);
            showToast('❌ Failed to load any data', 'error');
        }
    } finally {
        console.log('🔄 Hiding loading overlay...');
        hideLoading();
        console.log('✅ loadAppearanceBook completed');
    }
}

async function loadDemoData() {
    console.log('📋 Loading demo appearance book data...');
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoData = generateSimpleDemoData();
    displayAppearanceBookDebug(demoData);
    updateDemoSummaryCards(demoData);
    showToast('✅ Demo appearance book loaded', 'success');
}

// 5. Generate simple demo data
function generateSimpleDemoData() {
    const offices = ['CSMT', 'KYN', 'PNVL'];
    const motormen = [
        'Rajesh Kumar (4523)', 'Suresh Patil (3456)', 'Amit Sharma (2789)', 
        'Waiting', 'Ravi Singh (5678)', 'Deepak Yadav (4321)', 
        'Sanjay Gupta (8765)', 'Manoj Tiwari (9876)',
        'Ashok Verma (1234)', 'Vinod Sharma (5432)'
    ];
    
    const sampleData = [];
    
    for (let i = 1; i <= 10; i++) { // Just 10 for demo
        const detailNumber = (200 + i).toString();
        const motorman = motormen[i % motormen.length];
        const office = offices[i % offices.length];
        const signOnTime = `0${6 + (i % 6)}:00`.slice(-5); // 06:00 to 11:00
        const isWaiting = motorman === 'Waiting';
        
        // Generate 1-2 trains per detail
        const trains = [];
        const trainCount = 1 + (i % 2); // 1 or 2 trains
        
        for (let j = 0; j < trainCount; j++) {
            const trainPrefix = ['A', 'H', 'BL', 'DL'][j % 4];
            const trainNum = (parseInt(detailNumber) + j * 10).toString();
            const startHour = 6 + (j * 3);
            const endHour = startHour + 2;
            
            trains.push({
                trainNumber: `${trainPrefix} ${trainNum}`,
                startTime: `${String(startHour).padStart(2, '0')}:00`,
                endTime: `${String(endHour).padStart(2, '0')}:00`,
                startStation: 'CSMT',
                endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][j % 4],
                id: `demo_train_${i}_${j}`
            });
        }

        sampleData.push({
            detailId: `DEMO-${detailNumber}`,
            detailNumber: detailNumber,
            motormanName: motorman,
            office: office,
            signOnTime: signOnTime,
            signOffTime: `${14 + (i % 4)}:00`, // 14:00 to 17:00
            trains: trains,
            totalTrains: trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: false,
            reassignments: [],
            effectiveAssignment: {
                motormanName: motorman,
                assignedTrains: trains.map(t => t.trainNumber),
                reassignmentType: 'original'
            }
        });
    }

    console.log(`✅ Generated ${sampleData.length} demo records`);
    return sampleData.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

// 6. Function to manually test endpoints (call from browser console)
function manualEndpointTest() {
    console.log('🔧 Manual endpoint testing...');
    checkAvailableEndpoints().then(results => {
        console.log('🔧 Test completed. Results:', results);
    });
}

// 2. Function to check all available endpoints
async function checkAvailableEndpoints() {
    console.log('🔍 Checking available endpoints...');
    
    const endpointsToTest = [
        '/api/health',
        '/api/test', 
        '/api/roster?date=2025-06-02',
        '/api/db-test',
        '/api/dashboard/stats'
    ];
    
    const results = {};
    
    for (const endpoint of endpointsToTest) {
        try {
            console.log(`Testing ${endpoint}...`);
            const response = await fetch(endpoint);
            const status = response.status;
            const isOk = response.ok;
            
            results[endpoint] = { status, isOk };
            console.log(`${endpoint}: ${status} ${isOk ? '✅' : '❌'}`);
            
            if (isOk && endpoint.includes('/api/roster')) {
                const data = await response.json();
                console.log(`📊 Roster data preview:`, data);
            }
            
        } catch (error) {
            results[endpoint] = { error: error.message };
            console.log(`${endpoint}: Failed ❌ - ${error.message}`);
        }
    }
    
    console.log('📋 Endpoint test results:', results);
    return results;
}

async function transformRosterToAppearanceBookWithRealTrains(rosterData, date) {
    console.log('🔄 Starting roster transformation with real train data...');
    console.log('📥 Input data length:', rosterData.length);
    
    // Group roster entries by detail number
    const detailGroups = {};
    
    rosterData.forEach((record, index) => {
        console.log(`Processing record ${index + 1}:`, record.detail_number, record.motorman_name);
        
        const detailNumber = record.detail_number;
        if (!detailGroups[detailNumber]) {
            detailGroups[detailNumber] = {
                detailNumber,
                motormanName: record.motorman_name,
                office: record.office,
                records: []
            };
        }
        detailGroups[detailNumber].records.push(record);
    });

    console.log('📊 Grouped into', Object.keys(detailGroups).length, 'detail groups');

    // Convert to appearance book format with real train data
    const appearanceEntries = [];
    
    for (const [detailNumber, group] of Object.entries(detailGroups)) {
        console.log(`Creating appearance entry for detail ${group.detailNumber}`);
        
        try {
            // Try to fetch real train data for this detail
            const trains = await fetchRealTrainsForDetail(group.detailNumber, group.office);
            const isWaiting = group.motormanName.toLowerCase().includes('waiting');
            
            // Calculate sign on/off times based on actual trains
            let signOnTime = '06:00';
            let signOffTime = '14:00';
            
            if (trains.length > 0) {
                // Sign on 15 minutes before first train
                const firstTrainTime = trains[0].startTime;
                signOnTime = subtractMinutes(firstTrainTime, 15);
                
                // Sign off 15 minutes after last train
                const lastTrainTime = trains[trains.length - 1].endTime;
                signOffTime = addMinutes(lastTrainTime, 15);
            }
            
            const entry = {
                detailId: `${group.office}-${group.detailNumber}`,
                detailNumber: group.detailNumber,
                motormanName: group.motormanName,
                office: group.office,
                signOnTime: signOnTime,
                signOffTime: signOffTime,
                trains: trains,
                totalTrains: trains.length,
                status: isWaiting ? 'waiting' : 'assigned',
                hasReassignments: false,
                reassignments: [],
                effectiveAssignment: {
                    motormanName: group.motormanName,
                    assignedTrains: trains.map(t => t.trainNumber),
                    reassignmentType: 'original'
                }
            };
            
            console.log(`✅ Created entry for ${entry.detailNumber}: ${entry.trains.length} real trains`);
            appearanceEntries.push(entry);
            
        } catch (error) {
            console.warn(`Could not fetch trains for detail ${group.detailNumber}:`, error.message);
            
            // Fallback to default trains if real data fetch fails
            const trains = generateFallbackTrains(group.detailNumber);
            const isWaiting = group.motormanName.toLowerCase().includes('waiting');
            
            const entry = {
                detailId: `${group.office}-${group.detailNumber}`,
                detailNumber: group.detailNumber,
                motormanName: group.motormanName,
                office: group.office,
                signOnTime: '06:00',
                signOffTime: '14:00',
                trains: trains,
                totalTrains: trains.length,
                status: isWaiting ? 'waiting' : 'assigned',
                hasReassignments: false,
                reassignments: [],
                effectiveAssignment: {
                    motormanName: group.motormanName,
                    assignedTrains: trains.map(t => t.trainNumber),
                    reassignmentType: 'original'
                }
            };
            
            appearanceEntries.push(entry);
        }
    }

    console.log(`✅ Created ${appearanceEntries.length} appearance entries with real train data`);
    return appearanceEntries.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

async function fetchRealTrainsAndDetails(detailNumber, office) {
    const paddedNumber = detailNumber.toString().padStart(3, '0');
    
    const possibleDetailIds = [
        `ML89A-${paddedNumber}`,
        `HB87-${paddedNumber}`,
        `ML89A-${detailNumber}`,
        `HB87-${detailNumber}`,
    ];
    
    console.log(`🔍 Looking for trains AND details for roster detail ${detailNumber}`);
    
    let foundTrains = [];
    let foundDetails = null;
    
    for (const detailId of possibleDetailIds) {
        try {
            // Fetch trains
            const trainsResponse = await fetch(`/api/trains/by-detail/${encodeURIComponent(detailId)}`);
            if (trainsResponse.ok) {
                const trainsResult = await trainsResponse.json();
                if (trainsResult.data && trainsResult.data.length > 0) {
                    foundTrains = trainsResult.data;
                    console.log(`✅ Found ${foundTrains.length} trains for ${detailId}`);
                }
            }
            
            // Fetch details
            const detailsResponse = await fetch(`/api/details/${encodeURIComponent(detailId)}`);
            if (detailsResponse.ok) {
                const detailsResult = await detailsResponse.json();
                if (detailsResult.data && detailsResult.data.length > 0) {
                    foundDetails = detailsResult.data[0]; // Take first match
                    console.log(`✅ Found details for ${detailId}:`, {
                        sign_on_time: foundDetails.sign_on_time,
                        sign_off_time: foundDetails.sign_off_time
                    });
                }
            }
            
            // If we found both, we're done
            if (foundTrains.length > 0 && foundDetails) {
                console.log(`🎉 Found both trains and details for ${detailId}`);
                break;
            }
            
        } catch (error) {
            console.warn(`Failed to fetch data for ${detailId}:`, error.message);
        }
    }
    
    // Format trains
    const realTrains = foundTrains.map((train, index) => ({
        trainNumber: train.train_number,
        startTime: formatTime(train.start_time),
        endTime: formatTime(train.end_time),
        startStation: train.start_station,
        endStation: train.end_station,
        id: `real_${detailNumber}_${index}`,
        status: train.status,
        line: train.line
    }));
    
    // Return both trains and details info
    return {
        trains: realTrains.length > 0 ? realTrains : [{
            trainNumber: `No-trains-${detailNumber}`,
            startTime: '08:00',
            endTime: '10:00',
            startStation: 'CSMT',
            endStation: 'Unknown',
            id: `fallback_${detailNumber}`,
            status: 'not_found',
            line: 'unknown'
        }],
        details: foundDetails,
        signOnTime: foundDetails ? formatTime(foundDetails.sign_on_time) : '06:00',
        signOffTime: foundDetails ? formatTime(foundDetails.sign_off_time) : '14:00'
    };
}

async function transformRosterToRealTrains(rosterData, date) {
    console.log('🔄 Starting roster transformation with REAL trains and CORRECT sign-on times...');
    
    const detailGroups = {};
    
    rosterData.forEach(record => {
        const detailNumber = record.detail_number;
        if (!detailGroups[detailNumber]) {
            detailGroups[detailNumber] = {
                detailNumber,
                motormanName: record.motorman_name,
                office: record.office
            };
        }
    });

    console.log(`📊 Processing ${Object.keys(detailGroups).length} unique details...`);

    const appearanceEntries = [];
    
    for (const [detailNumber, group] of Object.entries(detailGroups)) {
        console.log(`🔄 Fetching trains and details for ${detailNumber}...`);
        
        // Fetch BOTH trains and details data
        const trainAndDetailData = await fetchRealTrainsAndDetails(group.detailNumber, group.office);
        
        const isWaiting = group.motormanName.toLowerCase().includes('waiting');
        
        const entry = {
            detailId: `${group.office}-${group.detailNumber}`,
            detailNumber: group.detailNumber,
            motormanName: group.motormanName,
            office: group.office,
            signOnTime: trainAndDetailData.signOnTime,   // REAL sign-on time from details table
            signOffTime: trainAndDetailData.signOffTime, // REAL sign-off time from details table
            trains: trainAndDetailData.trains,           // REAL trains from trains table
            totalTrains: trainAndDetailData.trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: false,
            reassignments: [],
            effectiveAssignment: {
                motormanName: group.motormanName,
                assignedTrains: trainAndDetailData.trains.map(t => t.trainNumber),
                reassignmentType: 'original'
            }
        };
        
        console.log(`✅ Detail ${detailNumber}: Sign-on ${entry.signOnTime} (from details table), ${entry.trains.length} trains`);
        appearanceEntries.push(entry);
    }

    console.log(`🎉 Completed with CORRECT sign-on times from details table!`);
    return appearanceEntries.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

function generateFallbackTrains(detailNumber) {
    console.log(`⚠️ Generating fallback trains for detail ${detailNumber}`);
    
    // Create 1-2 fallback trains with realistic times
    const numTrains = Math.random() > 0.5 ? 2 : 1;
    const trains = [];
    
    for (let i = 0; i < numTrains; i++) {
        const startHour = 8 + (i * 4); // 8:00, 12:00
        const endHour = startHour + 2;   // 10:00, 14:00
        
        trains.push({
            trainNumber: `FB-${detailNumber}-${i + 1}`, // FB = Fallback
            startTime: `${String(startHour).padStart(2, '0')}:00`,
            endTime: `${String(endHour).padStart(2, '0')}:00`,
            startStation: 'CSMT',
            endStation: i === 0 ? 'KYN' : 'PNVL',
            id: `fallback_${detailNumber}_${i + 1}`,
            status: 'fallback',
            line: 'unknown'
        });
    }
    
    return trains;
}
async function transformRosterToAppearanceBookSimplified(rosterData, date) {
    console.log('🔄 Starting SIMPLIFIED roster transformation...');
    console.log('📥 Input data length:', rosterData.length);
    
    // Group roster entries by detail number
    const detailGroups = {};
    
    rosterData.forEach((record, index) => {
        console.log(`Processing record ${index + 1}:`, record.detail_number, record.motorman_name);
        
        const detailNumber = record.detail_number;
        if (!detailGroups[detailNumber]) {
            detailGroups[detailNumber] = {
                detailNumber,
                motormanName: record.motorman_name,
                office: record.office,
                records: []
            };
        }
        detailGroups[detailNumber].records.push(record);
    });

    console.log('📊 Grouped into', Object.keys(detailGroups).length, 'detail groups');

    // Convert to appearance book format WITHOUT fetching trains (for now)
    const appearanceEntries = [];
    
    Object.values(detailGroups).forEach((group, index) => {
        console.log(`Creating simplified entry for detail ${group.detailNumber}`);
        
        // Use fallback trains for now
        const trains = generateFallbackTrains(group.detailNumber);
        const isWaiting = group.motormanName.toLowerCase().includes('waiting');
        
        const entry = {
            detailId: `${group.office}-${group.detailNumber}`,
            detailNumber: group.detailNumber,
            motormanName: group.motormanName,
            office: group.office,
            signOnTime: `0${6 + (index % 6)}:00`.slice(-5), // 06:00 to 11:00
            signOffTime: `${14 + (index % 4)}:00`, // 14:00 to 17:00
            trains: trains,
            totalTrains: trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: false,
            reassignments: [],
            effectiveAssignment: {
                motormanName: group.motormanName,
                assignedTrains: trains.map(t => t.trainNumber),
                reassignmentType: 'original'
            }
        };
        
        console.log(`✅ Created simplified entry for ${entry.detailNumber}`);
        appearanceEntries.push(entry);
    });

    console.log(`✅ Created ${appearanceEntries.length} simplified appearance entries`);
    return appearanceEntries.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

function formatTime(timeStr) {
    if (!timeStr) return '00:00';
    return timeStr.slice(0, 5); // Convert "16:31:00" to "16:31"
}

function subtractMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = Math.max(0, hours * 60 + mins - minutes);
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

function generateSimpleTrains(detailNumber) {
    const trainPrefixes = ['A', 'H', 'BL', 'DL'];
    const trains = [];
    
    // Generate 2-3 trains with logical departure times
    const numTrains = 2 + Math.floor(Math.random() * 2); // 2-3 trains
    const baseDetailNum = parseInt(detailNumber) || 1;
    
    for (let i = 0; i < numTrains; i++) {
        const prefix = trainPrefixes[baseDetailNum % trainPrefixes.length];
        const trainNum = (baseDetailNum + i * 10).toString();
        
        // Create departure times with 2-3 hour gaps
        const departureHour = 6 + (i * 2) + Math.floor(Math.random() * 2); // 6-12 range
        const departureMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const arrivalHour = departureHour + 1 + Math.floor(Math.random() * 2); // 1-2 hours later
        const arrivalMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        
        const startTime = `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;
        const endTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
        
        trains.push({
            trainNumber: `${prefix} ${trainNum}`,
            startTime: startTime,
            endTime: endTime,
            startStation: 'CSMT',
            endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][i % 4],
            id: `train_${detailNumber}_${i}`
        });
    }
    
    // Sort trains by departure time to ensure first train is actually first
    trains.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    console.log(`Generated ${trains.length} trains for detail ${detailNumber}, first departure: ${trains[0].startTime}`);
    return trains;
}

function generateSignOnTime(index) {
    const baseHour = 5 + (index % 8); // Spread between 5:00 and 12:00
    const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    return `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateSignOffTime(index) {
    const baseHour = 13 + (index % 6); // Spread between 13:00 and 18:00
    const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    return `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


async function fetchTrainsForDetail(detailNumber) {
    try {
        // Try to fetch train schedules from the trains table
        const response = await fetch(`/api/schedules/mainline?search=${detailNumber}`);
        if (response.ok) {
            const result = await response.json();
            const trains = result.data || [];
            
            if (trains.length > 0) {
                const signOnTime = trains[0].signOnTime || '06:00';
                const signOffTime = trains[trains.length - 1].signOffTime || '14:00';
                
                const formattedTrains = trains.map((train, index) => ({
                    trainNumber: train.trainNumber,
                    startTime: train.startTime,
                    endTime: train.endTime,
                    startStation: train.startStation,
                    endStation: train.endStation,
                    id: `train_${detailNumber}_${index}`
                }));
                
                return {
                    signOnTime,
                    signOffTime,
                    trains: formattedTrains
                };
            }
        }
    } catch (error) {
        console.warn(`Train fetch failed for detail ${detailNumber}:`, error.message);
    }
    
    // Return null if no trains found
    return null;
}

function generateDefaultTrains(detailNumber) {
    // Generate default trains when no specific train data is available
    const trainPrefixes = ['A', 'H', 'BL', 'DL'];
    const trains = [];
    const numTrains = Math.floor(Math.random() * 3) + 2; // 2-4 trains
    
    for (let i = 0; i < numTrains; i++) {
        const prefix = trainPrefixes[Math.floor(Math.random() * trainPrefixes.length)];
        const trainNum = (parseInt(detailNumber) * 2 + i + 1).toString();
        const startHour = 6 + (i * 2);
        const endHour = startHour + 1;
        
        trains.push({
            trainNumber: `${prefix} ${trainNum}`,
            startTime: `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
            endTime: `${String(endHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
            startStation: 'CSMT',
            endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][Math.floor(Math.random() * 4)],
            id: `train_${detailNumber}_${i}`
        });
    }
    
    return trains;
}

function calculateSummaryStats(appearanceData) {
    return {
        total: appearanceData.length,
        waiting: appearanceData.filter(e => e.status === 'waiting').length,
        reassigned: appearanceData.filter(e => e.hasReassignments).length,
        totalReassignments: appearanceData.reduce((sum, e) => sum + (e.reassignments?.length || 0), 0)
    };
}

async function loadDemoData() {
    console.log('📋 Loading demo appearance book data...');
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoData = generateDemoAppearanceData();
    displayAppearanceBook(demoData);
    updateDemoSummaryCards(demoData);
    showToast('✅ Demo appearance book loaded', 'success');
}

function generateDemoAppearanceData() {
    const offices = ['CSMT', 'KYN', 'PNVL'];
    const motormen = [
        'Rajesh Kumar (4523)', 'Suresh Patil (3456)', 'Amit Sharma (2789)', 
        'Waiting', 'Ravi Singh (5678)', 'Deepak Yadav (4321)', 'Waiting', 
        'Sanjay Gupta (8765)', 'Manoj Tiwari (9876)', 'Waiting',
        'Ashok Verma (1234)', 'Vinod Sharma (5432)', 'Pramod Kumar (6789)'
    ];
    
    const sampleData = [];
    
    for (let i = 1; i <= 15; i++) {
        const detailId = `ML89A-${200 + i}`;
        const motorman = motormen[Math.floor(Math.random() * motormen.length)];
        const office = offices[Math.floor(Math.random() * offices.length)];
        const signOnTime = `${String(5 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`;
        const hasReassignments = Math.random() > 0.7;
        const isWaiting = motorman === 'Waiting';
        
        const trains = [];
        const trainCount = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < trainCount; j++) {
            const trainPrefix = ['A', 'H', 'BL', 'DL'][Math.floor(Math.random() * 4)];
            const trainNum = Math.floor(Math.random() * 99) + 1;
            const startHour = 6 + (j * 2);
            const endHour = startHour + 1;
            
            trains.push({
                trainNumber: `${trainPrefix} ${trainNum}`,
                startTime: `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
                endTime: `${String(endHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
                startStation: 'CSMT',
                endStation: ['KYN', 'PNVL', 'TNA', 'ABH'][Math.floor(Math.random() * 4)],
                id: `train_${i}_${j}`
            });
        }

        // Simulate some reassignments
        let reassignedTrains = [];
        if (hasReassignments && !isWaiting) {
            const numReassigned = Math.floor(trains.length / 2);
            reassignedTrains = trains.slice(0, numReassigned).map(t => t.trainNumber);
        }

        sampleData.push({
            detailId: detailId,
            detailNumber: (200 + i).toString(),
            motormanName: motorman,
            office: office,
            signOnTime: signOnTime,
            signOffTime: `${String(14 + Math.floor(Math.random() * 4)).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
            trains: trains,
            totalTrains: trains.length,
            status: isWaiting ? 'waiting' : 'assigned',
            hasReassignments: hasReassignments && !isWaiting,
            reassignments: hasReassignments && !isWaiting ? [{
                id: `reassign_${i}`,
                type: 'partial_detail',
                reason: ['Medical Emergency', 'Personal Emergency', 'Operational Requirements'][Math.floor(Math.random() * 3)],
                reassignedTrains: reassignedTrains,
                newMotorman: 'Relief Motorman',
                createdAt: new Date().toISOString(),
                createdBy: 'JFO Supervisor'
            }] : [],
            effectiveAssignment: {
                motormanName: motorman,
                assignedTrains: hasReassignments && !isWaiting ? 
                    trains.filter(t => !reassignedTrains.includes(t.trainNumber)).map(t => t.trainNumber) :
                    trains.map(t => t.trainNumber),
                reassignmentType: hasReassignments && !isWaiting ? 'partial_transfer' : 'original'
            }
        });
    }

    return sampleData.sort((a, b) => a.signOnTime.localeCompare(b.signOnTime));
}

function displayAppearanceBookDebug(data) {
    console.log('🔄 displayAppearanceBook called with', data.length, 'entries');
    
    const tbody = document.getElementById('appearanceBookTableBody');
    if (!tbody) {
        console.error('❌ Table body element not found!');
        return;
    }
    
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 1.2em; margin-bottom: 10px;">📅</div>
                    <div>No appearance book data found for ${currentDate}</div>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.id = `row-${index}`;

        const statusIcon = entry.status === 'waiting' ? '⏳' : '✅';
        const statusClass = entry.status === 'waiting' ? 'waiting-detail' : 'normal-detail';

        // Get first train departure time
        const firstDeparture = entry.trains && entry.trains.length > 0 ? 
            entry.trains[0].startTime : 'N/A';
        const firstTrainNumber = entry.trains && entry.trains.length > 0 ? 
            entry.trains[0].trainNumber : 'No trains';

        row.innerHTML = `
            <td>
                <button class="expand-btn" onclick="toggleTrainDetails(${index})" id="expand-btn-${index}">➕</button>
                <span style="font-weight: 500; color: #2c3e50;">${entry.signOnTime}</span>
            </td>
            <td>
                <div style="font-weight: 600; color: #1976d2;">
                    🚂 ${firstDeparture}
                </div>
                <div style="font-size: 0.8em; color: #666;">
                    ${firstTrainNumber}
                </div>
            </td>
            <td>
                <div style="font-weight: 600; color: #34495e;">${entry.detailNumber}</div>
                <div style="font-size: 0.8em; color: #666;">${entry.trains.length} trains</div>
            </td>
            <td>
                <span class="motorman-name ${statusClass}" style="font-weight: 500;">
                    ${statusIcon} ${entry.motormanName}
                </span>
                <div style="font-size: 0.8em; color: #666;">${entry.office}</div>
            </td>
            <td>
                ${getStatusDisplay(entry)}
            </td>
            <td>
                <div style="font-size: 0.9em; color: #666;">${entry.trains.length} trains</div>
            </td>
            <td>
                <span style="color: #95a5a6;">No changes</span>
            </td>
            <td>
                <button class="btn-primary reassign-btn" 
                        data-detail-id="${entry.detailId}" 
                        data-index="${index}"
                        style="padding: 6px 12px; font-size: 0.8em; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Reassign
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Store data globally for other functions
    window.currentAppearanceData = data;
    
    // Add event listeners to all reassign buttons
    setupReassignmentButtons();
    
    console.log('✅ displayAppearanceBook completed with reassignment buttons');
}




// 2. Setup event listeners for reassignment buttons
function setupReassignmentButtons() {
    const reassignButtons = document.querySelectorAll('.reassign-btn');
    
    reassignButtons.forEach(button => {
        button.addEventListener('click', function() {
            const detailId = this.getAttribute('data-detail-id');
            const index = parseInt(this.getAttribute('data-index'));
            
            console.log(`🔄 Reassign button clicked for detail ${detailId}, index ${index}`);
            showReassignmentModal(detailId, index);
        });
    });
    
    console.log(`✅ Setup ${reassignButtons.length} reassignment button listeners`);
}

function getStatusDisplay(entry) {
    if (entry.status === 'waiting') {
        return '<span style="color: #f39c12; font-weight: 500;">⏳ Waiting Assignment</span>';
    }
    
    if (!entry.hasReassignments) {
        return '<span style="color: #27ae60; font-weight: 500;">✅ Original Assignment</span>';
    }
    
    return '<span style="color: #3498db; font-weight: 500;">🔄 Reassigned</span>';
}

// ===== TRAIN DETAILS EXPANSION =====
function toggleTrainDetails(index) {
    const button = document.getElementById(`expand-btn-${index}`);
    const isExpanded = expandedRows.has(index);
    
    if (isExpanded) {
        button.textContent = '➕';
        removeExpandedRow(index);
        expandedRows.delete(index);
    } else {
        button.textContent = '➖';
        addExpandedRow(index);
        expandedRows.add(index);
    }
}

function addExpandedRow(index) {
    const data = window.currentAppearanceData[index];
    const tbody = document.getElementById('appearanceBookTableBody');
    const targetRow = document.getElementById(`row-${index}`);
    
    const expandedRow = document.createElement('tr');
    expandedRow.id = `expanded-${index}`;
    expandedRow.className = 'expanded-row';

    const trainsHtml = data.trains.map((train) => {
        const isAssigned = data.effectiveAssignment.assignedTrains.includes(train.trainNumber);
        const cardClass = isAssigned ? 'assigned' : 'reassigned';
        const statusText = isAssigned ? '✅ Assigned' : '❌ Reassigned';
        const statusClass = isAssigned ? 'assigned' : 'reassigned';
        
        return `
            <div class="train-card ${cardClass}">
                <div class="train-card-header">
                    <div class="train-card-number">
                        🚂 ${train.trainNumber}
                    </div>
                    <div class="train-card-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="train-card-details">
                    <div><strong>Route:</strong> ${train.startStation} → ${train.endStation}</div>
                    <div><strong>Time:</strong> ${train.startTime} - ${train.endTime}</div>
                </div>
                
                <div class="train-card-actions">
                    <button class="btn-primary btn-sm" onclick="reassignSingleTrain('${data.detailId}', '${train.trainNumber}', ${index})"
                            style="background: #8e44ad;">
                        🔄 Reassign This Train
                    </button>
                </div>
            </div>
        `;
    }).join('');

    expandedRow.innerHTML = `
        <td colspan="7" class="expanded-content">
            <h5>🚂 Trains for Detail ${data.detailNumber} - ${data.motormanName}</h5>
            
            <div class="train-cards-grid">
                ${trainsHtml}
            </div>
            
            ${data.hasReassignments ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <strong>Recent Changes:</strong><br>
                    ${data.reassignments.map(r => `
                        • ${r.type.replace('_', ' ').toUpperCase()}: ${r.reason} 
                        ${r.reassignedTrains ? `(${r.reassignedTrains.length} trains)` : ''}
                    `).join('<br>')}
                </div>
            ` : ''}
        </td>
    `;

    targetRow.parentNode.insertBefore(expandedRow, targetRow.nextSibling);
}

function removeExpandedRow(index) {
    const expandedRow = document.getElementById(`expanded-${index}`);
    if (expandedRow) {
        expandedRow.remove();
    }
}

// Create a simple modal if template is missing
function createSimpleReassignmentModal(entry) {
    console.log('🔧 Creating simple modal manually...');
    
    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
        console.log('🗑️ Removed existing modal');
    }
    
    // Create modal HTML with improved styling
    const modalHTML = `
        <div id="activeReassignmentModal" style="
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.7) !important;
            z-index: 99999 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            font-family: Arial, sans-serif !important;
        ">
            <div style="
                background: white !important;
                padding: 30px !important;
                border-radius: 12px !important;
                max-width: 700px !important;
                width: 90% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
                position: relative !important;
            ">
                <!-- Close Button -->
                <button onclick="closeReassignmentModal()" style="
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #999;
                    line-height: 1;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                ">&times;</button>
                
                <!-- Header -->
                <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #eee;">
                    <h2 style="margin: 0; color: #2c3e50; font-size: 24px;">
                        🔄 Reassign Detail ${entry.detailNumber}
                    </h2>
                </div>
                
                <!-- Current Assignment Info -->
                <div style="
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 25px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    border-left: 4px solid #3498db;
                ">
                    <h4 style="margin: 0 0 20px 0; color: #495057; font-size: 18px;">📋 Current Assignment Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Detail Number:</strong><br>
                            <span style="font-size: 16px; font-weight: 600; color: #2c3e50;">${entry.detailNumber}</span>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Current Motorman:</strong><br>
                            <span style="font-size: 16px; color: #2c3e50;">${entry.motormanName}</span>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Office:</strong><br>
                            <span style="font-size: 16px; color: #2c3e50;">${entry.office}</span>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Sign On Time:</strong><br>
                            <span style="font-size: 16px; color: #2c3e50;">${entry.signOnTime}</span>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Total Trains:</strong><br>
                            <span style="font-size: 16px; font-weight: 600; color: #e67e22;">${entry.trains.length}</span>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 6px;">
                            <strong style="color: #6c757d;">Date:</strong><br>
                            <span style="font-size: 16px; color: #2c3e50;">${currentDate}</span>
                        </div>
                    </div>
                    
                    <div>
                        <strong style="color: #495057;">🚂 Assigned Trains:</strong><br>
                        <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                            ${entry.trains.map(train => `
                                <span style="
                                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                                    color: white;
                                    padding: 8px 12px;
                                    border-radius: 20px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    margin-bottom: 5px;
                                    display: inline-block;
                                    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
                                ">
                                    ${train.trainNumber}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Reassignment Form -->
                <form id="reassignmentForm" onsubmit="processSimpleReassignment(event)">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 16px;">
                            🔄 Reassignment Type *
                        </label>
                        <select id="reassignType" required style="
                            width: 100%;
                            padding: 12px 15px;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 16px;
                            background: white;
                            transition: border-color 0.3s;
                        " onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#dee2e6'">
                            <option value="">Select Reassignment Type</option>
                            <option value="full_detail">🔄 Full Detail Transfer</option>
                            <option value="partial_detail">📋 Partial Detail Transfer</option>
                            <option value="specific_trains">🚂 Specific Trains Only</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 16px;">
                            👤 New Motorman *
                        </label>
                        <input type="text" id="newMotorman" required placeholder="Enter new motorman name and ID" style="
                            width: 100%;
                            padding: 12px 15px;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: border-color 0.3s;
                        " onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#dee2e6'">
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 16px;">
                            🏢 Office
                        </label>
                        <select id="newOffice" style="
                            width: 100%;
                            padding: 12px 15px;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 16px;
                            background: white;
                            transition: border-color 0.3s;
                        " onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#dee2e6'">
                            <option value="CSMT">CSMT</option>
                            <option value="KYN">KYN</option>
                            <option value="PNVL">PNVL</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 16px;">
                            ❓ Reason for Reassignment *
                        </label>
                        <select id="reassignReason" required style="
                            width: 100%;
                            padding: 12px 15px;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 16px;
                            background: white;
                            transition: border-color 0.3s;
                        " onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#dee2e6'">
                            <option value="">Select Reason</option>
                            <option value="Medical Emergency">🏥 Medical Emergency</option>
                            <option value="Personal Emergency">🚨 Personal Emergency</option>
                            <option value="Technical Training">📚 Technical Training</option>
                            <option value="Administrative Work">📋 Administrative Work</option>
                            <option value="Operational Requirements">⚙️ Operational Requirements</option>
                            <option value="Other">📝 Other</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 16px;">
                            📝 Additional Notes
                        </label>
                        <textarea id="reassignNotes" rows="4" placeholder="Optional additional details, approval reference, etc..." style="
                            width: 100%;
                            padding: 12px 15px;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 16px;
                            resize: vertical;
                            font-family: Arial, sans-serif;
                            transition: border-color 0.3s;
                        " onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#dee2e6'"></textarea>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" onclick="closeReassignmentModal()" style="
                            padding: 14px 28px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 500;
                            transition: background 0.3s;
                        " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
                            ❌ Cancel
                        </button>
                        <button type="submit" style="
                            padding: 14px 28px;
                            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 500;
                            transition: transform 0.2s;
                            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            🔄 Process Reassignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    console.log('✅ Simple modal created and added to DOM');
    
    // Focus on first input after a short delay
    setTimeout(() => {
        const firstInput = document.getElementById('reassignType');
        if (firstInput) {
            firstInput.focus();
            console.log('✅ Focus set on reassignType');
        }
    }, 200);
}

// Simple process reassignment function
function processSimpleReassignment(event) {
    event.preventDefault();
    
    console.log('🔄 Processing simple reassignment...');
    
    const formData = new FormData(event.target);
    const reassignmentData = {
        detailNumber: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        newMotorman: formData.get('newMotorman'),
        newOffice: formData.get('newOffice'),
        reassignmentType: formData.get('reassignType'),
        reason: formData.get('reassignReason'),
        notes: formData.get('reassignNotes'),
        timestamp: new Date().toISOString()
    };
    
    console.log('📋 Reassignment data:', reassignmentData);
    
    if (!reassignmentData.reassignmentType || !reassignmentData.newMotorman || !reassignmentData.reason) {
        alert('Please fill in all required fields');
        return;
    }
    
    showToast(`✅ Reassignment recorded: Detail ${reassignmentData.detailNumber} → ${reassignmentData.newMotorman}`, 'success');
    
    closeReassignmentModal();
}


// Make functions globally accessible
window.processSimpleReassignment = processSimpleReassignment;
window.showReassignmentModal = showReassignmentModal;
window.closeReassignmentModal = closeReassignmentModal;
window.handleActionChange = handleActionChange;
window.processEnhancedReassignment = processEnhancedReassignment;

window.onReassignmentModeChange = onReassignmentModeChange;
window.handleReassignmentTypeChange = handleReassignmentTypeChange;
window.updateTrainSelection = updateTrainSelection;
window.updateReassignmentPreview = updateReassignmentPreview;
window.selectReassignmentMode = selectReassignmentMode;
window.handleTargetDetailChange = handleTargetDetailChange;
window.updateModeSelection = updateModeSelection;
window.populateTrainSelection = populateTrainSelection;
window.updateTrainCardSelection = updateTrainCardSelection;
window.processEnhancedReassignment = processEnhancedReassignment;
window.processMotormanReassignment = processMotormanReassignment;
window.processDetailReassignment = processDetailReassignment;

window.updateAppearanceDataWithPartialReassignment = updateAppearanceDataWithPartialReassignment;
window.createPartialReassignmentEntry = createPartialReassignmentEntry;
window.updateAppearanceDataWithDetailReassignment = updateAppearanceDataWithDetailReassignment;
window.getPartialActionDetails = getPartialActionDetails;
window.createPartialReassignmentSuccessMessage = createPartialReassignmentSuccessMessage;
window.getActionDescription = getActionDescription;
window.showPartialReassignmentConfirmation = showPartialReassignmentConfirmation;
window.closeReassignmentConfirmation = closeReassignmentConfirmation;



function setupModalEventListeners(modal) {
    // Close button
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReassignmentModal);
    }
    
    // Reassignment type change
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        reassignTypeSelect.addEventListener('change', function() {
            handleReassignmentTypeChange(modal);
        });
    }
    
    // Form submission
    const form = modal.querySelector('#reassignmentForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            processReassignment(event, modal);
        });
    }
    
    // Cancel button
    const cancelBtn = modal.querySelector('button[onclick="closeReassignmentModal()"]');
    if (cancelBtn) {
        cancelBtn.onclick = closeReassignmentModal;
    }
}

function handleReassignmentTypeChange(modal = null) {
    if (!modal) {
        modal = document.getElementById('activeReassignmentModal');
    }
    
    const reassignType = modal.querySelector('#reassignType').value;
    const trainSelectionSection = modal.querySelector('#trainSelectionSection');
    const trainCheckboxContainer = modal.querySelector('#trainCheckboxContainer');
    
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        // Show train selection
        trainSelectionSection.style.display = 'block';
        
        // Populate train checkboxes
        if (currentReassignmentData && currentReassignmentData.entry) {
            populateTrainSelection(trainCheckboxContainer, currentReassignmentData.entry.trains, reassignType);
        }
    } else {
        // Hide train selection
        trainSelectionSection.style.display = 'none';
        trainCheckboxContainer.innerHTML = '';
    }
}

function populateTrainSelection(container, trains, reassignType) {
    const isPartialDetail = reassignType === 'partial_detail';
    const inputType = isPartialDetail ? 'checkbox' : 'radio';
    const inputName = isPartialDetail ? 'selectedTrains' : 'selectedTrain';
    
    container.innerHTML = '';
    
    trains.forEach((train, index) => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'train-checkbox-item';
        checkboxItem.onclick = function() {
            const checkbox = this.querySelector('input');
            if (inputType === 'radio') {
                // For radio buttons, uncheck all others first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    r.closest('.train-checkbox-item').classList.remove('selected');
                });
            }
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        };
        
        checkboxItem.innerHTML = `
            <div class="train-info">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" onclick="event.stopPropagation();">
                <label for="train_${index}" class="train-number">🚂 ${train.trainNumber}</label>
            </div>
            <div class="train-route">${train.startStation} → ${train.endStation}</div>
            <div class="train-timing">⏰ ${train.startTime} - ${train.endTime}</div>
        `;
        
        container.appendChild(checkboxItem);
    });
    
    // Add instruction text
    const instructionText = document.createElement('div');
    instructionText.style.marginTop = '15px';
    instructionText.style.fontSize = '0.9em';
    instructionText.style.color = '#666';
    instructionText.innerHTML = isPartialDetail ? 
        '💡 Select multiple trains to transfer to the new motorman. Remaining trains stay with current motorman.' :
        '💡 Select one specific train to reassign to the new motorman.';
    
    container.appendChild(instructionText);
}

async function processReassignment(event, modal = null) {
    event.preventDefault();
    
    if (!modal) {
        modal = document.getElementById('activeReassignmentModal');
    }
    
    if (!currentReassignmentData) {
        showToast('❌ No reassignment data found', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const reassignType = formData.get('reassignType');
    const newMotorman = formData.get('newMotorman');
    const newOffice = formData.get('newOffice');
    const reason = formData.get('reassignReason');
    const notes = formData.get('reassignNotes');
    
    // Validation
    if (!reassignType || !newMotorman || !reason) {
        showToast('⚠️ Please fill in all required fields', 'warning');
        return;
    }
    
    // Get selected trains for partial/specific reassignments
    let selectedTrains = [];
    if (reassignType === 'partial_detail') {
        const checkboxes = modal.querySelectorAll('input[name="selectedTrains"]:checked');
        selectedTrains = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedTrains.length === 0) {
            showToast('⚠️ Please select at least one train for partial reassignment', 'warning');
            return;
        }
    } else if (reassignType === 'specific_trains') {
        const radio = modal.querySelector('input[name="selectedTrain"]:checked');
        if (!radio) {
            showToast('⚠️ Please select a train for reassignment', 'warning');
            return;
        }
        selectedTrains = [radio.value];
    }
    
    // Prepare reassignment data
    const reassignmentData = {
        detailId: currentReassignmentData.entry.detailId,
        detailNumber: currentReassignmentData.entry.detailNumber,
        originalMotorman: currentReassignmentData.entry.motormanName,
        originalOffice: currentReassignmentData.entry.office,
        newMotorman: newMotorman.trim(),
        newOffice: newOffice,
        reassignmentType: reassignType,
        selectedTrains: selectedTrains,
        reason: reason,
        notes: notes.trim(),
        date: currentDate,
        timestamp: new Date().toISOString(),
        createdBy: 'JFO Supervisor' // This would come from auth in real app
    };
    
    showLoading();
    
    try {
        // Send to backend (if available)
        if (window.app) {
            await processReassignmentWithBackend(reassignmentData);
        } else {
            // Demo mode processing
            await processReassignmentDemo(reassignmentData);
        }
        
        // Close modal and refresh data
        closeReassignmentModal();
        await loadAppearanceBook();
        
        showToast(`✅ Reassignment processed successfully`, 'success');
        
    } catch (error) {
        console.error('Reassignment processing error:', error);
        showToast('❌ Failed to process reassignment', 'error');
    } finally {
        hideLoading();
    }
}

async function processReassignmentWithBackend(reassignmentData) {
    const response = await fetch('/api/jfo/reassignments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reassignmentData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Backend processing failed');
    }
    
    return await response.json();
}

function closeReassignmentModal() {
    const modal = document.getElementById('activeReassignmentModal');
    if (modal) {
        modal.remove();
        console.log('✅ Reassignment modal closed');
    }
    window.currentReassignmentData = null;
}


// ===== UTILITY FUNCTIONS =====
function updateCurrentDateDisplay() {
    const dateInput = document.getElementById('jfoDate');
    const display = document.getElementById('currentDateDisplay');
    
    if (dateInput.value) {
        const date = new Date(dateInput.value);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        display.textContent = date.toLocaleDateString('en-IN', options);
    } else {
        display.textContent = 'No date selected';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 JFO Console initializing...');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('jfoDate');
    if (dateInput) {
        dateInput.value = today;
        updateCurrentDateDisplay();
    }
    
    // Initialize search functionality
    setupSearchAndFilters();
    
    // Detect if running in integrated mode by checking if we're on the same domain as the backend
    // and if the API endpoints are available
    detectBackendIntegration();
    
    console.log('✅ JFO Console ready!');
});

async function detectBackendIntegration() {
    try {
        // Test if the backend API is available
        const response = await fetch('/api/health', { 
            method: 'GET',
            timeout: 5000 
        });
        
        if (response.ok) {
            window.app = { integrated: true }; // Set flag for backend integration
            console.log('✅ JFO Console integrated with backend (MySQL)');
        } else {
            window.app = null;
            console.log('⚠️ Backend not available - running in demo mode');
        }
    } catch (error) {
        window.app = null;
        console.log('⚠️ Backend detection failed - running in demo mode');
    }
}

// Also update the button event listener to use the correct function
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("loadDutyRosterBtn");
    if (btn) {
        btn.addEventListener("click", loadAppearanceBook);
    }
    
    // Make sure the main Load Appearance Book button also works
    const mainBtn = document.querySelector('button[onclick="loadAppearanceBook()"]');
    if (mainBtn) {
        mainBtn.onclick = loadAppearanceBook;
    }
});

async function testRosterEndpoint(date) {
    console.log('🔍 Testing roster endpoint...');
    
    try {
        const url = `/api/roster?date=${encodeURIComponent(date)}`;
        console.log('🔍 Testing URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        console.log('📡 Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response body:', errorText);
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Roster API response:', result);
        console.log('📊 Records found:', result.data?.length || 0);
        return result;
        
    } catch (error) {
        console.error('❌ Roster endpoint test failed:', error);
        throw error;
    }
} 
async function checkAvailableEndpoints() {
    console.log('🔍 Checking available endpoints...');
    
    const endpointsToTest = [
        '/api/health',
        '/api/test', 
        '/api/roster?date=2025-06-02',
        '/api/db-test',
        '/api/dashboard/stats'
    ];
    
    const results = {};
    
    for (const endpoint of endpointsToTest) {
        try {
            console.log(`Testing ${endpoint}...`);
            const response = await fetch(endpoint);
            const status = response.status;
            const isOk = response.ok;
            
            results[endpoint] = { status, isOk };
            console.log(`${endpoint}: ${status} ${isOk ? '✅' : '❌'}`);
            
            if (isOk && endpoint.includes('/api/roster')) {
                const data = await response.json();
                console.log(`📊 Roster data preview:`, data);
            }
            
        } catch (error) {
            results[endpoint] = { error: error.message };
            console.log(`${endpoint}: Failed ❌ - ${error.message}`);
        }
    }
    
    console.log('📋 Endpoint test results:', results);
    return results;
} 

// 7. Function to force demo mode (call from browser console)
function forceDemoMode() {
    console.log('🔧 Forcing demo mode...');
    window.app = null; // Disable backend detection
    loadAppearanceBook();
}

// 8. Function to force backend mode (call from browser console)  
function forceBackendMode() {
    console.log('🔧 Forcing backend mode...');
    window.app = { integrated: true }; // Enable backend detection
    loadAppearanceBook();
}

async function loadDemoDataNew() {
    console.log('📋 Loading demo appearance book data...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoData = [{
        detailId: 'DEMO-201',
        detailNumber: '201',
        motormanName: 'Demo Motorman (1234)',
        office: 'CSMT',
        signOnTime: '06:00',
        signOffTime: '14:00',
        trains: [{
            trainNumber: 'A 201',
            startTime: '08:00',
            endTime: '10:00',
            startStation: 'CSMT',
            endStation: 'KYN',
            id: 'demo_train_1'
        }],
        totalTrains: 1,
        status: 'assigned',
        hasReassignments: false,
        reassignments: [],
        effectiveAssignment: {
            motormanName: 'Demo Motorman (1234)',
            assignedTrains: ['A 201'],
            reassignmentType: 'original'
        }
    }];
    
    displayAppearanceBookDebug(demoData);
    updateSummaryCards({ total: 1, waiting: 0, reassigned: 0, totalReassignments: 0 });
    showToast('✅ Demo data loaded', 'success');
}

function launchReassignmentModal(entry, index) {
    console.log('🚀 Launching reassignment modal for:', entry.detailId);

    // Store the current entry and index globally so other functions can use them
    window.currentReassignmentData = { entry, index };

    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) existingModal.remove();

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'activeReassignmentModal';
    modal.className = 'reassignment-modal-overlay';

    // Basic modal structure — update this later with styling/fields
    modal.innerHTML = `
        // <div class="reassignment-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔄 Reassign Motorman</h2>
                <span class="close">&times;</span>
            </div>
            <form id="reassignmentForm">
                <input type="hidden" name="detailId" value="${entry.detailId}">
                
                <label for="reassignType">Reassignment Type:</label>
                <select id="reassignType" name="reassignType" required>
                    <option value="">Select...</option>
                    <option value="full_detail">Full Detail</option>
                    <option value="partial_detail">Partial Detail</option>
                    <option value="specific_trains">Specific Trains</option>
                </select>

                <div id="trainSelectionSection" style="display: none;">
                    <label>Select Trains:</label>
                    <div id="trainCheckboxContainer" class="train-checkbox-container"></div>
                </div>

                <label for="newMotorman">New Motorman Name:</label>
                <input type="text" id="newMotorman" name="newMotorman" required>

                <label for="newOffice">New Office (optional):</label>
                <input type="text" id="newOffice" name="newOffice">

                <label for="reassignReason">Reason:</label>
                <textarea id="reassignReason" name="reassignReason" required></textarea>

                <label for="reassignNotes">Notes (optional):</label>
                <textarea id="reassignNotes" name="reassignNotes"></textarea>

                <div class="modal-actions">
                    <button type="submit" class="btn-primary">✅ Submit</button>
                    <button type="button" onclick="closeReassignmentModal()">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal listeners for closing, form submit, etc.
    setupModalEventListeners(modal);

    console.log('✅ Reassignment modal inserted and ready');
}


// Calculate duty hours (sign_off_time - sign_on_time)
function calculateDutyHours(signOnTime, signOffTime) {
    console.log(`Calculating duty hours: ${signOnTime} to ${signOffTime}`);
    
    const [signOnHour, signOnMin] = signOnTime.split(':').map(Number);
    const [signOffHour, signOffMin] = signOffTime.split(':').map(Number);
    
    const signOnMinutes = signOnHour * 60 + signOnMin;
    const signOffMinutes = signOffHour * 60 + signOffMin;
    
    let dutyMinutes = signOffMinutes - signOnMinutes;
    
    // Handle next day scenarios (sign off after midnight)
    if (dutyMinutes < 0) {
        dutyMinutes += 24 * 60; // Add 24 hours
    }
    
    const dutyHours = dutyMinutes / 60;
    console.log(`Duty hours calculated: ${dutyHours.toFixed(2)}`);
    
    return parseFloat(dutyHours.toFixed(2));
}

// Calculate wheel movement hours (end_time - start_time)
function calculateWheelMovementHours(startTime, endTime, trainTypeOperation = 'working') {
    console.log(`Calculating wheel movement: ${startTime} to ${endTime}, type: ${trainTypeOperation}`);
    
    // If piloting train, wheel movement = 0
    if (trainTypeOperation === 'piloting') {
        console.log('Piloting train - wheel movement = 0');
        return 0;
    }
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let movementMinutes = endMinutes - startMinutes;
    
    // Handle next day scenarios
    if (movementMinutes < 0) {
        movementMinutes += 24 * 60;
    }
    
    const wheelMovementHours = movementMinutes / 60;
    console.log(`Wheel movement calculated: ${wheelMovementHours.toFixed(2)}`);
    
    return parseFloat(wheelMovementHours.toFixed(2));
}

// Auto-detect piloting trains based on train number
function detectTrainType(trainNumber) {
    const trainNum = trainNumber.toUpperCase();
    
    // Check if train number starts with "P/" (piloting indicator)
    if (trainNum.startsWith('P/')) {
        console.log(`Train ${trainNumber} detected as piloting train`);
        return 'piloting';
    }
    
    // Check for other piloting patterns
    const pilotingPatterns = ['PILOT', 'PIL', 'P-'];
    for (const pattern of pilotingPatterns) {
        if (trainNum.includes(pattern)) {
            console.log(`Train ${trainNumber} detected as piloting train (pattern: ${pattern})`);
            return 'piloting';
        }
    }
    
    console.log(`Train ${trainNumber} detected as working train`);
    return 'working';
}

// Validate time format
function validateTimeFormat(timeString) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
}

// Comprehensive special train validation
function validateSpecialTrainData(formData) {
    const errors = [];
    
    // Required fields
    if (!formData.trainNumber) errors.push('Train number is required');
    if (!formData.signOnTime) errors.push('Sign on time is required');
    if (!formData.signOffTime) errors.push('Sign off time is required');
    if (!formData.startTime) errors.push('Start time is required');
    if (!formData.endTime) errors.push('End time is required');
    if (!formData.startStation) errors.push('Start station is required');
    if (!formData.endStation) errors.push('End station is required');
    
    // Time format validation
    if (formData.signOnTime && !validateTimeFormat(formData.signOnTime)) {
        errors.push('Invalid sign on time format (use HH:MM)');
    }
    if (formData.signOffTime && !validateTimeFormat(formData.signOffTime)) {
        errors.push('Invalid sign off time format (use HH:MM)');
    }
    if (formData.startTime && !validateTimeFormat(formData.startTime)) {
        errors.push('Invalid start time format (use HH:MM)');
    }
    if (formData.endTime && !validateTimeFormat(formData.endTime)) {
        errors.push('Invalid end time format (use HH:MM)');
    }
    
    // Logical time validation
    if (formData.signOnTime && formData.startTime) {
        const signOnMinutes = timeToMinutes(formData.signOnTime);
        const startMinutes = timeToMinutes(formData.startTime);
        if (startMinutes < signOnMinutes) {
            errors.push('Start time should be after sign on time');
        }
    }
    
    if (formData.endTime && formData.signOffTime) {
        const endMinutes = timeToMinutes(formData.endTime);
        const signOffMinutes = timeToMinutes(formData.signOffTime);
        if (signOffMinutes < endMinutes) {
            errors.push('Sign off time should be after end time');
        }
    }
    
    return errors;
}

// Helper function to convert time to minutes
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Process special train form data
function processSpecialTrainData(formData) {
    console.log('🔄 Processing special train data:', formData);
    
    // Validate data
    const errors = validateSpecialTrainData(formData);
    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return { success: false, errors };
    }
    
    // Auto-detect train type if not specified
    if (!formData.trainTypeOperation) {
        formData.trainTypeOperation = detectTrainType(formData.trainNumber);
    }
    
    // Calculate duty hours
    formData.dutyHours = calculateDutyHours(formData.signOnTime, formData.signOffTime);
    
    // Calculate wheel movement hours
    formData.wheelMovementHours = calculateWheelMovementHours(
        formData.startTime, 
        formData.endTime, 
        formData.trainTypeOperation
    );
    
    console.log('✅ Special train data processed:', {
        trainNumber: formData.trainNumber,
        trainType: formData.trainTypeOperation,
        dutyHours: formData.dutyHours,
        wheelMovementHours: formData.wheelMovementHours
    });
    
    return { success: true, data: formData };
}

// Example usage for testing
function testCalculations() {
    console.log('🧪 Testing special train calculations...');
    
    // Test case 1: Working train
    const workingTrain = {
        trainNumber: 'KYN SPL 001',
        signOnTime: '06:00',
        signOffTime: '14:00',
        startTime: '07:00',
        endTime: '13:00',
        trainTypeOperation: 'working'
    };
    
    console.log('Test 1 - Working Train:');
    const result1 = processSpecialTrainData(workingTrain);
    console.log(result1);
    
    // Test case 2: Piloting train
    const pilotingTrain = {
        trainNumber: 'P/KYN 002',
        signOnTime: '08:00',
        signOffTime: '16:00',
        startTime: '09:00',
        endTime: '15:00',
        trainTypeOperation: 'piloting'
    };
    
    console.log('Test 2 - Piloting Train:');
    const result2 = processSpecialTrainData(pilotingTrain);
    console.log(result2);
}

// Uncomment to run tests
// testCalculations();

// Tab management functions
function showJFOTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    const selectedButton = document.getElementById(`tab-${tabName}`);
    
    if (selectedTab && selectedButton) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
        selectedButton.classList.add('active');
        
        // Load data for specific tabs
        if (tabName === 'special-trains') {
            initializeSpecialTrainsTab();
        }
    }
}

// Initialize special trains tab
function initializeSpecialTrainsTab() {
    console.log('🔄 Initializing Special Trains tab...');
    
    // Set default date to today
    const dateInput = document.getElementById('specialTrainDate');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Load today's special trains
    loadSpecialTrains();
}

// Handle train number change (auto-detect piloting)
function onTrainNumberChange(trainNumber) {
    const detectedType = detectTrainType(trainNumber);
    const radioButtons = document.querySelectorAll('input[name="trainTypeOperation"]');
    
    radioButtons.forEach(radio => {
        if (radio.value === detectedType) {
            radio.checked = true;
        }
    });
    
    onTrainTypeChange();
    console.log(`🚂 Train ${trainNumber} auto-detected as: ${detectedType}`);
}

// Handle train type change
function onTrainTypeChange() {
    const selectedType = document.querySelector('input[name="trainTypeOperation"]:checked').value;
    const pilotingNote = document.getElementById('pilotingNote');
    
    if (selectedType === 'piloting') {
        pilotingNote.style.display = 'block';
    } else {
        pilotingNote.style.display = 'none';
    }
    
    // Recalculate times
    calculateTimes();
}

// Real-time calculation when times change
function calculateTimes() {
    const signOnTime = document.getElementById('signOnTime').value;
    const signOffTime = document.getElementById('signOffTime').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const trainType = document.querySelector('input[name="trainTypeOperation"]:checked').value;
    
    const dutyHoursField = document.getElementById('calculatedDutyHours');
    const wheelMovementField = document.getElementById('calculatedWheelMovement');
    
    // Calculate duty hours
    if (signOnTime && signOffTime) {
        const dutyHours = calculateDutyHours(signOnTime, signOffTime);
        dutyHoursField.value = `${dutyHours} hours`;
    } else {
        dutyHoursField.value = '';
    }
    
    // Calculate wheel movement hours
    if (startTime && endTime) {
        const wheelMovementHours = calculateWheelMovementHours(startTime, endTime, trainType);
        wheelMovementField.value = `${wheelMovementHours} hours`;
        
        // Highlight if piloting
        if (trainType === 'piloting') {
            wheelMovementField.style.background = '#fff3cd';
            wheelMovementField.style.color = '#856404';
        } else {
            wheelMovementField.style.background = '#f8f9fa';
            wheelMovementField.style.color = '#495057';
        }
    } else {
        wheelMovementField.value = '';
    }
}

// Add special train form submission
async function addSpecialTrain(event) {
    event.preventDefault();
    
    console.log('🔄 Adding special train...');
    
    const formData = new FormData(event.target);
    const specialTrainData = {
        date: formData.get('date'),
        trainNumber: formData.get('trainNumber'),
        trainName: formData.get('trainName'),
        trainTypeOperation: formData.get('trainTypeOperation'),
        signOnTime: formData.get('signOnTime'),
        signOffTime: formData.get('signOffTime'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        startStation: formData.get('startStation'),
        endStation: formData.get('endStation'),
        assignedMotorman: formData.get('assignedMotorman'),
        office: formData.get('office'),
        remarks: formData.get('remarks')
    };
    
    // Process and validate data
    const processedData = processSpecialTrainData(specialTrainData);
    
    if (!processedData.success) {
        showToast(`⚠️ Validation errors: ${processedData.errors.join(', ')}`, 'warning');
        return;
    }
    
    showLoading('Adding special train...');
    
    try {
        // Send to backend
        const response = await fetch('/api/special-trains', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...processedData.data,
                createdBy: 'JFO Supervisor' // This would come from auth
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Special train added:', result);
        
        showToast(`✅ Special train ${specialTrainData.trainNumber} added successfully!`, 'success');
        
        // Reset form
        event.target.reset();
        document.getElementById('calculatedDutyHours').value = '';
        document.getElementById('calculatedWheelMovement').value = '';
        
        // Set date back to today
        const dateInput = document.getElementById('specialTrainDate');
        dateInput.value = new Date().toISOString().split('T')[0];
        
        // Reload special trains list
        loadSpecialTrains();
        
    } catch (error) {
        console.error('❌ Failed to add special train:', error);
        showToast(`❌ Failed to add special train: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Load special trains for display
async function loadSpecialTrains(date = null) {
    const selectedDate = date || document.getElementById('specialTrainDate')?.value || new Date().toISOString().split('T')[0];
    
    console.log(`🔄 Loading special trains for ${selectedDate}...`);
    
    try {
        const response = await fetch(`/api/special-trains?date=${encodeURIComponent(selectedDate)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        const specialTrains = result.data || [];
        
        console.log(`✅ Loaded ${specialTrains.length} special trains`);
        
        displaySpecialTrains(specialTrains);
        
    } catch (error) {
        console.error('❌ Failed to load special trains:', error);
        
        // Show error in table
        const tbody = document.getElementById('specialTrainsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                        <div style="font-size: 1.2em; margin-bottom: 10px;">❌</div>
                        <div>Failed to load special trains: ${error.message}</div>
                    </td>
                </tr>
            `;
        }
    }
}

// Display special trains in table
function displaySpecialTrains(specialTrains) {
    const tbody = document.getElementById('specialTrainsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (specialTrains.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 1.2em; margin-bottom: 10px;">⭐</div>
                    <div>No special trains found for selected date</div>
                    <div style="font-size: 0.9em; color: #999; margin-top: 5px;">
                        Use the form above to add special trains
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    specialTrains.forEach((train, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        
        const typeIcon = train.train_type_operation === 'piloting' ? '🔄' : '🚂';
        const typeClass = train.train_type_operation === 'piloting' ? 'piloting-train' : 'working-train';
        
        row.innerHTML = `
            <td>
                <strong style="color: #2c3e50;">${train.train_number}</strong>
                ${train.train_name ? `<br><small style="color: #666;">${train.train_name}</small>` : ''}
            </td>
            <td>
                <span class="${typeClass}" style="padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600;">
                    ${typeIcon} ${train.train_type_operation}
                </span>
            </td>
            <td>
                <div style="font-size: 0.9em;">
                    <div>Sign: ${train.sign_on_time} - ${train.sign_off_time}</div>
                    <div>Run: ${train.start_time} - ${train.end_time}</div>
                </div>
            </td>
            <td>${train.start_station} → ${train.end_station}</td>
            <td>
                ${train.assigned_motorman ? 
                    `<strong>${train.assigned_motorman}</strong><br><small>${train.office}</small>` : 
                    '<span style="color: #ffc107;">⏳ Unassigned</span>'
                }
            </td>
            <td>
                <div style="font-size: 0.9em;">
                    <div>Duty: ${train.duty_hours}h</div>
                    <div ${train.train_type_operation === 'piloting' ? 'style="color: #e67e22;"' : ''}>
                        Wheel: ${train.wheel_movement_hours}h
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="editSpecialTrain(${train.id})" class="btn-sm" 
                            style="padding: 4px 8px; background: #17a2b8; color: white; border: none; border-radius: 4px; font-size: 0.8em;">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteSpecialTrain(${train.id}, '${train.train_number}')" class="btn-sm"
                            style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; font-size: 0.8em;">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Edit special train (placeholder)
function editSpecialTrain(trainId) {
    console.log(`✏️ Edit special train: ${trainId}`);
    showToast('Edit functionality coming soon!', 'info');
}

// Delete special train
async function deleteSpecialTrain(trainId, trainNumber) {
    if (!confirm(`Are you sure you want to delete special train "${trainNumber}"?`)) {
        return;
    }
    
    console.log(`🗑️ Deleting special train: ${trainId}`);
    
    try {
        showLoading('Deleting special train...');
        
        const response = await fetch(`/api/special-trains/${trainId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        showToast(`✅ Special train "${trainNumber}" deleted successfully!`, 'success');
        loadSpecialTrains();
        
    } catch (error) {
        console.error('❌ Failed to delete special train:', error);
        showToast(`❌ Failed to delete special train: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Initialize tab system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Show appearance book tab by default
    showJFOTab('appearance');
    
    console.log('✅ JFO Console tab system initialized');
});


// Add this at the END of your jfo-script.js file to make functions globally accessible:

// Global debug object for console access
window.jfoDebug = {
    // Force backend mode
    forceBackend: function() {
        console.log('🔧 Forcing backend mode...');
        window.app = { integrated: true };
        loadAppearanceBook();
    },
    
    // Force demo mode
    forceDemo: function() {
        console.log('🔧 Forcing demo mode...');
        window.app = null;
        loadAppearanceBook();
    },
    
    // Test roster endpoint
    testRoster: async function(date = '2025-06-02') {
        console.log('🔍 Testing roster endpoint...');
        try {
            const url = `/api/roster?date=${encodeURIComponent(date)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            console.log('✅ Success:', result.data?.length, 'records');
            return result;
        } catch (error) {
            console.error('❌ Failed:', error);
            throw error;
        }
    },
    
    // Load appearance book with current date
    loadBook: function() {
        const dateInput = document.getElementById('jfoDate');
        const date = dateInput?.value;
        if (!date) {
            console.log('❌ No date selected');
            return;
        }
        console.log('🔄 Loading appearance book for', date);
        loadAppearanceBook();
    },
    
    // Show current data
    showData: function() {
        console.log('📊 Current appearance data:', window.currentAppearanceData);
        return window.currentAppearanceData;
    },
    
    // Check if functions exist
    checkFunctions: function() {
        const functions = [
            'loadAppearanceBook',
            'displayAppearanceBookDebug', 
            'transformRosterDataSimple',
            'updateSummaryCards'
        ];
        
        functions.forEach(funcName => {
            const exists = typeof window[funcName] === 'function';
            console.log(`${funcName}: ${exists ? '✅' : '❌'}`);
        });
    }
};

window.forceCloseModal = function() {
    const modal = document.getElementById('activeReassignmentModal');
    if (modal) {
        modal.remove();
        console.log('✅ Force modal closed');
    }
    window.currentReassignmentData = null;
};

window.forceProcessReassignment = function() {
    console.log('🔄 Processing force reassignment...');
    
    const reassignType = document.getElementById('forceReassignType').value;
    const newMotorman = document.getElementById('forceNewMotorman').value;
    const newOffice = document.getElementById('forceNewOffice').value;
    const reason = document.getElementById('forceReason').value;
    const notes = document.getElementById('forceNotes').value;
    
    if (!reassignType || !newMotorman || !reason) {
        alert('Please fill in all required fields (Type, Motorman, Reason)');
        return;
    }
    
    const reassignmentData = {
        detailNumber: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        newMotorman: newMotorman,
        newOffice: newOffice,
        reassignmentType: reassignType,
        reason: reason,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    console.log('📋 Force reassignment data:', reassignmentData);
    
    showToast(`✅ Reassignment recorded: Detail ${reassignmentData.detailNumber} → ${reassignmentData.newMotorman}`, 'success');
    
    window.forceCloseModal();
};


// COMPREHENSIVE DEBUG AND FIX FOR JFO ISSUES

// 1. Debug function to check current state
function debugJFOModal() {
    console.log('🔍 DEBUG: Checking JFO Modal state...');
    
    // Check if modal exists
    const modal = document.getElementById('activeReassignmentModal');
    console.log('Modal exists:', !!modal);
    
    // Check current reassignment data
    console.log('Current reassignment data:', window.currentReassignmentData);
    console.log('Entry:', window.currentReassignmentData?.entry);
    console.log('Trains:', window.currentReassignmentData?.entry?.trains);
    
    // Check functions
    console.log('processEnhancedReassignment function:', typeof window.processEnhancedReassignment);
    console.log('populateTrainSelection function:', typeof window.populateTrainSelection);
    
    // Check form elements
    if (modal) {
        console.log('Process button:', modal.querySelector('button[onclick="processEnhancedReassignment()"]'));
        console.log('Reassign type:', modal.querySelector('#reassignType'));
        console.log('Train container:', modal.querySelector('#trainCheckboxContainer'));
    }
    
    return {
        modal: !!modal,
        data: !!window.currentReassignmentData?.entry,
        trains: window.currentReassignmentData?.entry?.trains?.length || 0,
        processFunction: typeof window.processEnhancedReassignment
    };
}

// 2. Fixed processEnhancedReassignment with detailed logging
function processEnhancedReassignmentFixed() {
    console.log('🔄 FIXED: Processing enhanced reassignment...');
    console.log('🔍 Button clicked - function called successfully!');
    
    try {
        // Check if we have data
        if (!window.currentReassignmentData?.entry) {
            console.error('❌ No reassignment data found');
            showToast('❌ No detail data found - please try reopening the modal', 'error');
            return;
        }
        
        console.log('✅ Reassignment data found:', window.currentReassignmentData.entry);
        
        // Get reassignment mode with detailed logging
        const checkedRadio = document.querySelector('input[name="reassignmentMode"]:checked');
        console.log('🔍 Checked radio button:', checkedRadio);
        
        if (!checkedRadio) {
            console.error('❌ No reassignment mode selected');
            showToast('⚠️ Please select a reassignment mode', 'warning');
            return;
        }
        
        const mode = checkedRadio.value;
        console.log('📋 Selected mode:', mode);
        
        // Route to appropriate function
        if (mode === 'motorman_change') {
            console.log('👤 Routing to motorman reassignment...');
            return processMotormanReassignmentFixed();
        } else if (mode === 'detail_change') {
            console.log('📋 Routing to detail reassignment...');
            return processDetailReassignmentFixed();
        } else {
            console.error('❌ Unknown mode:', mode);
            showToast('❌ Invalid reassignment mode', 'error');
        }
    } catch (error) {
        console.error('❌ Error in processEnhancedReassignment:', error);
        showToast('❌ Error processing reassignment', 'error');
    }
}

// 3. Fixed motorman reassignment with better validation
function processMotormanReassignmentFixed() {
    console.log('👤 FIXED: Processing motorman reassignment...');
    
    try {
        // Get form values with detailed logging
        const reassignType = document.getElementById('reassignType')?.value;
        const newMotorman = document.getElementById('newMotorman')?.value?.trim();
        const reason = document.getElementById('reassignReason')?.value;
        const office = document.getElementById('reassignOffice')?.value || 'CSMT';
        const notes = document.getElementById('reassignNotes')?.value || '';
        
        console.log('📋 Form values:', {
            reassignType,
            newMotorman,
            reason,
            office,
            notes
        });
        
        // Validation with user feedback
        if (!reassignType) {
            showToast('⚠️ Please select reassignment type', 'warning');
            document.getElementById('reassignType')?.focus();
            return;
        }
        
        if (!newMotorman) {
            showToast('⚠️ Please enter new motorman name', 'warning');
            document.getElementById('newMotorman')?.focus();
            return;
        }
        
        if (!reason) {
            showToast('⚠️ Please select a reason', 'warning');
            document.getElementById('reassignReason')?.focus();
            return;
        }
        
        // Get selected trains for partial reassignments
        let selectedTrains = [];
        if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
            const trainInputs = document.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked');
            selectedTrains = Array.from(trainInputs).map(input => input.value);
            
            console.log(`🚂 Selected trains: ${selectedTrains.length}`, selectedTrains);
            
            if (selectedTrains.length === 0) {
                showToast(`⚠️ Please select at least one train for ${reassignType.replace('_', ' ')}`, 'warning');
                return;
            }
        }
        
        // Create reassignment data
        const reassignmentData = {
            mode: 'motorman_change',
            reassignmentType: reassignType,
            originalDetail: window.currentReassignmentData.entry.detailNumber,
            originalMotorman: window.currentReassignmentData.entry.motormanName,
            newMotorman: newMotorman,
            office: office,
            reason: reason,
            notes: notes,
            selectedTrains: selectedTrains,
            timestamp: new Date().toISOString(),
            index: window.currentReassignmentData.index
        };
        
        console.log('📋 Complete reassignment data:', reassignmentData);
        
        // Process the reassignment (DEMO VERSION for now)
        processReassignmentDemo(reassignmentData);
        
    } catch (error) {
        console.error('❌ Error in motorman reassignment:', error);
        showToast('❌ Error processing motorman reassignment', 'error');
    }
}

// 4. Demo processing function (no backend required)
function processReassignmentDemo(reassignmentData) {
    console.log('🎭 DEMO: Processing reassignment...');
    
    // Show processing feedback
    showToast('🔄 Processing reassignment...', 'info', 2000);
    
    setTimeout(() => {
        try {
            // Update the data
            updateAppearanceDataDemo(reassignmentData);
            
            // Close modal
            closeReassignmentModal();
            
            // Show success
            const successMessage = `✅ ${reassignmentData.reassignmentType.replace('_', ' ')} completed!\n📋 Detail ${reassignmentData.originalDetail}\n👤 ${reassignmentData.originalMotorman} → ${reassignmentData.newMotorman}`;
            showToast(successMessage, 'success', 6000);
            
            // Refresh display
            if (window.currentAppearanceData) {
                displayAppearanceBookDebug(window.currentAppearanceData);
                if (window.updateSummaryCards && window.calculateSummaryStats) {
                    updateSummaryCards(calculateSummaryStats(window.currentAppearanceData));
                }
            }
            
            // Show confirmation
            setTimeout(() => {
                showSuccessConfirmation(reassignmentData);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error in demo processing:', error);
            showToast('❌ Failed to process reassignment', 'error');
        }
    }, 1500);
}

// 5. Demo data update function
function updateAppearanceDataDemo(reassignmentData) {
    console.log('🔄 DEMO: Updating appearance data...');
    
    const entry = window.currentAppearanceData[reassignmentData.index];
    if (!entry) {
        console.error('❌ Entry not found');
        return;
    }
    
    console.log('📋 Original entry:', entry.motormanName);
    
    // Add reassignment record
    if (!entry.reassignments) {
        entry.reassignments = [];
    }
    
    entry.reassignments.push({
        id: `demo_${Date.now()}`,
        type: reassignmentData.reassignmentType,
        reason: reassignmentData.reason,
        notes: reassignmentData.notes,
        originalMotorman: reassignmentData.originalMotorman,
        newMotorman: reassignmentData.newMotorman,
        selectedTrains: reassignmentData.selectedTrains || [],
        createdAt: reassignmentData.timestamp,
        createdBy: 'JFO Supervisor (Demo)'
    });
    
    // Update entry
    entry.hasReassignments = true;
    
    if (reassignmentData.reassignmentType === 'full_detail') {
        entry.motormanName = reassignmentData.newMotorman;
    } else if (reassignmentData.selectedTrains && reassignmentData.selectedTrains.length > 0) {
        const remainingCount = entry.trains.length - reassignmentData.selectedTrains.length;
        entry.motormanName = `${reassignmentData.originalMotorman} (${remainingCount}/${entry.trains.length} trains)`;
    }
    
    console.log('✅ Updated entry:', entry.motormanName);
}

// 6. Fixed train population with extensive debugging
function populateTrainSelectionFixed() {
    console.log('🚂 FIXED: Populating train selection...');
    
    const container = document.getElementById('trainCheckboxContainer');
    const reassignType = document.getElementById('reassignType')?.value;
    const entry = window.currentReassignmentData?.entry;
    
    console.log('🔍 Debug info:', {
        container: !!container,
        reassignType: reassignType,
        entry: !!entry,
        trains: entry?.trains?.length || 0
    });
    
    if (!container) {
        console.error('❌ Train container not found');
        return;
    }
    
    if (!entry?.trains || entry.trains.length === 0) {
        console.error('❌ No trains data available');
        container.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h4>❌ No Trains Data Available</h4>
                <p>Entry: ${!!entry}</p>
                <p>Trains: ${entry?.trains?.length || 0}</p>
                <button onclick="debugJFOModal()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">
                    🔍 Debug Info
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`✅ Found ${entry.trains.length} trains to display`);
    
    // Clear container
    container.innerHTML = '';
    
    const inputType = reassignType === 'partial_detail' ? 'checkbox' : 'radio';
    const inputName = reassignType === 'partial_detail' ? 'selectedTrains' : 'selectedTrain';
    
    console.log(`🔧 Using ${inputType} inputs with name "${inputName}"`);
    
    // Create train cards
    entry.trains.forEach((train, index) => {
        console.log(`🚂 Creating card ${index + 1}: ${train.trainNumber}`);
        
        const trainCard = document.createElement('div');
        trainCard.className = 'train-selection-card';
        trainCard.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
            cursor: pointer;
            margin-bottom: 10px;
        `;
        
        trainCard.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" style="margin-right: 12px; transform: scale(1.3);">
                <label for="train_${index}" style="font-weight: 600; color: #2c3e50; font-size: 1.1em; cursor: pointer;">
                    🚂 ${train.trainNumber}
                </label>
            </div>
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                <strong>Route:</strong> ${train.startStation || 'N/A'} → ${train.endStation || 'N/A'}
            </div>
            <div style="color: #495057; font-size: 0.9em; font-weight: 500;">
                <strong>Time:</strong> ${train.startTime || 'N/A'} - ${train.endTime || 'N/A'}
            </div>
        `;
        
        // Add click handler
        trainCard.addEventListener('click', function() {
            const checkbox = this.querySelector('input');
            
            if (inputType === 'radio') {
                // Clear all radio selections first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    r.closest('.train-selection-card').style.borderColor = '#e9ecef';
                    r.closest('.train-selection-card').style.backgroundColor = 'white';
                });
            }
            
            checkbox.checked = !checkbox.checked;
            
            // Update visual state
            if (checkbox.checked) {
                this.style.borderColor = '#28a745';
                this.style.backgroundColor = '#f8fff9';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.backgroundColor = 'white';
            }
            
            console.log(`🚂 Train ${train.trainNumber} ${checkbox.checked ? 'selected' : 'deselected'}`);
            
            // Update preview
            updateReassignmentPreviewFixed();
        });
        
        container.appendChild(trainCard);
    });
    
    console.log('✅ Train selection populated successfully');
    
    // Add summary
    const summary = document.createElement('div');
    summary.style.cssText = `
        margin-top: 15px;
        padding: 10px;
        background: #e7f3ff;
        border-radius: 6px;
        color: #004085;
        font-size: 0.9em;
    `;
    summary.innerHTML = `
        <strong>💡 Instructions:</strong> 
        ${inputType === 'checkbox' ? 
            'Select multiple trains to transfer to the new motorman. Remaining trains stay with current motorman.' :
            'Select one specific train to reassign to the new motorman.'
        }
    `;
    container.appendChild(summary);
}

// 7. Fixed preview update
function updateReassignmentPreviewFixed() {
    console.log('🔄 FIXED: Updating reassignment preview...');
    
    const previewDiv = document.getElementById('reassignmentPreview');
    const previewContent = document.getElementById('previewContent');
    const newMotorman = document.getElementById('newMotorman')?.value?.trim();
    
    if (!previewDiv || !previewContent || !newMotorman) {
        if (previewDiv) previewDiv.style.display = 'none';
        return;
    }
    
    const selectedTrains = Array.from(document.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked'))
        .map(input => input.value);
    
    console.log(`📋 Preview update: ${selectedTrains.length} trains selected`);
    
    if (selectedTrains.length === 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    const remainingTrains = entry?.trains.filter(train => !selectedTrains.includes(train.trainNumber)) || [];
    
    let previewHTML = `
        <div style="margin-bottom: 12px;">
            <strong>🔄 ${newMotorman} will get:</strong><br>
            <span style="color: #28a745;">${selectedTrains.join(', ')}</span> (${selectedTrains.length} trains)
        </div>
    `;
    
    if (remainingTrains.length > 0) {
        previewHTML += `
            <div>
                <strong>✅ ${entry.motormanName} will keep:</strong><br>
                <span style="color: #007bff;">${remainingTrains.map(t => t.trainNumber).join(', ')}</span> (${remainingTrains.length} trains)
            </div>
        `;
    }
    
    previewContent.innerHTML = previewHTML;
    previewDiv.style.display = 'block';
    
    console.log('✅ Preview updated successfully');
}

// 8. Fixed detail reassignment
function processDetailReassignmentFixed() {
    console.log('📋 FIXED: Processing detail reassignment...');
    
    const targetDetailType = document.getElementById('targetDetailType')?.value;
    const reason = document.getElementById('reassignReason')?.value;
    
    if (!targetDetailType) {
        showToast('⚠️ Please select target detail type', 'warning');
        return;
    }
    
    if (!reason) {
        showToast('⚠️ Please select a reason', 'warning');
        return;
    }
    
    // Simple demo processing for detail change
    const reassignmentData = {
        mode: 'detail_change',
        reassignmentType: 'detail_transfer',
        originalDetail: window.currentReassignmentData.entry.detailNumber,
        originalMotorman: window.currentReassignmentData.entry.motormanName,
        targetDetailType: targetDetailType,
        reason: reason,
        timestamp: new Date().toISOString(),
        index: window.currentReassignmentData.index
    };
    
    processReassignmentDemo(reassignmentData);
}

// 9. Simple success confirmation
function showSuccessConfirmation(reassignmentData) {
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; text-align: center;">
            <div style="font-size: 3em; margin-bottom: 20px;">✅</div>
            <h2 style="color: #28a745; margin-bottom: 20px;">Reassignment Successful!</h2>
            <p><strong>Detail:</strong> ${reassignmentData.originalDetail}</p>
            <p><strong>Type:</strong> ${reassignmentData.reassignmentType.replace('_', ' ')}</p>
            <p><strong>Motorman:</strong> ${reassignmentData.originalMotorman} → ${reassignmentData.newMotorman}</p>
            ${reassignmentData.selectedTrains?.length ? `<p><strong>Trains:</strong> ${reassignmentData.selectedTrains.join(', ')}</p>` : ''}
            <button onclick="document.getElementById('successModal').remove()" 
                    style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; margin-top: 20px;">
                ✅ Got It!
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 8 seconds
    setTimeout(() => {
        if (document.getElementById('successModal')) {
            document.getElementById('successModal').remove();
        }
    }, 8000);
}

// 10. Override the existing functions
function applyAllFixes() {
    console.log('🔧 Applying ALL JFO fixes...');
    
    // Override existing functions
    window.processEnhancedReassignment = processEnhancedReassignmentFixed;
    window.processMotormanReassignment = processMotormanReassignmentFixed;
    window.processDetailReassignment = processDetailReassignmentFixed;
    window.populateTrainSelection = populateTrainSelectionFixed;
    window.updateReassignmentPreview = updateReassignmentPreviewFixed;
    
    // Add new functions
    window.debugJFOModal = debugJFOModal;
    window.processReassignmentDemo = processReassignmentDemo;
    window.updateAppearanceDataDemo = updateAppearanceDataDemo;
    window.showSuccessConfirmation = showSuccessConfirmation;
    window.applyAllFixes = applyAllFixes;
    
    console.log('✅ All fixes applied successfully!');
    
    // Test the fix
    showToast('🔧 JFO fixes applied! Try the reassignment now.', 'info', 3000);
}

// Auto-apply fixes when loaded
applyAllFixes();



// Also make functions globally accessible by attaching them to window
window.forceBackendMode = function() {
    console.log('🔧 Forcing backend mode...');
    window.app = { integrated: true };
    loadAppearanceBook();
};

window.forceDemoMode = function() {
    console.log('🔧 Forcing demo mode...');
    window.app = null;
    loadAppearanceBook();
};




// Make the main functions globally accessible
window.loadAppearanceBookGlobal = loadAppearanceBook;
window.displayAppearanceBookDebugGlobal = displayAppearanceBookDebug;

console.log('🔧 JFO Debug functions attached to window.jfoDebug');
console.log('📋 Available commands:');
console.log('   window.jfoDebug.forceBackend()  - Force backend mode');
console.log('   window.jfoDebug.forceDemo()     - Force demo mode');
console.log('   window.jfoDebug.testRoster()    - Test roster API');
console.log('   window.jfoDebug.loadBook()      - Load current date');
console.log('   window.jfoDebug.showData()      - Show loaded data');
console.log('   window.jfoDebug.checkFunctions() - Check if functions exist');
console.log('');
console.log('💡 Or use: forceBackendMode(), forceDemoMode()');
console.log('💡 Or use: loadAppearanceBookGlobal()');

// COMPLETE FIX FOR JFO REASSIGNMENT ISSUES
// Add this to the END of your jfo-script.js file

console.log('🔧 Applying JFO Reassignment Fixes...');

// 1. Fix the reassignment type change handler to show train selection
function handleReassignmentTypeChangeFixed() {
    console.log('🔄 Fixed reassignment type change handler called');
    
    const reassignType = document.getElementById('reassignType')?.value;
    const trainSelectionSection = document.getElementById('trainSelectionSection');
    const instructionsDiv = document.getElementById('trainSelectionInstructions');
    
    console.log('📋 Reassignment type:', reassignType);
    console.log('📋 Train selection section exists:', !!trainSelectionSection);
    
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        if (trainSelectionSection) {
            trainSelectionSection.style.display = 'block';
            console.log('✅ Showing train selection section');
            
            // Update instructions
            if (instructionsDiv) {
                if (reassignType === 'partial_detail') {
                    instructionsDiv.innerHTML = `
                        <strong>📋 Partial Detail Transfer:</strong> Select multiple trains to transfer to the new motorman. 
                        The remaining trains will stay with ${window.currentReassignmentData?.entry?.motormanName || 'current motorman'}.
                    `;
                } else {
                    instructionsDiv.innerHTML = `
                        <strong>🎯 Specific Trains:</strong> Select specific trains to reassign to the new motorman. 
                        This is useful for operational adjustments or emergency replacements.
                    `;
                }
            }
            
            // Populate train selection if we have data
            if (window.currentReassignmentData?.entry?.trains) {
                populateTrainSelectionFixed();
            } else {
                console.warn('⚠️ No train data available for selection');
            }
        } else {
            console.error('❌ Train selection section not found in modal');
        }
    } else {
        if (trainSelectionSection) {
            trainSelectionSection.style.display = 'none';
            console.log('ℹ️ Hiding train selection section');
        }
    }
}

// 2. Fixed train selection population
function populateTrainSelectionFixed() {
    console.log('🚂 FIXED: Populating train selection...');
    
    const container = document.getElementById('trainCheckboxContainer');
    const reassignType = document.getElementById('reassignType')?.value;
    const entry = window.currentReassignmentData?.entry;
    
    if (!container) {
        console.error('❌ Train checkbox container not found');
        return;
    }
    
    if (!entry?.trains || entry.trains.length === 0) {
        console.error('❌ No trains data available');
        container.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center; background: #fee; border-radius: 8px;">
                <h4>❌ No Trains Available</h4>
                <p>No train data found for this detail.</p>
            </div>
        `;
        return;
    }
    
    console.log(`✅ Found ${entry.trains.length} trains to display`);
    
    // Clear container
    container.innerHTML = '';
    
    const inputType = reassignType === 'partial_detail' ? 'checkbox' : 'radio';
    const inputName = reassignType === 'partial_detail' ? 'selectedTrains' : 'selectedTrain';
    
    // Create train cards
    entry.trains.forEach((train, index) => {
        const trainCard = document.createElement('div');
        trainCard.className = 'train-selection-card';
        trainCard.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        trainCard.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" style="margin-right: 12px; transform: scale(1.3);">
                <label for="train_${index}" style="font-weight: 600; color: #2c3e50; font-size: 1.1em; cursor: pointer; flex: 1;">
                    🚂 ${train.trainNumber}
                </label>
            </div>
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                <strong>Route:</strong> ${train.startStation || 'Unknown'} → ${train.endStation || 'Unknown'}
            </div>
            <div style="color: #495057; font-size: 0.9em; font-weight: 500;">
                <strong>Time:</strong> ${train.startTime || 'Unknown'} - ${train.endTime || 'Unknown'}
            </div>
        `;
        
        // Add click handler
        trainCard.addEventListener('click', function(e) {
            // Don't trigger if clicking directly on input
            if (e.target.type === inputType) return;
            
            const checkbox = this.querySelector('input');
            
            if (inputType === 'radio') {
                // Clear all radio selections first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    updateTrainCardStyle(r.closest('.train-selection-card'), false);
                });
            }
            
            checkbox.checked = !checkbox.checked;
            updateTrainCardStyle(this, checkbox.checked);
            
            console.log(`🚂 Train ${train.trainNumber} ${checkbox.checked ? 'selected' : 'deselected'}`);
            updateReassignmentPreviewFixed();
        });
        
        // Add direct input change handler
        const input = trainCard.querySelector('input');
        input.addEventListener('change', function() {
            updateTrainCardStyle(trainCard, this.checked);
            updateReassignmentPreviewFixed();
        });
        
        container.appendChild(trainCard);
    });
    
    console.log('✅ Train selection populated successfully');
}

// 3. Helper function to update train card styling
function updateTrainCardStyle(card, isSelected) {
    if (isSelected) {
        card.style.borderColor = '#28a745';
        card.style.backgroundColor = '#f8fff9';
        card.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
    } else {
        card.style.borderColor = '#e9ecef';
        card.style.backgroundColor = 'white';
        card.style.boxShadow = 'none';
    }
}

// 4. Fixed preview update
function updateReassignmentPreviewFixed() {
    console.log('🔄 FIXED: Updating reassignment preview...');
    
    const previewDiv = document.getElementById('reassignmentPreview');
    const previewContent = document.getElementById('previewContent');
    const newMotorman = document.getElementById('newMotorman')?.value?.trim();
    
    if (!previewDiv || !previewContent) {
        console.warn('⚠️ Preview elements not found');
        return;
    }
    
    if (!newMotorman) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const selectedTrains = Array.from(document.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked'))
        .map(input => input.value);
    
    if (selectedTrains.length === 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    const remainingTrains = entry?.trains.filter(train => !selectedTrains.includes(train.trainNumber)) || [];
    
    let previewHTML = `
        <div style="margin-bottom: 12px;">
            <strong>🔄 ${newMotorman} will get:</strong><br>
            <span style="color: #28a745; font-weight: 600;">${selectedTrains.join(', ')}</span> (${selectedTrains.length} train${selectedTrains.length !== 1 ? 's' : ''})
        </div>
    `;
    
    if (remainingTrains.length > 0) {
        previewHTML += `
            <div>
                <strong>✅ ${entry.motormanName} will keep:</strong><br>
                <span style="color: #007bff; font-weight: 600;">${remainingTrains.map(t => t.trainNumber).join(', ')}</span> (${remainingTrains.length} train${remainingTrains.length !== 1 ? 's' : ''})
            </div>
        `;
    }
    
    previewContent.innerHTML = previewHTML;
    previewDiv.style.display = 'block';
    
    console.log('✅ Preview updated successfully');
}

// 5. Override the modal setup to ensure proper event listeners
function setupModalEventListenersFixed(modal) {
    console.log('🔧 Setting up FIXED modal event listeners...');
    
    // 1. Reassignment type change
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        // Remove any existing listeners
        reassignTypeSelect.removeEventListener('change', handleReassignmentTypeChange);
        
        // Add our fixed listener
        reassignTypeSelect.addEventListener('change', handleReassignmentTypeChangeFixed);
        console.log('✅ Fixed reassignment type listener added');
    }
    
    // 2. New motorman input for preview updates
    const newMotormanInput = modal.querySelector('#newMotorman');
    if (newMotormanInput) {
        newMotormanInput.addEventListener('input', updateReassignmentPreviewFixed);
        console.log('✅ New motorman input listener added');
    }
    
    // 3. Mode selection radio buttons
    const radioButtons = modal.querySelectorAll('input[name="reassignmentMode"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', onReassignmentModeChangeFixed);
    });
    
    // 4. Mode selection labels (for better UX)
    const modeLabels = modal.querySelectorAll('label[id*="ModeLabel"]');
    modeLabels.forEach(label => {
        label.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                onReassignmentModeChangeFixed();
            }
        });
    });
    
    console.log('✅ All fixed modal event listeners setup complete');
}

// 6. Fixed mode change handler
function onReassignmentModeChangeFixed() {
    console.log('🔄 FIXED: Processing reassignment mode change...');
    
    const checkedRadio = document.querySelector('input[name="reassignmentMode"]:checked');
    if (!checkedRadio) {
        console.warn('⚠️ No radio button checked');
        return;
    }
    
    const mode = checkedRadio.value;
    console.log('📋 Selected mode:', mode);
    
    const motormanSection = document.getElementById('motormanChangeSection');
    const detailSection = document.getElementById('detailChangeSection');
    
    if (!motormanSection || !detailSection) {
        console.error('❌ Mode sections not found');
        return;
    }
    
    // Update visual selection
    updateModeSelectionFixed(mode);
    
    if (mode === 'motorman_change') {
        motormanSection.style.display = 'block';
        detailSection.style.display = 'none';
        console.log('✅ Showing motorman section');
    } else if (mode === 'detail_change') {
        motormanSection.style.display = 'none';
        detailSection.style.display = 'block';
        console.log('✅ Showing detail section');
    }
}

// 7. Fixed mode selection visual update
function updateModeSelectionFixed(selectedMode) {
    console.log('🔄 Updating mode selection visuals to:', selectedMode);
    
    const motormanLabel = document.getElementById('motormanModeLabel');
    const detailLabel = document.getElementById('detailModeLabel');
    
    if (motormanLabel && detailLabel) {
        // Reset styles
        motormanLabel.style.borderColor = '#e9ecef';
        motormanLabel.style.boxShadow = 'none';
        detailLabel.style.borderColor = '#e9ecef';
        detailLabel.style.boxShadow = 'none';
        
        // Apply selected style
        if (selectedMode === 'motorman_change') {
            motormanLabel.style.borderColor = '#007bff';
            motormanLabel.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        } else if (selectedMode === 'detail_change') {
            detailLabel.style.borderColor = '#007bff';
            detailLabel.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        }
    }
}

// 8. Override the main modal creation function
function createModalWithWorkingCSSFixed(entry) {
    console.log('🔧 Creating FIXED enhanced modal...');
    
    // Store the data globally
    window.currentReassignmentData = { 
        entry, 
        index: window.currentAppearanceData.findIndex(e => e.detailId === entry.detailId) 
    };
    
    // Remove any existing modal
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Use the existing modal creation but ensure it has the train selection section
    createModalWithWorkingCSS(entry);
    
    // After modal is created, set up our fixed event listeners
    setTimeout(() => {
        const modal = document.getElementById('activeReassignmentModal');
        if (modal) {
            setupModalEventListenersFixed(modal);
            
            // Set initial mode
            onReassignmentModeChangeFixed();
        }
    }, 100);
}

// 9. Override the existing functions
function applyAllJFOFixes() {
    console.log('🔧 Applying ALL JFO fixes...');
    
    // Override existing functions with our fixed versions
    window.handleReassignmentTypeChange = handleReassignmentTypeChangeFixed;
    window.populateTrainSelection = populateTrainSelectionFixed;
    window.updateReassignmentPreview = updateReassignmentPreviewFixed;
    window.onReassignmentModeChange = onReassignmentModeChangeFixed;
    window.updateModeSelection = updateModeSelectionFixed;
    window.setupModalEventListeners = setupModalEventListenersFixed;
    
    // Enhanced modal creation
    window.showReassignmentModalFixed = function(detailId, index) {
        console.log(`🔄 FIXED: Opening reassignment modal for ${detailId}, index ${index}`);
        
        const entry = window.currentAppearanceData?.[index];
        if (!entry) {
            console.error(`❌ Entry not found at index ${index}`);
            showToast('❌ Detail not found', 'error');
            return;
        }
        
        createModalWithWorkingCSSFixed(entry);
    };
    
    // Update the table button event listeners to use the fixed function
    function updateReassignButtons() {
        const buttons = document.querySelectorAll('.reassign-btn, button[onclick*="showReassignmentModal"]');
        buttons.forEach(button => {
            const detailId = button.getAttribute('data-detail-id') || button.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            const index = parseInt(button.getAttribute('data-index')) || parseInt(button.getAttribute('onclick')?.match(/,\s*(\d+)/)?.[1]);
            
            if (detailId && !isNaN(index)) {
                // Remove existing onclick
                button.removeAttribute('onclick');
                
                // Add new click handler
                button.onclick = function() {
                    window.showReassignmentModalFixed(detailId, index);
                };
            }
        });
        
        console.log(`✅ Updated ${buttons.length} reassignment buttons`);
    }
    
    // Update buttons after any table refresh
    const originalDisplayFunction = window.displayAppearanceBookDebug || window.displayAppearanceBook;
    if (originalDisplayFunction) {
        window.displayAppearanceBookDebug = function(data) {
            originalDisplayFunction(data);
            setTimeout(updateReassignButtons, 100);
        };
        
        window.displayAppearanceBook = function(data) {
            originalDisplayFunction(data);
            setTimeout(updateReassignButtons, 100);
        };
    }
    
    // Update any existing buttons
    setTimeout(updateReassignButtons, 500);
    
    console.log('✅ All JFO fixes applied successfully!');
    showToast('🔧 JFO reassignment fixes applied! Partial train selection should now work.', 'success', 4000);
}

// 10. Auto-apply the fixes
applyAllJFOFixes();

// 11. Add console commands for testing
window.jfoFixedDebug = {
    testModal: function(index = 0) {
        if (window.currentAppearanceData && window.currentAppearanceData[index]) {
            window.showReassignmentModalFixed(window.currentAppearanceData[index].detailId, index);
        } else {
            console.log('❌ No data available. Load appearance book first.');
        }
    },
    
    checkFixes: function() {
        console.log('🔍 Checking applied fixes:');
        console.log('- handleReassignmentTypeChange:', typeof window.handleReassignmentTypeChange);
        console.log('- populateTrainSelection:', typeof window.populateTrainSelection);
        console.log('- updateReassignmentPreview:', typeof window.updateReassignmentPreview);
        console.log('- showReassignmentModalFixed:', typeof window.showReassignmentModalFixed);
    },
    
    reapplyFixes: function() {
        applyAllJFOFixes();
    }
};

console.log('✅ JFO Reassignment fixes loaded successfully!');
console.log('🎯 Commands available:');
console.log('   window.jfoFixedDebug.testModal(0) - Test modal with first entry');
console.log('   window.jfoFixedDebug.checkFixes() - Check if fixes are applied');
console.log('   window.jfoFixedDebug.reapplyFixes() - Reapply all fixes');

// TARGETED FIX for JFO Issues
// Add this to the END of jfo-script.js AFTER your existing fixes

console.log('🎯 Applying TARGETED JFO fixes for specific issues...');

// 1. DEBUG: Check what's wrong with the reassignment type detection
function debugReassignmentType() {
    const modal = document.getElementById('activeReassignmentModal');
    if (!modal) {
        console.log('❌ No modal found');
        return;
    }
    
    const reassignTypeSelect = modal.querySelector('#reassignType');
    console.log('🔍 DEBUG Reassignment Type Element:');
    console.log('- Element exists:', !!reassignTypeSelect);
    console.log('- Element ID:', reassignTypeSelect?.id);
    console.log('- Element value:', reassignTypeSelect?.value);
    console.log('- Element innerHTML:', reassignTypeSelect?.innerHTML);
    
    // Check all select options
    if (reassignTypeSelect) {
        const options = reassignTypeSelect.querySelectorAll('option');
        console.log('📋 Available options:');
        options.forEach((option, index) => {
            console.log(`  ${index}: value="${option.value}" text="${option.textContent}"`);
        });
    }
    
    return reassignTypeSelect;
}

// 2. FIXED reassignment type change handler with better debugging
function handleReassignmentTypeChangeSuperFixed() {
    console.log('🔄 SUPER FIXED reassignment type change handler called');
    
    const modal = document.getElementById('activeReassignmentModal');
    if (!modal) {
        console.error('❌ Modal not found');
        return;
    }
    
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (!reassignTypeSelect) {
        console.error('❌ Reassignment type select not found');
        return;
    }
    
    const reassignType = reassignTypeSelect.value;
    console.log('📋 Selected reassignment type:', `"${reassignType}"`);
    
    const trainSelectionSection = modal.querySelector('#trainSelectionSection');
    console.log('📋 Train selection section exists:', !!trainSelectionSection);
    
    if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
        console.log('✅ Should show train selection for type:', reassignType);
        
        if (trainSelectionSection) {
            trainSelectionSection.style.display = 'block';
            console.log('✅ Train selection section made visible');
            
            // Force populate trains
            setTimeout(() => {
                populateTrainSelectionSuperFixed();
            }, 100);
        } else {
            console.error('❌ Train selection section not found in modal');
            console.log('🔍 Available elements in modal:', modal.querySelectorAll('*[id]'));
        }
    } else {
        console.log('ℹ️ Hiding train selection section for type:', reassignType);
        if (trainSelectionSection) {
            trainSelectionSection.style.display = 'none';
        }
    }
}

// 3. SUPER FIXED train population with extensive debugging
function populateTrainSelectionSuperFixed() {
    console.log('🚂 SUPER FIXED: Populating train selection...');
    
    const modal = document.getElementById('activeReassignmentModal');
    const container = modal?.querySelector('#trainCheckboxContainer');
    const reassignTypeSelect = modal?.querySelector('#reassignType');
    const reassignType = reassignTypeSelect?.value;
    
    console.log('🔍 Debug info:');
    console.log('- Modal exists:', !!modal);
    console.log('- Container exists:', !!container);
    console.log('- ReassignType select exists:', !!reassignTypeSelect);
    console.log('- Current reassignType:', `"${reassignType}"`);
    console.log('- Current reassignment data:', !!window.currentReassignmentData);
    console.log('- Entry data:', !!window.currentReassignmentData?.entry);
    console.log('- Trains data:', window.currentReassignmentData?.entry?.trains?.length || 0);
    
    if (!container) {
        console.error('❌ Train container not found');
        console.log('🔍 Looking for container with different selectors...');
        
        // Try different selectors
        const altContainer = modal?.querySelector('[id*="train"]') || modal?.querySelector('[id*="checkbox"]');
        console.log('🔍 Alternative container found:', !!altContainer);
        
        if (altContainer) {
            console.log('🔍 Alternative container ID:', altContainer.id);
        }
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    if (!entry?.trains || entry.trains.length === 0) {
        console.error('❌ No trains data available');
        console.log('🔍 Entry details:', {
            hasEntry: !!entry,
            hasTrains: !!entry?.trains,
            trainCount: entry?.trains?.length || 0,
            detailId: entry?.detailId,
            motormanName: entry?.motormanName
        });
        
        container.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center; background: #fee; border-radius: 8px;">
                <h4>❌ No Trains Available</h4>
                <p>Detail: ${entry?.detailNumber || 'Unknown'}</p>
                <p>Motorman: ${entry?.motormanName || 'Unknown'}</p>
                <p>Trains: ${entry?.trains?.length || 0}</p>
                <button onclick="window.debugReassignmentType()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; margin-top: 10px;">
                    🔍 Debug Info
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`✅ Found ${entry.trains.length} trains to display`);
    
    // Clear and populate container
    container.innerHTML = '';
    
    const inputType = reassignType === 'partial_detail' ? 'checkbox' : 'radio';
    const inputName = reassignType === 'partial_detail' ? 'selectedTrains' : 'selectedTrain';
    
    console.log(`🔧 Using ${inputType} inputs with name "${inputName}"`);
    
    // Add header
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 15px; padding: 10px; background: #e7f3ff; border-radius: 6px; color: #004085;';
    header.innerHTML = `
        <strong>🚂 Select Trains for Reassignment:</strong><br>
        <small>Found ${entry.trains.length} trains for ${entry.motormanName}</small>
    `;
    container.appendChild(header);
    
    // Create train cards
    entry.trains.forEach((train, index) => {
        console.log(`🚂 Creating card ${index + 1}: ${train.trainNumber}`);
        
        const trainCard = document.createElement('div');
        trainCard.className = 'train-selection-card';
        trainCard.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        trainCard.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="${inputType}" name="${inputName}" value="${train.trainNumber}" 
                       id="train_${index}" style="margin-right: 12px; transform: scale(1.5); accent-color: #28a745;">
                <label for="train_${index}" style="font-weight: 600; color: #2c3e50; font-size: 1.1em; cursor: pointer; flex: 1;">
                    🚂 ${train.trainNumber}
                </label>
            </div>
            <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                <strong>Route:</strong> ${train.startStation || 'Unknown'} → ${train.endStation || 'Unknown'}
            </div>
            <div style="color: #495057; font-size: 0.9em; font-weight: 500;">
                <strong>Time:</strong> ${train.startTime || 'Unknown'} - ${train.endTime || 'Unknown'}
            </div>
        `;
        
        // Add click handler for the entire card
        trainCard.addEventListener('click', function(e) {
            if (e.target.type === inputType) return; // Don't double-trigger
            
            const checkbox = this.querySelector('input');
            
            if (inputType === 'radio') {
                // Clear all radio selections first
                container.querySelectorAll('input[type="radio"]').forEach(r => {
                    r.checked = false;
                    r.closest('.train-selection-card').style.borderColor = '#e9ecef';
                    r.closest('.train-selection-card').style.backgroundColor = 'white';
                });
            }
            
            checkbox.checked = !checkbox.checked;
            
            // Update visual state
            if (checkbox.checked) {
                this.style.borderColor = '#28a745';
                this.style.backgroundColor = '#f8fff9';
                this.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.backgroundColor = 'white';
                this.style.boxShadow = 'none';
            }
            
            console.log(`🚂 Train ${train.trainNumber} ${checkbox.checked ? 'selected' : 'deselected'}`);
            updatePreviewSuperFixed();
        });
        
        // Add direct input change handler
        const input = trainCard.querySelector('input');
        input.addEventListener('change', function() {
            console.log(`🚂 Direct input change: ${train.trainNumber} = ${this.checked}`);
            updatePreviewSuperFixed();
        });
        
        container.appendChild(trainCard);
    });
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = 'margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 6px; color: #856404; font-size: 0.9em;';
    instructions.innerHTML = inputType === 'checkbox' ? 
        '💡 Select multiple trains to transfer to the new motorman. Remaining trains stay with current motorman.' :
        '💡 Select one specific train to reassign to the new motorman.';
    container.appendChild(instructions);
    
    console.log('✅ Train selection populated successfully');
}

// 4. Super fixed preview update
function updatePreviewSuperFixed() {
    console.log('🔄 SUPER FIXED: Updating preview...');
    
    const modal = document.getElementById('activeReassignmentModal');
    const previewDiv = modal?.querySelector('#reassignmentPreview');
    const previewContent = modal?.querySelector('#previewContent');
    const newMotormanInput = modal?.querySelector('#newMotorman');
    
    if (!previewDiv || !previewContent) {
        console.warn('⚠️ Preview elements not found');
        return;
    }
    
    const newMotorman = newMotormanInput?.value?.trim();
    if (!newMotorman) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const selectedTrains = Array.from(modal.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked'))
        .map(input => input.value);
    
    console.log(`📋 Preview: ${selectedTrains.length} trains selected`);
    
    if (selectedTrains.length === 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    const entry = window.currentReassignmentData?.entry;
    const remainingTrains = entry?.trains.filter(train => !selectedTrains.includes(train.trainNumber)) || [];
    
    let previewHTML = `
        <div style="margin-bottom: 12px;">
            <strong>🔄 ${newMotorman} will get:</strong><br>
            <span style="color: #28a745; font-weight: 600;">${selectedTrains.join(', ')}</span> (${selectedTrains.length} train${selectedTrains.length !== 1 ? 's' : ''})
        </div>
    `;
    
    if (remainingTrains.length > 0) {
        previewHTML += `
            <div>
                <strong>✅ ${entry.motormanName} will keep:</strong><br>
                <span style="color: #007bff; font-weight: 600;">${remainingTrains.map(t => t.trainNumber).join(', ')}</span> (${remainingTrains.length} train${remainingTrains.length !== 1 ? 's' : ''})
            </div>
        `;
    }
    
    previewContent.innerHTML = previewHTML;
    previewDiv.style.display = 'block';
    
    console.log('✅ Preview updated');
}

// 5. Force the modal to default to motorman mode
function fixModalDefaultMode() {
    console.log('🔧 Fixing modal default mode...');
    
    const modal = document.getElementById('activeReassignmentModal');
    if (!modal) return;
    
    // Force select motorman mode
    const motormanRadio = modal.querySelector('input[value="motorman_change"]');
    const detailRadio = modal.querySelector('input[value="detail_change"]');
    
    if (motormanRadio && detailRadio) {
        motormanRadio.checked = true;
        detailRadio.checked = false;
        
        // Trigger the mode change
        setTimeout(() => {
            onReassignmentModeChangeFixed();
        }, 100);
        
        console.log('✅ Forced motorman mode selection');
    }
}

// 6. Enhanced setup function
function setupModalSuperFixed() {
    console.log('🔧 Setting up SUPER FIXED modal...');
    
    const modal = document.getElementById('activeReassignmentModal');
    if (!modal) {
        console.error('❌ Modal not found for setup');
        return;
    }
    
    // 1. Fix default mode
    fixModalDefaultMode();
    
    // 2. Setup reassignment type listener
    const reassignTypeSelect = modal.querySelector('#reassignType');
    if (reassignTypeSelect) {
        reassignTypeSelect.addEventListener('change', handleReassignmentTypeChangeSuperFixed);
        console.log('✅ Reassignment type listener added');
    }
    
    // 3. Setup new motorman listener for preview
    const newMotormanInput = modal.querySelector('#newMotorman');
    if (newMotormanInput) {
        newMotormanInput.addEventListener('input', updatePreviewSuperFixed);
        console.log('✅ New motorman listener added');
    }
    
    // 4. Setup mode radio listeners
    const radioButtons = modal.querySelectorAll('input[name="reassignmentMode"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', onReassignmentModeChangeFixed);
    });
    
    console.log('✅ Super fixed modal setup complete');
}

// 7. Enhanced modal creation override
function createModalSuperFixed(entry) {
    console.log('🔧 Creating SUPER FIXED modal...');
    
    // Store data
    window.currentReassignmentData = { 
        entry, 
        index: window.currentAppearanceData.findIndex(e => e.detailId === entry.detailId) 
    };
    
    // Use existing modal creation
    createModalWithWorkingCSS(entry);
    
    // Apply super fixes after modal is ready
    setTimeout(() => {
        setupModalSuperFixed();
    }, 200);
}

// 8. Apply all super fixes
function applySuperFixes() {
    console.log('🚀 Applying SUPER FIXES...');
    
    // Override functions
    window.handleReassignmentTypeChange = handleReassignmentTypeChangeSuperFixed;
    window.populateTrainSelection = populateTrainSelectionSuperFixed;
    window.updateReassignmentPreview = updatePreviewSuperFixed;
    window.debugReassignmentType = debugReassignmentType;
    
    // Enhanced show modal function
    window.showReassignmentModalSuperFixed = function(detailId, index) {
        console.log(`🚀 SUPER FIXED: Opening modal for ${detailId}, index ${index}`);
        
        const entry = window.currentAppearanceData?.[index];
        if (!entry) {
            console.error(`❌ Entry not found at index ${index}`);
            showToast('❌ Detail not found', 'error');
            return;
        }
        
        createModalSuperFixed(entry);
    };
    
    // Update all reassignment buttons to use super fixed function
    function updateAllReassignButtons() {
        const buttons = document.querySelectorAll('button[onclick*="showReassignmentModal"], .reassign-btn');
        let updated = 0;
        
        buttons.forEach(button => {
            const onclick = button.getAttribute('onclick');
            if (onclick && onclick.includes('showReassignmentModal')) {
                // Extract parameters from onclick
                const match = onclick.match(/showReassignmentModal\('([^']+)',\s*(\d+)\)/);
                if (match) {
                    const detailId = match[1];
                    const index = parseInt(match[2]);
                    
                    // Replace with super fixed function
                    button.removeAttribute('onclick');
                    button.onclick = function() {
                        window.showReassignmentModalSuperFixed(detailId, index);
                    };
                    updated++;
                }
            }
        });
        
        console.log(`✅ Updated ${updated} reassignment buttons with super fixes`);
    }
    
    // Update buttons now and after any table refresh
    updateAllReassignButtons();
    
    // Hook into display functions
    const originalDisplay = window.displayAppearanceBookDebug || window.displayAppearanceBook;
    if (originalDisplay) {
        window.displayAppearanceBookDebug = function(data) {
            originalDisplay(data);
            setTimeout(updateAllReassignButtons, 100);
        };
    }
    
    console.log('🚀 SUPER FIXES applied successfully!');
    showToast('🚀 Super fixes applied! Try reassignment now.', 'success', 3000);
}

// 9. Auto-apply super fixes
applySuperFixes();

// 10. Debug commands
window.jfoSuperDebug = {
    testModal: function(index = 0) {
        if (window.currentAppearanceData && window.currentAppearanceData[index]) {
            window.showReassignmentModalSuperFixed(window.currentAppearanceData[index].detailId, index);
        } else {
            console.log('❌ Load appearance book first');
        }
    },
    
    checkReassignType: function() {
        debugReassignmentType();
    },
    
    forceTrainSelection: function() {
        populateTrainSelectionSuperFixed();
    },
    
    checkModal: function() {
        const modal = document.getElementById('activeReassignmentModal');
        console.log('🔍 Modal check:', {
            exists: !!modal,
            reassignSelect: !!modal?.querySelector('#reassignType'),
            trainSection: !!modal?.querySelector('#trainSelectionSection'),
            trainContainer: !!modal?.querySelector('#trainCheckboxContainer')
        });
    }
};

console.log('🚀 SUPER FIXES loaded!');
console.log('🎯 Test commands:');
console.log('   window.jfoSuperDebug.testModal(0) - Test modal');
console.log('   window.jfoSuperDebug.checkReassignType() - Debug type selection');
console.log('   window.jfoSuperDebug.forceTrainSelection() - Force show trains');
console.log('   window.jfoSuperDebug.checkModal() - Check modal elements');

// JFO BACKEND INTEGRATION FIX
// Add this to the END of jfo-script.js

console.log('🔗 Applying Backend Integration Fix...');

// 1. FIXED form data collection with better validation
function processMotormanReassignmentWithBackend() {
    console.log('👤 BACKEND: Processing motorman reassignment...');
    
    try {
        const modal = document.getElementById('activeReassignmentModal');
        if (!modal) {
            showToast('❌ Modal not found', 'error');
            return;
        }
        
        // Get form values with detailed logging
        const reassignTypeElement = modal.querySelector('#reassignType');
        const newMotormanElement = modal.querySelector('#newMotorman');
        const reasonElement = modal.querySelector('#reassignReason');
        const officeElement = modal.querySelector('#reassignOffice, #newOffice');
        const notesElement = modal.querySelector('#reassignNotes');
        
        console.log('🔍 Form elements found:', {
            reassignType: !!reassignTypeElement,
            newMotorman: !!newMotormanElement,
            reason: !!reasonElement,
            office: !!officeElement,
            notes: !!notesElement
        });
        
        // Extract values
        const reassignType = reassignTypeElement?.value?.trim();
        const newMotorman = newMotormanElement?.value?.trim();
        const reason = reasonElement?.value?.trim();
        const office = officeElement?.value?.trim() || 'CSMT';
        const notes = notesElement?.value?.trim() || '';
        
        console.log('📋 BACKEND Form values:', {
            reassignType,
            newMotorman,
            reason,
            office,
            notes
        });
        
        // Enhanced validation with specific error messages
        if (!reassignType) {
            showToast('⚠️ Please select reassignment type', 'warning');
            reassignTypeElement?.focus();
            return;
        }
        
        if (!newMotorman) {
            showToast('⚠️ Please enter new motorman name', 'warning');
            newMotormanElement?.focus();
            return;
        }
        
        if (!reason) {
            showToast('⚠️ Please select a reason', 'warning');
            reasonElement?.focus();
            return;
        }
        
        // Get selected trains for partial reassignments
        let selectedTrains = [];
        if (reassignType === 'partial_detail' || reassignType === 'specific_trains') {
            const trainInputs = modal.querySelectorAll('input[name="selectedTrains"]:checked, input[name="selectedTrain"]:checked');
            selectedTrains = Array.from(trainInputs).map(input => input.value);
            
            console.log(`🚂 BACKEND Selected trains: ${selectedTrains.length}`, selectedTrains);
            
            if (selectedTrains.length === 0) {
                showToast(`⚠️ Please select at least one train for ${reassignType.replace('_', ' ')}`, 'warning');
                return;
            }
        }
        
        // Check current reassignment data
        if (!window.currentReassignmentData?.entry) {
            showToast('❌ No detail data found', 'error');
            return;
        }
        
        const entry = window.currentReassignmentData.entry;
        
        // Prepare comprehensive reassignment data for backend
        const reassignmentData = {
            // Detail information
            detailId: entry.detailId,
            detailNumber: entry.detailNumber,
            originalMotorman: entry.motormanName,
            originalOffice: entry.office,
            
            // New assignment
            newMotorman: newMotorman,
            newOffice: office,
            
            // Reassignment details
            reassignmentType: reassignType,
            selectedTrains: selectedTrains,
            reason: reason,
            notes: notes,
            
            // Metadata
            date: currentDate || new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            createdBy: 'JFO Supervisor',
            
            // Additional data for processing
            totalTrains: entry.trains?.length || 0,
            allTrains: entry.trains?.map(t => t.trainNumber) || []
        };
        
        console.log('📋 BACKEND Complete reassignment data:', reassignmentData);
        
        // Show processing feedback
        showToast('🔄 Processing reassignment...', 'info', 2000);
        
        // Send to backend
        sendReassignmentToBackend(reassignmentData);
        
    } catch (error) {
        console.error('❌ Error in backend reassignment processing:', error);
        showToast('❌ Error processing reassignment', 'error');
    }
}

// 2. Backend communication function
async function sendReassignmentToBackend(reassignmentData) {
    console.log('📡 Sending reassignment to backend...');
    
    try {
        showLoading();
        
        const response = await fetch('/api/jfo/reassignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reassignmentData)
        });
        
        console.log('📡 Backend response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Backend response:', result);
        
        // Close modal
        closeReassignmentModal();
        
        // Show detailed success message
        const successMessage = createSuccessMessage(reassignmentData);
        showToast(successMessage, 'success', 6000);
        
        // Update local data (for immediate UI feedback)
        updateLocalAppearanceData(reassignmentData);
        
        // Refresh the display
        if (window.currentAppearanceData) {
            displayAppearanceBookDebug(window.currentAppearanceData);
            if (window.updateSummaryCards && window.calculateSummaryStats) {
                updateSummaryCards(calculateSummaryStats(window.currentAppearanceData));
            }
        }
        
        // Show confirmation modal
        setTimeout(() => {
            showReassignmentSuccessModal(reassignmentData, result);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Backend communication error:', error);
        showToast(`❌ Failed to process reassignment: ${error.message}`, 'error', 8000);
    } finally {
        hideLoading();
    }
}

// 3. Create success message
function createSuccessMessage(reassignmentData) {
    const actionDesc = {
        'full_detail': 'Full detail transfer',
        'partial_detail': 'Partial detail transfer',
        'specific_trains': 'Specific train reassignment'
    }[reassignmentData.reassignmentType] || 'Reassignment';
    
    let message = `✅ ${actionDesc} completed!\n📋 Detail ${reassignmentData.detailNumber}\n👤 ${reassignmentData.originalMotorman} → ${reassignmentData.newMotorman}`;
    
    if (reassignmentData.selectedTrains && reassignmentData.selectedTrains.length > 0) {
        message += `\n🚂 Trains: ${reassignmentData.selectedTrains.join(', ')}`;
    }
    
    return message;
}

// 4. Update local data for immediate UI feedback
function updateLocalAppearanceData(reassignmentData) {
    console.log('🔄 Updating local appearance data...');
    
    const entryIndex = window.currentReassignmentData?.index;
    if (entryIndex === undefined || !window.currentAppearanceData?.[entryIndex]) {
        console.warn('⚠️ Could not find entry to update locally');
        return;
    }
    
    const entry = window.currentAppearanceData[entryIndex];
    
    // Add reassignment record
    if (!entry.reassignments) {
        entry.reassignments = [];
    }
    
    entry.reassignments.push({
        id: `backend_${Date.now()}`,
        type: reassignmentData.reassignmentType,
        reason: reassignmentData.reason,
        notes: reassignmentData.notes,
        originalMotorman: reassignmentData.originalMotorman,
        newMotorman: reassignmentData.newMotorman,
        selectedTrains: reassignmentData.selectedTrains || [],
        createdAt: reassignmentData.timestamp,
        createdBy: reassignmentData.createdBy,
        backendProcessed: true
    });
    
    // Update entry status
    entry.hasReassignments = true;
    
    // Update based on reassignment type
    if (reassignmentData.reassignmentType === 'full_detail') {
        entry.motormanName = reassignmentData.newMotorman;
        entry.office = reassignmentData.newOffice;
    } else if (reassignmentData.selectedTrains && reassignmentData.selectedTrains.length > 0) {
        const remainingCount = entry.trains.length - reassignmentData.selectedTrains.length;
        if (remainingCount > 0) {
            entry.motormanName = `${reassignmentData.originalMotorman} (${remainingCount}/${entry.trains.length} trains)`;
        } else {
            entry.motormanName = reassignmentData.newMotorman;
        }
    }
    
    console.log('✅ Local data updated');
}

// 5. Success confirmation modal
function showReassignmentSuccessModal(reassignmentData, backendResult) {
    const modal = document.createElement('div');
    modal.id = 'reassignmentSuccessModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const isPartial = reassignmentData.selectedTrains && reassignmentData.selectedTrains.length > 0;
    const actionType = {
        'full_detail': 'Full Detail Transfer',
        'partial_detail': 'Partial Detail Transfer',
        'specific_trains': 'Specific Train Reassignment'
    }[reassignmentData.reassignmentType] || 'Reassignment';
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div style="font-size: 4em; margin-bottom: 20px; color: #28a745;">✅</div>
            <h2 style="color: #28a745; margin-bottom: 20px;">Reassignment Successful!</h2>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #155724; margin-bottom: 15px;">📋 Reassignment Details</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong>Detail Number:</strong><br>
                        ${reassignmentData.detailNumber}
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong>Type:</strong><br>
                        ${actionType}
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong>Original Motorman:</strong><br>
                        ${reassignmentData.originalMotorman}
                    </div>
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong>New Motorman:</strong><br>
                        ${reassignmentData.newMotorman}
                    </div>
                </div>
                
                ${isPartial ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <strong>🚂 Reassigned Trains:</strong><br>
                        ${reassignmentData.selectedTrains.join(', ')} (${reassignmentData.selectedTrains.length} trains)
                    </div>
                ` : ''}
                
                <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <strong>Reason:</strong> ${reassignmentData.reason}<br>
                    <strong>Date:</strong> ${reassignmentData.date}<br>
                    <strong>Time:</strong> ${new Date(reassignmentData.timestamp).toLocaleTimeString()}
                </div>
                
                ${reassignmentData.notes ? `
                    <div style="background: white; padding: 12px; border-radius: 6px;">
                        <strong>Notes:</strong><br>
                        ${reassignmentData.notes}
                    </div>
                ` : ''}
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>💾 Database Updated:</strong> Reassignment has been saved to the database and will persist on reload.
            </div>
            
            <button onclick="closeReassignmentSuccessModal()" style="
                padding: 15px 30px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.1em;
                font-weight: 600;
            ">
                ✅ Perfect!
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        closeReassignmentSuccessModal();
    }, 10000);
}

// 6. Close success modal
function closeReassignmentSuccessModal() {
    const modal = document.getElementById('reassignmentSuccessModal');
    if (modal) {
        modal.remove();
    }
}

// 7. Apply backend integration fixes
function applyBackendIntegrationFixes() {
    console.log('🔗 Applying backend integration fixes...');
    
    // Override the main processing function to use backend
    window.processMotormanReassignment = processMotormanReassignmentWithBackend;
    window.processMotormanReassignmentFixed = processMotormanReassignmentWithBackend;
    
    // Make functions globally accessible
    window.sendReassignmentToBackend = sendReassignmentToBackend;
    window.updateLocalAppearanceData = updateLocalAppearanceData;
    window.showReassignmentSuccessModal = showReassignmentSuccessModal;
    window.closeReassignmentSuccessModal = closeReassignmentSuccessModal;
    
    console.log('✅ Backend integration fixes applied');
    showToast('🔗 Backend integration enabled! Reassignments will now save to database.', 'success', 4000);
}

// 8. Auto-apply backend fixes
applyBackendIntegrationFixes();

// 9. Debug commands for backend testing
window.jfoBackendDebug = {
    testBackendConnection: async function() {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            console.log('✅ Backend connection test:', result);
            showToast('✅ Backend connection successful', 'success');
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            showToast('❌ Backend connection failed', 'error');
        }
    },
    
    checkReassignmentEndpoint: async function() {
        try {
            // Test with dummy data
            const testData = {
                detailNumber: 'TEST',
                newMotorman: 'Test Motorman',
                reason: 'Test',
                date: new Date().toISOString().split('T')[0]
            };
            
            const response = await fetch('/api/jfo/reassignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });
            
            console.log('📡 Reassignment endpoint test status:', response.status);
            const result = await response.json();
            console.log('📡 Reassignment endpoint response:', result);
            
        } catch (error) {
            console.error('❌ Reassignment endpoint test failed:', error);
        }
    }
};

console.log('🔗 Backend integration fix loaded!');
console.log('🎯 Test commands:');
console.log('   window.jfoBackendDebug.testBackendConnection() - Test backend');
console.log('   window.jfoBackendDebug.checkReassignmentEndpoint() - Test reassignment API');

// ENHANCED APPEARANCE BOOK TABLE WITH REASSIGNMENT STATUS - FIXED VERSION
// Add this to jfo-script.js to enhance the existing table

console.log('🔄 Enhancing Appearance Book Table with Reassignment Status...');

// Helper function to safely parse selected trains data
function parseSelectedTrains(selectedTrainsData) {
    if (!selectedTrainsData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(selectedTrainsData)) {
        return selectedTrainsData;
    }
    
    // Try to parse as JSON first
    try {
        const parsed = JSON.parse(selectedTrainsData);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        // If JSON parsing fails, treat as comma-separated string
        console.log('📝 Parsing selected_trains as comma-separated string:', selectedTrainsData);
        return selectedTrainsData.split(',').map(train => train.trim()).filter(train => train.length > 0);
    }
}

// 1. Enhanced data loading function that includes reassignment status
async function loadAppearanceBookWithReassignmentStatus(date) {
    console.log(`📊 Loading appearance book with reassignment status for ${date}...`);
    
    try {
        showLoading();
        
        // Load original roster data
        const response = await fetch(`/api/roster?date=${encodeURIComponent(date)}`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        const result = await response.json();
        const rosterData = result.data || [];
        
        if (rosterData.length === 0) {
            displayEnhancedAppearanceBook([]);
            updateSummaryCards({ total: 0, waiting: 0, reassigned: 0, totalReassignments: 0 });
            showToast('ℹ️ No duty roster data found', 'info');
            return;
        }
        
        // Transform roster data with real trains and reassignment status
        const enhancedAppearanceData = await transformRosterWithReassignmentStatus(rosterData, date);
        
        console.log(`✅ Enhanced data loaded: ${enhancedAppearanceData.length} entries`);
        
        // Display enhanced table
        displayEnhancedAppearanceBook(enhancedAppearanceData);
        
        const summaryStats = calculateEnhancedSummaryStats(enhancedAppearanceData);
        updateSummaryCards(summaryStats);
        
        showToast(`✅ Loaded ${enhancedAppearanceData.length} details with reassignment status`, 'success');
        
    } catch (error) {
        console.error('❌ Enhanced loading failed:', error);
        showToast(`❌ Failed to load appearance book: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function transformRosterWithReassignmentStatus(rosterData, date) {
    console.log('🔄 FIXED: Creating separate entries for each detail - Better UX...');
    
    // Get reassignment data for this date
    const reassignmentData = await fetchReassignmentDataForDate(date);
    
    const enhancedEntries = [];
    
    // Group data by motorman to track multiple details
    const motormanGroups = {};
    rosterData.forEach(record => {
      const motormanName = record.motorman_name;
      if (!motormanGroups[motormanName]) {
        motormanGroups[motormanName] = [];
      }
      motormanGroups[motormanName].push(record);
    });
  
    // Process each roster record as a separate detail entry
    for (const record of rosterData) {
      const { detail_number, motorman_name, office, motorman_id } = record;
      
      // Check if this motorman has multiple details
      const motormanDetailCount = motormanGroups[motorman_name].length;
      const isMultipleDetails = motormanDetailCount > 1;
      
      // Get all detail numbers for this motorman (for display)
      const allMotormanDetails = motormanGroups[motorman_name].map(r => r.detail_number);
      
      console.log(`🔄 Processing Detail ${detail_number} for ${motorman_name} ${isMultipleDetails ? `(${motormanDetailCount} details total)` : ''}`);
  
      // Get trains and detail info for THIS specific detail
      const trainAndDetailData = await fetchRealTrainsAndDetails(detail_number, office);
      
      // Check for reassignments affecting this specific detail
      const detailReassignments = reassignmentData.filter(r => r.detail_number === detail_number);
      const hasReassignments = detailReassignments.length > 0;
      
      // Calculate current status for this detail
      const status = calculateSingleDetailStatus(record, detailReassignments);
      const currentTrains = calculateCurrentTrains(trainAndDetailData.trains, detailReassignments);
      const changesInfo = calculateChangesInfo(detailReassignments);
      
      const entry = {
        detailId: `${office}-${detail_number}`,
        detailNumber: detail_number,
        motormanName: motorman_name,
        motormanId: motorman_id,
        office: office,
        signOnTime: trainAndDetailData.signOnTime,
        signOffTime: trainAndDetailData.signOffTime,
        trains: trainAndDetailData.trains,
        totalTrains: trainAndDetailData.trains.length,
        
        // Multiple details info for display
        isMultipleDetails: isMultipleDetails,
        motormanDetailCount: motormanDetailCount,
        allMotormanDetails: allMotormanDetails,
        detailDisplayName: isMultipleDetails ? 
          `Detail ${detail_number} (${allMotormanDetails.indexOf(detail_number) + 1}/${motormanDetailCount})` : 
          `Detail ${detail_number}`,
        
        // Enhanced status information
        status: status.type,
        statusDisplay: status.display,
        statusColor: status.color,
        
        // Current effective assignment
        currentMotorman: status.currentMotorman,
        currentTrains: currentTrains,
        currentTrainCount: currentTrains.length,
        
        // Reassignment information
        hasReassignments: hasReassignments,
        reassignments: detailReassignments,
        changesInfo: changesInfo,
        
        // For compatibility
        effectiveAssignment: {
          motormanName: status.currentMotorman,
          assignedTrains: currentTrains.map(t => t.trainNumber),
          reassignmentType: hasReassignments ? 'modified' : 'original'
        }
      };
      
      console.log(`✅ Created separate entry: ${motorman_name} - Detail ${detail_number} (${trainAndDetailData.trains.length} trains)`);
      enhancedEntries.push(entry);
    }
  
    // Sort by motorman name, then by detail number for grouped display
    const sortedEntries = enhancedEntries.sort((a, b) => {
      if (a.motormanName !== b.motormanName) {
        return a.motormanName.localeCompare(b.motormanName);
      }
      return a.detailNumber.localeCompare(b.detailNumber);
    });
    
    console.log(`🎉 Created ${enhancedEntries.length} separate detail entries`);
    return sortedEntries;
  }
  
  // Helper function for single detail status
  function calculateSingleDetailStatus(record, reassignments) {
    if (reassignments.length === 0) {
      return {
        type: 'original',
        display: '✅ Original',
        color: '#28a745',
        currentMotorman: record.motorman_name
      };
    }
  
    // Check for full detail reassignments
    const fullReassignment = reassignments.find(r => r.reassignment_type === 'full_detail');
    if (fullReassignment) {
      return {
        type: 'reassigned_full',
        display: '🔄 Fully Reassigned',
        color: '#dc3545',
        currentMotorman: fullReassignment.new_motorman
      };
    }
  
    // Check for partial reassignments
    const partialReassignments = reassignments.filter(r => 
      r.reassignment_type === 'partial_detail' || r.reassignment_type === 'specific_trains'
    );
  
    if (partialReassignments.length > 0) {
      return {
        type: 'reassigned_partial',
        display: '🔄 Partially Reassigned',
        color: '#ffc107',
        currentMotorman: record.motorman_name
      };
    }
  
    return {
      type: 'modified',
      display: '🔄 Modified',
      color: '#17a2b8',
      currentMotorman: record.motorman_name
    };
  }

// 3. Fetch reassignment data for a specific date
async function fetchReassignmentDataForDate(date) {
    try {
        const response = await fetch(`/api/jfo/reassignments?date=${encodeURIComponent(date)}`);
        if (!response.ok) {
            console.log('ℹ️ No reassignment data found for date');
            return [];
        }
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.warn('⚠️ Could not fetch reassignment data:', error.message);
        return [];
    }
}

// 4. Calculate detail status based on reassignments
function calculateDetailStatus(motormanGroup, reassignments) {
    if (reassignments.length === 0) {
      return {
        type: 'original',
        display: '✅ Original',
        color: '#28a745',
        currentMotorman: motormanGroup.motormanName
      };
    }
  
    // Check for full detail reassignments
    const fullReassignment = reassignments.find(r => r.reassignment_type === 'full_detail');
    if (fullReassignment) {
      return {
        type: 'reassigned_full',
        display: '🔄 Fully Reassigned',
        color: '#dc3545',
        currentMotorman: fullReassignment.new_motorman
      };
    }
  
    // Check for partial reassignments
    const partialReassignments = reassignments.filter(r => 
      r.reassignment_type === 'partial_detail' || r.reassignment_type === 'specific_trains'
    );
  
    if (partialReassignments.length > 0) {
      return {
        type: 'reassigned_partial',
        display: '🔄 Partially Reassigned',
        color: '#ffc107',
        currentMotorman: motormanGroup.motormanName
      };
    }
  
    return {
      type: 'modified',
      display: '🔄 Modified',
      color: '#17a2b8',
      currentMotorman: motormanGroup.motormanName
    };
  }

// 5. Calculate current trains after reassignments - FIXED VERSION
function calculateCurrentTrains(originalTrains, reassignments) {
    let currentTrains = [...originalTrains];
    
    reassignments.forEach(reassignment => {
        if (reassignment.selected_trains) {
            try {
                // Use the safe parsing helper function
                const selectedTrains = parseSelectedTrains(reassignment.selected_trains);
                console.log('🔍 Parsed selected trains:', selectedTrains);
                
                // Remove reassigned trains from current assignment
                currentTrains = currentTrains.filter(train => 
                    !selectedTrains.includes(train.trainNumber)
                );
            } catch (error) {
                console.error('❌ Error processing selected_trains:', error);
                console.log('📋 Raw selected_trains data:', reassignment.selected_trains);
            }
        }
    });
    
    return currentTrains;
}

// 6. Calculate changes information for the Changes column - FIXED VERSION
function calculateChangesInfo(reassignments) {
    if (reassignments.length === 0) {
        return {
            display: 'No changes',
            color: '#6c757d',
            count: 0
        };
    }
    
    const changeTypes = reassignments.map(r => {
        switch (r.reassignment_type) {
            case 'full_detail': return 'Full transfer';
            case 'partial_detail': return 'Partial transfer';
            case 'specific_trains': return 'Train reassignment';
            default: return 'Modified';
        }
    });
    
    return {
        display: `📋 ${reassignments.length} change${reassignments.length !== 1 ? 's' : ''}`,
        details: changeTypes.join(', '),
        color: '#17a2b8',
        count: reassignments.length,
        latest: reassignments[reassignments.length - 1]
    };
}

// 7. Create additional entries for reassigned portions - FIXED VERSION
function createAdditionalEntriesForReassignments(originalEntry, reassignments) {
    const additionalEntries = [];
    
    reassignments.forEach((reassignment, index) => {
        if (reassignment.reassignment_type === 'partial_detail' || 
            reassignment.reassignment_type === 'specific_trains') {
            
            try {
                // Use the safe parsing helper function
                const selectedTrains = reassignment.selected_trains ? 
                    parseSelectedTrains(reassignment.selected_trains) : [];
                
                console.log(`🔍 Processing reassignment ${index + 1}, selected trains:`, selectedTrains);
                
                if (selectedTrains.length > 0) {
                    const reassignedTrains = originalEntry.trains.filter(train => 
                        selectedTrains.includes(train.trainNumber)
                    );
                    
                    const additionalEntry = {
                        detailId: `${originalEntry.detailId}-R${index + 1}`,
                        detailNumber: `${originalEntry.detailNumber}R${index + 1}`,
                        motormanName: reassignment.new_motorman,
                        office: reassignment.office || originalEntry.office,
                        signOnTime: originalEntry.signOnTime,
                        signOffTime: originalEntry.signOffTime,
                        trains: reassignedTrains,
                        totalTrains: reassignedTrains.length,
                        
                        status: 'reassigned_received',
                        statusDisplay: '⚡ Received Assignment',
                        statusColor: '#6f42c1',
                        
                        currentMotorman: reassignment.new_motorman,
                        currentTrains: reassignedTrains,
                        currentTrainCount: reassignedTrains.length,
                        
                        hasReassignments: true,
                        reassignments: [reassignment],
                        changesInfo: {
                            display: `⚡ Received from ${originalEntry.detailNumber}`,
                            details: `${selectedTrains.length} trains from Detail ${originalEntry.detailNumber}`,
                            color: '#6f42c1',
                            count: 1
                        },
                        
                        isReassignedPortion: true,
                        sourceDetail: originalEntry.detailNumber,
                        
                        effectiveAssignment: {
                            motormanName: reassignment.new_motorman,
                            assignedTrains: reassignedTrains.map(t => t.trainNumber),
                            reassignmentType: 'received'
                        }
                    };
                    
                    additionalEntries.push(additionalEntry);
                }
            } catch (error) {
                console.error(`❌ Error processing reassignment ${index + 1}:`, error);
                console.log('📋 Raw reassignment data:', reassignment);
            }
        }
    });
    
    return additionalEntries;
}

// 8. Enhanced display function
function displayEnhancedAppearanceBook(data) {
    console.log('🔄 Displaying enhanced appearance book with separate details...');
    
    const tbody = document.getElementById('appearanceBookTableBody');
    if (!tbody) {
      console.error('❌ Table body element not found!');
      return;
    }
    
    tbody.innerHTML = '';
  
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">📅</div>
            <div>No appearance book data found for ${currentDate}</div>
          </td>
        </tr>
      `;
      return;
    }
  
    let previousMotorman = '';
    
    data.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.id = `row-${index}`;
      row.className = `appearance-row status-${entry.status}`;
      
      // Add visual styling based on status
      if (entry.status !== 'original') {
        row.style.backgroundColor = entry.status === 'reassigned_received' ? '#f8f4ff' : 
                                   entry.status === 'reassigned_partial' ? '#fff3e0' : 
                                   entry.status === 'reassigned_full' ? '#ffebee' : '#f8f9fa';
      }
      
      // Add grouping visual for multiple details
      const isNewMotorman = entry.motormanName !== previousMotorman;
      const isLastDetailForMotorman = index === data.length - 1 || 
        (index < data.length - 1 && data[index + 1].motormanName !== entry.motormanName);
      
      if (isNewMotorman && entry.isMultipleDetails) {
        row.style.borderTop = '3px solid #007bff';
      }
      if (isLastDetailForMotorman && entry.isMultipleDetails) {
        row.style.borderBottom = '2px solid #dee2e6';
      }
      
      // Get first train departure time
      const firstDeparture = entry.currentTrains && entry.currentTrains.length > 0 ? 
        entry.currentTrains[0].startTime : 'N/A';
      const firstTrainNumber = entry.currentTrains && entry.currentTrains.length > 0 ? 
        entry.currentTrains[0].trainNumber : 'No trains';
  
      row.innerHTML = `
        <td>
          <button class="expand-btn" onclick="toggleTrainDetails(${index})" id="expand-btn-${index}">➕</button>
          <span style="font-weight: 500; color: #2c3e50;">${entry.signOnTime}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: #1976d2;">
            🚂 ${firstDeparture}
          </div>
          <div style="font-size: 0.8em; color: #666;">
            ${firstTrainNumber}
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: #34495e;">
            ${entry.detailDisplayName}
            ${entry.isMultipleDetails ? `<br><small style="color: #007bff;">👥 Multi-Detail Assignment</small>` : ''}
          </div>
          <div style="font-size: 0.8em; color: #666;">${entry.currentTrainCount} trains</div>
        </td>
        <td>
          <div style="font-weight: 600; color: ${entry.statusColor};">
            ${entry.currentMotorman}
            ${entry.isMultipleDetails && isNewMotorman ? `<br><small style="color: #666;">Has ${entry.motormanDetailCount} details</small>` : ''}
          </div>
          <div style="font-size: 0.8em; color: #666;">${entry.office}</div>
        </td>
        <td>
          <span style="color: ${entry.statusColor}; font-weight: 600; padding: 4px 8px; background: ${entry.statusColor}20; border-radius: 12px; font-size: 0.8em;">
            ${entry.statusDisplay}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #2c3e50;">
            ${entry.currentTrainCount} trains
          </div>
          <div style="font-size: 0.8em; color: #666;">
            ${entry.currentTrains.slice(0, 3).map(t => t.trainNumber).join(', ')}${entry.currentTrains.length > 3 ? '...' : ''}
          </div>
        </td>
        <td>
          <div style="color: ${entry.changesInfo.color}; font-weight: 500;">
            ${entry.changesInfo.display}
          </div>
          ${entry.changesInfo.details ? `<div style="font-size: 0.8em; color: #666;">${entry.changesInfo.details}</div>` : ''}
        </td>
        <td>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="btn-primary reassign-btn" 
                    data-detail-id="${entry.detailId}" 
                    data-index="${index}"
                    style="padding: 6px 12px; font-size: 0.8em; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🔄 Reassign
            </button>
            ${entry.hasReassignments ? `
              <button class="btn-primary" 
                      onclick="showDetailedReassignmentHistory('${entry.detailId}')"
                      style="padding: 6px 12px; font-size: 0.8em; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                👁️ History
              </button>
            ` : ''}
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
      previousMotorman = entry.motormanName;
    });
    
    // Store enhanced data globally
    window.currentAppearanceData = data;
    
    // Setup reassignment button event listeners
    setupEnhancedReassignmentButtons();
    
    console.log('✅ Enhanced appearance book displayed with separate details');
  }

// 9. Calculate enhanced summary statistics
function calculateEnhancedSummaryStats(appearanceData) {
    const stats = {
        total: appearanceData.length,
        waiting: appearanceData.filter(e => e.motormanName.toLowerCase().includes('waiting')).length,
        reassigned: appearanceData.filter(e => e.hasReassignments).length,
        totalReassignments: appearanceData.reduce((sum, e) => sum + (e.reassignments?.length || 0), 0),
        
        // Enhanced stats
        fullyReassigned: appearanceData.filter(e => e.status === 'reassigned_full').length,
        partiallyReassigned: appearanceData.filter(e => e.status === 'reassigned_partial').length,
        receivedAssignments: appearanceData.filter(e => e.status === 'reassigned_received').length,
        originalAssignments: appearanceData.filter(e => e.status === 'original').length
    };
    
    return stats;
}

// 10. Setup enhanced reassignment buttons
function setupEnhancedReassignmentButtons() {
    const reassignButtons = document.querySelectorAll('.reassign-btn');
    
    reassignButtons.forEach(button => {
        button.addEventListener('click', function() {
            const detailId = this.getAttribute('data-detail-id');
            const index = parseInt(this.getAttribute('data-index'));
            
            console.log(`🔄 Enhanced reassign button clicked for detail ${detailId}, index ${index}`);
            
            if (window.showReassignmentModalSuperFixed) {
                window.showReassignmentModalSuperFixed(detailId, index);
            } else {
                showReassignmentModal(detailId, index);
            }
        });
    });
    
    console.log(`✅ Setup ${reassignButtons.length} enhanced reassignment button listeners`);
}

// 11. Show detailed reassignment history - FIXED VERSION
function showDetailedReassignmentHistory(detailId) {
    const entry = window.currentAppearanceData.find(e => e.detailId === detailId);
    if (!entry || !entry.reassignments || entry.reassignments.length === 0) {
        showToast('ℹ️ No reassignment history found for this detail', 'info');
        return;
    }
    
    // Create detailed history modal
    const modal = document.createElement('div');
    modal.id = 'detailedHistoryModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 10000;
    `;
    
    const historyHtml = entry.reassignments.map((r, index) => {
        let selectedTrainsDisplay = 'All trains';
        
        if (r.selected_trains) {
            try {
                const selectedTrains = parseSelectedTrains(r.selected_trains);
                selectedTrainsDisplay = selectedTrains.join(', ');
            } catch (error) {
                selectedTrainsDisplay = r.selected_trains;
            }
        }
        
        return `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3498db;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #2c3e50;">${r.reassignment_type.replace('_', ' ').toUpperCase()}</div>
                    <div style="font-size: 0.8em; color: #666;">${new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>From:</strong> ${r.original_motorman} → <strong>To:</strong> ${r.new_motorman}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Trains:</strong> ${selectedTrainsDisplay}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Reason:</strong> ${r.reason}
                </div>
                ${r.notes ? `<div style="font-size: 0.9em; color: #666;"><strong>Notes:</strong> ${r.notes}</div>` : ''}
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>📚 Reassignment History - Detail ${entry.detailNumber}</h2>
                <button onclick="document.getElementById('detailedHistoryModal').remove()" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${historyHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 12. Apply enhanced appearance book
function applyEnhancedAppearanceBook() {
    console.log('🔄 Applying Enhanced Appearance Book...');
    
    // Override the main loading function
    window.loadAppearanceBook = function() {
        const dateInput = document.getElementById("jfoDate");
        const selectedDate = dateInput ? dateInput.value : null;
        
        if (!selectedDate) {
            showToast('⚠️ Please select a date', 'warning');
            return;
        }
        
        currentDate = selectedDate;
        updateCurrentDateDisplay();
        
        // Use enhanced loading
        loadAppearanceBookWithReassignmentStatus(selectedDate);
    };
    
    // Make new functions globally accessible
    window.loadAppearanceBookWithReassignmentStatus = loadAppearanceBookWithReassignmentStatus;
    window.displayEnhancedAppearanceBook = displayEnhancedAppearanceBook;
    window.showDetailedReassignmentHistory = showDetailedReassignmentHistory;
    window.parseSelectedTrains = parseSelectedTrains;
    
    console.log('✅ Enhanced Appearance Book applied successfully!');
    showToast('🔄 Enhanced appearance book with reassignment status enabled!', 'success', 4000);
}

// 13. Auto-apply enhanced appearance book
applyEnhancedAppearanceBook();

// ===== MOTORMAN MANAGEMENT FUNCTIONS =====
// Add these functions to your jfo-script.js file

let currentMotormanList = [];
let selectedMotormanData = null;
let motormanSelectionTargetInput = null;

// 1. Initialize motorman management when Reports tab is shown
function initializeMotormanManagement() {
    console.log('🔄 Initializing motorman management...');
    
    // Setup upload form listener
    const uploadForm = document.getElementById('motormanUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleMotormanUpload);
    }
    
    // Load initial statistics
    loadMotormanStatistics();
    
    console.log('✅ Motorman management initialized');
}

// 2. Handle motorman CSV upload
async function handleMotormanUpload(event) {
    event.preventDefault();
    
    console.log('📤 Processing motorman upload...');
    
    const fileInput = document.getElementById('motormanFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('⚠️ Please select a CSV file', 'warning');
        return;
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('⚠️ Please select a valid CSV file', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        // Read and parse CSV file
        const csvText = await readFileAsText(file);
        const motormanData = parseMotormanCSV(csvText);
        
        console.log(`📋 Parsed ${motormanData.length} motorman records`);
        
        if (motormanData.length === 0) {
            throw new Error('No valid motorman data found in CSV');
        }
        
        // Send to backend
        const response = await fetch('/api/motormen/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                motormen: motormanData,
                uploadedBy: 'JFO Supervisor',
                uploadDate: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        
        showToast(`✅ Successfully uploaded ${result.count || motormanData.length} motorman records!`, 'success');
        
        // Clear form and refresh statistics
        fileInput.value = '';
        loadMotormanStatistics();
        
    } catch (error) {
        console.error('❌ Upload failed:', error);
        showToast(`❌ Upload failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// 3. Read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// 4. Parse motorman CSV data
function parseMotormanCSV(csvText) {
    console.log('📋 Parsing motorman CSV...');
    
    const lines = csvText.trim().split('\n');
    const motormanData = [];
    
    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes('cmsid') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length >= 5) {
            const [cmsid, motorman, mobileNumber, pfNumber, hrmsId] = columns;
            
            // Auto-detect office from CMS ID
            const office = detectOfficeFromCMSID(cmsid);
            
            const motormanRecord = {
                cmsid: cmsid,
                motormanName: motorman,
                mobileNumber: mobileNumber,
                pfNumber: pfNumber,
                hrmsId: hrmsId,
                office: office,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Validate required fields
            if (cmsid && motorman && office) {
                motormanData.push(motormanRecord);
                console.log(`✅ Parsed: ${motorman} (${cmsid}) - ${office}`);
            } else {
                console.warn(`⚠️ Skipped invalid record at line ${i + 1}:`, columns);
            }
        } else {
            console.warn(`⚠️ Skipped incomplete record at line ${i + 1}:`, columns);
        }
    }
    
    console.log(`📊 Successfully parsed ${motormanData.length} valid records`);
    return motormanData;
}

// 5. Detect office from CMS ID pattern
function detectOfficeFromCMSID(cmsid) {
    if (!cmsid) return 'UNKNOWN';
    
    const upperCMSID = cmsid.toUpperCase();
    
    if (upperCMSID.startsWith('CSTS') || upperCMSID.includes('CSMT')) {
        return 'CSMT';
    } else if (upperCMSID.startsWith('KYN') || upperCMSID.includes('KYN')) {
        return 'KYN';
    } else if (upperCMSID.startsWith('PNVL') || upperCMSID.includes('PNVL')) {
        return 'PNVL';
    } else {
        // Default based on common patterns
        console.warn(`⚠️ Could not detect office for CMS ID: ${cmsid}, defaulting to CSMT`);
        return 'CSMT';
    }
}

// 6. Load motorman statistics
async function loadMotormanStatistics() {
    console.log('📊 Loading motorman statistics...');
    
    try {
        const response = await fetch('/api/motormen/statistics');
        
        if (!response.ok) {
            // If endpoint doesn't exist, show zero counts
            updateStatisticsDisplay({
                total: 0,
                csmt: 0,
                kyn: 0,
                pnvl: 0
            });
            return;
        }
        
        const stats = await response.json();
        console.log('📊 Statistics loaded:', stats);
        
        updateStatisticsDisplay(stats);
        
    } catch (error) {
        console.warn('⚠️ Could not load statistics:', error.message);
        // Show zero counts on error
        updateStatisticsDisplay({
            total: 0,
            csmt: 0,
            kyn: 0,
            pnvl: 0
        });
    }
}

// 7. Update statistics display
function updateStatisticsDisplay(stats) {
    console.log('📊 Updating statistics display:', stats);
    
    // Animate counter updates
    animateCounter('totalMotormenCount', stats.total || 0);
    animateCounter('csmtMotormenCount', stats.csmt || 0);
    animateCounter('kynMotormenCount', stats.kyn || 0);
    animateCounter('pnvlMotormenCount', stats.pnvl || 0);
}

// 8. Show motorman selection modal
async function showMotormanSelectionModal(targetInputId) {
    console.log(`👤 Opening motorman selection modal for input: ${targetInputId}`);
    
    motormanSelectionTargetInput = targetInputId;
    selectedMotormanData = null;
    
    const modal = document.getElementById('motormanSelectionModal');
    if (!modal) {
        console.error('❌ Motorman selection modal not found');
        return;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Load motorman list
    await loadMotormanList();
    
    // Clear search and filters
    document.getElementById('motormanSearchInput').value = '';
    document.getElementById('motormanOfficeFilter').value = '';
    
    // Hide selected motorman display
    document.getElementById('selectedMotormanDisplay').style.display = 'none';
    document.getElementById('confirmMotormanBtn').disabled = true;
}

// 9. Load motorman list from backend
async function loadMotormanList() {
    console.log('👥 Loading motorman list...');
    
    const container = document.getElementById('motormanListContainer');
    
    try {
        const response = await fetch('/api/motormen');
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        currentMotormanList = result.data || [];
        
        console.log(`✅ Loaded ${currentMotormanList.length} motormen`);
        
        displayMotormanList(currentMotormanList);
        
    } catch (error) {
        console.error('❌ Failed to load motorman list:', error);
        
        // Show error state
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <div style="font-size: 1.5em; margin-bottom: 10px;">❌</div>
                <div>Failed to load motorman list</div>
                <div style="font-size: 0.9em; margin-top: 5px;">${error.message}</div>
                <button onclick="loadMotormanList()" class="btn-primary" style="margin-top: 15px; padding: 8px 16px;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

// 10. Display motorman list
function displayMotormanList(motormenList) {
    const container = document.getElementById('motormanListContainer');
    
    if (!motormenList || motormenList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 1.5em; margin-bottom: 10px;">👥</div>
                <div>No motormen found</div>
                <div style="font-size: 0.9em; margin-top: 5px;">Upload a CSV file to add motormen</div>
            </div>
        `;
        return;
    }
    
    const listHTML = motormenList.map((motorman, index) => `
        <div class="motorman-item" onclick="selectMotorman(${index})" 
             style="padding: 15px; margin-bottom: 10px; border: 2px solid #e9ecef; border-radius: 8px; cursor: pointer; background: white; transition: all 0.3s ease;">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #2c3e50; font-size: 1.1em; margin-bottom: 4px;">
                        👤 ${motorman.motorman_name || motorman.motormanName}
                    </div>
                    <div style="color: #666; font-size: 0.9em; margin-bottom: 4px;">
                        <strong>CMS ID:</strong> ${motorman.cmsid} | <strong>Office:</strong> ${motorman.office}
                    </div>
                    <div style="color: #666; font-size: 0.9em;">
                        <strong>Mobile:</strong> ${motorman.mobile_number || motorman.mobileNumber || 'N/A'} | 
                        <strong>PF:</strong> ${motorman.pf_number || motorman.pfNumber || 'N/A'}
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="padding: 6px 12px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border-radius: 20px; font-size: 0.8em; font-weight: 600;">
                        ${motorman.office}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = listHTML;
    
    console.log(`✅ Displayed ${motormenList.length} motormen`);
}

// 11. Select motorman
function selectMotorman(index) {
    console.log(`👤 Selecting motorman at index: ${index}`);
    
    if (!currentMotormanList || !currentMotormanList[index]) {
        console.error('❌ Invalid motorman index');
        return;
    }
    
    selectedMotormanData = currentMotormanList[index];
    
    // Update visual selection
    const items = document.querySelectorAll('.motorman-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.style.borderColor = '#28a745';
            item.style.backgroundColor = '#f8fff9';
            item.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.2)';
        } else {
            item.style.borderColor = '#e9ecef';
            item.style.backgroundColor = 'white';
            item.style.boxShadow = 'none';
        }
    });
    
    // Show selected motorman display
    const selectedDisplay = document.getElementById('selectedMotormanDisplay');
    const selectedDetails = document.getElementById('selectedMotormanDetails');
    
    selectedDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <strong>Name:</strong><br>
                ${selectedMotormanData.motorman_name || selectedMotormanData.motormanName}
            </div>
            <div>
                <strong>CMS ID:</strong><br>
                ${selectedMotormanData.cmsid}
            </div>
            <div>
                <strong>Office:</strong><br>
                ${selectedMotormanData.office}
            </div>
            <div>
                <strong>Mobile:</strong><br>
                ${selectedMotormanData.mobile_number || selectedMotormanData.mobileNumber || 'N/A'}
            </div>
        </div>
    `;
    
    selectedDisplay.style.display = 'block';
    
    // Enable confirm button
    document.getElementById('confirmMotormanBtn').disabled = false;
    
    console.log('✅ Motorman selected:', selectedMotormanData);
}

// 12. Filter motorman list
function filterMotormanList() {
    const searchTerm = document.getElementById('motormanSearchInput').value.toLowerCase();
    const officeFilter = document.getElementById('motormanOfficeFilter').value;
    
    console.log(`🔍 Filtering motormen: search="${searchTerm}", office="${officeFilter}"`);
    
    if (!currentMotormanList || currentMotormanList.length === 0) {
        return;
    }
    
    let filteredList = [...currentMotormanList];
    
    // Apply search filter
    if (searchTerm) {
        filteredList = filteredList.filter(motorman => {
            const name = (motorman.motorman_name || motorman.motormanName || '').toLowerCase();
            const cmsid = (motorman.cmsid || '').toLowerCase();
            const mobile = (motorman.mobile_number || motorman.mobileNumber || '').toLowerCase();
            
            return name.includes(searchTerm) || 
                   cmsid.includes(searchTerm) || 
                   mobile.includes(searchTerm);
        });
    }
    
    // Apply office filter
    if (officeFilter) {
        filteredList = filteredList.filter(motorman => motorman.office === officeFilter);
    }
    
    console.log(`✅ Filtered to ${filteredList.length} motormen`);
    displayMotormanList(filteredList);
}

// 13. Clear motorman filters
function clearMotormanFilters() {
    document.getElementById('motormanSearchInput').value = '';
    document.getElementById('motormanOfficeFilter').value = '';
    displayMotormanList(currentMotormanList);
    console.log('🗑️ Motorman filters cleared');
}

// 14. Confirm motorman selection
function confirmMotormanSelection() {
    if (!selectedMotormanData || !motormanSelectionTargetInput) {
        console.error('❌ No motorman selected or target input not specified');
        return;
    }
    
    const targetInput = document.getElementById(motormanSelectionTargetInput);
    if (!targetInput) {
        console.error('❌ Target input not found:', motormanSelectionTargetInput);
        return;
    }
    
    // Set the input value with formatted motorman info
    const motormanDisplayText = `${selectedMotormanData.motorman_name || selectedMotormanData.motormanName} (${selectedMotormanData.cmsid})`;
    targetInput.value = motormanDisplayText;
    
    // Store the full motorman data on the input element for later use
    targetInput.dataset.motormanData = JSON.stringify(selectedMotormanData);
    
    console.log('✅ Motorman selection confirmed:', motormanDisplayText);
    showToast(`✅ Selected: ${motormanDisplayText}`, 'success', 3000);
    
    // Close modal
    closeMotormanSelectionModal();
}

// 15. Close motorman selection modal
function closeMotormanSelectionModal() {
    const modal = document.getElementById('motormanSelectionModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset selection state
    selectedMotormanData = null;
    motormanSelectionTargetInput = null;
    
    console.log('✅ Motorman selection modal closed');
}

// 16. Initialize Reports tab functionality
function initializeReportsTab() {
    console.log('📊 Initializing Reports tab...');
    
    // Initialize motorman management
    initializeMotormanManagement();
    
    console.log('✅ Reports tab initialized');
}

// 17. Enhanced tab switching to initialize reports tab
function showJFOTabEnhanced(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    const selectedButton = document.getElementById(`tab-${tabName}`);
    
    if (selectedTab && selectedButton) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
        selectedButton.classList.add('active');
        
        // Initialize specific tabs
        if (tabName === 'special-trains') {
            initializeSpecialTrainsTab();
        } else if (tabName === 'reports') {
            initializeReportsTab();
        }
    }
}

// 18. Backend API helper functions for motorman management
async function testMotormanAPI() {
    console.log('🧪 Testing motorman API endpoints...');
    
    const endpoints = [
        '/api/motormen',
        '/api/motormen/statistics'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const response = await fetch(endpoint);
            const status = response.status;
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint}: Success (${status})`, data);
            } else {
                console.log(`⚠️ ${endpoint}: ${status} - ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: Failed - ${error.message}`);
        }
    }
}

// 19. Integration with existing reassignment modal
function enhanceReassignmentModalWithMotormanSelection() {
    console.log('🔧 Enhancing reassignment modal with motorman selection...');
    
    // Find new motorman input in the reassignment modal
    const newMotormanInput = document.getElementById('newMotorman');
    if (newMotormanInput) {
        // Make it readonly and clickable
        newMotormanInput.readOnly = true;
        newMotormanInput.style.cursor = 'pointer';
        newMotormanInput.placeholder = 'Click to select motorman from database';
        
        // Add click handler
        newMotormanInput.addEventListener('click', function() {
            showMotormanSelectionModal('newMotorman');
        });
        
        // Add a button next to it
        const selectButton = document.createElement('button');
        selectButton.type = 'button';
        selectButton.className = 'btn-primary';
        selectButton.style.marginLeft = '10px';
        selectButton.innerHTML = '👤 Select';
        selectButton.onclick = function() {
            showMotormanSelectionModal('newMotorman');
        };
        
        // Insert button after the input
        newMotormanInput.parentNode.insertBefore(selectButton, newMotormanInput.nextSibling);
        
        console.log('✅ Enhanced reassignment modal with motorman selection');
    }
}

console.log('🔧 Loading JFO Motorman Integration - Safe Mode...');

// ===== STEP 1: NEW MOTORMAN API FUNCTIONS (NO CONFLICTS) =====

// 1. Load motormen with correct format
async function loadMotormenForJFO(officeFilter = null, excludeMotorman = null) {
    console.log('👥 Loading motormen for JFO (safe mode)...');
    console.log('🔍 Exclude motorman:', excludeMotorman);
    
    try {
        let url = '/api/jfo/motormen/for-reassignment';
        const params = new URLSearchParams();
        
        if (officeFilter) {
            params.append('office', officeFilter);
        }
        
        if (excludeMotorman) {
            // FIXED: Better CMS ID extraction from various formats
            let cmsIdToExclude = null;
            
            // Try different patterns:
            // "M J UBALE (1041)" -> extract "1041"
            // "ARVIND KUMAR SHARMA (1745)" -> extract "1745"
            // "M J UBALE (1041) (CSTS1041)" -> extract "1041"
            
            const patterns = [
                /\((\d+)\)/,           // Match first number in parentheses
                /\(([A-Z]+\d+)\)/,     // Match CMS ID like (CSTS1041)
                /([A-Z]+\d+)/          // Match CMS ID without parentheses
            ];
            
            for (const pattern of patterns) {
                const match = excludeMotorman.match(pattern);
                if (match) {
                    // If it's just a number, use it directly
                    if (/^\d+$/.test(match[1])) {
                        cmsIdToExclude = match[1];
                        break;
                    }
                    // If it's like CSTS1041, try to extract just the number
                    const numberMatch = match[1].match(/\d+/);
                    if (numberMatch) {
                        cmsIdToExclude = numberMatch[0];
                        break;
                    }
                }
            }
            
            console.log(`🔍 Extracted CMS ID to exclude: "${cmsIdToExclude}" from "${excludeMotorman}"`);
            
            if (cmsIdToExclude) {
                params.append('excludeCmsId', cmsIdToExclude);
            }
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('📡 Fetching motormen from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Raw motormen data:', result.data?.length, 'motormen loaded');
        
        // FIX: Extract correct format - remove the extra (CSTS1862) part
        const correctedData = result.data.map(motorman => {
            // Current: "A A SIDDIQUE (1862) (CSTS1862)"
            // Needed: "A A SIDDIQUE (1862)"
            
            let correctedLabel = motorman.label;
            
            // Find the pattern: "NAME (ID) (CMSID)" and extract "NAME (ID)"
            const match = correctedLabel.match(/^(.+?\(\d+\))/);
            if (match) {
                correctedLabel = match[1];
            }
            
            return {
                ...motorman,
                correctedLabel: correctedLabel, // The format we want
                originalLabel: motorman.label,   // Keep original for debugging
                cmsId: motorman.value           // Store CMS ID separately
            };
        });
        
        console.log(`✅ Corrected motormen format: ${correctedData.length} motormen available`);
        
        // Debug: Log which motormen are available
        if (excludeMotorman) {
            console.log('🔍 Available motormen after exclusion:');
            correctedData.slice(0, 5).forEach(m => {
                console.log(`  - ${m.correctedLabel} (CMS: ${m.cmsId})`);
            });
        }
        
        return correctedData;
        
    } catch (error) {
        console.error('❌ Failed to load motormen:', error);
        showToast('⚠️ Failed to load motorman list', 'warning');
        return [];
    }
}

// 2. Populate motorman select with correct format - preserving existing input
async function populateMotormanSelectSafe(inputElement, currentMotorman = null, office = null) {
    if (!inputElement) {
        console.error('❌ Input element not provided');
        return;
    }
    
    console.log('🔄 Safely populating motorman input...', {
        elementType: inputElement.tagName,
        elementId: inputElement.id,
        currentMotorman,
        office
    });
    
    // Check if it's an input or select element
    const isSelectElement = inputElement.tagName.toLowerCase() === 'select';
    const isInputElement = inputElement.tagName.toLowerCase() === 'input';
    
    if (isSelectElement) {
        return await populateSelectElement(inputElement, currentMotorman, office);
    } else if (isInputElement) {
        return await enhanceInputWithMotormanSelection(inputElement, currentMotorman, office);
    } else {
        console.error('❌ Element is neither input nor select');
        return;
    }
}

// 3. Populate select element (if it's a select)
async function populateSelectElement(selectElement, currentMotorman, office=null) {
    console.log('📋 Populating select element...');
    
    // Show loading state
    selectElement.innerHTML = '<option value="">Loading motormen...</option>';
    selectElement.disabled = true;
    
    try {
        // Load motormen data with corrected format
        const motormenData = await loadMotormenForJFO(office, currentMotorman);
        
        // Clear and populate select
        selectElement.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select new motorman';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);
        
        // Add motormen options with CORRECTED format
        motormenData.forEach(motorman => {
            const option = document.createElement('option');
            option.value = motorman.correctedLabel;  // Use corrected format: "A A SIDDIQUE (1862)"
            option.textContent = motorman.correctedLabel;
            option.dataset.cmsId = motorman.cmsId;
            option.dataset.office = motorman.office;
            option.dataset.mobile = motorman.mobile || '';
            option.dataset.originalLabel = motorman.originalLabel;
            selectElement.appendChild(option);
        });
        
        // Enable the select
        selectElement.disabled = false;
        
        console.log(`✅ Populated select with ${motormenData.length} motormen (corrected format)`);
        
    } catch (error) {
        console.error('❌ Failed to populate select:', error);
        selectElement.innerHTML = '<option value="">Failed to load motormen</option>';
        selectElement.disabled = false;
        showToast('❌ Failed to populate motorman list', 'error');
    }
}

// 4. Enhance input element with motorman selection (for existing text inputs)
async function enhanceInputWithMotormanSelection(inputElement, currentMotorman, office) {
    console.log('🔧 Enhancing input element with motorman selection...');
    
    // Make input readonly and clickable
    inputElement.readOnly = true;
    inputElement.style.cursor = 'pointer';
    inputElement.placeholder = 'Click to select motorman from database';
    inputElement.title = 'Click to select motorman from database';
    
    // Store motorman data on the element
    try {
        // FIXED: Load ALL motormen (no office restriction)
        const motormenData = await loadMotormenForJFO(null, currentMotorman);
        inputElement.dataset.motormenData = JSON.stringify(motormenData);
        
        // Add click handler
        inputElement.onclick = function() {
            showMotormanSelectionPopup(this, motormenData);
        };
        
        // Add visual indicator
        if (!inputElement.nextElementSibling || !inputElement.nextElementSibling.classList.contains('motorman-select-btn')) {
            const selectButton = document.createElement('button');
            selectButton.type = 'button';
            selectButton.className = 'motorman-select-btn';
            selectButton.style.cssText = `
                margin-left: 10px; 
                padding: 8px 12px; 
                background: #17a2b8; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 0.9em;
            `;
            selectButton.innerHTML = '👤 Select';
            selectButton.onclick = function() {
                showMotormanSelectionPopup(inputElement, motormenData);
            };
            
            inputElement.parentNode.insertBefore(selectButton, inputElement.nextSibling);
        }
        
        console.log(`✅ Enhanced input with ${motormenData.length} motormen available from ALL offices`);
        
    } catch (error) {
        console.error('❌ Failed to enhance input:', error);
        inputElement.readOnly = false;
        inputElement.placeholder = 'Enter motorman name manually';
    }
}

// 5. Show motorman selection popup
function showMotormanSelectionPopup(inputElement, motormenData) {
    console.log('👤 Showing motorman selection popup...');
    console.log('🔍 Input element details:', {
        id: inputElement.id,
        tagName: inputElement.tagName,
        value: inputElement.value
    });
    
    // Store reference to input element globally for reliable access
    window.currentMotormanInputElement = inputElement;
    
    // Remove any existing popup
    const existingPopup = document.getElementById('motormanSelectionPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'motormanSelectionPopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #007bff;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 400px;
        max-height: 500px;
        overflow-y: auto;
        padding: 20px;
    `;
    
    // Create list HTML with proper event handling
    const listHTML = motormenData.map((motorman, index) => {
        // Escape quotes in the name for onclick
        const escapedName = motorman.correctedLabel.replace(/'/g, "\\'");
        
        return `
            <div class="motorman-popup-item" data-motorman-name="${motorman.correctedLabel}" 
                 data-motorman-index="${index}"
                 style="padding: 10px; margin-bottom: 5px; border: 1px solid #eee; border-radius: 4px; cursor: pointer; transition: background 0.2s;"
                 onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <div style="font-weight: 600; color: #2c3e50;">${motorman.correctedLabel}</div>
                <div style="font-size: 0.8em; color: #666;">Office: ${motorman.office} | Mobile: ${motorman.mobile || 'N/A'}</div>
            </div>
        `;
    }).join('');
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <h4 style="margin: 0; color: #2c3e50;">👤 Select Motorman</h4>
            <button id="closeMotormanPopup" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">&times;</button>
        </div>
        
        <div style="margin-bottom: 15px;">
            <input type="text" placeholder="Search motorman..." id="motormanPopupSearch"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div id="motormanPopupList" style="max-height: 300px; overflow-y: auto;">
            ${listHTML}
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add event listeners AFTER popup is in DOM
    
    // Close button handler
    popup.querySelector('#closeMotormanPopup').addEventListener('click', function() {
        popup.remove();
        window.currentMotormanInputElement = null;
    });
    
    // Search functionality
    const searchInput = popup.querySelector('#motormanPopupSearch');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = popup.querySelectorAll('.motorman-popup-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
    
    // Click handlers for motorman items
    const motormanItems = popup.querySelectorAll('.motorman-popup-item');
    motormanItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const motormanName = this.dataset.motormanName;
            const motormanIndex = parseInt(this.dataset.motormanIndex);
            
            console.log('🎯 Motorman item clicked:', {
                name: motormanName,
                index: motormanIndex,
                element: this
            });
            
            selectMotormanFromPopupFixed(motormanName, motormanIndex, motormenData[motormanIndex]);
        });
    });
    
    // Focus search input
    setTimeout(() => searchInput.focus(), 100);
    
    console.log(`✅ Popup created with ${motormenData.length} motormen`);
}
// 6. Select motorman from popup
function selectMotormanFromPopupFixed(motormanName, motormanIndex, motormanData) {
    console.log('✅ FIXED: Motorman selected from popup:', {
        name: motormanName,
        index: motormanIndex,
        data: motormanData
    });
    
    const inputElement = window.currentMotormanInputElement;
    
    if (!inputElement) {
        console.error('❌ No input element reference found');
        showToast('❌ Error: Could not find input element', 'error');
        return;
    }
    
    console.log('🔍 Setting value on element:', {
        elementId: inputElement.id,
        elementType: inputElement.tagName,
        currentValue: inputElement.value,
        newValue: motormanName
    });
    
    // Set the value
    inputElement.value = motormanName;
    
    // Store additional data on the input element for later use
    inputElement.dataset.motormanCmsId = motormanData.cmsId;
    inputElement.dataset.motormanOffice = motormanData.office;
    inputElement.dataset.motormanMobile = motormanData.mobile || '';
    
    // Make input visible changes
    inputElement.style.backgroundColor = '#e8f5e8';
    setTimeout(() => {
        inputElement.style.backgroundColor = '';
    }, 1000);
    
    // Trigger multiple events to ensure detection
    const events = ['input', 'change', 'blur'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        inputElement.dispatchEvent(event);
    });
    
    // Also trigger a custom event
    const customEvent = new CustomEvent('motormanSelected', {
        detail: {
            motormanName: motormanName,
            motormanData: motormanData
        },
        bubbles: true
    });
    inputElement.dispatchEvent(customEvent);
    
    console.log('🔔 Events triggered on input element');
    
    // Show success feedback
    if (typeof showToast === 'function') {
        showToast(`✅ Selected: ${motormanName}`, 'success', 3000);
    } else {
        console.log(`✅ Selected: ${motormanName}`);
    }
    
    // Close popup
    const popup = document.getElementById('motormanSelectionPopup');
    if (popup) {
        popup.remove();
    }
    
    // Clear global reference
    window.currentMotormanInputElement = null;
    
    console.log('✅ Motorman selection completed successfully');
}

// ===== STEP 2: SAFE INTEGRATION WITH EXISTING MODAL =====

// 7. Enhanced modal creation that preserves ALL existing functionality
function enhanceExistingModalWithMotormanSelect() {
    console.log('🔧 Enhancing existing modal with motorman select...');
    
    // Wait for modal to exist
    const checkModal = () => {
        const modal = document.getElementById('activeReassignmentModal');
        if (modal) {
            const newMotormanInput = modal.querySelector('#newMotorman');
            if (newMotormanInput) {
                console.log('🔍 Found new motorman input:', {
                    tagName: newMotormanInput.tagName,
                    type: newMotormanInput.type,
                    id: newMotormanInput.id
                });
                
                // Get current context
                const currentMotorman = window.currentReassignmentData?.entry?.motormanName;
                
                // FIXED: Show ALL motormen from ALL offices (no office filter)
                populateMotormanSelectSafe(newMotormanInput, currentMotorman, null);
                
                // Add office change listener if office select exists
                const officeSelect = modal.querySelector('#reassignOffice, #newOffice');
                if (officeSelect) {
                    officeSelect.addEventListener('change', function() {
                        console.log('🏢 Office changed, filtering to:', this.value);
                        // Filter by the selected office
                        populateMotormanSelectSafe(newMotormanInput, currentMotorman, this.value);
                    });
                }
                
                console.log('✅ Successfully enhanced existing modal with motorman selection');
                return true;
            }
        }
        return false;
    };
    
    // Try immediately, then with delays
    if (!checkModal()) {
        setTimeout(() => {
            if (!checkModal()) {
                setTimeout(checkModal, 500);
            }
        }, 100);
    }
}

// ===== STEP 3: SAFE HOOKING INTO EXISTING FUNCTIONS =====

// 8. Hook into existing modal creation (no override, just enhance)
const originalShowReassignmentModal = window.showReassignmentModal;
const originalShowReassignmentModalSuperFixed = window.showReassignmentModalSuperFixed;
const originalCreateModalWithWorkingCSS = window.createModalWithWorkingCSS;

// Enhance showReassignmentModal
if (originalShowReassignmentModal) {
    window.showReassignmentModal = function(...args) {
        console.log('🔗 Intercepting showReassignmentModal...');
        const result = originalShowReassignmentModal.apply(this, args);
        setTimeout(enhanceExistingModalWithMotormanSelect, 200);
        return result;
    };
}

// Enhance showReassignmentModalSuperFixed
if (originalShowReassignmentModalSuperFixed) {
    window.showReassignmentModalSuperFixed = function(...args) {
        console.log('🔗 Intercepting showReassignmentModalSuperFixed...');
        const result = originalShowReassignmentModalSuperFixed.apply(this, args);
        setTimeout(enhanceExistingModalWithMotormanSelect, 200);
        return result;
    };
}

// Enhance createModalWithWorkingCSS
if (originalCreateModalWithWorkingCSS) {
    window.createModalWithWorkingCSS = function(...args) {
        console.log('🔗 Intercepting createModalWithWorkingCSS...');
        const result = originalCreateModalWithWorkingCSS.apply(this, args);
        setTimeout(enhanceExistingModalWithMotormanSelect, 200);
        return result;
    };
}

// ===== STEP 4: TESTING AND DEBUGGING FUNCTIONS =====

// 9. Test function to verify format
async function testMotormanFormat() {
    console.log('🧪 Testing motorman format...');
    
    try {
        const motormen = await loadMotormenForJFO();
        
        console.log('📋 Format test results:');
        motormen.slice(0, 3).forEach((m, i) => {
            console.log(`${i + 1}. Original: "${m.originalLabel}"`);
            console.log(`   Corrected: "${m.correctedLabel}"`);
            console.log(`   CMS ID: "${m.cmsId}"`);
            console.log('---');
        });
        
        return motormen;
    } catch (error) {
        console.error('❌ Format test failed:', error);
    }
}

// 10. ENHANCED Test function for popup with debugging
function testMotormanPopup() {
    console.log('🧪 Testing motorman popup with debugging...');
    
    // Create a test input
    const testInput = document.createElement('input');
    testInput.id = 'testMotormanInput';
    testInput.placeholder = 'Test motorman input';
    testInput.style.cssText = 'position: fixed; top: 20px; left: 20px; z-index: 9999; padding: 10px; border: 2px solid red; width: 300px;';
    
    // Add change listener for debugging
    testInput.addEventListener('change', function() {
        console.log('🔔 Test input change event triggered:', this.value);
        alert(`Input value changed to: "${this.value}"`);
    });
    
    testInput.addEventListener('motormanSelected', function(e) {
        console.log('🔔 Custom motormanSelected event:', e.detail);
        alert(`Custom event received: "${e.detail.motormanName}"`);
    });
    
    document.body.appendChild(testInput);
    
    // Enhance it
    enhanceInputWithMotormanSelection(testInput);
    
    setTimeout(() => {
        alert('Test input added at top-left with debugging. Click on it to test motorman selection. Check console for logs.');
    }, 500);
}

// 11. NEW: Debug current modal function
function debugCurrentModal() {
    console.log('🔍 Debugging current modal...');
    
    const modal = document.getElementById('activeReassignmentModal');
    if (!modal) {
        console.log('❌ No active modal found');
        return;
    }
    
    const newMotormanInput = modal.querySelector('#newMotorman');
    if (!newMotormanInput) {
        console.log('❌ No newMotorman input found in modal');
        return;
    }
    
    console.log('✅ Modal and input found:', {
        modalId: modal.id,
        inputId: newMotormanInput.id,
        inputTagName: newMotormanInput.tagName,
        inputType: newMotormanInput.type || 'none',
        inputValue: newMotormanInput.value,
        inputReadOnly: newMotormanInput.readOnly,
        hasMotormanData: !!newMotormanInput.dataset.motormenData,
        hasClickHandler: !!newMotormanInput.onclick
    });
    
    // Add temporary debugging to the input
    newMotormanInput.addEventListener('change', function(e) {
        console.log('🔔 MODAL INPUT CHANGE:', {
            value: this.value,
            timestamp: new Date().toISOString()
        });
    });
    
    newMotormanInput.addEventListener('motormanSelected', function(e) {
        console.log('🔔 MODAL MOTORMAN SELECTED:', e.detail);
    });
    
    return {
        modal,
        input: newMotormanInput
    };
}

// ===== STEP 5: MAKE FUNCTIONS GLOBALLY ACCESSIBLE =====

window.loadMotormenForJFO = loadMotormenForJFO;
window.populateMotormanSelectSafe = populateMotormanSelectSafe;
window.enhanceInputWithMotormanSelection = enhanceInputWithMotormanSelection;
window.showMotormanSelectionPopup = showMotormanSelectionPopup;
window.selectMotormanFromPopup = selectMotormanFromPopupFixed; // Use the fixed version
window.selectMotormanFromPopupFixed = selectMotormanFromPopupFixed;
window.enhanceExistingModalWithMotormanSelect = enhanceExistingModalWithMotormanSelect;
window.testMotormanFormat = testMotormanFormat;
window.testMotormanPopup = testMotormanPopup;
window.debugCurrentModal = debugCurrentModal;


// Auto-enhance any existing modals
setTimeout(() => {
    const existingModal = document.getElementById('activeReassignmentModal');
    if (existingModal) {
        console.log('🔍 Found existing modal, enhancing...');
        enhanceExistingModalWithMotormanSelect();
    }
}, 1000);

// 20. Demo data generator for testing (when backend is not available)
function generateDemoMotormanData() {
    console.log('🎭 Generating demo motorman data...');
    
    const demoMotormen = [
        {
            cmsid: 'CSTS001',
            motorman_name: 'Rajesh Kumar',
            mobile_number: '9876543210',
            pf_number: 'PF001',
            hrms_id: 'HRMS001',
            office: 'CSMT'
        },
        {
            cmsid: 'KYN002',
            motorman_name: 'Suresh Patil',
            mobile_number: '9876543211',
            pf_number: 'PF002',
            hrms_id: 'HRMS002',
            office: 'KYN'
        },
        {
            cmsid: 'PNVL003',
            motorman_name: 'Amit Sharma',
            mobile_number: '9876543212',
            pf_number: 'PF003',
            hrms_id: 'HRMS003',
            office: 'PNVL'
        },
        {
            cmsid: 'CSTS004',
            motorman_name: 'Deepak Yadav',
            mobile_number: '9876543213',
            pf_number: 'PF004',
            hrms_id: 'HRMS004',
            office: 'CSMT'
        },
        {
            cmsid: 'KYN005',
            motorman_name: 'Sanjay Gupta',
            mobile_number: '9876543214',
            pf_number: 'PF005',
            hrms_id: 'HRMS005',
            office: 'KYN'
        }
    ];
    
    return demoMotormen;
}

// 21. Fallback functions for when backend is not available
async function loadMotormanListDemo() {
    console.log('🎭 Loading demo motorman list...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    currentMotormanList = generateDemoMotormanData();
    displayMotormanList(currentMotormanList);
    
    console.log('✅ Demo motorman list loaded');
}

function loadMotormanStatisticsDemo() {
    console.log('🎭 Loading demo statistics...');
    
    const demoStats = {
        total: 5,
        csmt: 2,
        kyn: 2,
        pnvl: 1
    };
    
    updateStatisticsDisplay(demoStats);
    
    console.log('✅ Demo statistics loaded');
}

// 22. Override existing functions to use enhanced versions
function applyMotormanManagementEnhancements() {
    console.log('🔧 Applying motorman management enhancements...');
    
    // Override the existing showJFOTab function
    if (typeof window.showJFOTab === 'function') {
        window.showJFOTabOriginal = window.showJFOTab;
    }
    window.showJFOTab = showJFOTabEnhanced;
    
    // Make functions globally accessible
    window.initializeMotormanManagement = initializeMotormanManagement;
    window.handleMotormanUpload = handleMotormanUpload;
    window.loadMotormanStatistics = loadMotormanStatistics;
    window.showMotormanSelectionModal = showMotormanSelectionModal;
    window.closeMotormanSelectionModal = closeMotormanSelectionModal;
    window.filterMotormanList = filterMotormanList;
    window.clearMotormanFilters = clearMotormanFilters;
    window.confirmMotormanSelection = confirmMotormanSelection;
    window.selectMotorman = selectMotorman;
    window.testMotormanAPI = testMotormanAPI;
    
    console.log('✅ Motorman management enhancements applied');
}

// 23. Auto-initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Apply enhancements after the main JFO console is ready
    setTimeout(() => {
        applyMotormanManagementEnhancements();
        
        // Test if we're integrated with backend
        if (window.app?.integrated) {
            console.log('🔗 Backend integration detected');
        } else {
            console.log('🎭 Running in demo mode - using demo data');
            
            // Override functions to use demo versions
            window.loadMotormanList = loadMotormanListDemo;
            window.loadMotormanStatistics = loadMotormanStatisticsDemo;
        }
    }, 1000);
});

// 24. Debug and testing functions
window.motormanDebug = {
    testUpload: function() {
        console.log('🧪 Testing CSV upload with demo data...');
        
        const demoCSV = `cmsid,motorman,mobile number,pf number,hrms id
CSTS001,Rajesh Kumar,9876543210,PF001,HRMS001
KYN002,Suresh Patil,9876543211,PF002,HRMS002
PNVL003,Amit Sharma,9876543212,PF003,HRMS003`;
        
        const motormanData = parseMotormanCSV(demoCSV);
        console.log('✅ Parsed demo data:', motormanData);
        
        return motormanData;
    },
    
    testSelection: function() {
        showMotormanSelectionModal('testMotormanInput');
    },
    
    loadDemo: function() {
        loadMotormanListDemo();
        loadMotormanStatisticsDemo();
    },
    
    testAPI: function() {
        testMotormanAPI();
    }
};

