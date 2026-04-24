import { getShiprocketRates } from './shiprocket';
import { getDelhiveryRates } from './delhivery';
import { getDtdcRates } from './dtdc';
import { getXpressBeesRates } from './xpressbees';
import { getInternationalRates } from './international';
import db from '../../Database/db';
import { CourierRateRequest, AggregatedRatesResult, CourierRateResponse } from './types';

export async function aggregateRates(req: CourierRateRequest): Promise<AggregatedRatesResult> {
  // 1. Fetch Shiprocket rates (primary aggregator) + Direct fallbacks
  const [results, campaigns] = await Promise.all([
    Promise.allSettled([
      getShiprocketRates(req),
      getDelhiveryRates(req),
      getDtdcRates(req),
      getXpressBeesRates(req),
      getInternationalRates(req),
    ]),

    db.query('SELECT courier_id FROM sponsored_campaigns WHERE is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())')
  ]);

  const sponsoredIdSet = new Set(campaigns.rows.map(r => r.courier_id));

  // 2. Filter out failures and nulls, and tag sponsored ones
  let couriers: CourierRateResponse[] = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value !== null) {
      const val = result.value;
      const rateArray = Array.isArray(val) ? val : [val];
      
      rateArray.forEach(rate => {
        rate.is_sponsored = sponsoredIdSet.has(rate.courier_id);
        couriers.push(rate);
      });
    }
  });

  // 3. Filter by COD if requested
  if (req.is_cod) {
    couriers = couriers.filter(c => c.cod_available);
  }

  // 4. Sort: Sponsored first, then by Price
  couriers.sort((a, b) => {
    if (a.is_sponsored && !b.is_sponsored) return -1;
    if (!a.is_sponsored && b.is_sponsored) return 1;
    return a.price_paise - b.price_paise;
  });

  // 5. Construct expiration time (15 mins from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  return {
    pickup_pincode: req.pickup_pincode,
    delivery_pincode: req.delivery_pincode,
    weight_grams: req.weight_grams,
    cached: false,
    couriers,
    expires_at: expiresAt.toISOString(),
  };
}

