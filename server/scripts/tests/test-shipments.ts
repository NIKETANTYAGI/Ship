import { signTokens } from '../src/lib/jwt';
import pool from '../src/Database/db';
import axios from 'axios';

async function testShipments() {
    console.log('--- Testing Shipment APIs ---');
    try {
        // Create a test user directly in DB if not exists
        let userResult = await pool.query("SELECT * FROM users WHERE phone = '9999999999'");
        if (userResult.rows.length === 0) {
            userResult = await pool.query(
                "INSERT INTO users (phone, name, role) VALUES ('9999999999', 'Test User', 'USER') RETURNING *"
            );
        }
        const user = userResult.rows[0];
        
        // Ensure courier delhivery exists
        await pool.query("INSERT INTO couriers (name, code) VALUES ('Delhivery', 'delhivery') ON CONFLICT DO NOTHING");

        // Generate Auth Tokens
        const tokens = signTokens(user.id, user.phone || '9999999999', user.role);
        const headers = { Authorization: `Bearer ${tokens.accessToken}` };

        // Test 1: Create Draft Shipment
        console.log('1. Testing POST /api/shipments/create');
        const createRes = await axios.post('http://localhost:3001/shipments/create', {
            pickup_address: {
                full_address: "42 Lajpat Nagar Market",
                pincode: "110024",
                city: "New Delhi",
                state: "Delhi",
                name: "Rahul Sharma",
                phone: "9876543210"
            },
            delivery_address: {
                full_address: "Flat 204 Andheri West",
                pincode: "400053",
                city: "Mumbai",
                state: "Maharashtra",
                name: "Priya Kumar",
                phone: "9123456789"
            },
            courier_id: "delhivery",
            weight_grams: 1000,
            parcel_type: "parcel",
            is_cod: false
        }, { headers });

        console.log('Create Response:', createRes.data);
        const shipmentId = createRes.data.data.shipment_id;

        // Test 2: Get Shipment By ID
        console.log(`\n2. Testing GET /api/shipments/${shipmentId}`);
        const getRes = await axios.get(`http://localhost:3001/shipments/${shipmentId}`, { headers });
        console.log('Get Response:', getRes.data);

        // Test 3: Get User Shipments
        console.log('\\n3. Testing GET /api/users/shipments');
        const listRes = await axios.get('http://localhost:3001/users/shipments', { headers });
        console.log('List Response:', listRes.data);

        // Test 4: Search Shipments (by Courier name)
        console.log('\\n4. Testing GET /api/shipments/search?q=delhivery');
        const searchRes = await axios.get('http://localhost:3001/shipments/search?q=delhivery', { headers });
        console.log('Search Response:', searchRes.data);

        console.log('\\n✅ All shipment endpoints succeeded!');
    } catch (e: any) {
        if (e.response) {
            console.error('API Error:', e.response.data);
        } else {
            console.error('Error:', e);
        }
    } finally {
        pool.end();
    }
}

testShipments();
