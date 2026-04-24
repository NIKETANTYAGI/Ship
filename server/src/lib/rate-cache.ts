/**
 * BE1 — Day 8: Redis Rate Cache Helpers
 * Caches courier rate aggregation results to avoid redundant API calls.
 * - Redis: Primary 15-min cache (hot path)
 * - PostgreSQL: rate_cache backup table (warm fallback)
 *
 * Cache Key format: rate:{pickup_pincode}:{delivery_pincode}:{weight_grams}:{is_cod}
 */

import { redis } from './redis';
import db from '../Database/db';
import type { AggregatedRatesResult } from './couriers/types';

const RATE_CACHE_TTL_SECONDS = 900; // 15 minutes

// ─── Key Builder ────────────────────────────────────────────────────────────

function buildCacheKey(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): string {
  return `rate:${pickupPincode}:${deliveryPincode}:${weightGrams}:${isCod ? 'cod' : 'prepaid'}`;
}

// ─── Redis Cache ─────────────────────────────────────────────────────────────

/**
 * Get cached rates from Redis (hot cache)
 */
export async function getCachedRates(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): Promise<AggregatedRatesResult | null> {
  try {
    const key = buildCacheKey(pickupPincode, deliveryPincode, weightGrams, isCod);
    const cached = await redis.get(key);
    if (!cached) return null;

    const result = JSON.parse(cached) as AggregatedRatesResult;
    return { ...result, cached: true };
  } catch (err) {
    console.error('⚠️ Redis rate cache GET failed:', err);
    return null;
  }
}

/**
 * Store rates in Redis with a 15-minute TTL
 */
export async function setCachedRates(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false,
  result: AggregatedRatesResult
): Promise<void> {
  try {
    const key = buildCacheKey(pickupPincode, deliveryPincode, weightGrams, isCod);
    await redis.set(key, JSON.stringify(result), 'EX', RATE_CACHE_TTL_SECONDS);
  } catch (err) {
    console.error('⚠️ Redis rate cache SET failed:', err);
    // Non-fatal: caller still has the fresh result
  }
}

/**
 * Invalidate a specific rate cache entry
 */
export async function invalidateCachedRates(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): Promise<void> {
  try {
    const key = buildCacheKey(pickupPincode, deliveryPincode, weightGrams, isCod);
    await redis.del(key);
  } catch (err) {
    console.error('⚠️ Redis rate cache DEL failed:', err);
  }
}

// ─── PostgreSQL Backup Cache ──────────────────────────────────────────────────

/**
 * Upsert fresh rates into the rate_cache backup table.
 * Called after a successful API fetch to keep the DB warm.
 */
export async function backupRatesToDb(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false,
  result: AggregatedRatesResult
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + RATE_CACHE_TTL_SECONDS * 1000);
    await db.query(
      `INSERT INTO rate_cache (pickup_pincode, delivery_pincode, weight_grams, is_cod, payload, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (pickup_pincode, delivery_pincode, weight_grams, is_cod)
       DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at, updated_at = NOW()`,
      [pickupPincode, deliveryPincode, weightGrams, isCod, JSON.stringify(result), expiresAt]
    );
  } catch (err) {
    // Non-fatal: Redis is the primary cache. DB is just for warm restart.
    console.error('⚠️ DB rate cache backup failed:', err);
  }
}

/**
 * Read warm rates from DB (used at server startup when Redis is cold)
 */
export async function getDbBackupRates(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): Promise<AggregatedRatesResult | null> {
  try {
    const result = await db.query(
      `SELECT payload FROM rate_cache
       WHERE pickup_pincode = $1
         AND delivery_pincode = $2
         AND weight_grams = $3
         AND is_cod = $4
         AND expires_at > NOW()
       LIMIT 1`,
      [pickupPincode, deliveryPincode, weightGrams, isCod]
    );
    if (result.rows.length === 0) return null;
    return { ...(result.rows[0].payload as AggregatedRatesResult), cached: true };
  } catch (err) {
    console.error('⚠️ DB rate cache GET failed:', err);
    return null;
  }
}

// ─── Composite Helper ─────────────────────────────────────────────────────────

/**
 * Full cache lookup: Redis first, then DB fallback.
 * Returns null if neither has a valid entry.
 */
export async function getRate(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false
): Promise<AggregatedRatesResult | null> {
  const redisCached = await getCachedRates(pickupPincode, deliveryPincode, weightGrams, isCod);
  if (redisCached) {
    console.log(`⚡ Redis cache HIT [${pickupPincode}→${deliveryPincode}]`);
    return redisCached;
  }

  const dbCached = await getDbBackupRates(pickupPincode, deliveryPincode, weightGrams, isCod);
  if (dbCached) {
    console.log(`🗃️  DB cache HIT [${pickupPincode}→${deliveryPincode}] — re-warming Redis`);
    // Re-warm Redis silently
    await setCachedRates(pickupPincode, deliveryPincode, weightGrams, isCod, dbCached);
    return dbCached;
  }

  console.log(`❌ Cache MISS [${pickupPincode}→${deliveryPincode}]`);
  return null;
}

/**
 * Store rates in both Redis and DB after a live fetch.
 */
export async function setRate(
  pickupPincode: string,
  deliveryPincode: string,
  weightGrams: number,
  isCod: boolean = false,
  result: AggregatedRatesResult
): Promise<void> {
  await Promise.all([
    setCachedRates(pickupPincode, deliveryPincode, weightGrams, isCod, result),
    backupRatesToDb(pickupPincode, deliveryPincode, weightGrams, isCod, result),
  ]);
}
