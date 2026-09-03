import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../errors/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads/products');

// Ensure local upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export class StorageService {
  constructor() {
    this.s3Bucket = process.env.AWS_BUCKET_NAME;
    this.s3Region = process.env.AWS_REGION || 'us-east-1';
    this.hasS3Config = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      this.s3Bucket
    );

    if (this.hasS3Config) {
      this.s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  /**
   * Upload an image buffer to either AWS S3 or Local File Storage.
   *
   * @param {Object} file - Multer file object (buffer, originalname, mimetype)
   * @returns {Promise<string>} Public URL of the uploaded image
   */
  async uploadProductImage(file) {
    if (!file) {
      throw new AppError('No image file provided for upload', 400);
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. AWS S3 Upload Strategy
    if (this.hasS3Config) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: `products/${filename}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);
        const s3Url = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/products/${filename}`;
        return s3Url;
      } catch (err) {
        console.warn('[AWS S3 Error, falling back to local storage]:', err.message);
      }
    }

    // 2. Resilient Local Disk Storage Strategy (Fallback)
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    return `/uploads/products/${filename}`;
  }
}

export const storageService = new StorageService();