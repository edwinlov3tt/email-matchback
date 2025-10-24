import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FileProcessingModule } from '../file-processing/file-processing.module';
import { PatternsModule } from '../patterns/patterns.module';
import { ReportsModule } from '../reports/reports.module';
import { FileProcessingProcessor } from './processors/file-processing.processor';
import { PatternAnalysisProcessor } from './processors/pattern-analysis.processor';
import { ReportGenerationProcessor } from './processors/report-generation.processor';
import { JobsService } from './jobs.service';

/**
 * Jobs Module
 *
 * Provides asynchronous job processing with Bull Queue:
 * - File processing (Excel/CSV parsing)
 * - Pattern analysis (customer classification)
 * - Report generation (CAC/ROAS, pivot tables, Excel export)
 *
 * CRITICAL: Never block HTTP requests - always use job queues for:
 * - Large file uploads
 * - Complex calculations
 * - Report generation
 * - Batch operations
 *
 * Queue Names:
 * - 'file-processing': Process uploaded Excel/CSV files
 * - 'pattern-analysis': Analyze customer patterns
 * - 'report-generation': Generate campaign reports
 */
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'file-processing' },
      { name: 'pattern-analysis' },
      { name: 'report-generation' },
    ),
    FileProcessingModule,
    PatternsModule,
    ReportsModule,
  ],
  providers: [
    FileProcessingProcessor,
    PatternAnalysisProcessor,
    ReportGenerationProcessor,
    JobsService,
  ],
  exports: [JobsService, BullModule],
})
export class JobsModule {}
