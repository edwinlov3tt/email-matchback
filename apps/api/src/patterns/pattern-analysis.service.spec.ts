import { Test, TestingModule } from '@nestjs/testing';
import { PatternAnalysisService } from './pattern-analysis.service';
import { MatchRecord } from '@matchback/types';

describe('PatternAnalysisService', () => {
  let service: PatternAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatternAnalysisService],
    }).compile();

    service = module.get<PatternAnalysisService>(PatternAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzePattern', () => {
    it('should mark customer with 3 visits as IN pattern', () => {
      const record: MatchRecord = {
        id: '1',
        dcmId: 'TEST-001-12345-00001',
        customerId: 'CUST001',
        signupDate: new Date('2024-01-01'),
        visit1Date: new Date('2024-09-01'),
        totalVisits: 3,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(true);
    });

    it('should mark customer with 4+ visits as IN pattern', () => {
      const record: MatchRecord = {
        id: '2',
        dcmId: 'TEST-002-12345-00002',
        customerId: 'CUST002',
        signupDate: new Date('2024-01-01'),
        visit1Date: new Date('2024-09-01'),
        totalVisits: 5,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(true);
    });

    it('should mark customer with 2 visits as OUT of pattern', () => {
      const record: MatchRecord = {
        id: '3',
        dcmId: 'TEST-003-12345-00003',
        customerId: 'CUST003',
        signupDate: new Date('2024-01-01'),
        visit1Date: new Date('2024-09-01'),
        totalVisits: 2,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(false);
    });

    it('should mark customer with 1 visit as OUT of pattern', () => {
      const record: MatchRecord = {
        id: '4',
        dcmId: 'TEST-004-12345-00004',
        customerId: 'CUST004',
        signupDate: new Date('2024-01-01'),
        visit1Date: new Date('2024-09-01'),
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(false);
    });

    it('should mark customer with 0 visits as OUT of pattern', () => {
      const record: MatchRecord = {
        id: '5',
        dcmId: 'TEST-005-12345-00005',
        customerId: 'CUST005',
        signupDate: new Date('2024-01-01'),
        totalVisits: 0,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(false);
    });

    it('should mark customer with no visit data as OUT of pattern', () => {
      const record: MatchRecord = {
        id: '6',
        dcmId: 'TEST-006-12345-00006',
        customerId: 'CUST006',
        signupDate: new Date('2024-01-01'),
        visit1Date: undefined,
        totalVisits: 0,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.analyzePattern(record);

      expect(result.inPattern).toBe(false);
    });
  });

  describe('analyzePatterns (batch)', () => {
    it('should analyze multiple records and provide statistics', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-01-01'),
          visit1Date: new Date('2024-09-01'),
          totalVisits: 5,
          matched: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002',
          customerId: 'CUST002',
          signupDate: new Date('2024-01-01'),
          visit1Date: new Date('2024-09-01'),
          totalVisits: 3,
          matched: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003',
          customerId: 'CUST003',
          signupDate: new Date('2024-01-01'),
          visit1Date: new Date('2024-09-01'),
          totalVisits: 1,
          matched: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = service.analyzePatterns(records);

      expect(results).toHaveLength(3);
      expect(results[0].inPattern).toBe(true);
      expect(results[1].inPattern).toBe(true);
      expect(results[2].inPattern).toBe(false);
    });

    it('should handle empty batch', () => {
      const results = service.analyzePatterns([]);
      expect(results).toEqual([]);
    });
  });

  describe('getPatternStatistics', () => {
    it('should calculate pattern statistics correctly', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-01-01'),
          totalVisits: 5,
          matched: true,
          inPattern: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002',
          customerId: 'CUST002',
          signupDate: new Date('2024-01-01'),
          totalVisits: 3,
          matched: true,
          inPattern: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003',
          customerId: 'CUST003',
          signupDate: new Date('2024-01-01'),
          totalVisits: 1,
          matched: true,
          inPattern: false,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          dcmId: 'TEST-004',
          customerId: 'CUST004',
          signupDate: new Date('2024-01-01'),
          totalVisits: 0,
          matched: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = service.getPatternStatistics(records);

      expect(stats.total).toBe(4);
      expect(stats.inPattern).toBe(2);
      expect(stats.outOfPattern).toBe(1);
      expect(stats.noVisitData).toBe(1);
      expect(stats.percentageInPattern).toBe(50);
      expect(stats.percentageOutOfPattern).toBe(25);
    });

    it('should handle empty records', () => {
      const stats = service.getPatternStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.inPattern).toBe(0);
      expect(stats.outOfPattern).toBe(0);
      expect(stats.noVisitData).toBe(0);
      expect(stats.percentageInPattern).toBe(0);
      expect(stats.percentageOutOfPattern).toBe(0);
    });
  });
});
