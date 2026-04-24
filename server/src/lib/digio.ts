import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const DIGIO_CLIENT_ID = process.env.DIGIO_CLIENT_ID;
const DIGIO_CLIENT_SECRET = process.env.DIGIO_CLIENT_SECRET;
const DIGIO_BASE_URL = process.env.DIGIO_BASE_URL || 'https://app.digio.in/api/v2';

/**
 * SwiftRoute KYC Integration (Digio)
 * Handles Aadhaar-based identity verification.
 */
const getAuthHeaders = () => {
  if (!DIGIO_CLIENT_ID || !DIGIO_CLIENT_SECRET) return null;
  const auth = Buffer.from(`${DIGIO_CLIENT_ID}:${DIGIO_CLIENT_SECRET}`).toString('base64');
  return { Authorization: `Basic ${auth}` };
};

/**
 * Initiates a KYC request and returns the redirect URL for the frontend
 */
export const initiateKyc = async (customerName: string, identifier: string) => {
  // 1. Mock Mode
  if (!DIGIO_CLIENT_ID) {
    console.log('\n--- 🆔 MOCK KYC INITIATION ---');
    console.log(`To Customer: ${customerName}`);
    console.log(`Identifier: ${identifier}`);
    console.log('------------------------------\n');
    return { 
      success: true, 
      id: 'mock-kyc-id-' + Date.now(), 
      redirectUrl: 'https://swiftroute.in/kyc-mock-success' 
    };
  }

  // 2. Real API Call
  try {
    const response = await axios.post(
      `${DIGIO_BASE_URL}/kyc/v2/digital_kyc`,
      {
        customer_name: customerName,
        customer_identifier: identifier,
        template_name: 'SWIFT_KYC_v1',
        notify_customer: true,
        generate_access_token: true
      },
      { headers: getAuthHeaders() || {} }
    );

    return { 
      success: true, 
      id: response.data.id, 
      redirectUrl: `${DIGIO_BASE_URL}/web/kyc/${response.data.id}/${response.data.access_token.id}` 
    };
  } catch (error) {
    console.error('❌ Digio KYC Initiation Failed:', error);
    return { success: false, error: 'Failed to initiate KYC' };
  }
};

/**
 * Checks the current status of a KYC request
 */
export const checkKycStatus = async (id: string) => {
  if (!DIGIO_CLIENT_ID) {
    return { success: true, status: 'approved', message: 'Mock Approval' };
  }

  try {
    const response = await axios.get(
      `${DIGIO_BASE_URL}/kyc/v2/digital_kyc/${id}`,
      { headers: getAuthHeaders() || {} }
    );
    return { success: true, status: response.data.status, data: response.data };
  } catch (error) {
    console.error('❌ Digio KYC Status Check Failed:', error);
    return { success: false, error: 'Failed to fetch KYC status' };
  }
};
