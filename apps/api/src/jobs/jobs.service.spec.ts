import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let fileProcessingQueue: any;
  let patternAnalysisQueue: any;
  let reportGenerationQueue: any;

  beforeEach(async () => {
    // Mock queues
    const mockQueue = {
      add: jest.fn().mockResolvedValue({ id: '123' }),
      getJob: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getQueueToken('file-processing'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('pattern-analysis'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('report-generation'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    fileProcessingQueue = module.get(getQueueToken('file-processing'));
    patternAnalysisQueue = module.get(getQueueToken('pattern-analysis'));
    reportGenerationQueue = module.get(getQueueToken('report-generation'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFileProcessingJob', () => {
    it('should add job to file processing queue', async () => {
      const jobData = {
        fileBuffer: Buffer.from('test'),
        fileType: 'excel' as const,
        campaignId: 'test-campaign',
        uploadType: 'client-data' as const,
      };

      const jobId = await service.addFileProcessingJob(jobData);

      expect(jobId).toBe('123');
      expect(fileProcessingQueue.add).toHaveBeenCalledWith(
        jobData,
        expect.objectContaining({
          attempts: 3,
          removeOnComplete: false,
          removeOnFail: false,
        }),
      );
    });
  });

  describe('addPatternAnalysisJob', () => {
    it('should add job to pattern analysis queue', async () => {
      const jobData = {
        records: [],
        campaignId: 'test-campaign',
        campaignDate: new Date(),
      };

      const jobId = await service.addPatternAnalysisJob(jobData);

      expect(jobId).toBe('123');
      expect(patternAnalysisQueue.add).toHaveBeenCalledWith(
        jobData,
        expect.objectContaining({
          attempts: 3,
        }),
      );
    });
  });

  describe('addReportGenerationJob', () => {
    it('should add job to report generation queue', async () => {
      const jobData = {
        records: [],
        campaignName: 'test-campaign',
        campaignDate: new Date(),
        market: 'HOU',
        campaignCost: 1000,
      };

      const jobId = await service.addReportGenerationJob(jobData);

      expect(jobId).toBe('123');
      expect(reportGenerationQueue.add).toHaveBeenCalledWith(
        jobData,
        expect.objectContaining({
          attempts: 2,
        }),
      );
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const stats = await service.getQueueStats('file-processing');

      expect(stats).toEqual({
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0,
      });
    });
  });

  describe('getJobStatus', () => {
    it('should return null for non-existent job', async () => {
      fileProcessingQueue.getJob.mockResolvedValue(null);

      const status = await service.getJobStatus('999', 'file-processing');

      expect(status).toBeNull();
    });

    it('should return job status for existing job', async () => {
      const mockJob = {
        id: '123',
        data: { campaignId: 'test' },
        getState: jest.fn().mockResolvedValue('active'),
        progress: jest.fn().mockResolvedValue(50),
        timestamp: Date.now(),
        returnvalue: null,
        failedReason: null,
        finishedOn: null,
      };

      fileProcessingQueue.getJob.mockResolvedValue(mockJob);

      const status = await service.getJobStatus('123', 'file-processing');

      expect(status).toBeDefined();
      expect(status?.status).toBe('active');
      expect(status?.progress).toBe(50);
    });
  });
});
