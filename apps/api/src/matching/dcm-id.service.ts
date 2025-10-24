import { Injectable, Logger } from '@nestjs/common';

/**
 * DCM_ID Generation Service
 *
 * Generates unique tracking IDs for matchback records.
 * Format: {CampaignID}-{Market}-{Timestamp}-{Sequence}
 * Example: TIDE123-HOU-1700000000-00001
 *
 * DCM_IDs are the ONLY way to track records through the matchback process
 * while maintaining complete privacy separation between client and vendor.
 */
@Injectable()
export class DcmIdService {
  private readonly logger = new Logger(DcmIdService.name);

  /**
   * Generate a single DCM_ID
   * @param campaignId - Campaign billing number or identifier
   * @param market - Market code (e.g., HOU, NYC, LA)
   * @param sequence - Sequential number for this record (1-indexed)
   * @param timestamp - Optional custom timestamp (defaults to now)
   * @returns DCM_ID string
   */
  generateDcmId(
    campaignId: string,
    market: string,
    sequence: number,
    timestamp?: number,
  ): string {
    const ts = timestamp || Date.now();
    const paddedSequence = sequence.toString().padStart(5, '0');

    // Sanitize inputs
    const cleanCampaignId = this.sanitizeComponent(campaignId);
    const cleanMarket = this.sanitizeComponent(market).toUpperCase();

    const dcmId = `${cleanCampaignId}-${cleanMarket}-${ts}-${paddedSequence}`;

    this.logger.debug(`Generated DCM_ID: ${dcmId}`);

    return dcmId;
  }

  /**
   * Generate multiple DCM_IDs for a batch of records
   * @param campaignId - Campaign billing number
   * @param market - Market code
   * @param count - Number of IDs to generate
   * @param timestamp - Optional custom timestamp (same for all IDs in batch)
   * @returns Array of DCM_ID strings
   */
  generateBatch(
    campaignId: string,
    market: string,
    count: number,
    timestamp?: number,
  ): string[] {
    const ts = timestamp || Date.now();
    const dcmIds: string[] = [];

    for (let i = 1; i <= count; i++) {
      dcmIds.push(this.generateDcmId(campaignId, market, i, ts));
    }

    this.logger.log(`Generated ${count} DCM_IDs for ${campaignId}-${market}`);

    return dcmIds;
  }

  /**
   * Parse a DCM_ID back into its components
   * @param dcmId - DCM_ID string to parse
   * @returns Object with campaignId, market, timestamp, sequence
   */
  parseDcmId(dcmId: string): {
    campaignId: string;
    market: string;
    timestamp: number;
    sequence: number;
    isValid: boolean;
  } {
    const parts = dcmId.split('-');

    if (parts.length !== 4) {
      return {
        campaignId: '',
        market: '',
        timestamp: 0,
        sequence: 0,
        isValid: false,
      };
    }

    const [campaignId, market, timestampStr, sequenceStr] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const sequence = parseInt(sequenceStr, 10);

    const isValid =
      !isNaN(timestamp) &&
      !isNaN(sequence) &&
      campaignId.length > 0 &&
      market.length > 0;

    return {
      campaignId,
      market,
      timestamp,
      sequence,
      isValid,
    };
  }

  /**
   * Validate a DCM_ID format
   * @param dcmId - DCM_ID to validate
   * @returns true if valid format
   */
  isValidDcmId(dcmId: string): boolean {
    const parsed = this.parseDcmId(dcmId);
    return parsed.isValid;
  }

  /**
   * Sanitize a component to ensure it's safe for DCM_ID
   * Removes any characters that aren't alphanumeric
   */
  private sanitizeComponent(component: string): string {
    return component.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Extract market from DCM_ID
   */
  extractMarket(dcmId: string): string | null {
    const parsed = this.parseDcmId(dcmId);
    return parsed.isValid ? parsed.market : null;
  }

  /**
   * Extract campaign ID from DCM_ID
   */
  extractCampaignId(dcmId: string): string | null {
    const parsed = this.parseDcmId(dcmId);
    return parsed.isValid ? parsed.campaignId : null;
  }

  /**
   * Extract sequence number from DCM_ID
   */
  extractSequence(dcmId: string): number | null {
    const parsed = this.parseDcmId(dcmId);
    return parsed.isValid ? parsed.sequence : null;
  }
}
