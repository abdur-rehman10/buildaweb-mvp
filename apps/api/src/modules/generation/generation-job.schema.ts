import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type GenerationJobDocument = HydratedDocument<GenerationJob>;

export type GenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

@Schema({ timestamps: true })
export class GenerationJob {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ required: true })
  ownerUserId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  prompt!: string;

  @Prop({
    required: true,
    enum: ['queued', 'running', 'succeeded', 'failed'],
    default: 'queued',
  })
  status!: GenerationJobStatus;

  @Prop({ type: Date, default: null })
  startedAt?: Date | null;

  @Prop({ type: Date, default: null })
  finishedAt?: Date | null;

  @Prop({ type: String, default: null })
  errorCode?: string | null;

  @Prop({ type: String, default: null })
  errorMessage?: string | null;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  meta?: Record<string, unknown> | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const GenerationJobSchema = SchemaFactory.createForClass(GenerationJob);

GenerationJobSchema.index({
  tenantId: 1,
  ownerUserId: 1,
  projectId: 1,
  createdAt: -1,
});
