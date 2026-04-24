import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@swiftroute.in';

/**
 * SwiftRoute Email Integration (SendGrid)
 * Handles transactional emails like booking receipts and system alerts.
 */
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('📧 SendGrid initialized successfully');
} else {
  console.warn('⚠️ SendGrid API Key missing. Mock mode enabled.');
}

/**
 * Sends a generic transactional email
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  // 1. Mock Mode
  if (!SENDGRID_API_KEY) {
    console.log('\n--- 📧 MOCK EMAIL NOTIFICATION ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML Snippet): ${html.substring(0, 50)}...`);
    console.log('----------------------------------\n');
    return { success: true, messageId: 'mock-email-id-' + Date.now() };
  }

  // 2. Real API Call
  try {
    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ SendGrid Email Failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

/**
 * Specialized Receipt Generator
 */
export const sendBookingReceipt = async (to: string, shipmentId: string, amount: number) => {
  const subject = `Booking Confirmation - #${shipmentId}`;
  const html = `
    <h1>Thank you for booking with SwiftRoute!</h1>
    <p>Your shipment <b>#${shipmentId}</b> has been successfully booked.</p>
    <p><b>Amount Paid:</b> ₹${(amount / 100).toFixed(2)}</p>
    <p>We will notify you once the package is picked up.</p>
  `;
  return await sendEmail(to, subject, html);
};
