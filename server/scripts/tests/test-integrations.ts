import { createRazorpayOrder } from '../src/lib/razorpay';
import { sendMSG91Otp } from '../src/lib/msg91';
import dotenv from 'dotenv';
dotenv.config();

async function testIntegrations() {
  console.log('🧪 Starting Phase 1 Integration Tests...\n');

  // ── Test 1: Razorpay ──────────────────────────────────────
  console.log('📦 Testing Razorpay Order Creation...');
  try {
    const order = await createRazorpayOrder(100, 'INR', 'TEST_RECEIPT_001');
    console.log('✅ Razorpay Success! Order ID:', order.id);
  } catch (error) {
    console.warn('⚠️ Razorpay Failed (Likely missing API Keys):', error instanceof Error ? error.message : error);
    console.log('💡 This is expected in development if RAZORPAY_KEY_ID is empty.\n');
  }

  // ── Test 2: MSG91 SMS ─────────────────────────────────────
  console.log('📱 Testing MSG91 SMS Dispatch...');
  try {
    const result = await sendMSG91Otp('9876543210', '123456');
    console.log('✅ MSG91 Status:', result.message || 'Success');
  } catch (error) {
    console.error('❌ MSG91 Failed:', error instanceof Error ? error.message : error);
  }

  console.log('\n✨ Integration Tests Complete.');
}

testIntegrations();
