import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import db from '../../Database/db';
import { emitEvent, TOPICS } from '../kafka';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

/**
 * Worker to identify and recover abandoned (DRAFT) bookings.
 */
export const startRecoveryScanner = () => {
  const worker = new Worker(
    'recovery-scanner',
    async () => {
      console.log('🔍 Scanning for abandoned bookings...');
      try {
        // Find DRAFT shipments older than 2 hours that haven't been nudged yet
        const { rows: abandoned } = await db.query(
          `SELECT s.id, u.phone, u.name 
           FROM shipments s 
           JOIN users u ON s.user_id = u.id 
           WHERE s.status = 'DRAFT' 
           AND s.created_at < NOW() - INTERVAL '2 hours' 
           AND s.last_nudge_at IS NULL 
           LIMIT 50`
        );

        for (const shipment of abandoned) {
          console.log(`📣 Sending nudge to ${shipment.phone} for abandoned booking ${shipment.id}`);
          
          await emitEvent(TOPICS.SHIPMENT_UPDATED, {
            shipment_id: shipment.id,
            status: 'DRAFT_NUDGE',
            phone: shipment.phone,
            name: shipment.name,
            notify: true,
            channel: ['WHATSAPP', 'SMS']
          });

          // Mark as nudged
          await db.query(
            "UPDATE shipments SET last_nudge_at = NOW() WHERE id = $1",
            [shipment.id]
          );
        }

        return { count: abandoned.length };
      } catch (error) {
        console.error('Recovery worker error:', error);
        throw error;
      }
    },
    { connection }
  );

  return worker;
};
