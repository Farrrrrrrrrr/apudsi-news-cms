import bcrypt from 'bcryptjs';
import { query } from './db.js';

export async function runMigrations() {
  try {
    // Create users table
    await query(`
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

    // Create articles table
    await query(`
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

    // Check if admin user exists
    const existingAdmin = await query('SELECT * FROM users WHERE email = ?', ['admin@gmail.com']);
    
    // Seed admin user if not exists
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('12345678', 10);
      
      await query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@gmail.com', hashedPassword, 'Admin User', 'superuser']
      );
      console.log('Admin user created');
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
}
