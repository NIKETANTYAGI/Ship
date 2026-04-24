import { CourierRateRequest, CourierRateResponse } from './types';

const INTERNATIONAL_ZONES: Record<string, { price_per_kg: number, eta_days: number }> = {
  'UAE': { price_per_kg: 120000, eta_days: 3 },      // 1200.00 INR
  'USA': { price_per_kg: 250000, eta_days: 7 },      // 2500.00 INR
  'SINGAPORE': { price_per_kg: 150000, eta_days: 4 }, // 1500.00 INR
  'UK': { price_per_kg: 220000, eta_days: 6 },       // 2200.00 INR
};

export async function getInternationalRates(req: CourierRateRequest): Promise<CourierRateResponse | null> {
  if (!req.is_international || !req.destination_country) return null;

  const zone = INTERNATIONAL_ZONES[req.destination_country.toUpperCase()];
  if (!zone) return null;

  const weightKg = req.weight_grams / 1000;
  const totalPricePaise = Math.round(weightKg * zone.price_per_kg);

  return {
    courier_id: 'swiftroute-intl',
    courier_name: `SwiftRoute Global (${req.destination_country})`,
    price_paise: totalPricePaise,
    official_eta_days: zone.eta_days,
    ai_eta_days: zone.eta_days - 1,
    ai_confidence: 0.92,
    cod_available: false, // International is almost never COD
    cod_fee_paise: 0,
    pickup_sla_hours: 24,
    rating: 4.9,
    is_sponsored: false,
    tags: ['Swift', 'Global', 'Reliable']
  };
}
