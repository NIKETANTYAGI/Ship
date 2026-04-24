import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyShiprocket() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  console.log(`🚀 Verifying Shiprocket for: ${email}...`);

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email,
      password,
    });

    if (response.data.token) {
      console.log('✅ Success! Credentials are valid.');
      console.log('Token generated successfully.');
    } else {
      console.log('❌ Failed: No token returned.');
    }
  } catch (error: any) {
    console.error('❌ Verification Failed!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
  } finally {
    process.exit(0);
  }
}

verifyShiprocket();
