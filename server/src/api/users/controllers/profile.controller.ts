import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
        });
    }

    const result = await pool.query(
        `SELECT id, name, email, phone, role, kyc_status, wallet_balance, referral_code, created_at
        FROM users WHERE id = $1`,
        [userId]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            user_id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            kyc_status: user.kyc_status,
            wallet_balance: user.wallet_balance,
            referral_code: user.referral_code,
            created_at: user.created_at,
        }
    });
});
