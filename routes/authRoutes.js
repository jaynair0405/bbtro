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
      'SELECT id, username, password, role, full_name, office, realm, div_role, div_office_code, can_access_sub_spm, training_center_id FROM users WHERE username = ? AND realm = ? LIMIT 1',

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
      realm: user.realm,
      // Division-specific fields
      div_role: user.div_role,
      div_office_code: user.div_office_code,
      can_access_sub_spm: !!user.can_access_sub_spm,
      training_center_id: user.training_center_id || null
    };

    // Redirect target by realm
    let redirectUrl = '/';
    if (user.realm === 'suburban') {
      redirectUrl = '/index.html';
    } else if (user.realm === 'division') {
      // Training centre users go directly to centre portal
      if (user.div_role === 'trgcentre_admin') {
        redirectUrl = '/div/training-centre.html';
      } else if (['lpc', 'ctlc', 'ctlc_view'].includes(user.div_role)) {
        // LPC + CTLC (Chief Traction Loco Controller) + ctlc_view (read-only) → Control Office portal
        redirectUrl = '/control-office/';
      } else if (user.div_role === 'clicms') {
        // HQ-CLI (CMS Due List) user → straight to the tool (PWA landing)
        redirectUrl = '/clicms/';
      } else {
        redirectUrl = '/div';
      }
    }

    return res.json({
      success: true,
      role: user.role,
      office: user.office,
      name: user.full_name,
      realm: user.realm,
      // Division-specific fields
      div_role: user.div_role,
      div_office_code: user.div_office_code,
      training_center_id: user.training_center_id || null,
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

// Change Password route
router.post('/change-password', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.user.id;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'New passwords do not match' 
    });
  }

  // Check password length
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      success: false, 
      message: 'New password must be at least 8 characters long' 
    });
  }

  // Check if new password is same as current
  if (currentPassword === newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'New password must be different from current password' 
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Get user's current password from database
    const [rows] = await conn.query(
      'SELECT password FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = rows[0];

    // Verify current password
    let currentPasswordValid = false;
    
    if (isBcryptHash(user.password)) {
      currentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      // Legacy plaintext password
      currentPasswordValid = (currentPassword === user.password);
    }

    if (!currentPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await conn.query(
      'UPDATE users SET password = ? WHERE id = ? LIMIT 1',
      [newPasswordHash, userId]
    );

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to change password. Please try again.' 
    });
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