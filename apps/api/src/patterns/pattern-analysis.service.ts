import { Injectable, Logger } from '@nestjs/common';
import { MatchRecord } from '@matchback/types';

/**
 * Pattern Analysis Service
 *
 * Implements the base pattern detection logic:
 * - 3+ visits in a month = "In Pattern" (regular customer)
 * - Less than 3 visits = "Out of Pattern" (campaign influenced)
 *
 * IMPORTANT: This service applies the BASE rule only.
 * Pattern correction (for new signup flaws) happens in PatternCorrectionService.
 */
@Injectable()
export class PatternAnalysisService {
  private readonly logger = new Logger(PatternAnalysisService.name);

  /**
   * Analyze pattern for a single match record
   * Base rule: 3+ visits = in pattern (regular customer, no campaign credit)
   */
  analyzePattern(record: MatchRecord): MatchRecord {
    const inPattern = this.isInPattern(record.totalVisits, record.visit1Date);

    this.logger.debug(
      `Pattern analysis for ${record.dcmId}: ${record.totalVisits} visits -> ${inPattern ? 'IN' : 'OUT OF'} pattern`
    );

    return {
      ...record,
      inPattern,
    };
  }

  /**
   * Batch process multiple records
   */
  analyzePatterns(records: MatchRecord[]): MatchRecord[] {
    this.logger.log(`Analyzing patterns for ${records.length} records`);

    const analyzed = records.map(record => this.analyzePattern(record));

    const inPatternCount = analyzed.filter(r => r.inPattern).length;
    const outPatternCount = analyzed.filter(r => !r.inPattern).length;

    this.logger.log(
      `Pattern analysis complete: ${inPatternCount} in pattern, ${outPatternCount} out of pattern`
    );

    return analyzed;
  }

  /**
   * Base pattern detection logic
   * 3+ visits = in pattern (regular customer)
   *
   * Note: This is the BASE rule. Pattern correction may override this result.
   */
  private isInPattern(totalVisits: number, visit1Date?: Date): boolean {
    // If no visit data available, cannot determine pattern
    if (!visit1Date || totalVisits === 0) {
      return false;
    }

    // Base rule: 3 or more visits = in pattern (regular customer)
    return totalVisits >= 3;
  }

  /**
   * Get pattern statistics for a set of records
   */
  getPatternStatistics(records: MatchRecord[]): {
    total: number;
    inPattern: number;
    outOfPattern: number;
    noVisitData: number;
    percentageInPattern: number;
    percentageOutOfPattern: number;
  } {
    const total = records.length;
    const inPattern = records.filter(r => r.inPattern === true).length;
    const outOfPattern = records.filter(r => r.inPattern === false).length;
    const noVisitData = records.filter(r => r.inPattern === undefined).length;

    return {
      total,
      inPattern,
      outOfPattern,
      noVisitData,
      percentageInPattern: total > 0 ? (inPattern / total) * 100 : 0,
      percentageOutOfPattern: total > 0 ? (outOfPattern / total) * 100 : 0,
    };
  }
}
