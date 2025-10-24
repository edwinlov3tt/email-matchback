import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PatternAnalysisService } from '../../patterns/pattern-analysis.service';
import { CustomerClassificationService } from '../../patterns/customer-classification.service';
import { PatternCorrectionService } from '../../patterns/pattern-correction.service';

export interface PatternAnalysisJobData {
  records: any[];
  campaignId: string;
  campaignDate: Date;
  options?: {
    skipCorrection?: boolean;
  };
}

export interface PatternAnalysisResult {
  success: boolean;
  recordCount: number;
  analyzed: any[];
  statistics: {
    totalRecords: number;
    inPattern: number;
    outOfPattern: number;
    newSignups: number;
    winbacks: number;
    corrected: number;
  };
  error?: string;
}

/**
 * Pattern Analysis Processor
 *
 * Handles asynchronous pattern analysis jobs:
 * - Analyze customer visit patterns (3+ visits = in-pattern)
 * - Classify customers (NEW_SIGNUP, NEW_VISITOR, WINBACK, EXISTING)
 * - Apply pattern correction (new signups with 3+ visits in same month)
 * - Progress tracking for large batches
 *
 * CRITICAL Pattern Rules:
 * - 3+ visits in a month = "In Pattern" (regular customer)
 * - NEW_SIGNUP with 3+ visits in signup month = CORRECTED to "Out of Pattern"
 * - This correction is essential for accurate CAC/ROAS calculations
 */
@Processor('pattern-analysis')
export class PatternAnalysisProcessor {
  private readonly logger = new Logger(PatternAnalysisProcessor.name);

  constructor(
    private readonly patternAnalysis: PatternAnalysisService,
    private readonly customerClassification: CustomerClassificationService,
    private readonly patternCorrection: PatternCorrectionService,
  ) {}

  @Process()
  async handlePatternAnalysis(job: Job<PatternAnalysisJobData>): Promise<PatternAnalysisResult> {
    const { records, campaignId, campaignDate, options } = job.data;

    this.logger.log(
      `Analyzing patterns for ${records.length} records in campaign ${campaignId}`,
    );

    try {
      // Update progress
      await job.progress(10);

      // Step 1: Analyze patterns
      this.logger.log(`Step 1/3: Analyzing visit patterns...`);
      const withPatterns = records.map((record) => {
        return this.patternAnalysis.analyzePattern(record);
      });
      await job.progress(40);

      // Step 2: Classify customers
      this.logger.log(`Step 2/3: Classifying customers...`);
      const classified = withPatterns.map((record) => {
        return this.customerClassification.classifyCustomer(
          record,
          new Date(campaignDate),
        );
      });
      await job.progress(70);

      // Step 3: Apply pattern correction (unless skipped)
      let analyzed = classified;
      let correctedCount = 0;

      if (!options?.skipCorrection) {
        this.logger.log(`Step 3/3: Applying pattern corrections...`);
        analyzed = classified.map((record) => {
          const corrected = this.patternCorrection.correctPatternFlaws(record);
          if (corrected.patternOverride) {
            correctedCount++;
          }
          return corrected;
        });
      }
      await job.progress(95);

      // Calculate statistics
      const statistics = {
        totalRecords: analyzed.length,
        inPattern: analyzed.filter((r) => r.inPattern === true).length,
        outOfPattern: analyzed.filter((r) => r.inPattern === false).length,
        newSignups: analyzed.filter((r) => r.customerType === 'NEW_SIGNUP').length,
        winbacks: analyzed.filter((r) => r.customerType === 'WINBACK').length,
        corrected: correctedCount,
      };

      this.logger.log(
        `Pattern analysis complete: ${statistics.outOfPattern} out-of-pattern, ${statistics.corrected} corrected`,
      );

      await job.progress(100);

      return {
        success: true,
        recordCount: analyzed.length,
        analyzed,
        statistics,
      };
    } catch (error) {
      this.logger.error(
        `Pattern analysis failed for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        recordCount: 0,
        analyzed: [],
        statistics: {
          totalRecords: 0,
          inPattern: 0,
          outOfPattern: 0,
          newSignups: 0,
          winbacks: 0,
          corrected: 0,
        },
        error: error.message,
      };
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: PatternAnalysisResult) {
    this.logger.log(
      `Job ${job.id} completed: ${result.recordCount} records analyzed, ${result.statistics.corrected} corrected`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}
