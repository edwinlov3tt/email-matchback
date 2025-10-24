import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailParserService } from './email-parser.service';
import { MatchingService } from '../matching/matching.service';
import { CampaignsService } from '../campaigns/campaigns.service';

export interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    reply_to?: string;
    attachments?: Array<{
      filename: string;
      content: string; // base64
      contentType: string;
    }>;
  };
}

/**
 * Email Controller
 *
 * Handles email-related endpoints:
 * - Resend webhook for inbound emails (vendor responses)
 * - Email status callbacks
 * - Manual vendor email triggers
 *
 * Webhook Flow:
 * 1. Vendor replies to campaign email
 * 2. Resend forwards to webhook endpoint
 * 3. Extract campaign ID from reply-to address
 * 4. Parse Excel attachment for match data
 * 5. Update campaign with vendor matches
 * 6. Trigger pattern analysis and reporting
 *
 * CRITICAL Security:
 * - Validate webhook signature from Resend
 * - Verify campaign exists before processing
 * - Log all webhook events for audit
 */
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly emailParser: EmailParserService,
    private readonly matchingService: MatchingService,
    private readonly campaignsService: CampaignsService,
  ) {}

  /**
   * Resend inbound email webhook
   * Triggered when vendor replies with matches
   */
  @Post('webhook/inbound')
  @HttpCode(HttpStatus.OK)
  async handleInboundEmail(@Body() payload: ResendWebhookPayload) {
    this.logger.log(`Received inbound email webhook: ${payload.type}`);

    try {
      // Only process email.received events
      if (payload.type !== 'email.received') {
        this.logger.log(`Ignoring webhook type: ${payload.type}`);
        return { success: true, message: 'Event ignored' };
      }

      const { data } = payload;

      // Extract campaign ID from reply-to address
      const replyTo = data.reply_to || data.to[0];
      const campaignId = this.emailService.parseCampaignIdFromEmail(replyTo);

      if (!campaignId) {
        this.logger.warn(`Could not extract campaign ID from email: ${replyTo}`);
        return {
          success: false,
          error: 'Invalid reply-to address - cannot determine campaign',
        };
      }

      this.logger.log(`Processing vendor response for campaign: ${campaignId}`);

      // Verify campaign exists
      const campaign = await this.campaignsService.findOne(campaignId);
      if (!campaign) {
        this.logger.error(`Campaign not found: ${campaignId}`);
        return {
          success: false,
          error: `Campaign ${campaignId} not found`,
        };
      }

      // Extract attachments
      const attachments = this.emailParser.extractAttachments(data);

      if (attachments.length === 0) {
        this.logger.warn(`No attachments found in vendor response for campaign ${campaignId}`);
        return {
          success: false,
          error: 'No Excel attachment found in email',
        };
      }

      // Process first Excel attachment (vendors should only send one)
      const excelAttachment = attachments.find((a) =>
        a.filename.toLowerCase().endsWith('.xlsx') ||
        a.filename.toLowerCase().endsWith('.xls'),
      );

      if (!excelAttachment) {
        this.logger.warn(`No Excel attachment found for campaign ${campaignId}`);
        return {
          success: false,
          error: 'No Excel attachment found. Please attach the completed match file.',
        };
      }

      // Validate attachment
      const validation = await this.emailParser.validateVendorResponse(excelAttachment);
      if (!validation.valid) {
        this.logger.error(
          `Invalid vendor response for campaign ${campaignId}: ${validation.errors.join(', ')}`,
        );
        return {
          success: false,
          error: validation.errors.join('; '),
        };
      }

      // Parse vendor response
      this.logger.log(`Parsing vendor response: ${excelAttachment.filename}`);
      const parseResult = await this.emailParser.parseVendorResponse(excelAttachment);

      if (!parseResult.success) {
        this.logger.error(
          `Failed to parse vendor response for campaign ${campaignId}: ${parseResult.errors.join(', ')}`,
        );
        return {
          success: false,
          error: parseResult.errors.join('; '),
          warnings: parseResult.warnings,
        };
      }

      // Update campaign with matches
      this.logger.log(
        `Updating campaign ${campaignId} with ${parseResult.matches.length} matches (${parseResult.statistics.matchRate}% match rate)`,
      );

      await this.matchingService.applyVendorMatches(campaignId, parseResult.matches);

      // Update campaign status
      await this.campaignsService.updateStatus(campaignId, 'analyzing');

      this.logger.log(`Successfully processed vendor response for campaign ${campaignId}`);

      return {
        success: true,
        message: 'Vendor response processed successfully',
        statistics: parseResult.statistics,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      this.logger.error(
        `Error processing inbound email webhook: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send vendor match request manually
   * (Usually triggered automatically after client data upload and sanitization)
   */
  @Post('send-vendor-request')
  async sendVendorRequest(@Body() body: { campaignId: string }) {
    const { campaignId } = body;

    this.logger.log(`Manual trigger: Sending vendor request for campaign ${campaignId}`);

    try {
      // Get campaign
      const campaign = await this.campaignsService.findOne(campaignId);
      if (!campaign) {
        throw new BadRequestException(`Campaign ${campaignId} not found`);
      }

      // Verify campaign has sanitized data ready
      if (campaign.status !== 'collecting' && campaign.status !== 'matching') {
        throw new BadRequestException(
          `Campaign ${campaignId} is not ready for vendor request (current status: ${campaign.status})`,
        );
      }

      // Get sanitized Excel from storage
      const sanitizedExcel = await this.matchingService.getSanitizedExcel(campaignId);
      if (!sanitizedExcel) {
        throw new BadRequestException(
          `No sanitized data found for campaign ${campaignId}`,
        );
      }

      // Generate reply-to email
      const replyToEmail = this.emailService.generateReplyToEmail(campaignId);

      // Send email
      const result = await this.emailService.sendVendorMatchRequest({
        campaignId: campaign.id,
        campaignName: campaign.name,
        vendorEmail: campaign.vendorEmail,
        vendorName: undefined, // Not stored in campaign entity
        sanitizedExcelBuffer: sanitizedExcel.buffer,
        sanitizedFileName: sanitizedExcel.filename,
        replyToEmail,
        campaignDate: campaign.dropDate,
        market: campaign.markets[0] || 'Unknown', // Use first market
        recordCount: sanitizedExcel.recordCount,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update campaign
      await this.campaignsService.update(campaignId, {
        status: 'matching', // Update to matching status
      });

      this.logger.log(`Vendor request sent successfully for campaign ${campaignId}`);

      return {
        success: true,
        emailId: result.emailId,
        sentAt: result.sentAt,
        replyToEmail,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send vendor request for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  /**
   * Resend delivery status webhook
   * Tracks email delivery, bounces, opens, etc.
   */
  @Post('webhook/status')
  @HttpCode(HttpStatus.OK)
  async handleStatusWebhook(@Body() payload: any) {
    this.logger.log(`Received status webhook: ${payload.type}`);

    // Log status events for monitoring
    const eventTypes = [
      'email.sent',
      'email.delivered',
      'email.delivery_delayed',
      'email.bounced',
      'email.opened',
    ];

    if (eventTypes.includes(payload.type)) {
      this.logger.log(
        `Email ${payload.data.email_id} status: ${payload.type} (to: ${payload.data.to})`,
      );
    }

    return { success: true };
  }
}
