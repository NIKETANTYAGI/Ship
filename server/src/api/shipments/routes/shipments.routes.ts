import { Router } from 'express';
import { createShipment, getShipmentById, searchShipments, getUserShipments, confirmDelivery, bulkCreateShipments } from '../controllers/shipments.controller';
import { downloadLabel } from '../controllers/labels.controller';
import { initiateReturn, cancelShipment } from '../controllers/returns.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// Base mounted at /api/shipments or similar in index
router.post('/create', authMiddleware, createShipment);
router.post('/bulk-book', authMiddleware, bulkCreateShipments);
router.get('/search', authMiddleware, searchShipments);
router.get('/', authMiddleware, getUserShipments);
router.get('/:id', authMiddleware, getShipmentById);
router.post('/:id/confirm-delivery', authMiddleware, confirmDelivery);
router.post('/return', authMiddleware, initiateReturn);
router.post('/:id/cancel', authMiddleware, cancelShipment);
router.get('/:id/label', authMiddleware, downloadLabel);

export default router;
