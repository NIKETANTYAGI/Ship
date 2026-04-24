import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import crypto from 'crypto';

export const initiateKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { aadhaar_number } = req.body;

    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Invalid Aadhaar number format' } });
    }

    // Mock API call to Digio / Aadhar service
    const mockSessionId = crypto.randomBytes(16).toString('hex');
    
    // Update user status
    await pool.query(
        "UPDATE users SET kyc_status = 'INITIATED', updated_at = NOW() WHERE id = $1",
        [userId]
    );

    return res.status(200).json({
        success: true,
        data: {
            session_id: mockSessionId,
            message: 'OTP sent to Aadhaar linked mobile number'
        }
    });
});

export const verifyKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { session_id, otp } = req.body;

    if (!session_id || !otp) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing session or OTP' } });
    }

    // Accept 4821 or 000000 for mockup
    if (otp !== '4821' && otp !== '000000') {
        return res.status(400).json({ success: false, error: { code: 'AUTH_003', message: 'Invalid Aadhaar OTP' } });
    }

    // Mock success -> Update User
    await pool.query(
        "UPDATE users SET kyc_status = 'VERIFIED', updated_at = NOW() WHERE id = $1",
        [userId]
    );

    return res.status(200).json({
        success: true,
        data: {
            status: 'verified',
            message: 'KYC completed successfully'
        }
    });
});
