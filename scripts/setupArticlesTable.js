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

// Create or update articles table
const setupArticlesTable = async () => {
  console.log('🔄 Setting up articles table...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

    // Check if articles table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'
    `, [process.env.MYSQL_DATABASE]);
    
    // Create articles table if it doesn't exist
    if (tables.length === 0) {
      console.log('Creating articles table...');
      await connection.execute(`
        CREATE TABLE articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          image_path VARCHAR(255),
          author_id INT NOT NULL,
          category VARCHAR(100),
          tags JSON,
          status ENUM('draft', 'published', 'archived', 'scheduled') DEFAULT 'draft',
          workflow_status ENUM('draft', 'in_review', 'rejected', 'approved', 'published') DEFAULT 'draft',
          reviewer_id INT,
          publisher_id INT,
          submitted_at DATETIME NULL,
          reviewed_at DATETIME NULL,
          published_at DATETIME NULL,
          review_feedback TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id),
          INDEX idx_status (status),
          INDEX idx_workflow (workflow_status),
          INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created articles table');
      
      // Insert sample article
      await connection.execute(`
        INSERT INTO articles (title, content, excerpt, author_id, category, status, workflow_status, created_at, updated_at)
        VALUES (
          'Getting Started with APUDSI News CMS',
          '<h2>Welcome to the CMS</h2><p>This is a sample article to help you get started with the APUDSI News Content Management System.</p><p>You can edit this article or create new ones from the admin interface.</p>',
          'Learn how to use the APUDSI News Content Management System.',
          1,
          'Tutorial',
          'published',
          'published',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Added sample article');
    } else {
      console.log('ℹ️ Articles table already exists, checking columns...');
      
      // Get existing columns
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'
      `, [process.env.MYSQL_DATABASE]);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      // Add status column if it doesn't exist
      if (!columnNames.includes('status')) {
        await connection.execute(`
          ALTER TABLE articles 
          ADD COLUMN status ENUM('draft', 'published', 'archived', 'scheduled') DEFAULT 'draft'
        `);
        console.log('✅ Added status column');
      } else {
        console.log('ℹ️ status column already exists');
      }
      
      // Add workflow_status if it doesn't exist
      if (!columnNames.includes('workflow_status')) {
        await connection.execute(`
          ALTER TABLE articles 
          ADD COLUMN workflow_status ENUM('draft', 'in_review', 'rejected', 'approved', 'published') 
          DEFAULT 'draft'
        `);
        console.log('✅ Added workflow_status column');
      } else {
        console.log('ℹ️ workflow_status column already exists');
      }
      
      // Add reviewer_id if it doesn't exist
      if (!columnNames.includes('reviewer_id')) {
        try {
          await connection.execute(`
            ALTER TABLE articles 
            ADD COLUMN reviewer_id INT,
            ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
          `);
          console.log('✅ Added reviewer_id column');
        } catch (e) {
          console.log('⚠️ Could not add reviewer_id foreign key constraint, adding without constraint');
          await connection.execute(`ALTER TABLE articles ADD COLUMN reviewer_id INT`);
        }
      } else {
        console.log('ℹ️ reviewer_id column already exists');
      }
      
      // Add publisher_id if it doesn't exist
      if (!columnNames.includes('publisher_id')) {
        try {
          await connection.execute(`
            ALTER TABLE articles 
            ADD COLUMN publisher_id INT,
            ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id)
          `);
          console.log('✅ Added publisher_id column');
        } catch (e) {
          console.log('⚠️ Could not add publisher_id foreign key constraint, adding without constraint');
          await connection.execute(`ALTER TABLE articles ADD COLUMN publisher_id INT`);
        }
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
    }
    
    console.log('🎉 Articles table setup completed successfully!');
  } catch (error) {
    console.error('❌ Articles table setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Run the setup
setupArticlesTable().then(() => process.exit(0));
