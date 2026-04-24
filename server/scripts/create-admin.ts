import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'swiftroute',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
    const phoneNumber = process.argv[2];

    if (!phoneNumber) {
        console.error('Usage: npx ts-node scripts/create-admin.ts <phone_number>');
        process.exit(1);
    }

    try {
        const result = await pool.query(
            `UPDATE users SET role = 'ADMIN' WHERE phone = $1 RETURNING id, name, phone, role`,
            [phoneNumber]
        );

        if (result.rowCount === 0) {
            console.log(`❌ User with phone ${phoneNumber} not found.`);
        } else {
            console.log(`✅ Successfully granted ADMIN role:`, result.rows[0]);
        }
    } catch (error) {
        console.error('Database Error:', error);
    } finally {
        await pool.end();
    }
}

main();
