/**
 * BE3 — Day 9: Cashfree Payouts Integration
 *
 * Handles COD (Cash on Delivery) payouts to sellers/users after delivery.
 * Also handles refunds for prepaid shipments.
 *
 * Flow:
 *  1. Shipment is delivered → courier marks COD as collected
 *  2. 7-day cooling period (BullMQ delay)
 *  3. enqueueCodPayout() fires → this client executes
 *  4. Cashfree initiates bank transfer → cod_remittances table updated
 *
 * Mock mode active when CASHFREE_CLIENT_ID is missing.
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox'; // 'sandbox' | 'production'
const CASHFREE_BASE = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/payout/v1'
  : 'https://payout-gamma.cashfree.com/payout/v1';

const CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

const MOCK_MODE = !CLIENT_ID || !CLIENT_SECRET;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CashfreePayoutRequest {
  transfer_id: string;        // Unique idempotency key (e.g. shipment_id)
  amount: number;             // Amount in RUPEES (not paise)
  beneficiary_name: string;
  beneficiary_account: string;
  beneficiary_ifsc: string;
  remarks?: string;
}

export interface CashfreePayoutResult {
  transfer_id: string;
  cashfree_ref: string;       // Cashfree's internal reference
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  utr?: string;               // UTR number once settled
}

// ─── Auth Token ──────────────────────────────────────────────────────────────

let authToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getAuthToken(): Promise<string> {
  // Return cached token if still valid (Cashfree tokens last 30 minutes)
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  const response = await axios.post(
    `${CASHFREE_BASE}/authorize`,
    {},
    {
      headers: {
        'X-Client-Id': CLIENT_ID,
        'X-Client-Secret': CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
    }
  );

  authToken = response.data.data.token as string;
  tokenExpiry = new Date(Date.now() + 25 * 60 * 1000); // 25 mins to be safe
  return authToken;
}

// ─── Add Beneficiary (if not already registered) ─────────────────────────────

export async function addBeneficiary(params: {
  beneficiary_id: string;
  name: string;
  account: string;
  ifsc: string;
  phone: string;
  email?: string;
}): Promise<boolean> {
  if (MOCK_MODE) {
    console.log('[cashfree] MOCK — addBeneficiary:', params.name, params.account.slice(-4));
    return true;
  }

  try {
    const token = await getAuthToken();
    await axios.post(
      `${CASHFREE_BASE}/addBeneficiary`,
      {
        beneId: params.beneficiary_id,
        name: params.name,
        paymentInstrumentType: 'bank_account',
        bankAccount: params.account,
        ifsc: params.ifsc,
        phone: params.phone,
        email: params.email ?? '',
      },
      { headers: { Authorization: token } }
    );
    return true;
  } catch (err: any) {
    // Code 409 = beneficiary already exists — that's fine
    if (err?.response?.data?.status === 'ERROR' && err?.response?.data?.subCode === '409') {
      return true;
    }
    console.error('[cashfree] addBeneficiary failed:', err?.response?.data || err);
    return false;
  }
}

// ─── Initiate Payout ──────────────────────────────────────────────────────────

/**
 * Transfer COD amount to a user's bank account.
 */
export async function initiatePayout(req: CashfreePayoutRequest): Promise<CashfreePayoutResult | null> {
  if (MOCK_MODE) {
    console.log(`[cashfree] MOCK — Payout ₹${req.amount} to ${req.beneficiary_account.slice(-4)}`);
    console.log(`[cashfree] Transfer ID: ${req.transfer_id} | IFSC: ${req.beneficiary_ifsc}`);
    return {
      transfer_id: req.transfer_id,
      cashfree_ref: `MOCK-CFR-${req.transfer_id}`,
      status: 'PENDING',
    };
  }

  try {
    const token = await getAuthToken();

    const response = await axios.post(
      `${CASHFREE_BASE}/requestTransfer`,
      {
        beneId: req.transfer_id,         // Use transfer_id as bene key
        amount: req.amount.toFixed(2),   // Cashfree expects string with 2 decimals
        transferId: req.transfer_id,
        transferMode: 'banktransfer',
        remarks: req.remarks ?? 'SwiftRoute COD Payout',
      },
      { headers: { Authorization: token } }
    );

    const data = response.data?.data;
    return {
      transfer_id: req.transfer_id,
      cashfree_ref: data?.referenceId ?? '',
      status: data?.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
      utr: data?.utr,
    };
  } catch (err: any) {
    console.error('[cashfree] initiatePayout failed:', err?.response?.data || err);
    return null;
  }
}

// ─── Check Transfer Status ────────────────────────────────────────────────────

export async function getTransferStatus(transferId: string): Promise<CashfreePayoutResult | null> {
  if (MOCK_MODE) {
    console.log(`[cashfree] MOCK — getTransferStatus(${transferId})`);
    return {
      transfer_id: transferId,
      cashfree_ref: `MOCK-CFR-${transferId}`,
      status: 'SUCCESS',
      utr: `MOCK-UTR-${Date.now()}`,
    };
  }

  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${CASHFREE_BASE}/getTransferStatus?transferId=${transferId}`,
      { headers: { Authorization: token } }
    );

    const data = response.data?.data;
    return {
      transfer_id: transferId,
      cashfree_ref: data?.referenceId ?? '',
      status: data?.status === 'SUCCESS' ? 'SUCCESS' : data?.status === 'FAILED' ? 'FAILED' : 'PENDING',
      utr: data?.utr,
    };
  } catch (err: any) {
    console.error('[cashfree] getTransferStatus failed:', err?.response?.data || err);
    return null;
  }
}

// ─── Razorpay Refund (Prepaid Returns) ───────────────────────────────────────

/**
 * Initiate a refund for a prepaid order via Razorpay.
 * Used when a shipment is cancelled before pickup or fails delivery.
 */
export async function initiateRazorpayRefund(
  paymentId: string,
  amountPaise: number,
  reason: string = 'Shipment cancelled'
): Promise<{ refund_id: string; status: string } | null> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.log(`[cashfree/refund] MOCK — Razorpay refund: ₹${amountPaise / 100} for payment ${paymentId}`);
    return { refund_id: `MOCK-REFUND-${paymentId}`, status: 'processed' };
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await axios.post(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      { amount: amountPaise, notes: { reason } },
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
    );

    return {
      refund_id: response.data.id,
      status: response.data.status,
    };
  } catch (err: any) {
    console.error('[refund] Razorpay refund failed:', err?.response?.data || err);
    return null;
  }
}
