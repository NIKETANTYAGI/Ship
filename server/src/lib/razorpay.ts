import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Razorpay Client Instance
 * If keys are missing, we log a warning but allow initialization (for dev/test)
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_missing_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing_secret',
});

/**
 * Creates a Razorpay Order
 * @param amount Amount in standard currency (e.g. ₹100), will be converted to PAISE
 * @param currency Default is INR
 * @param receipt Unique identifier for this transaction (e.g. Shipment ID)
 */
export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
) => {
  try {
    // Razorpay accepts amount in PAISE (amount * 100)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('❌ Razorpay Order Creation Failed:', error);
    throw new Error('Failed to initiate payment gateway order.');
  }
};

/**
 * Verifies Razorpay Webhook Signature
 * @param payload Raw body of the request
 * @param signature Signature from X-Razorpay-Signature header
 */
export const verifyRazorpaySignature = (payload: string, signature: string): boolean => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('❌ Razorpay Signature Verification Error:', error);
    return false;
  }
};

export default razorpay;
