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
    
    // Update header title
    const activeModuleName = document.querySelector('.sidebar-nav-link.active').textContent.replace(/\d+/g, '').trim();
    document.querySelector('.header-title h1').textContent = `${code} - ${activeModuleName}`;
    
    // Update header badge
    document.querySelector('.office-badge').textContent = 'Your Office';
    
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
        const response = await fetch(`/api/division/dashboard-stats?office_code=${office}`, {
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

            // Add each office
            offices.forEach((office, index) => {
                const officeIcon = getOfficeIcon(office.office_code);
                const isSelected = index === 0 ? 'selected' : '';

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

            // Set first office as default
            if (offices.length > 0) {
                const firstOffice = offices[0];
                const currentOfficeDiv = document.querySelector('.office-current');
                const officeIcon = getOfficeIcon(firstOffice.office_code);

                currentOfficeDiv.innerHTML = `
                    <div class="office-icon">${officeIcon}</div>
                    <div>
                        <div class="office-name">${firstOffice.office_code}</div>
                        <div class="office-location">${firstOffice.office_name}</div>
                    </div>
                `;

                // Update header
                document.querySelector('.header-title h1').textContent = `${firstOffice.office_code} Dashboard`;
            }
        }
    } catch (error) {
        console.error('Error loading offices:', error);
    }
}

// Load initial dashboard data
async function loadInitialDashboard() {
    // Get current office from the UI
    const currentOfficeCode = document.querySelector('.office-current .office-name')?.textContent || 'CSMT-SUB';
    await updateDashboardStats(currentOfficeCode);
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load offices first, then dashboard stats
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