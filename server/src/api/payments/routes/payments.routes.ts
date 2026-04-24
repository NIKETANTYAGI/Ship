import { Router } from 'express';
import { initiatePayment, paymentWebhook, applyPromo } from '../controllers/payments.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { validatePromoCode } from '../controllers/promo.controller';

const router = Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/apply-promo', authMiddleware, applyPromo);
router.post('/promo/validate', authMiddleware, validatePromoCode);

// Webhooks don't have authMiddleware, they authenticate via signature
// Ensure body parsing is raw/string if signature verification requires it,
// though in standard setups, verify_razorpay accepts JSON.stringified payload, 
// usually it is better to use express.raw for webhooks in index.ts
router.post('/webhook', paymentWebhook);

export default router;
