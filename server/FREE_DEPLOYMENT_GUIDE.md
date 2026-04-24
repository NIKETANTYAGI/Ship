# 🌍 Zero-Cost Deployment Guide (No Credit Card Required)

This guide shows you how to host the entire SwiftRoute stack for **$0/month** without ever entering a credit card. We will use a "Modular" architecture, where each service is hosted on a specialized free provider.

---

## 🏗️ The Infrastructure Stack

| Component | Provider | Setup Time |
| :--- | :--- | :--- |
| **PostgreSQL** | [Supabase](https://supabase.com) | 2 mins |
| **Node.js API** | [Render](https://render.com) | 5 mins |
| **Python AI** | [Hugging Face](https://huggingface.co) | 5 mins |
| **Redis & Kafka** | [Upstash](https://upstash.com) | 3 mins |
| **MongoDB** | [MongoDB Atlas](https://mongodb.com/atlas) | 5 mins |

---

## 🛠️ Step 1: Database Setup (Supabase)
1.  Sign up for **Supabase** (No card required).
2.  Create a "New Project".
3.  Go to **Settings -> Database** and copy the **Connection String** (URI).
4.  It will look like: `postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres`
5.  **Run SQL**: Go to the "SQL Editor" in Supabase and paste the contents of `server/database/schema.sql` to create your tables.

---

## 🐍 Step 2: AI ML Service (Hugging Face)
1.  Sign up for **Hugging Face**.
2.  Go to **Spaces -> Create New Space**.
3.  **Name**: `swiftroute-ai-embedder`
4.  **SDK**: Select **Docker**.
5.  **License**: `MIT`
6.  Upload the files from `server/src/integrations/vectors/` (Dockerfile, embedder.py, requirements.txt).
7.  Hugging Face will automatically build and give you a URL like `https://user-space.hf.space`. 
    *   *Note: Add `/embed` to the end of this URL for your env variable.*

---

## 📦 Step 3: Redis & Kafka (Upstash)
1.  Sign up for **Upstash**.
2.  **Redis**: Create a "Global" database. Copy the `REDIS_URL`.
3.  **Kafka**: Create a "Cluster". Go to the "Topics" tab and manually create the topics from the README (`shipment.status.updated`, etc.).
4.  Copy the connection details (Endpoint, Username, Password).

---

## 🚀 Step 4: The Main API (Render)
1.  Sign up for **Render**.
2.  **New -> Web Service**.
3.  Connect your GitHub repository.
4.  **Build Command**: `cd server && npm install && npm run build`
5.  **Start Command**: `cd server && npm start`
6.  **Advanced -> Environment Variables**:
    - Paste all the values from your `.env` (Supabase URL, Upstash Redis, Hugging Face URL, etc.).
    - Set `NODE_ENV=production`.
    - Set `STRICT_FREE_MODE=true`.

---

## ⚠️ Important Limitations
- **Cold Starts**: On Render's free tier, your server "sleeps" after 15 mins of inactivity. The first request after a break might take 30 seconds to respond.
- **Supabase Pausing**: If you don't use your database for a week, Supabase might pause it. You just need to click "Resume" in their dashboard.
- **ML Latency**: Hosting AI on a separate free server (Hugging Face) adds a small delay to address searches.

---

## 🛠️ Connectivity Check
Once everything is deployed, visit your Render URL: `https://your-app.onrender.com/health`. 
- If everything shows "connected", you are officially live for **$0/month**!
