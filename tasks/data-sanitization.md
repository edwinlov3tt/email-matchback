# Task: Data Sanitization

**Branch**: `feature/data-sanitization`
**Dependencies**: file-processing
**Priority**: HIGH - Critical for privacy

## Overview
Strip PII, generate DCM_IDs, prepare sanitized Excel for vendor.

## Files
1. `apps/api/src/matching/sanitization.service.ts`
2. `apps/api/src/matching/dcm-id.service.ts`
3. `apps/api/src/matching/matching.service.ts`
4. `apps/api/src/matching/matching.module.ts`

## DCM_ID Format
`{CampaignID}-{Market}-{Timestamp}-{Sequence}`
Example: `TIDE123-HOU-1700000000-00001`

## Key Features
- Remove all sensitive fields (sales, visits, internal IDs)
- Keep only: name, email, address, phone
- Generate unique DCM_ID for tracking
- Create sanitized Excel for vendor
- Validate no PII leaks
