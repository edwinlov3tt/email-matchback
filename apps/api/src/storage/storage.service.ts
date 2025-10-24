import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  etag?: string;
}

export interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  etag?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '';
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '';
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'matchback-files');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'R2 credentials not configured. Storage operations will fail.'
      );
    }

    // Initialize S3 client with Cloudflare R2 endpoint
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`Storage service initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Upload a file to R2 storage
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      const response = await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url: this.getFileUrl(key),
        size: buffer.length,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Download a file from R2 storage
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No file content returned');
      }

      // Convert stream to buffer
      const buffer = await this.streamToBuffer(response.Body as Readable);

      this.logger.log(`File downloaded successfully: ${key}`);

      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file: ${key}`, error.stack);
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from R2 storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error.stack);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${key}`, error.stack);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * List files in a directory (prefix)
   */
  async listFiles(prefix: string = ''): Promise<FileMetadata[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      return response.Contents.map(item => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
        etag: item.ETag,
      }));
    } catch (error) {
      this.logger.error(`Failed to list files with prefix: ${prefix}`, error.stack);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Generate a public URL for a file
   */
  getFileUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    // Fallback to R2 endpoint URL
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    return `https://${accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
  }

  /**
   * Generate storage key for campaign files
   */
  generateCampaignFileKey(
    campaignId: string,
    fileType: 'client-data' | 'sanitized' | 'vendor-response' | 'report',
    filename: string
  ): string {
    const timestamp = Date.now();
    return `campaigns/${campaignId}/${fileType}/${timestamp}-${filename}`;
  }

  /**
   * Upload client data file
   */
  async uploadClientData(
    campaignId: string,
    buffer: Buffer,
    filename: string = 'client-data.xlsx'
  ): Promise<UploadResult> {
    const key = this.generateCampaignFileKey(campaignId, 'client-data', filename);
    return this.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', {
      campaignId,
      fileType: 'client-data',
      originalFilename: filename,
    });
  }

  /**
   * Upload sanitized data file for vendor
   */
  async uploadSanitizedData(
    campaignId: string,
    buffer: Buffer,
    filename: string = 'sanitized-data.xlsx'
  ): Promise<UploadResult> {
    const key = this.generateCampaignFileKey(campaignId, 'sanitized', filename);
    return this.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', {
      campaignId,
      fileType: 'sanitized',
      originalFilename: filename,
    });
  }

  /**
   * Upload vendor response file
   */
  async uploadVendorResponse(
    campaignId: string,
    buffer: Buffer,
    filename: string = 'vendor-response.xlsx'
  ): Promise<UploadResult> {
    const key = this.generateCampaignFileKey(campaignId, 'vendor-response', filename);
    return this.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', {
      campaignId,
      fileType: 'vendor-response',
      originalFilename: filename,
    });
  }

  /**
   * Upload final report
   */
  async uploadReport(
    campaignId: string,
    buffer: Buffer,
    filename: string = 'matchback-report.xlsx'
  ): Promise<UploadResult> {
    const key = this.generateCampaignFileKey(campaignId, 'report', filename);
    return this.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', {
      campaignId,
      fileType: 'report',
      originalFilename: filename,
    });
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
