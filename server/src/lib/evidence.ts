/**
 * BE3 — Day 7: Evidence Vault Upload Service
 *
 * Accepts a file buffer, computes SHA256 hash (content-addressable),
 * uploads to MinIO via the S3 client, and saves metadata to PostgreSQL.
 *
 * Uses the plan:
 * - POST /evidence/upload  (multer buffer)
 * - Compute SHA256 before upload
 * - Upload key = evidence/{shipment_id}/{type}/{hash}.{ext}
 * - Save {file_url, file_hash, type, shipment_id} to evidence_vault table
 */

import crypto from 'crypto';
import path from 'path';
import { uploadFile, getPresignedDownloadUrl } from './s3';
import db from '../Database/db';

export type EvidenceType = 'PICKUP' | 'DELIVERY' | 'DAMAGE' | 'DISPUTE';

export interface UploadEvidenceResult {
  id: string;
  file_url: string;
  download_url: string | null;
  file_hash: string;
  type: EvidenceType;
  shipment_id: string;
}

/**
 * Compute SHA256 hash of a file buffer
 */
function computeSHA256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Upload evidence file to MinIO and record in DB
 *
 * @param shipmentId  - UUID of the shipment
 * @param type        - Evidence category
 * @param fileBuffer  - Raw file bytes (from multer)
 * @param originalName - Original filename (for extension extraction)
 * @param contentType  - MIME type
 */
export async function uploadEvidence(
  shipmentId: string,
  type: EvidenceType,
  fileBuffer: Buffer,
  originalName: string,
  contentType: string
): Promise<UploadEvidenceResult> {
  // 1. Compute SHA256 hash (content-addressable storage)
  const fileHash = computeSHA256(fileBuffer);

  // 2. Check for duplicate (same hash = same file)
  const existing = await db.query(
    `SELECT id, file_url, file_hash FROM evidence_vault
     WHERE shipment_id = $1 AND file_hash = $2 AND type = $3
     LIMIT 1`,
    [shipmentId, fileHash, type]
  );

  if (existing.rows.length > 0) {
    console.log(`[evidence] Duplicate detected — returning existing record (hash: ${fileHash.slice(0, 8)}...)`);
    const row = existing.rows[0];
    const downloadUrl = await getPresignedDownloadUrl(row.file_url.replace(/^.*\/evidence\//, 'evidence/'));
    return {
      id: row.id,
      file_url: row.file_url,
      download_url: downloadUrl,
      file_hash: row.file_hash,
      type,
      shipment_id: shipmentId,
    };
  }

  // 3. Build object key using SHA256 (deduplicates across shipments)
  const ext = path.extname(originalName) || '.bin';
  const objectKey = `evidence/${shipmentId}/${type.toLowerCase()}/${fileHash}${ext}`;

  // 4. Upload to MinIO
  await uploadFile(objectKey, fileBuffer, contentType);
  const fileUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${process.env.MINIO_BUCKET || 'evidence-vault'}/${objectKey}`;

  // 5. Persist to PostgreSQL
  const insert = await db.query(
    `INSERT INTO evidence_vault (shipment_id, file_url, file_hash, type)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [shipmentId, fileUrl, fileHash, type]
  );

  const evidenceId = insert.rows[0].id as string;

  // 6. Get a short-lived download URL
  const downloadUrl = await getPresignedDownloadUrl(objectKey);

  console.log(`✅ [evidence] Uploaded ${type} proof for shipment ${shipmentId} → ${objectKey}`);

  return {
    id: evidenceId,
    file_url: fileUrl,
    download_url: downloadUrl,
    file_hash: fileHash,
    type,
    shipment_id: shipmentId,
  };
}

/**
 * Fetch all evidence for a shipment
 */
export async function getShipmentEvidence(shipmentId: string) {
  const result = await db.query(
    `SELECT id, file_url, file_hash, type, created_at
     FROM evidence_vault
     WHERE shipment_id = $1
     ORDER BY created_at DESC`,
    [shipmentId]
  );
  return result.rows;
}
