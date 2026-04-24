import { CourierRateRequest, CourierRateResponse } from './types';

const TIMEOUT_MS = 3000;

export async function getXpressBeesRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.XPRESSBEES_API_KEY;

    // Mock response if no API key or in development
    if (!apiKey || process.env.NODE_ENV !== 'production') {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          courier_id: 'xpressbees',
          courier_name: 'XpressBees',
          logo_url: 'https://swiftroute.in/logos/xpressbees.png',
          price_paise: 8200,       // Rs 82.00
          official_eta_days: 5,
          ai_eta_days: 5,
          ai_confidence: 0.91,
          cod_available: false,
          cod_fee_paise: 0,
          pickup_sla_hours: 24,
          rating: 4.0,
          is_sponsored: false,
          tags: ['most_reliable']
        });
      }, 400)); // Simulating faster response
    }

    // Real API Implementation (Future)
    return null;

  } catch (error) {
    console.error(`[XpressBees API Error]`, error);
    return null;
  }
}
