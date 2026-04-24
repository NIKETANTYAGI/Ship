import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback';

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generates both Access and Refresh tokens
 */
export const signTokens = (userId: string, phone: string, role: string) => {
    const accessToken = jwt.sign(
        { userId, phone, role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { userId },
        REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};

/**
 * Verifies a JWT token based on the specified type
 */
export const verifyToken = (token: string, type: 'access' | 'refresh') => {
    const secret = type === 'access' ? ACCESS_SECRET : REFRESH_SECRET;
    try {
        return jwt.verify(token, secret) as any;
    } catch (error) {
        return null;
    }
};
