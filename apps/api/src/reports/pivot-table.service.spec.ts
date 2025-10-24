import { Test, TestingModule } from '@nestjs/testing';
import { PivotTableService, MatchRecord } from './pivot-table.service';

describe('PivotTableService', () => {
  let service: PivotTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PivotTableService],
    }).compile();

    service = module.get<PivotTableService>(PivotTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMatchedSalesPivot', () => {
    const mockRecords: MatchRecord[] = [
      { matched: true, inPattern: false, totalSales: 100 },
      { matched: true, inPattern: false, totalSales: 150 },
      { matched: true, inPattern: true, totalSales: 200 },
      { matched: false, inPattern: false, totalSales: 50 },
      { matched: false, inPattern: true, totalSales: 75 },
    ];

    it('should create pivot table with correct structure', () => {
      const pivot = service.createMatchedSalesPivot(mockRecords);

      expect(pivot.rows).toHaveLength(4);
      expect(pivot.columns).toEqual(['Count', 'Total Sales']);
      expect(pivot.values).toHaveLength(4);
    });

    it('should calculate matched & out-of-pattern correctly', () => {
      const pivot = service.createMatchedSalesPivot(mockRecords);

      const matchedOutOfPattern = pivot.values[0];
      expect(matchedOutOfPattern[0]).toBe(2); // Count
      expect(matchedOutOfPattern[1]).toBe(250); // Total sales (100 + 150)
    });

    it('should calculate matched & in-pattern correctly', () => {
      const pivot = service.createMatchedSalesPivot(mockRecords);

      const matchedInPattern = pivot.values[1];
      expect(matchedInPattern[0]).toBe(1); // Count
      expect(matchedInPattern[1]).toBe(200); // Total sales
    });

    it('should calculate not matched records correctly', () => {
      const pivot = service.createMatchedSalesPivot(mockRecords);

      const notMatchedOutOfPattern = pivot.values[2];
      const notMatchedInPattern = pivot.values[3];

      expect(notMatchedOutOfPattern[0]).toBe(1);
      expect(notMatchedOutOfPattern[1]).toBe(50);
      expect(notMatchedInPattern[0]).toBe(1);
      expect(notMatchedInPattern[1]).toBe(75);
    });

    it('should calculate totals correctly', () => {
      const pivot = service.createMatchedSalesPivot(mockRecords);

      expect(pivot.totals.columnTotals[0]).toBe(5); // Total count
      expect(pivot.totals.columnTotals[1]).toBe(575); // Total sales
      expect(pivot.totals.grandTotal).toBe(580); // Sum of totals
    });

    it('should handle empty records', () => {
      const pivot = service.createMatchedSalesPivot([]);

      expect(pivot.values).toHaveLength(4);
      expect(pivot.totals.grandTotal).toBe(0);
    });
  });

  describe('createNewCustomersPivot', () => {
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);

    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 6);

    const mockRecords: MatchRecord[] = [
      {
        matched: true,
        inPattern: false,
        totalSales: 100,
        signupDate: recentDate,
      },
      {
        matched: true,
        inPattern: false,
        totalSales: 150,
        signupDate: recentDate,
      },
      {
        matched: true,
        inPattern: false,
        totalSales: 200,
        signupDate: oldDate,
      },
      {
        matched: false,
        inPattern: false,
        totalSales: 50,
        signupDate: recentDate,
      },
    ];

    it('should create pivot table for new customers', () => {
      const pivot = service.createNewCustomersPivot(mockRecords);

      expect(pivot.rows).toBeDefined();
      expect(pivot.columns).toEqual(['Count', 'Total Sales']);
    });

    it('should group by signup month', () => {
      const pivot = service.createNewCustomersPivot(mockRecords);

      // Should have at least one month of data
      expect(pivot.rows.length).toBeGreaterThan(0);
    });

    it('should only include matched customers', () => {
      const pivot = service.createNewCustomersPivot(mockRecords);

      // Total count should be 2 (only matched recent signups)
      const totalCount = pivot.totals.columnTotals[0];
      expect(totalCount).toBe(2);
    });

    it('should calculate sales by month correctly', () => {
      const pivot = service.createNewCustomersPivot(mockRecords);

      // Total sales should be 250 (100 + 150 from recent signups)
      const totalSales = pivot.totals.columnTotals[1];
      expect(totalSales).toBe(250);
    });

    it('should handle records without signupDate', () => {
      const recordsNoDate: MatchRecord[] = [
        { matched: true, inPattern: false, totalSales: 100 },
      ];

      const pivot = service.createNewCustomersPivot(recordsNoDate);

      expect(pivot.rows).toContain('No Data');
    });
  });

  describe('calculateMissingEmailStats', () => {
    const mockRecords: MatchRecord[] = [
      { matched: true, inPattern: false, email: 'test1@example.com' },
      { matched: true, inPattern: false, email: 'test2@example.com' },
      { matched: true, inPattern: true, email: '' },
      { matched: false, inPattern: false }, // No email field
      { matched: false, inPattern: true, email: '   ' }, // Whitespace only
    ];

    it('should count total records correctly', () => {
      const stats = service.calculateMissingEmailStats(mockRecords);

      expect(stats.totalRecords).toBe(5);
    });

    it('should count missing emails correctly', () => {
      const stats = service.calculateMissingEmailStats(mockRecords);

      // 3 missing: empty string, undefined, whitespace
      expect(stats.missingEmails).toBe(3);
    });

    it('should calculate percentage correctly', () => {
      const stats = service.calculateMissingEmailStats(mockRecords);

      expect(stats.missingEmailPercentage).toBeCloseTo(60, 0); // 3/5 = 60%
    });

    it('should handle all emails present', () => {
      const recordsWithEmails: MatchRecord[] = [
        { matched: true, inPattern: false, email: 'test1@example.com' },
        { matched: true, inPattern: false, email: 'test2@example.com' },
      ];

      const stats = service.calculateMissingEmailStats(recordsWithEmails);

      expect(stats.missingEmails).toBe(0);
      expect(stats.missingEmailPercentage).toBe(0);
    });

    it('should handle empty records array', () => {
      const stats = service.calculateMissingEmailStats([]);

      expect(stats.totalRecords).toBe(0);
      expect(stats.missingEmails).toBe(0);
      expect(stats.missingEmailPercentage).toBe(0);
    });
  });

  describe('addPivotTableToWorksheet', () => {
    it('should add pivot table to worksheet without throwing', () => {
      const mockWorksheet: any = {
        mergeCells: jest.fn(),
        getCell: jest.fn().mockReturnValue({
          value: '',
          font: {},
          alignment: {},
          fill: {},
          numFmt: '',
        }),
        columns: [],
      };

      const mockPivotData = {
        rows: ['Row 1', 'Row 2'],
        columns: ['Col 1', 'Col 2'],
        values: [
          [10, 20],
          [30, 40],
        ],
        totals: {
          rowTotals: [30, 70],
          columnTotals: [40, 60],
          grandTotal: 100,
        },
      };

      expect(() => {
        service.addPivotTableToWorksheet(
          mockWorksheet,
          mockPivotData,
          'Test Pivot',
        );
      }).not.toThrow();

      expect(mockWorksheet.mergeCells).toHaveBeenCalled();
      expect(mockWorksheet.getCell).toHaveBeenCalled();
    });
  });

  describe('addMissingEmailStatsToWorksheet', () => {
    it('should add missing email stats without throwing', () => {
      const mockWorksheet: any = {
        mergeCells: jest.fn(),
        getCell: jest.fn().mockReturnValue({
          value: '',
          font: {},
          alignment: {},
          fill: {},
          numFmt: '',
        }),
        columns: [],
      };

      const mockStats = {
        totalRecords: 100,
        missingEmails: 25,
        missingEmailPercentage: 25,
      };

      expect(() => {
        service.addMissingEmailStatsToWorksheet(mockWorksheet, mockStats);
      }).not.toThrow();

      expect(mockWorksheet.mergeCells).toHaveBeenCalled();
      expect(mockWorksheet.getCell).toHaveBeenCalled();
    });
  });
});
