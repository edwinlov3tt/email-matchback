import { Test, TestingModule } from '@nestjs/testing';
import { CacCalculatorService, MatchRecord } from './cac-calculator.service';

describe('CacCalculatorService', () => {
  let service: CacCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacCalculatorService],
    }).compile();

    service = module.get<CacCalculatorService>(CacCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateMetrics', () => {
    const mockRecords: MatchRecord[] = [
      {
        matched: true,
        inPattern: false,
        totalSales: 100,
        customerType: 'NEW_SIGNUP',
        signupDate: new Date('2024-09-15'),
      },
      {
        matched: true,
        inPattern: false,
        totalSales: 150,
        customerType: 'EXISTING',
      },
      {
        matched: true,
        inPattern: true,
        totalSales: 200,
      },
      {
        matched: false,
        inPattern: false,
        totalSales: 50,
      },
    ];

    it('should calculate total matches correctly', () => {
      const metrics = service.calculateMetrics(mockRecords, 1000);

      expect(metrics.totalMatches).toBe(3);
      expect(metrics.outOfPatternMatches).toBe(2);
      expect(metrics.inPatternMatches).toBe(1);
    });

    it('should calculate revenue correctly', () => {
      const metrics = service.calculateMetrics(mockRecords, 1000);

      expect(metrics.totalRevenue).toBe(450); // 100 + 150 + 200
      expect(metrics.outOfPatternRevenue).toBe(250); // 100 + 150
      expect(metrics.inPatternRevenue).toBe(200);
    });

    it('should calculate CAC correctly', () => {
      const metrics = service.calculateMetrics(mockRecords, 1000);

      expect(metrics.cacAllMatches).toBeCloseTo(333.33, 2); // 1000 / 3
      expect(metrics.cacOutOfPattern).toBe(500); // 1000 / 2
    });

    it('should calculate ROAS correctly', () => {
      const metrics = service.calculateMetrics(mockRecords, 1000);

      expect(metrics.roasOverall).toBeCloseTo(0.45, 2); // 450 / 1000
      expect(metrics.roasOutOfPattern).toBe(0.25); // 250 / 1000
    });

    it('should count new signups correctly', () => {
      const metrics = service.calculateMetrics(mockRecords, 1000);

      expect(metrics.newSignups).toBeGreaterThan(0);
      expect(metrics.newSignupRevenue).toBeGreaterThan(0);
    });

    it('should handle zero campaign cost', () => {
      const metrics = service.calculateMetrics(mockRecords, 0);

      expect(metrics.roasOverall).toBe(0);
      expect(metrics.roasOutOfPattern).toBe(0);
    });

    it('should handle empty records', () => {
      const metrics = service.calculateMetrics([], 1000);

      expect(metrics.totalMatches).toBe(0);
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.cacAllMatches).toBe(0);
    });
  });

  describe('compareMetrics', () => {
    const currentMetrics = {
      campaignCost: 1000,
      totalMatches: 10,
      outOfPatternMatches: 8,
      inPatternMatches: 2,
      totalRevenue: 500,
      outOfPatternRevenue: 400,
      inPatternRevenue: 100,
      cacAllMatches: 100,
      cacOutOfPattern: 125,
      roasOverall: 0.5,
      roasOutOfPattern: 0.4,
      newSignups: 5,
      newSignupRevenue: 250,
      cacNewSignups: 200,
    };

    const previousMetrics = {
      campaignCost: 1000,
      totalMatches: 8,
      outOfPatternMatches: 6,
      inPatternMatches: 2,
      totalRevenue: 400,
      outOfPatternRevenue: 300,
      inPatternRevenue: 100,
      cacAllMatches: 125,
      cacOutOfPattern: 166.67,
      roasOverall: 0.4,
      roasOutOfPattern: 0.3,
      newSignups: 4,
      newSignupRevenue: 200,
      cacNewSignups: 250,
    };

    it('should calculate CAC improvement', () => {
      const comparison = service.compareMetrics(
        currentMetrics,
        previousMetrics,
      );

      // CAC decreased from 166.67 to 125 = -25% (improvement)
      expect(comparison.improvement.cacChange).toBeLessThan(0);
    });

    it('should calculate ROAS improvement', () => {
      const comparison = service.compareMetrics(
        currentMetrics,
        previousMetrics,
      );

      // ROAS increased from 0.3 to 0.4 = +33.33%
      expect(comparison.improvement.roasChange).toBeGreaterThan(0);
    });

    it('should calculate revenue change', () => {
      const comparison = service.compareMetrics(
        currentMetrics,
        previousMetrics,
      );

      // Revenue increased from 300 to 400 = +100
      expect(comparison.improvement.revenueChange).toBe(100);
    });

    it('should include both periods in comparison', () => {
      const comparison = service.compareMetrics(
        currentMetrics,
        previousMetrics,
      );

      expect(comparison.currentMonth).toBe(currentMetrics);
      expect(comparison.previousMonth).toBe(previousMetrics);
    });
  });

  describe('formatForReport', () => {
    const mockMetrics = {
      campaignCost: 1234.56,
      totalMatches: 10,
      outOfPatternMatches: 8,
      inPatternMatches: 2,
      totalRevenue: 5678.9,
      outOfPatternRevenue: 4500.0,
      inPatternRevenue: 1178.9,
      cacAllMatches: 123.46,
      cacOutOfPattern: 154.32,
      roasOverall: 4.6,
      roasOutOfPattern: 3.65,
      newSignups: 5,
      newSignupRevenue: 2500.0,
      cacNewSignups: 246.91,
    };

    it('should format currency values correctly', () => {
      const formatted = service.formatForReport(mockMetrics);

      expect(formatted['Campaign Cost']).toBe('$1234.56');
      expect(formatted['Total Revenue']).toBe('$5678.90');
      expect(formatted['CAC (Out-of-Pattern)']).toBe('$154.32');
    });

    it('should format ROAS values correctly', () => {
      const formatted = service.formatForReport(mockMetrics);

      expect(formatted['ROAS (Overall)']).toBe('4.60x');
      expect(formatted['ROAS (Out-of-Pattern)']).toBe('3.65x');
    });

    it('should format count values correctly', () => {
      const formatted = service.formatForReport(mockMetrics);

      expect(formatted['Total Matches']).toBe('10');
      expect(formatted['Out-of-Pattern Matches']).toBe('8');
      expect(formatted['New Signups']).toBe('5');
    });
  });
});
