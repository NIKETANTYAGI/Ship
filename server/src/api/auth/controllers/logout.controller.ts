import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import redis from '../../../Database/redis';

const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;

/**
 * Log out user by revoking refresh token from Redis
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User identifier not found in request' },
            });
            return;
        }

        // ── Revoke token from Redis
        await redis.del(REFRESH_TOKEN_KEY(userId));

        res.status(200).json({
            success: true,
            data: { message: 'Successfully logged out and session revoked' },
        });
    } catch (error) {
        console.error('❌ Logout Failed:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Could not complete logout' },
        });
    }
};
