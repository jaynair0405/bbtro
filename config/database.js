const mysql = require("mysql2/promise");

// MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "jay",           // change as per your user
  password: "4310jay",  // change as per your password
  database: "bbtro",
  connectionLimit: 10,   // Maximum number of connections in pool
  queueLimit: 0,         // Maximum number of connection requests in queue (0 = unlimited)
  multipleStatements: false
});

module.exports = pool;