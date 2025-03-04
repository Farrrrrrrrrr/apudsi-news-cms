import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simplified connection creation for initial setup
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

const runSetup = async () => {
  console.log('🚀 Starting database setup...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // Create users table
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'editor',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create articles table
    console.log('Creating articles table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author_id INT,
        image_path VARCHAR(255),
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Articles table created');
    
    // Check if admin user exists
    console.log('Checking for admin user...');
    const [existingAdmins] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@gmail.com']
    );
    
    // Create admin user if doesn't exist
    if (existingAdmins.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('12345678', 10);
      
      await connection.execute(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@gmail.com', hashedPassword, 'Admin User', 'superuser']
      );
      console.log('✅ Admin user created with password: 12345678');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\nYou can now login with:');
    console.log('- Email: admin@gmail.com');
    console.log('- Password: 12345678');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

runSetup().then(() => process.exit(0));
