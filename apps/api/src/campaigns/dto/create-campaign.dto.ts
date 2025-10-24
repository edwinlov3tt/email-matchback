import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsInt,
  IsEmail,
  IsDateString,
  Min,
  ArrayMinSize,
} from 'class-validator';
import type { CampaignType, Priority } from '@matchback/types';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  billingNumber: string;

  @IsDateString()
  dropDate: string;

  @IsDateString()
  @IsOptional()
  redropDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  markets: string[];

  @IsEnum(['acquisition', 'winback', 'retention', 'seasonal'])
  campaignType: CampaignType;

  @IsEnum(['normal', 'high', 'urgent'])
  @IsOptional()
  priority?: Priority;

  @IsInt()
  @Min(1)
  @IsOptional()
  expectedRecords?: number;

  @IsEmail()
  @IsNotEmpty()
  vendorEmail: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
