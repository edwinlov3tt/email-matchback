import { Test, TestingModule } from '@nestjs/testing';
import { ExcelService } from './excel.service';
import * as ExcelJS from 'exceljs';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelService],
    }).compile();

    service = module.get<ExcelService>(ExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseClientData', () => {
    it('should parse valid Excel file with client data', async () => {
      // Create a test Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      // Add headers
      worksheet.columns = [
        { header: 'CustomerID', key: 'customerId', width: 15 },
        { header: 'FirstName', key: 'firstName', width: 15 },
        { header: 'LastName', key: 'lastName', width: 15 },
        { header: 'EmailAddress', key: 'emailAddress', width: 30 },
        { header: 'SignupDate', key: 'signupDate', width: 15 },
        { header: 'Visit1', key: 'visit1', width: 15 },
        { header: 'TotalVisits', key: 'totalVisits', width: 12 },
        { header: 'TotalSales', key: 'totalSales', width: 12 },
        { header: 'Market', key: 'market', width: 10 },
      ];

      // Add sample data - Excel date serial 44927 = 2023-01-01
      worksheet.addRow({
        customerId: 'CUST001',
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        signupDate: 44927,
        visit1: 44930,
        totalVisits: 5,
        totalSales: 250.50,
        market: 'NYC',
      });

      worksheet.addRow({
        customerId: 'CUST002',
        firstName: 'Jane',
        lastName: 'Smith',
        emailAddress: 'jane@example.com',
        signupDate: 44920,
        visit1: 44925,
        totalVisits: 3,
        totalSales: 150.00,
        market: 'NYC',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Parse the file
      const result = await service.parseClientData(Buffer.from(buffer));

      // Assertions
      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.records).toHaveLength(2);

      const firstRecord = result.records[0];
      expect(firstRecord.CustomerID).toBe('CUST001');
      expect(firstRecord.FirstName).toBe('John');
      expect(firstRecord.LastName).toBe('Doe');
      expect(firstRecord.EmailAddress).toBe('john@example.com');
      expect(firstRecord.SignupDate).toBe(44927);
      expect(firstRecord.Visit1).toBe(44930);
      expect(firstRecord.TotalVisits).toBe(5);
      expect(firstRecord.TotalSales).toBe(250.50);
      expect(firstRecord.Market).toBe('NYC');
    });

    it('should handle column name variations (Visit_1 vs Visit1)', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      // Use underscore variation
      worksheet.columns = [
        { header: 'CustomerID', key: 'customerId', width: 15 },
        { header: 'SignupDate', key: 'signupDate', width: 15 },
        { header: 'Visit_1', key: 'visit1', width: 15 }, // Underscore version
      ];

      worksheet.addRow({
        customerId: 'CUST001',
        signupDate: 44927,
        visit1: 44930,
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const result = await service.parseClientData(Buffer.from(buffer));

      expect(result.validRows).toBe(1);
      expect(result.records[0].Visit1).toBe(44930);
    });

    it('should handle missing email addresses gracefully', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      worksheet.columns = [
        { header: 'CustomerID', key: 'customerId', width: 15 },
        { header: 'SignupDate', key: 'signupDate', width: 15 },
        { header: 'EmailAddress', key: 'emailAddress', width: 30 },
      ];

      worksheet.addRow({
        customerId: 'CUST001',
        signupDate: 44927,
        emailAddress: '', // Missing email
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const result = await service.parseClientData(Buffer.from(buffer));

      expect(result.validRows).toBe(1);
      expect(result.records[0].EmailAddress).toBeFalsy(); // Empty string or undefined
    });

    it('should collect errors for invalid rows', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      worksheet.columns = [
        { header: 'CustomerID', key: 'customerId', width: 15 },
        { header: 'SignupDate', key: 'signupDate', width: 15 },
      ];

      // Add invalid row - missing CustomerID
      worksheet.addRow({
        customerId: '',
        signupDate: 44927,
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const result = await service.parseClientData(Buffer.from(buffer));

      expect(result.validRows).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createSanitizedExcel', () => {
    it('should create sanitized Excel file for vendor', async () => {
      const records = [
        {
          dcmId: 'TIDE123-NYC-1234567890-00001',
          firstName: 'John',
          lastName: 'Doe',
          emailAddress: 'john@example.com',
          phoneNumber: '555-1234',
          address: '123 Main St',
        },
        {
          dcmId: 'TIDE123-NYC-1234567890-00002',
          firstName: 'Jane',
          lastName: 'Smith',
          emailAddress: 'jane@example.com',
        },
      ];

      const buffer = await service.createSanitizedExcel(records);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify we can parse it back
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const worksheet = workbook.worksheets[0];

      expect(worksheet.name).toBe('Matchback Data');
      expect(worksheet.rowCount).toBe(3); // Header + 2 data rows
    });
  });
});
