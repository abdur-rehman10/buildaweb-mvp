import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findByEmail(tenantId: string, email: string) {
    return this.userModel.findOne({ tenantId, email: email.toLowerCase() }).exec();
  }

  async create(params: { tenantId: string; email: string; passwordHash: string; name?: string | null }) {
    return this.userModel.create({
      tenantId: params.tenantId,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      name: params.name ?? null,
      status: 'active',
    });
  }

  async safeById(id: string) {
    return this.userModel.findById(id).select('_id email name tenantId status createdAt updatedAt').exec();
  }
}
