import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { CacCalculatorService, CACMetrics } from './cac-calculator.service';
import {
  PivotTableService,
  PivotTableData,
  MissingEmailStats,
} from './pivot-table.service';

export interface MatchRecord {
  matched: boolean;
  inPattern: boolean;
  totalSales?: number;
  signupDate?: Date;
  customerType?: string;
  email?: string;
  [key: string]: any;
}

export interface CampaignReport {
  campaignName: string;
  campaignDate: Date;
  market: string;

  // Pivot tables
  matchedSalesPivot: PivotTableData;
  newCustomersPivot: PivotTableData;
  missingEmailStats: MissingEmailStats;

  // CAC/ROAS metrics
  cacMetrics: CACMetrics;

  // Summary stats
  summary: {
    totalRecords: number;
    totalMatches: number;
    matchRate: number;
    totalRevenue: number;
    attributableRevenue: number;
  };
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly cacCalculator: CacCalculatorService,
    private readonly pivotTableService: PivotTableService,
  ) {}

  /**
   * Generate complete campaign report
   */
  async generateCampaignReport(
    records: MatchRecord[],
    campaignName: string,
    campaignDate: Date,
    market: string,
    campaignCost: number,
  ): Promise<CampaignReport> {
    this.logger.log(
      `Generating campaign report for ${campaignName} - ${records.length} records`,
    );

    // Generate pivot tables
    const matchedSalesPivot =
      this.pivotTableService.createMatchedSalesPivot(records);
    const newCustomersPivot =
      this.pivotTableService.createNewCustomersPivot(records);
    const missingEmailStats =
      this.pivotTableService.calculateMissingEmailStats(records);

    // Calculate CAC/ROAS metrics
    const cacMetrics = this.cacCalculator.calculateMetrics(
      records,
      campaignCost,
    );

    // Calculate summary stats
    const totalMatches = records.filter((r) => r.matched === true).length;
    const matchRate = records.length > 0 ? totalMatches / records.length : 0;
    const totalRevenue = records.reduce(
      (sum, r) => sum + (r.totalSales || 0),
      0,
    );
    const attributableRevenue = records
      .filter((r) => r.matched === true && r.inPattern === false)
      .reduce((sum, r) => sum + (r.totalSales || 0), 0);

    const report: CampaignReport = {
      campaignName,
      campaignDate,
      market,
      matchedSalesPivot,
      newCustomersPivot,
      missingEmailStats,
      cacMetrics,
      summary: {
        totalRecords: records.length,
        totalMatches,
        matchRate,
        totalRevenue,
        attributableRevenue,
      },
    };

    this.logger.log(
      `Report generated: ${totalMatches} matches (${(matchRate * 100).toFixed(1)}%), $${attributableRevenue.toFixed(2)} attributable revenue`,
    );

    return report;
  }

  /**
   * Export campaign report to Excel
   */
  async exportToExcel(report: CampaignReport): Promise<Buffer> {
    this.logger.log(`Exporting report for ${report.campaignName} to Excel`);

    const workbook = new ExcelJS.Workbook();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummarySheet(summarySheet, report);

    // Pivot Table 1: Matched Sales
    const matchedSalesSheet = workbook.addWorksheet('Matched Sales');
    this.pivotTableService.addPivotTableToWorksheet(
      matchedSalesSheet,
      report.matchedSalesPivot,
      'All Matched Sales',
    );

    // Pivot Table 2: New Customers
    const newCustomersSheet = workbook.addWorksheet('New Customers');
    this.pivotTableService.addPivotTableToWorksheet(
      newCustomersSheet,
      report.newCustomersPivot,
      'New Customer Signups',
    );

    // Pivot Table 3: Missing Email Stats
    const missingEmailSheet = workbook.addWorksheet('Missing Emails');
    this.pivotTableService.addMissingEmailStatsToWorksheet(
      missingEmailSheet,
      report.missingEmailStats,
    );

    // CAC/ROAS Sheet
    const metricsSheet = workbook.addWorksheet('CAC & ROAS');
    this.addMetricsSheet(metricsSheet, report.cacMetrics);

    this.logger.log(
      `Excel export complete: ${workbook.worksheets.length} sheets`,
    );

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Add summary sheet to workbook
   */
  private addSummarySheet(
    worksheet: ExcelJS.Worksheet,
    report: CampaignReport,
  ): void {
    let currentRow = 1;

    // Title
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = `Campaign Report: ${report.campaignName}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };
    currentRow += 2;

    // Campaign Info
    const campaignInfo = [
      ['Campaign Name:', report.campaignName],
      ['Market:', report.market],
      [
        'Campaign Date:',
        new Date(report.campaignDate).toISOString().split('T')[0],
      ],
      ['', ''],
    ];

    campaignInfo.forEach((row) => {
      worksheet.getCell(currentRow, 1).value = row[0];
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getCell(currentRow, 2).value = row[1];
      currentRow++;
    });

    // Summary Stats
    worksheet.getCell(currentRow, 1).value = 'Summary Statistics';
    worksheet.getCell(currentRow, 1).font = { bold: true, size: 14 };
    currentRow += 1;

    const summaryStats = [
      ['Total Records:', report.summary.totalRecords],
      ['Total Matches:', report.summary.totalMatches],
      ['Match Rate:', `${(report.summary.matchRate * 100).toFixed(1)}%`],
      ['Total Revenue:', `$${report.summary.totalRevenue.toFixed(2)}`],
      [
        'Attributable Revenue:',
        `$${report.summary.attributableRevenue.toFixed(2)}`,
      ],
      ['', ''],
    ];

    summaryStats.forEach((row) => {
      worksheet.getCell(currentRow, 1).value = row[0];
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getCell(currentRow, 2).value = row[1];
      currentRow++;
    });

    // CAC/ROAS Quick View
    worksheet.getCell(currentRow, 1).value = 'Quick Metrics';
    worksheet.getCell(currentRow, 1).font = { bold: true, size: 14 };
    currentRow += 1;

    const quickMetrics = [
      [
        'CAC (Out-of-Pattern):',
        `$${report.cacMetrics.cacOutOfPattern.toFixed(2)}`,
      ],
      ['ROAS (Out-of-Pattern):', `${report.cacMetrics.roasOutOfPattern.toFixed(2)}x`],
      ['New Signups:', report.cacMetrics.newSignups],
      [
        'Missing Emails:',
        `${report.missingEmailStats.missingEmails} (${report.missingEmailStats.missingEmailPercentage.toFixed(1)}%)`,
      ],
    ];

    quickMetrics.forEach((row) => {
      worksheet.getCell(currentRow, 1).value = row[0];
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getCell(currentRow, 2).value = row[1];
      currentRow++;
    });

    // Auto-fit columns
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 25;
  }

  /**
   * Add metrics sheet to workbook
   */
  private addMetricsSheet(
    worksheet: ExcelJS.Worksheet,
    metrics: CACMetrics,
  ): void {
    let currentRow = 1;

    // Title
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = 'CAC & ROAS Metrics';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };
    currentRow += 2;

    // Format metrics for display
    const formattedMetrics =
      this.cacCalculator.formatForReport(metrics);

    Object.entries(formattedMetrics).forEach(([key, value]) => {
      worksheet.getCell(currentRow, 1).value = key;
      worksheet.getCell(currentRow, 1).font = { bold: true };
      worksheet.getCell(currentRow, 2).value = value;
      currentRow++;
    });

    // Auto-fit columns
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
  }
}
