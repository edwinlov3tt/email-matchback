import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let repository: Repository<Campaign>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(Campaign),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    repository = module.get<Repository<Campaign>>(getRepositoryToken(Campaign));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCampaignDto = {
      name: 'September Campaign',
      billingNumber: 'TIDE123',
      dropDate: '2024-09-01',
      markets: ['Houston', 'Austin'],
      campaignType: 'acquisition',
      vendorEmail: 'vendor@example.com',
    };

    it('should create a campaign with generated email endpoint', async () => {
      const mockCampaign = {
        id: '123',
        ...createDto,
        emailEndpoint: 'TIDE123-september-campaign-1234567890@matchbacktool.com',
        status: 'pending',
        priority: 'normal',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCampaign);
      mockRepository.save.mockResolvedValue(mockCampaign);

      const result = await service.create(createDto);

      expect(result.emailEndpoint).toMatch(/TIDE123-september-campaign-\d+@matchbacktool\.com/);
      expect(result.status).toBe('pending');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should reject duplicate markets', async () => {
      const dtoWithDuplicates = {
        ...createDto,
        markets: ['Houston', 'Houston'],
      };

      await expect(service.create(dtoWithDuplicates)).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email endpoint', async () => {
      mockRepository.findOne.mockResolvedValue({ id: '123' });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a campaign if found', async () => {
      const mockCampaign = {
        id: '123',
        name: 'Test Campaign',
        status: 'pending',
      };

      mockRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.findOne('123');
      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockCampaign = {
      id: '123',
      name: 'Test Campaign',
      status: 'pending',
    };

    it('should update a campaign', async () => {
      const updateDto: UpdateCampaignDto = {
        status: 'collecting',
      };

      mockRepository.findOne.mockResolvedValue(mockCampaign);
      mockRepository.save.mockResolvedValue({ ...mockCampaign, ...updateDto });

      const result = await service.update('123', updateDto);
      expect(result.status).toBe('collecting');
    });

    it('should validate status transitions', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockCampaign,
        status: 'complete',
      });

      const invalidUpdate: UpdateCampaignDto = {
        status: 'pending',
      };

      await expect(service.update('123', invalidUpdate)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove campaign without records', async () => {
      const mockCampaign = {
        id: '123',
        records: [],
      };

      mockRepository.findOne.mockResolvedValue(mockCampaign);
      mockRepository.remove.mockResolvedValue(mockCampaign);

      await service.remove('123');
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCampaign);
    });

    it('should prevent deletion of campaigns with records', async () => {
      const mockCampaign = {
        id: '123',
        records: [{ id: '1' }],
      };

      mockRepository.findOne.mockResolvedValue(mockCampaign);

      await expect(service.remove('123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStats', () => {
    it('should return campaign statistics', async () => {
      const mockCampaigns = [
        { status: 'pending', campaignType: 'acquisition' },
        { status: 'pending', campaignType: 'winback' },
        { status: 'complete', campaignType: 'acquisition' },
      ];

      mockRepository.find.mockResolvedValue(mockCampaigns);

      const result = await service.getStats();

      expect(result.total).toBe(3);
      expect(result.byStatus.pending).toBe(2);
      expect(result.byStatus.complete).toBe(1);
      expect(result.byType.acquisition).toBe(2);
      expect(result.byType.winback).toBe(1);
    });
  });
});
