import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { TrackingEvent } from '../../../lib/mongo';

export const getTrackingEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { awb } = req.params;

    if (!awb) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing tracking AWB' } });
    }

    try {
        const events = await TrackingEvent.find({ awb_number: awb }).sort({ timestamp: -1 });

        if (!events || events.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'SHIPMENT_007', message: 'Tracking details not found' } });
        }

        const currentStatus = events[0].status; // Latest event

        return res.status(200).json({
            success: true,
            data: {
                awb: awb,
                current_status: currentStatus.toLowerCase(),
                timeline: events.map(e => ({
                    status: e.status.toLowerCase(),
                    location: e.location,
                    description: e.description,
                    timestamp: e.timestamp
                }))
            }
        });
    } catch (e) {
        console.error('Mongo Error', e);
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal Server Error' } });
    }
});
