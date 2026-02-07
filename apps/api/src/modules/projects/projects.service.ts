import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  async create(params: { tenantId: string; ownerUserId: string; name: string; defaultLocale: string }) {
    return this.projectModel.create({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      name: params.name,
      defaultLocale: params.defaultLocale,
      status: 'draft',
    });
  }

  async listByOwner(params: { tenantId: string; ownerUserId: string }) {
    return this.projectModel.find({ tenantId: params.tenantId, ownerUserId: params.ownerUserId }).exec();
  }

  async getByIdScoped(params: { tenantId: string; ownerUserId: string; projectId: string }) {
    return this.projectModel
      .findOne({ _id: params.projectId, tenantId: params.tenantId, ownerUserId: params.ownerUserId })
      .exec();
  }
}
