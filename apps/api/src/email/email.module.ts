import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailParserService } from './email-parser.service';
import { FileProcessingModule } from '../file-processing/file-processing.module';
import { MatchingModule } from '../matching/matching.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

/**
 * Email Module
 *
 * Handles all email operations via Resend:
 * - Sending vendor match requests
 * - Receiving and parsing vendor responses via webhooks
 * - Email delivery tracking
 *
 * Dependencies:
 * - FileProcessingModule: Excel parsing for vendor responses
 * - MatchingModule: Apply vendor matches to campaign data
 * - CampaignsModule: Update campaign status
 *
 * Environment Variables Required:
 * - RESEND_API_KEY: Resend API key for sending emails
 * - EMAIL_FROM: From email address (e.g., noreply@matchbacktool.com)
 * - EMAIL_DOMAIN: Domain for generating reply-to addresses (e.g., matchbacktool.com)
 */
@Module({
  imports: [
    ConfigModule,
    FileProcessingModule,
    MatchingModule,
    CampaignsModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailParserService],
  exports: [EmailService, EmailParserService],
})
export class EmailModule {}
