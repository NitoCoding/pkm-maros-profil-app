// src/scripts/test-database.ts
import { testConnection } from '../libs/database';
// import { config } from 'dotenv';
// config();

async function testDB() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

testDB();
