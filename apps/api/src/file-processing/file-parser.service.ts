import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ExcelParser, ExcelParseResult, ExcelParseOptions } from './parsers/excel.parser';
import { CSVParser, CSVParseResult, CSVParseOptions } from './parsers/csv.parser';

export enum FileType {
  EXCEL = 'excel',
  CSV = 'csv',
  UNKNOWN = 'unknown',
}

export type ParseResult = ExcelParseResult | CSVParseResult;
export type ParseOptions = ExcelParseOptions | CSVParseOptions;

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  constructor(
    private readonly excelParser: ExcelParser,
    private readonly csvParser: CSVParser,
  ) {}

  /**
   * Detect file type from buffer and filename
   */
  detectFileType(buffer: Buffer, filename?: string): FileType {
    // Check by file extension first
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      if (ext === 'xlsx' || ext === 'xls') {
        return FileType.EXCEL;
      }
      if (ext === 'csv') {
        return FileType.CSV;
      }
    }

    // Check by magic bytes (file signature)
    if (buffer.length < 4) {
      return FileType.UNKNOWN;
    }

    // Excel files start with PK (ZIP format)
    if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
      return FileType.EXCEL;
    }

    // Old Excel files (.xls) start with different signature
    if (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    ) {
      return FileType.EXCEL;
    }

    // Check if it looks like CSV (starts with text)
    const firstBytes = buffer.slice(0, 100).toString('utf-8');
    if (/^[a-zA-Z0-9,"'\s\n\r]+/.test(firstBytes)) {
      return FileType.CSV;
    }

    return FileType.UNKNOWN;
  }

  /**
   * Parse a file automatically detecting the format
   */
  async parseFile(
    buffer: Buffer,
    filename?: string,
    options: ParseOptions = {},
  ): Promise<ParseResult> {
    const fileType = this.detectFileType(buffer, filename);

    this.logger.log(
      `Parsing file: ${filename || 'unknown'} (detected type: ${fileType})`,
    );

    switch (fileType) {
      case FileType.EXCEL:
        return this.parseExcel(buffer, options as ExcelParseOptions);

      case FileType.CSV:
        return this.parseCSV(buffer, options as CSVParseOptions);

      default:
        throw new BadRequestException(
          'Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV file.',
        );
    }
  }

  /**
   * Parse an Excel file
   */
  async parseExcel(
    buffer: Buffer,
    options: ExcelParseOptions = {},
  ): Promise<ExcelParseResult> {
    try {
      return await this.excelParser.parseFromBuffer(buffer, options);
    } catch (error) {
      this.logger.error('Error parsing Excel file:', error);
      throw new BadRequestException(
        `Failed to parse Excel file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Parse a CSV file
   */
  async parseCSV(
    buffer: Buffer,
    options: CSVParseOptions = {},
  ): Promise<CSVParseResult> {
    try {
      return await this.csvParser.parseFromBuffer(buffer, options);
    } catch (error) {
      this.logger.error('Error parsing CSV file:', error);
      throw new BadRequestException(
        `Failed to parse CSV file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Validate parsed data
   */
  validateParsedData(
    result: ParseResult,
    requiredColumns: string[],
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if data was parsed
    if (!result.data || result.data.length === 0) {
      errors.push('No data found in file');
    }

    // Check for required columns
    const missingColumns = requiredColumns.filter(
      (col) => !result.headers.includes(col),
    );
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for parsing errors
    if (result.metadata.hasErrors) {
      errors.push(...result.metadata.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get statistics about parsed data
   */
  getDataStatistics(result: ParseResult): {
    totalRows: number;
    totalColumns: number;
    nullValues: number;
    emptyColumns: string[];
    warnings: number;
    errors: number;
  } {
    const emptyColumns: string[] = [];

    // Find empty columns
    result.headers.forEach((header) => {
      const hasValue = result.data.some((row) => {
        const value = row[header];
        return value !== null && value !== '' && value !== undefined;
      });
      if (!hasValue) {
        emptyColumns.push(header);
      }
    });

    // Count null values
    let nullValues = 0;
    result.data.forEach((row) => {
      result.headers.forEach((header) => {
        const value = row[header];
        if (value === null || value === '' || value === undefined) {
          nullValues++;
        }
      });
    });

    return {
      totalRows: result.metadata.totalRows,
      totalColumns: result.metadata.totalColumns,
      nullValues,
      emptyColumns,
      warnings: result.metadata.warnings.length,
      errors: result.metadata.errors.length,
    };
  }
}
