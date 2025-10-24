# Claude Code Instructions: Matchback Automation Platform with Glassmorphic UI

## Project Overview
Build a full-stack matchback automation platform with a modern glassmorphic UI that processes email campaign data to determine business impact while maintaining privacy separation between clients and vendors.

## Tech Stack
- **Frontend**: Next.js 14+ with TypeScript, TailwindCSS, Framer Motion
- **Backend**: NestJS with TypeScript, TypeORM, Bull Queue
- **Database**: PostgreSQL
- **File Processing**: ExcelJS
- **UI Components**: Radix UI primitives for accessibility

## Design System: Glassmorphic Theme

### Color Palette
```typescript
// tailwind.config.js additions
colors: {
  glass: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    dark: '#1a1a2e',
    light: '#f8f9ff',
  },
  status: {
    active: '#10b981',
    processing: '#f59e0b',
    completed: '#3b82f6',
    error: '#ef4444',
  }
}
```

### Glassmorphic Design Principles
```css
/* Core glass effect */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.glass-dark {
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient backgrounds */
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-mesh {
  background: radial-gradient(at 0% 0%, rgba(102, 126, 234, 0.3) 0, transparent 50%),
              radial-gradient(at 100% 0%, rgba(118, 75, 162, 0.3) 0, transparent 50%),
              radial-gradient(at 100% 100%, rgba(240, 147, 251, 0.3) 0, transparent 50%);
}
```

## Project Structure
```
matchback-platform/
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout with glass theme
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── campaigns/
│   │   │   │   │   ├── page.tsx      # Campaigns list
│   │   │   │   │   ├── new/page.tsx  # Create campaign
│   │   │   │   │   └── [id]/page.tsx # Campaign details
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Glassmorphic base components
│   │   │   │   │   ├── GlassCard.tsx
│   │   │   │   │   ├── GlassButton.tsx
│   │   │   │   │   ├── GlassModal.tsx
│   │   │   │   │   ├── GlassInput.tsx
│   │   │   │   │   └── GradientBackground.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── StatCard.tsx
│   │   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   │   └── CampaignPreview.tsx
│   │   │   │   ├── campaigns/
│   │   │   │   │   ├── CampaignTable.tsx
│   │   │   │   │   ├── CampaignForm.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   └── ProgressBar.tsx
│   │   │   │   ├── upload/
│   │   │   │   │   ├── FileUploadZone.tsx
│   │   │   │   │   └── FilePreview.tsx
│   │   │   │   └── analytics/
│   │   │   │       ├── PerformanceChart.tsx
│   │   │   │       └── MetricsGrid.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   └── package.json
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── campaigns/
│       │   │   ├── campaigns.controller.ts
│       │   │   ├── campaigns.service.ts
│       │   │   ├── campaigns.module.ts
│       │   │   ├── dto/
│       │   │   │   ├── create-campaign.dto.ts
│       │   │   │   └── update-campaign.dto.ts
│       │   │   └── entities/
│       │   │       ├── campaign.entity.ts
│       │   │       └── match-record.entity.ts
│       │   ├── matching/
│       │   │   ├── matching.service.ts
│       │   │   ├── dcm-id.service.ts
│       │   │   └── sanitization.service.ts
│       │   ├── patterns/
│       │   │   ├── pattern-analysis.service.ts
│       │   │   ├── customer-classification.service.ts
│       │   │   └── pattern-correction.service.ts
│       │   ├── reports/
│       │   │   ├── reports.service.ts
│       │   │   ├── pivot-table.service.ts
│       │   │   └── cac-calculator.service.ts
│       │   ├── email/
│       │   │   ├── email.controller.ts
│       │   │   └── email-parser.service.ts
│       │   ├── storage/
│       │   │   ├── storage.service.ts
│       │   │   └── excel.service.ts
│       │   └── common/
│       │       ├── guards/
│       │       ├── interceptors/
│       │       └── filters/
│       └── package.json
│
├── package.json                      # Monorepo root
├── turbo.json                        # Turborepo config
└── docker-compose.yml                # Services setup
```

## Step-by-Step Implementation

### Phase 1: Project Setup & Design System

#### Task 1.1: Initialize Monorepo
```bash
# Create project structure
npx create-turbo@latest matchback-platform
cd matchback-platform

# Create Next.js app with App Router
cd apps
npx create-next-app@latest web --typescript --tailwind --app --use-npm
cd ..

# Create NestJS app
cd apps
npx @nestjs/cli new api
cd ../..

# Install shared dependencies
npm install -D @types/node typescript
```

#### Task 1.2: Setup Glassmorphic Design System
Create `apps/web/src/components/ui/GlassCard.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({ children, className, hover = false, gradient = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl p-6',
        'backdrop-blur-xl bg-white/10',
        'border border-white/20',
        'shadow-[0_8px_32px_rgba(31,38,135,0.15)]',
        gradient && 'bg-gradient-to-br from-white/20 to-white/5',
        'before:absolute before:inset-0 before:rounded-2xl',
        'before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50',
        'before:pointer-events-none',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
```

Create `apps/web/src/components/ui/GlassButton.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: GlassButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/30',
    secondary: 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20',
    ghost: 'text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'rounded-xl font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

Create `apps/web/src/components/ui/GradientBackground.tsx`:
```typescript
'use client';

export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  );
}
```

Create `apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          dark: '#1a1a2e',
          light: '#f8f9ff',
        },
        status: {
          active: '#10b981',
          processing: '#f59e0b',
          completed: '#3b82f6',
          error: '#ef4444',
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Phase 2: Frontend Components

#### Task 2.1: Root Layout with Glassmorphic Theme
Create `apps/web/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DCM Matchback Platform',
  description: 'Enterprise matchback automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GradientBackground />
        <Navigation />
        <main className="min-h-screen pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
```

#### Task 2.2: Dashboard Page
Create `apps/web/src/app/page.tsx`:
```typescript
'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-white/60">
          Welcome back! Here's what's happening with your campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Campaigns"
          value="47"
          icon="📊"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Match Accuracy"
          value="92%"
          icon="🎯"
          trend={{ value: 3, positive: true }}
        />
        <StatCard
          label="Avg Processing Time"
          value="4.2h"
          icon="⚡"
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          label="Revenue Attributed"
          value="$2.4M"
          icon="💰"
          trend={{ value: 8, positive: true }}
        />
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Recent Campaign Activity
          </h2>
          <button className="text-glass-primary hover:text-glass-accent transition-colors">
            View All →
          </button>
        </div>
        <CampaignTable />
      </GlassCard>

      {/* Alerts */}
      <GlassCard className="bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-white font-semibold mb-1">
              Attention Required
            </h3>
            <p className="text-white/70">
              3 campaigns have match rates below 50% and require manual review.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
```

#### Task 2.3: Create Campaign Form
Create `apps/web/src/app/campaigns/new/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NewCampaign() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    billingNumber: '',
    name: '',
    market: '',
    dropDate: '',
    campaignType: 'acquisition',
    expectedRecords: '',
    vendorEmail: '',
    priority: 'normal',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call to create campaign
    console.log('Creating campaign:', formData);
    router.push('/campaigns');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Create New Campaign
        </h1>
        <p className="text-white/60">
          Set up a new matchback campaign with automated workflow.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Number */}
            <GlassInput
              label="Billing Number *"
              placeholder="e.g., BL-2024-001"
              required
              value={formData.billingNumber}
              onChange={(e) => setFormData({ ...formData, billingNumber: e.target.value })}
            />

            {/* Campaign Name */}
            <GlassInput
              label="Campaign Name *"
              placeholder="e.g., Holiday Promotion Q4"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            {/* Market Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Market *
              </label>
              <select
                required
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:border-glass-primary focus:ring-2 focus:ring-glass-primary/50 transition-all"
              >
                <option value="">Select Market</option>
                <option value="Houston">Houston</option>
                <option value="Austin">Austin</option>
                <option value="Denver">Denver</option>
                <option value="Amarillo">Amarillo</option>
              </select>
            </div>

            {/* Drop Date */}
            <GlassInput
              label="Drop Date *"
              type="date"
              required
              value={formData.dropDate}
              onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })}
            />

            {/* Campaign Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Campaign Type
              </label>
              <select
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:border-glass-primary focus:ring-2 focus:ring-glass-primary/50 transition-all"
              >
                <option value="acquisition">New Customer Acquisition</option>
                <option value="winback">Winback Campaign</option>
                <option value="retention">Customer Retention</option>
                <option value="seasonal">Seasonal Promotion</option>
              </select>
            </div>

            {/* Expected Records */}
            <GlassInput
              label="Expected Records"
              type="number"
              placeholder="e.g., 10000"
              value={formData.expectedRecords}
              onChange={(e) => setFormData({ ...formData, expectedRecords: e.target.value })}
            />

            {/* Vendor Email */}
            <GlassInput
              label="Vendor Email *"
              type="email"
              placeholder="vendor@example.com"
              required
              value={formData.vendorEmail}
              onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
            />

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:border-glass-primary focus:ring-2 focus:ring-glass-primary/50 transition-all"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Additional campaign details or special instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 focus:border-glass-primary focus:ring-2 focus:ring-glass-primary/50 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <GlassButton type="submit" variant="primary" size="lg">
              Create Campaign
            </GlassButton>
            <GlassButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push('/campaigns')}
            >
              Cancel
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}
```

### Phase 3: Backend Setup

#### Task 3.1: Campaign Module
Create `apps/api/src/campaigns/entities/campaign.entity.ts`:
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MatchRecord } from './match-record.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  billingNumber: string;

  @Column()
  name: string;

  @Column()
  market: string;

  @Column({ type: 'date' })
  dropDate: Date;

  @Column({ type: 'date', nullable: true })
  redropDate: Date;

  @Column()
  campaignType: string;

  @Column({ nullable: true })
  expectedRecords: number;

  @Column()
  vendorEmail: string;

  @Column()
  emailEndpoint: string; // Generated unique email

  @Column({ default: 'pending' })
  status: 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';

  @Column({ default: 'normal' })
  priority: 'normal' | 'high' | 'urgent';

  @Column({ type: 'text', nullable: true })
  notes: string;

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
  };

  @OneToMany(() => MatchRecord, record => record.campaign)
  records: MatchRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Create `apps/api/src/campaigns/campaigns.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    // Generate unique email endpoint
    const emailEndpoint = this.generateEmailEndpoint(
      createCampaignDto.billingNumber,
      createCampaignDto.name
    );

    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      emailEndpoint,
      status: 'pending',
    });

    return await this.campaignsRepository.save(campaign);
  }

  async findAll(): Promise<Campaign[]> {
    return await this.campaignsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['records'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async updateStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = status;
    return await this.campaignsRepository.save(campaign);
  }

  private generateEmailEndpoint(billingNumber: string, name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    return `${billingNumber}-${sanitized}-${timestamp}@matchback.tool.com`;
  }
}
```

#### Task 3.2: Pattern Analysis Service
Create `apps/api/src/patterns/pattern-analysis.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MatchRecord } from '../campaigns/entities/match-record.entity';

interface PatternAnalysisResult {
  record: MatchRecord;
  inPattern: boolean;
  corrected: boolean;
  reason?: string;
}

@Injectable()
export class PatternAnalysisService {
  private readonly logger = new Logger(PatternAnalysisService.name);

  analyzePatterns(records: MatchRecord[]): PatternAnalysisResult[] {
    return records.map(record => this.analyzeRecord(record));
  }

  private analyzeRecord(record: MatchRecord): PatternAnalysisResult {
    // Base rule: 3+ visits = in pattern
    let inPattern = record.totalVisits >= 3;
    let corrected = false;
    let reason: string | undefined;

    // CRITICAL CORRECTION: New signups with 3+ visits should be OUT of pattern
    if (inPattern && this.isNewSignup(record)) {
      inPattern = false;
      corrected = true;
      reason = 'NEW_SIGNUP_CORRECTION: Customer signed up in campaign month with 3+ visits';
      
      this.logger.log(
        `Pattern corrected for ${record.dcmId}: ${reason}`
      );
    }

    return {
      record: {
        ...record,
        inPattern,
        patternOverride: corrected ? reason : null,
      },
      inPattern,
      corrected,
      reason,
    };
  }

  private isNewSignup(record: MatchRecord): boolean {
    if (!record.signupDate || !record.visit1Date) {
      return false;
    }

    const signupMonth = new Date(record.signupDate).getMonth();
    const signupYear = new Date(record.signupDate).getFullYear();
    const visitMonth = new Date(record.visit1Date).getMonth();
    const visitYear = new Date(record.visit1Date).getFullYear();

    // Same month and year = new signup
    return signupMonth === visitMonth && signupYear === visitYear;
  }

  classifyCustomer(record: MatchRecord): string {
    const daysSinceSignup = this.getDaysBetween(
      record.signupDate,
      record.visit1Date || new Date()
    );

    if (daysSinceSignup <= 30) {
      return 'NEW_SIGNUP';
    } else if (daysSinceSignup <= 90) {
      return 'NEW_VISITOR';
    } else if (daysSinceSignup > 365 * 5) {
      return 'WINBACK';
    } else {
      return 'EXISTING';
    }
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
```

### Phase 4: Key Features

#### Task 4.1: File Upload Component
Create `apps/web/src/components/upload/FileUploadZone.tsx`:
```typescript
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

interface FileUploadZoneProps {
  campaignId: string;
  onUpload: (files: File[]) => Promise<void>;
}

export function FileUploadZone({ campaignId, onUpload }: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    setUploading(true);
    
    try {
      await onUpload(acceptedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative rounded-2xl p-12 text-center cursor-pointer
          backdrop-blur-xl bg-white/5 border-2 border-dashed
          transition-all duration-300
          ${isDragActive 
            ? 'border-glass-primary bg-glass-primary/10' 
            : 'border-white/20 hover:border-glass-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="text-6xl mb-4"
        >
          📁
        </motion.div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
        </h3>
        
        <p className="text-white/60">
          Supported formats: Excel (.xlsx, .xls), CSV
        </p>
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-glass-primary to-glass-accent"
              />
            </div>
            <p className="text-sm text-white/60 mt-2">Processing files...</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {uploadedFiles.map((file, index) => (
              <GlassCard key={index} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/60 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓ Uploaded</span>
                  <GlassButton size="sm" variant="secondary">
                    Process
                  </GlassButton>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

#### Task 4.2: Status Badge Component
Create `apps/web/src/components/campaigns/StatusBadge.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
  },
  collecting: {
    label: 'Collecting Data',
    color: 'from-blue-400 to-blue-500',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
  },
  matching: {
    label: 'Matching',
    color: 'from-purple-400 to-purple-500',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
  },
  analyzing: {
    label: 'Analyzing',
    color: 'from-yellow-400 to-yellow-500',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
  },
  complete: {
    label: 'Complete',
    color: 'from-green-400 to-green-500',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
  error: {
    label: 'Error',
    color: 'from-red-400 to-red-500',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'backdrop-blur-xl border text-sm font-medium',
        config.bg,
        config.border,
        className
      )}
    >
      <motion.span
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 2,
          repeat: status === 'matching' || status === 'analyzing' ? Infinity : 0,
        }}
        className={`w-2 h-2 rounded-full bg-gradient-to-br ${config.color}`}
      />
      <span className="text-white">{config.label}</span>
    </motion.div>
  );
}
```

## Environment Setup

Create `apps/api/.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=matchback
DATABASE_PASSWORD=your_password
DATABASE_NAME=matchback_db

# Email
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_DOMAIN=matchback.tool.com

# Storage
AWS_S3_BUCKET=matchback-files
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NODE_ENV=development
PORT=3001
```

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Docker Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: matchback
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: matchback_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app/apps/api

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    volumes:
      - ./apps/web:/app/apps/web

volumes:
  postgres_data:
  redis_data:
```

## Running the Application

```bash
# Install dependencies
npm install

# Start databases
docker-compose up -d postgres redis

# Run migrations
cd apps/api
npm run migration:run

# Start development servers
cd ../..
npm run dev

# Access application
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## Key Features Checklist

- [ ] Glassmorphic UI with gradient backgrounds
- [ ] Smooth animations with Framer Motion
- [ ] Campaign CRUD operations
- [ ] File upload with drag & drop
- [ ] Real-time status updates
- [ ] Pattern analysis with auto-correction
- [ ] Pivot table generation
- [ ] CAC/ROAS calculations
- [ ] Multi-market support
- [ ] Email endpoint generation
- [ ] Audit logging
- [ ] Export to Excel

## Additional Notes

1. **Glassmorphic Design**: All components use `backdrop-blur`, transparent backgrounds, and subtle borders
2. **Animations**: Use Framer Motion for smooth transitions and micro-interactions
3. **Responsiveness**: Mobile-first approach with Tailwind breakpoints
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Performance**: Code-split routes, lazy load components
6. **Error Handling**: Toast notifications for user feedback
7. **Loading States**: Skeleton screens and progress indicators

Build this systematically, starting with the design system, then components, then pages, and finally backend integration. Test each phase before moving to the next.