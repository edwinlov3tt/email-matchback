import { Test, TestingModule } from '@nestjs/testing';
import { PatternCorrectionService } from './pattern-correction.service';
import { MatchRecord } from '@matchback/types';

describe('PatternCorrectionService', () => {
  let service: PatternCorrectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatternCorrectionService],
    }).compile();

    service = module.get<PatternCorrectionService>(PatternCorrectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('correctPatternFlaws - CRITICAL LOGIC', () => {
    it('should correct new signup with 3+ visits in signup month', () => {
      // Arrange: New customer signed up Sept 1, 2024, visited 3 times in September
      const record: MatchRecord = {
        id: '1',
        dcmId: 'TEST-001-12345-00001',
        customerId: 'CUST001',
        signupDate: new Date('2024-09-01'),
        visit1Date: new Date('2024-09-05'),
        totalVisits: 3,
        matched: true,
        inPattern: true, // Base rule says in pattern (3+ visits)
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = service.correctPatternFlaws(record);

      // Assert: Should be corrected to OUT of pattern
      expect(result.inPattern).toBe(false);
      expect(result.patternOverride).toBe('NEW_SIGNUP_CORRECTION');
    });

    it('should correct new signup with exactly 3 visits in signup month', () => {
      const record: MatchRecord = {
        id: '2',
        dcmId: 'TEST-002-12345-00002',
        customerId: 'CUST002',
        signupDate: new Date('2024-09-15'),
        visit1Date: new Date('2024-09-20'),
        totalVisits: 3, // Exactly 3 visits (boundary case)
        matched: true,
        inPattern: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      expect(result.inPattern).toBe(false);
      expect(result.patternOverride).toBe('NEW_SIGNUP_CORRECTION');
    });

    it('should correct new signup with 4+ visits in signup month', () => {
      const record: MatchRecord = {
        id: '3',
        dcmId: 'TEST-003-12345-00003',
        customerId: 'CUST003',
        signupDate: new Date('2024-09-01'),
        visit1Date: new Date('2024-09-10'),
        totalVisits: 5,
        matched: true,
        inPattern: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      expect(result.inPattern).toBe(false);
      expect(result.patternOverride).toBe('NEW_SIGNUP_CORRECTION');
    });

    it('should NOT correct if signup and visit are in different months', () => {
      // Signed up Sept, visited in Oct
      const record: MatchRecord = {
        id: '4',
        dcmId: 'TEST-004-12345-00004',
        customerId: 'CUST004',
        signupDate: new Date('2024-09-30'),
        visit1Date: new Date('2024-10-01'),
        totalVisits: 3,
        matched: true,
        inPattern: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      // Should remain in pattern (no correction)
      expect(result.inPattern).toBe(true);
      expect(result.patternOverride).toBeUndefined();
    });

    it('should NOT correct if signup and visit are in different years', () => {
      const record: MatchRecord = {
        id: '5',
        dcmId: 'TEST-005-12345-00005',
        customerId: 'CUST005',
        signupDate: new Date('2023-12-15'),
        visit1Date: new Date('2024-12-10'),
        totalVisits: 3,
        matched: true,
        inPattern: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      expect(result.inPattern).toBe(true);
      expect(result.patternOverride).toBeUndefined();
    });

    it('should NOT correct if totalVisits < 3', () => {
      const record: MatchRecord = {
        id: '6',
        dcmId: 'TEST-006-12345-00006',
        customerId: 'CUST006',
        signupDate: new Date('2024-09-01'),
        visit1Date: new Date('2024-09-05'),
        totalVisits: 2, // Less than 3 visits
        matched: true,
        inPattern: false, // Already out of pattern
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      // Should remain unchanged
      expect(result.inPattern).toBe(false);
      expect(result.patternOverride).toBeUndefined();
    });

    it('should NOT correct if already out of pattern', () => {
      const record: MatchRecord = {
        id: '7',
        dcmId: 'TEST-007-12345-00007',
        customerId: 'CUST007',
        signupDate: new Date('2024-09-01'),
        visit1Date: new Date('2024-09-05'),
        totalVisits: 3,
        matched: true,
        inPattern: false, // Already correctly marked as out of pattern
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      expect(result.inPattern).toBe(false);
      expect(result.patternOverride).toBeUndefined();
    });

    it('should NOT correct if no visit data available', () => {
      const record: MatchRecord = {
        id: '8',
        dcmId: 'TEST-008-12345-00008',
        customerId: 'CUST008',
        signupDate: new Date('2024-09-01'),
        visit1Date: undefined, // No visit data
        totalVisits: 0,
        matched: false,
        inPattern: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.correctPatternFlaws(record);

      expect(result.inPattern).toBe(true);
      expect(result.patternOverride).toBeUndefined();
    });
  });

  describe('correctPatternFlawsBatch', () => {
    it('should correct multiple records in batch', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001-12345-00001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 3,
          matched: true,
          inPattern: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002-12345-00002',
          customerId: 'CUST002',
          signupDate: new Date('2024-09-10'),
          visit1Date: new Date('2024-09-15'),
          totalVisits: 4,
          matched: true,
          inPattern: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003-12345-00003',
          customerId: 'CUST003',
          signupDate: new Date('2023-09-01'), // Different year
          visit1Date: new Date('2024-09-05'),
          totalVisits: 3,
          matched: true,
          inPattern: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = service.correctPatternFlawsBatch(records);

      // First two should be corrected, third should not
      expect(result[0].inPattern).toBe(false);
      expect(result[0].patternOverride).toBe('NEW_SIGNUP_CORRECTION');
      expect(result[1].inPattern).toBe(false);
      expect(result[1].patternOverride).toBe('NEW_SIGNUP_CORRECTION');
      expect(result[2].inPattern).toBe(true);
      expect(result[2].patternOverride).toBeUndefined();
    });

    it('should handle empty batch', () => {
      const result = service.correctPatternFlawsBatch([]);
      expect(result).toEqual([]);
    });
  });

  describe('getCorrectionStatistics', () => {
    it('should calculate correction statistics correctly', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          totalVisits: 3,
          matched: true,
          inPattern: false,
          patternOverride: 'NEW_SIGNUP_CORRECTION',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002',
          customerId: 'CUST002',
          signupDate: new Date('2024-09-01'),
          totalVisits: 2,
          matched: true,
          inPattern: false,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003',
          customerId: 'CUST003',
          signupDate: new Date('2024-09-01'),
          totalVisits: 3,
          matched: true,
          inPattern: false,
          patternOverride: 'NEW_SIGNUP_CORRECTION',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = service.getCorrectionStatistics(records);

      expect(stats.total).toBe(3);
      expect(stats.corrected).toBe(2);
      expect(stats.percentageCorrected).toBeCloseTo(66.67, 1);
      expect(stats.correctedRecords).toHaveLength(2);
    });
  });

  describe('validateCorrections', () => {
    it('should validate that all corrections were applied', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 3,
          matched: true,
          inPattern: false,
          patternOverride: 'NEW_SIGNUP_CORRECTION',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const validation = service.validateCorrections(records);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing corrections', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 3,
          matched: true,
          inPattern: true, // ERROR: Should be false
          // Missing patternOverride
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const validation = service.validateCorrections(records);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('TEST-001');
      expect(validation.errors[0]).toContain('should be OUT of pattern');
    });
  });
});
