require('dotenv').config();
const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dashboardRoutes = require('./routes/dashboardRoutes');

const uploadRoutes = require('./routes/uploadRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const motormanRoutes = require('./routes/motormanRoutes_new');
const scheduleRoutes = require('./routes/scheduleRoutes');
const memuRoutes = require('./routes/memuRoutes');
const specialTrainsRoutes = require('./routes/specialTrainsRoutes');
const reassignmentRoutes = require('./routes/reassignmentRoutes');
const wheelMovementRoutes = require('./routes/wheelMovementRoutes');

const utilityRoutes = require('./routes/utilityRoutes');
const session = require('express-session');


const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(session({
  //secret: 'railway-bbtro-secret-key-2025',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      secure: false // Keep false for development (http)
  }
}));

// ✅ Protect /index.html so only logged-in suburban users can open it
app.get('/index.html', (req, res) => {
  // Not logged in → go to portal
  if (!req.session.user) return res.redirect('/');

  // Wrong realm → send them to portal (or choose another page)
  if (req.session.user.realm !== 'suburban') return res.redirect('/');

  // OK → serve the suburban app
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Only logged-in Division users may open the Division UI file
app.get('/div/index.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');                 // not logged in
  if (req.session.user.realm !== 'division') return res.redirect('/'); // wrong realm
  res.sendFile(path.join(__dirname, 'public', 'div', 'index.html'));
});

// ✅ Guarded Division entry at /div
app.get('/div', (req, res) => {
  if (!req.session.user) return res.redirect('/');            // not logged in
  if (req.session.user.realm !== 'division') return res.redirect('/'); // wrong realm
  // serve the division UI
  res.sendFile(path.join(__dirname, 'public', 'div', 'index.html'));
});

// ✅ Protect specific division portal HTML pages
app.get('/div/settings.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'settings.html'));
});

app.get('/div/training-types-manager.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'training-types-manager.html'));
});

app.get('/div/personnel-stores-manager.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'personnel-stores-manager.html'));
});

app.get('/div/biodata-form-design.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'biodata-form-design.html'));
});

app.get('/div/bulk-upload-staff.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'bulk-upload-staff.html'));
});

app.get('/div/cli-management.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'cli-management.html'));
});

app.get('/div/biodataform.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'biodataform.html'));
});

app.get('/div/training-due-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'training-due-report.html'));
});

app.get('/div/decategorized-crew-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'decategorized-crew-report.html'));
});

app.get('/div/drafted-staff-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'drafted-staff-report.html'));
});

app.get('/div/staff-office-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'staff-office-report.html'));
});

app.get('/div/staff-profile-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'staff-profile-report.html'));
});

// If a logged-in user opens /portal.html, send them to their area
app.get('/portal.html', (req, res) => {
  if (req.session.user) {
    const realm = req.session.user.realm;
    return res.redirect(realm === 'division' ? '/div' : '/index.html');
  }
  // Not logged in → show the portal normally
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

// Disable service workers in local/dev to avoid stale pages
app.get(['/service-worker.js', '/sw.js', '/firebase-messaging-sw.js'], (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.type('application/javascript');
  res.status(410).send('// Service worker disabled in dev');
});

// ⛔ Prevent caching of HTML in dev (so back button can't show stale pages)
app.disable('etag');
app.use((req, res, next) => {
  const isProtectedRoute =
    req.method === 'GET' &&
    (req.path === '/' ||
     req.path === '/div' ||
     req.path === '/index.html' ||
     req.path === '/portal.html' ||
     req.path.endsWith('.html'));

  if (isProtectedRoute) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
  }
  next();
});

// Canonical root: send logged-in users to their area; others see the portal
app.get('/', (req, res) => {
  if (req.session.user) {
    const realm = req.session.user.realm;
    return res.redirect(realm === 'division' ? '/div' : '/index.html');
  }
  // Not logged in → portal
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

// Quick View: Suburban
app.get('/sub/quick', (req, res) => {
  if (!req.session.user) return res.redirect('/');                    // not logged in
  if (req.session.user.realm !== 'suburban') return res.redirect('/'); // wrong realm
  return res.redirect('/index.html');                                  // open suburban app
});

// Quick View: Division
app.get('/div/quick', (req, res) => {
  if (!req.session.user) return res.redirect('/');                   // not logged in
  if (req.session.user.realm !== 'division') return res.redirect('/'); // wrong realm
  return res.redirect('/div');                                        // open division portal
});


app.use(express.static(path.join(__dirname, "public"), { index: false }));

// Add realm-based authentication middleware
const requireRealm = (realm) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (req.session.user.realm !== realm) {
            return res.status(403).json({ error: 'Access denied to this module' });
        }
        next();
    };
};

// 🔐 API auth guard (allowlist login + current-user + status)
const apiAllowlist = new Set(['/api/login', '/api/current-user', '/api/status']);

app.use((req, res, next) => {
  // Only guard /api/* paths
  if (!req.path.startsWith('/api/')) return next();

  // Allowlisted endpoints (login & user probe)
  if (apiAllowlist.has(req.path)) return next();

  // Everything else under /api requires a session
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  next();
});

// Require a specific role
const requireRole = (role) => (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Authentication required' });
  if ((req.session.user.role || '').toLowerCase() !== role.toLowerCase()) {
    return res.status(403).json({ error: 'Access denied: insufficient role' });
  }
  next();
};

// Protect admin-only APIs
app.use('/api/wheel-movement', requireRole('admin'), wheelMovementRoutes);









app.use('/api', authRoutes);

// Root route - landing page and smart redirects
app.get('/', (req, res) => {
  if (req.session.user) {
      // User is already logged in, redirect based on their realm
      const realm = req.session.user.realm;
      if (realm === 'suburban') {
          return res.redirect('/index.html'); // Your original suburban system
      } else if (realm === 'division') {
          return res.redirect('/div'); // Division portal
      } else {
          // Unknown realm, clear session and show landing page
          req.session.destroy();
          return res.sendFile(path.join(__dirname, 'public', 'portal.html'));
      }
  } else {
      // User not logged in, serve the new landing page
      res.sendFile(path.join(__dirname, 'public', 'portal.html'));
  }
});

// Suburban system route - ONLY ONE, NO DUPLICATES
// app.get('/', (req, res) => {
//   if (req.session.user) {
//       const realm = req.session.user.realm;
//       if (realm === 'suburban') {
//           return res.redirect('/index.html');
//       } else if (realm === 'division') {
//           return res.redirect('/div');
//       } else {
//           req.session.destroy();
//           return res.sendFile(path.join(__dirname, 'public', 'portal.html'));
//       }
//   } else {
//       // Check if portal.html exists before serving
//       const portalPath = path.join(__dirname, 'public', 'portal.html');
//       if (require('fs').existsSync(portalPath)) {
//           res.sendFile(portalPath);
//       } else {
//           res.status(500).send('Portal page not found. Please check server configuration.');
//       }
//   }
// });

// Division portal route (guarded by session + realm)
// app.get('/div', (req, res) => {
//   if (req.session.user && req.session.user.realm === 'division') {
//     return res.sendFile(path.join(__dirname, 'public', 'div', 'index.html'));
//   } else if (req.session.user && req.session.user.realm === 'suburban') {
//     return res.redirect('/index.html');
//   } else {
//     return res.redirect('/');
//   }
// });


//Updated for Git workflow practice - 18-09-2025

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/cancellations", cancellationRoutes);
app.use("/cancel", cancellationRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/motormen", motormanRoutes);
app.use("/api/memu", memuRoutes);
app.use("/upload", uploadRoutes);
app.use("/api/special-trains", specialTrainsRoutes);
app.use("/api/jfo", reassignmentRoutes);
app.use("/api/wheel-movement", wheelMovementRoutes);
app.use("/api", utilityRoutes);


// File upload middleware
const upload = multer({ dest: "uploads/" });
// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});

// Make pool available to routes (add this line)
app.locals.pool = pool;

// Division portal routes
const divisionDashboardRoutes = require('./routes/division/dashboardRoutes');
const trainingTypesRoutes = require('./routes/division/trainingTypesRoutes');
const personnelStoresRoutes = require('./routes/division/personnelStoresRoutes');
const bulkUploadRoutes = require('./routes/division/bulkUploadRoutes');
const cliRoutes = require('./routes/division/cliRoutes');
const transferRoutes = require('./routes/division/transferRoutes');
const familyRoutes = require('./routes/division/familyRoutes');
const promotionRoutes = require('./routes/division/promotionRoutes');
const trainingRoutes = require('./routes/division/trainingRoutes');
const detonatorRoutes = require('./routes/division/detonatorRoutes');
const disciplineRoutes = require('./routes/division/disciplineRoutes');
const draftingRoutes = require('./routes/division/draftingRoutes');

// Add division routes with realm protection
app.use("/api/division", requireRealm('division'), divisionDashboardRoutes);
app.use("/api/division/training-types", requireRealm('division'), trainingTypesRoutes);
app.use("/api/division/personnel-stores", requireRealm('division'), personnelStoresRoutes);
app.use("/api/division/bulk-upload", requireRealm('division'), bulkUploadRoutes);
app.use("/api/division/cli", requireRealm('division'), cliRoutes);
app.use("/api/division", requireRealm('division'), transferRoutes);
app.use("/api/division/family", requireRealm('division'), familyRoutes);
app.use("/api/division/promotions", requireRealm('division'), promotionRoutes);
app.use("/api/division/training", requireRealm('division'), trainingRoutes);
app.use("/api/division/detonators", requireRealm('division'), detonatorRoutes);
app.use("/api/division/discipline", requireRealm('division'), disciplineRoutes);
app.use("/api/division/drafting", requireRealm('division'), draftingRoutes);
// Add this directly in server.js (temporary solution)
app.get('/api/waiting-details', async (req, res) => {
  try {
      console.log('📋 Loading waiting details...');
      
      const conn = await pool.getConnection();
      const query = `SELECT detail_number, sign_on_time, sign_off_time, total_duty_hours FROM waiting_details`;
      const [waitingDetails] = await conn.query(query);
      conn.release();
      
      console.log(`✅ Found ${waitingDetails.length} waiting details`);
      
      res.json({
          success: true,
          data: waitingDetails,
          count: waitingDetails.length
      });
      
  } catch (error) {
      console.error('❌ Error fetching waiting details:', error);
      res.status(500).json({ 
          success: false, 
          error: error.message 
      });
  }
});

// ===== ERROR HANDLING =====

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== SERVER STARTUP =====

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("📊 MySQL Railway Management System");
  console.log("✅ All API endpoints configured");
});


