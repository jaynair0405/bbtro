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

function updateDashboardStats(office, staffCount) {
    // Simulate different stats for different offices
    const stats = {
        'CSMT': { staff: 450, pme: 23, leave: 8, attendance: 97.5 },
        'PNVL': { staff: 320, pme: 18, leave: 5, attendance: 96.8 },
        'KYN': { staff: 280, pme: 15, leave: 6, attendance: 98.2 },
        'NRL': { staff: 150, pme: 8, leave: 3, attendance: 97.1 },
        'LNL': { staff: 180, pme: 12, leave: 4, attendance: 96.9 },
        'IGP': { staff: 120, pme: 7, leave: 2, attendance: 98.5 },
        'CLA': { staff: 200, pme: 11, leave: 7, attendance: 97.3 }
    };
    
    const officeStats = stats[office] || stats['CSMT'];
    
    // Update stat cards
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = officeStats.staff;
    if (statNumbers[1]) statNumbers[1].textContent = officeStats.pme;
    if (statNumbers[2]) statNumbers[2].textContent = officeStats.leave;
    if (statNumbers[3]) statNumbers[3].textContent = officeStats.attendance + '%';
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

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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