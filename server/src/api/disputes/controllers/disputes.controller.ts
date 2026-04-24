import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../Database/db';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export const raiseDispute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const { shipment_id, type, description, evidence_ids } = req.body;

    if (!shipment_id || !type || !description) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing required fields' } });
    }

    const validTypes = ['weight_mismatch', 'damage', 'not_delivered', 'wrong_delivery', 'cod_not_remitted'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_002', message: 'Invalid dispute type' } });
    }

    const disputeId = uuidv4();
    const disputeRef = `DSP${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;

    await db.query(
      `INSERT INTO disputes (id, shipment_id, type, description, status, expected_resolution, created_at)
       VALUES ($1, $2, $3, $4, 'open', '3-5 business days', NOW())`,
      [disputeId, shipment_id, type, description]
    );

    return res.status(201).json({
      success: true,
      data: {
        dispute_id: disputeId,
        dispute_reference: disputeRef,
        status: 'open',
        expected_resolution: '3-5 business days',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('raiseDispute error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};

export const getDisputeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const { dispute_id } = req.params;

    const { rows } = await db.query(
      `SELECT id as dispute_id, type, status, expected_resolution FROM disputes WHERE id = $1`,
      [dispute_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'VALIDATION_002', message: 'Dispute not found' } });
    }

    const dispute = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        dispute_id: dispute.dispute_id,
        type: dispute.type,
        status: dispute.status,
        activity: [
          { event: 'Dispute received', timestamp: new Date().toISOString() },
          { event: 'Assigned to OPS team', timestamp: new Date().toISOString() }
        ],
        resolution: null
      }
    });
  } catch (error) {
    console.error('getDisputeStatus error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};
