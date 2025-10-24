# Task: Campaign Management

**Branch**: `feature/campaign-management`
**Dependencies**: database-schema (MUST be merged first)
**Priority**: HIGH

## Overview
Build complete Campaign CRUD API with email endpoint generation, status management, and market validation.

## Type Safety
```typescript
import { Campaign, CampaignStatus, CampaignType, Priority } from '@matchback/types';
import { CreateCampaignDto } from '@matchback/types';
```

## Files to Create
1. `apps/api/src/campaigns/campaigns.controller.ts` - REST endpoints
2. `apps/api/src/campaigns/campaigns.service.ts` - Business logic
3. `apps/api/src/campaigns/campaigns.module.ts` - NestJS module
4. `apps/api/src/campaigns/dto/create-campaign.dto.ts` - Validation DTO
5. `apps/api/src/campaigns/dto/update-campaign.dto.ts` - Validation DTO

## Key Features
- **Email Endpoint Generation**: Format `{billingNumber}-{sanitizedName}-{timestamp}@matchbacktool.com`
- **Status State Machine**: pending → collecting → matching → analyzing → complete
- **Market Validation**: Ensure no market mixing
- **CRUD Operations**: Create, Read, Update, Delete campaigns

## Implementation Pattern
```typescript
@Injectable()
export class CampaignsService {
  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const emailEndpoint = this.generateEmailEndpoint(dto.billingNumber, dto.name);
    // Create campaign with auto-generated endpoint
  }

  private generateEmailEndpoint(billingNumber: string, name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    return `${billingNumber}-${sanitized}-${timestamp}@matchbacktool.com`;
  }
}
```

## Completion Summary Required
- Files created with line counts
- Endpoints implemented (POST, GET, PATCH, DELETE)
- Email endpoint generation tested
- Type alignment with @matchback/types confirmed
