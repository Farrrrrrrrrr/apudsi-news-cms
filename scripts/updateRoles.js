import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection to database
const createConnection = async () => {
  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };
  
  return await mysql.createConnection(config);
};

const updateRoles = async () => {
  console.log('🔄 Updating role system...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // 1. Update user table to support new roles
    console.log('Updating users table for enhanced role system...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('superadmin', 'writer', 'editor', 'publisher') NOT NULL DEFAULT 'writer'
    `);
    
    // 2. Update existing users - Convert 'superuser' to 'superadmin', editor remains the same
    await connection.execute(`
      UPDATE users SET role = 'superadmin' WHERE role = 'superuser';
    `);
    
    console.log('🎉 Role system update completed successfully!');
    
  } catch (error) {
    console.error('❌ Role system update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateRoles().then(() => process.exit(0));
