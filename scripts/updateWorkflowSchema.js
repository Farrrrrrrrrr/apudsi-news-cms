import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection creation for schema update
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

const updateWorkflowSchema = async () => {
  console.log('🔄 Updating schema for workflow features...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // Add workflow_status column if it doesn't exist
    console.log('Adding workflow_status column to articles table...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS workflow_status ENUM('draft', 'in_review', 'approved', 'rejected', 'published') DEFAULT 'draft' AFTER status
    `);
    console.log('✅ Added workflow_status column');
    
    // Add reviewer_id column
    console.log('Adding reviewer_id column to articles table...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS reviewer_id INT NULL AFTER author_id,
      ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('✅ Added reviewer_id column');
    
    // Add publisher_id column
    console.log('Adding publisher_id column to articles table...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS publisher_id INT NULL AFTER reviewer_id,
      ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('✅ Added publisher_id column');
    
    // Add review_feedback column
    console.log('Adding review_feedback column to articles table...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS review_feedback TEXT NULL AFTER content
    `);
    console.log('✅ Added review_feedback column');
    
    // Add timestamp columns
    console.log('Adding workflow timestamp columns to articles table...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL,
      ADD COLUMN IF NOT EXISTS published_at DATETIME NULL
    `);
    console.log('✅ Added timestamp columns');
    
    // Create notifications table
    console.log('Creating notifications table if not exists...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        article_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notifications table');
    
    console.log('🎉 Workflow schema update completed successfully!');
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateWorkflowSchema().then(() => process.exit(0));
