import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';

export const getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    const result = await pool.query(
        `SELECT id, label, name, phone, flat, area, city, state, pincode, country, is_default
         FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
        [userId]
    );

    return res.status(200).json({
        success: true,
        data: { addresses: result.rows }
    });
});

export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { label, name, phone, flat, area, city, state, pincode, country = 'India', is_default = false } = req.body;

    if (!name || !phone || !flat || !area || !city || !state || !pincode) {
        return res.status(400).json({
            success: false,
            error: { code: 'ADDR_001', message: 'All address fields are required: name, phone, flat, area, city, state, pincode' }
        });
    }

    if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
            success: false,
            error: { code: 'ADDR_002', message: 'Pincode must be exactly 6 digits' }
        });
    }

    if (is_default) {
        await pool.query(
            'UPDATE addresses SET is_default = false WHERE user_id = $1',
            [userId]
        );
    }

    const result = await pool.query(
        `INSERT INTO addresses (user_id, label, name, phone, flat, area, city, state, pincode, country, is_default, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING *`,
        [userId, label || 'Home', name, phone, flat, area, city, state, pincode, country, is_default]
    );

    return res.status(201).json({
        success: true,
        data: { address: result.rows[0] }
    });
});

export const updateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { label, name, phone, flat, area, city, state, pincode, country, is_default } = req.body;

    const existing = await pool.query(
        'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    if (existing.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'ADDR_003', message: 'Address not found' }
        });
    }

    if (is_default) {
        await pool.query(
            'UPDATE addresses SET is_default = false WHERE user_id = $1',
            [userId]
        );
    }

    const result = await pool.query(
        `UPDATE addresses
         SET label = COALESCE($1, label),
             name = COALESCE($2, name),
             phone = COALESCE($3, phone),
             flat = COALESCE($4, flat),
             area = COALESCE($5, area),
             city = COALESCE($6, city),
             state = COALESCE($7, state),
             pincode = COALESCE($8, pincode),
             country = COALESCE($9, country),
             is_default = COALESCE($10, is_default)
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [label, name, phone, flat, area, city, state, pincode, country, is_default, id, userId]
    );

    return res.status(200).json({
        success: true,
        data: { address: result.rows[0] }
    });
});

export const deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'ADDR_003', message: 'Address not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: { message: 'Address deleted successfully' }
    });
});
