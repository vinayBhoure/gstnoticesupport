import { randomBytes } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';
import { sanitizeFilename } from '../utils/sanitizeFilename';

// Locked: Mumbai region, private bucket, SSE-S3 (HLD §9). Files never pass
// through Express — the browser PUTs/GETs S3 directly via these signed URLs.
const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60; // 5 min (HLD §9.3)
const DRAFT_URL_EXPIRY_SECONDS = 15 * 60; // 15 min (HLD §9.4)
const CONTENT_TYPE_PDF = 'application/pdf';

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

function formatDateStamp(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// Key format (HLD §9, backend.md §9.3): {userId}/{bookingId}/{yyyyMMdd}-{sanitizedName}-{4rand}.pdf
export function buildDocumentKey(userId: string, bookingId: string, fileName: string): string {
  const stamp = formatDateStamp(new Date());
  const safeName = sanitizeFilename(fileName);
  const rand = randomBytes(2).toString('hex'); // 4 hex chars
  return `${userId}/${bookingId}/${stamp}-${safeName}-${rand}.pdf`;
}

type UploadUrlParams = {
  key: string;
  contentLength: number;
};

// Pre-signed PUT. ContentType and ContentLength are signed, so the browser must
// send exactly the validated size and a PDF content-type — neither can be bypassed.
export async function getUploadUrl({ key, contentLength }: UploadUrlParams): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: CONTENT_TYPE_PDF,
    ContentLength: contentLength,
    ServerSideEncryption: 'AES256',
  });
  return getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });
}

export function uploadUrlExpiresAt(): Date {
  return new Date(Date.now() + UPLOAD_URL_EXPIRY_SECONDS * 1000);
}

// Pre-signed GET for draft viewing. Generated fresh per request, never stored.
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: DRAFT_URL_EXPIRY_SECONDS });
}

export function draftUrlExpiresAt(): Date {
  return new Date(Date.now() + DRAFT_URL_EXPIRY_SECONDS * 1000);
}
