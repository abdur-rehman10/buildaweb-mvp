import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ default: false })
  isHome!: boolean;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  editorJson!: Record<string, unknown>;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  seoJson!: Record<string, unknown>;

  @Prop({ default: 1 })
  version!: number;

  // from @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// indexes
PageSchema.index({ projectId: 1, slug: 1 }, { unique: true });
PageSchema.index({ tenantId: 1, projectId: 1 });
