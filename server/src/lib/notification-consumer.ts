/**
 * BE3 — Day 10: Kafka Notification Consumer
 *
 * Listens to the `notification.dispatch_request` topic and dispatches
 * notifications across all registered channels (SMS, WhatsApp, Push, Email).
 *
 * This is the central notification hub — all services emit to Kafka,
 * and this consumer fans out to the correct communication channels.
 *
 * Start with: startNotificationConsumer()
 * Called from server/src/index.ts
 */

import { kafka, TOPICS } from './kafka';
import { sendMSG91Otp } from './msg91';
import { sendWhatsAppMessage } from './whatsapp';
import { sendPushNotification } from './firebase';
import { sendEmail } from './sendgrid';
import db from '../Database/db';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationEvent {
  user_id: string;
  shipment_id?: string;
  event_type: string;
  channels: string[];
  payload: Record<string, string | number>;
}

// ─── Template Engine ──────────────────────────────────────────────────────────

const TEMPLATES: Record<string, {
  sms: string;
  whatsapp: string;
  push_title: string;
  push_body: string;
  email_subject: string;
  email_html: string;
}> = {
  BOOKING_CONFIRMED: {
    sms: 'SwiftRoute: Your shipment AWB {{awb}} is confirmed. Pickup in {{pickup_sla}} hrs via {{courier}}.',
    whatsapp: '✅ *SwiftRoute Booking Confirmed*\nAWB: *{{awb}}*\nCourier: {{courier}}\nPickup in {{pickup_sla}} hrs.',
    push_title: '📦 Booking Confirmed!',
    push_body: 'AWB {{awb}} booked via {{courier}}. Pickup in {{pickup_sla}} hrs.',
    email_subject: 'SwiftRoute — Shipment Booked ✅',
    email_html: '<h2>📦 Booking Confirmed</h2><p>Your AWB <strong>{{awb}}</strong> is confirmed with {{courier}}.</p>',
  },
  PICKED_UP: {
    sms: 'SwiftRoute: Your package (AWB: {{awb}}) has been picked up by {{courier}}.',
    whatsapp: '🚗 *Picked Up!*\nAWB: {{awb}} has been collected by {{courier}}.',
    push_title: '🚗 Picked Up!',
    push_body: 'Package AWB {{awb}} picked up by {{courier}}.',
    email_subject: 'SwiftRoute — Package Picked Up 🚗',
    email_html: '<h2>🚗 Package Picked Up</h2><p>AWB {{awb}} is on its way!</p>',
  },
  IN_TRANSIT: {
    sms: 'SwiftRoute: Your package (AWB: {{awb}}) is in transit. Location: {{location}}.',
    whatsapp: '🚚 *In Transit*\nAWB: {{awb}}\nLocation: {{location}}',
    push_title: '🚚 In Transit',
    push_body: 'Package at {{location}}. On its way!',
    email_subject: 'SwiftRoute — Package In Transit 🚚',
    email_html: '<h2>🚚 In Transit</h2><p>Your package is at <strong>{{location}}</strong>.</p>',
  },
  OUT_FOR_DELIVERY: {
    sms: 'SwiftRoute: Your package is out for delivery today! Delivery OTP: {{otp}}. Share ONLY with agent.',
    whatsapp: '🛵 *Out for Delivery!*\nYour package arrives today.\nDelivery OTP: *{{otp}}* — share only with agent.',
    push_title: '🛵 Out for Delivery!',
    push_body: 'Arriving today! OTP: {{otp}}',
    email_subject: 'SwiftRoute — Out for Delivery 🛵',
    email_html: '<h2>🛵 Out for Delivery</h2><p>Delivery OTP: <strong>{{otp}}</strong>. Share only with the agent.</p>',
  },
  DELIVERED: {
    sms: 'SwiftRoute: Package (AWB: {{awb}}) delivered! Thank you for using SwiftRoute.',
    whatsapp: '✅ *Delivered!*\nAWB {{awb}} delivered successfully. Thank you for shipping with SwiftRoute!',
    push_title: '✅ Delivered!',
    push_body: 'Your package has been delivered successfully.',
    email_subject: 'SwiftRoute — Delivered ✅',
    email_html: '<h2>✅ Delivered</h2><p>Your package (AWB: {{awb}}) has been delivered. Thank you!</p>',
  },
  DELAYED: {
    sms: 'SwiftRoute: Your delivery (AWB: {{awb}}) is delayed. New ETA: {{eta}}. Sorry for the inconvenience.',
    whatsapp: '⏳ *Delivery Delayed*\nAWB: {{awb}}\nNew ETA: {{eta}}\nWe apologize for the delay.',
    push_title: '⏳ Delivery Delayed',
    push_body: 'New ETA: {{eta}}. Sorry for the delay.',
    email_subject: 'SwiftRoute — Delivery Delayed ⏳',
    email_html: '<h2>⏳ Delivery Delayed</h2><p>AWB {{awb}} is delayed. New ETA: <strong>{{eta}}</strong>.</p>',
  },
  RTO_INITIATED: {
    sms: 'SwiftRoute: Your package (AWB: {{awb}}) could not be delivered and is being returned.',
    whatsapp: '↩️ *Return Initiated*\nAWB: {{awb}} — package is being returned to origin. Contact support if needed.',
    push_title: '↩️ Return Initiated',
    push_body: 'Package AWB {{awb}} is being returned.',
    email_subject: 'SwiftRoute — Return to Origin ↩️',
    email_html: '<h2>↩️ Return Initiated</h2><p>AWB {{awb}} is being returned to origin.</p>',
  },
  COD_COLLECTED: {
    sms: 'SwiftRoute: ₹{{amount}} cash collected for your delivery (AWB: {{awb}}).',
    whatsapp: '💰 *COD Collected*\nAmount: ₹{{amount}} collected for AWB: {{awb}}.',
    push_title: '💰 COD Collected',
    push_body: '₹{{amount}} collected for AWB {{awb}}.',
    email_subject: 'SwiftRoute — COD Collected 💰',
    email_html: '<h2>💰 COD Collected</h2><p>₹{{amount}} collected for AWB {{awb}}.</p>',
  },
  WELCOME_USER: {
    sms: 'SwiftRoute: Welcome {{name}}! Your account is active. Start shipping at discounted rates today.',
    whatsapp: '👋 *Welcome to SwiftRoute, {{name}}!*\nYour account is active. Check out our dashboard to book your first shipment.',
    push_title: '👋 Welcome to SwiftRoute!',
    push_body: 'Happy to have you, {{name}}! Start shipping now.',
    email_subject: 'Welcome to SwiftRoute! 👋',
    email_html: '<h2>👋 Welcome to SwiftRoute, {{name}}!</h2><p>Your account is ready. Start comparing courier rates and shipping today.</p>',
  },
  PAYOUT_SENT: {
    sms: 'SwiftRoute: ₹{{amount}} payout initiated to your bank account. Ref: {{bank_ref}}.',
    whatsapp: '💸 *Payout Sent!*\nAmount: ₹{{amount}}\nRef: {{bank_ref}}\nExpected in 1-2 business days.',
    push_title: '💸 Payout Sent!',
    push_body: '₹{{amount}} sent to your bank. Ref: {{bank_ref}}.',
    email_subject: 'SwiftRoute — Payout Transferred 💸',
    email_html: '<h2>💸 Payout Transferred</h2><p>₹{{amount}} has been sent. Bank Ref: <strong>{{bank_ref}}</strong>.</p>',
  },
  DELIVERY_OTP: {
    sms: 'SwiftRoute OTP for secure delivery: {{otp}}. Valid for 15 mins. Do NOT share.',
    whatsapp: '🔑 *Secure Delivery OTP*\nOTP: *{{otp}}*\nValid 15 mins. Do NOT share with anyone.',
    push_title: '🔑 Delivery OTP',
    push_body: 'Your OTP: {{otp}}. Valid for 15 mins.',
    email_subject: 'SwiftRoute — Delivery OTP 🔑',
    email_html: '<h2>🔑 Delivery OTP</h2><p>OTP: <strong>{{otp}}</strong>. Valid for 15 minutes. Do not share.</p>',
  },
};

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}

// ─── Notification Logger ──────────────────────────────────────────────────────

async function logNotification(
  userId: string,
  shipmentId: string | undefined,
  channel: string,
  type: string,
  message: string,
  status: 'SENT' | 'FAILED'
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO notifications_log (user_id, shipment_id, channel, type, message, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, shipmentId ?? null, channel, type, message, status]
    );
  } catch (err) {
    console.error('[notification-consumer] DB log failed:', err);
  }
}

// ─── Channel Dispatchers ──────────────────────────────────────────────────────

async function dispatchSms(
  event: NotificationEvent,
  template: typeof TEMPLATES[string]
): Promise<void> {
  const message = interpolate(template.sms, event.payload);
  const phone = event.payload.phone as string;
  if (!phone) return;

  try {
    await sendMSG91Otp(phone, message);
    await logNotification(event.user_id, event.shipment_id, 'SMS', event.event_type, message, 'SENT');
  } catch {
    await logNotification(event.user_id, event.shipment_id, 'SMS', event.event_type, message, 'FAILED');
  }
}

async function dispatchWhatsApp(
  event: NotificationEvent,
  template: typeof TEMPLATES[string]
): Promise<void> {
  const message = interpolate(template.whatsapp, event.payload);
  const phone = event.payload.phone as string;
  if (!phone) return;

  try {
    await sendWhatsAppMessage(phone, message);
    await logNotification(event.user_id, event.shipment_id, 'WHATSAPP', event.event_type, message, 'SENT');
  } catch {
    await logNotification(event.user_id, event.shipment_id, 'WHATSAPP', event.event_type, message, 'FAILED');
  }
}

async function dispatchPush(
  event: NotificationEvent,
  template: typeof TEMPLATES[string]
): Promise<void> {
  const token = event.payload.fcm_token as string;
  if (!token) return;

  const title = template.push_title;
  const body = interpolate(template.push_body, event.payload);

  try {
    await sendPushNotification(token, title, body, {
      event_type: event.event_type,
      shipment_id: event.shipment_id ?? '',
    });
    await logNotification(event.user_id, event.shipment_id, 'PUSH', event.event_type, body, 'SENT');
  } catch {
    await logNotification(event.user_id, event.shipment_id, 'PUSH', event.event_type, body, 'FAILED');
  }
}

async function dispatchEmail(
  event: NotificationEvent,
  template: typeof TEMPLATES[string]
): Promise<void> {
  const email = event.payload.email as string;
  if (!email) return;

  const subject = template.email_subject;
  const html = interpolate(template.email_html, event.payload);

  try {
    await sendEmail(email, subject, html);
    await logNotification(event.user_id, event.shipment_id, 'EMAIL', event.event_type, subject, 'SENT');
  } catch {
    await logNotification(event.user_id, event.shipment_id, 'EMAIL', event.event_type, subject, 'FAILED');
  }
}

import { emitToUser } from './socket';

// ─── Main Dispatcher ──────────────────────────────────────────────────────────
const STRICT_FREE_MODE = process.env.STRICT_FREE_MODE === 'true';

async function dispatchNotification(event: NotificationEvent): Promise<void> {
  const template = TEMPLATES[event.event_type];
  if (!template) {
    console.warn(`[notification-consumer] Unknown event type: ${event.event_type}`);
    return;
  }

  // 1. Emit Socket.io event for real-time dashboard update (Always FREE)
  emitToUser(event.user_id, 'shipment:update', {
    shipment_id: event.shipment_id,
    event_type: event.event_type,
    payload: event.payload
  });

  // 2. Adjust channels based on STRICT_FREE_MODE
  let targetChannels = [...event.channels];
  
  if (STRICT_FREE_MODE) {
    // Audit requested channels for paid ones
    const hasPaidChannel = targetChannels.some(c => c === 'SMS' || c === 'WHATSAPP');
    
    if (hasPaidChannel) {
      console.log(`[notification-consumer] 🛡️ STRICT_FREE_MODE active. Bypassing paid channels for ${event.event_type}.`);
      
      // Filter out paid channels
      targetChannels = targetChannels.filter(c => c !== 'SMS' && c !== 'WHATSAPP');
      
      // Add PUSH as a fallback if it wasn't there
      if (!targetChannels.includes('PUSH')) {
        console.log(`[notification-consumer] ⚡ Adding PUSH as free fallback for ${event.event_type}`);
        targetChannels.push('PUSH');
      }
    }
  }

  if (targetChannels.length === 0) {
    console.log(`[notification-consumer] No free channels available for user ${event.user_id}. Recorded in Socket.io only.`);
    return;
  }

  // 3. Dispatch to final channel list
  const dispatchers = targetChannels.map((channel) => {
    switch (channel) {
      case 'SMS':       return dispatchSms(event, template);
      case 'WHATSAPP':  return dispatchWhatsApp(event, template);
      case 'PUSH':      return dispatchPush(event, template);
      case 'EMAIL':     return dispatchEmail(event, template);
      default:
        console.warn(`[notification-consumer] Unknown channel: ${channel}`);
        return Promise.resolve();
    }
  });

  await Promise.allSettled(dispatchers);
  console.log(`✅ [notification-consumer] ${event.event_type} processed via [${targetChannels.join(', ')}]`);
}



// ─── Consumer Startup ─────────────────────────────────────────────────────────

let consumerRunning = false;

export async function startNotificationConsumer(): Promise<void> {
  if (process.env.ENABLE_KAFKA_CONSUMER !== 'true') {
    console.log('ℹ️  Kafka notification consumer disabled (set ENABLE_KAFKA_CONSUMER=true)');
    return;
  }

  if (consumerRunning) {
    console.warn('[notification-consumer] Already running');
    return;
  }

  const consumer = kafka.consumer({ groupId: 'notification-dispatcher' });

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.NOTIFICATION_DISPATCH, fromBeginning: false });

    consumerRunning = true;
    console.log(`🎧 Kafka notification consumer listening on: ${TOPICS.NOTIFICATION_DISPATCH}`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          const event = JSON.parse(message.value.toString()) as NotificationEvent;
          await dispatchNotification(event);
        } catch (err) {
          console.error('[notification-consumer] Failed to process message:', err);
        }
      },
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await consumer.disconnect();
      consumerRunning = false;
    });

  } catch (err) {
    console.error('[notification-consumer] Failed to start:', err);
    consumerRunning = false;
  }
}
