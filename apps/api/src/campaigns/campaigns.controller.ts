import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * POST /campaigns
   * Create a new campaign
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  /**
   * GET /campaigns
   * List all campaigns with optional filters
   */
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('market') market?: string,
    @Query('campaignType') campaignType?: string,
  ) {
    return this.campaignsService.findAll({ status, market, campaignType });
  }

  /**
   * GET /campaigns/stats
   * Get campaign statistics
   */
  @Get('stats')
  async getStats() {
    return this.campaignsService.getStats();
  }

  /**
   * GET /campaigns/:id
   * Get a single campaign by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  /**
   * PATCH /campaigns/:id
   * Update a campaign
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  /**
   * DELETE /campaigns/:id
   * Delete a campaign (only if no match records exist)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.campaignsService.remove(id);
  }
}
