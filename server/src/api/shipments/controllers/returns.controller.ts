import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../Database/db';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export const initiateReturn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const { original_shipment_id, reason, reason_description, pickup_slot_date, pickup_slot_time } = req.body;

    if (!original_shipment_id || !reason || !pickup_slot_date || !pickup_slot_time) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing required fields' } });
    }

    const { rows } = await db.query(
      `SELECT pickup_address, delivery_address, weight_grams, dimensions 
       FROM shipments WHERE id = $1 AND user_id = $2`,
      [original_shipment_id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'SHIPMENT_004', message: 'Original shipment not found' } });
    }

    const orig = rows[0];

    const returnShipmentId = uuidv4();

    await db.query(
      `INSERT INTO shipments (id, user_id, status, pickup_address, delivery_address, weight_grams, dimensions, is_return)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6, true)`,
      [returnShipmentId, userId, orig.delivery_address, orig.pickup_address, orig.weight_grams, orig.dimensions]
    );

    return res.status(201).json({
      success: true,
      data: {
        return_shipment_id: returnShipmentId,
        return_awb: `RET${Math.floor(Math.random() * 1000000000)}`,
        return_label_url: null,
        pickup_date: pickup_slot_date,
        pickup_slot: pickup_slot_time,
        return_shipping_fee_paise: 7900
      }
    });
  } catch (error) {
    console.error('initiateReturn error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};

export const cancelShipment = async (req: AuthenticatedRequest, res: Response) => {
  const client = await db.connect();
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_005', message: 'Unauthorized' } });
    }

    const { id } = req.params;

    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT status, amount_paise FROM shipments WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [id, userId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'SHIPMENT_004', message: 'Shipment not found' } });
    }

    const status = rows[0].status;
    const amount = rows[0].amount_paise || 0;

    if (status !== 'draft' && status !== 'booked') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: { code: 'SHIPMENT_005', message: 'Shipment already picked up. Cannot cancel.' } });
    }

    await client.query(
      `UPDATE shipments SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    if (status === 'booked') {
      await client.query(
        `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
        [amount, userId]
      );
      
      const txId = uuidv4();
      await client.query(
        `INSERT INTO wallet_transactions (id, user_id, amount_paise, type, description, status)
         VALUES ($1, $2, $3, 'credit', 'Shipment Cancellation Refund', 'completed')`,
        [txId, userId, amount]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: {
        shipment_id: id,
        status: 'cancelled',
        refund_amount_paise: status === 'booked' ? amount : 0,
        refund_to: 'wallet',
        refund_eta: 'Instant to wallet'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('cancelShipment error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  } finally {
    client.release();
  }
};
