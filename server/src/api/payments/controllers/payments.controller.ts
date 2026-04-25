import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { generateShippingLabel } from '../../../lib/pdf-generator';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../../lib/razorpay';
import { emitEvent, TOPICS } from '../../../lib/kafka';

export const initiatePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipment_id, use_wallet = false, promo_code } = req.body;

    if (!shipment_id) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing shipment_id' } });
    }

    const result = await pool.query(
        'SELECT * FROM shipments WHERE id = $1 AND user_id = $2',
        [shipment_id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'SHIPMENT_004', message: 'Shipment not found' } });
    }

    const shipment = result.rows[0];

    if (shipment.status !== 'DRAFT') {
        return res.status(400).json({ success: false, error: { code: 'PAYMENT_003', message: 'Shipment is already booked or not in draft state' } });
    }

    // Amount is stored in 'charge' as a DECIMAL string (e.g. "89.00"). Convert to paise.
    let amountPaise = Math.round(parseFloat(shipment.charge) * 100);
    let discountPaise = 0;
    
    // Database-backed Promo Validation
    if (promo_code) {
        const { rows: promoRows } = await pool.query(
            "SELECT * FROM promo_codes WHERE code = $1 AND is_active = true AND (expiry_date IS NULL OR expiry_date > NOW())",
            [promo_code]
        );

        if (promoRows.length > 0) {
            const promo = promoRows[0];
            if (amountPaise >= (parseFloat(promo.min_order_value) * 100)) {
                if (promo.discount_type === 'FLAT') {
                    discountPaise = Math.round(parseFloat(promo.discount_value) * 100);
                } else {
                    discountPaise = (amountPaise * parseFloat(promo.discount_value)) / 100;
                    if (promo.max_discount) {
                        const maxD = Math.round(parseFloat(promo.max_discount) * 100);
                        if (discountPaise > maxD) discountPaise = maxD;
                    }
                }
            }
        }
    }

    let finalAmountPaise = Math.max(0, amountPaise - discountPaise);
    let walletUsedPaise = 0;

    // Advanced wallet deduct not tracked natively in shipment table, so keeping it 0 for MVP
    
    const rzpOrder = await createRazorpayOrder(finalAmountPaise / 100, 'INR', shipment_id);

    // Track payment_id, promo and discount back to DB
    await pool.query(
        'UPDATE shipments SET payment_id = $1, promo_code = $2, discount_amount = $3 WHERE id = $4', 
        [rzpOrder.id, promo_code, discountPaise / 100, shipment_id]
    );

    return res.status(200).json({
        success: true,
        data: {
            order_id: rzpOrder.id,
            amount_paise: amountPaise,
            wallet_used_paise: walletUsedPaise,
            final_amount_paise: finalAmountPaise,
            razorpay_key: process.env.RAZORPAY_KEY_ID || 'rzp_test_missing_id',
            discount_paise: discountPaise,
            currency: 'INR'
        }
    });
});

export const paymentWebhook = asyncHandler(async (req: any, res: Response) => {
    // Razorpay sends HMAC signature in headers
    const signature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);

    if (!signature || !verifyRazorpaySignature(payload, signature as string)) {
        return res.status(400).json({ success: false, error: { code: 'PAYMENT_002', message: 'Invalid signature' } });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;
        const rzpOrderId = paymentEntity.order_id;

        // Try to fetch shipment by Razorpay Order ID. In production, 'receipt' field could also map to shipment_id
        const shRes = await pool.query('SELECT * FROM shipments WHERE payment_id = $1', [rzpOrderId]);
        
        if (shRes.rows.length > 0) {
            const shipment = shRes.rows[0];
            
            // Generate mock AWB for local development as courier APIs aren't fully hooked
            const mockAwb = `SR${Math.floor(10000000 + Math.random() * 90000000)}`;

            // Update shipment
            await pool.query(
                `UPDATE shipments 
                 SET status = 'BOOKED', 
                     payment_status = 'PAID', 
                     awb = $1, 
                     updated_at = NOW() 
                 WHERE id = $2`,
                [mockAwb, shipment.id]
            );

            // Fetch full shipment context to emit event
            const fullSh = await pool.query(
                `SELECT s.*, u.phone 
                 FROM shipments s 
                 JOIN users u ON s.user_id = u.id 
                 WHERE s.id = $1`,
                [shipment.id]
            );

            await emitEvent(TOPICS.SHIPMENT_UPDATED, {
                shipment_id: shipment.id,
                status: 'BOOKED',
                old_status: 'DRAFT',
                awb: mockAwb,
                notify: true,
                channel: ['SMS', 'WHATSAPP'] // To trigger notification consumer
            });

            // ─── Referral Rewards Automation ──────────────────────────────────
            const { rows: refCheck } = await pool.query(
                `SELECT u.referred_by, COUNT(s.id) as shipment_count 
                 FROM users u 
                 LEFT JOIN shipments s ON u.id = s.user_id AND s.status != 'DRAFT'
                 WHERE u.id = $1 
                 GROUP BY u.referred_by`,
                [shipment.user_id]
            );

            if (refCheck.length > 0 && refCheck[0].referred_by && parseInt(refCheck[0].shipment_count) === 1) {
                const referrerId = refCheck[0].referred_by;
                const rewardPaise = 1000; // Rs 10 reward
                
                // Credit Referrer
                await pool.query(
                    "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
                    [rewardPaise, referrerId]
                );

                // Log Reward
                await pool.query(
                    `INSERT INTO wallet_transactions (user_id, type, amount, status, description)
                     VALUES ($1, 'CREDIT', $2, 'SUCCESS', $3)`,
                    [referrerId, rewardPaise / 100, `Referral Reward for user signup conversion`]
                );
                console.log(`🎁 Referral reward of Rs 10 credited to ${referrerId}`);
            }

            // Async trigger PDF Label and Invoice generation
            Promise.all([
                generateShippingLabel(shipment.id),
                import('../../../lib/pdf-generator').then(m => m.generateTaxInvoice(shipment.id))
            ]).then(async ([labelKey, invoiceKey]) => {
                const updates: any = {};
                if (labelKey) updates.label_url = labelKey;
                if (invoiceKey) updates.invoice_url = invoiceKey;
                
                if (Object.keys(updates).length > 0) {
                    const keys = Object.keys(updates).map((k, i) => `${k} = $${i+1}`).join(', ');
                    await pool.query(
                        `UPDATE shipments SET ${keys} WHERE id = $${Object.keys(updates).length + 1}`,
                        [...Object.values(updates), shipment.id]
                    );
                }
            }).catch(e => console.error("Could not generate PDFs", e));
        }
    }


    // Always 200 OK for webhooks
    return res.status(200).json({ received: true });
});

export const applyPromo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { code, shipment_id } = req.body;

    if (!code || !shipment_id) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing fields' } });
    }

    const result = await pool.query('SELECT charge FROM shipments WHERE id = $1', [shipment_id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false });

    const amountPaise = Math.round(parseFloat(result.rows[0].charge) * 100);

    if (code === 'FIRST50') {
        const discount = 5000;
        return res.status(200).json({
            success: true,
            data: {
                code,
                discount_type: 'flat',
                discount_paise: discount,
                original_amount_paise: amountPaise,
                final_amount_paise: amountPaise - discount > 0 ? amountPaise - discount : 0,
                message: 'Coupon applied! You save Rs 50'
            }
        });
    }

    return res.status(400).json({ success: false, error: { code: 'PAYMENT_005', message: 'Promo code invalid' } });
});
