import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp up to 50 users
    { duration: '1m', target: 500 }, // stay at 500 users for 1 min
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must be below 200ms
  },
};

export default function () {
  const url = 'http://localhost/api/shipments/create';
  const payload = JSON.stringify({
    pickup_address: {
      name: 'Test Sender',
      phone: '9876543210',
      pincode: '110001',
      city: 'Delhi',
      state: 'Delhi',
      full_address: '123 Test St, Connaught Place'
    },
    delivery_address: {
      name: 'Test Receiver',
      phone: '9876543211',
      pincode: '400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      full_address: '456 Test Ave, Colaba'
    },
    courier_id: 'delhivery',
    weight_grams: 500,
    parcel_type: 'parcel'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TEST_JWT_TOKEN' // Replace with a valid token for actual load testing
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
