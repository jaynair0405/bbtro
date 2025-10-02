
require('dotenv').config();
const mysql = require("mysql2/promise");

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,   // Maximum number of connections in pool
  queueLimit: 0,         // Maximum number of connection requests in queue (0 = unlimited)
  multipleStatements: false
});

module.exports = pool;
