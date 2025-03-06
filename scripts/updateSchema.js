import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simplified connection creation for update
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
    
    // 1. Expand user roles
    console.log('Updating users with new roles...');
    
    // Add roles enum check if needed
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('writer', 'editor', 'publisher', 'superuser') NOT NULL DEFAULT 'writer'
    `);
    
    // Update existing 'editor' users to 'writer'
    await connection.execute(`
      UPDATE users 
      SET role = 'writer' 
      WHERE role = 'editor' AND role != 'superuser'
    `);
    
    console.log('✅ User roles updated');
    
    // 2. Add workflow fields to articles table
    console.log('Adding workflow fields to articles table...');
    
    // Check for each column first to avoid errors if already exists
    const columns = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'
    `, [process.env.MYSQL_DATABASE]);
    
    const existingColumns = columns[0].map(column => column.COLUMN_NAME.toLowerCase());
    
    // Add workflow status if it doesn't exist
    if (!existingColumns.includes('workflow_status')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN workflow_status ENUM('draft', 'in_review', 'approved', 'rejected', 'published') 
        DEFAULT 'draft' AFTER status
      `);
      
      // Set initial workflow_status to match status for existing articles
      await connection.execute(`
        UPDATE articles 
        SET workflow_status = status 
        WHERE workflow_status IS NULL
      `);
    }
    
    // Add submitted_at timestamp
    if (!existingColumns.includes('submitted_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN submitted_at DATETIME NULL AFTER workflow_status
      `);
    }
    
    // Add reviewer_id
    if (!existingColumns.includes('reviewer_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewer_id INT NULL AFTER submitted_at,
        ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
      `);
    }
    
    // Add reviewed_at timestamp
    if (!existingColumns.includes('reviewed_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewed_at DATETIME NULL AFTER reviewer_id
      `);
    }
    
    // Add publisher_id
    if (!existingColumns.includes('publisher_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN publisher_id INT NULL AFTER reviewed_at,
        ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
    }
    
    // Add published_at timestamp
    if (!existingColumns.includes('published_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN published_at DATETIME NULL AFTER publisher_id
      `);
    }
    
    // Add rejection reason
    if (!existingColumns.includes('rejection_reason')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN rejection_reason TEXT NULL AFTER published_at
      `);
    }
    
    console.log('✅ Workflow fields added to articles table');
    
    // 3. Create notifications table for workflow communication
    console.log('Creating notifications table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        article_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (article_id) REFERENCES articles(id)
      )
    `);
    
    console.log('✅ Notifications table created');
    
    // Update superuser with all roles
    await connection.execute(`
      INSERT INTO users (name, email, password, role)
      SELECT 'Editor User', 'editor@example.com', 
             (SELECT password FROM users WHERE email = 'admin@gmail.com' LIMIT 1),
             'editor'
      FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'editor@example.com')
    `);
    
    await connection.execute(`
      INSERT INTO users (name, email, password, role)
      SELECT 'Publisher User', 'publisher@example.com', 
             (SELECT password FROM users WHERE email = 'admin@gmail.com' LIMIT 1),
             'publisher'
      FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'publisher@example.com')
    `);
    
    console.log('🎉 Database schema update completed successfully!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateSchema().then(() => process.exit(0));
