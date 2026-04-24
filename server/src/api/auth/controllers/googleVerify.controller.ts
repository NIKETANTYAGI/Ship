import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { signTokens } from '../../../lib/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const googleVerify = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_008', message: 'Google ID Token is required' },
    });
    return;
  }

  try {
    // 1. Verify the Google Token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400).json({
        success: false,
        error: { code: 'AUTH_009', message: 'Invalid Google token payload' },
      });
      return;
    }

    const email = payload.email;

    // 2. Find or create user in DB
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

      // Emit Welcome Event
      try {
        const { emitEvent, TOPICS } = await import('../../../lib/kafka');
        await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
          user_id: user.id,
          event_type: 'WELCOME_USER',
          channels: ['EMAIL'],
          payload: { name: payload.name || 'User' }
        });
      } catch (kafkaErr: any) {
        console.warn('⚠️ Kafka Event skipped:', kafkaErr.message);
      }
    }

    // 3. Sign app JWT tokens
    const { accessToken, refreshToken } = signTokens(user.id, user.email, user.role);

    // 4. Store Refresh Token in Redis
    await redis.set(REFRESH_TOKEN_KEY(user.id), refreshToken, 'EX', REFRESH_TOKEN_EXPIRY_SECONDS);

    // 5. Success response
    res.status(200).json({
      success: true,
      data: {
        user_id: user.id,
        is_new_user: isNewUser,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
    });

  } catch (error: any) {
    console.error('❌ Google Token Verification Failed:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_010',
        message: 'Invalid Google token' 
      },
    });
  }
};
