import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import pool from '../../../Database/db';

export const searchAddress = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: { code: 'ADDR_001', message: 'Search query must be at least 2 characters' }
        });
    }
    const result = await pool.query(
        `SELECT id, name, area, city, state, pincode, landmark_type
         FROM landmarks
         WHERE name ILIKE $1
            OR area ILIKE $1
            OR city ILIKE $1
         ORDER BY name ASC
         LIMIT 10`,
        [`%${query.trim()}%`]
    );

    return res.status(200).json({
        success: true,
        data: {
            query,
            results: result.rows
        }
    });
});
