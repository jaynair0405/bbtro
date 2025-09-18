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


// Login route
router.post('/login', async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "");

  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(
      'SELECT id, username, password, role, full_name, office FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];

    // If stored password is bcrypt → compare
    if (isBcryptHash(user.password)) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      // Legacy plaintext in DB → compare directly once, then auto-upgrade to bcrypt
      if (password !== user.password) {
        return res.json({ success: false, message: 'Invalid username or password' });
      }
      try {
        const newHash = await bcrypt.hash(password, 12);
        await conn.query('UPDATE users SET password = ? WHERE id = ? LIMIT 1', [newHash, user.id]);
        user.password = newHash; // now hashed going forward
      } catch (e) {
        // If update fails, still let them in this time—but log it
        console.error('Password upgrade failed:', e);
      }
    }

    // At this point, auth succeeded
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      office: user.office
    };

    return res.json({
      success: true,
      role: user.role,
      office: user.office,
      name: user.full_name
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.json({ success: false, message: 'Login failed. Please try again.' });
  } finally {
    if (conn) conn.release();
  }
});



// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
    
//     try {
//         const conn = await pool.getConnection();
//         const [users] = await conn.query(
//             'SELECT * FROM users WHERE username = ?', 
//             [username]
//         );
//         conn.release();
        
//         if (users.length > 0 && password === users[0].password) {
//             req.session.user = {
//                 id: users[0].id,
//                 username: users[0].username,
//                 role: users[0].role,
//                 full_name: users[0].full_name,
//                 office: users[0].office
//             };
            
//             res.json({ 
//                 success: true, 
//                 role: users[0].role,
//                 office: users[0].office,
//                 name: users[0].full_name
//             });
//         } else {
//             res.json({ success: false, message: 'Invalid username or password' });
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         res.json({ success: false, message: 'Login failed. Please try again.' });
//     }
// });

// Get current user info
router.get('/current-user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;