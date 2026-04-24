import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../Database/db';
import { createRazorpayOrder } from '../../../lib/razorpay';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export const getWalletBalance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const { rows } = await db.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'AUTH_007', message: 'User not found' } });
    }

    const balancePaise = rows[0].wallet_balance || 0;
    const balanceDisplay = `Rs ${(balancePaise / 100).toFixed(2)}`;

    return res.status(200).json({
      success: true,
      data: {
        balance_paise: balancePaise,
        balance_display: balanceDisplay,
      }
    });
  } catch (error) {
    console.error('getWalletBalance error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};

export const addFunds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount_paise } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    if (!amount_paise || typeof amount_paise !== 'number' || amount_paise < 1000) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_003', message: 'Amount must be at least Rs 10' } });
    }

    const amountRupees = amount_paise / 100;
    const transactionId = uuidv4();

    const order = await createRazorpayOrder(amountRupees, 'INR', transactionId);

    await db.query(
      `INSERT INTO wallet_transactions (id, user_id, amount_paise, type, description, status) 
       VALUES ($1, $2, $3, 'credit', 'Wallet Top-Up via Razorpay', 'pending')`,
      [transactionId, userId, amount_paise]
    );

    return res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        amount_paise,
        razorpay_key: process.env.RAZORPAY_KEY_ID || 'test_key',
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('addFunds error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const offset = (page - 1) * limit;

    const { rows: txs } = await db.query(
      `SELECT id as transaction_id, type, amount_paise, description, balance_after_paise, created_at 
       FROM wallet_transactions 
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );

    const total = parseInt(countRows[0].total);

    return res.status(200).json({
      success: true,
      data: {
        transactions: txs,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};

export const withdrawFunds = async (req: AuthenticatedRequest, res: Response) => {
  const client = await db.connect();
  try {
    const userId = req.user?.userId;
    const { amount_paise, bank_account_number, ifsc_code, account_holder_name } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    if (!amount_paise || amount_paise < 10000) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_003', message: 'Minimum withdrawal is Rs 100' } });
    }

    if (!bank_account_number || !ifsc_code || !account_holder_name) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing bank details' } });
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'AUTH_007', message: 'User not found' } });
    }

    const currentBalance = rows[0].wallet_balance || 0;
    if (currentBalance < amount_paise) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: { code: 'PAYMENT_009', message: 'Insufficient wallet balance' } });
    }

    const newBalance = currentBalance - amount_paise;

    await client.query(
      'UPDATE users SET wallet_balance = $1 WHERE id = $2',
      [newBalance, userId]
    );

    const withdrawalId = uuidv4();
    await client.query(
      `INSERT INTO wallet_transactions (id, user_id, amount_paise, type, description, balance_after_paise, status)
       VALUES ($1, $2, $3, 'debit', 'Withdrawal to Bank Account', $4, 'completed')`,
      [withdrawalId, userId, amount_paise, newBalance]
    );

    await client.query('COMMIT');

    const maskedBank = 'XXXX' + bank_account_number.slice(-4);

    return res.status(200).json({
      success: true,
      data: {
        withdrawal_id: withdrawalId,
        amount_paise,
        bank_account: maskedBank,
        estimated_credit: '1-3 business days',
        status: 'processing'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('withdrawFunds error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  } finally {
    client.release();
  }
};
