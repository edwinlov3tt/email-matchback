# Task: Email Integration

**Branch**: `feature/email-integration`
**Dependencies**: campaign-management, file-processing
**Priority**: MEDIUM

## Overview
Resend email sending and inbound webhook handling.

## Files
1. `apps/api/src/email/email.controller.ts`
2. `apps/api/src/email/email.service.ts`
3. `apps/api/src/email/email-parser.service.ts`
4. `apps/api/src/email/email.module.ts`

## Key Features
- Send sanitized Excel to vendor via Resend
- Webhook endpoint for inbound emails
- Parse vendor response Excel
- Map matches back to DCM_IDs
