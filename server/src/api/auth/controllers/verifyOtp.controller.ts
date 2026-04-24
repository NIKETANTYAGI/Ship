import { Request, Response } from 'express';
import redis from '../../../Database/redis';
import pool from '../../../Database/db';
import { signTokens } from '../../../lib/jwt';

const OTP_KEY = (email: string) => `otp:${email}`;
const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    // Validate input
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Invalid email address' },
        });
        return;
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        res.status(400).json({
            success: false,
            error: { code: 'AUTH_002', message: 'OTP must be 6 digits' },
        });
        return;
    }

    // ── Look up OTP from Redis
    const storedOtp = await redis.get(OTP_KEY(email));

    if (!storedOtp || storedOtp !== otp) {
        res.status(401).json({
            success: false,
            error: { code: 'AUTH_003', message: 'Invalid or expired OTP' },
        });
        return;
    }

    // ── Delete OTP immediately — one-time use
    await redis.del(OTP_KEY(email));

    // ── Find or create user in DB (raw pg)
    let isNewUser = false;

    const findResult = await pool.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [email]
    );
    let user = findResult.rows[0];

    if (!user) {
        isNewUser = true;
        const insertResult = await pool.query(
            `INSERT INTO users (email, role, kyc_status, wallet_balance, created_at)
             VALUES ($1, 'USER', 'PENDING', 0, NOW())
             RETURNING id, email, role`,
            [email]
        );
        user = insertResult.rows[0];

        // ── Emit Welcome Event for New Users (Internal notification)
        try {
            const { emitEvent, TOPICS } = await import('../../../lib/kafka');
            await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
                user_id: user.id,
                event_type: 'WELCOME_USER',
                channels: ['EMAIL'],
                payload: {
                    name: 'User',
                }
            });
        } catch (err: any) {
            console.error('⚠️ Welcome event failed (Kafka likely disabled):', err.message);
        }
    }

    // ── Sign JWT tokens
    const { accessToken, refreshToken } = signTokens(user.id, user.email, user.role);

    // ── Store Refresh Token in Redis for Revocation (7 Days)
    await redis.set(REFRESH_TOKEN_KEY(user.id), refreshToken, 'EX', REFRESH_TOKEN_EXPIRY_SECONDS);

    // ── Success response
    res.status(200).json({
        success: true,
        data: {
            user_id: user.id,
            is_new_user: isNewUser,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
        },
    });
};
