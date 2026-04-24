import { sendWhatsAppMessage, WhatsAppTemplates } from '../src/lib/whatsapp';
import { sendPushNotification } from '../src/lib/firebase';
import { sendEmail, sendBookingReceipt } from '../src/lib/sendgrid';
import { initiateKyc } from '../src/lib/digio';

async function testCommunications() {
  console.log('🚀 Starting SwiftRoute Communication Test Suite...\n');

  // 1. WhatsApp Test
  console.log('📱 Testing WhatsApp...');
  await sendWhatsAppMessage('919876543210', WhatsAppTemplates.DELIVERY_OTP, ['123456']);

  // 2. Push Notification Test
  console.log('🔔 Testing Push Notifications...');
  await sendPushNotification('test-device-token-123', 'Shipment Update', 'Your package is out for delivery!', { awb: 'AWB123456' });

  // 3. Email Test
  console.log('📧 Testing Email...');
  await sendBookingReceipt('test@example.com', 'SHIP-789', 59900); // ₹599.00

  // 4. KYC Test
  console.log('🆔 Testing KYC Initiation...');
  const kycResult = await initiateKyc('Sameer S.', 'user_id_456');
  console.log('✅ KYC Redirect URL:', kycResult.redirectUrl);

  console.log('\n✨ Communication Test Suite Complete.');
  process.exit(0);
}

testCommunications();
