import fs from 'fs';
import path from 'path';
import pool from '../src/Database/db';

async function runSchema() {
  console.log('🚀 Running full schema initialization...');

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    // Run the full SQL script
    await pool.query(schemaSql);
    console.log('✅ Schema initialized successfully (17 tables created)');
    
    // Seed essential data if needed
    await pool.query(`
      INSERT INTO couriers (name, code, rating, is_active)
      VALUES 
        ('Delhivery', 'delhivery', 4.5, true),
        ('BlueDart', 'bluedart', 4.8, true),
        ('XpressBees', 'xpressbees', 4.2, true),
        ('DTDC', 'dtdc', 4.0, true),
        ('Ecom Express', 'ecom', 4.1, true)
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✅ Essential couriers seeded');

  } catch (err: any) {
    console.error('❌ Schema initialization failed:', err.message);
  } finally {
    process.exit(0);
  }
}

runSchema();
