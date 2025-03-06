import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Create database connection
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

const updateSchema = async () => {
  console.log('🔄 Updating database schema...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

    // Update users table to include all required roles
    console.log('Updating user roles...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('superuser', 'writer', 'editor', 'publisher') NOT NULL DEFAULT 'writer'
    `);
    console.log('✅ User roles updated');

    // Add workflow-related fields to articles table
    console.log('Adding workflow fields to articles table...');
    
    // Check for existing columns to prevent errors
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'
    `, [process.env.MYSQL_DATABASE]);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    // Add workflow_status if it doesn't exist
    if (!columnNames.includes('workflow_status')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN workflow_status ENUM('draft', 'in_review', 'rejected', 'approved', 'published') 
        DEFAULT 'draft' AFTER status
      `);
      console.log('✅ Added workflow_status column');
    }
    
    // Add reviewer_id if it doesn't exist
    if (!columnNames.includes('reviewer_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewer_id INT,
        ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
      `);
      console.log('✅ Added reviewer_id column');
    }
    
    // Add publisher_id if it doesn't exist
    if (!columnNames.includes('publisher_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN publisher_id INT,
        ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
      console.log('✅ Added publisher_id column');
    }
    
    // Add workflow timestamp fields
    const timestampColumns = [
      { name: 'submitted_at', message: 'submission' },
      { name: 'reviewed_at', message: 'review' },
      { name: 'published_at', message: 'publication' }
    ];
    
    for (const col of timestampColumns) {
      if (!columnNames.includes(col.name)) {
        await connection.execute(`
          ALTER TABLE articles 
          ADD COLUMN ${col.name} DATETIME NULL
        `);
        console.log(`✅ Added ${col.name} timestamp for ${col.message} tracking`);
      }
    }
    
    // Add review_feedback column if it doesn't exist
    if (!columnNames.includes('review_feedback')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN review_feedback TEXT NULL
      `);
      console.log('✅ Added review_feedback column');
    }

    // Create notifications table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        article_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (article_id) REFERENCES articles(id)
      )
    `);
    console.log('✅ Created notifications table');

    // Create media library table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media_library (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL,
        width INT,
        height INT,
        alt_text VARCHAR(255),
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Created media_library table');

    // Create example users for each role if they don't exist
    console.log('Creating example users for each role...');
    const roles = ['writer', 'editor', 'publisher'];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (const role of roles) {
      const [userExists] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [`${role}@example.com`]
      );
      
      if (userExists[0].count === 0) {
        await connection.execute(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [`${role}@example.com`, hashedPassword, `Example ${role.charAt(0).toUpperCase() + role.slice(1)}`, role]
        );
        console.log(`✅ Created example ${role} user`);
      }
    }

    console.log('🎉 Database schema update completed successfully!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Run the schema update
updateSchema().then(() => process.exit(0));
