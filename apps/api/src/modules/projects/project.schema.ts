import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
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

  @Prop({ type: Types.ObjectId, ref: 'Page', default: null })
  homePageId?: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  latestPublishId?: string | null;

  @Prop({ type: Boolean, default: false })
  isPublished!: boolean;

  @Prop({ type: String, default: null, trim: true })
  publishedSlug?: string | null;

  @Prop({ type: String, default: null, trim: true })
  publishedBucketKey?: string | null;

  @Prop({ type: Number, default: 0 })
  publishedVersion!: number;

  @Prop({ type: Date, default: null })
  publishedAt?: Date | null;

  @Prop({ type: String, default: null, trim: true })
  siteName?: string | null;

  @Prop({ type: String, default: null, trim: true })
  logoAssetId?: string | null;

  @Prop({ type: String, default: null, trim: true })
  faviconAssetId?: string | null;

  @Prop({ type: String, default: null, trim: true })
  defaultOgImageAssetId?: string | null;

  @Prop({ type: String, required: true, default: 'en', trim: true })
  locale!: string;

  // from @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// indexes
ProjectSchema.index({ tenantId: 1, ownerUserId: 1 });
ProjectSchema.index({ tenantId: 1, status: 1 });
ProjectSchema.index({ tenantId: 1, publishedSlug: 1 }, { unique: true, sparse: true });
