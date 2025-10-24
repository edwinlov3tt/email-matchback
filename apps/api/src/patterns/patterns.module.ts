import { Module } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { CustomerClassificationService } from './customer-classification.service';
import { PatternCorrectionService } from './pattern-correction.service';

/**
 * Patterns Module
 *
 * Provides pattern detection, customer classification, and critical pattern correction services.
 *
 * Services:
 * - PatternAnalysisService: Base pattern detection (3+ visits = in pattern)
 * - CustomerClassificationService: Customer type classification (NEW_SIGNUP, etc.)
 * - PatternCorrectionService: CRITICAL pattern flaw correction for new signups
 *
 * Usage:
 * 1. Analyze patterns with PatternAnalysisService
 * 2. Apply corrections with PatternCorrectionService (MUST run after step 1)
 * 3. Classify customers with CustomerClassificationService
 */
@Module({
  providers: [
    PatternAnalysisService,
    CustomerClassificationService,
    PatternCorrectionService,
  ],
  exports: [
    PatternAnalysisService,
    CustomerClassificationService,
    PatternCorrectionService,
  ],
})
export class PatternsModule {}
