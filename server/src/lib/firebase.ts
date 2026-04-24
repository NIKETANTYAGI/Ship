import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

/**
 * SwiftRoute Firebase Push Notifications
 * Handles high-priority alerts for mobile clients.
 */
let firebaseInitialized = false;

// 1. Initialize Firebase Admin
// 1. Initialize Firebase Admin
try {
  let serviceAccountConfig;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccountConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch(e) {
      console.warn("⚠️ Invalid FIREBASE_SERVICE_ACCOUNT_JSON format mapping to JSON object.");
    }
  } 

  if (!serviceAccountConfig) {
    const serviceAccountPath = path.resolve(process.cwd(), FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccountConfig = require(serviceAccountPath);
    }
  }
  
  if (serviceAccountConfig) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountConfig),
      projectId: FIREBASE_PROJECT_ID
    });
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin initialized successfully');
  } else {
    console.warn(`⚠️ Firebase Service Account not found. Mock mode enabled.`);
  }
} catch (error) {
  console.warn('⚠️ Firebase Initialization Warning:', error instanceof Error ? error.message : 'Check your service account.');
}

/**
 * Sends a push notification to a specific device token
 */
export const sendPushNotification = async (
  token: string, 
  title: string, 
  body: string, 
  data: any = {}
) => {
  // 1. Mock Mode
  if (!firebaseInitialized) {
    console.log('\n--- 🔔 MOCK PUSH NOTIFICATION ---');
    console.log(`To Token: ${token.substring(0, 10)}...`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    console.log('---------------------------------\n');
    return { success: true, messageId: 'mock-push-id-' + Date.now() };
  }

  // 2. Real API Call
  try {
    const message = {
      notification: { title, body },
      data,
      token
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Firebase Messaging Failed:', error);
    return { success: false, error: 'Failed to send push notification' };
  }
};
