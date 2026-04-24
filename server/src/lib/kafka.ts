import { Kafka, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];

/**
 * SwiftRoute Kafka Client
 * Handles high-velocity event streaming for payments, shipping, and notifications.
 */
export const kafka = new Kafka({
  clientId: 'swiftroute-server',
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Singleton Producer
export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

/**
 * Emits a structured event to a Kafka topic
 * @param topic The target topic (e.g. shipment.status.updated)
 * @param payload The event data as an object
 */
export const emitEvent = async (topic: string, payload: any) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(payload) },
      ],
    });
  } catch (error) {
    console.error(`❌ Kafka Emission Failed [${topic}]:`, error);
    // In dev, we don't want to crash if Kafka is down
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

/**
 * Topic Constants - Follows service.entity.action pattern
 */
export const TOPICS = {
  SHIPMENT_UPDATED: 'shipment.status.updated',
  PAYMENT_RECEIVED: 'payment.webhook.received',
  NOTIFICATION_DISPATCH: 'notification.dispatch_request',
  TRACKING_SYNC: 'tracking.manual_sync_trigger',
  USER_REGISTERED: 'user.account.created'
};
