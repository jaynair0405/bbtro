// CRITICAL SECURITY: Prevent unauthorized access via back button
(function() {
  'use strict';
  
  // Hide entire page immediately
  document.documentElement.style.visibility = 'hidden';
  
  // 1. Disable back button navigation
  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function() {
      window.history.pushState(null, null, window.location.href);
    });
  }
  
  // 2. Verify session - SYNCHRONOUS check
  async function verifyAuth() {
    try {
      const res = await fetch('/api/current-user', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store'
      });
      
      if (!res.ok || res.status === 401) {
        window.location.replace('/');
        return false;
      }
      
      const user = await res.json();
      
      if (user.realm !== 'division') {
        window.location.replace('/');
        return false;
      }
      
      // Auth OK - show page
      document.documentElement.style.visibility = 'visible';
      return true;
      
    } catch (err) {
      window.location.replace('/');
      return false;
    }
  }
  
  // Run verification immediately
  verifyAuth();
  
  // 3. Re-verify on visibility change
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      verifyAuth();
    }
  });
  
  // 4. Catch bfcache restore
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      verifyAuth();
    }
  });
})();