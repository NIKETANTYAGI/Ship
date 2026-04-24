import { Response } from 'express';
import db from '../../../Database/db';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

/**
 * Validates and calculates discount for a promo code.
 */
export const validatePromoCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, amount_paise } = req.body;

    if (!code || !amount_paise) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Code and amount are required' } });
    }

    const { rows } = await db.query(
      `SELECT * FROM promo_codes 
       WHERE code = $1 AND is_active = true AND (expiry_date IS NULL OR expiry_date > NOW())`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'PROMO_001', message: 'Invalid or expired promo code' } });
    }

    const promo = rows[0];

    // Check min order value
    if (amount_paise < (parseFloat(promo.min_order_value) * 100)) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'PROMO_002', 
          message: `Minimum order value for this code is Rs ${promo.min_order_value}` 
        } 
      });
    }

    let discountPaise = 0;
    if (promo.discount_type === 'FLAT') {
      discountPaise = Math.round(parseFloat(promo.discount_value) * 100);
    } else if (promo.discount_type === 'PERCENTAGE') {
      discountPaise = (amount_paise * parseFloat(promo.discount_value)) / 100;
      if (promo.max_discount) {
        const maxDiscountPaise = Math.round(parseFloat(promo.max_discount) * 100);
        if (discountPaise > maxDiscountPaise) discountPaise = maxDiscountPaise;
      }
    }

    // Ensure discount doesn't exceed original amount
    if (discountPaise > amount_paise) discountPaise = amount_paise;

    return res.status(200).json({
      success: true,
      data: {
        code: promo.code,
        discount_paise: Math.round(discountPaise),
        final_amount_paise: amount_paise - Math.round(discountPaise),
        message: 'Coupon valid'
      }
    });
  } catch (error) {
    console.error('validatePromoCode error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
  }
};
