import { Test, TestingModule } from '@nestjs/testing';
import { SanitizationService, ClientRecord } from './sanitization.service';
import { DcmIdService } from './dcm-id.service';

describe('SanitizationService', () => {
  let service: SanitizationService;
  let dcmIdService: DcmIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanitizationService, DcmIdService],
    }).compile();

    service = module.get<SanitizationService>(SanitizationService);
    dcmIdService = module.get<DcmIdService>(DcmIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeForVendor', () => {
    const mockRecords: ClientRecord[] = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        phone: '555-1234',
        // Sensitive fields that should be removed
        customerId: 'CUST001',
        totalSales: 1500,
        visit1Date: new Date('2024-09-01'),
        totalVisits: 3,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        phone: '555-5678',
        // Sensitive fields
        signupDate: new Date('2024-08-15'),
        totalSales: 2500,
      },
    ];

    it('should remove all sensitive fields', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      result.sanitizedRecords.forEach((record) => {
        expect(record.customerId).toBeUndefined();
        expect(record.totalSales).toBeUndefined();
        expect(record.visit1Date).toBeUndefined();
        expect(record.signupDate).toBeUndefined();
        expect(record.totalVisits).toBeUndefined();
      });
    });

    it('should keep only safe contact fields', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      const sanitized = result.sanitizedRecords[0];
      expect(sanitized.dcmId).toBeDefined();
      expect(sanitized.name).toBeDefined();
      expect(sanitized.email).toBeDefined();
      expect(sanitized.address).toBeDefined();
      expect(sanitized.phone).toBeDefined();
    });

    it('should generate DCM_IDs for all records', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      expect(result.sanitizedRecords.length).toBe(2);
      result.sanitizedRecords.forEach((record, index) => {
        expect(record.dcmId).toContain('TIDE123');
        expect(record.dcmId).toContain('HOU');
      });
    });

    it('should create DCM_ID mapping', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      expect(result.dcmIdMapping.size).toBe(2);
      result.sanitizedRecords.forEach((sanitized) => {
        const original = result.dcmIdMapping.get(sanitized.dcmId);
        expect(original).toBeDefined();
      });
    });

    it('should track missing emails', async () => {
      const recordsWithMissingEmail: ClientRecord[] = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St',
        },
        {
          name: 'Jane Smith',
          email: '', // Missing email
          address: '456 Oak Ave',
        },
        {
          name: 'Bob Wilson',
          // No email field
          address: '789 Pine Rd',
        },
      ];

      const result = await service.sanitizeForVendor(
        recordsWithMissingEmail,
        'TIDE123',
        'HOU',
      );

      expect(result.statistics.missingEmails).toBe(2);
      expect(result.statistics.missingEmailPercentage).toBeCloseTo(66.67, 1);
    });

    it('should combine first and last names', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      const secondRecord = result.sanitizedRecords[1];
      expect(secondRecord.name).toBe('Jane Smith');
    });

    it('should combine address components', async () => {
      const result = await service.sanitizeForVendor(
        mockRecords,
        'TIDE123',
        'HOU',
      );

      const secondRecord = result.sanitizedRecords[1];
      expect(secondRecord.address).toContain('Houston');
      expect(secondRecord.address).toContain('TX');
      expect(secondRecord.address).toContain('77001');
    });
  });

  describe('validateNoLeaks - Privacy Protection', () => {
    it('should remove sensitive fields from input data', async () => {
      const recordsWithSensitiveData = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St',
          customerId: 'CUST001', // Should be removed
          totalSales: 1000, // Should be removed
        },
      ];

      const result = await service.sanitizeForVendor(
        recordsWithSensitiveData,
        'TIDE123',
        'HOU',
      );

      // Verify sensitive fields are NOT in sanitized output
      result.sanitizedRecords.forEach((record) => {
        expect(record.customerId).toBeUndefined();
        expect(record.totalSales).toBeUndefined();
        // Only safe fields should be present
        expect(record.dcmId).toBeDefined();
        expect(record.name).toBeDefined();
        expect(record.email).toBeDefined();
        expect(record.address).toBeDefined();
        expect(record.phone).toBeDefined();
      });
    });

    it('should pass validation for clean data', async () => {
      const cleanRecords: ClientRecord[] = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St',
          phone: '555-1234',
        },
      ];

      const result = await service.sanitizeForVendor(
        cleanRecords,
        'TIDE123',
        'HOU',
      );

      expect(result.sanitizedRecords).toHaveLength(1);
    });
  });

  describe('createVendorExcel', () => {
    it('should create Excel buffer', async () => {
      const sanitizedRecords = [
        {
          dcmId: 'TIDE123-HOU-1700000000-00001',
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St',
          phone: '555-1234',
        },
      ];

      const buffer = await service.createVendorExcel(
        sanitizedRecords,
        'TIDE123-HOU',
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
