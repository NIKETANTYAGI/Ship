import axios from 'axios';
import { CourierRateRequest, CourierRateResponse } from './types';
import redis from '../../Database/db'; // We'll use redis for token caching if available, but for now let's use a simple memory cache or just login each time (not ideal)

let shiprocketToken: string | null = null;
let tokenExpiry: number = 0;

async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    shiprocketToken = response.data.token;
    tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000); // Token lasts 10 days, we refresh after 9
    return shiprocketToken;
  } catch (error) {
    console.error('❌ Shiprocket Auth Failed:', error);
    return null;
  }
}

export async function getShiprocketRates(req: CourierRateRequest): Promise<CourierRateResponse[]> {
  const token = await getShiprocketToken();
  if (!token) return [];

  try {
    const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
      params: {
        pickup_postcode: req.pickup_pincode,
        delivery_postcode: req.delivery_pincode,
        weight: req.weight_grams / 1000, // Shiprocket expects KG
        cod: req.is_cod ? 1 : 0,
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data || !response.data.data || !response.data.data.available_courier_companies) {
      return [];
    }

    return response.data.data.available_courier_companies.map((c: any) => ({
      courier_id: `shiprocket_${c.courier_company_id}`,
      name: c.courier_name,
      price_paise: Math.round(parseFloat(c.rate) * 100),
      estimated_days: c.etd_hours ? Math.ceil(c.etd_hours / 24) : 3,
      cod_available: c.cod === 1,
      is_sponsored: false
    }));
  } catch (error) {
    console.error('❌ Shiprocket Rate Fetch Failed:', error);
    return [];
  }
}
