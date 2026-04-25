import { Worker, Job } from 'bullmq';
import redis from '../../Database/redis';
import db from '../../Database/db';
import { CodPayoutJobData, enqueueCodPayout } from '../queues';

const connection = redis;

/**
 * 1. Reconciliation Scanner Worker
 * Scans the database for DELIVERED COD shipments that haven't been reconciled yet.
 */
export const startReconciliationScanner = () => {
  const scannerWorker = new Worker(
    'reconciliation-scanner',
    async (job: Job) => {
      console.log('🔍 Running COD Reconciliation Scan...');

      // Find DELIVERED shipments with COD > 0 that don't have a collection record yet
      const { rows } = await db.query(`
        SELECT s.id, s.user_id, s.cod_amount, s.awb
        FROM shipments s
        LEFT JOIN cod_collections c ON s.id = c.shipment_id
        WHERE s.status = 'DELIVERED'
          AND s.cod_amount > 0
          AND c.id IS NULL
      `);

      console.log(`📊 Found ${rows.length} shipments needing reconciliation.`);

      for (const shipment of rows) {
        // 1. Create collection record
        await db.query(`
          INSERT INTO cod_collections (shipment_id, amount, status)
          VALUES ($1, $2, 'COLLECTED')
        `, [shipment.id, shipment.cod_amount]);

        // 2. Enqueue for Payout after 7 days (604800 seconds)
        await enqueueCodPayout({
          shipment_id: shipment.id,
          user_id: shipment.user_id,
          amount_paise: Math.round(parseFloat(shipment.cod_amount) * 100),
          awb: shipment.awb
        });
      }
    },
    { connection }
  );

  return scannerWorker;
};

/**
 * 2. COD Payout Worker
 * Actually processes the payout (simulated bank transfer)
 */
export const startCodPayoutWorker = () => {
  const payoutWorker = new Worker(
    'cod-payout',
    async (job: Job<CodPayoutJobData>) => {
      const { shipment_id, user_id, amount_paise, awb } = job.data;
      console.log(`💸 Processing Payout for AWB: ${awb} (Rs ${amount_paise / 100})`);

      const client = await db.connect();
      try {
        await client.query('BEGIN');

        // 1. Create Remittance Record
        const { rows: remRes } = await client.query(`
          INSERT INTO cod_remittances (user_id, amount, status)
          VALUES ($1, $2, 'PAID')
          RETURNING id
        `, [user_id, amount_paise / 100]);

        // 2. Update Collection status
        await client.query(`
          UPDATE cod_collections SET status = 'DEPOSITED' WHERE shipment_id = $1
        `, [shipment_id]);

        // 3. Update Wallet Balance (optional, but good for tracking)
        await client.query(`
          UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2
        `, [amount_paise, user_id]);

        // 4. Log Transaction
        await client.query(`
          INSERT INTO wallet_transactions (user_id, shipment_id, type, amount, status, description)
          VALUES ($1, $2, 'CREDIT', $3, 'SUCCESS', $4)
        `, [user_id, shipment_id, amount_paise / 100, `COD Remittance for AWB: ${awb}`]);

        await client.query('COMMIT');
        console.log(`✅ Payout Successful for AWB: ${awb}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Payout Failed for AWB: ${awb}`, err);
        throw err;
      } finally {
        client.release();
      }
    },
    { connection }
  );

  return payoutWorker;
};
