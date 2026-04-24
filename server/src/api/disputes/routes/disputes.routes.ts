import { Router } from 'express';
import { raiseDispute, getDisputeStatus } from '../controllers/disputes.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', raiseDispute);
router.get('/:dispute_id', getDisputeStatus);

export default router;
