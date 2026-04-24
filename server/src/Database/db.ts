import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to DB:', err.message);
  } else {
    console.log('PostgreSQL connected successfully');
    release();
  }
});

export default pool;