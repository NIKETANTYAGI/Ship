import { searchAddresses } from '../src/lib/pinecone';

async function testAddressDetection() {
  console.log('🚀 Testing AI Vector Natural Language Search...\n');

  const queries = [
    "I am located near the big arch monument in Mumbai.",
    "Deliver to the war memorial in New Delhi",
    "Near standard mock default road."
  ];

  for (const query of queries) {
    console.log(`=============================================`);
    console.log(`🔍 User Input Query: "${query}"`);
    console.log(`=============================================`);
    
    const start = Date.now();
    const results = await searchAddresses(query, 3);
    const end = Date.now();

    console.log(`⏱️  Resolved in ${end - start}ms! Top matches:` );
    
    results.forEach((match, idx) => {
      console.log(`  ${idx + 1}. [Score: ${match.score.toFixed(3)}] ${match.landmark} (${match.pincode})`);
      console.log(`     Address: ${match.full_address}`);
    });
    console.log('\n');
  }
}

testAddressDetection().catch(console.error);
