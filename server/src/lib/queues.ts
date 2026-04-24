/**
 * BE1 — Day 9: BullMQ Job Queues
 *
 * Queues:
 *  - tracking-poll  : Polls DTDC/XpressBees for shipment status every 15 mins
 *  - notification   : Dispatches notifications asynchronously (SMS, WA, Push, Email)
 *  - cod-payout     : Triggers Cashfree payouts for delivered COD shipments
 *
 * Uses ioredis connection already configured in redis.ts
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { redis } from './redis';

// ─── Connection Config ────────────────────────────────────────────────────────

const connection = redis; // Reuse existing ioredis instance

// ─── Queue Definitions ────────────────────────────────────────────────────────

export const trackingPollQueue = new Queue('tracking-poll', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export const notificationQueue = new Queue('notification', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

export const codPayoutQueue = new Queue('cod-payout', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
  },
});

export const reconciliationScannerQueue = new Queue('reconciliation-scanner', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 10 },
    attempts: 1,
  },
});

// ─── Job Type Definitions ─────────────────────────────────────────────────────

export interface TrackingPollJobData {
  shipment_id: string;
  awb: string;
  courier: 'delhivery' | 'dtdc' | 'xpressbees';
}

export interface NotificationJobData {
  user_id: string;
  shipment_id?: string;
  event_type: NotificationEvent;
  channels: NotificationChannel[];
  payload: Record<string, string | number>;
}

export interface CodPayoutJobData {
  shipment_id: string;
  user_id: string;
  amount_paise: number;
  awb: string;
}

export type NotificationChannel = 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';

export type NotificationEvent =
  | 'BOOKING_CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'RTO_INITIATED'
  | 'COD_COLLECTED'
  | 'PAYOUT_SENT'
  | 'DELIVERY_OTP'
  | 'WELCOME_USER';

// ─── Queue Helpers ────────────────────────────────────────────────────────────

/**
 * Enqueue a tracking poll for a specific shipment AWB.
 * Called after a shipment is booked with a courier that needs polling.
 * @param data - AWB and courier details
 * @param delayMs - ms before first poll (default 15 min)
 */
export async function enqueueTrackingPoll(
  data: TrackingPollJobData,
  delayMs: number = 15 * 60 * 1000
): Promise<void> {
  await trackingPollQueue.add(`poll:${data.awb}`, data, {
    delay: delayMs,
    // Repeat every 15 minutes for up to 10 days
    repeat: {
      every: 15 * 60 * 1000,
      limit: 960, // 96 times/day × 10 days
    },
  });
  console.log(`📡 Tracking poll enqueued for AWB: ${data.awb} (courier: ${data.courier})`);
}

/**
 * Enqueue a notification dispatch.
 * @param data - Notification job data
 */
export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  await notificationQueue.add(`notify:${data.event_type}:${data.user_id}`, data);
  console.log(`🔔 Notification enqueued: ${data.event_type} → user ${data.user_id}`);
}

/**
 * Enqueue a COD payout after delivery is confirmed.
 * @param data - Payout details
 * @param delayMs - Cooling period (default 7 days)
 */
export async function enqueueCodPayout(
  data: CodPayoutJobData,
  delayMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<void> {
  await codPayoutQueue.add(`payout:${data.shipment_id}`, data, { delay: delayMs });
  console.log(`💸 COD payout enqueued for shipment: ${data.shipment_id} (delay: ${delayMs / 1000}s)`);
}

/**
 * Start the periodic reconciliation scanner.
 * Runs every 6 hours by default.
 */
export async function startReconciliationSchedules(): Promise<void> {
  await reconciliationScannerQueue.add(
    'periodic-scan',
    {},
    {
      repeat: {
        every: 6 * 60 * 60 * 1000, // 6 hours
      },
      jobId: 'reconciliation-scanner-job',
    }
  );
  console.log('🔍 Reconciliation scanner scheduled (every 6h)');
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await Promise.all([
    trackingPollQueue.close(),
    notificationQueue.close(),
    codPayoutQueue.close(),
    reconciliationScannerQueue.close(),
  ]);
  console.log('🛑 BullMQ queues closed');
}

// ─── Queue Health Check ───────────────────────────────────────────────────────

export async function getQueueHealth(): Promise<Record<string, object>> {
  const [trackingCounts, notifyCounts, payoutCounts] = await Promise.all([
    trackingPollQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
    codPayoutQueue.getJobCounts(),
  ]);

  return {
    'tracking-poll': trackingCounts,
    notification: notifyCounts,
    'cod-payout': payoutCounts,
  };
}
