import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_API_KEY || '';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'SWFTRT';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || '';

/**
 * Sends OTP via MSG91 SMS Gateway
 * @param phone 10-digit mobile number
 * @param otp 6-digit OTP string
 */
export const sendMSG91Otp = async (phone: string, otp: string) => {
  const STRICT_FREE_MODE = process.env.STRICT_FREE_MODE === 'true';

  try {
    // ── Development or Free Mode ──────────────────────────────
    if (!MSG91_AUTH_KEY || process.env.NODE_ENV === 'development' || STRICT_FREE_MODE) {
      console.log(`\n-----------------------------------------`);
      console.log(`📱 [MSG91] ${STRICT_FREE_MODE ? '🛡️ FREE MODE' : '🛠️ MOCK SMS'} to ${phone}`);
      console.log(`📩 Content: Your SwiftRoute OTP is ${otp}`);
      console.log(`-----------------------------------------\n`);
      return { success: true, message: 'OTP logged to console' };
    }

    // ── Production Mode (Requires Paid API Key) ───────────────
    // ... rest of the production code 

    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: phone.startsWith('91') ? phone : `91${phone}`,
      authkey: MSG91_AUTH_KEY,
      otp: otp,
      extra_param: {
        OTP: otp
      }
    };

    const response = await axios.post('https://api.msg91.com/api/v5/otp', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.type === 'success') {
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.message || 'Unknown MSG91 Error');
    }
  } catch (error) {
    console.error('❌ MSG91 SMS Failed:', error instanceof Error ? error.message : error);
    // Even if it fails, in dev we don't want to crash the whole auth flow
    if (process.env.NODE_ENV === 'development') {
      return { success: false, message: 'Failed to send SMS (Dev Fallback)' };
    }
    throw new Error('Could not deliver OTP via SMS Service.');
  }
};
