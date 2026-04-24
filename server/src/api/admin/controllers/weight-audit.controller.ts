import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../Database/db';

export const reportActualWeight = async (req: Request, res: Response) => {
  const client = await db.connect();
  try {
    const { shipment_id, actual_weight } = req.body;

    if (!shipment_id || !actual_weight) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing required fields' } });
    }

    await client.query('BEGIN');

    // 1. Get original shipment details
    const { rows: shipRows } = await client.query(
      `SELECT user_id, weight as declared_weight, cod_amount, status, awb FROM shipments WHERE id = $1 FOR UPDATE`,
      [shipment_id]
    );

    if (shipRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'VALIDATION_002', message: 'Shipment not found' } });
    }

    const { user_id, declared_weight, awb } = shipRows[0];

    // 2. Log weight audit
    await client.query(
      `INSERT INTO weight_logs (id, shipment_id, reported_weight, courier_weight, status)
       VALUES ($1, $2, $3, $4, 'PENDING')`,
      [uuidv4(), shipment_id, declared_weight, actual_weight]
    );

    // 3. Check for discrepancy (e.g., > 10% or absolute > 0.5kg)
    const discrepancy = actual_weight - declared_weight;
    
    if (discrepancy > 0.1) { // If courier weight is higher by more than 100g
      console.log(`⚠️ Weight discrepancy detected for AWB: ${awb}. Delta: ${discrepancy}kg`);

      // 4. Raise automated dispute
      const disputeId = uuidv4();
      await client.query(
        `INSERT INTO disputes (id, shipment_id, type, description, status, created_at)
         VALUES ($1, $2, 'weight_mismatch', $3, 'open', NOW())`,
        [disputeId, shipment_id, `Courier reported ${actual_weight}kg vs declared ${declared_weight}kg.`]
      );

      // 5. Calculate additional charge (Simplified: Rs 50 per additional 500g)
      const additionalChargePaise = Math.ceil(discrepancy / 0.5) * 5000;

      // 6. Debit Wallet
      const { rows: userRows } = await client.query(
        'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance',
        [additionalChargePaise, user_id]
      );

      // 7. Log Transaction
      await client.query(
        `INSERT INTO wallet_transactions (id, user_id, amount_paise, type, description, balance_after_paise, status)
         VALUES ($1, $2, $3, 'debit', $4, $5, 'completed')`,
        [uuidv4(), user_id, additionalChargePaise, `Weight Adjustment for AWB: ${awb}`, userRows[0].wallet_balance]
      );

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        data: {
          shipment_id,
          discrepancy: `${discrepancy}kg`,
          charge_deducted: `Rs ${additionalChargePaise / 100}`,
          dispute_id: disputeId,
          status: 'dispute_raised'
        }
      });
    }

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      data: {
        shipment_id,
        status: 'verified',
        message: 'Weight within acceptable tolerance'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('reportActualWeight error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  } finally {
    client.release();
  }
};
