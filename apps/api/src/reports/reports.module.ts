import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CacCalculatorService } from './cac-calculator.service';
import { PivotTableService } from './pivot-table.service';

/**
 * Reports Module
 *
 * Provides services for campaign reporting:
 * - CAC (Customer Acquisition Cost) and ROAS calculations
 * - Pivot table generation (Matched Sales, New Customers, Missing Emails)
 * - Excel export with formatted reports
 *
 * This module generates client-facing reports showing:
 * - Total matches and match rates
 * - Revenue attribution (out-of-pattern vs in-pattern)
 * - New customer acquisition metrics
 * - Campaign ROI and performance comparison
 */
@Module({
  providers: [ReportsService, CacCalculatorService, PivotTableService],
  exports: [ReportsService, CacCalculatorService, PivotTableService],
})
export class ReportsModule {}
