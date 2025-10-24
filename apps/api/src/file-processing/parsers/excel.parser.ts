import * as ExcelJS from 'exceljs';
import { Injectable, Logger } from '@nestjs/common';
import {
  safeDateConversion,
  parseFlexibleDate,
  formatDateISO,
} from '../utils/excel-dates';

export interface ParsedRow {
  [key: string]: any;
  _rowNumber: number;
  _warnings: string[];
}

export interface ExcelParseResult {
  data: ParsedRow[];
  headers: string[];
  metadata: {
    fileName?: string;
    sheetName: string;
    totalRows: number;
    totalColumns: number;
    hasErrors: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface ExcelParseOptions {
  sheetIndex?: number; // 0-based index
  sheetName?: string;
  headerRow?: number; // 1-based row number
  skipRows?: number;
  maxRows?: number;
  requiredColumns?: string[]; // Column names that must be present
  columnMapping?: Record<string, string>; // Map Excel column names to standard names
  trimValues?: boolean;
  convertDates?: boolean;
}

@Injectable()
export class ExcelParser {
  private readonly logger = new Logger(ExcelParser.name);

  /**
   * Parse an Excel file from buffer
   */
  async parseFromBuffer(
    buffer: Buffer,
    options: ExcelParseOptions = {},
  ): Promise<ExcelParseResult> {
    const {
      sheetIndex = 0,
      sheetName,
      headerRow = 1,
      skipRows = 0,
      maxRows,
      requiredColumns = [],
      columnMapping = {},
      trimValues = true,
      convertDates = true,
    } = options;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    // Get the worksheet
    let worksheet: ExcelJS.Worksheet | undefined;
    if (sheetName) {
      worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }
    } else {
      worksheet = workbook.worksheets[sheetIndex];
      if (!worksheet) {
        throw new Error(`Sheet at index ${sheetIndex} not found`);
      }
    }

    const result: ExcelParseResult = {
      data: [],
      headers: [],
      metadata: {
        sheetName: worksheet.name,
        totalRows: 0,
        totalColumns: 0,
        hasErrors: false,
        errors: [],
        warnings: [],
      },
    };

    try {
      // Extract headers
      const headerRowData = worksheet.getRow(headerRow);
      const headers: string[] = [];
      const headerMap: Map<number, string> = new Map();

      headerRowData.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let headerName = this.getCellValue(cell, trimValues);
        if (typeof headerName === 'string') {
          // Apply column mapping if provided
          headerName = columnMapping[headerName] || headerName;
          headers.push(headerName);
          headerMap.set(colNumber, headerName);
        }
      });

      result.headers = headers;
      result.metadata.totalColumns = headers.length;

      // Validate required columns
      if (requiredColumns.length > 0) {
        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col),
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns: ${missingColumns.join(', ')}`,
          );
        }
      }

      // Parse data rows
      const startRow = headerRow + 1 + skipRows;
      const endRow = maxRows ? startRow + maxRows - 1 : worksheet.rowCount;

      for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
        const row = worksheet.getRow(rowNum);

        // Skip completely empty rows
        if (this.isEmptyRow(row)) {
          continue;
        }

        const rowData: ParsedRow = {
          _rowNumber: rowNum,
          _warnings: [],
        };

        // Extract cell values
        headerMap.forEach((headerName, colNumber) => {
          const cell = row.getCell(colNumber);
          let value = this.getCellValue(cell, trimValues);

          // Convert dates if enabled
          if (convertDates && this.isDateColumn(headerName)) {
            const dateValue = parseFlexibleDate(value);
            if (dateValue) {
              value = formatDateISO(dateValue);
            } else if (value != null && value !== '') {
              rowData._warnings.push(
                `Column "${headerName}": Could not parse date value "${value}"`,
              );
            }
          }

          rowData[headerName] = value;
        });

        // Collect warnings
        if (rowData._warnings.length > 0) {
          result.metadata.warnings.push(
            ...rowData._warnings.map(
              (w) => `Row ${rowNum}: ${w}`,
            ),
          );
        }

        result.data.push(rowData);
      }

      result.metadata.totalRows = result.data.length;

      this.logger.log(
        `Parsed Excel file: ${result.metadata.totalRows} rows, ${result.metadata.totalColumns} columns`,
      );

      if (result.metadata.warnings.length > 0) {
        this.logger.warn(
          `${result.metadata.warnings.length} warnings during parsing`,
        );
      }
    } catch (error) {
      result.metadata.hasErrors = true;
      result.metadata.errors.push(
        error instanceof Error ? error.message : 'Unknown error',
      );
      this.logger.error('Error parsing Excel file:', error);
      throw error;
    }

    return result;
  }

  /**
   * Get cell value with proper type handling
   */
  private getCellValue(cell: ExcelJS.Cell, trimStrings: boolean): any {
    let value = cell.value;

    // Handle formula cells
    if (cell.type === ExcelJS.ValueType.Formula) {
      value = cell.result;
    }

    // Handle rich text
    if (value && typeof value === 'object' && 'richText' in value) {
      value = value.richText.map((t: any) => t.text).join('');
    }

    // Handle hyperlinks
    if (value && typeof value === 'object' && 'text' in value) {
      value = value.text;
    }

    // Handle error cells
    if (cell.type === ExcelJS.ValueType.Error) {
      return null;
    }

    // Trim strings
    if (trimStrings && typeof value === 'string') {
      value = value.trim();
    }

    // Handle dates
    if (cell.type === ExcelJS.ValueType.Date && value instanceof Date) {
      return value;
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return null;
    }

    return value;
  }

  /**
   * Check if a row is completely empty
   */
  private isEmptyRow(row: ExcelJS.Row): boolean {
    let hasValue = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const value = this.getCellValue(cell, true);
      if (value !== null && value !== '' && value !== undefined) {
        hasValue = true;
      }
    });
    return !hasValue;
  }

  /**
   * Check if a column name suggests it contains dates
   */
  private isDateColumn(columnName: string): boolean {
    const lowerName = columnName.toLowerCase();
    const dateKeywords = [
      'date',
      'signup',
      'visit',
      'drop',
      'redrop',
      'created',
      'updated',
      'dob',
      'birthday',
    ];
    return dateKeywords.some((keyword) => lowerName.includes(keyword));
  }

  /**
   * Detect column name variations (e.g., "Visit1" vs "Visit_1")
   */
  findColumn(headers: string[], possibleNames: string[]): string | null {
    for (const name of possibleNames) {
      const found = headers.find(
        (h) => h.toLowerCase() === name.toLowerCase(),
      );
      if (found) return found;
    }
    return null;
  }

  /**
   * Get column value with fallback names
   */
  getColumnValue(row: ParsedRow, possibleNames: string[]): any {
    for (const name of possibleNames) {
      const value = row[name];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return null;
  }
}
