// =====================================================
// PARTIAL REASSIGNMENT FUNCTIONS
// These functions handle partial train reassignments
// Extracted from original jfo-script.js
// =====================================================

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

// Create success message for partial reassignments
function createPartialReassignmentSuccessMessage(reassignmentData) {
    const actionDesc = getActionDescription(reassignmentData.reassignmentType);
    const details = getPartialActionDetails(reassignmentData);
    
    return `✅ ${actionDesc} completed!\n📋 Detail ${reassignmentData.originalDetail}\n${details.summary}`;
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

// Process detail reassignment function
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

// Export all functions to global window object
window.updateAppearanceDataWithPartialReassignment = updateAppearanceDataWithPartialReassignment;
window.createPartialReassignmentEntry = createPartialReassignmentEntry;
window.updateAppearanceDataWithDetailReassignment = updateAppearanceDataWithDetailReassignment;
window.getPartialActionDetails = getPartialActionDetails;
window.createPartialReassignmentSuccessMessage = createPartialReassignmentSuccessMessage;
window.getActionDescription = getActionDescription;
window.showPartialReassignmentConfirmation = showPartialReassignmentConfirmation;
window.closeReassignmentConfirmation = closeReassignmentConfirmation;
window.processDetailReassignment = processDetailReassignment;

console.log('✅ Partial reassignment functions loaded successfully');