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
    
    // Check if image_path column exists in articles table
    console.log('Checking for image_path column in articles table...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'image_path'",
      [process.env.MYSQL_DATABASE]
    );
    
    // Add image_path column if it doesn't exist
    if (columns.length === 0) {
      console.log('Adding image_path column to articles table...');
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN image_path VARCHAR(255) AFTER author_id"
      );
      console.log('✅ Added image_path column to articles table');
    } else {
      console.log('✅ image_path column already exists');
    }
    
    console.log('🎉 Database schema update completed successfully!');
  } catch (error) {
    console.error('❌ Database schema update failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

updateSchema().then(() => process.exit(0));
