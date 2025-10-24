import { Injectable, Logger } from '@nestjs/common';
import { MatchRecord } from '@matchback/types';

/**
 * Pattern Correction Service
 *
 * CRITICAL BUSINESS LOGIC - DO NOT MODIFY WITHOUT APPROVAL
 *
 * This service handles the critical pattern flaw correction:
 * - New signups with 3+ visits in the same month as signup MUST be "Out of Pattern"
 * - This overrides the base pattern detection rule
 * - Essential for accurate campaign attribution
 *
 * Why this correction is needed:
 * - A new customer signing up during campaign month is campaign-influenced
 * - Even if they visit 3+ times in that month, credit goes to campaign
 * - Without this correction, we'd incorrectly classify them as "regular customers"
 */
@Injectable()
export class PatternCorrectionService {
  private readonly logger = new Logger(PatternCorrectionService.name);

  /**
   * Apply pattern flaw correction to a single record
   *
   * CRITICAL LOGIC - DO NOT MODIFY
   */
  correctPatternFlaws(record: MatchRecord): MatchRecord {
    // Only correct if record is currently marked as "in pattern"
    if (!record.inPattern) {
      return record;
    }

    // Only correct if we have visit data
    if (!record.visit1Date) {
      return record;
    }

    // Check if this is a new signup with 3+ visits in signup month
    const signupMonth = new Date(record.signupDate).getUTCMonth();
    const signupYear = new Date(record.signupDate).getUTCFullYear();
    const visitMonth = new Date(record.visit1Date).getUTCMonth();
    const visitYear = new Date(record.visit1Date).getUTCFullYear();

    // CRITICAL: New signup with 3+ visits in same month = Out of Pattern
    if (
      signupYear === visitYear &&
      signupMonth === visitMonth &&
      record.totalVisits >= 3 &&
      record.inPattern === true
    ) {
      this.logger.warn(
        `PATTERN CORRECTION: ${record.dcmId} - New signup with ${record.totalVisits} visits in signup month. Overriding to OUT of pattern.`
      );

      return {
        ...record,
        inPattern: false,
        patternOverride: 'NEW_SIGNUP_CORRECTION',
      };
    }

    return record;
  }

  /**
   * Batch correct pattern flaws for multiple records
   */
  correctPatternFlawsBatch(records: MatchRecord[]): MatchRecord[] {
    this.logger.log(
      `Applying pattern flaw correction to ${records.length} records`
    );

    const corrected = records.map(record => this.correctPatternFlaws(record));

    // Count corrections
    const correctionCount = corrected.filter(
      r => r.patternOverride === 'NEW_SIGNUP_CORRECTION'
    ).length;

    if (correctionCount > 0) {
      this.logger.log(
        `Pattern correction complete: ${correctionCount} records corrected from IN to OUT of pattern`
      );
      this.logCorrectionExamples(corrected);
    } else {
      this.logger.log('Pattern correction complete: No corrections needed');
    }

    return corrected;
  }

  /**
   * Log examples of corrected records for audit trail
   */
  private logCorrectionExamples(records: MatchRecord[]): void {
    const corrected = records.filter(
      r => r.patternOverride === 'NEW_SIGNUP_CORRECTION'
    );

    if (corrected.length === 0) {
      return;
    }

    // Log first 3 examples
    const examples = corrected.slice(0, 3);
    this.logger.debug('Pattern correction examples:');

    examples.forEach(record => {
      this.logger.debug(
        `  ${record.dcmId}: Signup ${new Date(record.signupDate).toISOString().split('T')[0]}, ` +
          `Visit ${record.visit1Date ? new Date(record.visit1Date).toISOString().split('T')[0] : 'N/A'}, ` +
          `${record.totalVisits} visits -> OUT of pattern (NEW_SIGNUP_CORRECTION)`
      );
    });

    if (corrected.length > 3) {
      this.logger.debug(`  ... and ${corrected.length - 3} more`);
    }
  }

  /**
   * Get correction statistics
   */
  getCorrectionStatistics(records: MatchRecord[]): {
    total: number;
    corrected: number;
    percentageCorrected: number;
    correctedRecords: MatchRecord[];
  } {
    const correctedRecords = records.filter(
      r => r.patternOverride === 'NEW_SIGNUP_CORRECTION'
    );

    return {
      total: records.length,
      corrected: correctedRecords.length,
      percentageCorrected:
        records.length > 0
          ? (correctedRecords.length / records.length) * 100
          : 0,
      correctedRecords,
    };
  }

  /**
   * Validate that correction logic was applied correctly
   * Returns true if all records are correctly classified
   */
  validateCorrections(records: MatchRecord[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    records.forEach(record => {
      // Skip records without visit data
      if (!record.visit1Date) {
        return;
      }

      const signupMonth = new Date(record.signupDate).getUTCMonth();
      const signupYear = new Date(record.signupDate).getUTCFullYear();
      const visitMonth = new Date(record.visit1Date).getUTCMonth();
      const visitYear = new Date(record.visit1Date).getUTCFullYear();

      // Check if this should have been corrected but wasn't
      if (
        signupYear === visitYear &&
        signupMonth === visitMonth &&
        record.totalVisits >= 3 &&
        record.inPattern === true &&
        record.patternOverride !== 'NEW_SIGNUP_CORRECTION'
      ) {
        errors.push(
          `Record ${record.dcmId} should be OUT of pattern (new signup with ${record.totalVisits} visits in signup month) but is marked IN pattern`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
