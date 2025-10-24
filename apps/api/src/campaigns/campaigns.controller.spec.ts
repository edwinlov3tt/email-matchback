import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let service: CampaignsService;

  const mockCampaignsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    service = module.get<CampaignsService>(CampaignsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a campaign', async () => {
      const createDto: CreateCampaignDto = {
        name: 'Test Campaign',
        billingNumber: 'TIDE123',
        dropDate: '2024-09-01',
        markets: ['Houston'],
        campaignType: 'acquisition',
        vendorEmail: 'vendor@example.com',
      };

      const mockCampaign = {
        id: '123',
        ...createDto,
        emailEndpoint: 'TIDE123-test-campaign-1234567890@matchbacktool.com',
        status: 'pending' as const,
        priority: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCampaignsService.create.mockResolvedValue(mockCampaign);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCampaign);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of campaigns', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Campaign 1' },
        { id: '2', name: 'Campaign 2' },
      ];

      mockCampaignsService.findAll.mockResolvedValue(mockCampaigns);

      const result = await controller.findAll();

      expect(result).toEqual(mockCampaigns);
      expect(service.findAll).toHaveBeenCalledWith({
        status: undefined,
        market: undefined,
        campaignType: undefined,
      });
    });

    it('should pass filters to service', async () => {
      mockCampaignsService.findAll.mockResolvedValue([]);

      await controller.findAll('pending', 'Houston', 'acquisition');

      expect(service.findAll).toHaveBeenCalledWith({
        status: 'pending',
        market: 'Houston',
        campaignType: 'acquisition',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single campaign', async () => {
      const mockCampaign = { id: '123', name: 'Test Campaign' };

      mockCampaignsService.findOne.mockResolvedValue(mockCampaign);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockCampaign);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      const updateDto: UpdateCampaignDto = {
        status: 'collecting',
      };

      const mockCampaign = {
        id: '123',
        status: 'collecting',
      };

      mockCampaignsService.update.mockResolvedValue(mockCampaign);

      const result = await controller.update('123', updateDto);

      expect(result).toEqual(mockCampaign);
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a campaign', async () => {
      mockCampaignsService.remove.mockResolvedValue(undefined);

      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });

  describe('getStats', () => {
    it('should return campaign statistics', async () => {
      const mockStats = {
        total: 10,
        byStatus: { pending: 5, complete: 5 },
        byType: { acquisition: 8, winback: 2 },
      };

      mockCampaignsService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
