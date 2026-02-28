import { Model } from 'mongoose';
import { GenerationJobDocument } from './generation-job.schema';
import { GenerationService } from './generation.service';

type MockGenerationJobModel = {
  create: jest.Mock;
  updateOne: jest.Mock;
  findOne: jest.Mock;
};

describe('GenerationService', () => {
  let service: GenerationService;
  let generationJobModel: MockGenerationJobModel;

  beforeEach(() => {
    generationJobModel = {
      create: jest.fn(),
      updateOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
      findOne: jest.fn(),
    };

    service = new GenerationService(
      generationJobModel as unknown as Model<GenerationJobDocument>,
    );
  });

  it('transitions queued -> running -> succeeded', async () => {
    generationJobModel.create.mockResolvedValue({ _id: 'job-1' });

    const job = await service.createQueued({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: '507f1f77bcf86cd799439100',
      prompt: '  Generate site  ',
    });

    await service.markRunning('507f1f77bcf86cd799439200');
    await service.markSucceeded({
      jobId: '507f1f77bcf86cd799439201',
      pageCount: 3,
      homePageId: 'page-1',
    });

    expect(job).toEqual({ _id: 'job-1' });
    expect(generationJobModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'default',
        ownerUserId: 'user-1',
        prompt: 'Generate site',
        status: 'queued',
      }),
    );
    expect(generationJobModel.updateOne).toHaveBeenCalledTimes(2);
  });

  it('marks failed with truncated error message', async () => {
    const longMessage = 'x'.repeat(700);

    await service.markFailed({
      jobId: '507f1f77bcf86cd799439202',
      errorCode: 'AI_GENERATION_FAILED',
      errorMessage: longMessage,
    });
    expect(generationJobModel.updateOne).toHaveBeenCalledTimes(1);
  });
});
