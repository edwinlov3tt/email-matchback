import { Injectable, Logger } from '@nestjs/common';
import { MatchRecord, CustomerType } from '@matchback/types';

/**
 * Customer Classification Service
 *
 * Classifies customers based on signup date vs visit date:
 * - NEW_SIGNUP: Signed up within campaign month
 * - NEW_VISITOR: Signed up 1-30 days before first visit
 * - WINBACK: Signed up 5+ years ago, returned after campaign
 * - EXISTING: All others
 */
@Injectable()
export class CustomerClassificationService {
  private readonly logger = new Logger(CustomerClassificationService.name);

  /**
   * Classify a single customer based on signup and visit patterns
   */
  classifyCustomer(record: MatchRecord, campaignDate: Date): MatchRecord {
    const customerType = this.determineCustomerType(
      record.signupDate,
      record.visit1Date,
      campaignDate
    );

    this.logger.debug(
      `Customer ${record.dcmId} classified as: ${customerType}`
    );

    return {
      ...record,
      customerType,
    };
  }

  /**
   * Batch classify multiple customers
   */
  classifyCustomers(
    records: MatchRecord[],
    campaignDate: Date
  ): MatchRecord[] {
    this.logger.log(`Classifying ${records.length} customers`);

    const classified = records.map(record =>
      this.classifyCustomer(record, campaignDate)
    );

    const typeCounts = this.getTypeDistribution(classified);
    this.logger.log(`Classification complete: ${JSON.stringify(typeCounts)}`);

    return classified;
  }

  /**
   * Determine customer type based on signup and visit dates
   */
  private determineCustomerType(
    signupDate: Date,
    visit1Date: Date | undefined,
    campaignDate: Date
  ): CustomerType {
    if (!visit1Date) {
      // No visit data - classify based on signup timing
      return this.isSignupInCampaignMonth(signupDate, campaignDate)
        ? 'NEW_SIGNUP'
        : 'EXISTING';
    }

    // Calculate time differences
    const signupTime = new Date(signupDate).getTime();
    const visitTime = new Date(visit1Date).getTime();
    const campaignTime = new Date(campaignDate).getTime();

    const daysSinceSignup = (visitTime - signupTime) / (1000 * 60 * 60 * 24);
    const yearsSinceSignup = daysSinceSignup / 365;

    // NEW_SIGNUP: Signed up during campaign month
    if (this.isSignupInCampaignMonth(signupDate, campaignDate)) {
      return 'NEW_SIGNUP';
    }

    // NEW_VISITOR: Signed up 1-30 days before first visit
    if (daysSinceSignup >= 1 && daysSinceSignup <= 30) {
      return 'NEW_VISITOR';
    }

    // WINBACK: Signed up 5+ years ago, returned after campaign
    if (yearsSinceSignup >= 5) {
      return 'WINBACK';
    }

    // EXISTING: All others
    return 'EXISTING';
  }

  /**
   * Check if signup occurred in the same month as campaign
   */
  private isSignupInCampaignMonth(
    signupDate: Date,
    campaignDate: Date
  ): boolean {
    const signup = new Date(signupDate);
    const campaign = new Date(campaignDate);

    return (
      signup.getUTCFullYear() === campaign.getUTCFullYear() &&
      signup.getUTCMonth() === campaign.getUTCMonth()
    );
  }

  /**
   * Get distribution of customer types
   */
  getTypeDistribution(records: MatchRecord[]): Record<CustomerType, number> {
    const distribution: Record<CustomerType, number> = {
      NEW_SIGNUP: 0,
      NEW_VISITOR: 0,
      WINBACK: 0,
      EXISTING: 0,
    };

    records.forEach(record => {
      if (record.customerType) {
        distribution[record.customerType]++;
      }
    });

    return distribution;
  }

  /**
   * Get classification statistics
   */
  getClassificationStatistics(records: MatchRecord[]): {
    total: number;
    newSignups: number;
    newVisitors: number;
    winbacks: number;
    existing: number;
    percentages: Record<CustomerType, number>;
  } {
    const distribution = this.getTypeDistribution(records);
    const total = records.length;

    const percentages: Record<CustomerType, number> = {
      NEW_SIGNUP:
        total > 0 ? (distribution.NEW_SIGNUP / total) * 100 : 0,
      NEW_VISITOR:
        total > 0 ? (distribution.NEW_VISITOR / total) * 100 : 0,
      WINBACK: total > 0 ? (distribution.WINBACK / total) * 100 : 0,
      EXISTING: total > 0 ? (distribution.EXISTING / total) * 100 : 0,
    };

    return {
      total,
      newSignups: distribution.NEW_SIGNUP,
      newVisitors: distribution.NEW_VISITOR,
      winbacks: distribution.WINBACK,
      existing: distribution.EXISTING,
      percentages,
    };
  }
}
