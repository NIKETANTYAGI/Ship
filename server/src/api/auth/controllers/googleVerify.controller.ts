import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from '../../../Database/db';
import redis from '../../../Database/redis';
import { signTokens } from '../../../lib/jwt';

// Lazy init so dotenv has time to load before we read env vars
let _client: OAuth2Client | null = null;
const getOAuthClient = () => {
  if (!_client) _client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return _client;
};

const REFRESH_TOKEN_KEY = (userId: string) => `refresh_token:${userId}`;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

const IS_DEV = process.env.NODE_ENV !== 'production';
const HAS_GOOGLE_CLIENT_ID = !!process.env.GOOGLE_CLIENT_ID;

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
    let email: string;
    let name: string | undefined;

    // ── DEV MOCK MODE ──────────────────────────────────────────────────────
    // If GOOGLE_CLIENT_ID is not configured and we're in development,
    // accept a plain email string as the "idToken" for easy local testing.
    // Usage: POST /auth/google-verify { "idToken": "dev@example.com" }
    if (!HAS_GOOGLE_CLIENT_ID && IS_DEV) {
      console.warn(
        '⚠️  [GoogleVerify] GOOGLE_CLIENT_ID not set — running in DEV MOCK MODE. ' +
        'Treating idToken as raw email. DO NOT use in production.'
      );

      if (!idToken.includes('@')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_008',
            message: 'DEV MOCK: idToken must be a valid email address when GOOGLE_CLIENT_ID is not set.',
          },
        });
        return;
      }

      email = idToken.toLowerCase().trim();
      name = email.split('@')[0];

    } else {
      // ── PRODUCTION: Verify real Google ID Token ─────────────────────────
      const ticket = await getOAuthClient().verifyIdToken({
        idToken,
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

      email = payload.email;
      name = payload.name;
    }

    // ── Find or create user ──────────────────────────────────────────────
    let isNewUser = false;
    const findResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );
    let user = findResult.rows[0];

    if (!user) {
      isNewUser = true;
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, role, kyc_status, wallet_balance, created_at)
         VALUES ($1, $2, 'USER', 'PENDING', 0, NOW())
         RETURNING id, name, email, role`,
        [name || email, email]
      );
      user = insertResult.rows[0];

      // Emit Welcome Event (fire-and-forget, safe to fail)
      try {
        const { emitEvent, TOPICS } = await import('../../../lib/kafka');
        await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
          user_id: user.id,
          event_type: 'WELCOME_USER',
          channels: ['EMAIL'],
          payload: { name: user.name || 'User' },
        });
      } catch (kafkaErr: any) {
        console.warn('⚠️ Kafka Event skipped:', kafkaErr.message);
      }
    }

    // ── Sign JWT tokens (uses JWT_ACCESS_SECRET / JWT_REFRESH_SECRET) ────
    const { accessToken, refreshToken } = signTokens(user.id, user.email, user.role);

    // ── Store Refresh Token in Redis ─────────────────────────────────────
    await redis.set(REFRESH_TOKEN_KEY(user.id), refreshToken, 'EX', REFRESH_TOKEN_EXPIRY_SECONDS);

    // ── Success ──────────────────────────────────────────────────────────
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
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Google Token Verification Failed:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_010',
        message: 'Invalid Google token',
      },
    });
  }
};
