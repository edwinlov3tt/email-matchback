# Task: Report Generation

**Branch**: `feature/report-generation`
**Dependencies**: pattern-analysis
**Priority**: MEDIUM

## Overview
Generate pivot tables, CAC, ROAS calculations, Excel exports.

## Files
1. `apps/api/src/reports/reports.service.ts`
2. `apps/api/src/reports/pivot-table.service.ts`
3. `apps/api/src/reports/cac-calculator.service.ts`
4. `apps/api/src/reports/reports.module.ts`

## Key Features
- Pivot Table 1: All Matched Sales (Match & Pattern rows)
- Pivot Table 2: New Customers (Match & SignupDate rows)
- Pivot Table 3: Missing Email Stats
- CAC and ROAS calculations
- Excel export with formatting
