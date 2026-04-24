import { CourierRateRequest, CourierRateResponse } from './types';

// In milliseconds
const TIMEOUT_MS = 3000;

export async function getDelhiveryRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  try {
    const apiKey = process.env.DELHIVERY_API_KEY;
    const baseUrl = process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com';

    // Mock response if no API key or in development
    if (!apiKey || process.env.NODE_ENV !== 'production') {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          courier_id: 'delhivery',
          courier_name: 'Delhivery',
          logo_url: 'https://swiftroute.in/logos/delhivery.png',
          price_paise: 8900,       // Rs 89.00
          official_eta_days: 3,
          ai_eta_days: 4,
          ai_confidence: 0.82,
          cod_available: true,
          cod_fee_paise: 2500,
          pickup_sla_hours: 2,
          rating: 4.2,
          is_sponsored: true,
          tags: ['fastest', 'cod_available']
        });
      }, 500)); // Simulate API delay
    }

    // Real API Implementation (Future)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // const response = await fetch(`${baseUrl}/api/v1/packages/json/`, {
    //   headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
    //   signal: controller.signal
    // });
    
    clearTimeout(timeout);
    
    // For now, always return the mocked payload if we ever fall into real execution without full mapping
    return null;

  } catch (error) {
    console.error(`[Delhivery API Error]`, error);
    return null; // Suppress errors so aggregator doesn't crash
  }
}
