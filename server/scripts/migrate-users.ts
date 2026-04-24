import pool from '../src/Database/db';

async function migrateUsers() {
  console.log('🚀 Migrating users table for Email Auth...');

  try {
    // 1. Add email column if not exists
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
    `);
    console.log('✅ Added email column (UNIQUE)');

    // 2. Make phone optional
    // Check if column exists first to be safe, though standard SQL handles DROP NOT NULL well
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN phone DROP NOT NULL;
    `);
    console.log('✅ Made phone column optional');

    // 3. Add index on email for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log('✅ Created index on email');

    console.log('✨ Migration successful');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrateUsers();
