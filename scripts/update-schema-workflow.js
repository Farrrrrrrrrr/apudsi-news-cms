import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  console.log('🔄 Updating database schema for workflow...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // 1. Modify users table to support new roles
    console.log('Updating user roles...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('writer', 'editor', 'publisher', 'superuser') NOT NULL DEFAULT 'writer'
    `);
    
    // Update existing editor users to writers (except superusers)
    await connection.execute(`
      UPDATE users 
      SET role = 'writer' 
      WHERE role = 'editor'
    `);
    
    console.log('✅ User roles updated');
    
    // 2. Add workflow fields to articles table
    console.log('Adding workflow fields to articles table...');
    
    // Check if workflow_status column exists
    const [workflowStatusExists] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'workflow_status'",
      [process.env.MYSQL_DATABASE]
    );
    
    if (workflowStatusExists.length === 0) {
      await connection.execute(`
        ALTER TABLE articles
        ADD COLUMN workflow_status ENUM('draft', 'in_review', 'approved', 'rejected', 'published') NOT NULL DEFAULT 'draft' AFTER status,
        ADD COLUMN submitted_at DATETIME NULL,
        ADD COLUMN reviewer_id INT NULL,
        ADD COLUMN reviewed_at DATETIME NULL,
        ADD COLUMN publisher_id INT NULL,
        ADD COLUMN published_at DATETIME NULL,
        ADD COLUMN rejection_reason TEXT NULL,
        ADD FOREIGN KEY (reviewer_id) REFERENCES users(id),
        ADD FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
      console.log('✅ Workflow fields added to articles table');
    } else {
      console.log('✅ Workflow fields already exist');
    }
    
    // 3. Create notifications table
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
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Notifications table created/verified');
    
    // 4. Update existing articles to have proper workflow_status
    await connection.execute(`
      UPDATE articles 
      SET workflow_status = status 
      WHERE workflow_status IS NULL OR workflow_status = ''
    `);
    console.log('✅ Existing articles updated with workflow status');
    
    console.log('🎉 Database schema update completed successfully!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateSchema().then(() => process.exit(0));
