import { Router } from 'express';
import { getCourierRates } from '../controllers/couriers.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /couriers/rates:
 *   get:
 *     summary: Get shipping rates from all available couriers
 *     tags: [Logistics]
 *     parameters:
 *       - in: query
 *         name: pickup
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: delivery
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: weight
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/rates', authMiddleware, getCourierRates);

export default router;
