# P2P Shipping Platform Deployment Guide

Deploying your platform for free and testing it with real data (no mocks) requires replacing local dependencies with free-tier cloud services.

## 1. The "100% Free" Cloud Infrastructure Setup

To replace your local Docker containers for free, you need to set up the following services. Sign up for these and gather your connection strings:

| Service Needed | Free Cloud Provider | Keys / URLs to Copy |
| :--- | :--- | :--- |
| **PostgreSQL** | **Supabase** or **Neon** | `DATABASE_URL` |
| **MongoDB** | **MongoDB Atlas** (M0 Cluster) | `MONGODB_URL` |
| **Redis** | **Upstash** | `REDIS_URL` |
| **Kafka** | **Upstash** (Serverless Kafka) | `KAFKA_BROKERS`, `KAFKA_SASL_USERNAME`, `KAFKA_SASL_PASSWORD` |
| **File Storage** | **Cloudflare R2** (Replaces MinIO/S3) | `AWS_REGION` (auto), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_ENDPOINT` |
| **Python AI App** | **Hugging Face Spaces** | `EMBEDDER_URL` |

## 2. External Service API Keys (For "Real Data" Testing)

Since you are turning off mock mode (`VITE_USE_MOCK=false`) and potentially bypassing `STRICT_FREE_MODE`, you need accounts for your 3rd party providers:

*   **Razorpay (Payments):** Free to test. You need `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and a `RAZORPAY_WEBHOOK_SECRET`.
*   **SendGrid (Emails):** Has a free tier (100 emails/day). You need `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.
*   **Firebase (Push Notifications):** Free. You need the `FIREBASE_PROJECT_ID` and the `firebase-service-account.json`. *(Note: For deployment, you will eventually base64 encode this JSON into a single environment variable).*
*   **Pinecone (Vector DB):** Has a free tier. You need `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`.
*   **Delhivery (Logistics):** You need `DELHIVERY_API_KEY` and point the `DELHIVERY_BASE_URL` to staging (`https://staging-express.delhivery.com`).

> **A Note on SMS and WhatsApp:** Services like **MSG91** and **Gupshup** rarely have usable free tiers without paying for credits. If you want the deployment to be strictly $0, keep `STRICT_FREE_MODE=true` on the backend so those specific calls get bypassed.

---

## 3. The Deployment Process

### Phase A: Prepare your Codebase
1. **Push to GitHub**: Make sure your entire project `server` and `client` are pushed to a single GitHub Repository.
2. **Update Service Account Logic**: Stringify the `firebase-service-account.json` and pass it as an environment variable in production.

### Phase B: Deploy the Backend on Render
1. Go to **Render.com** (Free Tier) and create a new **"Web Service"**.
2. Connect your GitHub repository.
3. **Build settings**:
   * **Root Directory**: `server`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
4. **Environment Variables**: Paste EVERY key you gathered into Render's Environment Variables section.
5. Deploy. Once successful, copy the Render URL (e.g., `https://swiftroute-api.onrender.com`).

### Phase C: Deploy the Frontend on Netlify
1. Go to **Netlify.com**, log in, and click **Add New Site** -> **Import an existing project**.
2. Connect to your GitHub account and authorize access.
3. Select your `p2p-shipping` repository.
4. **Site settings for Netlify**:
   * **Base directory**: `client`
   * **Build command**: `npm run build`
   * **Publish directory**: `dist`
5. Open **Advanced build settings** to add your Environment Variables:
   * `VITE_API_URL`: `[YOUR_RENDER_URL_FROM_PHASE_B]`
   * `VITE_ENV`: `production`
   * `VITE_USE_MOCK`: `false`
6. Click **Deploy Site**. Netlify will automatically build and publish your SPA!
