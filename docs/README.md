# Matchback Automation Platform

Enterprise-grade matchback processing system that automates the entire workflow of email campaign attribution, from client data collection through vendor matching to final ROI reporting.

## Overview

The Matchback Platform solves the complex problem of accurately attributing customer visits and sales to email marketing campaigns. It maintains complete privacy separation between clients and vendors while providing accurate, defensible attribution metrics.

**Core Value**: Reduces matchback processing time from 2-3 days to 2-3 hours while eliminating manual errors.

### Key Features
- Automated Campaign Workflows - Set it and forget it campaign scheduling
- Privacy-First Architecture - Complete isolation between client and vendor data
- Smart Pattern Analysis - Automatically identifies campaign-influenced customers
- Multi-Market Support - Handles geographic segmentation with cross-market detection
- Comprehensive Reporting - Excel-based reports with pivot tables and CAC analysis

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL and Redis)
- Resend account for email
- Cloudflare R2 for file storage

### Setup

```bash
# Clone the repository
git clone https://github.com/edwinlov3tt/email-matchback.git
cd email-matchback

# Install all dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your API keys

# Start PostgreSQL and Redis
docker-compose up -d

# Start development servers
npm run dev

# Access points:
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## Tech Stack

- Frontend: Next.js 14 with App Router, TypeScript, TailwindCSS, Framer Motion
- Backend: NestJS with TypeScript, TypeORM, Bull Queue
- Database: PostgreSQL 15, Redis 7
- Email: Resend for transactional email
- Storage: Cloudflare R2 (S3-compatible)
- Auth: NextAuth.js with email magic links
- Monorepo: npm workspaces with Turborepo

## Architecture

```
Client Upload → Data Sanitization → Vendor Matching → Pattern Analysis → Report Generation
     ↓                 ↓                    ↓                ↓                  ↓
  Excel File      Remove PII          Email via Resend   Correct Flaws    Pivot Tables
                  Add DCM_IDs         Get Matches        Classify Type    CAC/ROAS
```

### Core Workflow
1. **Campaign Setup**: Create campaign with drop dates and markets
2. **Email Campaign**: Vendor sends marketing emails
3. **Data Collection**: Client uploads monthly sales data (~3 weeks post-drop)
4. **Sanitization**: Remove identifying information, add DCM_IDs
5. **Vendor Matching**: Send sanitized data, receive matches
6. **Pattern Analysis**: Identify in-pattern vs out-of-pattern customers
7. **Report Generation**: Create pivot tables and CAC analysis

## 📁 Project Structure
```
matchback-platform/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── campaigns/   # Campaign management
│   │   │   ├── matching/    # Vendor matching logic
│   │   │   ├── patterns/    # Pattern analysis engine
│   │   │   ├── reports/     # Report generation
│   │   │   └── storage/     # File storage handling
│   │   └── test/
│   └── web/                 # Next.js frontend
│       ├── components/      # React components
│       ├── pages/          # Next.js pages
│       └── hooks/          # Custom React hooks
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── docker/                 # Docker configurations
├── docs/                   # Additional documentation
└── scripts/               # Utility scripts
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/matchback
REDIS_URL=redis://localhost:6379

# Email
SENDGRID_API_KEY=SG.xxx
EMAIL_DOMAIN=matchbacktool.com

# Storage
AWS_S3_BUCKET=matchback-files
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Application
NODE_ENV=development
API_PORT=3001
WEB_PORT=3000
```

## 📊 Data Processing

### Pattern Analysis Rules

The system uses sophisticated pattern analysis to determine attribution:

- **In Pattern (No Credit)**: Regular customers with 3+ visits/month
- **Out of Pattern (Credit)**: Campaign-influenced customers
- **Auto-Correction**: New signups with 3+ visits are ALWAYS out of pattern

### Customer Classification
```javascript
Winback: Signed up >5 years ago, returned after campaign
New Visitor: Signed up 1-30 days before first visit
New Signup: Signed up within campaign month
```

## 🧪 Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test suite
npm test -- campaigns.service.spec.ts

# E2E tests
npm run test:e2e
```

## 📈 Performance

- Handles 100k+ records per campaign
- 24-48 hour vendor turnaround
- Sub-second response times for dashboard
- Automatic retry for failed operations

## 🔒 Security

- Complete vendor-client isolation
- Encrypted file storage
- API key authentication
- Rate limiting on all endpoints
- Audit trail for all operations

## 🚀 Deployment

### Production Deployment
```bash
# Build application
npm run build

# Run migrations
npm run migration:run

# Start production server
npm run start:prod
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## Development

### Monorepo Structure

```
email-matchback/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities (Excel, market detection)
├── docs/
│   └── FEATURE-BRANCHES.md  # Feature branch strategy
├── context/          # Requirements and sample files
└── docker-compose.yml
```

### Feature Branch Strategy

See `docs/FEATURE-BRANCHES.md` for detailed feature branch strategy for parallel development.

**10 Feature Branches**:
1. database-schema
2. campaign-management
3. file-processing
4. pattern-analysis
5. email-integration
6. report-generation
7. glassmorphic-ui
8. authentication
9. dashboard-pages
10. data-sanitization

### Development Commands

```bash
# Start all services
npm run dev

# Run tests
npm test

# Lint and format
npm run lint:fix
npm run format

# Type check
npm run type-check

# Database
npm run db:migrate
npm run db:migrate:create -- MigrationName
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the docs/ folder for detailed guides