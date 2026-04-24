import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redis from './Database/redis';
import authRouter from './api/auth/routes/auth.routes';
import usersRouter,{addressRouter} from './api/users/routes/users.routes';
import shipmentsRouter from './api/shipments/routes/shipments.routes';
import paymentsRouter from './api/payments/routes/payments.routes';
import trackingRouter from './api/tracking/routes/tracking.routes';
import walletRouter from './api/wallet/routes/wallet.routes';
import disputesRouter from './api/disputes/routes/disputes.routes';
import adminRouter from './api/admin/routes/admin.routes';
import couriersRouter from './api/couriers/routes/couriers.routes';
import { startWorkers, stopWorkers } from './lib/workers';
import { startNotificationConsumer } from './lib/notification-consumer';
import { startReconciliationSchedules } from './lib/queues';
import { checkPincode } from './api/users/controllers/pincode.controller';
import { connectMongoDB } from './lib/mongo';
import { sendSlackAlert } from './lib/slack';
import { setupSwagger } from './lib/swagger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Base Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: false, // Disable CSP for now to ensure all integrations work
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://brilliant-kelpie-443f32.netlify.app',
      'http://localhost:5173'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin + '/')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger Documentation
setupSwagger(app);

app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/address', addressRouter);
app.use('/shipments', shipmentsRouter);
app.use('/payments', paymentsRouter);
app.use('/tracking', trackingRouter);
app.use('/wallet', walletRouter);
app.use('/disputes', disputesRouter);
app.use('/admin', adminRouter);
app.use('/couriers', couriersRouter);
app.get('/pincodes/check', checkPincode);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // 1. Check Redis
    await redis.ping();

    // 2. Check PostgreSQL
    const { default: pool } = await import('./Database/db');
    await pool.query('SELECT 1');

    // 3. Queue health (if workers are enabled)
    let queueHealth = {};
    if (process.env.ENABLE_WORKERS === 'true') {
      const { getQueueHealth } = await import('./lib/queues');
      queueHealth = await getQueueHealth();
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
      integrations: {
        razorpay: !!process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing_keys',
        msg91: !!process.env.MSG91_API_KEY ? 'configured' : 'missing_keys',
        workers: process.env.ENABLE_WORKERS === 'true' ? 'running' : 'disabled',
        kafka_consumer: process.env.ENABLE_KAFKA_CONSUMER === 'true' ? 'running' : 'disabled',
      },
      queues: queueHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`💥 Error: ${err.message}`);
    
    // Alert internal team for 500s or critical issues
    sendSlackAlert(`[500 Error] ${req.method} ${req.url}\nError: ${err.message}`, 'CRITICAL');

    res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERR', message: 'An unexpected error occurred' }
    });
});

import { createServer } from 'http';
import { initSocket } from './lib/socket';

// Start Server
const httpServer = createServer(app);
initSocket(httpServer);

const server = httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Connect MongoDB
  await connectMongoDB();

  // Start BullMQ Workers
  startWorkers();

  // Schedule Financial Reconciliation (Phase 5)
  if (process.env.ENABLE_WORKERS === 'true') {
     await startReconciliationSchedules();
  }

  // Start Kafka Notification Consumer
  await startNotificationConsumer();
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM received — shutting down gracefully...');
  await stopWorkers();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});


