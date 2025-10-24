import { Injectable, Logger } from '@nestjs/common';

export interface MatchRecord {
  matched: boolean;
  inPattern: boolean;
  totalSales?: number;
  signupDate?: Date;
  customerType?: string;
  [key: string]: any;
}

export interface CACMetrics {
  // Campaign costs
  campaignCost: number;

  // Match metrics
  totalMatches: number;
  outOfPatternMatches: number;
  inPatternMatches: number;

  // Revenue metrics
  totalRevenue: number;
  outOfPatternRevenue: number;
  inPatternRevenue: number;

  // CAC calculations
  cacAllMatches: number; // Cost / Total Matches
  cacOutOfPattern: number; // Cost / Out-of-Pattern Matches

  // ROAS calculations
  roasOverall: number; // Total Revenue / Cost
  roasOutOfPattern: number; // Out-of-Pattern Revenue / Cost

  // New customer metrics
  newSignups: number;
  newSignupRevenue: number;
  cacNewSignups: number;
}

export interface CACComparison {
  currentMonth: CACMetrics;
  previousMonth?: CACMetrics;
  improvement: {
    cacChange: number; // percentage change
    roasChange: number; // percentage change
    revenueChange: number; // dollar change
  };
}

@Injectable()
export class CacCalculatorService {
  private readonly logger = new Logger(CacCalculatorService.name);

  /**
   * Calculate CAC and ROAS metrics for a campaign
   */
  calculateMetrics(
    records: MatchRecord[],
    campaignCost: number,
  ): CACMetrics {
    this.logger.log(
      `Calculating CAC metrics for ${records.length} records, campaign cost: $${campaignCost}`,
    );

    // Filter matched records only
    const matchedRecords = records.filter((r) => r.matched === true);

    // Separate by pattern
    const outOfPattern = matchedRecords.filter((r) => r.inPattern === false);
    const inPattern = matchedRecords.filter((r) => r.inPattern === true);

    // Calculate revenue
    const totalRevenue = this.sumRevenue(matchedRecords);
    const outOfPatternRevenue = this.sumRevenue(outOfPattern);
    const inPatternRevenue = this.sumRevenue(inPattern);

    // New signups (customers who signed up during campaign month)
    const newSignups = this.countNewSignups(matchedRecords);
    const newSignupRevenue = this.sumRevenue(
      matchedRecords.filter((r) => this.isNewSignup(r)),
    );

    // Calculate CAC
    const cacAllMatches =
      matchedRecords.length > 0 ? campaignCost / matchedRecords.length : 0;
    const cacOutOfPattern =
      outOfPattern.length > 0 ? campaignCost / outOfPattern.length : 0;
    const cacNewSignups =
      newSignups > 0 ? campaignCost / newSignups : 0;

    // Calculate ROAS
    const roasOverall = campaignCost > 0 ? totalRevenue / campaignCost : 0;
    const roasOutOfPattern =
      campaignCost > 0 ? outOfPatternRevenue / campaignCost : 0;

    const metrics: CACMetrics = {
      campaignCost,
      totalMatches: matchedRecords.length,
      outOfPatternMatches: outOfPattern.length,
      inPatternMatches: inPattern.length,
      totalRevenue,
      outOfPatternRevenue,
      inPatternRevenue,
      cacAllMatches,
      cacOutOfPattern,
      roasOverall,
      roasOutOfPattern,
      newSignups,
      newSignupRevenue,
      cacNewSignups,
    };

    this.logger.log(
      `Metrics calculated: ${matchedRecords.length} matches, $${totalRevenue.toFixed(2)} revenue, CAC: $${cacOutOfPattern.toFixed(2)}, ROAS: ${roasOutOfPattern.toFixed(2)}x`,
    );

    return metrics;
  }

  /**
   * Compare current campaign metrics with previous campaign
   */
  compareMetrics(
    current: CACMetrics,
    previous: CACMetrics,
  ): CACComparison {
    const cacChange = previous.cacOutOfPattern
      ? ((current.cacOutOfPattern - previous.cacOutOfPattern) /
          previous.cacOutOfPattern) *
        100
      : 0;

    const roasChange = previous.roasOutOfPattern
      ? ((current.roasOutOfPattern - previous.roasOutOfPattern) /
          previous.roasOutOfPattern) *
        100
      : 0;

    const revenueChange =
      current.outOfPatternRevenue - previous.outOfPatternRevenue;

    this.logger.log(
      `Comparison: CAC ${cacChange > 0 ? '+' : ''}${cacChange.toFixed(1)}%, ROAS ${roasChange > 0 ? '+' : ''}${roasChange.toFixed(1)}%, Revenue ${revenueChange > 0 ? '+' : ''}$${revenueChange.toFixed(2)}`,
    );

    return {
      currentMonth: current,
      previousMonth: previous,
      improvement: {
        cacChange,
        roasChange,
        revenueChange,
      },
    };
  }

  /**
   * Format metrics for client-facing report
   */
  formatForReport(metrics: CACMetrics): Record<string, string> {
    return {
      'Campaign Cost': this.formatCurrency(metrics.campaignCost),
      'Total Matches': metrics.totalMatches.toString(),
      'Out-of-Pattern Matches': metrics.outOfPatternMatches.toString(),
      'In-Pattern Matches': metrics.inPatternMatches.toString(),
      'Total Revenue': this.formatCurrency(metrics.totalRevenue),
      'Out-of-Pattern Revenue': this.formatCurrency(
        metrics.outOfPatternRevenue,
      ),
      'CAC (All Matches)': this.formatCurrency(metrics.cacAllMatches),
      'CAC (Out-of-Pattern)': this.formatCurrency(metrics.cacOutOfPattern),
      'ROAS (Overall)': `${metrics.roasOverall.toFixed(2)}x`,
      'ROAS (Out-of-Pattern)': `${metrics.roasOutOfPattern.toFixed(2)}x`,
      'New Signups': metrics.newSignups.toString(),
      'New Signup Revenue': this.formatCurrency(metrics.newSignupRevenue),
      'CAC (New Signups)': this.formatCurrency(metrics.cacNewSignups),
    };
  }

  /**
   * Sum revenue from records
   */
  private sumRevenue(records: MatchRecord[]): number {
    return records.reduce((sum, record) => {
      const sales = record.totalSales || 0;
      return sum + sales;
    }, 0);
  }

  /**
   * Count new signups (customers who signed up during campaign)
   */
  private countNewSignups(records: MatchRecord[]): number {
    return records.filter((r) => this.isNewSignup(r)).length;
  }

  /**
   * Check if record is a new signup
   */
  private isNewSignup(record: MatchRecord): boolean {
    return (
      record.customerType === 'NEW_SIGNUP' ||
      (!!record.signupDate && this.isRecentSignup(record.signupDate))
    );
  }

  /**
   * Check if signup date is recent (within campaign month)
   * This is a simplified check - in production, compare with campaign date
   */
  private isRecentSignup(signupDate: Date): boolean {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return new Date(signupDate) >= monthAgo;
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}
