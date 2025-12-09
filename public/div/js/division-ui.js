// Division Portal UI - Dropdowns, Menus, and Interactions

// Office dropdown functionality
function toggleOfficeDropdown() {
    const dropdown = document.getElementById('officeDropdownMenu');
    const trigger = document.querySelector('.office-dropdown-trigger');
    
    if (dropdown.classList.contains('show')) {
        closeOfficeDropdown();
    } else {
        dropdown.classList.add('show');
        trigger.classList.add('active');
    }
}

function closeOfficeDropdown() {
    const dropdown = document.getElementById('officeDropdownMenu');
    const trigger = document.querySelector('.office-dropdown-trigger');
    
    dropdown.classList.remove('show');
    trigger.classList.remove('active');
}

function selectOffice(code, fullName, icon, staffCount) {
    // Update the current office display
    const currentOffice = document.querySelector('.office-current');
    currentOffice.innerHTML = `
        <div class="office-icon">${icon}</div>
        <div>
            <div class="office-name">${code}</div>
            <div class="office-location">${fullName}</div>
        </div>
    `;

    // Update header title and badge
    const activeModuleName = document.querySelector('.sidebar-nav-link.active').textContent.replace(/\d+/g, '').trim();

    if (code === 'ALL') {
        document.querySelector('.header-title h1').textContent = `Division ${activeModuleName}`;
        document.querySelector('.office-badge').textContent = 'Division Admin';
    } else {
        document.querySelector('.header-title h1').textContent = `${code} - ${activeModuleName}`;
        document.querySelector('.office-badge').textContent = 'Your Office';
    }

    // Update stats (simulate loading new data)
    updateDashboardStats(code, staffCount);

    // Update selected state in dropdown
    document.querySelectorAll('.office-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Close dropdown
    closeOfficeDropdown();

    // Show loading effect
    showLoadingEffect();
}

async function updateDashboardStats(office, staffCount) {
    try {
        // Fetch real stats from API
        // For "ALL", don't pass office_code to get division-wide stats
        const url = office === 'ALL'
            ? '/api/division/dashboard-stats'
            : `/api/division/dashboard-stats?office_code=${office}`;

        const response = await fetch(url, {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const result = await response.json();

        if (result.success) {
            const stats = result.data;

            // Update stat cards
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers[0]) statNumbers[0].textContent = stats.totalStaff;
            if (statNumbers[1]) statNumbers[1].textContent = stats.pendingPME;
            if (statNumbers[2]) statNumbers[2].textContent = stats.leaveApplications;
            if (statNumbers[3]) statNumbers[3].textContent = stats.attendanceRate.toFixed(1) + '%';
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        // Fallback to showing passed staffCount or 0
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = staffCount || '0';
        if (statNumbers[1]) statNumbers[1].textContent = '0';
        if (statNumbers[2]) statNumbers[2].textContent = '0';
        if (statNumbers[3]) statNumbers[3].textContent = '97.5%';
    }
}

function showLoadingEffect() {
    // Add a subtle loading effect
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.style.opacity = '0.6';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 300);
    });
}

// User menu functionality
function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Clear browser history and force redirect
        if (window.history.replaceState) {
            window.history.replaceState(null, null, '/');
        }
        window.location.replace('/');
        
    } catch (error) {
        console.error('Logout error:', error);
        if (window.history.replaceState) {
            window.history.replaceState(null, null, '/');
        }
        window.location.replace('/');
    }
}

// Mobile menu toggle
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

// Get proper icon/abbreviation for office
function getOfficeIcon(officeCode) {
    const iconMap = {
        'CSMT-ML': 'CSMT',
        'CSMT-SUB': 'CSTS',
        'KYN-ML': 'KYN',
        'KYN-SUB': 'KYNS',
        'PNVL-ML': 'PNVL',
        'PNVL-SUB': 'PNVS',
        'NRL': 'NRL',
        'IGP': 'IGP',
        'CLA': 'CLA',
        'LNL': 'LNLX'
    };
    return iconMap[officeCode] || officeCode.substring(0, 2).toUpperCase();
}

// Load offices from database and populate dropdown
async function loadOfficeDropdown() {
    try {
        // Get current user info first
        const userResponse = await fetch('/api/current-user', {
            credentials: 'same-origin'
        });

        if (!userResponse.ok) {
            console.error('Failed to get user info');
            return;
        }

        const currentUser = await userResponse.json();
        const userRole = currentUser.div_role;
        const userOfficeCode = currentUser.div_office_code;

        const response = await fetch('/api/division/offices', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch offices');
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            let offices = result.data;

            // Filter offices based on user role
            if (userRole === 'office_hr' && userOfficeCode) {
                // Office HR: Show only their office
                offices = offices.filter(office => office.office_code === userOfficeCode);

                // Hide dropdown arrow for office HR (only one office)
                const dropdownTrigger = document.querySelector('.office-dropdown-trigger');
                if (dropdownTrigger) {
                    dropdownTrigger.style.cursor = 'default';
                    dropdownTrigger.onclick = null; // Disable click
                }
                const arrow = document.querySelector('.office-dropdown-arrow');
                if (arrow) arrow.style.display = 'none';
            }
            // Division admin sees all offices (no filter)

            const dropdownMenu = document.getElementById('officeDropdownMenu');

            // Clear existing options
            dropdownMenu.innerHTML = '';

            // For division admin, add "All Offices" option first
            if (userRole === 'division_admin') {
                const allOfficesHTML = `
                    <div class="office-option selected" onclick="selectOffice('ALL', 'All Offices - Division View', '🏢', 0)">
                        <div class="office-icon">🏢</div>
                        <div class="office-details">
                            <div class="office-name">ALL</div>
                            <div class="office-location">All Offices - Division View</div>
                        </div>
                        <div class="office-stats">Division-wide</div>
                    </div>
                `;
                dropdownMenu.innerHTML += allOfficesHTML;
            }

            // Add each office
            offices.forEach((office) => {
                const officeIcon = getOfficeIcon(office.office_code);
                const isSelected = (userRole !== 'division_admin' && offices.length === 1) ? 'selected' : '';

                const optionHTML = `
                    <div class="office-option ${isSelected}" onclick="selectOffice('${office.office_code}', '${office.office_name}', '${officeIcon}', 0)">
                        <div class="office-icon">${officeIcon}</div>
                        <div class="office-details">
                            <div class="office-name">${office.office_code}</div>
                            <div class="office-location">${office.office_name}</div>
                        </div>
                        <div class="office-stats">Loading...</div>
                    </div>
                `;
                dropdownMenu.innerHTML += optionHTML;
            });

            // Set default view
            const currentOfficeDiv = document.querySelector('.office-current');

            if (userRole === 'division_admin') {
                // Division admin: Default to "All Offices" view
                currentOfficeDiv.innerHTML = `
                    <div class="office-icon">🏢</div>
                    <div>
                        <div class="office-name">ALL</div>
                        <div class="office-location">All Offices - Division View</div>
                    </div>
                `;
                document.querySelector('.header-title h1').textContent = 'Division Dashboard';
                document.querySelector('.office-badge').textContent = 'Division Admin';
            } else if (offices.length > 0) {
                // Office HR: Show their office
                const firstOffice = offices[0];
                const officeIcon = getOfficeIcon(firstOffice.office_code);

                currentOfficeDiv.innerHTML = `
                    <div class="office-icon">${officeIcon}</div>
                    <div>
                        <div class="office-name">${firstOffice.office_code}</div>
                        <div class="office-location">${firstOffice.office_name}</div>
                    </div>
                `;

                document.querySelector('.header-title h1').textContent = `${firstOffice.office_code} Dashboard`;
            }
        }
    } catch (error) {
        console.error('Error loading offices:', error);
    }
}

// Load initial dashboard data
// Load user information and display in header
async function loadUserInfo() {
    try {
        const response = await fetch('/api/current-user', {
            credentials: 'same-origin'
        });

        if (response.ok) {
            const user = await response.json();

            // Generate initials from full name
            const nameParts = (user.full_name || user.username || '').split(' ');
            let initials = '';
            if (nameParts.length >= 2) {
                // Take first letter of first name and first letter of last name
                initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            } else if (nameParts.length === 1) {
                // Take first two letters if only one name
                initials = nameParts[0].substring(0, 2).toUpperCase();
            } else {
                initials = '--';
            }

            // Map role to display name
            let roleDisplay = 'User';
            if (user.div_role === 'division_admin') {
                roleDisplay = 'Division Admin';
            } else if (user.div_role === 'office_hr') {
                roleDisplay = 'Office HR';
            } else if (user.role === 'admin') {
                roleDisplay = 'Admin';
            }

            // Update header user display
            document.getElementById('userAvatar').textContent = initials;
            document.getElementById('userName').textContent = user.full_name || user.username || 'User';
            document.getElementById('userRole').textContent = roleDisplay;

            // Update dropdown menu
            document.getElementById('userNameDropdown').textContent = user.full_name || user.username || 'User';
            document.getElementById('userRoleDropdown').textContent = roleDisplay;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadInitialDashboard() {
    // Get current office from the UI
    const currentOfficeCode = document.querySelector('.office-current .office-name')?.textContent || 'CSMT-SUB';
    await updateDashboardStats(currentOfficeCode);
    // Load pending transfers count
    await loadPendingTransfersCount();
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load user info, offices, then dashboard stats
    loadUserInfo();
    loadOfficeDropdown().then(() => {
        loadInitialDashboard();
    });

    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow navigation for links with actual URLs (not just "#")
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Let the browser handle the navigation
                return;
            }

            e.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Update header title based on clicked item
            const text = this.textContent.replace(/\d+/g, '').trim();
            const currentOffice = document.querySelector('.office-current .office-name').textContent;
            document.querySelector('.header-title h1').textContent = `${currentOffice} - ${text}`;
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Searching for:', this.value);
            // TODO: Implement actual search
        });
    }
    
    // Quick action functionality
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Skip if button has onclick handler (like Process Transfer)
            if (this.hasAttribute('onclick')) {
                return;
            }
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // real navigation link → allow default behaviour
                return;
            }
            e.preventDefault();
            const actionText = this.textContent.trim();
            alert(`${actionText} functionality would open here`);
            // TODO: Implement actual actions
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.office-dropdown')) {
            closeOfficeDropdown();
        }
        if (!e.target.closest('.header-user') && !e.target.closest('#userDropdownMenu')) {
            const userMenu = document.getElementById('userDropdownMenu');
            if (userMenu) userMenu.style.display = 'none';
        }
    });
});

// ========== TRANSFER PROCESSING FUNCTIONS ==========

let pendingTransfers = [];
let currentTransferRequest = null;

// Open transfer processing modal
async function openTransferModal() {
    const modal = document.getElementById('transferProcessingModal');
    if (modal) {
        modal.style.display = 'flex';
        await loadPendingTransfers();
    }
}

// Close transfer processing modal
function closeTransferModal() {
    const modal = document.getElementById('transferProcessingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load pending transfer requests
async function loadPendingTransfers() {
    const loadingDiv = document.getElementById('transfersLoading');
    const emptyDiv = document.getElementById('transfersEmpty');
    const tableDiv = document.getElementById('transfersTable');
    const tbody = document.getElementById('transfersTableBody');

    // Show loading
    loadingDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
    tableDiv.style.display = 'none';

    try {
        const response = await fetch('/api/division/transfer-requests/pending', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch pending transfers');
        }

        const result = await response.json();

        pendingTransfers = result.data || [];

        // Hide loading
        loadingDiv.style.display = 'none';

        if (pendingTransfers.length === 0) {
            // Show empty state
            emptyDiv.style.display = 'block';
        } else {
            // Show table with data
            tableDiv.style.display = 'block';
            renderTransferRequests();
        }

    } catch (error) {
        console.error('Error loading pending transfers:', error);
        loadingDiv.innerHTML = '<div style="color: #ef4444;">Error loading transfer requests. Please try again.</div>';
    }
}

// Render transfer requests in table
function renderTransferRequests() {
    const tbody = document.getElementById('transfersTableBody');

    tbody.innerHTML = pendingTransfers.map((transfer, index) => {
        // Extract category from remarks
        let category = '-';
        if (transfer.remarks && transfer.remarks.includes('Category:')) {
            const match = transfer.remarks.match(/Category:\s*([^.]+)/);
            if (match) category = match[1].trim();
        }

        const requestDate = transfer.request_date ? new Date(transfer.request_date).toLocaleDateString('en-IN') : '-';

        return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px;">
                    <div style="font-weight: 500; color: #1a1d21;">${transfer.staff_name || '-'}</div>
                    <div style="font-size: 12px; color: #6b7280;">HRMS: ${transfer.staff_hrms_id}</div>
                </td>
                <td style="padding: 12px;">
                    <div style="font-weight: 500; color: #1a1d21;">${transfer.from_office_name || transfer.from_office_code}</div>
                    <div style="font-size: 12px; color: #6b7280;">${transfer.from_office_code}</div>
                </td>
                <td style="padding: 12px;">
                    <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px;">
                        ${transfer.current_cms_id}
                    </span>
                </td>
                <td style="padding: 12px;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                        ${category}
                    </span>
                </td>
                <td style="padding: 12px; color: #6b7280; font-size: 14px;">${requestDate}</td>
                <td style="padding: 12px;">
                    <button onclick="openAcceptModal(${index})"
                            style="padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; margin-right: 6px;">
                        Accept
                    </button>
                    <button onclick="openRejectModal(${index})"
                            style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">
                        Reject
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open accept transfer modal
function openAcceptModal(index) {
    const transfer = pendingTransfers[index];
    currentTransferRequest = transfer;

    const modal = document.getElementById('acceptTransferModal');
    const infoDiv = document.getElementById('acceptTransferInfo');

    // Populate staff info
    infoDiv.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>Staff:</strong> ${transfer.staff_name} (${transfer.staff_hrms_id})</div>
        <div style="margin-bottom: 8px;"><strong>From Office:</strong> ${transfer.from_office_name || transfer.from_office_code}</div>
        <div><strong>Current CMS ID:</strong> ${transfer.current_cms_id}</div>
    `;

    // Clear form
    document.getElementById('newCmsId').value = '';
    document.getElementById('acceptRemarks').value = '';

    // Show modal
    modal.style.display = 'flex';
}

// Close accept modal
function closeAcceptModal() {
    const modal = document.getElementById('acceptTransferModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentTransferRequest = null;
}

// Open reject transfer modal
function openRejectModal(index) {
    const transfer = pendingTransfers[index];
    currentTransferRequest = transfer;

    const modal = document.getElementById('rejectTransferModal');
    const infoDiv = document.getElementById('rejectTransferInfo');

    // Populate staff info
    infoDiv.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>Staff:</strong> ${transfer.staff_name} (${transfer.staff_hrms_id})</div>
        <div style="margin-bottom: 8px;"><strong>From Office:</strong> ${transfer.from_office_name || transfer.from_office_code}</div>
        <div><strong>Current CMS ID:</strong> ${transfer.current_cms_id}</div>
    `;

    // Clear form
    document.getElementById('rejectReason').value = '';

    // Show modal
    modal.style.display = 'flex';
}

// Close reject modal
function closeRejectModal() {
    const modal = document.getElementById('rejectTransferModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentTransferRequest = null;
}

// Handle accept transfer form submission
document.addEventListener('DOMContentLoaded', function() {
    const acceptForm = document.getElementById('acceptTransferForm');

    if (acceptForm) {
        acceptForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!currentTransferRequest) {
                alert('No transfer request selected');
                return;
            }

            const newCmsId = document.getElementById('newCmsId').value.trim();
            const remarks = document.getElementById('acceptRemarks').value.trim();

            if (!newCmsId) {
                alert('Please enter the new CMS ID');
                return;
            }

            const submitBtn = document.getElementById('acceptTransferBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            try {
                const response = await fetch(`/api/division/transfer-request/${currentTransferRequest.request_id}/accept`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        new_cms_id: newCmsId,
                        remarks: remarks
                    })
                });

                const result = await response.json();

                if (result.success) {
                    let message = 'Transfer request accepted successfully!\n\nStaff member has been added to your office.';

                    // Add info message if staff is returning to original CMS ID
                    if (result.info) {
                        message += '\n\nℹ️ INFO: ' + result.info;
                    }

                    alert(message);
                    closeAcceptModal();
                    closeTransferModal();
                    // Reload pending transfers count
                    loadPendingTransfersCount();
                } else {
                    alert('Error: ' + result.error);
                }

            } catch (error) {
                console.error('Error accepting transfer:', error);
                alert('Error processing transfer request');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Accept Transfer';
            }
        });
    }
});

// Handle reject transfer form submission
document.addEventListener('DOMContentLoaded', function() {
    const rejectForm = document.getElementById('rejectTransferForm');

    if (rejectForm) {
        rejectForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!currentTransferRequest) {
                alert('No transfer request selected');
                return;
            }

            const reason = document.getElementById('rejectReason').value.trim();

            if (!reason) {
                alert('Please provide a reason for rejection');
                return;
            }

            const submitBtn = document.getElementById('rejectTransferBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            try {
                const response = await fetch(`/api/division/transfer-request/${currentTransferRequest.request_id}/reject`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        remarks: reason
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Transfer request rejected.\n\nThe requesting office has been notified.');
                    closeRejectModal();
                    closeTransferModal();
                    // Reload pending transfers count
                    loadPendingTransfersCount();
                } else {
                    alert('Error: ' + result.error);
                }

            } catch (error) {
                console.error('Error rejecting transfer:', error);
                alert('Error processing transfer request');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reject Transfer';
            }
        });
    }
});

// Load and update pending transfers count
async function loadPendingTransfersCount() {
    try {
        const response = await fetch('/api/division/transfer-requests/pending', {
            credentials: 'same-origin'
        });

        if (response.ok) {
            const result = await response.json();
            const count = result.data ? result.data.length : 0;

            // Update badge in sidebar
            const badge = document.getElementById('transferBadge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'inline';
            }

            // Update badge in quick actions
            const quickBadge = document.getElementById('transferQuickBadge');
            if (quickBadge) {
                quickBadge.textContent = count;
                quickBadge.style.display = count > 0 ? 'inline' : 'none';
            }
        }
    } catch (error) {
        console.error('Error loading pending transfers count:', error);
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const form = document.getElementById('changePasswordForm');
    const errorDiv = document.getElementById('passwordChangeError');
    const successDiv = document.getElementById('passwordChangeSuccess');

    // Reset form and messages
    if (form) form.reset();
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';

    // Show modal
    if (modal) {
        modal.style.display = 'flex';
    }

    // Close user menu
    const userMenu = document.getElementById('userDropdownMenu');
    if (userMenu) userMenu.style.display = 'none';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle Change Password Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const errorDiv = document.getElementById('passwordChangeError');
            const successDiv = document.getElementById('passwordChangeSuccess');
            const submitBtn = document.getElementById('changePasswordBtn');
            
            // Hide previous messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            // Client-side validation
            if (newPassword !== confirmPassword) {
                errorDiv.textContent = 'New passwords do not match';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (newPassword.length < 8) {
                errorDiv.textContent = 'New password must be at least 8 characters';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (currentPassword === newPassword) {
                errorDiv.textContent = 'New password must be different from current password';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Disable submit button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Changing...';
            
            try {
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message
                    successDiv.textContent = data.message;
                    successDiv.style.display = 'block';
                    
                    // Clear form
                    changePasswordForm.reset();
                    
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        closeChangePasswordModal();
                    }, 2000);
                    
                } else {
                    // Show error message
                    errorDiv.textContent = data.message;
                    errorDiv.style.display = 'block';
                }
                
            } catch (error) {
                console.error('Change password error:', error);
                errorDiv.textContent = 'Connection error. Please try again.';
                errorDiv.style.display = 'block';
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Change Password';
            }
        });
    }
});

// ========== CLI NOMINATIONS FUNCTIONALITY ==========
let allCLIsHome = [];
let selectedStaffForCLIChange = null;
let staffSearchResultsChange = [];
let staffSearchResultsHistory = [];

// Load CLIs on page load
async function loadCLIsForHome() {
    try {
        const response = await fetch('/api/division/cli/list-all');
        const result = await response.json();
        if (result.success) {
            allCLIsHome = result.data;
        }
    } catch (error) {
        console.error('Error loading CLIs:', error);
    }
}

// Call this on page load
loadCLIsForHome();

// Load CLI recent changes count for Recent Activity
async function loadCLIRecentChanges() {
    try {
        const response = await fetch('/api/division/cli/recent-changes');
        const result = await response.json();

        if (result.success && result.count > 0) {
            document.getElementById('cliChangesCount').textContent = result.count;
            document.getElementById('cliChangesActivity').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading CLI recent changes:', error);
    }
}

// Load on page load
loadCLIRecentChanges();

// Load transfer activity for Recent Activity
async function loadTransferActivity() {
    try {
        const response = await fetch('/api/division/transfer-activity');
        const result = await response.json();

        if (result.success && result.total > 0) {
            const subtitleElement = document.querySelector('#transferActivity .activity-subtitle');

            if (result.isAdmin) {
                // Division admin - show total transfers across division
                subtitleElement.innerHTML = `<strong>${result.total}</strong> staff transfers across all offices`;
            } else {
                // Office user - show incoming/outgoing for their office
                subtitleElement.innerHTML = `<span id="transferOutgoing">${result.outgoing}</span> outgoing • <span id="transferIncoming">${result.incoming}</span> incoming`;
            }

            document.getElementById('transferActivity').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading transfer activity:', error);
    }
}

// Load on page load
loadTransferActivity();

// Load PME completed for Recent Activity
async function loadPMECompleted() {
    try {
        const response = await fetch('/api/division/pme-completed');
        const result = await response.json();

        if (result.success && result.count > 0) {
            document.getElementById('pmeCompletedCount').textContent = result.count;
            document.getElementById('pmeCompletedActivity').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading PME completed:', error);
    }
}

// Load on page load
loadPMECompleted();

// Load P/Store activity for Recent Activity
let pstoreStaffList = [];

async function loadPStoreActivity() {
    try {
        const response = await fetch('/api/division/pstore-updates-today');
        const result = await response.json();

        if (result.success && result.count > 0) {
            pstoreStaffList = result.data;
            document.getElementById('pstoreCount').textContent = result.count;
            document.getElementById('pstoreActivity').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading P/Store activity:', error);
    }
}

// Show modal with staff names who updated P/Store
function showPStoreNamesModal() {
    const modal = document.getElementById('pstoreNamesModal');
    const namesList = document.getElementById('pstoreNamesList');

    // Generate list of staff names
    if (pstoreStaffList.length > 0) {
        namesList.innerHTML = pstoreStaffList.map(staff => `
            <div style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: 500; color: #1a1d21;">${staff.name}</div>
                <div style="font-size: 12px; color: #6b7280;">HRMS: ${staff.hrms_id}</div>
            </div>
        `).join('');
    } else {
        namesList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 24px;">No staff found</p>';
    }

    modal.style.display = 'flex';
}

// Close P/Store names modal
function closePStoreNamesModal() {
    const modal = document.getElementById('pstoreNamesModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load on page load
loadPStoreActivity();

// Open CLI Nominations Options Modal
function openCLINominationsOptionsModal() {
    document.getElementById('cliNominationsOptionsModal').style.display = 'flex';
}

function closeCLINominationsOptionsModal() {
    document.getElementById('cliNominationsOptionsModal').style.display = 'none';
}

// ===== CHANGE CLI FROM HOME =====

function openChangeCLIFromHome() {
    closeCLINominationsOptionsModal();
    document.getElementById('changeCLIModalHome').style.display = 'flex';
    document.getElementById('cliChangeEffectiveDate').valueAsDate = new Date();

    // Setup staff search with debounce
    const searchInput = document.getElementById('cliChangeStaffSearch');
    searchInput.value = '';
    document.getElementById('cliChangeStaffInfo').style.display = 'none';
    document.getElementById('cliChangeFormFields').style.display = 'none';
    document.getElementById('cliChangeSubmitBtn').disabled = true;
    selectedStaffForCLIChange = null;

    searchInput.addEventListener('input', debounce(async function() {
        const term = this.value.trim();
        if (term.length < 2) return;

        try {
            const response = await fetch(`/api/division/staff-search/${encodeURIComponent(term)}`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                staffSearchResultsChange = result.data;
                const datalist = document.getElementById('cliChangeStaffSuggestions');
                datalist.innerHTML = result.data.map(staff =>
                    `<option value="${staff.hrms_id}">${staff.name} - ${staff.current_cms_id || staff.hrms_id}</option>`
                ).join('');
            }
        } catch (error) {
            console.error('Error searching staff:', error);
        }
    }, 300));

    searchInput.addEventListener('change', function() {
        const term = this.value.trim();
        const staff = staffSearchResultsChange.find(s => s.hrms_id === term);

        if (staff) {
            selectStaffForCLIChange(staff);
        }
    });
}

function selectStaffForCLIChange(staff) {
    selectedStaffForCLIChange = staff;

    // Check if staff has a CLI
    if (!staff.current_cli_id || !staff.cli_name) {
        alert('This staff member does not have a CLI assigned yet. Please use CLI Management to assign one first.');
        return;
    }

    // Check if we have nomination_id
    if (!staff.nomination_id) {
        alert('Unable to find active nomination for this staff member');
        return;
    }

    // Show staff info
    document.getElementById('cliChangeStaffName').textContent = staff.name;
    document.getElementById('cliChangeStaffHRMS').textContent = staff.hrms_id;
    document.getElementById('cliChangeCurrentCLI').textContent = staff.cli_name;
    document.getElementById('cliChangeStaffInfo').style.display = 'block';

    // Load CLIs into dropdown (exclude current CLI)
    const select = document.getElementById('cliChangeNewCLI');
    select.innerHTML = '<option value="">Select new CLI</option>';
    allCLIsHome.forEach(cli => {
        if (cli.cli_id !== staff.current_cli_id) {
            select.innerHTML += `<option value="${cli.cli_id}">${cli.cli_name} (${cli.cmsid})</option>`;
        }
    });

    // Show form fields
    document.getElementById('cliChangeFormFields').style.display = 'block';
    document.getElementById('cliChangeSubmitBtn').disabled = false;
}

function closeChangeCLIModalHome() {
    document.getElementById('changeCLIModalHome').style.display = 'none';
    selectedStaffForCLIChange = null;
}

async function submitCLIChangeFromHome() {
    const newCLIId = document.getElementById('cliChangeNewCLI').value;
    const effectiveDate = document.getElementById('cliChangeEffectiveDate').value;

    if (!selectedStaffForCLIChange) {
        alert('Please select a staff member');
        return;
    }

    if (!newCLIId) {
        alert('Please select new CLI');
        return;
    }

    if (!effectiveDate) {
        alert('Please select effective date');
        return;
    }

    const btn = document.getElementById('cliChangeSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Changing...';

    try {
        const response = await fetch(`/api/division/cli/nomination/${selectedStaffForCLIChange.nomination_id}/change`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_cli_id: newCLIId,
                nominated_from_date: effectiveDate,
                remarks: document.getElementById('cliChangeRemarks').value || null
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeChangeCLIModalHome();
        } else {
            alert(result.error || 'Failed to change CLI');
        }
    } catch (error) {
        console.error('Error changing CLI:', error);
        alert('Failed to change CLI');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Change CLI';
    }
}

// ===== NOMINATION HISTORY =====

function openNominationHistoryFromHome() {
    closeCLINominationsOptionsModal();
    document.getElementById('nominationHistoryModal').style.display = 'flex';

    // Setup staff search with debounce
    const searchInput = document.getElementById('historyStaffSearch');
    searchInput.value = '';
    document.getElementById('historyStaffInfo').style.display = 'none';
    document.getElementById('nominationTimeline').style.display = 'none';

    searchInput.addEventListener('input', debounce(async function() {
        const term = this.value.trim();
        if (term.length < 2) return;

        try {
            const response = await fetch(`/api/division/staff-search/${encodeURIComponent(term)}`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                staffSearchResultsHistory = result.data;
                const datalist = document.getElementById('historyStaffSuggestions');
                datalist.innerHTML = result.data.map(staff =>
                    `<option value="${staff.hrms_id}">${staff.name} - ${staff.current_cms_id || staff.hrms_id}</option>`
                ).join('');
            }
        } catch (error) {
            console.error('Error searching staff:', error);
        }
    }, 300));

    searchInput.addEventListener('change', async function() {
        const term = this.value.trim();
        const staff = staffSearchResultsHistory.find(s => s.hrms_id === term);

        if (staff) {
            await loadNominationHistory(staff);
        }
    });
}

async function loadNominationHistory(staff) {
    // Show staff info
    document.getElementById('historyStaffName').textContent = staff.name;
    document.getElementById('historyStaffHRMS').textContent = staff.hrms_id;
    document.getElementById('historyStaffOffice').textContent = staff.office_name || staff.current_office_code;
    document.getElementById('historyStaffDesignation').textContent = staff.designation_name || 'N/A';
    document.getElementById('historyCurrentCLI').textContent = staff.cli_name || 'Not Assigned';
    document.getElementById('historyStaffInfo').style.display = 'block';

    // Fetch nomination history
    try {
        const response = await fetch(`/api/division/cli/nomination-history/${staff.hrms_id}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            renderNominationTimeline(result.data);
            document.getElementById('nominationTimeline').style.display = 'block';
        } else {
            document.getElementById('nominationTimelineContent').innerHTML =
                '<p style="color: #6b7280; text-align: center; padding: 32px;">No nomination history found</p>';
            document.getElementById('nominationTimeline').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading nomination history:', error);
        document.getElementById('nominationTimelineContent').innerHTML =
            '<p style="color: #dc2626; text-align: center; padding: 32px;">Failed to load nomination history</p>';
        document.getElementById('nominationTimeline').style.display = 'block';
    }
}

function getStatusDisplay(status) {
    const statusMap = {
        'Active': { text: 'Active', color: '#2563eb' },
        'Expired': { text: 'Changed', color: '#f59e0b' },
        'Transferred': { text: 'Ended', color: '#6b7280' }
    };
    return statusMap[status] || { text: status, color: '#6b7280' };
}

function renderNominationTimeline(nominations) {
    const content = document.getElementById('nominationTimelineContent');

    content.innerHTML = nominations.map((nom, idx) => {
        const isActive = nom.status === 'Active';
        const statusInfo = getStatusDisplay(nom.status);
        const duration = calculateDuration(nom.nominated_from_date, nom.nominated_to_date);

        return `
            <div style="position: relative; padding-left: 32px; padding-bottom: 24px; ${idx === nominations.length - 1 ? '' : 'border-left: 2px solid #e5e7eb;'}">
                <div style="position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: ${isActive ? '#2563eb' : '#94a3b8'}; border: 3px solid white; box-shadow: 0 0 0 1px #e5e7eb;"></div>

                <div style="background: ${isActive ? '#eff6ff' : '#f9fafb'}; border: 1px solid ${isActive ? '#bfdbfe' : '#e5e7eb'}; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <h4 style="margin: 0; color: #1a1d21; font-size: 16px;">${nom.cli_name}</h4>
                        <span style="padding: 4px 8px; background: ${statusInfo.color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
                            ${statusInfo.text}
                        </span>
                    </div>

                    <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
                        <strong>CLI ID:</strong> ${nom.cmsid}
                    </p>

                    <p style="margin: 8px 0 4px; color: #374151; font-size: 14px;">
                        <strong>Period:</strong> ${formatDate(nom.nominated_from_date)}
                        ${nom.nominated_to_date ? `→ ${formatDate(nom.nominated_to_date)}` : '→ Current'}
                    </p>

                    <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
                        <strong>Duration:</strong> ${duration}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

function calculateDuration(fromDate, toDate) {
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date();

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

    return parts.join(', ');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function closeNominationHistoryModal() {
    document.getElementById('nominationHistoryModal').style.display = 'none';
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
