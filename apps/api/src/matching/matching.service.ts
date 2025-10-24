import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SanitizationService, ClientRecord } from './sanitization.service';
import { DcmIdService } from './dcm-id.service';

export interface MatchingWorkflow {
  campaignId: string;
  market: string;
  clientRecords: ClientRecord[];
}

export interface MatchingResult {
  sanitizedExcel: Buffer;
  dcmIdMapping: Map<string, ClientRecord>;
  statistics: {
    totalRecords: number;
    missingEmails: number;
    missingEmailPercentage: number;
    dcmIdsGenerated: number;
  };
}

/**
 * Matching Service - Coordinates the matchback workflow
 *
 * This service orchestrates the entire matching process:
 * 1. Sanitize client data (remove PII)
 * 2. Generate DCM_IDs for tracking
 * 3. Create vendor Excel
 * 4. Process vendor response
 * 5. Merge results with original data
 */
@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly sanitizationService: SanitizationService,
    private readonly dcmIdService: DcmIdService,
  ) {}

  /**
   * Prepare client data for vendor matching
   * Step 1 of matchback process
   */
  async prepareForVendorMatching(
    workflow: MatchingWorkflow,
  ): Promise<MatchingResult> {
    const { campaignId, market, clientRecords } = workflow;

    this.logger.log(
      `Starting vendor matching preparation for campaign ${campaignId}, market ${market}`,
    );

    // Validate inputs
    this.validateWorkflow(workflow);

    // Sanitize data
    const sanitizationResult = await this.sanitizationService.sanitizeForVendor(
      clientRecords,
      campaignId,
      market,
    );

    // Create vendor Excel
    const sanitizedExcel = await this.sanitizationService.createVendorExcel(
      sanitizationResult.sanitizedRecords,
      `${campaignId}-${market}`,
    );

    this.logger.log(
      `Vendor matching preparation complete: ${sanitizationResult.statistics.totalRecords} records sanitized`,
    );

    return {
      sanitizedExcel,
      dcmIdMapping: sanitizationResult.dcmIdMapping,
      statistics: {
        ...sanitizationResult.statistics,
        dcmIdsGenerated: sanitizationResult.sanitizedRecords.length,
      },
    };
  }

  /**
   * Process vendor response and merge with original data
   * Step 2 of matchback process
   */
  async processVendorResponse(
    vendorExcel: Buffer,
    dcmIdMapping: Map<string, ClientRecord>,
  ): Promise<ClientRecord[]> {
    this.logger.log('Processing vendor response...');

    const matchedRecords = await this.sanitizationService.processVendorResponse(
      vendorExcel,
      dcmIdMapping,
    );

    this.logger.log(`Vendor response processed: ${matchedRecords.length} records`);

    return matchedRecords;
  }

  /**
   * Validate workflow inputs
   */
  private validateWorkflow(workflow: MatchingWorkflow): void {
    if (!workflow.campaignId || workflow.campaignId.trim() === '') {
      throw new BadRequestException('Campaign ID is required');
    }

    if (!workflow.market || workflow.market.trim() === '') {
      throw new BadRequestException('Market is required');
    }

    if (!workflow.clientRecords || workflow.clientRecords.length === 0) {
      throw new BadRequestException('Client records are required');
    }

    // Check for market mixing
    const markets = new Set(
      workflow.clientRecords
        .map((r) => r.market)
        .filter((m) => m !== undefined),
    );

    if (markets.size > 1) {
      throw new BadRequestException(
        `Market mixing detected: ${Array.from(markets).join(', ')}. ` +
          'All records must be from the same market.',
      );
    }

    this.logger.log(
      `Validation passed: ${workflow.clientRecords.length} records for ${workflow.market}`,
    );
  }

  /**
   * Get DCM_ID for a record
   */
  getDcmIdForRecord(
    campaignId: string,
    market: string,
    sequence: number,
  ): string {
    return this.dcmIdService.generateDcmId(campaignId, market, sequence);
  }

  /**
   * Parse DCM_ID
   */
  parseDcmId(dcmId: string) {
    return this.dcmIdService.parseDcmId(dcmId);
  }

  /**
   * Validate DCM_ID format
   */
  validateDcmId(dcmId: string): boolean {
    return this.dcmIdService.isValidDcmId(dcmId);
  }
}
