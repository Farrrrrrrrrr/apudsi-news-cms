import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection creation for media table setup
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

const createMediaTable = async () => {
  console.log('🔄 Creating media library table...');
  let connection;
  
  try {
    connection = await createConnection();
    console.log('✅ Connected to database successfully');
    
    // Create media table
    console.log('Creating media table if it doesn\'t exist...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        filetype VARCHAR(100) NOT NULL,
        filesize INT NOT NULL,
        width INT NULL,
        height INT NULL,
        alt_text VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Media table created or already exists');
    
    console.log('🎉 Media table setup completed successfully!');
  } catch (error) {
    console.error('❌ Media table setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

createMediaTable().then(() => process.exit(0));