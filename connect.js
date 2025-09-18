// connect.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL!');
  connection.query('SELECT * FROM test_users', (err, results) => {
    if (err) throw err;
    console.log('📋 Results:', results);
    connection.end();
  });
});