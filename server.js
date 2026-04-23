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
const MySQLStore = require('express-mysql-session')(session);
const kioskRoutes = require('./routes/kioskRoutes');
const { getSlateDisplay } = require('./utils/kioskDisplays');

const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = 3000;
console.log("✅ server.js loaded — Sub-SPM change marker v1");

// app.use(express.json());

// app.use(session({
//   //secret: 'railway-bbtro-secret-key-2025',
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { 
//       maxAge: 8 * 60 * 60 * 1000, // 8 hours
//       secure: false // Keep false for development (http)
//   }
// }));

const sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 8 * 60 * 60 * 1000, // 8 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};

const sessionStore = new MySQLStore(sessionStoreOptions);                                  
                                                                                             
  // Add error and success logging                                                           
  sessionStore.on('error', function(error) {                                                 
    console.error('[SESSION STORE ERROR]:', error);                                          
  });                                                                                        
                                                                                             
  sessionStore.on('connect', function() {                                                    
    console.log('[SESSION STORE] Connected to MySQL');                                       
  });                                                                                        
                                                                                             
  console.log('[SESSION STORE] Initialized'); 

// app.use(express.json());
// ✅ Do NOT body-parse proxied RTIS requests; it breaks POST proxying
// app.use((req, res, next) => {
//   if (req.originalUrl.startsWith("/spm/rtis")) return next();
//   express.json()(req, res, next);
// });
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/spm/rtis")) return next();
  if (req.originalUrl.startsWith("/spm/sub-spm")) return next();
  express.json()(req, res, next);
});

// Session middleware with MySQL store
app.use(session({
  key: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      secure: false, // Keep false for development (http)
      httpOnly: true,
      sameSite: 'lax'
  }
}));
// Test route - check if session works                                                     
  app.get('/test-session', (req, res) => {                                                   
    console.log('[TEST] Session ID:', req.sessionID);                                        
    console.log('[TEST] Session:', req.session);                                             
                                                                                             
    req.session.testValue = 'Session is working!';                                           
    req.session.testTime = new Date();                                                       
                                                                                             
    res.json({                                                                               
      message: 'Session test completed',                                                     
      sessionID: req.sessionID,                                                              
      session: req.session                                                                   
    });                                                                                      
  });               

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

// ✅ Training Centre Portal - accessible by trgcentre_admin and division_admin
app.get('/div/training-centre.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  const role = req.session.user.div_role;
  if (role !== 'trgcentre_admin' && role !== 'division_admin') return res.redirect('/div');
  res.sendFile(path.join(__dirname, 'public', 'div', 'training-centre.html'));
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

app.get('/div/biodata-sheet.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'biodata-sheet.html'));
});

app.get('/div/custom-report.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'custom-report.html'));
});

app.get('/div/cvvrs.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'cvvrs.html'));
});

app.get('/div/cvvrs-reports.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'cvvrs-reports.html'));
});

app.get('/div/adas.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'adas.html'));
});

app.get('/div/adas-reports.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'adas-reports.html'));
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

app.get('/div/ctr-management.html', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (req.session.user.realm !== 'division') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'div', 'ctr-management.html'));
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

// Protect all /div/* static pages (Division realm only)
app.use("/div", (req, res, next) => {
  const user = req.session?.user;
  if (!user) return res.redirect("/");              // not logged in
  if (user.realm !== "division") return res.redirect("/"); // wrong realm
  next();
});

// ✅ Protect all /spm/rtis/* (Division realm only) — must be ABOVE proxy
app.use("/spm/rtis", (req, res, next) => {
  console.log("[RTIS GUARD HIT]", req.method, req.originalUrl, "session?", !!req.session?.user);
  const user = req.session?.user;
  if (!user) return res.redirect("/");
  if (user.realm !== "division") return res.redirect("/");
  next();
});
// Guard for Sub-SPM (division only)
app.use("/spm/sub-spm", (req, res, next) => {
  const user = req.session?.user;
  if (!user) return res.redirect("/");
  if (user.realm !== "division") return res.redirect("/");

  // allow if flag present and truthy
  if (!user.can_access_sub_spm) {
    return res.status(403).send("Sub-SPM access denied");
  }

  next();
});


app.use("/spm/rtis", (req, res, next) => {
  console.log("[PROXY HIT]", req.method, req.originalUrl);
  next();
});

function fixRequestBody(proxyReq, req) {
  if (!req.body || Object.keys(req.body).length === 0) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
  proxyReq.end(); // ✅ important: finish the proxied request
}


const { createProxyMiddleware } = require("http-proxy-middleware");

app.use(
  "/spm/rtis",
  createProxyMiddleware({
    target: "http://localhost:8765",
    changeOrigin: true,
    ws: true,
    pathRewrite: { "^/spm/rtis": "" },

    timeout: 600000,
    proxyTimeout: 600000,

    onProxyReq: (proxyReq, req) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    fixRequestBody(proxyReq, req);
  }
},

    onError(err, req, res) {
      console.error("[RTIS PROXY ERROR]", err.message, req.method, req.originalUrl);
      if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "RTIS proxy error", error: err.message }));
    },
  })
);

// ---- Sub-SPM reverse proxy (local) ----
console.log("✅ Sub-SPM proxy mounted at /spm/sub-spm");

app.use(
  "/spm/sub-spm",
  createProxyMiddleware({
    target: "http://127.0.0.1:8766",
    changeOrigin: true,
    ws: true,
    pathRewrite: { "^/spm/sub-spm": "" },
    timeout: 600000,
    proxyTimeout: 600000,
    onProxyReq: (proxyReq, req) => {
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        fixRequestBody(proxyReq, req);
      }
    },
    onError(err, req, res) {
      console.error("[SUB-SPM PROXY ERROR]", err.message, req.method, req.originalUrl);
      if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Sub-SPM proxy error", error: err.message }));
    },
  })
);


// ---- SATARK Counselling reverse proxy ----
app.use(
  "/counselling",
  createProxyMiddleware({
    target: "http://127.0.0.1:5003",
    changeOrigin: true,
    timeout: 600000,
    proxyTimeout: 600000,
    onError(err, req, res) {
      console.error("[COUNSELLING PROXY ERROR]", err.message, req.method, req.originalUrl);
      if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Counselling app proxy error", error: err.message }));
    },
  })
);
console.log("✅ Counselling proxy mounted at /counselling → :5003");

app.get('/kiosk/slate/:displayId', (req, res) => {
  if (!getSlateDisplay(req.params.displayId)) {
    return res.status(404).send('Kiosk display not found');
  }

  res.sendFile(path.join(__dirname, 'public', 'kiosk', 'slate.html'));
});

app.get('/kiosk/assets/slate-theme.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'div', 'css', 'slate-theme.css'));
});

app.get('/kiosk/assets/slate-common.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'div', 'js', 'slate-common.js'));
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

app.use('/api/kiosk', kioskRoutes);

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
const rtisRoutes = require("./routes/division/rtisRoutes");
const retirementRoutes = require("./routes/division/retirementRoutes");
const leaveRoutes = require("./routes/division/leaveRoutes");
const midnightPositionRoutes = require("./routes/division/midnightPositionRoutes");
const ctrRoutes = require('./routes/division/ctrRoutes');
const categoryRoutes = require('./routes/division/categoryRoutes');
const slateRoutes = require('./routes/division/slateRoutes');
const trainingLetterRoutes = require('./routes/division/trainingLetterRoutes');
const cvvrsRoutes = require('./routes/division/cvvrsRoutes');
const adasRoutes = require('./routes/division/adasRoutes');
const trainingCentreRoutes = require('./routes/division/trainingCentreRoutes');

// Add division routes with realm protection
app.use("/api/division/leave", requireRealm("division"), leaveRoutes); // mount early to avoid any catch-alls
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
app.use("/api/division/rtis", requireRealm("division"), rtisRoutes);
app.use("/api/division/retirement", requireRealm("division"), retirementRoutes);
app.use("/api/division/midnight-position", requireRealm("division"), midnightPositionRoutes);
app.use("/api/division/ctr", requireRealm('division'), ctrRoutes);
app.use("/api/division/category", requireRealm('division'), categoryRoutes);
app.use("/api/division/slate", requireRealm('division'), slateRoutes);
app.use("/api/division/training-letters", requireRealm('division'), trainingLetterRoutes);
app.use("/api/division/training-centre", requireRealm('division'), trainingCentreRoutes);
app.use("/api/division/cvvrs", requireRealm('division'), cvvrsRoutes);
app.use("/api/division/adas", requireRealm('division'), adasRoutes);

// Session info endpoint
app.get('/api/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            loggedIn: true,
            user: {
                username: req.session.user.username,
                name: req.session.user.name,
                realm: req.session.user.realm,
                office_code: req.session.user.div_office_code || req.session.user.office_code || req.session.user.officeCode || null
            }
        });
    } else {
        res.json({ loggedIn: false, user: null });
    }
});

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
