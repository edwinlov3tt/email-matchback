# Task: Authentication

**Branch**: `feature/authentication`
**Dependencies**: database-schema
**Priority**: MEDIUM

## Overview
NextAuth.js with email magic links via Resend.

## Files
1. `apps/web/app/api/auth/[...nextauth]/route.ts`
2. `apps/web/lib/auth.ts`
3. `apps/web/components/AuthProvider.tsx`
4. `apps/web/middleware.ts`
5. `apps/api/src/auth/auth.guard.ts`
6. `apps/api/src/auth/auth.module.ts`

## Key Features
- Magic link emails via Resend
- Session management
- Protected routes
- JWT validation
- User roles (admin, client_viewer)
