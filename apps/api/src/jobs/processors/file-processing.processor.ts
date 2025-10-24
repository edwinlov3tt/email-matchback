import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ExcelParser } from '../../file-processing/parsers/excel.parser';
import { CSVParser } from '../../file-processing/parsers/csv.parser';

export interface FileProcessingJobData {
  fileBuffer: Buffer;
  fileType: 'excel' | 'csv';
  campaignId: string;
  uploadType: 'client-data' | 'vendor-response';
  options?: {
    sheetIndex?: number;
    sheetName?: string;
    requiredColumns?: string[];
  };
}

export interface FileProcessingResult {
  success: boolean;
  recordCount: number;
  headers: string[];
  data: Record<string, any>[];
  metadata?: {
    totalColumns?: number;
    totalRows?: number;
    errors?: string[];
    warnings?: string[];
  };
  error?: string;
}

/**
 * File Processing Processor
 *
 * Handles asynchronous file processing jobs:
 * - Excel file parsing (client data, vendor responses)
 * - CSV file parsing
 * - Data validation and error handling
 * - Progress tracking
 *
 * CRITICAL: Never process files synchronously
 * - Large files (100k+ records) can take minutes
 * - Prevents blocking HTTP requests
 * - Provides real-time progress updates
 */
@Processor('file-processing')
export class FileProcessingProcessor {
  private readonly logger = new Logger(FileProcessingProcessor.name);

  constructor(
    private readonly excelParser: ExcelParser,
    private readonly csvParser: CSVParser,
  ) {}

  @Process()
  async handleFileProcessing(job: Job<FileProcessingJobData>): Promise<FileProcessingResult> {
    const { fileBuffer, fileType, campaignId, uploadType, options } = job.data;

    this.logger.log(
      `Processing ${fileType} file for campaign ${campaignId} (${uploadType})`,
    );

    try {
      // Update progress
      await job.progress(10);

      let result;
      if (fileType === 'excel') {
        result = await this.processExcelFile(fileBuffer, options);
      } else {
        result = await this.processCsvFile(fileBuffer, options);
      }

      await job.progress(90);

      this.logger.log(
        `File processing complete: ${result.data.length} records parsed`,
      );

      await job.progress(100);

      return {
        success: true,
        recordCount: result.data.length,
        headers: result.headers,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      this.logger.error(
        `File processing failed for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        recordCount: 0,
        headers: [],
        data: [],
        error: error.message,
      };
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: FileProcessingResult) {
    this.logger.log(
      `Job ${job.id} completed: ${result.recordCount} records processed`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }

  /**
   * Process Excel file
   */
  private async processExcelFile(
    buffer: Buffer,
    options?: { sheetIndex?: number; sheetName?: string; requiredColumns?: string[] },
  ) {
    const { sheetIndex, sheetName, requiredColumns } = options || {};

    const result = await this.excelParser.parseFromBuffer(buffer, {
      sheetIndex: sheetIndex || 0,
      sheetName,
      requiredColumns: requiredColumns || [],
      trimValues: true,
      convertDates: true,
    });

    // Validate required columns
    if (requiredColumns && requiredColumns.length > 0) {
      const missingColumns = requiredColumns.filter(
        (col) => !result.headers.includes(col),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(', ')}`,
        );
      }
    }

    return result;
  }

  /**
   * Process CSV file
   */
  private async processCsvFile(
    buffer: Buffer,
    options?: { requiredColumns?: string[] },
  ) {
    const { requiredColumns } = options || {};

    const result = await this.csvParser.parseFromBuffer(buffer, {
      requiredColumns: requiredColumns || [],
      trimValues: true,
      convertDates: true,
    });

    // Validate required columns
    if (requiredColumns && requiredColumns.length > 0) {
      const missingColumns = requiredColumns.filter(
        (col) => !result.headers.includes(col),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(', ')}`,
        );
      }
    }

    return result;
  }
}
