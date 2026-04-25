import axios from 'axios';

const EXOTEL_SID = process.env.EXOTEL_SID;
const EXOTEL_KEY = process.env.EXOTEL_KEY;
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN;

/**
 * Exotel IVR Helper
 * Used for automated verification calls and driver coordination.
 */
export const initiateVerificationCall = async (phoneNumber: string, otp: string) => {
    if (!EXOTEL_SID || !EXOTEL_KEY || !EXOTEL_TOKEN) {
        console.log(`[EXOTEL MOCK] Initiating IVR call to ${phoneNumber} with OTP: ${otp}`);
        return { success: true, message: 'Mock call initiated' };
    }

    try {
        // Example Exotel Call API structure
        // In real implementation, this would trigger a flow that speaks the OTP
        const response = await axios.post(
            `https://${EXOTEL_KEY}:${EXOTEL_TOKEN}@api.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`,
            {
                From: phoneNumber,
                To: process.env.EXOTEL_VIRTUAL_NUMBER,
                CallerId: process.env.EXOTEL_VIRTUAL_NUMBER,
                Url: `http://your-app.com/api/ivr/otp-flow?otp=${otp}`
            }
        );

        return response.data;
    } catch (error) {
        console.error('Exotel Call Error:', error);
        return { success: false, error: 'Failed to initiate call' };
    }
};
