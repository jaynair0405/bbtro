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
app.use(express.static(path.join(__dirname, "public")));
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

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  if (req.session.user) {
      // User is logged in, redirect to main page
      res.redirect('/index.html');
  } else {
      // User not logged in, redirect to login
      res.redirect('/login.html');
  }
});

// Protect the main index.html page
app.get('/index.html', (req, res, next) => {
  if (req.session.user) {
      // User is authenticated, serve the file normally
      next();
  } else {
      // User not authenticated, redirect to login
      res.redirect('/login.html');
  }
});

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
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "0000",           // change as per your user
//   password: "888888",  // change as per your password
//   database: "bbtro",
//   connectionLimit: 10,   // Maximum number of connections in pool
//   queueLimit: 0,         // Maximum number of connection requests in queue (0 = unlimited)
//   multipleStatements: false
// });
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


