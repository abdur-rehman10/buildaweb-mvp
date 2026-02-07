import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ required: true })
  ownerUserId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';

  @Prop({ required: true, default: 'en', trim: true })
  defaultLocale!: string;

  // from @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// indexes
ProjectSchema.index({ tenantId: 1, ownerUserId: 1 });
ProjectSchema.index({ tenantId: 1, status: 1 });
