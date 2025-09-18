// jfo-common.js - Shared utilities across all JFO Console sections

function showLoading() {
    console.log('🔄 showLoading called');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    } else {
        console.error('❌ Loading overlay element not found');
    }
}

function hideLoading() {
    console.log('🔄 hideLoading called');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
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
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, duration);
}