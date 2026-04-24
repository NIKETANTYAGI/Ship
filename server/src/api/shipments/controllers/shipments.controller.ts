import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { getRate, setRate } from '../../../lib/rate-cache';
import { aggregateRates } from '../../../lib/couriers/rates.aggregator';

export const createShipment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const {
        pickup_address,
        delivery_address,
        courier_id,
        weight_grams,
        length_cm,
        width_cm,
        height_cm,
        parcel_type = 'parcel',
        is_cod = false,
        cod_amount_paise = 0,
        pickup_instructions
    } = req.body;

    if (!pickup_address || !delivery_address || !courier_id || !weight_grams) {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_001', message: 'Missing required shipment fields.' }
        });
    }

    if (weight_grams < 1 || weight_grams > 50000) {
        return res.status(400).json({
            success: false,
            error: { code: 'SHIPMENT_006', message: 'Invalid weight — must be between 1 gram and 50000 grams' }
        });
    }

    // 1. Validate pricing and availability
    let rates = await getRate(pickup_address.pincode, delivery_address.pincode, weight_grams, is_cod);
    if (!rates) {
        rates = await aggregateRates({
            pickup_pincode: pickup_address.pincode,
            delivery_pincode: delivery_address.pincode,
            weight_grams,
            is_cod
        });
        await setRate(pickup_address.pincode, delivery_address.pincode, weight_grams, is_cod, rates);
    }

    const courierRate = rates.couriers.find(c => c.courier_id === courier_id);
    if (!courierRate) {
        return res.status(400).json({
            success: false,
            error: { code: 'SHIPMENT_003', message: 'Selected courier is not available for this route' }
        });
    }

    // Amount Calculation
    const amountPaise = courierRate.price_paise;
    const gstPaise = Math.round(amountPaise * 0.18);
    const totalPaise = amountPaise + gstPaise;

    // We need to resolve `courier_id` to its internal UUID since `courier_id` passed is the string code (e.g., 'delhivery')
    const courierLookup = await pool.query('SELECT id FROM couriers WHERE code = $1', [courier_id]);
    if (courierLookup.rows.length === 0) {
        return res.status(400).json({
            success: false,
            error: { code: 'SERVER_001', message: 'Internal Server Error — Courier not found in registry' }
        });
    }
    const internalCourierId = courierLookup.rows[0].id;

    // Begin Atomicity
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert Pickup Address (as non-default, shipment-specific)
        const pickupResult = await client.query(
            `INSERT INTO addresses (user_id, label, name, phone, flat, area, city, state, pincode, country, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING id`,
            [
                userId, 'Shipment Pickup', pickup_address.name, pickup_address.phone,
                '', pickup_address.full_address, pickup_address.city, pickup_address.state,
                pickup_address.pincode, 'India'
            ]
        );
        const internalPickupId = pickupResult.rows[0].id;

        // Insert Delivery Address
        const deliveryResult = await client.query(
            `INSERT INTO addresses (user_id, label, name, phone, flat, area, city, state, pincode, country, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING id`,
            [
                userId, 'Shipment Delivery', delivery_address.name, delivery_address.phone,
                '', delivery_address.full_address, delivery_address.city, delivery_address.state,
                delivery_address.pincode, 'India'
            ]
        );
        const internalDeliveryId = deliveryResult.rows[0].id;

        // Extract Dimensions
        const dimensionsCm = length_cm && width_cm && height_cm 
            ? { l: length_cm, w: width_cm, h: height_cm } : null;

        // Insert Shipment
        const shipmentResult = await client.query(
            `INSERT INTO shipments (
                user_id, pickup_address_id, delivery_address_id, courier_id, 
                weight_grams, dimensions_cm, cod_amount, charge, 
                courier_service, parcel_type, status, payment_status, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT', 'PENDING', NOW())
             RETURNING id, created_at`,
            [
                userId, internalPickupId, internalDeliveryId, internalCourierId,
                weight_grams, dimensionsCm, cod_amount_paise / 100, totalPaise / 100,
                'Standard', parcel_type
            ]
        );

        const newShipment = shipmentResult.rows[0];

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            data: {
                shipment_id: newShipment.id,
                status: 'draft',
                amount_paise: amountPaise,
                gst_paise: gstPaise,
                total_paise: totalPaise,
                created_at: newShipment.created_at
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Shipment Draft Creation Error:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_001', message: 'Internal server error while creating draft.' }
        });
    } finally {
        client.release();
    }
});

export const getShipmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
        `SELECT 
            s.*,
            c.code AS courier_id, c.name AS courier_name,
            pa.full_address AS pa_full_address, pa.pincode AS pa_pincode, pa.city AS pa_city, pa.state AS pa_state, pa.name AS pa_name, pa.phone AS pa_phone, pa.area AS pa_area,
            da.full_address AS da_full_address, da.pincode AS da_pincode, da.city AS da_city, da.state AS da_state, da.name AS da_name, da.phone AS da_phone, da.area AS da_area,
            ev.file_hash, ev.file_url 
         FROM shipments s
         LEFT JOIN couriers c ON s.courier_id = c.id
         LEFT JOIN addresses pa ON s.pickup_address_id = pa.id
         LEFT JOIN addresses da ON s.delivery_address_id = da.id
         LEFT JOIN evidence_vault ev ON s.id = ev.shipment_id
         WHERE s.id = $1 AND s.user_id = $2`,
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'SHIPMENT_004', message: 'Shipment not found' }
        });
    }

    const s = result.rows[0];

    const amountPaise = Math.round(parseFloat(s.charge) * 100);
    const gstPaise = Math.round(amountPaise * 0.18);

    return res.status(200).json({
        success: true,
        data: {
            shipment_id: s.id,
            status: s.status.toLowerCase(),
            awb_number: s.awb,
            courier_id: s.courier_id,
            courier_name: s.courier_name,
            pickup_address: {
                full_address: s.pa_area, // schema maps full_address to area field
                pincode: s.pa_pincode,
                city: s.pa_city,
                state: s.pa_state,
                name: s.pa_name,
                phone: s.pa_phone
            },
            delivery_address: {
                full_address: s.da_area,
                pincode: s.da_pincode,
                city: s.da_city,
                state: s.da_state,
                name: s.da_name,
                phone: s.da_phone
            },
            weight_grams: s.weight_grams,
            amount_paise: amountPaise,
            total_paise: amountPaise, // To adhere to API, total is amount (we precalculate total into charge)
            is_cod: parseFloat(s.cod_amount) > 0,
            evidence_uploaded: !!s.file_hash,
            evidence_hash: s.file_hash,
            label_url: s.file_url,
            created_at: s.created_at,
            booked_at: s.updated_at // if DRAFT shouldn't have booked_at technically
        }
    });
});

export const getUserShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let queryBase = 'FROM shipments WHERE user_id = $1';
    let params: any[] = [userId];

    if (status) {
        queryBase += ' AND status = $2';
        params.push(status.toUpperCase());
    }

    const countRes = await pool.query(`SELECT COUNT(*) ${queryBase}`, params);
    const total = parseInt(countRes.rows[0].count);

    const shipments = await pool.query(
        `SELECT id as shipment_id, status, awb as awb_number, created_at, charge, weight_grams 
         ${queryBase} 
         ORDER BY created_at DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
    );

    return res.status(200).json({
        success: true,
        data: {
            shipments: shipments.rows.map(s => ({
                ...s,
                status: s.status.toLowerCase(),
                total_paise: Math.round(parseFloat(s.charge) * 100)
            })),
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_next: (page * limit) < total,
                has_prev: page > 1
            }
        }
    });
});

export const searchShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const q = req.query.q as string;

    if (!q) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing search query' }});
    }

    const result = await pool.query(
        `SELECT s.id as shipment_id, s.status, s.awb as awb_number, s.created_at, s.charge, s.weight_grams, c.name as courier_name
         FROM shipments s
         LEFT JOIN couriers c ON s.courier_id = c.id
         WHERE s.user_id = $1 AND (s.awb ILIKE $2 OR c.name ILIKE $2)
         ORDER BY s.created_at DESC`,
        [userId, `%${q}%`]
    );

    return res.status(200).json({
        success: true,
        data: {
            shipments: result.rows.map(s => ({
                ...s,
                status: s.status.toLowerCase(),
                total_paise: Math.round(parseFloat(s.charge) * 100)
            })),
            total: result.rows.length
        }
    });
});

export const confirmDelivery = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Delivery OTP missing' } });
    }

    // Mock validation: accept '4821' or '0000' as valid OTP for development
    if (otp !== '4821' && otp !== '0000') {
        return res.status(400).json({ success: false, error: { code: 'AUTH_003', message: 'Invalid Delivery OTP' } });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const ship = await client.query('SELECT * FROM shipments WHERE id = $1 AND user_id = $2 FOR UPDATE', [id, userId]);
        if (ship.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: { code: 'SHIPMENT_004', message: 'Shipment not found' } });
        }

        const shipment = ship.rows[0];
        if (shipment.status === 'DELIVERED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_003', message: 'Already delivered' } });
        }

        const result = await client.query(
            "UPDATE shipments SET status = 'DELIVERED', updated_at = NOW() WHERE id = $1 RETURNING updated_at",
            [id]
        );

        // If it was a COD shipment, log to cod_collections
        if (shipment.cod_amount && parseFloat(shipment.cod_amount) > 0) {
            await client.query(
                "INSERT INTO cod_collections (shipment_id, amount, status) VALUES ($1, $2, 'COLLECTED')",
                [id, shipment.cod_amount]
            );
        }

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            data: {
                shipment_id: id,
                status: 'delivered',
                delivered_at: result.rows[0].updated_at
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
    } finally {
        client.release();
    }
});

export const bulkCreateShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { shipments } = req.body;

    if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Missing shipments array' } });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];

        for (const shipReq of shipments) {
            const { pickup_address, delivery_address, weight_grams, is_cod = false, parcel_type = 'parcel', cod_amount_paise = 0, length_cm, width_cm, height_cm } = shipReq;

            // 1. Fetch Rates
            let rates = await getRate(pickup_address.pincode, delivery_address.pincode, weight_grams, is_cod);
            if (!rates) {
                rates = await aggregateRates({
                    pickup_pincode: pickup_address.pincode,
                    delivery_pincode: delivery_address.pincode,
                    weight_grams,
                    is_cod
                });
                await setRate(pickup_address.pincode, delivery_address.pincode, weight_grams, is_cod, rates);
            }

            // 2. Select cheapest courier
            if (rates.couriers.length === 0) {
                results.push({ success: false, error: 'No service available', shipment: shipReq });
                continue;
            }

            const cheapest = rates.couriers[0]; 
            const amountPaise = cheapest.price_paise;
            const gstPaise = Math.round(amountPaise * 0.18);
            const totalPaise = amountPaise + gstPaise;

            const courierLookup = await client.query('SELECT id FROM couriers WHERE code = $1', [cheapest.courier_id]);
            const internalCourierId = courierLookup.rows[0].id;

            // 3. Insert Addresses
            const pickupResult = await client.query(
                `INSERT INTO addresses (user_id, label, name, phone, flat, area, city, state, pincode, country, is_default)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING id`,
                [userId, 'Bulk Pickup', pickup_address.name, pickup_address.phone, '', pickup_address.full_address, pickup_address.city, pickup_address.state, pickup_address.pincode, 'India']
            );
            const internalPickupId = pickupResult.rows[0].id;

            const deliveryResult = await client.query(
                `INSERT INTO addresses (user_id, label, name, phone, flat, area, city, state, pincode, country, is_default)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING id`,
                [userId, 'Bulk Delivery', delivery_address.name, delivery_address.phone, '', delivery_address.full_address, delivery_address.city, delivery_address.state, delivery_address.pincode, 'India']
            );
            const internalDeliveryId = deliveryResult.rows[0].id;

            const dimensionsCm = length_cm && width_cm && height_cm ? { l: length_cm, w: width_cm, h: height_cm } : null;

            // 4. Insert Draft
            const shipmentResult = await client.query(
                `INSERT INTO shipments (
                    user_id, pickup_address_id, delivery_address_id, courier_id, 
                    weight_grams, dimensions_cm, cod_amount, charge, 
                    courier_service, parcel_type, status, payment_status, created_at
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT', 'PENDING', NOW())
                 RETURNING id, created_at`,
                [userId, internalPickupId, internalDeliveryId, internalCourierId, weight_grams, dimensionsCm, cod_amount_paise / 100, totalPaise / 100, 'Standard', parcel_type]
            );

            results.push({
                success: true,
                shipment_id: shipmentResult.rows[0].id,
                amount_paise: totalPaise,
                courier_selected: cheapest.courier_id
            });
        }

        await client.query('COMMIT');
        return res.status(201).json({ success: true, data: { processed: results.length, details: results } });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk Draft Creation Error:', err);
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error while bulk creating' } });
    } finally {
        client.release();
    }
});
