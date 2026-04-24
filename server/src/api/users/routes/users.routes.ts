import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/userAddress.controller';
import { searchAddress } from '../controllers/address.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { getUserShipments } from '../../shipments/controllers/shipments.controller';
import { initiateKyc, verifyKyc } from '../controllers/kyc.controller';

const router = Router();

// ── Profile 
router.get('/profile', authMiddleware, getProfile);

// ── KYC Routes
router.post('/kyc/initiate', authMiddleware, initiateKyc);
router.post('/kyc/verify', authMiddleware, verifyKyc);

// ── Saved Addresses (CRUD)
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:id', authMiddleware, updateAddress);
router.delete('/addresses/:id', authMiddleware, deleteAddress);

// ── Shipments
router.get('/shipments', authMiddleware, getUserShipments);

export default router;

// ── Address Search (exported separately for /address router) ──
export const addressRouter = Router();
addressRouter.post('/search', authMiddleware, searchAddress);

