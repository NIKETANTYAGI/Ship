import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { signTokens } from '../../../lib/jwt';

const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const firebaseVerify = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_008', message: 'Firebase ID Token is required' },
    });
    return;
  }

  try {
    // 1. Verify the Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { code: 'AUTH_009', message: 'Email not found in Firebase token' },
      });
      return;
    }

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
          payload: { name: decodedToken.name || 'User' }
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
    console.error('❌ Firebase Token Verification Failed:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_010',
        message: error.code === 'auth/id-token-expired' ? 'Token expired' : 'Invalid Firebase token' 
      },
    });
  }
};
