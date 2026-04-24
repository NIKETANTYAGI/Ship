import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { adminMiddleware } from '../../../middleware/admin.middleware';
import { getRevenueDashboard, downloadRevenueReport } from '../controllers/revenue.controller';
import { getCourierConfigurations, updateCourierConfiguration } from '../controllers/config.controller';
import { reportActualWeight } from '../controllers/weight-audit.controller';
import { generateManifest } from '../../../lib/pdf-generator';
import { sendSuccess, sendError } from '../../shared/types';
import { asyncHandler } from '../../../middleware/asyncHandler';

const router = Router();

// Secure all admin routes natively
router.use(authMiddleware);
router.use(adminMiddleware);

// Revenue Dashboard Endpoints
router.get('/revenue/dashboard', getRevenueDashboard);
router.get('/revenue/report/pdf', downloadRevenueReport);

// Global Courier Orchestration
router.get('/couriers', getCourierConfigurations);
router.patch('/couriers/:id', updateCourierConfiguration);

// Weight Dispute Automation
router.post('/shipments/weight-audit', reportActualWeight);

/**
 * Bulk Generate Courier Handover Manifest
 */
router.post('/shipments/manifest', asyncHandler(async (req, res) => {
    const { shipmentIds, courierId } = req.body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || !courierId) {
        return sendError(res, 'BAD_REQUEST', 'shipmentIds[] and courierId are required', 400);
    }

    const manifestKey = await generateManifest(shipmentIds, courierId);

    if (!manifestKey) {
        return sendError(res, 'GEN_ERR', 'Failed to generate manifest', 500);
    }

    return sendSuccess(res, {
        manifest_url: manifestKey,
        message: 'Manifest generated and stored in Evidence Vault'
    });
}));

export default router;
