import { Pool } from 'pg';

/**
 * 🐘 PostgreSQL Connection Pool
 * Uses a global singleton pattern to prevent connection leaks during development.
 */

const globalForDb = global as unknown as { pool: Pool };

const pool = globalForDb.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Only log connection on first init
if (pool.listeners('connect').length === 0) {
  pool.on('connect', () => {
    // console.log('PostgreSQL connected successfully');
  });

  // Test the connection immediately if new
  pool.query('SELECT 1').then(() => {
    console.log('🐘 PostgreSQL connected successfully');
  }).catch(err => {
    console.error('❌ Error connecting to DB:', err.message);
  });
}

export default pool;