export interface CourierRateRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  weight_grams: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  is_cod?: boolean;
  destination_country?: string;
  is_international?: boolean;
}

export interface CourierRateResponse {
  courier_id: string;
  courier_name: string;
  logo_url?: string;
  price_paise: number;
  official_eta_days: number;
  ai_eta_days: number;
  ai_confidence: number;
  cod_available: boolean;
  cod_fee_paise: number;
  pickup_sla_hours: number;
  rating: number;
  is_sponsored: boolean;
  tags: string[];
}

export interface AggregatedRatesResult {
  pickup_pincode: string;
  delivery_pincode: string;
  weight_grams: number;
  cached: boolean;
  couriers: CourierRateResponse[];
  expires_at: string;
}
