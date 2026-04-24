import { Router } from 'express';
import { getTrackingEvents } from '../controllers/tracking.controller';
import { handleDelhiveryWebhook, handleDtdcWebhook } from '../../../lib/tracking-webhooks';
import { authMiddleware } from '../../../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Used for fetching tracking
router.get('/:awb', authMiddleware, getTrackingEvents);

// Depending on the signature verification, webhooks might need raw body parsing
// but the current implementation in tracking-webhooks.ts accepts JSON directly
router.post('/webhooks/delhivery', handleDelhiveryWebhook);
router.post('/webhooks/dtdc', handleDtdcWebhook);

export default router;
