const mysql = require('mysql2/promise');
const { getDatabaseConfig } = require('./db-config');

const dbConfig = getDatabaseConfig();

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
