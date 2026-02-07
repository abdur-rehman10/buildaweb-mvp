import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PublishDocument = HydratedDocument<Publish>;

@Schema({ timestamps: true })
export class Publish {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  ownerUserId!: string;

  @Prop({ required: true, enum: ['publishing', 'live', 'failed'], default: 'publishing' })
  status!: 'publishing' | 'live' | 'failed';

  @Prop({ required: true })
  baseUrl!: string;

  @Prop({ default: null })
  errorMessage?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublishSchema = SchemaFactory.createForClass(Publish);

PublishSchema.index({ tenantId: 1, projectId: 1, ownerUserId: 1, createdAt: -1 });
