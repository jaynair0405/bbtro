require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();

// Use the same connection pool configuration as your server.js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});

function isBcryptHash(str = "") {
  // bcrypt hashes usually start with $2a$ $2b$ or $2y$ and are ~60 chars
  return typeof str === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

// Login route - Updated to handle realm parameter from new frontend
router.post('/login', async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "");
  const realm = (req.body.realm || "suburban").toLowerCase();

  // Missing fields → 400
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Look up user in the specified realm
    const [rows] = await conn.query(
      'SELECT id, username, password, role, full_name, office, realm FROM users WHERE username = ? AND realm = ? LIMIT 1',
      [username, realm]
    );

    // No such user → 401
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Password check
    if (isBcryptHash(user.password)) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        // Wrong password (bcrypt) → 401
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      // Legacy plaintext → compare then upgrade to bcrypt
      if (password !== user.password) {
        // Wrong password (plaintext) → 401
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      try {
        const newHash = await bcrypt.hash(password, 12);
        await conn.query('UPDATE users SET password = ? WHERE id = ? LIMIT 1', [newHash, user.id]);
        user.password = newHash;
      } catch (e) {
        console.error('Password upgrade failed:', e);
      }
    }

    // Auth OK → create session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      office: user.office,
      realm: user.realm
    };

    // Redirect target by realm
    let redirectUrl = '/';
    if (user.realm === 'suburban') {
      redirectUrl = '/index.html';
    } else if (user.realm === 'division') {
      redirectUrl = '/div';
    }

    return res.json({
      success: true,
      role: user.role,
      office: user.office,
      name: user.full_name,
      realm: user.realm,
      redirect: redirectUrl
    });

  } catch (error) {
    console.error('Login error:', error);
    // Server error → 500
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  } finally {
    if (conn) conn.release();
  }
});


// Get current user info
router.get('/current-user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Check authentication status (for the new frontend)
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});


// Logout (POST)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false });
    res.clearCookie('connect.sid', { path: '/' });   // 👈 clear session cookie
    return res.json({ success: true, redirect: '/' });
  });
});
// Logout (GET)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid', { path: '/' });   // 👈 clear session cookie
    return res.redirect('/');
  });
});

module.exports = router;