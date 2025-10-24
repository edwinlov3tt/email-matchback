# Task: Dashboard Pages

**Branch**: `feature/dashboard-pages`
**Dependencies**: glassmorphic-ui, campaign-management
**Priority**: MEDIUM

## Overview
All frontend pages using glassmorphic components.

## Files
1. `apps/web/app/page.tsx` - Dashboard
2. `apps/web/app/campaigns/page.tsx` - Campaign list
3. `apps/web/app/campaigns/new/page.tsx` - Create campaign
4. `apps/web/app/campaigns/[id]/page.tsx` - Campaign details
5. `apps/web/app/upload/[token]/page.tsx` - Client upload
6. `apps/web/components/dashboard/StatCard.tsx`
7. `apps/web/components/campaigns/CampaignTable.tsx`
8. `apps/web/components/campaigns/CampaignForm.tsx`

## Key Features
- Use GlassCard, GlassButton, GlassInput from ui components
- Dashboard with stats
- Campaign CRUD forms
- File upload with drag-and-drop
- Real-time status updates
