import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { aggregateRates } from '../../../lib/couriers/rates.aggregator';
import { getRate, setRate } from '../../../lib/rate-cache';
import { sendSuccess, sendError } from '../../shared/types';

/**
 * GET /couriers/rates
 * Fetches and aggregates shipping rates from multiple courier partners.
 * Uses Redis caching for high performance.
 */
export const getCourierRates = asyncHandler(async (req: Request, res: Response) => {
    const { pickup, delivery, weight, length, width, height, is_cod } = req.query;

    if (!pickup || !delivery || !weight) {
        return sendError(res, 'VALIDATION_001', 'Missing required query parameters: pickup, delivery, weight', 400);
    }

    const pickup_pincode = pickup as string;
    const delivery_pincode = delivery as string;
    const weight_grams = parseInt(weight as string);
    const cod = is_cod === 'true';

    try {
        // 1. Check Cache first
        const cachedResults = await getRate(pickup_pincode, delivery_pincode, weight_grams, cod);
        if (cachedResults) {
            return sendSuccess(res, {
                ...cachedResults,
                cached: true
            });
        }

        // 2. Aggregate from live partners
        const rates = await aggregateRates({
            pickup_pincode,
            delivery_pincode,
            weight_grams,
            length_cm: length ? parseInt(length as string) : undefined,
            width_cm: width ? parseInt(width as string) : undefined,
            height_cm: height ? parseInt(height as string) : undefined,
            is_cod: cod
        });

        // 3. Store in cache (expires in 15 mins by default in aggregator)
        await setRate(pickup_pincode, delivery_pincode, weight_grams, cod, rates);

        return sendSuccess(res, rates);

    } catch (error) {
        console.error('💥 Courier Rates Error:', error);
        return sendError(res, 'SERVER_003', 'Failed to fetch courier rates', 500);
    }
});
