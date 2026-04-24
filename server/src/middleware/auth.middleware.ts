import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to carry decoded user info
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        phone: string;
        role: string;
    };
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    // ── Check header present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authorization header missing or malformed' },
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    // ── Verify JWT signature
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
            userId: string;
            phone: string;
            role: string;
        };

        // Attach user to request — available in all downstream controllers
        req.user = {
            userId: decoded.userId,
            phone: decoded.phone,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired. Please refresh.' },
            });
            return;
        }

        res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid access token' },
        });
    }
};
