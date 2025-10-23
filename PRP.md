name: "Matchback Automation Platform - Complete Implementation"
description: |

## Purpose
Build a production-ready matchback automation platform that processes email campaign data to determine actual business impact while maintaining complete privacy separation between clients and vendors.

## Core Principles
1. **Privacy First**: Vendor never knows client identity, client never knows about vendor
2. **Data Integrity**: Track every record through the pipeline with DCM_IDs
3. **Smart Analysis**: Automatically correct pattern flaws and classify customers
4. **Scalability**: Handle multiple campaigns and markets simultaneously
5. **Audit Trail**: Log every transformation for accountability

---

## Goal
Create a full-stack web application that automates the entire matchback process from campaign setup through final reporting, reducing processing time from 2-3 days to 2-3 hours while ensuring accuracy and maintaining complete privacy.

## Why
- **Business value**: 90% time reduction in matchback processing
- **Accuracy**: Eliminates manual errors in pattern analysis
- **Scalability**: Handle multiple campaigns without additional staff
- **Problems solved**: Manual Excel manipulation, pattern correction errors, vendor privacy concerns

## What
A web-based platform where:
- Marketing teams set up campaigns with drop dates and markets
- Clients upload sales data through secure links
- System automatically sanitizes and processes data
- Vendor matches are processed via email endpoints
- Reports are generated with pivot tables and CAC analysis

### Success Criteria
- [ ] Campaign setup with automatic email endpoint generation
- [ ] Client data upload with validation and anomaly detection
- [ ] Automated data sanitization preserving privacy
- [ ] Pattern analysis with automatic flaw correction
- [ ] Pivot table generation matching current Excel format
- [ ] Multi-market support with separation validation
- [ ] ROAS and CAC calculation accuracy
- [ ] 24-hour end-to-end processing capability

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.nestjs.com/
  why: Backend framework architecture and patterns
  
- url: https://github.com/exceljs/exceljs
  why: Excel file manipulation and pivot table creation
  
- url: https://docs.bullmq.io/
  why: Job queue for async processing
  
- url: https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
  why: Email parsing for vendor responses
  
- url: https://nextjs.org/docs
  why: Frontend framework and SSR patterns
  
- url: https://react-hook-form.com/
  why: Form handling for file uploads
  
- file: examples/excel-processing.js
  why: Pattern for handling Excel date conversions
  
- file: examples/pattern-analysis.js
  why: Logic for in-pattern detection and correction
```

### Current Codebase Tree
```bash
.
├── package.json
├── .env.example
└── README.md
```

### Desired Codebase Tree
```bash
.
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts             # Application entry
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── campaigns/
│   │   │   │   ├── campaigns.controller.ts
│   │   │   │   ├── campaigns.service.ts
│   │   │   │   ├── campaigns.module.ts
│   │   │   │   └── entities/campaign.entity.ts
│   │   │   ├── matching/
│   │   │   │   ├── matching.service.ts
│   │   │   │   ├── dcm-id.service.ts
│   │   │   │   └── sanitization.service.ts
│   │   │   ├── patterns/
│   │   │   │   ├── pattern-analysis.service.ts
│   │   │   │   ├── customer-classification.service.ts
│   │   │   │   └── pattern-correction.service.ts
│   │   │   ├── reports/
│   │   │   │   ├── reports.service.ts
│   │   │   │   ├── pivot-table.service.ts
│   │   │   │   └── cac-calculator.service.ts
│   │   │   ├── email/
│   │   │   │   ├── email.controller.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── email-parser.service.ts
│   │   │   └── storage/
│   │   │       ├── storage.service.ts
│   │   │       └── excel.service.ts
│   │   └── test/
│   └── web/                         # Next.js frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.tsx       # Dashboard
│       │   │   ├── campaigns/
│       │   │   │   ├── new.tsx     # Create campaign
│       │   │   │   └── [id].tsx    # Campaign details
│       │   │   └── upload/[token].tsx  # Client upload page
│       │   ├── components/
│       │   │   ├── CampaignCard.tsx
│       │   │   ├── FileUploader.tsx
│       │   │   ├── PatternOverview.tsx
│       │   │   └── PivotTableView.tsx
│       │   └── hooks/
│       │       ├── useCampaign.ts
│       │       └── useFileUpload.ts
│       └── package.json
├── packages/
│   ├── types/                      # Shared types
│   │   └── src/
│   │       ├── campaign.types.ts
│   │       ├── matching.types.ts
│   │       └── report.types.ts
│   └── utils/                      # Shared utilities
│       └── src/
│           ├── excel-date.util.ts
│           └── market-detection.util.ts
├── docker-compose.yml
├── .env.example
└── package.json                    # Monorepo root
```

### Known Gotchas & Critical Rules
```typescript
// CRITICAL: Excel dates are serial numbers since 1900-01-01
// CRITICAL: Pattern flaw - new signups with 3+ visits must be OUT of pattern
// CRITICAL: Vendor emails arrive at campaign-specific endpoints
// CRITICAL: ~25% of records have missing emails - handle gracefully
// CRITICAL: Market mixing is a data quality red flag
// CRITICAL: DCM_ID format: {CampaignID}-{Market}-{Timestamp}-{Sequence}
// CRITICAL: Visit columns may be Visit1 or Visit_1 format - handle both
// CRITICAL: Some campaigns don't track visits - pattern analysis optional
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// campaign.entity.ts
@Entity()
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;
  
  @Column()
  billingNumber: string;
  
  @Column()
  dropDate: Date;
  
  @Column({ nullable: true })
  redropDate: Date;
  
  @Column('simple-array')
  markets: string[]; // ['Houston', 'Austin', 'Denver']
  
  @Column()
  emailEndpoint: string; // billing123-camp456@matchback.com
  
  @Column({ default: 'pending' })
  status: 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete';
  
  @OneToMany(() => MatchRecord, record => record.campaign)
  records: MatchRecord[];
}

// match-record.entity.ts  
@Entity()
export class MatchRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  dcmId: string; // CAMP2024Q1-HOU-20240315-00001
  
  @Column()
  customerId: string; // Client's internal ID
  
  @Column({ nullable: true })
  emailAddress: string;
  
  @Column()
  signupDate: Date;
  
  @Column({ default: 0 })
  totalVisits: number;
  
  @Column({ nullable: true })
  visit1Date: Date;
  
  @Column({ default: false })
  matched: boolean;
  
  @Column({ nullable: true })
  inPattern: boolean; // null until analyzed
  
  @Column({ nullable: true })
  patternOverride: string; // Reason for override
  
  @Column({ nullable: true })
  customerType: 'NEW_SIGNUP' | 'NEW_VISITOR' | 'WINBACK' | 'EXISTING';
  
  @ManyToOne(() => Campaign)
  campaign: Campaign;
}

// Pydantic-style validation models
export class ClientDataRow {
  CustomerID: string;
  LastName?: string;
  FirstName?: string;
  EmailAddress?: string;
  SignupDate: number | Date; // Handle Excel serial or date
  Visit1?: number | Date;
  TotalVisits?: number;
  TotalSales?: number;
  // ... other fields
}
```

### List of Tasks
```yaml
Task 1: Initialize Monorepo Structure
CREATE package.json (root):
  - Setup npm workspaces for apps/* and packages/*
  - Add common scripts for building/testing

CREATE apps/api:
  - nest new api --package-manager npm
  - Add dependencies: typeorm, @nestjs/bull, exceljs
  
CREATE apps/web:
  - npx create-next-app@latest web --typescript --tailwind
  - Add dependencies: @tanstack/react-query, react-hook-form

Task 2: Database Setup and Entities
CREATE database migrations:
  - Campaign, MatchRecord, User entities
  - Indexes on dcmId, customerId, emailAddress
  
CONFIGURE TypeORM:
  - Connection to PostgreSQL
  - Auto-migration in development

Task 3: Campaign Management Module
CREATE campaigns module:
  - CRUD operations for campaigns
  - Email endpoint generation logic
  - Scheduling logic for data collection
  
ADD validation:
  - Market validation (no mixing)
  - Date validation for drops

Task 4: File Processing Pipeline
CREATE excel.service.ts:
  - Parse client Excel files
  - Handle date conversions from serial
  - Detect column variations (Visit1 vs Visit_1)
  
CREATE storage.service.ts:
  - S3 upload for files
  - Temporary file handling

Task 5: Data Sanitization Engine
CREATE sanitization.service.ts:
  - Remove sensitive fields
  - Keep only matching fields
  - Generate DCM_IDs
  
CREATE dcm-id.service.ts:
  - Unique ID generation
  - ID tracking throughout pipeline

Task 6: Email Processing System  
CREATE email webhook:
  - Parse SendGrid inbound emails
  - Extract attachments
  - Match to campaign by email address
  
CREATE email.parser.service.ts:
  - Parse vendor Excel responses
  - Map back to DCM_IDs

Task 7: Pattern Analysis Engine
CREATE pattern-analysis.service.ts:
  - Calculate in-pattern (3+ visits)
  - Auto-correct new signup flaw
  - Log all corrections
  
CREATE customer-classification.service.ts:
  - Classify as Winback/New/Existing
  - Date comparison logic

Task 8: Report Generation
CREATE pivot-table.service.ts:
  - Generate matched sales pivot
  - Generate new customers pivot
  - Generate missing emails pivot
  
CREATE report.service.ts:
  - Excel export with formatting
  - CAC calculation
  - LTD comparison

Task 9: Frontend Dashboard
CREATE dashboard pages:
  - Campaign list view
  - Campaign detail with timeline
  - Upload interface for clients
  
ADD real-time updates:
  - WebSocket for status changes
  - Progress indicators

Task 10: Testing and Documentation
CREATE comprehensive tests:
  - Unit tests for all services
  - E2E tests for critical flows
  - Pattern correction validation
  
CREATE documentation:
  - API documentation
  - User guides
  - Deployment guide
```

### Per Task Pseudocode
```typescript
// Task 4: Excel Processing
async processClientFile(file: Buffer, campaignId: string): Promise<void> {
  // Parse Excel with date detection
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file);
  
  const worksheet = workbook.worksheets[0];
  const rows = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const record = {
      customerId: row.getCell('CustomerID').value,
      signupDate: this.excelDateToJS(row.getCell('SignupDate').value),
      // Handle both Visit1 and Visit_1
      visit1: this.findVisitColumn(row, 1),
      totalVisits: row.getCell('TotalVisits').value || 0,
      emailAddress: row.getCell('EmailAddress').value?.toString().trim(),
    };
    
    // Generate DCM_ID
    record.dcmId = this.generateDcmId(campaignId, record);
    
    rows.push(record);
  });
  
  // Validate market separation
  const markets = this.detectMarkets(rows);
  if (markets.length > 1) {
    throw new MarketMixingError(markets);
  }
  
  // Bulk insert
  await this.matchRecordRepo.save(rows);
}

// Task 7: Pattern Correction
correctPatternFlaws(records: MatchRecord[]): MatchRecord[] {
  return records.map(record => {
    const monthsSinceSignup = this.getMonthDiff(
      record.signupDate,
      record.visit1Date
    );
    
    // Critical flaw correction
    if (monthsSinceSignup === 0 && 
        record.totalVisits >= 3 && 
        record.inPattern === true) {
      
      record.inPattern = false;
      record.patternOverride = 'NEW_SIGNUP_CORRECTION';
      
      this.logger.log(`Pattern corrected for ${record.dcmId}`);
    }
    
    return record;
  });
}

// Task 8: Pivot Table Generation
generateMatchedSalesPivot(records: MatchRecord[]): PivotData {
  const matched = records.filter(r => r.matched);
  
  const pivot = {
    inPattern: {
      count: matched.filter(r => r.inPattern).length,
      sales: matched.filter(r => r.inPattern)
        .reduce((sum, r) => sum + r.totalSales, 0)
    },
    outOfPattern: {
      count: matched.filter(r => !r.inPattern).length,
      sales: matched.filter(r => !r.inPattern)
        .reduce((sum, r) => sum + r.totalSales, 0)
    }
  };
  
  // Format for Excel export
  return this.formatPivotForExcel(pivot);
}
```

### Integration Points
```yaml
EMAIL:
  - SendGrid Inbound Parse Webhook
  - Dynamic email addresses via domain routing
  - Attachment processing for vendor files

STORAGE:
  - AWS S3 for Excel file storage
  - Redis for job queues and caching
  - PostgreSQL for structured data

MONITORING:
  - Sentry for error tracking
  - Custom alerts for anomalies
  - Audit logs for all transformations

SCHEDULING:
  - Bull Queue for async processing
  - Cron jobs for reminder emails
  - Automatic retry on failures
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Backend
cd apps/api
npm run lint:fix
npm run format

# Frontend  
cd apps/web
npm run lint
npm run type-check

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// test/pattern-analysis.spec.ts
describe('PatternAnalysisService', () => {
  it('should mark 3+ visits as in-pattern', async () => {
    const record = createMockRecord({ totalVisits: 3 });
    const result = await service.analyze(record);
    expect(result.inPattern).toBe(true);
  });

  it('should correct new signup pattern flaw', async () => {
    const record = createMockRecord({
      signupDate: new Date('2024-09-01'),
      visit1Date: new Date('2024-09-15'),
      totalVisits: 3,
      inPattern: true
    });
    
    const corrected = await service.correctFlaws([record]);
    expect(corrected[0].inPattern).toBe(false);
    expect(corrected[0].patternOverride).toBe('NEW_SIGNUP_CORRECTION');
  });

  it('should handle missing email addresses', async () => {
    const records = [
      createMockRecord({ emailAddress: null }),
      createMockRecord({ emailAddress: 'test@example.com' })
    ];
    
    const stats = service.calculateMissingEmailStats(records);
    expect(stats.missingCount).toBe(1);
    expect(stats.percentage).toBe(50);
  });
});
```
```bash
# Run tests
npm test -- --coverage

# Expected: >80% coverage, all passing
```

### Level 3: E2E Tests
```bash
# Start services
docker-compose up -d

# Run E2E tests
npm run test:e2e

# Test campaign flow
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "September 2024 Houston",
    "billingNumber": "TIDE123",
    "dropDate": "2024-09-08",
    "markets": ["Houston"]
  }'

# Expected: Campaign created with email endpoint
# Response: { "id": "...", "emailEndpoint": "TIDE123-..." }
```

## Final Validation Checklist
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Excel processing handles all date formats
- [ ] Pattern correction catches all edge cases
- [ ] Market separation detects mixing
- [ ] Email endpoints receive and process attachments
- [ ] Pivot tables match Excel format exactly
- [ ] CAC calculations are accurate
- [ ] Audit trail captures all transformations
- [ ] Frontend displays real-time updates

---

## Anti-Patterns to Avoid
- ❌ Don't expose client identity to vendor
- ❌ Don't trust vendor match rates without validation
- ❌ Don't skip pattern flaw correction
- ❌ Don't mix markets in single processing batch
- ❌ Don't lose DCM_ID mapping
- ❌ Don't process synchronously - use queues
- ❌ Don't forget to handle missing emails
- ❌ Don't hardcode market definitions

## Confidence Score: 9/10

High confidence due to:
- Clear business rules from detailed walkthrough
- Sample data files provided showing exact structure
- Well-defined tech stack already chosen
- Comprehensive pattern analysis logic documented
- Clear privacy requirements established

Minor uncertainty around exact Excel pivot table formatting requirements, but core logic is well understood.