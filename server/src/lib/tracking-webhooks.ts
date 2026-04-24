/**
 * BE3 — Day 8: Tracking Webhook Handlers
 *
 * Handles inbound delivery status pushes from courier partners.
 * All handlers:
 *   1. Verify the webhook signature (where applicable)
 *   2. Parse the courier-specific payload into a normalized TrackingEvent
 *   3. Save to MongoDB via TrackingEvent model
 *   4. Emit a Kafka notification event to trigger user alerts
 *   5. Update shipment status in PostgreSQL
 *
 * Routes wired by BE2:
 *   POST /tracking/webhooks/delhivery
 *   POST /tracking/webhooks/dtdc
 */

import crypto from 'crypto';
import { Request, Response } from 'express';
import { TrackingEvent } from './mongo';
import db from '../Database/db';
import { emitEvent, TOPICS } from './kafka';
import { enqueueNotification } from './queues';
import type { NotificationEvent } from './queues';

// ─── Status Normalizer ────────────────────────────────────────────────────────

const DELHIVERY_STATUS_MAP: Record<string, string> = {
  'Manifested':         'BOOKED',
  'In Transit':         'IN_TRANSIT',
  'Out For Delivery':   'OUT_FOR_DELIVERY',
  'Delivered':          'DELIVERED',
  'RTO Initiated':      'RTO_INITIATED',
  'RTO Delivered':      'RTO_DELIVERED',
  'Undelivered':        'FAILED_DELIVERY',
  'Pickup Awaited':     'PICKUP_AWAITED',
  'Pickup Cancelled':   'PICKUP_CANCELLED',
  'Picked Up':          'PICKED_UP',
};

const DTDC_STATUS_MAP: Record<string, string> = {
  'BOOKING':         'BOOKED',
  'INBOUND':         'IN_TRANSIT',
  'OUTBOUND':        'IN_TRANSIT',
  'OUT FOR DELIVERY':'OUT_FOR_DELIVERY',
  'DELIVERED':       'DELIVERED',
  'RTO':             'RTO_INITIATED',
  'PICKUP':          'PICKED_UP',
};

function mapToNotificationEvent(normalizedStatus: string): NotificationEvent | null {
  const map: Record<string, NotificationEvent> = {
    PICKED_UP:         'PICKED_UP',
    IN_TRANSIT:        'IN_TRANSIT',
    OUT_FOR_DELIVERY:  'OUT_FOR_DELIVERY',
    DELIVERED:         'DELIVERED',
    RTO_INITIATED:     'RTO_INITIATED',
  };
  return map[normalizedStatus] ?? null;
}

// ─── Shared: Save Tracking Event ─────────────────────────────────────────────

async function saveTrackingEvent(
  awb: string,
  status: string,
  location: string,
  description: string,
  courier: string
) {
  // 1. Save to MongoDB
  await TrackingEvent.create({
    awb_number: awb,
    shipment_id: awb, // Will match after lookup
    status,
    location,
    description,
    timestamp: new Date(),
    meta: { courier, source: 'WEBHOOK' },
  });

  // 2. Update shipment status in PostgreSQL
  const pgResult = await db.query(
    `UPDATE shipments
     SET status = $1, updated_at = NOW()
     WHERE awb = $2
     RETURNING id, user_id`,
    [status, awb]
  );

  if (pgResult.rows.length === 0) {
    console.warn(`[webhook] No shipment found for AWB: ${awb}`);
    return null;
  }

  const { id: shipmentId, user_id: userId } = pgResult.rows[0];

  // 3. Emit Kafka event
  await emitEvent(TOPICS.SHIPMENT_UPDATED, {
    awb,
    shipment_id: shipmentId,
    user_id: userId,
    status,
    location,
    courier,
    timestamp: new Date().toISOString(),
  });

  // 4. Enqueue notification
  const notifEvent = mapToNotificationEvent(status);
  if (notifEvent) {
    await enqueueNotification({
      user_id: userId,
      shipment_id: shipmentId,
      event_type: notifEvent,
      channels: ['SMS', 'WHATSAPP', 'PUSH'],
      payload: { awb, courier, location, status },
    });
  }

  return { shipmentId, userId };
}

// ─── Delhivery Webhook Handler ────────────────────────────────────────────────

/**
 * POST /tracking/webhooks/delhivery
 *
 * Delhivery sends a batch of shipment status updates.
 * Payload format: { ShipmentData: [{ Shipment: { ... } }] }
 */
export async function handleDelhiveryWebhook(req: Request, res: Response): Promise<void> {
  try {
    // Verify Delhivery signature if secret is configured
    const webhookSecret = process.env.DELHIVERY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-delhivery-signature'] as string;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSig) {
        console.warn('[delhivery-webhook] ⚠️ Invalid signature — rejecting');
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const shipmentData = req.body?.ShipmentData as any[] | undefined;
    if (!shipmentData || !Array.isArray(shipmentData)) {
      res.status(400).json({ error: 'Invalid payload: ShipmentData missing' });
      return;
    }

    let processed = 0;
    let failed = 0;

    for (const item of shipmentData) {
      try {
        const shipment = item?.Shipment;
        if (!shipment) continue;

        const awb: string = shipment.AWB || shipment.Waybill;
        const rawStatus: string = shipment.Status?.Status || 'Unknown';
        const location: string = shipment.Status?.City || shipment.PickedupCity || 'Unknown';
        const description: string = shipment.Status?.StatusType || rawStatus;

        const normalizedStatus = DELHIVERY_STATUS_MAP[rawStatus] ?? rawStatus.toUpperCase().replace(/\s+/g, '_');

        await saveTrackingEvent(awb, normalizedStatus, location, description, 'delhivery');
        processed++;
      } catch (err) {
        console.error('[delhivery-webhook] Error processing item:', err);
        failed++;
      }
    }

    console.log(`✅ [delhivery-webhook] Processed: ${processed} | Failed: ${failed}`);
    res.status(200).json({ received: true, processed, failed });

  } catch (err) {
    console.error('[delhivery-webhook] Fatal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── DTDC Webhook Handler ─────────────────────────────────────────────────────

/**
 * POST /tracking/webhooks/dtdc
 *
 * DTDC sends status updates with format: { trackingId, status, location, timestamp }
 */
export async function handleDtdcWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { trackingId, status: rawStatus, location, description, timestamp } = req.body;

    if (!trackingId || !rawStatus) {
      res.status(400).json({ error: 'trackingId and status are required' });
      return;
    }

    const normalizedStatus = DTDC_STATUS_MAP[rawStatus?.toUpperCase()] ?? rawStatus.toUpperCase().replace(/\s+/g, '_');

    await saveTrackingEvent(
      trackingId,
      normalizedStatus,
      location || 'Unknown',
      description || rawStatus,
      'dtdc'
    );

    console.log(`✅ [dtdc-webhook] AWB ${trackingId} → ${normalizedStatus}`);
    res.status(200).json({ received: true });

  } catch (err) {
    console.error('[dtdc-webhook] Fatal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
