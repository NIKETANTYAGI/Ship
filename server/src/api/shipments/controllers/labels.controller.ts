import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { generateShippingLabel } from '../../../lib/pdf-generator';
import pool from '../../../Database/db';
import { asyncHandler } from '../../../middleware/asyncHandler';

/**
 * GET /api/shipments/:id/label
 * Fetches or generates the shipping label for a specific shipment.
 */
export const downloadLabel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    // 1. Verify shipment belongs to user and is in a state that allows label generation
    const result = await pool.query(
        'SELECT id, status, awb, label_url FROM shipments WHERE (id::text = $1 OR awb = $1) AND user_id = $2',
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const shipment = result.rows[0];

    // Labels are only available for BOOKED or beyond
    if (shipment.status === 'DRAFT' || shipment.status === 'CANCELLED') {
        return res.status(400).json({ 
            success: false, 
            message: `Labels cannot be generated for shipments in ${shipment.status} state.` 
        });
    }

    // 2. Check if label already exists in DB
    if (shipment.label_url) {
        // In a real S3 setup, we would return a signed URL. 
        // For this implementation, we simulate streaming or redirecting to the key.
        return res.status(200).json({
            success: true,
            data: {
                label_url: shipment.label_url,
                message: 'Label retrieved successfully'
            }
        });
    }

    // 3. If not, generate it on the fly
    const labelKey = await generateShippingLabel(id as string);

    if (!labelKey) {
        return res.status(500).json({ success: false, message: 'Failed to generate label' });
    }

    // Update DB so next time it's cached
    await pool.query('UPDATE shipments SET label_url = $1 WHERE id = $2', [labelKey, id]);

    return res.status(200).json({
        success: true,
        data: {
            label_url: labelKey,
            message: 'Label generated successfully'
        }
    });
});
