# Task Instructions

This directory contains detailed implementation instructions for each feature branch in the matchback platform.

## How to Use These Tasks

1. **Check out the feature branch**
   ```bash
   git checkout feature/branch-name
   ```

2. **Read the corresponding task file**
   - Each task file has complete implementation details
   - Type specifications to prevent errors
   - Step-by-step instructions
   - Testing requirements
   - Summary requirements for completion

3. **Follow the instructions exactly**
   - Use specified types from `@matchback/types`
   - Follow exact file paths
   - Implement all validation
   - Write required tests

4. **Provide completion summary**
   - Each task file specifies what summary to provide
   - Include files created, types used, tests added
   - List features that can now be started

## Task Files

### Phase 1 - No Dependencies (Can Run in Parallel)
- [`database-schema.md`](./database-schema.md) - TypeORM entities and migrations
- [`glassmorphic-ui.md`](./glassmorphic-ui.md) - UI component library

### Phase 2 - After Database Schema
- [`campaign-management.md`](./campaign-management.md) - Campaign CRUD API
- [`file-processing.md`](./file-processing.md) - Excel parsing and R2 storage
- [`authentication.md`](./authentication.md) - NextAuth.js setup
- [`pattern-analysis.md`](./pattern-analysis.md) - Pattern detection and correction

### Phase 3 - After Phase 2
- [`email-integration.md`](./email-integration.md) - Resend email handling
- [`report-generation.md`](./report-generation.md) - Pivot tables and CAC
- [`dashboard-pages.md`](./dashboard-pages.md) - Frontend pages
- [`data-sanitization.md`](./data-sanitization.md) - DCM_ID generation

## Parallel Development Matrix

See [`../docs/FEATURE-BRANCHES.md`](../docs/FEATURE-BRANCHES.md) for the complete parallel development strategy showing which features can be worked on simultaneously.

## Type Safety Rules

**CRITICAL**: All features must use types from `packages/types/src/`

```typescript
// Always import from @matchback/types
import type { Campaign, MatchRecord } from '@matchback/types';

// Never redefine these types in your feature
// Never use 'any' type
// Always specify exact return types
```

## Summary Requirements

Every task completion must include:

1. **Files Created** - List with line counts
2. **Type Safety** - Confirm types used from @matchback/types
3. **Tests** - Coverage percentage
4. **Features Unlocked** - What can now be started
5. **Known Issues** - Any todos or problems

## Getting Help

- See `CLAUDE.md` for architecture and patterns
- See `docs/FEATURE-BRANCHES.md` for dependencies
- Check `packages/types/src/` for type definitions
- Review `context/` for business requirements
