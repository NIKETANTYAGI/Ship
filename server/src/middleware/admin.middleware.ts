import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware to restrict route access solely to ADMIN role accounts.
 * Must be mounted AFTER authMiddleware.
 */
export const adminMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    // Ensure the request has passed authMiddleware
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
        return;
    }

    // Check Role
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Access Denied: Requires Administrator Privileges'
            },
        });
        return;
    }

    // Role authorized, proceed to controller
    next();
};
