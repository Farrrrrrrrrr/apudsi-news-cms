import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Function to create database connection configuration
const createConnectionConfig = () => {
  // Check if using connection string or individual parameters
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Connection configuration
  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  // Add proper SSL configuration if enabled
  if (process.env.MYSQL_SSL === 'true') {
    config.ssl = {
      // Don't verify server certificate
      rejectUnauthorized: false
    };
    
    // If you have a CA certificate, uncomment this:
    // config.ssl.ca = fs.readFileSync(path.join(process.cwd(), 'ca.pem')).toString();
  }

  return config;
};

// Create a connection pool lazily
let _pool = null;

function getPool() {
  if (!_pool) {
    _pool = mysql.createPool(createConnectionConfig());
  }
  return _pool;
}

// Helper function to run queries
export const query = async (text, params = []) => {
  const pool = getPool();
  const start = Date.now();
  const [rows] = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: Array.isArray(rows) ? rows.length : 0 });
  return { rows };
};

// Helper to get a single row by ID
export const getById = async (table, id) => {
  const result = await query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return result.rows[0];
};

// Helper to handle INSERT with returning ID
export const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const pool = getPool();
  const result = await pool.query(sql, values);
  
  // Get the inserted ID
  const insertId = result[0].insertId;
  
  // Fetch the newly created record
  if (insertId) {
    return await getById(table, insertId);
  }
  return null;
};
