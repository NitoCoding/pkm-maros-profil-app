// src/scripts/seed-test-accounts.ts
import { executeQuery } from '../libs/database';
import { hashPassword } from '../libs/auth/password';
import { createUser } from '../libs/auth/database';

async function seedTestAccounts() {
  try {
    console.log('🚀 Seeding test accounts...');
    
    // Test connection
    await executeQuery('SELECT 1');
    console.log('✅ Database connection established');
    
    // Test accounts data
    const testAccounts = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'user@test.com',
        password: 'user123',
        name: 'Regular User',
        role: 'user'
      },
      {
        email: 'editor@test.com',
        password: 'editor123',
        name: 'Editor User',
        role: 'editor'
      }
    ];
    
    // Create test accounts
    for (const account of testAccounts) {
      try {
        // Check if user already exists
        const existingUser = await executeQuery(
          'SELECT id FROM users WHERE email = ?',
          [account.email]
        );
        
        if (existingUser.length > 0) {
          console.log(`⚠️  Account ${account.email} already exists, skipping...`);
          continue;
        }
        
        // Create user with password
        const result = await createUser({
          email: account.email,
          password: account.password,
          name: account.name
        });
        
        console.log(`✅ Created account: ${result.email} (${result.name})`);
      } catch (error) {
        console.error(`❌ Failed to create account ${account.email}:`, error);
      }
    }
    
    console.log('🎉 Test accounts seeding completed successfully');
    console.log('\n📋 Test Account Credentials:');
    console.log('---------------------------');
    console.log('Email: admin@test.com | Password: admin123');
    console.log('Email: user@test.com | Password: user123');
    console.log('Email: editor@test.com | Password: editor123');
    console.log('---------------------------');
    
  } catch (error) {
    console.error('❌ Test accounts seeding failed:', error);
    process.exit(1);
  }
}

seedTestAccounts();
