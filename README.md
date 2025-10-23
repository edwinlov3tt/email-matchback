# Matchback Automation Platform

Enterprise-grade matchback processing system that automates the entire workflow of email campaign attribution, from client data collection through vendor matching to final ROI reporting.

## 🎯 Overview

The Matchback Platform solves the complex problem of accurately attributing customer visits and sales to email marketing campaigns. It maintains complete privacy separation between clients and vendors while providing accurate, defensible attribution metrics.

### Key Features
- **Automated Campaign Workflows**: Set it and forget it campaign scheduling
- **Privacy-First Architecture**: Complete isolation between client and vendor data
- **Smart Pattern Analysis**: Automatically identifies campaign-influenced customers
- **Multi-Market Support**: Handles geographic segmentation with cross-market detection
- **Comprehensive Reporting**: Excel-based reports with pivot tables and CAC analysis

## 🚀 Quick Start
```bash
# Clone the repository
git clone https://github.com/your-org/matchback-platform.git
cd matchback-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database credentials

# Run database migrations
npm run migration:run

# Start development server
npm run dev

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- SendGrid account for email processing
- Domain with email routing capability (for campaign endpoints)

## 🏗️ Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│   Platform   │────▶│   Vendor    │
│   (Excel)   │     │              │     │   (Email)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL  │
                    │    Redis     │
                    └──────────────┘
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

## 📝 API Documentation

API documentation is available at `http://localhost:3001/api/docs` when running in development mode.

### Key Endpoints

- `POST /campaigns` - Create new campaign
- `POST /campaigns/:id/upload` - Upload client data
- `GET /campaigns/:id/status` - Check campaign status
- `GET /campaigns/:id/report` - Download final report
- `POST /webhooks/email` - Receive vendor emails

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