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
  console.log('🔄 Updating database schema for role system...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // Check if workflow_status column exists in articles table
    console.log('Checking for workflow columns in articles table...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'workflow_status'",
      [process.env.MYSQL_DATABASE]
    );
    
    // Add workflow columns if they don't exist
    if (columns.length === 0) {
      console.log('Adding workflow columns to articles table...');
      
      // Add workflow status column
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN workflow_status ENUM('draft', 'in_review', 'approved', 'rejected', 'published') DEFAULT 'draft'"
      );
      
      // Add review tracking columns
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN submitted_at DATETIME NULL"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN reviewer_id INT NULL"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN review_feedback TEXT NULL"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN reviewed_at DATETIME NULL"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN publisher_id INT NULL"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN published_at DATETIME NULL"
      );
      
      // Add foreign keys
      await connection.execute(
        "ALTER TABLE articles ADD FOREIGN KEY (reviewer_id) REFERENCES users(id)"
      );
      
      await connection.execute(
        "ALTER TABLE articles ADD FOREIGN KEY (publisher_id) REFERENCES users(id)"
      );
      
      console.log('✅ Added workflow columns to articles table');
    } else {
      console.log('✅ Workflow columns already exist');
    }
    
    // Check if notifications table exists
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'",
      [process.env.MYSQL_DATABASE]
    );
    
    // Create notifications table if it doesn't exist
    if (tables.length === 0) {
      console.log('Creating notifications table...');
      await connection.execute(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          read_status BOOLEAN DEFAULT FALSE,
          article_id INT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created notifications table');
    } else {
      console.log('✅ Notifications table already exists');
    }
    
    console.log('🎉 Database schema update for role system completed successfully!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateSchema().then(() => process.exit(0));
