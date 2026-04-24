# SwiftRoute — Integrations README

All external service clients live in `server/src/lib/`. Import them via relative paths.

---

## 📂 File Index

| File | Role | Mode |
|---|---|---|
| `redis.ts` | IoRedis connection singleton | Live |
| `kafka.ts` | Kafka producer + TOPICS constants | Live |
| `mongo.ts` | MongoDB + TrackingEvent schema | Live |
| `s3.ts` | MinIO/S3 file upload + presigned URLs | Live |
| `razorpay.ts` | Razorpay order creation + webhook verification | Mock/Live |
| `msg91.ts` | SMS OTP via MSG91 | Mock/Live |
| `whatsapp.ts` | WhatsApp via Gupshup | Mock/Live |
| `firebase.ts` | FCM Push notifications | Mock/Live |
| `sendgrid.ts` | Email via SendGrid | Mock/Live |
| `digio.ts` | KYC via Digio | Mock |
| `pinecone.ts` | AI address search via Pinecone + Python embedder | Live |
| `ulip.ts` | Vehicle/driver verification (ULIP Vahan/Sarathi) | Mock |
| `rate-cache.ts` | Redis + DB dual-layer courier rate cache | Live |
| `queues.ts` | BullMQ queue definitions (tracking-poll, notification, cod-payout) | Live |
| `workers.ts` | BullMQ worker processors | Live |
| `evidence.ts` | Evidence Vault: SHA256 upload to MinIO + DB | Live |
| `tracking-webhooks.ts` | Delhivery + DTDC inbound webhook handlers | Live |
| `notification-consumer.ts` | Kafka consumer → fan-out to all channels | Live |
| `lib/couriers/` | Courier rate + booking clients | See below |

---

## 🔌 Courier Clients (`src/lib/couriers/`)

### `delhivery.ts`
```typescript
import { getDelhiveryRates } from '../lib/couriers/delhivery';

const rate = await getDelhiveryRates({
  pickup_pincode: '110001',
  delivery_pincode: '400001',
  weight_grams: 500,
  is_cod: false,
});
// Returns CourierRateResponse | null
```

### `dtdc.ts`
```typescript
import { getDtdcRates } from '../lib/couriers/dtdc';

const rate = await getDtdcRates({ pickup_pincode: '110001', delivery_pincode: '400001', weight_grams: 500 });
```

### `xpressbees.ts`
```typescript
import { getXpressBeesRates } from '../lib/couriers/xpressbees';

const rate = await getXpressBeesRates({ pickup_pincode: '110001', delivery_pincode: '400001', weight_grams: 500 });
```

### `rates.aggregator.ts` — **The main entry point for BE2**
```typescript
import { aggregateRates } from '../lib/couriers/rates.aggregator';

const result = await aggregateRates({
  pickup_pincode: '110001',
  delivery_pincode: '400001',
  weight_grams: 500,
  is_cod: true,
});
// Returns AggregatedRatesResult { couriers: [...], cached: false, expires_at: '...' }
```

**Always use `aggregateRates`** — it calls all 3 couriers in parallel with `Promise.allSettled`, filters failures, and sorts by price.

---

## 💾 Rate Cache (`rate-cache.ts`)

Dual-layer caching: Redis (primary, 15-min TTL) → PostgreSQL rate_cache table (warm fallback).

```typescript
import { getRate, setRate } from '../lib/rate-cache';

// BE2 GET /couriers/rates flow:
const cached = await getRate('110001', '400001', 500, false);
if (cached) return res.json(cached);

const fresh = await aggregateRates({ ... });
await setRate('110001', '400001', 500, false, fresh);
return res.json(fresh);
```

---

## 📬 Payments (`razorpay.ts`)

```typescript
import { createOrder, verifyWebhookSignature } from '../lib/razorpay';

// Create a Razorpay order (amount in PAISE)
const order = await createOrder(89900, 'shipment_abc123');
// { id: 'order_xyz', amount: 89900, currency: 'INR' }

// Verify webhook signature
const isValid = verifyWebhookSignature(req.body, req.headers['x-razorpay-signature']);
```

---

## 📨 Notifications

All notification functions accept phone/email and message string.

### SMS (`msg91.ts`)
```typescript
import { sendOtpSms } from '../lib/msg91';
await sendOtpSms('+919876543210', 'Your OTP is 123456');
```

### WhatsApp (`whatsapp.ts`)
```typescript
import { sendWhatsAppMessage } from '../lib/whatsapp';
await sendWhatsAppMessage('+919876543210', 'Your shipment is out for delivery!');
```

### Push (`firebase.ts`)
```typescript
import { sendPushNotification } from '../lib/firebase';
await sendPushNotification(fcmToken, 'Out for Delivery', 'Your package arrives today!', { awb: 'XYZ123' });
```

### Email (`sendgrid.ts`)
```typescript
import { sendEmail } from '../lib/sendgrid';
await sendEmail({ to: 'user@example.com', subject: 'Booking Confirmed', html: '<h1>Done</h1>' });
```

---

## 🏛️ Evidence Vault (`evidence.ts`)

```typescript
import { uploadEvidence, getShipmentEvidence } from '../lib/evidence';

// Upload (called from multer route)
const result = await uploadEvidence(
  shipmentId,
  'PICKUP',   // EvidenceType: PICKUP | DELIVERY | DAMAGE | DISPUTE
  req.file.buffer,
  req.file.originalname,
  req.file.mimetype
);
// { id, file_url, download_url, file_hash, type, shipment_id }

// List evidence
const evidence = await getShipmentEvidence(shipmentId);
```

SHA256 deduplication: uploading the same file twice returns the existing record.

---

## 🗺️ Address Search (`pinecone.ts`)

```typescript
import { searchAddresses } from '../lib/pinecone';

const results = await searchAddresses('near India Gate Delhi', 5);
// Returns top 5 semantically similar addresses from Pinecone
```

**Requires**: Python embedder running on port 5001 (`npm run python:dev`)

---

## 🔔 Kafka Events (`kafka.ts`)

```typescript
import { emitEvent, TOPICS } from '../lib/kafka';

// Emit a shipment status update
await emitEvent(TOPICS.SHIPMENT_UPDATED, {
  awb: 'DL123456',
  status: 'DELIVERED',
  user_id: 'uuid-here',
  timestamp: new Date().toISOString(),
});

// Emit a notification dispatch request
await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
  user_id: 'uuid-here',
  event_type: 'BOOKING_CONFIRMED',
  channels: ['SMS', 'WHATSAPP', 'PUSH'],
  payload: { awb: 'DL123456', courier: 'Delhivery', pickup_sla: 2, phone: '+91...' }
});
```

**Topics:**
| Constant | Topic Name |
|---|---|
| `TOPICS.SHIPMENT_UPDATED` | `shipment.status.updated` |
| `TOPICS.PAYMENT_RECEIVED` | `payment.webhook.received` |
| `TOPICS.NOTIFICATION_DISPATCH` | `notification.dispatch_request` |
| `TOPICS.TRACKING_SYNC` | `tracking.manual_sync_trigger` |

---

## ⚙️ BullMQ Queues (`queues.ts`)

```typescript
import { enqueueTrackingPoll, enqueueNotification, enqueueCodPayout } from '../lib/queues';

// Poll courier after booking
await enqueueTrackingPoll({ awb: 'DL123456', courier: 'dtdc', shipment_id: 'uuid' });

// Send notification
await enqueueNotification({
  user_id: 'uuid',
  shipment_id: 'uuid',
  event_type: 'DELIVERED',
  channels: ['SMS', 'PUSH'],
  payload: { awb: 'DL123456', phone: '+91...' }
});

// Trigger COD payout (7-day cooling period by default)
await enqueueCodPayout({ shipment_id: 'uuid', user_id: 'uuid', amount_paise: 50000, awb: 'DL123456' });
```

Enable workers by setting `ENABLE_WORKERS=true` in `.env`.

---

## 🚗 ULIP Vahan/Sarathi (`ulip.ts`)

```typescript
import { getVehicleInfo, getDriverInfo, getVehicleLocation } from '../lib/ulip';

const vehicle = await getVehicleInfo('DL01AB1234');
// { vehicle_number, owner_name, vehicle_type, is_valid, fitness_upto, ... }

const driver = await getDriverInfo('DL0120180012345');
// { license_number, name, license_type, valid_upto, is_valid, ... }

const location = await getVehicleLocation('DL01AB1234');
// { latitude, longitude, speed_kmh, timestamp, source }
```

> **MOCK MODE** until `ULIP_TOKEN` is set in `.env`. Register at [ulip.dpiit.gov.in](https://ulip.dpiit.gov.in).

---

## 🌱 Seeder Scripts (`scripts/`)

| Script | Purpose | Command |
|---|---|---|
| `seed-pincodes.ts` | Seed 300+ pincodes into PostgreSQL | `npx ts-node scripts/seed-pincodes.ts` |
| `seed-pinecone.ts` | Seed Indian addresses into Pinecone | `npx ts-node scripts/seed-pinecone.ts` |
| `test-vectors.ts` | Test AI address search | `npx ts-node scripts/test-vectors.ts` |
| `test-couriers.ts` | Test rate aggregation | `npx ts-node scripts/test-couriers.ts` |
| `test-integrations.ts` | Test all integrations | `npx ts-node scripts/test-integrations.ts` |

---

## 🔑 Required `.env` Variables

```env
# Database
DATABASE_URL=postgres://...

# Redis
REDIS_URL=redis://127.0.0.1:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# MongoDB
MONGODB_URL=mongodb://localhost:27017/swiftroute

# MinIO (Evidence Vault)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=swiftroute
MINIO_SECRET_KEY=swiftroute123
MINIO_BUCKET=evidence-vault

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Couriers
DELHIVERY_API_KEY=...
DELHIVERY_WEBHOOK_SECRET=...

# Notifications
MSG91_AUTH_KEY=...
GUPSHUP_USERID=...
GUPSHUP_PASSWORD=...
SENDGRID_API_KEY=...

# KYC
DIGIO_CLIENT_ID=...
DIGIO_CLIENT_SECRET=...

# AI
PINECONE_API_KEY=...
PINECONE_INDEX=swiftroute-addresses

# ULIP (optional — mock mode until credentials arrive)
ULIP_TOKEN=...

# Feature Flags
ENABLE_WORKERS=true
ENABLE_KAFKA_CONSUMER=true
```
