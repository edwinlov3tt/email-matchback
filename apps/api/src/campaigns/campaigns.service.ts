import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CampaignStatus } from '@matchback/types';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  /**
   * Create a new campaign with auto-generated email endpoint
   */
  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    // Validate markets (ensure no duplicates)
    const uniqueMarkets = [...new Set(createCampaignDto.markets)];
    if (uniqueMarkets.length !== createCampaignDto.markets.length) {
      throw new BadRequestException('Duplicate markets detected');
    }

    // Generate unique email endpoint
    const emailEndpoint = this.generateEmailEndpoint(
      createCampaignDto.billingNumber,
      createCampaignDto.name,
    );

    // Check if email endpoint already exists
    const existingCampaign = await this.campaignRepository.findOne({
      where: { emailEndpoint },
    });

    if (existingCampaign) {
      throw new BadRequestException('Campaign with similar name and billing number already exists');
    }

    // Create campaign entity
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      emailEndpoint,
      status: 'pending',
      priority: createCampaignDto.priority || 'normal',
      metrics: null,
    });

    return this.campaignRepository.save(campaign);
  }

  /**
   * Find all campaigns with optional filtering
   */
  async findAll(filters?: {
    status?: string;
    market?: string;
    campaignType?: string;
  }): Promise<Campaign[]> {
    const query = this.campaignRepository.createQueryBuilder('campaign');

    if (filters?.status) {
      query.andWhere('campaign.status = :status', { status: filters.status });
    }

    if (filters?.market) {
      query.andWhere(':market = ANY(campaign.markets)', { market: filters.market });
    }

    if (filters?.campaignType) {
      query.andWhere('campaign.campaignType = :campaignType', {
        campaignType: filters.campaignType,
      });
    }

    query.orderBy('campaign.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Find one campaign by ID
   */
  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['records'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign
   */
  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);

    // Validate status transitions
    if (updateCampaignDto.status) {
      this.validateStatusTransition(campaign.status, updateCampaignDto.status);
    }

    // Validate markets if updated
    if (updateCampaignDto.markets) {
      const uniqueMarkets = [...new Set(updateCampaignDto.markets)];
      if (uniqueMarkets.length !== updateCampaignDto.markets.length) {
        throw new BadRequestException('Duplicate markets detected');
      }
    }

    // Update campaign
    Object.assign(campaign, updateCampaignDto);

    return this.campaignRepository.save(campaign);
  }

  /**
   * Update campaign status (convenience method)
   */
  async updateStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    return this.update(id, { status });
  }

  /**
   * Delete a campaign (soft delete by setting status to 'error')
   */
  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);

    // Prevent deletion of campaigns with records
    if (campaign.records && campaign.records.length > 0) {
      throw new BadRequestException(
        'Cannot delete campaign with existing match records. Archive it instead.',
      );
    }

    await this.campaignRepository.remove(campaign);
  }

  /**
   * Generate unique email endpoint for vendor communication
   * Format: {billingNumber}-{sanitizedName}-{timestamp}@matchbacktool.com
   */
  private generateEmailEndpoint(billingNumber: string, name: string): string {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = Date.now();

    return `${billingNumber}-${sanitized}-${timestamp}@matchbacktool.com`;
  }

  /**
   * Validate status transitions follow the correct state machine
   * pending → collecting → matching → analyzing → complete
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['collecting', 'error'],
      collecting: ['matching', 'error'],
      matching: ['analyzing', 'error'],
      analyzing: ['complete', 'error'],
      complete: [], // Terminal state
      error: ['pending'], // Can retry from error
    };

    const allowedNextStates = validTransitions[currentStatus] || [];

    if (!allowedNextStates.includes(newStatus) && currentStatus !== newStatus) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". ` +
        `Allowed transitions: ${allowedNextStates.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Get campaign statistics
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const campaigns = await this.campaignRepository.find();

    const byStatus = campaigns.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = campaigns.reduce((acc, campaign) => {
      acc[campaign.campaignType] = (acc[campaign.campaignType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: campaigns.length,
      byStatus,
      byType,
    };
  }
}
