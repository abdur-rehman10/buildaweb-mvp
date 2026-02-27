import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { PublishDraftSnapshot } from './publish-snapshot.util';

export type PublishDocument = HydratedDocument<Publish>;

@Schema({ timestamps: true })
export class Publish {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  ownerUserId!: string;

  @Prop({
    required: true,
    enum: ['pending', 'building', 'uploading', 'live', 'failed'],
    default: 'pending',
  })
  status!: 'pending' | 'building' | 'uploading' | 'live' | 'failed';

  @Prop({ required: true })
  baseUrl!: string;

  @Prop({ type: String, default: null })
  errorMessage?: string | null;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  draftSnapshot?: PublishDraftSnapshot | null;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  manifest?: Record<string, unknown> | null;

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  stateEvents!: Array<Record<string, unknown>>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublishSchema = SchemaFactory.createForClass(Publish);

PublishSchema.index({
  tenantId: 1,
  projectId: 1,
  ownerUserId: 1,
  createdAt: -1,
});
