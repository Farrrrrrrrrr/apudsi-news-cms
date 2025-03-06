import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection for schema update
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

const enhanceSchema = async () => {
  console.log('🚀 Enhancing database schema...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

    // 1. Update articles table with workflow fields
    console.log('Adding workflow fields to articles table...');
    
    // Check if workflow_status column exists
    const [workflowColumns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'workflow_status'",
      [process.env.MYSQL_DATABASE]
    );
    
    if (workflowColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN workflow_status ENUM('draft', 'in_review', 'approved', 'published', 'rejected') NOT NULL DEFAULT 'draft',
        ADD COLUMN submitted_at DATETIME NULL,
        ADD COLUMN reviewed_at DATETIME NULL,
        ADD COLUMN reviewer_id INT NULL,
        ADD COLUMN published_at DATETIME NULL,
        ADD COLUMN publisher_id INT NULL,
        ADD COLUMN rejection_reason TEXT NULL,
        ADD FOREIGN KEY (reviewer_id) REFERENCES users(id),
        ADD FOREIGN KEY (publisher_id) REFERENCES users(id)
      `);
      console.log('✅ Added workflow fields to articles table');
    } else {
      console.log('✅ Workflow fields already exist');
    }

    // 2. Update role types in users table
    console.log('Enhancing role types...');
    
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('writer', 'editor', 'publisher', 'superuser') NOT NULL DEFAULT 'writer'
    `);
    console.log('✅ Enhanced role types in users table');

    // 3. Update existing "editor" roles to "writer" roles
    console.log('Converting existing editor roles to writer roles...');
    await connection.execute(`
      UPDATE users 
      SET role = 'writer' 
      WHERE role = 'editor' AND NOT EXISTS (SELECT 1 FROM (SELECT * FROM users) AS u WHERE u.role = 'writer')
    `);
    console.log('✅ Converted existing users with role "editor" to "writer"');

    // 4. Create notifications table
    console.log('Creating notifications table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        article_id INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notifications table');

    // 5. Create one user of each role type for testing
    console.log('Creating example users for each role...');

    // Check if we already have users with each role
    const [users] = await connection.execute(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);
    
    const existingRoles = users.reduce((acc, user) => {
      acc[user.role] = user.count;
      return acc;
    }, {});
    
    // Generate password hash
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    // Create example users if they don't exist
    const rolesToCreate = [
      { role: 'writer', email: 'writer@example.com', name: 'Test Writer' },
      { role: 'editor', email: 'editor@example.com', name: 'Test Editor' },
      { role: 'publisher', email: 'publisher@example.com', name: 'Test Publisher' },
      { role: 'superuser', email: 'admin@example.com', name: 'Admin User' }
    ];
    
    for (const roleData of rolesToCreate) {
      if (!existingRoles[roleData.role]) {
        // Check if email already exists
        const [emailCheck] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [roleData.email]
        );
        
        if (emailCheck.length === 0) {
          await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [roleData.name, roleData.email, hashedPassword, roleData.role]
          );
          console.log(`✅ Created ${roleData.role} user: ${roleData.email}`);
        }
      } else {
        console.log(`✅ ${roleData.role} role already exists`);
      }
    }
    
    console.log('🎉 Schema enhancement completed successfully!');
    console.log('\nYou can now login with any of these users (password: Password123!)');
    console.log('- Writer: writer@example.com');
    console.log('- Editor: editor@example.com');
    console.log('- Publisher: publisher@example.com');
    console.log('- Superuser: admin@example.com');
    
  } catch (error) {
    console.error('❌ Schema enhancement failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

enhanceSchema().then(() => process.exit(0));
