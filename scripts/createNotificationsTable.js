import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createNotificationsTable() {
  console.log('Creating notifications table...');
  
  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };
  
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection(config);

    // Check if table exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'`, 
      [process.env.MYSQL_DATABASE]
    );

    // Create table if it doesn't exist
    if (tables.length === 0) {
      await connection.execute(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          link VARCHAR(255),
          is_read BOOLEAN DEFAULT false,
          type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user (user_id),
          INDEX idx_read (is_read),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('✅ Notifications table created successfully');

      // Insert some sample notifications
      await connection.execute(`
        INSERT INTO notifications (user_id, message, link, type) VALUES 
        (1, 'Welcome to APUDSI News CMS', '/admin/dashboard', 'system'),
        (1, 'Your first article is ready to be published', '/admin/articles/1', 'article_review'),
        (1, 'New comment on your article', '/admin/articles/1#comments', 'comment')
      `);

      console.log('✅ Sample notifications inserted');
    } else {
      console.log('⚠️ Notifications table already exists');
    }
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
createNotificationsTable();
