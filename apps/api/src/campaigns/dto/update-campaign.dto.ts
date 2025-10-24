import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import type { CampaignStatus, CampaignMetrics } from '@matchback/types';
import { CreateCampaignDto } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsEnum(['pending', 'collecting', 'matching', 'analyzing', 'complete', 'error'])
  @IsOptional()
  status?: CampaignStatus;

  @IsOptional()
  metrics?: CampaignMetrics;
}
