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
import redis from '../Database/redis';

// ─── Connection Config ────────────────────────────────────────────────────────

const connection = redis; // Reuse existing ioredis instance

// ─── Queue Definitions (Lazy — only created when first accessed) ──────────────
// This prevents BullMQ from opening idle Redis connections when workers are disabled.

let _trackingPollQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;
let _codPayoutQueue: Queue | null = null;
let _reconciliationScannerQueue: Queue | null = null;

const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
  attempts: 3,
};

export const getTrackingPollQueue = () => {
  if (!_trackingPollQueue) {
    _trackingPollQueue = new Queue('tracking-poll', {
      connection,
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, backoff: { type: 'exponential', delay: 5000 } },
    });
  }
  return _trackingPollQueue;
};

export const getNotificationQueue = () => {
  if (!_notificationQueue) {
    _notificationQueue = new Queue('notification', {
      connection,
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, removeOnComplete: { count: 500 }, removeOnFail: { count: 100 }, backoff: { type: 'exponential', delay: 2000 } },
    });
  }
  return _notificationQueue;
};

export const getCodPayoutQueue = () => {
  if (!_codPayoutQueue) {
    _codPayoutQueue = new Queue('cod-payout', {
      connection,
      defaultJobOptions: { removeOnComplete: { count: 100 }, removeOnFail: { count: 50 }, attempts: 2, backoff: { type: 'fixed', delay: 10000 } },
    });
  }
  return _codPayoutQueue;
};

export const getReconciliationScannerQueue = () => {
  if (!_reconciliationScannerQueue) {
    _reconciliationScannerQueue = new Queue('reconciliation-scanner', {
      connection,
      defaultJobOptions: { removeOnComplete: { count: 10 }, removeOnFail: { count: 10 }, attempts: 1 },
    });
  }
  return _reconciliationScannerQueue;
};

// Backwards-compat aliases (so existing code doesn't break immediately)
export const trackingPollQueue = { add: (name: string, data: any, opts?: any) => getTrackingPollQueue().add(name, data, opts) };
export const notificationQueue  = { add: (name: string, data: any, opts?: any) => getNotificationQueue().add(name, data, opts) };
export const codPayoutQueue     = { add: (name: string, data: any, opts?: any) => getCodPayoutQueue().add(name, data, opts) };
export const reconciliationScannerQueue = { add: (name: string, data: any, opts?: any) => getReconciliationScannerQueue().add(name, data, opts) };

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
  await getReconciliationScannerQueue().add(
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
  const queues = [_trackingPollQueue, _notificationQueue, _codPayoutQueue, _reconciliationScannerQueue].filter(Boolean);
  await Promise.all(queues.map((q) => q!.close()));
  console.log('🛑 BullMQ queues closed');
}

// ─── Queue Health Check ───────────────────────────────────────────────────────

export async function getQueueHealth(): Promise<Record<string, object>> {
  const [trackingCounts, notifyCounts, payoutCounts] = await Promise.all([
    getTrackingPollQueue().getJobCounts(),
    getNotificationQueue().getJobCounts(),
    getCodPayoutQueue().getJobCounts(),
  ]);

  return {
    'tracking-poll': trackingCounts,
    notification: notifyCounts,
    'cod-payout': payoutCounts,
  };
}
