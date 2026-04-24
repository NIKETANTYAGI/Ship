import { Request, Response } from 'express';
import redis from '../../../Database/redis';
import pool from '../../../Database/db';
import { verifyToken, signTokens } from '../../../lib/jwt';

const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_004', message: 'Refresh token is required' },
        });
        return;
    }

    // 1. Verify token signature against REFRESH_SECRET
    const decoded = verifyToken(refresh_token, 'refresh');

    if (!decoded || !decoded.userId) {
        res.status(401).json({
            success: false,
            error: { code: 'AUTH_005', message: 'Invalid or expired refresh token' },
        });
        return;
    }

    // 2. Check if token exists in Redis (Revocation check)
    const storedToken = await redis.get(REFRESH_TOKEN_KEY(decoded.userId));

    if (!storedToken || storedToken !== refresh_token) {
        res.status(401).json({
            success: false,
            error: { code: 'AUTH_006', message: 'Token has been revoked or is inactive' },
        });
        return;
    }

    // 3. Fetch user and issue NEW tokens (Rotation)
    try {
        const findResult = await pool.query(
            'SELECT id, phone, role FROM users WHERE id = $1',
            [decoded.userId]
        );
        const user = findResult.rows[0];

        if (!user) {
            res.status(404).json({
                success: false,
                error: { code: 'AUTH_007', message: 'User no longer exists' },
            });
            return;
        }

        // Generate new pair
        const tokens = signTokens(user.id, user.phone, user.role);

        // Update Redis with NEW refresh token
        await redis.set(REFRESH_TOKEN_KEY(user.id), tokens.refreshToken, 'EX', 7 * 24 * 60 * 60);

        res.status(200).json({
            success: true,
            data: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expires_in: 900 // 15 minutes
            }
        });
    } catch (error) {
        console.error('❌ Token Rotation Failed:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Could not rotate tokens' }
        });
    }
};
