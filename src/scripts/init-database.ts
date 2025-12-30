// src/scripts/init-database.ts
import { executeQuery } from '../libs/database';
import { migrateData } from '../libs/migration';

async function initDatabase() {
  try {
    // console.log('🚀 Initializing database...');
    
    // Test connection
    await executeQuery('SELECT 1');
    // console.log('✅ Database connection established');
    
    // Run migration
    // await migrateData();
    // console.log('✅ Data migration completed');
    
    // console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
