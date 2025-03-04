import dotenv from 'dotenv';
import { runMigrations } from '../lib/migrations.js';

// Load environment variables
dotenv.config();

// Run migrations and then exit
(async () => {
  try {
    await runMigrations();
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
})();
