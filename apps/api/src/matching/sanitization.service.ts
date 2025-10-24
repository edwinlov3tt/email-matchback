import { Injectable, Logger } from '@nestjs/common';
import { DcmIdService } from './dcm-id.service';
import * as ExcelJS from 'exceljs';

export interface ClientRecord {
  // Customer info (safe to send to vendor)
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;

  // Sensitive data (MUST NOT be sent to vendor)
  customerId?: string;
  signupDate?: Date;
  totalSales?: number;
  visit1Date?: Date;
  visit2Date?: Date;
  visit3Date?: Date;
  totalVisits?: number;

  // Any other fields
  [key: string]: any;
}

export interface SanitizedRecord {
  dcmId: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface SanitizationResult {
  sanitizedRecords: SanitizedRecord[];
  dcmIdMapping: Map<string, ClientRecord>; // dcmId -> original record
  statistics: {
    totalRecords: number;
    missingEmails: number;
    missingEmailPercentage: number;
    fieldsRemoved: string[];
  };
}

@Injectable()
export class SanitizationService {
  private readonly logger = new Logger(SanitizationService.name);

  // Fields that are SAFE to send to vendor
  private readonly SAFE_FIELDS = [
    'name',
    'firstName',
    'lastName',
    'email',
    'address',
    'city',
    'state',
    'zip',
    'phone',
  ];

  // Fields that MUST be removed (sensitive PII)
  private readonly SENSITIVE_FIELDS = [
    'customerId',
    'customer_id',
    'id',
    'signupDate',
    'signup_date',
    'totalSales',
    'total_sales',
    'sales',
    'visit1Date',
    'visit2Date',
    'visit3Date',
    'visit_1',
    'visit_2',
    'visit_3',
    'totalVisits',
    'total_visits',
    'visits',
    'revenue',
    'ltv',
    'lifetime_value',
  ];

  constructor(private readonly dcmIdService: DcmIdService) {}

  /**
   * Sanitize client data for vendor matching
   * CRITICAL: Removes ALL sensitive business data, keeps only contact info
   */
  async sanitizeForVendor(
    records: ClientRecord[],
    campaignId: string,
    market: string,
  ): Promise<SanitizationResult> {
    this.logger.log(
      `Sanitizing ${records.length} records for campaign ${campaignId}`,
    );

    const sanitizedRecords: SanitizedRecord[] = [];
    const dcmIdMapping = new Map<string, ClientRecord>();
    let missingEmails = 0;

    // Generate DCM_IDs for all records
    const timestamp = Date.now();

    records.forEach((record, index) => {
      const sequence = index + 1;
      const dcmId = this.dcmIdService.generateDcmId(
        campaignId,
        market,
        sequence,
        timestamp,
      );

      // Extract only safe fields
      const sanitized: SanitizedRecord = {
        dcmId,
        name: this.combineName(record),
        email: record.email || '',
        address: this.combineAddress(record),
        phone: record.phone || '',
      };

      // Track missing emails
      if (!record.email || record.email.trim() === '') {
        missingEmails++;
      }

      sanitizedRecords.push(sanitized);

      // Store mapping for later matching
      dcmIdMapping.set(dcmId, record);
    });

    // Validate no sensitive data leaked
    this.validateNoLeaks(sanitizedRecords);

    const statistics = {
      totalRecords: records.length,
      missingEmails,
      missingEmailPercentage: (missingEmails / records.length) * 100,
      fieldsRemoved: this.SENSITIVE_FIELDS,
    };

    this.logger.log(
      `Sanitization complete: ${records.length} records, ${missingEmails} missing emails (${statistics.missingEmailPercentage.toFixed(1)}%)`,
    );

    if (statistics.missingEmailPercentage > 30) {
      this.logger.warn(
        `High percentage of missing emails: ${statistics.missingEmailPercentage.toFixed(1)}%`,
      );
    }

    return {
      sanitizedRecords,
      dcmIdMapping,
      statistics,
    };
  }

  /**
   * Create Excel file with sanitized data for vendor
   */
  async createVendorExcel(
    sanitizedRecords: SanitizedRecord[],
    campaignName: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matchback Request');

    // Add headers
    worksheet.columns = [
      { header: 'DCM_ID', key: 'dcmId', width: 30 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Phone', key: 'phone', width: 15 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    sanitizedRecords.forEach((record) => {
      worksheet.addRow(record);
    });

    // Add campaign info in a separate row
    worksheet.addRow([]);
    worksheet.addRow(['Campaign:', campaignName]);
    worksheet.addRow(['Total Records:', sanitizedRecords.length]);
    worksheet.addRow([
      'Generated:',
      new Date().toISOString().split('T')[0],
    ]);

    this.logger.log(`Created vendor Excel with ${sanitizedRecords.length} records`);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Validate that no sensitive data is present in sanitized records
   */
  private validateNoLeaks(sanitizedRecords: SanitizedRecord[]): void {
    const leaks: string[] = [];

    // Whitelist of allowed field names (even if they contain "id")
    const allowedFields = ['dcmid', 'dcm_id'];

    sanitizedRecords.forEach((record, index) => {
      // Check if any sensitive field names appear in the record
      Object.keys(record).forEach((key) => {
        const lowerKey = key.toLowerCase();

        // Skip whitelisted fields
        if (allowedFields.includes(lowerKey)) {
          return;
        }

        if (
          this.SENSITIVE_FIELDS.some((sensitive) =>
            lowerKey.includes(sensitive.toLowerCase()),
          )
        ) {
          leaks.push(`Record ${index + 1}: Found sensitive field "${key}"`);
        }
      });
    });

    if (leaks.length > 0) {
      this.logger.error('SENSITIVE DATA LEAK DETECTED!');
      this.logger.error(leaks.join('\n'));
      throw new Error(
        `Sanitization failed: Sensitive data detected in ${leaks.length} records`,
      );
    }

    this.logger.log('Validation passed: No sensitive data leaks detected');
  }

  /**
   * Combine first and last name, or use name field
   */
  private combineName(record: ClientRecord): string {
    if (record.firstName || record.lastName) {
      return `${record.firstName || ''} ${record.lastName || ''}`.trim();
    }
    return record.name || '';
  }

  /**
   * Combine address components
   */
  private combineAddress(record: ClientRecord): string {
    const parts: string[] = [];

    if (record.address) parts.push(record.address);
    if (record.city) parts.push(record.city);
    if (record.state) parts.push(record.state);
    if (record.zip) parts.push(record.zip);

    return parts.join(', ');
  }

  /**
   * Process vendor response and merge with original data
   */
  async processVendorResponse(
    vendorExcel: Buffer,
    dcmIdMapping: Map<string, ClientRecord>,
  ): Promise<ClientRecord[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(vendorExcel as any);

    const worksheet = workbook.worksheets[0];
    const matchedRecords: ClientRecord[] = [];

    // Skip header row
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const dcmId = row.getCell(1).value as string;
      const matched = row.getCell(6)?.value; // Assuming match flag in column 6

      // Get original record
      const originalRecord = dcmIdMapping.get(dcmId);
      if (originalRecord) {
        matchedRecords.push({
          ...originalRecord,
          dcmId,
          matched: matched === 'Y' || matched === 'Yes' || matched === true,
        });
      }
    });

    this.logger.log(
      `Processed vendor response: ${matchedRecords.length} matched records`,
    );

    return matchedRecords;
  }
}
