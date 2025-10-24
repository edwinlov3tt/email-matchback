import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { SanitizationService } from './sanitization.service';
import { DcmIdService } from './dcm-id.service';

/**
 * Matching Module
 *
 * Provides services for the vendor matching workflow:
 * - Data sanitization (remove PII)
 * - DCM_ID generation and tracking
 * - Vendor Excel creation
 * - Response processing
 *
 * CRITICAL for privacy: Ensures complete separation between
 * client business data and vendor contact information.
 */
@Module({
  providers: [MatchingService, SanitizationService, DcmIdService],
  exports: [MatchingService, SanitizationService, DcmIdService],
})
export class MatchingModule {}
