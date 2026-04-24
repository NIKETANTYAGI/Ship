import { kafka, TOPICS } from '../src/lib/kafka';
import { connectMongoDB } from '../src/lib/mongo';
import pool from '../src/Database/db';
import redis from '../src/Database/redis';

async function initInfra() {
  console.log('🚀 Starting SwiftRoute Infrastructure Initialization...\n');

  // 1. PostgreSQL Check
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL: Connected');
  } catch (e) {
    console.error('❌ PostgreSQL: Failed');
  }

  // 2. Redis Check
  try {
    await redis.ping();
    console.log('✅ Redis: Connected');
  } catch (e) {
    console.error('❌ Redis: Failed');
  }

  // 3. MongoDB Check
  try {
    await connectMongoDB();
    console.log('✅ MongoDB: Connected & Schema Initialized');
  } catch (e) {
    console.error('❌ MongoDB: Failed');
  }

  // 4. Kafka Topics Check/Creation
  const admin = kafka.admin();
  try {
    console.log('📦 Kafka: Connecting Admin...');
    await admin.connect();
    
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(TOPICS).filter(t => !existingTopics.includes(t));

    if (topicsToCreate.length > 0) {
      console.log(`📦 Kafka: Creating ${topicsToCreate.length} missing topics...`);
      await admin.createTopics({
        topics: topicsToCreate.map(t => ({ topic: t, numPartitions: 1 }))
      });
      console.log('✅ Kafka: Topics Created Successfully');
    } else {
      console.log('✅ Kafka: All Topics Exist');
    }
    
    await admin.disconnect();
  } catch (error) {
    console.warn('⚠️ Kafka Admin Warning:', error instanceof Error ? error.message : 'Is Kafka running?');
    console.log('💡 Note: Kafka is critical for Phase 4+ Notifications.');
  }

  console.log('\n✨ Infrastructure Check Complete.');
  process.exit(0);
}

initInfra();
