# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a matchback automation platform that processes email marketing campaign data to determine business impact while maintaining strict privacy separation between clients and vendors. The system automates the entire workflow from campaign setup through vendor matching to final ROI reporting.

**Core Value Proposition**: Reduces matchback processing time from 2-3 days to 2-3 hours while eliminating manual errors and ensuring data privacy.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, TailwindCSS, Framer Motion
- **Backend**: NestJS with TypeScript, TypeORM, Bull Queue
- **Database**: PostgreSQL for structured data, Redis for job queues
- **File Processing**: ExcelJS for Excel manipulation
- **Email**: Resend for transactional email and inbound parsing
- **Storage**: Cloudflare R2 (S3-compatible) for file storage
- **Authentication**: NextAuth.js with email magic links
- **UI Icons**: lucide-react (no emojis)
- **Monorepo**: npm workspaces (apps/api, apps/web, packages/*) with Turborepo

## Architecture Overview

### Data Flow Pipeline

1. **Campaign Setup** → System generates unique email endpoint for vendor communication
2. **Client Upload** → Client submits sales/visit data via secure link
3. **Data Sanitization** → Strip sensitive fields, add internal DCM_IDs for tracking
4. **Vendor Matching** → Send sanitized list to vendor, receive matches via email
5. **Pattern Analysis** → Determine campaign-influenced vs regular customers
6. **Pattern Correction** → Auto-correct classification flaws
7. **Report Generation** → Create pivot tables, CAC summaries, Excel reports

### Privacy Architecture

**Critical**: Complete isolation between client and vendor data.
- Vendor receives only: Names, addresses, phone, email (no sales, visits, or business data)
- Vendor sends back: Match flags only
- Client never knows vendor involvement
- All records tracked via internal DCM_IDs: `{CampaignID}-{Market}-{Timestamp}-{Sequence}`

### Project Structure

```
email-matchback/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── campaigns/            # Campaign CRUD and management
│   │   │   ├── matching/             # Vendor matching logic, DCM_ID generation
│   │   │   ├── patterns/             # Pattern analysis engine with auto-correction
│   │   │   ├── reports/              # Excel report generation, pivot tables, CAC
│   │   │   ├── email/                # Email webhook handling, vendor responses
│   │   │   └── storage/              # S3 file storage, Excel processing
│   │   └── test/
│   └── web/                          # Next.js frontend with glassmorphic UI
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   ├── components/           # Glassmorphic UI components
│       │   └── lib/                  # API client, utilities
├── packages/
│   ├── types/                        # Shared TypeScript types
│   └── utils/                        # Excel date conversion, market detection
├── context/                          # Requirements and example files
└── docker-compose.yml                # PostgreSQL, Redis services
```

## Critical Business Rules

### Pattern Analysis

**Base Rule**: Customer with 3+ visits in a month = "In Pattern" (regular customer, no credit)

**CRITICAL FLAW CORRECTION**: New signups with 3+ visits in signup month must be "Out of Pattern"
- If `signupDate` and `visit1Date` are in the same month AND `totalVisits >= 3`
- Override pattern classification to "Out of Pattern"
- Log reason: `NEW_SIGNUP_CORRECTION`
- This correction is essential for accurate attribution

### Customer Classification

Based on signup date vs visit date comparison:
- **New Signup**: Signed up within campaign month
- **New Visitor**: Signed up 1-30 days before first visit
- **Winback**: Signed up 5+ years ago, returned after campaign
- **Existing**: All others

### Data Quality Rules

1. **Market Separation**: Records from different markets must not be mixed in single processing batch
2. **Missing Emails**: ~25% of records typically lack email addresses - handle gracefully
3. **Date Formats**: Excel dates are serial numbers (days since 1900-01-01) - always convert
4. **Column Variations**: Handle both `Visit1` and `Visit_1` naming patterns
5. **Email Endpoint**: Format: `{BillingNumber}-{CampaignName}-{Timestamp}@matchbacktool.com`

## Development Commands

### Setup

```bash
# Install all dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
cd apps/api && npm run migration:run
```

### Development

```bash
# Start all services in development
npm run dev

# Start backend only
cd apps/api && npm run start:dev

# Start frontend only
cd apps/web && npm run dev

# Access points
# Frontend: http://localhost:3000
# API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- pattern-analysis.service.spec.ts

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Lint and fix
npm run lint:fix

# Format code
npm run format

# Type check (frontend)
cd apps/web && npm run type-check
```

## Key Implementation Patterns

### Excel Processing

```typescript
// Excel dates are serial numbers - always convert
function excelDateToJS(serial: number): Date {
  const epoch = new Date(1900, 0, 1);
  return new Date(epoch.getTime() + (serial - 2) * 86400000);
}

// Handle column name variations (Visit1 vs Visit_1)
function findVisitColumn(row: Row, visitNum: number): Date | null {
  const value = row.getCell(`Visit${visitNum}`).value ||
                row.getCell(`Visit_${visitNum}`).value;
  return value ? excelDateToJS(value as number) : null;
}
```

### Pattern Correction Logic

```typescript
// CRITICAL: Auto-correct pattern flaws
function correctPatternFlaws(record: MatchRecord): MatchRecord {
  const signupMonth = new Date(record.signupDate).getMonth();
  const visitMonth = record.visit1Date ? new Date(record.visit1Date).getMonth() : -1;

  // New signup with 3+ visits in same month = Out of Pattern
  if (signupMonth === visitMonth &&
      record.totalVisits >= 3 &&
      record.inPattern === true) {

    record.inPattern = false;
    record.patternOverride = 'NEW_SIGNUP_CORRECTION';
    logger.log(`Pattern corrected for ${record.dcmId}`);
  }

  return record;
}
```

### DCM_ID Generation

```typescript
// Internal tracking ID format
function generateDcmId(campaign: Campaign, sequence: number): string {
  const timestamp = Date.now();
  return `${campaign.billingNumber}-${campaign.market}-${timestamp}-${sequence.toString().padStart(5, '0')}`;
}
```

### Market Detection

```typescript
// Detect and prevent market mixing
function detectMarkets(records: MatchRecord[]): string[] {
  const markets = new Set(records.map(r => r.market));

  if (markets.size > 1) {
    throw new MarketMixingError(Array.from(markets));
  }

  return Array.from(markets);
}
```

## Email Configuration (Resend)

### Setup
1. Create account at https://resend.com
2. Verify your domain for sending emails
3. Get API key from dashboard
4. Configure inbound email routing for vendor responses

### Inbound Email Parsing
```typescript
// Configure Resend webhook endpoint for inbound emails
// Vendor responses arrive at campaign-specific addresses
// Example: TIDE123-sep2024-12345@matchbacktool.com

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send vendor match request
await resend.emails.send({
  from: 'noreply@matchbacktool.com',
  to: campaign.vendorEmail,
  subject: `Match Request - ${campaign.name}`,
  attachments: [{ filename: 'sanitized-data.xlsx', content: buffer }],
});
```

## File Storage (Cloudflare R2)

### Setup
1. Create Cloudflare account and enable R2
2. Create bucket for matchback files
3. Generate API tokens (account ID, access key, secret key)
4. R2 is S3-compatible - use AWS SDK with custom endpoint

### Configuration
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

## Common Gotchas

1. **Excel Date Conversion**: Always convert serial numbers, never assume date objects
2. **Pattern Correction**: Must run after initial pattern analysis, not during
3. **Email Endpoints**: Must be unique per campaign to route vendor responses correctly
4. **Missing Emails**: Don't fail on missing emails - track percentage in reporting
5. **Visit Tracking**: Some campaigns don't track visits - make pattern analysis optional
6. **Async Processing**: Use Bull Queue for file processing - never block HTTP requests
7. **Audit Trail**: Log every data transformation for accountability
8. **Market Validation**: Check market consistency before processing batch
9. **Resend Rate Limits**: Respect sending limits, implement retry logic
10. **R2 Compatibility**: Use AWS SDK v3 with R2-specific endpoint configuration

## Pivot Table Requirements

Three main pivot tables match current Excel format:

1. **All Matched Sales**: Rows = Match & Pattern, Columns = Total Sales
2. **New Customers**: Rows = Match & SignupDate, Columns = Total Sales & SignupDate
3. **Missing Email Addresses**: Show total records, missing count, percentage

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/matchback
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_DOMAIN=matchbacktool.com
EMAIL_FROM=noreply@matchbacktool.com

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=matchback-files
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com

# Authentication
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
API_PORT=3001
WEB_PORT=3000
```

## Anti-Patterns to Avoid

- Never expose client identity to vendor in any form
- Never skip pattern flaw correction - accuracy depends on it
- Never process files synchronously - always use job queues
- Never mix markets in a single processing batch
- Never lose DCM_ID mapping - it's the only way to trace records
- Never hardcode market names - treat as dynamic data
- Never trust vendor match rates without validation
- Never forget audit logging for transformations

## Testing Strategy

### Unit Tests
- Pattern analysis with edge cases (new signups, winbacks, missing data)
- Excel date conversion accuracy
- DCM_ID generation uniqueness
- Market detection and validation

### E2E Tests
- Complete campaign flow: setup → upload → sanitize → match → report
- Email webhook processing
- Multi-market campaign handling
- Error scenarios (malformed Excel, market mixing, low match rates)

## Performance Expectations

- Handle 100k+ records per campaign
- 24-48 hour vendor turnaround time
- Sub-second dashboard response times
- Automatic retry for failed operations
- Real-time progress updates during processing
