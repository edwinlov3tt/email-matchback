import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface MatchRecord {
  matched: boolean;
  inPattern: boolean;
  totalSales?: number;
  signupDate?: Date;
  customerType?: string;
  email?: string;
  [key: string]: any;
}

export interface PivotTableData {
  rows: string[];
  columns: string[];
  values: number[][];
  totals: {
    rowTotals: number[];
    columnTotals: number[];
    grandTotal: number;
  };
}

export interface MissingEmailStats {
  totalRecords: number;
  missingEmails: number;
  missingEmailPercentage: number;
}

@Injectable()
export class PivotTableService {
  private readonly logger = new Logger(PivotTableService.name);

  /**
   * Pivot Table 1: All Matched Sales
   * Rows: Match status and Pattern status
   * Columns: Total Sales
   */
  createMatchedSalesPivot(records: MatchRecord[]): PivotTableData {
    this.logger.log(
      `Creating matched sales pivot for ${records.length} records`,
    );

    // Define row labels (Match × Pattern combinations)
    const rows = [
      'Matched & Out-of-Pattern',
      'Matched & In-Pattern',
      'Not Matched & Out-of-Pattern',
      'Not Matched & In-Pattern',
    ];

    // Group records by match/pattern status
    const groups = {
      'Matched & Out-of-Pattern': records.filter(
        (r) => r.matched === true && r.inPattern === false,
      ),
      'Matched & In-Pattern': records.filter(
        (r) => r.matched === true && r.inPattern === true,
      ),
      'Not Matched & Out-of-Pattern': records.filter(
        (r) => r.matched === false && r.inPattern === false,
      ),
      'Not Matched & In-Pattern': records.filter(
        (r) => r.matched === false && r.inPattern === true,
      ),
    };

    // Calculate totals for each group
    const values = rows.map((rowLabel) => {
      const groupRecords = groups[rowLabel] || [];
      const totalSales = groupRecords.reduce(
        (sum, r) => sum + (r.totalSales || 0),
        0,
      );
      const count = groupRecords.length;
      return [count, totalSales];
    });

    // Calculate totals
    const rowTotals = values.map((row) => row.reduce((a, b) => a + b, 0));
    const columnTotals = [
      values.reduce((sum, row) => sum + row[0], 0), // Total count
      values.reduce((sum, row) => sum + row[1], 0), // Total sales
    ];
    const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

    this.logger.log(
      `Matched sales pivot created: ${rows.length} rows, grand total: ${grandTotal}`,
    );

    return {
      rows,
      columns: ['Count', 'Total Sales'],
      values,
      totals: { rowTotals, columnTotals, grandTotal },
    };
  }

  /**
   * Pivot Table 2: New Customers
   * Rows: Match status and Signup Date
   * Columns: Total Sales and Signup Date
   */
  createNewCustomersPivot(records: MatchRecord[]): PivotTableData {
    this.logger.log(
      `Creating new customers pivot for ${records.length} records`,
    );

    // Filter to only new signups
    const newCustomers = records.filter((r) => {
      return (
        r.matched === true &&
        r.signupDate &&
        this.isRecentSignup(r.signupDate)
      );
    });

    // Group by month
    const monthGroups = new Map<string, MatchRecord[]>();
    newCustomers.forEach((record) => {
      if (!record.signupDate) return;
      const monthKey = this.formatMonth(new Date(record.signupDate));
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push(record);
    });

    // Convert to sorted array
    const sortedMonths = Array.from(monthGroups.keys()).sort();
    const rows = sortedMonths.length > 0 ? sortedMonths : ['No Data'];

    // Calculate values for each month
    const values =
      sortedMonths.length > 0
        ? sortedMonths.map((month) => {
            const monthRecords = monthGroups.get(month) || [];
            const totalSales = monthRecords.reduce(
              (sum, r) => sum + (r.totalSales || 0),
              0,
            );
            const count = monthRecords.length;
            return [count, totalSales];
          })
        : [[0, 0]];

    // Calculate totals
    const rowTotals = values.map((row) => row.reduce((a, b) => a + b, 0));
    const columnTotals = [
      values.reduce((sum, row) => sum + row[0], 0),
      values.reduce((sum, row) => sum + row[1], 0),
    ];
    const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

    this.logger.log(
      `New customers pivot created: ${sortedMonths.length} months, ${newCustomers.length} new customers`,
    );

    return {
      rows,
      columns: ['Count', 'Total Sales'],
      values,
      totals: { rowTotals, columnTotals, grandTotal },
    };
  }

  /**
   * Missing Email Statistics
   */
  calculateMissingEmailStats(records: MatchRecord[]): MissingEmailStats {
    const totalRecords = records.length;
    const missingEmails = records.filter(
      (r) => !r.email || r.email.trim() === '',
    ).length;
    const missingEmailPercentage =
      totalRecords > 0 ? (missingEmails / totalRecords) * 100 : 0;

    this.logger.log(
      `Missing email stats: ${missingEmails} of ${totalRecords} (${missingEmailPercentage.toFixed(1)}%)`,
    );

    return {
      totalRecords,
      missingEmails,
      missingEmailPercentage,
    };
  }

  /**
   * Create Excel worksheet with pivot table
   */
  addPivotTableToWorksheet(
    worksheet: ExcelJS.Worksheet,
    pivotData: PivotTableData,
    title: string,
  ): void {
    let currentRow = 1;

    // Add title
    worksheet.mergeCells(currentRow, 1, currentRow, pivotData.columns.length + 1);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };
    currentRow += 2;

    // Add headers
    worksheet.getCell(currentRow, 1).value = ''; // Empty corner cell
    pivotData.columns.forEach((col, index) => {
      const cell = worksheet.getCell(currentRow, index + 2);
      cell.value = col;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    currentRow++;

    // Add data rows
    pivotData.rows.forEach((rowLabel, rowIndex) => {
      const cell = worksheet.getCell(currentRow, 1);
      cell.value = rowLabel;
      cell.font = { bold: true };

      pivotData.values[rowIndex].forEach((value, colIndex) => {
        const dataCell = worksheet.getCell(currentRow, colIndex + 2);
        dataCell.value = value;
        // Format currency for "Total Sales" columns
        if (pivotData.columns[colIndex]?.includes('Sales')) {
          dataCell.numFmt = '$#,##0.00';
        }
      });
      currentRow++;
    });

    // Add totals row
    const totalCell = worksheet.getCell(currentRow, 1);
    totalCell.value = 'Total';
    totalCell.font = { bold: true };
    totalCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFCC' },
    };

    pivotData.totals.columnTotals.forEach((total, index) => {
      const cell = worksheet.getCell(currentRow, index + 2);
      cell.value = total;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCC' },
      };
      // Format currency for "Total Sales" columns
      if (pivotData.columns[index]?.includes('Sales')) {
        cell.numFmt = '$#,##0.00';
      }
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column) {
        column.width = 20;
      }
    });

    this.logger.log(`Added pivot table "${title}" to worksheet`);
  }

  /**
   * Add missing email stats to worksheet
   */
  addMissingEmailStatsToWorksheet(
    worksheet: ExcelJS.Worksheet,
    stats: MissingEmailStats,
  ): void {
    let currentRow = 1;

    // Title
    worksheet.mergeCells(currentRow, 1, currentRow, 3);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = 'Missing Email Address Statistics';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };
    currentRow += 2;

    // Headers
    const headers = ['Total Records', 'Missing Emails', 'Missing %'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    currentRow++;

    // Data
    worksheet.getCell(currentRow, 1).value = stats.totalRecords;
    worksheet.getCell(currentRow, 2).value = stats.missingEmails;
    const percentCell = worksheet.getCell(currentRow, 3);
    percentCell.value = stats.missingEmailPercentage / 100;
    percentCell.numFmt = '0.00%';

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column) {
        column.width = 20;
      }
    });

    this.logger.log('Added missing email stats to worksheet');
  }

  /**
   * Check if signup is recent (within last 3 months)
   */
  private isRecentSignup(signupDate: Date): boolean {
    const now = new Date();
    const threeMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      1,
    );
    return new Date(signupDate) >= threeMonthsAgo;
  }

  /**
   * Format date as "YYYY-MM"
   */
  private formatMonth(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
