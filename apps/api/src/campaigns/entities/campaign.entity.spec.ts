import { Campaign } from './campaign.entity';
import { MatchRecord } from './match-record.entity';
import { User } from '../../users/entities/user.entity';

describe('Entity Definitions', () => {
  describe('Campaign Entity', () => {
    it('should be defined', () => {
      expect(Campaign).toBeDefined();
    });

    it('should create instance with required fields', () => {
      const campaign = new Campaign();
      campaign.name = 'Test Campaign';
      campaign.billingNumber = 'TEST123';
      campaign.dropDate = new Date('2024-09-08');
      campaign.markets = ['Houston'];
      campaign.emailEndpoint = 'test@matchbacktool.com';
      campaign.vendorEmail = 'vendor@example.com';

      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.billingNumber).toBe('TEST123');
      expect(campaign.markets).toEqual(['Houston']);
      expect(campaign.emailEndpoint).toBe('test@matchbacktool.com');
    });
  });

  describe('MatchRecord Entity', () => {
    it('should be defined', () => {
      expect(MatchRecord).toBeDefined();
    });

    it('should create instance with required fields', () => {
      const record = new MatchRecord();
      record.dcmId = 'TIDE123-Houston-12345-00001';
      record.customerId = 'CUST001';
      record.signupDate = new Date('2024-01-01');
      record.totalVisits = 5;
      record.matched = true;
      record.market = 'Houston';
      record.campaignId = 'uuid-test';

      expect(record.dcmId).toBe('TIDE123-Houston-12345-00001');
      expect(record.customerId).toBe('CUST001');
      expect(record.totalVisits).toBe(5);
      expect(record.matched).toBe(true);
      expect(record.market).toBe('Houston');
    });
  });

  describe('User Entity', () => {
    it('should be defined', () => {
      expect(User).toBeDefined();
    });

    it('should create instance with required fields', () => {
      const user = new User();
      user.email = 'test@example.com';
      user.name = 'Test User';
      user.role = 'admin';
      user.isActive = true;

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should enforce CampaignStatus types', () => {
      const campaign = new Campaign();
      campaign.status = 'pending';
      expect(campaign.status).toBe('pending');

      campaign.status = 'complete';
      expect(campaign.status).toBe('complete');
    });

    it('should enforce CustomerType types', () => {
      const record = new MatchRecord();
      record.customerType = 'NEW_SIGNUP';
      expect(record.customerType).toBe('NEW_SIGNUP');

      record.customerType = 'WINBACK';
      expect(record.customerType).toBe('WINBACK');
    });
  });
});
