import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simplified connection creation
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
  console.log('🚀 Updating database schema with workflow fields...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

    // Update users table to add diverse roles
    console.log('Updating user roles...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('writer', 'editor', 'publisher', 'superuser') NOT NULL DEFAULT 'writer'
    `);
    
    // Update existing editors to 'writer' role
    await connection.execute(`
      UPDATE users
      SET role = 'writer'
      WHERE role = 'editor' AND role != 'superuser'
    `);
    
    console.log('✅ User roles updated');

    // Add workflow fields to articles table
    console.log('Adding workflow fields to articles table...');
    
    // Check if columns exist and add them if they don't
    const columns = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'`,
      [process.env.MYSQL_DATABASE]
    );
    
    const columnNames = columns[0].map(col => col.COLUMN_NAME.toLowerCase());
    
    // Add workflow_status column if it doesn't exist
    if (!columnNames.includes('workflow_status')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN workflow_status ENUM('draft', 'in_review', 'approved', 'rejected', 'published') 
        NOT NULL DEFAULT 'draft' AFTER status
      `);
      console.log('✅ Added workflow_status column');
    }
    
    // Add submitted_at column if it doesn't exist
    if (!columnNames.includes('submitted_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN submitted_at DATETIME NULL AFTER workflow_status
      `);
      console.log('✅ Added submitted_at column');
    }
    
    // Add reviewed_at column if it doesn't exist
    if (!columnNames.includes('reviewed_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewed_at DATETIME NULL AFTER submitted_at
      `);
      console.log('✅ Added reviewed_at column');
    }
    
    // Add published_at column if it doesn't exist
    if (!columnNames.includes('published_at')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN published_at DATETIME NULL AFTER reviewed_at
      `);
      console.log('✅ Added published_at column');
    }
    
    // Add reviewer_id column if it doesn't exist
    if (!columnNames.includes('reviewer_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN reviewer_id INT NULL AFTER published_at,
        ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
      `);
      console.log('✅ Added reviewer_id column');
    }
    
    // Add publisher_id column if it doesn't exist
    if (!columnNames.includes('publisher_id')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN publisher_id INT NULL AFTER reviewer_id,
        ADD CONSTRAINT fk_publisher FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
      console.log('✅ Added publisher_id column');
    }
    
    // Add rejection_reason column if it doesn't exist
    if (!columnNames.includes('rejection_reason')) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN rejection_reason TEXT NULL AFTER publisher_id
      `);
      console.log('✅ Added rejection_reason column');
    }
    
    console.log('🎉 Schema update completed successfully!');
    
    // Create sample users for each role if they don't exist
    console.log('Creating sample users for each role...');
    
    const createUser = async (email, name, role) => {
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUser.length === 0) {
        const hashedPassword = '$2a$10$rJJzd.r70J1SQj3.Jq8sCOFBE87gra5z5wBjU9hA7s88sJtWHzBdW'; // hashed "password123"
        await connection.execute(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [email, hashedPassword, name, role]
        );
        console.log(`✅ Created ${role} user: ${email}`);
      } else {
        console.log(`✅ User ${email} already exists`);
      }
    };
    
    await createUser('writer@example.com', 'Writer User', 'writer');
    await createUser('editor@example.com', 'Editor User', 'editor');
    await createUser('publisher@example.com', 'Publisher User', 'publisher');
    
    console.log('✅ Sample users created');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Run the schema update
updateSchema().then(() => process.exit(0));
