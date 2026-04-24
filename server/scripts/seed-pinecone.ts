import axios from 'axios';

const EMBEDDER_URL = process.env.EMBEDDER_URL || 'http://localhost:5001/embed';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_URL = process.env.PINECONE_URL;

// High-quality test addresses simulating Indian geography
const SEED_DATA = [
  { full_address: 'Gateway of India, Apollo Bandar, Colaba, Mumbai', pincode: '400001', city: 'Mumbai', state: 'Maharashtra', landmark: 'Gateway of India' },
  { full_address: 'India Gate, Rajpath, New Delhi', pincode: '110001', city: 'New Delhi', state: 'Delhi', landmark: 'India Gate' },
  { full_address: 'Red Fort, Netaji Subhash Marg, Chandni Chowk, New Delhi', pincode: '110006', city: 'New Delhi', state: 'Delhi', landmark: 'Red Fort' },
  { full_address: 'Taj Mahal, Dharmapuri, Forest Colony, Tajganj, Agra', pincode: '282001', city: 'Agra', state: 'Uttar Pradesh', landmark: 'Taj Mahal' },
  { full_address: 'UB City, Vittal Mallya Road, Bengaluru', pincode: '560001', city: 'Bengaluru', state: 'Karnataka', landmark: 'UB City' },
  { full_address: 'Lotus Temple, Shambhu Dayal Bagh, Kalkaji, New Delhi', pincode: '110019', city: 'New Delhi', state: 'Delhi', landmark: 'Lotus Temple' },
  { full_address: 'Victoria Memorial, Queen\'s Way, Kolkata', pincode: '700071', city: 'Kolkata', state: 'West Bengal', landmark: 'Victoria Memorial' },
  { full_address: 'Hawa Mahal, Badi Choupad, J.D.A. Market, Jaipur', pincode: '302002', city: 'Jaipur', state: 'Rajasthan', landmark: 'Hawa Mahal' },
  { full_address: 'Charminar, Charminar Rd, Char Kaman, Ghansi Bazaar, Hyderabad', pincode: '500002', city: 'Hyderabad', state: 'Telangana', landmark: 'Charminar' },
  { full_address: 'Bandra-Worli Sea Link, Mount Mary, Bandra West, Mumbai', pincode: '400050', city: 'Mumbai', state: 'Maharashtra', landmark: 'Sea Link' }
];

async function generateVector(text: string): Promise<number[]> {
  const response = await axios.post(EMBEDDER_URL, { text });
  return response.data.vector;
}

async function seedPinecone() {
  console.log('🚀 Initiating Pinecone Seeding Process...');

  if (!PINECONE_API_KEY || !PINECONE_URL) {
    console.warn('\n⚠️  WARNING: PINECONE_API_KEY or PINECONE_URL not set in .env.');
    console.log('We will generate embeddings via Python to verify the ML service is working, but we will skip the final upload to Pinecone DB.\n');
  }

  const vectorsToUpsert = [];

  for (let i = 0; i < SEED_DATA.length; i++) {
    const item = SEED_DATA[i];
    
    // Create a rich text string for the ML model to understand semantic meaning
    const embedText = `${item.landmark} in ${item.city}, ${item.state}. Address: ${item.full_address}. Pincode: ${item.pincode}`;
    
    console.log(`[${i+1}/${SEED_DATA.length}] Generating Dense Vector for: "${item.landmark}"...`);
    
    try {
      const vector = await generateVector(embedText);
      console.log(`    ↳ Success: Got ${vector.length}-dimensional vector.`);
      
      vectorsToUpsert.push({
        id: `loc_${i}`,
        values: vector,
        metadata: {
          ...item
        }
      });
    } catch (e: any) {
      console.error(`    ↳ ❌ Failed to generate vector:`, e.message);
      console.error('Make sure the Python Embedder Service is running on port 5001.');
      process.exit(1);
    }
  }

  if (PINECONE_API_KEY && PINECONE_URL) {
    console.log(`\n☁️  Upserting ${vectorsToUpsert.length} vectors to Pinecone...`);
    
    try {
      await axios.post(
        `${PINECONE_URL}/vectors/upsert`,
        { vectors: vectorsToUpsert },
        { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
      );
      console.log('✅ Successfully seeded Pinecone Database!');
    } catch (e: any) {
      console.error('❌ Failed to upsert to Pinecone:', e.response?.data || e.message);
    }
  } else {
    console.log('\n✅ Local ML generation verified. Skipped cloud upload due to missing keys.');
  }
}

seedPinecone().catch(console.error);
