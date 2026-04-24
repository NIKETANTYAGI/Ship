import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_SOURCE_NUMBER = process.env.GUPSHUP_SOURCE_NUMBER;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME || 'SwiftRoute';

/**
 * Sends WhatsApp Message via Gupshup
 * @param phone 10-digit mobile number
 * @param message Formatted message string
 */
export const sendWhatsAppMessage = async (phone: string, message: string) => {
  const STRICT_FREE_MODE = process.env.STRICT_FREE_MODE === 'true';

  try {
    // ── Development or Free Mode ──────────────────────────────
    if (!GUPSHUP_API_KEY || process.env.NODE_ENV === 'development' || STRICT_FREE_MODE) {
      console.log(`\n-----------------------------------------`);
      console.log(`💬 [WHATSAPP] ${STRICT_FREE_MODE ? '🛡️ FREE MODE' : '🛠️ MOCK WA'} to ${phone}`);
      console.log(`📩 Content: ${message.substring(0, 100)}...`);
      console.log(`-----------------------------------------\n`);
      return { success: true, message: 'WhatsApp message logged to console' };
    }

    // ── Production Mode (Requires Paid Gupshup Key) ───────────
    const response = await axios.post(
      'https://api.gupshup.io/wa/api/v1/msg', // Changed from template/msg to generic msg
      new URLSearchParams({
        source: GUPSHUP_SOURCE_NUMBER || '',
        destination: phone,
        message: JSON.stringify({ type: 'text', text: message }), // Use the interpolated message
        'channel': 'whatsapp',
        'app': GUPSHUP_APP_NAME
      }),
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': GUPSHUP_API_KEY
        }
      }
    );


    return { success: response.data.status === 'submitted', data: response.data };
  } catch (error) {
    console.error('❌ Gupshup WhatsApp Failed:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
};

/**
 * Pre-defined Template Helpers
 */
export const WhatsAppTemplates = {
  BOOKING_CONFIRMATION: 'booking_confirm_01',
  OUT_FOR_DELIVERY: 'ofd_alert_02',
  DELIVERED: 'delivered_succ_03',
  DELIVERY_OTP: 'delivery_otp_v1'
};
