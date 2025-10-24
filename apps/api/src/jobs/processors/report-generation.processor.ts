import { Processor, Process, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ReportsService, CampaignReport } from '../../reports/reports.service';

export interface ReportGenerationJobData {
  records: any[];
  campaignName: string;
  campaignDate: Date;
  market: string;
  campaignCost: number;
  format?: 'excel' | 'json';
}

export interface ReportGenerationResult {
  success: boolean;
  report?: CampaignReport;
  excelBuffer?: Buffer;
  error?: string;
}

/**
 * Report Generation Processor
 *
 * Handles asynchronous report generation jobs:
 * - Generate pivot tables (Matched Sales, New Customers, Missing Emails)
 * - Calculate CAC/ROAS metrics
 * - Create Excel export with formatted sheets
 * - Progress tracking for large datasets
 *
 * Report Components:
 * - Summary sheet (campaign info, quick metrics)
 * - Matched Sales pivot (Match × Pattern)
 * - New Customers pivot (by signup month)
 * - Missing Email stats
 * - CAC/ROAS metrics sheet
 */
@Processor('report-generation')
export class ReportGenerationProcessor {
  private readonly logger = new Logger(ReportGenerationProcessor.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Process()
  async handleReportGeneration(job: Job<ReportGenerationJobData>): Promise<ReportGenerationResult> {
    const {
      records,
      campaignName,
      campaignDate,
      market,
      campaignCost,
      format = 'excel',
    } = job.data;

    this.logger.log(
      `Generating ${format} report for campaign ${campaignName} (${records.length} records)`,
    );

    try {
      // Update progress
      await job.progress(10);

      // Generate campaign report
      this.logger.log('Step 1/2: Generating campaign report...');
      const report = await this.reportsService.generateCampaignReport(
        records,
        campaignName,
        new Date(campaignDate),
        market,
        campaignCost,
      );

      await job.progress(60);

      // Generate Excel if requested
      let excelBuffer: Buffer | undefined;
      if (format === 'excel') {
        this.logger.log('Step 2/2: Exporting to Excel...');
        excelBuffer = await this.reportsService.exportToExcel(report);
      }

      await job.progress(95);

      this.logger.log(
        `Report generation complete: ${report.summary.totalMatches} matches, $${report.summary.attributableRevenue.toFixed(2)} revenue`,
      );

      await job.progress(100);

      return {
        success: true,
        report,
        excelBuffer,
      };
    } catch (error) {
      this.logger.error(
        `Report generation failed for campaign ${campaignName}: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: ReportGenerationResult) {
    if (result.success) {
      this.logger.log(
        `Job ${job.id} completed: Report generated with ${result.report?.summary.totalMatches || 0} matches`,
      );
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}
