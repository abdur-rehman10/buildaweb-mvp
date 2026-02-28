import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GenerationJob, GenerationJobDocument } from './generation-job.schema';

@Injectable()
export class GenerationService {
  constructor(
    @InjectModel(GenerationJob.name)
    private readonly generationJobModel: Model<GenerationJobDocument>,
  ) {}

  private normalizePrompt(prompt: string) {
    return prompt.trim();
  }

  private truncateErrorMessage(errorMessage: string | null | undefined) {
    if (!errorMessage) return null;
    const trimmed = errorMessage.trim();
    if (!trimmed) return null;
    return trimmed.slice(0, 500);
  }

  async createQueued(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    prompt: string;
  }) {
    return this.generationJobModel.create({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      projectId: new Types.ObjectId(params.projectId),
      prompt: this.normalizePrompt(params.prompt),
      status: 'queued',
    });
  }

  async markRunning(jobId: string) {
    await this.generationJobModel
      .updateOne(
        { _id: new Types.ObjectId(jobId) },
        {
          $set: {
            status: 'running',
            startedAt: new Date(),
            finishedAt: null,
            errorCode: null,
            errorMessage: null,
          },
        },
      )
      .exec();
  }

  async markSucceeded(params: {
    jobId: string;
    pageCount: number;
    homePageId: string;
  }) {
    await this.generationJobModel
      .updateOne(
        { _id: new Types.ObjectId(params.jobId) },
        {
          $set: {
            status: 'succeeded',
            finishedAt: new Date(),
            errorCode: null,
            errorMessage: null,
            meta: {
              pageCount: params.pageCount,
              homePageId: params.homePageId,
            },
          },
        },
      )
      .exec();
  }

  async markFailed(params: {
    jobId: string;
    errorCode?: string | null;
    errorMessage?: string | null;
  }) {
    await this.generationJobModel
      .updateOne(
        { _id: new Types.ObjectId(params.jobId) },
        {
          $set: {
            status: 'failed',
            finishedAt: new Date(),
            errorCode: params.errorCode?.trim() || null,
            errorMessage: this.truncateErrorMessage(params.errorMessage),
          },
        },
      )
      .exec();
  }

  async getLatestForProject(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
  }) {
    return this.generationJobModel
      .findOne({
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
        projectId: new Types.ObjectId(params.projectId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getByIdScoped(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    jobId: string;
  }) {
    return this.generationJobModel
      .findOne({
        _id: new Types.ObjectId(params.jobId),
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
        projectId: new Types.ObjectId(params.projectId),
      })
      .exec();
  }
}
