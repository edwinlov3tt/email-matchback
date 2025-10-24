# Task: Database Schema

**Branch**: `feature/database-schema`
**Priority**: HIGH - Blocks other features
**Can Start**: Immediately (no dependencies)

## Overview

Create the complete database schema for the matchback platform using TypeORM. This includes Campaign, MatchRecord, and User entities with proper relationships, indexes, and migrations.

## Prerequisites

- Main branch is up to date
- Docker containers running (PostgreSQL, Redis)
- Dependencies installed

```bash
git checkout feature/database-schema
npm install
docker-compose up -d
```

## Type Safety Requirements

**CRITICAL**: Use exact types from `packages/types/src/`

```typescript
// From @matchback/types - DO NOT MODIFY THESE
import type {
  Campaign,
  CampaignStatus,
  CampaignType,
  CampaignMetrics,
  Priority,
} from '@matchback/types';

import type {
  MatchRecord,
  CustomerType,
} from '@matchback/types';
```

## Implementation Steps

### Step 1: Create Campaign Entity

**File**: `apps/api/src/campaigns/entities/campaign.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MatchRecord } from './match-record.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  billingNumber: string;

  @Column({ type: 'date' })
  dropDate: Date;

  @Column({ type: 'date', nullable: true })
  redropDate: Date | null;

  @Column({ type: 'simple-array' })
  markets: string[];

  @Column({ type: 'varchar', length: 255, unique: true })
  emailEndpoint: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'collecting', 'matching', 'analyzing', 'complete', 'error'],
    default: 'pending',
  })
  status: 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';

  @Column({
    type: 'enum',
    enum: ['acquisition', 'winback', 'retention', 'seasonal'],
    default: 'acquisition',
  })
  campaignType: 'acquisition' | 'winback' | 'retention' | 'seasonal';

  @Column({
    type: 'enum',
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  })
  priority: 'normal' | 'high' | 'urgent';

  @Column({ type: 'int', nullable: true })
  expectedRecords: number | null;

  @Column({ type: 'varchar', length: 255 })
  vendorEmail: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    totalRecords?: number;
    matchedRecords?: number;
    matchRate?: number;
    inPattern?: number;
    outOfPattern?: number;
    newCustomers?: number;
    revenue?: number;
    roas?: number;
    cac?: number;
  } | null;

  @OneToMany(() => MatchRecord, (record) => record.campaign)
  records: MatchRecord[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
```

**Type Alignment**: This entity MUST match the `Campaign` interface in `@matchback/types`

### Step 2: Create MatchRecord Entity

**File**: `apps/api/src/campaigns/entities/match-record.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity('match_records')
@Index(['dcmId'], { unique: true })
@Index(['customerId'])
@Index(['emailAddress'])
@Index(['campaignId'])
export class MatchRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  dcmId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  customerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  emailAddress: string | null;

  @Column({ type: 'date' })
  signupDate: Date;

  @Column({ type: 'int', default: 0 })
  totalVisits: number;

  @Column({ type: 'date', nullable: true })
  visit1Date: Date | null;

  @Column({ type: 'boolean', default: false })
  matched: boolean;

  @Column({ type: 'boolean', nullable: true })
  inPattern: boolean | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  patternOverride: string | null;

  @Column({
    type: 'enum',
    enum: ['NEW_SIGNUP', 'NEW_VISITOR', 'WINBACK', 'EXISTING'],
    nullable: true,
  })
  customerType: 'NEW_SIGNUP' | 'NEW_VISITOR' | 'WINBACK' | 'EXISTING' | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalSales: number | null;

  @Column({ type: 'uuid' })
  @Index()
  campaignId: string;

  @Column({ type: 'varchar', length: 100 })
  market: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
```

**Type Alignment**: This entity MUST match the `MatchRecord` interface in `@matchback/types`

### Step 3: Create User Entity

**File**: `apps/api/src/users/entities/user.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({
    type: 'enum',
    enum: ['admin', 'client_viewer'],
    default: 'client_viewer',
  })
  role: 'admin' | 'client_viewer';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
```

### Step 4: Configure TypeORM

**File**: `apps/api/src/database/data-source.ts`

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { MatchRecord } from '../campaigns/entities/match-record.entity';
import { User } from '../users/entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'matchback',
  password: process.env.DATABASE_PASSWORD || 'matchback_dev_password',
  database: process.env.DATABASE_NAME || 'matchback_db',
  entities: [Campaign, MatchRecord, User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
});
```

### Step 5: Create Initial Migration

**File**: `apps/api/src/database/migrations/1700000000000-InitialSchema.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create campaigns table
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "billingNumber" varchar(100) NOT NULL,
        "dropDate" date NOT NULL,
        "redropDate" date,
        "markets" text NOT NULL,
        "emailEndpoint" varchar(255) NOT NULL UNIQUE,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "campaignType" varchar(20) NOT NULL DEFAULT 'acquisition',
        "priority" varchar(20) NOT NULL DEFAULT 'normal',
        "expectedRecords" int,
        "vendorEmail" varchar(255) NOT NULL,
        "notes" text,
        "metrics" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "name" varchar(255),
        "role" varchar(20) NOT NULL DEFAULT 'client_viewer',
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create match_records table
    await queryRunner.query(`
      CREATE TABLE "match_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "dcmId" varchar(255) NOT NULL UNIQUE,
        "customerId" varchar(255) NOT NULL,
        "emailAddress" varchar(255),
        "signupDate" date NOT NULL,
        "totalVisits" int NOT NULL DEFAULT 0,
        "visit1Date" date,
        "matched" boolean NOT NULL DEFAULT false,
        "inPattern" boolean,
        "patternOverride" varchar(255),
        "customerType" varchar(20),
        "totalSales" decimal(10,2),
        "campaignId" uuid NOT NULL,
        "market" varchar(100) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_match_records_dcmId" ON "match_records" ("dcmId")`);
    await queryRunner.query(`CREATE INDEX "IDX_match_records_customerId" ON "match_records" ("customerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_match_records_emailAddress" ON "match_records" ("emailAddress")`);
    await queryRunner.query(`CREATE INDEX "IDX_match_records_campaignId" ON "match_records" ("campaignId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "match_records"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

### Step 6: Create Seed Data

**File**: `apps/api/src/database/seeds/campaign.seed.ts`

```typescript
import { DataSource } from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';

export async function seedCampaigns(dataSource: DataSource): Promise<void> {
  const campaignRepo = dataSource.getRepository(Campaign);

  const campaigns = [
    {
      name: 'September 2024 Houston',
      billingNumber: 'TIDE123',
      dropDate: new Date('2024-09-08'),
      markets: ['Houston'],
      emailEndpoint: 'TIDE123-sep2024-12345@matchbacktool.com',
      status: 'pending' as const,
      campaignType: 'acquisition' as const,
      priority: 'normal' as const,
      vendorEmail: 'vendor@leadme.com',
      expectedRecords: 10000,
    },
    {
      name: 'October 2024 Austin',
      billingNumber: 'TIDE124',
      dropDate: new Date('2024-10-15'),
      markets: ['Austin'],
      emailEndpoint: 'TIDE124-oct2024-12346@matchbacktool.com',
      status: 'pending' as const,
      campaignType: 'winback' as const,
      priority: 'high' as const,
      vendorEmail: 'vendor@leadme.com',
      expectedRecords: 8000,
    },
  ];

  await campaignRepo.save(campaigns);
  console.log('✓ Campaigns seeded successfully');
}
```

**File**: `apps/api/src/database/seeds/user.seed.ts`

```typescript
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  const users = [
    {
      email: 'admin@matchback.com',
      name: 'Admin User',
      role: 'admin' as const,
      isActive: true,
    },
    {
      email: 'client@tidecleaners.com',
      name: 'Tide Cleaners',
      role: 'client_viewer' as const,
      isActive: true,
    },
  ];

  await userRepo.save(users);
  console.log('✓ Users seeded successfully');
}
```

### Step 7: Update App Module

**File**: `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Campaign } from './campaigns/entities/campaign.entity';
import { MatchRecord } from './campaigns/entities/match-record.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'matchback',
      password: process.env.DATABASE_PASSWORD || 'matchback_dev_password',
      database: process.env.DATABASE_NAME || 'matchback_db',
      entities: [Campaign, MatchRecord, User],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Testing Requirements

### Test 1: Entity Relationships

**File**: `apps/api/src/campaigns/entities/campaign.entity.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { MatchRecord } from './match-record.entity';

describe('Campaign Entity', () => {
  let campaignRepo: Repository<Campaign>;
  let matchRecordRepo: Repository<MatchRecord>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Campaign),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MatchRecord),
          useClass: Repository,
        },
      ],
    }).compile();

    campaignRepo = module.get(getRepositoryToken(Campaign));
    matchRecordRepo = module.get(getRepositoryToken(MatchRecord));
  });

  it('should have correct table name', () => {
    expect(campaignRepo.metadata.tableName).toBe('campaigns');
  });

  it('should have uuid primary key', () => {
    expect(campaignRepo.metadata.primaryColumns[0].type).toBe('uuid');
  });

  it('should have relationship with match records', () => {
    const relation = campaignRepo.metadata.relations.find(
      (r) => r.propertyName === 'records'
    );
    expect(relation).toBeDefined();
    expect(relation?.type).toBe(MatchRecord);
  });
});
```

### Test 2: Run Migrations

```bash
# In apps/api directory
npm run migration:run
```

Expected output:
```
✓ InitialSchema1700000000000 migration has been executed successfully
```

### Test 3: Seed Database

```bash
# Run seed script
npm run seed
```

## Validation Checklist

Before marking this task complete, verify:

- [ ] All entity files compile without TypeScript errors
- [ ] TypeORM decorators are correct
- [ ] Migration runs successfully
- [ ] Seed data creates records
- [ ] Indexes are created on dcmId, customerId, emailAddress
- [ ] Foreign key relationships work (cascade delete)
- [ ] Entity types match @matchback/types interfaces exactly
- [ ] No ESLint errors
- [ ] Tests pass

## Completion Summary Requirements

When you complete this task, provide a summary with:

### 1. Files Created
List all files with line counts:
```
apps/api/src/campaigns/entities/campaign.entity.ts - 95 lines
apps/api/src/campaigns/entities/match-record.entity.ts - 110 lines
apps/api/src/users/entities/user.entity.ts - 45 lines
apps/api/src/database/data-source.ts - 30 lines
apps/api/src/database/migrations/1700000000000-InitialSchema.ts - 85 lines
apps/api/src/database/seeds/campaign.seed.ts - 35 lines
apps/api/src/database/seeds/user.seed.ts - 25 lines
apps/api/src/app.module.ts - 40 lines (updated)
apps/api/src/campaigns/entities/campaign.entity.spec.ts - 35 lines

Total: 500 lines of code
```

### 2. Type Definitions Used
Confirm alignment:
```
✓ Campaign entity matches Campaign interface from @matchback/types
✓ MatchRecord entity matches MatchRecord interface from @matchback/types
✓ All enum types match exactly
✓ All field types match exactly
```

### 3. Database Changes
```
Tables created:
- campaigns (15 columns)
- match_records (19 columns)
- users (8 columns)

Indexes created:
- match_records.dcmId (unique)
- match_records.customerId
- match_records.emailAddress
- match_records.campaignId
- users.email (unique)
```

### 4. Tests Added
```
- 1 entity test file
- Coverage: 85%
- All tests passing
```

### 5. Features Unlocked
```
The following features can now be started:
✓ feature/campaign-management (needs Campaign entity)
✓ feature/file-processing (needs MatchRecord entity)
✓ feature/authentication (needs User entity)
✓ feature/pattern-analysis (needs MatchRecord entity)
```

### 6. Known Issues
```
None - all acceptance criteria met
```

## Format Example

```markdown
# Database Schema - COMPLETE

## Summary
Successfully created complete database schema for matchback platform.

## Files Created (9 files, 500 lines)
- Campaign entity with 15 fields
- MatchRecord entity with 19 fields
- User entity with 8 fields
- Initial migration
- Seed data for testing

## Type Safety ✓
All entity types match @matchback/types interfaces exactly.

## Database
- 3 tables created
- 5 indexes added
- Foreign key relationships working
- Migration successful
- Seed data loaded

## Tests ✓
- Entity relationship tests passing
- Coverage: 85%

## Next Steps
Four features can now start in parallel:
1. campaign-management
2. file-processing
3. authentication
4. pattern-analysis
```

## Notes

- Use `npm run migration:generate` to auto-generate migrations after entity changes
- Always test migrations can be reverted with `npm run migration:revert`
- Seed data should be realistic for testing other features
- Indexes are critical for query performance - don't skip them
