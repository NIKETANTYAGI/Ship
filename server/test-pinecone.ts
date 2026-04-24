import { searchAddresses } from './src/lib/pinecone';
import redisClient from './src/Database/redis';

async function test() {
  const result = await searchAddresses('India Gate Delhi');
  console.log(result);

  if (redisClient.status === 'ready') {
    await redisClient.quit();
  } else {
    process.exit(0);
  }
}

test();
