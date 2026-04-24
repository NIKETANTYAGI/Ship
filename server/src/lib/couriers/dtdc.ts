import { CourierRateRequest, CourierRateResponse } from './types';

const TIMEOUT_MS = 3000;

export async function getDtdcRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DTDC_API_KEY;

    // Mock response if no API key or in development
    if (!apiKey || process.env.NODE_ENV !== 'production') {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          courier_id: 'dtdc',
          courier_name: 'DTDC',
          logo_url: 'https://swiftroute.in/logos/dtdc.png',
          price_paise: 7500,       // Rs 75.00
          official_eta_days: 4,
          ai_eta_days: 5,
          ai_confidence: 0.79,
          cod_available: true,
          cod_fee_paise: 2500,
          pickup_sla_hours: 4,
          rating: 3.8,
          is_sponsored: false,
          tags: ['cheapest']
        });
      }, 700)); // Simulate slightly longer delay
    }

    // Real API Implementation (Future)
    return null;

  } catch (error) {
    console.error(`[DTDC API Error]`, error);
    return null;
  }
}
