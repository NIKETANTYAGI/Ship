import { aggregateRates } from '../src/lib/couriers/rates.aggregator';
import { CourierRateRequest } from '../src/lib/couriers/types';

async function testCourierEngine() {
  console.log('🚀 Initiating Courier Engine Test...');
  
  const payload: CourierRateRequest = {
    pickup_pincode: '110001',
    delivery_pincode: '400001',
    weight_grams: 1000,
    is_cod: false
  };

  console.log(`\n📦 Request Params:`, payload);
  console.log('⏳ Fetching rates concurrently from multiple couriers...\n');

  const start = Date.now();
  const result = await aggregateRates(payload);
  const end = Date.now();

  console.log(`✅ Aggregator completed in ${end - start}ms!`);
  console.log(`📊 Found ${result.couriers.length} successful courier rates.\n`);

  result.couriers.forEach((courier, idx) => {
    console.log(`${idx + 1}. [${courier.courier_name}] Rs ${courier.price_paise / 100} (ETA: ${courier.ai_eta_days} days) - COD: ${courier.cod_available ? 'Yes' : 'No'}`);
  });

  console.log('\n=============================================');
  console.log('🚀 Testing again with is_cod: TRUE');
  console.log('=============================================\n');

  payload.is_cod = true;
  const codResult = await aggregateRates(payload);
  
  console.log(`📊 Found ${codResult.couriers.length} COD-enabled courier rates.\n`);
  codResult.couriers.forEach((courier, idx) => {
    console.log(`${idx + 1}. [${courier.courier_name}] Rs ${courier.price_paise / 100} (ETA: ${courier.ai_eta_days} days) - COD FEE: Rs ${courier.cod_fee_paise / 100}`);
  });
}

testCourierEngine().catch(console.error);
