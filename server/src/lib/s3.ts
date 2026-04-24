import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const S3_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const S3_PORT = parseInt(process.env.MINIO_PORT || '9000');
const S3_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'swiftroute';
const S3_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'swiftroute123';
const S3_BUCKET = process.env.MINIO_BUCKET || 'evidence-vault';

/**
 * SwiftRoute Evidence Vault (S3/MinIO) Client
 * Stores and retrieves secure evidence, shipment labels, and proof files.
 */
export const s3Client = new S3Client({
    region: 'ap-south-1', // Default
    endpoint: `http://${S3_ENDPOINT}:${S3_PORT}`,
    forcePathStyle: true, // Required for Local MinIO
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY
    }
});

/**
 * Uploads a file buffer to the evidence-vault
 * @param bucket Specific bucket name
 * @param key Filename/Path in bucket
 * @param body Buffer/Stream
 * @param contentType Standard MIME type
 */
export const uploadFile = async (key: string, body: Buffer, contentType: string) => {
    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType
        });
        await s3Client.send(command);
        return { success: true, key };
    } catch (error) {
        console.error('❌ S3 Upload Failed:', error);
        throw new Error('Could not upload file to evidence vault.');
    }
};

/**
 * Generates a temporary signed URL for a file (Valid for 15 mins)
 */
export const getPresignedDownloadUrl = async (key: string) => {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 900 });
    } catch (error) {
        console.error('❌ S3 Presigned URL Failed:', error);
        return null;
    }
};
