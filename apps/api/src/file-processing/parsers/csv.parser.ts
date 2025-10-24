import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { parseFlexibleDate, formatDateISO } from '../utils/excel-dates';

export interface ParsedRow {
  [key: string]: any;
  _rowNumber: number;
  _warnings: string[];
}

export interface CSVParseResult {
  data: ParsedRow[];
  headers: string[];
  metadata: {
    fileName?: string;
    totalRows: number;
    totalColumns: number;
    hasErrors: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface CSVParseOptions {
  delimiter?: string; // auto-detect if not provided
  skipEmptyLines?: boolean;
  skipRows?: number;
  maxRows?: number;
  requiredColumns?: string[];
  columnMapping?: Record<string, string>;
  trimValues?: boolean;
  convertDates?: boolean;
  encoding?: string;
}

@Injectable()
export class CSVParser {
  private readonly logger = new Logger(CSVParser.name);

  /**
   * Parse a CSV file from buffer
   */
  async parseFromBuffer(
    buffer: Buffer,
    options: CSVParseOptions = {},
  ): Promise<CSVParseResult> {
    const {
      delimiter,
      skipEmptyLines = true,
      skipRows = 0,
      maxRows,
      requiredColumns = [],
      columnMapping = {},
      trimValues = true,
      convertDates = true,
      encoding = 'utf-8',
    } = options;

    const result: CSVParseResult = {
      data: [],
      headers: [],
      metadata: {
        totalRows: 0,
        totalColumns: 0,
        hasErrors: false,
        errors: [],
        warnings: [],
      },
    };

    try {
      // Convert buffer to string - use specific encoding type
      const csvString = buffer.toString(encoding as BufferEncoding);

      // Parse CSV
      const parseResult: Papa.ParseResult<Record<string, any>> = Papa.parse(
        csvString,
        {
          header: true,
          delimiter: delimiter || '', // empty string = auto-detect
          skipEmptyLines: skipEmptyLines ? 'greedy' : false,
          transformHeader: (header: string) => {
            // Trim header if enabled
            let processedHeader = trimValues ? header.trim() : header;
            // Apply column mapping
            return columnMapping[processedHeader] || processedHeader;
          },
          transform: (value: string, field: string | number) => {
            // Trim values if enabled
            if (trimValues && typeof value === 'string') {
              value = value.trim();
            }

            // Convert dates if enabled and column looks like a date
            if (
              convertDates &&
              typeof field === 'string' &&
              this.isDateColumn(field)
            ) {
              const dateValue = parseFlexibleDate(value);
              if (dateValue) {
                return formatDateISO(dateValue);
              }
            }

            return value;
          },
        },
      );

      // Log completion
      this.logger.log(
        `PapaParse complete: ${parseResult.data.length} rows parsed`,
      );

      if (parseResult.errors && parseResult.errors.length > 0) {
        parseResult.errors.forEach((error) => {
          result.metadata.errors.push(
            `Row ${error.row}: ${error.message}`,
          );
        });
      }

      // Extract headers
      if (parseResult.meta && parseResult.meta.fields) {
        result.headers = parseResult.meta.fields;
        result.metadata.totalColumns = result.headers.length;
      }

      // Validate required columns
      if (requiredColumns.length > 0) {
        const missingColumns = requiredColumns.filter(
          (col) => !result.headers.includes(col),
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns: ${missingColumns.join(', ')}`,
          );
        }
      }

      // Process rows
      const rawData = parseResult.data as Record<string, any>[];
      const startIndex = skipRows;
      const endIndex = maxRows
        ? Math.min(startIndex + maxRows, rawData.length)
        : rawData.length;

      for (let i = startIndex; i < endIndex; i++) {
        const rawRow = rawData[i];

        // Skip completely empty rows
        if (this.isEmptyRow(rawRow)) {
          continue;
        }

        const rowData: ParsedRow = {
          ...rawRow,
          _rowNumber: i + 1,
          _warnings: [],
        };

        // Validate dates if needed
        if (convertDates) {
          result.headers.forEach((header) => {
            if (this.isDateColumn(header)) {
              const value = rowData[header];
              if (value && value !== '' && !this.isValidDate(value)) {
                rowData._warnings.push(
                  `Column "${header}": Invalid date format "${value}"`,
                );
              }
            }
          });
        }

        // Collect warnings
        if (rowData._warnings.length > 0) {
          result.metadata.warnings.push(
            ...rowData._warnings.map(
              (w) => `Row ${rowData._rowNumber}: ${w}`,
            ),
          );
        }

        result.data.push(rowData);
      }

      result.metadata.totalRows = result.data.length;

      this.logger.log(
        `Parsed CSV file: ${result.metadata.totalRows} rows, ${result.metadata.totalColumns} columns`,
      );

      if (result.metadata.warnings.length > 0) {
        this.logger.warn(
          `${result.metadata.warnings.length} warnings during parsing`,
        );
      }

      if (result.metadata.errors.length > 0) {
        result.metadata.hasErrors = true;
        this.logger.error(
          `${result.metadata.errors.length} errors during parsing`,
        );
      }
    } catch (error) {
      result.metadata.hasErrors = true;
      result.metadata.errors.push(
        error instanceof Error ? error.message : 'Unknown error',
      );
      this.logger.error('Error parsing CSV file:', error);
      throw error;
    }

    return result;
  }

  /**
   * Check if a row is completely empty
   */
  private isEmptyRow(row: Record<string, any>): boolean {
    return Object.values(row).every(
      (value) => value === null || value === '' || value === undefined,
    );
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
   * Check if a value is a valid date string (YYYY-MM-DD format)
   */
  private isValidDate(value: string): boolean {
    if (typeof value !== 'string') return false;
    const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
    return isoFormat.test(value);
  }

  /**
   * Detect column name variations
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
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return null;
  }
}
