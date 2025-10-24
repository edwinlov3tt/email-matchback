import { Injectable, Logger } from '@nestjs/common';
import { ExcelParser } from '../file-processing/parsers/excel.parser';

export interface ParsedVendorResponse {
  success: boolean;
  matches: VendorMatch[];
  statistics: {
    totalRecords: number;
    matched: number;
    notMatched: number;
    matchRate: number; // percentage
  };
  errors: string[];
  warnings: string[];
}

export interface VendorMatch {
  dcmId: string;
  matched: boolean;
  rawMatchValue?: string; // Original value from vendor (Y, N, 1, 0, etc.)
}

export interface InboundEmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

/**
 * Email Parser Service
 *
 * Parses vendor response emails and extracts match data:
 * - Parse Excel attachments from vendor replies
 * - Map DCM_IDs to match flags
 * - Validate match data integrity
 * - Calculate match statistics
 *
 * CRITICAL Match Value Handling:
 * - Accept: Y, YES, 1, TRUE, true (case-insensitive) = matched
 * - Accept: N, NO, 0, FALSE, false, empty = not matched
 * - Reject: Any other value = validation error
 *
 * CRITICAL DCM_ID Mapping:
 * - Every record MUST have a DCM_ID column
 * - DCM_IDs are the ONLY way to map vendor matches back to original records
 * - Missing or invalid DCM_IDs = data integrity error
 */
@Injectable()
export class EmailParserService {
  private readonly logger = new Logger(EmailParserService.name);

  constructor(private readonly excelParser: ExcelParser) {}

  /**
   * Parse vendor response from email attachment
   */
  async parseVendorResponse(attachment: InboundEmailAttachment): Promise<ParsedVendorResponse> {
    this.logger.log(`Parsing vendor response from ${attachment.filename}`);

    const result: ParsedVendorResponse = {
      success: false,
      matches: [],
      statistics: {
        totalRecords: 0,
        matched: 0,
        notMatched: 0,
        matchRate: 0,
      },
      errors: [],
      warnings: [],
    };

    try {
      // Validate file type
      if (!this.isExcelFile(attachment.filename)) {
        result.errors.push(
          `Invalid file type: ${attachment.filename}. Expected Excel file (.xlsx, .xls)`,
        );
        return result;
      }

      // Parse Excel file
      const parseResult = await this.excelParser.parseFromBuffer(attachment.content, {
        headerRow: 1,
        requiredColumns: ['DCM_ID', 'Match'],
        trimValues: true,
      });

      // Check for parsing errors
      if (parseResult.metadata.hasErrors) {
        result.errors.push(...parseResult.metadata.errors);
        return result;
      }

      // Collect warnings
      if (parseResult.metadata.warnings.length > 0) {
        result.warnings.push(...parseResult.metadata.warnings);
      }

      // Validate required columns exist
      const hasMatchColumn = parseResult.headers.some((h) =>
        h.toLowerCase() === 'match',
      );
      const hasDcmIdColumn = parseResult.headers.some((h) =>
        h.toLowerCase() === 'dcm_id' || h.toLowerCase().replace('_', '') === 'dcmid',
      );

      if (!hasMatchColumn) {
        result.errors.push(
          'Missing required "Match" column. Vendor must add a Match column with Y/N values.',
        );
        return result;
      }

      if (!hasDcmIdColumn) {
        result.errors.push(
          'Missing "DCM_ID" column. This column is required to map matches back to original records.',
        );
        return result;
      }

      // Process each record
      const matches: VendorMatch[] = [];
      let matchedCount = 0;
      let notMatchedCount = 0;

      for (const row of parseResult.data) {
        // Get DCM_ID
        const dcmId = this.extractDcmId(row);
        if (!dcmId) {
          result.errors.push(
            `Row ${row._rowNumber}: Missing or invalid DCM_ID`,
          );
          continue;
        }

        // Get match value
        const matchValue = this.extractMatchValue(row);
        const matched = this.parseMatchValue(matchValue);

        if (matched === null) {
          result.errors.push(
            `Row ${row._rowNumber}: Invalid match value "${matchValue}". Expected Y/N, YES/NO, 1/0, or TRUE/FALSE`,
          );
          continue;
        }

        // Add to matches
        matches.push({
          dcmId,
          matched,
          rawMatchValue: matchValue,
        });

        if (matched) {
          matchedCount++;
        } else {
          notMatchedCount++;
        }
      }

      // Calculate statistics
      const totalRecords = matches.length;
      const matchRate = totalRecords > 0 ? (matchedCount / totalRecords) * 100 : 0;

      result.matches = matches;
      result.statistics = {
        totalRecords,
        matched: matchedCount,
        notMatched: notMatchedCount,
        matchRate: Math.round(matchRate * 100) / 100, // Round to 2 decimals
      };

      // Validate match rate (warn if suspiciously low or high)
      if (matchRate < 5) {
        result.warnings.push(
          `Low match rate (${matchRate.toFixed(1)}%). This may indicate an issue with the vendor data.`,
        );
      } else if (matchRate > 95) {
        result.warnings.push(
          `Very high match rate (${matchRate.toFixed(1)}%). Please verify vendor responses.`,
        );
      }

      // Mark as successful if we have matches and no errors
      result.success = matches.length > 0 && result.errors.length === 0;

      this.logger.log(
        `Parsed ${totalRecords} records: ${matchedCount} matched (${matchRate.toFixed(1)}%)`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to parse vendor response: ${error.message}`, error.stack);
      result.errors.push(`Parsing error: ${error.message}`);
      return result;
    }
  }

  /**
   * Extract DCM_ID from row (handles different column name variations)
   */
  private extractDcmId(row: Record<string, any>): string | null {
    // Try common variations
    const variations = ['DCM_ID', 'DCM ID', 'DCMID', 'dcm_id', 'dcmId', 'dcm id'];

    for (const key of Object.keys(row)) {
      if (variations.some((v) => key.toLowerCase().replace(/[_\s]/g, '') === v.toLowerCase().replace(/[_\s]/g, ''))) {
        const value = row[key];
        if (value && typeof value === 'string') {
          return value.trim();
        }
      }
    }

    return null;
  }

  /**
   * Extract match value from row (handles different column name variations)
   */
  private extractMatchValue(row: Record<string, any>): string {
    // Try common variations
    const variations = ['Match', 'MATCH', 'match', 'Matched', 'MATCHED', 'matched'];

    for (const key of Object.keys(row)) {
      if (variations.some((v) => key.toLowerCase() === v.toLowerCase())) {
        const value = row[key];
        if (value !== null && value !== undefined) {
          return String(value).trim();
        }
      }
    }

    return '';
  }

  /**
   * Parse match value to boolean
   * Accepts: Y, YES, 1, TRUE (case-insensitive) = true
   * Accepts: N, NO, 0, FALSE, empty = false
   * Returns null for invalid values
   */
  private parseMatchValue(value: string): boolean | null {
    const normalized = value.toLowerCase().trim();

    // Matched values
    if (['y', 'yes', '1', 'true'].includes(normalized)) {
      return true;
    }

    // Not matched values
    if (['n', 'no', '0', 'false', ''].includes(normalized)) {
      return false;
    }

    // Invalid value
    return null;
  }

  /**
   * Check if filename is an Excel file
   */
  private isExcelFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return lowerFilename.endsWith('.xlsx') || lowerFilename.endsWith('.xls');
  }

  /**
   * Extract email attachments from Resend webhook payload
   */
  extractAttachments(webhookPayload: any): InboundEmailAttachment[] {
    const attachments: InboundEmailAttachment[] = [];

    // Resend webhook format includes attachments array
    if (webhookPayload.attachments && Array.isArray(webhookPayload.attachments)) {
      for (const attachment of webhookPayload.attachments) {
        if (attachment.content && attachment.filename) {
          attachments.push({
            filename: attachment.filename,
            content: Buffer.from(attachment.content, 'base64'),
            contentType: attachment.contentType || 'application/octet-stream',
          });
        }
      }
    }

    return attachments;
  }

  /**
   * Validate vendor response before processing
   */
  async validateVendorResponse(attachment: InboundEmailAttachment): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check file type
    if (!this.isExcelFile(attachment.filename)) {
      errors.push('Attachment must be an Excel file (.xlsx or .xls)');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.content.length > maxSize) {
      errors.push(
        `File size (${(attachment.content.length / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (10MB)`,
      );
    }

    // Check file is not empty
    if (attachment.content.length === 0) {
      errors.push('Attachment is empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
