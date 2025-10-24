# Task: Pattern Analysis

**Branch**: `feature/pattern-analysis`
**Dependencies**: database-schema (MUST be merged first)
**Priority**: HIGH - Contains critical business logic

## Overview
Implement pattern detection and the CRITICAL pattern correction flaw for new signups.

## CRITICAL Business Rule
**Pattern Flaw Correction**: New signups with 3+ visits in signup month MUST be marked as OUT of pattern.

```typescript
// CRITICAL LOGIC - DO NOT MODIFY
if (signupMonth === visitMonth && totalVisits >= 3 && inPattern === true) {
  inPattern = false;
  patternOverride = 'NEW_SIGNUP_CORRECTION';
  // Log this correction
}
```

## Type Safety
```typescript
import { MatchRecord, CustomerType } from '@matchback/types';
```

## Files to Create
1. `apps/api/src/patterns/pattern-analysis.service.ts` - Main pattern logic
2. `apps/api/src/patterns/customer-classification.service.ts` - Customer types
3. `apps/api/src/patterns/pattern-correction.service.ts` - Flaw correction
4. `apps/api/src/patterns/patterns.module.ts` - NestJS module

## Key Logic
- Base rule: 3+ visits = in pattern
- Correction: New signup same month = out of pattern (overrides base rule)
- Classification: NEW_SIGNUP, NEW_VISITOR, WINBACK, EXISTING

## Completion Summary Required
- Confirm pattern correction logic implemented exactly as specified
- Test results showing new signup correction working
- Customer classification examples
