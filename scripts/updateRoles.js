import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Create connection to database
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

const updateRoles = async () => {
  console.log('🔄 Updating user roles system...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');

    // First update the users table to ensure it has all required roles
    console.log('Updating user roles schema...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('superuser', 'writer', 'editor', 'publisher') NOT NULL DEFAULT 'writer'
    `);
    console.log('✅ User roles schema updated');

    // Create example users for each role
    const roles = ['superuser', 'writer', 'editor', 'publisher'];
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
      } else {
        console.log(`ℹ️ Example ${role} user already exists`);
      }
    }

    // Define permissions for each role
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('superuser', 'writer', 'editor', 'publisher') NOT NULL,
        permission VARCHAR(100) NOT NULL,
        UNIQUE KEY role_permission_unique (role, permission)
      )
    `);
    
    // Clear existing permissions
    await connection.execute('TRUNCATE TABLE role_permissions');
    
    // Define role permissions
    const permissions = [
      // Superuser permissions (can do everything)
      ['superuser', 'manage_users'],
      ['superuser', 'view_users'],
      ['superuser', 'create_article'],
      ['superuser', 'edit_any_article'],
      ['superuser', 'delete_any_article'],
      ['superuser', 'publish_article'],
      ['superuser', 'review_article'],
      ['superuser', 'access_settings'],
      ['superuser', 'access_api_docs'],
      
      // Writer permissions
      ['writer', 'create_article'],
      ['writer', 'edit_own_article'],
      ['writer', 'view_own_articles'],
      ['writer', 'submit_for_review'],
      
      // Editor permissions
      ['editor', 'view_submitted_articles'],
      ['editor', 'review_article'],
      ['editor', 'approve_article'],
      ['editor', 'reject_article'],
      ['editor', 'view_own_articles'],
      ['editor', 'create_article'],
      ['editor', 'edit_own_article'],
      
      // Publisher permissions
      ['publisher', 'view_approved_articles'],
      ['publisher', 'publish_article'],
      ['publisher', 'unpublish_article'],
      ['publisher', 'view_published_articles'],
      ['publisher', 'view_own_articles'],
      ['publisher', 'create_article'],
      ['publisher', 'edit_own_article'],
    ];
    
    // Insert permissions
    for (const [role, permission] of permissions) {
      await connection.execute(
        'INSERT INTO role_permissions (role, permission) VALUES (?, ?)',
        [role, permission]
      );
    }
    
    console.log('✅ Role permissions defined successfully');

    console.log('🎉 Role system update completed successfully!');
  } catch (error) {
    console.error('❌ Role system update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Run the update
updateRoles().then(() => process.exit(0));
