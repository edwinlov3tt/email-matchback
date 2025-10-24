import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { excelDateToJS, parseDate } from '@matchback/utils';
import { ClientDataRow, MatchRecord } from '@matchback/types';

export interface ParsedExcelData {
  records: ClientDataRow[];
  totalRows: number;
  validRows: number;
  errors: string[];
}

export interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  /**
   * Parse client data Excel file
   * Handles Visit1 and Visit_1 column variations
   * Converts Excel serial dates to JavaScript Date objects
   */
  async parseClientData(buffer: Buffer): Promise<ParsedExcelData> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    const records: ClientDataRow[] = [];
    const errors: string[] = [];
    let totalRows = 0;
    let validRows = 0;

    // Get header row to detect column variations
    const headerRow = worksheet.getRow(1);
    const columnMap = this.buildColumnMap(headerRow);

    this.logger.log(`Detected columns: ${Object.keys(columnMap).join(', ')}`);

    // Process data rows (skip header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      totalRows++;

      try {
        const record = this.parseDataRow(row, columnMap, rowNumber);
        records.push(record);
        validRows++;
      } catch (error) {
        const errorMsg = `Row ${rowNumber}: ${error.message}`;
        errors.push(errorMsg);
        this.logger.warn(errorMsg);
      }
    });

    this.logger.log(
      `Parsed ${validRows} valid rows out of ${totalRows} total rows`
    );

    return {
      records,
      totalRows,
      validRows,
      errors,
    };
  }

  /**
   * Build a map of column names to their positions
   * Handles variations like Visit1 vs Visit_1
   */
  private buildColumnMap(headerRow: ExcelJS.Row): Map<string, number> {
    const columnMap = new Map<string, number>();

    headerRow.eachCell((cell, colNumber) => {
      const header = cell.value?.toString().trim() || '';
      if (header) {
        // Normalize column names (remove underscores, lowercase)
        const normalized = header.replace(/_/g, '').toLowerCase();
        columnMap.set(normalized, colNumber);

        // Also store original name
        columnMap.set(header.toLowerCase(), colNumber);
      }
    });

    return columnMap;
  }

  /**
   * Parse a single data row into ClientDataRow
   */
  private parseDataRow(
    row: ExcelJS.Row,
    columnMap: Map<string, number>,
    rowNumber: number
  ): ClientDataRow {
    // Helper to get cell value by column name (tries variations)
    const getCellValue = (variants: string[]): any => {
      for (const variant of variants) {
        const colNumber = columnMap.get(variant.toLowerCase());
        if (colNumber) {
          const cell = row.getCell(colNumber);
          return cell.value;
        }
      }
      return undefined;
    };

    // Required field: CustomerID
    const customerId = getCellValue(['CustomerID', 'Customer ID', 'customerid']);
    if (!customerId) {
      throw new Error('Missing required field: CustomerID');
    }

    // Required field: SignupDate
    const signupDateValue = getCellValue(['SignupDate', 'Signup Date', 'signupdate']);
    if (!signupDateValue) {
      throw new Error('Missing required field: SignupDate');
    }

    // Parse dates - handle both Excel serial numbers and Date objects
    let signupDate: number | Date;
    try {
      signupDate = this.parseDateValue(signupDateValue);
    } catch (error) {
      throw new Error(`Invalid SignupDate: ${error.message}`);
    }

    // Optional fields
    const lastName = getCellValue(['LastName', 'Last Name', 'lastname'])?.toString();
    const firstName = getCellValue(['FirstName', 'First Name', 'firstname'])?.toString();
    const emailAddress = getCellValue(['EmailAddress', 'Email Address', 'Email', 'email'])?.toString();

    const visit1Value = getCellValue(['Visit1', 'Visit_1', 'visit1']);
    const visit1 = visit1Value ? this.parseDateValue(visit1Value) : undefined;

    const totalVisitsValue = getCellValue(['TotalVisits', 'Total Visits', 'totalvisits']);
    const totalVisits = totalVisitsValue ? Number(totalVisitsValue) : undefined;

    const totalSalesValue = getCellValue(['TotalSales', 'Total Sales', 'totalsales']);
    const totalSales = totalSalesValue ? Number(totalSalesValue) : undefined;

    const market = getCellValue(['Market', 'market'])?.toString();

    return {
      CustomerID: customerId.toString(),
      LastName: lastName,
      FirstName: firstName,
      EmailAddress: emailAddress,
      SignupDate: signupDate,
      Visit1: visit1,
      TotalVisits: totalVisits,
      TotalSales: totalSales,
      Market: market,
    };
  }

  /**
   * Parse a date value that could be Excel serial number or Date object
   */
  private parseDateValue(value: any): number | Date {
    // If it's already a Date object, return it
    if (value instanceof Date) {
      return value;
    }

    // If it's a number, assume it's Excel serial and keep as number
    // The consuming code can convert it later if needed
    if (typeof value === 'number') {
      // Validate it's a reasonable Excel date serial
      if (value < 1 || value > 100000) {
        throw new Error(`Invalid Excel date serial: ${value}`);
      }
      return value;
    }

    // If it's a string, try parsing as date
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Cannot parse date string: ${value}`);
      }
      return parsed;
    }

    throw new Error(`Unsupported date value type: ${typeof value}`);
  }

  /**
   * Create Excel file from match records for vendor
   */
  async createSanitizedExcel(
    records: Array<{
      dcmId: string;
      firstName?: string;
      lastName?: string;
      emailAddress?: string;
      phoneNumber?: string;
      address?: string;
    }>
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matchback Data');

    // Define columns
    worksheet.columns = [
      { header: 'DCM_ID', key: 'dcmId', width: 25 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email Address', key: 'emailAddress', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    records.forEach(record => {
      worksheet.addRow({
        dcmId: record.dcmId,
        firstName: record.firstName || '',
        lastName: record.lastName || '',
        emailAddress: record.emailAddress || '',
        phoneNumber: record.phoneNumber || '',
        address: record.address || '',
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Create Excel report with multiple sheets
   */
  async createReport(data: {
    summary: Array<{ label: string; value: string | number }>;
    matched: MatchRecord[];
    unmatched: MatchRecord[];
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'label', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];
    this.styleHeaderRow(summarySheet.getRow(1));
    data.summary.forEach(row => summarySheet.addRow(row));

    // Matched records sheet
    const matchedSheet = workbook.addWorksheet('Matched');
    this.addMatchRecordColumns(matchedSheet);
    data.matched.forEach(record => this.addMatchRecordRow(matchedSheet, record));

    // Unmatched records sheet
    const unmatchedSheet = workbook.addWorksheet('Unmatched');
    this.addMatchRecordColumns(unmatchedSheet);
    data.unmatched.forEach(record => this.addMatchRecordRow(unmatchedSheet, record));

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Add columns for match record sheets
   */
  private addMatchRecordColumns(worksheet: ExcelJS.Worksheet) {
    worksheet.columns = [
      { header: 'DCM ID', key: 'dcmId', width: 25 },
      { header: 'Customer ID', key: 'customerId', width: 20 },
      { header: 'Email', key: 'emailAddress', width: 30 },
      { header: 'Signup Date', key: 'signupDate', width: 15 },
      { header: 'Total Visits', key: 'totalVisits', width: 12 },
      { header: 'Visit 1 Date', key: 'visit1Date', width: 15 },
      { header: 'Matched', key: 'matched', width: 10 },
      { header: 'In Pattern', key: 'inPattern', width: 12 },
      { header: 'Customer Type', key: 'customerType', width: 15 },
      { header: 'Total Sales', key: 'totalSales', width: 15 },
      { header: 'Market', key: 'market', width: 15 },
    ];
    this.styleHeaderRow(worksheet.getRow(1));
  }

  /**
   * Add a match record row to worksheet
   */
  private addMatchRecordRow(worksheet: ExcelJS.Worksheet, record: MatchRecord) {
    worksheet.addRow({
      dcmId: record.dcmId,
      customerId: record.customerId,
      emailAddress: record.emailAddress || '',
      signupDate: record.signupDate,
      totalVisits: record.totalVisits,
      visit1Date: record.visit1Date || '',
      matched: record.matched ? 'Yes' : 'No',
      inPattern: record.inPattern !== undefined ? (record.inPattern ? 'Yes' : 'No') : '',
      customerType: record.customerType || '',
      totalSales: record.totalSales || '',
      market: record.market,
    });
  }

  /**
   * Apply consistent styling to header rows
   */
  private styleHeaderRow(row: ExcelJS.Row) {
    row.font = { bold: true };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
  }
}
