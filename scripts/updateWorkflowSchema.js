import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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

// Update article schema for workflow
const updateWorkflowSchema = async () => {
  console.log('🔄 Updating article workflow schema...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

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
    } else {
      console.log('ℹ️ workflow_status column already exists');
    }
    
    // Add reviewer_id if it doesn't exist
    if (!columnNames.includes('reviewer_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewer_id INT,
        ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
      `);
      console.log('✅ Added reviewer_id column');
    } else {
      console.log('ℹ️ reviewer_id column already exists');
    }
    
    // Add publisher_id if it doesn't exist
    if (!columnNames.includes('publisher_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN publisher_id INT,
        ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
      console.log('✅ Added publisher_id column');
    } else {
      console.log('ℹ️ publisher_id column already exists');
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
      } else {
        console.log(`ℹ️ ${col.name} column already exists`);
      }
    }
    
    // Add review_feedback column if it doesn't exist
    if (!columnNames.includes('review_feedback')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN review_feedback TEXT NULL
      `);
      console.log('✅ Added review_feedback column');
    } else {
      console.log('ℹ️ review_feedback column already exists');
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
    console.log('✅ Created or verified notifications table');

    // Create workflow_history table for audit trail
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workflow_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        from_status VARCHAR(50),
        to_status VARCHAR(50) NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Created or verified workflow_history table');

    console.log('🎉 Workflow schema update completed successfully!');
  } catch (error) {
    console.error('❌ Workflow schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Run the update
updateWorkflowSchema().then(() => process.exit(0));
