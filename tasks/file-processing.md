# Task: File Processing

**Branch**: `feature/file-processing`
**Dependencies**: database-schema
**Priority**: HIGH

## Overview
Excel parsing, date conversion, Cloudflare R2 storage, market detection.

## Type Safety
```typescript
import { excelDateToJS, parseDate } from '@matchback/utils';
import { MatchRecord, ClientDataRow } from '@matchback/types';
```

## Files
1. `apps/api/src/storage/excel.service.ts`
2. `apps/api/src/storage/storage.service.ts`
3. `apps/api/src/storage/storage.module.ts`

## Key Features
- Parse Excel with ExcelJS
- Handle Visit1 and Visit_1 column variations
- Convert Excel serial dates (1900-01-01 epoch)
- Upload to Cloudflare R2
- Detect market from data

## Critical
Always use `excelDateToJS()` from @matchback/utils for date conversion.
