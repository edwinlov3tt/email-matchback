import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';
import {
  FileProcessingJobData,
  FileProcessingResult,
} from './processors/file-processing.processor';
import {
  PatternAnalysisJobData,
  PatternAnalysisResult,
} from './processors/pattern-analysis.processor';
import {
  ReportGenerationJobData,
  ReportGenerationResult,
} from './processors/report-generation.processor';

export interface JobStatus {
  id: string;
  type: 'file-processing' | 'pattern-analysis' | 'report-generation';
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  data?: any;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Jobs Service
 *
 * Provides methods to:
 * - Add jobs to queues
 * - Track job status and progress
 * - Retrieve job results
 * - Cancel jobs
 *
 * Usage:
 * - File upload → Add file processing job
 * - File processed → Add pattern analysis job
 * - Pattern analyzed → Add report generation job
 * - Poll job status for real-time updates
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('file-processing')
    private readonly fileProcessingQueue: Queue<FileProcessingJobData>,
    @InjectQueue('pattern-analysis')
    private readonly patternAnalysisQueue: Queue<PatternAnalysisJobData>,
    @InjectQueue('report-generation')
    private readonly reportGenerationQueue: Queue<ReportGenerationJobData>,
  ) {}

  /**
   * Add file processing job
   */
  async addFileProcessingJob(
    data: FileProcessingJobData,
  ): Promise<string> {
    this.logger.log(
      `Adding file processing job for campaign ${data.campaignId}`,
    );

    const job = await this.fileProcessingQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false, // Keep for status tracking
      removeOnFail: false,
    });

    return job.id.toString();
  }

  /**
   * Add pattern analysis job
   */
  async addPatternAnalysisJob(
    data: PatternAnalysisJobData,
  ): Promise<string> {
    this.logger.log(
      `Adding pattern analysis job for campaign ${data.campaignId}`,
    );

    const job = await this.patternAnalysisQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });

    return job.id.toString();
  }

  /**
   * Add report generation job
   */
  async addReportGenerationJob(
    data: ReportGenerationJobData,
  ): Promise<string> {
    this.logger.log(
      `Adding report generation job for campaign ${data.campaignName}`,
    );

    const job = await this.reportGenerationQueue.add(data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });

    return job.id.toString();
  }

  /**
   * Get job status
   */
  async getJobStatus(
    jobId: string,
    queueType: 'file-processing' | 'pattern-analysis' | 'report-generation',
  ): Promise<JobStatus | null> {
    let queue: Queue;
    switch (queueType) {
      case 'file-processing':
        queue = this.fileProcessingQueue;
        break;
      case 'pattern-analysis':
        queue = this.patternAnalysisQueue;
        break;
      case 'report-generation':
        queue = this.reportGenerationQueue;
        break;
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
      id: job.id.toString(),
      type: queueType,
      status: this.mapJobState(state),
      progress: typeof progress === 'number' ? progress : 0,
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
    };
  }

  /**
   * Wait for job completion
   */
  async waitForJob<T = any>(
    jobId: string,
    queueType: 'file-processing' | 'pattern-analysis' | 'report-generation',
    timeout = 300000, // 5 minutes default
  ): Promise<T> {
    let queue: Queue;
    switch (queueType) {
      case 'file-processing':
        queue = this.fileProcessingQueue;
        break;
      case 'pattern-analysis':
        queue = this.patternAnalysisQueue;
        break;
      case 'report-generation':
        queue = this.reportGenerationQueue;
        break;
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return await job.finished();
  }

  /**
   * Cancel job
   */
  async cancelJob(
    jobId: string,
    queueType: 'file-processing' | 'pattern-analysis' | 'report-generation',
  ): Promise<void> {
    let queue: Queue;
    switch (queueType) {
      case 'file-processing':
        queue = this.fileProcessingQueue;
        break;
      case 'pattern-analysis':
        queue = this.patternAnalysisQueue;
        break;
      case 'report-generation':
        queue = this.reportGenerationQueue;
        break;
    }

    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Job ${jobId} cancelled`);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(
    queueType: 'file-processing' | 'pattern-analysis' | 'report-generation',
  ) {
    let queue: Queue;
    switch (queueType) {
      case 'file-processing':
        queue = this.fileProcessingQueue;
        break;
      case 'pattern-analysis':
        queue = this.patternAnalysisQueue;
        break;
      case 'report-generation':
        queue = this.reportGenerationQueue;
        break;
    }

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  /**
   * Map Bull job state to our status
   */
  private mapJobState(
    state: string,
  ): 'waiting' | 'active' | 'completed' | 'failed' {
    switch (state) {
      case 'waiting':
      case 'delayed':
        return 'waiting';
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'waiting';
    }
  }
}
