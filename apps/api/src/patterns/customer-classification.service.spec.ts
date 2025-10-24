import { Test, TestingModule } from '@nestjs/testing';
import { CustomerClassificationService } from './customer-classification.service';
import { MatchRecord } from '@matchback/types';

describe('CustomerClassificationService', () => {
  let service: CustomerClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerClassificationService],
    }).compile();

    service = module.get<CustomerClassificationService>(
      CustomerClassificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('classifyCustomer', () => {
    const campaignDate = new Date('2024-09-15');

    it('should classify as NEW_SIGNUP when signed up in campaign month', () => {
      const record: MatchRecord = {
        id: '1',
        dcmId: 'TEST-001-12345-00001',
        customerId: 'CUST001',
        signupDate: new Date('2024-09-01'),
        visit1Date: new Date('2024-09-05'),
        totalVisits: 2,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_SIGNUP');
    });

    it('should classify as NEW_SIGNUP when signed up same month, different day', () => {
      const record: MatchRecord = {
        id: '2',
        dcmId: 'TEST-002-12345-00002',
        customerId: 'CUST002',
        signupDate: new Date('2024-09-30'),
        visit1Date: new Date('2024-10-01'),
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_SIGNUP');
    });

    it('should classify as NEW_VISITOR when signed up 1-30 days before visit', () => {
      const record: MatchRecord = {
        id: '3',
        dcmId: 'TEST-003-12345-00003',
        customerId: 'CUST003',
        signupDate: new Date('2024-08-20'), // 16 days before visit
        visit1Date: new Date('2024-09-05'),
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_VISITOR');
    });

    it('should classify as NEW_VISITOR at 1 day boundary', () => {
      const record: MatchRecord = {
        id: '4',
        dcmId: 'TEST-004-12345-00004',
        customerId: 'CUST004',
        signupDate: new Date('2024-08-20'), // Changed to August to avoid campaign month
        visit1Date: new Date('2024-08-21'), // 1 day after signup
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_VISITOR');
    });

    it('should classify as NEW_VISITOR at 30 day boundary', () => {
      const record: MatchRecord = {
        id: '5',
        dcmId: 'TEST-005-12345-00005',
        customerId: 'CUST005',
        signupDate: new Date('2024-08-06'), // Exactly 30 days before
        visit1Date: new Date('2024-09-05'),
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_VISITOR');
    });

    it('should classify as WINBACK when signed up 5+ years ago', () => {
      const record: MatchRecord = {
        id: '6',
        dcmId: 'TEST-006-12345-00006',
        customerId: 'CUST006',
        signupDate: new Date('2019-01-01'), // 5+ years ago
        visit1Date: new Date('2024-09-05'),
        totalVisits: 2,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('WINBACK');
    });

    it('should classify as WINBACK at 5 year boundary', () => {
      const record: MatchRecord = {
        id: '7',
        dcmId: 'TEST-007-12345-00007',
        customerId: 'CUST007',
        signupDate: new Date('2019-09-05'), // Exactly 5 years
        visit1Date: new Date('2024-09-05'),
        totalVisits: 1,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('WINBACK');
    });

    it('should classify as EXISTING for customers not in other categories', () => {
      const record: MatchRecord = {
        id: '8',
        dcmId: 'TEST-008-12345-00008',
        customerId: 'CUST008',
        signupDate: new Date('2023-01-01'), // Signed up over a year ago
        visit1Date: new Date('2024-09-05'),
        totalVisits: 3,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('EXISTING');
    });

    it('should classify as EXISTING when signed up 31+ days before visit', () => {
      const record: MatchRecord = {
        id: '9',
        dcmId: 'TEST-009-12345-00009',
        customerId: 'CUST009',
        signupDate: new Date('2024-08-01'), // 35 days before visit
        visit1Date: new Date('2024-09-05'),
        totalVisits: 2,
        matched: true,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('EXISTING');
    });

    it('should classify as NEW_SIGNUP when no visit data but signup in campaign month', () => {
      const record: MatchRecord = {
        id: '10',
        dcmId: 'TEST-010-12345-00010',
        customerId: 'CUST010',
        signupDate: new Date('2024-09-10'),
        visit1Date: undefined,
        totalVisits: 0,
        matched: false,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('NEW_SIGNUP');
    });

    it('should classify as EXISTING when no visit data and signup not in campaign month', () => {
      const record: MatchRecord = {
        id: '11',
        dcmId: 'TEST-011-12345-00011',
        customerId: 'CUST011',
        signupDate: new Date('2024-01-01'),
        visit1Date: undefined,
        totalVisits: 0,
        matched: false,
        campaignId: 'campaign-1',
        market: 'Boston',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.classifyCustomer(record, campaignDate);

      expect(result.customerType).toBe('EXISTING');
    });
  });

  describe('classifyCustomers (batch)', () => {
    it('should classify multiple customers', () => {
      const campaignDate = new Date('2024-09-15');
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 1,
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
          signupDate: new Date('2024-08-20'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 2,
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
          signupDate: new Date('2019-01-01'),
          visit1Date: new Date('2024-09-05'),
          totalVisits: 1,
          matched: true,
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = service.classifyCustomers(records, campaignDate);

      expect(results[0].customerType).toBe('NEW_SIGNUP');
      expect(results[1].customerType).toBe('NEW_VISITOR');
      expect(results[2].customerType).toBe('WINBACK');
    });
  });

  describe('getTypeDistribution', () => {
    it('should calculate type distribution correctly', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          totalVisits: 1,
          matched: true,
          customerType: 'NEW_SIGNUP',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002',
          customerId: 'CUST002',
          signupDate: new Date('2024-08-20'),
          totalVisits: 2,
          matched: true,
          customerType: 'NEW_SIGNUP',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003',
          customerId: 'CUST003',
          signupDate: new Date('2019-01-01'),
          totalVisits: 1,
          matched: true,
          customerType: 'WINBACK',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          dcmId: 'TEST-004',
          customerId: 'CUST004',
          signupDate: new Date('2023-01-01'),
          totalVisits: 3,
          matched: true,
          customerType: 'EXISTING',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const distribution = service.getTypeDistribution(records);

      expect(distribution.NEW_SIGNUP).toBe(2);
      expect(distribution.NEW_VISITOR).toBe(0);
      expect(distribution.WINBACK).toBe(1);
      expect(distribution.EXISTING).toBe(1);
    });
  });

  describe('getClassificationStatistics', () => {
    it('should calculate statistics correctly', () => {
      const records: MatchRecord[] = [
        {
          id: '1',
          dcmId: 'TEST-001',
          customerId: 'CUST001',
          signupDate: new Date('2024-09-01'),
          totalVisits: 1,
          matched: true,
          customerType: 'NEW_SIGNUP',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          dcmId: 'TEST-002',
          customerId: 'CUST002',
          signupDate: new Date('2024-08-20'),
          totalVisits: 2,
          matched: true,
          customerType: 'NEW_VISITOR',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          dcmId: 'TEST-003',
          customerId: 'CUST003',
          signupDate: new Date('2019-01-01'),
          totalVisits: 1,
          matched: true,
          customerType: 'WINBACK',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          dcmId: 'TEST-004',
          customerId: 'CUST004',
          signupDate: new Date('2023-01-01'),
          totalVisits: 3,
          matched: true,
          customerType: 'EXISTING',
          campaignId: 'campaign-1',
          market: 'Boston',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = service.getClassificationStatistics(records);

      expect(stats.total).toBe(4);
      expect(stats.newSignups).toBe(1);
      expect(stats.newVisitors).toBe(1);
      expect(stats.winbacks).toBe(1);
      expect(stats.existing).toBe(1);
      expect(stats.percentages.NEW_SIGNUP).toBe(25);
      expect(stats.percentages.NEW_VISITOR).toBe(25);
      expect(stats.percentages.WINBACK).toBe(25);
      expect(stats.percentages.EXISTING).toBe(25);
    });
  });
});
