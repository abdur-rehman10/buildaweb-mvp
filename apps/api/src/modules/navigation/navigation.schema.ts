import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type NavigationDocument = HydratedDocument<Navigation>;

@Schema({ timestamps: true })
export class Navigation {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  ownerUserId!: string;

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  itemsJson!: Array<{ label: string; pageId: string }>;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  ctaJson?: { label: string; href: string } | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NavigationSchema = SchemaFactory.createForClass(Navigation);

NavigationSchema.index({ tenantId: 1, projectId: 1 }, { unique: true });
NavigationSchema.index({ tenantId: 1, ownerUserId: 1 });
