import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendVendorEmailOptions {
  campaignId: string;
  campaignName: string;
  vendorEmail: string;
  vendorName?: string;
  sanitizedExcelBuffer: Buffer;
  sanitizedFileName: string;
  replyToEmail: string; // Campaign-specific email for vendor replies
  campaignDate: Date;
  market: string;
  recordCount: number;
}

export interface SendVendorEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  sentAt: Date;
}

/**
 * Email Service
 *
 * Handles all email operations via Resend:
 * - Send sanitized data to vendors
 * - Generate campaign-specific reply-to addresses
 * - Track email delivery status
 *
 * CRITICAL: Never expose client data in emails
 * - Only send sanitized Excel (no sales, visits, or revenue)
 * - Use unique reply-to addresses per campaign for routing
 * - Include clear instructions for vendor
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly emailDomain: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - email sending disabled');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@matchbacktool.com';
    this.emailDomain = this.configService.get<string>('EMAIL_DOMAIN') || 'matchbacktool.com';
  }

  /**
   * Send sanitized data to vendor for matching
   */
  async sendVendorMatchRequest(options: SendVendorEmailOptions): Promise<SendVendorEmailResult> {
    const {
      campaignId,
      campaignName,
      vendorEmail,
      vendorName,
      sanitizedExcelBuffer,
      sanitizedFileName,
      replyToEmail,
      campaignDate,
      market,
      recordCount,
    } = options;

    this.logger.log(
      `Sending match request to ${vendorEmail} for campaign ${campaignName} (${recordCount} records)`,
    );

    try {
      // Validate email configuration
      if (!this.resend) {
        throw new Error('Email service not configured - missing RESEND_API_KEY');
      }

      // Create email subject
      const subject = `Match Request: ${campaignName} - ${market} (${this.formatDate(campaignDate)})`;

      // Create email body
      const htmlBody = this.generateVendorEmailHtml({
        campaignName,
        vendorName: vendorName || 'Vendor',
        market,
        campaignDate,
        recordCount,
        replyToEmail,
      });

      const textBody = this.generateVendorEmailText({
        campaignName,
        vendorName: vendorName || 'Vendor',
        market,
        campaignDate,
        recordCount,
        replyToEmail,
      });

      // Send email with attachment
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: vendorEmail,
        replyTo: replyToEmail,
        subject,
        html: htmlBody,
        text: textBody,
        attachments: [
          {
            filename: sanitizedFileName,
            content: sanitizedExcelBuffer,
          },
        ],
      });

      this.logger.log(`Email sent successfully: ${result.data?.id}`);

      return {
        success: true,
        emailId: result.data?.id,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${vendorEmail}: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        error: error.message,
        sentAt: new Date(),
      };
    }
  }

  /**
   * Generate campaign-specific reply-to email address
   * Format: {campaignId}-{timestamp}@{domain}
   */
  generateReplyToEmail(campaignId: string): string {
    const timestamp = Date.now();
    return `${campaignId}-${timestamp}@${this.emailDomain}`;
  }

  /**
   * Parse reply-to email to extract campaign ID
   */
  parseCampaignIdFromEmail(email: string): string | null {
    // Extract from format: {campaignId}-{timestamp}@{domain}
    const match = email.match(/^([^-]+)-\d+@/);
    return match ? match[1] : null;
  }

  /**
   * Generate HTML email body for vendor match request
   */
  private generateVendorEmailHtml(params: {
    campaignName: string;
    vendorName: string;
    market: string;
    campaignDate: Date;
    recordCount: number;
    replyToEmail: string;
  }): string {
    const { campaignName, vendorName, market, campaignDate, recordCount, replyToEmail } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #6b7280;
      width: 140px;
    }
    .instructions {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .instructions h3 {
      margin-top: 0;
      color: #92400e;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Match Request: ${campaignName}</h1>
  </div>

  <div class="content">
    <p>Hello ${vendorName},</p>

    <p>We're requesting a match for the following campaign. Please review the attached Excel file containing customer records and return your matches.</p>

    <table class="info-table">
      <tr>
        <td>Campaign</td>
        <td><strong>${campaignName}</strong></td>
      </tr>
      <tr>
        <td>Market</td>
        <td>${market}</td>
      </tr>
      <tr>
        <td>Campaign Date</td>
        <td>${this.formatDate(campaignDate)}</td>
      </tr>
      <tr>
        <td>Records to Match</td>
        <td><strong>${recordCount.toLocaleString()}</strong></td>
      </tr>
    </table>

    <div class="instructions">
      <h3>📋 Instructions</h3>
      <ol>
        <li>Download the attached Excel file</li>
        <li>Add a new column called <strong>"Match"</strong></li>
        <li>Mark each row with <strong>"Y"</strong> (matched) or <strong>"N"</strong> (not matched)</li>
        <li>Reply to this email with the completed Excel file attached</li>
      </ol>
      <p><strong>Important:</strong> Do not modify any existing columns. Only add the "Match" column.</p>
    </div>

    <p><strong>Reply-To Address:</strong> <code>${replyToEmail}</code></p>
    <p style="color: #6b7280; font-size: 14px;">Please reply directly to this email with your completed matches. The system will automatically process your response.</p>
  </div>

  <div class="footer">
    <p>This is an automated message from the Matchback Automation Platform</p>
    <p>If you have questions, please contact your account representative</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text email body for vendor match request
   */
  private generateVendorEmailText(params: {
    campaignName: string;
    vendorName: string;
    market: string;
    campaignDate: Date;
    recordCount: number;
    replyToEmail: string;
  }): string {
    const { campaignName, vendorName, market, campaignDate, recordCount, replyToEmail } = params;

    return `
Match Request: ${campaignName}

Hello ${vendorName},

We're requesting a match for the following campaign. Please review the attached Excel file containing customer records and return your matches.

Campaign Details:
- Campaign: ${campaignName}
- Market: ${market}
- Campaign Date: ${this.formatDate(campaignDate)}
- Records to Match: ${recordCount.toLocaleString()}

INSTRUCTIONS:
1. Download the attached Excel file
2. Add a new column called "Match"
3. Mark each row with "Y" (matched) or "N" (not matched)
4. Reply to this email with the completed Excel file attached

IMPORTANT: Do not modify any existing columns. Only add the "Match" column.

Reply-To Address: ${replyToEmail}

Please reply directly to this email with your completed matches. The system will automatically process your response.

---
This is an automated message from the Matchback Automation Platform
If you have questions, please contact your account representative
    `.trim();
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  /**
   * Send notification email (for errors, alerts, etc.)
   */
  async sendNotification(
    to: string,
    subject: string,
    message: string,
  ): Promise<SendVendorEmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        text: message,
      });

      return {
        success: true,
        emailId: result.data?.id,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send notification to ${to}: ${error.message}`);
      return {
        success: false,
        error: error.message,
        sentAt: new Date(),
      };
    }
  }
}
