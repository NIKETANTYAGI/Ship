import { Router } from 'express';
import { getWalletBalance, addFunds, getTransactions, withdrawFunds } from '../controllers/wallet.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/balance', getWalletBalance);
router.post('/add', addFunds);
router.get('/transactions', getTransactions);
router.post('/withdraw', withdrawFunds);

export default router;
