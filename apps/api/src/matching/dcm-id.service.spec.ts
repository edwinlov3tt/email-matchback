import { Test, TestingModule } from '@nestjs/testing';
import { DcmIdService } from './dcm-id.service';

describe('DcmIdService', () => {
  let service: DcmIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DcmIdService],
    }).compile();

    service = module.get<DcmIdService>(DcmIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDcmId', () => {
    it('should generate DCM_ID with correct format', () => {
      const dcmId = service.generateDcmId('TIDE123', 'HOU', 1, 1700000000);
      expect(dcmId).toBe('TIDE123-HOU-1700000000-00001');
    });

    it('should pad sequence number with zeros', () => {
      const dcmId = service.generateDcmId('TIDE123', 'HOU', 42, 1700000000);
      expect(dcmId).toBe('TIDE123-HOU-1700000000-00042');
    });

    it('should handle large sequence numbers', () => {
      const dcmId = service.generateDcmId('TIDE123', 'HOU', 99999, 1700000000);
      expect(dcmId).toBe('TIDE123-HOU-1700000000-99999');
    });

    it('should sanitize campaign ID', () => {
      const dcmId = service.generateDcmId('TIDE-123', 'HOU', 1, 1700000000);
      expect(dcmId).toBe('TIDE123-HOU-1700000000-00001');
    });

    it('should uppercase market code', () => {
      const dcmId = service.generateDcmId('TIDE123', 'hou', 1, 1700000000);
      expect(dcmId).toBe('TIDE123-HOU-1700000000-00001');
    });

    it('should generate unique IDs for different sequences', () => {
      const dcmId1 = service.generateDcmId('TIDE123', 'HOU', 1, 1700000000);
      const dcmId2 = service.generateDcmId('TIDE123', 'HOU', 2, 1700000000);
      expect(dcmId1).not.toBe(dcmId2);
    });
  });

  describe('generateBatch', () => {
    it('should generate multiple DCM_IDs', () => {
      const dcmIds = service.generateBatch('TIDE123', 'HOU', 5, 1700000000);
      expect(dcmIds).toHaveLength(5);
      expect(dcmIds[0]).toBe('TIDE123-HOU-1700000000-00001');
      expect(dcmIds[4]).toBe('TIDE123-HOU-1700000000-00005');
    });

    it('should use same timestamp for all IDs in batch', () => {
      const dcmIds = service.generateBatch('TIDE123', 'HOU', 3, 1700000000);
      dcmIds.forEach((dcmId) => {
        expect(dcmId).toContain('1700000000');
      });
    });
  });

  describe('parseDcmId', () => {
    it('should parse valid DCM_ID', () => {
      const parsed = service.parseDcmId('TIDE123-HOU-1700000000-00001');
      expect(parsed).toEqual({
        campaignId: 'TIDE123',
        market: 'HOU',
        timestamp: 1700000000,
        sequence: 1,
        isValid: true,
      });
    });

    it('should handle invalid format', () => {
      const parsed = service.parseDcmId('INVALID');
      expect(parsed.isValid).toBe(false);
    });

    it('should handle missing components', () => {
      const parsed = service.parseDcmId('TIDE123-HOU');
      expect(parsed.isValid).toBe(false);
    });

    it('should handle non-numeric timestamp', () => {
      const parsed = service.parseDcmId('TIDE123-HOU-ABC-00001');
      expect(parsed.isValid).toBe(false);
    });
  });

  describe('isValidDcmId', () => {
    it('should return true for valid DCM_ID', () => {
      expect(service.isValidDcmId('TIDE123-HOU-1700000000-00001')).toBe(true);
    });

    it('should return false for invalid DCM_ID', () => {
      expect(service.isValidDcmId('INVALID')).toBe(false);
    });
  });

  describe('extractMarket', () => {
    it('should extract market from valid DCM_ID', () => {
      expect(service.extractMarket('TIDE123-HOU-1700000000-00001')).toBe('HOU');
    });

    it('should return null for invalid DCM_ID', () => {
      expect(service.extractMarket('INVALID')).toBeNull();
    });
  });

  describe('extractCampaignId', () => {
    it('should extract campaign ID from valid DCM_ID', () => {
      expect(service.extractCampaignId('TIDE123-HOU-1700000000-00001')).toBe(
        'TIDE123',
      );
    });

    it('should return null for invalid DCM_ID', () => {
      expect(service.extractCampaignId('INVALID')).toBeNull();
    });
  });

  describe('extractSequence', () => {
    it('should extract sequence from valid DCM_ID', () => {
      expect(service.extractSequence('TIDE123-HOU-1700000000-00042')).toBe(42);
    });

    it('should return null for invalid DCM_ID', () => {
      expect(service.extractSequence('INVALID')).toBeNull();
    });
  });
});
