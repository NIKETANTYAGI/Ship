/**
 * BE3 — Day 9: Reverse Shipment / Return Booking Client
 *
 * Handles return pickups for:
 *  - Customer-initiated returns (buyer returns to seller)
 *  - RTO (Return to Origin — courier couldn't deliver)
 *
 * Currently integrates with Delhivery reverse pickup API.
 * DTDC and XpressBees reverse APIs can be added in the same pattern.
 *
 * Mock mode active when API keys are missing.
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnAddress {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
}

export interface ReverseBookingRequest {
  original_awb: string;          // AWB of the forward shipment
  pickup_address: ReturnAddress; // Where to pick up from (buyer/delivery address)
  return_address: ReturnAddress; // Where to return to (seller/origin)
  weight_grams: number;
  reason: string;                // e.g. "CUSTOMER_RETURN", "RTO", "DAMAGE"
  courier?: 'delhivery' | 'dtdc' | 'xpressbees'; // Defaults to original courier
}

export interface ReverseBookingResult {
  reverse_awb: string;
  courier: string;
  pickup_scheduled_at: string;   // ISO timestamp
  estimated_return_date: string; // ISO date
  label_url?: string;
}

// ─── Delhivery Reverse Client ─────────────────────────────────────────────────

async function bookDelhiveryReturn(req: ReverseBookingRequest): Promise<ReverseBookingResult | null> {
  const apiKey = process.env.DELHIVERY_API_KEY;
  const baseUrl = process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com';

  if (!apiKey || process.env.NODE_ENV !== 'production') {
    console.log('[reverse] MOCK — Delhivery reverse booking for AWB:', req.original_awb);
    return {
      reverse_awb: `RV${req.original_awb}`,
      courier: 'Delhivery',
      pickup_scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimated_return_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      label_url: `https://mock-label.swiftroute.in/reverse/${req.original_awb}.pdf`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const payload = {
      shipments: [{
        waybill: req.original_awb,
        name: req.pickup_address.name,
        contactno: req.pickup_address.phone,
        add: req.pickup_address.address,
        city: req.pickup_address.city,
        state: req.pickup_address.state,
        pin: req.pickup_address.pincode,
        return_name: req.return_address.name,
        return_add: req.return_address.address,
        return_city: req.return_address.city,
        return_state: req.return_address.state,
        return_pin: req.return_address.pincode,
        weight: req.weight_grams / 1000, // kg
        order: `REV-${req.original_awb}`,
        cod: 0,
        payment_mode: 'Reverse',
      }],
      pickup_location: { name: req.return_address.name },
    };

    const response = await axios.post(
      `${baseUrl}/api/p/create`,
      `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const packageData = response.data?.packages?.[0];
    if (!packageData?.waybill) throw new Error('Delhivery reverse booking failed — no AWB returned');

    return {
      reverse_awb: packageData.waybill,
      courier: 'Delhivery',
      pickup_scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimated_return_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  } catch (err) {
    console.error('[reverse] Delhivery return booking failed:', err);
    return null;
  }
}

// ─── DTDC Reverse (Stub) ──────────────────────────────────────────────────────

async function bookDtdcReturn(req: ReverseBookingRequest): Promise<ReverseBookingResult | null> {
  // DTDC reverse API credentials take time — mock stub
  console.log('[reverse] MOCK — DTDC reverse booking for AWB:', req.original_awb);
  return {
    reverse_awb: `DTDC-RV-${req.original_awb}`,
    courier: 'DTDC',
    pickup_scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    estimated_return_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
}

// ─── Main: Book Return Shipment ───────────────────────────────────────────────

/**
 * Books a reverse pickup with the appropriate courier.
 * Tries the requested courier, falls back to Delhivery on failure.
 *
 * @returns ReverseBookingResult with the return AWB, or null if all couriers fail
 */
export async function bookReturnShipment(
  req: ReverseBookingRequest
): Promise<ReverseBookingResult | null> {
  const courier = req.courier || 'delhivery';

  console.log(`[reverse] Booking return for AWB ${req.original_awb} via ${courier} (reason: ${req.reason})`);

  try {
    let result: ReverseBookingResult | null = null;

    if (courier === 'dtdc') {
      result = await bookDtdcReturn(req);
    } else {
      // Default: Delhivery has the best reverse network in India
      result = await bookDelhiveryReturn(req);
    }

    if (result) {
      console.log(`✅ [reverse] Return AWB: ${result.reverse_awb} | ETA: ${result.estimated_return_date}`);
    } else {
      console.warn(`⚠️ [reverse] Primary courier failed, trying Delhivery fallback...`);
      result = await bookDelhiveryReturn(req);
    }

    return result;
  } catch (err) {
    console.error('[reverse] Fatal error booking return:', err);
    return null;
  }
}

/**
 * Cancel a reverse pickup that hasn't been picked up yet
 */
export async function cancelReversePickup(reverseAwb: string): Promise<boolean> {
  const apiKey = process.env.DELHIVERY_API_KEY;
  const baseUrl = process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com';

  if (!apiKey || process.env.NODE_ENV !== 'production') {
    console.log(`[reverse] MOCK — Cancel reverse pickup for AWB: ${reverseAwb}`);
    return true;
  }

  try {
    await axios.post(
      `${baseUrl}/api/p/edit`,
      `format=json&data=${encodeURIComponent(JSON.stringify({ waybill: reverseAwb, cancellation: true }))}`,
      { headers: { 'Authorization': `Token ${apiKey}` } }
    );
    console.log(`✅ [reverse] Cancelled reverse AWB: ${reverseAwb}`);
    return true;
  } catch (err) {
    console.error('[reverse] Cancel failed:', err);
    return false;
  }
}
