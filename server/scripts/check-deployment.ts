import axios from 'axios';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Rapidly checks all external services to ensure the environment variables are correct.
 */
async function runHealthCheck() {
    console.log('🔍 Starting SwiftRoute Cloud Readiness Check...\n');

    // 1. Check PostgreSQL (Supabase/Neon)
    console.log('🐘 [Postgres] Connecting...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        await pool.query('SELECT 1');
        console.log('✅ Postgres: REACHABLE');
    } catch (e: any) {
        console.log('❌ Postgres: FAILED -', e.message);
    } finally {
        await pool.end();
    }

    // 2. Check Redis (Upstash)
    if (process.env.REDIS_URL) {
        console.log('\n🔴 [Redis] Connecting...');
        const redis = new Redis(process.env.REDIS_URL);
        try {
            await redis.ping();
            console.log('✅ Redis: REACHABLE');
        } catch (e: any) {
            console.log('❌ Redis: FAILED -', e.message);
        } finally {
            redis.disconnect();
        }
    }

    // 3. Check AI Service (Hugging Face)
    if (process.env.AI_SERVICE_URL || process.env.EMBEDDER_URL) {
        const url = process.env.AI_SERVICE_URL || process.env.EMBEDDER_URL || '';
        console.log(`\n🐍 [AI Service] Checking ${url}...`);
        try {
            const res = await axios.get(`${url.replace('/embed', '')}/health`, { timeout: 5000 });
            console.log(`✅ AI Service: REACHABLE (Status: ${res.data.status})`);
        } catch (e: any) {
            console.log('❌ AI Service: UNREACHABLE -', e.message);
        }
    }

    // 4. Check Kafka Connectivity (Upstash)
    if (process.env.KAFKA_BROKERS) {
        console.log('\n📦 [Kafka] Verifying Broker...');
        const kafkaConfig: any = {
            clientId: 'swiftroute-checker',
            brokers: process.env.KAFKA_BROKERS.split(','),
            ssl: true,
        };
        
        if (process.env.KAFKA_SASL_USERNAME) {
            kafkaConfig.sasl = {
                mechanism: 'scram-sha-256',
                username: process.env.KAFKA_SASL_USERNAME,
                password: process.env.KAFKA_SASL_PASSWORD
            };
        }

        const kafka = new Kafka(kafkaConfig);
        const admin = kafka.admin();
        try {
            await admin.connect();
            const topics = await admin.listTopics();
            console.log(`✅ Kafka: REACHABLE (${topics.length} topics found)`);
        } catch (e: any) {
            console.log('❌ Kafka: UNAUTHORIZED/UNREACHABLE -', e.message);
        } finally {
            await admin.disconnect();
        }
    }

    console.log('\n🏁 Readiness Check Finished.');
}

runHealthCheck();
