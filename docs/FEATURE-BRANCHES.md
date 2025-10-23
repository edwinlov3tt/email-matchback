# Feature Branch Strategy

This document outlines the feature branch strategy for parallel development using multiple Claude Code instances.

## Branch Structure

```
main (protected)
├── feature/database-schema
├── feature/campaign-management
├── feature/file-processing
├── feature/pattern-analysis
├── feature/email-integration
├── feature/report-generation
├── feature/glassmorphic-ui
├── feature/authentication
├── feature/dashboard-pages
└── feature/data-sanitization
```

## Workflow

1. Main branch is protected - all changes via pull requests
2. Each feature branch is independent and can be worked on in parallel
3. Merge to main only after tests pass and code review complete
4. Use `develop` branch for integration testing before production

## Feature Branch Details

### 1. feature/database-schema

**Owner**: Can start immediately
**Dependencies**: None
**Priority**: High (blocks other features)

**Scope**:
- Campaign entity with all fields
- MatchRecord entity with pattern tracking
- User entity for authentication
- Database migrations (TypeORM)
- Seed data for development
- Indexes on dcmId, customerId, emailAddress

**Files to create**:
```
apps/api/src/
├── campaigns/entities/
│   ├── campaign.entity.ts
│   └── match-record.entity.ts
├── users/entities/
│   └── user.entity.ts
└── database/
    ├── migrations/
    └── seeds/
```

**Acceptance Criteria**:
- [ ] All entities defined with proper TypeORM decorators
- [ ] Migrations run successfully
- [ ] Seed data creates test campaigns
- [ ] Indexes improve query performance
- [ ] Foreign key relationships work correctly

---

### 2. feature/campaign-management

**Owner**: Can start after database-schema merged
**Dependencies**: database-schema
**Priority**: High

**Scope**:
- Campaign CRUD endpoints
- Email endpoint generation (unique per campaign)
- Campaign status state machine
- Market validation
- Date validation

**Files to create**:
```
apps/api/src/campaigns/
├── campaigns.controller.ts
├── campaigns.service.ts
├── campaigns.module.ts
└── dto/
    ├── create-campaign.dto.ts
    └── update-campaign.dto.ts
```

**Acceptance Criteria**:
- [ ] Create campaign generates unique email endpoint
- [ ] Status transitions follow valid state machine
- [ ] Market validation prevents mixing
- [ ] Drop dates validated
- [ ] All CRUD operations tested

---

### 3. feature/file-processing

**Owner**: Can start after database-schema merged
**Dependencies**: database-schema
**Priority**: High

**Scope**:
- Excel file parsing with ExcelJS
- Excel date serial number conversion
- Handle Visit1 vs Visit_1 column variations
- Cloudflare R2 file storage
- Market detection from data
- Data validation and anomaly detection

**Files to create**:
```
apps/api/src/storage/
├── excel.service.ts
├── storage.service.ts
└── storage.module.ts
```

**Key Implementation**:
```typescript
// Use packages/utils/src/excel-date.util.ts
import { excelDateToJS, parseDate } from '@matchback/utils';

// Handle column variations
const visit1 = row.getCell('Visit1').value || row.getCell('Visit_1').value;
```

**Acceptance Criteria**:
- [ ] Parses Excel files correctly
- [ ] Converts Excel serial dates accurately
- [ ] Handles both column naming patterns
- [ ] Uploads to Cloudflare R2
- [ ] Detects market from data
- [ ] Validates data quality

---

### 4. feature/pattern-analysis

**Owner**: Can start after database-schema merged
**Dependencies**: database-schema
**Priority**: High (critical business logic)

**Scope**:
- In-pattern detection (3+ visits)
- **CRITICAL**: Auto-correct new signup flaw
- Customer classification (NEW_SIGNUP, NEW_VISITOR, WINBACK, EXISTING)
- Pattern override logging
- Audit trail

**Files to create**:
```
apps/api/src/patterns/
├── pattern-analysis.service.ts
├── customer-classification.service.ts
├── pattern-correction.service.ts
├── patterns.module.ts
└── patterns.controller.ts
```

**Critical Logic**:
```typescript
// NEW SIGNUP CORRECTION
if (signupMonth === visitMonth && totalVisits >= 3 && inPattern === true) {
  inPattern = false;
  patternOverride = 'NEW_SIGNUP_CORRECTION';
  // Log the correction
}
```

**Acceptance Criteria**:
- [ ] 3+ visits correctly marked as in-pattern
- [ ] New signup flaw auto-corrected
- [ ] Customer types classified accurately
- [ ] All corrections logged
- [ ] Edge cases handled (missing dates, etc.)

---

### 5. feature/email-integration

**Owner**: Can start after campaign-management and file-processing merged
**Dependencies**: campaign-management, file-processing
**Priority**: Medium

**Scope**:
- Resend configuration for inbound email
- Webhook endpoint for vendor responses
- Attachment extraction
- Map email to campaign via endpoint
- Parse vendor Excel responses
- Map matches back to DCM_IDs

**Files to create**:
```
apps/api/src/email/
├── email.controller.ts
├── email.service.ts
├── email-parser.service.ts
├── email.module.ts
└── dto/
    └── inbound-email.dto.ts
```

**Resend Configuration**:
```typescript
import { Resend } from 'resend';

// Send to vendor
await resend.emails.send({
  from: 'noreply@matchbacktool.com',
  to: campaign.vendorEmail,
  attachments: [{ filename: 'data.xlsx', content: buffer }],
});

// Configure webhook for inbound emails
// POST /api/email/inbound
```

**Acceptance Criteria**:
- [ ] Sends emails via Resend
- [ ] Webhook receives inbound emails
- [ ] Extracts attachments correctly
- [ ] Maps to correct campaign
- [ ] Parses vendor responses
- [ ] Updates match records

---

### 6. feature/report-generation

**Owner**: Can start after pattern-analysis merged
**Dependencies**: pattern-analysis
**Priority**: Medium

**Scope**:
- Pivot Table 1: All Matched Sales
- Pivot Table 2: New Customers
- Pivot Table 3: Missing Email Addresses
- CAC calculation
- ROAS calculation
- LTD comparison reports
- Excel export with formatting

**Files to create**:
```
apps/api/src/reports/
├── reports.service.ts
├── pivot-table.service.ts
├── cac-calculator.service.ts
├── reports.controller.ts
└── reports.module.ts
```

**Acceptance Criteria**:
- [ ] All three pivot tables generated
- [ ] CAC calculated correctly
- [ ] ROAS calculated correctly
- [ ] Excel exports match format
- [ ] LTD comparisons accurate

---

### 7. feature/glassmorphic-ui

**Owner**: Can start immediately
**Dependencies**: None
**Priority**: Medium

**Scope**:
- Glassmorphic design tokens
- Animated gradient backgrounds
- Base UI components
- Status badge with animations
- Responsive layouts
- Icon integration (lucide-react)

**Files to create**:
```
apps/web/components/ui/
├── GlassCard.tsx
├── GlassButton.tsx
├── GlassInput.tsx
├── GlassModal.tsx
├── GradientBackground.tsx
└── StatusBadge.tsx
```

**Design Reference**: See project-overview.md for glassmorphic specs

**Acceptance Criteria**:
- [ ] Glassmorphic effects working
- [ ] Animated gradients smooth
- [ ] Components responsive
- [ ] Icons from lucide-react
- [ ] No emojis used

---

### 8. feature/authentication

**Owner**: Can start after database-schema merged
**Dependencies**: database-schema
**Priority**: Medium

**Scope**:
- NextAuth.js configuration
- Email magic links via Resend
- Session management
- Protected API routes
- User roles (admin, client viewer)
- JWT validation on backend

**Files to create**:
```
apps/web/src/
├── app/api/auth/[...nextauth]/route.ts
├── lib/auth.ts
├── components/AuthProvider.tsx
└── middleware.ts

apps/api/src/auth/
├── auth.guard.ts
└── auth.module.ts
```

**Acceptance Criteria**:
- [ ] Magic link emails sent
- [ ] Sessions managed correctly
- [ ] API routes protected
- [ ] User roles enforced
- [ ] JWT tokens validated

---

### 9. feature/dashboard-pages

**Owner**: Can start after glassmorphic-ui and campaign-management merged
**Dependencies**: glassmorphic-ui, campaign-management
**Priority**: Low

**Scope**:
- Dashboard with stats
- Campaign list with filtering
- Campaign creation form
- Campaign detail view
- Client upload page
- Real-time status updates

**Files to create**:
```
apps/web/app/
├── page.tsx
├── campaigns/page.tsx
├── campaigns/new/page.tsx
├── campaigns/[id]/page.tsx
└── upload/[token]/page.tsx

apps/web/components/
├── dashboard/StatCard.tsx
├── campaigns/CampaignTable.tsx
└── campaigns/CampaignForm.tsx
```

**Acceptance Criteria**:
- [ ] Dashboard shows stats
- [ ] Campaign list filterable
- [ ] Campaign form validates
- [ ] Upload page works
- [ ] Real-time updates functional

---

### 10. feature/data-sanitization

**Owner**: Can start after file-processing merged
**Dependencies**: file-processing
**Priority**: High (critical for privacy)

**Scope**:
- Strip sensitive fields
- Keep only matching fields
- Generate DCM_IDs
- Track mappings
- Prepare sanitized Excel
- Validate no leaks

**Files to create**:
```
apps/api/src/matching/
├── sanitization.service.ts
├── dcm-id.service.ts
├── matching.service.ts
└── matching.module.ts
```

**DCM_ID Format**: `{CampaignID}-{Market}-{Timestamp}-{Sequence}`

**Acceptance Criteria**:
- [ ] Sensitive data removed
- [ ] DCM_IDs generated uniquely
- [ ] Mappings tracked
- [ ] No privacy leaks
- [ ] Sanitized Excel created

---

## Development Timeline

### Week 1-2: Foundation
- `feature/database-schema` (Instance 1)
- `feature/glassmorphic-ui` (Instance 2)

### Week 3-4: Core Backend
- `feature/campaign-management` (Instance 1)
- `feature/file-processing` (Instance 2)
- `feature/authentication` (Instance 3)

### Week 5-6: Analysis & Processing
- `feature/pattern-analysis` (Instance 1)
- `feature/data-sanitization` (Instance 2)
- `feature/dashboard-pages` (Instance 3)

### Week 7-8: Communication & Reporting
- `feature/email-integration` (Instance 1)
- `feature/report-generation` (Instance 2)
- Integration testing (Instance 3)

## Pull Request Checklist

Before creating a PR:
- [ ] All tests pass
- [ ] Code coverage >= 80%
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] CLAUDE.md updated if needed
- [ ] Branch up to date with main
- [ ] No console.log statements
- [ ] Types properly defined
- [ ] Error handling implemented

## Git Commands

### Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/branch-name
```

### Push Feature Branch
```bash
git add .
git commit -m "feat(scope): description"
git push -u origin feature/branch-name
```

### Create Pull Request
```bash
gh pr create --title "feat: Feature name" --body "Description"
```

### Keep Branch Updated
```bash
git checkout feature/branch-name
git fetch origin
git rebase origin/main
git push --force-with-lease
```

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
- `feat(campaigns): add email endpoint generation`
- `fix(patterns): correct new signup pattern flaw`
- `docs(readme): update setup instructions`
- `test(excel): add date conversion tests`

## Notes

- Use lucide-react for icons (no emojis)
- Resend for email (not SendGrid)
- Cloudflare R2 for storage (S3-compatible)
- NextAuth.js for authentication
- Pattern correction is CRITICAL
- Audit log all transformations
- Test with real Excel files from context/
