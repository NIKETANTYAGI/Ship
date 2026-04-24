import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import pool from '../../../Database/db';

export const checkPincode = asyncHandler(async (req: Request, res: Response) => {
    const { pincode } = req.query;

    if (!pincode || typeof pincode !== 'string' || !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
            success: false,
            error: { code: 'PIN_001', message: 'Pincode must be exactly 6 digits' }
        });
    }

    const result = await pool.query(
        `SELECT pincode, city, state, is_serviceable, estimated_days
         FROM pincodes WHERE pincode = $1`,
        [pincode]
    );

    const record = result.rows[0];

    if (!record) {
        return res.status(404).json({
            success: false,
            error: { code: 'PIN_002', message: 'Pincode not found in our serviceable zones' }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            pincode: record.pincode,
            city: record.city,
            state: record.state,
            is_serviceable: record.is_serviceable,
            estimated_days: record.estimated_days,
        }
    });
});
